# Shard 040: Chat presentation acceptance checks — 2026-09-27

Source: `Plans/Automated_Testing_System.md`

Source lines: L5390-L5446

Source SHA256: `a1ea666112207b4ae069e3b02e8bc58562281ba3f17218a452d78e22eb12277f`

---

## Chat presentation acceptance checks — 2026-09-27

### ATS-061 - Chat Presentation And Sound Acceptance Checks

```yaml
plan_unit_id: ATS-061
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  The chat's acceptance suite reads painted pixels or measured state, never dispatch counts, and
  covers: the sent text visible in every frame of the send; a thinking placeholder before the first
  word and word counts that only grow; the four terminal states of ACD-470; busy sends per ACD-471
  (queued by default, Stop holds the queue, Send now steers and sends only its entry); follow-along
  within 24px of the bottom and a wheel-up never pulled back; content above the reader moving at
  most 5px when a card folds and never snapping down when a card shrinks mid-turn; concurrent, failed and waiting subjects; at most 30 nodes at 140
  subjects; the fold when the answer starts; every item naming its family; the accent scan of
  ACD-469; zero sideways overflow at full width and in a 234px pane; reduced motion landing end
  states; and a live-only working tick that costs less than a full render. Sound checks render every
  cue of every kit offline: peaks at or under -20 dBFS, cues of the same tier within about 3 dB
  across kits, at most one cue per 120ms, step ticks at most one per 250ms, and nothing before a
  user gesture.
gui_related: true
gui_classification_reason: "Defines the tests that gate the chat presentation."
split_recommended: false
depends_on: [ACD-469, ACD-470, ACD-471, ACD-472, ACD-473, ACD-475, ATS-016]
unblocks: []
acceptance_criteria:
  - "Each listed behaviour has at least one automated check that reads pixels or measured state."
  - "Sound checks run on offline renders of every cue in every kit."
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_presentation_regression
reasoning_tier: high
context_scope: chat_presentation_tests
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: test_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - "Concepts/chat-assistant-concepts/5.6 Pro/turn-verify.mjs (concept lineage only)"
preserved_exact_tokens:
  - "-20 dBFS"
  - "234px"
  - "30 nodes"
negative_constraints:
  - "Do not assert dispatch counts in place of painted or measured state."
  - "Do not gate on the concept's measured timings."
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/assistant-chat-design.md#ACD-469, ContractName:Plans/Automated_Testing_System.md#ATS-016
