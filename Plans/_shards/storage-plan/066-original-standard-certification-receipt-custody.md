# Shard 066: Original Standard certification receipt custody

Source: `Plans/storage-plan.md`

Source lines: L22706-L22791

Source SHA256: `799c12082800fcfc0906e79e51d64d0a09e13479586919d3d81b2d73508bbe0f`

---

## Original Standard certification receipt custody

SP-289 owns one bounded technical extension under DL-045 to the existing `goal_receipt` family. GRS-065 owns original Workflow certification semantics and CV-340 owns exact schemas, source-value hashes and interface shapes. This prerequisite defines receipt custody only. It supplies no `goal_run.certified` producer, event append, GoalRun transition, Goal body mutation, event consumer/checkpoint, certification exception or native execution claim.

### Physical value and exact concurrent role routes

Use the existing canonical redb family and exact `goal_receipt.v1:{project_id}:{receipt_id}` key in the actual database selected by `storage_instance_id`. Preserve its existing key codec; do not invent alternate keys, escaped aliases or cross-store lookup. The selected key/raw Project/receipt identities and actual original Workflow target must agree. An occupied foreign/colliding key rejects; it is not renamed or overwritten. The family remains `canonical_non_rebuildable` with mandatory backup and unchanged `RP-AUTHORITY-INDEFINITE`. No new family, TTL, raw-source retention or source-admission journal is introduced.

The complete original generic schema is `Plans/goal_certification_custody.schema.json#/$defs/legacy_goal_receipt_v1`, exactly equal to the original registry root without its newly added `$defs`. The external schema root and registry root remain that generic v1 writer. All original nonempty receipt-kind/tier grammar, accepted/rejected/blocked decisions, required/optional/nullable fields, existing generic producer role and existing consumers remain available under their original authority. Shape permission is not permission for a new kind, tier or behavior.

The NEW `storage.goal_receipt.capture_standard.v2` binding writes only `#/$defs/standard_certification_custody_v2`, with `schema_id = pm.storage_value.goal_receipt.v2`, `schema_version = 2.0.0`, actual `storage_instance_id`, exact `physical_key`, lossless `legacy_goal_receipt` and `original_certification`. The last component uses GRS-065/CV-340 semantic version `1.0.0`. Its generic-shaped component has the original `goal_run_certification`/`standard`/`accepted` meanings, required nonnull GoalRun, exact original identities and no unresolved risks. It is not a second separately stored v1 row. The original Workflow supplies this component as part of its new immutable receipt; native creation verifies every source field and destination precondition.

`Plans/goal_receipt_version_routes.json` explicitly registers both writer roles and retained read routes using the disjoint schema ID/version pairs. `#/$defs/registered_current_write_value` and `registered_read_value` are value grammars only. Actual dispatch selects the role's exact schema and owner authorization; a generic caller cannot select the Standard role by a receipt-kind/tier string or by passing a union schema. Unknown, uninstalled, unsupported or withdrawn role/version pairs reject. The existing generic validator still validates the generic v1 root; it does not establish Standard dispatch, complete role coverage or native installation. This is a new family-specific definition, with no generic registry-validator change.

### First admission and immutable replay

The actual original Workflow controller or assigned canonical artifact owner resolves and authorizes GRS-065's complete original source, then supplies its typed original certification and generic-shaped component through its owner interface. Before first Storage publication, independently derive their expected complete bytes from the actual original owner records, including original source/authority/origin values and revisions. Do not authenticate a detached helper return by comparing it with another return from the same helper. Both the returned decision and the complete proposed stored afterimage must equal the independent original projection.

Capture verifies all Project/Goal/GoalRun/receipt/tier, source/workgraph revision, certifier/time, validator/source and complete child/WorkNode/criterion joins. It validates the exact selected value schema and original source hash recipe. Resolve original source/authorization and prepare/encode the complete row and return value before the final guard. Then compare the complete actual Workflow source, origin seals or equivalent native provenance, owner identity/revision, current Storage/access/installation/migration/backup/restore/quarantine facts, exact selected row/origin preimage and exact typed candidate bytes. Every dependent check and copy precedes those comparisons; no owner resolver or output copy follows them before atomic publication/disclosure.

First-write v2 requires the actual destination key to be absent under the held native transaction. An exact already-admitted v2 row replays only with the identical original decision/bytes and actual canonical origin. A present v1 row, even with matching identity and `accepted`, remains unchanged and is unavailable as Standard proof. This successor supplies no v1 promotion, historical backfill, conversion-on-read or occupied-key overwrite. The external fixture supplies a legacy-shaped original Workflow component while its destination model starts empty; it proves neither native same-store absence nor that a real v1 row was promoted.

One canonical transaction writes the complete v2 row; a failed attempt writes none. After commit, verify the actual committed row before exposing the original result. Receipt durability precedes the later event append required by D-R18. A later event/body failure cannot erase or restamp a real receipt; its separately owned producer must reconcile actual effects. Receipt capture alone neither emits an event nor completes a Goal.

### Retained reads, installation and lifetime

`storage.goal_receipt.read_standard.v1` accepts CV-340's exact five-field request, resolves the actual selected canonical row and requires v2. It validates the closed stored/semantic schemas, exact selector/source/identity joins, current family/reader installation, migration/backup/restore coherence, actual canonical origin, access and quarantine state. Materialize the typed original output before the final actual-owner/selected-row/request/output guard. Return only the original Standard certification metadata. Receipt-only disclosure does not require reacquiring lawfully disposed Workflow graphs, validator services, original grants or Goal text. It grants no current Goal/body availability, continuation, action, source visibility or event/current-index authority.

Existing generic readers explicitly dispatch the actual stored version. For v1 they retain the exact original value. For an authenticated v2 they may consume its unchanged generic-shaped component through the registered role route, preserving original kind/tier/decision meanings; this projection is not Standard certification proof and does not rewrite the stored row. Unsupported readers refuse the affected value. A missing/corrupt/unadmitted v2 cannot be rebuilt from the event, worker success, a body receipt, the generic component or current settings.

Before enabling Standard issuance, the actual `StorageMigrationCoordinator` installs both exact schemas, role dispatch, all affected retained readers and required backup/restore/origin/migration gates through the existing preflight, protected backup, verified target and rollback contract. Preserve original generic writes and values. Do not invent a global store-version edge, claim a named `$defs` route is installed, or use a prototype `proposal_version`/`proposal.1` row as a deployed migration source. Rollback or withdrawal cannot discard already-issued v2 authority; retain/restore it with a verified compatible reader or fence dependent use. Whole-family mandatory backups preserve both exact versions and original admission authority coherently.

The unchanged receipt lifetime covers content-free original decision metadata. Objective text/history/pending text remains under DL-047 and GRS-064/SP-287; receipt refs do not create new holds or extend referenced content lifetime. Raw Workflow documents, command/test logs, provider output and source workspaces remain outside this capsule. Physical loss retains truthful receipt recovery/loss and mutation-certification fences under GRS-042/SP-235.

Bounded evidence and exact installation limitations are recorded in `reports/event-authority-20260911/step-08-certified-custody-validation.md`. Actual original authentication, same-store key absence, native codec/transactions/fsync, coordinated role activation, backup/restore/crash execution and the complete GoalRun/event/body producer remain NOT_RUN. Shared body and first-AppendReceipt contracts are separately adopted by each eventual producer; they are not supplied by this receipt reader.

### SP-289 - Original Standard Certification Custody

```yaml
plan_unit_id: SP-289
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The existing goal_receipt family preserves its exact generic v1 writer and all prior roles while
  explicit Standard v2 capture/read routes retain the original authenticated Workflow decision.
  The Original Standard certification receipt custody contract owns exact first-write absence,
  immutable replay, source/candidate/output guards, version dispatch and unchanged mandatory
  backup/lifetime. Prototype rows, occupied v1 values and accepted markers never become Standard proof.
gui_related: false
gui_classification_reason: Defines internal original certification metadata, custody and owner interfaces; no GUI presentation is specified.
depends_on: [SP-214, SP-231, SP-235, SP-237, GRS-065, CV-340, DL-045]
unblocks: []
acceptance_criteria:
  - "Generic v1 root, field/version metadata, old kinds/tiers and producer/consumer duties remain exact; role routes select closed schemas explicitly."
  - "Standard first write joins actual original Workflow facts and an absent destination; exact admitted v2 replays, occupied v1 never upgrades or overwrites."
  - "Final complete source/origin/current-owner/preimage/candidate/output guards follow all dependent helpers before the atomic write or disclosure."
  - "Retained metadata reads survive lawful original-source/Goal-body disposal while preserving current disclosure and actual canonical origin checks."
  - "All version readers and actual role/backup/migration admission precede activation; native installation and complete event/body depth remain unproven."
validation_surfaces:
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_certification_custody_fixtures.json
  - Plans/goal_receipt_version_routes.json
  - reports/event-authority-20260911/step-08-certified-custody-validation.md
risk_class: false_certification_or_lost_original_decision_authority
reasoning_tier: high
context_scope: original_standard_certification_custody
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: original_standard_certification_custody
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20260911/step-08-certified-custody-checks.json
negative_constraints:
  - Do not infer certification from an accepted marker, worker success, body receipt, event or projection.
  - Do not claim native installation, event/body publication, exception authority or complete event depth from this prerequisite.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```

<a id="storage-integrity-finding-custody-and-read-contract"></a>
