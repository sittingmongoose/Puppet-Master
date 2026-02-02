/**
 * Ledger command - Query/replay SQLite event ledger
 *
 * Implements `puppet-master ledger`:
 * - `ledger query`  : filter and print ledger events
 * - `ledger replay` : replay events since a checkpoint (or timestamp)
 *
 * P2-T03: SQLite Event Ledger
 */

import { Command } from 'commander';
import { join } from 'path';
import { ConfigManager } from '../../config/config-manager.js';
import { CheckpointManager } from '../../core/checkpoint-manager.js';
import { EventLedger } from '../../state/event-ledger.js';
import type { EventFilter, LedgerEventOrder } from '../../state/event-ledger.js';
import { deriveProjectRootFromConfigPath, resolveUnderProjectRoot } from '../../utils/project-paths.js';
import { isValidSessionId } from '../../core/session-tracker.js';
import type { CommandModule } from './index.js';

export interface LedgerBaseOptions {
  config?: string;
  db?: string;
  json?: boolean;
}

export interface LedgerQueryOptions extends LedgerBaseOptions {
  type?: string;
  tier?: string;
  session?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  order?: LedgerEventOrder;
  limit?: number;
}

export interface LedgerReplayOptions extends LedgerBaseOptions {
  from?: string; // checkpoint id
  since?: string; // ISO timestamp
  type?: string;
  tier?: string;
  session?: string;
  limit?: number;
}

function resolveProjectRoot(configPath?: string): { projectRoot: string; resolvedConfigPath: string } {
  const configManager = new ConfigManager(configPath);
  const resolvedConfigPath = configManager.getConfigPath();
  const projectRoot = deriveProjectRootFromConfigPath(resolvedConfigPath);
  return { projectRoot, resolvedConfigPath };
}

function resolveLedgerPath(projectRoot: string, options: LedgerBaseOptions): string {
  if (options.db) {
    return resolveUnderProjectRoot(projectRoot, options.db);
  }
  return join(projectRoot, '.puppet-master', 'events.db');
}

function printEvents(events: ReturnType<EventLedger['query']>): void {
  for (const e of events) {
    const tier = e.tierId ? ` tier=${e.tierId}` : '';
    const session = e.sessionId ? ` session=${e.sessionId}` : '';
    console.log(`${e.timestamp} type=${e.type}${tier}${session} data=${JSON.stringify(e.data)}`);
  }
}

export async function ledgerQueryAction(options: LedgerQueryOptions): Promise<void> {
  const { projectRoot } = resolveProjectRoot(options.config);
  const dbPath = resolveLedgerPath(projectRoot, options);

  // Validate session ID format if provided
  if (options.session && !isValidSessionId(options.session)) {
    console.warn(`Warning: Session ID "${options.session}" does not match expected format PM-YYYY-MM-DD-HH-MM-SS-NNN`);
  }

  const ledger = new EventLedger(dbPath);
  try {
    const filter: EventFilter = {
      type: options.type,
      tierId: options.tier,
      sessionId: options.session,
      fromTimestamp: options.fromTimestamp,
      toTimestamp: options.toTimestamp,
      order: options.order,
      limit: options.limit,
    };

    const events = ledger.query(filter);
    if (options.json) {
      console.log(JSON.stringify({ dbPath, count: events.length, events }, null, 2));
    } else {
      console.log(`DB: ${dbPath}`);
      console.log(`Events: ${events.length}`);
      printEvents(events);
    }
  } finally {
    ledger.close();
  }
}

export async function ledgerReplayAction(options: LedgerReplayOptions): Promise<void> {
  const { projectRoot } = resolveProjectRoot(options.config);
  const dbPath = resolveLedgerPath(projectRoot, options);

  // Validate session ID format if provided
  if (options.session && !isValidSessionId(options.session)) {
    console.warn(`Warning: Session ID "${options.session}" does not match expected format PM-YYYY-MM-DD-HH-MM-SS-NNN`);
  }

  let fromTimestamp: string | undefined;

  if (options.from) {
    const checkpointDir = join(projectRoot, '.puppet-master', 'checkpoints');
    const checkpointManager = new CheckpointManager(checkpointDir);
    const checkpoint = await checkpointManager.loadCheckpoint(options.from);
    if (!checkpoint) {
      throw new Error(`Checkpoint not found: ${options.from}`);
    }
    fromTimestamp = checkpoint.timestamp;
  } else if (options.since) {
    fromTimestamp = options.since;
  }

  const ledger = new EventLedger(dbPath);
  try {
    const filter: EventFilter = {
      type: options.type,
      tierId: options.tier,
      sessionId: options.session,
      fromTimestamp,
      order: 'asc',
      limit: options.limit,
    };

    const events = ledger.query(filter);
    if (options.json) {
      console.log(
        JSON.stringify(
          { dbPath, fromTimestamp: fromTimestamp ?? null, count: events.length, events },
          null,
          2
        )
      );
    } else {
      console.log(`DB: ${dbPath}`);
      console.log(`From: ${fromTimestamp ?? '(beginning)'}`);
      console.log(`Events: ${events.length}`);
      printEvents(events);
    }
  } finally {
    ledger.close();
  }
}

export class LedgerCommand implements CommandModule {
  register(program: Command): void {
    const ledgerCmd = program.command('ledger').description('Query/replay the SQLite event ledger');

    ledgerCmd
      .command('query')
      .description('Query ledger events')
      .option('--config <path>', 'Path to configuration file')
      .option('--db <path>', 'Path to SQLite DB (absolute or relative to project root)')
      .option('--type <type>', 'Event type filter (e.g., iteration_complete)')
      .option('--tier <tierId>', 'Tier ID filter')
      .option('--session <sessionId>', 'Session ID filter')
      .option('--from-timestamp <iso>', 'Only events with timestamp >= this ISO value')
      .option('--to-timestamp <iso>', 'Only events with timestamp <= this ISO value')
      .option('--order <order>', 'asc|desc (default: desc)', 'desc')
      .option('--limit <n>', 'Limit number of events', (v) => parseInt(v, 10))
      .option('--json', 'Output as JSON')
      .action(async (opts: Record<string, unknown>) => {
        await ledgerQueryAction({
          config: opts.config as string | undefined,
          db: opts.db as string | undefined,
          json: Boolean(opts.json),
          type: opts.type as string | undefined,
          tier: opts.tier as string | undefined,
          session: opts.session as string | undefined,
          fromTimestamp: opts.fromTimestamp as string | undefined,
          toTimestamp: opts.toTimestamp as string | undefined,
          order: (opts.order as LedgerEventOrder) ?? 'desc',
          limit: typeof opts.limit === 'number' ? (opts.limit as number) : undefined,
        });
      });

    ledgerCmd
      .command('replay')
      .description('Replay ledger events since a checkpoint (or timestamp)')
      .option('--config <path>', 'Path to configuration file')
      .option('--db <path>', 'Path to SQLite DB (absolute or relative to project root)')
      .option('--from <checkpointId>', 'Checkpoint ID to replay from (uses checkpoint timestamp)')
      .option('--since <iso>', 'Replay from an ISO timestamp')
      .option('--type <type>', 'Event type filter')
      .option('--tier <tierId>', 'Tier ID filter')
      .option('--session <sessionId>', 'Session ID filter')
      .option('--limit <n>', 'Limit number of events', (v) => parseInt(v, 10))
      .option('--json', 'Output as JSON')
      .action(async (opts: Record<string, unknown>) => {
        await ledgerReplayAction({
          config: opts.config as string | undefined,
          db: opts.db as string | undefined,
          json: Boolean(opts.json),
          from: opts.from as string | undefined,
          since: opts.since as string | undefined,
          type: opts.type as string | undefined,
          tier: opts.tier as string | undefined,
          session: opts.session as string | undefined,
          limit: typeof opts.limit === 'number' ? (opts.limit as number) : undefined,
        });
      });
  }
}

export const ledgerCommand = new LedgerCommand();

