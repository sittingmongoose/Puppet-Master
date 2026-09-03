# Shard 005: Durable host continuation

Source: `Plans/Goal_Runtime_System.md`

Source lines: L123-L159

Source SHA256: `905e3f1889eb2f6aaf3583d278b9d49b80cc69be4f01fecefbcbda7f3887d429`

---

## Durable host continuation

Continuation is the entire reason the Goal object exists, and it is host-owned. One model response ending is not completion. When a model turn ends, the host — not the model, and not a prompt instruction telling the model to keep going — reloads canonical Goal state, checks currentness, checks the user stop epoch, evaluates objective-completion evidence supplied by the owning caller, and decides whether to admit another ordinary agent turn.

The evaluation is recorded as a `GoalContinuationRecord`:

```yaml
schema_id: pm.goal.continuation.v2
fields:
  continuation_id: string
  goal_id: string
  goal_revision: integer
  owning_run_id: string
  evaluated_at: timestamp
  result: continue|complete|pause|blocked|cancelled
  completion_evidence_refs: [string]
  blocked_reason_ref: string|null
  next_attempt_ref: string|null
  user_stop_epoch: integer
```

Rules that hold for every continuation evaluation:

- The next turn is an ordinary agent turn with bounded current workflow context. The host does not paste the full thread history forward and does not accumulate a growing Goal prompt; a Goal that has run for two hours sends no more objective text than it did on turn one.
- `result: continue` requires an unfinished objective, an eligible thread, an unchanged stop epoch, and a runnable next attempt. Any one of those failing produces a non-`continue` result with a recorded reason.
- `result: complete` requires `completion_evidence_refs` from the owning caller. A model asserting that it is finished is a proposal; the recorded evidence is what closes the Goal.
- `user_stop_epoch` is captured at evaluation time and compared at dispatch time. A continuation that was decided before a Stop and would dispatch after it is discarded.
- Continuation is idempotent per `(goal_id, goal_revision, owning_run_id, next_attempt_ref)`. A crash-and-restart replays the decision without duplicating a completed effect.
- Continuation survives compaction, restart, model switch, provider switch, and account switch, because the Goal record is durable and the continuation decision is recomputed from it rather than carried in conversation context.

Manual Stop, Pause, and Cancel are authoritative and terminal for automation. They defeat Goal continuation, scheduled resume, Usage-reset resume, execution-window resume, Crew Auto, and provider-native retry until the user explicitly resumes or creates a new schedule. Nothing auto-resumes a manually stopped Goal — not a quota reset, not a window opening, not a successful dependency, not a later approval. This document defers to `Plans/Scheduling_and_Quota_Resume.md` for window and quota mechanics and takes precedence over it on this one point.

Provider quota may put a run into the shared quota wait. That wait belongs to the scheduling/quota owner. It does not mutate `objective_text`, does not create a Goal phase, and does not change `state` on its own; the Goal stays `active` with its run waiting, exactly as the Build control stays `Building…` during a quota pause.

Execution windows may pause and resume the run through `Plans/Scheduling_and_Quota_Resume.md`. Goal Runtime consumes that service and specifies none of its internals here.

ContractRef: ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Executor_Protocol.md
