// ============================================================
// App.tsx  —  add ProjectHub import + route
// Only the changed/added lines are shown; keep everything else.
// ============================================================

// 1. ADD this import alongside the others:
import ProjectHub from "./pages/ProjectHub";

// 2. INSIDE <Routes>, REPLACE the "/" redirect with:
//
//   <Route path="/" element={<ProjectHub />} />
//
// Or if you want to keep the sprint dashboard at "/" and have
// the hub at its own path, add:
//
//   <Route path="/hub" element={<ProjectHub />} />
//
// Full Routes block for reference:
//
// <Routes>
//   <Route path="/"                  element={<ProjectHub />} />   ← changed
//   <Route path="/sprint/:n"         element={<SprintDashboard />} />
//   <Route path="/kanban"            element={<KanbanBoard />} />
//   <Route path="/empathy"           element={<EmpathyMapWorkshop />} />
//   <Route path="/hcd"               element={<HCDRegistry />} />
//   <Route path="/risks"             element={<RiskRegister />} />
//   <Route path="/team"              element={<TeamOnboarding />} />
//   <Route path="/wiki"              element={<ProjectWiki />} />
//   <Route path="/retrospective"     element={<RetrospectiveBoard />} />
//   <Route path="/handoff"           element={<StakeholderHandoff />} />
//   <Route path="/sentiment"         element={<SentimentDashboard />} />
//   <Route path="/ai-architecture"   element={<AIArchitecture />} />
//   <Route path="/customer-app"      element={<CustomerApp />} />
//   <Route path="/driver-app"        element={<DriverApp />} />
//   <Route path="/seller-onboarding" element={<SellerOnboarding />} />
//   <Route path="/support"           element={<SupportDashboard />} />
//   <Route path="/nutritionist"      element={<NutritionistPortal />} />
//   <Route path="/waitlist"          element={<WaitlistLanding />} />
//   <Route path="/qa"                element={<QADashboard />} />
//   <Route path="/ai-validation"     element={<AIValidationDashboard />} />
//   <Route path="/compliance"        element={<ComplianceAuditTracker />} />
// </Routes>
