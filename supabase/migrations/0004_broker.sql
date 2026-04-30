-- 0004_broker.sql
-- Creator-side broker trust surfaces (read-only, SnapTrade-backed in app code).

create table public.broker_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'snaptrade',
  snaptrade_user_id text,
  snaptrade_user_secret_id uuid,
  status broker_status not null default 'pending',
  connected_at timestamptz,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table public.broker_accounts (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.broker_connections(id) on delete cascade,
  external_id text not null,
  broker_name text,
  account_name text not null,
  currency text not null default 'USD',
  account_type text,
  cached_balance numeric(20,4),
  cached_balance_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, external_id)
);

create table public.broker_positions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.broker_accounts(id) on delete cascade,
  symbol text not null,
  quantity numeric(20,8) not null default 0,
  avg_price numeric(20,8),
  market_value numeric(20,4),
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, symbol)
);

create table public.broker_activities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.broker_accounts(id) on delete cascade,
  external_id text,
  type text not null,
  symbol text,
  quantity numeric(20,8),
  price numeric(20,8),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, external_id)
);

create table public.broker_visibility (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  show_positions boolean not null default false,
  show_balances boolean not null default false,
  show_activity boolean not null default false,
  show_broker_name boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index broker_connections_user_status_idx
  on public.broker_connections (user_id, status);

create index broker_accounts_connection_idx
  on public.broker_accounts (connection_id);

create index broker_positions_account_idx
  on public.broker_positions (account_id);

create index broker_activities_account_occurred_idx
  on public.broker_activities (account_id, occurred_at desc);

alter table public.broker_connections enable row level security;
alter table public.broker_accounts enable row level security;
alter table public.broker_positions enable row level security;
alter table public.broker_activities enable row level security;
alter table public.broker_visibility enable row level security;

create policy "broker_connections_owner_select"
on public.broker_connections for select
using (auth.uid() = user_id);

create policy "broker_connections_owner_insert"
on public.broker_connections for insert
with check (auth.uid() = user_id);

create policy "broker_connections_owner_update"
on public.broker_connections for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "broker_connections_owner_delete"
on public.broker_connections for delete
using (auth.uid() = user_id);

create policy "broker_accounts_owner_select"
on public.broker_accounts for select
using (
  exists (
    select 1
    from public.broker_connections bc
    where bc.id = broker_accounts.connection_id
      and bc.user_id = auth.uid()
  )
);

create policy "broker_positions_owner_select"
on public.broker_positions for select
using (
  exists (
    select 1
    from public.broker_accounts ba
    join public.broker_connections bc on bc.id = ba.connection_id
    where ba.id = broker_positions.account_id
      and bc.user_id = auth.uid()
  )
);

create policy "broker_activities_owner_select"
on public.broker_activities for select
using (
  exists (
    select 1
    from public.broker_accounts ba
    join public.broker_connections bc on bc.id = ba.connection_id
    where ba.id = broker_activities.account_id
      and bc.user_id = auth.uid()
  )
);

create policy "broker_visibility_public_select"
on public.broker_visibility for select
using (true);

create policy "broker_visibility_owner_insert"
on public.broker_visibility for insert
with check (auth.uid() = user_id);

create policy "broker_visibility_owner_update"
on public.broker_visibility for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.maintain_verified_broker(target_user_id uuid)
returns void
language plpgsql
as $$
declare
  has_connected boolean;
  has_visible boolean;
begin
  select exists (
    select 1
    from public.broker_connections bc
    where bc.user_id = target_user_id
      and bc.status = 'connected'
  ) into has_connected;

  select coalesce(show_positions, false)
      or coalesce(show_balances, false)
      or coalesce(show_activity, false)
      or coalesce(show_broker_name, false)
  from public.broker_visibility bv
  where bv.user_id = target_user_id
  into has_visible;

  update public.profiles
  set verified_broker = coalesce(has_connected, false) and coalesce(has_visible, false)
  where id = target_user_id;
end;
$$;

create or replace function public.broker_connections_set_verified()
returns trigger
language plpgsql
as $$
begin
  perform public.maintain_verified_broker(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

create or replace function public.broker_visibility_set_verified()
returns trigger
language plpgsql
as $$
begin
  perform public.maintain_verified_broker(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

create trigger broker_connections_set_verified_tg
after insert or update or delete on public.broker_connections
for each row execute function public.broker_connections_set_verified();

create trigger broker_visibility_set_verified_tg
after insert or update or delete on public.broker_visibility
for each row execute function public.broker_visibility_set_verified();

create trigger broker_connections_set_updated_at
before update on public.broker_connections
for each row execute function public.set_updated_at();

create trigger broker_accounts_set_updated_at
before update on public.broker_accounts
for each row execute function public.set_updated_at();

create trigger broker_positions_set_updated_at
before update on public.broker_positions
for each row execute function public.set_updated_at();

create trigger broker_visibility_set_updated_at
before update on public.broker_visibility
for each row execute function public.set_updated_at();

create or replace view public.public_broker_accounts as
select
  ba.id,
  bc.user_id,
  ba.account_name,
  case when bv.show_broker_name then ba.broker_name else null end as broker_name,
  ba.currency,
  case when bv.show_balances then ba.cached_balance else null end as cached_balance,
  ba.cached_balance_updated_at
from public.broker_accounts ba
join public.broker_connections bc on bc.id = ba.connection_id
left join public.broker_visibility bv on bv.user_id = bc.user_id
where bc.status = 'connected';

create or replace view public.public_broker_positions as
select
  bp.id,
  bc.user_id,
  bp.symbol,
  bp.quantity,
  bp.avg_price,
  case when bv.show_balances then bp.market_value else null end as market_value,
  bp.last_synced_at
from public.broker_positions bp
join public.broker_accounts ba on ba.id = bp.account_id
join public.broker_connections bc on bc.id = ba.connection_id
join public.broker_visibility bv on bv.user_id = bc.user_id
where bc.status = 'connected'
  and bv.show_positions = true;

create or replace view public.public_broker_activities as
select
  ba2.id,
  bc.user_id,
  ba2.type,
  ba2.symbol,
  ba2.quantity,
  ba2.price,
  ba2.occurred_at
from public.broker_activities ba2
join public.broker_accounts ba on ba.id = ba2.account_id
join public.broker_connections bc on bc.id = ba.connection_id
join public.broker_visibility bv on bv.user_id = bc.user_id
where bc.status = 'connected'
  and bv.show_activity = true;
