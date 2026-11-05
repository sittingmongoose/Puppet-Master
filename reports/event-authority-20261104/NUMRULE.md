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

## Corpus and bounded evidence after review round 1

The current corpus has **370 cases: 193 positives and 177 negatives, all 177 labelled with target predicates**. Every case passes its finite oracle; 69 unchanged-owner/enforced-envelope integration checks pass. The original 25 diagnostic-group proof claims are withdrawn. Per-predicate isolation is **SWEEP_PENDING**, adopted through the shared guard tool, not a replacement proof script on this branch.

Binary64-only controls use ±10^23 (equal emitted decimal, inexact binary64); decimal-only controls include 2^60 (exact binary64, different emitted decimal). The 2^53+1/u64-max full-route refusal controls remain separate integration checks because they violate both predicates. Kind-only integral-float and sign-only negative-zero cases select only the relevant required semantics. The LF payload ID decodes to the correct digest; an independent well-formed ID has a wrong digest. Unknown recipe custody is an authentic sealed unsupported original; resource substitution uses a supported tuple and stale original resource selection only.

Raw/typed 1.5 and 1.25 pass with the declared float kind across JsonNumber, native float and Decimal carriers. Bare Decimal requires an explicit kind at a type-sensitive path. Both type-sensitive -0.0 refusal and sign-only refusal remain checked. Timestamp cases cover lowercase, nonzero/unknown-local offsets, long fractions, real offset-adjusted leap seconds, calendar/range/syntax negatives, stricter owner profiles and authenticated original profile refusal. All five literal numeric-history originals remain unchanged.

Admission evaluation returns acceptance/refusal/exception separately. Retained success-output assertions execute after admission; a forged returned result/receipt therefore counts as acceptance when its real verifier is cut. The targeted 65-case external regression run demonstrates that harness behavior, exception separation, independently valid unsupported custody, syntax-only LF, all 27 pinned leap days, 5000 fractional digits and exact timestamp spellings in hashes. This is bounded regression evidence, not a general guard-isolation proof or native custody proof.


## Verification

Round-1 commands, exit codes and artifact SHA-256 values are recorded in `NUMRULE.checks.json` and the external `fix1/*.run.json` files. Shard regeneration/check and top-level index generation/validation passed (7426 PlanUnits, 29960 acceptance units, readiness blocked_runtime_certification_incomplete). The 370-case corpus, 65 targeted regressions and all 30 existing binding/runtime-storage unit tests passed. The deliberate failure returned exit 1 and retained an exception as its own outcome. Derived scope is confined to Contracts/Storage (157 shard files, their PlanUnit/acceptance rows and two document cards). Generators and checkers run one at a time with a memory preflight; under 6 GB pauses at two-minute rechecks, resumes at 7 GB, and stops only after 45 minutes continuously below 6 GB. Initial Nas1 disk: 462 GB available; memory: 11 GB available. An automatic pause before index validation observed 5 and 6 GB available; validation resumed at 8 GB. The 45-minute stop threshold was not reached.

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
