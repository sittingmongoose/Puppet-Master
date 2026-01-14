/**
 * Activity Logger for RWM Puppet Master
 * 
 * Specialized logger for orchestrator activity events including state changes,
 * tier transitions, and phase/task lifecycle events.
 */

import { appendFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { LoggerService } from './logger-service.js';
import type { OrchestratorState, TierState } from '../types/state.js';

/**
 * Activity event types
 */
export type ActivityEventType =
  | 'state_change'
  | 'tier_transition'
  | 'phase_start'
  | 'phase_complete'
  | 'task_start'
  | 'task_complete'
  | 'error';

/**
 * Activity event structure
 */
export interface ActivityEvent {
  timestamp: string;
  eventType: ActivityEventType;
  sessionId: string;
  details: Record<string, unknown>;
}

/**
 * Activity logger for orchestrator events
 */
export class ActivityLogger {
  private readonly logger: LoggerService;
  private readonly sessionId: string;
  private readonly logPath: string;
  private initialized = false;

  /**
   * Create a new ActivityLogger
   * @param logPath Path to the activity log file
   * @param sessionId Session ID for all log entries
   */
  constructor(logPath: string, sessionId: string) {
    this.logPath = logPath;
    this.sessionId = sessionId;
    
    // Create LoggerService for potential future use (console logging, etc.)
    // But we write ActivityEvent format directly to file
    this.logger = new LoggerService({
      sessionId,
      minLevel: 'info',
    });
  }

  /**
   * Ensure log directory exists
   */
  private async ensureLogDir(): Promise<void> {
    if (!this.initialized) {
      const dir = dirname(this.logPath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      this.initialized = true;
    }
  }

  /**
   * Write ActivityEvent to log file as JSONL
   */
  private async writeEvent(event: ActivityEvent): Promise<void> {
    await this.ensureLogDir();
    const line = JSON.stringify(event) + '\n';
    await appendFile(this.logPath, line, 'utf8');
  }

  /**
   * Log orchestrator state change
   */
  logStateChange(
    from: OrchestratorState,
    to: OrchestratorState,
    event: string
  ): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'state_change',
      sessionId: this.sessionId,
      details: {
        from,
        to,
        event,
      },
    };
    this.writeEvent(activityEvent).catch((error) => {
      console.error('[ActivityLogger] Failed to write state change:', error);
    });
  }

  /**
   * Log tier state transition
   */
  logTierTransition(
    tierId: string,
    from: TierState,
    to: TierState
  ): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'tier_transition',
      sessionId: this.sessionId,
      details: {
        tierId,
        from,
        to,
      },
    };
    this.writeEvent(activityEvent).catch((error) => {
      console.error('[ActivityLogger] Failed to write tier transition:', error);
    });
  }

  /**
   * Log phase start
   */
  logPhaseStart(phaseId: string, title: string): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'phase_start',
      sessionId: this.sessionId,
      details: {
        phaseId,
        title,
      },
    };
    this.writeEvent(activityEvent).catch((error) => {
      console.error('[ActivityLogger] Failed to write phase start:', error);
    });
  }

  /**
   * Log phase completion
   */
  logPhaseComplete(phaseId: string, status: 'passed' | 'failed'): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'phase_complete',
      sessionId: this.sessionId,
      details: {
        phaseId,
        status,
      },
    };
    this.writeEvent(activityEvent).catch((error) => {
      console.error('[ActivityLogger] Failed to write phase complete:', error);
    });
  }

  /**
   * Log task start
   */
  logTaskStart(taskId: string, title: string): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'task_start',
      sessionId: this.sessionId,
      details: {
        taskId,
        title,
      },
    };
    this.writeEvent(activityEvent).catch((error) => {
      console.error('[ActivityLogger] Failed to write task start:', error);
    });
  }

  /**
   * Log task completion
   */
  logTaskComplete(taskId: string, status: 'passed' | 'failed'): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'task_complete',
      sessionId: this.sessionId,
      details: {
        taskId,
        status,
      },
    };
    this.writeEvent(activityEvent).catch((error) => {
      console.error('[ActivityLogger] Failed to write task complete:', error);
    });
  }

  /**
   * Log error with context
   */
  logError(error: Error, context?: Record<string, unknown>): void {
    const activityEvent: ActivityEvent = {
      timestamp: new Date().toISOString(),
      eventType: 'error',
      sessionId: this.sessionId,
      details: {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...context,
      },
    };
    this.writeEvent(activityEvent).catch((writeError) => {
      console.error('[ActivityLogger] Failed to write error:', writeError);
    });
  }

  /**
   * Get recent activity entries from the log file
   * @param count Number of recent entries to retrieve
   * @returns Array of ActivityEvent objects (most recent first)
   */
  async getRecentActivity(count: number): Promise<ActivityEvent[]> {
    // Handle file not found gracefully
    if (!existsSync(this.logPath)) {
      return [];
    }

    try {
      // Read the entire file
      const content = await readFile(this.logPath, 'utf8');
      
      // Handle empty file
      if (!content.trim()) {
        return [];
      }

      // Parse JSONL (one JSON object per line)
      const lines = content.trim().split('\n');
      const events: ActivityEvent[] = [];

      // Parse lines from end to beginning (most recent first)
      for (let i = lines.length - 1; i >= 0 && events.length < count; i--) {
        const line = lines[i]?.trim();
        if (!line) continue;

        try {
          const activityEvent = JSON.parse(line) as ActivityEvent;
          
          // Validate ActivityEvent structure
          if (
            activityEvent.timestamp &&
            activityEvent.eventType &&
            activityEvent.sessionId &&
            activityEvent.details
          ) {
            events.push(activityEvent);
          }
        } catch (parseError) {
          // Skip malformed lines
          continue;
        }
      }

      return events;
    } catch (error) {
      // Handle read errors gracefully
      return [];
    }
  }
}
