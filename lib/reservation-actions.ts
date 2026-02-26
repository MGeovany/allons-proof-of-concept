'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getEventById } from '@/lib/events'
import { sendGiftInvitationEmail, sendTicketEmailWithQR } from '@/lib/send-reservation-email'
import { createGiftTickets, syncReservationTickets } from '@/lib/tickets-actions'

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

const getAppOrigin = () =>
  process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?.replace(/\/auth\/callback\/?$/, '') ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'http://localhost:3000'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Resuelve cada destinatario (email o user id de amigo) a email. */
async function resolveRecipientEmails(
  supabase: Awaited<ReturnType<typeof createClient>>,
  currentUserId: string,
  recipients: string[],
): Promise<{ error?: string; emails: string[] }> {
  const emails: string[] = []
  for (const value of recipients) {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed) continue
    if (UUID_REGEX.test(trimmed)) {
      const { data: row1 } = await supabase
        .schema('event_booking')
        .from('friends')
        .select('user_id')
        .eq('user_id', currentUserId)
        .eq('friend_id', trimmed)
        .limit(1)
        .maybeSingle()
      const { data: row2 } = await supabase
        .schema('event_booking')
        .from('friends')
        .select('user_id')
        .eq('user_id', trimmed)
        .eq('friend_id', currentUserId)
        .limit(1)
        .maybeSingle()
      if (!row1 && !row2) {
        return { error: 'Solo puedes enviar entradas a tus amigos por usuario. Agrega a la persona en Amigos primero.', emails: [] }
      }
      const { data: profile } = await supabase
        .schema('event_booking')
        .from('profiles')
        .select('email')
        .eq('id', trimmed)
        .single()
      const friendEmail = (profile as { email?: string } | null)?.email?.trim()?.toLowerCase()
      if (!friendEmail) {
        return { error: 'Ese amigo no tiene correo asociado. Usa la opción "Enviar a correo" e ingresa su correo.', emails: [] }
      }
      emails.push(friendEmail)
    } else {
      emails.push(trimmed)
    }
  }
  return { emails }
}

export async function createReservation(eventId: string, quantity: number, giftRecipientEmails?: string[]) {
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
    .select('id, ticket_holder_name, event_id')
    .single()

  if (error) return { error: error.message }

  // Sincronizar tickets individuales (1 por entrada)
  if (reservation?.id) {
    const { error: syncErr } = await syncReservationTickets({
      reservationId: reservation.id,
      eventId,
      quantity,
    })
    if (syncErr) return { error: syncErr }
  }

  // Resolver destinatarios (email o user id de amigo) a emails y crear regalos
  let resolvedEmails: string[] = []
  if (reservation?.id && giftRecipientEmails?.length) {
    const resolved = await resolveRecipientEmails(supabase, user.id, giftRecipientEmails)
    if (resolved.error) return { error: resolved.error }
    resolvedEmails = resolved.emails
  }
  const gifts =
    reservation?.id && resolvedEmails.length
      ? await createGiftTickets({
          reservationId: reservation.id,
          eventId,
          recipientEmails: resolvedEmails,
        })
      : { gifts: [], invited: [] as string[] }

  if (gifts.error) return { error: gifts.error }

  // Enviar invitaciones por correo a cada destinatario
  const giverName = ticketHolderName ?? (user.user_metadata?.name as string) ?? 'Un amigo'
  const redeemBase = `${getAppOrigin()}/gift/redeem`
  for (const g of gifts.gifts ?? []) {
    const redeemUrl = `${redeemBase}/${g.token}`
    const result = await sendGiftInvitationEmail({
      to: g.email,
      giverName,
      eventTitle: event?.title ?? 'Evento',
      redeemUrl,
    })
    if (!result.ok) {
      console.error('[gift] No se pudo enviar invitación:', g.email, result.error)
    }
  }

  // Enviar correo con el QR (ticket individual del comprador si existe)
  let emailSent = false
  const email = user.email
  if (email && reservation?.id && event) {
    const { data: myTicket } = await supabase
      .schema('event_booking')
      .from('reservation_tickets')
      .select('id')
      .eq('reservation_id', reservation.id)
      .eq('owner_user_id', user.id)
      .eq('status', 'owned')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (myTicket?.id) {
      const result = await sendTicketEmailWithQR({
        to: email,
        eventTitle: event.title,
        ticketId: myTicket.id,
        ticketHolderName:
          reservation.ticket_holder_name ?? ticketHolderName ?? 'Invitado',
      })
      emailSent = result.ok
      if (!result.ok) {
        console.error('[reservation] No se pudo enviar el correo con QR:', result.error)
      }
    }
  }

  return { emailSent, invited: gifts.invited ?? [] }
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
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data: reservation } = await supabase
    .schema('event_booking')
    .from('reservations')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle()
  if (reservation?.id) return true

  const { data: ticket } = await supabase
    .schema('event_booking')
    .from('reservation_tickets')
    .select('id')
    .eq('event_id', eventId)
    .eq('owner_user_id', user.id)
    .limit(1)
    .maybeSingle()
  return !!ticket?.id
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
