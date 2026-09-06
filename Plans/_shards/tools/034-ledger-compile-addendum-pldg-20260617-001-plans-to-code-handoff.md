# Shard 034: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Tools.md`

Source lines: L11215-L11268

Source SHA256: `f184b9325f823a984b7eaf731ec462d3716de09e767f6480d03ec145027175db`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### T-159 - Automated Test Tool Capability Discovery Consumer

```yaml
plan_unit_id: T-159
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools consumes Automated_Testing_System capability discovery for browser automation, GUI automation, device/emulator automation, screenshot capture, logs, app launch, headless/headed modes, project-native test runners, and official testing option research. Puppet Master's Browser Program and Expert Browser Program are the only PM-native web browser automation and testing paths. A user Project may independently depend on and run its own Playwright suite only as a generic external Project command/process under Project tooling policy; PM may ingest generic Test Capture or artifact refs with explicit external-Project attribution, but that process creates no PM browser authority or compatibility surface. Slint live preview/live reload is a Puppet Master build example only and must not become the default testing assumption for all user projects.
gui_related: true
gui_classification_reason: Browser automation, GUI automation, emulator sessions, screenshots, and visual evidence are user-visible tool surfaces.
depends_on: [ATS-001, ATS-002, ATS-004]
unblocks: [ATS-002, ATS-004, RAP-029]
acceptance_criteria:
  - Tools can report browser, GUI, device/emulator, screenshot, log, launch, headless/headed, and native runner capabilities to Automated_Testing_System.
  - Browser Program and Expert Browser Program remain the only PM-native web browser automation and testing paths.
  - A user Project Playwright suite runs only as a generic external Project command/process; any ingested generic Test Capture or artifact refs carry explicit external-Project attribution and confer no PM browser authority or compatibility surface.
  - Slint remains an example only.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - future tool capability discovery tests
risk_class: testing_tool_assumption_drift
reasoning_tier: standard
context_scope: automated_test_tool_capabilities
implementation_surfaces: [Plans/Tools.md, Plans/Automated_Testing_System.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: test_tool_capability_discovery, create_worknodes: false}
source_lineage:
  - pldg-20260617-001-plans-to-code-handoff:atom-0028
  - pldg-20260617-001-plans-to-code-handoff:atom-0030
  - pldg-20260617-001-plans-to-code-handoff:atom-0031
  - pldg-20260617-001-plans-to-code-handoff:dec-0014
  - pldg-20260617-001-plans-to-code-handoff:corr-0008
preserved_exact_tokens:
  - "browser automation"
  - "emulator"
  - "Browser Program"
  - "Expert Browser Program"
  - "generic external Project command/process"
  - "external-Project attribution"
  - "Slint"
  - "example only"
negative_constraints:
  - Do not hyper-focus automated testing around Slint.
  - Do not create or imply a PM Playwright runtime, facade, compatibility vocabulary or namespace, package, port, MCP route, command or alias, Settings/Doctor/support capability, or capture engine.
  - Do not grant an external Project command/process PM browser authority through artifact ingestion.
owner_hints:
  - Plans/Tools.md
  - Plans/Automated_Testing_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md
