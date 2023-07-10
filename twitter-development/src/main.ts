import {NestFactory} from '@nestjs/core';
import {Logger, ValidationPipe} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule,} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import {ExpressAdapter} from '@nestjs/platform-express';
import * as express from 'express';
import {AppClusterService} from './app_cluster.service';

import {AppModule} from './app.module';
import {CustomExceptionFilter} from "./common/errors/global.error";

async function bootstrap() {
    const logger: Logger = new Logger(bootstrap.name, {timestamp: true});

    const server = express();

    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    app.use(cookieParser());
    app.use(
        session({
            secret: 'my-secret',
            resave: true,
            saveUninitialized: true,
        }),
    );

    app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true}));
    app.useGlobalFilters(new CustomExceptionFilter())
    const options = new DocumentBuilder()
        .setTitle('NestJS Mediasoup Example')
        .setDescription('The NestJS Mediasoup Example description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('swagger', app, document);

    const PORT = process.env.PORT || 3000;
    await app.listen(PORT);
    logger.log(`Server is running on PORT: ${PORT}`);
}

AppClusterService.clusterize(bootstrap);