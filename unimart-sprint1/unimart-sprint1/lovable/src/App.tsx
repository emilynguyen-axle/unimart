// ============================================================
// UniMart Sprint 1 — Lovable App Entry Point
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import SprintDashboard from "./pages/SprintDashboard";
import KanbanBoard from "./pages/KanbanBoard";
import EmpathyMapWorkshop from "./pages/EmpathyMapWorkshop";
import HCDRegistry from "./pages/HCDRegistry";
import RiskRegister from "./pages/RiskRegister";
import TeamOnboarding from "./pages/TeamOnboarding";
import ProjectWiki from "./pages/ProjectWiki";
import Navigation from "./components/Navigation";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="app-shell">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/sprint/1" replace />} />
              <Route path="/sprint/:sprintNumber" element={<SprintDashboard />} />
              <Route path="/kanban" element={<KanbanBoard />} />
              <Route path="/empathy" element={<EmpathyMapWorkshop />} />
              <Route path="/hcd" element={<HCDRegistry />} />
              <Route path="/risks" element={<RiskRegister />} />
              <Route path="/team" element={<TeamOnboarding />} />
              <Route path="/wiki" element={<ProjectWiki />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" />
    </QueryClientProvider>
  );
}
