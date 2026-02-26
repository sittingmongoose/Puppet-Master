## 7. Interviewer Flow Changes

### 7.1 GUI stack detection

- **Inputs:** Architecture phase output (tech stack, dependencies), optionally UX phase (web vs native vs both). Use existing feature_detector / technology_matrix if available.
- **Output:** One or more **GUI framework IDs** (e.g. `["web"]`, `["iced"]`, `["dioxus","web"]` for Dioxus+web).
- **Storage:** Add to interview state (e.g. `detected_gui_frameworks: Vec<String>`). Use this for the rest of the flow.

### 7.2 Testing phase: tool discovery and user options

- After (or as part of) the **Testing & Verification** phase:
  1. **Lookup** detected GUI frameworks in the **GuiToolCatalog** (§6). If catalog is sparse for a framework, research may run to **populate or extend the catalog** (§6.2); the user is never shown a research-only result.
  2. **Build options:**
     - **Playwright** (when "web" is in detected frameworks): keep current "Generate Playwright requirements" behavior; present as one option.
     - **Framework tools:** For each detected non-web framework, list existing tools from the catalog; allow user to select which to use (e.g. "Dioxus devtools", "Iced headless runner if present").
     - **Custom headless tool:** Checkbox or option: "plan/build a custom headless GUI tool for the target project (headless navigation + full debug log for agent smoke tests)". Default can come from catalog ("custom headless default" per framework).
  3. **Persist** choices in interview config/state (e.g. `generate_playwright_requirements`, `selected_framework_tools: Vec<FrameworkToolChoice>`, `plan_custom_headless_tool: bool`). Ensure these are wired into `InterviewOrchestratorConfig` and used at completion when generating test strategy and plans (§10). At interview completion, write the Doctor-readable projection into project config: `tools.custom_headless` is written when `plan_custom_headless_tool == true` and removed when `plan_custom_headless_tool == false`.

### 7.3 UI for tool selection

- Reuse existing widgets per **DRY** (`docs/gui-widget-catalog.md`, `src/widgets/`). Use toggles, checkboxes, or multi-select for:
  - Playwright (existing).
  - Per-framework list of existing tools (select one or more).
  - "plan/build custom headless GUI tool" toggle.
- Tooltips or short help: explain that existing tools come from the catalog; custom tool is full-featured (headless runner, action catalog, full evidence) like Puppet Master's automation. No new one-off UI patterns; tag new reusable widgets with `// DRY:WIDGET:...`. Follow existing accessibility and widget patterns (selectable labels, keyboard navigation, screen reader considerations per `docs/gui-widget-catalog.md`).  
  ContractRef: Primitive:DRYRules, ContractName:Plans/DRY_Rules.md#7, ContractName:docs/gui-widget-catalog.md

---

