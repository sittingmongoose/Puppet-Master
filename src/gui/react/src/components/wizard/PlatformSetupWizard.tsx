/**
 * Platform Setup Wizard Component
 *
 * First boot wizard that allows users to:
 * - See which platforms are installed
 * - Select which platforms to use
 * - Install missing platforms
 * - Login / authenticate to selected platforms
 */

import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui';
import { Button } from '@/components/ui';
import { Checkbox } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import { api, getErrorMessage, type PlatformStatusType } from '@/lib';
import type { Platform } from '@/types';
import type { PlatformAuthInfo, InstallPlatformResult } from '@/lib/api';

/** Build user-visible message from install API failure (error, output, code). */
function formatInstallError(result: InstallPlatformResult, platformName: string): string {
  const parts: string[] = [result.error ?? `Failed to install ${platformName}`];
  if (result.code) parts.push(`(${result.code})`);
  if (result.output?.trim()) parts.push('\n' + result.output.trim());
  return parts.join(' ');
}

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

/** Wizard step type */
type WizardStep = 'install' | 'auth';

interface PlatformSetupWizardProps {
  /** Whether the wizard is open */
  isOpen: boolean;
  /** Callback when wizard is completed */
  onComplete: () => void;
  /** Callback when wizard is skipped */
  onSkip: () => void;
  /** Connection error from first-boot check (e.g. server not ready); show message and Retry */
  connectionError?: string | null;
  /** Callback to retry first-boot check (e.g. after server becomes ready) */
  onRetryConnection?: () => void;
}

/**
 * Platform Setup Wizard
 */
export function PlatformSetupWizard({
  isOpen,
  onComplete,
  onSkip,
  connectionError,
  onRetryConnection,
}: PlatformSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>('install');
  const [platforms, setPlatforms] = useState<Record<string, PlatformStatusType>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [installing, setInstalling] = useState<string | null>(null);
  const [installingAll, setInstallingAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Auth step state
  const [authStatuses, setAuthStatuses] = useState<Record<string, PlatformAuthInfo>>({});
  const [authLoading, setAuthLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [skippedAuths, setSkippedAuths] = useState<Set<string>>(new Set());

  // Load platform status on mount
  useEffect(() => {
    if (isOpen) {
      loadPlatformStatus();
    }
  }, [isOpen]);

  const loadPlatformStatus = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      const status = await api.getPlatformStatus(forceRefresh);
      setPlatforms(status.platforms);

      // Pre-select installed platforms
      const installed = status.installedPlatforms as Platform[];
      setSelectedPlatforms(installed);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load platform status'));
    } finally {
      setLoading(false);
    }
  };

  const loadAuthStatus = useCallback(async () => {
    try {
      setAuthLoading(true);
      setError(null);
      const result = await api.getLoginStatus();
      const statusMap: Record<string, PlatformAuthInfo> = {};
      for (const info of result.platforms) {
        statusMap[info.platform] = info;
      }
      setAuthStatuses(statusMap);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load auth status'));
    } finally {
      setAuthLoading(false);
    }
  }, []);

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
        // Auto-select the newly installed platform
        if (!selectedPlatforms.includes(platform)) {
          setSelectedPlatforms((prev) => [...prev, platform]);
        }
      } else {
        setError(formatInstallError(result, PLATFORM_NAMES[platform]));
      }
    } catch (err) {
      setError(getErrorMessage(err, `Failed to install ${PLATFORM_NAMES[platform]}`));
    } finally {
      // Always refresh status so badges reflect current state (success or failure)
      await loadPlatformStatus(true);
      setInstalling(null);
    }
  };

  const handleInstallAllMissing = async () => {
    const missing = allPlatforms.filter((p) => !(platforms[p]?.installed));
    if (missing.length === 0) return;

    setInstallingAll(true);
    setError(null);
    const errors: string[] = [];

    for (const platform of missing) {
      setInstalling(platform);
      try {
        const result = await api.installPlatform(platform);
        if (!result.success) {
          errors.push(`${PLATFORM_NAMES[platform]}: ${formatInstallError(result, PLATFORM_NAMES[platform])}`);
        }
      } catch (err) {
        errors.push(`${PLATFORM_NAMES[platform]}: ${getErrorMessage(err, 'failed')}`);
      }
      setInstalling(null);
    }

    // Reload status after all installs so badges reflect current state
    await loadPlatformStatus(true);
    setInstallingAll(false);

    if (errors.length > 0) {
      setError(`Some installs failed:\n${errors.join('\n')}`);
    }
  };

  const handleNextToAuth = async () => {
    if (selectedPlatforms.length === 0) {
      setError('Please select at least one platform to continue');
      return;
    }
    setError(null);
    setStep('auth');
    await loadAuthStatus();
  };

  const handleBackToInstall = () => {
    setError(null);
    setStep('install');
  };

  const handleLogin = async (platform: Platform) => {
    try {
      setLoggingIn(platform);
      setError(null);
      const result = await api.loginPlatform(platform);
      if (result.success) {
        // Show success message with URL if provided
        let message = result.message || 'Login initiated';
        const responseData = result as { message?: string; authUrl?: string };
        if (responseData.authUrl) {
          message += ` If the browser doesn't open, visit: ${responseData.authUrl}`;
        }
        setError(null); // Clear any previous errors
        
        // Refresh auth status after 5 seconds to check if login succeeded
        setTimeout(() => {
          loadAuthStatus();
        }, 5000);
      } else {
        setError(result.message || `Login failed for ${PLATFORM_NAMES[platform]}`);
      }
    } catch (err) {
      setError(getErrorMessage(err, `Login failed for ${PLATFORM_NAMES[platform]}`));
    } finally {
      setLoggingIn(null);
    }
  };

  const handleSkipAuth = (platform: string) => {
    setSkippedAuths((prev) => {
      const next = new Set(prev);
      next.add(platform);
      return next;
    });
  };

  const handleSkipAllAuth = async () => {
    // Skip all and save platforms
    await handleSaveAndComplete();
  };

  const handleSaveAndComplete = async () => {
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
      setError(getErrorMessage(err, 'Failed to save platform selections'));
    } finally {
      setSaving(false);
    }
  };

  const allPlatforms: Platform[] = ['cursor', 'codex', 'claude', 'gemini', 'copilot'];

  /**
   * Map PlatformAuthInfo status to StatusBadge status type
   */
  const getAuthBadgeProps = (platform: string): { status: 'complete' | 'error' | 'pending' | 'idle'; label: string } => {
    if (skippedAuths.has(platform)) {
      return { status: 'idle', label: 'Skipped' };
    }
    const info = authStatuses[platform];
    if (!info) {
      return { status: 'pending', label: 'Unknown' };
    }
    switch (info.status) {
      case 'authenticated':
        return { status: 'complete', label: 'Authenticated' };
      case 'not_authenticated':
        return { status: 'error', label: 'Not Authenticated' };
      case 'failed':
        return { status: 'error', label: 'Failed' };
      case 'skipped':
        return { status: 'idle', label: 'Skipped' };
      default:
        return { status: 'pending', label: 'Unknown' };
    }
  };

  // Determine if at least one selected platform is authenticated or skipped (for CONTINUE enablement)
  const hasAtLeastOneReady = selectedPlatforms.some((platform) => {
    if (skippedAuths.has(platform)) return true;
    return authStatuses[platform]?.status === 'authenticated';
  });

  // ==========================================
  // Footer per step
  // ==========================================
  const renderFooter = () => {
    if (step === 'install') {
      return (
        <div className="flex gap-sm">
          <Button variant="ghost" onClick={onSkip} disabled={saving}>
            SKIP
          </Button>
          <Button
            variant="primary"
            onClick={handleNextToAuth}
            disabled={selectedPlatforms.length === 0}
          >
            NEXT: LOGIN
          </Button>
        </div>
      );
    }

    // Auth step footer
    return (
      <div className="flex gap-sm">
        <Button variant="ghost" onClick={handleBackToInstall} disabled={saving || loggingIn !== null}>
          BACK
        </Button>
        <Button variant="ghost" onClick={handleSkipAllAuth} disabled={saving} loading={saving}>
          SKIP ALL
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveAndComplete}
          loading={saving}
          disabled={!hasAtLeastOneReady}
        >
          CONTINUE
        </Button>
      </div>
    );
  };

  // ==========================================
  // Install Step Content
  // ==========================================
  const renderInstallStep = () => (
    <div className="space-y-lg">
      <div>
        <p className="text-ink-faded mb-md">
          Select which AI platforms you want to use with Puppet Master. You can install missing platforms now or skip and install them later.
        </p>
      </div>

      {connectionError && (
        <div className="p-md bg-hot-magenta/10 border-medium border-hot-magenta text-hot-magenta flex flex-col gap-sm">
          <span style={{ whiteSpace: 'pre-line' }}>{connectionError}</span>
          {onRetryConnection && (
            <Button variant="primary" onClick={onRetryConnection}>
              Retry
            </Button>
          )}
        </div>
      )}

      {error && (
        <div className="p-md bg-hot-magenta/10 border-medium border-hot-magenta text-hot-magenta" style={{ whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-xl">
          <p className="text-ink-faded">Checking platform status...</p>
        </div>
      ) : (
        <>
          {allPlatforms.some((p) => !(platforms[p]?.installed)) && (
            <div className="flex justify-end">
              <Button
                variant="info"
                size="sm"
                onClick={handleInstallAllMissing}
                loading={installingAll}
                disabled={installingAll || installing !== null}
              >
                INSTALL ALL MISSING
              </Button>
            </div>
          )}
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
        </>
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
  );

  // ==========================================
  // Auth Step Content
  // ==========================================
  const renderAuthStep = () => (
    <div className="space-y-lg">
      <div>
        <p className="text-ink-faded mb-md">
          Log in to your selected platforms. You can skip any platform and log in later from the Config page.
        </p>
      </div>

      {error && (
        <div className="p-md bg-hot-magenta/10 border-medium border-hot-magenta text-hot-magenta" style={{ whiteSpace: 'pre-line' }}>
          {error}
        </div>
      )}

      {authLoading ? (
        <div className="text-center py-xl">
          <p className="text-ink-faded">Checking authentication status...</p>
        </div>
      ) : (
        <div className="space-y-md">
          {selectedPlatforms.map((platform) => {
            const badge = getAuthBadgeProps(platform);
            const isLoggingIn = loggingIn === platform;
            const isSkipped = skippedAuths.has(platform);
            const isAuthenticated = authStatuses[platform]?.status === 'authenticated';
            const authInfo = authStatuses[platform];
            const isCursor = platform === 'cursor';

            return (
              <div
                key={platform}
                className={`
                  p-md border-medium rounded
                  ${isAuthenticated ? 'border-electric-blue bg-electric-blue/5' : isSkipped ? 'border-ink-faded opacity-60' : 'border-ink-faded'}
                `}
              >
                <div className="flex items-start justify-between gap-md">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-xs">
                      <span className="font-bold text-lg">
                        {PLATFORM_NAMES[platform]}
                      </span>
                      <StatusBadge
                        status={badge.status}
                        size="sm"
                        showLabel
                        label={badge.label}
                      />
                    </div>
                    {authInfo?.details && (
                      <p className="text-sm text-ink-faded ml-0 mt-xs">
                        {authInfo.details}
                      </p>
                    )}
                    {authInfo?.fixSuggestion && authInfo.status !== 'authenticated' && !isSkipped && (
                      <p className="text-sm text-electric-blue ml-0 mt-xs">
                        {authInfo.fixSuggestion}
                      </p>
                    )}
                    {isLoggingIn && (
                      <p className="text-sm text-ink-faded ml-0 mt-xs animate-pulse">
                        Opening browser for login... This may take a few moments.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-sm">
                    {!isAuthenticated && !isSkipped && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSkipAuth(platform)}
                          disabled={isLoggingIn}
                        >
                          SKIP
                        </Button>
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => handleLogin(platform)}
                          loading={isLoggingIn}
                          disabled={isLoggingIn}
                        >
                          {isCursor ? 'OPEN CURSOR APP' : 'LOGIN'}
                        </Button>
                      </>
                    )}
                    {isAuthenticated && (
                      <span className="text-sm font-semibold text-status-complete">Ready</span>
                    )}
                    {isSkipped && (
                      <span className="text-sm text-ink-faded">Skipped</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!selectedPlatforms.includes('copilot') && (
            <div className="p-md border-medium rounded border-ink-faded">
              <div className="flex items-start justify-between gap-md">
                <div className="flex-1">
                  <div className="flex items-center gap-sm mb-xs">
                    <span className="font-bold text-lg">GitHub Copilot</span>
                    {(() => {
                      const badge = getAuthBadgeProps('copilot');
                      return (
                        <StatusBadge
                          status={badge.status}
                          size="sm"
                          showLabel
                          label={badge.label}
                        />
                      );
                    })()}
                  </div>
                  <p className="text-sm text-ink-faded mt-xs">
                    Sign in with GitHub (via <span className="font-mono">gh auth login</span>) to use the GitHub Copilot CLI. The same account is used for Git operations; ensure your token has Copilot scope if you use Copilot.
                  </p>
                </div>
                <div className="flex items-center gap-sm">
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleLogin('copilot')}
                    loading={loggingIn === 'copilot'}
                    disabled={loggingIn === 'copilot'}
                  >
                    LOGIN
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onSkip}
      title={step === 'install' ? 'Platform Setup' : 'Platform Login'}
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
      footer={renderFooter()}
    >
      <div className="pr-sm">
        {step === 'install' ? renderInstallStep() : renderAuthStep()}
      </div>
    </Modal>
  );
}
