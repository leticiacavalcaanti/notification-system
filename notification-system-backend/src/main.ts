import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

/**
 * Bootstrap da aplicação NestJS
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos não declarados
      forbidNonWhitelisted: true, // rejeita requests com campos extras
      transform: true, // transforma tipos automaticamente
    }),
  );

  // Libera CORS
  app.enableCors({ origin: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
