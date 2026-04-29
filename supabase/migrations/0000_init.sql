-- 0000_init.sql
-- Foundation: extensions, enums, shared trigger functions.
-- Append-only. Never edit a deployed migration.

-- =============================================================================
-- 1. Extensions
-- =============================================================================

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists citext;     -- case-insensitive text (handle, email)
create extension if not exists pg_trgm;    -- trigram indexes (ticker autocomplete)

-- Supabase Vault: encrypted secret storage (used in later migrations for
-- broker user secrets). In a fresh Supabase project the extension may already
-- be enabled via the dashboard. If it's not, uncomment the line below.
-- create extension if not exists "supabase_vault";

-- =============================================================================
-- 2. Enums
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'video_status') then
    create type public.video_status as enum (
      'pending', 'processing', 'ready', 'errored'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'video_visibility') then
    create type public.video_visibility as enum (
      'public', 'unlisted'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'room_status') then
    create type public.room_status as enum (
      'scheduled', 'live', 'ended'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'broker_status') then
    create type public.broker_status as enum (
      'pending', 'connected', 'disconnected', 'error'
    );
  end if;
end$$;

-- =============================================================================
-- 3. Shared trigger functions
-- =============================================================================

-- set_updated_at: maintain `updated_at` on any row update.
-- Attached to each table by its own migration.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at is
  'Shared trigger: sets new.updated_at = now() on any row update.';

-- handle_new_user: create a public.profiles row whenever a new auth.users row
-- is inserted. Body references public.profiles by name; PL/pgSQL defers
-- resolution until execution, so the trigger that calls this function is
-- attached in 0001 (after public.profiles exists).
--
-- security definer + explicit search_path follows Supabase's recommended
-- pattern for triggers that touch the public schema from auth.users events.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  base_handle  text;
  final_handle text;
  suffix       int := 0;
begin
  -- Derive a base handle from the email local-part. Strip anything that isn't
  -- a-z, 0-9, or underscore. Fall back to a uuid slice if nothing remains.
  base_handle := lower(regexp_replace(
    coalesce(split_part(new.email, '@', 1), ''),
    '[^a-z0-9_]', '', 'g'
  ));

  if base_handle is null or base_handle = '' then
    base_handle := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  -- Ensure uniqueness by appending an integer suffix on collision.
  final_handle := base_handle;
  while exists (
    select 1 from public.profiles where handle = final_handle::citext
  ) loop
    suffix := suffix + 1;
    final_handle := base_handle || suffix::text;
  end loop;

  insert into public.profiles (id, handle, display_name)
  values (
    new.id,
    final_handle,
    coalesce(new.raw_user_meta_data->>'full_name', final_handle)
  );

  return new;
end;
$$;

comment on function public.handle_new_user is
  'Auth trigger: creates a public.profiles row on auth.users insert. '
  'Trigger attachment lives in migration 0001.';
