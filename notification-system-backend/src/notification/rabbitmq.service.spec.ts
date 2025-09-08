// src/notification/rabbitmq.service.spec.ts
import { Test } from '@nestjs/testing';
import * as amqp from 'amqplib';
import { RabbitmqService } from './rabbitmq.service';

describe('RabbitmqService (publicação sem amqplib real)', () => {
  let service: RabbitmqService;

  // “Canal fake” com apenas o que usamos nos métodos de publicação
  type ChannelLike = {
    sendToQueue: (
      queue: string,
      content: Buffer,
      options?: amqp.Options.Publish,
    ) => boolean;
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [RabbitmqService],
    }).compile();

    service = moduleRef.get(RabbitmqService);

    // Configura manualmente as filas esperadas
    (service as unknown as { entradaQueue: string }).entradaQueue =
      'fila.notificacao.entrada.leticia';
    (service as unknown as { statusQueue: string }).statusQueue =
      'fila.notificacao.status.leticia';

    // Injeta um “canal” fake (somente sendToQueue)
    const chFake: ChannelLike = {
      sendToQueue: jest.fn().mockReturnValue(true),
    };

    // Seta o canal privado do service
    (service as unknown as { ch: ChannelLike }).ch = chFake;
  });

  function getFakeChannel(): jest.Mocked<ChannelLike> {
    return (service as unknown as { ch: jest.Mocked<ChannelLike> }).ch;
  }

  it('publishEntrada deve chamar sendToQueue com fila e payload corretos', () => {
    const payload = { mensagemId: '123', conteudoMensagem: 'Olá mundo' };

    const ok = service.publishEntrada(payload);
    expect(ok).toBe(true);

    const ch = getFakeChannel();
    expect(ch.sendToQueue).toHaveBeenCalledTimes(1);

    // Tipamos o mock como MockedFunction e obtemos os parâmetros via Parameters<...>
    const mockedSend = ch.sendToQueue as jest.MockedFunction<
      ChannelLike['sendToQueue']
    >;
    const args = mockedSend.mock.calls[0];

    const queue: string = args[0];
    const content: Buffer = args[1];

    expect(queue).toBe('fila.notificacao.entrada.leticia');
    expect(Buffer.isBuffer(content)).toBe(true);
    expect(JSON.parse(content.toString('utf8'))).toEqual(payload);
  });

  it('publishStatus deve chamar sendToQueue com fila e payload corretos', () => {
    const payload = {
      mensagemId: 'abc',
      status: 'PROCESSADO_SUCESSO' as const,
    };

    const ok = service.publishStatus(payload);
    expect(ok).toBe(true);

    const ch = getFakeChannel();
    expect(ch.sendToQueue).toHaveBeenCalledTimes(1);

    const mockedSend = ch.sendToQueue as jest.MockedFunction<
      ChannelLike['sendToQueue']
    >;
    const args = mockedSend.mock.calls[0];

    const queue: string = args[0];
    const content: Buffer = args[1];

    expect(queue).toBe('fila.notificacao.status.leticia');
    expect(Buffer.isBuffer(content)).toBe(true);
    expect(JSON.parse(content.toString('utf8'))).toEqual(payload);
  });
});
