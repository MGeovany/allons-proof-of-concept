"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getChats, type ChatPreview } from "@/lib/messages-actions";

const STORAGE_KEY_READ = "chat_read_";

function isUnread(chat: ChatPreview, currentUserId: string | null): boolean {
  if (!currentUserId || !chat.lastAt || !chat.lastMessageSenderId) return false;
  if (chat.lastMessageSenderId === currentUserId) return false;
  try {
    const readAt = typeof window !== "undefined" ? localStorage.getItem(`${STORAGE_KEY_READ}${chat.id}`) : null;
    return !readAt || new Date(chat.lastAt) > new Date(readAt);
  } catch {
    return true;
  }
}

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "eventos", label: "Eventos" },
  { id: "amigos", label: "Amigos" },
  { id: "archivados", label: "Archivados" },
] as const;

export default function MessagesPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("todos");
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getChats().then((data) => {
      setChats(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, []);

  useEffect(() => {
    const onRead = () => setChats((prev) => [...prev]);
    window.addEventListener("chat-read", onRead);
    return () => window.removeEventListener("chat-read", onRead);
  }, []);

  const filtered =
    search.trim() === ""
      ? chats
      : chats.filter((c) =>
          c.otherUser.name?.toLowerCase().includes(search.trim().toLowerCase()),
        );
  const list = tab === "eventos" || tab === "archivados" ? [] : filtered;

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-24 pt-8">
      <header className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-foreground">
          Mensajes
        </h1>
        <Link
          href="/home/friends"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Users className="h-4 w-4" />
          Ver amigos
        </Link>
      </header>

      <div className="relative mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Búsqueda"
          className="w-full rounded-xl border border-border bg-white px-4 py-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
        />
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-orange-primary text-white"
                : "bg-secondary text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-sm text-muted-foreground">Cargando…</p>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            {tab === "eventos"
              ? "No hay mensajes de eventos."
              : tab === "archivados"
                ? "No hay conversaciones archivadas."
                : "No tienes conversaciones aún. Agrega amigos y empieza a chatear."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {list.map((chat) => (
            <li key={chat.id}>
              <Link
                href={`/home/messages/${chat.id}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 p-3 transition-colors hover:bg-secondary"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                  {chat.otherUser.avatar_url ? (
                    <Image
                      src={chat.otherUser.avatar_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized={chat.otherUser.avatar_url.includes("googleusercontent")}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-orange-primary">
                      {(chat.otherUser.name ?? "?")[0]}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {chat.otherUser.name}
                    {isUnread(chat, currentUserId) && (
                      <span className="ml-1.5 text-xs font-semibold text-orange-primary">New</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {chat.lastMessage ?? "Sin mensajes"}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
