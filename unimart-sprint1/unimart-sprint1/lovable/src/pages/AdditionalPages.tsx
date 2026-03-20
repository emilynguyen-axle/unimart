// ============================================================
// HCDRegistry.tsx
// ============================================================
import { useQuery } from "@tanstack/react-query";
import { getHCDChallenges, getUserGroups } from "../lib/api";
import { AlertTriangle } from "lucide-react";

const SEVERITY_COLOR: Record<string, string> = {
  critical: "#ff4747", high: "#ff8c47", medium: "#e8ff47", low: "#47ffb8",
};

export function HCDRegistry() {
  const { data: challenges, isLoading } = useQuery({ queryKey: ["hcd-challenges"], queryFn: getHCDChallenges });

  if (isLoading) return <div className="page-loading">Loading HCD registry…</div>;

  return (
    <div className="page">
      <h1 className="page-title">HCD Challenge Registry</h1>
      <p className="page-sub">US-01 · 11 challenges prioritised by severity and frequency</p>
      <div className="hcd-list">
        {challenges?.map((c: any) => (
          <div key={c.id} className="hcd-row">
            <div className="hcd-rank">#{c.priority_rank}</div>
            <div className="hcd-body">
              <div className="hcd-title-row">
                <span className="hcd-id">{c.challenge_id}</span>
                <span className="hcd-title">{c.title}</span>
                <span className="hcd-severity-badge" style={{ background: SEVERITY_COLOR[c.severity] + "22", color: SEVERITY_COLOR[c.severity], border: `1px solid ${SEVERITY_COLOR[c.severity]}44` }}>
                  {c.severity.toUpperCase()}
                </span>
                <span className="hcd-freq">freq {c.frequency}/5</span>
              </div>
              <p className="hcd-desc">{c.description}</p>
              {c.mitigation_notes && (
                <div className="hcd-mitigation">
                  <span className="mit-label">Mitigation:</span> {c.mitigation_notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{pageStyles}</style>
    </div>
  );
}

export default HCDRegistry;

// ============================================================
// RiskRegister.tsx
// ============================================================
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getRisks, getRiskSummary, resolveRisk } from "../lib/api";

const RATING_COLOR: Record<string, string> = { high: "#ff4747", medium: "#e8ff47", low: "#47ffb8" };
const RATING_EMOJI: Record<string, string> = { high: "🔴", medium: "🟡", low: "🟢" };

export function RiskRegister() {
  const [catFilter, setCatFilter] = useState("all");
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const qc = useQueryClient();

  const { data: risks } = useQuery({ queryKey: ["risks", catFilter], queryFn: () => getRisks(catFilter === "all" ? undefined : catFilter) });
  const { data: summary } = useQuery({ queryKey: ["risk-summary"], queryFn: getRiskSummary });

  const resolveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => resolveRisk(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["risks"] });
      qc.invalidateQueries({ queryKey: ["risk-summary"] });
      toast.success("Risk resolved");
      setResolving(null);
      setResolutionNote("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const CATS = ["all", "HCD", "Tech Stack", "AI", "Compliance", "Project"];

  return (
    <div className="page">
      <h1 className="page-title">Risk Register</h1>
      <p className="page-sub">22 risks across 5 categories · Reviewed every Sprint Review & Retrospective</p>

      <div className="risk-summary-row">
        {summary?.map((s: any) => (
          <div key={s.category} className="risk-summary-card">
            <span className="rsc-cat">{s.category}</span>
            <span className="rsc-total">{s.total_risks}</span>
            <span className="rsc-high">🔴 {s.high_risks}</span>
          </div>
        ))}
      </div>

      <div className="cat-filters">
        {CATS.map((c) => (
          <button key={c} className={`cat-btn ${catFilter === c ? "active" : ""}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="risks-list">
        {risks?.map((r: any) => (
          <div key={r.id} className={`risk-row ${r.is_resolved ? "resolved" : ""}`}>
            <div className="risk-id-col">
              <span className="risk-id">{r.risk_id}</span>
              <span className="risk-rating" style={{ color: RATING_COLOR[r.overall_rating] }}>
                {RATING_EMOJI[r.overall_rating]}
              </span>
            </div>
            <div className="risk-body">
              <div className="risk-title-row">
                <span className="risk-title">{r.title}</span>
                <span className="risk-cat-tag">{r.category}</span>
                {r.is_resolved && <span className="resolved-tag">Resolved</span>}
              </div>
              <p className="risk-desc">{r.description}</p>
              <div className="risk-meta-row">
                <span><strong>L:</strong> {r.likelihood} · <strong>I:</strong> {r.impact}</span>
                <span><strong>Owner:</strong> {r.owner}</span>
              </div>
              <div className="risk-mitigation"><strong>Mitigation:</strong> {r.mitigation}</div>
              {!r.is_resolved && resolving !== r.id && (
                <button className="resolve-trigger" onClick={() => setResolving(r.id)}>Mark Resolved</button>
              )}
              {resolving === r.id && (
                <div className="resolve-form">
                  <input
                    className="resolve-input"
                    placeholder="Resolution notes…"
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                  />
                  <button className="resolve-submit" onClick={() => resolveMutation.mutate({ id: r.id, notes: resolutionNote })}>
                    Confirm
                  </button>
                  <button className="resolve-cancel" onClick={() => setResolving(null)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style>{pageStyles}</style>
    </div>
  );
}

// ============================================================
// TeamOnboarding.tsx
// ============================================================
import { getTeam, getSquads, onboardMember } from "../lib/api";
import { CheckCircle, Clock } from "lucide-react";

export function TeamOnboarding() {
  const qc = useQueryClient();
  const { data: squads } = useQuery({ queryKey: ["squads"], queryFn: getSquads });
  const { data: team } = useQuery({ queryKey: ["team"], queryFn: getTeam });

  const onboardMutation = useMutation({
    mutationFn: (id: string) => onboardMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["team"] });
      toast.success("Member marked as onboarded");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const SQUAD_COLORS: Record<string, string> = {
    ux_research: "#b847ff", core_dev: "#47b8ff",
    ai_integration: "#e8ff47", growth_marketing: "#ff8c47", legal_compliance: "#47ffb8",
  };

  return (
    <div className="page">
      <h1 className="page-title">Team Onboarding</h1>
      <p className="page-sub">US-02 · 5 squads · All members must onboard to Jira, Replit, Lovable, and n8n</p>
      <div className="squads-section">
        {squads?.map((sq: any) => {
          const members = team?.filter((m: any) => m.squad === sq.name) ?? [];
          const onboarded = members.filter((m: any) => m.onboarded_at).length;
          return (
            <div key={sq.id} className="squad-block" style={{ "--sc": SQUAD_COLORS[sq.name] ?? "#666" } as React.CSSProperties}>
              <div className="squad-block-header">
                <span className="squad-block-name" style={{ color: SQUAD_COLORS[sq.name] }}>{sq.display_name}</span>
                <span className="squad-block-progress">{onboarded}/{members.length} onboarded</span>
              </div>
              <p className="squad-block-desc">{sq.description}</p>
              <div className="squad-members">
                {members.length === 0 && <span className="no-members">No members assigned yet</span>}
                {members.map((m: any) => (
                  <div key={m.id} className={`member-row ${m.onboarded_at ? "onboarded" : "pending"}`}>
                    <div className="member-avatar">{m.name.charAt(0)}</div>
                    <div className="member-info">
                      <span className="member-name">{m.name}</span>
                      <span className="member-role">{m.role.replace("_", " ")}</span>
                    </div>
                    {m.onboarded_at
                      ? <CheckCircle size={14} color="#47ffb8" />
                      : <button className="onboard-btn" onClick={() => onboardMutation.mutate(m.id)}>
                          Mark Onboarded
                        </button>
                    }
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <style>{pageStyles}</style>
    </div>
  );
}

export { TeamOnboarding as default };

// ============================================================
// ProjectWiki.tsx
// ============================================================
import { getDocs } from "../lib/api";

export function ProjectWiki() {
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const { data: docs } = useQuery({ queryKey: ["docs"], queryFn: getDocs });

  return (
    <div className="wiki-page">
      <div className="wiki-sidebar">
        <h2 className="wiki-sidebar-title">Project Wiki</h2>
        <div className="wiki-doc-list">
          {docs?.map((d: any) => (
            <button
              key={d.id}
              className={`wiki-doc-item ${activeDoc?.id === d.id ? "active" : ""}`}
              onClick={() => setActiveDoc(d)}
            >
              <span className="wiki-doc-title">{d.title}</span>
              <span className="wiki-doc-cat">{d.category}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="wiki-content">
        {!activeDoc && (
          <div className="wiki-empty">
            <p>Select a document from the sidebar</p>
          </div>
        )}
        {activeDoc && (
          <div className="wiki-doc">
            <h1 className="wiki-doc-heading">{activeDoc.title}</h1>
            <div className="wiki-doc-meta">
              <span>Category: {activeDoc.category}</span>
              <span>Version: {activeDoc.version}</span>
              <span>Updated: {new Date(activeDoc.updated_at).toLocaleDateString()}</span>
            </div>
            <pre className="wiki-doc-body">{activeDoc.content}</pre>
          </div>
        )}
      </div>
      <style>{`
        .wiki-page { display: flex; height: 100vh; font-family: 'DM Mono', monospace; background: #0e0e0e; color: #f0f0e8; }
        .wiki-sidebar { width: 260px; border-right: 1px solid #1e1e1e; padding: 1.5rem 0; flex-shrink: 0; }
        .wiki-sidebar-title { font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: #666; padding: 0 1.25rem; margin-bottom: 1rem; }
        .wiki-doc-list { display: flex; flex-direction: column; }
        .wiki-doc-item { background: transparent; border: none; border-left: 2px solid transparent; padding: 0.75rem 1.25rem; text-align: left; cursor: pointer; transition: all 0.15s; }
        .wiki-doc-item:hover { background: #111; }
        .wiki-doc-item.active { border-left-color: #e8ff47; background: #111; }
        .wiki-doc-title { display: block; font-size: 0.75rem; color: #aaa; font-family: inherit; }
        .wiki-doc-cat { display: block; font-size: 0.6rem; color: #555; margin-top: 0.2rem; text-transform: uppercase; letter-spacing: 0.08em; }
        .wiki-content { flex: 1; padding: 2rem; overflow: auto; }
        .wiki-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: #333; font-size: 0.8rem; }
        .wiki-doc-heading { font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem; }
        .wiki-doc-meta { display: flex; gap: 1.5rem; font-size: 0.65rem; color: #555; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #1e1e1e; }
        .wiki-doc-body { font-family: inherit; font-size: 0.75rem; line-height: 1.8; color: #aaa; white-space: pre-wrap; }
        ${pageStyles}
      `}</style>
    </div>
  );
}

export default ProjectWiki;

// ============================================================
// Shared page styles
// ============================================================
const pageStyles = `
  .page { padding: 2rem; font-family: 'DM Mono', monospace; background: #0e0e0e; color: #f0f0e8; min-height: 100vh; }
  .page-title { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.25rem; }
  .page-sub { font-size: 0.75rem; color: #666; margin: 0 0 1.5rem; font-style: italic; }
  .page-loading { padding: 4rem; text-align: center; color: #555; font-family: monospace; }

  /* HCD */
  .hcd-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .hcd-row { display: flex; gap: 1rem; padding: 1rem; background: #141414; border: 1px solid #1e1e1e; }
  .hcd-rank { font-size: 1.2rem; font-weight: 900; color: #2a2a2a; width: 2rem; flex-shrink: 0; }
  .hcd-body { flex: 1; }
  .hcd-title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
  .hcd-id { font-size: 0.6rem; color: #555; letter-spacing: 0.06em; }
  .hcd-title { font-size: 0.85rem; font-weight: 600; flex: 1; }
  .hcd-severity-badge { font-size: 0.55rem; padding: 0.15rem 0.5rem; letter-spacing: 0.08em; }
  .hcd-freq { font-size: 0.6rem; color: #555; }
  .hcd-desc { font-size: 0.72rem; color: #777; margin: 0 0 0.5rem; line-height: 1.5; }
  .hcd-mitigation { font-size: 0.68rem; color: #555; padding: 0.5rem; background: #0a0a0a; border-left: 2px solid #2a2a2a; }
  .mit-label { color: #47ffb8; }

  /* Risks */
  .risk-summary-row { display: flex; gap: 0.75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .risk-summary-card { background: #141414; border: 1px solid #1e1e1e; padding: 0.75rem 1rem; display: flex; align-items: center; gap: 0.75rem; }
  .rsc-cat { font-size: 0.65rem; color: #888; }
  .rsc-total { font-size: 1rem; font-weight: 700; }
  .rsc-high { font-size: 0.65rem; }
  .cat-filters { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .cat-btn { padding: 0.3rem 0.75rem; background: transparent; border: 1px solid #2a2a2a; color: #666; font-family: inherit; font-size: 0.65rem; cursor: pointer; letter-spacing: 0.08em; transition: all 0.15s; }
  .cat-btn:hover { border-color: #444; color: #aaa; }
  .cat-btn.active { border-color: #e8ff47; color: #e8ff47; }
  .risks-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .risk-row { display: flex; gap: 1rem; padding: 1rem; background: #141414; border: 1px solid #1e1e1e; }
  .risk-row.resolved { opacity: 0.4; }
  .risk-id-col { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; width: 3rem; flex-shrink: 0; }
  .risk-id { font-size: 0.65rem; color: #555; }
  .risk-body { flex: 1; }
  .risk-title-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.4rem; flex-wrap: wrap; }
  .risk-title { font-size: 0.82rem; font-weight: 600; flex: 1; }
  .risk-cat-tag { font-size: 0.55rem; background: #1e1e1e; color: #666; padding: 0.15rem 0.4rem; }
  .resolved-tag { font-size: 0.55rem; background: #0f1a00; color: #47ffb8; padding: 0.15rem 0.4rem; }
  .risk-desc { font-size: 0.7rem; color: #777; margin: 0 0 0.4rem; line-height: 1.5; }
  .risk-meta-row { display: flex; gap: 1.5rem; font-size: 0.65rem; color: #555; margin-bottom: 0.4rem; }
  .risk-mitigation { font-size: 0.67rem; color: #555; padding: 0.4rem 0.6rem; background: #0a0a0a; border-left: 2px solid #2a2a2a; }
  .resolve-trigger { margin-top: 0.5rem; padding: 0.25rem 0.6rem; background: transparent; border: 1px solid #2a2a2a; color: #666; font-family: inherit; font-size: 0.6rem; cursor: pointer; transition: all 0.15s; }
  .resolve-trigger:hover { border-color: #47ffb8; color: #47ffb8; }
  .resolve-form { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .resolve-input { flex: 1; background: #0e0e0e; border: 1px solid #2a2a2a; color: #f0f0e8; padding: 0.3rem 0.6rem; font-family: inherit; font-size: 0.65rem; outline: none; }
  .resolve-submit { padding: 0.3rem 0.6rem; background: #0f1a00; border: 1px solid #47ffb8; color: #47ffb8; font-family: inherit; font-size: 0.6rem; cursor: pointer; }
  .resolve-cancel { padding: 0.3rem 0.6rem; background: transparent; border: 1px solid #2a2a2a; color: #666; font-family: inherit; font-size: 0.6rem; cursor: pointer; }

  /* Team */
  .squads-section { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
  .squad-block { background: #141414; border: 1px solid #1e1e1e; border-top: 3px solid var(--sc, #444); padding: 1.25rem; }
  .squad-block-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
  .squad-block-name { font-size: 0.85rem; font-weight: 700; }
  .squad-block-progress { font-size: 0.65rem; color: #555; }
  .squad-block-desc { font-size: 0.68rem; color: #555; margin: 0 0 1rem; line-height: 1.4; }
  .squad-members { display: flex; flex-direction: column; gap: 0.4rem; }
  .no-members { font-size: 0.65rem; color: #333; }
  .member-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: #0e0e0e; border: 1px solid #1a1a1a; }
  .member-row.onboarded { border-left: 2px solid #47ffb8; }
  .member-avatar { width: 28px; height: 28px; background: #222; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; flex-shrink: 0; }
  .member-info { flex: 1; }
  .member-name { display: block; font-size: 0.75rem; font-weight: 600; }
  .member-role { display: block; font-size: 0.6rem; color: #555; text-transform: capitalize; }
  .onboard-btn { padding: 0.25rem 0.6rem; background: transparent; border: 1px solid #2a2a2a; color: #666; font-family: inherit; font-size: 0.6rem; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
  .onboard-btn:hover { border-color: #47ffb8; color: #47ffb8; }
`;
