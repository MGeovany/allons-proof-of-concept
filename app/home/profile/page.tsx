import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProfileView } from '@/components/home/profile-view'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('name, interests')
    .eq('id', user.id)
    .single()

  const displayName =
    profile?.name ?? (user.user_metadata?.name as string) ?? 'Invitado'
  const interests = profile?.interests ?? []
  const avatarUrl =
    (user.user_metadata?.avatar_url as string) ??
    (user.user_metadata?.picture as string) ??
    null

  return (
    <div className="flex flex-1 flex-col px-4 pb-24">
      <header className="flex items-center justify-between py-4">
        <div className="w-10" aria-hidden />
        <h1 className="text-lg font-bold text-foreground">Perfil</h1>
        <div className="flex items-center gap-1">
          <Link
            href="/home/profile/edit"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
            aria-label="Editar perfil"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </Link>
          <Link
            href="/home/notifications"
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
            aria-label="Notificaciones"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-6-6v0a6 6 0 00-6 6v3.158c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </Link>
        </div>
      </header>

      <ProfileView
        displayName={displayName}
        interests={interests}
        avatarUrl={avatarUrl}
      />
    </div>
  )
}
