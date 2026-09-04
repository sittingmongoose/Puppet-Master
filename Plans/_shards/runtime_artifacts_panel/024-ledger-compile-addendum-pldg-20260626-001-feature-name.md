# Shard 024: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Runtime_Artifacts_Panel.md`

Source lines: L1013-L1423

Source SHA256: `5dcc95a6d7612a7134741da4fa5e6a32f6c621f3fbb994351902e7460ee7bd51`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### RAP-034 - History Runtime Artifact And Evidence Projection

```yaml
plan_unit_id: RAP-034
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: History rows preserve links to runtime artifacts, evidence, ledger/raw records, usage, package manifests,
  and receipts through stable source refs rather than path-only summaries. The Runtime Artifacts surface consumes
  the unified History projection for preview/inspect affordances while resolving immutable source records for opens,
  evidence profiles, exports, and authority-gated actions. Raw records and evidence are included in exports only
  through an explicit evidence/redaction profile.
gui_related: true
gui_classification_reason: Runtime artifact/evidence links are user-visible panels and inspector content.
depends_on:
- OP-026
- SP-219
- POA-051
unblocks:
- OP-027
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_artifact_link_loss
reasoning_tier: standard
context_scope: history_runtime_artifacts
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- future History artifact/evidence inspector
node_compile_hint:
  mode: history_artifact_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0009
- pldg-20260626-001-feature-name:atom-0012
- pldg-20260626-001-feature-name:atom-0017
- pldg-20260626-001-feature-name:atom-0038
- pldg-20260626-001-feature-name:atom-0041
- pldg-20260626-001-feature-name:atom-0042
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0048
- pldg-20260626-001-feature-name:atom-0049
- pldg-20260626-001-feature-name:atom-0062
- chat:misc-history-scope
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- chat:history-defaults-answers
- chat:history-export-granularity-answer
- chat:history-export-compare-archive-answers
- chat:history-source-index-answer
- chat:history-pressure-test-request
- chat:history-pressure-test-defaults-answer
source_atom_ids:
- atom-0009
- atom-0012
- atom-0017
- atom-0038
- atom-0041
- atom-0042
- atom-0047
- atom-0048
- atom-0049
- atom-0062
decision_refs:
- dec-0002
- dec-0003
- dec-0006
- dec-0007
- dec-0008
- dec-0011
- dec-0012
preserved_exact_tokens:
- historical orchestrator runs in PM
- historical orchestrator runs
- Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when
  they get there."
- artifact_id
- run_id
- thread_id
- attempt_id
- identity-based open
- History versus Ledger
- All of that.
- status/date/project search
- opening artifacts/evidence
- resuming/retrying
- cloning as a new run
- exporting
- viewing what happened
- all of thodse
- selected-row export
- multi-select bundle export
- whole filtered-view export
- manifest
- yes, and yes.
- zip+manifest
- JSON
- rendered Markdown/HTML/PDF
- raw records/evidence
- explicit evidence/redaction profile
- 'yes'
- project-scoped unified History index/projection
- source-of-truth shape
- immutable wizard, run, artifact, evidence, and lineage records
- History surface
- filters
- exports
- compare
- artifact
- evidence
- permissions/redaction profile details
negative_constraints:
- Do not show historical runs as ambiguous text summaries without stable run identity.
- Do not lose links to artifacts, evidence, ledger records, usage, or receipts when a run becomes historical.
- Do not use shell-state, current tab, filesystem path, or timestamp heuristics as the primary identity for historical
  documents or runs.
- Do not mint shadow IDs for manifest-backed bundles or receipt-like historical objects.
- Do not reduce historical runs to read-only summaries when the user needs action routes.
- Do not omit evidence/artifact/Ledger pivots from historical run rows.
- Do not limit MVP export to selected-row-only.
- Do not make whole filtered-view export omit the active filter context.
- Do not collapse export into only one opaque archive format.
- Do not omit the manifest from archive/zip exports.
- Do not silently include raw records or evidence in ordinary exports.
- Do not bypass permissions or redaction policy when exporting evidence/raw records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not duplicate mutable source-of-truth content into the projection as if it were authoritative.
- Do not lose canonical IDs or lineage refs when projecting History rows.
- Do not mutate historical records through projection updates.
- Do not let UI rows, exports, or compare flows drift into different identity models.
- Do not open or export stale copies without resolving preserved source refs and currentness/authority checks where
  required.
- Do not export secrets, unauthorized provider/account details, or evidence outside the user's permissions.
- Do not omit a manifest of redactions/omissions when evidence export is requested.
owner_hints:
- Plans/Orchestrator_Page.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Project_Output_Artifacts.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```

### RAP-035 - Vision Bridge Derived Description Artifacts

```yaml
plan_unit_id: RAP-035
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Each generated vision description is persisted as an inspectable runtime artifact or tool/LLM trace
  entry with source image ref/hash, prompt or question, bridge provider/model/account, timestamp, usage/cost refs
  when available, freshness/staleness, cached/newly generated state, and permission/degraded state. Cache keys include
  source image content hash, source ref, bridge prompt/question, requested language/detail mode, bridge provider/model/version,
  redaction/sensitivity class, and relevant permission scope. Reruns create new versions rather than mutating old
  derived descriptions in place.
gui_related: true
gui_classification_reason: Vision-description artifacts, cache state, source chips, inspect, and rerun controls
  are user-visible.
depends_on:
- T-165
- CV-296
- PS-121
unblocks:
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_artifact_lineage_loss
reasoning_tier: standard
context_scope: vision_bridge_artifacts
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- future derived vision-description artifact rows
node_compile_hint:
  mode: vision_description_artifact
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0076
- pldg-20260626-001-feature-name:atom-0078
- pldg-20260626-001-feature-name:atom-0084
- pldg-20260626-001-feature-name:atom-0153
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- chat:opencode-see-image-request
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- chat:pmconcept-gui-reference
- Concepts/PMConcept.html#Screenshot-to-Chat
- Concepts/PMConcept.html#composer-chip
- Concepts/PMConcept.html#activity-card
- Concepts/PMConcept.html#requested-effective-model
source_atom_ids:
- atom-0076
- atom-0078
- atom-0084
- atom-0153
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
- dec-0024
preserved_exact_tokens:
- runtime artifact
- tool/LLM trace
- source image ref/hash
- prompt/question
- provider/model/account
- cost/usage
- cached
- newly generated
- 4. Yes
- GUI
- provider/model used
- derived description
- source image/artifact link
- freshness/cache state
- inspect
- rerun with a question
- copy description
- attach result
- always accept
- stops asking
- source image content hash
- source ref
- bridge prompt/question
- provider/model/version
- redaction/sensitivity class
- rerunnable
- stale
- superseded/deleted
- 'yes'
- Screenshot to Chat
- composer-chip
- activity-card
- Requested Model
- Effective Model
- inspect/rerun
- provider/model disclosure
negative_constraints:
- Do not make the derived description invisible or unauditable.
- Do not lose source lineage between the image and the generated text description.
- Do not reuse a cached description when the source image, question, or bridge model changed without marking freshness.
- Do not hide bridge outputs inside opaque provider logs only.
- Do not show the non-vision model's answer as if it directly saw the image when it consumed a derived description.
- Do not omit failure/denial states from the user-visible surface.
- Do not omit a user-visible way to inspect or reset remembered always-accept behavior.
- Do not reuse a cached description after the source image, prompt/question, bridge model/version, redaction class,
  or permission scope changes without marking freshness.
- Do not hide cache reuse from the user.
- Do not mutate old derived descriptions in place when rerun creates a new version.
- Do not make vision bridge artifacts feel like detached plugin output.
- Do not hide requested/effective model or fallback state when the bridge uses a separate vision-capable route.
- Do not replace accepted PM-owned permission/disclosure behavior with PMConcept demo-only controls.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Tools.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
- Plans/Orchestrator_Page.md
- Plans/Permissions_System.md
- Plans/Prompt_Pipeline.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
```

### RAP-036 - Teacher Activity Transparency Projection

```yaml
plan_unit_id: RAP-036
unit_type: requirement
status: accepted
owner_doc: Plans/Runtime_Artifacts_Panel.md
canonical_text: Teacher activity such as route opens, highlights, source lookups, permission waits, model fallback,
  missing coverage, memory save prompts, and handoffs is represented as compact Assistant Chat cards or rows with
  durable detail payloads. Important blocked or degraded activity remains visible in the thread and can be inspected
  later without forcing the user into raw traces.
gui_related: true
gui_classification_reason: Teacher activity rows/cards and durable detail payloads are user-visible runtime projections.
depends_on:
- ACD-426
- CV-297
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teacher_activity_trace_gap
reasoning_tier: standard
context_scope: teacher_activity_projection
implementation_surfaces:
- Plans/Runtime_Artifacts_Panel.md
- future Teacher activity detail rows
node_compile_hint:
  mode: teacher_activity_projection
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0099
- pldg-20260626-001-feature-name:atom-0107
- pldg-20260626-001-feature-name:atom-0145
- pldg-20260626-001-feature-name:atom-0147
- chat:teacher-feature-initial-framing
- memory:MEMORY.md:365
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- chat:teach-visual-specificity-challenge
- chat:work-through-teach-gaps
- Plans/Runtime_Artifacts_Panel.md#artifact-audit-visibility
- chat:teach-bundle-accepted-pmconcept-reference
- Plans/Personas.md#11.8-teacher
source_atom_ids:
- atom-0099
- atom-0107
- atom-0145
- atom-0147
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0021
- dec-0022
- dec-0023
- dec-0024
correction_refs:
- corr-0002
preserved_exact_tokens:
- assistant chat threads
- show what its doing
- blocked
- skipped
- requires confirmation
- handoff
- How it will show the user
- Opening Settings > Models
- Highlighting
- Waiting for confirmation
- Blocked
- Handing off
- Teacher activity
- source lookups
- permission waits
- model fallback
- missing coverage
- memory save prompts
- handoffs
- collapsible detail
- hand off
- implementation/build work
- high-reasoning architecture decisions
- audit/repair
- external research
- direct execution
- specialty tooling
- suggested destination Persona
- stronger model
negative_constraints:
- Do not let Teacher silently manipulate or navigate the GUI with no chat-visible activity trail.
- Do not hide blocked/skipped reasons or requested/effective Persona/model state when they affect the teaching flow.
- Do not let a low-end Teacher model continue silently when the task has become implementation/build work requiring
  handoff.
- Do not make GUI guidance silent or invisible in the chat thread.
- Do not show vague activity text when PM knows the route/control/action.
- Do not hide blocked, skipped, fallback, or handoff state.
- Do not make Teacher GUI actions silent.
- Do not hide blocked/degraded activity rows after the immediate step passes.
- Do not force users into raw traces for normal teaching transparency.
- Do not let Teacher quietly become a builder or auditor.
- Do not silently switch Persona/model/tool path without disclosure.
- Do not discard Teacher context during handoff.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/Personas.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/UI_Command_Catalog.md
- Plans/Models_System.md
```
