# Shard 032: Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

Source: `Plans/Tools.md`

Source lines: L10924-L10974

Source SHA256: `8267963419c1d6b68ad9337379c2f27485848acfa7a831f04b24ac2e178d529b`

---

## Ledger Compile Addendum - pldg-20260617-001-plans-to-code-handoff

### T-159 - Automated Test Tool Capability Discovery Consumer

```yaml
plan_unit_id: T-159
unit_type: requirement
status: accepted
owner_doc: Plans/Tools.md
canonical_text: >-
  Tools consumes Automated_Testing_System capability discovery for browser automation, GUI automation, device/emulator automation, screenshot capture, logs, app launch, headless/headed modes, project-native test runners, and official testing option research. For web projects, once Puppet Master is built, Puppet Master built-in browser automation is the primary native web test automation path; Playwright can remain optional, fallback, or project-native. Slint live preview/live reload is a Puppet Master build example only and must not become the default testing assumption for all user projects.
  For web testing, Playwright optional remains fallback or project-native rather than the native default.
gui_related: true
gui_classification_reason: Browser automation, GUI automation, emulator sessions, screenshots, and visual evidence are user-visible tool surfaces.
depends_on: [ATS-001, ATS-002, ATS-004]
unblocks: [ATS-002, ATS-004, RAP-029]
acceptance_criteria:
  - Tools can report browser, GUI, device/emulator, screenshot, log, launch, headless/headed, and native runner capabilities to Automated_Testing_System.
  - Built-in browser automation is the preferred native path for web testing once available.
  - Playwright remains optional/fallback/project-native and Slint remains an example only.
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
  - "Puppet Master built-in browser automation"
  - "Playwright optional"
  - "Slint"
  - "example only"
negative_constraints:
  - Do not hyper-focus automated testing around Slint.
  - Do not default native Puppet Master web testing to Playwright when the built-in browser can do it.
owner_hints:
  - Plans/Tools.md
  - Plans/Automated_Testing_System.md
  - Plans/Runtime_Artifacts_Panel.md
```

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Runtime_Artifacts_Panel.md
