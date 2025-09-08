import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import type { ConsumeMessage } from 'amqplib';

type EntradaPayload = { mensagemId: string; conteudoMensagem: string };
type StatusPayload = {
  mensagemId: string;
  status: 'PROCESSADO_SUCESSO' | 'FALHA_PROCESSAMENTO';
};

const ENC: BufferEncoding = 'utf8';

/**
 * Serviço responsável pela comunicação com o RabbitMQ.
 * Cria filas, publica e consome mensagens.
 */
@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);

  private conn!: amqp.Connection;
  private ch!: amqp.Channel;

  public entradaQueue!: string;
  public statusQueue!: string;

  // Promise usada para sinalizar quando o canal estiver pronto
  private ready!: Promise<void>;
  private resolveReady!: () => void;

  constructor() {
    this.ready = new Promise<void>((res) => (this.resolveReady = res));
  }

  async onModuleInit(): Promise<void> {
    const url = String(process.env.AMQP_URL);
    const nome = (process.env.SEU_NOME ?? 'teste').toLowerCase();

    this.entradaQueue = `fila.notificacao.entrada.${nome}`;
    this.statusQueue = `fila.notificacao.status.${nome}`;

    // Conexão com RabbitMQ
    this.conn = await amqp.connect(url);
    this.ch = await this.conn.createChannel();

    // Criação das filas
    await this.ch.assertQueue(this.entradaQueue, { durable: true });
    await this.ch.assertQueue(this.statusQueue, { durable: true });

    // Garante processamento de 1 mensagem por vez
    await this.ch.prefetch(1);

    this.logger.log(
      `RabbitMQ conectado | Filas: ${this.entradaQueue} / ${this.statusQueue}`,
    );

    // Libera serviços dependentes
    this.resolveReady();
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.ch) await this.ch.close();
    } catch {
      this.logger.warn('Erro fechando canal');
    }
    try {
      if (this.conn) await this.conn.close();
    } catch {
      this.logger.warn('Erro fechando conexão');
    }
  }

  /** Publica mensagem na fila de ENTRADA */
  publishEntrada(payload: EntradaPayload): boolean {
    const buf = Buffer.from(JSON.stringify(payload), ENC);
    return this.ch.sendToQueue(this.entradaQueue, buf, {
      contentType: 'application/json',
      persistent: true,
    });
  }

  /** Publica status atualizado na fila de STATUS */
  publishStatus(payload: StatusPayload): boolean {
    const buf = Buffer.from(JSON.stringify(payload), ENC);
    return this.ch.sendToQueue(this.statusQueue, buf, {
      contentType: 'application/json',
      persistent: true,
    });
  }

  /** Aguarda conexão pronta */
  async waitReady() {
    await this.ready;
  }

  /** Consome mensagens da fila de ENTRADA */
  async consumeEntrada(
    onMessage: (payload: EntradaPayload, raw: ConsumeMessage) => Promise<void>,
  ): Promise<void> {
    await this.ready;

    await this.ch.consume(String(this.entradaQueue), async (msg: unknown) => {
      if (
        msg == null ||
        typeof msg !== 'object' ||
        !Buffer.isBuffer((msg as { content?: unknown }).content)
      ) {
        this.logger.warn('Mensagem vazia/shape inválido; descartando');
        return;
      }

      const m = msg as ConsumeMessage;
      const raw: string = (m.content as Buffer).toString(ENC);

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        this.logger.error(`JSON inválido: ${raw} | ${errMsg}`);
        this.ch.nack(m, false, false);
        return;
      }

      const isEntrada = (p: unknown): p is EntradaPayload =>
        typeof p === 'object' &&
        p !== null &&
        typeof (p as any).mensagemId === 'string' &&
        typeof (p as any).conteudoMensagem === 'string';

      if (!isEntrada(parsed)) {
        this.logger.warn(`Shape inválido: ${raw}`);
        this.ch.nack(m, false, false);
        return;
      }

      try {
        await onMessage(parsed, m);
        this.ch.ack(m);
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        this.logger.error(`Erro no handler: ${errMsg}`);
        this.ch.nack(m, false, false);
      }
    });
  }

  /** Acks/Nacks manuais */
  ack(msg: ConsumeMessage) {
    this.ch.ack(msg);
  }
  nack(msg: ConsumeMessage) {
    this.ch.nack(msg, false, false);
  }
}
