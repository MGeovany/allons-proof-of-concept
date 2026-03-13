/**
 * Origen base de la app (ej. https://allons.app).
 * Usado para enlaces en emails (invitaciones, reset password) y redirects de auth.
 *
 * Prioridad:
 * 1. NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL (sin /auth/callback) — desarrollo local con Supabase
 * 2. NEXT_PUBLIC_SITE_URL — configurar en producción
 * 3. VERCEL_URL — fallback automático en Vercel (https://tu-app.vercel.app)
 * 4. localhost:3000 — desarrollo local
 */
export function getAppOrigin(): string {
  const devRedirect = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL?.replace(
    /\/auth\/callback\/?$/,
    '',
  )
  if (devRedirect) return devRedirect

  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL

  // Vercel setea VERCEL_URL automáticamente (ej. allons-xyz.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}
