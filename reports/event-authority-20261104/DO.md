# DO — fix round 3, final-review response

**Branch:** `plans/ea-w2-orchestrator-20261104`. **Assessed source tree:** `89ec4788c9612f7bbecbc1b230b47e90a0b94d07`; **code fix:** `5952a4559a5724816765783a6e702cc5bc1ee2b2`. Reviewed base: `8a002871a6858f5fd68cbf82976002edbf9dfb09`.

**24/25 prepared under the lane's intentional membership/retention exceptions; 1 stopped.** All 25 retain membership ABSENT and retention PARTIAL. Application `crew.board_message_posted` additionally retains producer/oracles PARTIAL because its selected frozen source cannot supply subject/priority. Project preparation remains. No admission or native execution is claimed.

**Independent Astra grades before → current self-grade:** 223 PASS / 52 PARTIAL / 25 ABSENT → **248 PASS / 27 PARTIAL / 25 ABSENT**, zero conflicts. Every non-posted family moves **9 → 10 PASS** cells; posted moves **7 → 8 PASS**. Prepared count **0 → 24**. The previous branch self-grade's 250 PASS is superseded, not the before baseline.

## Review round 3: findings and responses

- **DO-A01 — fixed (`5952a4559a5724816765783a6e702cc5bc1ee2b2`).** **Where:** `scripts/pm_orchestrator_event_oracles.py:177`, `scripts/pm_orchestrator_event_oracles.py:289`, `scripts/pm_orchestrator_event_oracles.py:302` and each OSI-680..704 independent static binding. **Why:** previous oracles omitted current append policy, recorded partition comparison, a real producer-semantic comparison and joined read/checkpoint data. **Fix:** 53 full EventRecord@2.0.0 vectors, 212 explicit retry candidates, all 25 encoded Project identity checks, compatibility-only refusal on append/retry, exact RFC8785 semantic field set and original full result on Storage-metadata-only retry. All 21 semantic members are independently varied; all ten read-token members, Storage identity, source value, index row, birth/frontier and a nonmatching frontier advance are checked. These are synthetic relational witnesses; native generic source verification/CAS/CRC/authentication remain assumed NOT_RUN. Each family's S1/S3/S6/S7 full CLI mutation exits 1; all three old board replay-only mutations also exit 1.
- **DO-A02 — fixed (`5952a4559a5724816765783a6e702cc5bc1ee2b2`).** **Where:** `scripts/pm_orchestrator_event_oracles.py:106`, `scripts/pm_orchestrator_event_oracles.py:89` and each family's SP-337 paragraph. **Why:** the suite treated a valid logical schema as permission to inline arbitrarily large complete payloads. **Fix:** measure the complete canonical MessagePack inline payload including all strings/list/map overhead, enforce 16,384 bytes, preserve larger logical history intact behind the existing EventRecord string payload_ref plus closed pack-index byte-size/media witness. Validate exact BLAKE3 bytes, size, media, bytes/index durability and selected logical schema. Nested posted content refs remain separately enforced. Board source fixtures join full append vectors, and the selected SP-351 application physical wrapper has its own aggregate 16 KiB check. 325 vectors cover exact ASCII/multibyte boundaries, overflow, external success, missing/forged/undurable refs and typed ingest encoding. Literal data-URI text stays text; only an actual encoded-ingest witness requires decoding, with native ingest authentication NOT_RUN. All 25 S4 full CLI mutations and all eight application child-history oversized-body mutations exit 1. No retained body is truncated.
- **DO-A03 — fixed (`5952a4559a5724816765783a6e702cc5bc1ee2b2`).** **Where:** `scripts/pm_orchestrator_event_oracles.py:136`, the selected producer_context in each event vector, and `Plans/orchestrator_event_payloads.schema.json` posted priority enum. **Why:** valid standalone helpers did not constrain the actual chosen phase/retry/truncation payload, and priority had no domain. **Fix:** require phase active/no completion signal and question_count > max_questions + 1, retry payload/source cause/lineage/counter equality plus current fences, original_length >= truncated_length, and the existing low/normal/high/urgent enum. Each of the review's four actual-payload mutations exits 1 through the full CLI.
- **DO-A04 — stopped for Jared (application posted producer/oracle facet); source-shape fix in `5952a4559a5724816765783a6e702cc5bc1ee2b2`.** **Where:** `Plans/orchestrator-subagent-integration.md:32218`, `Plans/storage-plan.md:29491` and `scripts/pm_orchestrator_event_oracles.py:204`. **Why:** the frozen selected AgentMessageApplicationV1 is closed and has neither required header; its inline_text is already mapped to body. **Fix completed:** all three board contracts now use complete, version-correct closed application original-source/input/wrapper fixtures, original/stage/accepted-source fields, actual six-component SP-351 physical keys and digest/identity joins. Each contract's missing/foreign source/input/wrapper mutation exits 1, including all 18 full CLI source-shape mutations. The posted application source is explicitly refused as `application_post_subject_priority_unavailable`, never a prepared-producer positive. Expected stopped errors cannot mask a second error: negatives must add a distinct rejection. The frozen Project/application resources are unchanged. **Question for Jared:** Which canonical application board source and exact version must supply `subject` and `priority`: a governed successor to the SP-351 message/source/wrapper selection retaining those fields, or an existing source with an explicit mapping?

No finding is disputed. The source search inspected 452 current top-level Plans Markdown/JSON files (excluding generated, pipeline, historical banks and ledgers); exact selected roots were read in full. Other textual matches do not select a successor or supply a header mapping. No header default, event-derived source or new source edition is invented.

## Earlier findings rerun

| Finding | Retained repair | Current mutation result |
|---|---|---|
| DO-01 | CV-366 exact application keys, `644a3df9c97ffc19c76924a02641cb852852f7ef` lineage | All application keys changed back to do1: full CLI exit 1; S2 separately exercised per family |
| DO-02 | Posted body/reference, `644a3df9c97ffc19c76924a02641cb852852f7ef` lineage | Removing both representations from posted positives: exit 1 |
| DO-03 | SP-720..722/member preparation, `644a3df9c97ffc19c76924a02641cb852852f7ef` lineage | Each of three members removed independently: DO CLI exit 1; coordination CLI exit 1 with a new coordination_event_records mismatch (3 failures versus 2 baseline) |
| DO-04 | Failure/blockage/interruption retries, `644a3df9c97ffc19c76924a02641cb852852f7ef` lineage | Removing blockage coverage: exit 1; all six actual retry payload/context positives and 18 transition cases run |
| DO-C2-01 | Exact BLAKE3 fence, `c886f97d8f1cf947e599571c9ff71cbd9d6b36d1` | LF appended to both referenced-body scope positives: exit 1; all 16 suffix vectors still run through payload and stored member (32 rejections) |

## Standing checks — every family

**F = fixed in `5952a4559a5724816765783a6e702cc5bc1ee2b2`; P = pass.** Each cell has an authored negative named `<exact-family>:S<n>` in standing_cases and a separately recorded full CLI mutation with expected/actual exit **1** in delivery-probes/full-cli-probes.json. No row is inferred from a sibling. The table's final column is PASS-cell count before → after; membership ABSENT and retention PARTIAL remain outside that count.

- **S1:** current append/retry with projector_replay_only refuses replay_only_not_appendable.
- **S2:** a do1 key in application scope refuses; † the three Project-only families instead reject an application-scope payload, since CV-366 application keys do not apply to them.
- **S3:** recorded Project partition replaced by raw Project ID refuses.
- **S4:** the family's inline body/aggregate grows beyond the complete 16 KiB budget and refuses; explicit external boundary/reference cases also run.
- **S5:** an actual EventRecord event_type gets a trailing LF and refuses via a full-match guard. The posted BLAKE3 source/stored copy retains its exact 71-character fences. Original coordination's 43 patterns remain an outside-lane integration item; no frozen schema was edited.
- **S6:** change caller semantics on a retry claiming original-result success; the comparator returns conflict and the full checker refuses that positive. Metadata-only candidates return the original full result.
- **S7:** a foreign valid-UUID Storage identity in the actual generic checkpoint refuses; every full token field has a separate internal negative.
- **S8:** give that family's failure oracle a success exit code 0; the full checker rejects it. These payloads have no process-result exit-code member; this is explicitly checker-level failure-oracle enforcement.

| Family | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | PASS cells |
|---|---|---|---|---|---|---|---|---|---|
| `config.validation.failed` | F | P† | F | F | F | F | F | F | 9 → 10 |
| `crew.board_message_posted` | F | P | F | F | F | F | F | F | 7 → 8 |
| `crew.board_message_read` | F | P | F | F | F | F | F | F | 9 → 10 |
| `crew.board_messages_archived` | F | P | F | F | F | F | F | F | 9 → 10 |
| `parser.error` | F | P† | F | F | F | F | F | F | 9 → 10 |
| `phase.force_completed` | F | P† | F | F | F | F | F | F | 9 → 10 |
| `subagent.budget_warning` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.cancelled` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.completed` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.context_warning` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.escalated` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.failed` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.message_received` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.message_sent` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.model_switched` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.output_truncated` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.paused` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.progress` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.resumed` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.retried` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.spawned` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.started` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.timeout` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.tool_called` | F | P | F | F | F | F | F | F | 9 → 10 |
| `subagent.tool_completed` | F | P | F | F | F | F | F | F | 9 → 10 |

## Verification, preservation and boundaries

| Check | Exit / result |
|---|---|
| Full DO checker | 0; top-level pass; 25 families / 6330 reported checks; application posted source listed stopped; native NOT_RUN |
| Frozen final full CLI sweep | 252 invocations: 4 baseline positives exit 0 and **248 negatives exit 1**, including all **200** family/standing cells and all prior-finding mutations |
| SP-337 / SP-351 supplemental mutations | Forged external positive, undecoded ingest, three oversized physical wrappers and eight application child bodies all exit 1 |
| Shard generation / index generation | 0 / 0, parsed top-level pass; currentness copy SHA-equal for all 15 files |
| Shard check / index validation | 0 / 0, parsed top-level pass |
| Full coordination checker | 1, same 2 pre-existing failures; stdout byte-identical to pinned review baseline |
| Runtime canon checker | 1, same 161 pre-existing failures; stdout byte-identical |
| Storage profile checker | 1, same 41 pre-existing errors; stdout byte-identical |
| Coordination tests | 50 tests, same 14 failures; full output equal after only root-path/elapsed-time normalization |
| Index binding tests | 14 tests, exit 0 |
| Source/storage preservation and ID audit | pass: no new IDs, no owner Markdown deletion, no frozen resource change; registry's only semantic change is posted priority domain |
| Self-grade quote audit | 25 families / 300 cells, every evidence quote re-located inside its own owner unit and verified |
| Python compile / git diff --check | 0 / 0 |

Only the four edited sources' shard directories changed: orchestrator-subagent-integration, storage-plan, automated_testing_system and storage_value_registry. Six global index files are generated normally; four JSON generated_at_utc fields are clock-dependent. No generated shard/evidence file was hand-edited. Frozen application source/contracts/graph, Contracts_V0 and all original coordination definitions/other storage families/policies/profiles remain exact. Main, governance locks/evidence, Decision Log, event-family registry and tests were not edited.

**Premise checks and open integration work.** DL-084's exact 19 chat histories, DL-085's three board histories and DL-086's three Project-only diagnostics remain current; OSI-440/CV-366 application support preserves the existing lifetime boundary and Server counterpart bucket. The retention branch was inspected at `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`; its linked-successor/assignment/admission prerequisites and Q1/Q3 are still open. The three original run-completion anchors and same-source access/deletion/hold fences remain. DL-085 archived/unresolved-blocker/leave-deletes-nothing prose and both DL-087 Collaborative_Workflows lifecycle pointers remain intact. No numeric cap or retention/deletion policy was chosen. The posted source-completeness premise failed and is now stopped, explicitly replacing the earlier false PASS. Admission, native execution and any governance reseal remain separate work.

**IDs used:** existing OSI-680..704, SP-720..722 and ATS-360 (29 existing lane IDs); **new IDs: none**. No registry append, admission record or Decision Log entry.

**Resource/procedure record.** Before creation: 16 GiB available RAM and 118 GiB free root disk, above the 6/50 GiB floors. Sparse detached `/home/sittingmongoose/pm-worktrees/DO-fix3` came from the named branch at the reviewed head. Checks used isolated local test directories, with no subagents, browser, server, heavy build or main push. The first source staging list omitted the renamed final generated registry shard; follow-up source commit `89ec4788c9612f7bbecbc1b230b47e90a0b94d07` includes it, and a committed-tree audit verifies every checked generated file is tracked. Two intermediate test sweeps were superseded while completing the ingest/source joins; their processes and scratch were removed and only the frozen final sweep is reported. Startup inadvertently issued read-only pm-mail inbox/who before FIX-ROUND's prohibition was loaded; no registration/send/reply and no later pm-mail occurred. The pushed task worktree and final probe scratch are removed at completion as required.

## External evidence

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DO/fix-round-3/`. SHA-256 is over the complete file. Report/self-grade copies also overwrite drafts/DO/DO.md and drafts/DO/DO.self-grade.json.

| Evidence (relative to that directory) | SHA-256 |
|---|---|
| `contracts-check.json` | `bdf73491682fed6bb0c5203461c408487f13a6bca17ba6546d97217d6d6cb488` |
| `delivery-probes/full-cli-probes.json` | `e0d96d370ef8bdbf9f68d287a62f02800bf8f76af5db7a30a7755dc918dc635b` |
| `probe-delivery-checker.py` | `d985224b2dc1fc92d1b95e2cb38d62beb644a8481d63f17a0eb34fa0364de9e4` |
| `delivery-input-sha256.json` | `3318b60367939c7cf4f44b00c4b3a8c434796c9de209bbdb5ed5a4b428b395b7` |
| `source-search.json` | `86e0602238f7b6f202dea3ec3001e4996de7df85bc4bffd85a7b28fc2d3dc9e9` |
| `integrity.json` | `087577b833e8055d19d6bc9446a6d60b8259577b564bf2b192745b2274eb93f6` |
| `committed-tree.json` | `a79e32567958f7335c736ca503b43fbac636704979ac5f900558849ad97fc77b` |
| `regression.json` | `2925613d59c236daa1d29b4794d09712f9ff4b8f8798209d60e37d7298e6f049` |
| `regrade.json` | `e2ba28160e709c00a5b422e19ae650407703d46afec59d73dc614a4d4e2081ca` |
| `currentness.json` | `58c077812500478e365b9ab494e9e6b92131eb586acf86ef321b088afdff18e2` |
| `shard-generate.json` | `0097f44a100929b5fcc967352e31e0a28f4a8974cb0027f58fdf4df24ed776d3` |
| `index-generate.json` | `c000cb2e59a695cf7524bcf04792bf7ec330cff12c73d45f4920d947cfef97aa` |
| `shard-check.json` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-validate.json` | `dc65206a412cd93006f11af3226cfc54c01a947694ca3bc407f72311e2834dfd` |
| `coordination-tests.stderr` | `6b9345a6b5883a967bec1b3feeea557a7e4a013dc00b47a281ad136bb8424995` |
| `index-binding-tests.stderr` | `f0360e2c365b8e2bb060de70f84866746b96f8c0d9436d84cc1a8b0fe2c8fb5d` |
