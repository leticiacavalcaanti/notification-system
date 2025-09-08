import { Injectable, Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

type StatusPayload = { mensagemId: string; status: string };

/**
 * Gateway WebSocket responsável por emitir atualizações
 * de status para o frontend em tempo real.
 */
@WebSocketGateway({
  cors: { origin: true }, // libera CORS para conexões WS
})
@Injectable()
export class NotificationGateway {
  private readonly logger = new Logger(NotificationGateway.name);

  @WebSocketServer()
  server!: Server;

  /**
   * Envia evento `notificacao_status` para todos os clientes conectados
   */
  emitStatus(update: StatusPayload) {
    this.server.emit('notificacao_status', update);
    this.logger.debug(`WS emit: ${JSON.stringify(update)}`);
  }
}
