# Shard 075: Passive Spelling And Dictionary Routing

Source: `Plans/assistant-chat-design.md`

Source lines: L25809-L25880

Source SHA256: `a3fea5b5d0104d239eb54477da4e9c42ad6a1f4719a7e78d29a2e6f9ada9c52f`

---

## Passive Spelling And Dictionary Routing

Assistant input uses one shared local spelling service. Ordinary spellcheck is enabled by default and produces only subtle spelling underlines and context-menu suggestions. It does not add a permanent Chat toolbar control, silently replace text, send composer text to a model/provider, or create provider Usage. **No autocorrect:** replacing one occurrence is an explicit user edit, not automatic replacement.

The service excludes code, URLs, paths, commands, hashes, identifiers, structured data, and known Puppet Master/provider names from ordinary spelling warnings. It supports technical-prose and unknown-name controls without treating code or opaque identity tokens as ordinary misspelled prose. Ordinary spelling offers the actions replace once, ignore once, ignore in the current composer buffer, and add to the chosen dictionary. Ignoring current buffer content does not create or restore a user-facing Draft product.

The normal Settings projection exposes Check spelling, Language with Automatic selection, Dictionary source with Automatic selection, Personal dictionary management, and Project dictionary use/management where available. Advanced source selection exposes System dictionaries only and PM local dictionaries only. Automatic source selection prefers the OS spelling service and falls back to Puppet Master's local dictionaries. Language selection and language packs, technical-prose and unknown-name choices, and thread/Project overrides remain distinct choices; a thread-level disable is supported.

Personal and Project dictionaries remain distinct domain objects. This prose defines no physical family, storage key, synchronization policy, writer, or personal-dictionary global Settings scope, and admits no new setting ID. Settings consumes the spelling owner's configuration/projections through its existing Project-scoped ordinary-setting and domain-manager boundaries. Dictionary inspection or configuration must not silently dispatch an unregistered mutation.

Grammar and style assistance is separate, explicitly opt-in provider-backed work. Before such work is requested, the existing permission/model/Usage owners supply the privacy, selected route, cost and Usage disclosure. Enabling local spelling, selecting dictionaries, or asking for a local spelling suggestion is not consent to provider-backed assistance. Neither missing OS dictionaries nor unavailable local dictionaries silently substitutes a provider route.

These are retained behavioral requirements, not native implementation or command admission. Typed payload/result/availability contracts, exact setting inventory mappings, scoped dictionary mutation/persistence/permission bindings, reverse consumers, accessibility fixtures and native evidence remain explicit follow-on work. No candidate `cmd.spelling.*` command, EventRecord, storage family, package choice, provider installation or readiness unlock is created here. `Plans/Settings_System.md` owns ordinary preference scope and manager presentation, `Plans/storage-plan.md` owns any later admitted dictionary persistence, and `Plans/FinalGUISpec.md` retains shared input/context-menu presentation. Central Commands, UI Command Catalog and Wiring owners retain registration; this subsection does not admit a peer command family.

### ACD-468 - Passive Local Spelling And Dictionary Behavior

```yaml
plan_unit_id: ACD-468
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  Assistant input consumes one shared local spelling service, enabled by default, with subtle
  underlines, context-menu suggestions, explicit replace once, ignore once, ignore current
  composer buffer and add to the chosen dictionary actions. No autocorrect, permanent Chat
  toolbar control, provider request or provider Usage is introduced by ordinary spelling.
  Code, URLs, paths, commands, hashes, identifiers, structured data and known Puppet Master/provider
  names are excluded. Automatic source prefers OS service then Puppet Master local dictionaries;
  System dictionaries only and PM local dictionaries only are Advanced choices. Automatic or
  explicit language, Personal dictionary, Project dictionary, language packs, technical-prose
  and unknown-name controls, thread-level disable and thread/Project overrides remain supported.
  Grammar/style is separate opt-in provider-backed work with privacy, route, cost and Usage
  disclosure. Missing local sources do not silently substitute a provider route. Settings and
  storage retain their existing ownership; typed companions remain follow-on work. This unit
  admits no command, setting ID, storage family, native handler, Draft product or runtime proof.
gui_related: true
gui_classification_reason: Spelling underlines, input context menus and Settings dictionary controls are user-visible.
split_recommended: false
depends_on: [SSYS-002, SSYS-006, SSYS-008]
unblocks: []
acceptance_criteria:
  - Ordinary spelling is local, enabled by default, and creates no provider request or Usage.
  - Code, URLs, paths, commands, hashes, identifiers, structured data and known PM/provider names are excluded.
  - No automatic text replacement or permanent Chat spelling toolbar control is introduced.
  - Replace once, ignore once, ignore current composer buffer and add to selected dictionary are explicit user actions; no Draft product is resurrected.
  - Automatic source prefers OS service then PM local; explicit source/language choices and personal/Project dictionary distinctions remain visible.
  - Thread disable/overrides and Project preferences do not create global ordinary Settings authority.
  - Grammar/style requires distinct opt-in privacy/route/cost/Usage disclosure; local fallback never silently becomes provider-backed work.
  - Missing typed mutation/inventory/persistence/native evidence remains follow-on work and is never represented as an enabled executable command.
validation_surfaces:
  - tests/test_pm_spellcheck_owner_prose.py (source-preservation checks only)
  - future passive spelling token-exclusion, no-autocorrect, source-fallback, scope, no-provider-Usage and accessibility fixtures; not_run
risk_class: passive_spelling_scope_or_provider_consent_drift
reasoning_tier: standard
context_scope: local_spelling_and_dictionary_behavior
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/Settings_System.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: retained_spelling_behavior_prose, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/06_NOTIFICATIONS_SOUNDS_APPEARANCE_AND_INPUT.md#Spellcheck-and-dictionaries
  - PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/DECISION_COVERAGE.json#CHAT-014
  - PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/DECISION_COVERAGE.json#CHAT-015
  - PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/DECISION_COVERAGE.json#MGR-030
  - PM_Settings_Bakeoff_Final_Cumulative_2026-08-08/reference/PM_CROSS_SYSTEM_COMPLETENESS_AUDIT.md#5.24-accessibility-input-and-spellcheck
preserved_exact_tokens: ["Automatic", "System dictionaries only", "PM local dictionaries only", "Personal dictionary", "Project dictionary", "No autocorrect"]
negative_constraints:
  - Do not invent cmd.spelling command registrations, a physical dictionary family, implementation technology or provider route.
  - Do not send ordinary spelling content to a provider, fabricate Usage, or silently replace text.
  - Do not restore a user-facing Draft product or global ordinary Settings editing scope.
owner_hints: [Plans/assistant-chat-design.md, Plans/Settings_System.md, Plans/storage-plan.md]
```

ContractRef: ContractName:Plans/Settings_System.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Models_System.md, ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Commands_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md
