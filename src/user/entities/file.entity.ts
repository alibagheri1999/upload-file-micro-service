import {BaseEntity, Column, Entity, PrimaryGeneratedColumn,} from "typeorm";
import {UploadStatusEnum} from "../enum/uploadStatus.enum";
import {FileTypeEnum} from "../enum/fileType.enum";

@Entity("File")
class File extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public name: string;

    @Column()
    public userAccessType: string;

    @Column()
    public locationAccessType: string

    @Column()
    public meetingId: number;

    @Column()
    public companyId: number;

    @Column({
        default: UploadStatusEnum.INPROGRESS
    })
    public status: UploadStatusEnum;

    @Column({
        default: FileTypeEnum.OTHERS
    })
    public type: FileTypeEnum;
}

export default File;
