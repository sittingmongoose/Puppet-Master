# Shard 078: DL-036 research decision-card presentation - 2026-09-09

Source: `Plans/FinalGUISpec.md`

Source lines: L37364-L37502

Source SHA256: `d8f852a002056e6d335fb6dff1cc255f01bbb2fcef601f8c5a687d68d5f90115`

---

## DL-036 research decision-card presentation - 2026-09-09

The research/audit decision profile reuses Assistant Chat's existing question-card and questionnaire component, with more explanatory content per item and exactly the four user responses below. It presents one decision item at a time in chat while the complete packet artifact remains openable through the existing subject-open route. This specialization does not change the general questionnaire's multi-item, any-order or draft-revision behavior. Chat owns the response flow, Contracts the typed envelope, Storage durable dispositions, and Planning Wizard the topic/amendment and approval handoff.

Each card presents a plain name, its question in one sentence, why it came up, what the user would get, what it costs, the options, and a recommendation when one exists. The user chooses exactly one of Approve, Deny, Deny with changes, or Ask a question. Required change/question text belongs to its selected response, not a fifth response or a freeform alternative disposition. Status and disposition use text labels only, with no colored border bars or stripes and no emoji glyphs. Existing question-card spacing, focus, keyboard access and readable native presentation remain in force; no unrelated layout or manager restyling is introduced.

ContractRef: ContractName:Plans/Decision_Log.md#DL-036, ContractName:Plans/assistant-chat-design.md#ACD-459, ContractName:Plans/Contracts_V0.md#CV-328, ContractName:Plans/storage-plan.md#SP-258, ContractName:Plans/Planning_Wizard.md#PWIZ-027, ContractName:Plans/UI_Command_Catalog.md#UCC-161, ContractName:Plans/UI_Wiring_Rules.md#UIW-022, ContractName:Plans/Wiring_Matrix.md#WM-053

### F3-550 - Research Decision Card Fields Sequencing And Text Status

```yaml
plan_unit_id: F3-550
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: The DL-036 research/audit review profile renders a complete openable packet artifact and one plain-language
  decision card at a time in chat. Cards reuse the existing questionnaire component and show the full explanatory
  form with exactly Approve, Deny, Deny with changes or Ask a question. Disposition is displayed as text only, without
  colored border bars/stripes or emoji; general questionnaire behavior remains unchanged.
gui_related: true
gui_classification_reason: Defines the visible planning handoff and decision-card presentation or its user approval
  boundary.
split_recommended: false
depends_on:
- ACD-459
- CV-328
- SP-258
- PWIZ-027
- UCC-161
unblocks: []
acceptance_criteria:
- Each decision card shows plain_name, question_sentence, why_it_came_up, what_you_get, what_it_costs, options and
  recommendation when present from the owner-qualified item. The question is one sentence; a missing recommendation
  is not fabricated.
- Exactly one decision card is presented for response at a time. The full artifact still exposes every item and
  recorded disposition through cmd.nav.open_subject at any point, without advancing or submitting the active card.
  Completed items remain reviewable without being asked again.
- The four response labels are exactly Approve, Deny, Deny with changes and Ask a question. Conditional required
  change/question text remains in the shared draft/explicit-submit flow and is not a fifth Other disposition or
  a multi-select decision.
- Ask a question keeps the item Pending while its correlated answer is obtained and shown with the same item on
  re-presentation. Questionnaire round submission is not displayed as feature approval or denial. Deny with changes
  shows its recorded disposition and exact user change without claiming approval of a revised proposal.
- Approved, Denied, Denied with changes and Pending are text statuses. No colored border bars, stripes or emoji
  glyphs signal a status or response. Keyboard focus, accessible names, reading order, conditional-text validation
  and visible disabled reasons remain available without relying on color.
- Only an explicit user response settles an item. Dismissal, backgrounding, navigation, presentation expiry and
  reload do not auto-submit, approve or deny; agents do not choose on the user’s behalf. Durable readback restores
  settled labels and pending item state without re-asking settled decisions.
- The visible approval explanation distinguishes Approve for feature planning from the separate Approve And Build
  execution gate. No card click or artifact-open action implies execution, PlanCompileRun creation or native integration.
- The specialized profile uses the existing questionnaire lifecycle and UCC-161/UIW-022/WM-053 dispatch truth. General
  questionnaires retain their existing multi-item/any-order/draft-revision behavior. Unregistered or unimplemented
  decision submission is visibly unavailable, not demonstrated as a live successful answer.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Future research decision review integration, replay and accessible presentation receipts; not_run
risk_class: research_decision_review_or_execution_authority_drift
reasoning_tier: high
context_scope: dl036_research_decision_review
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-036
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/records/design_atoms.jsonl:atom-0004
- Plans/ledgers/v2/pldg-20260909-001-research-decision-review/source_shards/decision_authority_20260909.md
preserved_exact_tokens:
- Approve
- Deny
- Deny with changes
- Ask a question
- Approve And Build
negative_constraints:
- No new command family, automatic disposition, agent-authored user answer or general questionnaire sequencing change
  is introduced.
- No colored status border bars/stripes, emoji glyphs or additional response disposition is permitted.
- No implementation, WorkNodes, NodeSeeds or governance seal is created by this PlanUnit.
```

```yaml
plan_unit_id: F3-551
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Settings principles 11 to 13 (USER-SETTINGS-MANAGER-REFRESH-20260909) apply to every manager of the published concept: status
  tokens instead of pills, concept-drawn listboxes and menus with the chat assistant's popout motion over hidden
  native selects, and manager-topic canonical settings rendered inline inside their manager before its Advanced
  disclosure through the authored placement map, with core settings on six plain pages and every inventory
  id rendered exactly once. Side panels are hero sheets (identity header, status token, facts, progress rail,
  card sections revealed in a stagger while the unchanged spring settles, sticky footer); rosters scroll inside
  their manager block; the sound library is a two-column grid; provider accounts and remote routes are ordered
  lists with inline priority controls.
gui_related: true
gui_classification_reason: Governs the listbox, status, side-panel, roster, and inline-settings presentation of every Settings manager in the published concept.
depends_on: [F3-543, SSYS-035]
unblocks: []
acceptance_criteria:
  - No native select is visible in Settings; each dropdown and menu opens as a popout inside the viewport with the shared motion and closes with its collapse.
  - No capsule pill remains in Settings except keyboard keys.
  - The exactly-once walk finds every concept id rendered once across managers and the surviving plain pages.
  - The 60 fps slow-motion films of dropdown open/close, menu open/close, and hero sheet open show no blank frames and settle within their own durations.
validation_surfaces:
  - node Concepts/pm7-tools/verify/settings_refresh_checkpoint.mjs
  - node Concepts/pm7-tools/verify/settings_placement_checkpoint.mjs
  - node Concepts/pm7-tools/verify/settings_refresh_film.mjs
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: settings_presentation_regression
reasoning_tier: standard
context_scope: settings_manager_presentation
implementation_surfaces:
  - Plans/FinalGUISpec.md
  - Plans/Settings_System.md
  - Concepts/pm7-tools/settings_refresh/placement.json
  - Concepts/pm7-tools/settings_refresh/kit.js
  - Concepts/pm7-tools/settings_refresh/styles.css
node_compile_hint:
  mode: settings_manager_specification
  create_worknodes: false
source_lineage:
  - USER-SETTINGS-MANAGER-REFRESH-20260909
  - F3-543
  - SSYS-035
preserved_exact_tokens:
  - "Status Tokens, Not Pills"
  - "Themed Listboxes"
  - "Manager-Topic Settings Live Inside Their Manager"
negative_constraints:
  - Do not reintroduce capsule pills or a native option list in Settings.
  - Do not render a canonical setting twice or inside a second Advanced disclosure.
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Settings_System.md#SSYS-035
