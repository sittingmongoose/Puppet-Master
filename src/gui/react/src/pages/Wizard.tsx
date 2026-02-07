import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, Input, Select, ProgressBar, Checkbox, HelpText } from '@/components/ui';
import { RefreshIcon, WarningIcon, RocketIcon } from '@/components/icons';
import { useProjectStore } from '@/stores';
import { api } from '@/lib';
import { helpContent } from '@/lib/help-content.js';
import type { Project } from '@/types';

/**
 * Wizard step type
 */
type WizardStep = 
  | 'upload'
  | 'generate'
  | 'review'
  | 'configure'
  | 'plan'
  | 'start';

interface WizardState {
  step: WizardStep;
  requirements: string;
  projectName: string;
  projectPath: string;
  prd: string | null;
  architecture: string | null;
  tierPlan: string | null;
  config: Record<string, unknown>;
  loading: boolean;
  error: string | null;
  prdPlatform: string;
  prdModel: string;
}

const STEPS: WizardStep[] = ['upload', 'generate', 'review', 'configure', 'plan', 'start'];

const STEP_LABELS: Record<WizardStep, string> = {
  upload: '1. Upload Requirements',
  generate: '2. Generate PRD',
  review: '3. Review Architecture',
  configure: '4. Configure Tiers',
  plan: '5. Generate Plan',
  start: '6. Review & Start',
};

/**
 * Wizard page - 6-step start chain workflow
 */
export default function WizardPage() {
  const navigate = useNavigate();
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
  const addRecentProject = useProjectStore((s) => s.addRecentProject);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<WizardState>({
    step: 'upload',
    requirements: '',
    projectName: '',
    projectPath: '',
    prd: null,
    architecture: null,
    tierPlan: null,
    config: {},
    loading: false,
    error: null,
    prdPlatform: 'cursor',
    prdModel: 'auto',
  });

  const currentStepIndex = STEPS.indexOf(state.step);
  const progress = ((currentStepIndex) / (STEPS.length - 1)) * 100;

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setState((s) => ({ ...s, requirements: content, error: null }));
    };
    reader.onerror = () => {
      setState((s) => ({ ...s, error: 'Failed to read file' }));
    };
    reader.readAsText(file);
  }, []);

  // Navigate to next step
  const nextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.step);
    const nextStepValue = STEPS[currentIndex + 1];
    if (currentIndex < STEPS.length - 1 && nextStepValue) {
      setState((s) => ({ ...s, step: nextStepValue, error: null }));
    }
  }, [state.step]);

  // Navigate to previous step
  const prevStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(state.step);
    const prevStepValue = STEPS[currentIndex - 1];
    if (currentIndex > 0 && prevStepValue) {
      setState((s) => ({ ...s, step: prevStepValue, error: null }));
    }
  }, [state.step]);

  // Generate PRD from requirements
  const generatePRD = useCallback(async () => {
    if (!state.requirements.trim()) {
      setState((s) => ({ ...s, error: 'Please enter or upload requirements first' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // First upload/parse the requirements
      const uploadResult = await api.wizardUpload({
        text: state.requirements,
        format: 'text',
      });

      // Then generate PRD with platform/model selection
      const generateResult = await api.wizardGenerate({
        parsed: uploadResult.parsed,
        projectName: state.projectName,
        projectPath: state.projectPath,
        platform: state.prdPlatform,
        model: state.prdModel,
        useAI: true,
      });

      setState((s) => ({
        ...s,
        prd: typeof generateResult.prd === 'string' ? generateResult.prd : JSON.stringify(generateResult.prd, null, 2),
        architecture: generateResult.architecture || null,
        tierPlan: generateResult.tierPlan ? JSON.stringify(generateResult.tierPlan, null, 2) : null,
        loading: false,
      }));
      nextStep();
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to generate PRD',
      }));
    }
  }, [state.requirements, state.projectName, state.projectPath, state.prdPlatform, state.prdModel, nextStep]);

  // Start the project
  const startProject = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Parse the PRD and tier plan back to objects if they're strings
      const prdObj = state.prd ? (typeof state.prd === 'string' ? JSON.parse(state.prd) : state.prd) : null;
      const tierPlanObj = state.tierPlan ? (typeof state.tierPlan === 'string' ? JSON.parse(state.tierPlan) : state.tierPlan) : null;

      // Save wizard state with tier configuration
      await api.wizardSave({
        prd: prdObj,
        architecture: state.architecture,
        tierPlan: tierPlanObj,
        projectName: state.projectName,
        projectPath: state.projectPath,
        tierConfigs: state.config.tiers as Record<string, { platform: string; model: string; planMode?: boolean; askMode?: boolean }>,
      });

      // Create project record
      const project: Project = {
        id: `project-${Date.now()}`,
        name: state.projectName,
        path: state.projectPath,
        lastAccessed: new Date(),
      };

      setCurrentProject(project);
      addRecentProject(project);

      // Start orchestrator
      await api.start();
      
      navigate('/');
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to start project',
      }));
    }
  }, [state, navigate, setCurrentProject, addRecentProject]);

  // Render step content
  const renderStepContent = () => {
    switch (state.step) {
      case 'upload':
        return (
          <UploadStep
            requirements={state.requirements}
            projectName={state.projectName}
            projectPath={state.projectPath}
            fileInputRef={fileInputRef}
            onChange={(updates) => setState((s) => ({ ...s, ...updates }))}
            onFileUpload={handleFileUpload}
            onNext={nextStep}
          />
        );
      case 'generate':
        return (
            <GenerateStep
              requirements={state.requirements}
              prdPlatform={state.prdPlatform}
              prdModel={state.prdModel}
              loading={state.loading}
              onPlatformChange={(platform) => setState((s) => ({
                ...s,
                prdPlatform: platform,
                prdModel: platform === 'cursor' ? 'auto' : '',
              }))}
              onModelChange={(model) => setState((s) => ({ ...s, prdModel: model }))}
              onGenerate={generatePRD}
              onBack={prevStep}
            />
        );
      case 'review':
        return (
          <ReviewStep
            prd={state.prd}
            onChange={(prd) => setState((s) => ({ ...s, prd }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'configure':
        return (
          <ConfigureStep
            config={state.config}
            onChange={(config) => setState((s) => ({ ...s, config }))}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'plan':
        return (
          <PlanStep
            tierPlan={state.tierPlan}
            loading={state.loading}
            onGenerate={async () => {
              setState((s) => ({ ...s, loading: true }));
              // Simulate plan generation
              await new Promise((r) => setTimeout(r, 1000));
              setState((s) => ({
                ...s,
                tierPlan: 'Phase 1: Setup\nTask 1.1: Initialize project...',
                loading: false,
              }));
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 'start':
        return (
          <StartStep
            projectName={state.projectName}
            projectPath={state.projectPath}
            loading={state.loading}
            onStart={startProject}
            onBack={prevStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Start Chain Wizard</h1>
        <span className="text-ink-faded">
          Step {currentStepIndex + 1} of {STEPS.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="space-y-sm">
        <ProgressBar value={progress} />
        <div className="flex justify-between text-sm">
          {STEPS.map((step, index) => (
            <span
              key={step}
              className={`
                ${index === currentStepIndex ? 'text-electric-blue font-bold' : ''}
                ${index < currentStepIndex ? 'text-acid-lime' : 'text-ink-faded'}
              `}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      {/* Step indicator */}
      <Panel showInnerBorder={false}>
        <h2 className="font-display text-lg">{STEP_LABELS[state.step]}</h2>
      </Panel>

      {/* Error display */}
      {state.error && (
        <Panel showInnerBorder={false}>
          <div className="text-hot-magenta">{state.error}</div>
        </Panel>
      )}

      {/* Step content */}
      {renderStepContent()}
    </div>
  );
}

// ============================================
// Step Components
// ============================================

interface UploadStepProps {
  requirements: string;
  projectName: string;
  projectPath: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onChange: (updates: Partial<WizardState>) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
}

function UploadStep({
  requirements,
  projectName,
  projectPath,
  fileInputRef,
  onChange,
  onFileUpload,
  onNext,
}: UploadStepProps) {
  const canProceed = requirements.trim().length > 0 && projectName.trim().length > 0 && projectPath.trim().length > 0;
  const directoryInputRef = useRef<HTMLInputElement>(null);

  const handleDirectorySelect = useCallback(async () => {
    // Try File System Access API first (modern browsers)
    if ('showDirectoryPicker' in window) {
      try {
        const directoryHandle = await (window as any).showDirectoryPicker();
        onChange({ projectPath: directoryHandle.name });
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to select directory:', err);
        }
      }
    } else {
      // Fallback to file input with webkitdirectory
      directoryInputRef.current?.click();
    }
  }, [onChange]);

  const handleDirectoryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Get directory name from first file's webkitRelativePath
      const firstFile = files[0];
      if (firstFile?.webkitRelativePath) {
        const directoryName = firstFile.webkitRelativePath.split('/')[0];
        onChange({ projectPath: directoryName });
      }
    }
  }, [onChange]);

  return (
    <Panel title="Project Details & Requirements">
      <div className="space-y-lg">
        {/* Project info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Input
            label="Project Name"
            value={projectName}
            onChange={(e) => onChange({ projectName: e.target.value })}
            placeholder="My New Project"
            required
          />
          <div className="space-y-xs">
            <div className="flex gap-xs items-end">
              <div className="flex-1">
                <Input
                  label="Project Path"
                  value={projectPath}
                  onChange={(e) => onChange({ projectPath: e.target.value })}
                  placeholder="/path/to/project"
                  required
                  hint="Full path where project files will be located"
                />
              </div>
              <input
                ref={directoryInputRef}
                type="file"
                // @ts-expect-error - nonstandard attribute supported by Chromium browsers
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleDirectoryChange}
                className="hidden"
              />
              <Button
                variant="info"
                onClick={handleDirectorySelect}
                type="button"
              >
                BROWSE
              </Button>
            </div>
            <p className="text-xs text-ink-faded">Select the directory where the project will be created</p>
          </div>
        </div>

        {/* File upload */}
        <div>
          <label className="block font-bold mb-sm">Upload Requirements File</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,.markdown"
            onChange={onFileUpload}
            className="hidden"
          />
          <Button
            variant="info"
            onClick={() => fileInputRef.current?.click()}
          >
            CHOOSE FILE
          </Button>
        </div>

        {/* Text input */}
        <div>
          <label className="block font-bold mb-sm">Or Paste Requirements</label>
          <textarea
            value={requirements}
            onChange={(e) => onChange({ requirements: e.target.value })}
            placeholder="Paste your project requirements, PRD, or feature list here..."
            className="
              w-full h-64
              p-md
              bg-paper-white dark:bg-ink-black
              border-medium border-ink-black dark:border-ink-light
              font-mono text-sm
              resize-y
              focus:outline-none focus:ring-2 focus:ring-electric-blue
            "
          />
          <div className="text-sm text-ink-faded mt-xs">
            {requirements.length} characters
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={onNext}
            disabled={!canProceed}
          >
            NEXT →
          </Button>
        </div>
      </div>
    </Panel>
  );
}

interface GenerateStepProps {
  requirements: string;
  prdPlatform: string;
  prdModel: string;
  loading: boolean;
  onPlatformChange: (platform: string) => void;
  onModelChange: (model: string) => void;
  onGenerate: () => void;
  onBack: () => void;
}

function GenerateStep({ 
  requirements, 
  prdPlatform, 
  prdModel, 
  loading, 
  onPlatformChange, 
  onModelChange, 
  onGenerate, 
  onBack 
}: GenerateStepProps) {
  const [models, setModels] = useState<Array<{ id: string; label: string }>>([]);
  const [modelsLoading, setModelsLoading] = useState(false);

  // Fetch models for selected platform
  useEffect(() => {
    const fetchModels = async () => {
      setModelsLoading(true);
      try {
        const data = await api.getModels(false);
        const platformModels = (data as any)[prdPlatform] || [];
        setModels(platformModels);
        // If the platform changed away from Cursor and a stale "auto" model is selected,
        // reset to the first available model (or empty string to use CLI defaults).
        if (prdPlatform !== 'cursor' && (prdModel === 'auto' || prdModel === '')) {
          const first = platformModels?.[0]?.id;
          onModelChange(typeof first === 'string' ? first : '');
        }
      } catch (err) {
        console.error('Failed to fetch models:', err);
      } finally {
        setModelsLoading(false);
      }
    };
    fetchModels();
  }, [prdPlatform, prdModel, onModelChange]);

  const getModelOptions = (): Array<{ value: string; label: string }> => {
    const options: Array<{ value: string; label: string }> = [];
    
    // Add discovered models
    const filteredModels = prdPlatform === 'cursor'
      ? models
      : models.filter(m => m.id !== 'auto');
    filteredModels.forEach(model => {
      options.push({ value: model.id, label: model.label || model.id });
    });
    
    if (options.length > 0) return options;
    return prdPlatform === 'cursor'
      ? [{ value: 'auto', label: 'Auto (Recommended)' }]
      : [{ value: '', label: 'Default' }];
  };

  return (
    <Panel title="Generate PRD">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Review your requirements below and select the AI platform and model to use for PRD generation.
          Click "Generate PRD" to create a structured Product Requirements Document using AI.
        </p>

        {/* Platform and Model Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md p-md border-medium border-electric-blue/30 bg-electric-blue/5">
          <Select
            label="PRD Generation Platform"
            value={prdPlatform}
            onChange={(e) => onPlatformChange(e.target.value)}
            options={[
              { value: 'cursor', label: 'Cursor' },
              { value: 'codex', label: 'Codex' },
              { value: 'claude', label: 'Claude' },
              { value: 'gemini', label: 'Gemini' },
              { value: 'copilot', label: 'Copilot' },
            ]}
          />
          {modelsLoading ? (
            <div className="space-y-xs">
              <label className="block text-sm font-medium">Model</label>
              <div className="text-sm text-ink-faded">Loading models...</div>
            </div>
          ) : (
            <Select
              label="Model"
              value={prdModel}
              onChange={(e) => onModelChange(e.target.value)}
              options={getModelOptions()}
            />
          )}
        </div>

        <div className="p-md bg-paper-lined border-medium border-dashed border-ink-faded">
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-64">
            {requirements.substring(0, 1000)}
            {requirements.length > 1000 && '...'}
          </pre>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← BACK
          </Button>
          <Button
            variant="primary"
            onClick={onGenerate}
            loading={loading}
          >
            GENERATE PRD
          </Button>
        </div>
      </div>
    </Panel>
  );
}

interface ReviewStepProps {
  prd: string | null;
  onChange: (prd: string) => void;
  onNext: () => void;
  onBack: () => void;
}

function ReviewStep({ prd, onChange, onNext, onBack }: ReviewStepProps) {
  return (
    <Panel title="Review & Edit PRD">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Review and edit the generated PRD. Make any necessary adjustments before proceeding.
        </p>

        <textarea
          value={prd || ''}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full h-96
            p-md
            bg-paper-white dark:bg-ink-black
            border-medium border-ink-black dark:border-ink-light
            font-mono text-sm
            resize-y
            focus:outline-none focus:ring-2 focus:ring-electric-blue
          "
        />

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← BACK
          </Button>
          <Button variant="primary" onClick={onNext}>
            NEXT →
          </Button>
        </div>
      </div>
    </Panel>
  );
}

interface TierConfig {
  platform: string;
  model: string;
  planMode?: boolean;
  askMode?: boolean;
  outputFormat?: 'text' | 'json' | 'stream-json';
  reasoningLevel?: string; // For Codex models
}

interface ConfigureStepProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_TIER_CONFIG: Record<string, TierConfig> = {
  phase: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text' },
  task: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text' },
  subtask: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text' },
  iteration: { platform: 'cursor', model: 'auto', planMode: false, askMode: false, outputFormat: 'text' },
};

function ConfigureStep({ config, onChange, onNext, onBack }: ConfigureStepProps) {
  // Initialize tier configs from config or defaults
  const tierConfigs = (config.tiers as Record<string, TierConfig>) || DEFAULT_TIER_CONFIG;
  
  // Model discovery state
  const [models, setModels] = useState<Record<string, Array<{ id: string; label: string; reasoningLevels?: string[] }>>>({});
  const [modelsLoading, setModelsLoading] = useState<Record<string, boolean>>({});
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Fetch models for a platform
  const fetchModels = useCallback(async (platform: string, forceRefresh = false) => {
    if (modelsLoading[platform]) return; // Already loading
    
    setModelsLoading(prev => ({ ...prev, [platform]: true }));
    setModelsError(null);
    
    try {
      const data = await api.getModels(forceRefresh);
      setModels(data as Record<string, Array<{ id: string; label: string; reasoningLevels?: string[] }>>);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setModelsError(error instanceof Error ? error.message : 'Failed to fetch models');
      // Fallback: use empty models, will show text input
    } finally {
      setModelsLoading(prev => ({ ...prev, [platform]: false }));
    }
  }, [modelsLoading]);

  // Fetch models on mount
  useEffect(() => {
    fetchModels('all');
  }, [fetchModels]);

  // Fetch models when platform changes for any tier
  useEffect(() => {
    const platforms = new Set(Object.values(tierConfigs).map(t => t.platform));
    platforms.forEach(platform => {
      if (platform && !models[platform] && !modelsLoading[platform]) {
        fetchModels(platform);
      }
    });
  }, [tierConfigs, models, modelsLoading, fetchModels]);

  const updateTier = (tier: string, field: keyof TierConfig, value: string | boolean) => {
    const nextPlatform = field === 'platform' && typeof value === 'string' ? value : undefined;
    const resetModel =
      nextPlatform !== undefined
        ? (nextPlatform === 'cursor' ? 'auto' : '')
        : undefined;

    const updatedTiers = {
      ...tierConfigs,
      [tier]: {
        ...tierConfigs[tier],
        [field]: value,
        ...(resetModel !== undefined ? { model: resetModel } : {}),
      },
    };
    onChange({ ...config, tiers: updatedTiers });
    
    // If platform changed, fetch models for new platform
    if (nextPlatform !== undefined) {
      fetchModels(nextPlatform);
    }
  };
  
  // Get available models for a platform
  const getModelsForPlatform = (platform: string): Array<{ value: string; label: string }> => {
    const platformModels = models[platform] || [];
    const options: Array<{ value: string; label: string }> = [];
    
    // Add discovered models
    const filtered = platform === 'cursor'
      ? platformModels
      : platformModels.filter(m => m.id !== 'auto');
    filtered.forEach(model => {
      options.push({ value: model.id, label: model.label || model.id });
    });
    
    if (options.length > 0) return options;
    return platform === 'cursor'
      ? [{ value: 'auto', label: 'Auto (Recommended)' }]
      : [{ value: '', label: 'Default' }];
  };
  
  // Get reasoning levels for a Codex model
  const getReasoningLevels = (platform: string, modelId: string): string[] => {
    if (platform !== 'codex') return [];
    const model = models.codex?.find(m => m.id === modelId);
    return model?.reasoningLevels || [];
  };

  return (
    <Panel title="Configure Tier Settings">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Configure platform and model settings for each tier. Default settings will be used
          if you skip this step.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {(['phase', 'task', 'subtask', 'iteration'] as const).map((tier) => (
            <div key={tier} className="p-md border-medium border-ink-faded">
              <h3 className="font-bold mb-sm capitalize">{tier} Tier</h3>
              <div className="space-y-sm">
                {/* P1: Platform dropdown */}
                <Select
                  label="Platform"
                  value={tierConfigs[tier]?.platform || 'cursor'}
                  onChange={(e) => updateTier(tier, 'platform', e.target.value)}
                  options={[
                    { value: 'cursor', label: 'Cursor' },
                    { value: 'codex', label: 'Codex' },
                    { value: 'claude', label: 'Claude' },
                    { value: 'gemini', label: 'Gemini' },
                    { value: 'copilot', label: 'Copilot' },
                  ]}
                />
                {/* Task 4.3: Model dropdown with dynamic discovery */}
                {modelsLoading[tierConfigs[tier]?.platform || 'cursor'] ? (
                  <div className="space-y-xs">
                    <label className="block text-sm font-medium">Model</label>
                    <div className="text-sm text-ink-faded">Loading models...</div>
                  </div>
                ) : modelsError ? (
                  <div className="space-y-xs">
                    <label className="block text-sm font-medium">Model</label>
                    <Input
                      label="Model"
                      value={tierConfigs[tier]?.model || (tierConfigs[tier]?.platform === 'cursor' ? 'auto' : '')}
                      onChange={(e) => updateTier(tier, 'model', e.target.value)}
                      placeholder="Model name"
                    />
                    <div className="text-xs text-ink-faded">Using manual input (discovery failed)</div>
                  </div>
                ) : (
                  <Select
                    label="Model"
                    value={tierConfigs[tier]?.model || 'auto'}
                    onChange={(e) => updateTier(tier, 'model', e.target.value)}
                    options={getModelsForPlatform(tierConfigs[tier]?.platform || 'cursor')}
                  />
                )}
                {/* Task 4.3: Reasoning level selector for Codex models */}
                {tierConfigs[tier]?.platform === 'codex' && 
                 getReasoningLevels('codex', tierConfigs[tier]?.model || '').length > 0 && (
                  <Select
                    label="Reasoning Level"
                    value={(tierConfigs[tier] as any)?.reasoningLevel || 'Medium'}
                    onChange={(e) => updateTier(tier, 'reasoningLevel' as any, e.target.value)}
                    options={getReasoningLevels('codex', tierConfigs[tier]?.model || '').map(level => ({
                      value: level,
                      label: level,
                    }))}
                  />
                )}
                {/* P1: Plan Mode toggle */}
                <div className="space-y-xs">
                  <Checkbox
                    id={`wizard-${tier}-planMode`}
                    checked={tierConfigs[tier]?.planMode || false}
                    onChange={(checked) => updateTier(tier, 'planMode', checked)}
                    label="Plan mode"
                  />
                  <HelpText {...helpContent.tiers.planMode} />
                </div>
                {/* P1: Ask Mode toggle */}
                <div className="space-y-xs">
                  <Checkbox
                    id={`wizard-${tier}-askMode`}
                    checked={tierConfigs[tier]?.askMode || false}
                    onChange={(checked) => updateTier(tier, 'askMode', checked)}
                    label="Ask mode (read-only)"
                  />
                  <HelpText {...helpContent.tiers.askMode} />
                </div>
                {/* P1: Output Format dropdown */}
                <Select
                  label="Output Format"
                  value={tierConfigs[tier]?.outputFormat || 'text'}
                  onChange={(e) => updateTier(tier, 'outputFormat', e.target.value)}
                  options={[
                    { value: 'text', label: 'Text' },
                    { value: 'json', label: 'JSON' },
                    { value: 'stream-json', label: 'Stream JSON' },
                  ]}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Task 4.3: Refresh models button */}
        <div className="flex items-center justify-between gap-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const platforms = new Set(Object.values(tierConfigs).map(t => t.platform));
              platforms.forEach(platform => {
                if (platform) fetchModels(platform, true);
              });
            }}
          >
            <span className="flex items-center gap-xs">
              <RefreshIcon size="1em" />
              Refresh Models
            </span>
          </Button>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← BACK
          </Button>
          <div className="flex gap-sm">
            <Button variant="ghost" onClick={onNext}>
              SKIP
            </Button>
            <Button variant="primary" onClick={onNext}>
              NEXT →
            </Button>
          </div>
        </div>
      </div>
    </Panel>
  );
}

interface PlanStepProps {
  tierPlan: string | null;
  loading: boolean;
  onGenerate: () => void;
  onBack: () => void;
}

function PlanStep({ tierPlan, loading, onGenerate, onBack }: PlanStepProps) {
  return (
    <Panel title="Generate Tier Plan">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Generate a hierarchical execution plan from your PRD. This will create 
          phases, tasks, subtasks, and iterations.
        </p>

        {tierPlan && (
          <div className="p-md bg-paper-lined border-medium border-dashed border-ink-faded">
            <pre className="font-mono text-sm whitespace-pre-wrap">{tierPlan}</pre>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← BACK
          </Button>
          <Button
            variant="primary"
            onClick={onGenerate}
            loading={loading}
          >
            {tierPlan ? 'REGENERATE PLAN' : 'GENERATE PLAN'}
          </Button>
        </div>
      </div>
    </Panel>
  );
}

interface StartStepProps {
  projectName: string;
  projectPath: string;
  loading: boolean;
  onStart: () => void;
  onBack: () => void;
}

function StartStep({ projectName, projectPath, loading, onStart, onBack }: StartStepProps) {
  return (
    <Panel title="Review & Start">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Review your project settings below. Click "Start Chain" to begin execution.
        </p>

        <div className="p-md border-medium border-ink-faded space-y-sm">
          <div>
            <span className="font-bold">Project Name:</span> {projectName}
          </div>
          <div>
            <span className="font-bold">Project Path:</span>{' '}
            <span className="font-mono text-sm">{projectPath}</span>
          </div>
        </div>

        <div className="p-md bg-safety-orange/10 border-medium border-safety-orange">
          <strong className="flex items-center gap-xs">
            <WarningIcon size="1em" />
            Ready to start?
          </strong>
          <p className="mt-xs text-sm">
            The orchestrator will begin executing the tier plan. You can pause or stop
            execution at any time from the dashboard.
          </p>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={onBack}>
            ← BACK
          </Button>
          <Button
            variant="primary"
            onClick={onStart}
            loading={loading}
          >
            <span className="flex items-center gap-xs">
              <RocketIcon size="1em" />
              START CHAIN
            </span>
          </Button>
        </div>
      </div>
    </Panel>
  );
}
