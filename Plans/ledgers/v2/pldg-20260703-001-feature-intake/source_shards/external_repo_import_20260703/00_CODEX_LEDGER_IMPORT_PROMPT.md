# Codex Prompt — Import External Repo Findings Into New Puppet Master Ledger

You are importing an external-repo research packet into a new Puppet Master ledger.

## Inputs to read

Read every attached file, especially:

1. `00_CODEX_LEDGER_IMPORT_PROMPT.md` — this instruction file.
2. `01_FULL_SOURCE_PACKET.md` — full narrative reports from every pass, including raw report text and source boundaries.
3. `02_LEDGER_READY_ATOMS.jsonl` — normalized ledger-ready backlog/design-atom rows. Every row must be represented in the ledger or explicitly dispositioned.
4. `03_MASTER_BACKLOG_TABLE.csv` — human-readable table mirror of the JSONL rows.
5. `04_EVIDENCE_REGISTRY.json` — upstream evidence matrices and repo-domain signals.
6. `05_IMPORT_COMPLETENESS_CHECKLIST.md` — import gate/checklist.
7. `06_SOURCE_MANIFEST.json` — file hashes and source artifact inventory.

If a ZIP was uploaded, inspect the files inside it. Do not rely on the README alone.

## Objective

Create or update the active Puppet Master ledger with all findings from the external repo passes. This is source/research ledger ingestion, not Plan compilation.

Do **not** write canonical Plans docs, PlanUnits, NodeSeeds, WorkNodes, implementation code, queues, manifests, or governance seal artifacts unless the user explicitly asks for a compile/seal phase later.

## Required coverage

The ledger must preserve lessons from all reviewed repos:

- OpenCode v1/dev/beta and OpenCode v2 specs
- Cline
- Agent Zero
- Pi
- OpenAI Codex
- Ghostty
- Warp
- tmux

The import must also preserve that Puppet Master is GUI-first: terminal and CLI lessons must be translated into GUI-native runtime/terminal/session/provider/tool/control contracts, not into a PM CLI product shape.

## Non-negotiable detail preservation

For every `02_LEDGER_READY_ATOMS.jsonl` row, preserve these fields as first-class ledger fields or structured notes:

- `source_row_id`
- `priority`
- `title`
- `finding_family`
- `source_repos`
- `observed_signal`
- `pm_current_coverage`
- `pm_gap_or_delta`
- `proposal_or_recommendation`
- `target_docs`
- `acceptance_tests_or_validation_surface`
- `relationship_to_prior_reports`
- `raw_row`

Do not merge rows into vague summaries. You may group related rows, but every source row ID must remain traceable and every acceptance test must survive.

## Ledger record guidance

Use ledger record types appropriate to the local PM ledger schema. If the schema supports design atoms, create one design atom per JSONL atom unless a stronger local record type is required. If the schema uses source events plus records, create:

- one source/input event for this import packet,
- one or more decision/context records preserving the GUI-first constraint and repo scope,
- one obligation/design atom for each JSONL atom,
- optional grouping/index records for domains such as context/cache, provider capability, MCP/tools, terminal, subagents, logging, memory, looping, release/security, and WebSocket transport.

## Important domains that must be represented

Ensure the ledger has explicit entries for at least these cross-cutting primitives and surfaces:

- `ContextEpoch`, `BaselineSystemContext`, `ContextSnapshot`, `ContextObjectBudget`
- `PromptCachePolicy`, `UsageCacheEnvelope`, volatile-context quarantine, cache-stability linting
- `ProviderCapabilityEpoch`, `CredentialRouteEpoch`, provider-native metadata/reasoning replay, provider egress policy
- `AgentControlEnvelope`, `ChildAgentLease`, `SubagentExecutionContract`, effort settlement
- `ToolTurnSettlement`, `ToolResultTruthfulnessGate`, malformed-turn/history admission gate, active tool namespace receipts
- MCP lazy catalog/search, typed parameter fidelity, lifecycle readiness, runtime-call liveness, header/secret hooks
- terminal protocol matrix, byte-stream/chunk parser, semantic prompt markers, backpressure receipts, accessibility range APIs, pasteboard/IME/global-hotkey/sensitive-channel guards, fuzz/replay corpus
- WebSocket transport policy with bounded queues/backpressure/origin/auth/replay/fallback semantics
- release/migration/provenance gates, AI-CI taint/supply-chain protections, command invocation/approval leases
- loop-breaker taxonomy, logging redaction-before-write, memory tiering, system resource governor
- multimodal input settlement and fallback caption/OCR/transcription policy
- session draft/attachment isolation, runtime surface readiness probes, UI projection store budgets
- closure/triage registry lessons, imported instruction graph integrity, external-agent handoff provenance

## Source evidence policy

When writing ledger entries, cite source files and source row IDs from this import packet. Use `source_refs` such as:

- `02_LEDGER_READY_ATOMS.jsonl:<atom_id>/<source_row_id>`
- `01_FULL_SOURCE_PACKET.md:<source file boundary>`
- `04_EVIDENCE_REGISTRY.json:<source evidence file>`

Keep external web citations that appear inside the raw reports as source evidence. Do not invent new source citations.

## Completion gate

Before saying the import is complete:

1. Count rows in `02_LEDGER_READY_ATOMS.jsonl`.
2. Prove every row has a ledger record or explicit non-import disposition.
3. Preserve all P0/P1/P2 priorities.
4. Preserve target docs and acceptance tests.
5. Preserve raw source artifacts as packet/source evidence.
6. Update ledger current/handoff/open-items state per the local ledger workflow.
7. Report row counts, records written, grouped domains, open decisions, blockers, and next safe action.

If the ledger schema or active ledger ID is ambiguous, stop and ask for only that ID/schema clarification. Do not discard details.
