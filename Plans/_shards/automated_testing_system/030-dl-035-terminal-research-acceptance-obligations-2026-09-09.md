# Shard 030: DL-035 terminal research acceptance obligations - 2026-09-09

Source: `Plans/Automated_Testing_System.md`

Source lines: L4150-L4269

Source SHA256: `097faf23fbdf2c72d259b9a885e2eb5cf39a3cc5c8e96ae562f043e8f6ec487d`

---

## DL-035 terminal research acceptance obligations - 2026-09-09

ATS-047 binds the approved P3–P10 plans to the following acceptance cases, consuming the PM-owned engine/host and existing ATS-021/ATS-022 corpus. These are required future fixtures and evidence, not registered executable tasks or claims that fixture files already exist. Parser/model checks, native host/toolkit input, provider-specific integration, permission/security, recovery and visible/accessibility results must be reported separately. Each native receipt identifies exact PM revision, OS/platform, toolkit/backend, protocol/profile and tested transport; missing runners, absent provider integrations and held policy cases remain not_run or explicitly blocked with a reason, never an inferred pass.

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Settings_System.md#SSYS-034, ContractName:Plans/UI_Command_Catalog.md#UCC-160, ContractName:Plans/Wiring_Matrix.md#WM-052

### ATS-047 - Approved Terminal Research Protocol And Consumer Acceptance

```yaml
plan_unit_id: ATS-047
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: P3 through P10 require source-specific protocol, parser, provider snapshot, remote compatibility,
  advisory progress, safe command action, environment-provenance and live input-protection acceptance. The cases
  consume Section15 owners and preserve independent execution outcome, read/backing truth and honest platform status;
  unresolved subordinate policy cases remain held and native results unexecuted.
gui_related: true
gui_classification_reason: Visible terminal capability, action, settings, accessibility or projection acceptance
  is directly specified.
split_recommended: false
depends_on:
- ATS-021
- ATS-022
- SMPFS-158
- SMPFS-159
- SMPFS-160
- SMPFS-161
- SMPFS-162
- SMPFS-163
- SMPFS-164
- SMPFS-165
- F3-544
- F3-545
- F3-546
- F3-547
- F3-548
- F3-549
- SSYS-034
- UCC-160
- WM-052
unblocks: []
acceptance_criteria:
- 'P3 keyboard profile: non-mutating capability queries; bounded push/pop; independent normal/alternate stacks;
  byte/chunk boundaries; reset and crash behavior; and one owner per input. Cover modifier/key identity, IME, accessibility,
  shortcuts, paste and local/Windows/SSH/tmux paths against pinned toolkit/platform field availability. Unsupported
  fields cannot be advertised from engine-only evidence; images remain outside approval.'
- 'P4 richer shell context: split sequences at byte boundaries; output before completion; malformed/forged sequences;
  nested/continuation/right prompts; and capability-qualified rich properties. Local, remote and replayed projections
  agree on source-qualified metadata; malformed/opaque signals never invent authoritative boundaries or completion.
  PM parser ownership and bounded scrubbed metadata remain intact; no expanded environment intake is assumed.'
- 'P5 provider updates: repeated motifs, shorter rewrites, no overlap, duplicate/late updates, a final result different
  from the last preview and concurrent readers. Verify append/complete-snapshot/rolling-or-truncated-snapshot/final
  classification, provider offsets/revisions when supplied, exact invocation/revision attribution and disclosed
  uncertain continuity without heuristic stitching. Chat and Output agree. Whole-range backing/finality remains
  independent of known completion; provider output acquires no PTY authority, provider selection or multiple-version
  retention approval.'
- 'P6 remote compatibility: denied authorization, read-only and no-tic hosts, failed transfer, changed authenticated
  host/environment and nested SSH/mux. Verify per-host permission and terminfo provenance, advertised/effective
  capability agreement and visible setup/fallback outcome. Decline preserves ordinary SSH; failure causes no local
  launch, silent TERM substitution or universal ssh override.'
- 'P7 advisory progress: malformed, out-of-range and colliding sequences; opaque boundaries; stale old-command updates;
  detach/replacement; and conflict with real exit. Valid OSC 9;4 is handled once as progress; invalid candidates
  are ignored/diagnosed without notification fallback. Only authoritative boundaries clear/rebind command association;
  opaque progress remains session advisory. Neither success progress nor the accessible indicator completes a command,
  Goal or work record; other notification policy and taskbar/dock scope remain unchanged.'
- 'P8 safe actions: insertion sends no Enter and performs no execution, including multiline/control-bearing history
  and unsupported destination paths. Trustworthy text, current authorization and exact cwd/worktree/remote/session
  identity are preserved; an unsafe insert-only path is unavailable rather than a raw PTY write. Retained-output
  editor opening preserves exact valid source text and identity, labels partial output and never reconstructs unavailable
  data. Include backing mutation during concurrent read and verify no change to known completion, rerun/replacement
  or attach identity semantics.'
- 'P9 environment provenance: unknown or incomplete layer attribution remains unknown, secrets are absent from default
  diagnostics and pending changes do not mutate the live launch snapshot. Terminal and Settings show the same exact
  source/Host/Environment and effect timing. Explicit restart replacement creates a new session/invocation; reveal/attach
  does not replay. No extra collection or automatic relaunch is inferred.'
- 'P10 input protection: repeated enable stays enabled; user typing/paste and agent input cannot reach the child; output continues
  draining/displaying; unlock preserves the exact session; and close obeys the existing selected confirmation policy
  without implying suspension. Visible and accessible scope agrees with the admitted router. Reconnect/PM reopen
  retains protection only for the same verified live session; replacement starts unlocked and pane preference inheritance
  is rejected. Historical metadata cannot establish liveness. Agent-input cases assert an explicit blocked result and zero child writes through every admitted input path, including command-mediated insertion. No blocked input is silently replayed on unlock. Separate interrupt/terminate controls retain their existing behavior; these fixtures are obligations, not executed passes.'
- Cross-surface regression preserves existing native layout/style, command-palette parity, keyboard/focus/IME/accessibility,
  requested/effective state and meaningful unavailable reasons. Rendering or parser replay alone cannot certify
  native input, remote writes, provider continuity or lifecycle behavior.
- Each acceptance receipt states which layer actually ran and its expected/observed oracle. Static YAML/index checks
  and historical research reports establish no native correctness, performance, recovery, security, provider integration,
  visual acceptance or readiness. No sample numeric timing/dimension limit from a reference terminal becomes PM
  policy.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Future terminal research acceptance receipts; native and visual execution remain not_run
risk_class: terminal_research_consumer_or_acceptance_drift
reasoning_tier: high
context_scope: dl035_terminal_research_consumers
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: accepted_planning_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-038
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0005
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0006
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0007
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0009
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0010
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0011
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
negative_constraints:
- No image protocol, new provider integration, environment-intake expansion, snapshot-history retention, automatic
  remote setup or implicit P10 policy is admitted.
- Do not promote planned fixtures, static schema checks, missing runners or research claims into native execution
  or shipping evidence.
- No implementation, WorkNodes, NodeSeeds, runtime acceptance or governance seal is created by this PlanUnit.
```
