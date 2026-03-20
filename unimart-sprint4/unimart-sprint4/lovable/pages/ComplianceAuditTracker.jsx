/**
 * UniMart Sprint 4 — Compliance Audit Tracker
 * US-14: Trust, Safety & Compliance Review
 * Deploy in Lovable as: /sprint4/compliance
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = ["All","Food Safety","Allergen","Data Privacy","Seller Terms","Community Standards","Refund Policy","AI Compliance","Fraud Controls"];
const STATUS_COLORS = { Pending: "#8890AA", Passed: "#00B894", Failed: "#F76B8A", "In Review": "#F7A954", "N/A": "#4A4F6A" };
const SEVERITY_COLORS = { Critical: "#F76B8A", High: "#F7A954", Medium: "#5B8AF7", Low: "#00B894" };

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:  { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge:   (color) => ({ background: (color||"#6C5CE7")+"22", color: color||"#A29BFE", border: `1px solid ${(color||"#6C5CE7")}44`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }),
  body:    { padding: "28px 32px" },
  statsRow:{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "14px", marginBottom: "24px" },
  statCard:{ background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "12px", padding: "16px 18px" },
  statNum: (c) => ({ fontSize: "26px", fontWeight: "800", color: c }),
  statLabel:{ fontSize: "12px", color: "#6B7090", marginTop: "2px" },
  filterRow:{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  chip:    (active) => ({ background: active ? "#6C5CE722" : "#181B2E", color: active ? "#A29BFE" : "#6B7090", border: `1px solid ${active ? "#6C5CE744" : "#252840"}`, borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }),
  table:   { background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "14px", overflow: "hidden" },
  tHeader: { display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 20px", borderBottom: "1px solid #181B2E", fontSize: "11px", fontWeight: "700", color: "#6B7090", letterSpacing: "1px", textTransform: "uppercase" },
  tRow:    (i) => ({ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "14px 20px", borderBottom: "1px solid #0F1220", background: i % 2 === 0 ? "transparent" : "#0A0C14" }),
  cell:    { fontSize: "13px", color: "#C4C8E0", display: "flex", alignItems: "center" },
};

export default function ComplianceAuditTracker() {
  const [items, setItems]   = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("compliance_audit_items").select("*").order("severity");
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function updateStatus(id, status) {
    await supabase.from("compliance_audit_items").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    setItems(p => p.map(i => i.id === id ? { ...i, status } : i));
  }

  const filtered = filter === "All" ? items : items.filter(i => i.category === filter);
  const stats = {
    total:    items.length,
    passed:   items.filter(i => i.status === "Passed").length,
    failed:   items.filter(i => i.status === "Failed").length,
    pending:  items.filter(i => i.status === "Pending").length,
    critical: items.filter(i => i.severity === "Critical" && i.status !== "Passed").length,
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart</span>
          <span style={s.badge()}>Compliance Audit · US-14 · Sprint 4</span>
        </div>
        <span style={{ fontSize: "13px", color: stats.critical > 0 ? "#F76B8A" : "#00B894", fontWeight: "600" }}>
          {stats.critical > 0 ? `⚠️ ${stats.critical} critical items unresolved` : "✓ No critical violations"}
        </span>
      </div>

      <div style={s.body}>
        <div style={s.statsRow}>
          <div style={s.statCard}><div style={s.statNum("#fff")}>{stats.total}</div><div style={s.statLabel}>Total Items</div></div>
          <div style={s.statCard}><div style={s.statNum("#00B894")}>{stats.passed}</div><div style={s.statLabel}>Passed</div></div>
          <div style={s.statCard}><div style={s.statNum("#F76B8A")}>{stats.failed}</div><div style={s.statLabel}>Failed</div></div>
          <div style={s.statCard}><div style={s.statNum("#8890AA")}>{stats.pending}</div><div style={s.statLabel}>Pending Review</div></div>
          <div style={s.statCard}><div style={s.statNum("#F76B8A")}>{stats.critical}</div><div style={s.statLabel}>Critical Unresolved</div></div>
        </div>

        <div style={s.filterRow}>
          {CATEGORIES.map(c => <span key={c} style={s.chip(filter === c)} onClick={() => setFilter(c)}>{c}</span>)}
        </div>

        <div style={s.table}>
          <div style={s.tHeader}><span>Audit Item</span><span>Category</span><span>Severity</span><span>Owner</span><span>Status</span></div>
          {loading ? <div style={{ padding: "40px", textAlign: "center", color: "#4A4F6A" }}>Loading…</div> :
           filtered.map((item, i) => (
            <div key={item.id} style={s.tRow(i)}>
              <div style={{ ...s.cell, flexDirection: "column", alignItems: "flex-start", gap: "2px" }}>
                <span style={{ fontWeight: "600" }}>{item.title}</span>
                <span style={{ fontSize: "11px", color: "#6B7090" }}>{item.description?.substring(0, 60)}…</span>
              </div>
              <div style={s.cell}><span style={s.badge()}>{item.category}</span></div>
              <div style={s.cell}><span style={s.badge(SEVERITY_COLORS[item.severity])}>{item.severity}</span></div>
              <div style={s.cell}>{item.owner}</div>
              <div style={s.cell}>
                <select style={{ background: "#181B2E", border: "none", color: STATUS_COLORS[item.status], fontSize: "12px", fontWeight: "600", cursor: "pointer", outline: "none" }}
                  value={item.status} onChange={e => updateStatus(item.id, e.target.value)}>
                  {["Pending","Passed","Failed","In Review","N/A"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
