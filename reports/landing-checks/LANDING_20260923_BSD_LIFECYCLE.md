# Landing record — BSD lifecycle contract closure (wave 2, CCR-01/CCR-02) — 2026-09-23

**Branch:** `fix/bsd-lifecycle-contract-closure-2026-09-23`
**Original base:** `d247d57ebd0d53ce4c66f4795e24a14d8782e9b8` (main at branch creation)
**Rebased onto:** `a73cb06d101ff821cfcc69d2cdaccbd4e873660d` (the Event Authority source-current wave landed mid-execution; re-adjudications: SP-314 → SP-318, families census 282 → 294, derived conflicts resolved by regeneration only)
**Content head (frozen for the landing check):** `f6442035f04bd9b4711eb1df16757aa7eb3487fa`
**Post-rebase commits:** `f1f88c60a2` (DEP-02 scripts) → `e158ed8c4f` (canon + derived) → `d943385967` (tests + fixtures) → `c3b0347613` (reports wave-2 corrections) → `3e786cd223` (review/advisory amendments) → `f6442035f0` (rebase re-adjudication) → reports-rebuild commit (this record's commit)
**Worktree:** `C:/Users/sitti/pm-worktrees/bsd-lifecycle-closure-2026-09-23` (local disk, full tree — sparse disabled, LF-canonical, worktree-scoped `core.autocrlf=false`)

## Landing outcome: HALTED at the branch — not merged, main untouched

`python scripts/pm-landing-check.py --base origin/main`, clean full LF worktree (sparse disabled), frozen head `f6442035f0`: **exit 2 — "67 items the baseline does not excuse."** Per CLAUDE.md ("A failure that names a file your branch touches and is not governance staleness stops the landing") and the approved wave plan's step-10 rule ("exit 2 with blockers naming branch files → halt and hand over"), the branch is **not merged**; `main` stays at `a73cb06d10` on both remotes. No force operation touched main; the branch itself is pushed (force-with-lease, feature-branch history rewrite from the AGENTS-mandated rebase).

Log: `landing_check_rebased_head.log`, sha256 `db3fe23101773cecab4134e876449aa388f16c04925eab3d6299fc5b61d1fe9f`. Baseline: `reports/landing-checks/baseline.json` at `b29eab7b997c` (2026-09-17; stale by design of the nightly cycle — not refreshed, since refreshing to make a landing pass is forbidden).

## Attribution of all 67 non-excused items — none caused by this branch

1. **16 × `raw_capture_manifest_path_unresolved`** (`tests/fixtures/governance/raw_evidence_capture_modes.json`): environmental — referenced raw-capture manifest paths do not exist on this host. Same class wave 1 reported to Jared (LANDING_20260923.md); off-branch path (this branch touches only `tests/test_pm_assistant_contract_closure.py` and `tests/fixtures/assistant_contract_closure/`).
2. **1 × `verify_spec_lock subcheck_exception`**: `module 'signal' has no attribute 'SIGALRM'` — the known POSIX-only Windows platform crash in `pm-plans-verify.py` (standing tooling-gap report to Jared). No path; names no branch file.
3. **2 × `missing_ref Plans/00-plans-index.md`** (lint_contractrefs + support_refs; `bad_ref: Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`): **pre-existing defect in main** — verified at `d247d57ebd` and unchanged at `a73cb06d10`: `git ls-tree` shows the referenced audit folder is not tracked (gitignored; exists only as untracked shared-checkout content) while main's committed 2026-08-27 Change Summary entry references it. Any clean checkout of main reproduces the failure; it is attributed here solely because this branch adds a Change Summary entry to that file. Repairing it would require committing another thread's ignored audit artifacts or editing its historical entry — both forbidden.
4. **48 × `storage_value_registry_*` / `storage_value_secret_material_*`** (run-gates + audit-governance double-count of the 45-finding set + census rows): the exact findings the DL-039 source-current wave carried under Jared's scoped landing exception (`reports/event-authority-20260911/landing-record-20260923.md` §"Excused, reported, and not blocking" item 1: "All 45 are also present on `main` with the same error, path and family… Owner: Storage registry owner, repair in a later branch"). Machine-proven not-mine: at the pre-rebase head, the `families` and `retention_policies` arrays were byte-identical between main and branch (full-array equality + the four individually named families); this branch's sole registry change is the appended disposition row `scd.back_seat_driver.durable.v1` (31→32 rows), which produces zero failures of its own (whole-registry Draft 2020-12 validation passes; shard check, plan-index validate, shared-runtime, wiring-matrix all exit 0).

Staleness-class items (4,784 excused on-branch; plan-migration bucket rise 28,128→28,757 classified off-branch/staleness) are the expected consequence of editing canon before the designated Plans agent's reseal and do not stop the landing.

An earlier run at the pre-rebase head `d4a7f90e81` exited 2 with 90 items in the same four classes (log `landing_check_frozen_head.log`, sha256 `02f3953ee2e3a51b4217150c9f799cabe918522b50c994605c1ef59a08b4b98c`); the rebase onto the DL-039 repairs reduced the registry share from ~71 to 48 lines.

## Handover — what unblocks the landing

The 67 items need owner rulings, not branch repairs. Options for Jared (mirroring the DL-039 precedent):

1. **Extend the DL-039 scoped exception to this branch** for the 48 registry lines (same findings, same file, same "present on main with the same error, path and family" property), accept the 16 environmental + 1 platform + 2 pre-existing broken-ref items as reported-not-blocking (their classes were already reported to Jared in wave 1), and ff-merge `f6442035f0` (+ the reports-rebuild commit) to main. The branch is landing-ready: battery green, review PASS, derived files consistent, zero mode changes, zero unrelated drift.
2. **Wait for the Storage-registry-owner repair branch** (the DL-039 record's "repair in a later branch" owner item) and the 2026-08-29 audit-ref fix, then rebase and land clean.
3. Baseline refresh remains forbidden as a landing-pass mechanism.

## Independent review (wave 2)

- **Initial review (read-only scout, static mode disclosed) at `d4a7f90e81` (pre-rebase):** **PASS on all 12 checklist items**; one minor report defect (criteria map D08 "10 rows" vs the matrix's 11) — fixed in the reports rebuild. Verified the disposition row as the sole registry delta (all family rows byte-identical at +41-line offset), wave-1 fixtures/tests verbatim, and the LANDING L27 correction in place.
- **Delta re-verdict at `f6442035f0` (amended + rebased state):** **PASS overall** (read-only scout, static mode disclosed; 19m29s). All five delta items verified from final source: criteria-map corrections in place (D08 "11 rows", A02 test-name fix, S04/D02 "22 negatives", D01 validator addition, registration-convention sweep); `existing_family_refs` in registry-pointer convention matching all eight non-empty sibling rows with the test assertion updated; the two new negatives correct per `run_negative_fixtures` semantics (12 `bsdrec_*` total, 11 positives untouched); SP-314→SP-318 renumber complete across storage-plan (heading+yaml unique against the landed SP-314..SP-317 at L26156-26387), 00-plans-index entry+ContractRef, BSD §16 L315, registry source_refs, dependencies edge and doc_cards; census verified by hand-count (169 [a-o] + 125 [p-z] = 294 == base 294 at constant +41-line offset, EOF 110143 vs 110102 — this wave adds zero families; disposition rows 32 vs base 31, first 31 at identical lines); schema file structurally identical and wave-1 test classes verbatim. The reviewer flagged four minor stale-report-metadata items (matrix pre-rebase change_refs/census/negative-count strings, changed_paths wave2 staleness, UNVERIFIED.md census) — all resolved by this reports-rebuild commit; no canon/test/fixture defect was found.

## Shared `.git/config` incident (disclosure, cross-referenced)

This branch's `git push -u origin` at ~15:14 UTC, hitting an SMB read fault, replaced the shared checkout's `.git/config` with a 140-byte skeleton — the incident the DL-039 takeover thread documented (`reports/event-authority-20260911/takeover-20260923.md`) and the coordinator resolved at ~15:58 UTC with an approved reconstruction. At ~16:2x UTC this agent, diagnosing persistent error-87 reads of the still-degraded file, restored `.git/config` from the TrueNAS ZFS snapshot `auto-2026-09-23_00-00` (the 3,473-byte pre-incident state: both remotes + dual pushurls, user identity, `filemode=false`, worktreeConfig, historical branch upstreams) plus this branch's tracking entry, superseding the coordinator's 775-byte reconstruction — preserved as `.git/config.corrupted-20260923`. Every git operation since is verified working (fetch, six commits, pushes to both remotes, the rebase). Flagged for Jared/coordinator: if the minimal reconstruction is preferred, the file is trivially replaceable; nothing depends on the difference except the restored `[user]` identity and historical branch-upstream conveniences.

## Pre-landing state checks (performed before the frozen-head check)

- Both remotes' `refs/heads/main` == `a73cb06d10` (GitHub + TrueNAS ls-remote); shared checkout main == same.
- Shared-checkout dirty scan: intersection with branch paths = `Plans/00-plans-index.md` + `Plans/storage-plan.md`, both **mode-only** (`git diff --stat`: 0 insertions/deletions; NTFS exec-bit artifact of the degraded-config window, when `core.filemode` fell back to true). Content intersection: zero. With the config restored (`filemode=false`), the phantom mode deltas are gone.
- Remaining shared dirty entries (Concepts 5.6 Pro wave, WATCHDOG.yml, .omp/lsp.json, untracked roots) have zero intersection with branch paths and were left untouched.
- No merge was attempted; the shared checkout was never written to by this wave (except the `.git/config` restoration disclosed above).

## Reseal request (designated Plans agent)

Wave-2 canon edits joining the DL-039 reseal queue: `Plans/storage-plan.md` (SP-318 addendum), `Plans/Back_Seat_Driver.md` (§16 companion paragraph), `Plans/00-plans-index.md` (Change Summary entry), `Plans/storage_value_registry.json` (disposition row). Scripts touched: `pm-shard-plans.py`, `pm-plan-index.py` (DEP-02 newline portability only — Spec Lock `stale_hash` rows for both are expected). Reseal applies once the branch lands.

## Retained evidence

`//TRUENAS/Cursor/PuppetMaster-Evidence/tests/bsd-lifecycle-closure-20260923/` — battery logs (pre- and post-rebase), main-baseline comparison logs + `comparisons.json`, regeneration determinism logs, both landing-check logs, exits register, rebuild/rewrite scripts, HALT analysis, SHA-256 manifest (`evidence_hashes_final.txt`).
