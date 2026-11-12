# DG shared TEST_ONLY owner adapters (stream E, 2026-11-11)

Branch `plans/ea-goal-adapter-20261111`, cut from `origin/plans/ea-goal-own-c-20261105` at `e1188eae0c5fa5cf0a8548d9dba76f6f0de8c437`, the common base of the five Goal family branches. VM, local worktree `/home/sittingmongoose/pm-worktrees/dg-adapter`. Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/DG-ADAPTER.md`.

**native evidence stays NOT_RUN and is a separate claim; a planning PASS must never read as native proof.**

Every adapter, value and record built here is TEST_ONLY. Nothing here grades a family, closes a group, admits anything or proves native issuance, locking, fsync, crash durability, deployment enrollment or restore. No registry row, admission, Decision Log entry, retention or deletion policy, PlanUnit, Spec Lock, `.evidence`, `auto_decisions.jsonl` or `.gitignore` change was made. No original bank, URI, hash or stored byte was rewritten or restamped. All code is in new files; no existing script, `pm_goal_oracle_common.py` or NUMRULE file was edited.

## Results at a glance

| Item | Result |
|---|---|
| Self-tests, all components | **204 cases pass**: 64 positives, 140 one-defect negatives, exit 0 |
| Fault matrix | **14 rows pass**: 12 cut points (incl. control) plus reserved release and altered re-entry; real process death, fresh-process reopen and read-back, two re-entries |
| Codec against canon fixtures | All 21 `SeglogFrameV2` frame cases, the commit frame bytes, the 11-field receipts, the group digest, watermark 2556 and both torn-tail cases reproduce byte-exact |
| K(s) | Canon settles it: **unpadded base64url of exact UTF-8** (SP-311, SP-312). The successors' "lower-hex" wording is wrong; exact correction below |
| R1 demonstration (`goal_run.cancelled`) | **pass**: 1 complete original-path positive, 31 one-defect negatives |
| CF-01 demonstration (`goal_run.certified`) | **pass**: 2 complete original-path positives, 40 one-defect negatives |
| Guard inventory | 180 guard sites; 118 have a negative that refuses with exactly that code; the other 62 are listed |

## Components

All modules import the shared number and date-time calls through `scripts/pm_goal_test_numrule.py`; every integer goes through `pm_event_numbers` and every timestamp through `pm_event_datetime`.

### 1. NUMRULE loader — `scripts/pm_goal_test_numrule.py`

The DG base predates NUMRULE, and the NUMRULE files are never copied or edited here. The loader imports the exact blobs of `plans/ea-numrule-20261105` at `58c2816ff33365384d4039553f5efdb5370930e6`: from beside the script when a lane has merged NUMRULE and the blob ids match, otherwise from the local git object store into `~/.cache/pm-goal-test-numrule/58c2816ff333/`. It recomputes each blob id and SHA-256 before import:

| File | Blob | SHA-256 |
|---|---|---|
| `pm_event_numbers.py` | `828449a760f42b92cf397d3aa9b8e0a02a9191a4` | `31ae47086bacad7f078239baa9e9ec3a5118472298a9e26e878dcf2534819444` |
| `pm_event_datetime.py` | `2b3a5b589e1eee1dea795f552f0be54be41f4f5d` | `e09d1a18b8c198dc4fc54d9b7017aff47eeaf3a02366c61c64c61e6df3b7995e` |
| `pm_event_index_binding.py` | `71d63474e26de4cea4914b03a4bd7eb86a77daec` | `8e2c243f24e401e125e0af321cbb8dd76e2eca86742db84f2acafd91dc263e2f` |

**API:** `uint64`, `integer`, `boolean`, `append_policy`, `storage_time` (`storage_utc_z`), `event_time` (`event_record`), `event_value_bytes` / `decode_event_value` (`EVENT_VALUE`), `binding_value_bytes` (`INDEX_BINDING`), `full_value_commitment`, `producer_digest`, `verify_payload`. Refusals map to `<where>/numrule/<reason>`. **Tests:** 3 positives, 9 negatives (uint64 overflow/bool/float/string, offset and lowercase-z Storage times, trailing LF, replay-only, mismatched blob).

### 2. Test-owner Storage — `scripts/pm_goal_test_storage.py`

Values come from its own execution: a random UUID instance, its own monotonic millisecond clock, sequence allocation at append time, random seeds.

- **Frames:** `encode_event_frame`, `encode_commit_frame`, `decode_frame` in the mandatory Case L-2 ten-step order, `scan_segment` (SP-347 membership, tiling, watermark, unacknowledged tail), `group_digest` (CV-339 tuple through `INDEX_BINDING`), `receipts_from_commit`.
- **Protocol:** `reserve(operation_id, request)` (durable, no sequence), `append(handle, candidates, durability_class)` (allocates sequences and Storage times, writes member frames then the commit frame, fsync, readback), `issue_first_receipt(handle)` (private `custody_v2` rows for every member), `publish_terminal(handle, table, key, value)` (once, CAS from absent), `resume`, `release`, `reservation_state`.
- **Custody and reads:** `receipt_of(handle)`, `first_custody`, `authenticate_receipt` (compares, never creates), `full_value_result`, `active_durable_group`, `read_frame` (bytes from the segment file, hash-checked), `read_event`, `event_by_identity`.
- **Cells:** `transact(writes)` (per-key CAS, all-or-none, `TEST_ONLY:tx:<instance>:<n>`, generation counter), `cell`, `snapshot` (frozen cells, token, transient snapshot id), `new_seed` (32 random bytes, collision rejection).
- **Packs (SP-337 shape):** `put_pack` (durable before a reference is returned), `read_pack` (shared `verify_payload_bytes`), `withdraw_pack`.
- **Retention:** `retire_segment(generation, RetentionOwner)` records a signed gap disposition and removes the sealed segment.
- **Token:** `read_token()` returns the nine durable `DurableGenericToken` fields, every byte-derived field computed from the actual CURRENT, manifest and segment bytes; the snapshot id is transient.
- **Keys:** `k_component` / `k_decode` (SP-311/SP-312 K), `scope_partition` (CV-339).
- **Persistence:** canonical MessagePack manifests behind an atomically replaced `CURRENT`, fsync of file and directory, append-only `segment-<n>.seglog` files; `open` verifies the CURRENT→manifest hash join and runs SP-347 recovery.

**Tests:** 21 positives, 57 negatives. Fixture byte-exactness, contiguous sequences, segment rotation and sealing, increasing `storage_utc_z` times, caller-supplied `observed_at_utc`/`persisted_at_utc`/`sequence_id`, replay-only and wrong-type replay policy, redaction profile, 16 KiB inline cap, schema extension member, impossible date, equal retry (same receipt, no append), producer25/event-id/scoped-identity conflicts, append-once duplicate, partial dedupe, duplicate member, empty group, release, resume absent/altered, terminal before receipt, 11 substituted-receipt fields, dict-for-handle, other Storage's handles, unserializable/uncopyable handles, CAS absent/stale/bool, all-or-none, snapshot isolation, crash before/after commit, seeds, packs (size, media, digest, withdrawn, extra key), token whole-root validation, retention (unsealed, unknown, foreign owner), tampered manifest, corrupt durable frame on reopen, frame tampered at rest, reopen equality.

### 3. Persistence, reopen and fault matrix — `scripts/pm_goal_test_reopen.py`

**API:** `probe_spec`, `run_protocol(storage, spec)` (executes or resumes from the durable state), `classify(storage, operation_id)`, `read_back`, `run_matrix()`, child actions `create | run --cut | read | reenter | release`. **Tests:** the matrix below, run in the self-test.

### 4. Issuer framework — `scripts/pm_goal_test_owner_adapters.py`

- `OwnerRegistry` (one owner object per id and role; `owner`, `authenticate_owner`, `roster`).
- `TestOwner` with private custody (`msgpack` or `exact_json` codec, the latter adding no integer cap), `issue(root, value, kind)`, `resolve(handle, root)`, `authenticate(ref, presented, root)` (returns the retained value), `custody`, `verify_custody`, `inventory(kind)`, `withdraw`, `observe`.
- Subclasses `SourceOwner`, `ActivationOwner` (`birth`, CAS `transition` issuing transition receipts), `AppendOwner` (`append_original` through Storage; `event`, `first_receipt`), `PublicationOwner` (`publish`, one original per publication even on replay).
- `acquire(registry, owner_id, role, handle, root)` is the only acquisition route. `RootBank` loads pinned whole schemas byte-exact.
- `MethodRecorder`: ordered calls with owner, method, argument and result digests, parent, refusal code and before/after observations of every registered owner and Storage; `sequence`, `require_order`, `changed_by`, `export`.

**Tests:** 10 positives, 20 negatives: off-root issue, another owner's handle, dict and reference string for a handle, wrong root, substituted bytes, copied value under another owner, restamped custody hash, substituted custody owner, unregistered owner object with the same id, wrong role, unregistered id, duplicate ref, withdrawn original, activation stale state/revision/double birth, foreign event handle, publication conflict, recorder order mismatch.

### 5. Generic source and reducer — `scripts/pm_goal_test_source.py`

`GenericSource(storage).acquire(snapshot=None)` and `.project(snapshot, reducer, select, require_custody=True)`; `Row`, `SourceSnapshot`, `Halt`, sample `LifecycleReducer`. It extends the pinned frame/MessagePack codec component into source acquisition, custody and index, and invokes the reducer from it.

**Tests:** 5 positives, 23 negatives: whole-prefix projection over two projects and two runs, off-run rows counted in coverage, halt-before-defect frontier, coherent resnapshot; malformed off-run frame corrupted at rest, substituted segment bytes, wrong Storage, false empty inventory, substituted first custody, substituted value commitment, token current hash, recovery epoch, watermarks, frontier revision, CURRENT generation, manifest without CURRENT join, substituted manifest instance, missing qualification, foreign projection, unsupported same-run row, second terminal, pending first custody, authenticated gap continues, gap proof substituted, gap owner substituted and re-signed, retired segment without gap, dropped gap, reordered frames.

## Fault matrix

Each row: create the Storage in one process, run the protocol in a second process that dies by `os._exit(73)` at the cut, read back in a third, re-enter in a fourth and fifth.

| Cut | Exit | Read back after the crash | Classification | After re-entry |
|---|---:|---|---|---|
| none (control) | 0 | published; 1 Event; 1 first receipt; terminal | published | unchanged |
| `before_reservation` | 73 | nothing | `no_effect` | 1 Event, 1 receipt, 1 terminal |
| `after_reservation` | 73 | reservation | `reserved_unappended` | same |
| `before_append` | 73 | reservation | `reserved_unappended` | same |
| `torn_member_frame` | 73 | reservation; torn tail truncated (`tail_truncated`) | `reserved_unappended` | same |
| `torn_commit_frame` | 73 | reservation; torn tail truncated (`tail_truncated`) | `reserved_unappended` | same |
| `after_append_frames` | 73 | recovery issues the durable tail group (`tail_group_issued`); 1 Event; no receipt | `appended_without_first_custody` | same Event, frame unchanged |
| `after_append` | 73 | 1 Event; no receipt | `appended_without_first_custody` | same |
| `before_first_receipt` | 73 | 1 Event; no receipt | `appended_without_first_custody` | same |
| `after_first_receipt` | 73 | 1 Event; 1 receipt | `receipted_unpublished` | receipt unchanged |
| `before_terminal` | 73 | 1 Event; 1 receipt; no terminal | `receipted_unpublished` | same |
| `after_terminal` | 73 | everything | `published` | terminal unchanged |
| reserved release | 73 then 0 | release → `no_effect`; later append refuses `append/released` | `no_effect` | no Event |
| altered re-entry | 73 | re-entry with a substituted request refuses `resume/conflict` | `appended_without_first_custody` | state unchanged |

Every row also requires a second re-entry to leave the manifest generation unchanged. An append without first custody is never reported as no-append. This is the protocol U3, C6, R6 and CF-11 need. Native fsync and restart remain NOT_RUN.

## K(s) finding and owner-text correction

**Canon settles it; no question is needed.** On `origin/main` (`77bae0c636`), SP-311 (`Plans/storage-plan.md:26292`) says "K(s) is unpadded base64url of the exact UTF-8 identity bytes, with no Unicode normalization." SP-312 (`Plans/storage-plan.md:26443`) says "K(s) is unpadded base64url of exact UTF-8 identity bytes, with no Unicode normalization." The same sentences sit at `e1188eae:Plans/storage-plan.md:26493` and `:26715`. Both were introduced with the units themselves (`e686963ad5`, `a3c511657f`, 2026-09-14) and never amended. SP-311/SP-312 cite DL-270 only for derived-redb placement and backup, not for keys. Both `physical-families.json` files name `K(...)` and defer to SP-311/SP-312. CV-339's scope partition uses the same encoding.

The only lower-hex K definitions in storage-plan belong to SP-309 (`Plans/storage-plan.md:25988` and `:26016` on main: Executor safe-stop scope v2 and process-probe keys). Each defines its own local K, and they are the likely source of the confusion. They do not govern SP-311/SP-312 keys. The adapters implement base64url (`k_component`); the self-test pins `K('x') == 'eA'`, not `78`, and refuses the hex spelling `78`.

**Correction the family lanes must apply.** Do not edit on this branch; the lanes apply it in their merge:

1. `Plans/goal_run_projection_reference_contracts/started.md:7`. Same bytes (SHA-256 `8eff996d9087b6ff333997032b636d57f1719bc2049f6123250b40f10bbb28df`) on `plans/ea-goal-own-c3-w34a-20261105` (`91ffd2047d`) and `plans/ea-goal-own-c3-w34b-20261105` (`e9e712a7b5`).
   - old: `K is the unchanged SP-311 lower-hex strict UTF-8 component recipe; no normalization, focus/default Project or cross-Storage fallback.`
   - new: `K is the unchanged SP-311 unpadded base64url of exact UTF-8 identity bytes; no normalization, focus/default Project or cross-Storage fallback.`
   - No file pins `started.md` by hash on w34a, w34b or w5, so nothing else needs recomputing.
2. `Plans/goal_run_projection_reference_contracts/cancelled.md:7` on w34a (SHA-256 `4f029d84fdd4a00a3e82cd9116665d77a8304b8e75f11438726b74d55bd4417b`).
   - old: `K is the unchanged SP-312 lower-hex strict UTF-8 component recipe; no normalization, focus/default Project or cross-Storage fallback.`
   - new: `K is the unchanged SP-312 unpadded base64url of exact UTF-8 identity bytes; no normalization, focus/default Project or cross-Storage fallback.`
   - W34b already carries exactly this line (SHA-256 `80df93179da6cd1ddd83af460e0af051f2e3ca6f725a651846f54fcdc1a000aa`, pinned by `Plans/goal_run_cancelled_w4_contracts/selection.v1.json:315`). The merge takes W34b's bytes.
3. Not owner text, but the same defect in code: `scripts/pm_goal_own_c3_w34_reference_oracles.py:135` and `:192` hard-code `':78:78'` (lower-hex of `x`). Lines `:209`, `:223` and `:431` build checkpoint keys with `.encode('utf-8').hex()`. The same lines exist on w34a and w34b. Replace them with `pm_goal_test_storage.k_component`. W34b already flagged that harness as insufficient for key witnesses.
4. `goal_run.certified`: `certified.physical.json:30` on w5 (`498e35e153`) already says "unpadded base64url of exact nonempty UTF-8; SP-317/P5". No change.

## Demonstrations

### R1 — older scoped-routing qualification (`goal_run.cancelled`)

`scripts/pm_goal_test_demo_r1.py`. Four `RealmOwner`s (predecessor `goal_consumer`, `filesafe_consumer`, `native_consumer`; target `retained_original_d05`) load every pinned resource by SHA-256 from wherever the exact bytes now live in the repository. The predecessor manifest is `b616a2b1…` and the target manifest `37bbb87f…`. A `RouteOwner` derives the edge from the source bytes and issues it. A `SelectionOwner` issues the successor selection and one explicit selection per method from `methods.json` (`5a44e6ea…`). A `Qualifier` acquires everything through the registry and walks every schema position of every resource, unused `$defs` included, with location-scoped dispatch. Data under unknown keywords is not walked: an embedded `legacy_v2_reader` document is not a JSON Schema position.

| Observation | Value |
|---|---|
| Predecessor failure preserved | 22 unresolved sites, 11 distinct references, all in `native_consumer` |
| Successor | 0 unresolved; 22 crossing sites; `native_consumer` 12,951 reference sites; `goal_consumer` 3,413; `filesafe_consumer` 6,602; `retained_original_d05` 6,702 (equal to the coordinator's own count) |
| Route | source whole SHA-256 `92acbc346f2d066801b3c06f3975d06779c8bc637a02d5ef944466918f89bae1`; 2 file aliases; 11 locations; target `…/completion-v4/inputs/Plans/plans_to_code_handoff.schema.json` at `1b1cff7b…8d4d`; nested resolution in `retained_original_d05` |
| Methods | all 6 dispatched through their explicit selection |

There are 31 negatives, each with its own code: wrong source realm, merged target realm, escaping nested resolution, wrong location, wrong literal, swapped literal, dropped site, wrong source hash, wrong alias, dropped alias, wrong target URI, wrong target hash, network fallback, whole-bank merge, unregistered route owner, transport dict for the route, wrong profile, rebound predecessor, restamped route hash, missing realm, substituted route ref, rebound target manifest, restamped bank resource hash, rebound bank URI, bank network fallback, restamped predecessor pin, method wrong profile, method selecting the predecessor bank, wrong import, implicit selection, cross-cast method selection.

### CF-01 — whole certified-v3 wire and original identity (`goal_run.certified`)

`scripts/pm_goal_test_demo_cf01.py`. Independent owners issue the assignment, the invocation (requested and effective runtime), the causality (an Event genuinely appended through Storage), the native run at its before revision with the final decision, the durable Standard receipt (a real Storage transaction), the current Goal, the Storage partition and route record (partition computed by Storage) and the installed descriptor (the pinned `installed-profile-digest.txt`). The identity owner runs the I0 joins, builds `IdentityInput`/`IdentityResult` (validated against `identity.v1`), derives LP, K and E per `protocol.md:13`, checks them against a separately written recomputation and issues the result. The producer acquires the issued identity, never a candidate. It prepares the 25-field producer with required-present nulls, validates the whole v3 payload root and maps every one of 46 envelope and payload fields to its source. The append owner appends through Storage, which assigns sequence and times and issues `custody_v2`.

- **Positives (2).** One uses Unicode ids with combining characters and an emoji, not normalized. The other sits on the number boundary: before = 2^53−1, after = 2^53. Each checks the stored producer25, Storage-assigned fields, the custody producer digest, value commitment and partition, byte-identical inner and outer K, identity issued before producer preparation and the Standard receipt before identity. Each also checks a lost-acknowledgement retry (same operation: no durable change, same receipt) and an equal retry (new operation: dedupe, same receipt, no second Event).
- **Negatives (40).** Revision as string, float or bool; revision step not +1; revision 2^64 and 2^53+1 (both `codec_unavailable`); decision with exception; identity extension member; substituted Start identity formula; partition from another Storage; caller-supplied partition; lower-hex partition recipe; unregistered assignment owner; invocation with a foreign assignment; Standard for another run; non-durable Standard receipt; Standard with an exception decision; absent descriptor; Goal project differs; native Goal differs; assignment for another run; unprefixed identity key; cause never appended; identity candidate instead of issued identity; identity handle from another owner. Changed actor, time, cause, event id and effective runtime, each with every mirror coherent; NFC-normalized goal run id; missing nullable `payload_ref` and `node_id`; envelope and payload extension members; alternate inner key; replay-only policy; float revision in payload; partial payload witness; and a retry with an altered producer (`append/conflict/producer25`).

**Number-domain finding (not a new cap).** The complete certified path carries revisions only up to 2^53. The CV-1029 producer semantic digest is RFC 8785 JSON, which is binary64, and the shared `producer_semantic_digest` refuses 2^53+1 as `jcs_binary64`. Above 2^64−1 the Event MessagePack codec refuses as well. The coordinator protocol (`protocol.md:19`) already requires `codec_unavailable` in both cases; the demo maps both to it. The identity record itself keeps arbitrary precision (exact-JSON custody), as the protocol's arbitrary-precision +1 requires.

## Group-to-component map (41 groups)

Key: **ST** Storage append, frames, receipts and custody. **TX** cells, CAS, transactions, generations, snapshots and seeds. **PK** packs. **RT** retention gaps. **RO** reopen protocol and fault matrix. **IF** issuer framework (registry, owners, handles, inventories, `ActivationOwner`). **MR** method recorder. **GS** generic source and reducer. **KC** K(s) and scope partition. **RB** pinned `RootBank`. **RQ** the R1 realm, route and qualifier pattern. **NR** the shared number and date-time calls (all groups).

| Family | Group | Components |
|---|---|---|
| goal.updated | U1 physical successor | ST, PK, IF, MR, RB |
| goal.updated | U2 metadata/state/Plan sources | IF (`ActivationOwner` states, binding/Plan owners), TX (body CAS), ST, MR |
| goal.updated | U3 unknown/crash/recovery | RO, ST, TX, IF, MR (`appended_without_first_custody` is the unknown branch) |
| goal.updated | U4 passive/current consumers | GS, ST (first and full-value custody), TX (snapshot), IF, MR |
| goal.updated | U5 fences/history/guards | MR (every helper boundary), IF (withdraw, permission and Stop owners), TX, ST |
| goal.cancelled | C1 no-association route | IF (owner inventory as authenticated empty), `ActivationOwner` (Stop latch), ST, TX, MR |
| goal.cancelled | C2 bound-Plan route | IF (Plan and Scheduler owners), TX, ST, MR |
| goal.cancelled | C3 Workflow/D05/D06 | IF, `ActivationOwner`, ST, TX, MR |
| goal.cancelled | C4 late assignment/private inspection | ST (Storage-allocated sequence only), GS, IF, MR |
| goal.cancelled | C5 six-owner mapping | IF (six registered owners and inventories), RB, MR |
| goal.cancelled | C6 atomic migration/recovery/withdrawal | TX (one write set), RO, IF, MR |
| goal_run.started | S1 original production/publication | IF, `ActivationOwner`, ST, TX, RO, MR, RB |
| goal_run.started | S2 native-v7 dispatch | RB, RQ, IF, MR |
| goal_run.started | S3 generic source/reducer | GS, ST, RT, KC |
| goal_run.started | S4 fresh readers/helpers | IF, MR, TX (read fence), GS |
| goal_run.started | S5 projection transaction/lifecycle | TX, RO, KC, GS, MR |
| goal_run.started | S6 reference routes | PK, ST, KC, TX, RB |
| goal_run.cancelled | R1 older scoped routing | RQ, IF, MR, RB (**demonstrated**) |
| goal_run.cancelled | R2 positive D06 causal graph | IF, `ActivationOwner`, ST, TX, MR |
| goal_run.cancelled | R3 settlements/rollback/flush | IF (effect owners, inventories), `ActivationOwner`, TX, MR |
| goal_run.cancelled | R4 fresh current readers | IF, MR, TX, GS |
| goal_run.cancelled | R5 combined prefix/reducer | GS, ST, RT, KC |
| goal_run.cancelled | R6 CAS/crash/cutover/withdrawal/reference | TX, RO, PK, KC, GS, MR |
| goal_run.certified | F0 projection prerequisite | PK, TX, KC, RB, ST |
| goal_run.certified | CF-01 wire/identity | IF, MR, ST, TX, KC, RB (**demonstrated**) |
| goal_run.certified | CF-02 assignment/invocation | IF, RB, MR |
| goal_run.certified | CF-03 successful native chain | IF, `ActivationOwner`, MR, RB |
| goal_run.certified | CF-04 profile/resources | RB, RQ, IF |
| goal_run.certified | CF-05 birth/identity chronology | TX (joint coissue), IF, `ActivationOwner`, MR |
| goal_run.certified | CF-06 append/first custody/dedupe | ST, RO, MR |
| goal_run.certified | CF-07 joint commit/release | TX, RO, IF, MR |
| goal_run.certified | CF-08 boundaries | MR, IF, TX |
| goal_run.certified | CF-09 retained/Event/historical/current | ST, GS, IF, TX |
| goal_run.certified | CF-10 prefix/reducer | GS, ST, RT |
| goal_run.certified | CF-11 checkpoint/generation/CAS | TX, RO, KC |
| goal_run.certified | CF-12 lifetime/restore | RT, PK, TX, RO (restore engine still to build) |
| goal_run.certified | P4 raw-source reducer | GS, RT, ST |
| goal_run.certified | P5 keys/birth/anchor/frontier | KC, TX (seeds, transaction ids), GS (token) |
| goal_run.certified | P6 Storage transaction/stage/cutover | TX, RO, MR |
| goal_run.certified | P7 current disclosure | IF, MR, TX, GS |
| goal_run.certified | P8 lifetime/backup | RT, PK, TX, RO |

**What the lanes still build on top.** Family owners (D01, D05, D06, Plan, Scheduler, FileSafe, Standard, Goal body), each family's reducer, the projection generation lifecycle (three generations, retired plus 604,800 seconds) on TX, and a TEST_ONLY backup/restore driver for CF-12 and P8. Reopen reads canonical files back but is not a restore engine. `datetime_validator` is not used; `date_time` is called at each enforced boundary, which the NUMRULE guide allows. Pack durability before reference is enforced by API order (`put_pack` returns a reference only after fsync); a lane that publishes pack references must call `read_pack` before publishing.

## Guards for the shared guard-isolation tool

`DG-ADAPTER-guards.json` beside this report maps each guard code to the negatives that refused with exactly that code: 180 sites, 118 with a negative. No local guard-removal engine and no check-11 claim are made. These 62 sites have no dedicated negative:

- **Storage (30).** Self-checks on its own output, unreachable from inputs: `append/readback`, `custody/schema`, `custody/full_value_schema`, `group/schema`, `index/*`, `open/instance`, `open/manifest_generation`, `open/qualification`. Unreachable caps (`frame/header_cap`, `frame/payload_cap`). Type and shape guards: `fault/*`, `handle/kind`, `handle/type`, `pack/bytes`, `pack/media_type`, `pack/present`, `receipt/state`, `release/state`, `reserve/operation_type`, `retire/nonempty`, `storage/create_empty`, `terminal/replay_target`, `tx/delete_present`, `tx/key`, `tx/table`, `tx/write_shape`, `tx/writes`.
- **Owner adapters (15).** `activation/cause_type`, `activation/subject_type`, `activation/unborn_subject`, `append_owner/storage`, `bank/*`, `custody/type`, `custody/unissued`, `event/handle_type`, `original/ref_type`, `publish/replay_tx`, `registry/duplicate_id`, `registry/owner_type`, `registry/role_type`.
- **Source (5).** `project/snapshot_type`, `source/gap_order`, `source/manifest_hash`, `source/retired_inputs`, `source/storage_type`. `source/manifest_hash` is masked by the earlier `current_manifest_join` path in coherent substitutions.
- **R1 (9).** `method/qualified`, `method/selection`, `qualify/route_site_unused`, `qualify/unsupported_dynamic_reference`, `realm/no_merge`, `realm/resource_hash`, `route/one_source_resource`, `route/same_literal_per_alias`, `route/target_unique`.
- **CF-01 (3).** `producer/cause_appended` (Storage refuses first with `read/event_unavailable`), `producer/inner_outer_key_bytes` (duplicate of the field check), `producer/payload_type`.

These go to the next tool batch; none is shown to make a real check falsely pass.

## Changes the family lanes must make in shared files

- **K correction:** the four items above. Owner text is in `started.md:7` (w34a, w34b) and `cancelled.md:7` (w34a only); code is in `pm_goal_own_c3_w34_reference_oracles.py`.
- **`Plans/goal_own_c_contracts/protocol.md`:** this branch appends one section at the end, lines 95–125 (`## Shared TEST_ONLY owner adapters (2026-11-11)`). It is additive and touches no other section. The sibling lanes' hunks in `protocol.md` and `suites.json` are untouched.
- **`scripts/pm_goal_oracle_common.py`:** no change needed.
- **NUMRULE:** a lane importing these modules needs `58c2816ff3` in its object store (`git fetch origin`). After a lane merges `plans/ea-numrule-20261105`, the beside-script files are used when their blob ids match the pins. If NUMRULE moves past those blobs, update the pins in `pm_goal_test_numrule.py` and rerun the self-test.
- **Adopting a demonstration:** the R1 and CF-01 scripts run only on this infrastructure. The lanes keep their own oracle files and import these modules; nothing in their branches needs editing for the adapters themselves.

## Checks

All runs were serial and light, each a single process under 100 MB. Available memory was 5–13 GB during the work, never 13.5 GB, so no heavy checker ran. No DG suite, index generation, aggregate gate or landing check was run. The index and shards need no regeneration: `pm-plan-index.py` reads only `Plans/*.md` (`PLANS.glob("*.md")`), and `protocol.md` is not a sharding source.

| Command | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_goal_test_numrule.py` | 0 | pins verified |
| `python3 scripts/pm_goal_test_adapters_selftest.py --output <evidence>/selftest.json` | 0 | pass; 64 positives, 140 negatives incl. 14 matrix rows |
| `python3 scripts/pm_goal_test_reopen.py` (standalone) | 0 | pass; 14 rows |
| `python3 scripts/pm_goal_test_demo_r1.py --output <evidence>/r1.json` | 0 | pass; 1 positive, 31 negatives |
| `python3 scripts/pm_goal_test_demo_cf01.py --output <evidence>/cf01.json` | 0 | pass; 2 positives, 40 negatives |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass |
| `git diff --check` | 0 | clean |

Evidence is in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG-ADAPTER/`, with SHA-256 values in `evidence-sha256.txt` there.

## Files

| File | Lines | SHA-256 |
|---|---:|---|
| `scripts/pm_goal_test_numrule.py` | 220 | `14909c75db33e23137e76abd24893fa80ca247184a150ffa81907f483df06368` |
| `scripts/pm_goal_test_storage.py` | 1185 | `51bbe652c9a5cb40aa689e832ec9bc4adb29bf78abeeae4bbd0fc8c4423fd175` |
| `scripts/pm_goal_test_reopen.py` | 309 | `acec5fe8cf83792506c3a4411f546353db30141f170e39cf342c7b48fd5be927` |
| `scripts/pm_goal_test_owner_adapters.py` | 504 | `d58ae4ea06153a03101cca76af5eb985e0277e5c468103f01e46530e58893222` |
| `scripts/pm_goal_test_source.py` | 275 | `919eeb6f70d7f132012c49c8e304824d34cba6193d6a862db3df5017a4142657` |
| `scripts/pm_goal_test_adapters_selftest.py` | 744 | `2d61943e88b6cf69e8e7c6145485cb7c9e4f17308324495849a0511972433977` |
| `scripts/pm_goal_test_demo_r1.py` | 576 | `5033cb44098dbf72c20f49edc52f124d9c79435bd9644e82611995cf43c65c23` |
| `scripts/pm_goal_test_demo_cf01.py` | 658 | `ccca3c7801d403089e1b7b9bafb36fd40580ea4cfd1f800271fdac0dfc20d94b` |
| `Plans/goal_own_c_contracts/protocol.md` | 125 | `e260e2dc62c298b9f2a033478a1080b950069c0c0fa50e2fd53642a721898d31` |
