/**
 * Event Bus for RWM Puppet Master
 * 
 * Provides pub/sub pattern for broadcasting orchestrator events.
 * Supports typed events, multiple subscribers, and wildcard subscriptions.
 */

import type { OrchestratorState, TierState } from '../types/state.js';
import type { LogLevel } from './logger-service.js';

/**
 * PuppetMasterEvent discriminated union.
 * All events emitted by the orchestrator.
 */
export type PuppetMasterEvent =
  | { type: 'state_changed'; from: OrchestratorState; to: OrchestratorState }
  | { type: 'tier_changed'; tierId: string; from: TierState; to: TierState }
  | { type: 'iteration_started'; subtaskId: string; iterationNumber: number }
  | { type: 'iteration_completed'; subtaskId: string; passed: boolean }
  | { type: 'output_chunk'; subtaskId: string; chunk: string }
  | { type: 'error'; error: string; context?: Record<string, unknown> }
  | { type: 'log'; level: LogLevel; message: string }
  | { type: 'agents_updated'; updatedFiles: string[] }
  | { type: 'project_loaded'; name: string; path: string; phasesTotal: number; tasksTotal: number; subtasksTotal: number }
  | { type: 'progress'; phasesTotal: number; phasesComplete: number; tasksTotal: number; tasksComplete: number; subtasksTotal: number; subtasksComplete: number }
  | { type: 'commit'; sha: string; message: string; files: number; timestamp: string }
  | { type: 'budget_update'; platform: 'claude' | 'codex' | 'cursor' | 'gemini' | 'copilot' | 'antigravity'; used: number; limit: number; cooldownUntil?: string }
  | { type: 'gate_start'; tierId: string; tierType: 'task' | 'phase'; verifierType: string; target: string }
  | { type: 'gate_complete'; tierId: string; tierType: 'task' | 'phase'; passed: boolean; evidence?: string }
  | { type: 'replan_complete'; tierId: string; scope: 'phase' | 'task' | 'subtask'; timestamp: string }
  | { type: 'item_reopened'; tierId: string; reason: string; timestamp: string }
  | { type: 'process_killed'; pids: number[]; timestamp: string }
  | { type: 'start_chain_step'; step: string; status: 'started' | 'completed' | 'failed'; timestamp: string }
  | { type: 'start_chain_complete'; projectPath: string; artifacts: { prdPath: string; architecturePath: string; planPaths: string[] }; timestamp: string }
  | { type: 'requirements_interview_complete'; questionsCount: number; criticalCount: number; timestamp: string }
  | { type: 'reviewer_verdict'; subtaskId: string; verdict: 'SHIP' | 'REVISE'; confidence: number };

/**
 * Event subscription interface.
 * Tracks a subscription with its ID, event type filter, and callback.
 */
export interface EventSubscription {
  id: string;
  eventType: PuppetMasterEvent['type'] | '*';
  callback: (event: PuppetMasterEvent) => void;
  once?: boolean;
}

/**
 * EventBus class implementing pub/sub pattern.
 * 
 * Supports:
 * - Typed event emission
 * - Multiple subscribers per event type
 * - Wildcard subscriptions ('*') to receive all events
 * - One-time subscriptions
 */
export class EventBus {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private nextId: number = 0;

  /**
   * Emit an event to all matching subscribers.
   * Subscribers with exact type match or wildcard ('*') will receive the event.
   */
  emit(event: PuppetMasterEvent): void {
    const subscriptionsToCall: EventSubscription[] = [];
    
    // Collect all matching subscriptions
    for (const subscription of this.subscriptions.values()) {
      if (subscription.eventType === '*' || subscription.eventType === event.type) {
        subscriptionsToCall.push(subscription);
      }
    }

    // Call callbacks and handle once subscriptions
    for (const subscription of subscriptionsToCall) {
      try {
        subscription.callback(event);
      } catch (error) {
        // Log error but don't throw - continue with other subscribers
        console.error(`Error in event subscription ${subscription.id}:`, error);
      }

      // Auto-unsubscribe if this was a once subscription
      if (subscription.once) {
        this.subscriptions.delete(subscription.id);
      }
    }
  }

  /**
   * Subscribe to events of a specific type.
   * 
   * @param eventType - Event type to subscribe to, or '*' for all events
   * @param callback - Function to call when event is emitted
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribe(
    eventType: PuppetMasterEvent['type'] | '*',
    callback: (event: PuppetMasterEvent) => void
  ): string {
    const id = this.generateSubscriptionId();
    const subscription: EventSubscription = {
      id,
      eventType,
      callback,
    };
    this.subscriptions.set(id, subscription);
    return id;
  }

  /**
   * Unsubscribe from events using subscription ID.
   * 
   * @param subscriptionId - ID returned from subscribe() or once()
   * @returns true if subscription was found and removed, false otherwise
   */
  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  /**
   * Subscribe to a single event occurrence.
   * The subscription is automatically removed after the first event.
   * 
   * @param eventType - Event type to subscribe to (wildcard '*' not supported for once)
   * @param callback - Function to call when event is emitted
   * @returns Subscription ID that can be used to unsubscribe before event fires
   */
  once(
    eventType: PuppetMasterEvent['type'],
    callback: (event: PuppetMasterEvent) => void
  ): string {
    const id = this.generateSubscriptionId();
    const subscription: EventSubscription = {
      id,
      eventType,
      callback,
      once: true,
    };
    this.subscriptions.set(id, subscription);
    return id;
  }

  /**
   * Remove all subscriptions.
   */
  clear(): void {
    this.subscriptions.clear();
  }

  /**
   * Get the total number of active subscriptions.
   * 
   * @returns Number of active subscriptions
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Generate a unique subscription ID.
   * Format: timestamp-randomString
   */
  private generateSubscriptionId(): string {
    this.nextId += 1;
    return `${Date.now()}-${this.nextId}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
