"use client";
import { MessageItem } from "@/types";
import { MessageItem as MessageItemComponent } from "./message-item";
import { useEffect, useRef } from "react";
import { ChatInput } from "./chat-input";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

export function MessagesContainer({ chatSlug, messages }: { chatSlug: string, messages: MessageItem[] }) {
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
      </ScrollArea>

  );
}
