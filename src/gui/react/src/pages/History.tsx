import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { FolderIcon, ClockIcon } from '@/components/icons';
import { api, getErrorMessage } from '@/lib';
import { fetchWithRetry } from '@/hooks/index.js';
import type { StatusType } from '@/types';

interface Session {
  id: string;
  projectName: string;
  projectPath?: string;
  startedAt: Date;
  endedAt: Date | null;
  status: StatusType;
  outcome?: string;
  iterationsRun: number;
  phasesCompleted?: number;
  tasksCompleted?: number;
  subtasksCompleted?: number;
}

type FilterStatus = 'all' | StatusType;

type BackendHistoryResponse = Awaited<ReturnType<typeof api.getHistory>>;
type BackendHistorySession = BackendHistoryResponse['sessions'][number];

function mapBackendStatusToUi(status: BackendHistorySession['status']): StatusType {
  switch (status) {
    case 'running':
      return 'running';
    case 'completed':
      return 'complete';
    case 'failed':
      return 'error';
    case 'stopped':
      return 'paused';
    default:
      return 'pending';
  }
}

/**
 * History page - session tracking
 */
export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterProject, setFilterProject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchWithRetry(() => api.getHistory()).catch((e: unknown) => {
          throw new Error(getErrorMessage(e, 'Failed to load history'));
        });

        const raw = Array.isArray(data?.sessions) ? data.sessions : [];
        const mapped = raw.map((s): Session => {
          const projectName = s.projectName?.trim()
            || (s.projectPath ? s.projectPath.split(/[/\\]/).filter(Boolean).pop() ?? 'Unknown Project' : 'Unknown Project');
          const startedAt = new Date(s.startTime);
          const endedAt = s.endTime ? new Date(s.endTime) : null;
          return {
            id: s.sessionId,
            projectName,
            projectPath: s.projectPath,
            startedAt,
            endedAt,
            status: mapBackendStatusToUi(s.status),
            outcome: s.outcome,
            iterationsRun: s.iterationsRun ?? 0,
            phasesCompleted: s.phasesCompleted,
            tasksCompleted: s.tasksCompleted,
            subtasksCompleted: s.subtasksCompleted,
          };
        });

        setSessions(mapped);
      } catch (err) {
        console.error('[History] Failed to fetch sessions:', err);
        setError(getErrorMessage(err, 'Failed to load history'));
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const sessionsList = Array.isArray(sessions) ? sessions : [];
  const projects = Array.from(new Set(sessionsList.map((s) => s.projectName)));

  // Filter sessions
  const filteredSessions = sessionsList.filter((session) => {
    // Status filter
    if (filterStatus !== 'all' && session.status !== filterStatus) {
      return false;
    }
    // Project filter
    if (filterProject && session.projectName !== filterProject) {
      return false;
    }
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (session.id ?? '').toLowerCase().includes(query) ||
        (session.projectName ?? '').toLowerCase().includes(query) ||
        (session.projectPath ?? '').toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Format duration
  const formatDuration = (start: Date, end: Date | null) => {
    if (!end) return 'In progress';
    const ms = end.getTime() - start.getTime();
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">History</h1>
        <Button
          variant="ghost"
          onClick={() => {
            // Trigger reload by re-running effect logic inline.
            setLoading(true);
            setError(null);
            fetchWithRetry(() => api.getHistory())
              .then((data) => {
                const raw = Array.isArray(data?.sessions) ? data.sessions : [];
                const mapped = raw.map((s): Session => {
                  const projectName = s.projectName?.trim()
                    || (s.projectPath ? s.projectPath.split(/[/\\]/).filter(Boolean).pop() ?? 'Unknown Project' : 'Unknown Project');
                  const startedAt = new Date(s.startTime);
                  const endedAt = s.endTime ? new Date(s.endTime) : null;
                  return {
                    id: s.sessionId,
                    projectName,
                    projectPath: s.projectPath,
                    startedAt,
                    endedAt,
                    status: mapBackendStatusToUi(s.status),
                    outcome: s.outcome,
                    iterationsRun: s.iterationsRun ?? 0,
                    phasesCompleted: s.phasesCompleted,
                    tasksCompleted: s.tasksCompleted,
                    subtasksCompleted: s.subtasksCompleted,
                  };
                });
                setSessions(mapped);
              })
              .catch((err) => {
                console.error('[History] Failed to fetch sessions:', err);
                setError(getErrorMessage(err, 'Failed to refresh history'));
                setSessions([]);
              })
              .finally(() => setLoading(false));
          }}
        >
          REFRESH
        </Button>
      </div>

      {error && (
        <Panel title="Error">
          <p className="text-hot-magenta break-words">{error}</p>
        </Panel>
      )}

      {/* Filters */}
      <Panel title="Filters">
        <div className="flex flex-wrap gap-md items-end">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="min-w-[150px]">
            <label className="block text-sm mb-xs">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="w-full p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="complete">Complete</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div className="min-w-[150px]">
            <label className="block text-sm mb-xs">Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none"
              aria-label="Filter by project"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
              setFilterProject('');
            }}
          >
            CLEAR FILTERS
          </Button>
        </div>
      </Panel>

      {/* Sessions list */}
      <Panel title={`Sessions (${filteredSessions.length})`}>
        {sessionsList.length === 0 ? (
          <p className="text-ink-faded text-center py-lg">
            No sessions yet
          </p>
        ) : filteredSessions.length === 0 ? (
          <p className="text-ink-faded text-center py-lg">
            No sessions match your filters
          </p>
        ) : (
          <div className="space-y-sm">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                formatDuration={formatDuration}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface SessionCardProps {
  session: Session;
  formatDuration: (start: Date, end: Date | null) => string;
}

function SessionCard({ session, formatDuration }: SessionCardProps) {
  const counts = [
    session.phasesCompleted != null ? `Phases: ${session.phasesCompleted}` : null,
    session.tasksCompleted != null ? `Tasks: ${session.tasksCompleted}` : null,
    session.subtasksCompleted != null ? `Subtasks: ${session.subtasksCompleted}` : null,
    `Iterations: ${session.iterationsRun}`,
  ].filter(Boolean).join(' • ');

  return (
    <div className="p-md border-medium border-ink-faded hover:border-electric-blue transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-md">
        {/* Session info */}
        <div className="flex-1 min-w-0 break-words">
          <div className="flex items-center gap-sm mb-xs flex-wrap">
            <h3 className="font-semibold break-words min-w-0">{session.projectName}</h3>
            <StatusBadge status={session.status} size="sm" />
          </div>
          <div className="text-sm text-ink-faded space-y-xs min-w-0">
            <div className="font-mono text-xs break-all">{session.id}</div>
            <div className="flex flex-wrap items-center gap-md">
              <span className="flex items-center gap-xs break-words">
                <FolderIcon size="1em" className="flex-shrink-0" />
                <span className="break-words">{session.projectPath ?? 'Project path unavailable'}</span>
              </span>
              <span className="flex items-center gap-xs">
                <ClockIcon size="1em" className="flex-shrink-0" />
                {formatDuration(session.startedAt, session.endedAt)}
              </span>
            </div>
            {counts && <div className="text-xs">{counts}</div>}
            <div className="flex items-center gap-sm">
              <span className="text-xs">
                {session.startedAt.toLocaleDateString()} {session.startedAt.toLocaleTimeString()}
              </span>
              {session.endedAt && (
                <>
                  <span>→</span>
                  <span className="text-xs">{session.endedAt.toLocaleTimeString()}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Progress and actions */}
        <div className="flex flex-col items-end gap-sm">
          {/* Actions */}
          <div className="flex gap-xs">
            <Link to={`/tiers?session=${session.id}`}>
              <Button variant="ghost" size="sm">
                VIEW
              </Button>
            </Link>
            {(session.status === 'paused' || session.status === 'error') && (
              <Button variant="primary" size="sm">
                RESUME
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
