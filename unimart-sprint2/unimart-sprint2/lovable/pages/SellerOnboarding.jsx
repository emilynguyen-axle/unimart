/**
 * UniMart Sprint 2 — Seller Onboarding Portal
 * US-05: Seller Onboarding & Compliance
 *
 * Deploy in Lovable as a page/route: /seller/onboarding
 * Uses Lovable's built-in Supabase client
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const VERTICALS = ["Shop", "Meal Kits", "Food Delivery"];

const STEPS = [
  { id: 1, label: "Business Details" },
  { id: 2, label: "Vertical & Products" },
  { id: 3, label: "Documents" },
  { id: 4, label: "Review & Submit" },
];

const s = {
  root: { fontFamily: "'DM Sans', sans-serif", background: "#0A0C14", minHeight: "100vh", color: "#E2E4EF" },
  header: { background: "#0F1220", borderBottom: "1px solid #1C2035", padding: "18px 40px", display: "flex", alignItems: "center", gap: "16px" },
  logo: { fontSize: "20px", fontWeight: "700", color: "#6C5CE7" },
  badge: { background: "#6C5CE722", color: "#A29BFE", border: "1px solid #6C5CE744", borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" },
  body: { maxWidth: "760px", margin: "0 auto", padding: "40px 24px" },
  stepBar: { display: "flex", gap: "0", marginBottom: "40px" },
  step: (active, done) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  }),
  stepDot: (active, done) => ({
    width: "32px", height: "32px", borderRadius: "50%",
    background: done ? "#00B894" : active ? "#6C5CE7" : "#1C2035",
    border: `2px solid ${done ? "#00B894" : active ? "#6C5CE7" : "#2A2D45"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "700",
    color: done || active ? "#fff" : "#4A4F6A",
    transition: "all 0.2s",
  }),
  stepLabel: (active, done) => ({
    fontSize: "11px", fontWeight: "600",
    color: done ? "#00B894" : active ? "#A29BFE" : "#4A4F6A",
    textAlign: "center",
  }),
  stepLine: (done) => ({
    flex: 1, height: "2px", background: done ? "#00B894" : "#1C2035",
    alignSelf: "flex-start", marginTop: "15px", transition: "background 0.3s",
  }),
  card: { background: "#0F1220", border: "1px solid #1C2035", borderRadius: "16px", padding: "32px", marginBottom: "24px" },
  cardTitle: { fontSize: "18px", fontWeight: "700", color: "#fff", marginBottom: "6px" },
  cardSub: { fontSize: "13px", color: "#6B7090", marginBottom: "24px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#8890AA", display: "block", marginBottom: "6px", marginTop: "16px" },
  input: { width: "100%", background: "#080A11", border: "1px solid #1C2035", borderRadius: "8px", color: "#E2E4EF", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s" },
  textarea: { width: "100%", background: "#080A11", border: "1px solid #1C2035", borderRadius: "8px", color: "#E2E4EF", fontSize: "14px", padding: "10px 14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", minHeight: "80px", resize: "vertical" },
  verticalGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "8px" },
  verticalCard: (selected) => ({
    background: selected ? "#6C5CE722" : "#080A11",
    border: `1px solid ${selected ? "#6C5CE7" : "#1C2035"}`,
    borderRadius: "10px", padding: "16px 12px", cursor: "pointer",
    textAlign: "center", transition: "all 0.15s",
  }),
  verticalLabel: (selected) => ({ fontSize: "13px", fontWeight: "600", color: selected ? "#A29BFE" : "#6B7090" }),
  docRow: { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#080A11", border: "1px solid #1C2035", borderRadius: "8px", padding: "12px 16px", marginBottom: "8px" },
  docLabel: { fontSize: "13px", color: "#D0D4E8" },
  uploadBtn: { background: "#1C2035", color: "#A29BFE", border: "1px solid #2A2D45", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  reviewRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1C2035", fontSize: "13px" },
  reviewLabel: { color: "#6B7090" },
  reviewValue: { color: "#E2E4EF", fontWeight: "500" },
  btnRow: { display: "flex", gap: "12px", justifyContent: "flex-end" },
  btnPrimary: { background: "linear-gradient(135deg, #6C5CE7, #A29BFE)", color: "#fff", border: "none", borderRadius: "10px", padding: "12px 28px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  btnSecondary: { background: "#1C2035", color: "#8890AA", border: "1px solid #2A2D45", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", cursor: "pointer" },
  successCard: { background: "#003D2E", border: "1px solid #00B89444", borderRadius: "16px", padding: "40px", textAlign: "center" },
  successIcon: { fontSize: "48px", marginBottom: "16px" },
  successTitle: { fontSize: "22px", fontWeight: "700", color: "#00B894", marginBottom: "8px" },
  successSub: { fontSize: "14px", color: "#6B9E8A" },
};

const REQUIRED_DOCS = [
  { id: "business_reg", label: "Business Registration Certificate" },
  { id: "food_safety",  label: "Food Safety Certificate (if applicable)" },
  { id: "bank_details", label: "Bank Account Details" },
  { id: "id_proof",     label: "Director / Owner ID Proof" },
];

export default function SellerOnboarding() {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});

  const [form, setForm] = useState({
    business_name: "",
    contact_email: "",
    phone: "",
    address: "",
    vertical: "",
    product_description: "",
    estimated_skus: "",
    bank_name: "",
    agreed_to_terms: false,
  });

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  async function submit() {
    setSubmitting(true);
    const { error } = await supabase.from("sellers").insert({
      business_name: form.business_name,
      contact_email: form.contact_email,
      vertical: form.vertical,
      status: "Pending",
      commission_rate: form.vertical === "Food Delivery" ? 18.00 : form.vertical === "Meal Kits" ? 14.00 : 12.00,
      documents: Object.keys(uploadedDocs).map((id) => ({ id, status: "uploaded" })),
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  if (submitted) return (
    <div style={s.root}>
      <div style={s.header}><span style={s.logo}>UniMart</span><span style={s.badge}>Seller Onboarding</span></div>
      <div style={s.body}>
        <div style={s.successCard}>
          <div style={s.successIcon}>🎉</div>
          <div style={s.successTitle}>Application Submitted!</div>
          <div style={s.successSub}>We've received your application for <strong>{form.business_name}</strong>.<br />Our team will review your documents and contact you at {form.contact_email} within 2–3 business days.</div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.root}>
      <div style={s.header}><span style={s.logo}>UniMart</span><span style={s.badge}>Seller Onboarding · US-05</span></div>
      <div style={s.body}>

        {/* Step Bar */}
        <div style={s.stepBar}>
          {STEPS.map((st, i) => (
            <div key={st.id} style={{ display: "flex", flex: 1, alignItems: "flex-start" }}>
              <div style={s.step(step === st.id, step > st.id)}>
                <div style={s.stepDot(step === st.id, step > st.id)}>
                  {step > st.id ? "✓" : st.id}
                </div>
                <span style={s.stepLabel(step === st.id, step > st.id)}>{st.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={s.stepLine(step > st.id)} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div style={s.card}>
            <div style={s.cardTitle}>Business Details</div>
            <div style={s.cardSub}>Tell us about your business so we can set up your seller account.</div>
            <label style={s.label}>Business Name *</label>
            <input style={s.input} value={form.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="e.g. Fresh Fields Co." onFocus={(e) => e.target.style.borderColor = "#6C5CE7"} onBlur={(e) => e.target.style.borderColor = "#1C2035"} />
            <label style={s.label}>Contact Email *</label>
            <input style={s.input} type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="hello@yourbusiness.com" onFocus={(e) => e.target.style.borderColor = "#6C5CE7"} onBlur={(e) => e.target.style.borderColor = "#1C2035"} />
            <label style={s.label}>Phone Number</label>
            <input style={s.input} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" onFocus={(e) => e.target.style.borderColor = "#6C5CE7"} onBlur={(e) => e.target.style.borderColor = "#1C2035"} />
            <label style={s.label}>Business Address</label>
            <textarea style={s.textarea} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Street, City, State, ZIP" onFocus={(e) => e.target.style.borderColor = "#6C5CE7"} onBlur={(e) => e.target.style.borderColor = "#1C2035"} />
            <div style={{ ...s.btnRow, marginTop: "24px" }}>
              <button style={s.btnPrimary} onClick={() => setStep(2)} disabled={!form.business_name || !form.contact_email}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={s.card}>
            <div style={s.cardTitle}>Vertical & Products</div>
            <div style={s.cardSub}>Which UniMart vertical will you be selling on?</div>
            <div style={s.verticalGrid}>
              {VERTICALS.map((v) => (
                <div key={v} style={s.verticalCard(form.vertical === v)} onClick={() => set("vertical", v)}>
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{v === "Shop" ? "🛍️" : v === "Meal Kits" ? "🥗" : "🍔"}</div>
                  <div style={s.verticalLabel(form.vertical === v)}>{v}</div>
                  <div style={{ fontSize: "11px", color: "#4A4F6A", marginTop: "4px" }}>
                    {v === "Shop" ? "12% commission" : v === "Meal Kits" ? "14% commission" : "18% commission"}
                  </div>
                </div>
              ))}
            </div>
            <label style={s.label}>Describe your products</label>
            <textarea style={s.textarea} value={form.product_description} onChange={(e) => set("product_description", e.target.value)} placeholder="Briefly describe what you sell and your target customer..." onFocus={(e) => e.target.style.borderColor = "#6C5CE7"} onBlur={(e) => e.target.style.borderColor = "#1C2035"} />
            <label style={s.label}>Estimated number of SKUs / listings</label>
            <input style={s.input} value={form.estimated_skus} onChange={(e) => set("estimated_skus", e.target.value)} placeholder="e.g. 50" onFocus={(e) => e.target.style.borderColor = "#6C5CE7"} onBlur={(e) => e.target.style.borderColor = "#1C2035"} />
            <div style={{ ...s.btnRow, marginTop: "24px" }}>
              <button style={s.btnSecondary} onClick={() => setStep(1)}>← Back</button>
              <button style={s.btnPrimary} onClick={() => setStep(3)} disabled={!form.vertical}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div style={s.card}>
            <div style={s.cardTitle}>Document Upload</div>
            <div style={s.cardSub}>Upload the required documents for verification. Our n8n automation will process and review them within 2 business days.</div>
            {REQUIRED_DOCS.map((doc) => (
              <div key={doc.id} style={s.docRow}>
                <div>
                  <div style={s.docLabel}>{doc.label}</div>
                  {uploadedDocs[doc.id] && <div style={{ fontSize: "11px", color: "#00B894", marginTop: "2px" }}>✓ Uploaded</div>}
                </div>
                <button style={{ ...s.uploadBtn, background: uploadedDocs[doc.id] ? "#00B89422" : "#1C2035", color: uploadedDocs[doc.id] ? "#00B894" : "#A29BFE" }}
                  onClick={() => setUploadedDocs((p) => ({ ...p, [doc.id]: true }))}>
                  {uploadedDocs[doc.id] ? "✓ Done" : "Upload"}
                </button>
              </div>
            ))}
            <div style={{ ...s.btnRow, marginTop: "24px" }}>
              <button style={s.btnSecondary} onClick={() => setStep(2)}>← Back</button>
              <button style={s.btnPrimary} onClick={() => setStep(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div style={s.card}>
            <div style={s.cardTitle}>Review & Submit</div>
            <div style={s.cardSub}>Please review your details before submitting your application.</div>
            {[
              ["Business Name", form.business_name],
              ["Email", form.contact_email],
              ["Vertical", form.vertical],
              ["Commission Rate", form.vertical === "Food Delivery" ? "18%" : form.vertical === "Meal Kits" ? "14%" : "12%"],
              ["Documents Uploaded", `${Object.keys(uploadedDocs).length} / ${REQUIRED_DOCS.length}`],
              ["Estimated SKUs", form.estimated_skus || "Not specified"],
            ].map(([label, value]) => (
              <div key={label} style={s.reviewRow}>
                <span style={s.reviewLabel}>{label}</span>
                <span style={s.reviewValue}>{value}</span>
              </div>
            ))}
            <div style={{ marginTop: "20px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <input type="checkbox" id="terms" checked={form.agreed_to_terms} onChange={(e) => set("agreed_to_terms", e.target.checked)} style={{ marginTop: "2px" }} />
              <label htmlFor="terms" style={{ fontSize: "13px", color: "#8890AA", cursor: "pointer" }}>
                I agree to UniMart's Seller Terms, Community Standards, and Commission Structure. I understand my listings will be subject to AI compliance checks before publication.
              </label>
            </div>
            <div style={{ ...s.btnRow, marginTop: "24px" }}>
              <button style={s.btnSecondary} onClick={() => setStep(3)}>← Back</button>
              <button style={s.btnPrimary} onClick={submit} disabled={!form.agreed_to_terms || submitting}>
                {submitting ? "Submitting…" : "Submit Application →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
