/**
 * SessionTracker for RWM Puppet Master
 * 
 * Tracks execution sessions by listening to EventBus events.
 * Stores session records in .puppet-master/logs/sessions.jsonl
 * 
 * Tracks:
 * - Session start (idle → executing)
 * - Session end (executing → idle/complete/error)
 * - Session status and outcome
 */

import type { EventBus, PuppetMasterEvent } from '../logging/event-bus.js';
import type { OrchestratorState } from '../types/state.js';
import { appendFile, readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * Execution session record
 */
export interface ExecutionSession {
  sessionId: string;        // Generated: PM-YYYY-MM-DD-HH-MM-SS-NNN
  startTime: string;         // ISO timestamp
  endTime?: string;          // ISO timestamp (null if still running)
  status: 'running' | 'completed' | 'stopped' | 'failed';
  outcome?: 'success' | 'partial' | 'failed' | 'stopped';
  iterationsRun: number;
  projectPath: string;
  projectName?: string;
  phasesCompleted?: number;
  tasksCompleted?: number;
  subtasksCompleted?: number;
  processPids?: number[];    // PIDs of processes spawned in this session
}

/**
 * SessionTracker tracks execution sessions via EventBus events
 */
export class SessionTracker {
  private eventBus: EventBus;
  private sessionsFilePath: string;
  private currentSession: ExecutionSession | null = null;
  private subscriptionId: string | null = null;
  private iterationsRun: number = 0;
  private projectPath: string = '';
  private projectName: string = '';
  private static sequenceCounter: number = 0;
  private static lastSecond: number = 0;

  constructor(eventBus: EventBus, projectPath: string = process.cwd()) {
    this.eventBus = eventBus;
    this.projectPath = projectPath;
    this.sessionsFilePath = join(projectPath, '.puppet-master', 'logs', 'sessions.jsonl');
  }

  /**
   * Start tracking sessions by subscribing to EventBus
   */
  start(): void {
    if (this.subscriptionId) {
      // Already started
      return;
    }

    this.subscriptionId = this.eventBus.subscribe('*', (event: PuppetMasterEvent) => {
      this.handleEvent(event);
    });
  }

  /**
   * Stop tracking sessions
   */
  stop(): void {
    if (this.subscriptionId) {
      this.eventBus.unsubscribe(this.subscriptionId);
      this.subscriptionId = null;
    }
  }

  /**
   * Add a process PID to the current session
   */
  addProcessPid(pid: number): void {
    if (this.currentSession) {
      if (!this.currentSession.processPids) {
        this.currentSession.processPids = [];
      }
      this.currentSession.processPids.push(pid);
    }
  }

  /**
   * Get the current active session
   */
  getCurrentSession(): ExecutionSession | null {
    return this.currentSession;
  }

  /**
   * Handle EventBus events to track sessions
   */
  private handleEvent(event: PuppetMasterEvent): void {
    if (event.type === 'state_changed') {
      this.handleStateChange(event.from, event.to);
    } else if (event.type === 'iteration_completed') {
      this.iterationsRun++;
    } else if (event.type === 'project_loaded') {
      this.projectPath = event.path;
      this.projectName = event.name;
    } else if (event.type === 'progress') {
      // Update progress stats if we have a current session
      if (this.currentSession) {
        this.currentSession.phasesCompleted = event.phasesComplete;
        this.currentSession.tasksCompleted = event.tasksComplete;
        this.currentSession.subtasksCompleted = event.subtasksComplete;
      }
    }
  }

  /**
   * Handle state changes to track session start/end
   */
  private handleStateChange(from: OrchestratorState, to: OrchestratorState): void {
    // Session start: idle/planning → executing
    if ((from === 'idle' || from === 'planning') && to === 'executing') {
      this.startSession();
    }
    // Session end: executing → idle/complete/error
    else if (from === 'executing' && (to === 'idle' || to === 'complete' || to === 'error')) {
      this.endSession(to);
    }
  }

  /**
   * Start a new execution session
   */
  private async startSession(): Promise<void> {
    // Generate session ID
    const sessionId = this.generateSessionId();
    const startTime = new Date().toISOString();

    this.currentSession = {
      sessionId,
      startTime,
      status: 'running',
      iterationsRun: 0,
      projectPath: this.projectPath,
      projectName: this.projectName,
    };

    this.iterationsRun = 0;

    // Write session start to file
    await this.writeSession(this.currentSession);
  }

  /**
   * End the current execution session
   */
  private async endSession(finalState: OrchestratorState): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    const endTime = new Date().toISOString();
    const status = finalState === 'complete' ? 'completed' : finalState === 'error' ? 'failed' : 'stopped';
    
    // Determine outcome based on final state and progress
    let outcome: 'success' | 'partial' | 'failed' | 'stopped' | undefined;
    if (status === 'completed') {
      outcome = 'success';
    } else if (status === 'failed') {
      outcome = 'failed';
    } else if (status === 'stopped') {
      outcome = 'stopped';
    } else {
      // Partial success if we made some progress
      outcome = this.iterationsRun > 0 ? 'partial' : 'failed';
    }

    this.currentSession.endTime = endTime;
    this.currentSession.status = status;
    this.currentSession.outcome = outcome;
    this.currentSession.iterationsRun = this.iterationsRun;

    // Update session in file (we'll append the updated version)
    await this.writeSession(this.currentSession);

    // Clear current session
    this.currentSession = null;
  }

  /**
   * Write session record to JSONL file
   */
  private async writeSession(session: ExecutionSession): Promise<void> {
    try {
      // Ensure directory exists
      const dir = dirname(this.sessionsFilePath);
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Append session as JSON line
      const line = JSON.stringify(session) + '\n';
      await appendFile(this.sessionsFilePath, line, 'utf-8');
    } catch (error) {
      // Log error but don't throw - session tracking is non-critical
      console.error('[SessionTracker] Failed to write session:', error);
    }
  }

  /**
   * Read all sessions from file
   */
  async readSessions(): Promise<ExecutionSession[]> {
    try {
      if (!existsSync(this.sessionsFilePath)) {
        return [];
      }

      const content = await readFile(this.sessionsFilePath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim().length > 0);
      
      return lines.map(line => {
        try {
          return JSON.parse(line) as ExecutionSession;
        } catch (error) {
          console.error('[SessionTracker] Failed to parse session line:', line, error);
          return null;
        }
      }).filter((session): session is ExecutionSession => session !== null);
    } catch (error) {
      console.error('[SessionTracker] Failed to read sessions:', error);
      return [];
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<ExecutionSession | null> {
    const sessions = await this.readSessions();
    return sessions.find(s => s.sessionId === sessionId) || null;
  }

  /**
   * Generate session ID in format PM-YYYY-MM-DD-HH-MM-SS-NNN
   * Tracks sequence number within same second
   */
  private generateSessionId(): string {
    const now = Date.now();
    const date = new Date(now);
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    const currentSecond = Math.floor(now / 1000);
    
    // Reset sequence if we're in a new second
    if (currentSecond !== SessionTracker.lastSecond) {
      SessionTracker.sequenceCounter = 0;
      SessionTracker.lastSecond = currentSecond;
    }
    
    // Increment sequence
    SessionTracker.sequenceCounter++;
    const sequence = String(SessionTracker.sequenceCounter).padStart(3, '0');
    
    return `PM-${year}-${month}-${day}-${hours}-${minutes}-${seconds}-${sequence}`;
  }
}
