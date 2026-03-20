-- ============================================================
-- UniMart — Supabase Schema
-- Sprint 1: EP-01 · US-01 & US-02
-- Run in Supabase SQL Editor: https://app.supabase.com/project/YOUR_PROJECT/sql
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── 1. SQUADS ─────────────────────────────────────────────────
create table if not exists public.squads (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null unique,
  lead_name   text,
  lead_email  text,
  color_hex   text default '#7C6AF7',
  created_at  timestamptz default now()
);

alter table public.squads enable row level security;
create policy "Public read squads" on public.squads for select using (true);
create policy "Auth insert squads" on public.squads for insert with check (auth.role() = 'authenticated');
create policy "Auth update squads" on public.squads for update using (auth.role() = 'authenticated');

-- ── 2. TEAM MEMBERS ──────────────────────────────────────────
create table if not exists public.team_members (
  id          uuid primary key default uuid_generate_v4(),
  full_name   text not null,
  email       text unique not null,
  role        text not null,
  squad_id    uuid references public.squads(id),
  onboarded   boolean default false,
  created_at  timestamptz default now()
);

alter table public.team_members enable row level security;
create policy "Public read members" on public.team_members for select using (true);
create policy "Auth manage members" on public.team_members for all using (auth.role() = 'authenticated');

-- ── 3. EPICS ─────────────────────────────────────────────────
create table if not exists public.epics (
  id            uuid primary key default uuid_generate_v4(),
  epic_id       text not null unique,  -- e.g. "EP-01"
  name          text not null,
  sprints       text not null,         -- e.g. "1"
  platforms     text,
  strategic_focus text,
  status        text default 'Active' check (status in ('Active','Completed','On Hold')),
  created_at    timestamptz default now()
);

alter table public.epics enable row level security;
create policy "Public read epics" on public.epics for select using (true);
create policy "Auth manage epics" on public.epics for all using (auth.role() = 'authenticated');

-- ── 4. USER STORIES ──────────────────────────────────────────
create table if not exists public.user_stories (
  id                uuid primary key default uuid_generate_v4(),
  story_id          text not null unique,   -- e.g. "US-01"
  epic_id           uuid references public.epics(id),
  title             text not null,
  description       text,
  sprint            integer not null,
  status            text default 'Backlog' check (status in ('Backlog','To Do','In Progress','Review','Done')),
  assigned_squad    text,
  acceptance_criteria jsonb,               -- array of strings
  definition_of_done  jsonb,               -- array of strings
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

alter table public.user_stories enable row level security;
create policy "Public read stories" on public.user_stories for select using (true);
create policy "Auth manage stories" on public.user_stories for all using (auth.role() = 'authenticated');

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_stories_updated_at
  before update on public.user_stories
  for each row execute function public.set_updated_at();

-- ── 5. SPRINT TICKETS (Kanban) ───────────────────────────────
create table if not exists public.sprint_tickets (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  epic        text,                         -- "EP-01"
  story_id    text,                         -- "US-01"
  sprint      integer not null default 1,
  squad       text,
  assignee    text,
  priority    text default 'Medium' check (priority in ('High','Medium','Low')),
  status      text default 'Backlog' check (status in ('Backlog','To Do','In Progress','Review','Done')),
  tags        text[],
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.sprint_tickets enable row level security;
create policy "Public read tickets" on public.sprint_tickets for select using (true);
create policy "Auth manage tickets" on public.sprint_tickets for all using (auth.role() = 'authenticated');

create trigger sprint_tickets_updated_at
  before update on public.sprint_tickets
  for each row execute function public.set_updated_at();

-- ── 6. EMPATHY MAPS ──────────────────────────────────────────
create table if not exists public.empathy_maps (
  id          uuid primary key default uuid_generate_v4(),
  user_group  text not null unique,
  map_data    jsonb not null default '{
    "thinks": ["","",""],
    "feels": ["","",""],
    "says": ["","",""],
    "does": ["","",""],
    "pain_points": ["","",""],
    "gains": ["","",""]
  }'::jsonb,
  is_complete boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.empathy_maps enable row level security;
create policy "Public read maps" on public.empathy_maps for select using (true);
create policy "Auth manage maps" on public.empathy_maps for all using (auth.role() = 'authenticated');

create trigger empathy_maps_updated_at
  before update on public.empathy_maps
  for each row execute function public.set_updated_at();

-- ── 7. HCD CHALLENGE PRIORITIES ──────────────────────────────
create table if not exists public.hcd_challenge_priorities (
  id          uuid primary key default uuid_generate_v4(),
  challenge   text not null unique,
  prioritised boolean default false,
  severity    text default 'Medium' check (severity in ('High','Medium','Low')),
  frequency   text default 'Medium' check (frequency in ('High','Medium','Low')),
  notes       text,
  updated_at  timestamptz default now()
);

alter table public.hcd_challenge_priorities enable row level security;
create policy "Public read hcd" on public.hcd_challenge_priorities for select using (true);
create policy "Auth manage hcd" on public.hcd_challenge_priorities for all using (auth.role() = 'authenticated');

-- ── 8. JOURNEY MAPS ──────────────────────────────────────────
create table if not exists public.journey_maps (
  id          uuid primary key default uuid_generate_v4(),
  persona     text not null,             -- e.g. "Customer", "Seller", "Delivery Driver"
  stages      jsonb not null default '[]'::jsonb,
  -- stages format: [{ name, actions, thoughts, feelings, pain_points, opportunities }]
  is_approved boolean default false,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table public.journey_maps enable row level security;
create policy "Public read journeys" on public.journey_maps for select using (true);
create policy "Auth manage journeys" on public.journey_maps for all using (auth.role() = 'authenticated');

-- ── 9. SPRINT CEREMONIES ─────────────────────────────────────
create table if not exists public.sprint_ceremonies (
  id          uuid primary key default uuid_generate_v4(),
  sprint      integer not null,
  type        text not null check (type in ('Planning','Stand-up','Review','Retrospective')),
  scheduled_at timestamptz not null,
  notes       text,
  action_items jsonb default '[]'::jsonb,
  created_at  timestamptz default now()
);

alter table public.sprint_ceremonies enable row level security;
create policy "Public read ceremonies" on public.sprint_ceremonies for select using (true);
create policy "Auth manage ceremonies" on public.sprint_ceremonies for all using (auth.role() = 'authenticated');

-- ── 10. WORKING AGREEMENTS ───────────────────────────────────
create table if not exists public.working_agreements (
  id          uuid primary key default uuid_generate_v4(),
  category    text not null,   -- e.g. "Communication", "Code", "Ceremonies"
  agreement   text not null,
  approved    boolean default false,
  created_at  timestamptz default now()
);

alter table public.working_agreements enable row level security;
create policy "Public read agreements" on public.working_agreements for select using (true);
create policy "Auth manage agreements" on public.working_agreements for all using (auth.role() = 'authenticated');

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_sprint_tickets_sprint on public.sprint_tickets(sprint);
create index if not exists idx_sprint_tickets_status on public.sprint_tickets(status);
create index if not exists idx_sprint_tickets_squad  on public.sprint_tickets(squad);
create index if not exists idx_user_stories_sprint   on public.user_stories(sprint);
create index if not exists idx_empathy_maps_group    on public.empathy_maps(user_group);
