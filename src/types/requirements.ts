/**
 * Requirements ingestion types for RWM Puppet Master
 * 
 * This file defines TypeScript types for requirements document ingestion and parsing.
 * These types are used by parsers in the start chain pipeline to convert requirements
 * documents (markdown, PDF, text, docx) into structured data.
 * 
 * See REQUIREMENTS.md Section 5 (Start Chain requirements) for context.
 */

/**
 * Supported file formats for requirements documents.
 */
export type SupportedFormat = 'markdown' | 'pdf' | 'text' | 'docx';

/**
 * Metadata about the source requirements file.
 * Contains information about the original file that was parsed.
 */
export interface RequirementsSource {
  /** File system path to the source file */
  path: string;
  /** Detected or specified file format */
  format: SupportedFormat;
  /** File size in bytes */
  size: number;
  /** ISO 8601 timestamp of last modification */
  lastModified: string;
}

/**
 * Hierarchical section structure from parsed requirements.
 * Represents a section with its heading, content, and nested subsections.
 */
export interface ParsedSection {
  /** Section heading text */
  title: string;
  /** Section body content (text between this heading and next heading of same or higher level) */
  content: string;
  /** Heading level (1-6, where 1 is top-level) */
  level: number;
  /** Nested subsections (child headings) */
  children: ParsedSection[];
}

/**
 * Complete parsed requirements document.
 * Contains the full structure of a parsed requirements document including
 * sections, extracted goals/constraints, and any parsing errors.
 */
export interface ParsedRequirements {
  /** Metadata about the source file */
  source: RequirementsSource;
  /** Document title (typically from first H1 heading or filename) */
  title: string;
  /** Top-level sections from the document */
  sections: ParsedSection[];
  /** Extracted goal statements (from "Goals", "Objectives", etc. sections) */
  extractedGoals: string[];
  /** Extracted constraint statements (from "Constraints", "Requirements", etc. sections) */
  extractedConstraints: string[];
  /** Full raw text content of the document */
  rawText: string;
  /** Any parsing errors encountered during document processing */
  parseErrors: string[];
}

/**
 * Validation results for requirements documents.
 * Used to validate parsed requirements before generating PRD or architecture documents.
 */
export interface RequirementsValidation {
  /** Whether the requirements document is valid */
  isValid: boolean;
  /** List of validation errors (must be fixed) */
  errors: string[];
  /** List of validation warnings (should be addressed) */
  warnings: string[];
  /** List of improvement suggestions (optional enhancements) */
  suggestions: string[];
}
