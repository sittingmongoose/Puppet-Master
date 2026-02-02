/**
 * History command - View past execution sessions
 *
 * Implements `puppet-master history`:
 * - `history list` : list execution sessions
 * - `history show` : show details for a specific session
 *
 * Feature parity with GUI /api/history endpoints.
 */

import { Command } from 'commander';
import { SessionTracker } from '../../core/session-tracker.js';
import { EventBus } from '../../logging/index.js';
import type { CommandModule } from './index.js';

export interface HistoryListOptions {
  limit?: number;
  offset?: number;
  json?: boolean;
}

export interface HistoryShowOptions {
  json?: boolean;
}

/**
 * List execution sessions
 */
export async function historyListAction(options: HistoryListOptions): Promise<void> {
  try {
    // Create a minimal event bus for reading sessions
    const eventBus = new EventBus();
    const sessionTracker = new SessionTracker(eventBus);
    const allSessions = await sessionTracker.readSessions();

    // Sort by start time (newest first)
    const sortedSessions = allSessions.sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeB - timeA;
    });

    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    const paginatedSessions = sortedSessions.slice(offset, offset + limit);

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            sessions: paginatedSessions,
            total: sortedSessions.length,
            limit,
            offset,
          },
          null,
          2
        )
      );
      return;
    }

    if (paginatedSessions.length === 0) {
      console.log('No execution sessions found.');
      return;
    }

    console.log(`Execution Sessions (${offset + 1}-${offset + paginatedSessions.length} of ${sortedSessions.length}):\n`);
    console.log('Session ID                      Start Time              Status       Duration');
    console.log('-'.repeat(85));

    for (const session of paginatedSessions) {
      const startTime = new Date(session.startTime).toLocaleString();
      const status = session.status || 'unknown';
      let duration = '-';
      
      if (session.endTime) {
        const durationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
        duration = formatDuration(durationMs);
      }

      console.log(
        `${session.sessionId.padEnd(30)} ${startTime.padEnd(24)} ${status.padEnd(12)} ${duration}`
      );
    }

    if (sortedSessions.length > offset + limit) {
      console.log(`\nUse --offset ${offset + limit} to see more sessions.`);
    }
  } catch (error) {
    console.error('Error listing sessions:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Show details for a specific session
 */
export async function historyShowAction(
  sessionId: string,
  options: HistoryShowOptions
): Promise<void> {
  try {
    // Create a minimal event bus for reading sessions
    const eventBus = new EventBus();
    const sessionTracker = new SessionTracker(eventBus);
    const session = await sessionTracker.getSession(sessionId);

    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify({ session, iterations: [] }, null, 2));
      return;
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                    Session Details                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log();
    console.log(`Session ID:  ${session.sessionId}`);
    console.log(`Status:      ${session.status}`);
    console.log(`Start Time:  ${new Date(session.startTime).toLocaleString()}`);
    
    if (session.endTime) {
      console.log(`End Time:    ${new Date(session.endTime).toLocaleString()}`);
      const durationMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      console.log(`Duration:    ${formatDuration(durationMs)}`);
    }

    if (session.outcome) {
      console.log(`Outcome:     ${session.outcome}`);
    }

    console.log(`Project:     ${session.projectPath}`);
    if (session.projectName) {
      console.log(`Project Name: ${session.projectName}`);
    }

    // Show progress if available
    console.log();
    console.log('Progress:');
    console.log(`  Iterations Run: ${session.iterationsRun}`);
    if (session.phasesCompleted !== undefined) {
      console.log(`  Phases Completed: ${session.phasesCompleted}`);
    }
    if (session.tasksCompleted !== undefined) {
      console.log(`  Tasks Completed: ${session.tasksCompleted}`);
    }
    if (session.subtasksCompleted !== undefined) {
      console.log(`  Subtasks Completed: ${session.subtasksCompleted}`);
    }

    // Show process PIDs if available
    if (session.processPids && session.processPids.length > 0) {
      console.log();
      console.log('Process PIDs:', session.processPids.join(', '));
    }
  } catch (error) {
    console.error('Error showing session:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Format duration in human-readable format
 */
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export class HistoryCommand implements CommandModule {
  register(program: Command): void {
    const historyCmd = program
      .command('history')
      .description('View execution session history');

    historyCmd
      .command('list')
      .description('List execution sessions')
      .option('-l, --limit <n>', 'Maximum sessions to show', (v) => parseInt(v, 10), 20)
      .option('-o, --offset <n>', 'Offset for pagination', (v) => parseInt(v, 10), 0)
      .option('--json', 'Output as JSON')
      .action(async (opts) => {
        await historyListAction({
          limit: opts.limit,
          offset: opts.offset,
          json: opts.json,
        });
      });

    historyCmd
      .command('show <sessionId>')
      .description('Show details for a specific session')
      .option('--json', 'Output as JSON')
      .action(async (sessionId: string, opts) => {
        await historyShowAction(sessionId, { json: opts.json });
      });

    // Default to list if no subcommand
    historyCmd.action(async () => {
      await historyListAction({});
    });
  }
}

export const historyCommand = new HistoryCommand();
