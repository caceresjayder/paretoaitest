'use client'
import { useEffect, useState } from "react";
import { ChatItem } from "./chat-item"
import { toast } from "sonner";
import axios from "@/lib/axios";
import { Chat } from "@/models/Chat";
import { Loader2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useParams } from "next/navigation";

dayjs.extend(relativeTime);

export default function ChatsContainer() {
    const {slug} = useParams();
    const [chats, setChats] = useState<Chat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const getChats = async() => {
        try {
            setIsLoading(true);
            const response = await axios.get('/api/chats');
            if(Array.isArray(response?.data?.data)) {
                console.log(response.data.data);
                setChats(response.data.data);
            } else {
                toast.error('Error fetching chats');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error fetching chats');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getChats();
    }, [slug]);

    return (
        <div className="pl-2">
            {isLoading && <div className="flex justify-center items-center h-full">
                <Loader2 className="w-4 h-4 animate-spin" />
            </div>}
            {!isLoading &&chats.length === 0 && <div className="flex justify-center items-center h-full">
                <p className="text-sm text-gray-500">No chats found</p>
            </div>}
            {chats.map((item, index) => {
                return <ChatItem key={`${item}-${index}`} chatItem={{
                    id: item.id,
                    slug: item.slug,
                    description: item.description,
                    lastMessageDate: dayjs(item.updatedAt).fromNow(),
                    name: item.name
                }}/>
            })}
        </div>
    )
}