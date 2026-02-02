import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { rm } from 'fs/promises';
import { EventLedger } from './event-ledger.js';
import type { OrchestratorContext } from '../types/state.js';
import type { TierContext } from '../core/tier-state-machine.js';
 
describe('EventLedger', () => {
  let dbPath: string;
  let ledger: EventLedger;
 
  beforeEach(() => {
    dbPath = join(tmpdir(), `pm-ledger-${randomUUID()}.db`);
    ledger = new EventLedger(dbPath);
  });
 
  afterEach(async () => {
    try {
      ledger.close();
    } catch {
      // ignore
    }
 
    // WAL mode may create sidecar files; remove best-effort.
    await rm(dbPath, { force: true }).catch(() => undefined);
    await rm(`${dbPath}-wal`, { force: true }).catch(() => undefined);
    await rm(`${dbPath}-shm`, { force: true }).catch(() => undefined);
  });
 
  it('enables WAL mode', () => {
    expect(ledger.getJournalMode().toLowerCase()).toBe('wal');
  });
 
  it('appends and queries events', () => {
    const ts1 = new Date('2026-01-24T10:00:00.000Z').toISOString();
    const ts2 = new Date('2026-01-24T10:01:00.000Z').toISOString();
 
    ledger.append({
      timestamp: ts1,
      type: 'iteration_complete',
      tierId: 'ST-001',
      sessionId: 'PM-2026-01-24-10-00-00-001',
      data: { success: true, iterationNumber: 1 },
    });
 
    ledger.append({
      timestamp: ts2,
      type: 'gate_passed',
      tierId: 'ST-001',
      data: { passed: true },
    });
 
    const byType = ledger.query({ type: 'iteration_complete', order: 'asc' });
    expect(byType).toHaveLength(1);
    expect(byType[0]?.type).toBe('iteration_complete');
    expect(byType[0]?.tierId).toBe('ST-001');
    expect(byType[0]?.data).toEqual({ success: true, iterationNumber: 1 });
 
    const byTier = ledger.query({ tierId: 'ST-001', order: 'asc' });
    expect(byTier).toHaveLength(2);
    expect(byTier[0]?.type).toBe('iteration_complete');
    expect(byTier[1]?.type).toBe('gate_passed');
 
    const lastGate = ledger.getLastEvent('gate_passed');
    expect(lastGate?.type).toBe('gate_passed');
    expect(lastGate?.timestamp).toBe(ts2);
  });
 
  it('recovers from the most recent snapshot', () => {
    const ctx: OrchestratorContext = {
      state: 'paused',
      currentPhaseId: null,
      currentTaskId: null,
      currentSubtaskId: 'ST-001',
      currentIterationId: null,
      pauseReason: 'testing',
    };
 
    const tierCtx: TierContext = {
      tierType: 'subtask',
      itemId: 'ST-001',
      state: 'running',
      iterationCount: 2,
      maxIterations: 5,
      lastError: undefined,
      gateResult: undefined,
    };
 
    ledger.append({
      timestamp: new Date('2026-01-24T10:02:00.000Z').toISOString(),
      type: 'snapshot',
      data: {
        snapshot: {
          orchestratorState: 'paused',
          orchestratorContext: ctx,
          tierStates: { 'ST-001': tierCtx },
        },
      },
    });
 
    const recovered = ledger.recover();
    expect(recovered).not.toBeNull();
    expect(recovered?.recoveredFrom).toBe('snapshot');
    expect(recovered?.snapshot.orchestratorState).toBe('paused');
    expect(recovered?.snapshot.orchestratorContext.currentSubtaskId).toBe('ST-001');
    expect(recovered?.snapshot.tierStates['ST-001']?.state).toBe('running');
    expect(recovered?.lastEventTimestamp).toBe('2026-01-24T10:02:00.000Z');
  });
 
  it('replays basic state when no snapshot exists', () => {
    const ctx: OrchestratorContext = {
      state: 'planning',
      currentPhaseId: null,
      currentTaskId: null,
      currentSubtaskId: null,
      currentIterationId: null,
    };
 
    ledger.append({
      timestamp: new Date('2026-01-24T10:03:00.000Z').toISOString(),
      type: 'orchestrator_state_changed',
      data: { from: 'idle', to: 'planning', eventType: 'INIT', context: ctx },
    });
 
    ledger.append({
      timestamp: new Date('2026-01-24T10:04:00.000Z').toISOString(),
      type: 'tier_state_changed',
      tierId: 'ST-002',
      data: {
        tierType: 'subtask',
        from: 'pending',
        to: 'planning',
        eventType: 'TIER_SELECTED',
        iterationCount: 0,
        maxIterations: 3,
      },
    });
 
    const recovered = ledger.recover();
    expect(recovered).not.toBeNull();
    expect(recovered?.recoveredFrom).toBe('replay');
    expect(recovered?.snapshot.orchestratorState).toBe('planning');
    expect(recovered?.snapshot.orchestratorContext.state).toBe('planning');
    expect(recovered?.snapshot.tierStates['ST-002']?.state).toBe('planning');
  });
});

