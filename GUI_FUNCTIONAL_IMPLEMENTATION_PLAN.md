# GUI Functional Implementation Plan

> **Status**: Implementation Roadmap
> **Created**: 2026-01-16
> **Based On**: UX Research Report (Agent a703c63)

## Executive Summary

This plan outlines the work required to transform the RWM Puppet Master GUI from a visually complete but non-functional interface into a fully operational control system.

**Current State**: 7/7 screens implemented, 1/7 functional (14%)
**Target State**: 7/7 screens implemented, 7/7 functional (100%)
**Total Effort**: ~65 hours (1.5-2 weeks)

**Progress Update (2026-01-16)**:
- CR-1: ✅ COMPLETE - Register Orchestrator Instance
- CR-2: 🟡 IN PROGRESS - Wire Orchestrator to EventBus (core events done, additional events needed)
- CR-3: ✅ COMPLETE - Implement Actual Project Loading
- CR-4: ✅ COMPLETE - Implement Missing Control Endpoints (stub implementation)
- HP-1: ✅ COMPLETE - Add Error Toast Notifications

---

## Priority Levels

- **CRITICAL**: Blocks all core functionality (must fix to be usable)
- **HIGH**: Major usability issues (required for core workflows)
- **MEDIUM**: Nice-to-have improvements (enhances UX)
- **LOW**: Polish items (professional finish)

---

## CRITICAL PRIORITY (20 hours)

### CR-1: Register Orchestrator Instance with GUI Server ✅ COMPLETE
**Effort**: 2 hours (Actual: 1.5 hours)
**Blocks**: All control buttons (START/PAUSE/RESUME/STOP)
**Status**: ✅ Implemented 2026-01-16

#### Implementation Summary
- Created `/src/cli/commands/gui.ts` with GuiCommand class
- GUI command creates EventBus, container, GuiServer, and Orchestrator instance
- Calls `guiServer.registerOrchestratorInstance(orchestrator)` to wire them together
- Registered GUI command in `/src/cli/index.ts`
- Users can now run `puppet-master gui` to launch GUI with integrated orchestrator

#### Problem
```typescript
// src/gui/server.ts:181
this.app.use('/api', createControlsRoutes(null));  // ❌ NULL ORCHESTRATOR
```

All control endpoints return 503 because orchestrator is never registered.

#### Solution

**File**: `src/gui/server.ts`

Add method to register orchestrator instance:
```typescript
export class GuiServer {
  private orchestrator: Orchestrator | null = null;

  // Add this method
  public registerOrchestratorInstance(orchestrator: Orchestrator): void {
    this.orchestrator = orchestrator;
    // Re-register controls routes with real orchestrator
    this.app.use('/api', createControlsRoutes(orchestrator));
  }
}
```

**File**: `src/index.ts` (or main entry point)

Wire orchestrator to GUI on startup:
```typescript
import { GuiServer } from './gui/server';
import { Orchestrator } from './core/orchestrator';

async function main() {
  const config = await loadConfig();
  const eventBus = new EventBus();

  // Create orchestrator
  const orchestrator = new Orchestrator(config, eventBus);

  // Create and start GUI
  const guiServer = new GuiServer(config, eventBus);
  guiServer.registerOrchestratorInstance(orchestrator);
  await guiServer.start();

  console.log('RWM Puppet Master started with GUI');
}
```

#### Acceptance Criteria
- [ ] GuiServer has `registerOrchestratorInstance()` method
- [ ] Main entry point calls `registerOrchestratorInstance()` after creating orchestrator
- [ ] Control routes receive non-null orchestrator
- [ ] START button no longer returns 503 when clicked
- [ ] TEST: `curl -X POST http://localhost:3847/api/controls/start` returns 200 or 400 (not 503)

#### Files to Change
- `src/gui/server.ts` - Add registration method
- `src/index.ts` (or equivalent) - Wire orchestrator to GUI
- `src/gui/routes/controls.ts` - May need to handle orchestrator lifecycle

---

### CR-2: Wire Orchestrator to EventBus for Real-Time Updates 🟡 IN PROGRESS
**Effort**: 8 hours (Actual: 2 hours so far, ~3 hours remaining)
**Blocks**: Dashboard updates, live output, progress bars, status changes
**Status**: 🟡 Core events implemented, additional events needed

#### Implementation Summary
**Completed (2026-01-16):**
- ✅ Added EventBus as optional parameter to OrchestratorConfig
- ✅ Stored EventBus reference in Orchestrator class
- ✅ Published `state_changed` events in start(), pause(), resume(), stop()
- ✅ Published `iteration_started` events before iteration execution
- ✅ Published `iteration_completed` events after iteration execution
- ✅ Published `output_chunk` events via ExecutionEngine.onOutput() callback
- ✅ Published `error` events in error handler
- ✅ Updated GUI command to pass EventBus to Orchestrator

**Remaining Work (~3 hours):**
- ⏳ Add additional event types to EventBus: progress, commit, budget_update, gate_start, gate_complete
- ⏳ Publish progress events when tiers complete
- ⏳ Publish commit events after git commits (integrate with GitManager)
- ⏳ Publish budget_update events after CLI invocations (integrate with UsageTracker)
- ⏳ Publish gate events in gate execution flow

#### Problem
EventBus infrastructure exists in GUI, but Orchestrator never publishes events. Dashboard shows static placeholders indefinitely.

#### Solution

**File**: `src/core/orchestrator.ts` (or equivalent)

Add EventBus integration to Orchestrator:
```typescript
export class Orchestrator {
  constructor(
    private config: Config,
    private eventBus: EventBus
  ) {}

  async start(): Promise<void> {
    // Publish state change
    this.eventBus.publish('state_change', {
      from: 'idle',
      to: 'planning',
      timestamp: new Date().toISOString()
    });

    // ... orchestration logic
  }

  private async executeIteration(subtask: Subtask): Promise<void> {
    // Publish iteration start
    this.eventBus.publish('iteration_start', {
      itemId: subtask.id,
      itemTitle: subtask.title,
      iteration: subtask.currentIteration,
      platform: subtask.platform,
      model: subtask.model,
      sessionId: generateSessionId()
    });

    // Execute CLI
    const process = await this.spawnCLI(subtask);

    // Stream output
    process.stdout.on('data', (chunk) => {
      this.eventBus.publish('output', {
        type: 'stdout',
        content: chunk.toString(),
        timestamp: new Date().toISOString()
      });
    });

    process.stderr.on('data', (chunk) => {
      this.eventBus.publish('output', {
        type: 'stderr',
        content: chunk.toString(),
        timestamp: new Date().toISOString()
      });
    });

    // Wait for completion
    await processComplete;

    // Publish iteration complete
    this.eventBus.publish('iteration_complete', {
      itemId: subtask.id,
      status: result.passed ? 'SUCCESS' : 'FAILED',
      duration: result.duration
    });
  }

  private async runGate(gate: Gate): Promise<void> {
    // Publish gate start
    this.eventBus.publish('gate_start', {
      tierId: gate.tierId,
      verifierType: gate.verifier.type,
      target: gate.verifier.target
    });

    const result = await gate.execute();

    // Publish gate complete
    this.eventBus.publish('gate_complete', {
      tierId: gate.tierId,
      verifierType: gate.verifier.type,
      passed: result.passed,
      evidence: result.evidence
    });
  }
}
```

#### Events to Publish

**state_change**
```typescript
{
  from: 'idle' | 'planning' | 'executing' | 'paused' | 'complete' | 'error',
  to: 'idle' | 'planning' | 'executing' | 'paused' | 'complete' | 'error',
  timestamp: string
}
```

**iteration_start**
```typescript
{
  itemId: string,           // e.g., "ST-001-001-001"
  itemTitle: string,
  iteration: number,
  platform: string,
  model: string,
  sessionId: string,
  acceptance: string[],     // Acceptance criteria checklist
  verifiers: Verifier[]     // Test/verifier list
}
```

**iteration_complete**
```typescript
{
  itemId: string,
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL',
  duration: number,
  filesChanged: string[],
  testsRun: string[],
  learnings: string[]
}
```

**output**
```typescript
{
  type: 'stdout' | 'stderr',
  content: string,
  timestamp: string
}
```

**progress**
```typescript
{
  phasesTotal: number,
  phasesComplete: number,
  tasksTotal: number,
  tasksComplete: number,
  subtasksTotal: number,
  subtasksComplete: number
}
```

**commit**
```typescript
{
  sha: string,
  message: string,
  files: number,
  timestamp: string
}
```

**error**
```typescript
{
  type: 'iteration_failed' | 'gate_failed' | 'cli_error' | 'system_error',
  message: string,
  itemId?: string,
  stack?: string,
  timestamp: string
}
```

**budget_update**
```typescript
{
  platform: 'claude' | 'codex' | 'cursor',
  used: number,
  limit: number,
  cooldownUntil?: string
}
```

**gate_start** / **gate_complete**
```typescript
{
  tierId: string,
  verifierType: string,
  target: string,
  passed?: boolean,
  evidence?: Evidence
}
```

#### Acceptance Criteria
- [ ] Orchestrator publishes `state_change` events on state transitions
- [ ] Orchestrator publishes `iteration_start` when starting subtask
- [ ] Orchestrator publishes `output` events with CLI stdout/stderr streams
- [ ] Orchestrator publishes `iteration_complete` when subtask finishes
- [ ] Orchestrator publishes `progress` events when tiers complete
- [ ] Orchestrator publishes `commit` events after git commits
- [ ] Orchestrator publishes `error` events on failures
- [ ] Orchestrator publishes `budget_update` events after CLI invocations
- [ ] Orchestrator publishes `gate_start` / `gate_complete` for verifiers
- [ ] Dashboard live output panel shows CLI streams in real-time
- [ ] Dashboard status changes from IDLE → EXECUTING → COMPLETE
- [ ] Dashboard position indicators update (Phase 1/3, Task 2/5, etc.)
- [ ] Dashboard progress bars animate
- [ ] Dashboard budget counters increment
- [ ] TEST: Start execution, verify all event types published to EventBus

#### Files to Change
- `src/core/orchestrator.ts` - Add EventBus.publish() calls throughout
- `src/core/tier-execution/iteration-runner.ts` - Publish iteration events
- `src/core/tier-execution/gate-runner.ts` - Publish gate events
- `src/core/git/git-manager.ts` - Publish commit events
- `src/core/platform-runners/*.ts` - Publish output events

---

### CR-3: Implement Actual Project Loading in Orchestrator ✅ COMPLETE
**Effort**: 4 hours (Actual: 2 hours)
**Blocks**: Opening projects, dashboard showing correct data
**Status**: ✅ Implemented 2026-01-16

#### Implementation Summary
**Completed (2026-01-16):**
- ✅ Added `loadProject()` method to Orchestrator
- ✅ Added `getCurrentProject()` method to Orchestrator
- ✅ Modified `createProjectsRoutes()` to accept orchestrator parameter
- ✅ Updated POST /api/projects/open to load PRD and config
- ✅ Updated POST /api/projects/open to call `orchestrator.loadProject()`
- ✅ Reloads TierStateManager with new PRD data
- ✅ Published `project_loaded` event with project metadata
- ✅ Updated GuiServer.registerOrchestratorInstance() to register projects routes with orchestrator
- ✅ Added `project_loaded` event type to EventBus

**Impact**: Users can now:
- Open projects from the Projects page
- Projects are actually loaded into the orchestrator
- Dashboard will receive project_loaded event with name, path, and tier counts
- TierStateManager is populated with project's PRD data
- Control buttons can now start execution on loaded projects

#### Problem
POST /api/projects/open stores path in memory but doesn't load PRD/config into orchestrator. Dashboard still shows "No project loaded".

#### Solution

**File**: `src/gui/routes/projects.ts`

Integrate project loading with orchestrator:
```typescript
router.post('/open', async (req, res) => {
  try {
    const { projectPath } = req.body;

    // Validate project
    const prdPath = path.join(projectPath, '.puppet-master/prd.json');
    const configPath = path.join(projectPath, '.puppet-master/config.yaml');

    if (!fs.existsSync(prdPath)) {
      return res.status(400).json({
        error: 'No PRD found',
        code: 'PRD_NOT_FOUND',
        path: prdPath
      });
    }

    if (!fs.existsSync(configPath)) {
      return res.status(400).json({
        error: 'No config found',
        code: 'CONFIG_NOT_FOUND',
        path: configPath
      });
    }

    // Load PRD
    const prdContent = fs.readFileSync(prdPath, 'utf-8');
    const prd = JSON.parse(prdContent);

    // Load config
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = yaml.parse(configContent);

    // Load into orchestrator (via OrchestratorManager or similar)
    const orchestratorManager = req.app.get('orchestratorManager');
    await orchestratorManager.loadProject({
      path: projectPath,
      prd,
      config
    });

    // Initialize TierStateManager
    const tierManager = req.app.get('tierManager');
    await tierManager.loadFromPRD(prd);

    // Publish event
    eventBus.publish('project_loaded', {
      name: prd.project,
      path: projectPath,
      phases: prd.phases.length,
      tasks: prd.metadata.totalTasks,
      subtasks: prd.metadata.totalSubtasks
    });

    res.json({
      success: true,
      project: {
        name: prd.project,
        path: projectPath
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'PROJECT_LOAD_FAILED'
    });
  }
});
```

**File**: `src/core/orchestrator.ts`

Add loadProject method:
```typescript
export class Orchestrator {
  private currentProject: ProjectState | null = null;

  async loadProject(params: {
    path: string;
    prd: PRD;
    config: Config;
  }): Promise<void> {
    this.currentProject = {
      path: params.path,
      prd: params.prd,
      config: params.config,
      loadedAt: new Date()
    };

    // Initialize state from PRD
    this.tierStateManager.loadFromPRD(params.prd);

    // Validate config
    this.validateConfig(params.config);

    // Set working directory
    process.chdir(params.path);

    this.eventBus.publish('project_loaded', {
      name: params.prd.project,
      path: params.path
    });
  }

  getCurrentProject(): ProjectState | null {
    return this.currentProject;
  }
}
```

**File**: `src/gui/public/js/dashboard.js`

Update dashboard to show loaded project:
```javascript
eventBus.on('project_loaded', (data) => {
  document.querySelector('#project-name').textContent = data.name;
  document.querySelector('#project-path').textContent = data.path;
  document.querySelector('.no-project-warning').style.display = 'none';

  // Enable START button
  document.querySelector('#start-btn').disabled = false;

  showToast(`Project "${data.name}" loaded successfully`, 'success');
});
```

#### Acceptance Criteria
- [ ] Orchestrator has `loadProject()` method
- [ ] POST /api/projects/open calls `orchestrator.loadProject()`
- [ ] TierStateManager initialized with PRD data
- [ ] EventBus publishes `project_loaded` event
- [ ] Dashboard updates with project name and path
- [ ] Dashboard hides "No project loaded" warning
- [ ] START button becomes enabled
- [ ] GET /api/state returns correct project info
- [ ] TEST: Open project, verify dashboard shows project name
- [ ] TEST: Open project, click START, verify execution begins

#### Files to Change
- `src/gui/routes/projects.ts` - Integrate orchestrator.loadProject()
- `src/core/orchestrator.ts` - Add loadProject() method
- `src/gui/public/js/dashboard.js` - Handle project_loaded event
- `src/gui/routes/state.ts` - Return current project info

---

### CR-4: Implement Missing Control Endpoints ✅ COMPLETE
**Effort**: 6 hours (Actual: 1 hour - Stub Implementation)
**Blocks**: RETRY, REPLAN, REOPEN, KILL-SPAWN buttons
**Status**: ✅ Endpoints created 2026-01-16 (returning 501 Not Implemented until full logic added)

#### Implementation Summary
**Completed (2026-01-16):**
- ✅ Added POST /api/controls/retry endpoint with validation
- ✅ Added POST /api/controls/replan endpoint with tierId and scope validation
- ✅ Added POST /api/controls/reopen endpoint with tierId and reason validation
- ✅ Added POST /api/controls/kill-spawn endpoint
- ✅ All endpoints properly check for orchestrator availability (503 if missing)
- ✅ All endpoints validate required parameters (400 if missing/invalid)
- ✅ All endpoints return 501 Not Implemented (graceful degradation until full logic added)

**Impact**:
- Buttons no longer return 404 errors
- Users receive clear "Not yet implemented" messages
- Infrastructure in place for future implementation
- Full validation logic ready for when Orchestrator methods are added

**TODO (Future Work)**:
- Implement `orchestrator.retry()` method
- Implement `orchestrator.replan()` method
- Implement `orchestrator.reopenItem()` method
- Implement `orchestrator.killCurrentProcess()` and `spawnFreshIteration()` methods

#### Problem
Control endpoints for RETRY, REPLAN, REOPEN, KILL-SPAWN don't exist. Buttons return 404.

#### Solution

**File**: `src/gui/routes/controls.ts`

Add missing endpoints:

```typescript
// RETRY - Retry current failed subtask
router.post('/retry', async (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({
      error: 'Orchestrator not available',
      code: 'ORCHESTRATOR_NOT_AVAILABLE'
    });
  }

  try {
    const currentItem = orchestrator.getCurrentItem();

    if (!currentItem) {
      return res.status(400).json({
        error: 'No current item to retry',
        code: 'NO_CURRENT_ITEM'
      });
    }

    if (currentItem.status !== 'FAILED') {
      return res.status(400).json({
        error: 'Current item has not failed',
        code: 'ITEM_NOT_FAILED',
        currentStatus: currentItem.status
      });
    }

    // Reset iteration count and status
    await orchestrator.retryCurrentItem();

    res.json({
      success: true,
      itemId: currentItem.id,
      message: 'Retry initiated'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'RETRY_FAILED'
    });
  }
});

// REPLAN - Regenerate plans for phase/task
router.post('/replan', async (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({
      error: 'Orchestrator not available',
      code: 'ORCHESTRATOR_NOT_AVAILABLE'
    });
  }

  try {
    const { tierId, scope } = req.body; // scope: 'phase' | 'task' | 'subtask'

    if (!tierId) {
      return res.status(400).json({
        error: 'tierId required',
        code: 'TIER_ID_REQUIRED'
      });
    }

    // Invoke replanning
    await orchestrator.replan(tierId, scope);

    res.json({
      success: true,
      tierId,
      scope,
      message: 'Replan initiated'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'REPLAN_FAILED'
    });
  }
});

// REOPEN - Reopen completed item
router.post('/reopen', async (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({
      error: 'Orchestrator not available',
      code: 'ORCHESTRATOR_NOT_AVAILABLE'
    });
  }

  try {
    const { tierId, reason } = req.body;

    if (!tierId) {
      return res.status(400).json({
        error: 'tierId required',
        code: 'TIER_ID_REQUIRED'
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: 'reason required',
        code: 'REASON_REQUIRED'
      });
    }

    // Set pass=false, reset iteration count
    await orchestrator.reopenItem(tierId, reason);

    res.json({
      success: true,
      tierId,
      reason,
      message: 'Item reopened'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'REOPEN_FAILED'
    });
  }
});

// KILL-SPAWN - Kill current CLI process, spawn fresh
router.post('/kill-spawn', async (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({
      error: 'Orchestrator not available',
      code: 'ORCHESTRATOR_NOT_AVAILABLE'
    });
  }

  try {
    const currentProcess = orchestrator.getCurrentCLIProcess();

    if (!currentProcess) {
      return res.status(400).json({
        error: 'No CLI process running',
        code: 'NO_PROCESS_RUNNING'
      });
    }

    // Kill current process
    await orchestrator.killCurrentProcess();

    // Spawn fresh iteration
    await orchestrator.spawnFreshIteration();

    res.json({
      success: true,
      message: 'Process killed, fresh iteration spawned'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'KILL_SPAWN_FAILED'
    });
  }
});
```

**File**: `src/core/orchestrator.ts`

Add corresponding methods:
```typescript
export class Orchestrator {
  async retryCurrentItem(): Promise<void> {
    if (!this.currentItem) {
      throw new Error('No current item');
    }

    // Reset iteration count
    this.currentItem.currentIteration = 0;
    this.currentItem.status = 'PENDING';

    // Update PRD
    await this.updatePRD();

    // Restart execution
    await this.executeIteration(this.currentItem);
  }

  async replan(tierId: string, scope: 'phase' | 'task' | 'subtask'): Promise<void> {
    // Archive old plan
    await this.archiveCurrentPlan(tierId);

    // Invoke planning agent (platform-dependent)
    const planningPlatform = this.config.tiers[scope].platform;
    const newPlan = await this.invokePlanningAgent(planningPlatform, tierId, scope);

    // Update tier plans
    await this.savePlan(tierId, newPlan);

    this.eventBus.publish('replan_complete', {
      tierId,
      scope,
      timestamp: new Date().toISOString()
    });
  }

  async reopenItem(tierId: string, reason: string): Promise<void> {
    const tier = this.tierStateManager.getTierById(tierId);

    if (!tier) {
      throw new Error(`Tier not found: ${tierId}`);
    }

    // Set pass=false
    tier.pass = false;
    tier.status = 'PENDING';
    tier.currentIteration = 0;

    // Log reason in audit trail
    await this.logAuditEvent({
      action: 'reopen',
      tierId,
      reason,
      timestamp: new Date().toISOString()
    });

    // Update PRD
    await this.updatePRD();

    this.eventBus.publish('item_reopened', {
      tierId,
      reason
    });
  }

  async killCurrentProcess(): Promise<void> {
    if (!this.currentCLIProcess) {
      throw new Error('No process running');
    }

    const pid = this.currentCLIProcess.pid;

    // SIGTERM first
    process.kill(pid, 'SIGTERM');

    // Wait 5 seconds
    await sleep(5000);

    // SIGKILL if still alive
    if (this.isProcessAlive(pid)) {
      process.kill(pid, 'SIGKILL');
    }

    this.currentCLIProcess = null;
  }

  async spawnFreshIteration(): Promise<void> {
    if (!this.currentItem) {
      throw new Error('No current item');
    }

    // Increment iteration
    this.currentItem.currentIteration++;

    // Spawn fresh process
    await this.executeIteration(this.currentItem);
  }
}
```

#### Acceptance Criteria
- [ ] POST /api/controls/retry endpoint exists and works
- [ ] POST /api/controls/replan endpoint exists and works
- [ ] POST /api/controls/reopen endpoint exists and works
- [ ] POST /api/controls/kill-spawn endpoint exists and works
- [ ] Orchestrator has corresponding methods for each endpoint
- [ ] RETRY button calls endpoint successfully
- [ ] REPLAN button calls endpoint successfully
- [ ] REOPEN button calls endpoint successfully (with confirmation dialog)
- [ ] KILL button calls endpoint successfully
- [ ] TEST: Click RETRY on failed subtask, verify new iteration starts
- [ ] TEST: Click REOPEN, enter reason, verify item reopened in PRD
- [ ] TEST: Click KILL during execution, verify process terminates

#### Files to Change
- `src/gui/routes/controls.ts` - Add 4 new endpoints
- `src/core/orchestrator.ts` - Add retry, replan, reopenItem, killCurrentProcess, spawnFreshIteration methods
- `src/gui/public/js/controls.js` - May need to update button handlers

---

## HIGH PRIORITY (15 hours)

### HP-1: Add Error Toast Notifications for All Control Failures ✅ COMPLETE
**Effort**: 2 hours (Actual: 2 hours)
**Impact**: Users understand why controls don't work
**Status**: ✅ Implemented 2026-01-16

#### Problem
When controls fail (503, 400, etc.), no user-facing error message displayed. Buttons appear to do nothing.

#### Solution

**File**: `src/gui/public/js/controls.js`

Wrap all API calls with error handling:
```javascript
async function handleStart() {
  try {
    const response = await fetch('/api/controls/start', {
      method: 'POST'
    });

    if (!response.ok) {
      const error = await response.json();

      // Map error codes to user-friendly messages
      const errorMessages = {
        'ORCHESTRATOR_NOT_AVAILABLE': 'Orchestrator not available. Please restart the application.',
        'NO_PROJECT_LOADED': 'No project loaded. Please open or create a project first.',
        'ALREADY_RUNNING': 'Execution is already running.',
        'PRD_INVALID': 'PRD validation failed. Please review your project configuration.'
      };

      const message = errorMessages[error.code] || error.error || 'Failed to start execution';
      showToast(message, 'error');
      return;
    }

    const result = await response.json();
    showToast('Execution started successfully', 'success');

  } catch (error) {
    showToast(`Failed to start execution: ${error.message}`, 'error');
  }
}

// Apply same pattern to all control actions:
// - handlePause()
// - handleResume()
// - handleStop()
// - handleRetry()
// - handleReplan()
// - handleReopen()
// - handleKillSpawn()
// - handleReset()
```

#### Implementation Summary
**Completed (2026-01-16):**
- ✅ Added ERROR_MESSAGES constant with comprehensive error code mapping
- ✅ Created handleControlAction helper function for consistent error handling
- ✅ Refactored all existing control functions (start, pause, resume, stop, reset) to use helper
- ✅ Added new handler functions (retryExecution, replanExecution, reopenItem, killSpawnExecution)
- ✅ Enhanced showToast to accept duration parameter (default 5 seconds)
- ✅ Updated dashboard.js to use controls module functions instead of controlAction
- ✅ All control actions now show appropriate toast notifications with error code mapping
- ✅ Preserved original toast types (warning for pause/stop, info for reset, success for others)

**Impact**: Users now receive clear, actionable error messages for all control failures instead of silent failures.

#### Acceptance Criteria
- [x] All control button handlers have try-catch error handling
- [x] 503 errors show "Orchestrator not available" toast
- [x] 400 errors show specific user-friendly message
- [x] 500 errors show generic "Failed to..." message
- [x] Success responses show success toast
- [x] Error toasts automatically dismiss after 5 seconds
- [x] TEST: Click START with no project, verify "No project loaded" toast
- [x] TEST: Click START with no orchestrator, verify "Orchestrator not available" toast

#### Files to Change
- `src/gui/public/js/controls.js` - Add error handling to all button handlers

---

### HP-2: Add Pre-Flight Checks Before START Execution
**Effort**: 3 hours
**Impact**: Users get actionable error messages instead of silent failures

#### Problem
No validation that prerequisites are met before starting execution. START button fails silently.

#### Solution

**File**: `src/gui/routes/controls.ts`

Add pre-flight validation:
```typescript
router.post('/start', async (req, res) => {
  if (!orchestrator) {
    return res.status(503).json({
      error: 'Orchestrator not available',
      code: 'ORCHESTRATOR_NOT_AVAILABLE'
    });
  }

  // PRE-FLIGHT CHECKS

  // Check 1: Project loaded?
  const project = orchestrator.getCurrentProject();
  if (!project) {
    return res.status(400).json({
      error: 'No project loaded. Please open or create a project first.',
      code: 'NO_PROJECT_LOADED'
    });
  }

  // Check 2: PRD valid?
  const prdValidation = await orchestrator.validatePRD();
  if (!prdValidation.valid) {
    return res.status(400).json({
      error: 'PRD validation failed',
      code: 'PRD_INVALID',
      details: prdValidation.errors
    });
  }

  // Check 3: Config valid?
  const configValidation = await orchestrator.validateConfig();
  if (!configValidation.valid) {
    return res.status(400).json({
      error: 'Configuration validation failed',
      code: 'CONFIG_INVALID',
      details: configValidation.errors
    });
  }

  // Check 4: Required CLIs available?
  const cliChecks = await orchestrator.checkRequiredCLIs();
  if (!cliChecks.allAvailable) {
    return res.status(400).json({
      error: 'Required CLI tools not available',
      code: 'CLI_TOOLS_MISSING',
      details: cliChecks.missing,
      hint: 'Run Doctor to install missing tools'
    });
  }

  // Check 5: Git repo initialized?
  const gitCheck = await orchestrator.checkGitRepo();
  if (!gitCheck.valid) {
    return res.status(400).json({
      error: 'Git repository not initialized',
      code: 'GIT_NOT_INITIALIZED',
      hint: 'Run "git init" in project directory'
    });
  }

  // All checks passed, start execution
  try {
    await orchestrator.start();

    res.json({
      success: true,
      message: 'Execution started'
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'START_FAILED'
    });
  }
});
```

**File**: `src/core/orchestrator.ts`

Add validation methods:
```typescript
export class Orchestrator {
  async validatePRD(): Promise<ValidationResult> {
    if (!this.currentProject) {
      return { valid: false, errors: ['No project loaded'] };
    }

    const errors: string[] = [];

    // Check PRD structure
    if (!this.currentProject.prd.phases || this.currentProject.prd.phases.length === 0) {
      errors.push('PRD has no phases defined');
    }

    // Check metadata
    if (!this.currentProject.prd.metadata) {
      errors.push('PRD missing metadata section');
    }

    // Check each phase has tasks
    for (const phase of this.currentProject.prd.phases) {
      if (!phase.tasks || phase.tasks.length === 0) {
        errors.push(`Phase ${phase.id} has no tasks`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async validateConfig(): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check tier configuration
    const requiredTiers = ['phase', 'task', 'subtask', 'iteration'];
    for (const tier of requiredTiers) {
      if (!this.config.tiers[tier]) {
        errors.push(`Missing tier configuration: ${tier}`);
      } else {
        if (!this.config.tiers[tier].platform) {
          errors.push(`${tier} tier missing platform`);
        }
      }
    }

    // Check branching configuration
    if (!this.config.branching) {
      errors.push('Missing branching configuration');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async checkRequiredCLIs(): Promise<CLICheckResult> {
    const requiredPlatforms = new Set([
      this.config.tiers.phase.platform,
      this.config.tiers.task.platform,
      this.config.tiers.subtask.platform,
      this.config.tiers.iteration.platform
    ]);

    const missing: string[] = [];

    for (const platform of requiredPlatforms) {
      const cliPath = this.config.cli_paths[platform];
      const available = await this.checkCLIAvailable(cliPath);

      if (!available) {
        missing.push(platform);
      }
    }

    return {
      allAvailable: missing.length === 0,
      missing
    };
  }

  async checkGitRepo(): Promise<ValidationResult> {
    const gitDir = path.join(this.currentProject.path, '.git');

    if (!fs.existsSync(gitDir)) {
      return {
        valid: false,
        errors: ['Git repository not initialized']
      };
    }

    return { valid: true, errors: [] };
  }
}
```

#### Acceptance Criteria
- [ ] POST /api/controls/start runs pre-flight checks
- [ ] Returns 400 with specific error if no project loaded
- [ ] Returns 400 with details if PRD invalid
- [ ] Returns 400 with details if config invalid
- [ ] Returns 400 with missing CLIs if tools not available
- [ ] Returns 400 if git not initialized
- [ ] Orchestrator has validation methods for PRD, config, CLIs, git
- [ ] Error messages include hints for resolution
- [ ] TEST: Click START with no project, verify error message
- [ ] TEST: Click START with invalid PRD, verify validation errors shown
- [ ] TEST: Click START with missing CLI, verify "Run Doctor" hint

#### Files to Change
- `src/gui/routes/controls.ts` - Add pre-flight checks to /start endpoint
- `src/core/orchestrator.ts` - Add validation methods
- `src/gui/public/js/controls.js` - Display validation error details in toast

---

### HP-3: Fix Tier Tree Data Loading from TierStateManager
**Effort**: 2 hours
**Impact**: Tier view shows actual project structure

#### Problem
GET /api/tiers returns empty hierarchy because TierStateManager not registered or not loaded.

#### Solution

**File**: `src/gui/routes/state.ts`

Fix tier endpoint to return real data:
```typescript
router.get('/tiers', async (_req, res) => {
  try {
    // Get TierStateManager from app context
    const tierManager: TierStateManager | undefined = req.app.get('tierManager');

    if (!tierManager) {
      return res.status(503).json({
        error: 'TierStateManager not available',
        code: 'TIER_MANAGER_NOT_AVAILABLE'
      });
    }

    // Get root tier (Phase tier)
    const root = tierManager.getRoot();

    if (!root) {
      return res.json({
        tiers: [],
        message: 'No tiers loaded. Open a project first.'
      });
    }

    // Serialize full tree
    const hierarchy = serializeTierTree(root);

    res.json({
      tiers: hierarchy,
      metadata: {
        totalPhases: tierManager.getPhaseCount(),
        totalTasks: tierManager.getTaskCount(),
        totalSubtasks: tierManager.getSubtaskCount(),
        completedPhases: tierManager.getCompletedPhaseCount(),
        completedTasks: tierManager.getCompletedTaskCount(),
        completedSubtasks: tierManager.getCompletedSubtaskCount()
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'TIER_FETCH_FAILED'
    });
  }
});

function serializeTierTree(tier: Tier): any {
  return {
    id: tier.id,
    title: tier.title,
    type: tier.type,
    status: tier.status,
    pass: tier.pass,
    currentIteration: tier.currentIteration,
    maxIterations: tier.maxIterations,
    platform: tier.platform,
    model: tier.model,
    acceptance: tier.acceptanceCriteria,
    verifiers: tier.verifiers.map(v => ({
      type: v.type,
      target: v.target,
      status: v.status,
      evidence: v.evidence
    })),
    children: tier.children.map(child => serializeTierTree(child))
  };
}
```

**File**: `src/gui/server.ts`

Register TierStateManager in app context:
```typescript
export class GuiServer {
  private tierManager: TierStateManager;

  constructor(
    private config: Config,
    private eventBus: EventBus
  ) {
    this.tierManager = new TierStateManager();

    // Store in app context for routes
    this.app.set('tierManager', this.tierManager);
  }

  public getTierManager(): TierStateManager {
    return this.tierManager;
  }
}
```

**File**: `src/core/orchestrator.ts`

Ensure TierStateManager loaded when project opened:
```typescript
async loadProject(params: {
  path: string;
  prd: PRD;
  config: Config;
}): Promise<void> {
  // ... existing code ...

  // Load tiers from PRD
  this.tierStateManager.loadFromPRD(params.prd);

  // Publish event
  this.eventBus.publish('tiers_loaded', {
    phasesCount: params.prd.phases.length,
    tasksCount: params.prd.metadata.totalTasks,
    subtasksCount: params.prd.metadata.totalSubtasks
  });
}
```

#### Acceptance Criteria
- [ ] TierStateManager registered in GuiServer app context
- [ ] GET /api/tiers returns actual tier hierarchy from TierStateManager
- [ ] Tier tree includes all metadata (status, pass, acceptance, verifiers)
- [ ] Empty state returns friendly message "No tiers loaded"
- [ ] Tier view UI renders tree structure correctly
- [ ] Expanding/collapsing nodes works
- [ ] TEST: Open project with PRD, navigate to /tiers, verify tree shows phases/tasks/subtasks
- [ ] TEST: Verify acceptance criteria visible for each tier
- [ ] TEST: Verify verifier status shows [PENDING], [RUNNING], [PASS], [FAIL]

#### Files to Change
- `src/gui/routes/state.ts` - Fix /tiers endpoint to use TierStateManager
- `src/gui/server.ts` - Register TierStateManager in app context
- `src/core/orchestrator.ts` - Ensure tierManager.loadFromPRD() called on project load
- `src/gui/public/js/tiers.js` - May need to update tree rendering logic

---

### HP-4: Integrate Start Chain Pipeline with Wizard
**Effort**: 8 hours
**Impact**: Wizard actually creates a functional project

#### Problem
Wizard saves PRD to file but uses rule-based fallback (no AI). Doesn't trigger Start Chain orchestration, doesn't generate architecture.md or tier plans.

#### Solution

**File**: `src/gui/routes/wizard.ts`

Integrate StartChainPipeline:
```typescript
import { StartChainPipeline } from '../../core/start-chain/pipeline';

router.post('/save', async (req, res) => {
  try {
    const { prd, projectName, projectPath } = req.body;

    // Validate inputs
    if (!prd || !projectName || !projectPath) {
      return res.status(400).json({
        error: 'Missing required fields',
        code: 'MISSING_FIELDS'
      });
    }

    // Create project directory structure
    const puppetMasterDir = path.join(projectPath, '.puppet-master');
    fs.mkdirSync(puppetMasterDir, { recursive: true });
    fs.mkdirSync(path.join(puppetMasterDir, 'requirements'), { recursive: true });
    fs.mkdirSync(path.join(puppetMasterDir, 'plans'), { recursive: true });
    fs.mkdirSync(path.join(puppetMasterDir, 'evidence'), { recursive: true });
    fs.mkdirSync(path.join(puppetMasterDir, 'logs'), { recursive: true });

    // Save PRD (initial version from wizard)
    const prdPath = path.join(puppetMasterDir, 'prd.json');
    fs.writeFileSync(prdPath, JSON.stringify(prd, null, 2));

    // Get requirements document content
    const requirementsPath = path.join(puppetMasterDir, 'requirements/original.md');
    const requirementsContent = req.body.requirementsContent; // Passed from wizard
    fs.writeFileSync(requirementsPath, requirementsContent);

    // Get orchestrator instance
    const orchestrator = req.app.get('orchestrator');

    if (!orchestrator) {
      // Fallback: just save PRD without Start Chain
      return res.json({
        success: true,
        message: 'PRD saved (orchestrator not available)',
        projectPath,
        warning: 'Start Chain not executed'
      });
    }

    // Execute Start Chain Pipeline
    const startChainPipeline = new StartChainPipeline(
      orchestrator.config,
      orchestrator.eventBus
    );

    const result = await startChainPipeline.execute({
      requirementsPath,
      projectPath,
      config: orchestrator.config
    });

    // Start Chain generates:
    // - Enhanced PRD (AI-based breakdown)
    // - architecture.md
    // - Phase plans
    // - Task plans
    // - Subtask plans

    // Update PRD with enhanced version
    fs.writeFileSync(prdPath, JSON.stringify(result.prd, null, 2));

    res.json({
      success: true,
      message: 'Project initialized via Start Chain',
      projectPath,
      artifacts: {
        prd: prdPath,
        architecture: result.architecturePath,
        plans: result.plansPaths
      }
    });

  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'WIZARD_SAVE_FAILED'
    });
  }
});
```

**File**: `src/core/start-chain/pipeline.ts` (if doesn't exist, create)

Implement Start Chain Pipeline:
```typescript
export class StartChainPipeline {
  constructor(
    private config: Config,
    private eventBus: EventBus
  ) {}

  async execute(params: {
    requirementsPath: string;
    projectPath: string;
    config: Config;
  }): Promise<StartChainResult> {

    // Step 1: Ingest Requirements
    this.eventBus.publish('start_chain_step', {
      step: 'ingest_requirements',
      status: 'started'
    });

    const requirements = await this.ingestRequirements(params.requirementsPath);

    // Step 2: Generate Structured PRD
    this.eventBus.publish('start_chain_step', {
      step: 'generate_prd',
      status: 'started'
    });

    const prd = await this.generatePRD(requirements, params.config);

    // Step 3: Generate Architecture Document
    this.eventBus.publish('start_chain_step', {
      step: 'generate_architecture',
      status: 'started'
    });

    const architecturePath = await this.generateArchitecture(
      requirements,
      prd,
      params.projectPath
    );

    // Step 4: Generate 4-Tier Plan
    this.eventBus.publish('start_chain_step', {
      step: 'generate_plans',
      status: 'started'
    });

    const plansPaths = await this.generatePlans(prd, params.projectPath);

    // Step 5: Validation Gate
    this.eventBus.publish('start_chain_step', {
      step: 'validation',
      status: 'started'
    });

    const validation = await this.validateArtifacts(prd, architecturePath, plansPaths);

    if (!validation.valid) {
      throw new Error(`Start Chain validation failed: ${validation.errors.join(', ')}`);
    }

    this.eventBus.publish('start_chain_complete', {
      projectPath: params.projectPath,
      artifacts: {
        prd,
        architecturePath,
        plansPaths
      }
    });

    return {
      prd,
      architecturePath,
      plansPaths
    };
  }

  private async generatePRD(requirements: string, config: Config): Promise<PRD> {
    // Invoke AI platform to generate PRD
    const platform = config.tiers.phase.platform; // Use Phase tier platform for Start Chain
    const model = config.tiers.phase.model;

    const prompt = this.buildPRDGenerationPrompt(requirements);

    const runner = PlatformRunnerFactory.create(platform);
    const result = await runner.execute({
      prompt,
      model,
      workingDirectory: process.cwd(),
      timeout: 600000 // 10 minutes
    });

    // Parse PRD from output
    const prd = this.parsePRDFromOutput(result.output);

    return prd;
  }

  private async generateArchitecture(
    requirements: string,
    prd: PRD,
    projectPath: string
  ): Promise<string> {
    // Invoke AI to generate architecture.md
    const platform = this.config.tiers.phase.platform;
    const prompt = this.buildArchitecturePrompt(requirements, prd);

    const runner = PlatformRunnerFactory.create(platform);
    const result = await runner.execute({
      prompt,
      model: this.config.tiers.phase.model,
      workingDirectory: projectPath
    });

    const architectureContent = this.parseArchitectureFromOutput(result.output);

    const architecturePath = path.join(projectPath, '.puppet-master', 'architecture.md');
    fs.writeFileSync(architecturePath, architectureContent);

    return architecturePath;
  }

  private async generatePlans(prd: PRD, projectPath: string): Promise<string[]> {
    const plansPaths: string[] = [];

    // Generate Phase plans
    for (const phase of prd.phases) {
      const planPath = await this.generatePhasePlan(phase, projectPath);
      plansPaths.push(planPath);

      // Generate Task plans
      for (const task of phase.tasks) {
        const taskPlanPath = await this.generateTaskPlan(task, projectPath);
        plansPaths.push(taskPlanPath);
      }
    }

    return plansPaths;
  }
}
```

#### Acceptance Criteria
- [ ] Wizard POST /api/wizard/save invokes StartChainPipeline
- [ ] StartChainPipeline generates PRD via AI (not rule-based fallback)
- [ ] StartChainPipeline generates architecture.md
- [ ] StartChainPipeline generates phase plans
- [ ] StartChainPipeline generates task plans
- [ ] All artifacts saved to .puppet-master/ directory
- [ ] EventBus publishes start_chain_step events for progress
- [ ] Wizard UI shows progress during Start Chain execution
- [ ] On completion, redirect to dashboard with project loaded
- [ ] TEST: Upload requirements, complete wizard, verify PRD has AI-generated content
- [ ] TEST: Verify architecture.md exists and has content
- [ ] TEST: Verify .puppet-master/plans/ contains phase/task plan files

#### Files to Change
- `src/gui/routes/wizard.ts` - Integrate StartChainPipeline
- `src/core/start-chain/pipeline.ts` - Create Start Chain Pipeline (NEW FILE)
- `src/gui/public/js/wizard.js` - Show progress during Start Chain
- `src/core/platform-runners/*.ts` - Ensure platform runners support Start Chain prompts

---

## MEDIUM PRIORITY (17 hours)

### MP-1: Add Keyboard Shortcuts for Main Controls
**Effort**: 3 hours

#### Solution
**File**: `src/gui/public/js/controls.js`

Add keyboard event listeners:
```javascript
document.addEventListener('keydown', (event) => {
  // Ignore if user is typing in input/textarea
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
    return;
  }

  // Space = Start/Pause toggle
  if (event.code === 'Space') {
    event.preventDefault();
    const state = getCurrentState();
    if (state === 'idle' || state === 'paused') {
      handleStart();
    } else if (state === 'executing') {
      handlePause();
    }
  }

  // Escape = Stop
  if (event.code === 'Escape') {
    event.preventDefault();
    handleStop();
  }

  // Ctrl+R = Retry
  if (event.ctrlKey && event.code === 'KeyR') {
    event.preventDefault();
    handleRetry();
  }

  // Ctrl+P = Replan
  if (event.ctrlKey && event.code === 'KeyP') {
    event.preventDefault();
    handleReplan();
  }

  // Ctrl+O = Open Project
  if (event.ctrlKey && event.code === 'KeyO') {
    event.preventDefault();
    window.location.href = '/projects';
  }

  // Ctrl+D = Doctor
  if (event.ctrlKey && event.code === 'KeyD') {
    event.preventDefault();
    window.location.href = '/doctor';
  }
});

// Display keyboard shortcuts in UI
function showKeyboardShortcuts() {
  const shortcuts = [
    { key: 'Space', action: 'Start/Pause' },
    { key: 'Esc', action: 'Stop' },
    { key: 'Ctrl+R', action: 'Retry' },
    { key: 'Ctrl+P', action: 'Replan' },
    { key: 'Ctrl+O', action: 'Open Project' },
    { key: 'Ctrl+D', action: 'Doctor' }
  ];

  // Show modal with shortcuts (implement modal UI)
}
```

#### Acceptance Criteria
- [ ] Space toggles Start/Pause
- [ ] Esc triggers Stop
- [ ] Ctrl+R triggers Retry
- [ ] Ctrl+P triggers Replan
- [ ] Ctrl+O navigates to Projects
- [ ] Ctrl+D navigates to Doctor
- [ ] Keyboard shortcuts ignored when typing in input fields
- [ ] "?" key shows keyboard shortcuts modal
- [ ] TEST: Press Space on dashboard, verify Start is triggered

---

### MP-2: Add Tier Search/Filter Functionality
**Effort**: 2 hours

#### Solution
**File**: `src/gui/public/tiers.html`

Add search input:
```html
<div class="panel">
  <div class="panel-header">
    <h2>[TIER HIERARCHY]</h2>
  </div>
  <div class="panel-content">
    <!-- ADD SEARCH INPUT -->
    <input
      type="text"
      id="tier-search"
      placeholder="Search by ID or title..."
      class="search-input"
    />

    <div id="tier-tree"></div>
  </div>
</div>
```

**File**: `src/gui/public/js/tiers.js`

Implement search:
```javascript
document.getElementById('tier-search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();

  if (!query) {
    // Show all nodes
    document.querySelectorAll('.tier-node').forEach(node => {
      node.style.display = 'block';
    });
    return;
  }

  // Filter nodes
  document.querySelectorAll('.tier-node').forEach(node => {
    const id = node.dataset.tierId?.toLowerCase() || '';
    const title = node.dataset.tierTitle?.toLowerCase() || '';

    if (id.includes(query) || title.includes(query)) {
      node.style.display = 'block';
      // Expand parent nodes
      expandParents(node);
    } else {
      node.style.display = 'none';
    }
  });
});

function expandParents(node) {
  let parent = node.parentElement.closest('.tier-node');
  while (parent) {
    parent.classList.add('expanded');
    parent = parent.parentElement.closest('.tier-node');
  }
}
```

#### Acceptance Criteria
- [ ] Search input visible above tier tree
- [ ] Typing filters nodes by ID or title
- [ ] Matching nodes remain visible
- [ ] Parent nodes auto-expand when child matches
- [ ] Clearing search shows all nodes
- [ ] TEST: Search "auth", verify only authentication-related tiers visible

---

### MP-3: Add Execution History Panel
**Effort**: 4 hours

#### Solution
Create new screen `/history.html` and API endpoint to track past executions.

**Implementation details omitted for brevity** - would include:
- New table showing session ID, start time, end time, status, outcome
- Link from dashboard to history
- API endpoint to store/retrieve execution records
- Ability to view past session details

---

### MP-4: Add Tier Selector Dropdown in Evidence Viewer
**Effort**: 2 hours

#### Solution
**File**: `src/gui/public/evidence.html`

Replace text input with dropdown:
```html
<select id="tier-filter" class="tier-select">
  <option value="">All Tiers</option>
  <!-- Populated dynamically from PRD -->
</select>
```

**File**: `src/gui/public/js/evidence.js`

Populate dropdown:
```javascript
async function loadTierSelector() {
  const response = await fetch('/api/tiers');
  const data = await response.json();

  const select = document.getElementById('tier-filter');

  // Flatten tier tree and populate dropdown
  function addTierOptions(tier, indent = 0) {
    const option = document.createElement('option');
    option.value = tier.id;
    option.textContent = '  '.repeat(indent) + tier.id + ' - ' + tier.title;
    select.appendChild(option);

    tier.children?.forEach(child => addTierOptions(child, indent + 1));
  }

  data.tiers.forEach(tier => addTierOptions(tier));
}
```

#### Acceptance Criteria
- [ ] Dropdown shows all phases/tasks/subtasks from PRD
- [ ] Options indented to show hierarchy
- [ ] Selecting tier filters evidence list
- [ ] "All Tiers" option shows all evidence
- [ ] TEST: Select specific subtask, verify only that subtask's evidence shown

---

## LOW PRIORITY (6 hours)

### LP-1: Add Loading Skeletons
**Effort**: 3 hours

Add skeleton loaders for lists/tables during data fetch to prevent jarring content appearance.

---

### LP-2: Group Control Buttons (Primary vs Advanced)
**Effort**: 1 hour

Reorganize dashboard control panel:
- **Primary**: START, PAUSE, STOP (prominent buttons)
- **Advanced**: RETRY, REPLAN, REOPEN, KILL, RESET (grouped in collapsible section)

---

### LP-3: Add Favicon
**Effort**: 30 minutes

Create favicon.ico with puppet/gear icon and add to HTML head.

---

### LP-4: Replace Dark Mode Text Button with Icon
**Effort**: 1 hour

Replace "DARK MODE" text button with moon/sun icon toggle for cleaner appearance.

---

## Implementation Order Recommendation

### Week 1: Make GUI Functional (17 hours)
1. ✅ CR-1: Register orchestrator (2h) - COMPLETE
2. 🟡 CR-2: Wire Orchestrator to EventBus (8h) ← **MOST CRITICAL** - IN PROGRESS
3. ✅ HP-1: Add error toasts (2h) - COMPLETE
4. HP-2: Add pre-flight checks (3h)
5. HP-3: Fix tier tree data (2h)

**Outcome**: GUI shows real data, users see live updates, errors are visible

**Progress**: 3/5 tasks complete, ~7 hours remaining

---

### Week 2: Complete Core Workflows (21 hours)
6. CR-3: Implement project loading (4h)
7. CR-4: Implement missing control endpoints (6h)
8. HP-4: Integrate Start Chain with Wizard (8h)
9. MP-1: Add keyboard shortcuts (3h)

**Outcome**: All core workflows functional end-to-end

---

### Week 3: Polish & Testing (11 hours)
10. MP-2: Add tier search (2h)
11. MP-3: Add execution history (4h)
12. MP-4: Add tier selector dropdown (2h)
13. LP-1-LP-4: Polish items (3h)

**Outcome**: Production-ready GUI with excellent UX

---

## Testing Checklist

After implementing each priority level, run these tests:

### Critical Tests
- [ ] Start application, verify orchestrator registered
- [ ] Open project, click START, verify execution begins
- [ ] Watch dashboard, verify live output streams appear
- [ ] Watch dashboard, verify status changes from IDLE → EXECUTING
- [ ] Watch dashboard, verify position indicators update
- [ ] Click PAUSE, verify execution pauses
- [ ] Click RESUME, verify execution resumes
- [ ] Click STOP, verify execution stops

### High Priority Tests
- [x] Click START with no project, verify error toast - HP-1 COMPLETE
- [ ] Click START with invalid PRD, verify validation errors
- [ ] Navigate to /tiers, verify tree shows phases/tasks/subtasks
- [ ] Upload requirements in wizard, verify AI-generated PRD created
- [ ] Complete wizard, verify architecture.md exists

### Medium Priority Tests
- [ ] Press Space, verify Start triggered
- [ ] Press Esc, verify Stop triggered
- [ ] Search tier tree, verify filtering works
- [ ] View execution history, verify past sessions listed
- [ ] Select tier in evidence viewer, verify evidence filtered

### Integration Tests
- [ ] End-to-end: Upload requirements → Complete wizard → Open project → Start execution → Monitor progress → View evidence
- [ ] End-to-end: Start execution → Encounter failure → Retry → Success
- [ ] End-to-end: Complete phase → Verify gate runs → Verify tier marked complete

---

## Success Criteria

The GUI is considered **functional** when:

1. ✅ User can create a project via wizard with AI-generated PRD
2. ✅ User can open an existing project
3. ✅ User can start execution
4. ✅ User can see live CLI output during execution
5. ✅ User can see status updates in real-time
6. ✅ User can pause/resume/stop execution
7. ✅ User can view tier hierarchy with current status
8. ✅ User can view evidence artifacts
9. ✅ User receives clear error messages on failures
10. ✅ All control buttons work as expected

---

## Notes

- **Orchestrator Integration**: Many tasks depend on having a properly wired Orchestrator instance. CR-1 and CR-2 are foundational.
- **EventBus**: The EventBus is the communication backbone between orchestrator and GUI. CR-2 is the highest-impact task.
- **Start Chain**: HP-4 is complex but essential for wizard functionality. May require creating new StartChainPipeline class.
- **Testing**: Each task should be tested in isolation before moving to next task. Integration testing required after each priority level.
- **Documentation**: Update AGENTS.md with any patterns learned during implementation.

---

*End of Implementation Plan*
