/**
 * Cursor IDE CLI Supported Models (P1-G07)
 *
 * Curated list of models available in Cursor IDE CLI (cursor-agent).
 *
 * Model Selection:
 * - Use `cursor-agent --model <model-id>` or `-m <model-id>` to specify model
 * - Use `/models` command in interactive mode to list and switch
 * - "auto" mode lets Cursor select based on task complexity
 *
 * Model Sources:
 * - Cursor integrates models from OpenAI, Anthropic, Google, xAI, and others
 * - Available models depend on subscription tier and region
 * - "cursor-small" is always available as Cursor's own lightweight model
 *
 * Sources:
 * - https://cursor.com/docs/models
 * - https://cursor.com/changelog
 */

import { homedir } from 'node:os';
import { delimiter, join } from 'node:path';

/**
 * Cursor model interface for catalog entries.
 */
export interface CursorModel {
  id: string; // Model identifier
  label: string; // Display name
  description?: string; // Brief description
  provider?: 'anthropic' | 'openai' | 'google' | 'xai' | 'cursor' | 'other';
  contextWindow?: string; // Context window size
}

/**
 * Available Cursor models in Cursor CLI.
 */
export const CURSOR_MODELS: CursorModel[] = [
  // Special modes
  {
    id: 'auto',
    label: 'Auto (Recommended)',
    description: 'Cursor automatically selects the best model for each task',
    provider: 'cursor',
  },
  {
    id: 'cursor-small',
    label: 'Cursor Small',
    description: 'Cursor\'s own lightweight model, always available',
    provider: 'cursor',
  },

  // Cursor "composer" models (as shown by `agent models`)
  {
    id: 'composer-1',
    label: 'Composer 1',
    description: 'Cursor composer model',
    provider: 'cursor',
  },

  // Anthropic (Claude) models (Cursor aliases/IDs)
  {
    id: 'opus-4.6-thinking',
    label: 'Claude 4.6 Opus (Thinking)',
    description: 'Highest capability Claude model (thinking variant)',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'opus-4.6',
    label: 'Claude 4.6 Opus',
    description: 'Highest capability Claude model',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'opus-4.5',
    label: 'Claude 4.5 Opus',
    description: 'High capability Claude model',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'opus-4.5-thinking',
    label: 'Claude 4.5 Opus (Thinking)',
    description: 'High capability Claude model (thinking variant)',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'sonnet-4.5',
    label: 'Claude 4.5 Sonnet',
    description: 'Fast, accurate Claude model for day-to-day work',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'sonnet-4.5-thinking',
    label: 'Claude 4.5 Sonnet (Thinking)',
    description: 'Sonnet model (thinking variant)',
    provider: 'anthropic',
    contextWindow: '200K',
  },

  // OpenAI (GPT) models (Cursor aliases/IDs)
  {
    id: 'gpt-5.2',
    label: 'GPT-5.2',
    description: 'General-purpose model',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-high',
    label: 'GPT-5.2 High',
    description: 'Higher reasoning effort variant',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.1-high',
    label: 'GPT-5.1 High',
    description: 'Previous generation high-effort variant',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex',
    label: 'GPT-5.2 Codex',
    description: 'Specialized for code generation',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-high',
    label: 'GPT-5.2 Codex High',
    description: 'Code model (high effort)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-low',
    label: 'GPT-5.2 Codex Low',
    description: 'Code model (low effort)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-xhigh',
    label: 'GPT-5.2 Codex Extra High',
    description: 'Code model (extra high effort)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-fast',
    label: 'GPT-5.2 Codex Fast',
    description: 'Code model (fast variant)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-high-fast',
    label: 'GPT-5.2 Codex High Fast',
    description: 'Code model (high effort, fast)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-low-fast',
    label: 'GPT-5.2 Codex Low Fast',
    description: 'Code model (low effort, fast)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.2-codex-xhigh-fast',
    label: 'GPT-5.2 Codex Extra High Fast',
    description: 'Code model (extra high effort, fast)',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.1-codex-max',
    label: 'GPT-5.1 Codex Max',
    description: 'Previous generation code model',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-5.1-codex-max-high',
    label: 'GPT-5.1 Codex Max High',
    description: 'Previous generation code model (high effort)',
    provider: 'openai',
    contextWindow: '128K',
  },

  // Google (Gemini) models (Cursor aliases/IDs)
  {
    id: 'gemini-3-pro',
    label: 'Gemini 3 Pro',
    description: 'Very large context window, high performance',
    provider: 'google',
    contextWindow: '2M',
  },
  {
    id: 'gemini-3-flash',
    label: 'Gemini 3 Flash',
    description: 'Fast model for quick tasks',
    provider: 'google',
    contextWindow: '1M',
  },

  // Other providers
  {
    id: 'grok',
    label: 'Grok',
    description: 'xAI model',
    provider: 'xai',
  },
];

/**
 * Get all available Cursor models.
 *
 * @returns Array of available Cursor models
 */
export function getCursorModels(): CursorModel[] {
  return CURSOR_MODELS;
}

/**
 * Get models by provider.
 *
 * @param provider - The provider to filter by
 * @returns Array of models from the specified provider
 */
export function getCursorModelsByProvider(provider: CursorModel['provider']): CursorModel[] {
  return CURSOR_MODELS.filter(m => m.provider === provider);
}

/**
 * Get model ID suggestions for Cursor CLI.
 *
 * @returns Array of model IDs
 */
export function getCursorModelIds(): string[] {
  return CURSOR_MODELS.map(m => m.id);
}

/**
 * P1-G06/P1-G09: Array of known Cursor model IDs for capability discovery.
 */
export const KNOWN_CURSOR_MODELS: readonly string[] = CURSOR_MODELS.map(m => m.id);

/**
 * Get the recommended default model for Cursor CLI.
 *
 * @returns Default model ID
 */
export function getDefaultCursorModel(): string {
  return 'auto';
}

/**
 * CU-P0-T06: Discovered model information with source tracking.
 */
export interface DiscoveredCursorModel extends CursorModel {
  source: 'discovered' | 'static';
}

function buildEnrichedPath(): string {
  const home = homedir();
  const npmGlobalPrefix = home ? join(home, '.npm-global') : '';
  const npmGlobalBin = npmGlobalPrefix
    ? (process.platform === 'win32' ? npmGlobalPrefix : join(npmGlobalPrefix, 'bin'))
    : '';

  // Cursor Jan 2026 installer on Windows commonly drops shims into %LOCALAPPDATA%\cursor-agent
  const windowsCursorAgentBin = process.platform === 'win32' && process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, 'cursor-agent')
    : '';

  const windowsNpmBin = process.platform === 'win32' && process.env.APPDATA
    ? join(process.env.APPDATA, 'npm')
    : '';

  const extra = [
    npmGlobalBin,
    windowsNpmBin,
    windowsCursorAgentBin,
    home ? join(home, '.local', 'bin') : '',
    home ? join(home, '.volta', 'bin') : '',
    home ? join(home, '.asdf', 'shims') : '',
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/opt/homebrew/sbin',
    '/snap/bin',
  ].filter(Boolean);

  const current = process.env.PATH || (process.platform === 'win32' ? 'C:\\Windows\\System32' : '/usr/bin:/bin');
  return [...extra, current].filter(Boolean).join(delimiter);
}

/**
 * CU-P0-T06: Discover Cursor models using `agent models` or `--list-models`.
 * 
 * @param command - Cursor CLI command (default: 'agent')
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Discovered models or null if discovery fails
 */
export async function discoverCursorModels(
  command: string = 'agent',
  timeoutMs: number = 5000
): Promise<DiscoveredCursorModel[] | null> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    // Try `agent models` first, then `agent --list-models`
    const proc = spawn(command, ['models'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, CURSOR_NON_INTERACTIVE: '1', PATH: buildEnrichedPath() },
      shell: process.platform === 'win32',
    });

    let stdout = '';
    let stderr = '';

    const timer = setTimeout(() => {
      proc.kill('SIGKILL');
      resolve(null); // Timeout = discovery failed, return null for fallback
    }, timeoutMs);

    proc.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0) {
        const models = parseModelList(stdout || stderr);
        if (models.length > 0) {
          resolve(models.map(m => ({ ...m, source: 'discovered' as const })));
        } else {
          resolve(null);
        }
      } else {
        resolve(null); // Command failed, return null for fallback
      }
    });

    proc.on('error', () => {
      clearTimeout(timer);
      resolve(null); // Error = discovery failed, return null for fallback
    });
  });
}

/**
 * CU-P0-T06: Parse model list from Cursor CLI output.
 * Handles various output formats (JSON, plain text, table).
 */
function parseModelList(output: string): CursorModel[] {
  const models: CursorModel[] = [];
  
  // Strip ANSI escape codes first to prevent them from appearing in model IDs
  // eslint-disable-next-line no-control-regex
  const cleanOutput = output.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '');
  const lines = cleanOutput.trim().split('\n');

  // Try JSON format first
  try {
    const json = JSON.parse(cleanOutput);
    if (Array.isArray(json)) {
      for (const item of json) {
        if (typeof item === 'object' && item !== null && 'id' in item) {
          models.push({
            id: String(item.id),
            label: String(item.label || item.name || item.id),
            description: typeof item.description === 'string' ? item.description : undefined,
            provider: item.provider as CursorModel['provider'],
            contextWindow: typeof item.contextWindow === 'string' ? item.contextWindow : undefined,
          });
        }
      }
      return models;
    }
  } catch {
    // Not JSON, try text parsing
  }

  // Parse text/table format
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith('Available') ||
      trimmed.startsWith('Model') ||
      trimmed.startsWith('Loading') ||
      trimmed.startsWith('Tip:')
    ) {
      continue;
    }

    // Try to extract model ID (first word or column)
    const parts = trimmed.split(/\s+/);
    if (parts.length > 0) {
      const id = parts[0];
      // Skip headers, separators, empty strings, and invalid IDs
      if (id && !id.includes('─') && !id.includes('═') && id !== 'ID' && id !== 'No' && id.length > 2) {
        models.push({
          id,
          label: id,
          description: parts.slice(1).join(' ') || undefined,
        });
      }
    }
  }

  return models;
}

/**
 * CU-P0-T06: Get Cursor models with discovery fallback.
 * 
 * @param command - Cursor CLI command (default: 'agent')
 * @param useCache - Whether to use cached discovery results (default: true)
 * @returns Models with source information
 */
let cachedDiscoveredModels: DiscoveredCursorModel[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 3600_000; // 1 hour

export async function getCursorModelsWithDiscovery(
  command: string = 'agent',
  useCache: boolean = true
): Promise<DiscoveredCursorModel[]> {
  // Check cache
  if (useCache && cachedDiscoveredModels && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedDiscoveredModels;
  }

  // Try discovery
  const discovered = await discoverCursorModels(command, 5000);
  
  if (discovered && discovered.length > 0) {
    // Merge discovered with static (discovered takes precedence)
    const staticModels = CURSOR_MODELS.map(m => ({ ...m, source: 'static' as const }));
    const discoveredIds = new Set(discovered.map(m => m.id));
    const merged = [
      ...discovered,
      ...staticModels.filter(m => !discoveredIds.has(m.id)),
    ];
    
    cachedDiscoveredModels = merged;
    cacheTimestamp = Date.now();
    return merged;
  }

  // Fallback to static list
  const staticModels = CURSOR_MODELS.map(m => ({ ...m, source: 'static' as const }));
  cachedDiscoveredModels = staticModels;
  cacheTimestamp = Date.now();
  return staticModels;
}
