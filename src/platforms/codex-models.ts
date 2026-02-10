/**
 * OpenAI Codex CLI Supported Models (P1-G07)
 *
 * Curated list of models available in OpenAI Codex CLI.
 *
 * Model Selection:
 * - Use `codex --model <model-id>` or `codex -m <model-id>` to specify model
 * - Set `model = "..."` in ~/.codex/config.toml for persistence
 * - List available models: Query OpenAI API /v1/models endpoint
 *
 * Model Tiers:
 * - Codex variants (gpt-X-codex): Optimized for code generation and agentic tasks
 * - Standard GPT variants: General-purpose reasoning
 * - Mini variants: Cost-effective for simple tasks
 *
 * Sources:
 * - https://developers.openai.com/codex/models
 * - https://developers.openai.com/codex/cli/reference
 */

import { homedir } from 'node:os';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';

/**
 * Codex model interface for catalog entries.
 */
export interface CodexModel {
  id: string; // Model identifier (e.g., "gpt-5.2-codex")
  label: string; // Display name
  description?: string; // Brief description
  optimizedForCode?: boolean; // True if code-optimized
  costTier?: 'high' | 'medium' | 'low'; // Relative cost tier
  reasoningLevels?: ('Low' | 'Medium' | 'High' | 'Extra high')[]; // Available reasoning levels
}

/**
 * Available Codex models in OpenAI Codex CLI.
 */
export const CODEX_MODELS: CodexModel[] = [
  // Codex-optimized models (recommended for coding)
  {
    id: 'gpt-5.3-codex',
    label: 'GPT-5.3 Codex (Recommended)',
    description: 'Latest agentic coding model, excellent for complex engineering tasks',
    optimizedForCode: true,
    costTier: 'high',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5.2-codex',
    label: 'GPT-5.2 Codex',
    description: 'Previous stable agentic coding model',
    optimizedForCode: true,
    costTier: 'high',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5.1-codex-max',
    label: 'GPT-5.1 Codex Max',
    description: 'Optimized for long, project-scale coding tasks',
    optimizedForCode: true,
    costTier: 'high',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5.1-codex',
    label: 'GPT-5.1 Codex',
    description: 'Solid coding model for most tasks',
    optimizedForCode: true,
    costTier: 'medium',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5.1-codex-mini',
    label: 'GPT-5.1 Codex Mini',
    description: 'Cost-effective for fast, routine coding',
    optimizedForCode: true,
    costTier: 'low',
    reasoningLevels: ['Medium', 'High'],
  },
  {
    id: 'gpt-5-codex',
    label: 'GPT-5 Codex',
    description: 'Previous generation code-optimized model',
    optimizedForCode: true,
    costTier: 'medium',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5-codex-mini',
    label: 'GPT-5 Codex Mini',
    description: 'Smaller, cost-effective version of GPT-5-Codex',
    optimizedForCode: true,
    costTier: 'low',
  },

  // General-purpose models
  {
    id: 'gpt-5.2',
    label: 'GPT-5.2',
    description: 'Latest general-purpose model',
    optimizedForCode: false,
    costTier: 'high',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5.1',
    label: 'GPT-5.1',
    description: 'General-purpose agentic model',
    optimizedForCode: false,
    costTier: 'medium',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-5',
    label: 'GPT-5',
    description: 'Standard GPT-5 model',
    optimizedForCode: false,
    costTier: 'medium',
    reasoningLevels: ['Low', 'Medium', 'High', 'Extra high'],
  },
  {
    id: 'gpt-4.1',
    label: 'GPT-4.1',
    description: 'Cost-effective high-context model',
    optimizedForCode: false,
    costTier: 'low',
  },
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Multimodal model with vision support',
    optimizedForCode: false,
    costTier: 'medium',
  },

  // Mini models (cost-optimized)
  {
    id: 'gpt-5-mini',
    label: 'GPT-5 Mini',
    description: 'Lightweight model for high-volume tasks',
    optimizedForCode: false,
    costTier: 'low',
  },
  {
    id: 'o4-mini',
    label: 'o4 Mini',
    description: 'Optimized reasoning model (mini variant)',
    optimizedForCode: false,
    costTier: 'low',
  },
];

/**
 * Get all available Codex models.
 *
 * @returns Array of available Codex models
 */
export function getCodexModels(): CodexModel[] {
  return CODEX_MODELS;
}

type CodexModelsCache = {
  models?: Array<{
    slug?: string;
    display_name?: string;
    description?: string;
    supported_reasoning_levels?: Array<{ effort?: string }>;
  }>;
};

type ReasoningLevel = NonNullable<CodexModel['reasoningLevels']>[number];

function mapReasoningEffort(effort: string): ReasoningLevel | null {
  switch (effort) {
    case 'low':
      return 'Low';
    case 'medium':
      return 'Medium';
    case 'high':
      return 'High';
    // Codex cache uses "xhigh" (matches our "Extra high" label).
    case 'xhigh':
      return 'Extra high';
    default:
      return null;
  }
}

/**
 * Best-effort local discovery of Codex models from the Codex CLI cache.
 *
 * This is intentionally local-only (no network calls, no CLI subprocess).
 * When the Codex CLI has logged in at least once, it often writes:
 *   ~/.codex/models_cache.json
 *
 * If that file exists and parses, we can present the user's *actual*
 * available models instead of a potentially stale curated list.
 */
export async function discoverCodexModelsFromCache(): Promise<CodexModel[] | null> {
  try {
    const cachePath = join(homedir(), '.codex', 'models_cache.json');
    const raw = await readFile(cachePath, 'utf8');
    const parsed = JSON.parse(raw) as CodexModelsCache;
    const entries = Array.isArray(parsed.models) ? parsed.models : [];
    const models: CodexModel[] = [];

    for (const m of entries) {
      const id = typeof m.slug === 'string' ? m.slug.trim() : '';
      if (!id) continue;
      const label = typeof m.display_name === 'string' && m.display_name.trim() ? m.display_name.trim() : id;
      const description = typeof m.description === 'string' && m.description.trim() ? m.description.trim() : undefined;
      const reasoningLevels = Array.isArray(m.supported_reasoning_levels)
        ? (m.supported_reasoning_levels
          .map((r) => (typeof r.effort === 'string' ? mapReasoningEffort(r.effort) : null))
          .filter((v): v is NonNullable<typeof v> => v !== null))
        : undefined;

      models.push({
        id,
        label,
        description,
        optimizedForCode: id.includes('codex'),
        reasoningLevels: reasoningLevels && reasoningLevels.length > 0 ? Array.from(new Set(reasoningLevels)) : undefined,
      });
    }

    return models.length > 0 ? models : null;
  } catch {
    return null;
  }
}

/**
 * Return Codex models, preferring the local Codex cache when present.
 * When cache exists, merge with static list so cache ids take precedence
 * but any static-only models (e.g. newly documented) are still available.
 */
export async function getCodexModelsWithCache(): Promise<CodexModel[]> {
  const cached = await discoverCodexModelsFromCache();
  if (cached && cached.length > 0) {
    const staticModels = getCodexModels();
    const cachedIds = new Set(cached.map(m => m.id));
    const merged = [
      ...cached,
      ...staticModels.filter(m => !cachedIds.has(m.id)),
    ];
    return merged;
  }
  return getCodexModels();
}

/**
 * Get code-optimized Codex models.
 *
 * @returns Array of code-optimized models
 */
export function getCodeOptimizedModels(): CodexModel[] {
  return CODEX_MODELS.filter(m => m.optimizedForCode);
}

/**
 * Get model ID suggestions for Codex CLI.
 *
 * @returns Array of model IDs
 */
export function getCodexModelIds(): string[] {
  return CODEX_MODELS.map(m => m.id);
}

/**
 * P1-G06/P1-G09: Array of known Codex model IDs for capability discovery.
 */
export const KNOWN_CODEX_MODELS: readonly string[] = CODEX_MODELS.map(m => m.id);

/**
 * Get the recommended default model for Codex CLI.
 *
 * @returns Default model ID
 */
export function getDefaultCodexModel(): string {
  return 'gpt-5.3-codex';
}
