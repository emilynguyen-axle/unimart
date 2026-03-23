/**
 * UniMart — Order Tracking Page with Live Leaflet Map
 * Deploy in Lovable as: /orders/track
 * Uses Leaflet.js (OpenStreetMap) — no API key needed
 * Uses Sprint 3 Replit API for live ETA + route geometry
 */

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const REPLIT_URL = "https://a75ce0cd-3571-4793-b1c6-6f68de1b2035-00-2ebxg24974l7a.picard.replit.dev:5000/";

const STATUS_STEPS = [
  { key: "Confirmed",        label: "Order Confirmed",   icon: "✓",  desc: "We've received your order" },
  { key: "Preparing",        label: "Being Prepared",    icon: "🍳", desc: "Your order is being prepared" },
  { key: "Out for Delivery", label: "Out for Delivery",  icon: "🚴", desc: "Your driver is on the way" },
  { key: "Delivered",        label: "Delivered",         icon: "📦", desc: "Enjoy!" },
];

const VERTICAL_CONFIG = {
  Shop:            { color: "#185FA5", bg: "#E6F1FB" },
  "Meal Kits":     { color: "#0F6E56", bg: "#E1F5EE" },
  "Food Delivery": { color: "#BA7517", bg: "#FAEEDA" },
  Mixed:           { color: "#534AB7", bg: "#EEEDFE" },
};

// Demo London coordinates
const DEMO_PICKUP   = [51.5155, -0.0922];
const DEMO_DELIVERY = [51.5074, -0.1278];
const DEMO_DRIVER   = [51.5110, -0.1100];

function loadLeaflet(callback) {
  if (window.L) { callback(); return; }
  const css    = document.createElement("link");
  css.rel      = "stylesheet";
  css.href     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
  document.head.appendChild(css);
  const script = document.createElement("script");
  script.src   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = callback;
  document.head.appendChild(script);
}

export default function OrderTracking() {
  const [orders, setOrders]       = useState([]);
  const [selected, setSelected]   = useState(null);
  const [tracking, setTracking]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [searchId, setSearchId]   = useState("");
  const [leafletReady, setLeafletReady] = useState(false);

  const mapDivRef     = useRef(null);
  const mapRef        = useRef(null);
  const markersRef    = useRef({});
  const routeRef      = useRef(null);
  const intervalRef   = useRef(null);

  // Load orders on mount
  useEffect(() => {
    loadOrders();
    loadLeaflet(() => setLeafletReady(true));
    return () => clearInterval(intervalRef.current);
  }, []);

  // Init map when Leaflet is ready
  useEffect(() => {
    if (!leafletReady || !mapDivRef.current) return;
    const L = window.L;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    mapRef.current = L.map(mapDivRef.current, { zoomControl: true, scrollWheelZoom: false })
      .setView(DEMO_DRIVER, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors", maxZoom: 19,
    }).addTo(mapRef.current);
  }, [leafletReady]);

  // Update map pins & route when selected order changes
  useEffect(() => {
    if (!mapRef.current || !leafletReady) return;
    const L   = window.L;
    const map = mapRef.current;

    // Clear old layers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};
    if (routeRef.current) { map.removeLayer(routeRef.current); routeRef.current = null; }

    if (!selected) return;

    const isOut       = selected.status === "Out for Delivery";
    const isDelivered = selected.status === "Delivered";

    const makeIcon = (emoji, bg) => L.divIcon({
      html: `<div style="background:${bg};border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:15px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.25);">${emoji}</div>`,
      className: "", iconAnchor: [17, 17],
    });

    markersRef.current.pickup   = L.marker(DEMO_PICKUP,   { icon: makeIcon("📦","#185FA5") }).addTo(map).bindPopup("Pickup");
    markersRef.current.delivery = L.marker(DEMO_DELIVERY, { icon: makeIcon("🏠","#0F6E56") }).addTo(map).bindPopup("Your address");

    if (isOut && !isDelivered) {
      const dLat = tracking?.driver_location?.lat || DEMO_DRIVER[0];
      const dLng = tracking?.driver_location?.lng || DEMO_DRIVER[1];
      markersRef.current.driver = L.marker([dLat, dLng], { icon: makeIcon("🚴","#BA7517") }).addTo(map).bindPopup("Your driver").openPopup();

      // Draw route from Replit, fallback to straight line
      fetch(`${REPLIT_URL}/api/routing/optimise`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup: { lat: dLat, lng: dLng }, delivery: { lat: DEMO_DELIVERY[0], lng: DEMO_DELIVERY[1] } }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.success && data.data.geometry?.coordinates) {
            const coords = data.data.geometry.coordinates.map(c => [c[1], c[0]]);
            routeRef.current = L.polyline(coords, { color: "#6C5CE7", weight: 4, opacity: 0.75, dashArray: "8 4" }).addTo(map);
          }
        })
        .catch(() => {
          routeRef.current = L.polyline([[dLat, dLng], DEMO_DELIVERY], { color: "#6C5CE7", weight: 3, opacity: 0.5, dashArray: "6 4" }).addTo(map);
        });

      map.fitBounds([[dLat, dLng], DEMO_PICKUP, DEMO_DELIVERY], { padding: [40, 40] });
    } else {
      map.fitBounds([DEMO_PICKUP, DEMO_DELIVERY], { padding: [60, 60] });
    }
  }, [selected, tracking, leafletReady]);

  // Poll tracking for live orders
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (!selected) return;
    fetchTracking(selected.id);
    if (selected.status === "Out for Delivery") {
      intervalRef.current = setInterval(() => fetchTracking(selected.id), 15000);
    }
    return () => clearInterval(intervalRef.current);
  }, [selected?.id]);

  async function loadOrders() {
    setLoading(true);
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10);
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
      setTracking({ status: selected?.status, eta_minutes: null });
    }
  }

  async function searchOrder() {
    if (!searchId.trim()) return;
    const { data } = await supabase.from("orders").select("*").eq("id", searchId.trim()).single();
    if (data) { setSelected(data); setOrders(p => [data, ...p.filter(o => o.id !== data.id)]); }
    else alert("Order not found.");
  }

  const vc      = VERTICAL_CONFIG[selected?.vertical] || VERTICAL_CONFIG["Shop"];
  const stepIdx = STATUS_STEPS.findIndex(s => s.key === (tracking?.status || selected?.status || "Confirmed"));
  const isLive  = selected?.status === "Out for Delivery";

  return (
    <div style={{ fontFamily: "'Inter','DM Sans',sans-serif", background: "#FAFAF9", minHeight: "100vh", color: "#1A1714" }}>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #E8E6E1", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px", fontWeight: "600" }}>Uni<span style={{ color: "#6C5CE7" }}>Mart</span></span>
          <span style={{ fontSize: "13px", color: "#A09990" }}>Order Tracking</span>
          {isLive && <span style={{ background: "#FAEEDA", color: "#BA7517", borderRadius: "20px", padding: "3px 10px", fontSize: "11px", fontWeight: "500" }}>● Live</span>}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input style={{ background: "#FAFAF9", border: "1px solid #E8E6E1", borderRadius: "8px", color: "#1A1714", fontSize: "13px", padding: "8px 14px", outline: "none", width: "240px", fontFamily: "inherit" }}
            placeholder="Search by order ID…" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyDown={e => e.key === "Enter" && searchOrder()} />
          <button onClick={searchOrder} style={{ background: "#6C5CE7", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
            Track
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: "calc(100vh - 57px)" }}>

        {/* Sidebar */}
        <div style={{ background: "#fff", borderRight: "1px solid #E8E6E1", padding: "18px", overflowY: "auto" }}>
          <div style={{ fontSize: "11px", fontWeight: "600", color: "#A09990", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "10px" }}>Your Orders</div>
          {loading ? <div style={{ color: "#A09990", fontSize: "13px" }}>Loading…</div> :
           orders.length === 0 ? <div style={{ color: "#A09990", fontSize: "13px" }}>No orders yet</div> :
           orders.map(order => {
             const ovc    = VERTICAL_CONFIG[order.vertical] || VERTICAL_CONFIG["Shop"];
             const active = selected?.id === order.id;
             return (
               <div key={order.id} onClick={() => setSelected(order)}
                 style={{ background: active ? ovc.bg : "#FAFAF9", border: `1px solid ${active ? ovc.color + "44" : "#E8E6E1"}`, borderRadius: "10px", padding: "11px 13px", marginBottom: "7px", cursor: "pointer", transition: "all 0.15s" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                   <span style={{ fontSize: "13px", fontWeight: "600" }}>{order.vertical}</span>
                   <span style={{ fontSize: "11px", background: ovc.bg, color: ovc.color, borderRadius: "20px", padding: "2px 8px", fontWeight: "500" }}>{order.status}</span>
                 </div>
                 <div style={{ fontSize: "12px", color: "#6B6560" }}>${order.total?.toFixed(2)}</div>
                 <div style={{ fontSize: "10px", color: "#A09990", marginTop: "2px", fontFamily: "monospace" }}>{order.id?.substring(0, 14)}…</div>
               </div>
             );
           })}
        </div>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {selected ? (
            <>
              {/* Map */}
              <div style={{ position: "relative", height: "360px", background: "#E8E6E1", flexShrink: 0 }}>
                <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />

                {/* Live ETA badge */}
                {isLive && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", background: "#fff", border: "1px solid #FAEEDA", borderRadius: "8px", padding: "8px 14px", zIndex: 1000, display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#BA7517", display: "inline-block" }} />
                    <span style={{ fontSize: "12px", fontWeight: "500", color: "#BA7517" }}>
                      {tracking?.eta_minutes ? `~${tracking.eta_minutes} min away` : "Driver en route"}
                    </span>
                  </div>
                )}

                {/* Map legend */}
                <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(255,255,255,0.95)", border: "1px solid #E8E6E1", borderRadius: "8px", padding: "8px 12px", zIndex: 1000, fontSize: "11px", color: "#6B6560", lineHeight: "1.8" }}>
                  <div>📦 Pickup</div>
                  <div>🏠 Your address</div>
                  {isLive && <div>🚴 Driver (live)</div>}
                </div>
              </div>

              {/* Detail panel */}
              <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

                {/* Status progress */}
                <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "20px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: "600" }}>{selected.vertical} Order</div>
                      <div style={{ fontSize: "12px", color: "#A09990" }}>{new Date(selected.created_at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "600" }}>${selected.total?.toFixed(2)}</div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", top: "17px", left: "17px", right: "17px", height: "2px", background: "#E8E6E1" }} />
                    <div style={{ position: "absolute", top: "17px", left: "17px", height: "2px", background: vc.color, width: `${stepIdx >= 0 ? (stepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%`, transition: "width 0.5s", zIndex: 1 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", position: "relative", zIndex: 2 }}>
                      {STATUS_STEPS.map((step, i) => {
                        const done    = i <= stepIdx;
                        const current = i === stepIdx;
                        return (
                          <div key={step.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: done ? vc.color : "#fff", border: `2px solid ${done ? vc.color : "#E8E6E1"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", boxShadow: current ? `0 0 0 4px ${vc.color}22` : "none", transition: "all 0.3s" }}>
                              {done ? <span style={{ color: "#fff", fontSize: "11px" }}>{step.icon}</span> : <span style={{ color: "#A09990", fontSize: "10px" }}>{i + 1}</span>}
                            </div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "11px", fontWeight: done ? "600" : "400", color: done ? "#1A1714" : "#A09990" }}>{step.label}</div>
                              {current && <div style={{ fontSize: "10px", color: vc.color, marginTop: "1px" }}>{step.desc}</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div style={{ background: "#fff", border: "1px solid #E8E6E1", borderRadius: "12px", padding: "18px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>Order Items</div>
                  {(selected.items || []).map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < (selected.items?.length || 0) - 1 ? "1px solid #F0EEE9" : "none" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "500" }}>{item.title}</div>
                        <div style={{ fontSize: "11px", color: "#A09990" }}>Qty: {item.qty || item.quantity || 1}</div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "600" }}>${((item.price || 0) * (item.qty || item.quantity || 1)).toFixed(2)}</div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", fontSize: "14px", fontWeight: "600" }}>
                    <span>Total</span><span>${selected.total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "column", gap: "12px", color: "#A09990" }}>
              <div style={{ fontSize: "48px" }}>📦</div>
              <div>Select an order from the list to track it</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
