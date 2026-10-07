# Independent semantic review — D-M03-A, candidate Y

**Status: complete review; material correction required.** All six declared obligations and all seven final material findings were assessed. Y correctly traces the selector machinery, dotfile matching, broken-link handling, explicit-component symlink following and case rules. Its unconditional **“unreadable root raises”** conclusion is wrong: a root whose metadata can be read but whose contents cannot be listed can silently yield no matches.

This is the single prospective independent repair authorized for Y. The original 20-minute contract is retained; root's previously stated generic 15-minute limit was a mistake, not a retroactive contract change. The user reports the earlier paired review was interrupted after exceeding its envelope and produced no review files. No earlier independent review was opened. This review does not rank candidates or infer cost, native success or comparative yield.

## Coverage census

| Item | Actual coverage |
|---|---|
| Declared scientific obligations | **6/6 assessed; 0 unassessed** |
| Final material findings | **7/7 assessed** |
| Exact final / required intermediates | **1/1 and 4/4 fully read** |
| Consequential claim groups | **17 assessed; 1 explicitly unassessed procedural group** |
| Mapped artifacts / supplied expected hashes | **12 hashed; 10/10 expected hashes match** |
| Public exact-release source identity | **5/5 upstream byte hashes match** |
| Proposed check families | **5/5 assessed; original execution history not verified** |
| Reviewer execution | **2 isolated OS cases; 0 downloaded or selected-release project-code executions** |
| Final soft ceiling | About **935 whitespace words**, seven findings; within 1100/eight |

### All six obligations

| Obligation | Assessment | Claim groups |
|---|---|---|
| 1. rglob → selectors → directory scanning | Supported. Complete call and matching path checked; terminal matching has no file-type restriction. | C01–C02, C10 |
| 2. Dotfile matching versus recursive symlinks | Dotfile result supported; descendant symlink exclusion requires a stable tree and refers to alias paths. | C03, C05, C11 |
| 3. Broken versus followed directory links | Main distinction supported; explicit components follow directory links. Minor `is_dir` wording/range defects and inventory type policy remain. | C03–C04, C06, C10 |
| 4. Platform/case conditions | Supported: flavour-based default, explicit override, keyword added in 3.12. | C07, C17 |
| 5. Access errors/completeness | **Material correction required** for root stat versus listing; iterator exceptions and stability also qualify completeness. | C08–C11, C17 |
| 6. Proposed discriminating tests | Clearly proposed-only; root chmod prediction wrong, linked-target fixture needs an alias/out-of-tree condition. | C12 |

## Findings

| ID | Consequence and evidence | Candidate location |
|---|---|---|
| **F01 — major** | A nonignored error from initial `is_dir/stat` propagates; denied root **listing** is suppressed by wildcard scanning and walk opening. A mode-000 root ordinarily remains stattable under an unprivileged POSIX identity. Therefore own-root `chmod(0)` does not generally imply a raised exception. Sources: pathcode 164–171, 200–207, 835–840, 870–884, 1128–1133; pathdoc 926–928. | final 5, 25, 29, 33; inherited through all four intermediates |
| **F02 — medium** | `walk` protects `_scandir()` construction at 1129, but its context/iterator at 1135–1138 is outside that try. An error there can propagate through rglob. Wildcard snapshot iteration is protected. The broad documentation sentence about later scan-error suppression is less precise than the governing released implementation. No iterator fault was executed. | final 25, 29 |
| **F03 — medium, definition-dependent** | Terminal `*.csv` matching checks names, with `dironly=False`; matching directories, directory links and other non-files can be returned. A regular-file inventory needs an explicit type policy. Y identifies dangling links but leaves the wider policy implicit. Sources: pathcode 155–177, 200–220, 1097–1100. | final 5, 20, 23 |
| **F04 — medium** | Readable directories alone do not establish exact completeness. The docs expressly require no modification during walk; a classified directory replaced by a symlink can still be descended. Scandir membership during changes is unspecified. Sources: pathdoc 1115–1120; pathcode 228–232, 1140–1155; osdoc 2682–2689. No race witness was executed. | final 5, 21, 25 |

## Complete grouped claim assessment

Source IDs below resolve to the exact public version and full local paths/hashes in `REVIEW.json`. These groups cover the final and all required intermediates, including qualifications and preservation.

| Group | Disposition and assessment | Governing source ranges |
|---|---|---|
| C01: entry/selector chain | Supported: parse, prepend `**`, recursive + wildcard successor, root `is_dir` gate, empty result for a non-directory root. More exactly, recursion emits root and each child in walk's `dirnames`, even a child whose later scan fails. | pathcode 82–103, 155–171, 223–257, 1097–1110 |
| C02: scanning/matching/fd discipline | Supported: close snapshot before yielding, suppress snapshot OSError, dironly follows `entry.is_dir()`, final component matches names, compile with flags, delegate to os.scandir. FD test is a source definition, not an executed witness. | pathcode 107–109, 155–162, 200–220, 1059–1063; pathscan 1950–1965 |
| C03: recursive symlink exclusion | Supported for a stable tree's descendant alias paths. The root itself can be a followed symlink; an in-tree real target can still be inventoried by its real path. Unconditional “never” needs F04. | pathcode 169, 835–840, 228–238, 1112–1155; pathdoc 1104–1125; pathscan 1888–1948 |
| C04: explicit-component following | Supported: default DirEntry follow is True; explicit wildcard directory components can reach linked aliases. This is distinct from recursive `**` following. | pathcode 200–220; osdoc 2819–2841; pathscan 1859–1867, 1899–1914 |
| C05: dotfiles | Supported at every scanned depth, including beneath real hidden directories. No leading-period exclusion; compiler and fnmatch text support the result. Bounded search found no dotfile-specific glob test in the single frozen test file. | pathcode 191–220; fnmatch 19–31, 74–185 |
| C06: dangling links/`is_dir` | Main name-match versus dironly exclusion supported. Literal “False only on ignored errnos” omits ordinary non-directory results and ValueError. In its OSError branch, ignored errno/winerror values return False; other OSError propagates. | pathcode 40–54, 155–177, 200–220, 870–884; pathdoc 955–961; pathscan 1931–1948, 1980–1998; osdoc 2819–2841 |
| C07: case/platform | Supported. Default is a flavour normcase policy, not a per-directory filesystem probe. Shared selector tests support explicit overrides; no Windows runtime was run. | pathcode 58–59, 107–109, 193–198, 1081–1110; pathdoc 930–946, 1347–1359; pathscan 1876–1886, 3052–3066, 3198–3212 |
| C08: root error promise | Incorrect; F01 distinguishes metadata permission errors from denied listing. | pathcode 164–171, 200–207, 835–840, 870–884, 1123–1133 |
| C09: all-subdirectory-error suppression | Incomplete; normal denied opening is suppressed, but walk iterator errors are not. A denied walk type check can also classify a would-be directory as a file. | pathcode 200–207, 228–238, 1128–1155; pathdoc 926–928 |
| C10: inventory type/completeness | Type policy omitted, F03. Matches are paths of any kind, not intrinsically regular CSV files. | pathcode 155–177, 200–220, 1097–1100; pathdoc 905–908 |
| C11: stable-tree condition | Missing governing condition, F04. Listing every directory is insufficient for an exact snapshot promise. | pathdoc 1115–1120; pathcode 228–232, 1140–1155; osdoc 2682–2689 |
| C12: proposed tests | All five families assessed. Dotfiles, dangling link and case predictions supported. Use a target outside root or assert alias paths for the link fixture. Separate denied stat from denied listing; verify chmod actually denies access. The root-raise prediction is wrong. | pathcode 164–220, 228–238, 870–884, 1112–1155; pathscan 2781–2789; fnmatch 74–185 |
| C13: source identity/provenance | Local supplied hashes and five independently fetched public exact-tag files all match. Original fetch/reverification times and actions are not independently verified. Additional sources are allowed by brief 14. | brief 14–16; manifest; K02/K06 |
| C14: citation ranges | Principal ranges support their references. `_IGNORED_ERRNOS` is **45**, not 48; `is_dir` handling needs **870–884**, not 870–876; fnmatch return reaches 185. Docs establish keyword version addition. | pathcode 45–54, 870–884; pathdoc 945–946, 1358–1359; fnmatch 74–185 |
| C15: preservation/corrections | All six topics survive all stages. Dotfile/default-follow dependencies are resolved by same-release captures. Root-raises was a navigation candidate, accepted in focused read and retained through expansion/finalization despite re-verification claims. Final and intermediate-4 preserve scope, not identical bytes. | all four intermediates in full; final in full; fnmatch/osdoc; pathcode 164–171, 200–207, 1128–1138 |
| C16: optional supported yield | Two useful evidential closures: dotfiles and explicit-component following. DT_UNKNOWN may add calls, but “without changing match outcomes” assumes successful metadata calls; DirEntry can raise OSError. No novelty or comparative yield score inferred. | fnmatch 19–31, 74–185; osdoc 2819–2841 |
| C17: uncertainty | Version/main, Windows-branch and normalization limits are appropriately disclosed. Code inference is legitimate; doc's rglob paragraph links glob behavior. Missing error-location, type and stability limits are more consequential. | pathdoc 926–933, 1115–1120, 1334–1359; pathcode 1128–1155; osdoc 2819–2841 |
| C18: procedural history | **Explicitly unassessed:** original no-execution/no-edit/no-delegation/no-sibling-access claims, timestamps, stage actions, native Goal receipts/deadlines and lifecycle delivery. These cannot be certified from frozen prose and restricted visibility. | Embedded candidate assertions only; no separate lifecycle files opened |

## Actual checks and source identity

- **K01:** Full mapped candidate/brief/manifest reads; focused released-source/docs/test-definition reads with `nl`, `sed`, `rg`.
- **K02:** Public exact-tag downloads in memory, 15-second request timeouts; all five HTTP 200 and all five byte hashes match. No installs, clones, credentials, saved downloads or downloaded-code execution.
- **K03:** `ast.parse` of frozen pathcode, without import/execution. Verified protected scan body 204–205 versus walk's 1129; walk context/iteration 1135–1138 unprotected.
- **K04:** Bounded frozen-test-file searches for hidden/dotfile/leading-period and glob/permission terms; source definitions inspected, none run.
- **K05:** Reviewer-owned temporary OS fixture, **2026-10-07T19:43:26.016548Z–19:43:26.017297Z**, Python **3.14.4**, euid **1000**. Mode-000 root: `stat` says directory, `scandir` raises PermissionError/errno 13. Mode-000 ancestor: root `stat` raises PermissionError/errno 13. Permissions restored and tree deleted. **This is an OS counterexample, not a 3.12.3 rglob run.**
- **K06:** All 12 mapped files hashed; all 10 supplied expected hashes match. Final whitespace count approximately 935. Final preservation rehash is recorded in JSON.

| Source ID | Exact public primary source, release v3.12.3 | Review-time verification |
|---|---|---|
| pathdoc | [pathlib documentation](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/pathlib.rst) | 50,247 bytes; mapped SHA matches upstream |
| pathcode | [pathlib implementation](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/pathlib.py) | 51,105 bytes; mapped SHA matches upstream |
| pathscan | [pathlib tests](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_pathlib.py) | 141,113 bytes; mapped SHA matches upstream |
| fnmatch | [fnmatch implementation](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/fnmatch.py) | 5,999 bytes; mapped SHA matches upstream |
| osdoc | [os documentation](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/os.rst) | 191,816 bytes; mapped SHA matches upstream |

Full exact reviewed paths, SHA-256 values, per-group candidate/source ranges and upstream check timestamps are in [REVIEW.json](./REVIEW.json). Candidate final hash: `8ac6613ecf6a968e36087df7fae672ebd3e903d2bca51ffc6329a126394165a9`.

## Independence, limits and timing

Required intermediates disclose “treatment,” sequential stages, same-family handoffs and prior candidate findings. Intermediate-4 also embeds a Goal ID, receipt names and dispatch/deadline/lifecycle statements. Those clues were visible; no separate timing/lifecycle files, case cards, identity maps, parent state, other reviews or receipts were opened. The writable directory was listed only to avoid overwriting outputs; its existing input-map/prompt/dispatch/request files were not read. A required repository-index read was unrelated and supplied no case grade information.

The first observed tool timestamp was **2026-10-07T19:39:53.900906530Z**. Actual dispatch time is unavailable without prohibited lifecycle material, so dispatch-relative elapsed time, usage and costs are **null**; no false timing certification is made. This allowance includes checks, writing and delivery and was not reset. Completion and closure rehash timestamps are recorded in JSON.

No candidate or source was edited, no delegate or native Goal was used, and no feedback or scientific rescue was supplied. The full six-obligation scientific scope is assessed; procedural execution history remains explicitly unassessed. Selected-release runtime, Windows behavior, real iterator-error frequency, normalization and races remain unexecuted. Inventory type policy remains unresolved.

Closure: all 12 mapped artifact hashes remained unchanged; output coverage and JSON structure validated at **2026-10-07T19:58:07.045229+00:00**. Observed elapsed time from the first tool timestamp: **1093.144 seconds**; actual dispatch-relative elapsed time remains unknown.
