import {Body, Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors} from "@nestjs/common";
import {UserService} from "./user.service";
// for auth
// import {AuthGuard} from "./guards/auth.guard";
// import {GetUser} from "./decorators/user.decorator";
import {diskStorage} from 'multer';
import {ApiConsumes, ApiTags} from "@nestjs/swagger";
import {FileInterceptor} from "@nestjs/platform-express";
import {editFileName, imageFileFilter} from "./utilities/fileFilter";
import {UploadFileDTO} from "./dto/uploadFile.dto";
import {Response} from 'express'
import {SetPolicyDTO} from "./dto/setPolicy.dto";
import {FileTypeEnum} from './enum/fileType.enum'

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

    @Get('download/:bucketName/:roomName/:type/:objectKey')
    async downloadFile(
        @Param('bucketName') bucketName: string,
        @Param('roomName') roomName: string,
        @Param('type') type: FileTypeEnum,
        @Param('objectKey') objectKey: string,
        @Res() res: Response,
    ) {
        const file: any = await this.userService.downloadFile(bucketName, roomName, objectKey, type);
        if (!file) {
            throw new Error('File is broken');
        }
        res.json(file);
        // if we want to use stream we need to read from fs
        // fs.createReadStream(filePath).pipe(res);
    }

    @Get('download/:fileId')
    async downloadFileWithId(
        @Param('fileId') fileId: string,
        @Res() res: Response,
    ) {
        const file: any = await this.userService.downloadFileWithId(fileId);
        if (!file) {
            throw new Error('File is broken');
        }
        res.json(file);
        // if we want to use stream we need to read from fs
        // fs.createReadStream(`files/${file.name}`).pipe(res);
    }

    @Get('file/infoById/:fileId')
    async getFilePoliciesById(
        @Param('fileId') fileId: string,
    ) {
        return await this.userService.getFilePolicies(fileId);
    }

    @Get('file/info/:bucketName/:roomName/:type/:objectKey')
    async getFilePoliciesByObjectKey(
        @Param('bucketName') bucketName: string,
        @Param('roomName') roomName: string,
        @Param('type') type: FileTypeEnum,
        @Param('objectKey') objectKey: string,
    ) {
        const result = await this.userService.getFilePoliciesByObjectKey(bucketName, roomName, objectKey, type)
        if (!result) {
            throw new Error('File is broken');
        }
        return result
    }

    @Post('company/policy')
    async createNewPolicyForRoom(
        @Body() body: SetPolicyDTO
    ) {
        return await this.userService.createNewPolicyForRoom(body);
    }
}


