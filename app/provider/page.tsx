"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { getGuestsForEvent, isProvider, type GuestRow } from "@/lib/provider-actions";
import { getEventById } from "@/lib/events";
import { LogOut, Users, Ticket } from "lucide-react";

const PROVIDER_EVENT_IDS = ["1", "2"]; // Jungla, Rawayana

export default function ProviderPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [guestsByEvent, setGuestsByEvent] = useState<Record<string, GuestRow[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isProvider().then((ok) => {
      setAllowed(ok);
      if (!ok) {
        setLoading(false);
        return;
      }
      Promise.all(
        PROVIDER_EVENT_IDS.map(async (eventId) => {
          const { data } = await getGuestsForEvent(eventId);
          return { eventId, guests: data ?? [] };
        }),
      ).then((results) => {
        const map: Record<string, GuestRow[]> = {};
        results.forEach(({ eventId, guests }) => {
          map[eventId] = guests;
        });
        setGuestsByEvent(map);
        setLoading(false);
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4">
        <p className="text-center text-foreground">No tienes acceso a esta zona.</p>
        <Link
          href="/home"
          className="rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="shrink-0 border-b border-border px-5 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Proveedor</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-5 py-3 pb-10">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-orange-primary" />
          <h2 className="text-sm font-medium text-muted-foreground">
            Invitados por evento
          </h2>
        </div>

        <div className="space-y-2.5">
          {PROVIDER_EVENT_IDS.map((eventId) => {
            const event = getEventById(eventId);
            const guests = guestsByEvent[eventId] ?? [];
            const totalTickets = guests.reduce((s, g) => s + g.quantity, 0);
            return (
              <section
                key={eventId}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <div className="border-b border-border px-4 py-2">
                  <h3 className="text-sm font-medium text-foreground">
                    {event?.title ?? `Evento ${eventId}`}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Ticket className="h-3.5 w-3.5 shrink-0" />
                    {guests.length} reserva{guests.length !== 1 ? "s" : ""}
                    {totalTickets > 0 && ` · ${totalTickets} entrada${totalTickets !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {guests.length === 0 ? (
                    <li className="px-4 py-4 text-center text-sm text-muted-foreground">
                      Sin reservas aún
                    </li>
                  ) : (
                    guests.map((g) => (
                      <li
                        key={g.id}
                        className="flex items-center justify-between px-4 py-2 text-sm"
                      >
                        <span className="text-foreground">
                          {g.ticket_holder_name ?? "Invitado"}
                        </span>
                        <span className="rounded-md bg-orange-primary/15 px-2 py-0.5 text-xs font-medium text-orange-primary">
                          {g.quantity} {g.quantity === 1 ? "entrada" : "entradas"}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
