-- ============================================================
-- UniMart — Seed Data
-- Sprint 1: EP-01 · US-01 & US-02
-- Run AFTER 01_schema.sql
-- ============================================================

-- ── SQUADS ───────────────────────────────────────────────────
insert into public.squads (name, lead_name, color_hex) values
  ('UX Research',       'TBD — UX Lead',          '#F76B8A'),
  ('Core Dev',          'TBD — Engineering Lead',  '#5B8AF7'),
  ('AI Integration',    'TBD — AI Lead',           '#A89DF7'),
  ('Growth/Marketing',  'TBD — Growth Lead',       '#F7A954'),
  ('Legal/Compliance',  'TBD — Legal Lead',        '#54C09E')
on conflict (name) do nothing;

-- ── EPICS (Sprint 1 scope) ────────────────────────────────────
insert into public.epics (epic_id, name, sprints, platforms, strategic_focus, status) values
  ('EP-01', 'Discovery & Project Foundation', '1',
   'Figma · Jira · n8n',
   'HCD research, empathy mapping, team setup & governance',
   'Active'),
  ('EP-02', 'UX Design & AI Architecture', '2',
   'Figma · Lovable · Replit · n8n',
   'Unified IA, prototyping, a11y, AI system blueprints',
   'Active'),
  ('EP-03', 'Seller, Support & Compliance', '2–3',
   'Lovable · Replit · n8n',
   'Seller portal, compliance automation, returns & refund flows',
   'Active'),
  ('EP-04', 'Core Platform & App Build', '3',
   'Lovable · Replit · n8n',
   'Backend, customer app, driver app, nutrition portal, branding',
   'Active'),
  ('EP-05', 'Testing, AI Validation & Compliance', '4',
   'Lovable · Replit · n8n',
   'QA, a11y audit, AI tuning, legal compliance audit',
   'Active'),
  ('EP-06', 'Stakeholder Handoff & Project Closure', '4',
   'All platforms',
   'Sprint Review, Retrospective, handoff documentation',
   'Active')
on conflict (epic_id) do nothing;

-- ── USER STORIES (Sprint 1 only) ──────────────────────────────
with ep01 as (select id from public.epics where epic_id = 'EP-01')
insert into public.user_stories
  (story_id, epic_id, title, description, sprint, status, assigned_squad,
   acceptance_criteria, definition_of_done)
select
  'US-01',
  ep01.id,
  'HCD Kickoff & Empathy Mapping',
  'As a project team, we need to conduct empathy mapping and user journey workshops for all 11 user groups so that we have a validated, human-centered foundation before any design or development work begins.',
  1,
  'In Progress',
  'UX Research',
  '[
    "Empathy maps completed for all 11 user groups with at least 3 validated pain points each",
    "User journey maps produced for Customers, Sellers, and Delivery Drivers",
    "HCD challenge registry prioritised by severity and frequency (all 11 documented)",
    "Rural vs. urban disparity risks documented with proposed mitigation strategy",
    "Brand direction and working name (UniMart) agreed upon by Senior Partners"
  ]'::jsonb,
  '[
    "All empathy maps and journey maps documented and stored in the project wiki",
    "HCD challenge registry approved and baselined by Stakeholders",
    "Brand direction formally approved in Sprint 1 Review",
    "Kanban ticket moved to Done with Project Manager sign-off"
  ]'::jsonb
from ep01
on conflict (story_id) do nothing;

with ep01 as (select id from public.epics where epic_id = 'EP-01')
insert into public.user_stories
  (story_id, epic_id, title, description, sprint, status, assigned_squad,
   acceptance_criteria, definition_of_done)
select
  'US-02',
  ep01.id,
  'Agile Team Formation & Project Infrastructure',
  'As a project manager, I need to form the cross-functional team, establish Scrum/Kanban tooling, and define team agreements so that the project operates efficiently and transparently from Sprint 1 onward.',
  1,
  'In Progress',
  'Core Dev',
  '[
    "Five squads formed: UX Research, Core Dev, AI Integration, Growth/Marketing, Legal/Compliance",
    "Kanban/Scrum board live in Jira or Linear with swimlanes per squad",
    "Definition of Done, Working Agreements, and sprint ceremony schedule documented",
    "Legal/Compliance team has begun regulatory and food-safety research",
    "Sprint 1 Planning session completed with backlog populated",
    "All engineers onboarded to shared Replit workspace"
  ]'::jsonb,
  '[
    "All squads staffed and onboarded to all project tools",
    "Kanban board live and actively in use by all team members",
    "DoD, Working Agreements, and sprint schedule baselined in project wiki",
    "Sprint 1 Retrospective completed; action items logged"
  ]'::jsonb
from ep01
on conflict (story_id) do nothing;

-- ── SPRINT TICKETS (Sprint 1 starter backlog) ─────────────────
insert into public.sprint_tickets (title, epic, story_id, sprint, squad, priority, status, tags)
values
  -- US-01 tickets
  ('Set up Figma project workspace with empathy map templates',        'EP-01', 'US-01', 1, 'UX Research',      'High',   'To Do',       '{figma,setup}'),
  ('Schedule empathy mapping workshops for all 11 user groups',        'EP-01', 'US-01', 1, 'UX Research',      'High',   'To Do',       '{workshops,hcd}'),
  ('Conduct workshop: Customers empathy map',                          'EP-01', 'US-01', 1, 'UX Research',      'High',   'Backlog',     '{empathy,customers}'),
  ('Conduct workshop: Sellers empathy map',                            'EP-01', 'US-01', 1, 'UX Research',      'High',   'Backlog',     '{empathy,sellers}'),
  ('Conduct workshop: Delivery Drivers empathy map',                   'EP-01', 'US-01', 1, 'UX Research',      'High',   'Backlog',     '{empathy,drivers}'),
  ('Conduct workshop: Stakeholders & Senior Partners',                 'EP-01', 'US-01', 1, 'UX Research',      'Medium', 'Backlog',     '{empathy,stakeholders}'),
  ('Conduct workshops: remaining 7 user groups',                       'EP-01', 'US-01', 1, 'UX Research',      'Medium', 'Backlog',     '{empathy,remaining}'),
  ('Produce user journey maps: Customers, Sellers, Drivers',           'EP-01', 'US-01', 1, 'UX Research',      'High',   'Backlog',     '{journey,maps}'),
  ('Prioritise HCD challenge registry by severity & frequency',        'EP-01', 'US-01', 1, 'UX Research',      'High',   'Backlog',     '{hcd,registry}'),
  ('Document rural vs. urban disparity risks',                         'EP-01', 'US-01', 1, 'UX Research',      'Medium', 'Backlog',     '{rural,urban}'),
  ('Configure n8n workshop findings aggregation to project wiki',      'EP-01', 'US-01', 1, 'AI Integration',   'Medium', 'Backlog',     '{n8n,automation}'),
  ('Review brand direction — UniMart name approval with Senior Partners','EP-01','US-01',1, 'Growth/Marketing',  'High',   'Backlog',     '{brand,approval}'),
  ('Sprint 1 Review — stakeholder sign-off on empathy maps',           'EP-01', 'US-01', 1, 'UX Research',      'High',   'Backlog',     '{review,signoff}'),

  -- US-02 tickets
  ('Create Jira/Linear Kanban board with squad swimlanes',             'EP-01', 'US-02', 1, 'Core Dev',         'High',   'In Progress', '{jira,setup}'),
  ('Define & document squad structure (5 squads)',                      'EP-01', 'US-02', 1, 'Core Dev',         'High',   'In Progress', '{team,squads}'),
  ('Draft Working Agreements and Definition of Done',                  'EP-01', 'US-02', 1, 'Core Dev',         'High',   'To Do',       '{agreements,dod}'),
  ('Schedule all Sprint 1–4 ceremonies in team calendars',             'EP-01', 'US-02', 1, 'Core Dev',         'High',   'To Do',       '{ceremonies,calendar}'),
  ('Onboard all engineers to shared Replit workspace',                 'EP-01', 'US-02', 1, 'Core Dev',         'High',   'To Do',       '{replit,onboarding}'),
  ('Set up Supabase project and share credentials with team',          'EP-01', 'US-02', 1, 'Core Dev',         'High',   'In Progress', '{supabase,setup}'),
  ('Set up n8n instance and create sprint velocity reporting workflow', 'EP-01', 'US-02', 1, 'AI Integration',   'High',   'To Do',       '{n8n,velocity}'),
  ('Legal/Compliance: begin food-safety regulatory research',          'EP-01', 'US-02', 1, 'Legal/Compliance',  'High',   'To Do',       '{legal,research}'),
  ('Run Sprint 1 Planning session — populate full backlog',            'EP-01', 'US-02', 1, 'Core Dev',         'High',   'Done',        '{planning,sprint1}'),
  ('Confirm squad leads and their contact details in project wiki',    'EP-01', 'US-02', 1, 'Core Dev',         'Medium', 'To Do',       '{team,wiki}'),
  ('Cross-train backup per squad — document in wiki',                  'EP-01', 'US-02', 1, 'Core Dev',         'Medium', 'Backlog',     '{knowledge,backup}'),
  ('Sprint 1 Retrospective — document action items',                   'EP-01', 'US-02', 1, 'Core Dev',         'High',   'Backlog',     '{retro,sprint1}')
on conflict do nothing;

-- ── HCD CHALLENGE PRIORITIES (pre-seeded, all 11) ─────────────
insert into public.hcd_challenge_priorities (challenge, prioritised, severity, frequency)
values
  ('Disorganization — merging three UX paradigms into one coherent app',                   false, 'High',   'High'),
  ('Onboarding Complexity — communicating three-in-one value in under 30 seconds',          false, 'High',   'High'),
  ('Gaining Customers — branding, trust, and first-impression experience',                  false, 'High',   'Medium'),
  ('Trust & Safety at Scale — verified sellers, fake reviews, fraud detection',             false, 'High',   'Medium'),
  ('Accessibility (a11y) — WCAG 2.1 AA across all three commerce types',                   false, 'High',   'High'),
  ('Returns & Refunds UX — distinct resolution flows per vertical',                         false, 'Medium', 'High'),
  ('Rural vs. Urban Experience Disparity — graceful degradation for underserved areas',     false, 'Medium', 'Medium'),
  ('Notification Fatigue — smart, preference-driven alert design',                          false, 'Medium', 'High'),
  ('Cross-Vertical Cart Conflicts — mixed fulfilment timelines in one checkout',            false, 'High',   'Medium'),
  ('Delivery Driver Experience — driver UX directly impacts customer satisfaction',         false, 'High',   'Medium'),
  ('Support at Scale — quality across three different dispute types',                       false, 'Medium', 'High')
on conflict (challenge) do nothing;

-- ── EMPATHY MAPS — placeholder rows for all 11 groups ────────
insert into public.empathy_maps (user_group, is_complete)
values
  ('Customers',                         false),
  ('Sellers',                           false),
  ('Stakeholders',                      false),
  ('Senior Partners',                   false),
  ('UI/UX Designers',                   false),
  ('Software Engineers',                false),
  ('Delivery Drivers',                  false),
  ('Customer Support Agents',           false),
  ('Nutritionists / Dietitians',        false),
  ('Regulatory / Legal / Compliance',   false),
  ('Data Analysts / Growth Teams',      false)
on conflict (user_group) do nothing;

-- ── JOURNEY MAPS — placeholder rows ──────────────────────────
insert into public.journey_maps (persona, stages)
values
  ('Customer',        '[]'::jsonb),
  ('Seller',          '[]'::jsonb),
  ('Delivery Driver', '[]'::jsonb)
on conflict do nothing;

-- ── SPRINT CEREMONIES (Sprint 1 schedule) ─────────────────────
insert into public.sprint_ceremonies (sprint, type, scheduled_at, notes)
values
  (1, 'Planning',      now() + interval '1 day',   'Sprint 1 Planning — populate backlog, assign to squads, agree on sprint goal'),
  (1, 'Stand-up',      now() + interval '2 days',  'Daily Stand-up (repeat daily throughout sprint)'),
  (1, 'Review',        now() + interval '13 days', 'Sprint 1 Review — present empathy maps and team setup to all stakeholders'),
  (1, 'Retrospective', now() + interval '14 days', 'Sprint 1 Retrospective — what went well, what to improve, action items')
on conflict do nothing;

-- ── WORKING AGREEMENTS ────────────────────────────────────────
insert into public.working_agreements (category, agreement, approved)
values
  ('Ceremonies',     'All squad leads must attend Planning, Review, and Retrospective.',       false),
  ('Ceremonies',     'Daily stand-ups are 15 minutes max. Focus: done, doing, blocked.',       false),
  ('Communication',  'Blockers escalated within 24 hours in the team channel.',                false),
  ('Communication',  'Decisions documented in the project wiki within 24 hours.',              false),
  ('Code',           'No direct pushes to main branch. All changes via PR with one reviewer.', false),
  ('Code',           'All Replit scripts include a README and run instructions.',              false),
  ('Quality',        'Acceptance criteria must be met before any ticket is marked Done.',      false),
  ('Quality',        'a11y is a non-negotiable criterion on every UI user story.',             false),
  ('Agile',          'Scope changes enter the backlog for the next sprint — not the current.', false),
  ('Agile',          'Retro action items are assigned and actioned within 24 hours.',          false)
on conflict do nothing;
