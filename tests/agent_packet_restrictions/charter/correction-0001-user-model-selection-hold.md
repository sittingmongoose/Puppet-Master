# User model-selection hold

Recorded UTC: `2026-08-02T19:54:40Z`  
Applies before any route canary, pilot, or fleet launch.

The user directed: “When you get get to the testing part. I will tell you which models to use to test with.”

Consequences:

- `inventory/model_matrix.v1.json` is preserved as an unlaunched coordinator draft only.
- That draft is superseded before use and is not the authorized subject matrix.
- No route canary, semantic pilot, semantic fleet, or other subject-model call may launch until the user supplies the exact ten model routes.
- The eventual authorized matrix must still contain exactly eight relative-low slots and two relative-high slots, subject to the original distinct-model and effective-identity gates.
- The authorized matrix, pilot slots, and method amendment will receive new versions. The draft files will not be relabeled, overwritten, or cited as test evidence.
- Controller construction, source inventory, fixture authoring, and deterministic scorer construction may continue without subject-model calls.

Current terminal state for the model-selection prerequisite: `USER_MODEL_SELECTION_PENDING`.
