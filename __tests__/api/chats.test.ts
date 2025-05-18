/**
 * @jest-environment node
 */

import { GET as GetChatsTest, POST as PostChatTest } from '@/app/api/chats/route';
import { chatRepository, messageRepository, userRepository } from '@/data/Repository';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getUser } from '@/lib/dal';
import config from '@/config/config';
import { OpenAIResponse } from '@/lib/openai';

const mockChats = [
    {
        id: 1,
        name: 'test',
        lastMessageAt: '2025-01-01 12:00:00',
        context: config.openai.context,
        description: 'test',
        slug: 'test',
        userId: 1,
    },
]

jest.mock('@/lib/utils', () => ({
    generateUniqueUUID: jest.fn().mockReturnValue('test-uuid'),
}));

jest.mock('@/lib/openai', () => ({
    OpenAIResponse: jest.fn(),
}));

jest.mock('@/lib/dal', () => ({
    getUser: jest.fn(),
    verifySession: jest.fn(),
}));

jest.mock('@/data/Repository', () => ({
    userRepository: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
    },
    chatRepository: {
        find: jest.fn(),
        findBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    },
    messageRepository: {
        create: jest.fn(),
        save: jest.fn(),
    },
}));

const mockUser = {
    id: 2,
    email: 'test@test.com',
    name: 'test',
}

describe('Chats Endpoints test', () => {
    let req: NextRequest;
    let res: NextResponse;
    beforeEach(() => {
        jest.clearAllMocks();
        // jest.resetAllMocks();
    });

    it('user can get chats', async () => {
        (userRepository.findOneBy as jest.Mock).mockResolvedValueOnce(mockUser);
        (chatRepository.find as jest.Mock).mockResolvedValueOnce(mockChats);
        (getUser as jest.Mock).mockResolvedValueOnce(mockUser);

        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'GET',
        });

        const response = await GetChatsTest(req);
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            data: mockChats,
            error: null,
            success: true,
        });
        expect(getUser).toHaveBeenCalledTimes(1);
        expect(chatRepository.find).toHaveBeenCalledTimes(1);
        expect(chatRepository.find).toHaveBeenCalledWith({
            order: { updatedAt: 'desc' },
            where: { userId: mockUser.id },
        });
        
    });

    it("user cannot get chats if not authenticated", async () => {
        (getUser as jest.Mock).mockResolvedValueOnce(null);

        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'GET',
        });

        const response = await GetChatsTest(req);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Unauthorized' },
            success: false,
        });
        expect(getUser).toHaveBeenCalledTimes(1);

    });

    it("generic error reporting", async () => {
        (getUser as jest.Mock).mockResolvedValue(mockUser);
        (chatRepository.find as jest.Mock).mockRejectedValue(new Error('Database error'));

        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'GET',
        });

        const response = await GetChatsTest(req);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Server error, please try again later' },
            success: false,
        });
        
    });

    it("user cannot create chats if not authenticated", async () => {
        (getUser as jest.Mock).mockResolvedValueOnce(null);

        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'POST',
        });

        const response = await PostChatTest(req);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Unauthorized' },
            success: false,
        });
        expect(getUser).toHaveBeenCalledTimes(1);

    });


    it("user can create a chat", async () => {

        const mockUserMessage = {
            id: 1,
            content: 'test',
            chatId: 1,
            userId: 2,
            isUser: true,
            isAssistant: false,
        }
        
        const mockAssistantMessage = {
            id: 2,
            content: 'test',
            chatId: 1,
            userId: 2,
            isUser: false,
            isAssistant: true,
        };

        (getUser as jest.Mock).mockResolvedValue(mockUser);
        (chatRepository.create as jest.Mock).mockReturnValueOnce(mockChats[0]);
        (chatRepository.save as jest.Mock).mockResolvedValueOnce(mockChats[0]);

        (messageRepository.create as jest.Mock)
        .mockReturnValueOnce(mockUserMessage)
        .mockReturnValueOnce(mockAssistantMessage);
        (messageRepository.save as jest.Mock)
        .mockReturnValueOnce(mockUserMessage)
        .mockReturnValueOnce(mockAssistantMessage);
        (OpenAIResponse as jest.Mock).mockResolvedValue(mockAssistantMessage.content);


        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'POST',
            body: JSON.stringify({
                prompt: mockUserMessage.content,
            }),
        });

        const response = await PostChatTest(req);
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({
            data: mockChats[0],
            error: null,
            success: true,
        });
        
        expect(chatRepository.create).toHaveBeenCalledWith({
            name: mockUserMessage.content.substring(0, 20),
            slug: 'test-uuid',
            description: mockUserMessage.content.substring(0, 100),
            context: mockChats[0].context,
            userId: mockUser.id,
        });
        
        expect(chatRepository.save).toHaveBeenNthCalledWith(1, mockChats[0]);

        expect(messageRepository.create).toHaveBeenNthCalledWith(1,{
            content: mockUserMessage.content,
            chatId: mockChats[0].id,
            userId: mockUser.id,
            isUser: true,
            isAssistant: false,
        });
        expect(messageRepository.create).toHaveBeenNthCalledWith(2,{
            content: mockAssistantMessage.content,
            chatId: mockChats[0].id,
            userId: mockUser.id,
            isUser: false,
            isAssistant: true,
        });
        expect(messageRepository.save).toHaveBeenNthCalledWith(1, mockUserMessage);
        expect(messageRepository.save).toHaveBeenNthCalledWith(2, mockAssistantMessage);

        // expect(await response.json()).toEqual({
        //     data: mockChats[0],
        //     error: null,
        //     success: true,
        // });
    });

    it("user cannot create a chat if the prompt is empty", async () => {
        (getUser as jest.Mock).mockResolvedValue(mockUser);

        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await PostChatTest(req);
        expect(response.status).toBe(422);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Prompt is required' },
            success: false,
        });
        expect(getUser).toHaveBeenCalledTimes(1);
        
    });

    it("generic error reporting on post endpoint", async () => {
        (getUser as jest.Mock).mockResolvedValue(mockUser);
        (chatRepository.create as jest.Mock).mockRejectedValue(new Error('Database error'));

        req = new NextRequest('http://localhost:3000/api/chats', {
            method: 'POST',
        });

        const response = await PostChatTest(req);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Server error, please try again later' },
            success: false,
        });
        expect(getUser).toHaveBeenCalledTimes(1);
    });
});