import { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { api, type DoctorCheck } from '@/lib';
import type { StatusType } from '@/types';

const CATEGORIES = [
  { id: 'cli', label: 'CLI Tools', icon: '🔧' },
  { id: 'git', label: 'Git', icon: '📦' },
  { id: 'runtimes', label: 'Runtimes', icon: '⚙️' },
  { id: 'browser', label: 'Browser Tools', icon: '🌐' },
  { id: 'capabilities', label: 'Capabilities', icon: '✅' },
  { id: 'project', label: 'Project Setup', icon: '📁' },
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
      const data = await api.runDoctorChecks();
      setChecks(Array.isArray(data.checks) ? data.checks : []);
    } catch (err) {
      console.error('[Doctor] Failed to run checks:', err);
      setError(err instanceof Error ? err.message : 'Failed to run checks');
    } finally {
      setRunning(false);
    }
  }, []);

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

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Doctor</h1>
        <Button
          variant="primary"
          onClick={runChecks}
          loading={running}
        >
          RUN ALL CHECKS
        </Button>
      </div>

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
      </Panel>

      {/* Category Panels */}
      {CATEGORIES.map((category) => {
        const categoryChecks = checksList.filter((c) => c.category === category.id);
        if (categoryChecks.length === 0) return null;

        return (
          <CategoryPanel
            key={category.id}
            title={`${category.icon} ${category.label}`}
            checks={categoryChecks}
            onFix={fixCheck}
            fixing={fixing}
          />
        );
      })}

      {/* Uncategorized checks */}
      {checksList.filter((c) => !CATEGORIES.some((cat) => cat.id === c.category)).length > 0 && (
        <CategoryPanel
          title="📋 Other"
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
  title: string;
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
