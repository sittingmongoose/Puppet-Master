# Shard 087: DL-158 — The Ask Card Fits Long Answers (2026-10-09)

Source: `Plans/FinalGUISpec.md`

Source lines: L41520-L41588

Source SHA256: `c1b4f13c5fe476c656f4b69fcf2eadd1c088be679a557c34f8b22dea84570c57`

---

## DL-158 — The Ask Card Fits Long Answers (2026-10-09)

This addendum compiles the owner decision DL-158, Jared's question of 2026-10-09 about the questions card: what happens when the answers are much longer, and whether the card adjusts its size and still looks good. Behaviour stays with its owner: `Plans/assistant-chat-design.md` section 7.4 (the question card and questionnaire contract, its option and QuestionItem shapes and its draft lifecycle). The unit below owns the presentation only and adds to F3-596's look. The concept is source lineage only: its class names, keys, harness hooks, Demo Studio and every measured size outside this unit are not canon.

### F3-609 — The Ask Card Fits Long Answers

```yaml
plan_unit_id: F3-609
unit_type: requirement
status: accepted
owner_doc: Plans/FinalGUISpec.md
canonical_text: >-
  The questions card (the Ask Card, F3-596) fits its content at any length (DL-158). It grows and shrinks with what
  it holds, up to the room above the composer: it stops short of the chat header, leaving a strip of transcript in
  view, and never pushes the composer out of the chat. Past that height the card's body scrolls inside the card, and
  neither the page nor the transcript scrolls with it; the close button, the spine and the footer (Back, Skip, and
  Next or Submit) stay in place and can always be clicked. While the body scrolls, the edge its content runs past
  fades and a hairline sits above the footer. Each question opens at the top of the body, and choosing an answer
  keeps the place the user scrolled to. The limit follows the window and the composer's height. Prompts, option
  labels, descriptions and answers wrap, and a long unbroken word or URL breaks inside its row, so nothing in the card
  scrolls or is cut off sideways. An option's description (the `description` of an `{id, label, description?}`
  option, assistant-chat-design section 7.4) shows muted under its label, and a question's own description under the
  question; a wrapping row keeps its radio or check and its number on its first line. The Something else answer is a
  field that grows line by line as the user types, and the optional note grows with its text from its resting height,
  so neither scrolls inside itself. Review shows each answer whole, its line breaks included. The @-file list opens
  below its field when the body has no room above it. Under NieR Mode a description on the menu cursor takes the
  cursor's paper colour like its label. A card whose content fits looks and measures exactly as F3-596 describes.
  This holds in every theme, at every width the chat supports and with reduced motion.
gui_related: true
gui_classification_reason: Defines how the questions card sizes, scrolls and wraps long content.
split_recommended: false
depends_on: [DL-158, F3-596]
unblocks: []
acceptance_criteria:
  - "With long content the card stops at the room above the composer, its body scrolls inside the card, and Back, Skip, Next or Submit and close stay clickable; the composer stays inside the chat."
  - "No text or control in the card scrolls or is cut off sideways, in all ten themes and at narrow widths, including a long unbroken URL."
  - "Option descriptions and the question's description are shown; Something else and the optional note grow with their text; review keeps line breaks."
  - "A questionnaire whose content fits is unchanged in size and layout, and the questionnaire's behaviour and draft lifecycle are unchanged."
  - "No WorkNodes, NodeSeeds, executable queues, implementation files, runtime launches, or production build tasks are created by this unit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: question_card_presentation_drift
reasoning_tier: standard
context_scope: chat_fixes_20261009
implementation_surfaces:
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_promotion_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Plans/Decision_Log.md#DL-158"
  - "/mnt/Cursor/PuppetMaster-Evidence/scratch/c56-questionnaire-long-answers-20261009/JARED_REQUEST.md, SHA-256 b1b1280a6dac4c2b1afed428e91c817bba1c2e7c360bfdae59b3bdec34cacf52"
  - "Concepts/chat-assistant-concepts/5.6 Pro/Chat updates.md (concept lineage only)"
preserved_exact_tokens:
  - "Ask Card"
  - "Something else"
negative_constraints:
  - "Do not let the questions card push the composer out of the chat or scroll the page or the transcript."
  - "Do not cut off or truncate an answer to make it fit; scroll the card's body instead."
  - "Do not change the questionnaire's behaviour or draft lifecycle through its size."
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
  - Plans/FinalGUISpec.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-158, ContractName:Plans/FinalGUISpec.md#F3-596, ContractName:Plans/assistant-chat-design.md#ACD-469
