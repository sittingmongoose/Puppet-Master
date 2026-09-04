# Shard 018: Ledger Compile Addendum - pldg-20260626-001-feature-name

Source: `Plans/Commands_System.md`

Source lines: L3670-L3776

Source SHA256: `fda89aac8b3d6c391f15e7011082e08ccbe2db214c3b73b2dab1bf16d0f6194b`

---

## Ledger Compile Addendum - pldg-20260626-001-feature-name

This addendum compiles accepted source-lineage obligations from bootstrap ledger `pldg-20260626-001-feature-name` into this existing owner/consumer doc. It creates canonical PlanUnits only; it does not create WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, generated governance artifacts, or production build tasks.

### CS-053 - Teach Invocation Command Routes

```yaml
plan_unit_id: CS-053
unit_type: requirement
status: accepted
owner_doc: Plans/Commands_System.md
canonical_text: Teach/Teacher can be summoned through /teach, help icon launches, and varied natural-language phrases
  such as asking PM to teach, explain, show how, walk me through, or help me do something. Summon phrase resolution
  disambiguates Teach guidance from implementation/build requests, carries current-surface context into a new or
  selected Teacher thread, and exposes Help icon/summon phrase guidance in Help/Glossary entries.
gui_related: true
gui_classification_reason: Defines user-facing /teach and natural-language invocation routes into Assistant Chat.
depends_on:
- UCC-102
unblocks:
- ATS-014
acceptance_criteria:
- Live PlanUnit exists in the adjudicated owner doc with reciprocal ledger source_lineage.
- Exact source tokens, negative constraints, owner hints, and user corrections are preserved in PlanUnit metadata.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks
  are created by this compile.
validation_surfaces:
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260626-001-feature-name
- python3 scripts/pm-plan-index.py validate
- git diff --check
risk_class: teach_invocation_gap
reasoning_tier: standard
context_scope: teach_invocation_commands
implementation_surfaces:
- Plans/Commands_System.md
- future command parser
- future command palette
node_compile_hint:
  mode: teach_invocation_commands
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260626-001-feature-name:atom-0096
- pldg-20260626-001-feature-name:atom-0129
- pldg-20260626-001-feature-name:atom-0140
- chat:teacher-feature-initial-framing
- chat:teach-teacher-correction
- Plans/assistant-chat-design.md#6-Teach
- Plans/Commands_System.md#7-Reserved-built-in-slash-commands
- chat:teach-gap-fill-correction
- q-0028
- chat:teach-bundle-accepted-pmconcept-reference
- chat:work-through-teach-gaps
- Plans/assistant-chat-design.md#6-teach
- Plans/FinalGUISpec.md#19.6-natural-language-invocation-feedback
source_atom_ids:
- atom-0096
- atom-0129
- atom-0140
decision_refs:
- dec-0018
- dec-0019
- dec-0020
- dec-0024
correction_refs:
- corr-0003
preserved_exact_tokens:
- summoned by the user in assistant chat with a variety of phrases
- /teach
- teach me
- show me how
- walk me through
- explain this
- how do I
- what does this mean
- help me understand this
- help icon
- new Assistant Chat thread
- Teacher mode
- current surface/control context
- Teacher badge
- context chip
- model chip
- continue with Teacher
- explain this screen
- remember that
- for this repo always
- compact disambiguation
negative_constraints:
- Do not route every `/teach` or teaching-like phrase to durable memory persistence without classifying intent and
  asking for confirmation when persistence is involved.
- Do not leave Teach invocation as a single slash command with no natural-language path.
- Do not allow user-defined commands to override reserved Teach/Assistant Chat command behavior if promoted into
  the reserved set.
- Do not silently switch an existing assistant conversation into Teacher mode.
- Do not launch Teacher without preserving current surface/control context when available.
- Do not require users to know slash commands before discovering Teach.
- Do not turn every help request into durable memory capture.
- Do not persist natural-language instructions without explicit confirmation.
- Do not guess between one-off teaching and Teach capture when the user intent is ambiguous.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/UI_Command_Catalog.md
- Plans/Commands_System.md
- Plans/Personas.md
- Plans/FinalGUISpec.md
```
