-- ============================================================
-- UniMart Sprint 1 — Seed Data
-- Run after 01_schema.sql
-- ============================================================

-- ============================================================
-- USER GROUPS (all 11 from roadmap)
-- ============================================================

INSERT INTO user_groups (name, display_name, description, priority_rank) VALUES
('customer',              'Customers',                      'End users shopping across all three verticals', 1),
('seller',                'Sellers',                        'Merchants listing products, meal kits, or food', 2),
('delivery_driver',       'Delivery Drivers / Couriers',    'Drivers fulfilling food delivery and product orders', 3),
('customer_support_agent','Customer Support Agents',        'Agents handling disputes, returns, and refunds', 4),
('ui_ux_designer',        'UI/UX Designers',                'Designers shaping the product experience', 5),
('software_engineer',     'Software Engineers',             'Engineers building the platform', 6),
('stakeholder',           'Stakeholders',                   'Project stakeholders guiding delivery', 7),
('senior_partner',        'Senior Partners',                'Executive decision-makers and approvers', 8),
('nutritionist',          'Nutritionists / Dietitians',     'Content partners curating meal plans', 9),
('legal_compliance',      'Regulatory / Legal / Compliance','Teams ensuring legal and food-safety compliance', 10),
('data_analyst',          'Data Analysts / Growth Teams',   'Teams measuring performance and AI model quality', 11);

-- ============================================================
-- SQUADS
-- ============================================================

INSERT INTO squads (name, display_name, description, lead_name) VALUES
('ux_research',      'UX Research',       'Empathy mapping, usability testing, journey mapping', 'UX Research Lead'),
('core_dev',         'Core Dev',          'Backend microservices, APIs, Replit infrastructure', 'Engineering Lead'),
('ai_integration',   'AI Integration',    'AI model design, Replit AI hosting, n8n AI workflows', 'AI Lead'),
('growth_marketing', 'Growth & Marketing','Branding, waitlist, ASO, co-marketing strategy', 'Growth Lead'),
('legal_compliance', 'Legal & Compliance','Food safety, allergen compliance, data privacy, seller terms', 'Legal Lead');

-- ============================================================
-- HCD CHALLENGES (all 11 from roadmap)
-- ============================================================

INSERT INTO hcd_challenges (challenge_code, title, description, severity, frequency, affected_user_groups, related_verticals, sprint_focus, priority_rank) VALUES
('HCD-01', 'Disorganization',
  'Merging three UX paradigms (Amazon/HelloFresh/Uber Eats) into one coherent app without fragmenting the user experience.',
  'critical', 'constant',
  ARRAY['customer','seller','ui_ux_designer']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '2', 1),

('HCD-02', 'Onboarding Complexity',
  'Communicating three-in-one value proposition clearly within 30 seconds of first launch.',
  'high', 'constant',
  ARRAY['customer']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '3', 2),

('HCD-03', 'Gaining Customers',
  'Building trust, brand recognition, and a compelling first-impression experience to acquire users.',
  'high', 'frequent',
  ARRAY['customer','senior_partner']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '3', 3),

('HCD-04', 'Trust & Safety at Scale',
  'Verified sellers, fake review prevention, and fraud detection at multi-vertical scale.',
  'critical', 'frequent',
  ARRAY['customer','seller','legal_compliance']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '3', 4),

('HCD-05', 'Accessibility (a11y)',
  'Achieving WCAG 2.1 AA compliance across all three commerce types and all user-facing surfaces.',
  'high', 'constant',
  ARRAY['customer','delivery_driver','seller']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '2', 5),

('HCD-06', 'Returns & Refunds UX',
  'Designing distinct, vertical-specific resolution flows for product returns, missing ingredients, and cold food disputes.',
  'high', 'frequent',
  ARRAY['customer','customer_support_agent']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '2', 6),

('HCD-07', 'Rural vs. Urban Experience Disparity',
  'Graceful degradation and meaningful availability UX for underserved rural areas.',
  'medium', 'occasional',
  ARRAY['customer','delivery_driver']::user_group_type[],
  ARRAY['shop','food_delivery'], '3', 7),

('HCD-08', 'Notification Fatigue',
  'Smart, preference-driven alert design to avoid overwhelming users across three active verticals.',
  'medium', 'frequent',
  ARRAY['customer','delivery_driver']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '2', 8),

('HCD-09', 'Cross-Vertical Cart Conflicts',
  'Managing mixed fulfilment timelines (immediate delivery vs. scheduled meal kit vs. standard shipping) in one checkout.',
  'high', 'frequent',
  ARRAY['customer']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '2', 9),

('HCD-10', 'Delivery Driver Experience',
  'Driver UX — routing, job queue, earnings transparency — directly impacts customer delivery satisfaction.',
  'high', 'constant',
  ARRAY['delivery_driver','customer']::user_group_type[],
  ARRAY['food_delivery','meal_kits'], '3', 10),

('HCD-11', 'Support at Scale',
  'Maintaining support quality across three fundamentally different dispute types with distinct resolution logic.',
  'high', 'frequent',
  ARRAY['customer_support_agent','customer']::user_group_type[],
  ARRAY['shop','meal_kits','food_delivery'], '2', 11);

-- ============================================================
-- RURAL / URBAN RISK REGISTER (Sprint 1 discovery)
-- ============================================================

INSERT INTO rural_urban_risks (risk_area, description, affected_features, proposed_mitigation, sprint_owner) VALUES
('Delivery Coverage',
  'Rural postcodes may fall outside driver availability zones, causing hard error states.',
  ARRAY['food_delivery','meal_kit_delivery'],
  'Implement Replit geo-fencing with graceful "limited availability" UX instead of error blocks. Show estimated future availability.',
  'core_dev'),
('Product Catalog',
  'Some product SKUs may not be available for rural delivery due to seller shipping constraints.',
  ARRAY['shop','product_catalog'],
  'Tag listings with delivery zone eligibility. Filter catalog server-side by user postcode. Show "available near you" alternatives.',
  'core_dev'),
('Real-Time Tracking',
  'Rural areas may have lower GPS accuracy affecting delivery tracking reliability.',
  ARRAY['delivery_tracking','driver_app'],
  'Fallback to estimated arrival windows when live GPS is unreliable. Driver app handles offline gracefully.',
  'ai_integration'),
('Notification Delivery',
  'SMS via Twilio may be delayed in rural areas with poor connectivity.',
  ARRAY['notifications','twilio'],
  'Offer in-app push notifications as primary channel. SMS as fallback. Allow user preference settings.',
  'core_dev');

-- ============================================================
-- BRAND DECISIONS (Sprint 1 approved)
-- ============================================================

INSERT INTO brand_decisions (decision_type, decision_value, rationale, approved_by_senior_partners) VALUES
('name',         'UniMart',        'Communicates unified multi-category marketplace. Memorable, short, domain-friendly.', TRUE),
('positioning',  'One app. Three ways to shop.',  'Single tagline communicating the three-in-one value proposition within 5 words.', TRUE),
('tone_of_voice','Warm, direct, trustworthy. Never corporate. Always human.', 'Differentiates from Amazon (transactional) and reinforces community trust.', FALSE);

-- ============================================================
-- KANBAN TICKETS — Sprint 1
-- ============================================================

-- We need squad IDs for FK references
-- Using a CTE pattern for insertion with squad lookups

WITH squad_ids AS (
  SELECT id, name FROM squads
)
INSERT INTO kanban_tickets (ticket_id, title, description, epic_id, sprint, status, priority, story_points, acceptance_criteria, definition_of_done, tags)
VALUES
(
  'US-01',
  'HCD Kickoff & Empathy Mapping',
  'Conduct empathy mapping and user journey workshops for all 11 user groups to establish a human-centered foundation before any design or development work begins.',
  'EP-01', '1', 'in_progress', 'critical', 13,
  ARRAY[
    'Empathy maps completed for all 11 user groups with at least 3 validated pain points each',
    'User journey maps produced for Customers, Sellers, and Delivery Drivers',
    'HCD challenge registry prioritised by severity and frequency (all 11 documented)',
    'Rural vs. urban disparity risks documented with proposed mitigation strategy',
    'Brand direction and working name (UniMart) agreed upon by Senior Partners'
  ],
  ARRAY[
    'All empathy maps and journey maps documented and stored in the project wiki',
    'HCD challenge registry approved and baselined by Stakeholders',
    'Brand direction formally approved in Sprint 1 Review',
    'Kanban ticket moved to Done with Project Manager sign-off'
  ],
  ARRAY['hcd','research','empathy','sprint1','EP-01']
),
(
  'US-02',
  'Agile Team Formation & Project Infrastructure',
  'Form the cross-functional team, establish Scrum/Kanban tooling, and define team agreements so the project operates efficiently from Sprint 1 onward.',
  'EP-01', '1', 'in_progress', 'critical', 8,
  ARRAY[
    'Five squads formed: UX Research, Core Dev, AI Integration, Growth/Marketing, Legal/Compliance',
    'Kanban/Scrum board live in Jira or Linear with swimlanes per squad',
    'Definition of Done, Working Agreements, and sprint ceremony schedule documented and shared',
    'Legal/Compliance team has begun regulatory and food-safety research',
    'Sprint 1 Planning session completed with backlog populated',
    'All engineers onboarded to shared Replit workspace'
  ],
  ARRAY[
    'All squads staffed and onboarded to all project tools (Jira, Replit, Lovable, n8n)',
    'Kanban board live and actively in use by all team members',
    'DoD, Working Agreements, and sprint schedule baselined and stored in project wiki',
    'Sprint 1 Retrospective completed; action items logged'
  ],
  ARRAY['agile','team','infrastructure','jira','sprint1','EP-01']
);

-- ============================================================
-- SPRINT CEREMONIES — Sprint 1
-- ============================================================

INSERT INTO sprint_ceremonies (sprint, ceremony_type, scheduled_at, duration_minutes, attendees, agenda) VALUES
('1', 'planning',      NOW() + INTERVAL '0 days',  120, ARRAY['All squad leads','Project Manager','Senior Partners'],
  ARRAY['Review Sprint 1 goal','Walk through US-01 and US-02 acceptance criteria','Point estimation','Assign tickets to squad members','Confirm ceremony schedule']),
('1', 'standup',       NOW() + INTERVAL '1 days',   15, ARRAY['All squad leads','Project Manager'],
  ARRAY['What did you do yesterday?','What will you do today?','Any blockers?']),
('1', 'standup',       NOW() + INTERVAL '2 days',   15, ARRAY['All squad leads','Project Manager'],
  ARRAY['What did you do yesterday?','What will you do today?','Any blockers?']),
('1', 'standup',       NOW() + INTERVAL '3 days',   15, ARRAY['All squad leads','Project Manager'],
  ARRAY['What did you do yesterday?','What will you do today?','Any blockers?']),
('1', 'standup',       NOW() + INTERVAL '4 days',   15, ARRAY['All squad leads','Project Manager'],
  ARRAY['What did you do yesterday?','What will you do today?','Any blockers?']),
('1', 'review',        NOW() + INTERVAL '12 days',  60, ARRAY['All Stakeholders','Senior Partners','Full Team'],
  ARRAY['Demo empathy maps for all 11 user groups','Present HCD challenge registry','Show Kanban board and sprint velocity','Brand direction sign-off','Collect stakeholder feedback']),
('1', 'retrospective', NOW() + INTERVAL '13 days',  60, ARRAY['All squad leads','Project Manager'],
  ARRAY['What went well?','What needs improvement?','Action items for Sprint 2','Update Working Agreements if needed']);

-- ============================================================
-- RISK REGISTER — all 22 risks from roadmap
-- ============================================================

INSERT INTO risk_register (risk_code, category, title, description, likelihood, impact, owner, mitigation_strategy, sprint_identified) VALUES
('R-01','hcd','Insufficient usability test participation',
  'Fewer than 5 participants per persona leads to unvalidated design decisions.',
  'medium','high','UI/UX Designer',
  'Recruit participants in Sprint 1 before testing begins. Use screener surveys. Offer incentives. Extend window by 3 days if numbers fall short.',
  '1'),
('R-02','hcd','Onboarding flow fails to communicate three-in-one value',
  'Users do not understand the UniMart value proposition within 30 seconds of first launch.',
  'high','high','UI/UX Designer',
  'A/B test two onboarding flows in Sprint 3. Define comprehension ≥80% as Sprint 4 gate. Iterate copy and visuals.',
  '1'),
('R-03','hcd','Cross-vertical cart UX confuses users',
  'Mixed fulfilment timelines not clear at checkout.',
  'medium','high','UI/UX Designer',
  'Prototype and test cart flow in Sprint 2 with 5+ participants. Add inline tooltip if test reveals confusion.',
  '1'),
('R-04','hcd','a11y gaps discovered late',
  'WCAG 2.1 AA violations in Sprint 4 require significant rework.',
  'medium','high','UI/UX Designer',
  'Use Lovable a11y library from Sprint 2. Run Axe/Lighthouse at end of every sprint. Never defer a11y to Sprint 4.',
  '1'),
('R-05','hcd','Rural users have degraded experience',
  'Geo-fencing gaps cause hard error states for rural users.',
  'low','medium','Software Engineer',
  'Test geo-fencing in Replit staging with simulated rural coordinates in Sprint 3. Include rural participants in Sprint 4 usability cohort.',
  '1'),
('R-06','tech_stack','Lovable components fail WCAG 2.1 AA',
  'Auto-generated components may not meet accessibility standards out of the box.',
  'medium','medium','UI/UX Designer',
  'Audit Lovable component library in Sprint 2 before full build begins. a11y is a non-negotiable AC.',
  '1'),
('R-07','tech_stack','Replit microservices fail load test',
  'Platform degrades under 500 concurrent users.',
  'medium','high','Software Engineer',
  'Conduct load testing in Sprint 3, not Sprint 4. Scale Replit horizontally if needed.',
  '1'),
('R-08','tech_stack','Third-party API instability',
  'PayPal, OpenStreetMap/OSRM, or Twilio outages disrupt testing.',
  'low','high','Software Engineer',
  'Implement mock/stub versions of all third-party APIs for development. Only use live APIs for final integration tests.',
  '1'),
('R-09','tech_stack','n8n automation false positives cause friction',
  'Incorrect workflow triggers create seller or customer friction.',
  'medium','high','Data Analyst',
  'Set conservative thresholds in Sprint 2. Test n8n workflows against 50+ sample cases. Define false positive rate ≤10%.',
  '1'),
('R-10','tech_stack','Replit AI models underperform on real data',
  'Resolution rates fall below 80% threshold.',
  'medium','high','Data Analyst',
  'Begin model design in Sprint 2 with realistic data assumptions. Reserve Sprint 4 for tuning.',
  '1'),
('R-11','ai','Conversational AI misroutes queries',
  'AI misroutes user queries across verticals, eroding trust.',
  'high','high','Engineer',
  'Design intent classification layer in Sprint 2. Test against 20 varied queries. Build explicit fallback response.',
  '1'),
('R-12','ai','Conversational AI misroutes at production scale',
  'Intent classification failures at scale erode user trust.',
  'medium','high','Engineer',
  'Monitor resolution rate continuously post-launch and retrain as needed.',
  '1'),
('R-13','ai','Route optimisation produces suboptimal routes',
  'OSRM route quality may be lower than Google Maps baseline.',
  'medium','medium','Software Engineer',
  'Benchmark OSRM against manual routing across 10+ real delivery scenarios in Sprint 3.',
  '1'),
('R-14','ai','Meal planner conflicts with dietary preferences',
  'AI generates plans that violate user dietary restrictions.',
  'medium','medium','Data Analyst',
  'Test against 20 varied dietary profiles. Define alignment ≥90%. Build manual override.',
  '1'),
('R-15','compliance','Food-safety allergen labeling non-compliance',
  'Compliance violations discovered in Sprint 4 audit.',
  'medium','high','Legal/Compliance',
  'Engage Legal/Compliance in Sprint 1. n8n compliance checker designed with Legal input. Zero-tolerance policy.',
  '1'),
('R-16','compliance','Fake review or seller fraud in beta',
  'Trust erosion before launch due to fraudulent activity.',
  'medium','high','Legal Lead',
  'Deploy fake review and fraud detection before any public-facing beta. Manual review queue for flagged activity.',
  '1'),
('R-17','compliance','Data privacy compliance gap',
  'User data handling does not meet applicable regulations.',
  'low','high','Legal/Compliance',
  'Legal reviews data architecture in Sprint 2. Privacy policy drafted before Sprint 3 build.',
  '1'),
('R-18','project','8-week timeline insufficient',
  'Scope creep or technical debt accumulates beyond prototype deliverable.',
  'high','high','Project Manager',
  'Treat 8-week roadmap as a validated prototype deliverable. Strict sprint backlog. Any additions displace existing items.',
  '1'),
('R-19','project','Squad dependencies cause blocked tickets',
  'Lovable frontend blocked on Replit APIs not yet live.',
  'medium','high','Project Manager',
  'Define API contracts in Sprint 2. Use mock endpoints until Replit APIs are live. Unblock within 24 hours.',
  '1'),
('R-20','project','Key team member unavailability',
  'Critical sprint disruption due to unexpected absence.',
  'medium','medium','Project Manager',
  'All work documented in project wiki continuously. Cross-train at least one backup per squad.',
  '1'),
('R-21','project','Stakeholder feedback destabilises backlog',
  'Sprint Review feedback requests significant scope changes.',
  'medium','medium','Project Manager',
  'Set expectations: Sprint Reviews are demo sessions, not change approval gates. PM defers non-critical feedback.',
  '1'),
('R-22','project','Kanban board not actively maintained',
  'Stale tickets make velocity data unreliable.',
  'medium','medium','Project Manager',
  'n8n automated reporting highlights stale tickets daily. PM reviews board before each stand-up.',
  '1');

-- ============================================================
-- PROJECT WIKI — Working Agreements & DoD
-- ============================================================

INSERT INTO project_wiki (slug, title, content, category, sprint, author, approved) VALUES
('working-agreements', 'UniMart Team Working Agreements', E'# UniMart Working Agreements\n\n## Communication\n- Daily stand-ups at 9:30am sharp — 15 minutes max\n- All blockers raised in stand-up escalated within 24 hours if unresolved\n- Primary async channel: Slack #unimart-project\n- All decisions documented in the project wiki within 24 hours\n\n## Kanban Hygiene\n- Every team member updates their ticket status before stand-up\n- No ticket moves without a comment explaining the change\n- WIP limit: max 2 tickets In Progress per person at any time\n- Stale tickets (no update in 2 days) flagged by n8n automation\n\n## Definition of Done (Global)\n- All acceptance criteria met\n- Code reviewed by at least one peer (Sprint 3 onward)\n- Tests passing\n- Ticket updated in Jira/Linear\n- PM sign-off recorded on ticket\n- Documented in project wiki if it produces an artefact\n\n## Sprint Ceremonies\n- Attendance at all ceremonies is mandatory for squad leads\n- Retrospective action items actioned within 24 hours\n- No new scope enters a sprint after Planning without PM approval\n\n## Escalation Path\n1. Squad member → Squad lead (same day)\n2. Squad lead → PM (within 24 hours)\n3. PM → Senior Partners (within 48 hours for critical issues)',
  'working_agreements', '1', 'Project Manager', TRUE),

('definition-of-done', 'Definition of Done — All Sprints', E'# UniMart Definition of Done\n\n## US-01: HCD Kickoff & Empathy Mapping\n- [ ] All empathy maps and journey maps documented and stored in the project wiki\n- [ ] HCD challenge registry approved and baselined by Stakeholders\n- [ ] Brand direction formally approved in Sprint 1 Review\n- [ ] Kanban ticket moved to Done with Project Manager sign-off\n\n## US-02: Agile Team Formation & Project Infrastructure\n- [ ] All squads staffed and onboarded to all project tools\n- [ ] Kanban board live and actively in use by all team members\n- [ ] DoD, Working Agreements, and sprint schedule baselined in project wiki\n- [ ] Sprint 1 Retrospective completed; action items logged\n\n## Global DoD (applies to all tickets)\n- [ ] Acceptance criteria met and verifiable\n- [ ] PM sign-off recorded on Kanban ticket\n- [ ] Any artefacts stored in project wiki with version number\n- [ ] Ticket status updated to Done in Jira/Linear',
  'dod', '1', 'Project Manager', TRUE);

-- ============================================================
-- SPRINT VELOCITY — initial Sprint 1 baseline
-- ============================================================

WITH squad_ids AS (SELECT id, name FROM squads)
INSERT INTO sprint_velocity (sprint, squad_id, planned_points, tickets_planned)
SELECT '1', id, 
  CASE name
    WHEN 'ux_research'      THEN 13
    WHEN 'core_dev'         THEN 8
    WHEN 'ai_integration'   THEN 0
    WHEN 'growth_marketing' THEN 0
    WHEN 'legal_compliance' THEN 0
  END,
  CASE name
    WHEN 'ux_research'      THEN 1
    WHEN 'core_dev'         THEN 1
    ELSE 0
  END
FROM squad_ids;
