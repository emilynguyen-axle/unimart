-- ============================================================
-- UniMart — Supabase Schema
-- Sprint 2: EP-02 (UX + AI Architecture) & EP-03 (Seller, Support & Compliance)
-- Run in Supabase SQL Editor AFTER Sprint 1 schema
-- ============================================================

-- ── 1. PROTOTYPES & UX ARTIFACTS ─────────────────────────────
create table if not exists public.ux_prototypes (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  persona       text,                          -- "Customer", "Seller", "Driver"
  fidelity      text default 'low-fi' check (fidelity in ('low-fi','mid-fi','high-fi')),
  figma_url     text,
  status        text default 'In Progress' check (status in ('In Progress','In Review','Approved')),
  a11y_passed   boolean default false,
  usability_tested boolean default false,
  sprint        integer default 2,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ── 2. USABILITY TEST SESSIONS ────────────────────────────────
create table if not exists public.usability_tests (
  id              uuid primary key default uuid_generate_v4(),
  prototype_id    uuid references public.ux_prototypes(id),
  persona         text not null,
  participant_count integer default 0,
  tasks           jsonb default '[]'::jsonb,
  findings        jsonb default '[]'::jsonb,
  severity_ratings jsonb default '{}'::jsonb,
  passed          boolean default false,
  sprint          integer default 2,
  created_at      timestamptz default now()
);

-- ── 3. AI ARCHITECTURE BLUEPRINTS ────────────────────────────
create table if not exists public.ai_blueprints (
  id              uuid primary key default uuid_generate_v4(),
  feature         text not null unique,
  description     text,
  platform        text,                        -- "Replit", "n8n", "Lovable"
  status          text default 'Designing' check (status in ('Designing','In Review','Approved','Building')),
  data_flow       jsonb default '{}'::jsonb,   -- input, processing, output
  api_endpoints   jsonb default '[]'::jsonb,
  performance_threshold text,
  sprint_designed integer default 2,
  sprint_build    integer default 3,
  approved_by     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 4. SELLERS ───────────────────────────────────────────────
create table if not exists public.sellers (
  id              uuid primary key default uuid_generate_v4(),
  business_name   text not null,
  contact_email   text unique not null,
  vertical        text check (vertical in ('Shop','Meal Kits','Food Delivery','Multi')),
  status          text default 'Pending' check (status in ('Pending','Under Review','Approved','Rejected','Suspended')),
  verified_badge  boolean default false,
  commission_rate numeric(5,2) default 12.00,
  documents       jsonb default '[]'::jsonb,
  compliance_status text default 'Unchecked' check (compliance_status in ('Unchecked','Passed','Failed','Flagged')),
  onboarded_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 5. PRODUCT LISTINGS ──────────────────────────────────────
create table if not exists public.listings (
  id              uuid primary key default uuid_generate_v4(),
  seller_id       uuid references public.sellers(id),
  title           text not null,
  description     text,
  vertical        text check (vertical in ('Shop','Meal Kits','Food Delivery')),
  price           numeric(10,2),
  category        text,
  allergens       text[],
  ingredients     text[],
  images          text[],
  compliance_status text default 'Unchecked' check (compliance_status in ('Unchecked','Passed','Failed','Flagged')),
  compliance_flags  jsonb default '[]'::jsonb,
  is_published    boolean default false,
  nutritionist_approved boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 6. COMPLIANCE CHECKS ─────────────────────────────────────
create table if not exists public.compliance_checks (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references public.listings(id),
  seller_id       uuid references public.sellers(id),
  check_type      text check (check_type in ('pre-publish','manual','scheduled')),
  status          text default 'Pending' check (status in ('Pending','Passed','Failed','Flagged')),
  flags           jsonb default '[]'::jsonb,
  -- flag format: [{ rule, severity, message, field }]
  checked_at      timestamptz,
  reviewed_by     text,
  created_at      timestamptz default now()
);

-- ── 7. SUPPORT TICKETS ───────────────────────────────────────
create table if not exists public.support_tickets (
  id              uuid primary key default uuid_generate_v4(),
  customer_email  text,
  vertical        text check (vertical in ('Shop','Meal Kits','Food Delivery')),
  issue_type      text check (issue_type in ('Wrong Item','Late Delivery','Missing Ingredient','Cold Food','Refund Request','Other')),
  status          text default 'Open' check (status in ('Open','In Progress','Resolved','Escalated')),
  resolution_flow text,                        -- which vertical flow was used
  ai_suggested_response text,
  sla_hours       integer,
  resolved_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 8. REFUND REQUESTS ───────────────────────────────────────
create table if not exists public.refund_requests (
  id              uuid primary key default uuid_generate_v4(),
  ticket_id       uuid references public.support_tickets(id),
  vertical        text check (vertical in ('Shop','Meal Kits','Food Delivery')),
  amount          numeric(10,2),
  reason          text,
  status          text default 'Pending' check (status in ('Pending','Approved','Rejected','Processed')),
  processed_at    timestamptz,
  created_at      timestamptz default now()
);

-- ── 9. FRAUD FLAGS ───────────────────────────────────────────
create table if not exists public.fraud_flags (
  id              uuid primary key default uuid_generate_v4(),
  entity_type     text check (entity_type in ('order','seller','review','listing')),
  entity_id       uuid,
  signals         jsonb default '[]'::jsonb,
  -- signals: [{ type, score, detail }]
  risk_score      numeric(5,2),
  status          text default 'Flagged' check (status in ('Flagged','Under Review','Cleared','Confirmed Fraud')),
  reviewed_by     text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 10. FAKE REVIEW FLAGS ────────────────────────────────────
create table if not exists public.review_flags (
  id              uuid primary key default uuid_generate_v4(),
  listing_id      uuid references public.listings(id),
  reviewer_email  text,
  review_text     text,
  rating          integer check (rating between 1 and 5),
  flag_reasons    text[],
  status          text default 'Quarantined' check (status in ('Quarantined','Cleared','Confirmed Fake')),
  created_at      timestamptz default now()
);

-- ── 11. SLA STANDARDS ────────────────────────────────────────
create table if not exists public.sla_standards (
  id              uuid primary key default uuid_generate_v4(),
  vertical        text not null check (vertical in ('Shop','Meal Kits','Food Delivery')),
  issue_type      text not null,
  response_hours  integer not null,
  resolution_hours integer not null,
  refund_eligible boolean default true,
  policy_notes    text,
  created_at      timestamptz default now()
);

-- ── 12. AI MODEL PERFORMANCE LOGS ────────────────────────────
create table if not exists public.ai_performance_logs (
  id              uuid primary key default uuid_generate_v4(),
  feature         text not null,              -- "recommendations", "conversational_ai", etc.
  test_run_id     text,
  metric_name     text not null,              -- "resolution_rate", "false_positive_rate", etc.
  metric_value    numeric(10,4),
  threshold       numeric(10,4),
  passed          boolean,
  sprint          integer,
  logged_at       timestamptz default now()
);

-- ── RLS POLICIES ─────────────────────────────────────────────
alter table public.ux_prototypes       enable row level security;
alter table public.usability_tests     enable row level security;
alter table public.ai_blueprints       enable row level security;
alter table public.sellers             enable row level security;
alter table public.listings            enable row level security;
alter table public.compliance_checks   enable row level security;
alter table public.support_tickets     enable row level security;
alter table public.refund_requests     enable row level security;
alter table public.fraud_flags         enable row level security;
alter table public.review_flags        enable row level security;
alter table public.sla_standards       enable row level security;
alter table public.ai_performance_logs enable row level security;

-- Public read, authenticated write for all Sprint 2 tables
do $$ 
declare t text;
begin
  foreach t in array array[
    'ux_prototypes','usability_tests','ai_blueprints','sellers','listings',
    'compliance_checks','support_tickets','refund_requests','fraud_flags',
    'review_flags','sla_standards','ai_performance_logs'
  ] loop
    execute format('create policy "Public read %I" on public.%I for select using (true)', t, t);
    execute format('create policy "Auth manage %I" on public.%I for all using (auth.role() = ''authenticated'')', t, t);
  end loop;
end $$;

-- ── TRIGGERS ─────────────────────────────────────────────────
create trigger ux_prototypes_updated_at   before update on public.ux_prototypes   for each row execute function public.set_updated_at();
create trigger ai_blueprints_updated_at   before update on public.ai_blueprints   for each row execute function public.set_updated_at();
create trigger sellers_updated_at         before update on public.sellers          for each row execute function public.set_updated_at();
create trigger listings_updated_at        before update on public.listings         for each row execute function public.set_updated_at();
create trigger support_tickets_updated_at before update on public.support_tickets  for each row execute function public.set_updated_at();
create trigger fraud_flags_updated_at     before update on public.fraud_flags      for each row execute function public.set_updated_at();

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_listings_seller       on public.listings(seller_id);
create index if not exists idx_listings_vertical     on public.listings(vertical);
create index if not exists idx_listings_compliance   on public.listings(compliance_status);
create index if not exists idx_compliance_listing    on public.compliance_checks(listing_id);
create index if not exists idx_support_vertical      on public.support_tickets(vertical);
create index if not exists idx_support_status        on public.support_tickets(status);
create index if not exists idx_fraud_entity          on public.fraud_flags(entity_type, entity_id);
create index if not exists idx_ai_perf_feature       on public.ai_performance_logs(feature);
