# Deferred Item Resolution Workshop — 2026-06-16

Status: proposed_pending_user_review

This shard records concrete proposed closures for the remaining deferred Orchestrator Goal Runtime Flow implementation/readiness questions. It is source/planning memory only. It does not create canonical Plans, PlanUnits, WorkNodes, NodeSeeds, executable queues, Spec Lock, shards, evidence bundles, plan_graph, or auto_decisions.

## q-0001 — Capability lanes and model/provider defaults

Proposed closure: do not hardcode provider/model names in canonical Orchestrator logic. Ship configurable capability lanes and settings selectors. Default roles:

- low_cost_executor: bounded WorkNode execution and patch/proposal work.
- standard_reviewer: routine review and simple acceptance checks.
- high_reasoning_orchestrator: decomposition, authority, replan, routing, blocker classification.
- verifier_lane: bounded low-cost evidence checks plus high-reasoning reduction/certification for important work.
- high_reasoning_adjudicator: repeated defects, conflicts, ambiguity, root-cause replans.
- high_reasoning_certifier: completion receipts and parent GoalRun certification.

Low-end agents may execute and propose. They must not certify parent completion.

## q-0002 — GUI layout/tab placement

Proposed closure: keep the Orchestrator six-tab spine and add Goal/WorkGraph overlays instead of creating a separate Orchestrator page family.

- Header: GoalRun status, objective, phase, authority/write surface, cost/budget, certification.
- Progress: Goal tree, WorkNodes, subagent waves.
- Seams: owner boundaries, write leases, capability lanes, authority surfaces.
- Node Graph: WorkGraph dependencies, WorkNode states, verification overlays, repeated defect signatures.
- Evidence: WorkNode receipts, VerificationCycles, validators, findings, goal receipt.
- History: goal events, replans, repair loops, model/agent assignments.
- Ledger: source mapping, compile lineage, PlanUnit/WorkNode lineage.

Settings must add capability-lane, subagent policy, verification policy, write policy, and Goal Mode policy panels. Exact pixel layout remains FinalGUISpec implementation detail.

## q-0003 — Compiler contract

Proposed closure: define the Orchestrator-facing WorkGraph/WorkNode runtime contract now, but keep executable NodeSeed/WorkNode generation gated behind Plan_To_Node_Compilation.

Canonical Plans should define: GoalRun, WorkGraph, WorkNode, SubagentWave, VerificationCycle, DefectBundle, RepairWorkNode, WorkNodeReceipt, GoalCompletionReceipt, CapabilityLane, and CertificationTier.

PlanUnit index remains source. NodeSeed is a generated candidate artifact. WorkNode is executable only after compiler readiness, existence, dependency, acceptance, permission, and scheduler gates pass.

## q-0004 — Verification repeat policy

Proposed closure: keep current default. Same defect signature fails twice -> change strategy. Third failed cycle -> high-end adjudicator/root-cause replan. Always verify again after repair. Never mark done with known findings. Keep thresholds configurable.

## q-0005 — Live backlink audit

Proposed closure: snapshot doc matrix is planning memory only. Compile goal must rerun a live backlink/reference audit before edits. P0 docs are required update candidates, P1 direct consumer/policy audit candidates, P2 stale-reference audit candidates.

## q-0006 — Requirements Doc Builder owner placement

Proposed closure: Goal_Runtime_System.md owns the engine-level invisible-goal statement. chain-wizard.md owns wizard entry and ledger-to-plan flow. chain-wizard-flexibility.md owns Requirements Doc Builder-specific activity pane, pause/cancel/resume, multi-pass review, and document-production UX. assistant-chat-design.md owns visible chat Goal Mode. FinalGUISpec owns rendered Settings/page placement. Doc Builder invisible goals are not default Orchestrator WorkNodes unless explicitly handed to Orchestrator execution.

If a dedicated Requirements_Doc_Builder.md owner doc exists in the live repo, compile should prefer it for builder-specific behavior; otherwise chain-wizard-flexibility is the owner.
