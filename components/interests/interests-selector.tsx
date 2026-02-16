"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveInterests } from "@/lib/auth-actions";
import Image from "next/image";

const INTEREST_OPTIONS = [
  "Cine y proyecciones",
  "Festivales culturales",
  "Exhibiciones de Arte",
  "Música",
  "Ciencia y tecnología",
  "Comic-Cons",
  "Conciertos",
  "Fitness y entrenamiento",
  "Partidos y torneos",
  "Conferencias",
  "Hackathons",
  "Catas de vino o cerveza",
  "Festivales gastronómicos",
  "Raves",
  "Gaming y e-sports",
  "Ferias y convenciones",
  "Comidas",
  "Bares & drinks",
];

export function InterestsSelector() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const router = useRouter();

  function toggleInterest(interest: string) {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    );
  }

  async function handleSave() {
    if (selected.length === 0) return;
    setLoading(true);
    setShowLoading(true);

    const result = await saveInterests(selected);
    if (result?.error) {
      setLoading(false);
      setShowLoading(false);
      return;
    }
    // redirect happens in server action
  }

  if (showLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <Image
          src="/images/logo-orange.png"
          alt="Allons"
          width={200}
          height={64}
          className="h-auto w-40 object-contain sm:w-48"
        />
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-balance text-center text-2xl font-bold text-foreground">
            {"Gracias por tu colaboracion!"}
          </h2>
          <p className="text-balance text-center text-sm text-muted-foreground">
            Ahora estamos buscando los eventos mas relevantes para ti.
          </p>
        </div>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-2 pb-6">
        <h1 className="text-2xl font-bold text-foreground">Intereses</h1>
        <p className="text-center text-sm text-muted-foreground">
          Cuéntanos el tipo de eventos que estás buscando
        </p>
      </div>

      <div className="flex flex-1 flex-wrap justify-center gap-3 pb-6">
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                isSelected
                  ? "border-orange-primary bg-orange-primary text-white"
                  : "border-border bg-transparent text-foreground hover:border-white/50"
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-3 pb-6">
        <p className="text-balance text-center text-xs text-muted-foreground">
          ¡Selecciona múltiples géneros para una experiencia personalizada!
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || selected.length === 0}
          className="w-full max-w-[18rem] rounded-2xl bg-orange-primary py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
