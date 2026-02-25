"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, UserPlus, MessageCircle, MoreVertical } from "lucide-react";
import { getMyFriends, type FriendProfile } from "@/lib/friends-actions";
import { getOrCreateChat } from "@/lib/messages-actions";
import { useRouter } from "next/navigation";

export default function FriendsPage() {
  const router = useRouter();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"personas" | "negocios">("personas");

  useEffect(() => {
    getMyFriends().then(setFriends).finally(() => setLoading(false));
  }, []);

  const filtered =
    search.trim() === ""
      ? friends
      : friends.filter((f) =>
          f.name?.toLowerCase().includes(search.trim().toLowerCase()),
        );

  async function openChat(friendId: string) {
    const { chatId, error } = await getOrCreateChat(friendId);
    if (error) return;
    if (chatId) router.push(`/home/messages/${chatId}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-24 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-foreground">Amigos</h1>
        <Link
          href="/home/friends/add"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Agregar amigo"
        >
          <UserPlus className="h-6 w-6" />
        </Link>
      </header>

      <div className="relative mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Búsqueda"
          className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
        />
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
      </div>

      <div className="mb-4 flex gap-2">
        {(["personas", "negocios"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              tab === t ? "bg-orange-primary text-white" : "bg-secondary text-foreground"
            }`}
          >
            {t === "personas" ? "Personas" : "Negocios"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Cargando…</p>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
          <p className="text-sm text-foreground">
            {search.trim() ? "No hay coincidencias." : "Aún no tienes amigos agregados."}
          </p>
          {!search.trim() && (
            <Link
              href="/home/friends/add"
              className="rounded-xl bg-orange-primary px-4 py-2.5 text-sm font-semibold text-white"
            >
              Agregar amigo
            </Link>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {filtered.map((friend) => (
            <li
              key={friend.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 p-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                {friend.avatar_url ? (
                  <Image
                    src={friend.avatar_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized={friend.avatar_url.includes("googleusercontent")}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-orange-primary">
                    {(friend.name ?? "?")[0]}
                  </span>
                )}
              </div>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {friend.name}
              </span>
              <button
                type="button"
                onClick={() => openChat(friend.id)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent"
                aria-label="Enviar mensaje"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent"
                aria-label="Más opciones"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
