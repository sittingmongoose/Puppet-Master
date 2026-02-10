/**
 * Gemini CLI Supported Models
 *
 * Curated list of models available in Gemini CLI.
 * This is a baseline set; users can specify custom model IDs in config.
 *
 * Preview Models:
 * - Models marked with `preview: true` (gemini-3-pro-preview, gemini-3-flash-preview)
 *   require preview features to be enabled in Gemini CLI settings.
 * - Enable via: Settings → Preview Features in the Gemini CLI, or
 *   `general.previewFeatures: true` in `~/.gemini/settings.json`.
 * - Preview models may not be available on all account types.
 *
 * Model Selection:
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
    id: 'gemini-3-pro-preview',
    label: 'Gemini 3 Pro (Preview)',
    description: 'Preview model (may require preview features enabled)',
    preview: true,
  },
  {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash (Preview)',
    description: 'Preview flash variant (may require preview features enabled)',
    preview: true,
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

/**
 * Discovered Gemini model information with source tracking.
 */
export interface DiscoveredGeminiModel extends GeminiModel {
  source: 'discovered' | 'static';
}

/**
 * Discover Gemini models.
 *
 * IMPORTANT:
 * Gemini CLI does not currently expose a stable, non-interactive "list models"
 * subcommand/flag across versions. In Gemini CLI v0.26.x, `gemini models` is
 * treated as a prompt ("models") and can trigger API calls, slowdowns, and
 * quota errors.
 *
 * Puppet Master intentionally avoids billable/slow model discovery here and
 * relies on curated static model IDs + manual entry.
 *
 * @returns Always null (safe discovery not supported)
 */
export async function discoverGeminiModels(
  _command: string = 'gemini',
  _timeoutMs: number = 5000
): Promise<DiscoveredGeminiModel[] | null> {
  return null;
}

/**
 * Parse model list from Gemini CLI output.
 * Handles various output formats (JSON, plain text, table).
 */
// NOTE: We intentionally do not attempt dynamic model listing via `gemini models` in this project.
// See discoverGeminiModels() docstring for rationale.

/**
 * Get Gemini models with discovery fallback.
 * 
 * @param command - Gemini CLI command (default: 'gemini')
 * @param useCache - Whether to use cached discovery results (default: true)
 * @returns Models with source information
 */
let cachedDiscoveredModels: DiscoveredGeminiModel[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 3600_000; // 1 hour

export async function getGeminiModelsWithDiscovery(
  command: string = 'gemini',
  useCache: boolean = true
): Promise<DiscoveredGeminiModel[]> {
  // Check cache
  if (useCache && cachedDiscoveredModels && Date.now() - cacheTimestamp < CACHE_TTL_MS) {
    return cachedDiscoveredModels;
  }

  // Discovery is intentionally disabled (see discoverGeminiModels docstring).
  // Always return static list.
  void command;
  const staticModels = GEMINI_MODELS.map(m => ({ ...m, source: 'static' as const }));
  cachedDiscoveredModels = staticModels;
  cacheTimestamp = Date.now();
  return staticModels;
}
