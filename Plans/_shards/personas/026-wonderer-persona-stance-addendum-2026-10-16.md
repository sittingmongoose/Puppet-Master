# Shard 026: Wonderer Persona Stance Addendum (2026-10-16)

Source: `Plans/Personas.md`

Source lines: L3689-L4058

Source SHA256: `a14c5b9c5e694e2fc888bb675dcc7a25d4f60eca214f24ba761bbdceaaef6409`

---

## Wonderer Persona Stance Addendum (2026-10-16)

DL-218 adapts Wonderer from the Hermes `wonderer` profile. The profile's `SOUL.md` is the stance of the bundled Wonderer Persona, and P-059 fixes that stance. The method itself is the Wonderer methodology Skill (`Plans/Skills_System.md` SS-037), and where Wonderer runs is owned by its consumers.

### P-059 - The Wonderer Persona's Stance

```yaml
plan_unit_id: P-059
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  The bundled body of the wonderer team Persona (P-057) carries the stance of the Hermes wonderer
  profile's SOUL.md, shaped per §12.4 (DL-218). Stay loose: the question is a seed, not a cage. The
  Wonderer does not answer questions; it expands them, exploring the periphery of a seed (the adjacent,
  the implied, the overlooked and the surprising) and returning things worth looking into, not things
  worth concluding. Its principles are lateral before deep (the periphery comes first, and depth belongs
  to research); anchored wonder (every new direction traces a path back to the seed, because wonder is
  not drift); premature convergence is the enemy (the most interesting connections sit at the edges of
  the search space); suggestions, not answers (its output is raw material for someone else's synthesis,
  and it does not close the loop); and conditions over protocols (spaciousness, varied inputs,
  permission to be wrong and a clear boundary make wonder likely, and no procedure guarantees it). Its
  default Skill reference is the Wonderer methodology Skill (SS-037), its tool posture is read-only
  search and read, and its handoff is its leads, which others decide on.
gui_related: false
gui_classification_reason: Persona body content, not presentation.
depends_on: [P-057]
unblocks: []
acceptance_criteria:
  - The wonderer Persona body states the five principles and that it returns leads, not conclusions.
  - Its default Skill reference is SS-037 and its tool posture writes nothing.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
risk_class: wonderer_persona_converges
reasoning_tier: standard
context_scope: personas_team_catalog
implementation_surfaces: [Plans/Personas.md, Plans/Skills_System.md]
node_compile_hint: {mode: persona_catalog_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md#DL-218
  - "/mnt/Cursor/share/puppet-master/2026-10-16-wonderer-grill-me/sources/hermes-profiles-wonderer-SOUL.md sha256:cb34ac310a3e190e79f74d164963942f9cd5e5f56d2ad2ba4fdfc23974210f4c (hermes-profiles 867a555e13; source lineage, adapted)"
preserved_exact_tokens: ["wonderer", "lateral before deep", "anchored wonder", "premature convergence is the enemy", "suggestions, not answers", "conditions over protocols"]
negative_constraints:
  - Do not give the Wonderer Persona a verdict, recommendation or vote.
  - Do not give the Wonderer Persona a tool that writes.
owner_hints: [Plans/Personas.md, Plans/Skills_System.md]
```

ContractRef: ContractName:Plans/Skills_System.md, ContractName:Plans/Collaborative_Workflows.md, ContractName:Plans/Decision_Log.md#DL-218

### P-060 - Persona Home, Reach, Whole Versions And Scoped Selection

```yaml
plan_unit_id: P-060
unit_type: requirement
status: accepted
owner_doc: Plans/Personas.md
canonical_text: Personas owns each Persona as a whole record with stable persona_id, home, reach and revision.
  A library home is Everywhere, kept on the settings home and mirrored read-only to Computers; a Project
  home is the existing Project PERSONA.md root. Computer installation or mirrored availability is not
  a new field-by-field Persona layer. Every project reach includes No project; Only these projects excludes
  application-scope selection. Project switches declare project_switch_ids=[personas.library.disabled-bundled],
  limited to mutable bundled specialties by stable ID; core built-ins cannot be disabled or shadowed.
  Definition fields such as body, tool lists and skills remain whole Persona fields; retired model/provider/preset/effort fields are inert compatibility reads. A version
  for a Project is an entire same-id definition through the existing save-as-override owner action. Save
  writes the current home with expected revision and narrow Undo/re-target feedback. Selection defaults
  use the Settings resolver through Everywhere, Computer, optional Project and thread, then the Models
  owner resolves requested/effective runtime. Copy contributes an exact source hash/revision, destination
  home, protected-ID check, owner apply/readback and compensating rollback to the Settings preview/apply/rollback
  transaction. No-project create offers library, not an invented Project; conversion re-resolves future
  turns and never changes frozen historical Persona inputs. The owner contribution is named in owner_thing_previews;
  scope_model and project_switch_ids describe its manager boundary. settings.follow never grants thing
  mutation or Project content authority. The selected whole-version/copy operation is cmd.persona.save_as_override
  through sole planned handler handlers::persona::save_as_override, with Plans/shared_integration_runtime.schema.json#/$defs/persona_save_as_override_request
  and Plans/shared_integration_runtime.schema.json#/$defs/persona_save_as_override_result. The Settings
  batch invokes this owner contribution, including exact source hash/revision, destination CAS, declared
  reach/switch deltas, readback and eligible compensation; it never writes owner records directly. These
  registrations do not prove native availability; missing schema, handler, trust, installation or currentness
  remains typed unavailable. Save-as-override requires a real destination Project and preserves the same
  eligible persona_id; cmd.persona.duplicate remains the distinct-identity copy route, with its selected
  persona_duplicate_request_v2/persona_duplicate_result_v2 definitions. Neither operation shadows protected
  built-ins.
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- P-013
- P-056
- SSYS-061
- SSYS-062
unblocks: []
acceptance_criteria:
- Editing a library Persona writes its home and shows that target with Undo; making a Project version
  is explicit.
- Protected-ID copies and per-field versions refuse; deleting a Project version reveals the library version.
- No-project selection includes only permitted library reach; conversion records a fresh resolution without
  changing earlier turns.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/Personas.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; S8–S11; N12/N25
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md#4.1–4.6;5
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-B02
preserved_exact_tokens:
- persona_id
- PERSONA.md
- project_switch_ids
- personas.library.disabled-bundled
- Everywhere
- Computer
- No project
- owner_thing_previews
- scope_model
- settings.follow
- cmd.persona.save_as_override
- handlers::persona::save_as_override
negative_constraints:
- Do not let Settings write PERSONA.md itself or copy credentials, histories, Goals or Plans as Persona
  settings.
- Do not derive the selected Persona from focus or silently modify siblings or frozen runs.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/Personas.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/Personas.md#P-060, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365


<a id="P-120"></a>
### P-120 - persona.created prepared event contract

```yaml
plan_unit_id: P-120
unit_type: contract
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  persona.created prepared event contract. Newly authored exact-family technical contracts under DL-045, prepared without admission;
  existing P-060, UCC-214, CV-365 and canonical runtime identity govern behavior.
gui_related: false
gui_classification_reason: Defines persisted owner contracts, not new visual presentation.
depends_on: [DL-045, P-060, CV-365, SP-672]
unblocks: []
acceptance_criteria:
- Exact-family positive and negative oracles pass; admission and retention remain separately gated.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Personas.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `persona.created` at payload version `1.0.0`.** Per-family search of current top-level Plans Markdown/JSON/JSONL and the exact command/schema/storage owners found the selected `persona_create_request_v2`/`persona_create_result_v2` behavior and generic receipt/index definitions, but no exact-family closed event schema, operation identity, receipt adoption or named operating reader. Search queries, negative counts, matching lines and source hashes are pinned in the DG6B fix-round report. Reuse those existing definitions first. This family remains **non-emitting, prepared without admission** until separate registration and retention resolution.

Producer: **handlers::persona::create (or the existing handlers::persona::duplicate distinct-ID route)**. Observe only the successful created result of cmd.persona.create, or duplicated result of cmd.persona.duplicate. PERSONA.md validates before the whole definition is committed and read back at its chosen home. No-project create chooses Your library; a Project version requires an actual Project. Duplicate uses a new non-reserved persona_id and exact source ID/revision/hash; it is not the same-ID save-as-override action. Protected IDs and folder/ID mismatch refuse before effect. New create preserves the absent or complete source evidence in its original request; duplicate requires all three source fields.

The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/persona_created` (closed root, version 1.0.0), routed by CV-691 with this family’s individual SP-672 subsection. Bind scope to the original selected WorkflowScopeV2 request and actual owning Server, not focus or a Computer mirror. `home_kind`, `home_ref`, `home_project_id`, `project_version_id`, reach, source hashes, owner revision, Client and return refs come from authenticated original request/result custody. Runtime identity uses only the canonical names in section 10; legacy `_id` fields are migration/source-lineage aliases and cannot be parallel fields. The event stores refs and hashes, never PERSONA.md body, prompts, credentials, or arbitrary output. Refs require current source authorization and deletion checks. These technical bindings change no feature, scope choice, deletion policy or retention class.


The mutation oracle independently verifies the authenticated original target `persona_id` against section 6's nine protected core built-in IDs. A source `protected_id=false` cannot authorize a protected target; all request/result/frozen copies must agree with that target. This does not restrict copying an eligible protected source to a new non-reserved ID or legitimate selection/export.

<a id="P-121"></a>
### P-121 - persona.deleted prepared event contract

```yaml
plan_unit_id: P-121
unit_type: contract
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  persona.deleted prepared event contract. Newly authored exact-family technical contracts under DL-045, prepared without admission;
  existing P-060, UCC-214, CV-365 and canonical runtime identity govern behavior.
gui_related: false
gui_classification_reason: Defines persisted owner contracts, not new visual presentation.
depends_on: [DL-045, P-060, CV-365, SP-672]
unblocks: []
acceptance_criteria:
- Exact-family positive and negative oracles pass; admission and retention remain separately gated.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Personas.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `persona.deleted` at payload version `1.0.0`.** Per-family search of current top-level Plans Markdown/JSON/JSONL and the exact command/schema/storage owners found the selected `persona_delete_request_v2`/`persona_delete_result_v2` behavior and generic receipt/index definitions, but no exact-family closed event schema, operation identity, receipt adoption or named operating reader. Search queries, negative counts, matching lines and source hashes are pinned in the DG6B fix-round report. Reuse those existing definitions first. This family remains **non-emitting, prepared without admission** until separate registration and retention resolution.

Producer: **handlers::persona::delete**. Observe only the confirmed deleted result of cmd.persona.delete for the exact mutable whole version at expected_owner_revision. A protected core built-in cannot be deleted. Deleting an eligible Project version removes only that version and reveals the library version, as P-060 and section 4.1 specify; deleting the library record follows the existing owner rule. Capture the original removed revision/hash and readback receipt, never invent a replacement Persona or body lifetime. Event history is metadata, not authority to delete linked content or other versions.

The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/persona_deleted` (closed root, version 1.0.0), routed by CV-691 with this family’s individual SP-672 subsection. Bind scope to the original selected WorkflowScopeV2 request and actual owning Server, not focus or a Computer mirror. `home_kind`, `home_ref`, `home_project_id`, `project_version_id`, reach, source hashes, owner revision, Client and return refs come from authenticated original request/result custody. Runtime identity uses only the canonical names in section 10; legacy `_id` fields are migration/source-lineage aliases and cannot be parallel fields. The event stores refs and hashes, never PERSONA.md body, prompts, credentials, or arbitrary output. Refs require current source authorization and deletion checks. These technical bindings change no feature, scope choice, deletion policy or retention class.


The mutation oracle independently verifies the authenticated original target `persona_id` against section 6's nine protected core built-in IDs. A source `protected_id=false` cannot authorize a protected target; all request/result/frozen copies must agree with that target. This does not restrict copying an eligible protected source to a new non-reserved ID or legitimate selection/export.

<a id="P-122"></a>
### P-122 - persona.exported prepared event contract

```yaml
plan_unit_id: P-122
unit_type: contract
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  persona.exported prepared event contract. Newly authored exact-family technical contracts under DL-045, prepared without admission;
  existing P-060, UCC-214, CV-365 and canonical runtime identity govern behavior.
gui_related: false
gui_classification_reason: Defines persisted owner contracts, not new visual presentation.
depends_on: [DL-045, P-060, CV-365, SP-672]
unblocks: []
acceptance_criteria:
- Exact-family positive and negative oracles pass; admission and retention remain separately gated.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Personas.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `persona.exported` at payload version `1.0.0`.** Per-family search of current top-level Plans Markdown/JSON/JSONL and the exact command/schema/storage owners found the selected `persona_export_request_v2`/`persona_export_result_v2` behavior and generic receipt/index definitions, but no exact-family closed event schema, operation identity, receipt adoption or named operating reader. Search queries, negative counts, matching lines and source hashes are pinned in the DG6B fix-round report. Reuse those existing definitions first. This family remains **non-emitting, prepared without admission** until separate registration and retention resolution.

Producer: **handlers::persona::export**. Observe only the exported result of cmd.persona.export for the exact authorized whole definition/revision/hash. export_ref identifies the already committed redacted export artifact and its original receipt; event replay cannot create, overwrite or disclose that export. Source access and redaction are checked on export and again on every body read. No artificial Project, write lease for mere inspection, credential, raw body, or trust grant is implied.

The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/persona_exported` (closed root, version 1.0.0), routed by CV-691 with this family’s individual SP-672 subsection. Bind scope to the original selected WorkflowScopeV2 request and actual owning Server, not focus or a Computer mirror. `home_kind`, `home_ref`, `home_project_id`, `project_version_id`, reach, source hashes, owner revision, Client and return refs come from authenticated original request/result custody. Runtime identity uses only the canonical names in section 10; legacy `_id` fields are migration/source-lineage aliases and cannot be parallel fields. The event stores refs and hashes, never PERSONA.md body, prompts, credentials, or arbitrary output. Refs require current source authorization and deletion checks. These technical bindings change no feature, scope choice, deletion policy or retention class.


Export reads may use an authorized read-only source or Computer mirror without a definition-write lease. Independently, the persona.exported EventRecord writer must hold its own current writer/schema/retention admission before append and retry; writer withdrawal fences the event even when source read authorization remains current. The oracle source writer_current is this event-writer fence, while definition_writer_current is the separate source definition-write lease. Withdrawn event writer is a required negative; read-only export with a current admitted event writer is a required positive.

<a id="P-123"></a>
### P-123 - persona.imported prepared event contract

```yaml
plan_unit_id: P-123
unit_type: contract
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  persona.imported prepared event contract. Newly authored exact-family technical contracts under DL-045, prepared without admission;
  existing P-060, UCC-214, CV-365 and canonical runtime identity govern behavior.
gui_related: false
gui_classification_reason: Defines persisted owner contracts, not new visual presentation.
depends_on: [DL-045, P-060, CV-365, SP-672]
unblocks: []
acceptance_criteria:
- Exact-family positive and negative oracles pass; admission and retention remain separately gated.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Personas.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `persona.imported` at payload version `1.0.0`.** Per-family search of current top-level Plans Markdown/JSON/JSONL and the exact command/schema/storage owners found the selected `persona_import_request_v2`/`persona_import_result_v2` behavior and generic receipt/index definitions, but no exact-family closed event schema, operation identity, receipt adoption or named operating reader. Search queries, negative counts, matching lines and source hashes are pinned in the DG6B fix-round report. Reuse those existing definitions first. This family remains **non-emitting, prepared without admission** until separate registration and retention resolution.

Producer: **handlers::persona::import**. Observe only the imported result of cmd.persona.import after exact source verification, protected-ID/schema/folder validation, destination CAS, whole-record apply and authenticated readback. source_id/source_revision/source_sha256 and import_receipt_ref bind the original accepted input and result. Library home and Project whole version retain their actual destinations. Copy/apply does not install executable code, transfer credentials, grant trust, or permit a per-field merge; compensation remains the existing Settings/Persona owner action, never an event replay.

The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/persona_imported` (closed root, version 1.0.0), routed by CV-691 with this family’s individual SP-672 subsection. Bind scope to the original selected WorkflowScopeV2 request and actual owning Server, not focus or a Computer mirror. `home_kind`, `home_ref`, `home_project_id`, `project_version_id`, reach, source hashes, owner revision, Client and return refs come from authenticated original request/result custody. Runtime identity uses only the canonical names in section 10; legacy `_id` fields are migration/source-lineage aliases and cannot be parallel fields. The event stores refs and hashes, never PERSONA.md body, prompts, credentials, or arbitrary output. Refs require current source authorization and deletion checks. These technical bindings change no feature, scope choice, deletion policy or retention class.


The mutation oracle independently verifies the authenticated original target `persona_id` against section 6's nine protected core built-in IDs. A source `protected_id=false` cannot authorize a protected target; all request/result/frozen copies must agree with that target. This does not restrict copying an eligible protected source to a new non-reserved ID or legitimate selection/export.

<a id="P-124"></a>
### P-124 - persona.selected prepared event contract

```yaml
plan_unit_id: P-124
unit_type: contract
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  persona.selected prepared event contract. Newly authored exact-family technical contracts under DL-045, prepared without admission;
  existing P-060, UCC-214, CV-365 and canonical runtime identity govern behavior.
gui_related: false
gui_classification_reason: Defines persisted owner contracts, not new visual presentation.
depends_on: [DL-045, P-060, CV-365, SP-672]
unblocks: []
acceptance_criteria:
- Exact-family positive and negative oracles pass; admission and retention remain separately gated.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Personas.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `persona.selected` at payload version `1.0.0`.** Per-family search of current top-level Plans Markdown/JSON/JSONL and the exact command/schema/storage owners found the selected `persona_select_request_v2`/`persona_select_result_v2` behavior and generic receipt/index definitions, but no exact-family closed event schema, operation identity, receipt adoption or named operating reader. Search queries, negative counts, matching lines and source hashes are pinned in the DG6B fix-round report. Reuse those existing definitions first. This family remains **non-emitting, prepared without admission** until separate registration and retention resolution.

Producer: **handlers::persona::select**. Observe only the selected result of cmd.persona.select for the original explicit Settings resolver target. P-060 supplies Everywhere, Computer, optional Project and thread defaults; Models supplies requested/effective resolution. A No-project target admits only library reach that includes No project; Only these projects refuses there. The existing persona_select_result_v2 remains the exact selected closed owner result. Its authenticated owner_result_ref resolves the newly authored closed persona_selected_resolution record (CV-691), preserving operation_id/persona_id/result/selection-target joins. That frozen record and the event use requested_persona, effective_persona, persona_selection_source, selection_reason, persona_override_scope, persona_override_owner_id and runtime_snapshot_ref/runtime_snapshot_sha256. These fields are not added to the pinned generic command result root. The snapshot carries the complete canonical applied/skipped controls and applicable execution identity. Metadata selection has no invented run/thread; an actual execution context must carry its real joins. History and conversion never recompute an earlier selection from current Settings. The separate resolution is held by the existing selected owner-result custody behind owner_result_ref. Measure the complete Storage canonical MessagePack encoded resolution value independently of both the event body and the operation. A complete value at or below 16,384 bytes may be inline; above that limit the existing SP-337 payload store holds the complete original resolution before the owner result is acknowledged. Its closed physical carrier is persona_selected_resolution_storage: schema_id/schema_version plus payload_ref (BLAKE3 id, encoded byte_size and application/msgpack), bounded to 16,384 encoded bytes. The source adapter supplies the independently authenticated physical value and resolved bytes; readers verify current access, durability, exact BLAKE3/size/media/bytes, canonical decode/re-encode, the closed logical schema and typed agreement with the original owner result and frozen selection. Missing, foreign, deleted or conflicting resolution custody refuses append, retry, history and recovery. This reuses SP-337 and the existing owner result, adds no stored family and leaves retention pending; externalizing the event or operation alone never proves this separate limit.

The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/persona_selected` (closed root, version 1.0.0), routed by CV-691 with this family’s individual SP-672 subsection. Bind scope to the original selected WorkflowScopeV2 request and actual owning Server, not focus or a Computer mirror. `home_kind`, `home_ref`, `home_project_id`, `project_version_id`, reach, source hashes, owner revision, Client and return refs come from authenticated original request/result custody. Runtime identity uses only the canonical names in section 10; legacy `_id` fields are migration/source-lineage aliases and cannot be parallel fields. The event stores refs and hashes, never PERSONA.md body, prompts, credentials, or arbitrary output. Refs require current source authorization and deletion checks. These technical bindings change no feature, scope choice, deletion policy or retention class.


The selected payload, stored operation payload and authenticated frozen resolution independently enforce section 10: persona_override_scope is thread, run, node, attempt or actor only when persona_override_owner_id equals the corresponding actual runtime_lineage thread_id/run_id/node_id/attempt_id/actor_id. The complete required-present nullable runtime_lineage comes from the frozen original runtime snapshot, joins the original resolution and supplies any applicable EventRecord execution joins; tier and tier_id are forbidden even when all copied source values agree. Metadata-only Settings selection uses persona_override_scope=null and persona_override_owner_id=null with no invented execution lineage. Project scope, definition home and Settings target are not runtime override owners. The root and stored schemas close these domains; coherent retired-tier and mismatched actual-lineage negatives run through the full checker.

For `persona.selected`, the event payload, stored operation payload, frozen resolution and its physical inline representation enforce the canonical `persona_selection_source` enum: `user_selected`, `project_default`, `role_default`, `policy_override`, `fallback`, `everywhere_default`, `computer_default`. `runtime_selection_source` is a separate field; `manual` and arbitrary names are refused. Retained Project-era records using the original five source values and scope-aware records using the two successors keep their exact original bytes and owner recipe.

<a id="P-125"></a>
### P-125 - persona.updated prepared event contract

```yaml
plan_unit_id: P-125
unit_type: contract
status: accepted
owner_doc: Plans/Personas.md
canonical_text: >-
  persona.updated prepared event contract. Newly authored exact-family technical contracts under DL-045, prepared without admission;
  existing P-060, UCC-214, CV-365 and canonical runtime identity govern behavior.
gui_related: false
gui_classification_reason: Defines persisted owner contracts, not new visual presentation.
depends_on: [DL-045, P-060, CV-365, SP-672]
unblocks: []
acceptance_criteria:
- Exact-family positive and negative oracles pass; admission and retention remain separately gated.
validation_surfaces: [scripts/pm-dg6b-event-contracts.py]
risk_class: event_authority
reasoning_tier: high
context_scope: event_authority_dg6b
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DG6B.md
implementation_surfaces: [Plans/Personas.md, Plans/dg6b_event_contracts.schema.json]
node_compile_hint: {mode: contract_only, create_worknodes: false}
```

**Newly authored owner contract for `persona.updated` at payload version `1.0.0`.** Per-family search of current top-level Plans Markdown/JSON/JSONL and the exact command/schema/storage owners found the selected `persona_update_request_v2`/`persona_update_result_v2` behavior and generic receipt/index definitions, but no exact-family closed event schema, operation identity, receipt adoption or named operating reader. Search queries, negative counts, matching lines and source hashes are pinned in the DG6B fix-round report. Reuse those existing definitions first. This family remains **non-emitting, prepared without admission** until separate registration and retention resolution.

Producer: **handlers::persona::update**. Observe only the updated result of cmd.persona.update after expected_owner_revision CAS, full PERSONA.md validation, whole-record commit to the actual home, and authenticated readback. Computer mirrors are read-only. A library Save writes the settings home; creating a same-ID Project version is the separate save-as-override route. Record the exact previous revision/hash and resulting revision/hash; stale CAS or protected-ID shadowing refuses before mutation. A retry never reapplies a patch, creates a Project version, or changes frozen runs.

The payload is exactly `Plans/dg6b_event_contracts.schema.json#/$defs/persona_updated` (closed root, version 1.0.0), routed by CV-691 with this family’s individual SP-672 subsection. Bind scope to the original selected WorkflowScopeV2 request and actual owning Server, not focus or a Computer mirror. `home_kind`, `home_ref`, `home_project_id`, `project_version_id`, reach, source hashes, owner revision, Client and return refs come from authenticated original request/result custody. Runtime identity uses only the canonical names in section 10; legacy `_id` fields are migration/source-lineage aliases and cannot be parallel fields. The event stores refs and hashes, never PERSONA.md body, prompts, credentials, or arbitrary output. Refs require current source authorization and deletion checks. These technical bindings change no feature, scope choice, deletion policy or retention class.

The `persona.updated` oracle independently verifies the authenticated original target `persona_id` against section 6's nine protected core built-in IDs. A source `protected_id=false` cannot authorize a protected target even when source/request/result/frozen copies agree. Selection and export retain their existing eligibility.
