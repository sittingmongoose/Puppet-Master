/**
 * History API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for querying execution session history.
 * See GUI_FUNCTIONAL_IMPLEMENTATION_PLAN.md MP-3 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import type { SessionTracker } from '../../core/session-tracker.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Create history routes.
 * 
 * Returns Express Router with history query endpoints.
 * SessionTracker is optional and can be null for initial implementation.
 */
export function createHistoryRoutes(sessionTracker: SessionTracker | null): Router {
  const router = createRouter();

  /**
   * GET /api/history
   * Returns list of execution sessions.
   * Query parameters:
   *   - limit: Maximum number of sessions to return (default: 50, max: 100)
   *   - offset: Number of sessions to skip (default: 0)
   */
  router.get('/history', async (req: Request, res: Response) => {
    try {
      if (!sessionTracker) {
        return res.status(503).json({
          error: 'SessionTracker not available',
          code: 'SESSION_TRACKER_NOT_AVAILABLE',
        } as ErrorResponse);
      }

      const limit = validateLimitParam(req.query.limit as string | undefined);
      const offset = validateOffsetParam(req.query.offset as string | undefined);

      // Read all sessions
      const allSessions = await sessionTracker.readSessions();

      // Sort by start time (newest first)
      const sortedSessions = allSessions.sort((a, b) => {
        const timeA = new Date(a.startTime).getTime();
        const timeB = new Date(b.startTime).getTime();
        return timeB - timeA; // Descending order (newest first)
      });

      // Apply pagination
      const paginatedSessions = sortedSessions.slice(offset, offset + limit);

      res.json({
        sessions: paginatedSessions,
        total: sortedSessions.length,
        limit,
        offset,
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'HISTORY_FETCH_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * GET /api/history/:sessionId
   * Returns detailed information for a specific session.
   */
  router.get('/history/:sessionId', async (req: Request, res: Response) => {
    try {
      if (!sessionTracker) {
        return res.status(503).json({
          error: 'SessionTracker not available',
          code: 'SESSION_TRACKER_NOT_AVAILABLE',
        } as ErrorResponse);
      }

      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({
          error: 'sessionId parameter required',
          code: 'SESSION_ID_REQUIRED',
        } as ErrorResponse);
      }

      const session = await sessionTracker.getSession(sessionId);

      if (!session) {
        return res.status(404).json({
          error: `Session not found: ${sessionId}`,
          code: 'SESSION_NOT_FOUND',
        } as ErrorResponse);
      }

      // TODO: Enrich with iteration logs if available
      // For now, just return the session
      res.json({
        session,
        iterations: [], // Placeholder for future enhancement
      });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({
        error: err.message || 'Internal server error',
        code: 'SESSION_FETCH_FAILED',
      } as ErrorResponse);
    }
  });

  return router;
}

/**
 * Validate and parse limit query parameter.
 */
function validateLimitParam(limitStr: string | undefined): number {
  if (!limitStr) {
    return 50; // Default
  }

  const limit = parseInt(limitStr, 10);
  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid limit parameter. Must be between 1 and 100.');
  }

  return limit;
}

/**
 * Validate and parse offset query parameter.
 */
function validateOffsetParam(offsetStr: string | undefined): number {
  if (!offsetStr) {
    return 0; // Default
  }

  const offset = parseInt(offsetStr, 10);
  if (isNaN(offset) || offset < 0) {
    throw new Error('Invalid offset parameter. Must be >= 0.');
  }

  return offset;
}
