# D-M03-A finalize (arm control) — stage report

Finalize is the last stage: the complete declared brief scope is delivered in `final.md` in this directory. This report records stage-level dispositions and verification.

## Carried input

- Predecessor `normal_retrieval-v1/report.md` (7 findings + 6 proposed checks) treated as legitimate untrusted input, not truth. All code-level claims re-verified by direct read this stage; doc-line and per-test-count details partially carried and labeled as such in `final.md`.
- Frozen corpus SHAs re-verified at read: pathdoc `1eb64284…c6de`, pathcode `dc14d820…3487`, pathscan `1198a722…5b1c` — all match manifest.

## Direct verification performed (read-only)

- pathcode selectors L140–256: `_make_selector`, `_Selector.select_from` top-level `is_dir()` gate, `_WildcardSelector._select_from` (`OSError→pass`, dironly `entry.is_dir()`, name-only leaf match), `_RecursiveWildcardSelector` via `walk()` defaults, `_DoubleRecursiveWildcardSelector` dedup.
- pathcode L1081–1155: `glob`/`rglob` (prepend `"**"`, only `case_sensitive` kwarg), `walk` defaults (`follow_symlinks=False`, `on_error=None`), `OSError→continue`, `entry.is_dir(follow_symlinks=…)` with `OSError→False`.
- pathcode L58–60 (`_is_case_sensitive`), L852–884 (`exists`/`is_dir` error behavior).
- pathscan: existence of `test_rglob_common`, `test_rglob_symlink_loop`, `test_glob_permissions`, `test_glob_long_symlink`, `test_walk_follow_symlinks`, `test_walk_symlink_location`; direct read of the `rglob("fileB")` vs `rglob("*/fileB")` contrast and symlink-loop expectations.

## Dispositions

- Accepted: all 7 carried findings (F1–F7 in `final.md`), re-grounded as above. Amended: 0. Rejected claims preserved: rglob-follows-symlinks-recursively, unreadable-subdirs-raise, dotfiles-excluded. Unresolved preserved: fnmatch leading-dot edges, Windows junctions.
- Obligation coverage: all 6 brief obligations mapped to findings in `final.md`; no four-catalog/application-plan scope imposed.
- Executed witnesses: 0 (stage policy forbids execution); T1–T6 remain proposed-only and labeled as such.

## Governing conditions honored

Fresh native Goal activated before substantive work; `get_goal` observed active; receipts preserved. Only exact input map + writable stage directory used; no sibling/reviewer/evaluator/parent-checkpoint material inspected. No repo edits, worktrees, installs, purchases, messages, or delegation. No additional source captures (no `sources/` dir needed). Word/findings counts within soft ceiling (see `final.md`).

Limitations: bounded section reads, not full corpus; doc prose lines and some per-test counts carried from draft; static only; clock-bound (see timings.json).
