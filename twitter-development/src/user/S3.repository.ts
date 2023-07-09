import {HttpException, HttpStatus, Inject, Injectable, Scope,} from "@nestjs/common";
import {IS3Repository} from "./types/S3.repository";
import * as AWS from "aws-sdk";
import * as fs from "fs";
import {WriteStream} from "fs";

@Injectable({scope: Scope.REQUEST})
export class S3Repository implements IS3Repository {

    constructor(@Inject('S3') private readonly S3: AWS.S3) {
    }

    async existKey(params: {
        Bucket: string,
        Key: string,
    }): Promise<boolean | HttpException> {
        return new Promise((resolve, reject) => {
            this.S3.headObject(params, (err, data) => {
                if (err && err.code === 'NotFound') {
                    resolve(false)
                } else if (err) {
                    resolve(false)
                } else {
                    resolve(true)
                }
            });
        });
    }

    async downloadFile(bucketName: string, roomName: string, objectKey: string, filePath: string): Promise<void | HttpException> {
        let stream: any;
        let params: {
            Bucket: string,
            Key: string,
        };
        let file: WriteStream;
        try {
            params = {
                Bucket: bucketName,
                Key: `${roomName}/${objectKey}`,
            };
            file = fs.createWriteStream(filePath);
            if (await this.existKey(params)) {
                stream = await this.S3.getObject(params)?.createReadStream()
            } else {
                throw 'The specified key does not exist'

            }
        } catch (e) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: e,
                },
                HttpStatus.BAD_REQUEST
            );
        }
        return new Promise((resolve, reject) => {
            stream.pipe(file)
                .on('error', (err) => {
                    reject(err);
                })
                .on('close', () => {
                    resolve();
                });
        });
    }

    async setBucketPolicy(bucketName: string): Promise<void | HttpException> {
        const paramsForEncryption = {
            Bucket: bucketName,
            ServerSideEncryptionConfiguration: {
                Rules: [
                    {
                        ApplyServerSideEncryptionByDefault: {
                            SSEAlgorithm: 'AES256',
                        },
                    },
                ],
            },
        };
        try {
            await this.S3.putBucketEncryption(paramsForEncryption)
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

    async push(bucketName: string, objectKey: string, fileContent: Buffer): Promise<string | HttpException> {
        try {
            const params = {
                Bucket: bucketName,
                Key: objectKey,
                Body: fileContent,
            };
            await this.S3.putObject(params).promise();
            return 'uploaded'
        } catch (e) {
            return JSON.stringify(e)
        }
    }

    async getBucket(bucketName: string): Promise<boolean | HttpException> {
        try {
            const params = {
                Bucket: bucketName,
            };
            await this.S3.headBucket(params).promise();
            return true;
        } catch (error) {
            if (error.statusCode === 404) {
                return false;
            }
        }
    }

    async createBucket(bucketName: string): Promise<void | HttpException> {
        try {
            const params = {
                Bucket: bucketName,
            };
            await this.S3.createBucket(params).promise();
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

    async setUserPolicy(bucketName: string, policy: string): Promise<void | HttpException> {
        const params = {
            Bucket: bucketName,
            Policy: policy,
        };
        try {
            await this.S3.putBucketPolicy(params).promise();
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.BAD_REQUEST,
                    error: error,
                },
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async getBucketSize(bucketName: string): Promise<number | HttpException> {
        const params = {
            Bucket: bucketName,
        };

        try {
            const response = await this.S3.listObjectsV2(params).promise();
            const objects = response.Contents;
            let totalSize = 0;
            objects.forEach((object) => {
                totalSize += object.Size || 0;
            });

            return totalSize;
        } catch (error) {
            console.error(`Error getting bucket size: ${error.message}`);
           return error.message.toString()
        }
    }
}
