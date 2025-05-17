import { chatRepository, messageRepository } from "@/data/Repository";
import { getUser } from "@/lib/dal";
import { OpenAIResponse } from "@/lib/openai";
import { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

// GET /api/chats/:slug
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;
    try {
        const chat = await chatRepository.findOneBy({ slug });
        if (!chat) {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Chat not found",
                },
            }, { status: 404 });
        }
        return NextResponse.json<ApiResponse>({
            success: true,
            data: chat,
            error: null,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Failed to fetch chat",
            },
        }, { status: 500 });
    }
    
}

// POST /api/chats/:slug/messages
export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const { prompt } = await request.json();
    const user = await getUser();
    if (!user) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "User not found",
            },
        }, { status: 401 });
    }
    try {
        const chat = await chatRepository.findOneBy({ slug, userId: user.id });
        if (!chat) {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Chat not found",
                },
            }, { status: 404 });
        }

        const history = await messageRepository.find({
            where: {
                chatId: chat.id,
            },
            order: {
                id: "desc",
            },
            select: {
                content: true,
                isUser: true,
                isAssistant: true,
            },
            take: 10,
        });

        const message = messageRepository.create({
            content: prompt,
            chatId: chat.id,
            userId: chat.userId,
            isUser: true,
            isAssistant: false,
        });
        await messageRepository.save(message);

        const response = await OpenAIResponse(chat.context, history.map((message) => {
            return {
                role: message.isUser ? "user" : "assistant",
                content: message.content,
            };
        }), prompt);

        const assistantMessage = messageRepository.create({
            content: response ?? '',
            chatId: chat.id,
            userId: chat.userId,
            isUser: false,
            isAssistant: true,
        });
        await messageRepository.save(assistantMessage);

        return NextResponse.json<ApiResponse>({
            success: true,
            data: assistantMessage,
            error: null,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Failed to fetch chat",
            },
        }, { status: 500 });
    }
}

// DELETE /api/chats/:slug
export async function DELETE(request: NextRequest, { params }: { params: { slug: string } }) {
    const { slug } = params;
    const user = await getUser();
    if (!user) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "User not found",
            },
        }, { status: 401 });
    }
    try {
        const chat = await chatRepository.findOneBy({ slug, userId: user.id });
        if (!chat) {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Chat not found",
                },
            }, { status: 404 });
        }
        await chatRepository.delete(chat.id);
        return NextResponse.json<ApiResponse>({
            success: true,
            data: null,
            error: null,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json<ApiResponse>({
            success: false,
            data: null,
            error: {
                root: "Failed to delete chat",
            },
        }, { status: 500 });
    }
}