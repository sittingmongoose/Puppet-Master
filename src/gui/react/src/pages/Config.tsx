import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Panel } from '@/components/layout';
import { Button, Input, Select, HelpText, Checkbox, Radio } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { WarningIcon, RefreshIcon } from '@/components/icons';
import { api, getErrorMessage, type CursorCapabilities, type PlatformStatusType } from '@/lib';
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
  taskFailureStyle: 'spawn_new_agent' | 'continue_same_agent' | 'skip_retries';
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
    intensiveLogging?: boolean;
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
  network?: {
    trustProxy?: boolean;
    allowedOrigins?: string[];
    corsRelaxed?: boolean;
  };
}

interface GitInfo {
  branches: string[];
  remoteName: string;
  remoteUrl: string;
  userName: string;
  userEmail: string;
  currentBranch: string;
}

const DEFAULT_CONFIG: Config = {
  tiers: {
    phase: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
    task: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
    subtask: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
    iteration: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text', taskFailureStyle: 'skip_retries', maxIterations: 1 },
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
    intensiveLogging: false,
  },
  network: {
    trustProxy: false,
    allowedOrigins: ['http://localhost:3847'],
    corsRelaxed: false,
  },
};

// Module-level cache so Config data persists across navigation
let cachedConfig: Config | null = null;

/**
 * Config page - configuration tabs
 */
export default function ConfigPage() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('tiers');
  const [config, setConfig] = useState<Config>(cachedConfig ?? DEFAULT_CONFIG);
  const [loading, setLoading] = useState(cachedConfig === null);
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
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [platformStatus, setPlatformStatus] = useState<Record<string, PlatformStatusType>>({});
  const [installedPlatforms, setInstalledPlatforms] = useState<Platform[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [uninstalling, setUninstalling] = useState(false);
  const [uninstallMessage, setUninstallMessage] = useState<string | null>(null);

  // Ref to prevent duplicate initial load (e.g. React Strict Mode double-mount)
  const initialLoadStarted = useRef(false);

  // C6: Detect Linux platform (navigator.platform or userAgent)
  const isLinux = useMemo(() => {
    if (typeof navigator !== 'undefined') {
      return navigator.userAgent.includes('Linux') || navigator.platform.includes('Linux');
    }
    return false;
  }, []);

  // C6: Handle uninstall
  const handleUninstall = useCallback(async () => {
    const confirmed = window.confirm(
      'Are you sure you want to uninstall RWM Puppet Master?\n\n' +
      'This will remove the application via apt. You may be prompted for your password.'
    );
    if (!confirmed) return;

    try {
      setUninstalling(true);
      setUninstallMessage(null);
      const data = await api.uninstallSystem();
      if (data.success) {
        setUninstallMessage(data.message || 'Uninstall initiated. The application will close shortly.');
      } else {
        setUninstallMessage(data.error || 'Uninstall failed.');
      }
    } catch (err) {
      setUninstallMessage(getErrorMessage(err, 'Failed to initiate uninstall'));
    } finally {
      setUninstalling(false);
    }
  }, []);

  // Single initial load: config, capabilities, platform status, models, git info (deduplicated, one batch)
  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;

    const ensureModelsArray = (platformModels: unknown): Array<{ id: string; label: string; reasoningLevels?: string[] }> => {
      if (!Array.isArray(platformModels)) return [];
      return platformModels.filter((m) => m && typeof m === 'object' && typeof (m as { id?: unknown }).id === 'string') as Array<{ id: string; label: string; reasoningLevels?: string[] }>;
    };

    const load = async () => {
      if (!cachedConfig) setLoading(true);
      setModelsError(null);

      try {
        const [configRes, capsRes, statusRes, modelsRes, gitRes] = await Promise.all([
          api.getConfig(false),
          api.getCursorCapabilities().catch(() => null),
          api.getPlatformStatus().catch(() => ({ platforms: {}, installedPlatforms: [] })),
          api.getModels(false).catch(() => null),
          api.getGitInfo().catch(() => null),
        ]);

        if (configRes) {
          const cfg = configRes as unknown as Config;
          const logging = (cfg as unknown as { logging?: { level?: string; intensive?: boolean } }).logging;
          if (logging) {
            cfg.advanced = {
              ...cfg.advanced,
              logLevel: logging.level ?? cfg.advanced.logLevel,
              intensiveLogging: logging.intensive ?? cfg.advanced.intensiveLogging,
            };
          }
          setConfig(cfg);
          cachedConfig = cfg;
        } else if (!cachedConfig) {
          setError('Failed to load config');
        }

        if (capsRes) setCapabilities(capsRes);

        if (statusRes && typeof statusRes === 'object') {
          setPlatformStatus((statusRes as { platforms?: Record<string, PlatformStatusType> }).platforms ?? {});
          setInstalledPlatforms((statusRes as { installedPlatforms?: Platform[] }).installedPlatforms ?? []);
        }

        if (modelsRes && typeof modelsRes === 'object') {
          const record = modelsRes as Record<string, unknown>;
          setModels({
            cursor: ensureModelsArray(record.cursor),
            codex: ensureModelsArray(record.codex),
            claude: ensureModelsArray(record.claude),
            gemini: ensureModelsArray(record.gemini),
            copilot: ensureModelsArray(record.copilot),
          });
        } else {
          setModelsError('Failed to load models (server error).');
          setModels({ cursor: [], codex: [], claude: [], gemini: [], copilot: [] });
        }

        if (gitRes) setGitInfo(gitRes);
      } catch (err) {
        console.error('[Config] Initial load failed:', err);
        if (!cachedConfig) setError(getErrorMessage(err, 'Failed to load config'));
        setModelsError('Failed to load models (network error).');
        setModels({ cursor: [], codex: [], claude: [], gemini: [], copilot: [] });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Handle platform installation
  const handleInstallPlatform = useCallback(async (platform: Platform) => {
    try {
      setInstalling(platform);
      const result = await api.installPlatform(platform);
      if (result.success) {
        // Reload platform status
        const status = await api.getPlatformStatus();
        setPlatformStatus(status.platforms);
        setInstalledPlatforms(status.installedPlatforms as Platform[]);
      } else {
        const parts = [result.error ?? `Failed to install ${platform}`];
        if (result.code) parts.push(`(${result.code})`);
        if (result.output?.trim()) parts.push(result.output.trim());
        setError(parts.join(' '));
      }
    } catch (err) {
      setError(getErrorMessage(err, `Failed to install ${platform}`));
    } finally {
      setInstalling(null);
    }
  }, []);

  // Save config
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const existingLogging = (config as unknown as { logging?: { retentionDays?: number } }).logging;

      const toSave = {
        ...config,
        logging: {
          level: config.advanced.logLevel,
          retentionDays: existingLogging?.retentionDays ?? 30,
          intensive: config.advanced.intensiveLogging || false,
        },
      };

      await api.updateConfig(toSave as unknown as Record<string, unknown>);
      
      // Update cache with saved config
      cachedConfig = config;
      setIsDirty(false);
    } catch (err) {
      console.error('[Config] Failed to save config:', err);
      setError(getErrorMessage(err, 'Failed to save config'));
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
            installedPlatforms={installedPlatforms}
            platformStatus={platformStatus}
            installing={installing}
            onInstallPlatform={handleInstallPlatform}
            onRefreshModels={async () => {
              try {
                setModelsError(null);
                const data = await api.getModels(true) as unknown as Record<string, Array<{ id: string; label: string; reasoningLevels?: string[] }>>;
                const ensureModels = (platformModels: Array<{ id: string; label: string; reasoningLevels?: string[] }> | undefined) => {
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
              } catch (err) {
                console.error('[Config] Failed to refresh models:', err);
                const message = err instanceof Error ? err.message : 'Failed to refresh models. Check server logs or try again.';
                setModelsError(message);
                setTimeout(() => setModelsError(null), 8000);
              }
            }}
          />
        );
      case 'branching':
        return (
          <BranchingTab
            config={config.branching}
            onChange={(branching) => updateConfig('branching', branching)}
            gitInfo={gitInfo}
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
            network={config.network}
            isLinux={isLinux}
            onUninstall={handleUninstall}
            uninstalling={uninstalling}
            uninstallMessage={uninstallMessage}
            onChange={(advanced) => updateConfig('advanced', advanced)}
            onCliPathsChange={(cliPaths) => updateConfig('cliPaths' as any, cliPaths)}
            onRateLimitsChange={(rateLimits) => updateConfig('rateLimits' as any, rateLimits)}
            onExecutionChange={(execution) => updateConfig('execution' as any, execution)}
            onCheckpointingChange={(checkpointing) => updateConfig('checkpointing' as any, checkpointing)}
            onLoopGuardChange={(loopGuard) => updateConfig('loopGuard' as any, loopGuard)}
            onEscalationChange={(escalation) => updateConfig('escalation' as any, escalation)}
            onNetworkChange={(network) => updateConfig('network' as any, network)}
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
                setModelsError(null);
                const data = await api.getModels(true) as unknown as Record<string, unknown>;
                // Ensure we have valid arrays for each platform
                // Note: "auto" is ONLY for Cursor - it's added in the dropdown options, not here
                const ensureArray = (platformModels: unknown): Array<{ id: string; label: string; reasoningLevels?: string[] }> => {
                  if (!Array.isArray(platformModels)) return [];
                  return platformModels.filter(m => m && typeof m === 'object' && typeof (m as any).id === 'string') as Array<{ id: string; label: string; reasoningLevels?: string[] }>;
                };
                setModels({
                  cursor: ensureArray(data.cursor),
                  codex: ensureArray(data.codex),
                  claude: ensureArray(data.claude),
                  gemini: ensureArray(data.gemini),
                  copilot: ensureArray(data.copilot),
                });
              } catch (err) {
                console.error('[Config] Failed to refresh models:', err);
                const message = err instanceof Error ? err.message : 'Failed to refresh models. Check server logs or try again.';
                setModelsError(message);
                setTimeout(() => setModelsError(null), 8000);
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

      {/* Models load/refresh error (e.g. timeout or server error) */}
      {modelsError && (
        <Panel showInnerBorder={false}>
          <div className="text-hot-magenta">{modelsError}</div>
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
  installedPlatforms: Platform[];
  platformStatus?: Record<string, PlatformStatusType>;
  installing: string | null;
  onInstallPlatform: (platform: Platform) => Promise<void>;
  onRefreshModels?: () => Promise<void>;
}

function TiersTab({ 
  config, 
  onChange, 
  models, 
  installedPlatforms,
  installing,
  onInstallPlatform,
}: TiersTabProps) {
  const updateTier = (tier: keyof Config['tiers'], updates: Partial<TierSettings>) => {
    const newConfig = {
      ...config,
      [tier]: { ...config[tier], ...updates },
    };
    
    // If platform changed and new platform is not installed, try to use first installed platform
    if (updates.platform && !installedPlatforms.includes(updates.platform) && installedPlatforms.length > 0) {
      const firstInstalled = installedPlatforms[0];
      if (firstInstalled) {
        newConfig[tier].platform = firstInstalled;
        // Reset model for the new platform
        const newModel = newConfig[tier].platform === 'cursor' 
          ? 'auto' 
          : (models[newConfig[tier].platform]?.[0]?.id || '');
        newConfig[tier].model = newModel;
      }
    }
    
    onChange(newConfig);
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
          
          // Build model options.
          // - Cursor supports "auto"
          // - Other platforms should never show "auto" (even if backend data is stale)
          const platformModelsRaw = models[currentPlatform] || [];
          const platformModels = currentPlatform === 'cursor'
            ? platformModelsRaw
            : platformModelsRaw.filter(m => m.id !== 'auto');
          const modelOptions = platformModels.map(m => ({ value: m.id, label: m.label || m.id }));
          
          return (
            <div key={tier} className="p-md border-medium border-ink-faded min-w-0 break-words">
              <h3 className="font-bold text-lg mb-md capitalize break-words">{tier} Tier</h3>
              <div className="space-y-md min-w-0">
                {/* P1: Platform dropdown - filtered to installed platforms */}
                <div>
                  <div className="flex items-center gap-sm">
                    <div className="flex-1">
                      <Select
                        label="Platform"
                        value={installedPlatforms.includes(currentPlatform) 
                          ? currentPlatform 
                          : (installedPlatforms.length > 0 ? (installedPlatforms[0] as Platform) : 'cursor')}
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
                        options={installedPlatforms.length > 0 
                          ? installedPlatforms.map((platform) => ({
                              value: platform,
                              label: typeof platform === 'string' && platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown',
                            }))
                          : [
                              { value: 'cursor', label: 'Cursor (not installed)' },
                              { value: 'codex', label: 'Codex (not installed)' },
                              { value: 'claude', label: 'Claude (not installed)' },
                              { value: 'gemini', label: 'Gemini (not installed)' },
                              { value: 'copilot', label: 'Copilot (not installed)' },
                            ]
                        }
                      />
                    </div>
                    {!installedPlatforms.includes(currentPlatform) && installedPlatforms.length > 0 && (
                      <div className="pt-lg">
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => onInstallPlatform(currentPlatform)}
                          loading={installing === currentPlatform}
                          disabled={installing !== null}
                        >
                          INSTALL
                        </Button>
                      </div>
                    )}
                  </div>
                  {!installedPlatforms.includes(currentPlatform) && (
                    <div className="mt-xs p-sm bg-safety-orange/10 border-medium border-safety-orange rounded">
                      <p className="text-sm text-safety-orange">
                        <WarningIcon size="1em" className="inline mr-xs" />
                        {typeof currentPlatform === 'string' && currentPlatform ? currentPlatform.charAt(0).toUpperCase() + currentPlatform.slice(1) : 'Platform'} is not installed. 
                        {installedPlatforms.length > 0 
                          ? ' Please install it to use this platform, or select an installed platform.'
                          : ' Please run the platform setup wizard to install platforms.'}
                      </p>
                    </div>
                  )}
                  {installedPlatforms.length === 0 && (
                    <div className="mt-xs p-sm bg-hot-magenta/10 border-medium border-hot-magenta rounded">
                      <p className="text-sm text-hot-magenta">
                        <WarningIcon size="1em" className="inline mr-xs" />
                        No platforms are installed. Please run the platform setup wizard to install platforms.
                      </p>
                    </div>
                  )}
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
                  <Select
                    label="Task Failure Style"
                    value={config[tier].taskFailureStyle}
                    onChange={(e) => updateTier(tier, { taskFailureStyle: e.target.value as TierSettings['taskFailureStyle'] })}
                    options={[
                      { value: 'spawn_new_agent', label: 'Spawn New Agent (default)' },
                      { value: 'continue_same_agent', label: 'Continue With Same Agent (best-effort)' },
                      { value: 'skip_retries', label: 'Skip Retries' },
                    ]}
                  />
                  <HelpText {...helpContent.tiers.taskFailureStyle} />
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
  gitInfo: GitInfo | null;
}

function BranchingTab({ config, onChange, gitInfo }: BranchingTabProps) {
  // Build branch options from git info, ensuring current baseBranch is always included
  const branchOptions = useMemo(() => {
    const branches = gitInfo?.branches ?? [];
    const uniqueBranches = new Set(branches);
    if (config.baseBranch) {
      uniqueBranches.add(config.baseBranch);
    }
    return Array.from(uniqueBranches).map(b => ({ value: b, label: b }));
  }, [gitInfo?.branches, config.baseBranch]);

  return (
    <Panel title="Branching Configuration">
      <p className="text-ink-faded mb-lg">
        Configure Git branch creation and naming conventions.
      </p>

      {/* Git Repository Info */}
      {gitInfo && (gitInfo.currentBranch || gitInfo.remoteUrl || gitInfo.userName) && (
        <div className="mb-lg p-md border-medium border-ink-faded bg-paper-lined/30">
          <h3 className="font-bold text-sm mb-md uppercase tracking-wide">Repository Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm text-sm">
            {gitInfo.currentBranch && (
              <div>
                <span className="font-semibold">Current Branch: </span>
                <span className="font-mono">{gitInfo.currentBranch}</span>
              </div>
            )}
            {gitInfo.remoteUrl && (
              <div>
                <span className="font-semibold">Remote URL: </span>
                <span className="font-mono text-xs break-all">{gitInfo.remoteUrl}</span>
              </div>
            )}
            {gitInfo.userName && (
              <div>
                <span className="font-semibold">Git User: </span>
                <span>{gitInfo.userName}</span>
              </div>
            )}
            {gitInfo.userEmail && (
              <div>
                <span className="font-semibold">Git Email: </span>
                <span>{gitInfo.userEmail}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-lg max-w-xl">
        <div>
          {branchOptions.length > 0 ? (
            <Select
              label="Base Branch"
              value={config.baseBranch}
              onChange={(e) => onChange({ ...config, baseBranch: e.target.value })}
              options={branchOptions}
            />
          ) : (
            <Input
              label="Base Branch"
              value={config.baseBranch}
              onChange={(e) => onChange({ ...config, baseBranch: e.target.value })}
            />
          )}
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
  network?: Config['network'];
  isLinux: boolean;
  onUninstall: () => void;
  uninstalling: boolean;
  uninstallMessage: string | null;
  onChange: (config: Config['advanced']) => void;
  onCliPathsChange: (cliPaths: Config['cliPaths']) => void;
  onRateLimitsChange: (rateLimits: Config['rateLimits']) => void;
  onExecutionChange: (execution: Config['execution']) => void;
  onCheckpointingChange: (checkpointing: Config['checkpointing']) => void;
  onLoopGuardChange: (loopGuard: Config['loopGuard']) => void;
  onEscalationChange: (escalation: Config['escalation']) => void;
  onNetworkChange: (network: Config['network']) => void;
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
  network,
  isLinux,
  onUninstall,
  uninstalling,
  uninstallMessage,
  onChange,
  onCliPathsChange,
  onRateLimitsChange,
  onExecutionChange,
  onCheckpointingChange,
  onLoopGuardChange,
  onEscalationChange,
  onNetworkChange,
  capabilities 
}: AdvancedTabProps) {
  // Use defaults if config is undefined (e.g., from API response missing the field)
  const safeConfig = config || DEFAULT_CONFIG.advanced;
  const safeAdvanced = {
    ...DEFAULT_CONFIG.advanced,
    ...safeConfig,
  };
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
  const safeNetwork = network || DEFAULT_CONFIG.network || { trustProxy: false, allowedOrigins: ['http://localhost:3847'], corsRelaxed: false };

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
          <label className="block font-mono text-sm font-semibold mb-xs">Log Level</label>
          <select
            value={safeAdvanced.logLevel}
            onChange={(e) => onChange({ ...safeAdvanced, logLevel: e.target.value })}
            className="w-full px-md py-sm bg-paper-cream dark:bg-paper-dark border-medium border-ink-black dark:border-ink-light font-mono text-sm"
          >
            <option value="error">error</option>
            <option value="warn">warn</option>
            <option value="info">info</option>
            <option value="debug">debug</option>
          </select>
          <HelpText {...helpContent.advanced.logLevel} />
        </div>

        <div>
          <Input
            label="Process Timeout (ms)"
            type="number"
            value={safeAdvanced.processTimeout.toString()}
            onChange={(e) => onChange({ ...safeAdvanced, processTimeout: parseInt(e.target.value) || 300000 })}
          />
          <HelpText {...helpContent.advanced.processTimeout} />
        </div>

        <div>
          <Input
            label="Parallel Iterations"
            type="number"
            value={safeAdvanced.parallelIterations.toString()}
            onChange={(e) => onChange({ ...safeAdvanced, parallelIterations: parseInt(e.target.value) || 1 })}
          />
          <HelpText {...helpContent.advanced.parallelIterations} />
        </div>

        {isLinux && (
          <div className="space-y-sm border-medium border-ink-faded rounded p-md">
            <div className="font-semibold">System</div>
            <p className="text-ink-faded text-sm">
              Remove RWM Puppet Master from this system. This will run the system package
              manager to uninstall the application. You may be prompted for your password.
            </p>
            {uninstallMessage && (
              <div className={`p-sm border-medium rounded text-sm ${
                uninstallMessage.includes('initiated')
                  ? 'border-status-success bg-status-success/10'
                  : 'border-hot-magenta bg-hot-magenta/10 text-hot-magenta'
              }`}>
                {uninstallMessage}
              </div>
            )}
            <Button
              variant="danger"
              onClick={onUninstall}
              loading={uninstalling}
            >
              UNINSTALL PUPPET MASTER
            </Button>
          </div>
        )}

        <div className="space-y-xs">
          <Checkbox
            id="intensiveLogging"
            checked={safeAdvanced.intensiveLogging || false}
            onChange={(checked) => onChange({ ...safeAdvanced, intensiveLogging: checked })}
            label="Intensive logging"
          />
          <HelpText
            hint="Captures decision rationale and forwards console.* output into runtime logs. Useful for debugging but can produce a lot of output."
          />
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
              label={typeof platform === 'string' && platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : 'Unknown'}
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
                  const newStep = { action: 'retry' as const };
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

      {/* Network & Security Settings */}
      <div className="mt-xl space-y-md">
        <div>
          <h3 className="font-bold text-lg">Network & Security</h3>
          <p className="text-sm text-ink-faded mt-xs">
            Configure network settings for mobile access and reverse proxy deployments.
          </p>
        </div>

        <div className="space-y-md p-md border-medium border-ink-faded rounded bg-paper-lined/20">
          <div className="space-y-xs">
            <Checkbox
              id="corsRelaxed"
              checked={safeNetwork.corsRelaxed || false}
              onChange={(checked) => onNetworkChange({ ...safeNetwork, corsRelaxed: checked })}
              label="LAN Mode (Relaxed CORS)"
            />
            <HelpText
              hint="Enable to allow access from other devices on your local network. Allows dev ports (3000-9999) and private IP ranges (192.168.x.x, 10.x.x.x, 172.16-31.x.x). Use for mobile testing or LAN deployments."
            />
          </div>

          <div className="space-y-xs">
            <Checkbox
              id="trustProxy"
              checked={safeNetwork.trustProxy || false}
              onChange={(checked) => onNetworkChange({ ...safeNetwork, trustProxy: checked })}
              label="Trust Proxy Headers"
            />
            <HelpText
              hint="Enable when running behind a reverse proxy (nginx, Apache, etc.). Allows the server to trust X-Forwarded-* headers for client IP detection. Required for proper rate limiting and security logging behind proxies."
            />
          </div>

          <div>
            <label htmlFor="allowedOrigins" className="block font-semibold mb-xs">
              Allowed Origins (CORS)
            </label>
            <Input
              id="allowedOrigins"
              value={(safeNetwork.allowedOrigins || []).join(', ')}
              onChange={(e) => {
                const origins = e.target.value
                  .split(',')
                  .map(o => o.trim())
                  .filter(Boolean);
                onNetworkChange({ ...safeNetwork, allowedOrigins: origins });
              }}
              placeholder="http://localhost:3847, https://mydomain.com"
            />
            <HelpText
              hint="Comma-separated list of allowed origins for CORS. Localhost variants are always allowed. Add custom domains or mobile app origins here."
            />
          </div>

          <div className="p-sm bg-electric-blue/10 border-medium border-electric-blue text-sm rounded">
            <strong>Note: </strong>
            Changes to network settings require a server restart to take effect.
          </div>
        </div>
      </div>
    </Panel>
  );
}
