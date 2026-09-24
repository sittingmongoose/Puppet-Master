# Product questions from the Step 8(a) depth grading, 2026-09-24

Status: **QUEUED_UNANSWERED**. These four cards (the first in two parts) are prepared for the coordinator to present to Jared in his card form. They come out of the 42-family depth assessment (`step-08-depth42-assessment-20260924.md`). None is answered here, and nothing already recorded in DL-035, DL-036 or DL-039 onward is asked again.

The two Goal event families that Goal V2 already requires by name, `goal.blocked` and `goal.completed`, are not on a card. Their current contracts are owner work, not a product choice.

---

## Card 1a: three old Goal record events

Card ID: `EA-S08D-GOAL-RECORD-EVENTS-001`. Owner: Goal Runtime, with Contracts and Storage. Families: `goal.evidence_captured`, `goal.receipt_recorded`, `goal.tool_check_recorded`.

**Name:** The old Goal events for evidence, receipts and tool checks.

**Question:** Should these three registered Goal events become read-only history, like the four Goal events retired on 2026-09-12, or should each be rewritten as a current event under the owner that now does that work?

**Why:** Goal V2 (the text-first Goal) moved evidence, tool checks and certification receipts out of the Goal and into the Workflow or run that does the work. These three events were registered before that change. Their payloads still assume the old Goal and their contracts cite superseded units, and no current rule says whether they are still written. Four sibling events (`goal.progressed`, `goal.replanned`, `goal.stopped`, `goal.verification_decided`) were already given read-only historical status. These three were not.

**What you get:**
- **Read-only history:** one consistent rule. Old records stay readable. Nothing writes these events any more, and the work they described stays recorded by its current owner (the Workflow's own evidence, the run's tool checks, and the Standard certification receipt).
- **Rewriting:** each event keeps a live, replayable stream, under the owner that does the work today.

**What it costs:**
- **Read-only history:** no separate Goal-level stream of these three facts. Anyone who wants them reads the owning Workflow or run records.
- **Rewriting:** three new full event contracts (payload, producer, consumers, custody and tests), each of which has to fit Goal V2, plus a separate owner decision for the tool-check event, which would move to the run or tool owner.

**Options:**
1. **Read-only history for all three (recommended).** The same pattern as the four already retired: current writes are refused and a historical reader keeps old records readable.
2. **Rewrite all three as current events** under their current owners.
3. **Decide one by one.** Say which event goes which way.

**Recommendation:** Option 1. It matches where Goal V2 already put this work and follows the precedent Jared already accepted for four sibling events.

**Answer:** ____________________

---

## Card 1b: when a Workflow run blocks, replans or stops

Card ID: `EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001`. Owner: Orchestrator and Executor (Workflow run lifecycle), with Goal Runtime and Storage. Families: `goal_run.blocked`, `goal_run.replanned`, `goal_run.stopped`.

**Name:** Run history events for blocked, replanned and stopped runs.

**Question:** Should Workflow runs publish a current event when they become blocked, are replanned or are stopped, as they already do when they start, are cancelled or are certified?

**Why:** The Workflow run lifecycle is live in current canon, and started, cancelled and certified each have full current event contracts. These three states do not. Canon points both ways:
- **For current events:** the Pause and Abort Run commands and their production wiring expect `goal_run.stopped`, and the rule for resuming a blocked or stopped run depends on `goal_run.replanned`. A 2026-09-21 review also found that the existing Workflow rules already carry Replan.
- **Against:** the Workflow writer list names no writer for these three, and the one run-history projection that must stay complete stops at their rows.

So today nothing can write them, and the projection cannot pass one.

**What you get:**
- **Current events:** a complete run history, in which a person or an agent can see when and why a run was blocked, replanned or paused. The resume rule and the Pause and Abort wiring keep working as specified.
- **Read-only history:** a smaller product. Runs still block, replan and stop, but those moments are visible only in the run's own records, not as events.

**What it costs:**
- **Current events:** three new full contracts. The replanned one is large, because it depends on the Workflow Replan source work that is still unfinished (the external "Replan v8" package).
- **Read-only history:** the Pause and Abort wiring, the command catalog rows and the resume rule must all be rewritten so they no longer expect these events. The run history also shows fewer steps.

**Options:**
1. **Current events for all three (recommended).** Build stopped and blocked first, then replanned once the Replan source work is done.
2. **Read-only history for all three.** Rewrite the wiring and the resume rule to match.
3. **Mixed.** For example, current `goal_run.stopped` (Pause and Abort) with the other two read-only. Say which.

**Recommendation:** Option 1. It keeps behavior canon already specifies and the commands already wire, and it gives a complete, readable run history. The cost is mostly the replanned contract, which can come last.

**Answer:** ____________________

---

## Card 2: finishing a run with an approved verification exception

Card ID: `EA-S08D-VERIFICATION-EXCEPTION-001`. Owner: Goal Runtime and the Workflow certification owner, with Human-in-the-loop approvals.

**Name:** Completing a Workflow when a check is knowingly waived.

**Question:** When a Workflow's final verification finds a gap that a person has approved as an accepted risk, may the run still finish as "completed with an approved verification exception", and if so, who approves the exception?

**Why:** The Workflow rules have always had two truthful endings: "certified", and "certified with an approved exception", shown as "completed with approved verification exception". The 2026-09-12 certification contract built only the first route. It keeps the exception meaning but states that "the exact original exception/waiver owner route remains separately unbound". Without a route, a run that cannot clear one check stays unfinished until someone cancels it.

**What you get:**
- **Keeping the exception route:** a run can finish honestly when a known gap is accepted. The finish is labelled as an exception, with the approver and the remaining risks recorded, never shown as a clean pass.
- **Removing it:** a single, stricter meaning of "finished".

**What it costs:**
- **Keeping it:** one more contract (the approval request, who may approve, which risks may be waived, and the receipt), and the risk that exceptions get approved too easily.
- **Removing it:** runs with a check that cannot pass stay blocked until they are cancelled. The existing exception label and its semantics are retired.

**Options:**
1. **Keep the exception route (recommended).** The user who owns the project approves each exception through the existing approval (human-in-the-loop) flow, naming the specific residual risks, and the finish is labelled "completed with approved verification exception".
2. **Remove the exception route.** A run either certifies cleanly or does not finish.
3. **Another rule.** For example, exceptions allowed only for particular checks, or a different approver.

**Recommendation:** Option 1. It keeps the truthful labels canon already defines and avoids runs getting stuck on a known, accepted gap. The approval stays with the person who owns the project.

**Answer:** ____________________

---

## Card 3: the first entry in the platform capability catalog

Card ID: `EA-S08D-PLATFORM-CATALOG-001`. Owner: Platform Capability Manager (Orchestrator), with Models and Storage. Family: `platform.capability_evaluated`.

**Name:** Whether any platform capability is checked at run start yet.

**Question:** The platform capability catalog is empty, so no capability is evaluated at run start and the registered `platform.capability_evaluated` event never occurs. Should the owner add entries now for the provider features that already shape subagent behavior, or keep the catalog empty until a specific feature needs a capability check?

**Why:** Canon specifies a run-start capability snapshot (for example Cursor skills, Claude plugins, Gemini extensions, Codex MCP and Copilot skills in the Platform Capability Manager). It also allows only owner-cited catalog entries, forbids placeholders, and says "the active catalog is empty: all production admission attempts currently refuse, and no Platform event is emitted". The event's contract is otherwise nearly complete (11 of 12 criteria). Whether it ever fires depends on the catalog.

**What you get:**
- **Adding entries:** run-start snapshots that gate provider-specific features, recorded as replayable events.
- **Keeping it empty:** no new work. Nothing depends on the snapshot today.

**What it costs:**
- **Adding entries:** each needs owner-cited evidence (the live discovery, provider policy or static baseline source), an evaluation contract and tests, plus a decision about which features each entry gates.
- **Keeping it empty:** the registered event stays dormant, and features that could vary by provider have no recorded capability check.

**Options:**
1. **Keep the catalog empty until a feature needs a capability check (recommended).** The event family stays registered and ready.
2. **Add entries now** for the provider features named in the Platform Capability Manager.
3. **Add specific entries.** Say which.

**Recommendation:** Option 1. No current feature is waiting on a capability gate, and each entry needs its own cited evidence. The first feature that needs one can bring its entry.

**Answer:** ____________________

---

## Card 4: the record cap for application-wide Storage events

Card ID: `EA-S08D-OPERATIONAL-CARDINALITY-001`. Owner: Storage retention. Families: `storage.boot_recovery`, `storage.recovery_applied`, `storage.compaction_lifecycle_changed`.

**Name:** How the seven-year operational record cap counts events that belong to no project.

**Question:** The seven-year operational retention policy caps records at 2,000,000 per project. How should that cap count Storage events that belong to the whole application rather than to a project?

**Why:** Boot recovery, recovery-applied and compaction-lifecycle events are application-wide. They carry no project. The policy they use (`RP-OPERATIONAL-2555D`: seven years, 2,000,000 records, per-project counting, fail-closed overflow) counts only per project. Storage's own text calls application-scoped counting under that policy "an unproved policy-owner adapter seam" and says no invented project, new bucket, cap or policy value may resolve it. Retention choices are Jared's (DL-045).

**What you get:**
- **One application-wide bucket:** the same guard for application events as for project events, with the same numbers.
- **No cap for them:** simpler rules.
- **A separate policy:** limits tuned to application events.

**What it costs:**
- **One application-wide bucket:** in the extremely unlikely case of more than 2,000,000 such events within seven years, new ones are refused (fail closed), exactly as for a project.
- **No cap:** there is no count guard at all for these events.
- **A separate policy:** one more policy object to own and test.

**Options:**
1. **Count them in one application-wide bucket with the same cap and overflow rule (recommended).**
2. **Apply no count cap to application-wide records;** the seven-year limit still applies.
3. **Give them their own new policy.** Say the limits.

**Recommendation:** Option 1. It closes the gap with the numbers already approved and changes no project behavior.

**Answer:** ____________________

---

Evidence for every card is the row of the named families in `step-08-depth42-assessment-20260924.json` (its findings and `remaining_gaps`), with the cited owner lines. The full quoted text is in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-08-depth42-20260924/compiled_rows.json`. These cards admit, retire and change nothing until answered and applied.
