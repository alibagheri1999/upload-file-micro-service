import {HttpException, HttpStatus, Injectable, Scope,} from "@nestjs/common";
import {S3Repository} from "./S3.repository";
import * as fs from "fs";
import {UploadFileDTO} from "./dto/uploadFile.dto";
import {UploadStatusEnum} from "./enum/uploadStatus.enum";
import {FileRepository} from "./file.repository";
import {PolicyType} from "./types/policy.type";
import {SetPolicyDTO} from "./dto/setPolicy.dto";
import {FileTypeEnum} from "./enum/fileType.enum";

@Injectable({scope: Scope.REQUEST})
export class UserService {

    constructor(
        private readonly userRepo: S3Repository,
        private readonly fileRepo: FileRepository,
    ) {
    }

    async uploadFile(file: any, body: UploadFileDTO) {
        let {roomName, companyId, policy, type} = body
        policy = JSON.parse(policy) as PolicyType
        try {
            const bucketName: string = `company-id-${companyId}`;
            let bucketSizeFromPolicy = await this.fileRepo.getPolicyByCompanyId(parseInt(companyId))
            const bucketSize = await this.userRepo.getBucketSize(bucketName)
            bucketSizeFromPolicy = typeof bucketSizeFromPolicy === 'number' ? bucketSizeFromPolicy : Infinity
            if (bucketSizeFromPolicy > bucketSize + file.size) {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
                throw new HttpException("reached MAX bucket size", HttpStatus.BAD_REQUEST);
            }
            const buffer: Buffer = fs.readFileSync(file.path);
            let filename: string = `${roomName}/${type}/${file.originalname}`;
            const bucketExists = await this.userRepo.getBucket(bucketName);
            if (!bucketExists) {
                await this.userRepo.createBucket(bucketName);
                await this.userRepo.setBucketPolicy(bucketName);
            }
            const result = await this.userRepo.push(bucketName, filename, buffer);
            if (result !== 'uploaded') throw result
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error(err);
                }
            });
            const fileId: string = await this.fileRepo.createNewFile({
                meetingId: parseInt(roomName),
                companyId: parseInt(companyId),
                userAccessType: JSON.stringify(policy.userAccessType),
                locationAccessType: JSON.stringify(policy.locationAccessType),
                name: file.originalname,
                status: UploadStatusEnum.DONE,
                type
            })
            if (fileId.startsWith('Error')) {
                throw fileId
            }
            return {
                msg: "Uploaded", file: {
                    id: fileId,
                    name: file.originalname,
                    policy,
                    bucketSize: typeof bucketSize === 'number' ? bucketSize + file.size : file.size,
                    status: UploadStatusEnum.DONE,
                    meetingId: parseInt(roomName),
                    type
                }
            };
        } catch (e) {
            await this.fileRepo.createNewFile({
                meetingId: parseInt(roomName),
                companyId: parseInt(companyId),
                userAccessType: JSON.stringify(policy.userAccessType),
                locationAccessType: JSON.stringify(policy.locationAccessType),
                name: file.originalname,
                status: UploadStatusEnum.FAIL,
                type
            })
            throw new HttpException(typeof e === "string" ? JSON.parse(e) : e, HttpStatus.BAD_REQUEST);
        }
    }


    async downloadFile(bucketName: string, roomName: string, objectKey: string, type: FileTypeEnum) {
        try {
            const fileInfo = await this.fileRepo.getFileByName(parseInt(bucketName), parseInt(roomName), objectKey, type)
            fileInfo['url'] = await this.userRepo.downloadFile(`company-id-${bucketName}`, roomName, objectKey, type)
            return fileInfo
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST);
        }
    }

    async downloadFileWithId(fileId: string) {
        try {
            const fileInfo: any = await this.fileRepo.getFileById(fileId)
            fileInfo['url'] = await this.userRepo.downloadFile(`company-id-${fileInfo.companyId}`, fileInfo.meetingId, fileInfo.name, fileInfo.type)
            console.log(111)
            return fileInfo
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST);
        }
    }

    async getFilePolicies(fileId: string) {
        try {
            return await this.fileRepo.getFileById(fileId)
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST);
        }
    }

    async getFilePoliciesByObjectKey(bucketName: string, roomName: string, objectKey: string, type: FileTypeEnum) {
        try {
            return await this.fileRepo.getFileByName(parseInt(bucketName), parseInt(roomName), objectKey, type)
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST);
        }
    }

    async createNewPolicyForRoom(body: SetPolicyDTO) {
        try {
            const {companyId, validSize} = body
            const bucketName: string = `company-id-${companyId}`;
            this.fileRepo.createNewPolicyForCompany({
                companyId: parseInt(companyId),
                validSize: validSize
            })
                .then()
                .catch()
            const bucketExists = await this.userRepo.getBucket(bucketName);
            if (!bucketExists) {
                await this.userRepo.createBucket(bucketName);
                await this.userRepo.setBucketPolicy(bucketName);
            }
            return body
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST);
        }
    }
}
