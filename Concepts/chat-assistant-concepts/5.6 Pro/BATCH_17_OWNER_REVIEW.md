# Batch 17 owner and preservation review

This is an implementation/source review, not a formal independent audit or governance seal.

## Source lineage and workspace

The transfer's HANDOFF and START_PROMPT were read, and verify_handoff.py passed archive custody checks. One bounded actual-workspace search found a 311-source-file continuation (slice5 plus continuation slice1). It was compared with the 309-file slice5 and 296-file B16 baseline, then continued. The prior slice9 path was not accepted as a source merely because an earlier response linked it.

GitHub current main: `b66529d97e8c90c13b17dcfed52653a80908c543`. Twelve affected preexisting paths were compared by Git blob identity with that pin, including the newly touched ToDoController. Details are in the evidence `WORKSPACE.json`. This is not a full-repository clone or a read of uncommitted user work. The real local worktree is based on a separately recorded local B16 snapshot commit, not falsely labelled as the upstream commit. No shared index or remote was touched.

## Instructions and owner routes

Read AGENTS.md and Plans/00-plans-index.md at the pin. Observed the existing concept-folder boundary, no Plans/native/governance writes, external raw evidence, protected animations, isolated worktree and no push. User-requested evidence is retained separately. The normal repository push rule does not authorize a push from this package task.

| Current owner | Applied responsibility |
|---|---|
| Plans/Assistant_Plan_Runtime.md (APR-003..012, PFAIL, PDET, PPROG, PGOAL addenda) | Exact four Build labels, safe stop, immutable revisions, frozen run/version binding, attention/recovery, source-independent progress, exact exports and shared document views. |
| Plans/ToDo_Runtime.md | Sole writer of current list, stable work bindings, per-item outcome admission, explicit restructure, retained removed-item/binding history and rollup. |
| Plans/Goal_Runtime_System.md | Simple objective/lifecycle, explicit continuation and cancellation; a stopped V1 Goal never silently binds V2. |
| Plans/Scheduling_and_Quota_Resume.md | Manual-stop precedence; exact bound version; later revisions update a pending review target, never silently retarget an old scheduled build. |
| Plans/Runtime_Artifacts_Panel.md | Shared exact artifact identity, version rendering, unavailable states and retained references. |
| Plans/FileManager.md | Deduplicated identity-based left editor tabs, shared projection rather than private Plan editors. |
| Plans/Project_Output_Artifacts.md | Exports are not automatic canonical project outputs or NamedPlan promotion. |
| Plans/DRY_Rules.md, Commands_System.md, UI_Command_Catalog.md, UI_Wiring_Rules.md | Reuse owner requests/actions, explicit currentness and failure; concept receipts are not native Event Authority success. |
| Concepts/CONCEPT_RULES.md | Existing model folder and model label, local manifest, quiet surrounding shell, separate evidence. Full Hub validation remains unexecuted. |

FinalGUISpec.md bounded fetch returned an empty body and raw fetch returned an unsupported/oversized error. It was not treated as read. Full original v3/v4 requirement bodies were not present in the retained source corpus; current grouped owners and retained IDs support the coverage matrix, not invented full wording.

## New repair seams

`artifact-revisions.js` uses one escaped text serialization for string content, structured payload or block trees; normal viewing and download no longer disagree. Existing shared renderer/capability/origin checks remain authoritative.

`plans.js` keeps safe-stopped V1 at Building… until atomic revision acceptance, validates the exact stopped-run capability, fences it on Resume, and cancels the old bound Goal through its owner only when the revision commits. To-Do admission epoch is frozen independently of mutable callback/continuation epoch.

`todos.js` performs a later-version materialization through its existing explicit restructure path. It validates the old cancelled run and exact Plan lineage, retains removed items and binding records, and preserves unrelated work. A new revision gets new executable leaves; Retry instead preserves existing leaf/work identity and only admits a new attempt.

`plan-work-batch17.js` supplies exact safe-stop/cancellation receipts for its local adapter and allocates noncolliding output attempts using retained work-binding history. Unknown computation stages and unknown callback identities refuse without writes.

`scheduling.js` keeps the original version/hash bound until explicit rebind. Repeated revision updates the pending review version; an old Use V2 control cannot bind V3.

## Earlier-test adaptations

B15 and B16 tests previously attempted to corrupt an approved array in place. The current artifact tree is intentionally immutable. The adapted tests first assert mutation is denied, then substitute a detached corrupt binding at the deliberate injection boundary and retain the original currentness/rollback refusal assertions. They do not remove the negative test or assert that corrupt input is acceptable.

The B17 safe-stop UI assertion was corrected from ready/Build to building/Building… with a Paused reason, matching the current owner. Separate tests now prove Resume revokes the stopped-revision capability and that revised work can actually complete under V2 after a failed V1.

## Preservation

All supplied B16 paths remain. No source deletion or folder pruning is instructed. All ten protected sources (motion, orbit, variants-a/b/c, both JS and CSS) are byte-identical to B16. Generated HTML is rebuilt from authored modules, not hand-edited. Historical reports remain historical, not rewritten into new passes.

## Proof boundaries

Read BATCH_17_README.md and the separate final verification report. Currentness/permission/idempotence and local transactional rollback are exercised against real registered concept handlers. They do not establish production security, durable storage, a native event log, all original historical clauses, or an official whole-Hub integration pass.

## Current-owner historical regression repair

The complete retained regression run exposed B01's `ready` after safe stop, B02's now-ineffective in-place approved-array corruption, and B15's Goal-conflict route expecting `ready`. PFAIL-001..009 require unfinished Building… plus secondary Paused until accepted revision. PDET-004..008 require immutable shared document revisions. The two B10 QA files are preserved; a hash-pinned external-copy adapter records exact diffs and refuses unknown source. B02 retains both stale-draft and stale-content dispatch refusal checks and first asserts immutability. B15's route/approved-source/stopped-To-Do checks remain; only the stale lifecycle expectation changes. No runtime file changes for these test adaptations. Raw failures remain visible in evidence; final reconciliation names each complete rerun.
