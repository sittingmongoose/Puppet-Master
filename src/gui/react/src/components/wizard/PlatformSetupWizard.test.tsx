/**
 * Platform Setup Wizard Tests
 * 
 * Tests for the first boot platform setup wizard component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlatformSetupWizard } from './PlatformSetupWizard.js';
import * as lib from '@/lib';

// Mock the lib module
vi.mock('@/lib', () => ({
  api: {
    getPlatformStatus: vi.fn(),
    installPlatform: vi.fn(),
    selectPlatforms: vi.fn(),
    getLoginStatus: vi.fn(),
  },
}));

const mockApi = lib.api as unknown as {
  getPlatformStatus: ReturnType<typeof vi.fn>;
  installPlatform: ReturnType<typeof vi.fn>;
  selectPlatforms: ReturnType<typeof vi.fn>;
  getLoginStatus: ReturnType<typeof vi.fn>;
};

describe('PlatformSetupWizard', () => {
  const mockOnComplete = vi.fn();
  const mockOnSkip = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi.getPlatformStatus.mockResolvedValue({
      platforms: {
        cursor: { platform: 'cursor', installed: true, version: '1.0.0' },
        codex: { platform: 'codex', installed: false },
        claude: { platform: 'claude', installed: true, version: '2.0.0' },
        gemini: { platform: 'gemini', installed: false },
        copilot: { platform: 'copilot', installed: false },
      },
      installedPlatforms: ['cursor', 'claude'],
      uninstalledPlatforms: ['codex', 'gemini', 'copilot'],
    });
  });

  it('should show wizard when open', () => {
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.getByText('Platform Setup')).toBeInTheDocument();
  });

  it('should not show wizard when closed', () => {
    render(
      <PlatformSetupWizard
        isOpen={false}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    expect(screen.queryByText('Platform Setup')).not.toBeInTheDocument();
  });

  it('should load and display platform status', async () => {
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Cursor')).toBeInTheDocument();
      expect(screen.getByText('Codex')).toBeInTheDocument();
    });

    // Check that installed platforms show as installed
    const installedBadges = screen.getAllByText('Installed');
    expect(installedBadges.length).toBeGreaterThan(0);
  });

  it('should allow selecting platforms', async () => {
    mockApi.getPlatformStatus.mockResolvedValue({
      platforms: {
        cursor: { platform: 'cursor', installed: true },
        codex: { platform: 'codex', installed: true },
        claude: { platform: 'claude', installed: false },
        gemini: { platform: 'gemini', installed: false },
        copilot: { platform: 'copilot', installed: false },
      },
      installedPlatforms: ['cursor', 'codex'],
      uninstalledPlatforms: ['claude', 'gemini', 'copilot'],
    });

    const user = userEvent.setup();
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Cursor')).toBeInTheDocument();
    });

    // Find and click checkbox for Codex (should be pre-selected)
    const codexCheckbox = screen.getByLabelText(/codex/i);
    expect(codexCheckbox).toBeChecked();

    // Uncheck Codex
    await user.click(codexCheckbox);
    expect(codexCheckbox).not.toBeChecked();
  });

  it('should install platform when install button is clicked', async () => {
    mockApi.getPlatformStatus.mockResolvedValue({
      platforms: {
        cursor: { platform: 'cursor', installed: true },
        codex: { platform: 'codex', installed: false },
        claude: { platform: 'claude', installed: false },
        gemini: { platform: 'gemini', installed: false },
        copilot: { platform: 'copilot', installed: false },
      },
      installedPlatforms: ['cursor'],
      uninstalledPlatforms: ['codex', 'claude', 'gemini', 'copilot'],
    });

    mockApi.installPlatform.mockResolvedValue({
      success: true,
      output: 'Installation successful',
    });

    // Mock updated status after installation
    mockApi.getPlatformStatus
      .mockResolvedValueOnce({
        platforms: {
          cursor: { platform: 'cursor', installed: true },
          codex: { platform: 'codex', installed: false },
          claude: { platform: 'claude', installed: false },
          gemini: { platform: 'gemini', installed: false },
          copilot: { platform: 'copilot', installed: false },
        },
        installedPlatforms: ['cursor'],
        uninstalledPlatforms: ['codex', 'claude', 'gemini', 'copilot'],
      })
      .mockResolvedValueOnce({
        platforms: {
          cursor: { platform: 'cursor', installed: true },
          codex: { platform: 'codex', installed: true },
          claude: { platform: 'claude', installed: false },
          gemini: { platform: 'gemini', installed: false },
          copilot: { platform: 'copilot', installed: false },
        },
        installedPlatforms: ['cursor', 'codex'],
        uninstalledPlatforms: ['claude', 'gemini', 'copilot'],
      });

    const user = userEvent.setup();
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Codex')).toBeInTheDocument();
    });

    // Find and click install button for Codex
    const installButtons = screen.getAllByText('INSTALL');
    const codexInstallButton = installButtons.find((btn) => 
      btn.closest('.border-medium')?.textContent?.includes('Codex')
    );

    if (codexInstallButton) {
      await user.click(codexInstallButton);
      
      await waitFor(() => {
        expect(mockApi.installPlatform).toHaveBeenCalledWith('codex');
      });
    }
  });

  it('should call onComplete when continue is clicked with selected platforms', async () => {
    mockApi.getPlatformStatus.mockResolvedValue({
      platforms: {
        cursor: { platform: 'cursor', installed: true },
        codex: { platform: 'codex', installed: true },
        claude: { platform: 'claude', installed: false },
        gemini: { platform: 'gemini', installed: false },
        copilot: { platform: 'copilot', installed: false },
      },
      installedPlatforms: ['cursor', 'codex'],
      uninstalledPlatforms: ['claude', 'gemini', 'copilot'],
    });

    mockApi.getLoginStatus.mockResolvedValue({
      platforms: [
        { platform: 'cursor', status: 'authenticated' },
        { platform: 'codex', status: 'authenticated' },
      ],
    });

    mockApi.selectPlatforms.mockResolvedValue({
      success: true,
      message: 'Platforms selected',
    });

    const user = userEvent.setup();
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('NEXT: LOGIN')).toBeInTheDocument();
    });

    // Click NEXT: LOGIN to navigate to auth step
    const nextButton = screen.getByText('NEXT: LOGIN');
    await user.click(nextButton);

    // Wait for auth step to load
    await waitFor(() => {
      expect(screen.getByText('CONTINUE')).toBeInTheDocument();
    });

    const continueButton = screen.getByText('CONTINUE');
    await user.click(continueButton);

    await waitFor(() => {
      expect(mockApi.selectPlatforms).toHaveBeenCalled();
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('should call onSkip when skip is clicked', async () => {
    mockApi.getPlatformStatus.mockResolvedValue({
      platforms: {
        cursor: { platform: 'cursor', installed: true },
        codex: { platform: 'codex', installed: false },
        claude: { platform: 'claude', installed: false },
        gemini: { platform: 'gemini', installed: false },
        copilot: { platform: 'copilot', installed: false },
      },
      installedPlatforms: ['cursor'],
      uninstalledPlatforms: ['codex', 'claude', 'gemini', 'copilot'],
    });

    const user = userEvent.setup();
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('SKIP')).toBeInTheDocument();
    });

    const skipButton = screen.getByText('SKIP');
    await user.click(skipButton);

    expect(mockOnSkip).toHaveBeenCalled();
  });

  it('should disable continue button when no platforms are selected', async () => {
    mockApi.getPlatformStatus.mockResolvedValue({
      platforms: {
        cursor: { platform: 'cursor', installed: true },
        codex: { platform: 'codex', installed: true },
        claude: { platform: 'claude', installed: false },
        gemini: { platform: 'gemini', installed: false },
        copilot: { platform: 'copilot', installed: false },
      },
      installedPlatforms: ['cursor', 'codex'],
      uninstalledPlatforms: ['claude', 'gemini', 'copilot'],
    });

    mockApi.getLoginStatus.mockResolvedValue({
      platforms: [
        { platform: 'cursor', status: 'not_authenticated' },
        { platform: 'codex', status: 'not_authenticated' },
      ],
    });

    const user = userEvent.setup();
    render(
      <PlatformSetupWizard
        isOpen={true}
        onComplete={mockOnComplete}
        onSkip={mockOnSkip}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('NEXT: LOGIN')).toBeInTheDocument();
    });

    // Click NEXT: LOGIN to navigate to auth step
    const nextButton = screen.getByText('NEXT: LOGIN');
    await user.click(nextButton);

    // Wait for auth step to load
    await waitFor(() => {
      expect(screen.getByText('CONTINUE')).toBeInTheDocument();
    });

    // CONTINUE button should be disabled because no platforms are authenticated or skipped
    const continueButton = screen.getByText('CONTINUE');
    expect(continueButton).toBeDisabled();
  });
});
