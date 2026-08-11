# Control-plane defect 0004 — V4 prefreeze write-boundary violation

Status: `V4_PREFREEZE_INVALID`

Detected UTC: `2026-08-02T21:56:00Z`

## Defect

During a deterministic inventory-coverage comparison, the coordinator redirected four scratch lists to `/tmp` rather than to the exclusive write root. The exact outside-root files created were:

- `/tmp/apr_blocked_ids` — 443 bytes — SHA-256 `2657d4c7ce93064379aea045c72b001b650f962fc1fd6ebbe4ec42ad56815c30`
- `/tmp/apr_ig_ids` — 443 bytes — SHA-256 `2657d4c7ce93064379aea045c72b001b650f962fc1fd6ebbe4ec42ad56815c30`
- `/tmp/apr_all_ids` — 467 bytes — SHA-256 `d5b19d930c77e824de0f9aa0caba0bc5503a2fa5210a9ddd788e2c2d3c8a189b`
- `/tmp/apr_dim_ids` — 467 bytes — SHA-256 `d5b19d930c77e824de0f9aa0caba0bc5503a2fa5210a9ddd788e2c2d3c8a189b`

This violated the task's literal requirement that every temporary file remain under `/Users/jaredsmacbookair/Documents/PuppetMaster/tests/agent_packet_restrictions/`.

## Scope and preservation

- No subject, route, provider, authentication, or configuration call was made.
- No canonical Plan, ledger, product, governance, or existing test file outside the exclusive root was edited.
- The four scratch files contain only sorted surface identifiers.
- They were not deleted or moved because doing so would be another outside-root mutation without Jared's explicit approval.
- Historical V1 artifacts briefly considered for a closure repair were restored byte-for-byte before this record was written. Their hashes again match the preserved V3 freeze receipt:
  - `inventory/surfaces.v1.json`: `88e8f4614610b4b3cdb27b105817ec0754a653a9a6e5fdf82f7567983ec6ac32`
  - `cases/implementation_gated.v1.json`: `a13d85ea469823e2b1ab53a97d89dd5b768b0539400a4183fa078576458c7dea`

## Disposition

V4 is not eligible for a clean freeze or launch qualification. This record is immutable failure evidence. Any resumed corrected method must use a new version, place all scratch state under the exclusive root, include this defect record in its freeze, and obtain the user-supplied exact 8-low/2-high roster before any authentication/configuration/provider/route activity.
