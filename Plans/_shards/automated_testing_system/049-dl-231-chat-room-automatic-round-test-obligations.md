# Shard 049: DL-231 Chat Room automatic round test obligations

Source: `Plans/Automated_Testing_System.md`

Source lines: L6668-L6766

Source SHA256: `c6a020b3dcd9310c03940a59fca04a218f2734d59ca3567dbb193deec919b6c0`

---

## DL-231 Chat Room automatic round test obligations

| Case | Required proof |
|---|---|
| Start and initial Grill Me | Start begins round 1 with no Ask Everyone or Next Round click. With Grill Me on, no participant turn starts before the current What we agreed Confirm; round 1 starts automatically after it. A Wonderer never delays the round. |
| Automatic rounds | With pause_between_rounds false or absent, completing a round creates no pacing wait. Run every eligible later round without a click under the same moderated, round_robin or free_discussion policy and its deterministic recorded participant order, until the configured limit or stop condition. Existing permission, needs-you and Grill Me gates remain in force, including every later session's current Confirm; only dependent work waits, and eligible round progression continues automatically once the gate clears. No automatic start dispatches cmd.chat_room.next_round or any other command. |
| Mid-run Grill Me and later Confirm | Enable Grill Me during round 2. Running work continues and the session starts at the next round boundary. Only the round or step consuming its answers waits for its current What we agreed Confirm. A later session needs a fresh Confirm; an earlier session's Confirm cannot release its dependent work. Eligible round progression resumes automatically after each current Confirm without a Next Round click when pause_between_rounds is off. |
| Ordinary needs-you gates | With Grill Me off and pause_between_rounds false, raise an ordinary user-decision question and a permission request. Only dependent work waits for the answer or approval; clearing the gate resumes eligible round progression automatically. Questions, approvals and failures keep the needs dock tone even between numbered rounds. |
| Pausing between rounds | With the switch true, wait after each non-final round, show Round N done as the user's move and offer Next Round, Summarize Now and End discussion. One Next Round starts exactly one round under the unchanged policy. |
| Next Round refusal | Return run_state_invalid with no committed work when the switch is false or absent, a round is running, round 1 has not run, all configured rounds are used, the stop condition is met, the room is paused or terminal, it waits for Grill Me or another user action instead of between rounds, the wait position is unknown, or ask_everyone_once has finished. Exercise both chat_room_card and chat_room_panel. |
| Exhaustion and stop condition | Wait after the final round or an earlier stop condition; never finish automatically. Preserve This room used all its rounds at exhaustion. Add 2 more rounds raises add_rounds through reconfigure and starts the next round immediately; added rounds obey the switch. Summarize Now writes a summary and does not end the room. End discussion completes; Cancel cancels. |
| Pause and Resume | Pause wins over automatic continuation and holds at the next safe turn boundary. Resume continues the round in progress, with later automatic rounds unless the switch is on. No turn is cancelled, duplicated or restarted by a switch change. |
| Messages | A message queued mid-round reaches its addressees exactly once when the next round starts, whether automatically or through Next Round. Send now steers without cancelling a turn; the next speaker reads it first and all later speakers in that round see it. |
| Definition and Settings | New definitions persist a boolean pause_between_rounds. Reject it on Crew, Review or BrainStorm. Existing definitions without it read false. The sheet copies assistant.multi_agent.chat_room.pause_between_rounds, factory false; Save as default uses the Settings transaction and later defaults never alter a committed room. |
| Mid-run on and off | Both card and panel raise set_pause_between_rounds through cmd.collaboration.reconfigure. Under revision/currentness checks, bump the definition revision once and write one system entry. Turning on during a round waits only after it finishes; turning off at a between-round wait starts the next round immediately subject to existing gates. Preserve the turn, reject terminal reconfiguration, fence stale revisions and replay, and allow only one actionable host. |
| One-shot policy | ask_everyone_once asks every participant once and then stops starting turns regardless of the switch; no extra round follows from a between-round control. |
| Dock | Between automatic rounds publish live when no existing user gate or manual pause requires attention. Publish yourmove at the switch-on between-round wait, after the final round or stop condition, while paused, and while any Grill Me session waits for its current Confirm, before round 1 or after mid-run activation before the round needing its answers. Questions, approvals and failures remain needs (ACD-476). Round completion alone creates no user attention. |

Schema validation and explicit fixture-only owner-state joins prove static admission constraints. Automatic progression, dispatch counts, transcript writes, actual Settings/storage behavior, UI/dock rendering, provider work, races and recovery remain future runtime obligations. A passing fixture gate is no native implementation proof.

### ATS-079 - Chat Room Automatic Rounds And Pause Boundary Obligations

```yaml
plan_unit_id: ATS-079
unit_type: validation_criterion
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  DL-231 and CWR-044 require the test rows above for Start, initial and later Grill Me Confirm,
  ordinary needs-you and permission gates, automatic rounds,
  pausing between rounds, Next Round refusal, exhaustion, stop conditions, Pause/Resume, messages,
  definition/Settings defaults, mid-run switching, ask_everyone_once and ACD-476's dock. Static
  positives cover boolean pause_between_rounds, a missing legacy field, on/off
  set_pause_between_rounds requests from chat_room_card and chat_room_panel, and the existing
  reconfigure results. ParticipantActivity positives express a mid-run Grill Me Confirm and an
  ordinary needs-you question through existing decision_ref fields; they prove shape only.
  Negatives reject non-booleans, the field on other kinds, malformed changes,
  non-Chat Room switching and cmd.chat_room.next_round outside the switch-on between-round wait.
  Fixture-only owner-state joins prove run_state_invalid for switch false or absent, a running
  round, before round 1, exhausted rounds, met stop conditions, paused/terminal state, other or
  unknown user waits and one-shot completion; these context projections are not new durable records or request fields. Native
  acceptance must prove automatic round starts dispatch no command, unchanged deterministic turn
  order, exactly one user-started round, one revision and system entry per switch, boundary
  activation without cancelled work, immediate continuation when switched off at the between-round
  wait, one actionable host, exact-once message delivery, manual pause precedence, nonterminal
  exhaustion and correct needs and live/yourmove dock tones. Only work consuming a gated answer
  waits; each later Grill Me session requires its own current Confirm, and eligible rounds resume
  automatically after an existing permission, needs-you or Confirm gate clears. Replay, stale
  currentness, denial and restart must not duplicate turns, system entries or messages. Passing static schema and fixture joins
  establishes none of these native protocol, dispatch, persistence, provider or visual facts.
gui_related: true
gui_classification_reason: Covers the setup check, run switch, round controls and live/yourmove dock presentation.
depends_on: [CWR-024, CWR-031, CWR-044, ACD-476, ATS-062, UCC-207, WM-095, CV-364]
unblocks: []
acceptance_criteria:
  - Every schema positive passes its selected definition and aggregate root; every negative fails its named shape or fixture-join invariant.
  - All thirteen CWR-044 acceptance criteria have explicit test rows, including no command dispatch for automatic starts.
  - Mid-run Grill Me activation and every later session require a fresh current Confirm for dependent work; clearing it resumes eligible automatic progression.
  - Ordinary needs-you questions and permission requests still gate dependent work with Grill Me off and no pacing pause; clearing them resumes eligible automatic progression, and questions, approvals and failures remain needs.
  - Defaults, mid-run switching, message timing and dock attention obey the same owner boundary.
  - Static fixture success claims no native protocol, UI, persistence or recovery proof.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py validate-new-contracts
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_room_round_boundary_coverage
reasoning_tier: standard
context_scope: chat_room_rounds_companions
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/collaborative_workflows_contract_fixtures.json
  - scripts/pm-new-contracts-verify.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-231
  - Plans/Collaborative_Workflows.md#CWR-044
preserved_exact_tokens:
  - pause_between_rounds
  - set_pause_between_rounds
  - cmd.chat_room.next_round
  - run_state_invalid
  - chat_room_card
  - chat_room_panel
  - ask_everyone_once
  - live/yourmove
negative_constraints:
  - Do not call fixture-only owner-state joins runtime or storage proof.
  - Do not treat automatic round starts as user commands.
owner_hints:
  - Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/Decision_Log.md#DL-231, ContractName:Plans/Collaborative_Workflows.md#CWR-044, ContractName:Plans/assistant-chat-design.md#ACD-476, ContractName:Plans/UI_Command_Catalog.md#UCC-207, ContractName:Plans/Wiring_Matrix.md#WM-095, ContractName:Plans/Contracts_V0.md#CV-364


Q22 appearance amendment (Jared, 2026-10-30; Plans/Decision_Log.md#DL-257): current appearance contracts use five ordered families and ten variants. Earlier override-only or eight-theme evidence is historical, not current acceptance. Settings_System SSYS-043 owns the retired-key migration and retained NieR Adjust rows.
