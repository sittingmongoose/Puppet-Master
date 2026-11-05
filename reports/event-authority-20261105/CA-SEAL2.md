# CA-SEAL2 — fourth recorded seal-check input change

**ROUND 8 FIXES IMPLEMENTED; INDEPENDENT RE-REVIEW PENDING.** Worker CA-SEAL2-FIX8 (Codex), stream E, VM, 2026-11-05, from Astra-5-reviewed head `fceb67118ec6f5b73017f2fb8ab31056ed27a52e`. B01–B03 are fixed in `56eaff6497d4c30ab7ef4cbdfc7965d29205636d`. Validator bytes remain frozen. Corpus **190/190**; combined inventory **327 walker + 43 supplement = 370 rows**; **263 variant executions accounted for; 0 unclassified**. Astra 5’s every-touched-predicate ruling is accepted. Earlier round sections remain historical. Independent re-review and coordinated landing remain required.

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

**Seal-applier exclusion:** the author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through FIX8, CA-SEAL2 (Codex), CA-SEAL2-FIX1 (Codex), CA-SEAL2-FIX2 (Codex), CA-SEAL2-FIX3 (Codex), CA-SEAL2-FIX4 (Codex), CA-SEAL2-FIX5 (Codex), CA-SEAL2-FIX6 (Codex), and every other fix worker are barred. The checked new receipt list contains author and actual lander; broader exclusions stay procedural.

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



## Review round 4: findings and responses

**Historical round-4 record.** Cycle 5 disproved the span-order implication and four card implications, and disputed sixteen implication labels under the then-stated earlier-guard definition. The all-settled and zero-unclassified claims below were authored claims, not a valid settlement of those 21 rows. Round 5 adds the five missing negatives and applies the lead's corrected definition to the remaining sixteen. Use the round-5 table and totals for current status.

Review read in full: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW-astra-2.md`, including the full 182-variant table, both result summaries, eleven independent witnesses and their replay scripts. All 225 retained Astra 2 evidence files match the published SHA-256 manifest. The final corpus is 134/134, including 107 recorded negative refusals. All 110 original result records/refusal strings remain identical. All 597 original source hashes and byte counts verify. No frozen validator byte, receipt, owner document or governance record changes in this round.

`H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`; `V` retains the validator path defined above. `E` is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix4/`. Each finding is fixed in `6273e45359b1714e46a0d6edf5f0312c3e932a12`; none is disputed or stopped. Each of its eleven narrow cuts accepts exactly its own new negative, while all 133 peer records, including 106 other negative refusal strings, remain identical. `E/survivor-summary.json` asserts those exact comparisons.

| Finding | Location / cause | Fix and verification |
|---|---|---|
| **CA2-A2-B01 — four final-result clauses** | `V:2321,2323,2325`; `H:425`. The prior builder controls omitted false overall, false depth and present-but-false snapshot flags. | Four separate negatives each establish the passing builder parent, then change exactly one flag. Run the corpus and narrow variants `I100`, `I102`, `I105`, `I107` in `E/removal.py`; `mandatory_isolation` verifies one changed record per variant. These defensive builder controls do not claim an earned approval or a real main run. |
| **CA2-A2-B02 — four exclusion/citation predicates** | `V:1016,1029,1037`; `H:352`. The prior cases omitted wrong decision-prefix grammar, lexical Plans prefix with resolved containment preserved, boolean line_end and line_start=0. | Each starts from the same complete, passing 249-name parent with only the other names' existing admissions injected. Decision/evidence bytes, hashes, span peers and admission set remain coherent. The alias symlink resolves to the identical file inside Plans. Replay `I080`, `I087`, `I090` and the narrow `span_lower_bound` cut in `E/supplemental.py`; every peer predicate stays enabled. |
| **CA2-A2-B03 — three source-map predicates** | `V:917,967`; `H:85`. The prior map cases omitted exact root keys, schema identity and absolute mapped locations. | Add an extra root key, wrong schema_id, or one relative spelling resolving to the identical saved source. Each parent verifies all 597 original sources; no receipt, list, fingerprint or trust pin changes. Replay `I053`, `I054`, `I030` and inspect their sole changed records. |

### Whole survivor inventory and replay

`reports/event-authority-20261105/CA-SEAL2-survivors.md` gives exactly one outcome for **all 84 review rows**: 82 passing variants plus the two structural crashes. Its per-row input, named guard, proof label and result leave no omitted survivor.

| Outcome | Rows |
|---|---:|
| **Negative added** | 23 |
| **Same-predicate duplicate** | 5 |
| **Implied** | 21 |
| **Frozen-input only** | 22 |
| **Structural** | 13 |

The three duplicate witness groups prove each site alone still refuses the same defect, then all sites removed accept: before-pin equality, after-pin equality, and the identical fourth-anchor call. Twelve separate type/value implications keep fields separate. Other implication witnesses explicitly name strict parsing and the equality, empty-segment, exact-token or unresolved-card guard that dominates acceptance; the table states when that guard occurs textually later. They are implications, never claimed as duplicates. Structural witnesses supply a concrete wrong-type/cardinality input, record intact refusal and the cut's exception, and award no acceptance proof. Frozen-only rows name the immutable receipt/list/revision pin. No unrelated predicates are merged into a duplicate removal set.

Additional negatives cover DEL paths, map membership/collection type, the third executable bridge and its enforcement, returned denominator/depth observations, aggregate completion, and the four main integration clauses. The main controls execute the actual production bytecode at the recount seam with a passing August result injected. An incomplete recount carries its matching issue record; that observation is synchronized in `a86735007b`. The earlier August computation and later receipt I/O are outside this diagnostic helper control, so it is not reported as a live CLI run.

The original Astra removal script is reused from a scratch copy, with the authorized expanded corpus and immutable Git blob bytes cached across calls. Every file-backed byte, source fingerprint and byte count is still recomputed. The original 38 published cuts, 24 field cuts and 112 inventory cuts are unchanged; eight supplementary cuts complete the 182 variants. Original historical expected-set annotations remain descriptive because new controls can add failures. Only narrow cuts establish the eleven fixes. This finite inventory closes this round's named survivors; full shared-tool adoption remains the separate S1 sweep.

**Final removal result:** 182 variants; **121 fail tests**; **61 are outcome-classified**; **0 unclassified**. The two crashes are outcome-classified, never counted as accepting or successfully refusing variants. Fresh restoration reproduces the full 134-record baseline. `E/survivor-proofs.json` contains 36 successful diagnostic witness records.

### Round-4 checks, resources and limits

| Check | Result |
|---|---|
| **Corpus / source custody** | Exit 0; 134/134; 107 refusals; 597/597 real source fingerprints and lengths. Original 110 full result records unchanged. |
| **Removal / restoration** | All 182 variants accounted for; eleven mandatory one-negative flips with exact peer equality; restored 134/134. |
| **Survivor diagnostic witnesses** | Exit 0; 36 records, including site-by-site duplicates, field-separated implications and concrete structural exceptions. |
| **Shard check** | Exit 0; top-level pass. No indexed owner or generated artifact changed; regeneration was unnecessary. |
| **Index validation** | Exit 1; top-level fail; exactly the same 24 full failure records as round 3. Zero introduced. `E/index-comparison.json` compares complete arrays. |
| **Protected paths / validator** | No `Plans/`, scripts, test-path, receipt, `.gitignore`, registry, Decision Log, Spec Lock, `.evidence` or auto-decision edit. Validator SHA-256 remains `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`; its existing receipt after-pin still matches. |
| **Currentness input** | Fifteen ignored files copied without metadata operations and hash-compared; no currentness edition regenerated or re-stamped. |
| **Whitespace / delivery** | Whitespace checked before each commit. Only the named branch is pushed. `E/DELIVERY.json` records final head, push and literal-path forced worktree removal. |
| **Actual CLI / governance / approval** | No new live CLI, admission, seal, governance run or main landing. Earlier actual CLI failures remain unfinished prerequisites; no passing production approval is claimed. |

Initial disk/RAM checks were 108 GB free / 19 GB available. The replay checks resources per variant and stops below the brief's thresholds. No mailbox, subagent, browser, server, main push, owner choice or new canonical ID occurred. Source trees and fixture directories self-delete; external replay scratch and the requested worktree are removed after export/push. No raw runtime tree is committed.

The recurring classes applicable here are covered by recomputed custody, separate historical pins, exact identifier/decision/citation interpretation, coherent issue/receipt observations, strict parsing and exact boolean/integer types. No Storage-assigned runtime metadata, payload externalization, schema-reference/format contract or number cap is introduced. Number-domain work and generic shared-tool adoption remain sweep scope.

**Family grades before → after: N/A → N/A.** No family is authored, admitted or graded. The eleven missing coverage cells and the whole survivor inventory are self-assessed repaired, pending independent review. **IDs used: none**; existing DL-451 is referenced and DL-998 remains disposable fixture-only. CA-SEAL2-FIX4 joins the procedural seal-applier exclusion. Coordinated assembly, actual landers/final anchors, real outcomes/depth, unchanged August prerequisites, before/after independent review and S1 remain integration work.

**Stopped row: none.** No intact validator acceptance of a demonstrated bad input was found. No receipt/validator re-stamp, permission expansion or final approval is awarded.

### Retained evidence — round 4

All filenames below resolve under the full `E` prefix above. The compact committed bundle is `reports/event-authority-20261105/CA-SEAL2-fix4-results.json`; the report and complete survivor table are also exported to the drafts root. Replay commands and setup are in `E/README.md`; `E/SHA256SUMS` inventories the final package.

| Evidence filename | SHA-256 |
|---|---|
| `baseline.json` | `bc98218d803094a8fa1e95de43436fc41ad27ef1366ad8e5c2bbe04c265b5a1a` |
| `restored.json` | `bc98218d803094a8fa1e95de43436fc41ad27ef1366ad8e5c2bbe04c265b5a1a` |
| `removal-summary.json` | `e4e6ce14d9987737dbd105dcb7c98b368b33c19783bdb751e7cd8d4a2ab041ed` |
| `supplemental-summary.json` | `e02f7909f14287872a32295c8a3b3f3f622c53daa3cfd8b0d52f37c94de1e59e` |
| `survivor-proofs.json` | `e08049c7cb1451a1916008010e11dffd20f04275831f96973faec2a023cdeb1b` |
| `survivor-summary.json` | `4f537ba168a1580c7c9e36615fba2ffeb7cc0ba5045e9da1a7456662563f49c3` |
| `shard-check.json` | `d88b6d64d2c3bbfb29393c893950a0750de443783549fb7cbb624230301e2be3` |
| `index-validate.json` | `023e454e42bf0523160a0ecbe462f8110225717a8839f5b6a9dd602af7919820` |
| `index-comparison.json` | `bca4e1c4f3769b5c247d278e8943b586fa3794c6cdc8759a2947f754ce02d215` |
| `scope.json` | `24dd0bb1b80f637877f2f9731558544723c6af64d23d5f3f36bceca77c03cf9e` |
| `frozen-pins.json` | `b8f45e9fa4c6aa315db9b9f12ba141bf6968af64d722756e4f1beaacb5f8c131` |
| `review-evidence-audit.json` | `542485bdaa06ca7f33eb03b493cb84f5683c1465a6eb2052e5c992f2fb9f5e61` |


## Review round 5: findings and responses

Review read in full: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW-cycle5.md`, its five named JSON evidence files, and the FIX5 brief including the lead's 10:09Z ruling. **B01, B02 and B03 fixed; none disputed or stopped.** `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`; `S` is `reports/event-authority-20261105/CA-SEAL2-survivors.md`; `V` is the frozen validator path above. `E` is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/`. Scope is tests and records only.

| Finding | Where / cause | Fix / commit / verification |
|---|---|---|
| **CA2-C5-B01** | `V:1037`; former `span_order` table row. The old proof treated every reversed span as empty, overlooking Python's negative slice endpoints. | Fixed in `661e2ce1397c8537d9c687e74b7f2855e8f53f74`, `H:376`. Add the exact two-line passing evidence parent (whole-file SHA `1eb1f83ac06e9ba6e71eb1adb3766c2d38164a892403ed2394cac2b8a69af4e9`) and change only `line_end: 1 -> -1`. The order-only cut accepts this negative, with integer types, lower/upper bounds, digest and exact-token checks enabled. All 139 peer records, including 111 peer refusal strings, remain identical. `E/supplemental-summary.json: span_order` and `E/survivor-summary.json: mandatory_isolation` assert this. Reclassified negative added in `38d74abd7f451edec049e42d1f23669c2fd71488`. |
| **CA2-C5-B02** | `V:1043,1047,1050`; rows I094/I096/I097/I099. Terminal cards-unresolved checks a different obligation and cannot imply these four diagnostic predicates. | Fixed in `661e2ce1397c8537d9c687e74b7f2855e8f53f74`, `H:328`. Four separate negatives require their own card-row-key, lexical-path, pin-key, or event-name refusal. Each first verifies the same valid card gets its exact unresolved-card diagnostic; the terminal rule stays enabled. The Plans path is a symlink to identical reports bytes. Missing-name bytes retain a synchronized observational SHA. Each own narrow cut changes only its own negative to cards-unresolved; all 139 peers remain byte-identical as result records. Reclassified all four as negative added in `38d74abd7f451edec049e42d1f23669c2fd71488`. Replay I094/I096/I097/I099 in `E/removal.py`; inspect `E/adversarial.json: cards.matrix` and `mandatory_isolation`. |
| **CA2-C5-B03** | `S:7,29`; twelve field-type rows, I006, I012, I021 and I026. FIX4's stipulated word "earlier" conflicted with the intended logical implication classification. | Fixed in `38d74abd7f451edec049e42d1f23669c2fd71488`. Record **pm7-build's 2026-11-05 10:09Z proof-classification ruling**: same field, same defect, logical implication plus single-site/two-site witness, regardless of evaluation order. This is not a product/governance decision or Jared quotation. Each of the sixteen rows states its implication and evidence. Fresh `E/adversarial.json` repeats 60 one-field wrong-type cases, plus 60 I012 aggregate-scan probes; each guard-only cut still refuses and the corresponding same-field value cut(s) accept. The review's `cycle5/survivor-proofs.json` supplies I006/I021/I026 single/two-site witnesses. Recheck the other five former implied rows as B01/B02 negatives. The corrected 84-row inventory and full rerun now substantiate zero unclassified. |

### Corrected survivor inventory and removal rerun

The original Astra inventory has exactly 84 required rows: its 82 passing variants and two structural crashes. `S` retains each exactly once. Every implied row now meets the lead's same-field definition; no unresolved-card or event-span predicate is used as an unrelated implication.

| Outcome | Rows |
|---|---:|
| **Negative added** | 28 |
| **Same-predicate duplicate** | 5 |
| **Implied** | 16 |
| **Frozen-input only** | 22 |
| **Structural** | 13 |

**Full rerun: 182 variants; 126 fail tests; 56 outcome-classified (54 corpus-passing, two structural crashes); 0 unclassified.** Crashes are never counted as accepted inputs or successful refusals. The original Astra removal script runs from a copied local scratch directory; all 38 published, 24 field and 112 inventory cuts remain unchanged. Eight unchanged supplementary cuts bring the count to 182. Configuration names the tested code head and 140-test corpus. Immutable Git blobs at explicit revisions are cached; file-backed bytes, maps, source hashes and lengths remain live. Historical published expected sets are descriptive because added controls can add failures. No validator file is rewritten: cuts compile functions in memory.

All five new narrow variants fail only their own test; all 139 peer records/refusal strings remain identical. All eleven preceding Astra-2 narrow controls also retain exact one-test isolation against the new 140-test baseline. Every one of the 28 negative-added rows now fails a test under its cut. The 54 passing variants and two crashes map to their named table outcomes. `E/survivor-summary.json` asserts the complete inventory, all sixteen mandatory narrow comparisons, 60 field-type probes, 60 aggregate probes, and the span parent's exact one-field difference. Fresh restoration reproduces all 140 baseline result records; every original 134-record result/refusal is unchanged.

The five duplicates retain their site-by-site same-predicate evidence. Fresh `adversarial.json: duplicate_anchor_digest` additionally isolates just SHA equality at each fourth-anchor caller: either single cut refuses, both accept, all shape/type/cardinality/path/grammar peers enabled. Frozen-only classifications retain the production receipt/list byte pins and revision; test trust-pin overrides create no production choice. Structural classifications retain the reviewer's concrete inputs and exception evidence.

### Round-5 checks, resources and limits

| Check | Exit / result |
|---|---|
| **Corpus / restoration / custody** | 0; 140/140, 112 recorded refusals; 597/597 real source hashes and lengths; all 134 prior records unchanged; exact restoration. |
| **Removal / supplementary replay** | 0/0 for drivers; 182 variants accounted for, 126 test failures, 54 passing, two structural crashes; zero unclassified. |
| **Adversarial replay / finite inventory audit** | 0/0; 60 field-type and 60 aggregate-type witnesses, four-card diagnostic cross-matrix, span counterexample, caller-specific anchor SHA proof, frozen pins; all sixteen mandatory one-test flips preserve 139 peers. |
| **Shard check** | 0; top-level pass. No owner/generated artifact changed; no regeneration. |
| **Index validation** | 1; top-level fail, 30 full failure records, identical to a fresh run on reviewed head 213087612a under the same origin/main. The historical round-4 count was 24; six additional retention failures name newer upstream units DL-330/331/332, DP-064/066 and PWIZ-038. Zero introduced by this round; `E/index-comparison.json` compares the complete arrays. |
| **Currentness edition** | Fifteen ignored input files copied without metadata operations and SHA-compared; not regenerated or re-stamped. |
| **Scope / protected bytes** | No change under Plans, scripts, tests or .gitignore relative to the reviewed head; only H, S, this report and the compact fix5 result bundle differ. Validator SHA remains `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`; receipts and all governance artifacts remain unchanged. |
| **Whitespace / delivery** | Diff whitespace checked before commits; only the named branch is pushed. Report and survivor table overwrite their drafts-root copies. `E/DELIVERY.json` records head, export equality, push and literal-path worktree cleanup. |

Initial disk/RAM: 102 GB available / 18 GB available; removal samples ranged from 15 to 22 GB available RAM. Resources are checked before each variant; all checkers run one at a time. No mailbox, subagent, browser, server, main push, admission, seal, registry/Decision Log/Spec Lock/evidence/auto-decision change or new canonical ID occurs. Raw replay output stays external; temporary fixtures, scratch replay files and the requested worktree are removed after retained-evidence export and branch push.

The first auxiliary comparison driver exited 1 because it assumed round 4's historical 24 index failures were still the current baseline. The fresh reviewed-head run proves the current 30-record failure array is pre-existing under the fetched origin/main; its log is retained. No validator failure or fix is inferred from that stale comparison assumption.

The applicable recurring defect classes remain covered by strict parsing, same-field type/value reasoning, exact paths/name tokens, coherent observational digests, separate historical snapshots and recomputed source custody. No runtime Storage metadata, payload externalization, schema-reference/format contract, number cap or serializer is added. Shared-tool adoption and number-domain sweep work stay separate.

**Family grades before -> after: N/A -> N/A; IDs used: none.** DL-451 is referenced; DL-998 is disposable fixture-only. CA-SEAL2-FIX5 joins the procedural seal-applier exclusion. The three review cells are self-assessed repaired pending independent re-review. **Stopped row: none.** Coordinated landing, actual landers/final anchors, real per-name outcomes/depth, unchanged August prerequisites, before/after reviews and S1 remain integration work.

### Retained evidence — round 5

Full evidence paths and SHA-256 follow. `E/README.md` gives scratch replay adaptations and commands; `E/SHA256SUMS` inventories the retained package. The compact committed bundle is `reports/event-authority-20261105/CA-SEAL2-fix5-results.json`.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/baseline.json` | `cb1efc064c3a1897996c12606315f82c562a55d6df8f44296021c530ab530730` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/restored.json` | `cb1efc064c3a1897996c12606315f82c562a55d6df8f44296021c530ab530730` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/removal-summary.json` | `9b29747eca7edf2022d2ec1f3c27c001097ec3d5d994a5ef7a28d3b0fdda8415` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/supplemental-summary.json` | `268aa723d0fdd0b86d185c7beea40266ef96db1ad23560fde0d1bab4fdbc3a1c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/adversarial.json` | `d005b808e10462b27446d525bc02b631ed523ad03bd4c04bd08ed1056023a8e0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/survivor-summary.json` | `61e89cdb0b393b114d92b6692215c470351c8703746b68494b2107edbd30b969` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/shard-check.json` | `d88b6d64d2c3bbfb29393c893950a0750de443783549fb7cbb624230301e2be3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/index-validate.json` | `620b4c8e5284ebd2bc97ac91b701563a8d6c6b6ec3a2622a723886217a90777e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/index-reviewed-base.json` | `69f4ce27b0d4dfd961f8951314983a7ed2b8175d6be2702f1b1faad77302ce96` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/index-comparison.json` | `0de05e2a573782d9d942396def5bb86067b1bdd8ccf76135ba2bd220fb4bb592` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix5/currentness-copy.json` | `0cf6e08da275a8acdef6b16ffc85512cccc0f999ea0f55d9efcb360534520002` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/cycle5/adversarial.json` | `bea189387b0d91b165edb6cea39b6257cc6637567fe6cb7259d016666b42b557` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/cycle5/survivor-proofs.json` | `e08049c7cb1451a1916008010e11dffd20f04275831f96973faec2a023cdeb1b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/cycle5/audit-summary.json` | `86c65b985ac451cf6cbe0837cf28df621c6665f2e65143bf7c34cf0b982e2599` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/cycle5/removal-summary.json` | `10334f23932ee492c0f8c0f367a94cd3b26b66baef1d93c7674de214ef4ea6b3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/cycle5/supplemental-summary.json` | `e02f7909f14287872a32295c8a3b3f3f622c53daa3cfd8b0d52f37c94de1e59e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/CA-SEAL2-FIX5.md` | `9159b06efd0e94a8a8682601018165ab97c1669061668f0ca13a3402717b2d7e` |


## Review round 6: findings and responses

Review read in full: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW-astra-3.md`, with its full predicate inventory, witnesses and replay scripts; FIX6, FIX5 and FIX4 and their named briefs/reviews also apply. All six findings are fixed; none is disputed or stopped. `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`; `V` is the frozen validator path above. `E` is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/`. All six fixes and the coverage implementation are committed in `90c0eacee18e0862e067f0f54b9e79a11ea331f8`.

| Finding | Where / cause | Fix / how to verify |
|---|---|---|
| **CA2-A3-B01** | `V:875–878`, existing membership helper at V:161. Four call-instantiated authority requirements had no independent negatives. | `H:330`: four negatives remove one DL-451 token apiece. Each verifies its passing parent, updates the observational section SHA and receipt byte anchor, and retains every other phrase/pin. `additional-summary.json`: `authority_required_token_0` through `_3` each loses exactly its own new negative. |
| **CA2-A3-B02** | `V:888–890,894`. Previous nested-object cuts retained path and exact key-set checks. | `H:354`: independent path-only and extra-key negatives for prior_receipt, recount_receipt and recount_list. Digests and peer identities stay correct; the receipt byte anchor follows the changed bytes. Six `nested_*` cuts each lose only their corresponding negative. |
| **CA2-A3-B03** | `V:1020`. The decision-section test covered the right boundary only. | `H:611`: prefix the own decision token with `x`, synchronize the section SHA and retain valid own-name evidence. The decision-left-boundary-only cut loses `negative_exclusion_decision_prefix`; right and source boundaries stay enabled. |
| **CA2-A3-B04** | `V:2244–2247`. The main seam varied recount completion while August stayed true. | `H:734`: four cases keep recount complete and set exactly one August input false. The existing production bytecode seam retains all conjunctions. Each `main_August_*` left-operand cut loses only its matching assertion; false-recount peers remain identical. |
| **CA2-A3-B05** | `V:1072–1074`. Only the receipt-error collection path was covered. | `H:754`: from the complete aggregate parent, change only the outcomes schema_id. Require complete=false and exactly one recount_input_or_outcome_invalid issue. Removing only that handler's append loses this control. The receipt handler and outcome-reader guards stay enabled. |
| **CA2-A3-B06** | `V:225`, touched `multi_family_receipt_state()`. Earlier tests called a different semantic helper. | `H:372`: finalize a coherent third/fourth parent, verify both helpers, then change only the third semantic after-hash. Synchronize the third anchor, fourth prior observation and fourth anchor. The direct comparison-only cut loses only `negative_third_semantic_after_hash`. `touched-summary.json` also proves the fourth helper still refuses. |

**All 17 mandatory narrow cuts lose exactly their own negative; all 157 peer records and refusal strings remain identical.** The four authority-token, six nested-identity, one boundary, four August, one aggregate and one DL-412 controls sum to 17. The two newly inventoried structural filters are outcomes, not accepting-negative witnesses. `E/audit-summary.json` asserts the exact failed-test sets and peer equality. Fresh `witnesses3.json` and `targeted.json` rederive the original survivor proofs as well as the new structural inputs.

### Complete coverage and regeneration test

`CA-SEAL2-coverage.json` contains all **286 syntax sites plus 41 semantic rows** from Astra's full inventory and all **84 original survivor classifications** separately. Every site names failing tests and its cut, or states its survivor/data-flow outcome with path/SHA-256 evidence. Wrappers retain separate child rows; the table also records independent regex-boundary and path-component cuts, individual span bounds, both operands of each main gate and both aggregate collection paths.

`H:29` derives touched functions and inserted lines by comparing the validator AST/text with the CA-SEAL base, rather than walking only new helper names. It uses Astra's comparison, branch, Boolean-clause, predicate-call, conditional-expression and return rules, including the changed observer assignment and builder record. It regenerates semantic expansions from the expected object, required authority arguments, flags and error handlers. `H:114` rejects missing, stale, duplicate or changed site identities, unknown test references and unclassified rows. `H:790` runs it as `positive_complete_predicate_coverage`.

The scratch demonstration removes one row: the test fails and names that exact missing site. A stale row also fails; intact/restored tables pass. The committed coverage summary explains site counts versus independent invariants, including Astra's 16 fixed data-return observations. No wrapper or terminal refusal is substituted for a child proof.

**N01 corrected:** the lead's same-field/same-defect/any-order implication ruling was written at **2026-11-05 10:09Z**. Both the original report entries and survivor definition now use the corrected time. No product or governance answer is changed.

### Round-6 checks and limits

Reproduce the current corpus with `python3 -B reports/event-authority-20261105/CA-SEAL2-checks.py --source-map /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/source-locations.json --out <external-result.json>`.

- **Corpus:** exit 0; 158/158; 129 recorded refusals; all 140 prior records unchanged; 597/597 real source hashes and lengths. Fresh restoration matches exactly.
- **Original removal:** 182 variants; 126 fail tests; 56 match survivor outcomes, including the structural crashes; 0 unclassified. All cuts remain unchanged.
- **All Astra variants:** 221; 156 fail tests, 9 structural interruptions, 56 corpus-passing classified survivors; 0 unclassified. `close_inventory.py` reruns from scratch and annotates every site.
- **Coverage table:** 191 killed-by rows; 136 survivor/data-flow rows; 0 unclassified. See the committed short summary for each outcome count.
- **Shard check:** exit 0, top-level pass; no owner/generated artifact changed and no regeneration.
- **Index validation:** top-level fail; full output retained. All 30 complete failure records equal the retained round-5 array. Tracked Plans and checker inputs are unchanged from the reviewed head; no unrelated finding is repaired.
- **Scope:** only H, the coverage table/summary, compact fix6 results, survivor table and this report change. Validator SHA-256 stays `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. No Plans, scripts, receipt, .gitignore, registry, Decision Log, Spec Lock, .evidence or auto-decision edit.

The original 84 classifications remain 28 negative-added, five duplicate, 16 implied, 22 frozen-only and 13 structural. New ssot/entry filters have concrete malformed JSON and AttributeError witnesses; crashes are never acceptance proofs. Fixed data-return observations are identified as such, rather than claimed as independent guard proofs.

Disk/RAM passed the required 50/6 GB thresholds before checkout (107/19 GB). Replay resource checks remain enabled; checkers run sequentially. Fifteen ignored currentness inputs were copied byte-for-byte for read-only index validation, without regeneration. All cuts compile functions in memory; frozen executable bytes are never rewritten. No mailbox, subagent, browser, server, main push, admission or seal occurred. Family grades N/A; IDs used none. CA-SEAL2-FIX6 joins the procedural seal-applier exclusion.

**Stopped row: none.** Coordinated assembly, actual landers/final anchors, real per-name outcomes/depth, unchanged August requirements, independent before/after review and shared-tool adoption remain integration work. The branch earns no final approval.

### Retained evidence — round 6

Raw runtime output stays outside the repository. The compact committed result is `CA-SEAL2-fix6-results.json`; replay instructions and copied scripts are in `E/README.md`. Copy scripts to fresh local scratch before replay. Full evidence paths and SHA-256:

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/baseline.json` | `fe99e4084535f27cbd47951ff27777f62892c76227bb3931493e350d21866d98` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/restored.json` | `fe99e4084535f27cbd47951ff27777f62892c76227bb3931493e350d21866d98` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/removal-summary.json` | `4b7f3934bdf7f228d2d877d0acfadd19a76c2419ce7c362baafe2b96ef3b9af0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/supplemental-summary.json` | `964ab95ca3678ff86cdf243793ab5ce5260211254421beb863c86641d92f566c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/additional-summary.json` | `041e2c9217836013e884ecfbcc69056d48223f1208b0c401ab49ddada6afff62` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/dispatch-summary.json` | `552904a1aaefbefff54215c487d33f324235080922918264aeb3635e5a184bce` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/touched-summary.json` | `a1e5b541806ad806b5a73255b23250c246952f9b56d14128d823e86c2a95693b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/witnesses3.json` | `6597882416b2dda4cd05f2eb9c41cd9aea17c48108f84927b8d4e8d61037e643` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/targeted.json` | `cdbcb5a0718e528773ab9cc4ed6d225193c7bb72f6144323a9e519e6477bc33b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/predicate-inventory.json` | `d6a2e5e7c4ed8cab0cd4ccd8eaacb1992cd8492aaebec2bf56fdf870ab80016a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/classification-regrade.json` | `086302e1ba06cd5d0f123dd3b4b65954a43fcfd53808fb9b4fcd9e6c977d0040` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/audit-summary.json` | `552353061c6b8574eca712f852c4e487aeea3189ca20101be189d6f27015b038` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/coverage-demo.json` | `860ad5afbbafbf922fbdf9ae1d7d82d98a028a43e67840ba4e8cc49f16dc9114` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/shard-check.json` | `3df84afb0ff89f7052554bb9700a1bc3294714b9109ec8257ee2b7ab46a86b21` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/index-validate.json` | `d621619a356376b0ede68a4ad8dd05ec89ca300ffc0d74d98f78a819d4aaa2d2` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/index-comparison.json` | `9bc72ccb7c71e0448ccd2c4704100b11efde7be5ec951fef083e0bf9a4c8d644` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/currentness-copy.json` | `ab1f0477f083f1453770147475ee39452b8f6cdcd92cdc7d9e9ad4734362d724` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/scope.json` | `7e11fcf8682fe1a76ae82b300133a0ab79586de0bd0cf137312f9e3d6333d24f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix6/final-corpus.json` | `fe99e4084535f27cbd47951ff27777f62892c76227bb3931493e350d21866d98` |

## Review round 7: findings and responses (lead fix, 2026-11-05)

Sol cycle 7 (`reviews/CA-SEAL2-sol/REVIEW-cycle7.md`) found two reachable checks filed as structural. The stream E lead fixed them as a small review fix; the validator is unchanged (`3e98a165…`).

- **C7-B01, anchor-path equality (`V:850`, coverage sites 18 and 19).** New negative `negative_wrong_fourth_anchor_path`: from the passing fourth-receipt parent, only the fourth anchor entry's path changes, to `reports/review-foreign-receipt.json`. Its digest stays correct for the fourth receipt, the third anchor stays intact and every semantic field is unchanged. The intact validator refuses with `fourth amendment identity, authority, byte link or anchor mismatch`. With only the path equality relaxed, this negative alone fails, and the other 159 result records are identical.
- **C7-B02, excluded-route tag (`V:1010`, coverage sites 190 and 191).** New negative `negative_exclusion_unknown_outcome_tag`: from the passing exact-member exclusion, only `outcome` changes, to `review_unknown_exclusion`. The intact validator refuses with `unknown recount outcome`. With only the dispatch broadened to accept that tag, this negative alone fails, and the other 159 records are identical.
- Coverage table: the four rows move from structural to killed. The totals are now 195 killed, 59 structural, 20 implied, 3 duplicate and 50 frozen-input only, with 0 unclassified. The corpus passes 160/160, including the coverage test. Cut runner and results: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix7/`.

## Astra round 4: findings and responses (lead, 2026-11-05)

Astra 4 (`reviews/CA-SEAL2-sol/REVIEW-astra-4.md`) found one blocking item, CA2-A4-B01: the coverage walker misses reachable predicate forms. Its example is the completion gate `state["complete"] = not issues` at `V:1074`; it also shows truth-only assertions and comparisons whose first line is unchanged. Astra confirmed the following:
- all 132 survivor rows hold;
- the corpus passes 160/160;
- the completion gate already has two effective negatives (158 pass / 2 fail under its one-site cut);
- no final-approval bypass exists;
- approval semantics, historical custody, the staged landing order and scope all pass.

Astra noted that its blocking verdict followed the lead's review instruction, and that the general brief sends inventory-machinery defects to the shared-tool sweep.

**Status: NOT READY, pending a neutral Astra review (correction, 2026-11-05 14:05Z).** An earlier version of this section classified CA2-A4-B01 as a sweep item under a "pm7-build 04:45Z rule". That attribution was wrong: no such rule of pm7-build's exists, and treating proof-machinery findings as sweep items was the lead's own briefing choice. Under Jared's rule an item is done only when Astra passes, and an Astra NOT_READY is not downgraded on anyone's reading. Whether completeness over the walker's supported forms is acceptable for this gate is open, pending a neutral Astra review.

Records updated, with no change to tests or the validator:
- the coverage table records the completion gate under `outside_walker_sites`, with its two killing negatives and Astra's evidence;
- `walker_limits` lists every unsupported form and narrows the completeness claim to the walker's supported forms;
- sites 183 and 184 are killed by `negative_outcome_unknown_outcome` (Sol cycle 7 note);
- wrapper sites 20 and 179 carry the mixed-child scope note.

The totals are now 197 killed, 57 structural, 20 implied, 3 duplicate and 50 frozen-input only, with 0 unclassified. Whether the walker must be completed before landing is decided by that review.

## Astra round 5: findings and responses

Round 8 addresses the neutral Astra 5 review of `fceb67118ec6f5b73017f2fb8ab31056ed27a52e`. Its every-touched-predicate ruling is accepted. B01, B02 and B03 are fixed in `56eaff6497d4c30ab7ef4cbdfc7965d29205636d`; none is disputed or stopped. Independent re-review remains required. `H` below is `reports/event-authority-20261105/CA-SEAL2-checks.py`; `V` is the frozen validator. `E` is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/`.

| Finding | Where / cause | Fix and verification |
|---|---|---|
| **CA2-A5-B01** | V:867/984/1066/1072; exception alternatives were omitted, and H's expected-refusal wrapper accepted escaping aggregate errors before checking their results. | H:296/366/1087: missing fourth receipt, malformed fourth receipt, unavailable/mismatched source and unavailable Git repository controls. Both aggregate negatives now assert complete=false, diagnostic_only=true, the exact one issue/detail and the surviving state fields. Missing receipt/outcomes controls assert their exact returned diagnostic. All nine own dispatch cuts fail exactly their matching control; all 189 peer pass states remain true. Custody ValueError cuts also change older broad refusal strings; this is not claimed as byte-identical peer diagnostics. |
| **CA2-A5-B02** | V:847/848/850/851/907/917/997/1000/1013/1016/1023/1026/1043; a later Python crash previously counted as adequate structural protection. | H:463/771/811/862: all thirteen named wrong-type controls require the direct helper's False or its exact controlled ValueError. TypeError and AttributeError fail. Each narrow type cut loses its own control; the files-type cut also loses the ssot-type control because that path intentionally produces files=None. No accepting input is inferred from an exception. |
| **CA2-A5-B03** | V:964/1080; every prior case supplied a map, and inequality allowed null observed hashes to pass. | H:433/450/573: unset only the map on a valid absolute-source fixture, require all 597 bytes to verify and source_locations=null. Assert all four present observations equal hashes of actual fixture bytes. Remove only the denominator and require its null observation, all other observed hashes and the unchanged historical identities. Presence-forced-True and presence-forced-False cuts both fail. A separate real-input absent-map observation records the machine's actual custody outcome without claiming a successful default-source run. |

### Enforced complete inventory

`CA-SEAL2-coverage.json` now has **327 walker rows plus 43 supplement rows = 370**, with **0 unclassified**. The old unenforced outside-walker list and supported-forms-only completeness claim are retired. The complete inventory follows all 15 changed top-level functions and their nested functions against CA-SEAL `17c842445a2623bb0334ba8d6932e7a6bf088967`.

H:114 independently audits changed AST spans rather than relying on the walker's first-line filter. Explicit rules enumerate the assigned completion negation, four exception tuples and all twenty class alternatives, three JSON parser callback bindings, Boolean compositions/coercion, a combined comprehension filter and the overlapping multiline third-receipt wrapper. Every row is checked for identity, outcome, tests or explanation, narrow cut and evidence. Unknown syntax, exception classes, callbacks, calls and filters fail closed. A separate audit uses Git diff rather than the corpus's SequenceMatcher and regenerates exactly the same 43 supplemental identities without calling `predicate_supplement()`.

Eight single-dependency-fault controls cover the remaining defensive TypeError, KeyError and SubprocessError dispatch alternatives. These are explicit helper seam tests, not claims that strict JSON defeats the preceding type guards. Each own class cut fails only its matching control. UnicodeError at each of the three tuples is implied by ValueError on the same raised exception: removing only UnicodeError preserves the result, while removing both classes propagates that identical fault. The builder's new Boolean conversion duplicates its existing returned-pass conversion at V:2339: an explicit zero input remains False under either single-site cut and becomes integer zero under the paired cut. These are same-exception containment and same-value normalization proofs; unrelated terminal refusals are never implication evidence.

Current combined outcomes: **270 killed by, 21 structural/data-flow, 23 implied, 4 same-predicate duplicate, 52 frozen-input only**. Sixteen structural rows are fixed data returns, not independent accepting-guard proofs. Other surviving structural interruptions are stated explicitly. The 84 earlier survivor records remain historical source lineage; current per-site outcomes supersede their former type-protection labels.

### Fresh replay and limits

- **Corpus:** 190/190; 597/597 real source hashes and lengths; final restoration matches all result records. Thirty new recorded controls extend the prior 160; the existing builder test also gains the zero-valued duplicate witness.
- **Astra 5:** all 31 original variants are detected. Eight additional defensive dispatch cuts are detected. The builder's two single cuts match their duplicate outcome and its paired cut fails the Boolean-result assertion. Three Unicode subclass witnesses meet the logical implication and paired-cut standard.
- **Astra 2 / Astra 3:** 182 original variants: 139 detected cuts and 43 classified survivors. The complete 221-variant Astra 3 set has 171 detected cuts, 43 classified survivors and 7 structural interruptions. Including the 42 new/supplemental executions gives 263: 211 detected cuts, 45 classified survivors and 7 structural interruptions. Every surviving variant matches its recorded outcome; 0 unclassified. `removal.py`, `supplemental.py`, `additional.py`, `dispatch.py`, `touched.py`, `inventory.py` and `close_inventory.py` run from scratch copies. Their cuts are unchanged.
- **Coverage demonstration:** missing walker/supplement rows, an absent supplement, a stale row and a removed ValueError alternative all fail the real coverage test. Injected While, Assert, NamedExpr, Match, a bare comprehension filter an unknown call, an unknown parser callback and an unknown exception class all fail closed. Intact and restored tables pass.
- **Repository checks:** shard check exits 0 with top-level pass. Index validation exits 1 with 88 failures (21 invalid removal-ledger records, 66 removals without ledger decisions and one stale generated artifact); its complete failure array equals the reviewed fceb67118e baseline run under the same ignored currentness inputs. All reports-only changes are restored byte-for-byte after that baseline comparison. No owner/generated artifact is regenerated.
- **Scope:** only tests and compact records under `reports/event-authority-20261105/` change. Validator SHA-256 remains `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`; every tracked Plans/script/receipt byte is unchanged from the reviewed head. No Spec Lock, .evidence, auto-decisions, .gitignore, registry or Decision Log edit.

The complete replay runs sequentially in checkpointed batches because an earlier long shell received SIGTERM after 18 original cuts. Scheduling changes never alter a cut or assertion; the final checker/validator hashes bind every batch. Preliminary runs completed the Boolean-coercion proof and are not counted as the final full campaign. The first coverage-demo restoration used normalized line endings and failed only the frozen-byte hash; its corrected restoration writes the original CRLF bytes, and the retained demonstration passes. These are harness adaptations, not validator repairs.

The saved 26 mapped source editions (13,102,646 bytes) are copied to local scratch, with both source/copy hashes recorded. Replay map locations therefore differ, while all 597 required source hashes and lengths and the frozen receipt/list pins remain unchanged. Only immutable revision-qualified Git blobs are cached. File reads, SHA computations, byte lengths and map reads remain live. The final corpus uses the original supplied map. The real absent-map probe returns a contextual ValueError containing 17 source-custody issues; forcing only the presence guard True instead raises TypeError. No successful real default-source run is claimed.

Reproduce H with the supplied original map using:

```sh
python3 -B reports/event-authority-20261105/CA-SEAL2-checks.py --source-map /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/resume/source-locations.json --out /home/sittingmongoose/PM-Experiments/ca-seal2-result.json
```

`E/README.md` describes replay extraction, byte-verified local mapping, batching and the independent audit. `E/SHA256SUMS` inventories retained scripts/results. The compact committed bundle is `CA-SEAL2-fix8-results.json`.

No mailbox, subagent, browser, server, main push, admission or seal was used. Family grades **N/A**; IDs used **none**. CA-SEAL2-FIX8 joins the procedural seal-applier exclusion. Actual landers/final anchors, unchanged August prerequisites, complete real per-name outcomes/depth, coordinated assembly and independent before/after reviews remain integration work. The helper positives inject prior admissions; they grant none. **Stopped row: none.**

### Retained evidence — round 8

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/final-corpus.json` | `c8512a90df0a17053b3eb5fed13fc0a11919be106858a5d83ee6f1eaa2a76de9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/cut-audit.json` | `324718531c601ab647441679f6e7f16e7e9145b495e4ac2df0ae0c6625daf801` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/independent-supplement-audit.json` | `123231b2b719385827d63abccb10a04f74f827041cd5f320a67b154e15cdde9e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/coverage-demo.json` | `5af9de5867c3906c59a9dcf355e8419fda86e390ee37be88d28b1a1b4786395b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/unicode-dispatch-proofs.json` | `a506a026b9e4f2cb07b69b9c26494ae64e16ae3ed858e34aeca4487b47d8f927` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/builder-bool-summary.json` | `88690d7604fc7b9aa9fad33a55d73e20977e5ebda51f2f15317a5b56dfb67794` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/real-absent-map-witness.json` | `6631ffb727f210e9957de2045c41e553da5cc01dd96f2fe6affbe4d362eb6b42` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/index-comparison.json` | `866f239c1ae1af9b6462cf97d8f7f377c70a29cf5a24e1bd0ed3c3c1d46ac4b5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/repo-check-summary.json` | `fddcf2c95bae940532a3d39edac0032607105abfb091867cb7b15b8cf7b57c6e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/evidence-reference-audit.json` | `61ede00066d584b6243c50f65919d29b6d7ec4df766eddbf034acb3f22af94c7` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/extraction-manifest.json` | `1efc449a90c10a11bffcf3946ad97ecb3b20a41436547b08693a704a275d1e8b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/source-revisions.json` | `05e6becb01c3fe6fae734492d3e84d11b9f237f5e63bbd364540d821ea77abe3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/local-source-copy-manifest.json` | `540b01eca3a59b4579cdec54752ce772f1f97dce3a759cf31d569962443fab76` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/removal-summary.json` | `99db37a02e8e0ee86a422f7fee2ac23f773df84b3563e8e0e6cf5976eec64c60` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/supplemental-summary.json` | `79253293ce55d2f552a5192d323598a60c3ca69c363e06a3de1b9329779759f4` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/additional-summary.json` | `5418c1db0c3ed2c6b99e00d755ae43b9a9dc43b1c3e3efb4590f69d8d8a9f704` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/dispatch-summary.json` | `0c6f36bee7527e103075f7f65e67cfa667d235a2afbc97ea1fb192ed9f07759e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix8/touched-summary.json` | `0647d5f085d4a4e403d25ccf43646d978f7cb4489fccf6149ba6b515b5cce94d` |

