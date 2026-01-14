/**
 * Docx Parser for RWM Puppet Master
 * 
 * Parses Word document (.docx) requirements files into structured ParsedRequirements.
 * Uses mammoth library to extract text and HTML structure, then parses headings to build sections.
 * 
 * See REQUIREMENTS.md Section 5 (Start Chain requirements) for context.
 */

import mammoth from 'mammoth';
import type {
  ParsedRequirements,
  ParsedSection,
  RequirementsSource,
} from '../../types/requirements.js';

/**
 * DocxParser class for parsing Word document requirements files.
 * 
 * Uses mammoth library to:
 * - Extract raw text content
 * - Convert to HTML to detect heading structure
 * - Parse HTML headings (h1-h6) into hierarchical sections
 * - Extract goals and constraints from content
 */
export class DocxParser {
  /**
   * Parse Word document buffer into ParsedRequirements structure.
   * 
   * @param buffer - The .docx file buffer
   * @param source - Metadata about the source file
   * @returns Promise resolving to parsed requirements document
   */
  async parse(buffer: Buffer, source: RequirementsSource): Promise<ParsedRequirements> {
    const parseErrors: string[] = [];
    
    try {
      // Extract raw text
      const textResult = await mammoth.extractRawText({ buffer });
      const rawText = textResult.value;
      
      // Convert to HTML to detect structure
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const html = htmlResult.value;
      
      // Parse sections from HTML headings
      const sections = this.parseSectionsFromHtml(html, rawText);
      
      // Extract title from first section or filename
      const title = this.extractTitle(sections, source.path);
      
      // Extract goals and constraints
      const extractedGoals = this.extractGoals(rawText, sections);
      const extractedConstraints = this.extractConstraints(rawText, sections);
      
      // Collect warnings from mammoth
      if (textResult.messages.length > 0) {
        parseErrors.push(...textResult.messages.map(m => m.message));
      }
      if (htmlResult.messages.length > 0) {
        parseErrors.push(...htmlResult.messages.map(m => m.message));
      }
      
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error parsing docx';
      parseErrors.push(`Failed to parse docx file: ${errorMessage}`);
      
      // Return minimal structure on error
      return {
        source,
        title: this.extractTitleFromPath(source.path),
        sections: [],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: '',
        parseErrors,
      };
    }
  }
  
  /**
   * Parse sections from HTML content by detecting heading tags.
   * Builds hierarchical structure based on heading levels (h1-h6).
   * 
   * @param html - HTML content from mammoth
   * @param rawText - Raw text content for extracting section bodies
   * @returns Array of parsed sections with hierarchy
   */
  private parseSectionsFromHtml(html: string, rawText: string): ParsedSection[] {
    const sections: ParsedSection[] = [];
    const headingStack: ParsedSection[] = []; // Stack to track hierarchy
    
    // Extract headings from HTML
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: Array<{ level: number; title: string; index: number }> = [];
    let match;
    
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1], 10);
      const title = this.stripHtmlTags(match[2]).trim();
      headings.push({ level, title, index: match.index });
    }
    
    // If no headings found, create a single section with all content
    if (headings.length === 0) {
      return [{
        title: 'Content',
        content: rawText.trim(),
        level: 1,
        children: [],
      }];
    }
    
    // Build hierarchical section structure
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const nextHeadingIndex = i < headings.length - 1 ? headings[i + 1].index : html.length;
      
      // Extract content between this heading and next
      const contentStart = heading.index + html.substring(heading.index).indexOf('</h');
      const contentEnd = nextHeadingIndex;
      const contentHtml = html.substring(contentStart, contentEnd);
      const content = this.stripHtmlTags(contentHtml).trim();
      
      const section: ParsedSection = {
        title: heading.title,
        content,
        level: heading.level,
        children: [],
      };
      
      // Find parent section (last section with level < current level)
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= heading.level) {
        headingStack.pop();
      }
      
      if (headingStack.length === 0) {
        // Top-level section
        sections.push(section);
      } else {
        // Child section
        const parent = headingStack[headingStack.length - 1];
        parent.children.push(section);
      }
      
      headingStack.push(section);
    }
    
    return sections;
  }
  
  /**
   * Strip HTML tags from text content.
   * 
   * @param html - HTML string
   * @returns Plain text without HTML tags
   */
  private stripHtmlTags(html: string): string {
    return html
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
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
  private extractGoals(content: string, sections: ParsedSection[]): string[] {
    const goals: string[] = [];
    const goalKeywords = ['GOAL', 'GOALS', 'OBJECTIVE', 'OBJECTIVES'];
    
    // Look for sections with goal-related titles
    for (const section of sections) {
      const titleUpper = section.title.toUpperCase();
      if (goalKeywords.some(keyword => titleUpper.includes(keyword))) {
        const items = this.extractListItems(section.content);
        goals.push(...items);
      }
      
      // Also check children recursively
      if (section.children.length > 0) {
        const childGoals = this.extractGoalsFromSections(section.children, goalKeywords);
        goals.push(...childGoals);
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
   * Extract goals from nested sections recursively.
   * 
   * @param sections - Sections to search
   * @param keywords - Keywords to match
   * @returns Array of extracted goals
   */
  private extractGoalsFromSections(sections: ParsedSection[], keywords: string[]): string[] {
    const goals: string[] = [];
    
    for (const section of sections) {
      const titleUpper = section.title.toUpperCase();
      if (keywords.some(keyword => titleUpper.includes(keyword))) {
        const items = this.extractListItems(section.content);
        goals.push(...items);
      }
      
      if (section.children.length > 0) {
        const childGoals = this.extractGoalsFromSections(section.children, keywords);
        goals.push(...childGoals);
      }
    }
    
    return goals;
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
  private extractConstraints(content: string, sections: ParsedSection[]): string[] {
    const constraints: string[] = [];
    const constraintKeywords = ['CONSTRAINT', 'CONSTRAINTS', 'REQUIREMENT', 'REQUIREMENTS'];
    
    // Look for sections with constraint-related titles
    for (const section of sections) {
      const titleUpper = section.title.toUpperCase();
      if (constraintKeywords.some(keyword => titleUpper.includes(keyword))) {
        const items = this.extractListItems(section.content);
        constraints.push(...items);
      }
      
      // Also check children recursively
      if (section.children.length > 0) {
        const childConstraints = this.extractConstraintsFromSections(section.children, constraintKeywords);
        constraints.push(...childConstraints);
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
   * Extract constraints from nested sections recursively.
   * 
   * @param sections - Sections to search
   * @param keywords - Keywords to match
   * @returns Array of extracted constraints
   */
  private extractConstraintsFromSections(sections: ParsedSection[], keywords: string[]): string[] {
    const constraints: string[] = [];
    
    for (const section of sections) {
      const titleUpper = section.title.toUpperCase();
      if (keywords.some(keyword => titleUpper.includes(keyword))) {
        const items = this.extractListItems(section.content);
        constraints.push(...items);
      }
      
      if (section.children.length > 0) {
        const childConstraints = this.extractConstraintsFromSections(section.children, keywords);
        constraints.push(...childConstraints);
      }
    }
    
    return constraints;
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
      
      // Match bullet points: -, *, •, or numbered lists: 1., 2., etc.
      const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
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
    return this.extractTitleFromPath(filePath);
  }
  
  /**
   * Extract title from file path.
   * 
   * @param filePath - Source file path
   * @returns Document title from filename
   */
  private extractTitleFromPath(filePath: string): string {
    const fileName = filePath.split(/[/\\]/).pop() || 'requirements';
    return fileName.replace(/\.[^.]*$/, '');
  }
}
