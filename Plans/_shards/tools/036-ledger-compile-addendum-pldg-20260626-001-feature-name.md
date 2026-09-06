# Shard 036: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Tools.md`

Source lines: L11451-L11620

Source SHA256: `f184b9325f823a984b7eaf731ec462d3716de09e767f6480d03ec145027175db`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### T-165 - PM Native Vision Bridge Tool Contract

```yaml
plan_unit_id: T-165
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: PM exposes a native vision_bridge / see_image tool or capability for non-vision models. It automatically
  runs when the selected model lacks image input and can be manually rerun when the user or model needs a fresh
  image description. The tool adapts the opencode-see-image pattern, including tool invocation and never-guess guidance,
  but does not install, vendor, or depend on the OpenCode plugin, OpenCode provider defaults, OpenCode auth/database/CLI
  surfaces, Bun, or dangerous OpenCode permission flags. Failures are explicit and fail closed rather than fabricating
  image contents.
gui_related: true
gui_classification_reason: The tool processes images/screenshots and exposes user-visible fallback and degraded
  states.
depends_on:
- MGAC-099
- MS-116
- PP-055
- PS-121
unblocks:
- RAP-035
- ACD-425
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
risk_class: vision_bridge_tool_drift
reasoning_tier: high
context_scope: vision_bridge_tool_contract
implementation_surfaces:
- Plans/Tools.md
- future vision_bridge tool
- future see_image tool
node_compile_hint:
  mode: vision_bridge_tool_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0069
- pldg-20260626-001-feature-name:atom-0070
- pldg-20260626-001-feature-name:atom-0071
- pldg-20260626-001-feature-name:atom-0072
- pldg-20260626-001-feature-name:atom-0073
- pldg-20260626-001-feature-name:atom-0081
- pldg-20260626-001-feature-name:atom-0086
- chat:opencode-see-image-request
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- local:/tmp/pm-ext-opencode-see-image
- Plans/Provider_OpenCode.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Prompt_Pipeline.md
- Plans/FinalGUISpec.md
source_atom_ids:
- atom-0069
- atom-0070
- atom-0071
- atom-0072
- atom-0073
- atom-0081
- atom-0086
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
- https://github.com/alfaoz/opencode-see-image
- cde1615f6dfc9039c58da6813112ee53391b5b49
- 1.1.0
- MIT
- bun
- /tmp/pm-ext-opencode-see-image
- experimental.chat.system.transform
- OpenCode SQLite
- part
- screenshotSearchDirs
- SEE_IMAGE_MODEL
- SEE_IMAGE_PROVIDER
- minimax-m3
- opencode-go
- mimo-v2.5-free
- never guess image contents
- that is for Opencode
- OpenCode plugin APIs
- auth.json
- opencode.db
- Bun
- opencode run
- --dangerously-skip-permissions
- vision_bridge
- image input
- automatically
- manually rerun
- 1. yes
- permission denied
- no eligible vision route
- provider unavailable
- auth expired
- timeout
- unsupported/corrupt/too-large image
- missing file/artifact
- empty clipboard
- ambiguous recent screenshot
- redaction blocked
- 'yes'
- structured prompt/output contract
- bounded question/task
- uncertainty
- notable text/OCR
- limitations
- safety/redaction notes
- source refs
- not raw image bytes
negative_constraints:
- Do not let non-vision models guess image contents when a bridge is available.
- Do not treat image input as image generation.
- Do not compile this requirement to canonical Plans without a future explicit compile request.
- Do not vendor or import the external repo into PM as canonical code during this ledger-only planning thread.
- Do not assume the repo's OpenCode-specific runtime dependencies are PM requirements.
- Do not claim local selftests passed because `bun` was unavailable.
- Do not copy OpenCode's SQLite/session model as PM's source of truth.
- Do not hardcode `opencode-go`, `minimax-m3`, or `mimo-v2.5-free` as PM defaults without an explicit provider-routing
  decision.
- Do not carry over OpenCode-specific prompt injection unchanged.
- Do not make OpenCode the owner of PM media tools.
- Do not use OpenCode provider capability reporting as a substitute for PM-native media capability records.
- Do not introduce a provider-specific dependency where a PM-native tool/capability can serve all provider routes.
- Do not force every model route through the bridge when the active model already has reliable native image input.
- Do not hide from the user that derived visual context came from a separate model/tool route.
- Do not let the non-vision model fabricate visual details if bridge execution fails or is denied.
- Do not let the non-vision model infer or guess image contents after bridge failure.
- Do not serialize failed, revoked, blocked, expired, or omitted image artifacts as successful prompt content.
- Do not show a generic failure when PM can provide a concrete reason code and next action.
- Do not pass raw image bytes into non-vision model context when artifact refs plus bounded derived text are the
  contract.
- Do not omit uncertainty or limitations from bridge output when the image is ambiguous or low-confidence.
- Do not let image text/OCR become hidden, unsourced prompt material.
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Models_System.md
- Plans/Prompt_Pipeline.md
- Plans/Tools.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FinalGUISpec.md
- Plans/Provider_OpenCode.md
- Plans/MCP_Integration.md
- Plans/UI_Command_Catalog.md
- Plans/assistant-chat-design.md
- Plans/Contracts_V0.md
```
