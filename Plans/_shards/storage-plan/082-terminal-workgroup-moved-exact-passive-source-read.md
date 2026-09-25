# Shard 082: Terminal workgroup moved — exact passive source read

Source: `Plans/storage-plan.md`

Source lines: L26710-L26905

Source SHA256: `9d00ca32e97f9131d31c8fa5572d005a7d4613e03372eedf55b1d0c69ade6192`

---

## Terminal workgroup moved — exact passive source read

This is a **NEW Storage owner binding** under DL-045 for the existing registered
`terminal.workgroup_moved@1.0.0`, semantic producer/consumer owned by SMPFS-170.
The documented search in SMPFS-170 found the unchanged CV-323/payload/registry
contracts and generic SP-278 source reader, but no exact terminal-family reader,
projector or checkpoint binding. SP-273's Home reader and three physical families
are explicitly not terminal event custody. No sibling binding is borrowed.

Define `storage.terminal_workgroup_move.inspect_current.v1@1.0.0`, a private
passive single-event source reader used only by
`terminal.workgroup_move_history_read.v1@1.0.0`, for the committed-EventRecord
resolution that SMPFS-170 names. Its selector identifies the actual
Storage instance, Project, workgroup, exact event ID, original global sequence and
complete canonical index key. These join the actual original EventRecord; payload
has no workspace-tab field and none is inferred from a current Home tab. The reader
has no pagination, durable cursor, acknowledgement or reconstructed live state.
The exact family projection/checkpoint disposition is **`none_required`**, because
this owner assigns only a fresh one-event historical observation with zero durable
effects. This is an explicit per-family assignment, not absence mistaken for
closure. SP-278's generic projector/checkpoint remains independently mandatory.

### Complete source and original authority

Use actual `reader.storage.event_record_index@1.0.0` and the complete
`Plans/event_record_index_checkpoint.schema.json#/$defs/read_token`. In one real
redb snapshot resolve table `checkpoints`, key
`event_record_index_checkpoint.v1:{storage_instance_id}`, uniquely current
`current_generation_id`, exact `#/generations/{generation_id}` node and its
same-database `event_record_index.v2@{generation_id}` dataset. Resolve the selector's
exact key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`
through the unchanged canonical Project scope/key codec. No flat table, foreign
root, sibling checkpoint or optional lookup miss establishes source authority.

Preserve every complete token member: `storage_instance_id`, `checkpoint_key`,
`checkpoint_ref`, `generation_id`, `generation_anchor_sha256`, `frontier_revision`,
`frontier_sha256`, `index_dataset_name`, `source_selection`, `redb_snapshot_id`.
The entire closed source selection binds genuine synchronized CURRENT/manifest
bytes, selected generation, recovery epoch, survivor prefix, retained inventory,
durable watermarks, exclusions and retired inputs under SP-278's actual owner
codec. Validate complete global retained coverage, including nonmatching events
and other scopes, and all actual frame/index/value/key joins. A filtered maximum,
matching generation or caller-supplied token/hash is insufficient. A same-generation
append changes the frontier and invalidates the old current token. The tenth
member, `redb_snapshot_id`, is the live fence of this read's own redb snapshot and
is never stored (DL-076). This binding stores no read token. If a separately
admitted contract stores this observation or its token, it stores the nine-field
durable read token that SP-278 defines on 2026-09-24 (`DurableGenericToken`,
without `redb_snapshot_id`), and every later read joins the snapshot ID of its own
live read transaction. No stored value supplies, rewrites or manufactures a
snapshot ID.

The row's publication locator binds the immutable admitted birth anchor; the
advancing frontier independently binds current selected source. Authenticate
original anchor admission and reverify the anchored source prefix through current
retained source, without demanding overwritten birth controls forever. Follow
SP-278/Case L-2 for actual frame bounds/CRC/schema/payload, source-value bytes,
identity, scope, sequence and complete coverage/gaps. Compaction/relocation changes
current physical locators only through that source owner; it does not rewrite
original event facts or require current coordinates to equal first-append ones.
Unknown, malformed, unsupported, partial, stale or unauthenticated source refuses
disclosure; index-only equality never produces a historical fact.

For verified original-move semantics, independently resolve the actual original
terminal owner admission and immutable ProducerInput, original request/revisions,
predecessor membership, accepted target and section creation, the empty state of a
source section the move vacated, with no replacement workgroup, pane or session
(DL-070), full unchanged pane/session/PTY identity, actual terminal readback and
any applicable sibling
settlement, original result/SIR/CV-333 joins, and genuine original append authority.
SP-286/CV-339 require the real eleven-field first AppendReceipt and original append
result, actual original full EventRecord commitment and Storage-assignment joins,
resolved only through explicitly adopted `storage.first_append_receipt.resolve.v2`
and `storage.first_append_receipt.resolve_full_value.v1`; producer-semantic
equality, a legacy selector or a semantic reader alone is insufficient. Do not
acquire disposed controls
or reconstruct missing original command/result custody from a current terminal,
Home receipt or self-consistent event. The unchanged event payload has no result
or revision fields; resolve those obligations only through independently admitted
original owner custody, never guessed payload extensions. The companion original
result/custody schema and physical admission remain separate unfinished work under
SMPFS-170; they are not supplied by this passive reader.

### Disclosure, replay and custody boundaries

This private read returns one of three semantic outcomes, not a persisted record
or newly admitted public result schema. `verified_historical` means complete actual
current source plus independently verified original move obligations;
`unresolved_historical_validation` means current source/disclosure is authorized
but one or more original admission, request/revision, membership/target, result,
sibling settlement or append-custody obligations remain unproved; `unavailable`
means current source/access cannot authorize the read. The first two observations
carry the complete unchanged original EventRecord and the whole live read token of
this read's own snapshot (never persisted), with explicit original-validation
status and unresolved obligation names as applicable; unavailable discloses
neither. Neither observation certifies current
terminal state or grants action authority. The closed private result companion
must be defined and installed before runtime disclosure; these outcome names are
a normative obligation, not an already deployed schema or validator pass.

Current Project/access/deletion/maintenance permission must authorize every original
value/ref disclosed. Recheck complete current token, actual selected source,
permissions/tombstones, original resolved values and read output after all
returning helpers and immediately before disclosure under the owner fence. Denied
or changed current authority cannot be downgraded to unresolved-with-content.
Do not silently drop/redact fields and call the result the full original event.
The existing `reject_unhandled_secrets` rule remains. A retained event never grants
access to deleted terminals, transcript, credentials, session bodies or refs.

No reader write, checkpoint advance, new event, command/result fabrication,
notification, PTY operation, terminal state restoration, Home mutation, hold,
recovery action or effect replay occurs. Retry rereads actual source under a fresh
valid token and yields only authorized history. Missing old original evidence
remains explicitly unresolved, not reconstructed. Withdrawal stops the reader;
unsupported successors never silently adopt its identity. Whole existing payload
1.0.0 and EventRecord compatibility rules remain unchanged; no aliases, rewrite,
new family or extension is admitted.

The event retains `RP-AUTHORITY-INDEFINITE@1.0.0`; source/index/ref and original
result/pending custody retain their separate actual owner lifetimes. No fresh
indefinite body archive, hold, physical key, table or retention mapping is created.
An absent unmaterialized result store is an original-depth blocker, not an excuse
to assign Home custody or delete unresolved obligations. Generic SP-278 source
admission, source/first-receipt authenticity, original producer execution, actual
locks/codec/redb/fsync/crashes, migration and complete backup/recovery proof remain
**NOT_RUN**. Prose and schemas alone grant no DEPTH_PASS, readiness or governance
seal.

### Paired acceptance obligations

A positive static companion must independently join a real-shaped changed move,
exact membership and created-section truth, unchanged closed payload, original
result/append joins and complete current SP-278 source/token. Paired negatives
must reject a foreign operation/correlation, source owning another workgroup,
missing/extra/duplicated pane or session identity, changed PTY, wrong creation
fact, same-section no-op masquerading as move, a cancelled or failed
(rolled_back=true) operation carrying a moved event, a reseeded vacated source section
or reported reseed (DL-070), fifth-section admission, false
rollback after possible append, lost acknowledgement remint, missing required
Home sibling settlement, first-receipt/full-value substitution, stale same-generation
frontier, partial global coverage, foreign root/dataset, copied source token,
denied/deleted disclosure and historical replay attempting any durable effect.
A currently authorized authentic event with missing original move evidence yields
unresolved historical validation rather than verified original success; missing
current source yields unavailable with no event. Reader withdrawal yields no
new disclosure. These are required paired oracles for the companion task, not
claims of executed cases or native proof.

### SP-319 - Terminal workgroup moved passive source and checkpoint disposition

```yaml
plan_unit_id: SP-319
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The new storage.terminal_workgroup_move.inspect_current.v1 binding performs only an
  authorized single-event historical read through complete actual SP-278 root, generation, anchor,
  advancing frontier, source frames and read token. This family has no durable read effect or projector
  and its family checkpoint disposition is none_required. Original move validation separately requires
  actual terminal owner and shared append/full-value custody; unavailable original evidence is never rebuilt.
  The binding stores no read token, and any stored copy of its token is the nine-field durable token
  without redb_snapshot_id (DL-076).
gui_related: false
gui_classification_reason: Defines source authority and passive historical validation, not presentation.
depends_on: [SMPFS-170, CV-323, CV-339, SP-278, SP-286, DL-045, DL-076]
unblocks: []
acceptance_criteria:
  - Resolve exact actual same-database generic root/current node/dataset and full original frame/index join.
  - Preserve immutable birth-anchor versus advancing-frontier semantics and complete global coverage under the whole read token.
  - Verify original move and append/full-value authority independently of current authorized source inspection.
  - Use verified, unresolved-original and unavailable outcomes without granting live-state or action authority.
  - Recheck current access/deletion/source and complete values after helpers before disclosure; no partial original-value substitution.
  - No durable reader effect or family checkpoint exists; generic SP-278 remains mandatory.
  - Store no read token; the whole ten-field token exists only for this read's own redb snapshot, and any stored copy is the nine-field durable token without redb_snapshot_id (DL-076).
  - A verified original move that vacated its source section includes that section's empty state; paired negatives reject a reseeded vacated section or a reported reseed (DL-070).
  - Paired static oracles and closed original/read-result companions remain required, distinct from native proof.
validation_surfaces: [Plans/event_payloads/terminal_workgroup_moved.schema.json, Plans/event_record_index_checkpoint.schema.json, Plans/event_family_registry.json, Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-170]
risk_class: terminal_move_history_source_or_original_authority_escape
reasoning_tier: high
context_scope: terminal_workgroup_moved_only
implementation_surfaces: [Plans/storage-plan.md, Plans/Section15_MVP_Promoted_Features_Spec.md]
node_compile_hint: {mode: owner_contract_only, create_worknodes: false, create_nodeseeds: false, runtime_enabled: false}
source_lineage: [Plans/Decision_Log.md#DL-039, Plans/Decision_Log.md#DL-045, Plans/Contracts_V0.md#CV-323, Plans/storage-plan.md#SP-278, Plans/Decision_Log.md#DL-070, Plans/Decision_Log.md#DL-076, reports/event-authority-20260911/takeover-20260923.md, reports/event-authority-20260911/step-08-terminal-workgroup-draft-repair-20260924.md]
preserved_exact_tokens: [terminal.workgroup_moved, none_required, RP-AUTHORITY-INDEFINITE]
stale_retired_dispositions:
  - Drafted as SP-314 on the unlanded branch plans/terminal-workgroup-depth-20260923 (commit a475070763, rebased from 254505ccf9) and renumbered SP-319 on 2026-09-24,
    because SP-314 on main is a different accepted unit. SP-314 is not an alias of this unit and never resolves to it.
negative_constraints:
  - No registry, payload, retention policy, physical family/key, current terminal state or Home custody change.
  - No source reconstruction, implied original producer success, native proof, DEPTH_PASS or governance seal.
  - No stored redb_snapshot_id; no stored value supplies, rewrites or manufactures a snapshot ID (DL-076).
```

ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-170, ContractName:Plans/Contracts_V0.md#CV-323, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Decision_Log.md#DL-070, ContractName:Plans/Decision_Log.md#DL-076

<a id="coordination-event-persistence-binding-dl-045-2026-09-25"></a>
