"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Instagram, Mail, MessageCircle } from "lucide-react";
import { getEventById } from "@/lib/events";

function waLinkFromNumber(raw: string) {
  // Figma usa formato local (ej. 9695-0443). Asumimos Honduras +504.
  const digits = raw.replace(/\D/g, "");
  const full = digits.length === 8 ? `504${digits}` : digits;
  return `https://wa.me/${full}`;
}

export default function ContactarProveedorPage() {
  const params = useParams();
  const router = useRouter();
  const event = getEventById(params.id as string);

  if (!event) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">Evento no encontrado</p>
        <Link
          href="/home"
          className="rounded-2xl bg-orange-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const instagram = event.providerContacts?.instagram;
  const whatsapp = event.providerContacts?.whatsapp;
  const email = event.providerContacts?.email;

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(120% 70% at 50% 100%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 60%)",
        }}
        aria-hidden
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-center text-lg font-semibold text-foreground">
          Contactar Proveedor
        </h1>
        <div className="h-10 w-10" aria-hidden />
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-6 pt-10">
        <h2 className="text-xl font-semibold text-foreground">Canales</h2>

        <div className="mt-8 flex flex-col gap-6">
          {instagram && (
            <a
              href={`https://instagram.com/${instagram}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 text-foreground"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm">
                Instagram: <span className="text-muted-foreground">{instagram}</span>
              </span>
            </a>
          )}

          {whatsapp && (
            <a
              href={waLinkFromNumber(whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 text-foreground"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm">
                Whatsapp: <span className="text-muted-foreground">{whatsapp}</span>
              </span>
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-4 text-foreground"
            >
              <Mail className="h-5 w-5" />
              <span className="text-sm">
                <span className="text-muted-foreground">{email}</span>
              </span>
            </a>
          )}
        </div>
      </main>
    </div>
  );
}

