import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useDoctorStore } from '@/stores/doctorStore';
import { Panel } from '@/components/layout';
import { Button, Checkbox } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import {
  WrenchIcon,
  PackageIcon,
  GearIcon,
  GlobeIcon,
  CheckIcon,
  FolderIcon,
  ClipboardIcon,
} from '@/components/icons';
import { api, APIError, getErrorMessage, type DoctorCheck } from '@/lib';
import { fetchWithRetry } from '@/hooks/index.js';
import type { StatusType, Platform } from '@/types';

const CATEGORIES: Array<{ id: string; label: string; icon: ReactNode }> = [
  { id: 'cli', label: 'CLI Tools', icon: <WrenchIcon size="1em" /> },
  { id: 'git', label: 'Git', icon: <PackageIcon size="1em" /> },
  { id: 'runtimes', label: 'Runtimes', icon: <GearIcon size="1em" /> },
  { id: 'browser', label: 'Browser Tools', icon: <GlobeIcon size="1em" /> },
  { id: 'capabilities', label: 'Capabilities', icon: <CheckIcon size="1em" /> },
  { id: 'project', label: 'Project Setup', icon: <FolderIcon size="1em" /> },
];

/**
 * Doctor page - dependency checker
 */
export default function DoctorPage() {
  const {
    checks,
    platformStatus,
    selectedPlatforms,
    _hasHydrated,
    setChecks,
    setPlatformStatus,
    setSelectedPlatforms,
  } = useDoctorStore();

  const [loading, setLoading] = useState(checks.length === 0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState<string | null>(null);
  const [installingAll, setInstallingAll] = useState(false);
  const [installAllProgress, setInstallAllProgress] = useState<string | null>(null);
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);

  // Wait for persisted state to rehydrate before fetching, so navigation away/back keeps state
  const ready = _hasHydrated === true;

  // Fetch platform status on mount after hydration (refresh in background if empty)
  useEffect(() => {
    if (!ready) return;
    const fetchPlatformStatus = async () => {
      try {
        const status = await fetchWithRetry(() => api.getPlatformStatus());
        setPlatformStatus(status.platforms);

        const installed = status.installedPlatforms as Platform[];
        if (!selectedPlatforms || selectedPlatforms.length === 0) {
          setSelectedPlatforms(installed);
        }
      } catch (err) {
        console.error('[Doctor] Failed to fetch platform status:', err);
      }
    };
    if (!platformStatus || Object.keys(platformStatus).length === 0) fetchPlatformStatus();
  }, [ready, platformStatus, selectedPlatforms, setPlatformStatus, setSelectedPlatforms]);

  // Fetch checks on mount after hydration (refresh in background if empty)
  useEffect(() => {
    if (!ready) return;
    const fetchChecks = async () => {
      try {
        if (!checks || checks.length === 0) setLoading(true);
        const data = await fetchWithRetry(() => api.getDoctorChecks());
        const newChecks = Array.isArray(data.checks) ? data.checks : [];
        setChecks(newChecks);
      } catch (err) {
        console.error('[Doctor] Failed to fetch checks:', err);
        if (!checks || checks.length === 0) setError(getErrorMessage(err, 'Failed to load checks'));
      } finally {
        setLoading(false);
      }
    };
    if (!checks || checks.length === 0) fetchChecks();
  }, [ready, checks, setChecks]);

  // Run all checks
  const runChecks = useCallback(async () => {
    try {
      setRunning(true);
      setError(null);
      const data = await api.runDoctorChecks({ 
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
      });
      const newChecks = Array.isArray(data.checks) ? data.checks : [];
      setChecks(newChecks);
    } catch (err) {
      console.error('[Doctor] Failed to run checks:', err);
      setError(getErrorMessage(err, 'Failed to run checks'));
    } finally {
      setRunning(false);
    }
  }, [selectedPlatforms]);

  // Fix a check
  const fixCheck = useCallback(async (checkName: string) => {
    try {
      setFixing(checkName);
      await api.fixDoctorCheck(checkName);
      // Re-run checks after fix
      const data = await api.runDoctorChecks();
      const nextChecks = Array.isArray(data.checks) ? data.checks : [];
      setChecks(nextChecks);
      // Trigger capabilities refresh so tier page picks up new installs
      try { await api.getModels(true); } catch { /* best-effort */ }

      // Refresh platform status so summary/details stay aligned (bypass cache)
      try {
        const status = await api.getPlatformStatus(true);
        setPlatformStatus(status.platforms);
      } catch {
        // best-effort
      }
    } catch (err) {
      console.error('[Doctor] Failed to fix check:', err);
      setError(getErrorMessage(err, 'Failed to fix check'));
    } finally {
      setFixing(null);
    }
  }, []);

  // Define checksList first (required by failedFixable below)
  const checksList = Array.isArray(checks) ? checks : [];

  // Install all failed/warn checks that have a fix (only after run; not for unrun/skip)
  const failedFixable = checksList.filter(
    (c) => (c.status === 'fail' || c.status === 'warn') && c.fixable === true
  );
  const installAllMissing = useCallback(async () => {
    if (failedFixable.length === 0) return;
    try {
      setInstallingAll(true);
      setError(null);
      const total = failedFixable.length;
      for (let i = 0; i < failedFixable.length; i++) {
        const check = failedFixable[i]!;
        const label = check.name.replace(/-cli$/, ' CLI').replace(/-/g, ' ');
        setInstallAllProgress(`Installing ${label} (${i + 1}/${total})...`);
        try {
          await api.fixDoctorCheck(check.name);
        } catch (err) {
          console.error(`[Doctor] Failed to install ${check.name}:`, err);
          let message = err instanceof Error ? err.message : `Failed to install ${check.name}`;
          if (err instanceof APIError && err.status === 500) {
            try {
              const body = JSON.parse(message) as { error?: string; output?: string };
              message = body.error || message;
              if (body.output) message += `\n\nDetails:\n${body.output}`;
            } catch {
              // keep message as-is if not JSON
            }
          }
          setError(message);
          break;
        }
      }
      setInstallAllProgress(null);
      const data = await api.runDoctorChecks({
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined,
      });
      const nextChecks = Array.isArray(data.checks) ? data.checks : [];
      setChecks(nextChecks);

      // Trigger capabilities refresh so tier page picks up new installs
      try { await api.getModels(true); } catch { /* best-effort */ }

      // Refresh platform status so summary/details stay aligned (bypass cache)
      try {
        const status = await api.getPlatformStatus(true);
        setPlatformStatus(status.platforms);
      } catch {
        // best-effort
      }
    } catch (err) {
      console.error('[Doctor] Install all failed:', err);
      setError(getErrorMessage(err, 'Install all failed'));
    } finally {
      setInstallingAll(false);
      setInstallAllProgress(null);
    }
  }, [failedFixable, selectedPlatforms]);
  const stats = {
    passed: checksList.filter((c) => c.status === 'pass').length,
    failed: checksList.filter((c) => c.status === 'fail').length,
    warning: checksList.filter((c) => c.status === 'warn').length,
    skipped: checksList.filter((c) => c.status === 'skip').length,
    total: checksList.length,
  };

  // Get overall status
  const getOverallStatus = (): StatusType => {
    if (stats.failed > 0) return 'error';
    if (stats.warning > 0) return 'paused';
    if (stats.passed === stats.total && stats.total > 0) return 'complete';
    return 'pending';
  };

  if (!ready || loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">{!ready ? 'Loading...' : 'Loading checks...'}</p>
      </div>
    );
  }

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(
      selectedPlatforms.includes(platform)
        ? selectedPlatforms.filter((p) => p !== platform)
        : [...selectedPlatforms, platform]
    );
  };

  const allPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Doctor</h1>
        <div className="flex flex-wrap items-center gap-sm">
          <Button
            variant="ghost"
            onClick={() => setShowPlatformSelection(!showPlatformSelection)}
          >
            {showPlatformSelection ? 'HIDE' : 'SELECT'} PLATFORMS
          </Button>
          {failedFixable.length > 0 && (
            <Button
              variant="info"
              onClick={installAllMissing}
              loading={installingAll}
              disabled={running}
            >
              {installingAll && installAllProgress
                ? installAllProgress
                : `INSTALL ALL MISSING (${failedFixable.length})`}
            </Button>
          )}
          <Button
            variant="primary"
            onClick={runChecks}
            loading={running}
            disabled={installingAll}
          >
            RUN ALL CHECKS
          </Button>
        </div>
      </div>

      {/* Platform Selection — align "installed" with doctor check results so summary matches details */}
      {showPlatformSelection && (
        <Panel title="Select Platforms to Check">
          <p className="text-ink-faded mb-md">
            Select which platforms to check. Only checks for selected platforms will be run.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {allPlatforms.map((platform) => {
              const status = platformStatus[platform];
              const cliCheckPassed = checksList.some(
                (c) => c.name === `${platform}-cli` && c.status === 'pass'
              );
              const isInstalled = status?.installed === true || cliCheckPassed;
              const isSelected = selectedPlatforms.includes(platform);

              return (
                <div
                  key={platform}
                  className={`
                    p-md border-medium rounded
                    ${isSelected ? 'border-electric-blue bg-electric-blue/5' : 'border-ink-faded'}
                  `}
                >
                  <Checkbox
                    id={`doctor-platform-${platform}`}
                    checked={isSelected}
                    onChange={() => handlePlatformToggle(platform)}
                    label={typeof platform === 'string' && platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'}
                  />
                  <div className="mt-xs">
                    <StatusBadge
                      status={isInstalled ? 'complete' : 'error'}
                      size="sm"
                      showLabel
                      label={isInstalled ? 'Installed' : 'Not Installed'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {selectedPlatforms.length > 0 && (
            <div className="mt-md p-sm bg-electric-blue/10 border-medium border-electric-blue rounded">
              <p className="text-sm">
                Selected: {selectedPlatforms.map((p) => (typeof p === 'string' && p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Unknown')).join(', ')}
              </p>
            </div>
          )}
        </Panel>
      )}

      {/* Error display */}
      {error && (
        <Panel showInnerBorder={false}>
          <div className="text-hot-magenta">{error}</div>
        </Panel>
      )}

      {/* Summary Panel */}
      <Panel title="Summary">
        <div className="flex flex-wrap items-center justify-between gap-lg">
          <div className="flex items-center gap-md">
            <StatusBadge status={getOverallStatus()} size="lg" />
            <span className="font-bold text-lg">
              {stats.passed}/{stats.total} checks passed
            </span>
          </div>

          <div className="flex gap-lg text-sm">
            <div className="flex items-center gap-sm">
              <StatusBadge status="complete" size="sm" />
              <span>{stats.passed} Passed</span>
            </div>
            <div className="flex items-center gap-sm">
              <StatusBadge status="error" size="sm" />
              <span>{stats.failed} Failed</span>
            </div>
            <div className="flex items-center gap-sm">
              <StatusBadge status="paused" size="sm" />
              <span>{stats.warning} Warnings</span>
            </div>
            <div className="flex items-center gap-sm">
              <StatusBadge status="pending" size="sm" />
              <span>{stats.skipped} Skipped</span>
            </div>
          </div>
        </div>
        {stats.failed > 0 && (
          <p className="mt-md text-sm text-muted">
            Use <strong>Install all missing</strong> above to install platform CLIs for you. Run <code>puppet-master init</code> in a project for project checks.
          </p>
        )}
        {stats.total > 0 && stats.skipped === stats.total && (
          <p className="mt-md text-sm text-muted">
            Click <strong>Run all checks</strong> first to see which platforms need installing; then <strong>Install all missing</strong> will appear.
          </p>
        )}
      </Panel>

      {/* Category Panels */}
      {CATEGORIES.map((category) => {
        const categoryChecks = checksList.filter((c) => c.category === category.id);
        if (categoryChecks.length === 0) return null;

        return (
          <CategoryPanel
            key={category.id}
            title={
              <span className="flex items-center gap-xs">
                {category.icon}
                {category.label}
              </span>
            }
            checks={categoryChecks}
            onFix={fixCheck}
            fixing={fixing}
          />
        );
      })}

      {/* Uncategorized checks */}
      {checksList.filter((c) => !CATEGORIES.some((cat) => cat.id === c.category)).length > 0 && (
        <CategoryPanel
          title={
            <span className="flex items-center gap-xs">
              <ClipboardIcon size="1em" />
              Other
            </span>
          }
          checks={checksList.filter((c) => !CATEGORIES.some((cat) => cat.id === c.category))}
          onFix={fixCheck}
          fixing={fixing}
        />
      )}
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface CategoryPanelProps {
  title: ReactNode;
  checks: DoctorCheck[];
  onFix: (checkName: string) => void;
  fixing: string | null;
}

function CategoryPanel({ title, checks, onFix, fixing }: CategoryPanelProps) {
  const list = Array.isArray(checks) ? checks : [];
  const passed = list.filter((c) => c.status === 'pass').length;
  const total = list.length;
  
  return (
    <Panel
      title={
        <span className="flex items-center gap-xs">
          {title}
          <span className="text-ink-faded">({passed}/{total})</span>
        </span>
      }
    >
      <div className="space-y-sm">
        {list.map((check) => (
          <CheckRow
            key={check.name}
            check={check}
            onFix={() => onFix(check.name)}
            fixing={fixing === check.name}
          />
        ))}
      </div>
    </Panel>
  );
}

interface CheckRowProps {
  check: DoctorCheck;
  onFix: () => void;
  fixing: boolean;
}

function CheckRow({ check, onFix, fixing }: CheckRowProps) {
  const [expanded, setExpanded] = useState(false);

  const getStatusType = (status: DoctorCheck['status']): StatusType => {
    switch (status) {
      case 'pass': return 'complete';
      case 'fail': return 'error';
      case 'warn': return 'paused';
      case 'skip': return 'pending';
      default: return 'pending';
    }
  };

  return (
    <div className={`
      border-medium p-md
      ${check.status === 'pass' ? 'border-status-success/30' : ''}
      ${check.status === 'fail' ? 'border-hot-magenta' : ''}
      ${check.status === 'warn' ? 'border-safety-orange' : ''}
      ${check.status === 'skip' ? 'border-ink-faded' : ''}
    `}>
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-md">
          <StatusBadge status={getStatusType(check.status)} size="sm" />
          <div>
            <span className="font-semibold">{check.name}</span>
            {check.message && (
              <span className="text-ink-faded ml-sm">— {check.message}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-sm">
          {check.details && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? '▼' : '▶'}
            </Button>
          )}
          {check.fixable && check.status !== 'pass' && (
            <Button
              variant="info"
              size="sm"
              onClick={onFix}
              loading={fixing}
            >
              FIX
            </Button>
          )}
        </div>
      </div>
      
      {expanded && check.details && (
        <div className="mt-md p-sm bg-paper-lined border-thin border-dashed border-ink-faded">
          <pre className="font-mono text-sm whitespace-pre-wrap">{check.details}</pre>
        </div>
      )}
    </div>
  );
}
