'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { getEventById } from '@/lib/events'
import { getOrCreateChat, sendMessage } from '@/lib/messages-actions'
import { sendTicketEmailWithQR } from '@/lib/send-reservation-email'

export type TicketStatus = 'owned' | 'gift_pending' | 'claimed'

export type ReservationTicketRow = {
  id: string
  reservation_id: string
  event_id: string
  purchaser_id: string
  owner_user_id: string | null
  recipient_user_id: string | null
  recipient_email: string | null
  status: TicketStatus
  gift_token: string | null
  gifted_at: string | null
  claimed_at: string | null
  created_at: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function checkEmailHasAccount(email: string): Promise<{
  exists: boolean
  userId?: string
  name?: string | null
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { exists: false }

  const lc = normalizeEmail(email)
  if (!lc) return { exists: false }

  const { data } = await supabase
    .schema("event_booking")
    .from("profiles")
    .select("id, name, email")
    .eq("email", lc)
    .maybeSingle()

  if (!data?.id) return { exists: false }
  return { exists: true, userId: data.id as string, name: (data as any).name ?? null }
}

export async function syncReservationTickets(params: {
  reservationId: string
  eventId: string
  quantity: number
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión' }

  const { reservationId, eventId, quantity } = params
  if (quantity < 0) return { error: 'Cantidad inválida' }

  const { data: existing, error: readErr } = await supabase
    .schema('event_booking')
    .from('reservation_tickets')
    .select('id, status, owner_user_id, purchaser_id')
    .eq('reservation_id', reservationId)
    .order('created_at', { ascending: true })

  if (readErr) return { error: readErr.message }

  const rows = (existing ?? []) as {
    id: string
    status: TicketStatus
    owner_user_id: string | null
    purchaser_id: string
  }[]

  // Tickets que no se pueden eliminar porque ya fueron regalados o reclamados
  const locked = rows.filter((t) => t.status !== 'owned' || t.owner_user_id !== user.id)
  const lockedCount = locked.length
  if (quantity < lockedCount) {
    return {
      error:
        `No puedes reducir la cantidad a ${quantity}. Ya tienes ${lockedCount} entrada(s) regaladas o reclamadas.`,
    }
  }

  const currentCount = rows.length
  if (currentCount === quantity) return {}

  if (currentCount > quantity) {
    const removable = rows
      .filter((t) => t.status === 'owned' && t.owner_user_id === user.id)
      .slice(quantity - lockedCount) // remove extras beyond desired

    if (removable.length > 0) {
      const { error: delErr } = await supabase
        .schema('event_booking')
        .from('reservation_tickets')
        .delete()
        .in(
          'id',
          removable.map((t) => t.id),
        )
      if (delErr) return { error: delErr.message }
    }
    return {}
  }

  const missing = quantity - currentCount
  if (missing <= 0) return {}

  const payload = Array.from({ length: missing }).map(() => ({
    reservation_id: reservationId,
    event_id: eventId,
    purchaser_id: user.id,
    owner_user_id: user.id,
    status: 'owned' as const,
  }))

  const { error: insErr } = await supabase
    .schema('event_booking')
    .from('reservation_tickets')
    .insert(payload)

  if (insErr) return { error: insErr.message }
  return {}
}

export async function createGiftTickets(params: {
  reservationId: string
  eventId: string
  recipientEmails: string[]
}): Promise<{
  error?: string
  gifts: { email: string; token: string; hasAccount: boolean; userId?: string; name?: string | null }[]
  invited: string[]
}> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión', gifts: [], invited: [] }

  const { reservationId, eventId } = params
  const recipientEmails = (params.recipientEmails ?? [])
    .map(normalizeEmail)
    .filter(Boolean)

  if (recipientEmails.length === 0) return { gifts: [], invited: [] }

  const { data: available, error: availErr } = await supabase
    .schema('event_booking')
    .from('reservation_tickets')
    .select('id')
    .eq('reservation_id', reservationId)
    .eq('status', 'owned')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(recipientEmails.length)

  if (availErr) return { error: availErr.message, gifts: [], invited: [] }
  if ((available?.length ?? 0) < recipientEmails.length) {
    return {
      error: 'No tienes suficientes entradas disponibles para regalar con esa cantidad.',
      gifts: [],
      invited: [],
    }
  }

  const gifts: { email: string; token: string; hasAccount: boolean; userId?: string; name?: string | null }[] = []
  const invited: string[] = []

  for (let i = 0; i < recipientEmails.length; i++) {
    const email = recipientEmails[i]
    const ticketId = (available as { id: string }[])[i].id
    const lookup = await checkEmailHasAccount(email)
    const token = crypto.randomUUID()

    const updatePayload: any = {
      owner_user_id: null,
      recipient_email: email,
      status: 'gift_pending',
      gift_token: token,
      gifted_at: new Date().toISOString(),
    }
    if (lookup.exists && lookup.userId) {
      updatePayload.recipient_user_id = lookup.userId
    }

    const { error: updErr } = await supabase
      .schema('event_booking')
      .from('reservation_tickets')
      .update(updatePayload)
      .eq('id', ticketId)
      .eq('reservation_id', reservationId)

    if (updErr) return { error: updErr.message, gifts: [], invited: [] }

    if (!lookup.exists) {
      invited.push(email)
      gifts.push({ email, token, hasAccount: false })
    } else {
      gifts.push({
        email,
        token,
        hasAccount: true,
        userId: lookup.userId!,
        name: lookup.name ?? null,
      })
      // In-app message (si ya existe cuenta)
      const event = getEventById(eventId)
      const giverName = (user.user_metadata?.name as string) ?? 'Un amigo'
      if (event) {
        const { chatId } = await getOrCreateChat(lookup.userId!)
        if (chatId) {
          await sendMessage(
            chatId,
            `${giverName} te regaló 1 entrada para “${event.title}”. Revisa tu correo para redimirla.`,
          )
        }
      }
    }
  }

  return { gifts, invited }
}

export async function getMyTicketsForEvent(eventId: string): Promise<ReservationTicketRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .schema('event_booking')
    .from('reservation_tickets')
    .select(
      'id, reservation_id, event_id, purchaser_id, owner_user_id, recipient_user_id, recipient_email, status, gift_token, gifted_at, claimed_at, created_at',
    )
    .eq('event_id', eventId)
    .eq('owner_user_id', user.id)
    .in('status', ['owned', 'claimed'])
    .order('created_at', { ascending: true })

  return (data ?? []) as ReservationTicketRow[]
}

export async function getSentGifts(): Promise<ReservationTicketRow[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .schema('event_booking')
    .from('reservation_tickets')
    .select(
      'id, reservation_id, event_id, purchaser_id, owner_user_id, recipient_user_id, recipient_email, status, gift_token, gifted_at, claimed_at, created_at',
    )
    .eq('purchaser_id', user.id)
    .in('status', ['gift_pending', 'claimed'])
    .order('created_at', { ascending: false })

  const rows = (data ?? []) as ReservationTicketRow[]
  return rows.filter((t) => t.owner_user_id !== user.id)
}

export async function getGiftPreviewByToken(token: string): Promise<{
  ok: boolean
  error?: string
  eventId?: string
  eventTitle?: string
  giverName?: string | null
  recipientEmail?: string | null
}> {
  const admin = createServiceRoleClient()
  const { data: ticket, error } = await admin
    .schema('event_booking')
    .from('reservation_tickets')
    .select('event_id, purchaser_id, recipient_email, status, owner_user_id')
    .eq('gift_token', token)
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!ticket) return { ok: false, error: 'Enlace inválido' }
  if ((ticket as any).status !== 'gift_pending' || (ticket as any).owner_user_id) {
    return { ok: false, error: 'Este regalo ya fue redimido o no está disponible.' }
  }

  const event = getEventById((ticket as any).event_id)
  const { data: giverProfile } = await admin
    .schema('event_booking')
    .from('profiles')
    .select('name')
    .eq('id', (ticket as any).purchaser_id)
    .maybeSingle()

  return {
    ok: true,
    eventId: (ticket as any).event_id,
    eventTitle: event?.title,
    giverName: (giverProfile as any)?.name ?? null,
    recipientEmail: (ticket as any).recipient_email ?? null,
  }
}

export async function redeemGiftToken(token: string): Promise<{ error?: string; ok?: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión para redimir tu entrada.' }
  if (!user.email) return { error: 'Tu cuenta no tiene correo. No se puede redimir.' }

  const admin = createServiceRoleClient()

  const { data: ticket, error: readErr } = await admin
    .schema('event_booking')
    .from('reservation_tickets')
    .select('id, event_id, purchaser_id, recipient_user_id, recipient_email, status, owner_user_id')
    .eq('gift_token', token)
    .maybeSingle()

  if (readErr) return { error: readErr.message }
  if (!ticket) return { error: 'Enlace inválido o expirado.' }
  if ((ticket as any).status !== 'gift_pending' || (ticket as any).owner_user_id) {
    return { error: 'Este regalo ya fue redimido.' }
  }

  const recipientEmail = ((ticket as any).recipient_email as string | null)?.toLowerCase() ?? null
  const recipientUserId = (ticket as any).recipient_user_id as string | null
  const emailMatches = recipientEmail ? recipientEmail === user.email.toLowerCase() : false
  const userMatches = recipientUserId ? recipientUserId === user.id : false
  if (recipientUserId && !userMatches) return { error: 'Este regalo no está asignado a tu cuenta.' }
  if (!recipientUserId && recipientEmail && !emailMatches) {
    return { error: 'Este regalo no está asignado a tu correo.' }
  }

  const { error: updErr } = await admin
    .schema('event_booking')
    .from('reservation_tickets')
    .update({
      owner_user_id: user.id,
      recipient_user_id: user.id,
      status: 'claimed',
      claimed_at: new Date().toISOString(),
    })
    .eq('id', (ticket as any).id)
    .eq('gift_token', token)

  if (updErr) return { error: updErr.message }

  // Enviar QR al correo del destinatario (ticket individual)
  const event = getEventById((ticket as any).event_id)
  if (event && user.email) {
    const result = await sendTicketEmailWithQR({
      to: user.email,
      eventTitle: event.title,
      ticketId: (ticket as any).id,
      ticketHolderName: (user.user_metadata?.name as string) ?? 'Invitado',
    })
    if (!result.ok) {
      console.error('[gift] No se pudo enviar el QR del ticket al destinatario:', result.error)
    }
  }

  // Mensaje in-app al redimir (para quien se registre luego)
  if (event) {
    const { data: giverProfile } = await admin
      .schema('event_booking')
      .from('profiles')
      .select('name')
      .eq('id', (ticket as any).purchaser_id)
      .maybeSingle()

    const giverName = (giverProfile as any)?.name ?? 'Un amigo'
    const { chatId } = await getOrCreateChat((ticket as any).purchaser_id)
    if (chatId) {
      await sendMessage(
        chatId,
        `¡Listo! Redimiste 1 entrada que te regaló ${giverName} para “${event.title}”.`,
      )
    }
  }

  return { ok: true }
}

export async function requireAuthForRedeem(nextUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?next=${encodeURIComponent(nextUrl)}`)
  }
}

