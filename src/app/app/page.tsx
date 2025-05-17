'use client'
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const AppPage = () => {
    const router = useRouter();
    const [waitingForResponse, setWaitingForResponse] = useState(false);
    const onSubmit =async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const prompt = formData.get('prompt') as string;
        try {
            setWaitingForResponse(true);
            const {data} = await axios.post<ApiResponse>('/api/chats', {
                prompt
            });
            if (data.success && data.data) {
                router.push(`/app/chat/${data.data.slug}`);
            } else {
                toast.error('Error creating chat');
            }
        } catch (error) {
            console.error(error);
            toast.error('Eerror creating chat');
        } finally {
            setWaitingForResponse(false);
        }
    }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>
            <h1>Start a new chat</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <form className="flex gap-2" onSubmit={onSubmit}>
                <Input name="prompt" placeholder="Do you know the answer to life, the universe and everything?" className="placeholder:text-xs" autoComplete="off" disabled={waitingForResponse} />
                <Button disabled={waitingForResponse}>
                    {waitingForResponse ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send />} Ask
                </Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppPage;
