/**
 * UniMart Sprint 1 — Replit Backend API
 * US-02: Project Infrastructure · Project Wiki & Team Onboarding
 *
 * ── Setup in Replit ──────────────────────────────────────────
 * 1. Create a new Node.js Replit
 * 2. Add to .env (Secrets in Replit sidebar):
 *    SUPABASE_URL=https://YOUR_PROJECT.supabase.co
 *    SUPABASE_SERVICE_KEY=YOUR_SERVICE_ROLE_KEY  (from Supabase Settings > API)
 *    PORT=3000
 *    ALLOWED_ORIGIN=https://your-lovable-app.lovable.app
 *
 * 3. Run: npm install @supabase/supabase-js express cors dotenv
 * 4. Click Run — Replit will give you a public URL for the API
 * ────────────────────────────────────────────────────────────
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase (service role — backend only) ────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));
app.use(express.json());

// ── Health Check ─────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    project: "UniMart",
    sprint: 1,
    status: "online",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ════════════════════════════════════════════════════════════════
// TEAM & SQUAD ENDPOINTS
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/squads
 * Returns all squads with member counts
 */
app.get("/api/squads", async (req, res) => {
  try {
    const { data: squads, error } = await supabase
      .from("squads")
      .select("*, team_members(count)");
    if (error) throw error;
    res.json({ success: true, data: squads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/team
 * Returns all team members grouped by squad
 */
app.get("/api/team", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("team_members")
      .select("*, squads(name, color_hex)")
      .order("squad_id");
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/team/onboard
 * Mark a team member as onboarded
 * Body: { member_id: string }
 */
app.post("/api/team/onboard", async (req, res) => {
  const { member_id } = req.body;
  if (!member_id) return res.status(400).json({ success: false, error: "member_id required" });
  try {
    const { data, error } = await supabase
      .from("team_members")
      .update({ onboarded: true })
      .eq("id", member_id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/team/onboarding-status
 * Returns onboarding completion per squad
 */
app.get("/api/team/onboarding-status", async (req, res) => {
  try {
    const { data: members, error } = await supabase
      .from("team_members")
      .select("squad_id, onboarded, squads(name)");
    if (error) throw error;

    const grouped = {};
    for (const m of members) {
      const name = m.squads?.name || "Unknown";
      if (!grouped[name]) grouped[name] = { total: 0, onboarded: 0 };
      grouped[name].total++;
      if (m.onboarded) grouped[name].onboarded++;
    }
    const result = Object.entries(grouped).map(([squad, stats]) => ({
      squad,
      ...stats,
      pct: stats.total > 0 ? Math.round((stats.onboarded / stats.total) * 100) : 0,
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// SPRINT & KANBAN ENDPOINTS
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/sprint/:sprintNum/tickets
 * Returns all tickets for a sprint, optionally filtered by squad
 * Query: ?squad=UX+Research&status=In+Progress
 */
app.get("/api/sprint/:sprintNum/tickets", async (req, res) => {
  const { sprintNum } = req.params;
  const { squad, status } = req.query;
  try {
    let query = supabase
      .from("sprint_tickets")
      .select("*")
      .eq("sprint", parseInt(sprintNum))
      .order("created_at");
    if (squad)  query = query.eq("squad", squad);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/tickets/:id/status
 * Move a ticket to a new Kanban status
 * Body: { status: "In Progress" }
 */
app.patch("/api/tickets/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["Backlog", "To Do", "In Progress", "Review", "Done"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }
  try {
    const { data, error } = await supabase
      .from("sprint_tickets")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/sprint/:sprintNum/velocity
 * Returns velocity summary for a sprint
 */
app.get("/api/sprint/:sprintNum/velocity", async (req, res) => {
  const { sprintNum } = req.params;
  try {
    const { data: tickets, error } = await supabase
      .from("sprint_tickets")
      .select("squad, priority, status")
      .eq("sprint", parseInt(sprintNum));
    if (error) throw error;

    const statuses = ["Backlog", "To Do", "In Progress", "Review", "Done"];
    const summary = statuses.reduce((acc, s) => {
      acc[s] = tickets.filter(t => t.status === s).length;
      return acc;
    }, {});
    const total    = tickets.length;
    const done     = summary["Done"];
    const velocity = total > 0 ? Math.round((done / total) * 100) : 0;

    // By squad
    const squads = [...new Set(tickets.map(t => t.squad).filter(Boolean))];
    const bySquad = squads.map(squad => {
      const sq = tickets.filter(t => t.squad === squad);
      return { squad, total: sq.length, done: sq.filter(t => t.status === "Done").length };
    });

    res.json({ success: true, data: { sprint: parseInt(sprintNum), total, velocity, summary, bySquad } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// HCD & EMPATHY MAP ENDPOINTS
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/hcd/challenges
 * Returns HCD challenge registry with prioritisation status
 */
app.get("/api/hcd/challenges", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("hcd_challenge_priorities")
      .select("*")
      .order("severity");
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/empathy-maps/progress
 * Returns completion summary for all 11 user group empathy maps
 */
app.get("/api/empathy-maps/progress", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("empathy_maps")
      .select("user_group, is_complete, updated_at");
    if (error) throw error;

    const total    = data.length;
    const complete = data.filter(m => m.is_complete).length;
    res.json({
      success: true,
      data: {
        maps: data,
        summary: { total, complete, pct: total > 0 ? Math.round((complete / total) * 100) : 0 },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// PROJECT WIKI ENDPOINTS
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/wiki
 * Returns all wiki entries, optionally filtered by sprint or entry_type
 * Query: ?sprint=1&entry_type=empathy_map
 */
app.get("/api/wiki", async (req, res) => {
  const { sprint, entry_type } = req.query;
  try {
    let query = supabase.from("wiki_entries").select("*").order("created_at", { ascending: false });
    if (sprint)     query = query.eq("sprint", parseInt(sprint));
    if (entry_type) query = query.eq("entry_type", entry_type);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wiki/:id
 * Returns a single wiki entry by ID
 */
app.get("/api/wiki/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("wiki_entries")
      .select("*")
      .eq("id", req.params.id)
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: "Wiki entry not found" });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/wiki/:id/approve
 * Mark a wiki entry as approved by the PM
 */
app.patch("/api/wiki/:id/approve", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("wiki_entries")
      .update({ is_approved: true, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// WORKING AGREEMENTS ENDPOINTS
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/working-agreements
 * Returns all working agreements
 */
app.get("/api/working-agreements", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("working_agreements")
      .select("*")
      .order("category");
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/working-agreements/:id/approve
 * Approve a working agreement (squad lead sign-off)
 */
app.post("/api/working-agreements/:id/approve", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("working_agreements")
      .update({ approved: true })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// SPRINT 1 DEFINITION OF DONE CHECK
// ════════════════════════════════════════════════════════════════

/**
 * GET /api/sprint/1/dod-status
 * Returns a structured DoD checklist status for Sprint 1
 */
app.get("/api/sprint/1/dod-status", async (req, res) => {
  try {
    const [
      { data: maps },
      { data: tickets },
      { data: agreements },
      { data: hcd },
      { data: wiki },
    ] = await Promise.all([
      supabase.from("empathy_maps").select("user_group, is_complete"),
      supabase.from("sprint_tickets").select("story_id, status").eq("sprint", 1),
      supabase.from("working_agreements").select("approved"),
      supabase.from("hcd_challenge_priorities").select("prioritised"),
      supabase.from("wiki_entries").select("is_approved").eq("sprint", 1),
    ]);

    const allMapsComplete  = maps?.every(m => m.is_complete) ?? false;
    const mapsCount        = maps?.filter(m => m.is_complete).length ?? 0;
    const allAgreements    = agreements?.every(a => a.approved) ?? false;
    const hcdPrioritised   = hcd?.filter(h => h.prioritised).length ?? 0;
    const wikiApproved     = wiki?.filter(w => w.is_approved).length ?? 0;

    const us01Tickets = tickets?.filter(t => t.story_id === "US-01") ?? [];
    const us02Tickets = tickets?.filter(t => t.story_id === "US-02") ?? [];
    const us01Done    = us01Tickets.length > 0 && us01Tickets.every(t => t.status === "Done");
    const us02Done    = us02Tickets.length > 0 && us02Tickets.every(t => t.status === "Done");

    const dodItems = [
      { id: "maps-complete",   label: "All 11 empathy maps complete",           done: allMapsComplete,     detail: `${mapsCount}/11 complete` },
      { id: "hcd-prioritised", label: "HCD challenge registry prioritised",     done: hcdPrioritised >= 11, detail: `${hcdPrioritised}/11 challenges prioritised` },
      { id: "wiki-approved",   label: "Findings stored & approved in wiki",     done: wikiApproved > 0,   detail: `${wikiApproved} wiki entries approved` },
      { id: "agreements-ok",   label: "Working agreements signed off",          done: allAgreements,       detail: `${agreements?.filter(a => a.approved).length ?? 0}/${agreements?.length ?? 0} approved` },
      { id: "us01-done",       label: "US-01 tickets moved to Done",            done: us01Done,            detail: `${us01Tickets.filter(t => t.status === "Done").length}/${us01Tickets.length} tickets done` },
      { id: "us02-done",       label: "US-02 tickets moved to Done",            done: us02Done,            detail: `${us02Tickets.filter(t => t.status === "Done").length}/${us02Tickets.length} tickets done` },
    ];

    const sprintReady = dodItems.every(i => i.done);

    res.json({ success: true, data: { sprint: 1, ready_for_review: sprintReady, dod: dodItems } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 UniMart Sprint 1 API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/`);
  console.log(`   DoD:    http://localhost:${PORT}/api/sprint/1/dod-status\n`);
});
