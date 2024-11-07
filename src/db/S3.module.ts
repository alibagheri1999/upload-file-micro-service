import {Module} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'S3',
            useFactory: (configService: ConfigService) => {
                return new AWS.S3({
                    endpoint: configService.get<string>('MINIO_ENDPOINT') || "http://46.102.140.42:9000",
                    s3ForcePathStyle: true,
                    signatureVersion: 'v4',
                    accessKeyId: configService.get<string>('MINIO_ACCESS_KEY') || "MINIOADMIN",
                    secretAccessKey: configService.get<string>('MINIO_SECRET_KEY') || "MINIOADMIN",
                });
            },
            inject: [ConfigService],
        },
    ],
    exports: ['S3'],
})
export class S3Module {
}