# RWM Puppet Master — BUILD_QUEUE_PHASE_9.md

> Phase 9: GUI Implementation  
> Tasks: 12  
> Focus: Browser interface per GUI_SPEC.md

---

## Phase Overview

This phase implements the web-based GUI:
- Express server with WebSocket
- REST API endpoints
- Real-time event streaming
- Dashboard and configuration screens
- Tier visualization and run controls

### Parallel Groups

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | PH9-T01 | Phase 8 complete |
| Sequential | PH9-T02 | PH9-T01 |
| Sequential | PH9-T03 | PH9-T02 |
| Parallel Group A | PH9-T04, PH9-T05 | PH9-T03 |
| Parallel Group B | PH9-T06, PH9-T07, PH9-T08 | PH9-T04, PH9-T05 |
| Parallel Group C | PH9-T09, PH9-T10 | PH9-T06, PH9-T07, PH9-T08 |
| Sequential | PH9-T11 | PH9-T09, PH9-T10 |
| Sequential | PH9-T12 | PH9-T11 |

---

## PH9-T01: GUI Server Setup

### Title
Implement Express server with WebSocket

### Goal
Create the foundational GUI server infrastructure.

### Depends on
- Phase 8 complete

### Parallelizable with
- none (foundational)

### Recommended model quality
Medium OK — server setup

### Read first
- GUI_SPEC.md: Section 2 (Architecture)

### Files to create/modify
- `src/gui/server.ts`
- `src/gui/server.test.ts`
- `src/gui/index.ts`
- `package.json` (add express, ws dependencies)

### Implementation notes
- Express for HTTP endpoints
- WebSocket for real-time updates
- CORS support for local development

### Acceptance criteria
- [ ] Express server starts on configurable port
- [ ] WebSocket server attached
- [ ] CORS enabled for localhost
- [ ] Health endpoint works
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "GUI Server"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement GUI server for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH9-T01)
- Follow GUI_SPEC.md Section 2

1. Install dependencies:
   - express: ^4.18.0
   - ws: ^8.14.0
   - @types/express: ^4.17.0 (devDependency)
   - @types/ws: ^8.5.0 (devDependency)
   - cors: ^2.8.5
   - @types/cors: ^2.8.0 (devDependency)

Create src/gui/server.ts:

1. ServerConfig interface:
   - port: number (default: 3847)
   - host: string (default: 'localhost')
   - corsOrigins: string[]

2. GuiServer class:
   - constructor(config: ServerConfig, eventBus: EventBus)
   - private app: Express
   - private server: http.Server
   - private wss: WebSocketServer
   - private clients: Set<WebSocket>
   - async start(): Promise<void>
   - stop(): Promise<void>
   - broadcast(event: PuppetMasterEvent): void
   - getUrl(): string

3. Basic routes:
   - GET /health → { status: 'ok', version: '0.1.0' }
   - GET /api/status → current orchestrator status

4. WebSocket:
   - On connection: add to clients
   - On disconnect: remove from clients
   - Forward EventBus events to all clients

5. Create src/gui/server.test.ts:
   - Test server starts
   - Test health endpoint
   - Test WebSocket connection
   - Test broadcast

6. Create src/gui/index.ts:
   export { GuiServer } from './server.js';

After implementation, run:
- npm test -- -t "GUI Server"

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

## PH9-T02: State API Endpoints

### Title
Implement REST API for state queries

### Goal
Create API endpoints for querying orchestrator state.

### Depends on
- PH9-T01

### Parallelizable with
- none

### Recommended model quality
Medium OK — REST API

### Read first
- GUI_SPEC.md: Section 3 (API Endpoints)

### Files to create/modify
- `src/gui/routes/state.ts`
- `src/gui/routes/state.test.ts`
- `src/gui/routes/index.ts`

### Implementation notes
- RESTful endpoints for state
- JSON responses
- Error handling middleware

### Acceptance criteria
- [ ] GET /api/state returns current state
- [ ] GET /api/tiers returns tier hierarchy
- [ ] GET /api/tiers/:id returns specific tier
- [ ] GET /api/progress returns recent progress
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "State API"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement state API endpoints for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T02)
- Follow GUI_SPEC.md Section 3

Create src/gui/routes/state.ts:

1. createStateRoutes function:
   function createStateRoutes(
     tierManager: TierStateManager,
     orchestrator: OrchestratorStateMachine,
     progressManager: ProgressManager
   ): Router

2. Endpoints:

   GET /api/state
   Response: {
     orchestratorState: OrchestratorState,
     currentPhaseId: string | null,
     currentTaskId: string | null,
     currentSubtaskId: string | null,
     completionStats: { total, passed, failed, pending }
   }

   GET /api/tiers
   Response: {
     root: TierNode (serialized hierarchy)
   }

   GET /api/tiers/:id
   Response: {
     tier: TierNode,
     path: string[],
     children: TierNode[]
   }

   GET /api/progress
   Query: ?limit=10
   Response: {
     entries: ProgressEntry[]
   }

   GET /api/agents
   Response: {
     document: AgentsDocument
   }

3. Error handling:
   - 404 for not found tier
   - 500 for internal errors
   - Consistent error format: { error: string, code: string }

4. Create src/gui/routes/state.test.ts:
   - Test each endpoint
   - Test error cases
   - Use supertest for HTTP testing

5. Create src/gui/routes/index.ts:
   export { createStateRoutes } from './state.js';

After implementation, run:
- npm test -- -t "State API"

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

## PH9-T03: WebSocket Event Streaming

### Title
Implement WebSocket event streaming

### Goal
Stream real-time events to connected clients.

### Depends on
- PH9-T02

### Parallelizable with
- none

### Recommended model quality
Medium OK — WebSocket handling

### Read first
- GUI_SPEC.md: Section 4 (WebSocket Events)

### Files to create/modify
- `src/gui/websocket/event-streamer.ts`
- `src/gui/websocket/event-streamer.test.ts`
- `src/gui/websocket/index.ts`

### Implementation notes
- Subscribe to EventBus
- Serialize events for transmission
- Handle client subscriptions

### Acceptance criteria
- [ ] EventStreamer class implemented
- [ ] Subscribes to EventBus
- [ ] Broadcasts to WebSocket clients
- [ ] Clients can filter events
- [ ] Tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "EventStreamer"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement WebSocket event streaming for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T03)
- Follow GUI_SPEC.md Section 4

Create src/gui/websocket/event-streamer.ts:

1. ClientSubscription interface:
   - clientId: string
   - ws: WebSocket
   - filters: PuppetMasterEvent['type'][]

2. WebSocketMessage interface:
   - type: 'event' | 'subscribe' | 'unsubscribe' | 'ping' | 'pong'
   - payload: unknown

3. EventStreamer class:
   - constructor(wss: WebSocketServer, eventBus: EventBus)
   - private clients: Map<string, ClientSubscription>
   - start(): void
   - stop(): void
   - handleConnection(ws: WebSocket): void
   - handleMessage(clientId: string, message: WebSocketMessage): void
   - broadcast(event: PuppetMasterEvent): void
   - sendToClient(clientId: string, message: WebSocketMessage): void

4. Client messages:
   - { type: 'subscribe', payload: { events: ['state_changed', 'iteration_started'] } }
   - { type: 'unsubscribe', payload: { events: ['output_chunk'] } }
   - { type: 'ping' } → responds with { type: 'pong' }

5. Server messages:
   - { type: 'event', payload: PuppetMasterEvent }

6. Heartbeat:
   - Send ping every 30 seconds
   - Close connection if no pong in 10 seconds

7. Create src/gui/websocket/event-streamer.test.ts:
   - Test client connection
   - Test subscription filtering
   - Test event broadcast
   - Test heartbeat

8. Create src/gui/websocket/index.ts:
   export { EventStreamer } from './event-streamer.js';

After implementation, run:
- npm test -- -t "EventStreamer"

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

## PH9-T04: Dashboard Screen

### Title
Implement dashboard HTML/JS

### Goal
Create the main dashboard view.

### Depends on
- PH9-T03

### Parallelizable with
- PH9-T05

### Recommended model quality
Medium OK — frontend implementation

### Read first
- GUI_SPEC.md: Section 5.1 (Dashboard)

### Files to create/modify
- `src/gui/public/index.html`
- `src/gui/public/js/dashboard.js`
- `src/gui/public/css/styles.css`

### Implementation notes
- Single HTML page
- Vanilla JS (no framework)
- CSS for styling
- WebSocket connection for updates

### Acceptance criteria
- [ ] Dashboard HTML created
- [ ] Shows orchestrator state
- [ ] Shows tier progress overview
- [ ] Updates in real-time via WebSocket
- [ ] Responsive layout
- [ ] Manual testing passes

### Tests to run
```bash
# Manual testing - start server and open browser
npm run gui
# Open http://localhost:3847
```

### Evidence to record
- Screenshot of dashboard

### Cursor Agent Prompt
```
Implement dashboard for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T04)
- Follow GUI_SPEC.md Section 5.1
- Use vanilla JS (no frameworks)

Create src/gui/public/index.html:

1. Structure:
   <!DOCTYPE html>
   <html>
   <head>
     <title>Puppet Master</title>
     <link rel="stylesheet" href="/css/styles.css">
   </head>
   <body>
     <header>
       <h1>Puppet Master Dashboard</h1>
       <div id="connection-status">Disconnected</div>
     </header>
     <main>
       <section id="state-panel">
         <h2>Orchestrator State</h2>
         <div id="current-state">IDLE</div>
       </section>
       <section id="progress-panel">
         <h2>Progress</h2>
         <div id="progress-stats">
           <span id="phases-complete">0/0 Phases</span>
           <span id="tasks-complete">0/0 Tasks</span>
           <span id="subtasks-complete">0/0 Subtasks</span>
         </div>
         <div id="progress-bar"></div>
       </section>
       <section id="current-work">
         <h2>Current Work</h2>
         <div id="current-tier-info"></div>
       </section>
       <section id="recent-activity">
         <h2>Recent Activity</h2>
         <ul id="activity-list"></ul>
       </section>
     </main>
     <script src="/js/dashboard.js"></script>
   </body>
   </html>

Create src/gui/public/js/dashboard.js:

1. WebSocket connection management
2. State fetching and display
3. Real-time update handling
4. Activity list updates

Create src/gui/public/css/styles.css:

1. Clean, minimal styling
2. State colors (idle=gray, executing=blue, paused=yellow, error=red, complete=green)
3. Progress bar styling
4. Responsive grid layout

Add static file serving to server.ts:
   app.use(express.static(path.join(__dirname, 'public')));

After implementation:
- Start server: npm run gui
- Open http://localhost:3847
- Verify dashboard displays
- Take screenshot for evidence

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

## PH9-T05: Project Select Screen

### Title
Implement project selection screen

### Goal
Create screen for selecting/creating projects.

### Depends on
- PH9-T03

### Parallelizable with
- PH9-T04

### Recommended model quality
Medium OK — frontend implementation

### Read first
- GUI_SPEC.md: Section 5.2 (Project Select)

### Files to create/modify
- `src/gui/public/projects.html`
- `src/gui/public/js/projects.js`
- `src/gui/routes/projects.ts`

### Implementation notes
- List available projects
- Create new project
- Open existing project

### Acceptance criteria
- [ ] Projects page created
- [ ] Lists projects in current directory
- [ ] Can create new project
- [ ] Can select project to open
- [ ] Navigation to dashboard works
- [ ] Manual testing passes

### Tests to run
```bash
npm test -- -t "Projects API"
# Manual testing
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement project selection screen for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T05)
- Follow GUI_SPEC.md Section 5.2

Create src/gui/routes/projects.ts:

1. Endpoints:

   GET /api/projects
   Response: {
     projects: [
       { name: string, path: string, lastModified: string, hasConfig: boolean }
     ]
   }

   POST /api/projects
   Body: { name: string, path: string }
   Response: { success: boolean, project: Project }

   POST /api/projects/open
   Body: { path: string }
   Response: { success: boolean }

Create src/gui/public/projects.html:

1. Structure:
   - Header with "Puppet Master"
   - Project list section
   - Create project form
   - Recent projects section

Create src/gui/public/js/projects.js:

1. Functions:
   - loadProjects(): Fetch and display project list
   - createProject(name): Create new project
   - openProject(path): Navigate to dashboard

2. Project card display:
   - Project name
   - Last modified date
   - Open button
   - Status indicator (configured/not configured)

Add routes to server.ts

After implementation:
- Start server
- Navigate to /projects.html
- Test listing, creating, opening projects

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

## PH9-T06: Start Chain Wizard

### Title
Implement start chain wizard UI

### Goal
Create wizard for running start chain from GUI.

### Depends on
- PH9-T04, PH9-T05

### Parallelizable with
- PH9-T07, PH9-T08

### Recommended model quality
Medium OK — multi-step UI

### Read first
- GUI_SPEC.md: Section 5.3 (Start Chain Wizard)

### Files to create/modify
- `src/gui/public/wizard.html`
- `src/gui/public/js/wizard.js`
- `src/gui/routes/wizard.ts`

### Implementation notes
- Multi-step wizard
- File upload for requirements
- Preview generated PRD

### Acceptance criteria
- [ ] Wizard page created
- [ ] Step 1: Upload requirements file
- [ ] Step 2: Preview parsed requirements
- [ ] Step 3: Review generated PRD
- [ ] Step 4: Confirm and save
- [ ] API endpoints work
- [ ] Manual testing passes

### Tests to run
```bash
npm test -- -t "Wizard API"
# Manual testing
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement start chain wizard for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T06)
- Follow GUI_SPEC.md Section 5.3

Create src/gui/routes/wizard.ts:

1. Endpoints:

   POST /api/wizard/upload
   Body: multipart/form-data with file
   Response: { parsed: ParsedRequirements }

   POST /api/wizard/generate
   Body: { parsed: ParsedRequirements }
   Response: { prd: PRD, architecture: string, tierPlan: TierPlan }

   POST /api/wizard/validate
   Body: { prd: PRD, architecture: string, tierPlan: TierPlan }
   Response: { valid: boolean, errors: string[], warnings: string[] }

   POST /api/wizard/save
   Body: { prd: PRD, architecture: string, tierPlan: TierPlan }
   Response: { success: boolean }

Create src/gui/public/wizard.html:

1. Structure:
   - Step indicator (1, 2, 3, 4)
   - Step 1: File upload dropzone
   - Step 2: Parsed preview (readonly)
   - Step 3: Generated PRD preview with edit option
   - Step 4: Confirmation and save

Create src/gui/public/js/wizard.js:

1. State management:
   - currentStep
   - uploadedFile
   - parsedRequirements
   - generatedPrd
   - validationResult

2. Functions:
   - handleFileUpload(file)
   - parseRequirements()
   - generatePrd()
   - validate()
   - save()
   - nextStep() / prevStep()

3. File upload:
   - Support drag-and-drop
   - Support click to select
   - Show file name and size

After implementation:
- Start server
- Navigate to /wizard.html
- Test full wizard flow

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

## PH9-T07: Configuration Screen

### Title
Implement configuration editor screen

### Goal
Create screen for editing config.yaml via GUI.

### Depends on
- PH9-T04, PH9-T05

### Parallelizable with
- PH9-T06, PH9-T08

### Recommended model quality
Medium OK — form handling

### Read first
- GUI_SPEC.md: Section 5.4 (Configuration)

### Files to create/modify
- `src/gui/public/config.html`
- `src/gui/public/js/config.js`
- `src/gui/routes/config.ts`

### Implementation notes
- Form-based config editor
- Validation before save
- Sections for different config areas

### Acceptance criteria
- [ ] Config page created
- [ ] Loads current config
- [ ] Editable form fields
- [ ] Validation on save
- [ ] Save updates config.yaml
- [ ] Manual testing passes

### Tests to run
```bash
npm test -- -t "Config API"
# Manual testing
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement configuration screen for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T07)
- Follow GUI_SPEC.md Section 5.4

Create src/gui/routes/config.ts:

1. Endpoints:

   GET /api/config
   Response: { config: PuppetMasterConfig }

   PUT /api/config
   Body: { config: PuppetMasterConfig }
   Response: { success: boolean, errors?: string[] }

   POST /api/config/validate
   Body: { config: PuppetMasterConfig }
   Response: { valid: boolean, errors: string[] }

Create src/gui/public/config.html:

1. Structure:
   - Section: Project Settings
     - Project name
     - Working directory
   - Section: Tier Configuration
     - Phase/Task/Subtask/Iteration settings
     - Platform selection dropdowns
     - Model selection
     - Max iterations
   - Section: Branching
     - Granularity selection
     - Push/merge policies
   - Section: Budgets
     - Per-platform limits
     - Enforcement options
   - Save button

Create src/gui/public/js/config.js:

1. Functions:
   - loadConfig(): Fetch and populate form
   - validateConfig(): Client-side validation
   - saveConfig(): Submit to API
   - renderTierConfig(tier): Generate tier form section

2. Form handling:
   - Two-way binding (form ↔ config object)
   - Change tracking (highlight unsaved changes)
   - Validation feedback

After implementation:
- Start server
- Navigate to /config.html
- Test loading, editing, saving config

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

## PH9-T08: Tier Views

### Title
Implement tier hierarchy visualization

### Goal
Create visual representation of tier hierarchy.

### Depends on
- PH9-T04, PH9-T05

### Parallelizable with
- PH9-T06, PH9-T07

### Recommended model quality
Medium OK — visualization

### Read first
- GUI_SPEC.md: Section 5.5 (Tier Views)

### Files to create/modify
- `src/gui/public/tiers.html`
- `src/gui/public/js/tiers.js`
- `src/gui/public/css/tiers.css`

### Implementation notes
- Tree view of phases/tasks/subtasks
- Color-coded by state
- Expandable/collapsible nodes
- Click to view details

### Acceptance criteria
- [ ] Tiers page created
- [ ] Displays hierarchy tree
- [ ] Color-coded by state
- [ ] Expandable nodes
- [ ] Click shows details panel
- [ ] Manual testing passes

### Tests to run
```bash
# Manual testing
```

### Evidence to record
- Screenshot of tier view

### Cursor Agent Prompt
```
Implement tier hierarchy visualization for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T08)
- Follow GUI_SPEC.md Section 5.5

Create src/gui/public/tiers.html:

1. Structure:
   - Header with back navigation
   - Tree view container
   - Details panel (slides in from right)

Create src/gui/public/js/tiers.js:

1. Tree rendering:
   function renderTree(root: TierNode): HTMLElement
   - Recursive rendering
   - Indent children
   - Expand/collapse icons

2. Node component:
   function renderNode(node: TierNode): HTMLElement
   - State indicator (colored dot)
   - Title
   - Iteration count
   - Expand/collapse button

3. Details panel:
   function showDetails(node: TierNode)
   - Full title
   - State with history
   - Acceptance criteria list
   - Test plan list
   - Iteration history

4. Real-time updates:
   - WebSocket subscription
   - Update node colors on state change
   - Highlight currently executing

Create src/gui/public/css/tiers.css:

1. Tree styling:
   - Indentation for hierarchy
   - Connection lines (optional)
   - Hover effects

2. State colors:
   - PENDING: gray
   - PLANNING: blue
   - RUNNING: yellow
   - GATING: orange
   - PASSED: green
   - FAILED: red
   - ESCALATED: purple

3. Details panel:
   - Slide-in animation
   - Fixed width
   - Scrollable content

After implementation:
- Start server with test data
- Navigate to /tiers.html
- Test tree rendering and interaction
- Take screenshot for evidence

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

## PH9-T09: Evidence Viewer

### Title
Implement evidence artifact viewer

### Goal
Create viewer for test logs, screenshots, and other evidence.

### Depends on
- PH9-T06, PH9-T07, PH9-T08

### Parallelizable with
- PH9-T10

### Recommended model quality
Medium OK — file viewer

### Read first
- GUI_SPEC.md: Section 5.6 (Evidence Viewer)

### Files to create/modify
- `src/gui/public/evidence.html`
- `src/gui/public/js/evidence.js`
- `src/gui/routes/evidence.ts`

### Implementation notes
- List evidence by type
- Preview text and images
- Download option

### Acceptance criteria
- [ ] Evidence page created
- [ ] Lists evidence by type/tier
- [ ] Text preview for logs
- [ ] Image preview for screenshots
- [ ] Download links work
- [ ] Manual testing passes

### Tests to run
```bash
npm test -- -t "Evidence API"
# Manual testing
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement evidence viewer for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T09)
- Follow GUI_SPEC.md Section 5.6

Create src/gui/routes/evidence.ts:

1. Endpoints:

   GET /api/evidence
   Query: ?type=test-logs&tierId=PH-001-T01
   Response: {
     artifacts: [
       { name: string, type: EvidenceType, tierId: string, path: string, size: number, createdAt: string }
     ]
   }

   GET /api/evidence/:type/:name
   Response: File content (text or binary)

Create src/gui/public/evidence.html:

1. Structure:
   - Filters: Type dropdown, Tier search
   - Evidence list table
   - Preview panel

Create src/gui/public/js/evidence.js:

1. Functions:
   - loadEvidence(filters): Fetch evidence list
   - previewFile(artifact): Show in preview panel
   - downloadFile(artifact): Trigger download

2. Preview handling:
   - Text files (.log, .txt): Syntax-highlighted code view
   - Images (.png, .jpg): Image display
   - JSON: Pretty-printed
   - Other: Download only

3. Filtering:
   - By type (dropdown)
   - By tier ID (text search)
   - By date range

Styling:
   - Table with sortable columns
   - Preview panel with tabs (if multiple files)
   - Syntax highlighting for logs

After implementation:
- Create test evidence files
- Start server
- Navigate to /evidence.html
- Test filtering and preview

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

## PH9-T10: Run Controls

### Title
Implement execution controls

### Goal
Create UI for starting, pausing, and stopping execution.

### Depends on
- PH9-T06, PH9-T07, PH9-T08

### Parallelizable with
- PH9-T09

### Recommended model quality
Medium OK — control UI

### Read first
- GUI_SPEC.md: Section 5.7 (Run Controls)

### Files to create/modify
- `src/gui/public/js/controls.js`
- `src/gui/routes/controls.ts`
- Update dashboard.html

### Implementation notes
- Start/Pause/Resume/Stop buttons
- Confirmation dialogs
- Status feedback

### Acceptance criteria
- [ ] Control buttons on dashboard
- [ ] Start begins execution
- [ ] Pause pauses execution
- [ ] Resume continues
- [ ] Stop ends execution
- [ ] Confirmation for destructive actions
- [ ] Manual testing passes

### Tests to run
```bash
npm test -- -t "Controls API"
# Manual testing
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement run controls for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T10)
- Follow GUI_SPEC.md Section 5.7

Create src/gui/routes/controls.ts:

1. Endpoints:

   POST /api/controls/start
   Body: { fromCheckpoint?: string }
   Response: { success: boolean, sessionId: string }

   POST /api/controls/pause
   Response: { success: boolean }

   POST /api/controls/resume
   Response: { success: boolean }

   POST /api/controls/stop
   Body: { force?: boolean }
   Response: { success: boolean }

   POST /api/controls/reset
   Response: { success: boolean }

Create src/gui/public/js/controls.js:

1. Control functions:
   - startExecution(): POST /api/controls/start
   - pauseExecution(): POST /api/controls/pause
   - resumeExecution(): POST /api/controls/resume
   - stopExecution(): POST /api/controls/stop
   - resetExecution(): POST /api/controls/reset

2. Button state management:
   - IDLE: [Start] enabled, others disabled
   - EXECUTING: [Pause] [Stop] enabled
   - PAUSED: [Resume] [Stop] enabled
   - ERROR/COMPLETE: [Reset] enabled

3. Confirmation dialogs:
   - Stop: "Are you sure? This will abort current work."
   - Reset: "This will clear all progress. Continue?"

4. Feedback:
   - Show spinner during action
   - Toast notification on success/error
   - Update button states from WebSocket events

Update src/gui/public/index.html:
   - Add control bar with buttons
   - Style buttons appropriately

After implementation:
- Start server
- Test control flow with mock orchestrator
- Verify button states update correctly

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

## PH9-T11: Doctor Screen

### Title
Implement doctor check UI

### Goal
Create UI for running and displaying doctor checks.

### Depends on
- PH9-T09, PH9-T10

### Parallelizable with
- none

### Recommended model quality
Fast OK — display UI

### Read first
- GUI_SPEC.md: Section 5.8 (Doctor)

### Files to create/modify
- `src/gui/public/doctor.html`
- `src/gui/public/js/doctor.js`
- `src/gui/routes/doctor.ts`

### Implementation notes
- Run checks from UI
- Display results with pass/fail
- Show fix suggestions

### Acceptance criteria
- [ ] Doctor page created
- [ ] Run All button works
- [ ] Results displayed with icons
- [ ] Failed checks show suggestions
- [ ] Fix buttons trigger installation
- [ ] Manual testing passes

### Tests to run
```bash
# Manual testing
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Implement doctor screen for RWM Puppet Master GUI.

CONSTRAINTS:
- Implement ONLY this task (PH9-T11)
- Follow GUI_SPEC.md Section 5.8

Create src/gui/routes/doctor.ts:

1. Endpoints:

   GET /api/doctor/checks
   Response: {
     checks: [{ name, category, description }]
   }

   POST /api/doctor/run
   Body: { checks?: string[], category?: string }
   Response: {
     results: CheckResult[]
   }

   POST /api/doctor/fix
   Body: { checkName: string }
   Response: { success: boolean, output?: string }

Create src/gui/public/doctor.html:

1. Structure:
   - Run All button
   - Category filter buttons
   - Results table
   - Summary bar (X/Y passed)

Create src/gui/public/js/doctor.js:

1. Functions:
   - loadChecks(): Get available checks
   - runChecks(filter?): Run and display results
   - attemptFix(checkName): Run fix command
   - renderResult(result): Create result row

2. Result display:
   - ✓ (green) for passed
   - ✗ (red) for failed
   - Duration
   - Details (expandable)
   - Fix button (if available)

3. Category filtering:
   - All | CLI | Git | Runtime | Project

4. Progress:
   - Show spinner while running
   - Update results as they complete

Styling:
   - Clean table layout
   - Color-coded results
   - Expandable detail rows

After implementation:
- Start server
- Navigate to /doctor.html
- Run checks and verify display

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

## PH9-T12: GUI Integration Test

### Title
Create GUI integration tests

### Goal
Verify full GUI functionality end-to-end.

### Depends on
- PH9-T11

### Parallelizable with
- none

### Recommended model quality
Medium OK — test implementation

### Read first
- All PH9 tasks

### Files to create/modify
- `src/gui/gui.integration.test.ts`

### Implementation notes
- Test server startup
- Test all API endpoints
- Test WebSocket connection
- Test static file serving

### Acceptance criteria
- [ ] Integration test file created
- [ ] Server starts correctly
- [ ] All API endpoints return valid data
- [ ] WebSocket connects and receives events
- [ ] Static files served correctly
- [ ] All integration tests pass
- [ ] `npm test` passes

### Tests to run
```bash
npm test -- -t "gui.integration"
```

### Evidence to record
- none

### Cursor Agent Prompt
```
Create GUI integration tests for RWM Puppet Master.

CONSTRAINTS:
- Implement ONLY this task (PH9-T12)
- Test full GUI functionality

Create src/gui/gui.integration.test.ts:

1. Test: "server starts and responds to health check"
   - Start GuiServer
   - GET /health
   - Verify response

2. Test: "serves static files"
   - GET /index.html
   - Verify HTML response
   - GET /css/styles.css
   - Verify CSS response

3. Test: "state API endpoints work"
   - GET /api/state
   - GET /api/tiers
   - GET /api/progress
   - Verify responses match expected structure

4. Test: "config API endpoints work"
   - GET /api/config
   - PUT /api/config (valid)
   - PUT /api/config (invalid) → error

5. Test: "WebSocket connection and events"
   - Connect to WebSocket
   - Subscribe to events
   - Trigger event via EventBus
   - Verify event received

6. Test: "control endpoints work"
   - POST /api/controls/start
   - POST /api/controls/pause
   - POST /api/controls/stop
   - Verify state changes

7. Test: "doctor endpoints work"
   - GET /api/doctor/checks
   - POST /api/doctor/run
   - Verify results

8. Helpers:
   - startTestServer(): Start server on random port
   - stopTestServer(): Clean shutdown
   - createTestOrchestrator(): Mock orchestrator

Use supertest for HTTP testing
Use ws client for WebSocket testing

After implementation, run:
- npm test -- -t "gui.integration"

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

## Phase 9 Completion Checklist

Before marking Phase 9 complete:

- [ ] All 12 tasks have PASS status
- [ ] Server starts correctly
- [ ] All API endpoints work
- [ ] WebSocket streams events
- [ ] Dashboard displays correctly
- [ ] Project selection works
- [ ] Start chain wizard completes
- [ ] Configuration editor saves
- [ ] Tier view renders hierarchy
- [ ] Evidence viewer displays files
- [ ] Run controls work
- [ ] Doctor screen runs checks
- [ ] Integration tests pass
- [ ] `npm test` passes all Phase 9 tests

### Phase 9 Stop Point

When complete, commit:
```bash
git add .
git commit -m "ralph: phase-9 gui-implementation complete"
```

---

## Full Project Complete

After Phase 9, the RWM Puppet Master is feature-complete:

```bash
git add .
git commit -m "ralph: v1.0.0 complete - all phases implemented"
git tag v1.0.0
```

---

*End of BUILD_QUEUE_PHASE_9.md*
