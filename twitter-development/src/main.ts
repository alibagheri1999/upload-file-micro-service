import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { AppClusterService } from './app_cluster.service';

import { AppModule } from './app.module';

async function bootstrap() {
  //* Logger new instance
  const logger: Logger = new Logger(bootstrap.name, { timestamp: true });

  //* Application
  const server = express();

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Cookie & Session Middleware
  app.use(cookieParser());
  // app.enableCors();
  app.use(
    session({
      secret: 'my-secret',
      resave: true,
      saveUninitialized: true,
    }),
  );

  //? Set Global Validation Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  //* End Middlewares

  //* Set Swagger
  const options = new DocumentBuilder()
    .setTitle('NestJS Mediasoup Example')
    .setDescription('The NestJS Mediasoup Example description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  //* Favorite PORT
  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  logger.log(`Server is running on PORT: ${PORT}`);
}
AppClusterService.clusterize(bootstrap);