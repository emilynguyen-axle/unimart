/**
 * UniMart Sprint 4 — Sentiment Dashboard
 * US-12: Internal Testing & Usability Validation
 * Deploy in Lovable as: /sprint4/sentiment
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const SENTIMENT_COLORS = { positive: "#00B894", neutral: "#8890AA", negative: "#F76B8A" };
const SOURCE_LABELS = { in_app: "In-App", support_ticket: "Support", app_store: "App Store", usability_test: "Usability Test", survey: "Survey" };

const s = {
  root:    { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:  { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:    { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge:   { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  body:    { padding: "28px 32px" },
  statsRow:{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "28px" },
  statCard:{ background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "12px", padding: "18px 20px" },
  statNum: (c) => ({ fontSize: "28px", fontWeight: "800", color: c }),
  statLabel:{ fontSize: "12px", color: "#6B7090", marginTop: "4px" },
  grid2:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" },
  card:    { background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "14px", padding: "20px" },
  cardTitle:{ fontSize: "15px", fontWeight: "700", color: "#fff", marginBottom: "16px" },
  barRow:  { display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" },
  barLabel:{ fontSize: "12px", color: "#8890AA", minWidth: "80px" },
  barTrack:{ flex: 1, height: "8px", background: "#181B2E", borderRadius: "4px", overflow: "hidden" },
  barFill: (pct, color) => ({ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", transition: "width 0.4s" }),
  barVal:  { fontSize: "12px", color: "#8890AA", minWidth: "30px", textAlign: "right" },
  feedbackCard: (sentiment) => ({
    background: (SENTIMENT_COLORS[sentiment]||"#8890AA") + "11",
    border: `1px solid ${(SENTIMENT_COLORS[sentiment]||"#8890AA")}33`,
    borderRadius: "10px", padding: "14px", marginBottom: "10px",
    borderLeft: `3px solid ${SENTIMENT_COLORS[sentiment]||"#8890AA"}`,
  }),
  feedbackText: { fontSize: "13px", color: "#E2E4EF", lineHeight: "1.5", marginBottom: "6px" },
  feedbackMeta: { fontSize: "11px", color: "#6B7090", display: "flex", gap: "10px" },
  chip:    (color) => ({ background: (color||"#6C5CE7")+"22", color: color||"#A29BFE", borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: "600" }),
};

export default function SentimentDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("sentiment_feedback").select("*").order("created_at", { ascending: false });
      setFeedback(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const total    = feedback.length;
  const positive = feedback.filter(f => f.sentiment === "positive").length;
  const neutral  = feedback.filter(f => f.sentiment === "neutral").length;
  const negative = feedback.filter(f => f.sentiment === "negative").length;
  const avgScore = total > 0 ? (feedback.reduce((s, f) => s + (f.score || 0), 0) / total).toFixed(2) : 0;

  const bySource = Object.entries(
    feedback.reduce((acc, f) => { acc[f.source] = (acc[f.source] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]);

  const byCategory = Object.entries(
    feedback.reduce((acc, f) => { if (f.category) acc[f.category] = (acc[f.category] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div style={s.root}>
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={s.logo}>UniMart</span>
          <span style={s.badge}>Sentiment Dashboard · US-12 · Sprint 4</span>
        </div>
        <span style={{ fontSize: "13px", color: "#6B7090" }}>{total} feedback items aggregated</span>
      </div>

      <div style={s.body}>
        <div style={s.statsRow}>
          <div style={s.statCard}><div style={s.statNum("#fff")}>{total}</div><div style={s.statLabel}>Total Feedback</div></div>
          <div style={s.statCard}><div style={s.statNum("#00B894")}>{positive}</div><div style={s.statLabel}>Positive ({total > 0 ? Math.round(positive/total*100) : 0}%)</div></div>
          <div style={s.statCard}><div style={s.statNum("#F76B8A")}>{negative}</div><div style={s.statLabel}>Negative ({total > 0 ? Math.round(negative/total*100) : 0}%)</div></div>
          <div style={s.statCard}><div style={s.statNum(parseFloat(avgScore) > 0 ? "#00B894" : "#F76B8A")}>{avgScore}</div><div style={s.statLabel}>Avg Sentiment Score</div></div>
        </div>

        <div style={s.grid2}>
          {/* By Source */}
          <div style={s.card}>
            <div style={s.cardTitle}>Feedback by Source</div>
            {bySource.map(([source, count]) => (
              <div key={source} style={s.barRow}>
                <span style={s.barLabel}>{SOURCE_LABELS[source] || source}</span>
                <div style={s.barTrack}><div style={s.barFill(total > 0 ? (count/total)*100 : 0, "#6C5CE7")} /></div>
                <span style={s.barVal}>{count}</span>
              </div>
            ))}
          </div>

          {/* By Category */}
          <div style={s.card}>
            <div style={s.cardTitle}>Top Feedback Categories</div>
            {byCategory.map(([cat, count]) => (
              <div key={cat} style={s.barRow}>
                <span style={s.barLabel}>{cat}</span>
                <div style={s.barTrack}><div style={s.barFill(total > 0 ? (count/total)*100 : 0, "#A29BFE")} /></div>
                <span style={s.barVal}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentiment Breakdown Bar */}
        <div style={s.card}>
          <div style={s.cardTitle}>Overall Sentiment Breakdown</div>
          <div style={{ display: "flex", height: "24px", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ width: `${total > 0 ? (positive/total)*100 : 0}%`, background: "#00B894", transition: "width 0.4s" }} />
            <div style={{ width: `${total > 0 ? (neutral/total)*100 : 0}%`, background: "#8890AA" }} />
            <div style={{ width: `${total > 0 ? (negative/total)*100 : 0}%`, background: "#F76B8A" }} />
          </div>
          <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
            <span style={{ color: "#00B894" }}>● Positive {total > 0 ? Math.round(positive/total*100) : 0}%</span>
            <span style={{ color: "#8890AA" }}>● Neutral {total > 0 ? Math.round(neutral/total*100) : 0}%</span>
            <span style={{ color: "#F76B8A" }}>● Negative {total > 0 ? Math.round(negative/total*100) : 0}%</span>
          </div>
        </div>

        {/* Individual Feedback */}
        <div style={{ ...s.card, marginTop: "20px" }}>
          <div style={s.cardTitle}>Recent Feedback</div>
          {loading ? <div style={{ color: "#4A4F6A" }}>Loading…</div> :
           feedback.slice(0, 8).map(item => (
            <div key={item.id} style={s.feedbackCard(item.sentiment)}>
              <div style={s.feedbackText}>"{item.feedback_text}"</div>
              <div style={s.feedbackMeta}>
                <span style={s.chip(SENTIMENT_COLORS[item.sentiment])}>{item.sentiment}</span>
                <span>{SOURCE_LABELS[item.source] || item.source}</span>
                {item.vertical && <span>{item.vertical}</span>}
                {item.category && <span>{item.category}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
