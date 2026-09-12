# Shard 021: Goal-created reader package graph and original installation

Source: `Plans/Release_Supply_Chain.md`

Source lines: L1367-L1466

Source SHA256: `12a0786d3c9f3afa7b43b24796ffc62366c3a7e9548dffa599237635b281145c`

---

## Goal-created reader package graph and original installation

RSC-018 applies RSC-014 and DL-045 to SP-298's separate Goal reader resource graph.

The logical embedded resource is exactly `pm.goal.created.reader_support_map`, format pm.goal.created.reader_support_map.v1, contract version 1.0.0. Its closed five-field schema is Plans/goal_created_reader_support_map.schema.json. Fields are format_tag, contract_version, bindings, page_budget and roles. Roles are exactly current_page, active_v3_interpretation, retained_whole_v2_interpretation and original_command_member_resolution, each supported|unsupported. The supplied contract template sets all four native roles unsupported; finite offline models do not implement or install those native roles. A later installed package can declare supported only with genuine original implementation and installation proof; changing a bit alone supplies neither.

Plans/goal_created_reader_contracts/resource-bindings.json fixes all seven logical names, exact schema/artifact IDs and contract versions, actual byte lengths and SHA-256 hashes. reader_contract_sha256 binds the one closed request/page/failure/private-cursor/member schema resource. route_contract_sha256 binds the exact two-route JSON artifact. sp278_schema_sha256 binds the complete existing SP278 schema file. retained_v2_payload_schema_sha256 binds original old whole-v2 bytes, not a reserialization. active_v3_payload_schema_sha256 binds the exact landed current v3 bytes. command_wrapper_schema_sha256 binds the exact landed original command schema bytes. member_mapping_sha256 binds the exact two-member mapping resource. Resource descriptors are fixed independent contract material, not arbitrary caller paths.

There is no self-hash cycle: schema/route/member resource bytes contain exact IDs and structural refs, but no own digest, package-map digest or enclosing executable digest. The map hashes those seven actual leaf resources. The enclosing original verified executable covers map and resources; its hash/provenance lives outside the map. The later private cursor can hash the installed map because it is not embedded into it. The catalog is not a new eighth binding, physical family or authority; original installation must enforce its fixed names/IDs/versions and exact admitted bytes. Supplemental original schema dependencies are pinned in Plans/goal_created_reader_contracts/schema-dependencies.json and must resolve through the genuine installed graph, never an internet or schema-trial fallback.

Route and member artifact schemas accept their exact two immutable records and no additional values. Their JSON array order is fixed; it is not matching priority or a fallback chain. The active/retained resources preserve existing payload IDs and original whole-v2 semantics. No payload/command/receipt/storage version or policy changes here. The landed SP-294/GRS-066/CV-341 original Goal start prerequisite remains required; this reader grants no producer authority.

Required original participants are the existing actual install-source/update owner, independently authenticated running-image owner, StorageMigrationCoordinator, actual Store/native source/maintenance owner, original SP278 root/dataset read owner, current Project/audit/deletion/hold/reference owners, original shared receipt/full-value owner, independent Goal body receipt owner and original command retained reader. Actual selected target, running image, installation scope, admitted executable/map/resource bytes and exact role graph must agree at attachment, cold open and final operation disclosure. Old migration receipts, copied maps, diagnostic JSON, booleans or equal hashes are insufficient. Missing native selection, snapshot/fence or atomic page/cursor session mechanism leaves that operation unavailable.

Current-page roles require exact installed interpreters for supported matching source and complete generic admission; no retained compatibility is dropped while active/backup obligations require it. Member resolution has independent retained-read/receipt dependencies and does not require the current-page role or live Goal input. Reader support grants no original Goal creation, source progression, event/receipt issuance, backup writer or arbitrary fresh-root restore authority.

Before selection/downgrade/rollback, original owners enumerate all relevant pending commands, retained terminal members, active/current and legacy Goal-created source, original append/receipt custody, registered backups and protecting references/holds across every enrolled scope. Lost enumeration is not absence. Actual final update selection compares complete original obligations and selected/candidate package contents under its original serialization; genuine intervening effects remain preserved. Missing native enumeration or selection means unavailable, not a model replacement.

This is a distinct Goal contract; Platform RSC-017 remains unchanged and supplies no Goal implementation evidence. No new store version, migration graph edge, durable capability/selector/cursor service, package archive, retention cap/TTL or GUI is introduced. If a future native adapter needs extra durable custody, its owner contract must be resolved before admitting it. Family checkpoint is none_required only for this passive inspection facet; generic SP278 remains mandatory and the durable Goal projector remains unclosed.

The fixed supplemental `Plans/goal_created_reader_contracts/schema-retrieval-bindings.json` is mandatory original installed-graph metadata. Its single absolute retrieval URI resolves the already-bound active-v3 resource bytes, with the same original relative `$id`, byte length and hash. Its exact schema accepts only that mapping. This is neither an extra payload route nor an eighth map digest binding. The original verified package covers this metadata as part of its complete installed graph. Installation and lookup must use the exact mapping; no remote fallback, rewritten schema bytes or guessed URI alias is permitted. The reachable wrapper/event/member graph must resolve recursively before the corresponding reader role is supported. Unselected inherited definitions retain their own separate graph requirements.

The exact canonical resource locations are:

| Logical resource | Canonical bytes |
|---|---|
| `contracts/pm.goal.created.reader_contract.schema.v1` | `Plans/goal_created_reader_contracts.schema.json` |
| `contracts/pm.goal.created.routes.v1` | `Plans/goal_created_reader_contracts/routes.json` |
| `schemas/pm.event_record_index_checkpoint.schema.v1` | `Plans/event_record_index_checkpoint.schema.json` |
| `schemas/pm.goal_runtime_event.goal_created.schema.v2` | `Plans/goal_created_reader_contracts/retained-v2.schema.json` |
| `schemas/pm.goal_runtime_event.goal_created.schema.v3` | `Plans/event_payloads/goal_runtime/goal_created.schema.json` |
| `schemas/pm.goal_start_command_custody.schema.v1` | `Plans/goal_start_command_custody.schema.json` |
| `contracts/pm.goal.start.command_member_mapping.v1` | `Plans/goal_created_reader_contracts/command-members.json` |

The metadata and artifact schemas and their constant rows are contract material, not additional map bindings. `schema-dependencies.json` maps seven exact selected transitive assets to canonical repository paths. Its current Goal-runtime dependency includes CV-342's additive update definitions and descriptive root metadata, while all original start definitions and every selected Goal-created reader validation object remain exact. The dependency pin follows the actual complete canonical bytes; all other dependency bytes and all seven leaf bindings remain unchanged. This coordinated package-template change grants no installed role and does not relabel the earlier ordinary capture as a run of the updated dependency graph. The exact retrieval metadata and its adjacent closed schema preserve the active resource's original relative `$id`. All metadata, artifact schemas and transitive resources must be covered by the actual verified package graph. The support-map template is `Plans/goal_created_reader_contracts/support-map.json`; changing its role bits never supplies implementation or admission.

### RSC-018 - Goal Reader Resource Graph And Installation Authority

```yaml
plan_unit_id: RSC-018
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Release_Supply_Chain.md
canonical_text: The Goal reader package graph binds seven exact leaf resources plus its complete schema
  and retrieval metadata to actual selected and running original executable owners; role support and withdrawal
  require complete current original obligations and final selection authority.
gui_related: false
gui_classification_reason: Defines internal passive read formats and owner publication boundaries without
  visual presentation.
depends_on:
- RSC-014
- DL-045
- DL-048
unblocks: []
acceptance_criteria:
- Exact fixed resource names, IDs, versions, whole byte lengths and SHA-256 bind the closed four-role
  map; copied existing schema bytes preserve their original serialization and IDs.
- Actual verified package coverage includes artifact schemas, exact retrieval metadata and the complete
  selected transitive graph without remote fallback, guessed aliases or a self-hash cycle.
- Selected and independently authenticated running executable owners agree in the original installation
  scope at attachment, cold open and final disclosure.
- Complete original pending command, terminal member, active/retained source, append custody, registered
  backup and protecting reference obligations govern selection and withdrawal across every enrolled scope.
- Missing native enumeration, original snapshot/session release or installed role implementations makes
  the route unavailable; static support bits and analogous Platform evidence do not fill the gap.
- No durable selector, package archive, cursor table, TTL, storage version, migration edge, retention
  policy or native readiness is added.
validation_surfaces:
- Plans/goal_created_reader_support_map.schema.json
- Plans/goal_created_reader_contracts/resource-bindings.json
- reports/event-authority-20260911/step-08-goal-reader-validation.md
risk_class: unproved_or_incompatible_reader_installation
reasoning_tier: high
context_scope: goal_created_reader_installation_graph
implementation_surfaces:
- Plans/Release_Supply_Chain.md
- Plans/goal_created_reader_support_map.schema.json
- Plans/goal_created_reader_contracts/resource-bindings.json
node_compile_hint:
  mode: passive_reader_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/storage-plan.md#SP-278
- Plans/storage-plan.md#SP-286
- Plans/storage-plan.md#SP-294
- Plans/Goal_Runtime_System.md#GRS-066
negative_constraints:
- Do not grant Goal mutation, source issuance, event append, checkpoint publication or action authority
  from this passive facet.
- Do not infer native installation, complete event depth, runtime readiness or governance closure from
  resource bytes or bounded offline observations.
owner_hints:
- Plans/storage-plan.md
- Plans/Goal_Runtime_System.md
- Plans/Release_Supply_Chain.md
```

ContractRef: ContractName:Plans/Release_Supply_Chain.md#RSC-018, ContractName:Plans/Release_Supply_Chain.md#RSC-014, ContractName:Plans/storage-plan.md#SP-298, ContractName:Plans/goal_created_reader_support_map.schema.json
