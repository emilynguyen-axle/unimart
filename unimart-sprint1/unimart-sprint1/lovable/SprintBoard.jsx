/**
 * UniMart Sprint 1 — Kanban Sprint Board
 * US-02: Agile Team Formation & Project Infrastructure
 *
 * Deploy in Lovable as a page/route.
 * Connects to Supabase for live ticket data.
 */

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const COLUMNS = ["Backlog", "To Do", "In Progress", "Review", "Done"];

const COLUMN_COLORS = {
  "Backlog": "#3A3E52",
  "To Do": "#3A4A6B",
  "In Progress": "#4A3A6B",
  "Review": "#3A5A6B",
  "Done": "#1A4A3A",
};

const COLUMN_ACCENT = {
  "Backlog": "#8890AA",
  "To Do": "#5B8AF7",
  "In Progress": "#A89DF7",
  "Review": "#F7A954",
  "Done": "#54C09E",
};

const SQUADS = ["UX Research", "Core Dev", "AI Integration", "Growth/Marketing", "Legal/Compliance"];

const SQUAD_COLORS = {
  "UX Research": "#F76B8A",
  "Core Dev": "#5B8AF7",
  "AI Integration": "#A89DF7",
  "Growth/Marketing": "#F7A954",
  "Legal/Compliance": "#54C09E",
};

const PRIORITY_COLORS = { High: "#F76B8A", Medium: "#F7A954", Low: "#54C09E" };

export default function SprintBoard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", squad: SQUADS[0], priority: "Medium" });
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    setLoading(true);
    const { data } = await supabase
      .from("sprint_tickets")
      .select("*")
      .eq("sprint", 1)
      .order("created_at", { ascending: true });
    setTickets(data || []);
    setLoading(false);
  }

  async function moveTicket(ticketId, newStatus) {
    await supabase
      .from("sprint_tickets")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", ticketId);
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );
  }

  async function createTicket() {
    if (!newTicket.title.trim()) return;
    const ticket = {
      title: newTicket.title,
      squad: newTicket.squad,
      priority: newTicket.priority,
      status: "Backlog",
      sprint: 1,
      epic: "EP-01",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data } = await supabase.from("sprint_tickets").insert(ticket).select().single();
    if (data) setTickets((prev) => [...prev, data]);
    setNewTicket({ title: "", squad: SQUADS[0], priority: "Medium" });
    setShowNewTicket(false);
  }

  const filteredTickets = filter === "All"
    ? tickets
    : tickets.filter((t) => t.squad === filter);

  const getColumn = (status) => filteredTickets.filter((t) => t.status === status);

  const velocity = {
    total: tickets.length,
    done: tickets.filter((t) => t.status === "Done").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0F1117", minHeight: "100vh", color: "#E8EAF0" }}>
      {/* Header */}
      <div style={{ background: "#13161F", borderBottom: "1px solid #1E2130", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "20px", fontWeight: "700", color: "#7C6AF7" }}>UniMart</span>
          <span style={{ fontSize: "13px", color: "#5A5F7A" }}>Sprint 1 Board</span>
          <span style={{ background: "#7C6AF722", color: "#A89DF7", border: "1px solid #7C6AF744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" }}>
            US-02 · Team Formation
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Velocity chips */}
          <span style={{ fontSize: "12px", color: "#8890AA" }}>
            Velocity: <strong style={{ color: "#54C09E" }}>{velocity.done}</strong>/{velocity.total} done
          </span>
          <button
            onClick={() => setShowNewTicket(true)}
            style={{ background: "linear-gradient(135deg, #7C6AF7, #9B8BF7)", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
          >
            + Add Ticket
          </button>
        </div>
      </div>

      {/* Squad filter */}
      <div style={{ padding: "16px 32px 0", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["All", ...SQUADS].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              background: filter === s ? (SQUAD_COLORS[s] || "#7C6AF7") + "22" : "#1A1D2E",
              color: filter === s ? (SQUAD_COLORS[s] || "#7C6AF7") : "#6B7290",
              border: `1px solid ${filter === s ? (SQUAD_COLORS[s] || "#7C6AF7") + "44" : "#2A2D3E"}`,
              borderRadius: "20px",
              padding: "5px 14px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Board */}
      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px", overflowX: "auto" }}>
        {COLUMNS.map((col) => (
          <div
            key={col}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dragging && moveTicket(dragging, col)}
            style={{ background: "#13161F", border: `1px solid ${COLUMN_COLORS[col]}55`, borderRadius: "12px", padding: "14px", minHeight: "400px" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: COLUMN_ACCENT[col], textTransform: "uppercase", letterSpacing: "1px" }}>{col}</span>
              <span style={{ fontSize: "12px", background: COLUMN_COLORS[col], color: "#E8EAF0", borderRadius: "10px", padding: "2px 8px" }}>
                {getColumn(col).length}
              </span>
            </div>
            {loading ? (
              <div style={{ color: "#3A3E52", fontSize: "13px", textAlign: "center", paddingTop: "40px" }}>Loading…</div>
            ) : (
              getColumn(col).map((ticket) => (
                <div
                  key={ticket.id}
                  draggable
                  onDragStart={() => setDragging(ticket.id)}
                  onDragEnd={() => setDragging(null)}
                  style={{
                    background: "#0F1117",
                    border: "1px solid #1E2130",
                    borderRadius: "10px",
                    padding: "12px",
                    marginBottom: "10px",
                    cursor: "grab",
                    borderLeft: `3px solid ${SQUAD_COLORS[ticket.squad] || "#7C6AF7"}`,
                    opacity: dragging === ticket.id ? 0.5 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#D0D4E8", marginBottom: "8px", lineHeight: "1.4" }}>{ticket.title}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "11px", color: SQUAD_COLORS[ticket.squad] || "#6B7290", fontWeight: "600" }}>
                      {ticket.squad}
                    </span>
                    <span style={{ fontSize: "11px", color: PRIORITY_COLORS[ticket.priority] || "#8890AA", fontWeight: "600" }}>
                      {ticket.priority}
                    </span>
                  </div>
                  {ticket.epic && (
                    <div style={{ fontSize: "11px", color: "#3A3E52", marginTop: "4px" }}>{ticket.epic}</div>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div style={{ position: "fixed", inset: 0, background: "#00000088", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#13161F", border: "1px solid #2A2D3E", borderRadius: "16px", padding: "28px", width: "420px" }}>
            <h3 style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>New Ticket</h3>
            <label style={{ fontSize: "12px", color: "#6B7290", display: "block", marginBottom: "6px" }}>Title</label>
            <input
              style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: "8px", color: "#D0D4E8", fontSize: "14px", padding: "10px 12px", marginBottom: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              placeholder="Ticket title…"
              value={newTicket.title}
              onChange={(e) => setNewTicket((p) => ({ ...p, title: e.target.value }))}
            />
            <label style={{ fontSize: "12px", color: "#6B7290", display: "block", marginBottom: "6px" }}>Squad</label>
            <select
              style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: "8px", color: "#D0D4E8", fontSize: "14px", padding: "10px 12px", marginBottom: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              value={newTicket.squad}
              onChange={(e) => setNewTicket((p) => ({ ...p, squad: e.target.value }))}
            >
              {SQUADS.map((s) => <option key={s}>{s}</option>)}
            </select>
            <label style={{ fontSize: "12px", color: "#6B7290", display: "block", marginBottom: "6px" }}>Priority</label>
            <select
              style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2D3E", borderRadius: "8px", color: "#D0D4E8", fontSize: "14px", padding: "10px 12px", marginBottom: "20px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              value={newTicket.priority}
              onChange={(e) => setNewTicket((p) => ({ ...p, priority: e.target.value }))}
            >
              {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={createTicket} style={{ flex: 1, background: "linear-gradient(135deg, #7C6AF7, #9B8BF7)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                Create Ticket
              </button>
              <button onClick={() => setShowNewTicket(false)} style={{ flex: 1, background: "#1A1D2E", color: "#8890AA", border: "1px solid #2A2D3E", borderRadius: "8px", padding: "10px", fontSize: "14px", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
