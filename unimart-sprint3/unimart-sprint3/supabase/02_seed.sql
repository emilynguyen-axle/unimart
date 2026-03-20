-- ============================================================
-- UniMart — Sprint 3 Seed Data
-- EP-04 · US-07 through US-11
-- Run AFTER 01_schema.sql
-- ============================================================

-- ── USER STORIES ─────────────────────────────────────────────
with ep04 as (select id from public.epics where epic_id = 'EP-04')
insert into public.user_stories (story_id, epic_id, title, description, sprint, status, assigned_squad, acceptance_criteria, definition_of_done)
values
('US-07', (select id from ep04), 'Core Backend & Infrastructure',
 'As a Software Engineer, I need to build the core microservices, third-party integrations, and geo-aware services in Replit.',
 3, 'Backlog', 'Core Dev',
 '["Microservices live: Auth, Catalog, Orders, Delivery, Meal Kit, Returns","PayPal, OpenStreetMap+OSRM, Twilio integrations functional","n8n fraud alert routing workflow live","Replit geo-fencing for rural users","CI/CD pipeline with staging and production separated","Load test: 500 concurrent users"]'::jsonb,
 '["All microservices pass integration tests","CI/CD pipeline running","Load test within acceptable thresholds"]'::jsonb),
('US-08', (select id from ep04), 'Customer-Facing App (iOS & Android)',
 'As a Customer, I want a single unified app for Shop, Meal Kits, and Food Delivery with AI recommendations and full accessibility.',
 3, 'Backlog', 'Core Dev',
 '["Unified home feed: products, meal kits, local food","Smart cart with per-item delivery times","Real-time delivery tracking","Conversational AI assistant","Multi-week meal planner","Notification preference centre","WCAG 2.1 AA throughout","Onboarding communicates value in 30 seconds"]'::jsonb,
 '["All purchase flows pass QA","Zero critical a11y violations","Onboarding comprehension ≥ 80%","Conversational AI resolves ≥ 80% of queries"]'::jsonb),
('US-09', (select id from ep04), 'Delivery Driver App',
 'As a Delivery Driver, I need a dedicated app with AI-optimised routing, job queue, and earnings dashboard.',
 3, 'Backlog', 'Core Dev',
 '["Job queue shows pickup, destination, estimated pay","AI route optimisation with live traffic","Large tap targets, voice prompt UI","Real-time earnings dashboard","Driver onboarding with background check"]'::jsonb,
 '["All driver screens pass QA","AI routing reduces delivery time vs baseline","Drivers complete flow with ≤ 3 screen interactions while moving"]'::jsonb),
('US-10', (select id from ep04), 'Nutritionist & Content Partner Portal',
 'As a Nutritionist, I need a portal to submit and manage expert-curated meal plans.',
 3, 'Backlog', 'Core Dev',
 '["Portal allows submit, edit, manage meal plans","Nutritionist badges on qualifying listings","Nutritionist data ingested into meal planner AI","Ask a Nutritionist premium feature available"]'::jsonb,
 '["Portal functional and passes QA","Badge display verified","AI data ingestion confirmed"]'::jsonb),
('US-11', (select id from ep04), 'Branding & Marketing Foundation',
 'As a Senior Partner, I need finalised brand guidelines and a live waitlist landing page.',
 3, 'Backlog', 'Growth/Marketing',
 '["Brand guidelines finalised: logo, colours, typography, tone","Waitlist landing page live with referral loop","Influencer campaign plan approved","ASO strategy documented","n8n waitlist notification workflow live"]'::jsonb,
 '["Brand guidelines formally approved","Waitlist page live with referral loop functional","n8n waitlist workflow verified"]'::jsonb)
on conflict (story_id) do nothing;

-- ── SPRINT 3 KANBAN TICKETS ───────────────────────────────────
insert into public.sprint_tickets (title, epic, story_id, sprint, squad, priority, status, tags) values
  -- US-07 Backend
  ('Build Auth microservice in Replit',                                    'EP-04','US-07',3,'Core Dev','High','Backlog','{replit,auth,microservice}'),
  ('Build Product Catalog microservice in Replit',                         'EP-04','US-07',3,'Core Dev','High','Backlog','{replit,catalog}'),
  ('Build Order Management microservice in Replit',                        'EP-04','US-07',3,'Core Dev','High','Backlog','{replit,orders}'),
  ('Build Delivery Tracking microservice in Replit',                       'EP-04','US-07',3,'Core Dev','High','Backlog','{replit,delivery}'),
  ('Build Meal Kit microservice in Replit',                                'EP-04','US-07',3,'Core Dev','High','Backlog','{replit,mealkit}'),
  ('Build Returns microservice in Replit',                                 'EP-04','US-07',3,'Core Dev','Medium','Backlog','{replit,returns}'),
  ('Integrate PayPal API in Replit staging',                               'EP-04','US-07',3,'Core Dev','High','Backlog','{paypal,payments}'),
  ('Integrate OpenStreetMap + OSRM in Replit',                             'EP-04','US-07',3,'Core Dev','High','Backlog','{osrm,routing}'),
  ('Integrate Twilio notifications in Replit',                             'EP-04','US-07',3,'Core Dev','Medium','Backlog','{twilio,notifications}'),
  ('Implement geo-fencing: rural vs urban availability logic',             'EP-04','US-07',3,'Core Dev','Medium','Backlog','{geofencing,rural}'),
  ('Set up CI/CD pipeline in Replit',                                      'EP-04','US-07',3,'Core Dev','High','Backlog','{cicd,pipeline}'),
  ('Load test: 500 concurrent users across all three verticals',           'EP-04','US-07',3,'Core Dev','High','Backlog','{loadtest,performance}'),
  ('n8n fraud alert routing workflow live in staging',                     'EP-04','US-07',3,'AI Integration','High','Backlog','{n8n,fraud}'),

  -- US-08 Customer App
  ('Build unified home feed in Lovable',                                   'EP-04','US-08',3,'Core Dev','High','Backlog','{lovable,homefeed}'),
  ('Build smart cross-vertical cart in Lovable',                           'EP-04','US-08',3,'Core Dev','High','Backlog','{lovable,cart}'),
  ('Build real-time delivery tracking UI in Lovable',                      'EP-04','US-08',3,'Core Dev','High','Backlog','{lovable,tracking}'),
  ('Integrate conversational AI UI in Lovable',                            'EP-04','US-08',3,'AI Integration','High','Backlog','{lovable,ai,chat}'),
  ('Build multi-week meal planner UI in Lovable',                          'EP-04','US-08',3,'Core Dev','High','Backlog','{lovable,mealplanner}'),
  ('Build notification preference centre in Lovable',                      'EP-04','US-08',3,'Core Dev','Medium','Backlog','{lovable,notifications}'),
  ('WCAG 2.1 AA audit on all customer app screens',                        'EP-04','US-08',3,'UX Research','High','Backlog','{a11y,wcag}'),
  ('Build onboarding flow — communicates value in 30 seconds',             'EP-04','US-08',3,'UX Research','High','Backlog','{onboarding,ux}'),

  -- US-09 Driver App
  ('Build driver job queue UI in Lovable',                                 'EP-04','US-09',3,'Core Dev','High','Backlog','{lovable,driver,jobs}'),
  ('Integrate AI route optimisation in driver app',                        'EP-04','US-09',3,'AI Integration','High','Backlog','{routing,driver}'),
  ('Build driver earnings dashboard in Lovable',                           'EP-04','US-09',3,'Core Dev','High','Backlog','{lovable,earnings}'),
  ('Implement large tap targets and voice prompt UI',                      'EP-04','US-09',3,'UX Research','High','Backlog','{ux,accessibility,driver}'),
  ('Build driver onboarding with n8n background check integration',        'EP-04','US-09',3,'AI Integration','Medium','Backlog','{onboarding,n8n}'),

  -- US-10 Nutritionist Portal
  ('Build nutritionist portal UI in Lovable',                              'EP-04','US-10',3,'Core Dev','High','Backlog','{lovable,nutritionist}'),
  ('Build meal plan submission and management flow',                       'EP-04','US-10',3,'Core Dev','High','Backlog','{mealplan,portal}'),
  ('Implement nutritionist badge display on listings',                     'EP-04','US-10',3,'Core Dev','Medium','Backlog','{badge,listings}'),
  ('Connect nutritionist data to Replit meal planner AI',                  'EP-04','US-10',3,'AI Integration','High','Backlog','{ai,nutritionist,replit}'),
  ('Build Ask a Nutritionist premium feature UI',                          'EP-04','US-10',3,'Core Dev','Medium','Backlog','{premium,nutritionist}'),

  -- US-11 Branding & Waitlist
  ('Finalise brand guidelines: logo, colours, typography, tone',           'EP-04','US-11',3,'Growth/Marketing','High','Backlog','{brand,guidelines}'),
  ('Build waitlist landing page with referral loop in Lovable',            'EP-04','US-11',3,'Growth/Marketing','High','Backlog','{lovable,waitlist,landing}'),
  ('Set up n8n waitlist notification workflow',                            'EP-04','US-11',3,'AI Integration','Medium','Backlog','{n8n,waitlist}'),
  ('Document ASO keyword and creative strategy',                           'EP-04','US-11',3,'Growth/Marketing','Medium','Backlog','{aso,marketing}'),
  ('Get brand guidelines approved by Senior Partners',                     'EP-04','US-11',3,'Growth/Marketing','High','Backlog','{brand,approval}')
on conflict do nothing;

-- ── TEST CUSTOMERS ────────────────────────────────────────────
insert into public.customers (email, full_name, phone, dietary_preferences, allergies, household_size) values
  ('alice@example.com',  'Alice Chen',    '+1 555 001 0001', '{vegetarian}',          '{nuts}',     2),
  ('bob@example.com',    'Bob Martinez',  '+1 555 001 0002', '{standard}',            '{}',         1),
  ('carol@example.com',  'Carol Smith',   '+1 555 001 0003', '{vegan,gluten-free}',   '{gluten}',   3),
  ('dave@example.com',   'Dave Johnson',  '+1 555 001 0004', '{standard}',            '{dairy}',    4),
  ('eve@example.com',    'Eve Williams',  '+1 555 001 0005', '{pescatarian}',         '{shellfish}', 2)
on conflict (email) do nothing;

-- ── TEST DELIVERY DRIVERS ─────────────────────────────────────
insert into public.delivery_drivers (full_name, email, phone, vehicle_type, status, background_check_status, rating) values
  ('James Wilson',   'james@drivers.com',   '+1 555 002 0001', 'Motorcycle', 'Online',  'Passed', 4.92),
  ('Sarah Lee',      'sarah@drivers.com',   '+1 555 002 0002', 'Bicycle',    'Online',  'Passed', 4.87),
  ('Mike Davis',     'mike@drivers.com',    '+1 555 002 0003', 'Car',        'Offline', 'Passed', 4.75),
  ('Lisa Brown',     'lisa@drivers.com',    '+1 555 002 0004', 'Motorcycle', 'Online',  'Passed', 4.95)
on conflict (email) do nothing;

-- ── TEST NUTRITIONISTS ────────────────────────────────────────
insert into public.nutritionists (full_name, email, credentials, specialisations, bio, badge_verified) values
  ('Dr. Emma Patel',    'emma@nutrition.com', 'RD, PhD Nutritional Science', '{vegan,sports-nutrition,weight-management}', 'Registered Dietitian with 12 years experience specialising in plant-based nutrition and athletic performance.', true),
  ('James Okafor RD',   'james@nutrition.com', 'RD, MSc Human Nutrition',    '{diabetes,heart-health,family-nutrition}',    'Specialising in chronic disease prevention through evidence-based dietary interventions.', true),
  ('Sofia Rodriguez',   'sofia@nutrition.com', 'CNS, Certified Nutritionist', '{gut-health,anti-inflammatory,meal-prep}',   'Functional nutrition practitioner focused on gut microbiome health and anti-inflammatory eating.', false)
on conflict (email) do nothing;

-- ── TEST PRODUCTS ─────────────────────────────────────────────
INSERT INTO public.products (title, description, vertical, price, category, allergens, tags, in_stock, stock_count)
VALUES
  ('Organic Olive Oil 500ml',      'Cold-pressed extra virgin olive oil',            'Shop',          12.99, 'Pantry',   '{}',                        '{organic,pantry,cooking}',       true, 50),
  ('Bamboo Cutting Board Set',     'Set of 3 sustainably sourced bamboo boards',      'Shop',          24.99, 'Kitchen',  '{}',                        '{kitchen,eco,gift}',             true, 50),
  ('Oat Milk 1L',                  'Barista-grade oat milk, no added sugar',          'Shop',           3.49, 'Drinks',   '{}',                        '{vegan,dairy-free,drinks}',      true, 50),
  ('Thai Green Curry Kit',         'Authentic Thai curry kit for 2, ready in 25min',  'Meal Kits',     12.99, 'Asian',    '{fish,soy}',                '{thai,spicy,quick}',             true, 50),
  ('Mushroom Risotto Kit',         'Creamy Italian risotto with wild mushrooms',       'Meal Kits',     11.99, 'Italian',  '{dairy,gluten}',            '{vegetarian,italian,comfort}',   true, 50),
  ('Vegan Pad Thai Kit',           'Classic pad thai with tofu, serves 2',            'Meal Kits',     10.99, 'Asian',    '{soy,peanuts}',             '{vegan,thai,quick}',             true, 50),
  ('Wagamama Ramen Bowl',          'Tonkotsu ramen with pork belly and soft egg',     'Food Delivery',  16.50, 'Japanese', '{gluten,eggs,dairy}',       '{ramen,japanese,popular}',       true, 50),
  ('Dishoom Breakfast Bun',        'Bacon naan roll with chilli butter',              'Food Delivery',  12.00, 'Indian',   '{gluten,dairy}',            '{breakfast,indian,popular}',     true, 50),
  ('Pizza Margherita',             'Classic wood-fired margherita, 12 inch',          'Food Delivery',  14.00, 'Italian',  '{gluten,dairy}',            '{pizza,italian,classic}',        true, 50)
ON CONFLICT DO NOTHING;

-- ── WAITLIST SEED ENTRIES ─────────────────────────────────────
insert into public.waitlist (email, vertical_interest, position) values
  ('earlybird1@example.com', '{Shop,Meal Kits}',             1),
  ('earlybird2@example.com', '{Food Delivery}',              2),
  ('earlybird3@example.com', '{Shop,Food Delivery,Meal Kits}', 3),
  ('earlybird4@example.com', '{Meal Kits}',                  4),
  ('earlybird5@example.com', '{Shop}',                       5)
on conflict (email) do nothing;

-- ── BRAND ASSETS (seed) ───────────────────────────────────────
insert into public.brand_assets (asset_type, title, content, approved, version) values
  ('color_palette', 'UniMart Brand Colors', '{
    "primary": "#6C5CE7",
    "secondary": "#A29BFE",
    "accent_green": "#00B894",
    "accent_orange": "#F7A954",
    "accent_red": "#F76B8A",
    "dark_bg": "#0A0C14",
    "card_bg": "#0F1220",
    "text_primary": "#E2E4EF",
    "text_secondary": "#8890AA"
  }'::jsonb, false, '1.0'),
  ('typography', 'UniMart Typography', '{
    "display_font": "DM Sans",
    "body_font": "DM Sans",
    "mono_font": "JetBrains Mono",
    "scale": {"xs":"11px","sm":"12px","base":"14px","lg":"16px","xl":"18px","2xl":"22px","3xl":"28px","4xl":"36px"}
  }'::jsonb, false, '1.0'),
  ('tone_of_voice', 'UniMart Tone of Voice', '{
    "personality": ["Confident","Warm","Effortless","Modern"],
    "avoid": ["Corporate jargon","Overly casual slang","Passive voice","Filler words"],
    "tagline_options": ["Everything delivered, one app.","Shop. Cook. Eat. One place.","Your world, delivered."]
  }'::jsonb, false, '1.0')
on conflict do nothing;

-- ── TEST ORDERS ───────────────────────────────────────────────
insert into public.orders (vertical, status, subtotal, delivery_fee, total, payment_status, items)
select
  o.vertical, o.status, o.subtotal, o.delivery_fee,
  o.subtotal + o.delivery_fee as total,
  'Paid',
  o.items::jsonb
from (values
  ('Shop',          'Delivered',        24.48, 3.99, '[{"title":"Organic Olive Oil","price":12.99,"qty":1},{"title":"Oat Milk","price":3.49,"qty":1}]'),
  ('Meal Kits',     'Out for Delivery', 12.99, 2.99, '[{"title":"Thai Green Curry Kit","price":12.99,"qty":1}]'),
  ('Food Delivery', 'Preparing',        16.50, 1.99, '[{"title":"Wagamama Ramen Bowl","price":16.50,"qty":1}]'),
  ('Mixed',         'Confirmed',        35.48, 4.99, '[{"title":"Bamboo Cutting Board","price":24.99,"qty":1},{"title":"Dishoom Breakfast Bun","price":12.00,"qty":1}]')
) as o(vertical, status, subtotal, delivery_fee, items)
on conflict do nothing;
