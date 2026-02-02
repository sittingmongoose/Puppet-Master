/**
 * Traceability Integration Tests
 * 
 * Tests the traceability mapping between requirements and PRD items:
 * - SC-003: Traceability generation
 * - Bidirectional mapping (requirements → PRD, PRD → requirements)
 * - Uncovered requirements detection
 * - Deeply nested section handling
 * 
 * Integration path: SC-003
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TraceabilityManager, type TraceabilityMatrix } from '../../src/start-chain/traceability.js';
import type { ParsedRequirements, ParsedSection } from '../../src/types/requirements.js';
import type { PRD, Phase, Task, Subtask } from '../../src/types/prd.js';

describe('Traceability Integration Tests', () => {
  let manager: TraceabilityManager;

  beforeEach(() => {
    manager = new TraceabilityManager();
  });

  /**
   * Helper to create a parsed requirements document
   */
  function createParsedRequirements(sections: ParsedSection[]): ParsedRequirements {
    return {
      title: 'Requirements',
      sections,
      metadata: {
        sourceFile: 'requirements.md',
        parsedAt: new Date().toISOString(),
        totalSections: sections.length
      }
    };
  }

  /**
   * Helper to create a PRD with phases
   */
  function createPRD(phases: Phase[]): PRD {
    return {
      projectName: 'Test Project',
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      phases
    };
  }

  describe('SC-003: Full Traceability Pipeline', () => {
    it('builds complete traceability matrix from requirements and PRD', () => {
      const requirements = createParsedRequirements([
        {
          id: 'REQ-001',
          title: 'User Authentication',
          content: 'System must support user authentication',
          level: 1,
          path: 'Requirements > User Authentication',
          children: []
        },
        {
          id: 'REQ-002',
          title: 'Data Storage',
          content: 'System must persist data',
          level: 1,
          path: 'Requirements > Data Storage',
          children: []
        }
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Authentication Phase',
          description: 'Implement auth',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > User Authentication', excerpt: 'user authentication', excerptHash: 'abc123' }
          ],
          tasks: [
            {
              id: 'TK-001-001',
              title: 'Login Task',
              description: 'Implement login',
              status: 'pending',
              sourceRefs: [
                { sectionPath: 'Requirements > User Authentication', excerpt: 'authentication', excerptHash: 'def456' }
              ],
              subtasks: []
            }
          ]
        }
      ]);

      const matrix = manager.buildTraceabilityMatrix(requirements, prd);

      // Verify structure
      expect(matrix).toHaveProperty('requirementToPrdItems');
      expect(matrix).toHaveProperty('prdItemToRequirements');
      expect(matrix).toHaveProperty('excerptHashes');
      expect(matrix).toHaveProperty('timestamp');

      // Verify mapping: requirement → PRD items
      expect(matrix.requirementToPrdItems['Requirements > User Authentication']).toContain('PH-001');
      expect(matrix.requirementToPrdItems['Requirements > User Authentication']).toContain('TK-001-001');

      // Verify mapping: PRD item → requirements
      expect(matrix.prdItemToRequirements['PH-001']).toContain('Requirements > User Authentication');
      expect(matrix.prdItemToRequirements['TK-001-001']).toContain('Requirements > User Authentication');
    });

    it('traces requirement to all covering PRD items', () => {
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Main phase',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Section 4.2', excerpt: 'feature', excerptHash: 'h1' }
          ],
          tasks: [
            {
              id: 'TK-001-001',
              title: 'Task 1',
              description: 'Implement feature',
              status: 'pending',
              sourceRefs: [
                { sectionPath: 'Requirements > Section 4.2', excerpt: 'feature', excerptHash: 'h2' }
              ],
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  title: 'Subtask 1',
                  description: 'Detail work',
                  status: 'pending',
                  acceptanceCriteria: [],
                  sourceRefs: [
                    { sectionPath: 'Requirements > Section 4.2', excerpt: 'detail', excerptHash: 'h3' }
                  ]
                }
              ]
            }
          ]
        }
      ]);

      const items = manager.getPrdItemsForRequirement('Requirements > Section 4.2', prd);

      // All three levels should be returned
      expect(items).toHaveLength(3);
      expect(items.map(i => i.id)).toContain('PH-001');
      expect(items.map(i => i.id)).toContain('TK-001-001');
      expect(items.map(i => i.id)).toContain('ST-001-001-001');
    });

    it('detects uncovered requirements', () => {
      const requirements = createParsedRequirements([
        {
          id: 'REQ-001',
          title: 'Covered Feature',
          content: 'This is covered',
          level: 1,
          path: 'Requirements > Covered Feature',
          children: []
        },
        {
          id: 'REQ-002',
          title: 'Uncovered Feature',
          content: 'This is NOT covered',
          level: 1,
          path: 'Requirements > Uncovered Feature',
          children: []
        },
        {
          id: 'REQ-003',
          title: 'Another Uncovered',
          content: 'Also not covered',
          level: 1,
          path: 'Requirements > Another Uncovered',
          children: []
        }
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Only covers one requirement',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Covered Feature', excerpt: 'covered', excerptHash: 'h1' }
          ],
          tasks: []
        }
      ]);

      const uncovered = manager.getUncoveredRequirements(requirements, prd);

      // Two requirements should be uncovered
      expect(uncovered).toContain('Requirements > Uncovered Feature');
      expect(uncovered).toContain('Requirements > Another Uncovered');
      expect(uncovered).not.toContain('Requirements > Covered Feature');
    });

    it('handles deeply nested requirement sections', () => {
      const requirements = createParsedRequirements([
        {
          id: 'REQ-001',
          title: 'Section 4',
          content: 'Top level',
          level: 1,
          path: 'Requirements > Section 4',
          children: [
            {
              id: 'REQ-001-001',
              title: 'Section 4.2',
              content: 'Nested',
              level: 2,
              path: 'Requirements > Section 4 > Section 4.2',
              children: [
                {
                  id: 'REQ-001-001-001',
                  title: 'Section 4.2.1',
                  content: 'Deeply nested',
                  level: 3,
                  path: 'Requirements > Section 4 > Section 4.2 > Section 4.2.1',
                  children: []
                }
              ]
            }
          ]
        }
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Covers deep section',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Section 4 > Section 4.2 > Section 4.2.1', excerpt: 'deeply nested', excerptHash: 'deep' }
          ],
          tasks: []
        }
      ]);

      // Deep section should be covered
      const uncovered = manager.getUncoveredRequirements(requirements, prd);
      expect(uncovered).not.toContain('Requirements > Section 4 > Section 4.2 > Section 4.2.1');

      // Parent sections should be uncovered (they have no direct sourceRefs)
      expect(uncovered).toContain('Requirements > Section 4');
      expect(uncovered).toContain('Requirements > Section 4 > Section 4.2');
    });

    it('handles items with multiple sourceRefs', () => {
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Cross-functional Phase',
          description: 'Covers multiple requirements',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Auth', excerpt: 'auth', excerptHash: 'h1' },
            { sectionPath: 'Requirements > Storage', excerpt: 'storage', excerptHash: 'h2' },
            { sectionPath: 'Requirements > API', excerpt: 'api', excerptHash: 'h3' }
          ],
          tasks: []
        }
      ]);

      const matrix = manager.buildTraceabilityMatrix(
        createParsedRequirements([]),
        prd
      );

      // Phase should map to all three requirements
      expect(matrix.prdItemToRequirements['PH-001']).toHaveLength(3);
      expect(matrix.prdItemToRequirements['PH-001']).toContain('Requirements > Auth');
      expect(matrix.prdItemToRequirements['PH-001']).toContain('Requirements > Storage');
      expect(matrix.prdItemToRequirements['PH-001']).toContain('Requirements > API');

      // Each requirement should map back to the phase
      expect(matrix.requirementToPrdItems['Requirements > Auth']).toContain('PH-001');
      expect(matrix.requirementToPrdItems['Requirements > Storage']).toContain('PH-001');
      expect(matrix.requirementToPrdItems['Requirements > API']).toContain('PH-001');
    });

    it('tracks excerpt hashes for change detection', () => {
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Has hashes',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Feature A', excerpt: 'feature a', excerptHash: 'hash-a-123' },
            { sectionPath: 'Requirements > Feature B', excerpt: 'feature b', excerptHash: 'hash-b-456' }
          ],
          tasks: []
        }
      ]);

      const matrix = manager.buildTraceabilityMatrix(
        createParsedRequirements([]),
        prd
      );

      // Hashes should be recorded
      expect(matrix.excerptHashes['Requirements > Feature A']).toBe('hash-a-123');
      expect(matrix.excerptHashes['Requirements > Feature B']).toBe('hash-b-456');
    });
  });

  describe('Bidirectional Queries', () => {
    it('answers "Which PRD items cover Requirement X?"', () => {
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase 1',
          description: 'Covers auth',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Authentication', excerpt: 'auth', excerptHash: 'h1' }
          ],
          tasks: [
            {
              id: 'TK-001-001',
              title: 'Login',
              description: 'Login impl',
              status: 'pending',
              sourceRefs: [
                { sectionPath: 'Requirements > Authentication', excerpt: 'login', excerptHash: 'h2' }
              ],
              subtasks: []
            }
          ]
        },
        {
          id: 'PH-002',
          title: 'Phase 2',
          description: 'Storage',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Storage', excerpt: 'storage', excerptHash: 'h3' }
          ],
          tasks: []
        }
      ]);

      const authItems = manager.getPrdItemsForRequirement('Requirements > Authentication', prd);
      
      expect(authItems).toHaveLength(2);
      expect(authItems.map(i => i.id)).toEqual(['PH-001', 'TK-001-001']);
    });

    it('answers "Which requirements does PRD item X cover?"', () => {
      const prd = createPRD([
        {
          id: 'TK-001-001',
          title: 'Multi-requirement Task',
          description: 'Covers several',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Auth', excerpt: 'auth', excerptHash: 'h1' },
            { sectionPath: 'Requirements > Security', excerpt: 'security', excerptHash: 'h2' }
          ],
          tasks: []
        } as unknown as Phase // Type cast for test simplicity
      ]);

      const matrix = manager.buildTraceabilityMatrix(
        createParsedRequirements([]),
        prd
      );

      const requirements = matrix.prdItemToRequirements['TK-001-001'];
      expect(requirements).toContain('Requirements > Auth');
      expect(requirements).toContain('Requirements > Security');
    });

    it('answers "What percentage of requirements are covered?"', () => {
      const requirements = createParsedRequirements([
        { id: 'R1', title: 'Req 1', content: '', level: 1, path: 'Requirements > Req 1', children: [] },
        { id: 'R2', title: 'Req 2', content: '', level: 1, path: 'Requirements > Req 2', children: [] },
        { id: 'R3', title: 'Req 3', content: '', level: 1, path: 'Requirements > Req 3', children: [] },
        { id: 'R4', title: 'Req 4', content: '', level: 1, path: 'Requirements > Req 4', children: [] }
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase',
          description: 'Covers two',
          status: 'pending',
          sourceRefs: [
            { sectionPath: 'Requirements > Req 1', excerpt: '', excerptHash: 'h1' },
            { sectionPath: 'Requirements > Req 3', excerpt: '', excerptHash: 'h2' }
          ],
          tasks: []
        }
      ]);

      const uncovered = manager.getUncoveredRequirements(requirements, prd);
      const totalRequirements = 4;
      const coveredCount = totalRequirements - uncovered.length;
      const coveragePercent = (coveredCount / totalRequirements) * 100;

      expect(coveragePercent).toBe(50); // 2 of 4 covered
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles empty requirements', () => {
      const requirements = createParsedRequirements([]);
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase',
          description: 'No matching reqs',
          status: 'pending',
          tasks: []
        }
      ]);

      const uncovered = manager.getUncoveredRequirements(requirements, prd);
      expect(uncovered).toEqual([]);
    });

    it('handles empty PRD phases', () => {
      const requirements = createParsedRequirements([
        { id: 'R1', title: 'Req', content: '', level: 1, path: 'Requirements > Req', children: [] }
      ]);
      const prd = createPRD([]);

      const uncovered = manager.getUncoveredRequirements(requirements, prd);
      expect(uncovered).toContain('Requirements > Req');
    });

    it('handles null/undefined sourceRefs gracefully', () => {
      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Phase',
          description: 'No refs',
          status: 'pending',
          sourceRefs: undefined,
          tasks: [
            {
              id: 'TK-001-001',
              title: 'Task',
              description: 'Also no refs',
              status: 'pending',
              sourceRefs: null as any,
              subtasks: []
            }
          ]
        }
      ]);

      // Should not throw
      const matrix = manager.buildTraceabilityMatrix(
        createParsedRequirements([]),
        prd
      );

      expect(matrix.prdItemToRequirements['PH-001']).toBeUndefined();
      expect(matrix.prdItemToRequirements['TK-001-001']).toBeUndefined();
    });

    it('throws on invalid PRD', () => {
      expect(() => {
        manager.getPrdItemsForRequirement('test', null as any);
      }).toThrow('Invalid PRD');

      expect(() => {
        manager.getPrdItemsForRequirement('test', {} as any);
      }).toThrow('Invalid PRD');
    });

    it('throws on empty section path', () => {
      const prd = createPRD([]);
      
      expect(() => {
        manager.getPrdItemsForRequirement('', prd);
      }).toThrow('sectionPath cannot be empty');

      expect(() => {
        manager.getPrdItemsForRequirement('   ', prd);
      }).toThrow('sectionPath cannot be empty');
    });

    it('throws on invalid parsed requirements', () => {
      const prd = createPRD([]);

      expect(() => {
        manager.getUncoveredRequirements(null as any, prd);
      }).toThrow('Invalid parsed requirements');

      expect(() => {
        manager.buildTraceabilityMatrix(null as any, prd);
      }).toThrow('Invalid parsed requirements');
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles typical project structure with phases, tasks, and subtasks', () => {
      const requirements = createParsedRequirements([
        {
          id: 'SEC-001',
          title: 'Security Requirements',
          content: 'Security section',
          level: 1,
          path: 'Requirements > Security',
          children: [
            {
              id: 'SEC-001-001',
              title: 'Authentication',
              content: 'Auth requirements',
              level: 2,
              path: 'Requirements > Security > Authentication',
              children: []
            },
            {
              id: 'SEC-001-002',
              title: 'Authorization',
              content: 'Authz requirements',
              level: 2,
              path: 'Requirements > Security > Authorization',
              children: []
            }
          ]
        },
        {
          id: 'PERF-001',
          title: 'Performance',
          content: 'Perf section',
          level: 1,
          path: 'Requirements > Performance',
          children: []
        }
      ]);

      const prd = createPRD([
        {
          id: 'PH-001',
          title: 'Security Phase',
          description: 'Implement security',
          status: 'in_progress',
          sourceRefs: [
            { sectionPath: 'Requirements > Security', excerpt: 'security', excerptHash: 'sec-h' }
          ],
          tasks: [
            {
              id: 'TK-001-001',
              title: 'Auth Task',
              description: 'Implement auth',
              status: 'complete',
              sourceRefs: [
                { sectionPath: 'Requirements > Security > Authentication', excerpt: 'auth', excerptHash: 'auth-h' }
              ],
              subtasks: [
                {
                  id: 'ST-001-001-001',
                  title: 'Login Subtask',
                  description: 'Login form',
                  status: 'complete',
                  acceptanceCriteria: [{ id: 'AC-001', description: 'Login works', type: 'manual' }],
                  sourceRefs: [
                    { sectionPath: 'Requirements > Security > Authentication', excerpt: 'login', excerptHash: 'login-h' }
                  ]
                }
              ]
            },
            {
              id: 'TK-001-002',
              title: 'Authz Task',
              description: 'Implement authz',
              status: 'pending',
              sourceRefs: [
                { sectionPath: 'Requirements > Security > Authorization', excerpt: 'authz', excerptHash: 'authz-h' }
              ],
              subtasks: []
            }
          ]
        }
      ]);

      const matrix = manager.buildTraceabilityMatrix(requirements, prd);
      const uncovered = manager.getUncoveredRequirements(requirements, prd);

      // Security requirements should be covered
      expect(matrix.requirementToPrdItems['Requirements > Security']).toContain('PH-001');
      expect(matrix.requirementToPrdItems['Requirements > Security > Authentication']).toContain('TK-001-001');
      expect(matrix.requirementToPrdItems['Requirements > Security > Authentication']).toContain('ST-001-001-001');
      expect(matrix.requirementToPrdItems['Requirements > Security > Authorization']).toContain('TK-001-002');

      // Performance should be uncovered
      expect(uncovered).toContain('Requirements > Performance');
    });
  });
});
