import { useState, useEffect } from 'react';
import { Panel } from '@/components/layout';
import { Button } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import type { StatusType } from '@/types';

interface CoverageCategory {
  id: string;
  name: string;
  total: number;
  covered: number;
  status: StatusType;
}

interface FeatureCoverage {
  id: string;
  name: string;
  phase: string;
  tested: boolean;
  verified: boolean;
  notes?: string;
}

// Mock data
const MOCK_CATEGORIES: CoverageCategory[] = [
  { id: 'unit', name: 'Unit Tests', total: 120, covered: 108, status: 'complete' },
  { id: 'integration', name: 'Integration Tests', total: 45, covered: 38, status: 'running' },
  { id: 'e2e', name: 'E2E Tests', total: 20, covered: 12, status: 'pending' },
  { id: 'verification', name: 'Verification Gates', total: 35, covered: 32, status: 'complete' },
  { id: 'documentation', name: 'Documentation', total: 50, covered: 45, status: 'complete' },
];

const MOCK_FEATURES: FeatureCoverage[] = [
  { id: 'f1', name: 'CLI Orchestration', phase: 'Phase 0', tested: true, verified: true },
  { id: 'f2', name: 'State Management', phase: 'Phase 0', tested: true, verified: true },
  { id: 'f3', name: 'Platform Detection', phase: 'Phase 1', tested: true, verified: true },
  { id: 'f4', name: 'Cursor Integration', phase: 'Phase 1', tested: true, verified: false, notes: 'Awaiting manual verification' },
  { id: 'f5', name: 'Codex Integration', phase: 'Phase 1', tested: true, verified: false },
  { id: 'f6', name: 'Claude Integration', phase: 'Phase 1', tested: false, verified: false, notes: 'Tests in progress' },
  { id: 'f7', name: 'Verification Gates', phase: 'Phase 2', tested: true, verified: true },
  { id: 'f8', name: 'Evidence Collection', phase: 'Phase 2', tested: true, verified: true },
  { id: 'f9', name: 'Budget Tracking', phase: 'Phase 3', tested: true, verified: false },
  { id: 'f10', name: 'Memory System', phase: 'Phase 3', tested: false, verified: false },
];

/**
 * Coverage page - test and feature coverage visualization
 */
export default function CoveragePage() {
  const [categories, setCategories] = useState<CoverageCategory[]>([]);
  const [features, setFeatures] = useState<FeatureCoverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');

  // Fetch coverage data on mount
  useEffect(() => {
    const fetchCoverage = async () => {
      try {
        setLoading(true);
        // In production, this would call the API
        // const data = await api.getCoverage();
        
        await new Promise((r) => setTimeout(r, 300));
        setCategories(MOCK_CATEGORIES);
        setFeatures(MOCK_FEATURES);
      } catch (err) {
        console.error('[Coverage] Failed to fetch coverage:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoverage();
  }, []);

  // Get unique phases
  const phases = Array.from(new Set(features.map((f) => f.phase)));

  // Filter features by phase
  const filteredFeatures = selectedPhase === 'all'
    ? features
    : features.filter((f) => f.phase === selectedPhase);

  // Calculate overall coverage
  const totalCovered = categories.reduce((sum, c) => sum + c.covered, 0);
  const totalItems = categories.reduce((sum, c) => sum + c.total, 0);
  const overallCoverage = totalItems > 0 ? Math.round((totalCovered / totalItems) * 100) : 0;

  // Calculate feature stats
  const testedCount = features.filter((f) => f.tested).length;
  const verifiedCount = features.filter((f) => f.verified).length;

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading coverage data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Coverage</h1>
        <Button variant="ghost">
          REFRESH
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <OverviewCard 
          label="Overall Coverage" 
          value={`${overallCoverage}%`}
          color={overallCoverage >= 80 ? 'green' : overallCoverage >= 60 ? 'orange' : 'red'}
        />
        <OverviewCard 
          label="Features Tested" 
          value={`${testedCount}/${features.length}`}
          color={testedCount === features.length ? 'green' : 'blue'}
        />
        <OverviewCard 
          label="Features Verified" 
          value={`${verifiedCount}/${features.length}`}
          color={verifiedCount === features.length ? 'green' : 'orange'}
        />
        <OverviewCard 
          label="Categories" 
          value={categories.length.toString()}
          color="blue"
        />
      </div>

      {/* Category Coverage */}
      <Panel title="Coverage by Category">
        <div className="space-y-md">
          {categories.map((category) => {
            const percentage = Math.round((category.covered / category.total) * 100);
            return (
              <div key={category.id} className="flex items-center gap-md">
                <div className="w-40 font-semibold">{category.name}</div>
                <div className="flex-1 h-6 bg-paper-lined overflow-hidden relative">
                  <div
                    className={`h-full transition-all ${
                      percentage >= 90
                        ? 'bg-neon-green'
                        : percentage >= 70
                        ? 'bg-safety-orange'
                        : 'bg-hot-magenta'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    {category.covered}/{category.total} ({percentage}%)
                  </div>
                </div>
                <StatusBadge status={category.status} size="sm" />
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Feature Coverage */}
      <Panel title="Feature Coverage">
        <div className="mb-md">
          <label className="text-sm mr-sm">Filter by Phase:</label>
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="p-sm border-medium border-ink-faded bg-paper-white focus:border-electric-blue outline-none"
            aria-label="Filter by phase"
          >
            <option value="all">All Phases</option>
            {phases.map((phase) => (
              <option key={phase} value={phase}>{phase}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b-medium border-ink-faded">
                <th className="pb-sm font-semibold">Feature</th>
                <th className="pb-sm font-semibold">Phase</th>
                <th className="pb-sm font-semibold text-center">Tested</th>
                <th className="pb-sm font-semibold text-center">Verified</th>
                <th className="pb-sm font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feature) => (
                <tr key={feature.id} className="border-b border-ink-faded/30">
                  <td className="py-sm font-semibold">{feature.name}</td>
                  <td className="py-sm text-ink-faded">{feature.phase}</td>
                  <td className="py-sm text-center">
                    {feature.tested ? (
                      <span className="text-neon-green">✓</span>
                    ) : (
                      <span className="text-hot-magenta">✗</span>
                    )}
                  </td>
                  <td className="py-sm text-center">
                    {feature.verified ? (
                      <span className="text-neon-green">✓</span>
                    ) : (
                      <span className="text-ink-faded">—</span>
                    )}
                  </td>
                  <td className="py-sm text-ink-faded text-xs">{feature.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Coverage Legend */}
      <Panel title="Legend">
        <div className="flex flex-wrap gap-lg text-sm">
          <div className="flex items-center gap-sm">
            <span className="w-4 h-4 bg-neon-green inline-block" />
            <span>90%+ Coverage</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="w-4 h-4 bg-safety-orange inline-block" />
            <span>70-89% Coverage</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="w-4 h-4 bg-hot-magenta inline-block" />
            <span>&lt;70% Coverage</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-neon-green">✓</span>
            <span>Complete</span>
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-hot-magenta">✗</span>
            <span>Not Complete</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface OverviewCardProps {
  label: string;
  value: string;
  color: 'green' | 'orange' | 'red' | 'blue';
}

function OverviewCard({ label, value, color }: OverviewCardProps) {
  const colorClass = {
    green: 'text-neon-green',
    orange: 'text-safety-orange',
    red: 'text-hot-magenta',
    blue: 'text-electric-blue',
  }[color];

  return (
    <div className="p-md border-medium border-ink-faded text-center">
      <div className={`text-2xl font-display ${colorClass} mb-xs`}>{value}</div>
      <div className="text-sm text-ink-faded">{label}</div>
    </div>
  );
}
