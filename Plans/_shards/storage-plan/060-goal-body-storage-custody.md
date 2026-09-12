# Shard 060: Goal body storage custody

Source: `Plans/storage-plan.md`

Source lines: L21654-L21769

Source SHA256: `a8e786e0bcc52607867096ae89873fa6fffba05046fec6a8c727a5cde52cd9cd`

---

## Goal body storage custody

SP-287 owns the five canonical physical families for GRS-064's shared Goal body, accepted history, minimal origin, hidden control and original body-transaction receipt. Goal Runtime owns semantic acceptance, text, revisions, lifecycle and the exact mutation/read APIs. DL-047 supplies the approved bound-thread content lifetime. These physical records are a shared prerequisite; registration does not adopt another Goal event, close its original SIR/action/event/receipt authority, or grant Workflow certification.

### Five exact versioned physical values

Each family stores one redb value with exactly the three required outer members `{schema_id, schema_version, record}` and no additional members. The outer `schema_version` is exactly `1.0.0`. The schema and exact closed wrapper definitions live in `Plans/goal_body_custody.schema.json`; `Plans/storage_value_registry.json` points each family to its wrapper, not its inner semantic definition.

| Family | Exact key | Outer `schema_id` | Wrapper / inner definition | Retention |
|---|---|---|---|---|
| `goal_body_record` | `goal_record.v2:{P}:{G}` | `pm.storage_value.goal_body_record.v1` | `storage_body` / `body` | `RP-GOAL-THREAD-LIFETIME@1.0.0` |
| `goal_objective_revision` | `goal_revision.v2:{P}:{G}:{R}` | `pm.storage_value.goal_objective_revision.v1` | `storage_revision` / `revision` | `RP-GOAL-THREAD-LIFETIME@1.0.0` |
| `goal_objective_origin` | `goal_origin.v1:{P}:{G}:{R}` | `pm.storage_value.goal_objective_origin.v1` | `storage_origin` / `origin` | `RP-GOAL-THREAD-LIFETIME@1.0.0` |
| `goal_body_control` | `goal_body_control.v1:{P}:{G}` | `pm.storage_value.goal_body_control.v1` | `storage_control` / `control` | `RP-GOAL-THREAD-LIFETIME@1.0.0` |
| `goal_body_mutation_receipt` | `goal_body_mutation_receipt.v1:{P}:{G}:{O}` | `pm.storage_value.goal_body_mutation_receipt.v1` | `storage_receipt` / `receipt` | `RP-AUTHORITY-INDEFINITE@1.0.0` |

Definition names in the table mean exact `#/$defs/<name>` locations. The inner `record` retains the exact eleven-field body, nine-field objective revision, seven-field origin, or separately closed hidden control/receipt. The inner control/receipt's existing semantic schema IDs remain distinct from the outer physical IDs. The wrapper satisfies §2.3.1/SP-231 version requirements without adding a semantic Goal field or exempting these values from Storage rules. The shared schema dependency is not a sixth family or an extra stored copy. Existing `goal_runtime_lineage_record` and `goal_receipt` retain their independent shapes, owners and policies; neither supplies body CAS or reconstructs purged text.

`P`, `G` and `O` are lowercase hex of the exact UTF-8 Project, Goal and operation identifier bytes. `R` is the positive ordinary Goal revision in canonical decimal, with no leading zeroes or floating-point conversion. Reject malformed UTF-8, surrogate code points, noncanonical components and foreign scope. Do not normalize URI/path/Unicode, fold case or truncate. Join identifiers byte-for-byte to the actual owning Storage instance and semantic records. Revision and origin acquire no Project field: authenticate their Project through the selected owning Storage scope and joined body/control. Key prefixes never dispatch an unknown schema by inference.

### Canonical bytes and two comparison domains

All five rows use registry encoding `json_canonical` with GRS-064's exact local `pm.goal.canonical_json.v1` qualification: canonical UTF-8 JSON without BOM, closed ASCII properties, exact scalar strings/whitespace, canonical arbitrary-precision integers and exact decode/re-encode equality. Reject duplicate/extra properties, unsupported IDs/versions, noncanonical encodings, naked inner records, another family's wrapper and a wrapper nested inside `record`. `json_canonical` is an existing encoding token, not automatic activation or a global codec redefinition.

All currentness, objective-revision, body-byte, start-intent and pending-intent hashes cover their unchanged GRS-064 semantic inputs. `pending.after_record`, `pending.accepted_revision` and `pending.origin` remain inner records. The complete reserved semantic control comparison also remains unchanged. A physical whole-value preimage comparison or backup checksum covers complete outer bytes and is separately named; it never substitutes for a semantic hash, enters an existing semantic field or creates another durable record. No wrapper hash or recursive digest is introduced.

### Shared writer and authentic read admission

`owner.goal.body.mutation@1.0.0` is the sole native body mutation route for start, objective acceptance, metadata/lifecycle changes, `active_run_ref`, cancellation and receipt association. Goal Runtime supplies the actual original accepted-change/lineage and operation predicates. Storage authenticates selected-store/family/schema/codec/instance/migration/backup origin and provides the shared transaction and whole-key CAS. A caller-provided JSON object, authenticity flag, self-consistent checksum or process-local lock cannot supply those authorities.

Complete each semantic afterimage before wrapping it. Start atomically installs body revision 1, accepted revision/origin 1, control and original narrow receipt under absent-key CAS. Later mutations compare the actual complete physical outer preimage and semantic expected revision/currentness. A terminal reserved write additionally compares the entire actual nonnull pending control preimage and its `control_epoch`, never the old empty control or only the operation ID. In one transaction install the wrapped body/control, optional immutable accepted revision/origin and original narrow receipt, then read back exact canonical outer bytes. No partial body/history/control/receipt write set or successful result may escape.

Recheck actual current owner/approval/external predicates, owner and stop epochs, cancellation, permissions, deletion/holds, registration/schema/codec/install state, migration/backup origin and writer posture at the final boundary, or prove a native lease covering every fact remains valid. A changed posture invalidates a captured lease even if ordinary read-only use is otherwise allowed. This same joint final native boundary spans physical synchronization/admission, backup capture, restore, tombstone filtering and physical purge: bind both semantic source currentness/bytes and physical selected-origin/bytes together with the operation-specific current owner facts through the actual publication or destructive effect. Separately successful observations at earlier callbacks do not establish a joint lease. Receipt-only audit uses its current app/Project/audit and receipt custody facts without requiring ordinary body visibility; it does not waive the corresponding restore/deletion authority for filtering content. A wrapper-only write never advances Goal revision, adds history, reseals an old receipt, authorizes an action or clears a pending reservation. The independent durable host stop fence keeps priority while pending; missing external effects remain unresolved under the producer's own contract. The body transaction receipt is atomic evidence of this body commit, not an AppendReceipt or independent command/event success.

The exact readers are `reader.goal.body@1.0.0`, `reader.goal.objective_history@1.0.0` and `reader.goal.body_mutation_receipt@1.0.0`. Obtain bytes from the actual selected installed family and authenticated retained origin; verify outer schema/version/canonical bytes and key scope before applying inner hashes and coherent joins. At one final held boundary before disclosure, recheck both the semantic source currentness/bytes and physical selected-row origin/bytes, together with every covered current owner fact; separate earlier checks do not compose into a valid joint lease. Current body/history authenticate the complete current body/control and accepted revision/origin chain; pending afterimages remain invisible as current text. Accepted-history reads use original retained rows without rerunning approval or reconstructing original command/source generations. Source-body dereference still needs that source owner's surviving content and current authority.

The content-free receipt reader uses GRS-064's exact closed request, resolves the original immutable receipt independently at its operation key, and enforces current app/Project/audit disclosure authority and current receipt installation/origin. It requires neither a present body nor ordinary thread visibility. Thread deletion does not waive audit authorization. Return only original commit facts, with no current availability claim or objective/history text. Neither later commits nor matching caller-repaired bytes can re-admit a substituted old receipt. These are canonical native readers, not EventRecord projections or borrowed SP-278 checkpoints; event traversal needs its own complete adopted binding.

### DL-047 lifetime and deletion

`RP-GOAL-THREAD-LIFETIME@1.0.0` is the explicit machine assignment for the four content-bearing families. Retain body, every accepted revision, minimal origin and control including pending text while the exact bound thread remains retained, including archive. Context compaction, restart and model changes do not purge them. Apply no ordinary TTL/count eviction and no imported 250,000-message Goal-revision cap. A thread binding cannot be reassigned to escape deletion or transfer lifetime.

Actual thread deletion immediately persists the existing content-free tombstone, hides all bound Goal content from ordinary navigation/history/search/context/export and invalidates content read leases. Purge unheld active copies, pending captures, mirrors and derived content within 24 hours; deleted backup bytes remain at most 30 days unless a valid hold delays physical purge. Holds never restore ordinary visibility. Hold release and purge require the complete existing owner/deletion/eligibility predicates, not age, an audit ref or a guessed status. Protected recovery stays a separately authorized owner path. Confirmed Delete Project data follows existing reachability; Remove Project from list does not purge these rows.

`goal_body_mutation_receipt` is content-free original transaction audit under the independently assigned existing `RP-AUTHORITY-INDEFINITE@1.0.0`. It contains no objective, preview/request text, context body or history snapshot; its references create no content hold. Retained older runtime lineage, Goal receipts and other audits keep their own policies and cannot recreate deleted objectives. Source messages/context, attachments, Plans, To-Dos, workflows and evidence keep their independent lifetimes; a Goal reference does not materialize or retain their bodies. Existing no-secret/redacted-reference rules apply to every physical value.

### Coherent backup, restore and migration

All five families are canonical non-rebuildable with mandatory backup. While content is retained, capture a coherent scoped image: current body, current control including pending intent, all retained immutable accepted revision/origin pairs and original content-free mutation receipts. Do not mix new body with old control/history, regenerate receipt identities, refresh pending intent or reconstruct absent text from events, summaries, old runtime lineage or hashes.

Verify the complete scope/key set, exact outer/inner bytes, supported versions/codec, actual original backup provenance and semantic joins before restore admission. Missing/corrupt required members, broken history, lost pending custody, foreign origin or unsupported bytes fence dependent use and disclose owner recovery failure. Matching checksums or a detached image do not authenticate restore. Publication requires the actual coordinator's terminal admission and current owner/access/stop fences. Preserve original Storage/Goal identities according to that owner's genuine restore contract.

Five installed schemas do not require content rows after proved lawful DL-047 purge. A receipt-only image remains auditable under current app/Project/audit authority, preserving exact original receipts and hashes. Missing content without original lawful-deletion admission fails closed. Before an older predelete backup can publish, replay the genuine current deletion tombstones: discard purged content-bearing body/history/origin/control, retain and authenticate original content-free receipts and never expose deleted text. Absent or foreign deletion proof cannot authorize filtering. Mandatory coherent backup does not extend the four content families to receipt lifetime or authorize restoring deleted content.

Before activating any producer/reader, `StorageMigrationCoordinator` explicitly installs all five exact family/schema/version/codec routes and the semantic schema dependency together. Partial installation, an unsupported wrapper/version or an inferred key alias fences. Establish supported first-installation or explicit migration graph edges, selected source provenance, exclusive coordinator lease, coherent protected backup, verified target and schema/codec stamp-last, with actual terminal MigrationReceipt round trip. Existing encoding names, schema labels or absent rows are not first-installation proof.

Bare predecessor semantic JSON is not supported live wrapper input. Any genuine predecessor requires its separately explicit coordinator-owned migration edge and original admitted codec/custody: preserve exact accepted text and original hashes as migration evidence before installing new keys/digests. Do not reinterpret old hashes on read. GRS-056 retains V1 migration's dropped-structure accounting, in-flight paused/manual-stop posture and cancellation distinction, invalid scope quarantine, and only the authorized single revision 1 where no history exists. Missing historical acceptance/lineage stays unresolved; do not synthesize intermediate history, approvals or provenance. Adopt every writer through the shared API or disable it before activation. Withdrawal fences dependent use while preserving required original custody until a verified successor exists.

### SP-287 - Goal Body Physical Custody And Thread Lifetime

```yaml
plan_unit_id: SP-287
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Store exactly five canonical Goal body/history/origin/control/receipt families as closed
  schema_id/schema_version/record wrappers with independent physical and semantic byte domains.
  GRS-064 owns exact inner meaning and shared owner.goal.body.mutation@1.0.0 acceptance;
  Storage authenticates physical origin and supplies atomic whole-preimage custody, exact
  reader admission, coherent mandatory backup and explicit schema/codec migration.
  Four content families follow DL-047's bound-thread lifetime, immediate deletion hide and
  24-hour/30-day purge limits under valid holds. Original content-free receipts remain independently
  auditable without retaining or rebuilding purged text. Detailed Goal body storage custody
  governs terminal fences, restore/tombstone replay and activation; sibling events remain separate.
gui_related: false
gui_classification_reason: Defines physical storage, transaction, retention and recovery contracts; Goal presentation is owned by GRS-064.
depends_on: [SP-231, SP-235, SP-237, SP-239, GRS-064, DL-045, DL-047]
unblocks: []
acceptance_criteria:
  - Five exact versioned wrappers preserve semantic 11/9/7 records; canonical bytes, selected origin and scope authenticate every route.
  - All body writers share whole physical and semantic CAS, exact reserved control and final owner/stop/access fences.
  - Coherent write sets and mandatory backup preserve complete accepted history and original receipts without synthetic reconstruction.
  - Bound-thread deletion immediately hides content and enforces 24-hour active and 30-day backup purge unless held; holds do not restore visibility.
  - Receipt-only lawful-purge recovery preserves independent original audit and replays genuine tombstones before any visibility.
  - Exact schema/codec and writer/reader activation uses supported coordinator graph, protected backup, verify-before-stamp and terminal receipt.
validation_surfaces:
  - Plans/goal_body_custody.schema.json
  - Plans/goal_body_custody_fixtures.json
  - Plans/storage_value_registry.json
  - reports/event-authority-20260911/step-08-goal-body-validation.md
risk_class: goal_body_physical_origin_cas_retention_or_restore_authority_escape
reasoning_tier: high
context_scope: shared_goal_body_physical_custody_only
implementation_surfaces:
  - Plans/storage-plan.md
  - Plans/Goal_Runtime_System.md
  - Plans/goal_body_custody.schema.json
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/storage-plan.md#SP-231
  - Plans/Goal_Runtime_System.md#GRS-064
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-047
negative_constraints:
  - No sixth family, semantic field/version exception, new lifecycle, generic authority service or receipt-based content reconstruction.
  - No automatic Goal event adoption/depth, certification exception, native proof, WorkNode, NodeSeed, readiness or governance seal.
```

The schema/model, physical adapter and independent review evidence is recorded in `reports/event-authority-20260911/step-08-goal-body-validation.md`. Private issued-row/receipt/backup/deletion cells, source observations and transaction captures are bounded fixture adapters, not additional durable families or native authentication. Native concurrency/CAS/fsync, actual global writer adoption, owner/approval/stop enforcement, migration, coherent backup/restore, tombstone replay and 24-hour/30-day purge enforcement remain `NOT_RUN`.

ContractRef: ContractName:Plans/storage-plan.md#SP-287, ContractName:Plans/Goal_Runtime_System.md#GRS-064, ContractName:Plans/goal_body_custody.schema.json, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Decision_Log.md#DL-047, ContractName:Plans/Decision_Log.md#DL-045
