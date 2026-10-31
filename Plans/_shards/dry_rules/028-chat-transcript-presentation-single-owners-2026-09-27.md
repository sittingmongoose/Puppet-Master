# Shard 028: Chat transcript presentation single owners — 2026-09-27

Source: `Plans/DRY_Rules.md`

Source lines: L2660-L2745

Source SHA256: `ec75dc324304c2b9a5aaaed8ac6922892670952ef8f4f7e891ccba84cdf431ab`

---

## Chat transcript presentation single owners — 2026-09-27

The rebuilt chat transcript (DL-104 through DL-108) adds rules that must live in one place each.

### DR-043 - Chat Transcript Presentation Single Owners

```yaml
plan_unit_id: DR-043
unit_type: invariant
status: accepted
owner_doc: Plans/DRY_Rules.md
canonical_text: 'The map from message type and runtime card kind to transcript family has exactly one owner, ACD-469;
  the chat, its projections and any port consume it and never restate it. The accent budget is a theme-token role rule
  owned with the theme tokens (ACD-469, FinalGUISpec section 6); surfaces pick token roles and never hard-code an accent
  choice. Motion voices are per theme family tokens (ACD-475) with no per-view or per-theme override setting. Chat sound
  cues, the onboarding and Guided Tour cues and the NieR Mode parts'' menu sounds use the Notifications & Sounds owner''s
  mapping, switch, assets and one player (UCC-103, F3-564, F3-599); the chat, onboarding, the Tour and the NieR Mode
  parts have no local sound registry, volume, setting or second player. The busy-send default is read from general.interaction.queue-behavior
  only. The assistant-turn presentation vocabulary (segment roles, subject statuses, terminal states) is defined once
  in EP-128; other owners, including collaboration runs, reference it and do not redefine it. Amended 2026-10-29 (O3–O6,
  S3/S4; PM7): Pip setup voice/music and app chirps are parts, not separate sound keys/players. Live synthesis recipes
  register with the one Notifications & Sounds player/library and master switch. Retro has distinct Light/Dark kits;
  no approved music re-key. Loader periods are family-owned (F3-662), not per-view overrides. DL-259, Jared 2026-10-31:
  ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode through the Settings owner,
  with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars reflect the same effective
  state. Every opened onboarding question tip and prose help section has useful Plain English and technical versions,
  including FileSafe, service differences, storage, remote access and AI/auth choices, assuming no coding experience.
  Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy is limited to tips/help
  (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired. Q1 B, Jared 2026-10-31: the shared
  Pip voice, say and vocals everywhere Pip speaks, sends 0.35 after trim and pan into its look’s room; Glass uses 0.30
  and NieR 0.16. Each look uses its one per-look kit room, registered before the first shared voice in every host, with
  no stacked rooms. These restore the old voice’s own sends. Loudness remains within approximately 0.4 dB. The existing
  preference, gesture and sound owner still gates playback.'
gui_related: true
gui_classification_reason: "Fixes single owners for chat presentation rules."
split_recommended: false
depends_on: [ACD-469, ACD-475, EP-128, UCC-103]
unblocks: []
acceptance_criteria:
- No second family map, accent rule, voice setting, chat, onboarding, tour or NieR sound registry, sound player or queue
  default exists.
- Other owners reference EP-128's vocabulary instead of redefining it.
- 'DL-259, Jared 2026-10-31: ELI5: the wizard bar and Guided Tour bar expose the same global general.interaction.mode
  through the Settings owner, with values ELI5 and Expert, labels Plain English and Expert, and default ELI5. Both bars
  reflect the same effective state. Every opened onboarding question tip and prose help section has useful Plain English
  and technical versions, including FileSafe, service differences, storage, remote access and AI/auth choices, assuming
  no coding experience. Screen copy, control labels, exact fingerprints, paths and receipt data stay single; dual copy
  is limited to tips/help (DL-126). A mode change updates an open tip without rewriting a chat reply. Existing cmd.settings.transaction.preview/apply
  owns the preference; ui.guided_tour.toggle_eli5 is a compatibility local adapter to that shared preference, not a tour-only
  setting or chat ELI5 command. The predecessor tour_narration_only tag is retired. Q1 B, Jared 2026-10-31: the shared
  Pip voice, say and vocals everywhere Pip speaks, sends 0.35 after trim and pan into its look’s room; Glass uses 0.30
  and NieR 0.16. Each look uses its one per-look kit room, registered before the first shared voice in every host, with
  no stacked rooms. These restore the old voice’s own sends. Loudness remains within approximately 0.4 dB. The existing
  preference, gesture and sound owner still gates playback.'
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
