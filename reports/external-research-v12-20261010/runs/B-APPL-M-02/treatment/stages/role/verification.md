# B-APPL-M-02 verification — Applicability/exception (CPython 3.13)

Case ER12-B-APPL-M-02-FRESH. Target: CPython 3.13, POSIX, `Path(root).rglob('*')`. Primaries: Python 3.13.16 docs, `pathlib` (S1) and `glob` (S2), retrieved 2026-10-10T04:19:23Z and 04:19:35Z via web fetch, status 200. Quoted sentences are source statements; dispositions are inference. No benchmark or filesystem snapshot was supplied.

## 1. Dotfiles ordinary in pathlib, special in glob — Supported

Applies to 3.13 defaults: `Path.glob/rglob` any config; `glob.glob` with `include_hidden=False` (default, added 3.11).

Citation: S1, Comparison to glob: "Files beginning with a dot are not special in pathlib. This is like passing `include_hidden=True` to `glob.glob()`." S2, introduction: "By default, files beginning with a dot (`.`) can only be matched by patterns that also start with a dot, unlike `fnmatch.fnmatch()` or `pathlib.Path.glob()`"; examples show `*.gif` skipping `.card.gif`.

Corrected bounded wording: none needed beyond scope above.

Exceptions: explicit dot-leading patterns in `glob` do match dotfiles; `include_hidden=True` removes the restriction. `.env` matches `*` under pathlib but not under default `glob`.

Missing evidence: none for the rule; a fixture run would confirm `.env` inclusion.

## 2. `rglob` returns sorted list, deterministic — Incorrect

Applies to 3.13 `Path.rglob/Path.glob` and `glob.glob`.

Citation: S1, `Path.glob` and `Path.rglob` notes: "The paths are returned in no particular order. If you need a specific order, sort the results." Method text says "yielding all matching files"; examples wrap calls in `sorted(...)`. S2: same unordered note plus "Whether or not the results are sorted depends on the file system."

Corrected wording: "`Path.rglob` yields matches in arbitrary order; wrap with `sorted()` for determinism."

Exceptions: output may appear sorted by filesystem coincidence; unsorted runs are not comparable. Duplicates with multiple `**` (documented for `glob`) further break order assumptions.

Missing evidence: none; ordering rule is explicit.

## 3. Default `recurse_symlinks=False` avoids following symlinks in `**` — Supported with bound

Applies to 3.13 `Path.glob/rglob` default.

Citation: S1, `Path.glob`: "By default, or when the `recurse_symlinks` keyword-only argument is set to `False`, this method follows symlinks except when expanding '**' wildcards." Comparison: "'**' pattern components do not follow symlinks by default in pathlib." `rglob(pattern)` equals `glob('**/'+pattern)`, so `rglob('*')` traverses via `**`.

Corrected wording: "With the default, `**` expansion does not descend into symlinked directories; non-`**` segments still follow symlinks."

Exceptions: a symlink-to-directory may itself be yielded as an entry but not traversed through `**`; `recurse_symlinks=True` traverses (loop/cost risk). `glob.glob(recursive=True)` differs: `**` matches "symbolic links to directories".

Missing evidence: whether the symlink entry itself appears for `rglob('*')` in 3.13; docs imply yes as a match but do not show it. A POSIX fixture with a dir symlink would resolve it.

## 4. Inaccessible subtree guarantees PermissionError — Incorrect (opposite)

Applies to 3.13 `Path.glob/rglob` and `glob.glob/iglob`.

Citation: S1, both methods: "Any `OSError` exceptions raised from scanning the filesystem are suppressed. This includes `PermissionError` when accessing directories without read permission." "Changed in version 3.13: Any `OSError` ... are suppressed. In previous versions, such exceptions are suppressed in many cases, but not all." S2 carries the same suppression note.

Corrected wording: "In 3.13, unreadable subtrees are silently skipped by `rglob`; no PermissionError propagates."

Exceptions: `Path.iterdir` still raises `OSError` "if the path is not a directory or otherwise inaccessible" — do not generalize that policy to glob. Silent skipping means incompleteness without signal.

Missing evidence: behavior when the root itself is unreadable (suppressed to empty vs error) is not spelled out for glob; a permission-stripped root probe would resolve it.

## 5. `glob.glob('~/project/*')` expands `~` by itself — Incorrect

Applies to all 3.13 `glob` calls with a literal pattern.

Citation: S2, introduction: "No tilde expansion is done ... not by actually invoking a subshell." "For tilde and shell variable expansion, use `os.path.expanduser()` and `os.path.expandvars()`."

Corrected wording: "Call `glob.glob(os.path.expanduser('~/project/*'))`; the module never expands `~` itself."

Exceptions: none in-library. A shell may expand `~` before Python sees the string, but a literal `'~/...'` inside Python is not expanded; `root_dir`/`dir_fd` do not change this.

Missing evidence: none.

## 6. Guaranteed complete point-in-time inventory under 100 ms — Unsupported

Applies to the described directory (changing files, unreadable subtree, symlink; no snapshot or benchmark).

Citation: S2, `glob.glob`: "If a file ... is removed or added during the call ..., whether a path name for that file will be included is unspecified." S1, `iterdir`: post-iterator additions/removals "unspecified". S2: "`**` in large directory trees may consume an inordinate amount of time"; duplicates possible; ordering unordered. Claim 4 suppression guarantees silent gaps. No timing or atomicity statement exists in either page.

Corrected wording: "`rglob('*')` is a best-effort, non-atomic listing with no completeness or latency contract."

Exceptions: freezing the filesystem (snapshot/mount freeze) plus error accounting could bound completeness, but that is a different deployment, not this API contract.

Missing evidence to ever support the claim: stabilized snapshot procedure, permission-error accounting, duplicate handling, and a measured benchmark on the target filesystem; none supplied.

## Acceptance checks

1. Fixture inventory: build `root/` with `.env`, `src/main.py`, symlink `link/` to another dir, and `noperm/` chmod 000. Run `list(Path(root).rglob('*'))` on CPython 3.13: must not raise; `.env` present; `sorted()` of two runs identical while raw order may differ; `link/` not descended. Restore perms and remove fixture.
2. Tilde and change-robustness: assert `glob.glob('~/project/*')` does not expand (compare against `glob.glob(os.path.expanduser('~/project/*'))`), and document that a file added mid-scan has unspecified inclusion — rerun after quiesce for a stable comparison.
