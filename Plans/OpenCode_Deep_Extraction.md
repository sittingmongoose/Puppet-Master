# OpenCode Deep Extraction (for Puppet Master)

<!--
Purpose:
- Provide a deterministic, repeatable procedure for extracting **architecture-relevant** patterns from the OpenCode repo to inform Puppet Master plans and implementations.
- This document is not a design fork: Puppet Master remains governed by its own locked decisions; OpenCode is used as a reference implementation.

ABSOLUTE NAMING RULE:
- Platform name is “Puppet Master” only.
- If older naming exists, refer to it only as “legacy naming” (do not quote it).
-->

## 1. Goal
Extract reusable, implementation-grade guidance from OpenCode (tools/permissions, provider streams, UI command patterns, storage/event envelope conventions) and map those findings into Puppet Master’s SSOT plans **without** importing drift-prone details.

## 2. Hard constraints
- Puppet Master’s locked stack decisions always win over OpenCode’s choices.
- Extraction must be autonomous and deterministic (no mid-run human decisions).
- Output must be actionable: findings must map to an existing Puppet Master plan doc section (or be explicitly discarded with a reason).

## 3. Inputs
- OpenCode repository: https://github.com/anomalyco/opencode
- Puppet Master Plans directory (SSOT).

## 4. Deterministic extraction procedure
1) **Clone OpenCode into a temporary workspace** (do not commit it):
   - Path: `./.tmp/opencode` (or another deterministic temp dir).
2) **Inventory OpenCode surfaces** (deterministic list):
   - Tools model + permissions model
   - Provider execution model (streaming events, tool use/result)
   - UI command catalog / command dispatch pattern
   - Storage/persistence model (event log, projections)
3) **Extract canonical artifacts** (ordered):
   - Any markdown docs describing contracts and payload shapes
   - Any schema files (JSON schema, TS types, Rust types)
   - Any code paths implementing the contracts
4) **Normalize into Puppet Master terms**:
   - “Provider”, “EventRecord”, “UICommand”, “tool.invoked/tool.denied” as Puppet Master contract names.
   - When OpenCode uses different naming, record it as an OpenCode-only term and translate.
5) **Map findings into Puppet Master SSOT docs**:
   - For each extracted concept, choose exactly one target plan doc section to update (or mark as discarded).
   - Never duplicate: add a reference to the correct SSOT doc instead of copying long definitions.
6) **Delete the OpenCode clone** (`./.tmp/opencode`) after extraction to avoid accidental commits.

## 5. Output format (for downstream agents)
For each extracted item, emit a record with:
- `source`: file path + snippet
- `category`: tools | permissions | provider_stream | ui_commands | storage
- `puppet_master_target`: `Plans/<doc>.md#<section>`
- `decision`: adopt | adapt | discard
- `rationale`: 1–3 sentences
- `acceptance_impact`: what new acceptance criteria (if any) become testable

## 6. Acceptance criteria
- Extraction can run end-to-end without prompts.
- Every adopted/adapted item is mapped to a single Puppet Master SSOT doc section.
- Temporary OpenCode clone is deleted after completion.
- No Puppet Master locked decisions are overwritten by OpenCode-derived content.
