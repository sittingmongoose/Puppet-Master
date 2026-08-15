# Shard 037: Remaining Runtime Canon Closure Addendum (2026-08-14)

Source: `Plans/Models_System.md`

Source lines: L9520-L9547

Source SHA256: `fb10700922c0e0320613b1bfabc05fc1b63bbf142db41fe88df84c5700522805`

---

## Remaining Runtime Canon Closure Addendum (2026-08-14)

### MS-137 - Requested Effective Route And Capability Evidence Layers

```yaml
plan_unit_id: MS-137
unit_type: requirement
status: accepted
owner_doc: Plans/Models_System.md
canonical_text: Every provider dispatch preserves independently the requested provider/model/route/account binding, the effective binding, resolver evidence, and a typed reason for every difference including null-to-selected default resolution; capability support is layered evidence from catalog declaration, exact adapter/runtime observation, policy, installation/readiness, and request-time admission, and no one layer alone proves dispatchability.
gui_related: false
depends_on: [MS-121, MA-070, SIR-003, SIR-009]
unblocks: []
acceptance_criteria:
  - PROV-017 required bindings reject silent substitution; preferred and none use Multi-Account-owned fallback semantics with resolver evidence.
  - PROV-022 distinguishes declared, installed, authenticated, runtime-observed, policy-available, and request-admitted capability evidence.
  - Unknown, stale, conflicting, or partial evidence never becomes supported or ready by inference.
validation_surfaces: [requested-effective route fixtures, capability evidence-layer negative fixtures]
risk_class: provider_route_or_capability_false_readiness
reasoning_tier: high
context_scope: provider_route_and_capability_evidence
implementation_surfaces: [Plans/Models_System.md, Plans/Multi-Account.md, Plans/Shared_Integration_Runtime.md]
node_compile_hint: {mode: provider_route_capability_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-017
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#PROV-022
negative_constraints: [Do not silently substitute a required route or account., Do not infer readiness from one evidence layer.]
```
