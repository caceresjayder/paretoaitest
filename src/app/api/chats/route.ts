import config from "@/config/config";
import { chatRepository } from "@/data/Repository";
import { getUser } from "@/lib/dal";
import { Chat } from "@/models/Chat";
import { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

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
        const chats = await chatRepository.findBy({ userId: user.id });
        return NextResponse.json<ApiResponse>({
            success: true,
            data: chats,
            error: null,
        }, { status: 200 });
    } catch (error) {
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
        const { question } = await request.json();
        const chat = chatRepository.create({
            name: question,
            description: question,
            context: config.openai.context,
            userId: user.id,
        });
        await chatRepository.save(chat);
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
                root: "Failed to create chat",
            },
        }, { status: 500 });
    }
}