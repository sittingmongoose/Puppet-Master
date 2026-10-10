# ER12 B-FINAL-M-02 control-v1 independent assessment

**Judgment: PASS_WITH_LIMITATIONS for the assigned Track B finalization role.** No material semantic error, material omission, or unsupported consequential decision is established. One minor citation omission remains: critique disposition 2 lacks a navigable citation to the product assignment. This is not full-pipeline qualification, an ER11 rescore, a deployment verification, or a comparative speed/cost result.

Reviewer: codex-er12-bfinalm02-review-052315. Review began 2026-10-10T05:23:15Z, with one actual exposed native Goal active before substantive review. The judgment and evidence were saved before reviewer Goal completion. The user supplied root verification of T3 completed/no pending; the assigned terminal freeze corroborates that record.

## Scope, complete inspection and integrity

Read in full: RUBRIC-v1.md; the current role input-map.json, assignment.md and freeze.json; the mapped common assignment, fixture, manifest and every corpus member (S1.md, S2.md, index.json); the authored final-section.md, source-map.json and every sources member (S1.md, S2.md). Also inspected the assigned terminal-science-freeze-root.json, native activation/completion receipts and service-tier request record. No other arm, shared roster, other assessment/status labels, backup contents, prior answers, canon, or ER11 evidence was inspected.

[Inspected hashes](inspected-hashes.json) records all 18 inspected artifacts, their SHA-256, byte sizes, relevant freeze/manifest comparisons and scope exclusions. Every inspected file with an expected digest matches. All four terminal scientific output files match the root freeze: final-section.md, source-map.json, sources/S1.md and sources/S2.md. Hash equality establishes the reviewed bytes, not semantic correctness. The root freeze itself hashes to `310807eddf629ad8415e302b38a307e09417092c34ae4e93423f848a95d00f8a`.

Independent governing evidence was retrieved from official PostgreSQL **17** documentation, not the current-version alias, by web open and a separate HTTPS GET. Both GETs succeeded with HTTP 200. Raw HTML, numbered text, retrieval UTC/operation/headers and digests are saved under [primary-evidence](primary-evidence/index.md); [source-map.json](source-map.json) joins exact candidate and primary locators. Only the two assigned primary pages were needed; no downloaded code was executed.

## Assigned axes and original obligations

1. **Original obligations/negative constraints — PASS_WITH_LIMITATIONS.** The section keeps the exact title, PostgreSQL 17, Read Committed, one latest_reading table and non-null unique device_id (candidate lines 1, 3). All exact policy tokens are retained at line 3. The row limit is validated before submission. Caller preflight rejects the complete duplicate batch and issues no SQL (line 5). Timestamp and payload updates require strict greater-than, with equal/older rows unchanged (line 7). Failure reporting, three prospective groups and explicit implementation uncertainty remain (lines 11–15). Whitespace counts are 559 words before dispositions, 724 for the complete deliverable, within 400–650 and below 1100 respectively. Every critique has a numbered disposition; the single citation omission is L1.

2. **Consequential claims/applicability — PASS.** P1, INSERT Description, numbered text L0099, supports returned changed rows and omission of locked WHERE-false rows. P1 ON CONFLICT L0135–L0136, L0140–L0141 and L0155–L0157 supports selected arbiters, independent-error qualifications, target/excluded references, conditional row locking and deterministic cardinality restrictions. P2 §13.2.1 L0122–L0123 supports current conflicting-row behavior at Read Committed. Combining P1's strict predicate with P2's concurrent upsert behavior supports the proposed path's monotonic timestamp inference; it is not evidence of an actual deployed table or test result. The wording says duplicate proposed keys **can** violate cardinality, rather than asserting every duplicate batch necessarily raises an error.

   Arbiter restrictions are explicitly retained in candidate source-map.json sources[0].conditions_and_exceptions: supported nondeferrable constraints/unique indexes, no exclusion-constraint DO UPDATE arbiters, and concurrent index-maintenance unique violations. The standalone section requires a valid device_id arbiter and admits independent errors, while actual DDL/key validation remains open. Thus no unsupported choice of a deferrable constraint is established. Timestamp type/normalization is not invented; observed_at is specified non-null and actual type/null handling remains unresolved. Trigger inventory/effects, privileges, transactions and retries are acknowledged. Claims are scoped to this proposed ingestion mechanism, not arbitrary external writers or unconstrained triggers.

3. **Useful discovery, alternatives and implementation/history — adequate for the assigned finalization role.** Useful clarifications include equal-time behavior, changed-row accounting, commit-gated acknowledgement and a diagnostic batch identifier. Duplicate and concurrency checks formerly left unimplemented are now proposed explicitly, without an execution claim. The critiques' last-row-wins, unconditional overwrite and forced-Serializable alternatives are each adjudicated. This role does not require a novel-mechanism discovery campaign or a history survey. No extra deployment requirement or mandatory MERGE redesign is invented.

4. **Exact dispositions/wrong corrections — PASS_WITH_LIMITATIONS.** Accept 1, 3 and 5; reject 2, 4 and 6 is correct. Exact line-by-line reasons and primary locators follow below. L1 affects only citation completeness for item 2.

5. **Supported-scope preservation — PASS.** The result retains the original one-table/key design, exact settings, one validated multi-row INSERT, strict-newer rule, batch-linked database error reporting, no failed-statement success counts and no test-execution claim. It corrects the draft's duplicate-last-wins, all-input-rows-returned and universal-success assertions. It does not use source evidence to replace product constraints or claim full-pipeline qualification.

6. **Proposed/executed validation and oracle applicability — PASS.** Candidate line 13 provides three explicit prospective groups: pre-SQL whole-batch duplicate rejection; insertion/newer/older/equal state and RETURNING outcomes; and concurrent same-device upserts plus an unrelated-constraint error with no success acknowledgement. Line 15 repeats that none was executed. These are discriminating specification checks. Actual caller instrumentation, schema, driver, trigger behavior and transaction commits are not observed. Reviewer operations were document reads, primary HTTPS retrieval, hash checks and assessment-file consistency checks; no PostgreSQL test, deployment or driver call ran.

## All critique dispositions

1. **Accept — correct**, candidate line 19. [P1 ON CONFLICT](https://www.postgresql.org/docs/17/sql-insert.html#SQL-ON-CONFLICT), local L0157, describes deterministic statements/cardinality restrictions. The exact product obligation O3 independently requires rejecting repeated device IDs before SQL.

2. **Reject — correct, minor citation limitation**, candidate line 20. The primary product authority is [common assignment O2/O3](ER12_RUNTIME/runs/B-FINAL-M-02/inputs/assignment.md:12) (lines 12–13). Choosing last_row_wins would abandon the fixed reject-batch policy. PostgreSQL documentation cannot authorize that product change.

3. **Accept — correct**, candidate line 21. P1 Description L0099 and condition L0155 support locking without update/RETURNING when the predicate is false. Changed-row accounting therefore uses returned rows.

4. **Reject — correct**, candidate line 22. Product O4 at common assignment line 14 requires strictly newer timestamps; P1 condition L0155 supports that predicate. Unconditional overwrite would violate the preserved policy.

5. **Accept — correct**, candidate line 23. P1 L0136 and P2 L0123 qualify the insert/update outcome by independent/unrelated errors. P1 L0100–L0102 and L0162 supply privilege/maintenance examples. The candidate withholds success on statement failure and until commit.

6. **Reject — correct**, candidate line 24. [P2 §13.2.1](https://www.postgresql.org/docs/17/transaction-iso.html#XACT-READ-COMMITTED), local L0123, explicitly covers ON CONFLICT DO UPDATE at Read Committed. P1 L0155 supplies the intentional conditional skip. Serializable is not required for this bounded operation.

## Finding and limitations

**Material findings: none.**

**L1 — minor required-citation omission.** Exact candidate, final-section.md line 20:
> 2. **Reject.** `last_row_wins` contradicts the frozen `duplicate_policy=reject_batch` and the caller-side rejection requirement; database convenience does not authorize changing that product rule.

Common assignment line 37 requires a reason and primary citation for every numbered critique disposition. This item has the correct reason and policy but no navigable primary citation. Its governing evidence is O2/O3 at assignment lines 12–13; the same obligations are visibly implemented at candidate lines 3 and 5. RUBRIC-v1 expressly permits minor locator issues as limitations. This omission does not change the decision or conceal an unsupported PostgreSQL claim and is not a basis for FAIL. The assessment identifies it without candidate feedback or repair.

The monotonic/per-row outcome reasoning remains a specification inference pending the actual timestamp/identity semantics and trigger inventory. P1 L0141 notes that BEFORE INSERT transformations enter excluded values; L0147/L0149 identify collation/operator-class identity conditions. Key-rewriting or timestamp-changing schema behavior would need to be accounted for before reporting deployed results. No such schema was supplied; candidate lines 7, 11 and 15 explicitly leave normalization/trigger effects and per-row assumptions to validation. This is an implementation unknown, not an established material defect or a demand to inspect a nonexistent deployment.

## Useful discoveries and supported alternatives

The candidate's equal-time/no-RETURNING clarification makes stale accounting more useful. Its commit-acknowledgement boundary avoids treating a result set as durable success. The source map preserves arbiter eligibility and concurrent maintenance failures. Independent P2 L0125 also shows that MERGE is not an interchangeable Read Committed concurrent insert/update guarantee; this is useful context, not an omitted required candidate alternative. Discovery breadth/history remain outside this assignment's qualification claim.

## Delivery, source, coverage, native, protocol and time kept separate

- **Delivery:** complete final-section.md and source-map/evidence present; required length and all six numbered dispositions satisfied, with L1's citation limitation.
- **Source:** PASS_WITH_LIMITATIONS, with zero material findings, based on independent governing primary evidence. Hashes, candidate/root agreement and native status were not the source-correctness oracle.
- **Coverage:** all O1–O6 and all six finalization axes examined. No other role, pipeline, arm, history or ER11 scored.
- **Native:** frozen saved receipt files report the same goal ID `01a1243e-a9f3-7082-9431-8230e736b431`, exact required objective, active then complete, createdAt 1791609461 and updatedAt 1791609720. Completion reports 45,478 native tokens and 259 native seconds. These are reported receipt fields, not billed usage. Root T3 completed/result_available/no pending is separate. Original provider event trace was not inspected: exact-one-total activation, every-read ordering and provenance beyond the frozen records remain UNKNOWN.
- **Effective/billing:** requested AUTHORIZED_PROVIDER_INSTANCE/gpt-6-luna/max/default is recorded in freeze.json; the service-tier change file records a request to default. Actual effective backend model/reasoning/tier, billed token categories, amount and savings are UNKNOWN. Root task metadata is not substituted for those.
- **Protocol:** reviewer used one actual native Goal, no delegation, no candidate contact/repair, no other-arm/account/Git/publication operations, and only its own pm-mail inbox. Candidate artifacts show no affirmative protocol violation, but a full behavioral trace was not inspected, so complete method compliance is UNKNOWN beyond receipts and frozen evidence. Lack of telemetry is not converted into semantic failure.
- **Time:** preparation 05:17:25.520Z, candidate science mtimes about 05:21:42Z, reported native completion 05:22:00Z, root terminal freeze 05:22:55.307328Z; candidate deadline 05:32:25.520Z. This supports delivery before the absolute deadline, and early finishing is permitted. Preparation-to-root-freeze is 329.787328 seconds, a bracket rather than exact task occupancy. Native elapsed time has its own scope. Reviewer uses its separate 25-minute boundary from 05:23:15Z. No paired latency or billing conclusion is made.

Structured details, exact locators, inspected digests, retrieval records and unknowns are in [assessment.json](assessment.json), [source-map.json](source-map.json) and [inspected-hashes.json](inspected-hashes.json). This original judgment is preserved; any later dispute would be a separate disposition.
