# Addendum to Card 4: registering the shared collaborative workflow events, 2026-09-25

Status: **QUEUED_UNANSWERED**. Your answer to Card 4 (`EA-S09B2-CREW-HISTORY-001`) was: "retire them but register the shared collaborative workflow events, so adding scope to this." Retiring the six older Crew events is recorded from your words. Registering the shared events adds scope that the presented card did not define, so these three cards define it. Nothing is registered or changed until you answer. Card 4b is a gap found while defining that scope, not something your answer asked for.

---

## Card 4a: which collaborative workflow events to register

Card ID: `EA-S09B2-COLLAB-EVENTS-001`. Owner: Collaborative Workflows, with Contracts and Storage. Families: `collaboration.created`, `collaboration.started`, `collaboration.paused`, `collaboration.resumed`, `collaboration.cancelled`, `collaboration.completed`, `collaboration.participant_started`, `collaboration.participant_completed`, `collaboration.message_added`, `collaboration.artifact_added`, `collaboration.configuration_changed` (option 2 adds `brainstorm.proposal_added`, `brainstorm.vote_added`, `brainstorm.plan_synthesized`, `review.finding_added`, `review.finding_dispositioned`, `review.artifact_finalized`).

**Name:** Which collaborative workflow events to register.

**Question:** Which collaborative workflow events should be registered?

**Why:**
- Crew, BrainStorm, Review and Chat Room are one shared runtime. Its document names 17 events. Eleven apply to every kind: a run created, started, paused, resumed, cancelled and completed; a participant started and completed; a message added; an artifact added; and a configuration changed.
- The other six belong to one kind only: three for BrainStorm (a proposal added, a vote added, a plan put together) and three for Review (a finding added, a finding decided, the review's result finalized).
- None of these events is registered. The document says none may be written until it is. None is among the 252 stored events this campaign works through.
- Your 11 September approval lets owners define missing technical parts, such as identity links, checkpoints, replay and recovery, only for the events it lists. These events are not on that list.
- Registering them also needs that same limited permission for their owners. Your answer did not mention it, so both options include it and say so. Without it, each missing technical part would come back to you as its own question.

**What you get:**
- **The 11 shared events:** every collaborative run of all four kinds has a recorded history of its lifecycle, its participants, its messages and its artifacts. A Crew run gets back a recorded start, finish and cancellation.
- **All 17:** the same, plus a recorded history of BrainStorm proposals, votes and plans and of Review findings and results.

**What it costs:**
- **The 11 shared events:** 11 full contracts, each added to the product on its own. That is about one and a half times the coordination work now under way, which is seven families.
- **All 17:** six more contracts, each added on its own. Proposals and findings carry their own text, so each of those contracts must also say how that text is protected and deleted.
- **Either way:** the owners get the same limited permission you gave on 11 September. They may define only technical parts of behavior canon already specifies, after a documented search. They may not decide features, retention or which owner wins a conflict. Those still come to you. Registering these events does not register the run, message, proposal and finding records they point to. Those still need their own schemas before anything can be stored.

**Options:**
1. **Register the 11 shared events, with that same limited permission (recommended).**
2. **Register all 17:** the 11 shared events and the six BrainStorm and Review events, with the same permission.

**Recommendation:** Option 1. It matches the events that every kind uses, which is what Card 4 meant by the shared events. If you meant every event the shared runtime names, choose option 2. The BrainStorm and Review events can otherwise follow when those features need their own recorded history.

**Owner edits if approved:** a Decision Log entry fixing the exact name list and granting a separate bounded technical-binding permission on DL-045's terms, as DL-046 did for the Browser families, leaving DL-045's 285-family scope unchanged; Collaborative Workflows section 13 cites it; one preparation branch and one Storage admission landing per family, as for the coordination families.

**Answer:** ____________________

---

## Card 4b: recording a collaborative run that fails

Card ID: `EA-S09B2-COLLAB-FAILED-001`. Owner: Collaborative Workflows, with Contracts. Family: a new `collaboration.failed`.

**Name:** Recording a collaborative run that fails.

**Question:** Should a collaborative run that ends in failure get its own recorded event, as runs that complete or are cancelled do?

**Why:**
- A collaborative run ends in one of three ways: completed, cancelled or failed. The shared events record the first two. No event records a failure.
- The older Crew "disbanded" event recorded a Crew that was dissolved, with a reason. Retiring it leaves a run that fails with no event of its own.
- Waiting and blocked are temporary states with no events either. The run record and the live view show them. This card does not add events for them.
- A participant that fails is recorded by its participant-completed event, whose contents say how it ended. Defining those contents is technical work. This card is only about the run as a whole.

**What you get:**
- **Add a failure event:** every ending is recorded the same way, with its reason, so nobody reading the history has to guess why a run stopped.
- **No failure event:** nothing new. A failed run shows as failed in its run record, but its history ends without a final event.

**What it costs:**
- **Add a failure event:** one more event name in the Collaborative Workflows document, and one more contract, added on its own.
- **No failure event:** anyone reading the history has to treat a run that stops without an ending event as failed or unknown.

**Options:**
1. **Add a failure event and register it with the others (recommended).**
2. **No failure event.**

**Recommendation:** Option 1. A run's history should say how it ended, and failure is the ending most worth finding later.

**Owner edits if approved:** Collaborative Workflows section 13 gains `collaboration.failed`; its contract and landing join Card 4a's set.

**Answer:** ____________________

---

## Card 4c: how long collaborative workflow history is kept

Card ID: `EA-S09B2-COLLAB-RETENTION-001`. Owner: Collaborative Workflows, with Storage. Families: the events chosen in Cards 4a and 4b.

**Name:** How long collaborative workflow history is kept.

**Question:** How long should the recorded history of each Crew, BrainStorm, Review and Chat Room run be kept?

**Why:**
- Every collaborative run belongs to a chat. Its definition carries the project and the chat. A message you send to it appears both in the chat and in the run's transcript.
- A participant may run as a child run. You chose to keep child-run history as long as the chat exists (Card 1).
- Retention is your choice. No earlier answer covers these events.
- This card covers the run's recorded events only. How long the run record itself, its transcript messages, proposals and findings are kept is not set yet, and this card does not set it.

**What you get:**
- **As long as the chat exists:** a run's history lasts exactly as long as its participants' history and its chat. Deleting the chat removes it too, within 24 hours unless it is on hold.
- **One year after the run finishes:** storage that stays bounded.
- **180 days after the run finishes:** the same lifetime as the agents' coordination records and board messages.

**What it costs:**
- **As long as the chat exists:** busy chats keep growing. Storage still has to say whether a very busy chat has no count limit, as for Goal text, or rolls into a linked continuation after 250,000 records, as chat messages do, the same open point as Card 1.
- **One year after the run finishes:** in chats older than a year, collaborative cards still show, but their history is gone, while their participants' histories are still there. Deleting a chat within the year does not remove this history unless each contract adds that rule.
- **180 days after the run finishes:** the same gaps, after six months. This rule keeps at most 1,000,000 records per project; past that the oldest are dropped first, so a very busy project can lose history before 180 days.

**Options:**
1. **Keep it as long as the chat exists (recommended).** The same lifetime as the participants' child-run history.
2. **Keep it for one year after the run finishes.**
3. **Keep it for 180 days after the run finishes.**

**Recommendation:** Option 1. A collaborative run and its participants' child-run histories should last equally long, and this uses the lifetime you chose in Card 1.

**Owner edits if approved:** the chosen families' contracts bind `RP-GOAL-THREAD-LIFETIME` (option 1, subject to the same Storage reuse check as Card 1), `RP-RUNTIME-365D` (option 2) or `RP-COORDINATION-180D` (option 3).

**Answer:** ____________________

---

These cards admit, retire and change nothing until they are answered and applied. Evidence: `Plans/Collaborative_Workflows.md` sections 1, 2.1, 2.3, 12, 13 and PART-016..020, `Plans/Contracts_V0.md` crew rows, DL-045, DL-046 and DL-047, and the three retention policies in `Plans/storage_value_registry.json`, all at `1e5d9b097b`; the presented Cards 1 and 2; the Card 4 answer in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/decision-card-answers-20260925/ANSWERS_STEP09_BATCH2.md`.
