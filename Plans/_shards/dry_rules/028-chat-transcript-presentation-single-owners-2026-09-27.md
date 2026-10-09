# Shard 028: Chat transcript presentation single owners — 2026-09-27

Source: `Plans/DRY_Rules.md`

Source lines: L2594-L2655

Source SHA256: `352b3475d358456c1f570ae10ce29c4e7ee26d9913acde6e5942dfc39481ba48`

---

## Chat transcript presentation single owners — 2026-09-27

The rebuilt chat transcript (DL-104 through DL-108) adds rules that must live in one place each.

### DR-043 - Chat Transcript Presentation Single Owners

```yaml
plan_unit_id: DR-043
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: >-
  The map from message type and runtime card kind to transcript family has exactly one owner,
  ACD-469; the chat, its projections and any port consume it and never restate it. The accent budget
  is a theme-token role rule owned with the theme tokens (ACD-469, FinalGUISpec section 6); surfaces
  pick token roles and never hard-code an accent choice. Motion voices are per theme family tokens
  (ACD-475) with no per-view or per-theme override setting. Chat sound cues, the onboarding and Guided
  Tour cues and the NieR Mode parts' menu sounds use the Notifications & Sounds owner's mapping,
  switch, assets and one player (UCC-103, F3-564, F3-599); the chat, onboarding, the Tour and
  the NieR Mode parts have no local sound registry, volume, setting or second player. The busy-send
  default is read from general.interaction.queue-behavior only. The
  assistant-turn presentation vocabulary (segment roles, subject statuses, terminal states) is
  defined once in EP-128; other owners, including collaboration runs, reference it and do not
  redefine it.
gui_related: true
gui_classification_reason: "Fixes single owners for chat presentation rules."
split_recommended: false
depends_on: [ACD-469, ACD-475, EP-128, UCC-103]
unblocks: []
acceptance_criteria:
  - "No second family map, accent rule, voice setting, chat, onboarding, tour or NieR sound registry, sound player or queue default exists."
  - "Other owners reference EP-128's vocabulary instead of redefining it."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_presentation_authority
reasoning_tier: high
context_scope: chat_presentation_owners
implementation_surfaces:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: exact_key_static_dry_gate_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-104"
  - "Plans/Decision_Log.md#DL-107"
preserved_exact_tokens:
  - "ACD-469"
  - "EP-128"
  - "general.interaction.queue-behavior"
negative_constraints:
  - "Do not restate the family map outside ACD-469."
  - "Do not add a chat-, onboarding-, tour- or NieR-local sound or motion registry, or a second sound player."
owner_hints:
  - Plans/DRY_Rules.md
  - Plans/assistant-chat-design.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/Executor_Protocol.md#EP-128
