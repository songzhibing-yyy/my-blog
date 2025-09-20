import { Entity,BaseEntity,PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    readonly id!: number;

    @Column({ type: 'varchar', length: 255 })
    nickname!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    job!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    introduce!: string;
}
