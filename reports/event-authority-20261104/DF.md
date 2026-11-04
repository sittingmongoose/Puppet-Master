# DF — FileSafe event authority draft

Branch: `plans/ea-w2-filesafe-20261104`. Contract head: `ad68e8d4bc5817cbdc5c14df6fb0970ff5a872a5`.
Base: `be4766513f` (origin/main when fetched). Worktree: `/home/sittingmongoose/pm-worktrees/DF` (left for lead integration).

**Status: technical drafts pushed for review, not depth complete or ready for admission.** No registry append, admission record, Decision Log entry or exclusion was written. Each row has its own owner contract, schema, reader/identity definition and fixtures. Retention is pending for all nine. Technical gaps are disclosed below rather than mislabeled product decisions.

| Row | Outcome | Self-grade | Units |
|---|---|---|---|
| `filesafe.command_denied` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-550, SP-550 |
| `filesafe.destructive_override_denied` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-551, SP-551 |
| `filesafe.destructive_override_granted` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-552, SP-552 |
| `filesafe.destructive_override_requested` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-553, SP-553 |
| `filesafe.guard_init_failed` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-554, SP-554 |
| `filesafe.path_denied` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-555, SP-555 |
| `filesafe.policy_degraded` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-556, SP-556 |
| `safe_point.created` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-557, SP-557 |
| `safe_point.restored` | register (prepared draft; depth incomplete) | 7 PASS / 4 PARTIAL / 1 ABSENT | CV-558, SP-558 |

The four PARTIAL cells are producer, scope_identity, retention and positive_negative_oracles. Membership is ABSENT by design. Family_id/revision are null in grades because no registry identity is being allocated here. All native execution is NOT_RUN, which alone does not lower grades. Individual JSON grades and `DF.self-grade.json` carry current exact line citations and SHA-256 source commitments.

## Newly authored bindings and search evidence

The search covers each exact family separately across current non-generated Plans Markdown/JSON, explicitly inspecting FileSafe, Contracts, Storage, Decision Log, central event/storage-value registries, payload and application schemas. Existing safe_point_record and safe_point_restore_transaction keys/values, SP-278's generic projector/checkpoint/CAS/token, SP-286 full-value receipt custody, SP-336/SP-347 and SP-337 are reused. No new redb value, checkpoint row or storage-value registry row is needed by the passive reader. This does not convert the existing safe-point projection/journal into EventRecord-derived mutation authority.

No exact family-complete identity recipe, versioned history reader, SP-286 adoption or withdrawal protocol was found. This is negative evidence within the stated search scope, not a repository-wide proof that no identifier exists. Evidence is in the per-family `.search.txt` files and `search-summary.json` at the external evidence directory below. These definitions are new owner contracts under DL-045, not found prior canon.

| Family | New payload resource under Plans/event_payloads/ | New ephemeral reader @1.0.0 |
|---|---|---|
| `filesafe.command_denied` | `filesafe_command_denied_v2.schema.json` | `storage.filesafe_command_denied_history_read.v1` |
| `filesafe.destructive_override_denied` | `filesafe_destructive_override_denied_v2.schema.json` | `storage.filesafe_destructive_override_denied_history_read.v1` |
| `filesafe.destructive_override_granted` | `filesafe_destructive_override_granted_v2.schema.json` | `storage.filesafe_destructive_override_granted_history_read.v1` |
| `filesafe.destructive_override_requested` | `filesafe_destructive_override_requested_v2.schema.json` | `storage.filesafe_destructive_override_requested_history_read.v1` |
| `filesafe.guard_init_failed` | `filesafe_guard_init_failed_v2.schema.json` | `storage.filesafe_guard_init_failed_history_read.v1` |
| `filesafe.path_denied` | `filesafe_path_denied_v2.schema.json` | `storage.filesafe_path_denied_history_read.v1` |
| `filesafe.policy_degraded` | `filesafe_policy_degraded_v2.schema.json` | `storage.filesafe_policy_degraded_history_read.v1` |
| `safe_point.created` | `safe_point_created_v2.schema.json` | `storage.safe_point_created_history_read.v1` |
| `safe_point.restored` | `safe_point_restored_v2.schema.json` | `storage.safe_point_restored_history_read.v1` |

Each SP unit separately defines Project idempotency `filesafe@2:hex(operation_id)`, existing CV-366 application idempotency `application@1:hex(server_id):hex(operation_id)` and its own event_id digest over exact family/partition/key. Each explicitly adopts SP-278 and SP-286/CV-339 strict full-value custody. All payloads are newly authored 2.0.0 drafts, no old Project source or historical payload is restamped. CV-365's intact WorkflowScopeV2 is referenced; known execution context is separately closed, with nulls for genuinely inapplicable startup/pre-context diagnostics. Such nulls grant no effect.

## Premise checks and retention

- DL-045, Decision_Log bounded authority and exact approved scope: all nine names remain in scope; current FileSafe/Contracts specify the same security/safe-point behavior. Used only for technical authoring, never admission or retention choice.
- F2-213 and CV-365/366 are current: application FileSafe is required, with real roots/Host evidence, explicit source graph and original Project definitions preserved. Older project-only payload minima therefore cannot alone close these families. **The Project-only completeness premise fails today.** Draft schemas include application scope; complete authentic original-source resources/method graphs still need materialization and checking.
- Case L-3 was checked against current text: authority/approval/receipt, non-authority security/recovery and runtime classes are candidates. Snapshot-body retention and restore-transaction authority do not themselves assign event-history retention. No old September retention decision is imported; no decision answer is extended.
- `safe_point.recovery_unavailable` remains a registered comparison, not authority for any of these nine identities, readers, source or retention policies.

All nine event `retention_policy_ref` cells remain `PENDING_RETENTION_DECISION`; candidate classes and Case L-3 citation are in each SP unit. Existing safe-point bodies, transaction authority, generic index/checkpoint and holds retain their own owners. **For Jared/RT:** which exact class owns each of the nine event histories? RT may close this from current canon or a premise-checked owner answer; this draft chooses none. No other Jared product decision is identified.

## Technical work still required

1. Materialize and check each family's exact CV-366 application original-source resource/method graph, reusing authentic FileSafe originals where applicable; do not synthesize accepted source from an event or boolean witness.
2. Add full EventRecord/source joins and executable original-result/conflicting retry, receipt/crash and withdrawal cases for each family. The current checker covers payload/scope/identity, expiry and restore equality. ATS native obligations cover actual durability/CAS/access/backup/withdrawal effects and remain NOT_RUN.
3. Independent grade/reviews and separate per-family admission after technical gaps and RT close. No row is a justified exclusion or a fabricated product blocker.

## Checks

- `check-contracts.json`: top-level `pass`, exit 0.
- `check-shards-generate.txt`: top-level `pass`, exit 0.
- `check-shards.txt`: top-level `pass`, exit 0.
- `check-index-generate.txt`: top-level `pass`, exit 0.
- `check-index-validate.json`: top-level `pass`, exit 0.
- Payload checker: 20 positives, 150 negatives, 18 identity vectors across nine families; native NOT_RUN.
- `git diff --check`: exit 0. Scope guard: only edited owner shard directories changed; forbidden paths untouched.
- Index generation used the copied ignored currentness edition, verified byte-identical by SHA-256 before generation. Node readiness remains blocked_runtime_certification_incomplete; no readiness clearance or seal is claimed.
- Initial index validation overlapped generation and failed against stale index counts. It was rerun sequentially; only the final result above is authoritative.
- No existing targeted FileSafe-event checker was found. New read-only `scripts/pm_filesafe_event_contracts.py` and Plans fixtures provide bounded checks; no tests/ file was edited.

## IDs, shared hunks and evidence

Used **CV-550..558, SP-550..558, ATS-275..279** (23 units); no F2 IDs. All 475 origin refs were checked before minting: maxima SP-420, CV-368, ATS-085, F2-213; no block collisions.

Shared owner hunks are append-only: `Contracts_V0.md` CV-550..558; `storage-plan.md` SP-550..558; `Automated_Testing_System.md` ATS-275..279. There are no shared registry hunks. Nine new payload files, one Plans fixture and one checker accompany them. Shards and index are generated only; no manual shard/evidence edit. No main push, landing lock, reseal, frozen-validator edit, .gitignore edit, pm-mail or subagent.

Evidence/copy directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DF/`.

| Evidence file | SHA-256 |
|---|---|
| `check-contracts.json` | `8f7d3c1856e3d51f2147aa2f9833ff0158a30678adcf3ea5b526f21861d688ad` |
| `check-index-generate.txt` | `4d7fe4aceed9622501e42fbe43b8bcfcf655ab591e65d113f5e1347a125f2940` |
| `check-index-validate.json` | `5fbbb3d1231d946aa7fe9229199839722d5883b478abfae95bde4526a6463ac4` |
| `check-shards-generate.txt` | `48c09691cf1c0464d1276a594016813a0df26d1a721256cd653580869c58d3c4` |
| `check-shards.txt` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `currentness-sha256.txt` | `76fa6f4657ab818ac61ef422c10a66ef11906f79a736374dc2e6e4da4d5acce9` |
| `filesafe.command_denied.search.txt` | `60cafa0c6598ce2d08cad87fd589bafc351d9f8e543778e592becf34f83ad20c` |
| `filesafe.destructive_override_denied.search.txt` | `c4458a534e567a2ef496e7fa5862d6609611ba7c03a7884c19b506693c56505f` |
| `filesafe.destructive_override_granted.search.txt` | `f81864cdb7bab2ab7c216716414152a3151c6a89e72c13836bdd4ad9218acdb2` |
| `filesafe.destructive_override_requested.search.txt` | `62416dc102e04d0dee8d1749d1e10e655573a30fdeb2379fb9d85bfd000662dd` |
| `filesafe.guard_init_failed.search.txt` | `0e92e5eacb38d064e2db8864680ea2b10eb66a3857042a8ed617c4b709db86cc` |
| `filesafe.path_denied.search.txt` | `ffb67f1c0c127814f83593fe06b3d88e894455062345a3fc28b05e1ae689109f` |
| `filesafe.policy_degraded.search.txt` | `a9066a7b3064073b536acd52c275c6f28969fefcafa4b1c5443306da6a8ee23c` |
| `id-search.json` | `39833aafc62b52a6eaf17c68cdc0c614eb1564a97aa4e0416a5185a8c06214bc` |
| `safe_point.created.search.txt` | `07b0c3048dfe0bbca0e2ff3b14cab286769fc54dda66fcdbcf1c1e8e9a986a6f` |
| `safe_point.restored.search.txt` | `166267668fa03cb79827ff18e49a6bf637c71c6bc04cfb55f49ec45fce5096c8` |
| `search-summary.json` | `83eb105d8e8b01f9fa05ea39b594ded123f0c41779bcf9440e0b3b2be9eff060` |
