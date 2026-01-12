# RWM Puppet Master — BUILD_QUEUE_PHASE_7.md

> Phase 7: Logging & Observability  
> Tasks: 7  
> Focus: Activity logs, iteration logs, event streaming

---

## Phase Overview

This phase implements the logging and observability system:
- Logger service infrastructure
- Activity and error logging
- Iteration-specific logging
- Event bus for real-time updates
- Log streaming and retention

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | PH7-T01 | Phase 6 complete |
| Parallel Group A | PH7-T02, PH7-T03, PH7-T04 | PH7-T01 |
| Sequential | PH7-T05 | PH7-T02, PH7-T03, PH7-T04 |
| Sequential | PH7-T06 | PH7-T05 |
| Sequential | PH7-T07 | PH7-T06 |

---

## PH7-T01: Logger Service

### Title
Implement core logger service

### Goal
Create the foundational logging service with multiple transports.

### Depends on
- Phase 6 complete

### Parallelizable with
- none (foundational)

### Recommended model quality
Medium OK — logging infrastructure

### Read first
- STATE_FILES.md: Section 2 (logs directory)
- REQUIREMENTS.md: Section 19 (Logging requirements)

### Files to create/modify
- `src/logging/logger-service.ts`
- `src/logging/logger-service.test.ts`
- `src/logging/index.ts`

### Implementation notes
- Support multiple log levels
- Support file and console transports
- Include timestamps and context

### Acceptance criteria
- [ ] LoggerService class implemented
- [ ] Supports debug, info, warn, error levels
- [ ] Writes to file and console
- [ ] Includes timestamps
- [ ] Context can be added per log
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "LoggerService"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement logger service for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T01)
- Follow STATE_FILES.md for log file locations
- Follow REQUIREMENTS.md Section 19

Create src/logging/logger-service.ts:

1. LogLevel type:
   export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

2. LogEntry interface:
   - timestamp: string
   - level: LogLevel
   - message: string
   - context?: Record<string, unknown>
   - sessionId?: string

3. LogTransport interface:
   - write(entry: LogEntry): void | Promise<void>

4. ConsoleTransport class implements LogTransport:
   - Formats with colors
   - Shows timestamp and level

5. FileTransport class implements LogTransport:
   - constructor(filePath: string)
   - Appends to file as JSONL
   - Creates file if not exists

6. LoggerService class:
   - constructor(options: LoggerOptions)
   - private transports: LogTransport[]
   - private minLevel: LogLevel
   - addTransport(transport: LogTransport): void
   - setLevel(level: LogLevel): void
   - debug(message: string, context?: Record<string, unknown>): void
   - info(message: string, context?: Record<string, unknown>): void
   - warn(message: string, context?: Record<string, unknown>): void
   - error(message: string, context?: Record<string, unknown>): void
   - child(context: Record<string, unknown>): LoggerService

7. Create src/logging/logger-service.test.ts:
   - Test each log level
   - Test file transport
   - Test console transport
   - Test child logger context

8. Create src/logging/index.ts:
   export { LoggerService } from './logger-service.js';

After implementation, run:
- npm test -- -t "LoggerService"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH7-T02: Activity Logger

### Title
Implement activity logger for orchestrator events

### Goal
Create specialized logger for orchestrator activity.

### Depends on
- PH7-T01

### Parallelizable with
- PH7-T03, PH7-T04

### Recommended model quality
Fast OK — wrapper implementation

### Read first
- STATE_FILES.md: Section 2 (activity.log)

### Files to create/modify
- `src/logging/activity-logger.ts`
- `src/logging/activity-logger.test.ts`
- `src/logging/index.ts` (add export)

### Implementation notes
- Log orchestrator state changes
- Log tier transitions
- Include session context

### Acceptance criteria
- [ ] ActivityLogger class implemented
- [ ] `logStateChange(from, to, event)` works
- [ ] `logTierTransition(tier, from, to)` works
- [ ] `logPhaseStart/Complete(phase)` works
- [ ] Writes to .puppet-master/logs/activity.log
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "ActivityLogger"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement activity logger for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T02)
- Follow STATE_FILES.md for log location

Create src/logging/activity-logger.ts:

1. ActivityEvent interface:
   - timestamp: string
   - eventType: 'state_change' | 'tier_transition' | 'phase_start' | 'phase_complete' | 'task_start' | 'task_complete' | 'error'
   - sessionId: string
   - details: Record<string, unknown>

2. ActivityLogger class:
   - constructor(logPath: string, sessionId: string)
   - private logger: LoggerService
   - logStateChange(from: OrchestratorState, to: OrchestratorState, event: string): void
   - logTierTransition(tierId: string, from: TierState, to: TierState): void
   - logPhaseStart(phaseId: string, title: string): void
   - logPhaseComplete(phaseId: string, status: 'passed' | 'failed'): void
   - logTaskStart(taskId: string, title: string): void
   - logTaskComplete(taskId: string, status: 'passed' | 'failed'): void
   - logError(error: Error, context?: Record<string, unknown>): void
   - getRecentActivity(count: number): Promise<ActivityEvent[]>

3. Log file: .puppet-master/logs/activity.log
   Format: JSONL (one JSON object per line)

4. Create src/logging/activity-logger.test.ts:
   - Test logging state changes
   - Test logging tier transitions
   - Test reading recent activity
   - Use temp file

5. Update src/logging/index.ts

After implementation, run:
- npm test -- -t "ActivityLogger"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH7-T03: Error Logger

### Title
Implement error logger with stack traces

### Goal
Create specialized logger for errors with full context.

### Depends on
- PH7-T01

### Parallelizable with
- PH7-T02, PH7-T04

### Recommended model quality
Fast OK — error handling

### Read first
- STATE_FILES.md: Section 2 (error.log)

### Files to create/modify
- `src/logging/error-logger.ts`
- `src/logging/error-logger.test.ts`
- `src/logging/index.ts` (add export)

### Implementation notes
- Capture full stack traces
- Include execution context
- Support error categorization

### Acceptance criteria
- [ ] ErrorLogger class implemented
- [ ] `logError(error, context)` works
- [ ] Stack traces captured
- [ ] Error categories supported
- [ ] Writes to .puppet-master/logs/error.log
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "ErrorLogger"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement error logger for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T03)
- Follow STATE_FILES.md for log location

Create src/logging/error-logger.ts:

1. ErrorCategory type:
   export type ErrorCategory = 
     | 'platform_error'
     | 'validation_error'
     | 'config_error'
     | 'git_error'
     | 'io_error'
     | 'timeout_error'
     | 'unknown_error';

2. LoggedError interface:
   - timestamp: string
   - sessionId: string
   - category: ErrorCategory
   - message: string
   - stack?: string
   - context: Record<string, unknown>
   - tierId?: string
   - platform?: Platform

3. ErrorLogger class:
   - constructor(logPath: string, sessionId: string)
   - logError(error: Error, context?: Record<string, unknown>): void
   - logCategorizedError(category: ErrorCategory, error: Error, context?: Record<string, unknown>): void
   - getRecentErrors(count: number): Promise<LoggedError[]>
   - getErrorsByCategory(category: ErrorCategory): Promise<LoggedError[]>
   - categorizeError(error: Error): ErrorCategory

4. Auto-categorization:
   - ENOENT → io_error
   - ETIMEDOUT → timeout_error
   - ValidationError → validation_error
   - etc.

5. Create src/logging/error-logger.test.ts:
   - Test error logging
   - Test stack trace capture
   - Test categorization
   - Test retrieval

6. Update src/logging/index.ts

After implementation, run:
- npm test -- -t "ErrorLogger"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH7-T04: Iteration Logger

### Title
Implement iteration-specific logger

### Goal
Create logger for iteration execution details.

### Depends on
- PH7-T01

### Parallelizable with
- PH7-T02, PH7-T03

### Recommended model quality
Medium OK — structured logging

### Read first
- STATE_FILES.md: Section 2 (iterations directory)

### Files to create/modify
- `src/logging/iteration-logger.ts`
- `src/logging/iteration-logger.test.ts`
- `src/logging/index.ts` (add export)

### Implementation notes
- One log file per iteration
- Include prompt sent
- Include output received
- Include timing information

### Acceptance criteria
- [ ] IterationLogger class implemented
- [ ] Creates file per iteration
- [ ] Logs prompt sent
- [ ] Logs output received
- [ ] Logs timing
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "IterationLogger"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement iteration logger for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T04)
- Follow STATE_FILES.md for log location

Create src/logging/iteration-logger.ts:

1. IterationLog interface:
   - iterationId: string
   - subtaskId: string
   - sessionId: string
   - platform: Platform
   - startedAt: string
   - completedAt?: string
   - durationMs?: number
   - prompt: string
   - output?: string
   - exitCode?: number
   - completionSignal?: 'COMPLETE' | 'GUTTER' | null
   - filesChanged: string[]
   - testsRun: { command: string; passed: boolean }[]

2. IterationLogger class:
   - constructor(logsDir: string, sessionId: string)
   - startIteration(subtaskId: string, platform: Platform, prompt: string): string (returns iterationId)
   - logOutput(iterationId: string, output: string): void
   - completeIteration(iterationId: string, result: IterationResult): void
   - getIterationLog(iterationId: string): Promise<IterationLog | null>
   - getIterationsForSubtask(subtaskId: string): Promise<IterationLog[]>

3. File naming:
   .puppet-master/logs/iterations/{subtask-id}/{iteration-number}.json

4. Create src/logging/iteration-logger.test.ts:
   - Test starting iteration
   - Test logging output
   - Test completing iteration
   - Test retrieval

5. Update src/logging/index.ts

After implementation, run:
- npm test -- -t "IterationLogger"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH7-T05: Event Bus

### Title
Implement event bus for real-time updates

### Goal
Create event bus for broadcasting orchestrator events.

### Depends on
- PH7-T02, PH7-T03, PH7-T04

### Parallelizable with
- none

### Recommended model quality
Medium OK — pub/sub pattern

### Read first
- GUI_SPEC.md: Section 4 (WebSocket events)

### Files to create/modify
- `src/logging/event-bus.ts`
- `src/logging/event-bus.test.ts`
- `src/logging/index.ts` (add export)

### Implementation notes
- Pub/sub pattern
- Support typed events
- Support multiple subscribers

### Acceptance criteria
- [ ] EventBus class implemented
- [ ] `emit(event)` broadcasts to subscribers
- [ ] `subscribe(type, callback)` registers handlers
- [ ] `unsubscribe(id)` removes handlers
- [ ] Type-safe event handling
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "EventBus"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement event bus for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T05)
- Follow GUI_SPEC.md Section 4 for event types

Create src/logging/event-bus.ts:

1. PuppetMasterEvent type (discriminated union):
   export type PuppetMasterEvent =
     | { type: 'state_changed'; from: OrchestratorState; to: OrchestratorState }
     | { type: 'tier_changed'; tierId: string; from: TierState; to: TierState }
     | { type: 'iteration_started'; subtaskId: string; iterationNumber: number }
     | { type: 'iteration_completed'; subtaskId: string; passed: boolean }
     | { type: 'output_chunk'; subtaskId: string; chunk: string }
     | { type: 'error'; error: string; context?: Record<string, unknown> }
     | { type: 'log'; level: LogLevel; message: string };

2. EventSubscription interface:
   - id: string
   - eventType: PuppetMasterEvent['type'] | '*'
   - callback: (event: PuppetMasterEvent) => void

3. EventBus class:
   - private subscriptions: Map<string, EventSubscription>
   - emit(event: PuppetMasterEvent): void
   - subscribe(eventType: PuppetMasterEvent['type'] | '*', callback: (event: PuppetMasterEvent) => void): string
   - unsubscribe(subscriptionId: string): boolean
   - once(eventType: PuppetMasterEvent['type'], callback: (event: PuppetMasterEvent) => void): string
   - clear(): void
   - getSubscriptionCount(): number

4. Support wildcard '*' to receive all events

5. Create src/logging/event-bus.test.ts:
   - Test subscribing to specific event
   - Test wildcard subscription
   - Test unsubscribe
   - Test once
   - Test multiple subscribers

6. Update src/logging/index.ts

After implementation, run:
- npm test -- -t "EventBus"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH7-T06: Log Streaming

### Title
Implement log streaming for CLI --follow

### Goal
Create log streaming for real-time CLI output.

### Depends on
- PH7-T05

### Parallelizable with
- none

### Recommended model quality
Medium OK — streaming implementation

### Read first
- REQUIREMENTS.md: Section 18 (CLI --follow flag)

### Files to create/modify
- `src/logging/log-streamer.ts`
- `src/logging/log-streamer.test.ts`
- `src/logging/index.ts` (add export)

### Implementation notes
- Watch log files for changes
- Format for terminal output
- Support filtering by level

### Acceptance criteria
- [ ] LogStreamer class implemented
- [ ] `start()` begins watching files
- [ ] `stop()` ends watching
- [ ] Emits new log entries
- [ ] Supports level filtering
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "LogStreamer"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement log streaming for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T06)
- Follow REQUIREMENTS.md Section 18 for CLI integration

Create src/logging/log-streamer.ts:

1. StreamOptions interface:
   - logPath: string
   - minLevel?: LogLevel
   - format?: 'json' | 'pretty'

2. LogStreamer class:
   - constructor(options: StreamOptions)
   - private watcher: FSWatcher | null
   - private position: number
   - async start(): Promise<void>
   - stop(): void
   - onEntry(callback: (entry: LogEntry) => void): void
   - setMinLevel(level: LogLevel): void

3. Implementation:
   - Use fs.watch() to monitor file
   - Track read position
   - Parse new lines as JSONL
   - Filter by level
   - Emit to callbacks

4. Format 'pretty':
   [2026-01-10 14:30:00] INFO: Message here
   [2026-01-10 14:30:01] ERROR: Error message

5. Create src/logging/log-streamer.test.ts:
   - Test starting stream
   - Test receiving new entries
   - Test level filtering
   - Test stop
   - Use temp files

6. Update src/logging/index.ts

After implementation, run:
- npm test -- -t "LogStreamer"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## PH7-T07: Log Retention & Archiving

### Title
Implement log retention and archiving

### Goal
Create log cleanup and archiving based on retention policy.

### Depends on
- PH7-T06

### Parallelizable with
- none

### Recommended model quality
Fast OK — file management

### Read first
- STATE_FILES.md: Section 4 (Retention policies)

### Files to create/modify
- `src/logging/log-retention.ts`
- `src/logging/log-retention.test.ts`
- `src/logging/index.ts` (add export)

### Implementation notes
- Rotate logs when they exceed size
- Delete logs older than retention period
- Optionally archive old logs

### Acceptance criteria
- [ ] LogRetention class implemented
- [ ] `cleanup()` removes old logs
- [ ] `rotate(logPath)` rotates large files
- [ ] `archive(logPath)` compresses old logs
- [ ] Respects retention configuration
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "LogRetention"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement log retention for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH7-T07)
- Follow STATE_FILES.md Section 4

Create src/logging/log-retention.ts:

1. RetentionConfig interface:
   - maxAgeDays: number (default: 30)
   - maxSizeBytes: number (default: 10MB)
   - archiveOld: boolean (default: true)
   - archiveDir?: string

2. LogRetention class:
   - constructor(logsDir: string, config: RetentionConfig)
   - async cleanup(): Promise<CleanupResult>
   - async rotate(logPath: string): Promise<string | null> (returns new path)
   - async archive(logPath: string): Promise<string> (returns archive path)
   - async getLogStats(): Promise<LogStats>
   - shouldRotate(logPath: string): Promise<boolean>
   - isExpired(logPath: string): Promise<boolean>

3. CleanupResult interface:
   - deletedFiles: string[]
   - rotatedFiles: string[]
   - archivedFiles: string[]
   - freedBytes: number

4. Rotation naming:
   activity.log → activity.log.1, activity.log.2, etc.

5. Archive format:
   activity.log.1 → activity.log.1.gz (gzip)

6. Create src/logging/log-retention.test.ts:
   - Test cleanup removes old files
   - Test rotation
   - Test archiving
   - Use temp directory

7. Update src/logging/index.ts

After implementation, run:
- npm test -- -t "LogRetention"

Iterate until tests pass.

When complete, update this task's Status Log in this phase file with PASS/FAIL, commands run + results, files changed, and any notes.
```

### Task status log
```
Status: 
Date: 
Summary of changes: 
Files changed: 
Commands run + results: 
If FAIL - where stuck + exact error snippets + what remains:
```

---

## Phase 7 Completion Checklist

Before marking Phase 7 complete:

- [ ] All 7 tasks have PASS status
- [ ] Logger service supports all levels
- [ ] Activity logger captures state changes
- [ ] Error logger captures stack traces
- [ ] Iteration logger creates per-iteration files
- [ ] Event bus broadcasts to subscribers
- [ ] Log streaming supports --follow
- [ ] Log retention cleans up old files
- [ ] `npm test` passes all Phase 7 tests

### Phase 7 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-7 logging-observability complete"
```

---

*End of BUILD_QUEUE_PHASE_7.md*
