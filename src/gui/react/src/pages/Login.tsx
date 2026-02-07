import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel } from '@/components/layout';
import { Button, HelpText } from '@/components/ui';
import { StatusBadge } from '@/components/shared';
import {
  CursorIcon,
  RobotIcon,
  BrainIcon,
  SparkleIcon,
  ArmIcon,
  PackageIcon,
  LightbulbIcon,
} from '@/components/icons';
import { helpContent } from '@/lib/help-content.js';
import { api, getErrorMessage, LOGOUT_SUPPORTED_PLATFORMS } from '@/lib';
import type { StatusType } from '@/types';

interface PlatformAuthInfo {
  platform: string;
  status: 'authenticated' | 'not_authenticated' | 'failed' | 'skipped';
  details: string;
  fixSuggestion?: string;
  envVar?: string;
  getUrl?: string;
}

interface AuthSummary {
  total: number;
  authenticated: number;
  notAuthenticated: number;
  failed: number;
  skipped: number;
}

interface GitInfo {
  branches: string[];
  remoteName: string;
  remoteUrl: string;
  userName: string;
  userEmail: string;
  currentBranch: string;
}

/** Display names for platform cards (e.g. Copilot → "GitHub Copilot") */
const PLATFORM_DISPLAY_NAMES: Record<string, string> = {
  cursor: 'Cursor',
  codex: 'Codex',
  claude: 'Claude Code',
  gemini: 'Gemini',
  copilot: 'GitHub Copilot',
};

/**
 * Login page - Platform authentication status and CLI-based login
 * Feature parity with CLI `puppet-master login` command
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [platforms, setPlatforms] = useState<PlatformAuthInfo[]>([]);
  const [summary, setSummary] = useState<AuthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<Record<string, boolean>>({});
  const [loggingOut, setLoggingOut] = useState<Record<string, boolean>>({});
  const [loginMessages, setLoginMessages] = useState<Record<string, string>>({});
  const [loginAuthUrls, setLoginAuthUrls] = useState<Record<string, string>>({});
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);
  const [githubAuthStatus, setGithubAuthStatus] = useState<'authenticated' | 'not_authenticated' | null>(null);

  // Fetch auth status on mount
  useEffect(() => {
    fetchAuthStatus();
  }, []);

  // Fetch git info and GitHub auth status on mount
  useEffect(() => {
    const fetchGitInfo = async () => {
      try {
        const data = await api.getGitInfo();
        setGitInfo(data);
      } catch (err) {
        console.error('[Login] Failed to fetch git info:', err);
      }
    };
    const fetchGithubStatus = async () => {
      try {
        const data = await api.getLoginStatusForPlatform('github');
        setGithubAuthStatus(data.status === 'authenticated' ? 'authenticated' : 'not_authenticated');
      } catch {
        setGithubAuthStatus('not_authenticated');
      }
    };
    fetchGitInfo();
    fetchGithubStatus();
  }, []);

  const fetchAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.getLoginStatus();
      setPlatforms(data.platforms || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('[Login] Failed to fetch auth status:', err);
      setError(getErrorMessage(err, 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = useCallback(async (platform: string) => {
    if (!LOGOUT_SUPPORTED_PLATFORMS.includes(platform as typeof LOGOUT_SUPPORTED_PLATFORMS[number])) return;
    try {
      setLoggingOut((prev) => ({ ...prev, [platform]: true }));
      setLoginMessages((prev) => ({ ...prev, [platform]: '' }));
      const result = await api.logoutPlatform(platform);
      if (result.success) {
        setLoginMessages((prev) => ({ ...prev, [platform]: 'Logged out.' }));
        if (platform === 'github') setGithubAuthStatus('not_authenticated');
      } else {
        setLoginMessages((prev) => ({ ...prev, [platform]: `Error: ${result.error ?? 'Logout failed'}` }));
      }
      await fetchAuthStatus();
      if (platform === 'github') {
        const data = await api.getLoginStatusForPlatform('github');
        setGithubAuthStatus(data.status === 'authenticated' ? 'authenticated' : 'not_authenticated');
      }
    } catch (err) {
      setLoginMessages((prev) => ({ ...prev, [platform]: getErrorMessage(err, 'Logout failed') }));
      await fetchAuthStatus();
    } finally {
      setLoggingOut((prev) => ({ ...prev, [platform]: false }));
    }
  }, []);

  const handleLogin = useCallback(async (platform: string) => {
    try {
      setLoggingIn((prev) => ({ ...prev, [platform]: true }));
      setLoginMessages((prev) => ({ ...prev, [platform]: '' }));

      const data = await api.loginPlatform(platform);

      if (data.success) {
        let message = data.message || 'Login initiated';
        if (data.authUrl) {
          message += data.terminalLaunched === false
            ? ' No terminal opened — open the link below in your browser.'
            : ' If the browser doesn\'t open automatically, use the link below.';
        }
        setLoginMessages((prev) => ({ ...prev, [platform]: message }));
        if (data.authUrl) {
          setLoginAuthUrls((prev) => ({ ...prev, [platform]: data.authUrl! }));
        }
        // Auto-refresh status after 5 seconds to check if login succeeded
        setTimeout(async () => {
          await fetchAuthStatus();
          if (platform === 'github') {
            const data = await api.getLoginStatusForPlatform('github');
            setGithubAuthStatus(data.status === 'authenticated' ? 'authenticated' : 'not_authenticated');
          }
        }, 5000);
      } else {
        let errorMsg = `Error: ${data.error || 'Login failed'}`;
        // If CLI not found and authUrl is available, provide manual login option
        if (data.code === 'CLI_NOT_FOUND' && data.getUrl) {
          errorMsg += ` Please visit ${data.getUrl} to authenticate manually.`;
        }
        setLoginMessages((prev) => ({
          ...prev,
          [platform]: errorMsg,
        }));
      }
    } catch (err) {
      console.error(`[Login] Failed to trigger login for ${platform}:`, err);
      setLoginMessages((prev) => ({
        ...prev,
        [platform]: `Error: ${getErrorMessage(err, 'Unknown error')}`,
      }));
    } finally {
      setLoggingIn((prev) => ({ ...prev, [platform]: false }));
    }
  }, [fetchAuthStatus]);

  // Map auth status to StatusType
  const mapStatusToType = (status: string): StatusType => {
    switch (status) {
      case 'authenticated':
        return 'complete';
      case 'not_authenticated':
      case 'failed':
        return 'error';
      case 'skipped':
        return 'pending';
      default:
        return 'pending';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-xl">
        <p className="text-ink-faded">Loading authentication status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h1 className="font-display text-2xl">Platform Authentication</h1>
        <div className="flex gap-sm">
          <Button
            variant="primary"
            onClick={() => navigate('/?platformSetup=1')}
          >
            PLATFORM SETUP
          </Button>
          <Button variant="ghost" onClick={fetchAuthStatus}>
            REFRESH
          </Button>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <Panel title="Authentication Summary">
          <HelpText {...helpContent.login.authenticationSummary} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-md">
            <div className="text-center p-md border-medium border-ink-faded">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-ink-faded">Total Platforms</div>
            </div>
            <div className="text-center p-md border-medium border-neon-green">
              <div className="text-2xl font-bold text-neon-green">{summary.authenticated}</div>
              <div className="text-sm text-ink-faded">Authenticated</div>
            </div>
            <div className="text-center p-md border-medium border-hot-magenta">
              <div className="text-2xl font-bold text-hot-magenta">{summary.notAuthenticated ?? summary.failed ?? 0}</div>
              <div className="text-sm text-ink-faded">Not Authenticated</div>
            </div>
            <div className="text-center p-md border-medium border-ink-faded">
              <div className="text-2xl font-bold text-ink-faded">{summary.skipped}</div>
              <div className="text-sm text-ink-faded">Skipped</div>
            </div>
          </div>
        </Panel>
      )}

      {/* Error display */}
      {error && (
        <div className="p-md border-medium border-hot-magenta bg-hot-magenta/10 text-hot-magenta">
          Error: {error}
        </div>
      )}

      {/* Platforms Grid */}
      <Panel title="Platforms">
        <HelpText {...helpContent.login.platformStatus} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md mt-md">
          {platforms.map((platform) => (
            <PlatformCard
              key={platform.platform}
              platform={platform}
              statusType={mapStatusToType(platform.status)}
              isLoggingIn={!!loggingIn[platform.platform]}
              isLoggingOut={!!loggingOut[platform.platform]}
              loginMessage={loginMessages[platform.platform] || ''}
              loginAuthUrl={loginAuthUrls[platform.platform]}
              onLogin={() => handleLogin(platform.platform)}
              onLogout={() => handleLogout(platform.platform)}
              onRefresh={fetchAuthStatus}
            />
          ))}
        </div>
      </Panel>

      {/* CLI Alternative */}
      <Panel title="CLI Alternative">
        <HelpText {...helpContent.login.cliAlternative} />
        <div className="space-y-md mt-md">
          <p className="text-sm text-ink-faded">
            You can also authenticate using the command line. Each platform has its own login command.
          </p>

          <div className="p-md bg-paper-lined font-mono text-sm space-y-sm">
            <div>
              <div className="text-ink-faded"># Claude Code</div>
              <div className="text-electric-blue">claude setup-token</div>
            </div>
            <div>
              <div className="text-ink-faded"># Codex CLI</div>
              <div className="text-electric-blue">codex login</div>
            </div>
            <div>
              <div className="text-ink-faded"># Gemini CLI</div>
              <div className="text-electric-blue">gemini</div>
            </div>
            <div>
              <div className="text-ink-faded"># GitHub Copilot</div>
              <div className="text-electric-blue">copilot login</div>
            </div>
            <div>
              <div className="text-ink-faded"># GitHub CLI (Git operations)</div>
              <div className="text-electric-blue">gh auth login --web</div>
            </div>
            <div>
              <div className="text-ink-faded"># Cursor (open the app and sign in)</div>
              <div className="text-electric-blue">cursor</div>
            </div>
          </div>

          <div className="space-y-sm">
            <div className="font-semibold text-sm">Verify Your Setup</div>
            <div className="p-md bg-paper-lined font-mono text-sm space-y-xs">
              <div className="text-ink-faded"># Check which platforms are authenticated</div>
              <div className="text-electric-blue">puppet-master doctor</div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Git Configuration */}
      <Panel title="Git Configuration">
        <div className="space-y-md mt-md">
          <p className="text-sm text-ink-faded">
            Git identity and remote configuration for this repository.
          </p>

          {/* GitHub (Git) login - for Git config, not Copilot */}
          <div className="p-md border-medium border-ink-faded rounded flex flex-wrap items-center justify-between gap-md">
            <div>
              <div className="font-semibold text-sm">GitHub (Git)</div>
              <p className="text-xs text-ink-faded mt-xs">
                Sign in with GitHub via <span className="font-mono">gh auth login</span> to enable Git operations and push/pull.
              </p>
              {githubAuthStatus === 'not_authenticated' && (
                <p className="text-xs text-ink-faded mt-xs">
                  If Login fails, ensure GitHub CLI is installed and in your PATH. Install from{' '}
                  <a href="https://cli.github.com/" target="_blank" rel="noopener noreferrer" className="text-electric-blue underline hover:no-underline">cli.github.com</a> then try again.
                </p>
              )}
              {loginMessages['github'] && (
                <div className={`text-xs mt-xs space-y-xs ${loginMessages['github'].startsWith('Error') ? 'text-hot-magenta' : 'text-neon-green'}`}>
                  <div>{loginMessages['github']}</div>
                  {loginAuthUrls['github'] && (
                    <div className="flex flex-wrap items-center gap-xs">
                      <a
                        href={loginAuthUrls['github']}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-electric-blue underline hover:no-underline"
                      >
                        Open in browser
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const url = loginAuthUrls['github'];
                          if (url) void navigator.clipboard.writeText(url);
                        }}
                      >
                        Copy link
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-xs flex-wrap">
              {githubAuthStatus === 'authenticated' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLogout('github')}
                  disabled={!!loggingOut['github']}
                >
                  {loggingOut['github'] ? 'LOGGING OUT...' : 'LOG OUT'}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLogin('github')}
                  disabled={!!loggingIn['github']}
                >
                  {loggingIn['github'] ? 'LOGGING IN...' : 'LOGIN TO GITHUB'}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-ink-faded mt-xs">
            The same GitHub account is used for GitHub Copilot; ensure your token has <strong>Copilot Requests</strong> scope if you use Copilot.
          </p>

          {gitInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {gitInfo.userName && (
                <div className="p-md border-medium border-ink-faded">
                  <div className="text-xs text-ink-faded uppercase tracking-wide mb-xs">Git User</div>
                  <div className="font-mono text-sm">{gitInfo.userName}</div>
                </div>
              )}
              {gitInfo.userEmail && (
                <div className="p-md border-medium border-ink-faded">
                  <div className="text-xs text-ink-faded uppercase tracking-wide mb-xs">Git Email</div>
                  <div className="font-mono text-sm">{gitInfo.userEmail}</div>
                </div>
              )}
              {gitInfo.remoteUrl && (
                <div className="p-md border-medium border-ink-faded md:col-span-2">
                  <div className="text-xs text-ink-faded uppercase tracking-wide mb-xs">Remote URL</div>
                  <div className="font-mono text-sm break-all">{gitInfo.remoteUrl}</div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-faded">Loading git information...</p>
          )}

          <div className="p-sm bg-electric-blue/10 border-medium border-electric-blue text-sm">
            <strong>Note: </strong>
            Git authentication is managed through your system git credential helper
            (e.g. <span className="font-mono">git credential-store</span>, <span className="font-mono">git credential-cache</span>,
            or platform-specific helpers like GitHub CLI). Configure it via <span className="font-mono">git config credential.helper</span>.
          </div>
        </div>
      </Panel>
    </div>
  );
}

// ============================================
// Sub-components
// ============================================

interface PlatformCardProps {
  platform: PlatformAuthInfo;
  statusType: StatusType;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  loginMessage: string;
  loginAuthUrl?: string;
  onLogin: () => void;
  onLogout: () => void;
  onRefresh: () => void;
}

function PlatformCard({ platform, statusType, isLoggingIn, isLoggingOut, loginMessage, loginAuthUrl, onLogin, onLogout, onRefresh }: PlatformCardProps) {
  // Platform icons
  const platformIcons: Record<string, ReactNode> = {
    cursor: <CursorIcon size="1.5em" />,
    codex: <RobotIcon size="1.5em" />,
    claude: <BrainIcon size="1.5em" />,
    gemini: <SparkleIcon size="1.5em" />,
    copilot: <ArmIcon size="1.5em" />,
  };

  const icon = platformIcons[platform.platform] || <PackageIcon size="1.5em" />;
  const isCursor = platform.platform === 'cursor';
  const canLogout = platform.status === 'authenticated' && LOGOUT_SUPPORTED_PLATFORMS.includes(platform.platform as typeof LOGOUT_SUPPORTED_PLATFORMS[number]);

  return (
    <div
      className="p-md border-medium transition-colors border-ink-faded hover:border-electric-blue"
    >
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <span className="flex items-center">{icon}</span>
          <span className="font-semibold">
            {PLATFORM_DISPLAY_NAMES[platform.platform] ?? platform.platform}
          </span>
        </div>
        <StatusBadge status={statusType} size="sm" />
      </div>

      <p className="text-sm text-ink-faded mb-md line-clamp-2">
        {platform.details}
      </p>

      {(platform.status === 'not_authenticated' || platform.status === 'failed') && platform.fixSuggestion && (
        <p className="text-xs text-hot-magenta mb-md flex items-center gap-xs">
          <LightbulbIcon size="1em" />
          {platform.fixSuggestion}
        </p>
      )}

      {/* Login message / spinner */}
      {isLoggingIn && (
        <div className="text-sm text-electric-blue mb-md animate-pulse">
          Opening browser for login... This may take a few moments.
        </div>
      )}
      {loginMessage && !isLoggingIn && (
        <div className={`text-xs mb-md space-y-xs ${loginMessage.startsWith('Error') ? 'text-hot-magenta' : 'text-neon-green'}`}>
          <div>{loginMessage}</div>
          {loginAuthUrl && (
            <div className="flex flex-wrap items-center gap-xs">
              <a
                href={loginAuthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-electric-blue underline hover:no-underline"
              >
                Open in browser
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigator.clipboard.writeText(loginAuthUrl)}
              >
                Copy link
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-xs flex-wrap">
        {platform.status !== 'authenticated' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogin}
            disabled={isLoggingIn}
          >
            {isLoggingIn
              ? 'LOGGING IN...'
              : isCursor
                ? 'OPEN CURSOR APP'
                : 'LOGIN'}
          </Button>
        )}
        {canLogout && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'LOGGING OUT...' : 'LOG OUT'}
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          REFRESH
        </Button>
      </div>
    </div>
  );
}
