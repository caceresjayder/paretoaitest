'use client'
import type { ChatItem } from "@/types";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";

export function ChatItem({ chatItem, onDelete }: {chatItem: ChatItem, onDelete: () => void}) {
  const {slug} = useParams();
  const router = useRouter();
  const deleteChat = async () => {
    try {
      const res = await fetch(`/api/chats/${chatItem.slug}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Chat deleted");
        onDelete();
        router.replace('/app');
      } else {
        toast.error("Failed to delete chat");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to delete chat");
    } 
  };
  return (
    <div className="relative max-w-[250px]">
    <Link
      href={`/app/chat/${chatItem.slug}`}
      className={`flex flex-col items-start gap-2 whitespace-wrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${slug === chatItem.slug ? "bg-sidebar-accent" : ""}`}
      >
      <div className="flex w-full items-center gap-2 line-clamp-1">
        <span>{chatItem.name}...</span>
      </div>
      <span className="line-clamp-2 whitespace-break-spaces text-xs">
        {chatItem.description}
      </span>
      <span className="ml-auto text-xs">{chatItem.lastMessageDate}</span>

    </Link>
    <div className="absolute top-0 right-0">
      <Button variant="ghost" size="icon" title="Delete chat" onClick={deleteChat}>
        <Trash className="size-4" />
      </Button>
    </div>
      </div>
  );
}
