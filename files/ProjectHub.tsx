// ============================================================
// ProjectHub.tsx  —  UniMart Project Hub home (grouped by area)
// Add route:  <Route path="/hub" element={<ProjectHub />} />
//             or replace the "/" redirect with this page.
// ============================================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
interface HubCard {
  to: string;
  icon: React.ElementType;
  label: string;
  description: string;
  badge: string;
}

interface HubArea {
  id: string;
  label: string;
  description: string;
  accentColor: string;
  bgColor: string;
  badgeTextColor: string;
  cards: HubCard[];
}

// ── Data ──────────────────────────────────────────────────────
const AREAS: HubArea[] = [
  {
    id: "pm",
    label: "PM & Agile",
    description: "Sprint management, ceremonies & stakeholder sign-off",
    accentColor: "#7F77DD",
    bgColor: "#16152a",
    badgeTextColor: "#AFA9EC",
    cards: [
      {
        to: "/kanban",
        icon: LayoutDashboard,
        label: "Sprint Board",
        description: "Kanban board for sprint tickets",
        badge: "Active sprint",
      },
      {
        to: "/retrospective",
        icon: RotateCcw,
        label: "Retrospective",
        description: "Sprint retro board with voting & action items",
        badge: "Sprint 4",
      },
      {
        to: "/handoff",
        icon: FileCheck,
        label: "Stakeholder Handoff",
        description: "Handoff doc with approval workflow & markdown export",
        badge: "EP-06",
      },
    ],
  },
  {
    id: "design",
    label: "Design & Research",
    description: "User research, empathy data & sentiment analysis",
    accentColor: "#1D9E75",
    bgColor: "#0d1f19",
    badgeTextColor: "#5DCAA5",
    cards: [
      {
        to: "/empathy",
        icon: Map,
        label: "Empathy Maps",
        description: "Understand all 11 user groups deeply",
        badge: "11 user groups",
      },
      {
        to: "/sentiment",
        icon: BarChart2,
        label: "Sentiment",
        description: "Aggregated feedback sentiment by source & category",
        badge: "Sprint 4",
      },
    ],
  },
  {
    id: "eng",
    label: "Engineering",
    description: "AI blueprints, customer-facing & driver app builds",
    accentColor: "#378ADD",
    bgColor: "#0d1824",
    badgeTextColor: "#85B7EB",
    cards: [
      {
        to: "/ai-architecture",
        icon: Cpu,
        label: "AI Architecture",
        description: "AI integration blueprints & system design",
        badge: "EP-02",
      },
      {
        to: "/customer-app",
        icon: ShoppingCart,
        label: "Customer App",
        description: "Home feed & smart cart experience",
        badge: "EP-04",
      },
      {
        to: "/driver-app",
        icon: Truck,
        label: "Driver App",
        description: "Delivery driver job management interface",
        badge: "EP-04",
      },
    ],
  },
  {
    id: "ops",
    label: "Operations",
    description: "Seller portal, support flows, nutrition & marketing",
    accentColor: "#BA7517",
    bgColor: "#1f1608",
    badgeTextColor: "#EF9F27",
    cards: [
      {
        to: "/seller-onboarding",
        icon: Store,
        label: "Seller Onboarding",
        description: "Onboard & verify marketplace sellers",
        badge: "EP-03",
      },
      {
        to: "/support",
        icon: Headphones,
        label: "Support Dashboard",
        description: "Customer support & resolution flows",
        badge: "EP-03",
      },
      {
        to: "/nutritionist",
        icon: Salad,
        label: "Nutritionist",
        description: "Meal plan submission & badge management",
        badge: "EP-04",
      },
      {
        to: "/waitlist",
        icon: Megaphone,
        label: "Waitlist Landing",
        description: "Marketing landing page with waitlist signup",
        badge: "EP-04",
      },
    ],
  },
  {
    id: "qc",
    label: "Quality & Compliance",
    description: "QA, AI validation & full compliance audit",
    accentColor: "#D85A30",
    bgColor: "#1f0e08",
    badgeTextColor: "#F0997B",
    cards: [
      {
        to: "/qa",
        icon: FlaskConical,
        label: "QA Dashboard",
        description: "Internal testing & usability validation",
        badge: "EP-05",
      },
      {
        to: "/ai-validation",
        icon: ShieldCheck,
        label: "AI Validation",
        description: "AI model accuracy metrics & live test runner",
        badge: "EP-05",
      },
      {
        to: "/compliance",
        icon: ClipboardList,
        label: "Compliance Audit",
        description: "Full 12-item compliance audit checklist",
        badge: "EP-05",
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────
export default function ProjectHub() {
  const [activeAreaId, setActiveAreaId] = useState<string>(AREAS[0].id);
  const navigate = useNavigate();

  const activeArea = AREAS.find((a) => a.id === activeAreaId) ?? AREAS[0];

  return (
    <div className="hub-page">
      {/* Page header */}
      <header className="hub-header">
        <div>
          <h1 className="hub-title">UniMart Project Hub</h1>
          <p className="hub-sub">Your agile project management dashboard</p>
        </div>
      </header>

      {/* Area tab strip */}
      <div className="hub-area-tabs">
        {AREAS.map((area) => (
          <button
            key={area.id}
            className={`hub-area-tab ${activeAreaId === area.id ? "active" : ""}`}
            style={
              activeAreaId === area.id
                ? ({ "--accent": area.accentColor } as React.CSSProperties)
                : {}
            }
            onClick={() => setActiveAreaId(area.id)}
          >
            {area.label}
          </button>
        ))}
      </div>

      {/* Active area description */}
      <div className="hub-area-meta">
        <span
          className="hub-area-pill"
          style={{
            background: activeArea.bgColor,
            color: activeArea.accentColor,
            border: `1px solid ${activeArea.accentColor}33`,
          }}
        >
          {activeArea.label}
        </span>
        <span className="hub-area-desc">{activeArea.description}</span>
      </div>

      {/* Card grid */}
      <div className="hub-card-grid">
        {activeArea.cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.to}
              className="hub-card"
              onClick={() => navigate(card.to)}
              style={
                {
                  "--accent": activeArea.accentColor,
                  "--bg": activeArea.bgColor,
                  "--badge-color": activeArea.badgeTextColor,
                } as React.CSSProperties
              }
            >
              <div
                className="hub-card-icon"
                style={{ background: activeArea.bgColor }}
              >
                <Icon
                  size={18}
                  style={{ color: activeArea.accentColor }}
                />
              </div>
              <div className="hub-card-body">
                <div className="hub-card-title">{card.label}</div>
                <div className="hub-card-desc">{card.description}</div>
                <span className="hub-card-badge">{card.badge}</span>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        .hub-page {
          padding: 2.5rem 2.5rem 3rem;
          font-family: 'DM Mono', monospace;
          background: #0a0a0a;
          min-height: 100vh;
          color: #f0f0e8;
        }

        /* ── Header ───────────────────────────────────────── */
        .hub-header {
          margin-bottom: 2rem;
        }
        .hub-title {
          font-size: 1.6rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          margin: 0 0 0.25rem;
          color: #f0f0e8;
        }
        .hub-sub {
          font-size: 0.75rem;
          color: #555;
          margin: 0;
        }

        /* ── Area tab strip ────────────────────────────────── */
        .hub-area-tabs {
          display: flex;
          gap: 2px;
          border-bottom: 1px solid #1e1e1e;
          margin-bottom: 1.5rem;
          overflow-x: auto;
        }
        .hub-area-tab {
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #444;
          font-family: 'DM Mono', monospace;
          font-size: 0.68rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.75rem 1.25rem;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .hub-area-tab:hover {
          color: #888;
        }
        .hub-area-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        /* ── Area meta row ─────────────────────────────────── */
        .hub-area-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .hub-area-pill {
          font-size: 0.6rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.2rem 0.65rem;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .hub-area-desc {
          font-size: 0.7rem;
          color: #555;
        }

        /* ── Card grid ─────────────────────────────────────── */
        .hub-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .hub-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: #111;
          border: 1px solid #1e1e1e;
          border-radius: 4px;
          padding: 1.25rem;
          cursor: pointer;
          text-align: left;
          font-family: 'DM Mono', monospace;
          transition: border-color 0.15s, background 0.15s;
        }
        .hub-card:hover {
          border-color: var(--accent);
          background: #141414;
        }
        .hub-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .hub-card-body {
          flex: 1;
          min-width: 0;
        }
        .hub-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: #d0d0c8;
          margin-bottom: 0.35rem;
          letter-spacing: 0.02em;
        }
        .hub-card-desc {
          font-size: 0.68rem;
          color: #555;
          line-height: 1.5;
          margin-bottom: 0.6rem;
        }
        .hub-card-badge {
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--badge-color);
          background: var(--bg);
          padding: 0.15rem 0.5rem;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
