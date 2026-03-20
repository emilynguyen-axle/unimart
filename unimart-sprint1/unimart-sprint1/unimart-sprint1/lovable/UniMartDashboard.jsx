// UniMart Sprint 1 — Project Dashboard (Lovable)
// EP-01: Discovery & Project Foundation
// Deploy this as the main Sprint 1 project hub in Lovable.

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase config ──────────────────────────────────────────
// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Design tokens ────────────────────────────────────────────
const COLORS = {
  brand: "#FF6B35",
  brandDark: "#E85520",
  surface: "#0F0F0F",
  surfaceCard: "#1A1A1A",
  surfaceBorder: "#2A2A2A",
  textPrimary: "#F5F5F0",
  textSecondary: "#999990",
  textMuted: "#555550",
  critical: "#FF4444",
  high: "#FF8800",
  medium: "#FFD700",
  low: "#44CC88",
  done: "#44CC88",
  inProgress: "#FF6B35",
  review: "#9B6FFF",
  backlog: "#555550",
};

const STATUS_COLORS = {
  backlog: COLORS.backlog,
  to_do: COLORS.textSecondary,
  in_progress: COLORS.inProgress,
  review: COLORS.review,
  done: COLORS.done,
};

const STATUS_LABELS = {
  backlog: "Backlog",
  to_do: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

const SEVERITY_COLORS = {
  critical: COLORS.critical,
  high: COLORS.high,
  medium: COLORS.medium,
  low: COLORS.low,
};

// ── Main Dashboard ───────────────────────────────────────────
export default function UniMartDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tickets, setTickets] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [squads, setSquads] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [t, c, s, r] = await Promise.all([
      supabase.from("kanban_tickets").select("*").eq("sprint", "1").order("ticket_id"),
      supabase.from("hcd_challenges").select("*").order("priority_rank"),
      supabase.from("squads").select("*, team_members(count)"),
      supabase.from("risk_register").select("*").order("risk_code"),
    ]);
    setTickets(t.data || []);
    setChallenges(c.data || []);
    setSquads(s.data || []);
    setRisks(r.data || []);
    setLoading(false);
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "kanban", label: "Kanban" },
    { id: "hcd", label: "HCD Registry" },
    { id: "team", label: "Squads" },
    { id: "risks", label: "Risk Register" },
  ];

  const highRisks = risks.filter((r) => r.overall_rating === "critical" || r.overall_rating === "high");
  const doneTickets = tickets.filter((t) => t.status === "done").length;
  const totalPoints = tickets.reduce((acc, t) => acc + (t.story_points || 0), 0);
  const donePoints = tickets.filter((t) => t.status === "done").reduce((acc, t) => acc + (t.story_points || 0), 0);

  return (
    <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: COLORS.surface, minHeight: "100vh", color: COLORS.textPrimary }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${COLORS.surfaceBorder}`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ background: COLORS.brand, color: "#fff", fontWeight: 700, fontSize: 18, padding: "6px 14px", letterSpacing: 2 }}>
            UM
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>UNIMART</div>
            <div style={{ color: COLORS.textSecondary, fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>
              Sprint 1 · Discovery & Foundation
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Badge color={COLORS.brand} label="Weeks 1–2" />
          <Badge color={COLORS.high} label={`${highRisks.length} High Risks`} />
          <Badge color={COLORS.done} label={`${doneTickets}/${tickets.length} Done`} />
        </div>
      </header>

      {/* Nav Tabs */}
      <nav style={{ borderBottom: `1px solid ${COLORS.surfaceBorder}`, padding: "0 32px", display: "flex", gap: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id ? `2px solid ${COLORS.brand}` : "2px solid transparent",
              color: activeTab === tab.id ? COLORS.textPrimary : COLORS.textSecondary,
              padding: "14px 20px",
              fontSize: 12,
              letterSpacing: 1,
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: "32px" }}>
        {loading ? (
          <LoadingState />
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab tickets={tickets} challenges={challenges} risks={risks} totalPoints={totalPoints} donePoints={donePoints} />}
            {activeTab === "kanban" && <KanbanTab tickets={tickets} setTickets={setTickets} />}
            {activeTab === "hcd" && <HCDTab challenges={challenges} />}
            {activeTab === "team" && <TeamTab squads={squads} />}
            {activeTab === "risks" && <RisksTab risks={risks} />}
          </>
        )}
      </main>
    </div>
  );
}

// ── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ tickets, challenges, risks, totalPoints, donePoints }) {
  const criticalChallenges = challenges.filter((c) => c.severity === "critical" || c.severity === "high");
  const highRisks = risks.filter((r) => r.overall_rating === "critical" || r.overall_rating === "high");
  const velocityPct = totalPoints ? Math.round((donePoints / totalPoints) * 100) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      {/* Sprint Goal */}
      <Card style={{ gridColumn: "1 / -1" }}>
        <CardLabel>Sprint 1 Goal · EP-01</CardLabel>
        <p style={{ margin: "8px 0 0", color: COLORS.textSecondary, lineHeight: 1.7, fontSize: 14 }}>
          Establish the human-centered foundation of the entire project. Conduct empathy research across all 11 user groups, prioritise HCD challenges, and stand up the cross-functional Agile team with full tooling and governance before any design or build work begins.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          {["Figma", "Jira/Linear", "n8n"].map((tool) => (
            <span key={tool} style={{ background: COLORS.surfaceBorder, padding: "4px 12px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
              {tool}
            </span>
          ))}
        </div>
      </Card>

      {/* Velocity */}
      <StatCard label="Sprint Velocity" value={`${donePoints} / ${totalPoints} pts`} sub={`${velocityPct}% complete`} color={COLORS.brand} />
      <StatCard label="HCD Challenges" value={`${criticalChallenges.length} High / Critical`} sub={`${challenges.length} total identified`} color={COLORS.high} />
      <StatCard label="Risks Flagged" value={`${highRisks.length} High`} sub={`${risks.length} total in register`} color={COLORS.critical} />

      {/* Agile Manifesto alignment */}
      <Card style={{ gridColumn: "1 / -1" }}>
        <CardLabel>Agile Manifesto · Sprint 1 Alignment</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          {[
            { value: "Customer collaboration", over: "contract negotiation", active: true },
            { value: "Individuals and interactions", over: "processes and tools", active: true },
            { value: "Working software", over: "comprehensive documentation", active: false },
            { value: "Responding to change", over: "following a plan", active: false },
          ].map((p) => (
            <div key={p.value} style={{ padding: "12px 16px", border: `1px solid ${p.active ? COLORS.brand : COLORS.surfaceBorder}`, opacity: p.active ? 1 : 0.4 }}>
              <div style={{ color: p.active ? COLORS.brand : COLORS.textSecondary, fontWeight: 700, fontSize: 12 }}>✦ {p.value}</div>
              <div style={{ color: COLORS.textMuted, fontSize: 11, marginTop: 4 }}>over {p.over}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Sprint ceremonies */}
      <Card style={{ gridColumn: "1 / -1" }}>
        <CardLabel>Sprint 1 Ceremonies</CardLabel>
        <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
          {[
            { name: "Sprint Planning", day: "Day 1", status: "completed" },
            { name: "Daily Stand-ups", day: "Days 1–10", status: "in_progress" },
            { name: "Sprint Review", day: "Day 12", status: "upcoming" },
            { name: "Retrospective", day: "Day 13", status: "upcoming" },
          ].map((c) => (
            <div key={c.name} style={{ flex: 1, minWidth: 140, padding: "12px 16px", border: `1px solid ${COLORS.surfaceBorder}` }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
              <div style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 4 }}>{c.day}</div>
              <div style={{ marginTop: 8 }}>
                <Badge color={c.status === "completed" ? COLORS.done : c.status === "in_progress" ? COLORS.inProgress : COLORS.textMuted} label={c.status.replace("_", " ")} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Kanban Tab ───────────────────────────────────────────────
function KanbanTab({ tickets, setTickets }) {
  const columns = ["backlog", "to_do", "in_progress", "review", "done"];

  async function moveTicket(ticketId, newStatus) {
    await supabase.from("kanban_tickets").update({ status: newStatus }).eq("id", ticketId);
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t)));
  }

  return (
    <div>
      <SectionHeader title="Sprint 1 Kanban Board" sub="EP-01 · Backlog → To Do → In Progress → Review → Done" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, overflowX: "auto" }}>
        {columns.map((col) => {
          const colTickets = tickets.filter((t) => t.status === col);
          return (
            <div key={col}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 12px", borderBottom: `2px solid ${STATUS_COLORS[col]}` }}>
                <span style={{ color: STATUS_COLORS[col], fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: "uppercase" }}>
                  {STATUS_LABELS[col]}
                </span>
                <span style={{ color: COLORS.textMuted, fontSize: 11 }}>({colTickets.length})</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {colTickets.map((ticket) => (
                  <KanbanCard key={ticket.id} ticket={ticket} onMove={moveTicket} columns={columns} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ ticket, onMove, columns }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ background: COLORS.surfaceCard, border: `1px solid ${COLORS.surfaceBorder}`, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ color: COLORS.brand, fontSize: 10, letterSpacing: 1, fontWeight: 700 }}>{ticket.ticket_id}</span>
        <span style={{ color: COLORS.textMuted, fontSize: 10 }}>{ticket.story_points}pt</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>{ticket.title}</div>
      <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {(ticket.tags || []).slice(0, 3).map((tag) => (
          <span key={tag} style={{ background: COLORS.surfaceBorder, padding: "2px 8px", fontSize: 9, letterSpacing: 0.5, color: COLORS.textMuted }}>
            {tag}
          </span>
        ))}
      </div>
      <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: COLORS.textSecondary, fontSize: 10, cursor: "pointer", marginTop: 8, padding: 0, letterSpacing: 1, textTransform: "uppercase" }}>
        {expanded ? "▲ Less" : "▼ Details"}
      </button>
      {expanded && (
        <div style={{ marginTop: 10, borderTop: `1px solid ${COLORS.surfaceBorder}`, paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Acceptance Criteria</div>
          {(ticket.acceptance_criteria || []).map((ac, i) => (
            <div key={i} style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4, display: "flex", gap: 6 }}>
              <span>·</span><span>{ac}</span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: COLORS.textSecondary, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Move to</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {columns.filter((c) => c !== ticket.status).map((col) => (
                <button key={col} onClick={() => onMove(ticket.id, col)} style={{ background: COLORS.surfaceBorder, border: "none", color: COLORS.textPrimary, fontSize: 9, padding: "3px 8px", cursor: "pointer", letterSpacing: 0.5 }}>
                  → {STATUS_LABELS[col]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HCD Registry Tab ─────────────────────────────────────────
function HCDTab({ challenges }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? challenges : challenges.filter((c) => c.severity === filter);

  return (
    <div>
      <SectionHeader title="HCD Challenge Registry" sub="11 challenges · Prioritised by severity & frequency" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "critical", "high", "medium", "low"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? COLORS.brand : COLORS.surfaceBorder, border: "none", color: COLORS.textPrimary, padding: "6px 14px", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((c) => (
          <HCDChallengeRow key={c.id} challenge={c} />
        ))}
      </div>
    </div>
  );
}

function HCDChallengeRow({ challenge }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `1px solid ${COLORS.surfaceBorder}`, padding: "14px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: COLORS.textMuted, fontSize: 10, letterSpacing: 1, minWidth: 60 }}>{challenge.challenge_code}</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{challenge.title}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge color={SEVERITY_COLORS[challenge.severity]} label={challenge.severity} />
          <Badge color={COLORS.textMuted} label={`freq: ${challenge.frequency}`} />
          <span style={{ color: COLORS.textMuted, fontSize: 12 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${COLORS.surfaceBorder}` }}>
          <p style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.7, margin: 0 }}>{challenge.description}</p>
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(challenge.affected_user_groups || []).map((g) => (
              <span key={g} style={{ background: COLORS.surfaceBorder, padding: "2px 10px", fontSize: 10, color: COLORS.textSecondary, letterSpacing: 0.5 }}>
                {g.replace(/_/g, " ")}
              </span>
            ))}
          </div>
          {challenge.mitigation_strategy && (
            <div style={{ marginTop: 10, padding: "10px 14px", background: "#1A2A1A", borderLeft: `2px solid ${COLORS.done}` }}>
              <div style={{ fontSize: 10, color: COLORS.done, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Mitigation</div>
              <div style={{ fontSize: 11, color: COLORS.textSecondary }}>{challenge.mitigation_strategy}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Team Tab ─────────────────────────────────────────────────
function TeamTab({ squads }) {
  const squadDetails = [
    { name: "ux_research", icon: "🎨", tools: ["Figma", "Axe", "Lovable"], focus: "Empathy mapping, usability testing, journey mapping, prototype validation" },
    { name: "core_dev", icon: "⚙️", tools: ["Replit", "CI/CD", "OpenStreetMap"], focus: "Backend microservices, APIs, Replit infrastructure, geo-fencing" },
    { name: "ai_integration", icon: "🤖", tools: ["Replit AI", "n8n"], focus: "AI model design, Replit AI hosting, n8n AI workflow orchestration" },
    { name: "growth_marketing", icon: "📈", tools: ["Lovable", "n8n", "Amplitude"], focus: "Branding, waitlist, ASO, co-marketing strategy, referral loops" },
    { name: "legal_compliance", icon: "⚖️", tools: ["n8n", "Replit"], focus: "Food safety, allergen compliance, data privacy, seller terms" },
  ];

  return (
    <div>
      <SectionHeader title="Cross-Functional Squads" sub="5 squads · Scrum + Kanban · Sprint 1 onboarding" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {squadDetails.map((s) => {
          const squad = squads.find((sq) => sq.name === s.name);
          return (
            <Card key={s.name}>
              <div style={{ display: "flex", align: "center", gap: 12 }}>
                <span style={{ fontSize: 24 }}>{s.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.5 }}>
                    {squad?.display_name || s.name.replace(/_/g, " ").toUpperCase()}
                  </div>
                  <div style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 4 }}>{squad?.lead_name || "Lead TBD"}</div>
                </div>
              </div>
              <p style={{ margin: "12px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6 }}>{s.focus}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                {s.tools.map((t) => (
                  <span key={t} style={{ background: COLORS.surfaceBorder, padding: "3px 10px", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: COLORS.textSecondary }}>
                    {t}
                  </span>
                ))}
              </div>
              <OnboardingChecklist />
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function OnboardingChecklist() {
  const [checks, setChecks] = useState({ jira: false, replit: false, lovable: false, n8n: false, agreements: false });
  return (
    <div style={{ marginTop: 14, borderTop: `1px solid ${COLORS.surfaceBorder}`, paddingTop: 12 }}>
      <div style={{ fontSize: 9, letterSpacing: 1, textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 8 }}>Onboarding Checklist</div>
      {Object.entries({ jira: "Jira/Linear", replit: "Replit", lovable: "Lovable", n8n: "n8n", agreements: "Working Agreements signed" }).map(([key, label]) => (
        <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: checks[key] ? COLORS.done : COLORS.textSecondary, cursor: "pointer", marginBottom: 4 }}>
          <input type="checkbox" checked={checks[key]} onChange={(e) => setChecks({ ...checks, [key]: e.target.checked })} style={{ accentColor: COLORS.brand }} />
          {label}
        </label>
      ))}
    </div>
  );
}

// ── Risk Register Tab ────────────────────────────────────────
function RisksTab({ risks }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? risks : risks.filter((r) => r.category === filter);
  const categories = ["all", "hcd", "tech_stack", "ai", "compliance", "project"];

  return (
    <div>
      <SectionHeader title="Risk & Mitigation Register" sub="22 risks · Reviewed every Sprint Review & Retro" />
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? COLORS.brand : COLORS.surfaceBorder, border: "none", color: COLORS.textPrimary, padding: "6px 14px", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer" }}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${COLORS.surfaceBorder}` }}>
            {["ID", "Category", "Risk", "Likelihood", "Impact", "Rating", "Owner"].map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: COLORS.textMuted, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((r) => (
            <RiskRow key={r.id} risk={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskRow({ risk }) {
  const [open, setOpen] = useState(false);
  const ratingColor = risk.overall_rating === "critical" || risk.overall_rating === "high" ? COLORS.critical : risk.overall_rating === "medium" ? COLORS.medium : COLORS.done;

  return (
    <>
      <tr onClick={() => setOpen(!open)} style={{ borderBottom: `1px solid ${COLORS.surfaceBorder}`, cursor: "pointer", background: open ? "#1A1A1A" : "transparent" }}>
        <td style={{ padding: "10px 12px", color: COLORS.brand, fontWeight: 700 }}>{risk.risk_code}</td>
        <td style={{ padding: "10px 12px", color: COLORS.textSecondary }}>{risk.category.replace("_", " ")}</td>
        <td style={{ padding: "10px 12px", fontWeight: 600 }}>{risk.title}</td>
        <td style={{ padding: "10px 12px" }}><Badge color={SEVERITY_COLORS[risk.likelihood]} label={risk.likelihood} /></td>
        <td style={{ padding: "10px 12px" }}><Badge color={SEVERITY_COLORS[risk.impact]} label={risk.impact} /></td>
        <td style={{ padding: "10px 12px" }}><Badge color={ratingColor} label={risk.overall_rating} /></td>
        <td style={{ padding: "10px 12px", color: COLORS.textSecondary, fontSize: 10 }}>{risk.owner}</td>
      </tr>
      {open && (
        <tr style={{ background: COLORS.surfaceCard }}>
          <td colSpan={7} style={{ padding: "12px 18px" }}>
            <div style={{ fontSize: 11, color: COLORS.textSecondary, marginBottom: 8 }}>{risk.description}</div>
            <div style={{ padding: "8px 12px", background: "#1A2A1A", borderLeft: `2px solid ${COLORS.done}` }}>
              <span style={{ fontSize: 9, color: COLORS.done, letterSpacing: 1, textTransform: "uppercase" }}>Mitigation: </span>
              <span style={{ fontSize: 11, color: COLORS.textSecondary }}>{risk.mitigation_strategy}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Shared Components ────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: COLORS.surfaceCard, border: `1px solid ${COLORS.surfaceBorder}`, padding: "18px 20px", ...style }}>
      {children}
    </div>
  );
}

function CardLabel({ children }) {
  return <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textMuted }}>{children}</div>;
}

function StatCard({ label, value, sub, color }) {
  return (
    <Card>
      <CardLabel>{label}</CardLabel>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 8 }}>{value}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>{sub}</div>
    </Card>
  );
}

function Badge({ color, label }) {
  return (
    <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, padding: "2px 8px", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600 }}>
      {label}
    </span>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>{title}</h2>
      <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 12, letterSpacing: 0.5 }}>{sub}</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: COLORS.textMuted, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
      Loading Sprint 1 data...
    </div>
  );
}
