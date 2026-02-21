'use server'

import { createClient } from '@/lib/supabase/server'

export type FriendProfile = {
  id: string
  name: string | null
  avatar_url: string | null
}

export async function getMyFriends(): Promise<FriendProfile[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows } = await supabase
    .schema('event_booking')
    .from('friends')
    .select('user_id, friend_id')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)

  if (!rows?.length) return []
  const ids = [...new Set(rows.map((r) => (r.user_id === user.id ? r.friend_id : r.user_id)))]

  const { data: profiles } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', ids)

  return (profiles ?? []).map((p) => ({
    id: p.id,
    name: p.name ?? 'Usuario',
    avatar_url: p.avatar_url ?? null,
  }))
}

export async function addFriend(friendId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  if (friendId === user.id) return { error: 'No puedes agregarte a ti mismo' }

  const { error } = await supabase
    .schema('event_booking')
    .from('friends')
    .insert({ user_id: user.id, friend_id: friendId })

  if (error) {
    if (error.code === '23505') return {} // ya son amigos
    return { error: error.message }
  }
  return {}
}

export async function removeFriend(friendId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  await supabase
    .schema('event_booking')
    .from('friends')
    .delete()
    .eq('user_id', user.id)
    .eq('friend_id', friendId)
  await supabase
    .schema('event_booking')
    .from('friends')
    .delete()
    .eq('user_id', friendId)
    .eq('friend_id', user.id)
  return {}
}

/** Usuarios que aún no son amigos (para agregar). Limita a 20. */
export async function getUsersToAdd(search?: string): Promise<FriendProfile[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: friendRows } = await supabase
    .schema('event_booking')
    .from('friends')
    .select('user_id, friend_id')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
  const friendIds = new Set(
    friendRows?.map((r) => (r.user_id === user.id ? r.friend_id : r.user_id)) ?? [],
  )
  friendIds.add(user.id)

  const { data: allProfiles } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('id, name, avatar_url, username')
  let list = (allProfiles ?? []).filter((p) => !friendIds.has(p.id))
  if (search?.trim()) {
    const s = search.trim().toLowerCase()
    list = list.filter(
      (p) =>
        (p.name?.toLowerCase().includes(s) ?? false) ||
        (p.username?.toLowerCase().includes(s) ?? false),
    )
  }
  return list.slice(0, 20).map((p) => ({
    id: p.id,
    name: p.name ?? 'Usuario',
    avatar_url: p.avatar_url ?? null,
  }))
}
