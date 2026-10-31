# Shard 010: DL-260 — Product canon excludes prototype mechanics (Jared, 2026-10-31, Q3 B)

Source: `Plans/Decision_Log.md`

Source lines: L19387-L19457

Source SHA256: `4799cbe5514520b5d56e6933bf371f7c3fb47e464f99b4b7694250b4c90a288c`

---

## DL-260 — Product canon excludes prototype mechanics (Jared, 2026-10-31, Q3 B)

```yaml
plan_unit_id: DL-260
unit_type: decision_record
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: 'Jared''s 2026-10-31 Q3 B ruling removes Demo Studio and all other concept-only machinery from product
  canon, including material inherited from main before this build. The test is whether the behavior exists in the real
  product. Prototypes, sample loaders, prefilled choices, lab-only controls, clocks, fixture workspaces, hidden demo
  bridges, concept-page persistence and runtime admission for simulated receipts are not product requirements, commands,
  Settings, wiring, registries, schemas, fixtures or implementation debt. Concept source files remain untouched as design/source
  history. Historical decisions remain unchanged: this entry supersedes only the Demo Studio/concept-mechanics portions
  of DL-106, DL-144, DL-177, DL-185, DL-212, DL-227, DL-230, DL-232, DL-233 and DL-234. Their real product decisions
  remain in force. F3-649, ACD-474 and DR-070 retain retired identifiers solely so those historical links resolve, with
  no active requirement or work compilation. The guided tour remains a real feature under PWIZ-023/035/036 and F3-521;
  shared Settings, Usage Live/Pause, tab routing, work status, Pip sound and appearance, and all other genuine behavior
  stay with their production owners. Real motion follows the theme family, no fixture creates completion or Ready, and
  owner identities/receipts remain required. The chat uses one real owner route rather than a hidden demo-click exception;
  DR-075 keeps shared presentation/placement ownership. Do not retain a prototype schema branch, test case or feature
  obligation just to satisfy a gate: remove or update the companion expectation and preserve the real owner invariant
  instead. Ordinary static contract test inputs remain validation artifacts, never runtime or certification proof. This
  cleanup creates no new command, setting, event, storage family, platform API or native-readiness claim.'
gui_related: true
gui_classification_reason: Removes prototype-only UI obligations while retaining the real Guided Tour and production
  presentation contracts.
split_recommended: false
depends_on:
- DL-259
unblocks: []
acceptance_criteria:
- Only real product behavior remains active canon; retired lab contracts create no product work.
- Historical decision bytes remain unchanged; this entry supersedes their prototype-only portions.
- The guided tour and all real owner, identity, progress, preference, routing and readiness invariants remain.
- Schemas, fixtures, registries, command and wiring companions remove prototype-only admission paths and obligations.
validation_surfaces:
- python3 scripts/pm7-demo-canon-check.py
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: prototype_promoted_to_product_or_real_rule_lost
reasoning_tier: high
context_scope: product_canon_boundary
implementation_surfaces:
- Plans/FinalGUISpec.md
- Plans/assistant-chat-design.md
- Plans/Planning_Wizard.md
- Plans/Settings_System.md
- Plans/Commands_System.md
- Plans/UI_Command_Catalog.md
- Plans/Wiring_Matrix.md
- Plans/UI_Wiring_Rules.md
- Plans/DRY_Rules.md
node_compile_hint:
  mode: canonical_amendment
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- /mnt/Cursor/share/puppet-master/2026-10-29-pm7-build/DECISIONS-ONBOARDING.md (Jared, 2026-10-31, Q3 B)
preserved_exact_tokens:
- Demo Studio
- DL-260
- Q3 B
negative_constraints:
- Do not rewrite historical decision records.
- Do not erase real product behavior merely because a prototype demonstrates it.
- Do not create a product schema or gate for lab-only behavior.
owner_hints:
- Plans/Decision_Log.md
```

ContractRef: ContractName:Plans/Planning_Wizard.md#PWIZ-023, ContractName:Plans/DRY_Rules.md#DR-075
