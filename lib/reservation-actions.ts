'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getEventById } from '@/lib/events'
import { sendReservationEmailWithQR } from '@/lib/send-reservation-email'

/** Total de plazas reservadas para un evento (requiere service role para ver todas las reservas). */
async function getTotalReservedForEvent(eventId: string): Promise<number> {
  try {
    const admin = createServiceRoleClient()
    const { data: rows } = await admin
      .schema('event_booking')
      .from('reservations')
      .select('quantity')
      .eq('event_id', eventId)
    const total = (rows ?? []).reduce((sum, r) => sum + (r.quantity ?? 0), 0)
    return total
  } catch {
    return 0
  }
}

export type ReservationRow = {
  id: string
  user_id: string
  event_id: string
  quantity: number
  ticket_holder_name: string | null
  created_at: string
}

export async function createReservation(eventId: string, quantity: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para reservar' }

  const event = getEventById(eventId)
  if (event?.capacity != null) {
    const totalReserved = await getTotalReservedForEvent(eventId)
    const currentUserReservation = await getReservationForEvent(eventId)
    const currentUserQty = currentUserReservation?.quantity ?? 0
    const spotsAfter = totalReserved - currentUserQty + quantity
    if (spotsAfter > event.capacity) {
      return {
        error: `No hay cupos disponibles. Este evento tiene un límite de ${event.capacity} personas.`,
      }
    }
  }

  let ticketHolderName: string | null = null
  const { data: profile } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()
  ticketHolderName =
    profile?.name ?? (user.user_metadata?.name as string) ?? 'Invitado'

  const { data: reservation, error } = await supabase
    .schema('event_booking')
    .from('reservations')
    .upsert(
      {
        user_id: user.id,
        event_id: eventId,
        quantity,
        ticket_holder_name: ticketHolderName,
      },
      { onConflict: 'user_id,event_id' },
    )
    .select('id, ticket_holder_name')
    .single()

  if (error) return { error: error.message }

  // Enviar correo con el QR (esperamos para que se envíe antes de responder)
  let emailSent = false
  const email = user.email
  const event = getEventById(eventId)
  if (email && reservation && event) {
    const result = await sendReservationEmailWithQR({
      to: email,
      eventTitle: event.title,
      reservationId: reservation.id,
      ticketHolderName: reservation.ticket_holder_name ?? ticketHolderName ?? 'Invitado',
    })
    emailSent = result.ok
    if (!result.ok) {
      console.error('[reservation] No se pudo enviar el correo con QR:', result.error)
    }
  }

  return { emailSent }
}

export async function getReservationForEvent(
  eventId: string,
): Promise<ReservationRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .schema('event_booking')
    .from('reservations')
    .select('id, user_id, event_id, quantity, ticket_holder_name, created_at')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()

  return data as ReservationRow | null
}

export async function hasReservationForEvent(eventId: string): Promise<boolean> {
  const r = await getReservationForEvent(eventId)
  return !!r
}

export async function cancelReservation(eventId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const { error } = await supabase
    .schema('event_booking')
    .from('reservations')
    .delete()
    .eq('user_id', user.id)
    .eq('event_id', eventId)

  if (error) return { error: error.message }
  return {}
}
