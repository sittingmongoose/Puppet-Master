# Shard 035: Terminal Research Planned Wiring — DL-035 (2026-09-09)

Source: `Plans/Wiring_Matrix.md`

Source lines: L4349-L4433

Source SHA256: `c936efafcef535ca405f4c0600cf2ff538c1c0bf4ccb111ce1b20ef7ef96d6e5`

---

## Terminal Research Planned Wiring — DL-035 (2026-09-09)

The six handlerless catalog candidates are represented explicitly in `Plans/Wiring_Matrix.production.exclusions.json`, following the existing Working Notebook candidate convention. These are exact temporary candidate exclusions, not active-command exemptions. Future admission must remove each exact exclusion atomically with its command/handler registration and production wiring.

The D2 terminal actions follow the candidate disposition in UCC-160 and UIW-019. This is planned owner-to-consumer wiring; it creates no production registry row or handler implementation. Future central registration must bind one semantic owner route per command across cards, menus, palette, Settings and keyboard entry points, with the same permissions, exact identity, availability and result. A control remains disabled with `command_not_registered` before registration and `handler_unavailable` when registration exists without a usable handler. Pure visual affordances do not gain a peer runtime action.

| Command | Planned semantic owner route | UI consumers | Required result and return behavior |
|---|---|---|---|
| `cmd.terminal.remote_compatibility_setup` | Terminal compatibility operation (`SMPFS-161`), consuming shared remote authorization/install primitives | Terminal host diagnostics/setup; owner-projected Settings; menu/palette where offered | Exact authenticated environment and selected mode, authorization/verification result, effective capability and no silent fallback; return to initiating host/pane. |
| `cmd.terminal.insert_command` | Terminal input owner (`SMPFS-163`) | Existing terminal command history/card actions; equivalent menu/palette/keyboard entry | Exact source command and target prompt, verified no-execution insertion or no-effect refusal; input guard and request replay checked before any child write; protected user/agent insertion returns an explicit blocked result without a child write. |
| `cmd.terminal.open_retained_output` | Terminal retained-output resolver (`SMPFS-163`) then canonical route/open and editor owner | Existing command card/history action and equivalent menu/palette | One coherent retained subject, source identity and completeness/redaction label; OpenSubject for the output artifact; exact originating context retained. |
| `cmd.terminal.environment_provenance` | Terminal launch-provenance projection (`SMPFS-164`) then canonical object route | Terminal diagnostics and owner-projected Settings | Redacted known/unknown source layers and pending-next-launch differences; deterministic return without live environment mutation. |
| `cmd.terminal.input_protection.enable` | Terminal input-protection owner (`SMPFS-165`) | Live pane controls, existing menu/palette/keyboard action surfaces | Exact-session enabled state or no-effect refusal; duplicate enable stays enabled, output continues, and user/agent input is blocked with an explicit blocked result for agents. |
| `cmd.terminal.input_protection.disable` | Same input-protection owner (`SMPFS-165`) | Same live pane controls and action surfaces | Exact-session disabled state or refusal; unlock does not replace the session. |
| Existing `cmd.terminal.restart_replace` | Existing terminal replacement owner | Environment pending-change display links to the existing restart surface | Explicit replacement creates a new session and leaves prior identity/outcome truthful; no new restart handler. |

Each future production entry must bind the admitted request/result contract, one actual registered handler, all intended reverse consumers, availability and disabled-reason selectors, accessibility/focus-return semantics, and native dispatcher/result/projection evidence. This table does not fabricate Rust paths, runtime registry entries, EventRecord types or an implementation receipt. Generic UI acknowledgement is not domain completion. Close, interrupt and terminate keep their existing owner routes; reconnect follows verified session identity rather than inheriting protection from a pane label or a historical record.

### WM-052 - Terminal Research Planned Wiring

```yaml
plan_unit_id: WM-052
unit_type: requirement
status: accepted
owner_doc: Plans/Wiring_Matrix.md
canonical_text: Planned wiring binds the six accepted terminal action candidates to their single semantic owner
  and all visible consumers, while reusing the existing restart route. Actual production registration and handler
  evidence remain prerequisites, with truthful disabled states and exact result/return identity.
gui_related: true
gui_classification_reason: User-visible command routing, availability, failure and result projection.
depends_on:
- UCC-160
- SMPFS-161
- SMPFS-163
- SMPFS-164
- SMPFS-165
unblocks: []
acceptance_criteria:
- The six UCC-160 commands each resolve to exactly one planned semantic route; every offered card/menu/palette/Settings/keyboard
  entry shares that ID and owner.
- Retained-output editor opening resolves backing before the route/OpenSubject handoff and preserves source
  identity, partial/unavailable truth and deterministic return.
- Remote setup and insertion revalidate exact target, authorization, revision and idempotency before effects;
  no local/most-recent-pane fallback, unsafe multiline write or duplicate insertion.
- Protection enable/disable project the actual exact-session state, preserve output draining and reconnect
  identity, and do not alter process lifetime or running-pane close policy.
- No production row or actual-handler claim is created for these candidate actions; future dispatcher, owner
  result, projection and accessibility fixtures must supply native evidence.
- Exactly the six handlerless UCC-160 candidates appear as exact, explained exclusions in Plans/Wiring_Matrix.production.exclusions.json
  only while candidate_not_registered. No wildcard or active-command exemption is added; each exact exclusion
  is removed atomically with command/handler admission and production wiring.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-plans-verify.py run-gates
- Plans/Automated_Testing_System.md#ATS-047 — future terminal fixtures
- python3 scripts/pm-plans-verify.py validate-wiring-matrix
risk_class: terminal_wiring_identity_or_false_registration
reasoning_tier: high
context_scope: terminal_research_planned_wiring
implementation_surfaces:
- Plans/Wiring_Matrix.md
- Plans/Wiring_Matrix.production.json
- Plans/UI_Command_Catalog.md
- Plans/UI_Wiring_Rules.md
- Plans/Wiring_Matrix.production.exclusions.json
node_compile_hint:
  mode: planned_wiring_candidates_only
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
- No duplicate handler, alias or view-local runtime bypass.
- No unregistered event producer or proof of runtime from this table.
- No implementation, WorkNodes or NodeSeeds.
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-035, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/UI_Wiring_Rules.md, ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Server_System.md, ContractName:Plans/Automated_Testing_System.md
