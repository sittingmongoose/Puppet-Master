/**
 * Tests for PdfParser
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfParser } from './pdf-parser.js';
import type { RequirementsSource } from '../../types/requirements.js';

// Mock pdf-parse
vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

import pdfParse from 'pdf-parse';

describe('PdfParser', () => {
  let parser: PdfParser;
  const mockSource: RequirementsSource = {
    path: '/test/requirements.pdf',
    format: 'pdf',
    size: 1024,
    lastModified: '2026-01-13T12:00:00Z',
  };

  beforeEach(() => {
    parser = new PdfParser();
    vi.clearAllMocks();
  });

  describe('parse', () => {
    it('should extract text from PDF and return ParsedRequirements', async () => {
      const mockText = `Project Requirements

OVERVIEW
This document describes the requirements for the project.

Goals:
- Implement feature A
- Implement feature B

Constraints:
- Must use TypeScript
- Must follow ESM patterns
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.source).toEqual(mockSource);
      expect(result.rawText).toBe(mockText);
      expect(result.title).toBeDefined();
      expect(result.sections).toBeDefined();
      expect(result.extractedGoals).toBeDefined();
      expect(result.extractedConstraints).toBeDefined();
      expect(result.parseErrors).toEqual([]);
    });

    it('should extract goals from PDF text', async () => {
      const mockText = `Goals:
- Implement feature A
- Implement feature B
- Complete testing
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.extractedGoals.length).toBeGreaterThan(0);
      expect(result.extractedGoals.some((g) => g.includes('feature A'))).toBe(
        true,
      );
      expect(result.extractedGoals.some((g) => g.includes('feature B'))).toBe(
        true,
      );
    });

    it('should extract constraints from PDF text', async () => {
      const mockText = `Constraints:
- Must use TypeScript
- Must follow ESM patterns
- Must pass all tests
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.extractedConstraints.length).toBeGreaterThan(0);
      expect(
        result.extractedConstraints.some((c) => c.includes('TypeScript')),
      ).toBe(true);
      expect(
        result.extractedConstraints.some((c) => c.includes('ESM')),
      ).toBe(true);
    });

    it('should infer sections from capitalized headings', async () => {
      const mockText = `PROJECT OVERVIEW
This is the overview section.

TECHNICAL REQUIREMENTS
This is the technical requirements section.

1.1 IMPLEMENTATION DETAILS
This is a subsection.
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.sections.length).toBeGreaterThan(0);
    });

    it('should handle PDF parsing errors gracefully', async () => {
      const error = new Error('Invalid PDF format');
      vi.mocked(pdfParse).mockRejectedValue(error);

      const buffer = Buffer.from('invalid pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.parseErrors.length).toBeGreaterThan(0);
      expect(result.parseErrors[0]).toContain('Failed to parse PDF');
      expect(result.rawText).toBe('');
      expect(result.sections).toEqual([]);
    });

    it('should handle empty PDF text', async () => {
      vi.mocked(pdfParse).mockResolvedValue({
        text: '',
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.parseErrors.length).toBeGreaterThan(0);
      expect(result.parseErrors[0]).toContain('no extractable text');
      expect(result.rawText).toBe('');
    });

    it('should extract title from first section or first line', async () => {
      const mockText = `PROJECT REQUIREMENTS

Overview section content here.
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.title).toBeDefined();
      expect(result.title.length).toBeGreaterThan(0);
    });

    it('should handle goals with numbered lists', async () => {
      const mockText = `Goals:
1. Implement feature A
2. Implement feature B
3. Complete testing
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.extractedGoals.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle constraints with numbered lists', async () => {
      const mockText = `Constraints:
1. Must use TypeScript
2. Must follow ESM patterns
`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.extractedConstraints.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle PDF with no structure', async () => {
      const mockText = `This is just plain text with no structure or headings.`;
      vi.mocked(pdfParse).mockResolvedValue({
        text: mockText,
      } as Awaited<ReturnType<typeof pdfParse>>);

      const buffer = Buffer.from('mock pdf data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.rawText).toBe(mockText);
      expect(result.sections).toBeDefined();
      expect(result.parseErrors).toEqual([]);
    });

    it('should handle malformed PDF buffer', async () => {
      const error = new Error('Corrupt PDF file');
      vi.mocked(pdfParse).mockRejectedValue(error);

      const buffer = Buffer.from('corrupt data');
      const result = await parser.parse(buffer, mockSource);

      expect(result.parseErrors.length).toBeGreaterThan(0);
      expect(result.parseErrors[0]).toContain('Failed to parse PDF');
    });
  });
});
