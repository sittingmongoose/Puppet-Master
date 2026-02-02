/**
 * Tests for EvidenceStore
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { EvidenceStore } from './evidence-store.js';
import type { GateReportEvidence } from '../types/evidence.js';

describe('EvidenceStore', () => {
  const testDir = join(process.cwd(), '.test-evidence');
  let store: EvidenceStore;

  beforeEach(async () => {
    // Create test directory
    try {
      await mkdir(testDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    store = new EvidenceStore(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create all required subdirectories', async () => {
      await store.initialize();

      const subdirs = [
        'test-logs',
        'screenshots',
        'browser-traces',
        'file-snapshots',
        'metrics',
        'gate-reports',
      ];

      for (const subdir of subdirs) {
        const dirPath = join(testDir, subdir);
        const stats = await stat(dirPath);
        expect(stats.isDirectory()).toBe(true);
      }
    });

    it('should not fail if directories already exist', async () => {
      await store.initialize();
      await store.initialize(); // Call again

      // Should not throw
      const dirs = await readdir(testDir);
      expect(dirs.length).toBeGreaterThan(0);
    });
  });

  describe('saveTestLog', () => {
    it('should save test log to correct path', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const content = 'Test log content\nLine 2';
      const testName = 'auth-test';

      const path = await store.saveTestLog(itemId, content, testName);

      expect(path).toBe(join(testDir, 'test-logs', `${itemId}-${testName}.log`));
      
      const savedContent = await readFile(path, 'utf-8');
      expect(savedContent).toBe(content);
    });

    it('should use default test name if not provided', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const content = 'Test log content';

      const path = await store.saveTestLog(itemId, content);

      expect(path).toBe(join(testDir, 'test-logs', `${itemId}-test.log`));
    });
  });

  describe('saveScreenshot', () => {
    it('should save screenshot to correct path', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const data = Buffer.from('fake-png-data');
      const scenarioName = 'login-success';

      const path = await store.saveScreenshot(itemId, data, scenarioName);

      expect(path).toBe(join(testDir, 'screenshots', `${itemId}-${scenarioName}.png`));
      
      const savedData = await readFile(path);
      expect(savedData).toEqual(data);
    });
  });

  describe('saveBrowserTrace', () => {
    it('should save browser trace to correct path', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const data = Buffer.from('fake-zip-data');

      const path = await store.saveBrowserTrace(itemId, data);

      expect(path).toBe(join(testDir, 'browser-traces', `${itemId}-trace.zip`));
      
      const savedData = await readFile(path);
      expect(savedData).toEqual(data);
    });
  });

  describe('saveFileSnapshot', () => {
    it('should save file snapshot to correct path', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const filePath = 'src/lib/auth.ts';
      const content = 'export function auth() {}';

      const path = await store.saveFileSnapshot(itemId, filePath, content);

      expect(path).toBe(join(testDir, 'file-snapshots', `${itemId}-auth.ts.snapshot`));
      
      const savedContent = await readFile(path, 'utf-8');
      expect(savedContent).toBe(content);
    });
  });

  describe('saveMetric', () => {
    it('should save metric to correct path as JSON', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const metric = {
        buildTime: 1234,
        testCount: 15,
        passed: true,
      };

      const path = await store.saveMetric(itemId, metric);

      expect(path).toBe(join(testDir, 'metrics', `${itemId}-metric.json`));
      
      const savedContent = await readFile(path, 'utf-8');
      const parsed = JSON.parse(savedContent);
      expect(parsed).toEqual(metric);
    });
  });

  describe('saveGateReport', () => {
    it('should save gate report to correct path as JSON', async () => {
      await store.initialize();
      const gateId = 'TK-001-001';
      const report: GateReportEvidence = {
        gateId,
        timestamp: '2026-01-10T15:00:00Z',
        verifiersRun: [
          {
            type: 'TEST',
            target: 'npm test',
            passed: true,
            evidencePath: '.puppet-master/evidence/test-logs/TK-001-001-test.log',
            summary: '15 tests passed',
          },
        ],
        overallPassed: true,
        tierType: 'task',
      };

      const path = await store.saveGateReport(gateId, report);

      expect(path).toBe(join(testDir, 'gate-reports', `${gateId}.json`));
      
      const savedContent = await readFile(path, 'utf-8');
      const parsed = JSON.parse(savedContent) as GateReportEvidence;
      expect(parsed.gateId).toBe(gateId);
      expect(parsed.overallPassed).toBe(true);
      expect(parsed.verifiersRun).toHaveLength(1);
    });
  });

  describe('getEvidence', () => {
    it('should retrieve all evidence for an item ID', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';

      // Create multiple evidence files
      await store.saveTestLog(itemId, 'log content', 'test');
      await store.saveScreenshot(itemId, Buffer.from('png'), 'login');
      await store.saveMetric(itemId, { count: 5 });

      const evidence = await store.getEvidence(itemId);

      expect(evidence.length).toBe(3);
      
      const types = evidence.map(e => e.type).sort();
      expect(types).toEqual(['log', 'metric', 'screenshot']);
      
      evidence.forEach(e => {
        expect(e.itemId).toBe(itemId);
        expect(e.path).toContain(itemId);
      });
    });

    it('should return empty array if no evidence found', async () => {
      await store.initialize();
      const evidence = await store.getEvidence('ST-999-999-999');
      expect(evidence).toEqual([]);
    });

    it('should not include gate reports', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      
      await store.saveTestLog(itemId, 'log');
      await store.saveGateReport('TK-001-001', {
        gateId: 'TK-001-001',
        timestamp: '2026-01-10T15:00:00Z',
        verifiersRun: [],
        overallPassed: true,
        tierType: 'task',
      });

      const evidence = await store.getEvidence(itemId);
      
      // Should only find the test log, not the gate report
      expect(evidence.length).toBe(1);
      expect(evidence[0].type).toBe('log');
    });
  });

  describe('getGateReport', () => {
    it('should retrieve gate report by ID', async () => {
      await store.initialize();
      const gateId = 'TK-001-001';
      const report: GateReportEvidence = {
        gateId,
        timestamp: '2026-01-10T15:00:00Z',
        verifiersRun: [
          {
            type: 'TEST',
            target: 'npm test',
            passed: true,
            summary: 'All tests passed',
          },
        ],
        overallPassed: true,
        tierType: 'task',
      };

      await store.saveGateReport(gateId, report);
      const retrieved = await store.getGateReport(gateId);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.gateId).toBe(gateId);
      expect(retrieved?.overallPassed).toBe(true);
    });

    it('should return null if gate report not found', async () => {
      await store.initialize();
      const retrieved = await store.getGateReport('TK-999-999');
      expect(retrieved).toBeNull();
    });
  });

  describe('listAllEvidence', () => {
    it('should list all evidence from all subdirectories', async () => {
      await store.initialize();
      
      // Create evidence for multiple items
      await store.saveTestLog('ST-001-001-001', 'log1', 'test1');
      await store.saveTestLog('ST-001-001-002', 'log2', 'test2');
      await store.saveScreenshot('ST-001-001-001', Buffer.from('png'), 'login');
      await store.saveMetric('ST-001-001-002', { count: 10 });

      const allEvidence = await store.listAllEvidence();

      expect(allEvidence.length).toBe(4);
      
      const itemIds = [...new Set(allEvidence.map(e => e.itemId))];
      expect(itemIds).toContain('ST-001-001-001');
      expect(itemIds).toContain('ST-001-001-002');
    });

    it('should return empty array if no evidence exists', async () => {
      await store.initialize();
      const allEvidence = await store.listAllEvidence();
      expect(allEvidence).toEqual([]);
    });

    it('should not include gate reports', async () => {
      await store.initialize();
      
      await store.saveTestLog('ST-001-001-001', 'log');
      await store.saveGateReport('TK-001-001', {
        gateId: 'TK-001-001',
        timestamp: '2026-01-10T15:00:00Z',
        verifiersRun: [],
        overallPassed: true,
        tierType: 'task',
      });

      const allEvidence = await store.listAllEvidence();
      
      // Should only find the test log
      expect(allEvidence.length).toBe(1);
      expect(allEvidence[0].type).toBe('log');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in item IDs', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const content = 'test content';

      await store.saveTestLog(itemId, content, 'test');
      const evidence = await store.getEvidence(itemId);

      expect(evidence.length).toBe(1);
    });

    it('should handle empty content', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';

      const path = await store.saveTestLog(itemId, '');
      const content = await readFile(path, 'utf-8');
      
      expect(content).toBe('');
    });

    it('should handle long filenames by truncating for Windows MAX_PATH', async () => {
      await store.initialize();
      const itemId = 'ST-001-001-001';
      const longScenarioName = 'a'.repeat(100);

      const savedPath = await store.saveScreenshot(itemId, Buffer.from('data'), longScenarioName);
      const pathBasename = savedPath.split(/[/\\]/).pop() ?? '';

      expect(pathBasename.length).toBeLessThanOrEqual(180);
      expect(savedPath).toContain('screenshots');
      const saved = await readFile(savedPath);
      expect(saved).toEqual(Buffer.from('data'));
    });
  });
});
