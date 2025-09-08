import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';

/**
 * Módulo raiz da aplicação.
 * Carrega variáveis de ambiente e módulo de notificações.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // carrega .env globalmente
    NotificationModule,
  ],
})
export class AppModule {}
