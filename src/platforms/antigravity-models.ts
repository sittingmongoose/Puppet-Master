/**
 * Google Antigravity Supported Models
 *
 * NOTE: This is informational only.
 * Antigravity is an IDE without headless execution support in Puppet Master.
 *
 * Antigravity supports a variety of models for its Agent through the IDE UI:
 * - Google Gemini models (various)
 * - Anthropic Claude models (Sonnet, Opus)
 * - OpenAI GPT models
 * - Open-source models (when available)
 *
 * Model selection happens interactively within Antigravity IDE.
 * This list is provided for reference and future use if Antigravity adds headless support.
 *
 * Sources:
 * - https://antigravity.google/assets/docs/agent/models.md
 * - https://codelabs.developers.google.com/getting-started-google-antigravity
 */

/**
 * Antigravity model interface for catalog entries.
 */
export interface AntigravityModel {
  id: string; // Model identifier
  label: string; // Display name in Antigravity UI
  provider: 'gemini' | 'claude' | 'openai' | 'other'; // Model provider
  description?: string; // Brief description
  availability?: 'standard' | 'preview' | 'limited'; // Availability status
}

/**
 * Models available in Antigravity IDE.
 *
 * Availability depends on:
 * - Account/subscription tier
 * - Regional availability
 * - Organization policies (for Antigravity Enterprise)
 * - API key configuration
 */
export const ANTIGRAVITY_MODELS: AntigravityModel[] = [
  // Google Gemini Models
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Latest Google high-capability model for complex reasoning',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Fast, efficient Google model for general-purpose tasks',
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    description: 'Lightweight Google model for simple tasks',
  },
  {
    id: 'gemini-3-pro-preview',
    label: 'Gemini 3 Pro (Preview)',
    provider: 'gemini',
    description: 'Next-generation Google model (preview)',
    availability: 'preview',
  },

  // Anthropic Claude Models
  {
    id: 'claude-opus',
    label: 'Claude Opus',
    provider: 'claude',
    description: 'Latest high-capability Anthropic Claude model',
  },
  {
    id: 'claude-sonnet',
    label: 'Claude 3.5 Sonnet',
    provider: 'claude',
    description: 'Balanced Claude model for most tasks',
  },
  {
    id: 'claude-haiku',
    label: 'Claude 3 Haiku',
    provider: 'claude',
    description: 'Lightweight Claude model for simple tasks',
  },

  // OpenAI GPT Models
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    provider: 'openai',
    description: 'Latest OpenAI model',
  },
  {
    id: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'High-capability OpenAI model',
  },
  {
    id: 'gpt-4',
    label: 'GPT-4',
    provider: 'openai',
    description: 'General-purpose OpenAI model',
  },

  // Open-source / Other
  {
    id: 'llama-2',
    label: 'Llama 2',
    provider: 'other',
    description: 'Open-source model (if available)',
    availability: 'limited',
  },
];

/**
 * Get all Antigravity models.
 *
 * @returns Array of available models in Antigravity
 */
export function getAntigravityModels(): AntigravityModel[] {
  return ANTIGRAVITY_MODELS;
}

/**
 * Get Antigravity models grouped by provider.
 *
 * @returns Object with models grouped by provider
 */
export function getAntigravityModelsByProvider(): Record<string, AntigravityModel[]> {
  const grouped: Record<string, AntigravityModel[]> = {
    gemini: [],
    claude: [],
    openai: [],
    other: [],
  };

  for (const model of ANTIGRAVITY_MODELS) {
    if (grouped[model.provider]) {
      grouped[model.provider].push(model);
    }
  }

  return grouped;
}

/**
 * Get model ID suggestions for Antigravity.
 *
 * NOTE: This is informational only. Antigravity does not support headless execution in Puppet Master.
 *
 * @returns Array of model IDs
 */
export function getAntigravityModelIds(): string[] {
  return ANTIGRAVITY_MODELS.map(m => m.id);
}

/**
 * Get disclaimer text for Antigravity model information.
 *
 * Since Antigravity doesn't support headless execution, explain that model selection
 * happens interactively within Antigravity IDE.
 */
export function getAntigravityModelSelectionNote(): string {
  return (
    'Note: Antigravity is an IDE that does not support headless execution. ' +
    'Model selection happens interactively within the Antigravity UI. ' +
    'Available models depend on your subscription and API key configuration. ' +
    'For headless automation, use Gemini CLI or Copilot CLI instead.'
  );
}
