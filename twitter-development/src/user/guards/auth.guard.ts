import {CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable,} from "@nestjs/common";
import * as jwt from "jsonwebtoken";
// import {JwtPayload} from "../types/payload.interface";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor() {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const path = request.headers.authorization;
        if (!path) {
            return false;
        }
        const result = await this.validateToken(path);
        return !!result;

    }

    async validateToken(auth: string) {
        if (auth.split(" ")[0] !== "Bearer") {
            throw new HttpException("invalid Token", HttpStatus.UNAUTHORIZED);
        }

        const token = auth.split(" ")[1];
        const jwtSecret = process.env.JWT_SECRET || "JWT_SECRET";

        try {
            const base64Payload = token.split(".")[1];
            const payloadBuffer = Buffer.from(base64Payload, "base64");
            const updatedJwtPayload: any = JSON.parse(
                payloadBuffer.toString()
            ) as any;

            return {jwt: jwt.verify(token, jwtSecret)};
        } catch (error) {
            throw new HttpException("invalid Token", HttpStatus.UNAUTHORIZED);
        }
    }
}
