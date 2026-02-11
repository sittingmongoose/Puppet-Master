# Escalation Chain Visual Flow

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PuppetMasterConfig                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  escalation: EscalationChainsConfig                      │  │
│  │    chains:                                                │  │
│  │      testFailure: [ step1, step2, step3 ]                │  │
│  │      timeout:     [ step1, step2 ]                       │  │
│  │      ...                                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  tiers:                                                   │  │
│  │    phase:   { escalation: None }                         │  │
│  │    task:    { escalation: Some(Phase) }                  │  │
│  │    subtask: { escalation: Some(Task) }                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. Iteration Fails                                                      │
│     CompletionSignal::{Timeout, Error, Gutter, ...}                    │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. handle_iteration_failure()                                           │
│     • Extract tier_type, tier_state                                     │
│     • Check if config.escalation exists                                 │
└─────────────────────┬───────────────────────────────────────────────────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
  ┌─────────────────┐   ┌─────────────────────┐
  │ Config Exists   │   │ No Config           │
  │ (NEW PATH)      │   │ (LEGACY FALLBACK)   │
  └────────┬────────┘   └──────────┬──────────┘
           │                       │
           ▼                       ▼
  ┌──────────────────────────┐   ┌──────────────────────┐
  │ determine_escalation_    │   │ EscalationEngine     │
  │ action_from_config()     │   │ .determine_action()  │
  └────────┬─────────────────┘   └──────────┬───────────┘
           │                                │
           └────────────┬───────────────────┘
                        ▼
           ┌────────────────────────┐
           │  EscalationAction      │
           │  • Retry               │
           │  • EscalateToParent    │
           │  • Skip                │
           │  • PauseForUser        │
           │  • Fail                │
           └────────────────────────┘
```

## Config-Based Escalation Flow Detail

```
┌────────────────────────────────────────────────────────────────┐
│  determine_escalation_action_from_config()                     │
└────────────────────────┬───────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 1. Map Signal → FailureType  │
          │                               │
          │  Timeout → Timeout            │
          │  Error   → Error              │
          │  Gutter  → Acceptance         │
          │  _       → Error              │
          └──────────────┬────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 2. FailureType → ChainKey    │
          │                               │
          │  map_failure_type_to_         │
          │  chain_key()                  │
          └──────────────┬────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 3. Lookup Chain in Config    │
          │                               │
          │  config.escalation.chains    │
          │  .get(&chain_key)             │
          └──────────────┬────────────────┘
                         │
          ┌──────────────┴────────────────┐
          ▼                               ▼
  ┌────────────────┐           ┌───────────────────┐
  │ Chain Found    │           │ No Chain          │
  └────────┬───────┘           └─────────┬─────────┘
           │                             │
           ▼                             ▼
  ┌──────────────────────────┐  ┌──────────────────────┐
  │ 4a. Select Step          │  │ 4b. Check tier.      │
  │                          │  │     escalation       │
  │ select_escalation_       │  │                      │
  │ chain_step(chain,        │  │ If Some(target):     │
  │            attempt)      │  │   → Escalate         │
  │                          │  │ Else:                │
  │ Returns step for         │  │   → Retry            │
  │ this attempt number      │  │                      │
  └──────────┬───────────────┘  └──────────┬───────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
             ┌──────────────────────────────┐
             │ 5. Convert ChainAction →     │
             │    EscalationAction          │
             │                              │
             │  Retry    → Retry            │
             │  SelfFix  → Retry            │
             │  KickDown → Skip             │
             │  Pause    → PauseForUser     │
             │  Escalate → EscalateToParent │
             └──────────────┬───────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │ 6. If Escalate action:       │
             │    trigger_escalation()      │
             │                              │
             │  • Find parent of target     │
             │    tier type                 │
             │  • Emit PuppetMasterEvent    │
             │  • Log escalation            │
             └──────────────┬───────────────┘
                            │
                            ▼
             ┌──────────────────────────────┐
             │ 7. Return EscalationAction   │
             └──────────────────────────────┘
```

## Step Selection Algorithm

```
Chain Configuration:
  ┌─────────────────────┐
  │ Step 1: Retry       │  maxAttempts: 2
  │                     │  Covers: 1-2
  └─────────────────────┘
  ┌─────────────────────┐
  │ Step 2: SelfFix     │  maxAttempts: 1
  │                     │  Covers: 3
  └─────────────────────┘
  ┌─────────────────────┐
  │ Step 3: Escalate    │  maxAttempts: None (infinite)
  │                     │  Covers: 4+
  └─────────────────────┘

Attempt Selection:
  Attempt 1  →  Step 1 (Retry)     remaining=1, width=2, 1≤2 ✓
  Attempt 2  →  Step 1 (Retry)     remaining=2, width=2, 2≤2 ✓
  Attempt 3  →  Step 2 (SelfFix)   remaining=1, width=1, 1≤1 ✓
  Attempt 4  →  Step 3 (Escalate)  remaining=1, width=∞  ✓
  Attempt 10 →  Step 3 (Escalate)  remaining=7, width=∞  ✓
```

## Tree Navigation for Escalation

```
TierTree Structure:
  ┌─────────────────────────────────────┐
  │ Phase 1                             │  tier_type: Phase
  │ id: "1"                             │  parent: None
  └──────────────┬──────────────────────┘
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
  ┌────────────┐      ┌────────────┐
  │ Task 1.1   │      │ Task 1.2   │     tier_type: Task
  │ id: "1.1"  │      │ id: "1.2"  │     parent: Some(0)
  └──────┬─────┘      └──────┬─────┘
         │                   │
    ┌────┴───┐          ┌────┴───┐
    ▼        ▼          ▼        ▼
  ┌───┐    ┌───┐      ┌───┐    ┌───┐
  │1.1.1│  │1.1.2│    │1.2.1│  │1.2.2│   tier_type: Subtask
  └───┘    └───┘      └───┘    └───┘     parent: Some(1 or 2)

Escalation from Subtask 1.2.1 to Task:
  1. Start: node = Subtask 1.2.1 (parent: Some(2))
  2. Check: parent_node[2] = Task 1.2 (tier_type: Task) ✓ FOUND
  3. Return: "1.2"

Escalation from Subtask 1.2.1 to Phase:
  1. Start: node = Subtask 1.2.1 (parent: Some(2))
  2. Check: parent_node[2] = Task 1.2 (tier_type: Task) ✗
  3. Move:  parent = parent_node[2].parent = Some(0)
  4. Check: parent_node[0] = Phase 1 (tier_type: Phase) ✓ FOUND
  5. Return: "1"
```

## Event Emission Flow

```
┌─────────────────────────────────────────────────────────────┐
│  trigger_escalation(from_tier_id, from_tier_type,           │
│                     to_tier_type)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 1. Lock TierTree             │
          │    let tree = self.tier_tree │
          │               .lock()        │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 2. Find Current Node         │
          │    tree.find_by_id()         │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 3. Walk Up Parent Chain      │
          │    while parent_idx exists:  │
          │      if tier_type matches:   │
          │        found!                │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 4. Create Event              │
          │    PuppetMasterEvent::       │
          │    Escalation {              │
          │      from_tier_id,           │
          │      to_tier_id,             │
          │      reason,                 │
          │      timestamp: Utc::now()   │
          │    }                         │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 5. Send to Event Bus         │
          │    event_sender.send(        │
          │      OrchestratorEvent::     │
          │      PuppetMasterEvent(evt)  │
          │    )                         │
          └──────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │ 6. Log at INFO Level         │
          │    "Escalation triggered:    │
          │     X → Y"                   │
          └──────────────────────────────┘
```

## Complete Example Flow

```
Scenario: Test failure on Subtask 1.2.3, attempt 4

Config:
  escalation:
    chains:
      testFailure:
        - action: retry, maxAttempts: 2
        - action: selfFix, maxAttempts: 1, notify: true
        - action: escalate, to: task, notify: true

Flow:
  ┌─────────────────────────────────────────────┐
  │ 1. Subtask 1.2.3 iteration fails (test)    │
  │    signal = CompletionSignal::Error(...)   │
  │    attempt = 4                              │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 2. handle_iteration_failure()               │
  │    tier_id = "1.2.3"                        │
  │    tier_type = Subtask                      │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 3. determine_escalation_action_from_config()│
  │    failure_type = Error                     │
  │    chain_key = TestFailure                  │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 4. select_escalation_chain_step()           │
  │    attempt=4, chain=[retry(2), selfFix(1),  │
  │                      escalate(∞)]           │
  │    Result: Step 3 (Escalate), index=2       │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 5. Convert: Escalate → EscalateToParent     │
  │    notify=true → log::warn!()               │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 6. trigger_escalation()                     │
  │    from="1.2.3", to_type=Task               │
  │    Navigate: 1.2.3 → 1.2 (Task) ✓           │
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 7. Emit PuppetMasterEvent::Escalation       │
  │    from_tier_id: "1.2.3"                    │
  │    to_tier_id: "1.2"                        │
  │    reason: "Escalating from Subtask to Task"│
  └────────────────────┬────────────────────────┘
                       │
                       ▼
  ┌─────────────────────────────────────────────┐
  │ 8. Return EscalateToParent                  │
  │    → Orchestrator handles accordingly       │
  └─────────────────────────────────────────────┘

Logs:
  [WARN] Escalation step 2 for 1.2.3 at attempt 4: action=EscalateToParent
  [INFO] Escalation triggered: 1.2.3 (Subtask) -> 1.2 (Task)
```

## State Transitions

```
Normal Flow (no escalation):
  Pending → Planning → Running → Gating → Passed

With Retry:
  Pending → Planning → Running → Failed (Retry) → Retrying → Running → ...

With Escalation:
  Pending → Planning → Running → Failed (Escalate) → 
    [Event: PuppetMasterEvent::Escalation] →
    [Parent tier handles continuation]
```

---

For configuration examples, see `ESCALATION_CHAIN_QUICK_REF.md`.
For implementation details, see `ESCALATION_CHAIN_IMPLEMENTATION.md`.
