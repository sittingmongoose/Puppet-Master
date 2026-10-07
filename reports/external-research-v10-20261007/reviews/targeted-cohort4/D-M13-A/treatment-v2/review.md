# Independent primary-source review — D-M13-A

**Overall grade: FAIL. Assessment extent: full declared-scope static primary-source review.** The release chain and main explicit `data` choice are supported. The class-default alternative is invalid without `staticmethod`; the regression summary overgeneralizes absolute-path rejection; the proposed mixed fixture can mask the absolute branch; and ignored-error continuation is not carried into the fail-closed policy. This is not a localized DIAGNOSTIC_FAIL.

Frozen final: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M13-A/treatment/finalize-v2/final.md`  
SHA-256: `50c07c0b421faad8c844d7cdb4cf1b808f0903e5b13fc67758bb81f2f1e7222a` — verified before assessment; original bytes unchanged.

## Scope and blinding limits

Read the mapped original brief, manifest, seven required primary byte files, and this frozen final only. All seven primary hashes match. Two supplementary official CPython **v3.12.3** files were retrieved to verify the released `shutil` caller: `Lib/shutil.py` and `Doc/library/shutil.rst`. Their bytes, URLs, versions, hashes, exact reviewed locators and capture limitations are saved under `sources/`. Own T3 requestedAt/start metadata was queried with **zero timeline items returned**, solely to account for the review bound.

No other arm, drafts, candidate timing/history, other cases, helpers, campaign data, parent analysis, prior reviews, predecessor files, feedback, rescue, regrading or best-of selection was consulted. No delegation, native Goal, downloaded-code execution, installation, runtime test execution or third-party write occurred. Only this requested result directory was written.

Method/arm labels are visible in paths and frozen-final content, so method blinding is incomplete. No costs, winner or speed target were supplied. The input map is an **advisory scope boundary, not a filesystem firewall**; wider filesystem access technically exists, and scope was enforced procedurally by exact reads. This was the first independent review, with no prior findings or unresolved objections.

## Six-axis dispositions

| Axis | Disposition | Basis |
|---|---|---|
| 1. Every required obligation | FAIL | All six obligations assessed; release boundary and broad residual caveats pass, but implementation-condition/policy/regression accuracy has material defects. |
| 2. Consequential claims and all governing release/default/type/path/caller conditions | FAIL | Claim-level primary checking covers chronology, merge implementation, selected release, dispatch, defaults, class/instance binding, post-strip path semantics, link roots, mode/type guards, error thresholds and continuation. D01/D02 are contradicted; D04 is an acknowledged dependency with a missing consequential outcome/policy precondition. |
| 3. Bounded useful discovery, including negative/optional yield | PASS | Useful real implementation and regression discovery within seven-source lead; optional linked PRs/backport are correctly labelled unpursued and source-identifiable. No unjustified claim of disproved follow-ups. Two reviewer-only release-pinned shutil captures close the caller release check; no broader audit needed. |
| 4. Wrong rejection/correction or unjustified universal abstention | FAIL | No universal abstention: explicit data is an appropriate supported choice. However POSIX absolute paths are wrongly generalized as rejected, and the class-level correction is invalid without staticmethod. |
| 5. Preservation, traceability, uncertainties and optional content within final | PASS_WITH_LIMITATIONS | Seven frozen source identities match; numbered code/test anchors checked; explicit uncertainties and open optional leads retained; no predecessor comparison possible under authorized scope. Concrete residual cleanup/resource/race detail could improve the existing non-universal safety paragraph. |
| 6. Proposed versus actually executed checks | PASS_WITH_LIMITATIONS | Final clearly labels additional regression proposed/not executed and describes read-only stage checks; it does not claim runtime test success. Actual candidate historical operations/predecessor reads cannot be certified from final and are explicitly excluded. Reviewer actually executed only local reading/hashing/JSON parsing and public primary HTTPS retrieval, not downloaded project code or tests. |

## Obligation-by-obligation coverage

| Obligation | Disposition | Independently checked coverage |
|---|---|---|
| 1. Separate issue, PR merge, and chosen-release availability. | PASS | Issue creation/closure, main merge and SHA, substantive implementation/regression patch, and selected 3.12.3 availability independently checked. No backport inference. Claims: C01, C02, C03, C04, C05, C06, C25. |
| 2. Trace one consequential extraction-filter branch and its callers. | FAIL | Real data branch and both direct callers plus merge and released shutil callers traced. Default/type/path/link/mode/error conditions checked. Class binding and ignored-error continuation are incompletely carried into the final recommendation. Claims: C07, C08, C09, C10, C11, C12, C13. |
| 3. Find relevant regression coverage and state what it demonstrates. | FAIL | All named test bodies and test harness independently read; corresponding initial-merge tests checked. Discovery is relevant, but absolute-path interpretation is overgeneralized and class configuration qualification is dropped. No test execution inferred. Claims: C14, C15, C16. |
| 4. Explain an applicable change to importer policy. | FAIL | Explicit data for direct extraction and built-in tar handlers is supported. Class-level alternative is incorrect; fail-closed errorlevel precondition is not made operational. Claims: C17, C18, C19, C20. |
| 5. Preserve residual limitations and avoid universal safety claims. | PASS_WITH_LIMITATIONS | No universal safety/CVE/backport/later-release guarantee. Malicious content, custom filters, relative strength, errorlevel and version scope preserved. Additional concrete residuals are advisory; predecessor comparison prohibited and unavailable. Claims: C21, C24, C25, C26. |
| 6. Propose a bounded additional regression and stop when the decision is supported. | FAIL | Small importer regression is explicitly proposed and core traversal comparison is useful. Mixed fixture can mask absolute behavior; full presented class alternative and path expectations are not yet supported. Bounded stop/no vulnerability expansion is appropriate. Claims: C22, C23. |

## Evidence and material defects

Only the defects below affect the failure judgment. Supported core recommendations and justified uncertainty are retained; no forced rejection of explicit `data` or universal abstention is warranted.

### D01 — Unwrapped class-level extraction_filter function (high, material)

**Final:** final.md:15, final.md:13 (class-callable qualification).

The exact alternative TarFile.extraction_filter = tarfile.data_filter omits staticmethod for class assignment. It binds self and leads to an uncaught TypeError when called with tarinfo,path. The per-instance alternative and explicit filter=data route are valid.

**Consequence:** A recommended policy alternative cannot perform successful extraction as stated and is not handled by the proposed FilterError catch.

**Minimal correction:** Distinguish instance assignment from an importer-owned class default; the latter requires staticmethod(tarfile.data_filter), or a correctly self-aware subclass method.

**Primary evidence:**
- `tardocold`: lines 605-611 and 1148-1149.
- `taroldtest`: lines 3946-3979.
- `tarold`: lines 827-831, 2219, 2313-2317.
- `pep706`: raw HTML lines 423-427, #defaults-and-their-configuration.
- `tarfix`: /files/6/patch splitlines 961-983.

**Limit on finding:** No claim that the correct explicit filter=data recommendation is unavailable or that instance assignment needs staticmethod.

### D02 — Overgeneralized absolute-path rejection/test conclusion (medium, material)

**Final:** final.md:13, final.md:19.

test_absolute expects successful normalized extraction for leading-slash POSIX member paths. Refusal concerns post-strip absolute paths, escaping resolved destinations, or forbidden link targets. fully_trusted also does not reject paths. The final summary drops these distinctions.

**Consequence:** Incorrect regression interpretation can cause rejection of compliant behavior or a wrongly designed importer assertion.

**Minimal correction:** Qualify the rejection summary by filter, member/link type, host semantics, stripping and containment; preserve successful POSIX normalization as the expected result.

**Primary evidence:**
- `taroldtest`: lines 3391-3401, 3491-3514, 3654-3699, 3701-3754, 3908-3913.
- `tarfix`: /files/6/patch splitlines 654-678 and 759-786.

**Limit on finding:** The combined proposed archive necessarily fails, or data accepts traversal outside dest at default positive errorlevel.

### D03 — Combined proposed fixture can mask the absolute-path branch (medium, material)

**Final:** final.md:19.

A traversal member can abort extractall before the absolute member is processed. An either-error assertion in a single combined archive provides traversal evidence but does not verify absolute normalization/refusal independently.

**Consequence:** The proposed test can pass without covering one of its advertised path conditions.

**Minimal correction:** Keep a bounded parameterized regression with independently reached traversal and platform-appropriate absolute-member subcases; assert the expected contained normalization or post-strip refusal rather than either-error across a mixed archive.

**Primary evidence:**
- `tarold`: lines 755-770, 818-819, 2260-2270, 2347-2357.
- `taroldtest`: lines 3406-3427, 3491-3514.
- `tardocold`: lines 1003-1006.

**Limit on finding:** The useful ../evil.txt test is invalid, or a full tarfile vulnerability suite is required.

### D04 — Ignored filter-error continuation not carried into fail-closed policy (medium, material)

**Final:** final.md:11, final.md:15, final.md:17.

The final correctly states raise if errorlevel>0 and acknowledges dependency. It stops at else debug and never states that a suppressed filter error leaves the original TarInfo in place and can extract it. The amendment does not constrain errorlevel to a positive value. The selected release test and code explicitly show continuation with the member.

**Consequence:** The policy is supported at the ordinary default but is incomplete for configured caller conditions it mentions. A catch cannot handle an exception suppressed inside tarfile.

**Minimal correction:** State that the fail-closed policy requires errorlevel>=1 and that errorlevel<=0 can continue with the unfiltered member; distinguish ExtractError handling (>1) from None skips.

**Primary evidence:**
- `tarold`: lines 1625-1627, 1694-1697, 2304-2357.
- `taroldtest`: lines 4040-4110, especially 4055-4064, 4074-4081, 4091-4098.
- `tardocold`: lines 563-582 and 1076-1080.
- `pep706`: raw HTML lines 435-441, #filtererror.

**Limit on finding:** The final omits all errorlevel discussion, or default errorlevel=1 is unsafe merely because another setting exists.

### A01 — concrete residual details (advisory)

The final explicitly avoids universal safety and preserves malicious content/custom filters/errorlevel/version caveats. It does not retain partial-extraction cleanup, denial-of-service or live-directory manipulation details. Those are useful concrete caveats from the supplied sources. No rollback or general-safety guarantee is asserted, so this is advisory rather than an additional decisive false claim.

Primary: `tardocold.rst:1003-1006,1086-1115`; frozen PEP `#hints-for-further-verification`; `tarold.py:2260-2270`. This does not allege a rollback guarantee absent from the final.

## Consequential-claim checking

Each entry names the exact primary locator, checked fact, governing conditions and defect/materiality. Release-pinned primary bytes govern runtime facts. Source-list membership, merge metadata, hashes and command exits alone were not treated as SourcePASS.

### C01 — Issue identity, creation, closure, and PEP implementation lead

**Final locator:** final.md:9. **Disposition:** SUPPORTED.

**Checked fact:** Issue 102950 title matches; created_at=2023-03-23T14:17:07Z; state=closed; closed_at=2023-05-30T15:47:43Z. Body tracks PEP 706 implementation and links PR 102953.

**Conditions:** Issue closure is issue tracking state, not a release marker or merge timestamp.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarissue` — JSON pointers /number, /title, /created_at, /state, /closed_at, /body. Version/capture: CPython issue 102950 captured 2026-10-07.

### C02 — PR main-branch merge event and merge SHA

**Final locator:** final.md:9. **Disposition:** SUPPORTED.

**Checked fact:** PR 102953 title/body link issue 102950; created_at=2023-03-23T14:21:11Z; /base/ref=main; /merged=true; /merged_at=2023-04-24T08:58:06Z; /merge_commit_sha=af530469954e8ad49f1e071ef31c844b9bfda414. Commit /sha and /commit/message match.

**Conditions:** Merge to main does not by itself establish backport or chosen-release inclusion. The issue closed more than a month after this merge.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarpr` — JSON pointers /number, /title, /body, /created_at, /base/ref, /merged, /merged_at, /merge_commit_sha. Version/capture: CPython PR 102953 captured 2026-10-07; merge SHA recorded in source.
- `tarfix` — JSON pointers /sha, /commit/message. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C03 — Merge changed exactly eight named files

**Final locator:** final.md:9. **Disposition:** SUPPORTED.

**Checked fact:** The /files array has eight entries, exactly the seven named documentation/library/test paths and Misc/NEWS.d/next/Library/2023-03-23-15-24-38.gh-issue-102953.YR4KaK.rst.

**Conditions:** File membership alone is not implementation evidence; the substantive patches were also inspected in C04 and C15/C16.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarfix` — JSON pointers /files/0/filename through /files/7/filename. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C04 — Issue-to-implementation-to-regression chain is real, not merely a merged-PR citation

**Final locator:** final.md:9. **Disposition:** SUPPORTED.

**Checked fact:** Merge adds _get_filtered_attrs, data_filter, named filter mapping, _get_filter_function, per-member filtering, shutil passthrough, and actual TestExtractionFilters regressions. The added test_absolute has a POSIX normalization branch, and the class-default test uses staticmethod. PEP reference implementation names PR 102953.

**Conditions:** Released implementation governs runtime; merge helper link handling is not identical to the later selected-release helper. In particular released symlink targets are resolved relative to the link directory, while the merge patch joined linkname directly to dest_path. No unchanged-code or complete subsequent-fix-history claim is inferred.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarfix` — /files/4/patch: +def _get_filtered_attrs (splitlines 72-127), +def data_filter (137-141), +def _get_filter_function (277-298), +def _get_extract_tarinfo (377-398); /files/6/patch: +class TestExtractionFilters (570 onward), +def test_absolute (654-678), +def test_change_default_filter_on_class (961-971); /files/3/patch: _unpack_tarfile and unpack_archive changes. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.
- `pep706` — raw HTML lines 662-665, #reference-implementation. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.
- `tarold` — lines 755-837 and 2217-2357. Version/capture: CPython 3.12.3.

### C05 — Explicit extraction filters are available in CPython 3.12.3

**Final locator:** final.md:9. **Disposition:** SUPPORTED.

**Checked fact:** v3.12.3 tarfile.py defines fully_trusted_filter, tar_filter, data_filter, _NAMED_FILTERS and filter parameters on both extractall and extract. Released docs mark filter added in 3.12.

**Conditions:** This is selected-release file presence and behavior. It does not establish the first patch release containing every follow-up or any older-version backport.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 818-837, 2240-2241, 2285-2286. Version/capture: CPython 3.12.3.
- `tardocold` — lines 512-513, 516-525, 584-586, 940-945. Version/capture: CPython 3.12.3.

### C06 — 3.12.3 default is fully_trusted with warning; future 3.14 text is contextual

**Final locator:** final.md:9. **Disposition:** SUPPORTED.

**Checked fact:** _get_filter_function(None) consults self.extraction_filter; only when it is also None does it emit DeprecationWarning and return fully_trusted_filter. Docs and frozen PEP describe the intended data default from 3.14.

**Conditions:** Both argument and attribute must be None. An explicitly configured attribute overrides the fallback. Emitting DeprecationWarning does not ensure it is visibly displayed. The final correctly does not certify current 3.14 runtime behavior.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 1639, 2217-2234. Version/capture: CPython 3.12.3.
- `tardocold` — lines 584-603, 980-987. Version/capture: CPython 3.12.3.
- `pep706` — raw HTML lines 404-427, #defaults-and-their-configuration. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.

### C07 — Argument names/callables and extraction_filter strings resolve as stated

**Final locator:** final.md:11. **Disposition:** SUPPORTED_WITH_CLASS_CONDITION_GAP.

**Checked fact:** Explicit callable is returned unchanged; explicit recognized string resolves through _NAMED_FILTERS; unknown string raises ValueError. Attribute strings raise TypeError. The attribute is obtained through self, so a plain function assigned on the class binds self; class configuration requires staticmethod or a self-aware method.

**Conditions:** Argument filter and class/instance extraction_filter are different APIs. A per-instance plain two-argument function works; a class-level plain two-argument function does not. Unsupported non-callable argument types are not all guaranteed ValueError (e.g. unhashable values fail dictionary lookup with TypeError).

**Defect/materiality:** D01; high for the explicit class-level policy alternative.

**Exact primary evidence:**
- `tarold` — lines 2217-2238, 833-837. Version/capture: CPython 3.12.3.
- `tardocold` — lines 592-611. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3946-3985. Version/capture: CPython 3.12.3.

### C08 — Both extract and extractall apply the resolved filter before disk extraction

**Final locator:** final.md:11. **Disposition:** SUPPORTED.

**Checked fact:** extractall loops members through _get_extract_tarinfo before _extract_one; extract does the same for a single member. A string member is first resolved by getmember. None return is skipped; hard links receive a copied TarInfo with _link_target before disk extraction.

**Conditions:** Only a custom callable can return None in this named-filter family: built-in data_filter either returns TarInfo or raises. Disk extraction occurs afterward and is not atomic. set_attrs/numeric_owner govern subsequent metadata application, not whether the filter runs.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 2240-2338, 827-831. Version/capture: CPython 3.12.3.
- `pep706` — raw HTML lines 338-349 and 401-402, #filters. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.

### C09 — Fatal, nonfatal, and skip branches are adequately summarized for fail-closed importing

**Final locator:** final.md:11. **Disposition:** SUPPORTED_BUT_INCOMPLETE.

**Checked fact:** FilterError and OSError invoke _handle_fatal_error; errors raise if errorlevel>0. ExtractError invokes _handle_nonfatal_error and raises only if errorlevel>1. When a filter raises and its error is ignored, assignment to filtered tarinfo never completes, so the original unfiltered member remains and is returned/extracted. The released regression explicitly expects the file to exist after a raising FilterError filter at errorlevel=0.

**Conditions:** Default errorlevel=1, but it can be overridden per instance. Catching FilterError alone cannot fail closed when the extraction layer suppresses it at errorlevel<=0. At errorlevel=1, ExtractError can also continue with the member. A returned None is a distinct skip condition. Released code/tests take precedence over PEP/docs text saying ignored refusal skips the member.

**Defect/materiality:** D04; medium: governing continuation behavior omitted despite a correctly stated positive fatal-error threshold.

**Exact primary evidence:**
- `tarold` — lines 1625-1627, 1694-1697, 2304-2357. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 4040-4110, especially 4055-4064, 4074-4081, 4091-4098. Version/capture: CPython 3.12.3.
- `tardocold` — lines 563-582 and 1076-1080. Version/capture: CPython 3.12.3.
- `pep706` — raw HTML lines 435-441, #filtererror. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.

### C10 — data path handling and claimed absolute/outside-path rejection

**Final locator:** final.md:11. **Disposition:** OVERGENERALIZED_IN_REGRESSION_SUMMARY.

**Checked fact:** Helper resolves dest_path with realpath, strips leading slash and os.sep, tests isabs on the stripped name, and compares realpath(join(dest_path,name)) against dest_path using commonpath. POSIX /evil.txt is rewritten to evil.txt and accepted inside dest unless a further path condition fails. A Windows drive-absolute name may remain absolute after stripping and raise AbsolutePathError. ../evil.txt resolves outside and raises OutsideDestinationError under ordinary destination conditions.

**Conditions:** Original absolute filename alone does not imply rejection. Governing host path semantics, post-strip absoluteness, current symlink resolution, and destination containment matter. The helper does not guarantee freedom from concurrent filesystem changes.

**Defect/materiality:** D02; medium: changes the documented expected result for a proposed regression input.

**Exact primary evidence:**
- `tarold` — lines 755-770. Version/capture: CPython 3.12.3.
- `tardocold` — lines 1020-1035, 1113-1115. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3491-3514. Version/capture: CPython 3.12.3.

### C11 — data sanitizes modes and ownership and rejects special types

**Final locator:** final.md:11. **Disposition:** SUPPORTED_WITH_EXPLICIT_SOURCE_CONDITIONS.

**Checked fact:** For non-None mode, common mask is 0o755. data handling regular files/hard links clears execute bits if owner lacks execute and ensures owner read/write; directories/symlinks get mode=None; other types raise SpecialFileError. For data, uid/gid/uname/gname become None when present. Ownership setters use -1 for None IDs and skip name lookup when names absent; chmod returns for mode=None.

**Conditions:** Special-type refusal in this selected code is inside the mode-is-not-None guard; a caller-supplied TarInfo with mode=None differs from an ordinary archive-parsed member. The final wording clears special files should be read as rejection, not successful extraction of a sanitized device. for_data=False (tar) does not add data-only restrictions. No content, size, duplicate-file, or resource-limit verification follows from these metadata rules.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 771-801, 821-831, 2530-2571. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3806-3906. Version/capture: CPython 3.12.3.
- `tardocold` — lines 1032-1068. Version/capture: CPython 3.12.3.

### C12 — data rejects absolute and out-of-destination links

**Final locator:** final.md:11. **Disposition:** SUPPORTED_WITH_EXPLICIT_SOURCE_CONDITIONS.

**Checked fact:** For hard links and symlinks, os.path.isabs(linkname) raises AbsoluteLinkError. Relative symlink targets join dest_path, dirname(stripped member name), and linkname; hard-link targets join dest_path and linkname. realpath/commonpath decides LinkOutsideDestinationError.

**Conditions:** Link type and host path interpretation govern the root used for relative linknames. AbsoluteLinkError concerns link targets, not the POSIX member-name normalization in C10. Contained relative links are allowed. The selected-release code, not the older merge helper, governs. Platform fallback after link creation failure is separate from filter-time refusal.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 802-815, 1585-1591, 2505-2528. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3654-3699, 3756-3778. Version/capture: CPython 3.12.3.
- `tardocold` — lines 1042-1049. Version/capture: CPython 3.12.3.

### C13 — shutil forwards extraction filters into TarFile callers

**Final locator:** final.md:11. **Disposition:** SUPPORTED_WITH_DISPATCH_CONDITIONS.

**Checked fact:** Merge patch changes _unpack_tarfile to accept filter and forwards to extractall; unpack_archive accepts filter and passes non-None values. Supplementary selected-release shutil.py confirms _unpack_tarfile calls tarobj.extractall(extract_dir,filter=filter); registry-based unpack_archive conditionally builds filter kwargs and dispatches by specified format or filename extension.

**Conditions:** Built-in tar/tar-compression handlers use this route; compressed handlers require matching compression modules. filter=None is not forwarded as a keyword by unpack_archive, but _unpack_tarfile defaults to None. ZIP handler does not accept filter. Custom registered unpackers can differ or replace built-in names. Recommendation for tar archives is appropriately bounded, but callers must actually select a tar handler, not assume archive content sniffing.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarfix` — /files/3/patch: _unpack_tarfile hunk and unpack_archive filter_kwargs/dispatch hunks. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.
- `shutil-3.12.3.py` — lines 1271-1274, 1301-1390. Version/capture: CPython v3.12.3 tag.
- `shutil-3.12.3.rst` — lines 682-702, 719-733, 750-760. Version/capture: CPython v3.12.3 tag.
- `tarfix` — /files/5/patch splitlines 51-82: tar filter coverage and ZIP TypeError assertion. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C14 — All named TestExtractionFilters methods exist at the cited released locations

**Final locator:** final.md:13. **Disposition:** SUPPORTED.

**Checked fact:** Class at 3404; test_absolute 3491; absolute_symlink 3655; absolute_hardlink 3684; fully_trusted_filter 3908; tar_filter 3915; data_filter 3925; default_filter_warns 3937; instance/class/subclass configuration 3946/3957/3969; to_string 3981; custom_filter 3987; bad_filter_name 4004; stateful_filter 4010.

**Conditions:** Existence is not sufficient to establish the final claimed behavior. Assertion bodies and harness were independently read, including the additional nearby errorlevel regression. Not every released test was introduced in the initial merge (absolute_hardlink is present in release but not in the captured merge patch).

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `taroldtest` — lines 3404-3482, 3491-3514, 3655-3699, 3908-4038. Version/capture: CPython 3.12.3.
- `tarfix` — /files/6/patch; search for test_absolute_hardlink returned no occurrence. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C15 — Regression coverage demonstrates named filters reject absolute/outside paths

**Final locator:** final.md:13. **Disposition:** PARTLY_FALSE.

**Checked fact:** test_absolute explicitly permits leading-slash POSIX absolute members after normalization for tar and data; on platforms whose absolute paths lack leading slash it expects AbsolutePathError. fully_trusted test establishes identity and its absolute test writes outside dest. Absolute-link tests expect data AbsoluteLinkError; tar either fails on a later outside member or follows platform-specific link fallback. Traversal tests expect OutsideDestinationError for tar/data.

**Conditions:** Cannot summarize all named filters as rejecting all absolute paths. Differentiate fully_trusted versus tar/data, member names versus linknames, POSIX normalization versus Windows-style post-strip absolute paths, and link support/WASI skips. Tests are static source evidence, not newly executed results.

**Defect/materiality:** D02; medium.

**Exact primary evidence:**
- `taroldtest` — lines 3391-3401, 3491-3514, 3654-3699, 3701-3754, 3908-3913. Version/capture: CPython 3.12.3.
- `tarfix` — /files/6/patch splitlines 654-678 and 759-786. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C16 — Default warning, bad names, configured callables, custom/stateful behavior and metadata tests demonstrate the stated limited features

**Final locator:** final.md:13. **Disposition:** SUPPORTED_WITH_CLASS_QUALIFICATION.

**Checked fact:** default warning test extracts foo while checking Python 3.14 DeprecationWarning; instance configuration assigns a two-argument function; class configuration uses staticmethod; subclass provides a self-aware method; string attribute raises TypeError. custom filter moves one member, returns None for another, preserves a third. Stateful filter calls data_filter, catches FilterError into None and counts two accepted duplicate good members; bad filter string raises ValueError. Mode tests compare final metadata for each filter.

**Conditions:** These are deliberately limited tests, not safety proof. test_tar_filter only checks fixture member name/type identity; test_data_filter tolerates FilterError and checks surviving name/type identity. test_stateful_filter comment says it demonstrates third-party use, not a tarfile implementation guarantee. Mode assertions depend on working chmod and non-Windows platform; some link tests skip WASI.

**Defect/materiality:** D01; high only for the downstream class assignment; general test discovery is useful and correct.

**Exact primary evidence:**
- `taroldtest` — lines 3391-3401, 3443-3454, 3806-3873, 3908-4038. Version/capture: CPython 3.12.3.
- `tarfix` — /files/6/patch splitlines 912-1043. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C17 — Explicit data filter on direct extraction and built-in tar unpacking is an applicable amendment

**Final locator:** final.md:15. **Disposition:** SUPPORTED.

**Checked fact:** Released API accepts filter=data on extract/extractall; released shutil tar handler forwards it. Released docs recommend explicit data for dangerous tar extraction features.

**Conditions:** Applies to tar paths/handlers with data-compatible requirements. It intentionally changes metadata/link/special-file compatibility. Does not replace importer content validation. Explicit argument bypasses extraction_filter class binding; every relevant direct extraction call must use the policy.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 2217-2302, 833-837. Version/capture: CPython 3.12.3.
- `tardocold` — lines 490-504, 976-978, 1142-1149. Version/capture: CPython 3.12.3.
- `shutil-3.12.3.py` — lines 1301-1313, 1344-1390. Version/capture: CPython v3.12.3 tag.
- `shutil-3.12.3.rst` — lines 696-700. Version/capture: CPython v3.12.3 tag.

### C18 — Alternative TarFile.extraction_filter = tarfile.data_filter works on importer-owned class/instance

**Final locator:** final.md:15. **Disposition:** FALSE_FOR_CLASS_SUPPORTED_FOR_INSTANCE.

**Checked fact:** Released docs explicitly require staticmethod for a class-level function to prevent self injection; released regression uses staticmethod(strict_filter). self.extraction_filter returns a bound method for a plain class function, then _get_extract_tarinfo calls it with tarinfo,path, supplying three arguments to the two-argument data_filter. A resulting TypeError is not handled as FilterError. Instance attribute assignment avoids descriptor binding.

**Conditions:** Class default requires staticmethod(tarfile.data_filter), or a correctly self-aware method on an importer-owned subclass; instance default may be assigned plain tarfile.data_filter. Explicit filter=data is also valid. The final exact snippet is a class assignment, even though prose conflates class/instance.

**Defect/materiality:** D01; high: executable policy alternative fails before successful extraction and escapes the recommended FilterError handler.

**Exact primary evidence:**
- `tardocold` — lines 605-611 and 1148-1149. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3946-3979. Version/capture: CPython 3.12.3.
- `tarold` — lines 827-831, 2219, 2313-2317. Version/capture: CPython 3.12.3.
- `pep706` — raw HTML lines 423-427, #defaults-and-their-configuration. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.
- `tarfix` — /files/6/patch splitlines 961-983. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C19 — Catch FilterError and abort without fully_trusted fallback implements fail-closed policy

**Final locator:** final.md:15. **Disposition:** SUPPORTED_UNDER_STATED_POSITIVE_ERRORLEVEL_BUT_INCOMPLETE_AS_POLICY.

**Checked fact:** All listed filter error types subclass FilterError, so catching base FilterError at default errorlevel=1 catches those rejections. Default 3.12.3 fallback without explicit policy is fully_trusted. At errorlevel=0 a raised filter error is suppressed and the original member can still reach disk extraction. Aborting at a later member leaves prior extracted files.

**Conditions:** The final does state errorlevel>0 in line 11 and dependence in line 17; it is not silent about that dependency. It does not bind the importer policy to errorlevel>=1 or state the unfiltered continuation consequence. Aborting is not rollback, and no application-specific transaction/cleanup was supplied. No importer source was supplied or inspected.

**Defect/materiality:** D04; medium conditional completeness gap; default positive-errorlevel recommendation itself is valid.

**Exact primary evidence:**
- `tarold` — lines 723-753, 1625-1627, 2304-2357, 2260-2270. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 4055-4064, 4074-4081. Version/capture: CPython 3.12.3.
- `tardocold` — lines 581-582, 1003-1006. Version/capture: CPython 3.12.3.

### C20 — Review/lint can require an explicit filter on extraction

**Final locator:** final.md:15. **Disposition:** SUPPORTED_AS_PROPOSAL_NOT_IMPLEMENTED.

**Checked fact:** The proposed rule targets direct extraction APIs with explicit filter support. The output offers no lint implementation, importer code modification, or actual enforcement result.

**Conditions:** If an importer chooses a configured attribute alternative it must reconcile that choice with the proposed no-call-without-filter lint rule. This is a small policy recommendation, not an executed application plan.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarold` — lines 2240-2241, 2285-2286. Version/capture: CPython 3.12.3.
- `tardocold` — lines 490-494. Version/capture: CPython 3.12.3.

### C21 — data is risk-reducing, tar is less restrictive, and universal safety is not established

**Final locator:** final.md:17. **Disposition:** SUPPORTED_WITH_RESIDUAL_DETAIL_LIMIT.

**Checked fact:** Released tar_filter sets for_data=False, so data-only link-target, ownership and type constraints do not apply. PEP/released docs explicitly warn that data does not make untrusted extraction generally safe; pre-defined filters do not prevent denial-of-service, duplicate overwrite, or live destination manipulation; cleanup of partially extracted archives remains the caller responsibility. Custom filters can bypass data restrictions or skip refusals as the stateful test demonstrates.

**Conditions:** Final preserves malicious content, custom filters, errorlevel dependence, version limitation and no universal safety claim. It omits concrete partial-output/resource/live-filesystem limitations. This is an advisory precision gap, not a false claim of transactionality or a demand to audit all tarfile vulnerabilities.

**Defect/materiality:** A01; advisory; broad residual-limitation obligation substantially preserved.

**Exact primary evidence:**
- `tarold` — lines 755-831, 2260-2270. Version/capture: CPython 3.12.3.
- `tardocold` — lines 1003-1006, 1086-1115. Version/capture: CPython 3.12.3.
- `pep706` — raw HTML lines 486-518, #hints-for-further-verification. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.
- `taroldtest` — lines 4010-4038. Version/capture: CPython 3.12.3.

### C22 — One combined traversal-plus-absolute archive is a useful bounded additional regression

**Final locator:** final.md:19. **Disposition:** USEFUL_TRAVERSAL_CORE_BUT_INSUFFICIENT_ABSOLUTE_COVERAGE.

**Checked fact:** At default errorlevel=1, a first ../evil.txt member rejects with OutsideDestinationError before later members. If an absolute POSIX member is reached first, it is stripped and can be extracted inside dest. Therefore one archive with an either-error assertion does not independently test the absolute member behavior. The fully_trusted control is consistent with identity behavior and existing test_absolute outside-destination result for a controlled fixture.

**Conditions:** The proposed test is not guaranteed to fail: it can pass correctly on the traversal member while never assessing the absolute member. No specific absolute member path, host semantics, ordering assertion, isolated outer test directory, or partial-output assertion is supplied. fully_trusted is intentionally an adverse comparison in a proposed test, not an importer production fallback. The core regression and bounded scope are useful.

**Defect/materiality:** D03, D02; medium: proposed regression can mask the governing absolute-path branch and does not justify its generalized rejection summary.

**Exact primary evidence:**
- `tarold` — lines 755-770, 818-819, 2260-2270, 2347-2357. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3406-3427, 3491-3514. Version/capture: CPython 3.12.3.
- `tardocold` — lines 1003-1006. Version/capture: CPython 3.12.3.

### C23 — The additional regression was proposed, not executed; decision is supported and stops

**Final locator:** final.md:19. **Disposition:** PROPOSAL_EXECUTION_DISTINCTION_SUPPORTED_STOP_JUSTIFICATION_PARTIAL.

**Checked fact:** Frozen final explicitly labels PROPOSED, not executed in line 19 and repeats this in line 23. Existing primary implementation/tests support explicit data at default positive errorlevel. They contradict the class assignment and blanket absolute-rejection summary.

**Conditions:** A bounded stop without auditing every vulnerability is appropriate. No further primary corpus is needed to identify D01-D04, but the statement that the complete presented policy/expectations are already supported is too strong. No runtime validation was claimed or independently conducted.

**Defect/materiality:** D01, D02, D03, D04; material only to the complete policy/coverage claim; main explicit data decision remains justified.

**Exact primary evidence:**
- `tarold` — lines 2217-2357. Version/capture: CPython 3.12.3.
- `taroldtest` — lines 3491-3514, 3957-3967, 4040-4110. Version/capture: CPython 3.12.3.
- `tardocold` — lines 605-611. Version/capture: CPython 3.12.3.

### C24 — Linked follow-ups and unofficial backport are acknowledged but not investigated

**Final locator:** final.md:25. **Disposition:** SUPPORTED_AS_OPEN_LEADS.

**Checked fact:** Issue /body lists gh-103832, gh-104128, gh-104327, gh-104382, gh-104548, gh-104583 and unofficial encukou/cpython pull/26, matching final.

**Conditions:** These are unpursued leads, not disproved fixes or verified backports. No claim about their implementation/release correctness is made. Following all of them is unnecessary to establish selected-release data support from frozen release bytes.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarissue` — JSON pointer /body, Linked PRs and Unofficial backport sections. Version/capture: CPython issue 102950 captured 2026-10-07.

### C25 — Backport/release-note mapping beyond v3.12.3 and current later-version behavior are uncertain

**Final locator:** final.md:24. **Disposition:** JUSTIFIED_UNCERTAINTY.

**Checked fact:** Selected released files establish presence/semantics in v3.12.3, while merge metadata establishes a main-branch event. Neither certifies every backport or a current 3.14 binary. Released docs/PEP supply future-default wording only.

**Conditions:** Do not convert this uncertainty into missing chosen-release availability: presence in the selected release is affirmatively proved. No new negative fact about other branches is inferred.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `tarpr` — JSON pointers /base/ref, /merged_at, /merge_commit_sha. Version/capture: CPython PR 102953 captured 2026-10-07; merge SHA recorded in source.
- `tarold` — lines 818-837, 2217-2238, 2240-2241, 2285-2286. Version/capture: CPython 3.12.3.
- `tardocold` — lines 602-603, 1118-1124. Version/capture: CPython 3.12.3.

### C26 — Frozen primary source identities and line-level traceability are preserved

**Final locator:** final.md:30. **Disposition:** SUPPORTED.

**Checked fact:** All seven source paths/IDs/URLs/versions/hash identities map exactly to the manifest; all seven computed SHA-256 hashes match. Numbered implementation/test anchors exist and primary content was checked independently, not accepted because of citations. Source hashes in final match the mapped primary bytes.

**Conditions:** Ellipsis source paths/URLs require resolving through the map/manifest; they are not independent proof. Predecessor references identify claimed source lineage but their contents were deliberately not read. No preservation comparison with predecessors is available.

**Defect/materiality:** No material defect identified for this claim; none.

**Exact primary evidence:**
- `pep706` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior.
- `tarissue` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: CPython issue 102950 captured 2026-10-07.
- `tarpr` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: CPython PR 102953 captured 2026-10-07; merge SHA recorded in source.
- `tarold` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: CPython 3.12.3.
- `tardocold` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: CPython 3.12.3.
- `taroldtest` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: CPython 3.12.3.
- `tarfix` — whole-file SHA-256 identity; specific claim locators in C01-C25. Version/capture: CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches.

### C27 — Candidate stage scope, claimed read-only operations and predecessor reads; no additional candidate captures/execution/delegation

**Final locator:** final.md:5,23,37-38. **Disposition:** ACTUAL_OPERATIONS_NOT_INDEPENDENTLY_VERIFIABLE_UNDER_SCOPE.

**Checked fact:** Frozen final reports these activities and explicitly distinguishes its proposed regression. Authorized inputs contain no independent candidate operation log. Reviewer did not inspect candidate history or predecessor outputs. Reviewer supplementary captures are separate from candidate captures.

**Conditions:** Content-level distinction between proposed and executed checks can be assessed; actual historical candidate actions, predecessor preservation, and claims of no additional captures cannot be certified from final bytes alone. No allegation of hidden execution or fabricated activity follows.

**Defect/materiality:** No material defect identified for this claim; scope limitation; not counted as evidence of execution or a material product defect.

No historical primary-operation record is authorized or available for this claim. It is not independently certified.

## Source identities and evidence preservation

The following byte identities were checked; all required hashes matched before substantive assessment. Exact source paths and every reviewed locator are also in `sources/checked_sources.json`.

- **pep706** — [PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior](https://peps.python.org/pep-0706/); SHA-256 `6139a435b458b6091ea2bfebd2b1ba9a163633e62f55b33720870d558e01b71e`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/pep706.html`.

- **tarissue** — [CPython issue 102950 captured 2026-10-07](https://api.github.com/repos/python/cpython/issues/102950); SHA-256 `9ba5b6f74ea5ac74bfd12cc13f9fa3610fcae050617003563732e0fda4ee7a84`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarissue.json`.

- **tarpr** — [CPython PR 102953 captured 2026-10-07; merge SHA recorded in source](https://api.github.com/repos/python/cpython/pulls/102953); SHA-256 `63cb304e277da293006a1f650612d5a1b21fbccb7456dd9e734cf2c5d6fbe8e2`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarpr.json`.

- **tarold** — [CPython 3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/tarfile.py); SHA-256 `5dd00cc68e88d9581551b1a457398c5b63d87ae1152fa03ef298743485d12cc8`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarold.py`.

- **tardocold** — [CPython 3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/tarfile.rst); SHA-256 `242eb30a709c00b4b16d173f3573b6e893e05b0c49d59618d5dc547bd60e7b99`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tardocold.rst`.

- **taroldtest** — [CPython 3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_tarfile.py); SHA-256 `134c5c8703e23f6dc16feaaa0d2cb77c93275f3360dd45e1b6c622d864113239`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/taroldtest.py`.

- **tarfix** — [CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches](https://api.github.com/repos/python/cpython/commits/af530469954e8ad49f1e071ef31c844b9bfda414); SHA-256 `789a86915c7035d138415e1f9c5e5552745730fb078a1a58615077f7e5a6939f`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarfix.json`.

- **shutil-3.12.3.py** — [CPython v3.12.3 tag](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/shutil.py); SHA-256 `819e518cb7a539d09b2526138015541b34d2646afb9c2f6ae4ffd476d6a0fcf4`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M13-A/treatment-v2/sources/shutil-3.12.3.py`.

- **shutil-3.12.3.rst** — [CPython v3.12.3 tag](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/shutil.rst); SHA-256 `51c991b2a28b8cc00de14b6cb71dcfbe64c78f28a8a24b5af7b43e0eb74bff67`; `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M13-A/treatment-v2/sources/shutil-3.12.3.rst`.

## Assessment extent, exclusions and checks

Full declared-scope checking covers all six material findings, all six axes, all six obligations, the implementation/regression/release chain, caller and path/type/default/error conditions, source identities, uncertainty and optional-lead statements, and proposed/executed labeling. **No in-scope product-claim remainder is unassessed.** Static inspection does not mean every line of these large source files was relevant or every test was run.

Predecessor preservation comparison is unavailable because predecessor contents are prohibited. Actual candidate sourceoperations and no-capture/no-execution history are unverifiable from final bytes alone; the review assesses their labeling and does not invent historical attestation. Current later-version binaries, backports/follow-up implementations, other vulnerabilities, arbitrary custom unpackers, and runtime importer correctness are outside this bounded scope.

Actual reviewer checks: hash/identity verification; JSON field and substantive merge-patch inspection; numbered release-code/docs/test-assertion inspection; independent release-pinned HTTPS retrieval and static caller checking; local output validation. No downloaded code, importer helper, CPython suite or proposed regression was executed. Candidate read-only checks remain self-reported. The proposed regression is not represented as passed.

Timing and sourceoperations are recorded in `timings.json`, from own T3 requestedAt `2026-10-07T19:40:41.557Z`, including native startup, tools, service access, writing and delivery. The earlier supplied deadline `2026-10-07T19:52:13.923989+00:00` governs; no reset. Usage unknowninput/input/cache/generated/billing is null; native metadata is separately identified. **Pending children: 0.** Original candidate bytes/grades remain immutable. No cost or winning-arm judgment.
