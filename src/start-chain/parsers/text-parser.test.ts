/**
 * Text Parser Tests
 * 
 * Tests for the TextParser implementation.
 */

import { describe, it, expect } from 'vitest';
import { TextParser } from './text-parser.js';
import type { RequirementsSource } from '../../types/requirements.js';

describe('TextParser', () => {
  const parser = new TextParser();
  
  const createSource = (path: string = '/test/requirements.txt'): RequirementsSource => ({
    path,
    format: 'text',
    size: 1000,
    lastModified: new Date().toISOString(),
  });
  
  describe('parse', () => {
    it('should parse basic text with section headers', () => {
      const content = `INTRODUCTION
This is the introduction content.

GOALS
- Goal 1: Implement feature A
- Goal 2: Implement feature B

CONSTRAINTS
- Must use TypeScript
- Must follow ESM patterns`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.source).toEqual(source);
      expect(result.title).toBe('INTRODUCTION');
      expect(result.sections).toHaveLength(3);
      expect(result.sections[0].title).toBe('INTRODUCTION');
      expect(result.sections[1].title).toBe('GOALS');
      expect(result.sections[2].title).toBe('CONSTRAINTS');
      expect(result.extractedGoals).toHaveLength(2);
      expect(result.extractedConstraints).toHaveLength(2);
      expect(result.rawText).toBe(content);
      expect(result.parseErrors).toEqual([]);
    });
    
    it('should handle ALL CAPS section headers with colons', () => {
      const content = `OVERVIEW:
This is overview content.

REQUIREMENTS:
- Requirement 1
- Requirement 2`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].title).toBe('OVERVIEW');
      expect(result.sections[1].title).toBe('REQUIREMENTS');
    });
    
    it('should handle text without section headers', () => {
      const content = `This is plain text content without any section headers.
It should be placed in a default section.`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Content');
      expect(result.sections[0].content).toContain('plain text content');
    });
    
    it('should handle empty content', () => {
      const content = '';
      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0].title).toBe('Content');
      expect(result.sections[0].content).toBe('');
      expect(result.extractedGoals).toEqual([]);
      expect(result.extractedConstraints).toEqual([]);
    });
    
    it('should extract title from first section', () => {
      const content = `PROJECT OVERVIEW
This is the project overview.`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.title).toBe('PROJECT OVERVIEW');
    });
    
    it('should fall back to filename for title when no sections', () => {
      const content = `Plain text without sections.`;
      const source = createSource('/path/to/my-requirements.txt');
      const result = parser.parse(content, source);
      
      expect(result.title).toBe('my-requirements');
    });
  });
  
  describe('inferSections', () => {
    it('should identify ALL CAPS lines as section headers', () => {
      const lines = [
        'INTRODUCTION',
        'This is intro content.',
        '',
        'GOALS',
        'Goal content here.',
      ];
      
      const sections = parser.inferSections(lines);
      
      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('INTRODUCTION');
      expect(sections[0].content).toContain('intro content');
      expect(sections[1].title).toBe('GOALS');
      expect(sections[1].content).toContain('Goal content');
    });
    
    it('should handle mixed case lines (not section headers)', () => {
      const lines = [
        'Introduction',
        'This is not a section header.',
        '',
        'GOALS',
        'This is a section header.',
      ];
      
      const sections = parser.inferSections(lines);
      
      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('GOALS');
      expect(sections[0].content).toContain('Introduction');
    });
    
    it('should handle sections with common words', () => {
      const lines = [
        'THE PROJECT OVERVIEW',
        'Content here.',
        '',
        'A GOAL OF THE PROJECT',
        'More content.',
      ];
      
      const sections = parser.inferSections(lines);
      
      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('THE PROJECT OVERVIEW');
      expect(sections[1].title).toBe('A GOAL OF THE PROJECT');
    });
    
    it('should assign level 1 to all inferred sections', () => {
      const lines = [
        'SECTION ONE',
        'Content 1',
        '',
        'SECTION TWO',
        'Content 2',
      ];
      
      const sections = parser.inferSections(lines);
      
      expect(sections).toHaveLength(2);
      expect(sections[0].level).toBe(1);
      expect(sections[1].level).toBe(1);
      expect(sections[0].children).toEqual([]);
      expect(sections[1].children).toEqual([]);
    });
  });
  
  describe('extractGoals', () => {
    it('should extract goals from GOALS section', () => {
      const content = `GOALS
- Goal 1: Implement feature A
- Goal 2: Implement feature B
- Goal 3: Write tests`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const goals = parser.extractGoals(content, parsed.sections);
      
      expect(goals).toHaveLength(3);
      expect(goals[0]).toContain('feature A');
      expect(goals[1]).toContain('feature B');
      expect(goals[2]).toContain('Write tests');
    });
    
    it('should extract goals from OBJECTIVES section', () => {
      const content = `OBJECTIVES
* Objective 1
* Objective 2`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const goals = parser.extractGoals(content, parsed.sections);
      
      expect(goals.length).toBeGreaterThan(0);
    });
    
    it('should extract numbered list items as goals', () => {
      const content = `GOALS
1. First goal
2. Second goal
3. Third goal`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const goals = parser.extractGoals(content, parsed.sections);
      
      expect(goals).toHaveLength(3);
      expect(goals[0]).toContain('First goal');
    });
    
    it('should return empty array when no goals found', () => {
      const content = `INTRODUCTION
This is just an introduction section.`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const goals = parser.extractGoals(content, parsed.sections);
      
      expect(goals).toEqual([]);
    });
  });
  
  describe('extractConstraints', () => {
    it('should extract constraints from CONSTRAINTS section', () => {
      const content = `CONSTRAINTS
- Must use TypeScript
- Must follow ESM patterns
- Must have tests`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const constraints = parser.extractConstraints(content, parsed.sections);
      
      expect(constraints).toHaveLength(3);
      expect(constraints[0]).toContain('TypeScript');
      expect(constraints[1]).toContain('ESM patterns');
    });
    
    it('should extract constraints from REQUIREMENTS section', () => {
      const content = `REQUIREMENTS
* Requirement 1
* Requirement 2`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const constraints = parser.extractConstraints(content, parsed.sections);
      
      expect(constraints.length).toBeGreaterThan(0);
    });
    
    it('should return empty array when no constraints found', () => {
      const content = `INTRODUCTION
This is just an introduction section.`;

      const source = createSource();
      const parsed = parser.parse(content, source);
      const constraints = parser.extractConstraints(content, parsed.sections);
      
      expect(constraints).toEqual([]);
    });
  });
  
  describe('edge cases', () => {
    it('should handle malformed content gracefully', () => {
      const content = `SECTION ONE
Content here
SECTION TWO
More content
SECTION THREE
Even more`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.parseErrors).toEqual([]);
      expect(result.sections.length).toBeGreaterThan(0);
    });
    
    it('should handle whitespace-only lines', () => {
      const content = `SECTION ONE


Content here


SECTION TWO


More content`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0].content).toContain('Content here');
    });
    
    it('should handle very short section headers', () => {
      const content = `ABC
Content for ABC section.

DEF
Content for DEF section.`;

      const source = createSource();
      const result = parser.parse(content, source);
      
      // Short headers might not be detected, but should not crash
      expect(result.sections.length).toBeGreaterThan(0);
    });
  });
});
