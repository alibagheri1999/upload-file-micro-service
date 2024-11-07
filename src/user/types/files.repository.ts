import {HttpException} from "@nestjs/common";
import {CreateNewFileType} from "./create.file";
import {CreateNewCompanyPolicyType} from "./create.company.policy";
import File from "../entities/file.entity";
import {FileTypeEnum} from '../enum/fileType.enum'

export interface IFileRepository {
    getPolicyByCompanyId(companyId: number): Promise<number | string>

    createNewFile(peyload: CreateNewFileType): Promise<string>

    createNewPolicyForCompany(peyload: CreateNewCompanyPolicyType): Promise<string | HttpException>

    getFileById(id: string): Promise<File | string>

    getFileByName(companyId: number, meetingId: number, name: string, type: FileTypeEnum): Promise<File | string>
}