import { Routes, Route } from 'react-router-dom';
import {
  Dashboard,
  Projects,
  Wizard,
  Config,
  Settings,
  Doctor,
  Tiers,
  Evidence,
  EvidenceDetail,
  Metrics,
  History,
  Coverage,
  Memory,
  NotFound,
} from '@/pages';

/**
 * Application routes matching the current GUI page structure.
 * See GUI_SPEC.md Section 3 (Screen Inventory) for route definitions.
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard - main orchestration view */}
      <Route path="/" element={<Dashboard />} />
      
      {/* Project management */}
      <Route path="/projects" element={<Projects />} />
      
      {/* Start Chain Wizard */}
      <Route path="/wizard" element={<Wizard />} />
      
      {/* Configuration */}
      <Route path="/config" element={<Config />} />
      <Route path="/settings" element={<Settings />} />
      
      {/* System health */}
      <Route path="/doctor" element={<Doctor />} />
      
      {/* Tier views */}
      <Route path="/tiers" element={<Tiers />} />
      
      {/* Evidence */}
      <Route path="/evidence" element={<Evidence />} />
      <Route path="/evidence/:id" element={<EvidenceDetail />} />
      
      {/* Analytics */}
      <Route path="/metrics" element={<Metrics />} />
      <Route path="/history" element={<History />} />
      <Route path="/coverage" element={<Coverage />} />
      
      {/* Memory */}
      <Route path="/memory" element={<Memory />} />
      <Route path="/memory/:path" element={<Memory />} />
      
      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
