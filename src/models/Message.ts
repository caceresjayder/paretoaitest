import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity({name: 'messages'})
export class Message {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'int'})
    userId!: number;

    @Column({type: 'integer'})
    chatId!: number;

    @Column({type: 'text'})
    content!: string;

    @Column({type: 'boolean'})
    isUser!: boolean;

    @Column({type: 'boolean'})
    isAssistant!: boolean;

    @CreateDateColumn({type: 'timestamp'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamp'})
    updatedAt!: Date;

}