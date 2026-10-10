# ER12 B-FINAL-M-01 treatment — independent bounded FINAL review

**Source judgment: FAIL.** Two material errors remain in the complete final section: its exact `Retry-After` scheduling rule and its claim that `--fail-with-body` extends HTTP retry eligibility. Both are contradicted by curl 8.10.1's implementation. The six critique directions are correct, and most original obligations are preserved; agreement with the critiques does not establish the resulting section's source correctness.

This assessment grades only Track B's assigned criticism-adjudication/finalization role. It is not a whole-pipeline qualification, paired-arm comparison, speed claim or ER11 rescore. No candidate feedback or repair was provided.

## Assigned artifact and review coverage

The complete [final-section.md](ER12_RUNTIME/runs/B-FINAL-M-01/treatment/stages/role/final-section.md) was inspected, together with the full rubric, mapped common assignment, fixture, all three corpus members, role assignment/input map/input freeze, candidate source map, all eight saved source members, and available assigned-arm protocol records. Independent HTTPS retrieval obtained the two listed primary pages and eight additional target-version documentation/implementation documents. All ten retrievals returned HTTP 200. The six candidate tag-exact documentation files match the independently retrieved bytes.

The section has 481 whitespace-separated words including its heading and the complete deliverable has 794. Both the 400–650-word section requirement and the below-1100-word deliverable requirement are satisfied. All six numbered dispositions and remaining uncertainty are present. The final is delivered and assessable; it is not missing or ungraded.

All assigned axes were reviewed: exact obligations and negative constraints; factual source applicability, versions, operations, units and exceptions; every critique; supported draft/product scope; useful alternatives and pertinent implementation/history; and proposed versus executed checks. The findings below are semantic judgments, not hash/count judgments.

## F1 — material: Retry-After is described as unconditional override

**Exact candidate locator:** final-section.md line 7:

> The server's `Retry-After:` response header, honored since curl 7.66.0 and present in 8.10.1, overrides the computed delay for the next retry.

The candidate also asks for “`Retry-After` override behavior against a stub server” at line 15, and its source map `/claim_map/2/conditions_exceptions` says that the server header overrides the per-attempt delay.

**Governing primary evidence:** curl tag `curl-8_10_1`, [`src/tool_operate.c` lines 634–655](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L634-L655), [independently saved complete source](primary/tool_operate.c). The calculation starts with the existing backoff. For an eligible transient HTTP retry it obtains a parsed header delay, and increases the sleep only when the header's seconds converted to milliseconds exceed that existing sleep. It also exits the retry path when elapsed retry time plus the requested header delay exceeds `retry-max-time`. [The target libcurl documentation](primary/CURLINFO_RETRY_AFTER.md) specifies seconds and a zero value for absent/unparseable headers, including conversion of date-form headers.

Thus the header cannot shorten exponential backoff. A source-derived counterexample is a computed second-retry wait of two seconds with `Retry-After: 1`: the wait remains two seconds. With `--retry-max-time 45` and `Retry-After: 60` on an eligible HTTP failure, retries are abandoned rather than a header-directed next attempt being scheduled. These are static source traces, **not executed runtime tests**.

This is material to O3's required scheduling policy and to the proposed timing oracle. The source's statement that curl honors the header does not support unconditional replacement. Support since 7.66.0 is correctly preserved, so critique 6 remains properly rejected. The error is the consequential scheduling detail, not the existence or age of the feature.

## F2 — material: failure reporting is conflated with retry eligibility

**Exact candidate locator:** final-section.md line 9:

> Combined with `--retry`, failure semantics extend retries to HTTP error statuses; without this option the draft's claim that every unsuccessful status already fails is wrong.

Line 5 says that 404 is not retried by `--retry` “alone.” The source map `/claim_map/5/conditions_exceptions` adds that HTTP errors “fail/retry” with `--fail`. Together these imply that adding the failure option extends the HTTP retry policy.

**Governing primary evidence:** curl tag `curl-8_10_1`, [`src/tool_operate.c` lines 491–501](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L491-L501) and [lines 568–620](https://github.com/curl/curl/blob/curl-8_10_1/src/tool_operate.c#L568-L620), [saved source](primary/tool_operate.c). Failure reporting converts a fully received HTTP 400+ response to error 22 with `fail-with-body`. Retry classification then runs the **same** HTTP status switch for a successful transfer result without the failure option and for error 22 with it. That switch permits 408, 429, 500, 502, 503 and 504. The separate all-error fallback is controlled by `retry_all_errors`, which this final explicitly leaves disabled.

A normally received 404 under `--retry 3 --fail-with-body` therefore reports error 22 and is terminal; a 503 is retry-eligible even without `--fail-with-body`. Adding the option does not extend the status set. This is source-derived, not an observed service run.

The candidate correctly corrects default HTTP failure reporting and chooses a supported body-preserving option. However, it adds an unsupported consequential account of retry behavior. The misleading broad sentence near the end of the target [`retry-all-errors` documentation](primary/retry-all-errors.md) occurs under that option; surrounding context and the implementation resolve the actual selected command's behavior. Merely obtaining the version-exact prose does not settle this interaction.

## Exact original obligations

- **O1 satisfied:** complete section with the required title, curl 8.10.1, one read-only HTTPS GET (lines 1–3).
- **O2 satisfied:** `request_deadline_seconds=45`, `max_attempts=4`, `retry_scope=read_only_get` are preserved. `--retry 3` correctly permits one initial attempt plus three retries (lines 3–5).
- **O3 has material errors:** transient HTTP codes and exponential backoff are correct for the pinned version; no mutation expansion occurs. F1/F2 leave the exact header and failure/retry interactions incorrect (lines 5–9).
- **O4 satisfied:** `--max-time` is per attempt, `--retry-max-time` is a separate retry bound, and a supervisor must enforce the absolute product deadline. No strict guarantee is claimed from curl flags alone (line 11; target [max-time](primary/max-time.md), [retry-max-time](primary/retry-max-time.md)). Termination and reaping are proposed implementation behavior, not evidence that a supervisor has run.
- **O5 satisfied:** cancellation is retained, interrupted fetches do not become empty catalogs, and failed-run diagnostics include host, attempts, exit status and elapsed time with credentials excluded. Three prospective checks remain (lines 3, 13, 15).
- **O6 satisfied:** implementation is pending and no runtime check is claimed executed. Timings, exit statuses, header scheduling and supervisor latency are named as remaining evidence (lines 15, 28).

The replacement preserves supported draft/product meaning: delivery on success, original diagnostic fields, cancellation, read-only scope, deadlines and pending validation. Removing the incorrect five-attempt arithmetic, strict flag-only deadline and mutation expansion is justified. Curl documentation's FTP classification does not expand the product's HTTPS scope.

## Every critique disposition

1. **Accept — correct.** The target [retry documentation](primary/retry.md) counts additional retries; `--retry 3` aligns the cap (candidate line 19).
2. **Accept — correct.** The [max-time](primary/max-time.md) counter resets per retry and [retry-max-time](primary/retry-max-time.md) does not stop an already-started transfer; the absolute product deadline remains a supervisor concern (line 20).
3. **Reject — correct.** The governing primary product source is the shared assignment's **O5**. Documentation silence does not authorize deleting cancellation (line 21). A separate internet citation is not needed to invent a curl cancellation obligation.
4. **Reject — correct.** O3 and `retry_scope=read_only_get` forbid expanding to mutating POST endpoints. The [all-error retry documentation](primary/retry-all-errors.md) independently supports duplicate-data risk (line 22).
5. **Accept — correct direction.** Explicit HTTP failure handling is needed; [fail-with-body](primary/fail-with-body.md) is available since 7.76.0 and retains the body. The final's added retry-extension claim is F2, rather than a reason to reject the critique (line 23).
6. **Reject — correct direction.** The target [retry source](primary/retry.md) itself dates header compliance to 7.66.0, before 8.10.1. Preserving it is correct; the added unconditional override rule is F1 (line 24).

## Useful alternatives, history, and limitations

The final makes useful bounded choices: default transient retries instead of the all-error fallback; `fail-with-body` instead of body-suppressing `fail`; automatic exponential backoff instead of setting a fixed retry delay; and a supervisor in addition to curl's two timers. The option introduction table is used appropriately to show availability, with semantics checked against the pinned tag. Modern manual additions such as HTTP 522/524 are correctly excluded from the 8.10.1 HTTP set.

Independent implementation inspection supplies two useful corrections, F1/F2, and an additional lead: host/proxy resolution errors are retried by this version even though the brief retry manual's definition lists timeouts and response codes; refused connections require a separate opt-in. This lead is recorded without creating a third material finding or demanding a broader product policy.

Minor/prospective limitations, separate from the two material findings:

- The candidate labels the newest in-page version string as 8.22.0. The independently retrieved identical 465220-byte page explicitly describes **8.23.0** in its Version section. The target was still correctly pinned to 8.10.1, so this provenance label does not create another material policy defect.
- The source map imports `fail.md`'s authentication caveat for 401/407 into the selected `fail-with-body` claim without distinguishing its post-transfer implementation. No authentication workflow is specified or consequential authentication decision made in this fixture; this is a source-map limitation, not a third failure ground.
- The persistent-500 four-attempt check is meaningful for a fast scripted server with no long header delay. A slower response/header can cause the absolute deadline or retry budget to end the run sooner. The existing three checks do not discriminate F1/F2. Short/long/header-over-budget delays and a 404-versus-503 comparison would be useful prospective checks, not newly imposed original obligations.

The candidate explicitly says no runtime tests ran. The reviewer likewise performed retrieval, static source interpretation, input/source hash comparison, counts and status inspection only. No nonexistent implementation or deployment is demanded. Keeping runtime evidence pending is appropriate; it does not justify overstating exact source semantics as verified.

## Delivery, native, protocol and time kept separate

**Delivery:** complete and within word limits. **Coverage:** complete review of the assigned FINAL axes; semantic failures are confined to the identified consequential O3 claims. **Source:** FAIL for F1/F2.

**T3:** the original candidate run is directly observed `completed` by the status-only `t3_thread_wait` result in [lifecycle-observations.json](lifecycle-observations.json). The root's completed/no-pending attestation is also explicit in this review request. A `task_status` attempt was denied because the candidate task belongs to the parent, not this reviewer; that exact diagnostic is preserved. No history was read and no new candidate task was started.

**Candidate native/effective/billing:** UNKNOWN where not actually observable. The inspected activation receipt records an active `AUTHORIZED_PROVIDER_INSTANCE.create_goal` response with goal ID `goal-01a12408-9006-7eb3-8be3-07dcf3b09b05` and created-at milliseconds `1791605903366`. This is retained as saved candidate evidence, not upgraded into direct provider-host verification. No native completion receipt or completion ordering was available. Requested route `muse-spark-1.3-contributor`, effort `max`, does not establish effective inference or billing. No token, billing, inference-saving or paired-latency conclusion is made.

**Protocol:** no unauthorized assistance is established. The candidate's source map self-reports reading the role input map before activation, while the role wrapper says to read it only afterward; it reports that common substantive inputs and inference followed activation. This limited ordering deviation is recorded, with chronology otherwise unverified because history inspection is prohibited. The independent source judgment does not depend on converting these claims into a protocol verdict. The reviewer used no delegation, candidate feedback/repair, accounts, Git/publication, other arms/history or ER11 rescore.

**Time:** the candidate final's filesystem modification time is 04:22:16.784975 UTC, before its 04:32:54.624 deadline, and its run is completed. This supports no late-delivery finding, not an exact occupancy or billing measurement. Investigation/writing times in its source map are self-reported. The reviewer began at 04:24:47 UTC and saved the judgment within the 25-minute review bound. The reviewer's one actual native Goal was active before source assessment and is completed only after these saved artifacts.

## Freeze and inspected hashes

All eight entries in the existing **input** freeze match their stated SHA-256 values and byte counts. It is a pre-dispatch input freeze, not a terminal science freeze. No existing terminal output-freeze manifest was located in the assigned treatment/case scopes; none is fabricated. Candidate science is fully hashed now and its stability is checked before review completion. Detailed 27-file inspected hashes and scoped freeze checks are in [inspected-hashes.json](inspected-hashes.json), and primary response hashes are in [retrievals.json](retrievals.json).

The final section's inspected SHA-256 is `a34c9a016a6ac7ffe0fa93e8ab1791d0869e26cbcf054f485e2b1cab79e3e322` (5588 bytes). Primary implementation SHA-256 is `c93873c49643fbb87211aa0d6c50ab8799a170d3287854c1f0f5a66fdc9af1b2` (107334 bytes).

[assessment.json](assessment.json) contains the machine-readable independent judgment, all axes, exact findings, unknowns and artifacts. [source-map.json](source-map.json) maps candidate locators to versioned primary evidence. [Primary evidence index](primary/index.md) links each independent response and exact implementation passages. Candidate files were not changed. This is the initial preserved assessment; any later dispute must be recorded separately.
