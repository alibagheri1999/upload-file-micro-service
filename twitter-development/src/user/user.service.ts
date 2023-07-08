import {HttpException, HttpStatus, Injectable, Scope,} from "@nestjs/common";
import {UserRepo} from "./user.repository";
import * as fs from "fs";
import {UploadFileDTO} from "./dto/uploadFile.dto";
import {PolicyType} from "./types/policy.type";

@Injectable({scope: Scope.REQUEST})
export class UserService {

    constructor(
        private readonly userRepo: UserRepo,
        // private readonly logger: Logger,
    ) {
    }

    async uploadFile(file: any, body: UploadFileDTO) {
        try {
            const buffer: Buffer = fs.readFileSync(file.path);
            let {roomName, companyId, policy} = body
            let filename: string = `${roomName}/${file.originalname}`;
            console.log(filename, file.path)
            const bucketName: string = `company-id-${companyId}`;
            const bucketExists = await this.userRepo.getBucket(bucketName);

            if (!bucketExists) {
                await this.userRepo.createBucket(bucketName);
                await this.userRepo.setBucketPolicy(bucketName);
            }
            const result = await this.userRepo.push(bucketName, filename, buffer);
            if (result !== 'uploaded') throw result
            const bucketSize = await this.userRepo.getBucketSize(bucketName)
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            return {
                msg: "Uploaded", policy, bucketSize
            };
        } catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: JSON.parse(e),
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    deleteActualFile(filePath: string){
        fs.unlinkSync(filePath);
    }

    async downloadFile(bucketName: string, roomName: string, objectKey: string, filePath: string){
        try {
           await this.userRepo.downloadFile(`company-id-${bucketName}`, roomName, objectKey, filePath)
        }catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: e,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }
}
