# Shard 021: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2642-L2723

Source SHA256: `755e1a1472fb459def41808168ef6635b9fbb6f20870afbef82270b12894ac4b`

---

## Wand Modules Redesign Addendum (2026-09-27)

The 2026-09-27 redesign of the Puppet Master 5.6 Pro wand modules (design spec §8.10, frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) redraws the Memory surface and its traces in chat. This addendum states what that presentation may and may not mean for this subsystem. It changes no verification rule, no injection rule and no command. Where the redesign's words for the panel itself are still an owner decision (the visible name of Gist Review), this addendum is silent and the existing tokens stand. Chat transcript families and the accent rule belong to the Chat WOW addendum in `Plans/assistant-chat-design.md` (ACD-469..475) and are referenced, not restated.

### AMS-047 - Memory Preview, Out Of Date Display Group, And In-Chat Traces

```yaml
plan_unit_id: AMS-047
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  The capsule preview ("What's in capsule now") is labelled for people as "See what your next message will include". Its token count and space meter count memory notes only, against assistant.memory.capsule_budget_tokens (default 350); taught rules that ride along may be listed beside the notes but come from the rules pipeline and are never counted against the memory capsule budget, and any figure shown for them names the rules budget it belongs to, because Memory is not rules. A gist whose last evaluation was Verified but which holds a claim whose currentness is needs_revalidation or source_unavailable may be shown under the display group "Out of date" until it is reassessed; the group is derived at read time from currentness, its gists do not auto-inject, and it is never stored, emitted or offered as a fourth verification_state, which stays exactly Unverified, Verified or Discarded. In chat, memory is never a card and never a pop-up: a reply that saved a note carries a "Noted" mark in its meta row that relaxes to the glyph alone after 3 s, a milestone that verifies a note earns one "Verified: …" line once, and a note going out of date makes no chat noise.
gui_related: true
gui_classification_reason: The capsule preview label, the list grouping and the in-chat memory marks are user-visible presentation of memory state.
depends_on: [AMS-014, AMS-018, AMS-021, AMS-044, AMS-045]
unblocks: []
acceptance_criteria:
  - The capsule preview is labelled "See what your next message will include" and its meter counts notes only against assistant.memory.capsule_budget_tokens.
  - No taught rule is counted against the memory capsule budget; a figure shown for rules names the rules budget.
  - A stale Verified gist can appear under "Out of date", does not auto-inject, and no record, event, filter value or export carries "Out of date" as a verification_state.
  - A reply that saved a note shows "Noted" that relaxes to the glyph after 3 s; a verifying milestone prints one "Verified: …" line once; a note going stale prints nothing in chat.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_state_presentation_drift
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (part), B-AMS-03, B-AMS-04, B-AMS-05 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens: ["See what your next message will include", "What's in capsule now", "assistant.memory.capsule_budget_tokens", "Memory is not rules", "Out of date", "verification_state", "needs_revalidation", "source_unavailable", "Noted", "3 s"]
negative_constraints:
  - Do not add "Out of date" or any fourth value to verification_state.
  - Do not count taught rules against the memory capsule budget.
  - Do not render memory as a transcript card or pop-up; a stale note makes no chat noise.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#71-gui-gist-review-panel, ConfigKey:assistant.memory.capsule_budget_tokens, UICommand:cmd.chat.memory.preview_capsule, ContractName:Plans/assistant-chat-design.md

### AMS-048 - Gist Edit And Half-Life Link

```yaml
plan_unit_id: AMS-048
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Edit on a gist is a versioned claim edit through cmd.chat.memory.edit: it writes a new gist version, keeps the prior version and its evidence history, and resets the gist to Unverified, so an edited claim is re-verified before it can auto-inject again. The per-kind half-life editor is a link to the Settings row memory.retention.half-life-by-kind through cmd.settings.open; no memory command is added for it, and the per-gist half-life override stays a gist field. The 2026-09-27 wand redesign draws no Edit or half-life control, so in that wave cmd.chat.memory.edit has no GUI producer; its production wiring stays incomplete under CDRY-012 until a surface draws the control, and the command is not removed.
gui_related: true
gui_classification_reason: Edit and the half-life link are user-visible Gist Review actions.
depends_on: [AMS-010, AMS-014, AMS-021]
unblocks: []
acceptance_criteria:
  - An edited gist is Unverified and does not auto-inject until it verifies again; its previous version and evidence history remain readable.
  - The per-kind half-life editor opens memory.retention.half-life-by-kind through cmd.settings.open and no new memory command exists for it.
  - cmd.chat.memory.edit is reported as lacking a GUI producer in the 2026-09-27 wave rather than as wired.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_edit_bypasses_verification
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 amendment G-30 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens: ["cmd.chat.memory.edit", "Unverified", "memory.retention.half-life-by-kind", "cmd.settings.open", "CDRY-012"]
negative_constraints:
  - Do not let an edited claim keep a Verified label.
  - Do not mint a memory command for the per-kind half-life editor.
  - Do not report cmd.chat.memory.edit as wired to a GUI producer that does not exist.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: UICommand:cmd.chat.memory.edit, UICommand:cmd.settings.open, ContractName:Plans/UI_Wiring_Rules.md
