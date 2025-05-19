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
    synchronize: config.server.isDevelopment,
    dropSchema: config.server.isTest,
    // logging: config.server.isDevelopment,
});

if(!AppDataSource.isInitialized) {
    AppDataSource.initialize()
        .then(() => {
            console.log("Data Source has been initialized!");
        })
        .catch((err) => {
            console.error("Error during Data Source initialization", err);
        });
}
export default AppDataSource;