# Shard 077: DL-035 terminal research consumer planning - 2026-09-09

Source: `Plans/FinalGUISpec.md`

Source lines: L37017-L37351

Source SHA256: `215e96a2c6817abda53923940c24347f339fd8bca974f488921a979c5324d238`

---

## DL-035 terminal research consumer planning - 2026-09-09

DL-035 authorizes P3–P10 planning under the PM-owned terminal engine and host direction. The following consumers use Section15 SMPFS-158 through SMPFS-165; they do not re-own parsing, host selection, output truth, commands or durable storage. Existing native terminal layout, accessible focus/input, selection, output-read and command-palette parity contracts remain in force. No change to the current visual style, pane topology or Settings manager kit is implied. Unknown capabilities and missing native/platform evidence remain explicitly unavailable, degraded or not_run. Accepted planning is not implementation or shipping acceptance.

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Automated_Testing_System.md#ATS-047

### F3-544 - Terminal Capability Shell Context And Snapshot Disclosure

```yaml
plan_unit_id: F3-544
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Terminal, Chat and Output project owner-qualified enhanced keyboard capability, richer shell context
  and provider snapshot continuity truth. Requested keyboard capability is distinct from tested effective capability;
  richer prompt metadata cannot invent authoritative command boundaries. Provider output displays append, complete
  snapshot, rolling/truncated snapshot or final-result semantics consistently, without presenting rewritten previews
  as an exact transcript.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SMPFS-158
- SMPFS-159
- SMPFS-160
- F3-360
unblocks: []
acceptance_criteria:
- P3 shows the requested/effective versioned keyboard profile and an actionable unsupported/degraded reason when
  pinned Slint/platform or local/Windows/SSH/tmux input fields cannot support it. Core support alone cannot claim
  end-to-end input support; IME, accessibility and one-owner-per-input rules remain.
- P4 continuation/right-prompt and rich-property presentation uses capability-gated source-qualified observations.
  Missing, malformed, forged or opaque metadata does not fabricate command completion; local, remote and replayed
  projections agree with the parser owner.
- P5 Chat and Output share invocation/revision identity, update classification, continuity confidence and retained-backing
  availability. Duplicate/late updates or a different final preview do not stitch or overwrite another invocation;
  uncertain continuity is disclosed and unavailable text is not reconstructed.
- Known execution completion remains independent of snapshot continuity, final preview arrival and partial/unavailable
  output. Provider output-only work acquires no PTY controls.
- ATS-047 supplies source-specific and native projection acceptance; static design or screenshots alone do not establish
  protocol/input/provider correctness.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0005
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0006
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0007
negative_constraints:
- No image protocol, provider integration, additional environment collection, multiple-snapshot retention policy
  or terminal reference-code reuse is approved by this consumer.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```

### F3-545 - Explicit Remote Terminal Compatibility Setup

```yaml
plan_unit_id: F3-545
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Remote terminal compatibility setup is an explicit per-authenticated-host action offering verified
  terminfo installation or a tested disclosed conservative profile. The UI shows exact host/environment identity,
  requested and effective capabilities, permission boundary and outcome; declining preserves ordinary SSH.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SMPFS-161
- F3-120
- SSYS-012
- UCC-160
- WM-052
- UIW-021
unblocks: []
acceptance_criteria:
- The canonical action is cmd.terminal.remote_compatibility_setup under UCC-160, WM-052 and UIW-021; no alternate
  setup command is introduced.
- Before remote writes, show the exact authenticated host/environment and installation intent and use its existing
  authorization path; host changes invalidate the old target context.
- Denied, read-only, no-tic, failed-transfer and nested SSH/mux cases preserve honest setup outcome and effective
  capability. Declined/unavailable setup leaves ordinary SSH available under its existing policy.
- Any conservative profile is explicit and disclosed; failed setup never silently substitutes TERM, installs a universal
  ssh override or launches locally.
- Existing command-palette parity, keyboard operation and accessible unavailable reasons apply to the catalogued
  setup action.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0008
negative_constraints:
- No automatic per-host installation, shell override, credential authority or new remote transport is granted.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```

### F3-546 - Pane Local Advisory Command Progress

```yaml
plan_unit_id: F3-546
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: OSC 9;4 projects pane-local advisory command progress using the Section15 attribution and deterministic
  notification-collision rule. The visible and accessible state distinguishes advisory progress from independently
  known command execution outcome; it supplies no command, Goal or work-record completion authority.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SMPFS-162
- SMPFS-023
unblocks: []
acceptance_criteria:
- Progress is scoped to the exact session and to a command only when authoritative boundaries support that association.
  Opaque sessions remain explicitly session-level advisory; stale old-command updates cannot rebind to the current
  command.
- Valid OSC 9;4 progress is not also rendered as a notification, and malformed progress candidates do not become
  notification fallthrough; consume the owner collision rule once.
- Malformed/out-of-range/colliding sequences, detach, replacement and a conflicting real exit yield the owner-defined
  state without fabricated success. Only authoritative boundaries clear/rebind command attribution.
- Accessible progress text exposes the same supported state as the visual indicator. Native/output status remains
  independent; no progress success signal can complete a command, Goal or work record.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0009
negative_constraints:
- No taskbar/dock aggregation, new notification semantics or progress-derived lifecycle authority is included.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```

### F3-547 - Safe Command Insertion And Retained Output Editor Actions

```yaml
plan_unit_id: F3-547
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Existing terminal command cards/history expose explicit insert-without-execution and open-retained-output-in-editor
  actions through the canonical command catalog and wiring. Both preserve exact source/session/command identity
  and existing authorization; insertion sends no Enter and executes nothing, and editor opening uses coherent retained
  output only.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SMPFS-163
- SMPFS-023
- F3-360
- F3-413
- UCC-160
- WM-052
- UIW-021
unblocks: []
acceptance_criteria:
- Actions are cmd.terminal.insert_command and cmd.terminal.open_retained_output under UCC-160, WM-052 and UIW-021.
  Multiline/control-bearing command text must still be inserted without executing; an unsafe destination path is
  unavailable.
- Insertion uses trustworthy command text and an explicit eligible live destination with exact cwd/worktree/remote
  context. It sends no Enter or execution-triggering input; if the route cannot guarantee non-executing insertion,
  it is unavailable with a reason. Existing paste/input guards remain effective.
- 'Insert is not rerun: it creates no execution attempt and does not mutate a completed card into a running card.
  Output opening is a read action and grants no PTY authority to output-only work.'
- Open retained output routes the same source identity to the editor, preserves exact valid text, labels partial
  output and disables unavailable backing rather than reconstructing it. A backing change during read follows SMPFS-023
  and does not rewrite known completion.
- Both actions are keyboard-accessible, discoverable through existing terminal command-palette parity and unavailable
  with owner-derived reasons when their preconditions fail. No separate history picker is required.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0010
negative_constraints:
- No shell-history-file import, retention expansion, automatic execution or quick-fix automation is included.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```

### F3-548 - Redacted Environment Provenance And Pending Launch Display

```yaml
plan_unit_id: F3-548
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: Terminal diagnostics show available redacted environment source layers and pending-for-next-launch
  changes from the execution resolver. The display distinguishes the immutable launch snapshot of the current session
  from changed settings and links to explicit session replacement under existing restart semantics.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SMPFS-164
- F3-120
- F3-360
- SSYS-006
- UCC-160
- WM-052
- UIW-021
unblocks: []
acceptance_criteria:
- Inspection uses cmd.terminal.environment_provenance; explicit replacement reuses cmd.terminal.restart_replace.
  The read action does not acquire restart or collection authority.
- Show known system/profile/project/PM source attribution only when the resolver supplies it; unknown provenance
  stays unknown. Default diagnostics expose no secrets or unrestricted environment values.
- Pending changes are visibly for the next launch and do not mutate the current session snapshot, auto-relaunch
  the shell or imply that running processes received the changes.
- Explicit restart uses the existing replacement action with a new session and invocation; ordinary reveal/attach
  and presentation reconciliation preserve identity and execute nothing.
- Host/environment, source summary and pending-change labels remain consistent between Terminal diagnostics and
  Settings; incomplete platform attribution is disclosed.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0011
negative_constraints:
- No additional environment collection, unredacted diagnostic export or automatic safe relaunch is authorized.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```

### F3-549 - Explicit Live Pane Input Protection

```yaml
plan_unit_id: F3-549
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: A live terminal pane offers explicit idempotent enable/disable input-protection actions with a visible,
  accessible protected state while output continues. Protection is distinct from historical review, process suspension
  and session termination; unlock retains the exact live session. Protection is retained for the same verified live
  session across reconnect and PM reopen; a replacement session starts unlocked. DL-038 protection covers user and agent input, with explicit blocked results for agents.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- SMPFS-165
- F3-360
- F3-413
- UCC-160
- WM-052
- UIW-021
unblocks: []
acceptance_criteria:
- Use cmd.terminal.input_protection.enable and cmd.terminal.input_protection.disable; do not substitute a non-idempotent
  toggle or a manual progress-clear action.
- Repeated enable leaves protection enabled; user typing/paste and agent input cannot reach the child; agents receive an explicit blocked result. Disable/unlock retains
  terminal_session_id and does not spawn or replay a command.
- Output continues to drain and display while protected. Focus, selection, review and accessible state remain truthful;
  protection does not imply suspension or termination.
- Close follows the existing selected confirmation/termination policy. Protecting a pane does not change close authority
  or bypass confirmation.
- The user-visible scope must match the admitted input-router policy. Retain protection across reconnect and PM
  reopen only for the exact verified live session. Replacement starts unlocked; no pane preference is inherited
  and historical metadata never proves liveness. Disclose that both user and agent terminal input are blocked, with an explicit blocked result for agents. Separate interrupt/terminate controls retain existing behavior.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md#ATS-047
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/FinalGUISpec.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-038
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
negative_constraints:
- No arbitrary pane trees, group or zoom features are introduced; protection cannot transfer as a pane preference to a replacement session or imply agent bypass.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```
