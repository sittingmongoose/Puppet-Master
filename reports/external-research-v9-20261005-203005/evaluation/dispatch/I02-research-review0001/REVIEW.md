# I02 frozen research-stage assessment

Both anonymous research outputs receive **FAIL_SCREEN for their current stage claims**, with different defects. These are research proposals with their catalogs, not designated finals. Final delivery, later repair/preservation and whole-pipeline quality remain **UNASSESSED**. Two failed stage screens do not establish equivalent quality or a method winner.

The immutable Phase 1 judgment was saved at **2026-10-05 22:47:16 UTC**, SHA-256 `ffb8df5fb93d0dfa751e5d6029f5b6f21921f17f64f112405a6b367395940a54`, before opening economics or the private arm allocation. Assessment began at 22:30:13 UTC; the source screen took 1,023.27 seconds within its original 1,200-second target. The overall evaluation allocation is 1,800 seconds. I01 was preserved unchanged.

## Current-stage defects

| Alias / defect | Exact location | Finding |
|---|---|---|
| A / I02-A-D01 | Proposal lines 107, 194; W2 `exec-eo7n39wa` | The multilingual NDJSON ledger increments `byte_off` with character counts. Actual line 101 is reported at byte 6158 but starts at UTF-8 byte 6292; line 2001 is reported at 126362 but starts at 129029. The decoded-string and byte coordinate systems differ. This can mislocate records the contract promises to preserve and inspect. |
| A / I02-A-D02 | Proposal lines 88–95, 154 | The kernel's stated `.labbook/` write grant includes authoritative events, index and outputs. No finer trusted-writer boundary is defined. That permission policy does not support trustworthy provenance against untrusted notebook code. This is an inference from the proposed grants and authority paths, not a penetration test or claim that a running product was compromised. |
| B / I02-B-D01 | Proposal lines 149–151 | Clean replay explicitly honors `skip-execution` tags while guaranteeing that every visible output is newly produced in a fresh kernel. In the exact nbclient source capture, the skip branch returns the original cell before its saved outputs are cleared. Clearing, excluding or explicitly relabeling those retained outputs is an additional required behavior. [Primary source](https://github.com/jupyter/nbclient/blob/main/nbclient/client.py). |
| B / I02-B-D02 | Proposal lines 119, 211; W2 `exec-g1i97bf6` | The normalized record maps both a missing optional field and an explicit null to `None`. It does not carry a presence marker, so this witness cannot demonstrate the claimed normalized distinction. Preserving the original input remains useful and may permit later reconstruction; that does not establish the claimed distinction in the normalized row. |

All four are consequential to the actual data/provenance/replay obligations. No alternative staleness rule or optional feature was imposed by the evaluator.

## Supported findings and execution retained

A supplied useful notebook-schema, reactive-DAG and tabular-reader precedents. Its DuckDB issue/fix/test chain is real; the evaluator checked the regression file and the corrected scanner guard directly in **v1.1.0**, rather than treating tag dates alone as proof. Unresolved earlier backports stayed unresolved. [Issue 12596](https://github.com/duckdb/duckdb/issues/12596), [fix 12679](https://github.com/duckdb/duckdb/pull/12679), [tagged regression test](https://github.com/duckdb/duckdb/blob/v1.1.0/test/sql/copy/csv/test_12596.test).

B supplied useful notebook-document, DVC dependency-status and DuckDB mechanisms. Its PyArrow vulnerability/fix/test chain is supported by Apache's primary release notice and the pinned fix. The vulnerability is specific to PyArrow; it was not reproduced here, and no whole Arrow runtime test was run. [Apache release notice](https://arrow.apache.org/blog/2023/11/09/14.0.1-release/), [fix and tests](https://github.com/apache/arrow/commit/f14170976372436ec1d03a724d8d3f3925484ecf).

Exact anonymous code/input/stream/fact exports confirm **ten candidate executions: eight exit 0 and two exit 1**. Both failed attempts were recorded and preserved. Correct local observations include null-count handling, pure-transform byte equality, sampling fallibility, reject accounting, restart-to-unverified examples, and stable versus explicit tie-break ordering. The Unicode position defect and normalized presence loss survive those successful exits. Both status demonstrations also leave environment/interrupt coverage incomplete; no full runtime, 5 GB performance, sandbox or crash-recovery proof is assigned. Proposed validations remain UNEXECUTED.

## Coverage and limits

Both outputs were assessed using the same five important checks and the actual twelve notebook obligations under the eight common dimensions. B-P1 checked useful precedents and each real issue/fix/test chain; B-P2 checked consequential data/replay/provenance claims; B-P3 examined the ten actual executions and their scope; B-P4 checked current source fidelity/errors while leaving later preservation/repair unassessed; B-P5 inspected actual workflow, portability, resources, usability and opportunity/alternative coverage.

A has **9 complete, 6 partial and 3 unassessed claim groups**; B has **10 complete, 5 partial and 2 unassessed groups**. These are coverage states, not scores. Remaining scope includes complete dependency/format applicability, live locking/recovery, broader issue/PR assertions, authority enforcement, and every final/later-stage duty. Full-case PASS is ineligible in this stage-only descriptor.

Primary raw documents matched several catalog hashes. Four direct GitHub API requests encountered rate limits; no repeated API retries or credential changes were used. Public primary pages, raw pins and preserved capture metadata supplied the assessed evidence. The courier preserved 37 metadata records and three unresolved references; capture identity is not proof of model comprehension.

Blinding was partial: method/family context and the partial-stage scope were already known; source choices and catalog times could supply hints. The arm map, economics and later-stage semantics were withheld until the Phase 1 snapshot. Requested evaluator configuration is GPT 6.1 Sol xhigh; observed evaluator configuration was not supplied by a platform receipt. No findings, expected answers, new candidate inputs or retests were created from this assessment.

## Post-judgment accounting

Only after the snapshot, the courier released the mapping **A = treatment research; B = control research** and a separately pinned accountant projection. It records GLM 5.3 Flash / max for both assessed research rows. The control row is operationally FAILED; the treatment row is COMPLETED. Both are quiescent, while the typed projection leaves actual native Goal status UNKNOWN. Those row states are preserved; they do not create a completed or qualified full pipeline.

The two-row subset records **2 native starts**, **2,079.58 occupied seconds** and **3,377,577 known provider-total tokens**. Cache input is already included; UI/provider views are not summed. Cancelled tails, unexposed child usage, HTTP cost and dollars remain unknown. Later-stage cost and full-pipeline efficiency are outside this subset. The declared contrast acts in later stages, so these research outputs cannot establish its causal effect or a speedup.

Verification timing clarification: the tagged DuckDB regression test was inspected before Phase 1; the scanner guard was specifically located after the snapshot. `ERRATUM_01.json` records this correction to the inspection wording. The source supports the same version claim, and neither stage verdict nor coverage scope changed.
