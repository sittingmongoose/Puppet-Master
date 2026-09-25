# Remaining boundary decision cards — 2026-09-25

Status: queued, unanswered.

These cards do not reopen earlier answers. Approve selects the recommendation; Deny leaves it unapproved; Deny with changes must state the change; Ask leaves the question open. No draft selection is an answer.

## Assistant Chat — Card 1 (PCC-DICTIONARY-BOUNDARY-001)

**Name:** Which installations may share your personal words

**Question:** Should personal words be shared only between installations you explicitly link as belonging to you?

**Why it came up:** Your dictionary decision chose same-user sharing but left its boundary open. Assistant Chat separates personal and Project dictionaries; Server pairing proves device trust, not that two devices belong to one person.

**What you get:** You choose which of your installations may share personal words; using the same Server never automatically shares them.

**What it costs:** Explicit linking needs setup and secure ownership checks. A new sign-in identity needs additional account design. Deferring keeps sharing disabled.

**Options:**

- Recommended — Explicitly link your installations, with secure ownership proof before sharing is enabled.
- Define a Puppet Master user sign-in identity first and share within that identity.
- Defer this boundary; sharing stays disabled.

**Recommendation:** Explicit linking preserves your same-user choice without treating a shared Server as one person or requiring a new account. This does not choose a synchronization protocol or enable sharing yet.

**Answer:**

Sources: Plans/Decision_Log.md#DL-094; Plans/assistant-chat-design.md, “Passive Spelling And Dictionary Routing”; Plans/Server_System.md#SRV-002.

## Server System — Card 2 (PCC-SERVER-ENVIRONMENT-001)

**Name:** One Server connection across your environments

**Question:** Should you connect once to a Server and use its permitted execution environments through that session, with each environment showing its own availability?

**Why it came up:** Server System defines one connection and reconnect story per Client–Server relation. Shared Integration Runtime separately manages each environment's connection, but the owners leave the relationship between them undefined.

**What you get:** One Server login/session, while an individual environment can be offline or reconnecting without pretending the others are unavailable or online.

**What it costs:** One session needs an exact, permission-checked connection to each environment. Separate sessions need more connection controls and change today's Server login/reconnect behavior.

**Options:**

- Recommended — One Server session, with separately checked access and availability for each environment.
- Separate connections and sessions for each environment, even on the same Server.
- Defer this connection-scope choice.

**Recommendation:** One Server session best preserves the existing connection command. Connecting grants no environment access by itself; existing permissions and identities remain distinct, and no second connection manager is added.

**Answer:**

Sources: Plans/Server_System.md §3.2 and SRV-005; Plans/Shared_Integration_Runtime.md §5 and SIR-004; reviewed client-server-environment-01 proposal.

## Source Control — Card 3 (PCC-SCM-CLOSURE-AUTH-001)

**Name:** Finish the remaining Source Control specification connections

**Question:** May I complete the remaining six actions' request-to-result connections and run up to two bounded review cycles without reopening their approved core behavior?

**Why it came up:** Source Control still needs complete connections between the original request, the actual result, and the calling interface. The prior targeted repair passed its tests but explicitly capped further work; it did not complete these connections.

**What you get:** The remaining specification connections and tests can be finished and independently checked, rather than counted as complete from narrower tests.

**What it costs:** Approval adds contract work and at most two review cycles. Keeping the cap leaves this part of packet closure unfinished. Unresolved findings after the cap return to you; they do not start another silent loop.

**Options:**

- Recommended — Finish the missing connections with up to two review cycles, preserving approved behavior.
- Keep the existing cap and leave these connections explicitly unresolved.

**Recommendation:** Approve the bounded follow-up. It completes existing specification work; it does not authorize a new feature, native implementation, governance reseal, or changes to reviewed core semantics.

**Answer:**

Sources: Plans/Source_Control_System.md#SCS-003; scm-selected-operands-20260925-LN2w1A/ADDITIONAL-CYCLE-HANDOFF.md and ADDITIONAL-CYCLE-INDEPENDENT-REVIEW.md; reports/packet-canon-closure-20260924/decisions-and-handoff.md.

## Your answers, ready to paste

Card 1 (PCC-DICTIONARY-BOUNDARY-001):

Card 2 (PCC-SERVER-ENVIRONMENT-001):

Card 3 (PCC-SCM-CLOSURE-AUTH-001):
