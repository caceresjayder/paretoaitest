import config from "@/config/config";
import { chatRepository, messageRepository } from "@/data/Repository";
import { getUser } from "@/lib/dal";
import { OpenAIResponse } from "@/lib/openai";
import { Message } from "@/models/Message";
import { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const user = await getUser();
    if (!user) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Unauthorized",
            },
        }, { status: 401 });
    }
    try {
        // get all chats for the user and the last message timestamp of each chat
        const chats = await chatRepository.createQueryBuilder("chats")
        .leftJoinAndSelect(
            (query) => query
            .select("messages.chatId", "chatId")
            .addSelect("MAX(messages.createdAt)", "lastMessageAt")
            .from(Message, "messages")
            .groupBy("messages.chatId"),
            "lastMessage",
            "lastMessage.chatId = chats.id"
        )
        .select([
            "chats.*",
            "lastMessage.lastMessageAt",
        ])
        .orderBy("lastMessageAt", "DESC")
        .getRawMany();

        return NextResponse.json<ApiResponse>({
            success: true,
            data: chats,
            error: null,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Failed to fetch chats",
            },
        }, { status: 500 });
    }

}

export async function POST(request: Request) {
    const user = await getUser();
    if (!user) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Unauthorized",
            },
        }, { status: 401 });
    }
    try {
        const { prompt } = await request.json();
        const chat = chatRepository.create({
            name: prompt.substring(0, 20),
            slug: uuidv4(),
            description: prompt.substring(0, 100),
            context: config.openai.context,
            userId: user.id,
        });
        await chatRepository.save(chat);

        const message = messageRepository.create({
            content: prompt,
            chatId: chat.id,
            userId: user.id,
            isUser: true,
            isAssistant: false
        });
        await messageRepository.save(message);

        const response = await OpenAIResponse(chat.context, [], prompt);

        const assistantMessage = messageRepository.create({
            content: response || "I'm sorry, I can't answer that question.",
            chatId: chat.id,
            userId: user.id,
            isUser: false,
            isAssistant: true
        });

        await messageRepository.save(assistantMessage);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: chat,
            error: null,
        }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Failed to create chat",
            },
        }, { status: 500 });
    }
}