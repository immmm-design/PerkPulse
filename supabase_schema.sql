-- PerkPulse AI — Full Supabase Schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New Query)
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ────────────────────────────────────────────────────────────────────────────
-- SUBSCRIPTIONS TABLE
-- Created automatically for every new user via trigger below
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists subscriptions (
  user_id                 uuid        primary key references auth.users(id) on delete cascade,
  stripe_customer_id      text        unique,
  stripe_subscription_id  text        unique,
  subscription_status     text        not null default 'trialing',
  trial_start             timestamptz not null default now(),
  trial_end               timestamptz not null default (now() + interval '30 days'),
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean     not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table subscriptions enable row level security;

-- Users can read their own subscription; only service role can write (via webhook)
create policy "Users can view own subscription"
  on subscriptions for select
  using (auth.uid() = user_id);

-- Service role (webhook) writes go through the admin client (bypasses RLS)

-- Trigger: auto-create subscription row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, trial_start, trial_end)
  values (new.id, now(), now() + interval '30 days')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- USER CARDS TABLE
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists user_cards (
  user_card_id  text        primary key,
  user_id       uuid        not null references auth.users(id) on delete cascade,
  card_id       text        not null,
  nickname      text,
  active        boolean     not null default true,
  added_at      text        not null,
  created_at    timestamptz not null default now()
);

alter table user_cards enable row level security;

create policy "Users can manage their own cards"
  on user_cards for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- USAGE LOG TABLE
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists usage_log (
  usage_id    text        primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  benefit_id  text        not null,
  card_id     text        not null,
  usage_date  text        not null,
  amount_used numeric     not null default 0,
  user_note   text,
  created_at  timestamptz not null default now()
);

alter table usage_log enable row level security;

create policy "Users can manage their own usage log"
  on usage_log for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- CARD SETTINGS TABLE
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists card_settings (
  id          bigserial   primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  card_id     text        not null,
  setting_key text        not null,
  value       text        not null,
  updated_at  timestamptz not null default now(),
  unique (user_id, card_id, setting_key)
);

alter table card_settings enable row level security;

create policy "Users can manage their own card settings"
  on card_settings for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- OFFER UPDATES TABLE
-- ────────────────────────────────────────────────────────────────────────────
create table if not exists offer_updates (
  update_id           text        primary key,
  user_id             uuid        not null references auth.users(id) on delete cascade,
  issuer              text        not null,
  card_name           text        not null,
  title               text        not null,
  description         text        not null,
  deadline            text        not null,
  requires_enrollment boolean     not null default false,
  status              text        not null default 'active',
  created_at          timestamptz not null default now()
);

alter table offer_updates enable row level security;

create policy "Users can manage their own offer updates"
  on offer_updates for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ────────────────────────────────────────────────────────────────────────────
create index if not exists idx_user_cards_user_id    on user_cards(user_id);
create index if not exists idx_usage_log_user_id     on usage_log(user_id);
create index if not exists idx_usage_log_benefit_id  on usage_log(benefit_id);
create index if not exists idx_card_settings_user_id on card_settings(user_id);
create index if not exists idx_subscriptions_stripe  on subscriptions(stripe_customer_id);
