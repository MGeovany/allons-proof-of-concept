import { redirect } from "next/navigation";
import { TicketIcon } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/lib/events";
import { TicketsListAnimated } from "@/components/home/tickets-list-animated";

export default async function TicketsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: reservations, error } = await supabase
    .schema("event_booking")
    .from("reservations")
    .select("event_id, quantity, created_at")
    .order("created_at", { ascending: false });

  const mapped =
    reservations
      ?.map((r) => {
        const event = getEventById(r.event_id);
        if (!event) return null;
        return { event, quantity: r.quantity };
      })
      .filter(Boolean) ?? [];

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
        ) : mapped.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
            <TicketIcon className="h-16 w-16 text-muted-foreground" />
            <p className="text-balance text-center text-sm text-muted-foreground">
              Aquí encontrarás tus eventos reservados. Reserva un evento para
              ver tu ticket aquí.
            </p>
          </div>
        ) : (
          <TicketsListAnimated items={mapped} />
        )}
      </div>
    </div>
  );
}
