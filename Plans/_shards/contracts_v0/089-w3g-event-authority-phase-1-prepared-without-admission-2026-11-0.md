# Shard 089: W3G event authority phase 1 - prepared without admission (2026-11-05)

Source: `Plans/Contracts_V0.md`

Source lines: L47168-L48548

Source SHA256: `7607355445ed385c0f6b89282b6688e97f8b115e7918712a620fc8f56d52bf35`

---

## W3G event authority phase 1 - prepared without admission (2026-11-05)

### CV-1500 - assistant_plan.build_started: closed payload and identity

```yaml
plan_unit_id: CV-1500
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.build_started alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.build_started@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per
  semantic occurrence, durably bound by its original owner result before event append. A command contributing more
  than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1500
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.build_started
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-build-started@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_build_started.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_build_started.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1500, ContractName:Plans/storage-plan.md#SP-1500

### CV-1501 - assistant_plan.cancelled: closed payload and identity

```yaml
plan_unit_id: CV-1501
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.cancelled alone under deck-2 9.a A (DL-450); prepared
  without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic
  digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application
  semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.cancelled@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per semantic
  occurrence, durably bound by its original owner result before event append. A command contributing more than one
  occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus cannot
  remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1501
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.cancelled
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-cancelled@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_cancelled.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_cancelled.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1501, ContractName:Plans/storage-plan.md#SP-1501

### CV-1502 - assistant_plan.completed: closed payload and identity

```yaml
plan_unit_id: CV-1502
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.completed alone under deck-2 9.a A (DL-450); prepared
  without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic
  digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application
  semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.completed@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per semantic
  occurrence, durably bound by its original owner result before event append. A command contributing more than one
  occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus cannot
  remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1502
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.completed
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-completed@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_completed.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_completed.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1502, ContractName:Plans/storage-plan.md#SP-1502

### CV-1503 - assistant_plan.created: closed payload and identity

```yaml
plan_unit_id: CV-1503
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.created alone under deck-2 9.a A (DL-450); prepared
  without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic
  digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application
  semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.created@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per semantic
  occurrence, durably bound by its original owner result before event append. A command contributing more than one
  occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus cannot
  remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1503
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.created
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-created@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_created.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_created.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1503, ContractName:Plans/storage-plan.md#SP-1503

### CV-1504 - assistant_plan.exported: closed payload and identity

```yaml
plan_unit_id: CV-1504
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.exported alone under deck-2 9.a A (DL-450); prepared
  without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic
  digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application
  semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.exported@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per semantic
  occurrence, durably bound by its original owner result before event append. A command contributing more than one
  occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus cannot
  remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1504
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.exported
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-exported@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_exported.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_exported.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1504, ContractName:Plans/storage-plan.md#SP-1504

### CV-1505 - assistant_plan.version_created: closed payload and identity

```yaml
plan_unit_id: CV-1505
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.version_created alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.version_created@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1505
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.version_created
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-version-created@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_version_created.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_version_created.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1505, ContractName:Plans/storage-plan.md#SP-1505

### CV-1506 - assistant_plan.wizard_handoff_created: closed payload and identity

```yaml
plan_unit_id: CV-1506
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for assistant_plan.wizard_handoff_created alone under deck-2 9.a A
  (DL-450); prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged
  producer semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced.
  CV-366 owns application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  assistant_plan.wizard_handoff_created@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- APR-1506
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- assistant_plan.wizard_handoff_created
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-assistant-plan-wizard-handoff-created@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_wizard_handoff_created.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/assistant_plan_wizard_handoff_created.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Assistant_Plan_Runtime.md#APR-1506, ContractName:Plans/storage-plan.md#SP-1506

### CV-1507 - external_research.budget_denied: closed payload and identity

```yaml
plan_unit_id: CV-1507
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for external_research.budget_denied alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  external_research.budget_denied@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1507
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- external_research.budget_denied
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-external-research-budget-denied@1.0.0`, scope policy `project_only`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/external_research_budget_denied.schema.json#/$defs/ProjectPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/External_Research.md#ERS-1507, ContractName:Plans/storage-plan.md#SP-1507

### CV-1508 - external_research.finding_classified: closed payload and identity

```yaml
plan_unit_id: CV-1508
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for external_research.finding_classified alone under deck-2 9.a A
  (DL-450); prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged
  producer semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced.
  CV-366 owns application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  external_research.finding_classified@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1508
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- external_research.finding_classified
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-external-research-finding-classified@1.0.0`, scope policy `project_only`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/external_research_finding_classified.schema.json#/$defs/ProjectPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/External_Research.md#ERS-1508, ContractName:Plans/storage-plan.md#SP-1508

### CV-1509 - external_research.job_terminal: closed payload and identity

```yaml
plan_unit_id: CV-1509
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for external_research.job_terminal alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  external_research.job_terminal@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1509
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- external_research.job_terminal
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-external-research-job-terminal@1.0.0`, scope policy `project_only`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/external_research_job_terminal.schema.json#/$defs/ProjectPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/External_Research.md#ERS-1509, ContractName:Plans/storage-plan.md#SP-1509

### CV-1510 - external_research.packet_delivered: closed payload and identity

```yaml
plan_unit_id: CV-1510
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for external_research.packet_delivered alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  external_research.packet_delivered@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1510
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- external_research.packet_delivered
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-external-research-packet-delivered@1.0.0`, scope policy `project_only`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/external_research_packet_delivered.schema.json#/$defs/ProjectPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/External_Research.md#ERS-1510, ContractName:Plans/storage-plan.md#SP-1510

### CV-1511 - external_research.topic_started: closed payload and identity

```yaml
plan_unit_id: CV-1511
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for external_research.topic_started alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  external_research.topic_started@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- ERS-1511
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- external_research.topic_started
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-external-research-topic-started@1.0.0`, scope policy `project_only`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/external_research_topic_started.schema.json#/$defs/ProjectPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/External_Research.md#ERS-1511, ContractName:Plans/storage-plan.md#SP-1511

### CV-1512 - goal.paused: closed payload and identity

```yaml
plan_unit_id: CV-1512
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for goal.paused alone under deck-2 9.a A (DL-450); prepared without
  admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic digest;
  no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application semantic/source/physical
  domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}. Original Project
  source hash recipes remain exact. For this family's Project event the new idempotency key is goal.paused@1:{hex(owner_operation_id)}.
  Allocate one immutable original owner_operation_id per semantic occurrence, durably bound by its original owner
  result before event append. A command contributing more than one occurrence uses a separately allocated original
  owner operation for each; transport request IDs/time/focus cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- GRS-1512
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- goal.paused
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-goal-paused@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/goal_paused.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/goal_paused.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-1512, ContractName:Plans/storage-plan.md#SP-1512

### CV-1513 - goal.resumed: closed payload and identity

```yaml
plan_unit_id: CV-1513
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for goal.resumed alone under deck-2 9.a A (DL-450); prepared without
  admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic digest;
  no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application semantic/source/physical
  domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}. Original Project
  source hash recipes remain exact. For this family's Project event the new idempotency key is goal.resumed@1:{hex(owner_operation_id)}.
  Allocate one immutable original owner_operation_id per semantic occurrence, durably bound by its original owner
  result before event append. A command contributing more than one occurrence uses a separately allocated original
  owner operation for each; transport request IDs/time/focus cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- GRS-1513
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- goal.resumed
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-goal-resumed@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/goal_resumed.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/goal_resumed.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-1513, ContractName:Plans/storage-plan.md#SP-1513

### CV-1514 - notebook.checkpoint_committed: closed payload and identity

```yaml
plan_unit_id: CV-1514
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for notebook.checkpoint_committed alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  notebook.checkpoint_committed@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1514
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-notebook-checkpoint-committed@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_checkpoint_committed.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_checkpoint_committed.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1514, ContractName:Plans/storage-plan.md#SP-1514

### CV-1515 - notebook.checkpoint_failed: closed payload and identity

```yaml
plan_unit_id: CV-1515
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for notebook.checkpoint_failed alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  notebook.checkpoint_failed@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per
  semantic occurrence, durably bound by its original owner result before event append. A command contributing more
  than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1515
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-notebook-checkpoint-failed@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_checkpoint_failed.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_checkpoint_failed.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1515, ContractName:Plans/storage-plan.md#SP-1515

### CV-1516 - notebook.entry_committed: closed payload and identity

```yaml
plan_unit_id: CV-1516
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for notebook.entry_committed alone under deck-2 9.a A (DL-450); prepared
  without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic
  digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application
  semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  notebook.entry_committed@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per semantic
  occurrence, durably bound by its original owner result before event append. A command contributing more than one
  occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus cannot
  remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1516
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-notebook-entry-committed@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_entry_committed.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_entry_committed.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1516, ContractName:Plans/storage-plan.md#SP-1516

### CV-1517 - notebook.entry_superseded: closed payload and identity

```yaml
plan_unit_id: CV-1517
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for notebook.entry_superseded alone under deck-2 9.a A (DL-450); prepared
  without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer semantic
  digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns application
  semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  notebook.entry_superseded@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id per
  semantic occurrence, durably bound by its original owner result before event append. A command contributing more
  than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1517
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-notebook-entry-superseded@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_entry_superseded.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_entry_superseded.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1517, ContractName:Plans/storage-plan.md#SP-1517

### CV-1518 - notebook.transition_state_changed: closed payload and identity

```yaml
plan_unit_id: CV-1518
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored owner contract for notebook.transition_state_changed alone under deck-2 9.a A (DL-450);
  prepared without admission. Use Contracts_V0.md#EventRecord and CV-317 for the envelope and unchanged producer
  semantic digest; no family-local envelope, numeric encoder, timestamp parser or codec is introduced. CV-366 owns
  application semantic/source/physical domains and its exact idempotency key application@1:{hex(server_id)}:{hex(owner_operation_id)}.
  Original Project source hash recipes remain exact. For this family's Project event the new idempotency key is
  notebook.transition_state_changed@1:{hex(owner_operation_id)}. Allocate one immutable original owner_operation_id
  per semantic occurrence, durably bound by its original owner result before event append. A command contributing
  more than one occurrence uses a separately allocated original owner operation for each; transport request IDs/time/focus
  cannot remint it. Event ID is w3g@1:{hex(storage_instance_id)}:{hex(scope_partition)}:{hex(event_type)}:{hex(owner_operation_id)};
  hex means lowercase UTF-8 byte encoding under CV-366, not a hash or number serialization. The source issuer reserves
  that identity once and reuses it across retry. Same selected identity/semantic digest returns the original result;
  changed semantic body is idempotency_conflict. Digest comparison excludes Storage-assigned sequence_id/observed_at_utc/persisted_at_utc
  exactly as CV-317 specifies. Normal writers and retries reject projector_replay_only before append success. Numeric
  domains remain those of the exact source schemas, and producer canonicalization must qualify the existing CV-317
  RFC8785 route before any native effect; unsupported exact values refuse that route, never narrow a schema or round.
  Phase 2 adopts the reviewed shared NUMRULE helper, including exact integer spelling/type, signed zero/float distinction
  and authenticated historical recipe dispatch. Envelope timestamps follow CV-317 and CV-253's Storage UTC-Z profile
  where applicable, through the shared reviewed date-time helper; format alone is not validation. No payload timestamp
  is added.
gui_related: false
gui_classification_reason: Defines event data, custody and passive reads; existing visual owners retain presentation.
depends_on:
- WN-1518
- CV-317
- CV-366
unblocks: []
acceptance_criteria:
- Every payload selector is closed and every schema reference resolves offline before any branch is evaluated.
- Current identity inputs use the shared exact number/format rule; retained history uses its authenticated original
  recipe.
validation_surfaces:
- Plans/event_authority_w3g/oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_original_authority_or_replay_loss
reasoning_tier: high
context_scope: event_authority_w3g_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
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
- projector_replay_only
negative_constraints:
- No admission, current writer enablement, registry family append, Decision Log entry or governance seal.
- No native proof, WorkNode, NodeSeed, new product behavior or chosen pending retention rule.
```

Proposed family identity is `event-family-notebook-transition-state-changed@1.0.0`, scope policy `application_or_project`. Envelope `event_type` equals the selected payload event_type and envelope `payload_schema_id` equals that exact payload schema_id; each selected payload schema_version is 1.0.0. The exact source issuer, source schema id/version and whole source digest are independently verified, never selected from caller input alone.

Payload selectors:

- `ProjectPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_transition_state_changed.schema.json#/$defs/ProjectPayloadV1`.
- `ApplicationPayloadV1`: `Plans/event_authority_w3g/payloads/notebook_transition_state_changed.schema.json#/$defs/ApplicationPayloadV1`.

Each selected payload must join the exact original source wrapper, scope partition, Server, actor/permission, thread, subject, run/node/attempt and causality. Null joins remain null; no synthetic run, Project or source is supplied. For research, a job/topic ID is not an Executor run ID. For notebook worker lineage, real run/node/attempt joins come from its scope owner; thread-private forms leave unrelated joins null. Plan events use the actual PlanRun only when present; Goal active_run_ref is separately resolved to the native execution owner. SP-337 externalizes any body above 16384 encoded UTF-8 bytes: inline payload is null and payload_ref selects exact original decoded payload/schema/hash/size; inline form has null payload_ref. Both forms have identical semantic dispatch and restriction checks. Every redb stored part is independently bounded under SP-340. No base64 copy or stringified JSON body is admitted.

ContractRef: ContractName:Plans/Working_Notebook.md#WN-1518, ContractName:Plans/storage-plan.md#SP-1518
