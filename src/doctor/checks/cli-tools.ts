/**
 * CLI Tools Checks for RWM Puppet Master Doctor System
 * 
 * Checks for availability of cursor, codex, and claude CLI tools.
 * 
 * Per BUILD_QUEUE_PHASE_6.md PH6-T02 (CLI Tools Check).
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { delimiter, join, resolve } from 'node:path';
import type { CheckResult, DoctorCheck } from '../check-registry.js';
import type { CliPathsConfig } from '../../types/config.js';
import { getPlatformAuthStatus } from '../../platforms/auth-status.js';
import { getCursorCommandCandidates, resolvePlatformCommand } from '../../platforms/constants.js';
import { probeCursorMCP, detectCursorConfig } from '../../platforms/capability-discovery.js';

/**
 * Result of checking CLI availability
 */
interface CliAvailabilityResult {
  /** Whether the CLI is available */
  available: boolean;
  /** Version string if available */
  version?: string;
  /** Error message if unavailable */
  error?: string;
}

interface CliInvocation {
  command: string;
  argsPrefix?: string[];
}

function formatInvocation(invocation: CliInvocation): string {
  const prefix = invocation.argsPrefix?.length ? ` ${invocation.argsPrefix.join(' ')}` : '';
  return `${invocation.command}${prefix}`;
}

function getEnrichedEnv(): NodeJS.ProcessEnv {
  const home = homedir();
  const npmGlobalPrefix = home ? join(home, '.npm-global') : '';
  const npmGlobalBin = npmGlobalPrefix
    ? (process.platform === 'win32' ? npmGlobalPrefix : join(npmGlobalPrefix, 'bin'))
    : '';

  const extraPaths = [
    npmGlobalBin,
    join(home, '.local', 'bin'),
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
  ].filter(Boolean);

  const currentPath = process.env.PATH || '';
  const enrichedPath = [...extraPaths, currentPath].filter(Boolean).join(delimiter);

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    PATH: enrichedPath,
  };

  if (npmGlobalPrefix) {
    env.HOME = home;
    env.npm_config_prefix = npmGlobalPrefix;
    env.NPM_CONFIG_PREFIX = npmGlobalPrefix;
  }

  return env;
}

/**
 * Checks if a CLI command is available and can run a version flag.
 * 
 * @param command - Command to check (e.g., 'cursor-agent', 'codex')
 * @param versionFlag - Flag to use for version check (e.g., '--version')
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise resolving to availability result
 */
async function checkCliAvailable(
  invocation: CliInvocation,
  args: string[] = ['--version'],
  timeout: number = 10000
): Promise<CliAvailabilityResult> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn(invocation.command, [...(invocation.argsPrefix ?? []), ...args], {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: getEnrichedEnv(),
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({
        available: false,
        error: `Command timed out after ${timeout}ms`,
      });
    }, timeout);

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        // Extract version from first line of output
        const version = stdout.trim().split('\n')[0].trim();
        resolve({
          available: true,
          version: version || 'unknown',
        });
      } else {
        resolve({
          available: false,
          error: `Command exited with code ${code}${stderr ? `: ${stderr.trim()}` : ''}`,
        });
      }
    });

    proc.on('error', (error) => {
      clearTimeout(timer);
      resolve({
        available: false,
        error: error.message,
      });
    });
  });
}

/**
 * Run `claude doctor` and return a brief summary for details.
 * Best-effort; failures are not surfaced as check failures.
 */
async function runClaudeDoctor(
  invocation: CliInvocation,
  timeoutMs: number = 15_000
): Promise<{ ok: boolean; summary: string }> {
  return new Promise((resolve) => {
    const proc = spawn(invocation.command, [...(invocation.argsPrefix ?? []), 'doctor'], {
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: getEnrichedEnv(),
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve({ ok: false, summary: 'timed out' });
    }, timeoutMs);

    proc.stdout?.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr?.on('data', (d: Buffer) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        const first = stdout.trim().split('\n')[0]?.trim();
        resolve({ ok: true, summary: first || 'OK' });
      } else {
        resolve({ ok: false, summary: stderr.trim() || `exit ${code}` });
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, summary: err.message });
    });
  });
}

/**
 * Check for Cursor Agent CLI availability
 */
export class CursorCliCheck implements DoctorCheck {
  readonly name = 'cursor-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Cursor Agent CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const candidates: CliInvocation[] = getCursorCommandCandidates(this.cliPaths).map((c) => ({
      command: c,
    }));

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      // Also verify --help works for functionality check
      const helpResult = await checkCliAvailable(selected, ['--help'], 5000);
      const auth = getPlatformAuthStatus('cursor');

      // CU-P0-T01: Report which binary was selected and preference order
      const selectedIndex = candidates.findIndex(c => c.command === selected.command);
      const preferenceNote = selectedIndex === 0 && candidates.length > 1
        ? ' (preferred: agent)'
        : selectedIndex === 1 && candidates.length > 2
          ? ' (fallback: cursor-agent)'
          : '';

      // CU-P0-T02: Surface auth issues as fixable (especially for headless/CI)
      const passed = auth.status !== 'not_authenticated';
      
      // Help check failure doesn't fail the check, but we note it
      if (!helpResult.available) {
        return {
          name: this.name,
          category: this.category,
          passed,
          message: passed
            ? `Cursor CLI is installed; version works but --help failed`
            : `Cursor CLI is installed but not authenticated for headless/CI usage`,
          details: `Installed: yes. Runnable: yes. Auth: ${auth.status}. Selected binary: ${formatInvocation(selected)}${preferenceNote}. Version: ${versionResult.version || 'unknown'}. Help check: ${helpResult.error}. ${auth.details ?? ''}`.trim(),
          fixSuggestion: auth.fixSuggestion,
          durationMs: 0, // Will be set by CheckRegistry
        };
      }

      // CU-P1-T07: Probe MCP status (non-blocking)
      let mcpInfo = '';
      try {
        const mcpResult = await probeCursorMCP(selected.command, 3000);
        if (mcpResult.available) {
          if (mcpResult.serverCount !== undefined && mcpResult.serverCount > 0) {
            mcpInfo = ` MCP: ${mcpResult.serverCount} server(s) configured (${mcpResult.servers?.slice(0, 3).join(', ') || 'unknown'}${mcpResult.serverCount > 3 ? '...' : ''}).`;
          } else {
            mcpInfo = ' MCP: No servers configured. Use `/mcp list` in Cursor CLI to browse and enable MCP servers.';
          }
        } else {
          mcpInfo = ' MCP: Detection failed (may require interactive setup).';
        }
      } catch {
        // MCP probe failure is non-fatal, just skip it
        mcpInfo = '';
      }

      // CU-P1-T08: Detect config file (non-blocking)
      let configInfo = '';
      try {
        const configResult = await detectCursorConfig();
        if (configResult.found) {
          configInfo = ` Config: Found at ${configResult.path}${configResult.hasPermissions ? ' (has permissions/allow lists)' : ' (no permissions configured)'}.`;
        } else {
          configInfo = ' Config: No config file found (using defaults).';
        }
      } catch {
        // Config detection failure is non-fatal
        configInfo = '';
      }

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Cursor CLI is installed and runnable${auth.status === 'authenticated' ? ' (authenticated for headless/CI)' : ''}`
          : `Cursor CLI is installed but not authenticated for headless/CI usage`,
        details: `Installed: yes. Runnable: yes. Auth: ${auth.status}. Selected binary: ${formatInvocation(selected)}${preferenceNote}. Version: ${versionResult.version || 'unknown'}.${mcpInfo}${configInfo} ${auth.details ?? ''}`.trim(),
        fixSuggestion: auth.fixSuggestion,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      // CU-P0-T01: Update fix suggestion to reference cursor.com/install
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Cursor CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion: 'Install with: curl https://cursor.com/install -fsSL | bash\nThis will install both `agent` and `cursor-agent` to ~/.local/bin (ensure it is in your PATH)',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for Codex CLI availability and SDK package
 * 
 * Puppet Master uses @openai/codex-sdk which spawns CLI processes internally.
 * Both the CLI (global) and SDK (project dependency) must be available.
 */
export class CodexCliCheck implements DoctorCheck {
  readonly name = 'codex-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Codex CLI and SDK are available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  /**
   * Check if @openai/codex-sdk package is installed in node_modules
   */
  private checkSdkInstalled(): { installed: boolean; path?: string; error?: string } {
    try {
      // Check multiple possible locations
      const possiblePaths = [
        join(process.cwd(), 'node_modules', '@openai', 'codex-sdk'),
        join(process.cwd(), 'node_modules', '@openai', 'codex-sdk', 'package.json'),
        resolve('node_modules', '@openai', 'codex-sdk'),
      ];

      for (const sdkPath of possiblePaths) {
        if (existsSync(sdkPath)) {
          // Check if it's a directory or package.json exists
          const stat = statSync(sdkPath);
          if (stat.isDirectory() || sdkPath.endsWith('package.json')) {
            return { installed: true, path: sdkPath };
          }
        }
      }

      return { installed: false, error: 'SDK not found in node_modules' };
    } catch (error) {
      return { installed: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('codex');
    const sdkCheck = this.checkSdkInstalled();

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('codex', this.cliPaths);
    if (this.cliPaths?.codex && this.cliPaths.codex.trim() !== '') {
      candidates.push({ command: configured });
    } else {
      candidates.push({ command: configured });
      // Avoid network installs: only works if codex is already available locally.
      candidates.push({ command: 'npx', argsPrefix: ['--no-install', 'codex'] });
    }

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version'], 15_000);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      // Also verify exec subcommand is available (Codex uses 'exec' for non-interactive mode)
      const execHelpResult = await checkCliAvailable(selected, ['exec', '--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const execAvailable = execHelpResult.available;
      
      // Both CLI and SDK must be available
      const passed = runnable && execAvailable && sdkCheck.installed && auth.status !== 'not_authenticated';

      const detailsParts: string[] = [
        `CLI installed: yes`,
        `CLI runnable: ${runnable ? 'yes' : 'no'}`,
        `Exec subcommand: ${execAvailable ? 'yes' : 'no'}`,
        `SDK package: ${sdkCheck.installed ? 'yes' : 'no'}`,
        `Auth: ${auth.status}`,
        `Command: ${formatInvocation(selected)}`,
        `Version: ${versionResult.version || 'unknown'}`,
      ];

      if (!helpResult.available) {
        detailsParts.push(`Help check: ${helpResult.error}`);
      }
      if (!execAvailable) {
        detailsParts.push(`Exec help check: ${execHelpResult.error}`);
      }
      if (!sdkCheck.installed) {
        detailsParts.push(`SDK check: ${sdkCheck.error || 'not found'}`);
      }
      if (auth.details) {
        detailsParts.push(auth.details);
      }

      // Build fix suggestion if SDK is missing
      let fixSuggestion: string | undefined;
      if (!sdkCheck.installed) {
        fixSuggestion = 'Install SDK package: npm install @openai/codex-sdk\n\nThis package is required as Puppet Master uses the SDK (which spawns CLI processes internally).';
      } else if (auth.status === 'not_authenticated') {
        fixSuggestion = auth.fixSuggestion;
      }

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Codex CLI and SDK are installed, runnable, and authenticated`
          : !sdkCheck.installed
            ? `Codex CLI is available but SDK package (@openai/codex-sdk) is missing`
            : auth.status === 'not_authenticated'
              ? `Codex CLI and SDK are installed but not authenticated`
              : !execAvailable
                ? `Codex CLI is installed but exec subcommand is not available`
                : `Codex CLI is installed but not runnable`,
        details: detailsParts.join('. ').trim(),
        fixSuggestion,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      // CLI not found - provide comprehensive fix suggestion
      const fixParts = [
        'Install Codex CLI: npm install -g --prefix ~/.npm-global @openai/codex',
        'Install SDK package: npm install @openai/codex-sdk',
        '',
        'After installation:',
        '  - Verify CLI: codex --version',
        '  - Verify exec subcommand: codex exec --help',
        '  - Configure: Edit ~/.codex/config.toml (optional)',
        '  - Authenticate: Set OPENAI_API_KEY environment variable',
        '',
        'Note: Puppet Master uses @openai/codex-sdk which spawns CLI processes internally.',
        'Both the CLI (global) and SDK (project dependency) must be installed.',
      ];
      
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Codex CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})${sdkCheck.installed ? '' : '; SDK package also missing'}`,
        details: lastError || (sdkCheck.installed ? undefined : sdkCheck.error),
        fixSuggestion: fixParts.join('\n'),
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for Claude CLI availability
 */
export class ClaudeCliCheck implements DoctorCheck {
  readonly name = 'claude-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Claude CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('claude');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('claude', this.cliPaths);
    candidates.push({ command: configured });

    const localClaudePath = join(homedir(), '.claude', 'local', 'claude');
    try {
      await access(localClaudePath);
      candidates.push({ command: localClaudePath });
    } catch {
      // ignore
    }

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      let doctorSummary = '';
      try {
        const doctor = await runClaudeDoctor(selected, 15_000);
        doctorSummary = doctor.ok
          ? ` Doctor: ${doctor.summary}`
          : ` Doctor: ${doctor.summary} (run \`claude doctor\` manually)`;
      } catch {
        doctorSummary = ' Doctor: not run';
      }

      const detailsBase = `Installed: yes. Runnable: ${runnable ? 'yes' : 'no'}. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}.${helpResult.available ? '' : ` Help check: ${helpResult.error}`}${doctorSummary}${auth.details ? ` ${auth.details}` : ''}`.trim();

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Claude CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Claude CLI is installed and runnable but not authenticated`
            : `Claude CLI is installed but not runnable`,
        details: detailsBase,
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      const installUnix = 'curl -fsSL https://claude.ai/install.sh | bash';
      const installWin = 'irm https://claude.ai/install.ps1 | iex';
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Claude CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion: `Install: macOS/Linux/WSL: ${installUnix}\n  Windows PowerShell: ${installWin}\n  After install, run \`claude doctor\` to verify and \`claude update\` to update.`,
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for Gemini CLI availability
 */
export class GeminiCliCheck implements DoctorCheck {
  readonly name = 'gemini-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if Gemini CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('gemini');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('gemini', this.cliPaths);
    candidates.push({ command: configured });

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      // Enhanced checks: settings, models, preview features
      const detailsParts: string[] = [
        `Installed: yes`,
        `Runnable: ${runnable ? 'yes' : 'no'}`,
        `Auth: ${auth.status}`,
        `Command: ${formatInvocation(selected)}`,
        `Version: ${versionResult.version || 'unknown'}`,
      ];

      // Settings validation (non-blocking)
      let settingsInfo = '';
      try {
        const homeDir = homedir();
        const settingsPath = join(homeDir, '.gemini', 'settings.json');
        try {
          await access(settingsPath);
          const settingsContent = await readFile(settingsPath, 'utf-8');
          const settings = JSON.parse(settingsContent);
          const hasPreviewFeatures = settings.general?.previewFeatures === true;
          settingsInfo = ` Settings: Found at ${settingsPath}${hasPreviewFeatures ? ' (preview features enabled)' : ''}.`;
        } catch {
          settingsInfo = ' Settings: No settings file found (using defaults).';
        }
      } catch {
        // Settings check failed, skip it
      }

      // Model availability (non-blocking)
      let modelInfo = '';
      try {
        const { getGeminiModelsWithDiscovery } = await import('../../platforms/gemini-models.js');
        const models = await getGeminiModelsWithDiscovery(selected.command, true);
        const modelCount = models.length;
        const discoveredCount = models.filter(m => m.source === 'discovered').length;
        modelInfo = ` Models: ${modelCount} available${discoveredCount > 0 ? ` (${discoveredCount} discovered)` : ' (static list)'}.`;
      } catch {
        // Model discovery failed, skip it
      }

      // Installation method detection (best-effort)
      let installInfo = '';
      try {
        // Check if installed via npm (check for node_modules or npm prefix)
        const { execSync } = await import('child_process');
        try {
          const npmPrefix = execSync('npm config get prefix', { encoding: 'utf-8', timeout: 2000 }).trim();
          if (selected.command.includes(npmPrefix) || selected.command.includes('node_modules')) {
            installInfo = ' Install: npm.';
          }
        } catch {
          // Try npx
          try {
            const npxCheck = execSync('which npx', { encoding: 'utf-8', timeout: 2000 }).trim();
            if (npxCheck) {
              installInfo = ' Install: npx available.';
            }
          } catch {
            // Try brew (macOS)
            try {
              const brewCheck = execSync('which brew', { encoding: 'utf-8', timeout: 2000 }).trim();
              if (brewCheck) {
                installInfo = ' Install: brew available.';
              }
            } catch {
              // Couldn't detect installation method
            }
          }
        }
      } catch {
        // Installation detection failed, skip it
      }

      const fullDetails = [
        ...detailsParts,
        helpResult.available ? '' : ` Help check: ${helpResult.error}`,
        settingsInfo,
        modelInfo,
        installInfo,
        auth.details ? ` ${auth.details}` : '',
      ]
        .filter(Boolean)
        .join('')
        .trim();

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Gemini CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Gemini CLI is installed and runnable but not authenticated`
            : `Gemini CLI is installed but not runnable`,
        details: fullDetails,
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      // Enhanced installation suggestion
      const installMethods = [
        'npm install -g @google/gemini-cli',
        'npx @google/gemini-cli (for one-off usage)',
        'brew install gemini-cli (macOS)',
      ].join('\n  OR: ');

      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Gemini CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        fixSuggestion: `Install with:\n  ${installMethods}\n\nAfter installation, authenticate with:\n  - Set GEMINI_API_KEY environment variable, or\n  - Run 'gemini' interactively for OAuth setup`,
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for GitHub Copilot CLI availability
 */
export class CopilotCliCheck implements DoctorCheck {
  readonly name = 'copilot-cli';
  readonly category = 'cli' as const;
  readonly description = 'Check if GitHub Copilot CLI is available';

  constructor(private readonly cliPaths: Partial<CliPathsConfig> | null = null) {}

  async run(): Promise<CheckResult> {
    const auth = getPlatformAuthStatus('copilot');

    const candidates: CliInvocation[] = [];
    const configured = resolvePlatformCommand('copilot', this.cliPaths);
    candidates.push({ command: configured });

    let selected: CliInvocation | null = null;
    let versionResult: CliAvailabilityResult | null = null;
    let lastError: string | undefined;

    for (const candidate of candidates) {
      const res = await checkCliAvailable(candidate, ['--version']);
      if (res.available) {
        selected = candidate;
        versionResult = res;
        break;
      }
      lastError = res.error;
    }

    if (selected && versionResult?.available) {
      const helpResult = await checkCliAvailable(selected, ['--help'], 5_000);
      const runnable = helpResult.available || versionResult.available;
      const passed = runnable && auth.status !== 'not_authenticated';

      return {
        name: this.name,
        category: this.category,
        passed,
        message: passed
          ? `Copilot CLI is installed, runnable, and authenticated`
          : auth.status === 'not_authenticated'
            ? `Copilot CLI is installed and runnable but not authenticated`
            : `Copilot CLI is installed but not runnable`,
        details: `Installed: yes. Runnable: ${runnable ? 'yes' : 'no'}. Auth: ${auth.status}. Command: ${formatInvocation(selected)}. Version: ${versionResult.version || 'unknown'}.${helpResult.available ? '' : ` Help check: ${helpResult.error}`}${auth.details ? ` ${auth.details}` : ''}`.trim(),
        fixSuggestion: auth.status === 'not_authenticated' ? auth.fixSuggestion : undefined,
        durationMs: 0, // Will be set by CheckRegistry
      };
    } else {
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: `Copilot CLI not found (checked: ${candidates.map(formatInvocation).join(', ')})`,
        details: lastError,
        // P0-G19: Updated to correct install command
        fixSuggestion: 'Install with: npm install -g --prefix ~/.npm-global @github/copilot',
        durationMs: 0, // Will be set by CheckRegistry
      };
    }
  }
}

/**
 * Check for GitHub Copilot SDK availability
 *
 * Uses the official Copilot SDK to check:
 * - SDK package installed
 * - CLI available (SDK communicates with CLI via JSON-RPC)
 * - Authentication status
 * - Available models
 *
 * This replaces CLI-only checks with richer SDK-based validation.
 */
export class CopilotSdkCheck implements DoctorCheck {
  readonly name = 'copilot-sdk';
  readonly category = 'cli' as const;
  readonly description = 'Check if GitHub Copilot SDK is available and authenticated';

  async run(): Promise<CheckResult> {
    try {
      // Dynamic import to avoid errors if SDK not installed
      const { CopilotClient } = await import('@github/copilot-sdk');

      const client = new CopilotClient();
      await client.start();

      const [status, authStatus, models] = await Promise.all([
        client.getStatus(),
        client.getAuthStatus(),
        client.listModels().catch(() => [] as string[]),
      ]);

      await client.stop();

      const authenticated = authStatus.authenticated;
      const modelCount = models.length;

      return {
        name: this.name,
        category: this.category,
        passed: authenticated,
        message: authenticated
          ? `Copilot SDK is working and authenticated`
          : `Copilot SDK is working but not authenticated`,
        details: `SDK: yes. CLI: v${status.cliVersion ?? status.version ?? 'unknown'}. Auth: ${authenticated ? authStatus.authType ?? 'authenticated' : 'not authenticated'}. Models available: ${modelCount}.`,
        fixSuggestion: authenticated ? undefined : 'Run `copilot /login` to authenticate',
        durationMs: 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Check if it's a module not found error
      if (errorMessage.includes('Cannot find module') || errorMessage.includes('ERR_MODULE_NOT_FOUND')) {
        return {
          name: this.name,
          category: this.category,
          passed: false,
          message: 'Copilot SDK not installed',
          details: `The @github/copilot-sdk package is not installed.`,
          fixSuggestion: 'Run: npm install @github/copilot-sdk',
          durationMs: 0,
        };
      }

      // Other errors (CLI not available, connection failed, etc.)
      return {
        name: this.name,
        category: this.category,
        passed: false,
        message: 'Copilot SDK initialization failed',
        details: errorMessage,
        fixSuggestion: 'Ensure Copilot CLI is installed and run: npm install @github/copilot-sdk',
        durationMs: 0,
      };
    }
  }
}

// NOTE: AntigravityCliCheck removed - GUI-only, not suitable for automation
// See plan: /root/.claude/plans/snoopy-wondering-mountain.md
