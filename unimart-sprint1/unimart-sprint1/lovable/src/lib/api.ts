// ============================================================
// UniMart Sprint 1 — API Client
// All calls go to Replit backend
// ============================================================
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "API error");
  }
  return res.json() as Promise<T>;
}

// ─── Dashboard ─────────────────────────────────────────────
export const getDashboard = (sprint = 1) => api(`/api/dashboard/sprint${sprint}`);

// ─── Team ──────────────────────────────────────────────────
export const getTeam = () => api("/api/team");
export const getSquads = () => api("/api/squads");
export const addTeamMember = (body: object) => api("/api/team", { method: "POST", body: JSON.stringify(body) });
export const onboardMember = (id: string) => api(`/api/team/${id}/onboard`, { method: "PATCH" });

// ─── Kanban ────────────────────────────────────────────────
export const getKanbanBoard = (sprint?: number, squad?: string) => {
  const params = new URLSearchParams();
  if (sprint) params.set("sprint", String(sprint));
  if (squad) params.set("squad", squad);
  return api(`/api/kanban?${params}`);
};
export const updateTicketStatus = (id: string, status: string, pm_signoff?: boolean) =>
  api(`/api/kanban/tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, pm_signoff }) });
export const createTicket = (body: object) => api("/api/kanban/tickets", { method: "POST", body: JSON.stringify(body) });
export const addComment = (ticketId: string, body: { author_id?: string; body: string }) =>
  api(`/api/kanban/tickets/${ticketId}/comments`, { method: "POST", body: JSON.stringify(body) });

// ─── Sprints ───────────────────────────────────────────────
export const getSprints = () => api("/api/sprints");
export const getVelocity = (sprint: number) => api(`/api/sprints/${sprint}/velocity`);
export const getCeremonies = (sprint: number) => api(`/api/sprints/${sprint}/ceremonies`);
export const completeCeremony = (id: string, notes: string, action_items: object[]) =>
  api(`/api/sprints/ceremonies/${id}/complete`, { method: "PATCH", body: JSON.stringify({ notes, action_items }) });

// ─── User Stories & Epics ──────────────────────────────────
export const getStories = (sprint?: number) => api(`/api/stories${sprint ? `?sprint=${sprint}` : ""}`);
export const getEpics = () => api("/api/epics");

// ─── HCD ───────────────────────────────────────────────────
export const getUserGroups = () => api("/api/hcd/user-groups");
export const getHCDChallenges = () => api("/api/hcd/challenges");
export const updateChallenge = (id: string, body: object) =>
  api(`/api/hcd/challenges/${id}`, { method: "PATCH", body: JSON.stringify(body) });

// ─── Empathy Maps ──────────────────────────────────────────
export const getEmpathyMaps = () => api("/api/empathy-maps");
export const getEmpathyMap = (userGroupId: string) => api(`/api/empathy-maps/${userGroupId}`);
export const getEmpathySummary = () => api("/api/empathy-maps/completion/summary");
export const createEmpathyMap = (body: { user_group_id: string; facilitator_id?: string; session_date?: string }) =>
  api("/api/empathy-maps", { method: "POST", body: JSON.stringify(body) });
export const addEmpathyEntry = (mapId: string, body: { quadrant: string; content: string; is_pain_point?: boolean }) =>
  api(`/api/empathy-maps/${mapId}/entries`, { method: "POST", body: JSON.stringify(body) });
export const validateEmpathyMap = (mapId: string, validated_by?: string) =>
  api(`/api/empathy-maps/${mapId}/validate`, { method: "PATCH", body: JSON.stringify({ validated_by }) });

// ─── Risks ─────────────────────────────────────────────────
export const getRisks = (category?: string) => api(`/api/risks${category ? `?category=${category}` : ""}`);
export const getRiskSummary = () => api("/api/risks/summary");
export const resolveRisk = (id: string, resolution_notes: string) =>
  api(`/api/risks/${id}/resolve`, { method: "PATCH", body: JSON.stringify({ resolution_notes }) });
export const reviewRisk = (id: string) => api(`/api/risks/${id}/review`, { method: "PATCH" });

// ─── Wiki / Docs ───────────────────────────────────────────
export const getDocs = (category?: string) => api(`/api/docs${category ? `?category=${category}` : ""}`);
export const getDoc = (slug: string) => api(`/api/docs/${slug}`);
export const createDoc = (body: object) => api("/api/docs", { method: "POST", body: JSON.stringify(body) });
export const updateDoc = (slug: string, content: string, version: number) =>
  api(`/api/docs/${slug}`, { method: "PATCH", body: JSON.stringify({ content, version }) });
