-- ============================================================
-- UniMart Sprint 1 — Seed Data
-- All 11 user groups, 11 HCD challenges, 22 risks,
-- 4 sprints, 6 epics, 15 user stories, 5 squads
-- ============================================================

-- ============================================================
-- SQUADS
-- ============================================================
INSERT INTO squads (name, display_name, description) VALUES
  ('ux_research',      'UX Research',       'Human-centered design, user testing, empathy mapping, journey mapping'),
  ('core_dev',         'Core Dev',           'Backend microservices, APIs, Replit infrastructure, CI/CD'),
  ('ai_integration',   'AI Integration',     'AI model design, Replit model hosting, conversational AI, churn pipeline'),
  ('growth_marketing', 'Growth & Marketing', 'Brand, waitlist, ASO, influencer, co-marketing campaigns'),
  ('legal_compliance', 'Legal & Compliance', 'Food-safety, allergen labeling, privacy, marketplace terms');

-- ============================================================
-- USER GROUPS
-- ============================================================
INSERT INTO user_groups (name, description, icon, display_order) VALUES
  ('Customers',                        'End consumers browsing, purchasing, and receiving orders across all three verticals', '🛍️',  1),
  ('Sellers',                          'Merchants and food producers listing products, meal kits, and restaurant menus',       '🏪',  2),
  ('Stakeholders',                     'Internal project stakeholders and department leads providing direction and approvals',  '📋',  3),
  ('Senior Partners',                  'Executive decision-makers with authority over brand, budget, and launch strategy',     '🏆',  4),
  ('UI/UX Designers',                  'Design team responsible for HCD, prototyping, accessibility, and component library',   '🎨',  5),
  ('Software Engineers',               'Full-stack engineers building Lovable UI, Replit backend, and n8n automations',        '⚙️',  6),
  ('Delivery Drivers / Couriers',      'Gig workers and employed couriers fulfilling last-mile delivery for all verticals',    '🚗',  7),
  ('Customer Support Agents',          'First and second-line support resolving disputes, refunds, and complaints',            '🎧',  8),
  ('Nutritionists / Dietitians',       'Credentialed nutrition professionals curating and validating meal kit content',        '🥗',  9),
  ('Regulatory / Legal / Compliance',  'Legal counsel and compliance officers covering food law, privacy, and marketplace regs','⚖️', 10),
  ('Data Analysts / Growth Teams',     'Analytics and growth professionals measuring retention, churn, and conversion',        '📊', 11);

-- ============================================================
-- HCD CHALLENGES
-- ============================================================
INSERT INTO hcd_challenges (challenge_id, title, description, severity, frequency, priority_rank, mitigation_notes) VALUES
  ('HCD-01', 'Disorganisation',
    'Merging three distinct UX paradigms (e-commerce, meal kits, food delivery) into one coherent, intuitive app without overwhelming users.',
    'critical', 5, 1,
    'Unified IA designed in Sprint 2. Navigation structure: Shop | Meal Kits | Food Delivery. Moderated usability tests with 5+ participants per persona to validate clarity.'),
  ('HCD-02', 'Onboarding Complexity',
    'Communicating a compelling three-in-one value proposition to new users in under 30 seconds before they disengage.',
    'high', 5, 2,
    'A/B test two onboarding flows in Sprint 3. Define ≥80% comprehension as Sprint 4 gate. Iterate copy and visuals based on test feedback.'),
  ('HCD-03', 'Gaining Customers',
    'Building brand trust and delivering a strong enough first-impression experience to convert new visitors into active users.',
    'high', 4, 3,
    'Finalise brand guidelines Sprint 3. Live waitlist with referral loop in Lovable. Influencer and co-marketing campaign plan approved by Senior Partners.'),
  ('HCD-04', 'Trust & Safety at Scale',
    'Verifying sellers, detecting fake reviews, and preventing fraud without creating friction for legitimate actors.',
    'high', 4, 4,
    'n8n fake review detection and fraud alert workflows deployed before any public beta. Community standards published before seller listings go live.'),
  ('HCD-05', 'Accessibility (a11y)',
    'Meeting WCAG 2.1 AA across all three commerce types including screen reader support, font scaling, and colour contrast.',
    'high', 3, 5,
    'Use Lovable a11y library from Sprint 2. Axe/Lighthouse checks at end of every sprint. Zero critical violations as DoD criterion on every story.'),
  ('HCD-06', 'Returns & Refunds UX',
    'Designing distinct, intuitive resolution flows for three fundamentally different product types: physical goods, meal kits, and hot food.',
    'medium', 3, 6,
    'Separate return/refund journey maps per vertical. Self-serve flow wireframes in Sprint 2. SLA standards defined and displayed transparently.'),
  ('HCD-07', 'Rural vs. Urban Experience Disparity',
    'Ensuring users in underserved rural areas receive a graceful, honest experience rather than hard error blocks when availability is limited.',
    'medium', 3, 7,
    'Replit geo-fencing: "limited availability" UX rather than hard blocks. Rural participants included in Sprint 4 usability cohort.'),
  ('HCD-08', 'Notification Fatigue',
    'Designing smart, preference-driven alert systems that avoid overwhelming users across three active commerce verticals.',
    'medium', 4, 8,
    'Notification preference centre in Lovable with granular per-vertical controls. AI relevance-scoring logic to suppress low-value alerts.'),
  ('HCD-09', 'Cross-Vertical Cart Conflicts',
    'Managing mixed fulfilment timelines clearly at checkout — a user may have a 2-hour food delivery alongside a 3-day parcel in one cart.',
    'high', 4, 9,
    'Prototype cross-vertical cart in Sprint 2 with 5+ participants. Per-item delivery time shown clearly. Tooltip added if tests reveal confusion.'),
  ('HCD-10', 'Delivery Driver Experience',
    'Driver UX quality directly impacts customer satisfaction — poor routing, unclear job queues, and earnings opacity create churn.',
    'high', 3, 10,
    'Dedicated driver app: large tap targets, voice prompts, real-time AI routing. ≤3 screen interactions during active delivery as DoD criterion.'),
  ('HCD-11', 'Support at Scale',
    'Delivering consistent, high-quality customer support across three distinct dispute types: product returns, meal kit issues, and cold food.',
    'medium', 4, 11,
    'AI chatbot first-line triage. n8n automated ticket routing per vertical. Distinct agent dashboard views per dispute type.');

-- ============================================================
-- SPRINTS
-- ============================================================
INSERT INTO sprints (number, name, theme, agile_value, weeks_start, weeks_end, status, tech_stack) VALUES
  (1, 'Sprint 1', 'Discovery & Project Foundation',
    'Customer collaboration over contract negotiation',
    1, 2, 'active',
    ARRAY['figma','jira','n8n']::platform_tag[]),
  (2, 'Sprint 2', 'UX Design & AI Architecture',
    'Working software over comprehensive documentation',
    3, 4, 'planned',
    ARRAY['figma','lovable','replit','n8n']::platform_tag[]),
  (3, 'Sprint 3', 'Core Platform & App Build',
    'Individuals and interactions over processes and tools',
    5, 6, 'planned',
    ARRAY['lovable','replit','n8n']::platform_tag[]),
  (4, 'Sprint 4', 'Testing, Validation & Handoff',
    'Responding to change over following a plan',
    7, 8, 'planned',
    ARRAY['lovable','replit','n8n','mixpanel','amplitude']::platform_tag[]);

-- ============================================================
-- EPICS
-- ============================================================
INSERT INTO epics (epic_id, name, description, sprint_ids, platforms, strategic_focus) VALUES
  ('EP-01', 'Discovery & Project Foundation',
    'Establish the human-centered foundation of the entire project. Conduct empathy research across all user groups, prioritise HCD challenges, and stand up the cross-functional Agile team.',
    ARRAY[1], ARRAY['figma','jira','n8n']::platform_tag[],
    'HCD research, empathy mapping, team setup & governance'),
  ('EP-02', 'UX Design & AI Architecture',
    'Design a cohesive unified interface merging three commerce paradigms, and produce a complete AI system architecture blueprint.',
    ARRAY[2], ARRAY['figma','lovable','replit','n8n']::platform_tag[],
    'Unified IA, prototyping, a11y, AI system blueprints'),
  ('EP-03', 'Seller, Support & Compliance',
    'Design and build the seller onboarding portal with AI-assisted listing tools, automated pre-publish compliance checking, and distinct vertical-specific support flows.',
    ARRAY[2,3], ARRAY['lovable','replit','n8n']::platform_tag[],
    'Seller portal, compliance automation, returns & refund flows'),
  ('EP-04', 'Core Platform & App Build',
    'Build the entire platform: scalable Replit backend microservices, the unified Lovable customer app, the delivery driver app, nutritionist portal, and brand foundation.',
    ARRAY[3], ARRAY['lovable','replit','n8n']::platform_tag[],
    'Backend, customer app, driver app, nutrition portal, branding'),
  ('EP-05', 'Testing, AI Validation & Compliance',
    'Conduct structured usability testing, full QA, accessibility audits, AI model validation, and a complete legal compliance audit across all platforms.',
    ARRAY[4], ARRAY['lovable','replit','n8n','mixpanel','amplitude']::platform_tag[],
    'QA, a11y audit, AI tuning, legal compliance audit'),
  ('EP-06', 'Stakeholder Handoff & Closure',
    'Conduct the final Sprint Review and Retrospective, demonstrate the validated prototype, and produce a comprehensive handoff document.',
    ARRAY[4], ARRAY['lovable','replit','n8n','jira','linear']::platform_tag[],
    'Sprint Review, Retrospective, handoff documentation');

-- ============================================================
-- USER STORIES (Sprint 1)
-- ============================================================
WITH ep01 AS (SELECT id FROM epics WHERE epic_id = 'EP-01')
INSERT INTO user_stories (story_id, epic_id, sprint_number, title, description, acceptance_criteria, test_plan, definition_of_done, platforms, status, priority, assigned_squad, story_points)
SELECT
  'US-01',
  ep01.id,
  1,
  'HCD Kickoff & Empathy Mapping',
  'As a project team, we need to conduct empathy mapping and user journey workshops for all 11 user groups so that we have a validated, human-centered foundation before any design or development work begins.',
  ARRAY[
    'Empathy maps completed for all 11 user groups with at least 3 validated pain points each',
    'User journey maps produced for Customers, Sellers, and Delivery Drivers',
    'HCD challenge registry prioritised by severity and frequency (all 11 documented)',
    'Rural vs. urban disparity risks documented with proposed mitigation strategy',
    'Brand direction and working name (UniMart) agreed upon by Senior Partners'
  ],
  ARRAY[
    'Review empathy maps with at least 2 representatives per major user group for accuracy',
    'Stakeholder sign-off session: all Senior Partners confirm HCD challenge priorities',
    'Cross-reference AI persona output against workshop findings for consistency'
  ],
  ARRAY[
    'All empathy maps and journey maps documented and stored in the project wiki',
    'HCD challenge registry approved and baselined by Stakeholders',
    'Brand direction formally approved in Sprint 1 Review',
    'Kanban ticket moved to "Done" with Project Manager sign-off'
  ],
  ARRAY['figma','jira','n8n']::platform_tag[],
  'in_progress', 'high', 'ux_research', 13
FROM ep01;

WITH ep01 AS (SELECT id FROM epics WHERE epic_id = 'EP-01')
INSERT INTO user_stories (story_id, epic_id, sprint_number, title, description, acceptance_criteria, test_plan, definition_of_done, platforms, status, priority, assigned_squad, story_points)
SELECT
  'US-02',
  ep01.id,
  1,
  'Agile Team Formation & Project Infrastructure',
  'As a project manager, I need to form the cross-functional team, establish Scrum/Kanban tooling, and define team agreements so that the project operates efficiently and transparently from Sprint 1 onward.',
  ARRAY[
    'Five squads formed: UX Research, Core Dev, AI Integration, Growth/Marketing, Legal/Compliance',
    'Kanban/Scrum board live in Jira or Linear with swimlanes per squad',
    'Definition of Done, Working Agreements, and sprint ceremony schedule documented and shared',
    'Legal/Compliance team has begun regulatory and food-safety research',
    'Sprint 1 Planning session completed with backlog populated',
    'All engineers onboarded to shared Replit workspace'
  ],
  ARRAY[
    'All squad members access and update the Kanban board without assistance',
    'Sprint ceremonies scheduled and accepted on all team calendars',
    'Working Agreements reviewed and signed off by all squad leads',
    'All engineers successfully run a test script in Replit'
  ],
  ARRAY[
    'All squads staffed and onboarded to all project tools (Jira, Replit, Lovable, n8n)',
    'Kanban board live and actively in use by all team members',
    'DoD, Working Agreements, and sprint schedule baselined and stored in project wiki',
    'Sprint 1 Retrospective completed; action items logged'
  ],
  ARRAY['jira','linear','replit','n8n']::platform_tag[],
  'in_progress', 'high', 'core_dev', 8
FROM ep01;

-- ============================================================
-- KANBAN TICKETS — Sprint 1 breakdown
-- ============================================================
WITH us01 AS (SELECT id FROM user_stories WHERE story_id = 'US-01'),
     us02 AS (SELECT id FROM user_stories WHERE story_id = 'US-02')
INSERT INTO kanban_tickets (story_id, title, description, status, priority, squad, sprint_number, story_points, labels)
SELECT id, 'Schedule empathy mapping workshops for all 11 user groups', 'Book sessions with representatives from each of the 11 user groups. Prepare Figma templates in advance.', 'in_progress', 'high', 'ux_research', 1, 3, ARRAY['us-01','hcd','workshop'] FROM us01
UNION ALL
SELECT id, 'Create Figma empathy map templates', 'Build reusable Figma empathy map template covering Says / Thinks / Does / Feels quadrants.', 'done', 'medium', 'ux_research', 1, 2, ARRAY['us-01','figma','hcd'] FROM us01
UNION ALL
SELECT id, 'Conduct empathy workshops — Customers & Sellers', 'Run moderated empathy mapping sessions for the two highest-priority user groups first.', 'in_progress', 'high', 'ux_research', 1, 3, ARRAY['us-01','workshop','customers','sellers'] FROM us01
UNION ALL
SELECT id, 'Conduct empathy workshops — Drivers, Support, Nutritionists', 'Second wave of workshops covering operational user groups.', 'todo', 'high', 'ux_research', 1, 3, ARRAY['us-01','workshop'] FROM us01
UNION ALL
SELECT id, 'Produce user journey maps — Customers, Sellers, Drivers', 'Document end-to-end journey maps for the three primary transactional user groups.', 'todo', 'high', 'ux_research', 1, 3, ARRAY['us-01','journey-map'] FROM us01
UNION ALL
SELECT id, 'Prioritise HCD challenge registry by severity + frequency', 'Rank all 11 HCD challenges. Use frequency and severity scores. Present at Sprint 1 Review.', 'in_progress', 'high', 'ux_research', 1, 2, ARRAY['us-01','hcd-registry'] FROM us01
UNION ALL
SELECT id, 'Document rural vs. urban disparity risks with mitigation', 'Map availability gaps and propose geo-fencing and UX degradation strategies.', 'todo', 'medium', 'ux_research', 1, 2, ARRAY['us-01','rural-urban','risk'] FROM us01
UNION ALL
SELECT id, 'Brand direction workshop — agree UniMart name & direction', 'Facilitate brand alignment session with Senior Partners. Document logo direction, colour palette seed, tone of voice.', 'todo', 'high', 'growth_marketing', 1, 2, ARRAY['us-01','branding'] FROM us01
UNION ALL
SELECT id, 'n8n: set up workshop findings aggregation workflow', 'Build n8n automation to pull workshop notes from shared docs and populate the project wiki.', 'todo', 'medium', 'ai_integration', 1, 2, ARRAY['us-01','n8n','automation'] FROM us01
UNION ALL
-- US-02 tickets
SELECT id, 'Form five squads and assign squad leads', 'Identify leads for UX Research, Core Dev, AI Integration, Growth/Marketing, Legal/Compliance squads.', 'done', 'critical', 'core_dev', 1, 2, ARRAY['us-02','team-formation'] FROM us02
UNION ALL
SELECT id, 'Set up Jira/Linear Kanban board with squad swimlanes', 'Configure the project management board with columns: Backlog / To Do / In Progress / Review / Done. Add swimlanes per squad.', 'done', 'high', 'core_dev', 1, 2, ARRAY['us-02','jira','kanban'] FROM us02
UNION ALL
SELECT id, 'Document Definition of Done and Working Agreements', 'Write and get sign-off on the DoD, team working agreements, and sprint ceremony schedule.', 'in_progress', 'high', 'core_dev', 1, 2, ARRAY['us-02','governance'] FROM us02
UNION ALL
SELECT id, 'Onboard all engineers to Replit shared workspace', 'Create shared Replit team workspace. Verify all engineers can run the hello-world test script.', 'in_progress', 'high', 'core_dev', 1, 2, ARRAY['us-02','replit','onboarding'] FROM us02
UNION ALL
SELECT id, 'Legal/Compliance: begin food-safety regulatory research', 'Start mapping relevant UK/AU/US food safety laws, allergen labeling requirements, and marketplace seller regulations.', 'in_progress', 'medium', 'legal_compliance', 1, 3, ARRAY['us-02','legal','compliance'] FROM us02
UNION ALL
SELECT id, 'Schedule all Sprint 1 ceremonies and send calendar invites', 'Book Planning, Daily Stand-ups, Sprint Review, and Retrospective. Send invites with agenda templates.', 'done', 'medium', 'core_dev', 1, 1, ARRAY['us-02','agile','ceremonies'] FROM us02
UNION ALL
SELECT id, 'n8n: set up sprint velocity reporting automation', 'Configure n8n workflow to pull Jira/Linear ticket data daily and output velocity metrics to shared dashboard.', 'todo', 'medium', 'ai_integration', 1, 3, ARRAY['us-02','n8n','velocity','automation'] FROM us02;

-- ============================================================
-- RISKS (all 22)
-- ============================================================
INSERT INTO risks (risk_id, category, title, description, likelihood, impact, overall_rating, owner, mitigation, sprint_identified) VALUES
  ('R-01','HCD','Insufficient usability test participation',
    'Fewer than 5 participants per persona leads to unvalidated design decisions.',
    'M','H','high','UI/UX Designer',
    'Recruit participants in Sprint 1 before testing begins. Use screener surveys. Offer incentives. Extend window by 3 days if numbers fall short before escalating.',1),
  ('R-02','HCD','Onboarding flow fails to communicate three-in-one value in 30 seconds',
    'Users disengage before understanding the platform''s core value proposition.',
    'H','H','high','UI/UX Designer · PM',
    'A/B test two onboarding flows in Sprint 3. Define comprehension ≥80% as a Sprint 4 gate. Iterate copy and visuals based on test feedback.',1),
  ('R-03','HCD','Cross-vertical cart UX confuses users',
    'Mixed fulfilment timelines at checkout are unclear to users combining verticals.',
    'M','H','high','UI/UX Designer · Engineer',
    'Prototype and test cart flow in Sprint 2 with 5+ participants. Define clarity as a DoD criterion. Add inline tooltip if test reveals confusion.',1),
  ('R-04','HCD','a11y gaps discovered late — WCAG 2.1 AA violations in Sprint 4',
    'Accessibility violations discovered in Sprint 4 require significant rework.',
    'M','H','high','UI/UX Designer · Lovable dev',
    'Use Lovable a11y library from Sprint 2. Run Axe/Lighthouse checks at end of every sprint. Never defer a11y to Sprint 4.',1),
  ('R-05','HCD','Rural users have degraded experience due to geo-fencing gaps',
    'Rural users encounter hard error blocks rather than graceful availability messaging.',
    'L','M','medium','Software Engineer',
    'Test geo-fencing in Replit staging with simulated rural coordinates in Sprint 3. Include rural participants in Sprint 4 usability cohort.',1),
  ('R-06','Tech Stack','Lovable component generation does not meet WCAG 2.1 AA out of the box',
    'Auto-generated components fail accessibility checks, requiring manual remediation.',
    'M','M','medium','UI/UX Designer',
    'Audit Lovable component library in Sprint 2 before full build begins. Customise components as needed. a11y is a non-negotiable acceptance criterion on every story.',1),
  ('R-07','Tech Stack','Replit microservices fail load test under 500 concurrent users',
    'Performance degradation under load discovered late in the sprint cycle.',
    'M','H','high','Software Engineer',
    'Conduct load testing in Sprint 3, not Sprint 4. Identify bottlenecks early. Scale Replit horizontally if needed. Performance thresholds defined in US-07 DoD.',1),
  ('R-08','Tech Stack','Third-party API instability — Stripe, Google Maps, or Twilio outages',
    'External API failures disrupt testing and potentially production.',
    'L','H','medium','Software Engineer',
    'Implement mock/stub versions of all third-party APIs for development. Only use live APIs for final integration tests. Monitor API status pages throughout Sprint 3.',1),
  ('R-09','Tech Stack','n8n automation workflows trigger incorrectly — false positives',
    'False positive compliance flags or fraud alerts create friction for legitimate sellers and customers.',
    'M','H','high','Data Analyst · n8n lead',
    'Set conservative thresholds in Sprint 2. Test n8n workflows against 50+ sample cases in Sprint 3 staging. Define false positive rate ≤10% as DoD in US-05 and US-13.',1),
  ('R-10','Tech Stack','Replit AI models underperform on real data',
    'Resolution rates fall below the 80% threshold defined in acceptance criteria.',
    'M','H','high','Data Analyst',
    'Begin model design in Sprint 2 with realistic data assumptions. Build A/B test framework in Sprint 3. Reserve Sprint 4 for tuning. Define minimum thresholds in US-13 DoD.',1),
  ('R-11','AI','Conversational AI misroutes queries across verticals',
    'Intent misclassification routes customer queries to the wrong vertical, eroding trust.',
    'H','H','high','Engineer · Data Analyst',
    'Design intent classification layer in Sprint 2. Test against 20 varied queries in Sprint 3. Define ≥80% resolution accuracy as DoD in US-04. Build explicit fallback response.',1),
  ('R-12','AI','Dynamic pricing creates customer trust issues',
    'Price fluctuations are perceived as unfair or opaque by customers.',
    'M','H','high','PM · Senior Partners',
    'Design pricing transparency UI in Sprint 2. Test price sensitivity with beta users. Cap maximum price variance at a defined % agreed by Senior Partners.',1),
  ('R-13','AI','Churn prediction model produces low accuracy on limited 8-week data',
    'Insufficient historical data reduces churn model predictive value.',
    'H','M','medium','Data Analyst',
    'Back-test model against analogous historical datasets in Sprint 3. Set conservative signal thresholds. n8n win-back campaigns go to manual review before activation until validated.',1),
  ('R-14','AI','Computer vision food photo checker produces excessive false positives',
    'Legitimate seller photos flagged incorrectly, causing seller friction.',
    'M','M','medium','Data Analyst · Replit dev',
    'Test model on 100+ real seller images before deployment. Allow seller appeal workflow for flagged photos. Set false positive rate ≤10% as DoD.',1),
  ('R-15','Compliance','Food-safety or allergen labeling non-compliance discovered in Sprint 4',
    'Late discovery of compliance gaps risks launch delay or legal liability.',
    'M','H','high','Legal/Compliance',
    'Engage Legal/Compliance in Sprint 1. n8n compliance checker designed in Sprint 2 with Legal input. Run pre-audit in Sprint 3. Zero-tolerance: no non-compliant listings go live.',1),
  ('R-16','Compliance','Fake review or seller fraud activity in beta erodes trust',
    'Early fraud incidents before trust systems are live could permanently damage brand perception.',
    'M','H','high','Legal · n8n lead',
    'Deploy n8n fake review and fraud detection before any public-facing beta. Manual review queue for all flagged activity. Community standards published before any seller listings go live.',1),
  ('R-17','Compliance','Data privacy compliance gap — user data handling does not meet applicable regulations',
    'Privacy violations expose the platform to regulatory action and user distrust.',
    'L','H','medium','Legal/Compliance',
    'Legal reviews data architecture in Sprint 2. Privacy policy drafted and reviewed before Sprint 3 build. Data minimisation principle applied to all Replit data models.',1),
  ('R-18','Project','8-week timeline insufficient — scope creep or technical debt accumulates',
    'Scope additions or unresolved debt prevent delivery of the validated prototype.',
    'H','H','high','Project Manager',
    'Treat 8-week roadmap as a validated prototype deliverable, not a production launch. Strict sprint backlog. Any additions must displace existing backlog items. Retro action items actioned within 24 hours.',1),
  ('R-19','Project','Squad dependencies cause blocked tickets',
    'Lovable frontend blocked waiting on Replit APIs that are not yet live.',
    'M','H','high','PM · Tech leads',
    'Define API contracts between Lovable and Replit in Sprint 2 before Sprint 3 build. Use mock endpoints until Replit APIs are live. Flag blockers in daily stand-up; unblock within 24 hours or escalate.',1),
  ('R-20','Project','Key team member unavailability during a critical sprint',
    'Single points of knowledge failure delay delivery.',
    'M','M','medium','Project Manager',
    'All work documented in project wiki continuously. No single point of knowledge failure. Cross-train at least one backup per squad.',1),
  ('R-21','Project','Stakeholder feedback in Sprint Reviews requests significant changes',
    'Unstable backlog caused by late-stage scope requests from stakeholders.',
    'M','M','medium','PM · Senior Partners',
    'Set expectations in Sprint 1: Sprint Reviews are demo and feedback sessions, not change approval gates. New requests enter the backlog for the next phase. PM has authority to defer non-critical feedback.',1),
  ('R-22','Project','Kanban board not actively maintained — tickets go stale',
    'Stale tickets make velocity data unreliable and planning inaccurate.',
    'M','M','medium','Project Manager',
    'n8n automated reporting highlights stale tickets daily. PM reviews board before each stand-up. DoD includes Kanban ticket update as a mandatory step. Board hygiene reviewed in every Retrospective.',1);

-- ============================================================
-- SPRINT 1 CEREMONIES
-- ============================================================
INSERT INTO sprint_ceremonies (sprint_number, ceremony_type, scheduled_at, notes) VALUES
  (1, 'planning',  NOW() + INTERVAL '0 days',  'Sprint 1 Planning — populate backlog, assign stories to squads, agree sprint goal'),
  (1, 'standup',   NOW() + INTERVAL '1 day',   'Daily Stand-up: What did I do? What will I do? Any blockers?'),
  (1, 'standup',   NOW() + INTERVAL '2 days',  'Daily Stand-up'),
  (1, 'standup',   NOW() + INTERVAL '3 days',  'Daily Stand-up'),
  (1, 'standup',   NOW() + INTERVAL '4 days',  'Daily Stand-up'),
  (1, 'standup',   NOW() + INTERVAL '7 days',  'Daily Stand-up'),
  (1, 'standup',   NOW() + INTERVAL '8 days',  'Daily Stand-up'),
  (1, 'standup',   NOW() + INTERVAL '9 days',  'Daily Stand-up'),
  (1, 'standup',   NOW() + INTERVAL '10 days', 'Daily Stand-up'),
  (1, 'review',    NOW() + INTERVAL '13 days', 'Sprint 1 Review — demo empathy maps, HCD registry, Kanban board to stakeholders'),
  (1, 'retro',     NOW() + INTERVAL '13 days', 'Sprint 1 Retrospective — what went well, what to improve, action items');

-- ============================================================
-- RURAL / URBAN NOTES
-- ============================================================
INSERT INTO rural_urban_notes (region_type, challenge, proposed_mitigation, severity) VALUES
  ('rural', 'No meal kit delivery coverage — third-party logistics do not reach postcode', 'Show "notify me when available" CTA instead of checkout button. Capture email for future coverage expansion.', 'high'),
  ('rural', 'Limited food delivery partners — fewer restaurant options', 'Display reduced but honest selection. Surface grocery and pantry verticals as alternatives.', 'medium'),
  ('rural', 'Slower broadband impacts app performance and image loading', 'Implement lazy loading, compressed images, and offline-first PWA capability for low-bandwidth users.', 'medium'),
  ('rural', 'Driver availability for last-mile delivery is sparse', 'Introduce extended delivery windows with discount incentive for rural users. Partner with local couriers.', 'high'),
  ('urban', 'Notification overload from dense product and restaurant density', 'AI relevance scoring to suppress low-value push notifications. Granular category-level controls in preference centre.', 'medium'),
  ('urban', 'High competition from established apps (Amazon, Deliveroo, HelloFresh)', 'Differentiate on three-in-one convenience and AI meal planning. Price-match guarantee on top SKUs.', 'high');

-- ============================================================
-- PROJECT DOCUMENTS (Working Agreements seed)
-- ============================================================
INSERT INTO project_documents (slug, title, content, category, version) VALUES
  ('definition-of-done', 'Definition of Done — UniMart Sprint 1', 
   E'## UniMart — Definition of Done\n\nA ticket is considered Done when ALL of the following are true:\n\n1. Acceptance criteria fully met and verified\n2. Code reviewed by at least one other squad member (for dev tickets)\n3. Tested against the defined test plan\n4. No critical bugs outstanding\n5. a11y check passed (zero WCAG 2.1 AA critical violations where applicable)\n6. Project Manager sign-off recorded\n7. Kanban ticket moved to "Done" column\n8. Relevant documentation updated in project wiki\n9. Retro action items from previous sprint addressed if applicable',
   'dod', 1),
  ('working-agreements', 'Team Working Agreements — UniMart', 
   E'## UniMart — Team Working Agreements\n\n### Communication\n- Daily stand-ups at 9:30am. Max 15 minutes. Three questions only.\n- All async communication in project Slack. No decisions made in email.\n- Blockers flagged immediately in stand-up. Unblocked within 24 hours or escalated to PM.\n\n### Kanban Hygiene\n- Every team member updates their ticket status before stand-up each day.\n- WIP limit: max 2 tickets In Progress per person at any time.\n- Stale tickets (no update in 48h) are flagged by n8n automation.\n\n### Quality\n- No ticket moves to Review without meeting its acceptance criteria.\n- a11y is a non-negotiable criterion on every Lovable-built screen.\n- Definition of Done applies to every ticket without exception.\n\n### Retrospectives\n- Retro action items are assigned to named owners.\n- All action items actioned within 24 hours of the Retrospective.\n- No blame culture. Focus on systems, not individuals.\n\n### Scope\n- Any new work requests enter the backlog for the next phase.\n- Sprint scope is locked at Sprint Planning. PM has authority to defer non-critical additions.',
   'working_agreement', 1);
