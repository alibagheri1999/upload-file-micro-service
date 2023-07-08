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
    @IsString()
    @IsNotEmpty()
    policy: string
    // @ApiProperty({
    //     type: 'number',
    //     example: 1073741824,
    // })
    // @IsString()
    // @IsNotEmpty()
    // maxSize: string

    // @ApiProperty({
    //     type: 'number',
    //     example: 10000,
    // })
    // @IsString()
    // @IsNotEmpty()
    // maxObjects: string

    @ApiProperty({
        type: 'string',
        format: 'binary',
    })
    file: any;
}