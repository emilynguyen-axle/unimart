// ============================================================
// EmpathyMapWorkshop.tsx — US-01: HCD Empathy Mapping
// 11 user groups, 4 quadrants per group, pain point flagging,
// validation gate (≥3 pain points), completion tracker
// ============================================================
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUserGroups, getEmpathySummary, getEmpathyMap,
  createEmpathyMap, addEmpathyEntry, validateEmpathyMap,
} from "../lib/api";
import { CheckCircle, Plus, AlertTriangle, ChevronLeft } from "lucide-react";

const QUADRANTS = [
  { key: "says",   label: "Says",   color: "#47b8ff", desc: "What they say out loud in interviews or conversations" },
  { key: "thinks", label: "Thinks", color: "#b847ff", desc: "What they think but may not say — fears, desires, assumptions" },
  { key: "does",   label: "Does",   color: "#ff8c47", desc: "Observed behaviours, actions, and habits" },
  { key: "feels",  label: "Feels",  color: "#e8ff47", desc: "Emotional state — frustrations, motivations, anxieties" },
] as const;

type Quadrant = typeof QUADRANTS[number]["key"];

function GroupCard({ group, summary, onSelect }: {
  group: any; summary: any; onSelect: () => void;
}) {
  const s = summary?.summary?.find((s: any) => s.id === group.id);
  return (
    <div
      className={`group-card ${s?.is_validated ? "validated" : s?.has_map ? "started" : "empty"}`}
      onClick={onSelect}
    >
      <span className="group-emoji">{group.icon}</span>
      <div className="group-info">
        <span className="group-name">{group.name}</span>
        <span className="group-status">
          {s?.is_validated ? "✅ Validated" : s?.has_map ? `${s.entry_count} entries · ${s.pain_point_count} pain points` : "Not started"}
        </span>
      </div>
      {s?.is_validated && <CheckCircle size={16} color="#e8ff47" />}
      {s?.has_map && !s?.is_validated && s?.pain_point_count < 3 && (
        <AlertTriangle size={16} color="#ff8c47" />
      )}
    </div>
  );
}

function QuadrantPanel({ quadrant, entries, onAdd }: {
  quadrant: typeof QUADRANTS[number];
  entries: any[];
  onAdd: (q: Quadrant, content: string, isPainPoint: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [isPP, setIsPP] = useState(false);
  const submit = () => {
    if (!text.trim()) return;
    onAdd(quadrant.key, text.trim(), isPP);
    setText("");
    setIsPP(false);
  };
  return (
    <div className="quadrant-panel" style={{ "--q-color": quadrant.color } as React.CSSProperties}>
      <div className="quadrant-header">
        <span className="q-label" style={{ color: quadrant.color }}>{quadrant.label}</span>
        <span className="q-desc">{quadrant.desc}</span>
      </div>
      <div className="quadrant-entries">
        {entries.length === 0 && <span className="q-empty">No entries yet</span>}
        {entries.map((e: any) => (
          <div key={e.id} className={`q-entry ${e.is_pain_point ? "pain-point" : ""}`}>
            {e.is_pain_point && <AlertTriangle size={10} color="#ff8c47" />}
            <span>{e.content}</span>
          </div>
        ))}
      </div>
      <div className="q-add">
        <input
          className="q-input"
          placeholder={`Add ${quadrant.label.toLowerCase()} entry…`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <label className="pp-toggle">
          <input type="checkbox" checked={isPP} onChange={(e) => setIsPP(e.target.checked)} />
          <span>Pain point</span>
        </label>
        <button className="q-add-btn" onClick={submit} disabled={!text.trim()}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function EmpathyMapWorkshop() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: groups } = useQuery({ queryKey: ["user-groups"], queryFn: getUserGroups });
  const { data: summary } = useQuery({ queryKey: ["empathy-summary"], queryFn: getEmpathySummary });
  const { data: currentMap, isLoading: mapLoading } = useQuery({
    queryKey: ["empathy-map", selectedGroupId],
    queryFn: () => getEmpathyMap(selectedGroupId!),
    enabled: !!selectedGroupId,
    retry: false,
  });

  const createMapMutation = useMutation({
    mutationFn: (userGroupId: string) => createEmpathyMap({ user_group_id: userGroupId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empathy-map", selectedGroupId] });
      qc.invalidateQueries({ queryKey: ["empathy-summary"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const addEntryMutation = useMutation({
    mutationFn: ({ mapId, quadrant, content, is_pain_point }: any) =>
      addEmpathyEntry(mapId, { quadrant, content, is_pain_point }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empathy-map", selectedGroupId] });
      qc.invalidateQueries({ queryKey: ["empathy-summary"] });
      toast.success("Entry added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const validateMutation = useMutation({
    mutationFn: (mapId: string) => validateEmpathyMap(mapId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["empathy-map", selectedGroupId] });
      qc.invalidateQueries({ queryKey: ["empathy-summary"] });
      toast.success("Empathy map validated ✅");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectedGroup = groups?.find((g: any) => g.id === selectedGroupId);
  const mapData = currentMap as any;
  const painPointCount = mapData?.empathy_map_entries?.filter((e: any) => e.is_pain_point)?.length ?? 0;
  const canValidate = painPointCount >= 3 && !mapData?.is_validated;

  const getEntries = (q: Quadrant) =>
    mapData?.empathy_map_entries?.filter((e: any) => e.quadrant === q) ?? [];

  if (!selectedGroupId) {
    return (
      <div className="workshop-page">
        <div className="workshop-header">
          <h1>Empathy Map Workshop</h1>
          <p className="workshop-sub">US-01 · Select a user group to begin or continue their empathy map session</p>
          <div className="workshop-progress">
            <span>{summary?.summary?.filter((s: any) => s.is_validated)?.length ?? 0} / 11 validated</span>
            <div className="workshop-progress-bar">
              <div
                className="workshop-progress-fill"
                style={{ width: `${((summary?.summary?.filter((s: any) => s.is_validated)?.length ?? 0) / 11) * 100}%` }}
              />
            </div>
          </div>
        </div>
        <div className="groups-grid">
          {groups?.map((g: any) => (
            <GroupCard key={g.id} group={g} summary={summary} onSelect={() => setSelectedGroupId(g.id)} />
          ))}
        </div>
        <style>{workshopStyles}</style>
      </div>
    );
  }

  return (
    <div className="workshop-page">
      <div className="workshop-header">
        <button className="back-btn" onClick={() => setSelectedGroupId(null)}>
          <ChevronLeft size={16} /> Back to groups
        </button>
        <div className="map-title-row">
          <span className="map-group-icon">{selectedGroup?.icon}</span>
          <div>
            <h1>{selectedGroup?.name}</h1>
            <p className="workshop-sub">{selectedGroup?.description}</p>
          </div>
          {mapData?.is_validated && <span className="validated-badge">✅ Validated</span>}
        </div>

        {mapData && (
          <div className="map-stats-row">
            <span>{mapData.empathy_map_entries?.length ?? 0} total entries</span>
            <span
              style={{ color: painPointCount >= 3 ? "#e8ff47" : "#ff8c47" }}
            >
              {painPointCount}/3 pain points required
            </span>
            {canValidate && (
              <button
                className="validate-btn"
                onClick={() => validateMutation.mutate(mapData.id)}
                disabled={validateMutation.isPending}
              >
                {validateMutation.isPending ? "Validating…" : "✓ Mark as Validated (DoD met)"}
              </button>
            )}
          </div>
        )}

        {!mapData && !mapLoading && (
          <button
            className="start-map-btn"
            onClick={() => createMapMutation.mutate(selectedGroupId)}
            disabled={createMapMutation.isPending}
          >
            {createMapMutation.isPending ? "Creating…" : "+ Start Empathy Map Session"}
          </button>
        )}
      </div>

      {mapData && (
        <div className="quadrants-grid">
          {QUADRANTS.map((q) => (
            <QuadrantPanel
              key={q.key}
              quadrant={q}
              entries={getEntries(q.key)}
              onAdd={(quad, content, isPainPoint) =>
                addEntryMutation.mutate({ mapId: mapData.id, quadrant: quad, content, is_pain_point: isPainPoint })
              }
            />
          ))}
        </div>
      )}
      <style>{workshopStyles}</style>
    </div>
  );
}

const workshopStyles = `
  .workshop-page { padding: 2rem; font-family: 'DM Mono', monospace; background: #0e0e0e; color: #f0f0e8; min-height: 100vh; }
  .workshop-header { margin-bottom: 2rem; }
  .workshop-header h1 { font-size: 1.6rem; font-weight: 700; margin: 0 0 0.25rem; }
  .workshop-sub { font-size: 0.75rem; color: #666; margin: 0 0 1rem; font-style: italic; }
  .workshop-progress { display: flex; align-items: center; gap: 1rem; font-size: 0.7rem; color: #888; }
  .workshop-progress-bar { flex: 1; max-width: 200px; height: 3px; background: #222; border-radius: 2px; }
  .workshop-progress-fill { height: 100%; background: #e8ff47; border-radius: 2px; transition: width 0.4s; }
  .groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; }
  .group-card {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem; background: #141414; border: 1px solid #222; cursor: pointer; transition: all 0.15s;
  }
  .group-card:hover { border-color: #444; background: #1a1a1a; }
  .group-card.validated { border-left: 3px solid #e8ff47; }
  .group-card.started { border-left: 3px solid #ff8c47; }
  .group-card.empty { border-left: 3px solid #222; }
  .group-emoji { font-size: 1.5rem; }
  .group-info { flex: 1; }
  .group-name { font-size: 0.85rem; font-weight: 600; display: block; }
  .group-status { font-size: 0.65rem; color: #666; }
  .back-btn {
    display: flex; align-items: center; gap: 0.4rem;
    background: transparent; border: none; color: #666; cursor: pointer;
    font-family: inherit; font-size: 0.75rem; margin-bottom: 1rem; padding: 0;
  }
  .back-btn:hover { color: #aaa; }
  .map-title-row { display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
  .map-group-icon { font-size: 2rem; }
  .validated-badge { background: #1a2a00; color: #e8ff47; font-size: 0.7rem; padding: 0.25rem 0.6rem; align-self: flex-start; margin-top: 0.25rem; }
  .map-stats-row {
    display: flex; align-items: center; gap: 1.5rem;
    font-size: 0.72rem; color: #888; padding: 0.75rem; background: #141414; border: 1px solid #1e1e1e;
  }
  .validate-btn {
    margin-left: auto; padding: 0.35rem 0.8rem;
    background: #1a2a00; border: 1px solid #e8ff47; color: #e8ff47;
    font-family: inherit; font-size: 0.7rem; cursor: pointer; transition: all 0.15s;
  }
  .validate-btn:hover { background: #e8ff47; color: #0e0e0e; }
  .validate-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .start-map-btn {
    padding: 0.5rem 1.25rem; background: transparent; border: 1px solid #e8ff47;
    color: #e8ff47; font-family: inherit; font-size: 0.75rem; cursor: pointer; transition: all 0.15s;
  }
  .start-map-btn:hover { background: #e8ff47; color: #0e0e0e; }
  .quadrants-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .quadrant-panel { background: #141414; border: 1px solid #222; border-top: 3px solid var(--q-color, #444); padding: 1.25rem; }
  .quadrant-header { margin-bottom: 1rem; }
  .q-label { font-size: 0.9rem; font-weight: 700; letter-spacing: 0.04em; display: block; margin-bottom: 0.25rem; }
  .q-desc { font-size: 0.65rem; color: #555; font-style: italic; }
  .quadrant-entries { display: flex; flex-direction: column; gap: 0.4rem; min-height: 80px; margin-bottom: 1rem; }
  .q-empty { font-size: 0.65rem; color: #333; }
  .q-entry {
    display: flex; align-items: flex-start; gap: 0.4rem;
    font-size: 0.72rem; padding: 0.4rem 0.6rem; background: #0e0e0e; border: 1px solid #1e1e1e; line-height: 1.4;
  }
  .q-entry.pain-point { border-left: 2px solid #ff8c47; background: #1a1000; }
  .q-add { display: flex; align-items: center; gap: 0.5rem; }
  .q-input {
    flex: 1; background: #0e0e0e; border: 1px solid #2a2a2a; color: #f0f0e8;
    padding: 0.4rem 0.6rem; font-family: inherit; font-size: 0.7rem; outline: none;
    transition: border-color 0.15s;
  }
  .q-input:focus { border-color: var(--q-color, #444); }
  .pp-toggle { display: flex; align-items: center; gap: 0.3rem; font-size: 0.6rem; color: #666; cursor: pointer; white-space: nowrap; }
  .pp-toggle input { accent-color: #ff8c47; }
  .q-add-btn {
    background: #1e1e1e; border: 1px solid #2a2a2a; color: #888; cursor: pointer;
    padding: 0.4rem; display: flex; align-items: center; transition: all 0.15s;
  }
  .q-add-btn:hover:not(:disabled) { background: #e8ff47; border-color: #e8ff47; color: #0e0e0e; }
  .q-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;
