/**
 * UniMart Sprint 4 — Sprint Retrospective Board
 * US-15: Sprint Review, Retrospective & Stakeholder Handoff
 * Deploy in Lovable as: /sprint4/retrospective
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const CATEGORIES = [
  { id: "went_well",    label: "✅ Went Well",     color: "#00B894", bg: "#003D2E" },
  { id: "to_improve",  label: "🔧 To Improve",    color: "#F7A954", bg: "#3A2A0D" },
  { id: "action_items",label: "📋 Action Items",   color: "#5B8AF7", bg: "#0D1A3A" },
  { id: "shoutouts",   label: "🌟 Shoutouts",      color: "#A29BFE", bg: "#12102A" },
];

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:  { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge:   { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  body:    { padding: "28px 32px" },
  grid:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" },
  col:     (color) => ({ background: "#0D0F1C", border: `1px solid ${color}33`, borderRadius: "14px", padding: "16px", minHeight: "500px" }),
  colTitle:(color) => ({ fontSize: "14px", fontWeight: "700", color, marginBottom: "16px" }),
  card:    (color, bg) => ({ background: bg, border: `1px solid ${color}33`, borderRadius: "10px", padding: "12px 14px", marginBottom: "10px" }),
  cardText:{ fontSize: "13px", color: "#E2E4EF", lineHeight: "1.5", marginBottom: "8px" },
  cardMeta:{ display: "flex", alignItems: "center", justifyContent: "space-between" },
  voteBtn: (color) => ({ background: "none", border: `1px solid ${color}44`, borderRadius: "6px", color, padding: "3px 10px", fontSize: "12px", cursor: "pointer" }),
  addInput:{ width: "100%", background: "#090B12", border: "1px solid #1C2035", borderRadius: "8px", color: "#E2E4EF", fontSize: "13px", padding: "8px 12px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", minHeight: "60px" },
  addBtn:  (color) => ({ background: color+"22", color, border: `1px solid ${color}44`, borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginTop: "8px", width: "100%" }),
  statusChip:(status) => {
    const colors = { Open: "#8890AA", "In Progress": "#5B8AF7", Done: "#00B894" };
    return { fontSize: "11px", color: colors[status]||"#8890AA", fontWeight: "600" };
  },
};

export default function RetrospectiveBoard() {
  const [items, setItems]   = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("retrospective_items").select("*").eq("sprint", 4).order("votes", { ascending: false });
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function addItem(category, color) {
    const content = inputs[category]?.trim();
    if (!content) return;
    const { data } = await supabase.from("retrospective_items").insert({ sprint: 4, category, content, votes: 0, status: "Open" }).select().single();
    if (data) { setItems(p => [...p, data]); setInputs(p => ({ ...p, [category]: "" })); }
  }

  async function vote(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    await supabase.from("retrospective_items").update({ votes: item.votes + 1 }).eq("id", id);
    setItems(p => p.map(i => i.id === id ? { ...i, votes: i.votes + 1 } : i));
  }

  async function updateStatus(id, status) {
    await supabase.from("retrospective_items").update({ status }).eq("id", id);
    setItems(p => p.map(i => i.id === id ? { ...i, status } : i));
  }

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart</span>
          <span style={s.badge}>Sprint 4 Retrospective · US-15</span>
        </div>
        <span style={{ fontSize: "13px", color: "#6B7090" }}>
          {items.filter(i => i.category === "action_items" && i.status === "Done").length}/{items.filter(i => i.category === "action_items").length} action items done
        </span>
      </div>

      <div style={s.body}>
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>Sprint 4 Retrospective</div>
          <div style={{ fontSize: "14px", color: "#6B7090" }}>What went well? What can we improve? What are our action items?</div>
        </div>

        {loading ? <div style={{ textAlign: "center", color: "#4A4F6A", padding: "60px" }}>Loading…</div> : (
          <div style={s.grid}>
            {CATEGORIES.map(cat => {
              const catItems = items.filter(i => i.category === cat.id).sort((a, b) => b.votes - a.votes);
              return (
                <div key={cat.id} style={s.col(cat.color)}>
                  <div style={s.colTitle(cat.color)}>{cat.label} ({catItems.length})</div>

                  {catItems.map(item => (
                    <div key={item.id} style={s.card(cat.color, cat.bg)}>
                      <div style={s.cardText}>{item.content}</div>
                      <div style={s.cardMeta}>
                        <button style={s.voteBtn(cat.color)} onClick={() => vote(item.id)}>👍 {item.votes}</button>
                        {cat.id === "action_items" && (
                          <select style={{ background: "none", border: "none", fontSize: "11px", cursor: "pointer", outline: "none" }}
                            value={item.status} onChange={e => updateStatus(item.id, e.target.value)}>
                            {["Open","In Progress","Done"].map(s => <option key={s}>{s}</option>)}
                          </select>
                        )}
                        {cat.id !== "action_items" && <span style={s.statusChip(item.status)}>{item.status}</span>}
                      </div>
                    </div>
                  ))}

                  <textarea
                    style={s.addInput}
                    placeholder={`Add ${cat.label.toLowerCase()} item…`}
                    value={inputs[cat.id] || ""}
                    onChange={e => setInputs(p => ({ ...p, [cat.id]: e.target.value }))}
                  />
                  <button style={s.addBtn(cat.color)} onClick={() => addItem(cat.id, cat.color)}>+ Add</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
