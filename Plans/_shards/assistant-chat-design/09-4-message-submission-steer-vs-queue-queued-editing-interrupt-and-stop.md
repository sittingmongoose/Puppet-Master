## 4. Message submission (Steer vs Queue), queued editing, interrupt, and stop

This section defines the canonical contract for this surface.

Core rules:
- Message controls are locked to most-recent-user scope, queued-message FIFO semantics, explicit rewind/discard behavior, always-visible code-block copy, mandatory subagent disclosure, and transient queue state that is not restored across reload or restart.

Rules:
- Stop/Edit/Resend attach ONLY to most recent user-sent message
- discards all later history/work
- FIFO, max 2 queued messages
- Stop does NOT clear the queue
- always-visible copy affordance on fenced code blocks
- queue state is transient and is not restored across reload or restart
- Stop becomes disabled when a run completes and no next message is queued
- Edit restores content into composer and discards later history/work
- Resend retries the most recent message and discards later history/work
