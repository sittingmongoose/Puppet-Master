## 6. Framework & Tool Discovery (DRY)

### 6.1 Single source of truth

Introduce a **single source of truth** for "GUI framework → available tools" so the interviewer (and any future automation) does not hardcode or duplicate this data.

- **Location (required):** `puppet-master-rs/src/interview/gui_tool_catalog.rs` per §12.5 "Catalog location". Tag as `// DRY:DATA:GuiToolCatalog`.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2
- **Runtime‑mutable `GuiToolCatalog` (Resolved):**
  - `GuiToolCatalog` is composed of:
    1. **Base catalog** shipped with Puppet Master (curated defaults; DRY:DATA in code).
    2. **User overlay catalog** persisted in app settings (**non‑secret**; redb settings store) and editable via UI; export/import as JSON.
  - Merge precedence: **overlay wins** by stable IDs (`framework_id`, `tool_id`).
  - Research-populated entries are written to the **overlay** (never to the base catalog).
  ContractRef: Primitive:DRYRules, PolicyRule:Decision_Policy.md§2, PolicyRule:no_secrets_in_storage
- **Content:** A catalog (e.g. struct + const data or table) that for each supported framework (or "web" for Playwright) provides:
  - **Framework ID** (e.g. `web`, `iced`, `dioxus`, `qt`, `flutter`, `tauri`, `electron`).
  - **Display name** and optional **detection hints** (e.g. Cargo.toml crate name, package.json deps).
  - **Existing tools:** list of entries, each with: name, description, install/setup summary, capabilities (e.g. "hot reload", "web preview", "headless test", "real-time dev UI"), and optional doc URL.
  - **Custom headless default:** whether to suggest "plan/build custom headless tool" by default for this framework (e.g. true for Iced when no headless runner in project; false for "web" when Playwright suffices).

**Examples to seed the catalog:**

| Framework | Existing tools (examples) | Custom headless suggestion |
|-----------|---------------------------|----------------------------|
| web       | Playwright (E2E, browsers) | No (Playwright is the standard) |
| dioxus    | Dioxus devtools (web preview, hot reload, hot patching) | Optional (if more than preview needed) |
| iced      | In-repo headless_runner (tiny-skia), GUI automation action catalog | Yes, if not already in project |
| qt        | Qt Test, Squish, etc. (research and list) | Often |
| flutter   | Flutter driver, integration_test | Optional |
| tauri     | WebDriver + front-end; Tauri test utils | Optional |
| electron  | Playwright (Electron support), Spectron legacy | No when Playwright used |

Catalog MUST be **extensible** (add new frameworks/tools without changing interviewer flow logic). Implementation MUST provide **DRY:FN** helpers for "lookup by framework", "list tools for framework", "should suggest custom headless for framework".  
ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, PolicyRule:Decision_Policy.md§2

### 6.2 Research as input only (no research-only outcome)

Research (Context7 MCP, web search) may be used to **inform** the catalog or the build plan, but MUST NOT be presented as a standalone research-only outcome. Options:
ContractRef: PolicyRule:Decision_Policy.md§4, Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7

- **Catalog population:** When the base+overlay `GuiToolCatalog` has no or sparse data for a framework, research can **add or extend overlay entries** (validated) so the catalog remains the single source of truth and future runs see the data. The user is shown **catalog-backed options** (including newly added entries), not a separate research-only result.
- **Build plan input:** When the user chooses plan/build custom headless GUI tool for an unknown or sparse-catalog framework, research can **inform the design** of that tool. The deliverable is always the **plan to build the full-featured tool** (see §9); research only feeds that plan.

Implementation MUST NOT offer a research-only mode where the interview concludes with only researched links and no concrete tool choice or build plan. For unknown frameworks, the user still gets: catalog options (if research populated the catalog) and/or the option to plan/build the full-featured custom headless tool, with research used only to improve that plan.  
ContractRef: PolicyRule:Decision_Policy.md§4

### 6.3 MCP and tool invocation

Some **existing tools** in the catalog (or used during research) rely on **MCP** (Model Context Protocol), e.g. Context7 for documentation lookup, Browser MCP for web testing. For selected tools to be callable when agents run:  
ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager

- **All platforms:** MCP-backed tools MUST be supported and configurable for **all five platforms** (Cursor, Codex, Claude Code, Gemini, GitHub Copilot). Canonical MCP configuration lives in Puppet Master; per-platform files are **derived adapters only** where a platform requires them (see §8.2). Implementation MUST ensure that when the user selects a catalog tool that uses MCP, Puppet Master can **set up and verify** that the tool is available and callable for the tier's platform.  
  ContractRef: ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager, Gate:GATE-005
- **Setup and verification:** Implementation MUST provide a way to configure MCP servers (including API keys where required) and to verify that tools are callable (e.g. Doctor check or pre-run check per §11 checklist item **Doctor (MCP)**). Implementation MUST document or implement how MCP config (including Context7 API key and enable/disable state) is passed into the runner or agent environment so that platform CLIs see the correct MCP servers when executing.  
  ContractRef: ContractName:Plans/MiscPlan.md#doctor, SchemaID:evidence.schema.json, Gate:GATE-005
- **Catalog metadata:** In the GUI tool catalog (§6.1), implementation MUST tag tools that require MCP (via `requires_mcp: bool` and `mcp_servers: Vec<String>` fields per §12.6.2 structured handoff) so the UI can show requirements (e.g. "Requires Context7 MCP" or "Requires Browser MCP"). When such a tool is selected, the run config or prompt builder MUST ensure the corresponding MCP settings are enabled and configured.  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:Plans/orchestrator-subagent-integration.md#platform-capability-manager

---

