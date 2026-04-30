-- 0005_waitlist_subscriptions.sql

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text not null default 'pricing',
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_status_idx
  on public.subscriptions (user_id, status);

alter table public.waitlist enable row level security;
alter table public.subscriptions enable row level security;

create policy "waitlist_public_insert"
on public.waitlist for insert
with check (true);

create policy "subscriptions_owner_select"
on public.subscriptions for select
using (auth.uid() = user_id);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();
