import {HttpException, HttpStatus, Injectable, Scope,} from "@nestjs/common";
import {S3Repository} from "./S3.repository";
import * as fs from "fs";
import {UploadFileDTO} from "./dto/uploadFile.dto";
import {UploadStatusEnum} from "./enum/uploadStatus.enum";
import {FileRepository} from "./file.repository";
import {PolicyType} from "./types/policy.type";
import {SetPolicyDTO} from "./dto/setPolicy.dto";

@Injectable({scope: Scope.REQUEST})
export class UserService {

    constructor(
        private readonly userRepo: S3Repository,
        private readonly fileRepo: FileRepository,
    ) {
    }

    async uploadFile(file: any, body: UploadFileDTO) {
        let {roomName, companyId, policy} = body
        policy = JSON.parse(policy) as PolicyType
        try {
            const bucketName: string = `company-id-${companyId}`;
            let bucketSizeFromPolicy = await this.fileRepo.getPolicyByCompanyId(parseInt(companyId))
            const bucketSize = await this.userRepo.getBucketSize(bucketName)
            bucketSizeFromPolicy = typeof bucketSizeFromPolicy === 'number' ? bucketSizeFromPolicy : Infinity
            if (bucketSizeFromPolicy < bucketSize + file.size) {
                fs.unlink(file.path, (err) => {
                    if (err) {
                        console.error(err);
                    }
                });
                throw new HttpException(
                    {
                        status: HttpStatus.BAD_REQUEST,
                        error: "reached MAX bucket size"
                    },
                    HttpStatus.BAD_REQUEST
                );
            }
            const buffer: Buffer = fs.readFileSync(file.path);
            let filename: string = `${roomName}/${file.originalname}`;
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
                status: UploadStatusEnum.DONE
            })
            if (fileId.startsWith('Error')) {
                throw fileId
            }
            return {
                msg: "Uploaded", file: {
                    id: fileId,
                    name: file.originalname,
                    policy,
                    bucketSize: bucketSize + file.size,
                    status: UploadStatusEnum.DONE,
                    meetingId: parseInt(roomName)
                }
            };
        } catch (e) {
            await this.fileRepo.createNewFile({
                meetingId: parseInt(roomName),
                companyId: parseInt(companyId),
                userAccessType: JSON.stringify(policy.userAccessType),
                locationAccessType: JSON.stringify(policy.locationAccessType),
                name: file.originalname,
                status: UploadStatusEnum.FAIL
            })
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: typeof e === "string" ? JSON.parse(e) : e,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }


    async downloadFile(bucketName: string, roomName: string, objectKey: string, filePath: string) {
        try {
            await this.userRepo.downloadFile(`company-id-${bucketName}`, roomName, objectKey, filePath)
            return await this.fileRepo.getFileByName(parseInt(bucketName), parseInt(roomName), objectKey)
        } catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: e,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async downloadFileWithId(fileId: string) {
        try {
            const data: any = await this.fileRepo.getFileById(fileId)
            const filePath = `files/${data.name}`;
            await this.userRepo.downloadFile(`company-id-${data.companyId}`, data.meetingId, data.name, filePath)
            return data
        } catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: e,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async getFilePolicies(fileId: string) {
        try {
            return await this.fileRepo.getFileById(fileId)
        } catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: e,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async getFilePoliciesByObjectKey(bucketName: string, roomName: string, objectKey: string) {
        try {
            return await this.fileRepo.getFileByName(parseInt(bucketName), parseInt(roomName), objectKey)
        } catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: e,
                },
                HttpStatus.BAD_REQUEST
            );
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
