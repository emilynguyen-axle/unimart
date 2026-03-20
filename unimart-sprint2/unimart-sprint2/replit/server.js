/**
 * UniMart Sprint 2 — Replit Backend API
 * AI Architecture Blueprints + Seller + Support endpoints
 *
 * ── Setup ────────────────────────────────────────────────────
 * Add to Replit Secrets:
 *   SUPABASE_URL=https://YOUR_PROJECT.supabase.co
 *   SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY
 *   PORT=3000
 *   OPENAI_API_KEY=YOUR_KEY (for conversational AI prototype)
 *   OSRM_BASE_URL=https://router.project-osrm.org  (public demo — replace for prod)
 *
 * Run: npm install @supabase/supabase-js express cors dotenv node-fetch
 * ────────────────────────────────────────────────────────────
 */

import "dotenv/config";
import express from "express";
import cors    from "cors";
import fetch   from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const app  = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());

// ── Health ────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ project: "UniMart", sprint: 2, status: "online" }));

// ════════════════════════════════════════════════════════════════
// AI BLUEPRINT ENDPOINTS (US-04)
// ════════════════════════════════════════════════════════════════

app.get("/api/ai-blueprints", async (req, res) => {
  try {
    const { data, error } = await supabase.from("ai_blueprints").select("*").order("feature");
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch("/api/ai-blueprints/:id/approve", async (req, res) => {
  try {
    const { approved_by } = req.body;
    const { data, error } = await supabase
      .from("ai_blueprints")
      .update({ status: "Approved", approved_by: approved_by || "Engineering Lead", updated_at: new Date().toISOString() })
      .eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
// CONVERSATIONAL AI PROTOTYPE (US-04)
// Simple intent classifier + response generator
// In Sprint 3 this will be replaced by a full LLM integration
// ════════════════════════════════════════════════════════════════

const INTENT_MAP = [
  { patterns: ["track", "where is", "delivery status", "order status"], intent: "order_tracking",    vertical: "Shop" },
  { patterns: ["meal kit", "meal plan", "recipe", "ingredients", "cook"], intent: "meal_kit_query",  vertical: "Meal Kits" },
  { patterns: ["food", "restaurant", "hungry", "deliver food", "order food"], intent: "food_delivery", vertical: "Food Delivery" },
  { patterns: ["return", "refund", "wrong item", "damaged"], intent: "return_refund",                vertical: "Shop" },
  { patterns: ["recommend", "suggest", "what should", "popular"], intent: "recommendation",          vertical: "cross-vertical" },
  { patterns: ["cancel", "cancellation"], intent: "cancellation",                                    vertical: "cross-vertical" },
];

const RESPONSES = {
  order_tracking:  "I can help you track your order! Could you share your order number? I'll pull up the latest status for you.",
  meal_kit_query:  "Great question about meal kits! UniMart has hundreds of chef-designed recipes delivered fresh. Would you like to see this week's featured kits, or browse by dietary preference?",
  food_delivery:   "Hungry? I can help you find great food nearby. What type of cuisine are you in the mood for, or shall I show you top-rated restaurants in your area?",
  return_refund:   "I'm sorry to hear that. Let me help you with your return or refund. Could you tell me your order number and briefly describe the issue?",
  recommendation:  "I'd love to help you discover something new! Are you looking for products, meal kits, or food delivery recommendations — or a mix of all three?",
  cancellation:    "I can help with your cancellation. Could you share your order number so I can check the cancellation window and options available to you?",
  fallback:        "I'm not quite sure I understood that — I can help with orders, meal kits, food delivery, returns, and recommendations. Could you rephrase or pick a topic?",
};

function classifyIntent(message) {
  const lower = message.toLowerCase();
  for (const entry of INTENT_MAP) {
    if (entry.patterns.some(p => lower.includes(p))) {
      return { intent: entry.intent, vertical: entry.vertical, confidence: 0.85 };
    }
  }
  return { intent: "fallback", vertical: "unknown", confidence: 0.2 };
}

/**
 * POST /api/chat/message
 * Body: { message, session_id, user_id }
 * Returns: { response, intent, vertical, confidence }
 */
app.post("/api/chat/message", async (req, res) => {
  const { message, session_id, user_id } = req.body;
  if (!message) return res.status(400).json({ success: false, error: "message required" });

  const { intent, vertical, confidence } = classifyIntent(message);
  const response = RESPONSES[intent] || RESPONSES.fallback;

  // Log interaction for model training (Sprint 4)
  await supabase.from("ai_performance_logs").insert({
    feature:      "conversational_ai",
    test_run_id:  session_id,
    metric_name:  "intent_classified",
    metric_value: confidence,
    threshold:    0.8,
    passed:       confidence >= 0.8,
    sprint:       2,
  }).catch(() => {}); // non-blocking

  res.json({
    success: true,
    data: { response, intent, vertical, confidence, session_id, timestamp: new Date().toISOString() }
  });
});

/**
 * POST /api/chat/feedback
 * Body: { session_id, rating, resolved }
 */
app.post("/api/chat/feedback", async (req, res) => {
  const { session_id, rating, resolved } = req.body;
  await supabase.from("ai_performance_logs").insert({
    feature: "conversational_ai", test_run_id: session_id,
    metric_name: "user_resolved", metric_value: resolved ? 1 : 0,
    threshold: 0.8, passed: resolved, sprint: 2,
  });
  res.json({ success: true });
});

// ════════════════════════════════════════════════════════════════
// RECOMMENDATIONS ENGINE PROTOTYPE (US-04)
// Rule-based prototype — Sprint 3 replaces with ML model
// ════════════════════════════════════════════════════════════════

const MOCK_RECOMMENDATIONS = {
  Shop:          [{ id: "s1", title: "Organic Apple Cider Vinegar", price: 8.99, vertical: "Shop", score: 0.92 }, { id: "s2", title: "Bamboo Cutting Board Set", price: 24.99, vertical: "Shop", score: 0.87 }],
  "Meal Kits":   [{ id: "m1", title: "Thai Green Curry Kit", price: 12.99, vertical: "Meal Kits", score: 0.95 }, { id: "m2", title: "Mexican Street Tacos Kit", price: 11.99, vertical: "Meal Kits", score: 0.89 }],
  "Food Delivery":[{ id: "f1", title: "Wagamama — Ramen & Gyoza", price: 18.50, vertical: "Food Delivery", score: 0.91 }, { id: "f2", title: "Dishoom — Breakfast Bun", price: 12.00, vertical: "Food Delivery", score: 0.88 }],
};

/**
 * GET /api/recommendations/:user_id
 * Query: ?vertical=Shop (optional)
 */
app.get("/api/recommendations/:user_id", async (req, res) => {
  const { vertical } = req.query;
  let results = [];
  if (vertical && MOCK_RECOMMENDATIONS[vertical]) {
    results = MOCK_RECOMMENDATIONS[vertical];
  } else {
    results = Object.values(MOCK_RECOMMENDATIONS).flat().sort((a, b) => b.score - a.score).slice(0, 6);
  }
  await supabase.from("ai_performance_logs").insert({
    feature: "recommendations", metric_name: "recommendations_served",
    metric_value: results.length, threshold: 1, passed: results.length > 0, sprint: 2,
  }).catch(() => {});
  res.json({ success: true, data: { user_id: req.params.user_id, recommendations: results, vertical: vertical || "cross-vertical" } });
});

// ════════════════════════════════════════════════════════════════
// MEAL PLANNER PROTOTYPE (US-04)
// ════════════════════════════════════════════════════════════════

const MEAL_TEMPLATES = {
  vegetarian: [
    { day: "Monday",    meal: "Veggie Pad Thai Kit",        kit_id: "mk-001", price: 11.99 },
    { day: "Tuesday",   meal: "Mushroom Risotto Kit",       kit_id: "mk-002", price: 12.99 },
    { day: "Wednesday", meal: "Falafel & Hummus Wrap Kit",  kit_id: "mk-003", price: 10.99 },
    { day: "Thursday",  meal: "Lentil Dal & Rice Kit",      kit_id: "mk-004", price: 9.99  },
    { day: "Friday",    meal: "Margherita Pizza Kit",       kit_id: "mk-005", price: 13.99 },
  ],
  vegan: [
    { day: "Monday",    meal: "Tofu Stir-Fry Kit",          kit_id: "mk-006", price: 11.99 },
    { day: "Tuesday",   meal: "Black Bean Tacos Kit",       kit_id: "mk-007", price: 10.99 },
    { day: "Wednesday", meal: "Chickpea Curry Kit",         kit_id: "mk-008", price: 9.99  },
    { day: "Thursday",  meal: "Quinoa Buddha Bowl Kit",     kit_id: "mk-009", price: 12.99 },
    { day: "Friday",    meal: "Vegan Ramen Kit",            kit_id: "mk-010", price: 13.99 },
  ],
  standard: [
    { day: "Monday",    meal: "Chicken Tikka Masala Kit",   kit_id: "mk-011", price: 12.99 },
    { day: "Tuesday",   meal: "Beef Bolognese Kit",         kit_id: "mk-012", price: 13.99 },
    { day: "Wednesday", meal: "Salmon Teriyaki Kit",        kit_id: "mk-013", price: 15.99 },
    { day: "Thursday",  meal: "BBQ Pulled Pork Kit",        kit_id: "mk-014", price: 14.99 },
    { day: "Friday",    meal: "Thai Green Curry Kit",       kit_id: "mk-015", price: 12.99 },
  ],
};

/**
 * POST /api/meal-planner/generate
 * Body: { dietary_preference, weeks, household_size, budget }
 */
app.post("/api/meal-planner/generate", async (req, res) => {
  const { dietary_preference = "standard", weeks = 1, household_size = 2, budget } = req.body;
  const template  = MEAL_TEMPLATES[dietary_preference] || MEAL_TEMPLATES.standard;
  const plan      = [];
  for (let w = 1; w <= Math.min(weeks, 4); w++) {
    plan.push({ week: w, meals: template.map(m => ({ ...m, price: m.price * household_size })) });
  }
  const totalCost = plan.flatMap(w => w.meals).reduce((sum, m) => sum + m.price, 0);
  const withinBudget = !budget || totalCost <= budget;
  res.json({ success: true, data: { plan, total_cost: totalCost.toFixed(2), household_size, dietary_preference, weeks, within_budget: withinBudget } });
});

/**
 * POST /api/meal-planner/populate-cart
 * Body: { plan (from generate response) }
 */
app.post("/api/meal-planner/populate-cart", async (req, res) => {
  const { plan } = req.body;
  if (!plan) return res.status(400).json({ success: false, error: "plan required" });
  const cartItems = plan.flatMap(w => w.meals.map(m => ({ kit_id: m.kit_id, title: m.meal, price: m.price, quantity: 1, vertical: "Meal Kits" })));
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price, 0);
  res.json({ success: true, data: { cart_items: cartItems, cart_total: cartTotal.toFixed(2), item_count: cartItems.length } });
});

// ════════════════════════════════════════════════════════════════
// ROUTE OPTIMISATION PROTOTYPE (US-04)
// Uses public OSRM demo server — replace with self-hosted for prod
// ════════════════════════════════════════════════════════════════

/**
 * POST /api/routing/optimise
 * Body: { pickup: { lat, lng }, delivery: { lat, lng } }
 */
app.post("/api/routing/optimise", async (req, res) => {
  const { pickup, delivery } = req.body;
  if (!pickup || !delivery) return res.status(400).json({ success: false, error: "pickup and delivery required" });

  try {
    const osrmUrl = `${process.env.OSRM_BASE_URL || "https://router.project-osrm.org"}/route/v1/driving/${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?overview=full&geometries=geojson&steps=true`;
    const osrmRes  = await fetch(osrmUrl);
    const osrmData = await osrmRes.json();

    if (!osrmData.routes || osrmData.routes.length === 0) {
      return res.status(400).json({ success: false, error: "No route found" });
    }

    const route = osrmData.routes[0];
    const eta_minutes  = Math.ceil(route.duration / 60);
    const distance_km  = (route.distance / 1000).toFixed(2);

    await supabase.from("ai_performance_logs").insert({
      feature: "route_optimisation", metric_name: "route_generated",
      metric_value: eta_minutes, threshold: 60, passed: eta_minutes <= 60, sprint: 2,
    }).catch(() => {});

    res.json({
      success: true,
      data: {
        eta_minutes,
        distance_km,
        geometry:   route.geometry,
        steps:      route.legs[0]?.steps?.slice(0, 5).map(s => s.maneuver?.instruction).filter(Boolean),
        source:     "OSRM",
        note:       "Using public OSRM demo — replace with self-hosted instance for production"
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/routing/eta/:job_id
 * Returns mock ETA for an active delivery job
 */
app.get("/api/routing/eta/:job_id", async (req, res) => {
  res.json({ success: true, data: { job_id: req.params.job_id, eta_minutes: Math.floor(Math.random() * 20) + 5, status: "In Transit", last_updated: new Date().toISOString() } });
});

// ════════════════════════════════════════════════════════════════
// FRAUD DETECTION PROTOTYPE (US-04)
// Rule-based scoring — Sprint 3 replaces with ML model
// ════════════════════════════════════════════════════════════════

/**
 * POST /api/fraud/check-order
 * Body: { order_id, user_id, amount, payment_method, location }
 */
app.post("/api/fraud/check-order", async (req, res) => {
  const { order_id, user_id, amount, payment_method, location } = req.body;
  const signals = [];
  let risk_score = 0;

  if (amount > 500) { signals.push({ type: "HIGH_VALUE_ORDER", score: 30, detail: `Order value $${amount} exceeds threshold` }); risk_score += 30; }
  if (payment_method === "new_card") { signals.push({ type: "NEW_PAYMENT_METHOD", score: 20, detail: "First use of this payment method" }); risk_score += 20; }
  if (!location) { signals.push({ type: "MISSING_LOCATION", score: 15, detail: "No location data available" }); risk_score += 15; }

  const status    = risk_score >= 50 ? "Flagged" : "Cleared";
  const flag_data = { entity_type: "order", entity_id: order_id, signals, risk_score, status };

  if (status === "Flagged") {
    await supabase.from("fraud_flags").insert({ ...flag_data, entity_id: null }).catch(() => {});
  }

  res.json({ success: true, data: { order_id, risk_score, status, signals, recommended_action: risk_score >= 50 ? "HOLD_FOR_REVIEW" : "APPROVE" } });
});

app.get("/api/fraud/flags", async (req, res) => {
  try {
    const { data, error } = await supabase.from("fraud_flags").select("*").eq("status", "Flagged").order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
// SELLER ENDPOINTS (US-05)
// ════════════════════════════════════════════════════════════════

app.get("/api/sellers", async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase.from("sellers").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

/**
 * POST /api/sellers/:id/approve
 */
app.post("/api/sellers/:id/approve", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("sellers").update({ status: "Approved", verified_badge: true, onboarded_at: new Date().toISOString() })
      .eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

/**
 * POST /api/listings/generate-description
 * AI Listing Generator — plain text → polished listing
 * Body: { product_name, key_details, vertical }
 */
app.post("/api/listings/generate-description", async (req, res) => {
  const { product_name, key_details, vertical } = req.body;
  if (!product_name) return res.status(400).json({ success: false, error: "product_name required" });

  // Sprint 2: rule-based template. Sprint 3: replace with LLM call.
  const templates = {
    "Shop":          `**${product_name}** — ${key_details || "Premium quality product"}. Perfect for everyday use, this product is carefully selected to meet our quality standards. Fast delivery available.`,
    "Meal Kits":     `**${product_name}** — ${key_details || "Chef-designed meal kit"}. Everything you need, pre-portioned and ready to cook in under 30 minutes. Serves 2. Fresh ingredients delivered to your door.`,
    "Food Delivery": `**${product_name}** — ${key_details || "Fresh, delicious food"}. Made fresh to order. Estimated delivery: 25–40 minutes. Order now for fast, hot delivery.`,
  };

  const description = templates[vertical] || templates["Shop"];
  res.json({ success: true, data: { product_name, description, vertical, generated_at: new Date().toISOString(), note: "Sprint 2 template-based generator — LLM integration in Sprint 3" } });
});

// ════════════════════════════════════════════════════════════════
// SUPPORT ENDPOINTS (US-06)
// ════════════════════════════════════════════════════════════════

app.get("/api/support/tickets", async (req, res) => {
  try {
    const { vertical, status } = req.query;
    let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    if (vertical) query = query.eq("vertical", vertical);
    if (status)   query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.patch("/api/support/tickets/:id/status", async (req, res) => {
  const { status } = req.body;
  const valid = ["Open", "In Progress", "Resolved", "Escalated"];
  if (!valid.includes(status)) return res.status(400).json({ success: false, error: `Invalid status` });
  try {
    const update = { status, updated_at: new Date().toISOString() };
    if (status === "Resolved") update.resolved_at = new Date().toISOString();
    const { data, error } = await supabase.from("support_tickets").update(update).eq("id", req.params.id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/api/support/sla-standards", async (req, res) => {
  try {
    const { data, error } = await supabase.from("sla_standards").select("*").order("vertical");
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// ════════════════════════════════════════════════════════════════
// SPRINT 2 DOD STATUS CHECK
// ════════════════════════════════════════════════════════════════

app.get("/api/sprint/2/dod-status", async (req, res) => {
  try {
    const [
      { data: blueprints },
      { data: tickets },
      { data: sellers },
      { data: slaStandards },
    ] = await Promise.all([
      supabase.from("ai_blueprints").select("status"),
      supabase.from("sprint_tickets").select("story_id, status").eq("sprint", 2),
      supabase.from("sellers").select("id"),
      supabase.from("sla_standards").select("id"),
    ]);

    const approvedBlueprints = blueprints?.filter(b => b.status === "Approved").length ?? 0;
    const totalBlueprints    = blueprints?.length ?? 0;

    const dod = [
      { id: "blueprints-approved", label: "All 6 AI blueprints approved",        done: approvedBlueprints === 6, detail: `${approvedBlueprints}/6 approved` },
      { id: "sla-defined",         label: "SLA standards defined per vertical",   done: (slaStandards?.length ?? 0) >= 9, detail: `${slaStandards?.length ?? 0} SLA rules defined` },
      { id: "sellers-onboarding",  label: "Seller onboarding portal functional",  done: (sellers?.length ?? 0) > 0, detail: `${sellers?.length ?? 0} test sellers in system` },
      { id: "sprint2-tickets",     label: "Sprint 2 tickets progressing",         done: tickets?.some(t => t.status === "Done"), detail: `${tickets?.filter(t => t.status === "Done").length ?? 0}/${tickets?.length ?? 0} done` },
    ];

    res.json({ success: true, data: { sprint: 2, ready_for_review: dod.every(d => d.done), dod } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.listen(PORT, () => {
  console.log(`\n🚀 UniMart Sprint 2 API running on port ${PORT}`);
  console.log(`   Health:    http://localhost:${PORT}/`);
  console.log(`   Chat:      POST http://localhost:${PORT}/api/chat/message`);
  console.log(`   Routing:   POST http://localhost:${PORT}/api/routing/optimise`);
  console.log(`   Fraud:     POST http://localhost:${PORT}/api/fraud/check-order`);
  console.log(`   DoD:       http://localhost:${PORT}/api/sprint/2/dod-status\n`);
});
