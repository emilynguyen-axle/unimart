/**
 * UniMart — Loyalty Points Dashboard
 * Deploy in Lovable as: /account/loyalty
 * Uses loyalty_points column on customers table
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const TIERS = [
  { name: "Explorer",  min: 0,    max: 499,  color: "#6B6560", bg: "#F1EFE8", icon: "🌱", perks: ["Free delivery on Shop orders over $30", "Early access to new meal kits"] },
  { name: "Regular",   min: 500,  max: 1499, color: "#185FA5", bg: "#E6F1FB", icon: "⭐", perks: ["Free delivery on all orders over $20", "5% off weekly meal kit order", "Priority customer support"] },
  { name: "VIP",       min: 1500, max: 3999, color: "#BA7517", bg: "#FAEEDA", icon: "🥇", perks: ["Free delivery on all orders", "10% off meal kits", "Exclusive nutritionist content", "VIP support line"] },
  { name: "Elite",     min: 4000, max: Infinity, color: "#534AB7", bg: "#EEEDFE", icon: "💎", perks: ["Free delivery always", "15% off everything", "Personal nutritionist consultation", "Beta feature access", "Dedicated account manager"] },
];

const MOCK_HISTORY = [
  { id: 1, description: "Thai Green Curry Kit order",    points: +120, type: "earn",   vertical: "Meal Kits",     date: "2026-03-20" },
  { id: 2, description: "Wagamama delivery order",       points: +85,  type: "earn",   vertical: "Food Delivery", date: "2026-03-19" },
  { id: 3, description: "Redeemed for free delivery",    points: -200, type: "redeem", vertical: null,            date: "2026-03-18" },
  { id: 4, description: "Bamboo Cutting Board Set",      points: +250, type: "earn",   vertical: "Shop",          date: "2026-03-17" },
  { id: 5, description: "Referral bonus — friend joined",points: +500, type: "bonus",  vertical: null,            date: "2026-03-15" },
  { id: 6, description: "Mushroom Risotto Kit order",    points: +110, type: "earn",   vertical: "Meal Kits",     date: "2026-03-14" },
  { id: 7, description: "Welcome bonus",                 points: +100, type: "bonus",  vertical: null,            date: "2026-03-10" },
];

const REWARDS = [
  { id: "free_delivery", label: "Free Delivery",         cost: 200,  emoji: "🚚", desc: "One free delivery on any order" },
  { id: "meal_discount", label: "10% off Meal Kit",      cost: 350,  emoji: "🥗", desc: "10% off your next meal kit order" },
  { id: "shop_voucher",  label: "$5 Shop Voucher",        cost: 500,  emoji: "🛍️", desc: "$5 credit for your next Shop order" },
  { id: "nutritionist",  label: "Nutritionist Q&A",       cost: 1000, emoji: "🏅", desc: "Ask a nutritionist one question for free" },
  { id: "month_free",    label: "Free Delivery Month",    cost: 2000, emoji: "🎁", desc: "30 days of free delivery on all orders" },
];

function getTier(points) {
  return TIERS.find(t => points >= t.min && points <= t.max) || TIERS[0];
}

function getNextTier(points) {
  const idx = TIERS.findIndex(t => points >= t.min && points <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

export default function LoyaltyDashboard() {
  const [customer, setCustomer]   = useState(null);
  const [points, setPoints]       = useState(965);
  const [history, setHistory]     = useState(MOCK_HISTORY);
  const [activeTab, setActiveTab] = useState("overview");
  const [redeeming, setRedeeming] = useState(null);
  const [redeemed, setRedeemed]   = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("customers").select("*").limit(1).single();
      if (data) {
        setCustomer(data);
        setPoints(data.loyalty_points || 965);
      }
    }
    load();
  }, []);

  async function redeemReward(reward) {
    if (points < reward.cost) return;
    setRedeeming(reward.id);
    // Update points in Supabase
    const newPoints = points - reward.cost;
    if (customer) {
      await supabase.from("customers").update({ loyalty_points: newPoints }).eq("id", customer.id);
    }
    setPoints(newPoints);
    setHistory(prev => [{
      id: Date.now(), description: `Redeemed: ${reward.label}`,
      points: -reward.cost, type: "redeem", vertical: null,
      date: new Date().toISOString().split("T")[0]
    }, ...prev]);
    setRedeeming(null);
    setRedeemed(reward.id);
    setTimeout(() => setRedeemed(null), 3000);
  }

  const tier     = getTier(points);
  const nextTier = getNextTier(points);
  const progressPct = nextTier
    ? Math.round(((points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", background: "#FAFAF9", minHeight: "100vh", color: "#1A1714" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "16px 32px", display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "20px", fontWeight: "600" }}>Uni<span style={{ color: "#6C5CE7" }}>Mart</span></span>
        <span style={{ fontSize: "13px", color: "#A09990" }}>Loyalty Programme</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Points Hero */}
        <div style={{ background: tier.bg, border: `1px solid ${tier.color}33`, borderRadius: "16px", padding: "28px 32px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "500", color: tier.color, marginBottom: "6px" }}>{tier.icon} {tier.name} Member</div>
            <div style={{ fontSize: "48px", fontWeight: "700", color: "#1A1714", letterSpacing: "-1px", lineHeight: 1 }}>{points.toLocaleString()}</div>
            <div style={{ fontSize: "14px", color: "#6B6560", marginTop: "4px" }}>points</div>
          </div>
          {nextTier && (
            <div style={{ textAlign: "right", minWidth: "200px" }}>
              <div style={{ fontSize: "12px", color: "#6B6560", marginBottom: "8px" }}>
                {(nextTier.min - points).toLocaleString()} points to {nextTier.icon} {nextTier.name}
              </div>
              <div style={{ height: "8px", background: "#E8E6E1", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: tier.color, borderRadius: "4px", transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: "11px", color: "#A09990", marginTop: "4px" }}>{progressPct}% to next tier</div>
            </div>
          )}
          {!nextTier && (
            <div style={{ background: tier.bg, border: `1px solid ${tier.color}44`, borderRadius: "10px", padding: "12px 20px", textAlign: "center" }}>
              <div style={{ fontSize: "24px", marginBottom: "4px" }}>💎</div>
              <div style={{ fontSize: "12px", fontWeight: "600", color: tier.color }}>Elite Status</div>
              <div style={{ fontSize: "11px", color: "#6B6560", marginTop: "2px" }}>Maximum tier reached</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", background: "#fff", border: "1px solid #E8E6E1", borderRadius: "10px", padding: "4px", marginBottom: "20px" }}>
          {["overview", "rewards", "history", "tiers"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, background: activeTab === tab ? "#6C5CE7" : "transparent", color: activeTab === tab ? "#fff" : "#6B6560", border: "none", borderRadius: "7px", padding: "9px", fontSize: "13px", fontWeight: activeTab === tab ? "500" : "400", cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s" }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Current perks */}
            <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>{tier.icon} Your {tier.name} Perks</div>
              {tier.perks.map((perk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < tier.perks.length - 1 ? "1px solid #F0EEE9" : "none" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: tier.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "13px", color: "#1A1714" }}>{perk}</span>
                </div>
              ))}
            </div>

            {/* How to earn */}
            <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "14px" }}>How to Earn Points</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                {[
                  { emoji: "🛍️", label: "Shop", rate: "1 pt per $0.10 spent" },
                  { emoji: "🥗", label: "Meal Kits", rate: "1 pt per $0.08 spent" },
                  { emoji: "🍔", label: "Food Delivery", rate: "1 pt per $0.12 spent" },
                  { emoji: "👥", label: "Referrals", rate: "500 pts per friend" },
                  { emoji: "⭐", label: "Reviews", rate: "50 pts per review" },
                  { emoji: "🔄", label: "Repeat orders", rate: "10% bonus pts" },
                ].map(item => (
                  <div key={item.label} style={{ background: "#FAFAF9", border: "1px solid #E8E6E1", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", marginBottom: "6px" }}>{item.emoji}</div>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#1A1714" }}>{item.label}</div>
                    <div style={{ fontSize: "11px", color: "#A09990", marginTop: "2px" }}>{item.rate}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Rewards Tab */}
        {activeTab === "rewards" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
            {REWARDS.map(reward => {
              const canAfford  = points >= reward.cost;
              const isRedeeming = redeeming === reward.id;
              const isRedeemed  = redeemed === reward.id;
              return (
                <div key={reward.id} style={{ background: "#fff", border: `1px solid ${canAfford ? "#E8E6E1" : "#F0EEE9"}`, borderRadius: "12px", padding: "20px", opacity: canAfford ? 1 : 0.6 }}>
                  <div style={{ fontSize: "28px", marginBottom: "10px" }}>{reward.emoji}</div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1A1714", marginBottom: "4px" }}>{reward.label}</div>
                  <div style={{ fontSize: "12px", color: "#6B6560", marginBottom: "14px" }}>{reward.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: canAfford ? "#6C5CE7" : "#A09990" }}>{reward.cost.toLocaleString()} pts</span>
                    <button
                      onClick={() => redeemReward(reward)}
                      disabled={!canAfford || isRedeeming}
                      style={{ background: isRedeemed ? "#E1F5EE" : canAfford ? "#6C5CE7" : "#E8E6E1", color: isRedeemed ? "#0F6E56" : canAfford ? "#fff" : "#A09990", border: "none", borderRadius: "7px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", cursor: canAfford ? "pointer" : "not-allowed" }}
                    >
                      {isRedeemed ? "✓ Redeemed!" : isRedeeming ? "…" : "Redeem"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", overflow: "hidden" }}>
            {history.map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < history.length - 1 ? "1px solid #F0EEE9" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: item.type === "earn" ? "#E1F5EE" : item.type === "bonus" ? "#EEF0FF" : "#FCEBEB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                    {item.type === "earn" ? "+" : item.type === "bonus" ? "🎁" : "−"}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#1A1714" }}>{item.description}</div>
                    <div style={{ fontSize: "11px", color: "#A09990", marginTop: "1px" }}>{item.date}{item.vertical ? ` · ${item.vertical}` : ""}</div>
                  </div>
                </div>
                <div style={{ fontSize: "15px", fontWeight: "600", color: item.points > 0 ? "#0F6E56" : "#A32D2D" }}>
                  {item.points > 0 ? "+" : ""}{item.points.toLocaleString()} pts
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tiers Tab */}
        {activeTab === "tiers" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {TIERS.map(t => {
              const isCurrent = tier.name === t.name;
              return (
                <div key={t.name} style={{ background: isCurrent ? t.bg : "#fff", border: `1px solid ${isCurrent ? t.color + "44" : "#E8E6E1"}`, borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "24px" }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: t.color }}>{t.name}</div>
                        <div style={{ fontSize: "12px", color: "#6B6560" }}>
                          {t.max === Infinity ? `${t.min.toLocaleString()}+ pts` : `${t.min.toLocaleString()} – ${t.max.toLocaleString()} pts`}
                        </div>
                      </div>
                    </div>
                    {isCurrent && <span style={{ background: t.color, color: "#fff", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>Current</span>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {t.perks.map((perk, i) => (
                      <div key={i} style={{ fontSize: "12px", color: "#6B6560", display: "flex", gap: "6px" }}>
                        <span style={{ color: t.color }}>✓</span>{perk}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
