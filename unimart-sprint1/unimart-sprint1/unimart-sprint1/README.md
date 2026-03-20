# UniMart Sprint 1 — Code Deliverables
**EP-01: Discovery & Project Foundation**  
**US-01: HCD Kickoff & Empathy Mapping · US-02: Agile Team Formation & Project Infrastructure**

---

## What's in this package

```
unimart-sprint1/
├── supabase/
│   └── 01_schema.sql          # Full database schema — all Sprint 1 tables
├── seed-data/
│   └── 02_seed.sql            # All seed data — user groups, HCD challenges, risks, kanban tickets
├── lovable/
│   ├── UniMartDashboard.jsx   # Sprint 1 Project Hub — Kanban, HCD, squads, risk register
│   └── EmpathyMapBuilder.jsx  # US-01 Empathy Mapping tool for UX Research squad
├── replit/
│   ├── server.js              # Express REST API — serves data to Lovable frontend
│   ├── package.json           # Node.js dependencies
│   └── .env.example           # Environment variables template
└── n8n/
    └── sprint1-workflows.json # 4 automation workflows (import directly into n8n)
```

---

## Setup Order

### 1. Supabase

1. Go to [supabase.com](https://supabase.com) → New Project
2. Open SQL Editor
3. Run `supabase/01_schema.sql` — creates all tables, enums, RLS policies, indexes
4. Run `seed-data/02_seed.sql` — populates all 11 user groups, 11 HCD challenges, 22 risks, Sprint 1 kanban tickets, ceremonies, and wiki entries
5. Copy your **Project URL** and **anon key** from Settings > API

### 2. Replit (Backend)

1. Create a new Replit → Node.js
2. Upload `replit/server.js` and `replit/package.json`
3. Add Secrets (Replit's env management):
   - `SUPABASE_URL` → your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` → your service role key (Settings > API)
   - `LOVABLE_APP_URL` → your Lovable app URL (set after Lovable deploy)
4. Run `npm install` then `npm start`
5. Note your Replit app URL (e.g. `https://unimart-sprint1.username.repl.co`)

**Key API Endpoints:**
| Endpoint | Purpose |
|---|---|
| `GET /health` | Health check |
| `GET /api/sprint/1/overview` | Sprint 1 dashboard summary |
| `GET /api/kanban/sprint/1` | All Sprint 1 kanban tickets |
| `PATCH /api/kanban/:id/status` | Move ticket between columns |
| `GET /api/empathy-maps/validation/status` | US-01 AC completion check |
| `PUT /api/empathy-maps/:userGroup` | Save empathy map |
| `GET /api/hcd/challenges` | All 11 HCD challenges |
| `GET /api/risks` | All 22 risks |
| `GET /api/team/onboarding/status` | US-02 onboarding check |

### 3. Lovable (Frontend)

1. Create a new Lovable project
2. Add Supabase integration: Settings > Integrations > Supabase
   - Enter your Supabase URL and anon key
3. Add the components:
   - `UniMartDashboard.jsx` → main Sprint 1 hub (set as home page)
   - `EmpathyMapBuilder.jsx` → empathy mapping tool (route: `/empathy-maps`)
4. Set env vars in Lovable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy and copy the Lovable app URL → add to Replit Secrets as `LOVABLE_APP_URL`

### 4. n8n (Automations)

1. Open your n8n instance
2. Go to Settings > Import Workflow
3. Import `n8n/sprint1-workflows.json`
4. Set up credentials:
   - **Supabase Postgres**: use your Supabase direct connection string (Settings > Database)
   - **Slack OAuth2**: create a Slack app with `chat:write` scope; create channels: `#unimart-sprint1`, `#unimart-hcd`, `#unimart-pm`
5. Activate all 4 workflows

**n8n Webhook Endpoints (after activation):**
| Webhook | Payload | Purpose |
|---|---|---|
| `POST /webhook/workshop-findings` | `{user_group, pain_points[], facilitator}` | Aggregate HCD workshop findings into Supabase |
| `POST /webhook/team-onboarding` | `{email, tool}` | Update team member onboarding flags |

---

## Acceptance Criteria Coverage

### US-01: HCD Kickoff & Empathy Mapping

| Criterion | How it's met |
|---|---|
| Empathy maps for all 11 user groups with 3+ pain points | `EmpathyMapBuilder.jsx` + `PUT /api/empathy-maps/:userGroup` (validates 3 minimum) |
| User journey maps for Customers, Sellers, Drivers | `journey_maps` table in schema; Figma links stored per map |
| HCD challenge registry prioritised by severity | `hcd_challenges` table seeded with all 11; priority_rank column; filter UI in dashboard |
| Rural vs. urban disparity risks documented | `rural_urban_risks` table seeded with 4 risk areas and mitigations |
| Brand direction agreed by Senior Partners | `brand_decisions` table seeded with UniMart name + positioning |

### US-02: Agile Team Formation & Project Infrastructure

| Criterion | How it's met |
|---|---|
| 5 squads formed | `squads` table seeded with all 5 squads |
| Kanban board live with swimlanes | `kanban_tickets` table + `UniMartDashboard.jsx` Kanban tab |
| DoD, Working Agreements, sprint schedule documented | `project_wiki` table seeded with both documents |
| Sprint 1 Planning completed, backlog populated | `sprint_ceremonies` seeded + 2 tickets in `kanban_tickets` |
| All engineers onboarded to Replit | `team_members.onboarded_to_replit` flag + `PATCH /api/team/onboarding` endpoint |
| n8n sprint velocity reporting | `sprint1-workflows.json` — Daily Velocity & Stale Ticket workflow |

---

## Definition of Done Checklist

- [ ] Supabase schema deployed and seed data verified
- [ ] Replit API running and `/health` returns 200
- [ ] Lovable dashboard loading data from Supabase
- [ ] `GET /api/empathy-maps/validation/status` shows progress toward 11/11 groups
- [ ] `GET /api/team/onboarding/status` shows onboarding progress
- [ ] n8n workflows active and posting to Slack channels
- [ ] Sprint 1 Review: all stakeholders can access the Lovable dashboard
- [ ] PM sign-off recorded on both US-01 and US-02 tickets

---

## Tech Stack Summary

| Platform | Role in Sprint 1 |
|---|---|
| **Supabase** | Database: empathy maps, HCD challenges, kanban, risks, team, wiki |
| **Replit** | REST API: serves and validates all Sprint 1 data |
| **Lovable** | Sprint 1 dashboard + Empathy Map Builder UI |
| **n8n** | Daily velocity report, stale ticket alerts, workshop findings aggregation, DoD audit |

---

*UniMart · Sprint 1 · v7.0 · March 2026*
