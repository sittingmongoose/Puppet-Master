# Shard 058: Browser workspace-reset filtered checkpoint — 2026-09-11

Source: `Plans/storage-plan.md`

Source lines: L20668-L20896

Source SHA256: `52ae76de5ed144388f39fe96ec8b82ebc782286cbd0860e1cb0fc6a39c434f38`

---

## Browser workspace-reset filtered checkpoint — 2026-09-11

These are **newly authored Storage technical definitions under DL-046** for
`browser.workspace.reset` alone, after its individual existing-first search.
SP-278's newly concrete generic projector/reader/checkpoint is reused in that
exact role. It is not a reset-specific binding, and the created-only SP-266
checkpoint is neither reused nor silently upgraded by this section.

### Exact physical and semantic binding

Define `storage.browser_workspace_reset_index.v1@1.0.0` as the sole writer of
the new derived family `browser_workspace_reset_index_checkpoint`, in redb's
existing `checkpoints` namespace. Its exact logical key is
`browser_workspace_reset_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`;
Storage instance is the actual UUID and Project partition is the existing
`project~{base64url_no_pad(UTF8(project_id))}` encoding. It covers examination of
all retained reset facts for that Project, not the state of one live workspace.
There is no alias or compatibility write key. The sole semantic read consumer is
`browser.workspace_inventory.reset.v1@1.0.0` in SMPFS-168.

The canonical MessagePack value is
`pm.storage_value.browser_workspace_reset_index_checkpoint.v1@1.0.0`, defined by
`Plans/browser_workspace_reset_contracts.schema.json#/$defs/checkpoint`. The registry
materialization must match that definition and the exact referenced SP-278
`read_token` and `coverage.last_frame` definitions. It fixes event/projector/schema
identity; stores the complete read token, examined first/through bounds, inclusive
source cursor including frame-end offset, filter completeness, health, state and
first-withdrawal time. Bounds describe the **examined global captured range** of
the generic index; the semantic filter remains this exact Project and event.
They are not the minimum/maximum matching reset sequence. A proven empty generic
source has null bounds/cursor; a nonempty source with zero resets still has its
actual examined bounds/cursor. Missing or unreadable coverage is not empty.

`index_read_token` explicitly adopts SP-278's exact root key and generation JSON
Pointer, generation/anchor digest, advancing frontier revision/digest, physical
dataset, captured source-selection object and pinned redb snapshot identity.
The token's Storage instance must equal this checkpoint's instance; its source
selection must belong to that same instance. The selected node ID, root pointer,
node state, dataset and token must join exactly. Anchor/frontier digests use only
SP-278's existing `pm.event_index.binding.msgpack_sha256.v1` recipe; this does not
change source/payload/producer-semantic or filtered-checkpoint CAS hash recipes.

A stored snapshot ID is historical provenance, not a reopenable native snapshot
or a restart credential. Every read/recovery reacquires an actual SP-278 reader
snapshot/source fence and revalidates the complete token. Equality of generation
ID alone is insufficient: an ordinary append can advance frontier/source while
preserving the generation and all older index rows.

A fresh read may have a different native snapshot ID while all persistent
root/generation/anchor/frontier/source bindings remain unchanged. Bind that new
ID only to the actual newly acquired read snapshot; do not rewrite the stored
checkpoint merely to inspect it. This transient rebind grants no permission to
replace any persistent token field or accept changed source/frontier coverage.

### Complete source filter and atomic advancement

1. `reader.storage.event_record_index@1.0.0` must first establish the independently
   published, CURRENT-selected, globally complete SP-278 snapshot. Resolve the
   actual root in `checkpoints` and the selected `event_record_index.v2@{generation_id}`
   table in the same redb instance. Verify live source controls, frames, hashes,
   CRC, coverage, lawful gaps, schema dispatch and dedupe through that owner.
   Neither this filtered writer nor a supplied token can publish the generic index.
2. Scan the complete declared captured range with the exact Project/event filter.
   Resolve matching source EventRecord/payload bytes and verify registry admission,
   envelope/source/index identity and SMPFS-168's reset semantics. Topology,
   session, workspace and generation are payload facts, not generic index metadata.
   Verify prior/new generation edges; conflicting identities/digests cannot be
   silently deduped or interpreted as a new reset. A verified nonmatch may be
   skipped; unsupported, corrupt, unavailable or unexplained missing source may not.
   Historical inspection does not reconstruct or require reviving the original
   Browser process/result/receipt content. Producer-time resolution requirements
   remain distinct from current read-access checks.
3. Compute only the bounded historical reset join. Under the same source/access/
   deletion/maintenance fence, commit **only this checkpoint**, using exact
   prior-value/cursor CAS. The global root/generation/anchor/frontier/read token,
   complete examined range, permission and tombstone predicates must still match.
   Do not write index rows, the global checkpoint, Browser owner state, UsageRecords
   or prompt delivery. Prior-key scope changes, unproved empty ranges, stale CAS
   and cursor regression require failure or governed rebuild, never ordinary advance.
4. Revalidate the token and current access/deletion fence before disclosing the
   computed read result. A post-commit change blocks disclosure; it does not undo
   an already committed checkpoint. Crash before commit leaves the old value;
   crash after commit recomputes the read join under newly validated authority.
   Inclusive restart rechecks the last complete frame's exact identity and end
   offset before continuing and never repeats a reset or other domain effect.

`current` requires healthy, complete verified coverage. `degraded` preserves the
actual generic survivor/loss status and grants no healthy/latest or mutation claim.
`withdrawn` prohibits ordinary advance/disclosure. Empty, degraded and zero-match
coverage remain distinguishable. A source change, changed frontier with the same
generation, unsupported binding, missing physical source/table, invalid checkpoint,
failed CAS, permission loss or tombstone returns typed unavailable/stale without
falsely advancing or presenting current authority.

### Recovery, retention, deletion and withdrawal

Rebuild this disposable checkpoint only through StorageMigrationCoordinator from
verified CURRENT-selected source and the adopted SP-278 token. Install the exact
physical family through the actual migration graph/ceilings before use; do not
invent store-version integers. There is no source-event alias/backfill transform,
lazy sibling-key migration or schema-shaped source repair. Compaction translation
requires SP-278's actual semantic/survivor/source evidence; stale physical offsets
and timestamps cannot identify the new range. Unsupported or invalid derived
bytes use existing Q-DERIVED custody and governed rebuild. Neither index nor
checkpoint reconstitutes Browser session/profile/controller/result custody.

### Concrete same-key generation custody

The same redb `checkpoints` value holds the entire generation set: its current
core and `retired_generations`, at most two complete closed predecessor cores
without recursive history. There is no secondary history key, unspecified redb
generation slot or backup substitute. Every core has stable `publication_id`,
first `published_at_utc` and `hold_refs`, in addition to its source/token/state
fields. A history entry contains exactly `checkpoint_core` and
`successor_publication_id`. Its terminal anchor is the core's actual first
`withdrawn_at_utc`, not birth, cursor time or a guessed prior retirement. Every
retained core joins this exact Storage/Project/partition; publication IDs are
unique and never retire into themselves. Old successor refs record their actual
historical transition and are not retargeted when later history is cleaned up.

Only initial governed publication, a verified rebuild or an explicitly admitted
binding successor allocates a new publication identity. The coordinator selects
that identity once and reuses it on retry. Ordinary advance preserves the current
publication ID, birth, hold refs and every history entry; generic append/rebuild
does not itself retire this filtered generation. Any separately authorized hold
update serializes through the existing hold owner, not ordinary traversal.

`Plans/browser_workspace_reset_contracts.schema.json#/$defs/generation_transaction`
is a new read-only resolver view of the actual same-key redb generation commit,
not another physical record. It binds the original before/after values, exact key,
selected ID and actual commit time. Initial publication has null prior value and
empty history. Replacement requires complete verified source rebuild, exact
predecessor CAS, current coordinator/maintenance/hold/reference fences and a
lawful reserved slot. One redb commit first withdraws an active predecessor,
archives its complete finalized core with the selected successor ID, preserves
all older entries byte-for-byte, and publishes the new complete core. If the
predecessor was already withdrawn, preserve its entire core and earlier first
withdrawal time. Successor birth equals actual commit time and cannot precede the
prior observation. A supplied transaction dictionary does not authenticate that
operation or establish native custody.

One current core plus two retained predecessors consumes all three slots. A fourth
publication waits for lawful cleanup; it never drops history, overwrites a held
generation or stages in a hidden fourth key. Cleanup selects one exact retired
publication ID and removes only that entry in a same-key compare-and-swap commit,
preserving the current core and every sibling. Eligibility begins inclusively at
first withdrawal plus 604800 seconds and requires complete current hold/ref
resolution, authorized maintenance/access/deletion and the same-redb fence used
by hold admission and capacity reservation. Resolve stored `hold_refs` through
the unchanged `retention_hold_record` owner and enumerate all applicable existing
application/Project/thread/Run/event/receipt and live/backup/recovery references;
no new hold scope or meaning is introduced. Missing hold resolution blocks
cleanup. Archived cores never become current by moving them to the root.

The source event retains SP-262's exact `RP-AUTHORITY-INDEFINITE@1.0.0` assignment:
creation anchor, bounded metadata retained indefinitely, no TTL/cardinality
eviction, hold eligible and fail-closed pressure. App-root identity/dedupe remains
unchanged. Generic index rows retain `RP-EVENT-INDEX-SOURCE@1.0.0`; SP-278 retains
its own exact root/generation policy. This checkpoint reuses existing
`RP-PROJECTION-3GEN@1.0.0`: current plus history, terminal-transition anchor,
604800 seconds, at most three physical generations per logical key, actual holds,
`rebuild_projection` overflow and `rebuild` expiry. No retention policy changes.

For this filtered binding, the terminal anchor is first durable withdrawal; set
`withdrawn_at_utc` once and preserve it on repeats. Normal cursor refresh updates
the current physical value and does not manufacture a new history generation.
Browser reset/close, Run completion and generic-index frontier/generation changes
do not start or reset this withdrawal TTL. Governed replacement/history remains
subject to the existing three-generation limit and hold/reference rules; lack of
a lawful slot blocks replacement, not protected-history eviction. A withdrawn
checkpoint cannot revive by ordinary refresh. Missing derived data authorizes a
governed rebuild, not expiry or extension of canonical source custody.

Current Project/thread permissions, deletion tombstones and content redaction
gate every read and recovery disclosure. Retained content-free reset metadata
does not restore deleted workspace/thread visibility, search, export, return
routes, profiles or artifacts. List removal and separately confirmed data purge
retain their existing meanings and scoped Storage intent/hold rules. Opaque refs,
IDs, hashes and cursors confer no access; credentials, protected-auth identities,
page/DOM/profile state, inline captures and local absolute paths are excluded.

Writer withdrawal prevents new event-dependent reset publication and fences
unresolved owner effects under SMPFS-168; it must not erase a known reset effect.
Checkpoint-only withdrawal fences this reader without changing the independently
owned Browser command. Preserve original event/dedupe evidence, identify an exact
owner-approved successor/version, install/rebuild through StorageMigrationCoordinator,
verify scope/coverage/currentness/deletion, then activate the adopted reader.
No silent zero-cursor reset, sibling reuse, bulk Browser admission, history rewrite,
global count override or governance reseal follows.

### SP-282 - Browser workspace-reset single-family persistence binding

```yaml
plan_unit_id: SP-282
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Newly define storage.browser_workspace_reset_index.v1@1.0.0 and the derived
  browser_workspace_reset_index_checkpoint under DL-046. Explicitly adopt the
  full SP-278 root/generation/anchor/frontier/source/read-snapshot token and
  complete examined coverage before atomic filtered-checkpoint CAS and fenced
  historical reset disclosure. Preserve original owner effects and all existing
  source/index/checkpoint retention, recovery, deletion and withdrawal boundaries.
gui_related: false
gui_classification_reason: Defines backend persistence, replay and source authority.
depends_on: [DL-046, SP-262, SP-278, SMPFS-168]
unblocks: []
acceptance_criteria:
  - The exact family/key/value/producer/consumer and SP-278 read-token schema are registered without sibling or compatibility substitution.
  - Complete global captured range and Project/reset source filter are verified, including empty, zero-match, degraded and unavailable distinctions.
  - Same-generation frontier changes invalidate publication; prior-value CAS and before/after-commit source/access/deletion fences prevent false advance or disclosure.
  - Recovery and withdrawal preserve original reset effects, source identity, actual owner custody boundaries and exact existing retention policies.
  - Same-key current plus two closed retired cores preserve original identities, birth/withdrawal anchors and siblings; full capacity, active holds or unresolved refs block replacement/cleanup without early eviction.
  - Synthetic schema/codec/oracle passes do not establish native authenticated resolution, indexed-reset end-to-end execution, durability or DEPTH_PASS.
validation_surfaces: [Plans/browser_workspace_reset_contracts.schema.json, Plans/browser_workspace_reset_contract_fixtures.json, Plans/storage_value_registry.json, tests/test_pm_browser_workspace_reset.py]
risk_class: stale_reset_projection_or_replayed_owner_effect
reasoning_tier: high
context_scope: browser_workspace_reset_single_family
implementation_surfaces: [Plans/storage-plan.md, Plans/browser_event_admission.json]
node_compile_hint: {mode: static_single_family_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage: [Plans/Decision_Log.md#DL-046, Plans/storage-plan.md#SP-278, Plans/storage-plan.md#SP-262]
negative_constraints:
  - No sibling event, Browser owner physical family, retention policy, launch-critical promotion, runtime capability or native execution proof is admitted here.
  - No currentness inferred from a generation alone, a stored snapshot ID, matching-row maximum, unavailable source, supplied booleans or schema validity.
  - No WorkNode, NodeSeed, readiness clearance, count override, historical-audit restamp or governance seal.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-046, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-168, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.storage_value.browser_workspace_reset_index_checkpoint.v1
