/**
 * UniMart Sprint 3 — Customer App: Home Feed & Smart Cart
 * US-08: Customer-Facing App
 * Deploy in Lovable as: /app/home
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const REPLIT_URL = "https://YOUR_REPLIT_URL:5000";

const VERTICAL_CONFIG = {
  Shop:          { emoji: "🛍️", color: "#5B8AF7", bg: "#0D1A2E", label: "Shop",         eta: "2-3 days" },
  "Meal Kits":   { emoji: "🥗", color: "#00B894", bg: "#0D2A1E", label: "Meal Kits",    eta: "Next day" },
  "Food Delivery":{ emoji: "🍔", color: "#F7A954", bg: "#2A1A0D", label: "Food Delivery",eta: "25-40 min" },
};

const s = {
  root:      { fontFamily: "'DM Sans', sans-serif", background: "#090B12", minHeight: "100vh", color: "#E2E4EF" },
  header:    { background: "#0D0F1C", borderBottom: "1px solid #181B2E", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 },
  logo:      { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  cartBtn:   (count) => ({ background: count > 0 ? "#6C5CE7" : "#181B2E", color: "#fff", border: "none", borderRadius: "20px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }),
  body:      { padding: "24px", maxWidth: "1200px", margin: "0 auto" },
  greeting:  { fontSize: "24px", fontWeight: "700", color: "#fff", marginBottom: "4px" },
  subtext:   { fontSize: "14px", color: "#6B7090", marginBottom: "24px" },
  vertTabs:  { display: "flex", gap: "10px", marginBottom: "28px" },
  vertTab:   (active, vc) => ({ background: active ? vc.bg : "#0D0F1C", border: `1px solid ${active ? vc.color : "#181B2E"}`, borderRadius: "12px", padding: "10px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", transition: "all 0.15s" }),
  vertLabel: (active, vc) => ({ fontSize: "13px", fontWeight: "600", color: active ? vc.color : "#6B7090" }),
  sectionTitle: { fontSize: "16px", fontWeight: "700", color: "#fff", marginBottom: "14px" },
  productGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "14px", marginBottom: "32px" },
  productCard: (vc) => ({ background: "#0D0F1C", border: `1px solid #181B2E`, borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "all 0.15s", borderTop: `3px solid ${vc.color}` }),
  productImg:  (vc) => ({ height: "100px", background: vc.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }),
  productBody: { padding: "12px" },
  productTitle:{ fontSize: "13px", fontWeight: "600", color: "#E2E4EF", marginBottom: "4px" },
  productPrice:{ fontSize: "14px", fontWeight: "700", color: "#fff" },
  productEta:  (vc) => ({ fontSize: "11px", color: vc.color, marginTop: "2px" }),
  addBtn:      (vc) => ({ background: vc.color + "22", color: vc.color, border: `1px solid ${vc.color}44`, borderRadius: "6px", padding: "5px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginTop: "8px", width: "100%" }),
  aiBar:       { background: "#12102A", border: "1px solid #6C5CE733", borderRadius: "12px", padding: "16px", marginBottom: "28px", display: "flex", gap: "12px", alignItems: "center" },
  aiInput:     { flex: 1, background: "#090B12", border: "1px solid #252840", borderRadius: "8px", color: "#E2E4EF", fontSize: "14px", padding: "10px 14px", outline: "none", fontFamily: "inherit" },
  aiSendBtn:   { background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  aiResponse:  { background: "#0D0F1C", border: "1px solid #6C5CE733", borderRadius: "10px", padding: "14px", marginTop: "12px", fontSize: "13px", color: "#C4B5FF", lineHeight: "1.6" },
  cartDrawer:  (open) => ({ position: "fixed", right: open ? 0 : "-420px", top: 0, bottom: 0, width: "400px", background: "#0D0F1C", borderLeft: "1px solid #181B2E", padding: "24px", zIndex: 200, transition: "right 0.3s ease", overflowY: "auto" }),
  cartTitle:   { fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "20px", display: "flex", justifyContent: "space-between" },
  cartItem:    (vc) => ({ background: "#090B12", border: `1px solid ${vc?.color || "#181B2E"}22`, borderLeft: `3px solid ${vc?.color || "#6C5CE7"}`, borderRadius: "8px", padding: "12px", marginBottom: "8px" }),
  cartItemTitle: { fontSize: "13px", fontWeight: "600", color: "#E2E4EF" },
  cartItemMeta:  { fontSize: "11px", color: "#6B7090", marginTop: "2px" },
  cartTotal:   { borderTop: "1px solid #181B2E", paddingTop: "16px", marginTop: "16px" },
  checkoutBtn: { background: "linear-gradient(135deg,#6C5CE7,#A29BFE)", color: "#fff", border: "none", borderRadius: "10px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer", width: "100%", marginTop: "12px" },
  overlay:     (open) => ({ position: "fixed", inset: 0, background: "#00000066", zIndex: 150, display: open ? "block" : "none" }),
  badge:       (color) => ({ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: "600" }),
};

export default function CustomerHomeFeed() {
  const [products, setProducts]     = useState([]);
  const [activeVertical, setActiveVertical] = useState("All");
  const [cart, setCart]             = useState([]);
  const [cartOpen, setCartOpen]     = useState(false);
  const [aiMessage, setAiMessage]   = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading]   = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function loadProducts() {
      const { data } = await supabase.from("products").select("*").eq("in_stock", true).order("rating", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    }
    loadProducts();
  }, []);

  const filtered = activeVertical === "All"
    ? products
    : products.filter(p => p.vertical === activeVertical);

  function addToCart(product) {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  const cartTotal   = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount   = cart.reduce((sum, i) => sum + i.qty, 0);
  const mixedCart   = new Set(cart.map(i => i.vertical)).size > 1;
  const verticals   = ["All", "Shop", "Meal Kits", "Food Delivery"];

  async function sendAiMessage() {
    if (!aiMessage.trim()) return;
    setAiLoading(true);
    try {
      const res  = await fetch(`${REPLIT_URL}/api/chat/message`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: aiMessage, session_id: `session-${Date.now()}` })
      });
      const data = await res.json();
      setAiResponse(data.data);
    } catch (e) {
      setAiResponse({ response: "Sorry, I'm having trouble connecting right now. Please try again.", intent: "error" });
    }
    setAiLoading(false);
    setAiMessage("");
  }

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <span style={s.logo}>UniMart</span>
        <button style={s.cartBtn(cartCount)} onClick={() => setCartOpen(true)}>
          🛒 {cartCount > 0 ? `${cartCount} items · $${cartTotal.toFixed(2)}` : "Cart"}
        </button>
      </div>

      <div style={s.body}>
        <div style={s.greeting}>Good morning 👋</div>
        <div style={s.subtext}>Shop, cook, and eat — all in one place.</div>

        {/* AI Assistant */}
        <div style={s.aiBar}>
          <span style={{ fontSize: "20px" }}>✨</span>
          <input
            style={s.aiInput}
            placeholder="Ask me anything — 'I want Thai food' or 'recommend a vegan meal kit'…"
            value={aiMessage}
            onChange={e => setAiMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendAiMessage()}
          />
          <button style={s.aiSendBtn} onClick={sendAiMessage} disabled={aiLoading}>
            {aiLoading ? "…" : "Ask"}
          </button>
        </div>
        {aiResponse && (
          <div style={s.aiResponse}>
            <span style={s.badge("#A29BFE")}>{aiResponse.vertical || "UniMart AI"}</span>
            {" "}{aiResponse.response}
          </div>
        )}

        {/* Vertical Tabs */}
        <div style={s.vertTabs}>
          {verticals.map(v => {
            const vc = VERTICAL_CONFIG[v] || { color: "#6C5CE7", bg: "#12102A", emoji: "🏪" };
            return (
              <div key={v} style={s.vertTab(activeVertical === v, vc)} onClick={() => setActiveVertical(v)}>
                <span>{vc.emoji || "🏪"}</span>
                <span style={s.vertLabel(activeVertical === v, vc)}>{v}</span>
              </div>
            );
          })}
        </div>

        {/* Products */}
        <div style={s.sectionTitle}>
          {activeVertical === "All" ? "Featured for you" : VERTICAL_CONFIG[activeVertical]?.label}
          <span style={{ fontSize: "13px", color: "#6B7090", fontWeight: "400", marginLeft: "8px" }}>
            {filtered.length} items
          </span>
        </div>

        {loading ? (
          <div style={{ color: "#4A4F6A", textAlign: "center", padding: "40px" }}>Loading products…</div>
        ) : (
          <div style={s.productGrid}>
            {filtered.map(product => {
              const vc = VERTICAL_CONFIG[product.vertical] || VERTICAL_CONFIG["Shop"];
              return (
                <div key={product.id} style={s.productCard(vc)}>
                  <div style={s.productImg(vc)}>{vc.emoji}</div>
                  <div style={s.productBody}>
                    <div style={s.productTitle}>{product.title}</div>
                    <div style={s.productPrice}>${product.price?.toFixed(2)}</div>
                    <div style={s.productEta(vc)}>🕐 {vc.eta}</div>
                    {product.allergens?.length > 0 && (
                      <div style={{ fontSize: "11px", color: "#F7A954", marginTop: "4px" }}>
                        ⚠️ {product.allergens.join(", ")}
                      </div>
                    )}
                    <button style={s.addBtn(vc)} onClick={() => addToCart(product)}>+ Add to cart</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart Overlay */}
      <div style={s.overlay(cartOpen)} onClick={() => setCartOpen(false)} />

      {/* Cart Drawer */}
      <div style={s.cartDrawer(cartOpen)}>
        <div style={s.cartTitle}>
          <span>Your Cart</span>
          <button onClick={() => setCartOpen(false)} style={{ background: "none", border: "none", color: "#6B7090", fontSize: "20px", cursor: "pointer" }}>✕</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", color: "#4A4F6A", padding: "40px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>🛒</div>
            Your cart is empty
          </div>
        ) : (
          <>
            {mixedCart && (
              <div style={{ background: "#1A1A2E", border: "1px solid #6C5CE733", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px", color: "#A29BFE" }}>
                ℹ️ Mixed cart — items have different delivery timelines. Shown per item below.
              </div>
            )}
            {cart.map(item => {
              const vc = VERTICAL_CONFIG[item.vertical] || VERTICAL_CONFIG["Shop"];
              return (
                <div key={item.id} style={s.cartItem(vc)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={s.cartItemTitle}>{item.title}</div>
                      <div style={s.cartItemMeta}>
                        <span style={s.badge(vc.color)}>{item.vertical}</span>
                        {" "}{vc.eta}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "14px", fontWeight: "700", color: "#fff" }}>${(item.price * item.qty).toFixed(2)}</div>
                      <div style={{ fontSize: "12px", color: "#6B7090" }}>x{item.qty}</div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: "none", border: "none", color: "#F76B8A", fontSize: "12px", cursor: "pointer", marginTop: "6px" }}>Remove</button>
                </div>
              );
            })}
            <div style={s.cartTotal}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#8890AA", marginBottom: "6px" }}>
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#8890AA", marginBottom: "6px" }}>
                <span>Delivery</span><span>Calculated at checkout</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: "700", color: "#fff" }}>
                <span>Total</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <button style={s.checkoutBtn}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
