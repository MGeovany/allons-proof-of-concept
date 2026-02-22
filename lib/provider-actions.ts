'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { isProviderEmail } from '@/lib/provider-constants'

export type GuestRow = {
  id: string
  ticket_holder_name: string | null
  quantity: number
  created_at: string
}

/**
 * Inicio de sesión como proveedor. Solo el correo autorizado puede entrar; redirige a /provider.
 */
export async function loginAsProvider(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!isProviderEmail(email)) {
    return { error: 'No estás autorizado como proveedor. Solo el correo registrado puede acceder.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  redirect('/provider')
}

/**
 * Lista de invitados (reservas) para un evento. Solo el proveedor autorizado puede llamar.
 */
export async function getGuestsForEvent(
  eventId: string,
): Promise<{ data: GuestRow[] | null; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isProviderEmail(user.email ?? undefined)) {
    return { data: null, error: 'No autorizado' }
  }

  const admin = createServiceRoleClient()
  const { data, error } = await admin
    .schema('event_booking')
    .from('reservations')
    .select('id, ticket_holder_name, quantity, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error: error.message }
  }
  return { data: data as GuestRow[], error: null }
}

/** Comprueba si el usuario actual es el proveedor autorizado. */
export async function isProvider(): Promise<boolean> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user && isProviderEmail(user.email ?? undefined)
}

/** Elimina una reserva. Solo el proveedor autorizado puede llamar. */
export async function deleteReservationAsProvider(reservationId: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isProviderEmail(user.email ?? undefined)) return { error: 'No autorizado' }
  const admin = createServiceRoleClient()
  const { error } = await admin.schema('event_booking').from('reservations').delete().eq('id', reservationId)
  if (error) return { error: error.message }
  return { error: null }
}
