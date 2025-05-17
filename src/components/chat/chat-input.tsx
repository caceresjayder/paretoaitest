'use client'
import axios from "@/lib/axios";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import config from "@/config/config";
import { toast } from "sonner";
import { MessageItem } from "@/types";
import { useState } from "react";

export function ChatInput({ chatSlug, insertMessages, setWaitingForResponse, waitingForResponse }: { chatSlug: string, insertMessages: (messages: MessageItem[], mock: boolean) => void, setWaitingForResponse: (waiting: boolean) => void, waitingForResponse: boolean }) {
    const [prompt, setPrompt] = useState('');

    const setLastMessage = (message: string) => {
        const lastMessage: MessageItem = {
            id: Number.MAX_SAFE_INTEGER,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            content: message,
            isUser: true,
            isAssistant: false,
            chatId: 1,
        }
        insertMessages([lastMessage], true);
        setPrompt('');
    }

    const onSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const prompt = formData.get('prompt') as string;
        try {
            setLastMessage(prompt);
            setWaitingForResponse(true);
            const {data} = await axios.post(config.public.api.messages.replace(':chatSlug', chatSlug), {
                prompt
            });
            if (data.success && data.data && Array.isArray(data.data)) {
                insertMessages(data.data, false);
            } else {
                toast.error('Error sending message');
            }
        } catch(error) {
            console.error(error);
        } finally {
            setWaitingForResponse(false);
        }
    }
    return (
        <Card className="p-4 my-4">
            <form onSubmit={onSubmit}>
            <div className="flex w-full items-center space-x-2">
                <Input
                    placeholder="Ask anything..."
                    name="prompt"
                    className="flex-1"
                    autoComplete="off"
                    onChange={(e) => setPrompt(e.target.value)}
                    value={prompt}
                    disabled={waitingForResponse}
                />
                <Button type="submit" disabled={waitingForResponse}>
                    Send
                </Button>
            </div>
            </form>

        </Card>
    )
}