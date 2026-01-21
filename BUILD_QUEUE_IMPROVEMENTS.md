# RWM Puppet Master — BUILD_QUEUE_IMPROVEMENTS.md

> Comprehensive Improvements Queue
> Tasks: 56
> Focus: P0 Critical fixes, P1 High priority, P2 Medium priority, New Features

**Generated:** 2026-01-20
**Based on:** ClaudesMajorImprovements.md, CodexsMajorImprovements.md, Zeroshot patterns, Codex-Weave patterns

---

## Executive Summary

This document organizes all identified improvements into actionable tasks with AI agent prompts, context locations, testing instructions, and parallelization information. The improvements are grouped by priority:

| Priority | Count | Description |
|----------|-------|-------------|
| **P0 - Critical** | 22 | Must fix first - system won't work reliably without these |
| **P1 - High** | 27 | Important for production viability |
| **P2 - Medium** | 12 | Quality of life and scale improvements |
| **New Feature** | 1 | Agent termination option |

### New P1 Tasks Added (P1-T22 through P1-T27) — Implementation Verification Layer

These tasks address a critical gap discovered during review: **the system can generate a valid PRD but still miss major components during implementation** due to:
- Code implemented but never wired/connected
- Cross-file contract drift (events, types, schemas)
- Dead code / orphan exports
- Missing integration path tests
- Platform compatibility issues (Windows/Unix)

These tasks add **post-implementation verification** that catches what PRD verification cannot.

---

## Master Implementation Plan: Requirements → PRD → Execution Completeness (Never Miss Major Components)

This is the concrete, end-to-end blueprint for beefing up requirements parsing, PRD generation, task/subtask building, and acceptance criteria so the system cannot silently miss major components. The goal is not “better prompts”; it’s **hard guarantees** enforced by **traceability + coverage gates + multi-pass gap fill**.

### Non‑Negotiable Invariants (Make Missing Requirements Impossible to Ignore)

1. **No silent truncation**: the pipeline must never “slice away” requirements to fit caps without producing a hard failure + missing list.
2. **No manual verification**: generated acceptance criteria must be machine-verifiable (`command`, `regex`, `file_exists`, `browser_verify`, `ai`) — never `manual`.
3. **Traceability is required**: every PRD Phase/Task/Subtask must link to at least one source requirement (via `sourceRefs` and/or normalized requirement IDs).
4. **Coverage is enforced**: PRD generation must compute coverage metrics and hard-fail below a threshold (and/or run an AI coverage diff that lists missing requirements).
5. **Self-fix loops exist**: on coverage/quality failure, Start Chain must automatically run repair passes (not leave the user with a bad PRD).
6. **Evidence is persisted**: coverage reports, trace matrices, and missing lists must be saved under `.puppet-master/` for audit/debug and GUI display.

### Canonical Artifacts (What “Completeness” Produces on Disk)

All artifacts below are produced by Start Chain and treated as first-class evidence (not optional logs):

- `.puppet-master/requirements/parsed.json` — normalized parsed structure with section paths (and, when possible, line numbers)
- `.puppet-master/requirements/inventory.json` — atomic requirement units (`REQ-*`) extracted from the source (recommended)
- `.puppet-master/requirements/id-map.json` — stable mapping (`excerptHash` → `REQ-*`)
- `.puppet-master/requirements/questions.md` + `.puppet-master/requirements/assumptions.md` — requirements interview output
- `.puppet-master/requirements/traceability.json` — requirement ↔ PRD mapping (matrix)
- `.puppet-master/requirements/coverage.json` — coverage report + missing requirements list
- `.puppet-master/requirements/prd-quality.json` — PRD quality report (errors/warnings + repair hints)
- `.puppet-master/prd.json` — PRD (must be fully traceable + verifiable)
- `.puppet-master/architecture.md` — architecture doc (must reference PRD + key requirements/NFRs)
- `.puppet-master/plans/*.json` — tier plan outputs

### Start Chain v2+ Pipeline (Concrete, Multi‑Pass, Fail‑Fast)

The pipeline becomes a deterministic state machine with explicit outputs at every step. Each “pass” is a fresh agent process (RWM requirement).

**Pass 0 — Parse + Normalize**
- Parse input (md/docx/pdf/text) into `ParsedRequirements` with a stable hierarchy of `sections[]`
- Run **structure detection** (H1-title flattening, heading-level distribution):
  - if single H1 with H2s: treat H2s as phases (H1 becomes doc title)
  - if no headings: synthesize structure by chunking
- Compute basic parse coverage heuristics (source chars vs extracted, heading counts) and hard-fail on clearly broken parses
- Persist `.puppet-master/requirements/parsed.json`

**Pass 1 — Requirements Inventory (Atomic Units)**
- Build an explicit inventory of atomic requirements (recommended even if you also use `sourceRefs`):
  - `REQ-0001`, `REQ-0002`, …
  - `sectionPath`, `excerpt`, `excerptHash`, optional `lineNumbers`
  - classification: `functional | nfr | constraint | open_question`
  - severity: `must | should | could`
- Persist `.puppet-master/requirements/inventory.json`
- Hard-fail if inventory is suspiciously small relative to source size (coverage heuristic)

**Pass 2 — Requirements Interview (Optional but Strongly Recommended)**
- Generate top questions + default assumptions that materially affect verification/testability.
- Gate (optionally) on critical unanswered questions; otherwise persist assumptions and continue.
- Persist `.puppet-master/requirements/questions.md` + `.puppet-master/requirements/assumptions.md`

**Pass 3 — PRD Outline (Structure First, Stable IDs)**
- Generate an outline PRD that is intentionally “skeletal” but complete in coverage intent:
  - stable IDs for phases/tasks/subtasks
  - each item includes preliminary `sourceRefs` / `requirementIds`
  - minimal descriptions; focus on correct decomposition and full requirement coverage

**Pass 4 — PRD Expansion (One Chunk at a Time)**
- Expand the outline into full PRD content in isolation:
  - expand per phase, then per task (chunked prompts)
  - generate **machine-checkable** acceptance criteria (never manual)
  - generate real test plan commands (project-aware)
  - attach `sourceRefs` for every item

**Pass 5 — PRD Quality Gate (Schema + Verifiability)**
- Validate:
  - schema alignment (criterion types match registered verifiers)
  - zero manual criteria
  - each criterion has a usable `target` (command/path/pattern)
  - test plans are not empty when expected (at least project-default checks)
  - filler criteria (“Implementation complete”) under a strict limit
- Hard-fail with actionable errors and exact PRD paths (phase/task/subtask/criterion indices)

**Pass 6 — Coverage Gate + AI Coverage Diff**
- Compute coverage metrics (heuristics) and persist `.puppet-master/requirements/coverage.json`
- Run AI “coverage diff” to list missing requirements (by `REQ-*` + excerpt) or missing sections/requirements (if inventory is not implemented)
- Hard-fail if below threshold; otherwise continue

**Pass 7 — Gap Fill Loop (Automatic Repair)**
- If missing requirements exist:
  - create new PRD items or augment existing ones (preserving stable IDs)
  - regenerate acceptance criteria/test plan for affected items
  - re-run Quality Gate + Coverage Gate
- Stop conditions:
  - max repair passes (configurable)
  - repeated identical missing list triggers escalation (“gutter”)

### Decomposition Rules (Phase → Task → Subtask)

To prevent “major things missed” via underspecified or oversized items, enforce these decomposition rules during PRD generation:

- **Phase**: a major milestone / system area (user-visible capability or foundational infrastructure)
  - Must have a clear scope statement and explicit out-of-scope list
  - Should group related Tasks; avoid “everything” phases

- **Task**: a coherent deliverable that can be validated with automated checks
  - Should produce concrete artifacts (files, commands, UI flows, state machine behavior)
  - Must have ≥1 Subtask (prefer 2–8 subtasks for non-trivial tasks)

- **Subtask**: an atomic unit sized for one agent context window
  - Must be implementable without needing “the rest of the project” context
  - Must include machine-verifiable acceptance criteria and a non-empty test plan
  - Must not depend on unspecified external/manual actions

### Acceptance Criteria Rules (Machine‑Verifiable, Non‑Filler)

- **No manual**: `manual` criteria are forbidden.
- **Every criterion must be checkable**: `type` implies a valid `target` (command/path/pattern/scenario).
- **Prefer deterministic verifiers**: use `command`/`file_exists`/`regex`/`browser_verify` before `ai`.
- **Avoid filler**: “Implementation complete” is allowed only as a last resort and must be paired with at least one concrete check.
- **Coverage of intent**: each Subtask’s criteria should collectively verify (a) the intended behavior, (b) artifacts exist, and (c) tests/typecheck/build pass as applicable.

### Data Contracts (Concrete Fields to Enforce)

To make completeness enforceable, these fields must be required by prompts, types, and validators:

- **RequirementUnit** (`inventory.json`) (recommended)
  - `id: "REQ-0001"`
  - `sectionPath: string`
  - `excerpt: string`
  - `excerptHash: string`
  - `kind: "functional" | "nfr" | "constraint" | "open_question"`
  - `severity: "must" | "should" | "could"`

- **PRD item traceability** (Phase/Task/Subtask)
  - `sourceRefs?: SourceRef[]` (see P1-T03)
  - and/or `requirementIds?: string[]` (normalized list of `REQ-*`)

- **CoverageReport** (`coverage.json`)
  - `sourceChars`, `extractedChars`, `coverageRatio`
  - `requirementsTotal`, `requirementsCovered`, `requirementsCoverageRatio`
  - `missingRequirements: Array<{ id: string; excerpt: string; sectionPath: string }>`
  - `warnings`, `errors`, `timestamp`, `inputs`

### Where This Plan Is Implemented in the Queue (Task Map)

This blueprint is realized by existing tasks in this document; execute them as a cohesive “completeness workstream”:

- **Schema & verifier alignment**: `P0-T01`
- **Structure detection + “1 section” fix + heuristic fail-fast**: `P0-T02`
- **No manual criteria + classifier + validator**: `P0-T03`
- **Start Chain/GUI wiring so the real pipeline runs**: `P0-T06`
- **Prompt context completeness during execution**: `P0-T07`
- **Requirements inventory (atomic `REQ-*` units)**: `P1-T20`
- **Requirements interview**: `P1-T01`
- **Coverage gate + coverage report persistence**: `P1-T02`
- **Traceability links + query utilities**: `P1-T03`
- **Multi-pass PRD generation + gap fill loop**: `P1-T05`
- **Real test plans + executable commands**: `P1-T06`
- **PRD quality validator (rubric + repair hints)**: `P1-T21`
- **GUI coverage visualization**: `P1-T18`

### Acceptance Criteria (End‑State “We Won’t Miss Major Components”)

The system meets the “don’t miss major components” bar only when ALL are true:

- [ ] For any input doc, Start Chain produces explicit traceability evidence (`sourceRefs` and/or `REQ-*` inventory)
- [ ] 100% of requirements are traceable to ≥1 PRD item (or the pipeline hard-fails with a missing list)
- [ ] 0 PRD acceptance criteria are `manual`
- [ ] Every PRD item includes machine-checkable criteria + a non-empty test plan (or explicit, validated reason)
- [ ] Coverage report is persisted and visible in CLI + GUI
- [ ] Gap-fill loop automatically repairs missing requirements until coverage threshold is met (or escalates with evidence)

### Determinism + ID Stability (Concrete Algorithm)

Missing requirements are easiest to hide when IDs drift, items get duplicated, or “repair” passes reshuffle the plan. Treat determinism as a product requirement:

1. **Stable requirement IDs (`REQ-*`)** (recommended)
   - Compute `excerptHash` deterministically from the normalized excerpt (`trim`, collapse whitespace, normalize bullets, etc.).
   - Maintain an `idMap` persisted at `.puppet-master/requirements/id-map.json`:
     - key: `excerptHash`
     - value: `REQ-0001`…
   - On rerun, reuse IDs when hashes match; assign new IDs only for new hashes.

2. **Stable PRD IDs across multi-pass**
   - Pass 3 (outline PRD) is the source of truth for `PH-*` / `TK-*` / `ST-*`.
   - All later passes MUST preserve existing IDs and only append new IDs for gap-fill additions.
   - Gap-fill insertion rules:
     - Prefer augmenting an existing Task/Subtask when the missing requirement’s `sectionPath` matches and the scope clearly overlaps.
     - Otherwise append a new Subtask under the most relevant Task; otherwise append a new Task; otherwise append a new Phase.
     - Never renumber or reorder existing IDs.

3. **Deterministic ordering**
   - Inventory ordering is derived from the source document order (`sectionPath` + position).
   - Outline PRD ordering follows the inventory order and major headings order (after structure normalization).
   - Coverage diffs must return missing requirements in inventory order so gap fill is stable.

### Validators + Error Codes (Fail‑Fast, Actionable, Persisted)

Completeness requires validators that fail loudly and produce machine-readable evidence.

- **Parse/Structure Validators**
  - `SC_PARSE_NO_STRUCTURE`: no usable headings and no fallback structure detected
  - `SC_PARSE_LOW_COVERAGE`: extracted content too small vs source
  - `SC_PARSE_SINGLE_PHASE_LARGE_DOC`: large doc but only 1 phase (unless explicitly justified)

- **Inventory Validators** (if inventory enabled)
  - `SC_INV_TOO_SMALL`: requirement count suspiciously low
  - `SC_INV_DUPLICATE_HASHES`: high duplication indicates bad extraction

- **PRD Quality Validators**
  - `PRD_MANUAL_CRITERIA`: any `manual` criteria present (hard fail)
  - `PRD_CRITERIA_MISSING_TARGET`: criterion type requires a target but target is empty/invalid
  - `PRD_TOO_GENERIC`: filler criteria exceed allowance (e.g., “Implementation complete”)
  - `PRD_TEST_PLAN_EMPTY`: testPlan missing/empty where required
  - `PRD_MISSING_TRACEABILITY`: items missing `sourceRefs`/`requirementIds` beyond threshold

- **Coverage Validators**
  - `SC_COVERAGE_BELOW_THRESHOLD`: coverage ratio below configured minimum
  - `SC_COVERAGE_MISSING_REQUIREMENTS`: missing list non-empty after max repair passes

All validators must:
- return precise `path` values (`phases[0].tasks[2].subtasks[1].acceptanceCriteria[0]`, etc.)
- include `suggestion` strings that can be fed into repair passes
- persist reports to `.puppet-master/requirements/` (JSON + optional markdown summary)

### Major Component Coverage Checklist (Used by Interview + Validators)

To avoid “we missed major components” failures, treat these categories as a required completeness checklist. The Start Chain interview (P1-T01) must ask/assume for missing items, and the PRD/architecture validators must hard-fail if critical categories are neither covered nor explicitly marked out-of-scope.

- **Product/UX**: user roles, key workflows, edge cases, accessibility
- **Data model + persistence**: storage choice, migrations, retention, backups, concurrency
- **Security + secrets**: authn/authz, threat highlights, secret storage/rotation, least privilege
- **Deployment + environments**: dev/prod parity, config strategy, packaging/installer story, OS support
- **Observability**: structured logs, metrics, tracing, crash reports, evidence retention
- **Performance + budgets**: latency/throughput targets, token/cost budgets, rate limits, timeouts
- **Reliability**: retries/backoff, circuit breakers, idempotency, resumability, corruption handling
- **Compatibility**: Windows/macOS/Linux differences, pathing, shells, CLI size limits
- **Testing/verification**: automated checks for every subtask, “no manual tests” enforcement

### Prompt + Parsing Guardrails (Make Missing Output Impossible to Miss)

At scale, the most common “missed major components” failure mode is silent truncation or loosely-structured outputs. Enforce these guardrails in every Start Chain model call:

1. **Structured JSON only**
   - Prompts must demand JSON-only output (no markdown) and include a schema.
   - Parsers must hard-fail if JSON cannot be extracted/parsed and persist the raw output as evidence.

2. **Chunking + fan-out**
   - Large docs: never attempt single-pass “whole doc” PRD generation.
   - Chunk by normalized section boundaries; expand phases/tasks in isolation (P1-T05).

3. **Coverage/quality are gates, not “nice-to-haves”**
   - Always run PRD quality + coverage validation after generation.
   - On failure, automatically run repair passes; do not accept partial/low-coverage output.

4. **Prompt delivery safety**
   - Avoid command-line length limits by passing prompts via files/stdin where supported (P0-T13, P1-T10).

### Configuration Defaults (Proposed; Align with P1-T04)

These defaults make “don’t miss major components” the *default behavior* (opt-out, not opt-in):

```yaml
startChain:
  # Behavior thresholds
  largeDocThresholdChars: 8000
  coverageThresholdPercent: 85
  maxRepairPasses: 3
  maxMissingRequirementsToList: 200
  allowGenericCriteriaPercent: 5

  # Enforcement toggles
  requireRequirementsInventory: true
  requireTraceability: true
  enforceNoManualCriteria: true

  # Step toggles (P1-T04 extends this)
  steps:
    inventory: { enabled: true }
    interview: { enabled: true }
    prd: { enabled: true }
    architecture: { enabled: true }
    validation: { enabled: true }
    coverage: { enabled: true }
    gapFill: { enabled: true }
```

### Repository Path Reality Check (Avoid “Plan Drift” Bugs)

The canonical Start Chain pipeline implementation lives at:
- `src/core/start-chain/pipeline.ts`

If you encounter older references to `src/start-chain/pipeline.ts`, treat them as `src/core/start-chain/pipeline.ts` unless you are intentionally moving the pipeline. Prefer **one canonical pipeline** (avoid accidentally creating a second pipeline under `src/start-chain/`).

### Testing Plan (Fixtures + Scenarios)

To prevent regressions where “major components” are silently missed, add/maintain fixtures that represent real failure modes:

- **Structure normalization**: single H1 + many H2s; multiple H1s; no headings; flat bullet lists
- **Inventory extraction**: bullets + numbered lists + tables + prose “must/should” statements
- **Coverage failures**: intentionally truncated PRD output should hard-fail with missing list
- **Gap fill**: missing list shrinks across repair passes; IDs stay stable; no duplicates
- **No manual enforcement**: any manual criterion hard-fails with exact offending paths

---

## Phase Overview: P0 Critical Fixes

These tasks must be completed before the system can reliably execute end-to-end.

### Parallel Groups (P0)

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Sequential | P0-T01 (Schema Alignment) | Immediately |
| Parallel Group A | P0-T02, P0-T03, P0-T04 | P0-T01 |
| Parallel Group B | P0-T05, P0-T06 | P0-T01 |
| Sequential | P0-T07 | P0-T02 |
| Parallel Group C | P0-T08, P0-T09, P0-T10 | P0-T07 |
| Sequential | P0-T11 | P0-T05, P0-T06 |
| Parallel Group D | P0-T12, P0-T13, P0-T14, P0-T15 | P0-T11 |
| Parallel Group E | P0-T17, P0-T18 | P0-T01 |
| Sequential | P0-T16 | P0-T04 |
| Parallel Group F | P0-T19 | P0-T15, P0-T18 |
| Sequential | P0-T20 | P0-T16, P0-T18 |
| Parallel Group G | P0-T21, P0-T22 | P0-T16, P0-T18 |

---

## P0-T01: Schema Alignment - Unify Types Across System

### Title
Unify STATE_FILES.md, TypeScript types, prompt schemas, and verifier registry

### Goal
Eliminate schema/type drift that causes "valid per spec" artifacts to be rejected at runtime.

### Depends on
- None (foundation task)

### Parallelizable with
- None (all other P0 tasks depend on this)

### Recommended model quality
HQ required — requires careful analysis of multiple files

### Read first
- `STATE_FILES.md` Section 3.3 (Criterion types)
- `src/types/tiers.ts` (current runtime types)
- `src/types/prd.ts` (PRD types)
- `src/start-chain/prompts/prd-prompt.ts` (prompt schema)
- `src/core/container.ts` lines 169-173 (verifier registration)
- `src/verification/verifiers/` (all verifier implementations)

### Files to create/modify
- `src/types/tiers.ts` (update CriterionType)
- `src/types/prd.ts` (update Criterion interface)
- `src/start-chain/prompts/prd-prompt.ts` (align with runtime types)
- `src/core/container.ts` (register all verifiers)
- `src/verification/verifiers/manual-verifier.ts` (new)
- `src/verification/verifiers/index.ts` (update exports)

### Implementation notes
1. **Define canonical criterion types** - Choose one source of truth:
   - Option A: Expand runtime types to match STATE_FILES.md (`test`, `cli_verify`, `perf_verify`, etc.)
   - Option B: Add mapping layer from spec types to runtime types

2. **Current runtime types** (from `tiers.ts`):
   ```typescript
   type: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'ai'
   ```

3. **Spec types** (from STATE_FILES.md):
   ```
   TEST:, CLI_VERIFY:, BROWSER_VERIFY:, FILE_VERIFY:, REGEX_VERIFY:, PERF_VERIFY:, AI_VERIFY:
   ```

4. **Recommended mapping**:
   - `test` → `command` (runs test command)
   - `cli_verify` → `command` (runs CLI command)
   - `file_verify` → `file_exists`
   - `regex_verify` → `regex`
   - `perf_verify` → `command` (with timing)
   - `browser_verify` → `browser_verify`
   - `ai_verify` → `ai`
   - `manual` → **MUST IMPLEMENT** ManualVerifier or remove from types

### Acceptance criteria
- [ ] All criterion types in `tiers.ts` match what verifiers can handle
- [ ] `prd-prompt.ts` schema matches runtime types
- [ ] All verifiers referenced in types are registered in `container.ts`
- [ ] ManualVerifier implemented OR `manual` type removed from valid types
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (existing tests still work)

### Tests to run
```bash
npm run typecheck
npm test
npm run build
```

### Evidence to record
- Schema alignment diff
- Verifier registry contents

### Cursor Agent Prompt
```
Unify schema/types across RWM Puppet Master to eliminate type drift.

CRITICAL CONTEXT:
The system has divergent schemas causing runtime failures:
- STATE_FILES.md defines: TEST:, CLI_VERIFY:, PERF_VERIFY:, AI_VERIFY:, etc.
- src/types/tiers.ts allows: 'regex' | 'file_exists' | 'browser_verify' | 'command' | 'manual' | 'ai'
- PRD prompt asks AI to output STATE_FILES.md types
- Runtime rejects valid-per-prompt PRD JSON

YOUR TASK (P0-T01):
1. Read all files listed in "Read first" to understand current state
2. Choose ONE canonical type taxonomy and document it
3. Update src/types/tiers.ts with the canonical types
4. Update src/types/prd.ts Criterion interface to match
5. Update src/start-chain/prompts/prd-prompt.ts to request only valid types
6. Either:
   - Implement ManualVerifier in src/verification/verifiers/manual-verifier.ts, OR
   - Remove 'manual' from valid types (recommended - violates "no manual tests" requirement)
7. Register all verifiers in src/core/container.ts

CONSTRAINTS:
- Do NOT remove any verifier that is currently working
- Do NOT change verification logic, only align types
- All existing tests must continue to pass

After implementation, run:
- npm run typecheck
- npm test
- npm run build

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T02: Start Chain v2 - Fix H1 Title Bug

### Title
Fix H1 title treated as single phase bug

### Goal
When a requirements doc has one H1 title with H2 sections, treat H2s as phases, not the H1.

### Depends on
- P0-T01

### Parallelizable with
- P0-T03, P0-T04

### Recommended model quality
HQ required — parsing logic changes

### Read first
- `src/start-chain/parsers/markdown-parser.ts`
- `src/start-chain/prd-generator.ts` (line 177: `generatePhases`, line 295: `extractAcceptanceCriteria`)
- `ClaudesMajorImprovements.md` Issue #1
- `CodexsMajorImprovements.md` P0.1

### Files to create/modify
- `src/start-chain/parsers/markdown-parser.ts`
- `src/start-chain/prd-generator.ts`
- `src/start-chain/structure-detector.ts` (new)
- Tests for above files

### Implementation notes
1. **The Problem**:
   - Most requirements docs have: `# Doc Title` → `## Section 1` → `## Section 2`
   - Current parser: H1 becomes a section, so only "1 section" appears
   - PRD generator treats top-level sections as phases
   - Result: "only 1 phase" even for large docs

2. **The Fix**:
   - Add structure detection step
   - If doc has 1 H1 and multiple H2s: treat H1 as title, H2s as phases
   - If doc has multiple H1s: treat H1s as phases
   - If doc has no headings: fall back to content chunking

3. **Add coverage heuristics**:
   - Count headings detected
   - Count bullets/requirements extracted
   - Hard fail if coverage < threshold

### Acceptance criteria
- [ ] Doc with `# Title` + `## Section1` + `## Section2` produces 2 phases
- [ ] Doc with `# Phase1` + `# Phase2` produces 2 phases
- [ ] Coverage metrics logged
- [ ] Hard fail if only 1 phase from large doc (> threshold)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Test with sample multi-section document

### Cursor Agent Prompt
```
Fix the H1 title bug in Start Chain parsing.

CRITICAL CONTEXT:
When users upload a requirements doc with:
  # My Project Requirements  (H1 title)
  ## User Authentication      (H2 section)
  ## Database Schema          (H2 section)
  ## API Endpoints            (H2 section)

Current behavior: Shows "1 section parsed"
Expected behavior: Shows "3 phases parsed" (User Auth, Database, API)

ROOT CAUSE:
- markdown-parser.ts builds section tree correctly
- prd-generator.ts treats TOP-LEVEL sections as phases
- A single H1 = single top-level section = 1 phase

YOUR TASK (P0-T02):
1. Read the files listed in "Read first"
2. Create src/start-chain/structure-detector.ts:
   - detectDocumentStructure(sections: ParsedSection[]): DocumentStructure
   - Return: { type: 'single_h1_with_h2s' | 'multiple_h1s' | 'no_headings' | 'flat' }

3. Update src/start-chain/prd-generator.ts:
   - Before generatePhases(), call structure detector
   - If 'single_h1_with_h2s': use H2 children as phases, H1 as title
   - If 'multiple_h1s': use H1s as phases (current behavior)

4. Add coverage heuristics:
   - Track: sections count, bullets count, total chars parsed vs input
   - HARD FAIL if: large input (>5000 chars) but only 1 phase

5. Add tests for all structure types

CONSTRAINTS:
- Do NOT break existing tests
- Do NOT change markdown-parser's tree structure (it's correct)
- Only change how prd-generator interprets the tree

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T03: Start Chain v2 - No Manual Criteria Enforcement

### Title
Eliminate manual acceptance criteria from generated PRDs

### Goal
PRD generator must NEVER output `type: 'manual'` criteria. All criteria must be machine-verifiable.

### Depends on
- P0-T01

### Parallelizable with
- P0-T02, P0-T04

### Recommended model quality
HQ required — critical requirement enforcement

### Read first
- `src/start-chain/prd-generator.ts` (line 295: `extractAcceptanceCriteria`)
- `ClaudesMajorImprovements.md` Issue #2
- `CodexsMajorImprovements.md` P0.2
- `REQUIREMENTS.md` Section 5.2 (PRD prompt template)

### Files to create/modify
- `src/start-chain/prd-generator.ts`
- `src/start-chain/criterion-classifier.ts` (new)
- `src/start-chain/validators/no-manual-validator.ts` (new)
- Tests for above files

### Implementation notes
1. **The Problem**:
   ```typescript
   // Current code in prd-generator.ts
   criteria.push({
     type: 'manual',  // 🔴 THIS IS THE PROBLEM
     target: '',
   });
   ```

2. **The Fix**:
   - Create `CriterionClassifier` that analyzes description and assigns type
   - Pattern matching:
     - `/test|spec|unit|integration/i` → `command` (test runner)
     - `/build|compile|typecheck|lint/i` → `command` (CLI verify)
     - `/create|add|file|exists/i` → `file_exists`
     - `/contain|include|match|pattern/i` → `regex`
     - `/ui|display|render|show|visible/i` → `browser_verify`
     - **Default** → `ai` (NOT manual!)

3. **Add validation**:
   - Post-generation validator that REJECTS PRDs with manual criteria
   - Throw error with list of offending criteria

### Acceptance criteria
- [ ] CriterionClassifier classifies based on description
- [ ] Default type is `ai`, NEVER `manual`
- [ ] NoManualValidator rejects PRDs with `type: 'manual'`
- [ ] Generate verification targets (`TEST:npm test`, etc.)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Sample PRD showing zero manual criteria

### Cursor Agent Prompt
```
Eliminate manual acceptance criteria from Start Chain PRD generation.

CRITICAL CONTEXT:
User requirement: "THERE CAN BE NO MANUAL TESTS THE USER WILL NOT TEST"

Current behavior: Every criterion defaults to type: 'manual'
Result: Every gate fails because no ManualVerifier exists

YOUR TASK (P0-T03):
1. Read the files listed in "Read first"
2. Create src/start-chain/criterion-classifier.ts:
   - classifyAcceptanceCriterion(description: string): CriterionType
   - Pattern matching rules:
     - test/spec/unit/integration → 'command'
     - build/compile/typecheck/lint → 'command'
     - create/add/file/exists → 'file_exists'
     - contain/include/match/pattern → 'regex'
     - ui/display/render/show → 'browser_verify'
     - performance/latency/throughput → 'command' (with timing)
     - DEFAULT → 'ai' (AI verification, NOT manual!)

   - generateVerificationTarget(criterion: Criterion): string
     - Returns formatted target like: 'TEST:npm test', 'FILE_VERIFY:src/foo.ts:exists'

3. Update src/start-chain/prd-generator.ts:
   - Use CriterionClassifier instead of hardcoded 'manual'
   - Generate proper verification targets

4. Create src/start-chain/validators/no-manual-validator.ts:
   - validateNoManualCriteria(prd: PRD): ValidationResult
   - HARD FAIL if any criterion has type 'manual'

5. Integrate validator into Start Chain pipeline

CONSTRAINTS:
- NEVER allow 'manual' type in generated PRDs
- 'ai' type is acceptable as fallback (AI can verify)
- All existing tests must continue to pass

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T04: Verification System - Register All Verifiers

### Title
Register all verifiers and fix evidence ID mismatch

### Goal
Ensure all criterion types have registered verifiers and evidence is linkable.

### Depends on
- P0-T01

### Parallelizable with
- P0-T02, P0-T03

### Recommended model quality
Medium OK — registration and ID fixes

### Read first
- `src/core/container.ts` (lines 169-173)
- `src/verification/verifiers/` (all files)
- `src/verification/verification-integration.ts` (line 134: `convertTestCommandToCriterion`)
- `src/verification/gate-runner.ts` (line 268: `saveEvidence`)
- `ClaudesMajorImprovements.md` P0.11 (Verification System Bugs)

### Files to create/modify
- `src/core/container.ts`
- `src/verification/verification-integration.ts`
- `src/verification/gate-runner.ts`
- `src/verification/verifiers/manual-verifier.ts` (if P0-T01 chose to keep manual)

### Implementation notes
1. **Bug 1: Missing verifier registration**
   - Current: Only 5 verifiers registered
   - Container must register ALL verifiers matching type union

2. **Bug 2: Evidence ID mismatch**
   - `convertTestCommandToCriterion()` generates IDs like `command-0`
   - `EvidenceStore.getEvidence(itemId)` expects tier IDs (`PH-...`, `TK-...`)
   - Fix: Use tier ID prefix in generated criterion IDs

3. **Bug 3: Gate ID parsing**
   - `saveEvidence()` checks if gateId starts with `PH-`/`ST-`
   - But actual IDs are `phase-gate-PH-001`
   - Fix: Parse gate type from ID properly

4. **Bug 4: Portable aggregate checks**
   - `target: 'true'` / `'false'` doesn't work on Windows
   - Fix: Use Node process.exit or internal meta-verifier

### Acceptance criteria
- [ ] All criterion types have registered verifiers
- [ ] Evidence IDs use tier ID prefix
- [ ] Gate ID parsing works correctly
- [ ] Aggregate checks work on Windows (no `true`/`false` commands)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/verification` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/verification
```

### Evidence to record
- Verifier registry dump

### Cursor Agent Prompt
```
Fix verification system bugs in RWM Puppet Master.

CRITICAL CONTEXT:
Multiple bugs cause gates to fail incorrectly:
1. ManualVerifier not registered but 'manual' type allowed
2. Evidence IDs (command-0) don't match what EvidenceStore expects (PH-xxx)
3. Gate ID parsing fails (checks for 'PH-' prefix but IDs are 'phase-gate-PH-001')
4. 'true'/'false' commands don't work on Windows

YOUR TASK (P0-T04):
1. Read the files listed in "Read first"

2. Fix src/core/container.ts:
   - Register ALL verifiers that match criterion types
   - If 'manual' type exists, register ManualVerifier (or coordinate with P0-T01)

3. Fix src/verification/verification-integration.ts:
   - Line 110-126: Change generated criterion IDs from 'command-0' to '${tierId}-command-0'
   - Line 177-189: Replace 'true'/'false' shell commands with portable check:
     ```typescript
     // Instead of: target: allPassed ? 'true' : 'false'
     // Use internal verification that doesn't spawn shell
     ```

4. Fix src/verification/gate-runner.ts:
   - Update saveEvidence() to properly parse gate type from ID
   - Handle patterns like 'phase-gate-PH-001', 'task-gate-TK-001-001'

5. Add null safety:
   - Check tier.data.acceptanceCriteria before spreading
   - Handle undefined gracefully

CONSTRAINTS:
- Do NOT change verification logic, only fix bugs
- Must work on Windows, macOS, and Linux
- All existing tests must continue to pass

After implementation, run:
- npm run typecheck
- npm test -- src/verification

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T05: GUI Wiring - Fix WebSocket Event Names

### Title
Fix WebSocket event name mismatch between backend and frontend

### Goal
Frontend receives real-time updates from backend events.

### Depends on
- P0-T01

### Parallelizable with
- P0-T06

### Recommended model quality
Medium OK — renaming/mapping

### Read first
- `src/logging/event-bus.ts` (backend event emission)
- `src/core/orchestrator.ts` (lines 173, 200, 229, 253: event emission points)
- `src/gui/public/js/dashboard.js` (frontend listeners)
- `src/gui/public/js/tiers.js` (frontend listeners)
- `CodexsMajorImprovements.md` P0.6

### Files to create/modify
- `src/gui/server.ts` (add event translator middleware)
- OR update frontend JS files to match backend names
- OR update backend to emit frontend-expected names

### Implementation notes
1. **Current mismatch**:
   | Backend emits | Frontend expects |
   |---------------|------------------|
   | `state_changed` | `state_change` |
   | `output_chunk` | `output` |
   | `iteration_started` | `iteration_start` |
   | `iteration_completed` | `iteration_complete` |

2. **Options**:
   - Option A: Add server-side event translator (recommended - single point of change)
   - Option B: Update frontend to match backend
   - Option C: Update backend to match frontend

### Acceptance criteria
- [ ] Frontend receives all backend events
- [ ] Dashboard updates in real-time
- [ ] Tiers view shows iteration progress
- [ ] `npm run typecheck` passes
- [ ] GUI integration test passes

### Tests to run
```bash
npm run typecheck
npm test -- src/gui
```

### Evidence to record
- Screenshot of working dashboard updates

### Cursor Agent Prompt
```
Fix WebSocket event name mismatch in RWM Puppet Master GUI.

CRITICAL CONTEXT:
The GUI appears "stuck" because it's listening for event names that don't match what the backend emits:
- Backend emits: state_changed, output_chunk, iteration_started, iteration_completed
- Frontend listens for: state_change, output, iteration_start, iteration_complete

YOUR TASK (P0-T05):
1. Read the files listed in "Read first"

2. Choose fix strategy (recommend Option A):

   Option A - Server-side translator (RECOMMENDED):
   Create event name mapping in src/gui/server.ts:
   ```typescript
   const EVENT_NAME_MAP = {
     'state_changed': 'state_change',
     'output_chunk': 'output',
     'iteration_started': 'iteration_start',
     'iteration_completed': 'iteration_complete',
   };

   // In WebSocket emit:
   const frontendName = EVENT_NAME_MAP[event.type] ?? event.type;
   socket.emit(frontendName, event.data);
   ```

   Option B - Update frontend to match backend:
   Update dashboard.js and tiers.js to listen for backend event names

   Option C - Update backend to emit frontend names:
   Update event-bus.ts and orchestrator.ts

3. Verify all event types are mapped

4. Test with actual GUI

CONSTRAINTS:
- Choose ONE option and implement consistently
- Do NOT break existing event handling
- Test with real WebSocket connection

After implementation, run:
- npm run typecheck
- npm test -- src/gui

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T06: GUI Wiring - Connect Wizard to Real Start Chain

### Title
Wire wizard to execute actual Start Chain pipeline

### Goal
When users click "Generate" in wizard, it runs the real AI Start Chain, not just saves preview artifacts.

### Depends on
- P0-T01

### Parallelizable with
- P0-T05

### Recommended model quality
HQ required — complex integration

### Read first
- `src/gui/routes/wizard.ts` (`/wizard/save`, `/wizard/generate`)
- `src/core/start-chain/pipeline.ts`
- `CodexsMajorImprovements.md` P0.6

### Files to create/modify
- `src/gui/routes/wizard.ts`
- `src/gui/public/js/wizard.js`
- `src/gui/server.ts` (dependency injection)

### Implementation notes
1. **The Problem**:
   - `/api/wizard/save` only runs `StartChainPipeline` if `parsed` is provided
   - Browser client posts `{ prd, architecture, tierPlan, projectPath }` without `parsed`
   - Result: Pipeline never runs, only low-quality preview saved

2. **The Fix**:
   - Store `parsed` requirements in session/state during wizard steps
   - Pass `parsed` to save endpoint
   - Show streaming progress during AI generation
   - Don't regenerate on save - use reviewed artifacts

3. **Router dependency issue**:
   - `setupRoutesSync()` registers "null dependency" routers first
   - Later `registerOrchestratorInstance()` adds new routers
   - But original routers match first!
   - Fix: Use single router with mutable dependency holder

### Acceptance criteria
- [ ] Wizard step 1: Upload stores parsed requirements
- [ ] Wizard step 2: Shows parsed structure + coverage
- [ ] Wizard step 3: Runs AI generation with streaming progress
- [ ] Wizard step 4: Shows reviewed artifacts (don't regenerate)
- [ ] Save endpoint uses actual pipeline
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/gui` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/gui
```

### Evidence to record
- Wizard flow screenshot
- PRD.json created by real pipeline

### Cursor Agent Prompt
```
Wire GUI wizard to execute real Start Chain pipeline.

CRITICAL CONTEXT:
Users think they're running AI Start Chain in the wizard, but they're actually just saving low-quality preview artifacts. The real pipeline never executes.

ROOT CAUSE:
1. /api/wizard/save only runs StartChainPipeline if 'parsed' is provided
2. Browser posts { prd, architecture, tierPlan, projectPath } - no 'parsed'
3. Router dependency injection doesn't override existing routes

YOUR TASK (P0-T06):
1. Read the files listed in "Read first"

2. Fix dependency injection in src/gui/server.ts:
   - Create single router per route set
   - Use mutable dependency holder middleware
   - Ensure orchestrator/platform registry available when needed

3. Update src/gui/routes/wizard.ts:
   - Store parsed requirements in session during upload step
   - Make /generate endpoint run real AI generation
   - Make /save endpoint use stored parsed + reviewed artifacts

4. Update src/gui/public/js/wizard.js:
   - Stream progress during AI generation (show spinner/progress)
   - Send correct payload to save endpoint
   - Don't regenerate on save

5. Add proper error handling:
   - Show AI generation errors to user
   - Allow retry on failure

CONSTRAINTS:
- Do NOT break wizard preview functionality
- Do NOT allow save without validation
- Stream progress to keep user informed

After implementation, run:
- npm run typecheck
- npm test -- src/gui

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T07: Execution Loop - Unify Prompt Builder

### Title
Use unified PromptBuilder in ExecutionEngine

### Goal
All iteration prompts use the same comprehensive PromptBuilder from Phase 2.

### Depends on
- P0-T02 (for PRD structure fixes)

### Parallelizable with
- None (gates P0-T08, T09, T10)

### Recommended model quality
Medium OK — integration work

### Read first
- `src/core/prompt-builder.ts` (comprehensive builder from Phase 2)
- `src/core/execution-engine.ts` (line 310: `buildPrompt`, line 93: usage in `spawnIteration`)
- `CodexsMajorImprovements.md` P0.3

### Files to create/modify
- `src/core/execution-engine.ts`

### Implementation notes
1. **The Problem**:
   - `ExecutionEngine.buildPrompt()` doesn't include acceptance criteria or test commands
   - Comprehensive `PromptBuilder` exists but isn't used

2. **The Fix**:
   - Inject `PromptBuilder` into `ExecutionEngine`
   - Use `PromptBuilder.buildIterationPrompt()` instead of inline prompt construction
   - Pass full context including criteria and test plan

### Acceptance criteria
- [ ] ExecutionEngine uses PromptBuilder
- [ ] Iteration prompts include acceptance criteria
- [ ] Iteration prompts include test commands
- [ ] Previous failure info included on retry
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/execution-engine` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/execution-engine
```

### Evidence to record
- Sample iteration prompt showing all sections

### Cursor Agent Prompt
```
Unify prompt building in ExecutionEngine using the comprehensive PromptBuilder.

CRITICAL CONTEXT:
ExecutionEngine.buildPrompt() currently creates incomplete prompts missing:
- Acceptance criteria
- Test commands
- Previous failure information

A comprehensive PromptBuilder exists (from Phase 2) but isn't used.

YOUR TASK (P0-T07):
1. Read src/core/prompt-builder.ts to understand PromptBuilder API
2. Read src/core/execution-engine.ts to find buildPrompt() usage

3. Update src/core/execution-engine.ts:
   - Add PromptBuilder as constructor dependency
   - Replace inline buildPrompt() with PromptBuilder.buildIterationPrompt()
   - Construct proper PromptContext from IterationContext:
     ```typescript
     const promptContext: PromptContext = {
       subtask: tierNode,
       task: tierNode.parent,
       phase: tierNode.parent.parent,
       projectName: context.projectName,
       sessionId: context.sessionId,
       platform: context.platform,
       iterationNumber: context.iterationNumber,
       maxIterations: context.maxIterations,
       progressEntries: context.progressEntries,
       agentsContent: context.agentsContent,
       previousFailures: context.previousFailures,
     };
     ```

4. Update ExecutionEngine tests to verify prompt content

CONSTRAINTS:
- Do NOT modify PromptBuilder itself
- Ensure all PromptContext fields are populated
- All existing tests must continue to pass

After implementation, run:
- npm run typecheck
- npm test -- src/core/execution-engine

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T08: Execution Loop - Fix Transcript Capture

### Title
Fix transcript capture race condition

### Goal
Capture iteration output reliably without stalling.

### Depends on
- P0-T07

### Parallelizable with
- P0-T09, P0-T10

### Recommended model quality
Medium OK — stream handling fix

### Read first
- `src/platforms/base-runner.ts` (line 326: `getTranscript`, line 190: `captureStdout`)
- `src/core/execution-engine.ts` (line 219: stream consumption, line 240: `getTranscript` call)
- `CodexsMajorImprovements.md` P0.3

### Files to create/modify
- `src/platforms/base-runner.ts`
- `src/core/execution-engine.ts`

### Implementation notes
1. **The Problem**:
   - `ExecutionEngine` consumes stdout/stderr streams
   - Later `getTranscript()` calls `captureStdout/captureStderr` again
   - This attaches new listeners to potentially-ended streams
   - Can stall indefinitely if stream already ended

2. **The Fix**:
   - Capture streams ONCE at spawn time
   - Store captured output in runner state
   - `getTranscript()` returns stored output, doesn't re-attach listeners

### Acceptance criteria
- [ ] Streams captured once at spawn time
- [ ] getTranscript() returns stored output
- [ ] No stall on already-ended streams
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms
```

### Evidence to record
- Transcript capture log

### Cursor Agent Prompt
```
Fix transcript capture race condition in platform runners.

CRITICAL CONTEXT:
Transcripts can stall indefinitely because:
1. ExecutionEngine consumes stdout/stderr streams
2. Later getTranscript() attaches new listeners to same streams
3. If stream already ended, new 'end' event never fires

YOUR TASK (P0-T08):
1. Read the files listed in "Read first"

2. Fix src/platforms/base-runner.ts:
   - Add private state for captured output:
     ```typescript
     private capturedOutput: Map<number, { stdout: string; stderr: string }>;
     ```

   - In execute(), capture streams ONCE:
     ```typescript
     // Capture at spawn time
     const output = { stdout: '', stderr: '' };
     process.stdout.on('data', (data) => { output.stdout += data; });
     process.stderr.on('data', (data) => { output.stderr += data; });
     process.on('exit', () => {
       this.capturedOutput.set(process.pid, output);
     });
     ```

   - Update getTranscript():
     ```typescript
     getTranscript(processId: number): string {
       const captured = this.capturedOutput.get(processId);
       return captured ? captured.stdout + captured.stderr : '';
     }
     ```

3. Update src/core/execution-engine.ts:
   - Remove duplicate stream attachment
   - Use runner's getTranscript() after process exits

CONSTRAINTS:
- Capture ALL output, don't lose data
- Clean up old transcripts (memory management)
- All existing tests must continue to pass

After implementation, run:
- npm run typecheck
- npm test -- src/platforms

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T09: Execution Loop - Git-Based File Detection

### Title
Use git diff for file change detection instead of output parsing

### Goal
Reliably detect which files were changed during iteration using git.

### Depends on
- P0-T07

### Parallelizable with
- P0-T08, P0-T10

### Recommended model quality
Medium OK — git integration

### Read first
- `src/core/execution-engine.ts` (line 507: `filesChanged` handling)
- `src/core/output-parser.ts` (`extractFilesChanged`)
- `src/core/orchestrator.ts` (line 825: `commitChanges`, line 826: empty check)
- `src/git/git-manager.ts`
- `CodexsMajorImprovements.md` P0.3, P0.10

### Files to create/modify
- `src/core/execution-engine.ts`
- `src/core/orchestrator.ts`

### Implementation notes
1. **The Problem**:
   - `filesChanged` derived from `OutputParser` regex on agent output
   - Unreliable: depends on agent mentioning files in specific format
   - Current: `filesChanged` often empty even when files changed
   - Result: commits silently don't happen

2. **The Fix**:
   - Before iteration: record `git status --porcelain`
   - After iteration: diff with new `git status --porcelain`
   - Use `git diff --name-only` for accurate list
   - Don't rely on output parsing for files

### Acceptance criteria
- [ ] File changes detected via git diff
- [ ] Works even if agent doesn't mention files
- [ ] Commits happen when files actually change
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/orchestrator` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/orchestrator
```

### Evidence to record
- Git diff output in iteration log

### Cursor Agent Prompt
```
Use git for reliable file change detection in execution loop.

CRITICAL CONTEXT:
File changes are currently detected by parsing agent output with regex.
This is unreliable - if agent doesn't mention files in expected format, changes are missed.
Result: commits silently don't happen even when files were changed.

YOUR TASK (P0-T09):
1. Read the files listed in "Read first"

2. Update src/core/execution-engine.ts:
   - Add GitManager as dependency
   - Before spawnIteration():
     ```typescript
     const beforeStatus = await this.gitManager.getStatus();
     ```

   - After iteration completes:
     ```typescript
     const diffFiles = await this.gitManager.getDiffFiles();
     // Or: git diff --name-only HEAD
     result.filesChanged = diffFiles;
     ```

3. Update src/core/orchestrator.ts:
   - In commitChanges(): Use detected files, not empty array
   - Only skip commit if git says no changes (not if filesChanged empty)

4. Keep output parser as secondary source:
   - Union git-detected files with output-parsed files
   - Git is source of truth, output parser is bonus info

CONSTRAINTS:
- Do NOT break existing tests
- Handle git not initialized gracefully
- Handle uncommitted changes before iteration

After implementation, run:
- npm run typecheck
- npm test -- src/core/orchestrator

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T10: Init Command - Create Valid PRD Scaffold

### Title
Fix init command to create schema-valid PRD

### Goal
`puppet-master init` creates a PRD that PrdManager can load without errors.

### Depends on
- P0-T07

### Parallelizable with
- P0-T08, P0-T09

### Recommended model quality
Low OK — simple fix

### Read first
- `src/cli/commands/init.ts`
- `src/memory/prd-manager.ts` (`load` method)
- `CodexsMajorImprovements.md` P0.5

### Files to create/modify
- `src/cli/commands/init.ts`

### Implementation notes
1. **The Problem**:
   - `init` writes `prd.json` as `{}`
   - `PrdManager.load()` requires `phases[]` array
   - Commands fail until `puppet-master plan` runs

2. **The Fix**:
   ```typescript
   const emptyPrd = {
     version: '1.0.0',
     projectName: projectName,
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
     phases: [],
     metadata: {
       totalPhases: 0,
       totalTasks: 0,
       totalSubtasks: 0,
     }
   };
   ```

### Acceptance criteria
- [ ] Init creates valid PRD structure
- [ ] PrdManager.load() succeeds after init
- [ ] Other commands work after init (before plan)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/cli/commands/init` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/cli/commands/init
```

### Evidence to record
- prd.json content after init

### Cursor Agent Prompt
```
Fix init command to create schema-valid PRD scaffold.

CRITICAL CONTEXT:
`puppet-master init` writes `{}` to prd.json, but PrdManager.load() requires `phases[]`.
Result: All commands fail after init until `puppet-master plan` runs.

YOUR TASK (P0-T10):
1. Read src/cli/commands/init.ts
2. Find where prd.json is written

3. Replace empty object with valid scaffold:
   ```typescript
   const emptyPrd = {
     version: '1.0.0',
     projectName: options.projectName || path.basename(process.cwd()),
     description: '',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString(),
     phases: [],
     metadata: {
       totalPhases: 0,
       totalTasks: 0,
       totalSubtasks: 0,
       completedPhases: 0,
       completedTasks: 0,
       completedSubtasks: 0,
     }
   };
   ```

4. Also fix: Don't clobber existing AGENTS.md/progress.txt without --force flag

CONSTRAINTS:
- Do NOT change PRD schema
- Ensure scaffold matches src/types/prd.ts PRD interface
- Warn user if files exist and --force not set

After implementation, run:
- npm run typecheck
- npm test -- src/cli/commands/init

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T11: Wire Git Infrastructure into Orchestrator

### Title
Connect existing BranchStrategy, CommitFormatter, PRManager to orchestrator

### Goal
Use the 1000+ lines of existing git infrastructure that's currently unused.

### Depends on
- P0-T05, P0-T06 (GUI wiring)

### Parallelizable with
- None (gates P0-T12-T15)

### Recommended model quality
HQ required — major integration

### Read first
- `src/git/git-manager.ts`
- `src/git/branch-strategy.ts` (3 strategies: single, per_phase, per_task)
- `src/git/commit-formatter.ts` (6 tier types)
- `src/git/pr-manager.ts`
- `src/core/orchestrator.ts` (lines 825-858, current git usage)
- `src/core/container.ts`
- `ClaudesMajorImprovements.md` "Git Infrastructure Unused"

### Files to create/modify
- `src/core/container.ts`
- `src/core/orchestrator.ts`
- `src/types/config.ts` (if needed for git config types)

### Implementation notes
1. **Current state** (lines 825-858 in orchestrator.ts):
   ```typescript
   // THIS IS ALL THE GIT THE ORCHESTRATOR DOES:
   await this.deps.gitManager.add(['.']);
   const message = `ralph: [subtask] ${subtask.id} ${subtask.data.title}`; // WRONG FORMAT
   await this.deps.gitManager.commit({ message });
   ```

2. **What exists but is never used**:
   - BranchStrategy: 322 lines, 3 strategies
   - CommitFormatter: 122 lines, 6 tier types
   - PRManager: 238 lines, full PR workflow
   - push(), createBranch(), merge(), stash()

3. **Required integration**:
   - Register BranchStrategy, CommitFormatter, PRManager in container
   - Use BranchStrategy.ensureBranch() before starting tier
   - Use CommitFormatter.format() for all commits
   - Create gate commits in handleGateResult()
   - Push and create PRs per config

### Acceptance criteria
- [ ] BranchStrategy, CommitFormatter, PRManager registered in container
- [ ] Orchestrator uses BranchStrategy.ensureBranch()
- [ ] All commits use CommitFormatter
- [ ] Gate results committed with proper format
- [ ] Push happens when config.git.push.auto_push true
- [ ] PR created when config.git.pr.enabled true
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/orchestrator` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/orchestrator
npm test -- src/git
```

### Evidence to record
- Git log showing proper commit formats
- Branch structure screenshot

### Cursor Agent Prompt
```
Wire existing git infrastructure into the orchestrator.

CRITICAL CONTEXT:
RWM Puppet Master has 1000+ lines of git infrastructure that's NEVER USED:
- BranchStrategy (322 lines, 3 strategies) - NEVER instantiated
- CommitFormatter (122 lines, 6 tier types) - NEVER called
- PRManager (238 lines) - NEVER instantiated
- push(), createBranch(), merge() - NEVER called

Current orchestrator only does:
```typescript
await this.deps.gitManager.add(['.']);
const message = `ralph: [subtask] ${subtask.id}...`;  // Wrong format!
await this.deps.gitManager.commit({ message });
```

YOUR TASK (P0-T11):
1. Read all files in "Read first" to understand existing infrastructure

2. Update src/core/container.ts:
   - Register BranchStrategy:
     ```typescript
     container.register('branchStrategy', (c) => {
       const config = c.get('config');
       return createBranchStrategy(config.git.branch, c.get('gitManager'));
     }, 'singleton');
     ```
   - Register CommitFormatter:
     ```typescript
     container.register('commitFormatter', () => new CommitFormatter(), 'singleton');
     ```
   - Register PRManager:
     ```typescript
     container.register('prManager', (c) =>
       new PRManager(c.get('projectPath')), 'singleton');
     ```

3. Update src/core/orchestrator.ts:
   - Add deps: branchStrategy, commitFormatter, prManager

   - In runLoop(), before starting subtask:
     ```typescript
     const context = { phaseId, taskId, subtaskId, isComplete: false };
     await this.deps.branchStrategy.ensureBranch(context);
     ```

   - Replace commitChanges() to use CommitFormatter:
     ```typescript
     const message = this.deps.commitFormatter.format({
       tier: 'iteration',
       itemId: subtask.id,
       summary: result.summary,
     });
     await this.deps.gitManager.commit({ message });
     ```

   - In handleGateResult(), commit gate outcomes:
     ```typescript
     const message = this.deps.commitFormatter.format({
       tier: 'phase_gate', // or 'task_gate'
       itemId: tier.id,
       status: result.passed ? 'PASS' : 'FAIL',
     });
     ```

   - After gates pass, handle push/PR:
     ```typescript
     if (this.config.git.push?.auto_push) {
       await this.deps.gitManager.push();
     }
     if (this.config.git.pr?.enabled && tier.type === 'task') {
       await this.deps.prManager.createPR({...});
     }
     ```

4. Update orchestrator tests

CONSTRAINTS:
- Do NOT modify git infrastructure (BranchStrategy, etc.)
- Use config to control behavior (don't hardcode)
- Handle git errors gracefully (don't crash loop)

After implementation, run:
- npm run typecheck
- npm test -- src/core/orchestrator
- npm test -- src/git

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T12: Platform Runner - Enforce Timeouts

### Title
Enforce request timeouts in platform runners

### Goal
Platform runner execute() respects request.timeout and request.hardTimeout.

### Depends on
- P0-T11

### Parallelizable with
- P0-T13, P0-T14, P0-T15

### Recommended model quality
Medium OK — timeout implementation

### Read first
- `src/platforms/base-runner.ts`
- `src/platforms/cursor-runner.ts`
- `src/platforms/codex-runner.ts`
- `src/platforms/claude-runner.ts`
- `CodexsMajorImprovements.md` P0.8

### Files to create/modify
- `src/platforms/base-runner.ts`

### Implementation notes
1. **The Problem**:
   - `ExecutionEngine` implements hard timeout
   - `BasePlatformRunner.execute()` ignores `request.timeout`/`request.hardTimeout`
   - Start Chain generation can hang indefinitely

2. **The Fix**:
   - Add timeout handling in `execute()`:
   ```typescript
   const timeoutPromise = new Promise((_, reject) => {
     setTimeout(() => reject(new TimeoutError()), request.timeout ?? 120000);
   });
   return Promise.race([actualExecution, timeoutPromise]);
   ```

### Acceptance criteria
- [ ] execute() times out per request.timeout
- [ ] Hard timeout kills process
- [ ] TimeoutError distinguishes soft vs hard timeout
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms
```

### Evidence to record
- Timeout test log

### Cursor Agent Prompt
```
Enforce request timeouts in platform runners.

CRITICAL CONTEXT:
Platform runners ignore timeout settings, causing Start Chain to potentially hang forever.
- ExecutionEngine implements timeouts
- But BasePlatformRunner.execute() ignores request.timeout/hardTimeout

YOUR TASK (P0-T12):
1. Read src/platforms/base-runner.ts

2. Add timeout enforcement in execute():
   ```typescript
   async execute(request: ExecutionRequest): Promise<ExecutionResult> {
     const timeout = request.timeout ?? this.defaultTimeout;
     const hardTimeout = request.hardTimeout ?? timeout * 1.5;

     // Soft timeout - request graceful stop
     const softTimeoutId = setTimeout(() => {
       this.requestStop(processId);
     }, timeout);

     // Hard timeout - force kill
     const hardTimeoutId = setTimeout(() => {
       this.forceKill(processId);
     }, hardTimeout);

     try {
       const result = await this.actualExecute(request);
       return result;
     } finally {
       clearTimeout(softTimeoutId);
       clearTimeout(hardTimeoutId);
     }
   }
   ```

3. Add TimeoutError class:
   ```typescript
   class TimeoutError extends Error {
     constructor(
       public readonly type: 'soft' | 'hard',
       public readonly elapsed: number
     ) {
       super(`${type} timeout after ${elapsed}ms`);
     }
   }
   ```

4. Update tests

CONSTRAINTS:
- Do NOT change child class implementations
- Handle cleanup properly (no zombie processes)
- Log timeout events for debugging

After implementation, run:
- npm run typecheck
- npm test -- src/platforms

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T13: Claude Runner - Fix Prompt Size Limit

### Title
Fix Claude runner command-line prompt length limit

### Goal
Large prompts don't exceed OS command-line limits.

### Depends on
- P0-T11

### Parallelizable with
- P0-T12, P0-T14, P0-T15

### Recommended model quality
Medium OK — file-based prompt passing

### Read first
- `src/platforms/claude-runner.ts`
- `CodexsMajorImprovements.md` P0.8

### Files to create/modify
- `src/platforms/claude-runner.ts`

### Implementation notes
1. **The Problem**:
   - ClaudeRunner passes prompt via `-p <prompt>`
   - Large prompts exceed OS command-line limits (~128KB on Linux, ~32KB on Windows)

2. **The Fix**:
   - Write prompt to temp file
   - Pass file path instead: `claude-code -f /tmp/prompt.txt`
   - Or use stdin: `echo "$prompt" | claude-code`

### Acceptance criteria
- [ ] Large prompts work (>32KB)
- [ ] Temp files cleaned up after use
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms/claude-runner` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms/claude-runner
```

### Evidence to record
- Large prompt execution log

### Cursor Agent Prompt
```
Fix Claude runner command-line prompt length limit.

CRITICAL CONTEXT:
ClaudeRunner passes full prompt via `-p <prompt>` command line argument.
OS limits: ~128KB Linux, ~32KB Windows
Large requirements docs + context easily exceed these limits.

YOUR TASK (P0-T13):
1. Read src/platforms/claude-runner.ts

2. Detect prompt size and use file-based passing:
   ```typescript
   async buildCommand(request: ExecutionRequest): Promise<string[]> {
     const promptSize = Buffer.byteLength(request.prompt, 'utf8');
     const MAX_CMDLINE_SIZE = process.platform === 'win32' ? 30000 : 120000;

     if (promptSize > MAX_CMDLINE_SIZE) {
       // Write to temp file
       const promptFile = await this.writePromptFile(request.prompt);
       this.tempFiles.push(promptFile);
       return ['claude-code', '--print', '-f', promptFile];
     } else {
       return ['claude-code', '--print', '-p', request.prompt];
     }
   }

   private async writePromptFile(prompt: string): Promise<string> {
     const file = path.join(os.tmpdir(), `puppet-master-prompt-${Date.now()}.txt`);
     await fs.writeFile(file, prompt, 'utf8');
     return file;
   }
   ```

3. Clean up temp files:
   ```typescript
   async cleanup(): Promise<void> {
     for (const file of this.tempFiles) {
       await fs.unlink(file).catch(() => {});
     }
     this.tempFiles = [];
   }
   ```

4. Update tests with large prompt test case

CONSTRAINTS:
- Clean up temp files even on error
- Handle encoding properly (UTF-8)
- Test on both Windows and Unix

After implementation, run:
- npm run typecheck
- npm test -- src/platforms/claude-runner

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T14: Codex Runner - Set Approval Policy

### Title
Configure Codex runner for non-interactive execution

### Goal
Codex runner doesn't stall waiting for user approval.

### Depends on
- P0-T11

### Parallelizable with
- P0-T12, P0-T13, P0-T15

### Recommended model quality
Medium OK — flag configuration

### Read first
- `src/platforms/codex-runner.ts`
- OpenAI Codex CLI documentation
- `CodexsMajorImprovements.md` P0.8

### Files to create/modify
- `src/platforms/codex-runner.ts`

### Implementation notes
1. **The Problem**:
   - CodexRunner doesn't set approval policies
   - May stall in interactive flows waiting for user input

2. **The Fix**:
   - Add `--approval-mode full-auto` or equivalent flag
   - Set structured output mode if available
   - Handle stdin to prevent interactive prompts

### Acceptance criteria
- [ ] Codex runs non-interactively
- [ ] No user approval prompts
- [ ] Structured output if available
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms/codex-runner` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms/codex-runner
```

### Evidence to record
- Codex non-interactive execution log

### Cursor Agent Prompt
```
Configure Codex runner for non-interactive execution.

CRITICAL CONTEXT:
CodexRunner may stall waiting for interactive approvals.
For automated orchestration, it must run in full-auto mode.

YOUR TASK (P0-T14):
1. Read src/platforms/codex-runner.ts
2. Research current Codex CLI flags for approval mode

3. Update command building:
   ```typescript
   buildCommand(request: ExecutionRequest): string[] {
     return [
       'codex',
       '--approval-mode', 'full-auto',  // or equivalent
       '--output-format', 'json',        // if available
       '-p', request.prompt,
       // ... other flags
     ];
   }
   ```

4. Handle stdin to prevent hangs:
   ```typescript
   const child = spawn(command, args, {
     stdio: ['ignore', 'pipe', 'pipe'],  // No stdin
     // ...
   });
   ```

5. Update tests

CONSTRAINTS:
- Don't break interactive mode (should be configurable)
- Handle case where flag not supported
- Log warning if approval mode can't be set

After implementation, run:
- npm run typecheck
- npm test -- src/platforms/codex-runner

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T15: Cursor Runner - Fix Command Name Consistency

### Title
Ensure consistent Cursor CLI command naming

### Goal
Cursor runner uses correct command name across all contexts and supports Cursor “plan mode” (configurable) for higher-quality outputs.

### Depends on
- P0-T11

### Parallelizable with
- P0-T12, P0-T13, P0-T14

### Recommended model quality
Medium OK — runner CLI/options wiring

### Read first
- `src/platforms/cursor-runner.ts`
- `src/platforms/capability-discovery.ts`
- `src/doctor/checks/`
- `CodexsMajorImprovements.md` P0.8
 - Cursor CLI `--help` output for the chosen command (`cursor` / `cursor-agent`)

### Files to create/modify
- `src/platforms/cursor-runner.ts`
- `src/platforms/capability-discovery.ts`
- Relevant doctor checks
 - `src/types/config.ts` + config schema (if adding a config knob for plan mode)

### Implementation notes
1. **The Problem**:
   - Inconsistent naming: `cursor-agent` vs `cursor` vs `cursor-cli`
   - Doctor, capability discovery, and runner may not agree

2. **The Fix**:
   - Define canonical command name in one place
   - Use that definition everywhere
   - Capability discovery validates correct command

3. **Cursor plan mode (quality-critical)**:
   - Cursor is significantly more effective with “plan mode”.
   - Add a config-controlled option to enable plan mode for Cursor executions (default: enabled for orchestrated runs).
   - Implement it via the correct Cursor CLI flag (research via `--help`), with a safe fallback:
     - If plan mode flag is unavailable, inject a “plan-first” system instruction into the prompt builder instead (still non-interactive).

### Acceptance criteria
- [ ] Single source of truth for Cursor command name
- [ ] Doctor checks correct command
- [ ] Capability discovery uses correct command
- [ ] Runner uses correct command
- [ ] Cursor runner supports plan mode (configurable) and passes the correct CLI flag when enabled
- [ ] Cursor runner supports `model: auto` (passes through tier model setting)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms/cursor-runner` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms/cursor-runner
npm test -- src/platforms/capability-discovery
npm test -- src/doctor
```

### Evidence to record
- Unified command name in all locations

### Cursor Agent Prompt
```
Ensure consistent Cursor CLI command naming across the codebase.

CRITICAL CONTEXT:
The codebase has inconsistent Cursor CLI references:
- Some places use 'cursor-agent'
- Some use 'cursor'
- Some use 'cursor-cli'

This causes Doctor to check wrong command, discovery to fail, etc.
Also: Cursor is much higher quality in “plan mode” (auto model + plan mode).

YOUR TASK (P0-T15):
1. Search codebase for all Cursor command references:
   - src/platforms/cursor-runner.ts
   - src/platforms/capability-discovery.ts
   - src/doctor/checks/
   - Any config files

2. Create single source of truth for the Cursor command name:
   ```typescript
   // src/platforms/constants.ts
   export const PLATFORM_COMMANDS = {
     cursor: process.platform === 'win32' ? 'cursor.exe' : 'cursor',
     codex: 'codex',
     claude: 'claude',
   } as const;
   ```

3. Update all references to use the constant

4. Add Cursor plan mode as an option:
   - Determine the correct CLI flag(s) by inspecting `--help` for the chosen Cursor command.
   - Add a config knob (recommended) so plan mode can be enabled/disabled.
   - When enabled, pass the plan-mode flag to Cursor CLI.
   - If the flag is not supported, fall back to a “plan-first” prompt instruction (still non-interactive).

5. Verify Doctor check uses correct command

6. Update tests:
   - Assert CursorRunner builds args that include the plan-mode flag when enabled
   - Assert CursorRunner passes `--model auto` when tier model is `auto`

CONSTRAINTS:
- Handle Windows vs Unix differences
- Handle PATH-based lookup
- Don't break existing functionality
 - Plan mode must be optional, but easy to enable by default for orchestration

After implementation, run:
- npm run typecheck
- npm test -- src/platforms/cursor-runner
- npm test -- src/platforms/capability-discovery
- npm test -- src/doctor

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T16: Orchestrator Loop - Drive Tier State Machines + Run Subtask Gates

### Title
Make the orchestration loop actually drive tier state machines and execute subtask gates

### Goal
Prevent “infinite first subtask” behavior by ensuring every subtask follows the intended lifecycle and is advanced by real gate results (not by hope or silent no-ops).

### Depends on
- P0-T04

### Parallelizable with
- P0-T17, P0-T18

### Recommended model quality
HQ required — this is a core correctness fix

### Read first
- `src/core/orchestrator.ts` (`runLoop`, `handleIterationResult`, `handleGateResult`)
- `src/core/tier-state-machine.ts`
- `src/core/state-transitions.ts`
- `src/core/tier-state-manager.ts`
- `src/core/auto-advancement.ts`
- `src/verification/verification-integration.ts`
- `CodexsMajorImprovements.md` P0.11

### Files to create/modify
- `src/core/orchestrator.ts`
- `src/core/auto-advancement.ts`
- `src/verification/verification-integration.ts` (promote subtask gate to first-class)
- `src/core/orchestrator.test.ts` (or new integration tests under `src/core/`)

### Implementation notes
1. **The Problem** (today):
   - The loop spawns iterations without first moving the subtask into `planning`/`running` (`TIER_SELECTED` / `PLAN_APPROVED`).
   - Tier events like `ITERATION_COMPLETE` / `ITERATION_FAILED` are silently ignored when the subtask is still `pending`.
   - There is no real **subtask gate execution** to emit `GATE_PASSED` / `GATE_FAILED_*`, so `AutoAdvancement` cannot advance.

2. **Define a concrete subtask lifecycle** (recommended):
   - Subtasks are the unit of gating:
     `pending → planning → running → gating → passed | retrying | escalated | failed`

3. **Make tier transitions explicit and fatal when invalid**:
   - When selecting a subtask for work:
     - `TIER_SELECTED`, then `PLAN_APPROVED` must be emitted before spawning the iteration.
   - After an iteration:
     - Emit exactly one of `ITERATION_COMPLETE` or `ITERATION_FAILED`.
     - Run the **subtask gate** (via `VerificationIntegration`) and transition via `GATE_PASSED` / `GATE_FAILED_MINOR` / `GATE_FAILED_MAJOR`.
   - If any `stateMachine.send(...)` returns `false`, treat it as a bug (throw + stop), not as a silent no-op.

4. **Wire subtask gating into the loop**:
   - Promote subtask gating to a first-class method (e.g., `runSubtaskGate(subtask)` returning `GateResult`), then call `handleGateResult(...)`.
   - Ensure gate evidence is written under the *subtask* gate id consistently.

### Acceptance criteria
- [ ] Orchestrator emits `TIER_SELECTED` and `PLAN_APPROVED` before spawning an iteration for a subtask
- [ ] Subtask gate runs after `<ralph>COMPLETE</ralph>` and transitions the subtask to `passed`/`retrying`/`escalated`
- [ ] Invalid tier transitions are fatal (no silent `send(false)` behavior)
- [ ] `AutoAdvancement` can advance after a subtask passes its gate
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/orchestrator` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/orchestrator
npm test -- src/core/auto-advancement
```

### Evidence to record
- An execution trace showing: `TIER_SELECTED → PLAN_APPROVED → ITERATION_COMPLETE → gate → GATE_PASSED`

### Cursor Agent Prompt
```
Fix the orchestrator so it actually drives the Ralph tier state machines and executes subtask gates.

CRITICAL CONTEXT:
Codex review P0.11: The system can loop forever on the first subtask because the orchestrator spawns iterations without valid tier transitions and never runs subtask gates.

YOUR TASK (P0-T16):
1. Read:
   - src/core/orchestrator.ts (runLoop + result handling)
   - src/core/tier-state-machine.ts + src/core/state-transitions.ts
   - src/core/auto-advancement.ts
   - src/verification/verification-integration.ts

2. In Orchestrator.runLoop():
   - Before spawning an iteration on a subtask:
     - Emit TIER_SELECTED then PLAN_APPROVED for that subtask.
     - If send(...) returns false, throw (fatal bug).

3. After spawnIteration returns:
   - Emit ITERATION_COMPLETE on <ralph>COMPLETE</ralph>, else ITERATION_FAILED on <ralph>GUTTER</ralph> or runtime failure.
   - Run a real subtask gate (do NOT skip gating).
   - Transition the subtask based on gate result (GATE_PASSED / GATE_FAILED_MINOR / GATE_FAILED_MAJOR).

4. Ensure AutoAdvancement can advance once the subtask is passed.

5. Add/adjust tests to prove:
   - pending->planning->running happens before execution
   - gate runs and state changes to passed
   - invalid transitions fail fast

After implementation, run:
- npm run typecheck
- npm test -- src/core/orchestrator
- npm test -- src/core/auto-advancement

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T17: Execution Routing - Honor CLI Flags and Config (PRD path + model selection)

### Title
Make CLI/config selections real (no “flag accepted but ignored”)

### Goal
Ensure `--prd <path>` and `tiers.*.model` (and related routing choices) are honored in runtime execution requests and persistence.

### Depends on
- P0-T01

### Parallelizable with
- P0-T16, P0-T18

### Recommended model quality
HQ required — trust and correctness issue

### Read first
- `src/cli/commands/start.ts`
- `src/core/container.ts`
- `src/core/orchestrator.ts` (constructor config + `buildIterationContext`)
- `src/core/execution-engine.ts` (ExecutionRequest building)
- `src/types/platforms.ts` (`ExecutionRequest.model`)
- `CodexsMajorImprovements.md` P0.12

### Files to create/modify
- `src/cli/commands/start.ts`
- `src/core/container.ts`
- `src/core/orchestrator.ts`
- `src/core/execution-engine.ts`
- Tests under `src/cli/commands/start.test.ts` and/or `src/core/execution-engine.test.ts`

### Implementation notes
1. **Fix `--prd` override**:
   - If CLI provides `--prd`, container wiring must use that file path for `PrdManager` (and related state/persistence helpers) instead of silently using `config.memory.prdFile`.

2. **Make model selection real**:
   - `ExecutionEngine` must populate `ExecutionRequest.model` from the resolved tier configuration.
   - Treat “model config exists but never passed into execution request” as a P0 defect.

3. **Make `projectPath` / `prdPath` meaningful**:
   - `OrchestratorConfig.projectPath` and `OrchestratorConfig.prdPath` must be used (or removed) — no dead config surfaces.

### Acceptance criteria
- [ ] `puppet-master start --prd <path>` reads/writes the PRD at that path (not the default)
- [ ] Execution requests include `model` when configured
- [ ] “Flag accepted but ignored” behaviors are covered by tests
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/cli/commands/start` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/cli/commands/start
npm test -- src/core/execution-engine
```

### Evidence to record
- Test proving `--prd` overrides persistence path and `ExecutionRequest.model` is set

### Cursor Agent Prompt
```
Fix execution routing so CLI flags and config are actually honored.

CRITICAL CONTEXT:
Codex review P0.12: "flag accepted but ignored" destroys user trust.
- start --prd validates the file but runtime ignores it.
- tiers.*.model exists but ExecutionRequest.model is never set.

YOUR TASK (P0-T17):
1. Read:
   - src/cli/commands/start.ts
   - src/core/container.ts
   - src/core/orchestrator.ts
   - src/core/execution-engine.ts

2. Make --prd actually control the PrdManager path used by runtime.
3. Ensure ExecutionEngine sets ExecutionRequest.model from tier config.
4. Add tests that fail if:
   - --prd is accepted but ignored
   - model is configured but omitted from execution requests

After implementation, run:
- npm run typecheck
- npm test -- src/cli/commands/start
- npm test -- src/core/execution-engine

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T18: Project Root - Canonical Path Resolution (Stop Using `process.cwd()` Implicitly)

### Title
Introduce a canonical ProjectRoot and resolve all state paths against it

### Goal
Make the system behave correctly when launched from outside the project directory (GUI, packaged installers, multi-project).

### Depends on
- P0-T01

### Parallelizable with
- P0-T16, P0-T17

### Recommended model quality
HQ required — foundational for installers + GUI multi-project

### Read first
- `src/config/config-manager.ts` (`resolveConfigPath`, path handling)
- `src/core/container.ts` (manager wiring)
- `src/memory/prd-manager.ts` (defaults)
- `src/memory/evidence-store.ts`, `src/memory/progress-manager.ts`, `src/memory/usage-tracker.ts`
- `src/memory/agents-manager.ts` (rootPath vs projectRoot)
- `src/gui/server.ts` (wizard baseDirectory uses `process.cwd()`)
- `CodexsMajorImprovements.md` P0.13

### Files to create/modify
- `src/config/config-manager.ts`
- `src/core/container.ts`
- `src/memory/*` (where defaults assume CWD)
- `src/gui/server.ts` and `src/gui/routes/*` (where project baseDirectory is implicit)
- Tests (targeted unit tests for path resolution)

### Implementation notes
1. **Define ProjectRoot explicitly**:
   - A single absolute path representing the active target project.
   - All relative paths (PRD, progress, evidence, capability cache, checkpoints) must be derived from it.

2. **Make container wiring project-root aware**:
   - Ensure all managers receive absolute paths (or `{ projectRoot, relativePath }`).
   - Remove hidden coupling to `process.cwd()`.

3. **GUI multi-project readiness**:
   - Avoid global-singleton “current project” that’s implicitly `process.cwd()`.
   - Ensure wizard routes accept/require a project root and pass it through to Start Chain.

### Acceptance criteria
- [ ] Running CLI/GUI from a different CWD still reads/writes state under the selected project root
- [ ] No core modules implicitly derive state paths from `process.cwd()` (except the initial “choose project” step)
- [ ] `npm run typecheck` passes
- [ ] Path-resolution unit tests pass

### Tests to run
```bash
npm run typecheck
npm test -- src/config/config-manager
npm test -- src/core/container
npm test -- src/memory
```

### Evidence to record
- A test showing projectRoot overrides CWD assumptions

### Cursor Agent Prompt
```
Introduce a canonical ProjectRoot and remove hidden dependencies on process.cwd().

CRITICAL CONTEXT:
Codex review P0.13: Packaged apps + GUI multi-project cannot rely on being launched from inside the project folder.

YOUR TASK (P0-T18):
1. Identify every place state paths are relative (prd/progress/evidence/capabilities/checkpoints/agents).
2. Implement a ProjectRoot-based path resolver and wire it through container + managers.
3. Update GUI wizard/start-chain plumbing so it does not assume process.cwd() is the project.
4. Add tests proving that when process.cwd() != projectRoot, state still lands under projectRoot.

After implementation, run:
- npm run typecheck
- npm test -- src/config/config-manager
- npm test -- src/core/container
- npm test -- src/memory

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T19: Doctor + Capability Discovery - “Can Actually Run” (Auth-Aware, Config-Driven)

### Title
Make Doctor/Discovery validate real execution readiness (not just binary presence)

### Goal
Reduce “looks installed but fails immediately” incidents by validating invocation, auth readiness, and required runtime dependencies (including Playwright browsers).

### Depends on
- P0-T15
- P0-T18

### Parallelizable with
- P0-T16, P0-T17

### Recommended model quality
HQ required — avoids production breakage and trust loss

### Read first
- `src/platforms/capability-discovery.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/checks/runtime-check.ts` (semver import)
- `src/verification/verifiers/browser-verifier.ts` (Playwright usage)
- `src/types/config.ts` (`cliPaths`, if present)
- `CodexsMajorImprovements.md` P0.14

### Files to create/modify
- `src/platforms/capability-discovery.ts`
- `src/doctor/checks/cli-tools.ts`
- `src/doctor/checks/runtime-check.ts`
- `src/doctor/checks/playwright-check.ts` (new)
- `package.json` (if Doctor needs missing runtime deps like `semver`)
- Tests under `src/doctor/checks/` and `src/platforms/`

### Implementation notes
1. **Honor configured CLI paths**:
   - Doctor + discovery must use `config.cliPaths.*` (and OS-specific command names) rather than hardcoding `cursor-agent`/`codex`/`claude`.

2. **Fix Cursor doctor bug**:
   - If you fall back from `cursor-agent` to `agent`, the `--help` check must run against the command that actually succeeded (not always `cursor-agent`).

3. **Add auth-ready checks** (opt-in where necessary to avoid costs):
   - Distinguish: “binary exists” vs “authenticated / usable”.
   - Provide actionable fix suggestions per platform.

4. **Add Playwright/browser readiness check**:
   - Verify Playwright is installed and browsers are available (or provide fix command).

5. **Doctor must not crash**:
   - Remove transitive-only runtime assumptions (e.g., add `semver` as a direct dependency or stop using it).

### Acceptance criteria
- [ ] Doctor reports per-platform: installed / runnable / authenticated (or “auth check skipped”)
- [ ] Capability discovery respects `cliPaths` and records working invocation
- [ ] Playwright readiness is checked and has an automated fix suggestion
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/doctor` passes
- [ ] `npm test -- src/platforms/capability-discovery` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/doctor
npm test -- src/platforms/capability-discovery
```

### Evidence to record
- Doctor output showing “installed vs authenticated” distinctions and Playwright readiness result

### Cursor Agent Prompt
```
Make doctor + capability discovery validate the real execution surface (auth-aware, config-driven).

CRITICAL CONTEXT:
Codex review P0.14: "CLI exists" is not enough at scale.
We must detect auth problems, command drift, and missing runtime deps before the loop starts.

YOUR TASK (P0-T19):
1. Update capability discovery to:
   - use config.cliPaths (or a shared resolver)
   - distinguish missing vs not-authenticated vs unknown

2. Fix src/doctor/checks/cli-tools.ts Cursor bug:
   - Track which command succeeded and run --help against that exact command.

3. Add a Playwright readiness doctor check:
   - Detect missing browsers and provide a fix suggestion.

4. Ensure Doctor itself is safe for production installs:
   - Fix semver runtime dependency handling.

After implementation, run:
- npm run typecheck
- npm test -- src/doctor
- npm test -- src/platforms/capability-discovery

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T20: State Persistence - Make Pause/Resume and Checkpoints Actually Restorable

### Title
Fix persistence so resume works reliably (no “checkpoint exists but cannot restore”)

### Goal
Allow long-running workflows to pause/resume and recover after crash without losing tier positioning or state machine progress.

### Depends on
- P0-T16
- P0-T18

### Parallelizable with
- P0-T17, P0-T19

### Recommended model quality
HQ required — mandatory for large-scale builds

### Read first
- `src/core/state-persistence.ts`
- `src/core/orchestrator-state-machine.ts` (context limitations)
- `src/core/tier-state-manager.ts` (restore logic)
- `src/cli/commands/pause.ts`, `src/cli/commands/resume.ts`
- `CodexsMajorImprovements.md` P0.15

### Files to create/modify
- `src/core/state-persistence.ts`
- `src/core/orchestrator-state-machine.ts`
- `src/core/orchestrator.ts` (persist `orchestratorContext` updates)
- `src/core/tier-state-manager.ts` (if needed)
- Automated resume test(s) (prefer integration-style under `src/core/` or `src/cli/`)

### Implementation notes
1. **Pick a restoration strategy**:
   - Option A (recommended): persist and replay orchestrator + tier event logs.
   - Option B: persist exact state + context and allow safe “set state directly”.

2. **Orchestrator context must be restorable**:
   - Persist `currentPhaseId/currentTaskId/currentSubtaskId` (and current iteration) to PRD so `TierStateManager` can select the correct current node on restart.

3. **Checkpoint restore must reach all valid tier states**:
   - Ensure restore logic can reconstruct `running`, `gating`, `passed`, `failed`, `escalated`, and `retrying`.

4. **Automated end-to-end resume test**:
   - Start → run one iteration → pause → new orchestrator instance → resume continues from same subtask.

### Acceptance criteria
- [ ] Checkpoints restore correct current tier IDs and tier states
- [ ] `puppet-master pause` followed by `puppet-master resume` continues correctly
- [ ] End-to-end automated resume test exists and passes
- [ ] `npm run typecheck` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/state-persistence
npm test -- src/cli/commands/pause
npm test -- src/cli/commands/resume
```

### Evidence to record
- Resume test log showing correct tier continuity

### Cursor Agent Prompt
```
Fix persistence so pause/resume and checkpoints actually restore real runtime state.

CRITICAL CONTEXT:
Codex review P0.15: state is persisted, but restoration is incomplete/unreliable; resume cannot be trusted.

YOUR TASK (P0-T20):
1. Read src/core/state-persistence.ts and identify what is missing for full restoration.
2. Implement a restoration strategy (event replay or exact-state restore).
3. Ensure orchestratorContext (currentPhaseId/currentTaskId/currentSubtaskId) is persisted and restored.
4. Add an automated e2e resume test: start -> pause -> restart -> resume -> continues correctly.

After implementation, run:
- npm run typecheck
- npm test -- src/core/state-persistence
- npm test -- src/cli/commands/pause
- npm test -- src/cli/commands/resume

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T21: Coordination Layer - Reliable Stop/Pause/Kill via Daemon + Process Registry

### Title
Implement a real control plane so CLI + GUI can reliably manage long-running orchestration

### Goal
Replace best-effort stop/pause/kill with a deterministic coordinator (daemon) that tracks sessions and child processes across platforms.

### Depends on
- P0-T16
- P0-T18

### Parallelizable with
- P0-T20, P0-T22

### Recommended model quality
HQ required — substantial systems work

### Read first
- `src/cli/commands/start.ts`, `src/cli/commands/stop.ts`, `src/cli/commands/pause.ts`
- `src/gui/routes/controls.ts`
- `src/core/execution-engine.ts` (process tracking)
- `src/platforms/base-runner.ts` (spawn/terminate)
- `CodexsMajorImprovements.md` P0.16
- Codex-Weave patterns (coordinator + streaming)

### Files to create/modify
- `src/core/coordinator/` (new) — daemon + registry + control API
- `src/cli/commands/*` (start/stop/pause/status route through coordinator)
- `src/gui/routes/controls.ts` (talk to coordinator)
- Tests for coordinator control flows

### Implementation notes
1. **Single coordination surface**:
   - CLI and GUI must talk to the same long-running session (no “each command constructs a new orchestrator”).

2. **Process registry**:
   - Track orchestrator PID and all spawned child PIDs per iteration.
   - Persist a session file under `.puppet-master/sessions/<sessionId>.json` for recovery and remote control.

3. **Cross-platform termination**:
   - Ensure child processes are killable (process groups on Unix, Windows-compatible tree kill).
   - Stop semantics must be explicit: “finish current iteration” vs “hard stop now”.

### Acceptance criteria
- [ ] `puppet-master stop` reliably terminates active orchestrations and their child processes
- [ ] `puppet-master pause` reliably pauses (and persists state) without corrupting PRD
- [ ] GUI controls operate against the same coordinator session
- [ ] Automated integration tests cover start/pause/stop flows

### Tests to run
```bash
npm run typecheck
npm test -- src/cli/commands/stop
npm test -- src/cli/commands/pause
npm test -- src/gui
```

### Evidence to record
- Session registry file + test logs proving stop kills child processes

### Cursor Agent Prompt
```
Build a real coordination layer (daemon + process registry) so stop/pause/kill are reliable.

CRITICAL CONTEXT:
Codex review P0.16: current control is best-effort; stop/pause cannot reliably terminate platform runner processes.

YOUR TASK (P0-T21):
1. Design a coordinator/daemon that owns:
   - the orchestrator instance
   - a process registry (child PIDs)
   - a control API that CLI + GUI can call

2. Update CLI start/stop/pause to route through the coordinator (no new orchestrator per command).
3. Implement robust process-tree termination across platforms.
4. Add automated integration tests for start -> pause -> stop flows.

After implementation, run:
- npm run typecheck
- npm test -- src/cli/commands/stop
- npm test -- src/cli/commands/pause
- npm test -- src/gui

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P0-T22: Gate Enforcement - Wire AGENTS.md Enforcement/Promotion into Execution

### Title
Make AGENTS.md enforcement a real gate (not test-only code)

### Goal
Prevent rule drift at scale by running enforcement/promotion after gates using the actual diff + transcript, failing gates on violations.

### Depends on
- P0-T16
- P0-T18

### Parallelizable with
- P0-T20, P0-T21

### Recommended model quality
HQ required — affects correctness across all tasks

### Read first
- `src/agents/gate-enforcer.ts`
- `src/agents/promotion-engine.ts`
- `src/agents/archive-manager.ts`
- `src/memory/agents-manager.ts` (hierarchy loading)
- `src/verification/gate-runner.ts` / `src/verification/verification-integration.ts`
- `CodexsMajorImprovements.md` P0.17

### Files to create/modify
- `src/verification/verification-integration.ts` (or `src/verification/gate-runner.ts`)
- `src/core/orchestrator.ts` (invoke enforcement after gates)
- Evidence storage for enforcement reports
- Tests proving enforcement runs in live path

### Implementation notes
1. **Enforcement inputs must be real**:
   - Use the actual git diff / changed files list (not only agent stdout heuristics).
   - Use the real transcript (captured reliably via P0-T08).
   - Load the correct AGENTS.md hierarchy via `AgentsManager.loadForContext(...)`.

2. **Enforcement as gate result**:
   - Treat enforcement violations as gate failures (with actionable feedback).
   - Save enforcement reports as evidence next to gate reports.

### Acceptance criteria
- [ ] Enforcement runs automatically after subtask/task/phase gates
- [ ] Violations fail gates deterministically with actionable feedback
- [ ] Enforcement evidence is stored and linkable from gate reports
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/agents` passes
- [ ] `npm test -- src/verification` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/agents
npm test -- src/verification
```

### Evidence to record
- Gate report containing enforcement evidence references

### Cursor Agent Prompt
```
Wire AGENTS.md enforcement into live gate execution so rules cannot drift.

CRITICAL CONTEXT:
Codex review P0.17: enforcement code exists but is not part of the runtime path; rules will drift at scale.

YOUR TASK (P0-T22):
1. Identify the correct place to run enforcement (after gate runner produces a report).
2. Run GateEnforcer + PromotionEngine using:
   - applicable AGENTS.md hierarchy
   - real transcript
   - real changed files/diff
3. Fail the gate when violations occur and record evidence.
4. Add tests proving enforcement executes in the orchestrator/gate path.

After implementation, run:
- npm run typecheck
- npm test -- src/agents
- npm test -- src/verification

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## Phase Overview: P1 High Priority

These tasks are important for production viability but don't completely block functionality.

### Parallel Groups (P1)

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Parallel Group A | P1-T01, P1-T02, P1-T03, P1-T20 | P0 Complete |
| Sequential | P1-T04 | P1-T01 |
| Parallel Group B | P1-T06, P1-T19 | P1-T04 |
| Sequential | P1-T21 | P1-T03, P1-T06 |
| Sequential | P1-T05 | P1-T04, P1-T21 |
| Sequential | P1-T07 | P0 Complete |
| Parallel Group C | P1-T08, P1-T09, P1-T10 | P1-T07 |
| Sequential | P1-T11 | P0 Complete |
| Parallel Group D | P1-T12, P1-T13 | P1-T11 |
| Parallel Group E | P1-T14, P1-T15, P1-T16, P1-T17, P1-T18 | P0 Complete |

---

## P1-T01: Start Chain - Add Requirements Interview Step

### Title
Add qualifying questions before PRD generation

### Goal
Generate questions to clarify requirements before building PRD.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T02, P1-T03

### Recommended model quality
HQ required — AI prompt design

### Read first
- `src/core/start-chain/pipeline.ts`
- `CodexsMajorImprovements.md` P1.0

### Files to create/modify
- `src/start-chain/requirements-interviewer.ts` (new)
- `src/core/start-chain/pipeline.ts`
- `src/start-chain/prompts/interview-prompt.ts` (new)

### Implementation notes
Generate qualifying questions for:
- Missing information for objective criteria
- Ambiguous/conflicting requirements
- Missing NFRs (security, performance, etc.)
- Missing “major component” categories (see Master Implementation Plan checklist):
  - Product/UX, Data/persistence, Security/secrets, Deployment/environments, Observability, Performance/budgets, Reliability, Compatibility, Testing/verification

Persist as:
- `.puppet-master/requirements/questions.md`
- `.puppet-master/requirements/assumptions.md`

Include a **Coverage Checklist** section in `questions.md` that explicitly marks each category as:
- Covered (with citations/section paths), OR
- Missing (with the top question + default assumption), OR
- Out-of-scope (explicitly stated)

### Acceptance criteria
- [ ] Generates relevant qualifying questions
- [ ] Questions persisted to files
- [ ] Default assumptions documented
- [ ] Can gate PRD generation on unanswered critical questions
- [ ] Coverage checklist included (major categories explicitly covered/missing/out-of-scope)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Sample questions.md and assumptions.md

### Cursor Agent Prompt
```
Add requirements interview step to Start Chain pipeline.

GOAL:
Before generating PRD/architecture, explicitly identify:
- What information is still needed for objective acceptance criteria?
- What requirements are ambiguous/conflicting?
- What critical NFRs are missing (security, deployment, perf)?
- Which major component categories are missing (Product/UX, Data, Security, Deployment, Observability, Performance, Reliability, Compatibility, Testing)
- For each missing category: generate the top question + a default assumption

YOUR TASK (P1-T01):
1. Create src/start-chain/prompts/interview-prompt.ts:
   - Prompt template that analyzes parsed requirements
   - Asks AI to generate qualifying questions
   - Format: question, why it matters, default assumption
   - Also output a “Coverage Checklist” section (covered/missing/out-of-scope per category)

2. Create src/start-chain/requirements-interviewer.ts:
   - RequirementsInterviewer class
   - async generateQuestions(parsed: ParsedRequirements): Promise<InterviewResult>
   - Persist to .puppet-master/requirements/questions.md
   - Persist assumptions to .puppet-master/requirements/assumptions.md

3. Update src/core/start-chain/pipeline.ts:
   - Add interview step before PRD generation
   - Option to gate on critical unanswered questions
   - Pass assumptions to PRD generator as context

4. Add tests

CONSTRAINTS:
- Questions should be ranked by importance
- Limit to ~10 questions max
- Make interview step optional (configurable)

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T02: Start Chain - Add Coverage Gate

### Title
Add requirements coverage validation to Start Chain

### Goal
Automatically detect when PRD doesn't cover all requirements.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T01, P1-T03

### Recommended model quality
HQ required — coverage analysis

### Read first
- `src/core/start-chain/pipeline.ts`
- `src/start-chain/validation-gate.ts`
- `CodexsMajorImprovements.md` P1.1

### Files to create/modify
- `src/start-chain/validators/coverage-validator.ts` (new)
- `src/core/start-chain/pipeline.ts`

### Implementation notes
Coverage metrics to compute:
- Total chars/lines extracted vs source size
- Number of headings detected
- Number of bullets/requirements extracted
- AI-assisted comparison: PRD items vs raw requirements
- If inventory exists (P1-T20): requirementsCovered/Total based on `REQ-*` units + missing `REQ-*` list

Hard fail if:
- Coverage below threshold
- Only 1 phase from large doc
- Generic filler criteria exceed allowance

### Acceptance criteria
- [ ] Coverage metrics computed and logged
- [ ] Hard fail on low coverage
- [ ] AI coverage diff identifies missing requirements
- [ ] Coverage report persisted
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Coverage report for sample document

### Cursor Agent Prompt
```
Add requirements coverage validation to Start Chain.

GOAL:
Automatically detect when PRD doesn't cover all requirements.
Hard fail when coverage is too low.

YOUR TASK (P1-T02):
1. Create src/start-chain/validators/coverage-validator.ts:
   - CoverageValidator class
   - computeCoverage(parsed: ParsedRequirements, prd: PRD): CoverageReport

   Metrics:
   - extractedChars / sourceChars (basic coverage)
   - headingsCount (structure detection)
   - bulletsCount (requirements extracted)
   - phasesCount (should be > 1 for large docs)
   - genericCriteriaCount (filler like "Implementation complete")
   - If inventory exists (P1-T20): requirementsTotal / requirementsCovered / missingRequirementIds

2. Add AI coverage diff:
   - Prompt AI to list requirements NOT in PRD
   - Prefer returning `REQ-*` IDs + sectionPath + excerpt when inventory exists
   - Return as missingRequirements[]

3. Add validation rules:
   - FAIL if: coverage < 0.5 AND sourceChars > 5000
   - FAIL if: phases == 1 AND sourceChars > 10000
   - WARN if: genericCriteriaCount > 5

4. Update src/core/start-chain/pipeline.ts:
   - Run coverage validator after PRD generation
   - Persist coverage report to .puppet-master/requirements/coverage.json

5. Add tests

CONSTRAINTS:
- Coverage thresholds should be configurable
- Don't block on warnings, only errors
- Provide actionable error messages

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T03: Start Chain - Add Traceability Links

### Title
Add requirement-to-PRD traceability

### Goal
Track which requirements map to which PRD items.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T01, P1-T02

### Recommended model quality
Medium OK — data structure addition

### Read first
- `src/types/prd.ts`
- `CodexsMajorImprovements.md` P1.3

### Files to create/modify
- `src/types/prd.ts`
- `src/start-chain/prd-generator.ts`
- `src/start-chain/prompts/prd-prompt.ts`
- `src/core/start-chain/pipeline.ts` (persist traceability evidence)
- `src/start-chain/traceability.ts` (new; query + report helpers)

### Implementation notes
Add to PRD items:
```typescript
sourceRefs: Array<{
  sourcePath: string;       // File path
  sectionPath: string;      // Section heading path
  excerptHash: string;      // Hash of source text
  lineNumbers?: [number, number];
}>
```

Benefits:
- "Which PRD items cover Requirement 4.2?"
- "Which requirements are currently uncovered?"
- Maintain traceability during replanning
- Power coverage gates + GUI mapping via a persisted traceability matrix

### Acceptance criteria
- [ ] PRD items have sourceRefs field
- [ ] Source references populated during generation
- [ ] Traceability matrix persisted to `.puppet-master/requirements/traceability.json`
- [ ] Can query "PRD items for requirement X"
- [ ] Can query "uncovered requirements"
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- PRD with source references

### Cursor Agent Prompt
```
Add requirement-to-PRD traceability links.

GOAL:
Track which requirements map to which PRD items for:
- "Which PRD items cover Requirement 4.2?"
- "Which requirements are currently uncovered?"

YOUR TASK (P1-T03):
1. Update src/types/prd.ts:
   - Add SourceRef interface:
     ```typescript
     interface SourceRef {
       sourcePath: string;
       sectionPath: string;
       excerptHash: string;
       lineNumbers?: [number, number];
     }
     ```
   - Add sourceRefs: SourceRef[] to Phase, Task, Subtask interfaces

2. Update src/start-chain/prompts/prd-prompt.ts:
   - Ask AI to include source references in output
   - Format: which section(s) each PRD item addresses

3. Update src/start-chain/prd-generator.ts:
   - Parse sourceRefs from AI output
   - Generate excerptHash from source text
   - Map back to original requirements

4. Add query utilities:
   - getPrdItemsForRequirement(sectionPath: string): PrdItem[]
   - getUncoveredRequirements(parsed: ParsedRequirements, prd: PRD): string[]

   - Persist a traceability matrix to:
     - .puppet-master/requirements/traceability.json
     - Include: requirement identifiers (sectionPath and/or REQ ids), PRD item IDs, excerpt hashes

5. Add tests

CONSTRAINTS:
- Don't break existing PRD format
- Make sourceRefs optional for backward compatibility
- Compute excerptHash deterministically

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T04: Start Chain - Platform/Model Selection per Step

### Title
Allow selecting platform/model for each Start Chain step

### Goal
Configure different AI platforms for PRD vs architecture vs validation.

### Depends on
- P1-T01

### Parallelizable with
- None (gates P1-T05, P1-T06)

### Recommended model quality
Medium OK — config addition

### Read first
- `src/core/start-chain/pipeline.ts`
- `src/start-chain/prd-generator.ts`
- `src/start-chain/arch-generator.ts`
- `src/types/config.ts`
- `CodexsMajorImprovements.md` P1 3.5

### Files to create/modify
- `src/types/config.ts`
- `src/core/start-chain/pipeline.ts`
- `src/start-chain/prd-generator.ts`
- `src/start-chain/arch-generator.ts`

### Implementation notes
Current: Uses `config.tiers.phase.platform` for everything

New config structure:
```yaml
startChain:
  requirementsInterview:
    platform: claude
    model: opus
  prd:
    platform: codex
    model: gpt-4
  architecture:
    platform: claude
    model: sonnet
  validation:
    platform: claude
    model: opus
```

### Acceptance criteria
- [ ] startChain config section added
- [ ] Each step uses its configured platform/model
- [ ] Fallback to tiers.phase if not specified
- [ ] CLI override works (--prd-platform, etc.)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Config with startChain section

### Cursor Agent Prompt
```
Add platform/model selection per Start Chain step.

GOAL:
Allow users to choose different AI platforms/models for:
- Requirements interview
- PRD generation
- Architecture generation
- Validation review

Currently, everything uses config.tiers.phase.platform which doesn't make sense.

YOUR TASK (P1-T04):
1. Update src/types/config.ts:
   - Add StartChainConfig interface:
     ```typescript
     interface StartChainStepConfig {
       platform: Platform;
       model?: string;
       temperature?: number;
     }

     interface StartChainConfig {
       requirementsInterview?: StartChainStepConfig;
       prd?: StartChainStepConfig;
       architecture?: StartChainStepConfig;
       validation?: StartChainStepConfig;
     }
     ```
   - Add startChain?: StartChainConfig to PuppetMasterConfig

2. Update src/core/start-chain/pipeline.ts:
   - Read step-specific config for each step
   - Fallback chain: startChain.prd → tiers.phase → default

3. Update src/start-chain/prd-generator.ts:
   - Accept platform/model as parameters
   - Use provided config instead of hardcoded tiers.phase

4. Update src/start-chain/arch-generator.ts:
   - Same pattern as prd-generator

5. Update CLI commands to allow overrides

6. Add tests

CONSTRAINTS:
- Backward compatible (startChain optional)
- Document new config options
- Validate config at load time

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

---

## New Feature: Agent Termination Option

### NF-T01: Add Agent Termination Setting

### Title
Add option to keep failed agent alive instead of killing

### Goal
Allow users to configure whether failed agents are killed or kept alive for debugging.

### Depends on
- P0 Complete

### Parallelizable with
- All P1 tasks

### Recommended model quality
Medium OK — config + behavior toggle

### Read first
- `src/core/orchestrator.ts`
- `src/core/execution-engine.ts`
- `src/types/config.ts`
- `src/gui/public/js/settings.js`
- `src/gui/routes/settings.ts`

### Files to create/modify
- `src/types/config.ts`
- `src/core/execution-engine.ts`
- `src/core/orchestrator.ts`
- `src/gui/routes/settings.ts`
- `src/gui/public/js/settings.js`
- `src/cli/commands/start.ts`

### Implementation notes
1. **Config addition**:
   ```yaml
   execution:
     killAgentOnFailure: true  # default
     # If false, agent stays alive for manual investigation
   ```

2. **Behavior**:
   - `killAgentOnFailure: true` (default): Kill process on iteration failure
   - `killAgentOnFailure: false`: Keep process alive, log PID for user to investigate

3. **GUI**: Add toggle in Settings page

4. **CLI**: Add `--keep-alive-on-failure` flag

### Acceptance criteria
- [ ] Config option added with default true
- [ ] ExecutionEngine respects setting
- [ ] Failed agents killed when true
- [ ] Failed agents kept alive when false (with logged PID)
- [ ] GUI settings toggle works
- [ ] CLI flag works
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes

### Tests to run
```bash
npm run typecheck
npm test
```

### Evidence to record
- Settings page with new toggle
- CLI help showing new flag

### Cursor Agent Prompt
```
Add agent termination option to RWM Puppet Master.

GOAL:
Some users want failed agents to stay alive for debugging.
Add a configuration option with default: kill on failure.

YOUR TASK (NF-T01):
1. Update src/types/config.ts:
   - Add to execution config:
     ```typescript
     execution?: {
       killAgentOnFailure?: boolean;  // default true
     }
     ```

2. Update src/core/execution-engine.ts:
   - In handleIterationFailure() or equivalent:
     ```typescript
     if (this.config.execution?.killAgentOnFailure !== false) {
       await this.killIteration(processId);
     } else {
       this.logger.warn(`Agent kept alive for debugging. PID: ${processId}`);
       this.logger.info(`To kill manually: kill ${processId}`);
     }
     ```

3. Update src/core/orchestrator.ts:
   - Pass config to ExecutionEngine
   - Log differently based on setting

4. Update src/gui/routes/settings.ts:
   - Add endpoint to get/set this setting
   - Persist to config.yaml

5. Update src/gui/public/js/settings.js:
   - Add toggle: "Kill agent on task failure"
   - Default: checked (true)
   - Description: "When unchecked, failed agents remain alive for debugging"

6. Update src/cli/commands/start.ts:
   - Add flag: --keep-alive-on-failure
   - Overrides config when present

7. Update default config.yaml template

8. Add tests

CONSTRAINTS:
- Default MUST be true (kill on failure)
- Log PID clearly when keeping alive
- Warn user about zombie process risk

After implementation, run:
- npm run typecheck
- npm test

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T05: Multi-Pass PRD Generation

### Title
Implement multi-pass PRD generation for large documents

### Goal
Generate PRDs in multiple passes for better coverage and quality.

### Depends on
- P1-T04
- P1-T21

### Parallelizable with
- P1-T19

### Recommended model quality
HQ required — multi-pass orchestration

### Read first
- `src/start-chain/prd-generator.ts`
- `src/core/start-chain/pipeline.ts`
- `CodexsMajorImprovements.md` P1.2
- `src/start-chain/validators/prd-quality-validator.ts` (from P1-T21)

### Files to create/modify
- `src/start-chain/multi-pass-generator.ts` (new)
- `src/start-chain/prd-generator.ts`
- `src/core/start-chain/pipeline.ts`

### Implementation notes
Multi-pass pipeline:
1. Parse + normalize structure (H1-title flattening)
2. Build outline PRD with stable IDs and placeholders
3. Expand each phase/task in isolation (chunked prompts)
4. Run "AI coverage diff" pass - list missing requirements (prefer `REQ-*` IDs when inventory exists)
5. Run PRD quality validator (P1-T21) + coverage validator (P1-T02)
6. If missing requirements exist: apply gap-fill patches and repeat (max passes, deterministic ordering, no ID churn)

### Acceptance criteria
- [ ] Outline PRD generated first with stable IDs
- [ ] Each phase/task expanded in isolation
- [ ] Coverage diff identifies missing requirements
- [ ] Quality validator runs as final pass (P1-T21)
- [ ] Gap-fill loop runs until coverage threshold or max passes (no duplicates; stable IDs)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Multi-pass PRD generation log

### Cursor Agent Prompt
```
Implement multi-pass PRD generation for large documents.

GOAL:
Single-pass PRD generation is fragile for large docs due to context limits.
Implement a multi-pass pipeline for better coverage.

YOUR TASK (P1-T05):
1. Create src/start-chain/multi-pass-generator.ts:
   - MultiPassPrdGenerator class

   Pass 1 - Structure Detection:
   ```typescript
   async generateOutline(parsed: ParsedRequirements): Promise<PrdOutline> {
     // Generate phase/task skeleton with stable IDs
     // No detailed content yet, just structure
   }
   ```

   Pass 2 - Phase Expansion:
   ```typescript
   async expandPhase(outline: PrdOutline, phaseId: string): Promise<Phase> {
     // Expand single phase with full details
     // Can use larger context since focused on one phase
   }
   ```

   Pass 3 - Coverage Diff:
   ```typescript
   async coverageDiff(parsed: ParsedRequirements, prd: PRD): Promise<string[]> {
     // AI identifies requirements not in PRD
     // Returns list of missing items
   }
   ```

   Pass 4 - Gap Fill:
   ```typescript
   async fillGaps(prd: PRD, missingRequirements: string[]): Promise<PRD> {
     // Add missing requirements as new phases/tasks
   }
   ```

2. Update src/core/start-chain/pipeline.ts:
   - Use MultiPassPrdGenerator for large docs (> threshold)
   - Use single-pass for small docs (faster)
   - Threshold configurable
   - Run PrdQualityValidator (P1-T21) + CoverageValidator (P1-T02) on every pass
   - Repeat gap-fill up to maxRepairPasses; preserve IDs and deterministic order

3. Add tests with large sample document

CONSTRAINTS:
- Maintain ID stability across passes
- Don't duplicate requirements
- Handle partial failures gracefully

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T06: Generate Real Test Plans

### Title
Auto-generate test commands based on project language/framework

### Goal
PRD test plans contain actual executable commands, not empty arrays.

### Depends on
- P1-T04

### Parallelizable with
- P1-T05

### Recommended model quality
Medium OK — project detection logic

### Read first
- `src/start-chain/prd-generator.ts` (`createTestPlan`)
- `src/platforms/capability-discovery.ts`
- `CodexsMajorImprovements.md` P1 Verification 2

### Files to create/modify
- `src/start-chain/test-plan-generator.ts` (new)
- `src/start-chain/prd-generator.ts`

### Implementation notes
Project detection:
- `package.json` exists → npm test, npm run typecheck, npm run lint
- `pyproject.toml` or `setup.py` → pytest, ruff, mypy
- `Cargo.toml` → cargo test, cargo clippy
- `go.mod` → go test ./..., go vet

If no tests exist, generate subtask to create test harness.

### Acceptance criteria
- [ ] TestPlanGenerator detects project type
- [ ] Test commands populated based on project
- [ ] Empty test plan triggers warning
- [ ] Subtask created to add tests if none exist
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Generated test plan for sample project

### Cursor Agent Prompt
```
Auto-generate test commands based on project language/framework.

GOAL:
PRD testPlan.commands[] is currently always empty.
Generate real test commands based on the project.

YOUR TASK (P1-T06):
1. Create src/start-chain/test-plan-generator.ts:
   - TestPlanGenerator class

   ```typescript
   interface DetectedProject {
     language: 'typescript' | 'python' | 'rust' | 'go' | 'java' | 'unknown';
     framework?: string;
     hasTests: boolean;
     testCommands: string[];
     lintCommands: string[];
     buildCommands: string[];
   }

   class TestPlanGenerator {
     async detectProject(projectPath: string): Promise<DetectedProject> {
       // Check for package.json, pyproject.toml, Cargo.toml, go.mod, etc.
     }

     generateTestPlan(detected: DetectedProject, subtask: Subtask): TestPlan {
       const commands: string[] = [];

       if (detected.language === 'typescript') {
         if (detected.hasTests) commands.push('npm test');
         commands.push('npm run typecheck');
         commands.push('npm run lint');
       }
       // ... other languages

       return { commands, failFast: true };
     }

     generateTestSetupSubtask(detected: DetectedProject): SubtaskSpec | null {
       if (detected.hasTests) return null;

       return {
         title: 'Set up test harness',
         description: `Create test infrastructure for ${detected.language} project`,
         acceptanceCriteria: [
           'Test framework configured',
           'At least one passing test exists',
         ],
       };
     }
   }
   ```

2. Update src/start-chain/prd-generator.ts:
   - Use TestPlanGenerator for each subtask
   - Insert test setup subtask if needed

3. Add tests

CONSTRAINTS:
- Don't assume tools exist without checking
- Include framework-specific commands when detected
- Keep commands simple and reliable

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T07: Rate Limiting and Quota Enforcement

### Title
Enforce rate limits and quotas for platform calls

### Goal
Prevent rate limit errors and budget overruns.

### Depends on
- P0 Complete

### Parallelizable with
- None (gates P1-T08, T09, T10)

### Recommended model quality
Medium OK — quota logic

### Read first
- `src/budget/quota-manager.ts`
- `src/budget/usage-tracker.ts`
- `CodexsMajorImprovements.md` P1 Multi-Platform 4

### Files to create/modify
- `src/budget/rate-limiter.ts` (new)
- `src/budget/quota-manager.ts`
- `src/platforms/base-runner.ts`

### Implementation notes
1. **Rate limiter per platform**:
   - Track calls per minute
   - Implement cooldown when limit hit
   - Configurable limits per platform

2. **Quota enforcement**:
   - Currently QuotaManager exists but is logging-only
   - Make it enforcement: block calls when quota exhausted
   - Allow configurable soft vs hard limits

### Acceptance criteria
- [ ] RateLimiter tracks calls per platform
- [ ] Cooldown enforced when rate limit hit
- [ ] QuotaManager blocks when hard limit reached
- [ ] Warning on soft limit
- [ ] Configurable limits in config.yaml
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/budget` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/budget
```

### Evidence to record
- Rate limit enforcement log

### Cursor Agent Prompt
```
Enforce rate limits and quotas for platform calls.

GOAL:
Prevent rate limit errors from AI platforms and budget overruns.
Currently QuotaManager exists but only logs - make it enforce.

YOUR TASK (P1-T07):
1. Create src/budget/rate-limiter.ts:
   ```typescript
   interface RateLimitConfig {
     callsPerMinute: number;
     cooldownMs: number;
   }

   class RateLimiter {
     private callHistory: Map<Platform, number[]>; // timestamps

     async waitForSlot(platform: Platform): Promise<void> {
       const history = this.callHistory.get(platform) || [];
       const recentCalls = history.filter(t => Date.now() - t < 60000);

       if (recentCalls.length >= this.config[platform].callsPerMinute) {
         const waitTime = 60000 - (Date.now() - recentCalls[0]);
         this.logger.info(`Rate limit reached for ${platform}, waiting ${waitTime}ms`);
         await this.sleep(waitTime);
       }
     }

     recordCall(platform: Platform): void {
       // Add timestamp to history
     }
   }
   ```

2. Update src/budget/quota-manager.ts:
   - Add enforcement mode (not just logging)
   - checkQuota() throws QuotaExhaustedError when hard limit hit
   - Returns warning when soft limit hit

3. Update src/platforms/base-runner.ts:
   - Inject RateLimiter and QuotaManager
   - Before execute():
     ```typescript
     await this.rateLimiter.waitForSlot(this.platform);
     this.quotaManager.checkQuota(this.platform); // throws if exhausted
     ```
   - After execute():
     ```typescript
     this.rateLimiter.recordCall(this.platform);
     this.quotaManager.recordUsage(this.platform, usage);
     ```

4. Add config options:
   ```yaml
   budget:
     rateLimits:
       cursor:
         callsPerMinute: 20
         cooldownMs: 5000
       codex:
         callsPerMinute: 10
         cooldownMs: 10000
       claude:
         callsPerMinute: 30
         cooldownMs: 3000
     quotas:
       softLimitPercent: 80
       hardLimitPercent: 100
   ```

5. Add tests

CONSTRAINTS:
- Don't block indefinitely - have max wait time
- Log all rate limit events
- Allow quota override for admin users

After implementation, run:
- npm run typecheck
- npm test -- src/budget

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T08: Per-Tier Platform Routing

### Title
Route to different platforms based on tier type

### Goal
Phase planning, task execution, and gate review can use different platforms.

### Depends on
- P1-T07

### Parallelizable with
- P1-T09, P1-T10

### Recommended model quality
Medium OK — routing logic

### Read first
- `src/core/orchestrator.ts`
- `src/types/config.ts`
- `src/start-chain/tier-plan-generator.ts`
- `CodexsMajorImprovements.md` P1 Multi-Platform 3

### Files to create/modify
- `src/core/platform-router.ts` (new)
- `src/core/orchestrator.ts`
- `src/types/config.ts`

### Implementation notes
Current: Single platform selected at startup for all execution.
Goal: TierPlan specifies platform per tier, orchestrator routes accordingly.

Config:
```yaml
tiers:
  phase:
    platform: claude
    model: opus
  task:
    platform: codex
    model: gpt-4
  subtask:
    platform: cursor
  gate_review:
    platform: claude
    model: sonnet
```

### Acceptance criteria
- [ ] PlatformRouter selects platform per tier
- [ ] TierPlan platform respected during execution
- [ ] Gate review uses separate platform config
- [ ] Fallback chain if preferred platform unavailable
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core
```

### Evidence to record
- Execution log showing different platforms per tier

### Cursor Agent Prompt
```
Implement per-tier platform routing.

GOAL:
Different tiers should use different platforms/models:
- Phase planning: Claude Opus (high quality)
- Task execution: Codex (fast)
- Subtask: Cursor (interactive)
- Gate review: Claude Sonnet (balanced)

Currently: Single platform for everything.

YOUR TASK (P1-T08):
1. Create src/core/platform-router.ts:
   ```typescript
   class PlatformRouter {
     selectPlatform(tier: TierNode, action: 'execute' | 'review'): PlatformConfig {
       const tierType = tier.type;

       if (action === 'review') {
         return this.config.tiers.gate_review ?? this.config.tiers[tierType];
       }

       // Use tier-specific config
       const tierConfig = this.config.tiers[tierType];

       // Check if platform available
       if (this.isAvailable(tierConfig.platform)) {
         return tierConfig;
       }

       // Fallback chain
       return this.getFallback(tierConfig.platform);
     }

     private isAvailable(platform: Platform): boolean {
       return this.capabilities.get(platform)?.available ?? false;
     }

     private getFallback(preferred: Platform): PlatformConfig {
       const fallbacks = {
         cursor: ['codex', 'claude'],
         codex: ['claude', 'cursor'],
         claude: ['codex', 'cursor'],
       };
       for (const fb of fallbacks[preferred]) {
         if (this.isAvailable(fb)) {
           return this.config.tiers.subtask; // Use subtask config as fallback
         }
       }
       throw new NoPlatformAvailableError();
     }
   }
   ```

2. Update src/core/orchestrator.ts:
   - Inject PlatformRouter
   - In runIteration():
     ```typescript
     const platform = this.platformRouter.selectPlatform(subtask, 'execute');
     const runner = this.registry.get(platform.platform);
     ```
   - In runGateReview():
     ```typescript
     const platform = this.platformRouter.selectPlatform(tier, 'review');
     ```

3. Update src/types/config.ts:
   - Add gate_review tier config option

4. Add tests

CONSTRAINTS:
- Don't fail if preferred platform unavailable
- Log platform selection for debugging
- Respect TierPlan platform if explicitly set

After implementation, run:
- npm run typecheck
- npm test -- src/core

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T09: FreshSpawner Integration

### Title
Integrate FreshSpawner with platform runners

### Goal
Platform runners use FreshSpawner for process isolation.

### Depends on
- P1-T07

### Parallelizable with
- P1-T08, P1-T10

### Recommended model quality
Medium OK — integration work

### Read first
- `src/core/fresh-spawn.ts`
- `src/platforms/base-runner.ts`
- `CodexsMajorImprovements.md` P1 Multi-Platform 1

### Files to create/modify
- `src/platforms/base-runner.ts`
- `src/core/execution-engine.ts`

### Implementation notes
FreshSpawner exists with:
- Git clean-state checks
- Audit logging
- Timeout handling

But platform runners don't use it - they spawn directly.
Unify to one process spawn path.

### Acceptance criteria
- [ ] Platform runners use FreshSpawner
- [ ] Git state verified before spawn
- [ ] Process audit created for each spawn
- [ ] Timeouts handled by FreshSpawner
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms
```

### Evidence to record
- Process audit log

### Cursor Agent Prompt
```
Integrate FreshSpawner with platform runners.

GOAL:
FreshSpawner has robust process isolation but platform runners don't use it.
Unify to one process spawn path for consistency.

YOUR TASK (P1-T09):
1. Read src/core/fresh-spawn.ts to understand FreshSpawner API

2. Update src/platforms/base-runner.ts:
   - Inject FreshSpawner as dependency
   - Replace direct spawn with FreshSpawner.spawn():
     ```typescript
     async execute(request: ExecutionRequest): Promise<ExecutionResult> {
       const spawnRequest: SpawnRequest = {
         prompt: request.prompt,
         platform: this.platform,
         model: request.model,
         contextFiles: request.contextFiles ?? [],
         iterationId: request.iterationId ?? generateId(),
       };

       const spawnResult = await this.freshSpawner.spawn(spawnRequest);

       // Use spawnResult.stdout, spawnResult.stderr
       // FreshSpawner handles timeouts internally
     }
     ```

3. Update src/core/execution-engine.ts:
   - Remove duplicate spawn logic
   - Delegate to platform runner (which uses FreshSpawner)

4. Add tests verifying:
   - Process audit created
   - Git state verified (if configured)
   - Timeout handled

CONSTRAINTS:
- Don't break platform-specific spawn flags
- FreshSpawner wraps spawn, doesn't replace command building
- Maintain backward compatibility

After implementation, run:
- npm run typecheck
- npm test -- src/platforms

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T10: Structured Output Parsing per Platform

### Title
Implement platform-specific output parsing

### Goal
Parse structured output (JSON, XML, etc.) from each platform reliably.

### Depends on
- P1-T07

### Parallelizable with
- P1-T08, P1-T09

### Recommended model quality
Medium OK — parsing logic

### Read first
- `src/core/output-parser.ts`
- `src/platforms/*.ts`
- `CodexsMajorImprovements.md` P1 Multi-Platform 2

### Files to create/modify
- `src/platforms/output-parsers/` (new directory)
- `src/platforms/output-parsers/cursor-output-parser.ts`
- `src/platforms/output-parsers/codex-output-parser.ts`
- `src/platforms/output-parsers/claude-output-parser.ts`

### Implementation notes
Each platform may have different output format:
- Cursor: Custom format with markers
- Codex: JSON structured output (if available)
- Claude: Stream JSON or plain text

Create platform-specific parsers that normalize to common OutputResult.

### Acceptance criteria
- [ ] Each platform has dedicated output parser
- [ ] Parsers normalize to common OutputResult
- [ ] Handle both structured and plain text
- [ ] Extract RALPH_STATUS block if present
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms/output-parsers` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/platforms/output-parsers
```

### Evidence to record
- Parsed output samples from each platform

### Cursor Agent Prompt
```
Implement platform-specific output parsing.

GOAL:
Different platforms output in different formats.
Create dedicated parsers that normalize to common format.

YOUR TASK (P1-T10):
1. Create src/platforms/output-parsers/ directory

2. Create base interface:
   ```typescript
   // src/platforms/output-parsers/types.ts
   interface ParsedPlatformOutput {
     completionSignal: 'COMPLETE' | 'GUTTER' | 'NONE';
     statusBlock?: RalphStatusBlock;
     filesChanged: string[];
     testResults: TestResult[];
     errors: string[];
     rawOutput: string;
   }

   interface PlatformOutputParser {
     parse(output: string): ParsedPlatformOutput;
   }
   ```

3. Create src/platforms/output-parsers/cursor-output-parser.ts:
   - Parse Cursor-specific markers
   - Extract <ralph>COMPLETE</ralph> signals
   - Handle Cursor's output format

4. Create src/platforms/output-parsers/codex-output-parser.ts:
   - Parse JSON structured output if available
   - Fall back to text parsing
   - Handle Codex-specific markers

5. Create src/platforms/output-parsers/claude-output-parser.ts:
   - Parse stream-json output
   - Handle <RALPH_STATUS> blocks
   - Extract completion signals

6. Update base-runner.ts:
   - Use platform-specific parser
   - Normalize to common OutputResult

7. Add tests for each parser

CONSTRAINTS:
- Parsers should not throw on malformed input
- Always return something (with rawOutput)
- Log parsing failures for debugging

After implementation, run:
- npm run typecheck
- npm test -- src/platforms/output-parsers

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T11: Atomic State Persistence

### Title
Implement atomic state writes with recovery

### Goal
State writes are atomic with backup and recovery.

### Depends on
- P0 Complete

### Parallelizable with
- None (gates P1-T12, T13)

### Recommended model quality
Medium OK — file handling

### Read first
- `src/core/state-persistence.ts`
- `src/memory/prd-manager.ts`
- `ClaudesMajorImprovements.md` Issue #6

### Files to create/modify
- `src/state/atomic-writer.ts` (new)
- `src/core/state-persistence.ts`
- `src/memory/prd-manager.ts`

### Implementation notes
Current issues:
- No atomic writes (corruption risk on crash)
- No state versioning
- No conflict detection

Fix:
1. Write to temp file
2. Verify write succeeded
3. Atomic rename (backup old, rename new)
4. Keep N backups

### Acceptance criteria
- [ ] AtomicWriter does temp → verify → rename
- [ ] Old state backed up before overwrite
- [ ] Recovery reads backup if main corrupted
- [ ] Configurable backup count
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/state` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/state
```

### Evidence to record
- Backup files after multiple saves

### Cursor Agent Prompt
```
Implement atomic state persistence with recovery.

GOAL:
State writes should be atomic to prevent corruption on crash.
Add backup and recovery mechanisms.

YOUR TASK (P1-T11):
1. Create src/state/atomic-writer.ts:
   ```typescript
   class AtomicWriter {
     constructor(private backupCount: number = 3) {}

     async write(filePath: string, content: string): Promise<void> {
       const tempPath = `${filePath}.tmp.${Date.now()}`;
       const backupPath = `${filePath}.backup`;

       // 1. Write to temp file
       await fs.writeFile(tempPath, content, 'utf8');

       // 2. Verify write
       const verified = await fs.readFile(tempPath, 'utf8');
       if (content !== verified) {
         await fs.unlink(tempPath);
         throw new StateWriteError('Verification failed');
       }

       // 3. Backup existing
       if (await this.exists(filePath)) {
         await this.rotateBackups(filePath);
         await fs.rename(filePath, backupPath);
       }

       // 4. Atomic rename
       await fs.rename(tempPath, filePath);
     }

     async read(filePath: string): Promise<string> {
       try {
         return await fs.readFile(filePath, 'utf8');
       } catch (e) {
         // Try backup
         const backupPath = `${filePath}.backup`;
         if (await this.exists(backupPath)) {
           this.logger.warn('Main file corrupted, using backup');
           return await fs.readFile(backupPath, 'utf8');
         }
         throw e;
       }
     }

     private async rotateBackups(filePath: string): Promise<void> {
       // Keep last N backups: .backup.1, .backup.2, etc.
     }
   }
   ```

2. Update src/core/state-persistence.ts:
   - Use AtomicWriter for all state writes

3. Update src/memory/prd-manager.ts:
   - Use AtomicWriter for PRD saves

4. Add tests

CONSTRAINTS:
- Clean up temp files on error
- Don't keep infinite backups
- Log all recovery events

After implementation, run:
- npm run typecheck
- npm test -- src/state

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T12: Checkpointing for Long Runs

### Title
Add periodic checkpointing for long-running executions

### Goal
Long runs can be resumed from checkpoints after crash/restart.

### Depends on
- P1-T11

### Parallelizable with
- P1-T13

### Recommended model quality
Medium OK — checkpoint logic

### Read first
- `src/core/state-persistence.ts`
- `src/core/orchestrator.ts`

### Files to create/modify
- `src/core/checkpoint-manager.ts` (new)
- `src/core/orchestrator.ts`

### Implementation notes
Checkpoint contains:
- Full orchestrator state
- All tier states
- Current position in execution
- Timestamp

Create checkpoint:
- Every N iterations
- After each subtask completes
- On graceful shutdown

Resume:
- `puppet-master resume [checkpoint-id]`

### Acceptance criteria
- [ ] Checkpoints created periodically
- [ ] Checkpoints created on subtask complete
- [ ] Resume from checkpoint works
- [ ] Old checkpoints cleaned up
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/checkpoint` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/checkpoint
```

### Evidence to record
- Checkpoint file contents

### Cursor Agent Prompt
```
Add periodic checkpointing for long-running executions.

GOAL:
Long runs (hours/days) should be resumable after crash/restart.
Create checkpoints periodically and on key events.

YOUR TASK (P1-T12):
1. Create src/core/checkpoint-manager.ts:
   ```typescript
   interface Checkpoint {
     id: string;
     timestamp: string;
     orchestratorState: OrchestratorState;
     tierStates: Record<string, TierContext>;
     currentPosition: {
       phaseId: string;
       taskId?: string;
       subtaskId?: string;
       iterationNumber: number;
     };
     metadata: {
       projectName: string;
       completedSubtasks: number;
       totalSubtasks: number;
     };
   }

   class CheckpointManager {
     constructor(
       private checkpointDir: string,
       private maxCheckpoints: number = 10
     ) {}

     async createCheckpoint(state: PersistedState, position: CurrentPosition): Promise<string> {
       const checkpoint: Checkpoint = {
         id: `checkpoint-${Date.now()}`,
         timestamp: new Date().toISOString(),
         // ... populate from state
       };

       const path = join(this.checkpointDir, `${checkpoint.id}.json`);
       await this.atomicWriter.write(path, JSON.stringify(checkpoint, null, 2));

       await this.cleanOldCheckpoints();
       return checkpoint.id;
     }

     async loadCheckpoint(id: string): Promise<Checkpoint> {
       const path = join(this.checkpointDir, `${id}.json`);
       const content = await fs.readFile(path, 'utf8');
       return JSON.parse(content);
     }

     async listCheckpoints(): Promise<CheckpointSummary[]> {
       // List checkpoints with metadata
     }

     private async cleanOldCheckpoints(): Promise<void> {
       // Keep only maxCheckpoints, delete oldest
     }
   }
   ```

2. Update src/core/orchestrator.ts:
   - Inject CheckpointManager
   - Create checkpoint after each subtask completes
   - Create checkpoint every N iterations (configurable)
   - Create checkpoint on SIGTERM/graceful shutdown

3. Add CLI command:
   - `puppet-master resume <checkpoint-id>`
   - `puppet-master checkpoints list`

4. Add tests

CONSTRAINTS:
- Checkpoints should be small (don't include full file contents)
- Clean up old checkpoints automatically
- Support listing available checkpoints

After implementation, run:
- npm run typecheck
- npm test -- src/core/checkpoint

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T13: Worker/Reviewer Separation

### Title
Implement separate worker and reviewer agents

### Goal
Different agents/models for coding vs reviewing.

### Depends on
- P1-T11

### Parallelizable with
- P1-T12

### Recommended model quality
HQ required — architecture change

### Read first
- `src/core/orchestrator.ts`
- `ClaudesMajorImprovements.md` Issue #5

### Files to create/modify
- `src/core/worker-reviewer.ts` (new)
- `src/core/orchestrator.ts`
- `src/types/config.ts`

### Implementation notes
Ralph Wiggum Model recommends:
- Worker agent does coding
- Reviewer agent decides SHIP vs REVISE
- Different models for each role

Flow:
1. Worker implements subtask
2. Worker claims done
3. Reviewer verifies (different context)
4. Reviewer returns SHIP or REVISE with feedback

### Acceptance criteria
- [ ] Separate worker and reviewer roles
- [ ] Reviewer uses different model (configurable)
- [ ] Reviewer sees only relevant context (not worker's debug output)
- [ ] Feedback written for next iteration if REVISE
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core
```

### Evidence to record
- Worker and reviewer logs for same subtask

### Cursor Agent Prompt
```
Implement separate worker and reviewer agents.

GOAL:
Ralph Wiggum Model recommends:
- Worker agent does coding
- Reviewer agent decides SHIP vs REVISE
- Different models/contexts for each

YOUR TASK (P1-T13):
1. Create src/core/worker-reviewer.ts:
   ```typescript
   interface WorkerResult {
     claimsDone: boolean;
     output: string;
     filesChanged: string[];
     testsPassed?: boolean;
   }

   interface ReviewerResult {
     verdict: 'SHIP' | 'REVISE';
     confidence: number;
     feedback?: string;
     failedCriteria?: string[];
   }

   class WorkerReviewerOrchestrator {
     constructor(
       private workerConfig: PlatformConfig,
       private reviewerConfig: PlatformConfig,
       private platformRegistry: PlatformRegistry
     ) {}

     async runIteration(subtask: TierNode): Promise<IterationResult> {
       // Phase 1: Worker implements
       const workerResult = await this.runWorker(subtask);

       if (!workerResult.claimsDone) {
         return { status: 'continue', workerResult };
       }

       // Phase 2: Reviewer verifies (different model/context)
       const reviewerResult = await this.runReviewer(subtask, workerResult);

       if (reviewerResult.verdict === 'SHIP') {
         return { status: 'complete', workerResult, reviewerResult };
       } else {
         await this.writeFeedback(subtask, reviewerResult);
         return { status: 'revise', workerResult, reviewerResult };
       }
     }

     private async runReviewer(subtask: TierNode, workerResult: WorkerResult): Promise<ReviewerResult> {
       const prompt = this.buildReviewerPrompt(subtask, workerResult);

       // Use reviewer platform/model (different from worker)
       const runner = this.platformRegistry.get(this.reviewerConfig.platform);
       const output = await runner.execute({
         prompt,
         model: this.reviewerConfig.model,
       });

       return this.parseReviewerOutput(output);
     }

     private buildReviewerPrompt(subtask: TierNode, workerResult: WorkerResult): string {
       // Reviewer sees:
       // - Subtask description
       // - Acceptance criteria
       // - Files changed
       // - Test results
       // Reviewer does NOT see:
       // - Worker's debug output
       // - Worker's reasoning
     }
   }
   ```

2. Update src/core/orchestrator.ts:
   - Use WorkerReviewerOrchestrator for iteration execution
   - Configure worker and reviewer separately

3. Add config:
   ```yaml
   roles:
     worker:
       platform: cursor
       model: null  # default
     reviewer:
       platform: claude
       model: sonnet
   ```

4. Add tests

CONSTRAINTS:
- Reviewer must have fresh context (no worker bias)
- Keep reviewer prompts focused and short
- Log both worker and reviewer decisions

After implementation, run:
- npm run typecheck
- npm test -- src/core

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T14: CLI - Update Plan Command

### Title
Update plan command with new Start Chain features

### Goal
CLI plan command uses real Start Chain with platform selection.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T15, P1-T16, P1-T17, P1-T18

### Recommended model quality
Low OK — CLI integration

### Read first
- `src/cli/commands/plan.ts`
- `src/core/start-chain/pipeline.ts`

### Files to create/modify
- `src/cli/commands/plan.ts`

### Implementation notes
Add flags:
- `--prd-platform <platform>` - Platform for PRD generation
- `--arch-platform <platform>` - Platform for architecture
- `--dry-run` - Show what would be generated
- `--skip-interview` - Skip requirements interview
- `--skip-inventory` - Skip requirements inventory extraction (not recommended)
- `--coverage-threshold <percent>` - Minimum coverage required
- `--max-repair-passes <n>` - Max Start Chain repair loops (coverage/quality gap fill)

### Acceptance criteria
- [ ] Platform selection flags work
- [ ] Dry-run shows plan without executing
- [ ] Coverage threshold enforced
- [ ] Interview step integrated
- [ ] Inventory step integrated (or explicitly skipped)
- [ ] PRD quality gate runs (and reports failures clearly)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/cli/commands/plan` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/cli/commands/plan
```

### Evidence to record
- CLI help output

### Cursor Agent Prompt
```
Update plan command with new Start Chain features.

YOUR TASK (P1-T14):
1. Update src/cli/commands/plan.ts:
   - Add --prd-platform flag
   - Add --arch-platform flag
   - Add --skip-interview flag
   - Add --coverage-threshold flag
   - Add --dry-run flag

2. Integrate with new Start Chain:
   - Use StartChainConfig from config
   - Override with CLI flags if provided
   - Run interview step unless skipped
   - Validate coverage threshold

3. Update help text

4. Add tests

After implementation, run:
- npm run typecheck
- npm test -- src/cli/commands/plan

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T15: CLI - Add Resume Command

### Title
Add resume command for checkpoint recovery

### Goal
Users can resume from checkpoints.

### Depends on
- P0 Complete
- P1-T12 for checkpoints

### Parallelizable with
- P1-T14, P1-T16, P1-T17, P1-T18

### Recommended model quality
Low OK — CLI implementation

### Read first
- `src/cli/commands/start.ts`
- `src/core/checkpoint-manager.ts` (from P1-T12)

### Files to create/modify
- `src/cli/commands/resume.ts` (new)
- `src/cli/commands/checkpoints.ts` (new)
- `src/cli/index.ts`

### Implementation notes
Commands:
- `puppet-master resume [checkpoint-id]` - Resume from checkpoint
- `puppet-master checkpoints list` - List available checkpoints
- `puppet-master checkpoints delete <id>` - Delete checkpoint

### Acceptance criteria
- [ ] Resume command loads checkpoint
- [ ] Execution continues from checkpoint position
- [ ] Checkpoints list shows available
- [ ] Delete works
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/cli/commands/resume` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/cli/commands/resume
```

### Evidence to record
- Resume command output

### Cursor Agent Prompt
```
Add resume command for checkpoint recovery.

YOUR TASK (P1-T15):
1. Create src/cli/commands/resume.ts:
   - Load checkpoint by ID
   - Restore orchestrator state
   - Continue execution from checkpoint position

2. Create src/cli/commands/checkpoints.ts:
   - list subcommand
   - delete subcommand
   - info subcommand (show checkpoint details)

3. Update src/cli/index.ts:
   - Register new commands

4. Add tests

After implementation, run:
- npm run typecheck
- npm test -- src/cli/commands/resume

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T16: CLI - Add Status Command Improvements

### Title
Enhance status command with coverage and metrics

### Goal
Status command shows comprehensive project state.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T14, P1-T15, P1-T17, P1-T18

### Recommended model quality
Low OK — CLI output

### Read first
- `src/cli/commands/status.ts`

### Files to create/modify
- `src/cli/commands/status.ts`

### Implementation notes
Add to status output:
- Coverage metrics (from P1-T02)
- Completion percentage
- Failed items list
- Current checkpoint info
- Budget/quota usage

### Acceptance criteria
- [ ] Status shows coverage metrics
- [ ] Status shows completion percentage
- [ ] Status lists failed items
- [ ] Status shows checkpoint info
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/cli/commands/status` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/cli/commands/status
```

### Evidence to record
- Status command output

### Cursor Agent Prompt
```
Enhance status command with coverage and metrics.

YOUR TASK (P1-T16):
1. Update src/cli/commands/status.ts:
   - Add coverage metrics section
   - Add completion percentage
   - Add failed items section
   - Add checkpoint info
   - Add budget/quota usage

2. Format output nicely (tables, colors)

3. Add --json flag for machine-readable output

4. Add tests

After implementation, run:
- npm run typecheck
- npm test -- src/cli/commands/status

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T17: GUI - Add Settings Page Improvements

### Title
Add new settings to GUI settings page

### Goal
All new configuration options accessible in GUI.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T14, P1-T15, P1-T16, P1-T18

### Recommended model quality
Low OK — GUI form

### Read first
- `src/gui/routes/settings.ts`
- `src/gui/public/js/settings.js`

### Files to create/modify
- `src/gui/routes/settings.ts`
- `src/gui/public/js/settings.js`
- `src/gui/views/settings.ejs` (if exists)

### Implementation notes
Add settings for:
- Agent termination option (NF-T01)
- Start Chain platform selection (P1-T04)
- Coverage threshold (P1-T02)
- Requirements inventory toggle (P1-T20)
- PRD quality gate toggle + thresholds (P1-T21)
- Max repair passes (Start Chain gap-fill loop)
- Rate limits (P1-T07)
- Worker/Reviewer platforms (P1-T13)

### Acceptance criteria
- [ ] Agent termination toggle present
- [ ] Start Chain platform dropdowns
- [ ] Coverage threshold slider
- [ ] Rate limit inputs
- [ ] Settings persist correctly
- [ ] `npm run typecheck` passes
- [ ] GUI loads without errors

### Tests to run
```bash
npm run typecheck
npm test -- src/gui
```

### Evidence to record
- Settings page screenshot

### Cursor Agent Prompt
```
Add new settings to GUI settings page.

YOUR TASK (P1-T17):
1. Update src/gui/routes/settings.ts:
   - Add endpoints for new settings
   - Validate input
   - Persist to config.yaml

2. Update src/gui/public/js/settings.js:
   - Add UI for agent termination toggle
   - Add UI for Start Chain platform selection
   - Add UI for coverage threshold
   - Add UI for rate limits
   - Add UI for worker/reviewer platforms

3. Style nicely (consistent with existing UI)

4. Test settings persistence

After implementation, run:
- npm run typecheck
- npm test -- src/gui

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T18: GUI - Add Coverage Report View

### Title
Add coverage report visualization to GUI

### Goal
Users can see requirements coverage in GUI.

### Depends on
- P0 Complete
- P1-T02 for coverage data

### Parallelizable with
- P1-T14, P1-T15, P1-T16, P1-T17

### Recommended model quality
Low OK — GUI visualization

### Read first
- `src/gui/routes/wizard.ts`
- Coverage report structure from P1-T02

### Files to create/modify
- `src/gui/routes/coverage.ts` (new)
- `src/gui/public/js/coverage.js` (new)
- `src/gui/views/coverage.ejs` (new)

### Implementation notes
Coverage view shows:
- Overall coverage percentage (gauge)
- Sections covered vs uncovered (list)
- Requirements → PRD item mapping (expandable)
- Missing requirements highlighted

### Acceptance criteria
- [ ] Coverage gauge shows percentage
- [ ] Sections list shows covered/uncovered
- [ ] Mapping expandable to see details
- [ ] Missing requirements highlighted in red
- [ ] `npm run typecheck` passes
- [ ] GUI loads without errors

### Tests to run
```bash
npm run typecheck
npm test -- src/gui
```

### Evidence to record
- Coverage view screenshot

### Cursor Agent Prompt
```
Add coverage report visualization to GUI.

YOUR TASK (P1-T18):
1. Create src/gui/routes/coverage.ts:
   - GET /coverage - Show coverage report
   - GET /coverage/data - Return coverage JSON

2. Create src/gui/public/js/coverage.js:
   - Render coverage gauge (percentage)
   - Render sections list (covered/uncovered)
   - Render requirement → PRD mapping (expandable tree)
   - Highlight missing requirements in red

3. Create src/gui/views/coverage.ejs:
   - Layout consistent with other pages
   - Include coverage.js

4. Add navigation link to coverage page

After implementation, run:
- npm run typecheck
- npm test -- src/gui

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P1-T19: Start Chain - Fix Architecture Generation Context (Not Lossy)

### Title
Make architecture generation useful at platform scale (stop losing critical context)

### Goal
Generate architecture documents that preserve key requirements, constraints, and non-functional requirements, with explicit tradeoffs and an executable test strategy (no manual-only guidance).

### Depends on
- P1-T04

### Parallelizable with
- P1-T05, P1-T06, P1-T07

### Recommended model quality
HQ required — prompt + validation design for large inputs

### Read first
- `src/start-chain/prompts/arch-prompt.ts`
- `src/start-chain/arch-generator.ts`
- `src/core/start-chain/pipeline.ts`
- `REQUIREMENTS.md` Section 5.3 (architecture generation requirements)
- `CodexsMajorImprovements.md` P1 2.5

### Files to create/modify
- `src/start-chain/prompts/arch-prompt.ts`
- `src/start-chain/arch-generator.ts`
- `src/core/start-chain/pipeline.ts` (if adding multi-pass for architecture)
- Tests for prompt building and parsing/validation

### Implementation notes
1. **The Problem**:
   - `buildArchPrompt()` currently feeds a highly lossy requirements summary (headings + first-line previews).
   - For large documents, this produces generic, incomplete architecture output that cannot guide implementation at platform scale.

2. **Make architecture generation multi-pass** (recommended):
   - Pass A: generate an architecture outline with required sections + stable anchors (IDs).
   - Pass B: expand each section/module in isolation (chunked prompts).
   - Pass C: run a coverage/consistency validator: list missing requirements and propose concrete additions.

3. **Strengthen required sections** (include at minimum):
   - Data model + persistence
   - API/service boundaries
   - Deployment + environments
   - Observability (logs/metrics/traces)
   - Security (auth, secrets, threat model highlights)
   - Test strategy with automated verification mapping back to PRD test plans

4. **Add output validation**:
   - Hard fail if architecture doc is too short, missing key sections, or contains “manual verification” instructions without automated alternatives.

### Acceptance criteria
- [ ] Architecture prompt includes enough requirements detail to be non-generic for large docs
- [ ] Architecture generation supports multi-pass/chunked expansion
- [ ] Output includes required sections and ties back to PRD/test plans
- [ ] No manual-only verification guidance; test strategy includes automated checks
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Example generated architecture doc showing complete sections + traceability to PRD

### Cursor Agent Prompt
```
Fix architecture generation so it is not lossy and scales to large requirements docs.

CRITICAL CONTEXT:
Codex review P1 2.5: buildArchPrompt currently loses too much information (only headings/first lines).
We need architecture output that is specific, complete, and implementable.

YOUR TASK (P1-T19):
1. Improve arch-prompt.ts to include richer requirements + PRD context (without exceeding model limits).
2. Add a multi-pass architecture build (outline -> expand -> validate coverage).
3. Add validators that hard-fail if key sections are missing or the doc is generic/too short.
4. Ensure the architecture doc includes an automated test strategy (no manual-only checks).

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P1-T20: Start Chain - Requirements Inventory (Atomic REQ Units)

### Title
Extract a stable “requirements inventory” and persist it as a first-class artifact

### Goal
Create an explicit, auditable list of atomic requirements (`REQ-*`) from the parsed source document so coverage/traceability/gap-fill can be enforced deterministically.

### Depends on
- P0 Complete

### Parallelizable with
- P1-T01, P1-T02, P1-T03

### Recommended model quality
HQ required — large-doc extraction + determinism

### Read first
- `src/types/requirements.ts` (ParsedRequirements + ParsedSection)
- `src/start-chain/parsers/` (markdown/pdf/docx/text)
- `src/core/start-chain/pipeline.ts` (Start Chain orchestration)
- `CodexsMajorImprovements.md` “Requirements coverage” + traceability notes

### Files to create/modify
- `src/types/requirements-inventory.ts` (new)
- `src/start-chain/prompts/inventory-prompt.ts` (new)
- `src/start-chain/requirements-inventory.ts` (new)
- `src/core/start-chain/pipeline.ts` (persist artifacts under `.puppet-master/requirements/`)
- `src/types/index.ts` (export new types)
- Tests for the above (placed next to source files)

### Implementation notes
1. **RequirementUnit shape** (persisted to `.puppet-master/requirements/inventory.json`):
   ```typescript
   export interface RequirementUnit {
     id: string;                 // "REQ-0001"
     sectionPath: string;        // "H1 Title > H2 Section > H3 Subsection"
     excerpt: string;            // the minimal atomic requirement text
     excerptHash: string;        // deterministic hash of normalized excerpt
     kind: 'functional' | 'nfr' | 'constraint' | 'open_question';
     severity: 'must' | 'should' | 'could';
   }
   ```

2. **Deterministic ID assignment**:
   - Compute `excerptHash` (normalize whitespace, strip bullet prefixes, stable casing).
   - Persist `.puppet-master/requirements/id-map.json` (hash → REQ id) and reuse on reruns.
   - Inventory ordering must follow document order for stability.

3. **Extraction strategy**:
   - Heuristic pass (always on): bullets, numbered lists, “must/should/shall/required” sentences, table rows.
   - AI pass (optional but recommended for large docs): dedupe + rewrite into atomic units + classify `kind/severity`.
   - Always preserve a link back to source via `sectionPath` (+ optional line numbers when available).

4. **Pipeline integration**:
   - Persist:
     - `.puppet-master/requirements/parsed.json` (normalized parsed structure + section paths)
     - `.puppet-master/requirements/inventory.json`
     - `.puppet-master/requirements/id-map.json`
   - Ensure inventory step runs before PRD generation when enabled.

### Acceptance criteria
- [ ] Inventory generated for any input doc (md/pdf/docx/text), even if AI is unavailable (heuristic fallback)
- [ ] Inventory IDs are stable across reruns via `id-map.json`
- [ ] Each RequirementUnit includes `sectionPath` + `excerptHash`
- [ ] Inventory persisted under `.puppet-master/requirements/`
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Sample `.puppet-master/requirements/inventory.json` + `.puppet-master/requirements/id-map.json`

### Cursor Agent Prompt
```
Implement a Requirements Inventory step for Start Chain.

GOAL:
We must not silently miss major requirements. Build an explicit inventory of atomic requirements (REQ-0001, REQ-0002, ...) that can be used for coverage gates, traceability, and gap fill.

YOUR TASK (P1-T20):
1. Create src/types/requirements-inventory.ts:
   - Define RequirementUnit + RequirementsInventory (metadata + units[])

2. Create src/start-chain/requirements-inventory.ts:
   - class RequirementsInventoryBuilder
   - build(parsed: ParsedRequirements): Promise<RequirementsInventory>
   - Always run heuristic extraction first
   - Optionally refine with AI (when platformRegistry/quota/config available)

3. Create src/start-chain/prompts/inventory-prompt.ts:
   - Prompt AI to convert heuristic candidates into atomic units
   - Output JSON only, schema-validated, deterministic (low temperature)

4. Update src/core/start-chain/pipeline.ts:
   - Persist parsed.json + inventory.json + id-map.json under .puppet-master/requirements/
   - Ensure inventory runs before PRD generation when enabled

CONSTRAINTS:
- Deterministic IDs: persist and reuse id-map.json (excerptHash -> REQ id)
- Do not drop requirements to fit caps; if inventory is too small, produce a hard failure with evidence
- Tests must cover: bullets, numbered lists, tables, prose requirements

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P1-T21: Start Chain - PRD Quality Validator (Rubric + Repair Hints)

### Title
Add a PRD quality gate that rejects low-quality PRDs before execution (and feeds repair passes)

### Goal
Prevent “looks valid but misses major things” PRDs by enforcing verifiability, specificity, traceability, and non-empty test plans with actionable error output.

### Depends on
- P0 Complete
- P0-T03 (no manual criteria enforcement)
- P1-T03 (traceability links in PRD)
- P1-T06 (real test plans)

### Parallelizable with
- P1-T07, P1-T08, P1-T09, P1-T10

### Recommended model quality
Medium OK — validator + reporting (no model calls required)

### Read first
- `src/start-chain/validation-gate.ts` (current PRD validation)
- `src/types/prd.ts` (PRD schema)
- `src/types/tiers.ts` (Criterion/TestPlan types)
- `src/core/start-chain/pipeline.ts` (where to run gates)
- `BUILD_QUEUE_IMPROVEMENTS.md` Master Implementation Plan (PRD quality + coverage loop)

### Files to create/modify
- `src/start-chain/validators/prd-quality-validator.ts` (new)
- `src/start-chain/validation-gate.ts` (integrate validator results)
- `src/core/start-chain/pipeline.ts` (persist quality report; block execution on failure)
- Tests for the above

### Implementation notes
Quality checks (hard fail unless explicitly configured otherwise):
1. **Verifiability**
   - No `manual` criteria (already enforced by P0-T03)
   - `command`/`regex`/`file_exists`/`browser_verify`/`ai` criteria must have non-empty, valid `target`
2. **Specificity / anti-filler**
   - Limit generic criteria (e.g., “Implementation complete”) by percent and absolute count
   - Flag “TODO”, “tbd”, “figure out”, “maybe” language
3. **Test plan completeness**
   - Enforce minimum commands for detected project type (Node: typecheck/test/build at least when present)
4. **Traceability**
   - Require `sourceRefs` and/or `requirementIds` for phases/tasks/subtasks (threshold configurable; default strict)
5. **Structural sanity**
   - Large docs should not produce 1 phase (already in P0-T02 heuristics, but enforce here too)

Report format:
- Persist `.puppet-master/requirements/prd-quality.json` with:
  - metrics counts + ratios
  - errors[] (code/message/path/suggestion)
  - warnings[]

### Acceptance criteria
- [ ] Validator rejects PRDs with missing targets, excessive filler, empty test plans, or missing traceability
- [ ] Errors include precise JSON paths and repair suggestions
- [ ] Quality report persisted to `.puppet-master/requirements/prd-quality.json`
- [ ] Start Chain pipeline fails fast on PRD quality errors (before saving “final” artifacts)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/start-chain` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/start-chain
```

### Evidence to record
- Example `prd-quality.json` showing failures + suggestions on a deliberately bad PRD fixture

### Cursor Agent Prompt
```
Implement a PRD Quality Validator and wire it into Start Chain.

GOAL:
Prevent PRDs that "look valid" but miss major components by enforcing:
- verifiable criteria targets
- low filler criteria
- non-empty test plans
- traceability presence

YOUR TASK (P1-T21):
1. Create src/start-chain/validators/prd-quality-validator.ts:
   - class PrdQualityValidator
   - validate(prd: PRD, parsed?: ParsedRequirements): ValidationResult & metrics
   - produce actionable errors with JSON paths + suggestions

2. Integrate into src/start-chain/validation-gate.ts and/or src/core/start-chain/pipeline.ts:
   - run after PRD generation and before continuing to architecture/tier-plan
   - persist report to .puppet-master/requirements/prd-quality.json
   - hard-fail Start Chain if errors exist

3. Add tests:
   - fixture PRD with missing targets, filler criteria, empty test plans, missing traceability
   - validator produces expected error codes + paths

CONSTRAINTS:
- Do not add manual verification paths
- Keep validator deterministic (no model calls)

After implementation, run:
- npm run typecheck
- npm test -- src/start-chain

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
```

---

## P2 Medium Priority Tasks

These are quality-of-life and scale improvements.

### Parallel Groups (P2)

| Group | Tasks | Can Start After |
|-------|-------|-----------------|
| Parallel Group A | P2-T01, P2-T02, P2-T03, P2-T04 | P1 Complete |
| Parallel Group B | P2-T05, P2-T06, P2-T07, P2-T08 | P1 Complete |
| Parallel Group C | P2-T09, P2-T10, P2-T11, P2-T12 | P1 Complete |

---

## P2-T01: Parallel Execution with Git Worktrees

### Title
Enable parallel subtask execution using git worktrees

### Goal
Multiple subtasks can execute in parallel with isolated workspaces.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T02, P2-T03, P2-T04

### Recommended model quality
HQ required — complex feature

### Read first
- `src/git/git-manager.ts`
- Zeroshot worktree implementation
- `ClaudesMajorImprovements.md` P2 recommendations

### Files to create/modify
- `src/git/worktree-manager.ts` (new)
- `src/core/parallel-executor.ts` (new)
- `src/core/orchestrator.ts`

### Implementation notes
Pattern from Zeroshot:
- Create worktree per parallel agent
- Each agent works in isolated directory
- Merge back only after gates pass
- Handle merge conflicts as separate step

### Acceptance criteria
- [ ] WorktreeManager creates/destroys worktrees
- [ ] ParallelExecutor runs N subtasks concurrently
- [ ] Each subtask in isolated worktree
- [ ] Merge after gates pass
- [ ] Conflict handling as subtask if needed
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/git/worktree` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/git/worktree
npm test -- src/core/parallel-executor
```

### Evidence to record
- Multiple worktrees active
- Successful merge

### Cursor Agent Prompt
```
Enable parallel subtask execution using git worktrees.

GOAL:
Run multiple independent subtasks in parallel with isolated workspaces.
Use git worktrees for isolation.

Pattern from Zeroshot:
- Create worktree per agent
- Work in isolated directory
- Merge back after gates pass

YOUR TASK (P2-T01):
1. Create src/git/worktree-manager.ts:
   ```typescript
   class WorktreeManager {
     private worktrees: Map<string, WorktreeInfo>;

     async createWorktree(agentId: string, branchName: string): Promise<string> {
       const worktreePath = path.join(this.worktreeDir, agentId);
       await this.gitManager.execute(['worktree', 'add', worktreePath, '-b', branchName]);
       this.worktrees.set(agentId, { path: worktreePath, branch: branchName });
       return worktreePath;
     }

     async destroyWorktree(agentId: string): Promise<void> {
       const info = this.worktrees.get(agentId);
       if (info) {
         await this.gitManager.execute(['worktree', 'remove', info.path]);
         this.worktrees.delete(agentId);
       }
     }

     async mergeWorktree(agentId: string, targetBranch: string): Promise<MergeResult> {
       // Merge worktree branch into target
       // Return conflict info if any
     }
   }
   ```

2. Create src/core/parallel-executor.ts:
   ```typescript
   class ParallelExecutor {
     constructor(
       private worktreeManager: WorktreeManager,
       private executionEngine: ExecutionEngine,
       private maxConcurrency: number
     ) {}

     async executeParallel(subtasks: TierNode[]): Promise<ExecutionResult[]> {
       // Group by dependency level
       const levels = this.topologicalSort(subtasks);

       const results: ExecutionResult[] = [];
       for (const level of levels) {
         // Execute level in parallel (up to maxConcurrency)
         const levelResults = await this.executeLevel(level);
         results.push(...levelResults);
       }
       return results;
     }

     private async executeLevel(subtasks: TierNode[]): Promise<ExecutionResult[]> {
       const promises = subtasks.map(async (subtask) => {
         const agentId = `agent-${subtask.id}`;
         const worktreePath = await this.worktreeManager.createWorktree(
           agentId,
           `subtask-${subtask.id}`
         );

         try {
           // Execute in worktree
           const result = await this.executionEngine.spawnIteration({
             ...subtask,
             projectPath: worktreePath,
           });
           return result;
         } finally {
           // Cleanup on completion
           await this.worktreeManager.destroyWorktree(agentId);
         }
       });

       return Promise.all(promises);
     }
   }
   ```

3. Update src/core/orchestrator.ts:
   - Add parallel execution mode
   - Use ParallelExecutor when enabled

4. Add config:
   ```yaml
   execution:
     parallel:
       enabled: true
       maxConcurrency: 3
   ```

5. Add tests

CONSTRAINTS:
- Handle worktree creation failures gracefully
- Clean up worktrees on crash
- Handle merge conflicts as separate subtask

After implementation, run:
- npm run typecheck
- npm test -- src/git/worktree
- npm test -- src/core/parallel-executor

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P2-T02: Loop Guards

### Title
Implement deterministic loop guards

### Goal
Prevent infinite ping-pong loops in multi-agent scenarios.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T01, P2-T03, P2-T04

### Recommended model quality
Medium OK — guard logic

### Read first
- Codex-Weave loop guard implementation
- `ClaudesMajorImprovements.md` Pattern 2 (Loop Guards)

### Files to create/modify
- `src/core/loop-guard.ts` (new)
- `src/core/orchestrator.ts`

### Implementation notes
Pattern from Codex-Weave:
- Suppress reply relay (prevent A→B→A→B...)
- Track message hashes
- Block if same message seen 3+ times
- Use deterministic rules, not timeouts

### Acceptance criteria
- [ ] LoopGuard tracks message patterns
- [ ] Blocks repeated identical messages
- [ ] Suppresses reply relay
- [ ] Uses deterministic rules
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/loop-guard` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/core/loop-guard
```

### Evidence to record
- Loop guard blocking log

### Cursor Agent Prompt
```
Implement deterministic loop guards.

GOAL:
Prevent infinite loops in multi-agent scenarios.
Use deterministic rules, not timeouts.

Pattern from Codex-Weave:
- Suppress reply relay
- Track message hashes
- Block repeated patterns

YOUR TASK (P2-T02):
1. Create src/core/loop-guard.ts:
   ```typescript
   class LoopGuard {
     private messageHistory: Map<string, number>; // hash → count
     private readonly maxRepetitions = 3;

     shouldRelay(message: AgentMessage): boolean {
       // Rule 1: Never relay control/system messages
       if (message.kind === 'control' || message.kind === 'system') {
         return false;
       }

       // Rule 2: Suppress reply relay if configured
       if (this.config.suppressReplyRelay && message.kind === 'reply') {
         return false;
       }

       // Rule 3: Detect repeated patterns
       const hash = this.hashMessage(message);
       const count = this.messageHistory.get(hash) ?? 0;

       if (count >= this.maxRepetitions) {
         this.logger.warn(`Loop detected: message seen ${count} times, blocking`);
         return false;
       }

       this.messageHistory.set(hash, count + 1);
       return true;
     }

     private hashMessage(message: AgentMessage): string {
       // Hash relevant fields (not timestamp/id)
       return crypto.createHash('md5')
         .update(message.from + message.to + message.content)
         .digest('hex');
     }

     reset(): void {
       this.messageHistory.clear();
     }
   }
   ```

2. Update src/core/orchestrator.ts:
   - Inject LoopGuard
   - Check before relaying messages in multi-agent scenarios

3. Add config:
   ```yaml
   loopGuard:
     enabled: true
     maxRepetitions: 3
     suppressReplyRelay: true
   ```

4. Add tests

CONSTRAINTS:
- Don't block legitimate repeated operations
- Log all blocked messages for debugging
- Reset per iteration

After implementation, run:
- npm run typecheck
- npm test -- src/core/loop-guard

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P2-T03: SQLite Event Ledger

### Title
Add SQLite-based event ledger for crash recovery

### Goal
All orchestration events persisted to SQLite for recovery and audit.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T01, P2-T02, P2-T04

### Recommended model quality
Medium OK — database integration

### Read first
- Zeroshot SQLite ledger implementation
- `ClaudesMajorImprovements.md` Pattern 5

### Files to create/modify
- `src/state/event-ledger.ts` (new)
- `src/core/orchestrator.ts`

### Implementation notes
Pattern from Zeroshot:
- SQLite with WAL mode
- Immutable event log (append only)
- Query API for state inspection
- Resume from ledger state

### Acceptance criteria
- [ ] EventLedger appends events to SQLite
- [ ] WAL mode enabled for performance
- [ ] Query API works
- [ ] Recovery from ledger state works
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/state/event-ledger` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/state/event-ledger
```

### Evidence to record
- SQLite database contents

### Cursor Agent Prompt
```
Add SQLite-based event ledger for crash recovery.

GOAL:
Persist all orchestration events to SQLite for:
- Crash recovery
- Audit trail
- State inspection

Pattern from Zeroshot:
- SQLite with WAL mode
- Immutable event log
- Query API

YOUR TASK (P2-T03):
1. Create src/state/event-ledger.ts:
   ```typescript
   import Database from 'better-sqlite3';

   interface OrchestratorEvent {
     id: string;
     timestamp: string;
     type: string;
     tierId?: string;
     data: Record<string, unknown>;
   }

   class EventLedger {
     private db: Database.Database;

     constructor(dbPath: string) {
       this.db = new Database(dbPath);
       this.db.pragma('journal_mode = WAL');
       this.initSchema();
     }

     private initSchema(): void {
       this.db.exec(`
         CREATE TABLE IF NOT EXISTS events (
           id TEXT PRIMARY KEY,
           timestamp TEXT NOT NULL,
           type TEXT NOT NULL,
           tier_id TEXT,
           data TEXT NOT NULL
         );
         CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
         CREATE INDEX IF NOT EXISTS idx_events_tier ON events(tier_id);
       `);
     }

     append(event: OrchestratorEvent): void {
       const stmt = this.db.prepare(`
         INSERT INTO events (id, timestamp, type, tier_id, data)
         VALUES (?, ?, ?, ?, ?)
       `);
       stmt.run(event.id, event.timestamp, event.type, event.tierId, JSON.stringify(event.data));
     }

     query(filter: EventFilter): OrchestratorEvent[] {
       // Build query based on filter
     }

     getLastEvent(type: string): OrchestratorEvent | null {
       const stmt = this.db.prepare(`
         SELECT * FROM events WHERE type = ? ORDER BY timestamp DESC LIMIT 1
       `);
       const row = stmt.get(type);
       return row ? this.rowToEvent(row) : null;
     }

     recover(): OrchestrationState {
       // Replay events to rebuild state
     }
   }
   ```

2. Update src/core/orchestrator.ts:
   - Inject EventLedger
   - Append event for every state transition
   - Use ledger for crash recovery

3. Add CLI command:
   - `puppet-master ledger query --type=iteration_complete`
   - `puppet-master ledger replay` - Replay events

4. Add tests

CONSTRAINTS:
- Use better-sqlite3 for sync operations
- Keep events immutable (no updates)
- Include all relevant data for recovery

After implementation, run:
- npm run typecheck
- npm test -- src/state/event-ledger

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P2-T04: Executable Acceptance Criteria

### Title
Make acceptance criteria truly executable with verification scripts

### Goal
Every criterion has a concrete verification command.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T01, P2-T02, P2-T03

### Recommended model quality
Medium OK — script generation

### Read first
- Zeroshot acceptance criteria format
- `src/start-chain/prd-generator.ts`

### Files to create/modify
- `src/start-chain/criterion-to-script.ts` (new)
- `src/verification/script-verifier.ts` (new)

### Implementation notes
Pattern from Zeroshot:
```json
{
  "id": "AC1",
  "criterion": "Toggle dark mode → readable text (contrast >4.5:1)",
  "verification": "./verify-dark-mode.sh",
  "priority": "MUST"
}
```

Generate verification scripts for criteria that can't use built-in verifiers.

### Acceptance criteria
- [ ] Criteria have explicit verification field
- [ ] Scripts generated for complex criteria
- [ ] ScriptVerifier executes scripts
- [ ] Priority field supported (MUST/SHOULD/COULD)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/verification/script-verifier` passes

### Tests to run
```bash
npm run typecheck
npm test -- src/verification/script-verifier
```

### Evidence to record
- Generated verification script

### Cursor Agent Prompt
```
Make acceptance criteria truly executable with verification scripts.

GOAL:
Every criterion should have a concrete way to verify it.
Generate scripts for criteria that can't use built-in verifiers.

Pattern from Zeroshot:
```json
{
  "criterion": "Toggle dark mode → readable text",
  "verification": "./verify-dark-mode.sh"
}
```

YOUR TASK (P2-T04):
1. Create src/start-chain/criterion-to-script.ts:
   ```typescript
   class CriterionToScript {
     generateScript(criterion: Criterion): string | null {
       // If criterion can use built-in verifier, return null
       if (this.hasBuiltInVerifier(criterion)) {
         return null;
       }

       // Generate shell script for complex criteria
       const script = this.buildVerificationScript(criterion);
       return script;
     }

     private buildVerificationScript(criterion: Criterion): string {
       // Generate script that:
       // 1. Sets up test environment
       // 2. Executes verification
       // 3. Outputs PASS/FAIL
       return `#!/bin/bash
set -e
# Verification for: ${criterion.description}
# Auto-generated - modify as needed

# TODO: Implement verification
echo "PASS"
exit 0
`;
     }

     async saveScript(criterion: Criterion, projectPath: string): Promise<string> {
       const script = this.generateScript(criterion);
       if (!script) return '';

       const scriptPath = path.join(projectPath, '.puppet-master/scripts', `verify-${criterion.id}.sh`);
       await fs.writeFile(scriptPath, script);
       await fs.chmod(scriptPath, 0o755);

       return scriptPath;
     }
   }
   ```

2. Create src/verification/script-verifier.ts:
   ```typescript
   class ScriptVerifier implements Verifier {
     type = 'script';

     async verify(criterion: Criterion): Promise<VerificationResult> {
       const scriptPath = criterion.target;
       const { stdout, stderr, exitCode } = await this.executeScript(scriptPath);

       return {
         passed: exitCode === 0 && stdout.includes('PASS'),
         output: stdout,
         error: stderr,
       };
     }
   }
   ```

3. Update PRD types:
   - Add verification field to Criterion
   - Add priority field (MUST/SHOULD/COULD)

4. Add tests

CONSTRAINTS:
- Scripts should be human-editable
- Include helpful comments
- Make scripts cross-platform where possible

After implementation, run:
- npm run typecheck
- npm test -- src/verification/script-verifier

When complete, update this task's Status Log with PASS/FAIL, commands run + results, files changed.
```

### Task status log
```
Status: PENDING
```

---

## P2-T05: Complexity-Based Model Routing

### Title
Auto-select model based on task complexity

### Goal
Route trivial tasks to cheap models, critical tasks to capable models.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T06, P2-T07, P2-T08

### Recommended model quality
Medium OK — classification logic

### Read first
- Zeroshot complexity classification
- `ClaudesMajorImprovements.md` Recommendation #5

### Files to create/modify
- `src/core/complexity-classifier.ts` (new)
- `src/core/platform-router.ts`

### Implementation notes
2D classification from Zeroshot:
- Complexity: TRIVIAL, SIMPLE, STANDARD, CRITICAL
- TaskType: feature, bugfix, refactor, test
- Matrix maps to model level (level1=cheap, level3=capable)

### Acceptance criteria
- [ ] ComplexityClassifier analyzes subtasks
- [ ] Model selected based on complexity × taskType
- [ ] Config maps complexity to model level
- [ ] Override available per subtask
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/complexity-classifier` passes

### Cursor Agent Prompt
```
Auto-select model based on task complexity.

Pattern from Zeroshot:
- Classify complexity: TRIVIAL, SIMPLE, STANDARD, CRITICAL
- Classify task type: feature, bugfix, refactor, test
- 2D matrix → model level

YOUR TASK (P2-T05):
1. Create src/core/complexity-classifier.ts:
   ```typescript
   type Complexity = 'trivial' | 'simple' | 'standard' | 'critical';
   type TaskType = 'feature' | 'bugfix' | 'refactor' | 'test' | 'docs';

   class ComplexityClassifier {
     classify(subtask: TierNode): { complexity: Complexity; taskType: TaskType } {
       // Analyze subtask description and criteria
       const complexity = this.classifyComplexity(subtask);
       const taskType = this.classifyTaskType(subtask);
       return { complexity, taskType };
     }

     private classifyComplexity(subtask: TierNode): Complexity {
       const criteria = subtask.data.acceptanceCriteria;
       const filesCount = subtask.data.files?.length ?? 0;

       if (criteria.length <= 2 && filesCount <= 1) return 'trivial';
       if (criteria.length <= 5 && filesCount <= 3) return 'simple';
       if (criteria.length <= 10) return 'standard';
       return 'critical';
     }

     getModelLevel(complexity: Complexity, taskType: TaskType): 'level1' | 'level2' | 'level3' {
       const matrix = {
         trivial: { feature: 'level1', bugfix: 'level1', refactor: 'level1', test: 'level1', docs: 'level1' },
         simple: { feature: 'level1', bugfix: 'level2', refactor: 'level1', test: 'level1', docs: 'level1' },
         standard: { feature: 'level2', bugfix: 'level2', refactor: 'level2', test: 'level2', docs: 'level1' },
         critical: { feature: 'level3', bugfix: 'level3', refactor: 'level3', test: 'level2', docs: 'level2' },
       };
       return matrix[complexity][taskType];
     }
   }
   ```

2. Add config for model levels:
   ```yaml
   models:
     level1:  # Cheap/fast
       platform: claude
       model: haiku
     level2:  # Balanced
       platform: claude
       model: sonnet
     level3:  # Capable
       platform: claude
       model: opus
   ```

3. Integrate with PlatformRouter

4. Add tests

After implementation, run tests.
```

### Task status log
```
Status: PENDING
```

---

## P2-T06: Circuit Breaker for Platform Calls

### Title
Add circuit breaker pattern for fault tolerance

### Goal
Prevent cascading failures when platform is unhealthy.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T05, P2-T07, P2-T08

### Recommended model quality
Medium OK — pattern implementation

### Read first
- ralph-claude-code circuit breaker
- `ClaudesMajorImprovements.md` Issue #3 recommendations

### Files to create/modify
- `src/platforms/circuit-breaker.ts` (new)
- `src/platforms/base-runner.ts`

### Acceptance criteria
- [ ] CircuitBreaker tracks failure count
- [ ] Opens after threshold failures
- [ ] Half-open after cooldown
- [ ] Closes on success in half-open
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms/circuit-breaker` passes

### Cursor Agent Prompt
```
Add circuit breaker pattern for platform calls.

Pattern from ralph-claude-code:
- CLOSED: Normal operation
- OPEN: All calls fail fast
- HALF_OPEN: Test calls after cooldown

YOUR TASK (P2-T06):
1. Create src/platforms/circuit-breaker.ts:
   ```typescript
   class CircuitBreaker {
     private state: 'CLOSED' | 'HALF_OPEN' | 'OPEN' = 'CLOSED';
     private failures = 0;
     private lastFailure = 0;
     private halfOpenSuccesses = 0;

     constructor(
       private failureThreshold: number = 3,
       private cooldownMs: number = 60000,
       private halfOpenSuccessThreshold: number = 2
     ) {}

     async execute<T>(fn: () => Promise<T>): Promise<T> {
       this.checkState();

       try {
         const result = await fn();
         this.onSuccess();
         return result;
       } catch (error) {
         this.onFailure();
         throw error;
       }
     }

     private checkState(): void {
       if (this.state === 'OPEN') {
         if (Date.now() - this.lastFailure > this.cooldownMs) {
           this.state = 'HALF_OPEN';
           this.logger.info('Circuit half-open, testing');
         } else {
           throw new CircuitBreakerOpenError();
         }
       }
     }

     private onSuccess(): void {
       if (this.state === 'HALF_OPEN') {
         this.halfOpenSuccesses++;
         if (this.halfOpenSuccesses >= this.halfOpenSuccessThreshold) {
           this.state = 'CLOSED';
           this.failures = 0;
           this.logger.info('Circuit closed');
         }
       }
     }

     private onFailure(): void {
       this.failures++;
       this.lastFailure = Date.now();
       if (this.failures >= this.failureThreshold) {
         this.state = 'OPEN';
         this.logger.warn('Circuit opened');
       }
     }
   }
   ```

2. Integrate with base-runner.ts

3. Add per-platform circuit breakers

4. Add tests

After implementation, run tests.
```

### Task status log
```
Status: PENDING
```

---

## P2-T07: Platform Health Monitoring

### Title
Add periodic health checks for platforms

### Goal
Detect unhealthy platforms before executing critical tasks.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T05, P2-T06, P2-T08

### Recommended model quality
Low OK — monitoring logic

### Read first
- `src/platforms/base-runner.ts`
- `ClaudesMajorImprovements.md` Issue #3 recommendations

### Files to create/modify
- `src/platforms/health-monitor.ts` (new)
- `src/core/orchestrator.ts`

### Acceptance criteria
- [ ] HealthMonitor checks platforms periodically
- [ ] Health status tracked per platform
- [ ] Unhealthy platforms avoided in routing
- [ ] Health dashboard in GUI
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/platforms/health-monitor` passes

### Cursor Agent Prompt
```
Add periodic health checks for platforms.

YOUR TASK (P2-T07):
1. Create src/platforms/health-monitor.ts:
   ```typescript
   interface HealthStatus {
     platform: Platform;
     status: 'healthy' | 'degraded' | 'unhealthy';
     latencyMs: number;
     lastCheck: Date;
     consecutiveFailures: number;
   }

   class HealthMonitor {
     private health: Map<Platform, HealthStatus>;
     private checkIntervalMs = 30000;

     async startMonitoring(platforms: Platform[]): Promise<void> {
       for (const platform of platforms) {
         this.scheduleCheck(platform);
       }
     }

     private async checkHealth(platform: Platform): Promise<HealthStatus> {
       const runner = this.registry.get(platform);
       const start = Date.now();

       try {
         await runner.healthCheck(); // Simple echo or version check
         return {
           platform,
           status: 'healthy',
           latencyMs: Date.now() - start,
           lastCheck: new Date(),
           consecutiveFailures: 0,
         };
       } catch (error) {
         const prev = this.health.get(platform);
         const failures = (prev?.consecutiveFailures ?? 0) + 1;
         return {
           platform,
           status: failures >= 3 ? 'unhealthy' : 'degraded',
           latencyMs: Date.now() - start,
           lastCheck: new Date(),
           consecutiveFailures: failures,
         };
       }
     }

     getHealth(platform: Platform): HealthStatus | undefined {
       return this.health.get(platform);
     }

     isHealthy(platform: Platform): boolean {
       const status = this.health.get(platform);
       return status?.status === 'healthy';
     }
   }
   ```

2. Add healthCheck() to platform runners

3. Integrate with orchestrator

4. Add GUI health dashboard

5. Add tests

After implementation, run tests.
```

### Task status log
```
Status: PENDING
```

---

## P2-T08: Comprehensive Metrics Collection

### Title
Add metrics for tokens, costs, success rates

### Goal
Track and report operational metrics for optimization.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T05, P2-T06, P2-T07

### Recommended model quality
Medium OK — metrics aggregation

### Read first
- `src/budget/usage-tracker.ts`
- `ClaudesMajorImprovements.md` Issue #10

### Files to create/modify
- `src/metrics/metrics-collector.ts` (new)
- `src/metrics/metrics-reporter.ts` (new)
- `src/core/orchestrator.ts`

### Acceptance criteria
- [ ] Metrics collected for all operations
- [ ] Token usage tracked per platform
- [ ] Cost estimates calculated
- [ ] Success/failure rates computed
- [ ] Metrics exportable (JSON, CSV)
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/metrics` passes

### Cursor Agent Prompt
```
Add comprehensive metrics collection.

YOUR TASK (P2-T08):
1. Create src/metrics/metrics-collector.ts:
   ```typescript
   interface OrchestratorMetrics {
     // Iteration metrics
     totalIterations: number;
     successfulIterations: number;
     failedIterations: number;
     averageIterationDurationMs: number;

     // Platform metrics
     platformMetrics: Map<Platform, {
       calls: number;
       tokensUsed: number;
       estimatedCostUSD: number;
       averageLatencyMs: number;
       errorRate: number;
     }>;

     // Quality metrics
     firstPassSuccessRate: number;
     averageRevisionsPerSubtask: number;
     escalationRate: number;

     // Time metrics
     totalDurationMs: number;
   }

   class MetricsCollector {
     recordIteration(result: IterationResult): void { ... }
     recordPlatformCall(platform: Platform, usage: TokenUsage): void { ... }
     generateReport(): MetricsReport { ... }
   }
   ```

2. Create src/metrics/metrics-reporter.ts for output formatting

3. Integrate with orchestrator and platform runners

4. Add CLI: `puppet-master metrics [--format json|csv]`

5. Add GUI metrics dashboard

6. Add tests

After implementation, run tests.
```

### Task status log
```
Status: PENDING
```

---

## P2-T09: Configurable Escalation Chain

### Title
Implement configurable escalation with multiple fallbacks

### Goal
Flexible escalation policies for different failure types.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T10, P2-T11, P2-T12

### Recommended model quality
Medium OK — config-driven logic

### Read first
- `src/core/escalation.ts`
- `ClaudesMajorImprovements.md` Issue #8

### Files to create/modify
- `src/core/escalation-chain.ts` (new)
- `src/core/escalation.ts`
- `src/types/config.ts`

### Acceptance criteria
- [ ] Escalation chain configurable in YAML
- [ ] Multiple fallback levels
- [ ] Different policies per failure type
- [ ] Supports pause, retry, escalate, notify
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/core/escalation` passes

### Cursor Agent Prompt
```
Implement configurable escalation chain.

YOUR TASK (P2-T09):
1. Add escalation config:
   ```yaml
   escalation:
     chains:
       test_failure:
         - action: retry
           maxAttempts: 2
         - action: self_fix
           maxAttempts: 1
         - action: escalate
           to: task
       timeout:
         - action: retry
           maxAttempts: 1
         - action: pause
           notify: true
       structural:
         - action: escalate
           to: phase
           notify: true
   ```

2. Create src/core/escalation-chain.ts to process chains

3. Update escalation.ts to use chains

4. Add tests

After implementation, run tests.
```

### Task status log
```
Status: PENDING
```

---

## P2-T10: SSE Streaming for Real-Time GUI

### Title
Add Server-Sent Events for live GUI updates

### Goal
Real-time streaming to GUI without polling.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T09, P2-T11, P2-T12

### Recommended model quality
Medium OK — SSE implementation

### Read first
- Codex-Weave SSE implementation
- `src/gui/server.ts`

### Files to create/modify
- `src/gui/routes/events.ts` (new)
- `src/gui/public/js/event-stream.js` (new)

### Acceptance criteria
- [ ] SSE endpoint at /api/events/stream
- [ ] All orchestrator events streamed
- [ ] Auto-reconnect on disconnect
- [ ] Works across all GUI pages
- [ ] `npm run typecheck` passes
- [ ] GUI updates in real-time

### Cursor Agent Prompt
```
Add SSE streaming for real-time GUI updates.

Pattern from Codex-Weave:
- GET /api/events/stream returns text/event-stream
- Events include: state_changed, iteration_*, output_*

YOUR TASK (P2-T10):
1. Create src/gui/routes/events.ts:
   ```typescript
   router.get('/stream', (req, res) => {
     res.setHeader('Content-Type', 'text/event-stream');
     res.setHeader('Cache-Control', 'no-cache');
     res.setHeader('Connection', 'keep-alive');

     const listener = (event: PuppetMasterEvent) => {
       res.write(`event: ${event.type}\n`);
       res.write(`data: ${JSON.stringify(event.data)}\n\n`);
     };

     eventBus.on('*', listener);
     req.on('close', () => eventBus.off('*', listener));
   });
   ```

2. Create src/gui/public/js/event-stream.js for client

3. Update GUI pages to use SSE instead of polling

4. Add automated tests:
   - Verify `Content-Type: text/event-stream` and streaming format
   - Emit a sample event and assert client receives it
   - Unit-test reconnect logic in event-stream.js

After implementation, run:
- npm run typecheck
- npm test -- src/gui
```

### Task status log
```
Status: PENDING
```

---

## P2-T11: Real Installers

### Title
Create platform-specific installers

### Goal
Users can install with one click, no Node required.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T09, P2-T10, P2-T12

### Recommended model quality
Medium OK — build configuration

### Read first
- `CodexsMajorImprovements.md` P0.5
- electron-builder or pkg documentation

### Files to create/modify
- `scripts/build-installer.ts` (new)
- `package.json` (add build scripts)
- `electron-builder.yml` or equivalent (new)

### Acceptance criteria
- [ ] Windows .exe installer created
- [ ] macOS .dmg installer created
- [ ] Linux .deb/.rpm installer created
- [ ] Installers include bundled Node
- [ ] CLI available after install
- [ ] Works without prior Node installation

### Cursor Agent Prompt
```
Create platform-specific installers.

RECOMMENDED APPROACH:
Use embedded Node runtime + app directory (not true single-binary).
This works better with ESM, GUI assets, and Playwright.

YOUR TASK (P2-T11):
1. Choose packaging tool:
   - Option A: electron-builder (if adding Electron shell)
   - Option B: pkg (for CLI-only)
   - Option C: Custom installer scripts

2. Create build configuration:
   - Bundle Node runtime
   - Bundle all dependencies
   - Create platform-specific packages

3. Add build scripts to package.json:
   ```json
   {
     "scripts": {
       "build:win": "...",
       "build:mac": "...",
       "build:linux": "...",
       "build:all": "..."
     }
   }
   ```

4. Add CI workflow for automated builds

5. Add automated installer smoke tests (CI matrix: Windows/macOS/Linux):
   - Install the produced artifact
   - Verify `puppet-master --version` runs
   - Verify `puppet-master doctor` runs (non-interactive) and reports usable environment

After implementation, run:
- npm run typecheck
- npm test
- npm run build
- npm run build:all (or platform-specific build script)
```

### Task status log
```
Status: PENDING
```

---

## P2-T12: Secrets Management

### Title
Add secure secrets handling

### Goal
API keys and secrets handled securely, not in repo.

### Depends on
- P1 Complete

### Parallelizable with
- P2-T09, P2-T10, P2-T11

### Recommended model quality
Medium OK — security implementation

### Read first
- `CodexsMajorImprovements.md` P0.9
- Current config loading code

### Files to create/modify
- `src/config/secrets-manager.ts` (new)
- `src/config/config-manager.ts`
- `src/doctor/checks/secrets-check.ts` (new)

### Acceptance criteria
- [ ] Secrets loaded from env vars
- [ ] Support for .env files (local only)
- [ ] Doctor check warns about secrets in repo
- [ ] GUI masks secret values
- [ ] `npm run typecheck` passes
- [ ] `npm test -- src/config/secrets` passes

### Cursor Agent Prompt
```
Add secure secrets handling.

GOAL:
- API keys never in tracked files
- Load from env vars or .env (gitignored)
- Doctor warns if secrets detected in repo

YOUR TASK (P2-T12):
1. Create src/config/secrets-manager.ts:
   ```typescript
   class SecretsManager {
     private secrets: Map<string, string>;

     loadSecrets(): void {
       // Load from env vars
       this.secrets.set('ANTHROPIC_API_KEY', process.env.ANTHROPIC_API_KEY ?? '');
       this.secrets.set('OPENAI_API_KEY', process.env.OPENAI_API_KEY ?? '');

       // Load from .env if exists
       if (fs.existsSync('.env')) {
         dotenv.config();
       }
     }

     getSecret(key: string): string {
       const value = this.secrets.get(key);
       if (!value) {
         throw new SecretNotFoundError(key);
       }
       return value;
     }

     maskSecret(value: string): string {
       if (value.length <= 8) return '***';
       return value.slice(0, 4) + '...' + value.slice(-4);
     }
   }
   ```

2. Create src/doctor/checks/secrets-check.ts:
   - Scan repo for common secret patterns
   - Check .gitignore includes .env
   - Warn if secrets found in tracked files

3. Update config loader to use SecretsManager

4. Update GUI to mask secrets

5. Add tests

After implementation, run tests.
```

### Task status log
```
Status: PENDING
```

---

## CLI Updates Summary

The following CLI commands need updates based on improvements:

| Command | Updates Needed | Task(s) |
|---------|---------------|---------|
| `puppet-master init` | Create valid PRD scaffold, don't clobber existing files | P0-T10 |
| `puppet-master plan` | Requirements interview, platform selection, coverage threshold | P1-T01, P1-T02, P1-T04, P1-T14 |
| `puppet-master start` | Honor `--prd` + model selection; coordinator/daemon mode; keep-alive option; parallel execution | P0-T17, P0-T21, NF-T01, P2-T01, P1-T08 |
| `puppet-master pause` | Reliable pause + checkpoint creation | P0-T20, P0-T21 |
| `puppet-master resume` | Reliable resume from checkpoint | P0-T20, P1-T15 |
| `puppet-master stop` | Reliable stop/kill (terminates runner children) | P0-T21 |
| `puppet-master doctor` | Auth-aware platform readiness + Playwright check + secrets scan | P0-T15, P0-T19, P2-T12 |
| `puppet-master status` | Show coverage metrics, checkpoint info, budget usage | P1-T02, P1-T12, P1-T16 |
| `puppet-master checkpoints` | List/delete/info checkpoints | P0-T20, P1-T15 |
| `puppet-master metrics` | New command - show operational metrics | P2-T08 |
| `puppet-master ledger` | New command - query event ledger | P2-T03 |

### CLI Flags Reference

```bash
# Plan command new flags
puppet-master plan requirements.md \
  --prd-platform claude \
  --arch-platform codex \
  --skip-interview \
  --coverage-threshold 80 \
  --dry-run

# Start command new flags
puppet-master start \
  --prd .puppet-master/prd.json \
  --keep-alive-on-failure \
  --parallel \
  --max-concurrency 3

# Resume command
puppet-master resume checkpoint-1705123456789
puppet-master resume --latest

# Checkpoints command
puppet-master checkpoints list
puppet-master checkpoints info checkpoint-1705123456789
puppet-master checkpoints delete checkpoint-1705123456789

# Metrics command
puppet-master metrics --format json
puppet-master metrics --format csv > metrics.csv

# Ledger command
puppet-master ledger query --type iteration_complete --limit 10
puppet-master ledger replay --from checkpoint-1705123456789
```

---

## GUI Updates Summary

The following GUI pages need updates:

| Page | Updates Needed | Task(s) |
|------|---------------|---------|
| **Wizard** | Wire to real Start Chain, stream progress, show coverage | P0-T06, P1-T02 |
| **Dashboard** | Fix WebSocket events, add SSE streaming | P0-T05, P2-T10 |
| **Tiers** | Fix WebSocket events, show parallel execution | P0-T05, P2-T01 |
| **Controls** | Reliable start/pause/resume/stop via coordinator | P0-T20, P0-T21 |
| **Settings** | Add agent termination toggle, Start Chain config, rate limits | NF-T01, P1-T04, P1-T17 |
| **Projects** | Fix project switching | P0-T06 (related) |
| **Coverage** | New page - show requirements coverage report | P1-T18 |
| **Metrics** | New page - show operational metrics dashboard | P2-T08 |
| **Health** | New section - show platform health status | P2-T07 |

### GUI New Features Summary

1. **Real-Time Updates**: SSE streaming replaces polling (P2-T10)
2. **Coverage Report**: Visual coverage gauge and requirement mapping (P1-T18)
3. **Settings Expansion**:
   - Agent termination toggle (NF-T01)
   - Start Chain platform selection per step (P1-T04)
   - Rate limit configuration (P1-T07)
   - Worker/Reviewer platform configuration (P1-T13)
4. **Metrics Dashboard**: Token usage, costs, success rates (P2-T08)
5. **Health Status**: Platform health indicators (P2-T07)

---

## Phase Completion Checklist

### P0 Complete Checklist (22 tasks)
- [ ] P0-T01: Schema alignment complete (types match across system)
- [ ] P0-T02: Start Chain H1 bug fixed (H2 sections become phases)
- [ ] P0-T03: No manual criteria in generated PRDs (all verifiable)
- [ ] P0-T04: All verifiers registered, evidence IDs fixed
- [ ] P0-T05: WebSocket events working (backend matches frontend)
- [ ] P0-T06: Wizard runs real Start Chain pipeline
- [ ] P0-T07: Prompts include acceptance criteria and tests
- [ ] P0-T08: Transcript capture reliable (no stall)
- [ ] P0-T09: File changes detected via git diff
- [ ] P0-T10: Init creates valid PRD scaffold
- [ ] P0-T11: Git infrastructure wired (BranchStrategy, CommitFormatter, PRManager)
- [ ] P0-T12: Platform timeouts enforced
- [ ] P0-T13: Claude prompt size handled (file-based for large)
- [ ] P0-T14: Codex non-interactive (full-auto mode)
- [ ] P0-T15: Cursor command consistent across codebase
- [ ] P0-T16: Orchestrator drives tier state machines + runs subtask gates
- [ ] P0-T17: CLI flags/config honored (PRD path + model selection)
- [ ] P0-T18: Canonical ProjectRoot path resolution (no implicit CWD)
- [ ] P0-T19: Doctor + capability discovery are auth-aware and config-driven
- [ ] P0-T20: Pause/resume + checkpoints are actually restorable
- [ ] P0-T21: Coordination layer (daemon + process registry) for reliable stop/pause/kill
- [ ] P0-T22: AGENTS.md enforcement wired into gate execution

**P0 Verification Commands:**
```bash
npm run typecheck
npm run build
npm test
puppet-master init --force
puppet-master plan test-requirements.md
puppet-master doctor
```

### P1 Complete Checklist (21 tasks)
- [ ] P1-T01: Requirements interview step added
- [ ] P1-T02: Coverage validation implemented
- [ ] P1-T03: Traceability links (sourceRefs) in PRD
- [ ] P1-T04: Start Chain platform selection per step
- [ ] P1-T05: Multi-pass PRD generation for large docs
- [ ] P1-T06: Test plans auto-generated per project type
- [ ] P1-T07: Rate limiting and quota enforcement
- [ ] P1-T08: Per-tier platform routing
- [ ] P1-T09: FreshSpawner integrated with runners
- [ ] P1-T10: Platform-specific output parsers
- [ ] P1-T11: Atomic state persistence with recovery
- [ ] P1-T12: Checkpointing for long runs
- [ ] P1-T13: Worker/Reviewer separation
- [ ] P1-T14: CLI plan command updated
- [ ] P1-T15: CLI resume command added
- [ ] P1-T16: CLI status command enhanced
- [ ] P1-T17: GUI settings page improvements
- [ ] P1-T18: GUI coverage report view
- [ ] P1-T19: Architecture generation context is non-lossy and validated
- [ ] P1-T20: Requirements inventory (atomic `REQ-*` units) extracted + persisted
- [ ] P1-T21: PRD quality validator blocks low-quality PRDs (with repair hints)

**P1 Verification Commands:**
```bash
npm run typecheck
npm test
puppet-master plan large-requirements.md --coverage-threshold 80
puppet-master checkpoints list
puppet-master status --json
```

### P2 Complete Checklist (12 tasks)
- [ ] P2-T01: Parallel execution with git worktrees
- [ ] P2-T02: Loop guards (deterministic)
- [ ] P2-T03: SQLite event ledger
- [ ] P2-T04: Executable acceptance criteria
- [ ] P2-T05: Complexity-based model routing
- [ ] P2-T06: Circuit breaker for platforms
- [ ] P2-T07: Platform health monitoring
- [ ] P2-T08: Comprehensive metrics collection
- [ ] P2-T09: Configurable escalation chain
- [ ] P2-T10: SSE streaming for GUI
- [ ] P2-T11: Real installers (exe/dmg/deb)
- [ ] P2-T12: Secrets management

**P2 Verification Commands:**
```bash
npm run typecheck
npm test
puppet-master start --parallel --max-concurrency 3
puppet-master metrics --format json
puppet-master ledger query --type iteration_complete
```

### New Feature Checklist (1 task)
- [ ] NF-T01: Agent termination option (kill vs keep alive)
  - Default: kill on failure
  - Option in settings to keep alive
  - CLI flag: `--keep-alive-on-failure`

---

## Execution Order Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     P0 CRITICAL (22 tasks)                   │
├─────────────────────────────────────────────────────────────┤
│  P0-T01 (Schema)                                            │
│      │                                                       │
│      ├──► P0-T02 (H1 Bug) ──► P0-T07 (Prompts) ──┐          │
│      │                                            │          │
│      ├──► P0-T03 (No Manual)                      │          │
│      │                                            │          │
│      ├──► P0-T04 (Verifiers)                      │          │
│      │                                            ▼          │
│      ├──► P0-T05 (WebSocket) ──┐              P0-T08-T10    │
│      │                          │             (parallel)     │
│      └──► P0-T06 (Wizard) ─────┴──► P0-T11 (Git) ──┐        │
│                                                     │        │
│                                                     ▼        │
│                                              P0-T12-T15      │
│                                              (parallel)       │
│                         + P0-T16-T22 (see P0 table)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     P1 HIGH (21 tasks)                       │
│                  + NF-T01 (parallel with P1)                 │
├─────────────────────────────────────────────────────────────┤
│  P1-T01-T03-T20 (parallel) ──► P1-T04 ──► P1-T06-T19 (parallel) ──► P1-T21 ──► P1-T05 │
│                                                              │
│  P1-T07 ──► P1-T08-T10 (parallel)                           │
│                                                              │
│  P1-T11 ──► P1-T12-T13 (parallel)                           │
│                                                              │
│  P1-T14-T18 (parallel with above)                           │
│                                                              │
│  NF-T01 (Agent Termination) ──► can run anytime during P1   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    P2 MEDIUM (12 tasks)                      │
├─────────────────────────────────────────────────────────────┤
│  All P2 tasks can run in parallel after P1 complete         │
│  P2-T01-T04 (parallel)                                      │
│  P2-T05-T08 (parallel)                                      │
│  P2-T09-T12 (parallel)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Commit Convention

After completing each task:
```bash
git add .
git commit -m "ralph: ${TASK_ID} ${short_description}

${detailed_changes}

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

**Example commits:**
```bash
git commit -m "ralph: P0-T01 schema alignment - unify criterion types

- Updated src/types/tiers.ts with canonical criterion types
- Aligned prd-prompt.ts schema with runtime types
- Registered all verifiers in container.ts
- Removed 'manual' type (violates no-manual-tests requirement)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"

git commit -m "ralph: P0-T02 fix H1 title bug in start chain

- Added structure-detector.ts for document analysis
- Updated prd-generator to treat H2s as phases when single H1
- Added coverage heuristics and fail-fast checks
- Added tests for various document structures

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task Template

For creating additional tasks, use this template:

```markdown
## PX-TXX: Task Title

### Title
Short descriptive title

### Goal
What this task accomplishes

### Depends on
- List of prerequisite tasks

### Parallelizable with
- Tasks that can run at same time

### Recommended model quality
HQ required / Medium OK / Low OK

### Read first
- Files to understand before implementing

### Files to create/modify
- Specific files affected

### Implementation notes
Key technical details

### Acceptance criteria
- [ ] Specific, testable criteria

### Tests to run
\`\`\`bash
npm run typecheck
npm test -- relevant-tests
\`\`\`

### Evidence to record
- What to save for verification

### Cursor Agent Prompt
\`\`\`
Full prompt for AI agent
\`\`\`

### Task status log
\`\`\`
Status: PENDING
Date:
Summary of changes:
Files changed:
Commands run + results:
If FAIL - where stuck + exact error snippets + what remains:
\`\`\`
```

---

## Total Task Count Summary

| Priority | Tasks | Est. Effort |
|----------|-------|-------------|
| P0 Critical | 22 | High |
| P1 High | 21 | Medium-High |
| P2 Medium | 12 | Medium |
| New Feature | 1 | Low |
| **Total** | **56** | - |

**Recommended approach:**
1. Complete all P0 tasks first (system won't work without these)
2. Complete P1 tasks for production readiness
3. P2 tasks for scale and quality of life
4. New features can be interleaved as needed

---

*End of BUILD_QUEUE_IMPROVEMENTS.md*

*Document generated: 2026-01-20*
*Based on: ClaudesMajorImprovements.md, CodexsMajorImprovements.md*
*Reference implementations: Zeroshot, Codex-Weave, ralph-main, ralph-claude-code*
