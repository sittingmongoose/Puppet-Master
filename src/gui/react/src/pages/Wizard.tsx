import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, Input, ProgressBar } from '@/components/ui';
import { useProjectStore } from '@/stores';
import { api } from '@/lib';
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
      const result = await api.wizardGenerate({ requirements: state.requirements });
      setState((s) => ({
        ...s,
        prd: result.prd,
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
  }, [state.requirements, nextStep]);

  // Start the project
  const startProject = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // Save wizard state
      await api.wizardSave({
        prd: state.prd || '',
        projectName: state.projectName,
        projectPath: state.projectPath,
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
            loading={state.loading}
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
          <Input
            label="Project Path"
            value={projectPath}
            onChange={(e) => onChange({ projectPath: e.target.value })}
            placeholder="/path/to/project"
            required
            hint="Full path where project files are located"
          />
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
  loading: boolean;
  onGenerate: () => void;
  onBack: () => void;
}

function GenerateStep({ requirements, loading, onGenerate, onBack }: GenerateStepProps) {
  return (
    <Panel title="Generate PRD">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Review your requirements below. Click "Generate PRD" to create a structured 
          Product Requirements Document using AI.
        </p>

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

interface ConfigureStepProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

function ConfigureStep({ onNext, onBack }: ConfigureStepProps) {
  return (
    <Panel title="Configure Tier Settings">
      <div className="space-y-lg">
        <p className="text-ink-faded">
          Configure platform and model settings for each tier. Default settings will be used
          if you skip this step.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {['Phase', 'Task', 'Subtask', 'Iteration'].map((tier) => (
            <div key={tier} className="p-md border-medium border-ink-faded">
              <h3 className="font-bold mb-sm">{tier} Tier</h3>
              <div className="space-y-sm">
                <Input
                  label="Platform"
                  defaultValue="cursor"
                  placeholder="cursor | codex | claude"
                />
                <Input
                  label="Model"
                  defaultValue="auto"
                  placeholder="Model name or auto"
                />
              </div>
            </div>
          ))}
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
          <strong>⚠️ Ready to start?</strong>
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
            🚀 START CHAIN
          </Button>
        </div>
      </div>
    </Panel>
  );
}
