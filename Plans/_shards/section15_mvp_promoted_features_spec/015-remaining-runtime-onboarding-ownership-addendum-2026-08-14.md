# Shard 015: Remaining Runtime Onboarding Ownership Addendum (2026-08-14)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L8982-L9026

Source SHA256: `cddc39f6018cb3977d9b4e9548a521c5befbf8d24e634cced5730046cb3b622c`

---

## Remaining Runtime Onboarding Ownership Addendum (2026-08-14)

### SMPFS-146 - Three Flow Onboarding And Doctor Handoff

```yaml
plan_unit_id: SMPFS-146
unit_type: owner_boundary
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: >-
  Onboarding is three coordinated but non-duplicated flows: Product Onboarding
  is owned by Planning Wizard and Final GUI; Installation and Deployment is
  owned by SIR-003 plus Release Supply Chain and the relevant installer domain
  owner; Server Claim and Bootstrap is owned by SIR-013. Product Onboarding may
  launch or resume either owner flow but cannot own its state machine. Project
  Sync and Backbone is a separate downstream service used after or during
  onboarding, not a replacement fourth or third onboarding owner. This
  promoted-feature owner coordinates visible readiness and handoff only, while
  Doctor routing belongs to newtools and domain checks remain with their owners.
gui_related: true
gui_classification_reason: Defines onboarding flow selection, progress, readiness, blocked state, and owner-routed remediation presented to users.
depends_on: [PWIZ-017, SIR-003, SIR-013, RSC-010, PSB-001, N2-151]
unblocks: []
acceptance_criteria:
  - ONB-001 routes Product Onboarding, Installation/Deployment, and Server Claim/Bootstrap to three concrete state-machine owners; Product Onboarding may launch/resume but cannot absorb the other two.
  - Project Sync remains a separate downstream service and exposes no peer onboarding or sync engine.
  - ONB-004 and ONB-005 preserve Server-first readiness while WSL, containers, Kubernetes, SSH, and other environments remain optional exact identities with no silent fallback.
  - ONB-011 and ONB-012 use durable operation identity plus ObservableWork; a spinner or completed UI step is not lifecycle truth.
  - ONB-013 reports constrained/old-hardware reductions and unavailable capabilities rather than claiming a runtime performance pass.
  - Doctor findings route through N2-151 without this owner implementing probes or remediation.
validation_surfaces: [onboarding owner-routing fixtures, exact-topology and optional-environment negative fixtures]
risk_class: onboarding_parallel_owner_or_false_readiness
reasoning_tier: high
context_scope: onboarding_three_flow_boundary
implementation_surfaces: [Plans/Section15_MVP_Promoted_Features_Spec.md, Plans/Planning_Wizard.md, Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md, Plans/newtools.md]
node_compile_hint: {mode: onboarding_owner_boundary, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-001
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-004
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-005
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-011
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-012
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-013
negative_constraints: [Do not merge the three flows into one owner., Do not substitute Project Sync for Installation/Deployment., Do not infer readiness from reachability or UI completion., Do not claim old-hardware runtime evidence in this canon-only stage.]
```
