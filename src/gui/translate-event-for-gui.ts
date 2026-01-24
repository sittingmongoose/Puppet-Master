/**
 * Translate backend EventBus events into the GUI's expected event names and shapes.
 *
 * The browser code (dashboard/tiers/wizard) expects a `type` string that may differ
 * from the backend EventBus discriminant, and for Dashboard it expects a `payload`
 * envelope.
 *
 * We keep original root fields (when safe) to avoid breaking any existing consumers,
 * but we always provide `payload` for GUI handlers.
 */

import type { PuppetMasterEvent } from '../logging/index.js';

export function translateEventForGui(event: PuppetMasterEvent): Record<string, unknown> {
  switch (event.type) {
    case 'state_changed': {
      return {
        ...event,
        type: 'state_change',
        payload: {
          state: event.to,
          previousState: event.from,
        },
      };
    }

    case 'output_chunk': {
      return {
        ...event,
        type: 'output',
        payload: {
          subtaskId: event.subtaskId,
          line: event.chunk,
          type: 'stdout',
        },
      };
    }

    case 'iteration_started': {
      return {
        ...event,
        type: 'iteration_start',
        // Used by tiers view for highlighting.
        itemId: event.subtaskId,
        payload: {
          id: event.subtaskId,
          iteration: { current: event.iterationNumber },
        },
      };
    }

    case 'iteration_completed': {
      return {
        ...event,
        type: 'iteration_complete',
        itemId: event.subtaskId,
        payload: {
          id: event.subtaskId,
          passed: event.passed,
          status: event.passed ? 'complete' : 'failed',
        },
      };
    }

    case 'progress': {
      return {
        ...event,
        payload: {
          phases: { current: event.phasesComplete, total: event.phasesTotal },
          tasks: { current: event.tasksComplete, total: event.tasksTotal },
          subtasks: { current: event.subtasksComplete, total: event.subtasksTotal },
        },
      };
    }

    case 'commit': {
      return {
        ...event,
        payload: {
          sha: event.sha,
          message: event.message,
          files: event.files,
          timestamp: event.timestamp,
        },
      };
    }

    case 'gate_start': {
      return {
        ...event,
        payload: {
          token: event.verifierType,
          tierId: event.tierId,
          tierType: event.tierType,
          verifierType: event.verifierType,
          target: event.target,
        },
      };
    }

    case 'gate_complete': {
      return {
        ...event,
        payload: {
          // gate_complete events currently do not include verifierType/target.
          // Provide a stable token that won't collide with real verifier tokens.
          token: `gate:${event.tierId}`,
          tierId: event.tierId,
          tierType: event.tierType,
          passed: event.passed,
          evidence: event.evidence,
        },
      };
    }

    case 'budget_update': {
      return {
        ...event,
        payload: {
          [event.platform]: { current: event.used, limit: event.limit, cooldownUntil: event.cooldownUntil },
        },
      };
    }

    case 'error': {
      return {
        ...event,
        payload: {
          timestamp: new Date().toISOString(),
          severity: 'error',
          message: event.error,
          context: event.context,
        },
      };
    }

    case 'start_chain_step': {
      return {
        ...event,
        payload: {
          step: event.step,
          status: event.status,
          timestamp: event.timestamp,
        },
      };
    }

    case 'start_chain_complete': {
      return {
        ...event,
        payload: {
          projectPath: event.projectPath,
          artifacts: event.artifacts,
          timestamp: event.timestamp,
        },
      };
    }

    default: {
      return { ...event, payload: event };
    }
  }
}

