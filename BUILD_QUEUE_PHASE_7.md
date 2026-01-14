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
- [x] LoggerService class implemented
- [x] Supports debug, info, warn, error levels
- [x] Writes to file and console
- [x] Includes timestamps
- [x] Context can be added per log
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-13
Summary of changes: 
Implemented LoggerService class for RWM Puppet Master (PH7-T01). Created foundational logging infrastructure with support for multiple log levels (debug, info, warn, error), multiple transports (ConsoleTransport and FileTransport), context support, and child logger functionality. ConsoleTransport formats logs with ANSI colors and timestamps. FileTransport writes JSONL format and creates directories as needed. LoggerService supports level filtering, dynamic transport addition, and child loggers with context inheritance. All functionality tested with comprehensive test suite covering all log levels, level filtering, file operations, console formatting, child logger context inheritance, multiple transports, session ID handling, and error handling. All 27 tests passing.

Files changed: 
- src/logging/logger-service.ts (created - LogLevel type, LogEntry interface, LogTransport interface, ConsoleTransport class, FileTransport class, LoggerService class)
- src/logging/logger-service.test.ts (created - comprehensive test suite with 27 tests)
- src/logging/index.ts (created - barrel export file with all exports)

Commands run + results: 
- npm test -- -t "LoggerService": PASSED (27 tests, all passing)
- npm run typecheck: PASSED (no TypeScript errors)

If FAIL - where stuck + exact error snippets + what remains:
N/A - All tests passing, implementation complete.
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
- [x] ActivityLogger class implemented
- [x] `logStateChange(from, to, event)` works
- [x] `logTierTransition(tier, from, to)` works
- [x] `logPhaseStart/Complete(phase)` works
- [x] Writes to .puppet-master/logs/activity.log
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-13
Summary of changes: 
Implemented ActivityLogger class for RWM Puppet Master (PH7-T02). Created specialized logger for orchestrator activity events that writes ActivityEvent format directly to JSONL log file. ActivityLogger wraps LoggerService internally and provides methods for logging state changes, tier transitions, phase/task lifecycle events, and errors. All methods write ActivityEvent objects with timestamp, eventType, sessionId, and details to .puppet-master/logs/activity.log in JSONL format. Implemented getRecentActivity method to read and parse recent entries from log file with graceful error handling for missing/empty files. All functionality tested with comprehensive test suite covering all event types, sequential writes, session ID inclusion, and edge cases (empty file, file not found, limited entries). All 16 tests passing.

Files changed: 
- src/logging/activity-logger.ts (created - ActivityEventType type, ActivityEvent interface, ActivityLogger class with all required methods)
- src/logging/activity-logger.test.ts (created - comprehensive test suite with 16 tests)
- src/logging/index.ts (updated - added exports for ActivityLogger, ActivityEvent, and ActivityEventType)

Commands run + results: 
- npm test -- -t "ActivityLogger": PASSED (16 tests, all passing)
- npm run typecheck: PASSED (no TypeScript errors)

If FAIL - where stuck + exact error snippets + what remains:
N/A - All tests passing, implementation complete.
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
- [x] ErrorLogger class implemented
- [x] `logError(error, context)` works
- [x] Stack traces captured
- [x] Error categories supported
- [x] Writes to .puppet-master/logs/error.log
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-11
Summary of changes: 
Implemented ErrorLogger class with error categorization, stack trace capture, and query capabilities. Created comprehensive test suite with 34 tests covering all functionality.

Files changed: 
- src/logging/error-logger.ts (NEW) - ErrorLogger class implementation
- src/logging/error-logger.test.ts (NEW) - Comprehensive test suite
- src/logging/index.ts (MODIFIED) - Added ErrorLogger exports

Commands run + results: 
- npm test -- -t "ErrorLogger" - PASSED (34 tests passed)
- npm run typecheck - PASSED (no type errors)

If FAIL - where stuck + exact error snippets + what remains:
N/A - Task completed successfully
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
- [x] IterationLogger class implemented
- [x] Creates file per iteration
- [x] Logs prompt sent
- [x] Logs output received
- [x] Logs timing
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-14
Summary of changes: 
Implemented IterationLogger class for tracking iteration execution details. Created comprehensive test suite with 21 passing tests. All type checks pass.

Files changed: 
- src/logging/iteration-logger.ts (NEW)
- src/logging/iteration-logger.test.ts (NEW)
- src/logging/index.ts (MODIFIED - added exports)

Commands run + results: 
- npm test -- -t "IterationLogger": PASS (21 tests passed)
- npm run typecheck: PASS (no type errors)

Implementation details:
- IterationLogger class with methods: startIteration, logOutput, completeIteration, getIterationLog, getIterationsForSubtask
- File structure: {logsDir}/iterations/{subtask-id}/{iteration-number}.json
- Iteration ID format: {subtaskId}-iter-{number} (zero-padded)
- Tracks prompts, outputs, timing, completion signals, files changed, and test results
- Handles concurrent iterations and loads from disk when needed
- All ESM patterns followed (.js extensions, import type for types)
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
- [x] EventBus class implemented
- [x] `emit(event)` broadcasts to subscribers
- [x] `subscribe(type, callback)` registers handlers
- [x] `unsubscribe(id)` removes handlers
- [x] Type-safe event handling
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-14
Summary of changes: 
Implemented EventBus class for pub/sub pattern broadcasting orchestrator events. Created comprehensive test suite with 26 passing tests. All type checks pass.

Files changed: 
- src/logging/event-bus.ts (NEW)
- src/logging/event-bus.test.ts (NEW)
- src/logging/index.ts (MODIFIED - added exports)

Commands run + results: 
- npm test -- -t "EventBus": PASS (26 tests passed)
- npm run typecheck: PASS (no type errors)

Implementation details:
- EventBus class with methods: emit, subscribe, unsubscribe, once, clear, getSubscriptionCount
- PuppetMasterEvent discriminated union with 7 event types: state_changed, tier_changed, iteration_started, iteration_completed, output_chunk, error, log
- Support for wildcard '*' subscriptions to receive all events
- Type-safe event handling with discriminated unions
- Error handling: continues emitting to other subscribers if one throws
- All ESM patterns followed (.js extensions, import type for types)
- Comprehensive test coverage including type safety verification

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
- [x] LogStreamer class implemented
- [x] `start()` begins watching files
- [x] `stop()` ends watching
- [x] Emits new log entries
- [x] Supports level filtering
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-14
Summary of changes: 
Implemented LogStreamer class for real-time log file streaming with file watching, position tracking, JSONL parsing, level filtering, and formatted output support. The implementation handles rapid writes by continuously reading until all content is caught up, handles file rotation/truncation, and gracefully handles malformed JSON lines.

Files changed: 
- src/logging/log-streamer.ts (NEW)
- src/logging/log-streamer.test.ts (NEW)
- src/logging/index.ts (MODIFIED - added exports)

Commands run + results: 
- npm test -- -t "LogStreamer": PASS (21 tests passed)
- npm run typecheck: PASS (no type errors)

Implementation details:
- LogStreamer class with StreamOptions interface supporting logPath, minLevel, and format options
- File watching using fs.watch() with fallback to directory watching for non-existent files
- Position tracking to read only new content incrementally
- JSONL parsing with handling for incomplete lines
- Level filtering using LEVEL_ORDER hierarchy
- Format support: 'json' (raw JSON) and 'pretty' (formatted terminal output)
- Handles rapid writes by looping until all content is read
- Handles file rotation/truncation by resetting position
- Gracefully skips malformed JSON lines
- Comprehensive test coverage including edge cases
- All ESM patterns followed (.js extensions, import type for types)

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
- [x] LogRetention class implemented
- [x] `cleanup()` removes old logs
- [x] `rotate(logPath)` rotates large files
- [x] `archive(logPath)` compresses old logs
- [x] Respects retention configuration
- [x] Tests pass
- [x] `npm test` passes

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
Status: PASS
Date: 2026-01-14
Summary of changes: 
Implemented LogRetention class for log file lifecycle management including rotation when size limits are exceeded, deletion of expired logs based on retention period, and optional gzip archiving of old logs. The implementation handles both flat log files and nested directories (e.g., iterations/), uses Node.js built-in zlib for compression, and provides comprehensive statistics about log files.

Files changed: 
- src/logging/log-retention.ts (NEW)
- src/logging/log-retention.test.ts (NEW)
- src/logging/index.ts (MODIFIED - added exports)

Commands run + results: 
- npm test -- -t "LogRetention": PASS (28 tests passed)
- npm run typecheck: PASS (no type errors)

Implementation details:
- LogRetention class with RetentionConfig interface supporting maxAgeDays, maxSizeBytes, archiveOld, and optional archiveDir
- Rotation naming convention: activity.log → activity.log.1, activity.log.2, etc.
- Archive format: gzip compression with .gz extension in archive directory
- Helper methods: shouldRotate() checks file size against maxSizeBytes, isExpired() checks file age against maxAgeDays
- Core methods: cleanup() orchestrates deletion/rotation/archiving, rotate() handles file rotation, archive() compresses files, getLogStats() provides detailed statistics
- Recursive file collection handles nested directories while excluding archive directory
- Graceful error handling continues processing other files if one fails
- Comprehensive test coverage including edge cases (empty directory, non-log files, subdirectories, etc.)
- All ESM patterns followed (.js extensions, export type for types)

If FAIL - where stuck + exact error snippets + what remains:
```

---

## Phase 7 Completion Checklist

Before marking Phase 7 complete:

- [x] All 7 tasks have PASS status
- [x] Logger service supports all levels
- [x] Activity logger captures state changes
- [x] Error logger captures stack traces
- [x] Iteration logger creates per-iteration files
- [x] Event bus broadcasts to subscribers
- [x] Log streaming supports --follow
- [x] Log retention cleans up old files
- [x] `npm test` passes all Phase 7 tests

### Phase 7 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-7 logging-observability complete"
```

---

*End of BUILD_QUEUE_PHASE_7.md*
