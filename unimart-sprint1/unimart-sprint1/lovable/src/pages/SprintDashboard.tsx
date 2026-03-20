// ============================================================
// SprintDashboard.tsx — Sprint 1 Overview Page
// Shows: velocity, team onboarding, empathy map progress,
//        ceremony tracker, risk summary, HCD challenge status
// ============================================================
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getDashboard, getVelocity, getCeremonies, getEmpathySummary, getRiskSummary, getTeam } from "../lib/api";
import { CheckCircle, Clock, AlertTriangle, Users, Map, Zap, Calendar, TrendingUp } from "lucide-react";

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent = "#e8ff47" }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: string;
}) {
  return (
    <div className="stat-card" style={{ "--accent": accent } as React.CSSProperties}>
      <div className="stat-icon"><Icon size={20} /></div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────
function ProgressBar({ value, max, label, color = "#e8ff47" }: {
  value: number; max: number; label: string; color?: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress-row">
      <div className="progress-meta">
        <span>{label}</span>
        <span className="progress-pct">{pct}%</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Ceremony Row ──────────────────────────────────────────
function CeremonyRow({ ceremony }: { ceremony: any }) {
  const date = new Date(ceremony.scheduled_at);
  const isDone = !!ceremony.completed_at;
  const isPast = date < new Date();
  return (
    <div className={`ceremony-row ${isDone ? "done" : isPast ? "overdue" : "upcoming"}`}>
      <div className="ceremony-status">
        {isDone ? <CheckCircle size={16} color="#e8ff47" /> : isPast ? <AlertTriangle size={16} color="#ff6b47" /> : <Clock size={16} color="#888" />}
      </div>
      <div className="ceremony-info">
        <span className="ceremony-type">{ceremony.ceremony_type.replace("_", " ").toUpperCase()}</span>
        <span className="ceremony-date">{date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</span>
      </div>
      {!isDone && !isPast && <span className="ceremony-badge upcoming-badge">Upcoming</span>}
      {isDone && <span className="ceremony-badge done-badge">Done</span>}
      {isPast && !isDone && <span className="ceremony-badge overdue-badge">Overdue</span>}
    </div>
  );
}

// ─── Risk Summary Panel ────────────────────────────────────
function RiskPanel({ summary }: { summary: any[] }) {
  const totalHigh = summary.reduce((sum, r) => sum + (r.high_risks ?? 0), 0);
  const totalMed = summary.reduce((sum, r) => sum + (r.medium_risks ?? 0), 0);
  return (
    <div className="risk-panel">
      <div className="panel-header"><AlertTriangle size={18} /> Risk Summary</div>
      <div className="risk-badges">
        <span className="risk-badge high">🔴 {totalHigh} High</span>
        <span className="risk-badge medium">🟡 {totalMed} Medium</span>
      </div>
      <div className="risk-breakdown">
        {summary.map((r) => (
          <div key={r.category} className="risk-category-row">
            <span className="cat-name">{r.category}</span>
            <span className="cat-count">{r.total_risks} risks</span>
            <span className="cat-resolved">{r.resolved} resolved</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empathy Progress Panel ────────────────────────────────
function EmpathyPanel({ summary }: { summary: any }) {
  if (!summary) return null;
  return (
    <div className="empathy-panel">
      <div className="panel-header"><Map size={18} /> Empathy Maps</div>
      <div className="empathy-grid">
        {summary.summary?.map((g: any) => (
          <div key={g.id} className={`empathy-group ${g.is_validated ? "validated" : g.has_map ? "in-progress" : "empty"}`}>
            <span className="group-icon">{g.icon}</span>
            <span className="group-name">{g.name.split("/")[0].trim()}</span>
            {g.is_validated && <CheckCircle size={12} color="#e8ff47" />}
            {g.has_map && !g.is_validated && <Clock size={12} color="#888" />}
          </div>
        ))}
      </div>
      <div className="empathy-stats">
        <span>{summary.completed}/{summary.total} maps created</span>
        <span>{summary.summary?.filter((g: any) => g.is_validated).length}/{summary.total} validated</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────
export default function SprintDashboard() {
  const { sprintNumber = "1" } = useParams();
  const n = parseInt(sprintNumber);

  const { data: dashboard } = useQuery({ queryKey: ["dashboard", n], queryFn: () => getDashboard(n) });
  const { data: velocity } = useQuery({ queryKey: ["velocity", n], queryFn: () => getVelocity(n) });
  const { data: ceremonies } = useQuery({ queryKey: ["ceremonies", n], queryFn: () => getCeremonies(n) });
  const { data: empathy } = useQuery({ queryKey: ["empathy-summary"], queryFn: getEmpathySummary });
  const { data: riskSummary } = useQuery({ queryKey: ["risk-summary"], queryFn: getRiskSummary });
  const { data: team } = useQuery({ queryKey: ["team"], queryFn: getTeam });

  const onboardedCount = team?.filter((m: any) => m.onboarded_at)?.length ?? 0;
  const totalTeam = team?.length ?? 0;

  return (
    <div className="sprint-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="sprint-badge">SPRINT {n}</span>
          <h1>Discovery <span>&amp;</span> Foundation</h1>
          <p className="sprint-theme">Weeks 1–2 · Customer collaboration over contract negotiation</p>
        </div>
        <div className="header-right">
          <div className="agile-manifesto-pill">
            <Zap size={14} />
            <span>HCD · Scrum · Kanban</span>
          </div>
        </div>
      </header>

      {/* ── Top Stats ── */}
      <section className="stats-row">
        <StatCard
          label="Tickets Done"
          value={`${dashboard?.tickets?.done ?? 0}/${dashboard?.tickets?.total ?? 0}`}
          sub="Sprint 1 Kanban"
          icon={CheckCircle}
          accent="#e8ff47"
        />
        <StatCard
          label="Story Points"
          value={`${velocity?.points_completed ?? 0}/${velocity?.points_total ?? 0}`}
          sub="Velocity"
          icon={TrendingUp}
          accent="#47b8ff"
        />
        <StatCard
          label="Team Onboarded"
          value={`${onboardedCount}/${totalTeam}`}
          sub="Members ready"
          icon={Users}
          accent="#ff8c47"
        />
        <StatCard
          label="Empathy Maps"
          value={`${dashboard?.empathy_maps?.validated ?? 0}/11`}
          sub="Validated"
          icon={Map}
          accent="#b847ff"
        />
        <StatCard
          label="High Risks Open"
          value={dashboard?.risks?.high_unresolved ?? 0}
          sub="Needs attention"
          icon={AlertTriangle}
          accent="#ff4747"
        />
        <StatCard
          label="Ceremonies"
          value={`${dashboard?.ceremonies?.completed ?? 0}/${dashboard?.ceremonies?.total ?? 0}`}
          sub="Completed"
          icon={Calendar}
          accent="#47ffb8"
        />
      </section>

      {/* ── Progress ── */}
      <section className="progress-section">
        <h2>Sprint Progress</h2>
        <ProgressBar label="US-01 · HCD Kickoff & Empathy Mapping" value={dashboard?.empathy_maps?.validated ?? 0} max={11} color="#e8ff47" />
        <ProgressBar label="US-02 · Team Formation & Infrastructure" value={onboardedCount} max={totalTeam || 1} color="#47b8ff" />
        <ProgressBar label="Overall Ticket Completion" value={dashboard?.tickets?.done ?? 0} max={dashboard?.tickets?.total || 1} color="#ff8c47" />
        <ProgressBar label="Story Points Velocity" value={velocity?.points_completed ?? 0} max={velocity?.points_total || 1} color="#b847ff" />
      </section>

      {/* ── Panels Row ── */}
      <section className="panels-row">
        {/* Ceremonies */}
        <div className="ceremonies-panel">
          <div className="panel-header"><Calendar size={18} /> Sprint Ceremonies</div>
          <div className="ceremonies-list">
            {ceremonies?.map((c: any) => <CeremonyRow key={c.id} ceremony={c} />)}
          </div>
        </div>

        {/* Risk Summary */}
        {riskSummary && <RiskPanel summary={riskSummary} />}

        {/* Empathy Panel */}
        {empathy && <EmpathyPanel summary={empathy} />}
      </section>

      {/* ── US-01 & US-02 Definition of Done ── */}
      <section className="dod-section">
        <h2>Definition of Done — Sprint 1</h2>
        <div className="dod-grid">
          <div className="dod-card">
            <h3>US-01 · HCD Kickoff</h3>
            {[
              { label: "All 11 empathy maps documented", done: (dashboard?.empathy_maps?.completed ?? 0) >= 11 },
              { label: "HCD challenge registry approved", done: false },
              { label: "Brand direction approved", done: false },
              { label: "Journey maps: Customers, Sellers, Drivers", done: false },
              { label: "PM sign-off recorded", done: false },
            ].map((item) => (
              <div key={item.label} className={`dod-item ${item.done ? "done" : "pending"}`}>
                {item.done ? <CheckCircle size={14} color="#e8ff47" /> : <div className="dod-dot" />}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="dod-card">
            <h3>US-02 · Team Formation</h3>
            {[
              { label: "5 squads formed + leads assigned", done: true },
              { label: "Kanban board live in Jira/Linear", done: true },
              { label: "DoD & Working Agreements baselined", done: false },
              { label: "All engineers onboarded to Replit", done: onboardedCount > 0 },
              { label: "Sprint 1 Retrospective completed", done: false },
            ].map((item) => (
              <div key={item.label} className={`dod-item ${item.done ? "done" : "pending"}`}>
                {item.done ? <CheckCircle size={14} color="#e8ff47" /> : <div className="dod-dot" />}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .sprint-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          font-family: 'DM Mono', 'Fira Code', monospace;
          color: #f0f0e8;
          background: #0e0e0e;
          min-height: 100vh;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #2a2a2a;
          padding-bottom: 1.5rem;
        }
        .sprint-badge {
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: #e8ff47;
          border: 1px solid #e8ff47;
          padding: 0.2rem 0.6rem;
          display: inline-block;
          margin-bottom: 0.5rem;
        }
        .dashboard-header h1 { font-size: 2.2rem; font-weight: 700; margin: 0; letter-spacing: -0.02em; }
        .dashboard-header h1 span { color: #e8ff47; }
        .sprint-theme { font-size: 0.8rem; color: #666; margin-top: 0.25rem; font-style: italic; }
        .agile-manifesto-pill {
          display: flex; align-items: center; gap: 0.5rem;
          border: 1px solid #2a2a2a; padding: 0.4rem 0.8rem;
          font-size: 0.75rem; color: #888;
        }
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: #141414;
          border: 1px solid #222;
          padding: 1.25rem;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--accent, #e8ff47);
        }
        .stat-card:hover { border-color: var(--accent, #e8ff47); }
        .stat-icon { color: var(--accent, #e8ff47); margin-bottom: 0.75rem; }
        .stat-value { font-size: 1.6rem; font-weight: 700; display: block; letter-spacing: -0.02em; }
        .stat-label { font-size: 0.7rem; color: #888; letter-spacing: 0.08em; text-transform: uppercase; display: block; }
        .stat-sub { font-size: 0.65rem; color: #555; display: block; margin-top: 0.25rem; }
        .progress-section { background: #141414; border: 1px solid #222; padding: 1.5rem; margin-bottom: 2rem; }
        .progress-section h2 { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: #666; margin: 0 0 1.5rem; }
        .progress-row { margin-bottom: 1.25rem; }
        .progress-meta { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.4rem; color: #aaa; }
        .progress-pct { color: #f0f0e8; font-weight: 600; }
        .progress-track { height: 4px; background: #222; border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 2px; transition: width 0.6s cubic-bezier(0.16,1,0.3,1); }
        .panels-row { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 1rem; margin-bottom: 2rem; }
        .panel-header {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase;
          color: #888; margin-bottom: 1rem; border-bottom: 1px solid #1e1e1e; padding-bottom: 0.75rem;
        }
        .ceremonies-panel, .risk-panel, .empathy-panel {
          background: #141414; border: 1px solid #222; padding: 1.25rem;
        }
        .ceremonies-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .ceremony-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.5rem; background: #0e0e0e; font-size: 0.75rem;
        }
        .ceremony-type { font-weight: 600; letter-spacing: 0.06em; }
        .ceremony-date { color: #666; font-size: 0.65rem; display: block; }
        .ceremony-info { flex: 1; }
        .ceremony-badge { font-size: 0.6rem; letter-spacing: 0.08em; padding: 0.15rem 0.5rem; }
        .done-badge { background: #1a2a00; color: #e8ff47; }
        .upcoming-badge { background: #1a1a2a; color: #47b8ff; }
        .overdue-badge { background: #2a1a1a; color: #ff6b47; }
        .risk-badges { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
        .risk-badge { font-size: 0.7rem; padding: 0.25rem 0.6rem; background: #1a1a1a; }
        .risk-breakdown { display: flex; flex-direction: column; gap: 0.4rem; }
        .risk-category-row {
          display: flex; align-items: center; gap: 0.5rem;
          font-size: 0.7rem; padding: 0.4rem 0; border-bottom: 1px solid #1a1a1a;
        }
        .cat-name { flex: 1; color: #aaa; }
        .cat-count { color: #f0f0e8; font-weight: 600; }
        .cat-resolved { color: #555; font-size: 0.65rem; }
        .empathy-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem; margin-bottom: 1rem;
        }
        .empathy-group {
          display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
          padding: 0.5rem 0.25rem; border: 1px solid #1e1e1e; font-size: 0.6rem;
          text-align: center; transition: border-color 0.2s;
        }
        .empathy-group.validated { border-color: #2a3a00; background: #0f1400; }
        .empathy-group.in-progress { border-color: #1a1a2a; background: #0a0a14; }
        .group-icon { font-size: 1rem; }
        .group-name { color: #888; line-height: 1.2; }
        .empathy-stats { display: flex; justify-content: space-between; font-size: 0.65rem; color: #555; }
        .dod-section { margin-top: 1rem; }
        .dod-section h2 { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: #666; margin-bottom: 1rem; }
        .dod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .dod-card { background: #141414; border: 1px solid #222; padding: 1.25rem; }
        .dod-card h3 { font-size: 0.8rem; color: #e8ff47; margin: 0 0 1rem; letter-spacing: 0.06em; }
        .dod-item {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.4rem 0; border-bottom: 1px solid #1a1a1a; font-size: 0.75rem;
        }
        .dod-item.done { color: #f0f0e8; }
        .dod-item.pending { color: #555; }
        .dod-dot { width: 14px; height: 14px; border: 1px solid #333; border-radius: 50%; flex-shrink: 0; }
      `}</style>
    </div>
  );
}
