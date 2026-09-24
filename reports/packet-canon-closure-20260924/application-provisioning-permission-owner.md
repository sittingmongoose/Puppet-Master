# Application provisioning permission owner clarification

Base: `833e583b46b03dc80b18f91bea8aba64e649077f`.

The accepted demand policy supports application-scoped capability provisioning,
but the prior Permissions applicability sentence described every mutation-capable
attempt as Project-bound. PS-133 now distinguishes the actual provisioning
operation's Permissions-issued decision from the immutable Project/attempt/node
snapshot required by an originating executor/provider attempt.

Application scope does not manufacture Project or NamedPlan identity. The exact
`cmd.capability.ensure` request, effect/target, actor, current policy, approval and
authority generations bind the operation decision. Demand, Auto/On, ownership,
readiness, a lease, provider consent and a recorded decision cannot substitute for
one another. Audit admission, FileSafe, storage mode, provenance, cost/license,
elevation/network and provider-first acquisition remain independent gates.
Resuming originating work still requires its own applicable current admission.

Only the associated owner prose and PS-133 change semantically. PS-076, PS-132,
PS-134, the existing immutable snapshot custody, all audit/replay/recovery prose,
all old acceptance criteria, and other PlanUnits remain unchanged. Two acceptance
criteria and four source references were added; there are no new dependency edges.

## Verification

Independent form-driven review passed with no findings. Actual applied owner
SHA-256: `b3fb90ae8e5d95a097da1614c78e2a2edf2e36e90acc595326d3ec6457731f73`.
All 18 applied-delta checks passed, including exact reviewed-candidate equality,
whole-index semantic comparison, unchanged unrelated index rows, shard checking
(99 documents, 2,733 shards), index validation (6,721 units, 26,306 criteria), and
`git diff --check`.

Raw evidence root:
`/mnt/Cursor/PuppetMaster-Evidence/packet-audits/packet-canon-closure-20260924-Ol2rqUdF/`.
Paths below are relative to that root and paired with SHA-256:

- `settings_dependencies/permissions-application-ensure-probes.json` — `1e4b52fb890eb6fea6261e9ebee0ee947ea803fa46357612cb3c02cb7bfec364`.
- `settings_dependencies/permissions-ensure-owner-prose.patch` — `909ed93794bc7151190861e75871d23496e645b08fb7f3c13a100e2fd6404110`.
- `settings_dependencies/permissions-ensure-owner-prose-receipt.json` — `4dd9ac04a06b84642c4983b14ee19d14af76de14f24200e47bebf311e3787f95`.
- `server_forge_backup/permissions-ensure-owner-independent-review-001.json` — `dbe4475d639949a5be497945177bb8740455bd5f4e17df45f723ca04e94d3a2a`.
- `permissions-ensure-owner-applied-002.json` — `1ec40b72e2315a223b4ec386bcd5143ddfec56d13b9b9a87476aab1c14042b49`.

The first applied-delta attempt was started before index generation completed and
read the old index; its three expected missing-delta failures are retained in
`permissions-ensure-owner-applied-001.json`, SHA-256
`11c8e286834fcd5d4bd0080a610dc89438679547c7d1f2400365ab1b95a1b663`.
Attempt 002 ran after generation was confirmed complete. No check or baseline
was weakened to obtain that pass.

## Remaining boundaries

This is the owner-prose prerequisite, not materialized permission issuance,
provisioning companions, durable audit proof, installation execution, GUI work,
or complete packet closure. Machine schemas, command enrollment, storage families,
Spec Lock, governance bindings and the landing baseline were not changed.
Required derived shards/index were regenerated; readiness remains
`blocked_runtime_certification_incomplete`. No aggregate landing comparison,
main push, exception claim or governance reseal is implied. The designated owner
will need to reseal this changed Permissions source at the proper seal phase.
