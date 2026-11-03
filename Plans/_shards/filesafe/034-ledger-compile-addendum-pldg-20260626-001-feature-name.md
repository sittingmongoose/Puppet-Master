# Shard 034: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/FileSafe.md`

Source lines: L13754-L13864

Source SHA256: `2d6da9a9eae44820501a3ab3b65d326476249c557a85e7d584e03761f54f7ce2`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### F2-192 - Vision Bridge Image Source Safety

```yaml
plan_unit_id: F2-192
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: Vision sources remain attachments, selected artifacts/screenshots, FileSafe-allowed Project
  files and explicitly admitted application files, clipboard and recent OS screenshots. Explicit ingestion,
  source labels, deterministic precedence, ambiguous-source choice, sensitivity/redaction and provider disclosure
  remain. Computer use adds no hidden Desktop/Downloads scan, protected-auth access, screenshot retention or
  FileSafe bypass; PS-121 and PS-145 govern each actual target and transmission.
gui_related: true
gui_classification_reason: Approval, scope, provenance or action feedback is visible on the owning GUI surface.
depends_on:
- PS-121
- PS-145
- F2-213
unblocks:
- ACD-425
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build
  tasks are created by this compile.
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
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards N6/N10
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
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
- Do not scrape arbitrary Desktop/Downloads/recent screenshot locations as a hidden default without PM-owned
  permission and ingestion rules.
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
