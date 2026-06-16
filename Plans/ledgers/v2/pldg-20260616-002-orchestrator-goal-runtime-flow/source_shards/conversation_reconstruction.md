# Conversation Reconstruction Source Notes

This shard is source-lineage memory for `pldg-20260616-002-orchestrator-goal-runtime-flow`. It preserves the material points from the chat that were converted into design atoms. It is not canonical Plans prose.

## User-originated requirements and corrections

- Goal Mode now has three functions:
  - A. Invisible internal process for converting ledgers to Plans, Plans to WorkGraphs, and auditing those conversions in Chain Wizard and Doc Builder.
  - B. Visible Goal Mode exposed to the user in Assistant Chat.
  - C. Goal Mode as used in Orchestrator flow.
- Old unrelated test-chain material is not part of the current Orchestrator flow and should not be discussed as product foundation.
- Subagents must remain extensive. Cost/provider changes mean fanout must be bounded and policy-driven, not removed.
- Orchestrator WorkNodes will be executed by low-end agents. Governance/orchestration will be handled by higher-end agents.
- The Orchestrator flow is a substantial rewrite and should clean up old fixed-hierarchy wording.
- GUI changes matter, including Settings and many other pages/tabs.
- Audit/verifications on tasks must not be lessened.
- If Orchestration verification finds issues, it sends work back for fixing and verifies again. It repeats until issues stop. If the same issues repeat, it must adjust approach.

## Reconstructed architecture

Goal Runtime is the objective/control/evidence/certification envelope. Orchestrator is the operational projection, concerns, routing, GUI, and run-control surface. Executor remains scheduler truth for readiness, blocked state, backoff/retry, capacity, and dispatch. Owner systems keep permissions, worktree/source-control, storage, contracts, runtime artifacts, provider/model/account identity, governance, and future PlanUnit-to-node compiler authority.

## Canonical rewrite shape

GoalRun -> WorkGraph -> WorkNodes -> Agent/Subagent Waves -> VerificationCycle -> DefectBundle/RepairWorkNodes when failed -> verify again -> WorkNodeReceipt -> GoalCompletionReceipt.
