import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
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
import { api, APIError, type DoctorCheck, type PlatformStatusType } from '@/lib';
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
  const [checks, setChecks] = useState<DoctorCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixing, setFixing] = useState<string | null>(null);
  const [installingAll, setInstallingAll] = useState(false);
  const [installAllProgress, setInstallAllProgress] = useState<string | null>(null);
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformStatusType>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [showPlatformSelection, setShowPlatformSelection] = useState(false);

  // Fetch platform status on mount
  useEffect(() => {
    const fetchPlatformStatus = async () => {
      try {
        const status = await api.getPlatformStatus();
        setPlatformStatus(status.platforms);
        // Pre-select installed platforms
        setSelectedPlatforms(status.installedPlatforms as Platform[]);
      } catch (err) {
        console.error('[Doctor] Failed to fetch platform status:', err);
      }
    };
    fetchPlatformStatus();
  }, []);

  // Fetch checks on mount
  useEffect(() => {
    const fetchChecks = async () => {
      try {
        setLoading(true);
        const data = await api.getDoctorChecks();
        setChecks(Array.isArray(data.checks) ? data.checks : []);
      } catch (err) {
        console.error('[Doctor] Failed to fetch checks:', err);
        setError(err instanceof Error ? err.message : 'Failed to load checks');
      } finally {
        setLoading(false);
      }
    };
    fetchChecks();
  }, []);

  // Run all checks
  const runChecks = useCallback(async () => {
    try {
      setRunning(true);
      setError(null);
      const data = await api.runDoctorChecks({ 
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : undefined 
      });
      setChecks(Array.isArray(data.checks) ? data.checks : []);
    } catch (err) {
      console.error('[Doctor] Failed to run checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to run checks');
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
      setChecks(Array.isArray(data.checks) ? data.checks : []);
    } catch (err) {
      console.error('[Doctor] Failed to fix check:', err);
      setError(err instanceof Error ? err.message : 'Failed to fix check');
    } finally {
      setFixing(null);
    }
  }, []);

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
        const check = failedFixable[i];
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
      setChecks(Array.isArray(data.checks) ? data.checks : []);
    } catch (err) {
      console.error('[Doctor] Install all failed:', err);
      setError(err instanceof Error ? err.message : 'Install all failed');
    } finally {
      setInstallingAll(false);
      setInstallAllProgress(null);
    }
  }, [failedFixable, selectedPlatforms]);

  const checksList = Array.isArray(checks) ? checks : [];
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

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading checks...</p>
      </div>
    );
  }

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
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

      {/* Platform Selection */}
      {showPlatformSelection && (
        <Panel title="Select Platforms to Check">
          <p className="text-ink-faded mb-md">
            Select which platforms to check. Only checks for selected platforms will be run.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            {allPlatforms.map((platform) => {
              const status = platformStatus[platform];
              const isInstalled = status?.installed ?? false;
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
                    label={platform.charAt(0).toUpperCase() + platform.slice(1)}
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
                Selected: {selectedPlatforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
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
    <Panel title={`${title} (${passed}/${total})`}>
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
