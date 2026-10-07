# D-M03-A finalize (treatment) — stage report, CPython 3.12.3

Stage: finalize-v1 (last stage). Native Goal `goal-01a117b9-bfd8-7a40-83d5-20772a05ac63`, active at activation; receipts in `native_goal_receipt.json` / `native_goal_terminal.json`. Dispatch 2026-10-07T18:56:40.302622+00:00; stage deadline 18:59:40.302622+00:00; whole-arm deadline 19:00:56.466566+00:00. Read-only inspection; no code executed, no repo edits, no delegation. This report carries the COMPLETE declared brief scope (same content as `final.md`); no sibling answers, reviews, evaluator keys, or campaign analysis inspected.

Corpus SHA-256 re-verified this stage (`sha256sum` 2026-10-07T18:57:13Z): pathdoc `1eb64284…fc6de`, pathcode `dc14d820…a3487`, pathscan `1198a722…5b1c` — all match `inputs/sources.json`. Predecessors (navigate-v1 `d1c9e4e5…050`, focused_read-v1 `73b6dd40…ace58`, expand-v1 `61d8b963…b32`) used as untrusted locators; corpus claims re-verified in corpus bytes (direct reads: brief, sources.json, pathcode 1081–1160, targeted grep of selector/walk/error lines). Expand-v1 captures fnmatch.py (`6683da36…94ebc`) and os.rst (`9a280ac2…afd53`, v3.12.3, 2026-10-07T18:53:38Z) carried as legitimate inputs, not re-fetched.

## Complete scope (all six obligations)

1. **rglob → selectors → scanning.** `rglob('*.csv')` → parts `("**","*.csv")` → `_RecursiveWildcardSelector` + `_WildcardSelector` successor (pathcode 82–103, 1097–1110); root gated on `is_dir()` (164–171); successor applied at root + every `walk()`-default directory (223–238). Scan: `with scandir` snapshot, `except OSError: pass` (200–207); dironly `entry.is_dir()` no-arg, `except OSError: continue` (211–215); match via `fnmatch.translate` (107–109); `Path._scandir` → `os.scandir` (1059–1063).
2. **Dotfiles match; symlinked dirs not traversed by `**`.** No dot exclusion in 191–220; carried fnmatch bytes: `*` → `.*`, no dot rule → `.hidden.csv` matched at every visited depth. `walk(follow_symlinks=False)` puts symlink-to-dir in `filenames` (1140), never descended (docs 1103–1125) — but explicit `*` dironly positions follow them (DirEntry default `follow_symlinks=True`, carried osdoc 2819–2823; tests 1900–1916).
3. **Broken links vs followed links.** Broken `b.csv` yielded as name match, never descended (`rglob('*')` yields brokenLink/brokenLinkLoop/linkA, 1932–1948); excluded from dironly positions (`*`→100 vs `*/`→50, 1981–1997); `is_dir` False only on `_IGNORED_ERRNOS` (48, 870–876); dangling reads False via caught FileNotFoundError (carried osdoc ~2840).
4. **Platform/case conditions.** `case_sensitive=None` → normcase-probe platform rule (58–59, 195–198); keyword added 3.12 (1081–1097); POSIX sensitive / Windows insensitive (pathdoc 930–933, 1347–1350); test 1876–1887. `Z.CSV` outcome differs by platform unless pinned.
5. **Access-error completeness.** Root unreadable → raises (top-level `is_dir` gate, 169; pathdoc 926–928); subdir unreadable → subtree silently absent (suppression at 206–207, 214–215, 1128–1133 with `on_error=None`, 1141–1143). EACCES/EPERM not in `_IGNORED_ERRNOS`.
6. **Proposed checks (not executed):** dotfile at two depths; symlinked-dir CSV absent via rglob / present via `glob('*/x.csv')`; broken `b.csv` match-not-descend; `chmod 0` subdir silent-skip vs root raise; `Z.CSV` POSIX/Windows + `case_sensitive=` overrides.

## Dispositions

Accepted (re-verified): selector chain, walk-default no-descend, broken-link split, case/platform rule, root-raises/subdir-skipped rule. Amended → accepted via carried captures: explicit-component follow, dotfile match. Rejected: none. Unresolved residual: rglob error inheritance code-inferred (doc silent, 1334–1359); `DT_UNKNOWN` extra syscalls (no outcome change); Windows winerror branches; macOS normalization.

## Deliverables

- `final.md` (complete bounded recommendation, 7 findings, ~1000 words) — declared final path for treatment arm.
- `report.md` (this file) — stage output with identical complete scope.
- `timings.json`, `native_goal_receipt.json`, `native_goal_terminal.json` — lifecycle evidence.
