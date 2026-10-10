# Independent ER12 assessment: B-FINAL-M-02 / treatment

**Source judgment: PASS_WITH_LIMITATIONS.** The complete bounded FINAL deliverable meets O1–O6, preserves the fixed product constraints, and reaches the correct dispositions for all six critiques. No remaining material factual error, omission, or unsupported consequential decision was found. One ancillary rationale overstates what the INSERT documentation rules out; it does not change the supported rejection or implementation. This judgment qualifies this assigned finalization role only, not a full pipeline, another arm, or ER11.

Reviewer: `codex-er12-bfinalm02-review`. Review began 2026-10-10T05:23:15Z. One actual native reviewer Goal was created before scientific inspection, with an objective referring to this exact assignment; judgment is saved before that Goal is completed. No delegation, candidate feedback/repair, account access, Git/publication, other-arm review, history lookup, roster, or other outcome-label inspection was used. The reviewer checked only its own mailbox.

## Evidence and scope

I read the complete rubric; role input-map, assignment and freeze; mapped common assignment and fixture; every corpus member (`index.json`, `S1.md`, `S2.md`); the complete authored `final-section.md`, `source-map.json`, and every source member (`S1-excerpt.md`, `S2-excerpt.md`). I also read the input manifest, native receipt files, and the explicitly authorized root terminal-science freeze. Filenames were enumerated rather than inferred. Hashes of all inspected inputs/science and receipts are in [inspected-hashes.json](inspected-hashes.json).

I independently retrieved both governing PostgreSQL **17** pages by web open and HTTPS GET at 05:24:11Z. Complete retrieved HTML and extracted text are saved under [primary/](primary/). [Source map](source-map.json) supplies URLs, section anchors, snapshot paths, line locators, retrieval operation, hashes, applicability, and claim links. No database, deployment, or downloaded code was executed. Two listed primary pages were sufficient; no extra page, source-code archaeology, or historical release survey was required by this bounded FINAL assignment.

The relevant domain is one latest-reading table, a unique `device_id` arbiter, PostgreSQL 17, Read Committed, multi-row INSERT with conditional DO UPDATE and RETURNING. The row limit has units of **input readings per batch**, including rejected duplicates before SQL, rather than changed rows. The device key and timestamp are the predicate subjects; no device fleet, service SLA, timestamp storage type, or existing deployment was supplied. The candidate's `readings`/`payload` names describe its proposed SQL, not observed deployed schema.

## Exact obligations and delivery

Candidate locators below refer to the frozen [final-section.md](ER12_RUNTIME/runs/B-FINAL-M-02/treatment/stages/role/final-section.md).

| Obligation | Independent finding | Candidate locator |
|---|---|---|
| O1 | Exact title, PostgreSQL 17, Read Committed, and one table keyed by device_id preserved. | Lines 1, 3 |
| O2 | All three exact tokens preserved: `duplicate_policy=reject_batch`, `stale_policy=keep_newer`, `max_batch_rows=100`. Limit is also enforced before SQL. | Lines 3, 5 |
| O3 | Any repeated device_id rejects the complete batch before INSERT; no silent duplicate selection. | Line 5; check 3 at line 13 |
| O4 | Strict `>` predicate; equal/older timestamps retain the row; stale conflicts are locked and omitted from RETURNING; accounting uses returned identifiers. | Lines 7, 9 |
| O5 | Unique arbiter, explicit conflict target, concurrency behavior, and independent/unrelated errors are stated. No unconditional success promise. | Lines 3, 11 |
| O6 | Three prospective numbered checks, failure diagnostics/no success counts for a failed statement, unresolved implementation evidence, and explicit absence of database execution. | Lines 13, 24 |

Whitespace word counts independently recomputed: **523** for the standalone section including title, **767** for the entire deliverable. Both satisfy 400–650 and below 1100 respectively. The section is a complete replacement followed by six numbered dispositions and a remaining-uncertainty statement. The file is present; it is graded, not MISSING/UNASSESSED.

## Factual applicability and consequential conditions

The cardinality restriction governs proposed SQL rows on the arbiter, not arbitrary caller policy. Uniqueness inference must succeed; DO UPDATE needs a conflict target and supports nondeferrable constraints/unique indexes, not exclusion arbiters. The candidate uses the supported device_id arrangement. Its extra missing-key/timestamp validation is consistent with the stated keyed, timestamped input. [P1: ON CONFLICT](https://www.postgresql.org/docs/17/sql-insert.html#SQL-ON-CONFLICT).

Conditional DO UPDATE locks conflicts, evaluates the condition after identifying the conflict, and changes only qualifying rows. RETURNING covers actual insert/update rows, excluding a locked row skipped by that condition. Thus the proposed strict predicate and successful-statement accounting match the intended stale policy. The generic insert-or-update guarantee in line 11 must be read with the explicit skipped-update exception in lines 7–9; the candidate preserves that exception. [P1: INSERT](https://www.postgresql.org/docs/17/sql-insert.html).

Read Committed supports DO UPDATE, including conflicts whose row version was outside the command's ordinary snapshot. Waiting/rechecking is appropriately described as possible, without latency or all-error guarantees. The independent-error proviso is retained; permission failures and concurrent unique-index maintenance are relevant exceptions. PostgreSQL's concurrent-index warning supports the candidate's maintenance caveat. [P2: §13.2.1](https://www.postgresql.org/docs/17/transaction-iso.html#XACT-READ-COMMITTED), [P1: ON CONFLICT warning](https://www.postgresql.org/docs/17/sql-insert.html#SQL-ON-CONFLICT).

Accounting is reviewed within the supplied simple keyed-table design. No schema with triggers that rewrite keys or suppress rows, rules, or other ingestion paths was furnished. PostgreSQL notes that BEFORE INSERT effects enter `excluded`; deployment-specific key preservation and timestamp validity therefore remain unobserved. These are applicability limits, not invented deployment requirements or supported evidence of a defect in this fixture.

## Every critique disposition

| Critique | Candidate | Independent disposition and basis |
|---|---|---|
| 1 | Accept, line 17 | Correct. Duplicate arbiter rows can raise cardinality violation; O3 requires caller rejection. P1 deterministic-statement paragraph. |
| 2 | Reject, line 18 | Correct because last_row_wins changes O2/O3. The additional SQL rationale has limitation L1 below. |
| 3 | Accept, line 19 | Correct. Conditional stale skips are absent from RETURNING. P1 Description/RETURNING. |
| 4 | Reject, line 20 | Correct. Overwriting all timestamps violates O4 and the stale policy; P1 condition supports selective updating. |
| 5 | Accept, line 21 | Correct. The documented guarantee excludes independent/unrelated errors. P1 ON CONFLICT and P2 §13.2.1. |
| 6 | Reject, line 22 | Correct. P2 explicitly documents DO UPDATE under Read Committed; a Serializable redesign would also discard O1. |

**L1 — minor ancillary rationale overstatement.** Candidate line 18 says adopting last_row_wins “would send arbiter duplicates that S1 forbids”; candidate source-map `applicability.S1_deterministic` similarly says it refutes last_row_wins. P1 constrains the rows actually proposed to INSERT. A caller could select the last occurrence before constructing SQL, avoiding SQL duplicates. That is an inference from the subject of the documented restriction, not a recommended repair or an executed implementation. Such a caller policy still violates this assignment's O3. The original-obligation reason independently supports rejection; no product constraint, selected disposition, SQL path, or consequential decision depends on the overstatement. Severity: nonmaterial limitation, not FAIL.

## Supported scope, alternatives, and useful discoveries

The final retains the draft's supported batch bound, one-statement design, diagnostic batch ID, equal-timestamp retention, prospective validation and error reporting. It corrects the three factual defects without accepting the three requests to discard fixed constraints. No supplied discovery/critique meaning that supports the required design is silently dropped.

For this FINAL role, adjudicating the proposed last-row-wins, overwrite-all, and Serializable alternatives is the required alternative coverage. A separate DISC-style mechanism inventory or implementation history is not an obligation. Independent useful context: caller deduplication could make last-row-wins technically possible but product-inadmissible; Read Committed MERGE is not an interchangeable upsert guarantee; concurrent unique-index maintenance can still produce unique violations. These observations discriminate the source scope rather than demand new features. P2 §13.2.1 describes MERGE's differing concurrency behavior; P1's warning supplies the maintenance exception. The candidate's short source captures match the governing passages.

## Proposed versus executed validation

The three acceptance groups have meaningful observable oracles: inserted IDs returned; newer value stored/returned and older value retained/absent; duplicate batch rejected with no INSERT. They remain prospective. The final explicitly says no database test ran and the source map reports no local DB probe. Equal-time, exact-100/101 boundary, contention, and unrelated-constraint checks could extend implementation validation, but are not additional mandatory checks imposed by this review.

Reviewer execution consisted of full file inspection, primary documentation retrieval, JSON parsing, word/token checks, SHA-256/byte/mtime comparison and save verification. None establishes a deployed database result. Candidate URL retrieval and file verification are reported in its source map/root terminal summary; without a tool trace their exact execution route is not independently observed. Their saved source statements were independently verified against current version-17 documentation.

## Separate delivery, native, protocol, time and billing observations

- **Delivery: PASS.** Required final and source artifacts exist, parse, satisfy size/title/token constraints, and match the terminal freeze. All eight input-freeze entries match. All four science artifacts match root-frozen SHA-256, byte count and mtime; hashes are integrity evidence, not the basis of the semantic judgment.
- **Source: PASS_WITH_LIMITATIONS.** L1 only; zero supported material findings.
- **Coverage: complete for this assigned FINAL role.** No full-pipeline qualification or paired-arm latency judgment.
- **Native: UNKNOWN independently.** Frozen candidate-authored files contain purported create_goal/update_goal responses for `goal-01a1243e-de66-7830-90b9-d690014bf472`, verbatim objective, active then complete/100. Both explicitly mark provenance UNKNOWN. Recorded creation is 05:17:42.374Z and completion 05:21:35.791Z; frozen science mtimes precede recorded completion. This is receipt/chronology consistency, not independent proof of actual native invocation, activation-before-reading, exactly one Goal, or unmodified provider telemetry. No provider history was inspected. T3 completion is separate: the authorized root freeze records completed/result_available and no pending child runs at 05:22:51.502Z.
- **Protocol: no disqualifying violation observed; execution details UNKNOWN where unobserved.** Receipt objective and save chronology are consistent with the route. Candidate reports no nested assistance or account/cross-arm access; I neither infer misconduct nor certify those negatives from a final section. Reviewer complied with its independent bounded scope.
- **Effective runtime/model/account: UNKNOWN.** Freeze requests Muse `muse-spark-1.3-contributor`, max effort; the root terminal record names that provider/model. These identify the requested/reported target, not independently established effective runtime or billing identity.
- **Billing/token scope: UNKNOWN.** The completion receipt records `tokens_used: 2128372`; preserve the raw field without treating it as per-task consumption, billed tokens, cost, or savings. No invoice or scoped provider telemetry was inspected.
- **Time: delivery observed within the recorded arm deadline.** Prepared 05:17:25.520Z; deadline 05:32:25.520Z; root terminal freeze 05:22:51.502Z, approximately 325.982 seconds after preparation. This is a timestamp interval, not validated active scientific occupancy or billing savings. Required science mtimes precede the deadline and the recorded native completion. The reported finish at 05:21:42Z is candidate-reported. Reviewer finishes well within its own 25-minute bound; no paired speed claim is made.

Open implementation evidence is honestly retained: schema/SQLSTATE mapping, contention/retry behavior, constraint taxonomy and actual acceptance results. Neither this source review nor the candidate's prospective checks establishes them. No nonexistent deployment or additional product obligation is demanded.

The machine-readable judgment, evidence locators, detailed inspected hashes and retrieval metadata are preserved in [assessment.json](assessment.json), [source-map.json](source-map.json), [inspected-hashes.json](inspected-hashes.json), and [retrievals.json](retrievals.json). This is the original independent assessment; any later dispute should be a separate artifact.
