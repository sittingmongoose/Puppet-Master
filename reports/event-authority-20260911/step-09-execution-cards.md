# Step 09 — Execution lane decision cards

This is a candidate product card, not an answered disposition or registration. The exact 88 reviewed rows comprise 68 remaining technical rows and 20 card-linked rows: task.failed plus 19 artifact rows sharing one retention card. Technical gaps remain explicit and are not a fourth terminal disposition. The historical interview phase wording was resolved by explicit owner retirement and creates no card.

## EA-S09-EXEC-TASK-FAILURE — Task failure history

**Owner:** `Plans/assistant-chat-design.md`; adjacent owners: Contracts and Storage, with Orchestrator child-run semantics preserved.

**Question:** Should `task.failed` be a presentation notification backed by canonical child-run history, or a separately persisted EventRecord family with its own replayable task-failure history?

**Why it arose:** Assistant Chat line 1374 requires a `task.failed` emission with error detail but does not state a separate persistence boundary. Lines 1790 and 1826 require chat cards to project canonical child-run state. Contracts line 2987 names `subagent.failed`, but no exact alias is specified and that target is not centrally registered. Similar wording cannot prove an alias or erase a required failure notification.

**What you get:** An explicit boundary for the required failure signal while preserving visible errors, canonical child lifecycle, parent-owned retries, timeout distinctions and audit attribution.

**Cost/tradeoff:** Presentation notification avoids a second event family but supplies no independent `task.failed` replay stream. Separate persistence enables that exact history and requires a full payload, identity, producer/consumer/checkpoint, custody, retention and oracle contract. Billing estimates are unavailable.

**Concrete options:** A — Keep the required failure notification as presentation output over canonical child-run records, without a separate persisted `task.failed` family. B — Require an independent persisted `task.failed` family and specify how task-level failures relate to child-run failures. C — Supply another explicit scope boundary or distinction between task and child failure.

**Recommendation:** A. Preserve canonical child failure history and visible error detail; author a clear nonpersisted-notification rule. This is not an alias to `subagent.failed`, not permission to delete history, and not a change to any registered family.

**Responses:** Approve / Deny / Deny with changes / Ask a question. Approve selects recommendation A.

**Answer:** __________

Structured source citations, whole-file hashes and exact external excerpts are recorded in the `task.failed` row of `step-09-execution-rows.jsonl`. No response has been supplied and no canonical edits follow from this candidate card.


## EA-S09-EXEC-RUNTIME-ARTIFACT-RETENTION — Runtime artifact event history

**Owner:** Runtime Artifacts semantic owner with Storage retention authority.

**Complete card:** `reports/event-authority-20260911/step-09-runtime-artifact-retention-card.md` (root-owned publication).

**Decision:** Whether to adopt the owner recommendation to retain all 19 runtime-artifact event histories indefinitely, including their embedded text, or require a bounded policy for eligible non-authority runtime history with explicit per-event classification. Existing artifact-body access, deletion, holds and other owner policies remain in force. The schemas are not all content-free or byte-bounded; retention approval alone does not close those admission gaps.

**Why it arose:** Runtime_Artifacts_Panel.md:2454–2456 explicitly recommends RP-AUTHORITY-INDEFINITE and explicitly withholds current assignment. Storage-plan.md:1535 calls unknown-policy indefinite retention materially incomplete. A fallback preservation rule is not an approved policy choice.

**Status:** Unanswered; presentation queued behind the current account card. No approval, event admission or canonical mutation follows from this report.

**Exact scope:**
- `runtime_artifact.api_web_call`
- `runtime_artifact.artifact_version`
- `runtime_artifact.before_after_snapshot`
- `runtime_artifact.browser_recording`
- `runtime_artifact.code_diff`
- `runtime_artifact.context_snapshot`
- `runtime_artifact.cost_usage`
- `runtime_artifact.document`
- `runtime_artifact.evidence`
- `runtime_artifact.failed_attempts`
- `runtime_artifact.hitl_approval`
- `runtime_artifact.implementation_plan`
- `runtime_artifact.reasoning_summary`
- `runtime_artifact.restore_point`
- `runtime_artifact.screenshot`
- `runtime_artifact.subagent_lineage`
- `runtime_artifact.suggested_next_steps`
- `runtime_artifact.tool_llm_trace`
- `runtime_artifact.validation_test`

Structured citations and the exact 19-schema inventory capture/hash appear in each affected row. All remaining technical bindings, payload bounds, replay, custody and oracle work remain required after a genuine retention decision.
