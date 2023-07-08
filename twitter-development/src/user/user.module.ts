import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {AuthGuard} from "./guards/auth.guard";
import {UserRepo} from "./user.repository";
import {MulterModule} from "@nestjs/platform-express";
import {ConfigModule, ConfigService} from "@nestjs/config";
import * as AWS from "aws-sdk";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['.env'],
            expandVariables: true,
        }),
        MulterModule.register({
            dest: './files',
        }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: "6000s"},
        }),
        JwtModule.register({
            secret: process.env.RFRESH_JWT_SECRET,
            signOptions: {expiresIn: "600000000000000s"},
        }),
    ],
    controllers: [UserController],
    providers: [ConfigService,
        UserService, AuthGuard, UserRepo,
        {
            provide: 'S3',
            useFactory: (configService: ConfigService) => {
                return new AWS.S3({
                    endpoint: "http://46.102.140.42:9000" || configService.get<string>('MINIO_ENDPOINT'),
                    // port: 9000 || configService.get<number>('MINIO_PORT'),
                    // useSSL: false,
                    s3ForcePathStyle: true, // Needed for MinIO
                    signatureVersion: 'v4', // Needed for MinIO
                    accessKeyId: "MINIOADMIN" || configService.get<string>('MINIO_ACCESS_KEY'),
                    secretAccessKey: "MINIOADMIN" || configService.get<string>('MINIO_SECRET_KEY'),
                });
            },
            inject: [ConfigService],
        }],
    exports: [UserService, AuthGuard, JwtModule],
})
export class UserModule {
}
