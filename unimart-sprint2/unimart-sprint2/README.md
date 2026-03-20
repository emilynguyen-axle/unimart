# UniMart Sprint 2 — Code Deliverables
**EP-02 (UX + AI Architecture) & EP-03 (Seller, Support & Compliance) · Weeks 3–4**

---

## What's in This Package

```
unimart-sprint2/
├── lovable/
│   └── pages/
│       ├── SellerOnboarding.jsx        — US-05: 4-step seller onboarding portal
│       ├── SupportDashboard.jsx        — US-06: Support agent dashboard with AI triage
│       └── AIArchitectureDashboard.jsx — US-04: AI blueprint viewer + approval UI
├── supabase/
│   ├── 01_schema.sql                   — 12 new tables (sellers, listings, compliance, support, AI logs, etc.)
│   └── 02_seed.sql                     — US-03–06 stories, Sprint 2 tickets, AI blueprints, SLA standards, test data
├── n8n/
│   ├── compliance_checker.json         — US-05: Pre-publish AI compliance checker
│   └── support_ticket_router.json      — US-06: Auto-route tickets by vertical + SLA
├── replit/
│   ├── server.js                       — Full AI + Seller + Support API (20+ endpoints)
│   └── package.json
└── README.md
```

---

## 1 · Supabase Setup

Run in order in your Supabase SQL Editor:

1. `01_schema.sql` — 12 new tables with RLS
2. `02_seed.sql` — all Sprint 2 stories, 32 Kanban tickets, 6 AI blueprints, 9 SLA standards, test sellers and support tickets

**New tables:**
| Table | Purpose |
|---|---|
| `ux_prototypes` | Figma prototype tracking (US-03) |
| `usability_tests` | Usability test session results |
| `ai_blueprints` | AI architecture blueprints (US-04) |
| `sellers` | Seller accounts and status |
| `listings` | Product listings with compliance status |
| `compliance_checks` | Pre-publish compliance check results |
| `support_tickets` | Customer support tickets (US-06) |
| `refund_requests` | Refund requests linked to tickets |
| `fraud_flags` | Fraud detection flags |
| `review_flags` | Fake review detection flags |
| `sla_standards` | SLA rules per vertical and issue type |
| `ai_performance_logs` | AI model performance tracking |

---

## 2 · Lovable Setup

Add three new pages to your Lovable project:

| File | Route | Purpose |
|---|---|---|
| `SellerOnboarding.jsx` | `/seller/onboarding` | US-05: 4-step seller onboarding with document upload |
| `SupportDashboard.jsx` | `/support/dashboard` | US-06: Support agent dashboard with vertical-specific resolution flows and AI suggested responses |
| `AIArchitectureDashboard.jsx` | `/sprint2/ai-architecture` | US-04: Blueprint cards for all 6 AI features with approval workflow |

All three use `import { supabase } from "@/integrations/supabase/client"` — no credential changes needed since you're using Lovable's built-in Supabase.

---

## 3 · Replit Setup

1. Create a new Node.js Replit (or update your Sprint 1 one)
2. Upload `server.js` and `package.json`
3. Add to Secrets:
   ```
   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
   PORT=3000
   OSRM_BASE_URL=https://router.project-osrm.org
   ALLOWED_ORIGIN=https://your-lovable-app.lovable.app
   ```
4. Run `npm install` then **Run**

**Key Sprint 2 API Endpoints:**

| Method | Endpoint | Feature |
|---|---|---|
| POST | `/api/chat/message` | Conversational AI (intent classification) |
| POST | `/api/chat/feedback` | Log resolution feedback |
| GET | `/api/recommendations/:user_id` | Recommendations engine |
| POST | `/api/meal-planner/generate` | Generate multi-week meal plan |
| POST | `/api/meal-planner/populate-cart` | Auto-populate cart from plan |
| POST | `/api/routing/optimise` | Route optimisation via OSRM |
| GET | `/api/routing/eta/:job_id` | Get delivery ETA |
| POST | `/api/fraud/check-order` | Fraud risk scoring |
| GET | `/api/fraud/flags` | Active fraud flags |
| POST | `/api/listings/generate-description` | AI listing generator |
| GET | `/api/sellers` | All sellers |
| POST | `/api/sellers/:id/approve` | Approve a seller |
| GET | `/api/support/tickets` | Support tickets |
| PATCH | `/api/support/tickets/:id/status` | Update ticket status |
| GET | `/api/support/sla-standards` | SLA rules |
| GET | `/api/sprint/2/dod-status` | Sprint 2 DoD check |

**Test the conversational AI:**
```powershell
Invoke-WebRequest -Uri "https://YOUR_REPLIT_URL/api/chat/message" `
  -Method POST -ContentType "application/json" `
  -Body '{"message": "I want to order some food", "session_id": "test-001"}'
```

**Test route optimisation (London example):**
```powershell
Invoke-WebRequest -Uri "https://YOUR_REPLIT_URL/api/routing/optimise" `
  -Method POST -ContentType "application/json" `
  -Body '{"pickup": {"lat": 51.5074, "lng": -0.1278}, "delivery": {"lat": 51.5155, "lng": -0.0922}}'
```

---

## 4 · n8n Setup

Import both workflows via **Workflows → Add Workflow → Import from file**.

### Workflow 3: AI Compliance Checker (US-05)
**File:** `compliance_checker.json`

1. Import and replace Supabase credentials in HTTP Request nodes
2. Copy the webhook URL → use this when a seller saves a listing in Lovable
3. **Test payload** (included in the JSON `_meta`):
```powershell
Invoke-WebRequest -Uri "YOUR_WEBHOOK_URL" `
  -Method POST -ContentType "application/json" `
  -Body '{"listing": {"title": "Peanut Butter Granola Bar", "description": "A bar.", "price": 4.99, "vertical": "Shop", "allergens": [], "ingredients": ["oats","peanut butter"]}}'
```
Expected: flags `ALLERGEN_UNDECLARED` for peanuts and `DESCRIPTION_TOO_SHORT`

### Workflow 4: Support Ticket Router (US-06)
**File:** `support_ticket_router.json`

1. Import and replace Supabase credentials
2. **Test payload:**
```powershell
Invoke-WebRequest -Uri "YOUR_WEBHOOK_URL" `
  -Method POST -ContentType "application/json" `
  -Body '{"customer_email": "test@example.com", "vertical": "Food Delivery", "issue_type": "Cold Food"}'
```
Expected: routes to `food_delivery_dispute_flow`, SLA 4h, priority URGENT

---

## 5 · Sprint 2 DoD Check

```
GET https://YOUR_REPLIT_URL/api/sprint/2/dod-status
```

---

## Sprint 2 AI Features — Current State

| Feature | Sprint 2 State | Sprint 3 Upgrade |
|---|---|---|
| Conversational AI | Rule-based intent classification | Full LLM integration |
| Recommendations | Mock data, score-ranked | Collaborative filtering ML model |
| Meal Planner | Template-based plans | Nutritional optimisation AI |
| Compliance Checker | Rule-based (n8n) | ✅ Production-ready |
| Fraud Detection | Risk score rules | ML model with training data |
| Route Optimisation | Live OSRM integration | ✅ Production-ready (needs self-hosted OSRM) |

The compliance checker and route optimisation are essentially production-ready in Sprint 2. The others are functional prototypes that get upgraded to ML models in Sprint 3.

---

*UniMart · v7.0 · Sprint 2 · March 2026*
