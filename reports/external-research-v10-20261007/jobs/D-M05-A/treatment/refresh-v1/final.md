# D-M05-A treatment refresh — extraction-policy module (CPython 3.12.3 → 3.14.0)

Refresh-only. Prior: untrusted tars, local Linux worker, filter omitted, runtime 3.12.3. Material change: runtime 3.14.0; untrusted input and omitted filter unchanged. No-op: 'Import bundle' → 'Import archive'. Method: no-op disposed separately; prior findings reused only where declared dependencies verified unchanged in exact release bytes; changed closure re-researched. Seed and prior state treated as untrusted candidate input, never truth. No code executed, no installs.

## Obligation map

- O1 identities → R2–R7 cite exact IDs, hashes, lines. O2 rename → R1. O3 defaults → R2.
- O4 security/compat → R6, R7. O5 unresolved → §Already-covered (U1–U6 stay open). O6 dispositions/checks → §Dispositions, §Proposed checks.

## R1 (O2) — Rename disposed: no semantic effect

'Import bundle' → 'Import archive' is UI/name only per changes.json (semantics: no behavior change). It touches no tarfile symbol, doc passage, or dependency. All F1–F7 source identities, line refs, and dispositions below are invariant under it. Text adopts 'Import archive'; all invalidation flows from the runtime change (R2), none from R1.

## R2 (O1,O3) — Default filter CHANGED at the exact releases

3.12.3 (tarold.py L2217–2226): filter=None + extraction_filter=None emits DeprecationWarning ('Python 3.14 will, by default, filter…') and returns fully_trusted_filter (member unchanged, i.e. pre-3.12 dangerous behavior). Docs agree data becomes default in 3.14+ (tardocold L596–603, L980–987, L44). 3.14.0 (tarnew.py L2370–2374): the same omitted case returns data_filter with no warning. Docs confirm the default is data and the filter parameter now defaults to 'data' (tardocnew L44–45, L563–564, L649–650, L1045–1051, L660–662). The stored class default extraction_filter=None is unchanged in both (tarold L1639; tarnew L1724) — what changed is the None/None resolution. The remaining DeprecationWarnings in tarnew.py (L945, L954) concern TarInfo.tarfile removal in 3.16, not extraction. Prior F1 is retained for 3.12.3 and invalidated as a description of 3.14.0: omitted-filter on 3.14 is silent, data-filtered, and fail-closed instead of warn-and-trusted.

## R3 — Ladder and enforcement RETAINED, two implementation deltas noted

_NAMED_FILTERS mapping and the fully_trusted/tar/data wrappers are identical (tarold L818–838; tarnew L849–869). The enforcement list is verified identical: strip leading '/'+os.sep, AbsolutePathError, realpath-join OutsideDestinationError, mode & 0o755; data additionally forces SpecialFileError, owner-nulling, reg/hardlink mode forcing (0o600 plus conditional 0o111 clearing), dir/symlink mode None, and AbsoluteLinkError/LinkOutsideDestinationError (tarold L755–816; tarnew L781–848). Two deltas inside unchanged guarantees: (a) 3.14 passes strict=os.path.ALLOW_MISSING to all three realpath calls; (b) 3.14 normpaths member.linkname and records it when different. Neither removes a refusal; (b) tightens link handling. Prior F2/F3 retained; bodies compared, similar wording not relied on.

## R4 — Error taxonomy and abort/skip contract RETAINED

FilterError plus five subclasses preserved (tarnew L737–762; prior-cited tarold L723–754); _handle_fatal_error/_handle_nonfatal_error preserved (tarnew L2531–2538). Fatal (FilterError/OSError) vs non-fatal (ExtractError), errorlevel 0/1/2 semantics, partial-extraction-no-cleanup, and the custom-filter contract (FilterError fatal / ExtractError non-fatal / TarInfo-or-None) stand as prior F4 specifies. Full errorlevel bodies compared by identifiers rather than full line diff (see Uncertainty); all class and handler names verified.

## R5 — Configuration mechanics RETAINED; 'early opt-in' rationale moot

Per-call filter (callable/name, else ValueError) and extraction_filter (None/callable only; str raises the same TypeError text) are verbatim in both releases (tarold L2227–2238; tarnew L2375–2386). The global-default staticmethod wrap is still documented (tardocnew L657). Changed meaning, unchanged mechanism: extraction_filter=data_filter on 3.14 equals the default instead of opting in early. New docs explicitly recommend filter='data' to cover ≤3.13 less-secure defaults (tardocnew L541–543). Prior F5 retained with that reinterpretation.

## R6 (O4) — Security: default now protects, extras still required

3.14 docs: default data 'will prevent the most dangerous security issues' but 'will not prevent all unintended or insecure behavior'; never extract untrusted archives without prior inspection; filters do not prevent denial-of-service (tardocnew L545–551, L1169). Prior F6 (temp dir, OS limits, allow-lists, count/byte/name limits, shadowing, overwrite/tampering caveats) is retained and still governs 3.14: the upgrade removes the warn-and-trusted footgun for the omitted filter but satisfies none of the F6 extras. Omitted-filter on 3.14 is safer than on 3.12, never sufficient.

## R7 (O4) — Compatibility/inspection RETAINED; pin moved to 3.14.0

hasattr(tarfile,'data_filter') detection, the may-be-backported note, the getattr fallback pattern, getmembers/getnames/list/next inspection, and numeric_owner (still in the extractall signature; moot under data) are preserved (tardocnew L1204–1236; tarnew L2390 region). What changed: the pinned runtime is now 3.14.0, so '3.14 default-change readiness' (prior U5) is live behavior, and the compat question inverts — code that must also run on ≤3.13 should pass filter='data' explicitly. Prior F7 mechanics retained.

## Dependency dispositions

Retained: _NAMED_FILTERS; fully_trusted_filter, tar_filter, data_filter; _get_filtered_attrs enforcement branches; os.path.realpath/commonpath/isabs; TarInfo.isreg/islnk/isdir/issym/replace; FilterError + 5 subclasses; errorlevel handlers; numeric_owner; hasattr/getattr detection; getmembers/getnames/list. Changed: _get_filter_function None/None branch; effective None default (trusted → data); doc default passages; realpath strict=ALLOW_MISSING; linkname normpath; early-opt-in meaning. Unresolved (never already-covered): U1 bundle feature needs; U2 errorlevel choice; U3 per-call vs instance vs global (+ top-level-app status); U4 concrete limits/allow-list/lifecycle; U5 fleet beyond pinned 3.14.0 (narrowed, not closed); U6 no live-interpreter verification.

## Already-covered vs unresolved (O5)

Already-covered means the frozen sources fully specify that behavior/contract, so remaining work is configuration and values — it never means implemented, tested, or adequate (F6 refutes 'pass data and done'). No U-item is already-covered: U1–U6 name values and choices absent from all four frozen sources and are not closed by similar wording, by the default change, or by each other. U5 is narrowed by the pinned 3.14.0 runtime but the multi-interpreter question persists.

## Proposed regression checks (PROPOSED only — none performed)

P1: omitted-filter fixture archive (fifo, absolute-path member, outside-link) extracts trusted-with-warning on 3.12.3 (assert DeprecationWarning) and raises SpecialFileError/AbsolutePathError/LinkOutsideDestinationError with no warning on 3.14.0. P2: the same archive with explicit filter='data' behaves identically on both releases. P3: extraction_filter='data' (str) raises TypeError on both; extraction_filter=data_filter on 3.14 matches omitted-filter behavior. P4: errorlevel 0/1/2 matrix on a refusing member (skip-and-continue / abort / strict) on 3.14.0. P5: non-normal linkname case — observe recorded linkname on 3.14 vs 3.12. P6: DoS-shape archive (many members / large total) still extracts under default data on 3.14, proving F6 extras are still needed. Performed checks were static reads/comparisons only; P1–P6 need a live 3.12.3 + 3.14.0 pair and belong to the witness/CI stage.

## Conditions, uncertainty, optional material

Conditions: Linux CPython; both filter and extraction_filter unset for default claims. Uncertainty: no live-interpreter run (U6); errorlevel bodies compared by identifiers, not full line diff; symlink edges beyond coded realpath checks unprobed; concrete F6 values unknown (U4). Optional: pass explicit filter='data' anyway — harmless on 3.14, required for ≤3.13.

## Refresh operations performed

Hash-verified all four frozen sources plus prior-state (all match); compared filter functions, wrappers, _get_filtered_attrs, error classes/handlers, extraction_filter defaults, and doc default/compat/warning passages via targeted grep/sed reads. No sibling/other-case/evaluator/campaign/ER9 access; no execution, installs, or external writes.
