# D-M05-A independent PRIMARY-SOURCE review

All six declared obligations were assessed for **each** frozen output. `complete_scope_assessed=true` for Output1 and Output2. **source_quality=FAIL for both** because of material incorrect retained behavior and incorrect proposed rejection assertions. Each remains useful as a source map and partial recommendation, but neither is a reliable complete recommendation without correcting those assertions. No candidate was edited, rescued or reissued. No economic ranking, target grade or winner was used.

## Authority, evidence and limits

I read the actual global rules at `/home/sittingmongoose/.codex/AGENTS.md` and project rules at `/home/sittingmongoose/.t3/worktrees/PuppetMaster/t3-ce3f519f/AGENTS.md`. The T3 rules supersede the mailbox/extra-worker sections. This external diagnostic review involved no repository/canon changes, children, installs, account actions or external-service writes.

I read only the exact INPUT_MAP, mapped brief/changes/common untrusted prior-state, the four mapped primary files, and the neutral frozen final.md/sources.json for each output. Embedded arm paths and prior-manifest references were not additional read authority. Neither candidate's terminal or working directory was inspected. Candidate operation lists are self-reports; source truth was determined from actual implementation and documentation.

The frozen hashes all match. Primary IDs resolve to these exact local bytes and upstream release identities:

- [tarold — CPython 3.12.3 Lib/tarfile.py](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M05-A/inputs/sources/tarold.py): SHA-256 `5dd00cc68e88d9581551b1a457398c5b63d87ae1152fa03ef298743485d12cc8`.
- [tardocold — CPython 3.12.3 Doc/library/tarfile.rst](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M05-A/inputs/sources/tardocold.rst): SHA-256 `242eb30a709c00b4b16d173f3573b6e893e05b0c49d59618d5dc547bd60e7b99`.
- [tarnew — CPython 3.14.0 Lib/tarfile.py](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M05-A/inputs/sources/tarnew.py): SHA-256 `07e226f1b76043516d16c7185baf6ab3d37aac915373a0194b773dab0bf2330d`.
- [tardocnew — CPython 3.14.0 Doc/library/tarfile.rst](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M05-A/inputs/sources/tardocnew.rst): SHA-256 `901ab69790214a595355d7e29a4b11a68fdfa8c45032dd3bd84822de01280d9f`.

The source registry in [REVIEW.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M05-A/REVIEW.json) records full upstream URLs, exact paths, releases, capture metadata, input/output hashes and per-claim locators. Hashes establish identity, not behavioral correctness. The prior state's hash is `48ca796fd27d4898a030f430d68a5a5975da63b1d911835a5af502c4a837dca8`; its F4 assertion is not accepted merely because it was preserved.

Reviewer execution used the **exact mapped tarfile modules on the existing Linux CPython 3.14.4 host**, with bytecode disabled and all fixtures inside this review directory. It did not run complete CPython 3.12.3 and 3.14.0 interpreter installations. The decisive exception-flow and class differences are visible in the frozen implementation independently of that execution.

## Output1: full obligation assessment

1. **O1, identities — satisfied.** R1 and its manifest retain the source IDs, exact tags/hashes and original dependency family, including extraction_filter, named filters, errorlevel/handlers, path primitives, TarInfo predicates/replace, inspection APIs and numeric_owner. D-06 below concerns inaccurate individual line anchors, not substituted source identity.
2. **O2, rename — satisfied.** R2 separately disposes of the UI-only rename, consistent with changes.json. It attributes semantic invalidation to the runtime change.
3. **O3, exact defaults/API — partial.** R3 correctly identifies old warning plus fully_trusted versus new silent data. R4/R7 incorrectly retain the complete error/refusal taxonomy and contract; D-01/D-02 are material.
4. **O4, security/compatibility — partial.** R5 correctly preserves inspection/DoS/caller-limit obligations and adds the symlink-disallow hint. R4 carries the normalization meaning caveat. R6 updates older-runtime guidance, but broad cross-release parity in the final optional advice is false (D-04).
5. **O5, unresolved dependencies — satisfied.** U1-U6 stay open; U5 is narrowed without closing fleet support. Already-covered expressly means source-specified, not implemented/tested/adequate.
6. **O6, dispositions/checks — partial.** Retained/changed/unresolved categories and proposed/performed separation are delivered. F4's retained disposition is wrong, and proposed check 2 wrongly expects rejection of sanitized Linux paths and regular-file modes (D-03).

**Final preservation:** F1 is correctly changed for 3.14.0 and retained historically for 3.12.3; F2's ladder and F5's configuration mechanics are retained correctly. F3's common branches persist with real deltas. F6's incomplete safeguards and F7's capability/inspection primitives remain supported. F4 cannot remain an unchanged complete contract. All U1-U6 remain unresolved.

## Output2: full obligation assessment

1. **O1, identities — satisfied.** R2-R7 and its manifest preserve the exact old/new primary identities and dependency family. The source bytes independently match.
2. **O2, rename — satisfied.** R1 separately identifies the name-only change and limits invalidation to the runtime change.
3. **O3, exact defaults/API — partial.** R2 correctly distinguishes the effective None/None default from the unchanged stored None attribute. R4's affirmative retention of prior F4 is wrong; its whole-taxonomy disposition misses the new public exception and fallback conditions (D-01/D-02).
4. **O4, security/compatibility — partial.** R6 correctly retains caller safeguards and R7 preserves detection/inspection mechanics. R3 incorrectly characterizes normalization as only tightening within unchanged guarantees and omits the known symlink-meaning condition (D-05).
5. **O5, unresolved dependencies — satisfied.** All U1-U6 are explicitly open, including narrowed U5. Their nonimplementation/nonverification meanings are preserved.
6. **O6, dispositions/checks — partial.** All disposition categories and proposed-only test status are present. The retained F4 conclusion and P1's Linux AbsolutePathError expectation are incorrect.

**Final preservation:** F1, F2, configuration mechanics F5, incomplete caller safeguards F6, and capability/inspection primitives F7 are supported within their conditions. F3 needs its actual normalization caveat. F4 is incorrectly retained wholesale. No U-item has been falsely closed.

## Material defects and primary evidence

**D-01 — both outputs: security-relevant false retention of errorlevel behavior.** Output1 final lines 19-21/29 and Output2 lines 22-24/40 retain prior F4. In tarold 2304-2325, tarinfo begins as the original member. If filter_function raises, assignment does not finish; errorlevel=0 suppresses the fatal error and the original member is returned for extraction (2260-2270). In tarnew 2481-2509, filtered begins as None; a suppressed refusal instead returns an excluded pair, which extractall skips (2408-2420). The handler bodies themselves remain unchanged (old 2340-2357; new 2531-2548). Old documentation 1076-1080 says skip, but the selected old implementation does not do that in this path.

The bounded explicit-data FIFO check confirms old errorlevel=0 creates the refused FIFO and new errorlevel=0 skips it. At levels 1/2, both raise SpecialFileError. This materially changes the security/compatibility basis for U2; acknowledging a limited comparison method does not repair an affirmative unchanged-contract claim.

**D-02 — both outputs: new public fallback behavior missing or misclassified.** tarnew 769-779 adds LinkFallbackError; tardocnew 286-293 explicitly documents it as added in 3.14. tarold 2505-2528 copies a link's referenced archive member without re-filtering. New extractall passes filter_function through the extraction path (2408-2420, 2511-2528), and 2731-2754 re-filters that referenced member and wraps a rejection.

The bounded selected-member fixture uses a hardlink to an earlier archived FIFO that is absent on disk. Old extractall creates a FIFO at the link path; new extractall raises LinkFallbackError with SpecialFileError as its cause. The exact new extract() path does not pass filter_function at 2475-2479, and still creates the FIFO in this fixture. Application to the new omitted default follows from its resolution to the same data_filter; the extraction witness used explicit data.

Output1's explicit unchanged-taxonomy claim is false. Output2's statement that the old five remain is narrowly true; its **whole-taxonomy retained disposition** is a material omission, not proof it denied the continued existence of those five. An unqualified fail-closed description across extraction APIs needs these conditions.

**D-03 — both outputs: proposed tests incorrectly reject supported Linux behavior.** Output1 check 2 (line 36) and Output2 P1 (line 48) expect an ordinary absolute-path member to raise. Both filters first strip leading Linux slashes and reject only paths still absolute afterward (old 759-770; new 785-797; docs new 1090-1097). Output1 also expects a setuid regular file to raise; the source instead clears high mode bits (old 771-789; new 799-818).

Direct checks accept /safe_absolute_regular as safe_absolute_regular and mode 0o4755 as 0o755 in both files. Absolute links, escaping targets and FIFOs are separate rejecting cases. These defects concern **proposed expected results**, not failed tests supposedly performed by the candidates. One aborting archive also cannot expose every member's separate exception; isolation is a useful test-design improvement.

**D-04 — Output1: materially overbroad compatibility equivalence.** Final line 46 says explicit data makes the releases behave identically. Selecting the same named policy does not erase versioned implementation changes. Linkname a/../b is retained in old data_filter and becomes b in new data_filter (old 803-815; new 830-846; new docs 1108-1112). The suppressed-refusal difference in D-01 also remains with explicit data. On the existing host, a symlink-loop path is accepted by the old filter and raises ELOOP in the new filter. A narrowly selected simple refusal corpus can match; the proposed P5 is not rejected merely for comparing that bounded corpus. The blanket final parity claim is the defect.

**D-05 — Output2: unsupported tightening claim and missing governing condition.** R3, line 20, places normalization inside unchanged guarantees and labels it tightening. New docs 1108-1112 warn that resolving links through symlinks can change their meaning. New code 833-835 records a normalized target, but 836-846 checks the **original** member.linkname.

A bounded direct-filter topology makes this consequential: destination/a points to x/y, destination/x/b is internal, and destination/b points to a sibling directory outside the extraction destination but inside reviewer scratch. Both accept a/../b. Old output keeps its effective destination/x/b target; new output becomes b, whose effective target is outside. No archive was extracted in this supplemental check. This supports rejecting a monotonic-tightening characterization, not a universal exploit assertion. Generic unprobed-symlink uncertainty does not preserve a known source caveat.

**D-06 — Output1, nonmaterial locator defect.** R4's individual realpath line anchors are wrong: actual old sites are 758, 768, 813; actual new sites start at 784, 794, 843. New normpath is 833-835. The full function ranges and substantive mechanics claim are otherwise verifiable. This minor issue does not independently decide source_quality.

## Useful discoveries, proposed checks and actual work

Both outputs correctly establish the core default migration (tarold 2217-2226; tarnew 2370-2374), retain the named ladder (old 818-837; new 849-868), and preserve config typing/global-staticmethod guidance (old docs 584-611; new 637-666). Both correctly retain the incomplete inspection/limit/cleanup obligations (old docs 1083-1115; new 1167-1198), capability detection/backport guidance (old 1118-1153; new 1204-1241), and numeric_owner/inspection primitives (old docs 435-488; new 485-536). The remaining new TarInfo.tarfile warnings at 939-955 are unrelated to the extraction default.

Output1 additionally carries the new symlink-disallow hint and notices directory refiltering. Output2 clearly identifies the old early-opt-in rationale becoming moot. These are useful bounded discoveries. Neither output critically resolves the old documentation/implementation mismatch or carries the new fallback class.

Each of all six proposed checks was assessed individually in REVIEW.json. Default resolution, config string rejection, basic normalization observation and caller-limit proposals are supported. Output1's broad equality advice is not established by a small corpus. Output2's P2 can be valid for its simple corpus at the normal errorlevel=1 after P1 is corrected; it is not treated as a blanket parity claim. Its 3.14 initial-refusal matrix is valid, although a nonfatal ExtractError case is needed to distinguish levels 1 and 2.

An additional optional regression lead is directory fixup: new 2426-2455 re-runs the filter, catches _FILTER_ERRORS for fixup, checks lstat, and may skip metadata application. The reviewer custom-filter fixture runs once in old and twice in new; a fixup refusal is skipped even with errorlevel=2. This is a useful bounded callback/fixup check, not a demand for an exhaustive inventory of unrelated library changes.

**Candidates actually performed:** according to both frozen deliverables, static reads/comparisons and hash checks only. Neither claims a live regression run. Their terminals were not read, so this activity is not independently attested. The review does not turn reviewer checks into candidate test credit and does not penalize the legitimate proposed-only status.

**Reviewer actually performed:** independent input hashes, primary body/caller/docs inspection, the bounded module matrix, and the supplemental normalization topology check. Evidence:

- [reviewer_checks.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M05-A/reviewer_checks.json), SHA-256 `2e3334ba3533d98c972b1fbd645a6a072bbc1e2b3c6716760347d66c0dbbfb55`; reproducible [reviewer_checks.py](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M05-A/reviewer_checks.py), SHA-256 `c58b2970c801ffd915e3583d734aa9744e9e5f7da46d33383da1c06de568ddd4`.
- [reviewer_link_normalization.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M05-A/reviewer_link_normalization.json), SHA-256 `60ae01d5e24e00734bc8c54a3209f212fb42650f61e1b8e2a976ccd766b0eaa3`; reproducible [reviewer_link_normalization.py](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort2/D-M05-A/reviewer_link_normalization.py), SHA-256 `d47531722333cbd9f3d2e987b499778e216b08e4870d14819191a2491a72cf8f`.

All temporary fixture directories were removed. Only requested review/receipt files and reproducible evidence remain.

## Unassessed remainder, blinding and timing

No declared obligation remains unassessed. Full exact-release interpreter runs, the entire versioned os.path implementation, all filesystem races/archive edges, and product-specific U1-U5 values remain unverified or unknown. U6 stays open. This is a full assessment of the declared bounded module, not an exhaustive unknown-answer recall claim. Supported uncertainty is legitimate; the FAIL decisions arise from affirmative material errors and omissions.

Blinding is limited: neutral copies contain control/treatment headers, method descriptions and arm/output paths. Those reveal method identity. I did not follow those paths, read other grades/economics/targets/campaign state or use a purported expected outcome.

Review began at **2026-10-07 18:55:26 UTC**, with a 900-second bound. Actual authoring and terminal elapsed times are recorded in REVIEW.json and review_receipt_summary.json. Actual native Goal creation/active-get receipts were saved first; completion and a fresh terminal get are saved after the authored review. Their exact artifact paths are indexed in REVIEW.json.

