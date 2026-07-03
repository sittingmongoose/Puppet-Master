# Shard 034: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/FileSafe.md`

Source lines: L13247-L13353

Source SHA256: `a185b2e6e46438574d986a2ac598729ef9751e85d3b0d737daf728434bf3f6f6`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### F2-192 - Vision Bridge Image Source Safety

```yaml
plan_unit_id: F2-192
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: Vision bridge image source resolution may use chat/thread attachments, selected runtime artifacts/screenshots,
  FileSafe-allowed project files, clipboard images, and recent OS screenshots. Clipboard and recent OS screenshot
  support are MVP, not deferred, but PM must use explicit permissioned ingestion, visible source labeling, deterministic
  source precedence, user choice for ambiguous recent screenshots, redaction/sensitivity policy, and no hidden Desktop/Downloads
  scraping or FileSafe bypass.
gui_related: true
gui_classification_reason: Image source selection, clipboard, screenshots, and project-file access are user-visible
  safety surfaces.
depends_on:
- PS-121
unblocks:
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: image_source_policy_bypass
reasoning_tier: high
context_scope: vision_image_sources_filesafe
implementation_surfaces:
- Plans/FileSafe.md
- future image source resolver
node_compile_hint:
  mode: vision_image_source_safety
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0075
- pldg-20260626-001-feature-name:atom-0082
- pldg-20260626-001-feature-name:atom-0085
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- external:github.com/alfaoz/opencode-see-image@cde1615f6dfc9039c58da6813112ee53391b5b49
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/FileSafe.md
source_atom_ids:
- atom-0075
- atom-0082
- atom-0085
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- chat attachments
- runtime artifacts
- screenshots
- project files
- clipboard
- recent OS screenshots
- FileSafe
- 3. not deferred
- current-turn attachment
- selected artifact
- project file allowed by FileSafe
- clipboard image
- recent OS screenshot picker
- ambiguous
- hidden Desktop/Downloads scraping
- 'yes'
- sensitivity/redaction policy
- disclosure destination
- explicit user override
- redaction/omission details
- derived artifact manifest
- secrets
negative_constraints:
- Do not defer clipboard or recent OS screenshot support out of MVP.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default without PM-owned permission
  and ingestion rules.
- Do not bypass FileSafe or artifact access policy when resolving project images.
- Do not inline raw screenshots into prompts when artifact refs plus bounded summaries are required.
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default.
- Do not choose among ambiguous recent screenshots without user-visible selection or clear recency evidence.
- Do not bypass FileSafe or artifact permissions for project-file image sources.
- Do not silently send sensitive screenshots or images to another provider without policy evaluation.
- Do not claim redaction happened without recording redaction/omission metadata.
- Do not expose secret material in manifests, receipts, GUI previews, or exports.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/Prompt_Pipeline.md
- Plans/assistant-chat-design.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Permissions_System.md
```
