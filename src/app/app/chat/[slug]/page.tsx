'use client'
import { ChatInput } from "@/components/chat/chat-input";
import { MessagesContainer } from "@/components/chat/messages-container";
import config from "@/config/config";
import axios from "@/lib/axios";
import { ApiResponse, MessageItem } from "@/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ChatPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [waitingForResponse, setWaitingForResponse] = useState(false);

    const getMessage = async() => {
        try {
            const {data} = await axios.get<ApiResponse>(config.public.api.chat_messages.replace(':chatSlug', slug as string));
            console.log(data)
            if (data.success && data.data && Array.isArray(data.data)) {
                setMessages(data.data);
            } else {
                toast.error('Error fetching messages');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching messages');
        }
    }

    const insertMessages = (messages: MessageItem[], mock: boolean = false) => {
        if (mock) {
            setMessages(prev => [...prev, ...messages]);
        } else {
            setMessages(prev => [...prev.slice(0,-1), ...messages]);
        }
    }

    useEffect(() => {
        getMessage();
    }, [slug]);

  return (
    <div className=" w-full overflow-hidden p-4">
      <MessagesContainer chatSlug={slug} messages={messages} waitingForResponse={waitingForResponse}/>
      <ChatInput chatSlug={slug} insertMessages={insertMessages} setWaitingForResponse={setWaitingForResponse} waitingForResponse={waitingForResponse}/>
    </div>
  );
}
