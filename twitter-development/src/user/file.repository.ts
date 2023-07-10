import {HttpException, Injectable, Scope,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IFileRepository} from "./types/files.repository";
import {Repository} from "typeorm";
import File from './entities/file.entity'
import RoomPolicy from './entities/room.policy.entity'
import {CreateNewFileType} from "./types/create.file";
import {CreateNewCompanyPolicyType} from "./types/create.company.policy";
import {FileTypeEnum} from './enum/fileType.enum'

@Injectable({scope: Scope.REQUEST})
export class FileRepository implements IFileRepository {

    constructor(
        @InjectRepository(File)
        private FileRepository: Repository<File>,
        @InjectRepository(RoomPolicy)
        private RoomPolicyRepository: Repository<RoomPolicy>,
    ) {
    }

    async getPolicyByCompanyId(companyId: number): Promise<number | string> {
        try {
            const result = await this.RoomPolicyRepository.findOne({companyId})
            return parseInt(result.validSize)
        } catch (e) {
            return e.message.toString()
        }
    }

    async createNewFile(peyload: CreateNewFileType): Promise<string> {
        try {
            const lastFile: any = await this.getFileByName(peyload.companyId, peyload.meetingId, peyload.name, peyload.type)
            if (lastFile) {
                await this.FileRepository.update({id: lastFile.id}, peyload)
                return lastFile.id
            }
            const result = await this.FileRepository.insert(peyload)
            return result?.identifiers[0]?.id?.toString()
        } catch (e) {
            return "Error : can not create table, something went wrong"
        }
    }

    async createNewPolicyForCompany(peyload: CreateNewCompanyPolicyType): Promise<string | HttpException> {
        return new Promise(async (resolve, reject) => {
            const data: any = await this.RoomPolicyRepository.findOne({companyId: peyload.companyId})
            if (data) {
                this.RoomPolicyRepository.update({id: data.id}, peyload)
                    .then()
                    .catch((e) => reject(e))
            } else {
                this.RoomPolicyRepository.insert(peyload)
                    .then()
                    .catch((e) => reject(e))
            }
        })
    }

    async getFileById(id: string): Promise<File | string> {
        try {
            return await this.FileRepository.findOne({id})
        } catch (e) {
            return e.message.toString()
        }
    }

    async getFileByName(companyId: number, meetingId: number, name: string, type: FileTypeEnum): Promise<File | string> {
        try {
            return (await this.FileRepository.find({
                where: {
                    name, companyId, meetingId, type
                }
            }))[0]
        } catch (e) {
            return e.message.toString()
        }
    }
}
