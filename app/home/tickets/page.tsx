import { redirect } from "next/navigation";
import { TicketIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/events";
import { claimPendingGiftsForCurrentUser } from "@/lib/tickets-actions";
import { TicketsListAnimated } from "@/components/home/tickets-list-animated";

export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  await claimPendingGiftsForCurrentUser();

  const { data: myTickets, error } = await supabase
    .schema("event_booking")
    .from("reservation_tickets")
    .select("event_id, status, created_at")
    .eq("owner_user_id", user.id)
    .in("status", ["owned", "claimed"])
    .order("created_at", { ascending: false });

  const counts = new Map<string, number>();
  for (const t of myTickets ?? []) {
    counts.set(t.event_id, (counts.get(t.event_id) ?? 0) + 1);
  }
  const mapped = Array.from(counts.entries())
    .map(([eventId, qty]) => {
      const event = getEventById(eventId);
      if (!event) return null;
      return { event, quantity: qty };
    })
    .filter(Boolean) as { event: any; quantity: number }[];

  const { data: sentGifts } = await supabase
    .schema("event_booking")
    .from("reservation_tickets")
    .select("id, event_id, recipient_email, status, gifted_at, claimed_at, owner_user_id")
    .eq("purchaser_id", user.id)
    .in("status", ["gift_pending", "claimed"])
    .order("gifted_at", { ascending: false });

  return (
    <div className="flex flex-1 flex-col bg-background px-6 pt-6 pb-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-center text-lg font-semibold text-foreground">
          Mis Tickets
        </h1>
        <div className="h-10 w-10" aria-hidden />
      </header>

      <div className="mt-10 flex flex-1 flex-col">
        {error ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <TicketIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              No se pudieron cargar tus tickets.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-10">
            <section>
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
                Mis tickets
              </h2>
              {mapped.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 py-12">
                  <TicketIcon className="h-16 w-16 text-muted-foreground" />
                  <p className="text-balance text-center text-sm text-muted-foreground">
                    Aquí encontrarás tus eventos reservados o entradas que te hayan regalado.
                  </p>
                </div>
              ) : (
                <TicketsListAnimated items={mapped} />
              )}
            </section>

            <section>
              <h2 className="mb-4 text-sm font-semibold text-muted-foreground">
                Regalos enviados
              </h2>
              {!sentGifts?.length ? (
                <p className="text-sm text-muted-foreground">
                  Aún no has enviado entradas de regalo.
                </p>
              ) : (
                <div className="flex flex-col gap-2 pb-28">
                  {sentGifts.map((g) => {
                    const event = getEventById(g.event_id);
                    if (!event) return null;
                    const statusLabel =
                      g.status === "claimed" ? "Redimido" : "Pendiente";
                    const statusClass =
                      g.status === "claimed"
                        ? "bg-green-500/15 text-green-600"
                        : "bg-orange-primary/15 text-orange-primary";
                    return (
                      <div
                        key={g.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/60 p-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {event.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Para: {g.recipient_email ?? "—"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
