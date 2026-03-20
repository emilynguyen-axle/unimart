/**
 * UniMart Sprint 2 — AI Architecture Blueprint Dashboard
 * US-04: AI Integration Design & Architecture
 *
 * Deploy in Lovable as: /sprint2/ai-architecture
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PLATFORM_COLORS = { Replit: "#5B8AF7", "n8n": "#F7A954", Lovable: "#A29BFE" };
const STATUS_COLORS   = { Designing: "#F7A954", "In Review": "#5B8AF7", Approved: "#00B894", Building: "#A29BFE" };

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header: { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", gap: "14px" },
  logo: { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge: { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  body: { padding: "32px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px" },
  card: (selected) => ({ background: selected ? "#12102A" : "#0D0F1C", border: `1px solid ${selected ? "#6C5CE7" : "#181B2E"}`, borderRadius: "14px", padding: "22px", cursor: "pointer", transition: "all 0.15s" }),
  cardHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#fff" },
  platformBadge: (platform) => ({ background: (PLATFORM_COLORS[platform] || "#6C5CE7") + "22", color: PLATFORM_COLORS[platform] || "#A29BFE", border: `1px solid ${(PLATFORM_COLORS[platform] || "#6C5CE7")}44`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "700" }),
  statusBadge: (status) => ({ background: (STATUS_COLORS[status] || "#6B7090") + "22", color: STATUS_COLORS[status] || "#6B7090", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }),
  desc: { fontSize: "13px", color: "#6B7090", lineHeight: "1.5", marginBottom: "14px" },
  threshold: { background: "#181B2E", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", color: "#8890AA", borderLeft: "3px solid #6C5CE7" },
  sectionLabel: { fontSize: "11px", fontWeight: "700", color: "#6B7090", letterSpacing: "1px", textTransform: "uppercase", margin: "16px 0 8px" },
  flowBox: { background: "#181B2E", borderRadius: "10px", padding: "14px", marginBottom: "12px" },
  flowRow: { display: "flex", gap: "8px", marginBottom: "6px", alignItems: "flex-start" },
  flowKey: { fontSize: "11px", fontWeight: "700", color: "#A29BFE", minWidth: "80px", paddingTop: "2px" },
  flowVal: { fontSize: "12px", color: "#8890AA", lineHeight: "1.5" },
  endpointRow: { background: "#181B2E", borderRadius: "8px", padding: "10px 12px", marginBottom: "6px", display: "flex", gap: "10px", alignItems: "center" },
  method: (m) => ({ fontSize: "11px", fontWeight: "700", color: m === "GET" ? "#00B894" : m === "POST" ? "#5B8AF7" : "#F7A954", minWidth: "36px" }),
  endpointPath: { fontSize: "12px", color: "#C4C8E0", fontFamily: "monospace" },
  approveBtn: { background: "linear-gradient(135deg, #6C5CE7, #A29BFE)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginTop: "16px" },
  modal: { position: "fixed", inset: 0, background: "#00000099", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "40px 20px" },
  modalBox: { background: "#0D0F1C", border: "1px solid #252840", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "680px" },
  closeBtn: { background: "#181B2E", color: "#8890AA", border: "none", borderRadius: "6px", padding: "6px 14px", fontSize: "13px", cursor: "pointer", float: "right" },
};

export default function AIArchitectureDashboard() {
  const [blueprints, setBlueprints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("ai_blueprints").select("*").order("feature");
      setBlueprints(data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function approveBlueprint(id) {
    await supabase.from("ai_blueprints").update({ status: "Approved", approved_by: "Engineering Lead", updated_at: new Date().toISOString() }).eq("id", id);
    setBlueprints((prev) => prev.map((b) => b.id === id ? { ...b, status: "Approved" } : b));
    if (selected?.id === id) setSelected((p) => ({ ...p, status: "Approved" }));
  }

  const approved   = blueprints.filter((b) => b.status === "Approved").length;
  const total      = blueprints.length;

  return (
    <div style={s.root}>
      <div style={s.header}>
        <span style={s.logo}>UniMart</span>
        <span style={s.badge}>AI Architecture · US-04 · Sprint 2</span>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#6B7090" }}>
          {approved}/{total} blueprints approved
        </span>
      </div>

      <div style={s.body}>
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>AI System Architecture</div>
          <div style={{ fontSize: "13px", color: "#6B7090" }}>6 AI features designed for Sprint 3 build · Click any card to review the full blueprint</div>
        </div>

        {loading ? (
          <div style={{ color: "#4A4F6A", textAlign: "center", padding: "60px" }}>Loading blueprints…</div>
        ) : (
          <div style={s.grid}>
            {blueprints.map((bp) => (
              <div key={bp.id} style={s.card(selected?.id === bp.id)} onClick={() => setSelected(bp)}>
                <div style={s.cardHeader}>
                  <div style={s.cardTitle}>{bp.feature}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                    <span style={s.platformBadge(bp.platform)}>{bp.platform}</span>
                    <span style={s.statusBadge(bp.status)}>{bp.status}</span>
                  </div>
                </div>
                <div style={s.desc}>{bp.description}</div>
                <div style={s.threshold}>{bp.performance_threshold}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={s.modal} onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div style={s.modalBox}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕ Close</button>
            <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "4px" }}>{selected.feature}</div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              <span style={s.platformBadge(selected.platform)}>{selected.platform}</span>
              <span style={s.statusBadge(selected.status)}>{selected.status}</span>
            </div>
            <div style={{ fontSize: "13px", color: "#8890AA", lineHeight: "1.6", marginBottom: "16px" }}>{selected.description}</div>

            {/* Data Flow */}
            <div style={s.sectionLabel}>Data Flow</div>
            <div style={s.flowBox}>
              {["input", "processing", "output"].map((key) => (
                <div key={key} style={s.flowRow}>
                  <span style={s.flowKey}>{key.toUpperCase()}</span>
                  <span style={s.flowVal}>
                    {Array.isArray(selected.data_flow?.[key])
                      ? selected.data_flow[key].join(" → ")
                      : selected.data_flow?.[key] || "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* API Endpoints */}
            <div style={s.sectionLabel}>API Endpoints / Triggers</div>
            {(selected.api_endpoints || []).map((ep, i) => (
              <div key={i} style={s.endpointRow}>
                <span style={s.method(ep.method || ep.trigger)}>{ep.method || ep.trigger}</span>
                <div>
                  <div style={s.endpointPath}>{ep.path || ep.action}</div>
                  <div style={{ fontSize: "11px", color: "#6B7090", marginTop: "2px" }}>{ep.description}</div>
                </div>
              </div>
            ))}

            {/* Performance Threshold */}
            <div style={s.sectionLabel}>Performance Threshold (Sprint 4 DoD)</div>
            <div style={s.threshold}>{selected.performance_threshold}</div>

            {/* Sprint Timeline */}
            <div style={s.sectionLabel}>Sprint Timeline</div>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ ...s.threshold, flex: 1 }}>📐 Designed: Sprint {selected.sprint_designed}</div>
              <div style={{ ...s.threshold, flex: 1 }}>🔨 Built: Sprint {selected.sprint_build}</div>
            </div>

            {selected.status !== "Approved" && (
              <button style={s.approveBtn} onClick={() => approveBlueprint(selected.id)}>
                ✓ Approve Blueprint
              </button>
            )}
            {selected.status === "Approved" && (
              <div style={{ marginTop: "16px", fontSize: "13px", color: "#00B894" }}>
                ✓ Approved by {selected.approved_by}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
