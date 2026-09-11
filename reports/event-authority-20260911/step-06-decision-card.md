# Decision EA-S6-001 — Compaction completion history and retention

Status: approved by Jared on 2026-09-11 at 15:26:49.325818 UTC; owner contract application remains outstanding. Owners: Assistant Chat and Storage, with Shared Integration Runtime for replay.

**Question:** Should the owners connect saved compaction completions to the existing focused-thread detail and replay path, and keep content-free completion receipts as permanent audit records?

**Why it came up:** DL-039 already says successful context compaction must be persisted. The Plans have a focused-thread detail projection and shared replay/checkpoint machinery, but do not bind this particular event to them. They also distinguish chat content kept while its thread exists from audit receipts kept indefinitely. The completion event’s exact binding and retention policy are still missing.

**What you would get:** The owners would explicitly define and version the event’s consumer and checkpoint contracts using the existing focused-thread detail/replay path. A successful, committed compaction would leave a small record of completion and its receipt references, with no transcript or summary body in the event. The proposed permanent audit record would preserve the fact of completion; it would not retain deleted conversation content or permit replay to recreate that content. The owners would specify the deletion and reference behavior before admission. This approval would authorize creation of the missing contracts; it would not certify that those bindings already exist.

**What it costs:** Permanent completion metadata accumulates and survives thread deletion. The owners must define and verify the exact identities, payload, replay/checkpoint behavior, deletion interactions, and retention binding before registering the family. The existing frozen-validator conflict remains a separate governance blocker.

**Options:**

- **Permanent audit receipt — recommended:** Keep the bounded, content-free completion record indefinitely, with conversation content governed separately. This matches its role as evidence that a compaction transaction committed and aligns with the existing audit-receipt retention policy.
- **Thread-lifetime completion history:** Keep completion records only while their thread exists, following the existing chat-content rule and linked-successor roll at 250,000 events per thread. The owners would need an explicit structured retention policy and deletion semantics for this event; the record would not provide permanent completion evidence after thread deletion.

**Recommendation:** Approve the permanent audit receipt proposal and the explicit focused-thread/replay binding. Use **Deny with changes** to select thread-lifetime retention or alter the proposed behavior. Neither option changes the already-approved decision to persist successful completion. Started and failed event families remain unregistered.

**Response choices:** Approve; Deny; Deny with changes; Ask a question.

**Answer:** Approve.

**Clarification before approval:** Jared asked, “Does that have an impact on the assistant chat being able to search through thread history?” The answer preserved the existing requirements: retained history remains searchable by agents after compaction, compaction does not rewrite the canonical transcript, and permanent completion metadata does not retain or reconstruct deleted conversation content. The same proposal was re-presented and approved. Exact response chronology is recorded in [decision responses](decision-responses.jsonl).

Approval authorizes owner planning and contract work only. It grants no runtime, WorkNodes, validator modification, or governance seal.

Sources: `Plans/Decision_Log.md` DL-036 and DL-039; `Plans/Prompt_Pipeline.md` bounded transactional compaction; `Plans/storage_value_registry.json` existing `thread_detail_projection`, `replay_snapshot_checkpoint`, and audit-retention policy; `Plans/storage-plan.md` Case L-3. Exact evidence paths and SHA-256 digests are in the accompanying Step 6 blocked receipt.
