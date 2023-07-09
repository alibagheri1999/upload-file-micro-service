import {IsNotEmpty, IsString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger';
import {PolicyType} from "../types/policy.type";

export class UploadFileDTO {
    @ApiProperty({
        type: 'number',
        example: 1234,
    })
    @IsString()
    @IsNotEmpty()
    roomName: string

    @ApiProperty({
        type: 'number',
        example: 1234,
    })
    @IsString()
    @IsNotEmpty()
    companyId: string

    @ApiProperty({
        type: 'number',
        example: 1234,
    })
    @IsNotEmpty()
    policy: any

    @ApiProperty({
        type: 'string',
        format: 'binary',
    })
    file: any;
}