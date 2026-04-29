-- 0001_profiles_videos_tickers.sql
-- Tables: profiles, tickers, videos, video_tickers.
-- RLS: enabled on every table with explicit policies. Default deny.
-- Triggers: handle canonicalization, set_updated_at, published_at maintainer,
--           handle_new_user attachment to auth.users.

-- =============================================================================
-- profiles
-- =============================================================================

create table public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  handle          citext      not null unique,
  display_name    text,
  avatar_url      text,
  banner_url      text,
  bio             text,
  socials         jsonb       not null default '{}'::jsonb,
  verified_broker boolean     not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

comment on column public.profiles.verified_broker is
  'Maintained by trigger (added in a later migration). Not writable from app code.';

-- Lower-case canonicalization for URL display.
-- citext makes comparisons case-insensitive; this keeps storage canonical.
create or replace function public.profiles_lower_handle()
returns trigger
language plpgsql
as $$
begin
  if new.handle is not null then
    new.handle := lower(new.handle::text)::citext;
  end if;
  return new;
end;
$$;

create trigger profiles_lower_handle_biud
before insert or update of handle on public.profiles
for each row execute function public.profiles_lower_handle();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Now that public.profiles exists, attach handle_new_user (defined in 0000)
-- to auth.users.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Defense-in-depth: prevent the `verified_broker` column from being updated
-- by anyone except the service role. The maintainer trigger (added in a later
-- migration) runs as service role / table owner and so is unaffected.
revoke update (verified_broker) on public.profiles from anon, authenticated;

alter table public.profiles enable row level security;

create policy "profiles_public_select"
on public.profiles for select
using (true);

create policy "profiles_owner_insert"
on public.profiles for insert
with check (auth.uid() = id);

create policy "profiles_owner_update"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_owner_delete"
on public.profiles for delete
using (auth.uid() = id);

-- =============================================================================
-- tickers (curated reference; service role writes only)
-- =============================================================================

create table public.tickers (
  id       uuid primary key default gen_random_uuid(),
  symbol   text not null unique,
  name     text not null,
  exchange text,
  sector   text,
  country  text
);

-- Uppercase symbols on insert/update.
create or replace function public.tickers_upper_symbol()
returns trigger
language plpgsql
as $$
begin
  if new.symbol is not null then
    new.symbol := upper(new.symbol);
  end if;
  return new;
end;
$$;

create trigger tickers_upper_symbol_biud
before insert or update of symbol on public.tickers
for each row execute function public.tickers_upper_symbol();

create index tickers_symbol_trgm_idx
on public.tickers using gin (symbol gin_trgm_ops);

create index tickers_name_trgm_idx
on public.tickers using gin (name gin_trgm_ops);

alter table public.tickers enable row level security;

create policy "tickers_public_select"
on public.tickers for select
using (true);

-- No insert/update/delete policies for anon or authenticated.
-- Writes happen through the service role only.

-- =============================================================================
-- videos
-- =============================================================================

create table public.videos (
  id               uuid                     primary key default gen_random_uuid(),
  creator_id       uuid                     not null references public.profiles(id) on delete cascade,
  title            text                     not null,
  description      text                     not null default '',
  status           public.video_status      not null default 'pending',
  visibility       public.video_visibility  not null default 'public',
  mux_asset_id     text,
  mux_playback_id  text,
  mux_upload_id    text,
  duration_seconds int,
  thumbnail_url    text,
  published_at     timestamptz,
  created_at       timestamptz              not null default now(),
  updated_at       timestamptz              not null default now()
);

create index videos_creator_published_idx
on public.videos (creator_id, published_at desc);

create index videos_status_visibility_idx
on public.videos (status, visibility);

-- published_at maintainer: set when the video first becomes ready+public.
create or replace function public.videos_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'ready'
     and new.visibility = 'public'
     and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger videos_set_published_at_biud
before insert or update of status, visibility on public.videos
for each row execute function public.videos_set_published_at();

create trigger videos_set_updated_at
before update on public.videos
for each row execute function public.set_updated_at();

alter table public.videos enable row level security;

create policy "videos_public_select"
on public.videos for select
using (status = 'ready' and visibility = 'public');

create policy "videos_owner_select"
on public.videos for select
using (auth.uid() = creator_id);

create policy "videos_owner_insert"
on public.videos for insert
with check (auth.uid() = creator_id);

create policy "videos_owner_update"
on public.videos for update
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

create policy "videos_owner_delete"
on public.videos for delete
using (auth.uid() = creator_id);

-- =============================================================================
-- video_tickers (join)
-- =============================================================================

create table public.video_tickers (
  video_id  uuid not null references public.videos(id)  on delete cascade,
  ticker_id uuid not null references public.tickers(id) on delete cascade,
  primary key (video_id, ticker_id)
);

create index video_tickers_ticker_idx
on public.video_tickers (ticker_id);

alter table public.video_tickers enable row level security;

-- Visible to anyone if the parent video is public+ready, or to the owner.
create policy "video_tickers_select"
on public.video_tickers for select
using (
  exists (
    select 1 from public.videos v
    where v.id = video_tickers.video_id
      and (
        (v.status = 'ready' and v.visibility = 'public')
        or v.creator_id = auth.uid()
      )
  )
);

-- Only the owner of the parent video can attach/detach tickers.
create policy "video_tickers_owner_insert"
on public.video_tickers for insert
with check (
  exists (
    select 1 from public.videos v
    where v.id = video_tickers.video_id
      and v.creator_id = auth.uid()
  )
);

create policy "video_tickers_owner_delete"
on public.video_tickers for delete
using (
  exists (
    select 1 from public.videos v
    where v.id = video_tickers.video_id
      and v.creator_id = auth.uid()
  )
);

-- No update policy: join rows are immutable. Detach + re-attach instead.
