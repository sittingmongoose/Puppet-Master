# Shard 021: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2700-L3574

Source SHA256: `0e62b828af1539348086f818d7247f166e6367e41b0a946fa01e78159b553666`

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


### AMS-100 - memory.dedup_sweep.completed semantic contract

```yaml
plan_unit_id: AMS-100
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.completed@1.0.0, prepared
  without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.dedup_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Merge only identical embed_text_hash
  candidates under section 7.2, preserving the union of EvidenceRefs, pins and existing claim provenance. Existing owner eligibility gates still apply; an unset eligibility policy blocks the underlying mutation. Never infer gist admission from this maintenance event.

  The exact emitter is MemoryMaintenance.dedup_sweep.completed.v1@1.0.0. GUI command and internal job use the same
  authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.dedup_sweep.completed records the already durably settled success or failure, never a fabricated success.
  No event is an instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result
  refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload
  joins are governed by CV-650; persistence and read-only history by SP-630. Existing pinned protection, claim verification,
  NullMemoryProvider and locked-rule rules survive. Automatic deletion is forbidden by DL-445; only the user deletes memories. Native emission and recovery are NOT_RUN.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, automatic deletion, app-scope expansion or native proof.
```


### AMS-101 - memory.dedup_sweep.started semantic contract

```yaml
plan_unit_id: AMS-101
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.started@1.0.0, prepared
  without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.dedup_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Merge only identical embed_text_hash
  candidates under section 7.2, preserving the union of EvidenceRefs, pins and existing claim provenance. Existing owner eligibility gates still apply; an unset eligibility policy blocks the underlying mutation. Never infer gist admission from this maintenance event.

  The exact emitter is MemoryMaintenance.dedup_sweep.started.v1@1.0.0. GUI command and internal job use the same
  authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.dedup_sweep.started records acceptance before any maintenance effect. No event is an instruction to merge,
  verify, delete, index or inject. Failure details are opaque authorized result refs, never gist text, prompts,
  embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed by CV-651; persistence
  and read-only history by SP-631. Existing pinned protection, claim verification, NullMemoryProvider and locked-rule
  rules survive. Automatic deletion is forbidden by DL-445; only the user deletes memories. Native emission and recovery
  are NOT_RUN.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, automatic deletion, app-scope expansion or native proof.
```


### AMS-102 - memory.index.lexical.rebuild.completed semantic contract

```yaml
plan_unit_id: AMS-102
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_lexical_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Rebuild Tantivy
  from the bound canonical assistant_memory.redb gist corpus using section 4.1 delete+add by gist id. Stage the
  new derived index, validate its source revision, then publish under the existing maintenance fence. Never rewrite
  canonical gists.

  The exact emitter is MemoryMaintenance.index_lexical_rebuild.completed.v1@1.0.0. GUI command and internal job
  use the same authenticated in-process handler and durable operation identity; this defines no new UI command or
  job schedule. memory.index.lexical.rebuild.completed records the already durably settled success or failure, never
  a fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details are
  opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event
  fields and all payload joins are governed by CV-652; persistence and read-only history by SP-632. Existing pinned
  protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion remains
  unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-103 - memory.index.lexical.rebuild.started semantic contract

```yaml
plan_unit_id: AMS-103
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_lexical_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Rebuild Tantivy
  from the bound canonical assistant_memory.redb gist corpus using section 4.1 delete+add by gist id. Stage the
  new derived index, validate its source revision, then publish under the existing maintenance fence. Never rewrite
  canonical gists.

  The exact emitter is MemoryMaintenance.index_lexical_rebuild.started.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.index.lexical.rebuild.started records acceptance before any maintenance effect. No event is an
  instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never
  gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed
  by CV-653; persistence and read-only history by SP-633. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-104 - memory.index.semantic.rebuild.completed semantic contract

```yaml
plan_unit_id: AMS-104
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_semantic_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-embed deterministic
  embed_text, verify embed_text_hash and rebuild/repack USearch. Follow the DL-270 amendment in section 4.2: vector_slot
  mapping and tombstones are in the separate derived redb file, never assistant_memory.redb. A source revision change
  invalidates the staged target.

  The exact emitter is MemoryMaintenance.index_semantic_rebuild.completed.v1@1.0.0. GUI command and internal job
  use the same authenticated in-process handler and durable operation identity; this defines no new UI command or
  job schedule. memory.index.semantic.rebuild.completed records the already durably settled success or failure,
  never a fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details
  are opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies.
  Event fields and all payload joins are governed by CV-654; persistence and read-only history by SP-634. Existing
  pinned protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion
  remains unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-105 - memory.index.semantic.rebuild.started semantic contract

```yaml
plan_unit_id: AMS-105
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.rebuild_semantic_index Project command and AMS section 7.2, with AMS-054 scope
  separation. This edition is project_only: actual Project permission and canonical corpus are required. It does
  not narrow or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-embed deterministic
  embed_text, verify embed_text_hash and rebuild/repack USearch. Follow the DL-270 amendment in section 4.2: vector_slot
  mapping and tombstones are in the separate derived redb file, never assistant_memory.redb. A source revision change
  invalidates the staged target.

  The exact emitter is MemoryMaintenance.index_semantic_rebuild.started.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.index.semantic.rebuild.started records acceptance before any maintenance effect. No event is
  an instruction to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never
  gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed
  by CV-655; persistence and read-only history by SP-635. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-106 - memory.verification_sweep.completed semantic contract

```yaml
plan_unit_id: AMS-106
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.verification_sweep.completed@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.verification_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-evaluate each claim under
  the current amended section 5.3 rules, including semantic support, scope and currentness; mere EvidenceRef existence
  cannot promote a claim. Preserve original versions/history and never convert Out of date into a fourth stored
  verification_state.

  The exact emitter is MemoryMaintenance.verification_sweep.completed.v1@1.0.0. GUI command and internal job use
  the same authenticated in-process handler and durable operation identity; this defines no new UI command or job
  schedule. memory.verification_sweep.completed records the already durably settled success or failure, never a
  fabricated success. No event is an instruction to merge, verify, delete, index or inject. Failure details are
  opaque authorized result refs, never gist text, prompts, embeddings, paths, secrets or EvidenceRef bodies. Event
  fields and all payload joins are governed by CV-656; persistence and read-only history by SP-636. Existing pinned
  protection, claim verification, NullMemoryProvider and locked-rule rules survive. Policy-dependent deletion remains
  unavailable until Jared settles it. Native emission and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### AMS-107 - memory.verification_sweep.started semantic contract

```yaml
plan_unit_id: AMS-107
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.verification_sweep.started@1.0.0,
  prepared without admission. Per-family current-canon search and negative evidence: reports/event-authority-20261104/DMEM-search.json.
  Reuse UCC-085''s cmd.chat.memory.verification_sweep Project command and AMS section 7.2, with AMS-054 scope separation.
  This edition is project_only: actual Project permission and canonical corpus are required. It does not narrow
  or expand AMS-054''s app memory; app-thread events require their own owner binding. Re-evaluate each claim under
  the current amended section 5.3 rules, including semantic support, scope and currentness; mere EvidenceRef existence
  cannot promote a claim. Preserve original versions/history and never convert Out of date into a fourth stored
  verification_state.

  The exact emitter is MemoryMaintenance.verification_sweep.started.v1@1.0.0. GUI command and internal job use the
  same authenticated in-process handler and durable operation identity; this defines no new UI command or job schedule.
  memory.verification_sweep.started records acceptance before any maintenance effect. No event is an instruction
  to merge, verify, delete, index or inject. Failure details are opaque authorized result refs, never gist text,
  prompts, embeddings, paths, secrets or EvidenceRef bodies. Event fields and all payload joins are governed by
  CV-657; persistence and read-only history by SP-637. Existing pinned protection, claim verification, NullMemoryProvider
  and locked-rule rules survive. Policy-dependent deletion remains unavailable until Jared settles it. Native emission
  and recovery are NOT_RUN.'
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- UCC-085
- AMS-054
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```
