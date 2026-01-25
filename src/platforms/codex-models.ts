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

/**
 * Codex model interface for catalog entries.
 */
export interface CodexModel {
  id: string; // Model identifier (e.g., "gpt-5.2-codex")
  label: string; // Display name
  description?: string; // Brief description
  optimizedForCode?: boolean; // True if code-optimized
  costTier?: 'high' | 'medium' | 'low'; // Relative cost tier
}

/**
 * Available Codex models in OpenAI Codex CLI.
 */
export const CODEX_MODELS: CodexModel[] = [
  // Codex-optimized models (recommended for coding)
  {
    id: 'gpt-5.2-codex',
    label: 'GPT-5.2 Codex (Recommended)',
    description: 'Latest agentic coding model, excellent for complex engineering tasks',
    optimizedForCode: true,
    costTier: 'high',
  },
  {
    id: 'gpt-5.1-codex-max',
    label: 'GPT-5.1 Codex Max',
    description: 'Optimized for long, project-scale coding tasks',
    optimizedForCode: true,
    costTier: 'high',
  },
  {
    id: 'gpt-5.1-codex',
    label: 'GPT-5.1 Codex',
    description: 'Solid coding model for most tasks',
    optimizedForCode: true,
    costTier: 'medium',
  },
  {
    id: 'gpt-5.1-codex-mini',
    label: 'GPT-5.1 Codex Mini',
    description: 'Cost-effective for fast, routine coding',
    optimizedForCode: true,
    costTier: 'low',
  },
  {
    id: 'gpt-5-codex',
    label: 'GPT-5 Codex',
    description: 'Previous generation code-optimized model',
    optimizedForCode: true,
    costTier: 'medium',
  },

  // General-purpose models
  {
    id: 'gpt-5.2',
    label: 'GPT-5.2',
    description: 'Latest general-purpose model',
    optimizedForCode: false,
    costTier: 'high',
  },
  {
    id: 'gpt-5.1',
    label: 'GPT-5.1',
    description: 'General-purpose agentic model',
    optimizedForCode: false,
    costTier: 'medium',
  },
  {
    id: 'gpt-5',
    label: 'GPT-5',
    description: 'Standard GPT-5 model',
    optimizedForCode: false,
    costTier: 'medium',
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
  return 'gpt-5.2-codex';
}
