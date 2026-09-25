# Shard 034: External Research Contract Validation Registration (2026-09-17)

Source: `Plans/Automated_Testing_System.md`

Source lines: L4830-L4899

Source SHA256: `77c423bd3bc6d7a7a59af0b4903e4ad76ef80b34d20f84dc8cc7a34ef635ef95`

---

## External Research Contract Validation Registration (2026-09-17)

### ATS-054 - External Research Static Contract Family Registration

```yaml
plan_unit_id: ATS-054
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Plans/external_research_contracts.schema.json and Plans/external_research_contract_fixtures.json
  retain the External Research static contract family for Plans/External_Research.md: six closed
  record shapes (research job record, classified finding record, decision packet, decision card,
  budget receipt and run manifest), 12 positive fixtures proving schema shape and the encoded
  invariants, and 30 negative fixtures each mutating one named positive so that it fails for
  exactly one named constraint, with one further positive and one further negative added under
  question q-005 for the declared other-arm input class, so the pair ships 13 positives and 31
  negatives on the same rule. The negatives prove that a decision record cannot be admitted as
  a research input, that the frozen plans snapshot cannot enter before reconciliation, that a
  designed stop cannot be claimed after a time cut, that an adapter label is not an admissible
  source for the limit that bound a job, that a correction cannot be routed to a user decision and
  a capability cannot land under the repair authorization, that a credit cannot exist without a
  cited passage or a named job, that a candidate cannot declare itself inside the union or omit
  its rejection check, that a packet cannot be presented all at once or use colored border bars,
  that the four DL-036 responses cannot be extended or reordered, that an answered card cannot omit
  its recorded time, that an averaged allowance cannot precede two reconciled jobs, that an
  unreconciled job cannot drop its unresolved charge, that captured usage cannot be presented as a
  billed amount, and that a run manifest cannot declare a runtime version, hash a tree with live
  telemetry, record a freeze after the jobs it governed, or publish a malformed freeze timestamp.
  The pair is registered in the closed CONTRACT_PAIRS manifest of scripts/pm-new-contracts-verify.py,
  which owns and reports that manifest's authored cardinality, and runs as the named subcheck
  validate-new-contracts in pm-plans-verify.py run-gates and audit-governance. Retaining or
  validating a fixture never means executing it: this is static schema and fixture evidence only,
  and native handler, provider, recovery, security, visual and performance proof remains NOT_RUN.
gui_related: true
gui_classification_reason: The retained records include the decision packet and card content that appears in Assistant Chat, which is a GUI obligation even though the surface contract is owned by assistant-chat-design.
split_recommended: false
depends_on: [ATS-046]
unblocks: []
acceptance_criteria:
  - Every positive fixture validates against its named definition; every negative fixture is rejected.
  - Each negative fixture names the single constraint it must fail and the product rule behind it.
  - The authored CONTRACT_PAIRS cardinality matches EXPECTED_CONTRACT_PAIR_COUNT with the pair present exactly once.
  - No fixture success object is reported as handler, runtime, provider or readiness evidence.
validation_surfaces:
  - Plans/external_research_contracts.schema.json
  - Plans/external_research_contract_fixtures.json
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plans-verify.py run-gates
risk_class: static_fixture_or_false_execution_claim
reasoning_tier: high
context_scope: external_research_static_contracts
implementation_surfaces: [Plans/Automated_Testing_System.md, Plans/external_research_contracts.schema.json, Plans/external_research_contract_fixtures.json, scripts/pm-new-contracts-verify.py]
node_compile_hint: {mode: static_contract_fixture_gate_only, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/External_Research.md:ERS-001
  - reports/jujutsu-research-2026-09-11/continuation4/adjudication/README.md
  - reports/jujutsu-research-2026-09-11/continuation3/gate/cost-policy.json
preserved_exact_tokens: ["validate-new-contracts", "CONTRACT_PAIRS", "NOT_RUN", "30 negative fixtures", "static schema and fixture evidence only"]
negative_constraints:
  - Do not infer runtime, provider, recovery, security, visual or performance results from fixture validation.
  - Do not add schemas or fixture pairs to the gate through an ambient glob.
  - Do not convert static validation into execution evidence or a readiness unlock.
  - Do not restore a literal CONTRACT_PAIRS cardinality to this gate registration; that denominator belongs to scripts/pm-new-contracts-verify.py.
  - Do not change any behaviour of the contracts verifier beyond registering this pair.
owner_hints: [Plans/Automated_Testing_System.md]
```

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/External_Research.md
