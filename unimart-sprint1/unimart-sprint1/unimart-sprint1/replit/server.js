// UniMart Sprint 1 — Replit Backend API
// EP-01: Discovery & Project Foundation
// Serves data to the Lovable Sprint 1 dashboard
// Run: npm install && npm start

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase client (server-side, uses service role key) ─────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors({ origin: process.env.LOVABLE_APP_URL || "*" }));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "unimart-sprint1-api", sprint: 1, timestamp: new Date().toISOString() });
});

// ── Sprint 1 Overview ────────────────────────────────────────
app.get("/api/sprint/1/overview", async (req, res) => {
  try {
    const [tickets, challenges, risks, velocity] = await Promise.all([
      supabase.from("kanban_tickets").select("ticket_id, title, status, story_points, epic_id").eq("sprint", "1"),
      supabase.from("hcd_challenges").select("challenge_code, title, severity, frequency, priority_rank").order("priority_rank"),
      supabase.from("risk_register").select("risk_code, category, overall_rating, title").order("risk_code"),
      supabase.from("sprint_velocity").select("*, squads(display_name)").eq("sprint", "1"),
    ]);

    const t = tickets.data || [];
    const doneTickets = t.filter((tk) => tk.status === "done");
    const totalPoints = t.reduce((acc, tk) => acc + (tk.story_points || 0), 0);
    const donePoints = doneTickets.reduce((acc, tk) => acc + (tk.story_points || 0), 0);

    res.json({
      sprint: 1,
      weeks: "1–2",
      theme: "Discovery & Project Foundation",
      agileValue: "Customer collaboration over contract negotiation",
      tickets: {
        total: t.length,
        done: doneTickets.length,
        totalPoints,
        donePoints,
        velocityPct: totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0,
      },
      hcdChallenges: {
        total: (challenges.data || []).length,
        bySeverity: groupBy(challenges.data || [], "severity"),
      },
      risks: {
        total: (risks.data || []).length,
        byRating: groupBy(risks.data || [], "overall_rating"),
      },
      velocity: velocity.data || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Kanban ───────────────────────────────────────────────────
app.get("/api/kanban/sprint/:sprint", async (req, res) => {
  const { data, error } = await supabase
    .from("kanban_tickets")
    .select("*, squads(display_name, name)")
    .eq("sprint", req.params.sprint)
    .order("ticket_id");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/kanban/:ticketId/status", async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["backlog", "to_do", "in_progress", "review", "done"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const { data: ticket } = await supabase.from("kanban_tickets").select("id, status").eq("ticket_id", req.params.ticketId).single();
  if (!ticket) return res.status(404).json({ error: "Ticket not found" });

  // Log status change history
  await supabase.from("kanban_ticket_history").insert({
    ticket_id: ticket.id,
    from_status: ticket.status,
    to_status: status,
    changed_by: req.body.changedBy || "system",
  });

  const { data, error } = await supabase
    .from("kanban_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("ticket_id", req.params.ticketId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/kanban/:ticketId/signoff", async (req, res) => {
  const { data, error } = await supabase
    .from("kanban_tickets")
    .update({ pm_signed_off: true, status: "done", updated_at: new Date().toISOString() })
    .eq("ticket_id", req.params.ticketId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, ticket: data });
});

// ── HCD Challenges ───────────────────────────────────────────
app.get("/api/hcd/challenges", async (req, res) => {
  const { severity, approved } = req.query;
  let query = supabase.from("hcd_challenges").select("*").order("priority_rank");

  if (severity) query = query.eq("severity", severity);
  if (approved !== undefined) query = query.eq("approved", approved === "true");

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/hcd/challenges/:code/approve", async (req, res) => {
  const { approvedBy } = req.body;
  const { data, error } = await supabase
    .from("hcd_challenges")
    .update({ approved: true, approved_by: approvedBy, approved_at: new Date().toISOString() })
    .eq("challenge_code", req.params.code)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Empathy Maps ─────────────────────────────────────────────
app.get("/api/empathy-maps", async (req, res) => {
  const { data, error } = await supabase
    .from("empathy_maps")
    .select("*, user_groups(name, display_name, icon:description)");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/empathy-maps/:userGroup", async (req, res) => {
  const { data: group } = await supabase
    .from("user_groups")
    .select("id, display_name")
    .eq("name", req.params.userGroup)
    .single();

  if (!group) return res.status(404).json({ error: "User group not found" });

  const { data, error } = await supabase
    .from("empathy_maps")
    .select("*")
    .eq("user_group_id", group.id)
    .single();

  if (error && error.code !== "PGRST116") return res.status(500).json({ error: error.message });
  res.json(data || { user_group_id: group.id, user_group_name: req.params.userGroup, empty: true });
});

app.put("/api/empathy-maps/:userGroup", async (req, res) => {
  const { data: group } = await supabase
    .from("user_groups")
    .select("id")
    .eq("name", req.params.userGroup)
    .single();

  if (!group) return res.status(404).json({ error: "User group not found" });

  const payload = {
    user_group_id: group.id,
    thinks: req.body.thinks || [],
    feels: req.body.feels || [],
    says: req.body.says || [],
    does: req.body.does || [],
    pain_points: req.body.pain_points || [],
    gains: req.body.gains || [],
    figma_link: req.body.figma_link,
    participant_count: req.body.participant_count || 0,
    notes: req.body.notes,
    updated_at: new Date().toISOString(),
  };

  // Validate minimum pain points
  if (payload.pain_points.length < 3) {
    return res.status(400).json({ error: "Minimum 3 pain points required per US-01 acceptance criteria." });
  }

  const { data: existing } = await supabase
    .from("empathy_maps")
    .select("id")
    .eq("user_group_id", group.id)
    .single();

  let result;
  if (existing) {
    const { data, error } = await supabase.from("empathy_maps").update(payload).eq("id", existing.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    result = data;
  } else {
    const { data, error } = await supabase.from("empathy_maps").insert(payload).select().single();
    if (error) return res.status(500).json({ error: error.message });
    result = data;
  }

  res.json(result);
});

app.patch("/api/empathy-maps/:userGroup/validate", async (req, res) => {
  const { validatedBy } = req.body;
  const { data: group } = await supabase.from("user_groups").select("id").eq("name", req.params.userGroup).single();
  if (!group) return res.status(404).json({ error: "User group not found" });

  const { data, error } = await supabase
    .from("empathy_maps")
    .update({ validated: true, validated_by: validatedBy, validated_at: new Date().toISOString() })
    .eq("user_group_id", group.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Check US-01 acceptance criteria: all 11 groups have 3+ validated pain points
app.get("/api/empathy-maps/validation/status", async (req, res) => {
  const { data: groups } = await supabase.from("user_groups").select("id, name, display_name");
  const { data: maps } = await supabase.from("empathy_maps").select("user_group_id, pain_points, validated");

  const status = (groups || []).map((g) => {
    const map = (maps || []).find((m) => m.user_group_id === g.id);
    const painPointCount = (map?.pain_points || []).length;
    return {
      userGroup: g.name,
      displayName: g.display_name,
      painPointCount,
      meetsMinimum: painPointCount >= 3,
      validated: map?.validated || false,
      hasMap: !!map,
    };
  });

  const allMeetMinimum = status.every((s) => s.meetsMinimum);
  const allValidated = status.every((s) => s.validated);

  res.json({
    us01AcceptanceCriteria: {
      allGroupsHaveEmpathyMaps: status.every((s) => s.hasMap),
      allGroupsHave3PainPoints: allMeetMinimum,
      allValidated,
      readyForSprintReview: allMeetMinimum && allValidated,
    },
    groups: status,
  });
});

// ── Squads & Team ────────────────────────────────────────────
app.get("/api/squads", async (req, res) => {
  const { data, error } = await supabase.from("squads").select("*, team_members(id, full_name, role, onboarded_to_jira, onboarded_to_replit, onboarded_to_lovable, onboarded_to_n8n, working_agreements_signed)");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/team/onboarding", async (req, res) => {
  const { email, tool } = req.body;
  const validTools = ["jira", "replit", "lovable", "n8n", "agreements"];

  if (!validTools.includes(tool)) {
    return res.status(400).json({ error: `Invalid tool. Must be: ${validTools.join(", ")}` });
  }

  const fieldMap = {
    jira: "onboarded_to_jira",
    replit: "onboarded_to_replit",
    lovable: "onboarded_to_lovable",
    n8n: "onboarded_to_n8n",
    agreements: "working_agreements_signed",
  };

  const { data, error } = await supabase
    .from("team_members")
    .update({ [fieldMap[tool]]: true })
    .eq("email", email)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, member: data });
});

// Check US-02 acceptance criteria: all engineers onboarded
app.get("/api/team/onboarding/status", async (req, res) => {
  const { data, error } = await supabase.from("team_members").select("full_name, role, squad_id, onboarded_to_jira, onboarded_to_replit, onboarded_to_lovable, onboarded_to_n8n, working_agreements_signed");
  if (error) return res.status(500).json({ error: error.message });

  const members = data || [];
  const fullyOnboarded = members.filter((m) => m.onboarded_to_jira && m.onboarded_to_replit && m.onboarded_to_lovable && m.onboarded_to_n8n && m.working_agreements_signed);

  res.json({
    us02AcceptanceCriteria: {
      allMembersOnboarded: fullyOnboarded.length === members.length,
      fullyOnboardedCount: fullyOnboarded.length,
      totalMembers: members.length,
    },
    members,
  });
});

// ── Risk Register ────────────────────────────────────────────
app.get("/api/risks", async (req, res) => {
  const { category, rating } = req.query;
  let query = supabase.from("risk_register").select("*").order("risk_code");
  if (category) query = query.eq("category", category);
  if (rating) query = query.eq("overall_rating", rating);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Sprint Ceremonies ────────────────────────────────────────
app.get("/api/ceremonies/sprint/:sprint", async (req, res) => {
  const { data, error } = await supabase
    .from("sprint_ceremonies")
    .select("*")
    .eq("sprint", req.params.sprint)
    .order("scheduled_at");

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch("/api/ceremonies/:id/complete", async (req, res) => {
  const { data, error } = await supabase
    .from("sprint_ceremonies")
    .update({ completed: true, notes: req.body.notes })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Brand Decisions ──────────────────────────────────────────
app.get("/api/brand", async (req, res) => {
  const { data, error } = await supabase.from("brand_decisions").select("*").order("decision_type");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Retrospective ────────────────────────────────────────────
app.post("/api/retrospective", async (req, res) => {
  const { sprint, category, description, owner, due_date } = req.body;

  if (!["went_well", "to_improve", "action_item"].includes(category)) {
    return res.status(400).json({ error: "Category must be: went_well, to_improve, or action_item" });
  }

  const { data, error } = await supabase.from("retrospective_items").insert({ sprint, category, description, owner, due_date }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.get("/api/retrospective/sprint/:sprint", async (req, res) => {
  const { data, error } = await supabase.from("retrospective_items").select("*").eq("sprint", req.params.sprint).order("category");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ── Utility ──────────────────────────────────────────────────
function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const val = item[key] || "unknown";
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 UniMart Sprint 1 API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Sprint overview: http://localhost:${PORT}/api/sprint/1/overview`);
  console.log(`   Empathy map validation: http://localhost:${PORT}/api/empathy-maps/validation/status`);
});
