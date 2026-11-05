# Product question: how long a silent agent waits before it counts as crashed, 2026-09-25

Status: **QUEUED_UNANSWERED**. One card, presented to Jared in his card form. It came out of the blind review of the coordination contracts (finding CP-05). Nothing is changed until you answer.

---

## Card: how long a silent agent waits before it counts as crashed

Card ID: `EA-S09B2-HEARTBEAT-EXPIRY-001`. Owner: Orchestrator runtime policy, with Storage. Family: `coordination.agent_crashed` (its heartbeat-expiry case).

**Name:** How long an agent can go silent before it counts as crashed.

**Question:** When an agent that is working alongside others stops sending its heartbeat but its process has not exited, how long should Puppet Master wait before recording it as crashed?

**Why:**
- Agents working in parallel send a heartbeat every 30 seconds. An agent whose process exits, or whose working folder disappears, is recorded as crashed right away, whatever you choose here.
- An agent that hangs without exiting is caught only by its missing heartbeats. The orchestrator's text gives "e.g., 5 minutes" as an example and says the actual number belongs to runtime policy. No value has been set.
- Until there is a value, a hung agent is never recorded as crashed. The files it said it was working on stay claimed, and its work is not handed back.
- Choosing the number is a runtime policy choice, so it is yours.

**What you get:**
- **Five minutes:** a hung agent is released about five minutes after its last heartbeat, after ten missed heartbeats in a row.
- **Two minutes:** faster recovery, after four missed heartbeats.
- **Ten minutes:** fewer live agents recorded as crashed when the computer is briefly overloaded.

**What it costs:**
- **Five minutes:** a hung agent holds its claimed files for up to five minutes.
- **Two minutes:** an agent on a busy computer is more likely to be recorded as crashed while it is still working, and its work is stopped.
- **Ten minutes:** a hung agent holds its claimed files twice as long.
- **Any choice:** how a computer that was asleep is handled is technical work and not part of this question.

**Options:**
1. **Five minutes (recommended).** The example the orchestrator already gives.
2. **Two minutes.**
3. **Ten minutes.**

**Recommendation:** Option 1. Ten missed heartbeats is a clear signal, exits are caught at once anyway, and it is the value the orchestrator's text already suggests.

**Owner edits if approved:** the Orchestrator runtime policy named in OSI-438 records `coordination_heartbeat_expiry_ms` as 300000 (option 1), 120000 (option 2) or 600000 (option 3); SP-320 cites it, and the `heartbeat_expired` crash reason becomes active. It lands before or with the `coordination.agent_crashed` admission.

**Answer:** ____________________

---

This card admits and changes nothing until it is answered and applied. Evidence: `Plans/orchestrator-subagent-integration.md` Gap #30 (heartbeat, stale prune and crash detection, around lines 4934 to 4944) and the claim-expiry rule (around line 5131) at `cd46487bf0`; the review finding CP-05 in `/mnt/Cursor/PM-Experiments/review-ea-s09-coordination-prep-20260925/findings.jsonl`.
