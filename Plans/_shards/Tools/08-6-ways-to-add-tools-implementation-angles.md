## 6. Ways to add tools (implementation angles)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0504
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - Add canonical requested-side fields:
  - add `operational_identity?` to:
  - operational_identity?
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

| Mechanism | What it adds | Where it's configured | Notes |
|-----------|--------------|------------------------|-------|
| **MCP server** | New tools/resources/prompts from one server | Per-platform MCP config (see §7) | Single MCP server can expose many tools. Context7 and GUI automation remain representative examples; search/provider canon stays in the owner docs. |
| **Platform CLI flags** | Allow/deny built-in tools (shell, write, MCP by name) | Run config / runner args | Copilot: `--allow-tool` / `--deny-tool`. Claude: `--allowedTools`. Gemini: N/A (Direct-provider; enforced by Puppet Master). |
| **Central tool registry** | All tools (MCP + native) registered and gated by policy | Puppet Master core (rewrite) | Permissions, validation, normalized results; events in seglog; analytics on latency/errors. |
| **GUI tool catalog** | Framework-specific tools (e.g. Playwright, headless runners) offered in Interview | DRY:DATA:gui_tool_catalog; interview config | newtools.md: discovery, user choice, test strategy and PRD wiring. |
| **GUI MCP settings** | Enable/disable MCP servers, API keys (e.g. Context7) | Settings → Advanced → MCP Configuration | newtools §8.1; MCP tools then integrated per §5 above. |

Implementations should:

- Use **platform_specs** (and future central registry) as single source of truth; avoid hardcoding platform tool/MCP details.
- Own MCP centrally (tool registry + policy engine); generate derived adapter config for `CliBridge` providers only where required. `DirectApi` providers use the central registry directly. Resolve secrets via env/credential store only (no secrets in config files).
- Align with **storage-plan.md**: tool-related events in seglog, rollups in redb, and any search index in Tantivy.

---

