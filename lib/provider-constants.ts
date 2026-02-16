/** Único correo autorizado como proveedor por ahora. Puede ampliarse con rol en DB. */
export const PROVIDER_EMAIL = 'marlongeo1999@gmail.com'

export function isProviderEmail(email: string | undefined): boolean {
  return email?.toLowerCase() === PROVIDER_EMAIL
}
