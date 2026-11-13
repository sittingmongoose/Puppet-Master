# Working Notebook

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: "Puppet Master" only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.
> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Canonical sole owner of the PM-owned Working Notebook: notebook identity and scope kinds, entry envelope and epistemic vocabulary, revision/CAS and idempotency semantics, resume capsule content contract, notebook checkpoint content contract, materiality-triggered capture rules, explicit sharing and derivation restrictions, promotion requests to destination owners, validity/staleness semantics, lifecycle/retention behavior, and notebook storage-family dispositions. It does not own context-window transition policy (`Plans/Prompt_Pipeline.md`), transition runtime and admission (`Plans/Shared_Integration_Runtime.md`), Assistant memory (`Plans/assistant-memory-subsystem.md`), Attempt Journal and Parent Summary (`Plans/agent-rules-context.md`), tool registration mechanics (`Plans/Tools.md`), permission decisions (`Plans/Permissions_System.md`), physical storage machinery (`Plans/storage-plan.md`), Goals, Plans, To-Dos, ledgers, or any workflow's own state.

## 0. Scope

### Scope and product model

The Working Notebook is a lightweight, PM-owned working-state record for the Assistant and for orchestration workers, coordinators, and explicitly scoped collaboration participants. It preserves deliberately authored working artifacts: observations, hypotheses, rejected approaches with their conditions, useful evidence locations, research progress, caveats, and continuation suggestions. Notes are available after model or provider changes through PM tools and bounded context selection, so continuity never depends on provider-private notebooks or private backend endpoints.

The notebook is continuity material, not authority. It is neither permanent Assistant memory, nor an authoritative ledger, Plan, To-Do, Goal, or execution receipt, nor a rules source. Notebook text can never approve, verify, complete, schedule, or authorize anything; destination owners keep every gate. A notebook observation is not automatically Verified memory, and repeated retrieval does not upgrade certainty.

Working Notebook owns:

- stable notebook identity, exact application-or-Project place binding with real thread/Computer identity, and the five scope kinds (thread, worker lineage, coordinator run, participant, explicit shared slice);
- the small typed entry envelope (ids, scope, revision, author, lifecycle, epistemic kind, provenance, validity context, effective restrictions) around flexible bounded Markdown or structured bodies;
- attributed revisions with compare-and-swap and idempotency, supersession, and conflict visibility;
- epistemic kinds `hypothesis | observation | rejected_approach | reference | continuation | user_note` and the freshness dimension `current | needs_revalidation | source_unavailable`;
- the bounded resume capsule content contract and on-demand entry retrieval;
- materiality-triggered capture rules, lazy creation, and the optional-versus-required capture failure distinction;
- notebook checkpoint content: which note revisions and references are required before a transition checkpoint may commit (the commit barrier protocol itself is owned by `Plans/storage-plan.md`);
- explicit sharing of exact note revisions to explicit recipients, and restriction inheritance for derived notes;
- promotion requests to Assistant memory, planning atoms, To-Dos, or scoped instructions through the destination owners;
- validity references and staleness labeling when recorded dependencies change;
- lifecycle `active | superseded | archived | tombstoned`, growth pressure review, and deletion semantics under the storage retention owner;
- the notebook storage-value families, their keys, and their registry dispositions in cooperation with `Plans/storage-plan.md`.

It does not own:

- prompt assembly, admission budgets, or fresh-window transition policy (`Plans/Prompt_Pipeline.md`);
- dispatch admission receipts, leases, and recovery reconciliation (`Plans/Shared_Integration_Runtime.md`);
- Assistant-only memory records, verification, or injection (`Plans/assistant-memory-subsystem.md`);
- the Attempt Journal and Parent Summary contracts (`Plans/agent-rules-context.md`);
- permission decisions, mute/revocation authority (`Plans/Permissions_System.md`);
- seglog/redb machinery, projector pipelines, and physical retention (`Plans/storage-plan.md`);
- Goal, Plan, To-Do, ledger, and workflow runtime truth (their own owners).

### Requirements for a valid notebook action

A durable notebook action requires an exact admitted place plus its existing runtime scope. A Project notebook uses the real Project/Vault; WN-021 admits thread-private app scratch with `project_id=null`, actual Server/Computer/thread and a live app storage writer, before any Vault exists. Missing scope/current writer still yields a typed reason without a hidden Project. Host identity, timestamps and policy generation are host-filled, never model-supplied authority.

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Settings_System.md

## 1. Ownership And Consumers

### Owner map

| Responsibility | Owner |
|---|---|
| Notebook identity, scopes, entries, revisions, capsule, checkpoint content, capture, sharing, promotion requests, validity, retention semantics | `Plans/Working_Notebook.md` (this doc) |
| Notebook tool contracts: names, schemas, caps, permission classes, errors | `Plans/Tools.md` |
| Fresh-window transition policy, admission lifecycle, one budget, reconstruction, replay integrity | `Plans/Prompt_Pipeline.md` |
| Transition runtime, dispatch admission, recovery reconciliation, leases | `Plans/Shared_Integration_Runtime.md` |
| Physical persistence, commit barriers, read-after-commit, index watermark, retention classes | `Plans/storage-plan.md` |
| Assistant memory records, per-claim verification, injection | `Plans/assistant-memory-subsystem.md` |
| Restriction/mute/revocation authority, read-time permission checks | `Plans/Permissions_System.md` |
| Secret redaction and artifact sensitivity before capture | `Plans/FileSafe.md` |
| Attempt Journal / Parent Summary bounded injection | `Plans/agent-rules-context.md` |
| Worker/coordinator scope bindings, coordination truth | `Plans/orchestrator-subagent-integration.md` |
| Usage attribution for notebook-related model calls | `Plans/usage-feature.md` |
| Chat and Orchestrator notebook surfaces, Context Details disclosure | `Plans/assistant-chat-design.md`, `Plans/Orchestrator_Page.md` |
| Project-scoped notebook settings values | `Plans/Settings_System.md` + `Plans/settings_inventory.json` |
| Backup/restore/copy participation | `Plans/Backup_Restore_System.md`, `Plans/Project_System.md` |
| Host/server move fencing | `Plans/Project_Sync_and_Backbone.md`, `Plans/Server_System.md` |

### Consumers

Consumers that read or write notebook state through this owner's contracts: `Plans/Prompt_Pipeline.md` (capsule admission, recovery reconstruction), `Plans/Tools.md` (agent tool family), `Plans/assistant-chat-design.md` (thread notebook surface), `Plans/Orchestrator_Page.md` (selected run/worker notebook access), `Plans/orchestrator-subagent-integration.md` (worker/coordinator scopes), `Plans/Collaborative_Workflows.md` (participant slices, shared findings), `Plans/assistant-memory-subsystem.md` (promotion target), `Plans/agent-rules-context.md` (journal/summary integration), `Plans/storage-plan.md` (persistence), `Plans/Backup_Restore_System.md` (backup families), `Plans/usage-feature.md` (helper attribution).

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/agent-rules-context.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Backup_Restore_System.md, ContractName:Plans/Settings_System.md

## 2. Canonical PlanUnits

### WN-001 - Working Notebook Ownership And Authority

```yaml
plan_unit_id: WN-001
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Plans/Working_Notebook.md is the sole semantic owner of the PM-owned Working Notebook: notebook identity and scope kinds, entry envelope, revisions and idempotency, epistemic vocabulary, resume capsule content, notebook checkpoint content, capture rules, sharing and derivation restrictions, promotion requests, validity/staleness, and retention semantics. Context-window transition policy is owned by Prompt_Pipeline, transition runtime by Shared_Integration_Runtime, Assistant memory by assistant-memory-subsystem, Attempt Journal/Parent Summary by agent-rules-context, permissions by Permissions_System, and physical storage machinery by storage-plan."
gui_related: false
gui_classification_reason: Notebook semantics are runtime-agnostic specification; GUI entry points are specified in their UI owners.
depends_on: [PDS-003, SP-243]
unblocks: [WN-002, WN-003, WN-004, WN-005, WN-006, WN-007, WN-008, WN-009, WN-010, WN-011, WN-012, WN-013, WN-014, WN-015, WN-016, WN-017, WN-018, WN-019, WN-020]
acceptance_criteria:
  - The doc defines stable notebook identity, scope kinds, envelope, and lifecycle without duplicating any existing owner's contract.
  - Every notebook consumer contract points here for semantics and to its own owner for mechanics.
  - No parallel context compiler, permission engine, usage ledger, Goal lifecycle, or workflow state store is created.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: owner_drift
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md, Plans/Tools.md, Plans/storage-plan.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-S03
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N01
preserved_exact_tokens: ["Working Notebook", "semantic owner", "resume capsule", "notebook checkpoint", "materiality-triggered capture"]
negative_constraints:
  - Do not create a second notebook, notes, or scratchpad authority in any other Plans doc.
  - Do not turn notebook text into approved, verified, completed, or scheduled state.
owner_hints: [Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/assistant-memory-subsystem.md

### WN-002 - Lightweight Working State And Epistemic Kinds

```yaml
plan_unit_id: WN-002
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: A Working Notebook preserves authored observations, hypotheses, rejected approaches with their conditions, useful evidence locations, research progress, caveats, and continuation suggestions. Every entry carries one epistemic kind hypothesis|observation|rejected_approach|reference|continuation|user_note and one freshness value current|needs_revalidation|source_unavailable. Rejected approaches retain their scope and conditions and never become universal prohibitions. Unconfirmed hypotheses are saved without any Verified label; there is no verified epistemic kind and no notebook-authority shortcut to Verified memory.
gui_related: false
gui_classification_reason: Entry semantics and payload fields are not GUI work; UI rendering of these states is specified in assistant-chat-design.
depends_on: [WN-001]
unblocks: [WN-008, WN-013]
acceptance_criteria:
  - An unconfirmed hypothesis can be saved and later read back with its uncertainty intact.
  - A rejected approach records the conditions of rejection, not a blanket rule.
  - UI and tool payloads preserve epistemic kind and freshness end to end.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: false_certainty
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/assistant-chat-design.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N07
preserved_exact_tokens: ["hypothesis", "observation", "rejected_approach", "reference", "continuation", "user_note", "needs_revalidation", "source_unavailable"]
negative_constraints:
  - Do not add a verified epistemic kind or any notebook authority shortcut into Verified memory.
  - Do not collapse the freshness dimension into the lifecycle dimension.
owner_hints: [Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-memory-subsystem.md

### WN-003 - PM-Owned Provider-Neutral Capability

```yaml
plan_unit_id: WN-003
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: The Working Notebook is one PM-owned capability exposed across eligible Assistant and orchestration surfaces. Notes remain available after model or provider changes through PM tools and bounded context selection. Provider-native notebook features, where present, are optional conveniences observed per Plans/CLI_Bridged_Providers.md and are never the continuity source of record; absence of a provider-native notes capability disables nothing in PM-owned continuity. Two different routes can access the same permitted PM note identities.
gui_related: false
gui_classification_reason: Capability semantics are provider/runtime behavior, not GUI work.
depends_on: [WN-001, CBP-011]
unblocks: []
acceptance_criteria:
  - After a provider or model change, prior permitted notes remain readable through PM tools.
  - A route without provider-native notes has full PM notebook capability.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: provider_dependency
reasoning_tier: standard
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/CLI_Bridged_Providers.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-P02
preserved_exact_tokens: ["PM-owned", "provider-neutral", "never the continuity source of record"]
negative_constraints:
  - Do not depend on a provider-private notebook or private backend endpoint for PM continuity.
  - Do not scrape provider-private hidden notes into PM-authored notebook content.
owner_hints: [Plans/Working_Notebook.md, Plans/CLI_Bridged_Providers.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/CLI_Bridged_Providers.md

### WN-004 - Lazy Creation And Materiality-Triggered Capture

```yaml
plan_unit_id: WN-004
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: >-
  Notebook records are created lazily on the first explicit or material write; trivial exchanges
  produce no notebook, no note, and no fabricated usage call. Automatic capture is enabled by default
  only for material events during relevant long work material discoveries, rejected approaches,
  milestones affecting continuation, and required continuation handoffs. Capture never requires a
  separate helper LLM call per message. A user preference resolved through Everywhere, Computer and
  optional Project can disable optional automatic capture; disabling it does not delete existing
  notes, does not remove explicit authorized operations, and does not disable any mandatory ledger or
  workflow checkpoint owned by another owner. App scratch creation follows the same materiality rule
  and does not require a Project Vault.
gui_related: false
gui_classification_reason: Capture policy is runtime behavior; the settings control surface is specified in Settings_System.
depends_on: [WN-001]
unblocks: [WN-018]
acceptance_criteria:
  - A simple question/answer exchange leaves zero notebook records and zero fabricated zero-token usage attempts.
  - Material discoveries, rejected attempts, milestones, and necessary handoffs each have deterministic capture rules.
  - Disabling optional auto-capture leaves mandatory ledger/workflow checkpoints enforced (Plans/Planning_Ledger_System.md turn writes).
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: silent_overhead
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Settings_System.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-N03
- source_packet:PM-WNC-2026-09-05-v1:WNC-U02
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N24/N26
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens: ["lazily", "material write", "no helper LLM call", "mandatory ledger"]
negative_constraints:
  - Do not create empty notebook records for trivial exchanges.
  - Do not fabricate usage records for local capture work.
  - Do not let a capture preference disable another owner's mandatory checkpoints.
owner_hints: [Plans/Working_Notebook.md, Plans/Settings_System.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Settings_System.md, ContractName:Plans/usage-feature.md, ContractName:Plans/Planning_Ledger_System.md

### WN-005 - Thread, Worker, Coordinator, And Collaboration Scopes

```yaml
plan_unit_id: WN-005
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: >-
  Notebooks use five scope kinds bound to existing runtime identities, with durable scope and author
  identity. thread binds one explicit place plus thread_id, with null Project in an app scratch
  notebook. worker_lineage binds one node/attempt lineage from the orchestrator runtime.
  coordinator_run binds one coordinating run/package. participant binds one collaboration run and
  participant slot. shared_slice binds one collaboration run plus an explicit recipient policy.
  Place/Project, thread and participant boundaries always apply. App Crew participant/shared_slice
  scopes require their real admitted Crew parent; Project-only node scopes cannot be fabricated. There
  is no ambient all-project notebook and no default cross-thread injection; cross-project reads and
  shares are denied unless an existing explicit import flow authorizes them. Scopes are capabilities
  over existing runtime and storage, never a new hierarchy of agents, sessions, or Goals, and scope
  cannot be widened by editing body text. WN-021 owns the app scratch and fenced conversion form;
  projects.* cannot read notebooks.
gui_related: false
gui_classification_reason: Scope binding semantics are runtime behavior, not GUI work.
depends_on: [WN-001, OSI-435]
unblocks: [WN-010, WN-012]
acceptance_criteria:
  - Scope and author identity survive restart, resume, and provider change.
  - A cross-project read or share without an authorized import flow is denied with a typed reason.
  - A known entry ID or parent relationship alone grants no access.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: scope_escalation
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/orchestrator-subagent-integration.md, Plans/Collaborative_Workflows.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-N04
- source_packet:PM-WNC-2026-09-05-v1:WNC-I06
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N3/N24/N25/N26
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens: ["thread", "worker_lineage", "coordinator_run", "participant", "shared_slice", "no ambient all-project notebook"]
negative_constraints:
  - Do not add ambient all-project notebooks or default full cross-thread injection.
  - Do not key notebooks on provider session IDs in place of PM identities.
owner_hints: [Plans/Working_Notebook.md, Plans/orchestrator-subagent-integration.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Permissions_System.md

### WN-006 - Flexible Bodies With A Small Typed Envelope

```yaml
plan_unit_id: WN-006
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Entry bodies are bounded human-readable Markdown or structured findings inside a minimal typed envelope: notebook_id, entry_id, scope, revision/currentness token, author kind and actor, timestamps, lifecycle, epistemic kind, provenance/source references, validity references, and effective restriction information. The host fills envelope metadata wherever it can. Full PlanUnit-like forms per paragraph are not required. Entry bodies are held inline up to 16 KiB UTF-8 per record (SP-337); a larger body is stored once in the content-addressed BLAKE3 payload store and the entry carries a payload reference plus body_sha256, and authored input past the notebook's overall cap is rejected with a split offer rather than silently truncated. Amended 2026-10-31 (DL-270): SP-337 and SP-340 replace the former 64 KiB UTF-8 inline hard cap. Note text must not become a hidden log, DOM dump, document dump, video, or diff dump."
gui_related: false
gui_classification_reason: Envelope schema is data contract work, not GUI work.
depends_on: [WN-002]
unblocks: [WN-007]
acceptance_criteria:
  - The envelope schema validates strictly; bodies are bounded.
  - Host-supplied metadata is not restated by the model.
  - Oversize bodies are rejected with a typed split offer; raw evidence stays with the artifact owner.
  - A body over 16 KiB is stored once as a payload reference with body_sha256; no inline entry value exceeds 16 KiB (SP-337, SP-340).
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contracts.schema.json
risk_class: envelope_drift
reasoning_tier: standard
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/working_notebook_contracts.schema.json]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N05
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T03
preserved_exact_tokens: ["64 KiB UTF-8", "typed envelope", "split offer"]
negative_constraints:
  - Do not require PlanUnit-like forms per paragraph.
  - Do not embed raw logs, DOM, documents, recordings, or diffs in note bodies.
owner_hints: [Plans/Working_Notebook.md, Plans/Runtime_Artifacts_Panel.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/FileSafe.md

### WN-007 - Revisions, Compare-And-Swap, And Idempotency

```yaml
plan_unit_id: WN-007
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Every entry mutation is an attributed revision carrying a request/idempotency identity, the expected prior revision, actor, scope/policy generation, operation, and typed outcome. Writes apply compare-and-swap: a stale expected revision is rejected with a typed conflict that names both revisions, and last-write-wins is never the semantic conflict resolver. Retrying a mutation with the same idempotency identity returns the original result without a second write, including when the original reply was lost. Appends are revisions and never a way to evade CAS or restriction checks. Concurrent user and agent edits each preserve authorship; the loser receives the conflict and may re-read and reapply. In-flight model requests keep their original receipt-bound bytes; a later note edit never silently rewrites already-sent context and instead affects future assembly."
gui_related: false
gui_classification_reason: Revision semantics are data-contract behavior, not GUI work.
depends_on: [WN-006, SP-255]
unblocks: [WN-016]
acceptance_criteria:
  - Stale revisions are rejected with a typed conflict; repeated idempotent requests return the same revision once.
  - A committed note whose reply was lost reads back committed state with the same idempotency identity and no duplicate append.
  - Old in-flight prompts are not rewritten by later note edits.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: concurrent_write_loss
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/storage-plan.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N06
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X02
preserved_exact_tokens: ["compare-and-swap", "idempotency identity", "typed conflict", "last-write-wins is never the semantic conflict resolver"]
negative_constraints:
  - Do not silently overwrite concurrent user or agent edits.
  - Do not use append to bypass CAS or restriction checks.
owner_hints: [Plans/Working_Notebook.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md

### WN-008 - Working Certainty Is Not Verification

```yaml
plan_unit_id: WN-008
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Notebook entries are deliberately authored user-visible working artifacts, not verification results. A notebook observation never becomes Verified memory or completion evidence by being written, retrieved, repeated, or included in a checkpoint; certainty upgrades happen only through destination-owner gates such as Plans/assistant-memory-subsystem.md verification. Notebook writes cannot self-certify task success, and coordinator or worker completion truth comes from the runtime owners, never from note status prose. Inspection surfaces expose author, evidence references, and freshness so users can judge claims themselves. The notebook contains no export or reconstruction of provider-private chain of thought, and provider-hidden native notes are never represented as PM-authored entries.
gui_related: false
gui_classification_reason: Authority semantics are runtime behavior; inspection UI is specified in assistant-chat-design.
depends_on: [WN-002, AMS-001]
unblocks: [WN-011]
acceptance_criteria:
  - Repeated retrieval of a note does not change its epistemic kind or freshness.
  - No tool or UI payload presents a notebook write as success evidence.
  - Provider-hidden content never appears as PM-authored note content.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: false_certainty
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/assistant-memory-subsystem.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N07
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N17
preserved_exact_tokens: ["never becomes Verified memory", "self-certify", "provider-private chain of thought"]
negative_constraints:
  - Do not upgrade certainty through retrieval, repetition, or checkpoint inclusion.
  - Do not scrape hidden native notes to populate notebook UI.
owner_hints: [Plans/Working_Notebook.md, Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/assistant-chat-design.md

### WN-009 - Small Resume Capsule And On-Demand Entries

```yaml
plan_unit_id: WN-009
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: The resume capsule is a bounded navigation aid containing current position, relevant unresolved issue(s), suggested next inspection, and selected exact note/runtime references. It is bounded to at most 512 estimated tokens AND 2 KiB UTF-8 before admission, and is further reduced by the existing selected/retrieved-context allocation owned by Prompt_Pipeline. Full notebooks are never injected by default and no growing per-turn index of every entry is maintained; topic entries load on demand through the notebook read tool within normal tool and admission limits. The capsule is not where required authoritative constraints live; mandatory instructions, approvals, and acceptance criteria always come from their owners during reconstruction.
gui_related: false
gui_classification_reason: Capsule sizing is context-budget behavior, not GUI work.
depends_on: [WN-001, PP-072]
unblocks: [WN-016]
acceptance_criteria:
  - Capsule size stays within the stated bounds and competes inside the existing admission budget.
  - Entries remain searchable and readable on demand without unconditional prompt insertion.
  - Required constraints survive reconstruction even when the capsule omits them.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: unbounded_injection
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N08
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C12
preserved_exact_tokens: ["512 estimated tokens", "2 KiB UTF-8", "navigation aid", "on demand"]
negative_constraints:
  - Do not inject the full notebook by default.
  - Do not create a second protected injection budget outside the Prompt_Pipeline allocation.
owner_hints: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Prompt_Pipeline.md

### WN-010 - Explicit Sharing And Derivation Restrictions

```yaml
plan_unit_id: WN-010
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: >-
  Sharing selects exact note revisions and explicit recipients under current permissions and phase
  policy; it never copies all author context. Derived notes, capsule selections, handoffs, summaries,
  and search projections preserve the restrictions of their sources: paraphrasing, relabeling, or
  partial quoting of Assistant-only memory, protected evidence, or private participant material cannot
  widen access. If exact dependency isolation is unavailable, affected derived blocks are excluded or
  rebuilt conservatively rather than silently declassified. Private working slices are not shared by
  default, including with blind-phase reviewers. Bytes already sent to a provider cannot be recalled;
  restriction changes invalidate only future dispatch use and say so. App notebook scratch keeps the
  same recipient/phase rules; explicit conversion/import never reclassifies private or Assistant-only
  content as shared Project material.
gui_related: false
gui_classification_reason: Restriction semantics are runtime/permission behavior, not GUI work.
depends_on: [WN-005, PS-120]
unblocks: []
acceptance_criteria:
  - A denied source cannot be laundered into access through note text, export, capsule, or handoff.
  - Revoking or muting a source removes its substantive content from future derivative dispatch and discloses the already-sent boundary.
  - Sharing a slice exposes exactly the selected revisions to exactly the permitted roster/phase.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: restriction_laundering
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Permissions_System.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-N12
- source_packet:PM-WNC-2026-09-05-v1:WNC-H05
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N3/N25/N26
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens: ["exact note revisions", "explicit recipients", "cannot widen access", "already sent"]
negative_constraints:
  - Do not widen access by paraphrase, relabel, partial quote, or export.
  - Do not share private working slices by default with blind reviewers.
owner_hints: [Plans/Working_Notebook.md, Plans/Permissions_System.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Permissions_System.md

### WN-011 - Promotion Uses Destination Owners

```yaml
plan_unit_id: WN-011
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "A note may propose promotion of eligible material to Assistant memory, a planning atom, a To-Do, or scoped instruction, but promotion always runs through the destination owner's existing gate: assistant-memory-subsystem verification for memory, explicit ledger capture for planning atoms, ToDoController proposal validation for To-Dos, and the agent-rules-context promotion contract for instructions. Each promotion records explicit source revision, target owner, admissibility decision, and outcome. Notebook capture never automatically approves, verifies, schedules, or changes destination state, and a rejected promotion leaves the original note with truthful state. Reference existence is not semantic proof; an unrelated commit or green test cannot verify the attached claim."
gui_related: false
gui_classification_reason: Promotion routing is runtime authority behavior, not GUI work.
depends_on: [WN-008, AMS-001, TDR-005]
unblocks: []
acceptance_criteria:
  - Every promotion carries source revision, target owner, admissibility result, and outcome.
  - An unsupported claim stays unverified at the destination and unchanged in the notebook.
  - No note write schedules, approves, or completes anything.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: authority_bypass
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/assistant-memory-subsystem.md, Plans/ToDo_Runtime.md, Plans/Planning_Ledger_System.md, Plans/agent-rules-context.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N13
  - source_packet:PM-WNC-2026-09-05-v1:WNC-M04
preserved_exact_tokens: ["destination owner", "explicit source revision", "truthful state", "Reference existence is not semantic proof"]
negative_constraints:
  - Do not promote notebook content into any destination state without that destination's owner gate.
  - Do not bypass memory evidence gates because content was once a note.
owner_hints: [Plans/Working_Notebook.md, Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/ToDo_Runtime.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/agent-rules-context.md

### WN-012 - Journal And Parent Summary Integration

```yaml
plan_unit_id: WN-012
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Worker notebooks integrate with the Attempt Journal and Parent Summary without duplicating either. The latest Attempt Journal stays retry-facing with only the most recent same-lineage journal injected, and the Parent Summary keeps its 5-10 line hard cap and independent handoff scope, both per Plans/agent-rules-context.md. A worker notebook extends accessible working detail: journal and summary may carry bounded references to deeper notebook entries, resolved through the notebook read tool by the next attempt when policy allows, instead of independently maintained duplicate summaries or full-history injection. Node retry reuses relevant lineage learning without inheriting unrelated histories."
gui_related: false
gui_classification_reason: Injection integration is prompt-context behavior, not GUI work.
depends_on: [WN-005, ARC-019, ARC-020]
unblocks: []
acceptance_criteria:
  - Latest-journal-only injection and the Parent Summary cap are unchanged.
  - Deeper notebook detail is reachable by reference without becoming full-history injection.
  - No second independently maintained retry summary exists.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: duplicate_summary_truth
reasoning_tier: standard
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/agent-rules-context.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N14
preserved_exact_tokens: ["latest Attempt Journal", "5-10 line hard cap", "by reference"]
negative_constraints:
  - Do not replace, edit, or duplicate the Attempt Journal or Parent Summary from notebook code paths.
  - Do not inject full notebook history into worker prompts.
owner_hints: [Plans/Working_Notebook.md, Plans/agent-rules-context.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/agent-rules-context.md, ContractName:Plans/orchestrator-subagent-integration.md

### WN-013 - Validity References And Staleness

```yaml
plan_unit_id: WN-013
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Entries that depend on evidence, worktree, revision, or environment state record applicable validity references carrying existing message/artifact/tool-result/commit/Plan/Goal/workflow identities with revision or hash information. When the referenced material changes materially, affected entries are labeled needs_revalidation with their historical provenance preserved; age alone neither proves falsity nor currentness. Stable references remain usable with correct historical qualification. Changed account identity affects scope and authorization and requires revalidation of access, but does not automatically falsify recorded facts.
gui_related: false
gui_classification_reason: Validity semantics are data-contract behavior, not GUI work.
depends_on: [WN-002]
unblocks: []
acceptance_criteria:
  - A stale experimental claim is labeled needs_revalidation and is not silently reused as current.
  - Unrelated stable facts are not discarded solely because the account changed.
  - Validity references resolve to existing identity systems without inventing new ones.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: stale_reuse
reasoning_tier: standard
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N15
preserved_exact_tokens: ["validity references", "needs_revalidation", "age alone neither proves falsity nor currentness"]
negative_constraints:
  - Do not treat age as truth or staleness by itself.
  - Do not auto-falsify facts because account identity changed.
owner_hints: [Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Multi-Account.md

### WN-014 - Lifecycle, Retention, And Deletion

```yaml
plan_unit_id: WN-014
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Entries move through active, superseded, archived, and tombstoned lifecycle states. A context reset or fresh-window transition is not note deletion; deleting a note is not deletion of its source history. Growth pressure review is eligible when a notebook exceeds 64 active entries or 1 MiB of active body text: resolved, unpinned, unrestricted material may archive under the storage retention owner while unresolved, pinned, restricted, and current-checkpoint-dependent material is preserved. Archive and tombstone states are reflected consistently in reads, search, exports, and restore. Current checkpoint dependencies cannot be silently purged; recovery holds apply under Plans/storage-plan.md."
gui_related: false
gui_classification_reason: Lifecycle semantics are data behavior, not GUI work.
depends_on: [WN-007, SP-255]
unblocks: []
acceptance_criteria:
  - Archived/tombstoned entries disappear from default reads but behave consistently across search, export, and restore.
  - Required checkpoint dependencies survive growth review.
  - Context reset leaves note state intact.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: silent_data_loss
reasoning_tier: standard
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/storage-plan.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N16
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A62
preserved_exact_tokens: ["active", "superseded", "archived", "tombstoned", "64 active entries", "1 MiB"]
negative_constraints:
  - Do not purge current checkpoint dependencies during retention.
  - Do not conflate context reset with deletion.
owner_hints: [Plans/Working_Notebook.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/storage-plan.md

### WN-015 - Notes Are Data, Not An Instruction Layer

```yaml
plan_unit_id: WN-015
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Retrieved note bodies are attributed task data. They cannot override current user intent, instruction precedence, tool policy, permission decisions, or approvals, and quoted hostile text or imported notes cannot promote themselves into system instructions. Notebook and capsule content passes through the same instruction/data separation, admission gates, and plugin-transform checks as ordinary prompt material; authority is resolved from owners, never from note prose. Import and injection fixtures preserve the instruction/data boundary.
gui_related: false
gui_classification_reason: Injection safety is prompt-assembly behavior, not GUI work.
depends_on: [WN-009, WN-010]
unblocks: []
acceptance_criteria:
  - Hostile or imported note content stays lower-trust data in every assembled prompt.
  - Authority and approval decisions never cite note prose as their basis.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: prompt_injection
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md, Plans/Permissions_System.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N10
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A12
preserved_exact_tokens: ["attributed task data", "cannot promote themselves into system instructions"]
negative_constraints:
  - Do not let note text override instruction precedence, tool policy, or approvals.
  - Do not create a notebook-specific shadow instruction registry.
owner_hints: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Permissions_System.md

### WN-016 - Notebook Checkpoint Content And Capture Failure Criticality

```yaml
plan_unit_id: WN-016
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "A notebook checkpoint records stable checkpoint identity, the exact required note revisions and capsule hash, Project/scope, relevant workflow checkpoint references, source/visibility/policy generations, and commit receipt data. Required checkpoints back context-window transitions: a transition depending on an unsaved required checkpoint may not discard its source context, and a failed required write produces a typed deferral/failure with the original recovery material preserved and no misleading saved-state claim. Optional capture failures are visible, retried at most once with the same idempotency identity, and need not stop unrelated safe work. A note file alone is never a side-effect checkpoint and never replaces pending tool receipts owned by their own owners."
gui_related: false
gui_classification_reason: Checkpoint content semantics are durability behavior, not GUI work.
depends_on: [WN-007, WN-009, SP-256]
unblocks: []
acceptance_criteria:
  - Required checkpoint failure denies the destructive transition and preserves recovery material.
  - Optional capture failure is visible and bounded, without blocking unrelated work.
  - No committed-checkpoint success is reported after a timeout or rejected write.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: false_durability
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md, Plans/storage-plan.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N11
  - source_packet:PM-WNC-2026-09-05-v1:WNC-C06
preserved_exact_tokens: ["required checkpoint", "optional capture failure", "no misleading saved-state", "not a side-effect checkpoint"]
negative_constraints:
  - Do not discard source context while a required checkpoint is unsaved or failed.
  - Do not present a note write as a tool-receipt replacement.
owner_hints: [Plans/Working_Notebook.md, Plans/Prompt_Pipeline.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Shared_Integration_Runtime.md

### WN-017 - Storage Families And Registry Disposition

```yaml
plan_unit_id: WN-017
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Notebook state persists through the existing PM storage stack (seglog/redb and existing search/artifact machinery) under storage-plan ownership: no SQLite, no required external notes service, no second transcript/event database. The canonical families are working_notebook_record, working_notebook_entry_record, notebook_checkpoint_record, and context_transition_record, registered in Plans/storage_value_registry.json as deferred_not_build_blocking with value schemas in Plans/working_notebook_contracts.schema.json. Amended 2026-10-31 (DL-270): each of the four families declares max_value_bytes of at most 16384 and is placed in the canonical or the derived redb file (SP-340); larger bodies use payload references (SP-337); no JSON mirror of notebook state is kept (SP-339). Notebook data is physically and logically separate from the restricted Assistant memory store. Notebook search indexes are rebuildable scoped projections with explicit watermarks; a committed write is directly readable from authoritative records regardless of index lag, and index failure never loses canonical note state."
gui_related: false
gui_classification_reason: Storage disposition is persistence behavior, not GUI work.
depends_on: [WN-001, SP-243]
unblocks: [WN-018]
acceptance_criteria:
  - Every notebook family has exactly one registry row with key shape, owner, retention, and redaction disposition.
  - Authoritative records, projections, indexes, rebuild, and artifacts have named ownership.
  - Rebuild from canonical note records works; stale index state is disclosed.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
risk_class: second_source_of_truth
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/storage-plan.md, Plans/storage_value_registry.json]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T01
  - source_packet:PM-WNC-2026-09-05-v1:WNC-T02
preserved_exact_tokens: ["deferred_not_build_blocking", "rebuildable scoped projections", "separate from the restricted Assistant memory store"]
negative_constraints:
  - Do not add SQLite, an external notes dependency, or a second transcript store.
  - Do not write notebook data into Assistant memory storage.
owner_hints: [Plans/Working_Notebook.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

### WN-018 - Project-Scoped Settings And No-Project Behavior

```yaml
plan_unit_id: WN-018
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: >-
  Notebook behavior preferences resolve through Settings_System at the row's admitted Everywhere,
  Computer and optional Project levels: memory.notebook.auto-capture=true,
  memory.notebook.resume-capsule=true, memory.notebook.capsule-budget-tokens=512 and
  memory.notebook.injection-budget-tokens=1024. Budgets are ceilings, not reservations, further
  reduced by Prompt_Pipeline allocation. WN-021 admits thread-scoped app scratch without a Project
  Vault. Settings transfer carries behavior values only, never notebook bodies, checkpoints, recipient
  authority or references as content.
gui_related: false
gui_classification_reason: Settings registration is configuration data; the Settings pane itself is owned by FinalGUISpec/Settings_System patterns.
depends_on: [WN-004, WN-017]
unblocks: []
acceptance_criteria:
- The four exact setting IDs/types/defaults use the one inventory/resolver and work without a Project at admitted
  levels.
- Disabling auto-capture neither shares/deletes notes nor disables mandatory checkpoints.
- App scratch access remains thread/participant-scoped; conversion fences transfer before destination Vault activation.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-implementation-readiness
  - python3 scripts/pm-plans-verify.py json-syntax
risk_class: settings_scope_creep
reasoning_tier: standard
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Settings_System.md, Plans/settings_inventory.json]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-X04
- source_packet:PM-WNC-2026-09-05-v1:WNC-A13
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N24/N26
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens: ["memory.notebook.auto-capture", "memory.notebook.resume-capsule", "memory.notebook.capsule-budget-tokens", "memory.notebook.injection-budget-tokens", "ceilings, not reservations"]
negative_constraints:
- Do not put notebook content in ordinary settings, export, mirrors or copied setup values.
- Do not add an ambient all-chat notebook, a fabricated Project Vault or a second notebook runtime.
owner_hints: [Plans/Working_Notebook.md, Plans/Settings_System.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Settings_System.md

### WN-019 - User Correction And Revision Visibility Semantics

```yaml
plan_unit_id: WN-019
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Users can add and correct notes through attributed, revision-safe actions owned by this contract and rendered through the chat and Orchestrator surfaces specified in Plans/assistant-chat-design.md and Plans/Orchestrator_Page.md. A user correction is attributed and supersedes affected content while preserving history under retention. In-flight model requests retain their original receipt-bound snapshot; a concurrent user edit invalidates future dependent assembly when necessary and surfaces stale-edit conflicts rather than claiming to edit bytes already sent. Notebook surfaces expose author, evidence references, revisions, and included-context status without flooding the transcript with every note update.
gui_related: true
gui_classification_reason: This unit defines the user-visible correction/revision affordance semantics rendered by chat and Orchestrator notebook surfaces.
depends_on: [WN-007]
unblocks: []
acceptance_criteria:
  - Concurrent user edit produces a visible stale-edit conflict path, never a silent rewrite of sent bytes.
  - Notebook inspection shows author, evidence, revisions, and included-context status.
  - No permanent rail, no per-update transcript spam.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
risk_class: stale_edit_conflict
reasoning_tier: standard
context_scope: working_notebook_ui
implementation_surfaces: [Plans/Working_Notebook.md, Plans/assistant-chat-design.md, Plans/Orchestrator_Page.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X02
  - source_packet:PM-WNC-2026-09-05-v1:WNC-X01
preserved_exact_tokens: ["revision-safe", "receipt-bound snapshot", "stale-edit conflicts"]
negative_constraints:
  - Do not silently rewrite in-flight request bytes.
  - Do not flood the transcript with every note update.
owner_hints: [Plans/Working_Notebook.md, Plans/assistant-chat-design.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Orchestrator_Page.md

### WN-020 - Tool Surface Mapping And Typed Errors

```yaml
plan_unit_id: WN-020
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: "Agent-facing notebook operations are registered in Plans/Tools.md as notebook_search, notebook_read, notebook_write, notebook_supersede, and fresh_context_request, with chatread providing exact bounded history reads. This owner fixes the logical semantics: search and read enforce identical scope/permission checks with cursor/range behavior and explicit truncation; writes are CAS/idempotent with bounded input; supersede/archive/tombstone run through owner policy; fresh_context_request is a request that never performs admission itself. The typed error vocabulary maps onto the existing normalized tool-result taxonomy: notebook_scope_unavailable, notebook_denied, notebook_not_found (nondisclosing), notebook_stale_revision, notebook_stale_policy_generation, notebook_invalid_range, notebook_limit_exceeded, notebook_source_unavailable, notebook_index_lag, notebook_route_unsupported, notebook_checkpoint_failed, transition_deferred, transition_cancelled, and transition_retry_exhausted. Missing, denied, and lag stay distinct internally without leaking forbidden existence in user/model-facing responses."
gui_related: false
gui_classification_reason: Tool semantics are runtime contracts, not GUI work.
depends_on: [WN-005, T-044]
unblocks: []
acceptance_criteria:
  - Every operation has concrete request/result/error shapes, scope checks, bounds, and budgets in Tools.md.
  - No whole-notebook wildcard write or unrestricted cross-agent read exists.
  - Search and read apply the same restriction checks at read time.
validation_surfaces:
  - python3 scripts/pm-working-notebook-contracts.py validate
  - Plans/working_notebook_contract_fixtures.json
risk_class: tool_surface_ambiguity
reasoning_tier: high
context_scope: working_notebook
implementation_surfaces: [Plans/Working_Notebook.md, Plans/Tools.md]
node_compile_hint: {mode: semantic_owner_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N09
  - source_packet:PM-WNC-2026-09-05-v1:WNC-H02
preserved_exact_tokens: ["notebook_search", "notebook_read", "notebook_write", "notebook_supersede", "fresh_context_request", "chatread", "transition_retry_exhausted"]
negative_constraints:
  - Do not expose an unregistered candidate as a working command or tool.
  - Do not leak denied existence through error differentials.
owner_hints: [Plans/Working_Notebook.md, Plans/Tools.md]
```

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Tools.md

## 3. Contracts, Schemas, Events, Or Data Shapes

### Identity and scope

Notebook identity remains `notebook_id=nb_{ulid}` and entry identity `entry_id=wne_{ulid}`, stable across revisions. The versioned scope envelope binds either its exact Project or application scope with `project_id=null`, actual Server/Computer and parent thread/Crew identity. Existing five kinds and their restricted recipients remain:

| Scope kind | Binding (existing identity) | Default exposure |
|---|---|---|
| `thread` | exact place + thread_id (`thr_{ulid}`), actual owning Computer; Project optional only for the admitted app form | That thread's Assistant and authorized user, never other app threads. |
| `worker_lineage` | project_id + node/attempt lineage (run_id/node_id/attempt_id per Plans/Executor_Protocol.md) | The relevant worker and authorized recovery paths; not unrelated workers. |
| `coordinator_run` | exact place + admitted coordinating run identity; a Project package exists only when actually bound | Authorized coordinating and recovery actors. |
| `participant` | collaboration_run_id + participant_slot_id (Plans/Collaborative_Workflows.md) | That participant under current protocol; blind-phase restrictions apply. |
| `shared_slice` | collaboration_run_id + explicit recipient/phase policy | Only the permitted roster/phase; no ambient cross-agent access. |

A copy or export receives destination-owned identity with restricted lineage; source identities are not reusable credentials.

### Entry envelope

Project forms remain exact; WN-021 selects the separately versioned app envelope and matching checkpoint/operation schemas with explicit place/Computer/thread joins. Strict schema: `Plans/working_notebook_contracts.schema.json` (`$defs.working_notebook_entry_record`). Required envelope fields: `schema_id`, `notebook_id`, `entry_id`, `project_id`, `scope` (kind + binding refs), `revision` (monotonic integer + `revision_cas`), `author` (kind `user|agent|system` + actor ref), `created_at_utc`, `updated_at_utc`, `lifecycle` (`active|superseded|archived|tombstoned`), `epistemic_kind` (`hypothesis|observation|rejected_approach|reference|continuation|user_note`), `freshness` (`current|needs_revalidation|source_unavailable`), `body` (bounded UTF-8, at most 16 KiB inline), `payload_ref?` (content-addressed BLAKE3 payload-store reference, required when the body exceeds 16 KiB; the inline body is then a bounded excerpt or empty), `body_sha256`, `provenance_refs[]` (existing message/artifact/tool-result/commit/Plan/Goal/workflow identities), `validity_refs[]`, `restriction_refs[]` (effective restrictions inherited from sources), `supersedes_entry_revision?`. Revision mutations carry `request_id` (idempotency identity), `expected_revision`, `actor`, `policy_generation`, `operation`, and a typed outcome.

### Resume capsule and checkpoint

The WN-021 app variant carries the same exact scope and writer refs through capsule, checkpoint and every read/write/backup edge. Original Project schemas remain unchanged. `ResumeCapsule`: `notebook_id`, `scope`, `source_revisions[]`, `current_position`, `unresolved_issues[]`, `suggested_next_inspection`, `selected_refs[]`, `estimated_tokens`, `body_bytes`; bounds: at most 512 estimated tokens AND 2 KiB UTF-8 before admission. `notebook_checkpoint_record`: `checkpoint_id` (`nbc_{ulid}`), `notebook_id`, `project_id`, `required_entry_revisions[]`, `capsule_sha256`, `workflow_checkpoint_refs[]`, `source_visibility_generation`, `policy_generation`, `stop_epoch_observed`, `commit_receipt_ref`, `sequence`, `state` (`preparing|committed|failed|superseded`). The commit protocol (one data sync per commit group with the durable watermark inside the segment, manifest synced only at creation, rotation and structural change; read-after-commit) is owned by `Plans/storage-plan.md` (SP-336); this owner fixes required content. A notebook_checkpoint commit that gates a transition is a barrier-class event and takes a full flush. Amended 2026-10-31 (DL-270): SP-336; entry body limits: SP-337 (16 KiB inline, store-once payloads), SP-340 (16 KiB redb value cap).

### Tool surface

Logical operations and canonical names (registered in `Plans/Tools.md`): `notebook_search` (list/find within authorized scope; default 5 hits, hard 10 per page; snippets at most 512 bytes each; total response at most 8 KiB including metadata), `notebook_read` (exact entry revision and bounded region; default 8 KiB, hard 32 KiB per response, plus the available token-budget limit; explicit range convention, UTF-8-safe, never mixed byte/character offsets), `notebook_write` (create/update/append with CAS/idempotency and bounded input), `notebook_supersede` (supersede/archive/tombstone through owner policy), `fresh_context_request` (request a context-window transition through the Prompt_Pipeline owner; a request never performs admission), and `chatread` (exact bounded history read by stable message/item identity, complementing `chatsearch`). All bounds are ceilings further reduced by the live token budget; current available budget may narrow any response.

### Typed errors and budgets

Error vocabulary and mapping to `Plans/Tools.md` normalized outcomes are fixed in WN-020. Packet-canonicalized defaults (engineering resolutions, replaceable only with recorded reasons): capture is materiality-triggered and lazy; retry at most one automatic retry per failed transition/checkpoint transport operation with the same idempotency identity; growth review at 64 active entries or 1 MiB active body text; pressure thresholds reuse model-owned 70%/85% behavior; checkpoint reserve reuses the existing contingency budget bucket rather than stacking a new pool. Capsule and entry injection compete inside the existing selected/retrieved-context allocation: capsule plus entries total at most 1,024 estimated tokens AND 4 KiB, further reduced by admission.

### Event candidates (disposition: not registered)

The following durable event families are specified as candidates with planned payload minima; none is registered in `Plans/event_family_registry.json` at this Plans stage, no handler exists, and no emission is claimed. Registration (payload schemas under `Plans/event_payloads/notebook/`, registry rows, retention assignment) is runtime-wave work through the event authority. Until registered, any such event is unknown/quarantined per the registry's `unknown_event_disposition`.

| Planned event_type | Payload minima | Disposition |
|---|---|---|
| `notebook.entry_committed` | notebook_id, entry_id, revision, explicit place/nullable project_id, actual Computer/thread, scope kind (candidate only) | candidate_not_registered |
| `notebook.entry_superseded` | notebook_id, entry_id, old/new revisions, actor | candidate_not_registered |
| `notebook.checkpoint_committed` | checkpoint_id, notebook_id, required revisions hash, commit receipt ref | candidate_not_registered |
| `notebook.checkpoint_failed` | checkpoint_id, typed failure reason | candidate_not_registered |
| `notebook.transition_state_changed` | transition_id, from/to state, reason | candidate_not_registered |

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md

<!-- W3G phase 1 owner block: newly authored, prepared without admission. -->

### WN-1514 - notebook.checkpoint_committed: prepared event contract

```yaml
plan_unit_id: WN-1514
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Newly authored owner contract for notebook.checkpoint_committed alone under deck-2 9.a A (DL-450);
  prepared without admission. preparing becomes committed only after every required original entry revision, capsule
  and workflow checkpoint dependency is durable and directly readable. The original required-set owner supplies
  the full set; a caller cannot omit a slot. Full flush precedes committed publication. The note checkpoint never
  substitutes for a pending tool receipt or proves a side effect.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Working_Notebook.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.checkpoint_committed
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** WorkingNotebook checkpoint owner at the Storage barrier-class commit boundary. Reuse WN-016/017/021, SP-256/SP-336 and exact notebook_checkpoint_record plus the complete original required entry-revision/capsule/workflow dependency set. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

**Payload and scope.** CV-1514 selects `Plans/event_authority_w3g/payloads/notebook_checkpoint_committed.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. preparing becomes committed only after every required original entry revision, capsule and workflow checkpoint dependency is durable and directly readable. The original required-set owner supplies the full set; a caller cannot omit a slot. The payload `required_revisions_sha256` is SHA-256 of the existing CV-317 RFC 8785 encoding of the complete original ordered `required_entry_revisions` array, recomputed from that array at every check; a well-formed digest of any other array (reordered, partial or substituted) is refused as `checkpoint_required_set_refused` even when the required set, its custody and the capsule hash are intact. Full flush precedes committed publication. The note checkpoint never substitutes for a pending tool receipt or proves a side effect.

**Replay, consumer and checkpoints.** SP-1514 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.notebook.checkpoint_committed.history.v1@1.0.0` is the sole newly authored family history reader for Notebook/Context Details history; continuation still requires its native admission. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1514 binds retention as `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608 (Plans/storage-plan.md:17638 and :17649): no age or count expiry and no new count allowance; explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt and source keep their own lifetimes. No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1263` and the `notebook.checkpoint_committed` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1514, ContractName:Plans/storage-plan.md#SP-1514

### WN-1515 - notebook.checkpoint_failed: prepared event contract

```yaml
plan_unit_id: WN-1515
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Newly authored owner contract for notebook.checkpoint_failed alone under deck-2 9.a A (DL-450);
  prepared without admission. A preparing checkpoint becomes failed only on its actual typed reason. Required failure
  defers destructive context transition and preserves source context. Optional capture failure is visible and has
  at most one transport retry under the same original identity. No committed checkpoint, discarded source or success
  receipt is claimed.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Working_Notebook.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.checkpoint_failed
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** WorkingNotebook checkpoint owner on an originally recorded typed capture/commit failure. Reuse WN-016/020/021 and exact failed notebook_checkpoint_record or original typed failure result preserving recovery material. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

**Payload and scope.** CV-1515 selects `Plans/event_authority_w3g/payloads/notebook_checkpoint_failed.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. A preparing checkpoint becomes failed only on its actual typed reason. Required failure defers destructive context transition and preserves source context. Optional capture failure is visible and has at most one transport retry under the same original identity. No committed checkpoint, discarded source or success receipt is claimed.

**Replay, consumer and checkpoints.** SP-1515 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.notebook.checkpoint_failed.history.v1@1.0.0` is the sole newly authored family history reader for Notebook/Context Details history; continuation still requires its native admission. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1515 binds retention as `RP-OPERATIONAL-2555D@1.0.0` for its Project records, assigned by DL-455 (E-CARDS-3 item 3.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608 (Plans/storage-plan.md:17659 and :17669): seven years (220,752,000 seconds) sharing the existing 2,000,000-entry seven-year Project allowance; Storage's Project first-save anchor adapter for that policy (DL-455, DL-457; :17675) lists this type among its change, failure and refusal entries (:17681), so the anchor is the entry's own first durable save unless an independently saved original supplies its own proved first-save time; retry, reprocessing, recovery and restore never restart it. Its application records use `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (DL-455's separate 2,000,000-entry application allowance, count key `app:operational_security`, `anchor_kind=creation`: the first successful save that survives a restart, 220,752,000 seconds). No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1263` and the `notebook.checkpoint_failed` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1515, ContractName:Plans/storage-plan.md#SP-1515

### WN-1516 - notebook.entry_committed: prepared event contract

```yaml
plan_unit_id: WN-1516
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Newly authored owner contract for notebook.entry_committed alone under deck-2 9.a A (DL-450); prepared
  without admission. Birth is entry revision 1 with expected_revision 0; every update/append is expected_revision+1
  under CAS. An attributed original commit is directly readable regardless of search lag. Flexible note bodies stay
  behind refs and retain epistemic kind, freshness and inherited restrictions. No note becomes memory verification,
  execution permission or completion.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Working_Notebook.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.entry_committed
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** WorkingNotebook notebook_write or authorized user correction through the same original revision/CAS owner. Reuse WN-006/007/019/021, original notebook_revision_mutation and exact working_notebook_entry_record revision/body hash/restrictions. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

**Payload and scope.** CV-1516 selects `Plans/event_authority_w3g/payloads/notebook_entry_committed.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. Birth is entry revision 1 with expected_revision 0; every update/append is expected_revision+1 under CAS. An attributed original commit is directly readable regardless of search lag. Flexible note bodies stay behind refs and retain epistemic kind, freshness and inherited restrictions. No note becomes memory verification, execution permission or completion.

**Replay, consumer and checkpoints.** SP-1516 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.notebook.entry_committed.history.v1@1.0.0` is the sole newly authored family history reader for Notebook/Context Details history; continuation still requires its native admission. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1516 binds retention as `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608 (Plans/storage-plan.md:17638 and :17649): no age or count expiry and no new count allowance; explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt and source keep their own lifetimes. No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1263` and the `notebook.entry_committed` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1516, ContractName:Plans/storage-plan.md#SP-1516

### WN-1517 - notebook.entry_superseded: prepared event contract

```yaml
plan_unit_id: WN-1517
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Newly authored owner contract for notebook.entry_superseded alone under deck-2 9.a A (DL-450); prepared
  without admission. An actual active entry revision is superseded by its recorded successor under exact CAS. Both
  immutable revisions and attributed old/new linkage remain. Supersession is not deletion, verification or cross-scope
  sharing; an unchanged retry does not append another event. In-flight model bytes retain the old bound revision.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Working_Notebook.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.entry_superseded
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** WorkingNotebook notebook_supersede and the original attributed successor-revision owner. Reuse WN-007/010/014/019/021, exact original superseded entry revision and original successor link under notebook restriction/CAS custody. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

**Payload and scope.** CV-1517 selects `Plans/event_authority_w3g/payloads/notebook_entry_superseded.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. An actual active entry revision is superseded by its recorded successor under exact CAS. Both immutable revisions and attributed old/new linkage remain. Supersession is not deletion, verification or cross-scope sharing; an unchanged retry does not append another event. In-flight model bytes retain the old bound revision.

**Replay, consumer and checkpoints.** SP-1517 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.notebook.entry_superseded.history.v1@1.0.0` is the sole newly authored family history reader for Notebook/Context Details history; continuation still requires its native admission. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1517 binds retention as `RP-AUTHORITY-INDEFINITE@1.0.0` in its Project and application scopes, assigned by DL-453 (E-CARDS-3 item 1.a, option A) as Storage's third-sitting retention assignments record it on main f8b2098608 (Plans/storage-plan.md:17638 and :17649): no age or count expiry and no new count allowance; explicit Project or application data deletion and storage-pressure refusal apply exactly as DL-453 states, and the native record, receipt and source keep their own lifetimes. No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1263` and the `notebook.entry_superseded` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1517, ContractName:Plans/storage-plan.md#SP-1517

### WN-1518 - notebook.transition_state_changed: prepared event contract

```yaml
plan_unit_id: WN-1518
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: Newly authored owner contract for notebook.transition_state_changed alone under deck-2 9.a A (DL-450);
  prepared without admission. Record an actual owner transition along requested -> preparing -> checkpointed ->
  admitted -> activated -> recovered_resumed, or its defined terminal deferred/denied/failed/cancelled edge from
  a nonterminal state. Each exact source transition has one original identity; unchanged reads/replay create none.
  Changed route/account/Stop/generations require safe owner re-admission, never invented activation. Observable
  activation and complete checkpoint/admission evidence precede the respective success edges; recovery resumes no
  stopped work.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- CV-317
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- The complete original source satisfies the exact family transition and admission predicate.
- Retry returns the original result without a new effect; inspection never becomes action authority.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Working_Notebook.md
- Plans/event_authority_w3g
node_compile_hint:
  mode: event_contract_draft
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- W3G phase 1; deck-2 answer 9.a A (DL-450), 2026-11-05
- reports/event-authority-20261105/W3G.md
preserved_exact_tokens:
- notebook.transition_state_changed
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

**Producer and original source.** SharedIntegrationRuntime context-transition lifecycle owner; Notebook supplies required content only. Reuse Prompt_Pipeline proactive fresh-window request/admission section, SIR-042, WN-016/021 and original context_transition_record/admission receipt. Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply.

**Payload and scope.** CV-1518 selects `Plans/event_authority_w3g/payloads/notebook_transition_state_changed.schema.json` at each named closed selector in `Plans/event_authority_w3g/contracts.json`. Project and application are distinct new selectors; app has real Server/Computer/thread and null Project. Payload identity must match the native source and Contracts_V0 EventRecord. Payloads carry refs/hashes and closed scalar facts, never Plan documents, notebook bodies, research propositions, Goal objective text, secrets or private content. Record an actual owner transition along requested -> preparing -> checkpointed -> admitted -> activated -> recovered_resumed, or its defined terminal deferred/denied/failed/cancelled edge from a nonterminal state. Each exact source transition has one original identity; unchanged reads/replay create none. Changed route/account/Stop/generations require safe owner re-admission, never invented activation. Observable activation and complete checkpoint/admission evidence precede the respective success edges; recovery resumes no stopped work.

**Replay, consumer and checkpoints.** SP-1518 adopts SP-286/CV-339 strict stored-v2 first-receipt custody and `storage.first_append_receipt.resolve_full_value.v1`, preserving the original eleven receipt fields and whole original EventRecord commitment. `reader.notebook.transition_state_changed.history.v1@1.0.0` is the sole newly authored family history reader for Notebook/Context Details history; continuation still requires its native admission. It adopts SP-278's `projector.storage.event_record_index@1.0.0`, `reader.storage.event_record_index@1.0.0` and exact generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}` / `Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint`. This family intentionally has no persisted filtered projection or private checkpoint. Its reader scans the entire captured generic global range, filters this exact event/scope/subject, returns authenticated observations, and holds only the current read's ten-field token. Any stored resume token has only SP-278/DL-076's nine durable fields, never redb_snapshot_id. Only the generic projector advances its existing checkpoint, atomically with rows under full CAS. Empty matching results still require complete examined coverage; missing source is unavailable. History cannot drive another command, notification, provider request, charge, note write, resume, completion or approval.

**Custody, retention and withdrawal.** Original custody means the genuine original owner-issued record/result and transaction, not an event-shaped caller object, digest alone, current cache or supplied success boolean. Resolve the full named native source using its selected exact schema/codec; independently compare all copied identities, state, version, revision, refs and hashes at entry and after returning helpers, immediately before append/release. Source bodies remain with their existing owners and lifetimes. A valid retained original is inspected against its authenticated original edition without reacquiring mutable current source state; current access/deletion/withdrawal checks still apply. SP-1518 binds retention as `RP-RUNTIME-365D@1.0.0`. Case L-3 Runtime/run/node/attempt and SP-256 context_transition_record assignment; require the actual original run lineage/completion anchor, never window or provider-session identity. No reference extends the linked body's retention. Withdrawal first fences this exact producer/schema selector at append admission, drains or preserves original pending operations without undoing committed native effects, and records the cutoff through existing Storage migration/registry ownership. Current consumption of the withdrawn selector stops; held/staged/current generic index generations cannot bypass it. Rebuild the generic index only from surviving authentic originals under SP-278; never rewrite event bytes, relabel an old schema, rehash a retained original, revive purged content or infer an absent admission. Retained audit uses its original edition and current access/hold/deletion policy, explicitly disclosing a withdrawn/unsupported selector as unavailable rather than executing it. Future/unknown editions fail closed. No family is admitted by this phase.

**Criterion 12.** `ATS-1263` and the `notebook.transition_state_changed` entry in `Plans/event_authority_w3g/oracle_plan.json` name each planned positive and single-defect negative. Executable fixtures and shared guard-isolation proof are phase 2; criterion 12 remains PARTIAL.

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1518, ContractName:Plans/storage-plan.md#SP-1518

## 4. Integration Surfaces

| Surface | Integration | Owner of surface |
|---|---|---|
| Assistant Chat thread | Thread-scope notebook opens as an ordinary editor/detail tab; entry, correction, inspection states per WN-019 | `Plans/assistant-chat-design.md` |
| Context Details / Usage | Capsule/notebook contributions and transition reason disclosed; fresh-context request separately labeled from Compact Now | `Plans/assistant-chat-design.md`, `Plans/usage-feature.md` |
| Orchestrator | Notebook access for selected run/worker through existing detail surfaces | `Plans/Orchestrator_Page.md` |
| Workers/coordinators | worker_lineage and coordinator_run scopes; journal/summary references | `Plans/orchestrator-subagent-integration.md`, `Plans/agent-rules-context.md` |
| Collaboration | Participant slices and shared findings as projections; blind-phase protection | `Plans/Collaborative_Workflows.md` |
| Memory | Promotion requests through verification gates; no memory payload leakage | `Plans/assistant-memory-subsystem.md` |
| Prompt assembly | Capsule admission inside the one budget; reconstruction from owner state | `Plans/Prompt_Pipeline.md` |
| Providers | One effective controller; native opacity; capability resolution | `Plans/CLI_Bridged_Providers.md`, `Plans/Models_System.md` |
| Usage | Helper attribution, exactly-once, occupancy vs cumulative | `Plans/usage-feature.md` |
| Storage/backup/host | Owned families, backup participation, lease fencing | `Plans/storage-plan.md`, `Plans/Backup_Restore_System.md`, `Plans/Project_Sync_and_Backbone.md` |
| Settings | memory.notebook.* Project-scoped values | `Plans/Settings_System.md` |
| Commands/UI wiring | cmd.chat.open_working_notebook, cmd.chat.request_fresh_context, cmd.orchestrator.open_notebook catalog rows; fail-closed until production wiring exists | `Plans/UI_Command_Catalog.md`, `Plans/UI_Wiring_Rules.md` |

Internal notebook state writes performed inside read-only work (ask/plan modes) are explicitly policy-limited sidecar writes to PM-owned notebook storage. They never confer target-project mutation authority, never widen tool or external-write ceilings, and never require switching to regular/yolo modes.

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/UI_Command_Catalog.md

## 5. Validation And Acceptance

Static contract validation is materialized as `Plans/working_notebook_contracts.schema.json` plus positive and negative fixtures in `Plans/working_notebook_contract_fixtures.json`, validated by `scripts/pm-working-notebook-contracts.py` (named subcheck `validate-working-notebook-contracts` in `scripts/pm-plans-verify.py run-gates`), registered as ATS-046 in `Plans/Automated_Testing_System.md`. Static validation covers schema shape and explicitly encoded invariants only. Negative fixtures represent denied, stale, conflicted, oversized, hostile-import, malformed-tool-argument, success-state, and crash-cut-point cases as rejected inputs attributed to the mutated location; pinned fixture inventory (expected negative ids, family minimums, anchor records, per-tool coverage, and the 62-scenario acceptance map) makes deleted coverage a validation failure. They do not execute runtime behavior.

Runtime proof remains NOT_RUN: native handler behavior, provider interaction, crash recovery, permission enforcement at runtime, visual quality, and performance are future work and are not claimed by this packet. Scenario-to-owner mapping for all 62 acceptance scenarios lives in `Plans/.audits/wnc-20260905/implementation/acceptance_coverage.jsonl`.

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Automated_Testing_System.md

## 6. Plan-To-Node Readiness

This owner is specification-only for this packet: node_compile_hint on every unit sets `create_worknodes: false` and `create_nodeseeds: false`. No WorkNodes, NodeSeeds, candidates, executable build queues, or activation receipts are created. Future WorkNode integration is described only as readiness metadata. PNC-019 and other runtime readiness blockers are neither unlocked nor claimed.

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Plan_To_Node_Compilation.md

## 7. Deferred, Retired, Compatibility, And Non-Goals

Non-goals: the notebook is not Assistant memory, not a ledger, not a Plan/To-Do/Goal, not an execution receipt, not a rules source, not a completion gate, not a second context compiler, not a notes sync service, and not a provider-private notes mirror. There is no ambient all-project notebook, no default cross-thread injection, no per-message helper model call, no SQLite, and no settings-based transmission of note bodies. Historical uploaded prompt chains, old child-Goal/phase/tranche designs, old tiers, and SQLite suggestions are lineage only and are not revived. Semantic-finding/closure conventions for this work item follow `Plans/Plan_Document_System.md` PDS-014 without redefining them.

Deferred to explicitly authorized future runtime work: event family registration and payload schemas, native tool/command handlers and production wiring rows, real storage materialization of the deferred families, and every runtime proof layer listed in Section 5.

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Plan_Document_System.md

## 8. Source Lineage And Governance

Source lineage for this owner is the approved user direction handed off through packet `PM-WNC-2026-09-05-v1` (work item `wnc-20260905`); requirement IDs `WNC-*` are packet source IDs, not production identifiers. Implementation evidence, coverage records, and validation logs live under `Plans/.audits/wnc-20260905/implementation/` and are process artifacts, not canonical product evidence. Governance seal (shards, evidence, plan index, Spec Lock) is a separate phase per `Plans/Decision_Policy.md` after canonical inputs stabilize. Engineering defaults recorded in Section 3 are packet-authored resolutions within the approved scope; hard authority boundaries were not changed by tuning decisions.

ContractRef: ContractName:Plans/Working_Notebook.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Plan_Document_System.md

### WN-021 - App Scratch Notebook And Fenced Project Conversion

```yaml
plan_unit_id: WN-021
unit_type: requirement
status: accepted
owner_doc: Plans/Working_Notebook.md
canonical_text: A notebook binds place plus thread or its existing worker_lineage/coordinator_run/participant/shared_slice
  identities. No project uses genuine application scope, project_id=null with actual Server/Computer/thread
  identity in the app writer's custody; it has no Project Vault or Project Home Server identity. Thread
  scratch is lazy, private to that thread and its authorized Assistant/user. An admitted app Crew may
  use only its explicit participant/shared_slice policy, never another thread's scratch. Existing five
  scope kinds, host-filled metadata, entry/revision CAS, idempotency, source restrictions, 16 KiB inline/64
  KiB request limits, payload-store spills, capsule and checkpoint budgets, retention/holds and event-candidate
  dispositions remain. No projects.* read grant exposes notebook content; cross-Project sharing still
  requires the existing explicit restricted import. Both conversion choices include exact entry revisions/checkpoint/payload
  refs and target Vault in the manifest. PSB fencing settles or pauses writers, verifies source/destination,
  copies/checks content, then completes the fenced cutover of the live association; partial cross-Computer
  transfer stays paused/unlisted with Resume/Cancel. Destination identities retain source lineage/restrictions
  and fresh authority. The sealed source serves only eligible move Undo and independent owner holds; it
  cannot stay writable or restart. Conversion expiry does not delete canonical retained checkpoints or
  shared payloads still referenced by their owners. Settings only resolves behavior preferences, never
  notebook bodies or authority. CV-366 selects Plans/application_workflow_contracts.schema.json roots
  WorkingNotebookApplicationV1, WorkingNotebookEntryApplicationV1 and WorkingNotebookCheckpointApplicationV1,
  with OriginalNotebookMutationSource in Plans/application_workflow_sources.schema.json and the complete
  Plans/application_workflow_source_graph.json adoption map. SP-349 alone owns working_notebook_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(notebook_id)},
  working_notebook_entry_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(notebook_id)}:{hex(entry_id)}
  and notebook_checkpoint_record.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(notebook_id)}:{hex(checkpoint_id)}.
  Logical editions use .application.v1 version 1.0.0; proposed notebook v2:app keys are not aliases. Exact
  Project sources/codecs remain unchanged. Native writer, source, checkpoint, retained payload and coherent
  Full Server Backup joins must all be admitted before application mutation; absent registration stays
  unavailable.
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- WN-004
- WN-005
- WN-007
- WN-010
- WN-014
- WN-017
- WN-018
- PSB-007
- CV-366
- SP-349
unblocks: []
acceptance_criteria:
- A talk-only trivial app chat produces no empty notebook or fake usage call.
- App and Project notebooks cannot cross thread/place/participant visibility by opaque ID, derived summary
  or projects.*.
- Conversion, interruption, retry and Undo maintain one live writer and exact revision/payload/restriction
  lineage; current holds outlive Undo.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Working_Notebook.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N24/N25/N26
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#5;7.12
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-B01
preserved_exact_tokens:
- place plus thread
- project_id=null
- thread
- worker_lineage
- coordinator_run
- participant
- shared_slice
- 16 KiB
- 64 KiB
negative_constraints:
- Do not fabricate a Project Vault, a sixth notebook kind, an ambient shared scratch notebook or a provider-private
  notebook store.
- Do not interpret copied note text as verification, authorization or relaxed recipient access.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Working_Notebook.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Working_Notebook.md#WN-021, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365
