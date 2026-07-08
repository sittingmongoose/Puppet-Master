# Shard 025: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/usage-feature.md`

Source lines: L5111-L5203

Source SHA256: `72bdae3668eee969c2de469ca4d8ce227c67636de732ddbee56c90f385d2122e`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### UF-076 - Vision Bridge Usage Attribution

```yaml
plan_unit_id: UF-076
unit_type: requirement
status: accepted
owner_doc: Plans/usage-feature.md
canonical_text: When the vision bridge uses a separate provider/model/account, PM records usage/cost refs when available
  and links them to the derived vision-description artifact and VisionBridgeResult. Usage attribution must reflect
  requested/effective provider/model/account, bounded retry/fallback behavior, and policy-permitted reroutes without
  inventing bridge-specific cost fields separate from the existing usage_event_ref pattern.
gui_related: false
gui_classification_reason: Usage and cost attribution are accounting/telemetry behavior; GUI consumers render elsewhere.
depends_on:
- MS-116
- RAP-035
unblocks:
- CV-296
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: vision_usage_attribution_gap
reasoning_tier: standard
context_scope: vision_bridge_usage
implementation_surfaces:
- Plans/usage-feature.md
- future usage events
node_compile_hint:
  mode: vision_bridge_usage_event_ref
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0076
- pldg-20260626-001-feature-name:atom-0087
- Plans/Runtime_Artifacts_Panel.md
- Plans/Prompt_Pipeline.md
- chat:vision-bridge-defaults-answer
- chat:vision-pressure-test-request
- chat:vision-pressure-test-defaults-answer
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
source_atom_ids:
- atom-0076
- atom-0087
decision_refs:
- dec-0014
- dec-0015
- dec-0016
- dec-0017
preserved_exact_tokens:
- runtime artifact
- tool/LLM trace
- source image ref/hash
- prompt/question
- provider/model/account
- cost/usage
- cached
- newly generated
- 4. Yes
- requested/effective provider/model/account
- usage/cost refs
- bounded transient failures
- falls back
- policy permits
- disclosure permission covers the destination
- 'yes'
negative_constraints:
- Do not make the derived description invisible or unauditable.
- Do not lose source lineage between the image and the generated text description.
- Do not reuse a cached description when the source image, question, or bridge model changed without marking freshness.
- Do not silently reroute an image to a different provider/account than the user allowed.
- Do not treat provider catalog visibility as proof that a route can currently process image input.
- Do not hide usage/cost attribution when the bridge uses a separate model route.
owner_hints:
- Plans/Runtime_Artifacts_Panel.md
- Plans/Tools.md
- Plans/usage-feature.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Models_System.md
- Plans/Media_Generation_and_Capabilities.md
- Plans/Permissions_System.md
```
