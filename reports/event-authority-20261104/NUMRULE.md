# NUMRULE shared owner and adapter draft

Branch: `plans/ea-numrule-20261105`. Base: `fb441b27fd75440e14115fb382b15a5258ad7ea3` (`origin/main` after the required fetch). The report describes the commit containing it; the pushed head is recorded separately in the evidence bundle's `pushed-head.json`.

## Delivered scope

| Unit | Location and binding |
|---|---|
| CV-1100 | `Plans/Contracts_V0.md`, after EventRecord/compatibility versioning: exact current integer grammar/types, unchanged purpose-specific recipes, exact JCS route qualification. Referenced by EventRecord, CV-317 and CV-366. |
| SP-1100 | `Plans/storage-plan.md`, beside SP-236/SP-026: exact physical integer/uint64 domains, type-preserving shortest EventRecord floats and signed zero, separate SP-278/app profiles, exact original payload bytes. |
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

## Corpus and mutation evidence

The shared corpus has 289 cases; all pass. There are 25 AST guard-removal groups with unchanged negative inputs and unrelated refusing controls, plus 57 unchanged-owner integration checks. The corpus covers C01–C10 and the design's N01–N11 boundaries within the shared adapter scope. Coupled exact-value checks and coupled unknown-selection/original-verification checks are explicitly named together; library parser guards are tested with independent rejection vectors rather than rewritten.

| Conflict | Shared evidence |
|---|---|
| C01/C02 | Actual JCS equivalence for 1/1.0/1e0, exponent formatting and UTF-16 key order; no sorted-Python-JSON substitution. |
| C03/C04 | 2^53−1, 2^53, 2^53+1, 2^60, 2^63, 2^64−1, signed endpoints, overflow and an unbounded 5000-digit current token; binary64 and output-decimal guards weakened separately/as a named pair. |
| C05 | Frozen whole-event/full-value bytes; integral floats and both zero signs; app float64/binary, SP-278 restrictions, nonminimal/forbidden/duplicate/unordered/trailing byte negatives; original payload byte/size/media and inline/reference cases. |
| C06 | Exact uint64 positives for sequence, segment/selected/manifest generation, recovery epoch, frontier revision, retained count, offsets and byte size. Producer exclusions and complete-value inclusions are checked independently. |
| C07/C08 | Raw alternate spellings, leading-zero/plus/LF, wrong primitive types, 9007199254740993.0/exponent preservation before rounding, nonfinite/overflow/underflow and duplicate/invalid-Unicode JSON. |
| C09/C10 | Literal old bytes independent of the new encoder; current replay-only refusal; supported current/old selection; caller override, downgrade, resource substitution, unknown/ambiguous/missing/foreign custody, forged bytes plus recomputed self-hash, result/receipt tampering and disclosure/withdrawal negatives. |

Astra defect checklist: identity/source contradictions and forged self-hashes are checked against independent original anchors; Storage metadata exclusion/full-value inclusion is explicit; original history uses frozen selection; exact types precede comparison; no new schema or `$ref`/`format` contract was introduced; byte-size limits compare complete selected bytes; every retained resolution verifies original custody; authored guard negatives flip under the named mutations; no family/native PASS is claimed; exact numbers and retained older recipes are both exercised. Whole lane schemas, original start slots, redb wrapper caps, native timestamp/URI validation and current effect/pack custody belong to the adopting lane/owner; the shared helper does not claim to have executed them.

## Verification

The exact commands, exit codes and artifact hashes are in `NUMRULE.checks.json`. Shard generation/check, plan-index generation/top-level validation, helper self-test, existing SP-278 tests and shared runtime/storage tests passed. The index reports 7425 PlanUnits and 29956 acceptance units; its existing `blocked_runtime_certification_incomplete` readiness remains. Derived scope checks show only Contracts/Storage shard groups, PlanUnit/acceptance rows and document cards changed; aggregate index files were regenerated. No unrelated owner document changed.

Nas1 started with 498 GB available disk and 13 GB available RAM. Generators/checks ran one at a time; observed RAM stayed above the 6 GB floor. The two machine-memory files requested by the brief were absent at their specified locations and no relocated copies were found under the local Claude/T3 roots; their rules were independently covered by the all-origin ID scan and copied currentness edition.

The ignored currentness edition was copied before index generation and all 15 files matched by SHA-256 at copy time. Later `sha256sum` revalidation confirmed the copied files still match those pinned hashes, while five files in the live shared source had advanced concurrently. The pinned input edition is retained in the external evidence `currentness-input/`. That source drift is recorded in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/NUMRULE/currentness-source-drift.json`; this branch did not recopy it or regenerate unrelated owners from it. This is not a governance reseal.

## Premises, grades and open items

All 57 surveyed owner quotations still occur exactly in the current base; `owner-premise-checks.json` records each one. DL-045's current technical-authoring boundary remains the one quoted in the design; existing encoding/range/recipe/retained-reader premises are unchanged. No old product answer was extended or reworded. Failed owner premise checks: none. Unresolved Jared question: none.

The event-family grading rows are empty: this is a shared prerequisite and no new family membership or twelve-criterion family PASS is claimed. `NUMRULE.self-grade.json` assesses the three shared units separately. Native original-owner installation/authentication/activation/durability/restore proof, complete schema/successor route qualification and the 19-lane adoption sweep remain unexecuted integration work. Ordinary expected governance staleness awaits the assigned later integration/reseal; no landing, landing lock, main push or reseal is part of this branch.
