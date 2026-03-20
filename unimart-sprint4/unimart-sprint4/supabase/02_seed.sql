-- ============================================================
-- UniMart — Sprint 4 Seed Data
-- EP-05 & EP-06 · US-12 through US-15
-- Run AFTER 01_schema.sql
-- ============================================================

-- ── USER STORIES ─────────────────────────────────────────────
with ep05 as (select id from public.epics where epic_id = 'EP-05'),
     ep06 as (select id from public.epics where epic_id = 'EP-06')
insert into public.user_stories (story_id, epic_id, title, description, sprint, status, assigned_squad, acceptance_criteria, definition_of_done)
values
('US-12', (select id from ep05), 'Internal Testing & Usability Validation',
 'As a project team, we need to conduct structured usability and QA testing across all platforms.',
 4, 'Backlog', 'UX Research',
 '["Internal test deployment live across iOS, Android, Web and Driver App","Structured usability tests with 5+ participants per persona","Cross-vertical cart, return flows, and onboarding validated","Rural availability UX tested","WCAG 2.1 AA audit completed","n8n sentiment dashboard live","Analytics events verified"]'::jsonb,
 '["Zero critical bugs outstanding","Usability test report produced","a11y audit passed","Sentiment dashboard verified","Analytics confirmed firing correctly"]'::jsonb),
('US-13', (select id from ep05), 'AI Model Validation & Tuning',
 'As a Data Analyst, I need to validate and tune all 6 AI models.',
 4, 'Backlog', 'AI Integration',
 '["Recommendations engine A/B tested","Conversational AI resolution rate ≥ 80%","Meal planner validated against dietary preferences","n8n compliance checker false positive rate ≤ 10%","Route optimisation reduces delivery time vs baseline","Fraud detection correctly flags suspicious transactions"]'::jsonb,
 '["All 6 AI models meet minimum thresholds","Conversational AI ≥ 80% resolution","Compliance checker ≤ 10% false positives","AI tuning report produced"]'::jsonb),
('US-14', (select id from ep05), 'Trust, Safety & Compliance Review',
 'As a Legal/Compliance Team member, I need to conduct a full compliance audit.',
 4, 'Backlog', 'Legal/Compliance',
 '["Full compliance review: food safety, allergen, seller terms","Fraud detection reviewed and hardened","Fake review detection tested","Community standards and seller code of conduct published","Transparent refund SLAs displayed per vertical"]'::jsonb,
 '["Compliance audit completed with zero critical violations","All policies published","Fraud and fake review systems verified","Signed off by Legal lead and PM"]'::jsonb),
('US-15', (select id from ep06), 'Sprint 4 Review, Retrospective & Stakeholder Handoff',
 'As a project team, we need to conduct final Sprint Review and Retrospective and produce a comprehensive handoff document.',
 4, 'Backlog', 'Core Dev',
 '["Sprint 4 Review presented with live demo","n8n sentiment dashboard presented","Usability findings formally presented","Retrospective completed","Final handoff document complete","Next phase recommendations documented","Kanban board archived"]'::jsonb,
 '["Sprint Review completed with stakeholder attendance","Retrospective action items documented","All handoff documentation approved","Kanban board archived","PM confirms full closure"]'::jsonb)
on conflict (story_id) do nothing;

-- ── SPRINT 4 KANBAN TICKETS ───────────────────────────────────
insert into public.sprint_tickets (title, epic, story_id, sprint, squad, priority, status, tags) values
  -- US-12
  ('Deploy internal test build: iOS, Android, Web, Driver App',           'EP-05','US-12',4,'Core Dev',       'High','Backlog','{testing,deployment}'),
  ('Usability test: Customer persona — 5 participants',                    'EP-05','US-12',4,'UX Research',    'High','Backlog','{usability,customer}'),
  ('Usability test: Seller persona — 5 participants',                      'EP-05','US-12',4,'UX Research',    'High','Backlog','{usability,seller}'),
  ('Usability test: Driver persona — 5 participants',                      'EP-05','US-12',4,'UX Research',    'High','Backlog','{usability,driver}'),
  ('Validate cross-vertical cart and mixed checkout flow',                 'EP-05','US-12',4,'UX Research',    'High','Backlog','{cart,checkout}'),
  ('Validate onboarding comprehension ≥ 80% with 5 users',                'EP-05','US-12',4,'UX Research',    'High','Backlog','{onboarding}'),
  ('WCAG 2.1 AA audit: all Lovable screens with Axe/Lighthouse',          'EP-05','US-12',4,'UX Research',    'High','Backlog','{a11y,wcag}'),
  ('Bug bash: full team 2-hour session across all features',               'EP-05','US-12',4,'Core Dev',       'High','Backlog','{bugbash,qa}'),
  ('Regression test suite after each bug fix deployment',                  'EP-05','US-12',4,'Core Dev',       'High','Backlog','{regression,cicd}'),
  ('Rural UX: simulate rural coordinates in Replit geo-fencing',           'EP-05','US-12',4,'Core Dev',       'Medium','Backlog','{rural,geofencing}'),
  ('Analytics QA: verify all Mixpanel/Amplitude events fire correctly',    'EP-05','US-12',4,'AI Integration', 'High','Backlog','{analytics,mixpanel}'),
  ('Set up n8n sentiment dashboard — aggregate all feedback channels',     'EP-05','US-12',4,'AI Integration', 'High','Backlog','{n8n,sentiment}'),

  -- US-13
  ('A/B test recommendations engine across all three verticals',           'EP-05','US-13',4,'AI Integration', 'High','Backlog','{ai,recommendations,ab}'),
  ('Tune conversational AI — measure resolution rate on 20 test queries',  'EP-05','US-13',4,'AI Integration', 'High','Backlog','{ai,conversational}'),
  ('Validate meal planner: 20 dietary profiles, alignment ≥ 90%',         'EP-05','US-13',4,'AI Integration', 'High','Backlog','{ai,mealplanner}'),
  ('Validate compliance checker: 50 listings, false positive ≤ 10%',      'EP-05','US-13',4,'AI Integration', 'High','Backlog','{n8n,compliance}'),
  ('Validate route optimisation: 5 delivery scenarios vs baseline',        'EP-05','US-13',4,'AI Integration', 'High','Backlog','{ai,routing}'),
  ('Validate fraud detection: simulate flagged transactions',               'EP-05','US-13',4,'AI Integration', 'High','Backlog','{ai,fraud}'),
  ('Produce AI tuning report and store in project wiki',                   'EP-05','US-13',4,'AI Integration', 'Medium','Backlog','{wiki,report}'),

  -- US-14
  ('Legal review: food safety and allergen labelling compliance',          'EP-05','US-14',4,'Legal/Compliance','High','Backlog','{legal,food-safety}'),
  ('Legal review: n8n compliance rules vs current regulations',            'EP-05','US-14',4,'Legal/Compliance','High','Backlog','{legal,n8n}'),
  ('Harden Replit fraud detection — review edge cases',                    'EP-05','US-14',4,'Core Dev',       'High','Backlog','{fraud,security}'),
  ('Test fake review detection: 10 simulated submissions',                 'EP-05','US-14',4,'AI Integration', 'High','Backlog','{reviews,trust}'),
  ('Publish community standards and seller code of conduct',               'EP-05','US-14',4,'Legal/Compliance','High','Backlog','{policy,seller}'),
  ('Publish privacy policy and data handling documentation',               'EP-05','US-14',4,'Legal/Compliance','High','Backlog','{privacy,legal}'),
  ('Verify SLA transparency per vertical in Lovable app',                  'EP-05','US-14',4,'Core Dev',       'Medium','Backlog','{sla,ux}'),

  -- US-15
  ('Prepare Sprint 4 Review presentation with live demo',                  'EP-06','US-15',4,'Core Dev',       'High','Backlog','{review,demo}'),
  ('Present n8n sentiment dashboard to stakeholders',                      'EP-06','US-15',4,'AI Integration', 'High','Backlog','{sentiment,stakeholders}'),
  ('Produce final usability findings report',                              'EP-06','US-15',4,'UX Research',    'High','Backlog','{usability,report}'),
  ('Facilitate Sprint 4 Retrospective with all squad leads',               'EP-06','US-15',4,'Core Dev',       'High','Backlog','{retro,sprint4}'),
  ('Produce Lovable component library handoff documentation',              'EP-06','US-15',4,'Core Dev',       'High','Backlog','{handoff,lovable}'),
  ('Produce Replit codebase and API documentation',                        'EP-06','US-15',4,'Core Dev',       'High','Backlog','{handoff,replit}'),
  ('Produce n8n workflow documentation',                                   'EP-06','US-15',4,'AI Integration', 'High','Backlog','{handoff,n8n}'),
  ('Document next phase: beta launch plan, hiring, scaling',               'EP-06','US-15',4,'Core Dev',       'High','Backlog','{nextphase,strategy}'),
  ('Archive Kanban board and export velocity metrics',                     'EP-06','US-15',4,'Core Dev',       'Medium','Backlog','{kanban,velocity}')
on conflict do nothing;

-- ── QA TEST RUNS (seed) ───────────────────────────────────────
insert into public.qa_test_runs (title, user_story, test_type, persona, sprint, status, total_cases, passed_cases, failed_cases) values
  ('Customer App — E2E Purchase Flow',    'US-12', 'e2e',         'Customer',        4, 'Pending', 12, 0, 0),
  ('Cross-Vertical Cart Validation',      'US-12', 'usability',   'Customer',        4, 'Pending', 8,  0, 0),
  ('Seller Portal — Onboarding Flow',     'US-12', 'usability',   'Seller',          4, 'Pending', 6,  0, 0),
  ('Driver App — Delivery Flow',          'US-12', 'usability',   'Delivery Driver', 4, 'Pending', 7,  0, 0),
  ('WCAG 2.1 AA — All Screens',           'US-12', 'a11y',        'All',             4, 'Pending', 20, 0, 0),
  ('Replit API — Integration Tests',      'US-12', 'integration', 'Engineering',     4, 'Pending', 18, 0, 0),
  ('Replit — Load Test 500 Users',        'US-12', 'load',        'Engineering',     4, 'Pending', 5,  0, 0),
  ('Onboarding Comprehension Test',       'US-12', 'usability',   'Customer',        4, 'Pending', 5,  0, 0)
on conflict do nothing;

-- ── AI VALIDATION RUNS (seed baselines) ──────────────────────
insert into public.ai_validation_runs (feature, sprint, test_set_size, metric_name, metric_value, threshold, passed, notes) values
  ('conversational_ai',    4, 20,  'resolution_rate',      null, 0.80, null, 'Sprint 4 validation pending'),
  ('recommendations',      4, 100, 'click_through_rate',   null, 0.15, null, 'A/B test pending'),
  ('meal_planner',         4, 20,  'dietary_alignment',    null, 0.90, null, 'Validation pending'),
  ('compliance_checker',   4, 50,  'false_positive_rate',  null, 0.10, null, 'Validation pending'),
  ('route_optimisation',   4, 5,   'time_reduction_pct',   null, 0.10, null, 'Benchmark pending'),
  ('fraud_detection',      4, 20,  'true_positive_rate',   null, 0.90, null, 'Simulation pending')
on conflict do nothing;

-- ── COMPLIANCE AUDIT ITEMS ────────────────────────────────────
insert into public.compliance_audit_items (category, title, description, status, severity, owner) values
  ('Food Safety',          'Allergen labelling on all food listings',          'Verify all food/meal kit listings declare allergens per FALCPA requirements',                   'Pending', 'Critical', 'Legal/Compliance'),
  ('Food Safety',          'Food safety handling instructions',                 'Confirm raw/perishable items include safe handling instructions',                              'Pending', 'Critical', 'Legal/Compliance'),
  ('Allergen',             'n8n compliance checker allergen rules',             'Validate n8n allergen detection rules against current food safety legislation',                'Pending', 'Critical', 'Legal/Compliance'),
  ('Data Privacy',         'User data handling and storage',                    'Review Replit data models for data minimisation compliance (GDPR/CCPA)',                       'Pending', 'High',     'Legal/Compliance'),
  ('Data Privacy',         'Privacy policy published and accessible',           'Confirm privacy policy is live in Lovable app and clearly linked from all data capture forms', 'Pending', 'High',     'Legal/Compliance'),
  ('Seller Terms',         'Seller code of conduct published',                  'Community standards and seller terms live in app before any seller listings go live',          'Pending', 'High',     'Legal/Compliance'),
  ('Seller Terms',         'Commission structure documented and agreed',         'Commission rates per vertical formally approved by Senior Partners',                          'Pending', 'High',     'Legal/Compliance'),
  ('Community Standards',  'Fake review detection active pre-launch',           'n8n fake review workflow active and tested before any public-facing beta',                     'Pending', 'High',     'Legal/Compliance'),
  ('AI Compliance',        'AI compliance checker rules reviewed by Legal',      'All n8n compliance rules reviewed against current food-safety regulations by Legal team',     'Pending', 'Critical', 'Legal/Compliance'),
  ('Fraud Controls',       'Fraud detection model reviewed and hardened',        'Replit fraud detection edge cases addressed; n8n alert routing verified',                     'Pending', 'High',     'Legal/Compliance'),
  ('Refund Policy',        'SLA standards displayed per vertical',               'Correct SLA shown per vertical during returns flow in Lovable app',                           'Pending', 'Medium',   'Legal/Compliance'),
  ('Refund Policy',        'Self-serve refund flows tested end-to-end',          'All three vertical refund flows tested by Customer Support Agents',                           'Pending', 'Medium',   'Legal/Compliance')
on conflict do nothing;

-- ── RETROSPECTIVE ITEMS (Sprint 1-3 carry-overs) ─────────────
insert into public.retrospective_items (sprint, category, content, votes, status) values
  (4, 'went_well',    'Supabase + Lovable integration worked seamlessly across all 4 sprints', 5, 'Open'),
  (4, 'went_well',    'n8n automation workflows reduced manual effort significantly',           4, 'Open'),
  (4, 'went_well',    'Replit AI prototypes delivered working features in Sprint 2',            3, 'Open'),
  (4, 'to_improve',   'Port configuration issues with Replit (port 3000 vs 5000)',             4, 'Open'),
  (4, 'to_improve',   'RLS policies should be set to allow anon insert by default in seed',    3, 'Open'),
  (4, 'to_improve',   'n8n parallel branch timing requires Merge node — document for Sprint 2',2, 'Open'),
  (4, 'action_items', 'Document Replit port 5000 requirement in all future sprint READMEs',    0, 'Open'),
  (4, 'action_items', 'Add RLS anon insert policies to all future schema files by default',    0, 'Open'),
  (4, 'action_items', 'Create Sprint 5 backlog: beta launch, hiring plan, scaling strategy',   0, 'Open')
on conflict do nothing;

-- ── HANDOFF ITEMS (seed structure) ───────────────────────────
insert into public.handoff_items (section, title, content, status) values
  ('Executive Summary',  'Project Overview',            'UniMart is an 8-week Agile prototype combining Amazon, HelloFresh, and Uber Eats into one unified platform. The project advanced from discovery through a validated prototype demonstrating rigorous HCD, Agile, and AI integration practices.', 'Draft'),
  ('Executive Summary',  '8-Week Delivery Summary',     'Sprint 1: HCD foundation and team setup. Sprint 2: UX design, AI architecture, seller and support systems. Sprint 3: Full platform build — customer app, driver app, nutritionist portal, waitlist. Sprint 4: QA, AI validation, compliance audit, stakeholder handoff.', 'Draft'),
  ('Platform Handoff',   'Lovable Component Library',   'All customer-facing components built in Lovable with WCAG 2.1 AA compliance. Pages: Home Feed, Cart, Driver App, Seller Onboarding, Support Dashboard, AI Architecture, Nutritionist Portal, Waitlist Landing.', 'Draft'),
  ('Platform Handoff',   'Replit API Documentation',    'Express REST API on port 5000. Sprint 3 server.js contains all 30+ production endpoints. Secrets required: SUPABASE_URL, SUPABASE_SERVICE_KEY, OPENAI_API_KEY, OSRM_BASE_URL.', 'Draft'),
  ('Platform Handoff',   'n8n Workflow Documentation',  '6 production workflows: Sprint Velocity Reporting, Workshop Findings Aggregator, Compliance Checker, Support Ticket Router, Waitlist Notification, Fake Review Detection.', 'Draft'),
  ('Platform Handoff',   'Supabase Schema Documentation','35 tables across 4 sprints. Full RLS policies applied. Service role key required for backend operations. Anon key used for n8n and frontend operations.', 'Draft'),
  ('AI Features',        'Conversational AI',           'Intent classification with LLM fallback (GPT-3.5). Resolution rate target: ≥ 80%. Session history stored in conversation_history table.', 'Draft'),
  ('AI Features',        'Recommendations Engine',      'Personalised by dietary preferences and allergen filtering from Supabase customer profiles. Cross-vertical ranking. A/B test framework in Sprint 4.', 'Draft'),
  ('AI Features',        'Meal Planner',                'Multi-week plan generation with nutritionist-approved plan integration. Auto-cart population. Dietary alignment target: ≥ 90%.', 'Draft'),
  ('AI Features',        'Compliance Checker',          'n8n rule-based pre-publish scanning. Allergen, food safety, and policy rules. False positive target: ≤ 10%.', 'Draft'),
  ('AI Features',        'Route Optimisation',          'Live OSRM integration. Real-time routing with ETA calculation. Job record updates in delivery_jobs table.', 'Draft'),
  ('AI Features',        'Fraud Detection',             'Multi-signal risk scoring. Flags stored in fraud_flags table. n8n alert routing for human review queue.', 'Draft'),
  ('Risk Register',      'Outstanding Risks',           'R-18: 8-week scope — treat as validated prototype not production launch. R-02: Onboarding comprehension — A/B test in Sprint 4. R-11: Conversational AI misrouting — monitor resolution rate post-launch.', 'Draft'),
  ('Next Phase',         'Beta Launch Recommendations', 'Phase 1: Private beta with 500 users across all three verticals. Phase 2: Public waitlist conversion. Phase 3: Full launch with scaled Replit infrastructure and self-hosted OSRM.', 'Draft'),
  ('Next Phase',         'Hiring Recommendations',      'Priority hires: Senior Full-Stack Engineer (Replit scaling), ML Engineer (recommendations and fraud models), Legal/Compliance Manager (full-time), Customer Success Lead.', 'Draft'),
  ('Next Phase',         'Scaling Strategy',            'Migrate from Replit to dedicated cloud infrastructure (AWS/GCP) for production. Self-host OSRM for route optimisation. Replace GPT-3.5 with fine-tuned model on UniMart data.', 'Draft')
on conflict do nothing;

-- ── SENTIMENT FEEDBACK (sample data) ─────────────────────────
insert into public.sentiment_feedback (source, vertical, sentiment, score, feedback_text, category, sprint) values
  ('usability_test', 'Shop',          'positive', 0.85, 'Love that I can mix products and food in one cart!',         'cross-vertical cart',  4),
  ('usability_test', 'Food Delivery', 'positive', 0.90, 'The AI suggested exactly what I was in the mood for',         'conversational AI',    4),
  ('usability_test', 'Meal Kits',     'neutral',  0.10, 'Meal kit selection is good but delivery options limited',     'availability',         4),
  ('usability_test', 'Shop',          'negative', -0.60,'Onboarding took longer than expected to understand',          'onboarding',           4),
  ('support_ticket', 'Food Delivery', 'negative', -0.70,'My food arrived cold and it took too long to get a refund',   'refunds',              4),
  ('usability_test', 'Meal Kits',     'positive', 0.80, 'The nutritionist badge makes me trust the meal kits more',    'trust signals',        4),
  ('in_app',         'Shop',          'positive', 0.75, 'Recommendations are surprisingly accurate',                   'recommendations',      4),
  ('usability_test', null,            'positive', 0.95, 'Best shopping experience I have had — everything in one place','overall experience',   4)
on conflict do nothing;
