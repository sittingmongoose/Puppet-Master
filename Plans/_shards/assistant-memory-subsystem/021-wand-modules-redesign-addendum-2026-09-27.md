# Shard 021: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2690-L3312

Source SHA256: `44170d7d81a439d577265110d86a09037cc4a408f4efad6a125374eb86b2a38a`

---

## Wand Modules Redesign Addendum (2026-09-27)

The 2026-09-27 redesign of the Puppet Master 5.6 Pro wand modules (design spec §8.10, frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) redraws the Memory surface and its traces in chat. This addendum states what that presentation may and may not mean for this subsystem. AMS-047 and AMS-048 change no verification rule, no injection rule and no command. AMS-049..052 compile the owner's card answers of 2026-09-27: the panel's display name (DL-134), the locked-rule proposal line and memory export (DL-130), and the record of which taught rules a reply included (DL-116); AMS-053 compiles what counts as following a taught rule from the design lead's ruling on DL-116's follow-up. Chat transcript families and the accent rule belong to the Chat WOW addendum in `Plans/assistant-chat-design.md` (ACD-469..475) and are referenced, not restated.

### AMS-047 - Memory Preview, Out Of Date Display Group, And In-Chat Traces

```yaml
plan_unit_id: AMS-047
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  The capsule preview ("What's in capsule now") is labelled for people as "See what your next message will
  include". Its token count and space meter count memory notes only, against
  assistant.memory.capsule_budget_tokens (default 350); taught rules that ride along may be listed beside
  the notes but come from the rules pipeline and are never counted against the memory capsule budget, and
  any figure shown for them names the rules budget it belongs to, because Memory is not rules. A gist whose
  last evaluation was Verified but which holds a claim whose currentness is needs_revalidation or
  source_unavailable may be shown under the display group "Out of date" until it is reassessed; the group
  is derived at read time from currentness, its gists do not auto-inject, and it is never stored, emitted
  or offered as a fourth verification_state, which stays exactly Unverified, Verified or Discarded. In
  chat, memory is never a card and never a pop-up: a reply that saved a note carries a "Noted" mark in its
  meta row that relaxes to the glyph alone after 3 s, a milestone that verifies a note earns one "Verified:
  …" line once, and a note going out of date makes no chat noise. PC3 (2026-10-29): verification_state
  remains exactly Unverified, Verified or Discarded. Unverified uses thinking Pip with the existing
  pending/unverified catalog presentation; Verified is happy/complete; Discarded is sleeping/skipped. The
  derived Out of date group uses worried oops with warning, never a fourth verification state or a
  failed-memory state. Keep each owner word/accessibility label and precedence. The status-faces part off
  uses the same catalog key’s shared mark; illustrative expression never changes Memory verification or
  adds held/completed/failed states.
gui_related: true
gui_classification_reason: The capsule preview label, the list grouping and the in-chat memory marks are user-visible
  presentation of memory state.
depends_on:
- AMS-014
- AMS-018
- AMS-021
- AMS-044
- AMS-045
unblocks: []
acceptance_criteria:
- The capsule preview is labelled "See what your next message will include" and its meter counts notes only
  against assistant.memory.capsule_budget_tokens.
- No taught rule is counted against the memory capsule budget; a figure shown for rules names the rules budget.
- A stale Verified gist can appear under "Out of date", does not auto-inject, and no record, event, filter
  value or export carries "Out of date" as a verification_state.
- A reply that saved a note shows "Noted" that relaxes to the glyph after 3 s; a verifying milestone prints one "Verified: …"
    line once; a note going stale prints nothing in chat.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base
  origin/main
risk_class: memory_state_presentation_drift
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: memory_contract_spec
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (part),
  B-AMS-03, B-AMS-04, B-AMS-05 (part) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
preserved_exact_tokens:
- See what your next message will include
- What's in capsule now
- assistant.memory.capsule_budget_tokens
- Memory is not rules
- Out of date
- verification_state
- needs_revalidation
- source_unavailable
- Noted
- 3 s
negative_constraints:
- Do not add "Out of date" or any fourth value to verification_state.
- Do not count taught rules against the memory capsule budget.
- Do not render memory as a transcript card or pop-up; a stale note makes no chat noise.
owner_hints:
- Plans/assistant-memory-subsystem.md
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

### AMS-049 - Gist Review Display Name

```yaml
plan_unit_id: AMS-049
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  On screen the Gist Review panel and its document are titled "Notes it took", shown under Memory. "Gist Review" stays the canonical name: records, command ids, routes, document identity and these Plans keep it, and the display name never replaces it there. This compiles the owner's decision DL-134 (card p19, E-38), which keeps official words in the data and shows plain words on screen. The panel's behaviour is unchanged: AMS-021's filters, its default Unverified filter, its actions and its capsule preview hold, and the verification_state words stay the state labels, with plain words only as helpers beside them. Card p19 names only Regenerate Title, Synthesize, Save as Default, Gist Review and frozen target pack, so it does not reach the verification states, and the approved design spec draws each Memory row as "state glyph + canonical word" with the plain helper beside the filter value (DESIGN-SPEC §8.10).
gui_related: true
gui_classification_reason: The panel's visible title is user-facing copy.
depends_on: [AMS-021, AMS-047]
unblocks: []
acceptance_criteria:
  - The panel and its document read "Notes it took" on screen, under Memory.
  - No record, command id, route or Plans reference replaces "Gist Review" with the display name.
  - AMS-021's behaviour and preserved tokens are unchanged.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_display_name_drift
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (WAIT part, card p19 E-38) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-134
preserved_exact_tokens: ["Notes it took", "Gist Review", "DL-134", "verification_state"]
negative_constraints:
  - Do not rename Gist Review in records, command ids, routes or Plans.
  - Do not replace the verification_state words as state labels.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-134, ContractName:Plans/assistant-memory-subsystem.md#71-gui-gist-review-panel

### AMS-050 - Locked-Rule Change Proposal

```yaml
plan_unit_id: AMS-050
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  A note that proposes changing a taught rule the user locked never changes that rule. Such a proposal is the one memory event that earns a decision line in chat (the "Verified: …" trace of AMS-047 is a notice, not a decision), a single line and never a card or pop-up: "Puppet Master suggests a change to your rule '…'. It won't change unless you say so." with Review, which opens Memory through cmd.chat.teach.open_memory. In Memory the proposing note carries the decision "It suggests changing your rule. It won't change unless you say so." with two answers. Keep my rule discards the proposing note through cmd.chat.memory.discard and leaves the rule as it is. Edit my rule… opens Teach in correct mode through cmd.chat.teach.capture {mode: correct}, so any change to the rule is the user's own edit. Locking and unlocking a rule is the user's command cmd.chat.teach.set_lock, one of the seven commands the owner registered (DL-130, card p15, E-32); a locked rule keeps the explicit-unlock protection of Plans/assistant-chat-design.md §6, and no memory maintenance, summarization or proposal weakens it.
gui_related: true
gui_classification_reason: The chat line and the Memory decision are user-visible, and their answers dispatch commands.
depends_on: [AMS-047, AMS-021]
unblocks: []
acceptance_criteria:
  - A proposal to change a locked rule prints one line in chat with Review, and no card or pop-up.
  - Keep my rule discards only the proposing note; the locked rule is unchanged.
  - Edit my rule… opens Teach in correct mode; the rule changes only when the user saves that edit.
  - Nothing but the user's cmd.chat.teach.set_lock locks or unlocks a rule.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: locked_rule_changed_without_user
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-05 (WAIT part, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-130
preserved_exact_tokens: ["It won't change unless you say so.", "Keep my rule", "Edit my rule…", "cmd.chat.teach.open_memory", "cmd.chat.memory.discard", "cmd.chat.teach.set_lock", "DL-130"]
negative_constraints:
  - Do not let a memory note or any automated step change or unlock a locked rule.
  - Do not render the proposal as a card or pop-up.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: UICommand:cmd.chat.teach.open_memory, UICommand:cmd.chat.memory.discard, UICommand:cmd.chat.teach.capture, UICommand:cmd.chat.teach.set_lock, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-051 - Taught Rules Included In A Reply

```yaml
plan_unit_id: AMS-051
unit_type: schema_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  When the Assistant prompt builder places taught rules in a reply's context, it records them as included_teaching_ids on that reply's context record (the message's canonical usage/context record), each id at the version that was included; an empty list means no taught rule was included. The record states inclusion only: it proves a rule was given to the model, not that the model obeyed it. By the owner's decision DL-116 (card n07, E-36) the reply note about applied rules uses the word "Followed", not "Used", and the Plans define what counts as following before any reply shows it. Inclusion alone never counts as following, so no reply shows "Followed" on the strength of included_teaching_ids alone. What counts as following, and what a reply shows when a rule's check fails or cannot run, is AMS-053.
gui_related: true
gui_classification_reason: The record backs a user-visible note on replies about applied rules.
depends_on: [AMS-018, AMS-025]
unblocks: [AMS-053]
acceptance_criteria:
  - Every reply whose context included taught rules carries included_teaching_ids naming each rule at its included version.
  - No reply shows "Followed" because a rule was included; "Used" is not substituted for it.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
  - python3 scripts/pm-new-contracts-verify.py
risk_class: rule_inclusion_presented_as_obedience
reasoning_tier: standard
context_scope: assistant_memory_prompt_record
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/Prompt_Pipeline.md, Plans/assistant_memory_contracts.schema.json]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.11 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
  - Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-116
preserved_exact_tokens: ["included_teaching_ids", "Followed", "Used", "DL-116"]
negative_constraints:
  - Do not treat inclusion as proof that a rule was followed.
  - Do not show "Used" in place of the owner's word "Followed".
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-052 - Export Memory

```yaml
plan_unit_id: AMS-052
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  Export memory is the command cmd.chat.memory.export {scope}, with scope gists | teachings | all,
  registered by the owner's decision DL-130 (card p15, E-32). One command serves both producers, the
  Export action of the Memory surface and the Export action of the taught-rules document. It exports
  the gists, the taught rules, or both that Memory shows for the explicitly bound Project, or the
  calling app thread with null project_id and actual Computer under AMS-054 through the artifact owner
  and returns an ArtifactExportResult; it adds no memory store and never changes, verifies, pins or
  discards what it exports. Each gist goes out with its verification_state as stored, so an Unverified
  gist is never exported as Verified, and its EvidenceRef entries go out as the pointers they are
  (AMS-006), never as copies of the referenced content. The command is available when assistant memory
  and artifact export are both available (assistant_memory_available && artifact_export_available).
  Its catalog row belongs to Plans/UI_Command_Catalog.md. No-project export cannot enumerate other app
  threads or all Project memory.
gui_related: true
gui_classification_reason: Export is a user-visible action on the Memory surface and the taught-rules document.
depends_on: [AMS-006, AMS-010, AMS-021]
unblocks: []
acceptance_criteria:
  - Both Export actions dispatch cmd.chat.memory.export with scope gists, teachings or all.
  - Exporting changes no gist, rule, verification_state or pin.
  - Exported gists keep their stored verification_state, and evidence is exported as pointers only.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
  - python3 scripts/pm-new-contracts-verify.py
risk_class: memory_export_mutates_or_leaks
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/assistant_memory_contracts.schema.json]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (WAIT part N-7,
  card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-130
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16/N24
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens: ["Export memory", "cmd.chat.memory.export", "gists | teachings | all", "ArtifactExportResult", "verification_state", "DL-130"]
negative_constraints:
  - Do not mutate memory while exporting it.
  - Do not export an Unverified gist as Verified or inline evidence content.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
```

ContractRef: UICommand:cmd.chat.memory.export, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-053 - What Counts As Following A Taught Rule

```yaml
plan_unit_id: AMS-053
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: >-
  A taught rule counts as followed by a reply only when it was given to the Assistant for that
  reply in included_teaching_ids at its included version (AMS-051) and the finished reply passed
  that rule's check. The check compares the rule's testable statement at the included version with
  the finished reply; it runs once after completion, never on partial text, and changes no reply,
  rule or memory. For every included rule, rule_check_outcomes on the reply's saved context record
  stores the IncludedTeachingRef pair memory_id and normalized_fact_sha256, plus one outcome:
  passed, failed or could_not_run. Reopening
  the chat reads the saved outcome rather than rerunning the check (DL-138).
  The note uses the owner's Followed word (DL-116), counts only passed checks as Followed and failed checks as Missed. With both kinds, it
  shows one line, "Missed 1 of your rules · followed 2", with the Missed count first. A Missed note
  lets the user see the missed rule. Its ask-for-a-fix link reuses cmd.review.send_findings_to_agent
  with source_kind taught_rule_check, reply_message_id and missed_teaching_refs; it fills only an
  empty composer with an editable fix request and never sends or executes it (CWR-031, DL-138).
  A check that could_not_run earns no tick, counts neither way, and a reply with no passed or failed
  checks shows no rule note. A rule not included is never checked or counted. "Used" is never shown
  in place of Followed or Missed.
gui_related: true
gui_classification_reason: The Followed and Missed notes on a reply, and the way to see which rule was missed and ask for a fix, are user-visible.
depends_on: [AMS-051, AMS-018]
unblocks: []
acceptance_criteria:
  - The saved reply context records passed, failed or could_not_run for each included teaching ID and version, and reopening does not rerun the check.
  - A reply with passed and failed checks shows one line with the Missed count first and followed count second.
  - Asking for a fix fills an empty composer through the taught_rule_check variant and never sends or executes the draft.
  - A rule counts as followed only when it is in the reply's included_teaching_ids and the finished reply passed that rule's check.
  - A reply whose included rule failed its check shows "Missed 1 of your rules" (or the number that failed), lets the user see which rule, and offers a way to ask for a fix.
  - A rule whose check could not run is counted neither as followed nor as missed; with no passed or failed check the reply shows no rule note.
  - No check runs on partial text, and no check changes the reply, the rule or memory.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: rule_inclusion_presented_as_obedience
reasoning_tier: standard
context_scope: assistant_memory_prompt_record
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/FinalGUISpec.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c; DL-138, questions 18-19)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.11 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
  - /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json (SHA-256 4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f)
  - Design lead ruling of 2026-09-27 on the DL-116 follow-up (the definition of following), recorded in Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
  - Plans/Decision_Log.md#DL-116
preserved_exact_tokens: ["Followed", "Missed 1 of your rules", "included_teaching_ids", "rule_check_outcomes", "could_not_run", "Missed 1 of your rules · followed 2", "cmd.review.send_findings_to_agent", "source_kind", "taught_rule_check", "reply_message_id", "missed_teaching_refs", "Used", "DL-116"]
negative_constraints:
  - Do not count a rule as followed because it was included, or because no check could run.
  - Do not hide a failed check behind a Followed count.
  - Do not start a fix, re-send or rewrite a reply from the check itself.
  - Do not show "Used" in place of the owner's word "Followed".
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-054 - Thread-Private App Memory And Explicit Carry-Over

```yaml
plan_unit_id: AMS-054
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'No-project Assistant memory and its capsule are thread-only: application scope, project_id=null
  and actual Computer/thread identify one working set, gist corpus and index view. The work Computer owns
  local in-process custody under storage-plan, outside any Project Vault; another app chat never receives
  it. Widest explicitly taught public_safe rules still apply through the rules owner, with Everywhere/Computer
  and thread behavior preferences from Settings; rules and memory remain different tiers. Existing claim
  verification, evidence pointers, Verified-only summary-first injection, 350-token capsule default, budgets,
  retention/holds, provider exposure and NullMemoryProvider wiring for non-Assistant agents remain. Cross-Project
  read grants, Crew membership and known gist IDs confer no memory access. MemoryProvider operations use
  an explicit versioned Project-or-app-thread scope; no null or app string is interpolated as a Project
  key. At conversion the destination Project memory is adopted for future work, and gist/capsule carry-over
  is individually previewed, source-restricted and lineage-bound through its owner. Historical verification
  and evidence are not upgraded, other chats'' memory is never merged, and a copied capsule grants no
  authority. cmd.chat.memory.export keeps scope gists|teachings|all but exports only the bound Project
  or app-thread view with nullable Project and actual thread/Computer metadata; no new command or memory
  store is created. The selected app view is Plans/application_workflow_contracts.schema.json#/$defs/MemoryViewApplicationV1,
  logical pm.assistant_memory.view.application.v1 version 1.0.0, with OriginalMemoryMutationSource in
  Plans/application_workflow_sources.schema.json and complete source-graph adoption under CV-366. SP-349
  owns assistant_memory.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(memory_id)};
  this is a separate family, never nullable reinterpretation of a Project key or a shared app corpus.
  Parent/thread/Computer, source/currentness, verification, canonical retention and Full Server Backup
  joins must all hold; missing native/source/policy registration remains unavailable.'
gui_related: false
gui_classification_reason: Defines runtime scope, data identity and custody without owning visual presentation.
depends_on:
- AMS-003
- AMS-033
- AMS-042
- AMS-046
- AMS-052
- WN-021
- CV-366
- SP-349
unblocks: []
acceptance_criteria:
- Two app chats on one Computer cannot retrieve, inject or export each other's gists by null scope or
  shared preference.
- Widest public_safe teachings still apply without forwarding private memory to workers or Crew.
- Conversion and export retain source restrictions, stored verification_state and evidence pointers; absent
  authority cannot become Verified or shared.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16/N24/N25/N26
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/NOPROJECT-PROPOSAL.md#5;7.12
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/C-requests.md#C-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fc-requests.md#Fc-B01
preserved_exact_tokens:
- project_id=null
- MemoryProvider
- NullMemoryProvider
- public_safe
- 350-token
- cmd.chat.memory.export
- gists
- teachings
- all
negative_constraints:
- Do not share an app-wide personal-memory corpus, merge other chats, reconstruct facts from events or
  wire workers to RealMemoryProvider.
- Do not carry memory/notes in Saved setups or treat a moved capsule as new destination authority.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/assistant-memory-subsystem.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#AMS-054, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365


### AMS-130 - memory.gist_state_changed prepared semantic contract

```yaml
plan_unit_id: AMS-130
unit_type: interface_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.gist_state_changed@1.0.0, prepared
  without admission. DL-405 (Browser) / DL-407 (memory) apply only as selected in the as-presented Card 2 and are
  landed Decision Log entries; the per-name retention assignment is landed as Plans/Decision_Log.md#DL-401 (Case L-3,
  Card 1 retention assignments), and the lineage pins stay in the DCN report. Per-family current-canon search and scoped negative
  evidence are recorded in reports/event-authority-20261104/DCN.md and its pinned external per-family-search.json.
  RealMemoryProvider records one real successful MemoryGist change for each successful verify, edit, pin, unpin,
  discard or automatic mutation, including save/import, claim/evidence currentness, decay/half-life, access count/time
  and derived-field invalidation/re-derivation when they actually change canonical gist state. Exact producer entry
  points are cmd.chat.memory.verify, cmd.chat.memory.edit, cmd.chat.memory.pin, cmd.chat.memory.discard, RealMemoryProvider.upsert_gist,
  RealMemoryProvider.set_verification_state, RealMemoryProvider.record_access, RealMemoryProvider.delete_gist. All
  require the already specified Assistant-only scope and existing permission/verification rules. changed_fields
  names every changed canonical field but contains no field value. A successful verification adopts AMS-044/045
  claim-level support, resolvable scoped current evidence and the existing explicit allow_manual_verify_without_evidence
  exception; it does not invent a second verification rule. Requested verification and failed verification keep
  only their command result and append zero history events; successful verification with no real change also appends
  none. A separate authoritative automatic invalidation that actually changes a gist is one automatic mutation,
  not an event for a failed command. Pin requires false to true, unpin true to false, discard sets verification_state=Discarded;
  edit and automatic require an actual delta. One committed mutation increments the revision once; deferred or unavailable
  maintenance performs no mutation and emits nothing. The seven retired command spellings are not aliases that may
  append. This contract does not change section 7.2 archive/delete policy or decide the duplicate-sweep survivor.

  DL-407 retires memory.gist.verification_requested, memory.gist.verified, memory.gist.verification_failed, memory.gist.updated,
  memory.gist.pinned, memory.gist.unpinned and memory.gist.discarded only under this complete surviving contract.
  A request/failure never creates its own history; do not append either vocabulary twice. Existing memory-body/version
  audit custody is unchanged.

  The full payload is Plans/card2_event_payloads.schema.json#/$defs/memory_gist_state_changed, exact Project logical
  schema_id pm.memory.gist_state_changed.payload.v1 and distinct application logical schema_id pm.memory.gist_state_changed.payload.application.v1,
  both schema_version=1.0.0. The selected root is closed; identifiers require exact full-match in addition to length
  bounds, including trailing-LF rejection. It holds metadata, revisions, changed field names and opaque owner-record/evidence
  references only, never URL, screenshot/page content, cookies, memory claims/text or secrets. Complete semantic
  before/after values remain with the existing source owner. Evidence has no 16-reference or other new count cap:
  section 3.1 and section 3.3 retain the complete ordered evidence list. The payload evidence_refs is that complete
  list of opaque owner pointers while the encoded full metadata body fits within the SP-337 16 KiB inline ceiling.
  If it would exceed that ceiling, evidence_refs instead holds the closed SP-337 collection descriptor defined
  by the payload schema: id (lowercase BLAKE3), size_bytes (exact integer byte count), and media_type exactly
  application/vnd.puppetmaster.memory-evidence-refs+msgpack. Its pack bytes are the complete canonical MessagePack
  evidence pointer array using the existing minimal-width/string/array encoding of pm_event_index_binding.binding_bytes,
  not gist text, claim bodies, evidence content or a second memory store. Resolve it in the original authenticated
  Storage/server/scope/thread payload store; recompute BLAKE3, byte count and canonical bytes and require durable
  bytes/index before event acknowledgment under SP-337. Compare the entire resolved array to the immutable source,
  never truncate it or compare only the descriptor. Freeze the selected inline/reference representation with the
  original operation; the unchanged CV-785 semantic digest covers it and retries reuse it. References inherit SP-765
  custody/access/deletion/backup and SP-337 hold/pack rules on append, retry and history. The reference route is
  selected only when the full list would exceed 16 KiB; the resulting full inline metadata body must still fit.
  revision_after=revision_before+1 over u64. The source
  must authenticate the exact subject, scope, operation, before/after revisions and committed outcome; an all-true
  fixture is not native producer authority. Scope is application_or_project only for these existing owner-supported
  editions: real Project keys/bytes remain unchanged; application has project_id=null, actual Computer/server and
  original source graph selected by CV-366 (OriginalMemoryMutationSource and MemoryViewApplicationV1 under AMS-054).
  App memory additionally requires the actual private thread. Missing original source/method/admitted edition remains
  unavailable, with no fabricated Project, fallback Client or cross-thread corpus.

  memory.gist_state_changed is read by reader.memory.gist_state_changed.history@1.0.0 for the existing memory GUI
  and audit consumers; prompt assembly reads the current authorized MemoryGist under AMS-054, never an event body
  as injection authority. This reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses
  projector.storage.event_record_index@1.0.0 only for complete generic metadata indexing: checkpoints table, key
  event_record_index_checkpoint.v1:{storage_instance_id}, the uniquely current #/generations/{generation_id} value
  in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, and event_record_index.v2@{generation_id}.
  Verify the original generation birth anchor and actual complete coverage, including nonmatching application/Project
  rows, not a matching-row maximum. Resolve exact scope partition, event_type, event_id, sequence_id, publication_locator,
  source frame/CRC and payload commitment in one redb snapshot under the actual CURRENT/manifest maintenance fence.
  The complete SP-278 live read token contains storage_instance_id, checkpoint_key, checkpoint_ref, generation_id,
  generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and live redb_snapshot_id.
  A persisted read token is only its nine-field durable projection under DL-076; no redb_snapshot_id is stored.
  source_selection binds storage_instance_id, CURRENT path/bytes, selected segment generation, manifest path/bytes/generation,
  recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Generation-only
  comparison is insufficient: a same-generation frontier change invalidates publication. Revalidate access, deletion
  and that complete token at disclosure; changed fences discard the answer. The generic owner''s checkpoint CAS/complete-source
  transaction remains SP-278''s, not this reader''s. Family checkpoint disposition is none_required: the family
  creates no projector, durable history view, family checkpoint, cursor or ACK; its sole effect is an ephemeral
  read answer. It never writes or advances the generic checkpoint. Crash/rebuild reacquires the generic index and
  recomputes the answer, never reruns an owner command, emits an event, restores a lease, charges Usage or injects
  a prompt. Historical validation evaluates the genuine original committed transition under its original schema/policy;
  disappearance or changed current state of the live subject does not invalidate a retained event. Withdrawn or
  forged sources still refuse.

  Original-source resolution is mandatory on append, retry and historical inspection. Resolve before_record_ref
  and after_record_ref in the authenticated original owner store, not against a caller-supplied observation.
  Each resolved record agrees with the operation on subject, workspace where applicable, Storage instance,
  Home Server, Computer, exact scope, Project/thread and actual Run/node/Attempt lineage, record identity and revision.
  Non-execution operations have null Run/Attempt and no node. Complete before/after facts agree with every
  payload observation; a matching reference spelling without its genuine record is unavailable. Live stop-generation
  admission applies only to current append/retry, never to a retained original. Original schema/policy, genuine
  source, withdrawal, access and deletion validation remain mandatory even after the live subject changes or disappears.


  DL-407 coverage requires complete immutable MemoryGist before/after facts. Before computing any delta,
  validate every resolved record against all required MemoryGist fields in section 3.1, including kind, claims,
  summary and access_count; identity and exact scope live in the independently joined record metadata.
  Two matching projections with the same required field omitted are incomplete sources and refuse on append,
  retry and history. Optional absence remains distinct from explicit null; never supply defaults to repair a source.
  Validate exact field types before values, including booleans versus numbers and complete claim objects.
  Each before and after claim includes claim_id, text, created_at and all three AMS-044 support facts:
  evidence_support is a list of distinct opaque references forming a subset of that same gist version evidence_refs;
  support_scope is a nonempty textual account of what those references cover; currentness is exactly current,
  needs_revalidation or source_unavailable. Claim identities are distinct within a gist. Missing or wrongly typed
  nested facts refuse even when both snapshots omit the same fact. Optional gist-level claim_support/currentness
  summaries never replace the claims; when present their references and currentness use the same valid domain.
  Section 5.3 and AMS-044/045 require every after-claim to have nonempty support and currentness=current for a
  successful verify or new automatic Verified transition, in addition to the genuine owner evaluation of support,
  scope, resolvability and validity context. Only manual verify with the existing explicit configured override
  may bypass that verification gate; it never permits malformed facts, foreign support or an automatic override.
  Noncurrent retained before facts remain valid history, not current verification authority. These are structural
  checks of the existing owner rules, never deterministic natural-language entailment.
  changed_fields is exactly
  the set of canonical semantic fields whose values differ, including presence versus absence; it is never a
  manually selected subset. Revision is checked separately and is not a semantic field. Payload previous_pinned,
  pinned, previous_verification_state, verification_state, source and evidence_refs equal their resolved facts.
  For a new automatic gist, the absent before record makes every present semantic field part of changed_fields;
  previous_verification_state is null and previous_pinned is the false absence sentinel. Edits, pin/unpin, discard,
  successful verify and automatic changes all use the same exact-delta rule, including combined changes and changes
  to claims, provenance, access, evidence/currentness and derived fields. Requested, failed and unchanged verification
  have identical canonical before/after facts, zero history events and a retained command result. The seven
  retirements above depend on these complete coverage and no-event obligations; they grant no maintenance policy.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- DL-045
- CV-366
- AMS-054
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an
  after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct
  real changes retain distinct identities.
- One authentic committed owner mutation produces exactly one history event only after exact family admission.
- All closed payload, command, transition, historical read, duplicate-record and scope oracles pass.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_ams-130
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- memory.gist_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```
