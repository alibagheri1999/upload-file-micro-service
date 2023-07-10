import {IsNotEmpty, IsString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger';
import {FileTypeEnum} from "../enum/fileType.enum";

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
        example: "whiteboard",
    })
    @IsString()
    @IsNotEmpty()
    type: FileTypeEnum

    @ApiProperty({
        type: 'string',
        format: 'binary',
    })
    file: any;
}