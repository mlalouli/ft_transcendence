import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';
import { ValidationPipe } from '@nestjs/common';
import { JwtGuard } from './auth/guards/jwt.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Transcendence API')
    .setDescription('API for a PingPong Game')
    .setVersion('0.0.1')
    .addTag('transcendence')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: process.env.FRONTEND_URL
  });

  app.get(PrismaService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true
    })
  );

  const reflector = new Reflector();
  app.useGlobalGuards(new JwtGuard(reflector));

  app.setGlobalPrefix('api');
  await app.listen(process.env.BACKEND_PORT);
}
bootstrap();
