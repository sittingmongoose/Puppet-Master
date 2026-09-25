# Server connection clarification — 2026-09-25

Status: queued, unanswered.

This answers the question on the earlier Server card and re-presents that choice in your terms. It does not change either frozen card file.

## Server System — Card 1 (PCC-SERVER-ENVIRONMENT-002)

**Name:** Connect to a Server and use its Projects

**Question:** Should each Client connect to a Server to see its Projects or create new ones, with multiple Clients able to use the same Server and Project at once?

**Why it came up:** You asked whether Server and environment mean the same thing. Server System owns Projects and Client connections; Shared Integration Runtime uses environment for the exact place work runs, such as native execution or a container.

**What you get:** The Server-level experience you described. Each Client has its own connection; you do not make a separate environment connection just to browse or create Projects. Existing access permissions still apply.

**What it costs:** This needs multi-Client reconnect and consistency tests plus the internal connection mapping. A different user-facing flow needs more design. Deferring leaves that mapping unresolved.

**Options:**

- Recommended — Use this Server-level flow, preserving distinct internal execution identities.
- Describe a different connection flow.
- Defer the connection choice.

**Recommendation:** Use the Server-level flow. Internal execution details should not introduce another connection step for these Project actions or one shared session across all Clients.

**Answer:**

Sources: Plans/Decision_Log.md#DL-100; Plans/Server_System.md, opening authority, SRV-005, SRV-006 and §3.2; Plans/Shared_Integration_Runtime.md §§2–3 and §5.

## Your answers, ready to paste

Card 1 (PCC-SERVER-ENVIRONMENT-002):
