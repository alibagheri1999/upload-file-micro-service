import {UploadStatusEnum} from '../enum/uploadStatus.enum'

export interface CreateNewFileType {
    locationAccessType: string;
    name: string;
    meetingId: number;
    companyId: number;
    userAccessType: string;
    status: UploadStatusEnum
}