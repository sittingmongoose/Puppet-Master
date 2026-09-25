# Product questions for Step 9 batch 2: the orchestrator's stored events, 2026-09-25

Status: **QUEUED_UNANSWERED**. Revised after the blind check of 2026-09-25 (`FIXES.md`). These five cards are presented to Jared in his card form. Nothing is answered, registered, retired or changed here. No question already answered in the Decision Log is asked again.

They cover the 40 stored but unregistered events owned by the orchestrator document (Step 9 batch 2):

| Card | Rows |
|---|---|
| Card 1: how long child-run history is kept | 19 |
| Card 2: whether crew board messages are kept or deleted after 24 hours | 3 |
| Card 3: how long three orchestrator diagnostics are kept | 3 |
| Card 4: which history records a Crew run | 6 |
| Card 5: a separate record for a request to start a subagent | 2 |
| No card: coordination records | 7 |

The seven coordination rows need no card: the owner documents already say where they are stored, what they carry and how long they are kept (180 days after the run finishes), so only technical contract work is left.

The technical companion (`cards-technical-companion-v2.md`) lists the exact rows, the canon quotes, the prior decisions checked and the owner edits for each card.

---

## Card 1: how long child-run history is kept

Card ID: `EA-S09B2-CHILDRUN-RETENTION-001`. Owner: Orchestrator, with Contracts and Storage. Families: `subagent.spawned`, `subagent.started`, `subagent.completed`, `subagent.failed`, `subagent.cancelled`, `subagent.timeout`, `subagent.paused`, `subagent.resumed`, `subagent.progress`, `subagent.tool_called`, `subagent.tool_completed`, `subagent.message_sent`, `subagent.message_received`, `subagent.output_truncated`, `subagent.retried`, `subagent.context_warning`, `subagent.model_switched`, `subagent.budget_warning`, `subagent.escalated`.

**Name:** How long a subagent's history is kept.

**Question:** How long should the history of each subagent run (its start, progress, tool use, messages, warnings, retries and how it ended) be kept?

**Why:**
- Every subagent is a child run. Storage also keeps a task record of its settings and outcome, and a permanent record of which run started it, but its step-by-step history is recorded only as these events.
- Canon says this history lives "in thread history", and that finished subagents "remain in history".
- Storage already has two rules that fit. Run history is kept for one year after the run finishes. Chat content is kept as long as the chat exists. The second is also the rule you chose on 11 September for Goal text, which is kept with its chat.
- On 23 September you decided that a task-failure card in chat is only a notice that points at this child-run history, and that the decision does not allow deleting history. The lifetime chosen here decides how long those cards can still open their details.
- Retention is your choice. No earlier answer covers these events.

**What you get:**
- **As long as the chat exists:** an old chat still opens every subagent's full history, and failure cards always have their details. Deleting the chat removes this history too, within 24 hours unless it is on hold, like the chat's own messages.
- **One year after the run finishes:** the same lifetime as the parent run's own history, and storage that stays bounded.
- **Split:** how each subagent started, ended, retried and warned stays with the chat; the step-by-step activity (progress, tool calls, message previews) goes after one year.
- **Forever:** nothing is ever lost, even after the chat is deleted.

**What it costs:**
- **As long as the chat exists:** busy chats keep growing. Storage still has to say whether a very busy chat has no count limit, as for Goal text, or rolls into a linked continuation after 250,000 records, as chat messages do. Prompt previews, message previews and error text are kept as long as the chat. A subagent's history can outlive its parent run's history, which ends after one year.
- **One year after the run finishes:** in chats older than a year, subagent and failure cards still show, but their details are gone, and each card has to say so. Deleting a chat within the year does not remove this history unless each contract adds that rule.
- **Split:** two rules to build and explain. After a year an old chat shows how each subagent ended, but not what it did along the way.
- **Forever:** storage grows without end, and message and error text stays even after its chat is deleted, so each contract must say how deletion requests are handled.

The permanent record of which run started which subagent is already set to be kept forever by your 23 September answer on runtime artifacts, whichever option you choose.

**Options:**
1. **Keep it as long as the chat exists (recommended).** The same lifetime as Goal text and chat messages.
2. **Keep it for one year after the run finishes.** The same rule as the parent run's history.
3. **Split.** How each subagent started, ended, retried and warned stays with the chat. Its progress, tool calls, message previews and output-cut notices are kept one year after the run finishes.
4. **Keep it forever.**

**Recommendation:** Option 1. Canon shows this history in the chat's history, and it keeps failure cards and their details together for as long as the chat exists, using a lifetime you have already approved.

**Owner edits if approved:** Storage retention table (Case L-3) and the 19 family contracts bind `RP-GOAL-THREAD-LIFETIME` (option 1), `RP-RUNTIME-365D` (option 2), both by family group (option 3) or `RP-AUTHORITY-INDEFINITE` (option 4); CV-267 to CV-269 and the orchestrator child-run section cite the answer.

**Answer:** ____________________

---

## Card 2: whether crew board messages are kept or deleted after 24 hours

Card ID: `EA-S09B2-BOARD-RETENTION-001`. Owner: Orchestrator, with Storage. Families: `crew.board_message_posted`, `crew.board_message_read`, `crew.board_messages_archived`.

**Name:** Whether messages on the agents' shared board are kept or deleted once they leave the board.

**Question:** After the crew board hides a message at 24 hours, should the stored message be kept with the run's other coordination records or deleted?

**Why:**
- The crew board is where agents working together leave each other messages: questions, blockers, handoffs. Crew, BrainStorm and the orchestrator's parallel work all use it.
- The orchestrator already says stale messages leave the board after 24 hours, while unresolved blockers stay visible until they are resolved. Its text says those messages are "archived or deleted", and never says which.
- Storage never edits stored history in place. A stored record goes away only when its retention period ends or an explicit deletion, such as deleting the project's data, removes it. So "deleted after 24 hours" needs its own short retention rule.
- Canon already places the board in the same coordination record as agent sign-in, status and file claims, which are kept 180 days after the run finishes. Whether a message is deleted when it leaves the board is your choice.

**What you get:**
- **Hidden after 24 hours, kept with the other coordination records:** one rule for all coordination records. For up to six months you can still see what the agents told each other and why.
- **Deleted after 24 hours:** the least stored message text.

**What it costs:**
- **Kept with the other coordination records:** after six months the board conversation behind a run is gone, even if the chat is still there. Message subjects and text are kept for that time. A project keeps at most 1,000,000 coordination records; past that the oldest are dropped first, so a very busy project can lose board messages before 180 days.
- **Deleted after 24 hours:** a new retention rule. The next day nobody can see what the agents said to each other. It also sits badly with the accepted rule that board messages are stored as part of shared crew state.

**Options:**
1. **Hide after 24 hours and keep it with the other coordination records, 180 days after the run finishes (recommended).**
2. **Delete after 24 hours.** Unresolved blockers stay until they are resolved.

**Recommendation:** Option 1. The board is part of the run's coordination record, so it should last as long as the rest of that record, and this uses a rule already in place.

**Owner edits if approved:** orchestrator board lifecycle ("archived or deleted" becomes the chosen wording); Storage coordination family and retention table bind `RP-COORDINATION-180D` (option 1) or a new short policy (option 2); Contracts board rows.

**Answer:** ____________________

---

## Card 3: how long three orchestrator diagnostics are kept

Card ID: `EA-S09B2-DIAGNOSTIC-RETENTION-001`. Owner: Orchestrator, with Storage. Families: `phase.force_completed`, `config.validation.failed`, `parser.error`.

**Name:** How long three orchestrator diagnostic records are kept.

**Question:** How long should these three diagnostic records be kept: an interview phase closed early because it hit its question limit, a configuration check that failed when a run or work unit started, and agent output that could not be read?

**Why:**
- The orchestrator requires all three to be written to stored history. It says nothing about how long they stay.
- Each explains why part of a run ended the way it did. The unreadable-output record carries at least the first 500 characters of the agent's raw output; the same passage also says all raw output is kept, which the owner still has to reconcile.
- Storage has three rules that could apply. Run history is kept one year after the run finishes. Debug records are kept 30 days. Security diagnostics that are not approval or audit records, and migration and recovery history, are kept seven years; the platform capability check also uses that rule. None of these three records is a security diagnostic. Retention is your choice.

**What you get:**
- **One year:** the explanation lasts as long as the run it explains.
- **30 days:** the least stored raw output.
- **Seven years:** a long record for support and audits.
- **Split:** raw output goes quickly, and the two records that explain a run's outcome last as long as the run.

**What it costs:**
- **One year:** raw agent output from each unreadable reply, at least its first 500 characters, is kept for a year.
- **30 days:** after a month, an old run no longer shows why its interview phase closed or why its start was refused, although the run itself is still kept. Each project keeps at most 10,000 of these, a limit that may be shared with the project's other debug records, and the oldest are dropped first.
- **Seven years:** raw output is kept seven years. Past 2,000,000 per project, new records are refused.
- **Split:** two rules for one small group of records.

**Options:**
1. **One year after the run finishes (recommended).**
2. **30 days after the record is written.**
3. **Seven years.**
4. **Split.** Unreadable-output records for 30 days, the other two for one year after the run finishes.

**Recommendation:** Option 1. These records explain a run's outcome, so they should last as long as that run's history, using a rule already in place.

**Owner edits if approved:** Storage retention table and the three family contracts bind `RP-RUNTIME-365D` (option 1), `RP-DEBUG-30D` (option 2), `RP-OPERATIONAL-2555D` (option 3), or `RP-DEBUG-30D` for `parser.error` and `RP-RUNTIME-365D` for the other two (option 4).

**Answer:** ____________________

---

## Card 4: which history records a Crew run

Card ID: `EA-S09B2-CREW-HISTORY-001`. Owner: Collaborative Workflows and Contracts, with Orchestrator and Storage. Families: `crew.formed`, `crew.member_added`, `crew.member_removed`, `crew.coordination`, `crew.completed`, `crew.disbanded`.

**Name:** The six older Crew events.

**Question:** Should the six older Crew events be retired, so that a Crew run is recorded only by the history shared by all collaborative workflows, or kept as a second Crew history, now or until the shared events are registered?

**Why:**
- Crew is one of four collaborative workflows, with BrainStorm, Review and Chat Room. The Collaborative Workflows document is the only owner of their shared run: its identity, its lifecycle, its participants and its transcript. It says anything specific to one kind attaches to that one run and "never create[s] a second run identity".
- The six older events (crew formed, member added, member removed, coordination, completed, disbanded) come from a Contracts table and give Crew its own separate identity. Nothing writes them today. The orchestrator does not describe them, and says a Crew's lifecycle follows the ordinary rules for child runs.
- A Crew's members are fixed when the run starts, so "member added" and "member removed" describe something Crew does not do. "Coordination" has fields but no defined meaning, and the shared transcript already records the messages.
- The six events are listed in accepted Contracts text, so retiring them is a Contracts edit.
- The three crew board events are not part of this question (Card 2).

**What you get:**
- **Retire:** one Crew history, as the collaborative workflow rules require, with no second lifecycle to keep in step. Each Crew member's own work is still recorded, because members are child runs (Card 1), and the board keeps their messages (Card 2).
- **Keep as a second history:** a registered Crew lifecycle history now, in this campaign.
- **Keep until the shared events are registered:** the same, but only for the interim.

**What it costs:**
- **Retire:** the shared collaborative workflow events are not registered yet, are outside this campaign, and may not be written until they are. Until a later registration, a Crew run has no registered record of its own start, finish or cancellation, only its members' histories and the board. Retiring also removes accepted Contracts text.
- **Keep as a second history:** two histories of the same run that must always agree, against the collaborative workflow rules. Six new full contracts for events nothing writes today, and the content of "coordination" and of membership changes would have to be defined from scratch.
- **Keep until the shared events are registered:** the full cost of keeping now, plus a later retirement and a reader for the old records.

**Options:**
1. **Retire all six (recommended).** A Crew run's lifecycle is recorded by the shared collaborative workflow events once they are registered.
2. **Keep all six as a second Crew history,** with a written boundary between the two histories. They are kept 180 days after the run finishes, like the other coordination records.
3. **Keep all six until the shared collaborative workflow events are registered, then make them read-only history.** Also kept 180 days after the run finishes.

**Recommendation:** Option 1. The collaborative workflow rules already say a Crew run has one identity and one lifecycle, and nothing writes these six events today. The gap until the shared events are registered is real, but members' histories and the board still record the work.

**Owner edits if approved:** option 1: Contracts removes the six rows, narrows CV-270 to the board events and retires CV-271 (accepted text); the orchestrator adds a pointer to Collaborative Workflows. Options 2 and 3: a boundary statement in Contracts and Collaborative Workflows, six full contracts, and retention `RP-COORDINATION-180D`.

**Answer:** ____________________

---

## Card 5: a separate record for a request to start a subagent

Card ID: `EA-S09B2-SPAWN-REQUEST-001`. Owner: Contracts and Orchestrator, with Run Modes. Families: `subagent.spawn_requested`, `subagent.spawn_completed`.

**Name:** Recording a request to start a subagent separately from the subagent itself.

**Question:** Should Puppet Master record a request to start a subagent separately from the subagent being created, or retire the two request names?

**Why:**
- Contracts keeps two names for a start request and its completion. Both names are in accepted Contracts text. The main rule uses them only "when a dispatcher distinguishes" a request from creating the child, and another passage calls them names a particular producer may use. No owner says Puppet Master's does. The two events have no defined content and nothing writes them.
- When a start has to wait, the child already exists, in the "queued" state, and chat shows it that way.
- Run Modes says "New crew spawn requests queue until a slot is free". Under current rules that wait shows as a queued child, not as a separate request record, so the sentence needs a clarifying line either way.
- A start refused for budget before any child exists already gets a reason in the orchestrator's outcome list.

**What you get:**
- **Retire:** one clear record of each subagent from the moment it exists, with no parallel request history.
- **Register:** a separate history of when a start was asked for, how long it waited for a slot, and whether it was refused before a child existed.
- **Leave reserved:** no work now. The names stay available for a future design.

**What it costs:**
- **Retire:** accepted Contracts text in two places is removed, and Run Modes gains one clarifying sentence.
- **Register:** this adds a feature. Nothing writes these events and they have no content, so the orchestrator needs a new request step, two full contracts and tests. The records are kept as long as you choose for subagent history in Card 1.
- **Leave reserved:** accepted text keeps naming events that nothing writes, and the question comes back when someone needs them.

**Options:**
1. **Retire both names (recommended).** A waiting start is a queued child. A refused start keeps its existing outcome reason.
2. **Register both as a new feature,** kept as long as Card 1's answer.
3. **Leave the names reserved but unregistered.** A future design that needs them brings its own card.

**Recommendation:** Option 1. A queued child already records the wait, and nothing today needs a separate request history.

**Owner edits if approved:** option 1: Contracts removes the two names from the lifecycle text, the envelope sentence and CV-116 and CV-266 (accepted text), and Run Modes clarifies the crew queue row. Option 2: new payload rows, a producer in the orchestrator dispatcher, two full contracts. Option 3: the two rows are excluded from this campaign with the text unchanged.

**Answer:** ____________________

---

These cards admit, retire and change nothing until they are answered and applied. Evidence: the evidence map `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step-09-batch2-evidence-map-20260925/evidence-map.md` as corrected by the five verification notes in `/mnt/Cursor/PM-Experiments/ea-step09-batch2-20260925/`, with every citation re-read at `9986aeabe5` in the technical companion, and the blind check's repairs applied as listed in `FIXES.md`.
