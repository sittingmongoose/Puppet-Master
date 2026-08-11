# Agent packet restriction testing — terminal preflight closeout

Closed UTC: `2026-08-02`

Status: `STOPPED_BEFORE_SUBJECT_LAUNCH`

## Outcome

The task stopped before any authentication/configuration inspection, provider launch, route canary, pilot, semantic fleet, reviewer call, repair call, or subject-model call. Jared's model-selection hold remained effective throughout.

Current call counts are:

- route canary: `0`
- pilot: `0`
- fleet: `0`
- total model/provider calls: `0`

No empirical model-performance or production-enforcement conclusion is supported.

## Durable work completed

- Dirty-checkout read/write boundary and accepted restriction contract were recorded.
- A source-referenced closed-world inventory was constructed with 54 surfaces: 51 blocked on production implementation, 2 isolated contract simulations, and 1 currently runnable deterministic surface.
- The corrected inventory draft is `inventory/surfaces.v2.json`, SHA-256 `6cc6172285e6df2dccb1c69271f27ca0ca5cbbca227bf207279464e4bf9cd06c`.
- The implementation-gated list now contains 24 integration tests and explicitly covers every blocked surface. It is `cases/implementation_gated.v2.json`, SHA-256 `146537b54ce876705b380decb438badccb7f8928840f387d53d26d485eb2f867`.
- A fixed-profile semantic draft contains 7 cases, 33 requirements, 25 claim slots, and 8 uncertainty slots: `cases/semantic_cases.v4.json`, SHA-256 `272799b3451a72c776b81cdee55b44c8a2e444b64b631928499b71ea34bfb588`.
- A deterministic draft contains 222 preregistered checks: 67 main fixtures, 83 generated subcases, and 72 scorer checks. It is `fixtures/deterministic_cases.v4.json`, SHA-256 `fe6b99f15c8c684dff3821d1ea325fd0e93f3c312f4cb54fb9c4b741347025e8`.
- The exact matrix remains pending by user direction. `inventory/model_matrix_status.v4.json` records the required `L01`–`L08` and `H01`–`H02` shape and zero calls.

## Preserved invalid qualifications

- V1, V2, and V3 controller qualifications remain preserved historical failures and do not authorize launch.
- The V3 deterministic run was 64/64, but the method/oracle audit invalidated it; it is not evidence that V4 or production enforcement works.
- V4 never reached a clean final freeze or controller qualification.

## V4 control-plane defect

The coordinator mistakenly created four surface-ID scratch lists under `/tmp`. This violated the exclusive write boundary even though the files contain no secrets and no repository/product state was changed. The full immutable record is `charter/control_plane_defect-0004-v4-boundary-invalid.md`, SHA-256 `5554fb8560572786614476c997ba66102bfdb78b3e600ee25ee7d4323b813ae4`.

The four files were left untouched because deleting or moving them would be another outside-root mutation without explicit authorization:

- `/tmp/apr_blocked_ids`
- `/tmp/apr_ig_ids`
- `/tmp/apr_all_ids`
- `/tmp/apr_dim_ids`

V4 therefore cannot be represented as clean or launch-qualified. A future continuation must open a new method version, copy only reviewed current artifacts forward, include the defect record in the freeze, and keep every scratch artifact under the exclusive root.

## Exact blockers to empirical testing

1. Jared has not yet supplied the exact eight-low/two-high model roster.
2. No immutable user-authorization receipt binds an exact provider/model/account/route/reasoning tuple for each slot.
3. No corrected post-V4 method has been frozen.
4. No controller/scorer/capture qualification is bound to such a final matrix-inclusive freeze.
5. No ten-route nonsemantic canary has run.

Checkpoint 1 was not sent because its contract requires the exact frozen ten-model matrix. Checkpoint 2 was not sent because no pilot or fleet result exists.

## Recommendation

- Treat the inventory, cases, and fixtures as preregistration drafts and useful handoff material, not test results.
- Do not infer weak-model success, high-model success, Packet Admission/FileSafe enforcement, or production readiness.
- If the experiment resumes, start a new corrected method version, obtain Jared's exact `8 low + 2 high` roster, bind effective route identity, qualify the deterministic control plane, then run the ten route canaries before any semantic pilot.
- Keep all 51 production-dependent surfaces `IMPLEMENTATION_GATED` until executable product integration evidence exists.
