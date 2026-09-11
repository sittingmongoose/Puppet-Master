# Shard 042: Accepted Terminal Research Action Candidates — DL-035 (2026-09-09)

Source: `Plans/UI_Command_Catalog.md`

Source lines: L12836-L12933

Source SHA256: `69f878743253f8b232830d8fbe19db0e79271ce2110dffce9f68f0a7fb5af31a`

---

## Accepted Terminal Research Action Candidates — DL-035 (2026-09-09)

The six handlerless catalog candidates are represented explicitly in `Plans/Wiring_Matrix.production.exclusions.json`, following the existing Working Notebook candidate convention. These are exact temporary candidate exclusions, not active-command exemptions. Future admission must remove each exact exclusion atomically with its command/handler registration and production wiring.

DL-035 accepts the actions below for planning. These are six stable catalog candidates with `candidate_not_registered` runtime disposition, following UCC-158/UIW-019: no dispatcher, production wiring row, native handler, persisted event or working control is claimed by this compile. A surfaced candidate remains disabled with `command_not_registered`; a subsequently registered command with an unavailable handler reports `handler_unavailable`. Existing `UICommand`/`UICommandResponse`, permissions, projection-currentness, idempotency and route/open contracts remain authoritative. P9 reuses `cmd.terminal.restart_replace`; no restart alias, progress-clear action or P11 mux action is added.

| command_id | Label | Description | Preconditions | command_kind | normalization.kind | normalizes_to_contract | alias_of_command_id |
|---|---|---|---|---|---|---|---|
| `cmd.terminal.remote_compatibility_setup` | Set up remote terminal compatibility | Request the chosen verified terminfo install or disclosed conservative profile for the exact authenticated remote environment. | Current verified host/environment and capabilities; explicit per-host authorization; shared permissions; compatible selected mode. | `domain_action` | `none` | `SMPFS-161` | null |
| `cmd.terminal.insert_command` | Insert command without running | Put trustworthy retained command text into the chosen live prompt through a verified insert-only path. | Exact source record and authorized target session/cwd/worktree/remote context; verified prompt insertion capability; input guard allows it. | `domain_action` | `none` | `SMPFS-163` | null |
| `cmd.terminal.open_retained_output` | Open retained output in editor | Open one coherently resolved retained output subject with source identity and completeness labels. | Source record resolves; retained backing is readable; route/open authorization is current. | `navigation_wrapper` | `wrapper` | `route_target` plus document/artifact-only `OpenSubject`, consuming `SMPFS-163` | null |
| `cmd.terminal.environment_provenance` | Show terminal environment sources | Reveal the redacted known provenance and next-launch changes for the exact session. | Exact session/projection resolves and access is allowed; unknown fields remain unknown. | `navigation_wrapper` | `wrapper` | Object `route_target`, consuming `SMPFS-164` | null |
| `cmd.terminal.input_protection.enable` | Protect terminal input | Set input protection enabled for the exact live session through the terminal owner. | Current exact live session and protection policy; input-control authority; current projection. | `domain_action` | `none` | `SMPFS-165` | null |
| `cmd.terminal.input_protection.disable` | Allow terminal input | Set input protection disabled without changing the session or its running process. | Current exact live session and input-control authority; current projection. | `domain_action` | `none` | `SMPFS-165` | null |

Catalog metadata references the Section15 operation contract and the shared typed command envelope; it does not define private route arguments. Domain requests retain the exact selected source/target session, host/environment, command-record identity where applicable, expected owner revision, caller permissions and idempotency identity. Route wrappers carry the canonical route target; only opening retained output materializes a document/artifact `OpenSubject`. The strict response points to the matching owner result or receipt. An accepted dispatch, button dismissal or toast is not successful setup, insertion, unlock, restart or output recovery.

Remote setup is a deliberate per-host authorization flow. Denial, read-only/no-tic hosts, unavailable capability, transfer/verification failure and host change remain explicit; they never trigger a local shell or universal SSH override. Insertion is an input mutation with no execution authority: send no Enter, do not blindly write historical text into a TUI/PTY, and refuse with no effect when control characters, multiline text or current prompt state cannot be represented by a verified insert-only path. Do not silently sanitize source text into a different command. A repeated dispatch with the same identity cannot insert twice.

Retained output opening resolves one coherent backing revision before routing and preserves command/session/cwd/worktree/remote provenance, redaction and partial labels. Unavailable bytes are never reconstructed from metadata; an unavailable subject returns a no-effect reason. Environment inspection is a redacted projection, not environment collection or mutation; changes apply to a future launch only. Explicit replacement uses the existing restart command and creates a new session. Input protection enable/disable are idempotent setters, not a toggle: duplicate enable cannot unlock, output keeps draining, unlock retains the same session, and exact-session protection survives verified reconnect/PM reopen while replacements start unlocked. DL-038 requires both user and agent terminal input to pass the same protection guard before a child write. A protected agent request returns an explicit blocked result using the existing closed reason vocabulary and owner detail; no silent success, bypass or implicit unlock occurs.

Availability uses the existing closed reason vocabulary (`unsupported`, `not_configured`, `unauthorized`, `unreachable`, `degraded`, `partial_capability`, `blocked_state_required`, `stale_projection`, `permission_required`) with detailed owner reasons carried by the typed response. A candidate lacks runtime registration regardless of otherwise eligible domain state. The existing running-pane close confirmation and distinct interrupt/terminate controls remain independently routed. No source history import, retention expansion, automatic relaunch, provider integration, new event family or mux deployment is authorized.

### UCC-160 - Accepted Terminal Action Contracts

```yaml
plan_unit_id: UCC-160
unit_type: requirement
status: accepted
owner_doc: Plans/UI_Command_Catalog.md
canonical_text: Six accepted terminal action candidates have stable IDs, complete normalization metadata and
  exact owner routing. Remote compatibility setup, safe command insertion, retained-output opening, redacted
  environment inspection and idempotent input-protection enable/disable remain unavailable until registered
  and wired; replacement reuses cmd.terminal.restart_replace.
gui_related: true
gui_classification_reason: User-visible command routing, availability, failure and result projection.
depends_on:
- UCC-158
- SMPFS-161
- SMPFS-163
- SMPFS-164
- SMPFS-165
unblocks: []
acceptance_criteria:
- Exactly the six named candidates exist once; all metadata columns and canonical targets are explicit, no
  duplicate restart/progress/mux command is introduced, and all UI entry points reuse these IDs.
- Unregistered candidates fail closed; registration, handler availability and owner capability are separate
  checks and never become success from static catalog text.
- Requests and responses retain exact owner identities/currentness/permissions/idempotency; stale or unauthorized
  targets have no effect and never use the most recent visible pane as fallback.
- Remote writes require explicit per-host authorization and verified selected mode; decline/read-only/no-tic/transfer/host-change
  cases preserve ordinary SSH without local fallback.
- Insertion sends no Enter and executes nothing, including multiline/control-character/TUI cases; unsafe insertion
  is unavailable without source rewrite, and replay of the same request cannot insert twice.
- Output opens only coherent retained backing with exact source route/OpenSubject identity; partial output
  stays labeled and unavailable output is never reconstructed.
- Environment inspection discloses unknown/redacted fields and pending next-launch changes without collecting
  more data or changing a live launch snapshot; explicit replacement creates a new session.
- Protection setters are idempotent, output drains, unlock keeps exact session identity, verified reconnect
  retains the same-session lock, and replacement starts unlocked. Protected user and agent input have no child write; agents receive an explicit blocked result. Separate interrupt/terminate controls retain existing behavior.
- No implementation, production wiring row, handler or EventRecord producer is emitted by this planning compile.
- Exactly the six handlerless UCC-160 candidates appear as exact, explained exclusions in Plans/Wiring_Matrix.production.exclusions.json
  only while candidate_not_registered. No wildcard or active-command exemption is added; each exact exclusion
  is removed atomically with command/handler admission and production wiring.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
- Plans/Automated_Testing_System.md#ATS-047 — future terminal fixtures
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: terminal_command_authority_or_identity_loss
reasoning_tier: high
context_scope: terminal_research_command_catalog
implementation_surfaces:
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Contracts_V0.md
- Plans/Wiring_Matrix.production.json
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: accepted_planning_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-038
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0014
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/source_shards/input_scope_answer_20260909.md
- Plans/Decision_Log.md#DL-035
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0008
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0010
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0011
- Plans/ledgers/v2/pldg-20260908-001-terminal-research-repairs/records/design_atoms.jsonl:atom-0012
negative_constraints:
- No implicit command execution, source-history import, reconstructed output or retention expansion.
- No local fallback, universal SSH override, automatic relaunch or agent bypass of input protection.
- No implementation, WorkNodes, NodeSeeds or fictional runtime registration.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Server_System.md, ContractName:Plans/Automated_Testing_System.md
