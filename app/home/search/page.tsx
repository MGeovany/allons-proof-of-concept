"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft } from "lucide-react";

const TRENDING = [
  "color run",
  "feria",
  "ibiza rave",
  "latin mafia",
  "wembley",
  "teatro",
];

const DEFAULT_HISTORY = [
  "barre",
  "running",
  "perla negra",
  "rufus du sol",
  "sanguicho",
  "centro cultural",
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>(DEFAULT_HISTORY);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("allons-search-history");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed) && parsed.length > 0) setHistory(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const next = [...new Set([q, ...history])].slice(0, 10);
    try {
      localStorage.setItem("allons-search-history", JSON.stringify(next));
    } catch {
      // ignore
    }
    router.push(`/home?q=${encodeURIComponent(q)}`);
  }

  function handlePillClick(term: string) {
    setQuery(term);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-24 pt-4">
      <header className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div className="flex flex-1 justify-center">
          <Image
            src="/images/logo-orange.png"
            alt="Allons"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="w-10" aria-hidden />
      </header>

      <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Búsqueda"
            autoFocus
            className="w-full rounded-xl border border-border bg-white px-4 py-3.5 pr-12 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-orange-primary focus:outline-none focus:ring-2 focus:ring-orange-primary/30"
            aria-label="Buscar eventos"
          />
          <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
        </div>
      </form>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Tu historial
        </h2>
        <div className="flex flex-wrap gap-2">
          {history.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handlePillClick(term)}
              className="rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Búsquedas en tendencia
        </h2>
        <div className="flex flex-wrap gap-2">
          {TRENDING.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handlePillClick(term)}
              className="rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent"
            >
              {term}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
