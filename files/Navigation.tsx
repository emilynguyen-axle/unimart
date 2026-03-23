// ============================================================
// Navigation.tsx  —  UniMart Project Hub (v7, grouped nav)
// Replace: lovable/src/components/Navigation.tsx
// ============================================================
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  RotateCcw,
  FileCheck,
  Map,
  BarChart2,
  Cpu,
  ShoppingCart,
  Truck,
  Store,
  Headphones,
  Salad,
  Megaphone,
  FlaskConical,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
interface SubLink {
  to: string;
  icon: React.ElementType;
  label: string;
}

interface AreaGroup {
  id: string;
  label: string;
  accentColor: string;
  dotColor: string;
  links: SubLink[];
}

// ── Nav structure ─────────────────────────────────────────────
const AREA_GROUPS: AreaGroup[] = [
  {
    id: "pm",
    label: "PM & Agile",
    accentColor: "#7F77DD",
    dotColor: "#AFA9EC",
    links: [
      { to: "/kanban",        icon: LayoutDashboard, label: "Sprint Board" },
      { to: "/retrospective", icon: RotateCcw,       label: "Retrospective" },
      { to: "/handoff",       icon: FileCheck,       label: "Stakeholder Handoff" },
    ],
  },
  {
    id: "design",
    label: "Design & Research",
    accentColor: "#1D9E75",
    dotColor: "#5DCAA5",
    links: [
      { to: "/empathy",   icon: Map,       label: "Empathy Maps" },
      { to: "/sentiment", icon: BarChart2, label: "Sentiment" },
    ],
  },
  {
    id: "eng",
    label: "Engineering",
    accentColor: "#378ADD",
    dotColor: "#85B7EB",
    links: [
      { to: "/ai-architecture", icon: Cpu,          label: "AI Architecture" },
      { to: "/customer-app",    icon: ShoppingCart, label: "Customer App" },
      { to: "/driver-app",      icon: Truck,        label: "Driver App" },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    accentColor: "#BA7517",
    dotColor: "#EF9F27",
    links: [
      { to: "/seller-onboarding", icon: Store,       label: "Seller Onboarding" },
      { to: "/support",           icon: Headphones,  label: "Support Dashboard" },
      { to: "/nutritionist",      icon: Salad,       label: "Nutritionist" },
      { to: "/waitlist",          icon: Megaphone,   label: "Waitlist Landing" },
    ],
  },
  {
    id: "qc",
    label: "Quality & Compliance",
    accentColor: "#D85A30",
    dotColor: "#F0997B",
    links: [
      { to: "/qa",         icon: FlaskConical,  label: "QA Dashboard" },
      { to: "/ai-validation", icon: ShieldCheck, label: "AI Validation" },
      { to: "/compliance", icon: ClipboardList,  label: "Compliance Audit" },
    ],
  },
];

// ── Helper: derive active area from current path ──────────────
function useActiveArea(): string {
  const { pathname } = useLocation();
  for (const area of AREA_GROUPS) {
    if (area.links.some((l) => pathname.startsWith(l.to))) return area.id;
  }
  return AREA_GROUPS[0].id;
}

// ── Component ─────────────────────────────────────────────────
export default function Navigation() {
  const navigate = useNavigate();
  const activeAreaId = useActiveArea();

  function handleAreaTabClick(area: AreaGroup) {
    // Navigate to the first sub-link of the selected area
    navigate(area.links[0].to);
  }

  return (
    <nav className="sidebar-nav">
      {/* Brand */}
      <div className="nav-brand">
        <span className="brand-mark">UM</span>
        <div>
          <span className="brand-name">UniMart</span>
          <span className="brand-sub">Project Hub</span>
        </div>
      </div>

      {/* Top-level area tabs */}
      <div className="area-tabs">
        {AREA_GROUPS.map((area) => (
          <button
            key={area.id}
            className={`area-tab ${activeAreaId === area.id ? "active" : ""}`}
            style={
              activeAreaId === area.id
                ? ({ "--accent": area.accentColor } as React.CSSProperties)
                : {}
            }
            onClick={() => handleAreaTabClick(area)}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Sub-links for every group (grouped, always visible) */}
      <div className="nav-groups">
        {AREA_GROUPS.map((area) => (
          <div
            key={area.id}
            className={`nav-group ${activeAreaId === area.id ? "group-active" : ""}`}
          >
            <span className="group-label">{area.label}</span>
            {area.links.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                style={
                  {
                    "--accent": area.accentColor,
                    "--dot": area.dotColor,
                  } as React.CSSProperties
                }
              >
                <span
                  className="link-dot"
                  style={{ background: area.dotColor }}
                />
                <Icon size={14} className="link-icon" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      <div className="nav-footer">
        <span className="nav-version">v7.0 · March 2026</span>
        <span className="nav-stack">Lovable · Replit · n8n</span>
      </div>

      <style>{`
        /* ── Shell ─────────────────────────────────────────── */
        .sidebar-nav {
          width: 220px;
          min-height: 100vh;
          background: #0a0a0a;
          border-right: 1px solid #1e1e1e;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          font-family: 'DM Mono', monospace;
          overflow-y: auto;
        }

        /* ── Brand ─────────────────────────────────────────── */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.25rem 1rem;
          border-bottom: 1px solid #1a1a1a;
        }
        .brand-mark {
          width: 32px;
          height: 32px;
          background: #e8ff47;
          color: #0a0a0a;
          font-weight: 900;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.05em;
          flex-shrink: 0;
        }
        .brand-name {
          display: block;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #f0f0e8;
        }
        .brand-sub {
          display: block;
          font-size: 0.58rem;
          color: #555;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── Area tabs (horizontal strip) ──────────────────── */
        .area-tabs {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 0.75rem 0.75rem 0;
        }
        .area-tab {
          background: transparent;
          border: 1px solid transparent;
          color: #555;
          font-family: 'DM Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          text-align: left;
          padding: 0.45rem 0.75rem;
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 3px;
        }
        .area-tab:hover {
          color: #aaa;
          background: #111;
        }
        .area-tab.active {
          color: var(--accent);
          background: #111;
          border-color: #1e1e1e;
          border-left: 2px solid var(--accent);
        }

        /* ── Nav groups ─────────────────────────────────────── */
        .nav-groups {
          flex: 1;
          padding: 0.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .nav-group {
          margin-bottom: 0.25rem;
        }
        .group-label {
          display: block;
          font-size: 0.58rem;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 0.6rem 1.25rem 0.3rem;
        }
        .nav-group.group-active .group-label {
          color: #666;
        }

        /* ── Sub-links ──────────────────────────────────────── */
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 1.25rem;
          font-size: 0.7rem;
          color: #444;
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: all 0.12s;
          border-left: 2px solid transparent;
          position: relative;
        }
        .nav-link:hover {
          color: #888;
          background: #0e0e0e;
        }
        .nav-link.active {
          color: var(--accent);
          border-left-color: var(--accent);
          background: #0e0e0e;
        }
        .link-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.5;
        }
        .nav-link.active .link-dot {
          opacity: 1;
        }
        .link-icon {
          opacity: 0.5;
          flex-shrink: 0;
        }
        .nav-link.active .link-icon {
          opacity: 1;
        }

        /* ── Footer ─────────────────────────────────────────── */
        .nav-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid #1a1a1a;
        }
        .nav-version {
          display: block;
          font-size: 0.58rem;
          color: #333;
        }
        .nav-stack {
          display: block;
          font-size: 0.55rem;
          color: #2a2a2a;
          margin-top: 0.2rem;
        }

        /* ── App shell (keep in sync with App.tsx) ──────────── */
        .app-shell {
          display: flex;
        }
        .main-content {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </nav>
  );
}
