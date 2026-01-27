import { useState, useEffect } from 'react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import type { Platform } from '@/types';

interface PlatformMetrics {
  platform: Platform;
  callsToday: number;
  callsThisHour: number;
  callsThisWeek: number;
  avgLatencyMs: number;
  successRate: number;
  lastCall: Date | null;
}

interface DailyStats {
  date: string;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalDurationMs: number;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  averageDuration: number;
  averageItemsPerSession: number;
}

// Mock data
const MOCK_PLATFORM_METRICS: PlatformMetrics[] = [
  {
    platform: 'cursor',
    callsToday: 45,
    callsThisHour: 8,
    callsThisWeek: 234,
    avgLatencyMs: 2340,
    successRate: 94.5,
    lastCall: new Date('2026-01-25T12:30:00'),
  },
  {
    platform: 'codex',
    callsToday: 23,
    callsThisHour: 3,
    callsThisWeek: 156,
    avgLatencyMs: 3120,
    successRate: 91.2,
    lastCall: new Date('2026-01-25T12:15:00'),
  },
  {
    platform: 'claude',
    callsToday: 12,
    callsThisHour: 2,
    callsThisWeek: 89,
    avgLatencyMs: 1890,
    successRate: 97.8,
    lastCall: new Date('2026-01-25T12:25:00'),
  },
];

const MOCK_DAILY_STATS: DailyStats[] = [
  { date: '2026-01-25', totalCalls: 80, successfulCalls: 76, failedCalls: 4, totalDurationMs: 156000 },
  { date: '2026-01-24', totalCalls: 124, successfulCalls: 118, failedCalls: 6, totalDurationMs: 284000 },
  { date: '2026-01-23', totalCalls: 95, successfulCalls: 90, failedCalls: 5, totalDurationMs: 198000 },
  { date: '2026-01-22', totalCalls: 67, successfulCalls: 65, failedCalls: 2, totalDurationMs: 145000 },
  { date: '2026-01-21', totalCalls: 113, successfulCalls: 108, failedCalls: 5, totalDurationMs: 267000 },
];

const MOCK_SESSION_STATS: SessionStats = {
  totalSessions: 47,
  completedSessions: 42,
  averageDuration: 2.3, // hours
  averageItemsPerSession: 8.5,
};

/**
 * Metrics page - performance and usage statistics
 */
export default function MetricsPage() {
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch metrics on mount
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // In production, this would call the API
        // const data = await api.getMetrics();
        
        await new Promise((r) => setTimeout(r, 300));
        setPlatformMetrics(Array.isArray(MOCK_PLATFORM_METRICS) ? MOCK_PLATFORM_METRICS : []);
        setDailyStats(Array.isArray(MOCK_DAILY_STATS) ? MOCK_DAILY_STATS : []);
        setSessionStats(MOCK_SESSION_STATS);
      } catch (err) {
        console.error('[Metrics] Failed to fetch metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const platformMetricsList = Array.isArray(platformMetrics) ? platformMetrics : [];
  const dailyStatsList = Array.isArray(dailyStats) ? dailyStats : [];

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Metrics</h1>
        <Button variant="ghost">
          REFRESH
        </Button>
      </div>

      {/* Session Overview */}
      {sessionStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <StatCard label="Total Sessions" value={sessionStats.totalSessions.toString()} />
          <StatCard 
            label="Completed" 
            value={sessionStats.completedSessions.toString()}
            subtext={`${Math.round((sessionStats.completedSessions / sessionStats.totalSessions) * 100)}%`}
          />
          <StatCard label="Avg Duration" value={`${sessionStats.averageDuration}h`} />
          <StatCard label="Avg Items/Session" value={sessionStats.averageItemsPerSession.toFixed(1)} />
        </div>
      )}

      {/* Platform Metrics */}
      <Panel title="Platform Usage">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-medium border-ink-faded">
                <th className="pb-sm font-semibold">Platform</th>
                <th className="pb-sm font-semibold">Today</th>
                <th className="pb-sm font-semibold">This Hour</th>
                <th className="pb-sm font-semibold">This Week</th>
                <th className="pb-sm font-semibold">Avg Latency</th>
                <th className="pb-sm font-semibold">Success Rate</th>
                <th className="pb-sm font-semibold">Last Call</th>
              </tr>
            </thead>
            <tbody>
              {platformMetricsList.map((metric) => (
                <tr key={metric.platform} className="border-b border-ink-faded/30">
                  <td className="py-sm font-mono capitalize min-w-0 break-words">{metric.platform}</td>
                  <td className="py-sm min-w-0 break-words">{metric.callsToday}</td>
                  <td className="py-sm min-w-0 break-words">{metric.callsThisHour}</td>
                  <td className="py-sm min-w-0 break-words">{metric.callsThisWeek}</td>
                  <td className="py-sm min-w-0 break-words">{formatLatency(metric.avgLatencyMs)}</td>
                  <td className="py-sm min-w-0">
                    <span className={metric.successRate >= 95 ? 'text-neon-green' : metric.successRate >= 90 ? 'text-safety-orange' : 'text-hot-magenta'}>
                      {metric.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-sm text-ink-faded min-w-0 break-words">
                    {metric.lastCall?.toLocaleTimeString() ?? 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Daily Stats */}
      <Panel title="Daily Statistics">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-medium border-ink-faded">
                <th className="pb-sm font-semibold">Date</th>
                <th className="pb-sm font-semibold">Total Calls</th>
                <th className="pb-sm font-semibold">Successful</th>
                <th className="pb-sm font-semibold">Failed</th>
                <th className="pb-sm font-semibold">Success Rate</th>
                <th className="pb-sm font-semibold">Total Duration</th>
              </tr>
            </thead>
            <tbody>
              {dailyStatsList.map((stat) => {
                const successRate = (stat.successfulCalls / stat.totalCalls) * 100;
                return (
                  <tr key={stat.date} className="border-b border-ink-faded/30">
                    <td className="py-sm font-mono">{stat.date}</td>
                    <td className="py-sm">{stat.totalCalls}</td>
                    <td className="py-sm text-neon-green">{stat.successfulCalls}</td>
                    <td className="py-sm text-hot-magenta">{stat.failedCalls}</td>
                    <td className="py-sm">
                      <span className={successRate >= 95 ? 'text-neon-green' : 'text-safety-orange'}>
                        {successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-sm">{Math.round(stat.totalDurationMs / 60000)}m</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Performance Stats */}
      <Panel title="Performance Summary">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="text-center p-md border-medium border-ink-faded">
            <div className="text-3xl font-display text-electric-blue mb-xs">
              {platformMetrics.reduce((sum, m) => sum + m.callsThisWeek, 0)}
            </div>
            <div className="text-sm text-ink-faded">Total Calls This Week</div>
          </div>
          <div className="text-center p-md border-medium border-ink-faded">
            <div className="text-3xl font-display text-neon-green mb-xs">
              {(platformMetrics.reduce((sum, m) => sum + m.successRate, 0) / platformMetrics.length).toFixed(1)}%
            </div>
            <div className="text-sm text-ink-faded">Average Success Rate</div>
          </div>
          <div className="text-center p-md border-medium border-ink-faded">
            <div className="text-3xl font-display text-safety-orange mb-xs">
              {formatLatency(
                Math.round(platformMetrics.reduce((sum, m) => sum + m.avgLatencyMs, 0) / platformMetrics.length)
              )}
            </div>
            <div className="text-sm text-ink-faded">Average Latency</div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
}

function StatCard({ label, value, subtext }: StatCardProps) {
  return (
    <div className="p-md border-medium border-ink-faded text-center">
      <div className="text-2xl font-display text-electric-blue mb-xs">{value}</div>
      <div className="text-sm text-ink-faded">{label}</div>
      {subtext && <div className="text-xs text-neon-green mt-xs">{subtext}</div>}
    </div>
  );
}
