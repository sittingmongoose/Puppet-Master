# DCH — review round 8

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `3a994263ef63354fd9e2fde754f06faec92c84be`. Pointer fixture commit: `1a61d45b2100a9990a7d469e7e5fc13eb373d0af`. Owner-domain fix commit: `7c7b7abe3d665ab661f8c9a5b41246924f17e8e6`. Complete assessed source bundle: `57bf750d97400f7c3b6877b71eb34d3c7c828951`. This report and grade follow those source bytes.

**Seventeen ordinary family checkers pass: 41,339 assertions, zero failures, one family/job at a time.** Worker re-grade: **9 PASS / 2 PARTIAL / 1 ABSENT** each. Retention stays PARTIAL, membership ABSENT, and the oracle cell stays PARTIAL pending shared guard-isolation adoption. The prior worker 10/1/1 claim is superseded. Cycle 8 independently established oracle PARTIAL in all seventeen but did not finish the other cells; no complete independent before-grade is invented. **Stop remains held for Jared**, with its exact unchanged question and 0 PASS / 5 PARTIAL / 7 ABSENT row. Native execution remains NOT_RUN.

## Review round 8: findings and responses

- **C8-B1, fixture part — fixed (`1a61d45b2100a9990a7d469e7e5fc13eb373d0af`).** `scripts/pm_dch_round5_oracles.py:224` removes the two-defect oversized-plus-inexact pointer negative. `reference/pointer` now changes one valid hex digest character and preserves its encoded size, exact decimal byte count, media type, logical value, pack body/key/metadata and every source observation. Removing only exact-reference equality makes it pass in every family; the size guard remains enabled, all other reference negatives still refuse, and restoring equality rejects it again. The generator's other negative templates were inspected: no other stale copy/two-defect template was found (inventory and reasons in fixture-audit.json). Source-version edits recommit those exact bytes; foreign IDs synchronize checkpoint/index/hash copies while same-context keys stay valid; type negatives retain equivalent comparison values or test primitive admission without unrelated copies.
- **C8-B1, size witness — resolved as independently unreachable, not disputed and not called a duplicate.** SP-337's exact pointer is one map entry with the fixed payload_ref key, `payload:v1:` prefix, 64 lowercase hex digits, canonical unsigned-decimal byte size and fixed `application/msgpack`. Even the 20-digit uint64 maximum yields only **131 SP-236 encoded bytes**, below 16384; materializable Python byte lengths have at most 19 digits here. Thus an exact recomputed reference cannot independently violate the size guard. Both production guards remain. The replacement exact-pointer bound controls are positives; no fabricated flipping negative is claimed for the entailed defensive size predicate. `fixture-audit.json` records 17 equality-only flips and their rejected complements.
- **S1-NUM, Storage and owner-cap portion — fixed (`7c7b7abe3d665ab661f8c9a5b41246924f17e8e6`).** Removed the global 2^53 admission/encoding ceilings in `scripts/pm_dch_events.py:169` and `:190`; preserved exact integer types and exact owner uint64 bounds for sequence/source-token/pack metadata. The DCH-only EventRecord conditional preserves uint64 sequence admission and removes the invented producer_sequence_id maximum. All seventeen selected and registered checkpoint definitions restore the original frontier/generation uint64 maxima and remove invented publication revision caps; last_sequence_id explicitly copies the Storage uint64 domain. The four affected logical payload schemas restore their original minima and uncapped owner integer domains. CV-630–646 (`Plans/Contracts_V0.md:24480`), SP-610–626 (`Plans/storage-plan.md:29501`) and ATS-305 distinguish those domains from unchanged producer route availability. Producer RFC8785 projection, physical float encoding and retained dispatch are unchanged, verified by AST/source comparisons.
- **Cap-removal overflow containment — fixed (`7c7b7abe3d665ab661f8c9a5b41246924f17e8e6`).** Checkpoint hashing previously encoded the candidate before entering its existing physical-refusal handler. An owner-valid publication revision at 2^64 could therefore raise ValueError on a provenance path. Encoding is now contained before hashing; the same refusal boundary covers pointer and packed-body bytes, with the byte recipe unchanged. Each family has one additional structured-refusal containment control covering value, pointer and packed-body encoding; this is not a guard-isolation witness or an invented logical cap. The original failure is in overflow-before.json. One initial restoration cut the whole value handler and raised on an earlier control; it was not counted as refusal and was rerun with the original handler placement restored; the final seventeen-family campaign reruns every ordinary assertion.
- **Generated shard tracking — fixed (`57bf750d97400f7c3b6877b71eb34d3c7c828951`).** Two newly generated shard tail files were present in the verified working tree but omitted by the initial tracked-file-only staging list. They are now explicitly committed; tracked-source-check.json confirms that every verified Plans/scripts byte matches HEAD, no untracked source files remain, and both new shard objects exist in HEAD. No generated file was hand-edited.
- **C8-B1, proof machinery — sweep items below.** The specified merged keys and compound cuts remain untouched for the shared tool. No new whole-lane check-11 proof is claimed. This is why the oracle grade remains PARTIAL.

## New cases, guards and results

`pm_dch_round8_oracles.py` adds **489 cases/family = 8,313 cases**: **4,284 negatives** and **4,029 positives**. `new-negative-index.json` gives every negative its exact name, surface and target guard, with local IDs **DCH8-N0001–DCH8-N4284**. All execute through the complete ordinary CLI, both payload editions and each checkpoint.

- **Storage EventRecord sequence:** current write and incoming-retry positives at 2^53, 2^60 and 2^64−1; one-defect negatives at 2^64, −1, false, true, 1.0 and string "1". Incoming metadata is excluded from the unchanged semantic projection; valid metadata-only retries return original_result.
- **Current and two retained checkpoint generations:** every revision, last_sequence_id, frontier_revision, selected_segment_generation, manifest_generation and recovery_epoch path has the same write/repeated-write admission matrix. Primitive negatives have no source hash, equality copy or publication observation to go stale. Full positive publications for both editions synchronize original event/index sequences and exact commitments, publication revisions, complete token/node/source-selection copies as applicable. These are synthetic admission/publication models, not native CAS/retry execution.
- **Pack byte_size:** the same exact uint64 type/range matrix on write/retry admission, without allocating a fictitious enormous pack or pairing a false size with real bytes.
- **Publication revision domain:** the owner is nonnegative integer, with no new logical maximum. Its 2^64 case targets existing MessagePack representability, separately from logical admission; uint64 token/sequence cases target the actual owner range. No 2^53 ceiling or new serializer is introduced.
- **Pointer:** seventeen repaired in-limit exact-reference negatives; seventeen exact-reference bound controls replacing the masked size negatives; 34 additional uint64/runtime maximum-size positive controls. Size and equality remain distinct predicates.

The initial 41,322-assertion family campaign passed before the containment repair. Its outputs and eight-minute memory hold are retained under pre-containment/. The final campaign includes 17 added containment controls and passes 41,339 assertions.

Round-six cap-based expectations are corrected: 2^53 and higher valid owner values become positives; actual owner minima, uint64 overflow and existing physical representability refusals remain. Old retained recipe snapshots are unchanged. The legacy cap witnesses are historical proof inventory only, awaiting shared-tool adoption.

## Family grades before and after

Counts are PASS / PARTIAL / ABSENT. The prior-worker column is historical, not an independent cycle-8 certification. Every after row has its own current ACD/CV/SP citations and fresh complete-family result. The 204 prepared cells and all exact citations are checked again; Stop's row is preserved.

| Family | Before: worker round 7 | Cycle 8 established | After: worker round 8 | Assertions |
|---|---|---|---|---:|
| `bundle.selection_forward_blocked` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2375 |
| `bundle.selection_sent_to_chat` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2409 |
| `chat.message` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2391 |
| `chat.thread_archived` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2503 |
| `chat.thread_created` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2369 |
| `chat.thread_deleted` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2369 |
| `chat.thread_worktree_bound` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2367 |
| `chat.thread_worktree_create_failed` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2363 |
| `chat.thread_worktree_merge_failed` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2371 |
| `chat.thread_worktree_merged` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2375 |
| `chat.thread_worktree_pr_created` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2569 |
| `chat.thread_worktree_pr_failed` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2367 |
| `chat.thread_worktree_pre_merge_test_failed` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2733 |
| `chat.thread_worktree_pre_merge_test_passed` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2683 |
| `chat.thread_worktree_pre_merge_test_started` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2367 |
| `chat.thread_worktree_renamed` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2365 |
| `chat.thread_worktree_unbound` | 10 / 1 / 1 | oracle PARTIAL; full grade incomplete | 9 / 2 / 1 | 2363 |

## Sweep items

- **PROOF-ID:** `scripts/pm_dch_guard_proofs.py:387–390` merges identifier pattern, length and format predicates.
- **PROOF-INPUT:** the shared input wrapper (`:241`) and grouped exact-type keys (`:288`) merge different fields/predicates.
- **PROOF-COMPOUND:** compound envelope/access instrumentation (`:340`) merges meaningful predicates at one enforcement site.
- **PROOF-POINTER:** size/reference grouping (`:291–293`) merges distinct predicates. The size guard is entailed on exact references, never a duplicate of equality.
- **Closure for these four:** adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`. No lane proof script is rebuilt or rerun. The old frozen schema/proof inventory and round-7 guard tables retain historical bytes; they contain obsolete cap witnesses and are not current certification.
- **S1-NUM, producer portion:** unchanged RFC8785 producer-projection route (`retry_outcome`, `identity`). Unsupported exact producer inputs are still unavailable there; this must not narrow owner logical domains. Storage cap removal is closed in this round.
- **S2-NUM:** unchanged integral-float/signed-zero normalization in `body_bytes` (current `scripts/pm_dch_events.py:174–179`); adopt the shared type/sign-preserving physical codec during the sweep.
- **S3-NUM:** unchanged default MessagePack float64 packing (`body_bytes`); adopt shared exact float32 selection where permitted, keeping authentic original recipes.
- **S4-NUM:** unchanged missing-provenance fallback in `record_number_rule` and retained verifier resource dispatch; adopt authenticated full original-recipe dispatch and unavailable handling. Known raw-v1/normalized-v2/strict-v3 positives remain passing.

## Verification, scope and resource limits

Initial `hostname`: ubuntu-agent-nas1; `df -BG /`: **471 GB available**; `free -g`: **11 GB available**, above 50/6 thresholds. Final serial family campaign minimum: **8,021,069,824 bytes (7.47 GiB)**. The family campaigns together recorded **1 pause(s), 480 seconds total**, and resumed only at or above 7 GiB. The monitor suspends below 6 GiB, rechecks every two minutes, resumes at 7 GiB, and stops only after 45 minutes continuously below 6; pre-containment/memory-events.json records that pause; memory-events.json records the final family campaign and post-memory-events.json records later check pauses. No parallel family/checker jobs, subagents or pm-mail. Fifteen ignored currentness files were copied from the shared owner and SHA-256 matched before index generation. The required sparse detached worktree is removed after pushes and deliverable copies.

Source scope is CV-630–646, SP-610–626 and ATS-305; current schema companions, selected/registered checkpoint parity and targeted scripts only. Other owner prose, held Stop, `Plans/event_family_registry.json`, `Plans/Spec_Lock.json`, `Plans/auto_decisions.jsonl`, Decision Log, retained recipes/receipts/history and lane proof/frozen inventory files remain unchanged. Derived changes belong only to edited source owners; scope-audit.json records exact hashes and comparisons. No source retention/deletion choice, feature, technical identity/key/consumer binding, admission, registry append, Decision Log entry, test-file edit, reseal, landing lock or main push occurs. The two old optional memory files named by BRIEF-DRAFT were absent at the stated local paths and no replacement was found; no IDs are minted.

**IDs used:** existing **ACD-610–626, CV-630–646, SP-610–626, ATS-305**; new PlanUnit/acceptance IDs: **none**. Local case labels DCH8-N0001–DCH8-N4284 are evidence only.

The standard family suite re-executes all eleven standing-check-related corpora and Astra 1–9/11/12 ordinary mutations, known retained originals and format cases. Check 11 as a whole remains pending the shared proof tool; no independent full old-reader/restoration campaign or native result is inferred. S1 producer/S2/S3/S4 remain sweep-only. Broader index/integration baseline results are recorded in verification.json, without an aggregate governance pass.

## Check results

| Check | Exit / result |
|---|---|
| Seventeen final ordinary family runs | 0 each; 41,339 assertions, zero failures |
| Focused reference fixture audit | 0; 17 equality-only flips, 14 other reference negatives/family remain rejected |
| Full-checker defect restorations | 0 driver each; restored input cap, removed reference equality and removed value/physical overflow containment each yield structured checker failures |
| Shard generation / check | 0 / 0; only five edited source owners |
| Plan index generation / validation | 0 / 1; generation pass; 22 validation failures versus 23 at the unchanged reviewed baseline, zero new |
| Storage profile | 1; 41 existing errors; exact error-list comparison recorded in verification.json |
| Assistant contract | 1; gaps_found, errors empty; baseline comparison recorded in verification.json |
| Source scope / exact citations / whitespace | 0; current own units and schema parity, protected bytes unchanged |

## Evidence

All extra evidence is in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix8/`. SHA256SUMS pins retained commands, outputs, counters, target guards, scope/citation audits and monitor events. Key results:

| Evidence | SHA-256 |
|---|---|
| `serial-campaign.json` | `61e79aea29b6df31ff1adb432203307a3ef450ec81914f942f1d380fe76db7f7` |
| `fixture-audit.json` | `8a66e124f373f36f1365a337efb5271da206f9d6fa4feba99c4ce6ce88245882` |
| `new-negative-index.json` | `bea150953e58c97d9772aeba646dc2fa52a4aa23b3be3a9078372de7e7701bd3` |
| `scope-audit.json` | `4deb6679645163efbe18bf65bedd34eaa0e1a0e53e5b7c87d8a6210af6b10228` |
| `grade-citation-check.json` | `e624ce5525f70a0b3614a69965cf1b1593e90ed91ec356d54db9d65d391d3039` |
| `verification.json` | `846dc5563e50d53dfbbdc75b7f49375319e1593544e8fdd2ad17896b76428df7` |
| `currentness-sha256.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `pre-containment/memory-events.json` | `87f32ae02113f7469892c2b7ab13f0f4d6559c57369dd1d5d4ad77ac01be3d92` |
| `memory-events.json` | `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` |
| `post-memory-events.json` | `37517e5f3dc66819f61f5a7bb8ace1921282415f10551d2defa5c3eb0985b570` |
| `tracked-source-check.json` | `ff7a8af37cde2e756c5754a20d4712cba957c51dc8abd0026f3622ed53aef0fe` |
| `overflow-before.json` | `f0a45ffc470fa56a42a22cb92fd867873c2985464f3b08766f4f6c88b92325f9` |

---

# Prior reports — historical; round 8 above supersedes preparation and proof claims

# DCH — review round 7

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `c21fa62e507de04c5970fb51aabb9c841182dfed`. Assessed source/fix commit: `6e175c1b8a53caf9f6ef1e505182f2fe3b87a96a`. This report and grade commit follow those source bytes.

All seventeen families are prepared without admission at **10 PASS / 1 PARTIAL retention / 1 ABSENT membership**, after the independent cycle-7 grade of **8 PASS / 3 PARTIAL / 1 ABSENT**. The upgraded cells are compatibility_withdrawal and positive_negative_oracles. Independent re-review is pending; native execution remains NOT_RUN. **Stop stays held for Jared**, with its unchanged question and 0 PASS / 5 PARTIAL / 7 ABSENT grade.

## Review round 7: findings and responses

- **C7-B1 — fixed (`6e175c1b8a53caf9f6ef1e505182f2fe3b87a96a`).** CV-630–646 and SP-610–626 restrict strict-v4 numeric admission to new writes/current identity inputs. `scripts/pm_dch_events.py:110` selects the historical schema/type/domain/format/encoder from independently read actual-Store/source-commitment write provenance. A caller recipe flag is checked against that authority and cannot select or enroll a weaker recipe. The immutable raw-v1, normalized-v2 and strict-v3 snapshots preserve their exact original schemas and source pins. Original raw numeric bytes are verified without later normalization. The 416 retained event fixtures include the review's two numeric regressions in every edition/family, both policies and both transports, plus earlier-valid format records; 51 stored checkpoint/history positives use independent checkpoint provenance. Both terminal families and saved-original retries use the same historical reader. New retry inputs retain strict current validation; replay-only originals cannot authorize current append/retry. Differing earlier semantics conflict without crashing the current RFC8785 encoder. Physical packs compare exact encoded bytes, including raw integer/float distinctions. Forged recipe/source, foreign identity, withdrawal and access controls remain separate. The independent audit runs the unchanged original functions and exact Git schemas beside the current reader: **416 original-valid records accepted by both**, forged-byte controls refused by both.
- **S1 — fixed (`6e175c1b8a53caf9f6ef1e505182f2fe3b87a96a`).** `scripts/pm_dch_formats.py:9` registers mandatory UTC full-match/calendar validation without optional packages. Both payload editions, all three EventRecord timestamps and both selected/registered populated checkpoint histories reject missing zones, wrong separators/case, invalid Gregorian dates/year zero, month/day/hour/minute/second range errors, empty fractions, second 60, offsets and trailing LF. Valid leap-day, one-digit and long fractions pass. Original strict-v3 format behavior remains usable only through protected retained provenance. Incoming retries cannot copy an old malformed format into current input.
- **S2 — fixed (`6e175c1b8a53caf9f6ef1e505182f2fe3b87a96a`).** `scripts/pm_dch_formats.py:32` makes both PR-created editions use explicit RFC 3986 HTTPS grammar: percent escapes, authority/reg-name, bracketed IPv6/IPvFuture, port and path/query/fragment. The four review inputs and additional malformed escape, port, bracket, missing-host, scheme and whitespace forms refuse. Valid IPv6, IPvFuture (either V case) and escaped query/fragment forms pass. Earlier-valid PR URL bytes remain historical positives under their original protected recipe. No host allowlist or provider behavior is introduced.

No finding is disputed. No product or retention decision is taken. The first earlier-restoration campaign had one stale three-argument test adapter exception after the retry API gained original provenance; that exception was not a refusal. Its four-argument adapter and the exact case were rerun successfully. The other 56 restorations were already successful; 57 unique runs and 58 attempts are retained. All current payload/checkpoint/EventRecord schemas, both registries, the 4,923 frozen schema witnesses and 7,389 current primitive constraints are byte-identical to the reviewed head. All **19,382** earlier refusal witnesses remain in the final table. The older current-integer history controls now use a distinct independently committed current write observation; they no longer alias the exact bytes of an earlier protected original. Their strict-domain refusals remain.

## Stored-value path inventory

| Path | Rule and verification |
|---|---|
| New append / current identity inputs / incoming retry | strict-v4; exact types, safe integer domain, current schemas and mandatory formats; current append policy remains enforced. |
| `historical_read_valid()` / compatibility lookup | `record_number_rule(witness)`; entire original schema/format/type/byte recipe, exact source SHA-256, original identity and current custody/withdrawal. |
| `resolve_body()` / `payload_reference()` / `joins()` / `body_bytes()` | Carry the selected original recipe through inline bounds, physical commitments, BLAKE3/size/media-type and source custody; current calls use the strict default. |
| `retry_outcome(..., original_provenance=...)` saved original | Original recipe and shared historical reader; incoming retry validates under current schema/type/format rules. Storage-assigned metadata stays excluded from semantic comparison. |
| `checkpoint_joins()` original EventRecord/full-index row | Historical original dispatch before publication joins; retained index sequence keeps its original runtime representation, with exact type agreement against the original event. New checkpoint copies use their exact current integer representation. |
| `checkpoint_joins()` stored checkpoint/history value | Separate checkpoint write provenance selects its original schema/domain/encoding; current publication/root/frontier joins still apply. |
| `checkpoint_storage_valid()` pointer/pack/readback | Entire logical checkpoint and every physical inline part measured; original checkpoint commitment and exact pack bytes verified under its own recipe, with current custody. |
| `test_joins()` retained start | Shared historical dispatch and materialization for original start; new terminal payload/outcome stay strict. Both Stores/transports/policies and later live-state changes remain covered. |
| Preflight selected/registered/current/retained schema graphs | Every reference resolves eagerly, including unvisited branches of all three original recipe snapshots. |

Protected receipt rows are a synthetic independent Storage adapter, not a new authoritative event or native authentication claim. Production must obtain their mapping from authenticated original write/restore provenance; payload/caller data cannot update it. Earlier provenance is never guessed from numeric shape, mutable state or the requested recipe.

## Family grades before and after

| Family | Before: independent cycle 7 | After: worker | Ordinary assertions |
|---|---|---|---:|
| `bundle.selection_forward_blocked` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1886 |
| `bundle.selection_sent_to_chat` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1920 |
| `chat.message` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1902 |
| `chat.thread_archived` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 2014 |
| `chat.thread_created` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1880 |
| `chat.thread_deleted` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1880 |
| `chat.thread_worktree_bound` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1878 |
| `chat.thread_worktree_create_failed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1874 |
| `chat.thread_worktree_merge_failed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1882 |
| `chat.thread_worktree_merged` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1886 |
| `chat.thread_worktree_pr_created` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 2080 |
| `chat.thread_worktree_pr_failed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1878 |
| `chat.thread_worktree_pre_merge_test_failed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 2244 |
| `chat.thread_worktree_pre_merge_test_passed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 2194 |
| `chat.thread_worktree_pre_merge_test_started` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1878 |
| `chat.thread_worktree_renamed` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1876 |
| `chat.thread_worktree_unbound` | 8 PASS / 3 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT | 1874 |

## Whole-lane guard table

[DCH-guard-removal.md](DCH-guard-removal.md) records **6,138 guard rows**, **27,467 refusal witnesses** and **32,761 direct cases**. [DCH-guard-negative-index.json](DCH-guard-negative-index.json) resolves the flipping IDs and exact rejected complement for every row. All seventeen proof runs are serial, one guard or named duplicate set at a time; every guard is restored. **Zero unproved negatives, empty rows or mutation exceptions.** All 51 missing-generation containment controls still refuse. No early-success bypass is used.

Named duplicate sets include existing schema/semantic and scope dispatch rules, selected/registered copies and failed-exit copies, plus the joined payload.ts/EventRecord UTC grammar. The eight parser-predicate removals execute consistently through the full schema/history/retry corpus, not merely a direct parser sample; the table includes every affected negative. Syntax mutants supply parse context only and continue all calendar/time/IP rules. Schema-keyword rejection certificates are not reused for function changes that can alter format validation. Unreached/unchanged blockers retain deterministic baseline certificates; potentially admitting removals are reevaluated. The separate raw-parser audit also reruns every complement directly.

## All eleven standing checks

| # | How ruled out |
|---:|---|
| 1 | Current append/retry and either/both retry inputs refuse projector_replay_only; protected retained compatibility remains readable. |
| 2 | Exact CV-366 lowercase UTF-8 Server/original-operation application key and incompatible/LF controls remain. |
| 3 | Exact reversible encoded project~ partition; coherently re-keyed foreign/raw/padded/UTF-8 negatives remain. |
| 4 | Entire EventRecord/checkpoint/history/pointer bounds and verified SP-337 routes, maximum arrays and 16384/16385 boundaries remain. |
| 5 | Exact-end identifier guards/LF negatives in both schema copies remain; UTC/HTTPS formats now have mandatory full-match validation. |
| 6 | Exactly 21 caller-semantic fields; all three Storage metadata slots stay excluded. Saved originals use their original read recipe. |
| 7 | Actual Store, original event/source bytes, index/root/token/frontier/dataset and publication joins remain independently negated. |
| 8 | Actual failed exit cannot be zero; passed/timeout/process-error and retained original-start controls remain. |
| 9 | Current and all retained schema graphs close eagerly; hidden/file/dynamic/cyclic controls remain. |
| 10 | Raw-v1, normalized-v2 and strict-v3 history, compatibility, references, saved retries, stored checkpoints and retained starts pass under current custody; forged/withdrawn/foreign values refuse. |
| 11 | Entire final table has independent flips and exact rejected complements, including formatter primitives; no exception or accepting shortcut counts as proof. |

## All Astra classes, including 10a

| Item | Evidence that rules it out |
|---:|---|
| 1 | Recomputed identity/key/reference/source commitments and contradictory Store/frontier/publication mutations; raw stored pack numeric-byte forgery refuses. |
| 2 | Exact independently supplied source commitments verify assigned sequences/timestamps; payload claims cannot replace original Storage facts. |
| 3 | Original recipe dispatch on every retained path; later live state neither authorizes nor invalidates original history. Source/custody/withdrawal controls remain separate. |
| 4 | Exact current types and representations; retained raw numeric representations keep exact bytes and original validators, including pack-body comparison. |
| 5 | Eager closure includes unvisited branches in selected, registered, envelope and all historical snapshots. |
| 6 | Entire current/history values and pointers measured; schema bounds and existing SP-337 access/readback rules preserved. |
| 7 | Shared historical verification precedes checkpoint, saved-original retry and terminal-start use; original custody and family/identity joins remain. |
| 8 | Every mandatory negative has its own flipping guard/named duplicate set; no stale hash or observational copy masks it. |
| 9 | 204 prepared cells regraded from own current units and fresh serial evidence; membership/RT/native limits remain explicit. |
| 10 | 1/1.0/1e0, -0/0 and invalid JSON 01, safe-domain endpoints/successors and overflow controls remain for all seventeen. |
| 10a | Independent prior-reader/source-schema audit, protected provenance, old-valid numeric/format positives, exact old bytes and forged selection negatives across all seventeen. |
| 11 | String booleans/numbers, null, arrays, nested objects and bool/int aliases refuse at current boundaries; earlier stored representations use only their protected written recipe. |
| 12 | Mandatory UTC/calendar and HTTPS grammar does not depend on optional FormatChecker entries; every malformed class has raw-schema, relevant retained/current and primitive guard evidence. |

## Verification and scope

Index generation has top-level status pass. Index validation remains fail with 22 baseline failures, all reproduced by the unchanged reviewed-head control (23 failures); it adds none. Storage-profile output exactly matches the prior 41-error baseline. Assistant inspection remains gaps_found with empty errors/Projects-refresh failures; its only differences are hashes of the four edited owners. These are integration baselines, not successful aggregate checks.

| Campaign | Exit / result |
|---|---|
| Seventeen complete ordinary family checks | 0 each; **33,026 assertions**, zero failures |
| Seventeen final whole-corpus guard proofs | 0 each; full table above, zero unproved rows/negatives/exceptions |
| Independent unchanged prior-reader audit | 0; 416 originals plus forged controls, 105 exact Git schema pins |
| Current defect restorations | 0 campaign; 36 selected-family complete-checker runs, expected structured refusals |
| Earlier defect restorations | 0 campaign; 57 selected-family complete-checker runs; all earlier branches including archive, numeric/UUID, checkpoint and both terminal families |
| Shard generate / check | 0 / 0; only four edited owner sources |
| Index generate / validate | 0 / 1; parsed generation status and validation baseline are recorded separately |
| Unchanged reviewed-head index control | 1; exact failure-set comparison in baseline-comparison.json |
| Storage profile / Assistant | 1 / 1; baseline comparison recorded, no aggregate pass claimed |
| Scope / grade citations / derived scope / diff whitespace | 0; own units only, current schemas/registries/frozen fixtures and held Stop preserved |

Seventeen per-family searches at the immutable reviewed head document the missing DCH original-recipe binding and reuse SP-236/278/286/337 and CV-339/365/366. DCH-binding-search.json preserves every earlier pin and adds this round's own search scope/negative evidence. Unrelated restore-point raw-v1 bindings are not DCH recipes. New technical refinements remain in each family's own CV/SP text; no consumer/projector/key/event, feature, retention or Stop choice is inferred from a sibling. Later-main premise adjudication remains the cycle-7 review's separate integration evidence; no new current-main audit is claimed.

Initial capacity: 11 GB available RAM and 96 GB root disk free, above 6/50 GB limits. One preliminary checker was stopped at 5 GB available and is not passing evidence; final campaigns monitor the floor continuously and run one family/job at a time. Fifteen ignored currentness files were copied and SHA-256 matched before index generation. No pm-mail, subagents, landing lock, main push, admission, registry append, Decision Log entry, test-file edit, frozen-validator change or reseal. The prescribed sparse detached worktree is removed after all commits are pushed and deliverables copied.

**IDs used:** existing ACD-610–626, CV-630–646, SP-610–626 and ATS-305. New PlanUnit/acceptance IDs: **none**. Report IDs: G0001–G6138, N0001–N27467. Stop stays held for Jared.

## Retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round7/`. SHA-256 pins below; the full manifest includes helpers, exact commands, exits, memory monitors and per-family proof outputs. Report and self-grade are copied to the parent DCH draft directory.

| Evidence | SHA-256 |
|---|---|
| `summary.json` | `8f0aa496b80ec044d13a7f1d8fd2e35fe222a1e74e1b1729d91bc463f4f2e455` |
| `guard-removal.json` | `ebe0b0b54db70b8602925d32e6704bb8765e55cca22bc331221b95bafd474b06` |
| `serial-campaign.json` | `6596a5dccaaec234314248cbd6d7fa3128ee0bd3d128eaf6dc3b61847269ed5e` |
| `independent-history-audit.json` | `7fb81da62e7a71fd404fb93f643e8f92917b2764dd5a9fb009d7b9ed8ede47e9` |
| `current-regressions.json` | `6dce227b97caf98338710b3060b00fed55008a9177b9ee99f31ab5bc7bd78602` |
| `serial-regressions.json` | `24df2db082ad04c5dd6699941f3d12ec47b7ad0291f1288346bf7e61a28386bd` |
| `scope-audit.json` | `1877eab64f26c1b0acbc1bff96fd93946c8dc809c41b4f91c56c21020a0aae82` |
| `grade-citation-check.json` | `af7218e482f450e605889d2fbcd2000b33fcff4d41a1ba16dc997a094b0353fe` |
| `currentness-sha256.json` | `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84` |
| `index-validate.json` | `9105a0c223c4337df6a50033a2102d5ac55994b9edf6d60d21d10b32e39db648` |
| `base-index-validate.json` | `2b2a161764fce9e490bddb40bfa8f2833e6a921059f450e426f93fecbfd236f3` |
| `derived-scope.json` | `eaa7cc2f9a990fa742f1097b7580fbcc937f77668794659bc346b0b4de419bdc` |
| `baseline-comparison.json` | `c15da38cf09fde421bb3f7572875a22de6040f228ed2b7225a091fc73d4c4f1f` |
| `capacity-events.json` | `f5bc98306d52fb253944d99a9c248dc2c746ee83b168118efa0555608b5d0968` |
| `SHA256SUMS` | `e7f9d90996ceac1a8ccf4ff889523667ebbfc1823e61f49d36f98ba61fcf6786` |

---

# Prior reports — historical; round 7 above supersedes preparation claims

# DCH — review round 6

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `a785466dc54f2b8efae7cf9aeb18472d2ce4764e`. Source/fix commit: `22221e04071cb5516fd50a13cec998386a7bb586`. This report commit follows those source bytes.

All seventeen families are prepared without admission at the worker self-grade **10 PASS / 1 PARTIAL retention / 1 ABSENT membership**, after Sol cycle 6's **9 PASS / 2 PARTIAL / 1 ABSENT**. The upgraded cell is positive_negative_oracles. Independent re-review remains pending. Native execution remains NOT_RUN. **Stop stays held for Jared**, with its unchanged question and separate **0 PASS / 5 PARTIAL / 7 ABSENT** assessment.

## Review round 6: findings and responses

- **C6-B1 — fixed (`22221e04071cb5516fd50a13cec998386a7bb586`).** `scripts/pm_dch_events.py:148` checks every actual `storage_instance_id` against Storage's own UUID descriptor in `Plans/event_record_index_checkpoint.schema.json` before resolution or hashing. `resolve_body()` also validates its explicit context. All selected/registered DCH checkpoint current/history instance slots now require the exact UUID type/format/length. SP-610–626 bind those checks to independently read original Storage commitments and source/token/selection/pack contexts. Both payload editions in every family have coherently re-keyed/recommitted null, bool, integer, array, object, empty, overlong, malformed and LF context negatives. Valid second-Store histories remain positive. The shared type/context guard has independently flipping witnesses; restoring the UUID defect makes each family's complete checker fail.
- **C6-B2 — fixed (`22221e04071cb5516fd50a13cec998386a7bb586`).** CV-630–646 and SP-610–626 choose the exact I-JSON safe integer domain **|n| <= 9007199254740991**, preserving every tighter field minimum/maximum. Owned payload/checkpoint schemas, the DCH-only EventRecord conditional, recursive input admission, RFC8785 retry commitment and SP-236 encoding apply the same range. No unrelated EventRecord family is capped. Readers/writers/checkpoint joins refuse out-of-domain input; retries return `invalid_input_type`. Known encoder-domain refusals remain contained, without rounding, stringification or uncaught IntegerDomainError/OverflowError. Tests cover the last admissible value/successor, signed endpoints for permitted exit codes, uint64 max, uint64 max+1 and 2^100. Every checkpoint current/history integer has a raw schema upper-bound witness. The encoder's own bound is removed independently and its +/- successor negatives flip. Admission and encoder restorations separately fail all seventeen complete family checks.
- **C6-B3 — fixed (`22221e04071cb5516fd50a13cec998386a7bb586`).** `scripts/pm_dch_events.py:293` resolves the actual retained started record through `historical_read_valid()` with its own Storage context, exact original commitment, supported envelope/payload edition and current custody before terminal joins. It resolves verified SP-337 bodies and never applies current append policy to the historical start. ACD-622/623, CV-642/643/644 and SP-624 state this obligation. Both terminal families and both editions cover both Stores, both transports and both ordinary/compatibility policies after live-state changes: **32 retained-start positives**, with independent forged, withdrawn, foreign and access refusals. Earlier started-source mutations now carry coherent independent commitments so their original schema/relationship defects remain isolated. Restored compatibility/reference/default-Store restrictions each fail both terminal families.

No finding is disputed. No guard is weakened. All earlier source fixes, **17,430 refusal cases** and **4,923 frozen schema witnesses** remain present. The integer/UUID changes strengthen existing technical bindings under the explicit round-six repair scope; no consumer, projector, key recipe, retention/deletion choice, feature, admission or Stop record is invented. The per-family searches and premise checks in the prior report remain pinned lineage.

## Family grades before and after

P=PASS, Pa=PARTIAL, A=ABSENT. Before is the independent cycle-6 grade; after is the source-pinned worker grade. Every row has its own current ACD/CV/SP and new round-six citations.

| Family | Before | After | Ordinary assertions |
|---|---|---|---:|
| `bundle.selection_forward_blocked` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,300 |
| `bundle.selection_sent_to_chat` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,334 |
| `chat.message` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,316 |
| `chat.thread_archived` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,428 |
| `chat.thread_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,294 |
| `chat.thread_deleted` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,294 |
| `chat.thread_worktree_bound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,292 |
| `chat.thread_worktree_create_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,288 |
| `chat.thread_worktree_merge_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,296 |
| `chat.thread_worktree_merged` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,300 |
| `chat.thread_worktree_pr_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,312 |
| `chat.thread_worktree_pr_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,292 |
| `chat.thread_worktree_pre_merge_test_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,610 |
| `chat.thread_worktree_pre_merge_test_passed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,560 |
| `chat.thread_worktree_pre_merge_test_started` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,292 |
| `chat.thread_worktree_renamed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,290 |
| `chat.thread_worktree_unbound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,288 |

## Complete guard table

[DCH-guard-removal.md](DCH-guard-removal.md) and [DCH-guard-negative-index.json](DCH-guard-negative-index.json) record **6,161 guard rows**, **19,382 refusal witnesses**, **22,640 direct cases** and the exact rejected complement of each flipping set. The seventeen runs are serial, with one guard or named duplicate set removed and restored per row. Shared/dependency cases deduplicate by exact identity in the combined table. Zero mandatory negatives are unproved; zero rows lack flips; zero mutation exceptions count as rejection. All **51** missing-generation containment controls still refuse, with no early-success shortcut.

The frozen schema inventory now has **7,389 primitive constraints** (7,031 earlier clauses retained, with strengthened Storage-instance shapes and added numeric bounds). Every earlier frozen negative remains byte-for-byte in the fixture list. The failed-test base/conditional exit-code bounds constrain the same slot and are a named duplicate set. Existing schema/semantic, scope-edition, selected/registered and zero-exit duplicate sets remain named. The numeric encoder has its own removal row. Unchanged-blocker certificates reuse only deterministic baseline rejections; every potentially admitting removal is reevaluated. Overflow/no-crash controls are separate positive refusal checks, not invented flipping negatives for unencodable bytes.

## All eleven standing checks

| # | How the class is ruled out |
|---:|---|
| 1 | Each family refuses projector_replay_only on current append/retry; retained compatibility readers have separate positives. |
| 2 | Exact CV-366 lowercase UTF-8 application keys and incompatible-key/LF negatives remain. |
| 3 | Exact encoded project~ partitions, reversible Project identity and coherently re-keyed wrong partitions remain. |
| 4 | Full EventRecord/checkpoint byte bounds and verified SP-337 custody remain; retained referenced starts now resolve correctly too. |
| 5 | Both selected/registered current/history schemas retain exact-end identifiers and LF refusals; UUID contexts add their own LF case. |
| 6 | Exactly 21 caller-semantic fields enter retry hashing; Storage-only sequence/timestamp changes retain original-result positives. Numeric admission precedes hashing. |
| 7 | Actual Store, event, source commitment, key/ref, full-index frontier/dataset and publication joins remain coherent and independently negated. |
| 8 | Failed tests refuse actual exit zero; passed tests require actual zero; timeout/process-error/nonzero controls and fabricated-field refusals remain. |
| 9 | Complete selected/registered/envelope reference closure is checked before instances; hidden/file/dynamic/cyclic controls remain. |
| 10 | All family histories/checkpoints and both terminal starts accept retained valid ordinary/compatibility/inline/reference/second-Store originals after live changes; unsupported, forged, withdrawn and foreign originals refuse. |
| 11 | The whole serial table proves each guard or named duplicate set, all earlier witnesses are preserved, and all unrelated containment controls still refuse. |

## All eleven Astra defect classes

| Item | Fresh evidence |
|---:|---|
| 1 | Identity/key/digest and joined source/frontier/publication forgeries refuse; malformed context negatives carry coherent derived IDs and commitments. |
| 2 | Storage context is a valid actual UUID; exact original encoded-record commitments verify assigned sequences/timestamps. Metadata-only retry positives remain separate. |
| 3 | Retained-history policy is used on every original path, including terminal starts; later live state grants no authority and does not invalidate retained evidence. |
| 4 | Exact schema/type/format rules prevent mixed scalar interpretations; physical numeric aliases share bytes while unsupported runtime forms refuse before semantic use. |
| 5 | Complete reference-graph negatives and valid recursive/file controls execute in every family. |
| 6 | Entire event bodies, complete current/history checkpoints and physical pointers are measured; maximum-array references retain custody and access checks. |
| 7 | Exact-family retained original custody precedes checkpoint and terminal publication; foreign/withdrawn/missing-reference controls refuse independently. |
| 8 | Every recorded refusal has an independently flipping guard or named duplicate set; no stale hash, post-state or other observational copy masks it. |
| 9 | The self-grade uses 17 own family rows, current exact citations and fresh serial proofs; membership/RT/native limits stay explicit. |
| 10 | All seventeen test 1/1.0/1e0, -0/0 and invalid JSON 01. Safe-domain endpoints and successors cover schema, admission, retry and physical encoding; no rounding/stringification or crash is accepted. |
| 11 | Every family tests string booleans/numbers, null, arrays, nested objects and bool/integer aliases across payload, access, pack and retry paths. Coherent malformed actual Storage contexts and terminal started-access forms extend that sweep. |

## Verification and scope

| Check | Exit | Result |
|---|---:|---|
| Seventeen complete selected-family pm_dch_events.py runs | 0 each | 22,786 assertions, both editions and checkpoint, zero failures |
| Seventeen serial pm_dch_guard_proofs.py runs | 0 each | Full combined 6,161-row table; 19,382 refusal witnesses; 51 containment controls |
| Serial defect restorations | 0 campaign | 105 runs: 37 earlier lane branches, 57 C6 restorations and 11 round-five restorations; expected exits, zero exceptions |
| pm-shard-plans.py --generate / --check | 0 / 0 | 99 sources / 3,138 shards; changed owners only the six edited sources |
| pm-plan-index.py generate | 0 | Top-level pass; 7,473 PlanUnits / 30,024 acceptance units; no new IDs |
| pm-plan-index.py validate / unchanged-base overlay | 1 / 1 | Current 22 failures all occur on base; base has one additional stale readiness artifact. Zero new failure |
| pm-storage-profile-check.py | 1 baseline | Exact prior 41 errors, byte-identical |
| pm-assistant-contract-check.py | 1 baseline | Same gaps_found; only six edited-source hashes differ; errors and Projects-refresh failures empty |
| Source/derived/citation scope audits | 0 | 52 canonical pairs; 37 refined units; all current prepared citations exact; foreign owner bytes/profile content and held Stop preserved |
| git diff --check | 0 | No whitespace errors |

All checks run one family/job at a time, without parallel workers or subagents. The resource monitor aborts below 6 GiB available; no monitored run reached that floor (minimum across final campaigns/stages exceeded 15 GiB). Initial `free -g` available was 18 GB; initial root disk was 77 GB free, above the 50 GB disk floor. The detached sparse DCH-fix6 worktree is removed after the report push. Fifteen ignored currentness files were copied and SHA-256 matched before index generation. No main push, landing lock, reseal, registry admission/append, Decision Log entry, test-file edit or new PlanUnit ID occurs. Initial inbox read preceded the no-mail brief; no mailbox write or later mailbox use occurred.

The DCH-only EventRecord conditional leaves every older clause and every other family unchanged. Storage value registry changes are confined to the seventeen exact schema copies; full nested profile/foreign-row equality is verified. Owner changes are confined to ACD-622/623, CV-630–646, SP-610–626 and ATS-305; every other owner byte, including Stop, is preserved. Generated shards belong only to assistant-chat-design, contracts_v0, storage-plan, automated_testing_system, event_record.schema and storage_value_registry. Index row changes stay within the four edited owner docs. No all-origin ID clearance, governance or native certification is claimed; no ID is minted and the review's wider current-main audit remains integration work.

**IDs used:** existing **ACD-610–626, CV-630–646, SP-610–626, ATS-305**. New PlanUnit/acceptance IDs: **none**. Local report labels: **G0001–G6161**, **N0001–N19382**. **Stop stays held for Jared.**

## Retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round6/`. `SHA256SUMS` pins retained inputs, helpers and outputs; report and self-grade copies are also in the parent DCH draft directory. Main outputs:

| Path | SHA-256 |
|---|---|
| `summary.json` | `71d0836cb84580d8ae4ade756bb5ece6424768591d15f4f510713e1758f9496d` |
| `guard-removal.json` | `9800b85e48c9958341952487fb36b41d0de3bab8cd81629a9136eeecfff222be` |
| `serial-campaign.json` | `19860b3fba4f2e69b7b2d39b01cfd5ad2a47f3863bed84e2371e87821996c195` |
| `serial-regressions.json` | `487e4c05c24305359789002d2a88f1db31d9c58e3446e5cbf14140c301f27d4b` |
| `broader-comparison.json` | `6a49268128669521bda6f7df463c000ea05c6342b3b2aa6cfb27146de1bc62e6` |
| `scope-audit.json` | `32539ff3a7a693adb4e81ad170109dc3467c9517504f1b3407e8adc458e4b962` |
| `derived-scope.json` | `9427060508d351bf4219aaa6f6dbd4876a4c430dcf38a38abec2678b17b084bf` |
| `grade-citation-check.json` | `dbcf4c978c0c011da125420c4b1103c3cdcaca706a7b2fc68819c8a17770b438` |
| `earlier-negative-preservation.json` | `c6841905e95a747a9d571e7dc37691546aa05fcf3577a7c237437d385279eefe` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `shard-generate.json` | `59211a7490089d02e12c1bee53260a18e7f1bac149a9736278fb765b9f31fa20` |
| `shard-check.json` | `07f057d315fd728009c987886ccbccd75177debcdea6c1c628fe52452fbd50e9` |
| `index-generate.json` | `dcb67c500d21464cb1942ce9b21fa5e385d9f0316fc97feddfcc606e04600b52` |
| `index-validate.json` | `63db086e6dc9b5caf450eff25fe4302ad2cb1ccf220d78f3053df147ddb338af` |
| `base-index-validate.json` | `5143035024b5ab72833867077ea01bbcbdefc54740e52181e421e7491298e211` |

---

# Prior reports — historical; round 6 above supersedes preparation claims

# DCH — review round 5

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `d36809af13ae4a666a425b8632f3d6af9acde44c`. Assessed source/fix commit: `198a28e67da8770ea346ef65e6f4786ee220cc30`. This report commit follows those source bytes.

All seventeen families are prepared without admission at **10 PASS / 1 PARTIAL retention / 1 ABSENT membership**, after Sol cycle 5's **9 PASS / 2 PARTIAL / 1 ABSENT**. The oracle cell is upgraded on fresh evidence. Independent technical re-review is pending; native execution remains NOT_RUN. Stop stays held for Jared, with its separate 0 PASS / 5 PARTIAL / 7 ABSENT assessment and original question unchanged.

## Review round 5: findings and responses

- **C5-B1 — fixed (`198a28e67da8770ea346ef65e6f4786ee220cc30`).** `scripts/pm_dch_events.py` passes the actual `storage_instance` into the event-ID recipe inside `joins()`. History and checkpoints use their independently read Store context and exact original source commitment. `pm_dch_round5_oracles.py` exercises both Project/application editions in two Stores, inline and referenced, with ordinary and compatibility history. Foreign IDs preserve correct same-context keys and byte commitments; no stale observational copy supplies the rejection. Removing the actual-instance argument fails the complete checker for all 17 families. Locations: `scripts/pm_dch_events.py:228`, `scripts/pm_dch_round5_oracles.py:92`.
- **C5-B2 — fixed (`198a28e67da8770ea346ef65e6f4786ee220cc30`).** `checkpoint_storage_valid()` measures the entire SP-236 checkpoint, including retained history, and its physical pointer. `SP-610–626` explicitly bind 16384-byte inline / 16385-byte reference boundaries. The exact-boundary and maximum legal current/history arrays retain their logical bounds. Oversized inline values refuse; identical logical values pass only through exact BLAKE3/size/media-type references, same-instance/key/scope/family pack custody, current access and durable bytes/index/readback. Removing the cap or pack-custody predicate fails the complete checker for all 17. Locations: `scripts/pm_dch_events.py:343`, `scripts/pm_dch_round5_oracles.py:73`, `Plans/storage-plan.md:29497`.
- **C5-B3 — fixed (`198a28e67da8770ea346ef65e6f4786ee220cc30`).** `checkpoint_joins()` invokes `historical_read_valid()` with supported original envelope/payload validators, actual Store, index-record commitment and current source access before resolving/joining the body. It uses historical policy for retained originals and leaves current append/retry policy separate. Every edition's inline/reference compatibility positives survive later live-state changes; unknown editions, withdrawal, forgery and foreign records refuse. Unsupported-edition, writer-policy and missing-reference restorations each fail the whole checker in all 17. Locations: `scripts/pm_dch_events.py:96`, `scripts/pm_dch_events.py:292`.
- **C5-B4 — fixed (`198a28e67da8770ea346ef65e6f4786ee220cc30`).** Guard **G0838**, `checkpoint: source generation exists` (previously G0836), substitutes only an explicit accepted generation lookup witness and continues all downstream joins. It never returns early success. All 51 unrelated-defect containment controls refuse; an independent 102-assertion campaign checks them with the generation both missing and restored. The entire guard table is rerun and retained. Locations: `scripts/pm_dch_guard_proofs.py:294`, `scripts/pm_dch_guard_proofs.py:504`.
- **N1 / Astra item 10 — fixed (`198a28e67da8770ea346ef65e6f4786ee220cc30`).** SP-236 physical encoding canonicalizes integral aliases and signed zero to shortest integer bytes; exact integer slots refuse non-integer runtime forms before joins. Every family tests `1`, `1.0`, `1e0`, `-0`, `0` and invalid JSON `01`. Numeric payload families additionally test stable physical commitments, references, identity/key recipes and refused float retries. The schema permits sequence zero, so `-0`/`0` are valid identical positives. No DCH float slot is declared; the encoder preserves finite non-integral float values and refuses non-finite numbers. Locations: `scripts/pm_dch_events.py:115`, `Plans/Automated_Testing_System.md:7246`.
- **Astra item 11 — fixed (`198a28e67da8770ea346ef65e6f4786ee220cc30`).** Exact types precede equality, arithmetic and access checks. All 17 families exercise string booleans/numbers, null, arrays, nested objects and integer booleans in historical access, payload-pack custody, checkpoint-pack custody and retry availability. Archive request/state/readback flags and numeric publication copies have their own probes. The 238 availability cases remove the actual AST type predicate without replacing input; canonical unavailable=False remains an independent refusal. Locations: `scripts/pm_dch_events.py:131`, `scripts/pm_dch_guard_proofs.py:308`.

No finding is disputed. No new product choice is taken. Existing Stop remains the only held source-record question; RT source-policy assignment remains open.

## Family re-grade

P=PASS, Pa=PARTIAL, A=ABSENT. Before is the independent cycle-5 assessment. After is this source-pinned self-grade. Each row retains its own current owner/schema/custody citations; membership and retention are the authorized preparation exceptions.

| Family | Before | After | Ordinary assertions |
|---|---|---|---:|
| `bundle.selection_forward_blocked` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,061 |
| `bundle.selection_sent_to_chat` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,095 |
| `chat.message` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,077 |
| `chat.thread_archived` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,177 |
| `chat.thread_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,055 |
| `chat.thread_deleted` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,055 |
| `chat.thread_worktree_bound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,053 |
| `chat.thread_worktree_create_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,049 |
| `chat.thread_worktree_merge_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,057 |
| `chat.thread_worktree_merged` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,061 |
| `chat.thread_worktree_pr_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,067 |
| `chat.thread_worktree_pr_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,053 |
| `chat.thread_worktree_pre_merge_test_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,157 |
| `chat.thread_worktree_pre_merge_test_passed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,117 |
| `chat.thread_worktree_pre_merge_test_started` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,053 |
| `chat.thread_worktree_renamed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,051 |
| `chat.thread_worktree_unbound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 1,049 |

## Guard table and practical limits

[DCH-guard-removal.md](DCH-guard-removal.md) has **6,113 guard rows**, **17,430 refusal witnesses**, and **19,059 total direct cases**. [DCH-guard-negative-index.json](DCH-guard-negative-index.json) resolves every flipping ID and exact rejected complement. Zero guards lack a flipping witness; zero mandatory negatives are unproved; zero exceptions count as rejection. All 7,031 frozen schema constraints, 5,998 logical schema guards and 4,923 frozen schema witnesses are preserved. Named duplicate sets are stated in the table. Null is separately tested at the exact-type boundary and at the materializer's unavailable sentinel; these are not claimed as one end-to-end flipping witness.

All earlier confirmed findings remain fixed: exact CV-366 application keys; encoded Project partitions; manual-only archive; forbidden current replay-only append/retry; original maximum EventRecord body/reference bounds; caller-semantic retry commitments; independent checkpoint frontier/source identities; actual nonzero failure outcomes; exact-end regexes and schema parity; full schema-reference closure; isolated history-generation, retained-edition and terminal-started-event negatives. C4's three guard removals are rerun through the full checker. The previous 501-run and independent 677 raw-schema / 510 relation campaigns remain historical evidence, not fresh execution claims for this head. The current table and ten lane-wide defect restorations supply fresh evidence.

## All eleven standing checks and Astra sweep

| Standing check | Fresh coverage in every family |
|---:|---|
| 1 | Writer/retry forbids projector_replay_only; retained-reader compatibility is tested separately. |
| 2 | Exact CV-366 application key, including UTF-8 and exact-end negatives. |
| 3 | Canonical project~ partition with internally rekeyed wrong-partition refusals. |
| 4 | Complete EventRecord body and checkpoint 16384/16385 boundaries; verified SP-337 routes and maximum arrays. |
| 5 | Both selected/registered current/history schemas retain LF and exact identifier guards. |
| 6 | Exact 21 caller-semantic fields; Storage metadata changes remain excluded from retry comparison. |
| 7 | Actual-instance event identity, source record commitment and checkpoint/token/frontier joins. |
| 8 | Actual started/outcome joins, nonzero failed exit, independent success refusal. |
| 9 | Eager hidden/optional/history/conditional/file/dynamic reference closure and schema parity. |
| 10 | Retained valid inline/reference/compatibility originals survive later live state; forged/withdrawn/foreign/unknown editions refuse. |
| 11 | Complete guard table, isolated witnesses and all 51 no-bypass controls. |

| Astra item | Probe and result |
|---:|---|
| 1 | Forged IDs/digests and inconsistent owner/index/publication copies refuse; actual-instance foreign controls have coherent hashes. |
| 2 | Original source SHA-256 verifies Storage-assigned sequence/timestamps in actual Store context; metadata-only retries stay separate. |
| 3 | Both editions, two Stores, inline/reference and compatibility originals run through history and checkpoint publication. |
| 4 | Schema primitive guards and exact recursive types prevent numeric/hex, case, whitespace and type aliases being read differently. |
| 5 | Entire selected/registered graphs close eagerly, including unvisited branches; unresolved-reference guard negatives flip only on their own removal. |
| 6 | Every inline checkpoint part is byte measured; complete maximum current/history refs require verified packs; old EventRecord inline-only contradiction remains absent. |
| 7 | Exact-family original source/custody checks precede publication; original started-event and failure outcome controls remain enforced. |
| 8 | Whole-lane guard removal has no masked negatives; missing-source substitution preserves all later rules. |
| 9 | Grades use own current units and fresh oracles; admission, RT and native execution remain explicit limits. |
| 10 | Integer/float/exponent/zero lexical alternatives, encoded commitments, references, identities and retries have independent probes. |
| 11 | Wrong-type forms cover access, pack flags, archive, numeric copies, payloads and retry availability; exact predicates refuse coercion. |

## Verification, source scope and IDs

| Check | Exit | Result |
|---|---:|---|
| pm_dch_events.py | 0 | 18,287 assertions; all 17 families; zero failures |
| pm_dch_guard_proofs.py --out <proof> | 0 | 6,113 rows / 17,430 negatives; 51 containment controls |
| pm_dch_round5_regressions.py --workers 2 --out <results> | 0 | Ten complete, unfiltered lane-wide checker runs return structured exit 1; exceptions never count as refusal |
| Independent no-bypass-controls.py | 0 | 102 assertions, missing and restored generation; zero accepted controls |
| pm-shard-plans.py --generate / --check | 0 / 0 | Only storage-plan and automated_testing_system shard owners change |
| pm-plan-index.py generate / validate | 0 / 1 baseline | Generation passes; 7,473 PlanUnits. Validation has 22 identical reviewed-base retention/ledger failures after origin/main advanced; no lane-owned failure. Runtime certification remains blocked |
| Grade/citation/scope audits | 0 | 52 canonical prose/metadata pairs, own exact citations, protected inputs and held Stop unchanged |
| pm-storage-profile-check.py | 1 baseline | Byte-identical prior 41 errors; no new error |
| pm-assistant-contract-check.py | 1 baseline | Same gaps_found; errors and Projects-refresh failures empty; only the two edited owners' source/reference hashes differ |
| git diff --check | 0 | No whitespace errors |

Only SP-610–626 and ATS-305 prose/metadata change. Existing canonical text formatting is preserved when appending the refinements. No other owner, event-family registry, storage registry/profile, payload/checkpoint schema, frozen schema-witness file, admission, Decision Log, test file, Spec Lock, auto-decisions or governance evidence is changed. The 17 checkpoint fixtures gain independent access observations and coherent source-instance controls. New fixture-only physical/access/lookup observations confer no runtime authority. Currentness's 15 ignored files were copied and SHA-256 matched before generation. Index timestamps remain generated clock fields; no manual restamp is used.

Existing per-family binding searches remain pinned lineage. The same SP-236/278/337/340, CV-365/366 and SP-286/CV-339 owners are reused; no new consumer, projector, key, retention exemption, public behavior or product premise is chosen. **New PlanUnit IDs: none.** Existing IDs: **ACD-610–626, CV-630–646, SP-610–626, ATS-305**. New generated acceptance criterion: ATS-305-A005. Stop's four names, 3-second wait, saved outcome barrier and ACD-471 user-action barrier remain unchanged.

Initial capacity: 14 GB available RAM / 85 GB free disk, above 6 GB / 50 GB limits. A detached sparse DCH-fix5 worktree from the supplied local clone is used and removed after push. Initial inbox/who reads occurred before the no-mail brief was loaded; no mailbox write or later mailbox use followed. No subagent, landing lock, main push, admission or reseal is used.

The first index validation passed. A later shared-clone origin/main update to bc399e19742ddc6afd1a1cb1d77a33845341d565 introduced DL-302 into the comparison baseline. The pinned reviewed branch already lacks that unit. Applying the unchanged retention validator to the reviewed head reproduces all 22 final failures exactly: 21 invalid legacy ledger records plus the out-of-lane DL-302 comparison. No failure names a lane edit, no validator is weakened and no foreign file is repaired. This is an integration item, recorded in index-baseline-comparison.json.

## Retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round5/`. Paths below are relative to it and pinned by SHA-256. Report and self-grade are copied to the parent DCH draft directory. Raw outputs remain outside the repository.

| Evidence | SHA-256 |
|---|---|
| `dch-static.json` | `cd415169be2c188657de8edafed7285bdb604955bb814f7d4aecee3ee8ffa6ba` |
| `guard-removal.json` | `ad026e4d2387e849e1ebef395286bb19b006f113f75f06a25ac2ba3685d36708` |
| `full-checker-regressions.json` | `96f25497df46a4259648167b77d0bc1e7b26f9519feb8e7dfe26cd997a7c2d9a` |
| `no-bypass-controls.json` | `4482ab830002314338c1ac3f78ea9be96b4c87b5ea25c27c264967bc9c748525` |
| `grade-citation-check.json` | `c0f015178cbce6daddef7928613f0f8ab61edb960707b3651f5585d8730eeff5` |
| `scope-audit.json` | `bc07853de98332639b7bb7db2b1f0822680ffa41bd467b1f68c8f24c2c7cbb42` |
| `currentness-sha256.json` | `d509feb987c108bc388c76e45560986cd3536255c35eb914a76f07977b982e84` |
| `input-sha256.json` | `717500ca5359781797f2ede8663a2b9b77d54709ef043e8994b2fffdfd1b0345` |
| `broader-baseline-comparison.json` | `8a53f0f171740943e0d9a9e7dadd8f30a78fc867e0a88055d02511ebfb30009e` |
| `index-baseline-comparison.json` | `612a0592afed7d63f2c034566e495fd93d33ff179aecb5fa007efbf72279b270` |
| `shard-generate.json` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.json` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `cadfcb66daf053e67b6d5ea5c37c35666ff4f40635ca253805d2f1bca66e7771` |
| `index-validate.json` | `a6c8cdfe7680e9f64b1b7b65e7ac589e71c7afc86d9b74cceb6931c69d5254ee` |

---

# Prior reports (historical; round 5 above supersedes preparation claims)

# DCH — targeted round 4

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `4e1408afc1cda95ee03797deb0bb6e56a3273991`. Assessed source head: `d383d981f6ea97e226fc94bf137047b44a5cddcb`. Fix commit: `b581a704fcf362bb64a504cc4992a15f0d23e96b`; fixture-generator follow-up: `35f4d58988abb1e7b19a5c0df724a4cb1cab87e5`. Complete frozen schema-guard source: `d383d981f6ea97e226fc94bf137047b44a5cddcb`. This report commit follows those source commits.

**Outcome:** C4-B1, C4-B2 and C4-B3 are fixed. All seventeen families are prepared without admission at **10 PASS / 1 PARTIAL retention / 1 ABSENT membership**, versus cycle 4's **9 PASS / 2 PARTIAL / 1 ABSENT**. The upgraded cell is positive_negative_oracles. Membership and RT source-policy assignment remain the authorized exceptions. Independent re-review is pending; native execution remains NOT_RUN.

## Review round 4: findings and responses

- **C4-B1 — fixed (`b581a704fc`).** `Plans/dch_checkpoint_fixtures.json:523` adds a schema-valid maximum two-retired-entry positive for every family; `:647` derives the excessive-history negative by appending one complete retired generation. Its generation ID, checkpoint ref and dataset name agree. `scripts/pm_dch_events.py:581` exercises current, populated and maximum history positives against both exact schema copies; `:591` consumes the explicit negative instead of empty objects. Removing history.maxItems from both selected and registered schemas now makes each family's own four_generations negative accepted and fails the complete checker. All seventeen selected/registered pairs remain identical. No generation, staged/current, hold or retention obligation changes.
- **C4-B2 — fixed (`b581a704fc`).** Every unsupported_original_edition case in `Plans/dch_event_contract_fixtures.json` (first `:1873`) supplies the SHA-256 commitment of the exact unsupported retained bytes. That literal witness is independent checker input, rather than recomputed by the admission oracle. The unchanged historical source-hash, access, withdrawal and original-scope joins still enforce their own rules. Forged-original negatives retain their distinct unchanged-source commitment. Removing only historical payload-schema validation in `scripts/pm_dch_events.py:95` now accepts exactly the 34 unsupported-edition controls and fails the full checker.
- **C4-B3 — fixed (`b581a704fc`).** The four mismatched_started_started_event_id cases (first `Plans/dch_event_contract_fixtures.json:48055`) now change terminal payload.started_event_id to a different well-formed event ID and preserve the valid started record and actual outcome source. Removing only that terminal-to-started identity rejection in `scripts/pm_dch_events.py:213` now accepts all four cases and fails the full checker. Separate started extra-field, original identity and envelope-edition negatives remain executable.

No finding is disputed or stopped for a new product choice. The existing Stop hold remains for Jared's second deck.

## Whole-lane check 11 and guard-removal table

The complete table is [DCH-guard-removal.md](DCH-guard-removal.md). It contains **6,100 separate guard rows** with the guard expression or exact schema path, the negative IDs that flip, and the exact complement that remains rejected. [DCH-guard-negative-index.json](DCH-guard-negative-index.json) resolves **10,584 negative IDs** to concrete family/edition/case names and their guard evidence. This is a report companion, not a WorkNode or admission registry.

The proof runner executes **11,249 direct acceptance cases**: 10,584 refusals and 665 positive controls. Every listed guard has a flipping negative; zero fixture negatives remain masked, zero listed guards lack a witness, and zero mutation exceptions count as rejection. Guard variants exist only in memory and are restored before each row. Rejection certificates reuse the deterministic baseline only when unchanged constraints still block acceptance; every potentially admitting guard removal is reevaluated. Equivalent copies of one contract fact are identified in the table and removed together; unrelated constraints remain enforced.

| Guard class | Guard rows | Own negatives that flip | Every other negative |
|---|---:|---:|---|
| Selected/registered history generation limit | 17 | 17 | remains rejected |
| Historical original-edition validation boundary | 1 | 34 | remains rejected |
| Terminal payload to started-event identity | 1 | 4 | remains rejected |
| All table entries, including schema keywords, scope, transport, retry, historical access/commitment, test outcome, archive, checkpoint, parity and reference closure | 6,100 | all 10,584 refusal cases have witnesses | exact per-row complements retained |

The declaration cross-check covers **all 7,031 primitive constraints in 34 owned schemas**, grouped into **5,998 logical schema guards**. No declared guard is omitted because the original fixtures never reached it. `Plans/dch_schema_guard_fixtures.json` freezes 4,923 added one-change witnesses and the independently expected source rule values. Default verification rejects deleted/changed clauses, including null-valued clauses, and new unsupported vocabulary; deleting a frozen witness also fails. Six read-only complete-checker controls verify these refusals without counting exceptions as rejection.

The proof uses equivalent canonical schema forms for nullable primitive unions and the two disjoint required schema_id editions. Their object-type copies include the object assurance implicit in the original oneOf dispatcher. Required fixed scope tags include otherwise unreachable opposite-edition copies. Pure-schema rejection certificates account for conjunctions and alternatives; a cached rejection is reused only while every possibly admitting branch retains an unchanged blocker. The original and normalized validators agree on every accepted base and all 21,083 rejected exploration candidates. Only isolated witnesses are frozen; discarded exploration is never counted as negative evidence. The full source-rule correspondence is retained as `declared-schema-rule-map.json`.

The whole-lane audit also repaired observations beyond the three headline examples: started-source semantic mutations rekey and synchronize their envelopes and both terminal/outcome event references; checkpoint-token changes synchronize the publication copy and any untargeted index/root/selection/key relations; reference-hash controls retain a valid original body; required-test-outcome deletion starts from a valid timeout body; and unavailable-dedupe retries do not also change semantics. Generated retry payload controls change a schema-valid result fact without touching identity fields, and actor changes synchronize the payload copy.

Two redundant schema encodings were materialized equivalently in the failed-test editions so their guards can be isolated: conditional selectors explicitly require their already-required discriminator, and integer-nonzero-or-null uses the equivalent integer/null union plus the zero exclusion. A 640-case differential over both editions, discriminators, code types/values, evidence values and field absence finds **zero acceptance differences**. No acceptance function was changed: all thirteen pre-existing helper/acceptance function bodies are byte-identical to the reviewed head. The only new helper constructs test data.

## Per-family re-grade

Before is cycle 4's independent assessment. After is this worker's source-pinned self-grade. P=PASS, Pa=PARTIAL, A=ABSENT. Every family retains its own owner/schema/storage citations and independent fixtures.

| Family | Before | After | Ordinary assertions / refusal witnesses |
|---|---|---|---:|
| `bundle.selection_forward_blocked` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 607 / 622 |
| `bundle.selection_sent_to_chat` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 641 / 644 |
| `chat.message` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 623 / 622 |
| `chat.thread_archived` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 655 / 652 |
| `chat.thread_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 601 / 598 |
| `chat.thread_deleted` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 601 / 594 |
| `chat.thread_worktree_bound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 599 / 612 |
| `chat.thread_worktree_create_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 595 / 596 |
| `chat.thread_worktree_merge_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 603 / 624 |
| `chat.thread_worktree_merged` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 607 / 618 |
| `chat.thread_worktree_pr_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 607 / 620 |
| `chat.thread_worktree_pr_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 599 / 612 |
| `chat.thread_worktree_pre_merge_test_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 691 / 692 |
| `chat.thread_worktree_pre_merge_test_passed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 657 / 662 |
| `chat.thread_worktree_pre_merge_test_started` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 599 / 608 |
| `chat.thread_worktree_renamed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 597 / 608 |
| `chat.thread_worktree_unbound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | 595 / 596 |

Stop's separate **0 PASS / 5 PARTIAL / 7 ABSENT** assessment is unchanged, byte for byte. Its owner prose, names, outcomes and existing question are untouched. Manual archive remains manual; no source retention/deletion policy is selected.

## Verification and scope

| Command/check | Exit | Result |
|---|---:|---|
| python3 scripts/pm_dch_events.py | 0 | 10,477 assertions; all 17 families / 34 editions; no failures |
| python3 scripts/pm_dch_guard_proofs.py --out <guard-removal.json> | 0 | 6,100 guard rows; 10,584 refusal cases; no masked cases, unproved listed guards or mutation exceptions |
| python3 scripts/pm_dch_event_regressions.py --workers 4 --out <full-checker-regressions.json>, with separately retained invalid-positive reruns | 0 final | 501 unique mutations: 450 expected structured rejects and 51 expected accepts; 535 total attempts, including 34 reruns |
| Pinned cycle-4 guard campaign | 0 | 36 complete-checker runs at the assessed source head: 17 paired generation-limit, 17 historical-edition and 2 terminal-identity mutants; all expected structured failures |
| Frozen-schema fixture refusal controls | 0 | Missing fixture, deleted null constraint, lost/changed generation bound, uncovered vocabulary and deleted witness all return structured failure |
| Schema equivalence differential | 0 | 640 cases; no acceptance difference |
| pm-shard-plans.py --generate / --check --config Plans/sharding_config.json | 0 / 0 | 99 source owners / 3,135 shards; changed shard owner only automated_testing_system |
| pm-plan-index.py generate / validate | 0 / 0 | Parsed top-level status=pass; 7,473 PlanUnits; index changes only ATS-owned rows, plus expected aggregate metadata |
| Self-grade citation and scope audits | 0 | 18 rows / 216 cells / 425 exact citations; held Stop row unchanged; protected owners/registries unchanged |
| pm-storage-profile-check.py | 1 baseline | Same 41 pre-existing errors, byte-identical to round 3 |
| pm-assistant-contract-check.py | 1 baseline | Same gaps_found; errors and Projects-refresh failures empty; only the two ATS source/reference hash entries differ |
| git diff --check | 0 | No whitespace errors |

The initial full-checker campaign caught 19 fixture-generator exceptions when deliberate LF/extra-field mutations made its positive input invalid. Those exceptions are failures, never counted as successful rejection. The follow-up helper fix preserves the deliberate positive defect for the normal checker and changes one independently valid result field; all 34 invalid-positive controls were rerun. The initial campaign is retained separately, and the final campaign reconciles all 501 unique jobs with those reruns. The campaign began before generated retry/reference controls were finalized; the separate 36-run review-guard campaign and final ordinary/guard proofs pin the final source bytes. An earlier pinned attempt was invalidated by the helper edit and supplies no acceptance evidence.

Initial capacity was **116 GB free disk / 14 GB available RAM**, above the 50 GB / 6 GB limits. A detached sparse DCH-fix4 worktree from the specified local clone was used. Fifteen ignored currentness-edition files were copied and SHA-256 matched before index generation. No pm-mail, subagent, admission, family-registry append, Decision Log entry, governance seal, main push or test-file edit occurred.

Only ATS-305 changes canonical owner prose. Chat, Contracts, Storage, both registries, Decision Log, Spec Lock and auto-decisions match the reviewed head exactly. The standalone failed-test schema changes preserve its accepted set. Derived PlanUnit rows change only for the ATS owner (77 unchanged units inherit its new document hash); the new criterion yields generated ATS-305-A004. There are no newly authored product bindings or new premise choices. The prior per-family binding searches remain historical lineage at their pinned revisions.

**PlanUnit IDs used:** existing ACD-610–626, CV-630–646, SP-610–626 and ATS-305. **New PlanUnit IDs: none.** Guard/negative report IDs G0001–G6100 and N0001–N10584 are local evidence labels only.

No aggregate governance or native-execution pass is claimed. Independent targeted review, RT policy assignment and later per-family admission remain integration work. Stop stays held for Jared's second deck. The pushed fix worktree is removed at completion.

## Round 4 retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round4/`. SHA-256 pins are listed below. The final report, self-grade, guard table and negative index are also copied to the parent DCH draft folder.

| Evidence | SHA-256 |
|---|---|
| `baseline-before.json` | `a977f088bfdcc06876a315eb0d2425c3e7680e2a76e79cb55deb223ce526ce8e` |
| `dch-static.json` | `ac7d27b941e20c1a57f91a538e9016442aa4962ff58214503cbca474d4958f8c` |
| `guard-removal.json` | `30c12b661a300cff3f7ed8a482698bd49de8786537aeef50be4a1578afdd28d8` |
| `declared-schema-rule-map.json` | `11fafc4ea07c507ad6bfc9ed06262714a9421bbafc3d703c5d930d2771f766ff` |
| `schema-inventory-construction.json` | `73ebdf687096473323fb07ad8074f038f2b0698e87c50b8575032f5196479bb6` |
| `full-checker-regressions.json` | `bd4a08e86225942b3975662045f77afa0d1c8ca785267d1d8a6275db40d4eacf` |
| `full-checker-regressions-initial.json` | `274b6759147bbef736da9940e84b6f99fe936be90b1436fd84c3fc1a14e85498` |
| `invalid-control-reruns.json` | `735f48fbf2d6ab355e86f3e68694cd0b0bfa07aee7d81e806910d63e8b0819bc` |
| `pinned-check11.json` | `a4860db710d9bcf08fd145f51a305c618fbcff2ddb0c609355e2c56636bb8f1f` |
| `frozen-fixture-regressions.json` | `4a261534943ed9fbb83d61fc6af4ba5d66bab2c0602c2a49738b8541e186d9d1` |
| `schema-equivalence.json` | `5fe66430d7e024ddf12901a23e6fce7e38a7be614f3de30459b0343658f3dd25` |
| `scope-integrity.json` | `a2500bab1eb6c65ade670851b24c4b4c2f9962927e21a33160ed9f523946e1c0` |
| `grade-citation-check.json` | `c2d3bb46615b1a97cb2fcc3b3175d71e4bafa971ad3af2a7b483c5a27cffac3a` |
| `broader-baseline-comparison.json` | `d34fbebc611c8ea53cae227c1a8eca7bbd47ff3d5d7954506edaa51d715457ff` |
| `currentness-sha256.json` | `bff89fc88c53bba8f8f10d8c971bbaafcf44533863363b102767089c02d89e9f` |
| `shard-generate.json` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.json` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `00ca310efa5ff35233177528bf988c98a5e8d3aa2604261ebf9f44a6792708d6` |
| `index-validate.json` | `51a54a266c73f7ba950db802f8578e8ed6c0e90e409355e85c4d8750b4c9058c` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.json` | `8f8b0f6a37e3f38672ee0451c7d494df246a24738d1bc2c71125b4db56ba893b` |
| `pinned-check11.py` | `22074d26480fe8163bcc8cee4c8efda42cc3fe495f1ce216adb4114e6d5b73f7` |
| `rerun-invalid-controls.py` | `885e600f28035b254d1e3a20620fe34fae5ad9dc38171d1ea4e51a157f9a4f72` |
| `schema-rule-map.py` | `49ead8344055a9aeb22db45d27131fd6ec30232422511059f2923c99370a050f` |
| `frozen-fixture-regressions.py` | `652d6dd72451bff29fc835034f075053120beff203abe7e5a3c53179f9a06149` |

---

# Earlier reports — historical, superseded by targeted round 4

# DCH-FIX3 — final fix round, 2026-11-04

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `eb4bac6e61d0faeb38540c7d5c041e5889a6029c`. Fix commit: `26fa366c5638a23685141bdd30cca8a46d4d7356`. Exact original maximum-array regression extension: `318444509707c627e6a4ca703c06371249c7c6dd`. The following report commit changes only the report and self-grade.

**Worker result: 17/17 prepared without admission; final independent review pending.** Every candidate moves from Astra-2's **8 PASS / 3 PARTIAL / 1 ABSENT** to the worker's **10 PASS / 1 PARTIAL retention / 1 ABSENT membership**. The two upgraded cells are consumers_checkpoints and positive_negative_oracles. No family is admitted or twelve-cell complete. Native execution remains NOT_RUN. `chat.thread_archived` stays manual only under DL-287. Stop stays separately unprepared: **0 PASS / 5 PARTIAL / 7 ABSENT**, unchanged.

## Review round 3: findings and responses

- **B1 — fixed (`26fa366c56`).** All seventeen `Plans/storage_value_registry.json` DCH checkpoint `value_schema` objects now exactly equal their selected standalone same-ID/version schemas, including every current/history identifier/digest pattern and retirement timestamp. Representative registry line: 123252; selected `Plans/dch_event_payloads/dch_chat_message_checkpoint.schema.json:95`. `scripts/pm_dch_events.py:347` requires exact equality; `:547` independently exercises both definitions with current and populated-history positives and LF negatives. The expanded direct probe rejects **357/357** LF mutations in **both** copies (21 per family), including the review's original 187. Each family's full-checker mutations separately restore unguarded registry patterns, inject payload LF and inject populated-history LF; all exit 1. Verify: `python3 scripts/pm_dch_events.py`, `python3 scripts/pm_dch_event_regressions.py --workers 4 --out <evidence>/full-checker-regressions.json` and `registry-schema-probe.json`.
- **B2 — fixed (`26fa366c56`).** `scripts/pm_dch_events.py:32` resolves complete schema-reference closure before fixture execution, independently of instance traversal. This covers payload/envelope/selected checkpoint/embedded registry schemas; local pointers, dynamic anchors, file references, optional/conditional/history branches, and unselected branches of every referenced file. Valid cyclic/local/file references remain accepted. Missing references produce structured failures, never a silently accepted empty-history branch. Each family has a populated-history positive and separate full-checker missing-ref negatives. The actual CLI with all seventeen history refs broken simultaneously exits **1**, `status=fail`, **34 closure failures**, with matching selected/embedded mutations so parity alone cannot catch it. ATS-305 at `Plans/Automated_Testing_System.md:7239` now requires **all ten** checks; `:7242` states registry parity and reference/history obligations. Verify with the regression command above and the retained `cli-schema-negative.py --root <checkout>` (expected exit 1).

No finding is disputed. No new product decision is taken. Standing check 10 additionally gains explicit retained-original lookup coverage in `scripts/pm_dch_events.py:95`: original bytes/edition and current source/access checks remain mandatory, while later lifecycle/worktree state does not redefine historical evidence. Withdrawn or forged events are refused. The witness is a static adapter, not a newly invented authoritative record.

## Every standing check, every prepared family

**P = pass. F = fixed in `26fa366c56`** (check 10 adds the required oracle coverage). No open candidate cell. Each row below has its own actual fixtures, selected/registered checkpoint pair, current/populated-history positives and full-checker negative mutations; no sibling pass is inferred. Every row has the same before/after twelve-cell grades stated above. Check 8 means the actual terminal outcome for the two test-result families and rejection of a fabricated exit field for the other fifteen.

| Family | 1 replay | 2 app key | 3 partition | 4 body | 5 LF | 6 retry | 7 source | 8 exit | 9 refs | 10 history | Baseline checks |
|---|---|---|---|---|---|---|---|---|---|---|---:|
| `bundle.selection_forward_blocked` | P | P | P | P | F | P | P | P | F | F | 493 |
| `bundle.selection_sent_to_chat` | P | P | P | P | F | P | P | P | F | F | 527 |
| `chat.message` | P | P | P | P | F | P | P | P | F | F | 509 |
| `chat.thread_archived` | P | P | P | P | F | P | P | P | F | F | 537 |
| `chat.thread_created` | P | P | P | P | F | P | P | P | F | F | 487 |
| `chat.thread_deleted` | P | P | P | P | F | P | P | P | F | F | 487 |
| `chat.thread_worktree_bound` | P | P | P | P | F | P | P | P | F | F | 485 |
| `chat.thread_worktree_create_failed` | P | P | P | P | F | P | P | P | F | F | 481 |
| `chat.thread_worktree_merge_failed` | P | P | P | P | F | P | P | P | F | F | 489 |
| `chat.thread_worktree_merged` | P | P | P | P | F | P | P | P | F | F | 493 |
| `chat.thread_worktree_pr_created` | P | P | P | P | F | P | P | P | F | F | 493 |
| `chat.thread_worktree_pr_failed` | P | P | P | P | F | P | P | P | F | F | 485 |
| `chat.thread_worktree_pre_merge_test_failed` | P | P | P | P | F | P | P | P | F | F | 561 |
| `chat.thread_worktree_pre_merge_test_passed` | P | P | P | P | F | P | P | P | F | F | 535 |
| `chat.thread_worktree_pre_merge_test_started` | P | P | P | P | F | P | P | P | F | F | 485 |
| `chat.thread_worktree_renamed` | P | P | P | P | F | P | P | P | F | F | 483 |
| `chat.thread_worktree_unbound` | P | P | P | P | F | P | P | P | F | F | 481 |

The machine-readable matrix is `standing-checks.json`; every cell names its individual full-checker runs. All runs invoke the **complete unfiltered checker with all seventeen families**, using in-memory input substitutions or explicitly restored defective oracle behavior. The exact maximum-array bodies are 17,014/17,005 bytes for chat.message and 33,654/33,645 bytes for bundle.selection_sent_to_chat; all four remain valid through their authorized reference positives and are refused inline. No repository input is changed by the runner; an exception is an unexpected failure, not a successful rejection.

| Check | Negative that catches it (applied separately to every family) | Full-checker result |
|---:|---|---|
| 1 | Replace current positives' replay policy with projector_replay_only; baseline also tests append and either/both retry records. | exit 1 |
| 2 | Replace the application key with the incompatible Project dch: recipe; baseline validates exact CV-366 lowercase UTF-8 hex. | exit 1 |
| 3 | Replace the encoded partition with raw Project text, updating body, envelope, event ID and key consistently. | exit 1 |
| 4 | Restore acceptance of >16,384-byte inline probes; physical byte-boundary negatives then fail. Also restore schema-valid maximum attachment/provenance bodies inline for the two applicable families and remove reference support. | exit 1 |
| 5 | Inject payload identifier LF, restore old registry patterns, and inject LF into a populated history token. Baseline independently probes every patterned field in both definitions. | exit 1 each |
| 6 | Restore whole-record retry comparison; the three independent and combined metadata-only positives fail. Baseline also negates every included semantic field and global event-ID integrity. | exit 1 |
| 7 | Cross outer/token/selection storage instances while retaining the source event; independently advance the source frontier without the candidate. | exit 1 each |
| 8 | Failed-test actual exit 0 / passed-test nonzero source; all other families get a fabricated exit_code=0 field. | exit 1 |
| 9 | Break exercised payload, unexercised history, missing-file, optional, conditional, selected-only, registered-only, external-document-hidden and dynamic-anchor references. Positive local/file/cyclic references prevent a reject-all implementation. | exit 1 for each negative; exit 0 for each positive |
| 10 | Restore live-revision gating of history; separately claim withdrawn or forged historical evidence is a valid positive. | exit 1 each |

## Earlier findings rerun at the fixed checker

| Earlier finding | Exact restored defect / runner case | Result |
|---|---|---|
| Sol F1 | `2_old_application_key`, all 17 application editions (including the subsequently prepared archive). | 17/17 exit 1 |
| Sol F2 | `3_raw_project_partition`, internally rekeyed, all 17 Project editions. | 17/17 exit 1 |
| Sol F3 | `F3_archive_stopped_again`; `F3_automatic_archive` with matching automatic source. | both exit 1 |
| First Astra B1 | `1_replay_only`, both writer editions of every family. | 17/17 exit 1 |
| First Astra B2 | `4_inline_size_guard_removed`, `B2_payload_reference_support_removed` for all 17; `B2_legal_large_inline_body` and `B2_original_review_maximum_arrays_inline` for chat.message and bundle.selection_sent_to_chat. | all 38 exit 1 |
| First Astra B3 | `6_whole_record_retry`, independent Storage metadata-only retries. | 17/17 exit 1 |
| First Astra B4 | `7_checkpoint_storage_mismatch`; `7_current_frontier_mismatch`. | all 34 exit 1 |
| First Astra B5 | `8_success_as_failure_or_fabricated_exit` for chat.thread_worktree_pre_merge_test_failed changes both actual outcome and payload to success exit 0. | exit 1; other families' outcome/fabricated-field cases also exit 1 |

## Stop — unchanged question for Jared

Which existing durable chat run or turn record, with which exact fields, must preserve whether Stop cancelled the model/tool/subagent work or timed out, and the time of that outcome? The current chat and Storage owners name no such record. If none exists, do you authorize defining a run/turn outcome record and its fields before preparing chat.response_stop_requested and retiring chat_run.cancel_requested, chat_run.cancelled and chat_run.cancel_timeout? The 3-second wait and saved-outcome queue barrier stay, including ACD-471's requirement that queued messages wait for a user action after Stop.

The prior DL-406 condition audit remains below as source history. Neither the three chat_run outcome names, the 3-second wait, the saved-outcome queue barrier nor ACD-471's user-action barrier is altered. No Stop record/schema/fixture is prepared and none of its outcomes is retired. The archive manual-only ruling is unchanged.

## Authority, scope, capacity and verification

All own ACD/CV/SP producer, identity, scope, replay, retention, custody and transition contracts were re-read. `DCH-binding-search.json` adds a separate round-3 search for each exact family across **930 live non-hidden owner/schema/registry files**, excluding shards, ledgers and bootstrap, and pins its own ACD/CV/SP passages. Existing SP-278 original source, SP-337 body/access/readback, own historical-lookup and current-state projection rules are reused. **New product bindings: none.** New witness fields are fixture data only. The DL-045/DL-076/DL-287 premises remain current; the only failed existing-record premise is the already documented Stop condition.

**IDs minted this round: none.** Retained lane IDs: ACD-610–626, CV-630–646, SP-610–626 and ATS-305 (52 existing IDs). Only ATS-305's owner prose/metadata changes in this round. No ACD/CV/SP owner text, event registry, Decision Log, admission, source retention/deletion choice, .gitignore, Spec Lock, auto_decisions, frozen validator or governance evidence is changed. No test file is edited; targeted discovery finds only the two DCH scripts. No pm-mail or subagents, landing lock or main push is used.

Generated shard changes belong only to **automated_testing_system** and **storage_value_registry**. The PlanUnit index changes only ATS-owned rows (77 other ATS rows change only their owner-document hash); acceptance rows change only ATS-305. No other owner's generated body/indexed unit changes. Fifteen ignored currentness-edition files were copied and SHA-256 matched before index generation. No generated file was hand-edited.

Initial capacity was **16 GB available RAM / 124 GB disk free**, above the **6 GB / 50 GB** stop thresholds. Before the final four-process test run: **15 GB / 109 GB**. Later measurement: **18 GB / 96 GB**. The detached sparse worktree is `~/pm-worktrees/DCH-fix3` from `~/src/PuppetMaster`, approximately **3.4 GB**; it is removed after the final report push. Ordinary checker processes, not delegated workers, run the mutation matrix.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | top-level pass; **8,511 checks**, all 17 families / 34 editions; no failures |
| `python3 scripts/pm_dch_event_regressions.py --workers 4 --out <evidence>/full-checker-regressions.json` | 0 | **465 full-checker runs**: 414 expected negative exits 1 and 51 valid-reference positive exits 0; zero unexpected outcomes. The 463-case runner was followed by two additive exact maximum-array cases using the same unchanged full checker |
| Retained `cli-schema-negative.py --root <checkout>` | 1 expected | Actual CLI, all 17 history refs broken together: status fail, 34 structured closure failures |
| Registry/selected schema probe | 0 | 17 exact object matches; current and real-history positives valid; 357 LF probes rejected by both copies |
| Schema/reference audit | 0 | All 34 standalone schemas meta-valid; complete closure succeeds; registry pairs audited separately |
| Self-grade citation audit | 0 | 18 rows / 216 cells / **425 exact citations**; Stop unchanged |
| `pm-shard-plans.py --generate` / `--check --config Plans/sharding_config.json` | 0 / 0 | top-level pass; 99 sources / 3,135 shards |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | parsed top-level status=pass; 7,473 PlanUnits |
| `pm-storage-profile-check.py` | 1 | Byte-identical round-2 baseline: 41 pre-existing errors |
| `pm-assistant-contract-check.py` | 1 | Same apply-2b results after excluding three changed source-hash values; errors and projects_refresh_static_failures empty |
| Scope, schema parity, canonical_text, index-owner and protected-path audits | 0 | Only this lane's intended paths/metadata change |
| `git diff --check` | 0 | No whitespace errors |

The prior 6,012-check claim was incomplete; Astra-2 correctly identified its untested registry and history-reference gaps. The new suite supplies the missing evidence. Native process/receipt, full-source coverage, CRC, source locks, redb/CAS, pack durability, custody and withdrawal execution remain **NOT_RUN**. No aggregate governance pass is claimed. Final independent review, RT policy assignment and later family-by-family admission remain integration work; Stop returns to Jared.

## Round 3 retained evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round3/`. Report, self-grade and binding search are copied to the parent DCH draft directory. Paths below are relative to that evidence directory and pins are SHA-256.

| Evidence | SHA-256 |
|---|---|
| `baseline-before.json` | `9ba6198821b7671c7e21e0e1b36bf776baecb56c64570993351a18557b4aaebe` |
| `dch-static.json` | `a977f088bfdcc06876a315eb0d2425c3e7680e2a76e79cb55deb223ce526ce8e` |
| `full-checker-regressions.json` | `f0ab64706590de84d5fa20446f9762663d4433dd0942d01f15163c709a2c94d2` |
| `maximum-array-regressions.json` | `c13273b0c8ab72339f1b3fce4a36d45e99242faa0b7f9304ce584a82f7e347ee` |
| `standing-checks.json` | `77d9d600bc008923093dfbc341d6b1e303927e29a84a2c6a7b5be313bf0d0086` |
| `registry-schema-probe.json` | `90e469b7e3af8fbd3d7f9cf64675384966bb17db272ea7920f8f65eca15ee941` |
| `cli-schema-negative.py` | `4b5e983fb84a6d285659fe2b4ab8272bb7fcdf03e55b035e5987e0417e8f2a1b` |
| `cli-schema-negative.json` | `1e8de2dcef8829968351e732bdf30b84d10eae59b3dda8d9df7091494b236aa2` |
| `schema-integrity.json` | `772ceae1ed9323939cb303a6bdfeb40e2a6ca52d7d3ebd96e4e89fecdd7bf0d3` |
| `scope-integrity.json` | `f30a2be530493d7713c17103f6580cc5c5b5a9bcd8c1784eb0814dac426d449c` |
| `grade-citation-check.json` | `299339d3cb2e2a25a1ffacb31f43508c16a5c0ab89c7b7e029e37ae52962c8ab` |
| `code-pins.json` | `d2f0ffe3a950ea05a67a42e8abc8d982c6f2e175b23a6a2b69234b131a1a8ea6` |
| `checks.json` | `11adebca982af5bc0402d4aa05898de5ea44660de23425f76bc039a34a8348fd` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `shard-generate.json` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.json` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `737f25ac16608ecdff2a285a3616cfbdb3071b5acec1f1dd2c9095a68cf082f8` |
| `index-validate.json` | `2e580386a8bb5596cb27a75d8b5729845dc754e341a9db7ab2425590ff326986` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `f9e42d4b5edc4391e9131309f794d975fa9f73427c45bda0d331f6a303fab62d` |

---

# Previous reports (historical; round 3 above supersedes preparation claims)

# DCH-APPLY — card 2b A / DL-406, 2026-11-04

Branch: `plans/ea-w2-chat-20261104`. Inspected head: `bdc257cc0852fdd094570f2d8390216a4487821c`. This is a report-only condition audit; all owner, schema, fixture, checker, registry and derived content stays at that head.

**Outcome: Stop is blocked on Jared; nothing for Stop is prepared or retired.** No existing authoritative chat run or turn record, with existing fields, can be named for cancellation-versus-timeout and its outcome time. Seventeen previously prepared families retain their self-grades (10 PASS / 1 PARTIAL retention / 1 ABSENT membership). Stop's separate twelve-cell assessment is **0 PASS / 5 PARTIAL / 7 ABSENT**, UNDISPOSITIONED, not prepared, unregistered; native execution NOT_RUN.

## Exact question for Jared

Which existing durable chat run or turn record, with which exact fields, must preserve whether Stop cancelled the model/tool/subagent work or timed out, and the time of that outcome? The current chat and Storage owners name no such record. If none exists, do you authorize defining a run/turn outcome record and its fields before preparing chat.response_stop_requested and retiring chat_run.cancel_requested, chat_run.cancelled and chat_run.cancel_timeout? The 3-second wait and saved-outcome queue barrier stay, including ACD-471's requirement that queued messages wait for a user action after Stop.

## Current-source evidence and DL-406 premise check

Card 2b A is read from `decision-answers/E-CARDS-1.as-presented-578a6774.md`, SHA-256 `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`. DL-406 is read from `origin/plans/ea-cards1-answers-20261104` at `b6332f391a7870bad5f01a29a7e9d080050dac27`, `Plans/Decision_Log.md:4566` and its PlanUnit at `:5176`. It explicitly requires an existing record and outcome fields before retirement; if none can be named, return to Jared. No Decision Log bytes are imported or edited. The approved action is accepted; its existing-record condition fails on today's inspected canon.

| Candidate / owner | Current finding |
|---|---|
| Chat section 4, `Plans/assistant-chat-design.md:275` | Names all three `chat_run.*` records and `cancel_grace_ms = 3000`, then a saved outcome before queued messages may advance. It names no durable run/turn record or outcome fields. These exact bytes remain unchanged. |
| Streaming reply ACD-470, `Plans/assistant-chat-design.md:26479` | Terminal reply states are `complete`, `stopped`, `steered`, `error`; the partial transcript is for display (`:26483`). `stopped` records that the user pressed Stop, without distinguishing cancellation completion versus timeout or naming an outcome timestamp. It cannot be used as proof of cancellation success. |
| Queue ACD-471, `Plans/assistant-chat-design.md:26556` | After Stop or error, the queue waits for a user Send / Send now / Edit / Remove; no automatic advance. This stricter existing rule and the saved-outcome barrier are preserved together. |
| Run baseline, `Plans/storage-plan.md:596`, `:16966`; `Plans/storage_value_registry.json:7591` | `run:<run_id>` is a retired compatibility alias. The row's only required field is `schema_version`; optional fields are `created_at_utc`, `updated_at_utc`. Its value schema is deferred; replay is explicitly migration-read-only (`:7615`). No cancellation outcome field exists, and `updated_at_utc` alone cannot preserve that outcome. Writes to aliases are forbidden (`Plans/storage-plan.md:16968`). |
| Attempt / thread inventories, `Plans/storage_value_registry.json:7851` and `worktree_lane_thread_families` | Deferred Executor attempt identity and thread/worktree/persona binding inventory; no chat stop-outcome fields. Neither provides an existing writable chat run/turn outcome record. |
| Focused thread detail, `Plans/shared_runtime_contracts.schema.json:1208`; `Plans/storage_value_registry.json:29156` | Closed derived projection: state is `cached`, `synchronizing`, `replaying`, `current`, `stale`, `failed`. Its timestamp is projection update time. Registry expressly forbids treating the projection as authority (`:29196`). Transcript refs do not create the missing original outcome. |
| Outbox, `Plans/shared_runtime_contracts.schema.json:1006`; `Plans/storage_value_registry.json:27895` | `state`, `terminal_reason_ref`, `terminal_at_utc` describe command delivery, not the model/tool/subagent stop result on a run/turn record. `cancelled` is an outbox state; `expired` / `terminal_unknown` cannot silently mean the 3-second cancellation timeout. Reclassifying it would violate the approved record condition. |
| ObservableWork, `Plans/full_thread_runtime_contracts.schema.json:728` and registry `observable_work_projection` | Current object is a projection with `work_state`, `result_receipt_ref`, `error_ref`, `observed_at`; no authoritative chat stop-outcome/time fields. Its old physical row is migration/import-only. A derived status cannot replace the missing original. |
| Executor run control, `Plans/storage_value_registry.json:108591` | Key binds storage instance / Project / Goal / Goal run. It is not an ordinary chat run/turn record; adopting it would invent a Goal binding and cannot cover ordinary or application chat turns. |
| Stop catalog, `Plans/UI_Command_Catalog.md:8581` | `cmd.chat.stop` accepts `thread_id`, optional `run_id` / `assistant_turn_id`, `stop_reason_code`, `idempotency_key`; result has optional `stopped_ref` and `resumable`. It names `chat.response_stop_requested`, but neither defines the referenced outcome record nor its fields. |

Search scope: the complete chat and Storage owners and storage value registry; chat, shared runtime, current Full Thread, runtime expansion and native Executor control schemas; the Stop catalog; a live Plans-wide exact-name/field search excluding generated shards/indexes, ledgers, migration/evidence outputs and copied historical workflow inputs. The receipt records all eight candidate registry rows, exact field rosters, five schema inventories, the command and its four hits, and SHA-256 pins for every primary owner/schema inspected. No sibling contract is borrowed. No new technical binding, record, field, feature, retention/deletion choice, ID, or owner conflict resolution is authored.

## Checks and scope

**Owner passages changed: none.** `chat_run.cancel_requested`, `chat_run.cancelled`, `chat_run.cancel_timeout`, the catalog request spelling, the 3-second wait and both queue constraints remain byte-identical. No registry append, admission, validator/checker edit, Spec Lock, `.evidence`, `.gitignore`, `auto_decisions.jsonl`, Decision Log, landing lock or `main` push. No pm-mail, subagents or test edits. Initial capacity: 109 GB disk free, 19 GB available RAM, above the 50 GB / 6 GB limits. The absent requested worktree was recreated detached/sparse at the supplied head from the local clone, after fetching origin.

Fifteen ignored currentness-edition files were copied from the shared checkout and SHA-256 matched before generation. Shard regeneration changed no bytes. Index regeneration changed only `generated_at_utc` in four aggregate reports; normalized objects were identical and those self-generated timestamp-only diffs were discarded. No document-specific derived file changed. All source and derived content remains at the inspected head. The pushed worktree is removed at completion.

| Check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 6,012 checks, 17 prepared families, no failures; Stop is not covered or prepared. |
| All eight standing checks | 0 | Fresh full-suite run: replay-only append/retry refusal; exact CV-366 application keys; encoded Project partitions; SP-337 payload size/reference path; exact-end regex/LF negatives; producer-only semantic retry; checkpoint/source joins; actual failure exit-code rejection. All 17 family counters match the recorded evidence. No Stop pass is claimed. |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | Regeneration and shard/path verification passed, no shard changes. |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Both parsed top-level statuses: generate=pass, validate=pass. |
| Schema audit | 0 | 34 closed payload/checkpoint schema documents validated. |
| Grade/citation audit | 0 | 18 rows, 216 cells, 374 exact citations; Stop is graded blocked/unprepared. |
| Scope / derived-content audit | 0 | All source, protected and derived content identical; no new IDs. |
| `pm-storage-profile-check.py` | 1 | Byte-identical round-2 baseline, 41 pre-existing errors. |
| `pm-assistant-contract-check.py` | 1 | JSON exactly equals round-2 baseline, status `gaps_found`. |
| `git diff --check` | 0 | Pass. |

No new broader failure is introduced; no aggregate governance/native pass is claimed. This conditional task's remaining item is Jared's answer to the exact record question. Retention assignment, independent review and family admission for the original seventeen remain separate integration work.

## Apply-2b evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/apply-2b/`. Report, self-grade and check summary are also copied to the parent DCH draft directory. All pins below are SHA-256; logs and structured search receipts are retained because this report cites them.

| Evidence | SHA-256 |
|---|---|
| `QUESTION.md` | `2080266ecf7aabda0699a50a383a95984d4063faa44522d4e07713257612a925` |
| `DL-406.as-read.md` | `53434e4a2b34c1683840669e9bf9d3f4be827f193a3193f58b88966f39cd9850` |
| `stop-record-search.json` | `753ac840e836ca7d98a64f1379a7117042310fd0c694cb632a49da38d0613028` |
| `stop-record-search.log` | `259e103c2786ee780127eaa2b79c4006cc2960801bb0234e3029657ba644a9bb` |
| `currentness-sha256.json` | `c79bd5656ad4f994a7b47fe9e534b0dac085e530b38eceb5d7cceb80b69e9e3d` |
| `dch-static.json` | `9ba6198821b7671c7e21e0e1b36bf776baecb56c64570993351a18557b4aaebe` |
| `standing-checks.json` | `200f7c88f294616e4533cd7e0f90200533406164ed6308117d36b917f9b8dee7` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `37329fc1cf0abb5247e108a730befb26d7bdebf81213879729e171a7d52e665b` |
| `index-validate.json` | `9cf97f52f4c33b5783ddb4d5bbd1adc4a8af81ca8852864a859e37138fffe54a` |
| `schema-check.json` | `a6615af61412c4cbef0f504acf081e546172457e028dc1d562cb4e02cb547ec3` |
| `grade-citation-check.json` | `20081a4c0c64003dece089f34be8b8937905268e000c1a9e546434bf1184e030` |
| `scope-integrity.json` | `55ed67531f80466d523feb66f18054585d45c2923b5290238fd65aad804f3bfe` |
| `derived-scope.json` | `2d732dab92f476b62d0ff897cc02968d3097a9108fa6ac3c202b747d03258ae9` |
| `base-comparison.json` | `ad9f4374691f5fe6a1d41014e1d31d5c1e61aa6d2c83aae90d898f29a2ac1ac9` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `f991664b790faccb2674235e82f79c764c72b1df96432ae8e9307eaa01b80220` |
| `exit-codes.json` | `3dbea088b15f4958840c47be0cf94840a2d0eccf32b41ef414642fe460d732f7` |

---

# Prior DCH round 2 record (unchanged contract history)

Branch: `plans/ea-w2-chat-20261104`. Astra-reviewed head: `b3b8f054e169dc929789a4db9857885f7a2cf28c`. Fix contract commit: `1ef01512c78701cd9aae1b0d877115f2d80e0e4c`. The following report-only commit preserves those assessed contract bytes.

**Outcome:** all seventeen families are prepared without admission in the worker self-grade: ten PASS cells, PARTIAL retention and ABSENT membership each. Astra's starting verdict was 0/17 prepared. Independent re-review remains pending. Native execution remains NOT_RUN. No exclusion, new feature, retention choice, admission or `main` push is claimed. `chat.thread_archived` remains manual only under DL-287. The held Stop record/card and all its owner occurrences are unchanged.

## Review round 2: findings and responses

- **B1 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** Each CV-630–646 selects `dedupe_by_idempotency_key`; the contract rows and all 34 writer editions independently check it. `projector_replay_only` returns `replay_only_not_appendable` before dedupe for original, retry or both. Other unselected current policies are refused too. See `Plans/Contracts_V0.md:24478` and `scripts/pm_dch_events.py:95`, `:106`. Every family has append/retry negative cases. Full-checker restoration of all 34 replay-only positives exits 1 with 1,377 failures; separate compatibility-reader behavior is preserved.
- **B2 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** Every CV/SP family binding adopts SP-337; the contradictory “payload inline” selection is removed. See CV-631 at `Plans/Contracts_V0.md:24585` and `scripts/pm_dch_events.py:41`. The logical schema and 32 attachment / 64 provenance bounds remain. Actual canonical MessagePack bytes determine the 16,384-byte cap. Larger or separately governed bodies use empty inline payload plus the exact newly authored BLAKE3/size/media-type string selecting the existing payload-pack index key. The full body must resolve, validate, authorize, match original scope/instance/Computer/thread, and have durable pack/index/readback before acknowledgement/publication. Both editions of chat.message and bundle.selection_sent_to_chat exercise schema-valid 16,384-byte inline, rejected 16,385-byte inline, accepted reference counterparts and the review's maximum legal arrays. Every family also exercises the physical boundary and separately governed reference path, missing/changed/unauthorized/deleted/wrong-store/non-durable/wrong-size/type/ref evidence. Restored oversized inline positives fail the full checker (exit 1, 26 failures); deliberately removing reference support also fails (46 failures).
- **B3 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** The retry commitment uses exactly the EventRecord owner's 21 producer-semantic fields and RFC 8785/SHA-256. It excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc; same-key/event-ID integrity is checked separately. All 34 editions include a combined metadata-only retry, three independent metadata-only retries and one mutation of every included semantic field. See `scripts/pm_dch_events.py:20`, `:106`. Restoring whole-record equality fails 136 positive retry checks in the full suite. No field omitted from the owner commitment was silently reclassified as semantic.
- **B4 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** All seventeen checkpoints now have the same UUID Storage instance as their actual matching fixture EventRecord; last event/sequence, real generic-key/JSON-pointer/dataset forms and domain key match. See `Plans/storage-plan.md:29495`, `Plans/dch_checkpoint_fixtures.json:1`, `scripts/pm_dch_events.py:155`. Independent synthetic resolved-root/source/index/publication witnesses are compared against all nine durable-token fields, current selected source and complete frontier token. Each family has separate outer/token/selection/source instance, key/ref, scope, event/sequence, dataset, publication/ref/revision and current-frontier/source negatives. Changing all nested instances or advancing every current frontier fails all seventeen checkpoint positives in the full checker. These witnesses model joins; native SP-278 full-source coverage, CRC, locks and redb atomicity remain NOT_RUN.
- **B5 — fixed (`1ef01512c78701cd9aae1b0d877115f2d80e0e4c`).** ACD-622, CV-642 and the closed failed-test schema bind the actual original matching started EventRecord and terminal test outcome. See `Plans/assistant-chat-design.md:29821` and `scripts/pm_dch_events.py:128`. Ordinary failure requires the actual matching nonzero integer exit; 0 is refused even when both payload and outcome claim it. Existing W.9.3 timeout and process-error behavior uses explicit test_outcome with null exit status, and original error_ref for process errors. Passed events separately require an actual exit 0. Both editions cover nonzero/negative exit, timeout, process error, success refusal, original started-operation/scope/Computer/thread/worktree/command/strategy/duration mismatches and bad started-envelope edition. Restoring successful exit 0 in both failed-test positives fails the full checker (11 failures).

No finding is disputed or stopped for Jared. No new owner choice is required. Standing-check (5) additionally repaired every DCH identifier regex with an exact-end guard and trailing-LF negatives, including the HTTPS PR URL prefix gap found by the expanded suite. Closed non-exit families explicitly reject an added exit_code field.

## Round 2 family grades before and after

P=PASS, Pa=PARTIAL, C=CONFLICT, A=ABSENT. Before is Astra at the reviewed head; after is the worker at the fix commit. All after rows retain PARTIAL retention, ABSENT membership and native NOT_RUN. No family is twelve-cell complete or admitted.

| Family | Before (Astra) | After (self) | ACD / CV / SP |
|---|---|---|---|
| `bundle.selection_forward_blocked` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-610 / CV-630 / SP-610 |
| `bundle.selection_sent_to_chat` | 8 P / 2 Pa / 1 C / 1 A | 10 P / 1 Pa / 1 A | ACD-611 / CV-631 / SP-611 |
| `chat.message` | 8 P / 2 Pa / 1 C / 1 A | 10 P / 1 Pa / 1 A | ACD-612 / CV-632 / SP-612 |
| `chat.thread_archived` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-613 / CV-633 / SP-613 |
| `chat.thread_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-614 / CV-634 / SP-614 |
| `chat.thread_deleted` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-615 / CV-635 / SP-615 |
| `chat.thread_worktree_bound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-616 / CV-636 / SP-616 |
| `chat.thread_worktree_create_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-617 / CV-637 / SP-617 |
| `chat.thread_worktree_merge_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-618 / CV-638 / SP-618 |
| `chat.thread_worktree_merged` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-619 / CV-639 / SP-619 |
| `chat.thread_worktree_pr_created` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-620 / CV-640 / SP-620 |
| `chat.thread_worktree_pr_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-621 / CV-641 / SP-621 |
| `chat.thread_worktree_pre_merge_test_failed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-622 / CV-642 / SP-622 |
| `chat.thread_worktree_pre_merge_test_passed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-623 / CV-643 / SP-623 |
| `chat.thread_worktree_pre_merge_test_started` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-624 / CV-644 / SP-624 |
| `chat.thread_worktree_renamed` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-625 / CV-645 / SP-625 |
| `chat.thread_worktree_unbound` | 9 P / 2 Pa / 1 A | 10 P / 1 Pa / 1 A | ACD-626 / CV-646 / SP-626 |

## Round 2 authority, search, scope and checks

`DCH-binding-search.json` adds an individual round-2 search for each of the seventeen families against 741 live non-generated/non-ledger/non-bootstrap owner/schema/registry files at the reviewed head. It records exact-family hits, source hashes and the missing reference binding before reuse of SP-337 and its existing payload_pack_index key. The reference string and test started/outcome fields are newly authored technical bindings under the unchanged DL-045 scope, not new behavior. Existing SP-236, SP-337, SP-278, CV-365/366, SP-286/CV-339 and W.9.2/W.9.3 remain the owners. No generic full-index, EventRecord or Stop schema is changed. Prior DL-045, DL-076 and DL-287 premise checks still hold; round 2 directly re-read the current envelope, nine-field durable-token, payload-store and Pass/failure/timeout/process-error clauses. No premise requires a new Jared decision. RT source policy assignment remains pending; no source keepalive/deletion exception is introduced.

Initial capacity was 119 GB disk free and 11 GB available RAM, above the 50 GB disk / 6 GB RAM stop limits. The final checkpoint was 104 GB / 13 GB. Used detached sparse `~/pm-worktrees/DCH-fix2` from the local clone. Fifteen currentness-edition files were copied and SHA-256 matched before index generation. Initial inbox/who reads occurred before the no-mail brief was loaded; no mailbox write or further mailbox use followed. No delegation, admission, registry append, Decision Log edit, governance seal, landing lock or main push occurred.

Shared prose changes are confined to CV-630–646, SP-610–626, ACD-622/623 and ATS-305; exact prose/canonical_text equality is verified. All owner bytes outside those units match the reviewed head. Derived shards change only for assistant-chat-design, contracts_v0, storage-plan and automated_testing_system. Aggregate PlanUnit/acceptance rows change only for those four docs. All protected paths, Stop occurrences and archive owner bytes are unchanged. No test file was edited.

**New IDs this round:** none. **Lane IDs retained:** ACD-610–626, CV-630–646, SP-610–626, ATS-305. No existing identifier is repurposed.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 6,012 checks; 17 families / 34 editions / 17 checkpoint suites; per-family counters emitted |
| Full checker with each original defect restored in memory | 1 expected each | Replay-only, oversized inline, reference-path rejection, whole-record retry comparison, foreign checkpoint instance/current frontier and exit-0 failure regressions all caught |
| Full checker with old app keys / internally rekeyed raw Project partitions / identifier LF | 1 expected each | All three standing-check regressions caught; restored baseline exits 0 |
| All eight standing checks across all 17 families | 0 | standing-checks.json ties each cell to the full-suite family counters; failure exit checks are applied to the actual outcome families |
| Schema/owner/protected-scope and aggregate-index owner audits | 0 | Exact guarded schemas, canonical_text, unchanged protected bytes, four derived owners only |
| 204-cell self-grade citation check | 0 | Every disposition and cell citation matches the assessed contract bytes |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | 99 sources, 3,135 shards; no failures |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Parsed top-level status=pass for both; 7,473 PlanUnits |
| `pm-storage-profile-check.py` | 1 | Byte-identical recorded baseline: 41 pre-existing errors |
| `pm-assistant-contract-check.py` | 1 | Same gaps_found/results after excluding changed source hashes; errors and projects_refresh_static_failures remain empty |
| `git diff --check` | 0 | Pass |

The static checker uses jsonschema, msgpack, blake3 and rfc8785 (versions pinned in the evidence). Native process, receipt, full-source coverage, CRC, source locks, redb/CAS, pack sync/readback, custody and withdrawal execution remain NOT_RUN. No aggregate governance pass is claimed. Independent re-review, RT assignment and later family-by-family admission remain integration work. The pushed fix worktree is removed at completion.

## Round 2 evidence

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round2/`. Files below are retained; pins are SHA-256. Current report, self-grade and binding search are copied to the parent DCH draft directory. Scratch helpers are removed.

| Evidence | SHA-256 |
|---|---|
| `dch-static.json` | `9ba6198821b7671c7e21e0e1b36bf776baecb56c64570993351a18557b4aaebe` |
| `full-checker-regressions.json` | `3954fe29ebcf96ca41e07b527955e3e9ef6ac0a87c18469e6ae55dfdde076c7b` |
| `standing-checks.json` | `d9b881c2a00051c92db35a4e0eab08442245784cbe85bb2f986388c6312b4f55` |
| `scope-integrity.json` | `ec7d9371225604b6ccebae042f4d1a4f54bca3148bd35ec3ead375b2a180117e` |
| `index-owner-scope.json` | `c531cd196c188102039d75b8a4f819e9f11d2e1f44d38d6db472d031e805c4e5` |
| `grade-citation-check.json` | `765f381843209df60bd4b688fe32d065c251740698b105853e7ffb0b73e0b702` |
| `base-comparison.json` | `e9543d594f3a80a614b82c33dde48200e621914e4998e244ea75ffd37e2e0fe5` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `dependencies.json` | `4e9da5b0ce2a91d7ae50fb28b62e7ab171c40f1972e70690d764b7ec9b460400` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.json` | `c76621a09375cea17cffabb6cd76babc1c7f4337da0c26cb13bd4b9b5368c79d` |
| `index-validate.json` | `f9320de424a3294c0dd97bb8e97ee5e259420796b7060b827370e47ef0622aa3` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `f991664b790faccb2674235e82f79c764c72b1df96432ae8e9307eaa01b80220` |

---

# Prior round 1 record (historical; superseded by round 2 below)

Branch: `plans/ea-w2-chat-20261104`. Reviewed head: `2cc5f4246638ee4367d6ab14f3f6fceadc36ac6e`. Fix contract commit: `2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`. This report and its self-grade follow in a report-only commit.

**Outcome:** seventeen families prepared without admission; no archive product stop and no exclusions. Every family has ten PASS cells, PARTIAL retention and ABSENT membership. This is the worker's post-fix assessment; independent re-review is pending. Native execution remains NOT_RUN. No admission, event registry append, Decision Log entry, governance seal or `main` push occurred. The held `chat.response_stop_requested` record/card is untouched.

## Review round 1: findings and responses

- **F1 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** Each of the sixteen affected ACD/CV pairs explicitly selects the existing CV-366 application key: `application@1:` plus lowercase hex of exact UTF-8 `scope.server_id`, colon, and lowercase hex of the original `operation_id`. `owner_operation_id` is this original source operation, frozen before effect; no additional optional effect component is defined. Original Server/Computer/thread/source joins remain mandatory. The separate Project `dch:` key and Storage lifetime tuple remain explicit. Representative owner: `Plans/Contracts_V0.md:24474` (CV-630); the self-grade cites each family's own units. All seventeen application records now conform, including the new archive record. Same-operation/same-semantics returns original evidence, changed semantics conflicts, and unavailable dedupe refuses. Verify with `python3 scripts/pm_dch_events.py`; deliberately restoring every old application key makes the full checker fail.
- **F2 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** All Project positives and EventRecord payloads now bind `p1` to `project~cDE`. Dependent event IDs and Project keys were recomputed. `scripts/pm_dch_events.py:21` checks both strict decode equality to exact UTF-8 Project identity and canonical unpadded encode equality, independently of JSON Schema and envelope matching. Every Project edition includes valid and mismatched punctuation/Unicode cases, composed/decomposed distinctions, raw-ID, padding, invalid UTF-8 and noncanonical pad-bit negatives. Even a wrong partition with a recomputed matching event ID/key/envelope is rejected. Verify with the full checker; restoring `project~p1` makes it fail.
- **F3 — fixed (`2444634dc45b1df0c9d80c7f8d8ee3ccaadd11bc`).** Verified the current accepted text directly: DL-287 says “No chat auto-archives” (`Plans/Decision_Log.md:20343`); DL-280 gives approved recommendations and later rulings precedence (`Plans/Decision_Log.md:19967`). ACD-071 applies shared lifecycle scope (`Plans/assistant-chat-design.md:7024`) and ACD-508 says archive is never automatic (`Plans/assistant-chat-design.md:28766`). There is no Project exception. The two stale lifecycle trigger rows (`Plans/assistant-chat-design.md:1122`, `:1123`) now allow manual archive only. New ACD-613 at `Plans/assistant-chat-design.md:30157`, CV-633 at `Plans/Contracts_V0.md:25607`, and SP-613 at `Plans/storage-plan.md:31666` prepare this exact family with closed Project/application payloads, original-source joins, receipt ordering, concrete reader/projector/checkpoint, recovery/withdrawal and positive/negative oracles. The existing cataloged `cmd.chat.archive` action (`Plans/UI_Command_Catalog.md:730`) reaches the lifecycle owner interface `cmd.chat.thread.archive`; no new command is registered. Existing selected-thread/no-active-run guards, active/suspended predecessor, revision CAS/readback, stable lineage/folder/worktree, and current-state/tombstone fences remain. Retention assignment stays explicitly pending RT. Verify with the full checker and archive source/transition cases. No Jared question remains on automatic archive.

No findings are disputed or stopped for Jared. No notes require an integration change outside this lane.

## Per-family grades before and after

Before is the independent Sol review at the reviewed head, which supersedes the original overclaimed self-grade. P=PASS, Pa=PARTIAL, C=CONFLICT, A=ABSENT. After is the worker self-grade of the fix commit. No row is a twelve-cell complete/admitted family while membership and retention remain open.

| Family | Before (review) | After (self) | Units ACD / CV / SP |
|---|---|---|---|
| `bundle.selection_forward_blocked` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-610 / CV-630 / SP-610 |
| `bundle.selection_sent_to_chat` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-611 / CV-631 / SP-611 |
| `chat.message` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-612 / CV-632 / SP-612 |
| `chat.thread_archived` | 3 Pa / 9 A | 10 P / 1 Pa retention / 1 A membership | ACD-613 / CV-633 / SP-613 |
| `chat.thread_created` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-614 / CV-634 / SP-614 |
| `chat.thread_deleted` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-615 / CV-635 / SP-615 |
| `chat.thread_worktree_bound` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-616 / CV-636 / SP-616 |
| `chat.thread_worktree_create_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-617 / CV-637 / SP-617 |
| `chat.thread_worktree_merge_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-618 / CV-638 / SP-618 |
| `chat.thread_worktree_merged` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-619 / CV-639 / SP-619 |
| `chat.thread_worktree_pr_created` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-620 / CV-640 / SP-620 |
| `chat.thread_worktree_pr_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-621 / CV-641 / SP-621 |
| `chat.thread_worktree_pre_merge_test_failed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-622 / CV-642 / SP-622 |
| `chat.thread_worktree_pre_merge_test_passed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-623 / CV-643 / SP-623 |
| `chat.thread_worktree_pre_merge_test_started` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-624 / CV-644 / SP-624 |
| `chat.thread_worktree_renamed` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-625 / CV-645 / SP-625 |
| `chat.thread_worktree_unbound` | 7 P / 2 Pa / 2 C / 1 A | 10 P / 1 Pa retention / 1 A membership | ACD-626 / CV-646 / SP-626 |

## Binding searches and premise checks

`DCH-binding-search.json` retains the initial per-family lineage and adds a fresh `review_round_1` search for every exact family against the immutable reviewed head: 928 live owner/schema/registry files, excluding hidden/generated/bootstrap/ledger material. Each row records exact hits, paths, lines, file hashes, existing CV-365/366 adoption and explicit negative evidence. For the sixteen already drafted rows, original event_id, producer, readers, domain projector/checkpoint and withdrawal bindings are retained; the incompatible application key is removed. No sibling is evidence for another family's binding.

Archive's own search found existing lifecycle/name mentions and generic SP-278/SP-286, but no complete archive payload/reader/domain projector/checkpoint/withdrawal binding. Its new owner contract explicitly authors `reader.chat.chat_thread_archived@1.0.0`, `projector.chat.chat_thread_archived@1.0.0`, `projector.checkpoint.dch.chat_thread_archived.v1:{storage_instance_id}:{scope_partition}`, stored family `dch_chat_thread_archived_checkpoint`, and schema `Plans/dch_event_payloads/dch_chat_thread_archived_checkpoint.schema.json` (`pm.storage_value.dch_chat_thread_archived_checkpoint.v1`, 1.0.0). Its closed payload editions are `pm.dch_event.chat_thread_archived.project.v1` and `pm.dch_event.chat_thread_archived.application.v1` in `Plans/dch_event_payloads/chat_thread_archived.schema.json`. These are newly authored technical bindings under DL-045, for manual behavior already decided. SP-613 separately adopts the existing generic `projector.storage.event_record_index@1.0.0`, `event_record_index_checkpoint.v1:{storage_instance_id}` and nine-field SP-278/DL-076 token; no persisted redb_snapshot_id. The derived value has a registered profile and existing RP-PROJECTION-3GEN policy, source-order/CAS/shadow publication, coherent rebuild and withdrawal fencing.

- **DL-045:** the current exact 285-family table still includes all seventeen names (`Plans/Decision_Log.md:603`); the bounded technical-authoring scope and reuse-first requirement remain (`:564–566`). No feature or retention choice is made.
- **CV-365/366:** the current scope/key owner clauses at `Plans/Contracts_V0.md:24018` and `:24099` still apply. The old DCH replacement key and invalid positive partitions failed this premise check and are corrected.
- **DL-280/287 and ACD-071/508:** the former archive product question was based on obsolete trigger wording. Direct inspection establishes manual-only archive for Project and application chats; no conflicting accepted owner choice remains.
- **DL-076:** current SP-278 still requires the durable nine-field token; archive adopts it explicitly and its checkpoint negatives reject redb_snapshot_id.
- **Retention:** all source policy objects stay PENDING_RETENTION_DECISION for RT; chat.message retains its existing Case L-3 Chat content class binding (thread lifetime, 250,000/thread linked successor). All seventeen derived checkpoints adopt existing RP-PROJECTION-3GEN and its three-generation/604800-second eligible-retired bound with current/staged/hold/live-ref protection. Archive authorizes no expiry or deletion. Existing deletion semantics and the held Stop card remain unchanged.

## Scope, IDs and checks

Initial capacity: 17 GB available RAM and 125 GB free disk, above the 6 GB/50 GB hard limits. Used detached sparse `~/pm-worktrees/DCH-fix1` from the local clone at the named branch head. Fifteen ignored currentness-edition files were copied from the shared source and SHA-256 matched before index generation. No pm-mail, subagent, admission, frozen-validator edit or governance operation occurred.

Shared changes: existing lane ACD-610–612/614–626 and CV-630–632/634–646 identity prose and matching canonical_text; two old ACD lifecycle table cells; new ACD-613/CV-633/SP-613 appended units; ATS-305 oracle coverage; exactly one appended storage checkpoint row and one profile. Existing Storage units and registry rows/profiles are preserved. The only regenerated shard owners are assistant-chat-design, contracts_v0, storage-plan, automated_testing_system and storage_value_registry. Schema, fixture, checker and report companions remain inside lane scope; no test file was edited.

**New IDs this round:** ACD-613, CV-633, SP-613. Scanned 500 fetched origin refs / 145 distinct owner blobs; no collision. **Total lane IDs:** ACD-610–626, CV-630–646, SP-610–626 and ATS-305. No other IDs minted.

| Command/check | Exit | Result |
|---|---:|---|
| `python3 scripts/pm_dch_events.py` | 0 | 2,209 checks, 34 payload editions/records and 17 checkpoint suites |
| Full checker with original defects deliberately restored in memory | 1 / 1 expected | Rejects old application keys and invalid Project partitions; repository inputs unchanged |
| JSON/Schema/owner integrity | 0 | 34 schemas, full storage registry schema, 51 exact prose/canonical_text pairs |
| Per-family self-grade citation check | 0 | 204 cells and all disposition/cell citations match current bytes |
| `pm-shard-plans.py --generate` / `--check` | 0 / 0 | 99 sources, 3,135 shards verified; only five edited source owners changed |
| `pm-plan-index.py generate` / `validate` | 0 / 0 | Both top-level status=pass; runtime certification remains blocked |
| `pm-storage-profile-check.py` | 1 | Identical 41 baseline errors; no new error |
| `pm-assistant-contract-check.py` | 1 | Same gaps_found baseline; errors and projects_refresh_static_failures remain empty |
| Origin ID / source-scope audits | 0 / 0 | No collisions, protected artifacts/Stop preserved |
| `git diff --check` | 0 | Pass |

No aggregate governance/native pass or admission is claimed. RT assignment, independent review and later integration/admission remain with the lead. The required fix worktree is removed after all pushes.

## Evidence

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCH/fix-round1/`. Paths below are relative to that directory; each pin is SHA-256. The report, self-grade and updated binding search are also copied to the parent DCH draft directory.

| Evidence | SHA-256 |
|---|---|
| `dch-static.json` | `eb09b0ffab853d8441c47b835554cb9117276b8089cb31f544f9b8e20fe17461` |
| `original-defect-regressions.json` | `edf0c7e006d8e5a30a0e8f03529a964db8cd46d27a81a48186a4e84233712535` |
| `integrity-results.json` | `3636a55d86390b96c4c3ebbe001fc5a3a10f87e355c1af8852e66fad6ef102f4` |
| `grade-citation-check.json` | `d2ef5487a20d0c0a0e35ed66f51080c910de0d6281d42a17fea16246458c61d2` |
| `scope-audit.json` | `7fd561fef7c55acc124c60ad66285791c3019a428bb3da9c60e1e65119e4ed9a` |
| `derived-scope.json` | `6525af00f82b120f628ed1a4371776249b097f80ec432a72a2117f1acf206ec9` |
| `id-scan.json` | `9a8720683be4aad9e54c4a195bbdc3e63acfebf849d659cbaf530d766aaa4b61` |
| `currentness-sha256.json` | `ca2d5e7006f07aa13dd0c118f82ffcb29c20a655a7145631160f9516461e7c3c` |
| `base-comparison.json` | `4caefa8dea08a4ecb19844f5d0ba5d463fea0668a68b9ced4394e371d9538abd` |
| `shard-generate.log` | `a860c43269caab92d401c4ed0955268da735a36aee6a0f1d26608e7f426ade81` |
| `shard-check.log` | `6749d1671ce42bb36b5a4b623875e0db779efaf197186095421986d7d5490039` |
| `index-generate.log` | `d031f5b1bfa46765866e3b51502a4cd804716695bf3fed95ebfd149ce1e1b7c8` |
| `index-validate.json` | `7d71a3b5614d6c0361c250b999829ddd23d7f5d6a2f75c0cf14edd9c8feeb720` |
| `storage-profile.log` | `61b57de32ef976006a497d80df135d0ecd3a6841e3efb447572a6c3e3543c8e2` |
| `assistant-contract.log` | `8a541e973fc9979fa6396c54fd0fef531c84d7e468c4f9f424f33332a1c31b48` |
| `exit-codes.json` | `7ca33d6392ea974542b54a4adf9b50965748162e02b5af99e6463467e1071647` |
