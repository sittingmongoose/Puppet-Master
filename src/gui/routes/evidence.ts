/**
 * Evidence API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for listing, previewing, and downloading evidence artifacts.
 * See BUILD_QUEUE_PHASE_9.md PH9-T09 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { promises as fs } from 'fs';
import { join, basename, resolve } from 'path';
import { EvidenceStore } from '../../memory/evidence-store.js';
import type { EvidenceType, StoredEvidence } from '../../types/evidence.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Evidence artifact response interface.
 */
interface EvidenceArtifact {
  name: string;
  type: EvidenceType;
  tierId: string;
  path: string;
  size: number;
  createdAt: string;
}

/**
 * Create evidence routes.
 * 
 * Returns Express Router with evidence management endpoints.
 */
export function createEvidenceRoutes(): Router {
  const router = createRouter();

  /**
   * GET /api/evidence
   * Lists evidence artifacts with optional filtering.
   * Query parameters:
   *   - type: Filter by evidence type (log, screenshot, trace, snapshot, metric, gate-report)
   *   - tierId: Filter by tier/item ID (e.g., PH-001, TK-001-001, ST-001-001-001)
   *   - dateFrom: ISO date string (filter by creation date from)
   *   - dateTo: ISO date string (filter by creation date to)
   */
  router.get('/evidence', async (req: Request, res: Response) => {
    try {
      const { type, tierId, dateFrom, dateTo } = req.query;

      // Initialize EvidenceStore
      const evidenceStore = new EvidenceStore();
      await evidenceStore.initialize();

      // Get all evidence
      let evidence = await evidenceStore.listAllEvidence();

      // Apply filters
      if (type && typeof type === 'string') {
        const filterType = type as EvidenceType;
        evidence = evidence.filter((e) => e.type === filterType);
      }

      if (tierId && typeof tierId === 'string') {
        const searchTierId = tierId.toUpperCase();
        evidence = evidence.filter((e) => 
          e.itemId.toUpperCase().includes(searchTierId) ||
          e.path.toUpperCase().includes(searchTierId)
        );
      }

      if (dateFrom && typeof dateFrom === 'string') {
        const fromDate = new Date(dateFrom);
        evidence = evidence.filter((e) => new Date(e.timestamp) >= fromDate);
      }

      if (dateTo && typeof dateTo === 'string') {
        const toDate = new Date(dateTo);
        evidence = evidence.filter((e) => new Date(e.timestamp) <= toDate);
      }

      // Get file stats and format response
      const artifactPromises = evidence.map(async (e: StoredEvidence): Promise<EvidenceArtifact | null> => {
        try {
          const stats = await fs.stat(e.path);
          const name = basename(e.path);
          
          return {
            name,
            type: e.type,
            tierId: e.itemId,
            path: e.path,
            size: stats.size,
            createdAt: stats.mtime.toISOString(),
          };
        } catch (error) {
          // If file doesn't exist, skip it
          return null;
        }
      });

      const artifactResults = await Promise.all(artifactPromises);
      
      // Filter out null entries (files that don't exist)
      const validArtifacts = artifactResults.filter((a): a is EvidenceArtifact => a !== null);

      res.json({ artifacts: validArtifacts });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to load evidence',
        code: 'LOAD_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/evidence/:type/:name
   * Serves a specific evidence file for preview or download.
   * Parameters:
   *   - type: Evidence type (maps to subdirectory)
   *   - name: Filename (URL-encoded)
   */
  router.get('/evidence/:type/:name', async (req: Request, res: Response) => {
    try {
      const { type, name } = req.params;

      // Validate type
      const validTypes: EvidenceType[] = ['log', 'screenshot', 'trace', 'snapshot', 'metric', 'gate-report'];
      if (!validTypes.includes(type as EvidenceType)) {
        res.status(400).json({
          error: `Invalid evidence type: ${type}`,
          code: 'INVALID_TYPE',
        } as ErrorResponse);
        return;
      }

      // Map type to subdirectory
      const subdirMap: Record<EvidenceType, string> = {
        'log': 'test-logs',
        'screenshot': 'screenshots',
        'trace': 'browser-traces',
        'snapshot': 'file-snapshots',
        'metric': 'metrics',
        'gate-report': 'gate-reports',
      };

      const subdir = subdirMap[type as EvidenceType];
      // Use default evidence directory path
      const baseDir = '.puppet-master/evidence';
      
      // P0-G18: Harden path validation to prevent traversal attacks
      // 1. Normalize the evidence directory path first
      const evidenceDir = resolve(baseDir);
      
      // 2. Decode and sanitize the filename - reject suspicious patterns
      let decodedName: string;
      try {
        decodedName = decodeURIComponent(name);
      } catch {
        res.status(400).json({
          error: 'Invalid filename encoding',
          code: 'INVALID_ENCODING',
        } as ErrorResponse);
        return;
      }
      
      // Reject null bytes and other dangerous characters
      if (decodedName.includes('\0') || /[\x00-\x1f]/.test(decodedName)) {
        res.status(400).json({
          error: 'Invalid characters in filename',
          code: 'INVALID_FILENAME',
        } as ErrorResponse);
        return;
      }
      
      // 3. Construct and normalize the file path
      const filePath = resolve(join(baseDir, subdir, decodedName));

      // 4. Security check: ensure normalized path is within evidence directory
      // Use path separator to prevent "evidencedir/../" type attacks
      if (!filePath.startsWith(evidenceDir + '/') && filePath !== evidenceDir) {
        res.status(403).json({
          error: 'Access denied: path outside evidence directory',
          code: 'PATH_TRAVERSAL',
        } as ErrorResponse);
        return;
      }
      
      // 5. Check for symlinks pointing outside evidence directory
      try {
        const realPath = await fs.realpath(filePath);
        const realEvidenceDir = await fs.realpath(evidenceDir);
        if (!realPath.startsWith(realEvidenceDir + '/') && realPath !== realEvidenceDir) {
          res.status(403).json({
            error: 'Access denied: symlink points outside evidence directory',
            code: 'SYMLINK_TRAVERSAL',
          } as ErrorResponse);
          return;
        }
      } catch (err) {
        // If realpath fails, file doesn't exist - let the next check handle it
        // This is fine because we'll verify access below
      }
      if (!filePath.startsWith(evidenceDir)) {
        res.status(403).json({
          error: 'Access denied: path outside evidence directory',
          code: 'PATH_TRAVERSAL',
        } as ErrorResponse);
        return;
      }

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        res.status(404).json({
          error: 'File not found',
          code: 'NOT_FOUND',
        } as ErrorResponse);
        return;
      }

      // Read file
      const fileBuffer = await fs.readFile(filePath);
      const ext = name.split('.').pop()?.toLowerCase() || '';

      // Determine content type and serve appropriately
      if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) {
        // Image files - serve inline
        const contentType = ext === 'png' ? 'image/png' : 
                           ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
                           ext === 'gif' ? 'image/gif' : 'image/webp';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${name}"`);
        res.send(fileBuffer);
      } else if (['log', 'txt'].includes(ext)) {
        // Text files - serve as plain text
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${name}"`);
        res.send(fileBuffer.toString('utf-8'));
      } else if (ext === 'json') {
        // JSON files - serve as JSON
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${name}"`);
        res.send(fileBuffer.toString('utf-8'));
      } else if (ext === 'snapshot') {
        // Snapshot files - serve as plain text
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `inline; filename="${name}"`);
        res.send(fileBuffer.toString('utf-8'));
      } else if (ext === 'zip') {
        // Binary files - force download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.send(fileBuffer);
      } else {
        // Unknown types - force download
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
        res.send(fileBuffer);
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to serve evidence file',
        code: 'SERVE_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
