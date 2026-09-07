# Assistant v3 — coverage and currentness follow-through

Date: 2026-09-07. Product source frozen at `c99872170dab69b46d82f0d0f0abb1e8d408fc1f`.

This report supplements the historical `FINAL_REPORT.md`; it does not retroactively rewrite earlier audit evidence. Jared explicitly authorized the previously deferred PlanUnit-index/governance currentness work in this conversation. The authorization does not admit runtime implementation, WorkNodes, NodeSeeds, provider dispatch, or a readiness certificate.

## Completed

### Coverage matrix

`DEMO_COVERAGE_MATRIX.md`, `DEMO_REQUIREMENT_MATRIX.json`, `DEMO_REQUIREMENT_MATRIX.csv`, and `DEMO_MATRIX_VALIDATION.json` account for all **551 namespaced retained requirement identities**: 236 original, 245 correction-v4, and 70 polish requirements. There are 67 feature/proof groups with two required scenario descriptions each. `scripts/pm-assistant-v3-demo-matrix.py` verifies source identity counts, uniqueness, group membership, and the exact accepted HTML hash before generating the repository index.

The companion coverage delivery preserves the full supplied wording, original source fields, per-clause acceptance data, source references and supersession notes. It includes a searchable HTML view, gallery/action census, actual observations and portable browser harnesses. Its `SOURCE_REQUIREMENTS.json` SHA-256 is `467d9411e1a248ab0f3ebdd6cc3c6b5227091833e7b892b7ab79b9f7f5ed02d4`.

Executed on the exact accepted HTML:
- 127 gallery controls clicked, 127 observed landing states, zero browser page errors. A landing is not a full workflow pass.
- 37 separate registered-action/owner-API concept outcome cases, 127 explicit passing assertions. These subchecks touch 42 source rows, not every clause of those rows.
- 315 registered extension actions inventoried; these are not 315 independently proven features or native command registrations.
- 31 History threads at initial boot; demonstrations may create more.

The matrix is complete as a census and gap map. **APR-016 remains OPEN**: a candidate scene or passing subcheck does not establish two meaningful user-visible demonstrations per feature. **APR-018 remains OPEN/unexecuted**; this work is not the every-demo 60fps/frame-inspection campaign. Existing bounded repair acceptance remains intact.

### Derived PlanUnit/governance currentness

The index was regenerated using the repository's current generator after confirming product prose stability:

| Measure | Before | After |
|---|---:|---:|
| PlanUnits | 6,362 | 6,395 |
| Acceptance units | 24,128 | 24,239 |
| PlanUnit index validation | FAIL | PASS |

The authorized run verified 98 source documents and 2,138 source-exact shards. Plan index, shard reconstruction, Spec Lock, auto-decision, canonical graph and live-current evidence checks pass. The driver uses the existing generator/seal tools; it does not hand-edit a passing verdict into generated indexes. It confirms 611 protected inputs unchanged, including product Plan prose, retained ledgers, implementation-readiness records and historical evidence.

Evidence and actual exit codes are in `currentness-20260907/RESULT.json` and `currentness-20260907/command-results.json`. Before/after reports are retained there. The idempotent governance decision is `dec-2026-09-07-assistant-v3-index-currentness`.

This supersedes only the earlier **index currentness pending** statement. It does not close unrelated semantic closure-registry findings or certify all repository gates.

## Full-tree results remain qualified

The complete `run-gates` suite was executed before and after. Both report FAIL in the same ten check categories:

`json_syntax`, `lint_contractrefs`, `lint_path_refs`, `validate_new_contracts`, `validate_implementation_readiness`, `validate_plan_migration`, `validate_pm7_gui_fixtures`, `validate_touch_closure`, `validate_audit_closure`, and `validate_audit_status_index`.

Their reported leaf-failure counts are unchanged. Eight category payloads are byte-structurally unchanged; path-reference diagnostics differ in line locations, and audit-closure diagnostics reflect the regenerated index hash while still reporting the already-stale registry bindings. This is not a clean repository-wide governance seal. Blindly replacing old closure hashes would falsely certify semantic reviews, so those records were not repinned.

PNC-019 still reports runtime disabled and ordinary product WorkNodes disallowed. Historical evidence, locked planning lanes and product semantics remain unchanged. No assertion is made that every unrelated baseline defect has been repaired.

## Final executable checks

Actions run `34142374486` executes both concept build checks, PlanUnit validation, shard validation, Spec Lock and evidence validation. It also executes `node tests/test_v3_residuals.js`, retaining its actual exit code and log separately. The preceding run `34141544547` passed all these checks including Node exit 0, but failed the final CSV whitespace check; the generator was corrected to emit LF CSV rather than weakening the check. The final publication workflow then passed.

Governance run `34139359160` contains the full before/after gate execution and generator outputs. Both workflows are scoped to the completion branch; no provider or native-runtime work is launched.

## Remaining work, without scope inflation

1. Implement and prove the two meaningful workflows for every applicable demo feature against the complete retained requirement matrix.
2. Execute the separate exhaustive 60fps recording and frame-review campaign.
3. Resolve existing repository-wide gate failures through their actual owners and evidence requirements, not cosmetic hash refreshes.

No new concept bug or redesign is asserted by this matrix. The accepted Assistant and TestPMConcept HTML/source bytes were not changed by this follow-through.
