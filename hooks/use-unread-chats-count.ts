"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getChats, type ChatPreview } from "@/lib/messages-actions";

const STORAGE_KEY_READ = "chat_read_";

function isUnread(chat: ChatPreview, currentUserId: string | null): boolean {
  if (!currentUserId || !chat.lastAt || !chat.lastMessageSenderId) return false;
  if (chat.lastMessageSenderId === currentUserId) return false;
  try {
    const readAt =
      typeof window !== "undefined" ? localStorage.getItem(`${STORAGE_KEY_READ}${chat.id}`) : null;
    return !readAt || new Date(chat.lastAt) > new Date(readAt);
  } catch {
    return true;
  }
}

export function useUnreadChatsCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function update() {
      Promise.all([getChats(), createClient().auth.getUser()]).then(([chats, { data: { user } }]) => {
        const n = chats.filter((c) => isUnread(c, user?.id ?? null)).length;
        setCount(n);
      });
    }
    update();
    window.addEventListener("chat-read", update);
    return () => window.removeEventListener("chat-read", update);
  }, []);

  return count;
}
