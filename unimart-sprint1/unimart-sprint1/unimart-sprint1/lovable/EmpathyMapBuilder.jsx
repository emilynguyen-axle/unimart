// UniMart Sprint 1 — Empathy Map Builder (Lovable)
// US-01: HCD Kickoff & Empathy Mapping
// Used by UX Research squad during empathy workshops

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COLORS = {
  brand: "#FF6B35",
  surface: "#0F0F0F",
  surfaceCard: "#1A1A1A",
  surfaceBorder: "#2A2A2A",
  textPrimary: "#F5F5F0",
  textSecondary: "#999990",
  textMuted: "#555550",
  thinks: "#9B6FFF",
  feels: "#FF6B35",
  says: "#44CC88",
  does: "#FFD700",
  pains: "#FF4444",
  gains: "#00BBFF",
};

const USER_GROUPS = [
  { key: "customer", label: "Customer", icon: "🛒" },
  { key: "seller", label: "Seller", icon: "🏪" },
  { key: "delivery_driver", label: "Delivery Driver", icon: "🚴" },
  { key: "customer_support_agent", label: "Support Agent", icon: "🎧" },
  { key: "nutritionist", label: "Nutritionist", icon: "🥗" },
  { key: "ui_ux_designer", label: "UI/UX Designer", icon: "🎨" },
  { key: "software_engineer", label: "Software Engineer", icon: "💻" },
  { key: "legal_compliance", label: "Legal/Compliance", icon: "⚖️" },
  { key: "data_analyst", label: "Data Analyst", icon: "📊" },
  { key: "senior_partner", label: "Senior Partner", icon: "🏢" },
  { key: "stakeholder", label: "Stakeholder", icon: "👥" },
];

const QUADRANTS = [
  { key: "thinks", label: "Thinks", color: COLORS.thinks, icon: "💭", placeholder: "What occupies their mind? Worries, concerns, goals..." },
  { key: "feels", label: "Feels", color: COLORS.feels, icon: "❤️", placeholder: "What emotions do they experience? Frustrations, excitements..." },
  { key: "says", label: "Says", color: COLORS.says, icon: "💬", placeholder: "What quotes come from them in research? What do they tell others..." },
  { key: "does", label: "Does", color: COLORS.does, icon: "⚡", placeholder: "What behaviours do you observe? Daily actions, workarounds..." },
  { key: "pain_points", label: "Pains", color: COLORS.pains, icon: "😣", placeholder: "Fears, frustrations, obstacles they face..." },
  { key: "gains", label: "Gains", color: COLORS.gains, icon: "🎯", placeholder: "Goals, desires, measures of success..." },
];

export default function EmpathyMapBuilder() {
  const [selectedGroup, setSelectedGroup] = useState("customer");
  const [empathyData, setEmpathyData] = useState({});
  const [inputs, setInputs] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [validationMode, setValidationMode] = useState(false);

  useEffect(() => {
    loadEmpathyMap(selectedGroup);
  }, [selectedGroup]);

  async function loadEmpathyMap(groupName) {
    const { data: group } = await supabase.from("user_groups").select("id").eq("name", groupName).single();
    if (!group) return;

    const { data: map } = await supabase.from("empathy_maps").select("*").eq("user_group_id", group.id).single();

    if (map) {
      setEmpathyData(map);
      const newInputs = {};
      QUADRANTS.forEach((q) => {
        newInputs[q.key] = (map[q.key] || []).join("\n");
      });
      setInputs(newInputs);
    } else {
      setEmpathyData({});
      setInputs({});
    }
  }

  async function saveEmpathyMap() {
    setSaving(true);
    const { data: group } = await supabase.from("user_groups").select("id").eq("name", selectedGroup).single();
    if (!group) { setSaving(false); return; }

    const payload = {};
    QUADRANTS.forEach((q) => {
      payload[q.key] = (inputs[q.key] || "").split("\n").map((s) => s.trim()).filter(Boolean);
    });

    // Check if exists
    const { data: existing } = await supabase.from("empathy_maps").select("id").eq("user_group_id", group.id).single();

    if (existing) {
      await supabase.from("empathy_maps").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing.id);
    } else {
      await supabase.from("empathy_maps").insert({ user_group_id: group.id, ...payload });
    }

    setSaving(false);
    setSavedMsg("Saved ✓");
    setTimeout(() => setSavedMsg(""), 2000);
    loadEmpathyMap(selectedGroup);
  }

  async function markValidated() {
    const { data: group } = await supabase.from("user_groups").select("id").eq("name", selectedGroup).single();
    if (!group) return;
    await supabase.from("empathy_maps")
      .update({ validated: true, validated_at: new Date().toISOString(), validated_by: "UX Research Lead" })
      .eq("user_group_id", group.id);
    loadEmpathyMap(selectedGroup);
  }

  const currentGroup = USER_GROUPS.find((g) => g.key === selectedGroup);
  const painPointCount = (inputs.pain_points || "").split("\n").filter(Boolean).length;
  const hasMinPainPoints = painPointCount >= 3;

  return (
    <div style={{ fontFamily: "'DM Mono', monospace", background: COLORS.surface, minHeight: "100vh", color: COLORS.textPrimary }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${COLORS.surfaceBorder}`, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>EMPATHY MAP BUILDER</div>
          <div style={{ color: COLORS.textSecondary, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>
            US-01 · Sprint 1 · HCD Kickoff
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {savedMsg && <span style={{ color: COLORS.gains, fontSize: 11, letterSpacing: 1 }}>{savedMsg}</span>}
          {empathyData.validated && (
            <span style={{ background: "#1A2A1A", color: COLORS.gains, border: `1px solid ${COLORS.gains}44`, padding: "4px 10px", fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>
              ✓ Validated
            </span>
          )}
          <button onClick={saveEmpathyMap} disabled={saving} style={{ background: COLORS.brand, border: "none", color: "#fff", padding: "8px 20px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving..." : "Save Map"}
          </button>
          {!empathyData.validated && hasMinPainPoints && (
            <button onClick={markValidated} style={{ background: "none", border: `1px solid ${COLORS.gains}`, color: COLORS.gains, padding: "8px 16px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "inherit" }}>
              Mark Validated
            </button>
          )}
        </div>
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 70px)" }}>
        {/* Sidebar: User Group Selector */}
        <aside style={{ width: 200, borderRight: `1px solid ${COLORS.surfaceBorder}`, padding: "16px 0", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "0 16px 12px", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: COLORS.textMuted }}>
            User Groups (11)
          </div>
          {USER_GROUPS.map((g) => (
            <button key={g.key} onClick={() => setSelectedGroup(g.key)} style={{
              width: "100%", textAlign: "left", background: selectedGroup === g.key ? COLORS.surfaceCard : "none",
              border: "none", borderLeft: selectedGroup === g.key ? `2px solid ${COLORS.brand}` : "2px solid transparent",
              padding: "10px 16px", color: selectedGroup === g.key ? COLORS.textPrimary : COLORS.textSecondary,
              fontSize: 11, cursor: "pointer", display: "flex", gap: 8, alignItems: "center",
            }}>
              <span>{g.icon}</span>
              <span style={{ letterSpacing: 0.3 }}>{g.label}</span>
            </button>
          ))}
        </aside>

        {/* Main: Empathy Map Grid */}
        <main style={{ flex: 1, overflow: "auto", padding: "20px 24px" }}>
          <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                {currentGroup?.icon} {currentGroup?.label}
              </h2>
              <div style={{ color: COLORS.textSecondary, fontSize: 11, marginTop: 4, letterSpacing: 0.5 }}>
                Minimum 3 validated pain points required · {painPointCount}/3 entered
                {hasMinPainPoints && <span style={{ color: COLORS.gains, marginLeft: 8 }}>✓ Threshold met</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: 1, textTransform: "uppercase", alignSelf: "center" }}>
                Participants: {empathyData.participant_count || 0}
              </span>
            </div>
          </div>

          {/* 2x3 Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, minHeight: 500 }}>
            {QUADRANTS.map((q) => (
              <div key={q.key} style={{ border: `1px solid ${q.color}33`, background: COLORS.surfaceCard, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 16 }}>{q.icon}</span>
                  <span style={{ color: q.color, fontWeight: 700, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>
                    {q.label}
                  </span>
                </div>
                <textarea
                  value={inputs[q.key] || ""}
                  onChange={(e) => setInputs({ ...inputs, [q.key]: e.target.value })}
                  placeholder={q.placeholder}
                  style={{
                    width: "100%", minHeight: 160, background: "none", border: `1px solid ${COLORS.surfaceBorder}`,
                    color: COLORS.textPrimary, fontFamily: "'DM Mono', monospace", fontSize: 11, lineHeight: 1.7,
                    padding: "8px 10px", resize: "vertical", boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <div style={{ marginTop: 6, color: COLORS.textMuted, fontSize: 9, letterSpacing: 0.5 }}>
                  One item per line · {(inputs[q.key] || "").split("\n").filter(Boolean).length} entered
                </div>
                {/* Render saved items as badges */}
                {(empathyData[q.key] || []).length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {(empathyData[q.key] || []).map((item, i) => (
                      <span key={i} style={{ background: `${q.color}15`, color: q.color, border: `1px solid ${q.color}33`, padding: "2px 8px", fontSize: 9, lineHeight: 1.5 }}>
                        {item.length > 40 ? item.slice(0, 40) + "…" : item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Figma link */}
          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <label style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: COLORS.textMuted }}>Figma Link</label>
            <input
              type="text"
              placeholder="https://figma.com/file/..."
              style={{ flex: 1, background: COLORS.surfaceCard, border: `1px solid ${COLORS.surfaceBorder}`, color: COLORS.textPrimary, padding: "6px 12px", fontSize: 11, fontFamily: "inherit", outline: "none" }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
