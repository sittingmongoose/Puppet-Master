/**
 * Gemini CLI Supported Models
 *
 * Curated list of models available in Gemini CLI.
 * This is a baseline set; users can specify custom model IDs in config.
 *
 * Preview Models:
 * - Models marked with `preview: true` (gemini-3-pro-preview, gemini-3-flash-preview)
 *   require preview features to be enabled in Gemini CLI settings.
 * - Enable preview features via: `general.previewFeatures: true` in `~/.gemini/settings.json`
 *   or use `/settings` command in interactive mode.
 * - Preview models may not be available on all account types.
 *
 * Model Selection:
 * - `auto` (recommended) - Automatic model selection based on task complexity
 * - Pro models (gemini-2.5-pro, gemini-3-pro-preview) - Best for complex reasoning
 * - Flash models (gemini-2.5-flash, gemini-2.5-flash-lite, gemini-3-flash-preview) - Fast, efficient
 *
 * Sources:
 * - https://geminicli.com/docs/cli/model - Model selection documentation
 * - https://geminicli.com/docs/get-started/gemini-3 - Gemini 3 preview information
 * - https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json
 */

/**
 * Gemini model interface for catalog entries.
 */
export interface GeminiModel {
  id: string; // Model identifier (e.g., "gemini-2.5-pro")
  label: string; // Display name
  description?: string; // Brief description
  preview?: boolean; // True if preview/experimental
}

/**
 * Baseline Gemini models available in Gemini CLI.
 *
 * These are the documented, stable models. Users can override with custom model IDs.
 */
export const GEMINI_MODELS: GeminiModel[] = [
  {
    id: 'auto',
    label: 'Auto (Recommended)',
    description: 'Automatic model selection based on task complexity',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    description: 'Latest high-capability model for complex reasoning and code generation',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    description: 'Fast, efficient model for general-purpose tasks',
  },
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash Lite',
    description: 'Lightweight model for simple tasks with minimal latency',
  },
  {
    id: 'gemini-3-pro-preview',
    label: 'Gemini 3 Pro (Preview)',
    description: 'Next-generation model with enhanced capabilities (requires preview features enabled)',
    preview: true,
  },
  {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash (Preview)',
    description: 'Preview flash variant with improved performance',
    preview: true,
  },
];

/**
 * Get all available Gemini models.
 *
 * @returns Array of available Gemini models
 */
export function getGeminiModels(): GeminiModel[] {
  return GEMINI_MODELS;
}

/**
 * Get stable (non-preview) Gemini models.
 *
 * Useful for environments where preview models are not enabled.
 *
 * @returns Array of stable Gemini models
 */
export function getStableGeminiModels(): GeminiModel[] {
  return GEMINI_MODELS.filter(m => !m.preview);
}

/**
 * Get model ID suggestions for Gemini CLI.
 *
 * This is used by the GUI to populate model selection dropdowns.
 *
 * @returns Array of model IDs
 */
export function getGeminiModelIds(): string[] {
  return GEMINI_MODELS.map(m => m.id);
}

/**
 * P1-G06/P1-G09: Array of known Gemini model IDs for capability discovery.
 */
export const KNOWN_GEMINI_MODELS: readonly string[] = GEMINI_MODELS.map(m => m.id);
