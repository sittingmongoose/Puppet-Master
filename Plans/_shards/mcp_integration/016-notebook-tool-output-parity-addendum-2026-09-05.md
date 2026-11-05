# Shard 016: Notebook Tool Output Parity Addendum (2026-09-05)

Source: `Plans/MCP_Integration.md`

Source lines: L2827-L2970

Source SHA256: `8828c2151d68074096ab61a89e2b2a83e705b3dbcacbc10fb1e0dafaa221b6aa`

---

## Notebook Tool Output Parity Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. MCP tools gained no notebook exemption: per-MCP-tool output follows the same tool-result shaping policy as native tools (per-tool caps, restrictive precedence, bounded summaries, original artifact refs, explicit truncation), the effective policy snapshot survives replay (Plans/Prompt_Pipeline.md PP-089), and notebook/transition paths reuse the same instruction precedence, tool schemas, and availability checks as ordinary prompts — no notebook-specific shadow tool registry or post-admission transform exists.

```yaml
plan_unit_id: MI-043
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: >-
  Per-MCP-tool output caps follow the shared tool-result shaping policy snapshot; replay retains the
  effective policy so truncation stays consistent and observable. Notebook and transition paths use
  the same instruction precedence, tool schemas, MCP availability checks, and plugin transforms as
  ordinary prompts; no notebook-specific shadow tool or post-dispatch transform exists. Notebook,
  transition and no-project calls use the same exact place/Computer availability resolution;
  Project-owned servers do not enter an app request.
gui_related: false
gui_classification_reason: MCP parity is integration behavior, not GUI work.
depends_on: [MI-042, PP-089]
unblocks: []
acceptance_criteria:
  - Huge MCP results never bypass context caps; retained policy stays consistent across replay.
  - Required context survives; optional bulky material stays bounded.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: cap_bypass
reasoning_tier: standard
context_scope: mcp_integration
implementation_surfaces: [Plans/MCP_Integration.md, Plans/Tools.md, Plans/Prompt_Pipeline.md]
node_compile_hint: {mode: integration_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
- source_packet:PM-WNC-2026-09-05-v1:WNC-C13
- source_packet:PM-WNC-2026-09-05-v1:WNC-I10
- source_packet:PM-WNC-2026-09-05-v1:WNC-A55
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; S8–S11; N12/N25
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
preserved_exact_tokens: ["policy snapshot", "no notebook-specific shadow tool"]
negative_constraints:
  - Do not exempt MCP tools from shaping caps.
  - Do not apply transforms after dispatch admission.
owner_hints: [Plans/MCP_Integration.md, Plans/Tools.md]
```

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md

### MI-044 - MCP Definition Home, Reach And Computer Readiness

```yaml
plan_unit_id: MI-044
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: MCP keeps one central registry. Existing scope global means library home/reach and includes
  No project when Every project is selected; scope project requires its actual Project, while profile
  and external stay read-only reach under their current owner. Home, reach and whole Project versions
  are distinct from per-Computer command, installation and auth fields. project_switch_ids are system.mcp.server-enabled
  and system.mcp.tool-toggle, bound to the exact server/tool; What it may do consumes Permissions rather
  than a second policy store. Other definition changes make a whole Project version by stable server_id,
  never a per-field layered header/URL/argv merge. Requested/effective availability resolves Everywhere/Computer
  and optional Project/Persona bindings with the existing auth, health, trust, policy, epoch, collision
  and budget rules. Without Project/worktree the launch cwd is the chat folder or an expressly granted
  root; projected files that must exist at spawn live in that app thread owned area. Conversion rediscovers
  and explicitly re-homes future projections; it does not migrate a live MCP session or provider profile.
  The Settings transaction carries exact selected definition hashes/revisions, new destination IDs/bindings,
  reach additions and owner apply/readback/rollback sub-results; only MCP writes the registry. Host credentials
  and trust do not travel, and offline writers produce refused/not_reached with no write queue. The owner
  contribution is named in owner_thing_previews; scope_model and project_switch_ids describe its manager
  boundary. settings.follow never grants thing mutation or Project content authority. The selected whole-version/copy
  operation is cmd.mcp.server.copy through sole planned handler handlers::mcp::copy_server, with Plans/shared_integration_runtime.schema.json#/$defs/mcp_server_copy_request
  and Plans/shared_integration_runtime.schema.json#/$defs/mcp_server_copy_result. The Settings batch invokes
  this owner contribution, including exact source hash/revision, destination CAS, declared reach/switch
  deltas, readback and eligible compensation; it never writes owner records directly. These registrations
  do not prove native availability; missing schema, handler, trust, installation or currentness remains
  typed unavailable.
gui_related: true
gui_classification_reason: Owns user-visible manager, activity or control behavior.
depends_on:
- MI-032
- MI-041
- MI-042
- MI-043
- SSYS-061
- SSYS-062
unblocks: []
acceptance_criteria:
- Library reach works in No project; Project-only and externally managed entries cannot leak or become
  writable.
- Per-Computer launch/auth/readiness is checked before invocation; copying a definition neither installs
  nor authenticates it.
- Preview/readback/rollback includes whole copies, exact switches and reach additions; partial failures
  cannot claim all Computers changed.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- future post-landing owner/command/wiring/touch reconciliation; native runtime and GUI evidence remain required.
risk_class: scope_authority_or_custody_drift
reasoning_tier: high
context_scope: project_and_application_scope
implementation_surfaces:
- Plans/MCP_Integration.md
- Plans/settings_system_contracts.schema.json
- Plans/Shared_Integration_Runtime.md
node_compile_hint:
  mode: owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; S8–S11; N6/N12/N25
- /mnt/Cursor/PuppetMaster-Evidence/tests/projects-refresh-20261030/pass2/SETTINGS-PROPOSAL.md#4.1;4.3;5
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- 'Jared, 2026-11-03: "Those look good, except goals and crew should be allowed in no project."'
- 'Jared, 2026-11-03: "Plan mode and scheduled tasks are also available in no project. It''s only planning
  wizard/prd builder/orchestrator that isn''t."'
- projects-refresh-20261030/pass2/plans-edit-requests/A-requests.md#A-B01
- projects-refresh-20261030/pass2/plans-edit-requests/D-requests.md#D-B01
- projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-B02
preserved_exact_tokens:
- global
- project
- profile
- external
- server_id
- project_switch_ids
- system.mcp.server-enabled
- system.mcp.tool-toggle
- No project
- owner_thing_previews
- scope_model
- settings.follow
- cmd.mcp.server.copy
- handlers::mcp::copy_server
negative_constraints:
- Do not serialize headers, tokens, OAuth material or decrypted environment values into copies, mirrors
  or adapters.
- Do not add another registry, provider-specific source of truth, per-field merge, hidden Project root
  or unreviewed first-load execution.
- Do not infer an implemented handler, admitted event writer, native verification, WorkNode, NodeSeed
  or governance clearance from this accepted contract.
owner_hints:
- Plans/MCP_Integration.md
- Plans/Settings_System.md
- Plans/Permissions_System.md
```

ContractRef: ContractName:Plans/MCP_Integration.md#MI-044, ContractName:Plans/Settings_System.md#SSYS-002, ContractName:Plans/Contracts_V0.md#CV-365
