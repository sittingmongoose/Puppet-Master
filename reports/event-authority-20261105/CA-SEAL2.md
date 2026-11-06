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

## Astra round 6: findings and responses

Round-9 worker: **CA-SEAL2-FIX9**. Read the full FIX9/FIX8 briefs, inherited FIX6/FIX5/FIX4 rules, the neutral Astra 6 review and its probe/replay evidence, and the prior named reviews and replay contracts. This is a tests/fixtures/records change from `962cdd561c782de7d4ca90e871653059fce39ec6`. The scanner, insertion controls and corrected negative are in **`ce4d4a1d33f489a869e38f3a0c3f28c16b4fa35e`**; the classification audit and final evidence are in the follow-up commit containing this section. `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`. `E` is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/`.

| Finding | Location and cause | Fix and verification |
|---|---|---|
| **CA2-A6-B01 — fixed** | Former `predicate_supplement()` selected calls by name and admitted `BinOp` without enumerating its operator. An assigned `isinstance` and Boolean bitwise combinations could have no row. | `H:116` now walks entire touched-function bodies, including nested functions and inherited August statements. Every required node type and every call has an identity, independently of classification. There is no call-name whitelist or changed-line filter in this enumeration. `H:184` compares exact regenerated/recorded identity sets, rejects stale/duplicate rows and checks outcomes/evidence. `H:224` repositions only existing metadata for three inserted statements and requires the missing identities. `H:268` covers all required grammar forms synthetically, including unknown calls and nested functions. Fresh Astra probe, hidden-predicate and missing/stale controls are retained under E. |
| **CA2-A6-B02 — fixed** | The extra-name input also lacked prior admission for its injected registered name; a broad refusal accepted that unrelated defect. | `H:821–827` keeps the row list sorted, injects prior admission for `foreign.name`, and requires the complete diagnostic `recount outcomes must name each exact member once in sorted order` through the exact-ValueError assertion helper. The only defect is the extra recount member. The exact-member-only cut loses this negative; the separate admission-only cut leaves its exact-member refusal intact. The valid parent and corrected one-defect helper witnesses are retained under E. |

### Exhaustive node inventory and classification

The old 327 syntax/semantic expansion rows remain checked. The new whole-function inventory has **1,617 node rows**: **873 predicate/preservation rows and 744 non-predicate data operations**. Together there are **1,944 checked rows**, with **0 unclassified**. The companion `CA-SEAL2-coverage.md` and JSON give the full node-type and outcome totals.

**Node types:** Call 891; Compare 219; BoolOp 110; UnaryOp(Not) 113; BinOp(BitAnd) 9; BinOp(BitOr) 3; IfExp 17; comprehension filters 38; If tests 171; Try dispatches 6; except dispatches 6; individual exception alternatives 29; parser callbacks 5. NamedExpr, Assert, match cases/guards and BitXor have zero occurrences in the frozen source and have explicit synthetic grammar coverage. While and TryStar are additionally inventoried and absent from the frozen source.

**Node outcomes:** killed by named tests 200; implied 8; same-predicate duplicate 3; frozen-input only 38; structural interruption 4; non-predicate data operation 744; preserved August predicate 620. The last category identifies unchanged inherited occurrences by their exact historical node identities, positions, function, type and expressions at CA-SEAL `17c842445a`; the coverage test regenerates and verifies these identities. This is preservation evidence, not a new guard-removal or accepting-input claim about unchanged August code. No inherited occurrence is omitted from enumeration.

Each non-predicate call has a reason and concrete parent/consumer AST data flow. Boolean-returning helpers/methods and calls directly consumed by truth tests remain predicate rows. Lookups, hashes, lengths, types, paths, byte operations, validated records, collection mutation and exception construction have their separate data/effect consumers recorded. The twelve bitwise operations in the frozen source are eleven set operations and one optional-type annotation. Their actual expressions and consumers distinguish them from the Boolean insertion probes. Classification never suppresses a syntax identity.

The earlier completeness wording about a bounded walker plus selected supplemental forms is superseded by this node-type enumeration. Byte and line metadata alone cannot satisfy a missing node row. The historical 84-row survivor record and the lead's same-field/same-defect/any-order implication definition remain unchanged.

### Fresh replay results and limits

- **Corpus:** fresh uncached process with the original supplied source map, exit 0, **194/194**, all **597/597** source hashes/lengths verified. All 190 previous test names remain; four node/probe tests were added. Changed prior result records: `negative_outcome_extra_name` (the extra-name case now uses a direct exact-refusal assertion).
- **Astra 2:** 182 variants: 139 killed, five same-predicate duplicates, 16 implied and 22 frozen-only; zero unclassified.
- **Astra 3:** 221 variants: 171 killed, seven structural interruptions, five duplicates, 16 implied and 22 frozen-only. `close_inventory.py` completed: 286 syntax + 41 semantic rows, zero unannotated.
- **Astra 5 and supplement:** 42 variants: 40 killed and two evidenced Boolean-coercion duplicates. All nine exception cuts lose only their own exact control; thirteen wrong-type controls and the snapshot/optional-map controls are detected.
- **Astra 6:** all ten expression cuts lose every claimed named test. Three separately repeated anchor/dispatch cuts each lose only their own negative. The two B02 corpus cuts prove the exact-member-only cut fails missing-name, duplicate-name and repaired extra-name controls, with every other record identical; the admission-only cut fails only missing-admission while extra-name retains its exact-member refusal. In total **278 semantic-cut executions**, not 278 distinct invariants; every outcome is recorded and none is unclassified.
- **Current kill-claim join:** **433/433** historical/node killed-by claims match fresh observed cuts and their named failing tests. The extra-name test is now explicitly included in all three exact-membership coverage rows. Each killed-by row carries its current replay reference in addition to prior proof lineage.
- **Independent node audit:** exact equality for all **1,617** node identities over **15** touched top-level and **10** nested functions; missing and stale Call rows both refuse. All 620 historical preservation identities and 744 data-flow records verify.
- **Insertion controls:** assigned `isinstance`: one missing identity; assigned Boolean `&`: one; builder `| isinstance(...)`: three. Bare filter, unknown call and assigned `bool` also yield missing identities. Metadata-only updates never supply a row. The altered builder's complete corpus is **193/194, exit 1**, failing the actual coverage test; the unchanged/restored corpus passes. The deliberately altered helper still shows the review's false-to-true witness, proving the gate now catches that omitted syntax, not claiming an intact approval bypass.
- **Read-only repository checks:** shard-check: exit 0, top-level pass, 0 failures; index-validate: exit 1, top-level fail, 89 failures. Plans/scripts inputs remain identical to the reviewed base. No shard/index/canon/governance regeneration occurred. The prior 88 index failures remain, plus a DL-336 removal comparison against the advanced `origin/main` baseline. DL-336 is absent at the pinned base and present on current `origin/main`; no tracked Plans/scripts input changed in this task. The exact comparison is retained in E; no unrelated failure is repaired.

Root disk and RAM initially passed the 50/6 GB thresholds (88 GB free, 13 GB available). Checkers ran sequentially. Four memory-floor stops preserved completed variants and resumed at at least 7 GB; the replay worker's recorded peak was about 200 MB. Successful immutable revision-qualified Git bytes and their derived digest states, plus immutable bytecode disassembly, were cached only in replay infrastructure. Mutable file reads/digests, maps, source lengths and failures stayed live. The final original-map process used none of those replay caches. A replay entry-point adaptation was corrected before the missing driver ran; all cuts and product/test inputs stayed fixed. The copied read-only checker initially retained the prior output path; its six prior evidence files were restored byte-for-byte against their unchanged SHA256SUMS, and the new outputs were moved to this round’s directory. `prior-evidence-restoration.json` records all six exact hash matches.

Only five round-9 paths change, all under `reports/event-authority-20261105/`: H, coverage JSON/Markdown, this report and the compact fix9 result. The validator stays byte-for-byte at `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. No validator, receipt, Plans, Spec Lock, `.evidence`, auto-decision, `.gitignore`, registry or Decision Log edit; no pm-mail, subagent, main push, admission, seal, browser or server. **CA-SEAL2-FIX9 joins the seal-applier exclusion.** Family grades N/A; IDs used none; stopped product questions none. Coordinated landing, actual landers/anchors, real per-name outcomes/depth and unchanged August approval requirements remain integration work.

### Retained round-9 evidence

The compact committed result is `CA-SEAL2-fix9-results.json`. Replay scripts, raw cut outputs and instructions are retained in E, with the input extraction and local-copy manifests and a complete `SHA256SUMS`. Temporary copied inputs/editions, runtime scratch and the worker worktree are removed after branch push. The report and coverage copies in the parent drafts directory are overwritten with this result.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/cut-audit.json` | `f2bd814bf5a4a06924bea6c01b686a7eaf244deab930963f111337b9eea22bfb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/kill-claim-audit.json` | `c7929b9db7d0391f15020a0edde01cd245f4709c59bf7ce51da5ffb7881d0477` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/coverage-probes.json` | `cdfc660fc5774043eadcd2911eb9e77ebb3bee99d632c275b3b1782f94d1873e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/hidden-predicate-summary.json` | `8fec8f3f49d64cdc5354221fd523cbb950d1bab40d455f43923eb7ced192899d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/hidden-predicate-corpus.json` | `60c4f5658b4e3bd0626f673f6f8d00cdc1ca3d6a78918c79d1f8fad88f2a1252` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/masked-negative-summary.json` | `992b853f18955897eddd9e5ed983bdabb1649a9ad9ba3542a1967eaa306395f0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/expression-summary-000-010.json` | `1bc3b38fc887939a6ec12212bacf1f610f3e25dcf5a89c18eff094d9b1e68d3a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/own-dispatch-summary.json` | `e3b9ccb37367c2b9e792057029110f94ddeca5e3ab3721235ee6c24f5963b00f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/independent-inventory-audit.json` | `bead70735b37bfa19b5ba79635c98e4975d6f4008772a5cd0945f9582900bbf1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/final-corpus.json` | `243a4e466ce2e13e4366106634f276bbc4ac41b30d51534a3b3b5347deafd2c8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/repo-check-summary.json` | `e5d977c35754f4e72cd3ffc73399e25e5378b5f933ba1cb4a9567026409fcbc3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/index-comparison.json` | `e149b69019df6efa2da2e1961a8c24b245da0d06efb6a43bc1db98d66eb9ddd6` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix9/prior-evidence-restoration.json` | `08b4484ec60570292c9a620e905bc114dd320499b17fe116cce413d7f44750ae` |

## Recheck cycle 10: findings and responses

Round-10 worker: **CA-SEAL2-FIX10**. Read the FIX10 and FIX9 briefs, the blind Sol recheck `reviews/CA-SEAL2-sol/REVIEW-cycle10.md` and its evidence (`probes.py`, `preservation-rebinding.json`, `history_audit.py` and the other replay scripts). This is a tests/fixtures/records change from `fe09cf2be8f7f11ffc5c1f8f5980f40d68ced660`. The occurrence map, its validation and the probes are in **`422727d7f7b1431d3e829eadf45da772c97db814`**; the replay evidence and this section are in the follow-up record commit. `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`. `E` is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/`.

| Finding | Location and cause | Fix and verification |
|---|---|---|
| **CA2-C10-B01 — fixed** | Round-9 `validate_coverage()` accepted a `preserved August predicate` row when its claimed baseline node existed and matched the row's function, column, expression and node type. It never showed that the current node *is* that historical occurrence, and two rows could claim one baseline. An inserted `probe = isinstance(receipt, dict)` labelled with V:220's baseline passed. | `H:233` `occurrence_map()` aligns CA-SEAL `17c842445a` to the frozen validator function by function, over unchanged blocks (`difflib.SequenceMatcher` over each function's lines, decorators and signature included). `H:197` gives a node a counterpart only if its own span lies in one unchanged block, a historical node of the same type, expression and extent sits at the mapped position, and the enclosing chain up to the top-level function has the same node types and parent fields at unchanged positions, with every enclosing statement header unchanged. The map is one-to-one. `H:315` and `H:353–359` require each preservation row's baseline id to be its own node's counterpart, allow one claim per historical occurrence, and check the recorded map totals. Nodes in inserted or changed blocks, in a changed context, or in a function new since CA-SEAL have no counterpart and can never be preserved. |

### Computed occurrence map

| Measure | Value |
|---|---:|
| Touched functions aligned to CA-SEAL by name | **4** (`multi_family_receipt_state`, `post_august_validator_pin`, `main`, `build_receipt`) |
| Touched functions new since CA-SEAL | 11 |
| Aligned unchanged blocks | **8** (two per aligned function) |
| Aligned unchanged lines | 1,306 |
| Eligible nodes (computed counterpart) | **1,126** |
| Ineligible: inserted or changed line / changed enclosing header / new function | 35 / 1 / 455 |
| Preserved rows matched to their own counterpart | **620 of 620** |

The 1,126 eligible nodes are exactly the 620 preserved rows and 506 non-predicate data operations. No killed, implied, duplicate, frozen-only or structural row is eligible, and none of the 36 ineligible nodes in the four aligned functions is preserved (they are 15 killed-by, 20 data-operation and 1 same-predicate-duplicate rows; see `occurrence-audit.json`). **No committed row changed outcome:** every one of the 620 rows passes through the computed map, with the same baseline id it already cited. The recheck's whole-file line map agrees for all 620. The coverage JSON gains `totals.occurrence_map`, schema `v4`, and corrected preservation wording; identities, outcomes and evidence are unchanged.

### Regression probes (each must fail coverage)

`H:421` `forged_preservation()` edits a scratch copy of V and forges the table an attacker would need under round 9: existing rows rebased, a vanished row taken over by the new node at its position (a preserved one becomes `implied`, since round 9 already refused an expression change), any other new node rebound to the preserved row sharing its function, column, expression and type, and every count and map total regenerated. `H:545` requires refusal at the occurrence check, naming the expected sites. The committed corpus runs all five as `negative_preserved_*`, plus the synthetic `positive_occurrence_map_controls` (`H:560`).

| Probe | Edit and forged claim | Round-9 rule | Round-10 refusal |
|---|---|---|---|
| `rebinding_inserted_call` | The recheck's witness: `probe = isinstance(receipt, dict)` inserted before V:238's return, labelled with V:220's baseline | accepts | not an unchanged occurrence (the inserted call); claimed twice (V:220's baseline) |
| `inserted_sole_claim` | Same insertion; V:220's own row relabelled `implied`, so the inserted call holds the only claim | accepts | not an unchanged occurrence (the inserted call) |
| `duplicate_claim` | No source edit; V:1240's `isinstance(pins, str)` claims V:1227's baseline (line and evidence copied) | accepts | claims another occurrence (V:1240); claimed twice (V:1227's baseline) |
| `changed_occurrence` | V:218 edited in place (`else None` → `else "x!"`); its preserved `isinstance(receipt, dict)` keeps line, column, text and baseline | accepts | not an unchanged occurrence (that call) |
| `changed_enclosing_header` | V:1122 `if failures:` → `if not failures:`; the body's preserved V:1129 call and filter keep line, column, text and baseline | accepts | not an unchanged occurrence (both body nodes) |

Every forged table passes the round-9 `validate_coverage()` from `fe09cf2be8` and fails the round-10 one with `preserved occurrence mismatch`. Earlier insertion probes are unchanged and still fail with missing identities. The one-category cut analysis (`preservation-probes.json`) shows which rule refuses which probe: dropping the not-an-unchanged-occurrence category lets the sole-claim, changed-occurrence and changed-header probes pass; the rebinding probe then still fails as a double claim, and the duplicate probe fails on both remaining categories. The once-only rule never refuses alone: the map is one-to-one, so any second claim is also a row that claims another node's occurrence. It stays as a direct check of brief rule 3.

The synthetic control aligns `kept(x)` moved below a new function: the unchanged assignment, the unchanged `if x:` test and an unchanged `try` body call map; a duplicated copy of the assignment maps once; an inserted line, an `if` test changed to `if not x:`, a body moved from `if` to `else`, a body under that changed header, a handler changed to `except ValueError as exc:` (both its dispatch and the `Try` dispatch), a changed `return` and the new function's call have no counterpart.

### Fresh replay results and limits

- **Corpus:** a fresh process on byte-verified scratch copies of the code commit, with the original supplied source map and no replay caches: exit 0, **200/200**, all **597/597** source hashes and lengths verified. The worktree's original-map run is also 200/200 (`final-corpus.json`). All 194 previous test names remain and their result records are identical to the round-9 head's run. Six tests are new: `positive_occurrence_map_controls` and the five `negative_preserved_*` probes.
- **Recheck cycle-10 probes (`probes.py`):** Astra 6's five insertions (assigned `isinstance`, Boolean `&`, bare filter, unknown call, assigned `bool`) each fail coverage with one missing and zero stale identities; scratch bytes are restored. The ten adjacent insertions still fail with missing counts **1,1,1,1,2,2,2,2,1,1**. **The rebinding witness now fails coverage**: `preserved occurrence mismatch`, the inserted call as not an unchanged occurrence and V:220's baseline as claimed twice.
- **Astra 6 hidden builder replay:** the `overall_pass = overall_pass | isinstance(named.get('review_extra'), dict)` insertion has three missing identities and fails coverage. Its full corpus is **199/200**, exit 1, failing only `positive_complete_predicate_coverage`. The deliberately altered helper still turns false into true, which is the perturbation the coverage test now catches, not an intact approval bypass. Validator, coverage and receipt scratch bytes are restored exactly.
- **B02 cuts:** the exact-member-only cut gives **197/200**, failing only the missing-name, duplicate-name and extra-name negatives. The admission-only cut gives **199/200**, failing only the missing-admission negative, while extra-name keeps its exact-member refusal.
- **Provenance and data-flow audits:** the recheck's `history_audit.py` finds 620 rows and zero line-provenance mismatches. `data_audit.py` resolves all 744 data-flow consumers to the actual AST and retains its 40-row risky sample unchanged. `occurrence_audit.py` confirms the committed map totals, 620/620 rows on their own counterpart, 620/620 agreement with the recheck's whole-file line map, no historical occurrence claimed twice, and no preserved row in a new function.
- **Committed rows:** no row changed outcome, and none needs a new evidenced outcome.

**Limits.** Preservation is now occurrence identity: unchanged text, position, extent and enclosing structure inside an unchanged block of the same function. It is not data-flow equivalence. An unchanged predicate whose inputs are produced by a changed line keeps its preserved status. *(Corrected in round 11, CA2-C11-N02.)* In round 10 only a changed line's census nodes were inventoried, so a changed statement with no census node (for example `anchors = anchors[:1]` or `continue`), or a deleted line, was not seen by the coverage test. Since round 11 every node on an inserted or changed line of an aligned unit has a census or changed-line row, and every deleted or replaced CA-SEAL line a reviewed record. Guard removal stays with the shared-tool sweep, as before. Alignment is line-based. *(Corrected in round 11, CA2-C11-N03.)* `difflib` keeps the longer side of a move aligned, so the moved lines on that side keep preservation; the shorter side loses it and needs its own rows, and its old position shows up as deleted CA-SEAL lines. When a line is duplicated, `difflib` deterministically maps one copy and the other needs its own outcome. Astra 2, 3 and 5 campaigns were not rerun: the brief named the corpus, the cycle-10 probes and Astra 6's replays, and no killed-by row, cut or validator byte changed. No governance, shard or index check was run; only `reports/` paths changed.

Root disk and RAM passed the 50/6 GB floors before every run (131–137 GB free, 11–17 GB available). Checkers ran one at a time; the corpus peak was about 93 MB. The replay harness caches only immutable revision-qualified Git blobs; the two original-map runs used none. Scratch held 19,177,878 bytes before removal.

Only five round-10 paths change, all under `reports/event-authority-20261105/`: H, the coverage JSON and Markdown, this report and the compact `CA-SEAL2-fix10-results.json`. The validator stays byte-for-byte at `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. No validator, receipt, Plans, Spec Lock, `.evidence`, auto-decision, `.gitignore`, registry or Decision Log edit; no pm-mail, subagent, main push, admission, seal, browser or server. **CA-SEAL2-FIX10 joins the seal-applier exclusion.** Family grades N/A; IDs used none; stopped product questions none. Coordinated landing, actual landers/anchors, real per-name outcomes/depth and unchanged August approval requirements remain integration work.

### Retained round-10 evidence

The compact committed result is `CA-SEAL2-fix10-results.json`. Replay scripts, raw outputs and instructions are retained in E with the input extraction and local-copy manifests and a complete `SHA256SUMS`. Copied inputs, runtime scratch and the worker worktree are removed after the branch push. The report and coverage copies in the parent drafts directory are overwritten with this result.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/baseline.json` | `8dc6ae98347e298da7f1f721af0e4d903e5aaa121b21d0132c20e1cb09cd6c9c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/final-corpus.json` | `b668ba504922f7ae90038f24ffc0e866f672177ba91c89d29a8216bce59aefbc` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/round9-head-corpus.json` | `3276f047d4e11988b343dabda3e1aaaab6f36c771f68be84686b4b49bb33e38d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/preservation-probes.json` | `8d39424912ed25c220c6c1ac1376927fb6a83b6c2ff6dcab8a0035e71fec4183` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/occurrence-audit.json` | `6d80751a93e37e862cf69c10a5cf3771cea1c168b35d65677620ff3f57817ca9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/preservation-rebinding.json` | `e658d93d8da24438cfd00478a35de38d0f7de6d36a9cd07bf8979a02250f4632` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/coverage-probes.json` | `cdfc660fc5774043eadcd2911eb9e77ebb3bee99d632c275b3b1782f94d1873e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/adjacent-probes.json` | `fd78eb67ecb68b77f99a579b3ca9be46d0acd58816be09d8e0902c1647f4a83a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/hidden-predicate-summary.json` | `c643af6b6f444b6f30fc219e09438a554ba8d61ea36a4fb29f888be54500932b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/hidden-predicate-corpus.json` | `5dcc6001e5d03ddaa2750a2f2994ba763dbc9a71dbf820136cbd8c09bdd8991a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/b02-summary.json` | `8fe43d11be62545c9e2814dd95c6716d04dcd40f13821d125b96c3e2799e756d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/history-audit.json` | `2047c2bea36e370ec966771f760a21b6425936848b6c37048131cd85a8c3b078` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/data-flow-audit.json` | `72df40621edb7126043f9a3f617e897b73f81dbd2fdab64f124de8531378751b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/extraction-manifest.json` | `19225d52dfaf0276c433b1532ff74183f25e0128d90c439c55cbdd6ae0c3827e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/local-map-manifest.json` | `a52c38fb7baf273d950e81750cc5ca3ab018b0178119a272385c9a8981aa7510` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/extraction-restoration.json` | `a20a69b4cdf0112bfd2c8f9c1ec6c4ee27325d44a87c0e5c88d72c2afcc5b92f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix10/cleanup.json` | `acf5636c3925442256b0ab865e27749cfdaa2df729ee9cbb890e51441d415f5e` |

## Recheck cycle 11: findings and responses

Round-11 worker: **CA-SEAL2-FIX11** (brief approved with option A for N02). Read the FIX11, FIX10 and FIX9 briefs and the blind Opus pre-check `reviews/CA-SEAL2-sol/REVIEW-cycle11-opus.md` with its evidence `cycle11-opus/` (especially `scope-probes.json`, `augassign-hidden-builder.json`, `augassign-corpus-summary.json`, `independent_map.py` and `scope_probes.py`). This is a tests/fixtures/records change from `715b7c1506dee7a4831110424bc620a58743cc16`, with no rebase. The code is in **`ef462bc5b52714f088aef1142af3fb89cc0d4b92`** (operator census, class table, changed-line rows, historical-line records, line counting) and **`babeb1b4f75281c7d8afb851e63f43e877094160`** (fresh-name rule, probe forging); the replay evidence, this section and the two corrected round-10 limit sentences are in the record commit. `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`, `V` the frozen validator, `E` `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/`.

| Finding | Location and cause | Fix and verification |
|---|---|---|
| **CA2-C11-B01 — fixed** | `supplement_nodes()` listed bitwise And, Or and Xor only as `ast.BinOp`, so `x \|= y` (an `ast.AugAssign`) had no row. The pre-check's hidden builder `overall_pass \|= {"review_extra": False, **named}["review_extra"]` passed coverage and the full corpus while turning a failing receipt into `pass: true`. | `H:319` dispatches every node on its exact AST class (`CENSUS_RULES`, `H:288`), and `BinOp`, `AugAssign` and `UnaryOp` also on their operator's class (`H:299`, `H:311`), wherever they occur: a truth-carrying operator yields `BinOp(<op>)` or `AugAssign(<op>)`. `H:52–131` is a complete table of Python 3.14.4's 133 `ast` node and operator classes, each truth-carrying, data, structural or refused when present. `H:353` regenerates the class list from the running `ast` and refuses an unlisted class, a stale entry on the recorded minor version, a truth-carrying class without a census mechanism, a census rule for a class not marked truth-carrying, and any refused class anywhere in V; `validate_coverage()` runs it first (`H:843`). `census_totals()` (`H:738`) counts every operator occurrence by the node holding it and the test requires zero truth-carrying occurrences outside a census row. |
| **CA2-C11-N02 — fixed (option A)** | The inventory covered census node types only, so a changed statement without one (`anchors = anchors[:1]`, `actual_ets = expected_ets`, `continue`) or a deleted guard changed what a preserved predicate does with no identity. | `aligned_units()` (`H:525`) aligns each aligned function and the module body outside top-level functions (`<module>`) to CA-SEAL and marks lines inserted, changed, deleted or replaced (`H:504`). `changed_line_inventory()` (`H:582`) requires a row for every node with a source position on an inserted or changed line (a statement by its header span) that does not anchor a census row: data or structural as its class is, with a reviewed reason; a truth carrier there that no census row carries is refused (`H:882`). `historical_line_inventory()` (`H:630`) requires a reviewed record for every CA-SEAL line of an aligned unit without a counterpart, and for every line of a CA-SEAL function that no longer exists. `fresh_name_problems()` (`H:702`, `H:903`) closes the same class at module scope: every name a change binds or mutates there (each top-level function new since CA-SEAL, and every statement on an inserted or changed module line) must be new to CA-SEAL, not a builtin, and bound once. The report's limit sentence (R:817) is corrected in place. |
| **CA2-C11-N03 — fixed** | R:817 said a moved statement loses preservation; `difflib` keeps the longer side of a move aligned. | R:817 is corrected in place: the longer side keeps preservation, the shorter side loses it and needs its own rows, and its old position shows up as deleted CA-SEAL lines (which now need records). |
| **CA2-C11-N04 — fixed** | `str.splitlines()` also breaks on form feed, vertical tab, U+0085 and others; the parser does not. | `source_lines()` (`H:32`) applies universal newlines (CRLF and a lone CR become LF), splits on LF only, and checks the count against the parser with a sentinel statement. The walker, the alignment and every probe use it. Controls: a form feed inside a string (`str.splitlines()` puts the next line one lower; the map now keeps both counterparts) and a lone carriage return. |
| **Same class, found by this worker — fixed** | A top-level `def` lies outside every aligned unit, so a new one could rebind a name unchanged August code reads: `def isinstance(*args): return True` added at module level, with every row forged, **passes the round-10 checker** (`round11-audits.json`). | Refused by the fresh-name rule above: `negative_fresh_function_shadows_builtin`. |

### Complete AST class table (Python 3.14.4)

| Category | Classes |
|---|---:|
| truth-carrying | 37 |
| data | 43 |
| structural | 29 |
| refused when present | 24 |
| **total** | **133** |

The full table, with the reason for each class, is in `CA-SEAL2-coverage.md`. Truth-carrying (37): `Compare`, `BoolOp`, `Call`, `IfExp`, `NamedExpr`, `Assert`, `If`, `While`, `Try`, `TryStar`, `ExceptHandler`, `comprehension`, `match_case`, the eight pattern classes, `And`, `Or`, `Not`, `BitAnd`, `BitOr`, `BitXor` and the ten comparison operators. Refused when present (24): async and generator nodes, `Global`, `Nonlocal`, PEP 695 type parameters and aliases, `TypeIgnore`, 3.14 template strings, deprecated compatibility classes and the non-exec parse roots; V contains none of them. Data (43) and structural (29) are everything else, the 14 abstract grammar categories included (structural). **Arithmetic is the one deliberate exclusion:** on Booleans it returns an int, never a bool, so it does not produce a truth value, though a nonzero result is truthy. On an inserted or changed line of an aligned unit it needs a changed-line row; in a function new since CA-SEAL it is a data operation the corpus has to see. In the 15 touched functions there are 137 arithmetic occurrences (`/` 78, `-` 31, `+` 27, `+=` 1), and none has a Boolean constant, comparison, Boolean operation or negation as a direct operand (`round11-audits.json`).

### Operator census (15 touched functions)

| Operator | Category | Occurrences, by holding node | Carried by a census row | Unanchored |
|---|---|---|---:|---:|
| `And` | truth-carrying | BoolOp 43 | 43 | 0 |
| `BitAnd` | truth-carrying | BinOp 9 | 9 | 0 |
| `BitOr` | truth-carrying | BinOp 3 | 3 | 0 |
| `BitXor` | truth-carrying | 0 | 0 | 0 |
| `Eq` | truth-carrying | Compare 58 | 58 | 0 |
| `Gt` | truth-carrying | Compare 1 | 1 | 0 |
| `GtE` | truth-carrying | 0 | 0 | 0 |
| `In` | truth-carrying | Compare 23 | 23 | 0 |
| `Is` | truth-carrying | Compare 23 | 23 | 0 |
| `IsNot` | truth-carrying | Compare 36 | 36 | 0 |
| `Lt` | truth-carrying | Compare 2 | 2 | 0 |
| `LtE` | truth-carrying | Compare 6 | 6 | 0 |
| `Not` | truth-carrying | UnaryOp 113 | 113 | 0 |
| `NotEq` | truth-carrying | Compare 58 | 58 | 0 |
| `NotIn` | truth-carrying | Compare 14 | 14 | 0 |
| `Or` | truth-carrying | BoolOp 67 | 67 | 0 |
| `Add` | data | AugAssign 1, BinOp 27 | 0 | 0 |
| `Div` | data | BinOp 78 | 0 | 0 |
| `FloorDiv` | data | 0 | 0 | 0 |
| `Invert` | data | 0 | 0 | 0 |
| `LShift` | data | 0 | 0 | 0 |
| `MatMult` | data | 0 | 0 | 0 |
| `Mod` | data | 0 | 0 | 0 |
| `Mult` | data | 0 | 0 | 0 |
| `Pow` | data | 0 | 0 | 0 |
| `RShift` | data | 0 | 0 | 0 |
| `Sub` | data | BinOp 31 | 0 | 0 |
| `UAdd` | data | 0 | 0 | 0 |
| `USub` | data | 0 | 0 | 0 |

Census rows by node type are unchanged: `BinOp(BitAnd)` 9, `BinOp(BitOr)` 3, `BoolOp` 110, `Call` 891, `Compare` 219, `If test` 171, `IfExp` 17, `Try dispatch` 6, `UnaryOp(Not)` 113, `comprehension if` 38, `except alternative` 29, `except dispatch` 6, `parser callback` 5; `AugAssign(BitAnd)`, `AugAssign(BitOr)`, `AugAssign(BitXor)`, `BinOp(BitXor)`, `NamedExpr`, `Assert`, `match case`/`guard`, `While test` and `TryStar dispatch` 0. The whole validator has two bitwise AugAssigns, `emit |= set(...)` at V:600–601, in `validate_holding_bucket`, which is AST-identical to CA-SEAL and outside the touched-function census like every other untouched August statement.

### Changed lines and deleted lines (N02, option A)

| Aligned unit | Inserted lines | Changed lines | Deleted CA-SEAL lines | Replaced CA-SEAL lines | Changed-line rows |
|---|---:|---:|---:|---:|---:|
| `multi_family_receipt_state` | 0 | 1 | 0 | 1 | 5 |
| `post_august_validator_pin` | 0 | 1 | 0 | 1 | 3 |
| `main` | 18 | 0 | 0 | 0 | 81 |
| `build_receipt` | 10 | 0 | 0 | 0 | 49 |
| `<module>` | 43 | 0 | 0 | 0 | 52 |
| **total** | | | **0** | **2** | **190** |

The **190 changed-line rows** are data 189, structural 1; by class Assign 29, Attribute 8, BinOp 2, Constant 46, Dict 1, Expr 1, If 1, Import 3, Name 78, SetComp 2, Subscript 15, Tuple 1, alias 3. Each reason is a role phrase for the node, the reviewed reason of its statement, and the census rows of that statement that are not preserved, with their outcomes (`E/update_coverage.py` holds the reviewed statement text). 34 further nodes on those lines anchor census rows. The **2 historical-line records** are CA-SEAL lines 222 (`multi_family_receipt_state`) and 263 (`post_august_validator_pin`), both replaced in place by V:225 and V:266; V deletes no CA-SEAL line and removes no CA-SEAL function. The module-level changes are additions only: 3 imports and 14 constants, all names that CA-SEAL never binds or reads, read only by the 11 new functions; those 11 function names are new as well, so the fresh-name rule passes on V. An independent view (`git diff --no-index --patience` hunks and a set-based header walk written in `E/round11_audits.py`) reaches the same 190 rows and 34 anchors, finds no node without a row, and finds exactly the two removed CA-SEAL lines.

### Regression probes (each must fail coverage)

`H:1265` `edit_probe()` edits a scratch copy of V, carries every row's line metadata through a whole-file alignment (`rebase_lines()`, `H:959`), forges every row except the probe's own identities in the group under test (`forge_census()`, `forge_records()`), and regenerates every count (`refresh_totals()`, `H:810`). So the refusal names exactly the probe's identities, whatever else the table lacks. All run in the committed corpus.

| Probe (corpus test `negative_…`) | Edit | Refusal |
|---|---|---|
| `census_augassign_bitor` | the pre-check's plain probe: `state['complete'] \|= True` before `recount_validation`'s return | `coverage sites missing=` exactly its `AugAssign(BitOr)` row |
| `census_augassign_bitand`, `census_augassign_bitxor` | the same with `&=` and `^=` | exactly its `AugAssign(BitAnd)` / `AugAssign(BitXor)` row |
| `census_hidden_builder_bitor` | the pre-check's hidden builder, `overall_pass \|= {"review_extra": False, **named}["review_extra"]` after the round-9 gate, with its changed-line rows forged | exactly its `AugAssign(BitOr)` row |
| `census_hidden_builder_bitand`, `census_hidden_builder_bitxor` | the same with `&=` and `^=` | exactly its `AugAssign(...)` row |
| `changed_truncated_input` | `anchors = anchors[:1]` before the preserved guard in `post_august_validator_pin` | `changed-line nodes missing=` its 6 nodes |
| `changed_rebound_input` | `actual_ets = expected_ets` before the preserved partition comparison in `main` | its 3 nodes |
| `changed_inserted_continue` | `continue` at the top of the partition loop | its `Continue` node |
| `deleted_preserved_guard` | the preserved `if actual_ets != expected_ets:` block deleted in place | `historical lines missing=` its 9 CA-SEAL lines |
| `changed_module_rebinding` | `POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT` at module level | `changed-line nodes missing=` its 3 nodes |
| `changed_module_truth_carrier` | `PM_PROBE = isinstance(HOME, Path)` at module level | `truth-carrying node on a changed line without a census row` (the call) |
| `fresh_module_rebinding` | the module rebinding with every row forged | `module-level binding is not fresh`: binds a CA-SEAL name, bound twice |
| `fresh_module_mutation` | `HOLDING_DECISIONS["DL-039"] = None` with every row forged | mutates an object that is not new |
| `fresh_function_shadows_builtin` | `def isinstance(*args): return True` at module level with every row forged | binds a builtin name |
| `refused_class_present` | `global PM_PROBE` as `recount_validation`'s first statement | `ast class table`: refused `Global` present |
| `ast_class_removed` | synthetic: `AugAssign` removed from the class table (V and table unchanged) | missing from the table, and refused when present (V uses it) |
| `ast_truth_class_without_rule` | synthetic: `Subscript` marked truth-carrying | truth-carrying class without a census rule |
| `ast_rule_for_data_class` | synthetic: `Call` marked data | census rule for a class not marked truth-carrying |

`positive_ast_class_table` checks the running class list against the table, the recorded version and V's classes. The grammar control adds `&=`, `|=`, `^=` (one census row each), `+=` and `-` (none: the arithmetic exclusion), `while` and `except*`, and requires zero unanchored truth-carrying operators. The alignment control adds the line marks, changed-line rows and historical-line records of its synthetic edit (a removed function included), the form-feed and lone-CR controls, a deleted and a changed decorator, and module-level insertion, truth carrier and deletion. Every earlier probe still fails: Astra 6's three insertion controls (`negative_unlisted_*`), FIX10's five forged tables (`negative_preserved_*`) and the cycle-10 and cycle-11 replays below.

### Fresh replay results and limits

- **Corpus:** a fresh process on byte-verified scratch copies of `babeb1b4f7`, with the original supplied source map and no replay caches: exit 0, **220/220**, all **597/597** source hashes and lengths verified. The worktree's original-map run is also 220/220 (`final-corpus.json`). All 200 earlier test names remain and their result records are identical to round 10's; 20 tests are new (`positive_ast_class_table` and 19 negatives).
- **Cycle-10 probes (`probes.py`):** Astra 6's five insertions each fail coverage with one missing and zero stale identities, and scratch bytes are restored; the ten adjacent insertions fail with missing counts **1,1,1,1,2,2,2,2,1,1**; the rebinding witness fails at `preserved occurrence mismatch`. These three outputs are byte-identical to round 10's.
- **Astra 6 hidden builder (`| isinstance`) on scratch disk:** coverage refuses it (three missing census rows); the full corpus is **219/220**, failing only `positive_complete_predicate_coverage`; scratch bytes restored exactly.
- **Cycle-11 hidden builder (`|=`, `&=`, `^=`) on scratch disk (`hidden_augassign_replay.py`):** the round-10 checker **accepts** all three after a metadata-only rebase, which reproduces CA2-C11-B01; the round-11 checker refuses each with exactly its `AugAssign(...)` row missing. With the `|=` form installed, the full corpus is **219/220**, failing only `positive_complete_predicate_coverage`. The direct witness still flips `pass` from false to true with the trigger and leaves it false without it, which is the perturbation coverage now catches, not an intact approval bypass. Scratch bytes restored exactly.
- **Pre-check scripts (`cycle11/`, scratch root only changed):** `c10_witness.py` refuses all three variants as before. `scope_probes.py`, whose rebase moves only the `sites` and `supplement` rows: the three N02 statement probes and the deleted guard now fail coverage (each at `changed-line nodes missing`, since that rebase does not carry the new rows; the committed probes, which do, refuse them at their own rules), and the `|=` probe fails with its `AugAssign(BitOr)` row missing. `probes.py`: the map's verdicts on all 21 occurrence probes are identical to the pre-check's; through `full_rebase.py`, which also carries the changed-line rows, 19 fail coverage (17 at `changed-line nodes missing`, `except_header_widened` at `historical lines missing`, the two same-name copies on stale changed-line rows) and the two that pass add only a comment line or a blank line, which carry no node. `synthetic.py`: both form-feed cases now map correctly (no refused genuine node, no shifted claim). `independent_map.py`: 1,126 eligible nodes, identical counterparts, nothing only on one side. `real_dataflow.py`: no unflagged writer feeds a preserved predicate. `round9_accepts.py`: FIX10's five tables pass round 9 and fail the current checker. `augassign_hidden.py`: part A now fails coverage with its `AugAssign(BitOr)` row missing; parts B and C (in memory) are unchanged: the witness flips, and the in-memory corpus is 220/220, because coverage reads the bytes on disk. `augassign_corpus.py` (plain `|=` in memory): 211/220, the same nine `negative_aggregate_*` failures.
- **FIX10's five tables (`preservation_probes.py`):** each passes the round-9 checker and fails the round-11 one at the occurrence check; the one-category cuts behave as in round 10 (sole claim, changed occurrence and changed header pass only without the not-an-unchanged-occurrence category), because the forger now also forges the round-11 rows.
- **Audits:** `occurrence_audit.py` 620/620 rows on their own counterpart and on the recheck's whole-file line map; `history_audit.py` zero provenance mismatches; `data_audit.py` all 744 data-flow consumers resolve. `round11_audits.py`: the independent changed-line view, the arithmetic audit and the shadowing-def witness above.
- **Committed rows:** the same **1,944** site ids with no field changed (identity, outcome, reason, evidence) and **0 new truth-carrying rows**. The table gains 190 changed-line rows, 2 historical-line records, `totals.census`, `totals.changed_line_nodes`, `totals.historical_lines`, `totals.occurrence_map.line_marks` and `removed_functions`, the `ast_classes` summary, schema `v5` and an extended completeness claim. No row needs a new evidenced outcome.

**Limits.** The truth census covers the 15 touched functions; untouched functions are AST-identical to CA-SEAL. Option A covers the aligned units: the four aligned functions and the module body. In the 11 functions new since CA-SEAL nothing is preserved and every truth-carrying node has its own evidenced outcome; a data-only statement inserted there (an arithmetic or plain assignment) is seen by the corpus, not by the coverage test, and the hidden-builder witness shows the corpus need not see it. Arithmetic is excluded from the truth census by a written, reviewed decision, not by proof. The class table is built for Python 3.14.4; on another minor version every running class must still be in the table, and stale entries are tolerated. Guard removal stays with the shared-tool sweep, as before. B02 cuts and the Astra 2, 3 and 5 campaigns were not rerun: the brief named the corpus, the cycle-10 and cycle-11 probes and Astra 6's replays, and no killed-by row, cut or validator byte changed. No governance, shard or index check was run; only `reports/` paths changed.

Root disk and RAM passed the 50/6 GB floors before every run (118–130 GB free, 9–27 GB available). Checkers ran one at a time; the corpus peak was about 168 MB and a run takes about 4 minutes. The replay harness caches only immutable revision-qualified Git blobs; the original-map runs used none. Scratch held 20,762,945 bytes before removal.

Only five round-11 paths change, all under `reports/event-authority-20261105/`: H, the coverage JSON and Markdown, this report and the compact `CA-SEAL2-fix11-results.json`. The validator stays byte-for-byte at `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. No validator, receipt, Plans, Spec Lock, `.evidence`, auto-decision, `.gitignore`, registry or Decision Log edit; no pm-mail, subagent, main push, admission, seal, browser or server. **CA-SEAL2-FIX11 joins the seal-applier exclusion.** Family grades N/A; IDs used none; stopped product questions none. Coordinated landing, actual landers/anchors, real per-name outcomes/depth and unchanged August approval requirements remain integration work.

### Retained round-11 evidence

The compact committed result is `CA-SEAL2-fix11-results.json`. Replay scripts, raw outputs and instructions are retained in E (`README.md`, `COMMANDS.md`) with the input extraction and local-copy manifests and a complete `SHA256SUMS`. Copied inputs, runtime scratch and the worker worktree are removed after the branch push. The report and coverage copies in the parent drafts directory are overwritten with this result.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/baseline.json` | `6b4fd8eb0837ef91202d72b008edb423fa1806adaf66bab9a0c528042a7de6b0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/final-corpus.json` | `088cb3557d24ff630638857cee21b0d27b1de38d044a0f015448a23c64ff4bbc` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/precommit-corpus.json` | `6b4fd8eb0837ef91202d72b008edb423fa1806adaf66bab9a0c528042a7de6b0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/update_coverage.py` | `810a02357baf7fb6a446fd7bc843d47c9c804400318aba596677aa073c38592c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/round11-audits.json` | `558665e49ce9601a9b8b5abaf7a7c3f51f02e348c9a1046355e84bec797bdf15` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/hidden-augassign-summary.json` | `df510565be253d7f4100b74ee4835579c7e476743ea2e6c1f1aaf00cbbdc370c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/hidden-augassign-corpus.json` | `446a32e791cbb14eb42710408bc342fc50fb7ccb63f4e76b27f59cf72585f433` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/hidden-predicate-summary.json` | `e6a8e50813e854a3dbfb53d3b4604986e3b03f0e8a0e434de9566bab4790c21d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/hidden-predicate-corpus.json` | `598d4356632ebc397405f098f64b98098188cba5be7be85529e64facb3f5d5a5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/coverage-probes.json` | `cdfc660fc5774043eadcd2911eb9e77ebb3bee99d632c275b3b1782f94d1873e` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/adjacent-probes.json` | `fd78eb67ecb68b77f99a579b3ca9be46d0acd58816be09d8e0902c1647f4a83a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/preservation-rebinding.json` | `e658d93d8da24438cfd00478a35de38d0f7de6d36a9cd07bf8979a02250f4632` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/preservation-probes.json` | `986932b4a7912c5baf76a8f688e462ca88cf0c0ed4afa6f66ddd31097b824c06` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/scope-probes.json` | `c6756594290b97bf81e5135d59ebbcdb8cbfd28d2202b5811c62123a49f2f2db` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/occurrence-probes.json` | `b15682d642ebed3f6c5c490a9e01ad15dbd6d3a7e1a275f196141e5ce4bebd72` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/occurrence-probes-full-rebase.json` | `f1bea37cb0d14072d48781c562634cabb4858cef493d0d185afbf4d6ab7d729d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/augassign-hidden-builder.json` | `0c1e4fea9cfa7db4454cc86b5fa244c6dbc28aaf68c720dfd512f6accd7544ca` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/augassign-corpus-summary.json` | `f7ce6aae4ad1d03417e44b362a808acf81f3bd8c0b1e5f4dca2adc3f4eec6365` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/independent-map.json` | `c05eb5c98c3dc01fe242fff00eb69ebaa0324d2993ab73c27dc21e4317dbf426` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/synthetic-map-probes.json` | `311ae2dd830c5dfc745bc7eb74995ab2914bd306037d2abc2c2002c885cebac0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cycle11/c10-witness-replay.json` | `6abc62ed3dd754cf81172aa4c3c14f6b90fe431555a891cbce5f149542086bbd` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/occurrence-audit.json` | `7b634c4891e5ad8b58ea808317fc13c90a8cba5b9a032bcbe58a6b251d707d09` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/history-audit.json` | `2047c2bea36e370ec966771f760a21b6425936848b6c37048131cd85a8c3b078` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/data-flow-audit.json` | `72df40621edb7126043f9a3f617e897b73f81dbd2fdab64f124de8531378751b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/extraction-manifest.json` | `3dc3ffb38f8a37ef3a9349124868e53f20becfeaa45d248a9b2e14d66f844b4b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/local-map-manifest.json` | `bd2f8a584983f6e97a8a9ccd0ab7141f1a878904b15e1022daa1612ee85145c1` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/extraction-restoration.json` | `99a7e224932d3466870819aafd1e3c09d5872f2da027a2c8e8afe73d97b1ac86` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix11/cleanup.json` | `0f9a00f6c33b906f0ec6abf1a09cf00696ac01521931ac27a8f34570e48a150d` |

## Recheck cycle 12: findings and responses

Round-12 worker: **CA-SEAL2-FIX12** (brief approved by pm7-build 07:01Z, with the stopping bar in `reviews/CA-SEAL2-BAR.md`). Read the FIX9, FIX10, FIX11 and FIX12 briefs, the bar, and the blind Opus pre-check `reviews/CA-SEAL2-sol/REVIEW-cycle12-opus.md` with its evidence `cycle12-opus/`. This is a tests/fixtures/records change from `f82245a2631e491d5ec3d7b262599bb56d659dcc`, with no rebase. The code and table are in **`85c5e37b465a0b5335a8052313dbda0c9f18f6dd`** (the total table, the binding rules, N04, N05, the round-12 probes and controls), **`9ff9856c03e86d1752a7bbf4f892af1361e40672`** (the 139 new census rows cite their consumers in full, as the 744 earlier data-operation rows do) **`57d161f483b9c5caa1b90d5bf19a163dd8035464`** (the random-edit control compares the table object it read, not a re-encoding, so a scratch tree that stores the table compactly does not fail it falsely) and **`011e0ea92679631674f34975f259dcab7e1a26af`** (`main`'s seam is found inside the recorded tests); the replay evidence and this section are in the record commit. `H` is `reports/event-authority-20261105/CA-SEAL2-checks.py`, `V` the frozen validator, `F` the frozen validator's bytes at `60913cb906` (SHA-256 `3e98a165…8e72`, the same bytes as `V`), `E` `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/`.

**What changed in one sentence:** the committed table is now total over `V`, so no edit of `V` can pass coverage unless the table changes with it, and with the table byte-identical every edit fails.

| Finding | Location and cause | Fix and verification |
|---|---|---|
| **CA2-C12-B01 — fixed** | The checker keyed functions with `{n.name: n for n in tree.body}` (the last def wins), the corpus imported the module (the last def wins), and a script run binds the def that exists when the main guard runs. A weak def in place and the honest def after the guard escaped coverage and the corpus. Only names new since CA-SEAL were checked for a single binding. | Every module-level name, CA-SEAL names included, must have exactly one binding (`module_scope_problems()`, `H:1112`, over Python's own scope rules, `scope_analysis()`, `H:984`; a deletion counts). The module body may only declare, and CA-SEAL's main guard must be its last statement, so nothing is bound after it. Every name map in `H` comes from `top_functions()` (`H:47`), which refuses a second def. `validate_coverage()` (`H:1391`) checks the bindings before it reads any row (`binding_problems()`, `H:1255`). The corpus checks that the imported module runs the one binding (`positive_imported_bindings_match_ast`: each function object's first line is its def's, and every module name is bound). Probes `negative_binding_duplicate_def_build_receipt` and `negative_binding_duplicate_def_admission_record_problems` (the pre-check's layout, the second padded to the same lines) are refused at `bound_more_than_once` and `not_a_declaration`. V and CA-SEAL pass every rule (`positive_module_scope_rules_on_V_and_CA_SEAL`: 102 and 74 module names). |
| **CA2-C12-B02 — fixed** | Changed-line rows existed only for aligned units; the 11 functions new since CA-SEAL were not units, so a data-only line there (`cards = {"cards": cards, **doc}["cards"]`) added no identity. | Every line of a function new since CA-SEAL is an inserted line (`aligned_units()`, `H:562`), so every node there has a census or changed-line row (1,248 new rows). Every other positioned node of V has a **node row** (`node_model()`, `H:771`), keyed by occurrence (unit, span, class, text) with its computed CA-SEAL line. Census rows, changed-line rows and node rows partition all 10,941 positioned nodes; the 6,048 nodes without a position are of the classes in `POSITIONLESS` (`H:753`), each recorded in a positioned row. Coverage fails on a node without a row, a node with two kinds of row, or an unlisted position-less class. `negative_changed_new_function_dict_spread` is refused with exactly that line's changed-line identities missing. |
| **CA2-C12-N01 — fixed** | Option A's deleted-line rule was measured against CA-SEAL only, so deleting lines added since CA-SEAL (the round-9 gate) left no trace. | The table pins the SHA-256 of every one of F's 2,361 parser lines (`line_pins()`, `H:863`; the coverage test reads F from `60913cb906` and checks its digest, `frozen_source()`, `H:39`). Every current line inserted or changed and every F line deleted or replaced needs a reviewed `frozen_lines` record (`frozen_line_inventory()`, `H:868`); F itself has none. Deletions are now judged against both baselines. `negative_frozen_round9_gate_deleted` is refused with exactly the gate's five deleted records missing; `negative_frozen_comment_inserted` shows that a node-free comment line also needs one. |
| **CA2-C12-N02 — fixed** | The fresh-name rule took root names only, skipped class bodies and function scopes, and counted `import *` as binding `"*"`. | `module_scope_problems()` refuses, with every row forged: an attribute or item write or deletion in any function, lambda, class body or comprehension whose chain starts at a module name, a builtin, an imported module, a call result or a local alias of one (aliases through assignment, displays, `or`, `for`, `with` and parameter defaults); an attribute of a module-level list, dict or set (or alias or element) other than a read-only method; `import *`, class bodies and every other non-declaration at module scope; the namespace builtins (`globals`, `vars`, `locals`, `setattr`, `delattr`, `exec`, `eval`, `compile`, `__import__`, `breakpoint`) and every dunder except `__name__`, `__file__` and `__new__`. Probes: `negative_binding_evidence_fields_truncation`, `…_module_alias_write`, `…_module_class_body`, `…_star_import`, `…_globals_write_new_function`, `…_alias_method_new_function`; the synthetic control has 23 more cases, 4 of them forms that must stay allowed. |
| **CA2-C12-N03 — fixed** | Arithmetic was excluded from the census on the premise that it "does not produce a truth value"; the receipt reads truthiness (`bool(overall_pass)`), and `-` on sets is membership truth. | No excluded class: every operator is truth-carrying (`H:87`, `H:92`) and every `BinOp`, `AugAssign` and `UnaryOp` is a census row wherever it occurs in a touched function, and on the module's changed lines (`module_operator_nodes()`, `H:635`). The written reason is corrected. 139 new census rows, all non-predicate data operations with consumer chains: 80 path joins (two on module line V:810, which were changed-line rows), 27 string, bytes and pattern concatenations, 27 set differences, 3 duplicate counts, 1 line index, 1 list extension. Probes `negative_census_arithmetic_augassign_add` and `…_unary_usub` are refused at exactly their census row. |
| **CA2-C12-N04 — fixed** | `node_text()` blanked every field named like a statement body, so a Lambda or an IfExp on a changed line crashed `ast.unparse`. | `node_text()` (`H:617`) blanks only fields that hold statements, handlers or cases. `positive_total_table_controls` has a Lambda in an aligned function and an IfExp on a changed module line: each gets its row with its full text, and the module IfExp is refused as a truth carrier without a census row. |
| **CA2-C12-N05 — fixed** | The corpus pinned `main` at V:2241 and V:2250, ran `main_flags(True)` outside `record()`, and `insertion_probe()` took the first def while the census took the last. | `main`'s seam is located from the AST of its one binding (the `recount_validation(...)` assignment and the next `fail_errors` assignment, `main_seam()`, `H:3237`), inside the recorded tests, so a validator the checker refuses to model fails those tests instead of aborting the corpus (commit `011e0ea926`); the parent assertion runs inside each negative's `record()` (`H:3284`); every probe reads the one binding through `top_functions()`. |

### Table totals

| Measure | Value |
|---|---:|
| Positioned nodes of V | **10,941** |
| — census anchors | 1,585 |
| — changed-line rows | 1,436 |
| — node rows | 7,920 |
| Nodes without a position (shared operator and context instances, `arguments`, `comprehension`, `withitem`, `Module`) | 6,048 |
| Pinned lines of F (2,360 lines and the empty remainder after the final newline) | **2,361** |
| Frozen-line records | 0 |
| Historical-line records (CA-SEAL) | 2 |
| Walker rows / census rows / combined | 327 / 1,756 / 2,083 |

| Rows by outcome | Walker | Census | Changed-line | Node | **All** |
|---|---:|---:|---:|---:|---:|
| killed by | 233 | 200 | | | 433 |
| preserved August predicate | | 620 | | | 620 |
| frozen-input only | 50 | 38 | | | 88 |
| implied | 20 | 8 | | | 28 |
| same-predicate duplicate | 3 | 3 | | | 6 |
| non-predicate data operation | 16 | 883 | | | 899 |
| structural | 5 | 4 | 129 | 370 | 508 |
| data | | | 1,307 | 6,685 | 7,992 |
| unchanged August truth carrier | | | | 865 | 865 |
| **total** | **327** | **1,756** | **1,436** | **7,920** | **11,439** |

A **node row** is a node unchanged since CA-SEAL: in one of the 24 functions that are AST-identical to CA-SEAL, or on an unchanged line of a unit. Its required outcome is its class's category: data; structural (including a truth carrier whose truth a census row carries, such as an `If` whose test is a census row); or **unchanged August truth carrier**, a new outcome for a truth carrier in code no census covers. The brief says a new row is data or structural; a `Compare` or `Call` in an untouched August function is neither, so it is not labelled as one. Any edit of such a function makes it touched, and the census then needs its own row for that node; on an unchanged module line, an edit puts an operator under a census row and refuses any other truth carrier. The AST class table is now truth-carrying 53, data 27, structural 29, refused when present 24 (133 classes, Python 3.14.4).

**Committed rows.** The **1,944** existing site ids keep every field: identity, outcome, reason and evidence (`CA-SEAL2-fix12-results.json`, `committed_rows`). No existing row changed outcome or identity. 188 of the 190 round-11 changed-line rows are unchanged; the other 2 (`BinOp` path joins on module line V:810) are now census rows, because operators on changed module lines are census rows since N03. The 2 historical-line records and the 84 prior survivors are unchanged. New: 139 census rows, 1,248 changed-line rows (the 11 new functions), 7,920 node rows, 2,361 line pins and an empty `frozen_lines`. Rerunning `E/update_coverage.py` from `f82245a263`'s table gives identical bytes.

### Random single-line edits (the bar's control)

- **Corpus control** (`negative_random_single_line_edits`, `H:2452`, seed 20261106): 200 single-line edits of V, 50 of each kind in turn (insert a copy of another line at the target's indentation; delete; change an operator, literal, name, spacing or comment; swap two adjacent lines), each still parsing, checked against the committed table byte-identical. **200 of 200 fail coverage:** 190 at the frozen-line records and 10 at the binding rule (edits that bind a module name twice or put a non-declaration at module scope), as the replay of the same seed records (`E/random-edits.json`). The table object the check read equals the committed one after every edit, and the file is byte-identical after all 200.
- **Replay** (`E/random_edits_replay.py`, `E/random-edits.json`): the same 200 edits plus 200 more (seed 20261107), 400 in all, 100 of each kind. With the table unchanged, **400 of 400 fail** (379 at the frozen-line records, 21 at the binding rule). The first 200 were also judged under three further tables:

| Table | Fail | Pass | Notes |
|---|---:|---:|---|
| metadata only: line numbers rebased, byte hash and every count regenerated, no row added | **200** | 0 | frozen-line records 190, binding rule 10 |
| metadata only, plus forged frozen-line and historical-line records | 176 | 24 | refused at census rows 118, changed-line rows 27, node rows 18, preservation 3, binding rule 10; every edit that changes the AST and is not a pure deletion fails |
| every row forged with the committed forgers | 40 | 160 | binding rule 10; node rows 30 |

The 24 that pass with only the line records forged are 10 edits that leave the AST identical (comment lines, blank-line moves; two are deletions of a comment line) and 14 pure deletions of a statement line. A deletion removes its nodes, so the rebase drops their rows (3 to 13 rows each) and nothing is missing; as the brief specifies, a deletion is judged by its deleted-line record against F (and CA-SEAL), which is what refuses all 14 in the metadata-only table. The 30 that fail at node rows with every row forged are edits that make an untouched function touched: the rows of its unchanged truth carriers must then change outcome (from `unchanged August truth carrier` to `structural`), and the committed forger keeps existing rows as they are. The 160 that pass with every row forged are reviewed-table changes, which is what Sol max and Astra max review.

### Regression probes (each must fail coverage)

All run in the committed corpus (239 tests). Each edit probe edits a scratch copy of V, rebases every row's line metadata, forges every row except its own identities in the group under test and regenerates every count, so only its rule can refuse; a binding probe forges every row.

| Probe (corpus test `negative_…`) | Edit | Refusal |
|---|---|---|
| `binding_duplicate_def_build_receipt` | weak `build_receipt` (gate replaced by `overall_pass = True`) in place, honest def after the main guard (B01) | `module-level binding refused`: `bound_more_than_once` `build_receipt`, `not_a_declaration` |
| `binding_duplicate_def_admission_record_problems` | weak def returning `[]`, padded to the same lines, honest def after the guard (B01) | the same, for `admission_record_problems` |
| `changed_new_function_dict_spread` | `cards = {"cards": cards, **doc}["cards"]` before `if cards:` in `recount_outcomes` (B02) | `changed-line nodes missing=` exactly that line's nodes |
| `binding_evidence_fields_truncation` | `EVIDENCE_FIELDS[{"pm_fields": 12, **receipt}["pm_fields"]:] = []` in `third_change_validator_pin`, every row forged (B02, N02) | `writes_a_module_object` |
| `frozen_round9_gate_deleted` | the round-9 gate (V:2321–2325) deleted (N01) | `frozen lines missing=` exactly its five deleted lines |
| `frozen_comment_inserted` | a comment line in `sha256_file` (untouched); no node changes | `frozen lines missing=` its inserted line |
| `nodes_untouched_function_respaced` | one space added in `sha256_file`'s lambda line; the AST is identical, so no census or changed-line row exists | `node rows missing=` that line's node rows |
| `census_arithmetic_augassign_add`, `census_arithmetic_unary_usub` | `overall_pass += {…}["review_extra"]` and `overall_pass = -overall_pass` after the gate (N03) | `coverage sites missing=` exactly the `AugAssign(Add)` / `UnaryOp(USub)` row |
| `changed_module_new_constant` | `PM_RECEIPT = MULTI_FAMILY_RECEIPT` at module level | `changed-line nodes missing=` its 3 nodes |
| `binding_module_alias_write`, `…_module_class_body`, `…_star_import`, `…_globals_write_new_function`, `…_alias_method_new_function` | the pre-check's N02 forms, every row forged | `not_a_declaration`, `writes_a_module_object`, `reflection`, `mutates_a_module_container` as each form requires |
| `random_single_line_edits` | 200 seeded single-line edits, table byte-identical | every one refused |

Every earlier probe still fails, and all 220 earlier result records are identical to round 11's: Astra 6's three insertion controls (`negative_unlisted_*`, now with only the inserted line's frozen-line record forged, so the census stays the refusal), FIX10's five forged tables (`negative_preserved_*`), the cycle-10 and cycle-11 probes and FIX11's 19 (`negative_census_*`, `negative_changed_*`, `negative_deleted_*`, `negative_fresh_*`, `negative_refused_*`, `negative_ast_*`). Two of FIX11's now refuse earlier and harder: `negative_changed_module_rebinding` and `negative_fresh_module_rebinding` (`POST_AUGUST_RECEIPT = MULTI_FAMILY_RECEIPT`) are refused as a second binding before any row is read, so the module changed-line control moved to `negative_changed_module_new_constant`; `negative_fresh_module_mutation` also names `not_a_declaration` and `writes_a_module_object`; `negative_fresh_function_shadows_builtin` also names `shadows_a_builtin`.

### Fresh replay results and limits

- **Corpus:** the worktree at `011e0ea926` with the original supplied map: **239/239** (`E/final-corpus.json`). A fresh process on byte-verified scratch copies of `011e0ea926`, no replay caches: **239/239**, all **597/597** source hashes and lengths verified, 7 min 41 s, 343 MB peak (`E/baseline.json`). All 220 earlier result records are identical to round 11's; 19 tests are new.
- **Astra 6 and cycle 10** (`probes.py`): the five insertions written to scratch disk each fail coverage (at the frozen-line records; each has one missing census identity), and scratch bytes are restored. The ten adjacent insertions, with only their frozen-line record forged: nine fail with census identities missing **1,1,1,2,2,2,2,1,1**, and `holder.complete = isinstance(issues, list)` is now refused earlier, by the write rule (`holder` is unbound, so it resolves to module scope). The rebinding witness fails metadata-only at the frozen-line records, and with every record forged at `preserved occurrence mismatch`.
- **Astra 6 hidden builder on scratch disk** (`hidden_replay.py`): coverage refuses it; the full corpus is **236/239**, failing `positive_complete_predicate_coverage` and the two frozen-line probes, whose exact-record assertions see the extra line because V on disk is edited. The one-input witness still flips `pass` (V's behaviour, which coverage now refuses). Scratch bytes restored exactly.
- **Cycle-11 hidden `|=`, `&=`, `^=` on scratch disk** (`hidden_augassign_replay.py`): round 10 accepts the `|=` form; round 12 refuses all three metadata-only at the frozen-line records, and with the line records forged at exactly the form's `AugAssign(...)` census row. With `|=` on disk the corpus is 236/239, the same three failures. The direct witness flips only with the trigger. Restored.
- **FIX10's five tables** (`preservation_probes.py`): each is accepted by round 9, judged on the same forged table restricted to round 9's census (139 rows fewer, since round 9 reads the new operator rows as stale), and refused by round 12 at `preserved occurrence mismatch`; the single-category cuts behave as in round 11.
- **Cycle-11 scripts** (`cycle11/`): `c10_witness.py` refuses all three variants; `synthetic.py` as in round 11; `independent_map.py` 1,223 eligible nodes on both sides (1,126 in round 11; the new operator census rows), identical counterparts; `real_dataflow.py` no unflagged writer feeds a preserved predicate; `scope_probes.py` 6/6 fail; `probes.py` and `probes_full_rebase.py` **21/21 fail** (18 at the frozen-line records, and the 3 same-name copies refused by the binding rule; round 11 let the comment-line and blank-line cases pass); `augassign_hidden.py` part A fails, parts B and C (in memory) unchanged: the witness flips and the in-memory corpus is 239/239, because coverage reads the bytes on disk; `augassign_corpus.py` (in memory) 230/239, the same nine `negative_aggregate_*` failures as round 11. `round9_accepts.py` now shows round 9 refusing the forged tables (it reads the operator rows as stale); the restricted comparison above is the round-9 result.
- **Cycle-12 scripts** (`cycle12/`, the pre-check's own): `truth_probes.py` **42/42 fail** metadata-only (37 at the frozen-line records, 5 at the binding rule); with every row forged the 5 dunder and metaclass forms still fail and 37 pass. `layout_probes.py`: **all ten duplicate-def layouts** (five names, moved and added) are refused at `bound_more_than_once`; `layout_witness.py` shows the script run still binding the weak def, which is the edit's behaviour that coverage now refuses. `scope_probes.py` **36/36 fail** metadata-only (23 frozen-line records, 13 binding rule); with every row forged the 13 still fail and 21 pass (2 have no forged run). `deletion_probes.py`: the round-9 gate, the `main` fold and both together fail at the frozen-line records (5, 1 and 6 records). `class_table.py` as in round 11 (133 classes, now 53/27/29/24). `newfn_witness.py` and `neutral.py`: every variant fails metadata-only.
- **On-disk corpora of the pre-check's four edits** (`ondisk_corpus.py`; pre-check results 220, 220, 220 and 219 of 220): `cards` dict spread **236/239**; `EVIDENCE_FIELDS` truncation **203/239** (every probe that models V meets the write rule); padded duplicate `admission_record_problems` **189/239**; duplicate `build_receipt` **189/239** (coverage, the import-binding positive, the eight `main` seam tests and every probe that models V refuse it).
- **Audits:** `node_audit.py` (independent of the checker's inventory code): all 10,941 positioned nodes covered exactly once, every node row's start line is its cited CA-SEAL line by text, the pins equal F, and every node row's outcome is its class's category. `occurrence_audit.py` 620/620; `history_audit.py` zero provenance mismatches; `data_audit.py` all 883 data-flow consumers resolve to the actual AST.
- **Replay-script adaptations** (listed in `E/README.md`): scratch roots; the cycle-11 scripts run without `-I` so they find their harness; replay scripts that called the checker's model on a source defining a name twice now record that refusal instead of aborting; the round-9 comparison uses round 9's own census. The other replays ran at `57d161f483`; between it and `011e0ea926` only `run()` changed (where it finds `main`'s seam, which matters only for a validator with a name defined twice), and every run that can meet such a validator (the two duplicate-def on-disk corpora, the cycle-11 occurrence scripts and the cycle-12 layout scripts) was rerun at `011e0ea926`.

**Limits.**
- **What the bar rests on.** With the table unchanged, any edit fails at the frozen-line records (or earlier); with only metadata updated, it fails there too. Past that, a table that forges reviewed rows can carry any edit: that is a visible table change, which is what Sol max and Astra max review. The replay's `every_row_forged` column says which edits only the binding rules refuse.
- **Binding rules.** Mutation of a module object through a call that receives it (`list.clear(EVIDENCE_FIELDS)`, a helper that mutates its argument) or through a call's result is not refused: it is a call, so it always needs a census row (and its function a changed-line or census row for every node), but no rule refuses it with the rows forged. Aliases are followed through assignment, displays, conditional and Boolean expressions, `for`, `with` and parameter defaults, not through calls.
- **Node rows** record that a node is unchanged since CA-SEAL; they make no claim about what unchanged August code does, which CA-SEAL's own review covers.
- **The frozen validator is a constant of the checker** (`FROZEN_COMMIT`, `FROZEN_SHA`). A later, approved edit of V keeps F as the reference and lists the diff in `frozen_lines` until the checker is re-pinned.
- The class table is built for Python 3.14.4, as before. Guard removal stays with the shared-tool sweep. No governance, shard or index check was run; only `reports/` paths changed.
- The table is now about 10 MB (11,439 rows, 2,361 pins); round 11's was 3 MB.

Root disk and RAM passed the 50/6 GB floors before every run (100–110 GB free, 10–22 GB available). Checkers ran one at a time; a corpus run takes about 8 minutes and peaks near 365 MB. Scratch held 117,996,684 bytes before removal.

Only five round-12 paths change, all under `reports/event-authority-20261105/`: H, the coverage JSON and Markdown, this report and the compact `CA-SEAL2-fix12-results.json`. The validator stays byte-for-byte at `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`. No validator, receipt, Plans, Spec Lock, `.evidence`, auto-decision, `.gitignore`, registry or Decision Log edit; no pm-mail, subagent, main push, admission, seal, browser or server. **CA-SEAL2-FIX12 joins the seal-applier exclusion.** Family grades N/A; IDs used none; stopped product questions none.

### Retained round-12 evidence

The compact committed result is `CA-SEAL2-fix12-results.json`. Replay scripts, raw outputs, step logs and instructions are retained in E (`README.md`, `COMMANDS.md`, `replay-steps.log`, `logs/`) with the extraction and local-copy manifests and a complete `SHA256SUMS` (127 files). Copied inputs, runtime scratch and the worker worktree are removed after the branch push. The report and coverage copies in the parent drafts directory are overwritten with this result.

| Evidence path | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/final-corpus.json` | `3958fc868c2562de6db61d631a2fd79a3e76e9a9f68a74870d92a0b763fcf0bb` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/baseline.json` | `01ce3d514f8dc12c5c05046653d62ae648c14e54aef17d17035c0550d9864406` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/precommit-corpus.json` | `01ce3d514f8dc12c5c05046653d62ae648c14e54aef17d17035c0550d9864406` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/update_coverage.py` | `06d0ebaab6b0cc7ad9213cf8ff89468b255dca6069007a3ab9899361f65dc631` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/write_coverage_md.py` | `bf81e8810340bf4318a58b84d896f74a422199f2dda1d597aa12e3a2d84bd83b` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/random-edits.json` | `0b8bc3a6e6cc32dd7f1487bed2deef51e01d5489e1435eb6bd73e235af1f7588` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/random_edits_replay.py` | `cc33d661db6edb064c10ed9620ce13c87f915a753c0364c2b16c179aefe27a9d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/node-audit.json` | `68ee495cdc09e6a52f170567ab45b52768a7df0eaafded7671ed13a8859fbb8d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/node_audit.py` | `bc3401969fbaca6ef0e8c51cdef15fa36ab28fdff168fcdc1107da2d00c9e0e5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/coverage-probes.json` | `b64bba256e056e55fec57e0d7fac9815cb0238e61f4d4fbbd7223ac373c19208` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/adjacent-probes.json` | `00a55561e8d819d0c8dccfd72c484e6746bbecd7f3b70678ba8870c07fcb34a3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/preservation-rebinding.json` | `cde211cb47f84c0ac90b188d3f983ac17839fa47e637b9aff57a4aa9f48fc087` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/hidden-predicate-summary.json` | `d66ce6e6e5bb0b9504d835fe65bd0717b652dd5383a051ca54aeece20f9ed8b9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/hidden-predicate-corpus.json` | `dc809c380e7c5aca05e60f7622d9b0daeff44a2bf5719514c63ea4a88a7cb16c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/hidden-augassign-summary.json` | `b4352a43f18a05a07721172cb01e760b7cde2aa3e8de129370ca043647996967` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/hidden-augassign-corpus.json` | `855f7ae48bc1f8fd86ba7141b9dec88689e998eaee34eda34666642c831c4577` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/preservation-probes.json` | `67358765b14fdec5684377eef52a46cffd63dfea91f33103a52fd386b3aeb17f` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/occurrence-audit.json` | `52bb2c5fb944242b79f2f685a62ee3735464632db32f7b8d9ed587d798d32514` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/history-audit.json` | `2047c2bea36e370ec966771f760a21b6425936848b6c37048131cd85a8c3b078` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/data-flow-audit.json` | `67235503648b3742e151fd1bc159af33f060fd72b20feddbb70f7e9c777d3718` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle11/out/occurrence-probes.json` | `86f7af94589a0b793f5bbefdf50c4ce22183a9fe909fd7df43637f5230c8e8cf` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle11/out/occurrence-probes-full-rebase.json` | `86f7af94589a0b793f5bbefdf50c4ce22183a9fe909fd7df43637f5230c8e8cf` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle11/out/scope-probes.json` | `1ad5f8f6811a63c3ea08fa481d7ab1d14cefa8af216080cd92630eece146a000` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle11/out/independent-map.json` | `767ceeba581be4cb587ee2bca9d9a0f571abc1e4d70f075d46c228d58d85bbf8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle11/out/augassign-hidden-builder.json` | `7c5e86d4c297a9f2bd29a98332975bcbdbd8b282450c01093587a3d7051c5547` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle11/out/augassign-corpus-summary.json` | `5b104865c23da58678f4184e1d11b9f5722e164074f841d4a37ea66aebf8c256` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/truth-probes.json` | `73fce6cf96a310f98ad0cd194e6ebab0eee99f9586400cfbffe93aa7ba909325` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/scope-probes.json` | `22b257bdc9339edd17a0a3a721d09f954b4988c44b012b0c8a3f463e9caf56ca` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/layout-probes.json` | `86b7028021dc1b9239db26e87f576d39d7ff7ca9accbec5b544ef00d48d90724` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/layout-script-witness.json` | `49b4af00f38dfec434492d4a44fa57a194390aa1c4f1bace28fd595f46df58e3` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/deletion-probes.json` | `74104d71da68c253f083ed3b573d8fd14f75ae304b9db2b50f53290cd9fb450a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/newfn-witness.json` | `43594c0d398d05b45a77f3e867747bfe5a8f94c745b5e6bd7686816e88c7757d` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/ondisk-corpus-newfn_cards_dict_spread_neutral.json` | `61ca5ef177008562f79407ca7c65111e5556dfee91d1591e25ef861fb5707746` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/ondisk-corpus-newfn_evidence_fields_neutral.json` | `092651d2c377a0118881ca21d5472bf824b16851db4ba42c1d21fbab8e721391` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/ondisk-corpus-duplicate_def_admission_record_problems_padded.json` | `31bbd665c01855623f327bdb5790d2ad717ffb4fb728c4585c86fd355543ab57` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cycle12/out/ondisk-corpus-duplicate_def_build_receipt_move.json` | `97d16d8b9edcd3a73309c74b87e005a49a3a2f3058c5ba8307eec88d829b418c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/replay-steps.log` | `00587c3c65dac56aa9fe4d8e25d3526e8ce01f2f32323ad89c480b0f9b890f88` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/extraction-manifest.json` | `c683ab9d8ad8083fc3a1b609844806d43bf86dd4d5afd526a10373c69494db55` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/extraction-restoration.json` | `e84d371323833d2dd9742361af6ce836ac6cf4981ad444a6bd1ff3b64e6a4f0a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/fix12/cleanup.json` | `72b5608c5eccdcd29917b0873ea36ff58cb6d197276f5de75dc97c3611b8c0ad` |

## Recheck cycle 13: findings and responses

The blind Opus pre-check of round 12 ran under pm7-build's stopping bar (`reviews/CA-SEAL2-BAR.md`, ruling of 2026-11-06 07:01Z). Its review is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/CA-SEAL2-sol/REVIEW-cycle13-opus.md`. Its verdict was NOT_READY, on one REAL finding of LOW severity. It found nothing INVISIBLE.

**How the pre-check ran.** A safety classifier stopped the reviewer while it wrote its own random-edit generator. The lead then ruled: no edit generator, and no new code that edits the validator. Some checks were therefore done by reading. The edit counts come from the committed control: 200 edits in the corpus, 600 through its count option, and the round-12 worker's 400-edit replay. All three runs failed coverage on every edit, with the table byte-identical. The runs overlap: the 600-edit run includes the corpus's 200, and the replay reuses the corpus control's seed. So these are 1,200 edit runs, of which at most 1,000 are distinct edits (R01 recheck note F01, `reviews/CA-SEAL2-sol/REVIEW-r01-opus.md`). By reading, the comparison of the table's `validator_sha256` with the validator's bytes means no edit can pass while the table is unchanged.

### R01 (REAL, LOW): two census reasons named the wrong kind of value. Fixed.

Two of the 27 rows that share the set-difference reason said their set holds "event, token or error identities". It holds neither:

| Row | Site | What the set holds |
|---|---|---|
| `supplement:020441ddf29cb97ca912cb07e8bae04d189034772f9b7deb140982c861c2883d` | `recount_frozen_inputs`, V:968, `set(doc['locations']) - set(inputs)` | recount source names listed in the explicit source-locations map but absent from the pinned receipt's `inputs` map |
| `supplement:f9feecf223053950a6d0f3e576eb46dba703385e8f4df0632252c850bdb7c090` | `main`, V:1805, `required_decision_ids - present_ids` | owner-decision IDs that are required but absent from the owner decision sheet |

**Fix:** those two `reason` strings now name what each set holds. The rest of each reason is unchanged: the consumer, and the census row through which membership truth reaches a decision.
- **What did not change:** every other field of both rows, all other 11,437 rows, the 25 other set-difference rows (the review checked them and found them right), every outcome, every data flow, the census, the line pins and the validator.
- **The diff:** two lines of `CA-SEAL2-coverage.json`. `CA-SEAL2-coverage.md` does not print reasons, so regenerating it gives the same bytes.

**After the fix:**
- **Corpus:** a fresh run against this tree with the original supplied source map gives 239/239, exit 0, in 7:38 with a peak of 330 MB.
- **Validator:** SHA-256 `3e98a1651ec84de58bd101d8a45319fb6b1101598a144a08f4b4cb965ea48e72`, unchanged.
- **Coverage table:** SHA-256 changes from `04aa0cdf5aaf1a4d8c693230ae18bf046a47c4fad67a0e11ec6bbc79122d6c89` to `cb63253108aa84c347b44fb378e4ba67ce486c5efde311f7e36850d21a6e373f`.
- **Record files:** `CA-SEAL2-fix12-results.json` keeps its round-12 hash as the historical record.

### HYPOTHETICAL findings H01 to H06: on TOOL-ISSUES, under the bar's first term

pm7-build's bar requires hypothetical findings to be fixed in batches, not only noted. These six are on `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/TOOL-ISSUES.md`: H03 as T44, and H01, H02, H04, H05 and H06 as T45. None of them can pass with the table unchanged.

### Evidence

`/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/CA-SEAL2/r01/` holds:
- `coverage.diff`: the two-line change;
- `run_corpus.py`, `corpus.json`, `corpus.log` and `corpus.time`: the corpus run.
