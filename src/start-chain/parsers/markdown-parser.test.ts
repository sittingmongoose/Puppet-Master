/**
 * Markdown Parser Tests
 * 
 * Tests for the MarkdownParser implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { MarkdownParser } from './markdown-parser.js';
import type { RequirementsSource } from '../../types/index.js';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  const createSource = (path: string = 'test.md'): RequirementsSource => ({
    path,
    format: 'markdown',
    size: 0,
    lastModified: new Date().toISOString(),
  });

  describe('detectHeadingLevel', () => {
    it('should detect H1 heading', () => {
      expect(parser.detectHeadingLevel('# Title')).toBe(1);
    });

    it('should detect H2 heading', () => {
      expect(parser.detectHeadingLevel('## Section')).toBe(2);
    });

    it('should detect H6 heading', () => {
      expect(parser.detectHeadingLevel('###### Subsection')).toBe(6);
    });

    it('should return 0 for non-heading lines', () => {
      expect(parser.detectHeadingLevel('Regular text')).toBe(0);
      expect(parser.detectHeadingLevel('  # Not a heading (indented)')).toBe(0);
      expect(parser.detectHeadingLevel('')).toBe(0);
    });
  });

  describe('parseHeadings', () => {
    it('should parse simple headings', () => {
      const content = `# Title

Some content here.

## Section 1

Content for section 1.

## Section 2

Content for section 2.
`;

      const sections = parser.parseHeadings(content);

      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Title');
      expect(sections[0].level).toBe(1);
      expect(sections[0].children).toHaveLength(2);
      expect(sections[0].children[0].title).toBe('Section 1');
      expect(sections[0].children[1].title).toBe('Section 2');
    });

    it('should handle nested headings', () => {
      const content = `# Main Title

Main content.

## Section 1

Section 1 content.

### Subsection 1.1

Subsection content.

### Subsection 1.2

Another subsection.

## Section 2

Section 2 content.
`;

      const sections = parser.parseHeadings(content);

      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe('Main Title');
      expect(sections[0].children).toHaveLength(2);
      expect(sections[0].children[0].title).toBe('Section 1');
      expect(sections[0].children[0].children).toHaveLength(2);
      expect(sections[0].children[0].children[0].title).toBe('Subsection 1.1');
      expect(sections[0].children[0].children[1].title).toBe('Subsection 1.2');
    });

    it('should extract section content', () => {
      const content = `# Title

This is some content.

## Section

Section content here.
With multiple lines.

More content.
`;

      const sections = parser.parseHeadings(content);

      expect(sections[0].content).toContain('This is some content.');
      expect(sections[0].children[0].content).toContain('Section content here.');
      expect(sections[0].children[0].content).toContain('With multiple lines.');
    });

    it('should handle multiple top-level headings', () => {
      const content = `# First Section

Content 1.

# Second Section

Content 2.
`;

      const sections = parser.parseHeadings(content);

      expect(sections).toHaveLength(2);
      expect(sections[0].title).toBe('First Section');
      expect(sections[1].title).toBe('Second Section');
    });

    it('should handle empty content', () => {
      const sections = parser.parseHeadings('');
      expect(sections).toHaveLength(0);
    });

    it('should handle content without headings', () => {
      const content = `Just some text.

No headings here.

More text.
`;

      const sections = parser.parseHeadings(content);
      expect(sections).toHaveLength(0);
    });
  });

  describe('extractGoals', () => {
    it('should extract goals from "Goals" section', () => {
      const content = `# Requirements

## Goals

- Goal 1: Build a system
- Goal 2: Make it fast
- Goal 3: Ensure reliability

## Other Section

Some other content.
`;

      const sections = parser.parseHeadings(content);
      const goals = parser.extractGoals(sections);

      expect(goals).toHaveLength(3);
      expect(goals[0]).toBe('Goal 1: Build a system');
      expect(goals[1]).toBe('Goal 2: Make it fast');
      expect(goals[2]).toBe('Goal 3: Ensure reliability');
    });

    it('should extract goals from "Objectives" section', () => {
      const content = `# Requirements

## Objectives

* Objective 1
* Objective 2
`;

      const sections = parser.parseHeadings(content);
      const goals = parser.extractGoals(sections);

      expect(goals).toHaveLength(2);
      expect(goals[0]).toBe('Objective 1');
      expect(goals[1]).toBe('Objective 2');
    });

    it('should extract goals case-insensitively', () => {
      const content = `# Requirements

## GOALS

- Goal 1
- Goal 2
`;

      const sections = parser.parseHeadings(content);
      const goals = parser.extractGoals(sections);

      expect(goals).toHaveLength(2);
    });

    it('should extract goals from nested sections', () => {
      const content = `# Requirements

## Section 1

### Goals

- Nested goal 1
- Nested goal 2
`;

      const sections = parser.parseHeadings(content);
      const goals = parser.extractGoals(sections);

      expect(goals).toHaveLength(2);
      expect(goals[0]).toBe('Nested goal 1');
    });

    it('should return empty array if no goals section', () => {
      const content = `# Requirements

## Other Section

Some content.
`;

      const sections = parser.parseHeadings(content);
      const goals = parser.extractGoals(sections);

      expect(goals).toEqual([]);
    });

    it('should handle numbered lists as goals', () => {
      const content = `# Requirements

## Goals

1. First goal
2. Second goal
3. Third goal
`;

      const sections = parser.parseHeadings(content);
      const goals = parser.extractGoals(sections);

      expect(goals).toHaveLength(3);
      expect(goals[0]).toBe('First goal');
    });
  });

  describe('extractConstraints', () => {
    it('should extract constraints from "Constraints" section', () => {
      const content = `# Requirements

## Constraints

- Must use TypeScript
- No external APIs
- Must be CLI-only

## Other Section

Some content.
`;

      const sections = parser.parseHeadings(content);
      const constraints = parser.extractConstraints(sections);

      expect(constraints).toHaveLength(3);
      expect(constraints[0]).toBe('Must use TypeScript');
      expect(constraints[1]).toBe('No external APIs');
      expect(constraints[2]).toBe('Must be CLI-only');
    });

    it('should extract constraints from "Requirements" section', () => {
      const content = `# Doc

## Requirements

* Requirement 1
* Requirement 2
`;

      const sections = parser.parseHeadings(content);
      const constraints = parser.extractConstraints(sections);

      expect(constraints).toHaveLength(2);
    });

    it('should extract constraints case-insensitively', () => {
      const content = `# Doc

## CONSTRAINTS

- Constraint 1
`;

      const sections = parser.parseHeadings(content);
      const constraints = parser.extractConstraints(sections);

      expect(constraints).toHaveLength(1);
    });

    it('should return empty array if no constraints section', () => {
      const content = `# Requirements

## Goals

- Some goal
`;

      const sections = parser.parseHeadings(content);
      const constraints = parser.extractConstraints(sections);

      expect(constraints).toEqual([]);
    });
  });

  describe('parse', () => {
    it('should parse complete markdown document', () => {
      const content = `# Project Requirements

Project description here.

## Goals

- Goal 1
- Goal 2

## Constraints

- Constraint 1
- Constraint 2

## Architecture

Architecture details.
`;

      const source = createSource('requirements.md');
      const result = parser.parse(content, source);

      expect(result.title).toBe('Project Requirements');
      expect(result.source).toEqual(source);
      expect(result.rawText).toBe(content);
      expect(result.sections).toHaveLength(1);
      expect(result.extractedGoals).toHaveLength(2);
      expect(result.extractedConstraints).toHaveLength(2);
      expect(result.parseErrors).toEqual([]);
    });

    it('should extract title from first H1', () => {
      const content = `# My Project Title

Content here.
`;

      const source = createSource('test.md');
      const result = parser.parse(content, source);

      expect(result.title).toBe('My Project Title');
    });

    it('should use filename as title if no H1 found', () => {
      const content = `## Section 1

No H1 heading here.
`;

      const source = createSource('my-requirements.md');
      const result = parser.parse(content, source);

      expect(result.title).toBe('my-requirements');
    });

    it('should handle empty content', () => {
      const source = createSource('empty.md');
      const result = parser.parse('', source);

      expect(result.title).toBe('empty');
      expect(result.sections).toHaveLength(0);
      expect(result.extractedGoals).toEqual([]);
      expect(result.extractedConstraints).toEqual([]);
      expect(result.rawText).toBe('');
    });

    it('should handle malformed markdown gracefully', () => {
      const content = `# Title

## Section

Some content

### Broken
## Wrong level (skips level)
`;

      const source = createSource('malformed.md');
      const result = parser.parse(content, source);

      // Should still parse what it can
      expect(result.sections.length).toBeGreaterThan(0);
      expect(result.parseErrors).toEqual([]); // Errors are caught and stored, but parsing continues
    });

    it('should include raw text in result', () => {
      const content = `# Title

Some content.
`;

      const source = createSource('test.md');
      const result = parser.parse(content, source);

      expect(result.rawText).toBe(content);
    });

    it('should handle special characters in headings', () => {
      const content = `# Title with "quotes" and (parentheses)

## Section with - dashes
`;

      const source = createSource('test.md');
      const result = parser.parse(content, source);

      expect(result.sections[0].title).toBe('Title with "quotes" and (parentheses)');
      expect(result.sections[0].children[0].title).toBe('Section with - dashes');
    });

    it('should extract both goals and constraints', () => {
      const content = `# Requirements

## Goals

- Goal A
- Goal B

## Constraints

- Constraint X
- Constraint Y
`;

      const source = createSource('test.md');
      const result = parser.parse(content, source);

      expect(result.extractedGoals).toHaveLength(2);
      expect(result.extractedConstraints).toHaveLength(2);
      expect(result.extractedGoals[0]).toBe('Goal A');
      expect(result.extractedConstraints[0]).toBe('Constraint X');
    });
  });
});
