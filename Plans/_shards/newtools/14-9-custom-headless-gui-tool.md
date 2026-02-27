## 9. Custom Headless GUI Tool

When the user chooses **"plan/build custom headless GUI tool"**:

### 9.1 Requirement: full-featured (like Puppet Master's automation)

The custom headless GUI tool must be **fully featured**, not minimal. Use **Puppet Master's** automation as the reference (`src/automation/`: headless runner, action catalog, evidence layout). The tool must provide:

- **Headless execution:** Runs without display (CI-friendly); uses software rendering or framework-specific headless mode (e.g. Iced tiny-skia, or framework's own headless API).
- **Action catalog:** A defined set of actions or scenarios so that smoke and regression flows can be scripted and repeated. Not a one-off script -- a reusable catalog the agent can extend and run.  
  ContractRef: ContractName:AGENTS.md#automation-action-catalog
- **Full evidence output:** After each run, the tool MUST produce the **same depth of debug information** as Puppet Master's GUI automation: **Timeline** (e.g. `timeline.jsonl`), **Summary** (e.g. `summary.md`), **Artifacts** (screenshots or state dumps per step). **Consistent paths:** Evidence under a standard location (e.g. `.puppet-master/evidence/gui-automation/...`). Optional: **ephemeral workspace clone** as in Puppet Master's headless runner.  
  ContractRef: SchemaID:evidence.schema.json, Gate:GATE-005, ContractName:AGENTS.md#automation-evidence

### 9.2 What gets written into plans

- **If get existing tool** (e.g. Iced headless runner already in repo that meets §9.1): Plan steps to **ensure the tool is available** (install/setup), document how to run it and where evidence is written, and reference it in test strategy.
- **If build custom:** Plan steps to **design and implement** a **full-featured** project-specific automation that meets §9.1 (headless runner, action catalog, full evidence: timeline, summary, artifacts). Prefer adopting or wrapping an existing runner (e.g. Iced headless_runner) when the project uses that stack. No minimal smoke harness -- the deliverable is a tool that matches the capability and evidence depth of Puppet Master's automation.  
  ContractRef: SchemaID:evidence.schema.json, ContractName:AGENTS.md#automation
- **If both:** Plan to use existing tools where they fit, and add or extend the custom tool for full coverage and evidence.

### 9.3 Reuse of existing automation (Puppet Master reference implementation)

Puppet Master's **headless runner** and **action catalog** in `src/automation/` (AGENTS.md) are the **reference implementation**. For **Iced projects**, the plan should reference reusing or porting that pattern. For other frameworks, the plan describes building or adopting a system that meets the **same contract**: action catalog, timeline + summary + artifacts, standard evidence paths.  
ContractRef: ContractName:AGENTS.md#automation, SchemaID:evidence.schema.json

---

