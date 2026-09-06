# Shard 046: Ledger Compile Addendum - pldg-20260614-002

Source: `Plans/FinalGUISpec.md`

Source lines: L26495-L26534

Source SHA256: `342462919f6e41f5f85d7c9e4eaf265d109a277d8ac29b0b7343a69abd20694c`

---

## Ledger Compile Addendum - pldg-20260614-002

### F3-390 - Visualizer Third Party Library Allowlist Policy

```yaml
plan_unit_id: F3-390
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  Inline visualizer third-party JavaScript execution is closed by default. The default allowlist is
  empty; a library may execute only when a versioned allowlist entry records package name, version,
  bundled asset, integrity record, artifact metadata declaration, license/security review, performance
  budget, rendering capability scope, fallback behavior, upgrade/removal policy, and owner approval path.
  D3, Chart.js, and Three.js are examples only when curated, pinned, bundled, and explicitly allowed.
gui_related: true
gui_classification_reason: Inline visualizer rendering, fallback behavior, and library-driven visual modules are user-visible GUI behavior.
depends_on: [F3-382]
unblocks: []
acceptance_criteria:
  - No third-party visualizer library executes without a versioned allowlist entry.
  - CDN fetches, dynamic network import, same-origin escalation, popup/form/top-navigation permissions, and undeclared script injection are invalid.
  - Library fallback and removal behavior are documented before a visual module can depend on the library.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: visualizer_script_policy_drift
reasoning_tier: high
context_scope: final_gui_visualizer_allowlist
implementation_surfaces: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md]
node_compile_hint: {mode: visualizer_third_party_allowlist, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0109
  - pldg-20260614-002-part-3-fable-cleanup:atom-0110
preserved_exact_tokens: ["visualizer third-party JS library allowlist", "TBD remains an open design item", "D3", "Chart.js", "Three.js", "sandbox='allow-scripts'"]
negative_constraints:
  - Do not allow remote CDN scripts or dynamic network imports in visual modules.
  - Do not treat D3, Chart.js, or Three.js as allowed unless a versioned allowlist entry exists.
owner_hints: [Plans/FinalGUISpec.md, Plans/assistant-chat-design.md]
```
