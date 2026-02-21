-- =============================================================================
-- EVENT BOOKING APP - Schema aislado (no modifica public ni la app existente)
-- Ejecutar en Supabase SQL Editor. Para deshacer todo, ejecutar el bloque BORRAR.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CREAR: Ejecutar este bloque para instalar la DB de esta app
-- -----------------------------------------------------------------------------

-- Schema solo para esta app (la otra app sigue usando public.profiles)
create schema if not exists event_booking;

-- Perfiles de usuarios de esta app (id, name, username, intereses, role desde auth)
create table if not exists event_booking.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text,
  interests text[] default '{}',
  role text default 'user',
  created_at timestamptz default now()
);

alter table event_booking.profiles enable row level security;

drop policy if exists "event_booking_profiles_select_own" on event_booking.profiles;
drop policy if exists "event_booking_profiles_insert_own" on event_booking.profiles;
drop policy if exists "event_booking_profiles_update_own" on event_booking.profiles;

create policy "event_booking_profiles_select_own"
  on event_booking.profiles for select
  using (auth.uid() = id);

create policy "event_booking_profiles_insert_own"
  on event_booking.profiles for insert
  with check (auth.uid() = id);

create policy "event_booking_profiles_update_own"
  on event_booking.profiles for update
  using (auth.uid() = id);

-- Permitir a usuarios autenticados leer perfiles de otros (para amigos y mensajes)
create policy "event_booking_profiles_select_authenticated"
  on event_booking.profiles for select
  using (auth.role() = 'authenticated');

-- Trigger: al registrar un usuario (auth.users), crear fila en event_booking.profiles
-- No toca el trigger ni la tabla public.profiles de la otra app
create or replace function event_booking.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = event_booking, public
as $$
begin
  insert into event_booking.profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', null),
    coalesce(new.raw_user_meta_data ->> 'username', null)
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, event_booking.profiles.name),
    username = coalesce(excluded.username, event_booking.profiles.username);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_event_booking on auth.users;

create trigger on_auth_user_created_event_booking
  after insert on auth.users
  for each row
  execute function event_booking.handle_new_user();

-- Reservas: a nombre del usuario (user_id), por evento
create table if not exists event_booking.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  quantity int not null default 1,
  ticket_holder_name text,
  created_at timestamptz default now(),
  unique(user_id, event_id)
);

alter table event_booking.reservations enable row level security;

drop policy if exists "event_booking_reservations_select_own" on event_booking.reservations;
drop policy if exists "event_booking_reservations_insert_own" on event_booking.reservations;
drop policy if exists "event_booking_reservations_update_own" on event_booking.reservations;
drop policy if exists "event_booking_reservations_delete_own" on event_booking.reservations;

create policy "event_booking_reservations_select_own"
  on event_booking.reservations for select
  using (auth.uid() = user_id);

create policy "event_booking_reservations_insert_own"
  on event_booking.reservations for insert
  with check (auth.uid() = user_id);

create policy "event_booking_reservations_update_own"
  on event_booking.reservations for update
  using (auth.uid() = user_id);

create policy "event_booking_reservations_delete_own"
  on event_booking.reservations for delete
  using (auth.uid() = user_id);

-- Exponer el schema en la API (evita "Invalid schema: event_booking")
-- Ver también: Dashboard → Project Settings → API → Exposed schemas → añadir "event_booking"
grant usage on schema event_booking to anon, authenticated, service_role;
grant all on all tables in schema event_booking to anon, authenticated, service_role;
grant all on all routines in schema event_booking to anon, authenticated, service_role;
grant all on all sequences in schema event_booking to anon, authenticated, service_role;
alter default privileges for role postgres in schema event_booking
  grant all on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema event_booking
  grant all on routines to anon, authenticated, service_role;
alter default privileges for role postgres in schema event_booking
  grant all on sequences to anon, authenticated, service_role;
alter role authenticator set pgrst.db_schemas = 'public, event_booking';

-- Asegurar columnas opcionales si la tabla se creó antes
alter table event_booking.profiles add column if not exists interests text[] default '{}';
alter table event_booking.profiles add column if not exists role text default 'user';
alter table event_booking.profiles add column if not exists avatar_url text;
alter table event_booking.profiles add column if not exists location text;

-- Amigos: relación bidireccional (user_id añadió a friend_id; ambos se ven como amigos)
create table if not exists event_booking.friends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, friend_id),
  check (user_id != friend_id)
);
alter table event_booking.friends enable row level security;
drop policy if exists "event_booking_friends_select" on event_booking.friends;
drop policy if exists "event_booking_friends_insert" on event_booking.friends;
drop policy if exists "event_booking_friends_delete" on event_booking.friends;
create policy "event_booking_friends_select" on event_booking.friends for select using (auth.uid() = user_id or auth.uid() = friend_id);
create policy "event_booking_friends_insert" on event_booking.friends for insert with check (auth.uid() = user_id);
create policy "event_booking_friends_delete" on event_booking.friends for delete using (auth.uid() = user_id or auth.uid() = friend_id);

-- Chats: conversación entre dos usuarios (user1_id < user2_id para unicidad)
create table if not exists event_booking.chats (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references auth.users(id) on delete cascade,
  user2_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user1_id, user2_id),
  check (user1_id < user2_id)
);
alter table event_booking.chats enable row level security;
drop policy if exists "event_booking_chats_select" on event_booking.chats;
drop policy if exists "event_booking_chats_insert" on event_booking.chats;
create policy "event_booking_chats_select" on event_booking.chats for select using (auth.uid() = user1_id or auth.uid() = user2_id);
create policy "event_booking_chats_insert" on event_booking.chats for insert with check (auth.uid() = user1_id or auth.uid() = user2_id);

-- Mensajes de chat
create table if not exists event_booking.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references event_booking.chats(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
alter table event_booking.chat_messages enable row level security;
drop policy if exists "event_booking_chat_messages_select" on event_booking.chat_messages;
drop policy if exists "event_booking_chat_messages_insert" on event_booking.chat_messages;
create policy "event_booking_chat_messages_select" on event_booking.chat_messages for select
  using (exists (select 1 from event_booking.chats c where c.id = chat_id and (c.user1_id = auth.uid() or c.user2_id = auth.uid())));
create policy "event_booking_chat_messages_insert" on event_booking.chat_messages for insert
  with check (sender_id = auth.uid() and exists (select 1 from event_booking.chats c where c.id = chat_id and (c.user1_id = auth.uid() or c.user2_id = auth.uid())));

-- Asignar rol proveedor a los correos autorizados
update event_booking.profiles
set role = 'provider'
where id in (select id from auth.users where email in ('marlongeo1999@gmail.com', 'marlongeo1999+pro@gmail.com', 'allonsapp@outlook.com'));

notify pgrst, 'reload schema';

-- =============================================================================
-- BORRAR: Ejecutar este bloque cuando quieras quitar solo esta app (deja intacta
--         la DB de la otra app en public)
-- =============================================================================
/*
alter role authenticator reset pgrst.db_schemas;
drop trigger if exists on_auth_user_created_event_booking on auth.users;
drop function if exists event_booking.handle_new_user();
drop table if exists event_booking.reservations;
drop table if exists event_booking.profiles;
drop schema if exists event_booking cascade;
-- Nota: si ya ejecutaste el schema antes, para añadir role ejecuta solo:
-- alter table event_booking.profiles add column if not exists role text default 'user';
-- update event_booking.profiles set role = 'provider' where id in (select id from auth.users where email in ('marlongeo1999@gmail.com', 'marlongeo1999+pro@gmail.com', 'allonsapp@outlook.com'));
*/
