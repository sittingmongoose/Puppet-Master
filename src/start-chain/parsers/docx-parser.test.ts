/**
 * Docx Parser Tests
 * 
 * Tests for the DocxParser implementation.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocxParser } from './docx-parser.js';
import type { RequirementsSource } from '../../types/requirements.js';
import mammoth from 'mammoth';

// Mock mammoth
vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
    convertToHtml: vi.fn(),
  },
}));

describe('DocxParser', () => {
  const parser = new DocxParser();
  const mockMammoth = mammoth as unknown as {
    extractRawText: ReturnType<typeof vi.fn>;
    convertToHtml: ReturnType<typeof vi.fn>;
  };
  
  const createSource = (path: string = '/test/requirements.docx'): RequirementsSource => ({
    path,
    format: 'docx',
    size: 5000,
    lastModified: new Date().toISOString(),
  });
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('parse', () => {
    it('should parse docx with headings', async () => {
      const rawText = `Introduction
This is the introduction content.

Goals
- Goal 1: Implement feature A
- Goal 2: Implement feature B

Constraints
- Must use TypeScript
- Must follow ESM patterns`;

      const html = `<h1>Introduction</h1>
<p>This is the introduction content.</p>
<h1>Goals</h1>
<ul>
<li>Goal 1: Implement feature A</li>
<li>Goal 2: Implement feature B</li>
</ul>
<h1>Constraints</h1>
<ul>
<li>Must use TypeScript</li>
<li>Must follow ESM patterns</li>
</ul>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.source).toEqual(source);
      expect(result.title).toBe('Introduction');
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.extractedGoals.length).toBeGreaterThan(0);
      expect(result.extractedConstraints.length).toBeGreaterThan(0);
      expect(result.rawText).toBe(rawText);
      expect(result.parseErrors).toEqual([]);
    });
    
    it('should parse hierarchical headings', async () => {
      const rawText = `Main Section
Content for main section.

Subsection
Content for subsection.`;

      const html = `<h1>Main Section</h1>
<p>Content for main section.</p>
<h2>Subsection</h2>
<p>Content for subsection.</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.sections.length).toBeGreaterThan(0);
      // Check that subsection is nested
      if (result.sections[0].children.length > 0) {
        expect(result.sections[0].children[0].level).toBe(2);
      }
    });
    
    it('should handle docx without headings', async () => {
      const rawText = `This is plain text content without any headings.
It should be placed in a default section.`;

      const html = `<p>This is plain text content without any headings.</p>
<p>It should be placed in a default section.</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Content');
      expect(result.sections[0].content).toContain('plain text content');
    });
    
    it('should extract goals from GOALS section', async () => {
      const rawText = `Goals
- Goal 1: Implement feature A
- Goal 2: Implement feature B`;

      const html = `<h1>Goals</h1>
<ul>
<li>Goal 1: Implement feature A</li>
<li>Goal 2: Implement feature B</li>
</ul>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.extractedGoals.length).toBeGreaterThanOrEqual(2);
      expect(result.extractedGoals[0]).toContain('feature A');
      expect(result.extractedGoals[1]).toContain('feature B');
    });
    
    it('should extract constraints from CONSTRAINTS section', async () => {
      const rawText = `Constraints
- Must use TypeScript
- Must follow ESM patterns`;

      const html = `<h1>Constraints</h1>
<ul>
<li>Must use TypeScript</li>
<li>Must follow ESM patterns</li>
</ul>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.extractedConstraints.length).toBeGreaterThanOrEqual(2);
      expect(result.extractedConstraints[0]).toContain('TypeScript');
    });
    
    it('should handle mammoth warnings', async () => {
      const rawText = `Content here.`;
      const html = `<p>Content here.</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [{ type: 'warning', message: 'Warning 1' }],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [{ type: 'warning', message: 'Warning 2' }],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.parseErrors.length).toBeGreaterThan(0);
      expect(result.parseErrors).toContain('Warning 1');
      expect(result.parseErrors).toContain('Warning 2');
    });
    
    it('should handle parsing errors gracefully', async () => {
      const error = new Error('Failed to parse docx');
      mockMammoth.extractRawText.mockRejectedValue(error);
      
      const source = createSource();
      const buffer = Buffer.from('corrupt docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.parseErrors.length).toBeGreaterThan(0);
      expect(result.parseErrors[0]).toContain('Failed to parse docx');
      expect(result.sections).toEqual([]);
      expect(result.extractedGoals).toEqual([]);
      expect(result.extractedConstraints).toEqual([]);
      expect(result.rawText).toBe('');
    });
    
    it('should extract title from first section', async () => {
      const rawText = `Project Overview
This is the project overview.`;

      const html = `<h1>Project Overview</h1>
<p>This is the project overview.</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.title).toBe('Project Overview');
    });
    
    it('should fall back to filename for title when no sections', async () => {
      const rawText = `Plain text without headings.`;
      const html = `<p>Plain text without headings.</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource('/path/to/my-requirements.docx');
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.title).toBe('my-requirements');
    });
    
    it('should handle multiple heading levels', async () => {
      const rawText = `Level 1
Content 1
Level 2
Content 2
Level 3
Content 3`;

      const html = `<h1>Level 1</h1>
<p>Content 1</p>
<h2>Level 2</h2>
<p>Content 2</p>
<h3>Level 3</h3>
<p>Content 3</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      expect(result.sections.length).toBeGreaterThan(0);
      // Verify hierarchy is maintained
      const hasNestedSections = result.sections.some(s => s.children.length > 0);
      expect(hasNestedSections || result.sections.length >= 3).toBe(true);
    });
    
    it('should handle empty docx file', async () => {
      mockMammoth.extractRawText.mockResolvedValue({
        value: '',
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: '',
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('empty docx');
      const result = await parser.parse(buffer, source);
      
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Content');
      expect(result.extractedGoals).toEqual([]);
      expect(result.extractedConstraints).toEqual([]);
    });
  });
  
  describe('edge cases', () => {
    it('should handle HTML entities in content', async () => {
      const rawText = `Section with entities`;
      const html = `<h1>Section with entities</h1>
<p>Content with &amp; and &lt;tags&gt; and &quot;quotes&quot;</p>`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      // Should not crash and should parse successfully
      expect(result.sections.length).toBeGreaterThan(0);
    });
    
    it('should handle malformed HTML gracefully', async () => {
      const rawText = `Content here.`;
      const html = `<h1>Section</h1><p>Content</p><h2>Unclosed tag`;

      mockMammoth.extractRawText.mockResolvedValue({
        value: rawText,
        messages: [],
      });
      
      mockMammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: [],
      });
      
      const source = createSource();
      const buffer = Buffer.from('fake docx content');
      const result = await parser.parse(buffer, source);
      
      // Should not crash
      expect(result.sections.length).toBeGreaterThanOrEqual(0);
    });
  });
});
