import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
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
import { getErrorMessage } from '@/lib';
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

/**
 * Login page - Platform authentication status and CLI-based login
 * Feature parity with CLI `puppet-master login` command
 */
export default function LoginPage() {
  const [platforms, setPlatforms] = useState<PlatformAuthInfo[]>([]);
  const [summary, setSummary] = useState<AuthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState<Record<string, boolean>>({});
  const [loginMessages, setLoginMessages] = useState<Record<string, string>>({});
  const [gitInfo, setGitInfo] = useState<GitInfo | null>(null);

  // Fetch auth status on mount
  useEffect(() => {
    fetchAuthStatus();
  }, []);

  // Fetch git info on mount
  useEffect(() => {
    const fetchGitInfo = async () => {
      try {
        const response = await fetch('/api/config/git-info');
        if (response.ok) {
          const data = await response.json();
          setGitInfo(data);
        }
      } catch (err) {
        console.error('[Login] Failed to fetch git info:', err);
      }
    };
    fetchGitInfo();
  }, []);

  const fetchAuthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/login/status');
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to fetch auth status');
      }

      const data = await response.json();
      setPlatforms(data.platforms || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('[Login] Failed to fetch auth status:', err);
      setError(getErrorMessage(err, 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = useCallback(async (platform: string) => {
    try {
      setLoggingIn((prev) => ({ ...prev, [platform]: true }));
      setLoginMessages((prev) => ({ ...prev, [platform]: '' }));

      const response = await fetch(`/api/login/${encodeURIComponent(platform)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.success) {
        setLoginMessages((prev) => ({ ...prev, [platform]: data.message }));
      } else {
        setLoginMessages((prev) => ({
          ...prev,
          [platform]: `Error: ${data.error || 'Login failed'}`,
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
  }, []);

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
        <Button variant="ghost" onClick={fetchAuthStatus}>
          REFRESH
        </Button>
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
              loginMessage={loginMessages[platform.platform] || ''}
              onLogin={() => handleLogin(platform.platform)}
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
              <div className="text-electric-blue">claude login</div>
            </div>
            <div>
              <div className="text-ink-faded"># Codex CLI</div>
              <div className="text-electric-blue">codex login</div>
            </div>
            <div>
              <div className="text-ink-faded"># Gemini CLI</div>
              <div className="text-electric-blue">gemini auth login</div>
            </div>
            <div>
              <div className="text-ink-faded"># GitHub Copilot (via gh CLI)</div>
              <div className="text-electric-blue">gh auth login --web -p https</div>
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
  loginMessage: string;
  onLogin: () => void;
  onRefresh: () => void;
}

function PlatformCard({ platform, statusType, isLoggingIn, loginMessage, onLogin, onRefresh }: PlatformCardProps) {
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

  return (
    <div
      className="p-md border-medium transition-colors border-ink-faded hover:border-electric-blue"
    >
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <span className="flex items-center">{icon}</span>
          <span className="font-semibold uppercase">{platform.platform}</span>
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
          Logging in... check your browser
        </div>
      )}
      {loginMessage && !isLoggingIn && (
        <div className={`text-xs mb-md ${loginMessage.startsWith('Error') ? 'text-hot-magenta' : 'text-neon-green'}`}>
          {loginMessage}
        </div>
      )}

      <div className="flex gap-xs">
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
        <Button variant="ghost" size="sm" onClick={onRefresh}>
          REFRESH
        </Button>
      </div>
    </div>
  );
}
