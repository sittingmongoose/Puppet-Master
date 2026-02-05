import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfigPage from './Config.js';
import * as lib from '@/lib';

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

describe('ConfigPage - Network Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getCursorCapabilities.mockResolvedValue({
      binary: { selected: 'agent', candidates: ['agent'] },
      modes: ['default'],
      outputFormats: ['text'],
      auth: { status: 'authenticated', hasApiKey: true },
      models: { source: 'static', count: 1, sample: [] },
      mcp: { available: false, serverCount: 0, servers: [] },
      config: { found: false },
    });
    mockApi.getConfig.mockResolvedValue({
      tiers: {
        phase: { platform: 'cursor', model: 'auto', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
        task: { platform: 'cursor', model: 'auto', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
        subtask: { platform: 'cursor', model: 'auto', taskFailureStyle: 'spawn_new_agent', maxIterations: 3 },
        iteration: { platform: 'cursor', model: 'auto', taskFailureStyle: 'skip_retries', maxIterations: 1 },
      },
      branching: { baseBranch: 'main', namingPattern: 'rwm/{tier}/{id}', granularity: 'per-task' },
      verification: { browserAdapter: 'playwright', screenshotOnFailure: true, evidenceDirectory: '.puppet-master/evidence' },
      memory: { progressFile: 'progress.txt', agentsFile: 'AGENTS.md', prdFile: 'prd.json', multiLevelAgents: true },
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
      network: {
        trustProxy: false,
        allowedOrigins: ['http://localhost:3847'],
        corsRelaxed: false,
      },
    });
  });

  it('renders network settings section in Advanced tab', async () => {
    render(<ConfigPage />);
    
    // Wait for config to load
    await screen.findByText('Configuration');
    
    // Click Advanced tab
    fireEvent.click(screen.getByText('Advanced'));
    
    // Check for Network & Security section
    await screen.findByText('Network & Security');
    
    expect(screen.getByText(/Configure network settings for mobile access/i)).toBeInTheDocument();
  });

  it('renders LAN mode checkbox', async () => {
    render(<ConfigPage />);
    
    await screen.findByText('Configuration');
    fireEvent.click(screen.getByText('Advanced'));
    
    await screen.findByText('Network & Security');
    
    const lanModeCheckbox = screen.getByLabelText('LAN Mode (Relaxed CORS)');
    expect(lanModeCheckbox).toBeInTheDocument();
    expect(lanModeCheckbox).not.toBeChecked();
  });

  it('renders Trust Proxy checkbox', async () => {
    render(<ConfigPage />);
    
    await screen.findByText('Configuration');
    fireEvent.click(screen.getByText('Advanced'));
    
    await screen.findByText('Network & Security');
    
    const trustProxyCheckbox = screen.getByLabelText('Trust Proxy Headers');
    expect(trustProxyCheckbox).toBeInTheDocument();
    expect(trustProxyCheckbox).not.toBeChecked();
  });

  it('renders Allowed Origins input field', async () => {
    render(<ConfigPage />);
    
    await screen.findByText('Configuration');
    fireEvent.click(screen.getByText('Advanced'));
    
    await screen.findByText('Network & Security');
    
    const originsInput = screen.getByLabelText('Allowed Origins (CORS)');
    expect(originsInput).toBeInTheDocument();
    expect(originsInput).toHaveValue('http://localhost:3847');
  });

  it('renders intensive logging checkbox (remains accessible)', async () => {
    render(<ConfigPage />);
    
    await screen.findByText('Configuration');
    fireEvent.click(screen.getByText('Advanced'));
    
    // Intensive logging should be visible before network settings
    const intensiveLoggingCheckbox = screen.getByLabelText('Intensive logging');
    expect(intensiveLoggingCheckbox).toBeInTheDocument();
    expect(intensiveLoggingCheckbox).not.toBeChecked();
  });

  it('shows restart notice for network settings', async () => {
    render(<ConfigPage />);
    
    await screen.findByText('Configuration');
    fireEvent.click(screen.getByText('Advanced'));
    
    await screen.findByText('Network & Security');
    
    expect(screen.getByText(/Changes to network settings require a server restart/i)).toBeInTheDocument();
  });
});
