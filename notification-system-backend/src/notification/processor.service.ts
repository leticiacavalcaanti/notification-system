import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { StatusService } from './status.service';
import { NotificationGateway } from './notification.gateway';

/**
 * Serviço responsável por consumir mensagens da fila de ENTRADA,
 * simular o processamento e publicar o resultado (sucesso/falha).
 * Também emite atualizações em tempo real via WebSocket.
 */
@Injectable()
export class ProcessorService implements OnModuleInit {
  private readonly logger = new Logger(ProcessorService.name);

  constructor(
    private readonly mq: RabbitmqService,
    private readonly status: StatusService,
    private readonly gateway: NotificationGateway, // para emitir notificações via WS
  ) {}

  async onModuleInit(): Promise<void> {
    // Inicia consumo da fila assim que o módulo é carregado
    await this.mq.consumeEntrada(async (payload) => {
      // Simula tempo de processamento (1–2s aleatórios)
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000));

      // Sorteia o resultado do processamento (20% falha, 80% sucesso)
      const sorte = Math.floor(Math.random() * 10) + 1;
      const result = sorte <= 2 ? 'FALHA_PROCESSAMENTO' : 'PROCESSADO_SUCESSO';

      // Atualiza o status em memória
      this.status.set(payload.mensagemId, result);

      // Publica resultado na fila de STATUS
      this.mq.publishStatus({ mensagemId: payload.mensagemId, status: result });

      // Emite atualização via WebSocket (opcional)
      this.gateway?.emitStatus({
        mensagemId: payload.mensagemId,
        status: result,
      });

      this.logger.log(`Processado ${payload.mensagemId}: ${result}`);
    });
  }
}
