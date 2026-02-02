/**
 * Promotion Rules Engine for RWM Puppet Master
 * 
 * Tracks AGENTS.md entry usage across tiers and promotes entries to higher levels
 * based on configurable rules (frequency, impact, universality).
 */

import { createHash } from 'crypto';
import { resolve } from 'path';
import type { AgentsLevel, AgentsManager, IterationContext } from '../memory/agents-manager.js';
import type { MultiLevelLoader } from './multi-level-loader.js';
import type { Pattern, Gotcha } from '../memory/agents-manager.js';

/**
 * Represents any entry in AGENTS.md (pattern, gotcha, do/don't item, etc.)
 */
export interface AgentsEntry {
  /** Type of entry */
  type: 'pattern' | 'gotcha' | 'do' | 'dont' | 'tooling' | 'architecture' | 'testing';
  /** The actual entry text/content */
  content: string;
  /** Which section it belongs to */
  section: string;
  /** Current hierarchy level */
  level: AgentsLevel;
  /** Optional metadata (e.g., fix for gotchas) */
  metadata?: Record<string, unknown>;
}

/**
 * Tracks usage statistics for an entry
 */
export interface EntryStats {
  /** Number of times entry has been used */
  occurrenceCount: number;
  /** ISO date string when first seen */
  firstSeen: string;
  /** ISO date string when last seen */
  lastSeen: string;
  /** Array of tier IDs where entry was used */
  usedInTiers: string[];
  /** Optional impact score (0-10) */
  impactScore?: number;
}

/**
 * Defines a rule for when to promote an entry
 */
export interface PromotionRule {
  /** Rule name/identifier */
  name: string;
  /** Condition function that returns true if entry should be promoted */
  condition: (entry: AgentsEntry, stats: EntryStats) => boolean;
  /** Target level to promote to */
  targetLevel: AgentsLevel;
  /** Priority (higher = evaluated first) */
  priority: number;
}

/**
 * Represents an entry eligible for promotion
 */
export interface PromotionCandidate {
  /** The entry to promote */
  entry: AgentsEntry;
  /** Current level of the entry */
  currentLevel: AgentsLevel;
  /** Target level to promote to */
  targetLevel: AgentsLevel;
  /** Name of rule that triggered promotion */
  rule: string;
  /** Confidence score (0-1) */
  confidence: number;
}

/**
 * Configuration for PromotionEngine
 */
export interface PromotionConfig {
  /** Minimum occurrence count for promotion (default: 3) */
  minOccurrenceForPromotion?: number;
  /** Minimum impact score for promotion (default: 8) */
  minImpactScore?: number;
  /** Minimum number of tiers for universal rule (default: 5) */
  minTiersForUniversal?: number;
  /** Enable automatic promotion (default: false) */
  enableAutoPromotion?: boolean;
}

/**
 * PromotionEngine class.
 * 
 * Tracks entry usage across tiers and evaluates entries against promotion rules.
 * Can promote entries to higher hierarchy levels based on frequency, impact, or universality.
 */
export class PromotionEngine {
  private rules: PromotionRule[] = [];
  private stats: Map<string, EntryStats> = new Map();
  private entries: Map<string, AgentsEntry> = new Map();
  private config: Required<PromotionConfig>;

  /**
   * Create a new PromotionEngine instance.
   * 
   * @param config - Configuration for the engine
   */
  constructor(config: PromotionConfig = {}) {
    this.config = {
      minOccurrenceForPromotion: config.minOccurrenceForPromotion ?? 3,
      minImpactScore: config.minImpactScore ?? 8,
      minTiersForUniversal: config.minTiersForUniversal ?? 5,
      enableAutoPromotion: config.enableAutoPromotion ?? false,
    };

    // Register default rules
    this.registerDefaultRules();
  }

  /**
   * Register a custom promotion rule.
   * 
   * @param rule - Rule to register
   */
  registerRule(rule: PromotionRule): void {
    this.rules.push(rule);
    // Sort by priority (higher first)
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Track usage of an entry in a specific tier.
   * 
   * @param entry - Entry that was used
   * @param tierId - Tier ID where entry was used (e.g., "PH-001", "TK-001-001")
   */
  trackUsage(entry: AgentsEntry, tierId: string): void {
    const entryId = this.generateEntryId(entry);
    const now = new Date().toISOString();

    // Store entry (update if exists to get latest level)
    this.entries.set(entryId, { ...entry });

    const existing = this.stats.get(entryId);
    if (existing) {
      // Update existing stats
      existing.occurrenceCount += 1;
      existing.lastSeen = now;
      if (!existing.usedInTiers.includes(tierId)) {
        existing.usedInTiers.push(tierId);
      }
      // Recalculate impact score
      existing.impactScore = this.calculateImpactScore(entry, existing);
    } else {
      // Create new stats
      this.stats.set(entryId, {
        occurrenceCount: 1,
        firstSeen: now,
        lastSeen: now,
        usedInTiers: [tierId],
        impactScore: this.calculateImpactScore(entry, {
          occurrenceCount: 1,
          firstSeen: now,
          lastSeen: now,
          usedInTiers: [tierId],
        }),
      });
    }
  }

  /**
   * Evaluate a single entry against promotion rules.
   * Returns the first matching promotion candidate, or null if no rules match.
   * 
   * @param entry - Entry to evaluate
   * @returns Promotion candidate or null
   */
  evaluate(entry: AgentsEntry): PromotionCandidate | null {
    const entryId = this.generateEntryId(entry);
    const stats = this.stats.get(entryId);

    // If no stats, entry hasn't been tracked yet
    if (!stats) {
      return null;
    }

    // Evaluate against all rules (sorted by priority)
    for (const rule of this.rules) {
      if (rule.condition(entry, stats)) {
        // Calculate confidence based on rule and stats
        const confidence = this.calculateConfidence(entry, stats, rule);

        return {
          entry,
          currentLevel: entry.level,
          targetLevel: rule.targetLevel,
          rule: rule.name,
          confidence,
        };
      }
    }

    return null;
  }

  /**
   * Get all promotion candidates from tracked entries.
   * 
   * @returns Array of promotion candidates
   */
  getPromotionCandidates(): PromotionCandidate[] {
    const candidates: PromotionCandidate[] = [];

    // Iterate through all tracked entries
    for (const [entryId] of this.stats.entries()) {
      const entry = this.entries.get(entryId);
      if (!entry) {
        // Skip if entry not found (shouldn't happen, but be safe)
        continue;
      }

      // Evaluate entry against rules
      const candidate = this.evaluate(entry);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    return candidates;
  }

  /**
   * Promote an entry to a higher level.
   * 
   * @param candidate - Promotion candidate to execute
   * @param loader - MultiLevelLoader for checking duplicates
   * @param agentsManager - AgentsManager for writing to AGENTS.md files
   * @param context - Optional iteration context (required for phase/task levels)
   */
  async promote(
    candidate: PromotionCandidate,
    loader: MultiLevelLoader,
    agentsManager: AgentsManager,
    context?: IterationContext
  ): Promise<void> {
    const { entry } = candidate;

    // Validate promotion hierarchy
    const parentLevel = this.getParentLevel(entry.level);
    if (!parentLevel) {
      throw new Error(`Cannot promote from ${entry.level}: already at root level`);
    }

    // For REPEATED_PATTERN rule, promote to parent level
    // For other rules, use the targetLevel from candidate
    let targetLevel = candidate.targetLevel;
    if (candidate.rule === 'REPEATED_PATTERN') {
      targetLevel = parentLevel;
    }

    if (targetLevel === entry.level) {
      throw new Error(`Cannot promote to same level: ${entry.level}`);
    }

    // Validate that target level is higher in hierarchy
    const hierarchy: AgentsLevel[] = ['task', 'phase', 'module', 'root'];
    const fromIndex = hierarchy.indexOf(entry.level);
    const toIndex = hierarchy.indexOf(targetLevel);
    if (toIndex <= fromIndex) {
      throw new Error(`Cannot promote from ${entry.level} to ${targetLevel}: destination must be higher`);
    }

    // Check if entry already exists at target level (deduplication)
    const exists = await this.checkEntryExists(entry, targetLevel, loader, agentsManager, context);
    if (exists) {
      // Entry already exists, skip promotion
      return;
    }

    // Add entry to target level using appropriate AgentsManager method
    await this.addEntryToLevel(entry, targetLevel, agentsManager, context);

    // Optionally remove from source level (not implemented by default)
    // This could be configurable
  }

  /**
   * Get statistics for a specific entry.
   * 
   * @param entry - Entry to get stats for
   * @returns Entry stats or undefined if not tracked
   */
  getStats(entry: AgentsEntry): EntryStats | undefined {
    const entryId = this.generateEntryId(entry);
    return this.stats.get(entryId);
  }

  /**
   * Clear all tracked statistics and entries.
   */
  clearStats(): void {
    this.stats.clear();
    this.entries.clear();
  }

  /**
   * Register default promotion rules.
   */
  private registerDefaultRules(): void {
    // REPEATED_PATTERN: occurrenceCount >= 3 → promote to parent
    this.registerRule({
      name: 'REPEATED_PATTERN',
      condition: (entry, stats) => {
        const parentLevel = this.getParentLevel(entry.level);
        if (!parentLevel) {
          return false; // Already at root
        }
        return stats.occurrenceCount >= this.config.minOccurrenceForPromotion;
      },
      targetLevel: 'root', // Will be dynamically set to parent in promote()
      priority: 10,
    });

    // HIGH_IMPACT_GOTCHA: impactScore >= 8 → promote to root
    this.registerRule({
      name: 'HIGH_IMPACT_GOTCHA',
      condition: (entry, stats) => {
        if (entry.type !== 'gotcha') {
          return false;
        }
        return (stats.impactScore ?? 0) >= this.config.minImpactScore;
      },
      targetLevel: 'root',
      priority: 20,
    });

    // UNIVERSAL_RULE: usedInTiers.length >= 5 → promote to root
    this.registerRule({
      name: 'UNIVERSAL_RULE',
      condition: (entry, stats) => {
        return stats.usedInTiers.length >= this.config.minTiersForUniversal;
      },
      targetLevel: 'root',
      priority: 15,
    });
  }

  /**
   * Generate a unique ID for an entry based on content, type, and section.
   * 
   * @param entry - Entry to generate ID for
   * @returns Unique entry ID (SHA-256 hash)
   */
  private generateEntryId(entry: AgentsEntry): string {
    const key = `${entry.type}:${entry.section}:${entry.content}`;
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Get the parent level in the hierarchy.
   * 
   * @param level - Current level
   * @returns Parent level or null if at root
   */
  private getParentLevel(level: AgentsLevel): AgentsLevel | null {
    const hierarchy: AgentsLevel[] = ['task', 'phase', 'module', 'root'];
    const index = hierarchy.indexOf(level);
    if (index === -1 || index === hierarchy.length - 1) {
      return null; // Already at root or invalid level
    }
    return hierarchy[index + 1]!;
  }

  /**
   * Calculate impact score for an entry based on usage statistics.
   * 
   * @param entry - Entry to calculate score for
   * @param stats - Usage statistics
   * @returns Impact score (0-10)
   */
  private calculateImpactScore(entry: AgentsEntry, stats: EntryStats): number {
    let score = 0;

    // Base score from occurrence count (max 4 points)
    score += Math.min(stats.occurrenceCount * 0.5, 4);

    // Bonus for universality (max 3 points)
    score += Math.min(stats.usedInTiers.length * 0.6, 3);

    // Bonus for gotchas (max 3 points)
    if (entry.type === 'gotcha') {
      score += 3;
    }

    // Cap at 10
    return Math.min(score, 10);
  }

  /**
   * Calculate confidence score for a promotion candidate.
   * 
   * @param entry - Entry being promoted
   * @param stats - Usage statistics
   * @param rule - Rule that triggered promotion
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(
    entry: AgentsEntry,
    stats: EntryStats,
    _rule: PromotionRule
  ): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence for more occurrences
    confidence += Math.min(stats.occurrenceCount / 10, 0.3);

    // Higher confidence for more tiers
    confidence += Math.min(stats.usedInTiers.length / 10, 0.2);

    // Cap at 1.0
    return Math.min(confidence, 1.0);
  }

  /**
   * Check if an entry already exists at a target level.
   * 
   * @param entry - Entry to check
   * @param targetLevel - Target level to check
   * @param loader - MultiLevelLoader for loading documents
   * @param agentsManager - AgentsManager for loading files
   * @param context - Optional iteration context (required for phase/task levels)
   * @returns True if entry exists
   */
  private async checkEntryExists(
    entry: AgentsEntry,
    targetLevel: AgentsLevel,
    loader: MultiLevelLoader,
    agentsManager: AgentsManager,
    context?: IterationContext
  ): Promise<boolean> {
    // For phase/task levels, we need context
    if ((targetLevel === 'phase' || targetLevel === 'task') && !context) {
      // Cannot check without context
      return false;
    }

    // Construct file path based on level
    // Note: We need to construct paths similar to AgentsManager.getFilePath
    // Since that's private, we'll construct them here
    let filePath: string;
    const projectRoot = process.cwd(); // Default, could be passed in config
    
    if (targetLevel === 'root') {
      filePath = resolve(projectRoot, 'AGENTS.md');
    } else if (targetLevel === 'phase' && context) {
      filePath = resolve(projectRoot, '.puppet-master', 'agents', `phase-${context.phaseId}.md`);
    } else if (targetLevel === 'task' && context) {
      filePath = resolve(projectRoot, '.puppet-master', 'agents', `task-${context.taskId}.md`);
    } else {
      // Module or unknown - cannot check easily
      return false;
    }

    // Load the target level file
    try {
      const content = await agentsManager.loadFile(filePath, targetLevel);
      const sections = content.sections;

      // Check appropriate section based on entry type
      // Use normalized comparison (trim, case-insensitive for content matching)
      const normalizedContent = entry.content.trim().toLowerCase();
      
      switch (entry.type) {
        case 'pattern':
          return sections.codebasePatterns.some(
            p => p.trim().toLowerCase().includes(normalizedContent)
          );
        case 'gotcha':
          return sections.commonFailureModes.some(
            fm => fm.description.trim().toLowerCase().includes(normalizedContent)
          );
        case 'do':
          return sections.doItems.some(
            item => item.trim().toLowerCase().includes(normalizedContent)
          );
        case 'dont':
          return sections.dontItems.some(
            item => item.trim().toLowerCase().includes(normalizedContent)
          );
        case 'tooling':
          return sections.toolingRules.some(
            rule => rule.trim().toLowerCase().includes(normalizedContent)
          );
        case 'architecture':
          return sections.architectureNotes.some(
            note => note.trim().toLowerCase().includes(normalizedContent)
          );
        case 'testing':
          return sections.testing.some(
            test => test.trim().toLowerCase().includes(normalizedContent)
          );
        default:
          return false;
      }
    } catch {
      // File doesn't exist, entry doesn't exist
      return false;
    }
  }

  /**
   * Add an entry to a specific level using AgentsManager.
   * 
   * @param entry - Entry to add
   * @param targetLevel - Target level
   * @param agentsManager - AgentsManager instance
   * @param context - Optional iteration context
   */
  private async addEntryToLevel(
    entry: AgentsEntry,
    targetLevel: AgentsLevel,
    agentsManager: AgentsManager,
    context?: IterationContext
  ): Promise<void> {
    switch (entry.type) {
      case 'pattern': {
        const pattern: Pattern = {
          description: entry.content,
          context: entry.metadata?.context as string | undefined,
        };
        await agentsManager.addPattern(pattern, targetLevel, context);
        break;
      }
      case 'gotcha': {
        const gotcha: Gotcha = {
          description: entry.content,
          fix: (entry.metadata?.fix as string) || 'No fix provided',
        };
        await agentsManager.addGotcha(gotcha, targetLevel, context);
        break;
      }
      case 'do':
        await this.addGenericItem(entry, targetLevel, agentsManager, context, 'DO', `- ✅ ${entry.content}`);
        break;
      case 'dont':
        await this.addGenericItem(entry, targetLevel, agentsManager, context, "DON'T", `- ❌ ${entry.content}`);
        break;
      case 'tooling':
        await this.addGenericItem(entry, targetLevel, agentsManager, context, 'Tooling Rules', `- ${entry.content}`);
        break;
      case 'architecture':
        await this.addGenericItem(entry, targetLevel, agentsManager, context, 'Architecture Notes', `- ${entry.content}`);
        break;
      case 'testing':
        await this.addGenericItem(entry, targetLevel, agentsManager, context, 'Testing', `- ${entry.content}`);
        break;
      default:
        throw new Error(`Unknown entry type: ${(entry as AgentsEntry).type}`);
    }
  }

  /**
   * Add a generic item to a specific section of an AGENTS.md file.
   * This is a helper method for entry types that don't have dedicated
   * AgentsManager methods (do, dont, tooling, architecture, testing).
   *
   * @param entry - Entry to add
   * @param targetLevel - Target level
   * @param agentsManager - AgentsManager instance
   * @param context - Optional iteration context
   * @param sectionName - Name of the markdown section
   * @param formattedItem - The formatted item text to append
   */
  private async addGenericItem(
    entry: AgentsEntry,
    targetLevel: AgentsLevel,
    agentsManager: AgentsManager,
    context: IterationContext | undefined,
    sectionName: string,
    formattedItem: string
  ): Promise<void> {
    // Construct file path based on level
    const projectRoot = process.cwd();
    let filePath: string;

    if (targetLevel === 'root') {
      filePath = resolve(projectRoot, 'AGENTS.md');
    } else if (targetLevel === 'phase' && context) {
      filePath = resolve(projectRoot, '.puppet-master', 'agents', `phase-${context.phaseId}.md`);
    } else if (targetLevel === 'task' && context) {
      filePath = resolve(projectRoot, '.puppet-master', 'agents', `task-${context.taskId}.md`);
    } else if (targetLevel === 'module') {
      // Module level requires additional path resolution
      console.warn(`Promotion to module level for type ${entry.type} requires explicit path resolution. Skipping.`);
      return;
    } else {
      throw new Error(`Cannot add ${entry.type} to ${targetLevel} level without proper context`);
    }

    // Read existing content or create new file
    let content: string;
    try {
      content = await agentsManager.read(filePath);
    } catch {
      content = '# AGENTS.md\n\n';
    }

    // Append to section using the same pattern as AgentsManager.appendToSection
    const updated = this.appendToSection(content, sectionName, formattedItem);
    await agentsManager.write(filePath, updated);
  }

  /**
   * Append an item to a section in markdown content.
   * This mirrors the private appendToSection method in AgentsManager.
   *
   * @param content - Markdown content
   * @param sectionName - Name of section
   * @param item - Item to append
   * @returns Updated markdown content
   */
  private appendToSection(content: string, sectionName: string, item: string): string {
    const sectionHeaderPattern = new RegExp(`^##\\s+${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
    const match = content.match(sectionHeaderPattern);

    if (match) {
      // Section exists, find where it ends
      const headerStart = match.index!;
      const headerEnd = headerStart + match[0].length;

      // Find next section or end of file
      const remaining = content.substring(headerEnd);
      const nextSectionMatch = remaining.match(/^##\s+/m);
      const sectionEnd = nextSectionMatch
        ? headerEnd + nextSectionMatch.index!
        : content.length;

      const sectionContent = content.substring(headerEnd, sectionEnd).trim();

      // Append item to section content
      const newSectionContent = sectionContent
        ? `${sectionContent}\n${item}`
        : item;

      // Reconstruct content
      const beforeSection = content.substring(0, headerEnd);
      const afterSection = content.substring(sectionEnd);

      return beforeSection + '\n' + newSectionContent + (afterSection ? '\n' + afterSection : '');
    }

    // Section doesn't exist, create it at the end
    const newSection = `\n## ${sectionName}\n\n${item}\n`;
    return content.trim() + newSection;
  }
}
