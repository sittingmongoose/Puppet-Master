# Required Files, Naming, and Reports

## New concept IDs

Use these stable concept IDs. A model-specific subtitle/name may be added, but the source family must remain obvious.

```text
concept-05-directory-take-1
concept-06-directory-take-2
concept-07-compendium-workspace
concept-08-directory-take-3
concept-09-tome-tabs
concept-10-command-suite
concept-11-tabbed-organizer
```

Use the existing folder's established HTML/module structure. Add all seven to its index/workspace and `concept-hub.json`, preserving every existing entry.

## Per-concept evidence

Each concept requires a concept-specific evidence directory or existing equivalent containing:

```text
impact-register.json
manager-coverage.json
candidate-command-delta.json
candidate-wiring-delta.json
candidate-dry-delta.json
plan-owner-delta.md
search-route-matrix.json
manager-route-matrix.json
test-evidence.json
```

`manager-coverage.json` must enumerate every required family and may not use `shared_grammar`.

`search-route-matrix.json` records query, result ID, displayed path, expected destination object, actual destination, focus/highlight outcome, and pass/fail.

`manager-route-matrix.json` records every manager, entry point, concept-local route, shell retained, Back target, Close target, narrow behavior, key states, and pass/fail.

## Model-folder reports

Write or update without altering historical concept-specific reports:

```text
reference-review-report.json  # update additively; preserve prior review history
REFERENCE_REVIEW_2026-08-18.json  # immutable snapshot for this pass
SEVEN_NEW_CONCEPTS_TEST_REPORT.md
SEVEN_NEW_CONCEPTS_FINDINGS.md
SEVEN_NEW_CONCEPTS_IMPACT_REGISTER.json
```

`reference-review-report.json` must retain prior entries and add this pass; do not erase historical evidence. The new snapshot and reference review must state every packet/reference opened, how each selected image was interpreted, which legacy assumptions were superseded, and exact evidence that the new work does not route through shared managers from another concept.

## Final response

Report:

- exact model folder;
- paths for concepts 05–11;
- original-concept regression status;
- manager coverage totals per concept;
- inventory/search coverage count;
- test matrix result;
- exact known limitations;
- candidate Plan/Command/Wiring/DRY impacts;
- temporary material removed.

Do not select a winner.
