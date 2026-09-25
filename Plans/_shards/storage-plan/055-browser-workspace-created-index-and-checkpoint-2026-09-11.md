# Shard 055: Browser workspace-created index and checkpoint — 2026-09-11

Source: `Plans/storage-plan.md`

Source lines: L19777-L20103

Source SHA256: `f91e21867f151dee9381285aa30c8f975bb8857128d1f02ec43555f30ae75e4e`

---

## Browser workspace-created index and checkpoint — 2026-09-11

These are **newly authored technical Storage definitions under DL-046**, for
`browser.workspace.created` only. Existing generic EventRecord index, dedupe and
survivor rules are reused in their owned roles; none previously assigned this
Browser consumer. The `run.started` checkpoint and Shared Integration Runtime's
closed domain enum are not Browser bindings. SP-262's existing source-event
retention assignment is unchanged; no Browser session/profile, ProgramWorkspace,
lease, content or capture physical family is admitted here.

### Exact source, consumer and derived value

Define **new binding** `storage.browser_workspace_created_index.v1@1.0.0`.
It reads the existing `event_record_index` output, value
`pm.storage_value.event_record_index.v2@2.0.0`, at
`event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`. Resolve
the row by exact family ID and its closed registry value schema; array position
does not confer authority. The sole semantic reader is the newly defined
`browser.workspace_inventory.created.v1@1.0.0` in SMPFS-167. There is no
independent Usage/Prompt consumer effect or cursor for this event.

Define **new derived physical checkpoint family**
`browser_workspace_created_index_checkpoint`, exact key
`browser_workspace_created_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`,
closed value `pm.storage_value.browser_workspace_created_index_checkpoint.v1@1.0.0`
at `Plans/browser_workspace_created_contracts.schema.json#/$defs/checkpoint`.
`storage_instance_id` is the actual Storage UUID; `scope_partition` is the existing
`project~{base64url_no_pad(UTF8(project_id))}` encoding. This key covers all
retained creation facts in that Project, not a current workspace or global index.
The family has no compatibility write key. Only the new Storage binding writes
it; the Browser reader never writes index rows or checkpoints.

The checkpoint fixes the exact event, binding and schema versions. Its complete
survivor cursor contains manifest/recovery generation, segment generation/name,
frame byte offset, last sequence/event identity, survivor-prefix digest and
projector schema version. It records the actual full-index checkpoint reference,
CURRENT selection digest, first-retained and examined-through bounds, filter
completeness, health, state and an explicit nullable withdrawal time. An empty
verified source range has both bounds and cursor null; a missing checkpoint is
not an empty/current range. Nonempty bounds satisfy first <= through and cursor
last-sequence == through. Resume rereads the last examined frame inclusively,
validates identity/digest, then continues; it never repeats a semantic effect.

### Publication and exact scope filter

1. The existing full EventRecord index projector independently validates and
   publishes the complete CURRENT-selected index generation with its own global
   checkpoint. The Browser binding cannot create, advance or replace that global
   checkpoint. Failure of this filtered reader does not invalidate a sound generic
   metadata index or hold up its publication.
2. Under a consistent Storage maintenance/read snapshot, enumerate the declared
   retained Project index range in sequence order. Verify key/value identity,
   publication/source locators and hashes against the actual selected seglog
   frames and full-index checkpoint. Validate frame bounds, CRC, EventRecord,
   registered payload, identity/dedupe and permitted source provenance. Legal
   allocator gaps and authorized removals require their manifest evidence;
   unknown/unregistered, malformed, corrupt or unexplained missing input cannot
   count as examined coverage. One matching row, a maximum sequence, pagination
   or a timestamp does not prove completeness.
3. For `browser.workspace.created`, validate the unique closed payload and
   SMPFS-167 creation semantics. Topology/session/workspace are in the actual
   payload, not the generic index: resolve bytes before comparison with the
   requested exact Project/Home Server/Host/Environment/Source/session/workspace.
   A verified nonmatch is a filter skip; unreadable input is not. Conflicting
   creation identities for the same scoped workspace cannot be silently deduped.
   Original owner-result/permission refs are opaque evidence; their presence is
   not a current permission grant. Historical read does not require restoring a
   live owner resource or dereferencing deleted content.
4. Compute only the bounded historical creation join against that snapshot.
   Commit **only this filtered checkpoint**, with prior-cursor CAS and unchanged
   CURRENT/full-index/manifest/survivor identity, source range, access and deletion
   fence. The atomic owned effect is checkpoint advancement plus eligibility to
   publish that read-only join from the exact snapshot; there is no separate
   durable Browser projection row. A fence change before commit aborts/discards
   the candidate checkpoint and join. Before disclosure, recheck access,
   tombstones and the read token; a later reader must reacquire it. A change
   after commit blocks disclosure and makes the committed checkpoint historical,
   never current for the changed source; it does not undo a committed transaction.
   Crash before commit leaves the
   old checkpoint; crash after commit recomputes the join without runtime effects.

The `current` state requires a complete verified retained range and healthy source
evidence. `degraded` preserves actual survivor/loss provenance and is never healthy
or mutation authority. `withdrawn` forbids new publication or advancement. Missing
or corrupt checkpoint, mismatched version, unavailable source, changed CURRENT,
unresolved loss, stale read token or failed CAS returns typed unavailable/stale
without advancing this cursor. No successful checkpoint claim can be inferred
from schema validity or a fixture's supplied verification booleans.

### Replay, recovery, retention, deletion and withdrawal

Storage's existing app-root event identity and scoped event-type/idempotency
identity are authoritative. Same identity and producer-semantic digest returns
the original result; changed digest is `idempotency_conflict`, unavailable dedupe
proof is `dedupe_unavailable`. The original event and source hashes are never
replaced by reconstructed owner results. No alias, extension, old candidate
schema, local receipt backfill or unregistered migration is accepted.

Rebuild only this disposable checkpoint from the verified CURRENT-selected
EventRecord/index source. Compaction remaps semantic event/sequence identity only
with matching survivor proof, never by old physical offsets or timestamps. A
shadow checkpoint is not publishable before synchronized CURRENT activation.
Unsupported binding/schema fences this reader until StorageMigrationCoordinator
installs the explicit compatible reader or governed rebuild. Invalid derived
bytes use existing Q-DERIVED custody. No runtime process, controller, workspace
profile, canonical owner record, UsageRecord or prompt delivery is reconstructed.

The event retains the existing SP-262 **`RP-AUTHORITY-INDEFINITE@1.0.0`** assignment:
creation anchor, metadata-only indefinite retention, no TTL/cardinality eviction,
hold eligible and fail-closed pressure. Event identity/dedupe retains its existing
app-root lifetime. The generic index keeps **`RP-EVENT-INDEX-SOURCE@1.0.0`**.
This disposable checkpoint uses the existing derived-projection policy
**`RP-PROJECTION-3GEN@1.0.0`**: current plus history, terminal-transition anchor,
604800 seconds, at most three physical generations per logical key, holds,
`rebuild_projection` overflow and `rebuild` expiry. No policy definition changes.
For this checkpoint the terminal transition is first durable withdrawal; set
`withdrawn_at_utc` once and preserve it on repeats. Normal refresh, Browser close,
Run completion or a CURRENT switch does not start/reset its TTL. A withdrawn
value cannot become current through ordinary refresh. Missing derived data means
rebuild, not source expiry or a new source hold.

Apply current Project/thread access and deletion tombstones before every normal
read/publication and after recovery. Removing a Project from the list is not
physical purge; separately confirmed data deletion follows the existing scoped
Storage intent/compaction and hold rules. Hide deleted workspace/thread content
and return routes before purge; retained content-free audit facts do not recreate
visibility, search, export or live resources. Profile/page/artifact/receipt content
keeps its own custody and can become unavailable independently. IDs, hashes,
cursor and opaque non-secret refs confer no access or capability; no credentials,
protected-auth identities, local paths or content copies enter this checkpoint.

For event-writer withdrawal, stop creation publication at SMPFS-167's barrier
and fence unresolved prepared resources; checkpoint-only withdrawal fences this
reader without changing independent native creation authority. Preserve original
events and identity evidence under existing retention/deletion rules, withdraw
the dependent read publication, identify the exact owner-approved successor and
version, rebuild through StorageMigrationCoordinator, verify scope/cardinality/
source/currentness/deletion, then allow the adopted reader. No silent reset to
zero, sibling checkpoint reuse, bulk Browser admission or destructive history
rewrite is a migration path.

<a id="conditional-sp-266-v2-successor-adopting-the-sp-278-read-token"></a>
### Conditional SP-266 v2 successor adopting the SP-278 read token — 2026-09-23

These are **newly authored technical Storage definitions under DL-046** for
`browser.workspace.created` only. The depth gap they answer is recorded in
`reports/event-authority-20260911/step-08-browser-pair-depth-assessment-20260923.md`.

The registered v1 value and binding above remain the current definitions until a
separately installed successor is admitted. They do not encode SP-278's complete
advancing-frontier read token, so a v1 checkpoint cannot by itself certify current
SP-278 coverage. The exact successor target is the same
`browser_workspace_created_index_checkpoint` family and logical v1 key, with a
distinct `pm.storage_value.browser_workspace_created_index_checkpoint.v2@2.0.0`
value, `storage.browser_workspace_created_index.v2@2.0.0` binding and SMPFS-167's
versioned v2 read consumer. It changes no event, source policy, payload, producer,
generic index owner, or Browser session/profile physical family. The v1 schema
and stored digest meanings remain immutable compatibility custody; an old value
is never default-filled or relabeled as a current v2 checkpoint.

Newly authored under DL-046 for `browser.workspace.created` only, the v2 value is
defined by
`Plans/browser_workspace_created_checkpoint_v2.schema.json#/$defs/checkpoint`. The
registry materialization must match that definition and the exact referenced
SP-278 `read_token` field definitions and `coverage.last_frame` definition. It
fixes event, projector and schema identity and stores the nine-field durable read
token described below, the examined global first/through bounds, an inclusive
source cursor including frame-end offset, filter completeness, health, state and
first-withdrawal time, plus `publication_id`, first `published_at_utc`,
`hold_refs` and at most two `retired_generations`. The v1 `index_schema_id`,
`index_schema_version`, `index_checkpoint_ref` and `current_selection_sha256`
fields are not carried forward, and neither are the v1 cursor's
`manifest_generation`, `recovery_epoch`, `survivor_prefix_sha256` and
`projector_schema_version` components: the read token's source selection binds the
manifest generation, recovery epoch and survivor prefix, the value's own schema
and projector versions replace the cursor's projector schema version, and the
cursor gains `frame_end_offset`. `#/$defs/generation_transaction`
(`pm.browser_workspace_created_checkpoint_generation_transaction.v2`) and
`#/$defs/cleanup_transaction`
(`pm.browser_workspace_created_checkpoint_cleanup_transaction.v2`) are newly
authored read-only resolver views of the actual same-key redb commit, not physical
records; a supplied dictionary authenticates nothing.

The v2 current value must bind the actual SP-278 read token: exact generic root
key, generation JSON Pointer, immutable anchor, advancing frontier revision and
digest, physical dataset and complete source selection. Its `index_read_token`
stores exactly those nine fields, as
`Plans/browser_workspace_created_checkpoint_v2.schema.json#/$defs/durable_index_read_token`,
and never the tenth SP-278 field, `redb_snapshot_id`. This follows DL-076, the
Storage owner decision on stored SP-278 checkpoint tokens: a stored checkpoint
token is the nine-field durable token without `redb_snapshot_id`, on the
`DurableGenericToken` precedent,
because SP-311 treats the snapshot id only as a live transaction fence that is
never persisted. The writer before commit and every reader before disclosure join
the id of the redb read snapshot it actually pinned to the stored nine fields, and
validate the resulting complete ten-field SP-278 `read_token` for that transaction
alone; the joined token is never written back. A separate registration must add
this row to the checkpoint rows that the section 2.3.1 SP-278 read-token rule
enumerates. The value's inclusive last-examined frame covers the complete generic
range, including verified nonmatching events, rather than only the last creation
match. Every read reacquires a real SP-278 snapshot, joins the retained source
frames and full-index checkpoint, and revalidates the complete token and
Project/access/deletion fence before disclosure. An append may change the frontier
without changing the generation or an older row; generation equality, maximum
matching sequence and old selection digest cannot establish currentness. The
filtered writer still commits only its own checkpoint under prior-value CAS and
unchanged source/currentness fences; the historical join is published read-only
from that exact snapshot and is never a durable Browser projection row.
Uncertainty refuses publication.

StorageMigrationCoordinator alone may install this successor against the actual
store graph and version ceilings. It first authenticates the old v1 row, codec,
Project/source and all applicable hold/reference custody, and independently
rebuilds the v2 current value from complete verified CURRENT-selected SP-278
source. One same-key transaction reserves lawful `RP-PROJECTION-3GEN@1.0.0`
capacity, joins the exact authenticated v1 preimage, replaces the current value
and preserves its finalized decoded v1 core as retired history. If v1 was already
withdrawn, preserve its complete core and original `withdrawn_at_utc` unchanged.
Otherwise that transaction performs the first durable withdrawal, changing only
its state, `updated_at_utc` and `withdrawn_at_utc` to the actual commit time.
Because v1 had no publication birth identity, the history wrapper uses
`v1_custody_bound_at_handoff`: its new identity and custody-bound time come from
the handoff, not a guessed v1 birth. Its `retired_at_utc` equals the finalized
v1 core's first `withdrawn_at_utc`, even if that precedes handoff; its successor
ID identifies the actual committed v2 publication. Preserve all existing holds
and protected history; one
current plus at most two retired cores is the limit, with no fourth staging key
or early eviction. Unknown old custody, unsupported codec, unresolved hold, full
protected capacity, incomplete source or uncertain transaction outcome leaves
v2 currentness unavailable. A retired v1 core is historical derived evidence,
never an alternate current reader. After the handoff commits,
`storage.browser_workspace_created_index.v1@1.0.0` cannot write this key; its CAS
against a v2 value fails closed.

Newly authored under DL-046 for `browser.workspace.created` only, the v2
generation custody is stated here in full, not inferred from a sibling; it
restates for this key the rules the reset section gives its own checkpoint. The
same redb `checkpoints` value at the unchanged logical key holds the entire
generation set: one current core plus at most two closed `retired_generations`
cores without recursive history. There is no secondary history key, unspecified
redb generation slot or backup substitute. Every v2 core has a stable
`publication_id`, first `published_at_utc` and `hold_refs`; a v2 history entry
contains exactly `checkpoint_core` and `successor_publication_id`, and the only v1
entry is the `v1_custody_bound_at_handoff` wrapper above. An entry's terminal
anchor is its core's actual first `withdrawn_at_utc`, which for the v1 wrapper is
its `retired_at_utc`; it is never birth, cursor time or a guessed retirement.
Every retained core joins this exact Storage/Project/partition. Publication IDs
are unique and never retire into themselves, and old successor refs are not
retargeted when later history is cleaned up.

Only initial governed publication, a verified rebuild or an explicitly admitted
binding successor, such as this v1 handoff, allocates a new publication identity.
The coordinator selects that identity once and reuses it on retry. An ordinary
refresh preserves the current publication ID, first publication time, hold refs
and every history entry. It changes only the verified token, bounds, cursor,
health/state and observation time; observation time and the examined range never
regress, and a withdrawn value is never refreshed. Generic append or rebuild does
not itself retire this filtered generation. Any separately authorized hold update
serializes through the existing hold owner, not ordinary traversal.

A v2-to-v2 replacement requires a complete verified source rebuild, exact
predecessor CAS, current coordinator/maintenance/hold/reference fences and a
lawful reserved slot. One redb commit withdraws an active predecessor at the
commit time, archives its complete finalized core with the selected successor ID,
preserves all older entries byte-for-byte and publishes the new complete core
under a new publication ID with no v1 custody. An already-withdrawn predecessor
keeps its entire core and first withdrawal time. Successor birth equals the actual
commit time and cannot precede the prior observation. One current core plus two
retained predecessors consume all three slots: a fourth publication waits for
lawful cleanup and never drops history, overwrites a held generation or stages in
a hidden fourth key.

Cleanup selects one exact retired publication ID and removes only that entry in a
same-key compare-and-swap commit, preserving the current core and every sibling
byte-for-byte. Eligibility begins inclusively at that entry's first withdrawal
plus 604800 seconds and requires complete current hold/ref resolution, authorized
maintenance/access/deletion and the same-redb fence used by hold admission and
capacity reservation. Resolve stored `hold_refs` through the unchanged
`retention_hold_record` owner and enumerate all applicable existing
application/Project/thread/Run/event/receipt and live/backup/recovery references;
no new hold scope or meaning is introduced. Missing hold resolution blocks
cleanup. Archived cores never become current by moving them to the root.

This successor requires its closed registered schema, explicit reader/admission
revisions and native migration, source, permission and crash proofs before
activation; this conditional target alone grants none of them.

### SP-266 - Browser workspace-created single-family persistence binding

```yaml
plan_unit_id: SP-266
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Newly define storage.browser_workspace_created_index.v1@1.0.0 and the derived
  browser_workspace_created_index_checkpoint family for browser.workspace.created
  only under DL-046. Independently published generic EventRecord index coverage,
  source-byte scope joins, survivor/currentness evidence and a fenced atomic
  filtered-checkpoint commit precede the read-only historical inventory publication.
  Existing event/index retention remains unchanged and the derived checkpoint uses
  RP-PROJECTION-3GEN. Event membership requires its exact registry row and reviewed
  binding; native producer, durability, security and runtime acceptance remain open.
gui_related: false
gui_classification_reason: This defines Storage persistence and replay authority, not visual design.
depends_on: [DL-046, SP-262, SP-278, SMPFS-167, CV-332]
unblocks: []
acceptance_criteria:
  - Exactly one new event family and one derived checkpoint may be admitted by this landing; all preceding event/storage rows and all 24 retention policies remain unchanged.
  - Exact source frame, payload scope, full-index checkpoint, CURRENT and survivor proof precede this filtered checkpoint and snapshot-qualified disclosure.
  - Missing, corrupt, withdrawn, stale, cross-scope, conflicting or unsupported inputs have no checkpoint advance, current read publication or runtime effect.
  - Empty-range proof is explicit; replay duplicates, restart, compaction, deletion, withdrawal and lost acknowledgement cannot resurrect or duplicate a workspace.
  - Static positive/negative schemas and semantic oracles are separate from unperformed native crash, producer, permission and storage proofs.
  - A v2 SP-278 successor requires complete frontier/source token, authenticated same-key v1 retirement and lawful three-generation custody before current use; v1 remains current until that separate admission.
validation_surfaces: [Plans/browser_workspace_created_contracts.schema.json, Plans/browser_workspace_created_contract_fixtures.json, tests/test_pm_browser_workspace_created.py, python3 scripts/pm-browser-event-admission.py, Plans/browser_workspace_created_checkpoint_v2.schema.json, Plans/browser_workspace_created_checkpoint_v2_fixtures.json, python3 scripts/pm_browser_workspace_created_v2.py]
risk_class: browser_workspace_created_source_or_checkpoint_authority_drift
reasoning_tier: high
context_scope: browser_workspace_created_single_family_storage
implementation_surfaces: [Plans/event_family_registry.json, Plans/browser_event_admission.json, Plans/storage_value_registry.json, Plans/browser_workspace_created_contracts.schema.json]
node_compile_hint: {mode: static_single_family_admission, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-046, Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe, Plans/storage-plan.md#SP-278]
negative_constraints:
  - No other Browser event, canonical Browser physical record, new retention/deletion choice, native proof, WorkNode, NodeSeed, readiness or governance seal.
  - Never borrow another family's binding identifiers, manufacture currentness or rewrite original event identities.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-046, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-167, ContractName:Plans/Contracts_V0.md#CV-332, SchemaID:pm.storage_value.event_record_index.v2, SchemaID:pm.storage_value.browser_workspace_created_index_checkpoint.v1, ContractName:Plans/storage-plan.md#SP-278, SchemaID:pm.storage_value.browser_workspace_created_index_checkpoint.v2
