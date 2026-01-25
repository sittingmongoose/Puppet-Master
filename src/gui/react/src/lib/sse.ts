import { useEffect, useRef, useCallback, useState } from 'react';
import { useOrchestratorStore, useProjectStore, useBudgetStore } from '@/stores';
import type { StatusType, Platform } from '@/types';

/**
 * Known SSE event types from the server
 */
export const SSE_EVENT_TYPES = [
  // GUI-translated types
  'state_change',
  'output',
  'iteration_start',
  'iteration_complete',
  // EventBus passthrough types
  'tier_changed',
  'log',
  'agents_updated',
  'project_loaded',
  'progress',
  'commit',
  'budget_update',
  'gate_start',
  'gate_complete',
  'replan_complete',
  'item_reopened',
  'process_killed',
  'start_chain_step',
  'start_chain_complete',
  'requirements_interview_complete',
  'requirements_inventory_complete',
  'reviewer_verdict',
  // Parallel execution events
  'parallel_execution_started',
  'parallel_execution_completed',
  'parallel_subtask_completed',
  'parallel_subtask_error',
  'worktree_creating',
  'worktree_created',
  'worktree_destroyed',
  // Error
  'error',
] as const;

export type SSEEventType = typeof SSE_EVENT_TYPES[number];

/**
 * Connection status
 */
export interface SSEStatus {
  connected: boolean;
  attempt: number;
  delayMs: number;
}

/**
 * SSE event listener callback
 */
export type SSEEventHandler<T = unknown> = (data: T) => void;

const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

/**
 * SSE Client class - manages EventSource connection
 */
class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners = new Map<string, Set<SSEEventHandler>>();
  private statusListeners = new Set<(status: SSEStatus) => void>();
  private connected = false;
  private started = false;
  private reconnectAttempts = 0;
  private reconnectTimerId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Start the SSE connection
   */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.connect();
  }

  /**
   * Stop the SSE connection
   */
  stop(): void {
    this.started = false;
    this.connected = false;
    this.clearReconnectTimer();
    this.closeEventSource();
    this.notifyStatus();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Subscribe to an event type
   */
  on<T = unknown>(type: string, handler: SSEEventHandler<T>): void {
    const set = this.listeners.get(type) ?? new Set();
    set.add(handler as SSEEventHandler);
    this.listeners.set(type, set);
  }

  /**
   * Unsubscribe from an event type
   */
  off<T = unknown>(type: string, handler: SSEEventHandler<T>): void {
    const set = this.listeners.get(type);
    if (!set) return;
    set.delete(handler as SSEEventHandler);
    if (set.size === 0) {
      this.listeners.delete(type);
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatus(handler: (status: SSEStatus) => void): void {
    this.statusListeners.add(handler);
    // Emit current status immediately
    handler({ connected: this.connected, attempt: this.reconnectAttempts, delayMs: 0 });
  }

  /**
   * Unsubscribe from connection status changes
   */
  offStatus(handler: (status: SSEStatus) => void): void {
    this.statusListeners.delete(handler);
  }

  private connect(): void {
    if (!this.started) return;
    if (typeof EventSource === 'undefined') {
      console.warn('[SSE] EventSource not available');
      return;
    }

    this.clearReconnectTimer();
    this.closeEventSource();

    const es = new EventSource('/api/events/stream');
    this.eventSource = es;

    es.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.notifyStatus();
    };

    es.onerror = () => {
      this.scheduleReconnect();
    };

    // Default message handler
    es.onmessage = (evt) => {
      this.dispatch('message', evt?.data);
    };

    // Register handlers for known event types
    for (const type of SSE_EVENT_TYPES) {
      es.addEventListener(type, (evt) => {
        this.dispatch(type, (evt as MessageEvent)?.data);
      });
    }
  }

  private dispatch(type: string, data: string | undefined): void {
    const payload = this.safeJsonParse(data);

    // Type-specific listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners?.size) {
      for (const fn of typeListeners) {
        try {
          fn(payload);
        } catch (err) {
          console.error(`[SSE] listener error for ${type}:`, err);
        }
      }
    }

    // Wildcard listeners
    const anyListeners = this.listeners.get('*');
    if (anyListeners?.size) {
      for (const fn of anyListeners) {
        try {
          fn({ type, data: payload });
        } catch (err) {
          console.error('[SSE] wildcard listener error:', err);
        }
      }
    }
  }

  private safeJsonParse(text: string | undefined): unknown {
    if (typeof text !== 'string') return text;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private notifyStatus(): void {
    const delayMs = this.reconnectAttempts <= 0
      ? 0
      : Math.min(BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1), MAX_DELAY_MS);
    
    const payload: SSEStatus = {
      connected: this.connected,
      attempt: this.reconnectAttempts,
      delayMs,
    };

    for (const fn of this.statusListeners) {
      try {
        fn(payload);
      } catch (err) {
        console.error('[SSE] status listener error:', err);
      }
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimerId) {
      clearTimeout(this.reconnectTimerId);
      this.reconnectTimerId = null;
    }
  }

  private closeEventSource(): void {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {
        // ignore
      }
      this.eventSource = null;
    }
  }

  private scheduleReconnect(): void {
    if (!this.started) return;

    this.closeEventSource();
    this.connected = false;
    this.reconnectAttempts += 1;

    const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1), MAX_DELAY_MS);
    this.notifyStatus();

    this.clearReconnectTimer();
    this.reconnectTimerId = setTimeout(() => {
      this.connect();
    }, delayMs);
  }
}

// Singleton SSE client instance
export const sseClient = new SSEClient();

/**
 * Hook to get SSE connection status
 */
export function useSSEStatus(): SSEStatus {
  const [status, setStatus] = useState<SSEStatus>({
    connected: sseClient.isConnected(),
    attempt: 0,
    delayMs: 0,
  });

  useEffect(() => {
    const handler = (newStatus: SSEStatus) => {
      setStatus(newStatus);
    };

    sseClient.onStatus(handler);
    return () => sseClient.offStatus(handler);
  }, []);

  return status;
}

/**
 * Hook to subscribe to SSE events
 */
export function useSSEEvent<T = unknown>(
  type: SSEEventType | '*',
  handler: SSEEventHandler<T>,
  deps: unknown[] = []
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const callback = (data: T) => handlerRef.current(data);
    sseClient.on(type, callback);
    return () => sseClient.off(type, callback);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, ...deps]);
}

/**
 * Hook that integrates SSE events with Zustand stores
 * Call this at the app root to automatically sync SSE events to stores
 */
export function useSSEStoreIntegration(): void {
  const setStatus = useOrchestratorStore((s) => s.setStatus);
  const setCurrentItem = useOrchestratorStore((s) => s.setCurrentItem);
  const updateProgress = useOrchestratorStore((s) => s.updateProgress);
  const addOutput = useOrchestratorStore((s) => s.addOutput);
  const setError = useOrchestratorStore((s) => s.setError);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);
  const updatePlatformBudget = useBudgetStore((s) => s.updatePlatformBudget);

  // state_change -> orchestratorStore.status
  useSSEEvent<{ status: StatusType }>('state_change', useCallback((data) => {
    setStatus(data.status);
  }, [setStatus]));

  // output -> orchestratorStore.output
  useSSEEvent<{ type?: string; content: string; source?: string }>('output', useCallback((data) => {
    addOutput({
      timestamp: new Date(),
      type: (data.type as 'stdout' | 'stderr' | 'system') ?? 'stdout',
      content: data.content,
      source: data.source,
    });
  }, [addOutput]));

  // progress -> orchestratorStore.progress
  useSSEEvent<{ overall?: number; phase?: { current: number; total: number } }>('progress', useCallback((data) => {
    updateProgress(data);
  }, [updateProgress]));

  // iteration_start -> orchestratorStore.currentItem
  useSSEEvent<{ id: string; type: string; title: string }>('iteration_start', useCallback((data) => {
    setCurrentItem({
      id: data.id,
      type: data.type as 'phase' | 'task' | 'subtask' | 'iteration',
      title: data.title,
      status: 'running',
    });
  }, [setCurrentItem]));

  // iteration_complete -> orchestratorStore.currentItem.status
  useSSEEvent<{ id: string; status: StatusType }>('iteration_complete', useCallback((data) => {
    setCurrentItem({
      id: data.id,
      type: 'iteration',
      title: '',
      status: data.status,
    });
  }, [setCurrentItem]));

  // error -> orchestratorStore.error
  useSSEEvent<{ message: string }>('error', useCallback((data) => {
    setError(data.message);
  }, [setError]));

  // project_loaded -> projectStore.currentProject
  useSSEEvent<{ id: string; name: string; path: string }>('project_loaded', useCallback((data) => {
    setCurrentProject({
      id: data.id,
      name: data.name,
      path: data.path,
      lastAccessed: new Date(),
    });
  }, [setCurrentProject]));

  // budget_update -> budgetStore
  useSSEEvent<{ platform: Platform; used: number; limit: number; warning?: boolean; exceeded?: boolean }>('budget_update', useCallback((data) => {
    updatePlatformBudget(data.platform, {
      used: data.used,
      limit: data.limit,
      warning: data.warning,
      exceeded: data.exceeded,
    });
  }, [updatePlatformBudget]));

  // Start SSE connection on mount
  useEffect(() => {
    sseClient.start();
    return () => sseClient.stop();
  }, []);
}
