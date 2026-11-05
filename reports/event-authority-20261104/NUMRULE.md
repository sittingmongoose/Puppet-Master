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

Latest round-3 commands, exit codes and artifact SHA-256 values are recorded in `NUMRULE.checks.json` and the external `fix3/*.run.json` files. Round-2 results remain in the external `fix2/` bundle. Round-1 results below are historical and remain in the external `fix1/` bundle. Shard regeneration/check and top-level index generation/validation passed (7426 PlanUnits, 29960 acceptance units, readiness blocked_runtime_certification_incomplete). The 370-case corpus, 65 targeted regressions and all 30 existing binding/runtime-storage unit tests passed. The deliberate failure returned exit 1 and retained an exception as its own outcome. Derived scope is confined to Contracts/Storage (157 shard files, their PlanUnit/acceptance rows and two document cards). Generators and checkers run one at a time with a memory preflight; under 6 GB pauses at two-minute rechecks, resumes at 7 GB, and stops only after 45 minutes continuously below 6 GB. Initial Nas1 disk: 462 GB available; memory: 11 GB available. An automatic pause before index validation observed 5 and 6 GB available; validation resumed at 8 GB. The 45-minute stop threshold was not reached.

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
