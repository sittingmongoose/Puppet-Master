## 28. Markdown and Mermaid Rendering in Chat and Planning Surfaces (2026-03-07)

### Reconciliation addendum

This addendum applies row-level transfer coverage requirements for the mapped owner anchor. Source IDs and exact source tokens are preserved in packet metadata; prose below uses canonical wording for retired legacy terms.

- Required structural headings for this packet target:
  - ### Reconciliation addendum

#### Source target target-0562
- Reconciliation action: insert_after
- Replace scope: insert_only
- Required structural headings represented:
  - ### Reconciliation addendum
- Exact required items represented:
  - this now creates a direct requested/effective identity rendering risk for Orchestrator, Chat, and History surfaces
- Exact acceptance checks represented:
  - All coverage_row_ids listed on this target are represented without broad summary substitution.
  - All source_obligation_ids, source_seed_ids, and source_shard_ids are preserved in packet metadata.
  - Rows marked missing or partial receive concrete prose or structural additions under the mapped live anchor.
- Source lineage is preserved in packet metadata for coverage rows, source obligations, source seeds, source shards, gaps, fidelity refs, span group, and writer role.

Chat and planning surfaces support both Mermaid and the broader inline visualizer, but they are distinct contracts.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 28.1 Canonical split

- Mermaid remains the fenced-diagram rendering path
- the inline visualizer is a separate sandboxed HTML/SVG module
- neither path owns hidden mutable state outside durable source or metadata refs

### 28.2 Inline visualizer bridge

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Mermaid and inline visualizer behavior is locked to native card rendering, explicit error and fallback disclosure, sandboxing without arbitrary HTML execution, bounded persistence, injected theme tokens, and the exact inline visualizer bridge cross-reference target.

ContractRef: Plans/FinalGUISpec.md#15.6 Mermaid and inline visualizer widgets

Rules:
- Copy source
- Open in editor
- Open detached preview
- Export diagram
- must NOT execute arbitrary HTML
- allowlisted tags/attributes only
- sendPrompt(text)
- openLink(url)
