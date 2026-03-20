/**
 * UniMart Sprint 1 — Empathy Mapping Dashboard
 * US-01: HCD Kickoff & Empathy Mapping
 *
 * Deploy in Lovable as a full-page component.
 * Connects to Supabase for live data.
 *
 * Install in Lovable:
 *   npm install @supabase/supabase-js
 */

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase Config ─────────────────────────────────────────────────────────
// Replace with your Supabase project URL and anon key from the Supabase dashboard.
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── User Groups ──────────────────────────────────────────────────────────────
const USER_GROUPS = [
  "Customers",
  "Sellers",
  "Stakeholders",
  "Senior Partners",
  "UI/UX Designers",
  "Software Engineers",
  "Delivery Drivers",
  "Customer Support Agents",
  "Nutritionists / Dietitians",
  "Regulatory / Legal / Compliance",
  "Data Analysts / Growth Teams",
];

const QUADRANTS = ["thinks", "feels", "says", "does"];
const QUADRANT_LABELS = {
  thinks: "💭 Thinks",
  feels: "❤️ Feels",
  says: "💬 Says",
  does: "⚡ Does",
};

// ── Empty empathy map template ────────────────────────────────────────────────
const emptyMap = () => ({
  thinks: ["", "", ""],
  feels: ["", "", ""],
  says: ["", "", ""],
  does: ["", "", ""],
  pain_points: ["", "", ""],
  gains: ["", "", ""],
});

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  root: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    background: "#0F1117",
    minHeight: "100vh",
    color: "#E8EAF0",
    padding: "0",
  },
  header: {
    background: "linear-gradient(135deg, #1A1D2E 0%, #12151F 100%)",
    borderBottom: "1px solid #2A2D3E",
    padding: "24px 40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#7C6AF7",
    letterSpacing: "-0.5px",
  },
  badge: {
    background: "#7C6AF722",
    color: "#A89DF7",
    border: "1px solid #7C6AF744",
    borderRadius: "20px",
    padding: "4px 14px",
    fontSize: "12px",
    fontWeight: "600",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    minHeight: "calc(100vh - 72px)",
  },
  sidebar: {
    background: "#13161F",
    borderRight: "1px solid #1E2130",
    padding: "24px 0",
  },
  sidebarTitle: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#5A5F7A",
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    padding: "0 20px 12px",
  },
  sidebarItem: (active) => ({
    padding: "10px 20px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: active ? "600" : "400",
    color: active ? "#7C6AF7" : "#8890AA",
    background: active ? "#7C6AF710" : "transparent",
    borderLeft: active ? "3px solid #7C6AF7" : "3px solid transparent",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  main: {
    padding: "32px 40px",
    overflowY: "auto",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: "4px",
    letterSpacing: "-0.5px",
  },
  pageSubtitle: {
    fontSize: "14px",
    color: "#6B7290",
    marginBottom: "28px",
  },
  progressBar: {
    background: "#1A1D2E",
    borderRadius: "8px",
    padding: "14px 20px",
    marginBottom: "24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    border: "1px solid #1E2130",
  },
  progressLabel: {
    fontSize: "13px",
    color: "#8890AA",
    whiteSpace: "nowrap",
  },
  progressTrack: {
    flex: 1,
    height: "6px",
    background: "#2A2D3E",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: "linear-gradient(90deg, #7C6AF7, #A89DF7)",
    borderRadius: "3px",
    transition: "width 0.5s ease",
  }),
  progressCount: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#A89DF7",
    whiteSpace: "nowrap",
  },
  quadrantGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  quadrantCard: (q) => {
    const colors = {
      thinks: "#5B8AF7",
      feels: "#F76B8A",
      says: "#54C09E",
      does: "#F7A954",
    };
    return {
      background: "#13161F",
      border: `1px solid ${colors[q]}33`,
      borderRadius: "12px",
      padding: "18px",
    };
  },
  quadrantHeader: (q) => {
    const colors = {
      thinks: "#5B8AF7",
      feels: "#F76B8A",
      says: "#54C09E",
      does: "#F7A954",
    };
    return {
      fontSize: "13px",
      fontWeight: "700",
      color: colors[q],
      marginBottom: "12px",
      letterSpacing: "0.3px",
    };
  },
  textarea: {
    width: "100%",
    background: "#0F1117",
    border: "1px solid #2A2D3E",
    borderRadius: "8px",
    color: "#D0D4E8",
    fontSize: "13px",
    padding: "10px 12px",
    resize: "vertical",
    minHeight: "60px",
    marginBottom: "8px",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  },
  bottomRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "24px",
  },
  sectionCard: (accent) => ({
    background: "#13161F",
    border: `1px solid ${accent}33`,
    borderRadius: "12px",
    padding: "18px",
  }),
  sectionHeader: (accent) => ({
    fontSize: "13px",
    fontWeight: "700",
    color: accent,
    marginBottom: "12px",
  }),
  saveButton: (saving) => ({
    background: saving ? "#5A4FC4" : "linear-gradient(135deg, #7C6AF7, #9B8BF7)",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "10px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: saving ? "not-allowed" : "pointer",
    opacity: saving ? 0.7 : 1,
    transition: "all 0.2s",
  }),
  statusChip: (done) => ({
    display: "inline-block",
    background: done ? "#1A3A2A" : "#1A1D2E",
    color: done ? "#54C09E" : "#6B7290",
    border: `1px solid ${done ? "#54C09E44" : "#2A2D3E"}`,
    borderRadius: "20px",
    padding: "3px 12px",
    fontSize: "12px",
    fontWeight: "600",
    marginLeft: "8px",
  }),
  hcdChallengePill: {
    background: "#1A1D2E",
    border: "1px solid #2A2D3E",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "13px",
    color: "#8890AA",
    marginBottom: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  dot: (active) => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: active ? "#7C6AF7" : "#2A2D3E",
    flexShrink: 0,
  }),
  toastContainer: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: 9999,
  },
  toast: (type) => ({
    background: type === "success" ? "#1A3A2A" : "#3A1A1A",
    color: type === "success" ? "#54C09E" : "#F76B8A",
    border: `1px solid ${type === "success" ? "#54C09E44" : "#F76B8A44"}`,
    borderRadius: "10px",
    padding: "12px 20px",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    marginTop: "8px",
  }),
};

// ── HCD Challenges from roadmap ──────────────────────────────────────────────
const HCD_CHALLENGES = [
  "Disorganization — merging three UX paradigms",
  "Onboarding Complexity — value in under 30 seconds",
  "Gaining Customers — branding & trust",
  "Trust & Safety at Scale — verified sellers, fraud",
  "Accessibility (a11y) — WCAG 2.1 AA across all verticals",
  "Returns & Refunds UX — distinct resolution flows",
  "Rural vs. Urban Experience Disparity",
  "Notification Fatigue — preference-driven alerts",
  "Cross-Vertical Cart Conflicts — mixed fulfilment",
  "Delivery Driver Experience",
  "Support at Scale — three different dispute types",
];

// ── Main Component ─────────────────────────────────────────────────────────
export default function EmpathyMapDashboard() {
  const [selectedGroup, setSelectedGroup] = useState(USER_GROUPS[0]);
  const [maps, setMaps] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [completedGroups, setCompletedGroups] = useState(new Set());
  const [prioritisedChallenges, setPrioritisedChallenges] = useState(new Set());

  // Load saved map for selected group from Supabase
  useEffect(() => {
    async function loadMap() {
      const { data, error } = await supabase
        .from("empathy_maps")
        .select("*")
        .eq("user_group", selectedGroup)
        .single();
      if (data && !error) {
        setMaps((prev) => ({ ...prev, [selectedGroup]: data.map_data }));
        if (isComplete(data.map_data)) {
          setCompletedGroups((prev) => new Set([...prev, selectedGroup]));
        }
      } else if (!maps[selectedGroup]) {
        setMaps((prev) => ({ ...prev, [selectedGroup]: emptyMap() }));
      }
    }
    loadMap();
  }, [selectedGroup]);

  // Load prioritised HCD challenges
  useEffect(() => {
    async function loadChallenges() {
      const { data } = await supabase
        .from("hcd_challenge_priorities")
        .select("challenge")
        .eq("prioritised", true);
      if (data) {
        setPrioritisedChallenges(new Set(data.map((d) => d.challenge)));
      }
    }
    loadChallenges();
  }, []);

  const currentMap = maps[selectedGroup] || emptyMap();

  function isComplete(map) {
    if (!map) return false;
    return QUADRANTS.every((q) => map[q]?.some((v) => v.trim().length > 0)) &&
      (map.pain_points?.some((v) => v.trim().length > 0));
  }

  function updateField(quadrant, index, value) {
    setMaps((prev) => {
      const updated = { ...prev[selectedGroup] };
      const arr = [...(updated[quadrant] || ["", "", ""])];
      arr[index] = value;
      updated[quadrant] = arr;
      return { ...prev, [selectedGroup]: updated };
    });
  }

  async function saveMap() {
    setSaving(true);
    const mapData = maps[selectedGroup];
    const { error } = await supabase
      .from("empathy_maps")
      .upsert({
        user_group: selectedGroup,
        map_data: mapData,
        updated_at: new Date().toISOString(),
        is_complete: isComplete(mapData),
      }, { onConflict: "user_group" });

    setSaving(false);
    if (!error) {
      if (isComplete(mapData)) {
        setCompletedGroups((prev) => new Set([...prev, selectedGroup]));
      }
      showToast("success", `Saved empathy map for ${selectedGroup}`);
    } else {
      showToast("error", "Save failed — check Supabase connection");
    }
  }

  async function toggleChallenge(challenge) {
    const isPrioritised = prioritisedChallenges.has(challenge);
    const updated = new Set(prioritisedChallenges);
    if (isPrioritised) {
      updated.delete(challenge);
    } else {
      updated.add(challenge);
    }
    setPrioritisedChallenges(updated);

    await supabase
      .from("hcd_challenge_priorities")
      .upsert({ challenge, prioritised: !isPrioritised }, { onConflict: "challenge" });
  }

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  const completionPct = Math.round((completedGroups.size / USER_GROUPS.length) * 100);

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={styles.logo}>UniMart</span>
          <span style={styles.badge}>Sprint 1 · US-01 · HCD Empathy Mapping</span>
        </div>
        <span style={{ fontSize: "13px", color: "#5A5F7A" }}>
          {completedGroups.size} / {USER_GROUPS.length} groups complete
        </span>
      </div>

      {/* Layout */}
      <div style={styles.layout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>User Groups</div>
          {USER_GROUPS.map((group) => (
            <div
              key={group}
              style={styles.sidebarItem(selectedGroup === group)}
              onClick={() => setSelectedGroup(group)}
            >
              {completedGroups.has(group) ? "✓ " : "○ "}
              {group}
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={styles.main}>
          <div style={styles.pageTitle}>
            {selectedGroup}
            <span style={styles.statusChip(completedGroups.has(selectedGroup))}>
              {completedGroups.has(selectedGroup) ? "Complete" : "In Progress"}
            </span>
          </div>
          <div style={styles.pageSubtitle}>
            Fill in at least 3 validated pain points per quadrant · Pain points required for DoD
          </div>

          {/* Progress */}
          <div style={styles.progressBar}>
            <span style={styles.progressLabel}>Overall Progress</span>
            <div style={styles.progressTrack}>
              <div style={styles.progressFill(completionPct)} />
            </div>
            <span style={styles.progressCount}>{completionPct}%</span>
          </div>

          {/* 4 Quadrants */}
          <div style={styles.quadrantGrid}>
            {QUADRANTS.map((q) => (
              <div key={q} style={styles.quadrantCard(q)}>
                <div style={styles.quadrantHeader(q)}>{QUADRANT_LABELS[q]}</div>
                {(currentMap[q] || ["", "", ""]).map((val, i) => (
                  <textarea
                    key={i}
                    style={styles.textarea}
                    placeholder={`Point ${i + 1}…`}
                    value={val}
                    onChange={(e) => updateField(q, i, e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#7C6AF7")}
                    onBlur={(e) => (e.target.style.borderColor = "#2A2D3E")}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Pain Points & Gains */}
          <div style={styles.bottomRow}>
            <div style={styles.sectionCard("#F76B8A")}>
              <div style={styles.sectionHeader("#F76B8A")}>😣 Pain Points (required for DoD)</div>
              {(currentMap.pain_points || ["", "", ""]).map((val, i) => (
                <textarea
                  key={i}
                  style={styles.textarea}
                  placeholder={`Pain point ${i + 1}…`}
                  value={val}
                  onChange={(e) => updateField("pain_points", i, e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#F76B8A")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2D3E")}
                />
              ))}
            </div>
            <div style={styles.sectionCard("#54C09E")}>
              <div style={styles.sectionHeader("#54C09E")}>🎯 Gains / Goals</div>
              {(currentMap.gains || ["", "", ""]).map((val, i) => (
                <textarea
                  key={i}
                  style={styles.textarea}
                  placeholder={`Gain ${i + 1}…`}
                  value={val}
                  onChange={(e) => updateField("gains", i, e.target.value)}
                  onFocus={(e) => (e.target.style.borderColor = "#54C09E")}
                  onBlur={(e) => (e.target.style.borderColor = "#2A2D3E")}
                />
              ))}
            </div>
          </div>

          {/* HCD Challenge Prioritisation */}
          <div style={{ ...styles.sectionCard("#A89DF7"), marginBottom: "24px" }}>
            <div style={styles.sectionHeader("#A89DF7")}>
              📋 HCD Challenge Registry — Click to Prioritise
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              {HCD_CHALLENGES.map((c) => (
                <div
                  key={c}
                  style={{
                    ...styles.hcdChallengePill,
                    cursor: "pointer",
                    borderColor: prioritisedChallenges.has(c) ? "#7C6AF744" : "#2A2D3E",
                    background: prioritisedChallenges.has(c) ? "#7C6AF710" : "#1A1D2E",
                  }}
                  onClick={() => toggleChallenge(c)}
                >
                  <div style={styles.dot(prioritisedChallenges.has(c))} />
                  <span style={{ fontSize: "12px" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save */}
          <button style={styles.saveButton(saving)} onClick={saveMap} disabled={saving}>
            {saving ? "Saving…" : "Save Empathy Map →"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={styles.toastContainer}>
          <div style={styles.toast(toast.type)}>{toast.message}</div>
        </div>
      )}
    </div>
  );
}
