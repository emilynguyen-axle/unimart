/**
 * UniMart — Project Hub Home Page
 * Role/Department grouped navigation
 * Deploy in Lovable as: / (root) or /hub
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ROLES = [
  {
    id: "customer",
    label: "Customer",
    emoji: "🛍️",
    color: "#5B8AF7",
    bg: "#0D1A2E",
    description: "Shop, order food, plan meals",
    pages: [
      { label: "Home Feed & Shop",   route: "/app/home",    emoji: "🏪" },
      { label: "Waitlist Signup",    route: "/waitlist",    emoji: "🚀" },
    ],
  },
  {
    id: "seller",
    label: "Seller",
    emoji: "🏬",
    color: "#A29BFE",
    bg: "#12102A",
    description: "Onboard, list products, view compliance",
    pages: [
      { label: "Seller Onboarding",  route: "/seller/onboarding",  emoji: "📋" },
      { label: "Support Dashboard",  route: "/support/dashboard",  emoji: "🎧" },
    ],
  },
  {
    id: "driver",
    label: "Delivery Driver",
    emoji: "🚴",
    color: "#F7A954",
    bg: "#2A1A0D",
    description: "Job queue, routing, earnings",
    pages: [
      { label: "Driver App",         route: "/driver/app",         emoji: "📦" },
    ],
  },
  {
    id: "nutritionist",
    label: "Nutritionist",
    emoji: "🥗",
    color: "#00B894",
    bg: "#0D2A1E",
    description: "Submit meal plans, manage badge",
    pages: [
      { label: "Nutritionist Portal", route: "/nutritionist/portal", emoji: "🏅" },
    ],
  },
  {
    id: "ux",
    label: "UX / Design",
    emoji: "🎨",
    color: "#F76B8A",
    bg: "#2A0D1A",
    description: "Empathy maps, usability testing, prototypes",
    pages: [
      { label: "Empathy Map Workshop", route: "/sprint1/empathy-maps", emoji: "🗺️" },
      { label: "Sprint Board",         route: "/sprint1/board",        emoji: "📌" },
    ],
  },
  {
    id: "engineering",
    label: "Engineering",
    emoji: "⚙️",
    color: "#5B8AF7",
    bg: "#0D1A2E",
    description: "AI architecture, QA, infrastructure",
    pages: [
      { label: "AI Architecture",     route: "/sprint2/ai-architecture", emoji: "🤖" },
      { label: "QA Dashboard",        route: "/sprint4/qa",              emoji: "🧪" },
      { label: "AI Validation",       route: "/sprint4/ai-validation",   emoji: "📊" },
    ],
  },
  {
    id: "legal",
    label: "Legal / Compliance",
    emoji: "⚖️",
    color: "#F7A954",
    bg: "#2A1A0D",
    description: "Compliance audit, trust & safety",
    pages: [
      { label: "Compliance Audit",    route: "/sprint4/compliance",      emoji: "✅" },
    ],
  },
  {
    id: "growth",
    label: "Growth / Marketing",
    emoji: "📈",
    color: "#A29BFE",
    bg: "#12102A",
    description: "Waitlist, sentiment, brand",
    pages: [
      { label: "Waitlist Landing",    route: "/waitlist",                emoji: "🚀" },
      { label: "Sentiment Dashboard", route: "/sprint4/sentiment",       emoji: "💬" },
    ],
  },
  {
    id: "pm",
    label: "Project Management",
    emoji: "📋",
    color: "#00B894",
    bg: "#0D2A1E",
    description: "Sprint board, retro, handoff, velocity",
    pages: [
      { label: "Sprint Board",         route: "/sprint1/board",          emoji: "📌" },
      { label: "Retrospective",        route: "/sprint4/retrospective",  emoji: "🔄" },
      { label: "Stakeholder Handoff",  route: "/sprint4/handoff",        emoji: "📄" },
      { label: "Sentiment Dashboard",  route: "/sprint4/sentiment",      emoji: "💬" },
    ],
  },
];

const SPRINT_SUMMARY = [
  { sprint: 1, label: "Discovery & Foundation",   status: "Complete", color: "#00B894", pages: 2 },
  { sprint: 2, label: "UX Design & AI Architecture", status: "Complete", color: "#00B894", pages: 3 },
  { sprint: 3, label: "Core Platform Build",       status: "Complete", color: "#00B894", pages: 4 },
  { sprint: 4, label: "Testing & Handoff",         status: "Complete", color: "#00B894", pages: 6 },
];

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:  { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoWrap:{ display: "flex", alignItems: "center", gap: "14px" },
  logo:    { fontSize: "24px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px" },
  logoAccent: { color: "#6C5CE7" },
  tagline: { fontSize: "13px", color: "#6B7090" },
  body:    { maxWidth: "1200px", margin: "0 auto", padding: "40px 32px" },
  heroTitle: { fontSize: "32px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px", marginBottom: "6px" },
  heroSub:   { fontSize: "15px", color: "#6B7090", marginBottom: "40px" },
  sprintRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", marginBottom: "48px" },
  sprintCard:{ background: "#0D0F1C", border: "1px solid #00B89433", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "12px" },
  sprintNum: { fontSize: "22px", fontWeight: "800", color: "#00B894" },
  sprintLabel:{ fontSize: "12px", color: "#E2E4EF", fontWeight: "600" },
  sprintStatus:{ fontSize: "11px", color: "#00B894", marginTop: "2px" },
  sectionTitle: { fontSize: "13px", fontWeight: "700", color: "#6B7090", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "16px" },
  rolesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" },
  roleCard:  (color, bg, expanded) => ({
    background: expanded ? bg : "#0D0F1C",
    border: `1px solid ${expanded ? color + "55" : "#181B2E"}`,
    borderRadius: "14px",
    padding: "20px",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  roleHeader:{ display: "flex", alignItems: "center", justifyContent: "space-between" },
  roleLeft:  { display: "flex", alignItems: "center", gap: "12px" },
  roleEmoji: { fontSize: "28px" },
  roleName:  (color) => ({ fontSize: "15px", fontWeight: "700", color }),
  roleDesc:  { fontSize: "12px", color: "#6B7090", marginTop: "2px" },
  chevron:   (expanded) => ({ fontSize: "16px", color: "#6B7090", transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }),
  pagesList: { marginTop: "14px", display: "flex", flexDirection: "column", gap: "6px" },
  pageBtn:   (color) => ({
    background: color + "11",
    border: `1px solid ${color}22`,
    borderRadius: "8px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    transition: "all 0.15s",
    textDecoration: "none",
  }),
  pageEmoji: { fontSize: "16px" },
  pageName:  (color) => ({ fontSize: "13px", fontWeight: "600", color }),
  pageArrow: { marginLeft: "auto", fontSize: "12px", color: "#4A4F6A" },
  countBadge:(color) => ({ background: color+"22", color, border: `1px solid ${color}44`, borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }),
};

export default function ProjectHub() {
  const [expanded, setExpanded] = useState(null);
  const navigate = useNavigate();

  function toggle(id) {
    setExpanded(prev => prev === id ? null : id);
  }

  function goTo(route) {
    navigate(route);
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoWrap}>
          <div style={s.logo}>Uni<span style={s.logoAccent}>Mart</span></div>
          <span style={s.tagline}>Project Hub · 8-Week Prototype · All 4 Sprints Complete</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ background: "#00B89422", color: "#00B894", border: "1px solid #00B89444", borderRadius: "20px", padding: "4px 14px", fontSize: "12px", fontWeight: "700" }}>
            ✓ Project Complete
          </span>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.heroTitle}>Welcome to UniMart</div>
        <div style={s.heroSub}>Shop, cook, and eat — one unified platform. Select your role below to navigate to your relevant dashboards.</div>

        {/* Sprint Summary */}
        <div style={s.sprintRow}>
          {SPRINT_SUMMARY.map(sp => (
            <div key={sp.sprint} style={s.sprintCard}>
              <div style={s.sprintNum}>S{sp.sprint}</div>
              <div>
                <div style={s.sprintLabel}>{sp.label}</div>
                <div style={s.sprintStatus}>✓ {sp.status} · {sp.pages} pages</div>
              </div>
            </div>
          ))}
        </div>

        {/* Role Groups */}
        <div style={s.sectionTitle}>Navigate by Role</div>
        <div style={s.rolesGrid}>
          {ROLES.map(role => {
            const isExpanded = expanded === role.id;
            return (
              <div key={role.id} style={s.roleCard(role.color, role.bg, isExpanded)}>
                <div style={s.roleHeader} onClick={() => toggle(role.id)}>
                  <div style={s.roleLeft}>
                    <span style={s.roleEmoji}>{role.emoji}</span>
                    <div>
                      <div style={s.roleName(role.color)}>{role.label}</div>
                      <div style={s.roleDesc}>{role.description}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={s.countBadge(role.color)}>{role.pages.length}</span>
                    <span style={s.chevron(isExpanded)}>▾</span>
                  </div>
                </div>

                {isExpanded && (
                  <div style={s.pagesList}>
                    {role.pages.map(page => (
                      <div
                        key={page.route + page.label}
                        style={s.pageBtn(role.color)}
                        onClick={() => goTo(page.route)}
                        onMouseEnter={e => e.currentTarget.style.background = role.color + "22"}
                        onMouseLeave={e => e.currentTarget.style.background = role.color + "11"}
                      >
                        <span style={s.pageEmoji}>{page.emoji}</span>
                        <span style={s.pageName(role.color)}>{page.label}</span>
                        <span style={s.pageArrow}>→</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #181B2E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "13px", color: "#4A4F6A" }}>UniMart · v7.0 · 8-Week Agile Prototype · March 2026</div>
          <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#4A4F6A" }}>
            <span>35 Supabase tables</span>
            <span>15 Lovable pages</span>
            <span>7 n8n workflows</span>
            <span>30+ API endpoints</span>
          </div>
        </div>
      </div>
    </div>
  );
}
