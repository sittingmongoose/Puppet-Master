## 12.8 Lifecycle and Quality Enhancements for Tool Discovery

The orchestrator plan (`Plans/orchestrator-subagent-integration.md`) defines lifecycle hooks, structured handoff validation, remediation loops, and cross-session memory. These features can enhance the **tool discovery and research flow** to improve reliability, quality, and continuity.

### 1. Hook-Based Lifecycle for Tool Research Operations

**Concept:** Apply hook-based lifecycle middleware to tool discovery and research operations. Run **BeforeResearch** and **AfterResearch** hooks when the interview performs tool research (e.g., via Context7 MCP, web search, catalog lookup).

**BeforeResearch hook responsibilities:**

- **Track active research subagent:** Record which subagent is performing research (e.g., `ux-researcher` for UX tool research, `qa-expert` for testing tool research).
- **Inject research context:** Add detected GUI framework, current phase decisions, known tool gaps, and catalog state to research prompt.
- **Load cross-session memory:** Load prior tool choices and framework decisions from `.puppet-master/memory/` and inject into research context.
- **Prune stale catalog entries:** Clean up old catalog research results older than threshold.

**AfterResearch hook responsibilities:**

- **Validate research output format:** Check that research output matches structured handoff contract (see orchestrator plan §2).
- **Update catalog:** If research populated or extended the catalog (§6.2), validate catalog entry format and persist to catalog.
- **Save memory:** Persist tool choices and framework decisions to `.puppet-master/memory/tech-choices.json`.
- **Safe error handling:** Guarantee structured output even on research failure.

**Implementation:** Extend `src/interview/research_engine.rs` to call hooks before and after research operations. Use the same hook registry pattern as orchestrator hooks, but with research-specific contexts (`BeforeResearchContext`, `AfterResearchContext`).

### 2. Structured Handoff Validation for Tool Catalog Updates

**Concept:** When research populates or extends the catalog (§6.2), enforce structured format for catalog entries. Use structured handoff format for research results.

**Catalog entry format:**

```rust
pub struct ToolCatalogEntry {
    pub framework_id: String,
    pub tool_name: String,
    pub description: String,
    pub install_setup: String,
    pub capabilities: Vec<String>,
    pub doc_url: Option<String>,
    pub requires_mcp: bool,
    pub mcp_servers: Vec<String>, // e.g., ["context7", "browser"]
    pub research_source: String, // e.g., "context7", "web", "manual"
    pub research_timestamp: DateTime<Utc>,
}
```

**Validation:** When research adds catalog entries, validate entry format matches `ToolCatalogEntry`. On validation failure, request one retry; after retry, proceed with partial entry but mark catalog as "incomplete."

**Integration:** Extend `src/interview/gui_tool_catalog.rs` to validate entries when research adds them. Use `validate_subagent_output()` pattern adapted for catalog entries.

### 3. Cross-Session Memory for Tool Choices

**Concept:** Persist tool choices (selected framework tools, custom headless tool plans) to `.puppet-master/memory/` so future interview runs or orchestrator runs can load prior tool decisions.

**What to persist:**

- **Tool choices:** Selected framework tools per framework (from user selection in Testing phase).
- **Custom headless tool plans:** Whether custom headless tool was planned, design decisions, evidence paths.
- **Framework decisions:** Detected GUI frameworks and their tool capabilities.

**When to persist:**

- **At Testing phase completion:** Save selected framework tools and custom headless tool plan.
- **At interview completion:** Save all accumulated tool choices.

**When to load:**

- **At interview start:** Load prior tool choices and inject into Testing phase context.
- **At Testing phase start:** Load relevant tool choices for detected frameworks.

**Integration:** Use the same `MemoryManager` from orchestrator plan. In interview orchestrator, call `memory_manager.save_tech_choice()` at Testing phase completion with tool choice entries.

### 4. Active Agent Tracking for Tool Research

**Concept:** Track which subagent is performing tool research at each operation. Store in interview state and expose for logging and debugging.

**Tracking:**

- **Per research operation:** `active_research_subagent: Option<String>` in research context.
- **Persistence:** Write to `.puppet-master/interview/research-subagents.json` (updated on each research operation).

**Use cases:**

- **Logging:** "Research operation: active subagent = ux-researcher, framework = dioxus"
- **Debugging:** "Why did this research fail? Check active research subagent logs."
- **Audit trails:** "Which subagents performed tool research? See research-subagents.json."

### 5. Remediation Loop for Tool Catalog Validation

**Concept:** When catalog validation finds Critical or Major issues (e.g., missing required fields, invalid MCP server names), block catalog update and enter a remediation loop. Re-run research until Critical/Major findings are resolved.

**Severity levels:**

- **Critical:** Missing required fields (framework_id, tool_name), invalid MCP server names -- **block catalog update**.
- **Major:** Missing optional but recommended fields (doc_url, capabilities) -- **block catalog update**.
- **Minor:** Formatting issues, incomplete descriptions -- **log and proceed**.
- **Info:** Suggestions for improvement -- **log and proceed**.

**Remediation loop:**

1. Catalog validator runs after research adds entry.
2. Parse findings from validation output.
3. Filter Critical/Major findings.
4. If Critical/Major exist:
   - Mark catalog entry as "incomplete."
   - Re-run research with remediation request (e.g., "Missing required field 'tool_name'. Please provide complete catalog entry.").
   - Re-run validator.
   - Repeat until Critical/Major resolved or max retries (e.g., 2).
   - If max retries reached, skip entry or mark as "needs manual review."
5. If only Minor/Info findings: log, mark entry complete, proceed.

**Integration:** Extend catalog validation in `src/interview/gui_tool_catalog.rs` to use remediation loop pattern from orchestrator plan.

### Implementation Notes

- **Where:** Extend `src/interview/research_engine.rs` with hook integration; extend `src/interview/gui_tool_catalog.rs` with structured validation; reuse `src/core/memory.rs` for persistence.
- **What:** Add BeforeResearch/AfterResearch hooks; validate catalog entries with structured format; persist tool choices to memory; track active research subagents.
- **When:** Hooks run automatically at research boundaries; memory persists at Testing phase completion; remediation loop runs when catalog validation finds Critical/Major issues.

**Cross-reference:** See orchestrator plan "Lifecycle and Quality Features" for full implementation details. See orchestrator plan "Puppet Master Crews" for how research crews can coordinate tool discovery operations.

