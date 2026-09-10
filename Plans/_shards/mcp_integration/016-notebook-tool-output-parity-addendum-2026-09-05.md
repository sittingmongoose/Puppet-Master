# Shard 016: Notebook Tool Output Parity Addendum (2026-09-05)

Source: `Plans/MCP_Integration.md`

Source lines: L2800-L2835

Source SHA256: `22868e7bba7c3acc240c3063bb40c425789141e6115ffc06e9d058965d7563a5`

---

## Notebook Tool Output Parity Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. MCP tools gained no notebook exemption: per-MCP-tool output follows the same tool-result shaping policy as native tools (per-tool caps, restrictive precedence, bounded summaries, original artifact refs, explicit truncation), the effective policy snapshot survives replay (Plans/Prompt_Pipeline.md PP-089), and notebook/transition paths reuse the same instruction precedence, tool schemas, and availability checks as ordinary prompts — no notebook-specific shadow tool registry or post-admission transform exists.

```yaml
plan_unit_id: MI-043
unit_type: requirement
status: accepted
owner_doc: Plans/MCP_Integration.md
canonical_text: Per-MCP-tool output caps follow the shared tool-result shaping policy snapshot; replay retains the effective policy so truncation stays consistent and observable. Notebook and transition paths use the same instruction precedence, tool schemas, MCP availability checks, and plugin transforms as ordinary prompts; no notebook-specific shadow tool or post-dispatch transform exists.
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
preserved_exact_tokens: ["policy snapshot", "no notebook-specific shadow tool"]
negative_constraints:
  - Do not exempt MCP tools from shaping caps.
  - Do not apply transforms after dispatch admission.
owner_hints: [Plans/MCP_Integration.md, Plans/Tools.md]
```

ContractRef: ContractName:Plans/MCP_Integration.md, ContractName:Plans/Tools.md, ContractName:Plans/Prompt_Pipeline.md
