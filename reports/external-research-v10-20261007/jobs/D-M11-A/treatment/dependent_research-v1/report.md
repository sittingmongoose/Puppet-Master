# D-M11-A dependent_research — tarfile policy for CPython 3.14.0 (bounded final)

Target: Linux package-ingest sandbox, CPython **3.14.0**, untrusted tars via `extract`/`extractall`. Builds on predecessor `bind_first-v1`; all behavior claims below were re-verified against the frozen bytes in this stage.

## 0. Binding (precedes every derivation)

- **Release:** 3.14.0 governs. `tarnew.py` v3.14.0 (sha `07e226f1…`) and `tardocnew.rst` v3.14.0 (sha `901ab697…`) take precedence over PEP prose; `tarold.py` v3.12.3 (sha `5dd00cc6…`) is the comparison point only.
- **API:** `extractall(path=".",…,filter=None)`, `extract(member,path="",…,filter=None)`; both funnel through `_get_extract_tarinfo` (`tarnew.py:2481`) into fatal/nonfatal handlers.
- **Destination:** `dest_path` = the `path` arg, resolved with `realpath(ALLOW_MISSING)` at filter time (`tarnew.py:784,794`).
- **Scope:** disk-write paths under (`filter`, `errorlevel`, `extraction_filter`) only. Not `extractfile` (no filter param, returns fileobj), `add`, listing APIs, or pre-3.12 (no filter param; unverified, no bytes).

## Findings

**1. Old concern → lineage → 3.14.0 default.** Old: docs warned "never extract archives from untrusted sources without prior inspection," but the inspection was unspecified, often skipped or wrong, yielding issues such as CVE-2007-4559 (PEP 706 Motivation). Lineage: PEP 706 (Final) → issue 102950 (closed 2023-05-30) → PR 102953 (merged, `af53046`) plus follow-ups 103832/104128/104327/104382/104548/104583 → 3.12–3.13 warn + `fully_trusted` → issue 121999 (closed 2024-07-26; checklist: change default, drop warning, update tarfile/shutil docs+tests, add default-is-`data` test) → **3.14.0: omitted filter = `data`, no warning** (`tarnew.py:2370-2374`; doc: "The default filter is set to `data`"; `tartest.py:743`). Never cite the pre-filter warning as 3.14.0 omitted-filter behavior.

**2. Omitted vs explicit filter; errorlevel.** Omitted (`filter=None` + `extraction_filter=None`) → `data_filter` on 3.14.0; on 3.12.3 the same omission → `DeprecationWarning` + `fully_trusted_filter` (`tarold.py:2217-2226`, warning text names the 3.14 change). Explicit callable used as-is; `'data'/'tar'/'fully_trusted'` via `_NAMED_FILTERS`, else `ValueError`; string `extraction_filter` → `TypeError` (silent no-op risk on old versions if assigned a string). Filter exceptions (`OSError`, `UnicodeEncodeError`, `FilterError`) → `_handle_fatal_error`; `ExtractError` → `_handle_nonfatal_error`; `None` return → skip, not error (`tarnew.py:2495-2529`). `errorlevel=0` logs+skips even fatal refusals (partial tree, hides attacks); `1` (default) raises fatal; `2` raises nonfatal too. Doc: abort may leave a **partial extraction; no cleanup**. Policy: pass `filter='data'` explicitly (uniform across 3.12+); keep `errorlevel≥1`; abort ⇒ wipe destination.

**3. File/link/path domains; destination assumptions.** `data` (`_get_filtered_attrs`, `tarnew.py:781-847`): strips leading `/`+`os.sep`; rejects still-absolute (`AbsolutePathError`, e.g. `C:/`); rejects outside-destination via `realpath`+`commonpath` (`OutsideDestinationError`); rejects devices/FIFOs (`SpecialFileError`); mode `&0o755`, regular `|0o600` with exec-bit rule, `None` for dir/symlink; ownership nulled; absolute links and outside-destination links rejected (`AbsoluteLinkError`, `LinkOutsideDestinationError`; symlink target resolved against member's dirname, hardlink against dest root). `tar`: path+mode masking only — keeps specials, ownership, absolute/outside-link risk. `fully_trusted`: identity (`return member`). Destination assumes a caller-controlled, dedicated, empty dir; checks evaluate against **current** filesystem state (pre-existing symlinks followed; later members overwrite earlier). Directory attribute fixup re-applies the filter and only logs failures. Not covered: case-insensitive shadowing, control-char/confusable names, extension hazards — allow-list separately.

**4. Residual security + resource-exhaustion limits.** No built-in caps found in filter code or doc: file count, total/single size, decompression ratio, mtime tricks beyond ownership-nulling, or TOCTOU on a live destination. `errorlevel=0` swallows refusals; link-fallback-to-regular-file on non-link systems can mask intent. Policy: pre-scan with `getmembers` (no write) enforcing count/total/single-size caps plus name/extension allow-list; extract into a fresh dir under OS disk/quota limits; abort ⇒ discard dir; never `fully_trusted` for untrusted input; `tar` only for faithful trusted backups.

**5. Non-projection guard.** The pre-filter/`fully_trusted` warning applies **only** to: explicit `fully_trusted`, 3.12–3.13 omitted-filter, `errorlevel=0` swallowing, or custom filters skipping checks. It does **not** apply to 3.14.0 omitted-filter (=`data`), explicit `data`/`tar` within their domains, `None`-skip custom filters, or non-write paths (`extractfile`, `getmember`, list). Never label "`extractall` is unsafe" without the `(release, filter, errorlevel, member-type)` tuple.

**6. Regression checks (proposed, not executed) + compat policy.** No tests executed: read-only corpus, no project-code execution permitted. Proposed, each gated on `sys.version_info` + `_get_filter_function` behavior: (a) default `None/None`→`data` without warning on 3.14, warn+`fully_trusted` on 3.12–3.13; (b) `../`, `/abs`, `C:/`-style rejected under `data`, honored under `fully_trusted`; (c) symlink/hardlink outside-dest rejected under `data`, allowed under `tar`; (d) device/FIFO rejected under `data`, allowed under `tar`; (e) mode/ownership normalized under `data` (`0o777→0o755`-family, `uid→None`); (f) `errorlevel` 0 skips vs 1 aborts on a refusing member, with partial-tree cleanup verified; (g) `extraction_filter='data'`→`TypeError`, `filter='bogus'`→`ValueError`. Compat: `filter='data'` literal on every untrusted call (valid 3.12+); optional global `TarFile.extraction_filter = staticmethod(data_filter)`; refuse untrusted ingest on `<3.12` (no filter support).

## Conditions / uncertainty / negative leads

- Conditions: Linux, 3.14.0 bytes above; `members=None` iterates archive order; `path` caller-controlled empty dir.
- Uncertainty: `shutil.unpack_archive` 3.14 passthrough text, WASI symlink behavior, Windows-only branches, `<3.12` behavior — unverified (no bytes). PEP HTML read via tag-stripped sections; doc/test files sampled by targeted reads, not full cover, under deadline.
- Negative leads: no size/count/quota cap in filter code or doc; no filter param on `extractfile` (by design, out of scope).
- Opportunity (optional): add `shutil` 3.14 wrapper bytes + a minimal size-cap helper check to the corpus.

## Sources

Frozen corpus only; no new captures, `sources/` intentionally empty. PEP 706 (`https://peps.python.org/pep-0706/`, 2026-10-07, `6139a435…`); issue 102950 (`…/issues/102950`, `9ba5b6f7…`); PR 102953 (`…/pulls/102953`, `63cb304e…`, merged `af53046`); issue 121999 (`…/issues/121999`, `e88ab5fa…`, closed 2024-07-26); `tarold.py` v3.12.3 (`5dd00cc6…`); `tarnew.py` v3.14.0 (`07e226f1…`); `tardocnew.rst` v3.14.0 (`901ab697…`); `tartest.py` v3.14.0 (`5149edfc…`). Released files govern behavior claims.

*Proposed checks are designs; executed tests: none.*
