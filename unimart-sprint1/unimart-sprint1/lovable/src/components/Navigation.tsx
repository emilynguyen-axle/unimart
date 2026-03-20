// ============================================================
// Navigation.tsx
// ============================================================
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Columns3, Map, AlertTriangle, Users, FileText, BookOpen } from "lucide-react";

const LINKS = [
  { to: "/sprint/1",  icon: LayoutDashboard, label: "Dashboard" },
  { to: "/kanban",    icon: Columns3,         label: "Kanban" },
  { to: "/empathy",   icon: Map,              label: "Empathy Maps" },
  { to: "/hcd",       icon: BookOpen,         label: "HCD Registry" },
  { to: "/risks",     icon: AlertTriangle,    label: "Risks" },
  { to: "/team",      icon: Users,            label: "Team" },
  { to: "/wiki",      icon: FileText,         label: "Wiki" },
];

export default function Navigation() {
  return (
    <nav className="sidebar-nav">
      <div className="nav-brand">
        <span className="brand-mark">UM</span>
        <div>
          <span className="brand-name">UniMart</span>
          <span className="brand-sprint">Sprint 1</span>
        </div>
      </div>
      <div className="nav-links">
        {LINKS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
      <div className="nav-footer">
        <span className="nav-version">v6.0 · March 2026</span>
        <span className="nav-stack">Lovable · Replit · n8n</span>
      </div>
      <style>{`
        .sidebar-nav {
          width: 200px; min-height: 100vh; background: #0a0a0a;
          border-right: 1px solid #1e1e1e; display: flex; flex-direction: column;
          padding: 1.25rem 0; position: sticky; top: 0; flex-shrink: 0;
          font-family: 'DM Mono', monospace;
        }
        .nav-brand { display: flex; align-items: center; gap: 0.75rem; padding: 0 1.25rem 1.25rem; border-bottom: 1px solid #1a1a1a; margin-bottom: 0.75rem; }
        .brand-mark { width: 32px; height: 32px; background: #e8ff47; color: #0a0a0a; font-weight: 900; font-size: 0.75rem; display: flex; align-items: center; justify-content: center; letter-spacing: 0.05em; flex-shrink: 0; }
        .brand-name { display: block; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.04em; }
        .brand-sprint { display: block; font-size: 0.6rem; color: #666; }
        .nav-links { flex: 1; display: flex; flex-direction: column; gap: 1px; }
        .nav-link {
          display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem 1.25rem;
          font-size: 0.72rem; color: #555; text-decoration: none; letter-spacing: 0.04em;
          transition: all 0.15s; border-left: 2px solid transparent;
        }
        .nav-link:hover { color: #aaa; background: #111; }
        .nav-link.active { color: #e8ff47; border-left-color: #e8ff47; background: #111; }
        .nav-footer { padding: 1.25rem; border-top: 1px solid #1a1a1a; margin-top: 0.75rem; }
        .nav-version { display: block; font-size: 0.6rem; color: #444; }
        .nav-stack { display: block; font-size: 0.55rem; color: #333; margin-top: 0.2rem; }
        .app-shell { display: flex; }
        .main-content { flex: 1; overflow: auto; }
      `}</style>
    </nav>
  );
}
