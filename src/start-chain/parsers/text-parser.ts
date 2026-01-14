/**
 * Text Parser for RWM Puppet Master
 * 
 * Parses plain text requirements documents into structured ParsedRequirements.
 * Uses simple heuristics to identify sections (ALL CAPS lines) and extract goals/constraints.
 * 
 * See REQUIREMENTS.md Section 5 (Start Chain requirements) for context.
 */

import type {
  ParsedRequirements,
  ParsedSection,
  RequirementsSource,
} from '../../types/requirements.js';

/**
 * TextParser class for parsing plain text requirements documents.
 * 
 * Uses heuristics to identify sections:
 * - ALL CAPS lines (excluding common words) are treated as section headers
 * - Content between section headers belongs to the previous section
 * - Goals and constraints are extracted from sections with matching keywords
 */
export class TextParser {
  /**
   * Parse plain text content into ParsedRequirements structure.
   * 
   * @param content - The plain text content to parse
   * @param source - Metadata about the source file
   * @returns Parsed requirements document
   */
  parse(content: string, source: RequirementsSource): ParsedRequirements {
    const parseErrors: string[] = [];
    // Handle empty content - split returns [''] for empty string, we want []
    const lines = content.length === 0 ? [] : content.split(/\r?\n/);
    
    // Infer sections from ALL CAPS lines
    const sections = this.inferSections(lines);
    
    // Extract title from first section or filename
    const title = this.extractTitle(sections, source.path);
    
    // Extract goals and constraints from all sections
    const extractedGoals = this.extractGoals(content, sections);
    const extractedConstraints = this.extractConstraints(content, sections);
    
    return {
      source,
      title,
      sections,
      extractedGoals,
      extractedConstraints,
      rawText: content,
      parseErrors,
    };
  }
  
  /**
   * Infer sections from lines of text.
   * Identifies section headers as ALL CAPS lines (optionally with trailing colon).
   * 
   * @param lines - Array of text lines
   * @returns Array of parsed sections
   */
  inferSections(lines: string[]): ParsedSection[] {
    const sections: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;
    const contentLines: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Check if this line is a section header (ALL CAPS)
      const isHeader = this.isSectionHeader(trimmed);
      if (isHeader) {
        // Save previous section if it exists
        if (currentSection !== null) {
          currentSection.content = contentLines.join('\n').trim();
          sections.push(currentSection);
          contentLines.length = 0;
        }
        
        // Create new section
        const title = trimmed.replace(/:\s*$/, '').trim();
        currentSection = {
          title,
          content: '',
          level: 1, // All inferred sections are level 1 (flat structure)
          children: [],
        };
      } else if (currentSection !== null) {
        // Add line to current section's content
        contentLines.push(line);
      } else if (trimmed.length > 0) {
        // Content before first section - could be document intro
        contentLines.push(line);
      }
    }
    
    // Save last section
    if (currentSection !== null) {
      currentSection.content = contentLines.join('\n').trim();
      sections.push(currentSection);
    } else if (contentLines.length > 0 || lines.length === 0) {
      // No sections found, create a single section with all content (or empty section for empty input)
      sections.push({
        title: 'Content',
        content: contentLines.join('\n').trim(),
        level: 1,
        children: [],
      });
    }
    
    return sections;
  }
  
  /**
   * Check if a line is a section header.
   * A line is considered a header if it's ALL CAPS (excluding common words).
   * 
   * @param line - The line to check
   * @returns True if the line appears to be a section header
   */
  private isSectionHeader(line: string): boolean {
    if (line.length === 0) {
      return false;
    }
    
    const trimmed = line.trim();
    
    // Don't treat lines starting with bullet points, numbers, or dashes as headers
    if (/^[-*?]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)) {
      return false;
    }
    
    // Remove trailing colon if present
    const withoutColon = trimmed.replace(/:\s*$/, '').trim();
    
    if (withoutColon.length === 0) {
      return false;
    }
    
    // Must be at least 3 characters
    if (withoutColon.length < 3) {
      return false;
    }
    
    // Simple check: if the entire line (without common words) is ALL CAPS
    // Split into words and check each significant word
    const words = withoutColon.split(/\s+/).filter(w => w.length > 0);
    const commonWords = new Set(['THE', 'A', 'AN', 'OF', 'IN', 'ON', 'AT', 'TO', 'FOR', 'AND', 'OR', 'BUT', 'IS', 'ARE', 'WAS', 'WERE']);
    
    // Filter out common words and check if remaining words are ALL CAPS
    const significantWords = words.filter(w => !commonWords.has(w.toUpperCase()));
    
    // Need at least one significant word
    if (significantWords.length === 0) {
      return false;
    }
    
    // All significant words must be ALL CAPS (letters, numbers, hyphens, underscores only)
    const allSignificantAreCaps = significantWords.every(w => /^[A-Z0-9\-_]+$/.test(w));
    
    // Also check that at least one word is 3+ characters (to avoid single letters/numbers)
    const hasSubstantialWord = significantWords.some(w => w.length >= 3);
    
    return allSignificantAreCaps && hasSubstantialWord;
  }
  
  /**
   * Extract goals from text content and sections.
   * Looks for sections with "Goals", "Objectives", "Goal" in the title,
   * and extracts bullet points or list items from their content.
   * 
   * @param content - Full text content
   * @param sections - Parsed sections
   * @returns Array of extracted goal strings
   */
  extractGoals(content: string, sections: ParsedSection[]): string[] {
    const goals: string[] = [];
    const goalKeywords = ['GOAL', 'GOALS', 'OBJECTIVE', 'OBJECTIVES'];
    
    // Look for sections with goal-related titles
    for (const section of sections) {
      const titleUpper = section.title.toUpperCase();
      if (goalKeywords.some(keyword => titleUpper.includes(keyword))) {
        // Extract bullet points or numbered items from section content
        const items = this.extractListItems(section.content);
        goals.push(...items);
      }
    }
    
    // Also search in full content for goal patterns
    if (goals.length === 0) {
      const goalPattern = /(?:goal|objective)[s]?:?\s*\n([\s\S]*?)(?=\n[A-Z]{3,}:|\n\n\n|$)/i;
      const match = content.match(goalPattern);
      if (match && match[1]) {
        const items = this.extractListItems(match[1]);
        goals.push(...items);
      }
    }
    
    return goals.filter(g => g.trim().length > 0);
  }
  
  /**
   * Extract constraints from text content and sections.
   * Looks for sections with "Constraints", "Requirements", "Constraint" in the title,
   * and extracts bullet points or list items from their content.
   * 
   * @param content - Full text content
   * @param sections - Parsed sections
   * @returns Array of extracted constraint strings
   */
  extractConstraints(content: string, sections: ParsedSection[]): string[] {
    const constraints: string[] = [];
    const constraintKeywords = ['CONSTRAINT', 'CONSTRAINTS', 'REQUIREMENT', 'REQUIREMENTS'];
    
    // Look for sections with constraint-related titles
    for (const section of sections) {
      const titleUpper = section.title.toUpperCase();
      if (constraintKeywords.some(keyword => titleUpper.includes(keyword))) {
        // Extract bullet points or numbered items from section content
        const items = this.extractListItems(section.content);
        constraints.push(...items);
      }
    }
    
    // Also search in full content for constraint patterns
    if (constraints.length === 0) {
      const constraintPattern = /(?:constraint|requirement)[s]?:?\s*\n([\s\S]*?)(?=\n[A-Z]{3,}:|\n\n\n|$)/i;
      const match = content.match(constraintPattern);
      if (match && match[1]) {
        const items = this.extractListItems(match[1]);
        constraints.push(...items);
      }
    }
    
    return constraints.filter(c => c.trim().length > 0);
  }
  
  /**
   * Extract list items from text (bullet points, numbered lists, etc.).
   * 
   * @param text - Text content to extract items from
   * @returns Array of extracted list item strings
   */
  private extractListItems(text: string): string[] {
    const items: string[] = [];
    const lines = text.split(/\r?\n/);
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Match bullet points: -, *, ?, or numbered lists: 1., 2., etc.
      const bulletMatch = trimmed.match(/^[-*?]\s+(.+)$/);
      const numberMatch = trimmed.match(/^\d+[.)]\s+(.+)$/);
      
      if (bulletMatch) {
        items.push(bulletMatch[1].trim());
      } else if (numberMatch) {
        items.push(numberMatch[1].trim());
      } else if (trimmed.length > 0 && items.length > 0) {
        // Continuation of previous item (indented or wrapped)
        const lastItem = items[items.length - 1];
        items[items.length - 1] = `${lastItem} ${trimmed}`;
      }
    }
    
    return items;
  }
  
  /**
   * Extract document title from sections or filename.
   * 
   * @param sections - Parsed sections
   * @param filePath - Source file path
   * @returns Document title
   */
  private extractTitle(sections: ParsedSection[], filePath: string): string {
    // Use first section title if available
    if (sections.length > 0 && sections[0].title !== 'Content') {
      return sections[0].title;
    }
    
    // Fall back to filename without extension
    const fileName = filePath.split(/[/\\]/).pop() || 'requirements';
    return fileName.replace(/\.[^.]*$/, '');
  }
}
