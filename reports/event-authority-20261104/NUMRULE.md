# NUMRULE shared owner and adapter draft

Branch: `plans/ea-numrule-20261105`. Base: `fb441b27fd75440e14115fb382b15a5258ad7ea3` (`origin/main` after the required fetch). The report describes the commit containing it; the pushed head is recorded separately in the evidence bundle's `pushed-head.json`.

## Delivered scope

| Unit | Location and binding |
|---|---|
| CV-1100 | `Plans/Contracts_V0.md`, after EventRecord/compatibility versioning: exact current integer grammar/types, unchanged purpose-specific recipes, exact JCS route qualification. Referenced by EventRecord, CV-317 and CV-366. |
| SP-1100 | `Plans/storage-plan.md`, beside SP-236/SP-026: exact physical integer/uint64 domains, type-preserving shortest EventRecord floats and signed zero, separate SP-278/app profiles, exact original payload bytes. |
| CV-1101 | `Plans/Contracts_V0.md`, after CV-1100: enforced EventRecord date-time, existing stricter owner profiles and authentic retained selection; referenced by the EventRecord section/CV-317. |
| SP-1101 | `Plans/storage-plan.md`, with SP-286: authenticated immutable original recipe/resource selection, one frozen verifier, independent disclosure and current-request gates. |

SP-026/SP-236, SP-278, SP-286 and SP-337 reference the shared owners. Every existing local codec ID, preimage/prefix, tuple position, schema field/range and hash algorithm remains with its existing owner. No family is drafted or admitted by this foundation task. No registry/admission/Decision Log/governance path was changed.

`scripts/pm_event_numbers.py` supplies the shared reference adapters and `--self-test`; `scripts/pm_event_numbers_corpus.py` is their finite oracle runner. `Plans/event_number_recipe_corpus.json` is the common corpus. `reports/event-authority-20261105/NUMRULE-ADOPTION.md` gives exact function targets and existing owner units for all 19 drafting lanes, plus dispositions for all 10 ancillary lanes. No other lane branch was edited.

## Newly authored technical binding and search evidence

SP-1101 is the newly authored shared technical owner contract. Existing issuance/source/admission custody selects the exact original envelope/payload schemas, owner/source/edition/registry revision, identity/producer/physical/full/local/payload recipes and original resource hashes. It binds Storage, Server/scope/Project, family, original event/key/operation and source/value commitment. It creates no envelope field, registry service, durable recipe family or permanent owner-request mirror. Applicable family-specific adoption and the DL-045/DL-046/DL-090 scope limits remain prerequisites. This task adds no family-specific consumer/projector/checkpoint/identity binding.

The search covered immutable base Contracts EventRecord/CV-317/CV-339/CV-366, Storage SP-026/SP-236/SP-278/SP-286/SP-337, the envelope/checkpoint/receipt schemas, existing binding/app helpers and the complete `scripts/` tree for a shared authenticated-original tuple/dispatcher API. Existing owners already specify encoding/ranges, separate local recipes, original custody and versioned retained readers. The surveyed current owner statements do not supply the missing cross-domain number-recipe tuple join; the base has no `RetainedDispatcher`, `RecipeTuple` or `authenticated_original` implementation (search exit 1). This is scoped negative evidence, not a claim that no other historical source ever mentions a recipe. The adapter reuses `pm_event_index_binding.binding_bytes`; the other physical adapters implement the existing owner byte profiles and are checked against unchanged frozen complete-event and full-value vectors.

- Design: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/NUMRULE/REPORT.md`, SHA-256 `954cf05c452d4548c8ae43fd641c1b6b980a1eed278be3bc176d688534ab4551`. All sections 1–5, `LANES.jsonl` and `PROBES.json` supplied the targets.
- Immutable-base search: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/owner-search.txt`, SHA-256 `2a544388260142f8ad5cdbdeddfa10f9a365d7c449329081666877b11e678b40`.
- Existing shared API search: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/existing-dispatcher-search.txt`, SHA-256 `9819122cfc26c41fa14628ca5d0646b96da7cd68f13d2ae278c005703bb80dc3`.
- ID scan: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/id-scan.json`, SHA-256 `0fe65ca108870e01acbbb6280d16a25526aa1feb1cedd9651bec361d277ec7d0`: 541 origin refs, 109 distinct owner blobs, no missing owners and no CV-1100..1109/SP-1100..1109 collisions. Only CV-1100, SP-1100 and SP-1101 were minted.

## Exact behavior and limits

Raw JSON tokens are retained before binary64 conversion. Current integer slots use full-match `0` or `-?[1-9][0-9]*`, with exact integer primitives excluding booleans/runtime floats, then their actual owner minima/maxima. The helper does not turn a mathematical JSON Schema integer check into a lexical proof. Callers still validate every schema-directed nested integer slot.

Actual RFC8785 handles the selected JCS preimage. Qualification checks both original integer versus binary64 and the emitted decimal versus the exact original mathematical value. Thus 2^53 passes the exact route; 2^53+1 refuses binary64 loss; 2^60 refuses changed output decimal. There is no blanket 53-bit schema cap. `type_sensitive_paths` additionally refuses primitive/sign loss where that source owner distinguishes them. A finite fixture qualifies only its actual input, never an entire future schema/successor domain.

Physical EventRecord MessagePack preserves int versus float, signed zero and shortest lossless float32/float64. Full-width Storage uint64 metadata remains exact and stays outside the producer projection where excluded by CV-317. CV-366 always-float64/declared-binary physical values and SP-278 uint-only bindings remain distinct profiles. The unchanged CV-339 full-value tuple includes the complete original map, required nulls and Storage-assigned fields. SP-337 descriptor arithmetic compares actual bytes, BLAKE3, exact size/media and the 16384/16385 boundary; it cannot authenticate a pack/index, supply durability, or change a payload's declared media/profile.

`RetainedDispatcher` installs the original owner and exact frozen recipe catalog outside request data. It obtains one original selection; no caller tuple, `verified` flag, historical switch, self-hash or fallback loop selects it. The frozen verifier must independently check original schema/resources/identity/source/value/result/receipt joins. Existing global/scoped duplicate resolution still selects the original identity before this interface; it does not replace CV-339's alternate incoming-ID handling. Current disclosure is independent and exact-boolean checked. The fixture owner is a separate sealed lookup, not native authenticated custody. Valid old `1.0`, `1e0`, `-0`, exact large-decimal and >2^53 metadata originals return exact bytes/result/receipt with zero new effects.

## Corpus and bounded evidence after review round 1 (historical)

The current corpus has **370 cases: 193 positives and 177 negatives, all 177 labelled with target predicates**. Every case passes its finite oracle; 69 unchanged-owner/enforced-envelope integration checks pass. The original 25 diagnostic-group proof claims are withdrawn. Per-predicate isolation is **SWEEP_PENDING**, adopted through the shared guard tool, not a replacement proof script on this branch.

Binary64-only controls use ±10^23 (equal emitted decimal, inexact binary64); decimal-only controls include 2^60 (exact binary64, different emitted decimal). The 2^53+1/u64-max full-route refusal controls remain separate integration checks because they violate both predicates. Kind-only integral-float and sign-only negative-zero cases select only the relevant required semantics. The LF payload ID decodes to the correct digest; an independent well-formed ID has a wrong digest. Unknown recipe custody is an authentic sealed unsupported original; resource substitution uses a supported tuple and stale original resource selection only.

Raw/typed 1.5 and 1.25 pass with the declared float kind across JsonNumber, native float and Decimal carriers. Bare Decimal requires an explicit kind at a type-sensitive path. Both type-sensitive -0.0 refusal and sign-only refusal remain checked. Timestamp cases cover lowercase, nonzero/unknown-local offsets, long fractions, real offset-adjusted leap seconds, calendar/range/syntax negatives, stricter owner profiles and authenticated original profile refusal. All five literal numeric-history originals remain unchanged.

Admission evaluation returns acceptance/refusal/exception separately. Retained success-output assertions execute after admission; a forged returned result/receipt therefore counts as acceptance when its real verifier is cut. The targeted 65-case external regression run demonstrates that harness behavior, exception separation, independently valid unsupported custody, syntax-only LF, all 27 pinned leap days, 5000 fractional digits and exact timestamp spellings in hashes. This is bounded regression evidence, not a general guard-isolation proof or native custody proof.


## Verification

Latest round-5 commands, exit codes and artifact SHA-256 values are recorded in `NUMRULE.checks.json` and the external `fix5/*.run.json` files. Round-4 results remain in `fix4/`. Round-3 results remain in the external `fix3/` bundle. Round-2 results remain in the external `fix2/` bundle. Round-1 results below are historical and remain in the external `fix1/` bundle. Shard regeneration/check and top-level index generation/validation passed (7426 PlanUnits, 29960 acceptance units, readiness blocked_runtime_certification_incomplete). The 370-case corpus, 65 targeted regressions and all 30 existing binding/runtime-storage unit tests passed. The deliberate failure returned exit 1 and retained an exception as its own outcome. Derived scope is confined to Contracts/Storage (157 shard files, their PlanUnit/acceptance rows and two document cards). Generators and checkers run one at a time with a memory preflight; under 6 GB pauses at two-minute rechecks, resumes at 7 GB, and stops only after 45 minutes continuously below 6 GB. Initial Nas1 disk: 462 GB available; memory: 11 GB available. An automatic pause before index validation observed 5 and 6 GB available; validation resumed at 8 GB. The 45-minute stop threshold was not reached.

The specified machine-memory files are absent at their exact paths and no relocated copies were found under local Claude/T3/Codex roots. The all-origin canonical Contracts owner-ID scan covers 548 refs and 45 unique blobs, including main; CV-1101 is absent in all of them. The ignored currentness edition was copied before index generation and all 15 files matched SHA-256 at copy time; its pinned copy and manifest are retained externally. No governance reseal is performed.


## Premises, grades and open items

All 57 surveyed owner quotations still occur exactly in the current base; `owner-premise-checks.json` records each one. DL-045's current technical-authoring boundary remains the one quoted in the design; existing encoding/range/recipe/retained-reader premises are unchanged. No old product answer was extended or reworded. Failed owner premise checks: none. Unresolved Jared question: none.

The event-family grading rows are empty: this is a shared prerequisite and no new family membership or twelve-criterion family PASS is claimed. `NUMRULE.self-grade.json` assesses the four shared units separately. Native original-owner installation/authentication/activation/durability/restore proof, complete schema/successor route qualification and the 19-lane adoption sweep remain unexecuted integration work. Ordinary expected governance staleness awaits the assigned later integration/reseal; no landing, landing lock, main push or reseal is part of this branch.

## Review round 1: findings and responses

Implementation commit: `64778f641bcc32f9532ae03bbea80d4e2b772b38` (the report/check/self-grade update follows separately).

1. **Finding 1 — fixed.** `scripts/pm_event_numbers.py:202` carries the schema-declared numeric kind separately from its carrier, admits lossless raw/native/Decimal fractions, and refuses actual kind/sign/value loss. `numeric_kinds` is explicit for a bare Decimal; no universal Decimal-to-float policy is introduced. Verify the `jcs-typed-*`, `jcs-kind-loss-*` and `jcs-sign-loss-*` cases plus the typed -0.0 control in `fix1/regressions.stdout`.
2. **Finding 2 — fixture/harness defects fixed; proof machinery remains a sweep item as instructed.** `scripts/pm_event_numbers_corpus.py:234 (evaluation), :22 (postconditions)` separates returned acceptance, real Refusal and unexpected exception from success postconditions. All original negative positions are labelled; the two combined endpoint cases become isolated ±10^23 corpus cases with the original endpoints retained as full-route controls. Kind/sign and syntax/digest fixtures now isolate their respective predicates; unknown custody is authentic but unsupported, while resource forgery targets original verification. No new general guard-proof script is built. Verify the complete finite corpus and `fix1/regressions.stdout`; no full check-11 PASS is claimed.
3. **Finding 3 — fixed.** New CV-1101 (`Plans/Contracts_V0.md:1147`) owns `scripts/pm_event_datetime.py:48` under EventRecord/CV-317. `datetime_validator` passes an explicitly registered full-match/calendar/offset/leap-second checker. Tests exercise malformed timestamps through both that validator and the actual EventRecord envelope, valid lowercase/offset/long-fraction history, wrong profile selections and all pinned leap days. Legacy nine-digit/Z output remains separate from current input. The checker preserves other installed format predicates (UUID regression), then registers date-time explicitly. Source: RFC3339 sections 5.6–5.7 and the IERS Bulletin C72 leap history; frozen resource selection remains with SP-1101.
4. **Finding 4 — fixed.** `reports/event-authority-20261105/NUMRULE-ADOPTION.md:14` (boundary) and `:242` (DCN) adds the matrix and DL-045 escalation sentence, spells out 2^53 / 2^53+1 / 2^60 / u64 max and exact `storage_uint64` sequence handling, and adds CV-1101 adoption to all 19 lane paragraphs. DCH/DMEM/DT/DX keep the review’s owner domains and existing route refusals. No actual conflicting owner promise was found.

### Shared guard-tool sweep items

| Separate predicates | Remaining tool proof |
|---|---|
| Binary64 / emitted decimal | Cut one predicate at a time; ±10^23 isolates binary64 and 2^60 isolates output decimal. Preserve endpoint refusal controls. |
| Kind / sign | Cut only the required kind or zero-sign clause. Do not combine both defects in one purported isolated negative. |
| Catalog / original verification | Unsupported original is authentic; actual unknown dispatch has no verifier. Unexpected AttributeError after an invalid cut is an exception, never acceptance/refusal. |
| Replay-only / replay-policy | Cut only the replay-only exclusion in the closed enum; retain unknown-policy and exact-type checks. |
| Payload ID syntax / digest | LF has matching digest bytes; well-formed wrong digest is separate. Preserve syntax peers. |
| All labelled negatives / real duplicates / intrinsic parsers | Adopt `scripts/pm_guard_isolation.py`; genuine duplicate means the same field and predicate, proven site by site and all sites together. Whole-keyword or same-diagnostic grouping is insufficient. |

### Grades and standing checks after review

No family rows exist before or after: family grading is N/A, membership remains ABSENT. CV-1100 and SP-1101 finite oracles pass, but their aggregate adapter/selector proof and the corpus remain PARTIAL pending shared-tool isolation. SP-1100 frozen bytes remain PASS. CV-1101’s bounded enforced-format/profile cases pass; actual lane/native installation remains NOT_RUN. The old corpus/adapter blanket PASS claims are withdrawn.

Standing checks/Astra: original forgery is anchored independently; producer metadata exclusions and complete-value inclusions remain checked; historical readers preserve numeric and timestamp originals while refusing forgery/disclosure denial; exact types and original strings survive; no new schema/ref graph is introduced; complete selected payload sizes are measured; every successful original dispatch verifies custody. The deliberate CLI failure returned exit 1; a deliberately raised exception was not counted as a Refusal or acceptance. All-field predicate isolation and adopting-lane schema/key/partition/checkpoint/native custody work remain explicit sweep work. No current cap reaches valid history and no physical float is normalized.

IDs used on the branch: CV-1100, CV-1101, SP-1100, SP-1101; only CV-1101 is newly minted this round. No disputed finding, failed owner premise, question stopped for Jared, registry/admission/Decision Log edit, main push, landing, pm-mail or subagent.

### Round-1 retained evidence

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix1/`. Each named command also has its exact command/cwd/exit/memory record in `<name>.run.json`.

| Artifact | SHA-256 |
|---|---|
| `self-test.stdout` | `79f9c6b1f54a0810b4107cf74fed846d1c4abb8174a129aa626a2765350ac0d9` |
| `regressions.stdout` | `c053ab5db55f1232aab58566e5706b9fcf688f5bd64a8d6a71e29d967c148cb9` |
| `index-generate.stdout` | `2959b2d00d7f6170f68b9c1bc83f6345df63b711fc182b6315020bd9388f8206` |
| `index-validate.stdout` | `b9437982f60e90fb474885a7d946d102aaba4d455e6fc417ade18c711c39bfa3` |
| `shards-check.stdout` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `scope-audit.stdout` | `b3f1415a769b25a5f55ef61d6f51c9468c770407bc3840d10bbd69c65bf3bbce` |
| `failure-oracle.stdout` | `9d70f5643bfb64ae9dd697b0182d595d6bb125b4bd33539b1b7b510893c2cb83` |
| `id-scan.json` | `8e903f350c94c82148c4a7a4b40192d175ce2b60e78881095eecaaa448e22fc6` |
| `currentness-copy.json` | `88a696efe5d4ee07625c6c7b40febd3ebd3c37b0924bec714c4729ec3e9dd9d6` |

## Review round 2: findings and responses

Reviewed head: `883af36ba4a68230e14497df86a5e4edcd38f697`. Implementation commit: `088e8d63f7798c1efa7eaeb7c002f21f220fbb56` (this response/check/self-grade update follows separately). Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-cycle2.md`, including both cycle-2 probe bundles.

1. **R1 — fixed.** CV-1101 now binds CV-253 explicitly (`Plans/Contracts_V0.md:1155`). `scripts/pm_event_datetime.py:111` composes the original pinned envelope schema with field-specific constraints for only `observed_at_utc` and `persisted_at_utc`; the enforced RFC3339 format and absolute terminal-uppercase-Z pattern reject nonzero offsets, `+00:00`, `-00:00` and lowercase `z`. `scripts/pm_event_datetime.py:15` supplies the corresponding `storage_utc_z` field-boundary profile. Source `occurred_at_utc`, broad real-family `ts`, coordination and legacy-output profiles keep the behavior Sol confirmed. Positives include absent/nine/long fractions, lowercase `t` with uppercase `Z` and a real UTC leap second. One-field envelope negatives, authenticated-original Storage negatives and forged original-profile controls cover both Storage fields. Source/family positives include all refused Storage-zone forms. The adoption guide names CV-253, both fields, the enforced schema composition and authentic retained field-profile selection; a previously skipped format check never authorizes invalid Storage history.
2. **R2 — fixed.** `jcs-invalid-kind` (`Plans/event_number_recipe_corpus.json:3906`) now sets `typed: false`, so it violates only declared-kind eligibility. The separate `jcs-declared-decimal-kind-loss` case (`:4808`) uses allowed `kind: decimal`, positive exact `1.5` and `typed: true`, isolating output-kind preservation. Existing integral-float kind-loss and sign-only controls remain. Narrow eligibility removal admits only the unknown-kind case; narrow preservation removal admits its six kind-loss cases while unknown-kind eligibility still refuses. All 370 reviewed fixture inputs were independently replayed unchanged with their exact expected outcomes.
3. **R3 — fixed.** The corpus executor (`scripts/pm_event_numbers_corpus.py:231`) calls the unchanged current `full_value_commitment` adapter on the frozen original event. Separate wrong-version (`Plans/event_number_recipe_corpus.json:5787`), wrong-schema-ID (`:5802`) and five wrong-container cases (`:5817` onward) each name their own target. The unchanged frozen positive commitment is now also a labelled corpus case. Removing just the version clause admits only the wrong-version negative; removing just the schema-ID clause admits only the wrong-ID negative, retaining the peer clauses. Wrong containers refuse `full_value_edition` without exceptions. Intrinsic/container-boundary isolation remains assigned to the shared tool; no claim is made that deleting the type clause alone makes an unusable container a valid event. Historical dispatch remains unchanged and never falls back to this current adapter.

### Round-2 finite outcomes and bounded check-11 evidence

Self-test and standalone corpus: **451/451 PASS, 239 positives, 212 negatives, all 451 cases labelled with target predicates; 69 owner integration checks PASS**. The executor now requires a target label on positives as well as negatives. These are finite outcomes, not a general check-11 or native-authority PASS. The deliberate failure exits 1; an injected RuntimeError is an exception, neither acceptance nor refusal.

| Narrow predicate removed | Own negatives admitted | Other negatives retaining their exact refusal |
|---|---:|---:|
| JCS declared-kind domain | 1: `jcs-invalid-kind` | 211 |
| JCS output-kind preservation | 6 kind-loss cases, including the new declared-decimal case | 206 |
| Current commitment schema version only | 1: `full-value-wrong-version` | 211 |
| Current commitment schema ID only | 1: `full-value-wrong-schema-id` | 211 |
| Envelope observed-field terminal Z only | 5 observed-field zone cases | 207 |
| Envelope persisted-field terminal Z only | 5 persisted-field zone cases | 207 |
| Scalar `storage_utc_z` profile's terminal Z only | 15 direct/retained zone cases | 197 |

Every bounded cut retains unrelated predicates, and every unrelated negative keeps its exact baseline outcome. No unrelated predicates are called duplicates. The full flipping lists, still-rejected counts and narrow mutations are in `fix2/regressions.py` and `fix2/regressions.json`. Eight real coordination/compaction schema controls retain their stricter zone/fraction behavior. Broader assertion inventory, compound/intrinsic boundary adjudication and the five previously merged proof groups remain **SWEEP_PENDING** for `scripts/pm_guard_isolation.py`; no new general proof tool was built.

### Round-2 scope and grades

CV-1101 owner specification and finite owner-profile coverage: independent review **PARTIAL → PASS** within the shared reference boundary. Corpus finite oracles: **PASS → PASS**, with R2/R3 refusal coverage repaired; aggregate adapter/selector/isolation assessment stays **PARTIAL**, guard isolation **SWEEP_PENDING**, native authority and lane installation **NOT_RUN**. CV-1100, SP-1100 and SP-1101 retain their prior bounded grades. Event-family grades before/after: **N/A**, no family rows and membership **ABSENT**. Existing IDs used: CV-1100, CV-1101, SP-1100, SP-1101; **no ID minted in round 2**. No disputed finding or owner question remains.

Regenerated shards are confined to the edited Contracts document; regenerated PlanUnit rows belong only to Contracts. The index contains 7,426 PlanUnits and 29,961 acceptance units, with readiness still `blocked_runtime_certification_incomplete`. The ignored currentness edition was copied and all 15 files matched SHA-256 before index generation. Nas1 started with 464 GB free disk and 12 GB available memory; verification paused below 6 GB, rechecked every two minutes and resumed at 7 GB. Dependencies were installed into a disposable local directory only. Raw evidence stays outside the repository.

No registry, admission, Decision Log, Spec Lock, auto-decisions, governance evidence or frozen validator changed. No main push, landing, reseal, pm-mail or subagent. The only other edits are the adoption guide, stronger all-case labels, the corpus executor and this report/check/self-grade bundle. The original envelope schema stays byte-identical to the reviewed head. The first runtime/storage test attempt exposed complete-document hash pins into that schema; the final implementation preserves those bytes and composes the existing CV-253 rule in the shared validator, without registry edits or hash restamping. The initial failure is retained as `fix2/runtime-storage-tests-initial.*`; the final rerun passes all 16 runtime/storage tests, alongside all 14 binding tests.

### Round-2 final verification and retained evidence

Final self-test, standalone corpus, seven bounded predicate removals, all 30 existing unit tests, shard generation/check and index generation/validation exit 0. Index top-level status is pass; no native/readiness certification follows. The failure-oracle command exits 0 only after observing the deliberate child failure exit 1 and the separate exception outcome.

All artifacts below are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix2/`; exact commands, exits, memory samples and output hashes are in `NUMRULE.checks.json` and each named `.run.json`.

| Artifact | SHA-256 |
|---|---|
| `self-test.stdout` | `bd9eb05749b7d02f498399618e5a5125ba74eacf423b09b132af5ce17b1faffe` |
| `corpus.stdout` | `3e3efb8cda6c9cd0517e3c166108580d7f8463ef2a81f517343f4576ea215fe1` |
| `regressions.py` | `6f6b1cc8a8f9c45fa54cbfe4495b0356f886389cfec13bb1fc6c63840fb53a99` |
| `regressions.json` | `143430ccb571f21e03b389e18e5384a72bfe269505af001dfbc31ea0aa422965` |
| `failure-oracle.stdout` | `56833deb55f54792cada6a2c785acf22b2ff9c6485bede943d58524cbc0cc004` |
| `runtime-storage-tests-initial.stderr` | `9f7dbce6053f8d23f333028e5f21b5d1a4a40aaf43573df45f970a353b60ced0` |
| `runtime-storage-tests.stderr` | `6f82f728ba41c223c9b18aac7dd3b9342c1a6217628b43d46bd0d26ebd19ee9e` |
| `shards-check.stdout` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-generate.stdout` | `6e9fbffa92daf0fcbcbd7382f10a9afed67b55bd9a5547ee82a99efac84d142b` |
| `index-validate.stdout` | `3640fae688c5aac2964012af962eeafc23b2ac220543f691ada20f646df17b6a` |
| `scope-audit.stdout` | `6c8664351143af6d7f14605fe269e5349de0aa1af1e112ac0e0c67af435a0687` |
| `currentness-copy.json` | `9ca6056b8f1da7e37cf384d925016f938a162cdfb7944479070d47697101fc1d` |


## Review round 3 (Astra): findings and responses

Reviewed head: `3d1459f9e60abc8519a08bdfb1d4ca0919cd152b`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-astra.md`. Its eleven listed evidence hashes match; `fix3/review-evidence.json` records the comparison. No finding is disputed and no new owner decision is needed.

1. **B1 — fixed, `20d66f034a94c78f26d991fe1323e1f5c04ab6f3`.** Location: `scripts/pm_event_datetime.py:111` and `:132`; `scripts/pm_event_numbers_corpus.py:143` and `:171`; adoption guide `reports/event-authority-20261105/NUMRULE-ADOPTION.md:11`. Cause: the old constructor added CV-253 only to a root envelope copy, so referenced and nested envelopes used the broad timestamp schema. Fix: compose only each Storage field's terminal-uppercase-Z predicate during envelope property evaluation, retaining every original schema predicate. Keep that boundary installed across jsonschema's dialect-aware `evolve`, including resources with explicit `$schema`, without global validator registration or resource mutation. The frozen 1.0.0 compatibility envelope gets the same field ownership. Corpus routes are direct, root `$ref`, `allOf`, nested inline envelope, nested reference in an object/array, actual receipt `full_value_request`, nested receipt request, the actual coordinator event reference, compatibility reference and nested compatibility reference. Every route has valid UTC/lowercase-T/fraction/long-fraction/leap controls and separate nonzero-offset, signed-zero-offset and lowercase-zone negatives for both Storage fields. Every route also accepts broad source timestamp controls, including offset-adjusted leap seconds and year 0000. Authenticated-fixture original resources select the retained outer boundary and profile; wrong-profile selections refuse. Other CV-1101 scalar/local/output profiles remain unchanged. Separate scalar timestamp references still require their explicit owner profile, as the guide now states.
2. **B2 — fixed, `67d459eda1c7d9d71a6de098c37af0ca501a224f`.** Location: `scripts/pm_event_numbers_corpus.py:76`, `:117` and `:139`; corpus `history-string_record_bytes` and `history-foreign-scope_kind`. Cause: string bytes left the independent seal stale, while scope mutation also changed project-ID equality. Fix: make the sealed string carrier coherent and use a fixture-only UTF-8 content verifier, isolating the production exact-bytes gate from authenticity. For scope equality, construct a boundary-only expected binding with only `scope_kind` changed; do not pass it through `OriginalBinding.__post_init__`, which intrinsically couples project scope and project ID. This is explicitly **not** a valid project query or a constructor-domain proof. Both cases carry `fixture_boundary` explanations. Actual production constructor, byte-type, authentication and binding checks are unchanged. Separate forged bytes/results/receipts, foreign project-ID/context and disclosure negatives remain active. Narrow record-type and scope-only cuts each admit exactly their own negative; project-ID equality is independently checked as a peer control.
3. **B3 — fixed, `0eb68afab44bc6a5198d4b0909b76a0433beafda`.** Location: `scripts/pm_event_numbers_corpus.py:158`; corpus `history-verifier-result-*`. Cause: the old fixture verifier returned only real booleans, so truthiness could replace the production exact-True guard without a failing oracle. Fix: use an otherwise matching selected original, allowed disclosure and authentic fixture verifier with separate `"true"`, `1` and `{"verified": true}` results, each labelled `original.verifier.exact_true`. Retain a genuine True positive, a False authenticity refusal, original-forgery refusals and independent disclosure controls. Replacing only `is not True` with a truthiness check admits precisely those three negatives; False/authenticity/disclosure still refuse. The production exact-True guard is unchanged. Unexpected exceptions remain their own outcome.

### Round-3 finite outcomes and bounded check-11 evidence

Self-test and standalone corpus: **1,176/1,176 PASS: 760 positives, 416 negatives, all 1,176 labelled with target predicates; 69/69 owner integration checks PASS**. All 451 reviewed inputs remain, with their original expected outcomes; only the two B2 fixture-boundary annotations were added to existing case records. Original numeric-history byte strings are unchanged. The 725 additions exercise composition/history and verifier results. All 30 existing binding/runtime-storage unit tests pass with rfc8785 0.1.4, msgpack 1.1.2, jsonschema 4.19.2 and blake3 1.0.11. The deliberate bad expectation exits 1. The bounded regression script records 28 assertions and six narrow removals:

| Guard removed alone | Own negatives that flip to acceptance | Other negatives retaining their exact baseline refusal |
|---|---:|---:|
| Envelope observed-field terminal Z only | 100 across direct/composed and retained paths | 316 |
| Envelope persisted-field terminal Z only | 100 across direct/composed and retained paths | 316 |
| Original record-bytes exact type only; result/receipt types stay enabled | 1: `history-string_record_bytes` | 415 |
| Original binding scope-kind equality only | 1: `history-foreign-scope_kind` | 415 |
| Original binding project-ID equality only | 1: `history-foreign-project_id` | 415 |
| Frozen verifier exact-boolean result only; falsity still refuses | 3: `history-verifier-result-string`, `-integer`, `-object` | 413 |

Every positive retains its outcome and success postconditions under these cuts; no cut creates an exception. The exact flipping lists are in `fix3/regressions.json`. No unrelated predicates are merged or called duplicates. This is bounded evidence for B1–B3, **not** a complete lane assertion inventory. S1 remains **SWEEP_PENDING** for `scripts/pm_guard_isolation.py`, including intrinsic boundaries and genuine duplicate-site proof; no general lane proof machinery was rebuilt.

### Round-3 recurring-defect probes and scope

| Brief item | Evidence and limit |
|---|---|
| 1 / 7: forgery, contradictory custody and verification paths | Original recipe/resource/byte/result/receipt forgery controls replay; B2 keeps its observation/seal coherent; B3 tests verifier return types independently. Fixture custody remains synthetic, with native installation NOT_RUN. |
| 2: Storage metadata | Existing full-uint64 endpoints and producer-exclusion/full-value-inclusion checks pass. No caller metadata becomes Storage authority. |
| 3 / 10a: retained history in both directions | Original numeric-history fixtures and all new composition originals replay; valid broad source timestamps and retained compatibility/replay-only envelopes pass, invalid Storage zones and forged profiles refuse. No current-writer gate enters retained dispatch. |
| 4: one field read two ways | The ten current and ten retained composition routes agree on each Storage field's profile while preserving exact timestamp strings. Original typed/fraction/number controls replay. |
| 5: unresolved references | Actual envelope/receipt/coordinator references used here resolve. No schema graph was edited. Complete eager/native graph qualification remains S2, not certified by these finite routes. |
| 6: complete size accounting | Existing payload byte-size, digest and 16-KiB boundary controls and frozen full-value vectors pass. No size/codec rule changed. |
| 8: masked negatives | Six narrow cuts above preserve all peer refusals. B2's two specialized boundary adapters are documented explicitly. |
| 9: truthful grades | Finite case/mutation results PASS; aggregate adapter/selector PARTIAL, full inventory SWEEP_PENDING, native authority NOT_RUN. |
| 10 / 11: numbers and exact types | Original number spellings, ranges, kind/sign, wrong-type and physical-byte cases replay unchanged. New verifier truthy non-booleans refuse independently of authenticity and disclosure. |
| 12: enforced formats | Existing broad/coordination/legacy scalar controls replay, and composed envelopes enforce their Storage zones. A referenced-envelope invalid-calendar probe rejects for each of the three timestamp fields; unrelated UUID/required/closed-object checks stay active. Resource objects remain unchanged. |

CV-1101's bounded enforced-format/reference/retained-fixture cell: Astra **PARTIAL → PASS** within these finite routes. SP-1101's B2/B3 fixture/result oracles: **PARTIAL → PASS** within the targeted predicates; aggregate selector stays **PARTIAL** pending the shared inventory and native adoption. CV-1100/SP-1100 bounded grades are unchanged. Family grades before/after: **N/A**, membership **ABSENT**. Native authority and complete 19-lane installation stay **NOT_RUN**. Existing IDs used: CV-1100, CV-1101, SP-1100 and SP-1101; no IDs minted in round 3. S2 remains actual lane current/history/retry/receipt/checkpoint/reference integration with authentic native resources.

No owner prose changed, so shards and the plan index were not regenerated. The read-only shard check passes (99 sources, 3,293 shard files). Index validation exits **1**, top-level **fail**, with **22 unchanged integration findings**: 21 legacy ledger-shape errors (`record_id` / `superseded_by`) and main-added PLS-025 missing from this branch. Every named file, the index and its validator are byte-identical to the reviewed head; `fix3/index-baseline-proof.json` records path hashes and equality. The 21 ledger errors are additionally exposed in this sparse-tree run; Astra's extracted-input run reported only PLS-025. Neither result authorizes editing those ledgers or erasing PLS-025. Rebase/integration and regeneration belong to the lead. No index or governance PASS is claimed.

Initial VM preflight: 110 GB free disk and 19 GB available RAM; final recorded checker preflights have at least 12 GB available. An initial index-validation attempt accidentally overlapped the tail of the shard check and was terminated; its retained run record has exit -15. The final index run started after shards completed; every other recorded checker ran sequentially. The disposable msgpack environment changes no repository dependency. It and the literal-path sparse worktree are removed after push.

Other changes are limited to the shared corpus runner, corpus, datetime helper, adoption guide and this report/check/self-grade bundle. No owner document, pinned schema, registry, admission, Decision Log, governance lock/evidence, frozen validator or other lane changed. No main push, landing lock, reseal, pm-mail or subagent.

### Round-3 retained evidence

All artifacts below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix3/`. `NUMRULE.checks.json` gives exact commands, exit codes, UTC clocks, memory samples and output hashes. This report and self-grade are copied there; `pushed-head.json` records the final pushed head.

| Artifact | SHA-256 |
|---|---|
| `self-test.stdout` | `e5ffdba0080058a36a9535f50821b860b27dbeb1cd725d856f4f08ed5b3813e8` |
| `corpus.stdout` | `e5ffdba0080058a36a9535f50821b860b27dbeb1cd725d856f4f08ed5b3813e8` |
| `regressions.py` | `b3fb2bb9a213c994643218f60ecca750c6299e2f10f594fef3f248578b6f1444` |
| `regressions.json` | `5bdbd96d380865d893a8b521e36b6ec234676025e24b2109dda190bd3f350f90` |
| `failure-oracle.stdout` | `f6ee8ffa9322883a8370fd2ab4fbfc9ab06f4a1d81becb71a6a0b5743873ffaa` |
| `binding-tests.stderr` | `75312dbfcdc7087a0ad5a3a356fdb00cf72462a59e8b2f8416c01f22db1b6ff2` |
| `runtime-storage-tests.stderr` | `37ed5b927d5544ed63540f8c853b5b051629a696b1e715a3ebc30542d3aaf203` |
| `shards-check.stdout` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-validate.stdout` | `5262d72dfe55edba90c43c1cc0676e2599147d2f4c4c829a40a06d0da8492cd6` |
| `index-baseline-proof.json` | `f75aa1078ec85b81c9c0e2d97a98a55dccdc65ae6531aac97037c238831bf15b` |
| `review-evidence.json` | `645697aa697baf70052403eb6cf19dd670187b2db806545580928482c6e38bd5` |
| `currentness-copy.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `scope-audit.stdout` | `72997da97f40d322588542fe03d1097f90f646a7a75365fe8f09e2f0b29eacfe` |


## Review round 4: findings and responses

Reviewed head: `e85116fbe13600d3b90c6fe58118decb7c5cbe56`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-cycle4.md`, with `cycle4/probes.py`, `embedded-followup.py` and their JSON inventories. Implementation commit: `493e2974c885609d2b64e1ec8f863f234a6da38f`. No finding is disputed and no new owner decision is needed.

**B1 — fixed through the shared helper's field-path selection.** Where: `scripts/pm_event_datetime.py:111-128`. Why: envelope selection recognized the canonical v2 resource ID and the v1 compatibility discriminator, but omitted authentic embedded v2 definitions without that ID. How: accept the existing `schema_id.const = pm.event.v0` discriminator with either `schema_version.const = 1.0.0` or `2.0.0`, then apply the existing terminal-uppercase-Z predicate separately to `observed_at_utc` and `persisted_at_utc` during normal schema descent. The enforced broad format and all original schema predicates remain in force. `occurred_at_utc`, standalone owner/source/receipt timestamp boundaries and other CV-1101 profiles keep their existing behavior. No schema was edited or repinned. Authority: CV-1101 at `Plans/Contracts_V0.md:1155-1160` and CV-253 at `:16009-16025`.

**Regression coverage.** `scripts/pm_event_numbers_corpus.py:146-156,173-190,273-285` selects each real resource/pointer in the shared corpus and in the sealed fixture resource map for retained dispatch. The adoption guide at `reports/event-authority-20261105/NUMRULE-ADOPTION.md:11` now names the embedded-v2 discriminator. All thirteen listed paths have valid baselines and separate one-field negatives for each Storage field: positive/negative nonzero offsets, `+00:00`, `-00:00`, lowercase `z`, and lowercase `t` with lowercase `z`. Each is exercised through a root reference, object/array nesting, and both corresponding frozen-original fixture selections. Positives retain uppercase-Z UTC, lowercase `t`, arbitrary fractional precision, legitimate UTC leap seconds and year 0000; source-field offsets/lowercase zones remain accepted. Compaction-specific paths use the review's schema-valid compaction baseline, rather than counting an unusable generic baseline as a pass.

Added **1,612 cases: 988 positives and 624 labelled negatives**. Before the production fix, the full corpus reproduced exactly those **624 invalid acceptances** (exit 1); every other case and all 69 integration checks passed. After the fix, self-test and standalone corpus both exit 0 with **2,788/2,788 PASS: 1,748 positives, 1,040 negatives, all cases labelled**, plus **69/69 integration checks**. All **1,176** prior case records, **400** prior original byte strings and **370** prior frozen resource selections are unchanged. Admission exceptions still have their own outcome; a deliberate bad expectation returns CLI exit 1.

### Round-4 bounded check-11 and review probes

The review's probe was adapted to the isolated worktree and expanded corpus; it is retained externally, not installed as new lane proof machinery. It passes **3,845 assertions**, including the original **29** reference/composition routes, all **76** unchanged scalar-profile comparisons and the complete existing inventory of **69 schema files / 186 timestamp-bearing nodes / 55 complete envelopes**. Every complete envelope has a schema-valid baseline; none accepts an invalid Storage zone. All resource objects stay unchanged.

| Predicate removed alone | Own negatives admitted | Other negatives keeping their exact refusal |
|---|---:|---:|
| Observed Storage terminal Z | 412 (100 prior + 312 new) | 628 |
| Persisted Storage terminal Z | 412 (100 prior + 312 new) | 628 |
| Original record-bytes exact type | 1 | 1,039 |
| Original scope-kind equality | 1 | 1,039 |
| Original project-ID equality | 1 | 1,039 |
| Frozen verifier exact True, with falsity still enforced | 3 | 1,037 |

Every positive retains its outcome and return postconditions under every cut. No cut introduces exceptions or changes a peer refusal. New retained negatives have a coherent seal/source commitment/resource selection and exactly one changed Storage field. These six bounded cuts preserve B2/B3 closure and qualify B1's new paths; the complete lane predicate inventory and duplicate-site proof remain **S1 / SWEEP_PENDING** for `scripts/pm_guard_isolation.py`.

### Schemas listed for the cross-lane sweep

These are **13 envelope paths in 10 unchanged files**, including frozen input/predecessor copies. B1 is fixed at the helper boundary for all of them. The native adoption sweep must install that boundary with each owner's authenticated current/original resource map; a stock JSON Schema validator alone still has the owner's broad timestamp schema. **No owner-schema edit or hash restamp is requested.** The exact file SHA-256 values are in `fix4/scope-audit.json`.

| Corpus alias | Unchanged schema path | Envelope pointer |
|---|---|---|
| `embedded-01` | `Plans/executor_cancellation_contracts/schemas/workflow-start-custody.v2.schema.json` | `/$defs/EventRecord` |
| `embedded-02` | `Plans/storage_compaction_native_contracts.schema.json` | `/$defs/existing_event` |
| `embedded-03` | `Plans/storage_compaction_native_contracts.schema.json` | `/$defs/compaction_event` |
| `embedded-04` | `Plans/workflow_standard_source_contracts/inputs/Plans/executor_cancellation_contracts/schemas/workflow-start-custody.v2.schema.json` | `/$defs/EventRecord` |
| `embedded-05` | `Plans/workflow_standard_source_contracts/inputs/Plans/storage_compaction_native_contracts.schema.json` | `/$defs/existing_event` |
| `embedded-06` | `Plans/workflow_standard_source_contracts/inputs/Plans/storage_compaction_native_contracts.schema.json` | `/$defs/compaction_event` |
| `embedded-07` | `Plans/workflow_standard_source_contracts/native-v7/schemas/workflow-start-custody.v6.schema.json` | `/$defs/EventRecord` |
| `embedded-08` | `Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/inputs/Plans/executor_cancellation_contracts/schemas/workflow-start-custody.v2.schema.json` | `/$defs/EventRecord` |
| `embedded-09` | `Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/inputs/Plans/storage_compaction_native_contracts.schema.json` | `/$defs/existing_event` |
| `embedded-10` | `Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/inputs/Plans/storage_compaction_native_contracts.schema.json` | `/$defs/compaction_event` |
| `embedded-11` | `Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/schemas/workflow-start-custody.v3.schema.json` | `/$defs/EventRecord` |
| `embedded-12` | `Plans/workflow_standard_source_contracts/predecessor/v2/schemas/workflow-start-custody.v4.schema.json` | `/$defs/EventRecord` |
| `embedded-13` | `Plans/workflow_standard_source_contracts/schemas/workflow-start-custody.v5.schema.json` | `/$defs/EventRecord` |

### Round-4 scope, grades and verification

CV-1101 embedded-v2 schema-boundary coverage: **cycle-4 B1 BLOCKED → finite cases/probes PASS**. CV-1100/SP-1100/SP-1101 bounded grades are unchanged; aggregate adapter/selector/profile installation stays **PARTIAL**, complete guard isolation **SWEEP_PENDING**, native authority **NOT_RUN**. Family grades before/after: **N/A**, membership **ABSENT**. Existing IDs used: CV-1100, CV-1101, SP-1100 and SP-1101; no new ID.

The recurring defect checks replay existing forgery/custody/disclosure/replay, exact-number/type/physical-byte, size/digest and enforced-format controls. The new negatives mutate only Storage-owned timestamps, which remain outside the producer semantic projection; they trust no caller metadata as native Storage authority. Frozen fixture originals preserve broad source timestamps and exact bytes, while invalid Storage zones refuse. Both current and frozen selections use actual unchanged schemas and resolving references. Finite schema-boundary evidence does not certify native original authentication, identity/custody joins, every unvisited reference branch, or complete nineteen-lane installation; those remain S2. No current-writer gate enters retained dispatch.

All **30 existing binding/runtime-storage unit tests** pass. Read-only shard verification passes. No owner prose changed, so shards and the plan index were not regenerated. Index validation exits **1**, top-level **fail**, with the **same 22 failure records as round 3**: 21 legacy ledger-shape errors and main-added PLS-025 missing from this branch. The named paths and index/validator are unchanged; `fix4/index-baseline-proof.json` records equality and hashes. These remain integration items and no index/governance PASS is claimed. All **8,966 other Plans paths**, including **3,774 Markdown paths** and **517 schema paths**, are unchanged from the reviewed head. `scripts/pm_event_numbers.py` is unchanged.

Initial VM preflight: **128 GB available disk / 13 GB available RAM**. Every checker ran one at a time with an available-memory preflight of at least 6 GiB. The first adapted regression completed its product predicates but its final scope audit used the source clone instead of this worktree; that run's exit 1 is retained as `regressions-initial.*`. The corrected worktree run passes. The disposable environment pins msgpack 1.1.2; environment and literal-path worktree are removed after push. No registry, admission, Decision Log, owner schema, governance artifact or other lane changed. No main push, landing lock, pm-mail or subagent.

### Round-4 retained evidence

All artifacts below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix4/`. The report, self-grade and `NUMRULE.checks.json` are copied there; per-command `.run.json` files contain exact commands, clocks, exit codes, memory and output hashes. `pushed-head.json` records the final pushed head.

| Artifact | SHA-256 |
|---|---|
| `self-test.stdout` | `d0a754a1a360550949dec9191ae0b9ea50035bd360efce14e3a2a4f9c382b622` |
| `corpus.stdout` | `6885ac7e1621a2a2702d9dc458a1ea533346d64a1bbddbb214b89cef2adc7b3d` |
| `pre-fix-corpus.stdout` | `72ffc91eed5ea14ef4942f75ee385f4b331b1f7f0b78865833a608123e037368` |
| `regressions.py` | `b7cf08f11d79ae8a64c4597cf04af2e1cf081985413afce1c1689cdb05ebb77c` |
| `regressions.json` | `fcd22a2166235674249df490ecea574395af0d3a007879e8981ebad5c1d69f43` |
| `scope-audit.json` | `9af913dab6fc177129eb045e169a6d3872fb0106636e71fb4bc8bab63ad7be2a` |
| `case-additions.json` | `14d48eca1b3d664fe5d9beb97b1b4e1186650377ab60855ae3d556ea80a31274` |
| `failure-oracle.stdout` | `720ce07d4f7e1b345a1f4fbaeb328a1761b756ab4f25759f6ee4eb7850cd7bee` |
| `shards-check.stdout` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `index-validate.stdout` | `552741a89f54734a525e17e7208585aa51081190a72d53e08d2259289cf87a53` |
| `index-baseline-proof.json` | `61388540cfda783d720d652f8c80f6006fe89b0807d5d5a030fd0462e0a9b76f` |


## Review round 5: findings and responses

Reviewed head: `bb74b97e6be675d786537daa143b997deefb8cb8`. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-cycle5.md`. **B1 fixed in `a06d87b6b616605c6e67ca01af40d6047e9fadd5`.** Scanner decoding/fence hardening is in `c4e2beaeb3419a9339f5f28043a7c22f6fce37f5`. No finding is disputed and no owner decision is required.

**Where:** `scripts/pm_event_datetime.py:111`, `scripts/pm_event_datetime_inventory.py:75`, `:131`, `:182`, `:195`; inventory `Plans/event_datetime_inventory.json:1`; current/frozen corpus routes `scripts/pm_event_numbers_corpus.py:154`, `:184`, `:342`; self-test registration `:423`.

**Why:** envelope discriminators omitted Storage metadata in string-only EventRecord/frozen-input declarations, index rows and issued originals. Path-by-path envelope additions did not establish completeness.

**Fix:** commit every UTC-field schema node with its path, origin, JSON pointer, fields, profile, resource/node fingerprints and exact owner-schema/prose citation. Install CV-253/CV-1101 using the reviewed resource fingerprint and field path, including nested/ref/frozen resources. The selector retains actual schema objects through dialect changes; it never assigns ownership from an instance field name or an envelope discriminator. Fingerprints are checker-only sorted compact ASCII-JSON hashes, separate from existing raw-byte pins and every product hash recipe. Native authenticated installation remains SP-1101's responsibility. No schema object, raw schema byte, original pin, owner prose or product recipe changes.

### Complete inventory

The working-tree scan reproduces the review's **212 nodes exactly**, with **0 parse failures**. It decodes literal/escaped JSON keys and scans Plans JSON/JSONL and backtick/tilde Markdown schema fences (including indented and unclosed final fences), including source-lineage/predecessor/frozen copies and registry-embedded schemas. The independent Git-object inventory at the implementation head also scans all **517 named schema resources**. The UTC nodes comprise **186 named-schema nodes, 25 registry-embedded nodes and 1 source-lineage patch node**. No Markdown fence declares another UTC-field node at this head.

| Classification | Nodes |
|---|---:|
| Storage EventRecord / frozen append input | 98 |
| Storage event_record_index | 27 |
| Explicit original_storage_fields | 6 |
| Storage issued original fields | 2 |
| **Storage total** | **133** |
| Other-owner runtime observations, retaining their exact local schema profile | 78 |
| Source-lineage schema patch, with no runtime installation | 1 |
| **Other-owner / lineage total** | **79** |
| **Unclassified** | **0** |

The Storage nodes declare **106 observed and 106 persisted field paths**. Other-owner entries cite their existing local field schema and owner/resource description where present; frozen copies cite their own edition. The lineage patch cites its source schema assignment. These classifications introduce no new owner profile. **702 other-owner scalar controls** across all 78 runtime nodes and **36 before/after scalar-profile comparisons** match the reviewed behavior. Broad source/family timestamps retain offsets/case/precision/leap behavior; coordination and legacy normalization retain their existing local restrictions. A separate unrelated source schema with both UTC field names remains broad.

### Corpus and predicate isolation

Final self-test and standalone corpus pass **13,372/13,372: 6,836 positives, 6,536 labelled negatives, all 13,372 cases labelled; 70/70 integration checks**. The original **2,788 case records, 1,206 original byte strings and 1,176 frozen resource selections** are unchanged. Additions: **10,584 cases**, including **5,496 one-defect negatives**.

All **133** Storage-classified nodes receive current and sealed-frozen controls through root `$ref` and object/array nesting. Each field has separate positive/negative nonzero offsets, `+00:00`, `-00:00`, lowercase `z` and lowercase `t`/`z` negatives. Valid controls include UTC uppercase `Z`, lowercase `t` with uppercase `Z`, short and 300-digit fractions, a legitimate UTC leap second and year 0000. Each retained original equals its single-field mutation and selects the matching sealed resource/route. Repairing only that field admits the case.

Inspection additionally found **34 Storage field paths declared only as strings**. The installed profile composes enforced date-time as well as type/terminal-Z checks there. **408 added syntax, calendar-day and leap-second negatives** keep terminal uppercase `Z`, isolating their format defect. Existing schemas with their own format/pattern still retain those predicates.

The bounded replay passes **21,616 assertions**. Each table row evaluates the entire corpus; all **6,836 positives**, return postconditions and every non-flipping negative preserve their expected outcomes. Six `original_storage_fields` nodes duplicate the same field's terminal-Z invariant in their original `Z$` schema pattern. Per field, removing that schema site alone flips 0; removing the shared site alone flips 2,812 and leaves the 144 duplicate-protected negatives refused; removing both named sites flips precisely all 2,956 of that field's negatives. Peer-field predicates remain enabled throughout.

| Predicate/site removed | Negatives admitted | Other negatives retaining exact refusal |
|---|---:|---:|
| observed_at_utc.schema_duplicate_only | 0 | 6536 |
| observed_at_utc.overlay_only | 2812 | 3724 |
| observed_at_utc.terminal_Z_both_named_sites | 2956 | 3580 |
| persisted_at_utc.schema_duplicate_only | 0 | 6536 |
| persisted_at_utc.overlay_only | 2812 | 3724 |
| persisted_at_utc.terminal_Z_both_named_sites | 2956 | 3580 |
| observed_at_utc.broad_format | 144 | 6392 |
| persisted_at_utc.broad_format | 264 | 6272 |
| record_bytes.exact_type | 1 | 6535 |
| binding.scope_kind | 1 | 6535 |
| binding.project_id | 1 | 6535 |
| verifier.exact_true | 3 | 6533 |

The two broad-format rows are field-specific enforcement-site diagnostics; they do not claim isolation of every grammar clause. The six existing bounded predicates and their named duplicate sites retain B2/B3 closure. Complete lane predicate inventory and grammar-clause/duplicate proof remain **S1 / SWEEP_PENDING** for `scripts/pm_guard_isolation.py`; no new general lane proof tool was committed.

### Completeness gate demonstration

`python3 scripts/pm_event_datetime_inventory.py` rescans the working tree, including untracked additions. Missing classifications, stale/removed nodes, changed resource/node/field records, duplicate entries, contradictory resource-field profiles, missing other-owner declarations and changed citations fail. `pm_event_numbers.py --self-test` registers the same gate as `datetime_inventory_complete_and_classified` and fails its CLI when it fails.

A disposable hardlinked copy, with independently replaced inventory files before mutation, passes **13/13 gate checks**. An injected untracked `Plans/round5-unclassified.schema.json` declares `observed_at_utc`: the gate reports **213 nodes / 1 unclassified** and exits **1**. The full shared self-test over that scratch copy also exits **1**, with exactly the inventory integration check failing. New registry-embedded JSON, JSONL-lineage and Markdown-fence nodes also fail until classified. Removed/duplicate/unclassified entries, resource drift, contradictory assignments and a false owner citation fail; restoring the copy passes. A further **7/7 decoding/fence probes** fail on escaped schema/JSONL keys, embedded JSON, tilde/indented/unclosed Markdown fences and duplicate JSON keys; their restored full-tree baseline still reports 212 classified nodes. The scratch trees are removed. See `gate-probes.json`, `gate-injected.stdout` and `gate-injected-self-test.stdout`.

### Independent coverage reruns and compatibility

The reviewer's `inventory.py`, `coverage_probes.py` and `full_boundary_probes.py` ran from scratch copies against the implementation head, using unchanged schema/fixture bytes. Path/head/output substitutions are recorded in the retained scripts. The outer-boundary script keeps its original three paths/four fields and reverses only the old escape assertion to require refusal; it no longer skips a repaired path.

- **Coverage:** all **133** Storage nodes have valid baselines; **0 escaping nodes, 0 escaped fields, 0 unexpected refusals**. Its 6,656 boundary controls, including 1,568 broad source controls, complete.
- **Full outer boundary:** the two real positive fixtures remain valid; all **8/8 forbidden mutations refuse**, **4/4 uppercase-Z controls pass**, both canonical-envelope negative controls refuse; **0 invalid acceptances**, no unavailable selected node. All **29** earlier composition/reference/dialect routes also pass **958** checks with unchanged resource objects.
- **Existing tests:** all **30** binding/runtime-storage unit tests pass. The deliberate bad expectation exits **1**; an unexpected exception remains a distinct outcome.
- **Shards:** read-only verification passes. No owner Markdown changed, so no shard/index regeneration is required or performed.
- **Index:** top-level **fail**, exit **1**, with the **original 22 failure records preserved exactly**: 21 legacy ledger-shape errors and PLS-025 integration. With the unchanged validator and a private scratch Git ref at the round-4 comparison main `071a7e21a9243ea1a011b024b85c2c9f30bf5b5e`, the complete output failure array equals round 4. The real `origin/main` advanced during this task: live validation reports **28 failures**, adding only DL-330/331/332, DP-064/066 and PWIZ-038 retention comparisons against newer main units. None of their owner docs or index inputs changed on this branch. Both live and pinned runs remain failing; no real ref, validator or baseline artifact was changed. Full failure-array SHA-256 is `f3b79719ab932bdbd1eea5ded1a4e9858a22f8ade8caf0dc599a9dbfbe0dad7e`. All named inputs and the index/checker remain unchanged. No index/governance PASS is claimed.
- **Scope:** all **8,966 other existing Plans paths**, including **3,774 Markdown paths** and all **517 schema files**, remain byte-identical to the reviewed head. Only the corpus and new classified inventory change Plans. The production number helper is unchanged.

How to verify: check out the pushed branch; run `python3 scripts/pm_event_datetime_inventory.py`, `python scripts/pm_event_numbers.py --self-test` with the recorded dependencies, the standalone `pm_event_numbers_corpus.run_corpus`, and the retained scratch-copy review probes. Use `gate_probes.py` for the disposable injection demonstration and `regressions.py` for the bounded field/site cuts. Check commands, exits, clocks, memory and output hashes in `NUMRULE.checks.json` and the external run records.

CV-1101's complete classified static boundary is **cycle-5 BLOCKED -> finite inventory/path/gate PASS**. CV-1100/SP-1100/SP-1101 aggregate grades retain their earlier limits. Native original authority and complete 19-lane installation stay **NOT_RUN**; aggregate integration stays **PARTIAL**, guard isolation **SWEEP_PENDING**. Family grades are **N/A**, membership **ABSENT**. Existing IDs used: CV-1100, CV-1101, SP-1100, SP-1101; no new ID, owner decision, registry/admission/Decision Log edit, governance reseal or main push.

Initial VM preflight: 103 GB disk free / 13 GB RAM available. All checker processes ran one at a time and every preflight met 6 GiB available memory. The disposable msgpack 1.1.2 environment is removed after push. Initial external proof setup runs caught incomplete expected-ID/duplicate handling and an over-broad field cut; final clause-specific reruns pass. One initial corpus run used wrong expected names for the new syntax/day refusal codes; the added oracle labels were corrected to the existing codes, with no predicate weakened. Those initial outputs remain retained; final results above supersede them. Initial index validation also lacked the ignored currentness edition and reported one readiness mismatch plus the six newer-main comparisons. Copying the exact 15-file round-4 edition removed only that input-induced mismatch; its file hashes match. Live validation retains all 28 actual failures. The separate pinned comparison reproduces the original 22 without changing any shared ref or relaxing a check. No pm-mail or subagent was used.

### Round-5 retained evidence

Artifacts below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix5/`. The final report, self-grade, check ledger and adapted scripts are copied there. `pushed-head.json` records the final pushed report head; its code/Plans tree is the tested implementation tree.

| Artifact | SHA-256 |
|---|---|
| `inventory.json` | `378776cd509e75bd73ad69c31b52359ee7bec466aaa6e84df67dcfa4311ddb04` |
| `coverage-probes.json` | `fb3df8bdb8db2fab356c346b887b67f694788e43a615ed5da8c6a2e5ae959b42` |
| `full-boundary-probes.json` | `096c744f36409a7bc1de0021426a9a3e593bbed3af76fb5cc20bfd40b6206945` |
| `regressions.json` | `ead045d33e65b306b728811d08eae9e22ceb15d6bf064b685ef0a83a84157be8` |
| `gate-probes.json` | `6dd09263563b1d931baf6c58ce7b8eb728b1cb44b84e71be67e1a4c325bb4b7a` |
| `gate-injected.stdout` | `1937e0dbd3ba05fff0c30c4392d18dbc6b8aa0c455e3cae89ee4fb568de32087` |
| `gate-injected-self-test.stdout` | `9281d9c7133b7fd79fa2ec91cba2ad19245dfcc3d76531ff87830fd5ed37ece6` |
| `profile-probes.json` | `38ede68f36df496afcf68e81562c6fc41f07a5c3137c8470fc00aa6c2cb1d966` |
| `corpus.stdout` | `580ceb83caccbcba12dd9e17bffadb5bfe2b29c1b2322dbe7e0e8f474315850c` |
| `self-test.stdout` | `580ceb83caccbcba12dd9e17bffadb5bfe2b29c1b2322dbe7e0e8f474315850c` |
| `scope-audit.json` | `be42b91092b577ddf8038a9b95f9ec44721598a7d4af6cbb1a3d8cb740ed64a9` |
| `scan-encoding-probes.json` | `80fcb47fbbb275647d1005807747bf4788526d0b53492e70643be350aea382b2` |
| `route-probes.json` | `395d0c20579bc781deec38a5178dc9f3ffa7f36f1c33544517916ee31c1dc764` |
| `index-validate.stdout` | `3e5a8bb5f68acf97dd3737ec956518de0f8d051bfacfe3b3188112cc30722e79` |
| `shards-check.stdout` | `d697ac77c260ee1fbe5007467d179c832c4c197ffc685d08b78f338e04ff7fdc` |
| `failure-oracle.stdout` | `5aeae12dd50cfdfa668e6ded6e4eb2e134f01de651ab8c3143e0a5b5127406df` |
| `index-pinned.stdout` | `bf6c2198b6ec6c7c74308a786e73d023c0cd6b5efb2e214bbe554629890f164d` |
| `currentness-copy.json` | `fae54dc550049395c0fd345173357ee0ba22eea51ea761130f11485e7f42c930` |
| `dependencies.json` | `6c1a0a100cd72b69c2554e8bc82e667ddb1a1e3266ea7a56c0635c86463d170c` |

## Review round 6: findings and responses (lead fix, 2026-11-05)

**C6-B1 (cycle 6, `reviews/NUMRULE-sol/REVIEW-cycle6.md`): container-nested Markdown schema fences bypassed the completeness gate.** Fixed by the stream E lead as a small review fix.

- `scripts/pm_event_datetime_inventory.py` `_markdown_fences()` now finds backtick and tilde fences at any container depth. It strips every leading blockquote marker (including nested `> >`) from each line, skips list markers on the opening line, and accepts any indentation. It is deliberately over-inclusive, so the gate fails closed: a body that then fails to parse but names a property map and a Storage field remains a scan error, never a silent skip.
- `scripts/pm_event_numbers_corpus.py` registers the integration check `datetime_inventory_fence_containers`. It covers seven forms (top level, blockquote, nested blockquote, nested-list indented, list marker on the fence line, blockquote containing a list, tilde in a blockquote), each of which must yield exactly the injected schema, plus a no-fence prose control. The previous scanner fails the blockquote and nested-list forms of this check.
- **Verification on this head:**
  - Real tree: `python3 scripts/pm_event_datetime_inventory.py` exits 0, with 212 nodes, 133 Storage, 79 other-owner and 0 unclassified (unchanged).
  - Injecting the reviewer's node at `Plans/review-container-schema.md` in each of the seven forms makes the CLI exit 1, with 213 nodes and 1 unclassified (`unclassified_schema_node`).
  - The blockquote injection also makes `python3 scripts/pm_event_numbers.py --self-test` exit 1, with `datetime_inventory_complete_and_classified: false`.
  - Without injection, the self-test passes: 13,372/13,372 cases (6,836 positives, 6,536 labelled negatives) and 71/71 integration checks.
- No owner prose, pinned schema, corpus case or inventory entry changed.

## Review round 7: findings and responses (lead fix, 2026-11-05)

**C7-B1 (list-before-blockquote nesting) and C7-B2 (supplementary fence boundaries that consumed real fences), `reviews/NUMRULE-sol/REVIEW-cycle7.md`.** Fixed by the stream E lead.

- **Authoritative discovery:** `scripts/pm_event_datetime_inventory.py` now finds fences with a real CommonMark parser, `_commonmark_fences()`, which uses markdown-it-py's `MarkdownIt("commonmark")` with the system package `python3-markdown-it` 3.0.0, present on the VM and on Nas1. The parser handles container nesting, fence and container lifetimes and relative indentation, and returns decoded bodies with their opening lines. It is a hard dependency: without it, the scan records an error and the gate fails closed.
- **Supplementary scan:** the over-inclusive scanner from round 6, now `_supplementary_fences()` and also stripping blockquotes after each list marker, only adds spans that CommonMark does not treat as fences, such as fences inside HTML blocks or details elements. It runs independently, so it can never close or consume a CommonMark span. A supplementary span that opens on a CommonMark fence line is dropped, so the authoritative body always wins.
- **Parse failures:** a fence body that fails to parse is now an error whenever it names a property map and a Storage field, either literally or through JSON `\uXXXX` escapes (`_looks_like_utc_schema()`). Escaped keys can no longer slip past the error check.
- **Registered check `datetime_inventory_fence_containers`:** it now covers 14 forms, each of which must yield the schema among its parsed bodies, plus a no-fence control:
  - the 7 round-6 forms;
  - list containing a quote, and quote, list, quote;
  - an HTML details block;
  - a fence after an indented literal closing fence inside a Rust example, with literal and escaped keys;
  - a fence after an unclosed blockquote fence, with literal and escaped keys.
- **Regression sensitivity:** the round-6 scanner fails six of these forms (both mixed-container forms and all four boundary forms).
- **Verification on this head:**
  - Real tree: `python3 scripts/pm_event_datetime_inventory.py` exits 0, with 212 nodes, 133 Storage, 79 other-owner, 0 unclassified and 0 failures.
  - Reviewer injections: list-then-blockquote, blockquote-list-blockquote, the indented literal close (escaped and literal keys), the unclosed blockquote fence (escaped and literal keys), details without a blank line, and a simple blockquote each make the CLI exit 1, with 213 nodes and 1 `unclassified_schema_node`. The indented-close cases also record a parse error from the supplementary span, which fails closed.
  - Self-test: clean, it passes 13,372/13,372 cases and 71/71 integration checks. With the list-then-blockquote node injected, it exits 1, failing only `datetime_inventory_complete_and_classified`, with 213 nodes and 1 unclassified.
- No owner prose, pinned schema, corpus case or inventory entry changed.


## Review round 8: findings and responses

**Implementation:** `31716092a3d7ea54f90ee984fcbcc29b8a9bc0a2`, based on Astra's reviewed `b1e66f69d0a0049d773f4535efbec8457fe46493`. B1, B2, B3 and the dependency should-fix are fixed in this commit. The finite shared-boundary checks pass; complete lane installation, native custody and the shared guard-isolation sweep retain their existing limits. No Jared decision, family admission or new PlanUnit ID is involved.

| Finding | Where / cause / fix | Verification |
|---|---|---|
| **B1: lazy retrieval and unclassified declarations** | `scripts/pm_event_datetime.py:148` and `:167`: preloaded-only binding missed later resource retrieval. Both root iteration and fragment descent now admit the evaluated schema object; the retrieval wrapper installs its complete resource before returning it to referencing. `scripts/pm_event_datetime_inventory.py:577` raises typed `DatetimeAdmissionError` for an unclassified declaration instead of selecting the broad profile. Explicit custom resolver configurations refuse. | Adapted Astra `runtime_probes.py`: 266 valid baselines; **0/133 escaping eager nodes, 0/133 escaping lazy nodes**, including current and frozen objects. |
| **B2: incomplete static universe** | `scripts/pm_event_datetime_inventory.py:141`, `:151`, `:256`: suffix/property-only discovery missed valid declarations and unsupported containers. The gate now reads every regular Plans file, follows symlinks, decodes UTF JSON/JSONL, Markdown/MDX code and HTML blocks, and recursively serialized JSON. It recognizes all requested declaration forms and wildcard patterns even without literal field names. Mentioning containers it cannot read/classify require a committed reason/citation exclusion. | Astra's **20/20 injections exit 1**; all five positive detection controls still detect additions. The full-tree census and final self-test both pass at 233 classified nodes. |
| **B3: unchecked inventory assertions** | `scripts/pm_event_datetime_inventory.py:395`, `:532` and `scripts/pm_event_datetime_inventory.schema.json`: schema validation now precedes installation. Citations are typed, nonempty and phrase-sized; an authority quote must name the selected profile. Source fingerprints, field sets and `role_evidence` are recomputed. Storage classification/CV-253 cannot select `owner_schema`; other-owner identity/profile/evidence must agree. | All three exact data-only mutations fail the gate and actual self-test CLI: current-envelope profile flip, empty citations, and false role/invented profile. Admission stops before corpus execution. |
| **Should-fix: dependency** | `reports/event-authority-20261105/NUMRULE-ADOPTION.md:271` now lists **markdown-it-py 3.0.0 / python3-markdown-it**. | The final run used 3.0.0; the dependency remains mandatory for CommonMark discovery. |

### Stated static universe and exclusions

The scanner covers all regular files under `Plans/`, irrespective of suffix/case, and follows file/directory symlinks to their targets. JSON/JSONL supports UTF-8/16/32 with or without BOM. Markdown/MDX covers every CommonMark fence, indented code block and HTML block, independently retaining the previous supplementary fence scan. JSON-shaped inline code is also checked; ordinary prose and inline field-name references outside code blocks are outside this container universe. JSON strings recursively decoding to objects/arrays, including multiple serialization layers, are inspected.

Declarations include `properties`, matching `patternProperties`, `required`, both sides of `dependentRequired`, `dependentSchemas`, `propertyNames` (including boolean and conservatively classified reference forms), and field-naming string/object `const`/`enum` values. Unsupported mentioning text such as YAML and HTML script blocks refuses. Unreadable files, broken symlinks, cycles, duplicate keys and stale exclusions fail closed. Runtime admission is independent of this static discovery boundary.

`scripts/pm_event_datetime_exclusions.json` has **162 exact container exclusions across 158 existing paths**, each with a reason and source citation. They cover existing instance/report/governance/lineage data, non-JSON code examples, and the inventory's own quoted `required` evidence arrays. Container fingerprints bind decoded text or parsed JSON content; there are no directory globs or suffix exemptions. Changed/unlisted content fails until reviewed. The inventory itself is separately checked against its schema and source assertions before runtime use.

### Inventory and preservation

**233 nodes = 133 Storage + 100 other-owner; zero unclassified.** All original **212** nodes preserve their path, structural fingerprints, field sets, classification, effective profile, owner and role evidence. The other-owner profile labels now name profiles in exact phrase citations; their original schema constraints remain unchanged. One other-owner row is source-lineage only and is never installed at runtime.

The widened scanner adds **21 generic name-map nodes**. Wildcard key/property-name rules can admit these spellings, but the values remain their original permission, tab, schema-resource, settings or other local data types. They receive no Storage assignment. Each new row cites its exact schema node and the existing CV-1101 format binding. The full path/pointer list and source hashes are in `scope-audit.json` and the committed inventory. Source-owner text already decides these constraints; no owner prose change or question is needed.

| Existing/new other-owner oracle | Result |
|---|---|
| Original 78 runtime nodes | **1,092/1,092 controls** preserve the original schema plus broad enforced format checker. |
| New 21 name maps, eager and lazy registries | **1,008/1,008 controls** match their original schema constraints; zero unresolved source outcomes after supplying the complete offline resource bank. |
| Production number recipes | **2,041/2,041 independent probes**, including physical floats/signed zero and four focused cuts across 37 non-date-time history fixtures. |
| Existing corpus | **13,372/13,372**, unchanged bytes: 6,836 positives and 6,536 labelled negatives. |
| Integration checks | **138/138**, including 67 new discovery/admission/inventory controls. |

Both owner documents, all existing pinned schema files, the production number helper, all 13,372 case records and shard/index artifacts remain byte-identical to the reviewed base. Only the inventory changes under Plans. No shard/index regeneration is required or performed. Shard body/path verification passes read-only.

### Actual CLI failures and check scope

The actual `pm_event_numbers.py --self-test` now performs the inventory gate before evaluating cases. With an unclassified pattern schema, profile flip, empty citations or false role injected, it exits **1**, reports `NOT_RUN_ADMISSION_REFUSED`, and does not claim any case execution. Restored, the complete real-worktree run exits **0** with the counts above.

Astra's scripts were copied before editing/running. Runtime, source-field, number and injection replays use a **97-input-file, approximately 38 MB scratch extraction** with the authentic inventory/source resources and the applicable six exclusions. The real whole-Plans census is run independently, including the final self-test. Scratch probe adaptations only supply the new root/output paths, catch the new typed refusal in the old mutation probe, record progress, preserve the original 78-node source control set, and load the full offline resource bank for the new map controls. `replay-inputs.json`, `replay_setup.py` and the retained scripts document reconstruction.

| Check | Exit / result |
|---|---|
| Final real-worktree self-test | **0**, 13,372 cases, 138 checks, 233 classified nodes. |
| Runtime probe, eager / on-demand | **0**, zero invalid baselines and zero escapes in either registry mode. |
| Gate injection replay | **0** for the probe driver; **20/20 product gate invocations exit 1**. |
| Three inventory-only mutations | Each gate and each actual self-test invocation exits **1**. |
| New map/source/number probes | **0**, all finite controls pass. |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | **0**. |
| `pm-plan-index.py validate` | **1**, top-level `fail`, **29 failures**: 21 inherited ledger-shape failures plus eight newer-main comparisons: DL-301/330/331/332, DP-064/066, PLS-025 and PWIZ-038. All named owner/index inputs are unchanged by round 8. No index/governance PASS is claimed. |
| `git diff --check` and changed-module compilation | **0**. |

The 15 ignored currentness inputs were copied and hash-verified solely for index validation, then removed before the final self-test. The first new-map probe lacked an external resource alias; its corrected complete offline bank yields zero exceptions and no schema changes. Preliminary full-tree probes were stopped while the discovery boundary was widened to include wildcard-only schemas; the retained final replay supersedes them.

CV-1101 changes from Astra B1/B2/B3 **BLOCKED** to **finite runtime/static/integrity oracles PASS within the stated universe**. Aggregate lane integration remains **PARTIAL**, native authority **NOT_RUN**, complete guard isolation **SWEEP_PENDING**. The four existing focused non-date-time predicate cuts retain their isolated flip sets; no new general guard-proof tool is authored. Family grades are **N/A**, membership **ABSENT**. IDs used: CV-1100, CV-1101, SP-1100 and SP-1101; none minted. No registry, Decision Log, Spec Lock, governance evidence, generated index/shard, `.gitignore` or main push.

Evidence is retained at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix8/`. Its `SHA256SUMS` binds retained probes, inputs, result files, report and self-grade. Important results:

| Evidence file | SHA-256 |
|---|---|
| `final-selftest.json` | `ecb6bdb5b34a6bdcf69257243ca9e419d4859c5af1cf55391d35f392420397df` |
| `runtime-probes.json` | `ff3e31274a8cfc23a475932185720a10d4eda69b53482cce41b25e59ecc2cc18` |
| `gate-probes.json` | `8d0fce044db931ea73a84f256a8869555ee1e979e4dc1d7ec34267ecf7e77a95` |
| `other-owner-probes.json` | `1fa84f0264d1157cc1ef953a0ba0333c5f203faf02b4449a430944537c999056` |
| `new-map-probes.json` | `8f42d8eb6cc086c460456ae43160239691e19dcd0366b5adcde4e35cd554c60d` |
| `number-probes.json` | `5576b0e7aa7985c833959e301bad1a4d34bc1baa66d3d056c50a7949a578240a` |
| `scope-audit.json` | `8ee463372499fbe2f795824d78f1b31b34aa55cb3d6b9149ab0f0702c046e3a2` |
| `index-validation.json` | `75d26fadb29558848e23d22217325525180f99ceb3b0233be0b25e53b497193c` |
| `final-checks.json` | `d74150cf63210fd0fa394c94caf820933b4ec207ed0ff3d70bcf47eac313d2d6` |
