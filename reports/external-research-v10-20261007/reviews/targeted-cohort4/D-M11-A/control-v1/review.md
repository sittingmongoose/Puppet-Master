# Independent source review: D-M11-A

**Overall: FAIL — full declared-scope static source review completed.** The core `extractall(filter='data', errorlevel=1)` recommendation is supported. Four material defects prevent SourcePASS. This is not an early diagnostic-only assessment; no substantive claim/obligation remainder is unassessed.

The frozen final's SHA-256 was checked **before assessment** and matches `de5938d402ee8138f44591fa06185a4ea77a4637cdeb1b875237371f5876bba8`. All eight required primary captures also match. Every consequential factual cluster is checked below and expanded as C01–C30 in [review.json](review.json), with exact locators, facts, conditions, defect IDs and full source identities.

**Material defects**

- **D01 — wrong 3.14 CLI classification** (final line 17; medium). Omission of `--filter` is called an unfiltered old-warning path. Stock 3.14 CLI forwards `None` to `extractall`, which selects `data` when `extraction_filter` is also None (`tarnew:3041–3043,3090–3092,2370–2374`; `pep706:533–540`). Bind CLI diagnosis to the release and configured filter.
- **D02 — wrong Linux rejection/test expectation** (lines 13,21; medium). The text drops the Windows condition for `C:/` and proposes that absolute member paths are refused under `data`. Leading Linux slashes are stripped before containment checking; the released test expects extraction of the stripped name (`tarnew:785–797`; `tartest:3723–3737`; `tardocnew:1090–1097`). Separate originally absolute member names, post-stripping escapes, absolute link targets, and Windows drive-absolute names.
- **D03 — false no-change negative** (line 23; high). In 3.12.3, the original `tarinfo` remains when filter assignment raises and its error is suppressed; it can then be extracted. In 3.14, `filtered=None` remains and the member is skipped (`tarold:2304–2325,2347–2357`; `tarnew:2493–2503`). Thus `errorlevel=0` is a consequential release difference; suppressed custom `ExtractError` at level 1 also differs. This does not invalidate the chosen level-1 handling of primary `FilterError`, but it must be part of the comparative regression matrix.
- **D04 — missing error-phase condition** (lines 11,13,19; medium). The blanket default-abort statement does not hold at directory metadata fixup: `FilterError/OSError/ExtractError` from its re-filter are caught, logged and followed by `continue`, without consulting `errorlevel` (`tarnew:776–779,2431–2439`). A stateful filter/caller cannot assume every such exception reaches an abort-and-wipe handler. Distinguish initial-member refusal from skipped directory metadata update.

**Six required axes**

| Axis | Disposition | Assessment |
| --- | --- | --- |
| 1. Brief obligations | PARTIAL | All six addressed; release/path/error inaccuracies affect four. Bounded: seven findings, 916 whitespace-delimited words. |
| 2. Consequential claims and governing conditions | FAIL | Full independent primary-source checking; D01–D04 and qualifications below. |
| 3. Discovery/negative/optional yield | PARTIAL | Useful bounded leads and optional wrapper; D03 is a false negative. |
| 4. Wrong rejection/correction or universal abstention | FAIL | D01/D02 misclassify/reject valid current behavior. No unjustified universal abstention. |
| 5. Preservation/traceability/uncertainty/optional content | PASS WITH LIMITATIONS | Final retains conditions, uncertainties and optional content. Predecessor comparison unavailable. |
| 6. Proposed versus executed checks | PASS WITH LIMITATIONS | Runtime matrix explicitly proposed only. Historical command provenance unavailable; hashes/static facts reproduced independently. |

**Obligation-by-obligation coverage**

| Obligation | Disposition | Final/evidence |
| --- | --- | --- |
| Old concern, lineage, released default | PASS | Finding 1; C03–C05: PEP motivation; issue 102950; PR 102953; issue 121999; released resolver/test. |
| Omitted/explicit filter and errorlevel | PARTIAL | Findings 2/6 and negative leads; C05–C09/C27; D03/D04. |
| File/link/path domains and destination | PARTIAL | Findings 3/4 and conditions; C10–C16/C22; D02/D04. |
| Residual security/resource limits | PASS | Findings 4/6; C02/C09/C17/C24; docs 1167–1198. |
| Avoid old-issue projection | PARTIAL | Finding 5; C18–C22; D01. |
| Release-discriminating tests/compatibility | PARTIAL | Findings 6/7; C23–C27; D02–D04. |

**Consequential-claim checking**

Locators use the input-map source IDs: `tarold` = CPython 3.12.3 tarfile.py; `tarnew`, `tardocnew`, `tartest` = CPython 3.14.0 implementation/docs/tests. `pep706` line numbers refer to the exact supplied HTML, not rendered text. JSON locators refer to exact captured metadata/body fields. The two additional source IDs refer to released 3.14.0 captures recorded below. Full facts/conditions per individual claim are in review.json.

| Claims | Final lines | Disposition | Checked fact / governing condition | Exact primary locators |
| --- | --- | --- | --- | --- |
| C01–02 | 3,5,19,27 | SUPPORTED | Pinned API/hashes and explicit data/errorlevel=1/fresh destination policy agree; quotas and cleanup remain caller-owned. | tarnew:858–868,1710–1712,2370–2389; tardocnew:1167–1198 |
| C03–04 | 9 | SUPPORTED | Historical inspection/CVE concern and PEP→issue→merged PR→default-change issue lineage agree. PR merged 2023-04-24 at af530469954e8ad49f1e071ef31c844b9bfda414. | pep706:#motivation/#reference-implementation; tarissue:$.body; tarpr:$.merged_at/$.merge_commit_sha; tardefaultissue:$.body/$.closed_at |
| C05–06 | 9,11,19,21 | SUPPORTED | Omitted resolves through extraction_filter; both None selects data in 3.14, warning+fully_trusted in 3.12.3. Explicit names/callables and string-attribute errors agree. | tarnew:2370–2389; tarold:2217–2241; pep706:417–427; tartest:742–757,4443–4447,4466–4470 |
| C07–09 | 11,19,23 | PARTIAL / D04 | Initial filter error handling, Unicode fatal handling and partial-cleanup rules agree. Fixup exceptions differ; base FilterError need not carry tarinfo. Debug logs require debug≥1; corruption exceptions can escape the abbreviated catch list. | tarnew:737–779,2426–2439,2493–2548,2835–2857,2989–2993; tardocnew:616–635 |
| C10–11 | 13,21 | PARTIAL / D02 | Slash-prefixed member names are stripped, then checked. C:/ surviving absolute is a Windows example. tar checks write destinations but permits outside-pointing links. | tarnew:781–797,819–853; tardocnew:1090–1097; tartest:3714–3737,3952–3979 |
| C12–14 | 13,21 | SUPPORTED with qualifiers | data's absolute/outside link checks, symlink-vs-hardlink bases, normpath and mode/owner rules agree. normpath may change link meaning. Type refusal needs non-None mode; parsed headers supply integer mode. Ignored ownership can still issue root chown(-1,-1). | tarnew:798–846,1293–1305,2756–2798; tardocnew:1108–1147; tartest:4053–4075,4286–4336 |
| C15–16 | 13,23 | PARTIAL / D04 | ALLOW_MISSING containment, live per-member checks and directory refilter/lstat agree. Fixup refusal skips metadata rather than aborting. '.' and '' both denote cwd; fresh destination also needs no concurrent attacker mutation. | tarnew:781–797,2388–2389,2408–2455,2461–2462; tardocnew:1174–1179,1196–1198 |
| C17 | 15 | SUPPORTED | DoS, quotas/names, duplicate overwrite, case shadowing, live races and permitted inside links are retained. Risks/controls are explicitly incomplete. | tardocnew:1018–1022,1167–1198; tarnew:781–868,2653–2667 |
| C18 | 17 | CONTRADICTED / D01 | Stock 3.14 CLI without --filter forwards None, selecting data. | tarnew:3041–3043,3090–3092,2370–2374; pep706:533–540 |
| C19–20 | 17,23 | SUPPORTED with qualifiers | extractfile/getmembers/list/is_tarfile do not extract members to filesystem; add's one-argument filter is distinct. Unknown extractfile types also read as regular; stream links can raise. | tarnew:724–729,2126–2134,2248–2280,2298–2336,2550–2580,3013–3029 |
| C21–22 | 17,21,23 | SUPPORTED with qualifiers | Released built-in shutil tar dispatch inherits data; non-None ZIP filter fails and ZipFile has no filter API. LinkFallbackError exists when fallback re-filter raises; extractall forwards filter, extract does not. | shutil_v3.14.0:1309–1361,1386–1432; zipfile_v3.14.0:1824–1854; tarnew:769–779,2418–2420,2475–2479,2706–2754 |
| C23–24 | 19,23 | SUPPORTED with qualifiers | Feature detection, deliberate fallback/fail-closed, callable/default/staticmethod advice and optional stateful wrapper agree. Feature presence is not release equivalence; callbacks can repeat at fixup/fallback and docs example is not a complete quota implementation. | pep706:596–644; tardocnew:645–658,1201–1268; tartest:4408–4447,4472–4500; tarnew:2432,2748 |
| C25–27 | 21,23 | PARTIAL / D02–04 | Checks are proposed and generally discriminate releases; Linux absolute-path expectation is false. Built-ins never return None. The no-errorlevel-change negative misses old suppressed-filter fall-through. OS privilege/target availability govern fully_trusted fixture creation. | tarnew:849–862,2493–2503,2677–2754; tarold:2304–2325; tartest:3714–3737,4502–4566 |
| C28–30 | 23,25,27 | SUPPORTED with limits | Corpus/vendor uncertainty and proposed-vs-executed distinction survive. Hashes reproduced; candidate historical reads cannot be authenticated. Test assertions actually sit at 755–757; the cited external SOURCES_USED.md was not read. | pep706:285–294; issue/PR JSON objects; INPUT_MAP:required_sources; tartest:742–757; final:21,23,25,27 |

The additional API/type observations are **qualifications**, not forced independent defect findings. In particular, copy re-filtering depends on the entry point: `extractall` passes its filter onward, while `extract` does not. The final's recommended policy explicitly chooses `extractall`; this limits how far its generic `LinkFallbackError` mention can be relied on. `tar` also permits outside-pointing links while checking later write destinations. Stateful quotas must account for repeated callbacks. Cleanup should encompass any failed extraction, including corruption exceptions. These nuances are preserved as Q01–Q09 in the JSON.

**Additional public primary checks**

Only the following same-scope released companions were fetched; neither was executed:

- [CPython v3.14.0 shutil.py](https://raw.githubusercontent.com/python/cpython/v3.14.0/Lib/shutil.py), captured 2026-10-07T19:11:52.511652+00:00; SHA-256 `ab36f39f04e349020cdd13cf41b50905fc399150fb5e6a7cf73d69b22dd949cd`; checked lines 1309–1361 and 1386–1432.
- [CPython v3.14.0 zipfile/__init__.py](https://raw.githubusercontent.com/python/cpython/v3.14.0/Lib/zipfile/__init__.py), captured 2026-10-07T19:11:52.636028+00:00; SHA-256 `896a7b3216ec8656e73a3774786a8b4e4777ef045e05449345de591d6baa4154`; checked lines 1824–1854.

Exact captures and their manifest are retained under [additional_sources](additional_sources/capture_manifest.json). These resolve companion API/default questions for this review; they do not retroactively claim the candidate inspected them.

**Blinding, extent and execution limits**

Allowed paths expose `control` labels, so this was not method/identity blind. No other arms/cases/reviews, candidate drafts/history, helper/campaign material, evaluator corpus, grades or parent analysis were read. No prior findings or objections were received. No delegation, software installation, archive extraction or downloaded code execution occurred.

All required brief obligations and material final source claims were assessed. The PEP's 3.13/backport transition is checked as historical source guidance; concrete release control-flow comparison uses the supplied 3.12.3/3.14.0 implementations. Issue/PR bodies and metadata do not provide comments or a complete patch history. Vendor defaults and an actual deployed sandbox were not verified. Candidate historical commands and predecessor preservation cannot be independently authenticated under the permitted-input restriction; these are explicit provenance limits, not claims of passed runtime checks.

Actual native activation/terminal responses and timings are separate artifacts. The exact candidate and its meaning were preserved; this review neither edits it nor supplies rescue feedback through another round.
