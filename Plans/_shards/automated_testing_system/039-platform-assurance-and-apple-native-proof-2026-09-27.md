# Shard 039: Platform assurance and Apple-native proof — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5348-L5388

Source SHA256: `294219a33c4d062d52f10afca873d20a7a25977f603bf3a2e1909e6971bc0480`

---

## Platform assurance and Apple-native proof — 2026-09-27

Every platform-dependent test, build, or evidence strategy states its required target platform, proof kind, target capability, and explicitly accepted actual assurance modes. The modes preserve native-authoritative, virtualized-authoritative, compatibility, cross-target, simulated-or-mocked, and unavailable meanings. They are not a numeric rank: compatibility and cross-target are distinct routes, and an acceptance criterion may admit either, both, or neither. A TestRunReceipt records the actual mode, host, environment, target, capability receipt and whether the exact strategy requirement was met. A passing result requires that comparison to be true; an unavailable or weaker route cannot be silently promoted. A missing runner remains blocked or not run, never a pass.

Genuine Safari, macOS UI/system proof, Apple-native signing, and Xcode/Simulator proof require a suitable native macOS host and the corresponding target capability. The existing Xcode/Simulator preflight remains authoritative. PM's built-in browser (including its CEF backend) may supply PM-browser evidence but cannot satisfy genuine Safari proof. TestCapabilityReport records the target-specific native capability and its availability; Apple proof is unavailable until a suitable Mac capability receipt exists. The visible test session and exported evidence selection carry actual assurance mode, requirement/result references and comparison outcome with the artifact identity, version and hash. A redacted preview or bundle cannot relabel a compatibility, cross-target, simulated or unavailable result as native proof. Testing owns acceptance; the platform owner supplies actual capability and the evidence consumer projects the recorded result.

```yaml
plan_unit_id: ATS-059
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Platform-dependent test/build/evidence strategies require an explicit target proof and accepted assurance modes;
  receipts bind actual assurance to host/environment and compare it to the exact requirement before pass.
  Genuine Safari, macOS UI/system, Apple signing and Xcode/Simulator proof require a suitable native Mac and
  target capability, while selected visible/exported evidence preserves actual assurance and comparison truth.
gui_related: true
gui_classification_reason: Test evidence displays and exports must show the actual assurance and comparison outcome.
depends_on: [ATS-001, ATS-048, CRAU-101]
unblocks: []
acceptance_criteria:
- Every platform-dependent strategy names its accepted actual modes, target platform, proof kind and capability; every result records actual mode, Host/Environment, capability receipt and requirement comparison.
- A passing receipt rejects a weaker or unavailable substitution; compatibility and cross-target are not silently ranked as equivalent.
- Genuine Safari proof rejects PM browser/CEF evidence; Apple-native proof requires a suitable Mac capability receipt, with Xcode/Simulator preflight preserved.
- Selected visible and exported evidence retains actual assurance, requirement/result references and comparison outcome without changing the test verdict.
- Static fixtures and schema checks do not claim a native runner or executed Apple test.
validation_surfaces: [Plans/plans_to_code_handoff.schema.json, Plans/testing_session_command_contracts.schema.json, Plans/platform_assurance_contract_fixtures.json, python3 scripts/pm-platform-execution-policy-verify.py]
risk_class: weak_platform_evidence_promoted_to_authoritative
reasoning_tier: high
context_scope: platform_assurance_apple_native_testing
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/plans_to_code_handoff.schema.json, Plans/testing_session_command_contracts.schema.json, future native Testing adapters]
node_compile_hint: {mode: testing_contract_only, create_worknodes: false, create_nodeseeds: false}
source_lineage: [PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/06_CROSS_PLATFORM_EXECUTION_AND_BROWSER.md#assurance-and-macos]
negative_constraints:
- No historical enum spelling is required of native implementations when the six meanings and comparison remain unambiguous.
- Do not treat PM built-in browser evidence as genuine Safari or a non-Mac route as Apple-native proof.
- Do not infer a native pass from schema validity, a static fixture or missing capability.
owner_hints: [Plans/Automated_Testing_System.md, Plans/Containers_Registry_and_Unraid.md, Plans/newtools.md]
```

ContractRef: ContractName:Plans/Automated_Testing_System.md#ATS-001, ContractName:Plans/Automated_Testing_System.md#ATS-048, ContractName:Plans/newtools.md, ContractName:Plans/plans_to_code_handoff.schema.json, ContractName:Plans/testing_session_command_contracts.schema.json
