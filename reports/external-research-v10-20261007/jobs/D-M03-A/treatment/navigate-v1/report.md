# D-M03-A navigate (treatment) — evidence map, CPython 3.12.3 frozen corpus

Scope: navigation only. Locations below are promising evidence for downstream
stages; index hits are not conclusions. No code executed. Corpus SHAs per
inputs/sources.json (pathdoc 1eb64284…, pathcode dc14d820…, pathscan 1198a722…).

## 1. rglob entry → selector chain (obligation 1)

- `pathcode.py:1097-1110` `Path.rglob`: prepends `"**/"` to pattern parts,
  builds selector via `_make_selector`, yields `selector.select_from(self)`.
- `pathcode.py:82-103` `_make_selector`: leading `**` → `_RecursiveWildcardSelector`
  (single) or `_DoubleRecursiveWildcardSelector` (multiple non-adjacent `**`);
  plain component → `_WildcardSelector`; `..` → `_ParentSelector`.
- `pathcode.py:164-171` `_Selector.select_from`: gates on `parent_path.is_dir()`;
  yields nothing when root is not a dir.
- `pathcode.py:223-238` `_RecursiveWildcardSelector`: `_iterate_directories`
  drives `parent_path.walk()` with **defaults**, applying the successor selector
  at every directory (root included).
- `pathcode.py:200-220` `_WildcardSelector._select_from`: `scandir` snapshot in
  `with` block (fd discipline), `dironly` filter via `entry.is_dir()`, name match
  via `_compile_pattern` (`pathcode.py:107-109`, `fnmatch.translate`).
- `pathcode.py:1059-1063` `Path._scandir` → `os.scandir(self)`; doc `pathdoc.rst:926-928`:
  top-level `is_dir` OSError propagates, later scan OSErrors suppressed.

## 2. Symlink traversal vs symlink matching (obligations 2-3)

- `pathcode.py:1112-1155` `Path.walk` (default `follow_symlinks=False`):
  `entry.is_dir(follow_symlinks=False)` at `:1140`; symlink-to-dir lands in
  `filenames`, is never descended. Doc confirms `pathdoc.rst:1103-1125`.
- Consequence candidate: `**` recursion never descends symlinked dirs, but
  explicit `*` components use `entry.is_dir()` with DirEntry defaults
  (`pathcode.py:211-215`), which follows symlinks — needs os-docs confirmation
  (outside corpus).
- `pathscan.py:1888-1930` `test_rglob_common`: `*/fileB` matches through
  `dirB/linkD`, `linkB`, `dirA/linkC` when symlinks available — explicit-component
  traversal evidence. `rglob("*/")` lists `linkB`, `dirA/linkC`, `dirB/linkD` as
  dir matches.
- `pathscan.py:1932-1948` `test_rglob_symlink_loop`: `rglob('*')` yields
  `brokenLink`, `brokenLinkLoop`, `linkA` as name matches without descending.
- `pathscan.py:1981-1997` `test_glob_permissions`: 50 dangling + 50 valid links;
  `*` → 100, `*/` and `*/fileC` → 50 (dangling excluded from dironly positions).
- `pathdoc.rst:955-961` (`is_dir`), `:964-1040` (`is_file`, `is_symlink`, …):
  broken symlink → `False`; permission errors propagate.

## 3. Dotfiles, platform/case conditions (obligations 2, 4)

- Matching compiler `pathcode.py:107-109` uses `fnmatch.translate` with no
  dotfile exclusion visible in `pathcode.py:191-220` — candidate: `*.csv`
  matches dotfiles like `.x.csv`. fnmatch source is outside corpus: unconfirmed.
- Case: `pathcode.py:58-59` `_is_case_sensitive` (`normcase` probe);
  `pathcode.py:195-198` default `None` → platform rule; `pathcode.py:1081-1097`
  `glob`/`rglob` `case_sensitive` kw (added 3.12). Docs `pathdoc.rst:930-933`,
  `:1347-1350`: POSIX sensitive, Windows insensitive.
- `pathscan.py:1876-1887` `test_glob_case_sensitive`; `pathscan.py:3052-3060`,
  `:3198-3207` flavour-level glob/rglob tests.

## 4. Access-error completeness (obligation 5)

- Suppression points: `pathcode.py:206-207` (selector scandir OSError → pass),
  `pathcode.py:214-215` (dironly `is_dir` OSError → skip),
  `pathcode.py:1128-1133` (walk scandir OSError → `on_error` or continue),
  `pathcode.py:1141-1143` (walk `is_dir` OSError → treated as file).
- Propagation points: top-level `is_dir` (`pathcode.py:169`, `870-876`;
  `pathdoc.rst:926-928`, `:961`).
- Candidate completeness rule: unreadable subdirs are silently skipped;
  unreadable root raises. Downstream must confirm root-vs-subdir boundary.
- `pathscan.py:1950-1965` `test_glob_many_open_files` (fd-exhaustion guard);
  `pathscan.py:1967-1980` `test_glob_dotdot`.

## 5. Proposed discriminating checks (proposed only, not executed)

1. Fixture with `.hidden.csv` at two depths → does `rglob('*.csv')` yield both?
2. Symlinked dir containing `x.csv` → yielded via `rglob('*.csv')` (predict no:
   walk default) vs `glob('*/x.csv')` (predict yes: dironly follows)?
3. Broken symlink named `b.csv` → yielded as match, not descended?
4. `chmod 0` subdir with `y.csv` → silently absent, no raise? Root `chmod 0` → raises?
5. Case variant `Z.CSV` on POSIX vs Windows semantics / `case_sensitive=` override.

## 6. Uncertainties and limits

- `DirEntry.is_dir()` default `follow_symlinks=True` and `fnmatch` dotfile/case
  behavior rest on stdlib docs outside this corpus — cited as candidates only.
- `rglob` doc (`pathdoc.rst:1334-1359`) states no error semantics of its own;
  inheritance from glob machinery is code-inferred.
- No dotfile-specific glob test found in corpus hits; no execution performed.
