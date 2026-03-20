# UniMart Sprint 3 — Code Deliverables
**EP-04 · US-07 through US-11 · Weeks 5–6**

---

## What's in This Package

```
unimart-sprint3/
├── lovable/pages/
│   ├── CustomerHomeFeed.jsx     — US-08: Unified home feed + smart cart + AI assistant
│   ├── DriverApp.jsx            — US-09: Driver job queue, routing, earnings
│   ├── NutritionistPortal.jsx   — US-10: Meal plan submission + badge management
│   └── WaitlistLanding.jsx      — US-11: Waitlist landing page with referral loop
├── supabase/
│   ├── 01_schema.sql            — 13 new tables (orders, customers, drivers, products, cart, waitlist, etc.)
│   └── 02_seed.sql              — US-07–11 stories, 36 Sprint 3 tickets, test data for all entities
├── n8n/
│   ├── waitlist_notification.json   — US-11: Welcome email + referral tracking
│   └── fake_review_detection.json   — US-07: Quarantine suspicious reviews
├── replit/
│   ├── server.js                — Full microservices + production AI (30+ endpoints)
│   └── package.json
└── README.md
```

---

## 1 · Supabase Setup

Run in order:
1. `01_schema.sql` — 13 new tables with RLS (anon insert allowed on all)
2. `02_seed.sql` — all 5 Sprint 3 user stories, 36 Kanban tickets, test customers/drivers/nutritionists/products/waitlist/orders/brand assets

**New tables:**
| Table | Purpose |
|---|---|
| `orders` | Full order management across all verticals |
| `customers` | Customer profiles with dietary preferences |
| `delivery_drivers` | Driver profiles, status, earnings |
| `delivery_jobs` | Individual delivery jobs with routing data |
| `nutritionists` | Nutritionist profiles and badge status |
| `meal_plans` | Nutritionist-submitted meal plans |
| `carts` | Customer shopping carts (cross-vertical) |
| `products` | Product catalog (all three verticals) |
| `reviews` | Product reviews |
| `waitlist` | Waitlist signups with referral codes |
| `brand_assets` | Brand guidelines and assets |
| `conversation_history` | AI chat session history |
| `notification_log` | All sent notifications |

---

## 2 · Lovable Setup

Add four new pages:

| File | Route | Purpose |
|---|---|---|
| `CustomerHomeFeed.jsx` | `/app/home` | US-08: Home feed with vertical tabs, AI assistant, smart cart drawer |
| `DriverApp.jsx` | `/driver/app` | US-09: Mobile-first driver app with job queue, live routing, earnings |
| `NutritionistPortal.jsx` | `/nutritionist/portal` | US-10: Meal plan submission, plan management, badge display |
| `WaitlistLanding.jsx` | `/` or `/waitlist` | US-11: Landing page with email capture and referral mechanic |

**Important:** Replace `YOUR_REPLIT_URL` in `CustomerHomeFeed.jsx` and `DriverApp.jsx` with your actual Replit URL (including `:5000`).

---

## 3 · Replit Setup

Upload `server.js` and `package.json`. Add one new secret:
```
OPENAI_API_KEY=YOUR_KEY  (optional — enables LLM conversational AI)
```
All other secrets carry over from Sprint 2.

**Key Sprint 3 endpoints:**

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a customer |
| GET | `/api/catalog/products` | Product catalog with filters |
| POST | `/api/orders` | Create an order |
| PATCH | `/api/orders/:id/status` | Update order status |
| GET | `/api/delivery/track/:order_id` | Real-time delivery tracking |
| GET | `/api/cart/:customer_id` | Get customer cart |
| POST | `/api/cart/:customer_id/add` | Add item to cart |
| POST | `/api/geo/check-availability` | Geo-fencing check |
| POST | `/api/chat/message` | Conversational AI (LLM if key provided) |
| GET | `/api/recommendations/:user_id` | Personalised recommendations |
| POST | `/api/meal-planner/generate` | Generate meal plan |
| POST | `/api/routing/optimise` | Route optimisation via OSRM |
| POST | `/api/fraud/check-order` | Fraud scoring |
| GET | `/api/drivers/:id/jobs` | Available delivery jobs |
| POST | `/api/drivers/:id/accept-job` | Accept a delivery job |
| GET | `/api/nutritionists` | Verified nutritionists |
| POST | `/api/waitlist/join` | Join waitlist |
| GET | `/api/sprint/3/dod-status` | Sprint 3 DoD check |

**Test the geo-fencing:**
```powershell
# Urban (London) — all verticals available
Invoke-WebRequest -Uri "https://YOUR_REPLIT:5000/api/geo/check-availability" -Method POST -ContentType "application/json" -Body '{"lat":51.5074,"lng":-0.1278}' -UseBasicParsing

# Rural — Shop only
Invoke-WebRequest -Uri "https://YOUR_REPLIT:5000/api/geo/check-availability" -Method POST -ContentType "application/json" -Body '{"lat":52.9548,"lng":-1.1581}' -UseBasicParsing
```

**Test the LLM conversational AI (requires OPENAI_API_KEY):**
```powershell
Invoke-WebRequest -Uri "https://YOUR_REPLIT:5000/api/chat/message" -Method POST -ContentType "application/json" -Body '{"message":"I am vegan and want a quick dinner tonight","session_id":"test-sprint3"}' -UseBasicParsing
```

---

## 4 · n8n Setup

Import both Sprint 3 workflows:

### Workflow 5: Waitlist Notification (US-11)
**File:** `waitlist_notification.json`
1. Import → replace Supabase credentials
2. Copy webhook URL
3. In `WaitlistLanding.jsx`, after the Supabase insert succeeds, call the webhook:
```js
await fetch('YOUR_N8N_WEBHOOK_URL', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: data.email, referral_code: data.referral_code, position: data.position, referred_by: referredBy })
});
```

### Workflow 6: Fake Review Detection (US-07)
**File:** `fake_review_detection.json`
1. Import → replace Supabase credentials
2. Test with the fake payload from `_meta`:
```powershell
Invoke-WebRequest -Uri "YOUR_WEBHOOK_URL" -Method POST -ContentType "application/json" -Body '{"review":{"review_text":"BUY NOW!!!","rating":5,"verified_purchase":false,"reviewer_email":"bot@spam.com"}}' -UseBasicParsing
```
Expected: quarantined with flags `ALL_CAPS`, `EXTREME_RATING_NO_CONTEXT`, `UNVERIFIED_PURCHASE`

---

## 5 · AI Features — Sprint 3 State

| Feature | Sprint 3 State |
|---|---|
| Conversational AI | ✅ Full LLM (GPT-3.5) with rule-based fallback |
| Recommendations | ✅ Personalised by dietary prefs + allergen filtering from Supabase |
| Meal Planner | ✅ Uses nutritionist-approved plans when available |
| Compliance Checker | ✅ Production-ready (Sprint 2) |
| Fraud Detection | ✅ Enhanced multi-signal scoring |
| Route Optimisation | ✅ Live OSRM with job record updates |

---

## 6 · Sprint 3 DoD Check

```
GET https://YOUR_REPLIT:5000/api/sprint/3/dod-status
```

---

*UniMart · v7.0 · Sprint 3 · March 2026*
