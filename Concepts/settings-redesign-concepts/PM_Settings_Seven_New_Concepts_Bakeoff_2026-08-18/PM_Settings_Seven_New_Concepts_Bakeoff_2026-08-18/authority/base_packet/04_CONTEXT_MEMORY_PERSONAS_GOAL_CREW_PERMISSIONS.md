# Context, Memory, Personas, Goal, Crew, BSD, and Permissions

## Context & Instructions manager

Normal controls may include:

```text
Use relevant previous chats
Use relevant project code
Use relevant logs
Include scoped project instructions
Include parent-agent summary
Include current attempt journal
Compact automatically when needed
Warn before material model/context switches
```

Advanced/diagnostic detail shows:

```text
Effective instruction sources
AGENTS.md precedence chain
Source hashes and lightness warnings
Last request included/omitted blocks
Persona footprint
Selected versus installed tools
Compaction strategy
Cache compatibility
Retrieval caps
Context admission receipt
```

Do not inject the registry into prompts merely because Settings exposes it.

## Memory manager

Preserve PM's evidence-backed degrading Assistant Gists:

- half-life changes retrieval activation, not truth or deletion;
- verified/unverified state and provenance;
- Assistant-only hidden memory;
- search, scope/source filters, verify, edit, pin, delete;
- version history and restore;
- half-life and active-context status;
- capsule preview/token estimate;
- rebuild, dedupe, summarize, archive, redact.

Automated systems use explicit thread/ledger/Goal/artifact retrieval, not hidden Assistant Gists.

## Persona manager

Show:

```text
Core and custom Personas
Mission and use boundary
Model-facing capsule preview
Source/version/provenance
Eligible skills
Requested capabilities/preferences
Thread/project/global defaults
Import diff/trust/secret/prompt-injection scan
```

Persona is behavior, not authority. It cannot grant Full Access, widen FileSafe, force a provider, or eagerly load all skills.

Correct stale `ask/plan/regular/yolo` coupling. Conversation mode and access profile are separate.

## Goal and automation settings

Settings owns defaults and ceilings, not live run state:

```text
Goal defaults
Pause/resume/checkpoint policy
Verification strength
Sustainable fan-out preferences
Capacity reserve
High-quality planning route
Worker/reviewer route classes
Cross-project policy
Worktree policy
Testing/debug defaults
```

Usage reports current capacity. Orchestrator admits actual work.

## Crew manager

A Crew template configures:

```text
Purpose
Member roles
Persona/capability requirements
Allowed provider/account/model candidates
Minimum/maximum members
Adaptive sizing and waves
Usage/cost/time reserve
Write/worktree policy
Board topology
Diversity/corroboration
Reducer/synthesis
Failure/stop behavior
```

Crew is not a Persona, mode, provider, permission grant, or hidden memory.

## Back Seat Driver

System default:

```text
Off
Auto — default
On
```

Advanced configuration may expose route, risk/phase triggers, usage guard, latency budget, privacy boundary, tool access, and health.

Auto runs only when risk/phase triggers justify it. On may inspect all turns. BSD is read-only by default, receives bounded deltas, cannot widen authority, and cannot block primary work merely because it failed.

Chat may override BSD for one turn or current thread.

## Permissions and FileSafe manager

Required features:

```text
Global wildcard default
Per-tool overrides
Ordered granular rules
Last-match-wins explanation
Reorder
Wildcard help
Presets
Read-only/full matrices
External-directory allowlist
Doom-loop threshold/action
Per-Persona profiles
Global/Project/Package/Seam/Lane scope
Requested/effective/origin
ELI5 and Expert views
```

FileSafe remains the non-bypassable floor. The manager exposes health, effective boundary, protected scopes, and repair guidance without encouraging unsafe bypass.

## Access profiles

Canonical user-facing access choices:

```text
Ask for approval
Auto accept edits
Auto
Full Access
```

Plan and Review are effect-limited, not tool-free. They can use safe read, browser, research, testing, and diagnostic operations.
