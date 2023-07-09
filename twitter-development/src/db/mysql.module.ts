import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {AppController} from '../app.controller'
import {AppService} from '../app.service'
import File from "../user/entities/file.entity";
import RoomPolicy from "../user/entities/room.policy.entity";


@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: "mysql",
                host: configService.get<string>("MYSQL_HOSTNAME") || "46.102.140.42",
                port: configService.get<number>("MYSQL_PORT") || 3307,
                username: configService.get<string>("MYSQL_USERNAME") || "keycloak",
                password: configService.get<string>("MYSQL_PASSWORD") || "password",
                database: configService.get<string>("MYSQL_NAME") || "keycloak",
                synchronize:
                    configService.get<boolean>("MYSQL_SYNCHRONIZE") || true,
                entities: [File, RoomPolicy],
            }),
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class DatabaseModule {
}
