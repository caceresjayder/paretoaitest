import { ChatItem } from "./chat-item"

export default function ChatsContainer() {
    return (
        <div className="pl-2">
            {new Array(20).fill({id: 1, slug: "slug", description: "description", lastMessageDate: "2021-01-01", name: "name"}).map((item, index) => {
                return <ChatItem key={`${item}-${index}`} chatItem={item}/>
            })}
        </div>
    )
}