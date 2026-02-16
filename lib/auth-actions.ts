'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isProviderEmail } from '@/lib/provider-constants'

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (user) {
    if (isProviderEmail(user.email ?? undefined)) {
      redirect('/provider')
    }
    const { data: profile } = await supabase
      .schema('event_booking')
      .from('profiles')
      .select('interests')
      .eq('id', user.id)
      .single()
    if (!profile?.interests || profile.interests.length === 0) {
      redirect('/interests')
    }
  }
  redirect('/home')
}

export async function registerWithEmail(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const username = formData.get('username') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Las contrasenas no coinciden' }
  }

  if (password.length < 6) {
    return { error: 'La contrasena debe tener al menos 6 caracteres' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        name,
        username,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/auth/login?registered=1')
}

export async function loginWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function saveInterests(
  interests: string[],
  redirectTo?: string,
): Promise<{ error?: string; redirectTo?: string }> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autenticado' }
    }

    const { error } = await supabase
      .schema('event_booking')
      .from('profiles')
      .upsert(
        {
          id: user.id,
          interests: interests ?? [],
          name: user.user_metadata?.name ?? undefined,
          username: user.user_metadata?.username ?? undefined,
        },
        { onConflict: 'id' },
      )

    if (error) {
      return { error: error.message }
    }

    return { redirectTo: redirectTo ?? '/home' }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al guardar'
    return { error: message }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
