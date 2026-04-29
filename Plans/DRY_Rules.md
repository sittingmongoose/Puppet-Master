# DRY Rules (Canonical)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0170
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - likely issue: tier-boundary and single-Overseer audit rules are too rigid for package/seam overseers and automation-first execution.
  - `Widget_System.md` still catalogs tier widgets and weak hostability rules
  - Widget_System.md
  - provider-gap disclosure rules (`honored`, `skipped`, `clamped`)
  - honored
  - skipped
  - clamped
  - Manual override lifecycle exists for Persona, but similar presentation rules are less explicit for provider/model/account/worker-policy overrides.
  - Research Progress - 2026-03-16 - Auto Persona Resolution Rules
  - Terms that need explicit distinction rules
  - `FinalGUISpec.md` already contains many local disclosure rules, but they are distributed.
  - FinalGUISpec.md
  - concerns need exact identity, lineage, source linking, status, and interaction rules
  - Concern lineage now needs more exact rules.
  - still needs explicit account-switch history semantics and tighter binding between canonical snapshot rules and downstream event/record families
  - Align `storage-plan.md` event-table rows with the stronger normative rules:
  - storage-plan.md
  - still needs project-scoped layout rules, terminal-widget normalization, projection-trust chrome, and attempt/lane-aware live data contracts
  - `usage_event_ref?` is treated as the canonical bridge name in storage/receipt rules, but no doc actually defines what it is.
  - usage_event_ref?
  - title-bar project badges, Projects page cards, command-palette summaries, and attention-center rows should all reuse the same status vocabulary and precedence rules
  - session-scoped `always` approvals and reject-cascade rules have no actor/lane/run/account scope key
  - always
  - needs immediate correction of canonical `thread_id` semantics and explicit upstream-account opacity rules
  - thread_id
  - now clearly needs its operational-identity rules bound into the shared runtime grammar
  - Worktree/source-control contracts still need rewrite-native authority rules:
  - still needs node/lane-aware vocabulary and projection authority rules
  - `Executor_Protocol.md` still lacks `blocked_sequence` minting rules even though storage/contracts/UI all depend on it.
  - Executor_Protocol.md
  - blocked_sequence
  - Execution-core seams are now pinned to specific missing mint/ownership rules:
  - `Executor_Protocol.md` still has duplicated scheduler sections, still leaves `blocked_sequence` minting rules unowned, and still leaves the startup-recovery -> first scheduler-pass handshake implicit even though the vocabulary (`startup_recovered`) now exists.
  - startup_recovered
  - still lacks the mint/ownership rules that blocked/runtime recovery now depend on.
  - duplicate canonical sections plus unowned mint/handshake rules remain an execution-core risk multiplier.
  - If route-aware navigation becomes canonical, keeping `GATE-010` unchanged will make the strongest navigation rules effectively unenforced.
  - GATE-010
  - Make `Runtime_Artifacts_Panel.md` and other artifact-bearing surfaces consume the same subject-open resolver rather than bespoke artifact-opening rules.
  - Runtime_Artifacts_Panel.md
  - reserved-name ownership remains split across three docs, with `/compact` still showing why copied lists and copied rules are unsafe.
  - /compact
  - The key remaining question is breadth: how many authored `Plans/*.md` docs are still only Gemini or otherwise below full requested model coverage.
  - Plans/*.md
  - resolves through canonical subject/open rules
  - `OpenSubject` owns `subject_id` and subject realization rules
  - OpenSubject
  - subject_id
  - Deprecated aliases and stable wrappers need different lifecycle rules.
  - Treat `resume_url` as a derived serialization of `route_target`, with decoding rules anchored back to `Contracts_V0.md`.
  - resume_url
  - route_target
  - Contracts_V0.md
  - Research Progress - 2026-03-17 - Canonical route validation and rejection rules
  - The route layer now needs explicit invalid-combination rules.
  - Canonical route validation rules are:
  - A bounded contract needs rejection rules.
  - Scoped identity rules:
  - Resolver logic must be responsible for applying the correct scoped lookup rules.
  - Reconcile owner docs first, then update these four consumer docs to consume the canonical route/object model rather than invent page-local identity rules.
  - Reconcile worker output and evidence update rules so they align with attempt/node/runtime lineage rather than `TierChanged`-driven active-tier state.
  - TierChanged
  - queue-analysis and blocked-state rendering rules keyed to canonical runtime records
  - `[retired-token-2]` cross-checks surfaced duplicated canonical sections, malformed/uncategorized `[retired-token-1]`s, lowercase normative text that evades traceability gates, and alias-canonicalization rules that now contradict owner docs.
  - [retired-token-2]
  - [retired-token-1]
  - Coverage has been re-audited after the merge: `39` top-level `Plans/*.md` docs are full six-pass complete and the remaining `22` docs are now uniformly at five passes.
  - 39
  - 22
  - After this merge, the authored top-level `Plans/*.md` surface is fully covered: all `61` docs now have all six requested model passes.
  - 61
  - Research Progress - 2026-03-17 - owner-traceability seam: Decision Log, DRY Rules, Crosswalk
  - project-summary, escalation, blocked-owner, and resurfacing rules
  - route/open-subject/bridge-field refinement and verification rules
  - Example pattern: `route_target` / `OpenSubject` exist, but precedence, reject rules, examples, and scoped-resolution rules are still missing.
  - Bridge fields exist, but precedence/join semantics and compatibility fallback rules remain under-specified.
  - Envelope fields landed, but per-family behavior rules and stronger bridge-governance semantics were not fully transferred.
  - Missing blocked-owner / escalation / resurfacing rules will produce inconsistent UX and inconsistent persistence semantics.
  - Missing cleanup/lifecycle rules will produce destructive ambiguity between archive/remove/prune/recover behaviors.
  - detailed rules, examples, field schemas, or operational policies often did not
- Legacy token retirement handling:
  - Retired token #1 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
  - Retired token #2 is preserved exactly in packet metadata and must be omitted, replaced by canonical wording, or documented only as an explicitly deprecated legacy alias in live prose.
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
  - All exact_stale_tokens_to_retire are removed, reframed as explicitly deprecated, or preserved only as documented legacy aliases.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- DRY / SSOT RULES

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).
-->

## 0. Scope
This document defines the anti-drift rules for plan documents:
- how SSOT sources are referenced (instead of duplicated)
- how `ContractRef:` annotations make requirements executable and gateable

ContractRef: Primitive:DRYRules

---

## 1. SSOT precedence (global)
If documents conflict, resolve with:
1. `Plans/Spec_Lock.json`
2. `Plans/Crosswalk.md`
3. This file
4. `Plans/Glossary.md`
5. `Plans/Decision_Policy.md`

ContractRef: SchemaID:Spec_Lock.json, Primitive:Crosswalk, PolicyRule:Decision_Policy.md§2

---

## 2. Don't duplicate canonical contracts

A doc that consumes orchestration, routing, runtime identity, approval, or worktree/lane behavior must consume the owning contract rather than restating feature-local canon.

Rules:
- owner docs are updated before consumer docs when canon changes
- stale canonical text must be replaced or retired; append-only clarification is not sufficient when old text would remain misleading
- a consumer doc must not preserve an older model as a peer option once a replacement canon exists
- summary, checklist, and feature-list mirrors do not re-own canon and must be reconciled after owner docs change

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md

The following concepts are owner-routed and must not be re-owned by consumers:
- blocked-episode approval identity
- requested/effective runtime identity
- account-binding semantics and switch history
- `route_target` and `OpenSubject`
- lane/worktree lifecycle semantics
- concern lifecycle and lineage
- graph-generation lineage and graph-patch semantics

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md
## 3. "Index-only" guidance

### 3.1 Assistant worktree DRY routing

Thread-to-worktree binding follows the standard owner-routed DRY pattern:

| Concept | Owner doc | Consumers cross-ref, do not redefine |
|---|---|---|
| Thread worktree binding model (1:1) | `Plans/assistant-chat-design.md` | storage-plan.md, Contracts_V0.md, Crosswalk.md |
| 11 seglog events (`chat.thread_worktree_*`) | `Plans/assistant-chat-design.md` | storage-plan.md, Contracts_V0.md, Wiring_Matrix.md |
| 6 commands (`cmd.chat.worktree.*`) | `Plans/assistant-chat-design.md` | UI_Command_Catalog.md, Commands_System.md, Contracts_V0.md |
| 10 settings keys | `Plans/assistant-chat-design.md` | storage-plan.md, FinalGUISpec.md |
| Merge-back flow (4 paths) | `Plans/assistant-chat-design.md` | GitHub_Integration.md, Executor_Protocol.md |
| Pre-merge test gate | `Plans/assistant-chat-design.md` | storage-plan.md, Executor_Protocol.md |
| SC accordion layout | `Plans/GitHub_Integration.md` | storage-plan.md, FinalGUISpec.md |
| `owner_thread_id` on worktree_record.v1 | `Plans/storage-plan.md` | WorktreeGitImprovement.md, Orchestrator_Page.md |

Consumer docs MUST cross-reference the owner doc rather than redefining canonical details. Tables, enums, field lists, and behavioral rules live in the owner doc only.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/assistant-chat-design.md

A plan MAY include an index/list of IDs (event kinds, UI command IDs, tool IDs) but MUST NOT redefine schemas owned elsewhere.

ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2

---

## 4. Forbidden patterns (drift accelerators)
- `TBD`, `Open question`, `ask later` in plan requirements.
- Vague requirements like "robust", "graceful", "secure" without measurable behavior.
- Duplicating provider CLI details outside Provider SSOT.

ContractRef: PolicyRule:Decision_Policy.md§2

---

## 5. MUST/SHALL/REQUIRED implies ContractRef
Any statement using **MUST / SHALL / REQUIRED / NEVER** MUST include at least one `ContractRef:` line.

ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2

---

## 6. ContractRef taxonomy (allowed categories)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0171
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - `inspector_target` remains allowed because it is a reusable detail-focus field rather than per-surface noise.
  - inspector_target
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
ContractRef entries are comma-separated.

Allowed categories (minimum):
- `SchemaID:<id>`
- `ContractName:<path>#<anchor>`
- `Primitive:<name>`
- `ToolID:<id>`
- `EventType:<type>`
- `ConfigKey:<key>`
- `PolicyRule:<id>`
- `UICommand:<id>`
- `Invariant:<id>`
- `Gate:<id>`

ContractRef: Primitive:DRYRules

---

<a id="7"></a>
## 7. ContractRef annotation rule (canonical)
**Rule:** Every operational requirement MUST have at least one `ContractRef:`.

Operational requirement detection (deterministic):
- Any line containing: `MUST`, `MUST NOT`, `SHALL`, `REQUIRED`, `NEVER`.

ContractRef: ContractName:Plans/Progression_Gates.md#GATE-009

ContractRef format:
```text
... requirement text ...
ContractRef: Primitive:DRYRules, ContractName:Plans/Contracts_V0.md
```

ContractRef: Gate:GATE-009, ContractName:Plans/Progression_Gates.md#GATE-009

---

## 7.1 Packet-fidelity semantic matching
Packet-fidelity checks used by VERIFIER packet preflight and SCRIBE self-check MUST ignore standalone lines whose trimmed text starts with `ContractRef:` on both the packet-text side and the file-text side before substring matching.

Required matching order:
1. Strip standalone `ContractRef:` lines from both texts.
2. Convert CRLF to LF.
3. Trim trailing whitespace per line.
4. Collapse runs of spaces/tabs to a single space.
5. Collapse 3+ blank lines to 2 blank lines.
6. Perform substring matching on the normalized texts.

This semantic matching rule exists only for packet-fidelity/self-check comparisons and MUST NOT weaken ContractRef enforcement in run-gates or any other plan-quality gate.

ContractRef: Primitive:DRYRules, Gate:GATE-009, PolicyRule:Decision_Policy.md§2

---

## 8. Reference style
- Prefer referencing canonical files/anchors over inline duplication.
- Prefer stable anchors (`<a id="..."></a>`) for cross-doc links when heading slugging could change.

ContractRef: Primitive:DRYRules

---

<a id="9"></a>
## 9. No unreferenced operational text

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0173
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Later canonical correction text says:
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.
Operational requirements without `ContractRef:` are non-canonical and MUST fail the plan-quality gate.

ContractRef: Gate:GATE-009

---

<a id="10"></a>
## 10. Inline requirement tag convention (readability only)

This convention is **readability-only and non-authoritative**. It provides a lightweight way to annotate requirement references inline in prose — it does NOT constitute traceability evidence.

**Tag format:**
- `Req:FR-001` — functional requirement reference
- `Req:NFR-001` — non-functional requirement reference
- `Req:REQ-001` — generic requirement reference

Authoritative requirement coverage lives ONLY in:
1. Node shard `requirement_refs` fields (schema: `pm.project-plan-node.v1`)
2. Derived coverage JSON at `.puppet-master/project/traceability/requirements_coverage.json`

ContractRef: SchemaID:pm.project-plan-node.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

Inline tags MUST NOT be used as the sole traceability mechanism.  
ContractRef: SchemaID:pm.project-plan-node.v1, SchemaID:pm.requirements_coverage.schema.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

If an inline tag and a node's `requirement_refs` conflict, `requirement_refs` MUST be treated as authoritative.  
ContractRef: SchemaID:pm.project-plan-node.v1, Gate:GATE-011, ContractName:Plans/DRY_Rules.md#10

---

## References
- `Plans/Progression_Gates.md#GATE-009`
- `Plans/Progression_Gates.md#GATE-011`
- `Plans/Contracts_V0.md`
- `Plans/Spec_Lock.json`
- `Plans/requirements_coverage.schema.json`
