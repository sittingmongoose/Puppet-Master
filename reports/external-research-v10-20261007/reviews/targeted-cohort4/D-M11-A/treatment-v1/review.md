# Independent frozen-source review

**FAIL — full declared-scope static review; SourcePASS: false.** The frozen final's SHA-256 is `ffcfa6e55b0ffb782642d8c3c284dccac70bb9fc89eb55b8a46b3524cee32129`, verified before assessment. All eight required source hashes match. The final is 808 whitespace-delimited words, within the brief's soft ceiling; six findings address every requested topic structurally.

The released default, issue/PR lineage, direct filter rules and selected-member error handling are substantially correct. Four material defects prevent PASS. No downloaded code or tests were executed. All 25 consequential claim groups are individually checked in review.json; source IDs resolve to exact URLs, versions, paths and full capture hashes there.

## Six axes

| Axis | Disposition | Reason |
|---|---|---|
| 1. all required brief obligations | FAIL | All six obligations are addressed structurally; API fallback, Linux path expectations, capability-bound compatibility, and resource-bounded inspection remain defective. |
| 2. consequential claims and full governing release/default/type/path conditions | FAIL | Released default and direct filter mechanics largely correct; full API/path/platform conditions are not preserved. See 25 independent claim checks. |
| 3. bounded useful discovery/negative/optional yield | PARTIAL | Useful bounded negative findings and optional wrapper/helper extension retained. No new capture was necessary. Proposed inspection lacks memory/CPU bounds. |
| 4. wrong rejection/correction or unjustified universal abstention | FAIL | Backport-aware capability is replaced by an unsupported categorical version exclusion. Linux rejection oracle is wrong. No universal abstention: a concrete ingest policy is offered. Overcorrection of the old warning is treated as a wording qualification, not a forced additional defect. |
| 5. preservation/traceability/retained uncertainties and optional content within final | PARTIAL | Source IDs, hashes and code locators allow traceability; wrapper/WASI/Windows uncertainties and optional content retained. Older-runtime uncertainty conflicts with no-support assertion; link normalization and API fallback conditions are omitted. Predecessor comparison unavailable and not performed. |
| 6. proposed versus actually executed checks | PARTIAL | Execution separation PASS: final expressly reports zero executed tests and labels regressions proposed. Proposed-check correctness/conditions FAIL: Linux path oracle and missing API/version distinctions. Author execution history cannot be independently audited under the read restriction. |

## Obligation coverage

1. **PASS_WITH_LIMITS: Identify the old concern, implementation/fix lineage, and released default relevant to 3.14.0.** Correct old concern, PEP/issue/PR/default-change lineage and3.14.0 default.3.13 runtime statement supported by PEP/issue, not supplied released3.13 bytes. Evidence: C03, C04, C05.

2. **PARTIAL: Bind omitted versus explicit filter and errorlevel behavior.** Correct selected-member3.14 omitted/explicit filter and errorlevel rules, but filter propagation/fallback differs between extract and extractall; older level0 semantics also differ. Evidence: C06, C07, C08, C17, C23; D1.

3. **FAIL: Separate file/link/path domains and destination assumptions.** Path/type/link rules mostly described but Linux path tests conflict, fallback selected type not covered, and tar filesystem outcomes need conditions. Evidence: C09, C10, C11, C12, C13, C14, C22; D1, D2.

4. **PARTIAL: State residual security and resource-exhaustion limits.** Residual DoS, quotas, mutable destination, timestamps, and cleanup retained. getmembers inspection itself lacks memory/CPU/time bounds. Evidence: C15, C16, C17, C18; D1, D4.

5. **PARTIAL: Avoid projecting an older issue onto every current code path.** Correctly distinguishes old full-trust defaults from3.14 data, but overbroad warning wording and omitted single-extract path prevent full non-projection. Evidence: C02, C19; D1.

6. **FAIL: Propose version-discriminating regression checks and conditional compatibility policy.** Concrete proposed checks and explicit data/errorlevel policy exist; Linux oracle and categorical older-version exclusion are defective. Security-relevant release deltas deserve explicit API/version tests. Evidence: C20, C21, C22, C23, C24; D1, D2, D3.

## Material defects

**D1 (high): Single-member extract does not propagate the filter to link fallback in the supplied 3.14.0 implementation.** Frozen-final lines 8, 19, 21, 23, 25.

extract calls _extract_one without filter_function; its default is None. If a hardlink's filesystem target does not exist, makelink_with_filter resolves an earlier archive member and, with filter_function=None, extracts that member without filtering. extractall passes filter_function and wraps fallback refusal in LinkFallbackError.

Conditions: Linux, fresh caller-controlled destination, archive contains FIFO member target before hardlink safe -> target; call extract('safe', filter='data', errorlevel=1). The link itself passes data_filter; missing destination target selects archive fallback, whose FIFO type is not re-filtered. os.mkfifo support permits creation at safe. This is a static source inference, not a runtime reproduction.

Materiality: The final authorizes both extract and extractall and presents explicit data as a uniform untrusted-call policy. Direct data_filter special-file refusal is true, but does not cover this single-member fallback path. Empty destination and errorlevel>=1 do not fix absent filtering.

Primary evidence: tarnew:2461-2479; tarnew:2511-2525; tarnew:2604-2621; tarnew:2706-2754; tarnew:2881-2915; tarnew:2939-2955. Correction needed: Bind the recommendation to the actual API, exclude or separately constrain links and fallback for single-member extract, and propose paired extract/extractall fallback regressions. Do not project this finding onto extractall.

**D2 (medium): The proposed rejection of /abs and C:/ under data is wrong for the declared Linux domain; 'allowed under tar' also needs filter-versus-operation qualification.** Frozen-final lines 19, 25, 29, 30.

Leading / is stripped before the absolute-path test, so an ordinary /abs member becomes abs inside the destination. C:/foo is the code/documentation's Windows example, not a Linux absolute path. tar leaves link targets and special types unrestricted by its filter, but missing hardlink targets may raise KeyError, later writes through escaping links are rejected, and device creation depends on platform and permissions.

Conditions: Linux POSIX path semantics, otherwise ordinary regular member, empty controlled destination. Traversal ../ that actually escapes is refused; internal .. that resolves inside is not universally refused. Member.name and linkname have different absolute-path handling.

Materiality: A conforming implementation would fail the proposed /abs test. Ungated C:/ assertions mix platform domains despite Windows being declared unverified. The link/device tests must assert filter permission separately from successful filesystem extraction.

Primary evidence: tarnew:785-797; tardocnew:1090-1097; tartest:3714-3737; tartest:3952-3996; tarnew:2677-2701; tarnew:2725-2738. Correction needed: Expect /abs -> abs on Linux, gate drive-path refusal to Windows, test actual outside-destination traversal, and bind tar link/device outcomes to existence/capability/privilege and later-member conditions.

**D3 (medium): The categorical '<3.12 has no filter support' rationale contradicts the supplied primary documentation's backport-aware contract.** Frozen-final lines 11, 25, 30.

The released 3.14.0 docs explicitly say extraction filters may be backported and recommend hasattr(tarfile, 'data_filter') rather than Python-version testing. PEP 706 also describes the backport exception and capability check.

Conditions: Specific older runtime bytes are not supplied, so the presence, security fixes, and defaults of any particular older build remain unverified. This review does not certify an older version. An independently chosen minimum supported release is legitimate; the asserted absence of capability below 3.12 is not.

Materiality: The policy can wrongly reject a feature-equipped older build and is not the requested conditional compatibility policy. The final itself retains <3.12 as unverified while stating its lack of support as fact.

Primary evidence: tardocnew:1201-1207; tardocnew:1225-1232; pep706:597-608. Correction needed: Separate minimum-version support policy from capability. Fail closed when required filter capability or validated patch behavior is absent; do not infer absence solely from sys.version_info.

**D4 (medium): The recommended getmembers pre-scan loads the archive before count limits can be applied, without specifying memory/CPU bounds.** Frozen-final lines 21, 31.

getmembers invokes _load, which consumes all readable members and normally caches them. Primary docs recommend external disk, memory, and CPU limits, alongside count and size checks. data_filter has no resource limits.

Conditions: Untrusted archives can contain very many headers or expensive compressed input; a post-getmembers count/size decision protects later writes but does not bound the scan. A separately established process memory/CPU/time budget could make the proposal bounded, but the final only specifies OS disk/quota limits.

Materiality: The final correctly states residual denial-of-service risk, yet its proposed inspection can exhaust resources before its own caps run.

Primary evidence: tarnew:2126-2134; tarnew:2870-2874; tarnew:2921-2928; tardocnew:1167-1187; pep706:238-249. Correction needed: Apply external memory/CPU/time and input limits to inspection as well as extraction, or use an incrementally bounded scan; retain disk quotas and cleanup.

## Source-check extent and retained qualifications

The complete claim-by-claim register C01–C25 in review.json covers every consequential final assertion, the six proposed-test groups, policy recommendations, negative findings and optional yield. Locators are one-based raw captured-file lines or JSON pointers, not citation-list proxies. All required primary sources were inspected; the relevant released functions and conditional branches were read independently. This was a full assessment of the declared claims, not a whole-repository audit. No declared-scope material claim group remains unassessed.

Verified positives include `tarnew:2370–2386` (3.14.0 default/explicit dispatch), `tarold:2217–2226` (3.12.3 warning/full trust), `tartest:741–757` (default mock assertion), issue102950 `/body,/closed_at`, PR102953 `/merged_at,/merge_commit_sha`, issue121999 `/title,/body,/closed_at`, and PEP706 raw lines99,170–201,418–421,663–664. The PR merge SHA is `af530469954e8ad49f1e071ef31c844b9bfda414`.

Selected-member3.14 refusal skipping and errorlevel thresholds are checked at `tarnew:2494–2503,2531–2548` and `tartest:4502–4571`; non-handled exceptions still propagate. In supplied3.12.3, ignored filter exceptions retain original metadata (`tarold:2311–2325`), so “level0 skips” is not a uniform older-release oracle. The final also omits3.14 link-target normalization (`tarnew:833–835`; `tardocnew:1108–1112,1145–1147`) and corresponding test4156–4176. These reinforce the need for explicit API/patch behavior tests.

The old full-trust mechanism should not be projected onto3.14 data, but current prior-inspection warnings remain for all filters (`tardocnew:545–552,1018–1022,1167–1170`). The final's “applies only” wording may mean the narrower old mechanism; no separate decisive defect is forced from that ambiguity. Directory re-filter refusal is logged/skipped, while metadata-setting errors can still raise at errorlevel>1 (`tarnew:2426–2455`). Ownership clearing does not clear mtime (`tarnew:819–828,2800–2810`).

## Limits and check provenance

D1 is a source-derived static inference, not a runtime reproduction or a claim that every3.14 extraction path is vulnerable. Specific3.13 and<3.12 released implementation bytes are unavailable; PEP/docs support transition/backport conditions without certifying particular builds. Wrapper/WASI/Windows uncertainties and the optional wrapper/helper follow-up are legitimately retained. Predecessor comparison and author execution/read history are unavailable; the final's zero-executed-tests statement is a self-report, clearly separated from proposed tests.

Only the original brief/map/manifest/listed source bytes and the exact frozen final were used, plus this review's own artifacts for validation. No other arm/case/review, campaign/helper, candidate history, evaluator answer corpus, cost or winning-arm judgment was accessed. Method/arm labels remain visible in paths/content; the advisory scope map is not a filesystem firewall, so complete method blinding is unavailable. No new public capture, software installation, downloaded-code execution, delegation, canon change, account change or third-party write occurred.

Actual source operations, time observations and native usage are in timings.json. Actual active and terminal Goal responses are preserved without invented state in native_activation.json and native_terminal_receipt.json.

