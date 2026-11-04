# DM — DL-408 application fix 1

Worker: **DM-APPLY-FIX1**, VM. Branch: `plans/ea-w2-small-owners-20261104`. Input: `90f7e163614575558644d291f283c19ae6f305a9`. Companion/checker fix: `66655ae43ec98be050816fb574ef26d9d9e8709c`. Exclusion application: `e2cfea7c5823e1ea822cfd088db0c125a0327d5b`. The final reporting commit contains this assessment and the derived index; its parent source/data revision is the application head above.

**B4 and B5 are fixed. All eight prepared families preserve their cycle-3 grades.** The full lane checker passes **4,965 assertions**; **72/72** standing-check regressions and **40/40** Settings regressions fail through the complete checker with exit **1** and the expected assertion. All eight failure-oracle guards reject exit **0**. These are static contract/model checks; native execution remains **NOT_RUN**.

## Review round 3: findings and responses (DM-APPLY-FIX1)

- **B4 — fixed (`66655ae43ec98be050816fb574ef26d9d9e8709c`). Where:** `Plans/Wiring_Matrix.production.json:71407` through the four theme entries, `Plans/touch_closure.json:3182`, and `Plans/Wiring_Matrix.production.exclusions.json:306`. **Cause:** sixteen theme requirements and two future-DRY passages retained the superseded names. **Fix:** all four theme commands use only `settings.layer.changed`; the DRY companion passages use that successor under SSYS-060/DL-300 and existing owner-adoption prerequisites. The DRY guard retains empty event refs, absent handler/wiring, `owner_contract_missing`, zero mutation dispatch and zero writes. Historical dedicated DRY records remain read-only without aliasing or payload rewrite. `scripts/pm-small-owner-events.py:64` checks the actual current companions; `:89` exercises forty authored refusal cases. The fixture adds no retired-family writer or positive EventRecord. Verification: the complete checker passes; forty separate full-checker processes catch retired-name reintroduction in every theme requirement field and both DRY passages, premature guard claims, and loss of historical readability.
- **B5 — fixed (`e2cfea7c5823e1ea822cfd088db0c125a0327d5b`). Where:** `Plans/.audits/event-authority-2026-08-12/individual-disposition/rows/ROW_settings.theme.updated.json:5`, `ROW_settings.updated.json:5`, the mirrored ledger lines 251–252 and census lines 255–256. **Cause:** the approved retirement had no Step 9 exclusion application. **Fix:** both exact names now have `RECLASSIFY_TO_EXCLUDED` in all six representations. `DM-settings-exclusions-application.json` records each row's before/after SHA-256, both whole-ledger hashes and each changed line's hashes, thirteen exact checked source quotes, the pinned DL-408 decision branch and immutable fields. The row rationale and appended citations distinguish historical August depth evidence from current retirement evidence. Verification: `apply-fix1/verify-exclusions.py` passes; only the two named lines in each ledger change, mirrors agree, every recorded hash and quote matches, and all frozen fields and inherited evidence remain intact. No denominator removal is claimed.
- **N1 — carried qualification (this report/index commit).** Index generation changes the four existing top-level `generated_at_utc` fields. Its only substantive change is expected staleness for the edited production Wiring Matrix hash and exclusions source; no unrelated owner, PlanUnit, shard, JSONL index or generator changed. `scope-derived-audit.json` checks the exact two-source delta. Literal derived byte identity is qualified by those clock fields and the required edited-source staleness update.
- **N2 — fixed (this report/search commit).** Every retained `hits` collection in `DM-search.json` is labelled with capture revision `81746599e17375fda60b8b51c8ac2bfd3c2b09d7`. All **79** historical hits match that revision; the **22** other current binding quotes still match current source. They are no longer presented as current search verification. All **248** current self-grade quotes and source hashes were checked and the moved checker definitions re-anchored.

No finding is disputed or stopped for Jared. No decision beyond **2d A** is made.

## Authority and boundaries

DL-408 is pinned to `origin/plans/ea-cards1-answers-20261104` at `b6332f391a7870bad5f01a29a7e9d080050dac27`; its Decision Log integration remains a dependency. Jared's exact answer, the as-presented **2d A**, and current Settings/UCC/UIW/Storage passages are checked in the application record. The as-presented card SHA-256 is `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`. DL-408 replaces DL-041's naming premise only. The prior DL-039 phase-1 evidence remains historical.

Every Settings change uses only `settings.layer.changed`; `settings.updated` and `settings.theme.updated` are retired as superseded. Older `settings.agent_rules.dry_method_default_guard.updated` records stay readable. The DRY guard stays disabled pending exact key-to-valid-setting-ID/writer proof. The Memory switch, theme transactions, existing result/receipt joins, preview non-emission and owner-adoption gates retain their current owners. No alias, event-byte rewrite, writer adoption, scope/identity choice, retention/deletion choice or new admission is supplied.

No owner Markdown was edited, and no shard changed. No registry append, admission record, Decision Log entry, governance reseal, frozen validator, cohort map, Spec Lock or auto-decision was changed. No pm-mail, subagent, browser, server, landing lock or main push was used.

## All nine standing checks, all eight prepared families

| Exact family | 1 replay-only | 2 key | 3 partition | 4 bytes | 5 LF | 6 semantics | 7 checkpoint | 8 failure exit | 9 refs |
|---|---|---|---|---|---|---|---|---|---|
| `format.applied` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `lsp.server.lifecycle_changed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `model.catalog_refreshed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `subagent.context_rehydrated` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `subagent.context_shrunk` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `project.added` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `project.created` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| `git.clone.completed` | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS | PASS |

1. Each current retry refuses even a genuine retained `projector_replay_only` original; immutable historical reads remain unchanged.
2. The three application-capable families retain CV-366's exact actual-Server/original-operation UTF-8-hex key. The five Project-only families retain their own exact recipes and reject foreign application keys.
3. All eight retain their validating encoded `project~` Project positive.
4. All eight retain Storage's 16 KiB inline gate; the three legally large-body families keep SP-337 external-body cases. No external-body product behavior is added to the five bounded schemas.
5. Existing payload and coherent checkpoint trailing-LF refusals remain. No trimming or normalization is accepted.
6. Caller semantic comparison excludes Storage `sequence_id`, `observed_at_utc` and `persisted_at_utc`; full-value identity still rejects changed stored bytes.
7. Foreign Storage/source/key/generation, selected live-token/frontier and persisted-snapshot mismatches preserve old publication.
8. An invalid original witness makes the complete checker fail; the separate failure guard accepts only expected exit 1 and refuses exit 0.
9. `scripts/pm-small-owner-events.py:34` resolves every `$ref`, including unused definitions, in all eight payload schemas and their shared envelope/receipt/checkpoint schemas. References use an offline registry of the checked schema corpus. Every family has an unused dangling-reference negative; a separate mutated full-checker run must fail. An unresolved reference is never counted as an expected data refusal.

The matrix runs with one process-local mutation at a time, keeping every other family and original assertion enabled. `DM-apply-fix1-standing-checks.json` records each child command, exact failure, exit code and external output path/SHA-256. Existing original fixture vectors are byte-semantically unchanged after removing only the added negative matrices. No existing refusal was weakened.

## Family grades before and after

Before is the **cycle-3 independent review** at the requested input, including its two Settings compatibility PARTIAL corrections. The input self-grade had overstated those two cells as PASS. After records the completed application; N/A remains disposition-only and supplies no current-writer depth credit.

| Exact family | Cycle-3 reviewed before | After |
|---|---|---|
| `format.applied` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `git.clone.completed` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `lsp.server.lifecycle_changed` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `model.catalog_refreshed` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `project.added` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `project.created` | 10 PASS / 1 PARTIAL / 1 ABSENT | 10 PASS / 1 PARTIAL / 1 ABSENT |
| `settings.theme.updated` | 1 PASS / 1 PARTIAL / 1 ABSENT / 9 NOT_APPLICABLE | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE |
| `settings.updated` | 1 PASS / 1 PARTIAL / 1 ABSENT / 9 NOT_APPLICABLE | 2 PASS / 1 ABSENT / 9 NOT_APPLICABLE |
| `subagent.context_rehydrated` | 11 PASS / 1 ABSENT | 11 PASS / 1 ABSENT |
| `subagent.context_shrunk` | 11 PASS / 1 ABSENT | 11 PASS / 1 ABSENT |

All eight remain **PASS AS PREPARED**, with membership intentionally ABSENT. Six permitted `PENDING_RETENTION_DECISION` cells remain with RT; the two child-context rows keep their reviewed existing Runtime retention binding. Other card answers, including retention, are outside this fix. Each retired name has two PASS disposition cells, intentional ABSENT membership and nine NOT_APPLICABLE current-writer cells. Aggregate: **86 PASS / 6 PARTIAL / 10 ABSENT / 18 NOT_APPLICABLE**.

## Verification and delivery

| Check | Exit / result |
|---|---|
| Full lane checker | 0; 4,965 assertions, eight families PASS |
| Nine standing checks per family | 0; 72/72 full-checker negatives rejected; 8/8 success-exit guards reject 0 |
| DL-408 companion regressions | 0; 40/40 full-checker negatives rejected |
| Exclusion hashes, citations and frozen fields | 0; two rows / six representations / thirteen exact checked quotes |
| Historical/current search and self-grade quotes | 0; 79 historical hits, 22 current bindings, 248 current grade quotes |
| Shard check | 0; parsed `pass`, 99 sources / 3,092 shards |
| Index generate / validate | 0 / 0; parsed top-level `pass`; runtime readiness remains blocked |
| Settings layering | 0; 135 semantic cases, 1,017 rows |
| Existing DRY guard consumer tests | 0; ten tests |
| Storage recovery self-test | 0; parsed `pass` |
| Storage profile | 1; unchanged 41 missing-profile errors; output SHA-256 `89d47858adcab797033a9feca549351641cfb6a2f6ee5da75a2c62082b3d450b` matches the pinned review byte for byte |
| Scope/derived audit and whitespace | 0; no unrelated owner output; inherited CRLF accepted with `cr-at-eol` and default whitespace rules |

`DM-checks.json` contains commands, exits and output hashes. Raw check outputs and reproducible mutation/audit scripts are under `/mnt/Cursor/archive/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/apply-fix1/`; their final manifest records paths and SHA-256 values. Currentness generation input: fifteen files copied from the share and individually hash-matched before index generation. The first index validation reported the expected edited-source staleness; regeneration reconciled only that delta. No governance seal was refreshed; the edited Wiring Matrix sources still require the integration reseal.

Report, self-grade, checks, search and application copies are delivered to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DM/`. The prior report/grade/check/search snapshots remain in `apply-fix1/input-DM*` for lineage. Entry resources were **128 GB free root disk / 16 GiB available memory**, above both hard limits. The required sparse worktree is removed after the final push; no other checkout is touched.

**IDs used:** no new PlanUnit or runtime binding IDs. Existing lane units remain **FS-075, LSPS-173, MS-199, PP-151/152, PJCT-072/073, SCS-085, CV-620–627, SP-600–607, ATS-300–304**. The fix applies existing **DL-408 / SSYS-060 / UCC-084/104/108 / UIW / WM-040 / SP-348** authority and reuses **CV-366, SP-278, SP-286/CV-339 and SP-337**. Original per-family search and newly authored bindings remain in `DM-search.json`; no new product binding is authored in this fix.
