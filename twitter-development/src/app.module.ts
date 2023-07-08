import {Module} from '@nestjs/common';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {APP_GUARD} from '@nestjs/core';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UserModule} from './user/user.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import * as AWS from 'aws-sdk';
// @ts-ignore
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            expandVariables: true,
        }),
        ThrottlerModule.forRoot({
            ttl: 3600 * 12,
            limit: 10000,
        }),

        UserModule,
    ],
    controllers: [AppController],
    providers: [
        ConfigService,
        AppService,
        {
            provide: 'S3',
            useFactory: (configService: ConfigService) => {
                return new AWS.S3({
                    endpoint: "http://localhost:9000" || configService.get<string>('MINIO_ENDPOINT'),
                    // port: 9000 || configService.get<number>('MINIO_PORT'),
                    // useSSL: false,
                    s3ForcePathStyle: true, // Needed for MinIO
                    signatureVersion: 'v4', // Needed for MinIO
                    accessKeyId: "MINIOADMIN" || configService.get<string>('MINIO_ACCESS_KEY'),
                    secretAccessKey: "MINIOADMIN" || configService.get<string>('MINIO_SECRET_KEY'),
                });
            },
            inject: [ConfigService],
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {
}
