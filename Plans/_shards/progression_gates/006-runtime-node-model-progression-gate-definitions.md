# Shard 006: Runtime node-model progression gate definitions

Source: `Plans/Progression_Gates.md`

Source lines: L185-L219

Source SHA256: `8f884b510c35f1f7bceb11f6f55804f46405d0a8b5c37870a464e2adf399fb33`

---

## Runtime node-model progression gate definitions

Legacy tier-level gate definitions are replaced by package-, seam-, and lane-scoped progression gates. These gates inherit the existing blocking, approval, and timeout/remediation behavior patterns already defined by the progression system; only the execution entities change from tiers to node-model packages, seams, and lanes.

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md

### `package_complete_gate`

Pass condition:
- all nodes in the package are in a terminal resolved state: `completed`, `skipped`, or `failed` with remediation recorded
- the gate prevents the package from reporting completion until every constituent node is resolved

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/human-in-the-loop.md

### `seam_complete_gate`

Pass condition:
- the source package is complete
- target package prerequisites are resolved
- cross-package transition readiness validates prerequisite resolution, context handoff preparation, and contract compatibility
- feature-seam overseer evidence validates cross-package coherence, integration correctness across package boundaries, style/architecture consistency, seam-level "did we actually build the intended thing" judgment, and authority to withhold seam completion when integration quality is weak even if constituent packages passed

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

### `lane_complete_gate`

Pass condition:
- every package assigned to the lane satisfies `package_complete_gate` before the lane reports `done`
- lane completion remains blocked until all assigned packages are resolved

ContractRef: Primitive:Gate, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md

---

<a id="GATE-001"></a>
