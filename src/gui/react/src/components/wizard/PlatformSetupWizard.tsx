/**
 * Platform Setup Wizard Component
 * 
 * First boot wizard that allows users to:
 * - See which platforms are installed
 * - Select which platforms to use
 * - Install missing platforms
 */

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { api, type PlatformStatusType } from '@/lib';
import type { Platform } from '@/types';

/**
 * Platform display names
 */
const PLATFORM_NAMES: Record<Platform, string> = {
  cursor: 'Cursor',
  codex: 'Codex',
  claude: 'Claude Code',
  gemini: 'Gemini',
  copilot: 'GitHub Copilot',
};

/**
 * Platform descriptions
 */
const PLATFORM_DESCRIPTIONS: Record<Platform, string> = {
  cursor: 'Cursor Agent CLI for AI-assisted development',
  codex: 'OpenAI Codex CLI for code generation',
  claude: 'Anthropic Claude Code CLI for AI coding assistance',
  gemini: 'Google Gemini CLI for AI development',
  copilot: 'GitHub Copilot SDK for AI pair programming',
};

interface PlatformSetupWizardProps {
  /** Whether the wizard is open */
  isOpen: boolean;
  /** Callback when wizard is completed */
  onComplete: () => void;
  /** Callback when wizard is skipped */
  onSkip: () => void;
}

/**
 * Platform Setup Wizard
 */
export function PlatformSetupWizard({ isOpen, onComplete, onSkip }: PlatformSetupWizardProps) {
  const [platforms, setPlatforms] = useState<Record<string, PlatformStatusType>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Load platform status on mount
  useEffect(() => {
    if (isOpen) {
      loadPlatformStatus();
    }
  }, [isOpen]);

  const loadPlatformStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = await api.getPlatformStatus();
      setPlatforms(status.platforms);
      
      // Pre-select installed platforms
      const installed = status.installedPlatforms as Platform[];
      setSelectedPlatforms(installed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform status');
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        return prev.filter((p) => p !== platform);
      } else {
        return [...prev, platform];
      }
    });
  };

  const handleInstall = async (platform: Platform) => {
    try {
      setInstalling(platform);
      setError(null);
      const result = await api.installPlatform(platform);
      
      if (result.success) {
        // Reload platform status after installation
        await loadPlatformStatus();
        // Auto-select the newly installed platform
        if (!selectedPlatforms.includes(platform)) {
          setSelectedPlatforms((prev) => [...prev, platform]);
        }
      } else {
        setError(result.error || `Failed to install ${PLATFORM_NAMES[platform]}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to install ${PLATFORM_NAMES[platform]}`);
    } finally {
      setInstalling(null);
    }
  };

  const handleContinue = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform to use');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.selectPlatforms(selectedPlatforms);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save platform selections');
    } finally {
      setSaving(false);
    }
  };

  const allPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onSkip}
      title="Platform Setup"
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
      footer={
        <div className="flex gap-sm">
          <Button variant="ghost" onClick={onSkip} disabled={saving}>
            SKIP
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            loading={saving}
            disabled={selectedPlatforms.length === 0}
          >
            CONTINUE
          </Button>
        </div>
      }
    >
      <div className="space-y-lg">
        <div>
          <p className="text-ink-faded mb-md">
            Select which AI platforms you want to use with Puppet Master. You can install missing platforms now or skip and install them later.
          </p>
        </div>

        {error && (
          <div className="p-md bg-hot-magenta/10 border-medium border-hot-magenta text-hot-magenta">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-xl">
            <p className="text-ink-faded">Checking platform status...</p>
          </div>
        ) : (
          <div className="space-y-md">
            {allPlatforms.map((platform) => {
              const status = platforms[platform];
              const isInstalled = status?.installed ?? false;
              const isSelected = selectedPlatforms.includes(platform);
              const isInstalling = installing === platform;

              return (
                <div
                  key={platform}
                  className={`
                    p-md border-medium rounded
                    ${isSelected ? 'border-electric-blue bg-electric-blue/5' : 'border-ink-faded'}
                  `}
                >
                  <div className="flex items-start justify-between gap-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-sm mb-xs">
                        <Checkbox
                          id={`platform-${platform}`}
                          checked={isSelected}
                          onChange={() => handlePlatformToggle(platform)}
                          disabled={!isInstalled && !isInstalling}
                        />
                        <label
                          htmlFor={`platform-${platform}`}
                          className="font-bold text-lg cursor-pointer"
                        >
                          {PLATFORM_NAMES[platform]}
                        </label>
                        <StatusBadge
                          status={isInstalled ? 'complete' : 'error'}
                          size="sm"
                          showLabel
                          label={isInstalled ? 'Installed' : 'Not Installed'}
                        />
                        {status?.version && (
                          <span className="text-sm text-ink-faded">v{status.version}</span>
                        )}
                      </div>
                      <p className="text-sm text-ink-faded ml-lg">
                        {PLATFORM_DESCRIPTIONS[platform]}
                      </p>
                      {status?.error && !isInstalled && (
                        <p className="text-sm text-hot-magenta ml-lg mt-xs">
                          {status.error}
                        </p>
                      )}
                    </div>
                    {!isInstalled && (
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleInstall(platform)}
                        loading={isInstalling}
                        disabled={isInstalling || installing !== null}
                      >
                        INSTALL
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {selectedPlatforms.length > 0 && (
          <div className="p-md bg-electric-blue/10 border-medium border-electric-blue rounded">
            <p className="text-sm font-semibold mb-xs">
              Selected platforms: {selectedPlatforms.map((p) => PLATFORM_NAMES[p]).join(', ')}
            </p>
            <p className="text-xs text-ink-faded">
              These platforms will be used for execution. You can change this later in the Config page.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
