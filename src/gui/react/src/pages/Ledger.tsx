import { useState, useEffect } from 'react';
import { Panel } from '@/components/layout';
import { Button, Input, HelpText } from '@/components/ui';
import { helpContent } from '@/lib/help-content.js';

interface LedgerEvent {
  id: number;
  type: string;
  timestamp: string;
  tierId?: string;
  sessionId?: string;
  data: Record<string, unknown>;
}

interface LedgerStats {
  totalEvents: number;
  eventsByType: Record<string, number>;
  sessionCount: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
}

/**
 * Ledger page - SQLite event ledger viewer
 * Feature parity with CLI `puppet-master ledger` command
 */
export default function LedgerPage() {
  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [stats, setStats] = useState<LedgerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<string>('');
  const [filterTier, setFilterTier] = useState<string>('');
  const [filterSession, setFilterSession] = useState<string>('');
  const [limit, setLimit] = useState<number>(100);

  // Fetch ledger stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch events when filters change
  useEffect(() => {
    fetchEvents();
  }, [filterType, filterTier, filterSession, limit]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/ledger/stats');
      if (!response.ok) throw new Error('Failed to fetch ledger stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('[Ledger] Failed to fetch stats:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filterType) params.set('type', filterType);
      if (filterTier) params.set('tierId', filterTier);
      if (filterSession) params.set('sessionId', filterSession);
      params.set('limit', String(limit));
      
      const response = await fetch(`/api/ledger?${params}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch ledger events');
      }
      
      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('[Ledger] Failed to fetch events:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterTier('');
    setFilterSession('');
    setLimit(100);
  };

  // Get unique event types for dropdown
  const eventTypes = stats ? Object.keys(stats.eventsByType).sort() : [];

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h1 className="font-display text-2xl">Event Ledger</h1>
          <HelpText {...helpContent.ledger.eventLedger} className="mt-sm" />
        </div>
        <Button variant="ghost" onClick={() => { fetchStats(); fetchEvents(); }}>
          REFRESH
        </Button>
      </div>

      {/* Stats Panel */}
      {stats && (
        <Panel title="Ledger Statistics">
          <HelpText {...helpContent.ledger.ledgerStatistics} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-md">
            <div className="text-center p-md border-medium border-ink-faded">
              <div className="text-2xl font-bold text-electric-blue">{stats.totalEvents}</div>
              <div className="text-sm text-ink-faded">Total Events</div>
            </div>
            <div className="text-center p-md border-medium border-ink-faded">
              <div className="text-2xl font-bold text-electric-blue">{Object.keys(stats.eventsByType).length}</div>
              <div className="text-sm text-ink-faded">Event Types</div>
            </div>
            <div className="text-center p-md border-medium border-ink-faded">
              <div className="text-2xl font-bold text-electric-blue">{stats.sessionCount}</div>
              <div className="text-sm text-ink-faded">Sessions</div>
            </div>
            <div className="text-center p-md border-medium border-ink-faded">
              <div className="text-xs text-ink-faded">Date Range</div>
              <div className="text-sm">
                {stats.dateRange.earliest ? new Date(stats.dateRange.earliest).toLocaleDateString() : 'N/A'}
                {' → '}
                {stats.dateRange.latest ? new Date(stats.dateRange.latest).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* Filters */}
      <Panel title="Filters">
        <HelpText {...helpContent.ledger.filters} />
        <div className="flex flex-wrap gap-md items-end mt-md">
          <div className="min-w-[150px]">
            <label className="block text-sm mb-xs">Event Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none"
              aria-label="Filter by event type"
            >
              <option value="">All Types</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type} ({stats?.eventsByType[type] || 0})
                </option>
              ))}
            </select>
            <div className="mt-xs">
              <HelpText {...helpContent.ledger.eventTypes} size="sm" />
            </div>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <Input
              label="Tier ID"
              placeholder="e.g., PH-001, TK-001-001"
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
            />
            <HelpText {...helpContent.ledger.tierId} size="sm" />
          </div>
          
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Session ID"
              placeholder="e.g., PM-2026-01-25-..."
              value={filterSession}
              onChange={(e) => setFilterSession(e.target.value)}
            />
            <HelpText {...helpContent.ledger.sessionId} size="sm" />
          </div>
          
          <div className="w-24">
            <label className="block text-sm mb-xs">Limit</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none"
              aria-label="Result limit"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
            <div className="mt-xs">
              <HelpText {...helpContent.ledger.limit} size="sm" />
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            CLEAR
          </Button>
        </div>
      </Panel>

      {/* Events List */}
      <Panel title={`Events (${events.length})`}>
        {error && (
          <div className="p-md mb-md border-medium border-hot-magenta bg-hot-magenta/10 text-hot-magenta">
            Error: {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-xl">
            <p className="text-ink-faded">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <p className="text-ink-faded text-center py-lg">
            No events found matching filters
          </p>
        ) : (
          <div className="space-y-sm max-h-[600px] overflow-y-auto">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
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

interface EventCardProps {
  event: LedgerEvent;
}

function EventCard({ event }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const eventDate = new Date(event.timestamp);
  const timeStr = eventDate.toLocaleTimeString();
  const dateStr = eventDate.toLocaleDateString();
  
  // Event type colors
  const typeColors: Record<string, string> = {
    iteration_start: 'text-electric-blue',
    iteration_complete: 'text-neon-green',
    iteration_failed: 'text-hot-magenta',
    gate_passed: 'text-neon-green',
    gate_failed: 'text-hot-magenta',
    phase_start: 'text-electric-blue',
    phase_complete: 'text-neon-green',
    task_start: 'text-electric-blue',
    task_complete: 'text-neon-green',
    error: 'text-hot-magenta',
  };
  
  const typeColor = typeColors[event.type] || 'text-ink-dark';
  
  return (
    <div 
      className="p-sm border-medium border-ink-faded hover:border-electric-blue transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between gap-md min-w-0">
        <div className="flex items-center gap-md flex-wrap min-w-0 flex-1">
          <span className="text-xs text-ink-faded font-mono flex-shrink-0">{dateStr} {timeStr}</span>
          <span className={`font-semibold ${typeColor} break-words`}>{event.type}</span>
          {event.tierId && (
            <span className="text-xs bg-paper-lined px-xs rounded break-all">{event.tierId}</span>
          )}
        </div>
        <span className="text-xs text-ink-faded flex-shrink-0">{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div className="mt-sm pt-sm border-t border-ink-faded">
          {event.sessionId && (
            <div className="text-xs text-ink-faded mb-xs break-all">
              Session: <span className="font-mono break-all">{event.sessionId}</span>
            </div>
          )}
          <pre className="text-xs bg-paper-lined p-sm overflow-x-auto break-words whitespace-pre-wrap">
            {JSON.stringify(event.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
