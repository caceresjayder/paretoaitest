import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'chats'})
export class Chat {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column({type: 'int'})
    userId!: number;

    @Column({type: 'varchar', length: 255})
    slug!: string;

    @Column({type: 'varchar', length: 255})   
    name!: string;

    @Column({type: 'text'})
    description!: string;

    @Column({type: 'text'})
    context!: string;

    @CreateDateColumn({type: 'timestamp'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt!: Date;

}