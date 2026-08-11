# V3 method qualification invalidated before subject launch

Recorded UTC: `2026-08-02T20:50:00Z`  
Disposition: `CONTROL_PLANE_DEFECT`  
Subject/provider calls made before discovery: `0`

V3 produced a passing exact-input freeze and a 64/64 deterministic receipt. A separate read-only preregistration audit then showed that the deterministic suite validated its own hidden oracle rather than a fully fair subject-visible contract. The V3 controller, README, freeze receipt, deterministic receipt, and source artifacts remain immutable historical evidence and are not launch prerequisites.

Affected V3 receipts:

- `receipts/verify_freeze/verify_freeze-20260802T204813Z-9615a5eb.json`
- `receipts/deterministic_canary/deterministic_canary-20260802T204816Z-861266a9.json`

Material defect families:

1. Exact claim IDs, uncertainty IDs, uncertainty reason codes, and `NEED-*` identifiers were scored but not exposed in the rendered subject packet. A semantically correct response therefore could fail for not guessing hidden oracle tokens.
2. Response terminal meanings and the response-side `forbidden_actions` field were ambiguous. The latter collided in name with the packet's prohibition list, while the oracle expected an empty list of violations.
3. Requirement disposition semantics mixed evidence-state assertions with response-behavior obligations without an explicit evaluation target. The schema also required a per-requirement reason code that no case oracle bound and no visible packet vocabulary defined.
4. No semantic case exercised a legitimate `completed` / `completion_claim=true` outcome, leaving an always-block response strategy untested.
5. The route canary required only provider/model matching even though V3's simulated dispatch contract required provider/model/account/route co-binding.
6. Regression coverage remained incomplete for multi-ID uncertainty reason binding, all typed numeric evidence fields, arbitrary closed-origin values, and isolated missing intent/receipt/effective-identity fields. Several identity fixtures were confounded by simultaneously missing unrelated admission inputs.
7. No ordered primary-terminal precedence was frozen for observations with multiple failure classes, and the route-canary tool rule did not distinguish a subject tool attempt from controller tool-isolation or capture failure.

V4 must expose value-free output-slot identifiers and terminal meanings to subjects, distinguish evaluation targets and forbidden-action violations, add a positive semantic control, freeze primary-terminal precedence, isolate binding mutations, and expand the deterministic matrix before any model-selection release or route canary.
