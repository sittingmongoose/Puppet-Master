# Source-first frozen quality review — V8-NB-RETR-T-M

Disposition: **VERIFIED_FAILED_SCREEN**. This is a decisive source-semantic screen, not a comprehensive evaluation or a numerical score. All unchecked facets remain UNASSESSED with null scores. The frozen proposal was read before METHOD, TASK, case/pair manifests, native metadata, receipts, or costs. No candidate or upstream fixture was executed.

## Decisive findings

**F1 — Major/minor condition conflation changes the component-selection rationale.** Proposal lines 43, 60, and 65 treat nbdime as excluding a 4.4↔4.5 comparison. The documented expectation is [third-party verbatim source excerpt omitted; original locator/hash/range retained]; both declarations have major version 4. In main and v4.0.4, `diff_notebooks` checks dictionary inputs then delegates directly to the configured differ, without a minor-version comparison. nbdime v4.0.4's reader requests major version 4; nbformat v5.11.1's converter explicitly ignores minor revisions and returns an already-major-4 notebook. The alleged cross-minor exclusion is unsupported by this contract and code. This is static source analysis, not an observed compatibility test. It does not prove every mixed-minor input safe. It does invalidate the stated source-condition reason to reject the component and build a replacement matcher.

**F2 — A blanket metadata/execution-count claim follows a stale comment rather than the comparator body.** Proposal lines 75–76 state that the nbdime defaults never let output metadata/execution counts affect identity. `compare_output_strict` removes only output type and data from its generic-key comparison; metadata and execution count remain compared when present. `compare_cell_strict` invokes that comparator for code-cell outputs. A difference in either field therefore rejects a strict match, despite the misleading trailing comment. Approximate output comparison does skip those fields. The prototype may choose to ignore them, but cannot attribute that blanket rule to every nbdime matching level.

F1 affects Q1 and N5's comparison/adoption reasoning. F2 affects Q2 and N2's field/identity reasoning. Neither finding is repaired by transport completion, matching source hashes, or a later method audit. No recommendation was sent to any candidate.

## Evidence and limits

The independent public captures matched all 13 full hashes named in the final proposal. Matching bytes authenticate the cited body, not its interpretation. Main nbformat validator and v5.11.1 validator bodies also matched each other. Captures alone do not assess every claim, version, fix attribution, exception, or unresolved dependency. The declared seven unresolved leads have not been comprehensively adjudicated.

The decisive evidence is pinned in SOURCE_METADATA.json with URLs, exact inclusive line ranges, SHA-256, and capture times. Raw public bodies remain in this evaluator's external source-captures directory and are excluded from the publication whitelist. Only short quotes are reproduced here; there is no native-context or runtime-stream access.

Blindness is limited: the incoming path and proposal disclose its case/stage, a METHOD note, accepted critique labels, and inherited-source lineage. No METHOD/TASK text, manifest, receipt, cost, account, provider profile, private case inventory, or prior evaluator was consulted before this freeze. The supplied root task disclosed the intended native arm and close attestation; those were not used to grade quality. Native frontend consumption and semantic source acquisition remain UNKNOWN.
