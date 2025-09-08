import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { RabbitmqService } from './rabbitmq.service';
import { StatusService } from './status.service';
import { ProcessorService } from './processor.service';
import { NotificationGateway } from './notification.gateway';

/**
 * Módulo principal de notificações.
 * Reúne controller, services e gateway relacionados.
 */
@Module({
  controllers: [NotificationController],
  providers: [
    RabbitmqService,
    StatusService,
    ProcessorService,
    NotificationGateway,
  ],
})
export class NotificationModule {}
