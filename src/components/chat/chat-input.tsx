'use client'
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";

export function ChatInput({ chatSlug }: { chatSlug: string }) {
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const message = formData.get('message') as string;
        console.log(message);
    }
    return (
        <Card className="p-4 my-4">
            <form onSubmit={onSubmit}>
            <div className="flex w-full items-center space-x-2">
                <Input
                    placeholder="Ask anything..."
                    name="message"
                    className="flex-1"
                />
                <Button type="submit">
                    Send
                </Button>
            </div>
            </form>

        </Card>
    )
}