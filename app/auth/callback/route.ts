import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProviderEmail } from '@/lib/provider-constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'
  const allowSkipInterests = next.startsWith('/gift/redeem/')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .schema('event_booking')
          .from('profiles')
          .select('avatar_url, interests, email')
          .eq('id', user.id)
          .single()
        const googleAvatar =
          (user.user_metadata?.avatar_url as string) ?? (user.user_metadata?.picture as string)
        const emailLc = user.email ? user.email.toLowerCase() : null
        const update: Record<string, string> = {}
        if (googleAvatar && !profile?.avatar_url) update.avatar_url = googleAvatar
        if (emailLc && !(profile as any)?.email) update.email = emailLc
        if (Object.keys(update).length > 0) {
          await supabase.schema('event_booking').from('profiles').update(update).eq('id', user.id)
        }
        if (isProviderEmail(user.email ?? undefined)) {
          return NextResponse.redirect(`${origin}/provider`)
        }
        if (!allowSkipInterests && (!profile?.interests || profile.interests.length === 0)) {
          return NextResponse.redirect(`${origin}/interests`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
