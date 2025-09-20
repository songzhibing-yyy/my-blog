import { Entity,BaseEntity,PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user";
@Entity({ name: 'user_auth' })
export class UserAuth extends BaseEntity {
    @PrimaryGeneratedColumn()
    readonly id!: number;

    @Column({ type: 'int' })
    user_id!: number;

    @Column({ type: 'varchar', length: 20 })
    identity_type!: string;

    @Column({ type: 'varchar', length: 100 })
    identifier!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    credential!: string;

    @ManyToOne(() => User, {
        cascade: true,
    })
    @JoinColumn({ name: 'user_id' })
    user!: User;
}
