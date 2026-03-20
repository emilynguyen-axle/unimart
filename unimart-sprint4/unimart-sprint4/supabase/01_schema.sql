-- ============================================================
-- UniMart — Supabase Schema
-- Sprint 4: EP-05 & EP-06 · US-12 through US-15
-- Run AFTER Sprint 1, 2, and 3 schemas
-- ============================================================

-- ── 1. QA TEST RUNS ──────────────────────────────────────────
create table if not exists public.qa_test_runs (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  user_story      text,                          -- "US-12", "US-13", etc.
  test_type       text check (test_type in ('usability','integration','regression','load','a11y','e2e')),
  persona         text,                          -- "Customer", "Seller", "Driver", etc.
  sprint          integer default 4,
  status          text default 'Pending' check (status in ('Pending','In Progress','Passed','Failed','Blocked')),
  total_cases     integer default 0,
  passed_cases    integer default 0,
  failed_cases    integer default 0,
  blocked_cases   integer default 0,
  notes           text,
  run_by          text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 2. QA TEST CASES ─────────────────────────────────────────
create table if not exists public.qa_test_cases (
  id              uuid primary key default uuid_generate_v4(),
  run_id          uuid references public.qa_test_runs(id),
  title           text not null,
  steps           jsonb default '[]'::jsonb,
  expected_result text,
  actual_result   text,
  status          text default 'Pending' check (status in ('Pending','Passed','Failed','Blocked','Skipped')),
  severity        text default 'Medium' check (severity in ('Critical','High','Medium','Low')),
  bug_description text,
  screenshot_url  text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 3. BUG REPORTS ───────────────────────────────────────────
create table if not exists public.bug_reports (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  severity        text default 'Medium' check (severity in ('Critical','High','Medium','Low')),
  status          text default 'Open' check (status in ('Open','In Progress','Resolved','Wont Fix','Duplicate')),
  platform        text check (platform in ('Lovable','Replit','n8n','Supabase','Cross-platform')),
  user_story      text,
  steps_to_reproduce text,
  expected_result text,
  actual_result   text,
  assigned_to     text,
  resolved_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 4. AI VALIDATION RUNS ────────────────────────────────────
create table if not exists public.ai_validation_runs (
  id              uuid primary key default uuid_generate_v4(),
  feature         text not null,
  sprint          integer default 4,
  test_set_size   integer,
  metric_name     text not null,
  metric_value    numeric(10,4),
  threshold       numeric(10,4),
  passed          boolean,
  variant         text,                          -- for A/B tests
  notes           text,
  run_by          text,
  created_at      timestamptz default now()
);

-- ── 5. COMPLIANCE AUDIT ──────────────────────────────────────
create table if not exists public.compliance_audit_items (
  id              uuid primary key default uuid_generate_v4(),
  category        text check (category in ('Food Safety','Allergen','Data Privacy','Seller Terms','Community Standards','Refund Policy','AI Compliance','Fraud Controls')),
  title           text not null,
  description     text,
  status          text default 'Pending' check (status in ('Pending','Passed','Failed','In Review','N/A')),
  severity        text default 'High' check (severity in ('Critical','High','Medium','Low')),
  owner           text,
  evidence        text,
  remediation     text,
  reviewed_by     text,
  reviewed_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 6. USABILITY TEST RESULTS ────────────────────────────────
create table if not exists public.usability_results (
  id              uuid primary key default uuid_generate_v4(),
  persona         text not null,
  task            text not null,
  success         boolean,
  time_seconds    integer,
  difficulty_rating integer check (difficulty_rating between 1 and 5),
  quotes          text[],
  issues_found    text[],
  sprint          integer default 4,
  created_at      timestamptz default now()
);

-- ── 7. RETROSPECTIVE ─────────────────────────────────────────
create table if not exists public.retrospective_items (
  id              uuid primary key default uuid_generate_v4(),
  sprint          integer not null,
  category        text check (category in ('went_well','to_improve','action_items','shoutouts')),
  content         text not null,
  votes           integer default 0,
  owner           text,
  due_date        date,
  status          text default 'Open' check (status in ('Open','In Progress','Done')),
  created_at      timestamptz default now()
);

-- ── 8. STAKEHOLDER HANDOFF ───────────────────────────────────
create table if not exists public.handoff_items (
  id              uuid primary key default uuid_generate_v4(),
  section         text check (section in ('Executive Summary','Platform Handoff','AI Features','Risk Register','Next Phase','Appendix')),
  title           text not null,
  content         text,
  status          text default 'Draft' check (status in ('Draft','In Review','Approved')),
  approved_by     text,
  approved_at     timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── 9. SENTIMENT FEEDBACK ────────────────────────────────────
create table if not exists public.sentiment_feedback (
  id              uuid primary key default uuid_generate_v4(),
  source          text check (source in ('in_app','support_ticket','app_store','usability_test','survey')),
  vertical        text,
  sentiment       text check (sentiment in ('positive','neutral','negative')),
  score           numeric(3,2),                  -- -1.0 to 1.0
  feedback_text   text,
  category        text,
  sprint          integer default 4,
  created_at      timestamptz default now()
);

-- ── 10. SPRINT VELOCITY SNAPSHOTS (final) ────────────────────
-- Already created in Sprint 1, just confirming it exists

-- ── RLS ──────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'qa_test_runs','qa_test_cases','bug_reports','ai_validation_runs',
    'compliance_audit_items','usability_results','retrospective_items',
    'handoff_items','sentiment_feedback'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Public read %I" on public.%I for select using (true)', t, t);
    execute format('create policy "Allow anon insert %I" on public.%I for insert with check (true)', t, t);
    execute format('create policy "Auth manage %I" on public.%I for all using (auth.role() = ''authenticated'')', t, t);
  end loop;
end $$;

-- ── TRIGGERS ─────────────────────────────────────────────────
create trigger qa_runs_updated    before update on public.qa_test_runs          for each row execute function public.set_updated_at();
create trigger qa_cases_updated   before update on public.qa_test_cases         for each row execute function public.set_updated_at();
create trigger bugs_updated       before update on public.bug_reports            for each row execute function public.set_updated_at();
create trigger compliance_updated before update on public.compliance_audit_items for each row execute function public.set_updated_at();
create trigger handoff_updated    before update on public.handoff_items          for each row execute function public.set_updated_at();

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_qa_runs_sprint    on public.qa_test_runs(sprint);
create index if not exists idx_qa_cases_run      on public.qa_test_cases(run_id);
create index if not exists idx_bugs_severity     on public.bug_reports(severity, status);
create index if not exists idx_ai_val_feature    on public.ai_validation_runs(feature);
create index if not exists idx_compliance_cat    on public.compliance_audit_items(category);
create index if not exists idx_sentiment_source  on public.sentiment_feedback(source, sentiment);
create index if not exists idx_retro_sprint      on public.retrospective_items(sprint);
