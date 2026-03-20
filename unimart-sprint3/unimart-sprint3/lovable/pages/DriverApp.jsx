/**
 * UniMart Sprint 3 — Delivery Driver App
 * US-09: Delivery Driver App
 * Deploy in Lovable as: /driver/app
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const REPLIT_URL = "https://YOUR_REPLIT_URL:5000";

const s = {
  root:     { fontFamily: "'DM Sans', sans-serif", background: "#080A10", minHeight: "100vh", color: "#E2E4EF", maxWidth: "430px", margin: "0 auto" },
  header:   { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logo:     { fontSize: "18px", fontWeight: "700", color: "#6C5CE7" },
  statusPill: (online) => ({ background: online ? "#00B89422" : "#F76B8A22", color: online ? "#00B894" : "#F76B8A", border: `1px solid ${online ? "#00B89444" : "#F76B8A44"}`, borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }),
  body:     { padding: "20px" },
  earningsCard: { background: "linear-gradient(135deg, #1A1060, #0D1A3A)", border: "1px solid #6C5CE733", borderRadius: "16px", padding: "22px", marginBottom: "20px" },
  earningsLabel: { fontSize: "12px", color: "#8890AA", marginBottom: "4px" },
  earningsAmount: { fontSize: "32px", fontWeight: "700", color: "#fff", marginBottom: "12px" },
  earningsRow: { display: "flex", gap: "16px" },
  earningsStat: { flex: 1, background: "#ffffff11", borderRadius: "8px", padding: "10px" },
  earningsStatNum: { fontSize: "16px", fontWeight: "700", color: "#A29BFE" },
  earningsStatLabel: { fontSize: "11px", color: "#6B7090", marginTop: "2px" },
  sectionTitle: { fontSize: "14px", fontWeight: "700", color: "#8890AA", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px", marginTop: "24px" },
  jobCard:  (status) => ({
    background: status === "Available" ? "#0D1A2E" : "#0D2A1E",
    border: `1px solid ${status === "Available" ? "#5B8AF744" : "#00B89444"}`,
    borderRadius: "14px", padding: "18px", marginBottom: "12px",
  }),
  jobHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" },
  jobPay:   { fontSize: "20px", fontWeight: "700", color: "#fff" },
  jobBadge: (status) => ({ background: status === "Available" ? "#5B8AF722" : "#00B89422", color: status === "Available" ? "#5B8AF7" : "#00B894", border: `1px solid ${status === "Available" ? "#5B8AF744" : "#00B89444"}`, borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "700" }),
  jobAddress: { fontSize: "13px", color: "#8890AA", marginBottom: "4px" },
  jobAddressVal: { fontSize: "14px", color: "#E2E4EF", fontWeight: "500", marginBottom: "10px" },
  jobMeta:  { display: "flex", gap: "12px" },
  jobMetaItem: { fontSize: "12px", color: "#6B7090" },
  acceptBtn: { background: "linear-gradient(135deg,#00B894,#00D4A8)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%", marginTop: "12px" },
  navBar:   { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "430px", background: "#0D0F1C", borderTop: "1px solid #181B2E", display: "flex", padding: "12px 0 20px" },
  navItem:  (active) => ({ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }),
  navIcon:  (active) => ({ fontSize: "20px", filter: active ? "none" : "grayscale(1) opacity(0.4)" }),
  navLabel: (active) => ({ fontSize: "10px", color: active ? "#6C5CE7" : "#4A4F6A", fontWeight: active ? "700" : "400" }),
  routeCard: { background: "#0D1A2E", border: "1px solid #5B8AF744", borderRadius: "14px", padding: "18px", marginBottom: "12px" },
  routeStep: { display: "flex", gap: "12px", marginBottom: "10px", alignItems: "flex-start" },
  routeDot:  (color) => ({ width: "10px", height: "10px", borderRadius: "50%", background: color, marginTop: "4px", flexShrink: 0 }),
  routeText: { fontSize: "13px", color: "#C4C8E0", lineHeight: "1.5" },
  bigBtn:    (color) => ({ background: color, color: "#fff", border: "none", borderRadius: "14px", padding: "18px", fontSize: "16px", fontWeight: "700", cursor: "pointer", width: "100%", marginBottom: "12px" }),
};

const MOCK_JOBS = [
  { id: "job-001", status: "Available", pay: 8.50,  pickup: "Wagamama, 101 High St",    delivery: "15 Park Lane, SW1",   distance: "2.3km", eta: "12 min" },
  { id: "job-002", status: "Available", pay: 6.20,  pickup: "Dishoom, 22 Carnaby St",   delivery: "8 Oxford Rd, W1",     distance: "1.8km", eta: "9 min"  },
  { id: "job-003", status: "Available", pay: 11.00, pickup: "Pizza Palace, 55 Brick Ln", delivery: "32 Bethnal Green Rd", distance: "3.1km", eta: "16 min" },
];

export default function DriverApp() {
  const [activeTab, setActiveTab]   = useState("jobs");
  const [jobs, setJobs]             = useState(MOCK_JOBS);
  const [activeJob, setActiveJob]   = useState(null);
  const [isOnline, setIsOnline]     = useState(false);
  const [route, setRoute]           = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [earnings, setEarnings]     = useState({ today: 47.50, week: 218.00, deliveries: 6 });

  async function acceptJob(job) {
    setActiveJob(job);
    setActiveTab("active");
    setRouteLoading(true);
    try {
      const res  = await fetch(`${REPLIT_URL}/api/routing/optimise`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup:   { lat: 51.5074, lng: -0.1278 },
          delivery: { lat: 51.5155, lng: -0.0922 },
        })
      });
      const data = await res.json();
      if (data.success) setRoute(data.data);
    } catch (e) {
      setRoute({ eta_minutes: job.eta.replace(" min",""), distance_km: job.distance.replace("km",""), steps: ["Head north on High Street", "Turn right onto Park Lane", "Destination on the left"] });
    }
    setRouteLoading(false);
    setJobs(prev => prev.filter(j => j.id !== job.id));
  }

  function completeDelivery() {
    setEarnings(prev => ({ today: prev.today + activeJob.pay, week: prev.week + activeJob.pay, deliveries: prev.deliveries + 1 }));
    setActiveJob(null);
    setRoute(null);
    setActiveTab("jobs");
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>UniMart Driver</span>
        <button style={s.statusPill(isOnline)} onClick={() => setIsOnline(p => !p)}>
          {isOnline ? "🟢 Online" : "⚫ Offline"}
        </button>
      </div>

      <div style={{ ...s.body, paddingBottom: "80px" }}>

        {/* Earnings Card */}
        <div style={s.earningsCard}>
          <div style={s.earningsLabel}>Today's Earnings</div>
          <div style={s.earningsAmount}>${earnings.today.toFixed(2)}</div>
          <div style={s.earningsRow}>
            <div style={s.earningsStat}>
              <div style={s.earningsStatNum}>{earnings.deliveries}</div>
              <div style={s.earningsStatLabel}>Deliveries</div>
            </div>
            <div style={s.earningsStat}>
              <div style={s.earningsStatNum}>${earnings.week.toFixed(2)}</div>
              <div style={s.earningsStatLabel}>This week</div>
            </div>
            <div style={s.earningsStat}>
              <div style={s.earningsStatNum}>4.92 ⭐</div>
              <div style={s.earningsStatLabel}>Rating</div>
            </div>
          </div>
        </div>

        {/* Jobs Tab */}
        {activeTab === "jobs" && (
          <>
            <div style={s.sectionTitle}>
              {isOnline ? `${jobs.length} Available Jobs` : "Go online to see jobs"}
            </div>
            {!isOnline && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#4A4F6A" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚫</div>
                Tap Online above to start receiving delivery requests
              </div>
            )}
            {isOnline && jobs.map(job => (
              <div key={job.id} style={s.jobCard(job.status)}>
                <div style={s.jobHeader}>
                  <div style={s.jobPay}>${job.pay.toFixed(2)}</div>
                  <span style={s.jobBadge(job.status)}>{job.status}</span>
                </div>
                <div style={s.jobAddress}>📦 Pickup</div>
                <div style={s.jobAddressVal}>{job.pickup}</div>
                <div style={s.jobAddress}>📍 Delivery</div>
                <div style={s.jobAddressVal}>{job.delivery}</div>
                <div style={s.jobMeta}>
                  <span style={s.jobMetaItem}>📏 {job.distance}</span>
                  <span style={s.jobMetaItem}>⏱ {job.eta}</span>
                </div>
                <button style={s.acceptBtn} onClick={() => acceptJob(job)}>Accept Job →</button>
              </div>
            ))}
          </>
        )}

        {/* Active Delivery Tab */}
        {activeTab === "active" && (
          <>
            <div style={s.sectionTitle}>Active Delivery</div>
            {!activeJob ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#4A4F6A" }}>
                No active delivery — accept a job from the Jobs tab
              </div>
            ) : (
              <>
                <div style={s.jobCard("active")}>
                  <div style={s.jobHeader}>
                    <div style={s.jobPay}>${activeJob.pay.toFixed(2)}</div>
                    <span style={s.jobBadge("active")}>🚴 In Progress</span>
                  </div>
                  <div style={s.jobAddress}>📦 Pickup</div>
                  <div style={s.jobAddressVal}>{activeJob.pickup}</div>
                  <div style={s.jobAddress}>📍 Deliver to</div>
                  <div style={s.jobAddressVal}>{activeJob.delivery}</div>
                </div>

                {/* Route */}
                <div style={s.sectionTitle}>AI Optimised Route</div>
                <div style={s.routeCard}>
                  {routeLoading ? (
                    <div style={{ color: "#6B7090", fontSize: "13px" }}>Calculating optimal route…</div>
                  ) : route ? (
                    <>
                      <div style={{ display: "flex", gap: "16px", marginBottom: "14px" }}>
                        <div style={{ background: "#5B8AF722", borderRadius: "8px", padding: "8px 14px", fontSize: "14px", fontWeight: "700", color: "#5B8AF7" }}>
                          ⏱ {route.eta_minutes} min
                        </div>
                        <div style={{ background: "#A29BFE22", borderRadius: "8px", padding: "8px 14px", fontSize: "14px", fontWeight: "700", color: "#A29BFE" }}>
                          📏 {route.distance_km} km
                        </div>
                      </div>
                      {(route.steps || []).map((step, i) => (
                        <div key={i} style={s.routeStep}>
                          <div style={s.routeDot(i === 0 ? "#00B894" : "#5B8AF7")} />
                          <div style={s.routeText}>{step}</div>
                        </div>
                      ))}
                    </>
                  ) : null}
                </div>

                <button style={s.bigBtn("#5B8AF7")}>📦 Confirm Pickup</button>
                <button style={s.bigBtn("#00B894")} onClick={completeDelivery}>✅ Confirm Delivery</button>
              </>
            )}
          </>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <>
            <div style={s.sectionTitle}>Earnings Breakdown</div>
            {[
              { label: "Today", value: `$${earnings.today.toFixed(2)}`, sub: `${earnings.deliveries} deliveries` },
              { label: "This Week", value: `$${earnings.week.toFixed(2)}`, sub: "Mon–Sun" },
              { label: "Average per Delivery", value: `$${(earnings.today / Math.max(earnings.deliveries, 1)).toFixed(2)}`, sub: "Today" },
            ].map(stat => (
              <div key={stat.label} style={{ background: "#0D0F1C", border: "1px solid #181B2E", borderRadius: "12px", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "13px", color: "#8890AA" }}>{stat.label}</div>
                  <div style={{ fontSize: "11px", color: "#4A4F6A", marginTop: "2px" }}>{stat.sub}</div>
                </div>
                <div style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>{stat.value}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Nav Bar */}
      <div style={s.navBar}>
        {[
          { id: "jobs",     icon: "📋", label: "Jobs" },
          { id: "active",   icon: "🚴", label: "Active" },
          { id: "earnings", icon: "💰", label: "Earnings" },
        ].map(tab => (
          <div key={tab.id} style={s.navItem(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
            <span style={s.navIcon(activeTab === tab.id)}>{tab.icon}</span>
            <span style={s.navLabel(activeTab === tab.id)}>{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
