# Shard 046: GUI test-build observability — 2026-10-02 (DL-139)

Source: `Plans/Automated_Testing_System.md`

Source lines: L5838-L5895

Source SHA256: `75d510a1180d336b8b110f58b73eff1231cf2c483bae2f99e2d9d7915d54e1ea`

---

## GUI test-build observability — 2026-10-02 (DL-139)

Development and test builds of both the Slint desktop and the Leptos web GUI let test agents read what the interface is doing, so an agent can tell a wrong picture apart from the right picture of the wrong state (DL-139). This surface exists only in development and test builds; production builds never include it.

### ATS-067 - GUI Test-Build Observability

```yaml
plan_unit_id: ATS-067
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Test-build observability: development and test builds of both the Slint desktop and the Leptos web GUI
  (DL-139, F3-583) expose to test agents the active screen, the focused control, the text selection, the scroll
  position, every dispatched command with its result, frame timing, redraw activity, memory growth, and the
  requested and effective renderer with any fallback reason (F3-033). Production builds of either interface never
  include this surface, and no production configuration can enable it.
gui_related: true
gui_classification_reason: "Defines what test agents can observe of the visible desktop and web interfaces in development and test builds."
split_recommended: false
depends_on: [DL-139, ATS-023, F3-033, F3-583]
unblocks: []
acceptance_criteria:
  - "In a development or test build of each interface, a test agent can read every listed item for the current window or page."
  - "The renderer report names the requested renderer, the effective renderer and the fallback reason, including a software GPU adapter routed to the Skia CPU raster."
  - "A production build of either interface contains no part of this surface, and no configuration enables it there."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: test_observability_gap_or_production_leak
reasoning_tier: high
context_scope: gui_stack_skia_leptos
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_platform_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-139 (owner answer on the critique, 2026-10-01)"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/gui-stack-20261001/CRITIQUE-RESPONSE-20261001.md, SHA-256 76047abe87b2488f52b3e6df94160aa9da09ec1883d3a91876b20d3e1741a1da"
preserved_exact_tokens:
  - "Test-build observability"
  - "requested and effective renderer"
  - "fallback reason"
negative_constraints:
  - "Do not ship this surface in production builds or let a production configuration enable it."
  - "Do not treat observability output by itself as runtime, visual or performance acceptance."
owner_boundary_notes:
  - "ATS-023's production-configuration exception for dev/test controls does not extend to this surface."
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-139, ContractName:Plans/FinalGUISpec.md#F3-033, ContractName:Plans/FinalGUISpec.md#F3-583, ContractName:Plans/Automated_Testing_System.md#ATS-023
