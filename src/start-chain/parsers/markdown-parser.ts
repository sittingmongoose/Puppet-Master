/**
 * Markdown Parser for Requirements Documents
 * 
 * Parses markdown requirements documents into structured ParsedRequirements
 * with hierarchical sections, extracted goals/constraints, and error tracking.
 */

import type {
  ParsedRequirements,
  ParsedSection,
  RequirementsSource,
} from '../../types/index.js';

/**
 * Parser for markdown requirements documents.
 * Converts markdown content into structured ParsedRequirements.
 */
export class MarkdownParser {
  /**
   * Parse markdown content into ParsedRequirements structure.
   * 
   * @param content - Raw markdown content
   * @param source - Metadata about the source file
   * @returns Parsed requirements document
   */
  parse(content: string, source: RequirementsSource): ParsedRequirements {
    const parseErrors: string[] = [];
    const rawText = content;

    try {
      // Parse headings into hierarchical sections
      const sections = this.parseHeadings(content);

      // Extract document title (first H1 or filename)
      const title = this.extractTitle(content, source.path);

      // Extract goals and constraints
      const extractedGoals = this.extractGoals(sections);
      const extractedConstraints = this.extractConstraints(sections);

      return {
        source,
        title,
        sections,
        extractedGoals,
        extractedConstraints,
        rawText,
        parseErrors,
      };
    } catch (error) {
      parseErrors.push(`Parse error: ${error instanceof Error ? error.message : String(error)}`);
      return {
        source,
        title: this.extractTitle(content, source.path),
        sections: [],
        extractedGoals: [],
        extractedConstraints: [],
        rawText,
        parseErrors,
      };
    }
  }

  /**
   * Parse markdown headings into hierarchical sections.
   * 
   * @param content - Markdown content
   * @returns Array of top-level sections with nested children
   */
  parseHeadings(content: string): ParsedSection[] {
    const lines = content.split('\n');
    const sections: ParsedSection[] = [];
    const stack: ParsedSection[] = []; // Stack to track parent sections

    let currentContent: string[] = [];
    let lastLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const level = this.detectHeadingLevel(line);

      if (level > 0) {
        // We found a heading
        // First, commit any accumulated content to the current section
        if (stack.length > 0 && currentContent.length > 0) {
          const currentSection = stack[stack.length - 1];
          if (currentSection.content) {
            currentSection.content += '\n' + currentContent.join('\n');
          } else {
            currentSection.content = currentContent.join('\n');
          }
          currentContent = [];
        }

        // Extract heading text (remove # and whitespace)
        const headingText = line.replace(/^#+\s+/, '').trim();

        // Create new section
        const newSection: ParsedSection = {
          title: headingText,
          content: '',
          level,
          children: [],
        };

        // Find the appropriate parent in the stack
        if (level <= lastLevel) {
          // Pop stack until we find the right parent level
          while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
          }
        }

        // Add to parent or root
        if (stack.length === 0) {
          sections.push(newSection);
        } else {
          stack[stack.length - 1].children.push(newSection);
        }

        // Push new section onto stack
        stack.push(newSection);
        lastLevel = level;
      } else {
        // Regular content line
        if (stack.length > 0) {
          currentContent.push(line);
        }
      }
    }

    // Commit any remaining content to the last section
    if (stack.length > 0 && currentContent.length > 0) {
      const currentSection = stack[stack.length - 1];
      if (currentSection.content) {
        currentSection.content += '\n' + currentContent.join('\n');
      } else {
        currentSection.content = currentContent.join('\n');
      }
    }

    return sections;
  }

  /**
   * Extract goals from sections titled "Goals" or "Objectives".
   * 
   * @param sections - Parsed sections to search
   * @returns Array of goal strings extracted from bullet points
   */
  extractGoals(sections: ParsedSection[]): string[] {
    const goals: string[] = [];

    const findGoalsSection = (sects: ParsedSection[]): ParsedSection | null => {
      for (const section of sects) {
        const titleLower = section.title.toLowerCase();
        if (titleLower === 'goals' || titleLower === 'objectives') {
          return section;
        }
        // Recursively search children
        const found = findGoalsSection(section.children);
        if (found) {
          return found;
        }
      }
      return null;
    };

    const goalsSection = findGoalsSection(sections);
    if (goalsSection) {
      goals.push(...this.extractBulletPoints(goalsSection.content));
    }

    return goals;
  }

  /**
   * Extract constraints from sections titled "Constraints" or "Requirements".
   * 
   * @param sections - Parsed sections to search
   * @returns Array of constraint strings extracted from bullet points
   */
  extractConstraints(sections: ParsedSection[]): string[] {
    const constraints: string[] = [];

    const findConstraintsSection = (sects: ParsedSection[]): ParsedSection | null => {
      for (const section of sects) {
        const titleLower = section.title.toLowerCase();
        // Prioritize "constraints" over "requirements"
        if (titleLower === 'constraints') {
          return section;
        }
        // Recursively search children first (depth-first)
        const found = findConstraintsSection(section.children);
        if (found) {
          return found;
        }
        // Check "requirements" only if no constraints found in children
        if (titleLower === 'requirements') {
          return section;
        }
      }
      return null;
    };

    const constraintsSection = findConstraintsSection(sections);
    if (constraintsSection) {
      constraints.push(...this.extractBulletPoints(constraintsSection.content));
    }

    return constraints;
  }

  /**
   * Detect markdown heading level from a line.
   * 
   * @param line - Line to check
   * @returns Heading level (1-6) or 0 if not a heading
   */
  detectHeadingLevel(line: string): number {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      return match[1].length;
    }
    return 0;
  }

  /**
   * Extract bullet points from content.
   * Supports markdown list syntax: -, *, or numbered lists.
   * 
   * @param content - Content to extract bullet points from
   * @returns Array of bullet point strings (trimmed)
   */
  private extractBulletPoints(content: string): string[] {
    const lines = content.split('\n');
    const bulletPoints: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Match markdown list items: - item, * item, or 1. item
      const match = trimmed.match(/^[-*]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
      if (match) {
        bulletPoints.push(match[1].trim());
      }
    }

    return bulletPoints;
  }

  /**
   * Extract document title from content or source path.
   * 
   * @param content - Markdown content
   * @param sourcePath - Source file path (for fallback)
   * @returns Document title
   */
  private extractTitle(content: string, sourcePath: string): string {
    const lines = content.split('\n');
    
    // Look for first H1 heading
    for (const line of lines) {
      const level = this.detectHeadingLevel(line);
      if (level === 1) {
        return line.replace(/^#+\s+/, '').trim();
      }
    }

    // Fallback to filename without extension
    const filename = sourcePath.split('/').pop() || sourcePath;
    return filename.replace(/\.[^.]+$/, '') || 'Untitled';
  }
}
