// ============================================================
// UniMart Sprint 1 — Replit Backend (Node.js / Express)
// Serves: Kanban board, empathy maps, HCD registry,
//         team members, risks, sprint velocity, wiki
// ============================================================

import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.LOVABLE_URL || "*" }));
app.use(express.json());

// ─── Supabase client ───────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // service role for server-side ops
);

// ─── Health ────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "unimart-sprint1-api", timestamp: new Date().toISOString() });
});

// ============================================================
// TEAM & SQUADS
// ============================================================

// GET /api/team — all team members with squad info
app.get("/api/team", async (req, res) => {
  const { data, error } = await supabase
    .from("team_members")
    .select("*, squads(display_name, description)")
    .order("squad", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/squads — all squads with member counts
app.get("/api/squads", async (req, res) => {
  const { data, error } = await supabase
    .from("squads")
    .select("*, team_members(id, name, role, is_squad_lead)");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/team — add team member
app.post("/api/team", async (req, res) => {
  const { name, email, role, squad, is_squad_lead } = req.body;
  if (!name || !email || !role) return res.status(400).json({ error: "name, email, role required" });
  const { data, error } = await supabase
    .from("team_members")
    .insert({ name, email, role, squad, is_squad_lead: is_squad_lead ?? false })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/team/:id/onboard — mark member as onboarded
app.patch("/api/team/:id/onboard", async (req, res) => {
  const { data, error } = await supabase
    .from("team_members")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================================
// KANBAN BOARD
// ============================================================

// GET /api/kanban — full board grouped by status
app.get("/api/kanban", async (req, res) => {
  const { sprint, squad } = req.query;
  let query = supabase
    .from("kanban_board")
    .select("*")
    .order("created_at", { ascending: true });
  if (sprint) query = query.eq("sprint_number", parseInt(sprint));
  if (squad) query = query.eq("squad", squad);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  // Group by status
  const columns = ["backlog", "todo", "in_progress", "review", "done"];
  const board = {};
  for (const col of columns) board[col] = data.filter((t) => t.status === col);
  res.json(board);
});

// GET /api/kanban/tickets — flat list with filters
app.get("/api/kanban/tickets", async (req, res) => {
  const { sprint, squad, status, assignee } = req.query;
  let query = supabase.from("kanban_tickets").select("*, team_members(name, avatar_url)");
  if (sprint) query = query.eq("sprint_number", parseInt(sprint));
  if (squad) query = query.eq("squad", squad);
  if (status) query = query.eq("status", status);
  if (assignee) query = query.eq("assignee_id", assignee);
  const { data, error } = await query.order("priority", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/kanban/tickets/:id/status — move ticket between columns
app.patch("/api/kanban/tickets/:id/status", async (req, res) => {
  const { status, pm_signoff } = req.body;
  const validStatuses = ["backlog", "todo", "in_progress", "review", "done"];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: "invalid status" });

  const update = { status };
  if (status === "done") {
    update.moved_to_done_at = new Date().toISOString();
    if (pm_signoff) {
      update.pm_signoff = true;
      update.pm_signoff_at = new Date().toISOString();
    }
  }
  const { data, error } = await supabase
    .from("kanban_tickets")
    .update(update)
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST /api/kanban/tickets — create new ticket
app.post("/api/kanban/tickets", async (req, res) => {
  const { title, description, story_id, status, priority, squad, sprint_number, story_points, labels } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const { data, error } = await supabase
    .from("kanban_tickets")
    .insert({ title, description, story_id, status: status ?? "backlog", priority: priority ?? "medium", squad, sprint_number, story_points, labels })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/kanban/tickets/:id/comments — add comment
app.post("/api/kanban/tickets/:id/comments", async (req, res) => {
  const { author_id, body } = req.body;
  if (!body) return res.status(400).json({ error: "body required" });
  const { data, error } = await supabase
    .from("ticket_comments")
    .insert({ ticket_id: req.params.id, author_id, body })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ============================================================
// SPRINTS & VELOCITY
// ============================================================

// GET /api/sprints — all sprints
app.get("/api/sprints", async (req, res) => {
  const { data, error } = await supabase.from("sprints").select("*").order("number");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/sprints/:number/velocity — velocity metrics for a sprint
app.get("/api/sprints/:number/velocity", async (req, res) => {
  const { data, error } = await supabase
    .from("sprint_velocity")
    .select("*")
    .eq("sprint_number", parseInt(req.params.number))
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/sprints/:number/ceremonies — all ceremonies for a sprint
app.get("/api/sprints/:number/ceremonies", async (req, res) => {
  const { data, error } = await supabase
    .from("sprint_ceremonies")
    .select("*")
    .eq("sprint_number", parseInt(req.params.number))
    .order("scheduled_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/sprints/ceremonies/:id/complete — mark ceremony complete
app.patch("/api/sprints/ceremonies/:id/complete", async (req, res) => {
  const { notes, action_items } = req.body;
  const { data, error } = await supabase
    .from("sprint_ceremonies")
    .update({ completed_at: new Date().toISOString(), notes, action_items })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================================
// USER STORIES & EPICS
// ============================================================

// GET /api/stories — user stories with epic info
app.get("/api/stories", async (req, res) => {
  const { sprint } = req.query;
  let query = supabase
    .from("user_stories")
    .select("*, epics(epic_id, name), team_members(name)")
    .order("story_id");
  if (sprint) query = query.eq("sprint_number", parseInt(sprint));
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/epics — all epics
app.get("/api/epics", async (req, res) => {
  const { data, error } = await supabase.from("epics").select("*").order("epic_id");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================================
// HCD CHALLENGES & USER GROUPS
// ============================================================

// GET /api/hcd/challenges — full registry ordered by priority
app.get("/api/hcd/challenges", async (req, res) => {
  const { data, error } = await supabase
    .from("hcd_priority_registry")
    .select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/hcd/challenges/:id — update severity / priority
app.patch("/api/hcd/challenges/:id", async (req, res) => {
  const { severity, frequency, priority_rank, mitigation_notes } = req.body;
  const { data, error } = await supabase
    .from("hcd_challenges")
    .update({ severity, frequency, priority_rank, mitigation_notes })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/hcd/user-groups — all user groups
app.get("/api/hcd/user-groups", async (req, res) => {
  const { data, error } = await supabase
    .from("user_groups")
    .select("*")
    .order("display_order");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================================
// EMPATHY MAPS
// ============================================================

// GET /api/empathy-maps — all maps with user group info
app.get("/api/empathy-maps", async (req, res) => {
  const { data, error } = await supabase
    .from("empathy_maps")
    .select("*, user_groups(name, icon), empathy_map_entries(*)")
    .order("created_at");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/empathy-maps/:userGroupId — single map for a user group
app.get("/api/empathy-maps/:userGroupId", async (req, res) => {
  const { data, error } = await supabase
    .from("empathy_maps")
    .select("*, user_groups(name, description, icon), empathy_map_entries(*)")
    .eq("user_group_id", req.params.userGroupId)
    .single();
  if (error) return res.status(404).json({ error: "Empathy map not found" });
  res.json(data);
});

// POST /api/empathy-maps — create new map for a user group
app.post("/api/empathy-maps", async (req, res) => {
  const { user_group_id, facilitator_id, session_date } = req.body;
  if (!user_group_id) return res.status(400).json({ error: "user_group_id required" });
  const { data, error } = await supabase
    .from("empathy_maps")
    .insert({ user_group_id, facilitator_id, session_date })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/empathy-maps/:id/entries — add entry to a map
app.post("/api/empathy-maps/:id/entries", async (req, res) => {
  const { quadrant, content, is_pain_point } = req.body;
  if (!quadrant || !content) return res.status(400).json({ error: "quadrant and content required" });
  const validQuadrants = ["says", "thinks", "does", "feels"];
  if (!validQuadrants.includes(quadrant)) return res.status(400).json({ error: "invalid quadrant" });
  const { data, error } = await supabase
    .from("empathy_map_entries")
    .insert({ empathy_map_id: req.params.id, quadrant, content, is_pain_point: is_pain_point ?? false })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/empathy-maps/:id/validate — mark map as validated
app.patch("/api/empathy-maps/:id/validate", async (req, res) => {
  const { validated_by } = req.body;
  const { data, error } = await supabase
    .from("empathy_maps")
    .update({ is_validated: true, validated_by, validated_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/empathy-maps/summary — completion summary across all user groups
app.get("/api/empathy-maps/completion/summary", async (req, res) => {
  const [groupsRes, mapsRes] = await Promise.all([
    supabase.from("user_groups").select("id, name, icon").order("display_order"),
    supabase.from("empathy_maps").select("user_group_id, is_validated, empathy_map_entries(id, is_pain_point)"),
  ]);
  if (groupsRes.error || mapsRes.error) return res.status(500).json({ error: "query failed" });

  const mapsByGroup = {};
  for (const m of mapsRes.data) {
    mapsByGroup[m.user_group_id] = m;
  }

  const summary = groupsRes.data.map((g) => {
    const map = mapsByGroup[g.id];
    return {
      ...g,
      has_map: !!map,
      is_validated: map?.is_validated ?? false,
      entry_count: map?.empathy_map_entries?.length ?? 0,
      pain_point_count: map?.empathy_map_entries?.filter((e) => e.is_pain_point).length ?? 0,
    };
  });

  const completed = summary.filter((s) => s.is_validated).length;
  res.json({ total: summary.length, completed, summary });
});

// ============================================================
// RISKS
// ============================================================

// GET /api/risks — full risk register
app.get("/api/risks", async (req, res) => {
  const { category } = req.query;
  let query = supabase.from("risks").select("*").order("risk_id");
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/risks/summary — risk summary by category
app.get("/api/risks/summary", async (req, res) => {
  const { data, error } = await supabase.from("risk_summary").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/risks/:id/resolve — mark risk resolved
app.patch("/api/risks/:id/resolve", async (req, res) => {
  const { resolution_notes } = req.body;
  const { data, error } = await supabase
    .from("risks")
    .update({ is_resolved: true, resolved_at: new Date().toISOString(), resolution_notes })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/risks/:id/review — record last reviewed date
app.patch("/api/risks/:id/review", async (req, res) => {
  const { data, error } = await supabase
    .from("risks")
    .update({ last_reviewed_at: new Date().toISOString() })
    .eq("id", req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================================
// PROJECT WIKI / DOCUMENTS
// ============================================================

// GET /api/docs — all documents
app.get("/api/docs", async (req, res) => {
  const { category } = req.query;
  let query = supabase.from("project_documents").select("*").order("created_at");
  if (category) query = query.eq("category", category);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/docs/:slug — single document by slug
app.get("/api/docs/:slug", async (req, res) => {
  const { data, error } = await supabase
    .from("project_documents")
    .select("*")
    .eq("slug", req.params.slug)
    .single();
  if (error) return res.status(404).json({ error: "Document not found" });
  res.json(data);
});

// POST /api/docs — create document
app.post("/api/docs", async (req, res) => {
  const { slug, title, content, category, created_by } = req.body;
  if (!slug || !title || !content || !category) return res.status(400).json({ error: "slug, title, content, category required" });
  const { data, error } = await supabase
    .from("project_documents")
    .insert({ slug, title, content, category, created_by })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PATCH /api/docs/:slug — update document content
app.patch("/api/docs/:slug", async (req, res) => {
  const { content, version } = req.body;
  const { data, error } = await supabase
    .from("project_documents")
    .update({ content, version })
    .eq("slug", req.params.slug)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ============================================================
// DASHBOARD SUMMARY (used by Lovable home page)
// ============================================================
app.get("/api/dashboard/sprint1", async (req, res) => {
  const [
    { data: tickets },
    { data: empathyMaps },
    { data: risks },
    { data: userGroups },
    { data: ceremonies },
    { data: teamMembers },
  ] = await Promise.all([
    supabase.from("kanban_tickets").select("status, priority, squad").eq("sprint_number", 1),
    supabase.from("empathy_maps").select("is_validated, user_group_id"),
    supabase.from("risks").select("overall_rating, is_resolved"),
    supabase.from("user_groups").select("id"),
    supabase.from("sprint_ceremonies").select("ceremony_type, completed_at").eq("sprint_number", 1),
    supabase.from("team_members").select("squad, onboarded_at"),
  ]);

  const ticketsByStatus = {};
  for (const t of tickets ?? []) ticketsByStatus[t.status] = (ticketsByStatus[t.status] ?? 0) + 1;

  const onboardedCount = teamMembers?.filter((m) => m.onboarded_at).length ?? 0;
  const empathyValidated = empathyMaps?.filter((m) => m.is_validated).length ?? 0;
  const highRisks = risks?.filter((r) => r.overall_rating === "high" && !r.is_resolved).length ?? 0;
  const ceremoniesCompleted = ceremonies?.filter((c) => c.completed_at).length ?? 0;

  res.json({
    sprint: 1,
    tickets: { total: tickets?.length ?? 0, ...ticketsByStatus },
    empathy_maps: { total: userGroups?.length ?? 0, completed: empathyMaps?.length ?? 0, validated: empathyValidated },
    team: { total: teamMembers?.length ?? 0, onboarded: onboardedCount },
    risks: { high_unresolved: highRisks, total: risks?.length ?? 0 },
    ceremonies: { total: ceremonies?.length ?? 0, completed: ceremoniesCompleted },
  });
});

// ============================================================
// START
// ============================================================
app.listen(PORT, () => {
  console.log(`✅ UniMart Sprint 1 API running on port ${PORT}`);
});
