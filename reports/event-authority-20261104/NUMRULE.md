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

Astra's scripts were copied before editing/running. Runtime, source-field, number and injection replays use a **98-input-file, approximately 38 MB scratch extraction** with the authentic inventory/source resources and the applicable six exclusions. The real whole-Plans census is run independently, including the final self-test. Scratch probe adaptations only supply the new root/output paths, catch the new typed refusal in the old mutation probe, record progress, preserve the original 78-node source control set, and load the full offline resource bank for the new map controls. `replay-inputs.json`, `replay_setup.py` and the retained scripts document reconstruction.

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


## Review round 9: findings and responses

**NOT_READY: B3 is stopped for missing field-bound owner evidence.** This round repairs B1a, B1b and B2 independently. It does not claim that the round-9 integrity requirement or all former bypasses are closed.

Reviewed base: `5e5c4cfe2ba2e90001c9f9e962ae1d6a1f68b4a3`. Branch: `plans/ea-numrule-20261105`. No owner prose, pinned schema, inventory node, number recipe or corpus case is changed. Families: N/A; membership remains ABSENT; no IDs are minted.

| Finding | Location, cause and response | Verification |
|---|---|---|
| **B1a — fixed** | `scripts/pm_event_datetime.py:200` and `StorageSelection` in `scripts/pm_event_datetime_inventory.py:616`: retrieving fresh objects could erase a classified target. The factory now refuses every custom retrieval callback before invocation. All supplied resources, aliases and embedded resources are bound and pinned at construction. Known inventory URIs must carry an authenticated complete-resource fingerprint; duplicate URI conflicts refuse. Complete-resource verification before validation catches replacement/disappearance even when the new object declares no field. Unknown URI lookups and alternate root-schema overrides refuse. Neutral wrappers remain admitted and pinned. | Current/frozen fresh replacements, target disappearance and exact review replay; supported preloaded baselines remain valid. |
| **B1b — fixed** | `scripts/pm_event_datetime.py:185`: the factory always selected 2020-12. Both initial construction and `evolve` now select the root/resource's declared supported dialect: 2020-12, 2019-09, draft-07 or draft-06. Other declarations refuse. Undeclared schemas default to 2020-12. | Direct/referenced root equivalence controls for ordinary, dynamic-anchor and recursive-anchor references, with current/frozen valid, offset and non-event cases. |
| **B2 — fixed** | `scripts/pm_event_datetime_inventory.py:256`: unreadable wildcard candidates used a weaker literal-name test. File, Markdown code/HTML and JSON-shaped serialized-string failures now use declaration-aware detection. Exclusion eligibility is derived independently from source roots and references before any pin can suppress a scan. A schema with `$schema`/`$id`, or a file another schema references, cannot be excluded. Every exclusion retains a source citation and stated non-runtime data/lineage purpose. | The review's four wildcard containers fail; executable authentic/unclassified schema copies cannot be excluded. Anonymous referenced declaring and neutral fragments are self-test controls too. |
| **B3 — stopped; not fixed or disputed** | `Plans/event_datetime_inventory.json` and `validate_inventory`: all 100 current other-owner rows lack a quote containing both their own field and profile. In particular, the 21 generic name maps cite schemas defining permission/tab/hash/settings/reference values; they do not name these spellings as timestamp fields or assign them `date-time`. The CV-1101 envelope sentence is about another field/resource. The brief forbids changing owner prose and says to stop when the needed quote is absent. No invented field/profile authority, label change or exception was added. | The coherent wrong-field mutation remains a known failure of the integrity claim. Its gate/runtime/self-test replay is retained explicitly; it is not reported as a successful negative control. |

### Exact authority question for B3

The controlling [NUMRULE-FIX9 brief](/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/NUMRULE-FIX9.md) says: "No owner prose changes: if evidence needs a quote the owner text lacks, stop and write the exact question."

Which existing owner unit and exact quote bind `observed_at_utc` and `persisted_at_utc` to `owner_profile: "date-time"` for each of the 21 generic name-map rows, beginning with `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_program/properties/result_schema_dependencies` and `Plans/storage_value_registry.json#/families/62/value_schema/properties/resolved_permissions`? Their existing owners define schema-hash and permission-record values, not timestamp values. If no such field/profile authority exists, should these rows retain their exact local non-timestamp schema without claiming a timestamp profile? The round-9 brief requires field-naming evidence, preserves these nodes and prohibits owner prose changes; a worker cannot manufacture that missing authority. The remaining scalar rows likewise need field/resource-bound citations rather than the current generic CV-1101 sentence.

### Exclusion changes and preservation

Removed three old exclusions because their paths are parsed schema roots: `Plans/goal_execution_binding_custody.schema.json`, `Plans/goal_workflow_cancel_contracts/schemas/late-assignment.schema.json`, and the frozen predecessor copy of the custody schema. They declare no timestamp node, so removing their exclusions does not change the census.

Added four exact, cited lineage exclusions for generated `storage_value_registry` shard fragments 128, 165, 170 and 230. The stronger wildcard rule correctly flags their incomplete JSON code blocks. These are source-lineage slices of the canonical registry, not complete runtime resources; the canonical registry is still scanned. No shard or registry bytes were edited. There are now 163 container exclusions across 159 paths.

The 233-node inventory remains byte-identical: 133 Storage, 100 other-owner, zero unclassified, including all 21 new name maps from round 8. Owner documents, pinned schemas, all 13,372 cases, production number recipes, registries, Decision Log, Spec Lock, generated shards/indexes, governance evidence and `.gitignore` remain unchanged. No governance reseal, registry admission, main push, pm-mail or subagent was used.

### Validation and limits

Results and implementation commit are recorded below after the serial replay. Evidence lives at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/`; its `SHA256SUMS` binds retained scripts, inputs and results. Runtime probe adapters record constructor refusals separately, since on-demand retrieval is now unsupported by design. The reviewed 98-file extraction is unchanged except for the implementation overlays, applicable exclusions, and the cited report file. Full-tree verification runs in the actual worktree; a finite extraction is never called the full Plans census.

B3 prevents a READY grade even if the unmutated finite corpus passes. Native custody, complete adopting-lane dependency/reference audits and aggregate guard isolation remain outside this finite shared-helper repair.


| Final check | Result |
|---|---|
| **Actual worktree self-test** | Exit **0**; **13,372/13,372 cases**, **162/162 integration checks**; 233 nodes = 133 Storage + 100 other-owner; zero unclassified. |
| **Original runtime replay** | 133/133 preloaded baselines valid; **0/133 escaping preloaded nodes**. All **133/133 on-demand constructions refuse**, with zero callback invocations; this unsupported mode is no longer reported as a valid-baseline route. |
| **Adversarial runtime / supplemental** | Both current/frozen changed callbacks refuse before invocation; direct and referenced 2019-09 recursion agree on valid/offset/non-event controls. Dynamic recursion and ordinary references preserve their controls. |
| **Original gate replay** | All **20/20** injections exit **1**; all five original positive detection controls still detect. |
| **Extended gate replay** | All **16/16** supported-form and container injections exit **1**, including **4/4** wildcard-only containers. |
| **Exclusion replay** | Authentic schema copy, unclassified schema and canonical source exclusions all fail for `loadable_schema_exclusion_forbidden`. The authentic copy's runtime baseline still passes and its Storage offset negative still fails. |
| **Coherent wrong-field profile mutation** | **Known B3 failure:** inventory validation returns no errors, runtime installation accepts, gate exits **0**, and actual scoped self-test exits **0** with all **13,372** cases. The pin is recomputed coherently; checksum staleness does not supply authority. This remains unclosed. |
| **Shard body/path verification** | Exit **0**; no generated files changed. |
| **Index validation** | Exit **1**, top-level **fail**, **84** failures: 21 inherited ledger-shape failures and 63 removed-unit comparisons against newer `origin/main`. The validator, canonical Plans and generated indexes are byte-identical to the requested base. No index PASS is claimed. The ignored currentness edition's 15 files were copied, hash-verified, and removed after this read-only check. |
| **Diff / syntax / preservation** | `git diff --check` and changed-module compilation exit **0**. All protected Plans and number recipe/corpus bytes are unchanged. |

The self-test's 24 additional controls relative to round 8 cover wildcard unreadable containers (including a malformed serialized schema), forbidden schema/reference exclusions, current/frozen fresh resource replacement and target disappearance, supported-dialect root equivalence, unsupported dialect/URI refusal and alternate root-schema refusal. The existing finite oracles remain intact; no complete per-predicate isolation or native installation claim is added.

Replay execution used scratch copies under `/tmp/numrule-fix9-probes` and the review's 98 exact source inputs under `/tmp/numrule-fix9-replay`. Construction-refusal adapters preserve the raised typed reason and leave all timestamp/schema predicates unchanged. `phase1-implementation/` and the overlay manifests retain the exact modules for the scoped replay; the final actual-worktree self-test also covers the later malformed-string guard. Whole-tree confirmations use the Git-backed Path adapter with the final branch exclusions and exact Plans bytes; only I/O is adapted. The branch's static census is separately verified by the actual worktree self-test. Evidence scripts copied from review but not rerun do not imply a new result for those probes.

No plan/governance generation or reseal was run. Overall grade: **NOT_READY (B3 authority question open)**. Family grades before/after: **N/A**. Native execution: **NOT_RUN**. Shared guard-isolation adoption: **SWEEP_PENDING**.


**Implementation commit:** `f8b2d901beb804356ad3824e256af74aa9e29ad1` fixes B1a, B1b and B2. B3 is stopped, with the exact authority question above. The implementation and report are pushed to `plans/ea-numrule-20261105`.

**Whole-tree wildcard confirmation:** `full_wildcard_gate.py` exits **1**, as required for the injected failing gate. The unmodified gate sees all **8,968 committed Plans blobs** plus four additions, preserves **233 classified nodes**, and reports **exactly four failures**, one `unreadable_mentioning_container` for each injected wildcard HTML/YAML/malformed-JSON file. There are no unrelated failures. The actual-worktree unmutated gate passed as part of the final self-test.

Retained evidence paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/`:

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/final-selftest.json` | `60d0153ce1ad9d8e3639f169f93fea982a89dbc4f78a9e14a4e854bc4653af37` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/runtime-probes.json` | `a1f5eb0e8b16a7f85db64f18ca7116cbd342c4a8001181d2cd47e64d456ed69a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/runtime-adversarial.json` | `339c7ea0f2e7488743448e935750309a6d68782015302f9fa90fc75125adb9b3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/extended-gate-integrity.json` | `c2fdab66dbd0122f921fef4be3b8c018f78e3a9b07eec292a969a8ef42ef2c6c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/full-wildcard-gate.json` | `f2da42015099890f986084cf581af59f0cda224c972d165691da82d4f23735dc` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/coherent-integrity.json` | `46b69a7e26c80d20d8f4df45501946a3435252a74f6822c51f31db7c1993e916` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/index-validation.json` | `84f44442327bbf478d4e18642f75aa8eec8dbc1c7a8d61bc314a842b8893b08c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix9/preservation.json` | `625fe7e08d64e7d2bc44141cfb1358f80b5c6cc73462a077cc1d66daec4d87de` |

## Review round 10: findings and responses

**B3 fixed in `82e29fe59bebe69fbb8104fa551c183e750356a9`.** The round-10 lead answer resolves the round-9 evidence question: wildcard names do not assign timestamp types, and a field's own canonical schema is evidence for its exact constraint. No owner prose or product decision was authored.

| Finding | Where | Why | Fix |
|---|---|---|---|
| **Other-owner field evidence** | `scripts/pm_event_datetime_inventory.py:528`, `:599`; `Plans/event_datetime_inventory.json` | A generic quote about the envelope could justify a different field's profile label. | Remove the free-text `owner_profile` labels and generic CV-1101 citations. Derive the exact field pointer and full constraint from the row's own source, including offline reference/combinator targets. The gate requires that exact evidence; quotes for another field and sibling pointers fail. |
| **Wildcard non-timestamp evidence** | `scripts/pm_event_datetime_inventory.py:528`; inventory/schema | The 21 maps admitted the spellings as keys while storing hashes, permissions, tabs, settings, references or other local values. | Classify all 21 as `wildcard_non_timestamp`, cite the key/value schema, and assert no timestamp profile. Check value constraints through references/combinators; a timestamp format or pattern requires timestamp classification. Nested record members are checked separately from the map value's type. |
| **Derived pin** | `scripts/pm_event_datetime_inventory.py:338`, `:572`, `:595` | Refreshing a checksum could hide incorrect evidence. | Recompute the inventory projection's evidence, classification and structural assertions from source before hashing the inventory exclusion. A refreshed checksum over false assertions fails independently. |
| **Mutation controls** | `scripts/pm_event_datetime_admission_checks.py:142` | The prior self-test omitted coherent wrong-field evidence. | Add the coherent wrong-field quote, sibling-field pointer and map value becoming `format: date-time`, with refreshed hashes. Each fails; correcting the timestamp map's classification restores its inventory validity. |

**Classification:** 233 nodes = **133 Storage + 79 other-owner named-field observations + 21 wildcard non-timestamp**; **0 unclassified**. The 79 include the existing source-lineage patch, which is never installed at runtime. Named fields retain their exact local schemas; an unformatted string/null field does not acquire a timestamp predicate. `profile: owner_schema` remains the unchanged pass-through validation action; it is not a timestamp-profile assertion. All 133 Storage rows retain their original CV-253/CV-1101 evidence byte-for-byte.

**Preservation:** the 233 node keys, source/resource pointers and fingerprints, field sets, owners and role evidence are unchanged. Only evidence and classification fields change on 100 non-Storage rows. Owner prose, all pinned schemas and raw pins, production number/date-time recipes, all 13,372 corpus records, registries, Decision Log, Spec Lock, generated shards/indexes, governance evidence and `.gitignore` remain unchanged. No shards/indexes or governance artifacts are regenerated.

**Actual worktree self-test:** exit **0**, **13,372/13,372 cases** (6,836 positives, 6,536 negatives), **165/165 integration checks**, including the three added B3 controls. The same run executes the complete real-worktree census and reports no failures.

| Probe rerun | Result |
|---|---|
| **Original runtime** | 133/133 valid preloaded baselines; zero escaping nodes. All 133 on-demand constructors refuse before callback invocation. |
| **Adversarial / supplemental runtime** | 27 + 8 probes complete without unexpected exceptions; changed retrieval refuses, direct/referenced recursive/dynamic routes agree, shared-class bypass refuses. Stock-validator positives remain explicitly outside the shared boundary. |
| **Original gate injections** | 20/20 product gates exit 1; all five positive detection controls still detect; the restored 233-node scoped baseline exits 0. |
| **Extended gate / inventory mutations** | 16/16 container/declaration injections exit 1, including all four wildcard forms. All 7/7 inventory mutation gate/self-test pairs exit 1. |
| **Review's coherent wrong-field mutation** | Direct validation fails; runtime inventory installation refuses; gate and scoped self-test exit 1 despite the refreshed pin. Whole-tree Git-backed self-test also exits 1, with cases `NOT_RUN_ADMISSION_REFUSED`. |
| **Stronger B3 controls** | Six coherent controls fail both gate/self-test and runtime admission: wrong-field evidence with no obsolete label, sibling pointer, and direct/ref/composed/pattern timestamp map values. Each independently fails the source-derived pin check; exact source hashes/evidence are refreshed before the value-classification control. |
| **Exclusions** | Authentic schema copy, unclassified schema and canonical existing source cannot be excluded. The authentic copy retains its valid baseline and rejects the Storage offset. |
| **Name maps** | All 21 exact local-schema citations match; 252/252 value controls agree with the original schemas in coherent preloaded value graphs. All 21 unsupported on-demand constructors refuse separately. |
| **Actual injected self-test CLIs** | Pattern schema and empty citations both exit 1 before cases execute. |
| **Whole-tree wildcard confirmation** | All 8,968 committed Plans blobs plus four injections exposed; 233 classified nodes and exactly four unreadable-container failures, no unrelated failures. |
| **Shard body/path check** | Exit 0; no generated artifact changes. |

The finite gate replay initially omitted the unchanged report cited by the inventory exclusion; adding that report restored its baseline. The old name-map bank also mixed unrelated current/frozen resources and embedded URI editions, which the round-9 closed-graph rule correctly refuses. Its corrected bounded value graphs include each tested row's exact resource and the external resource reached by these probes. Both source/helper validators use the same graph. Initial attempts are retained; no product predicate or source schema was relaxed. The full owner dependency/adoption audit remains outside this bounded check.

No plan-index/governance check or number-isolation sweep was rerun: their owner/index/recipe inputs remain unchanged, and no new index/governance/native PASS is claimed.

**Scope:** this closes the reported B3 finite integrity controls and retains the B1a/B1b/B2 repairs. Native original custody and complete adopting-lane graph installation remain **NOT_RUN**; aggregate integration remains **PARTIAL** and full guard isolation **SWEEP_PENDING**. Family grading is **N/A**, membership **ABSENT**, no IDs minted. No main push, landing, pm-mail or subagent.

Evidence is retained in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/`. `tested-implementation.json` binds the replay inputs to the implementation commit. Run records retain the requested source-base SHA for runs prepared before the commit; content hashes identify the executed implementation. The scoped replay uses 99 exact input files (including the existing report cited by the inventory exclusion), plus disposable dependencies and a filtered exclusion list. The actual worktree self-test supplies the full census independently. No finite extraction is presented as the whole Plans universe.


| Retained evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/final-selftest.stdout` | `a23fa8b7cdebead5abf33839a3cc8f56a175a8a4b296e6f8a1bb9f3cf1b751d5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/runtime-probes.json` | `a1f5eb0e8b16a7f85db64f18ca7116cbd342c4a8001181d2cd47e64d456ed69a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/extended-gate-integrity.json` | `79bfb4321944e9c156bf18d1a6eb569632347c3383a3b23f75e226f3ffaef8a0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/coherent-integrity.json` | `070379bd8cd2aa1299e6531566c8180d2015b1033a425160ade0b53eb2fd9b3b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/b3-controls.json` | `d541d28e2ecb3e06871fab8a677a49d32bfce59a20c124bc3e455d3da30fa281` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/name-maps-audit.json` | `4f2f81c2650ac5b8d0e62f0ef5d6126fe7353f4d8cd3a21a65bf94bd8746b4eb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/full-wildcard-gate.json` | `ae8809bcbe24d642d1d1ee289fa36b81c4a93fdcce0b56c9522ae7fca60b6ee5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/coherent-full-selftest.json` | `ef0de8c26f7b888da006c04cc88b6da8744659b38a2ef0652c35072d5bdbb19d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/preservation.json` | `b7d87d93063bb161bc76ae555b93b4a68dd47ab0990318e8d0b49cf7a5b40102` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix10/tested-implementation.json` | `58fdac2e65e7987b23a8dd6d46f590578be629018ce90f8879c780f056b900b3` |


## Review round 11: findings and responses

**B4 implementation:** `scripts/pm_event_datetime_value_probe.py` replaces spelling-based timestamp recognition with a committed 653-sample timestamp trigger through the runtime helper’s shared closed resolver setup. Timestamp-specific map values require `other_owner_observation` and exact source-schema evidence. All-refused maps remain `wildcard_non_timestamp`. Timestamp acceptance never manufactures a timestamp role for a generic payload.

**Lead’s final technical refinement:** the original any-acceptance classifier conflicted with existing non-timestamp maps. A proposed second arbitrary-string battery also conflicted with minimum lengths and SafeRef character restrictions; any finite arbitrary-string classifier can be gamed. The final instruction makes timestamp acceptance a trigger for explicit source-bound role review. Nine timestamp-accepting maps are reviewed as `wildcard_non_timestamp_role`, without a timestamp profile, in `scripts/pm_event_datetime_roles.json`. Each review records the source schema’s role and exact citation and pins the resolved value-schema graph fingerprint. Any source-value or referenced-target change invalidates that review until it is explicitly reviewed again. Source projection regenerates probe results and the inventory pin, never the reviewed role’s fingerprint. The arbitrary-string battery/predicate and `wildcard_generic_value` class were not implemented.

**Battery:** 653 unique committed strings, tagged by RFC 3339 / CV-1101 feature. Coverage includes T/t, Z/z, zero/unknown/nonzero offsets, no fraction and 1–9 digits, real leap seconds with offsets, leap days, year 0000/9999, month/day boundaries and 320 deterministic samples across the date range. Structural SHA-256: `a125323b4261c366275d5f732af49b9f4478e6e3f1c992aaffbcdda4e27e63c3`. Raw file SHA-256: `f2a1a55d7f1ef2fe630b7f1fbf5f4b8167958a2d353daf30f7879498a82ef46e`. Every string is checked by the enforced date-time predicate before use.

**Baseline classification:** 233 nodes = 133 Storage + 79 other-owner observations (including one source-lineage patch) + 12 automatic wildcard non-timestamp + 9 explicit non-timestamp roles; zero unclassified. Every wildcard row records the battery fingerprint, count, per-key acceptance counts, resolved value-schema fingerprint and reviewed role where applicable. Key validation remains part of the actual source context; the setting-ID map whose keys forbid the two inventoried field names correctly refuses all samples.

| Explicit role | Exact source row(s) | Source-bound evidence |
|---|---|---|
| Schema-resource strings | `Plans/section15_browser_program_contracts.schema.json#/$defs/browser_program_result_validation/properties/result_schema_resources` | The named map’s exact nonempty string value schema. |
| Arbitrary graph payload | `Plans/.audits/stage-a-plan-assurance-rolling-trial-packet-v1/CAPABILITY_OBLIGATION_GRAPH.schema.json#/$defs/common_node/properties/payload` | The graph payload object’s exact unrestricted values and forbidden-name rule. |
| Recursive setting values | `Plans/settings_system_contracts.schema.json#/$defs/setting_value/oneOf/5` | Resolved `$defs/setting_value`, the recursive null/boolean/number/string/array/object union. |
| SafeRef values | `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/TargetRefs` and `#/$defs/SafeParameters` | Their actual referenced `$defs/SafeRef` non-secret reference schema. |
| SafeRef values, frozen input | `Plans/workflow_standard_source_contracts/inputs/Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/TargetRefs` and `#/$defs/SafeParameters` | Their own frozen resource’s referenced `$defs/SafeRef`, not a current-resource citation. |
| SafeRef values, predecessor input | `Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/inputs/Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/TargetRefs` and `#/$defs/SafeParameters` | Their own predecessor resource’s referenced `$defs/SafeRef`. |

The source-only probe uses the real jsonschema keyword implementations and referencing resolver after preloading its exact offline graph through the shared `_closed_datetime_graph`. It runs before inventory authentication and installs no Storage overlay; production `datetime_validator` still always installs authenticated `StorageSelection`, supports no custom/on-demand retrieval and retains current/frozen admission. References, anyOf/allOf/oneOf, not and if/then are evaluated as validators, not searched as pattern text. Exact citations and the schema fingerprint include actual resolved targets.

**Preservation and limits:** all 233 row keys, pointers, resource fingerprints, field sets, profiles, owners and structural role evidence remain unchanged. Only wildcard classification and evidence fields change in the inventory. No owner prose, pinned product schema, registry, Decision Log, Spec Lock, generated shard/index, governance evidence, number recipe, corpus case or `.gitignore` change is made. Full native custody, aggregate guard isolation and adopting-lane graph audits remain outside this finite helper repair. No governance reseal, main push, pm-mail or delegate is performed.


**Implementation commit:** `0f0e31fe781b1507a255a844f89100e66b746774`, pushed to `plans/ea-numrule-20261105`.

**Actual-worktree self-test:** exit 0; **13,372/13,372 cases**, **200/200 integration checks**, including **35 new battery controls**. Full actual-worktree inventory: 133 Storage + 79 other-owner + 12 automatic non-timestamp + 9 reviewed non-timestamp roles; zero failures/unclassified. The four equivalent-pattern negatives fail after coherent evidence regeneration, all four corrected timestamp classifications pass, and stale source-value fingerprints fail independently. Exactly-one-timestamp and timestamp-or-empty schemas fail under the obsolete wildcard class and pass after timestamp classification. OneOf, not, if/then, real calendar enforcement, changed role pins and foreign role citations have independent controls.


| Round-11 recheck | Result |
|---|---|
| Four equivalent-pattern negatives | All four gates fail `source_value_classification_conflict`; the source-derived pin differs from the coherently refreshed checksum of the false classification. |
| Four corrected timestamp positives | All four gates pass; the source-derived pin equals the actual corrected inventory checksum. |
| Existing source/evidence attacks | 27/27 expected outcomes; sibling/ancestor/foreign evidence, wrong-field quotes and Storage role changes remain rejected. |
| Original runtime | 133/133 valid preloaded baselines; zero escaping nodes; 133 on-demand constructor refusals, zero callback calls. |
| Adversarial / supplemental / graph runtime | 27 + 8 + 23 controls completed; fresh replacements, recursive/dynamic/mixed dialects, duplicate URIs and shared-class construction retain their controls. |
| Original gate injections | All 20 injections and five inventory mutations exit 1; restored baseline exits 0. |
| Extended gates / inventory mutations | 16/16 injections exit 1; 7/7 mutation gate/self-test pairs exit 1/1. |
| Exclusions / injected self-tests | Executable-resource exclusions refuse; pattern and empty-citation self-test CLIs refuse before cases. |
| Name-map behavior | 21 exact source citations, 252/252 original-versus-helper value controls match; 21 unsupported on-demand constructors refuse. |
| Whole-tree wildcard gate | All 8,968 committed Plans blobs exposed; exactly four injected unreadable-container failures, no unrelated failures; 233 nodes retain the revised 133/79/12/9 totals. |
| Coherent wrong-field whole-tree self-test | Exit 1; inventory admission refuses before cases. |
| Preservation | All 4,400 protected blobs unchanged from the earlier `5e5c4cfe2b` baseline; all 233 row structural fields unchanged. Only classification/citation/new value-evidence fields change. |

**Where / cause / fix:** B4 was in `_timestamp_constraint` and its source projection in `scripts/pm_event_datetime_inventory.py`: syntax-based recognition authenticated equivalent timestamp patterns as non-timestamp maps. The deciding recognizer is removed. The real resolver now supplies a battery trigger, and only an explicit, source-cited, independently pinned role review permits an accepting non-timestamp map. The inventory schema, derived pin, runtime admission regressions and adoption guide carry this distinction.


**Final verification:** the complete Git-backed baseline repeats **13,372/13,372 cases and 200/200 checks**, exit 0. The full-Git equivalent-pattern confirmation now exits 1 on the forced wrong class (wrapper exit 0), before census; its correct source projection identifies the row as a timestamp. Shard body/path verification exits 0: 99 owner documents and 3,095 shards checked. Syntax checks and `git diff --check` pass. No index/governance or predicate-isolation sweep is rerun; no corresponding new PASS is claimed.

**Execution and cleanup:** all cycle-10 probe entry points were copied and rerun serially. The extraction contains 102 exact inputs (38,890,630 bytes), matched against implementation `0f0e31fe781b1507a255a844f89100e66b746774`. The new probe, battery and role records are the three added inputs. Finite replays use six applicable exclusions; complete Git-backed runs use all 163. The adapter changes only Path I/O. Every run starts above 6 GiB available; scratch stays below 82 MB. The restored extraction matches all 102 inputs, with exactly the six scoped exclusions and no injected Plans files. Original review evidence is untouched. The final report/check/self-grade update changes reports only. Cleanup of both disposable environments, scratch and the worktree is recorded separately in the evidence directory.

**B4 fixed in `0f0e31fe781b1507a255a844f89100e66b746774`; B1a/B1b/B2/B3 controls retained.** Native custody remains NOT_RUN; aggregate integration remains PARTIAL and full guard isolation SWEEP_PENDING. Family grading is N/A; no IDs minted. No owner prose, registry, Decision Log, Spec Lock, generated artifact, `.evidence`, `.gitignore`, main push or governance reseal is part of this task.

| Round-11 evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/actual-selftest.json` | `e519875feaa045e4856cbd801132277a83cf3d7343a71307828a1724aacff1b8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/battery-controls.json` | `81b651f6bf54222582a9b0f66bb56c1c83d9c89abae1b723a520928d1f9a9e36` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/results.json` | `554337f588f960c57d02c8c1c1be07782252210c309c09eb462933e331282e35` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/cycle10-replay/evidence-attacks.json` | `948cfd9083c9eeeb8d9ddf3fba61be79ed31b61a53059e3a78176eb8208e245d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/cycle10-replay/equivalent-pattern-full-summary.json` | `1dfae46ef063a7679c11ef692534adf52aff2bf89d2f32ac99989d5112a211f3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/cycle10-replay/full-selftest.json` | `c068e3af5eaf61e1426cae270226760a6ec7373a3a4f82afd316f347cd63f35f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/cycle10-replay/graph-attacks.json` | `04425cad5fa8364f44990a4efcd5f7475aef39f1b6564206951e34aba0c5642f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/cycle10-replay/preservation-audit.json` | `078faafd00c6e4b64cd3a88e2f2089ecbcc5bfa97ece5cf68cc8595a52a501bd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/restoration.json` | `34c913db85b2ff60e6a37045b91f4a2676149d041f8475b026dbad7930efe2fb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix11/shards.run.json` | `72695d6c41375614b94c17323bc7cebb5a6845a3b98def725983af8f66289cce` |

## Review round 12: findings and responses

**B5 — sibling-dependent acceptance:** singleton map rejection no longer establishes timestamp refusal when the same object has `required`, `dependentRequired`, `dependentSchemas`, legacy `dependencies`, cardinality, `unevaluatedProperties`, object `const`/`enum`, or same-instance combinators. The checker follows references and applicators at object scope. These maps require a separately pinned explicit role review, even if every singleton sample fails. Source projection produces `wildcard_review_required` until that review exists; validation fails `wildcard_role_review_required` independently of a refreshed inventory checksum. Existing object-valued permission records retain their exact source constraints and receive five explicit non-timestamp reviews.

**Sibling contexts:** the battery also runs with source-derived sibling hints and reviewer-supplied `sibling_contexts`. Every candidate is checked as a complete map instance by the shared validator. An accepted context triggers review and is recorded with its acceptance counts. The required and conditional `kind: "timestamp"` regressions retain the valid timestamp witness and corresponding resource-string refusal. Explicit timestamp reviews cite the exact selected value constraint; a generic source projection never supplies such a review.

**B6 — value-bound role evidence:** offline graph discovery remains broad enough to preload the production resolver, while role authority follows only the actual per-field value selector and its same-instance references/applicators. Evidence records the complete source JSON-pointer route. A citation must be the exact terminal value constraint for every inventoried field, with its exact current content; merely appearing among collected subresources is insufficient. Key-only, sibling-only, nested-value, unused/foreign and one-field-only definitions cannot authorize another value. The existing browser string review now cites its `additionalProperties` string constraint. The graph payload review records the containing map's implicit unrestricted additional values; this exception does not apply when an explicit value constraint exists.

**Classification:** 233 unchanged row keys and structural fields = 133 Storage + 79 other-owner + 7 automatic non-timestamp + 14 explicit non-timestamp roles. Five rows moved to explicit review, all permission-state object maps carrying `minProperties`. The prior nine independent schema-graph pins remain unchanged. No timestamp profile is assigned to these non-timestamp values.

**Scope:** number recipes, all 13,372 corpus cases, date-time predicates, owner prose, pinned product schemas, registry, Decision Log, Spec Lock, generated shards/index, governance evidence and `.gitignore` remain unchanged. This is a finite shared-helper repair. Native authority remains NOT_RUN; existing aggregate isolation/adoption limits stand. No family re-grading, WorkNode, registry admission, governance reseal, main push, pm-mail or subagent is performed.

**Final targeted replay:** 48/48 expected outcomes. Both sibling-dependent variants fail `wildcard_role_review_required`; their source-derived projections cannot claim automatic refusal. Each real sibling context accepts 500 battery samples at each inventoried key. With an explicit timestamp review installed only for the witness, production `datetime_validator` rejects the singleton, accepts the timestamp plus `kind: "timestamp"`, and rejects `resource-id` plus that sibling. The reviewed witness does not authorize the original unreviewed gate input.

The key-only foreign same-name definition and the ordinary unrelated foreign citation both fail `wildcard_role_evidence_changed`. The foreign-key production witness, after a temporary exact timestamp review, accepts the timestamp value and rejects the ordinary resource string. All 14 changed-map controls and all seven changed referenced-target controls fail `wildcard_role_schema_changed`. The four equivalent-pattern negative/positive pairs, exactly-one-timestamp, timestamp-or-empty, `not`, `if`/`then`/`else`, dynamic reference and reviewed map-level `dependentSchemas` controls retain the required behavior. The original unreviewed `dependentSchemas` projection is now an additional refusal control. Battery tampering fails inventory evidence and runtime admission.

**Implementation commit:** `263a9970a8c6783c571d83ce38f68f436a87672f`, pushed with `git push origin HEAD:refs/heads/plans/ea-numrule-20261105` to both configured origin push destinations. Main is untouched.

**Complete self-test:** exit 0, 13,372/13,372 cases and 227/227 integration checks; the 27 new B5/B6 integration checks all pass alongside the existing 200 checks. Full Git-backed inventory: 233 nodes, 133 Storage + 79 other-owner + 7 automatic non-timestamp + 14 reviewed roles, zero failures/unclassified. Both coherent full-gate reproductions fail on their exact guard: sibling acceptance fails `wildcard_role_review_required`, and foreign key evidence fails `wildcard_role_evidence_changed`. Both original cycle-11 standalone attack inputs also fail. The baseline exclusion pin is recomputed from the source projection (`940367386de9c9a42455f77dc94b3de51ef4cd8d333fbdc4ee799335384f16eb`), rather than formatted inventory bytes; the complete passing run follows that correction.

**Preservation:** unchanged Git blobs include 3,774 owner Markdown files, 517 pinned product schemas, 3,299 generated shard/index files, six number implementation/corpus/registry inputs, the date-time runtime and committed battery, and 35 governance/registry inputs. Scope counts overlap. All 233 row structures and all nine prior independent role pins are unchanged. No source runtime predicate or corpus case changes were required.


| Round-12 preservation/control replay | Result |
|---|---|
| Original runtime | 133/133 valid preloaded routes; 133 on-demand construction refusals; zero retrieval callbacks and zero forbidden acceptance. |
| Original scanner / inventory attacks | All 20 injections and five inventory mutations exit 1; restored baseline exits 0. |
| Extended scanner / inventory attacks | All 16 injections exit 1; seven gate/self-test mutation pairs exit 1/1. |
| Source/evidence attacks | 27/27 expected outcomes, including four coherent equivalent-pattern negatives and four corrected timestamp positives. |
| Existing name maps | 21/21 source citations; all 252 value controls match their local validators, plus 21 unsupported construction refusals. |
| Full wildcard omission gate | Exactly four injected unreadable containers fail against all 8,968 committed Plans blobs; no unrelated failure. |
| Graph/runtime controls | 23 controls, zero forbidden acceptance; prior recursive, mixed-dialect, alias and construction protections remain. |
| Full baseline repeat after mutations | 13,372/13,372 cases and 227/227 checks pass; inventory remains 233 nodes with zero failures/unclassified. |
| Coherent source projection | Timestamp positives match their source-derived pins; wrong wildcard classifications differ. Role review pins remain independently authored. |

**Execution and cleanup:** checkers ran serially from fresh copies of the cycle-11 and earlier control drivers. Full-tree checks used the retained Git Path adapter (I/O only), the complete exclusion list and all committed Plans blobs; finite replays used the six applicable exclusions. Disposable Python dependencies match the review versions. One preflight stopped below 6 GiB before starting a case; 20 completed evidence records were checkpointed, exact core input hashes were verified, and the final seven cases ran after memory recovered. The pause and resumed results are retained separately. No product failure is attributed to that infrastructure pause. The implementation worktree and disposable scratch are removed after the final branch push; the evidence bundle remains at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/`.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/results.json` | `28df2113a814df19bd19d6f20364bb7eb8216cd60fcce31b125c1f36a82fac76` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/tested-implementation.json` | `8665b766169084c66e67ec07556b3b933455d3d0c2e5c6a9feb3dc296d8df605` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/preservation.json` | `e76b56e737cc548561eead19a9a8cbf4d1630933502abd07fc7662ce888e1e41` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle11-replay/targeted-checks.json` | `ac9ba903aabd71001379b5b1584d3e97b6f88531daf34b4202a1d6b82894950e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle11-replay/sibling-full-gate.json` | `d9f5982b32bb4556cce31d2d6c07ad4a017f39364ca58b7f2229595150f3adf6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle11-replay/foreign-key-full-gate.json` | `54875fafd30598479ffebd07c813a52c3c3e8133c4a6d95b6a18bb78b442b2de` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle11-replay/full-selftest.json` | `06e0e454455fcb789dcba456af51ae459bab5850deaa909f98218bb0d76cd7ad` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle10-replay/full-selftest.json` | `06e0e454455fcb789dcba456af51ae459bab5850deaa909f98218bb0d76cd7ad` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle10-replay/evidence-attacks.json` | `eefd9c1cf985617ffd22b3750a285b4d8202c6e8e4e5607804591f4b06bf80fb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/cycle10-replay/extended-gate-integrity.json` | `69055f37001612b59e7351d3a3a3efc8417281a59cb98810ca79c67ec15300ad` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix12/memory-pause.json` | `0554d69e8b32eca55378568be48aebcd0755d9e904f049eed379f8fc98ea8acc` |


## Recheck cycle 12: findings and responses

**B7 — predicate-only role evidence: fixed in `3e4378f885c83dda88f5e1ea3718e5c5ce643ae3`.** Where: `constraint_paths` and `reviewed_role` in `scripts/pm_event_datetime_value_probe.py`. Why it broke: a value-path walk that followed `if` and `not` let a definition that imposes no constraint authorize a timestamp-only value as a non-timestamp role. Fix: role authority is now an allowlist, not a walk with exceptions.

**The allowlist.** A citation counts for `wildcard_non_timestamp_role` only if every field reaches it through the value schema itself, `$ref`, `$dynamicRef` or `allOf[i]`. Through `anyOf` or `oneOf` it counts only when every branch carries that same citation. Every other keyword earns nothing: `if`, `then`, `else`, `not`, `dependentSchemas`, `dependentRequired`, `dependencies`, `contains`, `prefixItems`, `items`, `additionalItems`, `properties`, `propertyNames`, `patternProperties`, nested `additionalProperties`, `unevaluated*`, `$recursiveRef` and any keyword the walker does not recognise. Each such keyword is recorded in `value_evidence.role_authority[].unproven`, and the row routes to `wildcard_role_review_required`. Annotations and subschema-free assertions (`type`, `pattern`, `minLength` and the like) route nothing.

**Discovery stays separate.** `wildcard_probe` still walks everything it needs to preload the resolver and still records `value_constraint_paths`. Those paths carry no non-timestamp authority. They are used only to bind a timestamp review (`other_owner_observation`), which claims no exemption, so the cycle-11 timestamp-positive controls keep their outcomes.

**Three additions beyond the brief's list, each closing the same defect class.**

| Addition | Why it is needed | Effect |
|---|---|---|
| Whole-constraint check on any timestamp-accepting value | `allOf: [STAMP, {$ref: C}]` and `{$ref: C, pattern: STAMP}` have a literal positive path to `C`, yet their language is timestamp-only. Citing the value schema itself is also a positive path. | Once a value accepts any battery timestamp, a non-timestamp role refuses if the proven closure holds a same-instance `if`, `then`, `else`, `not` or unknown keyword, or any object-scope non-positive keyword. Member-only keywords inside a cited definition stay allowed because they never decide a string's acceptance. |
| `timestamp_only_nodes`, a refusal-only guard for FIX11's rule that a bare timestamp shape can only be a timestamp row | The rule had no enforcement once a role record existed: a record could cite a bare timestamp pattern directly. | Each proven node runs through the real validator against the battery and 16 fixed non-timestamp strings. A node that accepts a timestamp and refuses all 16 refuses the role. These strings can only refuse, never classify or authorize. A schema written to accept one of the 16 passes this guard and still needs its pinned review, so this is not a proof of correct human judgement. |
| Dialect-exact paths | Draft 7 and earlier ignore `$ref` siblings, and `$dynamicRef` does nothing before 2020-12. A walker reading them literally would credit a constraint the validator never applies. | Only keywords the selected dialect implements count, and legacy `$ref` siblings are dropped. |

**Automatic credit.** `wildcard_non_timestamp` now also needs `automatic_credit`: every battery sample refused, no sibling dependency, and no unproven keyword for any field. A value schema that accepts a timestamp and has no record stays `other_owner_observation`, the safe direction, exactly as before.

**Rows moved (4 of 233): automatic to explicit review.** No row was relabelled to stay automatic.

| Row | Move | Reason |
|---|---|---|
| `storage_value_registry.json` `/families/84/value_schema/properties/tabs` | automatic `wildcard_non_timestamp` → explicit `wildcard_non_timestamp_role`, role `workspace_tab_record` | The value schema carries properties, additionalProperties and allOf if/then rules, which earn no automatic credit. Values are tab record objects. |
| `home_workspace_layout_v2.schema.json` `/properties/tabs` | automatic `wildcard_non_timestamp` → explicit `wildcard_non_timestamp_role`, role `workspace_tab_record` | The value schema carries properties, additionalProperties and allOf if/then rules, which earn no automatic credit. Values are tab record objects. |
| `project_system_contracts.schema.json` `/$defs/project_creation_recovery_context/properties/settled_effects` | automatic `wildcard_non_timestamp` → explicit `wildcard_non_timestamp_role`, role `settled_effect_record` | The value schema carries properties and additionalProperties, which earn no automatic credit. Values are closed objects. |
| `settings_system_contracts.schema.json` `/$defs/values_by_setting_id` | automatic `wildcard_non_timestamp` → explicit `wildcard_non_timestamp_role`, role `setting_value` | The setting_value union carries items, propertyNames and additionalProperties, which earn no automatic credit. The setting_id key grammar refuses both field names. |

**Rows re-cited with no class change (3).** Each `SafeParameters` row cited `/$defs/SafeRef`, which is one branch of `oneOf [SafeRef, boolean, integer, null]`. That citation no longer counts, because three branches do not carry it. Each record now cites its complete value schema under the role `safe_parameter_value`, with the value-schema fingerprints unchanged.

| Row | Old citation | New citation |
|---|---|---|
| `Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/SafeParameters` | `/$defs/SafeRef` | `/$defs/SafeParameters/additionalProperties` |
| `Plans/workflow_standard_source_contracts/inputs/Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/SafeParameters` | `/$defs/SafeRef` | `/$defs/SafeParameters/additionalProperties` |
| `Plans/workflow_standard_source_contracts/predecessor/v2/predecessor/v1/inputs/Plans/shared_integration_runtime_expansion_contracts.schema.json#/$defs/SafeParameters` | `/$defs/SafeRef` | `/$defs/SafeParameters/additionalProperties` |

**Totals.** 233 row keys unchanged: 133 Storage + 79 other-owner + 3 automatic non-timestamp + 18 explicit roles, 0 unclassified. Full gate status `pass`. All 18 role pins are independent of the regenerated inventory.

**B7 reproductions (coherent recomputed fingerprints and source-derived pin, through the complete Git-backed gate).**

| Variant | Full gate | Errors |
|---|---|---|
| irrelevant_if | exit 1 | `wildcard_role_review_required` |
| vacuous_not | exit 1 | `wildcard_role_review_required` |

Each variant's record fingerprint matches, and its inventory checksum equals its source-derived pin, so neither refusal comes from stale evidence. The gate refuses at inventory validation, before its whole-tree scan. The baseline gate is the run that scans all 8,968 committed Plans blobs, and it passes. The value language is unchanged: the closed-graph validator still accepts the timestamp and refuses `resource-id`. The production constructor refuses admission. The byte-for-byte cycle-12 bypass input also fails. With the false record removed, the same schema is a passing timestamp row.

**Earlier full-gate reproductions (fresh coherent inputs).**

| Reproduction | Full gate | Errors |
|---|---|---|
| sibling-full-gate | exit 1 | `wildcard_role_review_required` |
| foreign-key-full-gate | exit 1 | `wildcard_role_evidence_changed`, `wildcard_role_review_required` |

The literal old inputs also fail: original-sibling-full-gate, original-foreign-key-full-gate, original-coherent-bypass-full-gate.

**Controls.**

| Control | Result |
|---|---|
| Direct, `$ref`, `$dynamicRef`, `allOf`, `$ref` with a length sibling, `anyOf`/`oneOf` with every branch, whole-union citation, map-level `allOf` and every-branch `anyOf`, implicit true | All pass (self-test `datetime_role_authority_accepts_*`). |
| 35 refused routes: both B7 variants, each non-positive keyword as the only route, object-scope forms, partial unions, timestamp conjuncts, whole-value timestamp citations, legacy-dialect forms | All fail with `wildcard_role_review_required` and a coherent fingerprint (self-test `datetime_role_authority_refuses_*`). |
| Automatic credit | Six non-allowlisted values withheld; three clean values kept. |
| Cycle-11 and cycle-12 probes | 48 of the 48 original probes keep their exact gate outcome. 5 added probes cover the four new records and one new referenced target; all fail on their stale pins. |
| Adjacent cycle-12 checks | 14 of 14 refuse with `wildcard_role_review_required`. `irrelevant_if` and `vacuous_not` refuse with that error alone. |
| Earlier cycle-10 controls | 133 valid preloaded routes and 133 on-demand refusals; 25 scanner and inventory injections refused; 23 gate/self-test mutation pairs refused; 27 evidence attacks as expected; 21 name maps; 4 injected wildcard omissions fail against all committed Plans blobs; 23 graph controls. |

**Self-test.** Exit 0: 13372 of 13372 cases, 287 of 287 integration checks (60 added). No case changed. `datetime_battery_21_name_maps` now asserts 3 automatic and 18 reviewed rows.

**Scope.** Changed: the probe, inventory helper, inventory schema (evidence fields only), admission checks, role records, inventory, the inventory's derived exclusion pin and this report set. Unchanged by Git blob: 3774 owner Markdown files, 517 pinned product schemas, 3299 generated shard/index files, the number implementation, corpus and registry inputs, and the date-time predicates and battery. Native authority remains NOT_RUN. Guard isolation remains SWEEP_PENDING. No family is graded.

**Limits.**
- The role records are explicit human reviews: the gate binds them to exact source and value paths, but cannot prove the reviewer's judgement of a whole-value citation.
- `$dynamicRef` is resolved exactly from the row's own resource. An outer resource in another document could rebind a dynamic anchor, which this row-level proof does not model.
- The battery remains a finite trigger. A value accepting only timestamps outside its 653 samples does not fire it. This is FIX11's accepted boundary and is not changed here.

**Execution.** Checkers ran serially from fresh driver copies. Adaptations are listed in the evidence README. Full-tree checks used the retained Git Path adapter (I/O only) over all committed Plans blobs.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/results.json` | `33ff7f8a97acbc5409562e9cefbbe98fd0037e759713145a5bf1d4500f7d9687` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/tested-implementation.json` | `41e19dfed7466e253da6ca73f325b5493609c30b7a7058a3091fbb3d90157ae8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/preservation.json` | `422d43e4818aac84fb85a2718f5aeaf4016593515f0343b774f1e9a42586f534` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/row-moves.json` | `32c8e308d4f25fa429ede6f5c8088e96b930b3b80cecb6cc48cb1a967ab8f0dd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/result-assertions.json` | `5595ec433a1d9f605efd5448b04d62f3074c534c999dc48e99bcd4629f83aeda` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/coherent-bypass.json` | `d73bcc1b9a1fb0669af4a70f9b6f4555adae9123ead56ffcc64075e631fc8c4b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/adjacent-checks.json` | `a082839f21388e0d57149ff0cd863b8247d7ae2706e7358e0d28e16b992caea5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/targeted-checks.json` | `baae53493608b43b53126a3cd0867135d0dd9a7d4275e7fdd163ae986ad68ff1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/full-selftest.json` | `3e6d73d6a03fa601500568e18e50d38d73f3ac4887ac031f082121bf1aeb6aaf` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/full-confirmations.json` | `fbfa03b48b27859047ab18b91bc5f09b733dd9e14e2866dff680763cd4d12f3b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle12-replay/original-full-confirmations.json` | `21e078f5be40c7419605a5c09f5b66d9232340ab6ac3d1bbf0df0b46b9350dc6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle10-replay/evidence-attacks.json` | `7714a5e1b0fe325dd813c819d947fc14284adfa1570fa7acaea3b66e2ff174c4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle10-replay/extended-gate-integrity.json` | `2a779fc98758786201e6a4904d89dd5444ebcafa1f33b4c62b79ea1b0c2d1365` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix13/cycle10-replay/full-wildcard-gate.json` | `5ae3b6e3f6c96de9fa0bd79819335839dfd69eb2b44fc4c5b11464b75d4f0e01` |


## Number scope, review round 1: findings and responses

Scope: CV-1100, SP-1100, SP-1101, `scripts/pm_event_numbers.py`, the number corpus cases and the number sections of the adoption guide. The date-time gate stays required separately, and this round changes none of its code. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-astra-numbers.md`.

**B1 — fixed in `9b6105bb81c4ff0b8d9a62bbc6563bb35cab4f65`.**
- **Where:** `run_corpus` in `scripts/pm_event_numbers_corpus.py`, and the adoption guide.
- **Why:** the only supported self-test imported and required the date-time gate before running any number case.
- **Fix:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers`. It selects cases by `NUMBER_OPS` with no `date_time_profile`, runs the number owner checks, and imports no `pm_event_datetime*` module. It also checks that itself. The default `--scope all` is unchanged and stays authoritative for date-time. The guide's new "Number-only adoption" section gives the exact imports, owner references, packages, files and command.

| Date-time state | `--scope numbers` | `--scope all` |
|---|---|---|
| Modules absent | Exit 0, pass, 345/345 cases, 60 checks, none imported | Exit 1, `ModuleNotFoundError` |
| Every module raises at import | Exit 0, pass, 345/345 cases, none imported | Exit 1, the injected error |
| Gate imports and reports failure | Exit 0, pass, 345/345 cases, none imported | Exit 1, 0 cases passed, `NOT_RUN_ADMISSION_REFUSED` |

Number outcomes are byte-identical across all three states. In-process, under a finder that raises on any date-time import, the same selection passes with no import attempt.

**B2 — fixed in `9b6105bb81c4ff0b8d9a62bbc6563bb35cab4f65`.**
- **Where:** `jcs-decimal-undeclared`, and `qualified_jcs` in `scripts/pm_event_numbers.py`.
- **Why:** that case fails both declaration admission and kind preservation, so it could not prove either alone.
- **Fix:** `_declared_numeric_kind` holds declaration admission with no behavior change, and the new `jcs_kind_declaration` fixture op tests it alone. Preservation is explicitly outside that boundary and is not reached. `jcs-decimal-undeclared` keeps its input and refusal, and is relabelled a full-route control naming both predicates. The six preservation negatives stay. No production refusal is weakened.

| Cut | `jcs-declaration-decimal-undeclared` | `jcs-decimal-undeclared` | Preservation negatives |
|---|---|---|---|
| None | Refuses `jcs_kind_undeclared` | Refuses `jcs_kind_undeclared` | Refuse |
| Declaration only | **Accepts** | Refuses `jcs_kind` | Refuse |
| Preservation only | Refuses `jcs_kind_undeclared` | Refuses `jcs_kind_undeclared` | **6 accept** |
| Both | Accepts | **Accepts `1.5`** | 6 accept |

**B3 — fixed in `9b6105bb81c4ff0b8d9a62bbc6563bb35cab4f65`.**
- **Where:** `decode_storage_value`, whose `profile=profile` had no corpus coverage.
- **Why:** every decode case used the default EventRecord profile, so losing the profile argument changed no outcome.
- **Fix:** 6 profile-selected decoder positives and 8 single-defect negatives covering app float64 versus float32, SP-278 numeric type and range, binding binary, and an unknown profile. The EventRecord minimal-width negatives and encoding vectors are unchanged.

| Mutation | Number-only result | Cases that change |
|---|---|---|
| Decoder loses `profile=profile`, in memory | `fail`, 11 cases fail | `decode-app-float64-1.0`, `decode-app-float64-negative-zero`, `decode-app-binary`, `decode-app-float32`, `decode-binding-float32`, `decode-binding-float64`, `decode-binding-negative-fixint`, `decode-binding-int64-min`, `decode-binding-nested-negative`, `decode-binding-binary`, `decode-unknown-profile` |
| Same edit in the file, through the real CLI | Exit 1, 334/345 cases pass | The same regression |
| App float32 only | `fail` | `decode-app-float32` |
| Binding negative integer only | `fail` | `decode-binding-int64-min`, `decode-binding-negative-fixint` |
| Binding finite float only | `fail` | `decode-binding-float32`, `decode-binding-float64` |

**Corpus counts.**

| Selection | Cases | Positives | Negatives | Checks | Result |
|---|---|---|---|---|---|
| `--scope numbers` | 345 | 183 | 162 | 60 | 345/345 pass |
| `--scope all` | 13391 | 6846 | 6545 | 287 | 13391/13391 pass |

19 cases added (5 declaration, 14 decoder). One existing case relabelled, with its input and refusal unchanged. No case removed.

**Other checks rerun from the review's probe.** All 29 recorded mutations now fail the number-only corpus. All 24 RFC 8785 Appendix B vectors pass, with 2 nonfinite refusals. A live Node comparison passes for 1048 binary64 values, with 2096 physical round-trips and 377 integer boundary values. This remains a bounded check, not exhaustive isolation across all 162 negatives: guard isolation stays SWEEP_PENDING.

**Date-time gate after the corpus change.** Whole-tree gate `pass`: 233 nodes, 133 Storage + 79 other-owner + 3 automatic + 18 reviewed, 0 unclassified, across all 8,968 committed Plans blobs through the Path I/O adapter. A corpus edit requires one data update there: the corpus row's content pin in `scripts/pm_event_datetime_exclusions.json`. Nothing else in that file changed.

**Limits.**
- `--scope numbers` says nothing about date-time, and a retained verifier that selects a date-time profile needs both scopes.
- The reference adapters are not native authority: native custody, durability and family admission remain NOT_RUN.
- The owner units still name `--self-test`, which stays the complete test. They were not edited.

**Scope.** Changed: `scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, the corpus, that one content pin and the report set. Unchanged by Git blob: 3774 owner Markdown files, 517 pinned product schemas, 3299 generated shard/index files, all date-time code and the inventory, the binding helper, the registry, and the governance inputs.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/results.json` | `f34a1fde0d8e8cde3854c4054b652a2e645858f6513d65f8d0afb9cb9a576b76` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/tested-implementation.json` | `f40bc3f0994bf09e7f7c1da11bb35221c526b9f3fe8b0b2162b9c71fa15094b7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/preservation.json` | `89b672b1a15349d30ef0448f2f27d0261e69cb97c16704ac77073d1f474e99a6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/probe_numbers.py` | `b5a099dc4a65a2e017ae9087f5acd7ab1262c77ea8671fec35232a2faee8d55c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/probe-results.json` | `c318ff4e5b2a394ad5d7d3769893fa4d1fe50fb0e3ca69e86643f89692e5a5ad` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/full-selftest.json` | `723f915da4d9d86201d5c6a1b93601a7c9d6c52ab054b68ee1184195627cdda4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix1/full-selftest-inventory.json` | `722bc301bfe0bb19664681d523d87698c824e96bc907119d7719c913df37d5a0` |


## Opus pre-check cycle 13: notes and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-cycle13-opus.md`, a blind pre-check (not a gate) of `45a6ccde933e52635c6eda7d9e82921cf66622b5`. It rated the date-time scope LANDING_READY_WITH_NOTES, with no blocker. Both date-time notes are fixed in `a5ae4fc90b6da25efd00350e120291975268a401`. The number scope and its note N3 are under their own gate; no number-scope file changed.

**N1 — a citation must decide the string: fixed.**
- **Where:** `_PositivePaths` and `reviewed_role` in `scripts/pm_event_datetime_value_probe.py`.
- **Why it broke:** the allowlist proves that every accepted value satisfies the cited definition. It did not prove the definition says anything about a string. The value `allOf: [{pattern: ^(TS|a)$}, {$ref: SafeDoc}]`, with `SafeDoc` holding only a description, earned `wildcard_non_timestamp_role`. So did a member-only definition, a `dependentSchemas` conjunct and the whole value cited directly. The only barrier left was the 16-string timestamp-only guard, which accepting `"a"` evades. The pre-check's coherent full gate exited 0.
- **Fix:** the deciding rule. Each proven value node runs on its own through the real validator of its dialect, in the same closed graph, against all 653 battery samples and the 16 fixed control strings. It decides the string only if it refuses all 669. The probe records the result as `value_evidence.deciding_nodes`. A `wildcard_non_timestamp_role` record now needs its citation on every field's positive endpoints and in `deciding_nodes`. Otherwise it earns no credit, and the row fails `wildcard_role_review_required`.
- **Implicit endpoints:** an absent `additionalProperties` is the unconstrained true schema. It never decides, even when the same map node is also reached as a value node for another field.
- **Timestamp reviews:** `other_owner_observation` claims no exemption, so the deciding rule does not apply to it.

**What N1 implies.** Through a positive path every accepted value satisfies the citation. A deciding citation refuses every battery timestamp, so the value does too. A non-timestamp role is therefore credited only where the value refuses every battery timestamp.

FIX11's final rule also let a timestamp-accepting generic grammar (a resource string, SafeRef) be `wildcard_non_timestamp_role`. That option is gone. Such a row is an explicit timestamp review, `other_owner_observation`. Runtime treatment is the same: both classes carry `profile: owner_schema`, which keeps the owner's original validation and installs no timestamp overlay. The timestamp-only guard and the timestamp-accepting checks stay, as a second and independent refusal.

**N2 — `$dynamicRef` rebinding: fixed.**
- **Where:** `REFERENCES`, used by `_PositivePaths._map` and `_PositivePaths._value`.
- **Why:** a `$dynamicRef` target depends on the dynamic scope of each evaluation. An outer document can `$ref` the map and bind the same `$dynamicAnchor` to a timestamp pattern. That changes what the field accepts, so a row-level proof through `$dynamicRef` does not hold. The pre-check's witness earned automatic `wildcard_non_timestamp` with no review.
- **Fix:** `$dynamicRef` leaves the allowlist. It is recorded in `role_authority[].unproven`, withholds automatic credit and routes to `wildcard_role_review_required`. Discovery still follows it to preload the resolver.
- **Rows:** no committed Plans file uses `$dynamicRef`, `$dynamicAnchor`, `$recursiveRef` or `$recursiveAnchor` (`git grep` exit 1). No row moved for N2.

**Rows moved (10 of 233): explicit non-timestamp role → explicit owner-schema review.** Each record keeps its node, value-schema fingerprint, role name and citation. Only `classification` (now `other_owner_observation`) and `reason` changed. No row became automatic, and none was relabelled to keep role credit.

| Row | Role | Cited definition | Why it does not decide the string |
|---|---|---|---|
| `section15_browser_program_contracts.schema.json` `/$defs/browser_program_result_validation/properties/result_schema_resources` | `schema_resource_string` | `/$defs/browser_program_result_validation/properties/result_schema_resources/additionalProperties` | Cited definition accepts 653 of 653 battery timestamps and 15 of 16 fixed strings. |
| `CAPABILITY_OBLIGATION_GRAPH.schema.json` `/$defs/common_node/properties/payload` | `arbitrary_graph_payload` | `/$defs/common_node/properties/payload` | Implicit true `additionalProperties`: accepts every string. |
| `settings_system_contracts.schema.json` `/$defs/setting_value/oneOf/5` | `setting_value` | `/$defs/setting_value` | Cited definition accepts 653 of 653 battery timestamps and 16 of 16 fixed strings. |
| `settings_system_contracts.schema.json` `/$defs/values_by_setting_id` | `setting_value` | `/$defs/setting_value` | Cited definition accepts 653 of 653 battery timestamps and 16 of 16 fixed strings. The map itself refuses every sample, through its setting_id key grammar, but its member keywords withhold automatic credit. |
| `shared_integration_runtime_expansion_contracts.schema.json` `/$defs/TargetRefs` | `SafeRef` | `/$defs/SafeRef` | Cited definition accepts 592 of 653 battery timestamps and 14 of 16 fixed strings. |
| `shared_integration_runtime_expansion_contracts.schema.json` `/$defs/SafeParameters` | `safe_parameter_value` | `/$defs/SafeParameters/additionalProperties` | Cited definition accepts 592 of 653 battery timestamps and 14 of 16 fixed strings. |
| `shared_integration_runtime_expansion_contracts.schema.json (input copy)` `/$defs/TargetRefs` | `SafeRef` | `/$defs/SafeRef` | Cited definition accepts 592 of 653 battery timestamps and 14 of 16 fixed strings. |
| `shared_integration_runtime_expansion_contracts.schema.json (input copy)` `/$defs/SafeParameters` | `safe_parameter_value` | `/$defs/SafeParameters/additionalProperties` | Cited definition accepts 592 of 653 battery timestamps and 14 of 16 fixed strings. |
| `shared_integration_runtime_expansion_contracts.schema.json (predecessor copy)` `/$defs/TargetRefs` | `SafeRef` | `/$defs/SafeRef` | Cited definition accepts 592 of 653 battery timestamps and 14 of 16 fixed strings. |
| `shared_integration_runtime_expansion_contracts.schema.json (predecessor copy)` `/$defs/SafeParameters` | `safe_parameter_value` | `/$defs/SafeParameters/additionalProperties` | Cited definition accepts 592 of 653 battery timestamps and 14 of 16 fixed strings. |

**Rows kept (8).** Five resolved-permission maps, two tab maps and one settled-effect map keep `wildcard_non_timestamp_role`. Their object-valued citations refuse all 669 strings.

**Totals.** 233 row keys unchanged: 133 Storage + 89 other-owner + 3 automatic non-timestamp + 8 explicit roles, 0 unclassified. The 89 other-owner rows include the ten reviewed observations and the source-lineage patch. Only `classification` (10 rows) and `value_evidence` (21 wildcard rows) changed. Every wildcard row gains `deciding_nodes`, and the ten moved rows also carry their new `reviewed_role`. The 18 role pins are unchanged.

**Pre-check replay (fresh copies of its scripts; inputs unchanged).** All 51 attack cases are as expected: 47 refuse, three deciding controls are accepted, and one timestamp-accepting value with no record passes as `other_owner_observation`. Expectations moved only where N1 changes the outcome:

| Case | Pre-check outcome | Now | Why |
|---|---|---|---|
| `vacuous/doc_only_conjunct_stamp_a`, `member_only_conjunct_stamp_a`, `dependentSchemas_node_stamp_a`, `whole_value_cite_stamp_a` | accepted as role | refused, `wildcard_role_review_required` | The citation does not decide the string. |
| `oneOf_unsat/both_carry_language_empty` | accepted (empty language) | refused | Its SafeRef (`^[a-z]+$`) accepts the control `"a"`. |
| `control/direct_ref`, `allOf_ref`, `every_branch_union` | accepted as role | refused | `Gen` (any 1–512-character string) accepts every battery timestamp. |
| `control_deciding/direct_ref`, `allOf_ref`, `every_branch_union` (added) | — | accepted as role | The same routes, citing `Gen` restricted to `^ref:[a-z]+$`. |

**Coherent full gates.** Each attack record has a fingerprint recomputed from source. Each inventory is re-projected and its exclusion pin recomputed from source. Each runs through the unchanged full gate over every committed Plans blob.

| Input | Before (pre-check) | Now | Errors |
|---|---|---|---|
| N1 witness: description-only conjunct, timestamp-or-`"a"` | full gate exit 0 | exit 1 | `wildcard_role_review_required` |
| member-only conjunct | accepted as role (one-row validation) | exit 1 | `wildcard_role_review_required` |
| `dependentSchemas` conjunct | accepted as role (one-row validation) | exit 1 | `wildcard_role_review_required` |
| whole timestamp-or-`"a"` value cited | accepted as role (one-row validation) | exit 1 | `wildcard_role_review_required` |
| cycle-12 `irrelevant_if` | full gate exit 1 | exit 1 | `wildcard_role_review_required` |
| cycle-12 `vacuous_not` | full gate exit 1 | exit 1 | `wildcard_role_review_required` |
| N2 witness, no record | automatic credit, no error (one-row validation) | exit 1 | `wildcard_role_review_required` |

For each of the six record-bearing inputs, the production `datetime_validator` refuses with `DatetimeAdmissionError: datetime_inventory_invalid`. The literal cycle-12 `coherent-bypass-input.json` (its own roles, inventory and pin) also fails: exit 1, with 84 `inventory_schema` errors from its obsolete evidence format. As in the earlier rounds, the coherent runs above, not this literal one, prove the repair.

**N2 witness.** The pre-check's map, with value `{$dynamicRef: '#v'}` bound to a lowercase grammar, is now `wildcard_review_required`: `automatic_credit` false and `$dynamicRef` unproven. Through an outer document that rebinds `v`, the same field still accepts `2026-01-01T00:00:00Z` and refuses `abc`. That is why it gets no credit.

**Cycle-11 and cycle-12 replays (FIX13's drivers, fresh copies).**
- **Targeted probes:** 48 of the 48 original probes keep their exact gate outcome, and the 5 added in round 13 still fail on their stale pins (53 total).
- **Adjacent checks:** 14 of 14 refuse with `wildcard_role_review_required`. `irrelevant_if` and `vacuous_not` refuse with that error alone.
- **Full gates:** both coherent B7 variants exit 1. The sibling and foreign-key full gates exit 1. All three literal earlier inputs exit 1.
- **Pin audit:** the committed pin equals the source recomputation, and a false classification cannot authenticate itself.

**Self-test controls.** Every legitimate route still passes, now with a citation that decides the string: direct, `$ref`, `allOf`, `$ref` with a length sibling, every-branch `anyOf`/`oneOf`, whole union, map-level `allOf`, every-branch map `anyOf`, and a new object-record citation. Each accept check also asserts that the citation is in `deciding_nodes`. Changes:

| Check | Change |
|---|---|
| `datetime_role_authority_refuses_undecided_*` (11, added) | The N1 witnesses (description-only conjunct with and without `"a"`, member-only conjunct, `dependentSchemas` conjunct, whole timestamp-or-`"a"` value), implicit true, an implicit endpoint shadowed by a value node, a generic string by `$ref` and in a whole union, the setting_value shape, and a timestamp-refusing grammar that accepts `"a"`. Each must refuse, and its citation must be a positive endpoint for every field, so the path rule alone would have accepted it. |
| `datetime_role_authority_refuses_dynamicRef` (moved from `accepts_dynamicRef`) | N2. The anchored target decides the string, so the dynamic reference is the only reason for the refusal. |
| `datetime_automatic_credit_withheld_dynamicRef` (added) | The pre-check's N2 witness. |
| `datetime_role_authority_accepts_implicit_true` (removed) | An implicit true value decides nothing. It is now `refuses_undecided_implicit_true`. |
| `datetime_role_authority_accepts_object_record` (added) | An object-valued citation with member keywords, the shape of the eight kept roles. |
| `datetime_role_authority_member_keywords_in_cited_definition` | Now an object/array union. The old string-branch shape is `refuses_undecided_setting_value_shape`. |
| Path-rule refusals and the B6 value-path controls | They cite a SafeRef that decides the string (`^ref:[a-z]+$`), so each refusal still comes from the path rule alone. |
| `datetime_battery_21_name_maps` | Asserts 3 automatic, 8 roles whose citations decide, and 10 reviewed observations. |

**Mutation controls.** Each FIX14 guard was reverted in a scratch copy of the scripts, and the unchanged authority checks were run:

| Reverted guard | Checks that then fail |
|---|---|
| n1 deciding check removed | `refuses_undecided_accepts_one_control`, `refuses_undecided_dependentSchemas_conjunct`, `refuses_undecided_doc_only_conjunct`, `refuses_undecided_generic_ref`, `refuses_undecided_generic_whole_union`, `refuses_undecided_implicit_shadowed_by_value_node`, `refuses_undecided_implicit_true`, `refuses_undecided_member_only_conjunct`, `refuses_undecided_setting_value_shape`, `refuses_undecided_whole_value_stamp_a` |
| implicit exclusion removed | `refuses_undecided_implicit_shadowed_by_value_node` |
| dynamicRef back in allowlist | `automatic_credit_withheld_dynamicRef`, `refuses_dynamicRef` |

**Self-test.** `full_git_checks.py selftest` runs the unchanged `run_corpus` (`--scope all`) over all 8968 committed Plans blobs at `a5ae4fc90b` through the Path I/O adapter. Exit 0: 13391 of 13391 cases, 299 of 299 integration checks (12 net added), date-time gate `pass`. No corpus case changed.

**Guide.** In `NUMRULE-ADOPTION.md`, the role paragraph now:
- names the eight roles and the ten reviewed observations;
- drops `$dynamicRef` from the allowlist;
- states the deciding rule;
- says that a positive path proves conjunction only;
- says that the battery and the 16 fixed strings are finite, refusal-only tests (the pre-check's wording note).

**Scope.** Changed: the probe, admission checks, the inventory schema (one evidence field, `deciding_nodes`), the classification and reason of ten role records, inventory evidence and its derived exclusion pin, and this report set. Every other path, including every number-scope file (`scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, the number corpus and the number sections of the guide), owner prose, registry, Decision Log, Spec Lock, `.evidence` and `.gitignore`, is unchanged by Git object ID. Native authority remains NOT_RUN. Guard isolation remains SWEEP_PENDING. No family is graded.

**Limits.**
- The deciding rule is finite: 653 battery samples and 16 strings. It can only withhold credit. A citation that refuses all 669 but accepts a timestamp form outside the battery passes it. Its value then refuses every battery sample, which is the same boundary as automatic credit (FIX11).
- Deciding uses the dialect `_PositivePaths` tracks at the node: its own `$schema`, or the referrer's.
- The eight remaining roles are still human reviews of object-valued maps. The gate binds them to exact source and value paths but does not prove the reviewer's judgement.
- Not rerun: the cycle-10 replay suite, which this brief does not list. Its last run is `drafts/NUMRULE/fix13/cycle10-replay`.

**Execution.** Checkers ran serially from fresh driver copies on a `git archive` extraction of the 102 cycle-12 inputs at `a5ae4fc90b`, each file checked against its Git blob. Every start had at least 6 GiB available. Adaptations are listed in the evidence README. Two harness errors (a relative input path, and a comment that ended a statement) stopped the literal-bypass driver before its gate ran. They are retained in `harness-errors/`, and the campaign resumed after a scratch-integrity check.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/results.json` | `901d3b0eac31ab92c2bd2059485c5a6c283db3ef6ebbdc7ddf9b5d561c2ecf89` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/row-moves.json` | `65fe597e65ba4260140f14ef7d26be099b31e4032ae07621a973c0a71cb146d7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/citation-measure.json` | `24433eed0e500fd5cae8c55af1ad542198b6e99bf6b3f21e0ac62953e6d3994f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/mutation.json` | `84daba6428dd1f863581175b0b5594bf222383072e73b374050a8d30814850c7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/preservation-a5ae4fc90b.json` | `31f21d1d2f14c8a941b4a19d1d434df02de7fb9e0234bc3a9f0f2437f280b53b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/campaign.json` | `16995ca81f04f9da3ed29b718a8f11edb470713fb875320407584b11d62354ae` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/precheck-replay/precheck-assertions.json` | `e904830f3ca3d19fa3f6ef120ffebec3108c6b91b08edff41d96c061490fc000` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/precheck-replay/attacks.json` | `eea36566c329b7fd1665e4cd62e5a42aa99862cb877b15018fe6b349937b9cd6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/precheck-replay/dynamic-ref.json` | `2c8882bb71c54c37663a8d504cc8afbfb0131f4a68516fe5780be6e3b3bbcfe5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/precheck-replay/vacuous_doc_only-setup.json` | `3542e7ede57443b20eeabdd99b8a77530affb5c2c14bfabb3e8e87bf523a1840` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/precheck-replay/n2-full-gate-setup.json` | `007b797dde4ea8e377e94303ef55b79bfee09977a1804554d0771dd0cd33b1c9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/precheck-replay/literal-coherent-bypass.json` | `5f282a51b8893356d7f634674049580b15b593d9b8af00be86810bfd520d2e4d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/cycle12-replay/result-assertions.json` | `d77996f60a0bb60fcc32df224839160b85d1eba263234ac6ddf06c42214e753e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/cycle12-replay/targeted-checks.json` | `6a0f3de7ad27b69c83f2b527697c2c603cc983196d60ad1278e4bb16e8baa578` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/cycle12-replay/adjacent-checks.json` | `a082839f21388e0d57149ff0cd863b8247d7ae2706e7358e0d28e16b992caea5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/cycle12-replay/coherent-bypass.json` | `62695716a6ed3ed11ced962dca239b885ef5b78dc95a5390b015a8b493783545` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/cycle12-replay/full-selftest.json` | `023f122502e4ff2417b5b33eb4ee8193045f4e1249c1e078cec56c597d35de32` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix14/cycle12-replay/full-selftest-inventory.json` | `920e17992b18ca7bec8c55e2bbb9dbc29cd4a338b04302ef1a28957446e2cdba` |


## Number gate (Sol max): findings and responses

Scope: CV-1100, SP-1100, SP-1101, `scripts/pm_event_numbers.py`, the number corpus, its runner and the number sections of the adoption guide. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-numbers-gate-solmax.md` (NOT_READY, B1 and B2, at `45a6ccde933e52635c6eda7d9e82921cf66622b5`). No date-time code changed, and no number recipe's production behaviour changed: every edit is to the corpus, its runner, the CLI flag and the mutation set.

Implementation commit `f9bd0abf922e0bf19e689e2315bedecae06696d7` is the tested `19be90befcdc7d84eb900b64010348679dc8eb14` rebased onto `85b0ca7ece` (FIX14's date-time round). Every number file is blob-identical between the two, so the number-scope runs below apply to it unchanged; `--scope all` was rerun on the rebased tree.

Both findings were one kind of hole. The corpus checked the helper against itself (it accepts, or it changes when a field changes), never against an independent expected result, so a wrong but self-consistent helper passed. This round closes the class, not only the five mutations: every public number API now has an independent output oracle, and the corpus proves it catches wrong implementations.

**B1 — fixed in `f9bd0abf922e0bf19e689e2315bedecae06696d7`.**
- **Where:** `current-large-exact` and the `current_json` executor in `scripts/pm_event_numbers_corpus.py`; the parser is `loads_current_json` with `current_integer` in `scripts/pm_event_numbers.py`.
- **Why:** the executor discarded the returned tree and reported only `accepted`, so a rounded or float integer passed.
- **Fix:**
  - **Returns oracle, whole class:** every positive of an API that returns a value carries `returns`, the exact type-aware value (`{"@int": "<digits>"}`, `{"@parsed_decimal": ..., "kind": ...}`, `{"@json_number": ...}`, `{"@object": ...}`). The runner compares it through `typed()`, which never calls the helper and accepts only exact built-in types. A positive of such an API without `returns` fails. 102 existing positives gained one; every new positive has one.
  - **Current parser:** 15 new cases. `current-nested-exact-types` checks the exact nested tree: `2^53+1`, uint64 max, `-(2^53+1)`, `2^100+1`, `0`, `-1`, and fraction/exponent tokens kept as `ParsedDecimal` with their kind. `current-numeric-kinds-declared` checks schema-declared kinds by path. `current-logical-integer-4400-digits` parses a 4400-digit integer each way (above Python's default integer-string limit; no global cap).
  - **Subsequent integer slot:** `current_json_slot` runs the documented sequence, `loads_current_json` then `current_integer` at the slot. Bounds sit on both sides of the exact value: `2^53+1` with maximum `2^53+1` and with minimum `2^53+1` are accepted, maximum `2^53` is refused `integer_range`; uint64 max inside `0..2^64-1` is accepted and `2^64` refused. A rounded value fails the first two, a float fails as `integer_type`.
  - **Separate refusals kept:** fraction (`1.0`, `9007199254740993.0`), exponent (`1e0`), type (`"1"`, `true`) and zero (`-0`, refused `integer_token`) are each a single-defect slot negative.

**B2 — fixed in `f9bd0abf922e0bf19e689e2315bedecae06696d7`.**
- **Where:** `number_integration_checks` in `scripts/pm_event_numbers_corpus.py` compared producer digests only with each other, and called `qualified_jcs` directly for the endpoints. There was no producer case op.
- **Why:** no observation compared `producer_semantic_bytes` or `producer_semantic_digest` with an independent result, so a substituted serializer, a dropped qualification or a wrong hash passed.
- **Fix:** the `producer` case op calls the actual wrappers on the frozen base event. 28 cases, each on both routes where it applies:
  - **Known answers:** expected JCS text and SHA-256 come from Node's ECMAScript `JSON.stringify` with UTF-16 key order over an independently transcribed CV-317 field list, never from the helper. The review's preimage (integral, fractional and exponent floats, BMP and supplementary keys) gives `a2e019f1b0e9d842cb4577196da7ca6024ef6ce1158df557858ff93914567416`, the review's own answer. The base event, `2^53`, and changed Storage-only fields (same digest as the base) are vectors too.
  - **Wrapper endpoints:** `2^53` accepted; `2^60` refused `jcs_decimal` (single defect); `2^53+1` and uint64 max refused `jcs_binary64`, labelled `full_route_predicates` endpoint controls because they fail both binary64 and decimal equality.
  - **Forwarding:** `type_sensitive_paths` (`1.0` refused `jcs_kind`, `1.5` accepted), `sign_sensitive_paths` (`-0.0` refused `jcs_sign`) and `numeric_kinds` (declared Decimal accepted; undeclared refused `jcs_kind_undeclared`, a labelled two-predicate control). Unqualified controls show the same inputs pass without the qualification. A missing projection field is refused `producer_projection`.
  - **Kept:** CV-317's projection and hash are unchanged. The existing exact projection and exclusion checks stay; the owner checks now record a raising helper as a failed check instead of aborting the run.

**Whole class — self-checking corpus.**
- **Mutation set:** `scripts/pm_event_numbers_mutations.json`, 121 fixed mutations, each one exact source edit applied in memory to a fresh module (files are never written). It covers the 25 APIs in the adoption guide's import block and seven classes: value rounding, type coercion, dropped qualification argument, substituted serializer, wrong hash, removed refusal, off-by-one boundary, plus substituted profile identifiers. It includes the review's five mutations verbatim and its sixth (decoder profile loss).
- **Command:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers --mutations`. Exit 0 means: the intact corpus passes; each (API, class) cell has a mutation or a stated not-applicable reason; each mutation applies exactly once and fails the number corpus; and each declared survivor really survives. `--mutations` with `--scope all` is refused (exit 2).
- **Result:** exit 0; 121 mutations, **120 caught, 1 survivor** (declared, below), 0 not applied, 0 runner exceptions; 83 not-applicable cells, each with a reason. The review's 6 mutations: 6 caught.
- **Against the reviewed base:** the same 121 mutations on `45a6ccde93`'s corpus and runner: 79 caught, **42 missed**. This round's oracles catch 41 of those 42; the other is the declared survivor.
- **Harness controls:** a false survivor declaration, a no-op mutation, an uncovered cell, a positive without `returns` and a wrong `returns` each give exit 1.
- **Standalone (T8):** no program path. The number-only, `--mutations` and control runs are fresh processes started from an unrelated directory, on an extraction holding only the four number scripts, the mutation set and the three data files, with msgpack 1.1.2 (wheel SHA-256 `180759d8...`, as in the review). The date-time modules were absent; with them present and raising at import, `--scope numbers` and `--mutations` give the same result, and number outcomes are byte-identical.

**Mutation table.** Result is the number corpus under that mutation; Base is the reviewed `45a6ccde93` corpus.

| API | Class | Mutation | Result | Base |
|---|---|---|---|---|
| `loads_current_json` | value rounding | `review-current-parser-rounded-int` (review) | Caught: 8 cases (`current-large-exact`) | **missed** |
| `loads_current_json` | type coercion | `review-current-parser-float` (review) | Caught: 9 cases (`current-large-exact`) | **missed** |
| `producer_semantic_bytes` | substituted serializer | `review-producer-json` (review) | Caught: 18 cases (`producer-2^53+1-bytes`) | **missed** |
| `producer_semantic_digest` | wrong hash | `review-producer-sha512` (review) | Caught: 6 cases (`producer-2^53-digest`) | **missed** |
| `producer_semantic_bytes` | dropped qualification | `review-producer-drops-qualification` (review) | Caught: 6 cases (`producer-numeric-kind-undeclared-bytes`) | **missed** |
| `decode_storage_value` | dropped qualification | `review-decoder-profile-loss` (review) | Caught: 11 cases (`decode-app-binary`) | caught |
| `current_integer_token` | value rounding | `token-rounds-through-binary64` | Caught: 14 cases (`current-large-exact`) | caught |
| `current_integer_token` | type coercion | `token-returns-float` | Caught: 27 cases (`current-large-exact`) | caught |
| `current_integer_token` | dropped qualification | `token-drops-bounds` | Caught: 3 cases (`slot-above-maximum`) | **missed** |
| `current_integer_token` | substituted serializer | `token-int-parser` | Caught: 2 cases (`current-logical-integer-4400-digits`) | caught |
| `current_integer_token` | removed refusal | `token-no-grammar` | Caught: 14 cases (`bad-token-' 1'`) | caught |
| `current_integer_token` | off by one boundary | `token-grammar-leading-zero` | Caught: 5 cases (`bad-token-'-0'`) | caught |
| `current_integer_token` | off by one boundary | `token-chunk-width` | Caught: 107 cases (`binding-18446744073709551615`) | caught |
| `current_integer` | value rounding | `integer-rounds-through-binary64` | Caught: 34 cases (`current-large-exact`) | caught |
| `current_integer` | type coercion | `integer-isinstance` | Caught: 5 cases (`current-slot-type-boolean`) | caught |
| `current_integer` | type coercion | `integer-returns-float` | Caught: 90 cases (`current-large-exact`) | caught |
| `current_integer` | dropped qualification | `integer-json-number-drops-bounds` | Caught: 2 cases (`slot-above-maximum`) | **missed** |
| `current_integer` | removed refusal | `integer-no-fraction-type-refusal` | Caught: 5 cases (`slot--0.0`) | caught |
| `current_integer` | removed refusal | `integer-no-minimum` | Caught: 4 cases (`payload-negative-size`) | caught |
| `current_integer` | off by one boundary | `integer-maximum-exclusive` | Caught: 14 cases (`current-slot-2^53+1-maximum-equal`) | caught |
| `current_integer` | off by one boundary | `integer-minimum-exclusive` | Caught: 3 cases (`current-slot-2^53+1-minimum-equal`) | **missed** |
| `storage_uint64` | value rounding | `uint64-rounds-through-binary64` | Caught: 20 cases (`metadata-byte_offset-18446744073709551615`) | **missed** |
| `storage_uint64` | type coercion | `uint64-returns-float` | Caught: 61 cases (`metadata-byte_offset-1152921504606846976`) | **missed** |
| `storage_uint64` | dropped qualification | `uint64-drops-bounds` | Caught: 2 cases (`uint64-overflow--1`) | caught |
| `storage_uint64` | removed refusal | `uint64-no-upper-refusal` | Caught: 1 case (`uint64-overflow-18446744073709551616`) | caught |
| `storage_uint64` | off by one boundary | `uint64-maximum-minus-one` | Caught: 10 cases (`metadata-byte_offset-18446744073709551615`) | caught |
| `storage_uint64` | off by one boundary | `uint64-minimum-one` | Caught: 1 case (`uint64-zero`) | **missed** |
| `exact_boolean` | type coercion | `boolean-isinstance-int` | Caught: 3 cases (`bool-number`) | caught |
| `exact_boolean` | type coercion | `boolean-returns-int` | Caught: 2 cases (`bool-ok-False`) | **missed** |
| `exact_boolean` | removed refusal | `boolean-no-refusal` | Caught: 8 cases (`bool-array`) | caught |
| `current_append_policy` | removed refusal | `append-policy-no-replay-only-refusal` | Caught: 1 case (`append-replay-only`) | caught |
| `current_append_policy` | removed refusal | `append-policy-no-membership` | Caught: 1 case (`append-unknown-policy`) | caught |
| `current_append_policy` | type coercion | `append-policy-returns-bytes` | Caught: 3 cases (`append-append_once`) | caught |
| `current_append_policy` | type coercion | `append-policy-no-type-check` | **Survives (declared):** Equivalent at every JSON-expressible input: membership in a tuple of exact str values already refuses every non-str JSON value with the same replay_policy reason. Only a str subclass instance distinguishes the two, and the JSON corpus cannot express one. | **missed** |
| `loads_exact` | value rounding | `parse-int-rounds-through-binary64` | Caught: 19 cases (`current-large-exact`) | caught |
| `loads_exact` | type coercion | `parse-float-native` | Caught: 14 cases (`current-nested-exact-types`) | caught |
| `loads_exact` | dropped qualification | `parse-drops-duplicate-hook` | Caught: 1 case (`duplicate-json`) | caught |
| `loads_exact` | dropped qualification | `parse-drops-nonfinite-hook` | Caught: 3 cases (`parse--Infinity`) | caught |
| `loads_exact` | substituted serializer | `parse-latin1-decoder` | Caught: 2 cases (`parse-invalid-utf8-bytes`) | **missed** |
| `loads_exact` | removed refusal | `parse-no-scalar-walk` | Caught: 2 cases (`parse-key-lone-surrogate`) | caught |
| `loads_exact` | removed refusal | `parse-keys-not-walked` | Caught: 1 case (`parse-key-lone-surrogate`) | **missed** |
| `loads_current_json` | dropped qualification | `current-drops-numeric-kinds` | Caught: 1 case (`current-numeric-kinds-declared`) | **missed** |
| `loads_current_json` | substituted serializer | `current-plain-json-parser` | Caught: 5 cases (`current-logical-integer-4400-digits`) | caught |
| `loads_current_json` | removed refusal | `current-no-integer-token-refusal` | Caught: 2 cases (`current-nested-minuszero`) | caught |
| `loads_current_json` | off by one boundary | `current-array-path-off-by-one` | Caught: 1 case (`current-numeric-kinds-declared`) | **missed** |
| `qualified_jcs` | value rounding | `jcs-output-rounds-15-digits` | Caught: 7 cases (`jcs--9007199254740992`) | caught |
| `qualified_jcs` | type coercion | `jcs-boolean-as-integer` | Caught: 1 case (`jcs-boolean-null`) | **missed** |
| `qualified_jcs` | dropped qualification | `jcs-drops-numeric-kinds` | Caught: 8 cases (`jcs-decimal-kind-1.0`) | caught |
| `qualified_jcs` | dropped qualification | `jcs-drops-sign-paths` | Caught: 5 cases (`jcs-sign-loss-current`) | caught |
| `qualified_jcs` | substituted serializer | `jcs-python-json` | Caught: 22 cases (`jcs--0`) | caught |
| `qualified_jcs` | removed refusal | `jcs-no-decimal-refusal` | Caught: 8 cases (`jcs--1152921504606846976`) | caught |
| `qualified_jcs` | removed refusal | `jcs-no-binary64-refusal` | Caught: 6 cases (`jcs-binary64-only-10^23`), 2 checks (`full_jcs_endpoint_refusal_9007199254740993`) | caught |
| `qualified_jcs` | off by one boundary | `jcs-binary64-tolerance-one` | Caught: 4 cases (`producer-2^53+1-bytes`), 2 checks (`full_jcs_endpoint_refusal_9007199254740993`) | caught |
| `producer_semantic_bytes` | value rounding | `producer-rounds-integers` | Caught: 6 cases (`producer-2^53+1-bytes`) | **missed** |
| `producer_semantic_bytes` | type coercion | `producer-stringifies-integers` | Caught: 8 cases (`producer-2^53+1-bytes`) | **missed** |
| `producer_semantic_bytes` | dropped qualification | `producer-drops-sign-qualification` | Caught: 2 cases (`producer-sign-qualified-negative-zero-bytes`) | **missed** |
| `producer_semantic_bytes` | removed refusal | `producer-no-projection-refusal` | Caught: 2 cases (`producer-missing-migration-bytes`), 12 checks (`producer_requires_present_event_type`) | caught |
| `producer_semantic_bytes` | off by one boundary | `producer-drops-last-field` | Caught: 14 cases (`producer-2^53-bytes`), 1 check (`producer_includes_migration`) | caught |
| `producer_semantic_digest` | type coercion | `digest-returns-bytes` | Caught: 6 cases (`producer-2^53-digest`) | **missed** |
| `producer_semantic_digest` | dropped qualification | `digest-drops-qualification` | Caught: 3 cases (`producer-numeric-kind-undeclared-digest`) | **missed** |
| `producer_semantic_digest` | substituted serializer | `digest-python-json` | Caught: 9 cases (`producer-2^53+1-digest`), 12 checks (`producer_requires_present_event_type`) | caught |
| `producer_semantic_digest` | wrong hash | `digest-sha3-256` | Caught: 6 cases (`producer-2^53-digest`) | **missed** |
| `producer_semantic_digest` | wrong hash | `digest-blake2s` | Caught: 6 cases (`producer-2^53-digest`) | **missed** |
| `producer_semantic_digest` | removed refusal | `digest-swallows-refusal` | Caught: 7 cases (`producer-2^53+1-digest`), 12 checks (`producer_requires_present_event_type`) | caught |
| `producer_semantic_digest` | off by one boundary | `digest-truncated` | Caught: 6 cases (`producer-2^53-digest`) | **missed** |
| `storage_value_bytes` | value rounding | `physical-lossy-float32` | Caught: 4 cases (`decode-float64-0.1`) | caught |
| `storage_value_bytes` | type coercion | `physical-bool-as-integer` | Caught: 4 cases (`decode-bool-nil`) | **missed** |
| `storage_value_bytes` | dropped qualification | `physical-float32-ignores-profile` | Caught: 7 cases (`app-float--0.0`) | caught |
| `storage_value_bytes` | dropped qualification | `physical-binary-ignores-profile` | Caught: 2 cases (`decode-binary`) | caught |
| `storage_value_bytes` | substituted serializer | `physical-msgpack-packb` | Caught: 20 cases (`decode-binary`), 2 checks (`frozen_complete_event_bytes`) | caught |
| `storage_value_bytes` | substituted serializer | `physical-insertion-order-maps` | Caught: 3 cases (`decode-unordered-map`), 2 checks (`frozen_complete_event_bytes`) | caught |
| `storage_value_bytes` | removed refusal | `physical-no-integer-range-refusal` | Caught: 2 cases (`physical-overflow--9223372036854775809`) | caught |
| `storage_value_bytes` | off by one boundary | `physical-negative-fixint-boundary` | Caught: 1 case (`physical-int--33`) | caught |
| `storage_value_bytes` | off by one boundary | `physical-int8-boundary` | Caught: 1 case (`physical-int--129`) | caught |
| `storage_value_bytes` | off by one boundary | `binding-fixstr-boundary` | Caught: 1 case (`physical-str-32`) | **missed** |
| `decode_storage_value` | value rounding | `decode-rounds-floats` | Caught: 5 cases (`decode-app-float64-1.0`) | **missed** |
| `decode_storage_value` | type coercion | `decode-raw-strings` | Caught: 5 cases (`decode-binding-map`), 1 check (`frozen_complete_event_decode`) | caught |
| `decode_storage_value` | substituted serializer | `decode-msgpack-canonical-check` | Caught: 14 cases (`decode-binary`) | caught |
| `decode_storage_value` | removed refusal | `decode-no-canonical-refusal` | Caught: 15 cases (`decode-app-float32`) | caught |
| `decode_storage_value` | removed refusal | `decode-no-ext-refusal` | Caught: 1 case (`decode-extension`) | caught |
| `full_value_commitment` | type coercion | `full-value-returns-bytes` | Caught: 1 case (`full-value-frozen-positive`), 1 check (`frozen_full_value_commitment`) | caught |
| `full_value_commitment` | dropped qualification | `full-value-drops-profile-id` | Caught: 1 case (`full-value-frozen-positive`), 1 check (`frozen_full_value_commitment`) | caught |
| `full_value_commitment` | substituted serializer | `full-value-msgpack-packb` | Caught: 1 case (`full-value-frozen-positive`), 1 check (`frozen_full_value_commitment`) | caught |
| `full_value_commitment` | wrong hash | `full-value-sha512` | Caught: 1 case (`full-value-frozen-positive`), 1 check (`frozen_full_value_commitment`) | caught |
| `full_value_commitment` | removed refusal | `full-value-no-edition-refusal` | Caught: 2 cases (`full-value-wrong-schema-id`) | caught |
| `full_value_commitment` | off by one boundary | `full-value-preimage-position` | Caught: 1 case (`full-value-frozen-positive`), 1 check (`frozen_full_value_commitment`) | caught |
| `verify_payload_bytes` | type coercion | `payload-inline-coerced` | Caught: 1 case (`payload-inline-flag-type`) | **missed** |
| `verify_payload_bytes` | dropped qualification | `payload-size-drops-minimum` | Caught: 1 case (`payload-negative-size`) | **missed** |
| `verify_payload_bytes` | wrong hash | `payload-sha256` | Caught: 5 cases (`payload-inline-boundary`) | caught |
| `verify_payload_bytes` | removed refusal | `payload-no-media-refusal` | Caught: 1 case (`payload-media`) | caught |
| `verify_payload_bytes` | removed refusal | `payload-no-bytes-type-refusal` | Caught: 1 case (`payload-text-input`) | **missed** |
| `verify_payload_bytes` | off by one boundary | `payload-inline-limit-inclusive` | Caught: 1 case (`payload-inline-boundary`) | caught |
| `JsonNumber` | value rounding | `json-number-exact-rounds` | Caught: 3 cases (`jcs-binary64-only-10^23`) | caught |
| `JsonNumber` | type coercion | `json-number-exact-float` | Caught: 5 cases (`jcs-1e-9999`) | caught |
| `JsonNumber` | dropped qualification | `json-number-ignores-integer-flag` | Caught: 2 cases (`json-number-integer-flag-exponent`) | **missed** |
| `JsonNumber` | removed refusal | `json-number-no-float-marker-refusal` | Caught: 1 case (`json-number-float-flag-integer-token`) | **missed** |
| `JsonNumber` | off by one boundary | `json-number-leading-zero` | Caught: 1 case (`json-number-leading-zero`) | **missed** |
| `ParsedDecimal` | value rounding | `parsed-decimal-rounds` | Caught: 1 case (`current-nested-exact-types`) | **missed** |
| `ParsedDecimal` | type coercion | `parsed-decimal-float-base` | Caught: 8 cases (`current-nested-exact-types`) | caught |
| `ParsedDecimal` | dropped qualification | `parsed-decimal-drops-kind` | Caught: 1 case (`current-numeric-kinds-declared`) | **missed** |
| `RecipeTuple` | type coercion | `recipe-no-type-check` | Caught: 2 cases (`recipe-hash-int`) | caught |
| `RecipeTuple` | dropped qualification | `recipe-hash-prefix-match` | Caught: 1 case (`recipe-hash-trailing-lf`) | caught |
| `RecipeTuple` | removed refusal | `recipe-no-hash-refusal` | Caught: 3 cases (`recipe-hash-short`) | caught |
| `RecipeTuple` | off by one boundary | `recipe-hash-length-63` | Caught: 1 case (`recipe-hash-short`) | caught |
| `OriginalBinding` | type coercion | `binding-no-type-check` | Caught: 1 case (`binding-event-id-type`) | **missed** |
| `OriginalBinding` | dropped qualification | `binding-application-ignores-project` | Caught: 1 case (`binding-application-with-project`) | **missed** |
| `OriginalBinding` | removed refusal | `binding-no-field-refusal` | Caught: 2 cases (`binding-empty-event-id`) | **missed** |
| `OriginalBinding` | removed refusal | `binding-no-scope-refusal` | Caught: 4 cases (`binding-application-with-project`) | **missed** |
| `OriginalBinding` | off by one boundary | `binding-project-empty-boundary` | Caught: 1 case (`binding-project-empty-project`) | **missed** |
| `RetainedDispatcher` | type coercion | `dispatcher-truthy-verifier` | Caught: 3 cases (`history-verifier-result-integer`) | caught |
| `RetainedDispatcher` | type coercion | `dispatcher-truthy-disclosure` | Caught: 1 case (`history-truthy_disclosure`) | caught |
| `RetainedDispatcher` | dropped qualification | `dispatcher-skips-disclosure` | Caught: 5 cases (`history-deleted`) | caught |
| `RetainedDispatcher` | dropped qualification | `dispatcher-ignores-original-recipe` | Caught: 1 case (`history-unknown_recipe`) | caught |
| `RetainedDispatcher` | removed refusal | `dispatcher-no-override-refusal` | Caught: 1 case (`history-caller_override`) | caught |
| `RetainedDispatcher` | removed refusal | `dispatcher-no-binding-join` | Caught: 9 cases (`history-foreign-event_id`) | caught |
| `RetainedDispatcher` | off by one boundary | `dispatcher-verifies-twice` | Caught: 7 cases (`history-current-original`) | caught |
| `Refusal` | dropped qualification | `refusal-drops-reason` | Caught: 205 cases (`append-policy-type`), 12 checks (`full_jcs_endpoint_refusal_9007199254740993`) | caught |
| `EVENT_VALUE` | substituted identifier | `event-value-identifier` | Caught: 1 case (`full-value-frozen-positive`), 1 check (`frozen_full_value_commitment`) | caught |
| `APP_PHYSICAL` | substituted identifier | `app-physical-identifier` | Caught: 12 cases (`app-binary`) | caught |
| `INDEX_BINDING` | substituted identifier | `index-binding-identifier` | Caught: 15 cases (`binding-1`) | caught |
| `APP_PHYSICAL` | substituted identifier | `app-physical-swapped-for-event-value` | Caught: 14 cases (`app-binary`) | caught |

**Not-applicable cells** (83), with the reason recorded in the mutation set:

| API | Classes | Reason |
|---|---|---|
| `current_integer_token` | wrong hash | Computes no hash. |
| `current_integer` | substituted serializer | Parses nothing itself: token parsing is current_integer_token's, mutated there. |
| `current_integer` | wrong hash | Computes no hash. |
| `storage_uint64` | substituted serializer | Serializes and parses nothing. |
| `storage_uint64` | wrong hash | Computes no hash. |
| `exact_boolean` | value rounding | No numeric value is computed here. |
| `exact_boolean` | dropped qualification | Takes no qualification or profile argument. |
| `exact_boolean` | substituted serializer | Serializes and parses nothing. |
| `exact_boolean` | wrong hash | Computes no hash. |
| `exact_boolean` | off by one boundary | Has no numeric, length or position boundary. |
| `current_append_policy` | value rounding | No numeric value is computed here. |
| `current_append_policy` | dropped qualification | Takes no qualification or profile argument. |
| `current_append_policy` | substituted serializer | Serializes and parses nothing. |
| `current_append_policy` | wrong hash | Computes no hash. |
| `current_append_policy` | off by one boundary | Has no numeric, length or position boundary. |
| `loads_exact` | wrong hash | Computes no hash. |
| `loads_exact` | off by one boundary | No numeric or length boundary: token grammar boundaries belong to JsonNumber and current_integer_token, mutated there. |
| `loads_current_json` | wrong hash | Computes no hash. |
| `qualified_jcs` | wrong hash | Computes no hash. |
| `producer_semantic_bytes` | wrong hash | Computes no hash. The digest wrapper's hash is mutated under producer_semantic_digest. |
| `producer_semantic_digest` | value rounding | Hashes bytes; numeric rounding belongs to the bytes route, mutated under producer_semantic_bytes. |
| `storage_value_bytes` | wrong hash | Computes no hash. |
| `decode_storage_value` | wrong hash | Computes no hash. |
| `decode_storage_value` | off by one boundary | Width boundaries are the encoder's, mutated under storage_value_bytes; the decoder compares bytes exactly. |
| `full_value_commitment` | value rounding | Numeric bytes come from storage_value_bytes, whose rounding is mutated there. |
| `verify_payload_bytes` | value rounding | No numeric value is computed here. |
| `verify_payload_bytes` | substituted serializer | Compares the owner's bytes as given; serializes nothing. |
| `JsonNumber` | substituted serializer | Serializes and parses nothing. |
| `JsonNumber` | wrong hash | Computes no hash. |
| `ParsedDecimal` | substituted serializer | Serializes and parses nothing. |
| `ParsedDecimal` | wrong hash | Computes no hash. |
| `ParsedDecimal` | removed refusal | Has no refusal of its own. |
| `ParsedDecimal` | off by one boundary | Has no numeric, length or position boundary. |
| `RecipeTuple` | value rounding | No numeric value is computed here. |
| `RecipeTuple` | substituted serializer | Serializes and parses nothing. |
| `RecipeTuple` | wrong hash | Checks SHA-256 syntax only; computes no hash. |
| `OriginalBinding` | value rounding | No numeric value is computed here. |
| `OriginalBinding` | substituted serializer | Serializes and parses nothing. |
| `OriginalBinding` | wrong hash | Computes no hash. |
| `RetainedDispatcher` | value rounding | No numeric value is computed here. |
| `RetainedDispatcher` | substituted serializer | Serializes and parses nothing. |
| `RetainedDispatcher` | wrong hash | Computes no hash: the frozen verifier owns commitments. |
| `Refusal` | value rounding, type coercion, substituted serializer, wrong hash, removed refusal, off by one boundary | Exception carrier: only its reason is behaviour, mutated as dropped_qualification. |
| `OriginalCustody` | value rounding, type coercion, dropped qualification, substituted serializer, wrong hash, removed refusal, off by one boundary | Frozen field carrier with no logic; its use is mutated through RetainedDispatcher. |
| `FrozenRecipe` | value rounding, type coercion, dropped qualification, substituted serializer, wrong hash, removed refusal, off by one boundary | Frozen field carrier with no logic; its use is mutated through RetainedDispatcher. |
| `EVENT_VALUE` | value rounding, type coercion, dropped qualification, substituted serializer, wrong hash, removed refusal, off by one boundary | Profile identifier string; mutated as substituted_identifier. |
| `APP_PHYSICAL` | value rounding, type coercion, dropped qualification, substituted serializer, wrong hash, removed refusal, off by one boundary | Profile identifier string; mutated as substituted_identifier. |
| `INDEX_BINDING` | value rounding, type coercion, dropped qualification, substituted serializer, wrong hash, removed refusal, off by one boundary | Profile identifier string; mutated as substituted_identifier. |

**The review's mutations, rerun from scratch copies.** The review's `route_gap_repro.py` and `cli_mutations.py`, byte-identical to its fingerprints, were copied with only their expected results changed (pass to fail, CLI exit 0 to 1); the diffs are retained.

| Mutation | `route_gap_repro.py` (real runner) | `cli_mutations.py` (fresh CLI) |
|---|---|---|
| `current_parser_rounded_int` | fail, 432/440 | exit 1, 432/440 |
| `current_parser_float` | fail, 431/440 | exit 1, 431/440 |
| `producer_sorted_json` | fail, 422/440 | exit 1, 422/440 |
| `producer_sha512` | fail, 434/440 | exit 1, 434/440 |
| `producer_drops_qualification` | fail, 434/440 | not in that script |
| `decoder-profile-loss` | not in that script | exit 1, 429/440 |
| `deliberate-wrong-expected-output` | not in that script | exit 1, 439/440 |

The intact known answer reproduces (`a2e019f1b0e9d842cb4577196da7ca6024ef6ce1158df557858ff93914567416`). Every row fails `--scope numbers`.

**Corpus counts.**

| Selection | Cases | Positives | Negatives | Checks | Result |
|---|---|---|---|---|---|
| `--scope numbers` | 440 | 235 | 205 | 60 | 440/440 pass |
| `--scope all` | 13486 | 6898 | 6588 | 299 | 13486/13486 pass, exit 0 |

95 cases added (28 producer, 12 current_json_slot, 11 json_number, 9 physical, 8 binding_constructor, 5 jcs, 5 parse, 4 decode, 3 current_json, 3 payload, 2 integer, 2 token, 2 slot, 1 uint64). 102 existing positives gained a `returns` oracle; no existing case's input, outcome or label changed, and none was removed. The new negatives are 37 single-defect cases and 6 labelled multi-predicate controls.

**Independent vectors.** 175 positives' expected values were rechecked by code that never imports the helper: MessagePack bytes and decodes with the msgpack library plus the SP-236 float-width rule, integers with `int()`, current-parser trees with `json`/`decimal`, JsonNumber exact values with `decimal`: 0 mismatches. Producer and new JCS vectors come from Node v22.22.2.

**Date-time gate after the corpus change.** `--scope all` on the full `Plans/` tree: inventory `pass`, 233 nodes (133 Storage, 89 other-owner), 0 unclassified. The corpus edit needs one data update there, the corpus row's content pin in `scripts/pm_event_datetime_exclusions.json`; nothing else in that file changed.

**Limits.**
- The returns oracles and producer vectors are finite. The mutation set is a fixed sample: catching 120 of 121 shows the corpus is not self-referential at these sites, not that every wrong implementation fails.
- One declared survivor (`append-policy-no-type-check`) is an equivalent mutant at every JSON input; a reviewer checks its reason.
- `--scope numbers` says nothing about date-time. Native custody, durability and family admission remain NOT_RUN; guard isolation stays SWEEP_PENDING.

**Scope.** Changed: `scripts/pm_event_numbers.py` (CLI flag and docstring only), `scripts/pm_event_numbers_corpus.py`, the new `scripts/pm_event_numbers_mutations.json`, the number cases of the corpus, the corpus row's content pin, the adoption guide's number-only section and this report set. Unchanged: every helper function and recipe, all date-time code and data except that pin, the binding helper, owner prose, pinned schemas, generated shards and index, the registry and the governance inputs.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/cli-runs.json` | `0a813b80d882b2b37675dc8ff7ef57de1dfe58ee98cbf1504a181bff6537052e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/head-numbers-mutations.stdout.json` | `1e164871e0d991b890b55be2a7b39d7b8a7ca1c68658b3ea3f7849ddf4cfe37e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/base-comparison.json` | `9f6df5c84d45f6589139618fe1782d24a24ee5bc5ca996ffa3e9de49dc288b35` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/gen-cases.json` | `784fd68ee3fb0e6235238b1a0e6b6de9bb38c27c3fae3db82a59e4a5b309c9f6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/vector-crosscheck.json` | `f5f5ba36a74f964bcd327ddbe32738336e14fb61d5df369a18f817e158787b46` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/review-rerun/route-gaps.json` | `f23458de0f899a1f3632a254fd96aab0638d551619f9c70da859597683fe6969` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/review-rerun/cli-mutations.json` | `7a7209385651d3cc5f6b3f8ccf2af1b01a8fa46ccf15de3c44404c84178ed3f5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/full-selftest-summary.json` | `fcff4f134191e7d933f541c3cd6a51b247f5f8c8e8375d872ccc79d78d15a805` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix2/dependency.json` | `c76fcbf1169363abc7a5a05ef1f02b7b5ee6be351b4a4fd5654fd5dcf78de84c` |

## Opus pre-check (numbers fix 2): findings and responses

Scope: CV-1100, SP-1100, SP-1101, the number corpus, its runner, the mutation set and the number-only section of the adoption guide. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-numbers-fix2-opus.md` (blind Opus pre-check, NOT_READY at `051c303a2aea17ef85a6e66d89c75cbb3b29e058`): two High blocking findings, two Low, one Info. Implementation commit `7b370be1401a6183147917b68d78b165814c0122`. **No production helper code changed:** `scripts/pm_event_numbers.py` and `scripts/pm_event_index_binding.py` are byte-identical to `051c303a2a`; every edit is to the corpus, its runner, the mutation set, the corpus content pin and the docs.

| | |
|---|---|
| **Goal** | A wrong implementation of any adopted number API fails the number corpus, and the self-test proves it by construction, not by a sample the author chose. |
| **Gap** | NUM-FIX2's set certified each (API, class) cell with one mutation, so other predicates in the same cell went untested. The review's blind mutations caught 6 of 15; its refusal-site sweep caught 51 of 61. |
| **Gain** | `--mutations` now enumerates its mutation points from the helper's AST: every refusal site, every single predicate of a refusal guard, every relational boundary. A new or stale point fails the self-test, so completeness holds as the helper changes. Each documented non-refusal rule has its own witnessed mutation. |

**Totals** (`python3 scripts/pm_event_numbers.py --self-test --scope numbers --mutations`, exit 0):

| Measure | Count |
|---|---|
| Refusal sites, from the AST (`raise` and `_refuse(...)`) | 64 |
| Refusal-guard predicates, from the AST | 34 |
| Relational boundaries, from the AST | 12 |
| Documented behaviour rules (rules table) | 71, all 71 caught |
| Mutations | 283: 173 hand-written, 110 generated |
| Caught | 279, each with its witness case among the failures |
| Survivors | 4, all declared with a reason (below); 0 undeclared |
| Not applied, build errors, runner exceptions | 0, 0, 0 |
| The review's 15 blind mutations | 15 caught (committed set and the review's own script) |
| The review's 61-site sweep | 61 of 61 caught |

**Finding 1 (High, blocking): blind semantic mutations, 6 of 15 caught — fixed in `7b370be1401a6183147917b68d78b165814c0122`.**
- **Where:** `run_mutations` in `scripts/pm_event_numbers_corpus.py` accepted one mutation per (API, class) cell; the number cases had no input that told the survivors apart.
- **Why:** each surviving mutation broke a predicate that shared a cell with an already-mutated one: kind precedence, MessagePack key order, the bin8 width, payload-ID case, an empty application `project_id`, an empty recipe field, result/receipt byte types, raw control characters and integer map keys.
- **Fix:**
  - **Cases:** the review's eight cases, its 1g `history` scenario (as `string_result_bytes` and `string_receipt_bytes`) and its 1i decoder case, each a single-defect case. Case 1a is exactly `{"op":"jcs","raw":"1","typed":true,"kind":"float","error":"jcs_kind"}`.
  - **Mutations:** the 15 blind mutations and the 4 supplementary ones, verbatim, with `source: review-fix2`. The no-op control is a declared survivor, so a false catch would fail the run.
  - **Per predicate, not per cell:** the generated families and the rules table (below) replace one-per-cell as the completeness rule. The (API, class) matrix stays as an extra check.

| Review mutation | At review (`051c303a2a`) | Now (committed set) | Witness case |
|---|---|---|---|
| `kind-precedence-inferred-over-declared` | **survived** (1a) | caught, 1 case | `jcs-declared-float-over-integer-carrier` |
| `kind-check-on-python-repr` | caught | caught, 9 cases | `jcs-kind-loss-exact` |
| `jsonnumber-negative-zero-missed` | caught | caught, 1 case | `jcs-integer-sign-loss` |
| `parse-control-chars-accepted` | **survived** (1h) | caught, 1 case | `parse-raw-control-character` |
| `current-default-kind-decimal` | caught | caught, 4 cases | `current-nested-exact-types` |
| `physical-int16-boundary` | caught | caught, 1 case | `physical-int--32768` |
| `physical-bin8-boundary` | **survived** (1c) | caught, 1 case | `app-binary-255` |
| `physical-utf16-key-order` | **survived** (1b) | caught, 1 case | `physical-map-utf8-order` |
| `decode-nonstring-map-keys` | **survived** (1i) | caught, 1 case | `decode-integer-map-key` |
| `full-value-version-unchecked` | caught | caught, 1 case | `full-value-wrong-version` |
| `payload-id-uppercase-hex` | **survived** (1d) | caught, 1 case | `payload-id-uppercase` |
| `payload-size-oversized-accepted` | caught | caught, 1 case | `payload-size` |
| `binding-application-empty-project` | **survived** (1e) | caught, 1 case | `binding-application-empty-project` |
| `recipe-empty-field-accepted` | **survived** (1f) | caught, 1 case | `recipe-empty-owner-edition` |
| `dispatcher-checks-record-bytes-only` | **survived** (1g) | caught, 2 cases | `history-string_result_bytes` |

**Finding 2 (High, blocking): refusal-site sweep, 51 of 61; site 294 a silent admission — fixed in `7b370be1401a6183147917b68d78b165814c0122`.**
- **Where:** `qualified_jcs.adapt`'s `_refuse("jcs_type")` (`scripts/pm_event_numbers.py:294`).
- **Why:** no case reached it, so removing it let bytes and sets serialize as `null` on the producer route.
- **Fix:**
  - **The exact case:** `{"op":"jcs_value","value":{"a":{"@binary":"78"}},"error":"jcs_type"}` (`jcs-binary-value`).
  - **The sweep, generated:** the `refusal_site` family disables each refusal site in turn and requires its witness case to fail. Unlike the review's regex sweep, it also covers the three `raise` statements.
  - **The other nine misses:** one new single-defect case each, including site 370. That site needs a binary longer than 2^32 bytes. A fault-injection fixture makes the helper module's `len()` report 2^32 for a 1-byte input (true length elsewhere), so no 4 GiB allocation is needed. `fixture_boundary` labels it.

| Reviewed line | Site (generated key) | New case (witness) | Intact | Without the site |
|---|---|---|---|---|
| 165 | `site:loads_exact:json_input_type#1` | `parse-input-type-number` | refused `json_input_type` | caught (1 case) |
| 252 | `site:qualified_jcs.number:jcs_nonfinite#1` | `jcs-decimal-nan` | refused `jcs_nonfinite` | caught (2 cases) |
| 261 | `site:qualified_jcs.number:jcs_binary64#1` | `jcs-integer-beyond-binary64` | refused `jcs_binary64` | caught (1 case) |
| 292 | `site:qualified_jcs.adapt:jcs_key_type#1` | `jcs-non-string-key` | refused `jcs_key_type` | caught (1 case) |
| 294 | `site:qualified_jcs.adapt:jcs_type#1` | `jcs-binary-value` | refused `jcs_type` | caught (1 case) |
| 370 | `site:storage_value_bytes:physical_length#1` | `app-binary-reported-length-4294967296` | refused `physical_length` | caught (1 case) |
| 377 | `site:storage_value_bytes:physical_key_type#1` | `physical-non-string-key` | refused `physical_key_type` | caught (1 case) |
| 391 | `site:decode_storage_value:physical_input_type#1` | `decode-text-input` | refused `physical_input_type` | caught (1 case) |
| 528 | `site:RetainedDispatcher.resolve:original_query#1` | `history-empty_ref` | refused `original_query` | caught (3 cases) |
| 535 | `site:RetainedDispatcher.resolve:recipe_selection#1` | `history-untyped_recipe` | refused `recipe_selection` | caught (1 case) |

**Finding 3 (Low): the declared survivor `append-policy-no-type-check` — closed with a case in `7b370be1401a6183147917b68d78b165814c0122`.**
- **Where:** `scripts/pm_event_numbers_mutations.json` and the guide's Self-check line.
- **Fix:** new case `append-policy-str-subclass` passes a `StrEnum` member equal to `append_once`. The intact helper refuses it `replay_policy`; the mutant accepts it. The mutation is no longer a survivor: its `survives` reason is gone and its witness is that case. The guide no longer calls it equivalent.

**Finding 4 (Low): a runner exception counted as caught — fixed in `7b370be1401a6183147917b68d78b165814c0122`.**
- **Fix:** each mutant is built (compile and module load) before the corpus runs. A build error or a corpus run that raises is reported as `build_error` or `runner_exception`, fails the self-test, and never counts as caught. A harness control shows both (below).

**Finding 5 (Info): test inputs decoded through the module under test — fixed in `7b370be1401a6183147917b68d78b165814c0122`.**
- **Fix:** `{"@int": ...}` inputs decode with the runner's own `_int_from_digits` (chunked, no `str()` limit). The corpus and the mutation set load with the runner's own duplicate-key hook, not `m._unique_object`.

**Production refusals.** No mutation showed a production refusal that CV-1100, SP-1100 or SP-1101 requires and the helper lacks, so none was added. Noted for the owner, not changed: an EventRecord string over 2^32 bytes reaches `pm_event_index_binding._length_prefix`, which raises `ValueError` rather than a `Refusal`. That still fails closed, and no owner text names a reason for it.

**Generated mutation points.** `mutation_points()` in the runner parses `scripts/pm_event_numbers.py` and builds each mutant by editing the AST, never by text search:
- **`comparison_boundary`** (12): Every <, <=, > and >= in the helper. The mutant flips strictness (< and <=, > and >=), the off-by-one at that width, range or limit boundary.
- **`refusal_predicate`** (34): Every predicate of the if-guards of a _refuse site (each enclosing if whose body holds it) where dropping that predicate alone weakens the guard: an or-operand at positive polarity becomes False, an and-operand under not becomes True, and an element of a literal tuple scanned by any() is dropped.
- **`refusal_site`** (64): Every raise statement and every _refuse(...) call, the only ways the helper emits an error code (returns, lambdas and except handlers included). The mutant disables that one site: a call becomes None, a raise becomes pass.

Keys name the enclosing function, the error code or predicate text and an ordinal, never a line number. Unrelated edits keep them stable, and any new or changed site shows up as a new or stale key. The committed entry for each point is a witness case or a declared survivor. Witnesses for the ten previously missed sites, and for the predicates and boundaries that needed new cases, are those cases. The rest were picked from a real run (a failing case refusing with the point's own error code first), and every run re-verifies them.

**Declared survivors (4).**

| Mutation | Reason |
|---|---|
| `control-noop-comment` | Harness control from the review: a behaviour-free edit. It must survive; reporting it caught would mean the harness counts false kills. |
| `site:<module>:raise#1` | CLI entry point, not an API refusal: `raise SystemExit(main())` runs only under __main__, and the mutant module is loaded in memory, never as __main__. Without it the CLI would exit 0 on a failing corpus; the fresh-process CLI controls (a deliberately wrong expected output gives exit 1) cover the exit status instead. |
| `boundary:qualified_jcs.number:math.copysign(1.0, f) < 0:0#1` | Equivalent: math.copysign(1.0, f) returns exactly 1.0 or -1.0 (NaN included), never 0, so < 0 and <= 0 agree for every input. |
| `boundary:storage_value_bytes:v >= 0:0#1` | Equivalent: with v > 0, the integer 0 takes the negative branch, whose fixint test (0 >= -32) emits bytes([0 & 255]) = 0x00, the same byte binding_bytes(0) emits. |

**Behaviour rules, one row per rule.** From `Plans/Contracts_V0.md#CV-1100`, `Plans/storage-plan.md#SP-1100`, `Plans/storage-plan.md#SP-1101` and the adoption guide's shared calls. Where a rule is an existing profile owner's (CV-317, CV-339, CV-366, SP-337), that owner is named too. Every listed mutation is caught with its witness case failing.

| Rule | Owner | Rule text | Mutations (witness case) |
|---|---|---|---|
| `token.no-leading-zero` | CV-1100 | Current JSON integer inputs are exactly 0 or -?[1-9][0-9]*: no leading zero. | `token-grammar-allows-leading-zero` (`bad-token-'01'`) |
| `token.no-negative-zero` | CV-1100 | No negative zero in a current integer token. | `token-grammar-allows-negative-zero` (`bad-token-'-0'`) |
| `token.no-plus` | CV-1100 | No plus sign in a current integer token. | `token-grammar-allows-plus` (`bad-token-'+1'`) |
| `token.no-fraction-or-exponent` | CV-1100 | No fraction or exponent in a current integer token. | `token-no-grammar` (`bad-token-'1e0'`) |
| `token.ascii-digits` | CV-1100 | The token grammar's [0-9] is ASCII digits only. | `token-grammar-unicode-digits` (`bad-token-'1١'`) |
| `token.whole-string` | CV-1100 | The whole token matches the grammar; no surrounding whitespace. | `token-grammar-strips-whitespace` (`bad-token-' 1'`) |
| `typed-integer.no-bool` | CV-1100 | Current typed integer inputs require an exact integer primitive, excluding booleans. | `integer-isinstance` (`int-bool`) |
| `typed-integer.no-float` | CV-1100 | ... and excluding runtime floats; no silent float coercion. | `integer-accepts-float` (`int-float`) |
| `typed-integer.no-string` | CV-1100 | No silent string coercion into an integer. | `integer-accepts-digit-string` (`int-string`) |
| `bounds.minimum-inclusive` | CV-1100 | Field-specific minima still apply, inclusively. | `integer-minimum-exclusive` (`current-slot-2^53+1-minimum-equal`); `boundary:current_integer:value < minimum:0#1` (`current-slot-2^53+1-minimum-equal`) |
| `bounds.maximum-inclusive` | CV-1100 | Field-specific maxima still apply, inclusively. | `integer-maximum-exclusive` (`current-slot-2^53+1-maximum-equal`); `boundary:current_integer:value > maximum:0#1` (`current-slot-2^53+1-maximum-equal`) |
| `bounds.forwarded` | CV-1100 | Slot bounds apply on the token and JsonNumber routes too. | `token-drops-bounds` (`slot-above-maximum`); `integer-json-number-drops-bounds` (`slot-above-maximum`) |
| `no-binary64-narrowing` | CV-1100 | No decoder may narrow an integer through binary64. | `token-rounds-through-binary64` (`token-9007199254740993`); `parse-int-rounds-through-binary64` (`parse-2^53+1`); `review-current-parser-rounded-int` (`current-large-exact`); `review-current-parser-float` (`current-large-exact`) |
| `no-global-cap` | CV-1100 | No global maximum-safe ceiling (4400-digit integers stay exact). | `token-int-parser` (`current-logical-integer-4400-digits`) |
| `current-parser.fractions-stay-decimal` | CV-1100 / adoption guide | loads_current_json never converts fractional or exponent tokens, even integral ones, to ints or floats. | `current-integral-fraction-to-int` (`current-slot-fraction`) |
| `current-parser.lexical-float-kind` | adoption guide | An undeclared fractional token keeps its lexical float kind. | `current-default-kind-decimal` (`current-nested-exact-types`) |
| `current-parser.kinds-by-path` | adoption guide | Optional schema numeric_kinds select the kind by exact path, including array indices. | `current-drops-numeric-kinds` (`current-numeric-kinds-declared`); `current-array-path-off-by-one` (`current-numeric-kinds-declared`) |
| `kind.declared-over-carrier` | CV-1100 / adoption guide | numeric_kinds applies independently of the parser carrier: a declared kind overrides the carrier's own. | `kind-precedence-inferred-over-declared` (`jcs-declared-float-over-integer-carrier`) |
| `kind.bare-decimal-undeclared` | adoption guide | A bare Decimal has no implicit owner kind. | `kind-bare-decimal-inferred-float` (`jcs-decimal-undeclared`) |
| `kind.json-number-lexical` | adoption guide | Raw JsonNumber preserves its integer/float token kind. | `kind-json-number-always-float` (`jcs-typed-exact-integer`) |
| `kind.emitted-token` | CV-1100 | Kind preservation is judged on the emitted JCS token. | `kind-check-on-python-repr` (`jcs-kind-loss-exact`) |
| `jcs.exact-decimal` | CV-1100 | The emitted decimal must equal the original exact value (2^60). | `jcs-no-decimal-refusal` (`jcs--1152921504606846976`) |
| `jcs.binary64-equality` | CV-1100 | The original integer must survive binary64 exactly (2^53+1). | `jcs-binary64-tolerance-one` (`producer-2^53+1-bytes`) |
| `sign.json-number` | CV-1100 | Typed signed zero is not erased: a raw -0 token. | `jsonnumber-negative-zero-missed` (`jcs-integer-sign-loss`) |
| `sign.decimal` | CV-1100 | Typed signed zero is not erased: a Decimal carrier. | `jcs-decimal-sign-ignored` (`jcs-sign-loss-current`) |
| `sign.float` | CV-1100 | Typed signed zero is not erased: a runtime float. | `jcs-float-sign-ignored` (`jcs-typed--0.0`) |
| `sign.independent-of-kind` | adoption guide | sign_sensitive_paths checks zero sign without requiring a primitive kind. | `jcs-sign-path-enforces-kind` (`jcs-sign-only-integral-float`) |
| `qualification.schema-paths` | adoption guide | Qualification paths are tuples of map keys and array indices from the original schema. | `jcs-array-path-off-by-one` (`producer-type-qualified-array-index-bytes`) |
| `jcs.key-order` | CV-1100 | Actual RFC8785: keys in UTF-16 code-unit order. | `jcs-code-point-key-order` (`jcs-nonascii-order`) |
| `jcs.array-order` | CV-1100 | Array order remains exactly owner-defined. | `jcs-reversed-arrays` (`jcs-boolean-null`) |
| `jcs.scalar-strings` | CV-1100 | JCS strings and keys are Unicode scalar values. | `jcs-string-not-scalar-checked` (`jcs-lone-surrogate-string`); `jcs-key-not-scalar-checked` (`jcs-lone-surrogate-key`) |
| `jcs.bool-not-number` | CV-1100 | No silent bool coercion: booleans stay JSON booleans. | `jcs-boolean-as-integer` (`jcs-boolean-null`) |
| `producer.projection` | CV-317 / CV-1100 | Producer semantics use the unchanged full producer projection. | `producer-drops-last-field` (`producer-2^53-bytes`) |
| `producer.qualification-forwarded` | CV-1100 | Producer routes qualify with the caller's type, sign and kind declarations. | `review-producer-drops-qualification` (`producer-sign-qualified-negative-zero-bytes`); `producer-drops-sign-qualification` (`producer-sign-qualified-negative-zero-bytes`) |
| `producer.sha256-hex` | CV-317 | The producer digest is lowercase hex SHA-256 of the JCS bytes. | `review-producer-sha512` (`producer-2^53-digest`); `digest-truncated` (`producer-2^53-digest`) |
| `physical.integer-range` | SP-1100 | EventRecord MessagePack integers span -2^63 through 2^64-1 inclusive. | `boundary:storage_value_bytes:-(1 << 63) <= v <= UINT64_MAX:0#1` (`physical-int--9223372036854775808`); `boundary:storage_value_bytes:-(1 << 63) <= v <= UINT64_MAX:1#1` (`decode-good-uint64`) |
| `physical.minimal-integer-width` | SP-1100 | Minimal type-preserving integer widths at every boundary. | `physical-negative-fixint-boundary` (`physical-int--33`); `physical-int8-boundary` (`physical-int--129`); `physical-int16-boundary` (`physical-int--32768`); `physical-int32-boundary` (`physical-int--2147483648`); `boundary:storage_value_bytes:v >= low:0#1` (`physical-int--128`); `binding-uint-fixint-boundary` (`physical-int-127`); `binding-uint8-boundary` (`physical-int-255`); `binding-uint16-boundary` (`physical-int-65535`); `binding-uint32-boundary` (`physical-int-4294967295`) |
| `physical.float-type-retained` | SP-1100 | General EventRecord floats retain float type even when integral. | `physical-integral-float-as-int` (`physical-float-1.0`) |
| `physical.signed-zero` | SP-1100 | Floats retain signed zero in float32 and float64. | `physical-float32-drops-zero-sign` (`physical-float--0.0`); `physical-float64-drops-zero-sign` (`app-float--0.0`) |
| `physical.float32-exact-eventrecord-only` | SP-1100 / CV-366 | float32 only with exact value preservation, and only for EventRecord; app physical is float64. | `physical-lossy-float32` (`physical-float-0.1`); `physical-float32-ignores-profile` (`decode-app-float32`) |
| `physical.minimal-string-width` | SP-1100 | Minimal string headers (fixstr, str8, str16). | `binding-fixstr-boundary` (`physical-str-32`); `binding-str8-boundary` (`physical-str-255`); `binding-length16-boundary` (`physical-str-65535`) |
| `physical.minimal-container-width` | SP-1100 | Minimal array and map headers (fixarray, fixmap). | `binding-fixarray-boundary` (`physical-array-15`); `binding-fixmap-boundary` (`physical-map-15`) |
| `physical.map-key-order` | SP-1100 | Map keys in UTF-8 byte order (not the JCS UTF-16 order), on every profile. | `physical-utf16-key-order` (`physical-map-utf8-order`); `binding-utf16-key-order` (`physical-binding-map-utf8-order`) |
| `physical.array-order` | CV-1100 / SP-1100 | Array order is preserved in physical bytes. | `physical-reversed-arrays` (`physical-array-nested`) |
| `physical.scalar-strings` | SP-1100 | Physical strings are valid Unicode scalar values. | `physical-string-not-scalar-checked` (`physical-lone-surrogate-string`) |
| `physical.app-binary-width` | CV-366 / SP-1100 | App binary takes the minimal bin8/bin16/bin32 header (255 vs 256, 65535 vs 65536, 2^32-1). | `physical-bin8-boundary` (`app-binary-255`); `boundary:storage_value_bytes:n <= 65535:0#1` (`app-binary-65535`); `boundary:storage_value_bytes:n <= 4294967295:0#1` (`app-binary-reported-length-4294967295`) |
| `physical.binary-declared-only` | adoption guide | App binary is legal only in the app physical profile; EventRecord disallows binary. | `physical-binary-ignores-profile` (`physical-binary`) |
| `decode.string-keys` | SP-1100 | Canonical decoding admits only string map keys. | `decode-nonstring-map-keys` (`decode-integer-map-key`) |
| `decode.selected-profile` | SP-1100 | Decoding rejects alternates according to the selected profile. | `review-decoder-profile-loss` (`decode-app-float32`) |
| `decode.canonical-bytes` | SP-1100 | Decoded bytes must re-encode to the identical canonical bytes. | `decode-msgpack-canonical-check` (`decode-binary`) |
| `payload.exact-size` | SP-1100 / SP-337 | Payload byte sizes cover the exact original bytes. | `payload-size-oversized-accepted` (`payload-size`) |
| `payload.lowercase-id` | SP-337 | Payload IDs are lowercase 64-hex BLAKE3 digests. | `payload-id-uppercase-hex` (`payload-id-uppercase`) |
| `payload.inline-limit` | SP-337 | The inline limit admits exactly 16384 bytes. | `payload-inline-limit-inclusive` (`payload-inline-boundary`); `boundary:verify_payload_bytes:len(raw) > 16384:0#1` (`payload-inline-boundary`) |
| `full-value.edition` | CV-339 | The full-value commitment covers only pm.event.v0 2.0.0 events. | `full-value-version-unchecked` (`full-value-wrong-version`); `predicate:site:full_value_commitment:full_value_edition#1:false event.get('schema_id') != 'pm.event.v0'#1` (`full-value-wrong-schema-id`) |
| `full-value.preimage-order` | CV-339 | The unchanged CV-339 tuple order. | `full-value-preimage-position` (`full-value-frozen-positive`) |
| `recipe.nonempty-fields` | SP-1101 | Every recipe tuple field is a non-empty string. | `recipe-empty-field-accepted` (`recipe-empty-owner-edition`) |
| `recipe.lowercase-resource-hash` | SP-1101 | The resource manifest hash is lowercase 64-hex. | `recipe-hash-uppercase-accepted` (`recipe-hash-upper`) |
| `binding.nonempty-fields` | SP-1101 | Every binding identity field is a non-empty string. | `predicate:site:OriginalBinding.__post_init__:original_binding#1:false not v#1` (`binding-empty-event-id`) |
| `binding.application-null-project` | SP-1101 | Application scope requires project_id null, not empty. | `binding-application-empty-project` (`binding-application-empty-project`) |
| `binding.project-nonempty-string` | SP-1101 | Project scope requires a non-empty project_id string. | `binding-project-empty-boundary` (`binding-project-empty-project`); `predicate:site:OriginalBinding.__post_init__:original_scope#1:true type(self.project_id) is str#1` (`binding-project-integer-project`) |
| `dispatch.query-shape` | SP-1101 | One original selection: a non-empty string reference and an exact OriginalBinding. | `predicate:site:RetainedDispatcher.resolve:original_query#1:false type(original_ref) is not str#1` (`history-nonstring_ref`); `predicate:site:RetainedDispatcher.resolve:original_query#1:false not original_ref#1` (`history-empty_ref`); `predicate:site:RetainedDispatcher.resolve:original_query#1:false type(expected) is not OriginalBinding#1` (`history-dict_expected`) |
| `dispatch.binding-join` | SP-1101 | The owner's binding is an exact OriginalBinding equal to the query. | `dispatcher-no-binding-join` (`history-foreign-event_id`); `predicate:site:RetainedDispatcher.resolve:original_binding#1:false type(original.binding) is not OriginalBinding#1` (`history-self_equal_binding`) |
| `dispatch.original-bytes-exact` | SP-1101 | Original record, result and receipt stay exact bytes. | `dispatcher-checks-record-bytes-only` (`history-string_result_bytes`); `predicate:site:RetainedDispatcher.resolve:original_bytes_type#1:drop original.record_bytes#1` (`history-string_record_bytes`); `predicate:site:RetainedDispatcher.resolve:original_bytes_type#1:drop original.result_bytes#1` (`history-string_result_bytes`); `predicate:site:RetainedDispatcher.resolve:original_bytes_type#1:drop original.receipt_bytes#1` (`history-string_receipt_bytes`) |
| `dispatch.original-recipe` | SP-1101 | The frozen verifier is selected by the original's own recipe tuple. | `dispatcher-ignores-original-recipe` (`history-unknown_recipe`) |
| `dispatch.verifier-true` | SP-1101 | Only verifier result True authenticates; no truthy value. | `dispatcher-truthy-verifier` (`history-verifier-result-integer`) |
| `dispatch.one-verifier-call` | SP-1101 | Exactly one frozen verifier runs; no probing. | `dispatcher-verifies-twice` (`history-current-original`) |
| `dispatch.disclosure` | SP-1101 | Current disclosure is checked independently and must be exactly True. | `dispatcher-truthy-disclosure` (`history-truthy_disclosure`); `dispatcher-skips-disclosure` (`history-deleted`) |
| `loads-exact.control-characters` | adoption guide / RFC 8259 | loads_exact refuses raw control characters in JSON strings. | `parse-control-chars-accepted` (`parse-raw-control-character`) |
| `loads-exact.scalar-strings` | adoption guide | Every parsed string and key is a Unicode scalar value. | `parse-no-scalar-walk` (`parse-key-lone-surrogate`); `parse-keys-not-walked` (`parse-key-lone-surrogate`) |
| `loads-exact.strict-utf8` | adoption guide | Byte input is strict UTF-8. | `parse-latin1-decoder` (`parse-invalid-utf8-bytes`) |
| `append-policy.exact-string` | SP-1101 / adoption guide | current_append_policy admits exactly one of the three policy strings as an exact str. | `append-policy-no-type-check` (`append-policy-str-subclass`); `predicate:site:current_append_policy:replay_policy#1:false type(value) is not str#1` (`append-policy-str-subclass`) |

The brief's examples map to rows: ordering is `physical.map-key-order` and `jcs.key-order`; width boundaries are `physical.app-binary-width` (255 vs 256) and the other `minimal-*-width` rows; case normalisation is `payload.lowercase-id` and `recipe.lowercase-resource-hash`; required non-empty fields are `binding.application-null-project` (`project_id ""`) and `recipe.nonempty-fields`; byte types are `dispatch.original-bytes-exact`; string content is `loads-exact.control-characters`.

**The review's mutations and sweep, rerun from scratch copies.** The review's `own_mutations.py` and `refusal_sweep.py`, byte-identical (SHA-256 `8e6a4ea5...` and `475254ab...`), ran unmodified on an extraction of `7b370be1401a6183147917b68d78b165814c0122` holding only the number files:
- **`own_mutations.py`** (fresh CLI process per mutation): 15 of 15 caught; supplementary: `control-noop-comment` survives, `jcs-key-type-refusal-removed` caught, `token-grammar-strips-whitespace` caught, `physical-unknown-profile-accepted` caught.
- **`refusal_sweep.py`**: 61 of 61 sites caught, 0 errors.
- **The gate's adapted `route_gap_repro.py` and `cli_mutations.py`** (regression): every mutation still fails (current_parser_rounded_int 482/490, current_parser_float 481/490, producer_sorted_json 471/490, producer_sha512 484/490, producer_drops_qualification 483/490); CLI exit 1 for all 6 runs. Known answer `a2e019f1b0e9d842cb4577196da7ca6024ef6ce1158df557858ff93914567416`.

**Harness controls** (fresh CLI processes on throwaway copies; each gives exit 1 and names the expected problem):
- **control-new-refusal-site:** `new mutation point without a committed entry: site:exact_boolean:control_new_site#1`.
- **control-mutation-set:** `stale committed mutation point (not in the helper's AST): site:removed_function:gone#1`; `site:exact_boolean:boolean_type#1: witness case token-0 did not fail`; `integer-isinstance: witness case token-0 did not fail`; `boolean-no-refusal: declared survivor is now caught`; `control-noop-comment: mutation survived the number corpus`; `control-build-error: build_error`; `control-runner-exception: runner_exception`; `rule control.unknown: no mutation, or unknown mutation ['no-such-mutation']`.

**Standalone (T8).** Every CLI run is a new `python3 -B` process started from an unrelated directory. It runs on an extraction holding only the four number scripts, the mutation set and the three data files, with msgpack 1.1.2 (wheel SHA-256 `180759d8...`). The date-time modules were absent. With them present and raising at import, `--scope numbers` gives the same result.

**Corpus counts.**

| Selection | Cases | Positives | Negatives | Checks | Result |
|---|---|---|---|---|---|
| `--scope numbers` | 490 | 252 | 238 | 60 | 490/490 pass |
| `--scope all` | 13536 | 6915 | 6621 | 299 | 13536/13536 pass, exit 0 |

50 cases added (33 single-defect negatives, 17 positives), inserted after the last number case. No existing case's input, outcome or label changed, and none was removed.

**Independent vectors.** New MessagePack outputs come from the MessagePack spec, transcribed in `gen_cases.py`, and are rechecked with msgpack 1.1.2 `packb`. New JCS outputs come from Node v22.22.2 and are rechecked with rfc8785. Neither path imports the helper: 18 checked, 0 mismatches.

**Fixture boundaries, labelled in the cases.**
- **Reported length:** `app-binary-reported-length-4294967296` and `-4294967295`, the bin32 limit.
- **Exact-type gates:** `append-policy-str-subclass` and `payload-media-str-subclass` (str subclass), `producer-mapping-proxy-bytes` (complete mapping, not a dict), `history-self_equal_binding` (an object claiming equality) and `history-untyped_recipe` (a plain tuple of the recipe values). Each isolates one exact-type predicate that JSON input alone cannot reach.

The `--scope all` run and the gate regressions ran on `2f02517bb3`, the code commit before its witness amend. `7b370be1401a6183147917b68d78b165814c0122` differs from it only in the mutation set, which neither reads; the number-scope, `--mutations`, control and review reruns ran on `7b370be1401a6183147917b68d78b165814c0122` itself.

**Date-time gate after the corpus change.** `--scope all` on the full `Plans/` tree: inventory `pass`, 233 nodes (133 Storage, 89 other-owner), 0 unclassified. The corpus content pin in `scripts/pm_event_datetime_exclusions.json` was recomputed from source (`sha256(json.dumps(json.loads(text)))`): `31829a41...` → `e0b9edbe5d895a146b76e9bd7d79a168b424aca123b243e99c0ba1659dc06a31`. Nothing else in that file changed.

**Limits.**
- Generation covers refusal sites, guard predicates and relational boundaries. Non-refusal behaviour (byte layout, ordering, kinds) is covered by the hand-written rule mutations: complete for the listed rules, not for every conceivable defect.
- Four survivors are declared; a reviewer checks their reasons. The CLI exit status is checked by fresh-process runs, not by the in-memory corpus.
- `--scope numbers` says nothing about date-time. Native custody, durability and family admission remain NOT_RUN; guard isolation stays SWEEP_PENDING.

**Scope.** Changed: `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json`, the number cases of the corpus, the corpus content pin, the adoption guide's number-only Self-check paragraph and this report set. Unchanged: `scripts/pm_event_numbers.py`, `scripts/pm_event_index_binding.py`, every helper function and recipe, all date-time code and data except that pin, owner prose, pinned schemas, generated shards and index, the registry, the Decision Log, Spec Lock, `.evidence` and `.gitignore`.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/cli-runs.json` | `b480d66192a96bcfda79b3eeced22e77d80a79395ba4f54903e105ea68d46a93` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/head-numbers-mutations.stdout.json` | `574a2c4397af67512cf1ce6b7eacd6d809038560ead9f2fc5c047f7a8d70061b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/head-numbers.stdout.json` | `7e963471223c2aa0f79ec630e676783dad0f5ca49b285720f9a468a518b73959` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/review-rerun/own-mutations.json` | `403e2f6924e4553568719255d759841f13b50cc62c5db842d7656b97178a442a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/review-rerun/refusal-sweep.json` | `55f1f812ba6bea4f9075438745e59511188d14f9be5f36dbc23cfec3b75aa727` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/review-rerun/gate-route/route-gaps.json` | `de9f389eae09352fc87a6a41f2c9e0eb379c9e7b32b9874e2b2688e9a92f16ee` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/review-rerun/gate-cli/cli-mutations.json` | `7aa69d27ac399278a20ebc3a7f3419e6241afa47aa9ea95c91fa4fd802e93c3a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/vector-crosscheck.json` | `8de803b5aa199bb2245e8ebd4c6232b88dfa216bf830c1dfd96d9260141221b6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/gen-cases.json` | `0a7847d2b318f4ce38508696b506f745eeb494cc3c622a8f5f966d067e220d1d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/full-selftest-summary.json` | `6a4a54b1f4854f424996e408920bdd2c8027d60c7571d16254b0e06d527473fe` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix3/extraction.sha256` | `fd2774e4f1ef0759aed5321e957934a46624f0bd952029c33843934a8fc51db7` |

## Opus pre-check (numbers fix 3): findings and responses

Scope: CV-1100, SP-1100, SP-1101, the number corpus, its runner, the mutation set and the number-only section of the adoption guide. Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-numbers-fix3-opus.md` (blind Opus pre-check, NOT_READY at `9f873ad83469b4e53a6579fb115f5ef2270e1f12`): one High blocking finding, one Medium, three Low, one Info. Brief: `lanes/NUMRULE-NUM-FIX4.md`. Implementation commit `98490285ec`. **No production helper code changed:** `scripts/pm_event_numbers.py`, `scripts/pm_event_index_binding.py` and `scripts/pm_projects_refresh_contracts.py` are byte-identical to `9f873ad834`. Every edit is to the corpus, its runner, the mutation set, the corpus content pin, the guide's number-only section and these records.

| | |
|---|---|
| **Goal** | A wrong implementation of any adopted number API fails the number corpus, and "an owner rule with no row" can be checked mechanically. |
| **Gap** | The 71-row rules table was written by hand. It missed about 15 owner rules, 82 of 173 hand-written mutations named no rule, and the reviewer's 20 unseen mutations caught only 7. The survivors sat where one rule ranges over several fields, containers, tokens or defaults. |
| **Gain** | The rules table is now derived from the owner text. The self-test re-extracts all 194 statements (every sentence of the three units' `canonical_text`, `acceptance_criteria` and `negative_constraints`, and of the guide's number sections) and fails on a statement with no row or a stale row. Every row names witnessed rules or says why no mutation applies. All 20 unseen mutations and S1–S8 are committed and caught. Three new generated families cover the review's field, container and delegated-refusal classes. |

**Totals** (`python3 scripts/pm_event_numbers.py --self-test --scope numbers --mutations`, exit 0):

| Measure | Count |
|---|---|
| Owner statements extracted | 194 (CV-1100 31, SP-1100 19, SP-1101 36, guide 108); 146 carry a normative marker |
| Statement rows | 194: 114 name rules (all caught), 80 say why no mutation applies; 0 without a row, 0 stale |
| Rules | 108 (71 kept, 37 new), all caught; one is a harness control that must survive |
| Hand-written mutations | 206, each naming its rule (0 orphans) |
| Generated mutation points | 160: 64 refusal sites, 34 guard predicates, 12 boundaries, 19 delegated refusal calls, 8 container branches, 23 field iterations |
| Mutations | 366 |
| Caught | 362, each with its witness among the failures |
| Survivors | 4, all declared with a reason (below); 0 undeclared |
| Not applied, build errors, runner exceptions | 0, 0, 0 |
| The fix-3 review's 20 blind mutations | 20 caught in the committed set; 20 of 20 by the review's own script on a scratch copy |
| The fix-2 review's 15 blind mutations | 15 caught (review's own script on a scratch copy) |
| Number corpus | 544 cases (266 positive, 278 negative), 61 owner checks |

**Reviewer reruns from scratch copies.** Each reviewer tool ran byte-identical (SHA-256 in `review-rerun/tool-sha256.txt`) and unmodified, on a copy of the extraction of `98490285ec` (`extraction.sha256`). Each mutant is a real source edit in a throwaway copy, judged by a fresh `--self-test --scope numbers` CLI process.

| Reviewer set | Result | At its review |
|---|---|---|
| Fix-2 `own_mutations.py`: 15 blind mutations | **15 of 15 caught**; supplementary: `control-noop-comment` survives (correct), the other 3 caught | 6 of 15 |
| Fix-3 `own_mutations3.py`: 20 blind mutations | **20 of 20 caught**, each differing on its probe; supplementary S1–S9: **9 of 9 caught** | 7 of 20; S3–S6, S8, S9 survived |
| Fix-3 `delegated_sweep.py`: 20 delegated calls + 5 binding raises | 20 of 20 calls caught (the `_scalar_string(k)` key sort included); binding raises: `:75` now caught, `:18`, `:34`, `:53` survive | 19 of 20 calls; 1 of 5 raises |
| Fix-3 `freshness.py`: F1–F5 scratch edits under `--mutations` | **F1–F5 all exit 1.** F5 (the alias `_deny = _refuse` with a `_deny(...)` site) fails with `refusal alias or indirect reference: _refuse at line 119`; F4 reports the new key `site:exact_boolean:boolean_type#2` | F1–F4 exit 1, **F5 exit 0** |

The three surviving binding raises are the review's own equivalence and capacity list: `:34` is unreachable (every caller passes `str`, `array` or `map`), `:53` falls through to the closing `TypeError`, which `storage_value_bytes` maps to `binding_domain` all the same, and `:18` needs a string longer than 2^32 bytes. The binding module is not enumerated (finding 3).

### Finding 1 (High, blocking): unseen mutations, 7 of 20 caught — fixed in `98490285ec`

- **Where:** the number cases of `Plans/event_number_recipe_corpus.json` had no input that told the 13 survivors apart; the generator (`mutation_points`) produced only refusal-site, guard-predicate and boundary mutants.
- **Why:** each survivor broke one member of a rule that ranges over several fields, containers, tokens or defaults, and the corpus tested another member.
- **Fix:** one or more single-defect cases per survivor, each committed mutation's witness, plus the generator families below.

| Review mutation | At review | Now | Witness case (new) |
|---|---|---|---|
| R06 `parse-arrays-not-walked` (blocking) | survived | caught | `parse-array-lone-surrogate` (`["\ud800"]`), also `parse-array-object-lone-surrogate`, `parse-nested-array-lone-surrogate` |
| R09 `jcs-kind-exponent-as-integer` (blocking) | survived | caught | `jcs-typed-integer-10^21-exponent-token` (`jcs_value`, `@int` 10^21, `typed: true`, error `jcs_kind`); producer route `producer-type-qualified-10^21-bytes` |
| R16 `full-value-app-profile` (blocking) | survived | caught | `full-value-float-known-answer` (independent known answer, below) |
| R19 `recipe-skips-first-field` (blocking) | survived | caught | `recipe-empty-envelope-schema-id`; one empty case per field (13 new + `recipe-empty-owner-edition`), `recipe-integer-envelope-schema-id` |
| R20 `binding-skips-last-field` (blocking) | survived | caught | `binding-empty-source-commitment`; one empty case per non-project field (7 new + `binding-empty-event-id`) |
| R02 `jsonnumber-fraction-digits-optional` | survived | caught | `json-number-malformed-1.`; also `.5`, `1e`, `1e+` |
| R03 `jsonnumber-exponent-no-plus` | survived | caught | `parse-exponent-1e+2` (positive with `returns`), `json-number-exponent-1e+2` |
| R04 `float-marker-lowercase-e-only` | survived | caught | `parse-exponent-1E5`; also `1E+5`, `-2.5E-3` |
| R05 `parse-bytes-utf8-sig` | survived | caught | `parse-utf8-bom-bytes` (`raw_hex: efbbbf31`, `json_syntax`) |
| R07 `kind-accepts-unknown-label` | survived | caught | `jcs-numeric-kind-number` (`kind: "number"`, `jcs_numeric_kind`) |
| R11 `dispatcher-override-truthiness` | survived | caught | `history-falsy-override-empty-list`, `history-falsy-override-false` (new `falsy_override` scenario) |
| R15 `decode-default-profile-app` | survived | caught | `decode-default-profile-float32`, `decode-default-profile-noncanonical-float64` (S9) |
| R18 `payload-media-casefold` | survived | caught | `payload-media-case-variant` (`Application/JSON`) |
| R01, R08, R10, R12, R13, R14, R17 | caught | caught | unchanged witnesses (R08 `jcs-binary64-only-10^23`, R13 `app-binary-256`, R14 `app-binary-65536`, R17 `payload-inline-limit`) |

Supplementary: S1, S2 and S7 stay caught. **S3** (`INDEX_BINDING` `surrogatepass`) is caught by `physical-binding-lone-surrogate`; **S4** (`APPEND_ONCE`) by `append-policy-uppercase`; **S5** (payload `minimum=1`) by `payload-empty`; **S6** (`storage_value_bytes` default `APP_PHYSICAL`) by `physical-default-profile-float32` and the R16 known answer; **S8** (`ParsedDecimal` default kind) by `parsed-decimal-default-kind`, through a new `parsed_decimal` operation on the public carrier. S9 is the same source edit as R15 and is not committed twice. All 28 are committed as `source: review-fix3`.

**R16 known answer, built independently.** The case adds four fixture-only float members to the frozen base original event's payload: `1.5`, `1.0`, `-0.0` (float32-exact, `ca`) and `0.1` (float64, `cb`). The expected SHA-256 comes from an EventRecord MessagePack encoder written from SP-1100/SP-236 in the case generator. It never imports the helper, and it first reproduces the frozen CV-339 vector of the base event (`commitment_preimage_hex` and `commitment_sha256` of `Plans/event_append_receipt_full_value_fixtures.json`) byte for byte.

**Generator families, new** (`GENERATED_FAMILIES` in the runner; keys carry no line numbers):
- **`delegated_refusal`** (19): every call inside the helper to a module-level function or class that holds a refusal site, directly or through another such call. The mutant replaces the call with its first positional argument, the unchecked input. All 19 are caught, including the review's `_scalar_string(k)` key-sort survivor (new case `physical-lone-surrogate-key`).
- **`container_branch`** (8): every `if`/`elif` branch tested by `type(x) is list` or `type(x) is dict` (the `loads_exact` walk, `loads_current_json.materialize`, `qualified_jcs.adapt`, `storage_value_bytes`). The mutant deletes the branch. All 8 are caught; R06's class is now generated.
- **`field_iteration`** (23): every `fields(self)` loop, once per field of its dataclass. The mutant skips that field. 22 are caught by the per-field cases. Skipping `project_id` is a declared equivalence: the loop body already exempts it.

The review's third family, wrong literals and defaults, is not generated. Its mutations are committed by hand instead (R02–R04, R07, R15, S4–S6, S8), each with its own case.

### Finding 2 (Medium): the hand-written rules table missed owner rules — fixed in `98490285ec`

- **Where:** `scripts/pm_event_numbers_mutations.json`, `rules`.
- **Why:** the table was written from memory, one rule per predicate the author thought of, so a rule with no row could not be detected.
- **Fix:** the rules table is derived from the owner text, in two levels:
  - **Statements** (`statements`, 194 rows): `owner_statements()` in the runner splits every sentence of the selected owner text. The selection is data (`owner_text`): the three units' YAML fields, and the guide's `(preamble)`, Shared calls, Number-only adoption, Authority boundary and Validation and limits sections. Excluded by name with a reason: the five CV-1101 date-time bullets of Shared calls, the Timestamp grammar row, and the Per-lane replacements and Ancillary lanes sections. A guide section that is neither selected nor excluded, or a block exclusion that matches nothing, fails. Each row records its source path, line and exact text, and names its rules or gives a `no_mutation` reason; a `note` marks a clause outside the helper (for example the CV-366 typed tree, which `pm_projects_refresh_contracts` owns).
  - **Rules** (`rules`, 108 rows): predicate-level, each listing its mutations. Every hand-written mutation names its rule through a `rule` field, and the rule must list it back.
- **The self-test check** (`check_rules_table`, in `--mutations`): a statement without a row, a row whose line no longer holds its text (with the statement's new line in the message), a duplicate row, a row with both or neither of rules and reason, an unknown rule, a rule named by no row, and a mutation with no rule each fail.
- **The review's 16 missing rules all have rows now:**

| Owner text | Rule (new unless marked) | Mutations |
|---|---|---|
| CV-1100 profile dispatch | `full-value.event-value-profile`; `physical.default-event-value` | R16, `full-value-msgpack-packb`; R15, S6 |
| SP-1100 para. 1, last sentence | `payload.exact-media` | R18, `payload-no-media-refusal` |
| SP-1101 acceptance 3 | `dispatch.no-caller-override` | R11, `dispatcher-no-override-refusal` |
| Guide, Shared calls 2 | `kind.closed-set` | R07, generated `jcs_numeric_kind` site |
| Guide, Shared calls 2 / RFC 8259 | `json-number.grammar` | R02, R03, R04 and three earlier `json-number-*` mutations |
| CV-1100 / SP-1100 / guide | `binding.domain` | S3, generated `binding_domain` site |
| CV-1100 sentence 2 | `no-decimal-rounding` | `parsed-decimal-rounds`, `json-number-exact-float`, `jcs-output-rounds-15-digits` |
| CV-1100 null presence | `null-presence` | S7 |
| CV-339 | `full-value.sha256-hex` | `full-value-sha512`, `full-value-returns-bytes` |
| SP-1100 uint64 fields | `storage.uint64-range` | the four `uint64-*` range mutations (the two rounding ones sit under `no-binary64-narrowing` and `integer.exact-value`) |
| SP-1100 finite floats | `physical.finite-floats` | generated `physical_nonfinite` site |
| SP-1100 decoding | `decode.duplicate-keys`, `decode.forbidden-tags`, `decode.invalid-unicode`, `decode.trailing-values` (with `decode.canonical-bytes`, kept) | new `decode-drops-duplicate-hook` and `decode-ignores-trailing`; `decode-no-ext-refusal`, `decode-raw-strings` |
| SP-1101 para. 3 / CV-1100 para. 1 | `dispatch.no-current-guards` | new `dispatcher-current-parser-on-original` (witness `history-negative_zero`) and `dispatcher-current-append-gate-on-original` (witness `history-integral_float`) |
| SP-1101 acceptance 3, replaced resources | row names `dispatch.original-recipe`, `dispatch.verifier-true`, `dispatch.one-verifier-call` (kept) | the frozen verifier refuses; the helper's part is exact tuple lookup and `is True` |
| SP-1101 para. 6, replay-only | `append-policy.replay-only` | `append-policy-no-replay-only-refusal`, generated site |
| SP-337 BLAKE3 | `payload.blake3-id` | `payload-sha256` |

- **Rows without a mutation (80):** governance or ownership (CV-1100's last paragraph, SP-1101's successor-recipe rule), scope statements ("bounded static codec evidence only"), CV-1101 date-time sentences, the guide's descriptions of the harness itself (enforced by `--mutations` problems, not by a helper mutation), file lists and citation practice. Each row says which. 53 of them carry a normative marker; their reasons are in the table.

### Finding 3 (Low): the enumeration saw only literal `_refuse` and `raise` — fixed in `98490285ec` (aliases refused outright)

- **Fix:** `refusal_alias_problems()` fails `--mutations` on any use of `_refuse` or `Refusal` other than a direct `_refuse(...)` call, `raise Refusal(...)`, the call inside `_refuse` itself, or an `except` type. An alias (`_deny = _refuse`), a rebinding, an attribute or import of either name, and the string `"_refuse"` (a `getattr`/`globals()` lookup) all fail. Controls: the review's F5 edit and a `globals()["_refuse"]` edit each give exit 1.
- **Delegated refusal calls:** generated (`delegated_refusal`, above), 19 of 19 caught.
- **Not done:** `pm_event_index_binding.py` is not enumerated, and the ordinal diagnostic (F4) is unchanged; the brief asked for neither. The binding module's `:75` behaviour is now pinned by `physical-binding-integer-key` (`INDEX_BINDING` integer key → `binding_domain`).

### Finding 4 (Low): the CLI entry point had no committed check — fixed in `98490285ec`

- **Fix:** the owner check `cli_failing_corpus_exits_1` executes the helper's module code as `__main__`, in process, with `--self-test --scope numbers --corpus <one-case failing corpus>`, and requires `SystemExit(1)` with printed status `fail`. Under `--mutations` the mutant's own code object runs, so `site:<module>:raise#1` is now caught (witness `check:cli_failing_corpus_exits_1`) instead of declared, and a new hand-written mutation `cli-exit-mapping-always-zero` (`return 0`) is caught too. `--mutations` also runs the real CLI once in a fresh process on the same corpus and requires exit 1 (`cli_subprocess`). The guide now says CI should require both exit 0 and `"status": "pass"`, which covers an on-disk edit to `raise SystemExit(0)`.

### Finding 5 (Low): the site-370 fixture depends on the module-global `len` — documented in `98490285ec`

- **Fix:** documented, not removed: no exact-`bytes` object reports 2^32 bytes without allocating them. The `_reported_length` docstring and both cases' `fixture_boundary` now state the dependence: a behaviour-preserving refactor (`v.__len__()`) fails both cases, a false alarm in the safe direction, never a mask.

### Finding 6 (Info): `--scope all` on the pre-amend commit — rerun

`python3 scripts/pm_event_numbers.py --self-test` (`--scope all`) on `98490285ec` itself, with the full `Plans/` checkout: exit 0, status pass, 13,590 of 13,590 cases (6,929 positive, 6,661 negative), 300 owner checks, date-time inventory pass (233 nodes, 0 unclassified). The recomputed corpus pin is accepted by the inventory gate. 6:56 wall clock, 484 MB peak RSS.

### Production refusals

No mutation exposed a production behaviour that differs from CV-1100, SP-1100 or SP-1101, so no finding is raised and no refusal changed. Two notes for the owner, unchanged from fix 3: an EventRecord string over 2^32 bytes raises `ValueError` from `pm_event_index_binding._length_prefix`, not a `Refusal`; and the guide's statement that `INDEX_BINDING` refuses `binding_domain` holds for integer keys, which `physical-binding-integer-key` now pins.

### Declared survivors (4)

| Mutation | Reason |
|---|---|
| `control-noop-comment` | Harness control (rule `harness.control`): a behaviour-free edit that must survive; reporting it caught would mean false kills. |
| `boundary:qualified_jcs.number:math.copysign(1.0, f) < 0:0#1` | Equivalent: `copysign` returns exactly ±1.0, so `<` and `<=` agree (the review checked 1010 floats). |
| `boundary:storage_value_bytes:v >= 0:0#1` | Equivalent: 0 emits `0x00` on both branches (the review checked −40000..40000). |
| `field:OriginalBinding.__post_init__:skip project_id#1` | Equivalent: the loop body already exempts `project_id`; the separate `original_scope` predicate checks it. |

`site:<module>:raise#1` is no longer a survivor (finding 4).

### Scope and corpus

- **Corpus:** 54 new number cases inserted contiguously after the last number case (40 negative, 14 positive), none with `date_time_profile`. Two existing cases changed text only: the site-370 pair's `fixture_boundary` (finding 5). No case removed.
- **Runner:** new operation `parsed_decimal`; `default_profile` on `physical` and `decode` calls the helper with no profile argument; history scenario `falsy_override`.
- **Date-time:** the only date-time change is the number corpus content pin in `scripts/pm_event_datetime_exclusions.json`, recomputed as the inventory defines it (`sha256(json.dumps(value))`): `e0b9edbe…` → `bc6bcc3c69e4bd0d0828a38b1b67e9079dfa9d32e1b3f62e6207627c203e7cd1`.
- **Guide:** the Number-only adoption Self-check paragraph now describes six families, the rules table and the CLI check; Needs lists the owner text `--mutations` reads.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/` (generators, controls, CLI runs, review reruns, `SHA256SUMS`).

### Commands and exit codes

All runs: Python 3.14.4, msgpack 1.1.2 first on `PYTHONPATH` (wheel SHA-256 `180759d8…`), rfc8785 and blake3 from the user site, Node v22. Heavy runs one at a time, with at least 15 GB available.

| # | Command | Exit | Result |
|---|---|---:|---|
| 1 | `gen_cases4.py <tree> <ev>` | 0 | 54 cases; the encoder reproduces the frozen CV-339 vector |
| 2 | `gen_mutations4.py <tree> owner_text.json` | 0 | 206 hand-written, 108 rules, 194 rows, 160 points; 0 uncaught while picking witnesses |
| 3 | `table_controls.py` (12 controls on scratch copies) | 0 | every control gives its named problem; intact gives none |
| 4 | `check_vectors4.py` (msgpack, Node, stdlib only) | 0 | 20 checked, 0 mismatches |
| 5 | `--self-test` (`--scope all`, full `Plans/`) on `98490285ec` | 0 | 13,590/13,590, 300 checks, inventory pass |
| 6 | `cli_runs.py`: `--scope numbers` | 0 | 544/544, 61 checks |
| 7 | `cli_runs.py`: one-case failing corpus | 1 | status fail |
| 8 | `cli_runs.py`: `--scope numbers --mutations` | 0 | 366 / 362 caught / 4 declared; `cli_subprocess` exit 1; 169 s |
| 9 | `cli_runs.py`: owner sentence added to CV-1100 (scratch copy), `--mutations` | 1 | `owner statement without a row: CV-1100:canonical_text:1.7` |
| 10 | fix-2 `own_mutations.py` | 0 | 15/15 |
| 11 | fix-3 `own_mutations3.py` | 0 | 20/20, S1–S9 9/9 |
| 12 | fix-3 `delegated_sweep.py` | 0 | 20/20 calls; 3 binding raises survive (above) |
| 13 | fix-3 `freshness.py` | 0 | F1–F5 each exit 1 (F5: refusal alias) |

### Limits

- **Statements are sentences, not predicates.** A sentence with several predicates names several rules; whether those rules cover each predicate is a reviewer's judgement, row by row. The 80 rows without a mutation carry reasons a reviewer checks.
- **Rows are pinned to absolute lines.** An unrelated edit above CV-1100, SP-1100 or SP-1101, or in the guide's selected sections, moves rows: `--mutations` then fails and names each statement's new line until the rows are refreshed. Plain `--self-test` is unaffected. `--mutations` needs the three owner-text files beside `scripts/` and `Plans/`.
- **Generation covers six families.** Wrong literals and defaults are not generated; they are hand-written. `pm_event_index_binding.py` is not enumerated.
- `--scope numbers` says nothing about date-time. Native custody, durability and family admission remain NOT_RUN; guard isolation stays SWEEP_PENDING.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/cli-runs.json` | `d2c984160a90c98766aca3faee4334fae6604678afa100085ee17785d215b78e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/head-numbers-mutations.stdout.json` | `860761b63f2fee07c2568c9710479af7694d03c1e5e617d46b29ed82a93c39f1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/head-numbers.stdout.json` | `f14dc3b19ad7a76c8c9f8cce74ba87dfd5fbed1370fe61aa990c4f5c3ce7ca59` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/control-owner-sentence-added.stdout.json` | `9e040661db7203509908cb42df67e52cf92dce5e256584d995df5ba320081f80` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/table-controls.json` | `97d07a1e61ce35b7e2daeede19a379aed8919843bd268d10dd60af74608ca96e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/review-rerun/fix2-own-mutations.json` | `f9f30d160d16e407a10466f263053ddced0d53f7e12719ae42ca588a448a4ac7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/review-rerun/fix3-own-mutations.json` | `54a92fe1c6af3ed0ac70e459968782c50a7cae9d44080c5c55db81f087f4155a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/review-rerun/fix3-delegated-sweep.json` | `927bf9158bcab87b8899959d6e462e413667bb238dda529bc5310226c80bd099` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/review-rerun/fix3-freshness.json` | `105173f54e9e0631a4745a7522d0c2c6babfc8a37d5b7e6e1ec352170b48d770` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/vector-crosscheck4.json` | `d1b2e3e5826f6b9fb31439511cd31d740216bf09d3c353361845da5ca4c31f13` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/gen-cases4.json` | `2eeda1805ac1f4411b2c55bc48f8378f9e40b0edb69df753ebc5c7f691836202` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/full-selftest-summary.json` | `301d4cdb0b9c3a1df0bfebe973646796e629ce37d047450e592c666de6e2e3b8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/num-fix4/extraction.sha256` | `c7a73c4403a2061cd25ce704e4d78349b404f8d85bbf99613295e8c5ac0c9301` |

## Opus pre-check cycle 14: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/NUMRULE-sol/REVIEW-cycle14-opus.md`, a blind pre-check (not a gate) of `85b0ca7ece2c4926874ee5337e7542521308ba06` (fix `a5ae4fc90b`). Verdict NOT_READY: B1 (high) and B2 (medium) blocking, N3 (low), N4–N6 (information). B1, B2, N3 and N5 are fixed in `ff7caf8d7f62705c86f7dff95635cc867f198702`, rebased onto the number-scope head `884d6bd295`. The replay campaign ran at `92c49a488b`, the same fix on `051c303a2a`. The rebase changed no date-time file except the number-corpus pin line that the number scope moved in the exclusions (identical Git object IDs otherwise), and FIX15 touches no number-scope file. The full gate and the self-test were rerun at the pushed fix commit. A first rebase, `492395a74e` onto `9f873ad834`, was superseded by two more number-scope commits before it was pushed; its rerun also passed and is retained.

**B1 — one citation reached under two dialects: fixed, with the lead's simpler option.**
- **Where:** `wildcard_probe` and `reviewed_role` in `scripts/pm_event_datetime_value_probe.py`. `_PositivePaths._value` keeps the first context that reaches a node (`self.nodes.setdefault`), and the deciding loop tested each node once, in that context.
- **Why it broke:** jsonschema evaluates a node in the dialect it was reached under: a node without its own `$schema` inherits the referrer's. The review's `C` (`$ref` to a generic string plus a `pattern` sibling) decides under 2020-12, but under draft-07 the sibling is ignored and `C` is the generic string. Reached first under 2020-12, `C` was credited. Through an embedded draft-07 resource that refers back to it, the value accepted all 653 battery timestamps, and the coherent full gate exited 0.
- **Choice:** the lead offered two routes: evaluate the citation in every context that reaches it (each dialect, base URI and resource), or refuse credit whenever the value's closure is not single-dialect 2020-12. I chose the second, because it is smaller and clearer:
  - **Smaller:** one closure fact, collected during the discovery walk the probe already makes, and one condition. Evaluating every context needs the positive walk keyed by dialect, base URI and resource, and an argument that the list of contexts is complete (dynamic scope makes it open-ended).
  - **Clearer:** a reviewer checks one property. Inside a static 2020-12 closure a node's verdict does not depend on the path that reached it, so one test covers every context. That closes the class by construction.
  - **Cost:** none for committed rows. Every committed Plans schema is 2020-12 (`git grep` finds no other dialect), so no row moves. A future mixed-dialect schema routes to explicit review; it is not refused outright.
- **Fix:**
  1. **Static closure:** the discovery walk records every `$schema` declared at or above each reachable node within its resource, plus the row resource's own dialect. Inheritance is lexical, so a fragment `$ref` into a draft-07 resource counts even when that resource's root is never visited. Non-timestamp credit, automatic or role, needs this set to be exactly {2020-12}. Otherwise `deciding_nodes` is empty and `automatic_credit` is false, so the row fails `wildcard_role_review_required`.
  2. **`all_refused` required outright:** a `wildcard_non_timestamp_role` record now also needs the real validator over the whole map to refuse every battery timestamp. The 8 kept rows meet it, so none moved. Inside a static closure a deciding citation on a positive path already implies it, so this is defence in depth. The mutation table shows that removing it alone fails no check, and removing it together with the dialect rule reopens all five B1 witnesses.
  3. **Regressions:** the review's witnesses in the self-test and as coherent full gates (below).

**B2 — dynamic references inside a citation: fixed.**
- **Where:** the same deciding loop. Its fresh resolver gives `$dynamicRef` an empty dynamic scope, and FIX14 consulted unproven keywords only when `all_refused` was false.
- **Why:** an outer document can `$ref` the map and rebind the `$dynamicAnchor`. A row-level proof then does not hold for the field. The review's record citing the `$dynamicRef` node itself, or a `$defs` node holding it, earned `wildcard_non_timestamp_role`, and the coherent full gate exited 0.
- **Fix:** the same closure fact. If any reachable node carries `$dynamicRef`, `$dynamicAnchor`, `$recursiveRef` or `$recursiveAnchor`, the closure is not static and earns no non-timestamp credit, whatever `all_refused` says.
- **Scope:** the brief names the cited definition's closure. The rule uses the value's closure, which contains it: a citation must be a positive endpoint reached from the value. So every case the brief names is refused. Two more are refused too: a deciding conjunct beside a `$dynamicRef` (the review called that shape harmless and its refusal acceptable), and automatic credit for a value that only carries an anchor.
- **Rows:** no committed Plans file uses any of the four keywords. No row moved.

**N3 — year coverage: fixed in the stated finite scope.**
- **Sweep:** `_year_sweep_values()` in the probe, fixed in code. It has 4,743 timestamps, one block per year from 1970 to 2100:
  - the battery's 16 separator and zone spellings (`T` or `t`, and `Z`, `z`, `+00:00`, `-00:00`, `+05:30`, `-07:45`, `+23:59`, `-23:59`), each with a 0–9-digit fraction that moves with the year. So every year carries every separator, zone and fraction length, and every ten consecutive years carry all 160 battery forms;
  - the first and the last second of the year in every zone, and the last nanosecond in `Z`;
  - the leap day (28 February in a common year), at three times;
  - every real leap second in the frozen table.
- **Checks at use:** every value passes the CV-1101 `date_time` predicate, and every year from 1970 to 2100 is present. `datetime_year_sweep_complete` asserts the per-year composition and that the battery digest is still `a125323b…`.
- **Use:** a deciding citation must refuse every sweep timestamp. Automatic credit now also needs the map to refuse all of them, because the review's main N3 witness (`pattern: "2027-"`) earned automatic credit, not a role.
- **Battery:** unchanged. Blob `40843260b03700e7b41ba4e7472e7ee8f178eb48`, digest `a125323b4261c366275d5f732af49b9f4478e6e3f1c992aaffbcdda4e27e63c3`, `battery_sha256` on all 21 wildcard rows.
- **Rows moved:** none. The 8 kept citations and the 3 automatic maps refuse every sweep timestamp; production `datetime_validator` accepts 0 of 4,743 at both fields of each kept row.
- **Size:** the full cross product, every battery form in every year (23,476 strings), took a full inventory projection from 6 s to 33 s. The rotation keeps every year in every form feature, and every decade in every form, at 11 s.

**N5 — two dialect choices: fixed.** The timestamp-only check and the deciding check now share one validator per proven node, in the dialect the positive walk reached it under. Under the static-closure rule that is the row's single dialect. The timestamp-only list stays as evidence; a role needs `all_refused` anyway.

**N4 and N6 — information: no change.** N4: `values_by_setting_id` stays `other_owner_observation`; its reason states accurately why. N6: the format checkers available depend on installed packages, and a missing checker makes the evidence mismatch, so the gate fails closed.

**Rows moved: none.** At base and head, the inventory, the 18 role records, the battery and the inventory schema have the same Git object IDs, and the inventory exclusion pin `5cd2d30c…` is unchanged. The gate at the head recomputes every row's evidence from source and requires equality, so the new code projects exactly the committed inventory. Totals stay 133 Storage + 89 other-owner + 3 automatic + 8 roles, 0 unclassified. The 8 kept roles keep `all_refused: true` with their citations in `deciding_nodes`.

**Cycle-14 replay (fresh copies of the pre-check's scripts; inputs unchanged).** 78 attack cases and 3 dialect variants, all as expected: 69 refuse, 10 are accepted as roles, and 2 timestamp-accepting values with no record pass as `other_owner_observation`. Every case the pre-check left open now has an explicit expectation:

| Case | Pre-check outcome | Now | Why |
|---|---|---|---|
| `dialect/union_2020_branch_first`, `oneOf_2020_branch_first`, `embedded_d7_resource_with_id`, `embedded_d7_resource_in_defs` | accepted as role; value accepts 653 of 653 | refused, `wildcard_role_review_required` | B1: mixed-dialect closure, and `all_refused` false. |
| `dialect/union_d7_branch_first` | refused (branch order) | refused | Both rules. |
| `dynamicRef/cite_value_node_itself`, `cite_def_holding_dynamicRef` | accepted as role | refused | B2: dynamic keyword in the closure. `all_refused` is true, so the closure rule alone refuses them. |
| `dynamicRef/conjunct_deciding_plus_dynamicRef` | accepted (harmless) | refused | B2, value closure (accepted cost). |
| `pattern/unanchored_absent_year_2027` (role) and `_no_record` (automatic) | accepted; runtime accepts `2027-06-15T12:00:00Z` | refused | N3: the sweep holds 2027. |
| `pattern/lookahead_excludes_exact_battery` | automatic credit | refused | N3: the lookahead excludes the 669 strings, not the sweep. |
| `format/datetime_10digit_fraction` | accepted as role | accepted as role | Stated limit: a 10-digit fraction is not a battery form. |
| `format/ipv4_only`, `not_datetime_minlen31`, `datetime_maxlen19`, `pattern/unanchored_marker`, `maxlen/below_all_timestamps_controls_enum_excluded`, `control/*_deciding`, `dialect/control_both_2020` | accepted as role | accepted as role | Each refuses every timestamp tried, including the sweep. |

**Coherent full gates.** Each input is the pre-check's own (read-only from `reviews/`). Each attack record has a fingerprint recomputed from source. Each inventory is re-projected and its exclusion pin recomputed from source. Each runs through the unchanged full gate over every committed Plans blob.

| Input | Before (pre-check) | Now | Errors | `all_refused` |
|---|---|---|---|---|
| B1: `anyOf` of a 2020-12 citation and an embedded draft-07 resource referring back | exit 0; production accepts 653 of 653 | exit 1 | `wildcard_role_review_required` | false |
| B2: record citing the `$dynamicRef` node itself | exit 0; outer rebinding accepts timestamps | exit 1 | `wildcard_role_review_required` | true |
| B2: record citing a `$defs` node holding the `$dynamicRef` | accepted as role (one-row) | exit 1 | `wildcard_role_review_required` | true |
| N3: `format: date-time, pattern: "2027-"` citation | accepted as role (one-row) | exit 1 | `wildcard_role_review_required` | true |
| Cycle-13 N1 witness | exit 1 | exit 1 | `wildcard_role_review_required` | false |

In each, `deciding_nodes` is empty, the record fingerprint matches, the pin equals the inventory checksum, and the production `datetime_validator` refuses with `DatetimeAdmissionError: datetime_inventory_invalid`, including through the outer rebinding document. The gate stops at inventory validation, before it streams the Plans tree.

**Kept roles, measured independently** (`measure14.py`, with sweep counts added): each of the 8 cited objects refuses all 653 battery samples, all 16 controls and all 4,743 sweep timestamps. Each kept row, through the production `datetime_validator`, accepts 0 battery and 0 sweep timestamps at both fields in every recorded context.

**Cycle-13 replay (FIX14's drivers, fresh copies; expectations unchanged).** All 51 attack cases as expected: 47 refuse, the 3 deciding controls are accepted, and 1 timestamp-accepting value with no record passes. The six coherent full gates (four N1 witnesses, cycle-12 `irrelevant_if` and `vacuous_not`) and the N2 full gate exit 1, each with `wildcard_role_review_required` alone. The literal cycle-12 bypass input exits 1 (84 `inventory_schema` errors from its obsolete evidence format).

**Cycle-11 and cycle-12 replays (FIX13's drivers, fresh copies).**
- **Targeted probes:** 48 of the 48 original probes keep their exact gate outcome, and the 5 added in round 13 still fail on their stale pins (53 total).
- **Adjacent checks:** 14 of 14 refuse with `wildcard_role_review_required`.
- **Full gates:** both coherent B7 variants, the sibling and foreign-key gates, and all three literal earlier inputs exit 1.
- **Pin audit:** the 18 role pins equal the source recomputation, and each citation is in its graph.

**Self-test controls (19 added; none removed or moved).** Each refusal check also asserts that the citation is a positive endpoint for every field and is not in `deciding_nodes`, so the path rule alone would have accepted it. Each also asserts the expected `all_refused`.

| Check | What it covers |
|---|---|
| `datetime_role_authority_refuses_closure_dialect_embedded_draft7_resource`, `_with_id`, `_union_2020_first`, `_union_draft7_first`, `_oneOf_2020_first` | B1: the pre-check's witnesses, both branch orders, `anyOf` and `oneOf`, the embedded resource in `$defs` and inline with its own `$id`, and a nested `$schema` without `$id`. Each value accepts every battery timestamp. |
| `…_closure_dialect_mixed_value_refuses`, `…_dialect_2019_09_only` | The value refuses every timestamp and the citation decides under both dialects, or the only dialect is 2019-09. The closure rule is the only reason for the refusal. |
| `…_closure_dynamicRef_cites_value_node`, `…_dynamicRef_cites_holder`, `…_dynamicRef_beside_deciding_conjunct`, `…_dynamicAnchor_in_citation`, `…_recursiveAnchor_in_citation` | B2: the pre-check's two witnesses, a `$dynamicRef` beside a deciding conjunct, and a citation carrying only `$dynamicAnchor` or `$recursiveAnchor` (both are annotations on the positive walk). `all_refused` is true in each. |
| `datetime_role_authority_accepts_closure_one_dialect`, `…_closure_unreachable_draft7_resource` | Controls: the same union in one dialect, and the draft-07 resource present in `$defs` but unreachable, keep their role. |
| `datetime_role_authority_refuses_undecided_year_sweep` | N3: a citation refusing the battery and the controls but accepting `2027-…`. |
| `datetime_automatic_credit_withheld_mixed_dialect`, `…_dynamicAnchor`, `…_year_sweep` | Automatic credit: each value refuses every battery timestamp with no unproven keyword, so only the closure rule or the sweep withholds it. |
| `datetime_year_sweep_complete` | Every year from 1970 to 2100 carries both separators, all ten fraction lengths and all eight zones, the first and last second, the leap day exactly in leap years, and real leap seconds. The battery digest is still `a125323b…`. |

**Mutation controls.** Each FIX15 guard was reverted in a scratch copy of the scripts. The unchanged authority checks were run, and the B1 and B2 witness inputs were replayed through a one-row projection:

| Reverted guard | Checks that then fail | B1 witness | B2 witness |
|---|---|---|---|
| dialect rule removed (B1) | `automatic_withheld_mixed_dialect`, `closure_dialect_2019_09_only`, `closure_dialect_embedded_draft7_resource`, `closure_dialect_embedded_draft7_resource_with_id`, `closure_dialect_mixed_value_refuses`, `closure_dialect_oneOf_2020_first`, `closure_dialect_union_2020_first` | refused (citation decides; `all_refused` false) | refused |
| dynamic-keyword rule removed (B2) | `automatic_withheld_dynamicAnchor`, `closure_dynamicAnchor_in_citation`, `closure_dynamicRef_beside_deciding_conjunct`, `closure_dynamicRef_cites_holder`, `closure_dynamicRef_cites_value_node`, `closure_recursiveAnchor_in_citation` | refused | **accepted as role** |
| `all_refused` requirement removed (B1) | none | refused | refused |
| `all_refused` and dialect rule both removed | `automatic_withheld_mixed_dialect`, `closure_dialect_2019_09_only`, `closure_dialect_embedded_draft7_resource`, `closure_dialect_embedded_draft7_resource_with_id`, `closure_dialect_mixed_value_refuses`, `closure_dialect_oneOf_2020_first`, `closure_dialect_union_2020_first` | **accepted as role** | refused |
| sweep removed from the deciding check (N3) | `undecided_year_sweep` | refused | refused |
| sweep removed from automatic credit (N3) | `automatic_withheld_year_sweep` | refused | refused |

`closure_dialect_union_draft7_first` refuses even with the dialect rule removed: the positive walk reaches the citation first under draft-07, where it does not decide (the pre-check's branch-order observation).

**Self-test.** `full_git_checks.py selftest` runs the unchanged `run_corpus` (`--scope all`) over all 8968 committed Plans blobs through the Path I/O adapter:
- **At `92c49a488b`:** exit 0, 13486 of 13486 cases, 318 of 318 integration checks (19 added), date-time gate `pass` over 233 nodes, in 620 s.
- **At the pushed `ff7caf8d7f`:** exit 0, 13590 of 13590 cases and 319 of 319 integration checks (the 104 new cases and the one new check are the number scope's), in 642 s. The full gate also passes on its own: 233 nodes and 8879 Git blobs read, in 252 s.

FIX15 changes no corpus case. FIX14 took 420 s for the self-test. Most of the difference is the year sweep: a full inventory projection now takes 11 s instead of 6 s.

**Guide.** In `NUMRULE-ADOPTION.md`, the date-time role paragraph now states:
- the static-closure rule;
- that a role needs `all_refused` outright;
- the year sweep in the deciding check and in automatic credit;
- that the 16 strings, the sweep and the battery are finite, refusal-only tests;
- that `timestamp_only_nodes` is evidence.

The old sentence about conditions and negations on a timestamp-accepting value's proven paths is gone: such a value now never earns a role at all. No number section changed.

**Scope.** Changed: the probe, the admission checks, one paragraph of the guide, and this report set. Unchanged by Git object ID:
- the inventory, the role records, the battery, the inventory schema and the exclusions;
- every number-scope file (`scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json`, the number corpus, `scripts/pm_event_index_binding.py`) and the number sections of the guide;
- owner prose, registry, Decision Log, Spec Lock, `.evidence` and `.gitignore`.

Native authority remains NOT_RUN. Guard isolation remains SWEEP_PENDING. No family is graded.

**Limits.**
- **The sweep is finite.** The battery, the 16 strings and the 4,743 sweep timestamps can only withhold credit. A citation that refuses all of them but accepts another timestamp form passes. Examples: the pre-check's 10-digit fraction (not a battery form, so outside the brief's sweep), or a lookahead that also excludes every sweep string. This is FIX11's stated boundary for automatic credit, now with every year from 1970 to 2100 covered.
- **The closure rule is conservative.** It reads the reachable closure of the whole map, not only the field's value paths, and it refuses a dynamic keyword wherever it sits. A future mixed-dialect or dynamic schema needs an explicit review, even where it would be harmless.
- **Kept roles stay human judgements.** The eight remaining roles are reviews of object-valued maps. The gate binds them to exact source and value paths, but does not prove the reviewer's judgement.
- **Not rerun:** the cycle-10 replay suite, which this brief does not list. Its last run is `drafts/NUMRULE/fix13/cycle10-replay`.

**Execution.** Checkers ran serially from fresh driver copies on a `git archive` extraction of the 102 cycle-12 inputs at `92c49a488b` (and, for `rebased-head/`, at `ff7caf8d7f`), each file checked against its Git blob. Every start had at least 6 GiB available. Adaptations are listed in the evidence README.

One harness error occurred. The first mutation driver required `dialect_union_draft7_first` to fail with the dialect rule removed. It does not: the walk first reaches the citation under draft-07, where it does not decide. The failed run is retained in `harness-errors/`. The expectation was corrected, a per-mutant witness replay was added, and the campaign resumed at the mutation step after a scratch-integrity check.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/results.json` | `4167732743ea8d79bbb3b07253584ed7915ff4f116ed30d718825b9205c0287f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/row-moves.json` | `13c99f02d9a1c1b27c20d46fe1a8f310f795176c9e0addab19593c43f6d3c67c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/mutation.json` | `45504fdb3c7c34b80672138143913484832c1efaec94afc70032b578fa550d3d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/preservation-92c49a488b.json` | `1d2977b5cfe4a13a560683f8243029631db7b7c60f45323bacea9310ff60b64c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/preservation-ff7caf8d7f.json` | `2ff95b7ee67491a4c9ab5e6faee4b5c4b6160411dd0e150c80ae6c15029ac777` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/campaign.json` | `56943c62ac7160b0da1ccace42af6dc13003b48fa13e71edfc903da4153cfdb4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/cycle14-assertions.json` | `749744fcd666ad091371f3011c6b0bb4b1c945f1ea8a622fa60afe87b81aeb54` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/attacks14.json` | `a03f95feeb06992cd738f8f4a7197b66b35f178f931266a3c1d288449ad633b8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/variants14.json` | `af2cd5f490c9522558eb0f4cb94caf9a53f1955d921e9e72a8f2fe35a79500f4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/measure14.json` | `43258777ae39e43714762304c25c2586af8fe48875129e2c77482dba1d6ce4ee` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/dialect-setup.json` | `fa5e7ada6ccceab3b714433829a47ff3266472e5b32f74479f8a491b18b851b2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/dynamicref-setup.json` | `3a87705467b4101547e389ee73328c2744b8fd5895aa6054a20b30629d1a38cf` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/dynamicref-holder-setup.json` | `ed2a6ddb39af535348338f419828ab17b0d96d0044ffdf3b5f9af95e459ed90e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/year-2027-setup.json` | `bb747f979524ce833e29473618350a296ee0f2634a3b896733811474737b6cac` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle14-replay/n1-witness-setup.json` | `125057fbe3530b0eb5eacea6bff28364ce7f311365f99fa2ccfef979f1f3df0f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/precheck-replay/precheck-assertions.json` | `e904830f3ca3d19fa3f6ef120ffebec3108c6b91b08edff41d96c061490fc000` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/precheck-replay/attacks.json` | `eea36566c329b7fd1665e4cd62e5a42aa99862cb877b15018fe6b349937b9cd6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle12-replay/result-assertions.json` | `813837af5602bdf481272e090c5cfb34001d483b4fa520684d4c7daba18b7589` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle12-replay/targeted-checks.json` | `390c38afeaf3a31b197c251c89abc378d94ed9a86e0c9ed437b4f518931c5652` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle12-replay/adjacent-checks.json` | `a082839f21388e0d57149ff0cd863b8247d7ae2706e7358e0d28e16b992caea5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle12-replay/full-selftest.json` | `d0de54716aa04913058407796cbce56198d7fb5d6e9f7ced7dbfacc2fafab5c8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/cycle12-replay/full-selftest-inventory.json` | `920e17992b18ca7bec8c55e2bbb9dbc29cd4a338b04302ef1a28957446e2cdba` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/rebased-head/full-gate.json` | `e8a722e7e20593a945f158ba23938930397c57943a4fc048592fc8621ce9d0ea` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/rebased-head/full-selftest.json` | `c513fe15611901febd1110e60c75229349f8dc108d14ab6426fa5d3b1cc3b296` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix15/harness-errors/run1-campaign.stdout` | `bf2a7eba5431cff473dca04c8ad87f23fd0bd1a0c3c648b2f6c702c069ccbd5d` |

## Gate bar self-check (date-time)

Brief: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/NUMRULE-FIX16.md`. Bar: `reviews/GATE-BAR.md` ("Same bar for the date-time gate, with its own site and rule lists"). Base `1161543510`; implementation `8f8483eae3`. The date-time gate now has the self-check machinery the number scope built in its fix rounds 3 and 4: sites enumerated from the AST, a rules table derived from the owner text, one hand-written mutation and one corpus case per behaviour rule, and every earlier replay attack as a corpus case. Production behaviour is unchanged: `pm_event_datetime.py`, `pm_event_datetime_inventory.py`, `pm_event_datetime_value_probe.py`, the inventory, the roles, the battery, the inventory schema and the exclusions keep their Git object IDs.

**Totals.**

| Measure | Count |
|---|---|
| Enumerated sites (mutation points) | 197: 103 refusal sites, 60 refusal-guard predicates, 23 credit predicates, 11 comparison boundaries |
| Owner statements extracted | 108 (82 with a normative marker): 35 from CV-1101, 73 from the guide's date-time blocks |
| Statement rows | 108: 96 name rules, 12 give a reason no mutation applies |
| Rules | 72, all caught |
| Mutations | 280: 197 generated, 83 hand-written |
| Caught, with the committed witness failing | 273 |
| Survivors | 7, all declared, every reason an equivalence or unreachability (table below) |
| Build errors, runner exceptions, undeclared survivors | 0, 0, 0 |
| Self-checks (the date-time corpus of this bar) | 445, all passing on the intact code |

**What was added (date-time files only).**
- `scripts/pm_event_datetime_mutations.py`: the AST enumeration, the mutant builder and runner, the owner-text rules table and the freshness checks. `--self-test` runs every self-check and the freshness checks; `--mutations` replays every mutant. This is the sibling self-test command: `pm_event_numbers.py --mutations` belongs to the number scope.
- `scripts/pm_event_datetime_mutations.json`: the committed set. One entry per enumerated point (witness or declared survivor), 83 hand-written mutations, 72 rules and 108 statement rows.
- `scripts/pm_event_datetime_selfcheck.py`: 445 fine-grained checks, each one named function that runs alone, so a mutant's witness runs in seconds. They call the date-time functions directly: the predicate and its profiles, the format checker, the closed graph and the bound validator over a `StorageSelection` built from explicit rows, the scan over scratch `Plans/` trees, `validate_inventory` and `check_inventory` over one-row scratch inventories, the value probe over one rewritten map, and `reviewed_role` over explicit evidence.
- `scripts/pm_event_datetime_attacks.json`: the 97 single-map attacks of the cycle-11 to cycle-14 replays.
- `scripts/pm_event_datetime_admission_checks.py`: `regression_checks` now also runs every self-check and the five freshness checks, so the default `pm_event_numbers.py --self-test` (`--scope all`) fails on a stale site, a refusal alias, an owner statement with no row, a stale row, an unnamed rule or an orphan hand-written mutation.

**1. Enumerated sites.** `mutation_points()` reads the AST of the three date-time modules: the predicate, format checker and runtime admission (`pm_event_datetime`); the scan, the gate, `validate_inventory` and `StorageSelection` (`pm_event_datetime_inventory`); and the value probe with its timestamp-only, deciding, closure, automatic-credit and role checks (`pm_event_datetime_value_probe`). Keys name the module, function, refusal code or predicate text and an ordinal, never a line number. The families:
- **Refusal sites (103):** every `raise`; every `_refuse(...)` call; every call to a local error sink (a nested function that appends to `errors`: `fail`, `unsupported`); every error record (a dict literal with an `"error"` key); every `errors.extend`; every error-code tuple a function returns (`reviewed_role`); every `"status": "fail"` constant; and every withholding call of the probe (`dependencies.append`, `unproven.add`, `dialects.update`, `dynamic.update`), which records a reason to withhold credit. Each site is keyed by its refusal code, so each code is its own point. The mutant disables that one site.
- **Refusal-guard predicates (60):** every predicate of an `if` or conditional-expression guard of a refusal site, up to the function, the `else` branch included with the opposite polarity, where dropping that predicate alone makes the refusal fire less often (an or-operand becomes False, an and-operand under `not` becomes True, an element of a literal tuple scanned by `any`/`all` or tested with `in`/`not in` is dropped).
- **Credit predicates (23):** the date-time gate grants credit, so its weakest direction is a credit guard that fires too often. Every predicate of the guard of a credit site, and of a credit assignment, is weakened so the credit is granted more often: `deciding_nodes` and `timestamp_only_nodes` entries; the `static`, `all_refused`, `automatic`, `credited` and `on_value_path` assignments; and the scan's `used.add` exemption (the exclusion content pin). The credit and withholding names are committed; a name that no longer names a site fails the self-test.
- **Comparison boundaries (11):** every `<`, `<=`, `>` and `>=`; the mutant flips strictness.

Freshness: a new point with no committed entry, or a committed entry with no point, fails `datetime_gate_bar_sites_fresh`. An aliased or indirect refusal (`_deny = DatetimeAdmissionError`, `add = errors.append`, a refusal name as a string, an import under another name) fails `datetime_gate_bar_no_refusal_alias`. Self-checks `datetime_gate_bar_detects_*` show each detector firing on a planted defect.

How a mutant runs: it is compiled in memory; all three modules are rebuilt as fresh module objects (so no resource-selection or bound-validator cache survives), and its witness runs alone. A witness is a self-check (`check:<name>`) or a date-time corpus case (`case:<id>`). It counts as caught only if that witness fails; a build error or a harness exception is never a catch. A declared survivor must survive all 445 self-checks and all 6,539 date-time corpus cases.

**Declared survivors (7).**

| Point | Reason |
|---|---|
| `site:datetime_inventory:decoded_documents:ValueError:empty JSON container#1` | Equivalent. Every caller passes non-blank text (a file or block that mentions a field or a $-keyword) or treats an empty result exactly as the refusal: _exclusion_schema_paths catches ValueError and continues (no documents either way); validate_inventory's citation read then fails with KeyError (classification_citation_unreadable either way); _source_document falls back to Markdown blocks and gets {} (KeyError, inventory_source_unreadable either way). |
| `predicate:site:datetime_inventory:scan:ValueError:exclusion_purpose_citation_unreadable#1:false not citations#1` | Equivalent. citations comes from str.split(';'), which always returns at least one element, so not citations is always False. |
| `site:datetime_inventory:scan:scan_walk_failed#1` | Unreachable. The outer handler covers only file.relative_to(root), which cannot fail for a path yielded under root/Plans, and the per-file try whose own handler catches the same exception types. The walk itself runs earlier, inside the exclusion block, where a cycle or broken symlink is reported as scan_exclusions_invalid (witnessed by datetime_unit_scan_symlink_cycle and datetime_unit_scan_broken_symlink). |
| `predicate:site:datetime_inventory:validate_inventory:source_lineage_role_invalid#1:false 'documents' not in document#1` | Equivalent. The row's pointer was already resolved in the same document (at(document, row['pointer'])); a pointer that matches /documents/N/changes/N/... resolves only if 'documents' is a key, so when the match succeeds the predicate is always False. |
| `predicate:site:datetime_inventory:StorageSelection.admit:DatetimeAdmissionError:datetime_schema_unclassified#1:false match[0] is not schema#1` | Equivalent. StorageSelection.nodes maps id(node) to (node, row) and holds a strong reference to node, so no other live object can share that id; a lookup that hits always returns the same object. |
| `predicate:site:datetime_value_probe:_PositivePaths._map:unproven.add#1:true keyword in dialect.VALIDATORS#1` | Equivalent. REFERENCES is ('$ref',) and every supported dialect (2020-12, 2019-09, draft-07, draft-06) implements $ref, so the predicate is always True where it is evaluated. |
| `predicate:site:datetime_value_probe:_PositivePaths._value:unproven.add#1:true keyword in dialect.VALIDATORS#1` | Equivalent. REFERENCES is ('$ref',) and every supported dialect (2020-12, 2019-09, draft-07, draft-06) implements $ref, so the predicate is always True where it is evaluated. |

Each is dead or redundant code, not a gap in the corpus. None hides a refusal the owner text requires. They are listed for a cleanup batch (TOOL-ISSUES), not removed here: production code must not change in this round.

Discovery added cases where a first pass showed a survivor that was reachable: the descend guard on an unpinned resolver, every `_constraint_sources` and `source_owner_evidence` refusal, the profile-conflict operand for an owner-schema row with the Storage profile, the field-set mismatch in `admit`, an alias resource URI pinned only by the crawl, a string instance reaching an unclassified declaration through `descend`, and the implicit endpoint shadowed by a value node.

**2. Rules table from owner text.** `owner_statements()` re-extracts every sentence of CV-1101 (`canonical_text`, `acceptance_criteria`, `negative_constraints`) and of the guide's date-time blocks, with the number scope's splitter, so both tables split the shared guide identically. The guide blocks are exactly the six the number table excludes as date-time owned (five Shared calls bullets and the Timestamp grammar row); `partition_problems` fails if the two tables ever overlap or leave a block unowned. FIX11's final rule as committed lives in the Shared calls bullet "Before any runtime installation" with the rules of FIX12-FIX15; its rows are `guide:Shared calls:9.*`:
- FIX11 item 1 (refuses every timestamp: automatic) → 9.9, rule `probe.automatic-credit`;
- item 2 (any timestamp accepted: explicit, source-bound, fingerprint-pinned review) → 9.23-9.25, rules `role.pinned-fingerprint`, `role.citation-own-graph`, `role.timestamp-review`;
- item 3 (the battery is a trigger) → 9.7 and 9.21, rules `probe.battery-trigger`, `probe.deciding`.

Every row names rules or gives a reason; every rule lists mutations, every one caught with its witness failing; every hand-written mutation names its rule. `datetime_gate_bar_rules_table_complete` fails on a statement with no row, a stale row (line or text moved), an unknown or unnamed rule, a rule with no mutation, or an orphan mutation.

Rows with no mutation (12):

| Row | Reason |
|---|---|
| `CV-1101:canonical_text:1.2` | Ownership or governance statement; no date-time code implements it. |
| `CV-1101:canonical_text:3.3` | Exact instant comparison stays with its existing owners; the date-time code compares no instants. |
| `CV-1101:canonical_text:5.4` | An obligation of each adopting lane at its own boundaries; no shared date-time code implements it. |
| `CV-1101:canonical_text:6.1` | SP-1101 original selection is RetainedDispatcher in pm_event_numbers (number scope, its own rules table); the date-time code supplies only the profiles it selects, whose rules are profile.*. |
| `CV-1101:canonical_text:6.4` | Ownership or governance statement; no date-time code implements it. |
| `guide:Shared calls:5.10` | SP-1101 original selection is RetainedDispatcher in pm_event_numbers (number scope, its own rules table); the date-time code supplies only the profiles it selects, whose rules are profile.*. |
| `guide:Shared calls:6.2` | The scope dispatch is run_corpus in pm_event_numbers_corpus.py (number scope), outside the date-time code; the number scope's check number_scope_imported_no_datetime_code covers --scope numbers. |
| `guide:Shared calls:6.6` | Ownership or governance statement; no date-time code implements it. |
| `guide:Shared calls:7.12` | An obligation of each adopting lane at its own boundaries; no shared date-time code implements it. |
| `guide:Shared calls:9.10` | A count of committed review records, not code; datetime_unit_committed_role_counts checks it and the gate recomputes every record's evidence. |
| `guide:Shared calls:9.11` | A count of committed review records, not code; datetime_unit_committed_role_counts checks it and the gate requires each to decide the string. |
| `guide:Shared calls:9.31` | Ownership or governance statement; no date-time code implements it. |

**3. Behaviour rules.** Each rule that is not a refusal has hand-written mutations, each with its own corpus case (a self-check):

| Rule | Hand-written mutations (witness) |
|---|---|
| `predicate.whole-string` | `hw-predicate-prefix-match` (`datetime_unit_date_time_trailing_lf`) |
| `predicate.four-digit-year` | `hw-predicate-five-digit-year` (`datetime_unit_date_time_five_digit_year`) |
| `predicate.separator` | `hw-predicate-space-separator` (`datetime_unit_date_time_space_separator`); `hw-predicate-uppercase-t-only` (`datetime_unit_date_time_lowercase_t_and_z`) |
| `predicate.fraction` | `hw-predicate-fraction-ceiling` (`datetime_unit_date_time_forty_digit_fraction`); `hw-predicate-empty-fraction` (`datetime_unit_date_time_empty_fraction`) |
| `predicate.zone` | `hw-predicate-optional-zone` (`datetime_unit_date_time_missing_zone`); `hw-predicate-uppercase-z-only` (`datetime_unit_date_time_lowercase_t_and_z`) |
| `predicate.leap-second-instant` | `hw-leap-offset-not-applied` (`datetime_unit_date_time_leap_second_offset_applied`) |
| `predicate.leap-second-table` | `hw-leap-local-month-end` (`datetime_unit_date_time_leap_second_unannounced_june`); `hw-leap-table-drops-2016` (`datetime_unit_date_time_leap_second_2016`); `hw-leap-table-guesses-2017` (`datetime_unit_date_time_leap_second_unannounced_june`) |
| `predicate.gregorian-calendar` | `hw-calendar-julian-century` (`datetime_unit_date_time_february_29_century`); `hw-calendar-host-year-range` (`datetime_unit_date_time_year_0000_leap_day`) |
| `predicate.preserve-string` | `hw-predicate-rewrites-string` (`datetime_unit_date_time_lowercase_t_and_z`) |
| `profile.event-record-default` | `hw-profile-default-storage` (`datetime_unit_date_time_default_profile_is_event_record`) |
| `profile.storage-utc-z` | `hw-profile-storage-lowercase-z` (`datetime_unit_date_time_storage_lower_z`) |
| `profile.no-universal-restriction` | `hw-profile-universal-z` (`datetime_unit_date_time_nonzero_offset`); `hw-profile-universal-nine-digits` (`datetime_unit_date_time_forty_digit_fraction`) |
| `profile.selection` | `hw-profile-set-loses-coordination` (`datetime_unit_date_time_every_profile_selectable`) |
| `format.registered-predicate` | `hw-format-name` (`datetime_unit_format_checker_runs_predicate`); `hw-format-raises` (`datetime_unit_format_checker_runs_predicate`); `hw-format-profile-ignored` (`datetime_unit_format_checker_storage_profile`) |
| `format.type-independent` | `hw-format-non-string` (`datetime_unit_format_checker_non_string_passes`) |
| `validator.installs-checker` | `hw-validator-no-checker` (`datetime_validator_real_inventory_format_installed`); `hw-validator-profile-ignored` (`datetime_validator_real_inventory_format_installed`) |
| `composition.storage-utc-z` | `hw-composition-lowercase-z` (`datetime_unit_bound_storage_composition`); `hw-composition-skipped` (`datetime_unit_bound_storage_composition`) |
| `composition.only-storage-fields` | `hw-composition-extra-field` (`datetime_unit_bound_composition_only_two_fields`) |
| `composition.dialect-change` | `hw-composition-unbound-after-dialect` (`datetime_unit_bound_composition_survives_dialect_change`) |
| `composition.preserves-schema` | `hw-composition-drops-original-predicates` (`datetime_unit_bound_preserves_original_predicates`) |
| `admission.every-object` | `hw-admission-skipped-on-descend` (`datetime_unit_bound_unclassified_nested_reference_refused`) |
| `admission.pinned-resources` | `hw-admission-no-resource-verification` (`datetime_unit_bound_resource_mutation_refused`); `hw-admission-no-crawl-pins` (`datetime_unit_bound_alias_uri_pinned`) |
| `admission.closed-registry` | `hw-admission-retrieve-left-installed` (`datetime_unit_closed_graph_missing_resource_refused`) |
| `admission.dialects` | `hw-dialect-admits-draft4` (`datetime_unit_dialect_unsupported_draft4`); `hw-dialect-default-draft7` (`datetime_unit_dialect_supported_four`) |
| `admission.unclassified-declaration` | `hw-declaration-required-ignored` (`datetime_unit_bound_unclassified_nested_reference_refused`) |
| `inventory.owner-schema-no-overlay` | `hw-selection-owner-schema-overlay` (`datetime_unit_bound_owner_schema_no_overlay`) |
| `scan.universe` | `hw-scan-suffix-filter` (`datetime_unit_scan_utf16`); `hw-scan-skips-directory-symlinks` (`datetime_unit_scan_follows_directory_symlink`) |
| `scan.decoding` | `hw-scan-utf8-only` (`datetime_unit_scan_utf16`); `hw-scan-escapes-not-decoded` (`datetime_unit_scan_escaped_names`); `hw-scan-fences-not-authoritative` (`datetime_unit_scan_markdown_fence`); `hw-scan-inline-code-ignored` (`datetime_unit_scan_inline_code`) |
| `scan.property-names-conservative` | `hw-scan-property-names-reference-resolved` (`datetime_unit_scan_property_names_reference_conservative`) |
| `scan.loadable-never-excluded` | `hw-exclusion-references-ignored` (`datetime_unit_scan_exclusion_referenced_file_forbidden`); `hw-exclusion-schema-roots-ignored` (`datetime_unit_scan_exclusion_loadable_schema_forbidden`) |
| `inventory.storage-roles` | `hw-storage-class-drops-index` (`datetime_unit_validate_index_row_clean`); `hw-storage-source-identity` (`datetime_unit_validate_storage_identity_event`); `hw-storage-source-index-identity` (`datetime_unit_validate_storage_identity_index`); `hw-storage-source-envelope-required` (`datetime_unit_validate_storage_required_envelope`); `hw-storage-source-publication-required` (`datetime_unit_validate_storage_required_publication`); `hw-storage-source-original-fields` (`datetime_unit_validate_storage_original_fields_pointer`); `hw-storage-source-receipt-required` (`datetime_unit_validate_storage_required_receipt`) |
| `inventory.named-evidence` | `hw-evidence-refs-not-followed` (`datetime_unit_validate_named_row_clean`); `hw-evidence-combinators-not-followed` (`datetime_unit_named_evidence_follows_combinators`) |
| `inventory.derived-pin` | `hw-pin-projection-keeps-classification` (`datetime_unit_pin_recomputes_classification`) |
| `row.classification` | `hw-classification-named-lineage-dropped` (`datetime_unit_validate_lineage_clean`); `hw-classification-role-default` (`datetime_unit_deciding_includes_safe_citation`); `hw-classification-review-ignored` (`datetime_unit_closure_mixed_dialect_union`); `hw-classification-swapped` (`datetime_unit_closure_static_credits`) |
| `role.no-spelling` | `hw-classification-by-spelling` (`datetime_unit_probe_equivalent_spelling_is_timestamp`) |
| `probe.battery-trigger` | `hw-probe-format-not-enforced` (`datetime_unit_probe_format_enforced`) |
| `probe.deciding` | `hw-deciding-format-not-enforced` (`datetime_unit_deciding_uses_format_checker`); `hw-controls-lose-a` (`datetime_unit_deciding_excludes_control`); `hw-implicit-endpoint-dropped` (`datetime_unit_deciding_excludes_implicit_true`) |
| `probe.map-context` | `hw-probe-contexts-skipped` (`datetime_unit_probe_sibling_context_probed`); `hw-probe-key-context-dropped` (`datetime_unit_probe_all_refused_every_field`) |
| `probe.all-refused` | `hw-all-refused-first-result-only` (`datetime_unit_probe_all_refused_every_field`) |
| `probe.positive-paths` | `hw-union-endpoints-union-value` (`datetime_unit_authority_partial_union_value`); `hw-union-endpoints-union-map` (`datetime_unit_authority_partial_union_map`); `hw-not-treated-as-path` (`datetime_unit_authority_not_is_not_a_path`); `hw-then-treated-as-path` (`datetime_unit_authority_then_is_not_a_path`); `hw-draft7-ref-siblings-applied` (`datetime_unit_authority_draft7_ref_siblings_ignored`) |
| `probe.dynamic-ref-not-a-path` | `hw-dynamic-ref-as-reference` (`datetime_unit_authority_dynamic_ref_not_a_path`) |
| `probe.other-keywords-review` | `hw-if-counted-as-assertion` (`datetime_unit_authority_if_unproven`); `hw-not-counted-as-annotation` (`datetime_unit_withhold_records_value_keyword`) |
| `probe.year-sweep` | `hw-sweep-years-short` (`datetime_unit_year_sweep_complete`) |
| `probe.static-closure` | `hw-credit-dialect-draft7` (`datetime_unit_closure_static_credits`); `hw-dynamic-set-loses-recursive-anchor` (`datetime_unit_closure_recursive_anchor`); `hw-declared-dialect-nearest-only` (`datetime_unit_closure_nested_dialect_inside_draft7`); `hw-closure-row-dialect-dropped` (`datetime_unit_closure_default_dialect_counts`) |

**4. Earlier attacks.** `scripts/pm_event_datetime_attacks.json` holds every single-map attack of the replays: 146 runs (cycle-14 `attacks14.py` 78 and `variants14.py` 3, cycle-13 `attacks.py` 51, cycle-12 `adjacent_checks.py` 14), 86 distinct inputs with no conflicting expectation, plus 11 single-map probes of the cycle-11/12 targeted set (the nine equivalent forms, the dependentSchemas negative and its timestamp review). Each is self-check `datetime_attack_<id>` and reproduces the replay's outcome through the one-row gate. The committed-row targeted probes are self-checks too: the 18 stale role maps, the 8 stale role targets, both foreign same-name citations, the changed battery, and the cycle-14 measure that each kept role's map refuses every year-sweep timestamp. The remaining replay items are the same inputs through the full tree (coherent full gates) or the full self-test, rerun below.

**Findings.** No mutation exposed production behaviour that differs from the owner text. Notes (test-only, not blocking):
- FIX11's `datetime_battery_format_enforced` cannot detect a probe without the format checker: its value's `const` never equals a battery sample, and every battery and sweep string is a valid timestamp, so format enforcement never changes map acceptance. It stays unchanged (all self-test cases are kept). The map validator's checker is now witnessed through a sibling context (`datetime_unit_probe_format_enforced`, whose derived context "timestamp" is not a date-time), and the per-node deciding checker through `datetime_unit_deciding_uses_format_checker`.
- The seven declared survivors are dead or redundant production code (table above).

**Replays (from scratch copies, at `8f8483eae3`).**
Fresh copies of FIX15's drivers on a `git archive` extraction of the cycle-12 input set at `8f8483eae3`, each file checked against its Git blob. Inputs and expectations are unchanged; the only adaptations are heads, paths, the self-test case count, the FIX16 check list and one capture fix (evidence README). Every outcome equals FIX15's. The attack, variant, measure, setup, targeted-probe, adjacent and pin-audit result files are byte-identical to FIX15's, and every full-gate result equals FIX15's apart from the head, I/O and timing fields it records.
- **Cycle 14** (the Opus pre-check's inputs): 78 attack cases and 3 dialect variants, all as expected. 69 refuse, 10 are accepted as roles, and 2 timestamp-accepting values with no record pass as `other_owner_observation`. The five coherent full gates (B1 dialect, B2 `$dynamicRef` and its holder, N3 year 2027, the cycle-13 N1 witness) exit 1 with `wildcard_role_review_required` alone. In each, `deciding_nodes` is empty and the production `datetime_validator` refuses with `DatetimeAdmissionError: datetime_inventory_invalid`. Kept roles, measured independently: 8 records. Their citations accept 0 battery, control or sweep strings, and production accepts 0 of the battery and of the 4,743 sweep timestamps.
- **Cycle 13:** all 51 attack cases as expected. 47 refuse, the 3 deciding controls are accepted, and 1 timestamp-accepting value with no record passes. The six coherent full gates and the N2 full gate exit 1 with `wildcard_role_review_required` alone. The literal cycle-12 bypass input exits 1 (84 `inventory_schema` errors).
- **Cycles 11 and 12:**
  - **Targeted probes:** 48 of the 48 original probes keep their exact gate outcome, and the 5 added stale-pin probes still fail (53 total).
  - **Adjacent checks:** 14 of 14 refuse.
  - **Full gates:** both coherent B7 variants, the sibling and foreign-key gates, and all three literal earlier inputs exit 1.
  - **Pin audit:** the 18 role pins equal the source recomputation.
- **Full self-test** (`full_git_checks.py selftest`: the unchanged `run_corpus`, `--scope all`, over all 8,968 committed Plans blobs through the Path I/O adapter):
  - exit 0, with 13,590 of 13,590 cases;
  - 769 of 769 integration checks: the 319 FIX15 checks, the 445 self-checks and the 5 freshness checks, so all 450 FIX16 checks are present and passing;
  - date-time gate `pass` over 233 nodes (133 Storage, 89 other-owner, 3 automatic, 8 roles, 0 unclassified), with 8,879 unique Git reads;
  - 896 s (FIX15: 642 s). The difference is the 450 added checks.

One harness error occurred. The cycle-12 driver saved the inventory from the *last* `check_inventory` call. The FIX16 self-checks now also call `check_inventory` on one-row scratch trees, so the saved result was a scratch tree's (1 node, `inventory_node_changed`), and `assert_results.py` failed. The fix: the driver now saves the first call, which is the corpus entry point on the committed tree (it records `captured_call`; 233 nodes). The failed run is retained in `harness-errors/`. The campaign resumed at the full self-test after a scratch-integrity check, and that step was rerun from scratch.

**Checks run.**

| Command (at `8f8483eae3`) | Exit | Result |
|---|---|---|
| `python3 scripts/pm_event_datetime_mutations.py --mutations` | 0 | 280 mutations. 273 are caught, each by its committed witness failing. The 7 declared survivors each survive all 445 self-checks and all 6,539 date-time corpus cases. 0 build errors, 0 runner exceptions, 0 not applied; `problems` empty. |
| `python3 scripts/pm_event_datetime_mutations.py --self-test` | 0 | 450 checks (445 self-checks and the 5 freshness checks), 0 failures, 0 freshness problems; 205 s. |
| `full_git_checks.py selftest` (`pm_event_numbers.py --self-test`, `--scope all`, over the committed tree) | 0 | 13,590 of 13,590 cases, 769 of 769 integration checks; 896 s. |
| `preservation.py 8f8483eae3` | 0 | Changed since the base: only the five date-time self-check files. The three production modules and the five committed date-time data files keep their Git object IDs. No number-scope, Plans, owner-prose, `.gitignore` or `.evidence` path changed. |
| `campaign.py` (serial, every checker start with at least 6 GiB available) | 0 | `CAMPAIGN COMPLETE`, 31 steps, each with its expected exit. |

The report commit changes only this report set (`reports/event-authority-20261104/NUMRULE.md`, `.checks.json`, `.self-grade.json`), which no checker reads.

**Scope.** Changed: the five date-time self-check files above and this report set. Unchanged by Git object ID: the three production date-time modules, the inventory, the role records, the battery `a125323b…` and its pin, the inventory schema and the exclusions (inventory pin `5cd2d30c…`); every number-scope file (`scripts/pm_event_numbers.py`, `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json`, the shared corpus, `scripts/pm_event_index_binding.py`) and the adoption guide; owner prose, registry, Decision Log, Spec Lock, `.evidence` and `.gitignore`. No row moved. Native authority remains NOT_RUN. Guard isolation remains SWEEP_PENDING. No family is graded.

**Limits.**
- A witness runs alone under its mutant; the bar's claim is that the self-test fails, which the witness failing proves. Survivors are checked against every self-check and every date-time corpus case, not against the full-tree scan, which reads the committed tree and is exercised for scan mutants by scratch trees.
- Credit and withholding sites are a committed vocabulary of names; the self-test fails when a name stops naming a site, but a credit computed under a new name needs a new entry.
- The enumeration covers the three production modules. The self-check modules and `admission_checks` are the corpus, not enumerated targets.

**Retained evidence (path plus SHA-256):**

| Evidence | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/mutations-full.json` | `5c86feb72cad9881608e1b5480b5c63ac76d1c0de79eac33b98a94f08e7e7a15` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/mutations-full.stdout` | `7fbf1af414266f909262e228225765e1a9315dbabb235d51dec3449cc8ca1cbe` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/selftest-cli.json` | `0deca923e678bb1165d5dfcdd00d67f256deb60b923240455788b5a7f699d2a7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/replay-input-blobs.txt` | `7c70d5230bbbe51f070d8a8a1ad8b3ae82d165d6bda377c2067b04863d98a434` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/preservation-8f8483eae3.json` | `78334d3ca6246d0c2f954b538bd6768d7df7a2d75512f3737a1609b6beeea917` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/campaign.json` | `cd0731733cc3be8bf9505a732cc6b36074d573b26ca984d1436aa67d1d948bc0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle14-replay/cycle14-assertions.json` | `749744fcd666ad091371f3011c6b0bb4b1c945f1ea8a622fa60afe87b81aeb54` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle14-replay/attacks14.json` | `a03f95feeb06992cd738f8f4a7197b66b35f178f931266a3c1d288449ad633b8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle14-replay/variants14.json` | `af2cd5f490c9522558eb0f4cb94caf9a53f1955d921e9e72a8f2fe35a79500f4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle14-replay/measure14.json` | `43258777ae39e43714762304c25c2586af8fe48875129e2c77482dba1d6ce4ee` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/precheck-replay/precheck-assertions.json` | `e904830f3ca3d19fa3f6ef120ffebec3108c6b91b08edff41d96c061490fc000` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/precheck-replay/attacks.json` | `eea36566c329b7fd1665e4cd62e5a42aa99862cb877b15018fe6b349937b9cd6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/precheck-replay/extraction.json` | `cf14d42d433aa06b7646aa5a916ce7995da92bd77fb3175331830aa7a26aced7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle12-replay/result-assertions.json` | `5c0f65fd5b142d4bd89fc7bcb7d5080408b946332f3d3b9675766fc091ee0bf8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle12-replay/targeted-checks.json` | `390c38afeaf3a31b197c251c89abc378d94ed9a86e0c9ed437b4f518931c5652` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle12-replay/adjacent-checks.json` | `a082839f21388e0d57149ff0cd863b8247d7ae2706e7358e0d28e16b992caea5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle12-replay/full-selftest.json` | `0cb71f11f7060e410d6300ec7198acd3bd6f461a24e593f31fae292d8a39738f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle12-replay/full-selftest-inventory.json` | `79260e35f57a577fb1ac0909631332485a35ebba3fe567cd92dd0caaa77c8433` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/cycle12-replay/full_git_checks.py` | `fb1607da85b182b0b3f4ea129b2ee86756c992d094e7480cf24125ed093469f2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/harness-errors/run1-campaign.stdout` | `5c948f70f33050765d9dbc9cbd94f4197d38b24c0d2e42d1f96239859f677fba` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/fix16/harness-errors/run1-full-selftest-inventory.json` | `42d2341324aed84c9d88990425b087136fd98f802f0a2fbfe6ee3347e4c96693` |

## Tool batch 2 (TOOL-ISSUES T32-T36): findings and responses (number scope, T33)

**Pre-check findings 1, 2 and 3 of `reviews/NUMRULE-sol/REVIEW-numbers-fix4-opus.md` are fixed; none is disputed.** Base: `origin/plans/ea-numrule-20261105` at `d22b8dd68e` (the date-time worker's latest head when this batch began; number code as at `884d6bd295`). Number files only, plus the corpus content pin. Production helper code (`scripts/pm_event_numbers.py`) is unchanged, and no new case showed a production bug: nothing is REAL.

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **1 (B07) — fixed** | `scripts/pm_event_numbers_corpus.py` (`_retained` scenario `unknown_field`, `frozen`/`verify`, `_RETAINED_CALLS`, `run_corpus`); `Plans/event_number_recipe_corpus.json`. The only unknown tuple in the corpus differed in `identity_recipe`, and one fixture verifier was installed for all three tuples, so a fallback dispatch keyed on any field subset holding `identity_recipe` passed. Added one `history` case per `RecipeTuple` field (14), each an authentic original whose tuple differs from the installed base tuple in that field alone, each requiring `recipe_unknown` and **zero verifier calls** (`verifier_calls: 0`, now checked for refusals too). Each installed fixture verifier now refuses a record whose recipe is not its own tuple. B07 is committed to the mutation set as `review-fix4-B07` (`source: review-fix4`, rule `dispatch.recipe-unknown`). | B07 survives the base corpus and is caught now; the 14 cases pass on the unchanged helper. |
| **2 (X2, X3, X5) — fixed** | Corpus negatives `full-value-wrong-version-2.1.0` (`schema_version: 2.1.0`, `full_value_edition`), `payload-id-last-byte` (the BLAKE3 ID with only its last byte changed, `payload_digest`), `append-policy-trailing-space` (`"append_once "`, `replay_policy`). X2, X3 and X5 are committed as `review-fix4-X2` (rule `full-value.edition`), `review-fix4-X3` (rule `payload.blake3-id`) and `review-fix4-X5` (rule `append-policy.exact-string`). | Each survives the base corpus and is caught now. |
| **3 — fixed** | `owner_statements` (`_unit_unselected_text`, `_guide_section_texts`, `_pin`); `scripts/pm_event_numbers_mutations.json` `owner_text`. Excluded blocks matched on their first words, excluded sections were skipped whole and only the selected YAML fields were read, so a rule added inside them on the same line never reached the table. Each excluded block (`sha256` on its rule), each excluded section (`excluded_section_sha256`) and each unit's unselected YAML fields (`unselected_sha256`) are now pinned by SHA-256 of their text; any change fails the self-test, naming the new hash, until a reviewer checks the text for number rules and refreshes the pin. The pins record the text as reviewed in the fix-4 pre-check (its Check 2 found the six excluded blocks and two excluded sections correct); the unselected fields are metadata (`plan_unit_id` … `owner_hints`). | The review's own scripts rerun on this tree: **F5b, F6 and F7b now fail** (1 problem each; 0 at the base); F0 intact gives 0; F1 to F5 and F7 still fail (F4 166, F5 13, F7 31 problems, one more each than before, from the pin). |

**Note for the date-time worker.** The excluded guide blocks are date-time bullets of `reports/event-authority-20261105/NUMRULE-ADOPTION.md`. Editing one of them now fails the number self-test until its pin is refreshed in `scripts/pm_event_numbers_mutations.json` (`owner_text.guide.excluded_blocks[].sha256`); that is the point of finding 3.

### Totals

| Check | Base `d22b8dd68e` | Now |
|---|---|---|
| `--self-test --scope numbers` | pass, 544 cases | **pass, 561 cases** (295 negatives, 266 positives, 61 owner checks) |
| `--self-test --scope numbers --mutations` | 366 mutations, 362 caught, 4 declared survivors | **370 mutations, 366 caught, 4 declared survivors**, 0 undeclared survivors, 0 build errors; 108 rules caught, 194 statements, 0 problems |
| The four review-fix4 mutations on the base corpus | survive (B07, X2, X3, X5) | caught |
| `--self-test --scope all` | — | **pass, 13,607 cases**, date-time inventory pass with the recomputed pin (13 min 39 s) |
| Corpus content pin (`scripts/pm_event_datetime_exclusions.json`, the corpus entry) | `bc6bcc3c…e7cd1` | `e4540227…7df21d` |

**Scope.** `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json`, `Plans/event_number_recipe_corpus.json`, the corpus content pin and this report. No owner Markdown, registry, Decision Log, Spec Lock, generated shard, index or evidence, `.gitignore`, date-time code, `main` push, pm-mail or subagent.

Evidence directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH2/numbers/` (the self-test, mutation, scope and freshness runs).

| Evidence under that directory | SHA-256 |
|---|---|
| `base-plus-fix4.out.json.gz` | `6af0ff168692fadbd8d0a8d58ecfc5a15d21d5661128f5a78594e7911566af27` |
| `fresh2-new.json` | `5aa63f0793f0f10f9cf8f64df1bdf31c6dbbb24d00625fd207c0ffc798216e57` |
| `fresh-new.json` | `6fcaae9f5a9c2f477b13b06b50b2891f760abd9504f6805de20745906c6e41bb` |
| `num-mut-1.json.gz` | `b538e786a4cc0ca88b94ca899f3e93732a34975403669303b49fa10bcde34812` |
| `num-scope-all.json.gz` | `dfcd44d8600de81a9e5687d4fbca1342e689af2e9918387c7fd5993e0761e9e8` |
| `num-st-1.json` | `33e90b56f7198f6b76961039ab3e6dff2121f9a15743fd339bff6001420c6818` |

## Tool batch 3: findings and responses (number scope, T50)

**TOOLBATCH2 pre-check findings 5 and 8 are fixed; nothing is disputed.** Base: `8b2aca1282`. Fix: `61150203c6` on `plans/ea-numrule-20261105`. Number files only, plus the corpus content pin. Production helper code (`scripts/pm_event_numbers.py`, `pm_event_index_binding.py`) is unchanged, and no new case showed a production bug: nothing is REAL.

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **5: blind survivors N05 and N07 — fixed** | `Plans/event_number_recipe_corpus.json`, `scripts/pm_event_numbers_mutations.json`. N05 (`full_value_commitment` accepts any `2.0.x`) and N07 (the payload digest compared without its first byte) had no case that tells them apart. New cases `full-value-wrong-version-2.0.1` (`schema_version` `2.0.1`, `full_value_edition`) and `payload-id-first-byte` (the BLAKE3 ID with only byte 0 changed, `payload_digest`). Both mutations are committed: `review-tb2-N05` (rule `full-value.edition`) and `review-tb2-N07` (rule `payload.blake3-id`), `source: review-toolbatch2`. | `--mutations`: each is caught by its new case alone (`failed_case_ids` is exactly the new case), so each survived the base corpus. |
| **8: a unit's text outside its YAML fence was neither selected nor pinned — fixed** | `scripts/pm_event_numbers_corpus.py` `_unit_section_unselected_text`, `owner_statements`; `owner_text.units[].section_unselected_sha256`. The pin covered the unit's unselected YAML fields only, so a rule appended to CV-1100's `ContractRef:` line, or to its heading title, gave 0 problems. Each unit's whole section, from its heading to the line before the next heading of the same or a higher level (outside fences), less the selected field lines, is now pinned by SHA-256; any change fails the self-test, naming the new hash, until a reviewer checks the text for number rules and refreshes the pin. The pins record the sections as reviewed here: heading titles, unselected metadata fields and `ContractRef:` lines, none of which states a number rule. | The pre-check's `pins.py` on this tree (`pins-fix.json`): P1 (a rule on CV-1100's `ContractRef:` line) and P2 (on its heading title) now give 1 problem each (0 on the base); F5b gives 2 (both pins); F6 and F7b 1 each; the no-edit control 0. |

**Note for the date-time worker (here, the same batch).** The corpus content pin in `scripts/pm_event_datetime_exclusions.json` is recomputed for the two new cases (`e4540227…` to `6a576962…`: SHA-256 of `json.dumps` of the corpus, as the inventory computes it).

### Rerun results

| Check | Base `8b2aca1282` | Now |
|---|---|---|
| `--self-test --scope numbers` | pass, 561 cases | **pass, 563 cases** |
| `--self-test --scope numbers --mutations` | 370 mutations, 366 caught, 4 declared survivors | **372 mutations, 368 caught, 4 declared survivors**, 0 undeclared, 0 build errors, 0 problems; 108 rules caught |
| N05 and N07 | survive | caught |
| `--self-test --scope all` | pass | see the T41 section below |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH3/numbers/`.

| File | SHA-256 |
|---|---|
| `pins.py` (the pre-check's) | `fe20716b90e9e95ae7548bd2f29bd422ca9eefb34fa68c141e5a30619a7a8996` |
| `pins-fix.json` | `100156a9e05a731f621e16ead27495f2d71a02f16c4a4b57da3b664de72b7419` |
| `num-selftest-t50.json` | `354789a1ead5baa02816c48fb5ecbabfd7eb638bc90fe15ccfc8b81156ebcf50` |
| `num-mutations-t50.json.gz` | `c1e58b8de373cda37df761f8fae83824799c06ceccfa0dfca439f7298d12b7d7` |

## Tool batch 3: findings and responses (date-time gate, T41; number scope data points)

**REVIEW-datetime-fix16-opus is answered; nothing is disputed.**

- **Base:** `c0f1b407a9` (`origin/plans/ea-numrule-20261105` at `61150203c6`, plus the T50 report).
- **Production code is unchanged:** `pm_event_datetime*.py`, `pm_event_numbers.py` and `pm_event_index_binding.py`.
- **Nothing is REAL:** no new case showed a production bug.
- **Files touched:**
  - date-time: `scripts/pm_event_datetime_mutations.py`, `.json` and `_selfcheck.py`;
  - number: `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json` and `Plans/event_number_recipe_corpus.json`;
  - the corpus content pin in `scripts/pm_event_datetime_exclusions.json`.

### The gap

The review's blind sample caught 13 of 20 against a bar of 18. The gate bar's AST enumeration covered refusal sites, their guard predicates, credit predicates and comparison boundaries, but not the data those guards read. A mutant that changed a table entry, a keyword set, the day arithmetic, the loadable set, a Storage-quote flag or a walked collection was never generated, and 7 of the review's 20 survived (DT-01, 03, 09, 13, 16, 17, 19).

### Data points, enumerated from the AST

`pm_event_datetime_mutations.data_points` enumerates six new families from the three production modules. The self-test regenerates them on every run, as it does the sites. A data point with no committed row fails freshness (`new mutation point without a committed entry`), and so does a stale row. A new gate-bar check, `datetime_gate_bar_detects_new_data_point`, adds a leap-table entry and a constant table to a copy of the source and requires exactly their three new keys.

| Family | What the mutant does | Points |
|---|---|---|
| `data_table_entry` | drops one entry of a module constant table (tuple, list, set, dict, or `frozenset(...)` of one): the leap-day table, `PROFILES`, `ANNOTATIONS`, `ASSERTIONS`, `DYNAMIC`, `REFERENCES`, `UNIONS`, `NON_TIMESTAMP_CONTROLS`, `SWEEP_ZONES` and the rest | 102 |
| `data_value_arithmetic` | swaps `+`/`-` or `*`/`//`, or adds one to an integer, in a value a refusal guard reads: `_day_number`'s year arithmetic, the year sweep's formulas, quote and line counts | 73 |
| `data_loop_member` | drops one member of a literal set a refusal loop walks or an `in` test reads: `_constraint_sources`' keywords, the probe's `$ref`/`$dynamicRef`/`$recursiveRef` walks and its sibling-dependency keywords | 28 |
| `data_walk_domain` | walks only the first item of a computed collection whose loop holds a refusal: `verify_resources`' resources, the scan's exclusions, documents and stale exclusions, `check_inventory`'s three diffs, role errors, fields, `patternProperties` | 22 |
| `data_flag_operand` | makes an `and`-operand True or an `or`-operand False in a flag a refusal guard reads: the Storage-quote flags, `owners`, `credited`, `on_value_path` | 20 |
| `data_collection_build` | disables one build step of a collection a guard reads: the loadable set (`loadable.add`, `.update`, the markdown documents, the reference list) | 6 |
| **total** | | **251** |

By module: `pm_event_datetime` 64, `pm_event_datetime_inventory` 52, `pm_event_datetime_value_probe` 135.

**Each of the 251 has a committed row:**
- **152** were already caught by an existing check once enumerated;
- **95** needed a new check;
- **4** are declared equivalent survivors, each with its reason.

The witness of each row was found by running its mutant against every self-check and every date-time corpus case, in order (the gate's own `run_mutant`), and taking the first that fails. Two earlier discovery passes were discarded because two checks failed on the intact tree while the work was in progress:
- `datetime_gate_bar_detects_new_site` fails until every enumerated point has a row;
- `datetime_validator_real_inventory_format_installed` failed while the number corpus pin was stale.

Every point those two passes credited was rediscovered after the tree was intact again (the intact self-test passing). The first full replay found three rows still wrong: `wildcard_probe.visit` and `constraint_paths` dropping `$recursiveRef`, and the walk over sibling contexts. Their witness was `datetime_unit_scan_every_pattern_property` from a discovery run that loaded that check while its expected value was still wrong (it failed on the intact tree). They now name `datetime_unit_role_observation_cited_through_recursive_ref` and the new `datetime_unit_probe_every_sibling_context_checked`, each shown failing on its mutant, and the replay below was rerun in full at the committed head.

**The new checks** (section M of `pm_event_datetime_selfcheck.py`; 445 self-checks before, 564 now):

| Check | The data it witnesses |
|---|---|
| `datetime_unit_date_time_leap_table_independent_edition` | the leap table against IERS Bulletin C72, copied independently (DT-01) |
| `datetime_unit_date_time_leap_second_june_with_offsets` | June leap seconds written with offsets (DT-03) |
| `datetime_unit_date_time_leap_second_every_day_with_offsets` | every leap day in UTC and with ±offsets, and the day before and after (`_day_number`: `previous // 401` moved a year boundary to 2005/2006 and refused `2006-01-01T00:59:60+01:00`) |
| `datetime_unit_scan_exclusion_referenced_under_path_free_id` | DT-09's file-path-relative join |
| `datetime_unit_validate_owner_profile_quote_without_cv253`, `_without_profile` | DT-13's two Storage-quote flags |
| `datetime_unit_map_dependency_<kw>_direct`, `_through_ref` (16 keywords × 2), `datetime_unit_map_one_of_requires_review` | DT-16 and DT-17: every sibling-dependency keyword at map scope, directly and through a map-scope `$ref`; requires review, never automatic non-timestamp credit |
| `datetime_unit_selection_verify_every_resource` | DT-19: a classified target in a referenced resource, replaced after construction |
| `datetime_unit_value_keyword_inert_<kw>` (36), `datetime_unit_value_keyword_tables_covered` | each `ANNOTATIONS` and `ASSERTIONS` keyword with an inert argument keeps automatic credit; dropped from its table, it is an unknown keyword and routes to review |
| `datetime_unit_closure_dynamic_ref_off_path`, `_recursive_ref_off_path` | `DYNAMIC`'s `$dynamicRef` and `$recursiveRef`, off the value path (dropping either credited the map: a false credit) |
| `datetime_unit_role_observation_cited_through_dynamic_ref`, `_recursive_ref` | the probe's reference walks (`visit`, `constraint_paths`) |
| `datetime_unit_probe_every_sibling_context_checked` | the probe's walk over a role record's reviewed sibling contexts |
| `datetime_unit_named_evidence_follows_every_keyword` | `_constraint_sources`' ten keywords |
| `datetime_unit_year_sweep_independent_edition` | the year sweep against its documented formulas, written again |
| `datetime_unit_deciding_excludes_control_00` to `_15`, `datetime_unit_controls_independent_edition` | each of the 16 fixed non-timestamp controls |
| `datetime_unit_scan_exclusion_every_entry_checked`, `_stale_exclusions_every_one`, `_every_jsonl_line`, `_every_pattern_property` | the scan's walks, with a second item that decides |
| `datetime_unit_scan_exclusion_referenced_by_nested_id_forbidden`, `_markdown_schema_forbidden`, `_referenced_through_id_base_forbidden` | the loadable set's three other build steps |
| `datetime_unit_gate_every_unclassified_node`, `_every_missing_node`, `_every_changed_node` | `check_inventory`'s three diffs |
| `datetime_unit_validate_owner_named_by_schema_identity`, `_owner_profile_quote_invalid_names_nothing`, `_every_role_error_reported`, `_conflicting_field_profile_every_field` | `validate_inventory`'s owner flag, quote flag and walks |
| `datetime_gate_bar_detects_new_data_point`, `_detects_per_lane_sentence_edit`, `_detects_unselected_cv1101_field_edit`, `_owner_pins_quiet_without_edit` | the gate bar itself |

**Declared survivors (4, each equivalent):**
- **`scan`'s `part.strip().split('#', 1)` → `split('#', 2)`:** only element `[0]` is read, the text before the first `#`, whatever the limit.
- **`_day_number`'s `- previous // 100` → `+`, `+ previous // 400` → `-`, and `previous // 100` → `previous // 101`:** `date_time` only compares a local time with a leap day less than a day away. Each mutant shifts day numbers by an amount that is constant inside a century (or a 400-year or 101-year span) and changes only at its boundary (2001 or 2021 in this range). No leap day of the table (1972 to 2016) lies within a day of such a boundary, and a date years away cannot be moved onto one. The fourth `_day_number` mutant, `previous // 401`, is not equivalent and is caught (above).

### The 7 survivors of the review, now caught

Each was rerun with the review's own harness (`run_blind.py`, stopping at the first failing witness) on this tree. On `fix16` each survived all 6,984 witnesses (the review's `results/DT-*.json`).

| Mutant | Caught by (first failing witness) | Witnesses run |
|---|---|---|
| DT-01 (1997 insertion moved to December) | `datetime_unit_date_time_leap_table_independent_edition` | 432 |
| DT-03 (`_day_number` counts the current month) | `datetime_unit_date_time_leap_second_june_with_offsets` | 433 |
| DT-09 (loadable set drops the path-relative join) | `datetime_unit_scan_exclusion_referenced_under_path_free_id` | 434 |
| DT-13 (Storage quote needs `storage_utc_z` only) | `datetime_unit_validate_owner_profile_quote_without_cv253` | 435 |
| DT-16 (map-scope `oneOf` not a dependency) | `datetime_unit_map_dependency_oneOf_direct` | 459 |
| DT-17 (`constraint_paths` follows refs at value scope only) | `datetime_unit_map_dependency_required_through_ref` | 438 |
| DT-19 (`verify_resources` re-checks the root only) | `datetime_unit_selection_verify_every_resource` | 470 |

### Pin hole (T33 finding 3, review finding 9)

The 19 per-lane "Enforce CV-1101 …" sentences were in neither rules table, and text outside the selected fields was read nowhere. Two pins now cover them, and any change fails the self-test, naming the new hash, until a reviewer refreshes the pin:
- **CV-1101's unit section, outside its selected YAML fields:** `owner_text.units[].section_unselected_sha256`, `e454e29b…`.
- **The guide sections that hold the per-lane and ancillary-lane sentences:** `owner_text.guide.pinned_sections`; "Per-lane replacements" `3a73926a…` and "Ancillary lanes" `c9077f35…`.

Run through `owner_statements` at the base `61150203c6`, the review's rewrite of the per-lane sentence ("Enforce CV-1101 with a local regex at this lane's envelope boundaries") and an edit to CV-1101's `validation_surfaces` each give **0 problems**. Now each gives the pin's problem, and the no-edit control gives none.

### Number scope: the same gap, closed

The number helper's enumeration had no data family either. `pm_event_numbers_corpus.mutation_points` now enumerates the same data families (with the number refusal sites) from `pm_event_numbers.py`, and the self-test checks them the same way: **36 points**.
- 21 table entries: `PRODUCER_FIELDS`.
- 7 arithmetic: `UINT64_MAX = (1 << 64) - 1`, the payload `minimum=0`, and the zero tests in `qualified_jcs`.
- 6 flag operands: `_declared_numeric_kind`'s `numeric_kinds or {}`, and `qualified_jcs`'s `negative_zero`.
- 2 walks: `_unique_object`'s pairs, and `OriginalBinding.__post_init__`'s fields.

On the base corpus, three survived:
- **`v == 0` made True** refused a negative nonzero number at a sign-sensitive path.
- **The sign test made True** refused a positive zero there.
- **`copysign(1.0, f) < 0` → `< 1`** is equivalent, since `copysign(1.0, f)` is exactly ±1.0. Declared.

Six new corpus cases, `jcs-sign-kept-*`, now catch the first two: `-1.5` (exact and current parsers), `-1`, `0.0` (both parsers) and `0`, each at a sign-sensitive path, must pass unchanged. The corpus content pin is recomputed (`6a576962…` to `4752d3ae…`).

### Rerun results

| Check (at `6ae8072f7e`) | Base | Now |
|---|---|---|
| date-time `--self-test` | pass, 450 checks (445 self-checks + 5 freshness) | **pass, 569 checks** (564 + 5), 0 failures, 0 freshness problems; 448 points committed, 11 declared survivors |
| date-time `--mutations` | 280 mutations, 273 caught, 7 declared survivors | **531 mutations** (448 generated, 83 hand-written), **520 caught**, each by its committed witness failing; **11 declared survivors** (the earlier 7 and the 4 above), each surviving all 564 self-checks and every date-time corpus case; 0 undeclared, 0 build errors, 0 runner exceptions; 72 of 72 rules and 96 statement rows caught; `problems` empty |
| the earlier 280 rows | — | unchanged, row for row, against the review's `fix16` replay (`cmds/mutations-replay.json`): the same results and witnesses |
| the review's 7 survivors | survived 6,984 witnesses each | caught (table above) |
| the pin edits (per-lane rewrite; `validation_surfaces`) | 0 problems each | 1 problem each; no-edit control 0 |
| number `--self-test --scope numbers` | pass, 563 cases | **pass, 569 cases** (297 negatives, 272 positives) |
| number `--mutations` | 372 mutations, 368 caught, 4 declared survivors | **408 mutations, 403 caught, 5 declared survivors** (36 data points; the new survivor is the `copysign` equivalent), 0 undeclared, 0 problems; the 674 earlier rows (mutations, generated points, rules, statements) unchanged |
| `--self-test --scope all` | pass | **pass, 13,615 of 13,615 cases**; date-time inventory pass (233 nodes: 133 Storage, 89 other-owner, 3 automatic, 8 roles, 0 unclassified); 15 min 55 s |

The date-time replay ran as five `--only` chunks in parallel at `6ae8072f7e` (a full run is longer than the 2-hour limit on one command): `:datetime:` (109), `site:datetime_inventory:` (86), the rest of the inventory (57), `:datetime_value_probe:` (196) and `hw-` (83). The chunks partition the 531 mutations exactly. `merge_replay.py` joins them the way `run_mutations` aggregates a full run: the rows, then the rule and statement verdicts over every row, then the totals. A first full replay, at the paused WIP head, was cut off by the T3 restart at 169 of 531.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH3/numbers/` (`t41/` for the date-time runs).

| Evidence under `drafts/TOOLS-BATCH3/numbers/` | SHA-256 |
|---|---|
| `t41/replay/merged.json.gz` (all 531 rows; the five chunks beside it) | `95b3a5a46056e8d380d21b6813945d992f4393144b084eb914a9f2666e5eddb3` |
| `t41/replay/merged.totals.json` | `e8e1a52b72ab7ded0cec04fbc4c6c834b1e58600bef1e263348f96db06342778` |
| `t41/selftest-6ae8072f7e.json` | `a3d5f75d30ea5d3b2c97bb3a26eee9ba6e3291579a74cb6211e9fbdee1a30f63` |
| `t41/pins/pins-base-61150203c6.txt` | `6488a9830273ba849cc483edfb9b6cfcf3761bc11308714c307d9db00353a2f4` |
| `t41/pins/pins-fix.txt` | `f1ac5f88b767ef625de9716eebc33894bbcc66c57e5fd1951e2b91e8c466208c` |
| `t41/blind/DT-01.json` (and DT-03 to DT-19 beside it) | `e7f5a2e1afe6fbf5394662632ce3d515d1900882066262451d8b2263f26799dd` |
| `num-mutations-t41.json.gz` | `eda8726e27d6cf486eef5129d405eabb8a2649d20fbc7a2c748a39c7144d7320` |
| `num-selftest-t41.json` | `1cc09c1b682a6f4bf64b8bb0d579d8d786060dbad9206a78251fb9385ec7abae` |
| `num-scope-all-t41.json.gz` | `de7350c10e5ecadca15e5cd05ea6009f0b666f58f74b379481a8244f5499d5de` |

The discovery runs (`t41/discovery/`), the discovery and merge scripts and the review's harness copies are in `t41/`.

## Tool batch 4: findings and responses (date-time gate, T71; number scope, T72)

**REVIEW-numrule-tb3-opus findings 1 to 7 are answered; nothing is disputed.**

- **Base:** `2f3cd5769d` on `plans/ea-numrule-20261105`. Worked in one Nas1 worktree; rebased onto the latest origin branch right before the push, no force.
- **Production code is unchanged:** `pm_event_datetime.py`, `pm_event_datetime_inventory.py`, `pm_event_datetime_value_probe.py`, `pm_event_datetime_admission_checks.py`, `pm_event_numbers.py` and `pm_event_index_binding.py` are byte-identical to the base.
- **Nothing is REAL:** no new case or check showed a production bug. Every new check passes on the intact tree and fails on the mutant it witnesses.
- **Files touched:**
  - date-time: `scripts/pm_event_datetime_mutations.py`, `.json` and `_selfcheck.py`;
  - number: `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json` and `Plans/event_number_recipe_corpus.json`;
  - the corpus content pin in `scripts/pm_event_datetime_exclusions.json` (recomputed for the two NM10 cases).

### T71: the date-time gate (findings 1 to 4, 6 and 7)

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **2 (DT13): `patternProperties` was witnessed only with start-anchored patterns** | `pm_event_datetime_selfcheck.py` (`UNANCHORED_PATTERNS`). A scan self-check and an admission check for each of `_at_utc$`, `at_utc` and `(?<=observed)_at_utc` (`datetime_unit_scan_unanchored_pattern_*`: a row for both fields, or for `observed_at_utc` alone; `datetime_admission_unanchored_pattern_*`: `datetime_schema_unclassified`). Hand-written `re.search` → `re.match` mutations at the three call sites: `hw-tb4-pattern-properties-prefix-match-scan` (`inventory.py:181`), `-constraint-paths` (`value_probe.py:281`) and `-positive-paths` (`value_probe.py:459`). The two probe sites needed checks of their own: the scan and admission checks do not reach the probe, and both probe mutants passed every pattern check. `datetime_unit_value_path_unanchored_pattern` (a suffix-keyed value lies on each field's value path) and `datetime_unit_authority_unanchored_pattern_value` (its endpoints reach the role authority) each catch exactly one of the two. | each new check passes intact and fails on its mutant (`run_mutant`, one witness at a time) |
| **3 (DT12): the replay omitted `regression_checks()`, and `declarations()`' keyword tuple had no point** | `survivor_witnesses()` now ends with every admission regression check (`regression:<name>`, run once per mutant under the installed mutant), so a declared survivor must survive the suite `--scope all` runs; `regression:` is a witness kind committed rows may name. `data_loop_member` now also takes a literal tuple iterated in a module-level helper whose result a refusal or credit guard reads, found by following calls from the guarded functions (`declarations()`' `("properties", "dependentRequired", "dependentSchemas")`, the `_exclusion_schema_paths` token prefilter, `_dialect_validator`'s dialects, the scan's exclusion fields, the year sweep's separators). A scan self-check for each of the 12 declaration forms `admission_checks.py:99-112` lists (`datetime_unit_scan_declaration_form_<form>`: a `$schema` file in a scratch Plans root, one row with the right fields). | 28 new `data_loop_member` points, each with a committed witness |
| **4 (DT03): non-ASCII digits were refused only in the year and the seconds** | An Arabic-Indic digit in each other numeric field (`datetime_unit_date_time_unicode_digit_{month,day,hour,minute,second,fraction,offset_hour,offset_minute}`), each expecting `date_time_syntax`. Hand-written `hw-tb4-unicode-digit-<field>` per group (year to offset minute): that group's `[0-9]` made `\d` and `re.ASCII` dropped. | each caught by its own field's check |
| **6: no family reached compiled regexes** | A `regex` family (`regex_pattern`, `regex_match_kind`): each flag of a module-level `re.compile` dropped; each character class widened one step (`[0-9]` → `\d`, with `re.ASCII` dropped so the widening is not inert; an unescaped `+` outside a class → `*`); each `fullmatch` or `search` call on `re` or a module-level pattern made `match`. 19 points: `_DATE_TIME` 12 (1 flag, 10 widenings, 1 call), the inventory 5 (`_LIST_MARKER`'s `[ \t]+`; the supplementary fence closer, `declarations()`' pattern, the exclusion reason, the lineage pointer), the probe 2. `_BLOCKQUOTE_MARKERS` and `_JSON_U_ESCAPE` have no flag, no `[0-9]` class and no `+`, so the one-step rule gives them no point. Four regex points needed a new check: `datetime_unit_scan_list_marker_needs_a_space` (a `-```` paragraph line is not a list item: the widened marker opens a bogus supplementary span and refuses a clean file), `datetime_unit_scan_supplementary_closer_has_no_info_string` (a ```` ```json ```` line inside a supplementary span is body, per CommonMark; the `match` closer ends the span early and accepts a file the intact scan refuses as unreadable), `datetime_unit_validate_lineage_pointer_below_patch` (a lineage patch is a whole `before` or `after` value; `match` accepts `/documents/0/changes/0/after/x`) and the two probe checks above. One is a declared survivor: `_DATE_TIME` with `re.ASCII` dropped, equivalent because the pattern has no `\d`, `\w`, `\s` or `\b` and no IGNORECASE. | 19 regex points, 18 witnessed, 1 declared survivor |
| **6, loop members: the exclusion prefilter's tokens** | Five tokens of `_exclusion_schema_paths`' fast path had no witness: every referrer in the earlier checks also declared `$schema`. `datetime_unit_scan_exclusion_referenced_by_{ref,dynamic_ref,recursive_ref,escaped_ref,utf16_ref}_only_file_forbidden`: a file referenced only by a referrer whose one token is that one (`$ref`, `$dynamicRef`, `$recursiveRef`, a `\u0024ref` escape, a UTF-16 file) cannot be excluded. | each catches only its own token's mutant |
| **7 (DT16, DT19): first caught through the real inventory's evidence pins** | Answered by running both of the review's blind mutants over the targeted semantic self-checks and listing every failure: under DT16, `datetime_unit_authority_partial_union_value` and `_partial_union_map` fail; under DT19, `datetime_unit_role_timestamp_review_on_value_path`, `_role_not_endpoint_on_path`, `_role_endpoint_one_field`, `_observation_cited_through_dynamic_ref` and `_observation_cited_through_recursive_ref` fail. A semantic self-check catches each, so the two scratch self-checks the review describes are not needed. `resource_selections()` is now computed once per installed mutant for the committed inventory (its result or the error it raises), and a call against any other root, or after `cache_clear()`, goes to the module's own cache as before (the self-checks that clear or redirect it are unchanged); a full rerun of each of DT16 and DT19 over all 7,991 survivor witnesses now finishes: 208 s and 177 s (7,396 and 7,401 witnesses fail; the review's `--all` rerun of DT16 hit its 3,000 s limit). | `f7-targeted.json`, `f7.json` |
| **1: the blind sample 17 of 20** | Findings 2 to 4 close DT03, DT12 and DT13: each is now a committed hand-written mutation or a generated point with a witness. A fresh blind sample is the next pre-check's. | — |

**Soundness: every widening.** Two. (1) `survivor_witnesses()` adds the regression checks: a survivor must now survive more, so this only narrows what a declared survivor may be; the only effect on a caught row is that `regression:` is an allowed witness kind (no committed row names one). (2) The `resource_selections()` memo: a mutant's outcome for the committed inventory is computed once per installed mutant instead of on every validator build. The committed files and the mutant's code cannot change while it is installed, and every other root and every `cache_clear()` bypass it; its trap is `datetime_unit_resource_selections_refuses_invalid_inventory` (clears the cache and points `ROOT` at a scratch inventory), which passes intact and in every replay. Everything else adds points, checks or rows.


### T72: the number scope (finding 5 and finding 6's encoder tables)

| Finding | Location, cause and fix | Evidence |
|---|---|---|
| **5 (NM10): binding map key order was witnessed only where length order and byte order agree** | `Plans/event_number_recipe_corpus.json`: `physical-binding-map-length-order` (`{"b": 2, "aa": 1}` gives `82a2616101a16202`) and `decode-binding-map-length-first` (hex `82a16202a2616101` is `physical_noncanonical`). The length-first sort is hand-written mutation `review-tb3-NM10` (`keys.sort(key=lambda pair: (len(pair[0]), pair[0]))`) under `physical.map-key-order`. | `--mutations`: caught by exactly the two new cases; the review's NM10 survived all 569 base cases (`nm/NM10.json`). |
| **6: the encoders' width tables had no point** | `pm_event_numbers_corpus.py`: `data_table_entry` also takes a literal tuple of tuples a `for` loop walks inside a function (an encoder's width table, though no refusal sits in its loop): `pm_event_numbers.py:340-341` (the negative-integer widths, 4 entries) and, through `width_table_points`, `pm_event_index_binding.py:56-61` (the uint widths, 4 entries, run against that module). | 8 new points, each caught by its committed width case (`physical-int--128` to `-2147483649`, `physical-int-128` to `-4294967295`) |

**Soundness:** nothing widens; two cases, eight points and one mutation are added.


### Rerun results

| Check | Base `2f3cd5769d` | Now |
|---|---|---|
| date-time `--self-test` | pass, 569 checks (564 + 5 freshness) | **pass, 605 checks** (600 + 5), 0 failures, 0 freshness problems; 495 points committed, 12 declared survivors, 95 hand-written mutations; 265 s; rerun at the committed head, the same |
| date-time points | 448 | **495**: 103 refusal, 60 guard, 23 credit, 11 boundary, 279 data (102 table, 56 loop, 20 flag, 73 arithmetic, 6 build, 22 walk), 19 regex (12 pattern, 7 match kind); 0 new, 0 stale |
| date-time `--mutations --only data:` | 251: 247 caught, 4 declared survivors | **279: 275 caught each by its committed witness, 4 declared survivors**, 0 undeclared, 0 build errors, 0 runner exceptions, `problems` empty; 3,238 s |
| date-time `--mutations --only site: credit: boundary: hw- regex:` | 280: 273 caught, 7 declared survivors | **311: 303 caught each by its committed witness, 8 declared survivors**, 0 undeclared, 0 build errors, 0 runner exceptions, `problems` empty; 6,652 s (each survivor now also survives the 852 regression checks) |
| date-time, both chunks merged | 531: 520 caught, 11 survivors | **590 of 590 rows: 578 caught, 12 declared survivors; 72 of 72 rules caught; 96 of 96 statement rows; 12 reason rows** |
| one row re-replayed after its witness moved to a semantic check (`declarations` drop `'properties'`: `datetime_validator_real_inventory_format_installed` to `datetime_unit_scan_declaration_form_properties`) | — | caught, `problems` empty |
| number `--self-test --scope numbers --mutations` | 408: 403 caught, 5 declared survivors, 36 data points | **417: 412 caught, 5 declared survivors, 44 data points** (29 table, 7 arithmetic, 6 flag, 2 walk), 0 undeclared, 0 build errors, `problems` empty; 571 cases (298 negatives, 273 positives); 108 of 108 rules, 114 rule rows caught, 80 reason rows; 100 s |
| `--self-test --scope all` | pass, 13,615 cases | **pass, 13,617 of 13,617 cases** (6,936 positives, 6,681 negatives, all labelled), 924 owner integration checks all true, 0 failures; date-time inventory pass (233 nodes: 133 Storage, 89 other-owner, 3 automatic, 8 roles, 0 unclassified); 10 min 10 s, 556 MB peak |
| DT16, DT19 over every survivor witness (finding 7) | DT16 hit 3,000 s | **208 s and 177 s**; semantic self-checks fail under each |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH4/numrule/` (`results/`: the self-test, both replay chunks, their merge, the re-replayed row, the number run, `f7.json.gz` and `f7-targeted.json`, the discovery rows `discover.jsonl` and the survivor reason; `tools/`: the discovery, apply and finding-7 drivers and the run script). The witness of each new point was found with the gate's own `run_mutant` (`tools/discover71.py`: each point's mutant over the survivor suite, likely witnesses first, the gate-bar detection checks last because they fail on the intact tree until the points are committed); 12 points (and the two probe hand-written mutations) that no existing check caught got one of 10 new checks, each shown failing on its mutant alone.



## Tool batch 5: findings and responses (date-time gate, T102; number scope, T103)

**REVIEW-numrule-tb4-opus: every blind survivor is answered; nothing is disputed.**

- **Base:** `90a50fdf62` on `plans/ea-numrule-20261105`. Worked in one Nas1 worktree; rebased onto the latest origin branch right before the push, no force.
- **Production code is unchanged:** `pm_event_datetime.py`, `pm_event_datetime_inventory.py`, `pm_event_datetime_value_probe.py`, `pm_event_datetime_admission_checks.py`, `pm_event_numbers.py` and `pm_event_index_binding.py` are byte-identical to the base.
- **Nothing is REAL:** no new case or check showed a production bug. Each blind survivor was a mutant no case told apart; every new case and check passes on the intact tree and fails on the mutant it answers.
- **Commits:** `8c21d32796` (T103), `06781186af` (T102), and this report.
- **Files touched:**
  - number: `Plans/event_number_recipe_corpus.json`, `scripts/pm_event_numbers_corpus.py`, `scripts/pm_event_numbers_mutations.json`, and the corpus content pin in `scripts/pm_event_datetime_exclusions.json` (recomputed for the 9 new cases: `d1c4b82b…67df` to `4ddcefb1…bad`; without it the committed-tree inventory check fails on the intact tree);
  - date-time: `scripts/pm_event_datetime_mutations.py`, `.json` and `_selfcheck.py`.

### T103: the number scope (B-N09 to B-N12, B-N14, B-N20)

| Survivor | Location, cause and fix | Evidence |
|---|---|---|
| **B-N09 (fail-open): a binding length past uint32 was not refused** | The corpus injected a reported length into `pm_event_numbers` only, never into the SP-278 binding codec where the uint32 header limit is checked. A case may now name `"reported_length_module": "binding"`, and the runner injects into the globals of `binding_bytes`. New cases `physical-binding-array-reported-length-4294967296` (`binding_domain`) and its control `physical-binding-array-reported-length-4294967295` (encodes, `ddffffffff01`). | `review-tb4-B-N09` (rule `binding.domain`): caught by the new case alone |
| **B-N10: the refusal message** | Owner-equivalent: no owner text names a message format. Pinned by the check `refusal_message_is_its_reason` (`str(Refusal(r)) == r`, `args == (r,)`, `.reason == r` for three reasons). | `review-tb4-B-N10` (rule `refusal.reason-code`): caught by the new check alone |
| **B-N11 (fail-open): inline flags 0, None and '' were accepted** | One case each: `payload-inline-flag-zero`, `-null`, `-empty-string`, each refused with `boolean_type` (single defect `payload.inline.boolean`). | `review-tb4-B-N11` (rule `boolean.exact`): caught by exactly the three new cases |
| **B-N12: check order** | Owner-equivalent: CV-1100 names no order for two defects. The case `payload-size-and-media-two-defects` (a wrong size and a wrong media type) pins `payload_size` and says so (`precedence_pinned`). | `review-tb4-B-N12` (rule `payload.exact-media`): caught by the new case alone |
| **B-N14 (fail-open): a recipe added after install was honoured** | `RetainedDispatcher` installs the exact map it was given. A case may now name `after_install` (`add`, `replace`, `delete`), and the runner changes the caller's map after installation: `history-recipe-added-after-install` (`recipe_unknown`), `-replaced-after-install` and `-deleted-after-install` (the original returned with zero effects, the installed verifier kept). | `review-tb4-B-N14` (rule `dispatch.recipe-unknown`): caught by exactly the three new cases |
| **B-N20: the CLI's default `--corpus` path** | The check `cli_default_corpus_is_the_committed_corpus` runs the helper's own module code under another name, replaces `self_test` with a stub that records the path it is handed, and runs `main()` with `--self-test --scope numbers` and no `--corpus`: the path must be the committed `Plans/event_number_recipe_corpus.json`. | `review-tb4-B-N20` (rule `cli.exit-status`): caught by the new check alone |

Each `review-tb4-*` mutation is committed with `source: review-toolbatch4`; its `failed_case_ids` or `failed_checks` are exactly the new witnesses, so each survived the base corpus. Four of the six are fail-open (B-N09, B-N11, B-N14 here, B-DT19 below); each has its own cases.

**Soundness:** nothing widens. Nine cases, two checks and six mutations are added; the two runner options (`reported_length_module`, `after_install`) are read only by cases that name them.

### T102: the date-time gate (B-DT11 to B-DT13, B-DT15, B-DT18 to B-DT20, finding 3)

| Survivor | Location, cause and fix | Evidence |
|---|---|---|
| **B-DT11: an anonymous resource installed after its wrapper** | `datetime_unit_selection_install_anonymous_after_its_wrapper`: a dictionary first seen inside a wrapper, later installed as its own anonymous resource (no `$id`, no `$schema`), is registered then and admitted; `…_anonymous_after_its_wrapper_changed`: the same resource changed after admission is refused (`datetime_schema_changed_after_admission`). | `hw-tb5-install-wrapper-before-registration` (rule `admission.pinned-resources`) |
| **B-DT12, B-DT13: refusal precedence** | Owner-equivalent: CV-1101 names no precedence for two defects. Pinned by `datetime_unit_date_time_precedence_leap_second_before_utc_z` (`2016-12-31T23:59:60+01:00` under `storage_utc_z` refuses `date_time_leap_second`) and `…_profile_before_type` (a non-string under an unknown profile refuses `date_time_profile`). | `hw-tb5-utc-z-before-leap-second` (rule `profile.storage-utc-z`), `hw-tb5-type-before-profile` (rule `profile.selection`) |
| **B-DT15: `code:N` and `html:N` origin spelling** | `datetime_unit_scan_origin_spellings`: the exact origin of each container kind, which keys rows and exclusions: a fence (`fence:N`), indented code (`code:N`), inline code (`code_inline:N:i`), a fence in a list item, an HTML block (`html:N`, unreadable there), a JSONL line (`jsonl:N`) and a schema two serialized strings deep; `datetime_unit_scan_exclusion_at_each_origin_used`: an exclusion at `code:3`, `html:3` and `code_inline:3:1` is used, with no stale exclusion. The respelling `code_block:N` had passed the whole replay; only the committed `code:11` exclusions noticed it, under `--scope all`. | `hw-tb5-block-origin-spelling` (rule `scan.mentioning-container`) |
| **B-DT18: two byte order marks** | `datetime_unit_scan_decode_two_byte_order_marks`: a UTF-8 file that starts with a second U+FEFF after the BOM the codec consumes is read as its JSON (`decode_text` strips every leading U+FEFF; the choice is pinned). The mutant fails closed: such a file no longer parses. | `hw-tb5-second-bom-kept` (rule `scan.decoding`) |
| **B-DT19 (fail-open): an exclusion hid a resource reached through `%2E%2E/`** | `_exclusion_schema_paths` already normalises; nothing told it apart. `datetime_unit_scan_exclusion_referenced_through_encoded_dot_dot` (the review's input: `Plans/a/ref.json` refers to `%2E%2E/copy.json`), `…_through_dot` (`./copy.json`) and `…_through_doubled_slash` (`sub//copy.json`): an exclusion of the file such a `$ref` names is refused (`loadable_schema_exclusion_forbidden`). | `hw-tb5-exclusion-paths-not-normalised` (rule `scan.loadable-never-excluded`) |
| **B-DT20: a nested `:string:` origin split once** | `datetime_unit_source_document_two_strings_deep`: a row two serialized strings deep reads its source document. | `hw-tb5-nested-string-origin-split-once` (rule `inventory.source-owner`) |
| **Finding 3: one suite** | `survivor_witnesses()` ends with `integration:<name>` for the twelve date-time owner checks `--scope all` runs that are not regression checks (`integration_names()`: `datetime_integration_checks` less `regression_checks`, named once from the intact code): the committed-tree inventory check (`datetime_inventory_complete_and_classified`), the fence-container check, `eventrecord_datetime_valid` and the nine `eventrecord_format_enforced_*` checks. They run once per mutant under the installed mutant and are kept on the context; they come last, so only a mutant that survives everything before them pays for the committed-tree scan. The replay now judges on exactly the `--scope all` date-time suite (B-DT15 had survived the replay and failed only that inventory check). | the suite: 611 self-checks, the date-time corpus cases, the regression checks and 12 integration checks |

Each `hw-tb5-*` mutation is the review's blind edit, committed with its rule and its new witness.

**Soundness:** nothing widens. `survivor_witnesses()` adds 12 witnesses, so a declared survivor must survive more: this only narrows what a survivor may be. `integration:` is a new witness kind committed rows may name (none does); the control is its check: the intact code survives every witness, the 12 integration checks included, so none of them is false on the intact tree. Everything else adds 11 checks and 7 mutations.

### Rerun results

| Check | Base `90a50fdf62` | Now |
|---|---|---|
| date-time `--self-test` | pass, 605 checks (600 + 5 freshness) | **pass, 616 checks** (611 + 5), 0 failures, 0 freshness problems; 495 points (production code unchanged, so the same points), 12 declared survivors, 102 hand-written mutations; 2 min 36 s |
| date-time `--mutations --only hw-tb5-` | — | **7 of 7 caught**, each by its own new check (`witness_failed`), 0 build errors, 0 runner exceptions, `problems` empty; 2 min 41 s |
| the 12 declared survivors and the control over the 23 new witnesses (11 self-checks, 12 `integration:`), with the gate's `mutation_points`, `point_code` and `run_mutant` (`dt_survivors.py`) | — | **all 13 survive**; 340 to 412 s each, the committed-tree inventory scan most of it |
| date-time blind replay (the review's 20, `blind_run.py dt`, over `survivor_witnesses()`: 8,025 witnesses: 611 checks, 6,539 cases, 863 regression, 12 integration) | **13/20** caught (B-DT11, 12, 13, 15, 18, 19, 20 survived) | **20/20 caught**; each of the seven by its own new check (B-DT15, 18, 19 and 20 after 111 to 129 s, the rest in seconds); the control survives every witness (1,044 s) |
| number `--self-test --scope numbers --mutations` | 417: 412 caught, 5 declared survivors, 44 data points; 571 cases | **423: 418 caught, 5 declared survivors**, 0 undeclared, 0 build errors, `problems` empty; 580 cases (304 negatives, 276 positives); 108 of 108 rules, 114 rule rows caught, 80 reason rows; 63 owner checks; 91 s |
| number blind replay (the review's 20, `blind_run.py num`) | **14/20** (B-N09, 10, 11, 12, 14, 20 survived) | **20/20 caught** (18/20 before B-N10 and B-N12 were pinned) |
| `--self-test --scope all` | pass, 13,617 cases | **pass, 13,626 of 13,626 cases** (6,939 positives, 6,687 negatives, all labelled), 937 owner integration checks all true, 0 failures; date-time inventory pass with the recomputed pin (233 nodes: 133 Storage, 89 other-owner, 3 automatic, 8 roles, 0 unclassified); 7 min 49 s, 533 MB peak |

The full date-time `--mutations` replay (590 rows, about 2 h 45 min in batch 4) was not rerun. A caught row is judged by its own committed witness alone, and this batch changes no production code and no existing check; the only rows whose judgment changes are the 12 declared survivors, which must now survive 23 more witnesses, and they do (above).

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/TOOLS-BATCH5/numrule/` (`results/`: the date-time self-test, the `hw-tb5` replay, the survivors over their new witnesses, both blind replays (the number one before pinning B-N10 and B-N12 too), the number `--mutations` run and the `--scope all` run; `tools/`: the run scripts, `dt_survivors.py` and the review's `blind_run.py`).


## Sol max gate finding 1 (REAL): fix

**Source:** `REVIEW-gate-solmax-numrule.md` finding 1 (`SOL-NUM-GATE-20261107-01`): a REAL false pass of `datetime_validator` on the committed EventRecord schema row. Fixed at once, outside the tool batch (`test-tool-bar.md`).

- **Base:** `a16f67c1ef` on `plans/ea-numrule-20261105`. Worked in one local sparse worktree (`Plans`, `scripts`, `reports`); fast-forward push, no force.
- **Commits:** `a73b395e54` (the fix, its negatives and the mutation set) and this report.
- **Files touched:** `scripts/pm_event_datetime.py`, `scripts/pm_event_datetime_selfcheck.py`, `scripts/pm_event_datetime_mutations.json`, and this report. No schema, corpus, inventory, exclusion or number-scope file changed.

### Location, cause and fix

| | |
|---|---|
| **Where** | `scripts/pm_event_datetime.py:108` (was `:106`), `format_checker`'s `check`. |
| **Why** | It selected values by exact type: `True if type(value) is not str else date_time(...)`. JSON Schema treats a `str` subclass or a stdlib `StrEnum` member as a string. Such a value skipped the predicate, so `Plans/event_record.schema.json#/$defs/date_time_string` accepted `not-a-dateZ` at `occurred_at_utc`, `observed_at_utc` and `persisted_at_utc`. The Storage terminal-`Z` pattern also matches its final `Z`. Direct `date_time` already refused it (`date_time_type`). |
| **Fix** | Select with `isinstance(value, str)`: every value the validator treats as a string calls `date_time`, which refuses a non-exact `str` with `date_time_type`. Non-strings still pass the format check (`datetime_unit_format_checker_non_string_passes`). Schema bytes are unchanged. |

### The new negatives

They are self-checks in `pm_event_datetime_selfcheck.py`, so every suite runs them: the date-time `--self-test`; `--scope all`, through `regression_checks` → `run_all`, listed among its owner integration checks; and the replay, in its intact run, as `check:` witnesses and in `survivor_witnesses()`, so every declared survivor must survive them.

- **`datetime_validator_real_eventrecord_<field>_<kind>_refused`**, six checks: each of `occurred_at_utc`, `observed_at_utc` and `persisted_at_utc`, for `str_subclass` (the existing `StrSub`) and `str_enum` (a stdlib `enum.StrEnum` member). Each runs `datetime_validator` over the complete committed EventRecord schema, built from `Plans/seglog_frame_v2_wire_fixtures.json` `base_event`:
  - `base_event` is valid;
  - with the field replaced by the host value, for `not-a-dateZ` and for `base_event`'s own valid text alike, every error is a `format` error at that field whose cause is `date_time_type`;
  - the JSON round trip of the malformed value is a plain `str` and is still refused (`date_time_syntax`).
- **`datetime_unit_format_checker_str_subclass_runs_predicate`:** the checker itself, under `event_record` and `storage_utc_z`, refuses both kinds with both texts (`date_time_type`) and still accepts a valid plain string.

### Mutation set

- **`hw-solgate-format-exact-str-selection`** (new; rule `format.type-independent`) restores `type(value) is not str`. Its witness is `check:datetime_validator_real_eventrecord_occurred_at_utc_str_subclass_refused`. Under the mutant, with one witness per run, each of the seven new checks fails. Each of the five existing format and EventRecord checks passes, which is the gap the review found: `datetime_unit_format_checker_non_string_passes`, `_runs_predicate`, `_storage_profile`, `datetime_validator_real_inventory_format_installed` and `_envelope_storage_fields`.
- **`hw-format-non-string` and `hw-format-profile-ignored`:** `find` and `replace` re-pointed at the changed line; each is still caught by its committed witness.
- **Rule `format.type-independent`:** its text now states the selection. Format applies to every value JSON Schema treats as a string and to nothing else. A non-string passes. A string, a `str` subclass or `StrEnum` member included, runs the predicate, which refuses a non-exact `str`.
- **Generated points:** 495, the same keys; none new, none stale. No committed row moves: 17 points of `pm_event_datetime.py` shift two lines, and committed entries carry no line. No inventory row or pin moves: the scan universe is `Plans/`, and no committed file pins these scripts.

### Other exact-type string gates

An AST listing of every `type(x) is [not] str` in `pm_event_datetime*.py`, `pm_event_numbers.py` and `pm_event_index_binding.py` finds 25 sites. The format checker was the only place where a string-like value skipped its check, so nothing else changed:

- **Every other gate refuses.** Driven with `StrSub` and a `StrEnum` member, each refuses: `date_time_type`, `date_time_profile` (in `date_time` and `format_checker`), `integer_token`, `json_number_token`, `replay_policy`, `json_input_type`, `jcs_type`, `jcs_key_type`, `physical_type`, `physical_key_type`, `binding_domain`, `payload_id_type`, `payload_media`, `recipe_tuple`, `original_binding`, `original_scope` and `original_query`. `binding_bytes` raises `TypeError`. None accepts.
- **`pm_event_numbers.py:176`** (the walk in `loads_exact`) sees only `json.loads` output: built-in `str`, behind the exact-type `raw` gate.
- **The hits in `_mutations.py` and `_selfcheck.py`** are tool code: AST constants and test assertions.
- **The inventory and the value probe** select with `isinstance`, which includes subclasses, so nothing skips there.

### Rerun results

| Check | Base `a16f67c1ef` | Now `a73b395e54` |
|---|---|---|
| reviewer's `host-input-repro.py`, unmodified | 6 false passes; output equal to the review's `host-input-repro.json` | **0 false passes:** all six refused. The 9 JSON round-trip controls are still refused, `base_event` is still valid, and direct `date_time` is unchanged. |
| date-time `--self-test` | pass, 616 checks | **pass, 623 checks** (618 + 5 freshness), 0 failures, 0 freshness problems; 495 points, 12 declared survivors, 103 hand-written mutations; 4 min 42 s |
| `--self-test --scope all` | pass, 13,626 cases, 937 owner integration checks | **pass, 13,626 of 13,626 cases**, every case outcome identical to the review's base record; **944 owner integration checks all true** (937 + the 7 new); date-time inventory identical (233 nodes: 133 Storage, 89 other-owner, 3 automatic, 8 roles, 0 unclassified); 14 min 13 s, 479 MB peak |
| number `--self-test --scope numbers` | pass, 580 cases, 63 owner checks | **JSON-equal to the review's base record** |
| number `--scope numbers --mutations` | 423: 418 caught, 5 declared survivors | **JSON-equal to the review's base record** |
| date-time `--mutations`, the full replay | NOT_RUN in the gate review (blocked by this finding) | **598 of 598 rows: 586 caught, each by its committed witness (`witness_failed`), 12 declared survivors, 0 undeclared**; 0 build errors, 0 runner exceptions, 0 not applied, `problems` empty; 72 of 72 rules caught; 96 of 96 statement rows caught, 12 reason rows; every chunk's intact run 618 of 618 self-checks; survivors 1,540 to 1,691 s each, against a 3,600 s limit |

The replay ran detached as 12 `--only` chunks through the gate's own CLI (`pm_event_datetime_mutations.main`), because a full run is longer than 2 hours on one command. `verify_partition.py` shows, with the CLI's own substring rule, that the chunks partition the 598 committed rows exactly: 0 overlap, 0 missing. The first plan's chunks A and B each held four or five survivors. Both were stopped and re-split, one survivor per sub-chunk and closed under substring selection, so `site:…#1` travels with its `predicate:site:…#1:…` rows. No result of the stopped runs is used; their logs are in `replay/stopped/`. `merge_replay.py` joins the chunks the way `run_mutations` aggregates a full run: the rows, then the rule and statement verdicts over every row, then the totals. Each declared survivor survived the complete `survivor_witnesses()` suite, 8,039 witnesses (618 self-checks, 6,539 cases, 870 regression and 12 integration checks; 8,025 at the base), with the seven new checks included. A first launch was stopped after four minutes, with no result used: my first rewrite of the mutation set had escaped two `’` characters as `\u2019`. The JSON meant the same, but the bytes differed. The set was rewritten byte-faithfully, the commit amended before any push, and every run reported here for `a73b395e54` was started again at that commit.

Runs used a disposable venv over the system Python 3.14.4 that pins `msgpack==1.1.2`, with `rfc8785` 0.1.4, `blake3` 1.0.11 and `jsonschema` 4.19.2, the review's versions. Available memory was at least 15 GiB at every check. Scratch and runs stayed on the VM's local disk; only the cited evidence below was copied to the share.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/sol-gate-p1/`. `SHA256SUMS` binds every file in it.

| Evidence | SHA-256 |
|---|---|
| `results/host-input-repro-fix.json.gz` (the reviewer's script, unmodified, at `a73b395e54`) | `23df149a015872995e96dcea2f5edfbae6bc5bd2b49e7492b00b15e9c886280a` |
| `results/host-input-repro-base.json.gz` (at `a16f67c1ef`, equal to the review's record) | `348e025f33be2f434585f2fff3e26a3ee4c3ec8723a4442d3a0bb941d9a150e7` |
| `results/p1-mutant.json.gz` (the new mutant over each check, one run per witness) | `73b02a8229608777fe9ef84b1cec4cb0cdb49050e056b916599afcc073a413b5` |
| `results/host-string-sweep.json.gz` (the 25 exact-type gates and their host-value outcomes) | `be8d3d026eb694850b427366830eb77c8b41233c2ecfe66d1fd99d5d098ad293` |
| `results/dt-selftest.json.gz` | `e5e306c12bbb57184aa56378a0df8bc9e7b40034fac2c608f4f1edf2b890a81e` |
| `results/scope-all.json.gz` | `ed9e896d525fca3d16c8c8ff6c780a65475f9df1e63cb7c8d282557b9f940b3f` |
| `results/num-selftest.json.gz` | `f0eeae179d0be4f43576f93e20bc96d82631955a0f8cfd23e20ddb990a371f82` |
| `results/num-mutations.json.gz` | `5d603b662a00a239d082981f9e524e851892d00a49138eb707eb2d28052f8d42` |
| `results/points-fix.json.gz` (495 points; `points-base.json.gz` beside it) | `01d4f64a81e331f339cdcc48b887590374e33aac1113627e18257f4c666de617` |
| `replay/merged.json.gz` (all 598 rows; the 12 chunks beside it) | `faaa1fbd9a5ffb55cddb0474934077f36bf6bafc40a73ce1557e67d6aa3418b7` |
| `replay/merged.summary.json.gz` | `fa784c820de0cf4bb5c634f8e1327fff26c76339f519ac7374323aa6fe24fd87` |
| `results/survivor-witnesses.json.gz` (the suite a declared survivor must survive) | `cbe92c1a22f255df309c307e64354fbd8eb194a7afe9ae5bbefba5d11450a899` |
| `replay/plan2.json.gz` (the partition check) | `3950bfd23a1aebe6457d19cd36d836e7abedca231f244330677c303877bffa54` |

The drivers are in `tools/`: the review's `host-input-repro.py`, `p1_mutant.py`, `host_string_sweep.py`, `points.py`, `plan_chunks.py`, `resplit.py`, `verify_partition.py`, `run_chunk.py` and `merge_replay.py`. `results/run-input-sha256.txt.gz` pins the inputs every run read.
