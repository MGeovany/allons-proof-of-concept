import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getGiftPreviewByToken } from '@/lib/tickets-actions'
import { RedeemGiftCard } from '@/components/gift/redeem-gift-card'

export default async function RedeemGiftPage({
  params,
}: {
  params: { token: string }
}) {
  const { token } = params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const preview = await getGiftPreviewByToken(token)

  if (!preview.ok) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
        <h1 className="text-center text-xl font-bold text-foreground">
          Enlace inválido
        </h1>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {preview.error ?? 'No pudimos encontrar este regalo.'}
        </p>
        <Link
          href="/"
          className="mt-8 rounded-2xl bg-orange-primary px-8 py-3 text-sm font-semibold text-white"
        >
          Ir al inicio
        </Link>
      </main>
    )
  }

  const next = `/gift/redeem/${encodeURIComponent(token)}`

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5">
        <h1 className="text-lg font-bold text-foreground">Entrada de regalo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {preview.giverName ? (
            <>
              <span className="font-semibold text-foreground">{preview.giverName}</span>{' '}
              te regaló una entrada
              {preview.eventTitle ? ` para “${preview.eventTitle}”.` : '.'}
            </>
          ) : (
            <>Tienes una entrada de regalo{preview.eventTitle ? ` para “${preview.eventTitle}”.` : '.'}</>
          )}
        </p>

        {!user ? (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              Para redimirla necesitas iniciar sesión o crear una cuenta en Allons.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href={`/auth/login?next=${encodeURIComponent(next)}`}
                className="rounded-2xl bg-orange-primary px-6 py-3 text-center text-sm font-semibold text-white"
              >
                Iniciar sesión
              </Link>
              <Link
                href={`/auth/register?next=${encodeURIComponent(next)}`}
                className="rounded-2xl border border-border bg-transparent px-6 py-3 text-center text-sm font-semibold text-foreground"
              >
                Crear cuenta
              </Link>
            </div>
          </>
        ) : (
          <div className="mt-6">
            <RedeemGiftCard token={token} eventId={preview.eventId ?? ''} />
          </div>
        )}
      </div>
    </main>
  )
}

