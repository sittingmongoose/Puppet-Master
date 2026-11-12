# Shard 019: Ledger Compile Addendum - pldg-20260703-001-feature-intake

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2594-L2797

Source SHA256: `84b0145554db2f8945a2e5682fd08b2691aeeec3085d77b998acba25e10f1f1f`

---

## Ledger Compile Addendum - pldg-20260703-001-feature-intake

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260703-001-feature-intake` into this owner doc. The ledger remains source/planning memory; these PlanUnits are the live canonical evidence. This compile does not create WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or a governance seal.

### AMS-042 - P1-MEMORY-TIERING-CONTRACT

```yaml
plan_unit_id: AMS-042
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: MemoryTierContract retains writer authority, scope, retention/compaction policy, retrieval
  budget, causality/supersession, stale/retired status and failure semantics across transcript/history,
  operational Goal state, project/spec ledger, assistant preference memory, tool/artifact and ephemeral
  working context. The two visible levels are This project and Every project. This project binds the actual
  Project; Every project holds explicitly personal reusable notes for the same user. Availability selection
  is explicit; no relabeling, automatic promotion of private Project/app-thread content, or implied cross-Project
  sharing is allowed. Screen secrets and preserve source restrictions before broadening; if safe separation
  cannot be established, refuse the broader save. Private app-thread notes remain in their existing thread-only
  scope and never enter Every project by migration. Goal/Plan/Crew/schedule/ledger/notebook data never
  silently consolidates into personal memory.
gui_related: true
gui_classification_reason: User-visible GUI, built-in terminal, accessibility, visual, multimodal, or desktop surface is directly implicated.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- A giant chat/session thread opens through mandatory load-older paging from the derived render-page store (SP-338, ACD-242), never by replaying its events; the first page of a 100k-event thread arrives within 150 ms at p95, warm or cold, reading at most 2 MiB. Conversation compaction alone does not satisfy this.
- Memory search timeout returns degraded result, not hung turn.
- Project ledger facts are not injected as personal memory.
- Superseded/stale memory cannot silently override current Plan canon.
- No WorkNodes, NodeSeeds, executable queues, implementation files, production build tasks, generated governance artifacts, or governance seal outputs are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- A giant chat/session thread opens through mandatory load-older paging from the derived render-page store (SP-338, ACD-242), never by replaying its events; the first page of a 100k-event thread arrives within 150 ms at p95, warm or cold, reading at most 2 MiB. Conversation compaction alone does not satisfy this.
- Memory search timeout returns degraded result, not hung turn.
- Project ledger facts are not injected as personal memory.
- Superseded/stale memory cannot silently override current Plan canon.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Planning_Ledger_System.md
node_compile_hint:
  mode: p1_memory_tiering_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0070
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0070
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0066/P1-MEMORY-TIERING-CONTRACT@line=66
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0066/P1-MEMORY-TIERING-CONTRACT
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_missed_domains_backlog_2026-07-03.jsonl:12
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N16/N24/N25
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
source_atom_ids:
- atom-0070
external_atom_id: extrepo-20260703-0066
source_row_id: P1-MEMORY-TIERING-CONTRACT
priority: P1
finding_family: Agent memory, goal memory, project memory, conversation history
source_repos:
- Agent Zero
- Pi
- Codex
- Cline
target_docs:
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Planning_Ledger_System.md
owner_hints:
- Plans/assistant-memory-subsystem.md
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Planning_Ledger_System.md
preserved_exact_tokens:
- extrepo-20260703-0066
- P1-MEMORY-TIERING-CONTRACT
- P1
- Agent memory, goal memory, project memory, conversation history
- Agent Zero
- Pi
- Codex
- Cline
negative_constraints: []
observed_signal: Agent Zero reports chat history bloat and memory-search/consolidation timeouts; Pi documents context persistence and handoff to other models; Codex Goals/skills show durable objective and progressive disclosure; Cline SDK moves task history/session handling into shared runtime.
pm_current_coverage: assistant-memory-subsystem is strong on assistant-only memory, scopes, gists, prompt injection, retrieval, scoring, and maintenance. PM bootstrap ledgers also capture durable design memory.
pm_gap_or_delta: 'PM should explicitly separate memory tiers: transcript/history, operational goal state, project/spec ledger, assistant preference memory, tool/artifact memory, and ephemeral context working set.'
proposal_or_recommendation: 'Add MemoryTierContract: scope, writer authority, TTL, compaction policy, retrieval trigger, injection budget, causality/supersession link, stale/retired status, consolidation timeout, and failure semantics.'
compile_disposition: create_new_planunit
```

### AMS-043 - P1-MEMORY-STORE-CRUD-VERSION-CITATIONS

```yaml
plan_unit_id: AMS-043
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Memory CRUD and versioning retain provenance, redaction, durable failure reporting and
  history internally. Add writes a new MemoryGist from plain text with inferred kind and optional title
  at an explicit allowed level; Edit writes a new version of the targeted note and preserves its prior
  evidence/history. Delete is a real canonical deletion, distinct from Discard or archival: after one
  confirmation, commit a durable scoped suppression/tombstone, exclude the note and stale versions from
  all future read/injection paths, and invalidate derived indexes/caches. Old transcripts, trigger replay,
  reindex, import and backup merge cannot silently recreate that deleted note; only a new explicit user
  save can deliberately replace its suppression. Delete all in the list menu names and confirms the exact
  selected scope and target set, using the same deletion owner. Failed writes never report success. Canonical
  assistant_memory.redb commits precede asynchronous derived indexes. Ordinary replies show no memory-use
  citations, chips, counts, previews, ribbons, permanent glyphs, named-note hovers, verification/proof
  badges or Followed/Missed rule receipts. Only after a durable successful save may one brief Saved to
  memory · View line appear; View opens the same Memory page as a sheet with the saved note highlighted.
  A requested save/edit may receive one brief success confirmation. Failed or no-op saves earn no successful-save
  line; ordinary task evidence and links remain available. The external finding extrepo-20260703-0083
  / P1-MEMORY-STORE-CRUD-VERSION-CITATIONS (P1) is source lineage; its citation-surfacing recommendation
  is retired, not a mandate for reply memory citations.'
gui_related: true
gui_classification_reason: Target docs include GUI/UI command or user-visible surfaces; mixed work is conservatively GUI-related.
depends_on:
- PDS-003
- PNC-001
unblocks: []
acceptance_criteria:
- 'Memory CRUD and versioning retain provenance, redaction, durable failure reporting and history internally.
  Add writes a new MemoryGist from plain text with inferred kind and optional title at an explicit allowed
  level; Edit writes a new version of the targeted note and preserves its prior evidence/history. Delete
  is a real canonical deletion, distinct from Discard or archival: after one confirmation, commit a durable
  scoped suppression/tombstone, exclude the note and stale versions from all future read/injection paths,
  and invalidate derived indexes/caches. Old transcripts, trigger replay, reindex, import and backup merge
  cannot silently recreate that deleted note; only a new explicit user save can deliberately replace its
  suppression. Delete all in the list menu names and confirms the exact selected scope and target set,
  using the same deletion owner. Failed writes never report success. Canonical assistant_memory.redb commits
  precede asynchronous derived indexes. Ordinary replies show no memory-use citations, chips, counts,
  previews, ribbons, permanent glyphs, named-note hovers, verification/proof badges or Followed/Missed
  rule receipts. Only after a durable successful save may one brief Saved to memory · View line appear;
  View opens the same Memory page as a sheet with the saved note highlighted. A requested save/edit may
  receive one brief success confirmation. Failed or no-op saves earn no successful-save line; ordinary
  task evidence and links remain available. The external finding extrepo-20260703-0083 / P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
  (P1) is source lineage; its citation-surfacing recommendation is retired, not a mandate for reply memory
  citations.'
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260703-001-feature-intake
- User can list/get/update/delete memory stores and individual memories with version history, provenance, redaction, and rollback.
- Model responses that use memories can surface citations or evidence receipts.
- Memory consolidation failures are typed, retryable or surfaced, and never silently drop required memories.
risk_class: p1_agent_control_subagents_hardening
reasoning_tier: standard
context_scope: agent_control_subagents
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: p1_memory_store_crud_version_citations
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260703-001-feature-intake:atom-0087
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/records/design_atoms.jsonl:atom-0087
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0083/P1-MEMORY-STORE-CRUD-VERSION-CITATIONS@line=83
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/02_LEDGER_READY_ATOMS.jsonl:extrepo-20260703-0083/P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/01_FULL_SOURCE_PACKET.md
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/04_EVIDENCE_REGISTRY.json
- Plans/ledgers/v2/pldg-20260703-001-feature-intake/source_shards/external_repo_import_20260703/raw_source_artifacts/pm_final_external_repo_closure_backlog_2026-07-03.jsonl:10
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
source_atom_ids:
- atom-0087
external_atom_id: extrepo-20260703-0083
source_row_id: P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
priority: P1
finding_family: Agent memory store management, version history, and citation surfacing
target_docs:
- assistant-memory-subsystem.md
- Goal_Runtime_System.md
- FinalGUISpec.md
- storage-plan.md
- Contracts_V0.md
owner_hints:
- assistant-memory-subsystem.md
- Goal_Runtime_System.md
- FinalGUISpec.md
- storage-plan.md
- Contracts_V0.md
preserved_exact_tokens:
- extrepo-20260703-0083
- P1-MEMORY-STORE-CRUD-VERSION-CITATIONS
- P1
- Agent memory store management, version history, and citation surfacing
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
observed_signal: Warp Oz updates add memory store management commands and memory citations. | Codex changelog moved memory state to a dedicated SQLite DB and gated dedicated memory tools in config. | Agent Zero shows memory/history bloat and silent memory consolidation failure risks.
pm_gap_or_delta: MemoryTierContract covered layers and budgets, but not enough about memory CRUD/versioning/citations as user-visible objects.
relationship_to_prior_reports: Extends memory budget/governance into user-visible store operations.
compile_disposition: create_new_planunit
```
