import { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/layout';
import { Button, Input, Select } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { api, type CursorCapabilities } from '@/lib';
import type { Platform } from '@/types';

/**
 * Config tab type
 */
type ConfigTab = 'tiers' | 'branching' | 'verification' | 'memory' | 'budgets' | 'advanced';

const TABS: { id: ConfigTab; label: string }[] = [
  { id: 'tiers', label: 'Tiers' },
  { id: 'branching', label: 'Branching' },
  { id: 'verification', label: 'Verification' },
  { id: 'memory', label: 'Memory' },
  { id: 'budgets', label: 'Budgets' },
  { id: 'advanced', label: 'Advanced' },
];

interface TierSettings {
  platform: Platform;
  model: string;
  planMode?: boolean;
  askMode?: boolean;
  outputFormat?: 'text' | 'json' | 'stream-json';
  selfFix: boolean;
  maxIterations: number;
}

interface Config {
  tiers: {
    phase: TierSettings;
    task: TierSettings;
    subtask: TierSettings;
    iteration: TierSettings;
  };
  branching: {
    baseBranch: string;
    namingPattern: string;
    granularity: 'single' | 'per-phase' | 'per-task';
  };
  verification: {
    browserAdapter: string;
    screenshotOnFailure: boolean;
    evidenceDirectory: string;
  };
  memory: {
    progressFile: string;
    agentsFile: string;
    prdFile: string;
    multiLevelAgents: boolean;
  };
  budgets: {
    claude: { maxCallsPerRun: number; maxCallsPerHour: number; maxCallsPerDay: number };
    codex: { maxCallsPerRun: number; maxCallsPerHour: number; maxCallsPerDay: number };
    cursor: { maxCallsPerRun: number; maxCallsPerHour: number; maxCallsPerDay: number; autoModeUnlimited?: boolean };
    gemini: { maxCallsPerRun: number; maxCallsPerHour: number; maxCallsPerDay: number };
    copilot: { maxCallsPerRun: number; maxCallsPerHour: number; maxCallsPerDay: number };
  };
  advanced: {
    logLevel: string;
    processTimeout: number;
    parallelIterations: number;
  };
}

const DEFAULT_CONFIG: Config = {
  tiers: {
    phase: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', selfFix: true, maxIterations: 3 },
    task: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', selfFix: true, maxIterations: 3 },
    subtask: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', selfFix: true, maxIterations: 3 },
    iteration: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', selfFix: false, maxIterations: 1 },
  },
  branching: {
    baseBranch: 'main',
    namingPattern: 'rwm/{tier}/{id}',
    granularity: 'per-task',
  },
  verification: {
    browserAdapter: 'playwright',
    screenshotOnFailure: true,
    evidenceDirectory: '.puppet-master/evidence',
  },
  memory: {
    progressFile: 'progress.txt',
    agentsFile: 'AGENTS.md',
    prdFile: 'prd.json',
    multiLevelAgents: true,
  },
  budgets: {
    claude: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
    codex: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
    cursor: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500, autoModeUnlimited: false },
    gemini: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
    copilot: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
  },
  advanced: {
    logLevel: 'info',
    processTimeout: 300000,
    parallelIterations: 1,
  },
};

/**
 * Config page - configuration tabs
 */
export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('tiers');
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [capabilities, setCapabilities] = useState<CursorCapabilities | null>(null);
  const [models, setModels] = useState<Record<Platform, Array<{ id: string; label: string }>>>({
    cursor: [],
    codex: [],
    claude: [],
    gemini: [],
    copilot: [],
  });

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const data = await api.getConfig();
        if (data) {
          setConfig(data as unknown as Config);
        }
      } catch (err) {
        console.error('[Config] Failed to fetch config:', err);
        setError(err instanceof Error ? err.message : 'Failed to load config');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // CU-P1-T09: Fetch Cursor capabilities on mount
  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const caps = await api.getCursorCapabilities();
        setCapabilities(caps);
      } catch (err) {
        console.error('[Config] Failed to fetch capabilities:', err);
        // Non-fatal, just don't show capabilities
      }
    };
    fetchCapabilities();
  }, []);

  // P1: Fetch models for all platforms on mount
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/config/models');
        if (response.ok) {
          const data = await response.json();
          setModels({
            cursor: Array.isArray(data.cursor) ? data.cursor : [],
            codex: Array.isArray(data.codex) ? data.codex : [],
            claude: Array.isArray(data.claude) ? data.claude : [],
            gemini: Array.isArray(data.gemini) ? data.gemini : [],
            copilot: Array.isArray(data.copilot) ? data.copilot : [],
          });
        }
      } catch (err) {
        console.error('[Config] Failed to fetch models:', err);
        // Non-fatal, will use empty arrays
      }
    };
    fetchModels();
  }, []);

  // Save config
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);
      await api.updateConfig(config as unknown as Record<string, unknown>);
      setIsDirty(false);
    } catch (err) {
      console.error('[Config] Failed to save config:', err);
      setError(err instanceof Error ? err.message : 'Failed to save config');
    } finally {
      setSaving(false);
    }
  }, [config]);

  // Update config (mark as dirty)
  const updateConfig = useCallback(<K extends keyof Config>(key: K, value: Config[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'tiers':
        return (
          <TiersTab
            config={config.tiers}
            onChange={(tiers) => updateConfig('tiers', tiers)}
          />
        );
      case 'branching':
        return (
          <BranchingTab
            config={config.branching}
            onChange={(branching) => updateConfig('branching', branching)}
          />
        );
      case 'verification':
        return (
          <VerificationTab
            config={config.verification}
            onChange={(verification) => updateConfig('verification', verification)}
          />
        );
      case 'memory':
        return (
          <MemoryTab
            config={config.memory}
            onChange={(memory) => updateConfig('memory', memory)}
          />
        );
      case 'budgets':
        return (
          <BudgetsTab
            config={config.budgets}
            onChange={(budgets) => updateConfig('budgets', budgets)}
          />
        );
      case 'advanced':
        return (
          <AdvancedTab
            config={config.advanced}
            onChange={(advanced) => updateConfig('advanced', advanced)}
            capabilities={capabilities}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Configuration</h1>
        <div className="flex gap-sm items-center">
          {isDirty && (
            <span className="text-sm text-safety-orange">Unsaved changes</span>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={!isDirty}
          >
            SAVE CHANGES
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Panel showInnerBorder={false}>
          <div className="text-hot-magenta">{error}</div>
        </Panel>
      )}

      {/* Tabs */}
      <div className="border-b-medium border-ink-black">
        <div className="flex gap-xs overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-lg py-sm font-bold text-sm uppercase tracking-wider
                border-b-[3px] transition-colors
                ${activeTab === tab.id
                  ? 'border-electric-blue text-electric-blue'
                  : 'border-transparent text-ink-faded hover:text-ink-black dark:hover:text-ink-light'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {renderTabContent()}
    </div>
  );
}

// ============================================
// Tab Components
// ============================================

interface TiersTabProps {
  config: Config['tiers'];
  onChange: (config: Config['tiers']) => void;
}

function TiersTab({ config, onChange }: TiersTabProps) {
  const updateTier = (tier: keyof Config['tiers'], updates: Partial<TierSettings>) => {
    onChange({
      ...config,
      [tier]: { ...config[tier], ...updates },
    });
  };

  return (
    <Panel title="Tier Configuration">
      <p className="text-ink-faded mb-lg">
        Configure platform and model settings for each execution tier.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {(['phase', 'task', 'subtask', 'iteration'] as const).map((tier) => (
          <div key={tier} className="p-md border-medium border-ink-faded">
            <h3 className="font-bold text-lg mb-md capitalize">{tier} Tier</h3>
            <div className="space-y-md">
              {/* P1: Platform dropdown */}
              <Select
                label="Platform"
                value={config[tier].platform}
                onChange={(e) => updateTier(tier, { platform: e.target.value as Platform })}
                options={[
                  { value: 'cursor', label: 'Cursor' },
                  { value: 'codex', label: 'Codex' },
                  { value: 'claude', label: 'Claude' },
                  { value: 'gemini', label: 'Gemini' },
                  { value: 'copilot', label: 'Copilot' },
                ]}
              />
              {/* P1: Model dropdown with platform-specific models */}
              <Select
                label="Model"
                value={config[tier].model}
                onChange={(e) => updateTier(tier, { model: e.target.value })}
                options={[
                  { value: 'auto', label: 'Auto (default)' },
                  ...models[config[tier].platform].map(m => ({ value: m.id, label: m.label || m.id })),
                ]}
                placeholder="Select model"
              />
              {/* P1: Plan Mode toggle */}
              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  id={`${tier}-planMode`}
                  checked={config[tier].planMode || false}
                  onChange={(e) => updateTier(tier, { planMode: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor={`${tier}-planMode`}>Enable plan mode</label>
              </div>
              {/* P1: Ask Mode toggle */}
              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  id={`${tier}-askMode`}
                  checked={config[tier].askMode || false}
                  onChange={(e) => updateTier(tier, { askMode: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor={`${tier}-askMode`}>Enable ask mode (read-only)</label>
              </div>
              {/* P1: Output Format dropdown */}
              <Select
                label="Output Format"
                value={config[tier].outputFormat || 'text'}
                onChange={(e) => updateTier(tier, { outputFormat: e.target.value as 'text' | 'json' | 'stream-json' })}
                options={[
                  { value: 'text', label: 'Text' },
                  { value: 'json', label: 'JSON' },
                  { value: 'stream-json', label: 'Stream JSON' },
                ]}
              />
              <Input
                label="Max Iterations"
                type="number"
                value={config[tier].maxIterations.toString()}
                onChange={(e) => updateTier(tier, { maxIterations: parseInt(e.target.value) || 1 })}
              />
              <div className="flex items-center gap-sm">
                <input
                  type="checkbox"
                  id={`${tier}-selfFix`}
                  checked={config[tier].selfFix}
                  onChange={(e) => updateTier(tier, { selfFix: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor={`${tier}-selfFix`}>Enable self-fix</label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

interface BranchingTabProps {
  config: Config['branching'];
  onChange: (config: Config['branching']) => void;
}

function BranchingTab({ config, onChange }: BranchingTabProps) {
  return (
    <Panel title="Branching Configuration">
      <p className="text-ink-faded mb-lg">
        Configure Git branch creation and naming conventions.
      </p>
      
      <div className="space-y-lg max-w-xl">
        <Input
          label="Base Branch"
          value={config.baseBranch}
          onChange={(e) => onChange({ ...config, baseBranch: e.target.value })}
          hint="The branch to create feature branches from"
        />
        
        <Input
          label="Naming Pattern"
          value={config.namingPattern}
          onChange={(e) => onChange({ ...config, namingPattern: e.target.value })}
          hint="Pattern for branch names. Variables: {tier}, {id}, {phase}, {task}"
        />
        
        <div>
          <label className="block font-bold mb-sm">Branch Granularity</label>
          <div className="space-y-sm">
            {[
              { value: 'single', label: 'Single Branch', desc: 'One branch for all work' },
              { value: 'per-phase', label: 'Per Phase', desc: 'New branch for each phase' },
              { value: 'per-task', label: 'Per Task', desc: 'New branch for each task' },
            ].map((option) => (
              <label key={option.value} className="flex items-start gap-sm cursor-pointer">
                <input
                  type="radio"
                  name="granularity"
                  value={option.value}
                  checked={config.granularity === option.value}
                  onChange={() => onChange({ ...config, granularity: option.value as Config['branching']['granularity'] })}
                  className="mt-1"
                />
                <div>
                  <span className="font-semibold">{option.label}</span>
                  <p className="text-sm text-ink-faded">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

interface VerificationTabProps {
  config: Config['verification'];
  onChange: (config: Config['verification']) => void;
}

function VerificationTab({ config, onChange }: VerificationTabProps) {
  return (
    <Panel title="Verification Configuration">
      <p className="text-ink-faded mb-lg">
        Configure verification gates and evidence collection.
      </p>
      
      <div className="space-y-lg max-w-xl">
        <Input
          label="Browser Adapter"
          value={config.browserAdapter}
          onChange={(e) => onChange({ ...config, browserAdapter: e.target.value })}
          hint="playwright | puppeteer | selenium"
        />
        
        <Input
          label="Evidence Directory"
          value={config.evidenceDirectory}
          onChange={(e) => onChange({ ...config, evidenceDirectory: e.target.value })}
          hint="Path for storing evidence files"
        />
        
        <div className="flex items-center gap-sm">
          <input
            type="checkbox"
            id="screenshotOnFailure"
            checked={config.screenshotOnFailure}
            onChange={(e) => onChange({ ...config, screenshotOnFailure: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="screenshotOnFailure">Capture screenshots on verification failure</label>
        </div>
      </div>
    </Panel>
  );
}

interface MemoryTabProps {
  config: Config['memory'];
  onChange: (config: Config['memory']) => void;
}

function MemoryTab({ config, onChange }: MemoryTabProps) {
  return (
    <Panel title="Memory Configuration">
      <p className="text-ink-faded mb-lg">
        Configure memory file locations and behavior.
      </p>
      
      <div className="space-y-lg max-w-xl">
        <Input
          label="Progress File"
          value={config.progressFile}
          onChange={(e) => onChange({ ...config, progressFile: e.target.value })}
          hint="Short-term memory file (progress.txt)"
        />
        
        <Input
          label="Agents File"
          value={config.agentsFile}
          onChange={(e) => onChange({ ...config, agentsFile: e.target.value })}
          hint="Long-term memory file (AGENTS.md)"
        />
        
        <Input
          label="PRD File"
          value={config.prdFile}
          onChange={(e) => onChange({ ...config, prdFile: e.target.value })}
          hint="Work queue file (prd.json)"
        />
        
        <div className="flex items-center gap-sm">
          <input
            type="checkbox"
            id="multiLevelAgents"
            checked={config.multiLevelAgents}
            onChange={(e) => onChange({ ...config, multiLevelAgents: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="multiLevelAgents">Enable multi-level AGENTS.md files</label>
        </div>
      </div>
    </Panel>
  );
}

interface BudgetsTabProps {
  config: Config['budgets'];
  onChange: (config: Config['budgets']) => void;
}

function BudgetsTab({ config, onChange }: BudgetsTabProps) {
  const updateBudget = (platform: keyof Config['budgets'], field: string, value: number | boolean) => {
    onChange({
      ...config,
      [platform]: { ...config[platform], [field]: value },
    });
  };

  return (
    <Panel title="Budget Configuration">
      <p className="text-ink-faded mb-lg">
        Configure API call limits for each platform.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {(['claude', 'codex', 'cursor', 'gemini', 'copilot'] as const).map((platform) => (
          <div key={platform} className="p-md border-medium border-ink-faded">
            <h3 className="font-bold text-lg mb-md capitalize">{platform}</h3>
            <div className="space-y-md">
              <Input
                label="Max Calls Per Run"
                type="number"
                value={config[platform].maxCallsPerRun.toString()}
                onChange={(e) => updateBudget(platform, 'maxCallsPerRun', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Max Calls Per Hour"
                type="number"
                value={config[platform].maxCallsPerHour.toString()}
                onChange={(e) => updateBudget(platform, 'maxCallsPerHour', parseInt(e.target.value) || 0)}
              />
              <Input
                label="Max Calls Per Day"
                type="number"
                value={config[platform].maxCallsPerDay.toString()}
                onChange={(e) => updateBudget(platform, 'maxCallsPerDay', parseInt(e.target.value) || 0)}
              />
              {/* P1: Cursor Auto Mode Unlimited toggle */}
              {platform === 'cursor' && (
                <div className="flex items-center gap-sm mt-md pt-md border-t border-ink-faded/20">
                  <input
                    type="checkbox"
                    id={`${platform}-autoModeUnlimited`}
                    checked={config[platform].autoModeUnlimited || false}
                    onChange={(e) => updateBudget(platform, 'autoModeUnlimited', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`${platform}-autoModeUnlimited`} className="text-sm">
                    Unlimited Auto Mode (grandfathered plan)
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

interface AdvancedTabProps {
  config: Config['advanced'];
  onChange: (config: Config['advanced']) => void;
  capabilities: CursorCapabilities | null;
}

function AdvancedTab({ config, onChange, capabilities }: AdvancedTabProps) {
  // Use defaults if config is undefined (e.g., from API response missing the field)
  const safeConfig = config || DEFAULT_CONFIG.advanced;

  return (
    <Panel title="Advanced Configuration">
      <p className="text-ink-faded mb-lg">
        Advanced settings for power users.
      </p>

      {/* CU-P1-T09: Cursor Capabilities Display — optional chaining for partial API responses */}
      {capabilities && (
        <div className="mb-lg p-md border-medium border-ink-faded bg-paper-lined/30">
          <h3 className="font-bold text-lg mb-md">Cursor CLI Capabilities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md text-sm">
            <div>
              <span className="font-semibold">Binary: </span>
              <span className="font-mono">{capabilities.binary?.selected ?? 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">Auth: </span>
              {capabilities.auth?.hasApiKey ? (
                <StatusBadge status="complete" size="sm" showLabel label="Authenticated" />
              ) : (
                <StatusBadge status="pending" size="sm" showLabel label="Not Authenticated" />
              )}
            </div>
            <div>
              <span className="font-semibold">Modes: </span>
              <span>{Array.isArray(capabilities.modes) ? capabilities.modes.join(', ') : 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">Output Formats: </span>
              <span>{Array.isArray(capabilities.outputFormats) ? capabilities.outputFormats.join(', ') : 'N/A'}</span>
            </div>
            <div>
              <span className="font-semibold">Models: </span>
              <span>
                {capabilities?.models != null
                  ? `${capabilities.models.count ?? 0} (${capabilities.models.source ?? 'N/A'})`
                  : 'N/A'}
                {Array.isArray(capabilities?.models?.sample) && capabilities.models.sample.length > 0 && (
                  <span className="text-ink-faded ml-xs">
                    - {capabilities.models.sample.map((m: { id?: string }) => m?.id || '').filter(Boolean).join(', ')}
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="font-semibold">MCP: </span>
              {capabilities?.mcp?.available ? (
                <span>{capabilities.mcp.serverCount} server(s){Array.isArray(capabilities.mcp.servers) && capabilities.mcp.servers.length > 0 ? ` (${capabilities.mcp.servers.join(', ')})` : ''}</span>
              ) : (
                <span className="text-ink-faded">Not available</span>
              )}
            </div>
            {capabilities?.config?.found && (
              <div className="md:col-span-2">
                <span className="font-semibold">Config: </span>
                <span className="font-mono text-xs">{capabilities.config.path}</span>
                {capabilities.config.hasPermissions && (
                  <span className="ml-xs text-ink-faded">(has permissions)</span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-lg max-w-xl">
        <div className="p-md bg-safety-orange/10 border-medium border-safety-orange">
          <strong>⚠️ Caution</strong>
          <p className="text-sm mt-xs">
            These settings can significantly affect orchestrator behavior.
            Only modify if you understand the implications.
          </p>
        </div>

        <Input
          label="Log Level"
          value={safeConfig.logLevel}
          onChange={(e) => onChange({ ...safeConfig, logLevel: e.target.value })}
          hint="debug | info | warn | error"
        />

        <Input
          label="Process Timeout (ms)"
          type="number"
          value={safeConfig.processTimeout.toString()}
          onChange={(e) => onChange({ ...safeConfig, processTimeout: parseInt(e.target.value) || 300000 })}
          hint="Maximum time for a single iteration"
        />

        <Input
          label="Parallel Iterations"
          type="number"
          value={safeConfig.parallelIterations.toString()}
          onChange={(e) => onChange({ ...safeConfig, parallelIterations: parseInt(e.target.value) || 1 })}
          hint="Number of concurrent iterations (experimental)"
        />
      </div>
    </Panel>
  );
}
