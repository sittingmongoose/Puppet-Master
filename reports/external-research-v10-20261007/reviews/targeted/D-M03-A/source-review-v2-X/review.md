# Independent semantic review — D-M03-A / X

**Status: material corrections required.** All six declared obligations and all six proposed tests were assessed. Core traversal/matching/link/case reasoning is largely sound; F6 contains two consequential errors. Frozen originals were not changed, no candidate feedback was sent, and no winner, cost, or native-success assessment was made.

First clock observed **2026-10-07T19:39:40Z**; allowance **20 minutes including checks, writing, delivery**, with no reset. Actual dispatch timestamp is unavailable and prohibited lifecycle files were not read. Original contract remains 20 minutes; the user-reported earlier root statement of a generic 15-minute limit is a root mistake, not a retroactive contract change. Prior interrupted review/quietness history is user-provided context, not independently audited. Usage: `null`. Final verification time is recorded in the JSON.

## Material issues

| Issue | Exact artifact claim | Independent assessment and evidence |
|---|---|---|
| Root permission conflation | Final L21 / intermediate-1 L14: root-unreadable raises | An unreadable directory can still pass initial `is_dir()`; its denied scans are suppressed. A denied ancestor can instead make initial stat fail. OS-only R3 observed this distinction; pinned code establishes the rglob inference. [pathcode](https://github.com/python/cpython/blob/v3.12.3/Lib/pathlib.py#L164) L164–171, L200–207, L870–884, L1128–1133. |
| Missed propagation path | Final L21: only the top-level gate can propagate non-ignored OSError | `walk()` catches scan **creation**, then iterates outside that handler. An iterator/context OSError can escape through recursion. AST check R4 confirms guard placement. No I/O fault or released runtime was executed. [pathcode](https://github.com/python/cpython/blob/v3.12.3/Lib/pathlib.py#L1128) L1128–1155 governs despite broader doc prose. |
| Absolute symlink/completeness claims | Final L7/L13/L17/L23: never enters links / loop immunity / completeness | Correct for stable descendant links. The initial root can be a link; a directory replaced after classification can be entered. Read/search/access rights, classification/scan errors, concurrent changes, and full iteration qualify completeness. Omitted link paths need not mean omitted targets reachable by real paths. [pathdoc](https://github.com/python/cpython/blob/v3.12.3/Doc/library/pathlib.rst#L1115) L1115–1120; code L228–238/L1135–1155. |
| Underqualified permission proposal | Final L33 / intermediate-1 L21, T4 | `chmod 000` must actually deny the same effective test identity. Privileged identities and Windows chmod semantics can defeat the setup. Corpus tests probe denial and adapt when it fails: [pathscan](https://github.com/python/cpython/blob/v3.12.3/Lib/test/test_pathlib.py#L2779) L2779–2789. |

## Complete obligation census

| Obligation | Disposition | Claim groups |
|---|---|---|
| O1 — Trace rglob into selectors and directory scanning | satisfied with precision note | G01, G09, G11 |
| O2 — Distinguish dotfile matching from recursive symlink traversal | addressed missing governing qualification | G02, G03, G06 |
| O3 — Separate broken links from followed directory links | satisfied | G04, G05 |
| O4 — State platform/case-sensitivity conditions | satisfied with minor qualification | G07, G08, G14 |
| O5 — Identify access-error completeness effects | addressed material errors | G09, G10, G11, G12 |
| O6 — Propose discriminating tests without claiming execution | partially satisfied | G15 |

## Consequential claim groups

The JSON contains the complete assessment, candidate line locations, raw-source ranges and check IDs for each group. This table includes every group; grouped claims avoid repeating the same source excerpts.

| Group | Scope | Disposition |
|---|---|---|
| G01 | F1 selector/scanning trace and multiple-** deduplication | supported with precision note |
| G02 | F2 matching dotfiles | supported |
| G03 | F2 recursive symlink exclusion and blanket missing-subtree claims | qualified missing governing condition |
| G04 | F2/F4 explicit intermediate links and corpus counts | supported |
| G05 | F3 broken links, leaf kinds, and long-target witness | supported |
| G06 | F4 loop immunity and 3.12.3 API switch | supported with stable tree qualification |
| G07 | F5 platform/default/override case rules | supported |
| G08 | F5 predicate error behavior | supported for OSError with minor omission |
| G09 | F6 suppression of scan-open and classification errors | supported |
| G10 | F6 root-unreadable raises | incorrect material |
| G11 | F6 only the top-level gate can propagate / all nested scan OSError suppressed | incorrect material |
| G12 | Recommendation/F7 completeness and post-filtering | partially supported missing conditions |
| G13 | Final self-dispositions and three rejected propositions | not fully supported as unqualified acceptance |
| G14 | Declared uncertainties, corpus size, bounded reads | appropriately disclosed with search limit |
| G15 | T1-T6 proposed discriminating tests versus execution | partially supported conditions missing |
| G16 | Source identity, source-linking, and cited ranges | verified with one intermediate range defect |
| G17 | Declared brief format and non-application scope | satisfied in visible artifacts |
| G18 | Preservation and corrections across mandatory intermediates | preserved with inherited errors |
| G19 | Optional supported yield beyond minimal six obligations | supported subject to listed qualifications |
| G20 | Historical checks, access restrictions, native Goal and receipt assertions | unassessed historical process |

Supporting details: `_make_selector` prepends/collapses/selects `**` and deduplicates non-adjacent recursions; leaf matching is name-only, so broken links and directories can match. Dot-prefixed CSV names match the pinned fnmatch regex. Explicit intermediate components follow usable directory links. Corpus `fileB`/`*/fileB`, broken-loop, long-target and 100/50-link assertions are correctly described, subject to their symlink-capability guards. Default case rules derive from path flavour, with explicit overrides; they do not probe each directory. Post-filtering needs an object policy: `is_file()` follows links and may raise; `lstat()` supplies metadata rather than selecting files by itself. Predicate “only” error wording omits the `ValueError` false-return path. Final source ranges are generally apt; intermediate-2 L12 incorrectly puts `_make_selector` in L140–256 instead of L82–103.

## Proposed checks and actual checks

| Proposal | Review result | Execution |
|---|---|---|
| T1 | Both .h.csv and v.csv are leaf matches. Stable readable isolated directory; consume the iterator. | Proposed only; not run by reviewer. |
| T2 | Bare x.csv yields d/x.csv; */x.csv also yields link/x.csv. Working directory symlinks, stable readable isolated d/link fixture; compare sets or sorted paths. | Proposed only; not run by reviewer. |
| T3 | b.csv is yielded as a leaf; b.csv/*.csv yields nothing. d.csv may also match as a leaf directory link. Working symlinks; nonexistent target for b.csv; real directory target for d.csv; distinguish type policy. | Proposed only; not run by reviewer. |
| T4 | When scan access is truly denied, u.csv is omitted and direct scandir raises PermissionError. chmod 000 alone is not a portable denial setup; require same effective identity and an actual denial check, restore permissions. Candidate omits the effective-user/platform prerequisite. | Proposed only; not run by reviewer. |
| T5 | X.CSV on POSIX misses by default and matches with case_sensitive=False. Pinned 3.12.3 semantics; the flag governs matching rather than filesystem lookup case behavior. | Proposed only; not run by reviewer. |
| T6 | Stable l pointing to its parent directory is yielded once by rglob(*) without recursive descent through l. Working symlinks; stable isolated fixture, finite tree; a parent-directory link is distinct from a broken self-pointing link. | Proposed only; not run by reviewer. |

Actual checks: R1 verified all ten input hashes and measured 921 whitespace words/seven findings, within the soft ceiling. R2 read the complete brief and all required candidate artifacts, plus the relevant pinned implementation/docs/tests. R3 used only installed Python **3.14.4**, POSIX, effective UID **1000**, and `os.stat`/`os.scandir` on a disposable permission fixture: unreadable-root stat succeeded, its scan raised `PermissionError` errno 13, and stat beneath an inaccessible parent also raised errno 13. Permissions were restored and the fixture removed. This is OS primitive evidence, **not** an executed CPython 3.12.3 rglob witness or any T1–T6 run. R4 parsed the pinned source as data to inspect error guards. R5 opened and hashed two released public supplements in memory; both exactly match the supplied source hashes. R6 inspected test patterns; no dedicated leading-dot witness was identified, without claiming an exhaustive absence proof. R7 validates final outputs and rechecks frozen hashes before delivery. No downloaded code, install, credential, delegate, native Goal or receipt workflow was used.

## Preservation, governing conditions and blinding

All F1–F7, T1–T6, three rejected propositions and two uncertainty topics survive from intermediate-1 through intermediate-2 to final. Finalize claims zero amendments and discloses partial doc/test carry-forward. It preserves the material errors above. Author self-dispositions (“accepted” etc.) were visible but were not treated as evaluator truth. The visible deliverable respects the bounded-module form and distinguishes proposed checks from execution. Historical claims that code was reverified, checks ran, paths were restricted, witnesses were absent, or a native Goal/receipts succeeded remain explicitly **unassessed**: supporting logs/lifecycle files are excluded. No native-success conclusion follows from reading the claim.

Blinding is limited: headings reveal “arm control,” “normal_retrieval” and “finalize”; required intermediates expose predecessor findings/self-dispositions and Goal clues. Explicitly mapped supplementary paths reveal `treatment/expand-v1`. Only their primary-source bytes were read; they were not attributed to X. Candidate material was read before primary adjudication, allowing anchoring. No case card, identity map, parent state, timing/lifecycle/receipt file, other review, or other candidate output was read. No prior independent findings were supplied/read.

Coverage: **6/6 obligations**, **7/7 final findings**, **6/6 proposed tests**, **2/2 required intermediates**; **20 claim groups**, **19 assessed and one explicitly unassessed historical-process group**; **10 hashed inputs**, three core and two mapped supplemental primary sources. This is full declared scientific-claim coverage, not a claim to have read every source line or executed every possible runtime test. Windows junction behavior, exact-release/Windows runtime verification, real late-I/O fault behavior/frequency, and candidate history remain unresolved as listed in JSON.

## Reviewed bytes and citations

All references use one-based raw-file lines. The original three source files total 6297 lines. Released URLs pin CPython v3.12.3; web-rendered line numbers differ. R5 byte-fetch times: fnmatch 2026-10-07T19:41:20.139324Z; os docs 2026-10-07T19:41:20.256196Z. No extra captures persisted.

| Input | SHA-256 |
|---|---|
| [brief](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-A/inputs/brief.md) | `428d85013366c5050fbbfd09b3ea21f2869ac729114b623c103b3a47a5bf503c` |
| [manifest](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-A/inputs/sources.json) | `f3b6c1577dbdcae2bff0bd3fd50e027af1e84fd9c5dddff61d9c1f3bca87306f` |
| [pathdoc](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-A/inputs/sources/pathdoc.rst) | `1eb64284f142028c3338da705d2a9e1c640bf115c189b27787301bf7ff3fc6de` |
| [pathcode](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-A/inputs/sources/pathcode.py) | `dc14d8207519fb8bcdd9c7bae1d54da3ad1b339aa83d4979c16057cd552a3487` |
| [pathscan](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M03-A/inputs/sources/pathscan.py) | `1198a722bfbd6bd8f924f2b87b38b2d617d48358bf5498190682c077f6af5b1c` |
| [fnmatch](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M03-A/treatment/expand-v1/sources/fnmatch-3.12.3.py) | `6683da36e47af523f3f41e18ad244d837783e19e98911cc0b7415dea81494ebc` |
| [osdoc](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M03-A/treatment/expand-v1/sources/os-3.12.3.rst) | `9a280ac22698e0947993ccab893cdb4d91db1cc482d45dcdc029da2a20bafd53` |
| [final](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M03-A/source-review-v1/frozen/X/final.md) | `d5ace02e59d3f354ef094c9b158981ddd86fc0771b4515cbaae790bd4d0a5750` |
| [intermediate_1](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M03-A/source-review-v1/frozen/X/intermediate-1.md) | `e06b035f89dad46d328a32395da9cc44de471093b605835983edd5d7e3706a34` |
| [intermediate_2](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted/D-M03-A/source-review-v1/frozen/X/intermediate-2.md) | `77ffdca7115fd5b250a6e898eaaa23f227c4f6639fc52f5ff920b3ca6783c769` |

Primary URLs: [pathdoc](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/pathlib.rst), [pathcode](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/pathlib.py), [pathscan](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_pathlib.py), [fnmatch](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/fnmatch.py), [os docs](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/os.rst). Full inspected ranges and claim-specific citations are in REVIEW.json. R7 completed at 2026-10-07T19:46:06Z: all ten original hashes remain unchanged; all citations are in bounds and the output census reconciles. First-observed elapsed time was 386 seconds; exact dispatch elapsed remains unknown.


R7 integrity note: the writable directory had preexisting entries, so an initial directory-contents-only assertion failed. Their contents were not read or changed. A table-count check initially included its header and was corrected. Final verification passes for the two reviewer-authored outputs, coverage census, citation bounds, and all frozen hashes.
