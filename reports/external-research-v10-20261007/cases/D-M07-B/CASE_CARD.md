# D-M07-B — prospective comparison card

Verify a CRS import recommendation with breadth reserved

Family: GLM, Max; exact account/model route is root-bound before dispatch. Root Max overrides packet Ultra. No dispatch performed.

Question/sources: [inputs/brief.md](inputs/brief.md), [inputs/sources.json](inputs/sources.json), [INPUT_MAP.json](INPUT_MAP.json).

Method: M07 — Critical-dependency-first verification with protected coverage. The full unaltered method card, stage procedures, output scope and quality map are in [case-card.json](case-card.json).

Control: Reasonable full-scope critic allocating attention in normal document order.

Treatment: Verify assumptions that could invalidate the selected recommendation first, while reserving an explicit lower-risk and breadth check.

Each arm has an equal 15-minute complete diagnostic envelope, including cold-equivalent common seed, retries, source work, finalization, and parallel occupied work. Each arm's cold-equivalent latency ceiling is 15 minutes; parallel stages reduce critical path but never aggregate cost.

control: common_seed 3 min → document_order_review 10 min → finalize 2 min.

treatment: common_seed 3 min → critical_first 5 min → protected_breadth 5 min → finalize 2 min.

Launch rank 14; arm order treatment → control. No cross-arm answer sharing.

Quality guard: No top-k deletion of remaining leads. Unchecked optional evidence remains visible; a required promise cannot be relabeled optional to pass.

Common predecessor is missing. See [PREDECESSOR.md](PREDECESSOR.md). No READY.json until its actual bytes and receipts exist.
