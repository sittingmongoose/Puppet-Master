# Shard 021: Accepted Terminal Research Capabilities — DL-035 (2026-09-09)

Source: `Plans/Section15_MVP_Promoted_Features_Spec.md`

Source lines: L10674-L11311

Source SHA256: `e750a78018fc0ec74c2408635d69f122e1f9a59c26ba6d8a5c8508f534bdf091`

---

## Accepted Terminal Research Capabilities — DL-035 (2026-09-09)

DL-035 accepts P3–P10 for planning under the PM-owned terminal direction established in §3.14. The following eight PlanUnits preserve the accepted feature decisions and their scope; they create no implementation, WorkNodes, NodeSeeds or executable queues and do not claim runtime, security, visual or performance acceptance. Earlier research-packet labels such as pending or unapproved are source history superseded by DL-035; their acceptance examples and negative constraints remain lineage.

| Decision | Section15 owner | Runtime contract and held subordinate choices |
|---|---|---|
| P3 | SMPFS-158 | Optional negotiated enhanced keyboard profile; exact enhancement extent and pinned host/toolkit feasibility held until evidence supports the affected path. Keyboard support does not admit images. |
| P4 | SMPFS-159 | Rich continuation/right-prompt/properties in PM's parser; additional environment-reporting intake held. No third-party parser alternative. |
| P5 | SMPFS-160 | Append/complete-snapshot/rolling-snapshot/final classification; a bounded current snapshot when continuity is unknown, with historical-version retention held and no provider integration selected. |
| P6 | SMPFS-161 | Explicit host-authorized verified terminfo or disclosed compatible profile; decline preserves ordinary SSH and failure cannot target a local shell. |
| P7 | SMPFS-162 | Pane-local advisory OSC 9;4; progress owns the collision namespace once, malformed progress never falls through to notifications, and progress never settles work. |
| P8 | SMPFS-163 | Existing-card insert-without-execute and retained-output editor actions with current target checks and whole-range backing truth. |
| P9 | SMPFS-164 | Available redacted provenance and pending next-launch differences; explicit restart replacement only, no extra environment intake or automatic relaunch. |
| P10 | SMPFS-165 | Idempotent visible live-pane input protection retained for the same verified live session; replacements start unlocked. Both user and agent input are blocked; agents receive an explicit blocked result under DL-038. |

These owner semantics feed FinalGUI's visible surfaces, Settings preferences, the catalog's exact commands, Wiring dispatch and Automated Testing acceptance. They do not introduce parallel command handlers, new transcript/storage families or provider/daemon installation authority. The only newly named user actions are the catalog-owned remote compatibility setup, insert command, open retained output, environment provenance and explicit input-protection enable/disable; P9 reuses `cmd.terminal.restart_replace`. P7 requires no new manual-clear command. P11 is evaluation-only under Server System and grants no engine/library selection here.

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Settings_System.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Server_System.md

### SMPFS-158 - Enhanced Keyboard Protocol Capability Profile

```yaml
plan_unit_id: SMPFS-158
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: PM owns an optional negotiated enhanced keyboard profile with versioned per-path support, legacy
  input before supported negotiation, independent bounded normal/alternate-screen state and truthful input-field
  availability. Enhancement extent and pinned Slint/platform feasibility remain held subordinate choices.
gui_related: false
gui_classification_reason: Input protocol, state and capability admission; visible controls are owned by FinalGUI
  and Settings.
split_recommended: false
depends_on:
- DL-035
- SMPFS-070
- SMPFS-124
- SMPFS-130
unblocks: []
acceptance_criteria:
- Use the PM-owned parser and input encoder. Record profile/protocol version, family, active negotiated state, actual
  platform/transport/version, source and unsupported/degraded reason; a current-flags reply is not a universal supported-feature
  bitmap.
- Keep legacy input until an application enables a supported enhancement. Distinguish the non-mutating CSI ? u query
  from CSI > flags u push/enable, and test query/set/push/pop sequences (?, =, >, <) split at every byte. Push/pop
  storage is bounded, normal and alternate screen stacks are independent, and return/reset behavior follows the
  admitted profile.
- The end-to-end OS/backend to Slint/Winit to PM encoder to transport field matrix distinguishes physical/produced
  key identity, modifiers, repeat/release, layout/dead-key and committed text. Never synthesize physical keys from
  IME text or dispatch both a raw key text and its duplicate IME commit.
- Acceptance covers modifiers, repeat/release, Enter/Tab/Backspace, dead keys, non-US layout changes, numpad, Unicode/IME
  composition/commit/cancel, focus loss, nested TUIs, independent and overflow/empty stacks, app crash/reset, unsupported
  queries and DA1 ordering. One input has one eligible owner; read-only Chat previews gain no input ownership.
- Exercise actual supported native Windows/WSL, macOS, Linux and admitted remote/SSH/tmux paths. A capable PM encoder
  alone cannot prove a host/toolkit path supports every field; disclose partial/unavailable behavior and never advertise
  more than tested.
- The feature is accepted for planning; selected enhancement extent and pinned Slint/platform feasibility must be
  resolved from capability/conformance evidence before enabling or advertising the affected path. No full-support
  claim or backend hook is implicitly selected.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p3
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p3_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0005
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P3
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P3
- 'P3: hybrid L-5746f5c667fd; premium L-ae203bd99176; input feasibility embedded L-c91a7e42d803 / registry L-32d391838063'
source_atom_ids:
- atom-0005
negative_constraints:
- Keyboard negotiation does not approve image protocols, image decoding/retention or reference terminal code reuse.
- Do not infer crash mode restoration without protocol/reset evidence or treat query as a mode-changing command.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Settings_System.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/Automated_Testing_System.md
```

### SMPFS-159 - Richer Shell Context In The PM Parser

```yaml
plan_unit_id: SMPFS-159
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: The PM-owned semantic parser admits capability-gated continuation/right-prompt boundaries and rich
  shell properties with source-qualified confidence, ordered output and consistent local/remote/replayed projections.
  Additional environment reporting remains a held intake decision.
gui_related: false
gui_classification_reason: Source-qualified shell metadata and parsing, not a new visual surface.
split_recommended: false
depends_on:
- DL-035
- SMPFS-022
- SMPFS-070
- SMPFS-124
- SMPFS-129
- SMPFS-130
unblocks: []
acceptance_criteria:
- When a supported shell authoritatively provides continuation or right-prompt boundaries and admitted rich properties,
  retain their protocol version, owning session/block, source and confidence. Missing or unverified properties stay
  unknown or degraded; retain the non-integration transcript without inventing command text, boundaries or exit.
- Extend only the PM-owned parser/capability implementation. A minimal extension and shared PM-owned capability
  implementation may be compared using the same byte-stream corpus; the third-party parser/library reuse alternative
  is superseded by DL-035.
- Preserve output ordering across lifecycle events, including output immediately before completion D; metadata arrival
  does not hide pending output or replace the separate completion/backing truth under SMPFS-022/023.
- Acceptance splits every supported sequence at every chunk boundary and includes nested/continuation/right prompts,
  malformed/bare/unknown parameters, forged command-line signals, output before completion and shell-hook loss.
  Compare local, remote and replayed semantic projections with explicit degraded tiers.
- Only admitted properties use bounded, scrubbed owner storage/source refs. Environment-reporting intake and any
  additional sensitive property scope are held for an explicit owner decision; this accepted richer-context feature
  grants no new environment collection authority.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p4
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p4_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0006
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P4
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P4
- 'P4: hybrid file-local L-0691010de814 / registry L-5f393eabe4ff'
source_atom_ids:
- atom-0006
negative_constraints:
- No source label or successful nonce authenticates unrelated terminal output or grants broader execution/clipboard
  authority.
- Do not copy reference parser code or adopt its lifecycle/storage assumptions.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Automated_Testing_System.md
```

### SMPFS-160 - Provider Output Snapshot Classification

```yaml
plan_unit_id: SMPFS-160
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: For an independently admitted provider with cumulative or rewritten output, PM classifies append,
  complete snapshot, rolling/truncated snapshot and final result, using invocation/source revision identity and
  coherent bounded projection instead of inferred lossless text stitching.
gui_related: false
gui_classification_reason: Provider-adapter revision and output availability contract consumed by Chat/Output.
split_recommended: false
depends_on:
- DL-035
- SMPFS-023
- SMPFS-133
unblocks: []
acceptance_criteria:
- An admitted adapter documents which updates are append, complete snapshot, rolling/truncated snapshot or final
  authoritative result. Carry invocation/source identity, offsets/revisions when supplied, availability/truncation
  and settlement separately from the displayed text.
- Prefer provider offsets/revisions. When reliable continuity metadata is absent, retain a bounded current snapshot
  with disclosed truncation/uncertain continuity; matching repeated text alone cannot establish byte origin or a
  lossless reconstructed transcript.
- Final replacement is coherent for concurrent readers and invalidates affected obsolete text/range associations
  atomically or through one consistent revision. Known command completion remains independent; a different final
  preview or missing output/exit cannot fabricate success, a new invocation or a PTY.
- Acceptance covers repeated 8-or-more-character motifs, shorter rewrites, no overlap, truncation-marker insertion/removal,
  duplicate updates, late partial after final, final preview differing from stream, missing exit and concurrent
  UI reads. Readers see one coherent revision or explicit partial/unavailable output.
- Chat and Output consume the same revision/availability projection. Output-only work has no live PTY input controls,
  and an update to text cannot acquire terminal-session or command-block authority.
- Keeping multiple historical snapshot versions is a held retention decision. This PlanUnit permits no provider
  integration by itself, and no storage family, infinite transcript or historical-version retention is assumed.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p5
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p5_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0007
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P5
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P5
- 'P5: hybrid file-local L-1703bf453a12 / registry L-6b1455da4870'
source_atom_ids:
- atom-0007
negative_constraints:
- Do not adopt a heuristic overlap threshold as proof of continuity or use text equality to identify an invocation.
- Do not suppress known completion because snapshot backing is replaced or lost.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Tools.md
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Automated_Testing_System.md
```

### SMPFS-161 - Per-Host Remote Terminal Compatibility Setup

```yaml
plan_unit_id: SMPFS-161
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Explicit opt-in compatibility setup binds verified terminfo installation or a disclosed conservative
  terminal profile to the exact authenticated Host/Environment, preserves ordinary SSH when declined, and never
  retargets a failed remote request locally.
gui_related: false
gui_classification_reason: Permission-bound host capability setup; visible controls are consumer-owned.
split_recommended: false
depends_on:
- DL-035
- SMPFS-070
- SMPFS-132
unblocks: []
acceptance_criteria:
- cmd.terminal.remote_compatibility_setup previews the selected exact authenticated host/environment, proposed terminfo
  source/version and remote writes or profile change. Existing host trust, permissions and execution policy apply
  before any side effect; merely discovering a host or opening a view does not authorize setup.
- Offer verified per-host terminfo installation or a disclosed conservative TERM profile only when its advertised
  capabilities match the PM engine and tested transport. Verify installed source/version and outcome; no universal
  ssh override or silent TERM substitution.
- Declining, failed verification or unavailable setup leaves ordinary SSH usable and its previous configuration
  unchanged where no approved write occurred. If a partial approved write happened, report its actual effect and
  recovery rather than claiming rollback; missing features degrade honestly without local launch fallback.
- Acceptance covers denied authentication/writes, read-only/no-tic hosts, failed transfer/install, shell override
  conflicts, no integration, reconnect, host changes, mixed capability and nested SSH/mux. Probe advertised versus
  effective behavior, record exact source/host and reject stale-target authorization.
- The setup action grants no daemon installation or credential authority and does not select the P11 multiplexer.
  Release/host compatibility and permission prerequisites remain separate from the opt-in UI.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p6
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/Server_System.md
- Plans/Settings_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p6_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0008
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P6
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P6
- 'P6: premium J7/J9 L-4175fac24158, remote compatibility direction'
source_atom_ids:
- atom-0008
negative_constraints:
- Do not silently edit shell startup or replace ssh globally.
- No unsupported remote context may turn into local execution.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/Permissions_System.md
- Plans/Server_System.md
- Plans/Settings_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/Automated_Testing_System.md
```

### SMPFS-162 - Pane Advisory OSC Progress And Collision Policy

```yaml
plan_unit_id: SMPFS-162
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: OSC 9;4 updates pane-local advisory progress under exact session and qualified command attribution.
  The namespace resolves deterministically to progress once, never a duplicate notification or authoritative work
  completion.
gui_related: true
gui_classification_reason: Pane-local advisory state is displayed to the user; visual design stays with FinalGUI.
split_recommended: false
depends_on:
- DL-035
- SMPFS-022
- SMPFS-023
- SMPFS-124
unblocks: []
acceptance_criteria:
- Reserve OSC 9;4 for advisory progress. A valid message is handled exactly once by the progress path and never
  also delivered through an overlapping notification interpretation; malformed/out-of-range OSC 9;4 is ignored or
  diagnosed as invalid progress and must not fall through to notifications. Other notification protocols keep their
  existing policy.
- Project valid determinate/indeterminate/error/clear states only as terminal-supplied advisory data. A percentage
  is determinate only under valid protocol numeric semantics and a defensible reported denominator; it is not independently
  verified task progress.
- Bind progress to the exact terminal session and only to a command block when its source/ordered authoritative
  boundaries support that attribution. Opaque integration stays explicitly session-advisory. Authoritative command
  boundary or session replacement clears/resets old association; legitimate protocol clear remains supported without
  introducing a new manual-clear command.
- Fence identifiable late messages from an earlier session/command generation. If a stream cannot distinguish a
  late producer from the current command, retain/disclose uncertain session-level attribution rather than inventing
  command ownership.
- Acceptance replays numerical, indeterminate, reset, malformed/out-of-range and colliding sequences, unknown boundaries,
  command restart, late old-command updates, detached panes and disagreement with actual exit status. Valid collision
  input causes one progress projection and zero overlapping notifications; invalid progress causes neither a notification
  nor work settlement.
- OSC success/error, 100 percent or clear never completes or fails a command, Goal or ObservableWork, and does not
  modify independently known lifecycle/exit facts. Shared progress presentation consumes the advisory qualifier
  and exact attribution.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p7
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Shared_Integration_Runtime.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p7_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0009
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P7
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P7
- 'P7: premium J7/J9 L-4175fac24158, progress/collision direction'
source_atom_ids:
- atom-0009
negative_constraints:
- No taskbar/dock aggregation, new notification family or polling/request producer is authorized.
- Do not infer authoritative command completion or source trust from terminal-supplied progress.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Shared_Integration_Runtime.md
- Plans/Automated_Testing_System.md
```

### SMPFS-163 - Insert Command And Open Retained Output

```yaml
plan_unit_id: SMPFS-163
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Existing command cards offer insert-without-execute and open-retained-output-in-editor through the
  canonical catalog/wiring, with trustworthy command text, exact execution context and coherent retained-output
  availability.
gui_related: true
gui_classification_reason: Two accepted command-card actions have visible eligibility and exact-context behavior.
split_recommended: false
depends_on:
- DL-035
- SMPFS-022
- SMPFS-023
- SMPFS-070
unblocks: []
acceptance_criteria:
- cmd.terminal.insert_command uses usable trustworthy captured command text and the exact selected live target/session
  context. Selection/insertion executes nothing and sends no Enter; subsequent execution is a separate action under
  current authorization. Retain source cwd/worktree/remote origin rather than presenting a historical command as
  current-context evidence.
- Check prompt/input eligibility and guarantee an insert-only path before mutation. Multiline text, CR/newline/control
  content and an active TUI cannot bypass the no-execution guarantee through blind PTY writes. If the target path
  cannot insert safely without execution, return an explicit no-effect blocked/unavailable result rather than executing,
  silently rewriting text or creating a shell.
- cmd.terminal.open_retained_output reads a coherent retained view under SMPFS-023, labels origin and partial/truncated
  backing, and routes through existing editor/file identity. Missing output is unavailable and cannot be reconstructed
  from command metadata; exact remote host/path identity is preserved rather than silently opening an unrelated
  local path.
- Acceptance verifies selection/insertion once without execution, untrustworthy/redacted/unavailable command text,
  multiline/control-bearing input, stale or busy/TUI target, current permission checks, pruned/mid-range missing
  output, concurrent pruning, partial output labeling and ambiguous remote-path resolution. Rerun continues through
  the existing distinct command and new invocation policy.
- No shell-history file import, broader retention, automatic quick fix, guessed Problems row or busy-port kill is
  introduced. A separate picker is not required for the two existing-card actions.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p8
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
- Plans/FileManager.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p8_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0010
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P8
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P8
- 'P8: premium J10/J11 L-12318245bed6'
source_atom_ids:
- atom-0010
negative_constraints:
- Do not make insertion an alias for rerun or exact-copy unknown/redacted text.
- Do not equate opening an output artifact with terminal liveness or execution authority.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
- Plans/FileManager.md
- Plans/Automated_Testing_System.md
```

### SMPFS-164 - Environment Provenance And Pending Launch Changes

```yaml
plan_unit_id: SMPFS-164
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: Terminal sessions expose available redacted environment provenance and pending-for-next-launch changes
  while preserving the live launch snapshot; explicit restart replacement creates a new session under current context
  and authorization.
gui_related: true
gui_classification_reason: Redacted source-layer and pending-change display is a visible session inspector.
split_recommended: false
depends_on:
- DL-035
- SMPFS-070
- SMPFS-132
unblocks: []
acceptance_criteria:
- cmd.terminal.environment_provenance opens the existing session context through a redacted projection of available
  system/profile/project/PM source layers and effective launch facts. Unknown or partial provenance stays explicitly
  unknown/partial; never infer a source layer from a current value alone.
- Pending Settings/profile/environment changes describe the next launch only; do not rewrite a running process environment,
  its recorded launch snapshot or historical evidence. cmd.terminal.restart_replace remains the explicit action,
  creates a new terminal_session_id and records the newly resolved effective environment without automatic command
  replay.
- Acceptance changes Settings/profile while work runs, displays source-layer differences and unknown sources, confirms
  secret-free default diagnostics, retains historical values and verifies an explicit restart produces a new identity
  with current permission/host/context checks.
- Existing Clear semantics preserve session identity; backend repaint is new output and cannot resurrect deleted
  retained-history associations. IME/chord/TUI routing still produces one action; a provenance view cannot intercept
  terminal input ownership.
- Additional environment collection and automatic safe relaunch remain held product/intake decisions. Reuse available
  owner-approved provenance/summary refs; this display does not enable richer environment-reporting intake under
  P4 or create a new store family.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p9
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p9_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0011
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P9
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P9
- 'P9: premium J10/J11 L-775a21ac31f1'
source_atom_ids:
- atom-0011
negative_constraints:
- No secret environment values in default diagnostics or implicit export.
- No automatic restart, predictive echo or environment mutation of a live session.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library or
  reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/storage-plan.md
- Plans/UI_Command_Catalog.md
- Plans/Automated_Testing_System.md
```

### SMPFS-165 - Live Pane Input Protection

```yaml
plan_unit_id: SMPFS-165
unit_type: requirement
status: accepted
owner_doc: Plans/Section15_MVP_Promoted_Features_Spec.md
canonical_text: A live pane has explicit idempotent input-protection enable/disable actions with visible state;
  user typing/paste and agent input are blocked while output continues, and unlocking retains the same session. Protection
  persists only for the same verified live session; replacement sessions start unlocked. DL-038 requires an explicit blocked result for agents.
gui_related: true
gui_classification_reason: Visible explicit protection state and blocked-input feedback for a live pane.
split_recommended: false
depends_on:
- DL-035
- SMPFS-070
- DL-037
unblocks: []
acceptance_criteria:
- cmd.terminal.input_protection.enable and cmd.terminal.input_protection.disable set an explicit state for
  the exact pane/session rather than toggling. Repeating either action is idempotent; stale/replaced targets
  cannot alter another session.
- When input protection is active, user typing/paste and agent input cannot reach the child; agents receive an explicit blocked result with no child write. Output ingestion/draining continues, and visible scope and blocked-input feedback remain accessible. It is a live input guard, not
  historical review-only state, process suspension or a replacement terminal session.
- Disable restores eligible user and agent input under existing authority to the same session; blocked attempts are not silently queued or replayed on unlock. Pane close continues the existing explicit close-versus-terminate
  confirmation; protection does not silently terminate, disable independent emergency stop/kill authority or
  imply suspended execution.
- Acceptance covers repeated enable/disable, typing and paste while protected, continued high-volume output,
  same-session unlock, focus/detach changes, stale session replacement and close confirmation. Reload/restore
  verifies the same live session before restoring protection; replacement and historical-only records cannot
  inherit a live lock. Agent-input acceptance verifies explicit blocked results and zero child writes through direct and command-mediated input routes while output continues; separate interrupt/terminate controls retain existing behavior.
- Keep protection across detach, reconnect and reopening PM only for the exact verified same live terminal
  session. A replacement session starts unlocked; no pane preference is copied to it, and a historical record
  never implies live protection. DL-038 blocks both user and agent terminal input through the same owner guard, without implicit unlock or agent bypass. Separate interrupt/terminate controls keep existing authority; blocking terminal input does not block those independent controls or prove runtime readiness.
- Planning acceptance only; no implementation, WorkNodes, NodeSeeds, executable queues or runtime/visual/security/performance
  pass is produced by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/Automated_Testing_System.md — DL-035 terminal acceptance fixtures (future execution)
risk_class: terminal_protocol_or_authority_drift
reasoning_tier: high
context_scope: terminal_research_p10
implementation_surfaces:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: terminal_p10_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-038
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS_PLAIN_20260909.md:P10
- PM-Experiments/research-audit-native-20260907/process-pilot-20260908/DECISIONS.md:P10
- 'P10: premium J10 L-98daa34e3284'
- Plans/Decision_Log.md#DL-037
source_atom_ids:
- atom-0012
negative_constraints:
- No agent input bypass, implicit unlock or pane-wide lock inheritance; historical state cannot prove live protection.
- No arbitrary pane trees, new group/zoom feature, process suspension or guarantee that historical review-only
  protects a live process.
- PM owns the engine, parser and OS-API process host; no third-party emulator/parser/PTY-abstraction library
  or reference-product code reuse.
owner_hints:
- Plans/Section15_MVP_Promoted_Features_Spec.md
- Plans/FinalGUISpec.md
- Plans/Settings_System.md
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.md
- Plans/Automated_Testing_System.md
```
