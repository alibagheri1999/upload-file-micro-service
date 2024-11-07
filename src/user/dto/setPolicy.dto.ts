import {IsNotEmpty, IsString} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger';

export class SetPolicyDTO {
    @ApiProperty({
        type: 'number',
        example: 1234,
    })
    @IsString()
    @IsNotEmpty()
    validSize: string

    @ApiProperty({
        type: 'number',
        example: 1234,
    })
    @IsString()
    @IsNotEmpty()
    companyId: string
}