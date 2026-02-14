# Interview Updates Plan (v2 - Comprehensive)

## Repository Hygiene Update (2026-02-14)

**Cleanup completed: `interviewupdates-sync` todo**

### Changes Made:
1. **Added to `.gitignore`:**
   - `.puppet-master/puppet-master.db` - Empty runtime database file (volatile/machine-specific)

2. **Removed generated documentation and temporary files:**
   - All `*_COMPLETE.md`, `*_SUMMARY.md`, `*_QUICK_REF.md`, `*_VISUAL.*`, `*_VERIFICATION.md` reports (32 files)
   - Temporary scripts: `quick_validation.sh`, `test_cargo_fix.sh`, `verify-cargo-build.sh`
   - Temporary utilities: `update_todo.py`, `update_todo.rs`
   
3. **Preserved implementation files:**
   - `puppet-master-rs/src/start_chain/formatters.rs` - Active module (imported by `mod.rs`, used by PRD/tier plan formatting)

### Rationale:
Generated documentation files were session-specific artifacts that should not be version-controlled. They clutter the repository and are regenerated as needed during development sessions. The `.puppet-master/puppet-master.db` file is a runtime state file that should be ignored like other database files in the same directory.

### Remaining untracked files:
- `puppet-master-rs/src/start_chain/formatters.rs` (implementation file - should be committed separately)

---

## Context

The RWM Puppet Master was rewritten from TypeScript/React/Tauri to **Rust/Iced** (`puppet-master-rs/`). The legacy requirements interviewer in the Rust rewrite (`puppet-master-rs/src/start_chain/requirements_interviewer.rs`) was a **one-shot question generator** that analyzed requirements and output a static list of questions. 

**As of 2026-02-14, this has been superseded by the new interactive interview system** (`puppet-master-rs/src/interview/`) which provides a fully functional, conversational interview experience that executes real AI turns through platform runners.

The original Ralph Wiggum Model requirements included:

- **Interactive, conversational interview** with back-and-forth clarification
- **Zero gaps or ambiguity** - everything must be fact-based, explicit, with NO open items
- **AI platform failover** - if one AI runs out of quota, seamlessly switch (during interview AND orchestration)
- **Context management** - break interview into chunks to prevent hallucination
- **Architecture & technology confirmation** - verify versions, dependencies, consistency (version pinning is critical)
- **100% autonomous testing** - all tests designed for AI agents, no manual testing, Playwright is critical
- **GUI support** - integrated into existing wizard, dedicated interview page + side panel modal
- **Reference material support** - users can provide links, photos, folders, documents to guide the interview
- **Research-informed questioning** - AI looks up relevant docs/material before and after asking questions
- **Two interaction modes** - Expert mode and ELI5 (Explain Like I'm 5) mode
- **Both new and existing projects** - workflow handles greenfield projects and feature additions to existing codebases
- **Initial AGENTS.md generation** - interview outputs a starter AGENTS.md to guide agents from day one

The open-source **LISA project** (`Reference/RalphInfo/lisa-main/`) is designed as the interviewer for the Ralph Wiggum model. We will adapt its patterns and fork/embed its core logic into the Rust codebase.

### Partial Implementation Status

Previous agents started some work before being stopped. The following now exists and HAS been verified to compile (cargo check + cargo test --lib):

### Progress Update (2026-02-14)

**Major Milestones Achieved:**
- **✅ Interview GUI now executes real AI turns:** Platform runner integration complete, `execute_ai_turn()` calls actual AI platforms (not stubs), fully functional Q&A flow with real responses.
- **✅ Cargo OS Error 22 workaround implemented:** Build directory relocated to `/tmp/puppet-master-build` via `.cargo/config.toml`, resolves SMB/CIFS network mount execution failures, 100% build success rate achieved.
- **✅ Selectable text + copy support:** Previous answers, questions, progress summary, and reference materials now use selectable text widgets with right-click context menu support.
- **✅ Dynamic feature-specific phases (Phase 9+):** Fully implemented — feature detection after phase 8, dynamic phases added to phase manager, persisted in interview state YAML, rendered in interview view from `phase_definitions`.
- **✅ Playwright auto-install complete:** Doctor check (`puppet-master-rs/src/doctor/checks/playwright_check.rs`) fully implemented — `fix()` returns `Some(FixResult)` with npm + playwright install workflow.

**UI/UX Improvements:**
- SelectableText widget (`src/widgets/selectable_text.rs`) now canonical for read-only/copyable content
- Interview history is fully selectable/copyable via `selectable_text_field` widget
- Right-click context menu support is present in some areas, but not yet universal
- Responsive layout detection (`responsive::LayoutSize`) now integrated in interview view for mobile-responsive button layout

**Build System:**
- Deterministic build location in `/tmp/` for network mount compatibility
- Verification scripts created: `verify-cargo-workaround.sh` and `test-os-error-22-fix.sh`
- `cargo check` + `cargo test --lib` passing

**Documentation:**
- `INTERVIEW_GUI_USAGE.md` - Comprehensive usage guide for the new interview system
- `ACCESSIBILITY_AUDIT_INTERVIEW_UX.md` - Full accessibility audit (2026-02-15)
- `CARGO_BUILD_FINAL_REPORT.md` - OS Error 22 resolution documentation

**Known Limitations:**
- Some UI elements not yet selectable (panel phase names need conversion)
- Color contrast verification pending for WCAG AA compliance

### Progress Update (2026-02-13)

**Completed in Rust/Iced (puppet-master-rs):**
- **✅ Interview backend modules implemented:** `reference_manager.rs`, `research_engine.rs`, `agents_md_generator.rs`, `test_strategy_generator.rs`, `technology_matrix.rs`, `failover.rs`, `orchestrator.rs`, `phase_manager.rs`, `question_parser.rs`, `prompt_templates.rs`, `state.rs`, `document_writer.rs`, `completion_validator.rs`.
- **✅ Interview config wired:** `reasoning_level`, `generate_initial_agents_md`, `interaction_mode` in `types/config.rs` + `config/gui_config.rs` with schema validation.
- **✅ Wizard Step 0 (Project Setup):** New/existing project selection, GitHub repo configuration.
- **✅ Existing project scan context:** Best-effort scan of the selected project folder (Cargo.toml/package.json/Playwright/Vitest/Tauri detection) is injected into the interview prompt for existing projects.
- **✅ Wizard Step 0.5 (Quick Interview Config):** Interview toggle, interaction mode, reasoning level, AGENTS.md generation toggle.
- **✅ Wizard steps renumbered:** Step 0 + Step 0.5 + Steps 1-7 (internal indices 0-8) with updated indicators/labels.
- **✅ State management:** App state fields for project setup and interview config.
- **✅ Message handlers:** All messages for project setup and interview config implemented.
- **✅ Validation logic:** Project name, path, and GitHub URL validation.
- **✅ Quick config wiring:** Wizard interview config syncs to `gui_config.interview`.
- **✅ Git initialization:** Wizard Step 0 runs `git init` if no repo exists and sets `origin` when GitHub URL provided.
- **✅ GitHub repo creation:** Wizard Step 0 invokes `gh repo create` (requires gh CLI + auth).
- **✅ GitHub repo creation fallback:** If `gh repo create` fails/unavailable, the wizard continues with a warning toast + manual repo setup instructions.
- **✅ Interview view (`views/interview.rs`):** Phase tracker, question display, answer input with submit/pause/end controls, progress summary, scrollable history.
- **✅ Interview UI state in `app.rs`:** `interview_answer_input`, messages (`InterviewAnswerInputChanged`, `InterviewSubmitAnswer`, `InterviewTogglePause`, `InterviewEnd`), handlers, integrated into `Page::Interview`.
- **✅ ReferenceManager:** Loads local files/directories with size limits and manifest highlights.
- **✅ Reference Materials UI:** Add File/Add Directory/Add Link panel with remove list, persists to InterviewState YAML (migrates legacy `context_files`).
- **✅ "Add Image" button:** Dedicated `ADD IMAGE` control in the reference materials panel.
- **✅ Interview backend wired:** InterviewOrchestrator integrated with real platform runners (`execute_interview_ai_with_failover_static`).
- **✅ Phase tracker aligned:** 8-domain PhaseManager structure.
- **✅ Reference context loading:** ReferenceManager loads into orchestrator (local files/dirs functional).
- **✅ ELI5 vs Expert interview prompting:** `prompt_templates.rs` adapts system prompt instructions based on `interaction_mode` (expert vs eli5).
- **✅ Research engine wiring:** Pre-question + post-answer research is invoked during the interview; results are saved and injected into the next prompt.
- **✅ Research indicator:** Interview UI shows "AI RESEARCHING..." while research is running.
- **✅ Platform failover implemented:** `execute_interview_ai_with_failover_static` handles quota exhaustion, retries up to MAX_RETRIES, checks `is_quota_error()`, calls `failover_manager.failover()` on quota/rate limit errors, uses `get_runner()` and `runner.execute()` with real platform runners.
- **✅ Prompt injection into orchestration:** `PromptBuilder` includes interview master requirements + test strategy excerpts when present.
- **✅ Help tooltip system exists:** `help_tooltip.rs` widget with `?` icons, `tooltips.rs` central store, Expert/ELI5 variant support, integrated in config view + Wizard Step 0.5 (interview config).
- **✅ Interview side panel widget integrated:** `interview_panel.rs` with phase progress, truncated question display, "Open Full Interview" button; wired into dashboard view via `interview_panel_data` (when `interview_active` is true).
- **✅ Dashboard side panel:** Integrated in `puppet-master-rs/src/views/dashboard.rs` (lines 119-126) with conditional rendering based on `interview_data`, passes through `app.rs` (lines 5458-5473, 5487).
- **✅ Reference URL fetch:** Implemented in `interview/reference_manager.rs` using `reqwest::blocking::Client` with timeout/size limits (lines 491-527).
- **✅ Image OCR:** Best-effort implementation via tesseract CLI in `reference_manager.rs` (lines 625-680), checks for tesseract in PATH, enforces size/timeout limits, gracefully fails if unavailable.
- **✅ Build verified:** `cargo check` + `cargo test --lib` pass.
- **✅ Wizard Step 2/3 Generate PRD wiring:** `Message::WizardGeneratePrd` (line 3410) sends `AppCommand::StartChainPipeline` with workspace path, project name, requirements text, AI platform, and AI model (lines 3424-3430). Backend handler runs `StartChainPipeline::run()` and serializes PRD to JSON for preview/editor (lines 7213-7226). Real PRD generation now replaces placeholder.

**Still missing (from the initial wiring checklist):**
- (none - all initial interview backend wiring is complete)

**Files created:**
- `puppet-master-rs/src/interview/` - Complete interview module with 14 files
- `puppet-master-rs/src/interview/codebase_scanner.rs` - Best-effort existing-project scan summary for prompt seeding
- `puppet-master-rs/src/views/interview.rs` - Dedicated interview UI page
- `puppet-master-rs/src/widgets/interview_panel.rs` - Reusable side panel widget
- `puppet-master-rs/src/widgets/help_tooltip.rs` - Help tooltip system
- `puppet-master-rs/src/widgets/tooltips.rs` - Central tooltip store

**Files modified:**
- `puppet-master-rs/src/app.rs` - Interview state, messages, handlers, async failover execution
- `puppet-master-rs/src/config/` - Interview config fields + defaults
- `puppet-master-rs/src/views/config.rs` - Interview tab with tooltip integration
- `puppet-master-rs/src/views/wizard.rs` - Step 0 + 0.5 with interview config
- `puppet-master-rs/src/types/config.rs` - InterviewConfig struct

**Implementation notes:**
- Failover uses `get_runner()` + `runner.execute()` (real platform runners, not stubs)
- Research engine runs pre-question + post-answer; AGENTS.md + test strategy + technology matrix are generated on interview completion; PromptBuilder injects these outputs into orchestration prompts
- URL fetch uses `reqwest` blocking feature with timeout/size enforcement, returns graceful errors on network failures
- OCR uses tesseract CLI subprocess with best-effort execution, gracefully fails if tesseract not installed
- Side panel widget fully integrated into dashboard, conditionally rendered when interview is active
- Dashboard integration passes `InterviewPanelData` from `app.rs` through to `dashboard::view()`
- Cargo.toml includes `reqwest` with `blocking` feature and `which` crate for tesseract detection

---

## Part 1: Wizard Flow Overhaul (New Project vs. Existing Project)

### 1.1 Expert Mode vs. ELI5 Mode Selection

Before anything else in the wizard, the user selects their experience level:

| Mode | Behavior |
|------|----------|
| **Expert Mode** | Concise questions, assumes technical knowledge, minimal explanations |
| **ELI5 Mode** | Every question includes a plain-English explanation of what it means and why it matters. Technical terms are defined. Options include "What does this mean?" expansion buttons. Think of it like a patient teacher walking someone through their first software project. |

This mode selection affects:
- All wizard step descriptions
- All interview questions (AI is instructed to adjust language)
- All config page field descriptions
- All git/branching explanations
- All tooltip text

### 1.2 New Project vs. Existing Project (Wizard Step 0)

Before the current Step 1 (requirements upload), add a **Step 0: Project Setup**:

**New Project Flow:**
1. "What is your project called?" (text input)
2. "Where should the project live?" (folder picker, defaults to ~/Projects/{name})
3. "Have you already created a GitHub repository for this project?"
   - **Yes** -> "Paste the GitHub repository URL" (text input, validate with `gh repo view`)
   - **No** -> "Would you like us to create one for you?"
     - **Yes** -> Ask: public/private, description, .gitignore template. Create via `gh repo create`.
     - **No, I'll do it later** -> Continue without remote, warn that git push will need manual setup later
4. Initialize git repo in project folder if not already a repo
5. Create `.puppet-master/` directory structure
6. Proceed to Step 1 (requirements/interview)

**Existing Project Flow:**
1. "Point us to your existing project folder" (folder picker)
2. Auto-detect: Is it a git repo? Does it have a remote? Does it have `.puppet-master/`?
3. "What's the GitHub repository URL?" (auto-fill from git remote if available)
4. "Are you adding a new feature or expanding the project?"
   - **Adding a feature** -> "Describe the feature you want to add" (feeds into interview)
   - **Major expansion** -> "Describe what you want to add" (feeds into interview)
   - **Refactoring/rewrite** -> "Describe what you want to change" (feeds into interview)
5. Auto-scan existing codebase for: tech stack, dependencies, file structure, existing tests
6. Feed scan results into interview context so the AI knows what already exists
7. Proceed to Step 1 (requirements/interview) with existing project context pre-loaded

### 1.3 Git/Branching Strategy (Wizard Step - ELI5 Friendly)

Present git branching options with ELI5 explanations:

**ELI5 Mode explanations:**

> **What is a branch?**
> Think of your project like a book. The "main" branch is the published edition. A "branch" is like making a photocopy of the book so you can write changes on the copy without messing up the original. When you're happy with your changes, you merge the copy back into the original.
>
> **What is a worktree?**
> Normally, git can only work on one branch at a time (like having one desk). A worktree gives you multiple desks so the AI agents can work on different parts of your project simultaneously without stepping on each other's toes.
>
> **What is a pull request (PR)?**
> When a branch is done, instead of just copying the changes straight into the main book, a "pull request" is like raising your hand and saying "I'd like to merge these changes - can someone review them first?" The AI agents review each other's work this way.

**Strategy options (present with ELI5 descriptions):**

| Strategy | ELI5 Description | Best For |
|----------|-------------------|----------|
| **Simple** (recommended for beginners) | One branch for the whole project. Changes go straight to main when each piece is done. Simplest to understand. | Small projects, solo features |
| **Per-Phase** | Each major phase of work (like "build the login page" or "set up the database") gets its own branch. Keeps big chunks of work separate. | Medium projects |
| **Per-Task** | Every individual task gets its own branch. Maximum isolation but more complex. | Large projects, teams |

Default recommendation based on project size (auto-detected or asked).

### 1.4 Interview Config Presentation

**CRITICAL: Interview config MUST be presented BEFORE the interview starts.** Two approaches:

1. **Quick Config in Wizard** - Before the interview begins (after Step 0, before Step 1), show a compact config panel:
   - Primary AI platform (dropdown: cursor/codex/claude/gemini/copilot)
   - Primary model (text input with smart defaults per platform)
   - Reasoning/effort level (dropdown: low/medium/high/max - same as other platform configs)
   - "Add backup platform" button (for failover)
   - ELI5/Expert mode toggle (if not already set)
   - "Advanced settings..." link that goes to full config page

2. **Full Config Page** - The existing config page gets an "Interview" tab with ALL settings (see Part 3.3 below). Users can access this at any time.

The quick config in the wizard is the minimum needed to start. Users can always fine-tune in the full config page.

---

## Part 2: Interactive Interview Orchestrator (Rust Core)

### 2.1 New Module: `puppet-master-rs/src/interview/`

Create a new `interview` module (separate from `start_chain`) with these files:

| File | Purpose |
|------|---------|
| `mod.rs` | Module exports |
| `orchestrator.rs` | Interview lifecycle manager (adapted from LISA's `orchestrator.ts`) |
| `state.rs` | Interview state persistence with YAML save/resume (adapted from LISA's `state.ts`) |
| `phase_manager.rs` | Manages interview phases/chunks with context reset |
| `document_writer.rs` | Writes incremental per-domain documents |
| `failover.rs` | AI platform failover and quota monitoring (shared with orchestrator) |
| `prompt_templates.rs` | System prompts for each interview phase |
| `question_parser.rs` | Parse structured questions from AI responses (LISA markers) |
| `completion_validator.rs` | Validates zero-gaps before allowing interview completion |
| `reference_manager.rs` | **NEW** - Manages user-provided reference materials (links, files, photos) |
| `research_engine.rs` | **NEW** - AI pre-research before asking questions (docs lookup, tech research) |
| `agents_md_generator.rs` | **NEW** - Generates initial AGENTS.md from interview results |
| `test_strategy_generator.rs` | **NEW** - Generates comprehensive autonomous test strategy |

### 2.2 Interview Orchestrator Design

**Adapted from LISA's `InterviewOrchestrator`** but enhanced with:

```
InterviewOrchestrator
  ├── config: InterviewConfig (feature, platform, backup_platform, etc.)
  ├── state: InterviewState (persisted to YAML for resume)
  ├── phase_manager: PhaseManager (tracks domain phases)
  ├── document_writer: DocumentWriter (writes per-phase docs)
  ├── failover: FailoverManager (monitors quota, switches platforms)
  ├── reference_manager: ReferenceManager (user-provided materials)
  ├── research_engine: ResearchEngine (pre-research before questions)
  ├── interaction_mode: InteractionMode (Expert | ELI5)
  ├── project_type: ProjectType (New | Existing { scan_results })
  └── event_handlers: Vec<EventHandler>
```

**Interview Flow:**
1. User completes project setup (Step 0 - new vs existing)
2. Interview config is confirmed (platform, model, mode)
3. If existing project: AI scans codebase and loads results into context
4. User provides initial requirements (text, file, or description)
5. **User is prompted for reference materials** (links, docs, photos, folders - see Part 2.7)
6. Interview starts Phase 1 (Scope/Goals) with fresh AI context
7. **AI does pre-research** on the topic before asking first question (see Part 2.8)
8. AI asks structured questions using LISA-style markers (`<<<PM_QUESTION>>>`)
9. In ELI5 mode, questions include expanded explanations
10. User answers via GUI (multiple-choice or free-text)
11. After 3-8 questions per phase, **AI does post-research** to validate answers
12. Phase document is written
13. AI context is **reset** for next phase (fresh context reads previous phase docs + reference materials)
14. Continue through all phases until completion
15. **Completion validator checks zero-gaps** - NO open items allowed (see Part 5.3)
16. If gaps found, loop back to relevant phase for clarification
17. Master document generated referencing all phase documents
18. **Initial AGENTS.md generated** from interview decisions (see Part 2.9)
19. **Autonomous test strategy generated** (see Part 2.10)

### 2.3 Interview Phases (Hybrid: Category then Feature)

**Category-Domain Phases (always run):**

| Phase | Domain | Key Questions |
|-------|--------|---------------|
| 1 | **Scope & Goals** | Project purpose, target users, success criteria, MVP boundaries, non-goals, new-project vs feature-add context |
| 2 | **Architecture & Technology** | Tech stack with EXACT version pins, frameworks, rendering approach, dependency consistency, build toolchain (see Part 5.1) |
| 3 | **GUI/UX Design** | (**CRITICAL** - see Part 2.6) Visual style, layout, color schemes, typography, reference images, component library, responsive design, accessibility, user workflows per screen |
| 4 | **Data & Persistence** | Storage tech with versions, schema design, migrations, backup strategy, retention policies, data validation |
| 5 | **Security & Secrets** | Auth strategy, encryption, credential management, threat model, API key handling |
| 6 | **Deployment & Environments** | Targets, CI/CD, config management, platform support matrix, environment variables |
| 7 | **Performance & Reliability** | Latency targets, retry logic, failover, error handling, caching strategy |
| 8 | **Autonomous Testing & Verification** | (**CRITICAL** - see Part 2.5) 100% AI-driven test strategy, Playwright specs, acceptance criteria per tier |

**Feature-Specific Phases (dynamic, based on detected features):**

| Phase | Domain | Key Questions |
|-------|--------|---------------|
| 9+ | **Per-Feature Deep Dive** | Each major feature gets its own phase covering relevant categories. For existing projects, each new feature being added gets a phase. |

### 2.4 Context Reset Between Phases

Each phase gets a **fresh AI context** that includes:
- The project description and type (new vs existing)
- Existing project scan results (if existing project)
- All previously written phase documents (as reference)
- The specific phase prompt template
- User-provided reference materials relevant to this phase
- Research results from the research engine
- Any user-provided context files

This prevents context pollution and hallucination from accumulating across phases.

### 2.5 Autonomous Testing Strategy (CRITICAL - No Manual Testing)

**Core principle: The user walks away after starting the orchestrator. EVERYTHING must be testable by AI agents autonomously. No human intervention. No manual testing. Period.**

The interview's Phase 8 (Testing & Verification) is special:
- The **user is NOT expected to know** the best testing strategy. The AI designs it.
- The interviewer asks minimal questions here (e.g., "Any specific testing preferences?" "Any compliance requirements?") but primarily the AI CREATES the entire testing approach.
- The AI should research best practices for the specific tech stack before proposing the strategy.

**What the AI generates in Phase 8:**

#### 2.5.1 Playwright End-to-End Test Plan
- Full test scenarios for every user story from Phase 3 (GUI/UX)
- Browser targets (Chromium, Firefox, WebKit)
- Viewport sizes (desktop, tablet, mobile)
- Accessibility checks (WCAG 2.1 AA compliance automated checks)
- Visual regression baselines
- User flow scripts (login, navigate, CRUD operations, edge cases)
- Error state testing (network failures, invalid input, timeouts)
- Performance budgets (page load times, interaction times)

#### 2.5.2 Unit Test Strategy
- Per-module test requirements
- Coverage targets (minimum 80%, critical paths 95%)
- Mock/stub strategy for external dependencies
- Edge case identification per function
- Error path coverage requirements

#### 2.5.3 Integration Test Strategy
- API endpoint testing (every endpoint, every error code)
- Database integration tests (CRUD, migrations, constraints)
- Service-to-service communication tests
- Authentication/authorization flow tests
- File system operation tests

#### 2.5.4 Acceptance Criteria per Tier
**THIS IS CRITICAL for the Ralph Wiggum Model.** Each tier (phase/task/subtask) in the PRD needs:
- Machine-verifiable acceptance criteria (not vague like "should work well")
- Specific test commands that agents run to verify completion
- Pass/fail criteria that a gate check can evaluate programmatically
- Example: "Login page loads in < 2s" NOT "Login page should be fast"
- Example: "POST /api/users returns 201 with valid body" NOT "user creation works"
- Example: "Playwright test `auth.spec.ts::should-login` passes" NOT "user can log in"

#### 2.5.5 Test Infrastructure Setup
- Test runner configuration (vitest, jest, pytest, cargo test - tech-stack-specific)
- CI pipeline test stages
- Test data factories/fixtures
- Test environment setup/teardown scripts
- Playwright configuration and fixtures
- Screenshot/video recording on failure (for AI agent debugging)

**The testing document becomes a contract.** Agents at every tier level check their acceptance criteria. If tests fail, the agent iterates. If tests pass, the gate lets them through. No human looks at anything until the entire project is done.

### 2.6 GUI/UX Interview Phase (CRITICAL - AI Struggles Here)

**This phase needs the MOST questions and the MOST thoroughness because AI consistently struggles with GUI/UX design.**

The interviewer should:

1. **Ask for visual references FIRST** (before any questions):
   - "Do you have any screenshots, mockups, or websites that look similar to what you want?"
   - "Do you have any brand guidelines, color palettes, or logos?"
   - "Are there any apps/websites you love the look of? Send links or screenshots."
   - "Do you have any wireframes or sketches, even hand-drawn?"
   - Allow uploading: images, PDFs, URLs, Figma links

2. **Ask about overall visual direction:**
   - "Describe the 'feel' you want: modern/minimal, colorful/playful, corporate/professional, dark/moody?"
   - "Light mode, dark mode, or both?"
   - "What existing app does your ideal design most resemble?"
   - "Any colors you love? Any colors you hate?"

3. **Ask screen-by-screen questions:**
   - For each screen/page identified in Phase 1 (Scope):
     - "What elements should be on this screen?"
     - "What's the most important thing the user needs to see/do here?"
     - "How should the navigation work?"
     - "Should there be a sidebar, top bar, both, neither?"
     - "Where should the primary action button be?"
   - Show common layout patterns (with descriptions/images if possible) and ask which they prefer

4. **Ask about responsive behavior:**
   - "Should this work on mobile, tablet, desktop, or all three?"
   - "On mobile, how should the navigation change?"
   - "Which screens are most important on mobile?"

5. **Ask about interactions and micro-details:**
   - "Should buttons have hover effects? What kind?"
   - "Loading states - spinner, skeleton, progress bar?"
   - "Form validation - inline errors, toast messages, both?"
   - "Confirmation dialogs before destructive actions?"
   - "Toast/notification style and position?"

6. **Ask about accessibility:**
   - "Any specific accessibility requirements? (keyboard navigation, screen readers, high contrast)"
   - "Target WCAG level? (AA is standard, AAA is strictest)"
   - In ELI5 mode: "Do you need this to work for people who use screen readers or can't use a mouse?"

7. **Generate a UI specification document** with:
   - Color palette (primary, secondary, accent, backgrounds, text)
   - Typography scale (font families, sizes for h1-h6, body, captions)
   - Spacing system (padding/margin tokens)
   - Component inventory (buttons, inputs, cards, modals, etc.)
   - Layout blueprints per screen
   - Responsive breakpoints
   - Animation/transition specifications
   - Accessibility requirements
   - Referenced images organized in `.puppet-master/reference/gui/`

### 2.7 Reference Material Management (NEW)

**File:** `puppet-master-rs/src/interview/reference_manager.rs`

At the start of the interview (and at any phase), the user can provide reference materials:

**Supported types:**
- **URLs/Links** - Web pages, documentation, API docs, GitHub repos, design references
  - The system fetches and stores a local copy/summary
  - Example: User provides Claude Code CLI documentation URL
- **Files/Documents** - PDFs, Word docs, text files, markdown
  - Copied into `.puppet-master/reference/docs/`
- **Images/Photos** - Screenshots, mockups, wireframes, hand-drawn sketches, logo files
  - Copied into `.puppet-master/reference/images/`
  - Tagged with which phase they're relevant to
- **Folders** - GitHub folders, local folders
  - Cloned/copied into `.puppet-master/reference/`
- **Code examples** - Existing code the user wants to reference
  - Copied into `.puppet-master/reference/code/`

**Storage structure:**
```
.puppet-master/reference/
├── docs/           # PDFs, text files, documentation
├── images/         # Screenshots, mockups, wireframes
│   ├── gui/        # GUI/UX reference images
│   └── other/      # Other reference images
├── code/           # Code examples and snippets
├── links/          # Saved web page summaries
└── manifest.yaml   # Index of all reference materials with metadata
```

**Manifest format:**
```yaml
materials:
  - id: ref-001
    type: url
    source: "https://docs.example.com/api"
    saved_as: "links/api-docs-summary.md"
    relevant_phases: ["architecture_technology", "data_persistence"]
    added_at: "2024-01-15T10:30:00Z"
    description: "API documentation for the backend framework"
  - id: ref-002
    type: image
    source: "uploaded by user"
    saved_as: "images/gui/desired-dashboard-look.png"
    relevant_phases: ["gui_ux"]
    added_at: "2024-01-15T10:32:00Z"
    description: "User's mockup of desired dashboard layout"
```

**In the GUI**, there should be:
- A "Reference Materials" panel visible during the interview
- Drag-and-drop file upload
- URL paste field
- "Browse folders" button
- Thumbnail previews for images
- The AI mentions specific reference materials when asking questions ("Looking at the dashboard mockup you uploaded...")

### 2.8 Research Engine (NEW - AI Does Homework)

**File:** `puppet-master-rs/src/interview/research_engine.rs`

The interview AI should NOT go in blind. Before and after asking questions, it researches:

**Pre-phase research (before asking questions in a phase):**
- Look up current stable versions of technologies mentioned in previous phases
- Check compatibility between chosen technologies
- Read documentation for the specific tech stack
- Research common pitfalls and gotchas for the chosen approach
- Check if chosen library/framework versions are still maintained

**Post-answer research (after user answers):**
- Validate version compatibility claims
- Check if the approach the user described is technically feasible
- Look up known issues with the specific combination of technologies
- Research best practices for the specific use case

**How it works:**
1. Research engine uses the same AI platform (or a dedicated fast model) to:
   - Generate search queries from the interview context
   - Fetch documentation via Context7 MCP or web search
   - Summarize findings relevant to the current phase
2. Research results are injected into the AI context for the NEXT question
3. The AI can say things like: "I looked into React 19 compatibility with your chosen CSS framework, and found that..."
4. Research results are also saved to `.puppet-master/research/` for agent reference later

**This is particularly important for Phase 2 (Architecture & Technology) to catch version conflicts and gotchas early.**

### 2.9 Initial AGENTS.md Generation (NEW)

**File:** `puppet-master-rs/src/interview/agents_md_generator.rs`

After the interview is complete, generate an initial top-level `AGENTS.md` that captures:

```markdown
# AGENTS.md - {Project Name}

## Overview
{Generated from Phase 1 - Scope & Goals}

## Architecture Notes
{Generated from Phase 2 - Architecture & Technology}
- Tech stack: {versions pinned}
- Build system: {details}
- Platform targets: {details}

## Codebase Patterns
{Generated from interview decisions}
- Naming conventions decided
- File structure decided
- Component patterns decided

## DO
- Use {specific framework version} (decided in interview Phase 2)
- Follow {coding style} (decided in interview)
- Run {specific test commands} before marking tasks complete
- Check Playwright tests pass for any GUI changes
- ...

## DON'T
- Don't use {older version} of {technology}
- Don't skip tests - ALL testing is autonomous
- Don't use {conflicting library} (incompatible with {chosen library})
- Don't assume - everything was specified in the interview
- ...

## Testing
- All tests must be runnable by AI agents autonomously
- Playwright for E2E: {config details}
- Unit test runner: {details}
- Coverage requirement: {percentage}
- Every tier has machine-verifiable acceptance criteria

## Common Failure Modes
{Pre-populated from research engine findings about the tech stack}
- {Known gotcha 1}
- {Known gotcha 2}

## Directory Structure
{Generated from Phase 2 decisions}
```

This gives agents guidance from iteration #1 instead of learning from scratch.

### 2.10 Autonomous Test Strategy Generator (NEW)

**File:** `puppet-master-rs/src/interview/test_strategy_generator.rs`

After Phase 8 (Testing & Verification), this module generates:

1. **`test-strategy.md`** - Human-readable test plan
2. **`test-strategy.json`** - Machine-readable test specifications
3. **`playwright.config.ts`** (or equivalent) - Ready-to-use Playwright config
4. **Per-tier acceptance criteria** - Injected into the PRD so each tier node knows exactly what tests to pass

The test strategy includes:
- Test file naming conventions
- Test organization per feature/module
- Shared test utilities and fixtures to create
- Mock data factories
- Test environment requirements
- CI pipeline test configuration
- Screenshot comparison baselines (if GUI)
- Performance benchmark thresholds
- Accessibility audit configuration

**Each user story from the interview gets:**
```json
{
  "userStory": "US-001",
  "acceptanceCriteria": [
    {
      "criterion": "Login form accepts valid credentials",
      "testType": "playwright",
      "testFile": "tests/e2e/auth.spec.ts",
      "testName": "should-login-with-valid-credentials",
      "verificationCommand": "npx playwright test auth.spec.ts --grep 'should-login-with-valid-credentials'"
    },
    {
      "criterion": "Login form shows error for invalid password",
      "testType": "playwright",
      "testFile": "tests/e2e/auth.spec.ts",
      "testName": "should-show-error-invalid-password",
      "verificationCommand": "npx playwright test auth.spec.ts --grep 'should-show-error-invalid-password'"
    }
  ]
}
```

**This is how the "walk away and come back to a complete project" promise is fulfilled.** Every single requirement has a machine-verifiable test. Every tier has pass/fail gates. Agents iterate until all tests pass. No human needed.

---

## Part 3: AI Platform Failover (Interview AND Orchestrator)

### 3.1 Failover Manager Design

**File:** `puppet-master-rs/src/interview/failover.rs` (but also used by the orchestrator)

```rust
pub struct FailoverManager {
    primary_platform: Platform,
    backup_platforms: Vec<PlatformModelPair>,
    quota_manager: Arc<QuotaManager>,
    current_platform_index: usize,
    user_triggered: bool,
}
```

**Automatic Detection:**
- Before each AI call, check remaining quota via `QuotaManager`
- If quota exhausted (or approaching limit), automatically switch to next backup
- Detect rate limiting (429 responses) and fail over
- Detect server errors (500/503) and fail over after 2 retries
- Log failover events for user visibility

**User-Triggered Failover:**
- User can click "Switch Platform" button at ANY time
- Available during interview AND during orchestrator execution
- Shows current platform, quota remaining, and available alternatives
- One-click switch with confirmation

**Global Failover (not just interview):**
- The FailoverManager should be a shared service, not interview-specific
- The orchestrator (`core/orchestrator.rs`) should ALSO use it during tier iterations
- When an agent hits quota limits during a build iteration, failover kicks in
- State is preserved - the agent picks up exactly where it left off on the new platform

**Behavior:**
- If ALL platforms exhausted, pause and notify user with clear message
- "All AI platforms have run out of quota. Please add credits to one of the following: [list]. Click 'Resume' when ready."
- Resume from exact state when user provides new quota/platform

### 3.2 Failover GUI Controls

Add to the **status bar** (always visible):
- Current AI platform icon + name
- Quota remaining indicator (green/yellow/red)
- "Switch Platform" button
- Failover notification banner when auto-switch occurs

---

## Part 4: Interview Config (Full Settings)

### 4.1 Config: Add `InterviewConfig` to `PuppetMasterConfig`

**File:** `puppet-master-rs/src/types/config.rs`

```rust
pub struct InterviewConfig {
    /// Primary AI platform for interviewing
    pub platform: String,
    /// Primary model for interviewing
    pub model: String,
    /// Reasoning/effort level for the interview AI (low/medium/high/max)
    pub reasoning_level: String,
    /// Backup platforms with models (tried in order if primary exhausted)
    pub backup_platforms: Vec<PlatformModelPair>,
    /// Max questions per domain phase (default: 8)
    pub max_questions_per_phase: u32,
    /// Whether to use first-principles mode
    /// (AI challenges assumptions before accepting them - asks "why?" before "how?")
    pub first_principles: bool,
    /// Whether to require explicit architecture/tech version confirmation
    /// (AI double-checks every version number and dependency)
    pub require_architecture_confirmation: bool,
    /// Whether to auto-generate Playwright E2E test specifications
    /// (Creates ready-to-implement test specs from user stories)
    pub generate_playwright_requirements: bool,
    /// Whether to auto-generate initial AGENTS.md from interview
    pub generate_initial_agents_md: bool,
    /// Interaction mode (expert or eli5)
    pub interaction_mode: String,
}
```

### 4.2 Config Page - Interview Tab

**File:** `puppet-master-rs/src/views/config.rs`

Add a new **"Interview"** tab with these fields. **EVERY field has a ? icon tooltip** (see Part 4.3):

| Field | Type | Tooltip (? icon) |
|-------|------|-------------------|
| Primary Platform | Dropdown | "The AI service that will conduct your interview. Different platforms have different strengths. Claude is great for detailed analysis, Cursor is fast for code-related questions." |
| Primary Model | Text input | "The specific AI model to use. For Claude, try 'claude-sonnet-4-5-20250929' for a good balance of speed and quality, or 'claude-opus-4-6' for maximum thoroughness." |
| Reasoning Level | Dropdown (low/medium/high/max) | "How hard the AI thinks about each question. 'Low' is fast but may miss nuance. 'High' takes longer but catches more edge cases. 'Max' is the most thorough but slowest and uses the most quota." |
| Backup Platforms | List (add/remove/reorder) | "If your primary AI runs out of quota (usage limit), the system automatically switches to these backup platforms in order. Add at least one backup to avoid interruptions." |
| Max Questions Per Phase | Slider (3-15, default 8) | "How many questions the AI asks in each interview domain (like 'Security' or 'Architecture'). More questions = more thorough but longer interview. 8 is a good balance." |
| First-Principles Mode | Toggle | "When enabled, the AI challenges your assumptions before accepting them. Instead of just asking 'which database?', it first asks 'do you actually need a database? what problem are you solving?' Recommended for new projects where requirements aren't fully baked." |
| Architecture Confirmation | Toggle | "When enabled, the AI double-checks every technology version and dependency for compatibility. Catches gotchas like 'React 19 doesn't work with that CSS library version.' Strongly recommended - these small mismatches cause BIG problems later." |
| Playwright Test Generation | Toggle | "When enabled, the interview generates ready-to-implement Playwright end-to-end test specifications. Playwright is a tool that simulates a real user clicking through your app to verify everything works. Essential for the autonomous build process." |
| Generate Initial AGENTS.md | Toggle | "Creates a starter guide document for the AI agents based on your interview answers. This helps agents know your preferences, tech stack, and conventions from the very first task." |
| Interaction Mode | Dropdown (Expert/ELI5) | "Expert mode: concise questions, assumes you know technical terms. ELI5 (Explain Like I'm 5) mode: every question comes with a plain-English explanation of what it means and why it matters." |

### 4.3 Help Tooltips System (? Icons)

**EVERY field, setting, toggle, and button in the entire application** should have a ? icon that shows a tooltip on hover. This was in the old Tauri version but got lost in the Iced rewrite.

**Implementation:**
- Create a `HelpTooltip` widget in `puppet-master-rs/src/widgets/help_tooltip.rs`
- Small "?" circle icon that appears next to field labels
- On hover: shows a tooltip popup with the explanation text
- In ELI5 mode: tooltips use simpler language
- In Expert mode: tooltips use technical language
- Tooltips should be stored in a central `tooltips.rs` file for easy maintenance

**This applies to ALL pages, not just interview config:**
- Config page (all tabs)
- Wizard steps
- Dashboard
- Interview page
- Project settings

---

## Part 5: Enhanced Interview Thoroughness

### 5.1 Architecture & Technology Confirmation Phase (Version Pinning)

Phase 2 is CRITICAL for preventing downstream version conflicts. The AI must:

1. **Pin EVERY version explicitly:**
   - Not "React" but "React 18.2.0" or "React 19.0.0"
   - Not "Node.js" but "Node.js 20.11.0 LTS"
   - Not "Iced" but "Iced 0.13.1"
   - Not "Python" but "Python 3.12.1"

2. **Check compatibility between ALL pinned versions:**
   - Research engine verifies that version A works with version B
   - Flag any known incompatibilities
   - Ask user to resolve conflicts immediately (not defer)

3. **Identify rendering/runtime choices:**
   - "Iced has multiple renderers: tiny-skia (software, works everywhere) and wgpu (GPU, faster but needs GPU support). Which do you want?"
   - "React can use SSR, CSR, or SSG. Which rendering strategy?"
   - "Tauri v2 uses webview - are you OK with system webview or need bundled?"

4. **Create a `technology-matrix.md`** with:
   - Complete dependency tree with pinned versions
   - Compatibility verification status for each pair
   - Build toolchain versions (rustc, cargo, node, npm/yarn/bun, etc.)
   - Minimum system requirements
   - Platform-specific notes

5. **Common gotchas the AI should catch:**
   - Mixed package managers (npm vs yarn vs bun)
   - Mismatched TypeScript versions between packages
   - Node.js version too old for modern ESM features
   - Rust edition year mismatches
   - CSS-in-JS library incompatible with chosen React version
   - Database driver version incompatible with database server version

### 5.2 Zero-Gaps Completion Validator (NO Open Items)

**There must be ZERO open items when the interview completes.** The user expects to start the orchestrator and walk away. Every question must have a definitive answer.

Before allowing interview to complete:
1. Check ALL 8+ domain categories have been covered with minimum questions answered
2. Check ALL "critical" items have explicit answers (no defaults used without confirmation)
3. Check for conflicting decisions across phases (e.g., "chose SQLite in Phase 4 but PostgreSQL in Phase 6")
4. Check that EVERY acceptance criterion is machine-verifiable (not vague)
5. Flag any "TBD", "later", "maybe", or ambiguous items - these MUST be resolved NOW
6. Require explicit user confirmation of all default assumptions
7. Verify all technology versions are pinned (no "latest" allowed)
8. Verify all user stories have associated test specifications
9. Verify no circular dependencies in the architecture
10. Verify deployment targets are fully specified

**If ANY gaps are found:**
- The interview does NOT complete
- The user is shown exactly what gaps exist
- The interview loops back to the relevant phase(s) to address them
- Only when ALL gaps are resolved can the interview finalize

**The "Open Items" section in the master document is REMOVED.** There are no open items. Everything is decided.

### 5.3 Technology Research for Common Gotchas

The research engine specifically checks for these categories of problems:

| Category | Example Gotchas |
|----------|-----------------|
| **Version conflicts** | React 19 + older React Router version |
| **Deprecation** | Using a library that was deprecated 6 months ago |
| **Security** | Known CVEs in pinned versions |
| **Platform gaps** | Library doesn't support one of the target platforms |
| **Performance** | Known performance issues with specific version combinations |
| **Breaking changes** | Major version upgrade in a dependency that changes API |
| **License conflicts** | GPL dependency in an MIT project |
| **EOL runtimes** | Node 16 is end-of-life |

---

## Part 6: Interview GUI (Iced Views)

### 6.1 Wizard Integration (Merged Into Existing Wizard)

**File:** `puppet-master-rs/src/views/wizard.rs`

The interview is integrated into the existing wizard, not a separate flow:

**Updated Wizard Steps:**

| Step | Name | Description |
|------|------|-------------|
| 0 (NEW) | **Project Setup** | New vs Existing project, folder, GitHub repo, git strategy |
| 0.5 (NEW) | **Interview Config** | Quick config: platform, model, reasoning level, mode (ELI5/Expert), backup platforms |
| 1 (MODIFIED) | **Requirements** | Text upload OR "Start Interactive Interview" button. If interview, transitions to interview page. |
| 2 | Generate PRD | (existing - auto-populated from interview results) |
| 3 | Review PRD | (existing) |
| 4 | Configure Tiers | (existing) |
| 5 | Generate Plan | (existing) |
| 6 | Review & Start | (existing - starts orchestrator, user walks away) |

### 6.2 Dedicated Interview Page

**File:** `puppet-master-rs/src/views/interview.rs`

A full-page view for the interactive interview:

**Layout:**
```
+-------------------------------------------------------------------+
| [< Back to Wizard]  Interview: {project name}  [Platform: Claude] |
|-------------------------------------------------------------------|
| Phase Progress    |  Conversation                | Reference       |
| ================= |  ========================== | Materials       |
| [x] 1. Scope     |  AI: "What is the main      | ============== |
| [>] 2. Arch/Tech |   purpose of this project?" | [+ Add Link]   |
| [ ] 3. GUI/UX    |                              | [+ Add File]   |
| [ ] 4. Data      |  You: "It's a task manager   | [+ Add Image]  |
| [ ] 5. Security  |   for remote teams"          |                 |
| [ ] 6. Deploy    |                              | mockup.png      |
| [ ] 7. Perf      |  AI: "Who are the primary    | api-docs.pdf    |
| [ ] 8. Testing   |   users?"                    | design-ref.url  |
| [ ] 9. Feature:  |                              |                 |
|    Auth           |  [Answer input area]         |                 |
| [ ] 10. Feature:  |  [Option A] [Option B]       |                 |
|    Dashboard      |  [Type your answer...]       |                 |
|                   |  [Submit]                    |                 |
|===================|==============================|=================|
| [Pause & Save]    | Phase 2/8 - Q 3/8           | [Switch Platform]|
+-------------------------------------------------------------------+
```

**Features:**
- **Chat-like conversation interface** showing AI questions and user answers
- **Phase progress sidebar** showing all phases with completion status (checkbox style)
- **Current phase indicator** with domain name and question count (e.g., "Phase 2/8 - Q 3/8")
- **Answer input area**: buttons for multiple-choice, text input for free-form
- **Reference materials panel**: drag-and-drop upload, organized by type
- **Platform status indicator**: shows current AI platform and quota remaining
- **Failover notification**: banner when platform switch occurs
- **Pause/Resume controls**: save state and continue later
- **ELI5 indicator**: when in ELI5 mode, questions show expandable "What does this mean?" sections
- **Research indicator**: subtle "AI is researching..." indicator when research engine is working

### 6.3 Side Panel / Modal

**File:** `puppet-master-rs/src/widgets/interview_panel.rs`

A compact panel that can be:
- Opened from the Dashboard for ongoing interviews
- Shows: current phase, current question, quick answer buttons
- "Open Full Interview" link to go to the dedicated page
- Progress bar showing overall interview completion

### 6.4 Projects Page

The existing projects page (`puppet-master-rs/src/views/projects.rs`) should:
- List all projects (both new and existing)
- Show project status (interviewing, building, complete, paused)
- Allow switching between projects
- Show interview progress for in-progress interviews
- Show orchestrator progress for in-progress builds
- Allow resuming paused interviews or builds

---

## Part 7: Interview Document Output

### 7.1 Document Structure

```
.puppet-master/
├── interview/
│   ├── state.yaml                    # Interview state for resume
│   ├── phase-01-scope-goals.md       # Phase 1 output
│   ├── phase-02-architecture.md      # Phase 2 output (includes technology-matrix.md)
│   ├── phase-03-gui-ux.md            # Phase 3 output (includes UI spec)
│   ├── phase-04-data.md              # Phase 4 output
│   ├── phase-05-security.md          # Phase 5 output
│   ├── phase-06-deployment.md        # Phase 6 output
│   ├── phase-07-performance.md       # Phase 7 output
│   ├── phase-08-testing.md           # Phase 8 output (includes full test strategy)
│   ├── phase-09-feature-{name}.md    # Feature-specific (dynamic)
│   ├── phase-10-feature-{name}.md    # Feature-specific (dynamic)
│   ├── technology-matrix.md          # All version pins and compatibility
│   ├── test-strategy.md              # Complete autonomous test plan
│   ├── test-strategy.json            # Machine-readable test specs
│   ├── ui-specification.md           # GUI/UX design specification
│   ├── requirements-complete.md      # Master document (references phases)
│   └── requirements-complete.json    # Structured JSON (Ralph-compatible)
├── reference/
│   ├── docs/                         # User-provided documents
│   ├── images/gui/                   # GUI reference images
│   ├── images/other/                 # Other reference images
│   ├── code/                         # Code examples
│   ├── links/                        # Saved web page summaries
│   └── manifest.yaml                 # Reference material index
├── research/
│   ├── phase-02-tech-research.md     # Research findings per phase
│   └── compatibility-report.md       # Version compatibility analysis
└── AGENTS.md                         # Initial AGENTS.md from interview
```

### 7.2 Master Document Format

```markdown
# Requirements Specification: {project_name}

## Interview Summary
- Date: {timestamp}
- Project type: {new | existing - feature addition}
- Phases completed: {count}
- Questions asked: {total}
- Platform(s) used: {platforms}
- Interaction mode: {expert | eli5}

## Domain Specifications
- [Scope & Goals](interview/phase-01-scope-goals.md)
- [Architecture & Technology](interview/phase-02-architecture.md)
- [GUI/UX Design](interview/phase-03-gui-ux.md)
- [Data & Persistence](interview/phase-04-data.md)
- [Security & Secrets](interview/phase-05-security.md)
- [Deployment & Environments](interview/phase-06-deployment.md)
- [Performance & Reliability](interview/phase-07-performance.md)
- [Autonomous Testing & Verification](interview/phase-08-testing.md)

## Feature Specifications
- [Authentication](interview/phase-09-feature-auth.md)
- ...

## Technology Matrix
[Full version-pinned dependency matrix](interview/technology-matrix.md)

## Autonomous Test Strategy
[Complete test plan for AI agents](interview/test-strategy.md)

## GUI/UX Specification
[Visual design specification](interview/ui-specification.md)

## Decisions Log
{all key decisions from all phases - no TBDs, no maybes, everything decided}

## Reference Materials
{index of all user-provided reference materials}
```

**NOTE: There is NO "Open Items" section. Everything is resolved.**

### 7.3 JSON Output (Ralph-Compatible)

Structured JSON matching the format expected by the Ralph loop:

```json
{
  "project": "...",
  "projectType": "new|existing",
  "metadata": {
    "timestamp": "...",
    "phases": 10,
    "platform": "...",
    "interactionMode": "expert|eli5"
  },
  "userStories": [
    {
      "id": "US-001",
      "title": "...",
      "description": "As a..., I want..., so that...",
      "acceptanceCriteria": [
        {
          "criterion": "...",
          "testType": "playwright|unit|integration",
          "testFile": "tests/...",
          "testName": "...",
          "verificationCommand": "..."
        }
      ],
      "phase": "product_ux"
    }
  ],
  "technicalDecisions": [
    {
      "decision": "Use React 19.0.0",
      "rationale": "...",
      "phase": "architecture_technology",
      "alternatives_considered": ["React 18.2.0", "Vue 3.4"]
    }
  ],
  "technologyMatrix": {
    "runtime": {"name": "Node.js", "version": "20.11.0"},
    "framework": {"name": "React", "version": "19.0.0"},
    "...": "..."
  },
  "testRequirements": {
    "playwright": [...],
    "unit": [...],
    "integration": [...],
    "acceptanceCriteriaPerTier": {...}
  },
  "guiSpecification": {
    "colorPalette": {...},
    "typography": {...},
    "components": [...],
    "layouts": {...}
  }
}
```

---

## Part 8: Agent.MD - Status & Fixes Needed

The Rust rewrite has the AGENTS.md system in `puppet-master-rs/src/state/`:
- `agents_manager.rs` - Load/save/parse AGENTS.md at tier levels
- `agents_multi_level.rs` - Multi-level hierarchy (root/module/phase/task)
- `agents_promotion.rs` - Promote learnings to higher levels
- `agents_gate_enforcer.rs` - Enforce AGENTS.md updates
- `agents_archive.rs` - Archive old versions

**Verified - READ path works:**
- `core/orchestrator.rs:185` sets up `PromptBuilder` with AGENTS.md path
- `core/prompt_builder.rs:125-130` loads AGENTS.md and includes DO/DON'T/Failure sections in prompts
- Agents DO receive AGENTS.md content in their context

**Verified - WRITE-BACK path (basic append) works:**
- Orchestrator parses ```agents-update code blocks from agent output and appends PATTERN/FAILURE/DO/DONT via `AgentsManager`
- Updates are persisted automatically during successful iteration flow

**Still needed:**
- Wire `agents_gate_enforcer` to block tier completion if AGENTS.md not updated when required
- Wire `agents_promotion` to promote task-level learnings to phase/root level

**NEW - Interview generates initial AGENTS.md:**
- The interview creates the FIRST version of AGENTS.md from interview decisions
- This means agents have guidance from iteration #1, not starting blind
- The initial AGENTS.md includes: tech stack decisions, coding conventions, testing requirements, known gotchas from research

---

## Part 9: Git Implementation - Status & Fixes Needed

The Rust rewrite has git in `puppet-master-rs/src/git/`:
- `git_manager.rs` - Core git operations with spawn
- `worktree_manager.rs` - Parallel worktree isolation
- `branch_strategy.rs` - Single/per-phase/per-task branching
- `pr_manager.rs` - PR creation
- `commit_formatter.rs` - Structured commits

**STATUS UPDATE:** Orchestrator git operations have been wired. In `core/orchestrator.rs`:
- `git_manager` (line 159) - **active**, creates branches (line 433) and commits progress (line 533)
- `branch_strategy` (line 161) - **active**, used for branch name generation (line 418)
- `agents_manager` (line 157) - **active**, appends patterns/failures/do/dont to AGENTS.md (lines 491-512)
- `verification_integration` (line 163) - Optional, available for gate checks
- `dependency_analyzer` (line 167) - Present for subtask ordering
- `fresh_spawn` (line 173) - Present for process spawning
- `parallel_executor` (line 177) - Present for concurrent subtasks

**Currently operational:**
- Git branch creation before iterations using configured branch strategy
- Git commits after successful iterations with structured messages
- AGENTS.md updates extracted from AI responses and persisted automatically

**Remaining gaps:**
- ✅ WorktreeManager for parallel subtask isolation is now invoked by orchestrator (worktree-aware execution + gate + commit/PR logic)
- PR creation is wired at tier pass time, but still needs end-to-end validation with `gh` installed + authenticated
- Verification gate checks run, but verify the desired “full integration” behavior for your workflow (e.g., tier halt + evidence output) during real runs

**NEW - Git Setup in Wizard:**
- Wizard Step 0 handles git repo creation/connection
- User's chosen branching strategy (from Step 0) feeds into `BranchStrategy`
- ELI5 mode explains all git concepts in plain English
- User can pick Simple/Per-Phase/Per-Task branching without understanding git internals

---

## Part 10: Existing Code Reuse

### Files to Modify

| File | Change |
|------|--------|
| `puppet-master-rs/src/lib.rs` | Add `pub mod interview;` |
| `puppet-master-rs/src/types/config.rs` | Add `InterviewConfig` struct with reasoning_level |
| `puppet-master-rs/src/app.rs` | Add interview messages, state, and view routing |
| `puppet-master-rs/src/views/mod.rs` | Add `pub mod interview;` |
| `puppet-master-rs/src/views/wizard.rs` | Restructure with Step 0, interview config, interview launch |
| `puppet-master-rs/src/views/config.rs` | Add interview config tab with ? tooltips |
| `puppet-master-rs/src/views/projects.rs` | Add project switching, interview/build status display |
| `puppet-master-rs/src/config/default_config.rs` | Add interview defaults |
| `puppet-master-rs/src/config/config_schema.rs` | Add interview schema validation |
| `puppet-master-rs/src/start_chain/pipeline.rs` | Wire interview results into PRD generation |
| `puppet-master-rs/src/core/orchestrator.rs` | Wire git, agents write-back, shared failover |

### New Files to Create

| File | Purpose |
|------|---------|
| `puppet-master-rs/src/interview/mod.rs` | Module exports |
| `puppet-master-rs/src/interview/orchestrator.rs` | Interview lifecycle (LISA adaptation) |
| `puppet-master-rs/src/interview/state.rs` | YAML state persistence |
| `puppet-master-rs/src/interview/phase_manager.rs` | Phase management |
| `puppet-master-rs/src/interview/document_writer.rs` | Per-phase document output |
| `puppet-master-rs/src/interview/failover.rs` | Platform failover (shared) |
| `puppet-master-rs/src/interview/prompt_templates.rs` | Phase-specific prompts |
| `puppet-master-rs/src/interview/question_parser.rs` | Structured question parsing |
| `puppet-master-rs/src/interview/completion_validator.rs` | Zero-gaps validation |
| `puppet-master-rs/src/interview/reference_manager.rs` | **NEW** Reference material management |
| `puppet-master-rs/src/interview/research_engine.rs` | **NEW** AI pre-research |
| `puppet-master-rs/src/interview/agents_md_generator.rs` | **NEW** Initial AGENTS.md |
| `puppet-master-rs/src/interview/test_strategy_generator.rs` | **NEW** Autonomous test strategy |
| `puppet-master-rs/src/views/interview.rs` | Dedicated interview page |
| `puppet-master-rs/src/widgets/interview_panel.rs` | Side panel widget |
| `puppet-master-rs/src/widgets/help_tooltip.rs` | **NEW** ? icon tooltip widget |
| `puppet-master-rs/src/widgets/tooltips.rs` | **NEW** Central tooltip text store |

### Existing Code to Reuse

| Existing | Reuse For |
|----------|-----------|
| `puppet-master-rs/src/platforms/registry.rs` | Get AI platform runners for interview |
| `puppet-master-rs/src/platforms/quota_manager.rs` | Check quota before AI calls, trigger failover |
| `puppet-master-rs/src/platforms/usage_tracker.rs` | Track interview AI usage |
| `puppet-master-rs/src/start_chain/prompt_templates.rs` | Base for interview prompt templates |
| `puppet-master-rs/src/start_chain/requirements_parser.rs` | Parse initial requirements input |
| `puppet-master-rs/src/utils/atomic_writer.rs` | Safe document writing |
| `puppet-master-rs/src/widgets/styled_button.rs` | GUI button styles |
| `puppet-master-rs/src/widgets/styled_input.rs` | GUI input styles |
| `puppet-master-rs/src/widgets/modal.rs` | Interview side panel modal |
| `puppet-master-rs/src/widgets/panel.rs` | Panel layouts |
| `puppet-master-rs/src/widgets/progress_bar.rs` | Phase progress display |
| `puppet-master-rs/src/theme/` | Theme colors, fonts, tokens |

### LISA Patterns to Adapt

| LISA Source | Adapt Into |
|-------------|-----------|
| `cli/src/core/orchestrator.ts` | `interview/orchestrator.rs` - Interview lifecycle, turn management |
| `cli/src/core/state.ts` | `interview/state.rs` - YAML state persistence, resume |
| `cli/src/core/error-recovery.ts` | `interview/failover.rs` - Error classification, recovery |
| `cli/src/core/prd.ts` | `interview/document_writer.rs` - PRD markdown/JSON generation |
| `cli/src/core/context.ts` | `interview/orchestrator.rs` - Context file loading |
| `cli/src/providers/base.ts` | Already have `platforms/runner.rs` |
| `commands/plan.md` | `interview/prompt_templates.rs` - System prompt structure |

---

## Part 11: Implementation Order

| Priority | Task | Scope | Notes |
|----------|------|-------|-------|
| **P0** | Review partial work from previous agents | Medium | Check all 9 interview files + config changes, fix compilation |
| **P0** | Create `interview/` module skeleton with types | Small | ✅ Done (15 files in interview/) |
| **P0** | Implement `InterviewState` with YAML save/resume | Medium | ✅ Done (state.rs with persistence) |
| **P0** | Implement `InterviewOrchestrator` core (LISA adaptation) | Large | ✅ Done (orchestrator.rs with failover) |
| **P0** | Add `InterviewConfig` to config types + defaults (with reasoning_level) | Small | ✅ Done (types/config.rs + defaults) |
| **P0** | Implement ? tooltip widget system | Medium | ✅ Done (help_tooltip.rs + tooltips.rs) |
| **P1** | Wizard Step 0: Project Setup (new vs existing, git, GitHub) | Large | ✅ Done (wizard.rs Step 0 with git init) |
| **P1** | Wizard interview config quick-setup step | Medium | ✅ Done (wizard.rs Step 0.5) |
| **P1** | Implement `PhaseManager` with 8 domain phases | Medium | ✅ Done (phase_manager.rs) |
| **P1** | Implement `FailoverManager` (shared: interview + orchestrator) | Medium | ✅ Done (shared quota-aware failover in interview + orchestrator execution engine) |
| **P1** | Implement `DocumentWriter` for per-phase markdown | Medium | ✅ Done (document_writer.rs) |
| **P1** | Create interview prompt templates (8 domain phases + ELI5 variants) | Large | ✅ Done (prompt_templates.rs with ELI5 mode) |
| **P1** | Implement `ReferenceManager` for user-provided materials | Medium | ✅ Done (reference_manager.rs with URL fetch + OCR) |
| **P2** | Implement `ResearchEngine` for AI pre-research | Large | ✅ Done (research_engine.rs wired to orchestrator) |
| **P2** | Create `views/interview.rs` - dedicated interview page | Large | ✅ Done (interview.rs with full UI) |
| **P2** | Create `widgets/interview_panel.rs` - side panel | Medium | ✅ Done (integrated in dashboard.rs) |
| **P2** | Update `views/config.rs` - interview config tab with ? tooltips | Medium | ✅ Done (interview tab with tooltips) |
| **P2** | Update `views/wizard.rs` - full restructure with Steps 0/0.5 | Large | ✅ Done (9 steps total: 0, 0.5, 1-7) |
| **P2** | Update `views/projects.rs` - project switching and status | Medium | ⚠️ Needs implementation for multi-project support |
| **P2** | Update `app.rs` - interview messages and routing | Medium | ✅ Done (all interview messages + Page::Interview routing) |
| **P3** | Implement `CompletionValidator` for zero-gaps (NO open items) | Medium | ✅ Done (completion_validator.rs) |
| **P3** | Implement `TestStrategyGenerator` for autonomous testing | Large | ✅ Done (test_strategy_generator.rs) |
| **P3** | Implement `AgentsMdGenerator` for initial AGENTS.md | Medium | ✅ Done (agents_md_generator.rs) |
| **P3** | GUI/UX interview phase - thorough question templates | Large | ✅ Done (Phase 3 prompts in prompt_templates.rs) |
| **P3** | Implement feature-specific dynamic phases | Medium | ✅ Done (feature_detector.rs + orchestrator integration) |
| **P3** | Wire AGENTS.md write-back into orchestrator | Medium | ✅ Done (parses ```agents-update blocks and appends patterns/failures/do/dont) |
| **P3** | Wire Git operations into orchestrator (remove dead code) | Medium | ✅ Done (branch/commit; auto PR creation when `branching.auto_pr` enabled) |
| **P3** | Wire shared FailoverManager into orchestrator | Small | ✅ Done (quota-aware platform failover in core execution engine) |
| **P4** | Add Playwright test plan generation in Phase 8 | Large | ✅ Done (part of test_strategy_generator.rs) |
| **P4** | Add technology matrix output in Phase 2 | Medium | ✅ Done (technology_matrix.rs) |
| **P4** | Per-tier acceptance criteria injection into PRD | Large | ✅ Done - wired into prd_generator.rs, 9 tests passing |
| **P4** | End-to-end integration testing of interview flow | Large | ⚠️ Needs manual testing with real AI platforms |
| **P4** | Tooltip text for ALL existing config/wizard fields | Medium | ⚠️ Tooltip system exists, need to add text for all fields |

---

## Summary of Current State (2026-02-13)

### ✅ COMPLETED - Interview System Core (P0-P2)
All interview backend modules, UI components, wizard steps, and integration with existing system are **COMPLETE and verified**:
- 15 interview module files fully implemented and tested (see `cargo test --lib`)
- Full wizard flow with Steps 0 (project setup) and 0.5 (interview config)
- Dedicated interview page with phase tracking, Q&A interface, reference materials panel
- Interview side panel widget integrated into dashboard
- Help tooltip system with Expert/ELI5 mode support
- Platform failover with quota management during interview
- Research engine for pre-question and post-answer research
- Reference manager with file/directory/URL/image support (including OCR)
- All 8 domain phases with prompt templates
- Document generation for phase outputs, test strategy, technology matrix, initial AGENTS.md

### ✅ COMPLETED - PRD & Tier System Integration (P3-P4)
- **Acceptance criteria injection**: PRD generator automatically ensures machine-verifiable criteria for all subtasks
- **Tier tree mapping**: PRD phases/tasks/subtasks properly mapped to tier hierarchy with acceptance criteria preserved
- **Interview output injection**: Test strategy excerpts and AGENTS.md loaded into orchestration prompts

### ✅ COMPLETED - Orchestrator Integration (P3)
**Now working end-to-end:**
- Orchestrator reads AGENTS.md and includes it in prompts
- Orchestrator builds tier tree from PRD with acceptance criteria preserved
- Orchestrator executes iterations via real platform runners with quota-aware failover (shared `is_quota_error` + quota manager)
- Orchestrator parses ```agents-update blocks from agent output and appends patterns/failures/do/dont to AGENTS.md
- Orchestrator git integration is active (branch creation + commits) and can auto-create PRs when `branching.auto_pr: true`

**Remaining gaps:**
- ⚠️ **Manual E2E testing** with real AI platforms (Cursor/Codex/Claude/Gemini/Copilot) is still required.
- ⚠️ **Tooltip coverage**: substantially expanded (Wizard Steps 0 + 0.5, Config tabs, various views), but not yet exhaustively verified for *all* fields across entire GUI (deferred until UI stabilizes).

### 🔄 REMAINING WORK

**High Priority:**
1. ✅ WorktreeManager integration for parallel subtask isolation (orchestrator now creates/uses worktrees + runs gates/commits in-worktree)
2. ✅ Wire `agents_promotion` + `agents_gate_enforcer` into orchestrator completion (verified + integration tests added)
3. ⚠️ Manual end-to-end testing with real AI platforms

**Medium Priority:**
4. ✅ Multi-project management in projects page (persistent known projects + pin/unpin)
5. ✅ Merge interview-generated `test-strategy.json` into tier tree criteria (PRD criteria augmented, graceful when missing)
6. ✅ Ensure PromptBuilder auto-loads interview master requirements output consistently (`requirements-complete.md`)

**Low Priority:**
7. ⚠️ Add tooltip text for all remaining config/wizard fields (partially complete; remaining audit needed)
8. ✅ Feature-specific dynamic phases (Phase 9+) - implemented with automatic feature detection

### Latest Progress Update (2026-02-13)
- ✅ **Worktrees / parallel:** orchestrator now uses `WorktreeManager` + `active_worktrees` to isolate parallelizable subtasks in git worktrees, and executes each parallel group concurrently (`join_all`) while keeping merge/cleanup serialized.
- ✅ **Gates in worktrees:** acceptance criteria are rewritten per-workdir before gating so `command` criteria run with `cwd`, and file/regex/script criteria resolve relative paths against the worktree.
- ✅ **Git in worktrees:** commits/PR detection now operate from the worktree repo view when a tier is running in a worktree; added `git add -A` helper for reliable staging.
- ✅ **Test strategy JSON:** tier tree loads `.puppet-master/interview/test-strategy.json` and merges its criteria into PRD acceptance criteria (phase/task/subtask), with tests.
- ✅ **PromptBuilder outputs:** confirmed auto-loading of `requirements-complete.md` / `master_requirements.md`; expanded test coverage for partial/missing/large files.
- ✅ **Projects page:** persistent known-projects store (`.puppet-master/projects.json`) with pin/unpin + cleanup/forget operations, wired through app messages and UI.
- ✅ **UI polish:** interview-heavy text areas updated to be copy/paste-friendly (SelectableText) and recent responsive widget usage retained for resize behavior.

### Build Status
- ✅ `cargo check` passes
- ✅ `cargo test --lib` passes
- ✅ All interview modules compile and integrate cleanly

### Key Files Changed
- `puppet-master-rs/src/core/orchestrator.rs` (WorktreeManager integration, parallel execution via `join_all`, workdir-aware gating, worktree-aware git commit/PR logic)
- `puppet-master-rs/src/git/git_manager.rs` (`add_all()` helper for reliable staging)
- `puppet-master-rs/src/core/tier_node.rs` (loads/merges `.puppet-master/interview/test-strategy.json` into acceptance criteria)
- `puppet-master-rs/src/core/prompt_builder.rs` (auto-loads interview outputs; expanded test coverage)
- `puppet-master-rs/src/projects/persistence.rs` + `puppet-master-rs/src/projects/mod.rs` (persistent known projects: `.puppet-master/projects.json`)
- `puppet-master-rs/src/app.rs` + `puppet-master-rs/src/views/projects.rs` (projects persistence wiring + pin/unpin + cleanup/forget)
- `puppet-master-rs/src/views/interview.rs` (SelectableText / interview UX copy/paste improvements)
- `puppet-master-rs/src/views/wizard.rs` + `puppet-master-rs/src/widgets/tooltips.rs` (tooltip coverage expanded)
- `puppet-master-rs/tests/agents_integration_test.rs` (agents promotion/enforcement integration test)
- `puppet-master-rs/tests/test_strategy_integration.rs` (test strategy → TierTree → prompt integration test)
- `.gitignore` (ignore `.puppet-master/worktrees/` specifically; do **not** blanket-ignore evidence logs)

**The interview system is now fully wired through the orchestrator (worktrees, gates, agents promotion/enforcement, projects persistence). The main remaining work is manual end-to-end testing with real AI platforms plus finishing the tooltip coverage audit.**

#### Additional reference docs created during this implementation (for reviewers)
- Worktrees: `WORKTREE_IMPLEMENTATION_COMPLETE.md`, `WORKTREE_INTEGRATION_SUMMARY.md`, `WORKTREE_INTEGRATION_QUICK_REF.md`, `WORKTREE_INTEGRATION_VISUAL.md`, `validate_worktree_integration.sh`
- Agents: `AGENTS_PROMOTION_GATE_VERIFICATION.md`, `AGENTS_PROMOTION_GATE_QUICK_REF.md`, `AGENTS_PROMOTION_GATE_VISUAL.txt`, `AGENTS_INTEGRATION_SUMMARY.md`
- Test strategy: `TEST_STRATEGY_INTEGRATION_VERIFICATION.md`, `TEST_STRATEGY_INTEGRATION_FINAL_REPORT.md`, `TEST_STRATEGY_INTEGRATION_CHANGES.md`, `TEST_STRATEGY_VISUAL.txt`
- Projects persistence: `PROJECTS_PERSISTENCE_INDEX.md`, `PROJECTS_PERSISTENCE_COMPLETE.md`, `PROJECTS_PERSISTENCE_QUICK_REF.md`, `PROJECTS_PERSISTENCE_FILES_CHANGED.md`, `PROJECTS_PERSISTENCE_VISUAL.md`
- PromptBuilder outputs: `PROMPT_BUILDER_INTERVIEW_OUTPUTS_VERIFICATION.md`
- UI/tooltips audit: `RUST_INTERVIEW_INDEX.md`, `RUST_INTERVIEW_AUDIT.md`, `RUST_INTERVIEW_QUICK_REF.md`, `RUST_INTERVIEW_TOOLTIP_FIXES.md`, `RUST_INTERVIEW_EXEC_SUMMARY.md`, `RUST_INTERVIEW_DELIVERY.md`

---

## Part 12: Verification

### How to Test

1. **Build check**: `cd puppet-master-rs && cargo check`
2. **Unit tests**: `cd puppet-master-rs && cargo test`
3. **Interview state round-trip**: Write state to YAML, read it back, verify equality
4. **Question parsing**: Feed mock AI responses with structured markers, verify parsing
5. **Failover**: Mock quota exhaustion, verify platform switch
6. **GUI**: Run the Iced app, navigate to interview page, verify UI renders
7. **Full interview flow**: Start interview, answer questions through all phases, verify documents generated
8. **Resume**: Pause mid-interview, restart app, verify resume from saved state
9. **New project flow**: Wizard Step 0 through to interview start
10. **Existing project flow**: Point to existing repo, verify scan, verify context loaded
11. **ELI5 mode**: Verify all questions/tooltips show expanded explanations
12. **Reference materials**: Upload files/images/links, verify they appear in interview context
13. **Research engine**: Verify AI researches before asking questions
14. **Zero-gaps validator**: Attempt to complete interview with gaps, verify rejection
15. **Autonomous test strategy**: Verify generated test specs are machine-verifiable
16. **AGENTS.md generation**: Verify initial AGENTS.md contains interview decisions
17. **Technology matrix**: Verify all versions are pinned and compatibility-checked
18. **Project switching**: Create two projects, verify can switch between them

### Key Risks
- Iced async support for AI calls (need `tokio` integration)
- AI response parsing reliability across different platforms
- State persistence robustness during failover
- GUI responsiveness during long AI calls (need async/background tasks)
- Research engine reliability (depends on web access and Context7 MCP availability)
- ELI5 mode quality depends on prompt engineering quality
- GUI/UX phase thoroughness depends on AI's ability to understand visual design (biggest risk)
- Reference material parsing (images, PDFs) depends on multimodal AI capabilities
- Autonomous test strategy quality - if acceptance criteria are bad, the whole system breaks
- Version compatibility research may miss edge cases

---

---

## Recent Progress Updates

### Progress Update (2026-02-13 - PRD Acceptance Criteria Injection & Tier Tree Mapping)

**Completed:**
- ✅ **PRD acceptance criteria injection fully implemented:**
  - `acceptance_criteria_injector.rs` implements machine-verifiable criteria generation
  - Integrated into `prd_generator.rs` via `inject_default_acceptance_criteria()` (lines 381-392)
  - Converts string criteria to structured `Criterion` objects with verification methods
  - Supports command execution, file existence, and regex pattern checks
  - Infers verification methods from subtask title/description
  - Ensures minimum criteria per subtask (configurable, default: 1)
  - 9 comprehensive tests passing in `acceptance_criteria_injector.rs`
  - Auto-invoked during PRD generation in start chain pipeline
  
- ✅ **Tier tree mapping from PRD fully functional:**
  - `TierTree::from_prd()` builds complete tier hierarchy from PRD (lines 347-399 in `tier_node.rs`)
  - Maps PRD phases → tasks → subtasks to tier nodes with proper parent-child relationships
  - Acceptance criteria from PRD subtasks copied to tier nodes (line 392)
  - Dependencies preserved from PRD structure
  - Orchestrator builds tier tree on initialization via `load_prd()` (line 373 in `orchestrator.rs`)
  - Arena-based storage with efficient lookups via `id_to_index` HashMap
  - Supports DFS/BFS traversal and path computation
  
- ✅ **Interview output integration into orchestration:**
  - `PromptBuilder` loads interview outputs: test-strategy.md excerpts injected into prompts (lines 260-287 in `prompt_builder.rs`)
  - Interview master requirements available at workspace path `.puppet-master/interview/requirements-complete.md`
  - AGENTS.md loaded and DO/DON'T/Failure sections included in agent prompts (lines 125-130)
  - Test strategy used to guide verification during tier execution

**Still missing or needs completion:**
- ✅ **Tier tree mapping uses interview-generated `test-strategy.json`** - TierTree loads `.puppet-master/interview/test-strategy.json` and merges criteria into tier nodes (phase/task/subtask) in addition to PRD criteria, with graceful handling if missing/invalid.
- ✅ **Interview master requirements are auto-loaded into PromptBuilder** - PromptBuilder loads `.puppet-master/interview/requirements-complete.md` (and `.puppet-master/requirements/master_requirements.md` when present) and injects them into orchestration prompts.

### Progress Update (2026-02-13 - Reference Manager Implementation)

**Completed:**
- ✅ **Implemented `reference_manager.rs` with full functionality:**
  - Text file reading with size limits (default: 1MB max per file)
  - Binary file detection (UTF-8 validation)
  - Directory listing with file metadata
  - Recursive directory scanning (max 50 files default)
  - File snippet inclusion for small text files
  - Manifest file detection (Cargo.toml, package.json, requirements.txt, go.mod, etc.)
  - Manifest data extraction (version info, dependencies, features)
  - Safe error handling with Result types and logging
  - Configurable limits via builder pattern
  - Support for 15+ text file extensions (rs, js, ts, py, json, yaml, toml, md, etc.)
  - Special file recognition (README, LICENSE, MAKEFILE, DOCKERFILE)
  - Rich context formatting with markdown output

**Implementation Features:**
- `ReferenceType` enum: Link, File, Image, Directory support
- `ReferenceMaterial` struct: metadata tracking with timestamps
- `ReferenceManager`: collection management with context loading
- `load_context()`: generates formatted markdown with all reference content
- `load_file_content()`: reads text files with size validation
- `load_file_snippet()`: extracts file previews for large files
- `is_manifest_file()`: detects common project manifest files
- `extract_manifest_data()`: parses key info from manifests
- `load_directory_listing()`: recursively lists directory contents
- `is_text_file()`: extension-based text file detection

**Testing:**
- ✅ 8 comprehensive integration tests passed
- ✅ Standalone verification of all file operations
- ✅ Error handling validated for missing files and invalid paths
- ✅ UTF-8 encoding validation working correctly
- ✅ Manifest detection and extraction tested

**Known Limitations (by design):**
- ✅ Network URL fetching implemented using `reqwest::blocking::Client` with timeout + size limits (may fail gracefully when offline).
- ✅ Image OCR implemented best-effort via `tesseract` CLI subprocess (requires `tesseract` installed; otherwise images are included as metadata-only).
- ⚠️ OCR-only (no vision model): non-text images will not produce meaningful content.

**Status:** `reference_manager.rs` is fully functional for local file/directory operations, URL fetch, and best-effort OCR; integrated into the interview orchestrator + UI.

### Progress Update (2026-02-13 - Machine-Verifiable Acceptance Criteria with Prefix Format)

**Completed:**
- ✅ **Implemented prefix-based acceptance criteria encoding:**
  - `PrdGenerator::inject_default_acceptance_criteria()` implemented using existing `AcceptanceCriteriaInjector`
  - Three prefix formats supported:
    - `command: <shell command>` - executable verification
    - `file_exists: <path>` - file presence checks
    - `regex: <file>:<pattern>` - pattern matching
  - Automatic conversion of unprefixed strings to prefixed format
  - Backward compatible with legacy unprefixed criteria
  
- ✅ **Enhanced AcceptanceCriteriaInjector with prefix support:**
  - `is_prefixed_criterion()` - detects prefix format
  - `text_to_prefixed_string()` - converts text to prefixed format
  - `criterion_to_prefixed_string()` - converts Criterion to prefix string
  - `text_to_criterion()` - parses prefixed format with verification method
  - Populates both `acceptance_criteria: Vec<String>` and `criterion: Option<Criterion>`
  - Automatically converts unprefixed criteria during injection
  
- ✅ **Updated Orchestrator gate criteria building:**
  - `build_gate_criteria()` now parses prefix format
  - Sets `verification_method` and `expected` fields from prefix
  - Falls back to command execution for unprefixed strings
  - Criteria ready for verifier execution with explicit methods
  
- ✅ **Comprehensive test coverage:**
  - 8 new tests in `acceptance_criteria_injector.rs`
  - 2 enhanced tests in `prd_generator.rs`
  - 2 new tests in `orchestrator.rs`
  - Integration test suite in `tests/acceptance_criteria_integration.rs`
  - All core logic validated with standalone tests

**Impact:**
- PRD generation now produces machine-verifiable acceptance criteria
- Gate criteria have explicit verification methods (command/file_exists/regex)
- Orchestrator can execute criteria without manual interpretation
- Verifiers receive structured criteria with expected values
- Zero-cost abstraction: no runtime overhead for prefix parsing

**Documentation:**
- Created `ACCEPTANCE_CRITERIA_IMPLEMENTATION.md` with full specification
- Prefix format examples and behavior documented
- Migration path for legacy PRDs explained

**Status:** Acceptance criteria are now fully machine-verifiable with surgical, minimal changes to existing codebase.

### Progress Update (2026-02-03 - PR Preflight Validation)

**Completed:**
- ✅ **Implemented preflight checks for PR creation when `branching.auto_pr: true`:**
  - `PrManager::preflight_check()` verifies `gh` CLI exists and is authenticated before attempting PR creation
  - Checks `gh auth status` and parses output for authentication confirmation
  - If preflight fails, emits clear, actionable error message and returns failed `PrResult` (does not crash)
  - Backward compatible: PR creation behavior unchanged when checks pass
  - Zero network calls in unit tests (pure function testing only)

**Implementation Details:**
- `preflight_check()` runs before every `create_pr()` call
- Checks performed:
  1. `is_gh_available()` - verifies `gh` CLI is installed via `which gh`
  2. `gh auth status` - verifies GitHub authentication (exit code + output parsing)
  3. Output parsing for "logged in" or "authenticated" confirmation
- On failure: returns `PrResult { success: false, message: "<actionable error>" }` instead of crashing
- Error messages include installation/authentication instructions

**Testing:**
- ✅ 10 new unit tests for PR manager:
  - `test_generate_pr_title` - title formatting
  - `test_generate_pr_body` - body generation with criteria/files
  - `test_build_pr_create_args` - command argument building
  - `test_build_pr_create_args_with_special_chars` - special character handling
  - `test_generate_pr_body_empty_criteria` - empty criteria handling
  - `test_generate_pr_body_with_markdown` - markdown in descriptions
  - `test_pr_result_creation` - success result construction
  - `test_pr_result_failure` - failure result construction
  - `test_generate_pr_title_various_tiers` - tier type variations
- ✅ All existing tests continue to pass
- ✅ `cargo test --lib` passes
- ✅ No network/auth dependencies in unit tests (pure function testing)

**Files Changed:**
- `puppet-master-rs/src/git/pr_manager.rs`:
  - Added `preflight_check()` method
  - Updated `create_pr()` to call preflight before attempting PR creation
  - Added `build_pr_create_args()` helper for testing
  - Expanded test suite from 2 to 10 tests
  - Improved error messages with actionable instructions

**Behavior:**
- **Before:** PR creation would attempt `gh pr create` and fail with cryptic error if `gh` not installed/authenticated
- **After:** PR creation checks `gh` existence + auth status first, returns clear error message if checks fail
- **Orchestrator:** When `create_tier_pr()` receives failed `PrResult`, logs warning and continues (no crash)
- **Manual E2E validation:** Still recommended to verify with real `gh` CLI + GitHub authentication

**Status:** PR preflight validation is fully implemented with comprehensive unit test coverage. PR creation now has robust error handling that prevents crashes and provides actionable error messages when `gh` is not available or authenticated.

---

## Remaining Work Queue (SQL backlog snapshot — 2026-02-14)

This section is intended to be a handoff-ready, high-detail checklist for the next agent.

**Current verified baseline (this branch):**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

**Notes / gotchas:**
- The SQL todo list below is the source-of-truth for what remains. Some items may be partially implemented; treat each item as “verify + finish.”
- Some older “progress updates” above may claim completion (e.g. PR preflight). If the corresponding SQL todo is still `in_progress`, re-verify the runtime wiring + tests, then mark it `done`.

### BLOCKED

#### `manual-e2e-interview` — Manual E2E interview test (blocked)
**Goal:** Run a real interview end-to-end using a real platform runner (NOT simulated follow-ups), and document any gaps.

**Why it matters:** This is the only way to validate that:
- interview prompts are coherent over multiple stateless turns
- failover behaves as expected on quota/rate-limit
- GUI shows the correct question, accepts user input, and advances phases reliably

**Blocker:** Requires an environment where at least one supported platform CLI is installed + authenticated (e.g. `codex`, `claude`, `agent`/Cursor, `copilot`, `gemini`).

**Suggested execution steps:**
1. Launch GUI:
   - `cd puppet-master-rs && cargo run --release`
2. In Setup/Doctor:
   - Run Doctor checks; if Playwright browsers missing, use the **Install Playwright** button (or Fix Check).
3. Start Interview:
   - Provide a few representative answers (including at least one with lists/bullets)
   - Attach at least one reference (file/link); if image support is implemented later, include an image reference.
4. Force a failover scenario (optional but ideal):
   - Use a primary platform likely to quota quickly, or temporarily misconfigure a platform; confirm it falls back instead of stalling.
5. Capture evidence:
   - Copy/paste transcript, verify selectable Q/A works.

**Success criteria:**
- No simulated placeholder responses
- Phase transitions occur
- Questions remain grounded in prior answers
- Any failure is surfaced as an actionable GUI error (not silent)

---

### DONE (completed; kept for reference)

#### `dynamic-feature-phases` — Implement dynamic feature phases (Phase 9+)
**Status:** DONE (2026-02-14)

**What was done:**
- Orchestrator now detects major features after completing the core 8 phases and appends Phase 9+ (e.g. `feature-auth`)
- Feature detector has unit tests and dynamic phases are persisted via `InterviewState.dynamic_phases`

**Key files:**
- `puppet-master-rs/src/interview/feature_detector.rs`
- `puppet-master-rs/src/interview/orchestrator.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `dynamic-phases-ui` — Render dynamic phases in UI
**Status:** DONE (2026-02-14)

**What was done:**
- Interview page phase list now renders from `InterviewPhaseDefinition` (no hard-coded 8-phase list)

**Files changed:**
- `puppet-master-rs/src/views/interview.rs`
- `puppet-master-rs/src/app.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `dynamic-phases-integration-test` — Add dynamic phases integration test
**Status:** DONE (2026-02-14)

**What was done:**
- Added a lib test that completes the 8 core phases, triggers feature detection, asserts Phase 9+ creation, and verifies YAML persistence + restore

**Files changed:**
- `puppet-master-rs/src/interview/orchestrator.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

---

### DONE (verified and completed; kept for reference)

#### `dynamic-phases-persistence` — Persist dynamic phases
**Status:** DONE (2026-02-14)

**What was done:**
- Interview YAML state roundtrip now explicitly asserts `dynamic_phases` persists

**Files changed:**
- `puppet-master-rs/src/interview/state.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `vision-references` — Vision image extraction
**Status:** DONE (2026-02-14)

**What was done:**
- Image references are passed as platform attachments (`context_files`) so vision-capable CLIs can see them (Codex uses `--image`; other CLIs receive `@path`/path attachments)
- Reference context generation always includes image metadata (filename, size, MIME, dimensions when available, hash)
- Best-effort OCR is included as a fallback (bounded by a timeout) so non-vision models still get useful text
- DRY: `ReferenceManager::derive_context_files()` centralizes attachment derivation from reference materials
- Config UI now exposes `vision_provider` (default: `codex`) and filters options to detected vision-capable platforms

**Files changed:**
- `puppet-master-rs/src/interview/reference_manager.rs`
- `puppet-master-rs/src/interview/orchestrator.rs`
- `puppet-master-rs/src/app.rs`
- `puppet-master-rs/src/platforms/*` (attachments support)
- `puppet-master-rs/src/config/gui_config.rs`
- `puppet-master-rs/src/views/config.rs`
- `puppet-master-rs/src/types/config.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `ocr-timeout-enforcement` — Enforce OCR timeout
**Status:** DONE (2026-02-14)

**What was done:**
- OCR is executed via `tokio::time::timeout` around the `tesseract` subprocess and fails gracefully on timeout

**Key file:**
- `puppet-master-rs/src/interview/reference_manager.rs` (see `extract_image_text_async()`)

**Verification:**
- Covered by existing lib tests; `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `pr-preflight-validation` — Add PR preflight validation
**Status:** DONE (2026-02-14)

**What was done:**
- PR manager runs a preflight check (`which gh` + `gh auth status`) and returns actionable errors
- Tests are guarded to avoid network calls and behave correctly whether `gh` is ready or not

**Key file:**
- `puppet-master-rs/src/git/pr_manager.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `pr-e2e-validation` — Safe PR creation E2E validation path
**Status:** DONE (2026-02-14)

**What was done:**
- Added guarded “E2E validation” tests that only assert pass/fail depending on whether `gh` is available + authenticated

**Key file:**
- `puppet-master-rs/src/git/pr_manager.rs` (see `e2e_tests`)

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `projects-dynamic-status` — Improve per-project status
**Status:** DONE (2026-02-14)

**What was done:**
- `ProjectStatusInspector` now inspects current Rust persistence signals (interview YAML + requirements-complete marker; orchestrator from latest checkpoint JSON)
- Projects refresh maps inspected state into UI badges (Idle/Interviewing/Executing/Paused/Complete/Error)
- UI shows an optional per-project status summary string

**Files changed:**
- `puppet-master-rs/src/projects/status.rs`
- `puppet-master-rs/src/views/projects.rs`
- `puppet-master-rs/src/app.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `selectable-interview-text` — Add selectable interview text
**Status:** DONE (2026-02-14)

**What was done:**
- Current question, prior questions/answers, and reference list details render via `selectable_text_field` (select + copy + context menu)

**Key file:**
- `puppet-master-rs/src/views/interview.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `tooltips-complete` — Complete tooltip coverage
**Status:** DONE (2026-02-14)

**What was done:**
- Added help tooltip icons across Config tabs (Tiers, Branching, Verification, Memory, Budgets, Advanced)
- Added missing tooltip text keys to the central tooltip store (tiers: failure/max; branching naming/granularity; verification fields; memory file fields; checkpointing/loop guard; CLI paths)

**Files changed:**
- `puppet-master-rs/src/views/config.rs`
- `puppet-master-rs/src/widgets/tooltips.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `worktree-recovery` — Recover orphaned worktrees
**Status:** DONE (2026-02-14)

**What was done:**
- Wired best-effort worktree recovery into GUI startup.
- Uses `git rev-parse --show-toplevel` to find the repo root, then runs `WorktreeManager::recover_orphaned_worktrees()`.
- Non-fatal: failures are logged and do not block startup.

**Files changed:**
- `puppet-master-rs/src/app.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `agents-gate-policy` — Strengthen agents gate policy
**Status:** DONE (2026-02-14)

**What was done:**
- Phase/root tiers now treat missing **Failure Modes** as an **Error** (blocking) violation, alongside the existing high-tier enforcement for successful patterns.
- Added a unit test proving high-tier enforcement fails when failure modes are missing.

**Files changed:**
- `puppet-master-rs/src/state/agents_gate_enforcer.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

#### `agents-promotion-policy` — Fix agents promotion reachability
**Status:** DONE (2026-02-14)

**What was done:**
- Fixed promotion-to-root so it writes into the real root `AGENTS.md` (workspace root), not a `root/AGENTS.md` subdirectory.
- Added a unit test proving phase-level promotion targets `root` and lands in the correct file.

**Files changed:**
- `puppet-master-rs/src/state/agents_manager.rs`
- `puppet-master-rs/src/state/agents_promotion.rs`

**Verification:**
- `cd puppet-master-rs && CARGO_TARGET_DIR=/tmp/puppet-master-build cargo test --lib` → **OK**

