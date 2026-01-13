/**
 * AgentsManager class for managing AGENTS.md files
 * 
 * Handles multi-level AGENTS.md files (root, module, phase, task),
 * parsing markdown sections, and content manipulation.
 */

import { readFile, writeFile, mkdir, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, resolve } from 'path';

/**
 * Hierarchy levels for AGENTS.md files
 */
export type AgentsLevel = 'root' | 'module' | 'phase' | 'task';

/**
 * Iteration context (partial, for this file)
 */
export interface IterationContext {
  phaseId: string;
  taskId: string;
  filesTargeted: string[];
}

/**
 * Loaded and parsed AGENTS.md content
 */
export interface AgentsContent {
  level: AgentsLevel;
  path: string;
  content: string;
  sections: ParsedSections;
}

/**
 * Structured representation of markdown sections
 */
export interface ParsedSections {
  overview: string;
  architectureNotes: string[];
  codebasePatterns: string[];
  toolingRules: string[];
  commonFailureModes: { description: string; fix: string }[];
  doItems: string[];
  dontItems: string[];
  testing: string[];
  directoryStructure: { dir: string; purpose: string }[];
}

/**
 * Codebase pattern to add
 */
export interface Pattern {
  description: string;
  context?: string;
}

/**
 * Common failure mode to add
 */
export interface Gotcha {
  description: string;
  fix: string;
}

/**
 * Configuration for AgentsManager
 */
export interface AgentsManagerConfig {
  rootPath: string;
  multiLevelEnabled: boolean;
  modulePattern: string;  // e.g., "src/*/AGENTS.md"
  phasePattern: string;   // e.g., ".puppet-master/agents/phase-*.md"
  taskPattern: string;    // e.g., ".puppet-master/agents/task-*.md"
  projectRoot?: string;   // Project root directory
}

/**
 * AgentsManager class for managing AGENTS.md files
 */
export class AgentsManager {
  private config: AgentsManagerConfig;
  private projectRoot: string;

  /**
   * Create a new AgentsManager instance
   * @param config - Configuration for the manager
   */
  constructor(config: AgentsManagerConfig) {
    this.config = config;
    this.projectRoot = config.projectRoot ?? process.cwd();
  }

  /**
   * Load AGENTS.md files for a given context in hierarchy order
   * @param context - Iteration context with phase/task info
   * @returns Array of loaded content (always includes root)
   */
  async loadForContext(context: IterationContext): Promise<AgentsContent[]> {
    const contents: AgentsContent[] = [];

    // Always load root AGENTS.md
    const rootContent = await this.loadFile(this.config.rootPath, 'root');
    contents.push(rootContent);

    if (!this.config.multiLevelEnabled) {
      return contents;
    }

    // Load module-level if applicable
    const modulePath = await this.findModuleAgents(context.filesTargeted);
    if (modulePath) {
      const moduleContent = await this.loadFile(modulePath, 'module');
      contents.push(moduleContent);
    }

    // Load phase-level if exists
    const phasePath = this.getFilePath('phase', context);
    if (await this.exists(phasePath)) {
      const phaseContent = await this.loadFile(phasePath, 'phase');
      contents.push(phaseContent);
    }

    // Load task-level if exists
    const taskPath = this.getFilePath('task', context);
    if (await this.exists(taskPath)) {
      const taskContent = await this.loadFile(taskPath, 'task');
      contents.push(taskContent);
    }

    return contents;
  }

  /**
   * Load and parse a single AGENTS.md file
   * @param path - Path to the file
   * @param level - Level of the file
   * @returns Loaded and parsed content
   */
  async loadFile(path: string, level: AgentsLevel): Promise<AgentsContent> {
    let content: string;
    try {
      content = await this.read(path);
    } catch {
      // Return empty content if file doesn't exist
      content = '';
    }

    const sections = this.parseSections(content);

    return {
      level,
      path,
      content,
      sections,
    };
  }

  /**
   * Read file content
   * @param path - Path to file
   * @returns File content as string
   */
  async read(path: string): Promise<string> {
    try {
      return await readFile(path, 'utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to read file at ${path}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Write content to file
   * @param path - Path to file
   * @param content - Content to write
   */
  async write(path: string, content: string): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(path);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(path, content, 'utf-8');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to write file at ${path}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Parse markdown content into structured sections
   * @param content - Markdown content
   * @returns Parsed sections
   */
  parseSections(content: string): ParsedSections {
    const sections: ParsedSections = {
      overview: '',
      architectureNotes: [],
      codebasePatterns: [],
      toolingRules: [],
      commonFailureModes: [],
      doItems: [],
      dontItems: [],
      testing: [],
      directoryStructure: [],
    };

    // Extract Overview (Project Overview section)
    const overviewSection = this.findSection(content, 'Project Overview');
    if (overviewSection) {
      sections.overview = overviewSection.trim();
    }

    // Extract Architecture Notes
    const archSection = this.findSection(content, 'Architecture Notes');
    if (archSection) {
      sections.architectureNotes = this.parseListItems(archSection);
    }

    // Extract Codebase Patterns
    const patternsSection = this.findSection(content, 'Codebase Patterns');
    if (patternsSection) {
      sections.codebasePatterns = this.parseListItems(patternsSection);
    }

    // Extract Tooling Rules
    const toolingSection = this.findSection(content, 'Tooling Rules');
    if (toolingSection) {
      sections.toolingRules = this.parseListItems(toolingSection);
    }

    // Extract Common Failure Modes
    const failureSection = this.findSection(content, 'Common Failure Modes');
    if (failureSection) {
      sections.commonFailureModes = this.parseFailureModes(failureSection);
    }

    // Extract Do items
    const doSection = this.findSection(content, 'DO');
    if (doSection) {
      sections.doItems = this.parseListItems(doSection);
    }

    // Extract Don't items
    const dontSection = this.findSection(content, "DON'T");
    if (dontSection) {
      sections.dontItems = this.parseListItems(dontSection);
    }

    // Extract Testing section
    const testingSection = this.findSection(content, 'Testing');
    if (testingSection) {
      sections.testing = this.parseListItems(testingSection);
    }

    // Extract Directory Structure
    const dirSection = this.findSection(content, 'Directory Structure');
    if (dirSection) {
      sections.directoryStructure = this.parseDirectoryStructure(dirSection);
    }

    return sections;
  }

  /**
   * Convert ParsedSections back to markdown format
   * @param sections - Parsed sections
   * @returns Markdown content
   */
  formatSections(sections: ParsedSections): string {
    const parts: string[] = [];

    if (sections.overview) {
      parts.push('## Project Overview\n');
      parts.push(sections.overview);
      parts.push('');
    }

    if (sections.architectureNotes.length > 0) {
      parts.push('## Architecture Notes\n');
      sections.architectureNotes.forEach(note => {
        parts.push(`- ${note}`);
      });
      parts.push('');
    }

    if (sections.codebasePatterns.length > 0) {
      parts.push('## Codebase Patterns\n');
      sections.codebasePatterns.forEach(pattern => {
        parts.push(`- ${pattern}`);
      });
      parts.push('');
    }

    if (sections.toolingRules.length > 0) {
      parts.push('## Tooling Rules\n');
      sections.toolingRules.forEach(rule => {
        parts.push(`- ${rule}`);
      });
      parts.push('');
    }

    if (sections.commonFailureModes.length > 0) {
      parts.push('## Common Failure Modes\n');
      sections.commonFailureModes.forEach(failure => {
        parts.push(`### ${failure.description}`);
        parts.push(`**Fix:** ${failure.fix}`);
        parts.push('');
      });
    }

    if (sections.doItems.length > 0) {
      parts.push('## DO\n');
      sections.doItems.forEach(item => {
        parts.push(`- ✅ ${item}`);
      });
      parts.push('');
    }

    if (sections.dontItems.length > 0) {
      parts.push("## DON'T\n");
      sections.dontItems.forEach(item => {
        parts.push(`- ❌ ${item}`);
      });
      parts.push('');
    }

    if (sections.testing.length > 0) {
      parts.push('## Testing\n');
      sections.testing.forEach(item => {
        parts.push(`- ${item}`);
      });
      parts.push('');
    }

    if (sections.directoryStructure.length > 0) {
      parts.push('## Directory Structure\n');
      sections.directoryStructure.forEach(item => {
        parts.push(`- \`${item.dir}/\` - ${item.purpose}`);
      });
      parts.push('');
    }

    return parts.join('\n');
  }

  /**
   * Add a pattern to the Codebase Patterns section
   * @param pattern - Pattern to add
   * @param level - Level to add to (defaults to root)
   * @param context - Optional iteration context (required for phase/task levels)
   */
  async addPattern(pattern: Pattern, level: AgentsLevel = 'root', context?: IterationContext): Promise<void> {
    const filePath = level === 'phase' || level === 'task'
      ? (context ? this.getFilePath(level, context) : (() => { throw new Error(`${level} level requires context`); })())
      : this.getFilePath(level);
    
    let content: string;
    
    try {
      content = await this.read(filePath);
    } catch {
      // Create new file if it doesn't exist
      content = '# AGENTS.md\n\n';
    }

    const patternText = pattern.context
      ? `${pattern.description} (Context: ${pattern.context})`
      : pattern.description;

    const updated = this.appendToSection(content, 'Codebase Patterns', `- ${patternText}`);
    await this.write(filePath, updated);
  }

  /**
   * Add a gotcha to the Common Failure Modes section
   * @param gotcha - Gotcha to add
   * @param level - Level to add to (defaults to root)
   * @param context - Optional iteration context (required for phase/task levels)
   */
  async addGotcha(gotcha: Gotcha, level: AgentsLevel = 'root', context?: IterationContext): Promise<void> {
    const filePath = level === 'phase' || level === 'task'
      ? (context ? this.getFilePath(level, context) : (() => { throw new Error(`${level} level requires context`); })())
      : this.getFilePath(level);
    
    let content: string;
    
    try {
      content = await this.read(filePath);
    } catch {
      // Create new file if it doesn't exist
      content = '# AGENTS.md\n\n';
    }

    const gotchaText = `### ${gotcha.description}\n**Fix:** ${gotcha.fix}`;
    const updated = this.appendToSection(content, 'Common Failure Modes', gotchaText);
    await this.write(filePath, updated);
  }

  /**
   * Promote content item from one level to a higher level
   * @param item - Content item to promote
   * @param fromLevel - Source level
   * @param toLevel - Destination level (must be higher in hierarchy)
   * @param context - Optional iteration context (required for phase/task levels)
   */
  async promoteToHigherLevel(
    item: string,
    fromLevel: AgentsLevel,
    toLevel: AgentsLevel,
    context?: IterationContext
  ): Promise<void> {
    // Validate hierarchy: task < phase < module < root (root is most general/highest)
    // For promotion, we move from more specific (lower) to more general (higher)
    const hierarchy: AgentsLevel[] = ['task', 'phase', 'module', 'root'];
    const fromIndex = hierarchy.indexOf(fromLevel);
    const toIndex = hierarchy.indexOf(toLevel);

    if (fromIndex === -1 || toIndex === -1) {
      throw new Error(`Invalid level: ${fromLevel} or ${toLevel}`);
    }

    if (toIndex <= fromIndex) {
      throw new Error(`Cannot promote from ${fromLevel} to ${toLevel}: destination must be higher in hierarchy`);
    }

    // Get file paths - handle module separately
    let fromPath: string;
    let toPath: string;

    if (fromLevel === 'module') {
      throw new Error('Module promotion requires explicit path resolution');
    }
    if (toLevel === 'module') {
      throw new Error('Promotion to module level requires explicit path resolution');
    }

    if (fromLevel === 'phase' || fromLevel === 'task') {
      if (!context) {
        throw new Error(`${fromLevel} level requires context for promotion`);
      }
      fromPath = this.getFilePath(fromLevel, context);
    } else {
      fromPath = this.getFilePath(fromLevel);
    }

    if (toLevel === 'phase' || toLevel === 'task') {
      if (!context) {
        throw new Error(`${toLevel} level requires context for promotion`);
      }
      toPath = this.getFilePath(toLevel, context);
    } else {
      toPath = this.getFilePath(toLevel);
    }

    // Read source file
    let fromContent: string;
    try {
      fromContent = await this.read(fromPath);
    } catch {
      throw new Error(`Source file not found: ${fromPath}`);
    }

    // Determine which section the item belongs to
    const section = this.determineSection(item);
    
    // Remove from source
    const updatedFrom = this.removeFromSection(fromContent, section, item);
    await this.write(fromPath, updatedFrom);

    // Add to destination
    let toContent: string;
    try {
      toContent = await this.read(toPath);
    } catch {
      toContent = '# AGENTS.md\n\n';
    }

    const updatedTo = this.appendToSection(toContent, section, item);
    await this.write(toPath, updatedTo);
  }

  /**
   * Find module-level AGENTS.md based on files being edited
   * @param filesTargeted - Array of file paths being edited
   * @returns Path to module AGENTS.md or null
   */
  private async findModuleAgents(filesTargeted: string[]): Promise<string | null> {
    if (filesTargeted.length === 0) {
      return null;
    }

    // Extract module directories from file paths
    const moduleDirs = new Set<string>();
    for (const file of filesTargeted) {
      const resolved = resolve(this.projectRoot, file);
      const parts = resolved.split('/');
      
      // Look for src/*/ pattern
      const srcIndex = parts.indexOf('src');
      if (srcIndex >= 0 && srcIndex < parts.length - 1) {
        const moduleDir = parts[srcIndex + 1];
        if (moduleDir) {
          moduleDirs.add(moduleDir);
        }
      }
    }

    // Check each module directory for AGENTS.md
    for (const moduleDir of Array.from(moduleDirs)) {
      const agentsPath = join(this.projectRoot, 'src', moduleDir, 'AGENTS.md');
      if (await this.exists(agentsPath)) {
        return agentsPath;
      }
    }

    return null;
  }

  /**
   * Check if file exists
   * @param path - File path
   * @returns True if file exists
   */
  private async exists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file path for a given level and context
   * @param level - Level of the file
   * @param context - Optional iteration context
   * @returns Resolved file path
   */
  private getFilePath(level: AgentsLevel, context?: IterationContext): string {
    switch (level) {
      case 'root':
        return resolve(this.projectRoot, this.config.rootPath);
      
      case 'module':
        // Module path is resolved in findModuleAgents
        throw new Error('Module path must be resolved via findModuleAgents');
      
      case 'phase':
        if (!context) {
          throw new Error('Phase level requires context');
        }
        return resolve(this.projectRoot, `.puppet-master/agents/phase-${context.phaseId}.md`);
      
      case 'task':
        if (!context) {
          throw new Error('Task level requires context');
        }
        return resolve(this.projectRoot, `.puppet-master/agents/task-${context.taskId}.md`);
      
      default:
        throw new Error(`Unknown level: ${level}`);
    }
  }

  /**
   * Find section content in markdown
   * @param content - Markdown content
   * @param sectionName - Name of section to find
   * @returns Section content or empty string
   */
  private findSection(content: string, sectionName: string): string {
    // Try different header formats
    const patterns = [
      new RegExp(`^##\\s+${sectionName}\\s*$`, 'm'),
      new RegExp(`^##\\s+${sectionName.replace(/\s+/g, '\\s+')}\\s*$`, 'm'),
    ];

    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const startIndex = match.index! + match[0].length;
        // Find next section or end of file
        const remaining = content.substring(startIndex);
        const nextSectionMatch = remaining.match(/^##\s+/m);
        const endIndex = nextSectionMatch
          ? startIndex + nextSectionMatch.index!
          : content.length;
        
        return content.substring(startIndex, endIndex).trim();
      }
    }

    return '';
  }

  /**
   * Append item to a section in markdown
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

  /**
   * Remove item from a section in markdown
   * @param content - Markdown content
   * @param sectionName - Name of section
   * @param item - Item to remove
   * @returns Updated markdown content
   */
  private removeFromSection(content: string, sectionName: string, item: string): string {
    const sectionHeaderPattern = new RegExp(`^##\\s+${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
    const match = content.match(sectionHeaderPattern);
    
    if (!match) {
      return content;
    }

    // Find section boundaries
    const headerStart = match.index!;
    const headerEnd = headerStart + match[0].length;
    
    // Find next section or end of file
    const remaining = content.substring(headerEnd);
    const nextSectionMatch = remaining.match(/^##\s+/m);
    const sectionEnd = nextSectionMatch
      ? headerEnd + nextSectionMatch.index!
      : content.length;
    
    const sectionContent = content.substring(headerEnd, sectionEnd);
    
    // Remove the item - escape special regex characters and match the item
    const escapedItem = item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match item as a whole line (with optional leading/trailing whitespace)
    const itemPattern = new RegExp(`^\\s*${escapedItem}\\s*$`, 'm');
    const updatedSectionContent = sectionContent.replace(itemPattern, '').trim();
    
    // Reconstruct content
    const beforeSection = content.substring(0, headerEnd);
    const afterSection = content.substring(sectionEnd);
    
    if (updatedSectionContent) {
      return beforeSection + '\n' + updatedSectionContent + (afterSection ? '\n' + afterSection : '');
    } else {
      // Remove entire section if empty
      return beforeSection.trim() + (afterSection ? '\n' + afterSection : '');
    }
  }

  /**
   * Determine which section an item belongs to
   * @param item - Content item
   * @returns Section name
   */
  private determineSection(item: string): string {
    // Heuristic: check item content to determine section
    if (item.includes('Pattern') || item.match(/^###\s+/)) {
      return 'Codebase Patterns';
    }
    if (item.includes('Fix:') || item.match(/^###\s+.*\n\*\*Fix:\*\*/)) {
      return 'Common Failure Modes';
    }
    if (item.includes('✅')) {
      return 'DO';
    }
    if (item.includes('❌')) {
      return "DON'T";
    }
    // Default to Codebase Patterns
    return 'Codebase Patterns';
  }

  /**
   * Parse list items from markdown section
   * @param section - Section content
   * @returns Array of list items
   */
  private parseListItems(section: string): string[] {
    const items: string[] = [];
    const lines = section.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        // Remove bullet and emoji if present
        const item = trimmed
          .replace(/^[-*]\s*/, '')
          .replace(/^[✅❌]\s*/, '')
          .trim();
        if (item) {
          items.push(item);
        }
      } else if (trimmed && !trimmed.startsWith('#')) {
        // Multi-line items
        if (items.length > 0) {
          items[items.length - 1] += '\n' + trimmed;
        }
      }
    }

    return items;
  }

  /**
   * Parse failure modes from markdown section
   * @param section - Section content
   * @returns Array of failure mode objects
   */
  private parseFailureModes(section: string): { description: string; fix: string }[] {
    const modes: { description: string; fix: string }[] = [];
    const lines = section.split('\n');
    
    let currentMode: { description: string; fix: string } | null = null;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('### ')) {
        // New failure mode
        if (currentMode) {
          modes.push(currentMode);
        }
        currentMode = {
          description: trimmed.replace(/^###\s+/, ''),
          fix: '',
        };
      } else if (trimmed.startsWith('**Fix:**') || trimmed.startsWith('**Fix:**')) {
        if (currentMode) {
          currentMode.fix = trimmed.replace(/^\*\*Fix:\*\*\s*/, '');
        }
      } else if (trimmed.startsWith('**Symptom:**')) {
        // Skip symptom line, already in description
      } else if (trimmed.startsWith('**Cause:**')) {
        // Skip cause line
      } else if (trimmed && currentMode && !trimmed.startsWith('#')) {
        // Additional fix details
        if (currentMode.fix) {
          currentMode.fix += '\n' + trimmed;
        }
      }
    }
    
    if (currentMode) {
      modes.push(currentMode);
    }

    return modes;
  }

  /**
   * Parse directory structure from markdown section
   * @param section - Section content
   * @returns Array of directory entries
   */
  private parseDirectoryStructure(section: string): { dir: string; purpose: string }[] {
    const entries: { dir: string; purpose: string }[] = [];
    const lines = section.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- `') && trimmed.includes('` - ')) {
        const match = trimmed.match(/^- `([^`]+)`\s*-\s*(.+)$/);
        if (match) {
          entries.push({
            dir: match[1],
            purpose: match[2],
          });
        }
      }
    }

    return entries;
  }
}
