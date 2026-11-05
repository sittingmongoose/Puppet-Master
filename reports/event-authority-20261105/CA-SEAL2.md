# CA-SEAL2 — fourth recorded seal-check input change

**ROUND 1 FIXES IMPLEMENTED; RE-REVIEW PENDING.** Worker CA-SEAL2-FIX1 (Codex), stream E, VM, 2026-11-05. Branch `plans/ea-seal-check-recount-20261105`, fixed from reviewed head `1f98f81de9d6939e78da819ebc2441cda3a4454a`, on CA-SEAL FIX8 `17c842445a2623bb0334ba8d6932e7a6bf088967`. Implementation and compact regression evidence: `60913cb906590662c97696146edcb10960c2ed09`. This file is both the change record and branch report; the final documentation head and cleanup are recorded in external `fix1/DELIVERY.json`. Coordinated landing and independent review remain required.

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

1. Land the answered-card authority/test allowances and frozen recount dependencies as required by stream E. Re-read the DL-451 section and frozen input bytes on the assembled tree. Preserve the two snapshots and every earlier record.
2. Assemble **CA-SEAL before CA-SEAL2 in the same final reviewed E landing**. Fill CA-SEAL's authorized actual lander/receipt first, keeping its prior history and required DL-412 anchor contract.
3. The actual lander runs `python3 -I -B reports/event-authority-20261105/write_recount_receipt.py <landing-tree> --lander <actual-lander-task>`. This writes only the new fourth receipt, pinning the actual final third-receipt bytes and live validator/DL-451 section.
4. **claude-projects-refresh** supplies the exact third and fourth receipt entries in `canonical_ssot_hashes.files` at that same landing. The pending fourth receipt's null lander and its pending digest are not final anchors. This worker does not edit Spec Lock.
5. Apply the named fixture companion in its authorized integration step and perform independent Sol/Astra reviews before and after, plus the prescribed landing checks. The unanchored preparation tree must not be merged alone. Real outcome/depth work and every existing approval condition remain required before final approval.

Exact **new fourth-receipt** entry template:

```json
{
  "path": "reports/event-authority-20261105/seal-check-recount-receipt.json",
  "sha256": "<SHA-256 of complete final receipt after actual lander and prior-receipt pins are filled>"
}
```

The existing DL-412 entry/template remains separately required exactly as CA-SEAL specifies; there is no new DL-077 entry. Later changes to the new receipt require its authorized byte anchor to follow the final bytes.

**Seal-applier exclusion:** the author, actual lander, stream lead `claude-opus-5.5:pm-ea-lead` (session `b29da1b5-9877-474f-8a4c-e7a57ab7f899`), CA-SEAL, CA-SEAL-FIX1 through FIX8, CA-SEAL2 (Codex), CA-SEAL2-FIX1 (Codex), and every other fix worker are barred. The checked new receipt list contains author and actual lander; broader exclusions stay procedural.

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
