import {Module} from '@nestjs/common';
import {ThrottlerGuard, ThrottlerModule} from '@nestjs/throttler';
import {APP_GUARD} from '@nestjs/core';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {UserModule} from './user/user.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {DatabaseModule} from "./db/mysql.module";
import {S3Module} from "./db/S3.module";

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
        DatabaseModule,
        S3Module,
    ],
    controllers: [AppController],
    providers: [
        ConfigService,
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {
}
