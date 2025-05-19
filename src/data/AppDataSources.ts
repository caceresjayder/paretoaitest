import config from "@/config/config";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";
import { User } from "@/models/User";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: 'mysql',
    host: config.database.host,
    port: (config.database.port ?? 3306) as number,
    username: config.database.user,
    password: config.database.password,
    database: config.database.database,
    entities: [User, Chat, Message],
    // logging: true
});