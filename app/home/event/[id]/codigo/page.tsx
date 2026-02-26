"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Info, ChevronLeftCircle, ChevronRightCircle } from "lucide-react";
import { getEventById } from "@/lib/events";
import { getMyTicketsForEvent } from "@/lib/tickets-actions";
import type { ReservationTicketRow } from "@/lib/tickets-actions";
import QRCode from "qrcode";

export default function CodigoAccesoPage() {
  const params = useParams();
  const router = useRouter();
  const event = getEventById(params.id as string);
  const [tickets, setTickets] = useState<ReservationTicketRow[] | undefined>(
    undefined,
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!event?.id) return;
    getMyTicketsForEvent(event.id).then((t) => {
      setTickets(t);
      setActiveIdx(0);
    });
  }, [event?.id]);

  const activeTicketId =
    tickets && tickets.length > 0
      ? tickets[Math.min(activeIdx, tickets.length - 1)]?.id
      : null;

  useEffect(() => {
    let cancelled = false;
    async function gen() {
      if (!activeTicketId) return;
      const dataUrl = await QRCode.toDataURL(activeTicketId, {
        type: "png",
        margin: 2,
        width: 400,
        color: { dark: "#FFFFFF", light: "rgba(0,0,0,0)" },
      });
      if (!cancelled) setQrUrl(dataUrl);
    }
    setQrUrl(null);
    gen();
    return () => {
      cancelled = true;
    };
  }, [activeTicketId]);

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

  if (tickets === undefined) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">
          No tienes entradas para este evento
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

  const quantity = tickets.length;
  const quantityLabel = quantity === 1 ? "1 entrada" : `${quantity} entradas`;

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
          <p className="mt-1 text-sm text-foreground">Tu entrada</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{quantityLabel}</p>
          {tickets.length > 1 && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ticket {activeIdx + 1} de {tickets.length}
            </p>
          )}
        </div>

        <div className="flex min-h-0 w-full flex-1 items-center justify-center py-2">

        {/* QR en círculo naranja - imagen proporcionada */}
        <div className="flex aspect-square w-full max-w-[280px] flex-shrink-0 items-center justify-center rounded-full bg-orange-primary">
          <div className="relative h-[62%] w-[62%]">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrUrl}
                alt="Código QR de acceso"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-white/80">
                Generando…
              </div>
            )}
          </div>
        </div>
        </div>

        {tickets.length > 1 && (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
            >
              <ChevronLeftCircle className="h-5 w-5" />
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setActiveIdx((i) => Math.min(tickets.length - 1, i + 1))}
              disabled={activeIdx === tickets.length - 1}
              className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium text-foreground disabled:opacity-50"
            >
              Siguiente
              <ChevronRightCircle className="h-5 w-5" />
            </button>
          </div>
        )}

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
