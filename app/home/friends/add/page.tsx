"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { getUsersToAdd, addFriend, type FriendProfile } from "@/lib/friends-actions";

export default function AddFriendPage() {
  const router = useRouter();
  const [users, setUsers] = useState<FriendProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    getUsersToAdd(search || undefined).then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, [search]);

  async function handleAdd(userId: string) {
    setAddingId(userId);
    const { error } = await addFriend(userId);
    setAddingId(null);
    if (!error) router.push("/home/friends");
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
        <h1 className="text-lg font-bold text-foreground">Agregar amigo</h1>
        <div className="w-10" aria-hidden />
      </header>

      <div className="relative mb-6">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Búsqueda por nombre o usuario"
          className="w-full rounded-xl border border-border bg-input px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
        />
        <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Cargando…</p>
      ) : users.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No hay usuarios para agregar o ya son tus amigos.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/60 p-3"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                    unoptimized={user.avatar_url.includes("googleusercontent")}
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-orange-primary">
                    {(user.name ?? "?")[0]}
                  </span>
                )}
              </div>
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {user.name}
              </span>
              <button
                type="button"
                onClick={() => handleAdd(user.id)}
                disabled={addingId === user.id}
                className="shrink-0 rounded-xl bg-orange-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {addingId === user.id ? "…" : "Agregar"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
