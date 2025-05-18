import { chatRepository, messageRepository } from "@/data/Repository";
import { getUser } from "@/lib/dal";
import { OpenAIResponse } from "@/lib/openai";
import { ApiResponse } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { prompt } = await request.json();
    const user = await getUser();
    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: {
            root: "User not found",
          },
        },
        { status: 401 }
      );
    }
    const chat = await chatRepository.findOneBy({ slug, userId: user.id });
    if (!chat) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          data: null,
          error: {
            root: "Chat not found",
          },
        },
        { status: 404 }
      );
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

    const response = await OpenAIResponse(
      chat.context,
      history.map((message) => {
        return {
          role: message.isUser ? "user" : "assistant",
          content: message.content,
        };
      }),
      prompt
    );

    const assistantMessage = messageRepository.create({
      content: response ?? "",
      chatId: chat.id,
      userId: chat.userId,
      isUser: false,
      isAssistant: true,
    });

    await messageRepository.save(assistantMessage);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: [message, assistantMessage],
        error: null,
      },
      { status: 200 }
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.error(error);
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
