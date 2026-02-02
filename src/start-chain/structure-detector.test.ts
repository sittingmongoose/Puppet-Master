/**
 * Structure Detector Tests
 *
 * Tests for document structure detection that fixes the H1 title bug.
 * See BUILD_QUEUE_IMPROVEMENTS.md P0-T02.
 */

import { describe, it, expect } from 'vitest';
import {
  detectDocumentStructure,
  StructureDetectionError,
  wouldFailValidation,
} from './structure-detector.js';
import type { ParsedSection } from '../types/requirements.js';

describe('detectDocumentStructure', () => {
  describe('single_h1_with_h2s structure', () => {
    it('should detect single H1 with multiple H2 children', () => {
      const sections: ParsedSection[] = [
        {
          title: 'My Project Requirements',
          content: 'Overview content',
          level: 1,
          children: [
            {
              title: 'User Authentication',
              content: '- Login\n- Logout\n- Password reset',
              level: 2,
              children: [],
            },
            {
              title: 'Database Schema',
              content: '- Users table\n- Posts table',
              level: 2,
              children: [],
            },
            {
              title: 'API Endpoints',
              content: '- GET /users\n- POST /users',
              level: 2,
              children: [],
            },
          ],
        },
      ];

      const rawText = `# My Project Requirements
Overview content

## User Authentication
- Login
- Logout
- Password reset

## Database Schema
- Users table
- Posts table

## API Endpoints
- GET /users
- POST /users`;

      const result = detectDocumentStructure(sections, rawText, {
        failOnValidationError: false,
      });

      expect(result.type).toBe('single_h1_with_h2s');
      expect(result.title).toBe('My Project Requirements');
      expect(result.phaseSections).toHaveLength(3);
      expect(result.phaseSections[0].title).toBe('User Authentication');
      expect(result.phaseSections[1].title).toBe('Database Schema');
      expect(result.phaseSections[2].title).toBe('API Endpoints');
      expect(result.metrics.phasesCount).toBe(3);
    });

    it('should use H2s as phases, not H1', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Project Title',
          content: '',
          level: 1,
          children: [
            { title: 'Phase A', content: 'Content A', level: 2, children: [] },
            { title: 'Phase B', content: 'Content B', level: 2, children: [] },
          ],
        },
      ];

      const result = detectDocumentStructure(sections, '', {
        failOnValidationError: false,
      });

      expect(result.type).toBe('single_h1_with_h2s');
      expect(result.phaseSections).toHaveLength(2);
      expect(result.phaseSections.map(s => s.title)).toEqual(['Phase A', 'Phase B']);
    });
  });

  describe('multiple_h1s structure', () => {
    it('should detect multiple top-level H1s as phases', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1: Setup',
          content: 'Setup content',
          level: 1,
          children: [],
        },
        {
          title: 'Phase 2: Implementation',
          content: 'Implementation content',
          level: 1,
          children: [],
        },
      ];

      const result = detectDocumentStructure(sections, '', {
        failOnValidationError: false,
      });

      expect(result.type).toBe('multiple_h1s');
      expect(result.title).toBeUndefined();
      expect(result.phaseSections).toHaveLength(2);
      expect(result.phaseSections[0].title).toBe('Phase 1: Setup');
      expect(result.phaseSections[1].title).toBe('Phase 2: Implementation');
      expect(result.metrics.phasesCount).toBe(2);
    });

    it('should handle multiple H1s with children', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Phase 1',
          content: 'Phase 1 content',
          level: 1,
          children: [
            { title: 'Task 1.1', content: 'Task content', level: 2, children: [] },
          ],
        },
        {
          title: 'Phase 2',
          content: 'Phase 2 content',
          level: 1,
          children: [
            { title: 'Task 2.1', content: 'Task content', level: 2, children: [] },
          ],
        },
      ];

      const result = detectDocumentStructure(sections, '', {
        failOnValidationError: false,
      });

      expect(result.type).toBe('multiple_h1s');
      expect(result.phaseSections).toHaveLength(2);
      expect(result.metrics.phasesCount).toBe(2);
    });
  });

  describe('flat structure', () => {
    it('should detect single section with no children as flat', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Single Section',
          content: 'All the requirements in one section',
          level: 1,
          children: [],
        },
      ];

      const result = detectDocumentStructure(sections, '', {
        failOnValidationError: false,
      });

      expect(result.type).toBe('flat');
      expect(result.phaseSections).toHaveLength(1);
      expect(result.phaseSections[0].title).toBe('Single Section');
      expect(result.metrics.phasesCount).toBe(1);
    });
  });

  describe('no_headings structure', () => {
    it('should detect empty sections as no_headings', () => {
      const sections: ParsedSection[] = [];

      const result = detectDocumentStructure(sections, 'Plain text without headings', {
        failOnValidationError: false,
      });

      expect(result.type).toBe('no_headings');
      expect(result.phaseSections).toHaveLength(0);
      expect(result.metrics.phasesCount).toBe(0);
    });
  });

  describe('coverage metrics', () => {
    it('should count headings correctly', () => {
      const sections: ParsedSection[] = [
        {
          title: 'H1',
          content: '',
          level: 1,
          children: [
            {
              title: 'H2-1',
              content: '',
              level: 2,
              children: [
                { title: 'H3', content: '', level: 3, children: [] },
              ],
            },
            { title: 'H2-2', content: '', level: 2, children: [] },
          ],
        },
      ];

      const result = detectDocumentStructure(sections, '', {
        failOnValidationError: false,
      });

      expect(result.metrics.headingsCount).toBe(4); // H1 + H2-1 + H3 + H2-2
    });

    it('should count bullet points correctly', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Section',
          content: '- Item 1\n- Item 2\n* Item 3\n1. Item 4\n2. Item 5',
          level: 1,
          children: [],
        },
      ];

      const result = detectDocumentStructure(sections, '', {
        failOnValidationError: false,
      });

      expect(result.metrics.bulletsCount).toBe(5);
    });

    it('should calculate coverage ratio', () => {
      const rawText = '# Title\nContent here\n## Section\nMore content';
      const sections: ParsedSection[] = [
        {
          title: 'Title',
          content: 'Content here',
          level: 1,
          children: [
            { title: 'Section', content: 'More content', level: 2, children: [] },
          ],
        },
      ];

      const result = detectDocumentStructure(sections, rawText, {
        failOnValidationError: false,
      });

      expect(result.metrics.totalChars).toBe(rawText.length);
      expect(result.metrics.parsedChars).toBeGreaterThan(0);
      expect(result.metrics.coverageRatio).toBeGreaterThan(0);
      expect(result.metrics.coverageRatio).toBeLessThanOrEqual(1);
    });
  });

  describe('validation (large doc with 1 phase)', () => {
    it('should throw error for large document with only 1 phase', () => {
      const largeContent = 'x'.repeat(6000);
      const sections: ParsedSection[] = [
        {
          title: 'Single Phase',
          content: largeContent,
          level: 1,
          children: [],
        },
      ];

      expect(() =>
        detectDocumentStructure(sections, largeContent, {
          largeDocThreshold: 5000,
          minPhasesForLargeDoc: 2,
          failOnValidationError: true,
        })
      ).toThrow(StructureDetectionError);
    });

    it('should not throw for small document with 1 phase', () => {
      const smallContent = 'x'.repeat(1000);
      const sections: ParsedSection[] = [
        {
          title: 'Single Phase',
          content: smallContent,
          level: 1,
          children: [],
        },
      ];

      expect(() =>
        detectDocumentStructure(sections, smallContent, {
          largeDocThreshold: 5000,
          minPhasesForLargeDoc: 2,
          failOnValidationError: true,
        })
      ).not.toThrow();
    });

    it('should not throw for large document with multiple phases', () => {
      const largeContent = 'x'.repeat(6000);
      const sections: ParsedSection[] = [
        {
          title: 'Title',
          content: '',
          level: 1,
          children: [
            { title: 'Phase 1', content: largeContent.slice(0, 3000), level: 2, children: [] },
            { title: 'Phase 2', content: largeContent.slice(3000), level: 2, children: [] },
          ],
        },
      ];

      expect(() =>
        detectDocumentStructure(sections, largeContent, {
          largeDocThreshold: 5000,
          minPhasesForLargeDoc: 2,
          failOnValidationError: true,
        })
      ).not.toThrow();
    });

    it('should include metrics in StructureDetectionError', () => {
      const largeContent = 'x'.repeat(6000);
      const sections: ParsedSection[] = [
        {
          title: 'Single Phase',
          content: largeContent,
          level: 1,
          children: [],
        },
      ];

      try {
        detectDocumentStructure(sections, largeContent, {
          largeDocThreshold: 5000,
          failOnValidationError: true,
        });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(StructureDetectionError);
        const structError = error as StructureDetectionError;
        expect(structError.metrics).toBeDefined();
        expect(structError.metrics.phasesCount).toBe(1);
        expect(structError.metrics.totalChars).toBe(6000);
      }
    });

    it('should not throw when failOnValidationError is false', () => {
      const largeContent = 'x'.repeat(6000);
      const sections: ParsedSection[] = [
        {
          title: 'Single Phase',
          content: largeContent,
          level: 1,
          children: [],
        },
      ];

      const result = detectDocumentStructure(sections, largeContent, {
        largeDocThreshold: 5000,
        failOnValidationError: false,
      });

      expect(result.type).toBe('flat');
      expect(result.metrics.phasesCount).toBe(1);
    });
  });

  describe('wouldFailValidation', () => {
    it('should return wouldFail=true for invalid structure', () => {
      const largeContent = 'x'.repeat(6000);
      const sections: ParsedSection[] = [
        {
          title: 'Single Phase',
          content: largeContent,
          level: 1,
          children: [],
        },
      ];

      const result = wouldFailValidation(sections, largeContent, {
        largeDocThreshold: 5000,
      });

      expect(result.wouldFail).toBe(true);
      expect(result.reason).toContain('Large document');
      expect(result.metrics.phasesCount).toBe(1);
    });

    it('should return wouldFail=false for valid structure', () => {
      const sections: ParsedSection[] = [
        {
          title: 'Title',
          content: '',
          level: 1,
          children: [
            { title: 'Phase 1', content: 'x'.repeat(3000), level: 2, children: [] },
            { title: 'Phase 2', content: 'x'.repeat(3000), level: 2, children: [] },
          ],
        },
      ];

      const result = wouldFailValidation(sections, 'x'.repeat(6000), {
        largeDocThreshold: 5000,
      });

      expect(result.wouldFail).toBe(false);
      expect(result.reason).toBeUndefined();
    });
  });
});

describe('integration: H1 title bug fix', () => {
  it('should produce 3 phases from doc with # Title + ## Section1 + ## Section2 + ## Section3', () => {
    // This is the exact scenario from P0-T02 acceptance criteria
    const sections: ParsedSection[] = [
      {
        title: 'My Project Requirements',
        content: 'Project overview',
        level: 1,
        children: [
          {
            title: 'Section 1',
            content: '- Requirement 1\n- Requirement 2',
            level: 2,
            children: [],
          },
          {
            title: 'Section 2',
            content: '- Requirement 3\n- Requirement 4',
            level: 2,
            children: [],
          },
          {
            title: 'Section 3',
            content: '- Requirement 5',
            level: 2,
            children: [],
          },
        ],
      },
    ];

    const result = detectDocumentStructure(sections, '', {
      failOnValidationError: false,
    });

    // Should detect 3 phases (H2s), not 1 (H1)
    expect(result.phaseSections).toHaveLength(3);
    expect(result.type).toBe('single_h1_with_h2s');
    expect(result.title).toBe('My Project Requirements');
  });

  it('should produce 2 phases from doc with # Phase1 + # Phase2', () => {
    // This is the second scenario from P0-T02 acceptance criteria
    const sections: ParsedSection[] = [
      {
        title: 'Phase 1',
        content: '- Task 1\n- Task 2',
        level: 1,
        children: [],
      },
      {
        title: 'Phase 2',
        content: '- Task 3\n- Task 4',
        level: 1,
        children: [],
      },
    ];

    const result = detectDocumentStructure(sections, '', {
      failOnValidationError: false,
    });

    // Should detect 2 phases (H1s)
    expect(result.phaseSections).toHaveLength(2);
    expect(result.type).toBe('multiple_h1s');
  });
});
