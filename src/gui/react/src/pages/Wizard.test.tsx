import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import WizardPage from './Wizard.js';
import * as stores from '@/stores';
import * as lib from '@/lib';

// Mock the stores
vi.mock('@/stores', () => ({
  useProjectStore: vi.fn(),
}));

// Mock the lib
vi.mock('@/lib', () => ({
  api: {
    wizardUpload: vi.fn(),
    wizardGenerate: vi.fn(),
    wizardSave: vi.fn(),
    start: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseProjectStore = stores.useProjectStore as unknown as ReturnType<typeof vi.fn>;
const mockApi = lib.api as unknown as {
  wizardUpload: ReturnType<typeof vi.fn>;
  wizardGenerate: ReturnType<typeof vi.fn>;
  wizardSave: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
};

function renderWizard() {
  return render(
    <BrowserRouter>
      <WizardPage />
    </BrowserRouter>
  );
}

describe('WizardPage', () => {
  const setCurrentProject = vi.fn();
  const addRecentProject = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Default store state
    mockUseProjectStore.mockImplementation((selector: (s: unknown) => unknown) => {
      const state = {
        setCurrentProject,
        addRecentProject,
      };
      return selector(state);
    });

    // Default API responses
    mockApi.wizardUpload.mockResolvedValue({ parsed: { text: 'Build a REST API', format: 'text' } });
    mockApi.wizardGenerate.mockResolvedValue({ prd: 'Generated PRD content', usedAI: true });
    mockApi.wizardSave.mockResolvedValue({ success: true });
    mockApi.start.mockResolvedValue({ success: true });
  });

  it('renders page title', () => {
    renderWizard();
    
    expect(screen.getByText('Start Chain Wizard')).toBeInTheDocument();
  });

  it('renders step 1 indicator', () => {
    renderWizard();
    
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
  });

  it('renders upload step initially', () => {
    renderWizard();
    
    expect(screen.getByText('1. Upload Requirements')).toBeInTheDocument();
    expect(screen.getByText('Project Details & Requirements')).toBeInTheDocument();
  });

  it('shows project name input', () => {
    renderWizard();
    
    expect(screen.getByLabelText(/Project Name/i)).toBeInTheDocument();
  });

  it('shows project path input', () => {
    renderWizard();
    
    expect(screen.getByLabelText(/Project Path/i)).toBeInTheDocument();
  });

  it('shows requirements text area', () => {
    renderWizard();
    
    expect(screen.getByPlaceholderText(/Paste your project requirements/i)).toBeInTheDocument();
  });

  it('shows choose file button', () => {
    renderWizard();
    
    expect(screen.getByRole('button', { name: /CHOOSE FILE/i })).toBeInTheDocument();
  });

  it('disables NEXT button until all fields are filled', () => {
    renderWizard();
    
    const nextButton = screen.getByRole('button', { name: /NEXT/i });
    expect(nextButton).toBeDisabled();
  });

  it('enables NEXT button when all fields are filled', () => {
    renderWizard();
    
    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByLabelText(/Project Path/i), {
      target: { value: '/path/to/project' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste your project requirements/i), {
      target: { value: 'Some requirements text' },
    });
    
    const nextButton = screen.getByRole('button', { name: /NEXT/i });
    expect(nextButton).not.toBeDisabled();
  });

  it('shows character count for requirements', () => {
    renderWizard();
    
    expect(screen.getByText('0 characters')).toBeInTheDocument();
    
    fireEvent.change(screen.getByPlaceholderText(/Paste your project requirements/i), {
      target: { value: 'Hello world' },
    });
    
    expect(screen.getByText('11 characters')).toBeInTheDocument();
  });

  it('advances to step 2 when clicking NEXT', () => {
    renderWizard();
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByLabelText(/Project Path/i), {
      target: { value: '/path/to/project' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste your project requirements/i), {
      target: { value: 'Some requirements text' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /NEXT/i }));
    
    expect(screen.getByText('Step 2 of 6')).toBeInTheDocument();
    expect(screen.getByText('2. Generate PRD')).toBeInTheDocument();
  });

  it('shows BACK button on step 2', async () => {
    renderWizard();
    
    // Fill required fields and advance
    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByLabelText(/Project Path/i), {
      target: { value: '/path/to/project' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste your project requirements/i), {
      target: { value: 'Some requirements text' },
    });
    fireEvent.click(screen.getByRole('button', { name: /NEXT/i }));
    
    expect(screen.getByRole('button', { name: /BACK/i })).toBeInTheDocument();
  });

  it('goes back to step 1 when clicking BACK', async () => {
    renderWizard();
    
    // Fill required fields and advance
    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByLabelText(/Project Path/i), {
      target: { value: '/path/to/project' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste your project requirements/i), {
      target: { value: 'Some requirements text' },
    });
    fireEvent.click(screen.getByRole('button', { name: /NEXT/i }));
    
    // Click back
    fireEvent.click(screen.getByRole('button', { name: /BACK/i }));
    
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument();
    expect(screen.getByText('1. Upload Requirements')).toBeInTheDocument();
  });

  it('calls wizardGenerate API when clicking Generate PRD', async () => {
    renderWizard();
    
    // Fill required fields and advance
    fireEvent.change(screen.getByLabelText(/Project Name/i), {
      target: { value: 'Test Project' },
    });
    fireEvent.change(screen.getByLabelText(/Project Path/i), {
      target: { value: '/path/to/project' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Paste your project requirements/i), {
      target: { value: 'Build a REST API' },
    });
    fireEvent.click(screen.getByRole('button', { name: /NEXT/i }));
    
    // Click Generate PRD
    fireEvent.click(screen.getByRole('button', { name: /GENERATE PRD/i }));
    
    await waitFor(() => {
      expect(mockApi.wizardUpload).toHaveBeenCalledWith({
        text: 'Build a REST API',
        format: 'text',
      });
      expect(mockApi.wizardGenerate).toHaveBeenCalledWith({
        parsed: { text: 'Build a REST API', format: 'text' },
        projectName: 'Test Project',
        projectPath: '/path/to/project',
        platform: 'cursor',
        model: 'auto',
        useAI: true,
      });
    });
  });

  it('shows progress bar', () => {
    renderWizard();
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
