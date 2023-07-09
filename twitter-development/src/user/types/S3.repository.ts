import {HttpException} from "@nestjs/common";

export interface IS3Repository {
    downloadFile(bucketName: string, roomName: string, objectKey: string, filePath: string): Promise<void | HttpException>

    push(bucketName: string, objectKey: string, fileContent: Buffer): Promise<string | HttpException>

    getBucket(bucketName: string): Promise<boolean | HttpException>

    createBucket(bucketName: string): Promise<void | HttpException>

    setUserPolicy(bucketName: string, policy: string): Promise<void | HttpException>

    getBucketSize(bucketName: string): Promise<number | HttpException>

    setBucketPolicy(bucketName: string): Promise<void | HttpException>

    existKey(params: { Bucket: string, Key: string, }): Promise<boolean | HttpException>
}