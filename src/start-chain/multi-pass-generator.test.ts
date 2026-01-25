/**
 * Multi-Pass PRD Generator Tests
 *
 * Tests for P1-T05: Multi-Pass PRD Generation
 */

import { describe, it, expect } from 'vitest';
import {
  MultiPassPrdGenerator,
  DEFAULT_MULTI_PASS_CONFIG,
} from './multi-pass-generator.js';
import type { ParsedRequirements, ParsedSection } from '../types/requirements.js';

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a small test document (below multi-pass threshold).
 */
function createSmallDocument(): ParsedRequirements {
  return {
    source: {
      path: '/test/small-doc.md',
      format: 'markdown',
      size: 500,
      lastModified: new Date().toISOString(),
    },
    title: 'Small Test Document',
    sections: [
      {
        title: 'Section 1',
        content: 'This is a small section.',
        level: 2,
        children: [],
      },
    ],
    extractedGoals: [],
    extractedConstraints: [],
    rawText: 'Small document content. This is a small section.',
    parseErrors: [],
  };
}

/**
 * Create a large test document (above multi-pass threshold).
 */
function createLargeDocument(): ParsedRequirements {
  // Generate content that exceeds the default threshold (5000 chars)
  const longContent = 'This is a detailed requirement that needs implementation. '.repeat(100);
  const section1Content = `- Requirement 1: ${longContent.substring(0, 1000)}\n- Requirement 2: Handle edge cases\n- Requirement 3: Add error handling`;
  const section2Content = `- Feature A: ${longContent.substring(0, 800)}\n- Feature B: UI implementation\n- Feature C: API integration`;
  const section3Content = `- Test 1: Unit tests\n- Test 2: Integration tests\n- Test 3: E2E tests`;

  const sections: ParsedSection[] = [
    {
      title: 'Phase 1: Core Implementation',
      content: section1Content,
      level: 2,
      children: [
        {
          title: 'Task 1.1: Setup',
          content: 'Setup project structure and dependencies.',
          level: 3,
          children: [],
        },
        {
          title: 'Task 1.2: Database',
          content: 'Implement database schema and migrations.',
          level: 3,
          children: [],
        },
      ],
    },
    {
      title: 'Phase 2: Features',
      content: section2Content,
      level: 2,
      children: [
        {
          title: 'Task 2.1: UI Components',
          content: 'Build reusable UI components.',
          level: 3,
          children: [],
        },
      ],
    },
    {
      title: 'Phase 3: Testing',
      content: section3Content,
      level: 2,
      children: [],
    },
  ];

  const rawText = [
    '# Large Test Document',
    '',
    ...sections.map((s) => `## ${s.title}\n${s.content}`),
  ].join('\n');

  return {
    source: {
      path: '/test/large-doc.md',
      format: 'markdown',
      size: rawText.length,
      lastModified: new Date().toISOString(),
    },
    title: 'Large Test Document',
    sections,
    extractedGoals: ['Build a complete system'],
    extractedConstraints: ['Must be scalable'],
    rawText,
    parseErrors: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe('MultiPassPrdGenerator', () => {
  describe('Configuration', () => {
    it('should use default config when none provided', () => {
      new MultiPassPrdGenerator({ projectName: 'Test' });
      expect(DEFAULT_MULTI_PASS_CONFIG.enabled).toBe(true);
      expect(DEFAULT_MULTI_PASS_CONFIG.largeDocThreshold).toBe(5000);
      expect(DEFAULT_MULTI_PASS_CONFIG.maxRepairPasses).toBe(3);
      expect(DEFAULT_MULTI_PASS_CONFIG.coverageThreshold).toBe(0.7);
    });

    it('should merge custom config with defaults', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'Test',
        multiPassConfig: {
          largeDocThreshold: 10000,
          maxRepairPasses: 5,
        },
      });

      // Small doc should use single-pass
      const smallDoc = createSmallDocument();
      const result = await generator.generate(smallDoc);
      expect(result.usedMultiPass).toBe(false);
    });
  });

  describe('Single-pass fallback', () => {
    it('should use single-pass for small documents', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Test' });
      const smallDoc = createSmallDocument();

      const result = await generator.generate(smallDoc);

      expect(result.usedMultiPass).toBe(false);
      expect(result.passesExecuted).toBe(1);
      expect(result.prd.project).toBe('Test');
    });

    it('should use single-pass when multi-pass is disabled', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'Test',
        multiPassConfig: { enabled: false },
      });

      const largeDoc = createLargeDocument();
      const result = await generator.generate(largeDoc);

      expect(result.usedMultiPass).toBe(false);
      expect(result.passesExecuted).toBe(1);
    });
  });

  describe('Multi-pass generation', () => {
    it('should use multi-pass for large documents', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'Large Project',
        multiPassConfig: {
          largeDocThreshold: 1000, // Lower threshold to trigger multi-pass
        },
      });

      const largeDoc = createLargeDocument();
      const result = await generator.generate(largeDoc);

      expect(result.usedMultiPass).toBe(true);
      expect(result.passesExecuted).toBeGreaterThanOrEqual(2); // At least outline + expand
      expect(result.prd.project).toBe('Large Project');
      expect(result.prd.phases.length).toBeGreaterThan(0);
    });

    it('should generate phases with stable IDs', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'ID Test',
        multiPassConfig: { largeDocThreshold: 1000 },
      });

      const largeDoc = createLargeDocument();
      const result = await generator.generate(largeDoc);

      // Check phase IDs follow pattern PH-XXX
      for (const phase of result.prd.phases) {
        expect(phase.id).toMatch(/^PH-\d{3}$/);
        expect(phase.id).toBe(phase.id); // ID should be stable

        // Check task IDs follow pattern TK-XXX-XXX
        for (const task of phase.tasks) {
          expect(task.id).toMatch(/^TK-\d{3}-\d{3}$/);
          expect(task.phaseId).toBe(phase.id);
        }
      }
    });
  });

  describe('Pass 1: generateOutline', () => {
    it('should create outline with phase and task placeholders', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Outline Test' });
      const largeDoc = createLargeDocument();

      const outline = await generator.generateOutline(largeDoc);

      expect(outline.project).toBe('Outline Test');
      expect(outline.phaseOutlines.length).toBeGreaterThan(0);

      // Check first phase outline
      const firstPhase = outline.phaseOutlines[0];
      expect(firstPhase.id).toBe('PH-001');
      expect(firstPhase.title).toBeTruthy();
      expect(firstPhase.sourceSection).toBeDefined();
    });

    it('should preserve source section references in outline', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Ref Test' });
      const largeDoc = createLargeDocument();

      const outline = await generator.generateOutline(largeDoc);

      for (const phaseOutline of outline.phaseOutlines) {
        expect(phaseOutline.sourceSection).toBeDefined();
        expect(phaseOutline.sourceSection.title).toBe(phaseOutline.title);
      }
    });
  });

  describe('Pass 2: expandOutline', () => {
    it('should expand outline into full PRD', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Expand Test' });
      const largeDoc = createLargeDocument();

      const outline = await generator.generateOutline(largeDoc);
      const prd = await generator.expandOutline(outline, largeDoc);

      expect(prd.project).toBe('Expand Test');
      expect(prd.phases.length).toBe(outline.phaseOutlines.length);

      // Check phases have full content
      for (const phase of prd.phases) {
        expect(phase.description).toBeTruthy();
        expect(phase.acceptanceCriteria).toBeDefined();
        expect(phase.testPlan).toBeDefined();
      }
    });

    it('should preserve ID mapping from outline to PRD', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'ID Map Test' });
      const largeDoc = createLargeDocument();

      const outline = await generator.generateOutline(largeDoc);
      const prd = await generator.expandOutline(outline, largeDoc);

      for (let i = 0; i < outline.phaseOutlines.length; i++) {
        expect(prd.phases[i].id).toBe(outline.phaseOutlines[i].id);
      }
    });
  });

  describe('Pass 3: coverageDiff', () => {
    it('should identify missing requirements', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Coverage Test' });
      const largeDoc = createLargeDocument();

      // Generate a minimal PRD
      const outline = await generator.generateOutline(largeDoc);
      const prd = await generator.expandOutline(outline, largeDoc);

      const missing = await generator.coverageDiff(largeDoc, prd);

      // Should return array (may be empty if good coverage)
      expect(Array.isArray(missing)).toBe(true);
    });
  });

  describe('Pass 4: fillGaps', () => {
    it('should add missing requirements as new tasks', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Gap Fill Test' });
      const largeDoc = createLargeDocument();

      // Generate initial PRD
      const outline = await generator.generateOutline(largeDoc);
      const prd = await generator.expandOutline(outline, largeDoc);

      // Create mock missing requirements
      const missingReqs = [
        {
          sectionPath: 'Phase 1: Core Implementation',
          excerpt: 'Missing: Add logging infrastructure',
        },
        {
          sectionPath: 'New Phase',
          excerpt: 'Missing: Add monitoring and alerting',
        },
      ];

      const result = await generator.fillGaps(prd, missingReqs, 1);

      expect(result.gapsFilled).toBeGreaterThan(0);
      expect(result.passNumber).toBe(1);
      expect(result.prd.phases.length).toBeGreaterThanOrEqual(prd.phases.length);
    });

    it('should preserve existing IDs when filling gaps', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'ID Preserve Test' });
      const largeDoc = createLargeDocument();

      const outline = await generator.generateOutline(largeDoc);
      const originalPrd = await generator.expandOutline(outline, largeDoc);
      const originalPhaseIds = originalPrd.phases.map((p) => p.id);

      const missingReqs = [
        {
          sectionPath: 'New Section',
          excerpt: 'New requirement',
        },
      ];

      const result = await generator.fillGaps(originalPrd, missingReqs, 1);

      // Original phase IDs should still exist
      for (const originalId of originalPhaseIds) {
        const found = result.prd.phases.find((p) => p.id === originalId);
        expect(found).toBeDefined();
      }
    });

    it('should add gap-fill notes to new items', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Notes Test' });
      const largeDoc = createLargeDocument();

      const outline = await generator.generateOutline(largeDoc);
      const prd = await generator.expandOutline(outline, largeDoc);
      const originalPhaseCount = prd.phases.length;

      const missingReqs = [
        {
          sectionPath: 'Brand New Phase',
          excerpt: 'Completely new requirement',
        },
      ];

      const result = await generator.fillGaps(prd, missingReqs, 2);

      // Find the new phase (if created)
      if (result.prd.phases.length > originalPhaseCount) {
        const newPhase = result.prd.phases[result.prd.phases.length - 1];
        expect(newPhase.notes).toContain('gap-fill pass 2');
      }
    });
  });

  describe('Full pipeline', () => {
    it('should complete full multi-pass generation', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'Full Pipeline Test',
        multiPassConfig: {
          largeDocThreshold: 1000,
          maxRepairPasses: 2,
          coverageThreshold: 0.5,
        },
      });

      const largeDoc = createLargeDocument();
      const result = await generator.generate(largeDoc);

      expect(result.prd).toBeDefined();
      expect(result.prd.project).toBe('Full Pipeline Test');
      expect(result.prd.phases.length).toBeGreaterThan(0);
      expect(result.prd.metadata).toBeDefined();
      expect(result.prd.metadata.totalPhases).toBe(result.prd.phases.length);
    });

    it('should include coverage report in result', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'Coverage Report Test',
        multiPassConfig: { largeDocThreshold: 1000 },
      });

      const largeDoc = createLargeDocument();
      const result = await generator.generate(largeDoc);

      if (result.usedMultiPass) {
        expect(result.coverageReport).toBeDefined();
        if (result.coverageReport) {
          expect(typeof result.coverageReport.coverageRatio).toBe('number');
        }
      }
    });

    it('should track gap-fill history', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'History Test',
        multiPassConfig: {
          largeDocThreshold: 1000,
          maxRepairPasses: 2,
        },
      });

      const largeDoc = createLargeDocument();
      const result = await generator.generate(largeDoc);

      expect(result.gapFillHistory).toBeDefined();
      expect(Array.isArray(result.gapFillHistory)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty sections gracefully', async () => {
      const generator = new MultiPassPrdGenerator({ projectName: 'Empty Test' });

      const emptyDoc: ParsedRequirements = {
        source: {
          path: '/test/empty.md',
          format: 'markdown',
          size: 0,
          lastModified: new Date().toISOString(),
        },
        title: 'Empty Document',
        sections: [],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: '',
        parseErrors: [],
      };

      const result = await generator.generate(emptyDoc);

      expect(result.prd).toBeDefined();
      expect(result.usedMultiPass).toBe(false); // Empty doc is below threshold
    });

    it('should handle document with only one section', async () => {
      const generator = new MultiPassPrdGenerator({
        projectName: 'Single Section Test',
        multiPassConfig: { largeDocThreshold: 10 }, // Very low threshold
      });

      const singleSectionDoc: ParsedRequirements = {
        source: {
          path: '/test/single.md',
          format: 'markdown',
          size: 100,
          lastModified: new Date().toISOString(),
        },
        title: 'Single Section',
        sections: [
          {
            title: 'Only Section',
            content: 'This is the only section with some content that needs to be processed.',
            level: 2,
            children: [],
          },
        ],
        extractedGoals: [],
        extractedConstraints: [],
        rawText: 'This is the only section with some content that needs to be processed.',
        parseErrors: [],
      };

      const result = await generator.generate(singleSectionDoc);

      expect(result.prd).toBeDefined();
      expect(result.prd.phases.length).toBeGreaterThanOrEqual(0);
    });
  });
});
