import { MessageItem as MessageItemType } from "@/types";
import { Card, CardContent } from "../ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function MessageItem({message}: {message: MessageItemType}) {
    return (
        <div className={`w-full p-4 flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <Card className={`w-fit px-3 py-2  ${message.isAssistant ? 'border-none shadow-none' : ''}`}>
                <CardContent>
                <p className="text-sm pr-2">{message.content}</p>
                <p className="text-xs text-muted-foreground">{dayjs(message.createdAt).fromNow()}</p>
                </CardContent>
            </Card>
        </div>
    )
}