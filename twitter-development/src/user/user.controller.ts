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

@ApiTags("Files")
@Controller("files")
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
    ): Promise<void> {
        const filePath = `files/${objectKey}`;
        await this.userService.downloadFile(bucketName, roomName, objectKey, filePath);

        return res.download(filePath, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }

            this.userService.deleteActualFile(filePath) // Delete the file after download
        });
    }
}


