/**
 * UniMart Sprint 4 — QA Dashboard
 * US-12: Internal Testing & Usability Validation
 * Deploy in Lovable as: /sprint4/qa
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const STATUS_COLORS = { Pending: "#8890AA", "In Progress": "#5B8AF7", Passed: "#00B894", Failed: "#F76B8A", Blocked: "#F7A954" };
const SEVERITY_COLORS = { Critical: "#F76B8A", High: "#F7A954", Medium: "#5B8AF7", Low: "#00B894" };
const TEST_TYPE_EMOJI = { usability: "👥", integration: "🔗", regression: "🔄", load: "⚡", a11y: "♿", e2e: "🔁" };

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:  { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge:   (color) => ({ background: (color||"#6C5CE7") + "22", color: color||"#A29BFE", border: `1px solid ${(color||"#6C5CE7")}44`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }),
  body:    { padding: "28px 32px" },
  statsRow:{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "28px" },
  statCard:{ background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "12px", padding: "16px 20px" },
  statNum: (color) => ({ fontSize: "28px", fontWeight: "800", color: color || "#fff" }),
  statLabel:{ fontSize: "12px", color: "#6B7090", marginTop: "4px" },
  table:   { background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "14px", overflow: "hidden", marginBottom: "24px" },
  tableHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid #181B2E", fontSize: "11px", fontWeight: "700", color: "#6B7090", letterSpacing: "1px", textTransform: "uppercase" },
  tableRow:(i) => ({ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid #0F1220", background: i % 2 === 0 ? "transparent" : "#0A0C14", cursor: "pointer", transition: "background 0.1s" }),
  cell:    { fontSize: "13px", color: "#C4C8E0", display: "flex", alignItems: "center" },
  progressBar: { height: "6px", background: "#181B2E", borderRadius: "3px", overflow: "hidden", marginTop: "6px" },
  progressFill:(pct, color) => ({ height: "100%", width: `${pct}%`, background: color || "#6C5CE7", borderRadius: "3px", transition: "width 0.4s" }),
  modal:   { position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modalBox:{ background: "#0D0F1C", border: "1px solid #252840", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "600px" },
  input:   { width: "100%", background: "#090B12", border: "1px solid #1C2035", borderRadius: "8px", color: "#E2E4EF", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  select:  { width: "100%", background: "#090B12", border: "1px solid #1C2035", borderRadius: "8px", color: "#E2E4EF", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  label:   { fontSize: "12px", fontWeight: "600", color: "#6B7090", display: "block", marginBottom: "6px", marginTop: "14px" },
  btnPrimary: { background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 22px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  btnSecondary: { background: "#181B2E", color: "#8890AA", border: "1px solid #252840", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", cursor: "pointer" },
};

export default function QADashboard() {
  const [runs, setRuns]         = useState([]);
  const [bugs, setBugs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showNewRun, setShowNewRun] = useState(false);
  const [showNewBug, setShowNewBug] = useState(false);
  const [activeTab, setActiveTab]   = useState("runs");
  const [newRun, setNewRun]     = useState({ title: "", test_type: "usability", persona: "Customer", user_story: "US-12" });
  const [newBug, setNewBug]     = useState({ title: "", severity: "High", platform: "Lovable", description: "", user_story: "US-12" });

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const [{ data: r }, { data: b }] = await Promise.all([
      supabase.from("qa_test_runs").select("*").eq("sprint", 4).order("created_at", { ascending: false }),
      supabase.from("bug_reports").select("*").order("created_at", { ascending: false }),
    ]);
    setRuns(r || []);
    setBugs(b || []);
    setLoading(false);
  }

  async function createRun() {
    const { data } = await supabase.from("qa_test_runs").insert({ ...newRun, sprint: 4, status: "Pending" }).select().single();
    if (data) { setRuns(p => [data, ...p]); setShowNewRun(false); setNewRun({ title: "", test_type: "usability", persona: "Customer", user_story: "US-12" }); }
  }

  async function createBug() {
    const { data } = await supabase.from("bug_reports").insert({ ...newBug, status: "Open" }).select().single();
    if (data) { setBugs(p => [data, ...p]); setShowNewBug(false); setNewBug({ title: "", severity: "High", platform: "Lovable", description: "", user_story: "US-12" }); }
  }

  async function updateRunStatus(id, status) {
    await supabase.from("qa_test_runs").update({ status }).eq("id", id);
    setRuns(p => p.map(r => r.id === id ? { ...r, status } : r));
  }

  async function updateBugStatus(id, status) {
    await supabase.from("bug_reports").update({ status }).eq("id", id);
    setBugs(p => p.map(b => b.id === id ? { ...b, status } : b));
  }

  const stats = {
    totalRuns:   runs.length,
    passed:      runs.filter(r => r.status === "Passed").length,
    failed:      runs.filter(r => r.status === "Failed").length,
    pending:     runs.filter(r => r.status === "Pending").length,
    criticalBugs: bugs.filter(b => b.severity === "Critical" && b.status === "Open").length,
  };
  const passPct = stats.totalRuns > 0 ? Math.round((stats.passed / stats.totalRuns) * 100) : 0;

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart</span>
          <span style={s.badge()}>QA Dashboard · US-12 · Sprint 4</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button style={s.btnSecondary} onClick={() => setShowNewBug(true)}>+ Log Bug</button>
          <button style={s.btnPrimary} onClick={() => setShowNewRun(true)}>+ New Test Run</button>
        </div>
      </div>

      <div style={s.body}>
        {/* Stats */}
        <div style={s.statsRow}>
          <div style={s.statCard}><div style={s.statNum("#fff")}>{stats.totalRuns}</div><div style={s.statLabel}>Total Test Runs</div><div style={s.progressBar}><div style={s.progressFill(passPct, "#00B894")} /></div></div>
          <div style={s.statCard}><div style={s.statNum("#00B894")}>{stats.passed}</div><div style={s.statLabel}>Passed</div></div>
          <div style={s.statCard}><div style={s.statNum("#F76B8A")}>{stats.failed}</div><div style={s.statLabel}>Failed</div></div>
          <div style={s.statCard}><div style={s.statNum("#8890AA")}>{stats.pending}</div><div style={s.statLabel}>Pending</div></div>
          <div style={s.statCard}><div style={s.statNum("#F76B8A")}>{stats.criticalBugs}</div><div style={s.statLabel}>Critical Bugs Open</div></div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          {["runs", "bugs"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...s.btnSecondary, background: activeTab === tab ? "#6C5CE722" : "#181B2E", color: activeTab === tab ? "#A29BFE" : "#8890AA", border: `1px solid ${activeTab === tab ? "#6C5CE744" : "#252840"}` }}>
              {tab === "runs" ? `Test Runs (${runs.length})` : `Bug Reports (${bugs.length})`}
            </button>
          ))}
        </div>

        {/* Test Runs Table */}
        {activeTab === "runs" && (
          <div style={s.table}>
            <div style={s.tableHeader}>
              <span>Test Run</span><span>Type</span><span>Persona</span><span>Cases</span><span>Pass Rate</span><span>Status</span>
            </div>
            {loading ? <div style={{ padding: "40px", textAlign: "center", color: "#4A4F6A" }}>Loading…</div> :
             runs.map((run, i) => {
               const pct = run.total_cases > 0 ? Math.round((run.passed_cases / run.total_cases) * 100) : 0;
               return (
                 <div key={run.id} style={s.tableRow(i)}>
                   <div style={s.cell}>{TEST_TYPE_EMOJI[run.test_type] || "🧪"} {run.title}</div>
                   <div style={s.cell}><span style={s.badge()}>{run.test_type}</span></div>
                   <div style={s.cell}>{run.persona}</div>
                   <div style={s.cell}>{run.passed_cases}/{run.total_cases}</div>
                   <div style={{ ...s.cell, flexDirection: "column", alignItems: "flex-start" }}>
                     <span>{pct}%</span>
                     <div style={{ ...s.progressBar, width: "80px" }}><div style={s.progressFill(pct, "#00B894")} /></div>
                   </div>
                   <div style={s.cell}>
                     <select style={{ background: "#181B2E", border: "none", color: STATUS_COLORS[run.status], fontSize: "12px", fontWeight: "600", cursor: "pointer", outline: "none" }}
                       value={run.status} onChange={e => updateRunStatus(run.id, e.target.value)}>
                       {["Pending","In Progress","Passed","Failed","Blocked"].map(s => <option key={s}>{s}</option>)}
                     </select>
                   </div>
                 </div>
               );
             })}
          </div>
        )}

        {/* Bug Reports Table */}
        {activeTab === "bugs" && (
          <div style={s.table}>
            <div style={{ ...s.tableHeader, gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
              <span>Bug Title</span><span>Severity</span><span>Platform</span><span>Story</span><span>Status</span>
            </div>
            {loading ? <div style={{ padding: "40px", textAlign: "center", color: "#4A4F6A" }}>Loading…</div> :
             bugs.length === 0 ? <div style={{ padding: "40px", textAlign: "center", color: "#4A4F6A" }}>No bugs logged yet 🎉</div> :
             bugs.map((bug, i) => (
               <div key={bug.id} style={{ ...s.tableRow(i), gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
                 <div style={s.cell}>{bug.title}</div>
                 <div style={s.cell}><span style={s.badge(SEVERITY_COLORS[bug.severity])}>{bug.severity}</span></div>
                 <div style={s.cell}>{bug.platform}</div>
                 <div style={s.cell}>{bug.user_story}</div>
                 <div style={s.cell}>
                   <select style={{ background: "#181B2E", border: "none", color: STATUS_COLORS[bug.status] || "#8890AA", fontSize: "12px", fontWeight: "600", cursor: "pointer", outline: "none" }}
                     value={bug.status} onChange={e => updateBugStatus(bug.id, e.target.value)}>
                     {["Open","In Progress","Resolved","Wont Fix","Duplicate"].map(s => <option key={s}>{s}</option>)}
                   </select>
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* New Test Run Modal */}
      {showNewRun && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <h3 style={{ color: "#fff", marginBottom: "20px" }}>New Test Run</h3>
            <label style={s.label}>Title</label>
            <input style={s.input} value={newRun.title} onChange={e => setNewRun(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Customer App — Checkout Flow" />
            <label style={s.label}>Test Type</label>
            <select style={s.select} value={newRun.test_type} onChange={e => setNewRun(p => ({ ...p, test_type: e.target.value }))}>
              {["usability","integration","regression","load","a11y","e2e"].map(t => <option key={t}>{t}</option>)}
            </select>
            <label style={s.label}>Persona</label>
            <select style={s.select} value={newRun.persona} onChange={e => setNewRun(p => ({ ...p, persona: e.target.value }))}>
              {["Customer","Seller","Delivery Driver","Support Agent","Nutritionist","Engineering"].map(t => <option key={t}>{t}</option>)}
            </select>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={s.btnPrimary} onClick={createRun}>Create</button>
              <button style={s.btnSecondary} onClick={() => setShowNewRun(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New Bug Modal */}
      {showNewBug && (
        <div style={s.modal}>
          <div style={s.modalBox}>
            <h3 style={{ color: "#fff", marginBottom: "20px" }}>Log Bug Report</h3>
            <label style={s.label}>Title</label>
            <input style={s.input} value={newBug.title} onChange={e => setNewBug(p => ({ ...p, title: e.target.value }))} placeholder="Brief description of the bug" />
            <label style={s.label}>Severity</label>
            <select style={s.select} value={newBug.severity} onChange={e => setNewBug(p => ({ ...p, severity: e.target.value }))}>
              {["Critical","High","Medium","Low"].map(t => <option key={t}>{t}</option>)}
            </select>
            <label style={s.label}>Platform</label>
            <select style={s.select} value={newBug.platform} onChange={e => setNewBug(p => ({ ...p, platform: e.target.value }))}>
              {["Lovable","Replit","n8n","Supabase","Cross-platform"].map(t => <option key={t}>{t}</option>)}
            </select>
            <label style={s.label}>Description</label>
            <textarea style={{ ...s.input, minHeight: "70px", resize: "vertical" }} value={newBug.description} onChange={e => setNewBug(p => ({ ...p, description: e.target.value }))} placeholder="Steps to reproduce, expected vs actual…" />
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button style={s.btnPrimary} onClick={createBug}>Log Bug</button>
              <button style={s.btnSecondary} onClick={() => setShowNewBug(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
