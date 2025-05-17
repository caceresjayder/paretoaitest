import type { ChatItem } from "@/types";

export function ChatItem({ chatItem}: {chatItem: ChatItem}) {
  return (
    <a
      href={`/app/chat/${chatItem.slug}`}
      className="flex flex-col items-start gap-2 whitespace-nowrap border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <div className="flex w-full items-center gap-2">
        <span>{chatItem.name}</span>{" "}
        <span className="ml-auto text-xs">{chatItem.lastMessageDate}</span>
      </div>
      <span className="line-clamp-2 w-[260px] whitespace-break-spaces text-xs">
        {chatItem.description}
      </span>
    </a>
  );
}
