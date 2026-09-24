# Shard 074: External Research Decision Packet Consumer Addendum (2026-09-17)

Source: `Plans/assistant-chat-design.md`

Source lines: L25736-L25786

Source SHA256: `83b9c60569d4c2bf386b21783cd218d79df08956078cd48e446f642a9a895ff1`

---

## External Research Decision Packet Consumer Addendum (2026-09-17)

External research packets (`Plans/External_Research.md`, `ERS-005`) are delivered through the decision flow this owner already defines under `DL-036`: one chat artifact holding every item, then one item at a time as a plain-language card answered with exactly one of Approve, Deny, Deny with changes, or Ask a question, with the full artifact openable throughout and status shown in text labels. Nothing about that surface changes for research packets. What this addendum records is the consumer boundary: the research owner supplies the packet content and the finding reference behind each item, and this owner keeps the artifact, the card, the response set, the questionnaire reuse and the presentation rules. A research finding classed `correction` never becomes a card, because corrections land under the standing repair authorization without a user decision; only `capability` and `product_choice` items reach this surface.

### ACD-467 - External Research Decision Packet Consumer Boundary

```yaml
plan_unit_id: ACD-467
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: >-
  External research decision packets are presented through the existing DL-036 flow without
  variation, with one chat artifact containing every item, one-at-a-time cards, the fixed response
  set Approve, Deny, Deny with changes and Ask a question, the artifact openable throughout, and
  text status labels with no colored border bars, stripes or emoji glyphs.
  Plans/External_Research.md supplies packet and card content and the union finding behind each
  item; this owner keeps the artifact, card, response and questionnaire contracts. Only capability
  and product-choice findings become cards; a correction-class finding is never presented for a
  user decision.
gui_related: true
gui_classification_reason: The artifact, the cards and their responses are user-visible chat surfaces owned here.
split_recommended: false
depends_on: [DL-036, ERS-005]
unblocks: []
acceptance_criteria:
  - A research packet uses the existing artifact and one-at-a-time card behaviour with no new response, ordering or dismissal semantics.
  - Each card carries its research finding reference and the plain-language fields the research owner supplied.
  - No card is created from a correction-class finding.
  - Status and disposition remain text labels; no colored border bars, stripes or emoji glyphs are introduced.
validation_surfaces:
  - python3 scripts/pm-new-contracts-verify.py
  - python3 scripts/pm-plan-index.py validate
risk_class: decision_review_flow_drift
reasoning_tier: high
context_scope: research_decision_review
implementation_surfaces: [Plans/assistant-chat-design.md, Plans/External_Research.md, Plans/Decision_Log.md]
node_compile_hint: {mode: consumer_disposition, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - Plans/Decision_Log.md:DL-036
  - Plans/External_Research.md:ERS-005
preserved_exact_tokens: ["Approve", "Deny", "Deny with changes", "Ask a question", "text labels"]
negative_constraints:
  - Do not add, remove or reorder a response for research packets.
  - Do not present a correction-class finding as a decision card.
  - Do not auto-approve, auto-deny or answer a card on the user's behalf.
  - Do not introduce colored border bars, stripes or emoji glyphs.
owner_hints: [Plans/assistant-chat-design.md, Plans/External_Research.md]
```

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/External_Research.md, ContractName:Plans/Decision_Log.md
