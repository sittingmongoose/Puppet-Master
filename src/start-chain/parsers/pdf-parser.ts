/**
 * PDF parser for requirements documents
 * 
 * This module provides a parser for PDF requirements documents.
 * It extracts text from PDF files and infers structure to create
 * ParsedRequirements objects.
 */

import pdfParse from 'pdf-parse';
import type {
  ParsedRequirements,
  ParsedSection,
  RequirementsSource,
} from '../../types/requirements.js';

/**
 * PDF parser for requirements documents.
 * Extracts text from PDF buffers and infers document structure.
 */
export class PdfParser {
  /**
   * Parse a PDF buffer and extract requirements structure.
   * 
   * @param buffer - PDF file buffer
   * @param source - Source metadata for the PDF file
   * @returns Parsed requirements document
   */
  async parse(
    buffer: Buffer,
    source: RequirementsSource,
  ): Promise<ParsedRequirements> {
    const parseErrors: string[] = [];
    let rawText = '';

    try {
      // Extract text from PDF
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || '';

      if (!rawText.trim()) {
        parseErrors.push('PDF contains no extractable text');
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      parseErrors.push(`Failed to parse PDF: ${errorMessage}`);
      rawText = '';
    }

    // Infer sections from text
    const sections = this.inferSections(rawText);

    // Extract goals and constraints
    const extractedGoals = this.extractGoals(rawText);
    const extractedConstraints = this.extractConstraints(rawText);

    // Extract title (first line or first section title)
    const title = this.extractTitle(rawText, sections);

    return {
      source,
      title,
      sections,
      extractedGoals,
      extractedConstraints,
      rawText,
      parseErrors,
    };
  }

  /**
   * Infer document sections from text.
   * Detects sections based on capitalized lines or formatting patterns.
   * 
   * @param text - Raw text from PDF
   * @returns Array of parsed sections
   */
  private inferSections(text: string): ParsedSection[] {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    const sections: ParsedSection[] = [];
    const sectionStack: ParsedSection[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const level = this.detectHeadingLevel(line);

      if (level > 0) {
        // This line appears to be a heading
        const section: ParsedSection = {
          title: line,
          content: '',
          level,
          children: [],
        };

        // Find the appropriate parent in the stack
        while (
          sectionStack.length > 0 &&
          sectionStack[sectionStack.length - 1]!.level >= level
        ) {
          sectionStack.pop();
        }

        if (sectionStack.length > 0) {
          // Add as child of current parent
          sectionStack[sectionStack.length - 1]!.children.push(section);
        } else {
          // Top-level section
          sections.push(section);
        }

        sectionStack.push(section);
      } else if (sectionStack.length > 0) {
        // Add content to current section
        const currentSection = sectionStack[sectionStack.length - 1]!;
        if (currentSection.content) {
          currentSection.content += '\n';
        }
        currentSection.content += line;
      }
    }

    return sections;
  }

  /**
   * Detect if a line is a heading and return its level (1-6).
   * Returns 0 if the line is not a heading.
   * 
   * @param line - Text line to analyze
   * @returns Heading level (1-6) or 0 if not a heading
   */
  private detectHeadingLevel(line: string): number {
    if (!line || line.length < 3) {
      return 0;
    }

    // Pattern 1: ALL CAPS lines (likely headings)
    if (line === line.toUpperCase() && line.length > 5 && /^[A-Z\s]+$/.test(line)) {
      return 1;
    }

    // Pattern 2: Lines that start with numbers (e.g., "1. Section", "1.1 Subsection")
    const numberedMatch = line.match(/^(\d+\.?\s*)+/);
    if (numberedMatch) {
      const depth = numberedMatch[0]!.split('.').length - 1;
      return Math.min(depth, 6);
    }

    // Pattern 3: Title case lines that are short and end with colon
    if (
      line.endsWith(':') &&
      line.length < 100 &&
      /^[A-Z]/.test(line) &&
      !line.includes('.') // Not a sentence
    ) {
      return 2;
    }

    return 0;
  }

  /**
   * Extract goals from text.
   * Searches for "Goal", "Goals", "Objective", "Objectives" keywords.
   * 
   * @param text - Raw text from PDF
   * @returns Array of extracted goal strings
   */
  private extractGoals(text: string): string[] {
    const goals: string[] = [];
    const goalKeywords = ['goal', 'goals', 'objective', 'objectives'];

    // Find sections that contain goal keywords
    const lines = text.split('\n').map((line) => line.trim());
    let inGoalSection = false;
    let currentGoals: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if this line is a goal section header
      if (
        goalKeywords.some((keyword) =>
          lowerLine.startsWith(keyword) && lowerLine.endsWith(':'),
        )
      ) {
        inGoalSection = true;
        currentGoals = [];
        continue;
      }

      // If we're in a goal section, collect bullet points or numbered items
      if (inGoalSection) {
        // Extract bullet points or numbered items first
        const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
        const numberMatch = line.match(/^\d+\.\s+(.+)$/);
        
        if (bulletMatch || numberMatch) {
          // This is a bullet point or numbered item, extract content
          const content = bulletMatch?.[1] || numberMatch?.[1];
          if (content && content.trim().length > 0) {
            currentGoals.push(content.trim());
          }
          continue;
        }

        // Check if we hit a new section (another heading, but not numbered list items)
        // Numbered list items are detected as headings, so we skip them above
        const headingLevel = this.detectHeadingLevel(line);
        if (
          headingLevel > 0 &&
          !goalKeywords.some((keyword) => lowerLine.includes(keyword)) &&
          !numberMatch // Not a numbered list item
        ) {
          inGoalSection = false;
          goals.push(...currentGoals);
          currentGoals = [];
          continue;
        }
      }
    }

    // Add any remaining goals
    if (currentGoals.length > 0) {
      goals.push(...currentGoals);
    }

    return goals.filter((goal) => goal.trim().length > 0);
  }

  /**
   * Extract constraints from text.
   * Searches for "Constraint", "Constraints", "Requirement", "Requirements" keywords.
   * 
   * @param text - Raw text from PDF
   * @returns Array of extracted constraint strings
   */
  private extractConstraints(text: string): string[] {
    const constraints: string[] = [];
    const constraintKeywords = [
      'constraint',
      'constraints',
      'requirement',
      'requirements',
    ];

    // Find sections that contain constraint keywords
    const lines = text.split('\n').map((line) => line.trim());
    let inConstraintSection = false;
    let currentConstraints: string[] = [];

    for (const line of lines) {
      const lowerLine = line.toLowerCase();

      // Check if this line is a constraint section header
      if (
        constraintKeywords.some(
          (keyword) =>
            lowerLine.startsWith(keyword) && lowerLine.endsWith(':'),
        )
      ) {
        inConstraintSection = true;
        currentConstraints = [];
        continue;
      }

      // If we're in a constraint section, collect bullet points or numbered items
      if (inConstraintSection) {
        // Extract bullet points or numbered items first
        const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
        const numberMatch = line.match(/^\d+\.\s+(.+)$/);
        
        if (bulletMatch || numberMatch) {
          // This is a bullet point or numbered item, extract content
          const content = bulletMatch?.[1] || numberMatch?.[1];
          if (content && content.trim().length > 0) {
            currentConstraints.push(content.trim());
          }
          continue;
        }

        // Check if we hit a new section (another heading, but not numbered list items)
        // Numbered list items are detected as headings, so we skip them above
        const headingLevel = this.detectHeadingLevel(line);
        if (
          headingLevel > 0 &&
          !constraintKeywords.some((keyword) => lowerLine.includes(keyword)) &&
          !numberMatch // Not a numbered list item
        ) {
          inConstraintSection = false;
          constraints.push(...currentConstraints);
          currentConstraints = [];
          continue;
        }
      }
    }

    // Add any remaining constraints
    if (currentConstraints.length > 0) {
      constraints.push(...currentConstraints);
    }

    return constraints.filter((constraint) => constraint.trim().length > 0);
  }

  /**
   * Extract document title from text.
   * Uses first line or first section title as fallback.
   * 
   * @param text - Raw text from PDF
   * @param sections - Parsed sections
   * @returns Document title
   */
  private extractTitle(text: string, sections: ParsedSection[]): string {
    // Try first section title
    if (sections.length > 0 && sections[0]!.title) {
      return sections[0]!.title;
    }

    // Fall back to first line
    const firstLine = text.split('\n').find((line) => line.trim().length > 0);
    if (firstLine) {
      return firstLine.trim().substring(0, 200); // Limit length
    }

    return 'Untitled Document';
  }
}
