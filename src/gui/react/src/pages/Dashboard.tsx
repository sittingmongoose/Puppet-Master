import { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, ProgressBar } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import {
  useOrchestratorStore,
  useProjectStore,
  useBudgetStore,
} from '@/stores';
import { useSSEStatus, useSSEStoreIntegration, api } from '@/lib';
import type { StatusType, Platform } from '@/types';

/**
 * Dashboard page - main orchestration view
 */
export default function DashboardPage() {
  // Initialize SSE integration
  useSSEStoreIntegration();
  const sseStatus = useSSEStatus();

  // Store state
  const status = useOrchestratorStore((s) => s.status);
  const currentItem = useOrchestratorStore((s) => s.currentItem);
  const progress = useOrchestratorStore((s) => s.progress);
  const output = useOrchestratorStore((s) => s.output);
  const setStatus = useOrchestratorStore((s) => s.setStatus);
  const setCurrentItem = useOrchestratorStore((s) => s.setCurrentItem);
  const updateProgress = useOrchestratorStore((s) => s.updateProgress);
  
  const currentProject = useProjectStore((s) => s.currentProject);
  const budgets = useBudgetStore((s) => s.platforms);

  // Fetch initial state on mount
  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        const state = await api.getState();
        setStatus(state.orchestratorState);
        if (state.currentItem) {
          setCurrentItem(state.currentItem);
        }
        if (state.progress) {
          updateProgress(state.progress);
        }
      } catch (err) {
        console.error('[Dashboard] Failed to fetch initial state:', err);
      }
    };
    fetchInitialState();
  }, [setStatus, setCurrentItem, updateProgress]);

  // Control handlers
  const handleStart = useCallback(async () => {
    try {
      await api.start();
    } catch (err) {
      console.error('[Dashboard] Start failed:', err);
    }
  }, []);

  const handlePause = useCallback(async () => {
    try {
      await api.pause();
    } catch (err) {
      console.error('[Dashboard] Pause failed:', err);
    }
  }, []);

  const handleResume = useCallback(async () => {
    try {
      await api.resume();
    } catch (err) {
      console.error('[Dashboard] Resume failed:', err);
    }
  }, []);

  const handleStop = useCallback(async () => {
    try {
      await api.stop();
    } catch (err) {
      console.error('[Dashboard] Stop failed:', err);
    }
  }, []);

  const handleRetry = useCallback(async () => {
    try {
      await api.retry();
    } catch (err) {
      console.error('[Dashboard] Retry failed:', err);
    }
  }, []);

  // Button state based on orchestrator status
  const canStart = status === 'idle' && currentProject !== null;
  const canPause = status === 'running';
  const canResume = status === 'paused';
  const canStop = status === 'running' || status === 'paused';
  const canRetry = status === 'error';

  return (
    <div className="space-y-lg">
      {/* Status Bar */}
      <StatusBar
        status={status}
        progress={progress}
        budgets={budgets}
        connected={sseStatus.connected}
      />

      {/* Project Management */}
      <ProjectPanel project={currentProject} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Current Item Panel */}
        <CurrentItemPanel item={currentItem} />

        {/* Progress Panel */}
        <ProgressPanel progress={progress} />

        {/* Run Controls Panel */}
        <ControlsPanel
          status={status}
          canStart={canStart}
          canPause={canPause}
          canResume={canResume}
          canStop={canStop}
          canRetry={canRetry}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStop}
          onRetry={handleRetry}
        />

        {/* Live Output Panel */}
        <OutputPanel output={output} />
      </div>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface StatusBarProps {
  status: StatusType;
  progress: {
    phase: { current: number; total: number };
    task: { current: number; total: number };
    subtask: { current: number; total: number };
    iteration: { current: number; total: number };
  };
  budgets: Record<Platform, { used: number; limit: number }>;
  connected: boolean;
}

function StatusBar({ status, progress, budgets, connected }: StatusBarProps) {
  return (
    <Panel showInnerBorder={false}>
      <div className="flex flex-wrap items-center justify-between gap-md">
        {/* Status indicator */}
        <div className="flex items-center gap-sm">
          <StatusBadge status={status} showLabel />
        </div>

        {/* Position in workflow */}
        <div className="flex items-center gap-sm text-sm font-mono">
          <span>Phase {progress.phase.current}/{progress.phase.total}</span>
          <span className="text-ink-faded">│</span>
          <span>Task {progress.task.current}/{progress.task.total}</span>
          <span className="text-ink-faded">│</span>
          <span>Subtask {progress.subtask.current}/{progress.subtask.total}</span>
          <span className="text-ink-faded">│</span>
          <span>Iter {progress.iteration.current}/{progress.iteration.total}</span>
        </div>

        {/* Budget indicators */}
        <div className="flex items-center gap-sm text-sm">
          <span>Budget:</span>
          {Object.entries(budgets).map(([platform, info]) => (
            <span key={platform} className={info.used >= info.limit ? 'text-hot-magenta' : ''}>
              {platform} {info.used}/{info.limit}
            </span>
          ))}
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-xs">
          <StatusBadge
            status={connected ? 'complete' : 'error'}
            size="sm"
          />
          <span className="text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>
    </Panel>
  );
}

interface ProjectPanelProps {
  project: { name: string; path: string } | null;
}

function ProjectPanel({ project }: ProjectPanelProps) {
  if (!project) {
    return (
      <Panel title="Project Management">
        <div className="text-center py-lg">
          <p className="mb-md text-ink-faded">
            No project loaded. Start a new project or select an existing one.
          </p>
          <div className="flex justify-center gap-md">
            <Link to="/wizard">
              <Button variant="primary">START NEW PROJECT</Button>
            </Link>
            <Link to="/projects">
              <Button variant="info">SELECT EXISTING PROJECT</Button>
            </Link>
          </div>
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Project Management">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div className="space-y-xs">
          <div>
            <span className="font-bold">Project Name:</span>{' '}
            <span>{project.name}</span>
          </div>
          <div>
            <span className="font-bold">Project Path:</span>{' '}
            <span className="font-mono text-sm">{project.path}</span>
          </div>
        </div>
        <div className="flex gap-sm">
          <Link to="/projects">
            <Button variant="info" size="sm">SWITCH PROJECT</Button>
          </Link>
          <Link to="/tiers">
            <Button variant="ghost" size="sm">VIEW TIERS</Button>
          </Link>
          <Link to="/config">
            <Button variant="ghost" size="sm">CONFIGURATION</Button>
          </Link>
        </div>
      </div>
    </Panel>
  );
}

interface CurrentItemPanelProps {
  item: {
    id: string;
    type: string;
    title: string;
    status: StatusType;
  } | null;
}

function CurrentItemPanel({ item }: CurrentItemPanelProps) {
  return (
    <Panel title="Current Item">
      {item ? (
        <div className="space-y-md">
          <div className="inline-block px-sm py-xs border-medium border-ink-black font-mono font-bold">
            {item.id}
          </div>
          <div className="text-lg font-semibold">{item.title}</div>
          <div className="flex items-center gap-sm">
            <span className="font-bold">Status:</span>
            <StatusBadge status={item.status} showLabel />
          </div>
        </div>
      ) : (
        <div className="text-ink-faded text-center py-lg">
          No active item
        </div>
      )}
    </Panel>
  );
}

interface ProgressPanelProps {
  progress: {
    phase: { current: number; total: number };
    task: { current: number; total: number };
    subtask: { current: number; total: number };
    overall: number;
  };
}

function ProgressPanel({ progress }: ProgressPanelProps) {
  return (
    <Panel title="Progress">
      <div className="space-y-md">
        {/* Overall progress */}
        <ProgressBar
          value={progress.overall}
          label={`${Math.round(progress.overall)}%`}
        />

        {/* Tier progress */}
        <div className="space-y-sm">
          <TierProgressRow
            label="Phases"
            current={progress.phase.current}
            total={progress.phase.total}
          />
          <TierProgressRow
            label="Tasks"
            current={progress.task.current}
            total={progress.task.total}
          />
          <TierProgressRow
            label="Subtasks"
            current={progress.subtask.current}
            total={progress.subtask.total}
          />
        </div>
      </div>
    </Panel>
  );
}

function TierProgressRow({ label, current, total }: { label: string; current: number; total: number }) {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="flex items-center gap-md">
      <span className="w-20 font-bold">{label}:</span>
      <span className="w-12 text-right font-mono">{current}/{total}</span>
      <div className="flex-1">
        <ProgressBar value={percentage} showLabel={false} size="sm" variant="success" />
      </div>
    </div>
  );
}

interface ControlsPanelProps {
  status: StatusType;
  canStart: boolean;
  canPause: boolean;
  canResume: boolean;
  canStop: boolean;
  canRetry: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry: () => void;
}

function ControlsPanel({
  canStart,
  canPause,
  canResume,
  canStop,
  canRetry,
  onStart,
  onPause,
  onResume,
  onStop,
  onRetry,
}: ControlsPanelProps) {
  return (
    <Panel title="Run Controls">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-sm">
        <Button
          variant="primary"
          disabled={!canStart}
          onClick={onStart}
        >
          START
        </Button>
        <Button
          variant="warning"
          disabled={!canPause}
          onClick={onPause}
        >
          PAUSE
        </Button>
        <Button
          variant="info"
          disabled={!canResume}
          onClick={onResume}
        >
          RESUME
        </Button>
        <Button
          variant="danger"
          disabled={!canStop}
          onClick={onStop}
        >
          STOP
        </Button>
      </div>
      {canRetry && (
        <div className="mt-md">
          <Button variant="info" onClick={onRetry} className="w-full">
            RETRY
          </Button>
        </div>
      )}
    </Panel>
  );
}

interface OutputPanelProps {
  output: Array<{
    id: string;
    timestamp: Date;
    type: string;
    content: string;
  }>;
}

function OutputPanel({ output }: OutputPanelProps) {
  return (
    <Panel title="Live Output">
      <div
        className="
          h-64 overflow-y-auto
          bg-ink-black text-acid-lime
          p-md font-mono text-sm
          border-medium border-ink-black
        "
      >
        {output.length === 0 ? (
          <div className="text-ink-faded">Waiting for output...</div>
        ) : (
          output.map((line) => (
            <div
              key={line.id}
              className={`
                ${line.type === 'stderr' ? 'text-hot-magenta' : ''}
                ${line.type === 'system' ? 'text-safety-orange' : ''}
              `}
            >
              {line.content}
            </div>
          ))
        )}
      </div>
    </Panel>
  );
}
