# Shard 012: Feature Spec (Verbatim)

Source: `Plans/agent-rules-context.md`

Source lines: L150-L214

Source SHA256: `2f36d282c3795dd66d65f8fa473693d2bce1447500c2fe32d789b3faba2ab603`

---

## Feature Spec (Verbatim)

This feature defines deterministic, low-bloat context management for Puppet Master's node-graph runtime: run/work-package -> node -> attempt. It is a product requirement for the finished Puppet Master application, not a description of the current repo layout.

### Purpose
Define deterministic, low-bloat context management for Puppet Master's node-graph runtime: run/work-package -> node -> attempt. This is a product requirement for the finished Puppet Master application, not a description of the current repo layout.

### Goals
1. Fresh context per attempt with durable learning.
2. Deterministic bundle assembly that minimizes token waste.
3. Scoped instructions (`AGENTS.md`) that remain short and relevant.
4. Three user-configurable context injectors with defaults:
   - Parent Summary (default ON)
   - Scoped `AGENTS.md` beyond top-level (default ON)
   - Attempt Journal (default ON)
5. Controlled promotion of stable learnings into the nearest appropriate `AGENTS.md`.

### Artifact Types (SSOT Definitions)
#### A) Instruction Files (Durable)
**Name:** `AGENTS.md`
**Scope:** applies to the subtree rooted at the directory containing it.
**Lightness rule:** short invariants, constraints, and non-obvious conventions only.

#### B) Attempt Journal (Ephemeral, per node attempt)
**Name:** `attempt_journal.md` (or structured equivalent) stored in PM sidecar state for the relevant node scope.
**Purpose:** prevent repeated failed attempts.
**Injection:** only the most recent journal for the same node lineage is injected into the next attempt when enabled.

#### C) Parent Summary (Ephemeral, per handoff)
**Name:** `parent_summary.md`
**Budget:** 5–10 lines hard cap.
**Injection:** injected into attempt context when enabled.

#### D) Promotion (Controlled, optional)


Promotion moves stable, reusable learnings into the nearest appropriate `AGENTS.md` when the learning is non-obvious, stable, and scope-relevant.

### Context Assembly Semantics (Deterministic Cone)


Puppet Master constructs explicit bundles for each agent run:
1. **Instruction Bundle**
2. **Work Bundle**
3. **Memory Bundle**

#### Instruction Bundle
Always includes top-level `AGENTS.md` when present. When scoped `AGENTS.md` is enabled, include the applicable chain from root to the current scope directory, with closest-scope precedence and deterministic deduplication.

#### Work Bundle


Contains only what is needed to execute the current node/attempt: objective, acceptance criteria, inputs, allowed tools, and explicit constraints.

#### Memory Bundle
When enabled, inject the most recent node-lineage Attempt Journal and/or the bounded Parent Summary. Assistant-only memory remains Assistant-only and is not injected into unrelated orchestrator/interview/delegated runs.

### Visibility Rules
- coordinating runs/packages see coordinating objectives and summaries, not every child attempt journal by default
- node execution sees the current node objective, scoped instruction chain, and node-relevant memory only
- delegated child attempts inherit the same Instruction Bundle ordering plus child-specific Work/Memory Bundles
- verification/review attempts use the same assembly semantics; they do not reintroduce deprecated execution-hierarchy vocabulary

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/DRY_Rules.md
---
