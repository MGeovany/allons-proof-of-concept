-- =============================================================================
-- EVENT BOOKING APP - Schema aislado (no modifica public ni la app existente)
-- Ejecutar en Supabase SQL Editor. Para deshacer todo, ejecutar el bloque BORRAR.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- CREAR: Ejecutar este bloque para instalar la DB de esta app
-- -----------------------------------------------------------------------------

-- Schema solo para esta app (la otra app sigue usando public.profiles)
create schema if not exists event_booking;

-- Perfiles de usuarios de esta app (id, name, username desde auth)
create table if not exists event_booking.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  username text,
  created_at timestamptz default now()
);

alter table event_booking.profiles enable row level security;

create policy "event_booking_profiles_select_own"
  on event_booking.profiles for select
  using (auth.uid() = id);

create policy "event_booking_profiles_insert_own"
  on event_booking.profiles for insert
  with check (auth.uid() = id);

create policy "event_booking_profiles_update_own"
  on event_booking.profiles for update
  using (auth.uid() = id);

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


-- =============================================================================
-- BORRAR: Ejecutar este bloque cuando quieras quitar solo esta app (deja intacta
--         la DB de la otra app en public)
-- =============================================================================
/*
drop trigger if exists on_auth_user_created_event_booking on auth.users;
drop function if exists event_booking.handle_new_user();
drop table if exists event_booking.profiles;
drop schema if exists event_booking cascade;
*/
