import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { NotificarDto } from './dto/notification.dto';
import { RabbitmqService } from './rabbitmq.service';
import { StatusService } from './status.service';

/**
 * Controller responsável por expor os endpoints REST da aplicação.
 * - POST /api/notificar → envia mensagem para fila de entrada
 * - GET /api/notificacao/status/:id → consulta status em memória
 * - GET /api/health → healthcheck simples
 */
@Controller('api')
export class NotificationController {
  constructor(
    private readonly mq: RabbitmqService,
    private readonly status: StatusService,
  ) {}

  @Post('notificar')
  @HttpCode(202)
  notificar(@Body() dto: NotificarDto) {
    // Define status inicial como "aguardando"
    this.status.set(dto.mensagemId, 'AGUARDANDO_PROCESSAMENTO');

    // Publica na fila de ENTRADA
    this.mq.publishEntrada({
      mensagemId: dto.mensagemId,
      conteudoMensagem: dto.conteudoMensagem,
    });

    // Retorna confirmação imediata (202 Accepted)
    return { accepted: true, mensagemId: dto.mensagemId };
  }

  @Get('notificacao/status/:id')
  getStatus(@Param('id') id: string) {
    return { mensagemId: id, status: this.status.get(id) };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
