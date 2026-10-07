# D-M05-A prior-state seed (common) — Import bundle extraction policy v1

Scope: prior brief only (CPython 3.12.3 Linux package importer, untrusted tars, filter argument omitted).
This is a good-faith prior proposal, NOT evaluator truth. No changes/refresh applied.

## F1 — Omitted filter on 3.12 warns and falls back to fully_trusted
- Proposition: with `filter=None` and `TarFile.extraction_filter=None`, `extract`/`extractall` emit `DeprecationWarning` ("Python 3.14 will, by default, filter...") and use `fully_trusted_filter` (member unchanged), matching pre-3.12 dangerous behavior; docs state `data` becomes default in 3.14+.
- Conditions: CPython 3.12 behavior with both filter argument and `extraction_filter` unset.
- Sources: `tarold` tarold.py L2217-2226 (`_get_filter_function`); `tardocold` tardocold.rst L980-987, L596-603.
- Dependencies: `TarFile.extraction_filter`, `_NAMED_FILTERS`, `fully_trusted_filter`.
- Already-covered meaning: brief's omitted-filter case is already specified by F1 (warn + trusted fallback on 3.12); any proposal to "omit filter safely" without setting one is already-covered-and-unsafe under these sources.
- Uncertainty: exact 3.12.3 warning text verified only from these prior sources, not a live interpreter run.

## F2 — Named filter ladder: fully_trusted < tar < data
- Proposition: `fully_trusted` honors all metadata (use only if archive fully trusted or own verification done). `tar` honors most Unix features but blocks likely-surprising/malicious ones. `data` ignores/blocks most Unix-specific features; intended for cross-platform data archives.
- Conditions: caller passes `filter='fully_trusted'|'tar'|'data'` or callable; untrusted input favors `data` per extractall warning.
- Sources: `tardocold` L964-978, L503-504; `tarold` L833-837.
- Dependencies: `_get_filtered_attrs(for_data=False|True)`, `tar_filter`, `data_filter`.
- Already-covered: choosing among the three named behaviors needs no new primitive; brief's "bounded policy" is a selection + config question, not a new filter invention.
- Uncertainty: which rung the bundle needs (symlinks? devices? modes? ownership?) is unresolved (U1).

## F3 — What tar+data concretely enforce (prior-source mechanics)
- Proposition: both strip leading `/`/`os.sep`, refuse still-absolute paths (`AbsolutePathError`) and outside-destination targets after realpath join (`OutsideDestinationError`), and mask mode with `0o755` (clear setuid/setgid/sticky + go-w). `data` additionally: refuses absolute/outside links (`AbsoluteLinkError`/`LinkOutsideDestinationError`, even where symlinks unsupported), refuses non-reg/dir/link special files (`SpecialFileError` incl. devices/pipes), forces owner rw + conditional exec-bit clearing on reg/hardlink (`mode|=0o600`, clear `0o111` unless user-exec), sets mode None for dirs/symlinks, and nulls uid/gid/uname/gname.
- Conditions: Linux CPython; `dest_path` realpath join check; member-type branches as coded.
- Sources: `tarold` L755-816; `tardocold` L1020-1068.
- Dependencies: `os.path.realpath/commonpath/isabs`, `TarInfo.isreg/islnk/isdir/issym`, `TarInfo.replace`.
- Already-covered: path-traversal, abs-path, link-escape, device-file, mode/ownership handling for the chosen rung are already specified here; re-deriving them per-finding is duplication.
- Uncertainty: symlink-following edge cases beyond the coded realpath checks not probed.

## F4 — Filter-error taxonomy and abort/skip contract
- Proposition: refusals raise `FilterError` subclasses (`AbsolutePathError`, `OutsideDestinationError`, `SpecialFileError`, `AbsoluteLinkError`, `LinkOutsideDestinationError`); `FilterError`/`OSError` are fatal, `ExtractError` non-fatal. `errorlevel=0` logs and skips the member and continues; `>=1` raises fatal (`OSError`/`FilterError`); `==2` also raises non-fatal as `TarError`. On abort, `extractall` may leave a partial extraction with no cleanup; user must clean up. Custom filters: `FilterError` = fatal, `ExtractError` = non-fatal; may also return modified TarInfo or None (skip).
- Conditions: default `errorlevel=1`; applies to `extract`/`extractall` paths via `_get_extract_tarinfo`/`_extract_one`.
- Sources: `tarold` L723-754, L2304-2358; `tardocold` L221-251, L563-582, L989-1006, L1071-1080.
- Dependencies: `TarFile.errorlevel`, `TarFile._handle_fatal_error/_handle_nonfatal_error`.
- Already-covered: "refuse vs skip vs abort" semantics are already fixed by this contract; the remaining choice is the configured `errorlevel` (U2).
- Uncertainty: none material on the contract; operational choice unresolved.

## F5 — How defaults and overrides are configured (and misconfigured)
- Proposition: per-call `filter` accepts callable or registered name string, else `ValueError("filter ... not found")`. `extraction_filter` accepts only None/callable; string names raise TypeError. It may be set on instance, subclass, or `TarFile` class-global (wrap in `staticmethod`; best practice: top-level app/site config only). Setting `extraction_filter=data_filter` opts into future default early. Callable signature `filter(member, path, /) -> TarInfo | None`; called just before each member, may consider live disk state.
- Conditions: 3.12+ feature present; global default affects all tarfile uses.
- Sources: `tarold` L2227-2238; `tardocold` L584-611, L989-998.
- Dependencies: `TarFile.extraction_filter`, `_NAMED_FILTERS`.
- Already-covered: mechanism for "set once vs per-call" already exists; no new config surface needed.
- Uncertainty: whether importer is a top-level app where a global default is appropriate (U3).

## F6 — Even `data` is insufficient alone for untrusted archives
- Proposition: docs warn never to extract untrusted archives without prior inspection, and `data` does not prevent denial-of-service. Required extras (incomplete list): extract to a new temp dir (`tempfile.mkdtemp`), OS-level disk/memory/CPU limits, filename allow-list (control chars, confusables, foreign separators), expected-extension checks, limits on file count/total bytes/name+symlink length/per-file size, case-insensitive shadowing checks; plus multiple-versions-overwrite and live-destination-tampering caveats.
- Conditions: untrusted input regardless of filter rung.
- Sources: `tardocold` L496-504, L1083-1116.
- Dependencies: caller-owned inspection/limits/cleanup; `TarFile.getmembers/getnames/list` for inspection.
- Already-covered: "pass data and done" is already refuted by sources; a complete policy must add these extras with concrete values (U4).
- Uncertainty: concrete limit values and allow-list for this bundle are not in prior sources.

## F7 — Compatibility and inspection surface
- Proposition: extraction filters added in 3.12 (filter params on `extract`/`extractall`), may be backported as security updates; detect with `hasattr(tarfile, 'data_filter')`, not version checks; back-compat pattern sets `extraction_filter` via `getattr(tarfile, 'data_filter', fallback-lambda)`. Pre-extraction inspection can use `getmembers/getnames/list/next`; `numeric_owner` selects numeric vs named ownership (moot under `data`, which nulls ownership); directory attrs applied after members.
- Conditions: fleet may span pre/post-3.12 if backports uneven.
- Sources: `tardocold` L1118-1138+, L435-474, L476-489; `tarold` L2240-2284.
- Dependencies: `tarfile.data_filter` presence, `TarFile.getmembers/extractall(numeric_owner)`.
- Already-covered: version-detection and inspection primitives already exist.
- Uncertainty: brief pins 3.12.3 only; whether older/newer interpreters must be supported is unresolved (U5).

## Explicit already-covered meaning
"Already-covered" above means: the prior sources fully specify that behavior/contract, so the remaining work is configuration and bundle-specific values — not re-research. It does not mean implemented, tested, or adequate for untrusted input (see F6).

## Unresolved items
- U1: bundle's required tar features (symlinks? hardlinks? devices/fifos? modes? ownership? pax/gnu/ustar/sparse/longname?) — prior sources define the rungs but not the bundle's needs.
- U2: chosen `errorlevel` (0 skip-and-continue vs 1 abort-on-fatal vs 2 strict) and logging/cleanup owner.
- U3: per-call `filter='data'` vs instance `extraction_filter` vs global default; top-level-app status.
- U4: concrete inspection procedure + DoS limits (count/bytes/name lengths), allow-list, temp-dir lifecycle.
- U5: interpreter range beyond pinned 3.12.3 (backport variance, 3.14 default change readiness).
- U6: no live-interpreter verification performed (bounded source work only).

## Timings/usage (observed)
- Dispatch-to-delivery ceiling: 4 minutes (this run worked within it; no clock access to stamp precisely).
- Counters/billing: unknown → null. No model-usage counters observed in-session.
- Retrieval: 1 brief + 2 mapped sources only; no other cases/arms/evaluators/campaign/ER9 reads.
