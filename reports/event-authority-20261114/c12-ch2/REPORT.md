# C12-CH2 — thread, bundle, message and Stop families

Implementation: `f88a753d59b0b5dc3a5ac7e4f1beb4002af44593`. Base: CH1's finished branch at `a21edf30d8a37a858cfada6f118fdcca552e823c`. Branch: `plans/ea-pnc-c12-ch2-20261114`.

Worker self-assessment of static criterion 12 only. Other criterion cells and admission membership are unchanged. Native execution, receipt authentication in the application, durability and blind review are NOT_RUN. No new product choice is needed.

## Grades

| Family | Before | After | Source controls / exact kills | Schema boundaries / clause kills |
|---|---|---|---|---|
| `bundle.selection_forward_blocked` | PARTIAL | PASS | 6 / 156 | 19 / 7431 |
| `bundle.selection_sent_to_chat` | PARTIAL | PASS | 6 / 172 | 19 / 7963 |
| `chat.message` | PARTIAL | PASS | 10 / 240 | 19 / 7441 |
| `chat.thread_archived` | PARTIAL | PASS | 6 / 284 | 19 / 8217 |
| `chat.thread_created` | PARTIAL | PASS | 2 / 106 | 19 / 6985 |
| `chat.thread_deleted` | PARTIAL | PASS | 8 / 204 | 19 / 6871 |
| `chat.response_stop_requested` | PARTIAL | PASS | 70 / 634 | 8 / 3261 |

## What was built

- **Ordinary families (6).** `scripts/pm_dch_thread.py` adds an independently held original operation for each family: the frozen accepted intent, committed result, EventRecord, first receipt, full-value commitment and before/after owner snapshots. The complete route `thread_event_outcome` composes the unchanged current-record route (schemas, SP-337 body, CV-365 scope, joins, NW01 producer route) with new rows: `og_*` (original presence, copies, receipts, order, transition) and one owner table per family (`th_created`, `th_deleted`, `th_archived`, `th_message_a/b`, `bs_sent_a/b`, `bs_blocked`). `chat.thread_archived` also runs the existing DL-287 `ar_*` rows over its independently held archive source. `thread_checkpoint_valid` composes the original receipt with the unchanged SP-278 publication graph.
- **Stop, current writer.** `request_original_outcome` in `scripts/pm_dch_stop.py` runs the unchanged Stop request rows over an independently held original Stop operation, then the shared producer route (NW01) at the Stop writer boundary, the `og_*` custody rows and `so_protocol`: the actual active reply, its exact target snapshot, the frozen 3000 ms grace, a single grace start, delivery to exactly the frozen leases, and the held queue (ACD-627/471).
- **Stop, sealed retained store.** `sealed_outcome` resolves every historical Stop consumer (history, outcome, read, queue, index) through an independently sealed Stop receipt store (`tests/fixtures/dch_c12_ch2/stop_custody.json`) and the shared `RetainedDispatcher`: `st_custody` (Store in custody, receipt present, unique, of the one Stop edition and its pinned resources) and `st_custody_binding` (SP-1101 binding). The frozen verifier is the unchanged `_request_valid`. The sealed index route also enforces the DCH-owned nine-field token definition (`Plans/dch_checkpoint_source_constraints.json#/source_constraint_schema`, SP-627/DL-076).
- **Retry payload edition.** Each CH2 family edition now refuses an incoming retry whose only defect is its payload edition at the existing RT08 row; the only earlier RT08 witness belonged to a CH1 family.
- **Grouped Stop entailed rows isolated.** `st_pointer_bounds` (SV11+SV12) and `st_index_entailed` (IX22+IX24) are now four singleton tables with source-bound implication proofs.
- **Schema clauses.** `scripts/pm_dch_schema_coverage.py` now inventories every consumed definition for the CH2 families: 19 per ordinary family and 8 for Stop (request, outcome, EventRecord, two source wrappers, receipt, commitment, nine-field token; CV-647 has one edition, so no retained-recipe roots).

## Implementation and proof

The source ledger records **108 controls, 1796 exact expected-refusal kills and 0 invalid mutations**. Each result names its exact phase, row and code, its independent world, the pre/post world digest, the exact-row cut outcome and the restored refusal. Exceptions never earn credit. Whole-route cut outcomes: `{"accepted": 1504, "exception_uncredited": 140, "later_refusal_uncredited": 152}`. A later refusal or exception after a cut earns no isolated cut credit; only the gated report supplies that.

The gated tool `004bdedd632d9463f3535190a6ed5772338cdce1` (byte-identical to the gated revision) proves **327/338 applicable rows in 100 tables**, at most 7 rows per table, over 15624 witness calls of the complete DCH and Stop checkers. There are zero masked changes, unrelated changes or findings. The remaining rows are singleton tables whose raw status stays FAIL/unproved_guards; they receive implication evidence only:

| Unproved singleton | Earlier premise |
|---|---|
| `SC13_decoded_bytes` | SC12 has already strictly decoded the bytes as UTF-8 equal to project_id, whose own strict UTF-8 encoding is exact. Strict valid UTF-8 is injective and encode(decode(bytes))=bytes. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `CP29_value_event_type` | CP01 validates the selected complete checkpoint edition before any source family comparisons; every installed edition pins event_type to this exact family. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `CP30_event_event_type` | The same unchanged event object passed the complete retained reader before this row. That reader calls JN02 with this exact expected family before returning; no intervening write changes the object. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `CP32_consumer` | CP01 validates the selected complete checkpoint edition, whose consumer_id const equals this exact row reader in every installed edition. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `CP33_projector` | CP01 validates the selected complete checkpoint edition, whose projector_id const equals this exact row domain_projector in every installed edition. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `CS04_pointer_encodable` | CS06 already requires the exact one-key pointer containing an ASCII reference recomputed from real encoded bytes and their BLAKE3. Such a built-in map and string are always encodable by the current codec. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `CS05_pointer_size` | The exact CS06 pointer has a fixed ASCII prefix, 64 hex digits, a bounded decimal byte length and fixed media suffix. Even a 20-digit uint64 length gives at most 131 physical bytes, below 16384. (CH1 premise; const premises re-checked for the CH2 families in runtime/entailed-singletons.json.) |
| `SV11_pointer_encodable` | SV15 already requires payload_ref to equal payload:v1:<64 lowercase hex>:<decimal len>:application/msgpack, recomputed from the real encoded body and its BLAKE3. The pointer {"payload_ref": that ASCII string} is a built-in map of one str, always encodable by the current codec. |
| `SV12_pointer_size` | The exact SV15 reference has a fixed ASCII prefix, 64 hex digits, a decimal byte length and a fixed media suffix; even a 20-digit uint64 length gives at most 131 physical bytes, below 16384. |
| `IX22_record_event_type` | _index_read_valid first calls _request_valid on the same unchanged record, which runs JN02 through shared._joins with EVENT=chat.response_stop_requested and refuses any other event_type before st_index_family_entailed. |
| `IX24_row_sequence_type` | _index_read_valid runs shared._input_types(source) over the unchanged source whose index_row.sequence_id is a Storage uint64 slot: TY03/TY04 refuse every non-uint64 value before st_index_sequence_entailed. |

The schema inventory covers **122 consumed definition occurrences**. Totals: `{"boundaries": 122, "controls": 4351, "expected_refusal_kills": 48169, "invalid_mutations": 1575}`. Every clause is witnessed or carries an explicit covering class (annotation, applicator, selector, permissive, unreachable or recorded format skip); the unresolved lists are empty. Method B uses the unchanged complete definition in SD01 with actual error-path witnesses, whole-definition cut and restoration. It claims no atomic keyword cut. Owner keywords, formats and patterns are unchanged.

The complete original DCH suite replays **49362 checks, PASS**, and the complete Stop suite **5316 checks, PASS**. These are regression counts, not extra guard proofs.

## Shared number and time boundaries

The unchanged shared number self-test (`pm_event_numbers.py --self-test --scope numbers`) passes 580/580. The DCH number adapter runs 186 checks and the receipt uint64 boundary 938 checks over both receipt copies of every CH2 original.

Date-time corpus: **54960 checks, PASS**, plus **18284 checks that change one receipt copy at a time, PASS** (an invalid value is SD01; a valid different value is OG10 on the copy join). `acknowledged_at_utc` takes the EventRecord profile (E5-2) in both independent receipt copies at the complete original route. `ts`, Stop `outcome_at_utc` and checkpoint `retired_at_utc` keep their owner terminal-Z pattern plus EventRecord; `occurred_at_utc` uses EventRecord; `observed_at_utc` and `persisted_at_utc` use storage_utc_z. The Stop frozen intent and context `ts` copies run at the source-wrapper boundary. Classified node/resource bindings pass.

**Global shared date-time inventory: NOT_RUN.** The repository-wide gate fails closed on `main` (`scan_exclusions_invalid`, TOOL-ISSUES `C12-DC1-DTGATE-ROTATION`): a known infrastructure result that the next E landing repairs. The NUMRULE files were not edited and no global date-time PASS is claimed.

## Owner clauses carried by a covering argument

Every other owner clause of the seven families maps to a route predicate in `COVERAGE-MATRIX.json`. These do not, and each cover is source-bound (quotes re-read in `QUOTE-AUDIT.json`):

| Family | Owner clause | Cover |
|---|---|---|
| `chat.thread_archived` | "replay cannot override it or a deletion tombstone" (`Plans/assistant-chat-design.md:32906`) | The passive reader returns original evidence only and applies no lifecycle transition, so replay cannot override a later unarchive or a deletion tombstone. Every retained read in retained-observations.json leaves the store and its input bytes unchanged. Basis: "returns original outcome evidence only: no git, API, test, send, chip creation, archive transition" (`Plans/storage-plan.md:37756`). |
| `chat.thread_deleted` | "Unheld content purges within 24 hours" (`Plans/assistant-chat-design.md:32051`) | Purge and backup windows are Storage deletion-lifecycle effects after this event, under a pending retention decision. The static oracle witnesses the content-free storage-owned tombstone, immediate hiding, no undo and no resurrection (TD05-TD07, OG13). Purge timing is native runtime: NOT_RUN. Basis: "No expiry/count deletion is authorized by this draft." (`Plans/storage-plan.md:35059`). |
| `chat.response_stop_requested` | "survive restart and coherent backup recovery" (`Plans/assistant-chat-design.md:33078`) | Restart and coherent-backup survival are native obligations: NOT_RUN. The static oracle enforces the sealed original custody they depend on (st_custody, st_custody_binding, og_receipt). Basis: "static models are contract evidence only and native execution remains NOT_RUN" (`Plans/assistant-chat-design.md:33080`). |
| `bundle.selection_forward_blocked`, `bundle.selection_sent_to_chat`, `chat.message`, `chat.thread_archived`, `chat.thread_created`, `chat.thread_deleted` | "Admission refusal is checked before starting a new operation." (`Plans/assistant-chat-design.md:31782`, `Plans/assistant-chat-design.md:31849`, `Plans/assistant-chat-design.md:31917`, `Plans/assistant-chat-design.md:31984`, `Plans/assistant-chat-design.md:32051`, `Plans/assistant-chat-design.md:32906`) | Membership stays absent and each contract stays prepared: the complete suite refuses a registry row for the family. Admission is the separate S5 step. Basis: "+': absent registry')" (`scripts/pm_dch_events.py:1293`). |

## Sealed retained reads

Retained dispatch records **800 accepted and refused reads with 136 complete store snapshots, PASS**. Ordinary families read their retained history and checkpoints through the sealed catalogue, with missing, ambiguous and foreign-original receipt worlds established before each read. Every Stop historical consumer reads through the sealed Stop store, including a Store outside custody, missing, ambiguous, other-edition and other-resource receipts, receipts bound to another original or operation, bytes changed under a seal and a token that breaks its owner pattern. Readers never write a receipt; every snapshot before equals the one after, and the input bytes are unchanged.

## Adopted from s4o2

Nothing. The s4o2 branch (`1613a049e8`) changes no DCH or Stop file and its schema cells name none of these seven families.

## For the lead

- The new authored fixtures sit in `tests/fixtures/dch_c12_ch2/`, beside CH1's `tests/fixtures/dch_c12_ch1/`. Neither directory is named in `.gitignore`; both are force-added. Naming them is a `.gitignore` edit I was not asked to make.
- External blind review is an integration dependency; this lane runs no subagents.
- No ids were minted. No Plans file changed, so no regeneration or reseal is needed.

## Evidence and reproduction

Raw evidence is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/PNC019/c12-ch2/`; `SHA256SUMS` hashes the actual file bytes, compressed files included. `COVERAGE-MATRIX.json` maps owner clauses and complete definitions to predicates, controls, negatives, cuts/restoration and raw reports. `QUOTE-AUDIT.json` re-reads every owner and code quote. `C12-GRADES.json` is a C12-only delta.

Use the memory admission (12 GiB available), a capped scope (2 GiB, no swap) and a long-job:

- `python3 scripts/pm-dch-c12-ch2-check.py --out <dir> --part source --part retained --part corpora --part entailments --part replay`
- `python3 scripts/pm-dch-c12-ch2-check.py --out <dir> --family <family> --part schema` for each of the seven families
- gated proof: `tools/prove.sh`; table freshness: `python3 scripts/pm-dch-table-generate.py scripts --check`
- fixture authoring (run once, never by a checker): `tools/build_fixtures.py`

## Source anchors

Each anchor is at implementation commit `f88a753d59b0b5dc3a5ac7e4f1beb4002af44593`.

| Path:line | Entry |
|---|---|
| `scripts/pm_dch_thread.py:234` | `check_original` |
| `scripts/pm_dch_events.py:1126` | `thread_event_outcome` |
| `scripts/pm_dch_stop.py:311` | `_request_original` |
| `scripts/pm_dch_stop.py:391` | `_sealed_request` |
| `scripts/pm_dch_stop.py:422` | `sealed_outcome` |
| `scripts/pm_dch_schema_coverage.py:307` | `stop_boundaries` |
| `scripts/pm_dch_c12_ch2_cases.py:193` | `ordinary_cases` |
| `scripts/pm-dch-c12-ch2-check.py:413` | `main` |
