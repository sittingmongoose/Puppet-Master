/**
 * GitHub Copilot CLI Supported Models
 *
 * IMPORTANT: This is a suggested list only.
 * The authoritative source for available models is the `/model` command inside Copilot CLI.
 * Available models vary by:
 * - GitHub Copilot subscription tier (Individual, Business, Enterprise)
 * - Account region and availability
 * - Organizations and enterprise policies
 *
 * Copilot CLI does NOT support the `--model` flag for programmatic model selection.
 * Users must select models interactively via `/model` command.
 *
 * Sources:
 * - https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli
 * - https://github.com/github/copilot-cli
 */

/**
 * Copilot model interface for catalog entries.
 */
export interface CopilotModel {
  id: string; // Model identifier (e.g., "gpt-4o")
  label: string; // Display name
  description?: string; // Brief description
  suggestedOnly?: boolean; // True if not officially documented but likely available
}

/**
 * Suggested Copilot models (non-authoritative).
 *
 * These are models commonly available in Copilot CLI based on documentation,
 * but availability depends on subscription tier and region.
 * The `/model` command inside Copilot is the source of truth.
 */
export const COPILOT_MODELS: CopilotModel[] = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o (Default)',
    description: 'Latest OpenAI model (recommended for most tasks)',
  },
  {
    id: 'gpt-4-turbo',
    label: 'GPT-4 Turbo',
    description: 'High-capability model for complex reasoning',
  },
  {
    id: 'gpt-4',
    label: 'GPT-4',
    description: 'Stable, general-purpose model',
  },
  {
    id: 'claude-3.5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Anthropic Claude model (if available)',
    suggestedOnly: true,
  },
  {
    id: 'claude-opus',
    label: 'Claude Opus',
    description: 'High-capability Claude variant (if available)',
    suggestedOnly: true,
  },
];

/**
 * Get all suggested Copilot models.
 *
 * @returns Array of suggested Copilot models
 */
export function getCopilotModels(): CopilotModel[] {
  return COPILOT_MODELS;
}

/**
 * Get official (non-suggested) Copilot models.
 *
 * @returns Array of officially documented Copilot models
 */
export function getOfficialCopilotModels(): CopilotModel[] {
  return COPILOT_MODELS.filter(m => !m.suggestedOnly);
}

/**
 * Get model ID suggestions for Copilot CLI.
 *
 * IMPORTANT: This is for GUI suggestions only.
 * Copilot CLI does not support `--model` flag. Users must select models via `/model` command.
 *
 * @returns Array of model IDs
 */
export function getCopilotModelIds(): string[] {
  return COPILOT_MODELS.map(m => m.id);
}

/**
 * Get disclaimer text for Copilot model selection in GUI.
 *
 * Since Copilot doesn't support `--model` programmatically, inform users that
 * model selection happens inside Copilot CLI.
 */
export function getCopilotModelSelectionNote(): string {
  return (
    'Note: Copilot CLI does not support the --model flag. ' +
    'Use the `/model` command inside Copilot to change models. ' +
    'Available models depend on your subscription tier and region.'
  );
}
