/**
 * UniMart — Order Tracking Page
 * Deploy in Lovable as: /orders/track
 * Uses Sprint 3 Replit API for live tracking data
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const REPLIT_URL = "https://YOUR_REPLIT_URL:5000";

const STATUS_STEPS = [
  { key: "Confirmed",          label: "Order Confirmed",       icon: "✓",  desc: "We've received your order" },
  { key: "Preparing",          label: "Being Prepared",        icon: "🍳", desc: "Your order is being prepared" },
  { key: "Out for Delivery",   label: "Out for Delivery",      icon: "🚴", desc: "Your driver is on the way" },
  { key: "Delivered",          label: "Delivered",             icon: "📦", desc: "Enjoy!" },
];

const VERTICAL_CONFIG = {
  Shop:           { color: "#185FA5", bg: "#E6F1FB", label: "Shop",          eta: "2-3 days" },
  "Meal Kits":    { color: "#0F6E56", bg: "#E1F5EE", label: "Meal Kits",     eta: "Next day" },
  "Food Delivery":{ color: "#BA7517", bg: "#FAEEDA", label: "Food Delivery", eta: "25-40 min" },
  Mixed:          { color: "#534AB7", bg: "#EEEDFE", label: "Mixed",         eta: "Varies" },
};

export default function OrderTracking() {
  const [orders, setOrders]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [tracking, setTracking]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [searchId, setSearchId]   = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    loadOrders();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    if (selected) {
      fetchTracking(selected.id);
      intervalRef.current = setInterval(() => fetchTracking(selected.id), 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [selected]);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    setOrders(data || []);
    if (data?.length > 0) setSelected(data[0]);
    setLoading(false);
  }

  async function fetchTracking(orderId) {
    try {
      const res  = await fetch(`${REPLIT_URL}/api/delivery/track/${orderId}`);
      const data = await res.json();
      if (data.success) setTracking(data.data);
    } catch {
      setTracking({ status: selected?.status, eta_minutes: null, driver_location: null });
    }
  }

  async function searchOrder() {
    if (!searchId.trim()) return;
    const { data } = await supabase.from("orders").select("*").eq("id", searchId.trim()).single();
    if (data) { setSelected(data); setOrders(prev => [data, ...prev.filter(o => o.id !== data.id)]); }
    else alert("Order not found. Please check your order ID.");
  }

  function getStepIndex(status) {
    return STATUS_STEPS.findIndex(s => s.key === status);
  }

  const vc = VERTICAL_CONFIG[selected?.vertical] || VERTICAL_CONFIG["Shop"];
  const stepIdx = getStepIndex(tracking?.status || selected?.status || "Confirmed");

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif", background: "#FAFAF9", minHeight: "100vh", color: "#1A1714" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: "600", color: "#1A1714" }}>Uni<span style={{ color: "#6C5CE7" }}>Mart</span></span>
          <span style={{ fontSize: "13px", color: "#A09990" }}>Order Tracking</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            style={{ background: "#FAFAF9", border: "1px solid #E8E6E1", borderRadius: "8px", color: "#1A1714", fontSize: "13px", padding: "8px 14px", outline: "none", width: "260px", fontFamily: "inherit" }}
            placeholder="Enter order ID to search…"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && searchOrder()}
          />
          <button onClick={searchOrder} style={{ background: "#6C5CE7", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Track
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 32px", display: "grid", gridTemplateColumns: "300px 1fr", gap: "20px" }}>

        {/* Order List */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: "600", color: "#A09990", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "12px" }}>Your Orders</div>
          {loading ? <div style={{ color: "#A09990", fontSize: "13px" }}>Loading…</div> :
           orders.length === 0 ? <div style={{ color: "#A09990", fontSize: "13px" }}>No orders found</div> :
           orders.map(order => {
             const ovc = VERTICAL_CONFIG[order.vertical] || VERTICAL_CONFIG["Shop"];
             const isActive = selected?.id === order.id;
             return (
               <div key={order.id} onClick={() => setSelected(order)} style={{ background: isActive ? ovc.bg : "#fff", border: `1px solid ${isActive ? ovc.color + "44" : "#E8E6E1"}`, borderRadius: "10px", padding: "14px", marginBottom: "8px", cursor: "pointer", transition: "all 0.15s" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                   <span style={{ fontSize: "13px", fontWeight: "600", color: "#1A1714" }}>{order.vertical}</span>
                   <span style={{ fontSize: "12px", background: ovc.bg, color: ovc.color, borderRadius: "20px", padding: "2px 8px", fontWeight: "500" }}>{order.status}</span>
                 </div>
                 <div style={{ fontSize: "12px", color: "#6B6560" }}>${order.total?.toFixed(2)} · {new Date(order.created_at).toLocaleDateString()}</div>
                 <div style={{ fontSize: "11px", color: "#A09990", marginTop: "4px", fontFamily: "monospace" }}>{order.id?.substring(0, 16)}…</div>
               </div>
             );
           })}
        </div>

        {/* Tracking Detail */}
        {selected ? (
          <div>
            {/* Order Summary */}
            <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "22px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "18px", fontWeight: "600", color: "#1A1714", marginBottom: "4px" }}>{selected.vertical} Order</div>
                  <div style={{ fontSize: "13px", color: "#6B6560" }}>
                    {new Date(selected.created_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "22px", fontWeight: "600", color: "#1A1714" }}>${selected.total?.toFixed(2)}</div>
                  <div style={{ fontSize: "12px", color: "#A09990" }}>incl. ${selected.delivery_fee?.toFixed(2)} delivery</div>
                </div>
              </div>

              {/* ETA Banner */}
              {tracking?.eta_minutes && selected.status !== "Delivered" && (
                <div style={{ background: vc.bg, border: `1px solid ${vc.color}33`, borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "20px" }}>🕐</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: vc.color }}>Arriving in ~{tracking.eta_minutes} minutes</div>
                    <div style={{ fontSize: "12px", color: "#6B6560" }}>Live estimate · updates every 15 seconds</div>
                  </div>
                </div>
              )}

              {/* Progress Steps */}
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: "20px", left: "19px", right: "19px", height: "2px", background: "#E8E6E1", zIndex: 0 }} />
                <div style={{ position: "absolute", top: "20px", left: "19px", height: "2px", background: vc.color, zIndex: 1, width: `${stepIdx >= 0 ? (stepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%`, transition: "width 0.5s ease" }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", position: "relative", zIndex: 2 }}>
                  {STATUS_STEPS.map((step, i) => {
                    const done    = i <= stepIdx;
                    const current = i === stepIdx;
                    return (
                      <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: done ? vc.color : "#fff", border: `2px solid ${done ? vc.color : "#E8E6E1"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", transition: "all 0.3s", boxShadow: current ? `0 0 0 4px ${vc.color}22` : "none" }}>
                          {done ? <span style={{ color: "#fff", fontSize: "14px" }}>{step.icon}</span> : <span style={{ color: "#A09990", fontSize: "12px" }}>{i + 1}</span>}
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "12px", fontWeight: done ? "600" : "400", color: done ? "#1A1714" : "#A09990" }}>{step.label}</div>
                          {current && <div style={{ fontSize: "11px", color: vc.color, marginTop: "2px" }}>{step.desc}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "14px", fontWeight: "600", color: "#1A1714", marginBottom: "14px" }}>Order Items</div>
              {(selected.items || []).map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < selected.items.length - 1 ? "1px solid #E8E6E1" : "none" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500", color: "#1A1714" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "#A09990" }}>Qty: {item.qty || item.quantity || 1}</div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1A1714" }}>${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}</div>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", fontSize: "15px", fontWeight: "600", color: "#1A1714" }}>
                <span>Total</span>
                <span>${selected.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "60px", textAlign: "center", color: "#A09990" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>📦</div>
            <div style={{ fontSize: "15px" }}>Select an order or search by order ID</div>
          </div>
        )}
      </div>
    </div>
  );
}
