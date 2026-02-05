import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfigPage from './Config.js';
import * as lib from '@/lib';
import type { CursorCapabilities } from '@/lib';

// Mock the lib
vi.mock('@/lib', () => ({
  api: {
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
    getCursorCapabilities: vi.fn(),
    getPlatformStatus: vi.fn().mockResolvedValue({ platforms: {} }),
    getModels: vi.fn().mockResolvedValue({ models: {} }),
    getGitInfo: vi.fn().mockResolvedValue({}),
    installPlatform: vi.fn().mockResolvedValue({}),
    uninstallSystem: vi.fn().mockResolvedValue({}),
  },
  getErrorMessage: vi.fn().mockImplementation((_error: unknown, fallback: string) => fallback),
}));

const mockApi = lib.api as unknown as {
  getConfig: ReturnType<typeof vi.fn>;
  updateConfig: ReturnType<typeof vi.fn>;
  getCursorCapabilities: ReturnType<typeof vi.fn>;
};

describe('ConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getCursorCapabilities.mockResolvedValue({
      binary: { selected: 'agent', candidates: ['agent', 'cursor-agent'] },
      modes: ['default', 'plan', 'ask'],
      outputFormats: ['text', 'json', 'stream-json'],
      auth: { status: 'authenticated', hasApiKey: true },
      models: {
        source: 'static',
        count: 5,
        sample: [
          { id: 'claude-3-opus', label: 'Claude 3 Opus', source: 'static' },
          { id: 'claude-3-sonnet', label: 'Claude 3 Sonnet', source: 'static' },
        ],
      },
      mcp: { available: true, serverCount: 2, servers: ['context7', 'filesystem'] },
      config: { found: true, path: '~/.cursor/config.json', hasPermissions: true },
    });
    mockApi.getConfig.mockResolvedValue({
      tiers: {
        phase: { platform: 'cursor', model: 'auto', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
        task: { platform: 'cursor', model: 'auto', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
        subtask: { platform: 'cursor', model: 'auto', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
        iteration: { platform: 'cursor', model: 'auto', taskFailureStyle: 'skip_retries', maxIterations: 1 },
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
        cursor: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
        gemini: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
        copilot: { maxCallsPerRun: 100, maxCallsPerHour: 50, maxCallsPerDay: 500 },
      },
      advanced: {
        logLevel: 'info',
        processTimeout: 300000,
        parallelIterations: 1,
        intensiveLogging: false,
      },
    });
    mockApi.updateConfig.mockResolvedValue({ success: true });
  });

  it('renders page title', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
  });

  it('renders all tabs', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tiers')).toBeInTheDocument();
      expect(screen.getByText('Branching')).toBeInTheDocument();
      expect(screen.getByText('Verification')).toBeInTheDocument();
      expect(screen.getByText('Memory')).toBeInTheDocument();
      expect(screen.getByText('Budgets')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
    });
  });

  it('shows Tiers tab content by default', async () => {
    render(<ConfigPage />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText('Loading configuration...')).not.toBeInTheDocument();
    });
    
    expect(screen.getByText('Tier Configuration')).toBeInTheDocument();
    // Check for tier inputs
    expect(screen.getAllByLabelText(/Platform/i).length).toBeGreaterThan(0);
  });

  it('switches to Branching tab when clicked', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Branching'));
    
    expect(screen.getByText('Branching Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Base Branch/i)).toBeInTheDocument();
  });

  it('switches to Verification tab when clicked', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Verification'));
    
    expect(screen.getByText('Verification Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Browser Adapter/i)).toBeInTheDocument();
  });

  it('switches to Memory tab when clicked', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Memory'));
    
    expect(screen.getByText('Memory Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Progress File/i)).toBeInTheDocument();
  });

  it('switches to Budgets tab when clicked', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Budgets'));
    
    expect(screen.getByText('Budget Configuration')).toBeInTheDocument();
  });

  it('switches to Advanced tab when clicked', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Advanced'));
    
    expect(screen.getByText('Advanced Configuration')).toBeInTheDocument();
    expect(screen.getByText(/Caution/)).toBeInTheDocument();
  });

  it('shows loading state initially', async () => {
    // Reset modules so cachedConfig (module-level) is null again
    vi.resetModules();
    const { default: FreshConfigPage } = await import('./Config.js');
    // Re-apply mocks after module reset
    const freshLib = await import('@/lib');
    const freshApi = freshLib.api as unknown as { getConfig: ReturnType<typeof vi.fn> };
    freshApi.getConfig.mockImplementation(() => new Promise(() => {}));
    
    render(<FreshConfigPage />);
    
    expect(screen.getByText('Loading configuration...')).toBeInTheDocument();
  });

  it('disables save button when no changes', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /SAVE CHANGES/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when changes are made', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    // Make a change
    const modelInputs = screen.getAllByLabelText(/Model/i);
    if (modelInputs[0]) {
      fireEvent.change(modelInputs[0], { target: { value: 'claude-3' } });
    }
    
    const saveButton = screen.getByRole('button', { name: /SAVE CHANGES/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('shows unsaved changes indicator', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    // Make a change
    const modelInputs = screen.getAllByLabelText(/Model/i);
    if (modelInputs[0]) {
      fireEvent.change(modelInputs[0], { target: { value: 'claude-3' } });
    }
    
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('calls updateConfig API when saving', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    // Make a change
    const modelInputs = screen.getAllByLabelText(/Model/i);
    if (modelInputs[0]) {
      fireEvent.change(modelInputs[0], { target: { value: 'claude-3' } });
    }
    
    fireEvent.click(screen.getByRole('button', { name: /SAVE CHANGES/i }));
    
    await waitFor(() => {
      expect(mockApi.updateConfig).toHaveBeenCalled();
    });
  });

  it('fetches config on mount', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(mockApi.getConfig).toHaveBeenCalled();
    });
  });

  it('fetches capabilities on mount', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(mockApi.getCursorCapabilities).toHaveBeenCalled();
    });
  });

  it('displays capabilities in Advanced tab', async () => {
    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Advanced'));
    
    await waitFor(() => {
      expect(screen.getByText('Cursor CLI Capabilities')).toBeInTheDocument();
      expect(screen.getByText(/Binary:/)).toBeInTheDocument();
      expect(screen.getByText(/Models:/)).toBeInTheDocument();
    });
  });

  it('handles capabilities with empty sample array', async () => {
    mockApi.getCursorCapabilities.mockResolvedValueOnce({
      binary: { selected: 'agent', candidates: ['agent'] },
      modes: ['default'],
      outputFormats: ['text'],
      auth: { status: 'unknown', hasApiKey: false },
      models: {
        source: 'static',
        count: 0,
        sample: [],
      },
      mcp: { available: false, serverCount: 0, servers: [] },
      config: { found: false, hasPermissions: false },
    });

    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Advanced'));
    
    await waitFor(() => {
      expect(screen.getByText('Cursor CLI Capabilities')).toBeInTheDocument();
      // Should not crash with empty sample
      expect(screen.getByText(/Models:/)).toBeInTheDocument();
    });
  });

  it('handles capabilities with null/undefined sample gracefully', async () => {
    mockApi.getCursorCapabilities.mockResolvedValueOnce({
      binary: { selected: 'agent', candidates: ['agent'] },
      modes: ['default'],
      outputFormats: ['text'],
      auth: { status: 'unknown', hasApiKey: false },
      models: {
        source: 'static',
        count: 0,
        sample: null as unknown as [],
      },
      mcp: { available: false, serverCount: 0, servers: [] },
      config: { found: false, hasPermissions: false },
    });

    render(<ConfigPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Advanced'));
    
    // Should not crash - Array.isArray check should prevent .map() call
    await waitFor(() => {
      expect(screen.getByText('Cursor CLI Capabilities')).toBeInTheDocument();
    });
  });

  it('handles capabilities with missing models / mcp / config without throwing', async () => {
    const partialCapabilities = {
      binary: { selected: 'agent', candidates: ['agent'] },
      auth: { status: 'unknown', hasApiKey: false },
      // models, mcp, config, modes, outputFormats omitted (partial API response)
    };
    mockApi.getCursorCapabilities.mockResolvedValueOnce(partialCapabilities as unknown as CursorCapabilities);

    render(<ConfigPage />);

    await waitFor(() => {
      expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Advanced'));

    await waitFor(() => {
      expect(screen.getByText('Cursor CLI Capabilities')).toBeInTheDocument();
    });
    expect(screen.getByText('Binary:')).toBeInTheDocument();
    expect(screen.getByText('Auth:')).toBeInTheDocument();
  });
});
