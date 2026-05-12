-- 0006_social_community_pivot.sql
-- Remove finance-specific surfaces and introduce community/reputation primitives.

-- -----------------------------------------------------------------------------
-- Remove finance-specific views, triggers, and functions
-- -----------------------------------------------------------------------------
drop view if exists public.public_broker_activities;
drop view if exists public.public_broker_positions;
drop view if exists public.public_broker_accounts;

drop trigger if exists broker_connections_set_verified_tg on public.broker_connections;
drop trigger if exists broker_visibility_set_verified_tg on public.broker_visibility;
drop trigger if exists broker_connections_set_updated_at on public.broker_connections;
drop trigger if exists broker_accounts_set_updated_at on public.broker_accounts;
drop trigger if exists broker_positions_set_updated_at on public.broker_positions;
drop trigger if exists broker_visibility_set_updated_at on public.broker_visibility;

drop function if exists public.broker_connections_set_verified();
drop function if exists public.broker_visibility_set_verified();
drop function if exists public.maintain_verified_broker(uuid);

-- -----------------------------------------------------------------------------
-- Drop finance-oriented tables
-- -----------------------------------------------------------------------------
drop table if exists public.broker_activities cascade;
drop table if exists public.broker_positions cascade;
drop table if exists public.broker_accounts cascade;
drop table if exists public.broker_connections cascade;
drop table if exists public.broker_visibility cascade;

drop table if exists public.ticker_news_summaries cascade;
drop table if exists public.ticker_summaries cascade;

drop table if exists public.subscriptions cascade;

-- Keep waitlist as a generic growth intake list but normalize source semantics.
update public.waitlist
set source = 'community'
where source is null or source in ('pricing', 'premium');

-- -----------------------------------------------------------------------------
-- Community and reputation core tables
-- -----------------------------------------------------------------------------
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  description text not null default '',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_memberships (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_reputation_scores (
  creator_id uuid primary key references public.profiles(id) on delete cascade,
  insight_quality int not null default 50 check (insight_quality between 0 and 100),
  consistency int not null default 50 check (consistency between 0 and 100),
  transparency int not null default 50 check (transparency between 0 and 100),
  community_trust int not null default 50 check (community_trust between 0 and 100),
  updated_at timestamptz not null default now()
);

create index if not exists communities_owner_idx
  on public.communities (owner_id);

create index if not exists community_memberships_user_idx
  on public.community_memberships (user_id);

create index if not exists community_posts_community_created_idx
  on public.community_posts (community_id, created_at desc);

alter table public.communities enable row level security;
alter table public.community_memberships enable row level security;
alter table public.community_posts enable row level security;
alter table public.creator_reputation_scores enable row level security;

create policy "communities_public_select"
on public.communities for select
using (true);

create policy "communities_owner_insert"
on public.communities for insert
with check (auth.uid() = owner_id);

create policy "communities_owner_update"
on public.communities for update
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "community_memberships_public_select"
on public.community_memberships for select
using (true);

create policy "community_memberships_owner_insert"
on public.community_memberships for insert
with check (auth.uid() = user_id);

create policy "community_memberships_owner_delete"
on public.community_memberships for delete
using (auth.uid() = user_id);

create policy "community_posts_public_select"
on public.community_posts for select
using (true);

create policy "community_posts_member_insert"
on public.community_posts for insert
with check (
  auth.uid() = author_id
  and exists (
    select 1
    from public.community_memberships cm
    where cm.community_id = community_posts.community_id
      and cm.user_id = auth.uid()
  )
);

create policy "community_posts_author_update"
on public.community_posts for update
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

create policy "community_posts_author_delete"
on public.community_posts for delete
using (auth.uid() = author_id);

create policy "creator_reputation_public_select"
on public.creator_reputation_scores for select
using (true);

create policy "creator_reputation_owner_upsert"
on public.creator_reputation_scores for insert
with check (auth.uid() = creator_id);

create policy "creator_reputation_owner_update"
on public.creator_reputation_scores for update
using (auth.uid() = creator_id)
with check (auth.uid() = creator_id);

