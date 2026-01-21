## P0-T07 Evidence: Sample Iteration Prompt

This file records a sample iteration prompt **showing all required sections** after unifying `ExecutionEngine` to use `PromptBuilder.buildIterationPrompt()`.

Note: writing new files under `.puppet-master/` was blocked (tool returned “Aborted”), so this evidence is stored at repo root.

---

### Sample prompt (first attempt)

```text
# Iteration Prompt for ST-001-001-001

## Context

You are working on project: Test Project

**Current Item:**
- ID: ST-001-001-001
- Title: Sample subtask
- Parent Task: TK-001-001 - Sample task
- Parent Phase: PH-001 - Sample phase

**Session ID:** PM-2026-01-10-14-00-00-001
**Platform:** codex
**Iteration:** 1 of 3

## Memory (Loaded Context)

### Recent Progress (from progress.txt)
None.

### Long-Term Knowledge (from AGENTS.md)
None.

### Module-Specific Knowledge (if applicable)
None.

## Your Assignment

Do the thing

**Approach:**
- Step 1
- Step 2

## Acceptance Criteria

You MUST satisfy ALL of these:

- [ ] ST-001-001-001-AC-001: Meets the acceptance requirement

## Test Requirements

After implementation, these must pass:

- `(cd . && npm test)`

## Important Rules

1. ONLY work on the current subtask scope
2. Do NOT modify files outside the specified scope
3. Run tests after making changes
4. If you encounter a gotcha or pattern worth remembering, note it clearly
5. Signal completion with: `<ralph>COMPLETE</ralph>`
6. If stuck, signal: `<ralph>GUTTER</ralph>`

## Previous Iteration Failures (if any)

None.

## Begin
```

---

### Sample prompt (second attempt with previous failure)

```text
## Previous Iteration Failures (if any)

- Iteration 1:
  - Error: Agent signaled GUTTER
```

