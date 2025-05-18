/**
 * @jest-environment node
 */

import { getUser } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import { GET as GetMessagesFromChat, POST as SendMessageToChat, DELETE as DeleteChat } from "@/app/api/chats/[slug]/route";
import { NextApiRequest } from "next";
import { createMocks } from "node-mocks-http";
import { chatRepository, messageRepository } from "@/data/Repository";
import config from "@/config/config";
import { OpenAIResponse } from "@/lib/openai";

jest.mock("@/lib/openai", () => ({
  OpenAIResponse: jest.fn(),
}));

jest.mock("@/lib/dal", () => ({
  getUser: jest.fn().mockResolvedValue({
    id: 2,
    email: "test@test.com",
    name: "test",
  }),
  verifySession: jest.fn(),
}));

jest.mock("@/data/Repository", () => ({
  userRepository: {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  },
  chatRepository: {
    findBy: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  messageRepository: {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockMessages = [
  {
    id: 1,
    content: "Hello, how are you?",
    isAssistant: false,
    isUser: true,
    createdAt: "2025-01-01 10:00:00",
    updatedAt: "2025-01-01 10:00:00",
  },
  {
    id: 2,
    content: "I am fine, thank you!",
    isAssistant: true,
    isUser: false,
    createdAt: "2025-01-01 10:00:01",
    updatedAt: "2025-01-01 10:00:01",
  },
];

const mockChat = [
  {
    id: 1,
    name: "test",
    context: config.openai.context,
    description: "test",
    slug: "slug-test",
    userId: 2,
  },
];

describe("Messages endpoints tests", () => {
  let req: NextRequest;
  let res: NextResponse;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("user can't see messages without being logged in", async () => {
    (getUser as jest.Mock).mockReturnValueOnce(null);

    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "GET"
    })

    // const params = new Promise<{ slug: string }>(()=>({ slug: 'slug-test' }));
    res = await GetMessagesFromChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: "Unauthorized",
      },
    });

    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it("message endpoint returns 400 if slug is not a string", async () => {
    req = new NextRequest('http://localhost:3000/api/chats/[212]/messages', {
        method: "GET"
    });

    res = await GetMessagesFromChat(req, { params: Promise.resolve({ slug: ['slug-test'] as any })});

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: "Invalid slug",
      },
    });
  });

  it("error message is returned if chat is not found", async () => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "GET"
    });

    (chatRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null);

    res = await GetMessagesFromChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: "Chat not found",
      },
    });

    expect(chatRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(chatRepository.findOneBy).toHaveBeenCalledWith({
      slug: "slug-test",
      userId: 2
    });
  });

  it("users cant see messages chat messages", async () => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "GET"
    });

    (chatRepository.findOneBy as jest.Mock).mockResolvedValueOnce(mockChat[0]);
    (messageRepository.find as jest.Mock).mockResolvedValueOnce(mockMessages);

    res = await GetMessagesFromChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: mockMessages,
      error: null,
    });

    expect(chatRepository.findOneBy).toHaveBeenCalledWith({
      slug: "slug-test",
      userId: 2,
    });
    expect(messageRepository.find).toHaveBeenCalledWith({
      where: {
        chatId: mockChat[0].id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        content: true,
        isAssistant: true,
        isUser: true,
      },
      take: 10,
    });
  });

  it('generic error in get message endpoint', async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "GET"
    });

    (chatRepository.findOneBy as jest.Mock).mockRejectedValueOnce(new Error('Generic error'));

    res = await GetMessagesFromChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Failed to fetch chat',
      },
    });

    expect(chatRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(chatRepository.findOneBy).toHaveBeenCalledWith({
      slug: 'slug-test',
      userId: 2
    });
  });

  it("users can't send messages if slug format is invalid", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/[123]/messages', {
        method: "POST",
        body: JSON.stringify({
            prompt: 'Hello, how are you?'
        })
    });

    res = await SendMessageToChat(req, { params: Promise.resolve({ slug: ['slug-test'] as any })});

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Invalid slug',
      },
    });
  });

  it("user can't send messages if prompt is not a string or is empty", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "POST",
        body: JSON.stringify({
            prompt: ''
        })
    });

    res = await SendMessageToChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Invalid prompt',
      },
    });
  });

  it("user can't send messages if is not logged in", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "POST",
        body: JSON.stringify({
            prompt: 'Hello, how are you?'
        })
    });

    (getUser as jest.Mock).mockReturnValueOnce(null);

    res = await SendMessageToChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'User not found',
      },
    });

    expect(getUser).toHaveBeenCalledTimes(1);
  });

  it("user can't send messages if chat is not found", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "POST",
        body: JSON.stringify({
            prompt: 'Hello, how are you?'
        })
    });

    (chatRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null);

    res = await SendMessageToChat(req, { params: Promise.resolve({ slug: 'slug-test' })});

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Chat not found',
      },
    });

    expect(chatRepository.findOneBy).toHaveBeenCalledTimes(1);
  });

  it("user can send messages to a chat", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "POST",
        body: JSON.stringify({
            prompt: 'Hello, how are you?'
        })
    });

    (chatRepository.findOneBy as jest.Mock).mockResolvedValueOnce(mockChat[0]);
    (messageRepository.find as jest.Mock).mockResolvedValueOnce(mockMessages);
    (messageRepository.create as jest.Mock)
        .mockReturnValueOnce(mockMessages[0])
        .mockReturnValueOnce(mockMessages[1]);
        
    (messageRepository.save as jest.Mock)
        .mockResolvedValueOnce(mockMessages[0])
        .mockResolvedValueOnce(mockMessages[1]);

    (OpenAIResponse as jest.Mock).mockResolvedValueOnce("I am fine, thank you!");

    (chatRepository.update as jest.Mock).mockResolvedValueOnce(true);



    res = await SendMessageToChat(req, { params: Promise.resolve({ slug: 'slug-test' }) });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: mockMessages[1],
      error: null,
    });

    expect(chatRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(chatRepository.findOneBy).toHaveBeenCalledWith({
      slug: 'slug-test',
      userId: 2
    });

    expect(messageRepository.find).toHaveBeenCalledTimes(1);
    expect(messageRepository.find).toHaveBeenCalledWith({
      where: {
        chatId: mockChat[0].id,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        content: true,
        isAssistant: true,
        isUser: true,
      },
      take: 10,
    });

    expect(messageRepository.create).toHaveBeenCalledTimes(2);
    
    expect(messageRepository.create).toHaveBeenNthCalledWith(1, {
      content: 'Hello, how are you?',
      chatId: mockChat[0].id,
      userId: 2,
      isUser: true,
      isAssistant: false,
    });

    expect(messageRepository.create).toHaveBeenNthCalledWith(2, {
      content: 'I am fine, thank you!',
      chatId: mockChat[0].id,
      userId: 2,
      isUser: false,
      isAssistant: true,
    });

    expect(messageRepository.save).toHaveBeenCalledTimes(2);

    expect(messageRepository.save).toHaveBeenNthCalledWith(1, mockMessages[0]);
    expect(messageRepository.save).toHaveBeenNthCalledWith(2, mockMessages[1]);

    expect(OpenAIResponse).toHaveBeenCalledTimes(1);
    expect(OpenAIResponse).toHaveBeenCalledWith(mockChat[0].context, mockMessages.map((message) => ({
      role: message.isUser ? "user" : "assistant",
      content: message.content,
    })), 'Hello, how are you?');

    expect(chatRepository.update).toHaveBeenCalledTimes(1);
    expect(chatRepository.update).toHaveBeenCalledWith(mockChat[0].id, { updatedAt: expect.any(Date) });
  });

  it("generic error in send message endpoint", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test/messages', {
        method: "POST",
        body: JSON.stringify({
            prompt: 'Hello, how are you?'
        })
    });

    (chatRepository.findOneBy as jest.Mock).mockRejectedValueOnce(new Error('Generic error'));

    res = await SendMessageToChat(req, { params: Promise.resolve({ slug: 'slug-test' }) });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Server error, please try again later',
      },
    });
    
    
  });

  it("user can delete a chat", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test', {});

    (chatRepository.findOneBy as jest.Mock).mockResolvedValueOnce(mockChat[0]);
    (messageRepository.delete as jest.Mock).mockResolvedValueOnce(true);

    res = await DeleteChat(req, { params: Promise.resolve({ slug: 'slug-test' }) });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      success: true,
      data: null,
      error: null,
    });
    
    expect(chatRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(chatRepository.findOneBy).toHaveBeenCalledWith({
      slug: 'slug-test',
      userId: 2
    });
    
  });

  it("user can't delete a chat if slug is not a string", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/[123]', {
        method: "DELETE"
    });

    res = await DeleteChat(req, { params: Promise.resolve({ slug: ['123'] }) as any });

    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Invalid slug',
      },
    });
    
  });

  it("user can't delete a chat if is not logged in", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test', {
        method: "DELETE"
    });

    (getUser as jest.Mock).mockReturnValueOnce(null);

    res = await DeleteChat(req, { params: Promise.resolve({ slug: 'slug-test' }) });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'User not found',
      },
    });

    expect(getUser).toHaveBeenCalledTimes(1);
  });
  
  it("user can't delete a chat if chat is not found", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test', {
        method: 'DELETE',
    });

    (chatRepository.findOneBy as jest.Mock).mockResolvedValueOnce(null);

    res = await DeleteChat(req, { params: Promise.resolve({ slug: 'slug-test' }) });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Chat not found',
      },
    });

    expect(chatRepository.findOneBy).toHaveBeenCalledTimes(1);
    expect(chatRepository.findOneBy).toHaveBeenCalledWith({
      slug: 'slug-test',    
      userId: 2
    });
    
  });

  it("generic error in delete chat endpoint", async() => {
    req = new NextRequest('http://localhost:3000/api/chats/slug-test', {
        
    });

    (getUser as jest.Mock).mockRejectedValueOnce(new Error('Generic error'));

    res = await DeleteChat(req, { params: Promise.resolve({ slug: 'slug-test' }) });

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      success: false,
      data: null,
      error: {
        root: 'Failed to delete chat',
      },
    });
    
  });   
});