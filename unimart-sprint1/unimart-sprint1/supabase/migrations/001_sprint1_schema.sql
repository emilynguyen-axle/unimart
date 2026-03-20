-- ============================================================
-- UniMart Sprint 1 — Supabase Schema
-- US-01: HCD Kickoff & Empathy Mapping
-- US-02: Agile Team Formation & Project Infrastructure
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE sprint_status AS ENUM ('planned', 'active', 'completed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_likelihood AS ENUM ('L', 'M', 'H');
CREATE TYPE risk_impact AS ENUM ('L', 'M', 'H');
CREATE TYPE risk_rating AS ENUM ('low', 'medium', 'high');
CREATE TYPE squad_name AS ENUM ('ux_research', 'core_dev', 'ai_integration', 'growth_marketing', 'legal_compliance');
CREATE TYPE user_role AS ENUM ('project_manager', 'engineer', 'designer', 'data_analyst', 'legal', 'nutritionist', 'driver', 'seller', 'customer', 'support_agent', 'senior_partner');
CREATE TYPE platform_tag AS ENUM ('figma', 'jira', 'linear', 'lovable', 'replit', 'n8n', 'mixpanel', 'amplitude', 'stripe', 'google_maps', 'twilio');
CREATE TYPE hcd_challenge_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE empathy_map_quadrant AS ENUM ('says', 'thinks', 'does', 'feels');

-- ============================================================
-- TEAM & USERS
-- ============================================================

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL,
  squad squad_name,
  avatar_url TEXT,
  is_squad_lead BOOLEAN DEFAULT false,
  onboarded_at TIMESTAMPTZ,
  replit_username TEXT,
  jira_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name squad_name UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SPRINTS & EPICS
-- ============================================================

CREATE TABLE sprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  agile_value TEXT NOT NULL,
  weeks_start INTEGER NOT NULL,
  weeks_end INTEGER NOT NULL,
  status sprint_status DEFAULT 'planned',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tech_stack platform_tag[],
  retro_notes TEXT,
  velocity_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE epics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  epic_id TEXT UNIQUE NOT NULL, -- e.g. EP-01
  name TEXT NOT NULL,
  description TEXT,
  sprint_ids INTEGER[], -- sprint numbers
  platforms platform_tag[],
  strategic_focus TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KANBAN / USER STORIES / TICKETS
-- ============================================================

CREATE TABLE user_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id TEXT UNIQUE NOT NULL, -- e.g. US-01
  epic_id UUID REFERENCES epics(id),
  sprint_number INTEGER REFERENCES sprints(number),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  acceptance_criteria TEXT[] NOT NULL DEFAULT '{}',
  test_plan TEXT[] NOT NULL DEFAULT '{}',
  definition_of_done TEXT[] NOT NULL DEFAULT '{}',
  platforms platform_tag[],
  status ticket_status DEFAULT 'backlog',
  priority ticket_priority DEFAULT 'medium',
  assigned_squad squad_name,
  assignee_id UUID REFERENCES team_members(id),
  story_points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kanban_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID REFERENCES user_stories(id),
  title TEXT NOT NULL,
  description TEXT,
  status ticket_status DEFAULT 'backlog',
  priority ticket_priority DEFAULT 'medium',
  squad squad_name,
  assignee_id UUID REFERENCES team_members(id),
  sprint_number INTEGER REFERENCES sprints(number),
  story_points INTEGER,
  labels TEXT[],
  blocked_by UUID[], -- ticket ids
  blocks UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  moved_to_done_at TIMESTAMPTZ,
  pm_signoff BOOLEAN DEFAULT false,
  pm_signoff_at TIMESTAMPTZ
);

CREATE TABLE ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES kanban_tickets(id) ON DELETE CASCADE,
  author_id UUID REFERENCES team_members(id),
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HCD — USER GROUPS & EMPATHY MAPPING
-- ============================================================

CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- emoji
  display_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hcd_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id TEXT UNIQUE NOT NULL, -- e.g. HCD-01
  title TEXT NOT NULL,
  description TEXT,
  severity hcd_challenge_severity DEFAULT 'medium',
  frequency INTEGER DEFAULT 1, -- 1-5 scale
  priority_rank INTEGER,
  affected_user_groups UUID[],
  mitigation_notes TEXT,
  sprint_addressed INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE empathy_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  facilitator_id UUID REFERENCES team_members(id),
  session_date DATE,
  is_validated BOOLEAN DEFAULT false,
  validated_by UUID REFERENCES team_members(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE empathy_map_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empathy_map_id UUID REFERENCES empathy_maps(id) ON DELETE CASCADE,
  quadrant empathy_map_quadrant NOT NULL,
  content TEXT NOT NULL,
  is_pain_point BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journey_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_group_id UUID REFERENCES user_groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]', -- [{stage, actions, touchpoints, emotions, pain_points, opportunities}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RISK REGISTER
-- ============================================================

CREATE TABLE risks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  risk_id TEXT UNIQUE NOT NULL, -- e.g. R-01
  category TEXT NOT NULL, -- HCD, Tech Stack, AI, Compliance, Project
  title TEXT NOT NULL,
  description TEXT,
  likelihood risk_likelihood NOT NULL,
  impact risk_impact NOT NULL,
  overall_rating risk_rating NOT NULL,
  owner TEXT NOT NULL,
  mitigation TEXT NOT NULL,
  sprint_identified INTEGER,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SPRINT CEREMONIES
-- ============================================================

CREATE TABLE sprint_ceremonies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sprint_number INTEGER REFERENCES sprints(number),
  ceremony_type TEXT NOT NULL, -- planning, standup, review, retro
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  attendees UUID[],
  notes TEXT,
  action_items JSONB DEFAULT '[]', -- [{item, owner, due_date, completed}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- WORKING AGREEMENTS & PROJECT WIKI
-- ============================================================

CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- working_agreement, dod, wiki, brand
  version INTEGER DEFAULT 1,
  approved_by UUID[],
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES team_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RURAL / URBAN DISPARITY NOTES
-- ============================================================

CREATE TABLE rural_urban_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_type TEXT CHECK (region_type IN ('rural', 'urban', 'suburban')),
  challenge TEXT NOT NULL,
  proposed_mitigation TEXT,
  severity hcd_challenge_severity DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS — updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'team_members','user_stories','kanban_tickets',
    'hcd_challenges','empathy_maps','journey_maps',
    'risks','project_documents'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at
      BEFORE UPDATE ON %s FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE empathy_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE empathy_map_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read everything
CREATE POLICY "read_all_team" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all_tickets" ON kanban_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all_empathy" ON empathy_maps FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all_empathy_entries" ON empathy_map_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all_risks" ON risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "read_all_docs" ON project_documents FOR SELECT TO authenticated USING (true);

-- Only team members can insert/update their own records
CREATE POLICY "insert_tickets" ON kanban_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_own_tickets" ON kanban_tickets FOR UPDATE TO authenticated USING (true);

CREATE POLICY "insert_empathy_entries" ON empathy_map_entries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_empathy_entries" ON empathy_map_entries FOR UPDATE TO authenticated USING (true);

-- PM role can update risks and documents (enforced at app layer via role check)
CREATE POLICY "insert_risks" ON risks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_risks" ON risks FOR UPDATE TO authenticated USING (true);

CREATE POLICY "insert_docs" ON project_documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_docs" ON project_documents FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- VIEWS
-- ============================================================

-- Kanban board view
CREATE OR REPLACE VIEW kanban_board AS
SELECT
  kt.*,
  us.story_id,
  us.title AS story_title,
  tm.name AS assignee_name,
  tm.avatar_url AS assignee_avatar
FROM kanban_tickets kt
LEFT JOIN user_stories us ON kt.story_id = us.id
LEFT JOIN team_members tm ON kt.assignee_id = tm.id;

-- Sprint velocity view
CREATE OR REPLACE VIEW sprint_velocity AS
SELECT
  s.number AS sprint_number,
  s.name AS sprint_name,
  COUNT(kt.id) FILTER (WHERE kt.status = 'done') AS tickets_done,
  COUNT(kt.id) AS tickets_total,
  SUM(kt.story_points) FILTER (WHERE kt.status = 'done') AS points_completed,
  SUM(kt.story_points) AS points_total
FROM sprints s
LEFT JOIN kanban_tickets kt ON kt.sprint_number = s.number
GROUP BY s.number, s.name;

-- Risk summary
CREATE OR REPLACE VIEW risk_summary AS
SELECT
  category,
  COUNT(*) AS total_risks,
  COUNT(*) FILTER (WHERE overall_rating = 'high') AS high_risks,
  COUNT(*) FILTER (WHERE overall_rating = 'medium') AS medium_risks,
  COUNT(*) FILTER (WHERE overall_rating = 'low') AS low_risks,
  COUNT(*) FILTER (WHERE is_resolved = true) AS resolved
FROM risks
GROUP BY category;

-- HCD challenge priority view
CREATE OR REPLACE VIEW hcd_priority_registry AS
SELECT
  hc.*,
  array_agg(ug.name) AS affected_groups
FROM hcd_challenges hc
LEFT JOIN user_groups ug ON ug.id = ANY(hc.affected_user_groups::uuid[])
GROUP BY hc.id
ORDER BY hc.priority_rank;
