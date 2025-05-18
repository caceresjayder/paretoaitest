'use client'
import React from 'react'
import { Button } from '../ui/button';
import { Inbox } from 'lucide-react';
import { useRouter } from 'next/navigation';

const OpenNewChatButton = () => {
  const router = useRouter();
  return (
    <Button variant="ghost" size="icon" title='Start a new chat' onClick={() => {
        router.replace('/app');
      }}>
        <Inbox className="size-4" />
      </Button>
  )
}

export default OpenNewChatButton
