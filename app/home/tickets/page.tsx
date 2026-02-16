import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, TicketIcon } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { getEventById } from '@/lib/events'

export default async function TicketsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: reservations, error } = await supabase
    .schema('event_booking')
    .from('reservations')
    .select('event_id, quantity, created_at')
    .order('created_at', { ascending: false })

  const mapped =
    reservations
      ?.map((r) => {
        const event = getEventById(r.event_id)
        if (!event) return null
        return { event, quantity: r.quantity }
      })
      .filter(Boolean) ?? []

  return (
    <div className="flex flex-1 flex-col bg-background px-6 pt-6 pb-4">
      {/* Header */}
      <header className="flex items-center justify-between">
        <Link
          href="/home"
          className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          aria-label="Volver"
        >
          <ChevronLeft className="h-6 w-6" />
        </Link>
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
              Aquí encontrarás tus eventos reservados. Reserva un evento para ver
              tu ticket aquí.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-28">
            {mapped.map(({ event, quantity }) => (
              <Link
                key={event.id}
                href={`/home/event/${event.id}/codigo`}
                className="relative h-32 overflow-hidden rounded-2xl"
                aria-label={`Ticket de ${event.title}`}
              >
                <Image
                  src={event.ticketImage ?? event.bannerImage ?? event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 430px) 100vw, 430px"
                  priority
                />
                <div
                  className="absolute inset-0 bg-black/35"
                  aria-hidden
                />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-semibold text-white">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-white/80">
                    {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
