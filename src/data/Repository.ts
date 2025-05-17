import { Chat } from "@/models/Chat";
import { User } from "@/models/User";
import { Message } from "@/models/Message";
import { AppDataSource } from "./AppDataSources";


if(!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
}

export const userRepository = AppDataSource.getRepository(User);
export const chatRepository = AppDataSource.getRepository(Chat);
export const messageRepository = AppDataSource.getRepository(Message);






