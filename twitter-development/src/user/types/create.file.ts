import {UploadStatusEnum} from '../enum/uploadStatus.enum'
import {FileTypeEnum} from "../enum/fileType.enum";

export interface CreateNewFileType {
    locationAccessType: string;
    name: string;
    meetingId: number;
    companyId: number;
    userAccessType: string;
    status: UploadStatusEnum;
    type: FileTypeEnum;
}