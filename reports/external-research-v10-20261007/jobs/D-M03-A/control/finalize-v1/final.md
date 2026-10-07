# D-M03-A final: `Path.rglob('*.csv')` at CPython 3.12.3 (arm control)

Scope: one local root with ordinary files, dotfiles, symlinked directories, a broken link, and an unreadable directory. Method: read-only static inspection of the pinned corpus. Zero executed witnesses; proposed checks below are NOT run.

## Recommendation

Treat `rglob('*.csv')` as a partial enumerator, not a complete inventory. It is complete only if every needed directory is a real (non-symlinked) descendant readable at scan time, needed names match the case rules in force, and hits are post-filtered: leaf matches include broken symlinks, directories named `*.csv`, and symlinks-to-files, so caller-side `is_file()`/`lstat()` filtering is required. Symlinked-dir subtrees and unreadable-dir subtrees are silently missing. Pin `case_sensitive` explicitly for portable results.

## Material findings

F1. Traversal chain. `rglob(pattern)` prepends one `**` segment and builds `_RecursiveWildcardSelector` via `_make_selector` (multiple non-adjacent `**` gives `_DoubleRecursiveWildcardSelector` with dedup). Recursion enumerates directories through `parent_path.walk()` with defaults (`follow_symlinks=False`, `on_error=None`), then applies a leaf `_WildcardSelector('*.csv', dironly=False)` per directory; each scan uses `Path._scandir` → `os.scandir`, entries buffered via `list()` in the context manager. Top-level `select_from` gates on `parent.is_dir()`; nested scans handle their own `OSError`. (pathcode L1097–1110, L82–105, L228–238, L200–220, L164–171, L1059–1063.)

F2. Dotfiles match; `**` never descends into symlinked dirs. The leaf selector matches `entry.name` against `fnmatch.translate('*.csv')` with no dot-exclusion, so `.hidden.csv` matches wherever its containing real directory is visited. Recursive `**` never enters symlinked directories because the driving `walk()` runs with `follow_symlinks=False` (dir-symlinks land in `filenames`). Explicit intermediate segments DO follow them: intermediate `_WildcardSelector(dironly=True)` filters with `entry.is_dir()` (default `follow_symlinks=True`). Corpus contrast is exact: bare `rglob("fileB")` yields only `dirB/fileB`, while `rglob("*/fileB")` also yields `linkB/fileB`, `dirB/linkD/fileB`, `dirA/linkC/fileB`. (pathcode L191–220, L1140–1148, L1112–1155; pathscan `test_rglob_common` L1888+.)

F3. Broken leaf yielded; broken intermediate skipped. Leaf matching is name-only with no stat gate, so a broken symlink named `x.csv` is yielded; corpus tests yield `brokenLink`, `brokenLinkLoop` from `rglob('*')` and a long-target `bad_link` from `glob('**/*')`. As an intermediate, a broken link fails `entry.is_dir()` (`False`, or `OSError` → `continue`) and is never descended into. (pathcode L200–220; pathscan `test_rglob_symlink_loop`, `test_glob_long_symlink`.)

F4. Followed directory links, bounded; no recursion switch. An explicit-segment symlink-to-directory IS traversed (corpus: 100 links → `glob("*/")` yields exactly the 50 pointing at `dirC`). But `**` recursion is immune to symlink loops precisely because it never follows them (`test_rglob_symlink_loop` terminates, links yielded as names only). No `recurse_symlinks` parameter exists on `glob`/`rglob` at 3.12.3 (signatures take only `case_sensitive`); the only follow-switch in this chain is `walk(follow_symlinks=…)`, which rglob does not set. (pathcode L1081–1110, L1140–1148; pathdoc L1104–1125.)

F5. Platform / case conditions. `case_sensitive=None` resolves per call through `_is_case_sensitive(flavour)` = `flavour.normcase('Aa')=='Aa'`: case-sensitive on POSIX, insensitive on Windows; explicit `True`/`False` overrides. So `*.csv` misses `X.CSV` on POSIX by default but matches on Windows. `is_dir`/`exists` follow symlinks by default and return `False` (not raise) only for ignored errnos `(ENOENT, ENOTDIR, EBADF, ELOOP)` plus documented winerrors; other errors propagate. (pathcode L58–60, L193–198, L852–884; pathdoc L930–933, L955–970, L1347–1350.)

F6. Access errors silently truncate the inventory. Nested `_WildcardSelector._select_from` catches `OSError` from `scandir(parent)` with bare `pass`; the driving `walk()` likewise `continue`s on `scandir` `OSError` when `on_error is None`, which is how rglob calls it. Entry-level `is_dir()` `OSError` → treated as not-a-directory. Only the top-level `is_dir()` gate can propagate non-ignored `OSError` (it has no catch). Net: root-unreadable raises; any nested-unreadable silently drops that subtree. rglob exposes no error channel, so callers cannot distinguish "empty" from "skipped". (pathcode L200–207, L210–215, L1128–1133, L1140–1143; pathdoc L926–928, L1098–1102.)

F7. Completeness conditions. Follows from F1–F6; see Recommendation. Symlinked-dir subtrees and unreadable-dir subtrees are missing with no warning; post-filtering is the caller's job.

## Obligation dispositions

1. Trace selectors/scanning path → F1 (accepted). 2. Dotfiles vs symlink recursion → F2 (accepted). 3. Broken vs followed links → F3–F4 (accepted). 4. Platform/case conditions → F5 (accepted). 5. Access-error completeness impact → F6–F7 (accepted). 6. Proposed discriminating tests → T1–T6 below, proposed only (accepted as proposals; execution forbidden in this stage).

Accepted (7): F1–F7, verified against directly-read code unless noted. Amended (0). Rejected: "rglob follows symlinked directories recursively" (false for `**` at 3.12.3); "unreadable subdirectories raise" (false except the top-level gate); "dotfiles are excluded" (no such filter). Unresolved: exact `fnmatch` leading-dot edge cases beyond `translate('*.csv')` reading (no dotfile test in corpus); Windows junction traversal (documented predicate only, no traversal test in corpus).

## Executed vs proposed checks

Executed witnesses: none (read-only static stage; no code run, no installs). Proposed checks (PROPOSED ONLY — none executed): T1 dotfile: root with `.h.csv` + `v.csv`; `rglob('*.csv')` expected to yield both. T2 symlink recursion: real `d/x.csv` + `link→d`; bare `rglob('x.csv')` expected `[d/x.csv]` only, `rglob('*/x.csv')` expected to add `link/x.csv`. T3 broken link: `b.csv→nonexistent` + `d.csv→real-dir`; `rglob('*.csv')` expected to yield `b.csv`; `rglob('b.csv/*.csv')` expected empty. T4 unreadable dir: `chmod 000` subdir with `u.csv`; `rglob('*.csv')` expected to omit `u.csv` silently while direct `os.scandir` raises `PermissionError`. T5 case: `X.CSV` on POSIX; default expected miss, `case_sensitive=False` expected hit. T6 loop: `l→.` self-loop; `rglob('*')` expected to terminate with `l` yielded once. Cleanup: restore permissions before removal.

## Sources (exact identity)

- pathdoc `https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/pathlib.rst` v3.12.3 2026-10-07 sha256 `1eb64284…c6de` (verified), L905–946, L955–970, L1098–1125, L1334–1359 (via carried draft readings; doc lines not re-read in this stage).
- pathcode `https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/pathlib.py` v3.12.3 2026-10-07 sha256 `dc14d820…3487` (verified), L40–60, L82–110, L140–256, L852–884, L1059–1155 (directly read this stage).
- pathscan `https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_pathlib.py` v3.12.3 2026-10-07 sha256 `1198a722…5b1c` (verified); test-name existence and `test_rglob_common`/`test_rglob_symlink_loop` expectations confirmed by direct read; remaining per-test counts carried from draft.
- No additional captures. Carried draft (`normal_retrieval-v1/report.md`) treated as untrusted input; code-level claims re-verified, doc/test prose partially carried as noted.

Limitations: static inspection only; zero executed witnesses; bounded section reads, not full 6297-line corpus; `fnmatch.translate` dot behavior inferred from regex semantics; no sibling/review/evaluator material consulted; clock-bound stage (see timings.json).
