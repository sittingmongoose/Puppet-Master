// Placeholder page components for React Router setup
// These will be fully implemented in Phase 3 (Page Migration)

// Real Dashboard page
export { default as Dashboard } from './Dashboard.js';
// Real Projects page
export { default as Projects } from './Projects.js';
// Real Wizard page
export { default as Wizard } from './Wizard.js';
// Real Config page
export { default as Config } from './Config.js';
// Real Doctor page
export { default as Doctor } from './Doctor.js';
// Real Settings page
export { default as Settings } from './Settings.js';

// Real Tiers page
export { default as Tiers } from './Tiers.js';

// Real Evidence pages
export { default as Evidence } from './Evidence.js';
export { default as EvidenceDetail } from './EvidenceDetail.js';

// Real Metrics page
export { default as Metrics } from './Metrics.js';

// Real History page
export { default as History } from './History.js';

// Real Coverage page
export { default as Coverage } from './Coverage.js';

// Real Memory page
export { default as Memory } from './Memory.js';

// Feature parity pages (CLI ↔ GUI)
export { default as Ledger } from './Ledger.js';
export { default as Login } from './Login.js';

export function NotFound() {
  return (
    <div className="panel">
      <h2 className="font-display text-xl mb-4 text-hot-magenta">404 - Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
