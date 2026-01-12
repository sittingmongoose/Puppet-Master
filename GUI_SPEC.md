# RWM Puppet Master — GUI_SPEC.md

> Version: 2.2  
> Status: Design Document  
> Last Updated: 2026-01-10 (Micro-patch: Session rename, Discovery-populated capability matrix)

---

## 1. Overview

The RWM Puppet Master GUI is a browser-based interface that provides visual control and monitoring of the orchestration system. It maintains full feature parity with the CLI.

### Design Principles

1. **Real-time Updates**: WebSocket-driven live status
2. **Progressive Disclosure**: Simple by default, details on demand
3. **Keyboard-first**: Power users can navigate without mouse
4. **Mobile-friendly**: Responsive design for tablet monitoring
5. **Offline-capable**: Core display works without connectivity

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React 18+ | Component model, ecosystem |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Utility-first, rapid dev |
| State | Zustand | Lightweight, simple |
| Real-time | WebSocket | Native browser support |
| Icons | Lucide React | Clean, consistent |
| Charts | Recharts | React-native, declarative |

---

## 3. Screen Inventory

| Screen | Path | Purpose |
|--------|------|---------|
| Dashboard | `/` | Main orchestration view |
| Project Select | `/projects` | Choose/create project |
| Start Chain | `/start` | Requirements → Plan wizard |
| Config | `/config` | Tier/branch/verification settings |
| Phases | `/phases` | Phase overview |
| Tasks | `/phases/:id/tasks` | Tasks within phase |
| Subtasks | `/tasks/:id/subtasks` | Subtasks within task |
| Evidence | `/evidence/:id` | Evidence viewer |
| Logs | `/logs` | Activity/error logs |
| Doctor | `/doctor` | Dependency checker |
| Capabilities | `/capabilities` | CLI capability matrix (ADDENDUM v2.0) |
| Budgets | `/budgets` | Platform usage/quotas (ADDENDUM v2.0) |
| Memory | `/memory` | AGENTS.md viewer/editor (ADDENDUM v2.0) |

---

## 4. Screen Specifications

### 4.1 Dashboard (`/`)

**Purpose:** Central command center showing current execution state.

#### Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo] RWM Puppet Master          [Project: Untangle ▼] [⚙️] [🔔] [👤] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Status Bar                                                       │  │
│  │ [🟢 Running] Phase 1/3 │ Task 2/4 │ Subtask 3/5 │ Iter 1/5      │  │
│  │ Budget: Claude 2/3 │ Codex 15/20 │ Cursor ∞                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌─────────────────────────────────┐ ┌────────────────────────────┐   │
│  │ Current Item                    │ │ Progress                   │   │
│  │                                 │ │                            │   │
│  │ ST-001-002-003                  │ │ ████████░░░░░░ 45%        │   │
│  │ Add status filter dropdown      │ │                            │   │
│  │                                 │ │ Phases:  1/3 ████░░░░      │   │
│  │ Iteration: 1/5                  │ │ Tasks:   5/12 ████░░░░     │   │
│  │ Platform: Cursor                │ │ Subtasks: 8/28 ███░░░░░    │   │
│  │ Model: sonnet-4.5-thinking      │ │                            │   │
│  │ Session: PM-2026-01-10-14-35-00-001 │ Time Elapsed: 45m 23s      │   │
│  │                                 │ └────────────────────────────┘   │
│  │ ─────────────────────────────   │                                   │
│  │                                 │ ┌────────────────────────────┐   │
│  │ Acceptance Criteria:            │ │ Run Controls               │   │
│  │ ✅ Filter dropdown renders      │ │                            │   │
│  │ ⬜ Filter updates URL params    │ │  [▶️ Start] [⏸️ Pause]     │   │
│  │ ⬜ Filter persists on reload    │ │  [⏹️ Stop]  [🔄 Retry]     │   │
│  │ ⬜ CLI_VERIFY:npm run typecheck │ │                            │   │
│  │                                 │ │  [📋 Replan] [↩️ Reopen]   │   │
│  │ Verifiers:                      │ │  [💀 Kill & Spawn Fresh]   │   │
│  │ ⏳ TEST:npm run typecheck       │ │                            │   │
│  │ ⏳ TEST:npm test                │ └────────────────────────────┘   │
│  └─────────────────────────────────┘                                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Live Output                                                  [📋] │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ > Reading progress.txt...                                       │  │
│  │ > Found 3 patterns in AGENTS.md                                 │  │
│  │ > Working on: Add status filter dropdown                        │  │
│  │ > Creating file: src/components/StatusFilter.tsx                │  │
│  │ > Running: npm run typecheck                                    │  │
│  │ █                                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────────────┐ ┌────────────────────────────────┐ │
│  │ Recent Commits            [→] │ │ Recent Errors               [→] │ │
│  │                               │ │                                │ │
│  │ 🟢 abc1234 ralph: add filter  │ │ ⚠️ 14:30 Test timeout          │ │
│  │ 🟢 def5678 ralph: update UI   │ │ ❌ 14:25 TypeScript error      │ │
│  │ 🟢 ghi9012 ralph: fix test    │ │                                │ │
│  └───────────────────────────────┘ └────────────────────────────────┘ │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Components

**StatusBar**
- Current state indicator (Running, Paused, Error, Complete)
- Position in hierarchy (Phase X/Y, Task A/B, etc.)
- Color-coded status
- **Budget indicators** showing usage per platform (ADDENDUM v2.0)

**CurrentItem Panel**
- Item ID and title
- Iteration counter
- Platform/model being used
- **Session ID** (replaces Thread) (ADDENDUM v2.0, UPDATED v2.1: renamed from "Run ID" for platform neutrality)
- Acceptance criteria checklist (real-time updates)
- **Verifier status** with token display (ADDENDUM v2.0)

**Progress Panel**
- Overall progress bar
- Per-tier breakdowns
- Elapsed time

**RunControls**
- Start/Pause/Resume/Stop buttons
- Retry (fresh iteration)
- Replan (modal for reason)
- Reopen (select item + reason)
- **Kill & Spawn Fresh** button (ADDENDUM v2.0)

**LiveOutput**
- Streaming output from current agent
- Auto-scroll with pause on hover
- Copy button
- Expandable to full screen

**RecentCommits**
- Last 5 commits
- Status indicator (success/fail)
- Click to view diff

**RecentErrors**
- Last 5 errors/warnings
- Click to view details

---

### 4.2 Project Select (`/projects`)

**Purpose:** Select or create a project.

#### Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│ Select Project                                                         │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │ 📁 Untangle     │  │ 📁 WidgetCorp   │  │ ➕ New Project  │        │
│  │                 │  │                 │  │                 │        │
│  │ Last: 2h ago   │  │ Last: 3d ago   │  │                 │        │
│  │ Phase 2/3      │  │ Complete       │  │                 │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                        │
│  Recent Projects:                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Path                          │ Status    │ Last Updated        │  │
│  │ /home/user/projects/untangle │ Running   │ 2 hours ago         │  │
│  │ /home/user/projects/widgets  │ Complete  │ 3 days ago          │  │
│  │ /home/user/projects/api      │ Paused    │ 1 week ago          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [📂 Open Directory...]                                                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3 Start Chain Wizard (`/start`)

**Purpose:** Step-through process from requirements to execution.

#### Step 1: Upload Requirements

```
┌────────────────────────────────────────────────────────────────────────┐
│ Start Chain — Step 1 of 6                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  📄 Upload Requirements Document                                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │                    Drag & Drop File Here                         │  │
│  │                                                                  │  │
│  │                    or [Browse Files]                             │  │
│  │                                                                  │  │
│  │                    Supports: .md, .txt, .pdf, .docx              │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Or paste requirements text directly:                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                                                                  │  │
│  │                                                                  │  │
│  │                                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│                                        [Cancel] [Next →]               │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step 2: Generate PRD

```
┌────────────────────────────────────────────────────────────────────────┐
│ Start Chain — Step 2 of 6                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  📝 Generate Structured PRD                                            │
│                                                                        │
│  Using: [Claude Code ▼]  Model: [opus-4.5 ▼]                          │
│                                                                        │
│  ⚠️ Budget: 2 of 3 Claude calls remaining this hour                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Requirements Preview                                             │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ # Friends Outreach Feature                                       │  │
│  │                                                                  │  │
│  │ Add ability to mark investors as "friends" for warm outreach.   │  │
│  │                                                                  │  │
│  │ ## Requirements                                                  │  │
│  │ - Toggle between cold/friend on investor list                   │  │
│  │ - Friends get shorter follow-up sequence (3 instead of 5)       │  │
│  │ ...                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│                        [⏳ Generating PRD...]                          │
│                                                                        │
│                                        [← Back] [Cancel] [Next →]      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step 3: Review Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ Start Chain — Step 3 of 6                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  🏗️ Generated Architecture                                             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ # Friends Feature Architecture                                   │  │
│  │                                                                  │  │
│  │ ## Data Model Changes                                            │  │
│  │ - Add `investorType` enum: COLD | FRIEND                        │  │
│  │ - Add `investorType` field to Investor model                    │  │
│  │                                                                  │  │
│  │ ## Component Changes                                             │  │
│  │ - InvestorList: Add type toggle                                 │  │
│  │ - InvestorCard: Display type badge                              │  │
│  │ ...                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [✏️ Edit Architecture]                                                │
│                                                                        │
│                                        [← Back] [Cancel] [Next →]      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step 4: Generate Tier Plan

```
┌────────────────────────────────────────────────────────────────────────┐
│ Start Chain — Step 4 of 6                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  🗂️ Generated Tier Plan                                                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Phase 1: Database & Backend                                      │  │
│  │ ├── Task 1.1: Add investor type field                           │  │
│  │ │   ├── ST-001: Add enum to schema                              │  │
│  │ │   │   ├── AC: FILE_VERIFY:prisma/schema.prisma:exists         │  │
│  │ │   │   └── Test: CLI_VERIFY:npx prisma validate                │  │
│  │ │   └── ST-002: Create migration                                │  │
│  │ ├── Task 1.2: Update server actions                             │  │
│  │ │   ├── ST-003: Modify createInvestor                           │  │
│  │ │   └── ST-004: Add type filter query                           │  │
│  │ └── Task 1.3: Add friend message templates                      │  │
│  │     ├── ST-005: Create template types                           │  │
│  │     └── ST-006: Implement template logic                        │  │
│  │                                                                  │  │
│  │ Phase 2: UI Components                                           │  │
│  │ ├── Task 2.1: Type toggle on list                               │  │
│  │ ...                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Statistics:                                                           │
│  • Phases: 3                                                           │
│  • Tasks: 8                                                            │
│  • Subtasks: 18                                                        │
│  • Est. Iterations: ~25                                                │
│                                                                        │
│  [✏️ Edit Plan]                   [← Back] [Cancel] [Next →]           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step 5: Configure Tiers

```
┌────────────────────────────────────────────────────────────────────────┐
│ Start Chain — Step 5 of 6                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  ⚙️ Tier Configuration                                                 │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ PHASE TIER                                                       │  │
│  │ Platform: [Claude Code ▼]  Model: [opus-4.5 ▼]                  │  │
│  │ Self-fix: [✓]  Max iterations: [3 ▼]  Escalation: [None ▼]     │  │
│  │ Budget: 3/hour, 10/day  Fallback: [Codex ▼]                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ TASK TIER                                                        │  │
│  │ Platform: [Codex ▼]       Model: [gpt-5.2-high ▼]               │  │
│  │ Self-fix: [✓]  Max iterations: [5 ▼]  Escalation: [Phase ▼]    │  │
│  │ Budget: 20/hour, 100/day  Fallback: [Cursor ▼]                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ SUBTASK TIER                                                     │  │
│  │ Platform: [Cursor ▼]      Model: [sonnet-4.5-thinking ▼]        │  │
│  │ Self-fix: [✓]  Max iterations: [10 ▼] Escalation: [Task ▼]     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ITERATION TIER                                                   │  │
│  │ Platform: [Cursor ▼]      Model: [auto ▼]                       │  │
│  │ Max attempts: [3 ▼]       Escalation: [Subtask ▼]               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Presets: [Balanced ▼] [Claude-heavy] [Cursor-heavy] [Custom]         │
│                                                                        │
│                                        [← Back] [Cancel] [Next →]      │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Step 6: Review & Start

```
┌────────────────────────────────────────────────────────────────────────┐
│ Start Chain — Step 6 of 6                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  ✅ Review & Start                                                     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Summary                                                          │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ Project: Untangle                                                │  │
│  │ Feature: Friends Outreach                                        │  │
│  │ Branch: ralph/friends-feature                                    │  │
│  │                                                                  │  │
│  │ Phases: 3 │ Tasks: 8 │ Subtasks: 18                             │  │
│  │                                                                  │  │
│  │ Tier Configuration:                                              │  │
│  │   Phase → Claude Code (opus-4.5)                                 │  │
│  │   Task → Codex (gpt-5.2-high)                                   │  │
│  │   Subtask → Cursor (sonnet-4.5-thinking)                        │  │
│  │   Iteration → Cursor (auto)                                      │  │
│  │                                                                  │  │
│  │ Git Strategy: per-task branches, squash merge                    │  │
│  │                                                                  │  │
│  │ Estimated budget usage:                                          │  │
│  │   Claude: ~6 calls (Start Chain + Phase gates)                   │  │
│  │   Codex: ~16 calls (Task gates)                                  │  │
│  │   Cursor: ~50 calls (Iterations)                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [✓] Run capability checks before starting                             │
│  [✓] Create initial git branch                                         │
│                                                                        │
│                                        [← Back] [Cancel] [🚀 Start]    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Configuration (`/config`)

**Purpose:** Full configuration management.

#### Tabs

1. **Tiers** - Platform/model per tier
2. **Branching** - Git strategy
3. **Verification** - Browser/test settings
4. **Memory** - State file locations + multi-level AGENTS.md (ADDENDUM v2.0)
5. **Budgets** - Platform quotas (ADDENDUM v2.0)
6. **Advanced** - Timeouts, recovery

#### Tiers Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ Configuration                                                          │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│ [Tiers] [Branching] [Verification] [Memory] [Budgets] [Advanced]      │
│ ───────────────────────────────────────────────────────────────────── │
│                                                                        │
│  Tier Pipeline Visualization:                                          │
│                                                                        │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌───────────┐           │
│  │  Phase  │───▶│  Task   │───▶│ Subtask │───▶│ Iteration │           │
│  │ Claude  │    │  Codex  │    │ Cursor  │    │  Cursor   │           │
│  └─────────┘    └─────────┘    └─────────┘    └───────────┘           │
│       │              │              │               │                  │
│       ▼              ▼              ▼               ▼                  │
│   [Edit ✏️]      [Edit ✏️]      [Edit ✏️]       [Edit ✏️]             │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Drag to reorder tiers • Click to edit • Duplicate allowed        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Quick Actions:                                                        │
│  [🔄 Reset to Default] [📋 Import Config] [📤 Export Config]          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Branching Tab

```
│ [Tiers] [Branching] [Verification] [Memory] [Budgets] [Advanced]      │
│ ───────────────────────────────────────────────────────────────────── │
│                                                                        │
│  Git Strategy                                                          │
│                                                                        │
│  Base Branch: [main ▼]                                                 │
│  Branch Granularity: [per-task ▼]  (single | per-phase | per-task)    │
│  Naming Pattern: [ralph/{phase}/{task}]                                │
│                                                                        │
│  Push Policy: [per-subtask ▼]                                          │
│  Merge Policy: [squash ▼]                                              │
│                                                                        │
│  [✓] Auto-create pull requests                                         │
│  [✓] Delete branch after merge                                         │
│  [ ] Sign commits                                                      │
│                                                                        │
│  Conflict Resolution: [pause ▼]  (pause | rebase | abort)              │
│                                                                        │
│  GitHub CLI (gh):                                                      │
│  Status: ✅ Available (v2.40.0)                                        │
│  [ ] Require review before merge                                       │
│  PR Labels: [ralph-automated]                                          │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Memory Tab (ADDENDUM v2.0)

```
│ [Tiers] [Branching] [Verification] [Memory] [Budgets] [Advanced]      │
│ ───────────────────────────────────────────────────────────────────── │
│                                                                        │
│  State Files                                                           │
│                                                                        │
│  Progress File: [progress.txt]                                         │
│  Agents File: [AGENTS.md]                                              │
│  PRD File: [.puppet-master/prd.json]                                   │
│                                                                        │
│  Multi-Level AGENTS.md                                                 │
│                                                                        │
│  [✓] Enable multi-level AGENTS.md                                      │
│                                                                        │
│  Levels:                                                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [✓] Root: AGENTS.md (always enabled)                             │  │
│  │ [✓] Module: src/*/AGENTS.md                                      │  │
│  │ [✓] Phase: .puppet-master/agents/phase-*.md                      │  │
│  │ [✓] Task: .puppet-master/agents/task-*.md                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  AGENTS.md Enforcement                                                 │
│                                                                        │
│  [✓] Require update when gotcha discovered                             │
│  [✓] Gate fails if expected update missing                             │
│  [✓] Reviewer must acknowledge updates                                 │
│                                                                        │
│  Promotion Rules:                                                      │
│  [ ] Auto-promote Task → Phase on gate pass                            │
│  [ ] Auto-promote Phase → Root on gate pass                            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Budgets Tab (ADDENDUM v2.0)

```
│ [Tiers] [Branching] [Verification] [Memory] [Budgets] [Advanced]      │
│ ───────────────────────────────────────────────────────────────────── │
│                                                                        │
│  Platform Budgets                                                      │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CLAUDE CODE                                                       │  │
│  │ Max calls per run: [5]  per hour: [3]  per day: [10]             │  │
│  │ Cooldown period: [5] hours                                        │  │
│  │ Fallback platform: [Codex ▼]                                      │  │
│  │ Current usage: 2/3 (hour) │ 5/10 (day)                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CODEX                                                             │  │
│  │ Max calls per run: [50]  per hour: [20]  per day: [100]          │  │
│  │ Fallback platform: [Cursor ▼]                                     │  │
│  │ Current usage: 8/20 (hour) │ 25/100 (day)                        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CURSOR                                                            │  │
│  │ Max calls: [unlimited]                                            │  │
│  │ No fallback needed                                                │  │
│  │ Current usage: 47 today                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  On Limit Reached: [fallback ▼]  (fallback | pause | queue)            │
│  Warn at: [80]% of limit                                               │
│  [✓] Notify on fallback                                                │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.5 Capabilities Screen (`/capabilities`) (ADDENDUM v2.0, UPDATED v2.1)

**Purpose:** View CLI capability matrix and run smoke tests.

**IMPORTANT (ADDENDUM v2.1):** All values displayed on this screen are **discovery-populated** — they are determined at runtime by the Doctor subsystem, not hardcoded assumptions. The screen must show:
- **Last discovered timestamp** with staleness indicator (warn if > 24h old)
- **Evidence links** to smoke test logs and discovery report
- **Validation status** indicating whether orchestration can proceed

```
┌────────────────────────────────────────────────────────────────────────┐
│ CLI Capabilities                                                       │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  [🔄 Rediscover All]  Last discovered: 2 hours ago  ✅ Valid           │
│  [📄 View Discovery Report] [📋 View capabilities.json]                │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CURSOR-AGENT                                              ✅ OK  │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ Version: 1.2.3                                                   │  │
│  │ Command: cursor-agent                                            │  │
│  │                                                                  │  │
│  │ Capabilities:                                                    │  │
│  │   ✅ Non-interactive mode (-p)                                   │  │
│  │   ✅ Model selection (--model)                                   │  │
│  │   ✅ Session resume (--resume)                                   │  │
│  │   ✅ MCP support                                                 │  │
│  │   ⚠️ Streaming: partial (stdout only)                           │  │
│  │                                                                  │  │
│  │ Available Models:                                                │  │
│  │   auto, sonnet-4.5-thinking, grok-code                          │  │
│  │                                                                  │  │
│  │ Smoke Tests:                                                     │  │
│  │   ✅ basic_invocation (1.2s)                                     │  │
│  │   ✅ non_interactive (2.3s)                                      │  │
│  │   ✅ model_selection (1.6s)                                      │  │
│  │                                                                  │  │
│  │ [🔄 Rediscover] [🧪 Run Smoke Tests] [📄 View Logs]              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CODEX                                                     ✅ OK  │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ Version: 0.5.1                                                   │  │
│  │ ...                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ CLAUDE                                                    ✅ OK  │  │
│  │ ─────────────────────────────────────────────────────────────── │  │
│  │ Version: 1.0.8                                                   │  │
│  │ ...                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### Capabilities Screen Data Source (ADDENDUM v2.1)

All data displayed on this screen comes from:
- **Primary:** `.puppet-master/capabilities/capabilities.json` (combined matrix)
- **Per-platform:** `.puppet-master/capabilities/<platform>.yaml`
- **Evidence:** `.puppet-master/capabilities/smoke-test-<platform>.log`
- **Report:** `.puppet-master/capabilities/discovery-report.md`

The screen MUST:
1. Show warning banner if capabilities are stale (> configurable threshold)
2. Prevent "Start Execution" if smoke tests have not passed
3. Provide links to evidence artifacts

---

### 4.6 Budgets Screen (`/budgets`) (ADDENDUM v2.0)

**Purpose:** View platform usage and quota status.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Platform Budgets & Usage                                               │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  Current Period: 2026-01-10                                            │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CLAUDE CODE                                                      │   │
│  │                                                                  │   │
│  │ Hourly:  ██████░░░░  2/3 calls (67%)                            │   │
│  │ Daily:   █████░░░░░  5/10 calls (50%)                           │   │
│  │                                                                  │   │
│  │ Cooldown: None active                                            │   │
│  │ Fallback: Codex (active when limit reached)                      │   │
│  │                                                                  │   │
│  │ [📊 View History] [🔒 Reserve for Gates]                         │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CODEX                                                            │   │
│  │                                                                  │   │
│  │ Hourly:  ████░░░░░░  8/20 calls (40%)                           │   │
│  │ Daily:   ███░░░░░░░  25/100 calls (25%)                         │   │
│  │                                                                  │   │
│  │ [📊 View History]                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ CURSOR                                                           │   │
│  │                                                                  │   │
│  │ Usage today: 47 calls                                            │   │
│  │ No limits configured (unlimited plan)                            │   │
│  │                                                                  │   │
│  │ [📊 View History]                                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  Usage History (Last 7 Days):                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │     [Chart showing daily usage by platform]                      │   │
│  │     Claude ▓▓  Codex ▓▓▓▓  Cursor ▓▓▓▓▓▓▓▓▓▓                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.7 Memory/AGENTS Screen (`/memory`) (ADDENDUM v2.0)

**Purpose:** View and edit AGENTS.md files.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Memory Management (AGENTS.md)                                          │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  File: [Root AGENTS.md ▼]                                              │
│                                                                        │
│  Available files:                                                      │
│  • Root: AGENTS.md (42 lines)                                          │
│  • Module: src/lib/AGENTS.md (18 lines)                               │
│  • Phase: .puppet-master/agents/phase-001.md (12 lines)               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ # Untangle - Agent Instructions                                  │  │
│  │                                                                  │  │
│  │ ## Overview                                                      │  │
│  │ Investor outreach management system...                           │  │
│  │                                                                  │  │
│  │ ## Architecture Notes                                            │  │
│  │ - Next.js 14 with App Router                                    │  │
│  │ - PostgreSQL with Prisma ORM                                    │  │
│  │ ...                                                              │  │
│  │                                                                  │  │
│  │ ## Codebase Patterns                                             │  │
│  │ - Use `sql<number>` template for Prisma raw queries              │  │
│  │ - All database dates stored as UTC                               │  │
│  │ ...                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Pending Updates (from recent iterations):                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ⬜ "Use revalidatePath after mutations" (from ST-001-001-003)    │  │
│  │ ⬜ "Prisma enum changes need migrate" (from ST-001-001-002)      │  │
│  │ [✅ Approve All] [❌ Dismiss All]                                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [✏️ Edit] [⬆️ Promote to Root] [📋 Copy] [💾 Save]                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.8 Doctor (`/doctor`)

**Purpose:** Check and install dependencies.

```
┌────────────────────────────────────────────────────────────────────────┐
│ Doctor — Dependency Check                                              │
│ ═══════════════════════════════════════════════════════════════════════│
│                                                                        │
│  [🔄 Run All Checks]  Last run: 5 minutes ago                          │
│                                                                        │
│  CLI Tools                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ cursor-agent    v1.2.3    /usr/local/bin/cursor-agent        │  │
│  │ ✅ codex           v0.5.1    /usr/local/bin/codex               │  │
│  │ ✅ claude          v1.0.8    ~/.claude/bin/claude               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Git                                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ git             v2.42.0   /usr/bin/git                       │  │
│  │ ✅ gh              v2.40.0   /usr/local/bin/gh                  │  │
│  │ ✅ Repository      initialized                                   │  │
│  │ ✅ Remote          origin → github.com/user/untangle            │  │
│  │ ✅ Credentials     configured (can push)                         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Runtimes                                                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ node            v20.11.0  /usr/local/bin/node                │  │
│  │ ✅ npm             v10.2.4   /usr/local/bin/npm                 │  │
│  │ ⚠️ python          v3.11.4   /usr/bin/python3 (optional)        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Browser Tools                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ dev-browser     running   http://localhost:9222              │  │
│  │ ✅ playwright      v1.40.0   installed                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Capabilities                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ All CLI smoke tests passed                                    │  │
│  │ ✅ Capability matrix is current (< 24h old)                      │  │
│  │ [View Capabilities →]                                            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  Project Setup                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ✅ config.yaml     valid                                        │  │
│  │ ✅ prd.json        valid (3 phases, 8 tasks, 18 subtasks)       │  │
│  │ ✅ AGENTS.md       exists (structured format)                   │  │
│  │ ✅ progress.txt    exists (15 entries)                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [🔧 Install Missing] [📋 Copy Commands] [📤 Export Report]           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Library

### 5.1 StatusBadge

```typescript
interface StatusBadgeProps {
  status: 'running' | 'paused' | 'error' | 'complete' | 'pending';
  size?: 'sm' | 'md' | 'lg';
}

// Colors:
// running: green pulse
// paused: yellow
// error: red
// complete: green solid
// pending: gray
```

### 5.2 ProgressBar

```typescript
interface ProgressBarProps {
  value: number;      // 0-100
  max?: number;       // Default 100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}
```

### 5.3 RunControlPanel

```typescript
interface RunControlPanelProps {
  state: 'idle' | 'running' | 'paused' | 'error' | 'complete';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRetry: () => void;
  onReplan: (reason: string) => void;
  onReopen: (itemId: string, reason: string) => void;
  onKillAndSpawnFresh: () => void;  // ADDENDUM v2.0
}
```

### 5.4 LiveOutput

```typescript
interface LiveOutputProps {
  lines: OutputLine[];
  autoScroll?: boolean;
  maxLines?: number;
  onCopy: () => void;
  onExpand: () => void;
}

interface OutputLine {
  timestamp: Date;
  type: 'stdout' | 'stderr' | 'system';
  content: string;
}
```

### 5.5 BudgetIndicator (ADDENDUM v2.0)

```typescript
interface BudgetIndicatorProps {
  platform: 'claude' | 'codex' | 'cursor';
  current: number;
  limit: number | 'unlimited';
  period: 'hour' | 'day';
  cooldownUntil?: Date;
  onReserve?: () => void;
}
```

### 5.6 VerifierStatus (ADDENDUM v2.0)

```typescript
interface VerifierStatusProps {
  token: string;  // e.g., "TEST:npm test"
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  evidencePath?: string;
  onViewEvidence?: () => void;
}
```

---

## 6. Real-Time Updates

### 6.1 WebSocket Events

| Event | Payload | Trigger |
|-------|---------|---------|
| `state_change` | `{ state, previousState }` | Orchestrator state changes |
| `progress` | `{ phase, task, subtask, iteration }` | Progress updates |
| `output` | `{ line, type }` | CLI output stream |
| `iteration_start` | `{ itemId, attempt, platform }` | New iteration begins |
| `iteration_complete` | `{ itemId, attempt, status, sessionId }` | Iteration ends |
| `gate_start` | `{ itemId, type, platform }` | Gate review begins |
| `gate_complete` | `{ itemId, type, passed, decision }` | Gate review ends |
| `error` | `{ message, stack, itemId }` | Error occurred |
| `commit` | `{ sha, message, files }` | Git commit made |
| `budget_warning` | `{ platform, current, limit, percentage }` | Budget threshold hit (ADDENDUM v2.0) |
| `budget_fallback` | `{ from, to, reason }` | Platform fallback triggered (ADDENDUM v2.0) |
| `agents_update` | `{ level, additions }` | AGENTS.md updated (ADDENDUM v2.0) |
| `stall_detected` | `{ itemId, pid, duration }` | Stall detected (ADDENDUM v2.0) |

### 6.2 Event Subscription

```typescript
const ws = new WebSocket('ws://localhost:3001/events');

ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  
  switch (type) {
    case 'state_change':
      updateState(payload);
      break;
    case 'output':
      appendOutput(payload);
      break;
    case 'budget_warning':
      showBudgetWarning(payload);
      break;
    // ...
  }
};
```

---

## 7. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Start/Pause toggle |
| `Escape` | Stop execution |
| `R` | Retry current item |
| `G` | Go to current item |
| `L` | Open logs |
| `D` | Open doctor |
| `C` | Open capabilities (ADDENDUM v2.0) |
| `B` | Open budgets (ADDENDUM v2.0) |
| `M` | Open memory/AGENTS (ADDENDUM v2.0) |
| `?` | Show help |
| `1-4` | Jump to tier view |
| `/` | Open command palette |

---

## 8. Accessibility

### 8.1 ARIA Labels

All interactive elements must have appropriate ARIA labels:
- Buttons: `aria-label` describing action
- Status indicators: `aria-live` for updates
- Progress bars: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

### 8.2 Keyboard Navigation

- All controls accessible via Tab
- Focus indicators visible
- Escape closes modals
- Arrow keys navigate lists

### 8.3 Color Contrast

- Minimum 4.5:1 contrast ratio
- Color not sole indicator (icons + text)
- Dark mode support

### 8.4 Screen Reader Support

- Meaningful heading hierarchy
- Table captions and headers
- Live regions for dynamic content
- Skip links for main content

---

## 9. API Endpoints

### 9.1 REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Current orchestrator status |
| GET | `/api/phases` | List all phases |
| GET | `/api/phases/:id` | Phase details |
| GET | `/api/tasks/:id` | Task details |
| GET | `/api/subtasks/:id` | Subtask details |
| POST | `/api/start` | Start execution |
| POST | `/api/pause` | Pause execution |
| POST | `/api/resume` | Resume execution |
| POST | `/api/stop` | Stop execution |
| POST | `/api/replan` | Trigger replan |
| POST | `/api/reopen/:id` | Reopen item |
| POST | `/api/kill-spawn` | Kill current and spawn fresh (ADDENDUM v2.0) |
| GET | `/api/evidence/:id` | Get evidence for item |
| GET | `/api/logs` | Get activity logs |
| GET | `/api/config` | Get configuration |
| PUT | `/api/config` | Update configuration |
| GET | `/api/capabilities` | Get capability matrix (ADDENDUM v2.0) |
| POST | `/api/capabilities/discover` | Run capability discovery (ADDENDUM v2.0) |
| GET | `/api/budgets` | Get budget status (ADDENDUM v2.0) |
| GET | `/api/agents` | Get AGENTS.md files list (ADDENDUM v2.0) |
| GET | `/api/agents/:path` | Get AGENTS.md content (ADDENDUM v2.0) |
| PUT | `/api/agents/:path` | Update AGENTS.md (ADDENDUM v2.0) |
| POST | `/api/agents/promote` | Promote item to higher level (ADDENDUM v2.0) |

### 9.2 WebSocket API

Connect to: `ws://localhost:3001/events`

Subscribe to specific events:
```json
{ "action": "subscribe", "events": ["output", "state_change", "budget_warning"] }
```

Unsubscribe:
```json
{ "action": "unsubscribe", "events": ["output"] }
```

---

## 10. Error States

### 10.1 Error Display

```
┌──────────────────────────────────────────────────────────────────────┐
│ ❌ Error in ST-001-001-003                                           │
│ ──────────────────────────────────────────────────────────────────── │
│                                                                      │
│ TypeScript compilation failed                                        │
│                                                                      │
│ src/components/StatusFilter.tsx:15:3                                │
│ Error: Property 'options' does not exist on type 'Props'            │
│                                                                      │
│ Attempt: 2 of 5                                                      │
│ Duration: 3m 45s                                                     │
│                                                                      │
│ [🔄 Retry] [⏭️ Skip] [⬆️ Escalate] [📋 Copy Error]                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.2 Budget Exhausted State (ADDENDUM v2.0)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⚠️ Claude Code Budget Exhausted                                      │
│ ──────────────────────────────────────────────────────────────────── │
│                                                                      │
│ Hourly limit reached (3/3 calls)                                     │
│ Cooldown ends in: 4h 32m                                             │
│                                                                      │
│ Options:                                                             │
│ • Continue with Codex (fallback configured)                          │
│ • Pause and wait for cooldown                                        │
│ • Queue remaining Claude work                                        │
│                                                                      │
│ [Continue with Codex] [Pause] [Queue & Continue]                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.3 Stall Detected State (ADDENDUM v2.0)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⚠️ Stall Detected                                                    │
│ ──────────────────────────────────────────────────────────────────── │
│                                                                      │
│ No output from cursor-agent for 5 minutes                            │
│ Process ID: 12345                                                    │
│ Item: ST-001-002-003                                                 │
│                                                                      │
│ [💀 Kill & Spawn Fresh] [⏳ Wait Longer] [⬆️ Escalate]               │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---


---

## Appendix A: Update Frequency Requirements (RESTORED)

### Update Frequency Table

The GUI must update at specific frequencies based on event type to balance responsiveness with system load:

| Event Type | Update Frequency | Strategy | Rationale |
|------------|------------------|----------|-----------|
| **CLI Output Stream** | Real-time (immediate) | WebSocket Push | User needs live feedback |
| **Iteration Progress** | Real-time (immediate) | WebSocket Push | Track agent progress |
| **Status Change** | Real-time (immediate) | WebSocket Push | Critical state changes |
| **Acceptance Criteria Check** | Real-time (immediate) | WebSocket Push | Show pass/fail as they occur |
| **Verifier Results** | Real-time (immediate) | WebSocket Push | Show verification outcomes |
| **Progress Bars (overall)** | Every 1 second | Polling | Smooth visual updates |
| **Budget Counters** | Every 5 seconds | Polling | Balance freshness vs overhead |
| **Recent Commits List** | On commit event | Event-driven | Update only when needed |
| **Recent Errors List** | On error event | Event-driven | Update only when needed |
| **Capability Matrix** | On demand / Doctor run | User-triggered | Expensive to refresh |
| **Usage History Charts** | Every 30 seconds | Polling | Low-priority dashboard data |
| **Phase/Task/Subtask Lists** | On state change | Event-driven | Triggered by orchestrator |

### Polling vs Push Strategy Details

| Data Type | Strategy | Implementation Notes |
|-----------|----------|---------------------|
| Status, Output | WebSocket Push | Low latency required; use separate WebSocket channels |
| Budget Counters | Polling (5s) | Reduce server load; client-side timer |
| Usage Charts | Polling (30s) | Historical data, not urgent; background fetch |
| Capability Matrix | On-demand | User-triggered; cache for 24 hours |
| Evidence Files | On-demand | Large data, user-triggered; lazy loading |
| Gate Reports | On gate complete | Event-driven; prefetch on gate start |

### Connection Recovery Protocol

When WebSocket connection is lost:

1. **Immediate**: Display "Reconnecting..." indicator in status bar
2. **Fallback**: Switch to polling mode every 2 seconds for critical status
3. **Reconnect**: Attempt WebSocket reconnection with exponential backoff
   - Initial delay: 1 second
   - Subsequent delays: 2s, 4s, 8s, 16s, max 30s
4. **Queue**: Queue state updates during disconnect
5. **Replay**: On reconnect, request missed events from server
6. **Reconcile**: Merge queued updates with server state

### Rate Limiting

To prevent UI overload during high-activity periods:

| Component | Max Updates/Second | Buffering Strategy |
|-----------|-------------------|-------------------|
| Live Output | 60 | Buffer lines, flush every 16ms |
| Progress Bars | 10 | Debounce, update on next frame |
| Status Badge | 5 | Debounce with latest value |
| Tree Views | 2 | Batch updates, reconcile once |

---

## Appendix B: Responsive Breakpoints (RESTORED)

### Breakpoint Definitions

| Breakpoint Name | Width Range | Target Devices | Tailwind Class |
|-----------------|-------------|----------------|----------------|
| **xs** (Extra Small) | < 640px | Mobile phones (portrait) | `max-sm:` |
| **sm** (Small) | 640px - 767px | Mobile phones (landscape), small tablets | `sm:` |
| **md** (Medium) | 768px - 1023px | Tablets (portrait), small laptops | `md:` |
| **lg** (Large) | 1024px - 1279px | Tablets (landscape), laptops | `lg:` |
| **xl** (Extra Large) | 1280px - 1535px | Desktop monitors | `xl:` |
| **2xl** (2X Large) | ≥ 1536px | Large desktop monitors | `2xl:` |

### Layout Adaptations per Breakpoint

| Component | xs-sm | md | lg-xl | 2xl |
|-----------|-------|-----|-------|-----|
| **Dashboard Layout** | Single column, stacked | 2 columns | 3 columns | 4 columns |
| **Status Bar** | Collapsed (icons only, tap to expand) | Abbreviated text | Full width | Full with extra metrics |
| **Current Item Panel** | Full width, accordion | 50% width | 40% width | 33% width |
| **Live Output** | Full width, collapsed by default | Full width, expanded | 60% width | 50% width |
| **Run Controls** | Bottom fixed bar (FAB style) | Bottom bar | Sidebar | Inline panel |
| **Recent Commits/Errors** | Hidden (accessible via tab) | Collapsed accordion | Side panel | Always visible |
| **Navigation** | Hamburger menu (drawer) | Hamburger menu | Side rail | Full sidebar |
| **Phase/Task Tree** | Accordion (tap to expand) | Accordion | Full tree view | Tree view + details panel |
| **Budget Indicators** | Compact bar only | Bar + percentage | Full card | Card + chart |

### Typography Scaling

| Element | xs | sm | md | lg+ |
|---------|-----|-----|-----|------|
| Body text | 14px | 14px | 16px | 16px |
| H1 (Page titles) | 24px | 28px | 32px | 36px |
| H2 (Section headers) | 20px | 22px | 24px | 28px |
| H3 (Subsections) | 16px | 18px | 20px | 22px |
| Monospace (code/output) | 12px | 12px | 14px | 14px |
| Status badges | 12px | 12px | 14px | 14px |
| Button text | 14px | 14px | 16px | 16px |
| Caption/helper text | 12px | 12px | 12px | 14px |

### Touch Target Requirements

For mobile breakpoints (xs-sm):

| Element Type | Minimum Size | Spacing |
|--------------|--------------|---------|
| Buttons (primary actions) | 48px × 48px | 8px gap minimum |
| Icon buttons | 44px × 44px | 8px gap minimum |
| List items (tappable) | Full width × 48px | 4px vertical gap |
| Checkboxes/Radio buttons | 44px × 44px | 12px from label |
| Input fields | Full width × 48px | 16px vertical margin |

### Gesture Support (Mobile)

| Gesture | Action | Context |
|---------|--------|---------|
| Pull down | Refresh status | Dashboard, any list view |
| Swipe left on item | Quick actions (retry, skip) | Task/Subtask lists |
| Swipe right on item | View details | Task/Subtask lists |
| Long press | Context menu | Any actionable item |
| Pinch zoom | Zoom output | Live Output panel |
| Two-finger swipe | Navigate history | Phase/Task views |

### Specific Component Responsive Rules

#### Dashboard

```
xs-sm:
  - Single column, cards stacked vertically
  - Status bar: icon + current item only, tap to expand
  - Live output: collapsed accordion, tap to expand
  - Run controls: floating action button (FAB) in bottom right
  - Recent commits/errors: swipe tabs

md:
  - Two columns: (Status + Current Item) | (Progress + Controls)
  - Live output: half-width, inline
  - Recent commits/errors: collapsible cards

lg+:
  - Three columns as shown in wireframes
  - All panels visible and expanded
  - Recent commits/errors: inline panels
```

#### Navigation

```
xs-sm:
  - Hamburger menu top left
  - Drawer slides in from left
  - Bottom nav bar for primary actions (Start/Pause/Stop)

md:
  - Hamburger menu
  - Expandable rail on left

lg+:
  - Full sidebar (240px width)
  - Always visible
  - Project selector in header
```

#### Forms and Configuration

```
xs-sm:
  - Full-width inputs
  - Stacked labels (above inputs)
  - Large touch targets
  - Save button fixed to bottom

md+:
  - Side-by-side inputs where appropriate
  - Inline labels for short fields
  - Standard button placement
```

### Dark Mode Considerations

All responsive designs must support both light and dark modes:

- Use CSS variables for all colors
- Test contrast ratios at all breakpoints
- Ensure touch targets are visible in both modes
- Status colors must maintain accessibility in both modes

---

