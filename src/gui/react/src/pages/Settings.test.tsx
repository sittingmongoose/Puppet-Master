import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsPage from './Settings.js';

// Mock the uiStore
const mockSetTheme = vi.fn();

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({
    theme: 'light',
    setTheme: mockSetTheme,
  }),
}));

function renderSettings() {
  return render(<SettingsPage />);
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders page title', () => {
    renderSettings();
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders save button', () => {
    renderSettings();
    
    expect(screen.getByRole('button', { name: /SAVE CHANGES/i })).toBeInTheDocument();
  });

  it('renders reset button', () => {
    renderSettings();
    
    expect(screen.getByRole('button', { name: /RESET TO DEFAULTS/i })).toBeInTheDocument();
  });

  it('renders appearance panel', () => {
    renderSettings();
    
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('renders theme selector', () => {
    renderSettings();
    
    expect(screen.getByLabelText('Theme selection')).toBeInTheDocument();
  });

  it('renders font size selector', () => {
    renderSettings();
    
    expect(screen.getByLabelText('Font size selection')).toBeInTheDocument();
  });

  it('renders animations toggle', () => {
    renderSettings();
    
    expect(screen.getByLabelText('Enable animations')).toBeInTheDocument();
  });

  it('renders notifications panel', () => {
    renderSettings();
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders sound toggle', () => {
    renderSettings();
    
    expect(screen.getByLabelText('Enable sound effects')).toBeInTheDocument();
  });

  it('renders editor preferences panel', () => {
    renderSettings();
    
    expect(screen.getByText('Editor Preferences')).toBeInTheDocument();
  });

  it('renders default editor selector', () => {
    renderSettings();
    
    expect(screen.getByLabelText('Default editor selection')).toBeInTheDocument();
  });

  it('renders platform preferences panel', () => {
    renderSettings();
    
    expect(screen.getByText('Platform Preferences')).toBeInTheDocument();
  });

  it('renders advanced panel', () => {
    renderSettings();
    
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('renders debug mode toggle', () => {
    renderSettings();
    
    expect(screen.getByLabelText('Enable debug mode')).toBeInTheDocument();
  });

  it('changes theme and calls setTheme', () => {
    renderSettings();
    
    const themeSelect = screen.getByLabelText('Theme selection');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('enables save button when settings change', () => {
    renderSettings();
    
    // Initially disabled
    const saveButton = screen.getByRole('button', { name: /SAVE CHANGES/i });
    expect(saveButton).toBeDisabled();
    
    // Change a setting
    const themeSelect = screen.getByLabelText('Theme selection');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    // Now should be enabled
    expect(saveButton).not.toBeDisabled();
  });

  it('saves settings to localStorage', async () => {
    renderSettings();
    
    // Change a setting
    const themeSelect = screen.getByLabelText('Theme selection');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    // Save
    const saveButton = screen.getByRole('button', { name: /SAVE CHANGES/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      const stored = localStorage.getItem('rwm-settings');
      expect(stored).toBeTruthy();
      if (stored) {
        const parsed = JSON.parse(stored);
        expect(parsed.theme).toBe('dark');
      }
    });
  });

  it('shows saved confirmation message', async () => {
    renderSettings();
    
    // Change a setting
    const themeSelect = screen.getByLabelText('Theme selection');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    // Save
    const saveButton = screen.getByRole('button', { name: /SAVE CHANGES/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Settings saved')).toBeInTheDocument();
      expect(screen.getByLabelText('Checkmark')).toBeInTheDocument();
    });
  });

  it('toggle switches work', () => {
    renderSettings();
    
    const animationsToggle = screen.getByLabelText('Enable animations');
    expect(animationsToggle).toHaveAttribute('aria-checked', 'true');
    
    fireEvent.click(animationsToggle);
    
    expect(animationsToggle).toHaveAttribute('aria-checked', 'false');
  });

  it('resets to defaults', () => {
    renderSettings();
    
    // Change settings
    const themeSelect = screen.getByLabelText('Theme selection');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });
    
    // Reset
    fireEvent.click(screen.getByRole('button', { name: /RESET TO DEFAULTS/i }));
    
    // Theme should be back to light
    expect(themeSelect).toHaveValue('light');
    expect(mockSetTheme).toHaveBeenLastCalledWith('light');
  });
});
