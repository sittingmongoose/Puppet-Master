/**
 * Requirements Inventory Builder for RWM Puppet Master
 *
 * Extracts atomic requirements from parsed source documents.
 * Uses heuristic extraction first, then optional AI refinement.
 *
 * See P1-T20: Start Chain - Requirements Inventory (Atomic REQ Units)
 */

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';
import type { PlatformRegistry } from '../platforms/registry.js';
import type { QuotaManager } from '../platforms/quota-manager.js';
import type { PuppetMasterConfig } from '../types/config.js';
import type { UsageTracker } from '../memory/usage-tracker.js';
import type {
  RequirementUnit,
  RequirementKind,
  RequirementSeverity,
  RequirementsInventory,
  InventoryMetadata,
  InventoryStats,
  IdMap,
  InventoryConfig,
  HeuristicCandidate,
  InventoryResult,
} from '../types/requirements-inventory.js';
import { DEFAULT_INVENTORY_CONFIG } from '../types/requirements-inventory.js';
import { buildInventoryPrompt } from './prompts/inventory-prompt.js';

/**
 * Current schema version for inventory files.
 */
const SCHEMA_VERSION = '1.0.0';

/**
 * Current schema version for ID map files.
 */
const ID_MAP_VERSION = '1.0.0';

/**
 * Builder class for generating requirements inventories.
 */
export class RequirementsInventoryBuilder {
  private readonly config: InventoryConfig;
  private readonly platformRegistry?: PlatformRegistry;
  private readonly quotaManager?: QuotaManager;
  private readonly puppetMasterConfig?: PuppetMasterConfig;
  private readonly usageTracker?: UsageTracker;

  constructor(
    config?: Partial<InventoryConfig>,
    platformRegistry?: PlatformRegistry,
    quotaManager?: QuotaManager,
    puppetMasterConfig?: PuppetMasterConfig,
    usageTracker?: UsageTracker
  ) {
    this.config = { ...DEFAULT_INVENTORY_CONFIG, ...config };
    this.platformRegistry = platformRegistry;
    this.quotaManager = quotaManager;
    this.puppetMasterConfig = puppetMasterConfig;
    this.usageTracker = usageTracker;
  }

  /**
   * Build a requirements inventory from parsed requirements.
   *
   * @param parsed - Parsed requirements document
   * @param projectPath - Project path for loading/saving ID map
   * @param useAI - Whether to use AI refinement (default: based on config)
   * @returns Inventory result with inventory, ID map, and warnings
   */
  async build(
    parsed: ParsedRequirements,
    projectPath: string,
    useAI?: boolean
  ): Promise<InventoryResult> {
    const warnings: string[] = [];
    const shouldUseAI = useAI ?? this.config.enableAIRefinement;

    // Step 1: Load existing ID map for stable IDs
    const idMap = await this.loadIdMap(projectPath);

    // Step 2: Extract heuristic candidates
    const candidates = this.extractHeuristicCandidates(parsed);

    if (candidates.length === 0) {
      warnings.push('No requirement candidates found via heuristic extraction');
    }

    // Step 3: Validate extraction coverage
    const minExpected = Math.floor(
      (parsed.rawText.length / 1000) * this.config.minRequirementsPerKChars
    );
    if (candidates.length < minExpected && minExpected > 0) {
      warnings.push(
        `Suspiciously few requirements extracted: ${candidates.length} found, expected at least ${minExpected} based on document size`
      );
    }

    // Step 4: Optionally refine with AI
    let units: RequirementUnit[];
    let aiRefined = false;

    if (shouldUseAI && this.platformRegistry && this.quotaManager && candidates.length > 0) {
      try {
        units = await this.refineWithAI(parsed, candidates, idMap);
        aiRefined = true;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        warnings.push(`AI refinement failed, using heuristic results: ${errorMsg}`);
        units = this.convertCandidatesToUnits(candidates, idMap);
      }
    } else {
      units = this.convertCandidatesToUnits(candidates, idMap);
    }

    // Step 5: Apply max limit if configured
    if (this.config.maxRequirements > 0 && units.length > this.config.maxRequirements) {
      warnings.push(
        `Truncated requirements from ${units.length} to ${this.config.maxRequirements} (maxRequirements limit)`
      );
      units = units.slice(0, this.config.maxRequirements);
    }

    // Step 6: Compute stats
    const stats = this.computeStats(units);

    // Step 7: Build inventory
    const inventory: RequirementsInventory = {
      metadata: this.buildMetadata(parsed, !aiRefined),
      units,
      stats,
    };

    // Step 8: Update ID map timestamp
    idMap.updatedAt = new Date().toISOString();

    return {
      inventory,
      idMap,
      aiRefined,
      warnings,
    };
  }

  /**
   * Extract heuristic candidates from parsed requirements.
   * Identifies bullets, numbered lists, prose with keywords, and table rows.
   */
  extractHeuristicCandidates(parsed: ParsedRequirements): HeuristicCandidate[] {
    const candidates: HeuristicCandidate[] = [];

    // Walk all sections
    this.walkSections(parsed.sections, parsed.title || '', (section, sectionPath) => {
      const content = section.content;
      if (!content.trim()) return;

      // Extract bullets (lines starting with -, *, •)
      const bulletMatches = content.match(/^[\s]*[-*•]\s+.+$/gm);
      if (bulletMatches) {
        for (const match of bulletMatches) {
          const text = match.replace(/^[\s]*[-*•]\s+/, '').trim();
          if (text.length > 10) {
            // Minimum length filter
            candidates.push({
              text,
              sectionPath,
              sourceType: 'bullet',
              detectedSeverity: this.detectSeverity(text),
            });
          }
        }
      }

      // Extract numbered lists (1., 2., etc.)
      const numberedMatches = content.match(/^[\s]*\d+[.)]\s+.+$/gm);
      if (numberedMatches) {
        for (const match of numberedMatches) {
          const text = match.replace(/^[\s]*\d+[.)]\s+/, '').trim();
          if (text.length > 10) {
            candidates.push({
              text,
              sectionPath,
              sourceType: 'numbered',
              detectedSeverity: this.detectSeverity(text),
            });
          }
        }
      }

      // Extract prose sentences with requirement keywords
      const sentences = content.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && this.hasRequirementKeyword(trimmed)) {
          // Avoid duplicates from bullet/numbered extraction
          const isDuplicate = candidates.some(
            (c) => c.text === trimmed || trimmed.includes(c.text) || c.text.includes(trimmed)
          );
          if (!isDuplicate) {
            candidates.push({
              text: trimmed,
              sectionPath,
              sourceType: 'prose',
              detectedSeverity: this.detectSeverity(trimmed),
            });
          }
        }
      }

      // Extract table rows (lines with | separators)
      const tableRows = content.match(/^\|.+\|$/gm);
      if (tableRows) {
        for (const row of tableRows) {
          // Skip header separator rows
          if (row.includes('---')) continue;
          const cells = row
            .split('|')
            .filter((c) => c.trim())
            .map((c) => c.trim());
          const text = cells.join(' | ');
          if (text.length > 10 && this.hasRequirementKeyword(text)) {
            candidates.push({
              text,
              sectionPath,
              sourceType: 'table',
              detectedSeverity: this.detectSeverity(text),
            });
          }
        }
      }
    });

    // Also extract from extractedGoals and extractedConstraints
    for (const goal of parsed.extractedGoals) {
      candidates.push({
        text: goal,
        sectionPath: 'Goals',
        sourceType: 'bullet',
        detectedSeverity: 'should',
      });
    }

    for (const constraint of parsed.extractedConstraints) {
      candidates.push({
        text: constraint,
        sectionPath: 'Constraints',
        sourceType: 'bullet',
        detectedSeverity: 'must',
      });
    }

    return candidates;
  }

  /**
   * Convert heuristic candidates to requirement units.
   */
  convertCandidatesToUnits(candidates: HeuristicCandidate[], idMap: IdMap): RequirementUnit[] {
    const units: RequirementUnit[] = [];

    for (const candidate of candidates) {
      const excerptHash = this.computeExcerptHash(candidate.text);
      const id = this.getOrAssignId(excerptHash, idMap);

      units.push({
        id,
        sectionPath: candidate.sectionPath,
        excerpt: candidate.text,
        excerptHash,
        kind: this.classifyKind(candidate.text),
        severity: candidate.detectedSeverity || 'should',
        lineNumbers: candidate.lineNumbers,
      });
    }

    return units;
  }

  /**
   * Refine heuristic candidates with AI.
   */
  private async refineWithAI(
    parsed: ParsedRequirements,
    candidates: HeuristicCandidate[],
    idMap: IdMap
  ): Promise<RequirementUnit[]> {
    if (!this.platformRegistry || !this.quotaManager) {
      throw new Error('Platform registry and quota manager required for AI refinement');
    }

    // Build the prompt
    const prompt = buildInventoryPrompt(parsed, candidates);

    // Get platform and model from config
    const platform =
      this.puppetMasterConfig?.startChain?.inventory?.platform ||
      this.puppetMasterConfig?.tiers?.phase?.platform ||
      'cursor';
    const model =
      this.puppetMasterConfig?.startChain?.inventory?.model ||
      this.puppetMasterConfig?.tiers?.phase?.model ||
      'claude-sonnet-4-20250514';

    // Check quota
    const hasQuota = await this.quotaManager.checkQuota(platform);
    if (!hasQuota) {
      throw new Error(`No quota available for platform: ${platform}`);
    }

    // Get runner
    const runner = this.platformRegistry.get(platform);
    if (!runner) {
      throw new Error(`No runner available for platform: ${platform}`);
    }

    // Execute AI call
    const result = await runner.execute({
      prompt,
      model,
      workingDirectory: process.cwd(),
      nonInteractive: true,
    });

    if (!result.success || !result.output) {
      throw new Error(`AI refinement failed: ${result.error || 'No output'}`);
    }

    // Parse AI response
    const aiUnits = this.parseAIResponse(result.output, idMap);

    // Track usage
    if (this.usageTracker) {
      await this.usageTracker.track({
        platform,
        action: 'inventory_refinement',
        itemId: 'inventory-refinement',
        durationMs: result.duration || 0,
        tokens: result.tokensUsed,
        success: true,
      });
    }

    return aiUnits;
  }

  /**
   * Parse AI response into requirement units.
   */
  private parseAIResponse(output: string, idMap: IdMap): RequirementUnit[] {
    // Try to extract JSON from the response
    let jsonStr = output;

    // Handle markdown code blocks
    const jsonMatch = output.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      // Try to find JSON array in the output
      const arrayMatch = output.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        parsed = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Validate and convert
    if (!Array.isArray(parsed)) {
      if (typeof parsed === 'object' && parsed !== null && 'units' in parsed) {
        parsed = (parsed as { units: unknown }).units;
      } else {
        throw new Error('AI response is not an array of requirements');
      }
    }

    const units: RequirementUnit[] = [];
    for (const item of parsed as unknown[]) {
      if (typeof item !== 'object' || item === null) continue;

      const obj = item as Record<string, unknown>;
      const excerpt = String(obj.excerpt || obj.text || '');
      if (!excerpt) continue;

      const excerptHash = this.computeExcerptHash(excerpt);
      const id = this.getOrAssignId(excerptHash, idMap);

      units.push({
        id,
        sectionPath: String(obj.sectionPath || obj.section || 'Unknown'),
        excerpt,
        excerptHash,
        kind: this.validateKind(obj.kind),
        severity: this.validateSeverity(obj.severity),
        lineNumbers: Array.isArray(obj.lineNumbers)
          ? (obj.lineNumbers as [number, number])
          : undefined,
      });
    }

    return units;
  }

  /**
   * Validate and normalize requirement kind.
   */
  private validateKind(kind: unknown): RequirementKind {
    const validKinds: RequirementKind[] = ['functional', 'nfr', 'constraint', 'open_question'];
    if (typeof kind === 'string' && validKinds.includes(kind as RequirementKind)) {
      return kind as RequirementKind;
    }
    return 'functional';
  }

  /**
   * Validate and normalize requirement severity.
   */
  private validateSeverity(severity: unknown): RequirementSeverity {
    const validSeverities: RequirementSeverity[] = ['must', 'should', 'could'];
    if (typeof severity === 'string' && validSeverities.includes(severity as RequirementSeverity)) {
      return severity as RequirementSeverity;
    }
    return 'should';
  }

  /**
   * Compute a deterministic hash of the excerpt for stable ID assignment.
   */
  computeExcerptHash(excerpt: string): string {
    // Normalize: lowercase, collapse whitespace, strip punctuation at edges
    const normalized = excerpt
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/^[\s\p{P}]+|[\s\p{P}]+$/gu, '')
      .trim();

    return createHash('sha256').update(normalized).digest('hex').substring(0, 16);
  }

  /**
   * Get existing ID or assign a new one for the given excerpt hash.
   */
  getOrAssignId(excerptHash: string, idMap: IdMap): string {
    if (idMap.entries[excerptHash]) {
      return idMap.entries[excerptHash];
    }

    const id = `REQ-${String(idMap.nextId).padStart(4, '0')}`;
    idMap.entries[excerptHash] = id;
    idMap.nextId++;
    return id;
  }

  /**
   * Detect severity from text content.
   */
  private detectSeverity(text: string): RequirementSeverity | undefined {
    const lower = text.toLowerCase();
    if (/\b(must|shall|required|will)\b/.test(lower)) {
      return 'must';
    }
    if (/\b(should|recommended|ought)\b/.test(lower)) {
      return 'should';
    }
    if (/\b(could|may|optional|might)\b/.test(lower)) {
      return 'could';
    }
    return undefined;
  }

  /**
   * Check if text contains a requirement keyword.
   */
  private hasRequirementKeyword(text: string): boolean {
    const lower = text.toLowerCase();
    return this.config.requirementKeywords.some((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lower);
    });
  }

  /**
   * Classify the kind of requirement from text content.
   */
  private classifyKind(text: string): RequirementKind {
    const lower = text.toLowerCase();

    // Open question indicators - check first since TBD/unclear items should be flagged regardless
    if (/\b(tbd|to be determined|unclear|question|undecided|\?)/i.test(lower)) {
      return 'open_question';
    }

    // NFR indicators
    if (
      /\b(performance|latency|throughput|response\s*time|scalab|reliab|secur|encrypt|auth|availab|backup|recover|uptime|concurrent)/i.test(
        lower
      )
    ) {
      return 'nfr';
    }

    // Constraint indicators
    if (
      /\b(constraint|limit|restrict|budget|deadline|must not|cannot|forbidden|prohibited)/i.test(
        lower
      )
    ) {
      return 'constraint';
    }

    return 'functional';
  }

  /**
   * Build inventory metadata.
   */
  private buildMetadata(parsed: ParsedRequirements, heuristicOnly: boolean): InventoryMetadata {
    const sourceHash = createHash('sha256').update(parsed.rawText).digest('hex').substring(0, 16);

    return {
      sourcePath: parsed.source.path,
      sourceHash,
      generatedAt: new Date().toISOString(),
      heuristicOnly,
      schemaVersion: SCHEMA_VERSION,
    };
  }

  /**
   * Compute inventory statistics.
   */
  private computeStats(units: RequirementUnit[]): InventoryStats {
    const byKind: Record<RequirementKind, number> = {
      functional: 0,
      nfr: 0,
      constraint: 0,
      open_question: 0,
    };

    const bySeverity: Record<RequirementSeverity, number> = {
      must: 0,
      should: 0,
      could: 0,
    };

    const uniqueSections = new Set<string>();

    for (const unit of units) {
      byKind[unit.kind]++;
      bySeverity[unit.severity]++;
      uniqueSections.add(unit.sectionPath);
    }

    return {
      totalRequirements: units.length,
      byKind,
      bySeverity,
      uniqueSections: uniqueSections.size,
    };
  }

  /**
   * Walk all sections recursively.
   */
  private walkSections(
    sections: ParsedSection[],
    pathPrefix: string,
    callback: (section: ParsedSection, sectionPath: string) => void
  ): void {
    for (const section of sections) {
      const sectionPath = pathPrefix ? `${pathPrefix} > ${section.title}` : section.title;
      callback(section, sectionPath);

      if (section.children.length > 0) {
        this.walkSections(section.children, sectionPath, callback);
      }
    }
  }

  /**
   * Load existing ID map from project path, or create a new one.
   */
  async loadIdMap(projectPath: string): Promise<IdMap> {
    const idMapPath = join(projectPath, '.puppet-master', 'requirements', 'id-map.json');

    try {
      const content = await fs.readFile(idMapPath, 'utf-8');
      const parsed = JSON.parse(content) as IdMap;

      // Validate structure
      if (
        typeof parsed.version === 'string' &&
        typeof parsed.entries === 'object' &&
        typeof parsed.nextId === 'number'
      ) {
        return parsed;
      }
    } catch {
      // File doesn't exist or is invalid, create new
    }

    return {
      version: ID_MAP_VERSION,
      entries: {},
      nextId: 1,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Save ID map to project path.
   */
  async saveIdMap(projectPath: string, idMap: IdMap): Promise<string> {
    const requirementsDir = join(projectPath, '.puppet-master', 'requirements');
    await fs.mkdir(requirementsDir, { recursive: true });

    const idMapPath = join(requirementsDir, 'id-map.json');
    await fs.writeFile(idMapPath, JSON.stringify(idMap, null, 2), 'utf-8');

    return idMapPath;
  }

  /**
   * Save inventory to project path.
   */
  async saveInventory(projectPath: string, inventory: RequirementsInventory): Promise<string> {
    const requirementsDir = join(projectPath, '.puppet-master', 'requirements');
    await fs.mkdir(requirementsDir, { recursive: true });

    const inventoryPath = join(requirementsDir, 'inventory.json');
    await fs.writeFile(inventoryPath, JSON.stringify(inventory, null, 2), 'utf-8');

    return inventoryPath;
  }

  /**
   * Save parsed requirements to project path.
   */
  async saveParsedRequirements(
    projectPath: string,
    parsed: ParsedRequirements
  ): Promise<string> {
    const requirementsDir = join(projectPath, '.puppet-master', 'requirements');
    await fs.mkdir(requirementsDir, { recursive: true });

    const parsedPath = join(requirementsDir, 'parsed.json');
    await fs.writeFile(parsedPath, JSON.stringify(parsed, null, 2), 'utf-8');

    return parsedPath;
  }
}
