/**
 * EvidenceStore - Manages evidence artifacts
 * 
 * Stores and retrieves evidence artifacts (test logs, screenshots, browser traces,
 * file snapshots, metrics, gate reports) with organized directory structure.
 * 
 * See STATE_FILES.md Section 6 for directory structure and naming conventions.
 * Filenames are capped for Windows MAX_PATH (260) so zipped evidence extracts safely.
 */

import { promises as fs } from 'fs';
import { join, basename } from 'path';
import type {
  StoredEvidence,
  EvidenceType,
  GateReportEvidence,
} from '../types/evidence.js';

/** Max filename length (itemId + suffix) to keep full paths under Windows MAX_PATH when zipped. */
const MAX_EVIDENCE_FILENAME_LENGTH = 180;

/**
 * EvidenceStore class.
 * Manages evidence artifact storage and retrieval.
 */
export class EvidenceStore {
  private readonly baseDir: string;
  private readonly subdirs = [
    'test-logs',
    'screenshots',
    'browser-traces',
    'file-snapshots',
    'metrics',
    'gate-reports',
  ] as const;

  /**
   * Creates a new EvidenceStore instance.
   * @param baseDir - Base directory for evidence storage (default: '.puppet-master/evidence')
   */
  constructor(baseDir: string = '.puppet-master/evidence') {
    this.baseDir = baseDir;
  }

  /**
   * Initializes the evidence directory structure.
   * Creates all required subdirectories if they don't exist.
   */
  async initialize(): Promise<void> {
    await this.ensureDirectories();
  }

  /**
   * Saves a test log.
   * @param itemId - Item ID (e.g., 'ST-001-001-001')
   * @param content - Log content as string
   * @param testName - Optional test name (default: 'test')
   * @returns Path to the saved log file
   */
  async saveTestLog(
    itemId: string,
    content: string,
    testName: string = 'test'
  ): Promise<string> {
    const path = this.generatePath('log', itemId, `${testName}.log`);
    await this.ensureDirectories();
    await fs.writeFile(path, content, 'utf-8');
    return path;
  }

  /**
   * Saves a screenshot.
   * @param itemId - Item ID
   * @param data - Screenshot data as Buffer
   * @param scenarioName - Scenario name (e.g., 'login-success')
   * @returns Path to the saved screenshot
   */
  async saveScreenshot(
    itemId: string,
    data: Buffer,
    scenarioName: string
  ): Promise<string> {
    const path = this.generatePath('screenshot', itemId, `${scenarioName}.png`);
    await this.ensureDirectories();
    await fs.writeFile(path, data);
    return path;
  }

  /**
   * Saves a browser trace.
   * @param itemId - Item ID
   * @param data - Trace data as Buffer (typically ZIP format)
   * @returns Path to the saved trace file
   */
  async saveBrowserTrace(itemId: string, data: Buffer): Promise<string> {
    const path = this.generatePath('trace', itemId, 'trace.zip');
    await this.ensureDirectories();
    await fs.writeFile(path, data);
    return path;
  }

  /**
   * Saves a file snapshot.
   * @param itemId - Item ID
   * @param filePath - Original file path (used to derive basename)
   * @param content - File content as string
   * @returns Path to the saved snapshot
   */
  async saveFileSnapshot(
    itemId: string,
    filePath: string,
    content: string
  ): Promise<string> {
    const basename = this.getFileBasename(filePath);
    const path = this.generatePath('snapshot', itemId, `${basename}.snapshot`);
    await this.ensureDirectories();
    await fs.writeFile(path, content, 'utf-8');
    return path;
  }

  /**
   * Saves a metric.
   * @param itemId - Item ID
   * @param metric - Metric data as object
   * @returns Path to the saved metric file
   */
  async saveMetric(
    itemId: string,
    metric: Record<string, unknown>
  ): Promise<string> {
    const path = this.generatePath('metric', itemId, 'metric.json');
    await this.ensureDirectories();
    await fs.writeFile(path, JSON.stringify(metric, null, 2), 'utf-8');
    return path;
  }

  /**
   * Saves a gate report.
   * @param gateId - Gate ID (e.g., 'TK-001-001')
   * @param report - Gate report evidence
   * @returns Path to the saved gate report
   */
  async saveGateReport(
    gateId: string,
    report: GateReportEvidence
  ): Promise<string> {
    const path = join(this.baseDir, 'gate-reports', `${gateId}.json`);
    await this.ensureDirectories();
    await fs.writeFile(path, JSON.stringify(report, null, 2), 'utf-8');
    return path;
  }

  /**
   * Retrieves all evidence for a given item ID.
   * Searches all evidence subdirectories for files matching the item ID.
   * @param itemId - Item ID to search for
   * @returns Array of StoredEvidence objects
   */
  async getEvidence(itemId: string): Promise<StoredEvidence[]> {
    const evidence: StoredEvidence[] = [];

    for (const subdir of this.subdirs) {
      if (subdir === 'gate-reports') {
        // Gate reports use gateId, not itemId, so skip them
        continue;
      }

      const dirPath = join(this.baseDir, subdir);
      
      try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
          // Check if file name starts with itemId
          if (file.startsWith(itemId)) {
            const filePath = join(dirPath, file);
            const stats = await fs.stat(filePath);
            
            // Determine evidence type from subdirectory
            const type = this.getEvidenceTypeFromSubdir(subdir);
            
            evidence.push({
              type,
              path: filePath,
              summary: `Evidence file: ${file}`,
              timestamp: stats.mtime.toISOString(),
              itemId,
            });
          }
        }
      } catch (error) {
        // Directory might not exist, skip it
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    }

    return evidence;
  }

  /**
   * Retrieves a gate report by gate ID.
   * @param gateId - Gate ID
   * @returns Gate report evidence or null if not found
   */
  async getGateReport(gateId: string): Promise<GateReportEvidence | null> {
    const path = join(this.baseDir, 'gate-reports', `${gateId}.json`);
    
    try {
      const content = await fs.readFile(path, 'utf-8');
      return JSON.parse(content) as GateReportEvidence;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * Lists all evidence from all subdirectories.
   * @returns Array of all StoredEvidence objects
   */
  async listAllEvidence(): Promise<StoredEvidence[]> {
    const evidence: StoredEvidence[] = [];

    for (const subdir of this.subdirs) {
      if (subdir === 'gate-reports') {
        // Gate reports are handled separately
        continue;
      }

      const dirPath = join(this.baseDir, subdir);
      
      try {
        const files = await fs.readdir(dirPath);
        const type = this.getEvidenceTypeFromSubdir(subdir);
        
        for (const file of files) {
          const filePath = join(dirPath, file);
          const stats = await fs.stat(filePath);
          
          // Extract itemId from filename (everything before the last dash or first part)
          const itemId = this.extractItemIdFromFilename(file);
          
          evidence.push({
            type,
            path: filePath,
            summary: `Evidence file: ${file}`,
            timestamp: stats.mtime.toISOString(),
            itemId,
          });
        }
      } catch (error) {
        // Directory might not exist, skip it
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }
    }

    return evidence;
  }

  /**
   * Simple hash for truncated filenames (avoid collisions when capping length).
   */
  private static shortHash(s: string): string {
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(16).slice(0, 8);
  }

  /**
   * Generates a file path for evidence storage.
   * Filenames are capped at MAX_EVIDENCE_FILENAME_LENGTH so full paths stay under
   * Windows MAX_PATH when the project (or evidence dir) is zipped and extracted.
   *
   * @param type - Evidence type
   * @param itemId - Item ID
   * @param suffix - Optional suffix (filename part after itemId)
   * @returns Full file path
   */
  private generatePath(
    type: EvidenceType,
    itemId: string,
    suffix?: string
  ): string {
    const subdirMap: Record<EvidenceType, string> = {
      'log': 'test-logs',
      'screenshot': 'screenshots',
      'trace': 'browser-traces',
      'snapshot': 'file-snapshots',
      'metric': 'metrics',
      'gate-report': 'gate-reports',
    };

    const subdir = subdirMap[type];
    let filename = suffix ? `${itemId}-${suffix}` : itemId;
    if (filename.length > MAX_EVIDENCE_FILENAME_LENGTH) {
      const ext = filename.includes('.') ? filename.slice(filename.lastIndexOf('.')) : '';
      const base = filename.slice(0, filename.length - ext.length);
      const trim = MAX_EVIDENCE_FILENAME_LENGTH - ext.length - 9; // "-" + 8-char hash
      filename = trim > 0
        ? `${base.slice(0, trim)}-${EvidenceStore.shortHash(filename)}${ext}`
        : `${base.slice(0, MAX_EVIDENCE_FILENAME_LENGTH - 9)}-${EvidenceStore.shortHash(filename)}`;
    }
    return join(this.baseDir, subdir, filename);
  }

  /**
   * Ensures all required subdirectories exist.
   */
  private async ensureDirectories(): Promise<void> {
    // Ensure base directory exists
    await fs.mkdir(this.baseDir, { recursive: true });

    // Ensure all subdirectories exist
    for (const subdir of this.subdirs) {
      const dirPath = join(this.baseDir, subdir);
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Gets evidence type from subdirectory name.
   * @param subdir - Subdirectory name
   * @returns Evidence type
   */
  private getEvidenceTypeFromSubdir(subdir: string): EvidenceType {
    const map: Record<string, EvidenceType> = {
      'test-logs': 'log',
      'screenshots': 'screenshot',
      'browser-traces': 'trace',
      'file-snapshots': 'snapshot',
      'metrics': 'metric',
      'gate-reports': 'gate-report',
    };
    return map[subdir] || 'log';
  }

  /**
   * Extracts item ID from filename.
   * Assumes format: {itemId}-{suffix}
   * @param filename - Filename
   * @returns Item ID or filename if pattern doesn't match
   */
  private extractItemIdFromFilename(filename: string): string {
    // Try to extract item ID pattern (e.g., ST-001-001-001, TK-001-001, PH-001)
    const match = filename.match(/^([A-Z]{2}-\d{3}(?:-\d{3}){0,2})/);
    if (match) {
      return match[1];
    }
    // Fallback: use filename without extension
    return filename.replace(/\.[^.]+$/, '');
  }

  /**
   * Gets file basename from file path.
   * @param filePath - File path
   * @returns Basename
   */
  private getFileBasename(filePath: string): string {
    return basename(filePath);
  }
}
