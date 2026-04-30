-- 0002_live_rooms.sql
-- Tables: live_rooms, room_tickers.
-- Notes:
--   * room_tickers is created now even though tagging UI lands in M3.
--   * live_rooms.recording_video_id FK to videos (M2 recording handover).
--   * RLS enabled with explicit policies. Default deny.

-- =============================================================================
-- live_rooms
-- =============================================================================

create table public.live_rooms (
  id                  uuid              primary key default gen_random_uuid(),
  creator_id          uuid              not null references public.profiles(id) on delete cascade,
  title               text              not null,
  description         text              not null default '',
  status              public.room_status not null default 'scheduled',
  livekit_room_name   text              not null unique,
  scheduled_at        timestamptz,
  started_at          timestamptz,
  ended_at            timestamptz,
  viewer_count        int               not null default 0,
  recording_video_id  uuid              references public.videos(id) on delete set null,
  created_at          timestamptz       not null default now(),
  updated_at          timestamptz       not null default now()
);

create index live_rooms_creator_idx
  on public.live_rooms (creator_id, started_at desc nulls last);

create index live_rooms_status_idx
  on public.live_rooms (status);

create index live_rooms_recording_idx
  on public.live_rooms (recording_video_id)
  where recording_video_id is not null;

-- updated_at maintenance
create trigger live_rooms_set_updated_at
before update on public.live_rooms
for each row execute function public.set_updated_at();

-- timestamp maintainer: set started_at when status flips to 'live',
-- ended_at when it flips to 'ended'.
create or replace function public.live_rooms_set_lifecycle_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'live'
     and (old.status is distinct from 'live')
     and new.started_at is null then
    new.started_at := now();
  end if;
  if new.status = 'ended'
     and (old.status is distinct from 'ended')
     and new.ended_at is null then
    new.ended_at := now();
  end if;
  return new;
end;
$$;

create trigger live_rooms_set_lifecycle_at_biud
before update of status on public.live_rooms
for each row execute function public.live_rooms_set_lifecycle_at();

alter table public.live_rooms enable row level security;

-- Public can see scheduled, live, and ended rooms. Drafts (none in V1) would
-- be filtered out here.
create policy "live_rooms_public_select"
on public.live_rooms for select
using (status in ('scheduled', 'live', 'ended'));

create policy "live_rooms_owner_insert"
on public.live_rooms for insert
with check (auth.uid() = creator_id);

create policy "live_rooms_owner_update"
on public.live_rooms for update
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

create policy "live_rooms_owner_delete"
on public.live_rooms for delete
using (auth.uid() = creator_id);

-- =============================================================================
-- room_tickers (join; M3 surfaces the UI but we add the table now to keep
-- schema migrations append-only and cohesive)
-- =============================================================================

create table public.room_tickers (
  room_id   uuid not null references public.live_rooms(id) on delete cascade,
  ticker_id uuid not null references public.tickers(id)   on delete cascade,
  primary key (room_id, ticker_id)
);

create index room_tickers_ticker_idx
  on public.room_tickers (ticker_id);

alter table public.room_tickers enable row level security;

-- Visible to anyone if the parent room is publicly visible, or to the owner.
create policy "room_tickers_select"
on public.room_tickers for select
using (
  exists (
    select 1 from public.live_rooms r
    where r.id = room_tickers.room_id
      and (
        r.status in ('scheduled', 'live', 'ended')
        or r.creator_id = auth.uid()
      )
  )
);

-- Only the owner of the parent room can attach/detach tickers.
create policy "room_tickers_owner_insert"
on public.room_tickers for insert
with check (
  exists (
    select 1 from public.live_rooms r
    where r.id = room_tickers.room_id
      and r.creator_id = auth.uid()
  )
);

create policy "room_tickers_owner_delete"
on public.room_tickers for delete
using (
  exists (
    select 1 from public.live_rooms r
    where r.id = room_tickers.room_id
      and r.creator_id = auth.uid()
  )
);
