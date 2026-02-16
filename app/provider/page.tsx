"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "@/lib/auth-actions";
import { getGuestsForEvent, isProvider, type GuestRow } from "@/lib/provider-actions";
import { getEventById } from "@/lib/events";
import { LogOut } from "lucide-react";

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
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <p className="text-neutral-500">Cargando…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-4">
        <p className="text-center text-neutral-700">No tienes acceso a esta zona.</p>
        <Link
          href="/home"
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800"
        >
          Ir al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-neutral-900">Proveedor</h1>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="px-4 py-6">
        <p className="mb-6 text-sm text-neutral-500">
          Invitados por evento
        </p>

        <div className="space-y-8">
          {PROVIDER_EVENT_IDS.map((eventId) => {
            const event = getEventById(eventId);
            const guests = guestsByEvent[eventId] ?? [];
            return (
              <section key={eventId} className="border border-neutral-200 rounded-lg overflow-hidden">
                <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
                  <h2 className="font-medium text-neutral-900">{event?.title ?? `Evento ${eventId}`}</h2>
                  <p className="text-xs text-neutral-500">{guests.length} reserva(s)</p>
                </div>
                <ul className="divide-y divide-neutral-100">
                  {guests.length === 0 ? (
                    <li className="px-4 py-6 text-center text-sm text-neutral-500">
                      Sin reservas aún
                    </li>
                  ) : (
                    guests.map((g) => (
                      <li
                        key={g.id}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <span className="text-neutral-900">
                          {g.ticket_holder_name ?? "Invitado"}
                        </span>
                        <span className="text-neutral-500">
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
