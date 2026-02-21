'use server'

import { createClient } from '@/lib/supabase/server'

export type ProfileForEdit = {
  name: string | null
  username: string | null
  location: string | null
  avatar_url: string | null
}

export async function getProfileForEdit(): Promise<ProfileForEdit | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('name, username, location, avatar_url')
    .eq('id', user.id)
    .single()

  if (data) return data as ProfileForEdit
  return {
    name: (user.user_metadata?.name as string) ?? null,
    username: (user.user_metadata?.username as string) ?? null,
    location: null,
    avatar_url: (user.user_metadata?.avatar_url as string) ?? (user.user_metadata?.picture as string) ?? null,
  }
}

export async function updateProfile(formData: {
  name: string
  username: string
  location: string
  avatar_url: string
}): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const name = formData.name?.trim() || null
  const username = formData.username?.trim() || null
  const location = formData.location?.trim() || null
  const avatar_url = formData.avatar_url?.trim() || null

  const { error } = await supabase
    .schema('event_booking')
    .from('profiles')
    .upsert(
      {
        id: user.id,
        name: name ?? undefined,
        username: username ?? undefined,
        location: location ?? undefined,
        avatar_url: avatar_url ?? undefined,
      },
      { onConflict: 'id' },
    )

  if (error) return { error: error.message }

  await supabase.auth.updateUser({
    data: {
      name: name ?? user.user_metadata?.name,
      username: username ?? user.user_metadata?.username,
      avatar_url: avatar_url ?? user.user_metadata?.avatar_url ?? user.user_metadata?.picture,
    },
  })

  return {}
}
