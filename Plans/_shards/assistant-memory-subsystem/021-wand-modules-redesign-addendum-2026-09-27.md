# Shard 021: Wand Modules Redesign Addendum (2026-09-27)

Source: `Plans/assistant-memory-subsystem.md`

Source lines: L2949-L3409

Source SHA256: `60372b88d295fa47f5461fef7f5fca40f5852e4ee35a66f9e1be2684b41e3b7a`

---

## Wand Modules Redesign Addendum (2026-09-27)

The 2026-09-27 redesign of the Puppet Master 5.6 Pro wand modules (design spec §8.10, frozen at `/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md`, SHA-256 `dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de`) redraws the Memory surface and its traces in chat. This addendum states what that presentation may and may not mean for this subsystem. AMS-047 and AMS-048 change no verification rule, no injection rule and no command. AMS-049..052 compile the owner's card answers of 2026-09-27: the panel's display name (DL-134), the locked-rule proposal line and memory export (DL-130), and the record of which taught rules a reply included (DL-116); AMS-053 compiles what counts as following a taught rule from the design lead's ruling on DL-116's follow-up. Chat transcript families and the accent rule belong to the Chat WOW addendum in `Plans/assistant-chat-design.md` (ACD-469..475) and are referenced, not restated.

### AMS-047 - Memory Preview, Out Of Date Display Group, And In-Chat Traces

```yaml
plan_unit_id: AMS-047
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Ordinary replies show no memory-use citations, chips, counts, previews, ribbons, permanent
  glyphs, named-note hovers, verification/proof badges or Followed/Missed rule receipts. Only after a
  durable successful save may one brief Saved to memory · View line appear; View opens the same Memory
  page as a sheet with the saved note highlighted. A requested save/edit may receive one brief success
  confirmation. Failed or no-op saves earn no successful-save line; ordinary task evidence and links remain
  available. Internal currentness remains current / needs_revalidation / source_unavailable; verification_state
  remains exactly Unverified, Verified or Discarded. Out of date, state faces and verification groups
  are retired UI only, never a fourth stored state. Memory is not rules and the 350-token ceiling stays
  internal.
gui_related: true
gui_classification_reason: >-
  Defines the saved-note page and the sole successful-save acknowledgment; no preview, state-face,
  verification group or in-chat use mark is exposed.
depends_on:
- AMS-014
- AMS-018
- AMS-021
- AMS-044
- AMS-045
unblocks: []
acceptance_criteria:
- Ordinary replies show no memory-use citations, chips, counts, previews, ribbons, permanent glyphs, named-note
  hovers, verification/proof badges or Followed/Missed rule receipts. Only after a durable successful
  save may one brief Saved to memory · View line appear; View opens the same Memory page as a sheet with
  the saved note highlighted. A requested save/edit may receive one brief success confirmation. Failed
  or no-op saves earn no successful-save line; ordinary task evidence and links remain available. Internal
  currentness remains current / needs_revalidation / source_unavailable; verification_state remains exactly
  Unverified, Verified or Discarded. Out of date, state faces and verification groups are retired UI only,
  never a fourth stored state. Memory is not rules and the 350-token ceiling stays internal.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
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
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
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
canonical_text: cmd.chat.memory.edit is the Memory page's Edit producer, with versioned plain-text edits
  and automatic inference/support checks. Prior versions and evidence remain; changed claims become Unverified
  until internal reevaluation, with explicit user statements supported only as such. No per-gist half-life
  override or memory.retention.half-life-by-kind editor remains; legacy pin protections survive. Native
  wiring still needs real evidence under CDRY-012.
gui_related: true
gui_classification_reason: Defines the plain-text Memory Edit action.
depends_on: [AMS-010, AMS-014, AMS-021]
unblocks: []
acceptance_criteria:
- cmd.chat.memory.edit is the Memory page's Edit producer, with versioned plain-text edits and automatic
  inference/support checks. Prior versions and evidence remain; changed claims become Unverified until
  internal reevaluation, with explicit user statements supported only as such. No per-gist half-life override
  or memory.retention.half-life-by-kind editor remains; legacy pin protections survive. Native wiring
  still needs real evidence under CDRY-012.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: memory_edit_bypasses_verification
reasoning_tier: standard
context_scope: assistant_memory_gui
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md, Plans/UI_Wiring_Rules.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.10 amendment
  G-30 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (part)
  (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["cmd.chat.memory.edit", "Unverified", "memory.retention.half-life-by-kind", "cmd.settings.open", "CDRY-012"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: UICommand:cmd.chat.memory.edit, UICommand:cmd.settings.open, ContractName:Plans/UI_Wiring_Rules.md

### AMS-049 - Gist Review Display Name

```yaml
plan_unit_id: AMS-049
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: The user-facing page and chat sheet are named Memory. Gist Review and Notes it took remain
  historical route/record identifiers only, not another editor or verification workflow. Existing records
  and verification_state values remain readable without exposing their internal groups. This supersedes
  the DL-134 display prescription.
gui_related: true
gui_classification_reason: The panel's visible title is user-facing copy.
depends_on: [AMS-021, AMS-047]
unblocks: []
acceptance_criteria:
- The user-facing page and chat sheet are named Memory. Gist Review and Notes it took remain historical
  route/record identifiers only, not another editor or verification workflow. Existing records and verification_state
  values remain readable without exposing their internal groups. This supersedes the DL-134 display prescription.
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-01 (WAIT
  part, card p19 E-38) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-134
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["Notes it took", "Gist Review", "DL-134", "verification_state"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
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
  Memory never changes or unlocks a retained protected taught rule. Automatic rule-change notices,
  Review links, Keep my rule / Edit my rule decision panels and memory-generated rule proposals are
  retired. A necessary rule change is an ordinary task decision; requested edits use the
  written-instruction owner at Settings > Personas & Crews > Defaults > Standing instructions.
  Legacy cmd.chat.teach.set_lock and locked-record codecs remain internal compatibility/protection
  only, without an ordinary lock/unlock or rollback control. Internal upkeep cannot weaken retained
  protections.
gui_related: true
gui_classification_reason: >-
  Retires the ordinary locked-rule proposal and lock/unlock surfaces while preserving internal
  protections.
depends_on: [AMS-047, AMS-021]
unblocks: []
acceptance_criteria:
  - "Requested written-rule edits use their existing instruction writer; Memory never edits those rules or offers lock/unlock, conflict, source or rollback controls."
  - "Retained protected records keep their internal safeguards; maintenance and summarization never weaken them."
  - "Only a durable successful save may add Saved to memory · View to a reply; View opens the one Memory page as a sheet. No memory-use citation, receipt, tick, chip, count, source detail, verification or Followed/Missed decoration is shown."
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-05 (WAIT
  part, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-130
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens: ["It won't change unless you say so.", "Keep my rule", "Edit my rule…", "cmd.chat.teach.open_memory", "cmd.chat.memory.discard", "cmd.chat.teach.set_lock", "DL-130"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: UICommand:cmd.chat.teach.open_memory, UICommand:cmd.chat.memory.discard, UICommand:cmd.chat.teach.capture, UICommand:cmd.chat.teach.set_lock, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-051 - Taught Rules Included In A Reply

```yaml
plan_unit_id: AMS-051
unit_type: schema_contract
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: included_teaching_ids records each rule/version actually included in a reply's context,
  independently of whether it was obeyed. Keep internal records; inclusion proves no compliance. Retire
  ordinary Followed/Missed/Used reply receipts and named-rule hovers; Instructions remains directly inspectable.
gui_related: true
gui_classification_reason: >-
  Internal inclusion records are retained without reply rule/verification receipts; written
  instructions remain directly editable.
depends_on: [AMS-018, AMS-025]
unblocks: [AMS-053]
acceptance_criteria:
- included_teaching_ids records each rule/version actually included in a reply's context, independently
  of whether it was obeyed. Keep internal records; inclusion proves no compliance. Retire ordinary Followed/Missed/Used
  reply receipts and named-rule hovers; Instructions remains directly inspectable.
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card
  n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-116
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
- "DL-475 follow-up; verified Ember Memory round, 2026-11-12"
preserved_exact_tokens: ["included_teaching_ids", "Followed", "Used", "DL-116"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md]
```

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-052 - Export Memory

```yaml
plan_unit_id: AMS-052
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Keep cmd.chat.memory.export with existing scope gists | teachings | all, artifact owner
  and ArtifactExportResult, reachable through general data export and the Instructions owner, not an Export
  workbench on Memory. Exports use the authorized explicit Project, personal or calling private app-thread
  view only, never other private chats or an all-Project enumeration. Preserve stored verification_state
  and pointer-only EvidenceRef entries; exporting neither upgrades support nor changes/pins/discards memories.
  Existing availability/handler/permission gates remain; broader unavailable codecs need explicit adoption
  before use.
gui_related: true
gui_classification_reason: Export is a user-visible action on the Memory surface and the taught-rules document.
depends_on: [AMS-006, AMS-010, AMS-021]
unblocks: []
acceptance_criteria:
- Keep cmd.chat.memory.export with existing scope gists | teachings | all, artifact owner and ArtifactExportResult,
  reachable through general data export and the Instructions owner, not an Export workbench on Memory.
  Exports use the authorized explicit Project, personal or calling private app-thread view only, never
  other private chats or an all-Project enumeration. Preserve stored verification_state and pointer-only
  EvidenceRef entries; exporting neither upgrades support nor changes/pins/discards memories. Existing
  availability/handler/permission gates remain; broader unavailable codecs need explicit adoption before
  use.
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
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-07 (WAIT
  part N-7, card p15 E-32) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/cards.json (SHA-256 61bb8f6b19684c7ed0df1f6c92daf3e0ee94b6b07fd4c7e8f9b70c9717caa37a)
- Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-130
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; N12/N16/N24
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["Export memory", "cmd.chat.memory.export", "gists | teachings | all", "ArtifactExportResult", "verification_state", "DL-130"]
negative_constraints:
- Do not widen privacy, source restrictions or held maintenance authority by migration or hidden controls.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/UI_Command_Catalog.md]
```

ContractRef: UICommand:cmd.chat.memory.export, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Decision_Log.md#DL-130

### AMS-053 - What Counts As Following A Taught Rule

```yaml
plan_unit_id: AMS-053
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: Keep included_teaching_ids and saved rule_check_outcomes (passed / failed / could_not_run)
  internally at the included version. Run checks only after a finished reply; inclusion alone proves nothing,
  could_not_run never becomes success and reopening reads saved results. Remove the ordinary Followed
  and Missed reply lines, counts, rule hovers and taught_rule_check fix-link producer from replies. A
  meaningful rule failure is handled as a task failure through normal task interaction; no automatic resend,
  rewrite or fix starts.
gui_related: true
gui_classification_reason: Retires ordinary rule-check reply receipts while retaining internal records.
depends_on: [AMS-051, AMS-018]
unblocks: []
acceptance_criteria:
- Keep included_teaching_ids and saved rule_check_outcomes (passed / failed / could_not_run) internally
  at the included version. Run checks only after a finished reply; inclusion alone proves nothing, could_not_run
  never becomes success and reopening reads saved results. Remove the ordinary Followed and Missed reply
  lines, counts, rule hovers and taught_rule_check fix-link producer from replies. A meaningful rule failure
  is handled as a task failure through normal task interaction; no automatic resend, rewrite or fix starts.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-ledger-compile-witness.py Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage --base origin/main
risk_class: rule_inclusion_presented_as_obedience
reasoning_tier: standard
context_scope: assistant_memory_prompt_record
implementation_surfaces: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md, Plans/FinalGUISpec.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: memory_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-followups-20260929/ANSWERS-20260929.md (SHA-256 345247dfb965fa19ae2f68847125c5b6cafe26126a56bb5b80242e88d3fa9d5c;
  DL-138, questions 18-19)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md#8.11 (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/IMPACT-REGISTER.md#B-AMS-06 (card
  n07 E-36) (SHA-256 71227f8edda108ed849256d909ff12f859f98bef58202ef988f9d3b4e4f8d493)
- /mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/ANSWERS.json (SHA-256 4f8d3b25857faab5237b33f80d116b421fd75e81a89c233aaed19dcd8ecb844f)
- Design lead ruling of 2026-09-27 on the DL-116 follow-up (the definition of following), recorded in
  Plans/ledgers/v2/pldg-20260927-004-wand-memory-plan-usage
- Plans/Decision_Log.md#DL-116
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
preserved_exact_tokens: ["Followed", "Missed 1 of your rules", "included_teaching_ids", "rule_check_outcomes", "could_not_run", "Missed 1 of your rules · followed 2", "cmd.review.send_findings_to_agent", "source_kind", "taught_rule_check", "reply_message_id", "missed_teaching_refs", "Used", "DL-116"]
negative_constraints:
- Do not resurrect the retired verification, pin, preview, rule-receipt or maintenance UI.
- Do not claim a write succeeded before durable commit or upgrade unsupported facts.
owner_hints: [Plans/assistant-memory-subsystem.md, Plans/assistant-chat-design.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Decision_Log.md#DL-116

### AMS-054 - Thread-Private App Memory And Explicit Carry-Over

```yaml
plan_unit_id: AMS-054
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-memory-subsystem.md
canonical_text: 'Private no-project app working sets remain thread-only: project_id=null with actual Computer/thread
  and explicit storage identity, SP-349 keys and original application codecs. The two visible levels are
  This project and Every project. This project binds the actual Project; Every project holds explicitly
  personal reusable notes for the same user. Availability selection is explicit; no relabeling, automatic
  promotion of private Project/app-thread content, or implied cross-Project sharing is allowed. Screen
  secrets and preserve source restrictions before broadening; if safe separation cannot be established,
  refuse the broader save. Private app-thread notes remain in their existing thread-only scope and never
  enter Every project by migration. The Assistant remains the writer and manager. Crews, reviews and the
  chat assistant''s other helpers may read the current Project''s notes and the user''s personal notes
  at Every project, read-only, subject to current source, actor, phase and permission restrictions. This
  grants no other Project access, helper-owned memory or access to private app-thread memory. NullMemoryProvider
  remains the denied/disabled path; read-only access cannot call upsert, delete or verification mutations.
  Personal availability is an explicit logical user partition in the existing local memory architecture,
  not a new database/service or per-helper store; it does not imply device sync. Existing private records
  never migrate to that partition automatically. Conversion adopts destination memory only through source-restricted
  owner-checked carry-over with lineage; no relabeling or copied capsule grants authority. Existing original
  codecs remain readable and native source/currentness/retention/backup proofs remain prerequisites.'
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
- Authorized helpers can read current Project notes and the same user's personal notes without mutation
  authority.
- Other Project notes and private app-thread memory stay unavailable, including via summaries/handoffs.
- Original storage, source/currentness, retention and native admission prerequisites remain.
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
- DL-475; Jared 2026-11-11, quiet Memory and Goals rulings, settings batch 2
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
- Do not create helper-owned memory or widen source/phase permissions.
- Do not expose private app-thread or other Project notes by null scope, known ID or paraphrase.
owner_hints:
- Plans/assistant-memory-subsystem.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/assistant-memory-subsystem.md#AMS-054, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365
