# Shard 044: ELI5 in chat acceptance checks — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5711-L5774

Source SHA256: `64e6a3029903f00d5196febde4ed1ceb65d332cece93552c030c6488fa84a9e1`

---

## ELI5 in chat acceptance checks — 2026-09-27

### ATS-065 - ELI5 Resolution Forward-Only Switching And Explain This Reply Simply Checks

```yaml
plan_unit_id: ATS-065
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The chat's ELI5 acceptance checks (DL-126; assistant-chat-design ACD-484, FinalGUISpec F3-581)
  read painted pixels or measured state, never dispatch counts, and cover: the resolution order in
  all three cases (a chat override wins; without one the project default applies; without either
  the app default applies) and inherit, which deletes the override so the chat follows the project
  default; a switch that leaves every earlier reply's recorded text and style unchanged, starts no
  provider request and adds no reply, so the thread's reply count after a switch equals the count before it; a reply streaming during a switch finishing in the style it started with; the
  divider painted between the last reply in the old style and the first in the new; the Simple
  explanation tick on every reply written in Simple and on no other; Explain this reply simply
  adding exactly one reply at the end of the thread, leaving the explained reply and every ELI5
  setting unchanged, and cmd.chat.eli5.explain_reply refused for a reply that is still streaming; the ELI5 sheet at 720 x 560 with an unchanged height when its disclosure opens; the quick dot
  painted lit or muted to match the resolved state and switching the chat in one click without
  opening the sheet; generated documents, code, plans and files unchanged by any ELI5 state; and
  the dual-copy checklist listing no helper line under a control. The guided tour's own ELI5
  acceptance items belong to the tour owner and are re-pointed under ACD-484's obligation; this
  unit does not restate them.
gui_related: true
gui_classification_reason: "Defines the tests that gate ELI5 in the chat, its sheet and its quick dot."
split_recommended: false
depends_on: [ACD-484, F3-581, F3-572, DL-126]
unblocks: []
acceptance_criteria:
  - "Each listed behaviour has at least one automated check that reads painted pixels or measured state."
  - "The switch check measures the reply count, every earlier reply's text and the provider request count before and after the switch."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: eli5_second_response_or_rewrite
reasoning_tier: standard
context_scope: chat_eli5_tests
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: test_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/pm56-modules-canon-20260927/DESIGN-SPEC.md (SHA-256 dc0a02e550dd2e927faa59006cecab098e7c08b4aeb2479bf62e219f9b5907de) section 8.13"
  - "IMPACT-REGISTER B-ACD-01, B-FGS-08 (ELI5); card p08, E-11"
  - "Plans/Decision_Log.md#DL-126 (Owner resolution, Jared, 2026-09-27, confirmed in chat)"
preserved_exact_tokens:
  - "the thread's reply count after a switch equals the count before it"
  - "cmd.chat.eli5.explain_reply refused for a reply that is still streaming"
  - "720 x 560"
  - "Explain this reply simply"
negative_constraints:
  - "Do not assert dispatch counts in place of painted or measured state."
  - "Do not pass a switch check that measures only the newest reply."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-484, ContractName:Plans/FinalGUISpec.md#F3-581, ContractName:Plans/Decision_Log.md#DL-126
