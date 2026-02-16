import { createClient } from '@supabase/supabase-js'

/**
 * Cliente con service_role para operaciones que ignoran RLS (ej. proveedor viendo todas las reservas).
 * Usar SOLO en server actions después de verificar que el usuario actual es proveedor autorizado.
 */
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada en .env')
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  })
}
