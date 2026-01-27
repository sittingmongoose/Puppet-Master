import { useState, useEffect } from 'react';
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
import type { StatusType } from '@/types';

interface PlatformAuthInfo {
  platform: string;
  status: 'authenticated' | 'failed' | 'skipped';
  details: string;
  fixSuggestion?: string;
  envVar?: string;
  getUrl?: string;
}

interface AuthSummary {
  total: number;
  authenticated: number;
  failed: number;
  skipped: number;
}

interface PlatformInstructions {
  platform: string;
  description: string;
  envVar: string;
  getUrl: string;
  instructions: string[];
}

/**
 * Login page - Platform authentication status and management
 * Feature parity with CLI `puppet-master login` command
 */
export default function LoginPage() {
  const [platforms, setPlatforms] = useState<PlatformAuthInfo[]>([]);
  const [summary, setSummary] = useState<AuthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<PlatformInstructions | null>(null);

  // Fetch auth status on mount
  useEffect(() => {
    fetchAuthStatus();
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
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructions = async (platform: string) => {
    try {
      const response = await fetch(`/api/login/instructions/${platform}`);
      if (!response.ok) {
        throw new Error('Failed to fetch instructions');
      }
      const data = await response.json();
      setInstructions(data);
      setSelectedPlatform(platform);
    } catch (err) {
      console.error('[Login] Failed to fetch instructions:', err);
    }
  };

  // Map auth status to StatusType
  const mapStatusToType = (status: string): StatusType => {
    switch (status) {
      case 'authenticated':
        return 'complete';
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
              <div className="text-2xl font-bold text-hot-magenta">{summary.failed}</div>
              <div className="text-sm text-ink-faded">Failed</div>
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
              onShowInstructions={() => fetchInstructions(platform.platform)}
              isSelected={selectedPlatform === platform.platform}
            />
          ))}
        </div>
      </Panel>

      {/* Instructions Modal/Panel */}
      {instructions && selectedPlatform && (
        <Panel title={`${selectedPlatform.toUpperCase()} Setup Instructions`}>
          <HelpText {...helpContent.login.setupInstructions} />
          <div className="space-y-md mt-md">
            <p className="text-ink-faded">{instructions.description}</p>
            
            {instructions.envVar && instructions.envVar !== 'N/A (CLI-based auth)' && (
              <div className="p-md bg-paper-lined">
                <div className="text-sm text-ink-faded mb-xs">Environment Variable</div>
                <code className="font-mono text-electric-blue">{instructions.envVar}</code>
              </div>
            )}
            
            {instructions.getUrl && (
              <div className="p-md bg-paper-lined">
                <div className="text-sm text-ink-faded mb-xs">Get Credentials</div>
                <a 
                  href={instructions.getUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-electric-blue hover:underline"
                >
                  {instructions.getUrl}
                </a>
              </div>
            )}
            
            <div className="space-y-sm">
              <div className="text-sm font-semibold">Steps:</div>
              <ol className="list-decimal list-inside space-y-xs">
                {instructions.instructions.map((step, index) => (
                  <li key={index} className="text-sm">{step}</li>
                ))}
              </ol>
            </div>
            
            <div className="pt-md border-t border-ink-faded">
              <Button variant="ghost" onClick={() => { setSelectedPlatform(null); setInstructions(null); }}>
                CLOSE
              </Button>
            </div>
          </div>
        </Panel>
      )}

      {/* CLI Alternative */}
      <Panel title="CLI Alternative">
        <HelpText {...helpContent.login.cliAlternative} />
        <div className="space-y-md mt-md">
          <p className="text-sm text-ink-faded">
            You can also configure authentication using the command line interface (CLI). 
            This is useful for headless servers or if you prefer working in a terminal.
          </p>
          
          {/* Step 1: Open Terminal */}
          <div className="space-y-sm">
            <div className="font-semibold text-sm">Step 1: Open a Terminal</div>
            <div className="p-md bg-paper-lined text-sm space-y-xs">
              <div className="text-ink-faded">
                <strong>macOS:</strong> Open Spotlight (Cmd+Space), type "Terminal", press Enter
              </div>
              <div className="text-ink-faded">
                <strong>Windows:</strong> Press Win+R, type "cmd" or "powershell", press Enter
              </div>
              <div className="text-ink-faded">
                <strong>Linux:</strong> Press Ctrl+Alt+T, or find Terminal in your applications
              </div>
            </div>
          </div>

          {/* Step 2: Navigate to Project */}
          <div className="space-y-sm">
            <div className="font-semibold text-sm">Step 2: Navigate to Your Project</div>
            <div className="p-md bg-paper-lined text-sm space-y-xs">
              <div className="font-mono">
                <div className="text-ink-faded"># Change to your project directory</div>
                <div className="text-electric-blue">cd /path/to/your/project</div>
              </div>
              <div className="border-t border-ink-faded pt-xs mt-xs">
                <div className="text-ink-faded mb-xs"><strong>Examples:</strong></div>
                <div className="font-mono text-sm">
                  <div className="text-ink-faded"><strong>macOS/Linux:</strong></div>
                  <div className="text-electric-blue">cd ~/Documents/my-project</div>
                  <div className="text-electric-blue">cd ~/Desktop/rwm-puppet-master</div>
                </div>
              </div>
              <div>
                <div className="font-mono text-sm">
                  <div className="text-ink-faded"><strong>Windows:</strong></div>
                  <div className="text-electric-blue">cd C:\Users\YourName\Documents\my-project</div>
                  <div className="text-electric-blue">cd C:\Users\YourName\Desktop\rwm-puppet-master</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Run Login Commands */}
          <div className="space-y-sm">
            <div className="font-semibold text-sm">Step 3: Run the Login Command</div>
            <div className="p-md bg-paper-lined font-mono text-sm space-y-sm">
              <div>
                <div className="text-ink-faded"># Option A: Interactive wizard (guides you through all platforms)</div>
                <div className="text-electric-blue">puppet-master login</div>
              </div>
              <div>
                <div className="text-ink-faded"># Option B: Configure a specific platform only</div>
                <div className="text-electric-blue">puppet-master login claude</div>
                <div className="text-electric-blue">puppet-master login codex</div>
                <div className="text-electric-blue">puppet-master login gemini</div>
                <div className="text-electric-blue">puppet-master login copilot</div>
                <div className="text-electric-blue">puppet-master login cursor</div>
              </div>
              <div>
                <div className="text-ink-faded"># Option C: Configure all platforms at once</div>
                <div className="text-electric-blue">puppet-master login --all</div>
              </div>
            </div>
          </div>

          {/* Step 4: Follow Prompts */}
          <div className="space-y-sm">
            <div className="font-semibold text-sm">Step 4: Follow the Prompts</div>
            <div className="p-md bg-paper-lined text-sm text-ink-faded">
              <p>The CLI will guide you through entering your API keys or credentials.</p>
              <p className="mt-xs">Keys are saved securely to a <code className="font-mono text-electric-blue">.env</code> file in your project.</p>
            </div>
          </div>

          {/* Verify Setup */}
          <div className="space-y-sm">
            <div className="font-semibold text-sm">Step 5: Verify Your Setup</div>
            <div className="p-md bg-paper-lined font-mono text-sm space-y-xs">
              <div className="text-ink-faded"># Check which platforms are authenticated</div>
              <div className="text-electric-blue">puppet-master doctor</div>
              <div className="mt-sm text-ink-faded"># Or check a specific platform</div>
              <div className="text-electric-blue">puppet-master login claude --status</div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="space-y-sm">
            <div className="font-semibold text-sm">Troubleshooting</div>
            <div className="p-md bg-paper-lined text-sm text-ink-faded space-y-xs">
              <div><strong>Command not found?</strong> Make sure puppet-master is installed: <code className="font-mono text-electric-blue">npm install -g puppet-master</code></div>
              <div><strong>Permission denied?</strong> Try running with elevated permissions or check your npm global path.</div>
              <div><strong>Still having issues?</strong> Run <code className="font-mono text-electric-blue">puppet-master doctor</code> to diagnose problems.</div>
            </div>
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
  onShowInstructions: () => void;
  isSelected: boolean;
}

function PlatformCard({ platform, statusType, onShowInstructions, isSelected }: PlatformCardProps) {
  // Platform icons
  const platformIcons: Record<string, ReactNode> = {
    cursor: <CursorIcon size="1.5em" />,
    codex: <RobotIcon size="1.5em" />,
    claude: <BrainIcon size="1.5em" />,
    gemini: <SparkleIcon size="1.5em" />,
    copilot: <ArmIcon size="1.5em" />,
  };
  
  const icon = platformIcons[platform.platform] || <PackageIcon size="1.5em" />;
  
  return (
    <div 
      className={`p-md border-medium transition-colors ${
        isSelected 
          ? 'border-electric-blue bg-electric-blue/5' 
          : 'border-ink-faded hover:border-electric-blue'
      }`}
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
      
      {platform.status === 'failed' && platform.fixSuggestion && (
        <p className="text-xs text-hot-magenta mb-md flex items-center gap-xs">
          <LightbulbIcon size="1em" />
          {platform.fixSuggestion}
        </p>
      )}
      
      <div className="flex gap-xs">
        <Button variant="ghost" size="sm" onClick={onShowInstructions}>
          {platform.status === 'authenticated' ? 'VIEW SETUP' : 'SETUP'}
        </Button>
        {platform.getUrl && (
          <a 
            href={platform.getUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm">
              GET KEY
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
