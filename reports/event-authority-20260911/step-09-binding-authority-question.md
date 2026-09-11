# Proposed authority to complete missing technical bindings

Status: unanswered. This is a clarification of the task's constraints, not an event disposition or a product decision card.

Step 8 has depth work for the 39 registered families other than the separately approved compaction completion family. Step 9 has 226 events with unfinished technical contracts and another 20 events on two product cards. Those twenty also have technical work remaining. Six events have cited semantic exclusions. The exact proposed scope is the 285 families in [the scope manifest](step-09-binding-authority-scope.json): 39 registered families for depth work, plus 246 unadmitted candidates. The exclusions are outside it. The [review packet](step-09-review-packet.md) lists Step 9 progress and remaining work by owner.

**Question for Jared:** May the responsible owners define and version demonstrably missing consumer, projector and checkpoint bindings for these 285 families, using existing owner-defined bindings wherever they fit and the limits below?

The clarification is needed because DL-039 expressly says “no invented consumer, projector or checkpoint identifiers,” while Step 9 requires full contracts containing those bindings. DL-040 separately authorized defining the missing compaction bindings and confined that exception to compaction. The latest approval to carry the PNC-019 baseline forward to `2026-09-11.1` concerns that baseline alone.

**Concrete proposal:** For each event, establish its exact producer, consumer roles and storage ownership from current Plans. Record the source search and existing partial contract. Reuse a binding only when its owner defines the required role, version and scope. If a required binding has no definition within the documented search scope, define it explicitly in the responsible owner document and mark it as new. Do not claim that it pre-existed or borrow a sibling's identifier, version or checkpoint.

New definitions would be limited to the technical mechanics of already specified behavior: identity and scope joins, concrete checkpoint values and cursors, atomic projection and advancement, replay, currentness, recovery and withdrawal. Any new feature, user-visible integration, retention or deletion policy, or competing-owner choice still returns as a genuine product card. This clarification would answer neither pending product question. Carded events could receive technical drafts, but dependent semantics and admission remain held until the answer is recorded and applied.

Every event would still require its complete owner-backed contract, exact schema references, positive and negative semantic checks and root review. Registered membership would stay unchanged; this proposal would neither re-admit those 39 families nor treat their current membership as depth proof. Any new registration remains one family per landing. This proposal grants no runtime proof, automatic depth pass, validator change, frozen accounting change, WorkNode, NodeSeed or seal.

**What this resolves:** A missing technical definition can be authored honestly as a new owner contract after source review, instead of being presented as existing evidence. Approval would not make the 285 contracts complete or decide their product behavior.

Three concrete investigations show why this question arises:

- `concern.created`: Plans names its command, `handlers::concern::create`, a closed payload schema and `concern_record.v1:{project_id}:{concern_id}`. A scoped search across 330 files did not establish the exact versioned concern consumer, projector and checkpoint binding. The concern record is a different storage family from the runtime artifact projection; its missing binding cannot be filled with the artifact checkpoint.
- `runtime_artifact.document`: Plans names the document writer and viewer roles, closed payload, artifact index keys and `projector.checkpoint.runtime_artifacts:{project_id}`. A scoped search across 328 files did not establish the required named and versioned consumer/projector binding. The deferred registry family's `schema_version: 1.0.0` is not a binding version. Its separate retention card remains unanswered.
- `run.started`: This family is already registered with a closed payload, Executor start barrier, project scope and 365-day runtime retention. A scoped search across 328 files found run graph, history, Usage and recovery consumer roles, but did not establish an exact versioned consumer/projector/checkpoint tuple. Snapshot records, legacy run keys and other event families' checkpoints do not supply it. The current registry minus compaction completion exactly matches the earlier 39-family depth assessment; that set comparison does not establish all 39 individual binding gaps.

These are three investigated cases. They do not establish that every scoped event lacks identifiers. All search scopes, found definitions, source references and raw evidence paths with SHA-256 digests are in the scope manifest.

Authority: `Plans/Decision_Log.md:419–421` (DL-039), `Plans/Decision_Log.md:431–433` (DL-040), and `Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md:15–22`. No general exception has been inferred.

**Answer:** __________
