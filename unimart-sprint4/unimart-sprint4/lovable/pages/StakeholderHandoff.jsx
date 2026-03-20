/**
 * UniMart Sprint 4 — Stakeholder Handoff Document Generator
 * US-15: Sprint Review, Retrospective & Stakeholder Handoff
 * Deploy in Lovable as: /sprint4/handoff
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SECTIONS = ["Executive Summary","Platform Handoff","AI Features","Risk Register","Next Phase","Appendix"];
const STATUS_COLORS = { Draft: "#8890AA", "In Review": "#F7A954", Approved: "#00B894" };

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:  { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge:   { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  layout:  { display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "calc(100vh - 56px)" },
  sidebar: { background: "#0A0C14", borderRight: "1px solid #181B2E", padding: "20px 0" },
  navItem: (active) => ({ padding: "10px 20px", cursor: "pointer", fontSize: "13px", fontWeight: active ? "600" : "400", color: active ? "#6C5CE7" : "#6B7090", background: active ? "#6C5CE710" : "transparent", borderLeft: `3px solid ${active ? "#6C5CE7" : "transparent"}` }),
  main:    { padding: "28px 32px" },
  sectionTitle: { fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" },
  itemCard:(status) => ({ background: "#0D0F1C", border: `1px solid ${STATUS_COLORS[status]||"#181B2E"}33`, borderRadius: "12px", padding: "20px", marginBottom: "14px" }),
  itemTitle: { fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  itemContent: { fontSize: "13px", color: "#8890AA", lineHeight: "1.7", whiteSpace: "pre-wrap" },
  statusChip: (status) => ({ background: (STATUS_COLORS[status]||"#8890AA")+"22", color: STATUS_COLORS[status]||"#8890AA", border: `1px solid ${(STATUS_COLORS[status]||"#8890AA")}44`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }),
  progressBar: { background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "12px", padding: "18px 20px", marginBottom: "24px" },
  progLabel: { fontSize: "13px", color: "#8890AA", marginBottom: "10px" },
  progTrack: { height: "8px", background: "#181B2E", borderRadius: "4px", overflow: "hidden" },
  progFill: (pct) => ({ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#6C5CE7,#00B894)", borderRadius: "4px", transition: "width 0.4s" }),
  exportBtn: { background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "#fff", border: "none", borderRadius: "10px", padding: "10px 22px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
};

export default function StakeholderHandoff() {
  const [items, setItems]     = useState([]);
  const [section, setSection] = useState("Executive Summary");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("handoff_items").select("*").order("section");
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function cycleStatus(id, current) {
    const next = current === "Draft" ? "In Review" : current === "In Review" ? "Approved" : "Draft";
    await supabase.from("handoff_items").update({ status: next, ...(next === "Approved" ? { approved_at: new Date().toISOString() } : {}) }).eq("id", id);
    setItems(p => p.map(i => i.id === id ? { ...i, status: next } : i));
  }

  const sectionItems = items.filter(i => i.section === section);
  const approvedCount = items.filter(i => i.status === "Approved").length;
  const totalCount    = items.length;
  const pct           = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  function exportMarkdown() {
    const md = SECTIONS.map(sec => {
      const secItems = items.filter(i => i.section === sec);
      return `# ${sec}\n\n` + secItems.map(i => `## ${i.title}\n\n${i.content}\n`).join("\n");
    }).join("\n---\n\n");
    const blob = new Blob([md], { type: "text/markdown" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "UniMart_Handoff_Document.md"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart</span>
          <span style={s.badge}>Stakeholder Handoff · US-15 · Sprint 4</span>
        </div>
        <button style={s.exportBtn} onClick={exportMarkdown}>⬇ Export as Markdown</button>
      </div>

      <div style={s.layout}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          <div style={{ padding: "0 20px 16px", fontSize: "11px", fontWeight: "700", color: "#4A4F6A", letterSpacing: "1px", textTransform: "uppercase" }}>Sections</div>
          {SECTIONS.map(sec => {
            const secItems = items.filter(i => i.section === sec);
            const secApproved = secItems.filter(i => i.status === "Approved").length;
            return (
              <div key={sec} style={s.navItem(section === sec)} onClick={() => setSection(sec)}>
                {sec}
                <span style={{ fontSize: "11px", color: secApproved === secItems.length && secItems.length > 0 ? "#00B894" : "#4A4F6A", marginLeft: "6px" }}>
                  {secApproved}/{secItems.length}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main */}
        <div style={s.main}>
          {/* Progress */}
          <div style={s.progressBar}>
            <div style={s.progLabel}>Overall Handoff Approval Progress — {approvedCount}/{totalCount} items approved ({pct}%)</div>
            <div style={s.progTrack}><div style={s.progFill(pct)} /></div>
          </div>

          <div style={s.sectionTitle}>{section}</div>

          {loading ? <div style={{ color: "#4A4F6A" }}>Loading…</div> :
           sectionItems.map(item => (
            <div key={item.id} style={s.itemCard(item.status)}>
              <div style={s.itemTitle}>
                <span>{item.title}</span>
                <span style={s.statusChip(item.status)} onClick={() => cycleStatus(item.id, item.status)}>
                  {item.status} {item.status === "Approved" ? "✓" : "→"}
                </span>
              </div>
              <div style={s.itemContent}>{item.content}</div>
              {item.approved_at && (
                <div style={{ fontSize: "11px", color: "#4A4F6A", marginTop: "8px" }}>
                  Approved {new Date(item.approved_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}

          {pct === 100 && (
            <div style={{ background: "#003D2E", border: "1px solid #00B89444", borderRadius: "12px", padding: "20px", textAlign: "center", marginTop: "20px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎉</div>
              <div style={{ fontSize: "18px", fontWeight: "700", color: "#00B894", marginBottom: "4px" }}>Handoff Complete!</div>
              <div style={{ fontSize: "13px", color: "#6B9080" }}>All sections approved. UniMart Sprint 4 is officially closed.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
