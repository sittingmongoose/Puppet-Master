/**
 * Shared SSE EventStream client for RWM Puppet Master GUI.
 *
 * - Connects to GET /api/events/stream via EventSource
 * - Auto-reconnects with exponential backoff (cap 30s)
 * - Allows pages to subscribe/unsubscribe to event types
 *
 * This is a classic script (not a module) so it can be loaded on all pages and
 * expose a single global EventStream instance.
 */

(function initEventStream(global) {
  const KNOWN_EVENT_TYPES = [
    // GUI-translated types
    'state_change',
    'output',
    'iteration_start',
    'iteration_complete',

    // EventBus passthrough types (and some GUI-translated types already match)
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

    // Error-ish
    'error',
  ];

  /**
   * Internal state
   */
  const listeners = new Map(); // type -> Set<fn>
  const statusListeners = new Set(); // fn({ connected, attempt, delayMs })

  let eventSource = null;
  let connected = false;
  let started = false;
  let reconnectTimerId = null;
  let reconnectAttempts = 0;

  const BASE_DELAY_MS = 1000;
  const MAX_DELAY_MS = 30000;

  function notifyStatus() {
    const delayMs =
      reconnectAttempts <= 0 ? 0 : Math.min(BASE_DELAY_MS * Math.pow(2, reconnectAttempts - 1), MAX_DELAY_MS);
    const payload = { connected, attempt: reconnectAttempts, delayMs };
    for (const fn of statusListeners) {
      try {
        fn(payload);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[EventStream] status listener error:', err);
      }
    }
  }

  function safeJsonParse(text) {
    if (typeof text !== 'string') {
      return text;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function dispatch(type, data) {
    const payload = safeJsonParse(data);

    const typeListeners = listeners.get(type);
    if (typeListeners && typeListeners.size > 0) {
      for (const fn of typeListeners) {
        try {
          fn(payload);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(`[EventStream] listener error for ${type}:`, err);
        }
      }
    }

    const anyListeners = listeners.get('*');
    if (anyListeners && anyListeners.size > 0) {
      for (const fn of anyListeners) {
        try {
          fn(payload);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('[EventStream] wildcard listener error:', err);
        }
      }
    }
  }

  function clearReconnectTimer() {
    if (reconnectTimerId) {
      clearTimeout(reconnectTimerId);
      reconnectTimerId = null;
    }
  }

  function closeEventSource() {
    if (eventSource) {
      try {
        eventSource.close();
      } catch {
        // ignore
      }
      eventSource = null;
    }
  }

  function scheduleReconnect() {
    if (!started) return;

    closeEventSource();
    connected = false;

    reconnectAttempts += 1;
    const delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, reconnectAttempts - 1), MAX_DELAY_MS);

    notifyStatus();
    clearReconnectTimer();
    reconnectTimerId = setTimeout(() => {
      connect();
    }, delayMs);
  }

  function connect() {
    if (!started) return;
    if (!('EventSource' in global)) {
      // eslint-disable-next-line no-console
      console.warn('[EventStream] EventSource not available in this browser');
      return;
    }

    clearReconnectTimer();
    closeEventSource();

    const es = new global.EventSource('/api/events/stream');
    eventSource = es;

    es.onopen = () => {
      connected = true;
      reconnectAttempts = 0;
      notifyStatus();
    };

    es.onerror = () => {
      scheduleReconnect();
    };

    // Fallback in case server ever sends default "message" events.
    es.onmessage = (evt) => {
      dispatch('message', evt && evt.data);
    };

    // Register handlers for known event types so pages can subscribe without having to
    // manage EventSource listeners themselves.
    for (const type of KNOWN_EVENT_TYPES) {
      es.addEventListener(type, (evt) => {
        dispatch(type, evt && evt.data);
      });
    }
  }

  const api = {
    start() {
      if (started) return;
      started = true;
      connect();
    },

    stop() {
      started = false;
      connected = false;
      clearReconnectTimer();
      closeEventSource();
      notifyStatus();
    },

    isConnected() {
      return connected;
    },

    on(type, handler) {
      if (typeof type !== 'string' || typeof handler !== 'function') return;
      const set = listeners.get(type) ?? new Set();
      set.add(handler);
      listeners.set(type, set);
    },

    off(type, handler) {
      const set = listeners.get(type);
      if (!set) return;
      set.delete(handler);
      if (set.size === 0) {
        listeners.delete(type);
      }
    },

    onStatus(handler) {
      if (typeof handler !== 'function') return;
      statusListeners.add(handler);
      // Emit current status immediately
      try {
        handler({ connected, attempt: reconnectAttempts, delayMs: 0 });
      } catch {
        // ignore
      }
    },

    offStatus(handler) {
      statusListeners.delete(handler);
    },
  };

  global.EventStream = api;

  // Auto-start so all pages get a live stream without per-page setup.
  api.start();
})(typeof globalThis !== 'undefined' ? globalThis : window);

