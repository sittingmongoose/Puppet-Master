import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, Input } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { FolderIcon, MonitorIcon, ClockIcon } from '@/components/icons';
import type { StatusType } from '@/types';

interface Session {
  id: string;
  name: string;
  projectName: string;
  startedAt: Date;
  endedAt: Date | null;
  status: StatusType;
  completedItems: number;
  totalItems: number;
  platform: string;
}

// Mock data for demonstration
const MOCK_SESSIONS: Session[] = [
  {
    id: 'PM-2026-01-25-10-30-00-001',
    name: 'Phase 1 Implementation',
    projectName: 'RWM Puppet Master',
    startedAt: new Date('2026-01-25T10:30:00'),
    endedAt: new Date('2026-01-25T12:45:00'),
    status: 'complete',
    completedItems: 12,
    totalItems: 12,
    platform: 'cursor',
  },
  {
    id: 'PM-2026-01-24-14-20-00-001',
    name: 'Phase 0 Setup',
    projectName: 'RWM Puppet Master',
    startedAt: new Date('2026-01-24T14:20:00'),
    endedAt: new Date('2026-01-24T16:00:00'),
    status: 'complete',
    completedItems: 5,
    totalItems: 5,
    platform: 'codex',
  },
  {
    id: 'PM-2026-01-24-09-00-00-001',
    name: 'Initial Planning',
    projectName: 'RWM Puppet Master',
    startedAt: new Date('2026-01-24T09:00:00'),
    endedAt: null,
    status: 'error',
    completedItems: 3,
    totalItems: 8,
    platform: 'claude',
  },
  {
    id: 'PM-2026-01-23-15-30-00-001',
    name: 'Feature Sprint',
    projectName: 'Other Project',
    startedAt: new Date('2026-01-23T15:30:00'),
    endedAt: new Date('2026-01-23T18:00:00'),
    status: 'complete',
    completedItems: 7,
    totalItems: 7,
    platform: 'cursor',
  },
  {
    id: 'PM-2026-01-23-10-00-00-001',
    name: 'Bug Fixes',
    projectName: 'Other Project',
    startedAt: new Date('2026-01-23T10:00:00'),
    endedAt: null,
    status: 'paused',
    completedItems: 2,
    totalItems: 4,
    platform: 'codex',
  },
];

type FilterStatus = 'all' | StatusType;

/**
 * History page - session tracking
 */
export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterProject, setFilterProject] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        // In production, this would call the API
        // const data = await api.getHistory();
        // setSessions(data);
        
        // Using mock data for now
        await new Promise((r) => setTimeout(r, 300));
        setSessions(Array.isArray(MOCK_SESSIONS) ? MOCK_SESSIONS : []);
      } catch (err) {
        console.error('[History] Failed to fetch sessions:', err);
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
        (session.name ?? '').toLowerCase().includes(query) ||
        (session.id ?? '').toLowerCase().includes(query) ||
        (session.projectName ?? '').toLowerCase().includes(query)
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
        <Button variant="ghost">
          REFRESH
        </Button>
      </div>

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
        {filteredSessions.length === 0 ? (
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
  const progress = Math.round((session.completedItems / session.totalItems) * 100);
  
  return (
    <div className="p-md border-medium border-ink-faded hover:border-electric-blue transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-md">
        {/* Session info */}
        <div className="flex-1 min-w-0 break-words">
          <div className="flex items-center gap-sm mb-xs flex-wrap">
            <h3 className="font-semibold break-words min-w-0">{session.name}</h3>
            <StatusBadge status={session.status} size="sm" />
          </div>
          <div className="text-sm text-ink-faded space-y-xs min-w-0">
            <div className="font-mono text-xs break-all">{session.id}</div>
            <div className="flex flex-wrap items-center gap-md">
              <span className="flex items-center gap-xs break-words">
                <FolderIcon size="1em" className="flex-shrink-0" />
                <span className="break-words">{session.projectName}</span>
              </span>
              <span className="flex items-center gap-xs">
                <MonitorIcon size="1em" className="flex-shrink-0" />
                {session.platform}
              </span>
              <span className="flex items-center gap-xs">
                <ClockIcon size="1em" className="flex-shrink-0" />
                {formatDuration(session.startedAt, session.endedAt)}
              </span>
            </div>
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
          <div className="text-sm text-right">
            <span className="font-semibold">{session.completedItems}</span>
            <span className="text-ink-faded">/{session.totalItems}</span>
            <span className="text-ink-faded ml-sm">({progress}%)</span>
          </div>
          
          {/* Progress bar */}
          <div className="w-32 h-2 bg-paper-lined overflow-hidden">
            <div
              className={`h-full transition-all ${
                session.status === 'complete'
                  ? 'bg-neon-green'
                  : session.status === 'error'
                  ? 'bg-hot-magenta'
                  : 'bg-electric-blue'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          
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
