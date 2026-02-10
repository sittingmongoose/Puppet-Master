/**
 * Claude Code CLI Supported Models (P1-G07)
 *
 * Curated list of models available in Claude Code (Anthropic CLI).
 *
 * Model Aliases:
 * - Claude Code supports friendly aliases that point to the latest stable version
 * - "default" -> Claude Sonnet 4.5 (recommended default)
 * - "sonnet" -> Claude Sonnet 4.5 (latest)
 * - "opus" -> Claude Opus 4.6 (latest)
 * - "haiku" -> Claude Haiku (latest)
 * - Suffix [1m] for 1 million token context window
 * - "opusplan" for hybrid planning (Opus for planning, Sonnet for execution)
 *
 * Model Selection:
 * - Use `claude --model <alias-or-id>` to specify model
 * - Use `/model <alias>` in interactive mode
 * - Set `ANTHROPIC_MODEL` environment variable for persistence
 *
 * Sources:
 * - https://code.claude.com/docs/en/model-config
 * - https://platform.claude.com/docs/en/about-claude/models/overview
 */

/**
 * Claude model interface for catalog entries.
 */
export interface ClaudeModel {
  id: string; // Model identifier or alias
  label: string; // Display name
  description?: string; // Brief description
  alias?: boolean; // True if this is an alias (auto-updates)
  contextWindow?: string; // Context window size
  /** Effort levels for Opus 4.6 only. Per model-config: low, medium, high */
  reasoningLevels?: ('Low' | 'Medium' | 'High')[];
}

/**
 * Available Claude models in Claude Code CLI.
 */
export const CLAUDE_MODELS: ClaudeModel[] = [
  // Aliases (recommended for most users)
  {
    id: 'default',
    label: 'Default (Recommended, Sonnet v4.5 alias)',
    description: 'Claude Code default model alias (currently Sonnet 4.5)',
    alias: true,
    contextWindow: '200K',
  },
  {
    id: 'sonnet',
    label: 'Sonnet (v4.5 alias)',
    description: 'Latest Claude Sonnet - fast, accurate, balanced cost',
    alias: true,
    contextWindow: '200K',
  },
  {
    id: 'opus',
    label: 'Opus (v4.6 alias)',
    description: 'Latest Claude Opus - highest capability for complex reasoning',
    alias: true,
    contextWindow: '200K',
    reasoningLevels: ['Low', 'Medium', 'High'],
  },
  {
    id: 'haiku',
    label: 'Haiku (alias)',
    description: 'Fastest, most affordable model for simple tasks',
    alias: true,
    contextWindow: '200K',
  },
  {
    id: 'opusplan',
    label: 'Opus Plan (Opus v4.6 + Sonnet v4.5)',
    description: 'Hybrid mode: Opus for planning, Sonnet for execution',
    alias: true,
    contextWindow: '200K',
  },

  // Extended context variants
  {
    id: 'sonnet[1m]',
    label: 'Sonnet (1M Context)',
    description: 'Sonnet with 1 million token context window',
    alias: true,
    contextWindow: '1M',
  },
  {
    id: 'opus[1m]',
    label: 'Opus (1M Context)',
    description: 'Opus with 1 million token context window',
    alias: true,
    contextWindow: '1M',
    reasoningLevels: ['Low', 'Medium', 'High'],
  },

  // Specific model versions (for reproducibility)
  {
    id: 'claude-sonnet-4-5',
    label: 'Claude Sonnet 4.5 (Pinned)',
    description: 'Pinned Sonnet 4.5 model ID (claude-sonnet-4-5)',
    contextWindow: '200K',
  },
  {
    id: 'claude-opus-4-6',
    label: 'Claude Opus 4.6 (Pinned)',
    description: 'Pinned Opus 4.6 model ID (claude-opus-4-6)',
    contextWindow: '200K',
    reasoningLevels: ['Low', 'Medium', 'High'],
  },
  {
    id: 'claude-haiku-4-5',
    label: 'Claude Haiku 4.5 (Pinned)',
    description: 'Pinned Haiku 4.5 model ID (claude-haiku-4-5)',
    contextWindow: '200K',
  },

];

/**
 * Get all available Claude models.
 *
 * @returns Array of available Claude models
 */
export function getClaudeModels(): ClaudeModel[] {
  return CLAUDE_MODELS;
}

/**
 * Get alias models (recommended for auto-updating).
 *
 * @returns Array of alias models
 */
export function getClaudeAliasModels(): ClaudeModel[] {
  return CLAUDE_MODELS.filter(m => m.alias);
}

/**
 * Get model ID suggestions for Claude Code.
 *
 * @returns Array of model IDs
 */
export function getClaudeModelIds(): string[] {
  return CLAUDE_MODELS.map(m => m.id);
}

/**
 * P1-G06/P1-G09: Array of known Claude model IDs for capability discovery.
 */
export const KNOWN_CLAUDE_MODELS: readonly string[] = CLAUDE_MODELS.map(m => m.id);

/**
 * Get the recommended default model for Claude Code.
 *
 * @returns Default model ID
 */
export function getDefaultClaudeModel(): string {
  return 'default';
}
