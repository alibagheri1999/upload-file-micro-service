import {HttpException, Injectable, Scope,} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IFileRepository} from "./types/files.repository";
import {Repository} from "typeorm";
import File from './entities/file.entity'
import RoomPolicy from './entities/room.policy.entity'
import {CreateNewFileType} from "./types/create.file";
import {CreateNewCompanyPolicyType} from "./types/create.company.policy";

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
            return result.validSize
        } catch (e) {
            return e.message.toString()
        }
    }

    async createNewFile(peyload: CreateNewFileType): Promise<string | HttpException> {
        try {
            const result = await this.FileRepository.insert(peyload)
            return result?.identifiers[0]?.id?.toString()
        } catch (e) {
            return e.message.toString()
        }
    }

    async createNewPolicyForCompany(peyload: CreateNewCompanyPolicyType): Promise<string | HttpException> {
        return new Promise((resolve, reject) => {
            this.RoomPolicyRepository.insert(peyload)
                .then()
                .catch((e) => reject(e))
        })
    }

    async getFileById(id: string): Promise<File | string> {
        try {
            return await this.FileRepository.findOne({id})
        } catch (e) {
            return e.message.toString()
        }
    }

    async getFileByName(name: string): Promise<File | string> {
        try {
            return await this.FileRepository.findOne({name})
        } catch (e) {
            return e.message.toString()
        }
    }
}
