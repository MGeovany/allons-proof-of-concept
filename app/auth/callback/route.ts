import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isProviderEmail } from '@/lib/provider-constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        if (isProviderEmail(user.email ?? undefined)) {
          return NextResponse.redirect(`${origin}/provider`)
        }
        const { data: profile } = await supabase
          .schema('event_booking')
          .from('profiles')
          .select('interests')
          .eq('id', user.id)
          .single()
        if (!profile?.interests || profile.interests.length === 0) {
          return NextResponse.redirect(`${origin}/interests`)
        }
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
