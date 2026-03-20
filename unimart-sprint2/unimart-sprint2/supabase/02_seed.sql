-- ============================================================
-- UniMart — Sprint 2 Seed Data
-- EP-02 & EP-03 · Weeks 3–4
-- Run AFTER 01_schema.sql
-- ============================================================

-- ── UPDATE SPRINT TICKETS — add Sprint 2 stories ─────────────
with ep02 as (select id from public.epics where epic_id = 'EP-02'),
     ep03 as (select id from public.epics where epic_id = 'EP-03')
insert into public.user_stories
  (story_id, epic_id, title, description, sprint, status, assigned_squad, acceptance_criteria, definition_of_done)
values
(
  'US-03',
  (select id from ep02),
  'Unified UX Architecture & Prototyping',
  'As a UI/UX Designer, I need to design a unified information architecture and mid-fidelity prototype that merges all three commerce paradigms.',
  2, 'Backlog', 'UX Research',
  '["Unified navigation covers Shop, Meal Kits, Food Delivery","Cross-vertical cart flow with delivery-time breakdown","Low-fi wireframes approved before mid-fi begins","Mid-fi Figma prototypes cover Customer and Seller experiences","Notification preference centre wireframes included","Driver app screens prototyped","All components meet WCAG 2.1 AA","Usability tests with 5-8 participants per persona"]'::jsonb,
  '["Mid-fi prototypes approved by UI/UX lead and PM","Usability test report produced","a11y audit passed with zero critical violations","Lovable component scaffolding initiated"]'::jsonb
),
(
  'US-04',
  (select id from ep02),
  'AI Integration Design & Architecture',
  'As a Software Engineer, I need to design the complete AI system architecture — recommendations, conversational AI, meal planner, compliance checker, fraud detection, and route optimisation.',
  2, 'Backlog', 'AI Integration',
  '["Recommendations engine documented with data flow diagrams","Conversational AI agent flow prototyped","Meal planner logic designed with auto-cart population","Compliance checker workflow designed in n8n","Route optimisation architecture documented","Fraud detection pipeline designed"]'::jsonb,
  '["All AI architecture docs stored in project wiki","Conversational AI prototype approved by PM","n8n automation workflows designed and baselined","AI design specs linked to Sprint 3 Replit tickets"]'::jsonb
),
(
  'US-05',
  (select id from ep03),
  'Seller Onboarding & Compliance',
  'As a Seller, I need a straightforward onboarding portal with AI-assisted listing tools and built-in compliance checks.',
  2, 'Backlog', 'Core Dev',
  '["Seller portal in Lovable: inventory, pricing, analytics, compliance dashboard","Replit AI listing generator: plain language to polished listing","n8n pre-publish compliance checker flags violations","Trust signals: verified badges, transparent ratings","Commission and payment structure approved","n8n seller onboarding workflow automates document verification"]'::jsonb,
  '["Lovable seller portal approved by Stakeholders and Legal","n8n compliance automation approved by Legal lead","Commission structure signed off by Senior Partners"]'::jsonb
),
(
  'US-06',
  (select id from ep03),
  'Returns, Refunds & Customer Support UX',
  'As a Customer Support Agent, I need distinctly designed resolution flows for each vertical.',
  2, 'Backlog', 'UX Research',
  '["Separate return/refund journey maps per vertical","Lovable support dashboard with AI-suggested responses","n8n automates ticket routing per vertical","Self-serve refund flow wireframes","SLA standards defined per vertical"]'::jsonb,
  '["All three vertical resolution flows approved","n8n ticket routing workflow live in staging","SLA standards baselined"]'::jsonb
)
on conflict (story_id) do nothing;

-- ── SPRINT 2 KANBAN TICKETS ───────────────────────────────────
insert into public.sprint_tickets (title, epic, story_id, sprint, squad, priority, status, tags) values
  -- US-03 UX
  ('Define unified information architecture (Shop / Meal Kits / Food Delivery)', 'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{ia,figma,ux}'),
  ('Produce low-fi wireframes: Customer app all screens',                         'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{wireframes,customer}'),
  ('Produce low-fi wireframes: Seller portal all screens',                        'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{wireframes,seller}'),
  ('Stakeholder sign-off on low-fi wireframes before mid-fi begins',              'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{signoff,review}'),
  ('Produce mid-fi Figma prototype: Customer experience end-to-end',              'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{figma,midfi,customer}'),
  ('Produce mid-fi Figma prototype: Seller experience end-to-end',               'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{figma,midfi,seller}'),
  ('Design cross-vertical cart flow with per-item delivery time breakdown',       'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{cart,checkout}'),
  ('Design notification preference centre wireframes',                            'EP-02', 'US-03', 2, 'UX Research', 'Medium', 'Backlog', '{notifications,ux}'),
  ('Prototype Driver app: job queue, routing, earnings screens',                  'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{driver,prototype}'),
  ('Run usability tests: 5-8 participants per persona (Customer, Seller, Driver)','EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{usability,testing}'),
  ('a11y audit: run Axe/Lighthouse on all prototype screens',                     'EP-02', 'US-03', 2, 'UX Research', 'High', 'Backlog', '{a11y,wcag}'),
  ('Initiate Lovable component scaffolding from approved Figma specs',            'EP-02', 'US-03', 2, 'Core Dev',    'Medium', 'Backlog', '{lovable,components}'),

  -- US-04 AI Architecture
  ('Design recommendations engine: data flow diagrams + API spec',               'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{ai,recommendations}'),
  ('Design conversational AI agent flow across all three verticals',             'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{ai,conversational}'),
  ('Prototype conversational AI: test 5 natural language queries per vertical',  'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{ai,prototype,testing}'),
  ('Design multi-week meal planner AI logic + auto-cart population flow',        'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{ai,mealplanner}'),
  ('Design n8n AI Regulatory Compliance Checker workflow',                       'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{n8n,compliance,ai}'),
  ('Design Replit route optimisation architecture with OpenStreetMap+OSRM',      'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{replit,routing,ai}'),
  ('Design fraud detection pipeline: signals → Replit model → n8n routing',     'EP-02', 'US-04', 2, 'AI Integration', 'High', 'Backlog', '{ai,fraud,pipeline}'),
  ('Engineering feasibility review: all AI architectures in Replit environment', 'EP-02', 'US-04', 2, 'Core Dev',       'High', 'Backlog', '{review,feasibility}'),
  ('Store all AI architecture docs in project wiki',                             'EP-02', 'US-04', 2, 'AI Integration', 'Medium', 'Backlog', '{wiki,documentation}'),

  -- US-05 Seller
  ('Design Lovable seller portal UI: inventory, pricing, analytics, compliance', 'EP-03', 'US-05', 2, 'Core Dev',       'High', 'Backlog', '{lovable,seller,portal}'),
  ('Design Replit AI listing generator API: plain text → polished listing',      'EP-03', 'US-05', 2, 'AI Integration', 'High', 'Backlog', '{replit,ai,listings}'),
  ('Design n8n pre-publish compliance checker: food safety + allergen rules',    'EP-03', 'US-05', 2, 'AI Integration', 'High', 'Backlog', '{n8n,compliance}'),
  ('Design n8n seller onboarding: doc verification + account approval routing',  'EP-03', 'US-05', 2, 'AI Integration', 'Medium', 'Backlog', '{n8n,onboarding}'),
  ('Define commission and payment structure — Senior Partner sign-off',          'EP-03', 'US-05', 2, 'Legal/Compliance','High', 'Backlog', '{commission,legal}'),
  ('Design trust signals: verified badges, ratings, review authenticity',        'EP-03', 'US-05', 2, 'UX Research',    'Medium', 'Backlog', '{trust,ux}'),

  -- US-06 Support & Refunds
  ('Produce return/refund journey maps for each vertical (3 maps)',              'EP-03', 'US-06', 2, 'UX Research',    'High', 'Backlog', '{journey,refunds}'),
  ('Design Lovable support agent dashboard with AI-suggested responses',         'EP-03', 'US-06', 2, 'Core Dev',       'High', 'Backlog', '{lovable,support}'),
  ('Design n8n ticket routing workflow: auto-route by vertical',                 'EP-03', 'US-06', 2, 'AI Integration', 'High', 'Backlog', '{n8n,routing,support}'),
  ('Wireframe self-serve refund flows: wrong item, late delivery, missing ingredient', 'EP-03', 'US-06', 2, 'UX Research', 'High', 'Backlog', '{wireframes,refunds}'),
  ('Define and document SLA standards per vertical',                             'EP-03', 'US-06', 2, 'Legal/Compliance','High', 'Backlog', '{sla,legal}')
on conflict do nothing;

-- ── AI BLUEPRINTS (US-04) ─────────────────────────────────────
insert into public.ai_blueprints (feature, description, platform, status, data_flow, api_endpoints, performance_threshold, sprint_designed, sprint_build) values
(
  'Recommendations Engine',
  'Cross-vertical personalisation engine that surfaces relevant products, meal kits, and food delivery items based on user behaviour, purchase history, and stated preferences.',
  'Replit',
  'Designing',
  '{
    "input": ["user_id", "browsing_history", "purchase_history", "vertical_preference", "location"],
    "processing": ["collaborative_filtering", "content_based_filtering", "cross_vertical_ranking"],
    "output": ["ranked_item_list", "confidence_scores", "vertical_distribution"]
  }'::jsonb,
  '[
    {"method": "GET", "path": "/api/recommendations/:user_id", "description": "Get personalised recommendations for a user"},
    {"method": "POST", "path": "/api/recommendations/event", "description": "Log a user interaction event for model training"}
  ]'::jsonb,
  'Click-through rate ≥ 15% on recommended items in A/B test',
  2, 3
),
(
  'Conversational AI Assistant',
  'Natural language shopping assistant that resolves queries across all three verticals — finding products, tracking orders, recommending meal kits, and handling food delivery questions.',
  'Replit',
  'Designing',
  '{
    "input": ["user_message", "conversation_history", "user_id", "active_vertical"],
    "processing": ["intent_classification", "entity_extraction", "vertical_routing", "response_generation"],
    "output": ["response_text", "suggested_actions", "vertical_routed_to", "confidence_score"]
  }'::jsonb,
  '[
    {"method": "POST", "path": "/api/chat/message", "description": "Send a message and receive AI response"},
    {"method": "GET",  "path": "/api/chat/history/:session_id", "description": "Retrieve conversation history"},
    {"method": "POST", "path": "/api/chat/feedback", "description": "Log user feedback on AI response quality"}
  ]'::jsonb,
  'Resolution rate ≥ 80% on test query set without fallback',
  2, 3
),
(
  'AI Meal Planner',
  'Multi-week meal planning AI that generates personalised meal plans based on dietary preferences, household size, and budget — then auto-populates the cart with the required meal kit ingredients.',
  'Replit',
  'Designing',
  '{
    "input": ["dietary_preferences", "allergies", "household_size", "budget", "cuisine_preferences", "weeks"],
    "processing": ["nutritional_optimisation", "variety_balancing", "budget_fitting", "cart_population"],
    "output": ["weekly_meal_plan", "shopping_list", "auto_populated_cart", "nutritional_summary"]
  }'::jsonb,
  '[
    {"method": "POST", "path": "/api/meal-planner/generate", "description": "Generate a multi-week meal plan"},
    {"method": "POST", "path": "/api/meal-planner/populate-cart", "description": "Auto-populate cart from meal plan"},
    {"method": "PUT",  "path": "/api/meal-planner/adjust", "description": "Adjust a generated meal plan"}
  ]'::jsonb,
  'Generated plans align with dietary preferences ≥ 90% of test cases',
  2, 3
),
(
  'AI Regulatory Compliance Checker',
  'n8n automation workflow that scans product listings pre-publication for food-safety violations, missing allergen disclosures, and policy breaches — flagging issues before they go live.',
  'n8n',
  'Designing',
  '{
    "input": ["listing_id", "title", "description", "allergens", "ingredients", "category", "vertical"],
    "processing": ["allergen_rule_check", "food_safety_rule_check", "policy_violation_check", "flagging"],
    "output": ["compliance_status", "flags", "severity_ratings", "recommended_fixes"]
  }'::jsonb,
  '[
    {"trigger": "Webhook", "path": "/webhook/compliance-check", "description": "Trigger compliance check on listing save"},
    {"action": "Supabase upsert", "table": "compliance_checks", "description": "Write compliance result to database"}
  ]'::jsonb,
  'False positive rate ≤ 10% on 50 test listings',
  2, 3
),
(
  'Fraud Detection',
  'ML-based fraud detection pipeline that monitors checkout events and seller activity for suspicious patterns — scoring risk and routing flagged cases to n8n for human review.',
  'Replit',
  'Designing',
  '{
    "input": ["order_id", "user_id", "payment_method", "amount", "device_fingerprint", "velocity_signals", "location"],
    "processing": ["feature_engineering", "risk_scoring", "threshold_comparison", "alert_generation"],
    "output": ["risk_score", "flag_reason", "recommended_action", "alert_payload"]
  }'::jsonb,
  '[
    {"method": "POST", "path": "/api/fraud/check-order", "description": "Score fraud risk for a checkout event"},
    {"method": "POST", "path": "/api/fraud/check-seller", "description": "Score fraud risk for seller activity"},
    {"method": "GET",  "path": "/api/fraud/flags", "description": "Retrieve all active fraud flags for review"}
  ]'::jsonb,
  'Correctly flags suspicious transactions; false positive rate ≤ 5%',
  2, 3
),
(
  'Route Optimisation',
  'Real-time AI route optimisation engine for delivery drivers using OpenStreetMap + OSRM, incorporating live traffic data and multi-stop optimisation to reduce delivery times.',
  'Replit',
  'Designing',
  '{
    "input": ["driver_location", "pickup_address", "delivery_address", "traffic_data", "time_of_day"],
    "processing": ["osrm_routing", "traffic_weighting", "eta_calculation", "dynamic_rerouting"],
    "output": ["optimised_route", "waypoints", "eta_minutes", "distance_km", "traffic_alerts"]
  }'::jsonb,
  '[
    {"method": "POST", "path": "/api/routing/optimise", "description": "Get optimised route for a delivery"},
    {"method": "POST", "path": "/api/routing/reroute", "description": "Dynamically reroute based on traffic change"},
    {"method": "GET",  "path": "/api/routing/eta/:job_id", "description": "Get current ETA for an active delivery"}
  ]'::jsonb,
  'Reduces estimated delivery time vs non-optimised baseline across 5 test scenarios',
  2, 3
)
on conflict (feature) do update set
  status = excluded.status,
  updated_at = now();

-- ── SLA STANDARDS (US-06) ─────────────────────────────────────
insert into public.sla_standards (vertical, issue_type, response_hours, resolution_hours, refund_eligible, policy_notes) values
  ('Shop',          'Wrong Item',         2,  48, true,  'Customer must report within 30 days of delivery. Photo evidence required.'),
  ('Shop',          'Late Delivery',      4,  72, true,  'Eligible for refund if delivery exceeds estimated date by more than 3 days.'),
  ('Shop',          'Refund Request',     2,  48, true,  'Standard 30-day return window for eligible items.'),
  ('Meal Kits',     'Missing Ingredient', 1,  24, true,  'Report within 48 hours of delivery. Full or partial refund based on impact on recipe.'),
  ('Meal Kits',     'Late Delivery',      2,  24, true,  'Full refund if meal kit arrives after intended cook date.'),
  ('Meal Kits',     'Wrong Item',         1,  24, true,  'Full replacement or refund within 24 hours.'),
  ('Food Delivery', 'Cold Food',          1,   4, true,  'Report within 1 hour of delivery. Partial or full refund at agent discretion.'),
  ('Food Delivery', 'Late Delivery',      1,   4, true,  'Eligible for delivery fee refund if exceeded ETA by more than 20 minutes.'),
  ('Food Delivery', 'Wrong Item',         1,   4, true,  'Full refund or reorder within 2 hours of delivery.')
on conflict do nothing;

-- ── UX PROTOTYPES (placeholder rows) ─────────────────────────
insert into public.ux_prototypes (title, persona, fidelity, status, sprint) values
  ('Customer App — Home Feed & Navigation',     'Customer',        'low-fi',  'In Progress', 2),
  ('Customer App — Cross-Vertical Cart',        'Customer',        'low-fi',  'In Progress', 2),
  ('Customer App — Onboarding Flow',            'Customer',        'low-fi',  'In Progress', 2),
  ('Customer App — Notification Preference',    'Customer',        'low-fi',  'In Progress', 2),
  ('Seller Portal — Dashboard & Listings',      'Seller',          'low-fi',  'In Progress', 2),
  ('Seller Portal — Onboarding Flow',           'Seller',          'low-fi',  'In Progress', 2),
  ('Driver App — Job Queue & Routing',          'Delivery Driver', 'low-fi',  'In Progress', 2),
  ('Support Dashboard — Ticket Triage',         'Support Agent',   'low-fi',  'In Progress', 2)
on conflict do nothing;

-- ── TEST SELLERS ──────────────────────────────────────────────
insert into public.sellers (business_name, contact_email, vertical, status, commission_rate) values
  ('Fresh Fields Co.',     'hello@freshfields.com',   'Shop',          'Pending',      12.00),
  ('GreenBox Meals',       'ops@greenboxmeals.com',   'Meal Kits',     'Under Review', 14.00),
  ('Spice Route Kitchen',  'info@spiceroute.com',     'Food Delivery', 'Pending',      18.00),
  ('The Pantry Store',     'team@thepantry.com',      'Shop',          'Pending',      12.00),
  ('NutriKit',             'hello@nutrikit.com',      'Meal Kits',     'Approved',     14.00)
on conflict do nothing;

-- ── TEST SUPPORT TICKETS ──────────────────────────────────────
insert into public.support_tickets (customer_email, vertical, issue_type, status, sla_hours) values
  ('alice@example.com',  'Shop',          'Wrong Item',         'Open',        48),
  ('bob@example.com',    'Meal Kits',     'Missing Ingredient', 'In Progress', 24),
  ('carol@example.com',  'Food Delivery', 'Cold Food',          'Open',         4),
  ('dave@example.com',   'Shop',          'Late Delivery',      'Resolved',    72),
  ('eve@example.com',    'Food Delivery', 'Late Delivery',      'Open',         4)
on conflict do nothing;
