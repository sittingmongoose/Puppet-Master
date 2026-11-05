# DFM — review round 7: completed settlement, location and withdrawal fixes

Branch `plans/ea-w2-filemanager-20261104`; assessed implementation `cadf31fcb5596671fe1ad3a6db14bfdd14c28154`; incoming head `f70cb3ad5a883de839c27012c90a2b8ee156149a`. **PASS as prepared, with shared sweep/index qualifications.** Membership remains **ABSENT**, retention **PARTIAL / PENDING_RETENTION_DECISION for Jared**, native execution and native alias authentication **NOT_RUN**. This report follows in a report-only commit.

## Review round 7: findings and responses

1. **B1 — fixed (4b7228c0777218d5b9cf830290c8b9ba3b6a8f96; final implementation cadf31fcb5596671fe1ad3a6db14bfdd14c28154).** Where: `scripts/pm-filemanager-event-contracts.py:782` and `:773`, used by effect settlement and complete retained delivery. Why: effect settlement omitted original accepted inputs, payload completion time and copy-result identity. Fix: share the command/source/destination/container/deletion-mode and timestamp joins, and the copy/create identity predicates. All twelve have accepting complete CAS controls and isolated time/input/header negatives; copy/create families also have coherent equality negatives. Project/OperationId receipt observations are recomputed so a second header clause cannot mask the tested join. Both times in the completion-time negative are valid UTC strings; this equality repair is separate from SWEEP-12.
2. **B2 — fixed (cadf31fcb5596671fe1ad3a6db14bfdd14c28154).** Where: `validate_snapshot_subjects`, `scripts/pm-filemanager-event-contracts.py:677`, F-150/F-153/F-154/F-156/F-159/F-160; SP-560, `Plans/storage-plan.md:29541`. Why: unequal opaque handles could resolve to the same original location. Fix: validate the represented `(computer_id, root_identity_ref, relative_components)` relation after the original subject and accepted/settled joins. Remove the redundant handle-only refusal. Six families independently reject coherent same-location effects and current/historical reads. Coordinate-wise distinct positive controls and later-live-relocation/deletion history controls accept. Today's live path is never compared with the historical location. Existing rename parent/basename checks remain.
3. **B3 — fixed (4b7228c0777218d5b9cf830290c8b9ba3b6a8f96; final implementation cadf31fcb5596671fe1ad3a6db14bfdd14c28154).** Where: `validate_control_transition`, `scripts/pm-filemanager-event-contracts.py:827`; SP-560, `Plans/storage-plan.md:29586`. Why: drain arguments were interpreted by truthiness and the drain edge could retire readers. Fix: require an exact list before value operations, exact string/reference members, and preserve readers on active-to-draining. All twelve refuse `""`, `false`, `0`, `null`, `{}` and the additional wrong-type forms. Reference-member negatives use same-state controls, keeping nonempty withdrawal/drain membership from becoming a second defect. Reader-toggle negatives have their own accepting controls and removal witnesses.

## Whole-lane check 11 and guard table

[DFM.guard-table.json](DFM.guard-table.json) lists each predicate/schema/lookup guard, exact family/case IDs that flip, and the complement that stays rejected. **7246 authored outcomes = 468 positives + 6778 negatives.** API/schema/transition negatives additionally execute their accepting controls. **All 6778 unique negatives have accepting guard-removal witnesses; zero residuals.** Restoration refuses them again.

| Proof class | Completed total |
|---|---:|
| Complete family checker / guard / predicate / lookup runs | 12 / 12 / 12 / 12 |
| Explicit refusal sites, all covered | 97 |
| Narrow runtime predicate groups | 171 |
| Schema removal groups | 609 |
| Exact lookup groups / implicit negatives | 5 / 72 |
| Independent site-by-site duplicate witnesses | 6 |
| Narrow harness witnesses | 16 |
| Actual false-success checker subprocesses, expected exit 1 | 12 |
| Old/new schema-language boundary outcomes, zero mismatches | 7155 |

The 03:56Z definition is applied per field/clause. Runtime cuts leave peer predicates enabled. Required-field cuts remove only the missing member; closure cuts permit only the tested unknown field. The remaining duplicates are one input field and one identical predicate: every single-site removal still rejects at a named remaining site; joint removal accepts; restoration rejects. Other negatives retain their unchanged first-refusal prefix or complete schema-error tree, with every affected schema candidate rerun. This is a causal complement proof, not a claim of executing the entire suite for every cut. No product validator is stubbed.

Older retry tuple, original root-slot, control family/cutoff, snapshot coverage, terminal original and missing-reference controls are repaired to carry one defect. Wrong-key controls retain a row under the wrong key, separating raw-key identity from lookup absence. Missing-table/pack tests remove one source and preserve other referents and final/backup observations. Lookup proofs disable only the exact missing lookup; identity predicates remain live.

Schema factoring preserves accepted domains: identifier grammars imply the removed nonempty/short reference bounds; operation-key grammar implies length 97; the EventRecord constant implies string type. Retention keeps its exact nullable scope enum; the non-null-cap branch requires string and the null-cap branch requires null. Their intersections retain exactly the previous allowed complete objects, while the reused general field fragment retains its domain. Independent boundary comparison and formal implications are pinned in `schema-language-check.json`. The two existing Storage companions carry identical updated embedded definitions. No row is appended. Invalid-value diagnostic keywords can change; no accepted value, policy, number range, serializer or physical bytes changes.

## Earlier findings and standing controls

All earlier Sol/Astra controls rerun: original command/root/path custody; full-value and first-receipt proofs; SP-337 body/whole-value boundaries and profiles; copy/create identity; cutoff/withdrawal; checkpoint identity; valid and invalid effect settlement; current replay-only refusal versus valid retained compatibility/replay-only reads; exact lexical tails and missing packs; unvisited schema references; exact types and historical modes. Original Sol cycles 1–3, expanded Astra, the 72-fault schema graph, numeric/type/history and actual harness/process drivers complete. The exact 48 earlier complete-validator schema-rule witnesses also rerun, with one predicate removed and restored in each family. Native execution is not inferred from these synthetic canonical-source models.

Astra's `probes.py` and `followups.py` rerun against the fixes: B1–B3 counterexamples now refuse and their controls accept. Expected SWEEP-NUM/SWEEP-12 acceptances remain disclosed. No failure oracle accepts successful return 0: twelve genuine family processes exit 1 at their exact injected writer-negative assertion. All other actual validators remain enabled.

## Family grades before and after

Before is Astra's binding Q downgrade. Q alone upgrades after completed execution; the other 132 statuses retain their current normative support. Counts are PASS / PARTIAL / ABSENT. All 300 self-grade source citations are checked against current files.

| Family | Own unit | Before | After | Checker outcomes |
|---|---|---|---|---:|
| file.copied | F-150 | 9 / 2 / 1 | 10 / 1 / 1 | 1134 |
| file.created | F-151 | 9 / 2 / 1 | 10 / 1 / 1 | 549 |
| file.deleted | F-152 | 9 / 2 / 1 | 10 / 1 / 1 | 540 |
| file.exported | F-153 | 9 / 2 / 1 | 10 / 1 / 1 | 554 |
| file.moved | F-154 | 9 / 2 / 1 | 10 / 1 / 1 | 557 |
| file.renamed | F-155 | 9 / 2 / 1 | 10 / 1 / 1 | 549 |
| folder.copied | F-156 | 9 / 2 / 1 | 10 / 1 / 1 | 562 |
| folder.created | F-157 | 9 / 2 / 1 | 10 / 1 / 1 | 548 |
| folder.deleted | F-158 | 9 / 2 / 1 | 10 / 1 / 1 | 555 |
| folder.exported | F-159 | 9 / 2 / 1 | 10 / 1 / 1 | 569 |
| folder.moved | F-160 | 9 / 2 / 1 | 10 / 1 / 1 | 569 |
| folder.renamed | F-161 | 9 / 2 / 1 | 10 / 1 / 1 | 560 |

**108 PASS / 24 PARTIAL / 12 ABSENT → 120 PASS / 12 PARTIAL / 12 ABSENT.** Retention remains Jared's exact open choice; no family is admitted.

## Sweep items and integration qualifications

- **SWEEP-NUM:** original review locations `scripts/pm-filemanager-event-contracts.py:234–235,273–274,869–872`; current producer-digest sites `:229`, `:276`, `:945–948`, and historical entrypoints `:876`, `:911`. Adopt shared CV-1100/SP-1100/SP-1101 and authenticated written-recipe dispatch in the cross-lane sweep. The producer `2**60` discrepancy remains reproduced. Storage uint64 encoding remains uncapped; physical floats/signed zero are unchanged. No lane-local number cap or serializer is added.
- **SWEEP-12:** `scripts/pm-filemanager-event-contracts.py:80–84`, own payload `properties.ts` and companion timestamps. The interpreter's date-time capability remains unresolved; the shared sweep must enforce the owner's grammar and supported authenticated history. The repeated 144-outcome format diagnostic still accepts 108 malformed timestamps; no date-time PASS is claimed.
- **Index/currentness:** final top-level index validation is **fail / exit 1**, explicitly retained in `index-after.json`. The three configured JSON source groups (event_record.schema, storage_value_registry.schema and storage_value_registry) were regenerated and committed; all other document shards remain unchanged. A fresh extraction reproduces all 3,302 committed shard files exactly. Timestamp/currentness-dependent index differences are recorded in `derived-results.json`; they are not hidden or committed as a reseal. The earlier ledger/DL-302 and aggregate registry/profile integration notes remain separate from this lane's passing family gates. No all-green governance or landing claim is made.

## Scope, resources, evidence and IDs

F-150–F-161, SP-560, CV-560 and ATS-280 remain the owners. Canonical Markdown, Decision Log, event registry, Spec Lock and governance artifacts are unchanged. No new binding, owner decision, admission, retention/deletion answer or PlanUnit is authored. Existing source/premise support is not extended to settle event-history retention. All twelve base payloads and traces are byte-identical to the incoming head. Shared companion edits are only the documented schema factoring and the two matching embedded definitions.

Initial preflight passed (**89 GB disk / 13 GiB available RAM**). Resource-floor stops are retained but never counted as completed runs; affected audits restart from complete family baselines once capacity recovers. All authoritative jobs are serial. Completed jobs are reused only at identical consumed family rows, fixture header/family set, checker/schema and Storage-registry fingerprints; the two move refusal-label repairs invalidate their own family jobs. The original whole-input fingerprints and exact reuse proof remain pinned. No worker, pm-mail, admission, registry append, Decision Log, main push, browser or server is used. The temporary extraction and sparse worktree are removed after publication.

**IDs used:** F-150–F-161, SP-560, CV-560, ATS-280. **New PlanUnit IDs: none.** The compact table enumerates all 371 new `round7:*` case IDs. The previous resource-stopped report is superseded by this completed assessment.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix7/evidence-manifest.json`, SHA-256 `fd750760035f892d1ccfbbd2356904e644921238826a6790135289adefe88fff`. It pins the completed results, resource diagnostics and reproduction helpers by absolute path and SHA-256. Report, self-grade and compact table are copied to `fix7/` and the DFM drafts root.
