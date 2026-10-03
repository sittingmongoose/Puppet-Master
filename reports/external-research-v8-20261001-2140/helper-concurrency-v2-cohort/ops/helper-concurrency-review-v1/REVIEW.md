# Helper concurrency v1 independent review — HOLD

Exact source: `f8b0f9f984bbfe1b1fd62d46b956247961d09fdea01fabb83d759f631d75078d`. Source manifest: `becd3cb6f10ca259b2a9e4e282f028c3564d580aad51fb245203020c9f479e49`. Root authority: `f1682a991232997556aed7fb88f167e706317259913d9365c5a1fb72fc572a79`.

One blocking finding, HC-V1-001, affects helper-start lines 182–189. When `started_epoch` is omitted, the wrapper validates a default birth but forwards the unchanged request. The frozen delegate reads the clock again and stores that later time. Controlled full-source mocks accepted and stored `1790996059.0` before receipt effective epoch `1790996060.0`, and accepted/stored NaN in the second reproduction. Both mutated mock state without rejection. Receipts are in `CLOCK_ROLLBACK_EVIDENCE.json` and `CLOCK_NONFINITE_EVIDENCE.json`.

A narrow successor should forward a copied helper-start request containing the already validated birth. Preserve the v1 source, original request, frozen dependencies, other actions and all clocks, budgets, caps, reservations and history. This report holds only the exact v1 source; it does not grade a future repair.

All 15 author tests pass. Of 17 independent tests, 15 pass and the two clock-edge tests fail as recorded in `TEST_RESULTS.txt`. Input and dependency pins match after the tests. The wrapper isolates old imported auth objects and changes only the helper count 6→12; native admission remains unchanged and requires no native controller edit. Installation, receipt/path/hash/type rejection, cap boundaries and retained accounting semantics pass their tests.

Execution used unchanged complete source bytes with reads mapped to owned exact dependency copies. No live ledger transaction/save/apply, installation, native/provider/unit/profile/auth actions, candidate/source answers, canon or Git operations occurred. These clock faults are adversarial mocks, not live observations. Helper-end's old proof-storage behavior is preserved; root still requires its positive frozen proof convention.

The initial harness attempt blocked two author temporary writes outside this LAB; moving their tempfile root into the owned LAB fixed the harness issue. That output remains in `ATTEMPT1_ISOLATION_GUARD_RESULTS.txt`. No separate source FREEZE file existed; the exact MANIFEST supplies the source freeze.
