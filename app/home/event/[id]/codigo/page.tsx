"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Info } from "lucide-react";
import { getEventById } from "@/lib/events";
import { getReservationForEvent } from "@/lib/reservation-actions";
import type { ReservationRow } from "@/lib/reservation-actions";

export default function CodigoAccesoPage() {
  const params = useParams();
  const router = useRouter();
  const event = getEventById(params.id as string);
  const [reservation, setReservation] = useState<
    ReservationRow | null | undefined
  >(undefined);

  useEffect(() => {
    if (!event?.id) return;
    getReservationForEvent(event.id).then(setReservation);
  }, [event?.id]);

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

  if (reservation === undefined) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">
          No tienes reserva para este evento
        </p>
        <Link
          href={`/home/event/${event.id}`}
          className="rounded-2xl bg-orange-primary px-6 py-2.5 text-sm font-semibold text-white"
        >
          Ver evento
        </Link>
      </div>
    );
  }

  const ticketHolderName = reservation.ticket_holder_name ?? "Invitado";
  const quantity = reservation.quantity ?? 1;
  const quantityLabel =
    quantity === 1 ? "1 entrada" : `${quantity} entradas`;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      {/* Fondo con gradiente suave como el diseño */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 55%), radial-gradient(120% 70% at 50% 100%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.00) 60%)",
        }}
        aria-hidden
      />

      <header className="relative z-10 flex shrink-0 items-center justify-between px-4 pt-4 pb-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-center text-lg font-bold leading-tight text-foreground">
          <span className="block">Código de</span>
          <span className="block">Acceso</span>
        </h1>
        <Link
          href={`/home/event/${event.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black"
          aria-label="Ver detalles del evento"
        >
          <Info className="h-5 w-5" />
        </Link>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-between px-4 py-3 pb-6">
        <div className="flex shrink-0 flex-col items-center">
          <p className="text-sm font-medium text-foreground">Entrada general</p>
          <p className="mt-1 text-sm text-foreground">{ticketHolderName}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{quantityLabel}</p>
        </div>

        <div className="flex min-h-0 w-full flex-1 items-center justify-center py-2">

        {/* QR en círculo naranja - imagen proporcionada */}
        <div className="flex aspect-square w-full max-w-[280px] flex-shrink-0 items-center justify-center rounded-full bg-orange-primary">
          {/* 
            Truco para que se vea como en Figma (QR blanco sobre naranja):
            - convertimos el PNG a blanco/negro con filters
            - y usamos blend-mode screen para que el fondo negro “desaparezca” sobre el naranja
          */}
          <div className="relative h-[62%] w-[62%]">
            <Image
              src="/images/qr-code.png"
              alt="Código QR de acceso"
              fill
              className="object-contain mix-blend-screen filter invert brightness-0 contrast-200"
              priority
            />
          </div>
        </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1">
          <p className="text-center text-sm font-medium text-foreground">
            {event.title}
          </p>
          <p className="max-w-[260px] text-center text-xs font-semibold text-foreground">
            Muestra este código QR al encargado en el evento para ingresar.
          </p>
        </div>
      </div>
    </div>
  );
}
