/**
 * UniMart Sprint 2 — Support Agent Dashboard
 * US-06: Returns, Refunds & Customer Support UX
 *
 * Deploy in Lovable as a page/route: /support/dashboard
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const VERTICALS = ["All", "Shop", "Meal Kits", "Food Delivery"];
const STATUSES  = ["All", "Open", "In Progress", "Resolved", "Escalated"];

const VERTICAL_COLORS = {
  "Shop":          { bg: "#1A2A4A", accent: "#5B8AF7", text: "#7EB3FF" },
  "Meal Kits":     { bg: "#1A3A2A", accent: "#00B894", text: "#55D4A8" },
  "Food Delivery": { bg: "#3A2A1A", accent: "#F7A954", text: "#FFD08A" },
};

const AI_RESPONSES = {
  "Wrong Item":         "Hi {name}, I'm sorry to hear you received the wrong item. I've raised a replacement order for you — it should arrive within {sla}. You don't need to return the incorrect item. Is there anything else I can help with?",
  "Missing Ingredient": "Hi {name}, I apologise for the missing ingredient in your meal kit. I've arranged a full refund for the affected portion. Your refund should appear within 3–5 business days.",
  "Cold Food":          "Hi {name}, I'm sorry your food arrived cold — that's not the experience we want for you. I've issued a full refund for this order, which will appear within 24 hours.",
  "Late Delivery":      "Hi {name}, I can see your delivery was delayed and I sincerely apologise. I've applied a delivery credit to your account as a goodwill gesture.",
  "Refund Request":     "Hi {name}, I've reviewed your refund request and can confirm it's been approved. You should see the refund of {amount} within 3–5 business days.",
};

const SLA_MAP = {
  "Shop":          { "Wrong Item": "48h", "Late Delivery": "72h", "Refund Request": "48h" },
  "Meal Kits":     { "Missing Ingredient": "24h", "Late Delivery": "24h", "Wrong Item": "24h" },
  "Food Delivery": { "Cold Food": "4h", "Late Delivery": "4h", "Wrong Item": "4h" },
};

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header: { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo: { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge: { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  layout: { display: "grid", gridTemplateColumns: "1fr 380px", minHeight: "calc(100vh - 56px)" },
  left: { padding: "24px 32px", borderRight: "1px solid #181B2E" },
  right: { padding: "24px", background: "#0D0F1C" },
  filterRow: { display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" },
  chip: (active, color) => ({ background: active ? (color || "#6C5CE7") + "22" : "#181B2E", color: active ? (color || "#A29BFE") : "#6B7090", border: `1px solid ${active ? (color || "#6C5CE7") + "44" : "#252840"}`, borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }),
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" },
  statCard: (accent) => ({ background: "#0D0F1C", border: `1px solid ${accent}33`, borderRadius: "10px", padding: "14px 16px" }),
  statNum: (accent) => ({ fontSize: "22px", fontWeight: "700", color: accent }),
  statLabel: { fontSize: "11px", color: "#6B7090", marginTop: "2px" },
  ticketCard: (selected, vertical) => {
    const vc = VERTICAL_COLORS[vertical] || { bg: "#181B2E", accent: "#6C5CE7" };
    return { background: selected ? vc.bg : "#0D0F1C", border: `1px solid ${selected ? vc.accent + "55" : "#181B2E"}`, borderRadius: "10px", padding: "14px 16px", marginBottom: "8px", cursor: "pointer", borderLeft: `3px solid ${vc.accent}`, transition: "all 0.15s" };
  },
  ticketTitle: { fontSize: "13px", fontWeight: "600", color: "#E2E4EF", marginBottom: "4px" },
  ticketMeta: { fontSize: "11px", color: "#6B7090", display: "flex", gap: "10px" },
  statusChip: (status) => {
    const colors = { Open: "#F76B8A", "In Progress": "#A29BFE", Resolved: "#00B894", Escalated: "#F7A954" };
    return { fontSize: "11px", fontWeight: "600", color: colors[status] || "#6B7090" };
  },
  detailTitle: { fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "4px" },
  detailSub: { fontSize: "12px", color: "#6B7090", marginBottom: "20px" },
  sectionLabel: { fontSize: "11px", fontWeight: "700", color: "#6B7090", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", marginTop: "16px" },
  aiBox: { background: "#12102A", border: "1px solid #6C5CE733", borderRadius: "10px", padding: "14px", fontSize: "13px", color: "#C4B5FF", lineHeight: "1.6", marginBottom: "16px" },
  flowStep: (active) => ({ background: active ? "#6C5CE722" : "#181B2E", border: `1px solid ${active ? "#6C5CE7" : "#252840"}`, borderRadius: "8px", padding: "10px 14px", marginBottom: "6px", fontSize: "13px", color: active ? "#A29BFE" : "#6B7090" }),
  actionBtn: (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginRight: "8px" }),
  emptyState: { textAlign: "center", padding: "60px 20px", color: "#4A4F6A" },
};

const RESOLUTION_FLOWS = {
  "Shop":          ["1. Verify order details in system", "2. Confirm wrong item report with photo", "3. Raise replacement order or approve refund", "4. Notify customer with ETA or refund timeline", "5. Close ticket with resolution notes"],
  "Meal Kits":     ["1. Verify meal kit delivery date", "2. Identify missing ingredient impact on recipe", "3. Approve partial or full refund based on impact", "4. Log ingredient gap for supplier quality review", "5. Close ticket within 24h SLA"],
  "Food Delivery": ["1. Verify delivery timestamp and driver notes", "2. Assess cold food or wrong item report", "3. Issue immediate refund or reorder at discretion", "4. Flag restaurant or driver if pattern detected", "5. Close ticket within 4h SLA"],
};

export default function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterVertical, setFilterVertical] = useState("All");
  const [filterStatus, setFilterStatus]     = useState("All");

  useEffect(() => { loadTickets(); }, []);

  async function loadTickets() {
    setLoading(true);
    const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  async function updateStatus(ticketId, status) {
    await supabase.from("support_tickets").update({ status, updated_at: new Date().toISOString() }).eq("id", ticketId);
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status } : t));
    if (selected?.id === ticketId) setSelected((p) => ({ ...p, status }));
  }

  const filtered = tickets.filter((t) => {
    if (filterVertical !== "All" && t.vertical !== filterVertical) return false;
    if (filterStatus   !== "All" && t.status   !== filterStatus)   return false;
    return true;
  });

  const stats = {
    open:       tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved:   tickets.filter((t) => t.status === "Resolved").length,
    escalated:  tickets.filter((t) => t.status === "Escalated").length,
  };

  const getAIResponse = (ticket) => {
    const template = AI_RESPONSES[ticket.issue_type] || "Hi {name}, thank you for reaching out. I'm reviewing your case now and will update you shortly.";
    const sla = SLA_MAP[ticket.vertical]?.[ticket.issue_type] || "shortly";
    return template.replace("{name}", "there").replace("{sla}", sla).replace("{amount}", "the applicable amount");
  };

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart</span>
          <span style={s.badge}>Support Dashboard · US-06</span>
        </div>
        <span style={{ fontSize: "13px", color: "#6B7090" }}>{tickets.length} total tickets</span>
      </div>

      <div style={s.layout}>
        {/* Left — Ticket List */}
        <div style={s.left}>
          {/* Stats */}
          <div style={s.statsRow}>
            <div style={s.statCard("#F76B8A")}><div style={s.statNum("#F76B8A")}>{stats.open}</div><div style={s.statLabel}>Open</div></div>
            <div style={s.statCard("#A29BFE")}><div style={s.statNum("#A29BFE")}>{stats.inProgress}</div><div style={s.statLabel}>In Progress</div></div>
            <div style={s.statCard("#00B894")}><div style={s.statNum("#00B894")}>{stats.resolved}</div><div style={s.statLabel}>Resolved</div></div>
            <div style={s.statCard("#F7A954")}><div style={s.statNum("#F7A954")}>{stats.escalated}</div><div style={s.statLabel}>Escalated</div></div>
          </div>

          {/* Filters */}
          <div style={s.filterRow}>
            {VERTICALS.map((v) => <span key={v} style={s.chip(filterVertical === v, VERTICAL_COLORS[v]?.accent)} onClick={() => setFilterVertical(v)}>{v}</span>)}
            <span style={{ width: "1px", background: "#252840", margin: "0 4px" }} />
            {STATUSES.map((st) => <span key={st} style={s.chip(filterStatus === st)} onClick={() => setFilterStatus(st)}>{st}</span>)}
          </div>

          {/* Ticket List */}
          {loading ? <div style={s.emptyState}>Loading tickets…</div> :
           filtered.length === 0 ? <div style={s.emptyState}>No tickets match this filter.</div> :
           filtered.map((ticket) => (
            <div key={ticket.id} style={s.ticketCard(selected?.id === ticket.id, ticket.vertical)} onClick={() => setSelected(ticket)}>
              <div style={s.ticketTitle}>{ticket.issue_type} — {ticket.vertical}</div>
              <div style={s.ticketMeta}>
                <span>{ticket.customer_email || "Anonymous"}</span>
                <span>SLA: {ticket.sla_hours}h</span>
                <span style={s.statusChip(ticket.status)}>{ticket.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right — Ticket Detail */}
        <div style={s.right}>
          {!selected ? (
            <div style={s.emptyState}><div style={{ fontSize: "32px", marginBottom: "12px" }}>🎧</div><div>Select a ticket to view details</div></div>
          ) : (
            <>
              <div style={s.detailTitle}>{selected.issue_type}</div>
              <div style={s.detailSub}>{selected.vertical} · {selected.customer_email} · SLA: {selected.sla_hours}h</div>

              <div style={s.sectionLabel}>Resolution Flow — {selected.vertical}</div>
              {(RESOLUTION_FLOWS[selected.vertical] || []).map((step, i) => (
                <div key={i} style={s.flowStep(i === 0)}>{step}</div>
              ))}

              <div style={s.sectionLabel}>AI Suggested Response</div>
              <div style={s.aiBox}>{getAIResponse(selected)}</div>

              <div style={s.sectionLabel}>Actions</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <button style={s.actionBtn("#A29BFE")} onClick={() => updateStatus(selected.id, "In Progress")}>Mark In Progress</button>
                <button style={s.actionBtn("#00B894")} onClick={() => updateStatus(selected.id, "Resolved")}>Resolve</button>
                <button style={s.actionBtn("#F7A954")} onClick={() => updateStatus(selected.id, "Escalated")}>Escalate</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
