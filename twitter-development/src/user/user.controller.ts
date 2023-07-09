import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {UserService} from "./user.service";
// import {AuthGuard} from "./guards/auth.guard";
import {diskStorage} from 'multer';
import {ApiConsumes, ApiTags} from "@nestjs/swagger";
// import {GetUser} from "./decorators/user.decorator";
import {FileInterceptor} from "@nestjs/platform-express";
import {editFileName, imageFileFilter} from "./utilities/fileFilter";
import {UploadFileDTO} from "./dto/uploadFile.dto";
import {Response} from 'express'
import * as fs from "fs";
import {SetPolicyDTO} from "./dto/setPolicy.dto";

@ApiTags("Files")
@Controller("api/v1/files")
export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {
    }

    @Post('upload')
    // @UseGuards(new AuthGuard())
    @UseInterceptors(FileInterceptor('file', {
            storage: diskStorage({
                destination: './files',
                filename: editFileName,
            }),
            fileFilter: imageFileFilter,
        }),
    )
    @ApiConsumes('multipart/form-data')
    async uploadFile(@UploadedFile() file: any, @Body() body: UploadFileDTO) {
        return await this.userService.uploadFile(file, body)
    }

    @Get('download/:bucketName/:roomName/:objectKey')
    async downloadFile(
        @Param('bucketName') bucketName: string,
        @Param('roomName') roomName: string,
        @Param('objectKey') objectKey: string,
        @Res() res: Response,
    ): Promise<any> {
        const filePath = `files/${objectKey}`;
        const file: any = await this.userService.downloadFile(bucketName, roomName, objectKey, filePath);
        setTimeout(() => fs.unlinkSync(`filePath`), 5000)
        res.setHeader('id', `${file.id}`);
        res.setHeader('userAccessType', `${file.userAccessType}`);
        res.setHeader('locationAccessType', `${file.locationAccessType}`);
        res.setHeader('meetingId', `${file.meetingId}`);
        res.setHeader('companyId', `${file.companyId}`);
        res.setHeader('status', `${file.status}`);
        fs.createReadStream(filePath).pipe(res);
    }

    @Get('download/:fileId')
    async downloadFileWithId(
        @Param('fileId') fileId: string,
        @Res() res: Response,
    ): Promise<any> {
        const file: any = await this.userService.downloadFileWithId(fileId);
        setTimeout(() => fs.unlinkSync(`files/${file.name}`), 5000)
        res.setHeader('id', `${file.id}`);
        res.setHeader('userAccessType', `${file.userAccessType}`);
        res.setHeader('locationAccessType', `${file.locationAccessType}`);
        res.setHeader('meetingId', `${file.meetingId}`);
        res.setHeader('companyId', `${file.companyId}`);
        res.setHeader('status', `${file.status}`);
        fs.createReadStream(`files/${file.name}`).pipe(res);
    }

    @Get('file/infoById/:fileId')
    async getFilePoliciesById(
        @Param('fileId') fileId: string,
    ) {
        return await this.userService.getFilePolicies(fileId);
    }

    @Get('file/info/:bucketName/:roomName/:objectKey')
    async getFilePoliciesByObjectKey(
        @Param('bucketName') bucketName: string,
        @Param('roomName') roomName: string,
        @Param('objectKey') objectKey: string,
    ) {
        return await this.userService.getFilePoliciesByObjectKey(bucketName, roomName, objectKey);
    }

    @Post('company/policy/:objectKey')
    async createNewPolicyForRoom(
        @Body() body: SetPolicyDTO
    ) {
        return await this.userService.createNewPolicyForRoom(body);
    }
}


