import { MessageItem as MessageItemType } from "@/types";
import { Card, CardContent } from "../ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

dayjs.extend(relativeTime);

export function MessageItem({message}: {message: MessageItemType}) {
    return (
        <div className={`w-full p-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <Card className={`w-fit px-3 py-2  ${message.isAssistant ? 'border-none shadow-none' : ''}`}>
                <CardContent>
                <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
                <p className="text-xs text-muted-foreground">{dayjs(message.createdAt).fromNow()}</p>
                </CardContent>
            </Card>
        </div>
    )
}