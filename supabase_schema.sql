-- PerkPulse Supabase Schema
-- Run this in the Supabase SQL editor to set up tables with RLS

-- ── User Cards ──────────────────────────────────────────────────────────────
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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Usage Log ────────────────────────────────────────────────────────────────
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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Card Settings ─────────────────────────────────────────────────────────────
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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── Offer Updates ─────────────────────────────────────────────────────────────
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
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
