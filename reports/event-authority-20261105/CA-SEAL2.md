# CA-SEAL2 — fourth recorded seal-check input change

**ROUND 3 (ASTRA) FIXES IMPLEMENTED; RE-REVIEW PENDING.** Worker CA-SEAL2-FIX3 (Codex), stream E, VM, 2026-11-05. Branch `plans/ea-seal-check-recount-20261105`, round-3 fixes from Astra-reviewed head `e9d34a4dcc2bdc3d5369952dee2e7fd9b4d85112`, on CA-SEAL FIX8 `17c842445a2623bb0334ba8d6932e7a6bf088967`. Earlier fixes remain `616c1a7a275153f1850010976a1b3f1c884ecafa` (round 2) and `60913cb906590662c97696146edcb10960c2ed09` (round 1). This file is both the change record and branch report. The round-3 section records findings, commits and fresh evidence; `fix3/DELIVERY.json` records the final documentation head, push and cleanup. Coordinated landing and independent review remain required.

## Design in five lines

1. **Combined approval:** one run requires the unchanged August computation and complete outcomes for every one of the 249 frozen recount names; single-snapshot results are diagnostic only.
2. **Recount custody:** strictly byte-pin/parse the original receipt/list and recompute all 597 original source fingerprints and byte counts at their own frozen revisions or exact saved locations.
3. **Separate snapshots:** every receipt identifies both snapshots by their own receipt and fingerprints; no August pin is substituted for recount membership.
4. **Fourth receipt:** pin the validator before/after, DL-451, prior unchanged third receipt, frozen recount receipt/list, author and actual lander through its own exact Spec Lock byte anchor.
5. **Unchanged conditions:** retain per-name decisions, full admission records, twelve-cell depth, unresolved-card blocking and all August gates; stop on any demonstrated canon-drift impossibility without re-stamping.

## Ruling recorded with its actual attribution

The lane's final “Ruling on the stopped question” (2026-11-05 05:00Z, mail `1105050013-eb00`) is **pm7-build's reading of 9.b, not Jared's words**. Final approval requires one combined run; a single-snapshot result cannot supply final approval. This resolves the exact earlier question preserved in the design. Jared's verbatim answer remains “i approve all of it” to the presented deck, SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`. No new card or owner answer is invented. DL-451's dependency section pin is `34d27e732c56b5a2d33204f22f4131eb54bd6e7a7f79c762a46ceee46ed78e74`.

## Change record

**Validator before SHA-256:** `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`. **After SHA-256:** `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. Round-1 reviewed-before SHA-256: `de9d85130aafed77f87bc365d94218db3992691a7e95285739b2c7c802e24321`. CRLF is preserved. The new receipt is `reports/event-authority-20261105/seal-check-recount-receipt.json`; the audit spec gains only its DL-451 section. The amendment edits no earlier receipt or record. August's historical receipt is identified at fixed Git revision `17c842445a2623bb0334ba8d6932e7a6bf088967` by its original SHA-256 `9c75a19775c29ef64cd49084543e11a1a706fcda376b2b176a905928b6fae38e`. The inherited working-tree receipt path remains runtime output; it is never the historical location without its revision. Recount history is independently qualified by revision `c53e4199ae94ca853a197354f3f9e7f296cf1efc`; its current input byte hash is observed separately. No historical bytes are moved or re-stamped.

The new input reader verifies the exact reviewed `RECEIPT.json` (`1d0ef48f472f2a6c521c6879e4c0b6ab0da98467dfe5b1a7546b3dbcef09a709`) and 249-name `NEW-LIST.json` (`2515ae5af31178a7d7a93581e982977bfb803d4494d779c72bebad9e7700376c`). Relative source inputs are read from Git at `16acf7594a3fe8559af89491b895f440b314b99e`; explicit Git lineage inputs retain their own full revision. Absolute and ignored historical evidence may use an explicit strict location map, but every mapped byte still must match the original source fingerprint and length. The map and resolved locations are pinned in the diagnostic result. Nothing trusts a copied pass flag.

The new audit-side `recount/OUTCOMES.json` reader preserves the existing close path. Each exact name has its own registered, excluded or decision-card outcome. Registration reuses the unchanged complete DL-077/DL-412 admission judgment. Exclusion uses `RECLASSIFY_TO_EXCLUDED`, its own pinned decision naming the exact name, rationale and individually hashed Plans citation spans. Complete saved cards remain unresolved and block final approval. This worker writes no real outcome record. Mechanical pins/name coverage do not replace independent semantic review of decisions and exclusions, just as the old admission predicate does not adjudicate its cited section's meaning.

Only the executable-byte observation traverses the new anchored fourth link; the old DL-412 anchor and independent semantic predicate remain. The entire original August main computation prefix is AST-identical. All original functions except `multi_family_receipt_state`, `post_august_validator_pin`, `main` and `build_receipt` are AST-identical; the first two change only the executable-byte observer. New JSON parsing rejects duplicate keys, non-finite and overflow numbers, BOM, trailing data, wrong roots and selected types. Selected counts/spans require exact integer types. No new number caps, serializers or runtime product contract are introduced.

## Source custody: 597/597 verified, without a re-stamp

The direct initial check found 580 matching inputs, two changed external briefs and 15 ignored currentness files absent from Git. Exact saved editions supplied the 15 files. The original BRIEF-DRAFT prefix and FIX-ROUND text before later additions were recovered and accepted only when complete SHA-256 **and** original byte count matched the receipt: BRIEF-DRAFT `18751f47f1daa8f922fe97655528389f72be7d926e8713ad1baa90551dbe0b03`, 11,421 bytes; FIX-ROUND `4298583e2a69a3a6f6950ff94900b1a4d62b9e35bd151d55df227a27dda032e4`, 8,538 bytes. No original file was edited.

All 15 ignored files and all 11 absolute evidence inputs are preserved as exact bytes in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/recovered-source-bytes/`. `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/source-locations.json` is the explicit 26-entry map used by the actual new reader's positive. The remaining 571 inputs retain Git custody. All 597 fingerprints verify. These are saved original sources, not regenerated outputs or a newer edition relabeled as history.

## Tests and limits — round 1

| Check | Exit / result |
|---|---|
| Repaired external `fix1/CA-SEAL2-checks.py` | **0; 99/99 pass**, including 73 negative product calls. All 597 actual frozen sources verify. |
| Consecutive default-path actual entrypoints | **0 for the witness; actual validator exits 1/1**. Two CLIs, four historical receipt resolutions; August and recount revision/path/hash identities match intended original bytes after each write. |
| Original August differential | **0 for the witness**. Old/new exits 1/1; original ten failures, order, named checks, input pins and original main computation prefix remain unchanged. New result has twelve failures, including two pending recount failures. |
| Guard removal and restoration | **0; 27 variants × 99 checks = 2,673 cells**. Exact expected acceptance sets, unchanged rejection reasons for every other negative, then **99/99 pass restored**. |
| Shard check | **0; pass**, 99 sources / 3,092 shards. |
| Index validation | **1; top-level fail**, exactly the review's same 23 failure records: 21 ledger record-shape errors, missing newer-main `DL-302`, stale untouched readiness artifact. Byte-equal failure array; zero introduced. |
| Protected-byte audit | **0; pass**, 1,463 protected files byte-identical, receipt after-pin correct, CRLF preserved. Only the frozen validator and its DL-451 spec section change under Plans. |
| Currentness copy | `cp -a` returned 1 for unsupported permission preservation; metadata-free retry returned 0, and all 15 copied files compare byte-for-byte. No copy failure is counted as a passing command. |
| Review evidence audit | **0; pass**, all 31 retained review file hashes verified and all JSON evidence fully decoded. |
| Whitespace | **0**, `git -c core.whitespace=cr-at-eol diff --check`. |
| Full approval / governance / landing | Not performed. The unfinished preparation stack earns no final approval. |

The reviewed 68-check suite and `resume/` results remain historical evidence. The repaired harness is `fix1/CA-SEAL2-checks.py`; no prior harness, historical result, August receipt, source fingerprint or freeze is overwritten by the fix. The repository's compact round-1 bundle is `reports/event-authority-20261105/CA-SEAL2-fix1-results.json`. No test file under `tests/` is added or edited.

Reproduce the repaired corpus with:

```bash
python3 -B /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix1/CA-SEAL2-checks.py --repo <fresh-branch-checkout> --source-map /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/source-locations.json --out <external-result.json>
```

The finite `fix1/guard_removal.py` and `fix1/default_entrypoint.py` use the named disposable fix-worktree path. They run one checker at a time and remove their external runtime trees automatically. The complete shared-tool predicate/site inventory remains **S1, a cross-lane sweep item**; this round proves the specific R02–R04 guards below and claims no complete replacement proof engine.

## Review round 1: findings and responses

Review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW.md`. **R01–R04 fixed in `60913cb906590662c97696146edcb10960c2ed09`; none disputed and no owner choice needed.** `V` below is the frozen validator path; `H` is the complete external `fix1/CA-SEAL2-checks.py` path given above.

| Finding | Where / cause | Fix and verification |
|---|---|---|
| **R01 — historical receipt identity** | `V:802–806,1078–1092`; runtime output was misused as August history. | Fixed immutable revision/path/original-hash triples for both receipts. Current recount observations are separate. `fix1/default_entrypoint.py` invokes the actual CLI twice with the unchanged default output and resolves each snapshot from Git after every write. Spec paragraph 265 and this preservation claim now distinguish runtime output from saved history. |
| **R02 — own event token** | `V:1039`; substring membership accepted longer identifiers. | Same `[A-Za-z0-9_.]` boundaries as the decision-section check. `H:252` adds prefix, suffix and dotted-sibling negatives with refreshed observational citation digests. Removing only this source-token predicate makes exactly these three accept. Independent semantic exclusion review stays required. |
| **R03 — three masking fixtures** | `H:113–114,194–199,282–285`; stale map key, both anchors removed, and control-plus-parent path. | Reconcile map keys with the altered receipt; retain the third anchor and call the product directly; use `Plans/x\n/y`. Only each intended predicate's removal makes its negative accept. The final missing-anchor cut removes only fourth-entry absence; duplicate, hash and third-anchor checks stay enabled. |
| **R04 — missing integrity coverage** | `H:116–121,133,160–178`; missing complete-byte, length, executable-pin and receipt-field negatives. | Add same-size receipt whitespace mutation; coherent source byte-count mismatch; correctly anchored wrong before/after pins; schema/authority, prior/recount receipt/list pins and all authority flags. Each named predicate is cut independently; nested pin cuts preserve path, key-set and type checks. Before/after duplicates are proved at each site and at both sites. |
| **N01 — landing contract** | Preparation receipt still has a null lander; final anchors are pending. | Preserved the CA-SEAL-first same-landing order, actual lander writers, separate third/fourth final-byte anchors, fixture companion, before/after reviews and landing checks. CA-SEAL2-FIX1 joins the procedural seal-applier exclusion. |

### Guard-removal table

Every row replays all 99 checks. The last column counts other negative calls that still reject with their **unchanged baseline reason**; all other positives also pass. A zero-flip single-site row is valid only for the named same-field duplicate, whose other site still rejects. `negative_change_validator_*` called through `recount_change_state` gives **[reject, reject, reject, accept]** for [no cut, direct-only cut, bridge-only cut, both cuts], separately for before and after.

| Guard / site removed | Negatives that start accepting | Other negatives still reject |
|---|---|---:|
| `R02_exact_source_event_token` | `negative_exclusion_dotted_sibling`, `negative_exclusion_prefix`, `negative_exclusion_suffix` | 70 |
| `R03_fourth_anchor_only` | `negative_missing_fourth_anchor` | 72 |
| `R03_source_member_count_only` | `negative_missing_source_member` | 72 |
| `R03_path_control_only` | `negative_unsafe_source_path_control` | 72 |
| `R04_receipt_complete_byte_pin` | `negative_one_changed_receipt_byte` | 72 |
| `R04_source_byte_count_only` | `negative_wrong_source_byte_count` | 72 |
| `R04_validator_before_sha256_direct_only` | None; same-field bridge still rejects | 73 |
| `R04_validator_before_sha256_bridge_only` | `legacy_predicate_preserved_under_validator_before_sha256` | 72 |
| `R04_validator_before_sha256_both_same_predicate_sites` | `legacy_predicate_preserved_under_validator_before_sha256`, `negative_change_validator_before_sha256` | 71 |
| `R04_validator_after_sha256_direct_only` | None; same-field bridge still rejects | 73 |
| `R04_validator_after_sha256_bridge_only` | `legacy_predicate_preserved_under_validator_after_sha256` | 72 |
| `R04_validator_after_sha256_both_same_predicate_sites` | `legacy_predicate_preserved_under_validator_after_sha256`, `negative_change_validator_after_sha256` | 71 |
| `R04_schema_id_value_only` | `negative_change_schema_id` | 72 |
| `R04_authority_ref_value_only` | `negative_change_authority_ref` | 72 |
| `R04_authority_section_sha256_value_only` | `negative_change_authority_section_sha256` | 72 |
| `R04_validator_path_value_only` | `negative_change_validator_path` | 72 |
| `R04_validator_id_value_only` | `negative_change_validator_id` | 72 |
| `R04_prior_receipt_value_only` | `negative_change_prior_receipt` | 72 |
| `R04_recount_receipt_value_only` | `negative_change_recount_receipt` | 72 |
| `R04_recount_list_value_only` | `negative_change_recount_list` | 72 |
| `R04_certification_scope_value_only` | `negative_change_certification_scope` | 72 |
| `R04_author_task_value_only` | `negative_change_author_task` | 72 |
| `R04_seal_authorized_only` | `negative_change_seal_authorized` | 72 |
| `R04_admission_authorized_only` | `negative_change_admission_authorized` | 72 |
| `R04_definition_writing_authorized_only` | `negative_change_definition_writing_authorized` | 72 |
| `R04_app_recording_authorized_only` | `negative_change_app_recording_authorized` | 72 |
| `R04_contract_depth_complete_only` | `negative_change_contract_depth_complete` | 72 |

The initial broad fourth-anchor exploratory cut was refined to only the missing fourth-entry predicate before the final table was accepted. Its duplicate-entry negative now remains rejected. The final `guard-removal-results.json` contains the refined row and checks exact refusal equality across every retained negative. No whole receipt-field group or unrelated predicate is disabled to claim a duplicate.

### Recurring defect classes and grades

Digest/source recomputation, contradictory joined snapshots, historical/current identity separation, strict JSON representations and types, complete-byte length, custody before outcomes, and masked negatives are exercised. Storage-assigned runtime metadata, payload externalization and schema `$ref`/format resolution are outside this input-reader change; none is introduced. Shared number-domain work and the full shared guard-isolation inventory remain sweep scope. No family grade is inferred from checker coverage.

**Family grades before → after: N/A → N/A.** No family, admission, new binding or PlanUnit ID is authored. Existing DL-451 is referenced; DL-998 remains fixture-only inside disposable trees. The four blocking review cells are self-assessed repaired and await independent re-review, not final approval.

## Landing order and exact receipt anchor

First land the answered-card authority/test allowances and frozen recount dependencies as required by stream E. Re-read the DL-451 section and frozen input bytes on the assembled tree. Preserve the two snapshots and every earlier record.

The lead's binding instruction, copied exactly from `state/INTEGRATION-NOTES.md`:

> CA-SEAL/CA-SEAL2 landing order (Astra N01, binding): (1) finalize CA-SEAL's receipt with the actual lander against the third validator 319f6bff; (2) apply CA-SEAL2's code; (3) finalize the fourth receipt against the fourth validator and the finalized third receipt; (4) claude-projects-refresh adds both exact Spec Lock entries; all in one reviewed landing. Running both writers on an assembled fourth-validator tree re-stamps the third receipt and must not happen.

At stage (3), the actual lander runs `python3 -I -B reports/event-authority-20261105/write_recount_receipt.py <landing-tree> --lander <actual-lander-task>`. This writes only the new fourth receipt and pins the finalized third receipt and fourth executable. The pending fourth receipt's null lander and pending digest are not final anchors. The separately required third entry is `reports/event-authority-20261104/seal-check-multifamily-step-receipt.json`; it hashes that receipt's complete finalized bytes. This worker does not run either writer on the real tree or edit Spec Lock.

Apply the named fixture companion in its authorized integration step and perform independent Sol/Astra reviews before and after, plus the prescribed landing checks. The unanchored preparation tree must not be merged alone. Real outcome/depth work and every existing approval condition remain required before final approval.

Exact **new fourth-receipt** entry template:

```json
{
  "path": "reports/event-authority-20261105/seal-check-recount-receipt.json",
  "sha256": "<SHA-256 of complete final receipt after actual lander and prior-receipt pins are filled>"
}
```

The existing DL-412 entry/template remains separately required exactly as CA-SEAL specifies; there is no new DL-077 entry. Later changes to the new receipt require its authorized byte anchor to follow the final bytes.

**Seal-applier exclusion:** the author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through FIX8, CA-SEAL2 (Codex), CA-SEAL2-FIX1 (Codex), CA-SEAL2-FIX2 (Codex), CA-SEAL2-FIX3 (Codex), and every other fix worker are barred. The checked new receipt list contains author and actual lander; broader exclusions stay procedural.

**CA2-A02 — lead adjudication (07:35Z):** separation follows CA-SEAL's approved B′ model (pm7-build 01:27Z). The receipt records the author and actual lander. Both, the stream lead and every fix worker are barred from **applying the seal**. The lander is not required to differ from the author. The lead explicitly adjudicated Astra's stronger lander-separation criterion as beyond the approved model; this is the lead's adjudication, not a new Jared answer. In practice the actual lander is the stream lead's landing step, and a separate assignee applies the seal. No frozen-code or receipt change is made for A02.

## Scope, resources and open items

No admission, registry change, real outcome record, August list/fingerprint/freeze edit, earlier receipt/record edit, Decision Log edit, Spec Lock edit, `.evidence` edit, auto-decision edit, `.gitignore` edit, seal, main push, mailbox action or subagent occurred. No PlanUnit IDs, families or product bindings were minted. The audit specification is outside the configured 99 indexed/sharded owner sources; no indexed owner document or generated artifact was edited or regenerated.

Round-1 resources: 112 GB free disk and 9 GB available RAM before sparse worktree creation. Recorded guard-run available memory reached 6 GB, never below 6; no pause was triggered. Later disk/RAM samples were 111 GB / 11 GB. All executing checkers in this fix ran sequentially. No mailbox action, subagent, browser, server, main push, admission or seal occurred. The worktree is removed with the requested literal-path forced removal only after final push and evidence export.

**Stopped question: none.** The earlier certification-scope question is resolved by the supplied ruling. No observed August failure demonstrates an impossible predicate caused by canon moving since August. Its current failures remain visible, not waived. The actual outcomes, legacy unfinished prerequisites, coordinated landing assembly, independent reviews, shared guard-isolation sweep and the 23 index findings remain open integration work. This report awards no final approval.

## Retained evidence — round 1

All references below are full paths under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix1/` plus SHA-256. Historical `resume/` evidence remains available unchanged. `SHA256SUMS` inventories the complete retained round-1 package.

| File | SHA-256 |
|---|---|
| `CA-SEAL2-checks.py` | `79a0a6bdd9c912f55e44f209e67fac622e990b19e9e385200c18ab18c925b099` |
| `guard_removal.py` | `c5c82a640ff455c13a95f2d971fef6da2c8113bcb249c861af9bf8e5f0594dc4` |
| `default_entrypoint.py` | `a2c5607dd161cfe9c34005c1fd3a1722f4c0a5aec7814aa3ccbdf91c80efaa08` |
| `check-results.json` | `f0d16eb6f8010f32bc035441d47a6f767eb0f2d28d10b96efde467828c202570` |
| `restored-check-results.json` | `f0d16eb6f8010f32bc035441d47a6f767eb0f2d28d10b96efde467828c202570` |
| `guard-removal-results.json` | `1b357bae4a7f78a30428d635d51197a2fb0191045c2a83b6ab1665737a45c2b7` |
| `snapshot-default-path-results.json` | `44677bac3cc0d460c24f286b79bba9b4f9ac1cb934ef35722227810bd382c5e3` |
| `legacy-differential.json` | `6011ce7fd7b5215bfbf46e17a15282335fa1798212dff95f8b8c83a7eac8c8e2` |
| `scope-and-pins.json` | `42eeff3461f2c83674bd843694d0328b70bbdec92460f7e03bdf14052723f2e5` |
| `index-comparison.json` | `54dc3fb8864cf0d934215373391be0d166194deb85b3e6a2871daff50f5b0613` |
| `currentness-copy.json` | `a41214c87f05c437202a163475beac4a79847ea18f880707b79f25d7981ca9b7` |
| `review-evidence-audit.json` | `71ad4ff393d4a4e227b35457b641b259a109bc0df41e2dab07acab2af6e55f8f` |

## Review round 2: findings and responses

Review read in full: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW-cycle2.md`, including its independent one-defect controls. All 90 retained evidence manifest entries from both review editions match their SHA-256; all JSON evidence decodes completely. **CA2-C2-01, CA2-C2-02 and CA2-C2-03 are fixed in `616c1a7a275153f1850010976a1b3f1c884ecafa`; none is disputed or stopped for an owner choice.**

The committed corpus is now `reports/event-authority-20261105/CA-SEAL2-checks.py`: the unchanged 99 round-1 checks plus exactly three negatives. Every new case first calls `recount_change_state()` successfully on the same valid complete parent, then introduces one semantic defect. Each negative calls the actual product helper, with no observer assertion standing in for a refusal. The original external `fix1/` corpus and results remain historical evidence.

| Finding | Where / cause | Fix and verification |
|---|---|---|
| **CA2-C2-01 — anchor hash** | Validator `recount_anchor`: equality at line 853 had no negative. | Corpus line 227 changes only the fourth anchor's digest to canonical `"0" * 64`. Receipt, code, third anchor, digest representation and all executable pins remain valid. Removing only that equality makes `negative_wrong_fourth_anchor_digest` accept; all 101 peer results, including 75 other refusals, remain identical. |
| **CA2-C2-02 — nonblank lander** | Validator line 895: the null/type case did not exercise `not lander.strip()`. | Corpus line 217 changes the valid lander to one space, synchronizes its required exclusion-list observation and refreshes the whole-receipt anchor. Only the nonblank predicate is cut; exact string type, list equality and all byte links stay enabled. Exactly `negative_blank_lander` accepts; all 101 peers retain their results/reasons. The original null/type negative remains. |
| **CA2-C2-03 — checked exclusions** | Validator line 896: no independent exclusion-list defect. | Corpus line 220 removes only the valid actual lander from the list. Author, actual lander, all flags/pins and the valid third anchor stay fixed; the whole-receipt anchor follows the changed bytes. Only the list equality is cut. Exactly `negative_missing_lander_from_seal_applier_list` accepts; all 101 peers retain their results/reasons. |

**Validator SHA-256 unchanged:** `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. Every named guard is reachable, so no product behavior, executable bytes, spec or receipt is changed. The existing receipt after-pin still matches. Relative to the round-2 reviewed head, no `Plans/` path changes; all 1,467 protected files, including all August history, both change receipts, Spec Lock, evidence locks and registry, are byte-identical. The original before-pin remains `319f6bffddb07a36e633fd949146e4ce9149819ea5e817b13897a74314163a91`. The final-anchor template and combined-run scope ruling above remain unchanged, with pm7-build's attribution preserved.

### Round-2 tests and limits

| Check | Exit / result |
|---|---|
| Expanded committed corpus | **0; 102/102 pass**, including 76 negative product calls. All 597 actual frozen source fingerprints/lengths verify. All original 99 results and refusal strings are identical to round 1. |
| Guard removal and restoration | **0; 30 variants × 102 checks = 3,060 cells**. All 27 earlier rows plus the three new narrow cuts pass their exact acceptance-set and peer-result assertions. Fresh restored corpus **102/102 pass**. |
| Consecutive default-path CLI witness | **0 for witness; actual base/new/new exits 1/1/1**. Four historical receipt identities resolve from Git after the two writes. The ten original August failures, checks, pins and computation prefix remain; two pending recount failures stay visible. |
| Shard check | **0; pass**, 99 sources / 3,092 shards. |
| Index validation | **1; top-level fail**. Exactly the review's same 23 failure records, compared as full arrays: 21 ledger record-shape failures, missing newer-main DL-302, stale untouched readiness. Zero introduced. |
| Evidence / protected-byte audit | **0; pass**. 90 review evidence entries verified; 1,467 protected files identical; receipt after-pin and CRLF correct. |
| Currentness edition | 15 files copied without metadata operations and compared byte-for-byte. They remain distinct from the saved recount source editions. |
| Whitespace | **0**, staged corpus `git -c core.whitespace=cr-at-eol diff --cached --check`; final report/result diff checked before push. |
| Full approval / governance / landing | Not performed; preparation still earns no final approval. |

### Round-2 guard-removal table

Every row replays all 102 checks. The last column counts peer negatives that retain their exact baseline refusal; all peer positives retain their full baseline results too. Zero-flip direct-only rows retain their named same-field bridge duplicate. For each before/after pin separately, the actual product results remain **[reject, reject, reject, accept]** for [baseline, direct-only cut, bridge-only cut, both same-field cuts].

| Guard / site removed | Negatives that start accepting | Other negatives still reject |
|---|---|---:|
| `R02_exact_source_event_token` | `negative_exclusion_dotted_sibling`, `negative_exclusion_prefix`, `negative_exclusion_suffix` | 73 |
| `R03_fourth_anchor_only` | `negative_missing_fourth_anchor` | 75 |
| `R03_source_member_count_only` | `negative_missing_source_member` | 75 |
| `R03_path_control_only` | `negative_unsafe_source_path_control` | 75 |
| `R04_receipt_complete_byte_pin` | `negative_one_changed_receipt_byte` | 75 |
| `R04_source_byte_count_only` | `negative_wrong_source_byte_count` | 75 |
| `R04_validator_before_sha256_direct_only` | None; same-field bridge still rejects | 76 |
| `R04_validator_before_sha256_bridge_only` | `legacy_predicate_preserved_under_validator_before_sha256` | 75 |
| `R04_validator_before_sha256_both_same_predicate_sites` | `legacy_predicate_preserved_under_validator_before_sha256`, `negative_change_validator_before_sha256` | 74 |
| `R04_validator_after_sha256_direct_only` | None; same-field bridge still rejects | 76 |
| `R04_validator_after_sha256_bridge_only` | `legacy_predicate_preserved_under_validator_after_sha256` | 75 |
| `R04_validator_after_sha256_both_same_predicate_sites` | `legacy_predicate_preserved_under_validator_after_sha256`, `negative_change_validator_after_sha256` | 74 |
| `R04_schema_id_value_only` | `negative_change_schema_id` | 75 |
| `R04_authority_ref_value_only` | `negative_change_authority_ref` | 75 |
| `R04_authority_section_sha256_value_only` | `negative_change_authority_section_sha256` | 75 |
| `R04_validator_path_value_only` | `negative_change_validator_path` | 75 |
| `R04_validator_id_value_only` | `negative_change_validator_id` | 75 |
| `R04_prior_receipt_value_only` | `negative_change_prior_receipt` | 75 |
| `R04_recount_receipt_value_only` | `negative_change_recount_receipt` | 75 |
| `R04_recount_list_value_only` | `negative_change_recount_list` | 75 |
| `R04_certification_scope_value_only` | `negative_change_certification_scope` | 75 |
| `R04_author_task_value_only` | `negative_change_author_task` | 75 |
| `R04_seal_authorized_only` | `negative_change_seal_authorized` | 75 |
| `R04_admission_authorized_only` | `negative_change_admission_authorized` | 75 |
| `R04_definition_writing_authorized_only` | `negative_change_definition_writing_authorized` | 75 |
| `R04_app_recording_authorized_only` | `negative_change_app_recording_authorized` | 75 |
| `R04_contract_depth_complete_only` | `negative_change_contract_depth_complete` | 75 |
| `CA2-C2-01_fourth_anchor_digest` | `negative_wrong_fourth_anchor_digest` | 75 |
| `CA2-C2-02_nonblank_lander` | `negative_blank_lander` | 75 |
| `CA2-C2-03_seal_applier_list` | `negative_missing_lander_from_seal_applier_list` | 75 |

The finite round-1 runner is reused with the three additional predicate cuts and current paths. No executable file is rewritten; AST substitutions are local to disposable imported modules, leaving complete-byte observations real. All cuts are restored by loading a fresh module for the final corpus. The full shared-tool inventory/adoption remains **S1, separate sweep scope**; this table does not claim a replacement generic proof engine.

### Round-2 recurring defect classes and grades

The added mutations directly cover a forged complete-byte observation, blank identity with coherent dependent observations, and an incomplete custody/exclusion list. The rerun also exercises source recomputation, contradictory snapshots, historical/current separation, exact JSON representations/types, lengths, custody and the earlier masking repairs. No runtime metadata, payload externalization, schema-reference/format contract, new number cap or serializer is introduced; number-domain and shared-tool adoption remain sweep scope. No new product behavior or permission is authored.

**Family grades before → after: N/A → N/A.** No families, admissions, bindings or PlanUnit/Decision IDs are authored. Fixture-only DL-998 remains inside disposable trees. The three named finding cells are self-assessed repaired with direct guard-isolation proof, pending independent re-review. The broader author/actual-lander/lead/all-fix-worker procedural seal exclusion includes **CA-SEAL2-FIX2** in addition to the checked author/lander list.

Round-2 resources: 107 GB free disk and 9 GB available RAM before sparse-worktree creation. Recorded guard-row available memory never fell below 12 GB; no resource stop was triggered. A later sample was 116 GB / 10 GB. All checkers ran one at a time. No mailbox, subagent, admission, registry edit, August re-stamp, Spec Lock/evidence/auto-decision edit, seal or main push occurred. No owner or generated Plans file changed, so regeneration was unnecessary. Runtime trees self-delete; final literal-path forced worktree removal follows the final branch push and evidence export. `fix2/DELIVERY.json` records that result.

**Stopped question: none.** Coordinated stack assembly, actual landers/anchors, real outcomes/depth, unchanged August prerequisites, independent review, the index findings and S1 remain integration work, without any waiver or final approval.

### Retained evidence — round 2

All full paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix2/`. The compact committed bundle is `reports/event-authority-20261105/CA-SEAL2-fix2-results.json`. `README.md` gives replay commands; `SHA256SUMS` inventories the retained package after delivery/cleanup. Older evidence is preserved unchanged.

| File | SHA-256 |
|---|---|
| `CA-SEAL2-checks.py` | `bb2d3f260af6d32d161c40adaa832c7a490c5c3734257758ff62bde49c6ab694` |
| `guard_removal.py` | `abc0d475815dc5eb8562d8080f02d21d4aa89673a2c1892e600e9c3cf1fa06cb` |
| `default_entrypoint.py` | `eb8c54eb02dac6f76bbd419f7935d1491fc4a32bf9a13b5e752d17e15f6e8c47` |
| `audit_evidence.py` | `b078d02196e47136db4297238478ed3d607f6070e3f1971e06089a336f945d6b` |
| `check-results.json` | `35d82c450d6c6503a2be16abda0bb1117d3a07dc7459e1e1cf6c0cdd2093cd67` |
| `restored-check-results.json` | `35d82c450d6c6503a2be16abda0bb1117d3a07dc7459e1e1cf6c0cdd2093cd67` |
| `guard-removal-results.json` | `62c9cd35aeb81b0805b5ec5b3f8feb8e192077de32f920f68b5a7a97a9cb798f` |
| `snapshot-default-path-results.json` | `6b680e7436c9ae80343a9d2e356089ddfc04cc07f61fb845542488c8db68fe75` |
| `legacy-differential.json` | `f4afcf78f2175320e398c63cd6c85a694eb69ef475bbb6bcf809ccf949a6d2e8` |
| `scope-and-pins.json` | `03a137e621c76d8596101a1055ed786faf02d64912e51977f637846a78921f02` |
| `original-corpus-comparison.json` | `eb2e5f1214f86f235bdcb3a6474241ff934dd36e02392df8c8a2bbb7f5401429` |
| `index-comparison.json` | `8842639a51c4c357875316b765364721ca952b33e435097298578c2ff7c3eb7e` |
| `currentness-copy.json` | `daf80cdc1395935c791eed463d54ff4d0405f90ce97f39f12e10fbb0a547f8ac` |
| `review-evidence-audit.json` | `2a9e22ee209a99755f70bb8d0d555b22794ed02cbc6fda8ca5dd3e43711b0d09` |
| `shard-check.json` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `index-validate.json` | `debc4588403411f5b023c704b846e9c155722a191b414d3a339fcdf4044aea13` |
| `commands.json` | `0b29503bb1697a4ea3dc7685a0d503801c484d8483b89d76d6714a04eb7331b2` |
| `CA-SEAL2-fix2-results.json` | `3671027326f31f8ea870649dbd43f60da456e03b826ac201077678a4773b2f37` |

## Review round 3 (Astra): findings and responses

Review read in full: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW-astra.md`, with its `astra/` evidence (the review's `E` alias). All 38 retained manifest entries verify; JSON evidence decodes completely. The two lead notes are preserved exactly in `fix3/lead-adjudications.txt`. **CA2-A01 is fixed in `4e3b2a1db0f8e234189223082ef6859bb21f1ab0`. CA2-A02 is explicitly adjudicated by the lead; CA2-N01 is recorded verbatim in the landing-order section above.** No finding is silently skipped and no owner question is invented.

| Finding | Where / cause | Response and verification |
|---|---|---|
| **CA2-A01 — eight missing negatives** | `recount_outcomes`, validator lines 994–1032; the 102-case corpus never exercised eight independent refusals. | Add exactly eight negatives to the committed corpus, from passing complete 249-name parents. Each narrow guard cut makes exactly its own negative accept, while all 109 peer results and refusal strings stay identical. No guard is unreachable; validator behavior is unchanged. The eight exact sites/fixtures are listed below. |
| **CA2-A02 — separation scope** | Astra's additional lander-separation criterion exceeded the approved B′ model. | Record the lead's 07:35Z adjudication: author and actual lander are recorded; both, the lead and every fix worker are barred from applying the seal; lander need not differ from author. No code or receipt change. In practice the lead performs the landing step and a separate assignee applies the seal. |
| **CA2-N01 — executable stage in landing** | Running the third receipt writer on fourth-validator bytes would re-stamp the third receipt. | Copy the lead's binding four-stage order exactly above. Replayed Astra's fixture assembly accepts all three receipt-state helpers in that order; running both writers on a fourth-validator tree makes the fourth helper refuse. Both exact Spec Lock anchors remain for claude-projects-refresh in the single reviewed landing. |

`V` below is `Plans/.audits/event-authority-2026-08-12/independent-validator/pm_event_authority_independent_validator.py`; `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py` at implementation commit `4e3b2a1db0f8e234189223082ef6859bb21f1ab0`. Each parent calls the actual helper successfully before mutation. Admission sets are explicitly injected helper inputs, never new admission records or final approvals.

| Guard | Location | One defect in the new negative | Negative |
|---|---|---|---|
| **Outcome schema identity** | `V:994`, `H:246` | Only schema_id becomes wrong.schema. | `negative_outcome_schema_id` |
| **Outcome recount receipt fingerprint** | `V:995`, `H:247` | Only the receipt pin becomes canonical wrong 64-hex; list pin stays correct. | `negative_outcome_receipt_sha256` |
| **Registered row exact field set** | `V:1008`, `H:248` | Add one extra key to a valid registered row. | `negative_outcome_registered_extra_field` |
| **Excluded row exact field set** | `V:1011`, `H:290` | Add one extra key to a valid excluded row. | `negative_exclusion_extra_field` |
| **Exclusion disposition** | `V:1012`, `H:291` | Only disposition becomes KEEP_REGISTERED. | `negative_exclusion_disposition` |
| **Exact event token in decision section** | `V:1020`, `H:303` | Replace the decision token with its dotted sibling; synchronize the section digest; own-name source evidence stays valid. | `negative_exclusion_decision_dotted_sibling` |
| **Citation exact field set** | `V:1026`, `H:292` | Add one extra citation key; path, hash and span stay valid. | `negative_exclusion_citation_extra_field` |
| **Resolved evidence containment in Plans** | `V:1032`, `H:320` | Symlink the same relative evidence path to identical bytes outside Plans; all citation fields stay valid. | `negative_exclusion_evidence_symlink_outside_Plans` |

The decision mutation refreshes the section's observational digest and leaves own-name source evidence valid. The containment mutation preserves relative spelling, complete bytes, digest and span, changing only the symlink's resolved location. Both paths are restored before peer cases run. No second defect, stale copy or stale digest masks a target refusal. Every cut is an in-memory AST substitution at one asserted expression; the executable file is never rewritten.

### Round-3 tests and limits

| Check | Exit / result |
|---|---|
| Expanded committed corpus | **0; 110/110 pass**, with 26 positive/witness records and **84 negative product calls**. All 597 actual frozen source hashes and byte counts verify. All 102 parent results/refusals remain identical. |
| Guard removal / restoration | **0; 38 variants × 110 checks = 4,180 cells**. Rerun all 30 prior rows plus eight Astra rows. Each Astra row flips exactly one negative and preserves all 109 peer results, including 83 exact peer refusals. Fresh restored corpus **110/110 pass**, with its complete result array equal to baseline. |
| Default-path actual CLI / August differential | **0 for witness; actual base/new/new exits 1/1/1**. Ten August failures/order, original named checks, original input pins and original computation prefix remain. Two pending recount failures remain. Four historical receipt identities resolve after two default-path writes. |
| Astra extra input probes | **0; all 14 negatives reject** after the actual 597-source / 249-name positive; includes reordering/truncation/substitution and malformed or unknown source-map entries. |
| Staged two-receipt assembly | **0 for witness**. Correct third-executable → fourth-executable writer order accepts all three receipt-state helpers; the wrong order refuses the fourth receipt. Writers run only in disposable fixture trees. |
| Shard check | **0; top-level pass**, 99 source documents / 3,092 shards. |
| Index validation | **1; top-level fail**. Exactly Astra's **24 identical failure records**, compared as full arrays: 21 ledger record-shape failures, missing newer-main DL-302 and PLS-025, and stale untouched readiness. Zero introduced. |
| Evidence / protected bytes | **0; pass**. 1467 protected files byte-identical to Astra-reviewed head; no `Plans/` path changed; receipt after-pin matches unchanged validator; CRLF preserved. |
| Currentness edition | 15 files copied without metadata operations and hash-compared byte-for-byte. These are separate from the frozen recount's saved source editions. |
| Whitespace | Final corpus/report/result diff checked before commit/push. |
| Full governance / final approval / landing | Not performed. The preparation stack retains its prerequisites and earns no final approval. |

### Round-3 guard-removal table

Every row replays all 110 tests. All peer positives and negative refusal strings retain their complete baseline records. The last column counts peer negatives that stay rejected. For each before/after pin, direct and bridge sites enforce the same field/predicate: single-site and paired cuts remain separately proved. No unrelated predicates are merged. S1 full shared-tool inventory/adoption remains separate sweep work; this finite table is not a replacement generic proof engine.

| Guard / site removed | Negatives that accept | Other negatives still reject |
|---|---|---:|
| `R02_exact_source_event_token` | `negative_exclusion_dotted_sibling`, `negative_exclusion_prefix`, `negative_exclusion_suffix` | 81 |
| `R03_fourth_anchor_only` | `negative_missing_fourth_anchor` | 83 |
| `R03_source_member_count_only` | `negative_missing_source_member` | 83 |
| `R03_path_control_only` | `negative_unsafe_source_path_control` | 83 |
| `R04_receipt_complete_byte_pin` | `negative_one_changed_receipt_byte` | 83 |
| `R04_source_byte_count_only` | `negative_wrong_source_byte_count` | 83 |
| `R04_validator_before_sha256_direct_only` | None; named same-field bridge duplicate still rejects | 84 |
| `R04_validator_before_sha256_bridge_only` | `legacy_predicate_preserved_under_validator_before_sha256` | 83 |
| `R04_validator_before_sha256_both_same_predicate_sites` | `legacy_predicate_preserved_under_validator_before_sha256`, `negative_change_validator_before_sha256` | 82 |
| `R04_validator_after_sha256_direct_only` | None; named same-field bridge duplicate still rejects | 84 |
| `R04_validator_after_sha256_bridge_only` | `legacy_predicate_preserved_under_validator_after_sha256` | 83 |
| `R04_validator_after_sha256_both_same_predicate_sites` | `legacy_predicate_preserved_under_validator_after_sha256`, `negative_change_validator_after_sha256` | 82 |
| `R04_schema_id_value_only` | `negative_change_schema_id` | 83 |
| `R04_authority_ref_value_only` | `negative_change_authority_ref` | 83 |
| `R04_authority_section_sha256_value_only` | `negative_change_authority_section_sha256` | 83 |
| `R04_validator_path_value_only` | `negative_change_validator_path` | 83 |
| `R04_validator_id_value_only` | `negative_change_validator_id` | 83 |
| `R04_prior_receipt_value_only` | `negative_change_prior_receipt` | 83 |
| `R04_recount_receipt_value_only` | `negative_change_recount_receipt` | 83 |
| `R04_recount_list_value_only` | `negative_change_recount_list` | 83 |
| `R04_certification_scope_value_only` | `negative_change_certification_scope` | 83 |
| `R04_author_task_value_only` | `negative_change_author_task` | 83 |
| `R04_seal_authorized_only` | `negative_change_seal_authorized` | 83 |
| `R04_admission_authorized_only` | `negative_change_admission_authorized` | 83 |
| `R04_definition_writing_authorized_only` | `negative_change_definition_writing_authorized` | 83 |
| `R04_app_recording_authorized_only` | `negative_change_app_recording_authorized` | 83 |
| `R04_contract_depth_complete_only` | `negative_change_contract_depth_complete` | 83 |
| `CA2-C2-01_fourth_anchor_digest` | `negative_wrong_fourth_anchor_digest` | 83 |
| `CA2-C2-02_nonblank_lander` | `negative_blank_lander` | 83 |
| `CA2-C2-03_seal_applier_list` | `negative_missing_lander_from_seal_applier_list` | 83 |
| `CA2-A01_outcome_schema_identity` | `negative_outcome_schema_id` | 83 |
| `CA2-A01_outcome_receipt_fingerprint` | `negative_outcome_receipt_sha256` | 83 |
| `CA2-A01_registered_row_fields` | `negative_outcome_registered_extra_field` | 83 |
| `CA2-A01_excluded_row_fields` | `negative_exclusion_extra_field` | 83 |
| `CA2-A01_exclusion_disposition` | `negative_exclusion_disposition` | 83 |
| `CA2-A01_decision_exact_name` | `negative_exclusion_decision_dotted_sibling` | 83 |
| `CA2-A01_citation_fields` | `negative_exclusion_citation_extra_field` | 83 |
| `CA2-A01_Plans_realpath_containment` | `negative_exclusion_evidence_symlink_outside_Plans` | 83 |

### Round-3 recurring defect classes, grades and boundaries

The new cases probe mismatched identities/fingerprints, exact object shapes, contradictory disposition, exact token interpretation and custody through resolved paths. Existing cases retain source/hash recomputation, historical/current identity separation, strict JSON representations/types, complete-byte lengths and custody before outcomes. No runtime Storage metadata, payload externalization, schema-reference/format contract, number cap or serializer changes. Number-domain work and full shared-tool adoption remain sweep scope. The actual CLI failures are unchanged unfinished prerequisites, not evidence of a newly impossible August check; any demonstrated canon-drift impossibility still stops for pm7-build without a re-stamp.

**Family grades before → after: N/A → N/A.** No families, admissions, product bindings, PlanUnits or Decision Log IDs are authored. Existing DL-451 is referenced; DL-998 remains fixture-only. The eight A01 coverage cells move from unproved to self-assessed proved, pending independent re-review; A02 is lead-adjudicated and N01 is recorded. CA-SEAL2-FIX3 joins the procedural seal-applier exclusion above.

Round-3 resources: **110 GB free disk / 18 GB available RAM** before sparse-worktree creation. Guard-row available RAM ranged from **22 to 26 GB**; checkers ran one at a time and no resource stop was triggered. No canonical owner, validator, receipt or generated artifact changed, so regeneration was unnecessary. No admission, registry/real-outcome edit, August re-stamp, Spec Lock/evidence/auto-decision edit, seal, main push, mailbox or subagent occurred. Temporary fixture trees self-delete. Final forced worktree removal uses the literal requested path after push/export; `fix3/DELIVERY.json` records it.

**Stopped question: none.** Coordinated assembly, actual landers/final anchors, fixture companion, real per-name outcomes/depth, unchanged August prerequisites, independent before/after reviews, landing checks and S1 remain integration work. No final approval or scope extension is awarded.

### Retained evidence — round 3

All paths below are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix3/`; combine that absolute prefix with each filename. The compact committed bundle is `reports/event-authority-20261105/CA-SEAL2-fix3-results.json`. `README.md` gives replay commands; `SHA256SUMS` inventories the final package. Older evidence is unchanged.

| File | SHA-256 |
|---|---|
| `CA-SEAL2-checks.py` | `6a4e8b6d996ed945be5ec8c55ac4172941952ce6384c96496ab62a5637f2ddb3` |
| `guard_removal.py` | `31cc427c74f464ab6b93d23fa4aa42b81a91354b1cfd2c9beb9c313bf6120028` |
| `default_entrypoint.py` | `150394c7e80647ce3e2461bff3b9c81d8f58393cc27943aef9077bf4fb2a2e06` |
| `audit_evidence.py` | `eb3b04a28b260e7de549112b575174ff0812293b47cab96a7afa36f044038299` |
| `hostile_inputs.py` | `263e5919954a4d2ccf845240a2e9fc0759d1c58c8f582c8266b9852028114f53` |
| `stack_assembly.py` | `4d572335c750cc373220fc2ce43203cac5e6658fa782cddac8af64d9446a878d` |
| `setup.py` | `af93ff2dd76e93cbf5983e370e638fecdc35069798278564c3084a8a54000021` |
| `run_verification.py` | `c6f8f84dbadc5b1edc4172ec328d07fed314278fe512ecef60cce9337c08e377` |
| `lead-adjudications.txt` | `085e6d81c54396e45b1d930f8476f58b5b64088d09785f839aeefa38dcba2910` |
| `check-results.json` | `89f7f856ee10a5085fe7260d5fbeac774a8260efe8d261845e6ee7d447a3dde8` |
| `restored-check-results.json` | `89f7f856ee10a5085fe7260d5fbeac774a8260efe8d261845e6ee7d447a3dde8` |
| `guard-removal-results.json` | `72f0110bdc44d9288f9a9d10934726e237bb83203fe76a6e6ebd3614b972fee8` |
| `snapshot-default-path-results.json` | `c8c9d3e21ad3057b40059582e3127f7e7a4c73776947b51bb537316a29d788b4` |
| `legacy-differential.json` | `a22aed1a377a572cc467df150adaee5d7659b61f1bc79c92663a7f2e4e07a890` |
| `hostile-inputs.json` | `8b09273e90853e3dafc804c1d9b871e449cd6ff878ca506b8c365d7561e891c3` |
| `stack-assembly.json` | `e4f653318c0695625c38a47a62e266ddf5bbda0015e2c30244e3eba389219d9c` |
| `scope-and-pins.json` | `70d33e9a97b41c1c59267a111765afe4300dc66950365403b5d358854c86fa2f` |
| `original-corpus-comparison.json` | `2349c45b4c148ca0d73ac32a6c2e52dd0ff5bb8dacce0d3c5d74612fad7d59c4` |
| `index-comparison.json` | `82f162ca569c6f286a6494312ade8ef3cce598bd2b19ef53d72ef8993d8fb6c8` |
| `currentness-copy.json` | `acfee3f751d912494b37637df596eb16f4f11d6910ab46acf45f42cc4024d8c2` |
| `review-evidence-audit.json` | `17d6f4d77d6dfeb3aecc99ee9a87241ad35be193ac4c8422ebaf18e1971fa6e8` |
| `shard-check.json` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `index-validate.json` | `f4a64f681f28f53968029ae38d7f33d93fe2291231a01183f935bfa6967e4d81` |
| `commands.json` | `eb99de1c748bc9a0759fe12cb7a6bd8ad236df3a7aeac97522160caed7dd9c17` |
| `CA-SEAL2-fix3-results.json` | `e53d9f9375a18c4908acb448478089e309b0e5c3c75fe8f0ce5f4d1db4160b8c` |
