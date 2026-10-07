# D-M13-A — prospective comparison card

Trace one real extraction-filter change into a release

Family: Muse, Max; exact account/model route is root-bound before dispatch. Root Max overrides packet Ultra. No dispatch performed.

Question/sources: [inputs/brief.md](inputs/brief.md), [inputs/sources.json](inputs/sources.json), [INPUT_MAP.json](INPUT_MAP.json).

Method: M13 — Implementation and issue-to-regression investigation. The full unaltered method card, stage procedures, output scope and quality map are in [case-card.json](case-card.json).

Control: Ordinary documentation plus relevant issue/repository reading.

Treatment: Trace an implementation branch and a real issue through fix, regression test and applicable release; stop when the bounded decision is supported.

Each arm has an equal 15-minute complete diagnostic envelope, including cold-equivalent common seed, retries, source work, finalization, and parallel occupied work. Each arm's cold-equivalent latency ceiling is 15 minutes; parallel stages reduce critical path but never aggregate cost.

control: ordinary_investigation 12 min → finalize 3 min.

treatment: lead 2 min → trace 6 min → decision_stop 4 min → finalize 3 min.

Launch rank 21; arm order control → treatment. No cross-arm answer sharing.

Quality guard: An open issue is a lead, not consensus. A merged change is not automatically in the chosen release. Running one extracted function has a limited scope.

Fixed legitimate inputs are staged. READY.json certifies complete input map only. Root must qualify native route/account/model/effort/access/tools/output before dispatch.
