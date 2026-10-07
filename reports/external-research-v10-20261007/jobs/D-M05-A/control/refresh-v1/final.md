# D-M05-A control refresh — extraction policy 3.12.3 → 3.14.0

Scope: refresh only the extraction-policy module for sandbox archive import ("Import archive", formerly "Import bundle"), local Linux worker, untrusted tars, filter argument omitted, runtime 3.12.3 → 3.14.0. Method: competent full refresh; independently inspected the exact frozen bytes of both releases (implementation + docs); all hashes verified; no live interpreter, no code execution, no installs. Prior state treated throughout as untrusted candidate input, never truth.

## Material findings

**R1 — Prior source and dependency identities preserved.** All mapped bytes verified byte-identical: `tarold` 5dd00cc6…cc8, `tardocold` 242eb30a…e7b99, `tarnew` 07e226f1…2330d, `tardocnew` 901ab697…80d9f, prior-state 48ca796f…7dca8 (all match mapped values). Dependency identities retained exactly with no rename or substitution: `TarFile.extraction_filter`, `_NAMED_FILTERS`, `fully_trusted_filter`/`tar_filter`/`data_filter`, `_get_filtered_attrs`, `TarFile.errorlevel` + fatal/nonfatal handlers, `os.path.realpath/commonpath/isabs`, `TarInfo.isreg/islnk/isdir/issym/replace`, `getmembers/getnames/list`, `numeric_owner`.

**R2 — No-op rename disposed separately; zero semantic effect.** "Import bundle" → "Import archive" is UI/name only per changes.json ("no behavior change"). It invalidates nothing: no code path, config value, default, or source line changes. Every semantic invalidation below comes solely from the runtime change. Only labels/prose need the new name; no re-validation is owed to the rename itself.

**R3 — Omitted-filter default flips from warn+trusted to silent data.** 3.12.3: `filter=None` with `extraction_filter=None` emits `DeprecationWarning` ("Python 3.14 will, by default, filter…") and returns `fully_trusted_filter`, i.e. member unchanged (tarold L2217-2226; tardocold L596-603, L980-987). 3.14.0: the same omission returns `data_filter` directly with no warning (tarnew L2370-2374; tardocnew L649-650, L1045-1053, L44-48, L563-564). The `DeprecationWarning`s remaining in tarnew (L939-955) concern only the unrelated undocumented `TarInfo.tarfile` attribute (removal in 3.16). Omission therefore breaks semantically: dangerous-by-default becomes restrictive-by-default.

**R4 — Named-filter ladder kept; two 3.14 mechanics deltas.** Ladder prose and `_NAMED_FILTERS` membership are unchanged (`fully_trusted`/`tar`/`data`; tarold L833-837, tarnew L864-868; docs old L964-978, new L1032-1043). Mode masking (`& 0o755`), data-only exec-bit/ownership handling, and the refusal taxonomy (`AbsolutePath`/`OutsideDestination`/`SpecialFile`/`AbsoluteLink`/`LinkOutsideDestination`) are unchanged. Two deltas in `_get_filtered_attrs`: (a) all three `realpath` calls now pass `strict=os.path.ALLOW_MISSING` (new L784/L792/L826 vs old L758/L771/L810); (b) the data path normalizes `linkname` via `os.path.normpath` before the link check (new ~L818-820), documented with a meaning-may-change caveat for links traversing symlinks plus `versionchanged 3.14` (tardocnew L1108-1112, L1145-1147). Internal plumbing: `_get_extract_tarinfo` now returns `(filtered, unfiltered)` and `extractall` re-applies the filter at directory fixup with `_log_no_directory_fixup` — same contract, new shape.

**R5 — Security claims revisited: safer default, still insufficient alone.** Prior "omitted filter is unsafe on 3.12" becomes "omitted filter enforces data on 3.14" — but docs add that no filter blocks all dangerous features (new warning tardocnew L1019-1022; `data_filter` note L1142-1143). The further-verification list is retained and gains one 3.14 bullet, "Disallow symbolic links if you do not need the functionality" (new L1160-1199 vs old L1083-1116; anchor `_tarfile-further-verification` added). Never-extract-untrusted-without-inspection and no-DoS-protection warnings persist on both. Concrete limits/allow-lists stay caller-owned and unresolved (U4). Recommendation: keep explicit `filter='data'` plus the full extras; do not rely on the new default alone.

**R6 — Compatibility claims revisited.** The detection pattern (`hasattr(tarfile,'data_filter')`, `getattr` fallback, backport note) is unchanged (old L1118-1153, new L1200-1245). New guidance: pass `filter='data'` explicitly to cover ≤3.13 with a less-secure default (tardocnew L540-543, L563-564). Migration risk: archives that extracted cleanly under 3.12's trusted default may now raise `FilterError` on 3.14 (absolute/outside links, devices, ownership/mode rewrites) — desired for untrusted input, breaking for trusted bundles relying on preserved metadata (feeds U1/U5). `numeric_owner` remains moot under data (ownership nulled).

**R7 — Error and config contracts retained.** `errorlevel` 0/1/2 semantics, fatal (`FilterError`/`OSError`) vs non-fatal (`ExtractError`) split, partial-extraction-no-cleanup caveat, and the custom-filter contract (`TarInfo` | `None` | raise) are identical in code (old L2341-2358, new L2532-2552) and docs (errorlevel old L563-582, new L616-636; filter-errors old L1071-1080, new L1150-1159). `extraction_filter` is still a None-or-callable class attribute defaulting to `None` (old L1639, new L1724); string → `TypeError`, unknown name → `ValueError`, instance/subclass/class-global (`staticmethod`) scoping unchanged. The configured errorlevel/logging/cleanup choice (U2) and per-call vs instance vs global scope (U3) stay unresolved.

**R8 — Dispositions.** RETAINED: ladder selection (F2), mechanics modulo R4 deltas (F3), error contract (F4), config mechanism (F5), extras list plus symlink bullet (F6), detection/inspection primitives (F7). CHANGED: omitted-filter behavior F1 (warn+trusted → silent data), security posture of omission, compat guidance (explicit data for ≤3.13), link normalization. UNRESOLVED (carried forward, never already-covered): U1 bundle feature needs; U2 errorlevel/cleanup owner; U3 config scope and top-level-app status; U4 concrete limits/allow-list/inspection procedure; U5 fleet range (3.14 default now known, range decision open); U6 no live-interpreter verification. "Already-covered" in this report means specified-by-sources only — never implemented or tested.

## Dependency map

| Dependency | Disposition | Note |
|---|---|---|
| `extraction_filter`, `_NAMED_FILTERS`, 3 named filters | retained | same names/wrappers; default consequence changed (R3) |
| `_get_filtered_attrs` | changed | `ALLOW_MISSING` realpath; normpath linkname (R4) |
| `errorlevel`, fatal/nonfatal handlers, `FilterError` taxonomy | retained | identical code + docs (R7) |
| `os.path.*`, `TarInfo.*`, inspection API, `numeric_owner` | retained | same roles; ownership still nulled under data |
| concrete limits/allow-list/errorlevel choice | unresolved | U2/U4; caller-owned values not in sources |

## Proposed regression checks (proposed, NOT performed)

1. Omitted-filter probe (discriminates R3): in a pinned 3.14 interpreter, `_get_filter_function(None)` with `extraction_filter=None` resolves to `data_filter` with no warning; on pinned 3.12.3 it warns and resolves to `fully_trusted_filter`.
2. Refusal flip: one corpus (absolute path, absolute symlink, fifo, setuid regular file) extracts silently on 3.12 default but raises the corresponding `FilterError` subclasses on 3.14 default.
3. Link normalization: a member whose linkname contains internal `a/../b` keeps its linkname on 3.12 but is rewritten via `normpath` on 3.14 (record the symlink-traversal caveat).
4. Config typing on both releases: `extraction_filter='data'` → `TypeError`; `filter='nope'` → `ValueError`; `extraction_filter=data_filter` on 3.12 equals the 3.14 omitted default.
5. Back-compat parity: explicit `filter='data'` yields identical refusals on 3.12.3 and 3.14.0 over the same corpus, gated by `hasattr(tarfile,'data_filter')`.
6. DoS extras: caller enforces temp-dir, count/bytes/name-length limits, and filename allow-list on both releases; filter alone is asserted insufficient per both hints sections.

Performed checks (distinct): SHA-256 verification of all mapped bytes (match) and static line-range inspection of both exact releases. No code executed, nothing installed, no network fetch, no live interpreter.

## Conditions and uncertainty

Conditions: Linux worker; both filter argument and `extraction_filter` unset for default claims; released implementation files govern over prose where they differ. Uncertainty: no live-interpreter run (U6), so warning text/behavior is source-verified only; `ALLOW_MISSING` edge semantics beyond the call sites not probed; bundle-specific needs/limits (U1/U4) unknowable from these sources. Optional: adopt the docs' explicit-`data` pattern now so 3.12 and 3.14 behave identically, and add the new symlink-disallow bullet to the inspection checklist.
