import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
} from "typeorm";
import {UploadStatusEnum} from "../enum/uploadStatus.enum";

@Entity("File")
class File extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({
        unique: true,
    })
    public name: string;

    @Column()
    public userAccessType: string;

    @Column()
    public locationAccessType:string

    @Column()
    public meetingId: number;

    @Column()
    public companyId: number;

    @Column({
        default: UploadStatusEnum.INPROGRESS
    })
    public status: UploadStatusEnum;
}

export default File;
