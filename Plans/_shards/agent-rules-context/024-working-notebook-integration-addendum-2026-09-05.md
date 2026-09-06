# Shard 024: Working Notebook Integration Addendum (2026-09-05)

Source: `Plans/agent-rules-context.md`

Source lines: L2374-L2409

Source SHA256: `af088bfdefbd05fb66d86da2f524238b1f51e9006f900ca84a88fc982b910b97`

---

## Working Notebook Integration Addendum (2026-09-05)

Packet `PM-WNC-2026-09-05-v1`. The Attempt Journal (ARC-019) and Parent Summary (ARC-020) keep their exact current contracts: the Attempt Journal stays an ephemeral per-node-attempt sidecar artifact whose most recent same-lineage journal is the only one injected into the next attempt, and the Parent Summary keeps its 5-10 line hard cap and independent handoff scope. Worker notebooks (scope `worker_lineage`, owned by `Plans/Working_Notebook.md` WN-012) extend accessible working detail without creating a second independently maintained retry summary: the latest journal and the bounded Parent Summary MAY carry bounded references to deeper notebook entries (entry_id + revision), and the next attempt resolves them through the notebook read tool within normal tool and admission limits when policy allows — never as full-history injection, never by replacing or editing the journal/summary artifacts from notebook code paths. Node retry therefore reuses relevant lineage learning without inheriting unrelated histories, and unrelated branches or long histories remain excluded by default.

```yaml
plan_unit_id: ARC-037
unit_type: requirement
status: accepted
owner_doc: Plans/agent-rules-context.md
canonical_text: Attempt Journal and Parent Summary contracts are unchanged; worker notebooks integrate by bounded reference, not duplication. The latest same-lineage Attempt Journal and the capped Parent Summary remain the retry-facing injectors, may carry bounded notebook entry references resolved on demand through notebook tools within normal limits, and notebook code paths never edit or duplicate the journal or summary artifacts. No second independently maintained retry summary exists, and full notebook history is never injected into worker prompts.
gui_related: false
gui_classification_reason: Injection integration is prompt-context behavior, not GUI work.
depends_on: [ARC-019, ARC-020, WN-012]
unblocks: []
acceptance_criteria:
  - Attempt N+1 still receives only the most recent same-lineage journal and the capped summary.
  - Deeper notebook detail is reachable by reference without full-history injection.
  - Notebook paths never write journal/summary artifacts.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: duplicate_summary_truth
reasoning_tier: standard
context_scope: rules_and_context
implementation_surfaces: [Plans/agent-rules-context.md, Plans/Working_Notebook.md, Plans/orchestrator-subagent-integration.md]
node_compile_hint: {mode: context_contract_spec, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - source_packet:PM-WNC-2026-09-05-v1:WNC-N14
  - source_packet:PM-WNC-2026-09-05-v1:WNC-A43
preserved_exact_tokens: ["attempt_journal.md", "parent_summary.md", "5-10 line", "by reference"]
negative_constraints:
  - Do not duplicate the Attempt Journal or Parent Summary in notebook storage.
  - Do not inject full notebook history into worker prompts.
owner_hints: [Plans/agent-rules-context.md, Plans/Working_Notebook.md]
```

ContractRef: ContractName:Plans/agent-rules-context.md, ContractName:Plans/Working_Notebook.md, ContractName:Plans/orchestrator-subagent-integration.md
