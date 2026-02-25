"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { FILTER_CITIES, FILTER_EVENT_TYPES } from "@/lib/events";

export function FiltersForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    const c = searchParams.get("city");
    const t = searchParams.get("type");
    setCities(c ? c.split(",").filter(Boolean) : []);
    setTypes(t ? t.split(",").filter(Boolean) : []);
  }, [searchParams]);

  function toggleCity(slug: string) {
    setCities((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function toggleType(slug: string) {
    setTypes((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }

  function handleSave() {
    const params = new URLSearchParams(searchParams.toString());
    if (cities.length) params.set("city", cities.join(","));
    else params.delete("city");
    if (types.length) params.set("type", types.join(","));
    else params.delete("type");
    router.push(`/home?${params.toString()}`);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pb-24 pt-4">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Filtros</h1>
          <p className="text-sm text-muted-foreground">
            Cuéntanos el tipo de eventos que estás buscando
          </p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Ciudades
        </h2>
        <div className="flex flex-wrap gap-2">
          {FILTER_CITIES.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              onClick={() => toggleCity(slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                cities.includes(slug)
                  ? "border-orange-primary bg-orange-primary text-white"
                  : "border-border bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Tipo de Evento
        </h2>
        <div className="flex flex-wrap gap-2">
          {FILTER_EVENT_TYPES.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              onClick={() => toggleType(slug)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                types.includes(slug)
                  ? "border-orange-primary bg-orange-primary text-white"
                  : "border-border bg-secondary text-foreground hover:bg-accent"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          ¡Selecciona múltiples géneros para una experiencia personalizada!
        </p>
      </section>

      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={handleSave}
          className="w-full rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
