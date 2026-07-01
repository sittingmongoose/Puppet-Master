# Shard 006: Ledger Compile Addendum - pldg-20260630-001-feature-intake

Source: `Plans/FinalGUISpec.md`

Source lines: L221-L313

Source SHA256: `72257af72eac43272b9727adffdac3668a6f5bbdd67a43d2a1eb36df9c6c9ac3`

---

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles native Docker/Hosts GUI obligations from bootstrap ledger `pldg-20260630-001-feature-intake`. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, production build tasks, generated governance artifacts, or a governance seal.

### F3-410 - Docker/Hosts Native Page And Host Lab IA

```yaml
plan_unit_id: F3-410
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Puppet Master exposes containerized hosts through a native Rust + Slint Docker/Hosts routed primary-content page/lab for
  expanded Docker and Host Lab details, reached from Docker Manager, command palette routes, Assistant Chat, Orchestrator,
  Run Graph, Automated Testing, and Runtime Artifacts links. Docker Manager remains the canonical operational owner,
  side-panel command namespace, and Activity Bar side-panel owner through docker_manager; Docker/Hosts is not a separate
  Coasts website, React/Vite transplant, new Activity Bar slot, PMConcept.html code copy, or separate Unraid shell panel.
  The page includes Overview, Profiles, Instances, Runtime Matrix, Host Lab Sessions, Access & Ports, Receipts & Artifacts,
  and Settings views, plus profile editor fields, instance identity/status/log/access/receipt layout, blocked/degraded
  cards, cleanup recommendations, and Open App/Open Container access affordances driven by port_access_record confidence,
  health, staleness, and override state.
gui_related: true
gui_classification_reason: This PlanUnit defines a native GUI page, views, layout, visible cards, and user-visible command affordances.
depends_on: [CRAU-092, CV-303, SP-226, RAP-042, UCC-105]
unblocks: [ACD-430, OP-028, RGV-015]
acceptance_criteria:
  - Docker/Hosts is reachable as a routed primary-content Slint page/lab from Docker Manager and cross-surface links.
  - docker_manager remains the Activity Bar side-panel owner and command namespace.
  - Overview, Profiles, Instances, Runtime Matrix, Host Lab Sessions, Access & Ports, Receipts & Artifacts, and Settings views are represented as expected GUI subviews.
  - Profile editing exposes runtime family, compose files, Dockerfile/build context/Bake target, services/profiles/env refs, ports, health checks, mount policy, network/egress policy, secret ref policy, and cleanup/retention policy.
  - Instance detail exposes host_instance_id, host_capability_ref, runtime facts, status timeline, logs/health/stats, access URLs, assignments, receipts, and cleanup/retain actions.
  - Empty, setup, blocked, degraded, stale, unsupported, and disabled-until-explicit-approval states remain visible.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Slint Docker/Hosts page IA review
risk_class: docker_hosts_gui_density_and_owner_drift
reasoning_tier: high
context_scope: docker_hosts_native_page_ia
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - future native Rust + Slint Docker/Hosts page
node_compile_hint:
  mode: docker_hosts_native_page_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0007
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0011
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0035
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0042
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0070
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#docker_hosts_gui_ia
  - Concepts/PMConcept.html
source_atom_ids: [atom-0007, atom-0011, atom-0015, atom-0035, atom-0036, atom-0042, atom-0046, atom-0051, atom-0061, atom-0065, atom-0070, atom-0075, atom-0080]
preserved_exact_tokens:
  - "native gui"
  - "instead of a seperate website"
  - "Rust + Slint"
  - "Docker/Hosts"
  - "routed primary-content page"
  - "docker_manager"
  - "Activity Bar side-panel owner"
  - "Overview"
  - "Profiles"
  - "Instances"
  - "Runtime Matrix"
  - "Host Lab Sessions"
  - "Access & Ports"
  - "Receipts & Artifacts"
  - "Settings"
  - "Open App"
  - "Open Container"
  - "PMConcept.html"
negative_constraints:
  - Do not create a separate Coasts website.
  - Do not copy PMConcept.html HTML/CSS/demo code.
  - Do not create a new Activity Bar slot for Docker/Hosts.
  - Do not hide broad runtime detail in the old small Docker side-panel only.
  - Do not create a separate top-level Unraid shell panel.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Runtime_Artifacts_Panel.md
```
