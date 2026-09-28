# Bounded offline integration review

2026-09-28. Independent development-helper read of the parent integration;
not a formal semantic grade, native execution qualification, or framework security
audit. No native/provider/model/account call, actual D1 assessment, rescore,
approval file, or source code edit occurred during this review.

Read `CRITERION.md`, `NEXT_TRIAL.md`, `tools/prep_plan.py`,
`tools/research_store.py`, `tools/evaluator_dispatch.py`, and the relevant dispatch
regressions. The reviewed documents correctly distinguish faithfully rendered
latest content from source-supported truth, all-field fidelity from synthetic
task expectations, and fidelity from complete structural delivery. Source_fit,
condition and non_finding have no exemption; legitimate old-source provenance is
preserved exactly; no global marker scan or token scrub is proposed. Both original
arms must satisfy completion and fidelity; a failed pair is retained in accounting
and skipped rather than silently repaired, replaced, singly graded, or assigned
semantic zero. Time, response, slot, phase and Store capacities remain explicit,
with 64 acknowledged requests including invalid attempts/revisions and 32768 bytes
per complete payload. Native failed/vanished writes remain trace work, not inferred
zero from file inventory.

Two synthetic read-only admission probes initially found narrow issues in the
earlier `prep_plan.py` version (SHA-256
`8939688c90e472966bcb2c553837b9c45bfc4f3cc233854d3bc2f6453a1bdb36`):

1. Swapping control/maintained `report_kind` values still passes eligibility because
   either known carrier kind is accepted for either original slot.
2. A control report just above 2 MiB still passes eligibility because its generic
   report cap is 4 MiB, whereas the trial's model-authored control-file cap is 1 MiB.

Both findings are closed in the re-inspected parent fix. Eligibility now requires
authored_current for original control slots, host_current for original maintained
slots, and a control current-report ceiling of 1 MiB (maintained host report:
4 MiB). The original synthetic probes now both return false. No native-cap bypass
was exercised: the original size issue also had a documented upstream trusted-host
inventory boundary. This review made no source edits.

The added read-only `check_output_inventory` was inspected: it counts all retained
regular model-authored files/bytes, rejects undeclared maintained paths and linked
outputs, checks per-file bounds and required control artifacts, and reports failures
without trimming bytes. The final trial text expressly requires its pass before
the trusted structural_complete flag can be true. Four targeted parent regressions ran unchanged
and passed: exact carrier/effective control capacity, aggregate retained byte
capacity, retained file-count/invalid maintained paths/required control artifacts,
and oversized payload retention. No remaining material policy/code gap was found
within this bounded review scope.

Five selected existing dispatch regressions ran unchanged with mocked process/native
boundaries and passed: actual parent-policy rejection of failed/wrong pairs and
changed report hashes; changed evaluator caps refused; original continuation
outcomes allowing the other assignment; callback exceptions consuming/terminalizing
their slot; and missing/invalid required semantic outputs retaining incomplete
outcomes. This is bounded composition evidence, not paid evaluation evidence.
These five ran before the exact carrier-kind tightening. The dispatch test fixture
then needed its maintained report_kind corrected to host_current. This follow-up
is closed: the final fixture was read and now labels maintained slots host_current
and control slots authored_current. The evaluator development helper reports all
22 dispatcher tests passed after the correction; the parent reports its full 58-test
suite and published 58-test reproduction passed. Those complete suites were not
independently rerun by this helper, and these are reported outcomes rather than an
extra independent reproduction. The final eligibility code also refuses non-string
assignment/slot identities before set membership; this narrow malformed-metadata
change was read, with no change to the semantic admission distinctions.

The operator binding remains material: trusted structural flags must include final
Store/C2 results and inventory/native checks; all admitted candidates must be
terminal with frozen output identities; stable run-root/phase state and actual
authorization must be supplied truthfully. The glue binds live authorization,
phase time/freeze, durable exclusive evaluator slots, exact staged first-view hashes,
saved composed input and required output presence. It does not independently
reconstruct the entire candidate schedule or establish research semantics. No
full framework/security audit was attempted.

Inspected identities (relative to i2-prep):

| Path | SHA-256 |
| --- | --- |
| CRITERION.md | 3ce2d0f13d325c657cd8bfa16b0eb56752f65409d621284132b51a29a1ef2192 |
| NEXT_TRIAL.md | 79c8913efa89e83f721d05dd1412d66184f4bf9fe397e78fd4a31e38168b88ac |
| tools/prep_plan.py | cda8a5eb39c17622e328fa1d63d639c1b409d18af9f1d356eb827beb5673df79 |
| tools/research_store.py | 8cba600b240cddb6951aa600146e3b0ccc8d4d1ffcd7e90bedc5f99378b05762 |
| tools/evaluator_dispatch.py | f01a7501705361c4cfe5d79864e159fa8c19a95a06aecd4af7b9bb73fed75661 |
| tools/test_evaluator_dispatch.py | 4943bcd4584dab235802b887e2940e4fb22e76462b45300f9761690315837e4f |
