/**
 * Ledger API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for querying and replaying the SQLite event ledger.
 * Feature parity with CLI `puppet-master ledger` command.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import { join } from 'path';
import { EventLedger } from '../../state/event-ledger.js';
import type { EventFilter, LedgerEventOrder } from '../../state/event-ledger.js';
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { isValidSessionId } from '../../core/session-tracker.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Create ledger routes.
 * 
 * Returns Express Router with ledger query endpoints.
 * @param baseDirectory - Base directory for project (default: process.cwd())
 */
export function createLedgerRoutes(baseDirectory?: string): Router {
  const router = createRouter();
  const projectRoot = baseDirectory || process.cwd();

  /**
   * GET /api/ledger
   * Query ledger events with optional filtering.
   * Query parameters:
   *   - type: Event type filter
   *   - tierId: Tier ID filter
   *   - sessionId: Session ID filter
   *   - fromTimestamp: ISO timestamp (events >= this)
   *   - toTimestamp: ISO timestamp (events <= this)
   *   - order: 'asc' or 'desc' (default: 'desc')
   *   - limit: Maximum number of events
   */
  router.get('/ledger', async (req: Request, res: Response) => {
    try {
      const {
        type,
        tierId,
        sessionId,
        fromTimestamp,
        toTimestamp,
        order,
        limit,
      } = req.query;

      // Validate session ID format if provided
      if (sessionId && typeof sessionId === 'string' && !isValidSessionId(sessionId)) {
        res.status(400).json({
          error: `Invalid sessionId: ${sessionId}`,
          code: 'INVALID_SESSION_ID',
        } as ErrorResponse);
        return;
      }

      const dbPath = join(projectRoot, '.puppet-master', 'events.db');
      const ledger = new EventLedger(dbPath);

      try {
        const filter: EventFilter = {
          type: type as string | undefined,
          tierId: tierId as string | undefined,
          sessionId: sessionId as string | undefined,
          fromTimestamp: fromTimestamp as string | undefined,
          toTimestamp: toTimestamp as string | undefined,
          order: (order as LedgerEventOrder) || 'desc',
          limit: limit ? parseInt(limit as string, 10) : undefined,
        };

        const events = ledger.query(filter);

        res.json({
          dbPath,
          count: events.length,
          events,
        });
      } finally {
        ledger.close();
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to query ledger',
        code: 'QUERY_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/ledger/replay
   * Replay ledger events from a checkpoint or timestamp.
   * Query parameters:
   *   - checkpointId: Checkpoint ID to replay from
   *   - since: ISO timestamp to replay from
   *   - type: Event type filter
   *   - tierId: Tier ID filter
   *   - sessionId: Session ID filter
   *   - limit: Maximum number of events
   */
  router.get('/ledger/replay', async (req: Request, res: Response) => {
    try {
      const {
        checkpointId,
        since,
        type,
        tierId,
        sessionId,
        limit,
      } = req.query;

      // Validate session ID format if provided
      if (sessionId && typeof sessionId === 'string' && !isValidSessionId(sessionId)) {
        res.status(400).json({
          error: `Invalid sessionId: ${sessionId}`,
          code: 'INVALID_SESSION_ID',
        } as ErrorResponse);
        return;
      }

      let fromTimestamp: string | undefined;

      // Resolve checkpoint to timestamp if provided
      if (checkpointId && typeof checkpointId === 'string') {
        const checkpointDir = join(projectRoot, '.puppet-master', 'checkpoints');
        const checkpointManager = new CheckpointManager(checkpointDir);
        const checkpoint = await checkpointManager.loadCheckpoint(checkpointId);
        
        if (!checkpoint) {
          res.status(404).json({
            error: `Checkpoint not found: ${checkpointId}`,
            code: 'CHECKPOINT_NOT_FOUND',
          } as ErrorResponse);
          return;
        }
        
        fromTimestamp = checkpoint.timestamp;
      } else if (since && typeof since === 'string') {
        fromTimestamp = since;
      }

      const dbPath = join(projectRoot, '.puppet-master', 'events.db');
      const ledger = new EventLedger(dbPath);

      try {
        const filter: EventFilter = {
          type: type as string | undefined,
          tierId: tierId as string | undefined,
          sessionId: sessionId as string | undefined,
          fromTimestamp,
          order: 'asc', // Replay in chronological order
          limit: limit ? parseInt(limit as string, 10) : undefined,
        };

        const events = ledger.query(filter);

        res.json({
          dbPath,
          fromTimestamp: fromTimestamp || null,
          count: events.length,
          events,
        });
      } finally {
        ledger.close();
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to replay ledger',
        code: 'REPLAY_ERROR',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/ledger/stats
   * Get ledger statistics (event counts by type, date range, etc.)
   */
  router.get('/ledger/stats', async (_req: Request, res: Response) => {
    try {
      const dbPath = join(projectRoot, '.puppet-master', 'events.db');
      const ledger = new EventLedger(dbPath);

      try {
        // Get all events to compute stats
        const allEvents = ledger.query({ limit: 10000 });

        // Compute statistics
        const eventsByType: Record<string, number> = {};
        const eventsBySession: Record<string, number> = {};
        let earliestTimestamp: string | null = null;
        let latestTimestamp: string | null = null;

        for (const event of allEvents) {
          // Count by type
          eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;

          // Count by session
          if (event.sessionId) {
            eventsBySession[event.sessionId] = (eventsBySession[event.sessionId] || 0) + 1;
          }

          // Track date range
          if (!earliestTimestamp || event.timestamp < earliestTimestamp) {
            earliestTimestamp = event.timestamp;
          }
          if (!latestTimestamp || event.timestamp > latestTimestamp) {
            latestTimestamp = event.timestamp;
          }
        }

        res.json({
          totalEvents: allEvents.length,
          eventsByType,
          sessionCount: Object.keys(eventsBySession).length,
          dateRange: {
            earliest: earliestTimestamp,
            latest: latestTimestamp,
          },
        });
      } finally {
        ledger.close();
      }
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Failed to get ledger stats',
        code: 'STATS_ERROR',
      } as ErrorResponse);
    }
  });

  return router;
}
