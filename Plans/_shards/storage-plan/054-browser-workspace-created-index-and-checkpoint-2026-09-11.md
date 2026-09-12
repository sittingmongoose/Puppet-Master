# Shard 054: Browser workspace-created index and checkpoint — 2026-09-11

Source: `Plans/storage-plan.md`

Source lines: L19545-L19724

Source SHA256: `e72da89398067e67dcf3b6650e6769278329504112579bce60e481417e830907`

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
depends_on: [DL-046, SP-262, SMPFS-167, CV-332]
unblocks: []
acceptance_criteria:
  - Exactly one new event family and one derived checkpoint may be admitted by this landing; all preceding event/storage rows and all 24 retention policies remain unchanged.
  - Exact source frame, payload scope, full-index checkpoint, CURRENT and survivor proof precede this filtered checkpoint and snapshot-qualified disclosure.
  - Missing, corrupt, withdrawn, stale, cross-scope, conflicting or unsupported inputs have no checkpoint advance, current read publication or runtime effect.
  - Empty-range proof is explicit; replay duplicates, restart, compaction, deletion, withdrawal and lost acknowledgement cannot resurrect or duplicate a workspace.
  - Static positive/negative schemas and semantic oracles are separate from unperformed native crash, producer, permission and storage proofs.
validation_surfaces: [Plans/browser_workspace_created_contracts.schema.json, Plans/browser_workspace_created_contract_fixtures.json, tests/test_pm_browser_workspace_created.py, python3 scripts/pm-browser-event-admission.py]
risk_class: browser_workspace_created_source_or_checkpoint_authority_drift
reasoning_tier: high
context_scope: browser_workspace_created_single_family_storage
implementation_surfaces: [Plans/event_family_registry.json, Plans/browser_event_admission.json, Plans/storage_value_registry.json, Plans/browser_workspace_created_contracts.schema.json]
node_compile_hint: {mode: static_single_family_admission, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-046, Plans/storage-plan.md#case-l-5-eventrecord-persistence-legacy-normalization-and-dedupe]
negative_constraints:
  - No other Browser event, canonical Browser physical record, new retention/deletion choice, native proof, WorkNode, NodeSeed, readiness or governance seal.
  - Never borrow another family's binding identifiers, manufacture currentness or rewrite original event identities.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-046, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-167, ContractName:Plans/Contracts_V0.md#CV-332, SchemaID:pm.storage_value.event_record_index.v2, SchemaID:pm.storage_value.browser_workspace_created_index_checkpoint.v1
