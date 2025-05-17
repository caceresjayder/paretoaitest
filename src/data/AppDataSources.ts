import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'paretoaitest',
    password: 'paretoai123@',
    database: 'paretoaitest',
    entities: [User, Chat, Message],
    // logging: true
});