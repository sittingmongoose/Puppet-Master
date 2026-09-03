# Shard 030: Remaining Runtime Doctor Ownership Addendum (2026-08-14)

Source: `Plans/newtools.md`

Source lines: L8680-L8717

Source SHA256: `ab70dbc2e26cad60cd86bb6344f3244b1b7a901e6a04e3b937ede665d1c3e7ec`

---

## Remaining Runtime Doctor Ownership Addendum (2026-08-14)

### N2-151 - Doctor Registry Router And Probe Discipline

```yaml
plan_unit_id: N2-151
unit_type: owner_boundary
status: accepted
owner_doc: Plans/newtools.md
canonical_text: Doctor owns one registry and router for stable check IDs, bounded probe scheduling, freshness/cache policy, normalized findings, evidence refs, and remediation command routing. Domain owners retain probe truth and mutations; Doctor cannot become a second topology, sync, provider, browser, testing, source-control, security, governance, installation, or runtime lifecycle owner.
gui_related: true
gui_classification_reason: Doctor check state, freshness, evidence, severity, and remediation routing are presented to users.
depends_on: [SIR-003, SIR-004, SIR-007, PSB-001, SMPFS-143]
unblocks: []
acceptance_criteria:
  - ONB-018 routes Server identity, reachability, access, and claim health to their exact owners.
  - ONB-019 routes Vault, source, topology, environment, and Project Sync currentness without treating paths or transport as proof.
  - ONB-020 reports Shared Integration Runtime connection, domain sync, governor, lease, work, readiness, and recovery projections without owning them.
  - ONB-022 checks ordinary PM-native Browser Program and testing/capture capability while protected AuthBrowserSession exposes only redacted lifecycle/denial metadata and no PM Playwright capability.
  - ONB-023 routes source-control and worktree findings to their owners; ONB-024 routes permissions, FileSafe, secret, supply-chain, storage, migration, and governance findings without self-authorizing repair.
  - ONB-025 bounds probes by exact target, timeout, cache/currentness, resource admission, redaction, and no-side-effect policy; ONB-026 invokes only preregistered owner commands with preview/permission/disabled/recovery evidence.
validation_surfaces: [Doctor registry schema fixtures, owner-routing and protected-session negative fixtures]
risk_class: doctor_parallel_owner_or_probe_side_effect
reasoning_tier: high
context_scope: doctor_registry_and_router
implementation_surfaces: [Plans/newtools.md, Plans/Shared_Integration_Runtime.md, Plans/Project_Sync_and_Backbone.md]
node_compile_hint: {mode: doctor_registry_router_contract, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-018
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-019
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-020
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-022
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-023
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-024
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-025
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/ACCOUNTABILITY_MATRIX.json#ONB-026
negative_constraints: [Do not let Doctor own domain truth., Do not perform unbounded or mutating probes., Do not expose protected authentication content., Do not invent remediation command IDs.]
```
