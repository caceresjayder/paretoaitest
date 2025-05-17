import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "./User";
import { Chat } from "./Chat";

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

    @ManyToOne(() => Chat, (chat) => chat.messages)
    chat!: Relation<Chat>;

    @ManyToOne(() => User, (user) => user.messages)
    user!: Relation<User>;
}