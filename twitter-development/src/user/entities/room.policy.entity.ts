import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    BaseEntity,
} from "typeorm";

@Entity("RoomPolicy")
class RoomPolicy extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column()
    public companyId: number;

    @Column()
    public validSize: number;
}

export default RoomPolicy;
