'use server'

import { createClient } from '@/lib/supabase/server'

export type ChatPreview = {
  id: string
  otherUser: { id: string; name: string | null; avatar_url: string | null }
  lastMessage: string | null
  lastAt: string | null
}

export type ChatMessage = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export async function getChats(): Promise<ChatPreview[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: chats } = await supabase
    .schema('event_booking')
    .from('chats')
    .select('id, user1_id, user2_id')
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
  if (!chats?.length) return []

  const out: ChatPreview[] = []
  for (const c of chats) {
    const otherId = c.user1_id === user.id ? c.user2_id : c.user1_id
    const { data: profile } = await supabase
      .schema('event_booking')
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', otherId)
      .single()
    const { data: last } = await supabase
      .schema('event_booking')
      .from('chat_messages')
      .select('content, created_at')
      .eq('chat_id', c.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    out.push({
      id: c.id,
      otherUser: {
        id: otherId,
        name: profile?.name ?? 'Usuario',
        avatar_url: profile?.avatar_url ?? null,
      },
      lastMessage: last?.content ?? null,
      lastAt: last?.created_at ?? null,
    })
  }
  out.sort((a, b) => (b.lastAt ?? '').localeCompare(a.lastAt ?? ''))
  return out
}

export async function getOrCreateChat(otherUserId: string): Promise<{ chatId: string | null; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { chatId: null, error: 'No autenticado' }
  if (otherUserId === user.id) return { chatId: null, error: 'No puedes chatear contigo mismo' }

  const [u1, u2] = [user.id, otherUserId].sort()
  const { data: existing } = await supabase
    .schema('event_booking')
    .from('chats')
    .select('id')
    .eq('user1_id', u1)
    .eq('user2_id', u2)
    .single()
  if (existing) return { chatId: existing.id }

  const { data: created, error } = await supabase
    .schema('event_booking')
    .from('chats')
    .insert({ user1_id: u1, user2_id: u2 })
    .select('id')
    .single()
  if (error) return { chatId: null, error: error.message }
  return { chatId: created?.id ?? null }
}

export type ChatWithOther = {
  id: string
  otherUser: { id: string; name: string | null; avatar_url: string | null }
}

export async function getChatWithOther(chatId: string): Promise<ChatWithOther | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: chat } = await supabase
    .schema('event_booking')
    .from('chats')
    .select('id, user1_id, user2_id')
    .eq('id', chatId)
    .single()
  if (!chat) return null
  const otherId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id
  if (otherId !== chat.user1_id && otherId !== chat.user2_id) return null
  const { data: profile } = await supabase
    .schema('event_booking')
    .from('profiles')
    .select('id, name, avatar_url')
    .eq('id', otherId)
    .single()
  return {
    id: chat.id,
    otherUser: {
      id: otherId,
      name: profile?.name ?? 'Usuario',
      avatar_url: profile?.avatar_url ?? null,
    },
  }
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: chat } = await supabase
    .schema('event_booking')
    .from('chats')
    .select('id')
    .eq('id', chatId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single()
  if (!chat) return []

  const { data: messages } = await supabase
    .schema('event_booking')
    .from('chat_messages')
    .select('id, sender_id, content, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
  return (messages ?? []) as ChatMessage[]
}

export async function sendMessage(chatId: string, content: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }
  const text = content?.trim()
  if (!text) return { error: 'Mensaje vacío' }

  const { data: chat } = await supabase
    .schema('event_booking')
    .from('chats')
    .select('id')
    .eq('id', chatId)
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
    .single()
  if (!chat) return { error: 'Chat no encontrado' }

  const { error } = await supabase
    .schema('event_booking')
    .from('chat_messages')
    .insert({ chat_id: chatId, sender_id: user.id, content: text })
  return error ? { error: error.message } : {}
}
