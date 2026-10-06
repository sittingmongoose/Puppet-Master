# Critic and recovery report

## Provenance and scope

**Provenance:** candidate-authored native self-critique/repair of the prior authenticated same-arm artifacts, performed in this same combined critique+repair Goal. “Independent critique” here means my own fresh audit effort under the unchanged brief, criteria and source rules. This report is not a separate independent evaluator, Sol source assessment, quality grade or evaluator PASS.

I read the unchanged brief (SHA-256 `6e6749f350f747baec86f127a6c91ec60c3e9d010329484dadd37bf22877450a`), common criteria (`344135779883060be49d7e389f9dd160e30267247d90269710cb283877602f44`), source access, source separation, output contract and delivery objective. I used the bounded public captures/catalogued primary sources and one candidate-authored isolated Python witness. The current stage is `I-06-treatment-BLIND-SOURCE-FIDELITY-R001-critic_final-a001`.

## Access check and audit limit

The canonical current proposal path `out/final/proposal.md` was absent. The fixed `inputs/delivery_role_manifest.json` has `entries: []`, so it supplies no predecessor `input_id` or path. I also tried likely same-arm prior paths under the exact research and final role names, including `inputs/prior/I-06-treatment-BLIND-SOURCE-FIDELITY-R001-final-a001/out/final/proposal.md`, `...research-a001/out/research/proposal.md`, and the corresponding role names without the `a001` suffix; those reads returned FileNotFound. No predecessor catalog or owned source-context captures became available through those paths.

Consequently, the proposal/catalog claims in the prior authenticated same-arm artifacts are **UNASSESSED**: I cannot identify their exact contents, verify which claims they made, or honestly label any predecessor claim preserved, corrected or removed. I do not infer missing contents from the brief or public sources. This prevents a claim-by-claim audit of the requested proposal. The bundle therefore contains a complete, newly authored recovery proposal and catalogs, with that limitation disclosed; it must not be read as proof that inaccessible predecessor text was repaired.

## Checks performed

- Checked the governing requirements for bounded previews, immutable inputs, malformed-row visibility, notebook execution provenance, invalidation, clean replay, file exchange, 5 GB/16 GB as a target rather than a result, untrusted code isolation and one real issue/fix/test chain.
- Checked public primary documentation for nbformat 5.11, nbclient 0.11, Jupyter Server 2.21 and DuckDB 1.5 documentation as captured on 2026-10-06. Source records retain exact URLs, capture IDs, content hashes and relevant locators.
- Checked DuckDB's CSV inference and faulty-input documentation. The proposal distinguishes sampled type inference from full-file validation and treats reject visibility as a product requirement.
- Checked DuckDB issue #25825, its comments, PR #26195 and the PR diff. The issue is a report; the PR was open and `merged: false` in the captured API record. The patch proposes a scanner-boundary fix and includes a regression-test file. I did not execute that test, verify CI, establish a release containing the fix, or reproduce the issue in DuckDB.
- Executed one bounded synthetic NDJSON component check in the admitted isolated Python capability. It retained Unicode/null/mixed values, bounded the preview, reported a malformed line, and checked source-byte immutability and row-key uniqueness. Its receipt and limits are recorded in `witnesses.json`. This checks only that small candidate-authored parser component and input; it does not establish application, DuckDB, notebook, large-file, security or performance behavior.

## Recovery changes authored

Because the predecessor text could not be read, these are changes in the recovery deliverable, not verified diffs against the old proposal:

- Defined a local-first Python notebook workflow using the standard `.ipynb` document with nbformat/nbclient, and optional in-process DuckDB for tabular SQL. The support boundary avoids promising broad kernel support or shared multi-process writes.
- Separated displayed cell order, observed execution events, live-kernel state and saved outputs. Added a provenance record and stale/unverified states; clean replay in a fresh kernel is the reproducibility check, subject to declared inputs, environment and external nondeterminism.
- Made preview sampling explicit and required schema confirmation/full validation where the use case needs it. Malformed rows remain visible as rejects or stop the operation; source datasets stay immutable.
- Qualified large-file behavior: a bounded/streaming path is conditional on the operation; global sort/group operations and memory limits need target-machine validation. No 5 GB performance result is claimed.
- Made isolation an OS/container boundary with scoped mounts, network/resource controls and no import-blacklist claim. Added local locking, atomic-save/recovery and explicit conflict handling as proposed engineering choices.
- Corrected source applicability in the issue chain: open issue and unmerged PR evidence is a failure report and proposed patch/test, not proof of released behavior or a passing regression test.
- Recorded the synthetic witness narrowly and listed the actual product checks as proposed/UNEXECUTED.

## Remaining unknowns

1. The current final proposal, `sources.json`, `witnesses.json`, `leads.json`, authenticated same-arm predecessor contents and their owned source captures were not readable. Claim preservation and predecessor defect identities remain UNASSESSED.
2. DuckDB issue #25825 behavior across released versions, PR #26195 merge/release status after capture, and the regression test result remain unknown from this evidence.
3. No product implementation was run. Replay fidelity, stale-state tracking, cancellation/progress, two-machine reopening, recovery after interrupted writes, concurrency behavior, security isolation, and operation-specific 5 GB performance remain unverified.
4. The isolated witness's execution receipt records a code hash and output hash, but the bounded delivery record available here did not expose the complete harness source for embedding. The reported behavior is tied to that receipt and is not independently reproducible from this bundle alone.
5. Environment pinning, undeclared file access detection and determinism for external services/randomness need implementation decisions and tests.

The report and all recovery claims are candidate-authored work. I assign no score, source grade, whole-case PASS or quality validation. The report distinguishes completed checks from the unavailable predecessor audit and proposed validation.