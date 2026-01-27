import { useState, useEffect, useCallback } from 'react';
import { Panel } from '@/components/layout';
import { Button, Input, Select, HelpText, Checkbox, Radio } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { WarningIcon, RefreshIcon } from '@/components/icons';
import { api, type CursorCapabilities } from '@/lib';
import { helpContent } from '@/lib/help-content.js';
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
  reasoningEffort?: 'Low' | 'Medium' | 'High' | 'Extra high';
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
  cliPaths?: {
    cursor: string;
    codex: string;
    claude: string;
    gemini: string;
    copilot: string;
  };
  rateLimits?: {
    cursor: { callsPerMinute: number; cooldownMs: number };
    codex: { callsPerMinute: number; cooldownMs: number };
    claude: { callsPerMinute: number; cooldownMs: number };
    gemini: { callsPerMinute: number; cooldownMs: number };
    copilot: { callsPerMinute: number; cooldownMs: number };
  };
  execution?: {
    killAgentOnFailure?: boolean;
    parallel?: {
      enabled: boolean;
      maxConcurrency: number;
      worktreeDir?: string;
      continueOnFailure?: boolean;
      mergeResults?: boolean;
      targetBranch?: string;
    };
  };
  checkpointing?: {
    enabled: boolean;
    interval: number;
    maxCheckpoints: number;
    checkpointOnSubtaskComplete: boolean;
    checkpointOnShutdown: boolean;
  };
  loopGuard?: {
    enabled: boolean;
    maxRepetitions: number;
    suppressReplyRelay: boolean;
  };
  escalation?: {
    chains?: {
      testFailure?: Array<{ action: string; maxAttempts?: number; to?: string; notify?: boolean }>;
      acceptance?: Array<{ action: string; maxAttempts?: number; to?: string; notify?: boolean }>;
      timeout?: Array<{ action: string; maxAttempts?: number; to?: string; notify?: boolean }>;
      structural?: Array<{ action: string; maxAttempts?: number; to?: string; notify?: boolean }>;
      error?: Array<{ action: string; maxAttempts?: number; to?: string; notify?: boolean }>;
    };
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
  const [models, setModels] = useState<Record<Platform, Array<{ id: string; label: string; reasoningLevels?: string[] }>>>({
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
          // Ensure we have valid arrays for each platform
          // Note: "auto" is ONLY for Cursor - it's added in the dropdown options, not in the models state
          const ensureArray = (platformModels: unknown): Array<{ id: string; label: string; reasoningLevels?: string[] }> => {
            if (!Array.isArray(platformModels)) return [];
            return platformModels.filter(m => m && typeof m === 'object' && typeof m.id === 'string');
          };
          
          setModels({
            cursor: ensureArray(data.cursor),
            codex: ensureArray(data.codex),
            claude: ensureArray(data.claude),
            gemini: ensureArray(data.gemini),
            copilot: ensureArray(data.copilot),
          });
        } else {
          console.warn('[Config] Model API returned error, using empty lists');
          setModels({
            cursor: [],
            codex: [],
            claude: [],
            gemini: [],
            copilot: [],
          });
        }
      } catch (err) {
        console.error('[Config] Failed to fetch models:', err);
        // Non-fatal, use empty lists
        setModels({
          cursor: [],
          codex: [],
          claude: [],
          gemini: [],
          copilot: [],
        });
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
            models={models}
            onRefreshModels={async () => {
              try {
                const response = await fetch('/api/config/models?refresh=true');
                if (response.ok) {
                  const data = await response.json();
                  const ensureModels = (platformModels: Array<{ id: string; label: string }> | undefined) => {
                    if (!Array.isArray(platformModels) || platformModels.length === 0) {
                      return [{ id: 'auto', label: 'Auto (recommended)' }];
                    }
                    const hasAuto = platformModels.some(m => m.id === 'auto');
                    if (!hasAuto) {
                      return [{ id: 'auto', label: 'Auto (recommended)' }, ...platformModels];
                    }
                    return platformModels;
                  };
                  setModels({
                    cursor: ensureModels(data.cursor),
                    codex: ensureModels(data.codex),
                    claude: ensureModels(data.claude),
                    gemini: ensureModels(data.gemini),
                    copilot: ensureModels(data.copilot),
                  });
                }
              } catch (err) {
                console.error('[Config] Failed to refresh models:', err);
              }
            }}
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
            cliPaths={config.cliPaths}
            rateLimits={config.rateLimits}
            execution={config.execution}
            checkpointing={config.checkpointing}
            loopGuard={config.loopGuard}
            escalation={config.escalation}
            onChange={(advanced) => updateConfig('advanced', advanced)}
            onCliPathsChange={(cliPaths) => updateConfig('cliPaths' as any, cliPaths)}
            onRateLimitsChange={(rateLimits) => updateConfig('rateLimits' as any, rateLimits)}
            onExecutionChange={(execution) => updateConfig('execution' as any, execution)}
            onCheckpointingChange={(checkpointing) => updateConfig('checkpointing' as any, checkpointing)}
            onLoopGuardChange={(loopGuard) => updateConfig('loopGuard' as any, loopGuard)}
            onEscalationChange={(escalation) => updateConfig('escalation' as any, escalation)}
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
      <div className="flex flex-wrap items-center justify-between gap-md min-w-0">
        <h1 className="font-display text-2xl break-words min-w-0">Configuration</h1>
        <div className="flex gap-sm items-center flex-wrap min-w-0">
          <Button
            variant="ghost"
            leftIcon={<RefreshIcon />}
            onClick={async () => {
              try {
                const response = await fetch('/api/config/models?refresh=true');
                if (response.ok) {
                  const data = await response.json();
                  // Ensure we have valid arrays for each platform
                  // Note: "auto" is ONLY for Cursor - it's added in the dropdown options, not here
                  const ensureArray = (platformModels: unknown): Array<{ id: string; label: string; reasoningLevels?: string[] }> => {
                    if (!Array.isArray(platformModels)) return [];
                    return platformModels.filter(m => m && typeof m === 'object' && typeof m.id === 'string');
                  };
                  setModels({
                    cursor: ensureArray(data.cursor),
                    codex: ensureArray(data.codex),
                    claude: ensureArray(data.claude),
                    gemini: ensureArray(data.gemini),
                    copilot: ensureArray(data.copilot),
                  });
                }
              } catch (err) {
                console.error('[Config] Failed to refresh models:', err);
              }
            }}
            title="Refresh model lists from platform discovery"
          >
            REFRESH MODELS
          </Button>
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
  models: Record<Platform, Array<{ id: string; label: string; reasoningLevels?: string[] }>>;
  onRefreshModels?: () => Promise<void>;
}

function TiersTab({ config, onChange, models, onRefreshModels }: TiersTabProps) {
  const updateTier = (tier: keyof Config['tiers'], updates: Partial<TierSettings>) => {
    onChange({
      ...config,
      [tier]: { ...config[tier], ...updates },
    });
  };

  // Get reasoning levels for the selected model (Codex only)
  const getReasoningLevels = (platform: Platform, modelId: string): string[] | undefined => {
    if (platform !== 'codex') return undefined;
    const platformModels = models[platform] || [];
    const model = platformModels.find(m => m.id === modelId);
    return model?.reasoningLevels;
  };

  return (
    <Panel title="Tier Configuration">
      <p className="text-ink-faded mb-lg">
        Configure platform and model settings for each execution tier.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {(['phase', 'task', 'subtask', 'iteration'] as const).map((tier) => {
          const currentPlatform = config[tier].platform;
          const currentModel = config[tier].model;
          const reasoningLevels = getReasoningLevels(currentPlatform, currentModel);
          
          // Build model options - only Cursor gets "auto" option
          const modelOptions = currentPlatform === 'cursor'
            ? [
                { value: 'auto', label: 'Auto (default)' },
                ...(models[currentPlatform] || []).map(m => ({ value: m.id, label: m.label || m.id })),
              ]
            : (models[currentPlatform] || []).map(m => ({ value: m.id, label: m.label || m.id }));
          
          return (
            <div key={tier} className="p-md border-medium border-ink-faded min-w-0 break-words">
              <h3 className="font-bold text-lg mb-md capitalize break-words">{tier} Tier</h3>
              <div className="space-y-md min-w-0">
                {/* P1: Platform dropdown */}
                <div>
                  <Select
                    label="Platform"
                    value={currentPlatform}
                    onChange={(e) => {
                      const newPlatform = e.target.value as Platform;
                      // When platform changes, reset model to first available or auto for Cursor
                      const newModel = newPlatform === 'cursor' 
                        ? 'auto' 
                        : (models[newPlatform]?.[0]?.id || '');
                      updateTier(tier, { 
                        platform: newPlatform, 
                        model: newModel,
                        reasoningEffort: undefined, // Reset reasoning effort when platform changes
                      });
                    }}
                    options={[
                      { value: 'cursor', label: 'Cursor' },
                      { value: 'codex', label: 'Codex' },
                      { value: 'claude', label: 'Claude' },
                      { value: 'gemini', label: 'Gemini' },
                      { value: 'copilot', label: 'Copilot' },
                    ]}
                  />
                  <HelpText {...helpContent.tiers.platform} />
                </div>
                {/* P1: Model dropdown with platform-specific models */}
                <div>
                  <Select
                    label="Model"
                    value={currentModel}
                    onChange={(e) => {
                      const newModel = e.target.value;
                      // Reset reasoning effort when model changes
                      updateTier(tier, { model: newModel, reasoningEffort: undefined });
                    }}
                    options={modelOptions}
                    placeholder="Select model"
                  />
                  <HelpText {...helpContent.tiers.model} />
                </div>
                {/* Codex-only: Reasoning Effort dropdown */}
                {currentPlatform === 'codex' && reasoningLevels && reasoningLevels.length > 0 && (
                  <Select
                    label="Reasoning Effort"
                    value={config[tier].reasoningEffort || ''}
                    onChange={(e) => updateTier(tier, { 
                      reasoningEffort: e.target.value as TierSettings['reasoningEffort'] || undefined 
                    })}
                    options={[
                      { value: '', label: 'Default' },
                      ...reasoningLevels.map(level => ({ value: level, label: level })),
                    ]}
                  />
                )}
                {/* P1: Plan Mode toggle */}
                <div className="space-y-xs">
                  <Checkbox
                    id={`${tier}-planMode`}
                    checked={config[tier].planMode || false}
                    onChange={(checked) => updateTier(tier, { planMode: checked })}
                    label="Enable plan mode"
                  />
                  <HelpText {...helpContent.tiers.planMode} />
                </div>
                {/* P1: Ask Mode toggle */}
                <div className="space-y-xs">
                  <Checkbox
                    id={`${tier}-askMode`}
                    checked={config[tier].askMode || false}
                    onChange={(checked) => updateTier(tier, { askMode: checked })}
                    label="Enable ask mode (read-only)"
                  />
                  <HelpText {...helpContent.tiers.askMode} />
                </div>
                {/* P1: Output Format dropdown */}
                <div>
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
                  <HelpText {...helpContent.tiers.outputFormat} />
                </div>
                <div>
                  <Input
                    label="Max Iterations"
                    type="number"
                    value={config[tier].maxIterations.toString()}
                    onChange={(e) => updateTier(tier, { maxIterations: parseInt(e.target.value) || 1 })}
                  />
                  <HelpText {...helpContent.tiers.maxIterations} />
                </div>
                <div className="space-y-xs">
                  <Checkbox
                    id={`${tier}-selfFix`}
                    checked={config[tier].selfFix}
                    onChange={(checked) => updateTier(tier, { selfFix: checked })}
                    label="Enable self-fix"
                  />
                  <HelpText {...helpContent.tiers.selfFix} />
                </div>
              </div>
            </div>
          );
        })}
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
        <div>
          <Input
            label="Base Branch"
            value={config.baseBranch}
            onChange={(e) => onChange({ ...config, baseBranch: e.target.value })}
          />
          <HelpText {...helpContent.branching.baseBranch} />
        </div>
        
        <div>
          <Input
            label="Naming Pattern"
            value={config.namingPattern}
            onChange={(e) => onChange({ ...config, namingPattern: e.target.value })}
          />
          <HelpText {...helpContent.branching.namingPattern} />
        </div>
        
        <div>
          <label className="block font-bold mb-sm">Branch Granularity</label>
          <div className="space-y-sm">
            {[
              { value: 'single', label: 'Single Branch', desc: 'One branch for all work' },
              { value: 'per-phase', label: 'Per Phase', desc: 'New branch for each phase' },
              { value: 'per-task', label: 'Per Task', desc: 'New branch for each task' },
            ].map((option) => (
              <Radio
                key={option.value}
                name="granularity"
                value={option.value}
                checked={config.granularity === option.value}
                onChange={(value) => onChange({ ...config, granularity: value as Config['branching']['granularity'] })}
                label={option.label}
                description={option.desc}
              />
            ))}
          </div>
          <div className="mt-sm">
            <HelpText {...helpContent.branching.granularity} />
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
        <div>
          <Input
            label="Browser Adapter"
            value={config.browserAdapter}
            onChange={(e) => onChange({ ...config, browserAdapter: e.target.value })}
          />
          <HelpText {...helpContent.verification.browserAdapter} />
        </div>
        
        <div>
          <Input
            label="Evidence Directory"
            value={config.evidenceDirectory}
            onChange={(e) => onChange({ ...config, evidenceDirectory: e.target.value })}
          />
          <HelpText {...helpContent.verification.evidenceDirectory} />
        </div>
        
        <div className="space-y-xs">
          <Checkbox
            id="screenshotOnFailure"
            checked={config.screenshotOnFailure}
            onChange={(checked) => onChange({ ...config, screenshotOnFailure: checked })}
            label="Capture screenshots on verification failure"
          />
          <HelpText {...helpContent.verification.screenshotOnFailure} />
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
        <div>
          <Input
            label="Progress File"
            value={config.progressFile}
            onChange={(e) => onChange({ ...config, progressFile: e.target.value })}
          />
          <HelpText {...helpContent.memory.progressFile} />
        </div>
        
        <div>
          <Input
            label="Agents File"
            value={config.agentsFile}
            onChange={(e) => onChange({ ...config, agentsFile: e.target.value })}
          />
          <HelpText {...helpContent.memory.agentsFile} />
        </div>
        
        <div>
          <Input
            label="PRD File"
            value={config.prdFile}
            onChange={(e) => onChange({ ...config, prdFile: e.target.value })}
          />
          <HelpText {...helpContent.memory.prdFile} />
        </div>
        
        <div className="space-y-xs">
          <Checkbox
            id="multiLevelAgents"
            checked={config.multiLevelAgents}
            onChange={(checked) => onChange({ ...config, multiLevelAgents: checked })}
            label="Enable multi-level AGENTS.md files"
          />
          <HelpText {...helpContent.memory.multiLevelAgents} />
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
              <div>
                <Input
                  label="Max Calls Per Run"
                  type="number"
                  value={config[platform].maxCallsPerRun.toString()}
                  onChange={(e) => updateBudget(platform, 'maxCallsPerRun', parseInt(e.target.value) || 0)}
                />
                <HelpText {...helpContent.budgets.maxCallsPerRun} />
              </div>
              <div>
                <Input
                  label="Max Calls Per Hour"
                  type="number"
                  value={config[platform].maxCallsPerHour.toString()}
                  onChange={(e) => updateBudget(platform, 'maxCallsPerHour', parseInt(e.target.value) || 0)}
                />
                <HelpText {...helpContent.budgets.maxCallsPerHour} />
              </div>
              <div>
                <Input
                  label="Max Calls Per Day"
                  type="number"
                  value={config[platform].maxCallsPerDay.toString()}
                  onChange={(e) => updateBudget(platform, 'maxCallsPerDay', parseInt(e.target.value) || 0)}
                />
                <HelpText {...helpContent.budgets.maxCallsPerDay} />
              </div>
              {/* P1: Cursor Auto Mode Unlimited toggle */}
              {platform === 'cursor' && (
                <div className="mt-md pt-md border-t border-ink-faded/20 space-y-xs">
                  <Checkbox
                    id={`${platform}-autoModeUnlimited`}
                    checked={config[platform].autoModeUnlimited || false}
                    onChange={(checked) => updateBudget(platform, 'autoModeUnlimited', checked)}
                    label="Unlimited Auto Mode (grandfathered plan)"
                  />
                  <HelpText {...helpContent.budgets.autoModeUnlimited} />
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
  cliPaths?: Config['cliPaths'];
  rateLimits?: Config['rateLimits'];
  execution?: Config['execution'];
  checkpointing?: Config['checkpointing'];
  loopGuard?: Config['loopGuard'];
  escalation?: Config['escalation'];
  onChange: (config: Config['advanced']) => void;
  onCliPathsChange: (cliPaths: Config['cliPaths']) => void;
  onRateLimitsChange: (rateLimits: Config['rateLimits']) => void;
  onExecutionChange: (execution: Config['execution']) => void;
  onCheckpointingChange: (checkpointing: Config['checkpointing']) => void;
  onLoopGuardChange: (loopGuard: Config['loopGuard']) => void;
  onEscalationChange: (escalation: Config['escalation']) => void;
  capabilities: CursorCapabilities | null;
}

function AdvancedTab({ 
  config, 
  cliPaths,
  rateLimits,
  execution,
  checkpointing,
  loopGuard,
  escalation,
  onChange, 
  onCliPathsChange,
  onRateLimitsChange,
  onExecutionChange,
  onCheckpointingChange,
  onLoopGuardChange,
  onEscalationChange,
  capabilities 
}: AdvancedTabProps) {
  // Use defaults if config is undefined (e.g., from API response missing the field)
  const safeConfig = config || DEFAULT_CONFIG.advanced;
  const safeCliPaths = cliPaths || { cursor: 'cursor-agent', codex: 'codex', claude: 'claude', gemini: 'gemini', copilot: 'copilot' };
  const safeRateLimits = rateLimits || {
    cursor: { callsPerMinute: 60, cooldownMs: 1000 },
    codex: { callsPerMinute: 60, cooldownMs: 1000 },
    claude: { callsPerMinute: 60, cooldownMs: 1000 },
    gemini: { callsPerMinute: 60, cooldownMs: 1000 },
    copilot: { callsPerMinute: 60, cooldownMs: 1000 },
  };
  const safeExecution = execution || { killAgentOnFailure: true, parallel: { enabled: false, maxConcurrency: 3 } };
  const safeCheckpointing = checkpointing || { enabled: true, interval: 10, maxCheckpoints: 10, checkpointOnSubtaskComplete: true, checkpointOnShutdown: true };
  const safeLoopGuard = loopGuard || { enabled: true, maxRepetitions: 3, suppressReplyRelay: true };
  const safeEscalation = escalation || { chains: {} };

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
          <strong className="flex items-center gap-xs">
            <WarningIcon size="1em" />
            Caution
          </strong>
          <p className="text-sm mt-xs">
            These settings can significantly affect orchestrator behavior.
            Only modify if you understand the implications.
          </p>
        </div>

        <div>
          <Input
            label="Log Level"
            value={safeConfig.logLevel}
            onChange={(e) => onChange({ ...safeConfig, logLevel: e.target.value })}
          />
          <HelpText {...helpContent.advanced.logLevel} />
        </div>

        <div>
          <Input
            label="Process Timeout (ms)"
            type="number"
            value={safeConfig.processTimeout.toString()}
            onChange={(e) => onChange({ ...safeConfig, processTimeout: parseInt(e.target.value) || 300000 })}
          />
          <HelpText {...helpContent.advanced.processTimeout} />
        </div>

        <div>
          <Input
            label="Parallel Iterations"
            type="number"
            value={safeConfig.parallelIterations.toString()}
            onChange={(e) => onChange({ ...safeConfig, parallelIterations: parseInt(e.target.value) || 1 })}
          />
          <HelpText {...helpContent.advanced.parallelIterations} />
        </div>
      </div>

      {/* Task 4.4: CLI Paths Section */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">CLI Paths</h3>
          <HelpText {...helpContent.advanced.cliPaths} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {(['cursor', 'codex', 'claude', 'gemini', 'copilot'] as const).map((platform) => (
            <Input
              key={platform}
              label={platform.charAt(0).toUpperCase() + platform.slice(1)}
              value={safeCliPaths[platform]}
              onChange={(e) => onCliPathsChange({ ...safeCliPaths, [platform]: e.target.value })}
            />
          ))}
        </div>
      </div>

      {/* Task 4.4: Rate Limits Section */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">Rate Limits</h3>
          <HelpText {...helpContent.advanced.rateLimits} />
        </div>
        {(['cursor', 'codex', 'claude', 'gemini', 'copilot'] as const).map((platform) => (
          <div key={platform} className="p-md border-medium border-ink-faded rounded">
            <h4 className="font-semibold mb-sm capitalize">{platform}</h4>
            <div className="grid grid-cols-2 gap-md">
              <Input
                label="Calls Per Minute"
                type="number"
                value={safeRateLimits[platform].callsPerMinute.toString()}
                onChange={(e) => onRateLimitsChange({
                  ...safeRateLimits,
                  [platform]: { ...safeRateLimits[platform], callsPerMinute: parseInt(e.target.value) || 60 }
                })}
              />
              <Input
                label="Cooldown (ms)"
                type="number"
                value={safeRateLimits[platform].cooldownMs.toString()}
                onChange={(e) => onRateLimitsChange({
                  ...safeRateLimits,
                  [platform]: { ...safeRateLimits[platform], cooldownMs: parseInt(e.target.value) || 1000 }
                })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Task 4.4: Execution Strategy Section */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">Execution Strategy</h3>
          <HelpText {...helpContent.advanced.executionStrategy} />
        </div>
        <div className="space-y-md">
          <Checkbox
            id="killAgentOnFailure"
            checked={safeExecution.killAgentOnFailure ?? true}
            onChange={(checked) => onExecutionChange({ ...safeExecution, killAgentOnFailure: checked })}
            label="Kill agent on failure (default: true)"
          />
          <div className="p-md border-medium border-ink-faded rounded">
            <h4 className="font-semibold mb-sm">Parallel Execution</h4>
            <div className="space-y-md">
              <Checkbox
                id="parallelEnabled"
                checked={safeExecution.parallel?.enabled ?? false}
                onChange={(checked) => onExecutionChange({
                  ...safeExecution,
                  parallel: { ...safeExecution.parallel, enabled: checked, maxConcurrency: safeExecution.parallel?.maxConcurrency ?? 3 }
                })}
                label="Enable parallel execution"
              />
              {safeExecution.parallel?.enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md ml-lg">
                  <Input
                    label="Max Concurrency"
                    type="number"
                    value={(safeExecution.parallel?.maxConcurrency ?? 3).toString()}
                    onChange={(e) => onExecutionChange({
                      ...safeExecution,
                      parallel: { ...safeExecution.parallel!, maxConcurrency: parseInt(e.target.value) || 3 }
                    })}
                  />
                  <Input
                    label="Worktree Directory"
                    value={safeExecution.parallel?.worktreeDir || '.puppet-master/worktrees'}
                    onChange={(e) => onExecutionChange({
                      ...safeExecution,
                      parallel: { ...safeExecution.parallel!, worktreeDir: e.target.value }
                    })}
                  />
                  <Checkbox
                    id="continueOnFailure"
                    checked={safeExecution.parallel?.continueOnFailure ?? false}
                    onChange={(checked) => onExecutionChange({
                      ...safeExecution,
                      parallel: { ...safeExecution.parallel!, continueOnFailure: checked }
                    })}
                    label="Continue on failure"
                  />
                  <Checkbox
                    id="mergeResults"
                    checked={safeExecution.parallel?.mergeResults ?? true}
                    onChange={(checked) => onExecutionChange({
                      ...safeExecution,
                      parallel: { ...safeExecution.parallel!, mergeResults: checked }
                    })}
                    label="Merge results"
                  />
                  <Input
                    label="Target Branch"
                    value={safeExecution.parallel?.targetBranch || ''}
                    onChange={(e) => onExecutionChange({
                      ...safeExecution,
                      parallel: { ...safeExecution.parallel!, targetBranch: e.target.value }
                    })}
                    hint="Optional: branch to merge into"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task 4.4: Checkpointing Section */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">Checkpointing</h3>
          <HelpText {...helpContent.advanced.checkpointing} />
        </div>
        <div className="space-y-md">
          <Checkbox
            id="checkpointingEnabled"
            checked={safeCheckpointing.enabled}
            onChange={(checked) => onCheckpointingChange({ ...safeCheckpointing, enabled: checked })}
            label="Enable checkpointing"
          />
          {safeCheckpointing.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md ml-lg">
              <Input
                label="Interval (iterations)"
                type="number"
                value={safeCheckpointing.interval.toString()}
                onChange={(e) => onCheckpointingChange({ ...safeCheckpointing, interval: parseInt(e.target.value) || 10 })}
              />
              <Input
                label="Max Checkpoints"
                type="number"
                value={safeCheckpointing.maxCheckpoints.toString()}
                onChange={(e) => onCheckpointingChange({ ...safeCheckpointing, maxCheckpoints: parseInt(e.target.value) || 10 })}
              />
              <Checkbox
                id="checkpointOnSubtaskComplete"
                checked={safeCheckpointing.checkpointOnSubtaskComplete}
                onChange={(checked) => onCheckpointingChange({ ...safeCheckpointing, checkpointOnSubtaskComplete: checked })}
                label="Checkpoint on subtask complete"
              />
              <Checkbox
                id="checkpointOnShutdown"
                checked={safeCheckpointing.checkpointOnShutdown}
                onChange={(checked) => onCheckpointingChange({ ...safeCheckpointing, checkpointOnShutdown: checked })}
                label="Checkpoint on shutdown"
              />
            </div>
          )}
        </div>
      </div>

      {/* Task 4.4: Loop Guard Section */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">Loop Guard</h3>
          <HelpText {...helpContent.advanced.loopGuard} />
        </div>
        <div className="space-y-md">
          <Checkbox
            id="loopGuardEnabled"
            checked={safeLoopGuard.enabled}
            onChange={(checked) => onLoopGuardChange({ ...safeLoopGuard, enabled: checked })}
            label="Enable loop guard"
          />
          {safeLoopGuard.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md ml-lg">
              <Input
                label="Max Repetitions"
                type="number"
                value={safeLoopGuard.maxRepetitions.toString()}
                onChange={(e) => onLoopGuardChange({ ...safeLoopGuard, maxRepetitions: parseInt(e.target.value) || 3 })}
              />
              <Checkbox
                id="suppressReplyRelay"
                checked={safeLoopGuard.suppressReplyRelay}
                onChange={(checked) => onLoopGuardChange({ ...safeLoopGuard, suppressReplyRelay: checked })}
                label="Suppress reply relay"
              />
            </div>
          )}
        </div>
      </div>

      {/* Task 4.4: Escalation Chains Section */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">Escalation Chains</h3>
          <HelpText {...helpContent.advanced.escalationChains} />
        </div>
        {(['testFailure', 'acceptance', 'timeout', 'structural', 'error'] as const).map((chainType) => {
          const chain = safeEscalation.chains?.[chainType] || [];
          return (
            <div key={chainType} className="p-md border-medium border-ink-faded rounded">
              <h4 className="font-semibold mb-sm capitalize">{chainType.replace(/([A-Z])/g, ' $1').trim()}</h4>
              {chain.length === 0 ? (
                <p className="text-sm text-ink-faded">No escalation steps configured</p>
              ) : (
                <div className="space-y-sm">
                  {chain.map((step, idx) => (
                    <div key={idx} className="p-sm bg-paper-lined/30 rounded text-sm">
                      <div className="grid grid-cols-2 gap-sm">
                        <div>
                          <span className="font-semibold">Action: </span>
                          <span className="font-mono">{step.action}</span>
                        </div>
                        {step.maxAttempts && (
                          <div>
                            <span className="font-semibold">Max Attempts: </span>
                            <span>{step.maxAttempts}</span>
                          </div>
                        )}
                        {step.to && (
                          <div>
                            <span className="font-semibold">To: </span>
                            <span>{step.to}</span>
                          </div>
                        )}
                        {step.notify && (
                          <div>
                            <span className="font-semibold">Notify: </span>
                            <span>Yes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Add a new step (simplified - in production would have full editor)
                  const newStep = { action: 'self_fix' as const };
                  onEscalationChange({
                    chains: {
                      ...safeEscalation.chains,
                      [chainType]: [...chain, newStep]
                    }
                  });
                }}
                className="mt-sm"
              >
                + Add Step
              </Button>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
