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
