"use client";
import { MessageItem } from "@/types";
import { MessageItem as MessageItemComponent } from "./message-item";
import { useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2 } from "lucide-react";

export function MessagesContainer({ chatSlug, messages, waitingForResponse }: { chatSlug: string, messages: MessageItem[], waitingForResponse: boolean }) {
  const bottomMessageContainer = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages are updated
  useEffect(() => {
    if (bottomMessageContainer.current) {
      bottomMessageContainer.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
      <ScrollArea className="h-[calc(100vh-200px)] inset-0">
            {messages.map((message) => (
              <MessageItemComponent
                key={`${chatSlug}-${message.id}`}
                message={message}
              />
            ))}
        <div id="bottom-message-container" ref={bottomMessageContainer} />
        {waitingForResponse && <div className="flex justify-start items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>}
      </ScrollArea>

  );
}
