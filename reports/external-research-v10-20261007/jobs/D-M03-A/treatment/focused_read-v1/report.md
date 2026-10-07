# D-M03-A focused_read (treatment) — rglob traversal and error behavior, CPython 3.12.3

Scope: focused read of frozen corpus only. Read-only inspection; nothing executed.
Downstream receives these exact bytes as method-required intermediate.

Corpus (FROZEN_PUBLIC_PRIMARY_CORPUS, capture 2026-10-07, verified SHA-256 this stage):
- pathdoc `https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/pathlib.rst` sha256 `1eb64284…fc6de`
- pathcode `https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/pathlib.py` sha256 `dc14d820…a3487`
- pathscan `https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_pathlib.py` sha256 `1198a722…5b1c`
Predecessor navigate report (`navigate-v1/report.md`, sha `d1c9e4e5…050`) treated as untrusted locator; every claim below re-verified in corpus bytes.

## 1. rglob entry → selector chain (obligation 1) — accepted

`Path.rglob` (pathcode 1097–1110) prepends `"**"` to pattern parts and yields `selector.select_from(self)`. For `rglob('*.csv')` parts are `("**","*.csv")`. `_make_selector` (82–103): leading `**` with no further `**` → `_RecursiveWildcardSelector`; plain component → `_WildcardSelector`. So `*.csv` becomes successor selector applied at every directory.
`_Selector.select_from` (164–171) gates on `parent_path.is_dir()`; non-dir root yields nothing. `_RecursiveWildcardSelector._iterate_directories` (223–238) yields `parent_path` then every `walk()` default result, and `_select_from` runs the successor at each. `_DoubleRecursiveWildcardSelector` (245–257) only dedupes multiple non-adjacent `**`; not reached by `*.csv`.

## 2. Directory scanning path — accepted

`_WildcardSelector._select_from` (200–220): `with scandir(parent_path)` snapshot to list (fd discipline), `except OSError: pass` (206–207); per entry, `dironly` filter via `entry.is_dir()` with no argument (211–215, `except OSError: continue`), name match via `_compile_pattern` = `re.compile(fnmatch.translate(pat))` (107–109). `Path._scandir` → `os.scandir(self)` (1059–1063). Doc (pathdoc 926–928): top-level `is_dir` OSError propagates, later scan OSErrors suppressed.

## 3. Recursive symlink traversal vs explicit-component matching (obligations 2–3) — accepted with one outside-corpus dependency

`Path.walk` defaults `follow_symlinks=False` (1112); classification uses `entry.is_dir(follow_symlinks=False)` (1140): symlink-to-dir lands in `filenames`, never descended. Docs confirm (pathdoc 1103–1125, incl. walk note that symlinked dirs list under filenames). Consequence: `**` recursion in `rglob('*.csv')` never descends symlinked directories.
Distinct path: explicit `*` dironly positions call `entry.is_dir()` with DirEntry defaults (211–215), which follow symlinks per os docs — that default is outside this corpus, so marked candidate. In-corpus test evidence supports the distinction: `rglob('*/fileB')` matches through `dirB/linkD`, `linkB`, `dirA/linkC` when symlinks available (pathscan 1900–1905); `rglob('*/')` lists `linkB`, `dirA/linkC`, `dirB/linkD` as dir matches (1909–1916).

## 4. Broken links (obligation 3) — accepted

`Path.is_dir` (870–876): `False` only on `_IGNORED_ERRNOS = (ENOENT, ENOTDIR, EBADF, ELOOP)` (line 48) plus ignored winerrors; other OSErrors raise. Doc: `False` for broken symlink, permission errors propagate (pathdoc 955–961; same for `is_file` 964+). In glob: broken links name-match in non-dironly positions — `rglob('*')` yields `brokenLink`, `brokenLinkLoop`, `linkA` without descending (pathscan 1932–1948, symlink-loop test). They are excluded from dironly positions: `test_glob_permissions` (1981–1997) with 50 dangling + 50 valid links gives `*`→100, `*/`→50, `*/fileC`→50. So a broken link named `b.csv` is yielded as a match, never descended; `*/x.csv` style positions skip dangling links.

## 5. Dotfiles (obligation 2) — unresolved candidate

No dotfile exclusion appears in `_WildcardSelector` (191–220); matching is purely `fnmatch.translate`. Candidate: `rglob('*.csv')` matches `.hidden.csv` at any depth. `fnmatch` source is outside corpus and no dotfile-specific glob test was found in corpus hits — unconfirmed from corpus alone.

## 6. Platform / case-sensitivity conditions (obligation 4) — accepted

Case rule: `_is_case_sensitive` normcase probe (58–59); `_WildcardSelector` default `None` → platform rule (195–198); `glob`/`rglob` `case_sensitive` kw (1081–1097, added 3.12). Docs: POSIX typically sensitive, Windows insensitive, override via flag (pathdoc 930–933, 1347–1350). Test: `test_glob_case_sensitive` (pathscan 1876–1887). Condition: `Z.CSV` vs `z.csv` completeness differs by platform unless `case_sensitive=` pins it.

## 7. Access-error completeness (obligation 5) — accepted

Suppression points: selector scandir (206–207), dironly `is_dir` (214–215), walk scandir → `on_error` or continue (1128–1133), walk `is_dir` OSError → treated as file (1141–1143). Propagation: top-level `is_dir` (169; 870–876; pathdoc 926–928, 961). Since EACCES/EPERM are not in `_IGNORED_ERRNOS`, permission errors propagate from the root check but are suppressed for subdirectories. Completeness rule: unreadable root raises; unreadable subdirectories (and their `*.csv`) are silently absent. `test_glob_many_open_files` (1950–1965) confirms fd-exhaustion guard via the `with` snapshot.

## 8. Proposed discriminating checks — proposed only, not executed

1. `.hidden.csv` at root and depth 2 → does `rglob('*.csv')` yield both? (dotfile candidate)
2. Symlinked dir containing `x.csv` → absent from `rglob('*.csv')` (walk default) but present via `glob('*/x.csv')` (explicit-component follow)?
3. Broken symlink `b.csv` → yielded as match, not descended?
4. `chmod 0` subdir with `y.csv` → silently absent, no raise; `chmod 0` root → raises?
5. Case variant `Z.CSV` on POSIX vs Windows semantics and `case_sensitive=True/False` overrides.

## Dispositions and uncertainty

Accepted from navigate: selector chain, walk-default no-descend, broken-link match-vs-descend split, case/platform rule, root-raises vs subdir-skipped error rule — all re-verified above. Amended: explicit-component follow now carries an explicit outside-corpus dependency (`DirEntry.is_dir` default). Rejected: none. Unresolved: dotfile match (needs fnmatch source); DirEntry-default confirmation (needs os docs); rglob doc (pathdoc 1334–1359) states no error semantics of its own, so error inheritance is code-inferred. No code executed; no additional captures made.
