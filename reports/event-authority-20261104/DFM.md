# DFM — review round 7: implementation fixed, verification resource-stopped

Branch `plans/ea-w2-filemanager-20261104`; assessed implementation `9234e434abf501bd1e8cb013a9e860d942b85090`; incoming head `f70cb3ad5a883de839c27012c90a2b8ee156149a`. **NOT_READY: final verification is incomplete.** Prepared without admission. Membership remains **ABSENT**, retention **PARTIAL / PENDING_RETENTION_DECISION for Jared**, native execution **NOT_RUN**.

## Review round 7: findings and responses

1. **B1 — fixed in implementation (4b7228c0777218d5b9cf830290c8b9ba3b6a8f96); final all-family proof incomplete.** Where: `scripts/pm-filemanager-event-contracts.py:773` (`validate_family_identity`), `:782` (`validate_settlement_inputs`), `:794` (effect transition), `:911` (retained reader). Why: the effect boundary omitted original accepted inputs, completion time and distinct copy result. Fix: both boundaries share the accepted command/input/time predicates; effect settlement calls the same family-identity helper as completed delivery. Authored `round7:settled-time`, `round7:settled-input:*`, and `round7:settled-copied-identity` negatives carry accepting complete CAS controls; accepted descriptors, snapshot coverage and observational copies remain coherent. Creation equality also has its independent control. These are equality/identity joins, not date-time sweep work.
2. **B2 — fixed in implementation (4b7228c0777218d5b9cf830290c8b9ba3b6a8f96); final all-family proof incomplete.** Where: `scripts/pm-filemanager-event-contracts.py:721`, F-150/F-153/F-154/F-156/F-159/F-160, SP-560 (`Plans/storage-plan.md:29541`). Why: handle inequality did not prove different represented original locations. Fix: compare the captured `(computer_id, root_identity_ref, relative_components)` relation after authenticating source/result subjects and accepted/settled snapshot joins. Current live paths are not operands. Each applicable family has same-location negatives at effect settlement and complete current/historical delivery, plus six positive coordinate/history controls. Existing rename predicates remain in force. Native alias authentication remains NOT_RUN.
3. **B3 — fixed in implementation (4b7228c0777218d5b9cf830290c8b9ba3b6a8f96); final all-family proof incomplete.** Where: `scripts/pm-filemanager-event-contracts.py:827`, SP-560 (`Plans/storage-plan.md:29586`). Why: false-like non-arrays bypassed drain checks, and active-to-draining could retire readers. Fix: enforce exact list type before values, exact string/reference domains for members, and reader preservation on drain entry. All twelve families carry separate accepting controls for `""`, `false`, `0`, `null`, `{}`, other wrong types, invalid reference members and the reader toggle. Reference-member negatives use same-state issuance controls so nonempty drain membership is not a second defect. Type/value guards retain their peers and exact original validation.

## Check 11 and earlier-control repairs

The 03:56Z definition is applied per input field/predicate. The external predicate audit cuts clauses and structured-value fields independently. Required-field schema cuts remove only the missing member; closure cuts permit only the tested unknown field. Exact duplicate sets are tested site by site before combined removal. Missing-table tests disable only the lookup; every identity join remains live. Wrong-key witnesses now retain the selected row under the wrong key, separating raw-key identity from missing-row lookup. A separate original-append absence negative is added. Missing-pack witnesses remove exactly one referent and preserve all other packed values.

Older retry-tuple, original root-slot, control-family/cutoff, snapshot coverage and terminal-original witnesses are rebuilt with one defect and coherent observations. A completed pilot on earlier intermediate content found 128 narrow predicate groups and zero residuals for file.copied; **that is not a final-head proof and is not counted in this round's guard totals**.

The narrower audit also identified earlier schema pairs that removed different predicates together. Their proposed proof refactor was **rolled back** when verification could not finish. All twelve payload schemas, operation schemas, EventRecord/storage schemas and embedded Storage definitions are byte-identical to the incoming head. Existing schema fixtures are also restored exactly. The prior 613/579 proof claims are not inherited as compliant 03:56Z proofs; final per-predicate schema isolation remains an explicit open requirement. No schema assertion is removed or weakened in the final diff.

## Rebuilt guard inventory and execution totals

[DFM.guard-table.json](DFM.guard-table.json) is an honest **current inventory**, not a carried-forward proof table. It enumerates all twelve families, new case IDs, current refusal sites and declared schema sets, marking unfinished rows NOT_COMPLETED.

- **Authored outcomes:** 7185 = 468 positives + 6717 negatives; 310 new `round7:*` outcomes. API/schema/transition negatives additionally execute their accepting controls.
- **Current inventory:** 98 explicit refusal sites; 613 declared schema guard sets. No final predicate/schema/implicit/harness totals are certified.
- **Completed final-content checker runs:** **0/12** after the conservative schema restoration. The preceding intermediate content passed file.copied, exit 0, **1,129 outcomes**, including shared schema/owner/registry gates. This remains an intermediate result, not final certification.
- **Completed final-content whole-family guard audits:** **0/12**. Earlier-finding regression drivers, all final main families, false-success processes and index/shard verification are **NOT_COMPLETED / NOT_RUN** at this final content.

The initial disk/RAM preflight passed (**89 GB / 13 GiB**), and every checker job was serial. VM available RAM later fell to **5 GiB** during the pilot guard audit. A fresh serial audit and a smaller fresh round-7 attempt also stopped below 6 GiB. These runs are retained as resource results, never relabelled as passes. No other thread's processes or browsers were changed. The unfinished schema refactor was restored in the assessed implementation follow-up. The implementation is pushed for review; the preparation verdict remains NOT_READY.

## Family grades before and after

Before is Astra's binding review at `f70cb3ad5a883de839c27012c90a2b8ee156149a`. Q remains PARTIAL because required final proof is unfinished; the other 132 normative cells retain their source support. Counts are PASS / PARTIAL / ABSENT.

| Family | Own unit | Before | After | Authored cases | Final checker |
|---|---|---|---|---:|---|
| file.copied | F-150 | 9 / 2 / 1 | 9 / 2 / 1 | 1129 | NOT_RUN_AT_FINAL_CONTENT |
| file.created | F-151 | 9 / 2 / 1 | 9 / 2 / 1 | 544 | NOT_RUN_AT_FINAL_CONTENT |
| file.deleted | F-152 | 9 / 2 / 1 | 9 / 2 / 1 | 535 | NOT_RUN_AT_FINAL_CONTENT |
| file.exported | F-153 | 9 / 2 / 1 | 9 / 2 / 1 | 549 | NOT_RUN_AT_FINAL_CONTENT |
| file.moved | F-154 | 9 / 2 / 1 | 9 / 2 / 1 | 551 | NOT_RUN_AT_FINAL_CONTENT |
| file.renamed | F-155 | 9 / 2 / 1 | 9 / 2 / 1 | 544 | NOT_RUN_AT_FINAL_CONTENT |
| folder.copied | F-156 | 9 / 2 / 1 | 9 / 2 / 1 | 557 | NOT_RUN_AT_FINAL_CONTENT |
| folder.created | F-157 | 9 / 2 / 1 | 9 / 2 / 1 | 543 | NOT_RUN_AT_FINAL_CONTENT |
| folder.deleted | F-158 | 9 / 2 / 1 | 9 / 2 / 1 | 550 | NOT_RUN_AT_FINAL_CONTENT |
| folder.exported | F-159 | 9 / 2 / 1 | 9 / 2 / 1 | 564 | NOT_RUN_AT_FINAL_CONTENT |
| folder.moved | F-160 | 9 / 2 / 1 | 9 / 2 / 1 | 564 | NOT_RUN_AT_FINAL_CONTENT |
| folder.renamed | F-161 | 9 / 2 / 1 | 9 / 2 / 1 | 555 | NOT_RUN_AT_FINAL_CONTENT |

**108 PASS / 24 PARTIAL / 12 ABSENT → 108 PASS / 24 PARTIAL / 12 ABSENT.** All twelve remain unadmitted and retention stays pending for Jared.

## Sweep items

- **SWEEP-NUM:** digest spelling originally at `scripts/pm-filemanager-event-contracts.py:234–235,273–274,869–872`; current helper sites `:228–229`, `:275–276`, `:945–948`. Historical recipe dispatch is in `validate_original_models` / `validate_historical_operation` (`:876`, `:911`). Adopt shared CV-1100/SP-1100/SP-1101 with authenticated written-recipe selection in the cross-lane sweep. No lane-local cap or serializer is added; Storage uint64 and physical floats/signed zero are unchanged.
- **SWEEP-12:** `scripts/pm-filemanager-event-contracts.py:80–84`, own payload `properties.ts` and companion timestamps. The environment's date-time FormatChecker capability remains unresolved. Owner grammar, malformed boundary cases and supported historical editions belong to the cross-lane sweep. B1's valid-time equality defect is separately repaired.

## Authority, scope and remaining checks

F-150–F-161, SP-560, CV-560 and ATS-280 remain the owners. Their normative Markdown is unchanged this round. No new binding, PlanUnit, owner decision, retention/deletion answer, admission, registry append, Decision Log, governance reseal, Spec Lock or auto-decision is made. The event registry and canonical owner prose remain byte-identical to the incoming head. Current live state is not substituted for history. The prior DL-045/UCC, SP-278/DL-076, SP-286/CV-339, SP-337/SP-340 and F2-205 premises are not extended to settle retention.

The previous report is preserved at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix6/DFM.md`. Its 6,875-outcome and guard counts describe the prior head, not this result. Prior unrelated index/registry qualifications remain unadjudicated here: historical ledger/DL-302 diagnostics, currentness-dependent readiness drift and aggregate registry/profile reconciliation. No all-green aggregate check is claimed. No canonical Markdown edit requires regenerated shards in this round; final index validation remains a required pending check.

Reproduction helpers and exact commands are under `fix7/`. Restore a sparse worktree at `9234e434abf501bd1e8cb013a9e860d942b85090` with at least 6 GiB available (more headroom avoids immediate resource stops), then run `run-serial.py` one job/family at a time; it reuses only completed jobs at the identical content fingerprint. Run the prescribed index validation afterward. Resolve the schema clause/duplicate isolation gaps without weakening any existing rule. Any interrupted audit starts fresh. Rebuild this report and table only from completed final-content results before upgrading Q.

**IDs used:** F-150–F-161, SP-560, CV-560, ATS-280. **New PlanUnit IDs: none.** All 310 new fixture case IDs are enumerated in the compact table. No pm-mail, subagent, admission, event-registry append, Decision Log entry, main push, landing lock, browser or server is used. The sparse worktree is removed with its literal path after the report commit is pushed.

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DFM/fix7/evidence-manifest.json`, SHA-256 `c54090d06225113ce44bbd23256685e7ec0e4fce79741d47d422c2080ed3ab56`. It pins retained outputs and reproduction helpers by absolute path and SHA-256. Report, self-grade and compact table are copied to both `fix7/` and the DFM drafts root.
