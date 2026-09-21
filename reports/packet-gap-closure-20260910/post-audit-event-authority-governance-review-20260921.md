# Post-audit Event Authority landing review

**Disposition: HOLD_MAIN_PUSH.** The five blockers in the supplied handoff are valid under the current landing rules. The published repair candidate still produces 218 readiness failures when supplied with the same authenticated currentness audit inputs. This review does not authorize checkpoint advancement, activate replacement audit evidence, change the baseline, or clear a landing.

## State and scope

The reviewed handoff is `post-audit-landing-handoff-20260921.json`, SHA-256 `631230e0a2408dcd12f43eaf74af2cf89931bebac4098b6fac7fcfc6fbecd5ec`. Its full landing capture is for `44172dbfb1bfc660c342f7adb33057c7b67d468e` against `478cd2aa0fa5a5660961f351918739d43643bbac`. All five named evidence files authenticate.

Root's isolated full checkout uses the later published repair candidate `9ee75987be116fd7548b0fb787084205bddbeaa9`. Shared main separately advanced to `d09377d4eb8936e0cb5e905dfcb464a7a03320c4`, while `origin/main` remained `478cd2aa0fa5a5660961f351918739d43643bbac` at review. That intervening commit records DL-066/DL-067 and related planning prose; its reviewed landing rule preserves the truncated-total stop and supplies no Event Authority checkpoint approval. The historical capture is not a check of either later tree or their eventual combination. This task has not merged, reset, committed on, or pushed shared main.

| Historical landing blocker | Finding | Disposition |
|---|---|---|
| `run_gates` readiness total 124 → 218 | Truncated at 50; input availability changes account for the numerical increase and recorded sample identities. The 24 unseen baseline rows remain unproven. | Still blocking under the existing total-rise rule. |
| `audit_governance` readiness total 124 → 218 | Truncated at 100; same comparison limit and provenance problem. | Still blocking under the existing total-rise rule. |
| `Commands_System.md` currentness drift, `run_gates` | Actual file bytes differ from the retained source inventory. This predicate does not assess product correctness. | On-branch error; not an excused error kind in the landing script. |
| `Commands_System.md` currentness drift, `audit_governance` | The same source mismatch reported by the other aggregate. | Same disposition. |
| `UI_Command_Catalog.md` currentness drift, `audit_governance` | Actual file bytes differ from the retained source inventory. | On-branch error; not an excused error kind. |

## Currentness and approval are separate

The retained audit is internally authentic: its receipt's 14 artifact hashes and exact 252-row group custody pass. It is no longer current. The unmodified currentness validator returns exit 1 with five failed predicates: exact live source set, complete direct Markdown inventory, live source rehash, live registry/status match, and validator hash. Its self-test passes all seven controls. The direct aggregate helper reproduces 95 currentness errors: 92 source hashes, one direct source-set mismatch, one validator mismatch, and one registry mismatch.

The current scan selects 243 sources versus 234 in the retained inventory, including the added `Plans/External_Research.md`. Its lexical findings are discovery queues, not owner adjudications or event admission. Frozen row-local judgments must remain intact; changed meanings require exact owner review in a successor artifact.

Three different states must not be conflated:

| State | Families / revision | Authority |
|---|---|---|
| Retained currentness status | 39 / `2026-08-27.1` | Historical source inventory only. |
| Approved helper checkpoint | 40 / `2026-09-11.1` | Genuine September 11 carry-forward receipt. |
| Live registry | 42 / `2026-09-11.2` | Observed membership; no later exact checkpoint approval found. |

DL-040's compaction decision and the separate September 11 17:01:44.364419Z response support the approved 40-family checkpoint. Browser technical permission and separate admissions added `browser.workspace.created` and `browser.workspace.reset`; they do not advance readiness comparison approval. The revision stayed `.2` across the second addition, so revision alone is insufficient identity. The bounded review authenticated 87 referenced receipt hashes and found no later exact 42-family approval in the examined sources.

The concrete pending comparison-checkpoint proposal is the exact registry SHA-256 `1972a6aa6ef168a46091be5347bc9cff657985a1c21ab1b84665b9ed96c1ed3a`, revision `2026-09-11.2`, 42 families, with denominator/depth clearance still false and no certification, runtime or seal authority. **This is a proposal, not an approval.** A genuine later receipt, if available, should be recovered rather than asking again. The previously approved original sheet, 40-family carry-forward, Browser permission and retention choices remain settled.

## Baseline input consistency

The recorded baseline's two missing-receipt fingerprints identify `Plans/.audits/event-authority-2026-08-13-currentness/VALIDATOR_RECEIPT.json`. The helper reads that file first and returns immediately when it is missing. Consequently the baseline does not establish the existence or hashes of the remaining ignored audit inputs. Its untracked-input collector inventories only `tests`, not `Plans/.audits`; a full tracked checkout alone is not a reproducible input set.

The independent reconstruction substitutes the baseline's missing-receipt failures into the authenticated historical 218-row result and reproduces every recorded bucket/count/fingerprint at both the 50- and 100-row caps. This proves recorded sample agreement under the stated counterfactual. It cannot recover the 24 unsaved baseline identities or establish equality of full historical failure objects, because normalization also discards measured hashes and values.

Root additionally ran a controlled experiment on the fixed **current candidate**. The new isolated checkout initially lacked the ignored audit directory. It was validated in that naturally absent state, then supplied with an ignored symlink to an immutable, SHA-256-authenticated snapshot of the shared audit's exact 15 files and validated again. No existing audit file was deleted, hidden, modified or replaced; no tracked file changed.

| Candidate input state | Readiness exit | Complete failure count |
|---|---:|---:|
| Initially absent ignored audit | 1 | 124 |
| Exact frozen 15-file audit supplied | 1 | 218 |

All **122 other complete failure objects are identical**. One audit-unavailable failure becomes 95 currentness failures, and one PNC source-path-missing failure becomes a source-hash-stale failure. This directly establishes the input effect on the current candidate. It is not a historical baseline rerun, proof of its unseen rows, or permission to use missing inputs as a passing state. The frozen audit remains supplied in the review worktree.

## Required successor workflow

1. Reconcile the published repairs with the actual intended landing tree and stabilize its source bytes. Preserve the historic audit and authenticate its historical inventory, expected 252-event set and seven source groups.
2. Through the designated Plans/Event Authority owner, generate a new fail-closed currentness edition using the existing external-output workflow, then validate and review its discovery changes. A new empty external `--outdir` and explicit allowed evidence map preserve historical custody. Keep `UNKNOWN_OPEN`, all closure/depth/build flags false, and zero fresh depth claims. The independently reviewed commands and prerequisites are in the currentness review cited below; generation was not run by this review.
3. Establish an expressly reviewed aggregate evidence binding. `pm_pnc019_currentness.py` reads fixed repository paths and does not honor the generator's evidence map; a new external audit alone will not reach readiness consumers. Its original group inputs also remain separate from the generated output. Any location integration must preserve all existing source/hash/closure predicates and the immutable group identities. It is a separate technical action, not a reason to relax a validator.
4. Resolve the exact 42-family comparison-checkpoint authority separately. If approved, follow the constrained Step 04 precedent: only approved checkpoint data/provenance, normal derived projections and negative controls, with validation logic and clearance flags unchanged. A source scan, registry membership or the old 40-family receipt cannot supply this decision.
5. Provision and authenticate the same intended ignored evidence inputs for baseline maintenance and landing checks. Record the custody gap in the designated nightly workflow. A baseline refresh belongs with its scheduled migration snapshot and must not be performed to excuse this pending landing.
6. On the final reconciled full tree, run the required shard check and `python3 scripts/pm-landing-check.py --base origin/main` before any main push. The current handoff, isolated readiness experiments and any new currentness-only success cannot substitute for that result.

No full aggregate landing rerun was performed after this diagnosis: known unresolved currentness selection and checkpoint authority remain, and the actual combined landing tree has not been selected. Denominator/depth and native certification remain separate open work. The latest general seal-acceptance rule does not override deterministic landing failures.

## Evidence custody

The companion JSON carries exact paths, SHA-256 values, state pins, run results and the unapproved decision proposal. Raw outputs remain outside the repository. Independent review manifests authenticated in full by root:

- Currentness workflow: `/mnt/Cursor/PM-Experiments/post-audit-currentness-workflow-review-20260921/v1/manifest.json`, SHA-256 `0e40dd8d91b3585d7837b6da295ca4b920f669de53fc67c621971896e1902c97` (7 members), with its 8-member raw evidence manifest independently authenticated.
- Checkpoint lineage: `/mnt/Cursor/PM-Experiments/checkpoint-approval-lineage-review-20260921/v1/manifest.json`, SHA-256 `cdb955b8aa2c70f715c7e98bd29b7976d0bd2c850a1e7573a4340ad9a241356b` (132 members).
- Baseline consistency: `/mnt/Cursor/PM-Experiments/post-audit-baseline-input-review-20260921/v1/manifest.json`, SHA-256 `9e4e44e9be002f9d46562a86bb9b0b189edefb1d7568973af9f0b6aa60c8e512` (15 members).
- Current ignored-input snapshot: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-currentness-input-snapshot-20260921/manifest.json`, SHA-256 `9943bfe38199ce76403d5f11611605b830fbe150fcfeb17238d68991f56e3ee2` (15 members).

Validation for this review: manifest/member authentication; the existing currentness validator and its self-test; two complete isolated readiness validations and exact multiset comparison; unchanged tracked source and frozen-input hashes; report consistency and `git diff --check`. Only these compact result reports are committed. No baseline, governance artifact, canonical document, validator, registry or shared-checkout input is changed.
