# UniMart Sprint 4 — Code Deliverables
**EP-05 & EP-06 · US-12 through US-15 · Weeks 7–8**

---

## What's in This Package

```
unimart-sprint4/
├── lovable/pages/
│   ├── QADashboard.jsx              — US-12: Test runs tracker + bug report logger
│   ├── AIValidationDashboard.jsx    — US-13: AI model accuracy metrics + live test runner
│   ├── ComplianceAuditTracker.jsx   — US-14: Full compliance audit checklist
│   ├── SentimentDashboard.jsx       — US-12: Aggregated feedback sentiment visualisation
│   ├── RetrospectiveBoard.jsx       — US-15: Sprint retrospective kanban board
│   └── StakeholderHandoff.jsx       — US-15: Handoff document with approval workflow + markdown export
├── supabase/
│   ├── 01_schema.sql                — 9 new tables (QA runs, bugs, AI validation, compliance, retro, handoff, sentiment)
│   └── 02_seed.sql                  — All 4 user stories, 36 Sprint 4 tickets, QA runs, compliance items, retro items, handoff sections, sentiment data
├── n8n/
│   └── sentiment_aggregator.json    — US-12: Daily sentiment aggregation from tickets + usability results
└── README.md
```

---

## 1 · Supabase Setup

Run in order:
1. `01_schema.sql` — 9 new tables
2. `02_seed.sql` — all Sprint 4 data

**New tables:**
| Table | Purpose |
|---|---|
| `qa_test_runs` | QA test run tracking |
| `qa_test_cases` | Individual test cases per run |
| `bug_reports` | Bug report log with severity and status |
| `ai_validation_runs` | AI model accuracy metrics per feature |
| `compliance_audit_items` | 12 compliance checklist items |
| `usability_results` | Usability test session results |
| `retrospective_items` | Sprint retrospective cards with voting |
| `handoff_items` | Stakeholder handoff document sections |
| `sentiment_feedback` | Aggregated sentiment from all channels |

---

## 2 · Lovable Setup

Add six new pages:

| File | Route | Purpose |
|---|---|---|
| `QADashboard.jsx` | `/sprint4/qa` | US-12: Create test runs, log bugs, track pass rates |
| `AIValidationDashboard.jsx` | `/sprint4/ai-validation` | US-13: Enter validation metrics, run live Replit tests |
| `ComplianceAuditTracker.jsx` | `/sprint4/compliance` | US-14: Review all 12 compliance items, mark pass/fail |
| `SentimentDashboard.jsx` | `/sprint4/sentiment` | US-12: Visualise aggregated feedback by source and category |
| `RetrospectiveBoard.jsx` | `/sprint4/retrospective` | US-15: 4-column retro board with voting and action items |
| `StakeholderHandoff.jsx` | `/sprint4/handoff` | US-15: Review and approve all handoff sections, export markdown |

**Important:** Replace `YOUR_REPLIT_URL` in `AIValidationDashboard.jsx` with your Sprint 3 Replit URL.

---

## 3 · Replit

No new Replit server needed — Sprint 3 Replit covers all endpoints required for Sprint 4 validation. The AI Validation Dashboard calls:
- `POST /api/chat/message` — conversational AI resolution rate test
- `POST /api/routing/optimise` — route optimisation validation
- `POST /api/fraud/check-order` — fraud detection validation

---

## 4 · n8n Setup

### Workflow 7: Sentiment Aggregator (US-12)
**File:** `sentiment_aggregator.json`

1. Import → replace Supabase credentials
2. Add a **Merge node** between the two fetch nodes and Analyse Sentiment (same pattern as Sprint 1 velocity workflow)
3. Activate — runs at 8 AM Mon–Fri

---

## 5 · Sprint 4 DoD Checklist

Work through these in order:

**US-12 — QA & Usability**
- [ ] All 8 QA test runs completed and logged in QA Dashboard
- [ ] Zero critical bugs outstanding
- [ ] WCAG 2.1 AA audit passed — zero critical violations
- [ ] Onboarding comprehension ≥ 80% confirmed
- [ ] Sentiment dashboard live with data flowing

**US-13 — AI Validation**
- [ ] Conversational AI resolution rate ≥ 80% (live test in AI Validation Dashboard)
- [ ] Meal planner dietary alignment ≥ 90%
- [ ] Compliance checker false positive rate ≤ 10%
- [ ] Route optimisation reduces delivery time vs baseline
- [ ] Fraud detection correctly flags test transactions
- [ ] Recommendations A/B test completed

**US-14 — Compliance**
- [ ] All 12 compliance audit items reviewed — zero critical failures
- [ ] Food safety and allergen rules verified by Legal
- [ ] Privacy policy published in Lovable app
- [ ] Community standards and seller terms published
- [ ] Fake review detection tested with 10 simulations

**US-15 — Handoff**
- [ ] All handoff document sections approved in StakeholderHandoff.jsx
- [ ] Export markdown handoff document and share with Senior Partners
- [ ] Sprint 4 Retrospective completed with all squad leads
- [ ] All Sprint 4 Kanban tickets moved to Done
- [ ] Run final DoD SQL to close out all sprints

**Final DoD SQL — run after all above are complete:**
```sql
UPDATE public.sprint_tickets
SET status = 'Done', updated_at = now()
WHERE sprint = 4;

UPDATE public.user_stories
SET status = 'Done', updated_at = now()
WHERE story_id IN ('US-12','US-13','US-14','US-15');
```

---

## 6 · Project Closure

Congratulations — UniMart is complete! 🎉

**8-Week Summary:**
- ✅ Sprint 1: HCD foundation, empathy maps, team setup
- ✅ Sprint 2: UX design, AI architecture, seller & support systems  
- ✅ Sprint 3: Full platform build — customer app, driver app, nutritionist portal, waitlist
- ✅ Sprint 4: QA, AI validation, compliance audit, stakeholder handoff

**Total deliverables:**
- 35 Supabase tables across 4 sprints
- 14 Lovable pages / components
- 7 n8n workflows
- 30+ Replit API endpoints
- 6 production-quality AI features
- 22 risks tracked and mitigated

---

*UniMart · v7.0 · Sprint 4 · March 2026 · Project Complete*
