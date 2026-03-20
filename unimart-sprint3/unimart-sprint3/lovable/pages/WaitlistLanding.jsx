/**
 * UniMart Sprint 3 — Waitlist Landing Page
 * US-11: Branding & Marketing Foundation
 * Deploy in Lovable as: / (root) or /waitlist
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF", overflowX: "hidden" },
  nav:     { padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "1100px", margin: "0 auto" },
  logo:    { fontSize: "22px", fontWeight: "800", color: "#fff", letterSpacing: "-0.5px" },
  logoAccent: { color: "#6C5CE7" },
  hero:    { maxWidth: "780px", margin: "0 auto", textAlign: "center", padding: "60px 24px 40px" },
  eyebrow: { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "5px 16px", fontSize: "13px", fontWeight: "600", display: "inline-block", marginBottom: "24px" },
  h1:      { fontSize: "clamp(32px, 6vw, 58px)", fontWeight: "800", color: "#fff", letterSpacing: "-1.5px", lineHeight: "1.1", marginBottom: "20px" },
  h1accent:{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  subtitle:{ fontSize: "18px", color: "#8890AA", lineHeight: "1.6", marginBottom: "40px", maxWidth: "560px", margin: "0 auto 40px" },
  formRow: { display: "flex", gap: "10px", maxWidth: "480px", margin: "0 auto 16px", flexWrap: "wrap" },
  emailInput: { flex: 1, background: "#0D0F1C", border: "1px solid #252840", borderRadius: "10px", color: "#E2E4EF", fontSize: "15px", padding: "14px 18px", outline: "none", fontFamily: "inherit", minWidth: "200px" },
  joinBtn: (loading) => ({ background: loading ? "#4A3FA8" : "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px 24px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap" }),
  hint:    { fontSize: "12px", color: "#4A4F6A", marginBottom: "48px" },
  successCard: { background: "#0D1C0A", border: "1px solid #00B89444", borderRadius: "16px", padding: "28px", maxWidth: "480px", margin: "0 auto 40px", textAlign: "center" },
  successTitle: { fontSize: "20px", fontWeight: "700", color: "#00B894", marginBottom: "8px" },
  successSub:   { fontSize: "14px", color: "#6B9080", marginBottom: "16px" },
  referralBox:  { background: "#060E0A", border: "1px solid #00B89433", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" },
  referralCode: { fontSize: "14px", fontWeight: "700", color: "#00B894", fontFamily: "monospace" },
  copyBtn:      { background: "#00B89422", color: "#00B894", border: "1px solid #00B89444", borderRadius: "6px", padding: "5px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  verticals:   { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "60px", flexWrap: "wrap" },
  vertCard:    (color) => ({ background: "#0D0F1C", border: `1px solid ${color}33`, borderRadius: "14px", padding: "20px 24px", textAlign: "center", minWidth: "160px" }),
  vertEmoji:   { fontSize: "32px", marginBottom: "10px" },
  vertLabel:   (color) => ({ fontSize: "14px", fontWeight: "700", color }),
  vertDesc:    { fontSize: "12px", color: "#6B7090", marginTop: "4px" },
  features:    { maxWidth: "1000px", margin: "0 auto", padding: "0 24px 60px" },
  featGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" },
  featCard:    { background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "14px", padding: "22px" },
  featEmoji:   { fontSize: "28px", marginBottom: "12px" },
  featTitle:   { fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "6px" },
  featDesc:    { fontSize: "13px", color: "#6B7090", lineHeight: "1.5" },
  statsRow:    { display: "flex", gap: "0", justifyContent: "center", borderTop: "1px solid #181B2E", borderBottom: "1px solid #181B2E", marginBottom: "60px" },
  statItem:    { flex: 1, padding: "24px", textAlign: "center", borderRight: "1px solid #181B2E", maxWidth: "200px" },
  statNum:     { fontSize: "28px", fontWeight: "800", color: "#fff", marginBottom: "4px" },
  statLabel:   { fontSize: "12px", color: "#6B7090" },
  footer:      { textAlign: "center", padding: "24px", fontSize: "12px", color: "#4A4F6A", borderTop: "1px solid #181B2E" },
};

const FEATURES = [
  { emoji: "🛍️", title: "Shop Everything",        desc: "Millions of products from verified sellers — delivered fast." },
  { emoji: "🥗", title: "Nutritionist-Designed Kits", desc: "Expert meal kits created with registered dietitians." },
  { emoji: "🍔", title: "Food Delivery",            desc: "Your favourite restaurants, delivered in under 40 minutes." },
  { emoji: "✨", title: "AI Shopping Assistant",   desc: "Natural language shopping across all three verticals at once." },
  { emoji: "🛒", title: "One Smart Cart",           desc: "Mix products, meal kits, and food in a single checkout." },
  { emoji: "🚀", title: "AI Meal Planner",          desc: "Tell us your diet — we'll plan your week and fill your cart." },
];

export default function WaitlistLanding() {
  const [email, setEmail]       = useState("");
  const [referredBy, setReferredBy] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("ref") || "";
    }
    return "";
  });
  const [loading, setLoading]   = useState(false);
  const [joined, setJoined]     = useState(null);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState("");

  async function joinWaitlist() {
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    setError("");

    const { data, error: supaErr } = await supabase
      .from("waitlist")
      .insert({ email: email.trim(), referred_by: referredBy || null, vertical_interest: [] })
      .select()
      .single();

    setLoading(false);
    if (supaErr) {
      if (supaErr.code === "23505") setError("You're already on the waitlist! 🎉");
      else setError("Something went wrong — please try again.");
    } else {
      setJoined(data);
    }
  }

  function copyReferral() {
    if (!joined) return;
    const url = `${window.location.origin}?ref=${joined.referral_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={s.root}>
      {/* Nav */}
      <div style={s.nav}>
        <span style={s.logo}>Uni<span style={s.logoAccent}>Mart</span></span>
        <span style={{ fontSize: "13px", color: "#6B7090" }}>Launching soon</span>
      </div>

      {/* Hero */}
      <div style={s.hero}>
        <div style={s.eyebrow}>🚀 Now accepting early access signups</div>
        <h1 style={s.h1}>
          Shop. Cook. Eat.<br />
          <span style={s.h1accent}>One app for everything.</span>
        </h1>
        <p style={s.subtitle}>
          UniMart combines Amazon, HelloFresh, and Uber Eats into one seamless experience — powered by AI, designed for your life.
        </p>

        {!joined ? (
          <>
            <div style={s.formRow}>
              <input
                style={s.emailInput}
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyDown={e => e.key === "Enter" && joinWaitlist()}
                onFocus={e => e.target.style.borderColor = "#6C5CE7"}
                onBlur={e => e.target.style.borderColor = "#252840"}
              />
              <button style={s.joinBtn(loading)} onClick={joinWaitlist} disabled={loading}>
                {loading ? "Joining…" : "Join Waitlist →"}
              </button>
            </div>
            {error && <div style={{ fontSize: "13px", color: "#F76B8A", marginBottom: "8px" }}>{error}</div>}
            <div style={s.hint}>No spam, ever. Unsubscribe anytime. 🔒</div>
          </>
        ) : (
          <div style={s.successCard}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <div style={s.successTitle}>You're on the list!</div>
            <div style={s.successSub}>
              Share your referral link to move up the waitlist — each friend who joins bumps you forward.
            </div>
            <div style={s.referralBox}>
              <span style={s.referralCode}>
                {window.location.origin}?ref={joined.referral_code}
              </span>
              <button style={s.copyBtn} onClick={copyReferral}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Verticals */}
      <div style={s.verticals}>
        <div style={s.vertCard("#5B8AF7")}>
          <div style={s.vertEmoji}>🛍️</div>
          <div style={s.vertLabel("#5B8AF7")}>Shop</div>
          <div style={s.vertDesc}>Millions of products</div>
        </div>
        <div style={s.vertCard("#00B894")}>
          <div style={s.vertEmoji}>🥗</div>
          <div style={s.vertLabel("#00B894")}>Meal Kits</div>
          <div style={s.vertDesc}>Chef-designed recipes</div>
        </div>
        <div style={s.vertCard("#F7A954")}>
          <div style={s.vertEmoji}>🍔</div>
          <div style={s.vertLabel("#F7A954")}>Food Delivery</div>
          <div style={s.vertDesc}>25–40 min delivery</div>
        </div>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { num: "3-in-1",  label: "Apps replaced" },
          { num: "< 30s",   label: "Onboarding time" },
          { num: "AI-first",label: "Shopping experience" },
          { num: "WCAG AA", label: "Accessibility standard" },
        ].map(stat => (
          <div key={stat.label} style={s.statItem}>
            <div style={s.statNum}>{stat.num}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={s.features}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#fff", marginBottom: "8px" }}>Everything you need, nothing you don't</div>
          <div style={{ fontSize: "14px", color: "#6B7090" }}>Built from the ground up to replace three apps with one</div>
        </div>
        <div style={s.featGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featCard}>
              <div style={s.featEmoji}>{f.emoji}</div>
              <div style={s.featTitle}>{f.title}</div>
              <div style={s.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={s.footer}>
        © 2026 UniMart · Privacy Policy · Terms of Service
      </div>
    </div>
  );
}
