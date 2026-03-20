-- ============================================================
-- UniMart Sprint 1 — Supabase Schema
-- EP-01: Discovery & Project Foundation
-- US-01: HCD Kickoff & Empathy Mapping
-- US-02: Agile Team Formation & Project Infrastructure
-- ============================================================

-- ENUMS
CREATE TYPE user_group_type AS ENUM (
  'customer',
  'seller',
  'stakeholder',
  'senior_partner',
  'ui_ux_designer',
  'software_engineer',
  'delivery_driver',
  'customer_support_agent',
  'nutritionist',
  'legal_compliance',
  'data_analyst'
);

CREATE TYPE hcd_challenge_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE hcd_challenge_frequency AS ENUM ('rare', 'occasional', 'frequent', 'constant');
CREATE TYPE squad_name AS ENUM ('ux_research', 'core_dev', 'ai_integration', 'growth_marketing', 'legal_compliance');
CREATE TYPE kanban_status AS ENUM ('backlog', 'to_do', 'in_progress', 'review', 'done');
CREATE TYPE sprint_number AS ENUM ('1', '2', '3', '4');
CREATE TYPE risk_likelihood AS ENUM ('low', 'medium', 'high');
CREATE TYPE risk_impact AS ENUM ('low', 'medium', 'high');

-- ============================================================
-- TEAM & SQUADS
-- ============================================================

CREATE TABLE squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name squad_name NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  lead_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  user_group user_group_type NOT NULL,
  squad_id UUID REFERENCES squads(id),
  onboarded_to_jira BOOLEAN DEFAULT FALSE,
  onboarded_to_replit BOOLEAN DEFAULT FALSE,
  onboarded_to_lovable BOOLEAN DEFAULT FALSE,
  onboarded_to_n8n BOOLEAN DEFAULT FALSE,
  working_agreements_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HCD RESEARCH: EMPATHY MAPS & JOURNEY MAPS
-- ============================================================

CREATE TABLE user_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_group_type NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  priority_rank INTEGER, -- 1 = highest priority for research
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE empathy_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_group_id UUID NOT NULL REFERENCES user_groups(id),
  -- Four quadrants of empathy mapping
  thinks TEXT[], -- What does the user think?
  feels TEXT[], -- What does the user feel?
  says TEXT[], -- What does the user say?
  does TEXT[], -- What does the user do?
  -- Extended quadrants
  pain_points TEXT[], -- Pains
  gains TEXT[], -- Gains/goals
  validated BOOLEAN DEFAULT FALSE,
  validated_by TEXT,
  validated_at TIMESTAMPTZ,
  participant_count INTEGER DEFAULT 0,
  notes TEXT,
  figma_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journey_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_group_id UUID NOT NULL REFERENCES user_groups(id),
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]', -- [{stage, actions, thoughts, emotions, pain_points, opportunities}]
  figma_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- HCD CHALLENGE REGISTRY
-- ============================================================

CREATE TABLE hcd_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_code TEXT UNIQUE NOT NULL, -- e.g. HCD-01
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity hcd_challenge_severity NOT NULL,
  frequency hcd_challenge_frequency NOT NULL,
  affected_user_groups user_group_type[],
  related_verticals TEXT[], -- ['shop', 'meal_kits', 'food_delivery']
  mitigation_strategy TEXT,
  sprint_focus sprint_number,
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  priority_rank INTEGER, -- stakeholder-approved rank
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RURAL VS URBAN DISPARITY RISK
-- ============================================================

CREATE TABLE rural_urban_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_area TEXT NOT NULL,
  description TEXT NOT NULL,
  affected_features TEXT[],
  proposed_mitigation TEXT NOT NULL,
  sprint_owner TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRAND DIRECTION
-- ============================================================

CREATE TABLE brand_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_type TEXT NOT NULL, -- 'name', 'logo', 'color_palette', 'typography', 'tone_of_voice'
  decision_value TEXT NOT NULL,
  rationale TEXT,
  approved_by_senior_partners BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SPRINT CEREMONIES & AGILE INFRASTRUCTURE
-- ============================================================

CREATE TABLE sprint_ceremonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint sprint_number NOT NULL,
  ceremony_type TEXT NOT NULL, -- 'planning', 'standup', 'review', 'retrospective'
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  attendees TEXT[],
  agenda TEXT[],
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE retrospective_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint sprint_number NOT NULL,
  category TEXT NOT NULL, -- 'went_well', 'to_improve', 'action_item'
  description TEXT NOT NULL,
  owner TEXT,
  due_date DATE,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- KANBAN BOARD
-- ============================================================

CREATE TABLE kanban_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE NOT NULL, -- e.g. US-01, US-02
  title TEXT NOT NULL,
  description TEXT,
  epic_id TEXT NOT NULL, -- EP-01, EP-02, etc.
  sprint sprint_number NOT NULL,
  squad_id UUID REFERENCES squads(id),
  assignee_id UUID REFERENCES team_members(id),
  status kanban_status DEFAULT 'backlog',
  priority TEXT DEFAULT 'medium', -- low, medium, high, critical
  story_points INTEGER,
  acceptance_criteria TEXT[],
  definition_of_done TEXT[],
  blocked_by TEXT[], -- ticket IDs
  tags TEXT[],
  pm_signed_off BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE kanban_ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES kanban_tickets(id),
  from_status kanban_status,
  to_status kanban_status NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- ============================================================
-- RISK REGISTER
-- ============================================================

CREATE TABLE risk_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_code TEXT UNIQUE NOT NULL, -- R-01 etc.
  category TEXT NOT NULL, -- 'hcd', 'tech_stack', 'ai', 'compliance', 'project'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  likelihood risk_likelihood NOT NULL,
  impact risk_impact NOT NULL,
  overall_rating TEXT GENERATED ALWAYS AS (
    CASE
      WHEN likelihood = 'high' AND impact = 'high' THEN 'critical'
      WHEN likelihood = 'high' OR impact = 'high' THEN 'high'
      WHEN likelihood = 'medium' AND impact = 'medium' THEN 'medium'
      ELSE 'low'
    END
  ) STORED,
  owner TEXT NOT NULL,
  mitigation_strategy TEXT NOT NULL,
  sprint_identified sprint_number DEFAULT '1',
  resolved BOOLEAN DEFAULT FALSE,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROJECT WIKI / DOCUMENTATION
-- ============================================================

CREATE TABLE project_wiki (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'working_agreements', 'dod', 'empathy_maps', 'decisions', 'retrospective'
  sprint sprint_number,
  author TEXT,
  approved BOOLEAN DEFAULT FALSE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SPRINT VELOCITY (for n8n reporting automation)
-- ============================================================

CREATE TABLE sprint_velocity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint sprint_number NOT NULL,
  squad_id UUID REFERENCES squads(id),
  planned_points INTEGER DEFAULT 0,
  completed_points INTEGER DEFAULT 0,
  tickets_planned INTEGER DEFAULT 0,
  tickets_completed INTEGER DEFAULT 0,
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE empathy_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_register ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Authenticated users can read team_members"
  ON team_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read empathy_maps"
  ON empathy_maps FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read kanban_tickets"
  ON kanban_tickets FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read risks"
  ON risk_register FOR SELECT TO authenticated USING (true);

-- ============================================================
-- TRIGGERS: updated_at auto-update
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_empathy_maps_updated BEFORE UPDATE ON empathy_maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_journey_maps_updated BEFORE UPDATE ON journey_maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_hcd_challenges_updated BEFORE UPDATE ON hcd_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_kanban_tickets_updated BEFORE UPDATE ON kanban_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_wiki_updated BEFORE UPDATE ON project_wiki
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_empathy_maps_user_group ON empathy_maps(user_group_id);
CREATE INDEX idx_kanban_status ON kanban_tickets(status);
CREATE INDEX idx_kanban_sprint ON kanban_tickets(sprint);
CREATE INDEX idx_kanban_squad ON kanban_tickets(squad_id);
CREATE INDEX idx_team_squad ON team_members(squad_id);
CREATE INDEX idx_hcd_severity ON hcd_challenges(severity);
CREATE INDEX idx_risk_category ON risk_register(category);
