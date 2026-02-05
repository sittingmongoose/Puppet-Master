/**
 * SQLite Event Ledger
 *
 * Append-only SQLite-backed ledger for orchestration events, enabling:
 * - Crash recovery (replay/snapshot restore)
 * - Audit trail
 * - State inspection via queries
 *
 * NOTE:
 * - Uses better-sqlite3 synchronous API for reliability and simplicity.
 * - Enables WAL mode for improved read/write concurrency (per Context7 docs).
 *
 * IMPORTANT:
 * - better-sqlite3 is a native addon. In packaged apps (especially Windows), the
 *   .node binary can be ABI-mismatched with the shipped Node runtime, causing a
 *   hard crash on import. To keep the app usable, we lazy-load it at runtime.
 */

import { createRequire } from 'node:module';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { dirname } from 'path';
import type { OrchestratorContext, OrchestratorState } from '../types/state.js';
import type { TierContext } from '../core/tier-state-machine.js';

type BetterSqliteStatement = {
  run(params: Record<string, unknown>): unknown;
  all(params?: Record<string, unknown>): unknown;
  get(params?: Record<string, unknown>): unknown;
};

type BetterSqliteDatabase = {
  prepare(sql: string): BetterSqliteStatement;
  exec(sql: string): void;
  pragma(sql: string, options?: { simple?: boolean }): unknown;
  close(): void;
};

type BetterSqliteDatabaseConstructor = new (path: string) => BetterSqliteDatabase;

const require = createRequire(import.meta.url);
let cachedDatabaseCtor: BetterSqliteDatabaseConstructor | null = null;

function loadBetterSqlite3(): BetterSqliteDatabaseConstructor {
  if (cachedDatabaseCtor) return cachedDatabaseCtor;

  // better-sqlite3 is CJS; require() returns the ctor function directly.
  const mod: unknown = require('better-sqlite3');
  const ctor =
    typeof mod === 'function'
      ? mod
      : (mod && typeof mod === 'object' && 'default' in mod ? (mod as { default: unknown }).default : null);

  if (typeof ctor !== 'function') {
    throw new Error('better-sqlite3 did not export a Database constructor');
  }

  cachedDatabaseCtor = ctor as BetterSqliteDatabaseConstructor;
  return cachedDatabaseCtor;
}
 
export type LedgerEventOrder = 'asc' | 'desc';
 
export interface LedgerEvent {
  id: string;
  timestamp: string;
  type: string;
  tierId?: string;
  sessionId?: string;
  data: Record<string, unknown>;
}
 
export interface EventFilter {
  type?: string;
  tierId?: string;
  sessionId?: string;
  fromTimestamp?: string;
  toTimestamp?: string;
  order?: LedgerEventOrder;
  limit?: number;
}
 
export interface LedgerSnapshot {
  orchestratorState: OrchestratorState;
  orchestratorContext: OrchestratorContext;
  tierStates: Record<string, TierContext>;
}
 
export interface LedgerRecoveryResult {
  snapshot: LedgerSnapshot;
  recoveredFrom: 'snapshot' | 'replay';
  recoveredAt: string;
  lastEventTimestamp: string;
}
 
type EventRow = {
  id: string;
  timestamp: string;
  type: string;
  tier_id: string | null;
  session_id: string | null;
  data: string;
};
 
export class EventLedger {
  private readonly db: BetterSqliteDatabase;
  private readonly insertStmt: BetterSqliteStatement;

  constructor(dbPath: string) {
    const Database = loadBetterSqlite3();
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
 
    // Enable WAL for performance / crash safety.
    // Context7: db.pragma('journal_mode = WAL')
    this.db.pragma('journal_mode = WAL');
 
    this.initSchema();
    this.insertStmt = this.db.prepare(
      `
      INSERT INTO events (id, timestamp, type, tier_id, session_id, data)
      VALUES (@id, @timestamp, @type, @tierId, @sessionId, @data)
      `
    );
  }
 
  close(): void {
    this.db.close();
  }
 
  /**
   * Returns the current SQLite journal mode, useful for tests/diagnostics.
   */
  getJournalMode(): string {
    // Context7: db.pragma('journal_mode', { simple: true })
    return String(this.db.pragma('journal_mode', { simple: true }));
  }
 
  /**
   * Append an event to the ledger (immutable insert).
   * @returns The assigned event ID
   */
  append(event: Omit<LedgerEvent, 'id'> & { id?: string }): string {
    const id = event.id ?? randomUUID();
    const timestamp = event.timestamp;
 
    if (!timestamp || typeof timestamp !== 'string') {
      throw new Error('EventLedger.append: timestamp is required');
    }
    if (!event.type || typeof event.type !== 'string') {
      throw new Error('EventLedger.append: type is required');
    }
 
    const dataJson = JSON.stringify(event.data ?? {});
 
    this.insertStmt.run({
      id,
      timestamp,
      type: event.type,
      tierId: event.tierId ?? null,
      sessionId: event.sessionId ?? null,
      data: dataJson,
    });
 
    return id;
  }
 
  /**
   * Query events using a simple filter API.
   */
  query(filter: EventFilter = {}): LedgerEvent[] {
    const where: string[] = [];
    const params: Record<string, unknown> = {};
 
    if (filter.type) {
      where.push('type = @type');
      params.type = filter.type;
    }
    if (filter.tierId) {
      where.push('tier_id = @tierId');
      params.tierId = filter.tierId;
    }
    if (filter.sessionId) {
      where.push('session_id = @sessionId');
      params.sessionId = filter.sessionId;
    }
    if (filter.fromTimestamp) {
      where.push('timestamp >= @fromTimestamp');
      params.fromTimestamp = filter.fromTimestamp;
    }
    if (filter.toTimestamp) {
      where.push('timestamp <= @toTimestamp');
      params.toTimestamp = filter.toTimestamp;
    }
 
    const order: LedgerEventOrder = filter.order ?? 'desc';
    const limit = filter.limit !== undefined ? Math.max(0, Math.trunc(filter.limit)) : undefined;
 
    let sql =
      'SELECT id, timestamp, type, tier_id, session_id, data FROM events' +
      (where.length > 0 ? ` WHERE ${where.join(' AND ')}` : '') +
      ` ORDER BY timestamp ${order.toUpperCase()}`;
 
    if (limit !== undefined) {
      sql += ' LIMIT @limit';
      params.limit = limit;
    }
 
    const rows = this.db.prepare(sql).all(params) as unknown as EventRow[];
    return rows.map((row) => this.rowToEvent(row));
  }
 
  getLastEvent(type?: string): LedgerEvent | null {
    const where = type ? 'WHERE type = @type' : '';
    const stmt = this.db.prepare(
      `SELECT id, timestamp, type, tier_id, session_id, data FROM events ${where} ORDER BY timestamp DESC LIMIT 1`
    );
    const row = (type ? stmt.get({ type }) : stmt.get()) as unknown as EventRow | undefined;
    return row ? this.rowToEvent(row) : null;
  }
 
  /**
   * Attempt to recover the latest orchestration state from the ledger.
   *
   * Recovery strategy:
   * 1) If a `snapshot` event exists, return the most recent snapshot.
   * 2) Otherwise, replay transition events (best-effort) to reconstruct tier states.
   */
  recover(): LedgerRecoveryResult | null {
    const snapshotEvent = this.getLastEvent('snapshot');
    if (snapshotEvent) {
      const snapshot = EventLedger.parseSnapshot(snapshotEvent);
      return {
        snapshot,
        recoveredFrom: 'snapshot',
        recoveredAt: new Date().toISOString(),
        lastEventTimestamp: snapshotEvent.timestamp,
      };
    }
 
    // Best-effort replay
    const events = this.query({ order: 'asc' });
    if (events.length === 0) {
      return null;
    }
 
    const tierStates: Record<string, TierContext> = {};
    let orchestratorState: OrchestratorState | null = null;
    let orchestratorContext: OrchestratorContext | null = null;
 
    for (const event of events) {
      if (event.type === 'orchestrator_state_changed') {
        const to = event.data.to;
        if (typeof to === 'string') {
          orchestratorState = to as OrchestratorState;
        }
        const ctx = event.data.context;
        if (ctx && typeof ctx === 'object') {
          orchestratorContext = ctx as OrchestratorContext;
        }
      }
 
      if (event.type === 'tier_state_changed' && event.tierId) {
        const to = event.data.to;
        const tierType = event.data.tierType;
        const maxIterations = event.data.maxIterations;
        if (typeof to === 'string' && typeof tierType === 'string') {
          tierStates[event.tierId] = {
            tierType: tierType as TierContext['tierType'],
            itemId: event.tierId,
            state: to as TierContext['state'],
            iterationCount:
              typeof event.data.iterationCount === 'number' ? event.data.iterationCount : 0,
            maxIterations: typeof maxIterations === 'number' ? maxIterations : 1,
            lastError: typeof event.data.lastError === 'string' ? event.data.lastError : undefined,
            gateResult:
              event.data.gateResult && typeof event.data.gateResult === 'object'
                ? (event.data.gateResult as TierContext['gateResult'])
                : undefined,
          };
        }
      }
    }
 
    // If we don't have orchestrator data, we can't build a valid snapshot.
    if (!orchestratorState || !orchestratorContext) {
      return null;
    }
 
    const last = events[events.length - 1]!;
    return {
      snapshot: {
        orchestratorState,
        orchestratorContext,
        tierStates,
      },
      recoveredFrom: 'replay',
      recoveredAt: new Date().toISOString(),
      lastEventTimestamp: last.timestamp,
    };
  }
 
  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        tier_id TEXT,
        session_id TEXT,
        data TEXT NOT NULL
      );
 
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_events_tier ON events(tier_id);
      CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    `);
  }
 
  private rowToEvent(row: EventRow): LedgerEvent {
    let parsed: unknown;
    try {
      parsed = JSON.parse(row.data);
    } catch (error) {
      throw new Error(
        `EventLedger: failed to parse event data JSON for ${row.id}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
 
    return {
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      ...(row.tier_id ? { tierId: row.tier_id } : {}),
      ...(row.session_id ? { sessionId: row.session_id } : {}),
      data: (parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}),
    };
  }
 
  private static parseSnapshot(event: LedgerEvent): LedgerSnapshot {
    const snapshot = event.data.snapshot;
    if (!snapshot || typeof snapshot !== 'object') {
      throw new Error('EventLedger.recover: snapshot event missing data.snapshot object');
    }
 
    const s = snapshot as Partial<LedgerSnapshot>;
    if (!s.orchestratorState || !s.orchestratorContext || !s.tierStates) {
      throw new Error('EventLedger.recover: invalid snapshot payload');
    }
 
    return {
      orchestratorState: s.orchestratorState,
      orchestratorContext: s.orchestratorContext,
      tierStates: s.tierStates,
    };
  }
}

