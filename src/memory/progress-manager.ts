/**
 * ProgressManager for RWM Puppet Master
 * 
 * Manages the append-only progress.txt file per STATE_FILES.md Section 3.1.
 * Handles reading, parsing, and appending progress entries with Session ID generation.
 */

import { appendFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import type { Platform } from '../types/config.js';

/**
 * Progress entry matching STATE_FILES.md Section 3.1 schema
 */
export interface ProgressEntry {
  timestamp: string;  // ISO format
  itemId: string;
  sessionId: string;   // Format: PM-YYYY-MM-DD-HH-MM-SS-NNN
  platform: Platform;  // 'cursor' | 'codex' | 'claude'
  duration: string;    // e.g., "4m 23s"
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  accomplishments: string[];
  filesChanged: { path: string; description: string }[];
  testsRun: { command: string; result: string }[];
  learnings: string[];
  nextSteps: string[];
}

/**
 * ProgressManager handles reading and writing to progress.txt
 */
export class ProgressManager {
  private filePath: string;
  private static sequenceCounter: number = 0;
  private static lastSecond: number = 0;

  constructor(filePath: string = 'progress.txt') {
    this.filePath = filePath;
  }

  /**
   * Generates a Session ID in format PM-YYYY-MM-DD-HH-MM-SS-NNN
   * Tracks sequence number within same second
   */
  generateSessionId(): string {
    const now = Date.now();
    const date = new Date(now);
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    const currentSecond = Math.floor(now / 1000);
    
    // Reset sequence if we're in a new second
    if (currentSecond !== ProgressManager.lastSecond) {
      ProgressManager.sequenceCounter = 0;
      ProgressManager.lastSecond = currentSecond;
    }
    
    // Increment sequence
    ProgressManager.sequenceCounter++;
    const sequence = String(ProgressManager.sequenceCounter).padStart(3, '0');
    
    return `PM-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${sequence}`;
  }

  /**
   * Formats an entry according to STATE_FILES.md Section 3.1 template
   */
  private formatEntry(entry: ProgressEntry): string {
    const lines: string[] = [];
    
    lines.push(`## ${entry.timestamp} - ${entry.itemId}`);
    lines.push('');
    lines.push(`**Session:** ${entry.sessionId}`);
    lines.push(`**Platform:** ${entry.platform}`);
    lines.push(`**Duration:** ${entry.duration}`);
    lines.push(`**Status:** ${entry.status}`);
    lines.push('');
    
    lines.push('### What Was Done');
    if (entry.accomplishments.length === 0) {
      lines.push('');
    } else {
      entry.accomplishments.forEach(accomplishment => {
        lines.push(`- ${accomplishment}`);
      });
    }
    lines.push('');
    
    lines.push('### Files Changed');
    if (entry.filesChanged.length === 0) {
      lines.push('');
    } else {
      entry.filesChanged.forEach(file => {
        lines.push(`- \`${file.path}\` - ${file.description}`);
      });
    }
    lines.push('');
    
    lines.push('### Tests Run');
    if (entry.testsRun.length === 0) {
      lines.push('');
    } else {
      entry.testsRun.forEach(test => {
        lines.push(`- \`${test.command}\` - ${test.result}`);
      });
    }
    lines.push('');
    
    lines.push('### Learnings for Future Iterations');
    if (entry.learnings.length === 0) {
      lines.push('');
    } else {
      entry.learnings.forEach(learning => {
        lines.push(`- ${learning}`);
      });
    }
    lines.push('');
    
    lines.push('### Next Steps');
    if (entry.nextSteps.length === 0) {
      lines.push('');
    } else {
      entry.nextSteps.forEach(step => {
        lines.push(`- ${step}`);
      });
    }
    lines.push('');
    
    lines.push('---');
    lines.push('');
    
    return lines.join('\n');
  }

  /**
   * Parses markdown content into ProgressEntry array
   * Handles "Codebase Patterns" section and multiple entries
   */
  private parseEntries(content: string): ProgressEntry[] {
    const entries: ProgressEntry[] = [];
    
    // Split by entry separator (---)
    const entryBlocks = content.split(/^---$/m).filter(block => block.trim().length > 0);
    
    for (const block of entryBlocks) {
      // Skip "Codebase Patterns" section (starts with ## Codebase Patterns)
      if (block.trim().startsWith('## Codebase Patterns')) {
        continue;
      }
      
      try {
        const entry = this.parseEntry(block);
        if (entry) {
          entries.push(entry);
        }
      } catch (error) {
        // Skip malformed entries, but log warning would be ideal
        // For now, just skip silently
        continue;
      }
    }
    
    return entries;
  }

  /**
   * Parses a single entry block
   */
  private parseEntry(block: string): ProgressEntry | null {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    if (lines.length === 0) {
      return null;
    }
    
    // Parse header: ## {timestamp} - {itemId}
    const headerMatch = lines[0].match(/^##\s+(.+?)\s+-\s+(.+)$/);
    if (!headerMatch) {
      return null;
    }
    
    const timestamp = headerMatch[1].trim();
    const itemId = headerMatch[2].trim();
    
    // Parse metadata fields
    let sessionId = '';
    let platform: Platform = 'cursor';
    let duration = '';
    let status: 'SUCCESS' | 'FAILED' | 'PARTIAL' = 'SUCCESS';
    
    for (const line of lines) {
      if (line.startsWith('**Session:**')) {
        sessionId = line.replace('**Session:**', '').trim();
      } else if (line.startsWith('**Platform:**')) {
        const platformStr = line.replace('**Platform:**', '').trim();
        if (platformStr === 'cursor' || platformStr === 'codex' || platformStr === 'claude') {
          platform = platformStr;
        }
      } else if (line.startsWith('**Duration:**')) {
        duration = line.replace('**Duration:**', '').trim();
      } else if (line.startsWith('**Status:**')) {
        const statusStr = line.replace('**Status:**', '').trim();
        if (statusStr === 'SUCCESS' || statusStr === 'FAILED' || statusStr === 'PARTIAL') {
          status = statusStr;
        }
      }
    }
    
    // Parse sections
    const accomplishments = this.parseSection(block, '### What Was Done');
    const filesChanged = this.parseFilesChanged(block);
    const testsRun = this.parseTestsRun(block);
    const learnings = this.parseSection(block, '### Learnings for Future Iterations');
    const nextSteps = this.parseSection(block, '### Next Steps');
    
    return {
      timestamp,
      itemId,
      sessionId,
      platform,
      duration,
      status,
      accomplishments,
      filesChanged,
      testsRun,
      learnings,
      nextSteps,
    };
  }

  /**
   * Parses a list section (What Was Done, Learnings, Next Steps)
   */
  private parseSection(block: string, sectionHeader: string): string[] {
    const lines = block.split('\n');
    const items: string[] = [];
    let inSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === sectionHeader) {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        // Stop at next section or separator
        if (trimmed.startsWith('###') || trimmed === '---') {
          break;
        }
        
        // Parse list item: - {item}
        if (trimmed.startsWith('- ')) {
          items.push(trimmed.substring(2).trim());
        } else if (trimmed.length === 0) {
          // Empty line might be end of section, but continue
          continue;
        } else {
          // Non-list line, might be end of section
          break;
        }
      }
    }
    
    return items;
  }

  /**
   * Parses Files Changed section
   */
  private parseFilesChanged(block: string): { path: string; description: string }[] {
    const lines = block.split('\n');
    const items: { path: string; description: string }[] = [];
    let inSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '### Files Changed') {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        // Stop at next section or separator
        if (trimmed.startsWith('###') || trimmed === '---') {
          break;
        }
        
        // Parse: - `{path}` - {description}
        const match = trimmed.match(/^-\s+`(.+?)`\s+-\s+(.+)$/);
        if (match) {
          items.push({
            path: match[1],
            description: match[2],
          });
        } else if (trimmed.length === 0) {
          continue;
        } else {
          break;
        }
      }
    }
    
    return items;
  }

  /**
   * Parses Tests Run section
   */
  private parseTestsRun(block: string): { command: string; result: string }[] {
    const lines = block.split('\n');
    const items: { command: string; result: string }[] = [];
    let inSection = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed === '### Tests Run') {
        inSection = true;
        continue;
      }
      
      if (inSection) {
        // Stop at next section or separator
        if (trimmed.startsWith('###') || trimmed === '---') {
          break;
        }
        
        // Parse: - `{command}` - {result}
        const match = trimmed.match(/^-\s+`(.+?)`\s+-\s+(.+)$/);
        if (match) {
          items.push({
            command: match[1],
            result: match[2],
          });
        } else if (trimmed.length === 0) {
          continue;
        } else {
          break;
        }
      }
    }
    
    return items;
  }

  /**
   * Appends an entry to progress.txt
   * Creates file and directory if they don't exist
   */
  async append(entry: ProgressEntry): Promise<void> {
    const formatted = this.formatEntry(entry);
    
    // Ensure directory exists
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    
    // Ensure file exists (create empty if needed)
    if (!existsSync(this.filePath)) {
      await writeFile(this.filePath, '', 'utf-8');
    }
    
    // Append formatted entry
    await appendFile(this.filePath, formatted, 'utf-8');
  }

  /**
   * Reads and parses all entries from progress.txt
   * Returns empty array if file doesn't exist or is empty
   */
  async read(): Promise<ProgressEntry[]> {
    if (!existsSync(this.filePath)) {
      return [];
    }
    
    try {
      const content = await readFile(this.filePath, 'utf-8');
      if (content.trim().length === 0) {
        return [];
      }
      return this.parseEntries(content);
    } catch (error) {
      // If file read fails, return empty array
      return [];
    }
  }

  /**
   * Returns the last n entries from progress.txt
   * If n is not specified, returns all entries
   */
  async getLatest(n?: number): Promise<ProgressEntry[]> {
    const entries = await this.read();
    
    if (n === undefined) {
      return entries;
    }
    
    if (n <= 0) {
      return [];
    }
    
    // Return last n entries
    return entries.slice(-n);
  }
}
