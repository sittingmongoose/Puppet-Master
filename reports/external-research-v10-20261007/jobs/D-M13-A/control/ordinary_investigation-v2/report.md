# D-M13-A / control / ordinary_investigation-v2 — PEP 706 extraction filter for a 3.12.3 importer

Target: CPython 3.12.3. Question: should a package importer pass an explicit extraction filter, and which one. Scope: PEP 706 lead (issue 102950 / PR 102953) only; no audit of every tarfile vulnerability.

## 1. Issue, merge, and 3.12.3 availability are three separate facts (Obl. 1)

- **Issue 102950** ("Implement PEP 706 – Filter for tarfile.extractall", created 2023-03-23, closed 2023-05-30) is the tracking issue; it links PRs gh-102953, gh-103832, gh-104128, gh-104327, gh-104382, gh-104548, gh-104583 plus an unofficial backport. It does not itself ship code.
- **PR 102953** ("gh-102950: Implement PEP 706", base `main`, head `tarfile-dir-traversal-sqsq`) merged **2023-04-24T08:58:06Z** by encukou; merge SHA `af530469954e8ad49f1e071ef31c844b9bfda414` (author Petr Viktorin). The merge touched `Lib/tarfile.py`, `Lib/shutil.py`, both test files, `Doc/library/tarfile.rst`, `Doc/library/shutil.rst`, `Doc/whatsnew/3.12.rst`, and one NEWS fragment (1885 lines total, 1786 additions).
- **Release availability:** PEP 706 is `Python-Version: 3.12`; the 3.12 whatsnew and 3.12.3 docs mark `filter` as added in 3.12 (`versionadded`/`versionchanged: 3.12`). The frozen `v3.12.3` `Lib/tarfile.py` contains the implementation (`_get_filtered_attrs`, `fully_trusted_filter`, `tar_filter`, `data_filter`, `_NAMED_FILTERS`, `TarFile.extraction_filter`, `filter` params on `extract`/`extractall`). So 3.12.3 **has** the feature.
- **Default on 3.12.3 is unprotective:** with `filter=None` and `extraction_filter=None`, `_get_filter_function` emits `DeprecationWarning` ("Python 3.14 will, by default, filter…") and falls back to `fully_trusted_filter`. The `'data'` default arrives in 3.14 only. An importer on 3.12.3 that omits `filter` gets legacy behavior plus a warning. Hence the decision must be an **explicit** filter.

## 2. One consequential branch and its callers (Obl. 2)

Traced branch: **outside-destination refusal** in `_get_filtered_attrs(member, dest_path, for_data)` (`tarold.py`, ~lines 755–780), shared by `tar_filter` (`for_data=False`) and `data_filter` (`for_data=True`):

1. Strip leading `/` and `os.sep` from the name; if still absolute (e.g. `C:/foo` on Windows) raise `AbsolutePathError`.
2. `target = realpath(join(dest_path, name))`; if `commonpath([target, dest]) != dest`, raise `OutsideDestinationError`.

This is the directory-traversal gate: absolute paths and `..`/symlink escapes are refused before any write. `data_filter` adds link-target checks (`AbsoluteLinkError`, `LinkOutsideDestinationError`), device refusal (`SpecialFileError`), and mode/ownership sanitization on top of the same gate.

Callers (all in frozen `v3.12.3` `Lib/tarfile.py`): `extractall(path, members, *, filter)` and `extract(member, *, filter)` → `_get_filter_function(filter)` (None→`extraction_filter`→warn+`fully_trusted`; callable passthrough; string via `_NAMED_FILTERS`; unknown string→`ValueError`) → `_get_extract_tarinfo(member, filter_function, path)` (calls `filter_function(tarinfo, path)`; `OSError`/`FilterError`→fatal path, `ExtractError`→nonfatal path; `None`→skip member) → `_extract_one` → `_extract_member`. The `tarfile` CLI also passes `--filter` through to `extractall` (line ~2862). The merge file list shows `Lib/shutil.py` (`unpack_archive`) was extended as a further caller; I did not line-trace that wrapper (bounded stop).

## 3. Regression coverage and what it demonstrates (Obl. 3)

Frozen `v3.12.3` `Lib/test/test_tarfile.py`, class `TestExtractionFilters` (~line 3404): a `check_context(tar, filter)` harness extracting into `outerdir/dest`, with `expect_file` (every extracted path must be accounted for) and `expect_exception`. `ArchiveMaker` builds hostile archives.

Relevant tests (static read; suite **not executed** per no-execution rule): `test_benign_file` (all three filters extract a benign file); `test_absolute` and traversal/symlink tests (`fully_trusted` writes the escape, `tar`/`data` raise `AbsolutePathError`/`OutsideDestinationError`/`LinkOutsideDestinationError`); device tests (`data` raises `SpecialFileError`, `tar`/`fully_trusted` allow); `test_tar_filter`/`test_data_filter`/`test_fully_trusted_filter` unit checks; `test_default_filter_warns` and instance/class `extraction_filter` override tests.

Demonstrated: the traversal gate fires exactly on hostile members, `fully_trusted` preserves legacy behavior, `data` is strictest, and the omitted-filter warning exists. Not demonstrated by these tests: DoS limits, case-insensitive shadowing, or caller cleanup after abort.

## 4. Importer-policy amendment (Obl. 4)

Amendment (small, for a 3.12.3-pinned data/package importer): **require `filter='data'` on every `extract`/`extractall` call (and on `shutil.unpack_archive` where used); treat `FilterError` as fatal with default `errorlevel>=1`; clean up the destination on abort.**

- Why `data`: blocks absolute paths, outside-destination writes, absolute/outside links, and device files, and strips ownership and unsafe mode bits — the documented "most dangerous" set. It matches the future 3.14 default and silences the 3.12 `DeprecationWarning`.
- Use the string form at call sites (supports the documented name lookup); optionally set `TarFile.extraction_filter = staticmethod(tarfile.data_filter)` as defense-in-depth where the importer owns the `TarFile` — a **function**, never a string, since strings are rejected there by design (silent no-op on older Pythons).
- If the importer genuinely needs tar-specific features (devices, exact modes), it may standardize on `filter='tar'` instead, but that choice must be explicit and justified; never rely on the 3.12 default.
- On pinned 3.12.3 no version fallback is needed (filter exists). For shared code also running <3.12, follow the documented fail-or-warn pattern rather than silently extracting.

## 5. Residual limitations; no universal safety (Obl. 5)

`filter='data'` does **not** make extraction universally safe, and the report claims only the refusals above:

- Docs state tarfile with `data` is still "not suited for extracting untrusted files without prior inspection" and "do not prevent denial-of-service attacks."
- On refusal/abort the archive "may be partially extracted"; cleanup is the caller's duty. Extract to a fresh `mkdtemp` directory to defeat pre-existing links and ease cleanup.
- `errorlevel=0` downgrades refusals to skip-and-continue; the importer must not set it silently.
- Uncovered by filters: file-count/total-size/name-length caps, control characters/confusables/foreign separators, expected-extension checks, case-insensitive shadowing, multiple versions of the same member (later overwrites earlier), and symlink evaluation against live disk state. Impose OS-level disk/memory/CPU limits and an allow-list where untrusted input is possible.

## 6. One bounded additional regression; then stop (Obl. 6)

**Proposed (not executed):** one test building a single archive with five members — benign `ok.txt`, absolute-path member, `../escape` member, symlink pointing outside dest, fifo/device member — and asserting, at default errorlevel: `filter='data'` raises `AbsolutePathError`/`OutsideDestinationError`/`LinkOutsideDestinationError`/`SpecialFileError` on the four hostile members while extracting `ok.txt`; `filter='tar'` blocks absolute/escape but allows the fifo; omitted `filter` emits `DeprecationWarning` on 3.12.3. **Stop rule:** when `data` blocks all four hostile members and the benign member passes, the importer decision is supported; no further vulnerability sweep.

Executed vs proposed: executed = static reads of the seven frozen sources below (no code run, no installs, no clones). Proposed = the regression above plus any future 3.14-default re-verification. Optional leads deliberately not taken: unofficial backport PR, follow-up linked PRs (gh-103832…gh-104583), other CVEs, and line-tracing `shutil.unpack_archive`.

## Sources (frozen; released files govern behavior)

| id | URL | version/capture | sha256 (prefix) |
|---|---|---|---|
| pep706 | https://peps.python.org/pep-0706/ | PEP 706, captured 2026-10-07 | 6139a435… |
| tarissue | https://api.github.com/repos/python/cpython/issues/102950 | issue 102950, captured 2026-10-07 | 9ba5b6f7… |
| tarpr | https://api.github.com/repos/python/cpython/pulls/102953 | PR 102953, captured 2026-10-07 | 63cb304e… |
| tarold | https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/tarfile.py | CPython 3.12.3 | 5dd00cc6… |
| tardocold | https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/tarfile.rst | CPython 3.12.3 | 242eb30a… |
| taroldtest | https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_tarfile.py | CPython 3.12.3 | 134c5c87… |
| tarfix | https://api.github.com/repos/python/cpython/commits/af530469954e8ad49f1e071ef31c844b9bfda414 | merge af530469…, captured 2026-10-07 | 789a8691… |

Full hashes in `INPUT_MAP.json`. No additional primary captures were taken (stage `sources/` left empty); mutable-doc claims are capture-pinned. Uncertainty: patch-level drift between 3.12.0 and 3.12.3 was not exhaustively diffed; pre-3.12 behavior out of scope.
