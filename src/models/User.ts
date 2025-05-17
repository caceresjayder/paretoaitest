import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Chat } from "./Chat";
import { Message } from "./Message";

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column({unique: true})
    email!: string;

    @Column()
    password!: string;

    @Column({nullable: true})
    googleId!: string;

    @Column({nullable: true})
    openaiApiKey!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
    
    @OneToMany(() => Chat, (chat) => chat.user)
    chats!: Chat[];

    @OneToMany(() => Message, (message) => message.user)
    messages!: Message[];
}