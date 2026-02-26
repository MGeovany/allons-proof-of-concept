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
drop policy if exists "event_booking_profiles_select_authenticated" on event_booking.profiles;

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
declare
  avatar text;
  email_lc text;
begin
  avatar := coalesce(
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'picture',
    null
  );
  email_lc := case when new.email is null then null else lower(new.email) end;
  insert into event_booking.profiles (id, name, username, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', null),
    coalesce(new.raw_user_meta_data ->> 'username', null),
    avatar,
    email_lc
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, event_booking.profiles.name),
    username = coalesce(excluded.username, event_booking.profiles.username),
    avatar_url = coalesce(excluded.avatar_url, event_booking.profiles.avatar_url),
    email = coalesce(excluded.email, event_booking.profiles.email);

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

-- Tickets individuales por reserva (1 fila = 1 entrada, permite regalar/redimir)
create table if not exists event_booking.reservation_tickets (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references event_booking.reservations(id) on delete cascade,
  event_id text not null,
  purchaser_id uuid not null references auth.users(id) on delete cascade,
  owner_user_id uuid references auth.users(id) on delete set null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  recipient_email text,
  status text not null default 'owned' check (status in ('owned', 'gift_pending', 'claimed')),
  gift_token uuid unique,
  gifted_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists idx_reservation_tickets_reservation_id
  on event_booking.reservation_tickets(reservation_id);
create index if not exists idx_reservation_tickets_event_id
  on event_booking.reservation_tickets(event_id);
create index if not exists idx_reservation_tickets_owner_user_id
  on event_booking.reservation_tickets(owner_user_id) where owner_user_id is not null;
create index if not exists idx_reservation_tickets_purchaser_id
  on event_booking.reservation_tickets(purchaser_id);
create index if not exists idx_reservation_tickets_recipient_user_id
  on event_booking.reservation_tickets(recipient_user_id) where recipient_user_id is not null;
create index if not exists idx_reservation_tickets_gift_token
  on event_booking.reservation_tickets(gift_token) where gift_token is not null;
create index if not exists idx_reservation_tickets_recipient_email
  on event_booking.reservation_tickets(recipient_email) where recipient_email is not null;

alter table event_booking.reservation_tickets enable row level security;

drop policy if exists "event_booking_reservation_tickets_select" on event_booking.reservation_tickets;
drop policy if exists "event_booking_reservation_tickets_insert" on event_booking.reservation_tickets;
drop policy if exists "event_booking_reservation_tickets_update" on event_booking.reservation_tickets;

create policy "event_booking_reservation_tickets_select"
  on event_booking.reservation_tickets for select
  using (
    auth.uid() = purchaser_id
    or auth.uid() = owner_user_id
    or auth.uid() = recipient_user_id
  );

create policy "event_booking_reservation_tickets_insert"
  on event_booking.reservation_tickets for insert
  with check (auth.uid() = purchaser_id);

create policy "event_booking_reservation_tickets_update"
  on event_booking.reservation_tickets for update
  using (
    auth.uid() = purchaser_id
    or (auth.uid() = recipient_user_id and status = 'gift_pending')
  );

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
alter table event_booking.profiles add column if not exists email text;

-- Email de perfiles (para buscar usuarios por correo al regalar tickets)
create unique index if not exists idx_event_booking_profiles_email
  on event_booking.profiles(email)
  where email is not null;

-- Backfill de email desde auth.users (ejecutar en SQL Editor con permisos)
update event_booking.profiles p
set email = lower(u.email)
from auth.users u
where u.id = p.id and p.email is null and u.email is not null;

-- Backfill de tickets existentes (1 fila por entrada), idempotente
insert into event_booking.reservation_tickets (reservation_id, event_id, purchaser_id, owner_user_id, status)
select r.id, r.event_id, r.user_id, r.user_id, 'owned'
from event_booking.reservations r
join lateral (
  select greatest(
    r.quantity - coalesce((select count(*) from event_booking.reservation_tickets t where t.reservation_id = r.id), 0),
    0
  ) as missing
) m on true
join lateral generate_series(1, m.missing) gs(i) on true;

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

-- Habilitar Realtime para mensajes (ejecutar en SQL Editor si usas chat en tiempo real):
-- 1) Añadir tabla a la publicación
-- alter publication supabase_realtime add table event_booking.chat_messages;
-- 2) En schemas privados, Realtime necesita SELECT para el rol del JWT (authenticated):
-- grant select on event_booking.chat_messages to authenticated;

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
