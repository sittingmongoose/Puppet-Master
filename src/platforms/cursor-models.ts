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

  // Anthropic (Claude) models
  {
    id: 'claude-4.5-opus',
    label: 'Claude 4.5 Opus',
    description: 'Highest capability Claude model for complex codebases',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'claude-4-sonnet',
    label: 'Claude 4 Sonnet',
    description: 'Fast, accurate Claude model for day-to-day work',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Good balance of cost and quality',
    provider: 'anthropic',
    contextWindow: '200K',
  },
  {
    id: 'claude-haiku',
    label: 'Claude Haiku',
    description: 'Fast and affordable for simple tasks',
    provider: 'anthropic',
    contextWindow: '200K',
  },

  // OpenAI (GPT) models
  {
    id: 'gpt-5',
    label: 'GPT-5',
    description: 'Cutting edge for general reasoning',
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
    id: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Multimodal model with vision support',
    provider: 'openai',
    contextWindow: '128K',
  },
  {
    id: 'gpt-4.1',
    label: 'GPT-4.1',
    description: 'Cost-effective high-context model',
    provider: 'openai',
    contextWindow: '128K',
  },

  // Google (Gemini) models
  {
    id: 'gemini-3-pro',
    label: 'Gemini 3 Pro',
    description: 'Very large context window, high performance',
    provider: 'google',
    contextWindow: '2M',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Large context for multi-file reasoning',
    provider: 'google',
    contextWindow: '1M',
  },
  {
    id: 'gemini-flash',
    label: 'Gemini Flash',
    description: 'Fast and lightweight for quick tasks',
    provider: 'google',
    contextWindow: '1M',
  },

  // Other providers
  {
    id: 'grok-code',
    label: 'Grok Code',
    description: 'xAI coding model',
    provider: 'xai',
  },
  {
    id: 'deepseek-r1',
    label: 'DeepSeek R1',
    description: 'DeepSeek reasoning model',
    provider: 'other',
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

  const windowsNpmBin = process.platform === 'win32' && process.env.APPDATA
    ? join(process.env.APPDATA, 'npm')
    : '';

  const extra = [
    npmGlobalBin,
    windowsNpmBin,
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
    if (!trimmed || trimmed.startsWith('Available') || trimmed.startsWith('Model') || trimmed.startsWith('Loading')) {
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
