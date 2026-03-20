/**
 * UniMart Sprint 3 — Nutritionist Portal
 * US-10: Nutritionist & Content Partner Portal
 * Deploy in Lovable as: /nutritionist/portal
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const REPLIT_URL = "https://YOUR_REPLIT_URL:5000";

const DIETARY_TAGS = ["vegan","vegetarian","gluten-free","dairy-free","nut-free","low-carb","high-protein","paleo","keto","halal","kosher"];

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#080E0C", minHeight: "100vh", color: "#E2EFE8" },
  header:  { background: "#0D1C14", borderBottom: "1px solid #162A1E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { fontSize: "20px", fontWeight: "700", color: "#00B894" },
  badge:   { background: "#00B89422", color: "#00B894", border: "1px solid #00B89444", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  layout:  { display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "calc(100vh - 56px)" },
  sidebar: { background: "#0A1410", borderRight: "1px solid #162A1E", padding: "24px 0" },
  navItem: (active) => ({ padding: "10px 20px", cursor: "pointer", fontSize: "14px", fontWeight: active ? "600" : "400", color: active ? "#00B894" : "#6B9080", background: active ? "#00B89410" : "transparent", borderLeft: `3px solid ${active ? "#00B894" : "transparent"}` }),
  main:    { padding: "32px" },
  card:    { background: "#0D1C14", border: "1px solid #162A1E", borderRadius: "14px", padding: "24px", marginBottom: "20px" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "4px" },
  cardSub: { fontSize: "13px", color: "#6B9080", marginBottom: "20px" },
  label:   { fontSize: "12px", fontWeight: "600", color: "#6B9080", display: "block", marginBottom: "6px", marginTop: "14px" },
  input:   { width: "100%", background: "#060E0A", border: "1px solid #162A1E", borderRadius: "8px", color: "#E2EFE8", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea:{ width: "100%", background: "#060E0A", border: "1px solid #162A1E", borderRadius: "8px", color: "#E2EFE8", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: "80px", resize: "vertical" },
  tagGrid: { display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" },
  tag:     (active) => ({ background: active ? "#00B89422" : "#0A1410", border: `1px solid ${active ? "#00B894" : "#162A1E"}`, borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "600", color: active ? "#00B894" : "#6B9080", cursor: "pointer" }),
  mealRow: { background: "#060E0A", border: "1px solid #162A1E", borderRadius: "8px", padding: "12px 14px", marginBottom: "8px", display: "flex", gap: "12px", alignItems: "center" },
  dayLabel:{ fontSize: "12px", fontWeight: "700", color: "#00B894", minWidth: "80px" },
  mealInput:{ flex: 1, background: "transparent", border: "none", color: "#E2EFE8", fontSize: "13px", outline: "none", fontFamily: "inherit" },
  submitBtn:{ background: "linear-gradient(135deg,#00B894,#00D4A8)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginTop: "20px" },
  planCard: (status) => {
    const colors = { Draft: "#8890AA", Submitted: "#F7A954", Approved: "#00B894", Rejected: "#F76B8A" };
    return { background: "#0D1C14", border: `1px solid ${colors[status] || "#162A1E"}33`, borderRadius: "12px", padding: "18px", marginBottom: "10px" };
  },
  statusBadge: (status) => {
    const colors = { Draft: "#8890AA", Submitted: "#F7A954", Approved: "#00B894", Rejected: "#F76B8A" };
    return { background: (colors[status] || "#8890AA") + "22", color: colors[status] || "#8890AA", border: `1px solid ${(colors[status] || "#8890AA")}44`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" };
  },
  badgeCard: { background: "linear-gradient(135deg,#003D2E,#001A14)", border: "1px solid #00B89444", borderRadius: "14px", padding: "24px", display: "flex", alignItems: "center", gap: "20px" },
  badgeIcon: { fontSize: "48px" },
};

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

export default function NutritionistPortal() {
  const [activeTab, setActiveTab] = useState("submit");
  const [plans, setPlans]         = useState([]);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const [form, setForm] = useState({
    title: "", description: "", weeks: 1,
    dietary_tags: [],
    meals: DAYS.map(day => ({ day, meal: "", calories: "" })),
  });

  useEffect(() => {
    async function loadPlans() {
      const { data } = await supabase.from("meal_plans").select("*").order("created_at", { ascending: false });
      setPlans(data || []);
    }
    loadPlans();
  }, []);

  function toggleTag(tag) {
    setForm(p => ({
      ...p,
      dietary_tags: p.dietary_tags.includes(tag) ? p.dietary_tags.filter(t => t !== tag) : [...p.dietary_tags, tag]
    }));
  }

  function setMeal(day, value) {
    setForm(p => ({ ...p, meals: p.meals.map(m => m.day === day ? { ...m, meal: value } : m) }));
  }

  async function submitPlan() {
    setSaving(true);
    const { data, error } = await supabase.from("meal_plans").insert({
      title:       form.title,
      description: form.description,
      dietary_tags: form.dietary_tags,
      weeks:       form.weeks,
      meals:       form.meals.filter(m => m.meal.trim()),
      status:      "Submitted",
    }).select().single();

    if (!error) {
      setPlans(prev => [data, ...prev]);
      setSaved(true);
      setForm({ title: "", description: "", weeks: 1, dietary_tags: [], meals: DAYS.map(day => ({ day, meal: "" })) });
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  const tabs = [
    { id: "submit",  label: "📝 Submit Plan" },
    { id: "plans",   label: "📋 My Plans" },
    { id: "badge",   label: "🏅 My Badge" },
  ];

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart Nutritionist</span>
          <span style={s.badge}>Content Partner Portal · US-10</span>
        </div>
      </div>

      <div style={s.layout}>
        {/* Sidebar */}
        <div style={s.sidebar}>
          {tabs.map(tab => (
            <div key={tab.id} style={s.navItem(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </div>
          ))}
        </div>

        <div style={s.main}>

          {/* Submit Plan */}
          {activeTab === "submit" && (
            <div style={s.card}>
              <div style={s.cardTitle}>Submit a Meal Plan</div>
              <div style={s.cardSub}>Your plan will be reviewed and if approved, your badge will appear on all associated listings.</div>

              {saved && <div style={{ background: "#003D2E", border: "1px solid #00B89444", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#00B894" }}>✅ Plan submitted successfully! We'll review it within 2 business days.</div>}

              <label style={s.label}>Plan Title *</label>
              <input style={s.input} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. 7-Day Anti-Inflammatory Reset" />

              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the nutritional goals and who this plan is for…" />

              <label style={s.label}>Dietary Tags</label>
              <div style={s.tagGrid}>
                {DIETARY_TAGS.map(tag => (
                  <span key={tag} style={s.tag(form.dietary_tags.includes(tag))} onClick={() => toggleTag(tag)}>{tag}</span>
                ))}
              </div>

              <label style={s.label}>Number of Weeks</label>
              <select style={s.input} value={form.weeks} onChange={e => setForm(p => ({ ...p, weeks: parseInt(e.target.value) }))}>
                {[1,2,3,4].map(w => <option key={w} value={w}>{w} week{w > 1 ? "s" : ""}</option>)}
              </select>

              <label style={s.label}>Week 1 Meal Plan</label>
              {form.meals.map(m => (
                <div key={m.day} style={s.mealRow}>
                  <span style={s.dayLabel}>{m.day}</span>
                  <input
                    style={s.mealInput}
                    placeholder="e.g. Quinoa Buddha Bowl with roasted chickpeas"
                    value={m.meal}
                    onChange={e => setMeal(m.day, e.target.value)}
                  />
                </div>
              ))}

              <button style={s.submitBtn} onClick={submitPlan} disabled={!form.title || saving}>
                {saving ? "Submitting…" : "Submit for Review →"}
              </button>
            </div>
          )}

          {/* My Plans */}
          {activeTab === "plans" && (
            <>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>
                My Meal Plans ({plans.length})
              </div>
              {plans.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", color: "#4A6A5A" }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>🥗</div>
                  No plans submitted yet
                </div>
              ) : (
                plans.map(plan => (
                  <div key={plan.id} style={s.planCard(plan.status)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>{plan.title}</div>
                      <span style={s.statusBadge(plan.status)}>{plan.status}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#6B9080", marginBottom: "8px" }}>{plan.description}</div>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {(plan.dietary_tags || []).map(tag => (
                        <span key={tag} style={s.tag(true)}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: "11px", color: "#4A6A5A", marginTop: "8px" }}>
                      Submitted {new Date(plan.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Badge */}
          {activeTab === "badge" && (
            <>
              <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff", marginBottom: "20px" }}>My Nutritionist Badge</div>
              <div style={s.badgeCard}>
                <div style={s.badgeIcon}>🏅</div>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#00B894", marginBottom: "4px" }}>Verified Nutritionist</div>
                  <div style={{ fontSize: "13px", color: "#6B9080", marginBottom: "12px" }}>Your badge appears on all listings and meal kits you have approved.</div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ background: "#00B89422", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#00B894" }}>
                      <strong>3</strong> approved listings
                    </div>
                    <div style={{ background: "#00B89422", borderRadius: "8px", padding: "10px 16px", fontSize: "13px", color: "#00B894" }}>
                      <strong>2</strong> approved plans
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ ...s.card, marginTop: "20px" }}>
                <div style={s.cardTitle}>Ask a Nutritionist — Premium Feature</div>
                <div style={s.cardSub}>Customers on the Premium tier can submit dietary questions directly to you. Manage your availability below.</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#060E0A", borderRadius: "10px", padding: "14px 18px" }}>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#E2EFE8" }}>Accept premium questions</div>
                    <div style={{ fontSize: "12px", color: "#6B9080", marginTop: "2px" }}>You earn a fee per answered question</div>
                  </div>
                  <div style={{ background: "#00B89422", color: "#00B894", border: "1px solid #00B89444", borderRadius: "20px", padding: "4px 14px", fontSize: "12px", fontWeight: "700" }}>Active</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
