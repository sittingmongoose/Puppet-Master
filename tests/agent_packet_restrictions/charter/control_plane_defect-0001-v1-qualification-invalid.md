# V1 controller qualification invalidated before subject launch

Recorded UTC: `2026-08-02T20:17:12Z`  
Disposition: `CONTROL_PLANE_DEFECT`  
Subject/provider calls made before discovery: `0`

The v1 controller produced passing freeze and deterministic-canary receipts, but a subsequent independent read-only audit found defects that make those receipts insufficient for pilot/fleet qualification. The receipts and audited controller snapshot remain preserved as evidence; they are not relabeled, deleted, or reused by V2.

Affected v1 receipts include:

- `receipts/verify_freeze/verify_freeze-20260802T201357Z-5f73bc62.json`
- `receipts/deterministic_canary/deterministic_canary-20260802T201357Z-dd9d87e0.json`

Material defects:

1. Later phases could reuse passing prerequisite receipts from an older freeze.
2. The freeze omitted the closed-world surface inventory, implementation-gated list, controller code, and route-canary contract.
3. Strict-automation dispatch simulation could fail open when mandatory intent, receipt, origin, or effective-identity objects were absent.
4. Offline rescoring did not preserve all exit, timeout, identity, and event-parse failures.
5. Effective identity extraction could accept requested/catalog metadata, while reasoning and hidden provider retries were not attested.
6. Oversized evidence could pass before trust/currentness checks.
7. Coverage/reducer checks missed duplicate assignments, identical duplicate IDs, unexpected IDs, empty/out-of-bounds manifests, and some prefix/suffix failures.
8. Semantic evidence and uncertainty scoring accepted under-constrained joins or supersets.
9. Route-canary receipt construction could drop model-selection authorization lineage.
10. Absolute-path redaction covered enumerated launch paths but not arbitrary local paths emitted by the adapter.

V2 corrects and adds negative fixtures for these failures before any route canary. The user-selected exact model matrix remains a separate prerequisite.
