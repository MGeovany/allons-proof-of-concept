/** Correos autorizados como proveedor. Puede ampliarse con rol en DB. */
const PROVIDER_EMAILS = [
  'marlongeo1999@gmail.com',
  'marlongeo1999+pro@gmail.com',
] as const

export function isProviderEmail(email: string | undefined): boolean {
  if (!email) return false
  const normalized = email.toLowerCase().trim()
  return PROVIDER_EMAILS.some((e) => e === normalized)
}
