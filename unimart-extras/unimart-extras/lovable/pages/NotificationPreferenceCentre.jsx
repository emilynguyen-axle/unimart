/**
 * UniMart — Notification Preference Centre
 * Deploy in Lovable as: /account/notifications
 * Saves to customers table notification_preferences column
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const PREFERENCE_GROUPS = [
  {
    id: "orders",
    label: "Order Updates",
    icon: "📦",
    desc: "Status changes for your active orders",
    prefs: [
      { key: "order_confirmed",     label: "Order confirmed",          default: true  },
      { key: "order_preparing",     label: "Order being prepared",     default: true  },
      { key: "order_out_delivery",  label: "Out for delivery",         default: true  },
      { key: "order_delivered",     label: "Order delivered",          default: true  },
      { key: "order_delayed",       label: "Delivery delay alerts",    default: true  },
    ],
  },
  {
    id: "shop",
    label: "Shop",
    icon: "🛍️",
    desc: "Deals, restocks, and price drops",
    prefs: [
      { key: "shop_deals",          label: "Flash deals and offers",   default: true  },
      { key: "shop_restock",        label: "Wishlist item back in stock", default: true },
      { key: "shop_price_drop",     label: "Price drop alerts",        default: false },
      { key: "shop_recommendations",label: "New recommendations for you", default: true },
    ],
  },
  {
    id: "meal_kits",
    label: "Meal Kits",
    icon: "🥗",
    desc: "Weekly menus, delivery reminders, and planner updates",
    prefs: [
      { key: "meal_kit_weekly_menu",  label: "This week's new menu",     default: true  },
      { key: "meal_kit_reminder",     label: "Meal kit delivery reminder",default: true  },
      { key: "meal_kit_planner",      label: "Meal planner suggestions", default: false },
      { key: "meal_kit_nutritionist", label: "New nutritionist-approved plans", default: true },
    ],
  },
  {
    id: "food_delivery",
    label: "Food Delivery",
    icon: "🍔",
    desc: "Driver updates, ETA changes, and local offers",
    prefs: [
      { key: "food_driver_assigned",  label: "Driver assigned",          default: true  },
      { key: "food_eta_update",       label: "ETA updates",              default: true  },
      { key: "food_nearby_offers",    label: "Offers from nearby restaurants", default: false },
      { key: "food_reorder",          label: "Reorder your favourites",  default: false },
    ],
  },
  {
    id: "account",
    label: "Account & Marketing",
    icon: "👤",
    desc: "Security alerts and promotional messages",
    prefs: [
      { key: "account_security",      label: "Security and login alerts", default: true  },
      { key: "account_refund",        label: "Refund processed",          default: true  },
      { key: "loyalty_points",        label: "Loyalty points earned",     default: true  },
      { key: "marketing_general",     label: "General marketing emails",  default: false },
      { key: "marketing_newsletter",  label: "Weekly newsletter",         default: false },
    ],
  },
];

const CHANNELS = [
  { key: "push",  label: "Push Notifications", icon: "🔔" },
  { key: "email", label: "Email",               icon: "📧" },
  { key: "sms",   label: "SMS",                 icon: "💬" },
];

export default function NotificationPreferenceCentre() {
  const [prefs, setPrefs]       = useState({});
  const [channels, setChannels] = useState({ push: true, email: true, sms: false });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // Build default prefs
  useEffect(() => {
    const defaults = {};
    PREFERENCE_GROUPS.forEach(group => {
      group.prefs.forEach(pref => { defaults[pref.key] = pref.default; });
    });

    async function load() {
      // Try to load from first customer record (demo mode)
      const { data } = await supabase.from("customers").select("id, notification_preferences").limit(1).single();
      if (data) {
        setCustomerId(data.id);
        const stored = data.notification_preferences || {};
        setPrefs({ ...defaults, ...stored });
        if (stored.channels) setChannels(stored.channels);
      } else {
        setPrefs(defaults);
      }
    }
    load();
  }, []);

  function toggle(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  }

  function toggleChannel(key) {
    setChannels(p => ({ ...p, [key]: !p[key] }));
  }

  function toggleGroup(group) {
    const allOn = group.prefs.every(p => prefs[p.key]);
    const updates = {};
    group.prefs.forEach(p => { updates[p.key] = !allOn; });
    setPrefs(prev => ({ ...prev, ...updates }));
  }

  async function save() {
    setSaving(true);
    const toSave = { ...prefs, channels };
    if (customerId) {
      await supabase.from("customers").update({ notification_preferences: toSave }).eq("id", customerId);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const totalEnabled = Object.values(prefs).filter(Boolean).length;
  const totalPrefs   = Object.keys(prefs).length;

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", background: "#FAFAF9", minHeight: "100vh", color: "#1A1714" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: "600" }}>Uni<span style={{ color: "#6C5CE7" }}>Mart</span></span>
          <span style={{ fontSize: "13px", color: "#A09990" }}>Notification Preferences</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saved && <span style={{ fontSize: "13px", color: "#0F6E56", fontWeight: "500" }}>✓ Saved</span>}
          <button onClick={save} disabled={saving} style={{ background: saving ? "#9B97D4" : "#6C5CE7", color: "#fff", border: "none", borderRadius: "8px", padding: "9px 20px", fontSize: "13px", fontWeight: "500", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save Preferences"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Summary */}
        <div style={{ background: "#EEF0FF", border: "1px solid #D4D0F8", borderRadius: "12px", padding: "16px 20px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#4A3DB5" }}>You have {totalEnabled} of {totalPrefs} notifications enabled</div>
            <div style={{ fontSize: "12px", color: "#7B75CC", marginTop: "2px" }}>Channels: {Object.entries(channels).filter(([,v]) => v).map(([k]) => k).join(", ") || "none"}</div>
          </div>
          <button onClick={() => {
            const allOn = Object.values(prefs).every(Boolean);
            const updates = {};
            Object.keys(prefs).forEach(k => { updates[k] = !allOn; });
            setPrefs(updates);
          }} style={{ background: "#fff", color: "#6C5CE7", border: "1px solid #D4D0F8", borderRadius: "8px", padding: "7px 14px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
            {Object.values(prefs).every(Boolean) ? "Disable all" : "Enable all"}
          </button>
        </div>

        {/* Delivery Channels */}
        <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "20px", marginBottom: "16px" }}>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#1A1714", marginBottom: "4px" }}>Delivery Channels</div>
          <div style={{ fontSize: "12px", color: "#A09990", marginBottom: "16px" }}>Choose how you receive notifications</div>
          <div style={{ display: "flex", gap: "10px" }}>
            {CHANNELS.map(ch => (
              <div key={ch.key} onClick={() => toggleChannel(ch.key)} style={{ flex: 1, background: channels[ch.key] ? "#EEF0FF" : "#FAFAF9", border: `1px solid ${channels[ch.key] ? "#D4D0F8" : "#E8E6E1"}`, borderRadius: "10px", padding: "14px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{ch.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: "500", color: channels[ch.key] ? "#4A3DB5" : "#6B6560" }}>{ch.label}</div>
                <div style={{ fontSize: "11px", marginTop: "4px", color: channels[ch.key] ? "#7B75CC" : "#A09990" }}>{channels[ch.key] ? "On" : "Off"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Preference Groups */}
        {PREFERENCE_GROUPS.map(group => {
          const allOn = group.prefs.every(p => prefs[p.key]);
          const someOn = group.prefs.some(p => prefs[p.key]);
          return (
            <div key={group.id} style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "20px", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>{group.icon}</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1A1714" }}>{group.label}</div>
                    <div style={{ fontSize: "12px", color: "#A09990" }}>{group.desc}</div>
                  </div>
                </div>
                {/* Group toggle */}
                <div onClick={() => toggleGroup(group)} style={{ width: "40px", height: "22px", borderRadius: "11px", background: allOn ? "#6C5CE7" : someOn ? "#D4D0F8" : "#E8E6E1", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "3px", left: allOn ? "21px" : "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {group.prefs.map((pref, i) => (
                  <div key={pref.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#FAFAF9", borderRadius: "8px", borderBottom: i < group.prefs.length - 1 ? "1px solid #F0EEE9" : "none" }}>
                    <span style={{ fontSize: "13px", color: prefs[pref.key] ? "#1A1714" : "#6B6560" }}>{pref.label}</span>
                    <div onClick={() => toggle(pref.key)} style={{ width: "34px", height: "18px", borderRadius: "9px", background: prefs[pref.key] ? "#6C5CE7" : "#E8E6E1", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: "2px", left: prefs[pref.key] ? "18px" : "2px", width: "14px", height: "14px", borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: "center", paddingTop: "12px" }}>
          <button onClick={save} disabled={saving} style={{ background: saving ? "#9B97D4" : "#6C5CE7", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 32px", fontSize: "14px", fontWeight: "500", cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save All Preferences →"}
          </button>
        </div>
      </div>
    </div>
  );
}
