import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InterestsSelector } from '@/components/interests/interests-selector'

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function InterestsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('interests')
    .eq('id', user.id)
    .single()

  const hasInterests =
    Array.isArray(profile?.interests) && profile.interests.length > 0

  const params = await searchParams
  const redirectTo = params.redirect ?? undefined

  if (hasInterests) {
    redirect(redirectTo ?? '/home')
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <InterestsSelector redirectTo={redirectTo} />
    </main>
  )
}
