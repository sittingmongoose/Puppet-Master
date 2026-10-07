# Independent primary-source review

**Deadline failure:** Source inspections completed before expiry, but assessment/report writing and delivery did not. These artifacts were saved outside the original deadline and its 60-second grace. This is not a compliant completed bounded review. At expiry, report finalization and delivery remained incomplete. No deadline reset.

**Overall: FAIL — full declared scope assessed.** The core explicit `data` filter policy for CPython 3.12.3 is supported. The frozen final materially misstates ignored filter errors and absolute-path behavior, and its proposed regression lacks the conditions/invocation structure needed to demonstrate its stop rule. This is a full-scope review, not DIAGNOSTIC_FAIL.

Frozen final: `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M13-A/control/finalize-v2/final.md`. SHA-256 `8e287967731d0cfd393b747281371d9e51afb7c3aa2ec72597fd335c6708b34e` matched before assessment. All seven required primary hashes matched.

## Scope and blinding

All material factual and policy/test-design claims in the frozen final assessed across all six axes and all obligations. This is not a localized diagnostic failure. Full declared-scope checking does not mean every unrelated source line or tarfile vulnerability audited.

- Method/arm labels were visible in permitted paths and final heading; not fully method-blind.
- INPUT_MAP is an advisory scope map, not a filesystem access firewall. Compliance was voluntary path/URL restriction.
- No other arm, drafts, predecessor bytes, timing/history, cases beyond mapped input paths, helpers, campaign, parent analysis or other reviews read. No prior findings, candidate feedback, rescue, regrading or best-of selection.
- No cost, winner or speed target supplied or sought; no comparative arm judgment.
- Unavailable; only its mention/path inside exact frozen final seen. No comparison attempted.

No predecessor comparison was available. Candidate operation history is unavailable; source-inspection assertions are treated as self-report. This reviewer read only mapped brief/manifest/primary bytes/exact final, three additional public primary captures, and its own artifacts. No delegation, native Goal, candidate feedback or changes to original candidate bytes/grades.

## Six axes

| Axis | Disposition | Assessment |
|---|---|---|
| 1. Every required obligation | FAIL | All six assessed; obligations 3, 5 and 6 have material failures. Obligations 1 and the central 2/4 decisions are supported, with disclosed conditional omissions. |
| 2. Consequential claims and all governing release/default/type/path/caller conditions | FAIL | 27 claim groups checked. D01 contradicts released behavior; D02/D03 affect path/error-level validation; D04-D06 preserve handler/global/type applicability boundaries. |
| 3. Bounded useful discovery including negative/optional yield | PASS_WITH_CAVEAT | Final finds useful issue/merge/code/test/release evidence and lists legitimate untaken follow-ups/backport/other-CVE/shutil tracing. Scope is bounded. Regression yield is overstated as recorded separately in D02; no penalty for declining unrelated vulnerability sweep. Reviewer added only selected-release shutil conditions and 3.14 default confirmation. |
| 4. Wrong rejection/correction or unjustified universal abstention | FAIL | No universal abstention: final gives a supported core recommendation. D02 expects rejection of valid sanitized slash-absolute input and its all-four-blocked stop rule can misclassify correct behavior. No forced rejection of overall data policy. |
| 5. Preservation/traceability/uncertainties/optional content within final | PASS_WITH_LIMITATION | Seven full identities/hashes, code/test anchors, optional alternatives, uncertainties and residual limitations preserved within final. D01 is factual correctness failure, not proof of predecessor loss. Predecessor comparison unavailable by access restriction; no assertion of comparative preservation. |
| 6. Proposed versus actually executed checks | PASS_WITH_LIMITATION | Static source checks distinguished from unexecuted regression and future default recheck. No test success or implementation claimed. Actual candidate operation history and predecessor reading are self-reports outside allowed evidence; reviewer does not certify those assertions. Reviewer independently checked primary bytes without executing downloaded code. |

## Obligations

| Obligation | Disposition | Coverage/evidence |
|---|---|---|
| 1. Separate issue, PR merge, and chosen-release availability. | PASS | Issue, merge, implementation patch, original regression additions and selected-release availability independently verified; 3.14 default additionally confirmed. Claims: C01, C02, C03, C04, C05. Defects: none. |
| 2. Trace one consequential extraction-filter branch and its callers. | PASS_WITH_CONDITION_OMISSION | Outside-destination branch and public callers traced correctly. Adjacent special-file claim omits custom TarInfo mode guard. Claims: C06, C07, C08, C09, C10, C11. Defects: D06. |
| 3. Find relevant regression coverage and state what it demonstrates. | FAIL | Relevant regression found, including merge-to-release lineage, but summary omits decisive platform/path and filter-versus-device-creation conditions. Claims: C12, C13, C14, C15. Defects: D02. |
| 4. Explain an applicable change to importer policy. | PASS_WITH_CONDITIONAL_OMISSIONS | Core explicit data/errorlevel/owned-temp cleanup policy supported; shutil handler applicability and global-class authority underqualified. Claims: C16, C17, C18, C19, C20. Defects: D04, D05. |
| 5. Preserve residual limitations and avoid universal safety claims. | FAIL | Useful residual caveats and no universal safety claim retained, but released errorlevel=0 risk is materially misdescribed. Claims: C21, C22, C23. Defects: D01. |
| 6. Propose a bounded additional regression and stop when the decision is supported. | FAIL | Bounded proposed regression/stop rule present and not claimed executed, but wrong absolute rejection plus absent invocation isolation prevent it from supporting stated checks. Claims: C24, C25. Defects: D02, D03. |

## Defects and materiality

### D01: Released errorlevel=0 behavior incorrectly described as skip-and-continue

**HIGH; CONFIRMED.** Misstates whether refused content can reach disk. Recommended >=1 mitigates the importer path, but the residual-risk account remains materially false.

Documentation says skip, but checked release implementation and its regression permit extraction of original member after ignored FilterError. Preserve this source conflict and give released code precedence.

Final: final.md:13. Exact primary locators: tarold.py:2304-2325, 2347-2357; taroldtest.py:4060-4061; tardocold.rst:1079-1080. Claim checks: C22.

### D02: Absolute-path rejection and regression coverage omit OS/path conditions

**HIGH; CONFIRMED.** Proposed test and stop rule can reject correct filter behavior on POSIX and misrepresent the cited test. Also overstates platform-independent regression outcomes.

Slash-absolute paths are sanitized, not generally rejected. Still-absolute names after stripping are rejected. Symlink tests branch on support/path resolution; special-file tests distinguish filter checks from device creation. Finding 2 correctly describes slash stripping, but findings 3/6 fail to preserve that condition.

Final: final.md:11, final.md:14. Exact primary locators: tarold.py:759-770; taroldtest.py:3491-3514, 3532-3565, 3634-3652, 3875-3906. Claim checks: C13, C14, C24.

### D03: Proposed multi-error default-errorlevel regression lacks an executable isolation/invocation structure

**MEDIUM; CONFIRMED_AS_DESIGN_OMISSION.** A normal extractall stops at its first refusal and cannot demonstrate all four later error expectations or tar FIFO result in that same run; proposal does not establish a bounded complete check.

The final must distinguish per-member/isolated invocations from one aborting extractall. This is an underspecified proposal, not a finding that every conceivable five-member test is impossible.

Final: final.md:14. Exact primary locators: tarold.py:2260-2270, 2312-2315, 2347-2350; taroldtest.py:3415-3441. Claim checks: C25.

### D04: shutil policy omits tar-only/handler-signature applicability

**MEDIUM_CONDITIONAL; CONDITIONAL_SCOPE_OMISSION.** Applying the written amendment to ZIP/custom handlers can raise TypeError. No practical defect if importer is already tar-only; that restriction is unstated.

Explicit data forwarding is appropriate for supported tar formats, not an unconditional archive-wide keyword policy. This condition was visible in required merge patch and corroborated in selected-release bytes.

Final: final.md:12. Exact primary locators: tarfix /files/0/patch; shutil3123:1271-1273, 1301-1323, 1370-1390; shutildoc3123:696-699. Claim checks: C17.

### D05: Optional class-wide default confused with owning a TarFile instance

**LOW_CONDITIONAL; CONDITIONAL_SCOPE_OMISSION.** Global default changes other consumers if used in a library/importer process. No mutation actually performed; core explicit-call policy remains supported.

Class staticmethod syntax is correct. Governing condition is top-level application/site authority over global policy; instance ownership alone does not confer that.

Final: final.md:12. Exact primary locators: tardocold.rst:605-611; taroldtest.py:3946-3967. Claim checks: C18.

### D06: Special-file rejection claim lacks member.mode guard for supplied TarInfo

**LOW_CONDITIONAL; CONDITIONAL_TYPE_OMISSION.** Does not undermine ordinary parsed-archive recommendation, but matters to the final unrestricted extract/TarInfo and data-filter branch description.

In selected release, type rejection is nested inside mode is not None. Modified caller-supplied TarInfo with mode=None bypasses that branch. No claim that malformed/custom metadata is a tested package archive.

Final: final.md:10. Exact primary locators: tarold.py:772-789; tardocold.rst:760-769. Claim checks: C07.

## Consequential claims: exact checking record

Locators use one-based source file lines, JSON pointers, and one-based newline indices within JSON patch strings. Source IDs resolve to the URL/version/path/hash catalog below. Every entry records checked facts and governing conditions; citations alone are not treated as proof.

### C01 — SUPPORTED

**Final final.md:9:** Issue 102950 tracks PEP 706; created 2023-03-23 and closed 2023-05-30; issue closure differs from implementation/release.

**Primary locators:** tarissue JSON /number, /title, /body, /created_at, /closed_at, /state.

**Checked fact:** Issue number/title/body identify the implementation work; timestamps are 2023-03-23T14:17:07Z and 2023-05-30T15:47:43Z. Body links PR 102953 and follow-ups.

**Conditions/limits:** An issue is a tracking record; closed state alone proves neither merge nor selected-release behavior.

**Defects:** none. Static inspection; no downloaded code execution.

### C02 — SUPPORTED

**Final final.md:9:** PR 102953 merged on main at 2023-04-24T08:58:06Z with af530469954e8ad49f1e071ef31c844b9bfda414.

**Primary locators:** tarpr JSON /number, /title, /base/ref, /merged, /merged_at, /merge_commit_sha; tarfix JSON /sha, /commit/message, /commit/committer/date.

**Checked fact:** PR merged=true, base.ref=main, merge SHA and timestamp match commit identity/message/date.

**Conditions/limits:** Merge into main is not a claim that any particular release already contains the code.

**Defects:** none. Static inspection; no downloaded code execution.

### C03 — SUPPORTED

**Final final.md:9:** Merge changed eight files including tarfile, shutil, their tests, docs, whatsnew and NEWS.

**Primary locators:** tarfix JSON /files/0..7/filename, /files/0..7/status.

**Checked fact:** Exactly eight file records: Doc/library/shutil.rst, Doc/library/tarfile.rst, Doc/whatsnew/3.12.rst, Lib/shutil.py, Lib/tarfile.py, Lib/test/test_shutil.py, Lib/test/test_tarfile.py, and the named NEWS fragment.

**Conditions/limits:** This is changed-file metadata and actual supplied patches, not just a PR description.

**Defects:** none. Static inspection; no downloaded code execution.

### C04 — SUPPORTED

**Final final.md:9:** PEP targets Python 3.12 and CPython 3.12.3 contains the filter API.

**Primary locators:** pep706.html:104-105, 330-342, 663-664; tarfix /files/4/patch lines 72-146, 377-398; tarold.py:755-837, 1639, 2217-2325; tardocold.rst:512-513, 945.

**Checked fact:** PEP Python-Version is 3.12; merge adds filter helper/functions and caller mediation; released v3.12.3 bytes contain those functions, extraction_filter and filter keyword parameters.

**Conditions/limits:** Availability in selected release is independently checked from release-tag source, not inferred from closed issue or merge date. No earliest patch-release audit claimed.

**Defects:** none. Static inspection; no downloaded code execution.

### C05 — SUPPORTED

**Final final.md:9:** With both filter and extraction_filter None, 3.12.3 warns and uses fully_trusted; data becomes default in 3.14.

**Primary locators:** tarold.py:2217-2238, 1639; taroldtest.py:3937-3944; tardocold.rst:596-611, 980-987; pep706.html:417-426; tar3140:2370-2386.

**Checked fact:** 3.12.3 emits DeprecationWarning and returns fully_trusted_filter when both are None. Additional v3.14.0 source returns data_filter under exactly that condition.

**Conditions/limits:** Explicit callable/string or instance/class extraction_filter overrides this branch. Warning visibility depends on warning settings; emitted does not mean always displayed. 3.14 confirmation is reviewer-added, not attributed to candidate execution.

**Defects:** none. Static inspection; no downloaded code execution.

### C06 — SUPPORTED

**Final final.md:10:** Shared outside-destination branch strips leading separators, rejects remaining absolute names, resolves target and checks commonpath.

**Primary locators:** tarold.py:755-770; tarfix /files/4/patch lines 72-87; tardocold.rst:1024-1031.

**Checked fact:** dest_path and joined target are realpath-normalized. Leading slash/os.sep are stripped; AbsolutePathError only if resulting name remains absolute. commonpath inequality raises OutsideDestinationError.

**Conditions/limits:** Host OS path semantics govern absoluteness. C:/foo example applies on Windows. Ordinary /foo on POSIX becomes foo inside destination; existing disk symlinks affect realpath.

**Defects:** none. Static inspection; no downloaded code execution.

### C07 — SUPPORTED_WITH_CONDITION_OMISSION

**Final final.md:10:** data adds link refusal, mode sanitization, ownership stripping and special-file refusal.

**Primary locators:** tarold.py:771-815, 821-831; tardocold.rst:1037-1066, 760-769; taroldtest.py:3806-3906.

**Checked fact:** tar invokes for_data=False; data invokes True. Permission mask 0o755 applies if mode is not None; data ensures owner rw for regular files/hardlinks, clears other exec when owner lacks exec, sets dir/symlink mode None. Ownership becomes None. SpecialFileError occurs in the mode-not-None type branch.

**Conditions/limits:** Regular and hardlink modes differ from directory/symlink modes. Special-file rejection in this released code is guarded by member.mode is not None. Ordinary parsed archive metadata has integer mode; caller-supplied TarInfo can have None. Final omits this custom-metadata condition.

**Defects:** D06. Static inspection; no downloaded code execution.

### C08 — SUPPORTED

**Final final.md:10:** data rejects absolute or outside links.

**Primary locators:** tarold.py:802-815; taroldtest.py:3655-3699, 3757-3778; tarfix /files/4/patch lines 119-125.

**Checked fact:** Both hard and symbolic links are checked. Absolute linkname raises AbsoluteLinkError first. Relative symbolic target resolves relative to member parent; hardlink target relative to archive destination. Resolved commonpath inequality raises LinkOutsideDestinationError.

**Conditions/limits:** Absolute and relative outside linknames produce different errors; checks occur before creating OS links. The merge patch used destination-relative joining for both; selected-release code has the explicit symlink-parent branch. No assumption of zero intervening drift made.

**Defects:** none. Static inspection; no downloaded code execution.

### C09 — SUPPORTED

**Final final.md:10:** Filter dispatch: None fallback, callable passthrough, named string resolution, unknown name ValueError; attribute strings rejected.

**Primary locators:** tarold.py:2217-2238; taroldtest.py:3946-4008; pep706.html:397-426.

**Checked fact:** Source dispatch exactly matches those paths. Attribute strings raise TypeError; known explicit string selects _NAMED_FILTERS; unknown string raises ValueError; callable accepted.

**Conditions/limits:** Unknown-name assertion applies to string/name lookup; arbitrary unhashable wrong-type inputs may raise TypeError. Class functions require correct binding; instance callable does not require a global class change.

**Defects:** none. Static inspection; no downloaded code execution.

### C10 — SUPPORTED

**Final final.md:10:** extractall/extract call filter before disk extraction; None skips.

**Primary locators:** tarold.py:2240-2325, 2327-2338, 2391-2432; taroldtest.py:3415-3441, 3987-4002.

**Checked fact:** Both public methods call _get_filter_function then _get_extract_tarinfo. extractall loops and continues for None; extract only calls _extract_one for non-None. _extract_one calls _extract_member.

**Conditions/limits:** extract may resolve a string member with getmember or receive TarInfo; members=None iterates archive. Filter return None skips; exception handling is a separate branch. Direct internal recursive link extraction exists at 2521-2526 and is not a fresh call through public dispatch; final presents the public caller path, not an exhaustive internal-call audit.

**Defects:** none. Static inspection; no downloaded code execution.

### C11 — SUPPORTED

**Final final.md:10:** CLI --filter reaches extractall; shutil was extended in merge.

**Primary locators:** tarold.py:2804-2830, 2851-2862; taroldtest.py:2768-2785; tarfix /files/3/patch, /files/0/patch; shutil3123:1301-1313, 1344-1390.

**Checked fact:** CLI names are limited to _NAMED_FILTERS, --filter valid only for extraction, then passed to extractall. Merge and selected-release shutil tar handler forward filter to extractall.

**Conditions/limits:** shutil forwarding depends on selected/registered unpacking format. It does not establish support in every archive handler.

**Defects:** none. Static inspection; no downloaded code execution.

### C12 — SUPPORTED

**Final final.md:11:** Released TestExtractionFilters/ArchiveMaker/check_context contain benign and hostile regression coverage.

**Primary locators:** taroldtest.py:3338-3489; tarfix /files/6/patch lines 506-540, 570-607, 647-652.

**Checked fact:** ArchiveMaker builds in-memory archives; check_context extracts to controlled nested destination and captures exceptions; benign member passes all three filters. Merge patch introduced this harness and benign test; selected release retains them.

**Conditions/limits:** Static review demonstrates expected assertions present, not that tests were executed in this review or by candidate. Harness does not prove importer abort cleanup.

**Defects:** none. Static inspection; no downloaded code execution.

### C13 — OVERSTATED

**Final final.md:11:** Absolute/traversal/symlink tests demonstrate rejection and legacy escape.

**Primary locators:** taroldtest.py:3491-3514, 3517-3653, 3655-3699, 3701-3754; tarfix /files/6/patch lines 654-677.

**Checked fact:** test_absolute expects slash stripping and successful inside-destination extraction on slash-rooted paths; remaining absolute paths raise AbsolutePathError. Parent-link tests assert tar OutsideDestinationError/data LinkOutsideDestinationError where applicable; sly-relative tests assert OutsideDestinationError.

**Conditions/limits:** Assertions depend on host path semantics and symlink availability; WASI skip wrapper at 3391-3401, Windows self-link exception/early return at 3532-3540, and path-resolution split at 3634-3652. Final compressed refusal summary omits these conditions and its later proposed absolute rejection contradicts them.

**Defects:** D02. Static inspection; no downloaded code execution.

### C14 — SUPPORTED_WITH_CONDITION_OMISSION

**Final final.md:11:** Device tests distinguish data rejection from tar/fully_trusted allowance.

**Primary locators:** taroldtest.py:3875-3906; tarfix /files/6/patch lines 879-910.

**Checked fact:** test_pipe checks actual FIFO creation only where os.mkfifo exists; data expects SpecialFileError. test_special_files checks filters on FIFO/CHR/BLK TarInfo without creating device nodes.

**Conditions/limits:** Filter-level allowance is not proof of successful device creation: OS support/privileges govern writes. Tests deliberately avoid device creation. Final does not state these coverage boundaries.

**Defects:** D02. Static inspection; no downloaded code execution.

### C15 — SUPPORTED

**Final final.md:11:** Named-filter unit checks, default warning and extraction_filter override tests exist.

**Primary locators:** taroldtest.py:3908-4008; tarfix /files/6/patch lines 912-977.

**Checked fact:** fully_trusted returns object identity; tar preserves tested name/type; data either raises FilterError or preserves name/type; omitted-filter warning and instance/class/subclass callable overrides plus string TypeError are asserted.

**Conditions/limits:** Tests are finite fixtures and conditional checks; they do not demonstrate a gate fires exactly on all hostile inputs or that data is universally safe. The final separately disclaims universal safety, which is credited.

**Defects:** none. Static inspection; no downloaded code execution.

### C16 — SUPPORTED

**Final final.md:5:** Require explicit data on pinned 3.12.3 tar extraction, keep errorlevel >=1, clean destination on abort.

**Primary locators:** tarold.py:833-837, 2217-2238, 2304-2357; tardocold.rst:490-504, 563-611, 1000-1006, 1093-1097; taroldtest.py:4072-4104.

**Checked fact:** Explicit data selects implemented filter; FilterError/OSError propagate for errorlevel >0; default is 1; partial extraction/cleanup responsibility documented; fresh temporary directory recommended.

**Conditions/limits:** Applicable to tar archive extraction when required tar features are compatible with data policy. errorlevel 1 still ignores nonfatal ExtractError; recommendation only claims FilterError fatal. Cleanup must be caller-controlled and restricted to owned temporary destination. This core amendment is supported.

**Defects:** none. Static inspection; no downloaded code execution.

### C17 — CONDITIONAL_POLICY_OMISSION

**Final final.md:12:** Pass data to shutil.unpack_archive wherever used.

**Primary locators:** tarfix /files/0/patch, /files/3/patch; pep706.html:553-562; shutil3123:1271-1273, 1301-1323, 1344-1390; shutildoc3123:696-699.

**Checked fact:** A non-None filter is forwarded to the selected registered handler; built-in tar handler accepts it; built-in ZIP handler has no filter keyword parameter.

**Conditions/limits:** Correct for tar formats. ZIP rejects the keyword and custom unpackers need compatible signatures. Final does not expressly constrain the amendment to tar handlers. If importer is already tar-only this has no practical defect; its scope was not established.

**Defects:** D04. Static inspection; no downloaded code execution.

### C18 — CONDITIONAL_POLICY_OMISSION

**Final final.md:12:** Optional TarFile.extraction_filter = staticmethod(data_filter) as defense in depth where importer owns TarFile.

**Primary locators:** tardocold.rst:605-611; taroldtest.py:3946-3985; pep706.html:423-427.

**Checked fact:** Class assignment sets global default across all TarFile users; staticmethod prevents self injection. Instance assignment is supported independently.

**Conditions/limits:** Owning one TarFile object is insufficient to own global process policy. Docs restrict best-practice class mutation to top-level applications/site configuration; final should distinguish instance ownership from global authority. Optional caveat, not evidence that a global change actually occurred.

**Defects:** D05. Static inspection; no downloaded code execution.

### C19 — SUPPORTED

**Final final.md:12:** Use a function not a string for extraction_filter; older versions without feature silently ignore string assignment.

**Primary locators:** tarold.py:2227-2232; taroldtest.py:3981-3985; pep706.html:411-415.

**Checked fact:** Runtime rejects string attribute in selected release. PEP explicitly gives old-feature-absent silent-assignment rationale.

**Conditions/limits:** No pre-3.12 runtime inspected/executed. PEP rationale supports feature-absent behavior, not all <3.12 versions, because security backports may have the feature.

**Defects:** none. Static inspection; no downloaded code execution.

### C20 — SUPPORTED

**Final final.md:12:** Explicit tar justified if tar features needed; no fallback on pinned release; shared older code should fail-or-warn.

**Primary locators:** tardocold.rst:972-987, 1118-1158; pep706.html:597-644; tarold.py:821-837.

**Checked fact:** Docs distinguish tar versus data feature policy and show feature detection, fail and warn examples; selected release contains required feature.

**Conditions/limits:** The fail-or-warn rule is a proposed importer choice, not a universal documentation mandate. Capability detection using hasattr is appropriate because features can be backported; version <3.12 alone does not establish absence. Final treats older behavior as out of scope, which is retained.

**Defects:** none. Static inspection; no downloaded code execution.

### C21 — SUPPORTED

**Final final.md:13:** data is not universally safe; prior inspection, DoS limits, partial extraction and caller cleanup required.

**Primary locators:** tardocold.rst:498-504, 581-582, 1003-1006, 1086-1097; pep706.html:487-502.

**Checked fact:** Docs explicitly disclaim protection against DoS and require prior inspection; partial extraction/absence of cleanup documented.

**Conditions/limits:** These are residual limitations and proposed defenses, not evidence that importer quotas or cleanup have been implemented or verified.

**Defects:** none. Static inspection; no downloaded code execution.

### C22 — CONTRADICTED

**Final final.md:13:** errorlevel=0 downgrades refusals to skip-and-continue.

**Primary locators:** tardocold.rst:1076-1080; pep706.html:435-439; tarold.py:2304-2325, 2347-2357, 2260-2270; taroldtest.py:4040-4064; tarfix /files/4/patch lines 377-398, 429-440; /files/6/patch lines 1044-1065.

**Checked fact:** Captured PEP/docs say skip. Released code retains original tarinfo when filter call raises; fatal handler returns at errorlevel=0; tarinfo is then returned and extracted. Released regression explicitly expects file creation after a raising FilterError filter at errorlevel=0.

**Conditions/limits:** Refusal exceptions differ from filter returning None. Subsequent extraction may itself fail depending on OS/filesystem, so do not claim every hostile member always succeeds. The supported statement is that ignored refusal can proceed unfiltered. Candidate chose released code as runtime authority but did not reconcile this direct conflict.

**Defects:** D01. Static inspection; no downloaded code execution.

### C23 — SUPPORTED

**Final final.md:13:** Residual caps/names/extensions/case-shadow/duplicates/live disk limits remain.

**Primary locators:** tardocold.rst:1096-1115; tarold.py:758-770, 802-815.

**Checked fact:** Docs list OS resource limits, character/extension checks, file count/total size/name+link length/individual size limits, case-insensitive shadowing, later duplicate overwrite and attacker changes to live data. Code resolves paths against current disk.

**Conditions/limits:** Final presents these as uncovered limitations. No claim that finite filter tests cover them. This preserves useful negative content without requiring an all-vulnerability audit.

**Defects:** none. Static inspection; no downloaded code execution.

### C24 — WRONG_REJECTION_EXPECTATION

**Final final.md:14:** Propose one five-member regression expecting AbsolutePathError/outside-path/outside-link/special-file errors and tar absolute blocking.

**Primary locators:** tarold.py:755-815; tardocold.rst:1024-1028; taroldtest.py:3491-3514, 3655-3682, 3875-3906.

**Checked fact:** Ordinary slash-absolute name is stripped and may be accepted; AbsolutePathError requires still-absolute name after stripping, e.g. Windows drive path. Relative outside symlink yields LinkOutsideDestinationError, absolute symlink yields AbsoluteLinkError. FIFO data refusal applies to ordinary archive mode.

**Conditions/limits:** No OS/path/linkname fixture specified. Proposed universal absolute rejection and stop rule that all four hostile members must be blocked are incorrect for ordinary POSIX slash-absolute input. tar also strips such names instead of categorically blocking them.

**Defects:** D02. Static inspection; no downloaded code execution.

### C25 — INSUFFICIENT_TEST_DESIGN

**Final final.md:14:** One default-errorlevel archive run should raise four errors while benign passes; tar permits FIFO; omitted filter warns.

**Primary locators:** tarold.py:2260-2270, 2304-2357, 2479-2503; taroldtest.py:3415-3441, 3875-3891, 3937-3944, 4077-4078.

**Checked fact:** extractall propagates first FilterError at default level 1 and stops looping; one invocation cannot expose all later refusal exceptions. Benign member before failure may remain. tar FIFO policy allows type, but creation needs mkfifo; device creation has OS/privilege limits. Omitted filter emits warning with both defaults None.

**Conditions/limits:** Individual extract calls or isolated/reopened subtests could check all cases, but proposal does not specify them; do not assume that missing test structure or claim every possible test harness is impossible. Warning capture and unchanged extraction_filter required.

**Defects:** D03. Static inspection; no downloaded code execution.

### C26 — SELF_REPORT_NOT_INDEPENDENTLY_AUDITABLE

**Final final.md:18:** Executed static reads/greps and metadata extraction; regression and 3.14 re-verification only proposed.

**Primary locators:** frozen final.md:11, 14, 18-20; source_manifest JSON /mode; original_brief.md Sources mode paragraph.

**Checked fact:** Final clearly labels regression not executed and source inspection static; it claims no installs/clones/code execution. Sources themselves are sufficient to evaluate factual assertions independently.

**Conditions/limits:** Candidate operation history/own predecessor are outside authorized review access. Its self-reported actual reads, empty capture directory and exact no-write assertions cannot be audited here. Reviewer actually performed static checks, bounded public captures, and artifact validation only.

**Defects:** none. Static inspection; no downloaded code execution.

### C27 — SUPPORTED

**Final final.md:19:** Full frozen source identities and selected-release authority retained; uncertainties and optional leads listed.

**Primary locators:** frozen final.md:19-34; source_manifest JSON /sources/0..6; tarissue JSON /body; tarfix /files/4/patch lines 119-125; tarold.py:806-812.

**Checked fact:** All seven cited identities/hashes match mapped byte captures. Issue body supplies named follow-ups/unofficial backport. Final retains uncertainty about unexhausted patch drift and older behavior, and declines other CVEs and exhaustive shutil trace. Concrete symlink-joining drift is visible in merge versus release.

**Conditions/limits:** No predecessor read or comparison; cannot establish losses/additions relative to predecessor. Existing final contains traceable exact tokens, optional content and meaningful caveats. Optional non-exploration is appropriate for bounded tar extraction decision, but claimed shutil policy must still carry handler conditions.

**Defects:** none. Static inspection; no downloaded code execution.

## Issue → implementation → regression → selected release

- **issue:** tarissue /body identifies PEP 706 and PR 102953; tracking record separately dated.
- **merge:** tarpr /merged, /merged_at, /merge_commit_sha tied to tarfix /sha and actual tarfile/test patches.
- **implementation_fix:** tarfix /files/4/patch lines 72-87 adds realpath/commonpath outside gate and 377-440 integrates filter/error paths.
- **regression:** tarfix /files/6/patch adds ArchiveMaker, TestExtractionFilters, absolute and errorlevel tests; released taroldtest lines 3338-4110 contain corresponding tests with runtime/platform conditions.
- **selected_release:** tarold v3.12.3 contains public filter dispatch, shared gate, released link semantics and actual errorlevel behavior. Direct code/test inspection governs over conflicting PEP/docs.
- **boundary:** 3.12.3 default remains fully_trusted for both None; additional v3.14.0 default branch confirms data. No claim of exhaustive patch lineage, all CVEs, or importer implementation.

## Primary source identities

All required identities are copied from the authorized map and verified against actual bytes. Additional captures are under `sources/` with URL/version/hash/HTTP/capture limitations in `sources/manifest.json`.

- **pep706** — [PEP 706 captured 2026-10-07; released code takes precedence for runtime behavior](https://peps.python.org/pep-0706/); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/pep706.html`; SHA-256 `6139a435b458b6091ea2bfebd2b1ba9a163633e62f55b33720870d558e01b71e`.
- **tarissue** — [CPython issue 102950 captured 2026-10-07](https://api.github.com/repos/python/cpython/issues/102950); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarissue.json`; SHA-256 `9ba5b6f74ea5ac74bfd12cc13f9fa3610fcae050617003563732e0fda4ee7a84`.
- **tarpr** — [CPython PR 102953 captured 2026-10-07; merge SHA recorded in source](https://api.github.com/repos/python/cpython/pulls/102953); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarpr.json`; SHA-256 `63cb304e277da293006a1f650612d5a1b21fbccb7456dd9e734cf2c5d6fbe8e2`.
- **tarold** — [CPython 3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/tarfile.py); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarold.py`; SHA-256 `5dd00cc68e88d9581551b1a457398c5b63d87ae1152fa03ef298743485d12cc8`.
- **tardocold** — [CPython 3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/tarfile.rst); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tardocold.rst`; SHA-256 `242eb30a709c00b4b16d173f3573b6e893e05b0c49d59618d5dc547bd60e7b99`.
- **taroldtest** — [CPython 3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/test/test_tarfile.py); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/taroldtest.py`; SHA-256 `134c5c8703e23f6dc16feaaa0d2cb77c93275f3360dd45e1b6c622d864113239`.
- **tarfix** — [CPython PEP 706 implementation merge commit af530469954e8ad49f1e071ef31c844b9bfda414; includes actual changed file metadata/patches](https://api.github.com/repos/python/cpython/commits/af530469954e8ad49f1e071ef31c844b9bfda414); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M13-A/inputs/sources/tarfix.json`; SHA-256 `789a86915c7035d138415e1f9c5e5552745730fb078a1a58615077f7e5a6939f`.
- **shutil3123** — [CPython v3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Lib/shutil.py); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M13-A/control-v2/sources/shutil-v3.12.3.py`; SHA-256 `819e518cb7a539d09b2526138015541b34d2646afb9c2f6ae4ffd476d6a0fcf4`.
- **shutildoc3123** — [CPython v3.12.3](https://raw.githubusercontent.com/python/cpython/v3.12.3/Doc/library/shutil.rst); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M13-A/control-v2/sources/shutil-v3.12.3.rst`; SHA-256 `51c991b2a28b8cc00de14b6cb71dcfbe64c78f28a8a24b5af7b43e0eb74bff67`.
- **tar3140** — [CPython v3.14.0](https://raw.githubusercontent.com/python/cpython/v3.14.0/Lib/tarfile.py); path `/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M13-A/control-v2/sources/tarfile-v3.14.0.py`; SHA-256 `07e226f1b76043516d16c7185baf6ab3d37aac915373a0194b773dab0bf2330d`.

## Checks, extent and uncertainties

- No downloaded/project code executed, no runtime tests run. Static code and regression expectations are independently inspected facts.
- Candidate check history and claims about stage writes/captures cannot be validated from authorized sources; no fabricated operational proof.
- Predecessor provenance/preservation comparison unavailable, explicitly outside access scope.
- No all-vulnerability or all-release audit; conditional omissions labeled as such, not assumed practical failures in a tar-only importer.

All six axes, all six obligations, and 27 material claim groups were assessed. **Unassessed substantive remainder: none.** Unavailable predecessor comparison and candidate historical operation verification are explicit access limitations, not hidden factual assumptions. Runtime testing was not part of this allowed static review.

Reviewer actually performed hash validation, JSON field/actual patch inspection, released code/doc/test caller tracing, and three bounded public primary source captures. The candidate proposed regression was not executed by this reviewer. No tool/source success is presented as a runtime test pass. Timing and actual operations are recorded in `timings.json`; usage input/cache/generated/billing is unknown (`null`), with native counters separately `null`.

Review completed 2026-10-07T19:56:21.451742+00:00; absolute deadline 2026-10-07T19:52:13.923989+00:00. No pending children.
