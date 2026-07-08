# Shard 030: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Contracts_V0.md`

Source lines: L18206-L18721

Source SHA256: `7de676af614e3f50fee6043fb352d24c95fce1b794da5f4e7a51fb6b44f11503`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### CV-295 - History Identity Projection And Action Envelope

```yaml
plan_unit_id: CV-295
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: History row, compare, export, open, reopen, send-forward, resume, retry, clone, rebuild, artifact,
  and evidence flows use identity-native refs such as artifact_id, run_id, thread_id, attempt_id, PlanningRun or
  pack identity, receipt refs, source record refs, manifest refs, archive state, and current-project scope. The
  History projection carries action availability and stale/degraded state but never becomes authority for immutable
  source records.
gui_related: false
gui_classification_reason: Shared identity/action envelopes are contract data shapes, not GUI.
depends_on: []
unblocks:
- OP-027
- UCC-100
- POA-051
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: history_contract_identity_drift
reasoning_tier: high
context_scope: history_identity_contracts
implementation_surfaces:
- Plans/Contracts_V0.md
- future history row/action envelopes
node_compile_hint:
  mode: history_contract_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0012
- pldg-20260626-001-feature-name:atom-0035
- pldg-20260626-001-feature-name:atom-0039
- pldg-20260626-001-feature-name:atom-0047
- pldg-20260626-001-feature-name:atom-0048
- pldg-20260626-001-feature-name:atom-0049
- pldg-20260626-001-feature-name:atom-0051
- pldg-20260626-001-feature-name:atom-0052
- pldg-20260626-001-feature-name:atom-0053
- pldg-20260626-001-feature-name:atom-0054
- Plans/Runtime_Artifacts_Panel.md
- Plans/Orchestrator_Page.md
- Plans/Project_Output_Artifacts.md
- chat:history-columns-toggle-deep-compare-answers
- chat:history-export-granularity-answer
- chat:history-source-index-answer
- chat:history-projection-lifecycle-answer
source_atom_ids:
- atom-0012
- atom-0035
- atom-0039
- atom-0047
- atom-0048
- atom-0049
- atom-0051
- atom-0052
- atom-0053
- atom-0054
decision_refs:
- dec-0002
- dec-0005
- dec-0006
- dec-0008
- dec-0009
preserved_exact_tokens:
- Runtime-artifact route-state answers "where should the user land," not "how should every panel be laid out when
  they get there."
- artifact_id
- run_id
- thread_id
- attempt_id
- identity-based open
- History versus Ledger
- deeper is mvp
- Compare versions
- immutable historical records
- manifest
- all of thodse
- current project
- documents
- runs
- artifacts
- evidence
- lineage
- 'yes'
- project-scoped unified History index/projection
- source-of-truth shape
- immutable wizard, run, artifact, evidence, and lineage records
- History surface
- filters
- exports
- compare
- artifact
- rebuildable from immutable source records
- wizard
- run
- wizard save/approval
- run lifecycle
- artifact/evidence write
- archive/unarchive
- lineage/manifest events
- stale/out-of-sync state detected and surfaced
- History
- rebuildable
- immutable source records
- approved/final outputs
negative_constraints:
- Do not use shell-state, current tab, filesystem path, or timestamp heuristics as the primary identity for historical
  documents or runs.
- Do not mint shadow IDs for manifest-backed bundles or receipt-like historical objects.
- Do not compare by path or title alone when canonical document/package IDs exist.
- Do not let comparison mutate or merge historical records.
- Do not export history in a way that strips document/run/artifact identities.
- Do not let exported bundles appear cross-project when the History surface is locked to the current project.
- Do not treat exported copies as mutable source records.
- Do not implement the History surface as fragile cross-subsystem ad hoc scans at view time.
- Do not make the History read model global or cross-project by default.
- Do not duplicate mutable source-of-truth content into the projection as if it were authoritative.
- Do not lose canonical IDs or lineage refs when projecting History rows.
- Do not mutate historical records through projection updates.
- Do not let UI rows, exports, or compare flows drift into different identity models.
- Do not open or export stale copies without resolving preserved source refs and currentness/authority checks where
  required.
- Do not make the projection the only copy of historical truth.
- Do not make projection corruption unrecoverable when source records remain valid.
- Do not rely on view-time scanning as the primary way to discover normal History changes.
- Do not omit archive/unarchive or lineage/manifest updates from the projection lifecycle.
- Do not let stale projection state silently drive History, export, or compare behavior without detection.
- Do not hide projection corruption/out-of-sync status in logs only.
- Do not repair the projection by rewriting immutable source history.
- Do not mutate approved/final wizard outputs in place during projection rebuild.
- Do not erase source refs when rebuilding.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Orchestrator_Page.md
- Plans/Project_Output_Artifacts.md
- Plans/UI_Command_Catalog.md
- Plans/Planning_Wizard.md
- Plans/PRD_Builder.md
- Plans/FinalGUISpec.md
```

### CV-296 - Vision Bridge Result Envelope

```yaml
plan_unit_id: CV-296
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: A VisionBridgeResult records source image ref/hash, prompt/question, requested language/detail mode,
  structured description/answer, uncertainty, notable text/OCR when available, limitations, safety/redaction notes,
  bridge provider/model/account/version, permission scope, cache/freshness state, usage_event_ref when available,
  and failure/degraded reason when dispatch is denied or unavailable. Non-vision models consume the structured derived
  result and source refs, not raw image bytes.
gui_related: false
gui_classification_reason: The result envelope is a shared contract shape; GUI owners render it separately.
depends_on:
- PS-121
unblocks:
- RAP-035
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
risk_class: vision_result_contract_drift
reasoning_tier: high
context_scope: vision_bridge_result_contract
implementation_surfaces:
- Plans/Contracts_V0.md
- future vision_bridge result records
node_compile_hint:
  mode: vision_bridge_contract_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0076
- pldg-20260626-001-feature-name:atom-0077
- pldg-20260626-001-feature-name:atom-0084
- pldg-20260626-001-feature-name:atom-0085
- pldg-20260626-001-feature-name:atom-0086
- pldg-20260626-001-feature-name:atom-0087
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- Plans/Tools.md
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FileSafe.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
source_atom_ids:
- atom-0076
- atom-0077
- atom-0084
- atom-0085
- atom-0086
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
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
- local images
- screenshots
- vision provider
- project policy
- permissions
- redaction
- sensitivity_state
- degraded
- reject
- accept
- always accept
- doesnt have to be that exact wording
- when you do always, it stops asking
- source image content hash
- source ref
- bridge prompt/question
- provider/model/version
- redaction/sensitivity class
- rerunnable
- stale
- superseded/deleted
- 'yes'
- sensitivity/redaction policy
- disclosure destination
- explicit user override
- redaction/omission details
- derived artifact manifest
- secrets
- structured prompt/output contract
- bounded question/task
- uncertainty
- notable text/OCR
- limitations
- safety/redaction notes
- source refs
- not raw image bytes
- never guess image contents
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
negative_constraints:
- Do not make the derived description invisible or unauditable.
- Do not lose source lineage between the image and the generated text description.
- Do not reuse a cached description when the source image, question, or bridge model changed without marking freshness.
- Do not silently send screenshots containing secrets or sensitive local/project context to another provider route.
- Do not bypass the existing tool permission model just because the bridge is model-assistive.
- Do not serialize revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not make always-accept global, irreversible, hidden, or impossible to revoke.
- Do not reuse a cached description after the source image, prompt/question, bridge model/version, redaction class,
  or permission scope changes without marking freshness.
- Do not hide cache reuse from the user.
- Do not mutate old derived descriptions in place when rerun creates a new version.
- Do not silently send sensitive screenshots or images to another provider without policy evaluation.
- Do not claim redaction happened without recording redaction/omission metadata.
- Do not expose secret material in manifests, receipts, GUI previews, or exports.
- Do not pass raw image bytes into non-vision model context when artifact refs plus bounded derived text are the
  contract.
- Do not omit uncertainty or limitations from bridge output when the image is ambiguous or low-confidence.
- Do not let image text/OCR become hidden, unsourced prompt material.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Tools.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Permissions_System.md
- Plans/FileSafe.md
- Plans/Prompt_Pipeline.md
- Plans/FinalGUISpec.md
- Plans/Project_Output_Artifacts.md
- Plans/assistant-chat-design.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
```

### CV-297 - Teacher Guided Help Activity Envelope

```yaml
plan_unit_id: CV-297
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Teacher guided-help records carry launch source, current surface context, summon phrase or help-icon
  route, source groups used, source confidence/currentness state, missing coverage state, guided action kind, target
  surface/object refs, permission or mutation confirmation requirement, activity status, sequence/timestamp, collapsible
  detail payload, and handoff destination/context when Teacher leaves teaching/help mode.
gui_related: false
gui_classification_reason: Teacher launch, source, guided-action, and activity shapes are shared contract data;
  GUI owners render them.
depends_on:
- PP-056
unblocks:
- RAP-036
- UCC-102
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
risk_class: teacher_activity_contract_gap
reasoning_tier: high
context_scope: teacher_guided_help_contracts
implementation_surfaces:
- Plans/Contracts_V0.md
- future Teacher activity and guided action records
node_compile_hint:
  mode: teacher_guided_help_contract_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0097
- pldg-20260626-001-feature-name:atom-0098
- pldg-20260626-001-feature-name:atom-0099
- pldg-20260626-001-feature-name:atom-0105
- pldg-20260626-001-feature-name:atom-0137
- pldg-20260626-001-feature-name:atom-0138
- pldg-20260626-001-feature-name:atom-0142
- pldg-20260626-001-feature-name:atom-0145
- pldg-20260626-001-feature-name:atom-0147
- chat:teacher-feature-initial-framing
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md#2.6A-Chat-thread-lifecycle-commands
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md#ACD-410---Internal-Target-Payload-Navigation
- memory:MEMORY.md:365
- Plans/assistant-chat-design.md
- chat:teach-visual-specificity-challenge
- chat:work-through-teach-gaps
- Plans/Personas.md#11.8-teacher
- Plans/assistant-chat-design.md#6-teach
- chat:teach-bundle-accepted-pmconcept-reference
- Plans/Runtime_Artifacts_Panel.md#runtime-artifact-identity-index-and-preview-rules
- Plans/Permissions_System.md#2.4A-requested-vs-effective-permissioned-capability-state
- Plans/Permissions_System.md#approval-ui
- Plans/Runtime_Artifacts_Panel.md#artifact-audit-visibility
source_atom_ids:
- atom-0097
- atom-0098
- atom-0099
- atom-0105
- atom-0137
- atom-0138
- atom-0142
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
- help icon
- clicked
- brings the user to the assistant chat window
- opens a new thread
- Teacher
- teacher can control the Gui to show the user how to do things
- Gui
- show the user how
- OpenSubject
- route_target
- highlight
- spotlight
- assistant chat threads
- show what its doing
- blocked
- skipped
- requires confirmation
- handoff
- Where it will get all its info from
- Sources used
- PM context
- capability snapshots
- command catalog
- settings registry
- missing coverage
- know everything in PM
- how it works
- all the capabilities of PM
- how the user interacts with it
- current surface/control context
- Plans/PlanUnits
- Glossary/help entries
- UI command/route catalog
- capability/provider/account snapshots
- scoped taught memory
- available
- stale
- missing
- disabled
- permission-required
- capability-unavailable
- conflict-detected
- could not verify
- control the Gui
- open route
- focus panel
- scroll to section
- highlight control/region
- expand non-mutating details
- preview selection
- changing a setting
- saving memory
- approving a permission
- undo/rollback
- Teacher activity
- Opening Settings > Models
- Highlighting
- source lookups
- permission waits
- model fallback
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
- Do not reuse an unrelated active chat thread when the help-icon contract says to open a new teaching conversation.
- Do not launch Teacher without preserving current surface context needed for useful help.
- Do not replace Teacher launch with static help pages only.
- Do not let Teacher perform raw uncontrolled GUI mutation outside stable UI command/route contracts.
- Do not allow mutating/destructive GUI actions without confirmation and capability/permission gates.
- Do not use stale or private panel-local route fields when the route/open contract provides canonical targets.
- Do not let Teacher silently manipulate or navigate the GUI with no chat-visible activity trail.
- Do not hide blocked/skipped reasons or requested/effective Persona/model state when they affect the teaching flow.
- Do not let a low-end Teacher model continue silently when the task has become implementation/build work requiring
  handoff.
- Do not let Teacher present PM facts as unsourced hidden prompt lore.
- Do not hide stale, missing, disabled, or capability-unavailable source states.
- Do not cite unavailable PlanUnits before a future compile creates them.
- Do not let Teacher invent PM behavior when owner sources are missing.
- Do not search external sources or other projects by default.
- Do not use taught memory outside its approved scope.
- Do not collapse stale, missing, disabled, permission-required, and capability-unavailable into one vague warning.
- Do not present unverified PM behavior as fact.
- Do not cite unavailable future PlanUnits before compile creates them.
- Do not use raw cursor/click automation as the teaching UI.
- Do not let Teacher execute mutating actions through `Do it` without confirmation.
- Do not let guided GUI actions bypass Permissions_System requested/effective disclosure.
- Do not make Teacher GUI actions silent.
- Do not hide blocked/degraded activity rows after the immediate step passes.
- Do not force users into raw traces for normal teaching transparency.
- Do not let Teacher quietly become a builder or auditor.
- Do not silently switch Persona/model/tool path without disclosure.
- Do not discard Teacher context during handoff.
owner_hints:
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Personas.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Glossary.md
- Plans/Models_System.md
```
