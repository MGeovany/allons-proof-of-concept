'use server'

import { createClient } from '@/lib/supabase/server'

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

  let ticketHolderName: string | null = null
  const { data: profile } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()
  ticketHolderName =
    profile?.name ?? (user.user_metadata?.name as string) ?? 'Invitado'

  const { error } = await supabase
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

  if (error) return { error: error.message }
  return {}
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
