# D-M10-A — prospective comparison card

Evidence-first review of a cache proposal

Family: Luna, Max; exact account/model route is root-bound before dispatch. Root Max overrides packet Ultra. No dispatch performed.

Question/sources: [inputs/brief.md](inputs/brief.md), [inputs/sources.json](inputs/sources.json), [INPUT_MAP.json](INPUT_MAP.json).

Method: M10 — Evidence-first criticism to reduce agreement bias. The full unaltered method card, stage procedures, output scope and quality map are in [case-card.json](case-card.json).

Control: Critic reads the proposal before checking the evidence.

Treatment: Critic first derives a short answer to the same bounded question from legitimate sources, then receives the candidate claim and reconciles.

Each arm has an equal 15-minute complete diagnostic envelope, including cold-equivalent common seed, retries, source work, finalization, and parallel occupied work. Each arm's cold-equivalent latency ceiling is 15 minutes; parallel stages reduce critical path but never aggregate cost.

control: common_seed 3 min → proposal_first 10 min → finalize 2 min.

treatment: common_seed 3 min → evidence_first 4 min → release_and_reconcile 6 min → finalize 2 min.

Launch rank 18; arm order treatment → control. No cross-arm answer sharing.

Quality guard: Candidate critic is still flash-level. Do not leak evaluator-derived answers or turn the first phase into unbounded duplicate research.

Common predecessor is missing. See [PREDECESSOR.md](PREDECESSOR.md). No READY.json until its actual bytes and receipts exist.
