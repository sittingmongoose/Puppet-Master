# Shard 017: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Media_Generation_and_Capabilities.md`

Source lines: L6322-L6444

Source SHA256: `418bc32eb7b2528e2e8654f6573ff22898801fe0881483bd4b3c18cc9a4115a4`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### MGAC-099 - Vision Bridge Media Capability Eligibility

```yaml
plan_unit_id: MGAC-099
unit_type: requirement
status: accepted
owner_doc: Plans/Media_Generation_and_Capabilities.md
canonical_text: The PM-native vision bridge uses current route-specific media capability truth. Models with reliable
  native image input do not need bridge fallback; models without image input may use the PM vision_bridge / see_image
  capability when policy, permissions, and provider availability allow. Media input, image input, generated-media
  output, and image generation remain separate capabilities. OpenCode defaults such as opencode-go, minimax-m3,
  mimo-v2.5-free, OpenCode auth.json, OpenCode DB, Bun, or OpenCode CLI behavior are source-lineage only and not
  PM defaults.
gui_related: true
gui_classification_reason: Image input/media capability truth affects user-visible image/screenshot handling and
  model route availability.
depends_on:
- MS-116
unblocks:
- PP-055
- ATS-013
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: media_capability_route_drift
reasoning_tier: high
context_scope: vision_bridge_media_capability
implementation_surfaces:
- Plans/Media_Generation_and_Capabilities.md
- future provider/model capability matrix
node_compile_hint:
  mode: vision_media_capability_truth
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0069
- pldg-20260626-001-feature-name:atom-0072
- pldg-20260626-001-feature-name:atom-0074
- pldg-20260626-001-feature-name:atom-0087
- chat:opencode-see-image-request
- Plans/Provider_OpenCode.md
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- Plans/Media_Generation_and_Capabilities.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Models_System.md
source_atom_ids:
- atom-0069
- atom-0072
- atom-0074
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- opencode-see-image
- see_image
- models models without vision
- adopt it to PM
- image
- screenshot
- that is for Opencode
- OpenCode plugin APIs
- auth.json
- opencode.db
- Bun
- opencode run
- --dangerously-skip-permissions
- provider/model capability matrix
- project/account policy
- media_input
- image input
- support-state
- opencode-go
- mimo-v2.5-free
- 2. yes
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
- 'yes'
negative_constraints:
- Do not let non-vision models guess image contents when a bridge is available.
- Do not treat image input as image generation.
- Do not compile this requirement to canonical Plans without a future explicit compile request.
- Do not make OpenCode the owner of PM media tools.
- Do not use OpenCode provider capability reporting as a substitute for PM-native media capability records.
- Do not introduce a provider-specific dependency where a PM-native tool/capability can serve all provider routes.
- Do not hardcode OpenCode `opencode-go` or `mimo-v2.5-free` as PM's bridge defaults.
- Do not flatten route-specific media state into a single provider-level boolean.
- Do not clear a route as vision-capable without current provider/model capability evidence.
- Do not depend on OpenCode `auth.json`, OpenCode DB, Bun, or OpenCode CLI dependency for PM bridge routing.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/Permissions_System.md
```
