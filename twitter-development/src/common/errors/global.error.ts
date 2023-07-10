import {ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus} from '@nestjs/common';
import {Response} from 'express';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let status = HttpStatus.INTERNAL_SERVER_ERROR;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
        }
        const errorResponse = {
            status,
            error: {
                status,
                message: exception?.message ? exception?.message : "Internal Server Error Exception",
                error: exception?.toString()?.split(":")[0],
            }
        };

        response.status(status).json(errorResponse);
    }
}