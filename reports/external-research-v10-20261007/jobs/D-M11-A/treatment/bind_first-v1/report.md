# D-M11-A bind_first — tarfile extraction policy for CPython 3.14.0 (bounded final)

Target: Linux package-ingest sandbox, CPython **3.14.0**, untrusted tars via `tarfile.extract` / `extractall`.

## 0. Binding (before derivations)

- **Release bound:** CPython **3.14.0** governs; implementation file `tarnew.py` (v3.14.0, sha `07e226f1…`) and doc `tardocnew.rst` (v3.14.0, sha `901ab697…`) take precedence over PEP prose. Comparison point: `tarold.py` v3.12.3 (sha `5dd00cc6…`).
- **API/default bound:** `extractall(path=".",…,filter=None)`, `extract(member,path="",…,filter=None)`; `TarFile.extraction_filter=None` (class default) + `filter=None` → **`data_filter`** on 3.14.0 (`tarnew.py:2370-2376`), no warning. On 3.12.3 the same omission → `DeprecationWarning` + `fully_trusted_filter` (`tarold.py` ~2223-2226). PEP 706 rule “3.12–3.13 warn+fully_trusted; 3.14+ data” confirmed by issue 121999 (closed 2024-07-26, PR 122002).
- **Path domain:** `dest_path=path` joined + `realpath(ALLOW_MISSING)`; strips leading `/`+`os.sep`; rejects still-absolute (`AbsolutePathError`), outside-destination (`OutsideDestinationError`, `commonpath` check). Symlink-aware via realpath. Applies per-member at extract time; directory fixup re-applies filter (3.14).
- **Type domain:** `data` covers reg/hardlink/dir/symlink, rejects devices/FIFOs (`SpecialFileError`); `tar` covers path+mode only, keeps specials/ownership/links; `fully_trusted` = identity (no domain). Link domain only in `data`: abs-link + outside-dest rejected.
- **Unit domain:** filter signature `(member: TarInfo, path: str) -> TarInfo|None`; `None` = skip; `FilterError/OSError` = fatal path; `ExtractError` = nonfatal path; `errorlevel` 0/1/2 selects ignore/abort-all-fatal/abort-all. Default `errorlevel=1`.
- **Applicability:** only `extract`/`extractall` disk-write paths under stated `filter`/`errorlevel`/`extraction_filter`. Not `extractfile` (fileobj, no path write), `add` (creation-side filter), listing APIs, or pre-3.12 (no filter param — **unknown/unverified here**, no source).
- **Unknowns:** exact 3.14.0 `shutil.unpack_archive` passthrough (issue lists it updated, bytes not in corpus); WASI symlink behavior (issue checkbox, no bytes); Windows `C:/` handling beyond code branch (not executed).

## Findings (6 obligations, ≤8 items)

**1. Old concern → lineage → 3.14.0 default.** Old: `extractall` honored metadata as-is; traversal/abs-path/escape-via-link/device/mode/ownership could harm destination; docs said “never extract untrusted without inspection” but inspection was unspecified and often skipped/wrong (PEP 706 Motivation). Lineage: PEP 706 (Final, 3.12) → issue 102950 (closed 2023-05-30) → PR 102953 (merged 2023-04-24, `af53046`) + follow-ups 103832/104128/104327/104382/104548/104583 → 3.12–3.13 warn+`fully_trusted` → issue 121999/PR 122002 → **3.14.0 default `data`**. Do not cite the old warning as current-omitted behavior on 3.14.0.

**2. Omitted vs explicit filter; errorlevel.** Omitted (`None`+`None`) = `data` on 3.14.0; explicit callable used as-is; explicit `'data'/'tar'/'fully_trusted'` via `_NAMED_FILTERS`, else `ValueError`; `extraction_filter` string → `TypeError` (must assign function, else silent no-op on old versions). `errorlevel=0` logs+skips even fatal filter refusals (partial tree, hides attacks); `=1` (default) aborts on fatal, logs nonfatal; `>1` raises both. `None` filter-return = skip, not error. Directory-fixup failures only logged (`_log_no_directory_fixup`). **Policy:** pass `filter='data'` explicitly (version-uniform, no reliance on default); keep `errorlevel≥1` for untrusted input; treat abort ⇒ wipe destination (partial extraction is caller cleanup).

**3. File/link/path separation; destination assumptions.** `data`: strips `/`, blocks abs/outside paths, blocks abs/outside links, rejects specials, masks mode (`&0o755`, reg `|0o600`, exec-bit rule), nulls mode for dir/symlink, nulls ownership. `tar`: only path+mode masking; preserves specials/ownership/absolute-link risk. `fully_trusted`: no checks. Destination = `path` arg (`extractall` default `"."`, `extract` default `""`); assumed dedicated empty dir, evaluated with current-FS realpath (follows pre-existing symlinks). Later members overwrite earlier. Case-insensitive shadowing, control-char/confusable names, extension hazards: **not** covered — allow-list separately.

**4. Residual limits (security + exhaustion).** Doc: no filter blocks *all* dangerous features. No built-in caps on file count, total bytes, single-file size, decompression ratio, mtime/ownership tricks beyond nulling, or live-destination TOCTOU (attacker mutating dest during extract). `errorlevel=0` + link-fallback-to-regular-file (non-link systems) can mask refusals. **Policy:** pre-scan (`getmembers`, no write): cap count/total/single size; enforce name allow-list + expected extensions; extract to fresh dir with OS disk/quota limits; abort ⇒ discard dir; never `fully_trusted` for untrusted; `tar` only for faithful trusted backups.

**5. Non-projection guard.** The pre-filter/`fully_trusted` warning applies **only** to: explicit `fully_trusted`, 3.12–3.13 omitted-filter, `errorlevel=0` swallowing, or custom filters that ignore checks. It does **not** apply to 3.14.0 omitted-filter (=`data`), explicit `data`/`tar` (within their domains), `None`-skip custom filters, or non-write paths (`extractfile`/`getmember`/list). Do not label “`extractall` is unsafe” without `(release, filter, errorlevel, member-type)` tuple.

**6. Regression checks (proposed, not executed) + compat policy.** No tests executed (read-only corpus; no project-code execution). Proposed checks, each version-discriminating on `sys.version_info` + `TarFile._get_filter_function` behavior:
  a. default: 3.14 `None/None→data`, no warning; 3.12–3.13 warns + `fully_trusted`;
  b. `../`, `/abs`, `C:/`-style rejected under `data`, honored under `fully_trusted`;
  c. symlink/hardlink outside-dest rejected under `data`, allowed under `tar`;
  d. device/FIFO rejected under `data`, allowed under `tar`;
  e. mode/ownership normalized under `data` (spot-check `0o777→0o755`-family, `uid→None`);
  f. `errorlevel` 0 skips vs 1 aborts on a refusing member; partial-tree cleanup verified;
  g. `extraction_filter='data'` raises `TypeError`; `filter='bogus'` raises `ValueError`.
  Compat: `filter='data'` literal on every untrusted call (works 3.12+); optional global `TarFile.extraction_filter = staticmethod(data_filter)`; gate expectations by version; refuse to run untrusted ingest on `<3.12` (no filter support).

## Conditions / uncertainty / negative leads

- Conditions: Linux, 3.14.0 bytes as above; `path` is caller-controlled empty dir; `members=None` iterates archive order.
- Uncertainty: `shutil` wrapper text, WASI, Windows-only branches, and `<3.12` behavior unverified (no bytes). `tardocnew`/`tartest` sampled by grep, not full read, under deadline.
- Negative leads: no size/count cap found in filter code or doc grep; no change to `extractfile` filtering (out of scope by design).
- Opportunity (optional): add corpus bytes for `shutil` 3.14 wrapper + a minimal size-cap helper test.

## Sources

Frozen corpus only; no new captures. `sources/` empty. Identities: PEP 706 (`https://peps.python.org/pep-0706/`, 2026-10-07, `6139a435…`); issue 102950 (`…/issues/102950`, `9ba5b6f7…`); PR 102953 (`…/pulls/102953`, `63cb304e…`, merged `af53046`); issue 121999 (`…/issues/121999`, `e88ab5fa…`); `tarold.py` v3.12.3 (`5dd00cc6…`); `tarnew.py` v3.14.0 (`07e226f1…`); `tardocnew.rst` v3.14.0 (`901ab697…`); `tartest.py` v3.14.0 (`5149edfc…`). Released files govern behavior claims.

*Proposed checks above are designs; executed tests: none.*
