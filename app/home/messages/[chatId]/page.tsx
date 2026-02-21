"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getChatWithOther,
  getMessages,
  sendMessage,
  type ChatMessage,
  type ChatWithOther,
} from "@/lib/messages-actions";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  const [chat, setChat] = useState<ChatWithOther | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;
    getChatWithOther(chatId).then(setChat);
    getMessages(chatId).then(setMessages);
  }, [chatId]);

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const { error } = await sendMessage(chatId, text);
    setSending(false);
    if (!error) {
      setInput("");
      const updated = await getMessages(chatId);
      setMessages(updated);
    }
  }

  if (!chat) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Cargando conversación…</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-orange-primary hover:underline"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
        <Link
          href="/home/messages"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
          {chat.otherUser.avatar_url ? (
            <Image
              src={chat.otherUser.avatar_url}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
              unoptimized={chat.otherUser.avatar_url.includes("googleusercontent")}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-orange-primary">
              {(chat.otherUser.name ?? "?")[0]}
            </span>
          )}
        </div>
        <span className="min-w-0 flex-1 truncate font-semibold text-foreground">
          {chat.otherUser.name}
        </span>
      </header>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-4"
      >
        <div className="flex flex-col gap-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_id === chat.otherUser.id ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.sender_id === chat.otherUser.id
                    ? "bg-secondary text-foreground"
                    : "bg-orange-primary text-white"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="flex shrink-0 gap-2 border-t border-border bg-background p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribir"
          className="min-w-0 flex-1 rounded-xl border border-orange-primary/30 bg-white px-4 py-3 text-sm text-black placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="shrink-0 rounded-xl bg-orange-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
