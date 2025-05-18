import { chatRepository, messageRepository } from "@/data/Repository";
import { getUser } from "@/lib/dal";
import { OpenAIResponse } from "@/lib/openai";
import { ApiResponse } from "@/types";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

// GET /api/chats/:slug
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug = (await params)?.slug;
        if(typeof slug !== 'string') {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Invalid slug",
                },
            }, { status: 400 });
        }

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

        const messages = await messageRepository.find({
            where: {
                chatId: chat.id,
            },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                content: true,
                isAssistant: true,
                isUser: true
            },
            // order: {
            //     id: "desc",
            // },
            take: 10,
        });

        return NextResponse.json<ApiResponse>({
            success: true,
            data: messages,
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

// POST /api/chats/:slug/
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {

    try {
        const slug = (await params)?.slug;
        const { prompt } = await request.json();
        
        if(typeof slug !== 'string') {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Invalid slug",
                },
            }, { status: 422 });
        }

        if(typeof prompt !== 'string' || prompt.length === 0) {
            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Invalid prompt",
                },
            }, { status: 422 });
        }

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
            // order: {
            //     id: "desc",
            // },
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
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

        await chatRepository.update(chat.id, {
            updatedAt: new Date(),
        });

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
                root: "Server error, please try again later",
            },
        }, { status: 500 });
    }
}

// DELETE /api/chats/:slug
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const slug = (await params)?.slug;

        if(typeof slug !== 'string' || slug.length === 0) {

            return NextResponse.json<ApiResponse>({
                success: false,
                data: null,
                error: {
                    root: "Invalid slug",
                },
            }, { status: 422 });
        }

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

        await messageRepository.delete({ chatId: chat.id });
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