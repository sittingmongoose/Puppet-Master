# Retired source-control integration anchors

DL-273, Jared 2026-11-01: Cursor Origin source control is removed. These nine stable ORI anchors record retirement only. They admit no provider profile, command, inspector, CLI, auth route or migration target. Cursor AI remains with its separate AI owner. Shared Git, mirror, auth, permission, revision and currentness rules remain in Plans/Forge_Integrations.md, Plans/Source_Control_System.md and Plans/Shared_Integration_Runtime.md.

> **PlanProfile:** New Plan Authoring Profile
> **Authority:** Retirement/source lineage only; never retrieve as current operational authority.


### ORI-001 — Retired source-control proposal

```yaml
plan_unit_id: ORI-001
unit_type: owner_boundary
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-001 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_category_or_surface_drift
reasoning_tier: high
context_scope: cursor_origin_preview_owner
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:DS-05
- source_ref:egolite-register:ORI-01..06
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Forge_Integrations.md
```
### ORI-002 — Retired source-control proposal

```yaml
plan_unit_id: ORI-002
unit_type: requirement
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-002 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_mirror_split_brain_or_unsafe_detach
reasoning_tier: high
context_scope: cursor_origin_modes_authority_mirror
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-001..009
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Forge_Integrations.md
- Plans/GitHub_Integration.md
```
### ORI-003 — Retired source-control proposal

```yaml
plan_unit_id: ORI-003
unit_type: requirement
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-003 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_app_forgery_or_token_escape
reasoning_tier: high
context_scope: cursor_origin_app_and_token_auth
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-010..014
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Forge_Integrations.md
- Plans/Multi-Account.md
```
### ORI-004 — Retired source-control proposal

```yaml
plan_unit_id: ORI-004
unit_type: invariant
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-004 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_webhook_replay_or_api_drift
reasoning_tier: high
context_scope: cursor_origin_webhooks_api
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-015..020
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Forge_Integrations.md
```
### ORI-005 — Retired source-control proposal

```yaml
plan_unit_id: ORI-005
unit_type: requirement
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-005 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_stale_review_or_agent_publication
reasoning_tier: high
context_scope: cursor_origin_reviews
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-021..024
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Forge_Integrations.md
```
### ORI-006 — Retired source-control proposal

```yaml
plan_unit_id: ORI-006
unit_type: requirement
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-006 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_cli_environment_or_authority_widening
reasoning_tier: high
context_scope: cursor_origin_cli
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-025..030
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Shared_Integration_Runtime.md
```
### ORI-007 — Retired source-control proposal

```yaml
plan_unit_id: ORI-007
unit_type: validation
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-007 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_jj_preview_mutation_escape
reasoning_tier: high
context_scope: cursor_origin_git_jj_certification
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-05
- source_ref:egolite-register:SCM-02
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Jujutsu_Integration.md
- Plans/Source_Control_System.md
```
### ORI-008 — Retired source-control proposal

```yaml
plan_unit_id: ORI-008
unit_type: validation
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-008 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_gui_or_migration_false_authority
reasoning_tier: high
context_scope: cursor_origin_gui_settings_health
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-register:ORI-031..033
- source_ref:egolite-register:UI-01..03
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
owner_hints:
- Plans/Cursor_Origin_Integration.md
- Plans/Settings_System.md
- Plans/Forge_Integrations.md
```
### ORI-009 — Retired source-control proposal

```yaml
plan_unit_id: ORI-009
unit_type: requirement
status: retired
owner_doc: Plans/Cursor_Origin_Integration.md
canonical_text: ORI-009 is retired by DL-273, Jared 2026-11-01. Cursor Origin source control is not offered or dispatched.
  This anchor preserves source lineage only; no former native/mirror, setup, auth, CLI, review, webhook, inspection or
  migration behavior is admitted. Cursor AI remains separate and unchanged.
gui_related: true
gui_classification_reason: Retires the former source-control UI offering while preserving a stable retirement anchor.
depends_on:
- DL-273
unblocks: []
acceptance_criteria:
- The stable ORI anchor is retired and admits no executable provider, native/mirror profile, action or migration target.
- Shared Git, mirror and auth safeguards stay with their existing owners; Cursor AI credentials grant no other service
  authority.
validation_surfaces:
- Plans/forge_integration_contracts.schema.json
- Plans/product_onboarding_contracts.schema.json
- retired-provider and route scans
risk_class: origin_visibility_overclaim_or_partial_api_data_loss
reasoning_tier: high
context_scope: origin_visibility_and_fallback
implementation_surfaces:
- Plans/Forge_Integrations.md
- Plans/Source_Control_System.md
node_compile_hint:
  mode: retired_source_lineage_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:egolite-requirement:ORI-002
- source_ref:egolite-requirement:ORI-020
- Jared 2026-11-01 via lead1101190655-f8ab; agent proposals not selected by Jared. Retirement anchors authorized by lead1101191011-e8cd.
preserved_exact_tokens:
- DL-273
- retired
- Cursor AI
negative_constraints:
- Do not reactivate this retired service through generic Git, another provider, a mirror, a stored draft or Cursor AI
  authentication.
```