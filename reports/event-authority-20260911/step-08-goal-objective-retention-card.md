# Keep Goal text and its history with the thread

**Decision ID:** EA-S08-GOAL-OBJECTIVE-RETENTION  
**Status:** Approved: retain with the chat; recorded in DL-047. Concrete owner contracts pending.
**Owners:** Goal Runtime and Storage.

**Question:** Should the exact accepted Goal objective and its revision history remain available while its thread is retained, then follow the existing deletion and hold rules when that thread is deleted?

**Why it came up:** Plans require the exact Goal text and accepted revisions to survive context compaction, restart and model changes. They do not yet say how long that separate text remains after thread deletion. Permanent content-free audit records and the older Goal lineage record do not settle that choice. The policy below is a proposal, not an inferred current rule.

**What you would get:** Keeping the thread, including archiving it, would keep its Goal text and accepted revisions available to authorized history and recovery. Context compaction only changes the working context; it would not delete this history. On thread deletion, the Goal text and history would be hidden immediately, active stored content would be purged within 24 hours unless held, and deleted bytes in backups would remain for at most 30 days unless held. A valid hold can delay physical purge but cannot make the deleted content ordinarily visible again. Permanent content-free audit records would keep their existing facts and references without creating an extra hold on the Goal text or reconstructing it after deletion.

**Scope:** This covers `GoalRecordV2`, its current accepted objective, accepted objective revisions, and the minimum replay lineage needed to read that history. Goal Runtime owns their meaning; Storage owns the explicit retention assignment, deletion, holds and recovery. Separate content-free audit or lineage records keep their own existing policies. Attachments, source messages and context, Plan artifacts, To-Dos, workflow records and workflow evidence keep their own owners and retention rules; this choice does not retain their bodies merely because a Goal references them.

**What it costs:** Every accepted objective version takes storage for as long as the thread is retained, and older versions remain readable even after replacement. Deleting the thread would also make its Goal text and history unavailable, subject to existing protected recovery/hold rules. Goal Runtime and Storage must track the exact body/history records separately from permanent audit metadata and apply deletion consistently to active storage, backups and recovered views.

**Options:**

- **Retain with the thread — recommended.** Keep the exact accepted objective and revisions while the thread is retained. Thread deletion applies the existing hide, purge, backup and valid-hold rules. Permanent audit references add no extra body hold.
- **Retain until Project data deletion, independently of the thread.** Deleting the original thread would leave the separately retained Goal objective and revision history readable through an authorized Goal history view until the Project's data is deleted, subject to existing holds. This explicitly continues Goal history after thread deletion. It retains more content for longer and requires clear deletion wording and separate Goal history access; it would not restore the deleted thread, source messages or attachments. Removing a Project from the list would not count as Project data deletion.
- **Choose a different policy.** State the desired retention or deletion boundary using **Deny with changes**. No arbitrary time-based expiry is proposed.

**Recommendation:** Retain the accepted Goal objective and revision history with its thread. This preserves exact recovery through context compaction and restart while keeping thread deletion a clear boundary for the associated Goal text.

**Response choices:** Approve; Deny; Deny with changes; Ask a question.

**Actual response:** Approve: retain with the chat (recommended)

**Responded by:** Jared

**Response recorded at UTC:** 2026-09-11T23:46:02Z

**Source response ID:** EA-S08-GOAL-OBJECTIVE-RETENTION-RESPONSE-001

The recorded approval selects this bounded product retention policy and authorizes the corresponding owner contract work. It would not change unrelated record policies, decide certification exceptions, revive retired Goal fields or roles, admit sibling events, authorize runtime execution, clear readiness or seal governance. No answer is inferred from either draft or from prior technical-work approval.
