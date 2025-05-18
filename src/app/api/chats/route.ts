import config from "@/config/config";
import { chatRepository, messageRepository } from "@/data/Repository";
import { getUser } from "@/lib/dal";
import { OpenAIResponse } from "@/lib/openai";
import { generateUniqueUUID } from "@/lib/utils";
import { Message } from "@/models/Message";
import { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const user = await getUser();
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: {
            root: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }
    // get all chats for the user and the last message timestamp of each chat
    const chats = await chatRepository.find({ where: {userId: user.id}, order: { updatedAt: 'desc' } });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: chats,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        data: null,
        error: {
          root: "Server error, please try again later",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: {
            root: "Unauthorized",
          },
        },
        { status: 401 }
      );
    }
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: { root: "Prompt is required" },
        }, { status: 422 } );
    }

    const chat = chatRepository.create({
      name: prompt.substring(0, 20),
      slug: generateUniqueUUID(),
      description: prompt.substring(0, 100),
      context: config.openai.context,
      userId: user.id,
    });
    const savedChat = await chatRepository.save(chat);

    const message = messageRepository.create({
      content: prompt,
      chatId: savedChat.id,
      userId: user.id,
      isUser: true,
      isAssistant: false,
    });
    await messageRepository.save(message);

    const response = await OpenAIResponse(chat.context, [], prompt);

    const assistantMessage = messageRepository.create({
      content: response || "I'm sorry, I can't answer that question.",
      chatId: savedChat.id,
      userId: user.id,
      isUser: false,
      isAssistant: true,
    });

    await messageRepository.save(assistantMessage);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: savedChat,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        data: null,
        error: {
          root: "Server error, please try again later",
        },
      },
      { status: 500 }
    );
  }
}
