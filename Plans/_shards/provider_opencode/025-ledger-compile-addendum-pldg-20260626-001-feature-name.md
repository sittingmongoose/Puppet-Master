# Shard 025: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Provider_OpenCode.md`

Source lines: L3481-L3583

Source SHA256: `da910664ca195b0eb4ff2ca5c5e370531f7bf020d0f191d563619afce1bfe50e`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### PO-049 - opencode-see-image Source Lineage Boundary

```yaml
plan_unit_id: PO-049
unit_type: constraint
status: accepted
owner_doc: Plans/Provider_OpenCode.md
canonical_text: 'https://github.com/alfaoz/opencode-see-image is preserved as source-lineage for the PM-native vision
  bridge shape: a see_image tool, prompt guidance to avoid guessing, image/screenshot resolution, and a vision-capable
  route returning text. PM must not inherit OpenCode-specific plugin APIs, auth.json, SQLite DB layout, Bun runtime,
  opencode run, --dangerously-skip-permissions behavior, or hardcoded opencode-go/minimax-m3/mimo-v2.5-free defaults
  as product requirements.'
gui_related: false
gui_classification_reason: Provider lineage and dependency boundaries are provider integration semantics, not GUI.
depends_on:
- T-165
unblocks:
- MGAC-099
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: opencode_dependency_leak
reasoning_tier: standard
context_scope: opencode_see_image_lineage
implementation_surfaces:
- Plans/Provider_OpenCode.md
- future provider docs
node_compile_hint:
  mode: source_lineage_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0070
- pldg-20260626-001-feature-name:atom-0071
- pldg-20260626-001-feature-name:atom-0072
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- local:/tmp/pm-ext-opencode-see-image
- chat:opencode-see-image-request
- Plans/Provider_OpenCode.md
source_atom_ids:
- atom-0070
- atom-0071
- atom-0072
decision_refs:
- dec-0014
preserved_exact_tokens:
- https://github.com/alfaoz/opencode-see-image
- cde1615f6dfc9039c58da6813112ee53391b5b49
- 1.1.0
- MIT
- bun
- /tmp/pm-ext-opencode-see-image
- see_image
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
- adopt it to PM
- that is for Opencode
- OpenCode plugin APIs
- auth.json
- opencode.db
- Bun
- opencode run
- --dangerously-skip-permissions
negative_constraints:
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
owner_hints:
- Plans/Media_Generation_and_Capabilities.md
- Plans/Provider_OpenCode.md
- Plans/Tools.md
- Plans/Prompt_Pipeline.md
- Plans/Models_System.md
- Plans/MCP_Integration.md
compatibility_only_notes:
- Concept/source-lineage references are preserved for routing and audit only; they do not make external plugins
  or PMConcept.html canonical implementation source.
```
