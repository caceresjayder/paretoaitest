import { ChatInput } from "@/components/chat/chat-input";
import { MessagesContainer } from "@/components/chat/messages-container";
import { MessageItem } from "@/types";

export default async function ChatPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const messages: MessageItem[] = Array.from({ length: 50 }, (_, index) => ({
        id: index,
        content: `Message ${index + 1}`,
        createdAt: new Date().toISOString(),
        isUser: index % 2 === 0,
        isAssistant: index % 2 !== 0,
        chatId: 1,
        updatedAt: new Date().toISOString(),
      })).toReversed();

    const reloadMessages = () => {
        console.log("reloadMessages");
    }

  return (
    <div className=" w-full overflow-hidden p-4">
      <MessagesContainer chatSlug={slug} messages={messages} />
      <ChatInput chatSlug={slug} />
    </div>
  );
}
