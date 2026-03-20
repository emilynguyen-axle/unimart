# UniMart — Sprint 1 Code Package

**Version 6.0 · March 2026**  
**US-01: HCD Kickoff & Empathy Mapping | US-02: Agile Team Formation & Infrastructure**

---

## Package Contents

```
unimart-sprint1/
├── supabase/
│   ├── migrations/
│   │   └── 001_sprint1_schema.sql      ← Full DB schema + RLS + views
│   └── seed/
│       └── 001_sprint1_seed.sql        ← All 11 user groups, HCD challenges,
│                                          22 risks, 4 sprints, 6 epics,
│                                          US-01 & US-02 + Kanban tickets
├── replit/
│   ├── index.js                        ← Express API (all Sprint 1 endpoints)
│   ├── package.json
│   └── .env.example                    ← Copy to .env before running
├── n8n/
│   ├── 01_sprint_velocity_reporter.json      ← Daily velocity + stale ticket alerts
│   └── 02_workshop_findings_aggregator.json  ← Empathy map webhook → Supabase
└── lovable/
    ├── package.json
    └── src/
        ├── App.tsx                     ← Router + QueryClient
        ├── lib/api.ts                  ← All API calls to Replit backend
        ├── components/Navigation.tsx   ← Sidebar nav
        └── pages/
            ├── SprintDashboard.tsx     ← Sprint 1 overview + progress + DoD tracker
            ├── KanbanBoard.tsx         ← Full Kanban board with column moves
            ├── EmpathyMapWorkshop.tsx  ← US-01: 11 user groups × 4 quadrants
            └── AdditionalPages.tsx     ← HCDRegistry, RiskRegister,
                                           TeamOnboarding, ProjectWiki
```

---

## 1. Supabase Setup

### Step 1: Create project
Go to [supabase.com](https://supabase.com) → New Project → note your `Project URL` and `Service Role Key`.

### Step 2: Run migrations
In the Supabase SQL Editor, run in order:
```sql
-- Paste full contents of:
supabase/migrations/001_sprint1_schema.sql
```

### Step 3: Run seed data
```sql
-- Paste full contents of:
supabase/seed/001_sprint1_seed.sql
```

This seeds:
- ✅ 5 squads
- ✅ 11 user groups (with emoji icons)
- ✅ 11 HCD challenges (prioritised, with mitigations)
- ✅ 22 risks (all categories, likelihood/impact/rating)
- ✅ 4 sprints + 6 epics + US-01 & US-02
- ✅ 16 Kanban tickets for Sprint 1
- ✅ Sprint 1 ceremony schedule (11 ceremonies)
- ✅ Working Agreements + Definition of Done documents
- ✅ Rural/urban disparity notes

---

## 2. Replit Setup

### Step 1: Create Replit project
New Replit → Node.js → paste all files from `replit/`

### Step 2: Configure environment
Copy `.env.example` to `.env` and fill in:
```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
PORT=3001
LOVABLE_URL=https://your-app.lovable.app
N8N_WEBHOOK_VELOCITY=https://your-n8n-instance/webhook/sprint-velocity
N8N_WEBHOOK_FINDINGS=https://your-n8n-instance/webhook/workshop-findings
```

### Step 3: Install & run
```bash
npm install
npm run dev
```

### Available endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/dashboard/sprint1` | Sprint 1 summary stats |
| GET | `/api/team` | All team members |
| GET | `/api/squads` | All squads with members |
| GET | `/api/kanban` | Kanban board (grouped by status) |
| PATCH | `/api/kanban/tickets/:id/status` | Move ticket |
| GET | `/api/sprints/:n/velocity` | Sprint velocity |
| GET | `/api/hcd/challenges` | HCD challenge registry |
| GET | `/api/empathy-maps` | All empathy maps |
| POST | `/api/empathy-maps` | Create new map |
| POST | `/api/empathy-maps/:id/entries` | Add quadrant entry |
| PATCH | `/api/empathy-maps/:id/validate` | Validate map (DoD gate) |
| GET | `/api/empathy-maps/completion/summary` | Progress across 11 groups |
| GET | `/api/risks` | Full risk register |
| PATCH | `/api/risks/:id/resolve` | Mark risk resolved |
| GET | `/api/docs` | Project wiki documents |

---

## 3. n8n Setup

### Step 1: Import workflows
In your n8n instance → Workflows → Import → paste each JSON file.

### Step 2: Configure credentials
Set environment variables in n8n:
- `REPLIT_API_URL` — your Replit URL (e.g. `https://unimart-sprint1.your-username.repl.co`)
- `SUPABASE_URL` — same as above
- `SUPABASE_ANON_KEY` — from Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase
- `SLACK_WEBHOOK_URL` — Slack incoming webhook for #unimart-sprint
- `SLACK_WEBHOOK_ALERTS_URL` — Slack incoming webhook for #pm-alerts

### Workflow 1: Sprint Velocity Reporter
- **Trigger**: Daily at 8am Mon–Fri
- **Function**: Fetches velocity, stale tickets, and open high risks
- **Output**: Posts daily report to Slack · alerts PM on stale tickets · saves to project wiki

### Workflow 2: Workshop Findings Aggregator
- **Trigger**: `POST /webhook/workshop-findings`
- **Payload**:
```json
{
  "user_group": "Customers",
  "session_date": "2026-03-19",
  "facilitator_id": "uuid-of-facilitator",
  "findings": [
    { "quadrant": "says", "content": "I just want one app for everything", "is_pain_point": false },
    { "quadrant": "feels", "content": "Overwhelmed by switching between apps", "is_pain_point": true },
    { "quadrant": "thinks", "content": "Is this actually cheaper?", "is_pain_point": true },
    { "quadrant": "does", "content": "Opens 3 separate apps for one shopping run", "is_pain_point": true }
  ]
}
```
- **Function**: Validates payload → looks up user group → creates empathy map + all entries → notifies Slack → responds with summary

---

## 4. Lovable Setup

### Step 1: Create new Lovable project
New project → paste all files from `lovable/src/` into the appropriate paths.

### Step 2: Install dependencies
Lovable handles npm automatically. Key dependencies:
- `@tanstack/react-query` — data fetching
- `react-router-dom` — navigation
- `sonner` — toast notifications
- `lucide-react` — icons

### Step 3: Set environment variable
In Lovable project settings → Environment:
```
VITE_API_URL=https://your-replit-url.repl.co
```

### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/sprint/1` | SprintDashboard | Main overview: stats, progress, DoD tracker, ceremonies |
| `/kanban` | KanbanBoard | Full 5-column board with squad filters |
| `/empathy` | EmpathyMapWorkshop | 11 user groups × 4 quadrants + validation |
| `/hcd` | HCDRegistry | Prioritised HCD challenge list |
| `/risks` | RiskRegister | 22 risks with resolve workflow |
| `/team` | TeamOnboarding | 5 squads + member onboarding status |
| `/wiki` | ProjectWiki | DoD, Working Agreements, velocity reports |

---

## Sprint 1 Definition of Done Checklist

### US-01 · HCD Kickoff & Empathy Mapping
- [ ] All 11 empathy maps created in EmpathyMapWorkshop
- [ ] Each map has ≥3 pain points flagged (DoD gate in app)
- [ ] All 11 maps validated by facilitator
- [ ] HCD challenge registry reviewed and priorities confirmed
- [ ] Journey maps for Customers, Sellers, Drivers created in Figma
- [ ] Brand direction approved by Senior Partners
- [ ] PM sign-off in Kanban board

### US-02 · Agile Team Formation
- [ ] All 5 squads staffed with squad leads assigned
- [ ] Kanban board live and all tickets updated
- [ ] DoD and Working Agreements signed off by all squad leads
- [ ] All engineers run test script in Replit
- [ ] Sprint ceremonies scheduled with all invites accepted
- [ ] n8n velocity reporter active and posting to Slack
- [ ] Sprint 1 Retrospective completed with action items assigned

---

*UniMart · v6.0 · March 2026 · Lovable · Replit · Supabase · n8n*
