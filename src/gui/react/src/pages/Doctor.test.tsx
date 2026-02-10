import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DoctorPage from './Doctor.js';
import * as lib from '@/lib';

// Stateful mock store — setChecks actually updates component state via React
vi.mock('@/stores/doctorStore', () => {
  const { useState: _useState } = require('react');
  return {
    useDoctorStore: () => {
      const [checks, setChecksState] = _useState([] as unknown[]);
      const [platformStatus, setPlatformStatusState] = _useState({} as Record<string, unknown>);
      const [selectedPlatforms, setSelectedPlatformsState] = _useState([] as string[]);
      return {
        checks,
        platformStatus,
        selectedPlatforms,
        _hasHydrated: true,
        setChecks: setChecksState,
        setPlatformStatus: setPlatformStatusState,
        setSelectedPlatforms: setSelectedPlatformsState,
        setHasHydrated: () => {},
        reset: () => { setChecksState([]); setPlatformStatusState({}); setSelectedPlatformsState([]); },
      };
    },
  };
});

// Mock the lib
vi.mock('@/lib', () => ({
  api: {
    getDoctorChecks: vi.fn(),
    runDoctorChecks: vi.fn(),
    fixDoctorCheck: vi.fn(),
    getPlatformStatus: vi.fn().mockResolvedValue({ platforms: {}, installedPlatforms: [] }),
    getModels: vi.fn().mockResolvedValue([]),
  },
  APIError: class APIError extends Error { status: number; constructor(m: string, s: number) { super(m); this.status = s; } },
  getErrorMessage: vi.fn((err: unknown, fallback: string) => err instanceof Error ? err.message : fallback),
}));

vi.mock('@/hooks/index.js', () => ({
  fetchWithRetry: (fn: () => Promise<unknown>) => fn(),
}));

const mockApi = lib.api as unknown as {
  getDoctorChecks: ReturnType<typeof vi.fn>;
  runDoctorChecks: ReturnType<typeof vi.fn>;
  fixDoctorCheck: ReturnType<typeof vi.fn>;
};

const sampleChecks = [
  { name: 'Node.js', category: 'runtimes', status: 'pass' as const, message: 'v20.0.0' },
  { name: 'Git', category: 'cli', status: 'pass' as const, message: '2.40.0' },
  { name: 'Playwright', category: 'browser', status: 'fail' as const, message: 'Not installed', fixable: true },
  { name: 'cursor', category: 'cli', status: 'warn' as const, message: 'Outdated version' },
];

describe('DoctorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getDoctorChecks.mockResolvedValue({ checks: sampleChecks });
    mockApi.runDoctorChecks.mockResolvedValue({ checks: sampleChecks });
    mockApi.fixDoctorCheck.mockResolvedValue({ success: true });
  });

  it('renders page title', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Doctor')).toBeInTheDocument();
    });
  });

  it('renders run all checks button', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /RUN ALL CHECKS/i })).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    mockApi.getDoctorChecks.mockImplementation(() => new Promise(() => {}));
    
    render(<DoctorPage />);
    
    expect(screen.getByText('Loading checks...')).toBeInTheDocument();
  });

  it('shows summary panel with stats', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Summary')).toBeInTheDocument();
      expect(screen.getByText(/2\/4 checks passed/)).toBeInTheDocument();
    });
  });

  it('shows check names', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Git')).toBeInTheDocument();
      expect(screen.getByText('Playwright')).toBeInTheDocument();
      expect(screen.getByText('cursor')).toBeInTheDocument();
    });
  });

  it('shows check messages', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/v20\.0\.0/)).toBeInTheDocument();
      expect(screen.getByText(/Not installed/)).toBeInTheDocument();
    });
  });

  it('shows FIX button for fixable checks', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      const fixButtons = screen.getAllByRole('button', { name: /^FIX$/i });
      expect(fixButtons.length).toBeGreaterThan(0);
    });
  });

  it('calls runDoctorChecks when clicking run all', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Doctor')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /RUN ALL CHECKS/i }));
    
    await waitFor(() => {
      expect(mockApi.runDoctorChecks).toHaveBeenCalled();
    });
  });

  it('calls fixDoctorCheck when clicking FIX', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Playwright')).toBeInTheDocument();
    });

    const fixButtons = screen.getAllByRole('button', { name: /^FIX$/i });
    if (fixButtons[0]) {
      fireEvent.click(fixButtons[0]);
    }
    
    await waitFor(() => {
      expect(mockApi.fixDoctorCheck).toHaveBeenCalledWith('Playwright');
    });
  });

  it('shows error message on API failure', async () => {
    mockApi.getDoctorChecks.mockRejectedValue(new Error('Network error'));
    
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows category panels', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/CLI Tools/)).toBeInTheDocument();
      expect(screen.getByText(/Runtimes/)).toBeInTheDocument();
      expect(screen.getByText(/Browser Tools/)).toBeInTheDocument();
    });
  });

  it('fetches checks on mount', async () => {
    render(<DoctorPage />);
    
    await waitFor(() => {
      expect(mockApi.getDoctorChecks).toHaveBeenCalled();
    });
  });
});
