import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  // Configure CORS
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = [
    frontendUrl,
    process.env.BACKEND_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ].filter((url): url is string => !!url);

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });

  // Serve static files (uploaded images) - BEFORE helmet
  // Utiliser un chemin absolu basé sur le répertoire de travail pour être compatible en production
  const uploadsPath = join(process.cwd(), 'public', 'uploads');
  console.log(`📁 Serving static files from: ${uploadsPath}`);

  // Créer le dossier s'il n'existe pas
  const fs = require('fs');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
    console.log(`✅ Created uploads directory: ${uploadsPath}`);
  }

  // Middleware CORS pour les fichiers statiques
  app.use(
    '/uploads',
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      next();
    },
  );

  app.use('/uploads', express.static(uploadsPath));

  // Security - Configure helmet to work with CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AliceBot API')
    .setDescription('API pour la gestion des dépôts/retraits bookmaker')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
