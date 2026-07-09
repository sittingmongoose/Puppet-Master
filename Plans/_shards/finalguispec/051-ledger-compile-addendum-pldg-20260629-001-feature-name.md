# Shard 051: Ledger Compile Addendum - pldg-20260629-001-feature-name

Source: `Plans/FinalGUISpec.md`

Source lines: L26369-L26559

Source SHA256: `7236ee5f73d5999720dab50565a293e5e396ce8833679acb4b42393e21a9c585`

---

## Ledger Compile Addendum - pldg-20260629-001-feature-name

This addendum compiles Free Models user-facing settings, catalog, onboarding/setup, and status behavior into FinalGUISpec ownership. It does not create WorkNodes, NodeSeeds, executable queues, generated governance artifacts, or implementation files.

### F3-407 - Free Models Provider Catalog Settings And GitHub Attribution

```yaml
plan_unit_id: F3-407
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings and model-selection surfaces expose `Free Models` as one provider grouping with compact model rows that show model name, underlying provider, readiness/status, cost/free state, and small capability icon group. Expanded details carry source/ref/version, upstream GitHub attribution/link, underlying provider/account, setup steps, quota/pressure detail, cost/free caveats, and support/debug links. The GUI must include the upstream GitHub link `https://github.com/vava-nessa/free-coding-models` in a comments/attribution area without making upstream docs canonical UI truth.
gui_related: true
gui_classification_reason: Owns visible provider catalog rows, badges, icons, details, and GitHub attribution/link placement.
depends_on: []
unblocks: []
acceptance_criteria:
  - Compact rows fit dense model settings space without hiding critical blockers.
  - Expanded details expose source/ref/version and the upstream GitHub attribution/link.
  - Unsupported upstream additions do not appear in normal catalog/detail/search/top-10/setup/routing surfaces.
  - Disabled rows offer one primary plain action when possible.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models model selector density and attribution UI fixtures
  - Responsive/overflow checks for compact model rows
risk_class: gui_density_and_attribution_drift
reasoning_tier: high
context_scope: free_models_catalog_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_catalog_gui_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
  - https://github.com/vava-nessa/free-coding-models
source_atom_ids: [atom-0014, atom-0027, atom-0075, atom-0077, atom-0079, atom-0081, atom-0082, atom-0083, atom-0087, atom-0138, atom-0142, atom-0153, atom-0157, atom-0161, atom-0162, atom-0163, atom-0165, atom-0166, atom-0167, atom-0169, atom-0170, atom-0173, atom-0174, atom-0186, atom-0190, atom-0291, atom-0292]
preserved_exact_tokens:
  - "Free Models"
  - "https://github.com/vava-nessa/free-coding-models"
  - "comments"
  - "Github"
  - "model name"
  - "underlying provider"
  - "readiness/status"
  - "cost/free state"
  - "small capability icons"
  - "That is a lot of info to display in a small area."
  - "View details"
negative_constraints:
  - Do not overload compact model rows with dense import/runtime diagnostics.
  - Do not show unsupported upstream additions in normal Free Models catalog, detail, search, top-10, routing, or setup surfaces.
  - Do not include recommended models, coding-strength badges, quality-rank badges, or recommendation confidence labels.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

### F3-408 - Free Models Priority Refresh And Passive Update UX

```yaml
plan_unit_id: F3-408
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The model settings GUI exposes a manual all-provider model refresh button near model settings and passive Free Models update timestamps. Successful validated Auto Apply updates create no notification/inbox item and normal settings show only `Last checked` and `Last updated`, with recent-change details behind details or Advanced/Support. Failed or quarantined Free Models updates keep current known-good active and show `Free Models update needs attention` with `Retry check` and `View details`. Routine automatic offline/launch failures remain passive as `Could not check` unless routing availability is affected.
gui_related: true
gui_classification_reason: Owns visible model refresh button, update status, timestamps, and attention-state wording.
depends_on: []
unblocks: []
acceptance_criteria:
  - Manual refresh button is near model settings and covers all providers including direct and CLI-backed providers.
  - Success produces no notification/inbox item and no normal recent-change count beyond passive timestamps.
  - Manual refresh summaries use plain per-provider statuses such as `Updated`, `No changes`, `Needs sign-in`, `Skipped`, `Failed`, and `Offline`.
  - Routing-affecting Free Models failures show narrow affected-row UI such as `Some Free Models are unavailable`, not a broad app-level warning.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Free Models manual refresh placement fixtures
  - Free Models update status copy fixtures
risk_class: update_status_gui_noise
reasoning_tier: high
context_scope: free_models_refresh_update_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: free_models_refresh_gui_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0051, atom-0052, atom-0056, atom-0057, atom-0058, atom-0059, atom-0081, atom-0082, atom-0093, atom-0097, atom-0133, atom-0137, atom-0140, atom-0144, atom-0177, atom-0178, atom-0180, atom-0181, atom-0182, atom-0184, atom-0187, atom-0188, atom-0191, atom-0192, atom-0203, atom-0204, atom-0207, atom-0208, atom-0225, atom-0227, atom-0229, atom-0231, atom-0233, atom-0237, atom-0241, atom-0245, atom-0249, atom-0253, atom-0287, atom-0288, atom-0295, atom-0296]
preserved_exact_tokens:
  - "button near the model settings"
  - "Refresh Models"
  - "manual all-provider model refresh"
  - "Last checked"
  - "Last updated"
  - "No notification"
  - "Free Models update needs attention"
  - "Retry check"
  - "Could not check"
  - "Updated"
  - "No changes"
  - "Needs sign-in"
  - "Skipped"
  - "Failed"
  - "Offline"
  - "Some Free Models are unavailable"
negative_constraints:
  - Do not create notification or inbox items for successful validated Free Models Auto Apply updates.
  - Do not show successful Auto Apply recent-change counts/details in normal settings beyond passive timestamps.
  - Do not use a broad app-level warning for Free-Models-only routing-affecting availability problems.
  - Do not expose a user-facing setting for repeated automatic background check failure thresholds; the user cannot fix this.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

### F3-409 - Free Models Top-10 Setup Override And Availability UX

```yaml
plan_unit_id: F3-409
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Free Models setup and top-10 screens default to global configuration to keep the GUI cleaner, while making clear that section/surface/role settings override the global top-10. Onboarding/doctor sequencing should set up paid providers first, then show Free Models and let the user configure the top-10. Free Models rows use plain setup actions and friendly unavailable labels, with expanded details for underlying provider/account, current skip reason, cooldown/Retry now state, source/ref, and return context.
gui_related: true
gui_classification_reason: Owns top-10 setup, onboarding placement, override disclosure, setup labels, and visible availability states.
depends_on: []
unblocks: []
acceptance_criteria:
  - GUI states when a section/surface/role setting overrides global top-10 and shows requested/effective behavior.
  - Top-10 setup is global by default and does not hide that the list spans all providers/models.
  - Future onboarding/doctor flow sets up paid providers before Free Models top-10 configuration.
  - Unavailable rows use the priority `Needs sign-in`, `Rate limited`, `Provider offline`, `No longer free`, `Update issue`, `Unknown`, or `Multiple issues`.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Top-10 override disclosure fixtures
  - Free Models setup and unavailable-row copy fixtures
risk_class: priority_setup_gui_drift
reasoning_tier: high
context_scope: free_models_priority_setup_gui
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: free_models_priority_setup_gui_planunit
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260629-001-feature-name/records/design_atoms.jsonl
source_atom_ids: [atom-0022, atom-0035, atom-0037, atom-0038, atom-0040, atom-0084, atom-0085, atom-0086, atom-0088, atom-0089, atom-0090, atom-0094, atom-0098, atom-0099, atom-0100, atom-0102, atom-0103, atom-0104, atom-0113, atom-0117, atom-0118, atom-0122, atom-0123, atom-0124, atom-0126, atom-0127, atom-0128, atom-0130, atom-0132, atom-0134, atom-0136, atom-0154, atom-0158, atom-0164, atom-0168, atom-0171, atom-0175, atom-0236, atom-0240, atom-0244, atom-0248, atom-0251, atom-0255, atom-0257, atom-0259, atom-0261, atom-0263, atom-0265, atom-0266, atom-0267, atom-0269, atom-0270, atom-0271, atom-0281, atom-0282, atom-0285, atom-0286]
preserved_exact_tokens:
  - "Default to globally"
  - "top 10"
  - "paid providers"
  - "show the user the free models and they can configure their top 10 then"
  - "those configurable settings override the top 10 and the gui should state that"
  - "guided editable template"
  - "Set up provider"
  - "Sign in"
  - "Reconnect"
  - "Needs sign-in"
  - "Rate limited"
  - "Provider offline"
  - "No longer free"
  - "Update issue"
  - "Multiple issues"
negative_constraints:
  - Do not make Free Models section settings an opaque pool abstraction; show actual models.
  - Do not silently reorder or mutate saved top-10 order after provider setup refresh.
  - Do not expose import/runtime jargon in the normal Free Models setup path.
  - Do not create separate notifications for setup cancel or failed auth returns.
owner_hints:
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
```
