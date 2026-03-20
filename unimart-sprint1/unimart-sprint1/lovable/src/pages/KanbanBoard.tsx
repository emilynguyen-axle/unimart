// ============================================================
// KanbanBoard.tsx — Sprint 1 Kanban Board
// Columns: Backlog | To Do | In Progress | Review | Done
// Swimlanes by squad, drag-status update via PATCH API
// ============================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getKanbanBoard, updateTicketStatus } from "../lib/api";
import { ChevronRight, User, Tag, AlertCircle } from "lucide-react";

const COLUMNS = [
  { key: "backlog",     label: "Backlog",     color: "#333" },
  { key: "todo",        label: "To Do",       color: "#1a2a40" },
  { key: "in_progress", label: "In Progress", color: "#2a1a00" },
  { key: "review",      label: "Review",      color: "#1a1a2a" },
  { key: "done",        label: "Done",        color: "#0f1a00" },
] as const;

type Status = typeof COLUMNS[number]["key"];

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#ff4747",
  high: "#ff8c47",
  medium: "#e8ff47",
  low: "#888",
};

const SQUAD_COLORS: Record<string, string> = {
  ux_research:      "#b847ff",
  core_dev:         "#47b8ff",
  ai_integration:   "#e8ff47",
  growth_marketing: "#ff8c47",
  legal_compliance: "#47ffb8",
};

function TicketCard({ ticket, onMove }: { ticket: any; onMove: (id: string, status: Status) => void }) {
  const [expanded, setExpanded] = useState(false);
  const NEXT_STATUS: Record<Status, Status | null> = {
    backlog: "todo", todo: "in_progress", in_progress: "review", review: "done", done: null,
  };
  const next = NEXT_STATUS[ticket.status as Status];

  return (
    <div className="ticket-card" style={{ "--squad-color": SQUAD_COLORS[ticket.squad] ?? "#666" } as React.CSSProperties}>
      <div className="ticket-priority-bar" style={{ background: PRIORITY_COLORS[ticket.priority] ?? "#555" }} />
      <div className="ticket-header" onClick={() => setExpanded(!expanded)}>
        <span className="ticket-title">{ticket.title}</span>
        <ChevronRight size={12} className={`chevron ${expanded ? "open" : ""}`} />
      </div>
      <div className="ticket-meta">
        {ticket.squad && (
          <span className="ticket-squad" style={{ color: SQUAD_COLORS[ticket.squad] ?? "#666" }}>
            {ticket.squad.replace("_", " ")}
          </span>
        )}
        {ticket.story_points && <span className="ticket-points">{ticket.story_points}pt</span>}
        {ticket.assignee_name && (
          <span className="ticket-assignee"><User size={10} /> {ticket.assignee_name}</span>
        )}
      </div>
      {ticket.labels?.length > 0 && (
        <div className="ticket-labels">
          {ticket.labels.slice(0, 3).map((l: string) => (
            <span key={l} className="ticket-label"><Tag size={8} />{l}</span>
          ))}
        </div>
      )}
      {expanded && ticket.description && (
        <p className="ticket-description">{ticket.description}</p>
      )}
      {next && (
        <button className="ticket-advance-btn" onClick={() => onMove(ticket.id, next)}>
          → Move to {next.replace("_", " ")}
        </button>
      )}
    </div>
  );
}

function KanbanColumn({ column, tickets, onMove }: {
  column: typeof COLUMNS[number];
  tickets: any[];
  onMove: (id: string, status: Status) => void;
}) {
  return (
    <div className="kanban-column">
      <div className="column-header" style={{ borderTopColor: column.color }}>
        <span className="column-label">{column.label}</span>
        <span className="column-count">{tickets.length}</span>
      </div>
      <div className="column-tickets">
        {tickets.length === 0 && <div className="empty-column">No tickets</div>}
        {tickets.map((t) => (
          <TicketCard key={t.id} ticket={t} onMove={onMove} />
        ))}
      </div>
    </div>
  );
}

export default function KanbanBoard() {
  const [squadFilter, setSquadFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  const { data: board, isLoading } = useQuery({
    queryKey: ["kanban", 1, squadFilter],
    queryFn: () => getKanbanBoard(1, squadFilter === "all" ? undefined : squadFilter),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) => updateTicketStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Ticket moved");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const squads = ["all", "ux_research", "core_dev", "ai_integration", "growth_marketing", "legal_compliance"];

  if (isLoading) return <div className="loading">Loading board…</div>;

  return (
    <div className="kanban-page">
      <div className="kanban-page-header">
        <h1>Sprint 1 Kanban Board</h1>
        <div className="squad-filters">
          {squads.map((s) => (
            <button
              key={s}
              className={`squad-filter-btn ${squadFilter === s ? "active" : ""}`}
              style={squadFilter === s && s !== "all" ? { borderColor: SQUAD_COLORS[s], color: SQUAD_COLORS[s] } : {}}
              onClick={() => setSquadFilter(s)}
            >
              {s === "all" ? "All Squads" : s.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.key}
            column={col}
            tickets={(board as any)?.[col.key] ?? []}
            onMove={(id, status) => moveMutation.mutate({ id, status })}
          />
        ))}
      </div>

      <style>{`
        .kanban-page { padding: 2rem; font-family: 'DM Mono', monospace; background: #0e0e0e; color: #f0f0e8; min-height: 100vh; }
        .kanban-page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
        .kanban-page-header h1 { font-size: 1.4rem; font-weight: 700; }
        .squad-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .squad-filter-btn {
          padding: 0.3rem 0.75rem; background: transparent;
          border: 1px solid #2a2a2a; color: #666; font-family: inherit;
          font-size: 0.65rem; letter-spacing: 0.08em; cursor: pointer;
          text-transform: uppercase; transition: all 0.15s;
        }
        .squad-filter-btn:hover { border-color: #444; color: #aaa; }
        .squad-filter-btn.active { border-color: #e8ff47; color: #e8ff47; }
        .kanban-board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; align-items: start; }
        .kanban-column { background: #111; border: 1px solid #1e1e1e; }
        .column-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.75rem 1rem; border-top: 3px solid #333;
          border-bottom: 1px solid #1e1e1e;
        }
        .column-label { font-size: 0.65rem; letter-spacing: 0.12em; text-transform: uppercase; color: #888; }
        .column-count {
          font-size: 0.65rem; background: #1e1e1e; color: #666;
          padding: 0.1rem 0.4rem; border-radius: 10px;
        }
        .column-tickets { padding: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; min-height: 200px; }
        .empty-column { font-size: 0.65rem; color: #333; text-align: center; padding: 2rem 0; }
        .ticket-card {
          background: #141414; border: 1px solid #222;
          border-left: 3px solid var(--squad-color, #444);
          padding: 0.75rem; position: relative; overflow: hidden;
          transition: border-color 0.15s;
        }
        .ticket-card:hover { border-color: #333; }
        .ticket-priority-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; }
        .ticket-header { display: flex; align-items: flex-start; gap: 0.5rem; cursor: pointer; }
        .ticket-title { font-size: 0.72rem; line-height: 1.4; flex: 1; }
        .chevron { color: #444; flex-shrink: 0; margin-top: 2px; transition: transform 0.15s; }
        .chevron.open { transform: rotate(90deg); }
        .ticket-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
        .ticket-squad { font-size: 0.6rem; letter-spacing: 0.06em; text-transform: uppercase; }
        .ticket-points { font-size: 0.6rem; background: #1e1e1e; padding: 0.1rem 0.35rem; color: #888; }
        .ticket-assignee { font-size: 0.6rem; color: #555; display: flex; align-items: center; gap: 0.25rem; }
        .ticket-labels { display: flex; gap: 0.3rem; margin-top: 0.4rem; flex-wrap: wrap; }
        .ticket-label { display: flex; align-items: center; gap: 0.2rem; font-size: 0.55rem; color: #555; background: #1a1a1a; padding: 0.1rem 0.3rem; }
        .ticket-description { font-size: 0.68rem; color: #777; margin-top: 0.5rem; line-height: 1.5; border-top: 1px solid #1e1e1e; padding-top: 0.5rem; }
        .ticket-advance-btn {
          margin-top: 0.5rem; width: 100%; padding: 0.3rem;
          background: transparent; border: 1px solid #2a2a2a; color: #666;
          font-family: inherit; font-size: 0.6rem; letter-spacing: 0.06em;
          cursor: pointer; text-align: center; transition: all 0.15s;
        }
        .ticket-advance-btn:hover { border-color: #e8ff47; color: #e8ff47; }
        .loading { padding: 4rem; text-align: center; color: #555; font-family: monospace; }
      `}</style>
    </div>
  );
}
