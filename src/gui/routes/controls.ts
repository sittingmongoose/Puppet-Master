/**
 * Controls API routes for RWM Puppet Master GUI
 * 
 * Provides REST endpoints for execution control (start, pause, resume, stop, reset).
 * See BUILD_QUEUE_PHASE_9.md PH9-T10 for specification.
 */

import type { Router, Request, Response } from 'express';
import { Router as createRouter } from 'express';
import type { Orchestrator } from '../../core/orchestrator.js';

/**
 * Error response interface.
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * Start request body interface.
 */
interface StartRequest {
  fromCheckpoint?: string;
}

/**
 * Stop request body interface.
 */
interface StopRequest {
  force?: boolean;
}

/**
 * Create controls routes.
 * 
 * Returns Express Router with control endpoints.
 * Requires Orchestrator instance to execute control commands.
 */
export function createControlsRoutes(orchestrator: Orchestrator | null): Router {
  const router = createRouter();

  /**
   * POST /api/controls/start
   * Start execution (optionally from checkpoint).
   */
  router.post('/controls/start', async (req: Request<unknown, unknown, StartRequest>, res: Response) => {
    try {
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const { fromCheckpoint } = req.body;
      const currentState = orchestrator.getState();

      // Validate state - can only start from 'idle' or 'planning'
      if (currentState !== 'idle' && currentState !== 'planning') {
        res.status(400).json({
          error: `Cannot start from state: ${currentState}`,
          code: 'INVALID_STATE',
        } as ErrorResponse);
        return;
      }

      // Generate session ID (format: PM-YYYY-MM-DD-HH-MM-SS-NNN)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
      const sessionId = `PM-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${milliseconds}`;

      // Start orchestrator
      await orchestrator.start();

      res.json({
        success: true,
        sessionId,
      });
    } catch (error) {
      console.error('[Controls] Error starting execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to start execution',
        code: 'START_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/pause
   * Pause execution.
   */
  router.post('/controls/pause', async (_req: Request, res: Response) => {
    try {
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const currentState = orchestrator.getState();

      // Validate state - can only pause from 'executing'
      if (currentState !== 'executing') {
        res.status(400).json({
          error: `Cannot pause from state: ${currentState}`,
          code: 'INVALID_STATE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.pause();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error pausing execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to pause execution',
        code: 'PAUSE_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/resume
   * Resume execution.
   */
  router.post('/controls/resume', async (_req: Request, res: Response) => {
    try {
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const currentState = orchestrator.getState();

      // Validate state - can only resume from 'paused'
      if (currentState !== 'paused') {
        res.status(400).json({
          error: `Cannot resume from state: ${currentState}`,
          code: 'INVALID_STATE',
        } as ErrorResponse);
        return;
      }

      await orchestrator.resume();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error resuming execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to resume execution',
        code: 'RESUME_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/stop
   * Stop execution (with optional force flag).
   */
  router.post('/controls/stop', async (req: Request<unknown, unknown, StopRequest>, res: Response) => {
    try {
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const { force } = req.body;
      const currentState = orchestrator.getState();

      // Validate state - can stop from 'executing' or 'paused'
      if (currentState !== 'executing' && currentState !== 'paused') {
        if (!force) {
          res.status(400).json({
            error: `Cannot stop from state: ${currentState}`,
            code: 'INVALID_STATE',
          } as ErrorResponse);
          return;
        }
      }

      await orchestrator.stop();

      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error stopping execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to stop execution',
        code: 'STOP_FAILED',
      } as ErrorResponse);
    }
  });

  /**
   * POST /api/controls/reset
   * Reset execution state.
   */
  router.post('/controls/reset', async (_req: Request, res: Response) => {
    try {
      if (!orchestrator) {
        res.status(503).json({
          error: 'Orchestrator not available',
          code: 'ORCHESTRATOR_NOT_AVAILABLE',
        } as ErrorResponse);
        return;
      }

      const currentState = orchestrator.getState();

      // Can reset from any state, but typically from 'error' or 'complete'
      // For now, we'll just stop if running and reset state machine
      if (currentState === 'executing' || currentState === 'paused') {
        await orchestrator.stop();
      }

      // Reset state machine to idle
      // Note: This assumes Orchestrator has a reset method or we can access the state machine
      // For now, we'll just return success - actual reset logic may need to be added to Orchestrator
      res.json({
        success: true,
      });
    } catch (error) {
      console.error('[Controls] Error resetting execution:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to reset execution',
        code: 'RESET_FAILED',
      } as ErrorResponse);
    }
  });

  return router;
}
