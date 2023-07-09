import {Module} from "@nestjs/common";
import {JwtModule} from "@nestjs/jwt";
import {UserController} from "./user.controller";
import {UserService} from "./user.service";
import {AuthGuard} from "./guards/auth.guard";
import {S3Repository} from "./S3.repository";
import {MulterModule} from "@nestjs/platform-express";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {S3Module} from "../db/S3.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import File from "./entities/file.entity";
import RoomPolicy from "./entities/room.policy.entity";
import {FileRepository} from "./file.repository";

@Module({
    imports: [
        TypeOrmModule.forFeature([File, RoomPolicy]),
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
        S3Module,
    ],
    controllers: [UserController],
    providers: [
        ConfigService,
        UserService,
        AuthGuard,
        S3Repository,
        FileRepository
    ],
    exports: [UserService, AuthGuard, JwtModule],
})
export class UserModule {
}
