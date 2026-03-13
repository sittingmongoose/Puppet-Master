# Working Ledger

## Work Item
- `w-20260312-203855`

## Mode
- `research`

## Topic / Scope
- Orchestrator rewrite planning research.
- Topic came from the user explicitly: "I want to talk about Orchestrator."

## Objective
- Create a durable execution-memory ledger before deeper Orchestrator research or audit work starts.
- Preserve the currently known topic so later research can accumulate findings without losing scope continuity.
- Continue collaborative Orchestrator research in-thread; do not treat the work as ready for reconciliation yet.

## Constraints / Non-Goals
- Ledger is execution memory only; it is not canonical and must not be cited in planning docs.
- Do not write planning-doc changes during this initialization step.
- Current chat context establishes the topic, but no targeted repo reading or design research has been done yet for Orchestrator in this work item.
- Keep future repo reading targeted first; avoid a broad sweep unless the discussion clearly requires it.

## Key Facts and Findings
- Targeted usage-tracking doc check confirms usage is already heavily documented rather than missing:
  - `Plans/usage-feature.md` is the strongest current owner for usage/quota/alerts/analytics/product-shape discussion.
  - `Plans/storage-plan.md` and `Plans/FinalGUISpec.md` also carry meaningful usage/runtime/event/GUI assumptions.
  - usage is already treated as a first-class cross-surface concern, not a small side feature.
- Usage docs already assume several concepts that overlap directly with current Orchestrator/multi-account research:
  - configurable warning thresholds
  - platform quota visibility
  - rate-limit / reset countdown surfaces
  - project-scoped usage storage
  - dashboard widgets
  - orchestrator/runtime event persistence
  - usage + ledger + analytics rollups
- Important implication:
  - new multi-account failover / account-threshold / effective-account behavior should extend the existing usage model and projections
  - do not invent a second independent "account pressure" or "quota" subsystem beside Usage
- Clarified multi-account control-loop scope:
  - account selection / failover is not just an Orchestrator-node concern
  - any provider-using actor must participate in the same pre-send and post-send account-health loop
  - this explicitly includes assistant chat, interviewer, requirements-doc builder, overseers, node workers, and delegated workers
  - any completed provider interaction can update account health and trigger the next message/attempt to resolve onto a different account
- Clarified non-Orchestrator conversational actor flow:
  - assistant, interviewer, and requirements-doc-builder should share provider/account/usage/runtime identity behavior, but they are not orchestration nodes/packages/seams
  - their primary mode is conversational/brainstorming and decision-forming, not orchestration-style HITL escalation routing
  - requirements-doc-builder flow is conversational first:
    - collaborative ideation / viability / approach discussion
    - then more structured questioning to close gaps and lock decisions
    - then generation of more traditional requirements documents/artifacts
  - interviewer follows a similar conversational-to-structured pattern, but moves topic-by-topic and ultimately produces documents/artifacts shaped for the node/contract system
  - the broader handoff chain described by the user is:
    - requirements-doc-builder artifacts
    - interview flow artifacts
    - conversion into graph-plan inputs
    - handoff to Orchestrator
  - human review exists at both document-production stages in that upstream flow
- Boundary clarification:
  - chat-thread resolution surfaces for blocked/HITL/critical Orchestrator events should not be projected backwards onto normal assistant/interviewer/requirements-builder conversation in the same way
  - those conversational actors already operate directly in chat, so they share runtime identity/account/usage behavior without needing the same Orchestrator-style resolution-thread pattern for ordinary interaction
- Clarified retry/worker identity direction:
  - the old structured-attempt-handoff pattern should be retained in the new model
  - each failed node attempt should leave a structured receipt/handoff artifact:
    - what it did
    - what changed
    - why it failed/blocked
    - what to try next
  - default retry model should use a fresh agent/subagent for the next attempt
  - retries should remain policy-driven with budgets/caps; not blind infinite looping
  - some failures should route to remediation, graph patch, or block/HITL instead of simple retry
- New execution-policy settings requirement:
  - GUI should let the user choose whether retries use:
    - a fresh agent/subagent (default)
    - the same agent/subagent retaining prior context
  - GUI should also let the user choose whether node execution uses:
    - subagents by default
    - full agents instead of subagents
  - user expectation is:
    - default: use subagents
    - configurable override: use full agents for nodes instead of subagents
- Clarified execution-policy UI split:
  - worker kind and retry-context policy are separate settings, not one combined toggle
  - chat already acts as a requested-identity override surface for provider/model/effort/persona and should align with the same requested-vs-effective model used by Orchestrator actors
  - the next settings/UI seam must cover:
    - agent vs subagent
    - fresh vs reused retry worker
    - overseer delegation on/off
    - delegated-worker provider/model/effort policy
    - consistent requested-vs-effective identity display across chat actors and orchestration actors
- Terminology refinement:
  - prefer `overseer-spawned node worker` over the vaguer term `delegated worker`
- Execution-path hypothesis now leaning stronger:
  - user expects most or nearly all node execution to likely be overseer-spawned rather than direct-runtime-dispatched
  - this suggests the "overseer-spawned node worker" path may be the normal/default operational path, while direct node-worker dispatch may become the rarer/special-case path
  - this has implications for settings, UI language, runtime contracts, and requested-vs-effective identity display:
    - the primary node execution path should not be described as an edge-case if it is the common path
    - direct dispatch may need to be framed as an optimization/fallback/special policy mode rather than the baseline mental model
- Important existing tension surfaced by the usage docs:
  - usage documentation already acknowledges heterogeneous provider semantics and incomplete live-API availability
  - this aligns with the current discussion that quota/pressure detection will need mixed signal sources (runtime outcomes, provider capabilities, heuristics/log-derived signals where necessary)
- Important scope reminder from usage docs:
  - usage is currently documented as primarily project-scoped, with multi-project aggregation explicitly treated as a separate later concern
  - this aligns with the current per-project orchestration storage/projection direction
- Topic is known: `Orchestrator`.
- User asked to hold off on substantive work until the follow-up prompt arrived; this initialization prompt is the first explicit action request after topic confirmation.
- Existing work item `w-20260312-160857` is for a different packetized research topic and should not be reused for Orchestrator.
- A new pre-packetize work item was required for this topic.
- User clarified the actual first seam to discuss:
  - in the rewrite, the system is moving to a node-graph-based execution model
  - question is whether that node graph is what Orchestrator uses
- First targeted repo reads:
  - `Plans/Orchestrator_Page.md`
  - `Plans/orchestrator-subagent-integration.md`
- Current architecture split is already visible:
  - `Plans/Orchestrator_Page.md` is the UI/page-shell owner for a single-page six-tab Orchestrator surface: `Progress`, `Tiers`, `Node Graph Display`, `Evidence`, `History`, `Ledger`.
  - `Plans/orchestrator-subagent-integration.md` treats Orchestrator as the primary consumer of canonical runtime scheduler contracts, not as a schema owner.
- Strong current runtime stance:
  - event-driven wakeups, not steady-state polling, are the authoritative execution/update model
  - orchestrator must consume canonical runtime fields and event names from shared contracts
  - blocked outcomes, remediation lineage, retry/backoff posture, and same-cycle reconsideration are first-class orchestration behavior
  - worktree-native isolation is explicitly required; file-lease orchestration is explicitly rejected
- Current docs do say Orchestrator consumes the plan/node graph for execution:
  - `Plans/orchestrator-subagent-integration.md` says Puppet Master orchestrator consumes sharded-only plan graphs and executes headless from `.puppet-master/project/plan_graph/index.json` and node shards
  - the same doc says required execution inputs include plan-graph index and node shard files
  - the scheduling model explicitly talks about runnable graph nodes, DAG readiness, and dispatch from a global ready set
- Design discussion now has a concrete recommendation direction:
  - hybrid is acceptable only if graph execution remains canonical and tiers become a derived human-facing lens
  - hybrid becomes dangerous if tiers and graph both retain execution authority
- User is now pressure-testing the missing runtime control pattern:
  - old tier system had an overseer agent governing iteration workers / spawned subagents
  - concern is valid that a single agent cannot "walk the whole graph" in one giant cognitive run without degrading badly
  - key unresolved design seam: what is the governing intelligence/control loop in a graph-canonical system
- Emerging recommendation direction from the conversation:
  - keep the canonical graph as execution truth
  - introduce bounded, coherent subgraph groupings (`work packages`) rather than one global overseer agent
  - assign local overseers to work packages
  - keep the global orchestrator runtime deterministic and above those overseers
- User accepted the direction of precomputed bounded packages rather than one giant overseer.
- User proposed an additional governance safeguard:
  - when an overseer finds missing work / wiring / design correctness issues, two additional subagents should be spawned to check whether the overseer's concern is valid before remediation or graph-change action proceeds
- User further refined governance layering:
  - there should be both a `work package overseer`
  - and a `same-feature-seam overseer`
  - this intentionally reintroduces part of the older hierarchical oversight model, but now over graph-based execution rather than tier-based execution
- User accepted making `feature seam` first-class rather than informal metadata only.
- User resolved seam completion rule:
  - if integration is weak, the feature seam is not complete
  - package completion is therefore necessary but not sufficient for seam completion
- User expanded the conversation scope beyond governance mechanics:
  - settings / GUI must be updated for the new execution/governance model
  - provider/model resolution needs to be thought through across execution levels
  - worktree behavior needs explicit reconsideration under node/package/seam governance
  - persona assignment needs explicit rules: overseers configured, node workers dynamically assigned, overrides still possible
- User clarified concrete execution/settings expectations:
  - node personas should be auto-selected from node work/type
  - node persona override should exist as a global node-worker policy override, not a per-node setting
  - `feature seam`, `work package`, and `node` should each have independent provider/model/effort settings with defaults plus overrideability
  - settings should define whether work-package overseers may spawn subagents for node work
  - if overseer-spawned node subagents are enabled, their provider/model/effort must be configurable
  - package-based worktrees feel more manageable than per-node worktrees at expected node counts
  - user raised a specific worktree concern: if a package uses a bounded pool of mutable worktrees, dependent nodes inside the same package may require careful lane/ordering rules so downstream nodes see the right upstream state
  - conversation is moving next into requested-vs-effective resolution semantics for provider/model/effort/persona
  - user accepted using whichever dependent-node lane policy is cleanest/easiest
  - user requested a concrete ownership / inheritance / override matrix next
  - user also raised a new runtime-model question: Puppet Master snapshots / safe-point-like recovery likely need to be accounted for and may need an explicit relationship to the plan graph
  - user wants to go deeper on the snapshot / safe-point policy model next
  - user accepted continuing into a failure-class-to-restore matrix next, with GUI/settings implications kept in view
  - user wants to move on from the restore matrix into the next derived topic
  - user clarified an important global constraint: the system should be fully automated by default; humans are only involved when something critically fails or a major decision is required
  - user also clarified HITL is still a configurable setting: users can choose review/approval boundaries such as work-package level or feature-seam level if they want manual checkpoints
  - user emphasized this further:
    - all tests/review paths are expected to be fully automated by default
    - HITL is explicitly off by default; automation is the normal system behavior
    - if HITL blocks or a critical failure / decision occurs, the issue must surface in:
      - Dashboard
      - Orchestrator page
      - a spawned agent/thread in the chat window
    - Dashboard and Orchestrator should direct the user to the chat thread for decision/resolution details
    - the chat thread should present the issue/decision and allow the user to choose how to resolve it
  - user wants to continue into concrete promotion gating policy next
  - user added a cross-surface requirement: worktrees should be visible in the Orchestrator page and likely also in Source Control
  - user clarified UI constraints:
    - Source Control side panel is relatively small, though tabs can be added if needed
    - Orchestrator-managed worktrees should likely be separated from other worktrees (user-created or assistant-created)
    - existing Orchestrator tab structure already contains 4-6 tabs of different information, though the current spec is weak and should not be deeply redesigned in this thread
  - user clarified a broader app-level constraint:
    - multiple projects/repos can be running Orchestrator concurrently
    - presented orchestration data is per project
    - there is also a project page that shows current status of each project
    - projects can have different settings/themes/snapshots/etc.
    - data/storage shape should be per-project so orchestration state remains isolated
  - user added another execution complication:
    - multi-account support exists (example: multiple Codex accounts)
    - if a node exhausts usage or multi-account logic predicts imminent exhaustion, execution should be able to switch to another account
    - this likely already exists in docs, but it strengthens the need to model account/provider selection as requested vs effective runtime identity
- Targeted repo check on current doc state:
  - direct search found no current references to `feature seam` or `work package` in `Plans/**`
  - current GUI/spec docs therefore do not yet reflect these newly discussed governance objects
- Current GUI/orchestrator documentation remains oriented around the older surface model:
  - `Plans/Orchestrator_Page.md` still defines tabs `Progress`, `Tiers`, `Node Graph Display`, `Evidence`, `History`, `Ledger`
  - `Plans/Orchestrator_Page.md` still explicitly says runs and tier checks are driven by the `Overseer`
  - `Plans/Run_Graph_View.md` describes the graph as live DAG execution, but node rendering still includes tier-type iconography and tier-oriented vocabulary
  - `Plans/FinalGUISpec.md` still references `phase/task/subtask` progress and mapping editors rather than package/seam governance surfaces
- Strong current UI stance:
  - Orchestrator is a top-level page with six tabs, including a dedicated full-page graph tab and run-scoped ledger/history/evidence surfaces
  - the page doc already admits unresolved data-source ownership gaps and explicitly says the UI must bind to upstream owners rather than minting local compatibility fields
- Early tension already visible:
  - page-spec language still includes local event/type phrasing such as `PuppetMasterEvent::*` and a named AI foreman role (`Overseer`)
  - runtime addenda emphasize "consumer of canonical contracts" and "must not redefine locally"
  - likely reconciliation seam: remove shadow event/schema ownership from the page layer and tighten it around projections and controls only
  - another active tension: docs still preserve a first-class tier model (`Phase`, `Task`, `Subtask`, `Iteration`) at the same time they describe execution over graph nodes, so the rewrite docs are not yet purely graph-native in vocabulary

## Gaps / Problems Identified
- Exact Orchestrator scope is still undefined beyond the topic name.
- Orchestrator currently appears split across at least two concerns that can drift:
  - page IA / widget behavior / data bindings
  - execution policy / scheduler consumption / remediation behavior
- Current docs likely risk shadow ownership at the page layer:
  - page doc names concrete event sources and local live-status mappings
  - runtime doc says canonical contracts live elsewhere and Orchestrator must consume them without redefining
- Current docs are not fully simplified to "graph only":
  - execution is documented against graph nodes
  - but orchestration identity, UI labels, and persona defaults still retain a tier hierarchy as a first-class overlay
- GUI gap is now explicit:
  - no documented GUI surface yet for `work package`
  - no documented GUI surface yet for `feature seam`
  - no documented seam-level acceptance / weak-integration / corroboration review affordance yet
  - worktree visibility/controls likely need coordination across Orchestrator and Source Control, not isolated ownership in only one surface
  - worktree UI likely needs partitioning/filtering between orchestrator-owned worktrees and non-orchestrator worktrees due to scale and panel-size constraints
  - dashboard/project-summary surfaces also need per-project aggregation without collapsing project-local orchestration state into one global pool
- Lifecycle/status direction now discussed:
  - node, work package, feature seam, promotion, and worktree lane should each have their own lifecycle rather than one universal status enum
  - transitions should be deterministic and event-driven
- Next subtopic requested:
  - define the event model that causes lifecycle transitions
- Event-model direction now discussed:
  - event families should include scheduling, execution, review/verification, contamination/recovery, remediation/replan, promotion, HITL/escalation, worktree/lane, and effective-resolution events
  - canonical event naming should be shared across runtime and UI projections; Orchestrator should not invent a shadow event language
  - some events are runtime-internal, some must be operator-visible, and some must specifically drive Dashboard/Orchestrator/chat resolution surfaces
- Next subtopic requested:
  - classify which events are runtime-internal vs operator-visible vs chat-thread resolution events
  - multi-project orchestration means identity/projection/storage will need at least project scoping, not just run/seam/package/node scoping
  - multi-account execution means identity/projection/storage may also need account selection / account fallback visibility as part of effective runtime state
- External multi-account/code research findings:
  - upstream codebase already has first-class persisted account records plus an active-account state model, not just loose auth blobs
  - upstream account persistence/model shape is usable as a conceptual reference:
    - durable `account` table with token/expiry
    - separate active-account state
    - account-scoped remote config fetch
  - referenced PR adds a more advanced OAuth-pool direction that is relevant conceptually:
    - multiple OAuth records per provider/namespace
    - ordered candidate list with active record preference
    - rotation/failover wrapper around fetch/request execution
    - cooldown and max-attempt policy
    - per-request account context via async-local storage
    - failover event emission / operator-visible notifications
    - settings/config knobs for OAuth rotation behavior
    - browser auto-relogin path for expired tokens
  - most reusable ideas from the PR are architectural, not literal:
    - per-request effective account context
    - account-pool snapshot + ordered candidate selection
    - cooldown / max attempts / retry budget
    - failover event publication
    - separating requested account policy from effective account selection
  - less reusable / too coupled pieces from the PR:
    - browser automation relogin as a core assumption
    - TUI-toast-centric UX coupling
    - very provider/OAuth-specific implementation details when our model must span broader execution roles/providers
  - additional repo provides stronger product/UI references than core-architecture references:
    - provider-specific account pool cards
    - active/available account counts
    - manual rotate / activate / remove flows
    - cooldown presets
    - per-account metadata fields
    - quota bars / reset countdown visualization
    - profile-file-based storage and log-watcher-driven quota/exhaustion heuristics
  - most reusable ideas from the additional repo are UI/product-shape ideas:
    - account pool as a first-class settings concept
    - per-account metadata display
    - visible quota/usage pressure
    - manual rotate/failover controls in settings
    - cooldown state as an explicit concept
  - less reusable / too coupled pieces from the additional repo:
    - filesystem-profile storage shape
    - log parsing as authoritative quota detection
    - provider-specific namespace hacks
    - manual “set active” assumptions as the main path rather than automation-first runtime selection
- Candidate design adjustments from the external research:
  - add explicit `effective_account_id` and switch/fallback reason to attempt/runtime visibility
  - multi-account policy should support cooldown and retry-budget concepts, not just threshold + priority
  - account selection should probably operate on a provider+role+namespace/pool snapshot rather than raw global account lists
  - settings/UI likely need pool/account metadata and quota-pressure visibility in addition to simple threshold controls
- Clarified design stance after external research:
  - browser auto-relogin is potentially useful as an optional provider-specific recovery capability, but should not be a core cross-provider assumption for Puppet Master
  - log parsing should not be treated as canonical quota truth; at best it is a supplemental heuristic/evidence source
  - manual `set active` is useful as a settings/debug/operator control, but should not be the main execution model in an automation-first system
- User clarified additional multi-account constraints:
  - for many provider-backed tools, browser auth may effectively be the only practical path for switching/recovering accounts
  - therefore browser-based relogin/rotation likely needs to be supported as a real provider capability, not dismissed
  - however OpenCode-as-provider likely should not be a primary target for multi-account support
  - quota/usage detection is heterogeneous across providers and tools (including CLI-based providers), so log parsing may be necessary as a supplemental signal in practice
  - manual `set active` remains valuable as an override/control setting, not the default execution model
- Storage/projection direction now discussed:
  - canonical persisted objects should likely include at least `project`, `run`, `feature_seam`, `work_package`, `node`, `attempt`, `lane`, `snapshot`, `promotion`, `review`, `resolution_thread`, and `event`
  - dashboard/orchestrator/source-control summaries should be projections, not separate truths
  - requested vs effective execution identity, including effective account selection/fallback, should be persisted at attempt level
- Next subtopic requested:
  - define field shape for the most important persisted objects first: `attempt`, `lane`, `promotion`, `review`, `resolution_thread`
- Child-record field-shape direction now discussed:
  - `attempt` should persist identity, actor type, requested vs effective provider/model/effort/persona/account, resolution/fallback metadata, lane/snapshot linkage, lifecycle/result, and evidence refs
  - `lane` should persist project/package linkage, worktree binding, lifecycle, contamination state, safe-point linkage, ancestry, and ownership/display grouping for UI separation
  - `promotion` should persist promotion class, source/target linkage, eligibility/blocking/HITL state, decision/result, and evidence/review/corroboration linkage
  - `review` should persist scope, review type, actor linkage, verdict/severity/blocking, findings, evidence, and timestamps
  - `resolution_thread` should persist trigger linkage, resolution kind, issue summary, allowed actions, status, and UI/chat linkage
- Next subtopic requested:
  - define minimal field shape for parent objects: `project`, `run`, `feature_seam`, `work_package`
- Parent-object field-shape direction now discussed:
  - `project` should primarily own identity, repo/project settings/theme/account-policy linkage, active-run pointers, and coarse project status
  - `run` should own execution-session identity/lifecycle, graph linkage, run-level settings snapshot, and active pointers/rollup posture
  - `feature_seam` should own membership, lifecycle, requested settings, overseer/governance state, seam-promotion state, and seam evidence linkage
  - `work_package` should own membership, lifecycle, requested settings, overseer/delegation/worktree policy refs, baseline lane state, package-governance state, promotion linkage, and package evidence linkage
- Next subtopic requested:
  - trim parent and child objects into must-persist vs cacheable vs derived fields
- Settings/config gap is now explicit:
  - current discussion implies provider/model settings at node, work package, feature seam, overseer, and delegated-subagent levels
  - current docs under discussion have not yet been reconciled around that model
- Worktree gap is now explicit:
  - current orchestration discussion has not yet defined whether worktrees are allocated/owned primarily per node, per package, per seam, or per remediation branch of work
  - current conversational preference is leaning toward package-based worktrees rather than per-node worktrees for scale/manageability reasons
- Missing from the current conversation so far:
  - whether the governing layer is an always-on planner/overseer agent, a deterministic scheduler plus short-lived agents, or a mixed model
  - how graph decomposition preserves bounded agent context without recreating tier authority as a second execution model
- New design seam now identified:
  - whether overseer-raised concerns require quorum / corroboration before spawning remediation nodes or requesting graph patch / replan
  - how expensive this corroboration path should be, and which issue classes should trigger it
- New governance-boundary question:
  - what distinct authority belongs to package overseer vs feature-seam overseer so they do not become redundant or conflicting co-governors
- Current open design question is not just "what is Orchestrator" but "what is Orchestrator allowed to own":
  - page layout and controls
  - view-model / projections
  - run control intents
  - but probably not canonical runtime enums, event semantics, or scheduler truth
- No decision yet on the primary discussion seam for this research pass:
  - page/surface design
  - runtime state model
  - cross-surface lineage and receipts
  - blocked/recovery/remediation UX

## Candidate Fixes / Design Directions
- Start the next phase by clarifying which Orchestrator seam is in scope first:
  - UI surface / IA
  - execution model / state machine
  - cross-surface lineage and receipts
  - recovery / rollback / blocked-state behavior
- Use the ledger to capture terminology, precedence rules, effective-vs-requested state, and cross-doc ownership as they emerge.
- Likely productive framing:
  - treat Orchestrator as a projection-and-control surface over canonical runtime contracts
  - keep scheduler semantics, attempt identity, blocked reasons, allowed actions, and remediation lineage owned by shared runtime docs
  - let the Orchestrator page own tab structure, control affordances, and projection composition
- Candidate reconciliation target:
  - define a clean boundary between canonical runtime facts, orchestrator projections, and widget/page presentation
  - explicitly distinguish requested state vs effective state wherever persona/provider/model fallback can occur
- Candidate model clarification:
  - "Orchestrator uses the node graph" is already documented as true for scheduling/execution inputs
  - unresolved follow-up is whether tiers are just presentation/grouping over nodes or remain an independently meaningful orchestration layer
- Candidate control-plane recommendation to explore:
  - Orchestrator should likely be a deterministic scheduler/state machine, not one long-running super-agent
  - graph nodes should dispatch bounded worker/reviewer/remediation agents with explicit context windows and attempt identities
  - a lightweight planning/replan agent may still exist, but only at graph-construction or graph-patch boundaries, not as the continuous owner of all execution truth
- Candidate governance model now favored:
  - `run` = full canonical graph under deterministic runtime control
  - `work package` = coherent precomputed subgraph with a local overseer
  - `feature seam` = cross-package oversight scope for related packages within the same product area
  - `node` = smallest executable work unit
  - overseers may critique or challenge package outcomes, but newly discovered work must become explicit remediation nodes or graph-patch requests
  - quorum/corroboration agents may be used before accepting an overseer challenge for high-impact gaps
  - seam completion requires integration quality, not just package-local pass states
- Promotion classes now emerging from the conversation:
  - `lane_to_package` promotion: accepted lane result becomes package baseline
  - `package_to_seam_available` promotion: package becomes available as a trusted seam contribution
  - `seam_complete` promotion: seam is marked complete
- Promotion model direction:
  - promotions are explicit runtime state transitions, not implicit side effects
  - automation-first default remains intact
  - optional HITL boundaries may pause otherwise-valid promotion
  - blocked/HITL/critical promotion states must surface on Dashboard, Orchestrator, and a spawned chat thread
- Promotion gate direction now discussed:
  - `lane_to_package` gates focus on local correctness, uncontaminated lane state, required automated verification/review, and promotable package outputs
  - `package_to_seam_available` gates focus on trusted package baseline, package-level evidence, acceptable package-overseer verdict, and seam-consumable outputs
  - `seam_complete` gates focus on integration review, absence of unresolved major/critical findings, seam evidence, workflow completeness, GUI/runtime alignment, and no pending corroboration/remediation
- Next subtopic requested:
  - define required evidence at node/package/seam levels so promotion gates are concrete
- Emerging execution-settings direction:
  - provider/model selection likely needs distinct defaults or overrides at:
    - run/global context
    - feature seam
    - work package
    - node
    - work package overseer
    - feature seam overseer
    - overseer-delegated node worker
  - requested vs effective provider/model must remain visible at all levels where fallback/override can occur
- Clarified resolution direction:
  - node persona selection should be dynamic-by-default from node scope/type
  - node persona override should apply as node-worker policy, not per-node manual config
  - seam/package/node each need independent provider/model/effort configuration surfaces
- Emerging persona direction:
  - overseer personas should be explicit settings-owned roles
  - node worker personas should default dynamically from node scope/type
  - node worker personas/provider/model should remain overrideable
- Emerging delegation-policy direction:
  - settings should define whether overseers may use subagents for node work
  - if allowed, settings should define the provider/model policy for those delegated node workers
- Candidate discussion order:
  - first pin Orchestrator ownership boundaries
  - then derive tab responsibilities and CTA behavior
  - then map cross-links to Usage / Evidence / Graph / history / blocked outcomes
  - then define provider/model/persona precedence
  - then define worktree ownership/isolation rules

## Impacted Docs
- `Plans/usage-feature.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/orchestrator-subagent-integration.md`
- Likely adjacent owners if this expands:
  - `Plans/Executor_Protocol.md`
  - `Plans/Contracts_V0.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/storage-plan.md`
  - `Plans/usage-feature.md`
  - `Plans/FinalGUISpec.md`

## Decisions Already Resolved
- Mode for this work item is `research`.
- A new work item is being used rather than updating the unrelated existing packetized item.
- Work item status should remain `active` until research is ready for reconciliation.
- First targeted reading should stay narrow and centered on Orchestrator docs plus direct owner contracts, not a repo-wide sweep.
- Current discussion should stay centered on the node-graph / Orchestrator relationship before expanding into other seams.
- User explicitly wants to keep researching in this thread; prior readiness marker should not be treated as a handoff decision.
- Current working focus is moving into projection ownership by surface rather than reconciliation.

## Open Questions / Uncertainties
- Is the desired mental model:
  - Orchestrator executes the canonical node graph directly
  - Orchestrator uses projections derived from the node graph plus runtime attempts
  - or Orchestrator owns a higher-level tier model layered on top of graph nodes
- In a graph-canonical design, what should own top-level governance:
  - deterministic runtime scheduler only
  - scheduler plus bounded "manager" agent for replan/escalation decisions
  - or an overseer-style agent that remains in the loop continuously
- How should bounded context be enforced so one agent never accumulates the whole graph as working memory?
- Should overseer corroboration use:
  - strict 2-of-3 quorum
  - weighted recommendation with runtime policy thresholds
  - or issue-class-specific escalation rules
- What should the feature-seam overseer uniquely own:
  - cross-package coherence
  - integration correctness across package boundaries
  - style/architecture consistency
  - seam-level “did we actually build the intended thing” judgment
  - authority to withhold seam completion when integration quality is weak even if constituent packages passed
- Additional weak-integration candidates surfaced for follow-up discussion:
  - missing or inconsistent state transitions across package boundaries
  - partial feature completion that strands dead-end UI or unusable flows
  - duplicated logic or contradictory contract interpretation across packages
  - local acceptance satisfied while end-to-end behavior remains awkward, surprising, or brittle
  - backend/runtime feature exists but is not surfaced in the GUI
  - GUI still reflects an older model and does not expose the new runtime/governance objects
  - logic is technically wired but not wired into the actual user workflow or operator control surface
- Emerging weak-integration buckets to preserve:
  - missing GUI representation of runtime/governance state
  - state-model mismatch across package boundaries
  - user-flow dead ends or partial affordances
  - contract drift / duplicated interpretation across packages
  - technically passing local checks while seam-level UX or architecture remains poor
- Next discussion step requested by user:
  - turn weak integration into explicit seam-level acceptance criteria and failure classes
- Candidate seam-level acceptance dimensions to formalize:
  - operability
  - state coherence
  - workflow completeness
  - UX coherence
  - architectural coherence
- Candidate seam-level failure classes to formalize:
  - GUI/runtime mismatch
  - incomplete end-to-end flow
  - cross-package state mismatch
  - contract drift
  - technically wired but operationally unusable
  - local-pass/global-fail composition
  - missing degraded/recovery behavior
  - inconsistent UX semantics
  - cross-seam architecture drift
  - invisible governance / missing operator affordances
- New requested discussion step:
  - define concrete seam review loop behavior
  - include trigger points, checks performed, corroboration thresholds, and emitted artifacts
- Candidate seam review loop shape to preserve:
  - review at package-completion boundaries
  - review at integration-edge / cross-package boundary crossings
  - review before seam completion
  - review when package overseer raises a high-impact challenge
- Candidate seam review outputs:
  - seam review verdict
  - failure classes with severity
  - evidence bundle / rationale
  - remediation-node recommendation or graph-patch recommendation
  - corroboration requirement and outcome when invoked
- New unresolved model/config questions from the conversation:
  - what is the provider/model precedence order across run, seam, package, node, overseer, and delegated-subagent levels
  - are seam/package/node provider-model settings hard constraints, defaults, or hints
  - can an overseer do direct node work, or only delegate/review
  - if an overseer can do node work directly, does it use overseer-effective settings or node-effective settings
  - how do dynamic node personas interact with explicit node overrides and overseer-controlled delegation
  - how are worktrees assigned for parallel nodes within the same package or seam
  - what happens to worktree ownership during remediation, corroboration, or graph-patch-triggered work
- Additional clarified questions:
  - should overseer-spawned node workers default to node-effective provider/model/effort, or to a distinct delegated-worker policy
  - how many parallel mutable worktrees can safely exist within one package before package-level coherence breaks down
  - for package-based worktree pools, when two nodes in the same package have dependency ordering, should the downstream node reuse the same worktree lane, or start a fresh lane from the promoted upstream result
  - current conversational preference is to choose the simpler default for dependent-node execution lanes; current recommendation is same-lane continuation by default, with promote-then-fork reserved for cases where it materially improves safe parallelism
  - how should snapshots / safe points / restore points relate to graph execution:
    - runtime-only artifacts keyed to attempts / lanes / packages
    - graph-declared checkpoints or restore boundaries
    - or a hybrid where graph requests policy and runtime materializes concrete snapshots
  - next seam to define: concrete snapshot policy, restore policy, trigger classes, and scope boundaries across lane/package/seam/remediation
  - next subtopic: map failure classes to restore behavior, remediation/escalation posture, and what must be surfaced in UI/settings versus kept runtime-internal
  - next likely subtopic after restore matrix: contamination rules that decide lane restore vs package restore
  - promotion/review policy must account for both:
    - automation-first default behavior
    - optional HITL boundaries configurable at package/seam/other governance levels
  - blocking/HITL/critical-decision events need multi-surface notification and a chat-thread-based resolution flow
  - next subtopic: exact automated gate checks for each promotion class
- What should remain package-overseer-only:
  - bounded local execution supervision
  - package-level worker dispatch / review cadence
  - package-local remediation recommendations
- Which issue classes require corroboration:
  - missing wiring
  - implementation quality concerns
  - unmet intent despite passing tests
  - missing spec / hidden dependency
  - graph structure insufficiency
- Which Orchestrator seam should lead the discussion:
  - runtime ownership boundary
  - page/tab IA
  - blocked/remediation UX
  - lineage across graph/evidence/history/usage
- Is `Overseer` still an intended user-visible / doc-visible concept, or legacy phrasing that should be collapsed into Orchestrator/runtime language?
- Should Orchestrator be understood primarily as:
  - a run control tower
  - a scheduler projection surface
  - a cross-artifact navigation hub
  - or all three with explicit boundaries?
- How much authority should the page layer have for live-status field naming versus binding directly to canonical runtime/storage contracts?
- Do-not-forget downstream topics introduced by the user:
  - settings GUI must surface execution-object-level provider/model and overseer policies
  - worktree behavior is central, not peripheral
  - persona assignment has to distinguish explicit overseer roles from dynamic node-worker selection
- Immediate next design seam:
  - projection ownership by surface:
    - Project page
    - Dashboard
    - Orchestrator
    - Source Control
    - chat resolution thread
- Additional projection/UI constraints from the user:
  - Source Control worktree area likely needs top-level partitioning:
    - `Orchestrator Owned`
    - `Other`
  - the `Orchestrator Owned` section likely needs further subdivision because of worktree volume; breaking by `feature seam` is a plausible direction
  - Orchestrator page is a very high-density information surface across many tabs, so projection design must assume very large detail volume rather than a small/simple inspector
- Additional settings-spec concern from the user:
  - multi-account support likely exists conceptually/runtime-side but the settings GUI/concept may be under-specced or missing necessary configuration surfaces for it
  - treat multi-account as both a runtime-policy seam and a settings/GUI coverage gap
- User added a specific multi-account settings requirement:
  - there likely needs to be a user-configurable threshold that determines when automatic account switching occurs
  - user clarified that multi-account auto-switch should be on by default for every execution role that uses a provider:
    - node workers
    - overseers
    - assistant
    - interviewer
    - requirements-doc builder
    - effectively any provider-using execution actor
  - user wants thresholding/policy granularity by:
    - provider
    - account
    - execution role
  - user highlighted real-world account heterogeneity even within the same provider:
    - different accounts can have different quotas, rate limits, and policy constraints
    - same-provider accounts may not be fungible and may need distinct switching rules/thresholds
- Immediate next design seam:
  - define multi-account settings structure across:
    - project settings
    - run snapshot
    - attempt record
    - precedence between provider/account/execution-role rules

## Packetization Notes
- No packetization work has been done.
- `run_id` remains `null`.
- `next_run_seq` remains `1` until a later packetize step creates a run.

## Do-Not-Forget Details
- Reuse this `work_id` for continued Orchestrator research in this chat unless scope changes into a separate work item.
- Keep `meta.json` status as `active` during research.
- Update this ledger after meaningful discovery clusters, design decisions, or contradictions are found.
- Track requested vs effective runtime identity if persona/provider/model fallback becomes part of the Orchestrator discussion.
- Watch for event-name drift, local shadow schemas, and UI-layer redefinitions of runtime semantics.

## Gemini Sweep Findings

## Highest-Impact Docs
- `Plans/orchestrator-subagent-integration.md`
  - **Why impacted:** Defines the core execution model which is being replaced.
  - **Old assumption:** Strong legacy tier hierarchy (`TierContext`/`TierType`), active-agents.json state file, hardcoded subagent registries.
  - **New model pressure:** Needs to support dynamic packages/seams, distributed state (seglog/redb), and flexible overseer lanes.
- `Plans/FinalGUISpec.md`
  - **Why impacted:** The UI is tightly coupled to the tiered execution model.
  - **Old assumption:** Tiers tab, linear phase progress bars, rigid phase/task navigation.
  - **New model pressure:** Visualizing parallel lanes, package boundaries, seams, and effective identities instead of just "tasks".
- `Plans/FileSafe.md`
  - **Why impacted:** Defines the structure of the active plan and write scopes.
  - **Old assumption:** `Phase/Task/Subtask/Iteration` hierarchy is the only way to organize work; single active plan.
  - **New model pressure:** Needs to support "Pack" or "Seam" based scopes and potentially concurrent active contexts.
- `Plans/WorktreeGitImprovement.md`
  - **Why impacted:** Git worktree strategy is based on the old hierarchy.
  - **Old assumption:** One worktree per subtask, tier-based branch naming.
  - **New model pressure:** Lanes likely need persistent worktrees that span multiple "tasks" or are allocated dynamically from a pool.

## GUI / UX Impacts
- `Plans/FinalGUISpec.md`
  - **Impacted surface:** Dashboard, Settings, Interview, Wizard, Tiers Tab.
  - **Likely issue:** The "Tiers" tab is obsolete. "Phases" might still exist but "Lanes" are the new operational unit. Missing visualizations for "Overseers" and "Packages".
- `Plans/chain-wizard-flexibility.md`
  - **Impacted surface:** Wizard / Project Creation.
  - **Likely issue:** Monolithic wizard state doesn't fit the modular "Contract Pack" approach.
- `Plans/assistant-chat-design.md`
  - **Impacted surface:** Chat interface.
  - **Likely issue:** Assumes a single thread/queue. Needs to handle multi-lane concurrency and effective identity display (which overseer is talking?).
- `Plans/Run_Graph_View.md`
  - **Impacted surface:** Execution visualization.
  - **Likely issue:** Grouped-by-phase layouts are rigid. Needs a graph or swimlane view to show parallel work packages and dependencies.

## Runtime / Storage / Contract Impacts
- `Plans/orchestrator-subagent-integration.md`
  - **Impacted area:** Orchestrator state management.
  - **Likely issue:** `active-agents.json` and regex extraction are fragile and incompatible with a distributed/event-sourced model (seglog).
- `Plans/Contracts_V0.md` / `Plans/Executor_Protocol.md`
  - **Impacted area:** Pathing and addressing.
  - **Likely issue:** Canonical paths `<phase>/<task>/<subtask>` are too rigid for package/seam architecture.
- `Plans/Permissions_System.md`
  - **Impacted area:** Permission scopes.
  - **Likely issue:** Scopes likely need to be "Package" or "Seam" aware, not just Phase/Task.
- `Plans/Progression_Gates.md`
  - **Impacted area:** Gating logic.
  - **Likely issue:** Gates are currently tier-scoped. Need to be redefined around package completion or seam transitions.

## Settings / Provider / Persona / Account Impacts
- `Plans/Multi-Account.md`
  - **Likely issue:** Missing the concept of "Effective Identity" (lane-specific auth) in storage and evidence.
- `Plans/GitHub_Integration.md`
  - **Likely issue:** Assumes single repo/current context. Multi-lane might mean multi-repo or multi-context operations.
- `Plans/Personas.md`
  - **Likely issue:** Needs to define "Overseer" personas and their relation to Lanes.
- `Plans/Models_System.md`
  - **Likely issue:** Model selection might need to be lane-aware (e.g., a "Security Lane" might enforce a specific model).

## Worktree / SCM / Parallelism Impacts
- `Plans/WorktreeGitImprovement.md`
  - **Likely issue:** The per-subtask worktree model is too granular and slow. Parallel toggles vs Lane pools need reconciliation.
- `Plans/MiscPlan.md`
  - **Likely issue:** Cleanup and contamination models are weak. "Safe points" need to be rigorously defined against worktree state.
- `Plans/newfeatures.md`
  - **Likely issue:** Snapshots vs safe points ambiguity. Background agent queue needs to integrate with the new Lane scheduler.

## Cleanup Priorities
- **Priority 1 (Blocking)**
  - `Plans/orchestrator-subagent-integration.md`: The core execution model is invalid.
  - `Plans/FinalGUISpec.md`: The "Tiers" tab and linear navigation are fundamentally wrong for the new model.
  - `Plans/FileSafe.md`: The strict Phase/Task/Subtask hierarchy prevents package-based planning.
- **Priority 2 (Misleading)**
  - `Plans/Run_Graph_View.md`: Visuals are outdated but concepts of dependencies remain.
  - `Plans/WorktreeGitImprovement.md`: Specific branching strategy is obsolete, but the need for worktrees remains.
- **Priority 3 (Terminology)**
  - `Plans/Glossary.md`, `Plans/Decision_Policy.md`, `Plans/Crosswalk.md`: Need to adopt Seam/Lane/Overseer/Package terminology.

## Contradictions To Resolve
- **Worktree Strategy:** `chain-wizard-flexibility.md` mentions "explicit no-worktrees" while `WorktreeGitImprovement.md` details "per-subtask worktrees".
  - *Why it matters:* Fundamental to performance and isolation strategy.
- **Memory/State:** `assistant-memory-subsystem.md` forbids orchestrator memory, but `newfeatures.md` implies a system-prompt loop with state.
  - *Why it matters:* Defines how smart the orchestrator can be and where state lives.
- **State Authority:** `active-agents.json` (Orchestrator local) vs `seglog`/`redb` (Storage event sourcing).
  - *Why it matters:* Split brain risk. The system cannot have two sources of truth for execution state.

## Suggested Research Follow-Ups
- **Lane Mapping:** How do we map "Lanes" to "Worktrees" exactly? Is it 1:1, or dynamic allocation?
- **Pathing:** What replaces the "Phase/Task/Subtask" path on disk? (Package ID? Seam ID?)
- **Identity Persistence:** How does "Effective Identity" persist across tool calls in a stateless protocol?

## Opus 4.6 Sweep Findings

Model-wave synthesis from Claude Opus 4.6 fleet sweep across Plans/**. Focuses on Orchestrator-model impact from the transition away from Phase/Task/Subtask/Iteration tier hierarchy toward a node-graph / work-package / feature-seam execution model.

## Highest-Impact Docs

- **`Plans/orchestrator-subagent-integration.md`** — Highest pressure of any doc (1201 legacy term hits, 8 addenda). Core body still defines `TierContext`, `TierType`, `select_for_tier`, and a `tier_id`-keyed `active-agents.json` state file. Addenda (2026-03-06 onward) bolt on persona/effective-runtime, scheduler, and remediation concepts but never replace the tier-rooted execution model. Classic split-brain: body is tier-canonical, addenda are node-adjacent.
- **`Plans/FinalGUISpec.md`** — 22 addenda accumulated. Body defines Tiers tab, phase/task/subtask progress bars (3-bar layout), and `widget.tier_tree` as a primary Orchestrator surface. Later addenda introduce dashboard widget grid, rendering surface, scheduler/blocked GUI, but never reconcile the Tiers tab itself. The tab name, progress bar structure, and navigation model all assume linear phase progression.
- **`Plans/Widget_System.md`** — `widget.tier_tree` (Phase/Task/Subtask tree with state badges) and `widget.progress_bars` (phase/task/subtask completion bars) are load-bearing catalog entries. No package/seam/lane-aware widget equivalents exist. The catalog will need new widgets or significant rework of these two.
- **`Plans/Run_Graph_View.md`** — 273 node/graph term hits but 52 legacy tier hits. Grouped-by-phase layouts are rigid. The doc is the closest to node-aware but still frames visualization through a phase lens. Needs swimlane/package-group views.
- **`Plans/orchestrator-subagent-integration.md` + `Plans/Crosswalk.md` + `Plans/Glossary.md`** — Crosswalk and Glossary have near-zero coverage of overseer (package or seam), work package, feature seam, lane, attempt, or effective identity. These are the terminology authorities and their silence makes every other doc's usage inconsistent.
- **`Plans/00-plans-index.md`** and **`Plans/feature-list.md`** — feature-list has 13 addenda and 63 legacy tier hits. Many feature entries still describe tier-scoped behavior. The index links to docs whose execution models are now divergent.

## GUI / UX Impacts

- **Tiers tab is obsolete as specified.** `widget.tier_tree` renders a Phase/Task/Subtask tree; `widget.progress_bars` renders 3 phase-scoped bars. These widgets have no package/seam/lane counterpart in the catalog.
- **Dashboard → Orchestrator attention flow is under-specified.** FinalGUISpec mentions `widget.orchestrator_status` and `widget.current_task` on the Dashboard, but the navigation path from Dashboard summary → Orchestrator detail → active chat thread lacks a defined contract. Which overseer's thread? Which lane's state?
- **Chat thread identity is single-threaded.** `assistant-chat-design.md` shows subagent blocks in thread history but assumes one execution context per thread. Multi-lane concurrency (package overseer A vs. seam overseer B) has no thread-routing model.
- **Wizard/Interview output mismatch.** `chain-wizard-flexibility.md` §11 declares sharded plan-graph nodes as canonical output, but §6.2.3 still frames Interview output as Phase/Task/Subtask/Iteration. The wizard produces the graph that the Orchestrator consumes — this split directly propagates into GUI.
- **HITL approval model assumes tier boundaries.** `human-in-the-loop.md` defines pause gates at phase/task/subtask completion. Under package/seam governance, approval boundaries are package-complete or seam-complete, neither of which maps to the existing HITL toggle set.
- **Run_Graph_View needs layout overhaul.** Grouped-by-phase is the only layout. Package-group swimlanes, seam boundaries, and parallel lane visualization are absent.

## Runtime / Storage / Contract Impacts

- **`active-agents.json` is incompatible with event-sourced state.** The orchestrator body uses a flat JSON file for agent tracking. The storage plan and addenda reference seglog/redb as canonical event stores. Two sources of truth = split-brain risk.
- **Canonical pathing `<phase>/<task>/<subtask>` is embedded in contracts.** `Contracts_V0.md` and `Executor_Protocol.md` use tier-based paths for addressing. No package-id or seam-id pathing exists.
- **Progression gates are tier-scoped.** `Progression_Gates.md` validates plan-graph structure but gates are phase/task boundaries. Package-complete and seam-complete gates are undefined.
- **FileSafe write scope assumes monolithic plan.** FileSafe Part B (§14.6) compiles role-specific context per Phase/Task/Subtask/Iteration. Write scope references "files declared in the active plan" — singular. Sharded node graphs under `.puppet-master/project/plan_graph/` break this assumption.
- **Prompt pipeline carries tier identity.** `Prompt_Pipeline.md` §1.2 embeds tier/mode in the run envelope and instruction bundle. No node-identity, package-identity, or lane-identity fields exist.
- **Storage-plan event names lack new fields.** 39 node/graph references exist but event schemas don't include package_id, seam_id, lane_id, attempt_id, or effective_identity fields.
- **`newfeatures.md` declares tier hierarchy permanent.** §1.1-1.2 explicitly state "four-tier hierarchy" and "no new tiers." This directly contradicts the node-graph canonical output from `chain-wizard-flexibility.md`.
- **MiscPlan cleanup policy is tier-scoped.** Runner contract (prepare/cleanup) references progress.txt, AGENTS.md, and prd.json as tier-era state files. No node-level artifact boundaries or cleanup scopes.

## Settings / Provider / Persona / Account Impacts

- **Requested vs. effective execution identity is partial.** `Multi-Account.md` defines provider-level multi-identity but has no concept of lane-specific or package-specific effective identity. `Personas.md` (line 648) mentions requested/effective visibility but only for persona, not for account/provider/model at the lane level.
- **Persona system has no overseer concept.** `Personas.md` defines personas for subagent selection but has zero references to overseer personas, package-overseer assignment, or seam-overseer assignment. The ledger's earlier research established that overseers need configurable personas — this gap is unaddressed.
- **Model selection is not lane-aware.** `Models_System.md` has 12 node/graph references but no lane-level or package-level model binding. A security-focused lane enforcing a specific model has no mechanism.
- **Per-execution-level settings are missing.** The ledger's research established that feature-seam, work-package, and node should each have independent provider/model/effort settings with defaults plus overrideability. No plan doc defines this settings surface.
- **GitHub integration assumes single repo context.** Multi-lane execution may span branches or worktrees pointing at different states. `GitHub_Integration.md` has no multi-context model.

## Worktree / SCM / Parallelism Impacts

- **Per-subtask worktree model is legacy.** `WorktreeGitImprovement.md` has 121 legacy tier hits vs. 4 node/graph hits. Branching strategy is `tier_id`-keyed. The emerging model wants package-based lane pools with dynamic allocation.
- **Safe-point / restore policy exists but is tier-bound.** `WorktreeGitImprovement.md` §1 defines worktree-native safe points with retry-from-safe-point semantics, and `MiscPlan.md` §1572+ ensures runner cleanup respects them. However, safe points reference "the originating attempt lineage" without defining attempt in a lane/package context.
- **Contamination policy is weak.** No doc defines what happens when a worktree allocated to lane A gets partially committed work from a failed attempt and needs to be reassigned to lane B. The safe-point mechanism handles retry within one lineage but not cross-lane reuse.
- **`chain-wizard-flexibility.md` mentions "explicit no-worktrees"** while `WorktreeGitImprovement.md` details per-subtask worktrees. This contradiction (also flagged by Gemini sweep) is unresolved and fundamental to isolation strategy.
- **Parallel toggles vs. lane pools.** `newfeatures.md` describes background agent queues and snapshot-based recovery. These are single-context concurrency mechanisms, not multi-lane parallelism. The gap between "concurrent agents in one workspace" and "isolated lanes with dedicated worktrees" is undefined.

## Cleanup Priorities

- **P0 — Blocking execution model conflicts:**
  - `orchestrator-subagent-integration.md`: Body-vs-addenda split-brain on tier vs. node execution. The 8 addenda never replace `TierContext`/`TierType`/`select_for_tier`. Needs a single coherent execution model section.
  - `newfeatures.md` §1.1-1.2 "no new tiers" declaration directly contradicts `chain-wizard-flexibility.md` §11 sharded-node canonical output. One of these positions must yield.
  - `Glossary.md`: Zero definitions for overseer (package or seam), work package, feature seam, lane, attempt, effective identity. Every other doc's usage of these terms is ungrounded.

- **P1 — Misleading GUI/widget specs:**
  - `FinalGUISpec.md`: Tiers tab, 3-bar progress, `widget.tier_tree` are specified in detail but describe a defunct model. Addenda pile-up (22) makes the doc hard to navigate.
  - `Widget_System.md`: `widget.tier_tree` and `widget.progress_bars` catalog entries need replacement or respecification for package/seam/lane groupings.
  - `Orchestrator_Page.md`: Tab layout (Progress/Tiers/Node Graph/Evidence/History/Ledger) needs Tiers→Packages or similar rename plus content respec.

- **P2 — Contract/storage field gaps:**
  - `Contracts_V0.md`, `Executor_Protocol.md`: Add node_id, package_id, seam_id, lane_id, attempt_id, effective_identity to addressing and event schemas.
  - `storage-plan.md`: Event schemas need the same new fields.
  - `Prompt_Pipeline.md`: Run envelope / instruction bundle needs node-identity alongside or replacing tier-identity.

- **P3 — Addenda consolidation:**
  - `FinalGUISpec.md` (22 addenda), `orchestrator-subagent-integration.md` (8 addenda), `feature-list.md` (13 addenda) all have duplicate or overlapping addenda that create conflicting local authorities. These need merge-and-dedup passes.

## Contradictions To Resolve

1. **Tier permanence vs. node-graph canon.** `newfeatures.md` §1.1-1.2 declares four-tier hierarchy permanent. `chain-wizard-flexibility.md` §11 declares sharded node graph canonical. These are mutually exclusive execution models.
2. **Single Overseer vs. package + seam overseers.** `orchestrator-subagent-integration.md` body defines one Overseer role within the Orchestrator. Ledger research established package overseers + seam overseers as the target. No plan doc reflects the dual-overseer model.
3. **Worktree on vs. worktree off.** `chain-wizard-flexibility.md` references explicit no-worktrees mode. `WorktreeGitImprovement.md` specifies per-subtask worktrees as mandatory isolation. No doc defines when each applies.
4. **Automation-first vs. manual HITL defaults.** `human-in-the-loop.md` defaults all HITL toggles to OFF (automation-first), but the approval model assumes tier-boundary pauses that imply manual review is the expected pattern at phase transitions. The default posture and the UX design pull in opposite directions.
5. **Memory prohibition vs. stateful orchestration.** `assistant-memory-subsystem.md` uses NullMemoryProvider for all non-Assistant agents including Orchestrator. `newfeatures.md` implies a system-prompt loop carrying state. If the Orchestrator has no memory, how does it maintain coherence across packages?
6. **`active-agents.json` vs. seglog/redb.** Body of orchestrator doc uses a flat file. Storage plan and addenda use event-sourced stores. Both claim to be the source of truth for execution state.
7. **FileSafe monolithic plan vs. sharded node graph.** FileSafe write scope references "the active plan" (singular). Node-graph execution has many concurrent node scopes under `.puppet-master/project/plan_graph/`. Write-scope resolution is undefined for multi-node concurrent execution.

## Suggested Research Follow-Ups

1. **Package/seam overseer spec.** Define the dual-overseer governance model (package overseer + seam overseer) in a canonical doc. Include: spawning rules, validation subagent pair, escalation paths, persona/model assignment.
2. **Widget catalog refresh.** Design replacements for `widget.tier_tree` and `widget.progress_bars` that visualize packages, seams, lanes, and parallel execution. Determine if the Tiers tab is renamed or replaced.
3. **Effective identity contract.** Define how requested vs. effective execution identity (provider, model, account, persona) is tracked, stored, and displayed at each governance level (node, package, seam, lane).
4. **Lane ↔ worktree mapping.** Determine whether lanes get 1:1 dedicated worktrees, draw from a pool, or use a hybrid. Define contamination detection and safe-point restore for cross-lane worktree reuse.
5. **Pathing migration.** Design the replacement for `<phase>/<task>/<subtask>` canonical paths. Candidates: `<package_id>/<node_id>`, `<seam_id>/<package_id>/<node_id>`, or content-addressed.
6. **Addenda consolidation pass.** FinalGUISpec (22), orchestrator-subagent-integration (8), and feature-list (13) need merge-and-dedup. Determine ownership: which addenda content should live in the body vs. be retired.
7. **HITL boundary redesign.** Redefine approval gates for package-complete and seam-complete events rather than phase/task/subtask boundaries. Address automation-first default vs. the UX expectation of manual review.
8. **Dashboard → Orchestrator → Thread attention flow.** Specify the navigation contract: which widget click leads where, which overseer's thread opens, how lane context is carried through the navigation.

## Sonnet 4.6 Sweep Findings

Model-wave synthesis from Claude Sonnet 4.6 fleet sweep across `Plans/**`. Sonnet strongly reinforces the node-graph transition pressure already seen in earlier waves, but it surfaced especially sharp gaps in schema anchors, requested-vs-effective execution identity, worktree/lane visibility, and policy-layer terminology ownership.

## Highest-Impact Docs

- **`Plans/orchestrator-subagent-integration.md` + `Plans/Executor_Protocol.md` + `Plans/Contracts_V0.md`**
  - **Why impacted:** These are the runtime truth owners for scheduling, attempts, blocked states, safe points, and execution identity.
  - **Old assumption:** Single Overseer, tier-rooted execution, phase/task/subtask framing, lexicographic or tier-centric dispatch inputs.
  - **New model pressure:** Need explicit package/seam/lane/package-overseer/seam-overseer support, scored ready-set scheduling, requested/effective account identity, and package-safe remediation lineage.

- **`Plans/FinalGUISpec.md` + `Plans/Run_Graph_View.md` + `Plans/Widget_System.md`**
  - **Why impacted:** These define the Orchestrator-facing UI and its primary widgets.
  - **Old assumption:** Tiers tab, `widget.tier_tree`, grouped-by-phase graph layouts, one current task/worker/worktree at a time.
  - **New model pressure:** Must visualize packages, seams, lanes, contamination state, promotion state, and multiple concurrent overseer/worker identities.

- **`Plans/storage-plan.md` + `Plans/usage-feature.md` + `Plans/assistant-memory-subsystem.md`**
  - **Why impacted:** These are the storage/projection backbone.
  - **Old assumption:** Run/tier/session/thread are the main runtime scopes; one project active at a time; account identity is optional or implicit.
  - **New model pressure:** Need package/seam namespaces, lane/worktree state, contamination events, package-aware usage attribution, and clearer AutoRunBoundary semantics under node/package execution.

- **`Plans/FileSafe.md` + `Plans/WorktreeGitImprovement.md` + `Plans/newtools.md`**
  - **Why impacted:** These govern worktree isolation, write-scope safety, live-run artifacts, and PM-managed side-effect repos.
  - **Old assumption:** Per-subtask worktrees, singular active worktree, project-root artifact paths, and ad-hoc runtime side effects.
  - **New model pressure:** Need package-based lane pools, contamination classification, safe-point-aware live sessions, lane-scoped evidence roots, and Source Control visibility for PM-owned worktrees like template repos.

- **`Plans/Glossary.md` + `Plans/Crosswalk.md` + `Plans/Decision_Policy.md` + `Plans/00-plans-index.md`**
  - **Why impacted:** These are the terminology and ownership authorities.
  - **Old assumption:** Tier vocabulary and pre-existing runtime primitives are sufficient.
  - **New model pressure:** Missing canonical terms and owners for feature seam, work package, package/seam overseers, promotion classes, lane pools, contamination, safe points, and effective execution identity.

## GUI / UX Impacts

- **Tiers-first UI is now misleading.** The Tiers tab, `widget.tier_tree`, phase-grouped graph layouts, and single-current-task widgets all assume execution authority still lives in the tier hierarchy instead of the node/package/seam graph.
- **Attention routing is incomplete.** Sonnet repeatedly found missing or weak routing between Dashboard, Orchestrator, and chat-thread surfaces for blocked states, live-run status, Docker/registry side effects, FileSafe blocks, and optional HITL boundaries.
- **Requested vs effective identity is only partially visible.** Persona/platform/model mismatches are sometimes surfaced, but effective account, lane/worktree, overseer class, and package/seam scope are generally absent from UI contracts.
- **Optional HITL boundaries lack consistent UI treatment.** Existing approval surfaces assume mandatory or tier-boundary review; Sonnet found no unified contract for package-complete, seam-complete, or mandatory side-effect gates.
- **Source Control / Orchestrator worktree visibility is underdefined.** Multiple docs assume one active worktree while the emerging model requires PM-owned worktrees, lane pools, and package-level worktree state to be visible and navigable.

## Runtime / Storage / Contract Impacts

- **Schema contradictions are already live.**
  - `selection_rule = "lexicographic_node_id"` is hard-coded in graph schemas while runtime scheduler addenda define a scored tuple with lexicographic node ID only as the final tiebreak.
  - `HandoffMessage`, graph breadcrumbs, and multiple payloads still use `phase_id` / `task_id` vocabulary where node/package/seam identity is now required.
  - `ProviderRequestEnvelope` and prompt-handoff contracts are split between older V0 anchor tables and newer addenda carrying node/attempt/safe-point fields.
- **Safe-point vs restore-point vs rollback is still not normalized.** Sonnet found the concepts referenced across runtime, policy, interview, and worktree docs, but rarely defined together in one canonical contract.
- **Contamination is a major gap.** Worktree contamination, lane contamination, and restore scope are implied by blocked-reason codes and safe-point rules, but there is no shared event family or state object for contamination itself.
- **Package/seam/lane state is missing from storage.** No coherent `packages` namespace, no lane-pool registry, weak or absent `project_id` scoping in many event and artifact contracts, and insufficient usage/evidence attribution fields for multi-package runs.
- **Blocked payload normalization is inconsistent.** Legacy `reason_code` / `recovery_options[]` shapes still coexist with `blocked_reason_code` / `allowed_action_ids[]` normalization in multiple docs.

## Settings / Provider / Persona / Account Impacts

- **Multi-account fallback is structurally under-specified.** Sonnet found no canonical `requested_account` / `effective_account` shape in the main runtime identity contracts, even where requested/effective Persona and model fields are already standardized.
- **Automation-first default conflicts with existing settings defaults.** `regular`/HTE-by-default in `Run_Modes.md`, `visual_mode = auto` preferring visible runs locally, and mandatory manual gates in several flows all cut against the new automation-first posture.
- **Overseer personas are not modeled cleanly.** Package overseer and seam overseer do not have canonical Persona registry treatment or runtime identity slots in the existing Persona/model-selection contracts.
- **Docker auth is the best existing requested/effective pattern, but isolated.** `requested_auth_mode` / `effective_capabilities[]` / `effective_account_identity` in container flows point toward the right shape, but they are not generalized into the shared execution identity model.
- **Per-project/per-package configuration scope is thin.** Multiple settings systems still assume global or single-project scope when the new model needs project, package, seam, node, overseer, and delegated-subagent override layers.

## Worktree / SCM / Parallelism Impacts

- **Per-subtask worktrees conflict with package-based lane pools.** Sonnet consistently found per-subtask worktree assumptions in worktree, FileSafe, cleanup, and evidence docs, while the new model needs persistent package-scoped lane/worktree behavior.
- **One-active-worktree assumptions are everywhere.** File tree surfaces, current-worktree displays, artifact roots, and safe-point payloads frequently assume a scalar worktree, not a set of active package lanes.
- **PM-managed worktrees are invisible.** Managed Unraid template repos, live-run artifact directories, and other PM-owned git/file roots are not properly registered in Source Control / Orchestrator worktree visibility contracts.
- **Parallelism controls are the wrong shape.** Flat global concurrency caps and provider-only limits do not express per-package lane ceilings, contamination-triggered shrink, or lane-pool allocation rules.
- **SCM lineage is incomplete for node/package execution.** Many contracts carry branch/worktree data only optionally or singularly, making package-level rollback, retry, or cross-surface navigation unreliable.

## Cleanup Priorities

- **Priority 1 — Lock the runtime schema anchors**
  - Relax or replace stale graph-schema constants (`selection_rule`, tier-rooted breadcrumbs).
  - Add package/seam/lane/worktree/account identity fields to the canonical runtime/event/envelope contracts.
  - Define contamination and safe-point linkage explicitly in storage and blocked-payload contracts.

- **Priority 2 — Establish terminology and ownership**
  - Extend `Glossary.md`, `Crosswalk.md`, `Decision_Policy.md`, and `00-plans-index.md` with first-class ownership for feature seam, work package, package/seam overseers, promotion class, lane pool, contamination, and effective execution identity.
  - Clarify which docs own execution truth vs projections vs UI-only overlays.

- **Priority 3 — Rebuild UI contracts around packages/seams/lanes**
  - Replace or demote tiers-first widgets and layouts.
  - Add package/seam/lane-aware identity, worktree, and attention surfaces.
  - Define Dashboard → Orchestrator → chat-thread routing using canonical runtime objects rather than prose-only references.

- **Priority 4 — Consolidate addenda and normalize payloads**
  - Merge duplicated runtime, model, blocked-state, and worktree addenda into single authoritative sections.
  - Remove legacy `reason_code` / `recovery_options[]` drift and older singular worktree assumptions.

## Contradictions To Resolve

1. **Scored scheduler vs lexicographic schema lock.** Runtime docs define a scored ready-set; graph schemas still hard-code lexicographic node selection.
2. **Automation-first default vs HTE/visible/manual-default behavior.** `Run_Modes.md`, `newtools.md`, and several approval flows still assume interactive or visible execution as the normal baseline.
3. **Single Overseer vs package + seam overseers.** Runtime and UI docs still model one Overseer while the emerging design requires dual governance layers.
4. **Tier authority vs node/package/seam authority.** Tiers remain first-class in widgets, breadcrumbs, HITL boundaries, and state displays even where the graph is already treated as the canonical execution input.
5. **One project / one worktree / one current context vs multi-project, multi-worktree orchestration.** Several storage keys, UI assumptions, and auth flows still treat runtime context as singular.
6. **Legacy blocked payload fields vs normalized blocked-state contract.** Old and new field names coexist across Docker, runtime recovery, and policy docs.

## Suggested Research Follow-Ups

1. **Define the dual-overseer runtime model canonically.** Lock package overseer vs seam overseer authority, spawning rules, corroboration/review responsibilities, and identity/model assignment.
2. **Design the package/seam/lane schema family.** Decide which objects are persisted canonically (`package`, `seam`, `lane`, `promotion`, `review`, `resolution_thread`) and which are projections only.
3. **Unify requested vs effective execution identity.** Extend the existing requested/effective Persona/model pattern to include account, lane/worktree, and overseer class.
4. **Specify package-based worktree lane pools.** Define lane ownership, pool sizing, contamination detection, safe-point restore behavior, and Source Control visibility for PM-owned worktrees.
5. **Normalize safe-point / restore-point / rollback / contamination terminology.** Create one authoritative mapping and event taxonomy across runtime, storage, policy, and UI docs.
6. **Rebuild attention routing.** Specify the canonical event-to-surface path for blocked states, optional HITL boundaries, and side-effect approvals across Dashboard, Orchestrator, and chat-thread.
7. **Migrate the widget/tab model.** Determine what replaces `widget.tier_tree`, phase-grouped run-graph layouts, and singular current-task/current-worktree widgets.
8. **Reconcile automation-first with existing settings and gates.** Classify which gates remain mandatory HITL, which are optional boundaries, and which defaults need to flip at the settings/schema layer.

## GPT-5.2 Sweep Findings

Model-wave synthesis from GPT-5.2 fleet sweep across `Plans/**`. This pass reinforced the same high-risk Orchestrator seams as prior waves, but it was especially strong at surfacing contract drift, schema inconsistencies, and places where the rewrite already partially assumes node-graph execution without fully retiring tier-centric ownership.

## Highest-Impact Docs

- **`Plans/Contracts_V0.md` + `Plans/Executor_Protocol.md` + `Plans/Orchestrator_Page.md`**
  - **Why impacted:** These are the closest thing to the runtime SSOT for attempts, scheduler passes, blocked outcomes, safe points, UI recovery actions, and requested/effective runtime state.
  - **Old assumption:** Tier-rooted identifiers, one Overseer, HTE-by-default run modes, and partially split blocked/HITL contracts.
  - **New model pressure:** Need first-class package/seam/lane/work-package identity, effective account switching, optional HITL boundaries, and package/seam overseer roles with explicit lineage.

- **`Plans/plan_graph.schema.json` + `Plans/project_plan_node.schema.json` + `Plans/project_plan_graph_index.schema.json`**
  - **Why impacted:** These are the executable graph contracts.
  - **Old assumption:** Lexicographic node selection, weak dependency duality (`depends_on` vs `blockers/unblocks`), no package/seam/worktree/account identity.
  - **New model pressure:** Need node/package/seam/lane/promotion/safe-point fields, multi-project scoping, and alignment with scored ready-set scheduling.

- **`Plans/Run_Graph_View.md` + `Plans/FinalGUISpec.md` + `Plans/assistant-chat-design.md`**
  - **Why impacted:** These own the main operational surfaces.
  - **Old assumption:** Tiers, phase-grouped layouts, one current task/worktree/thread context, UI actions keyed to node/tier terms only.
  - **New model pressure:** Must visualize work packages, seams, blocked episodes, safe-point restore, requested/effective identity, and cross-surface attention routing.

- **`Plans/newtools.md` + `Plans/FileSafe.md` + `Plans/WorktreeGitImprovement.md` + `Plans/MiscPlan.md`**
  - **Why impacted:** These are where live execution, evidence, cleanup, FileSafe, worktrees, and side-effect repos meet runtime policy.
  - **Old assumption:** Per-subtask worktrees, project-root artifact paths, visible-mode-first local execution, ad-hoc side-effect steps, and weak contamination language.
  - **New model pressure:** Need package-based lane pools, worktree-aware evidence roots, safe-point-aware live sessions, normalized blocked payloads, and PM-owned worktree visibility in Orchestrator/SCM.

- **`Plans/storage-plan.md` + `Plans/usage-feature.md` + `Plans/Crosswalk.md` + `Plans/Glossary.md`**
  - **Why impacted:** These anchor storage, telemetry, ownership, and terminology.
  - **Old assumption:** Run/tier/session/thread are sufficient scopes, and requested/effective mostly means persona/model/platform.
  - **New model pressure:** Need explicit package/seam/lane/attempt/work-package objects, effective execution identity including account, and canonical ownership for contamination/safe-point/promotion concepts.

## GUI / UX Impacts

- **Attention flow exists, but is fragmented.** GPT-5.2 found strong pieces of Dashboard CtAs, thread badges, blocked node CTAs, and live-run cards, but no single canonical routing contract across Dashboard → Orchestrator → chat-thread.
- **Tiers-first UI is still deeply embedded.** Tiers tab assumptions, phase-grouped run-graph presets, and single-current-task widgets still act like execution authority lives in tier hierarchy rather than the node/package/seam graph.
- **Requested vs effective display is inconsistent.** Persona/model/platform mismatches are sometimes surfaced, but effective account, worktree lane, package/seam scope, and overseer role are usually missing from UI contracts.
- **Mandatory vs optional HITL is not normalized.** Docker repo creation, FileSafe approvals, Multi-Pass review, wizard attention-required, and graph-level HITL all exist, but they are not consistently classified into one boundary model.
- **Source Control / Orchestrator integration is only partially specified.** GPT-5.2 repeatedly found expectations that Orchestrator CTAs preserve worktree lineage while many UI/state docs still assume one active worktree or a single thread-scoped execution context.

## Runtime / Storage / Contract Impacts

- **Schema-level contradictions are active, not hypothetical.**
  - Graph schemas still hard-code lexicographic node ordering while runtime addenda describe scored scheduler tuples.
  - Base provider envelope/spec tables omit node/attempt/safe-point fields that later addenda require.
  - Acceptance/evidence/coverage schemas cannot yet express work-package/seam/promotion/account/lane identity cleanly.
- **Blocked-state normalization is incomplete.** GPT-5.2 repeatedly surfaced legacy `reason_code` / `recovery_options[]` drift against canonical `blocked_reason_code` / `allowed_action_ids[]` rules.
- **Safe-point policy is present but not fully modeled.** Safe-point, restore-point, rollback, and contamination are all referenced, but not unified into one canonical field/event/object family.
- **Runtime identity snapshots stop too early.** Requested/effective persona/platform/model fields exist; requested/effective account and execution identity do not.
- **Package/seam/work-package remain schema ghosts.** The runtime increasingly assumes them conceptually, but core schemas, receipts, and event families still lack the objects and IDs.

## Settings / Provider / Persona / Account Impacts

- **Automation-first conflicts with existing defaults.** `regular`/HTE defaults, `visual_mode = auto` preferring visible runs, and several mandatory approval flows all work against the desired automation-first baseline.
- **Multi-account fallback is still not a first-class contract.** GPT-5.2 found implicit multi-account surfaces and widgets, but no canonical `requested_account` / `effective_account` runtime shape.
- **Provider/persona contracts are closer to the target than account identity.** The existing requested/effective Persona/model rules are a good base, but they need extension rather than a parallel account-only system.
- **Per-project vs global settings remain mixed.** Several runtime-affecting settings are still assumed global or single-project where the emerging model needs project/package/seam/node layers.
- **Docker auth is the clearest requested/effective example.** It should likely be generalized into the shared execution identity pattern instead of remaining a domain-specific one-off.

## Worktree / SCM / Parallelism Impacts

- **Package-based lane pools are the missing parallelism contract.** Many docs already discuss worktree isolation, per-run branches, or per-subtask worktrees, but GPT-5.2 found no stable lane-pool model that unifies them.
- **One-active-worktree assumptions remain widespread.** File trees, active repo indicators, evidence roots, and restore/revert UX still assume a scalar worktree.
- **PM-owned SCM state is not fully visible.** Managed template repos, active git operations, live-run artifact roots, and worktree recovery state need stronger Orchestrator/Source Control registration.
- **Cleanup and restore semantics are not lane-aware yet.** Broad cleanup, conflict worktrees, and revert-last-edit flows still underspecify contamination scope and safe-point prerequisites.
- **Parallel caps are the wrong shape.** Thread caps, provider caps, and simple queue models exist, but package/lane-aware capacity and conflict models do not.

## Cleanup Priorities

- **Priority 1 — Fix canonical contracts and schemas**
  - Reconcile graph ordering rules, dependency representations, and blocked payload field names.
  - Add package/seam/lane/worktree/account identity fields to runtime/event/envelope/schema families.
  - Define one execution identity snapshot that covers account as well as persona/model/platform.

- **Priority 2 — Normalize policy and terminology**
  - Extend `Glossary.md`, `Crosswalk.md`, and `Decision_Policy.md` with feature seam, work package, lane pool, contamination, safe point, promotion class, and effective execution identity.
  - Normalize safe-point vs restore-point vs rollback vs contamination across runtime/storage/UI docs.

- **Priority 3 — Reframe UI around graph-native execution**
  - Replace tiers-first views and single-worktree assumptions with package/seam/lane-aware surfaces.
  - Define one attention-routing model for blocked work, optional HITL, and side-effect approvals.

- **Priority 4 — Consolidate addenda**
  - GPT-5.2 repeatedly found split-brain specs where addenda carry the correct modern model but anchor tables/body text still describe older rules.

## Contradictions To Resolve

1. **Lexicographic graph selection vs scored scheduler tuple.** Runtime addenda and graph schemas disagree on the actual canonical selection rule.
2. **Automation-first vs interactive defaults.** HTE-by-default, visible-first local runs, and mandatory review flows contradict the stated automation-first direction.
3. **Single Overseer vs package + seam overseers.** Existing runtime docs still largely model one Overseer while the emerging design needs dual governance layers.
4. **Tier identifiers vs node/package/seam identity.** Many UI, storage, and envelope contracts still key execution to tier concepts where package/node/seam IDs are now needed.
5. **Single worktree / single project context vs multi-project lane-based orchestration.** Too many surfaces and schemas still assume one active repo/worktree/thread context at a time.
6. **Requested/effective state vs requested/effective execution identity.** The model exists for persona/model/platform but not yet for account or runtime actor identity.

## Suggested Research Follow-Ups

1. **Lock the package/seam/lane object model.** Define canonical IDs, lifecycles, and schema placement for work packages, seams, lanes, promotions, reviews, and resolution threads.
2. **Extend the execution identity contract.** Add requested/effective account, overseer role, worktree/lane, and fallback reason fields to the canonical runtime snapshot.
3. **Specify package-based worktree lane pools.** Include lane allocation, SCM visibility, contamination detection, safe-point restore behavior, and cleanup boundaries.
4. **Unify attention routing.** Define how Dashboard, Orchestrator, chat-thread, and inline cards consume the same blocked/HITL/runtime event families.
5. **Reconcile automation-first with local execution UX.** Decide how `regular`, `visual_mode`, manual confirmations, and optional HITL boundaries map into one coherent mode policy.
6. **Upgrade graph/evidence schemas.** Add work-package/seam/promotion/account/lane identity to the schema bundle and align acceptance/coverage/evidence linkage.
7. **Consolidate addenda into anchor sections.** Prioritize runtime core, graph schemas, Run Graph view, newtools/FileSafe/worktree docs, and policy/terminology docs.

## GPT-5.4 Sweep Findings

Model-wave synthesis from GPT-5.4 fleet sweep across `Plans/**`. This pass surfaced the strongest contradiction map so far: not just stale terminology, but multiple places where old tier-era contracts and newer node/safe-point/runtime addenda are simultaneously marked canonical.

## Highest-Impact Docs

- **`Plans/Orchestrator_Page.md` + `Plans/Executor_Protocol.md` + `Plans/Contracts_V0.md`**
  - **Why impacted:** These remain the practical runtime/UI SSOT for execution, blocked states, recovery actions, identity visibility, terminals, and event families.
  - **What old assumption is present:** Tiers are still first-class UI and contract nouns; HITL still has tier-boundary ancestry; `AttemptJournal`/handoff payloads remain subtask/iteration-shaped; one Overseer still owns orchestration.
  - **What likely new model pressure is:** Need explicit node/package/seam/lane/promotion identity, package overseer + seam overseer authority, requested/effective execution identity including account, and package/lane-aware blocked/recovery semantics.

- **`Plans/storage-plan.md` + `Plans/usage-feature.md` + `Plans/plan_graph.schema.json` + `Plans/project_plan_node.schema.json`**
  - **Why impacted:** These define the canonical event/storage/schema backbone and are still consumed by many downstream docs.
  - **What old assumption is present:** Tier/phase/iteration events, `tier_runtime_record`, `tier_id`-based usage rollups, lexicographic graph dispatch, narrow node status enums, runtime state embedded in plan shards.
  - **What likely new model pressure is:** Need attempt-scoped runtime state, package/seam/lane/promotion fields, blocked lineage, safe-point/restore linkage, and separation between plan structure and mutable runtime projections.

- **`Plans/FinalGUISpec.md` + `Plans/Run_Graph_View.md` + `Plans/Widget_System.md` + `Plans/UI_Command_Catalog.md`**
  - **Why impacted:** These still shape the user’s primary operational mental model.
  - **What old assumption is present:** Tiers tab, phase/task/subtask trees, graph-local retry/approve/deny actions, completed-work prose by phase/task, single-current-task widgets, restore/checkpoint wording.
  - **What likely new model pressure is:** Need package/seam/lane/promotion/resolution-thread surfaces, runtime action families keyed by blocked classification, requested/effective identity including account, and separation of safe points from restore points.

- **`Plans/WorktreeGitImprovement.md` + `Plans/GitHub_Integration.md` + `Plans/Multi-Account.md`**
  - **Why impacted:** These own the hardest intersection: worktrees, SCM state, remote actions, and account resolution.
  - **What old assumption is present:** Worktree ownership is `run/tier/subtask`, branch-per-run or subtask-per-worktree flows, GitHub/project flows are wizard-centric, account switching is still mostly run/iteration-scoped.
  - **What likely new model pressure is:** Need package-based lane pools, worktree visibility shared between Source Control and Orchestrator, effective-account recording per hosted side effect, and package/seam-aware promotion boundaries.

- **`Plans/human-in-the-loop.md` + `Plans/Permissions_System.md` + `Plans/Project_Output_Artifacts.md`**
  - **Why impacted:** These define approvals, blocked states, recovery, and artifact pathing.
  - **What old assumption is present:** Tier-boundary HITL toggles, `tier_boundary_approval`, workspace sidecars under `<phase>/<task>/<subtask>`, permission `ask` behavior tied to current tier boundary.
  - **What likely new model pressure is:** Need node/package/seam/lane-bound optional HITL, canonical blocked episode actions, package/lane artifact pathing, and package/seam-aware recovery/promotion semantics.

## GUI / UX Impacts

- **Tiers are still productized even where node graph is supposed to be canonical.** GPT-5.4 repeatedly found `Tiers` as a primary tab, navigation target, widget namespace, and telemetry dimension.

- **Attention flow is fragmented across surfaces and vocabularies.** Some docs use Dashboard CtAs and blocked cards, others still use modal/toast approvals, graph-local dialogs, or inline chat actions. Resolution-thread ownership is largely missing.

- **Requested vs effective runtime display remains incomplete.** Persona/platform/model are sometimes surfaced, but effective account, fallback reason, lane/worktree identity, package/seam ownership, and overseer role are generally absent.

- **Restore language is still dangerously overloaded.** Several docs still use rollback/checkpoint/revert wording where newer addenda require safe-point-aware retry and explicit “start fresh attempt” semantics.

- **Automation-first is still undermined by approval-heavy UX defaults.** GPT-5.4 repeatedly found phase-complete approvals, manual review steps, modal confirmations, and direct-click approvals that are not yet framed as optional HITL boundaries.

## Runtime / Storage / Contract Impacts

- **Old and new scheduler contracts actively disagree.**
  - Graph schemas still fix lexicographic selection.
  - `Executor_Protocol` addenda require scored ready-set scheduling with wake reasons, lane/capacity awareness, and blocked constraints.

- **Blocked payload and recovery families are inconsistent.**
  - `allowed_actions` vs `allowed_action_ids[]`
  - `blocked_reason` vs `blocked_reason_code`
  - graph-local `Retry/Replan/Reopen/Approve/Deny` vs canonical `cmd.runtime.*` action families

- **Runtime state is stored in the wrong places.**
  - Plan-node shards and project-local JSON sidecars still act like mutable runtime sources in several docs.
  - GPT-5.4 repeatedly found newer guidance saying runtime truth belongs in seglog/redb/projections instead.

- **Primary schemas stop at node-level modeling.**
  - Acceptance, evidence, coverage, GUI automation, and test schemas can represent nodes and checks, but not work package, feature seam, lane, promotion class, contamination state, resolution thread, or effective account identity.

- **Storage/event keys are still too thin.**
  - Many contracts have `run_id`, maybe `node_id`, but still lack `project_id`, `attempt_id`, `package_id`, `seam_id`, `lane_id`, `worktree_id`, `safe_point_id`, `promotion_class`, or requested/effective account fields.

## Settings / Provider / Persona / Account Impacts

- **Multi-account is surfaced in UX before it is modeled canonically in runtime records.** GPT-5.4 found account widgets and auth panels, but almost no equivalent requested/effective account fields in runtime/storage/schema contracts.

- **Provider/persona docs still encode old orchestration ownership.** Prompt, persona, model, and provider docs still talk in phase/task/subtask/iteration terms and singular Overseer assumptions, even where runtime records already include `node_id` and `attempt_id`.

- **Fallback behavior is contradictory in core docs.**
  - Persona fallback is split between “bare-context run” and canonical fallback Persona.
  - GitHub auth retry rules conflict with multi-account failover expectations.
  - Docker/media/provider flows usually stop at provider/model, not account-resolution lineage.

- **Settings scopes are still too coarse.** Global/project toggles are common, but package/seam/lane/run/account-aware settings or policy scopes are mostly absent.

## Worktree / SCM / Parallelism Impacts

- **Package-based lane pools are still missing as a canonical concept.** GPT-5.4 found subtask/tier worktrees, branch-per-run flows, and direct merge/PR assumptions across SCM docs, but no stable lane-pool model.

- **Worktree visibility is only partially wired between Source Control and Orchestrator.** Several docs acknowledge shared visibility, yet status models still stop at repo/worktree/branch/tier rather than package/lane ownership, contamination, restore eligibility, or promotion posture.

- **Parallelism is modeled in outdated shapes.**
  - per-thread queues
  - per-provider caps
  - parallel subtasks
  - crews per tier
  None of these cleanly map to package/seam promotion or lane-pool capacity.

- **Contamination policy is still a vocabulary gap.** Safe-point language exists in newer addenda, but contamination classification, restore-before-reuse, and lane quarantine semantics are mostly absent from the main SCM/worktree contracts.

## Cleanup Priorities

- **Priority 1 — Canonical contracts that cannot safely coexist with the new model**
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/Contracts_V0.md`
  - `Plans/storage-plan.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/plan_graph.schema.json` / `Plans/project_plan_node.schema.json`

- **Priority 2 — Misleading UI/SCM/operator docs**
  - `Plans/FinalGUISpec.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/GitHub_Integration.md`
  - `Plans/Widget_System.md`
  - `Plans/UI_Command_Catalog.md`

- **Priority 3 — Terminology, routing, and anti-drift docs**
  - `Plans/00-plans-index.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/feature-list.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/Project_Output_Artifacts.md`

## Contradictions To Resolve

1. **Lexicographic node selection vs scored ready-set scheduler**
   - Docs involved: `plan_graph.schema.json`, `project_plan_graph_index.schema.json`, `Executor_Protocol.md`
   - Why it matters: this is a direct runtime-selection conflict, not terminology drift.

2. **Tier-boundary HITL vs blocked-node/runtime-overlay HITL**
   - Docs involved: `human-in-the-loop.md`, `Permissions_System.md`, `Project_Output_Artifacts.md`
   - Why it matters: approval ownership, wake semantics, and UI routing differ materially between these models.

3. **Single Overseer vs package overseer + seam overseer**
   - Docs involved: `Executor_Protocol.md`, `Orchestrator_Page.md`, `Personas.md`, `Provider_Stream_Mapping_External_Reference_A2A.md`
   - Why it matters: ownership of scheduling, review, recovery, and promotion becomes ambiguous if both persist.

4. **`requested_persona_id` vs canonical `requested_persona`**
   - Docs involved: `Orchestrator_Page.md`, `Contracts_V0.md`, related UI/runtime docs
   - Why it matters: persisted/runtime field drift is already visible and will worsen when account identity is added too.

5. **Graph-local recovery commands vs canonical runtime action families**
   - Docs involved: `UI_Command_Catalog.md`, `Wiring_Matrix.md`, `Run_Graph_View.md`, `human-in-the-loop.md`
   - Why it matters: the user can otherwise see one command family while runtime/event contracts expect another.

6. **Run/tier/subtask worktrees vs package-based lane pools**
   - Docs involved: `WorktreeGitImprovement.md`, `GitHub_Integration.md`, `feature-list.md`, `FinalGUISpec.md`
   - Why it matters: worktree lifecycle, visibility, and conflict recovery cannot be coherent if both models remain canonical.

7. **Manual review/click approval flows vs automation-first optional HITL**
   - Docs involved: `FinalGUISpec.md`, `newtools.md`, `Containers_Registry_and_Unraid.md`, `assistant-chat-design.md`
   - Why it matters: this changes default behavior, user expectations, and blocked-state routing.

## Suggested Research Follow-Ups

1. **Define the package/seam/lane/promotion object family canonically.**
   - Why it matters: GPT-5.4 found almost no owner docs that actually define these objects, even where many other contracts now depend on them.

2. **Extend requested/effective runtime identity to include account and overseer role.**
   - Why it matters: provider/persona fields exist, but effective account switching and requested/effective execution identity are still mostly unmodeled.

3. **Choose one HITL model and one action family.**
   - Why it matters: tier-boundary approvals, graph-local commands, and blocked-node runtime actions currently coexist as competing canonical mechanisms.

4. **Separate plan structure from mutable runtime state.**
   - Why it matters: GPT-5.4 repeatedly found runtime truth split across plan shards, JSON sidecars, and event/projection docs.

5. **Specify package-based worktree lane pools end-to-end.**
   - Why it matters: SCM, Source Control UI, Orchestrator UI, and recovery policy all depend on it, but no single canonical lane-pool model exists yet.

6. **Normalize recovery vocabulary across safe point, restore point, rollback, contamination, and retry.**
   - Why it matters: GPT-5.4 found these concepts partially modernized but still inconsistently named and scoped across plans.

## GPT-5.3-Codex Sweep Findings

## Highest-Impact Docs

- `Plans/Orchestrator_Page.md`
  - why impacted: still acts like a primary runtime owner for orchestration UX and identity projection.
  - what old assumption is present: `Tiers`, `Phase/Task/Subtask`, singular `Overseer`, and `requested_persona_id` / `effective_persona_id`.
  - what likely new model pressure is: package/seam overseers, package/seam/lane visibility, promotion-class state, requested vs effective execution/account identity.

- `Plans/Executor_Protocol.md`
  - why impacted: still encodes singular scheduler/transition authority and older dispatch assumptions.
  - what old assumption is present: one `Overseer`, lexicographic-style canonical selection language, tier-era ownership.
  - what likely new model pressure is: scored ready-set scheduling, lane pools, package/seam governance split, contamination and safe-point-aware recovery.

- `Plans/Contracts_V0.md`
  - why impacted: core runtime contract already shows drift against UI/runtime consumers.
  - what old assumption is present: tier-boundary HITL payloads, incomplete execution identity, no account fallback fields.
  - what likely new model pressure is: requested/effective account identity, package/seam/lane/promotion objects, blocked/recovery payload normalization.

- `Plans/human-in-the-loop.md` and `Plans/Project_Output_Artifacts.md`
  - why impacted: these still define approval boundaries and workspace/storage identity in legacy terms.
  - what old assumption is present: HITL at tier boundaries, workspace paths under `<phase>/<task>/<subtask>`, deprecated `allowed_actions[]` usage still lingering.
  - what likely new model pressure is: optional HITL boundaries at node/package/seam promotions, lane/worktree identity, mid-run blocked-resolution routing, automation-first default.

- `Plans/WorktreeGitImprovement.md`
  - why impacted: still the main SCM/worktree execution owner.
  - what old assumption is present: `tier_id` / subtask worktree ownership, branch-per-tier flow, merge fallback posture, parallel subtasks as primary parallelism model.
  - what likely new model pressure is: package-based lane pools, contamination quarantine, restore-before-reuse policy, Source Control plus Orchestrator shared visibility.

- `Plans/Run_Graph_View.md`
  - why impacted: graph UI is still heavily tier-shaped even where runtime addenda have modernized.
  - what old assumption is present: `TierTree`, `tier_type`, `View in Tiers`, phase/task/subtask grouping.
  - what likely new model pressure is: first-class seam/package/lane nodes, promotion-class badges, requested/effective execution identity, blocked/recovery action unification.

- `Plans/Prompt_Pipeline.md`, `Plans/Personas.md`, `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - why impacted: these still lock orchestration boundaries and oversight to the old taxonomy.
  - what old assumption is present: `Phase/Task/Subtask/Iteration`, tier-boundary audit flow, single Overseer plus fixed reviewer pattern.
  - what likely new model pressure is: package overseer plus seam overseer split, requested/effective account fallback, promotion-aware provider/event records.

- `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/project_plan_graph_index.schema.json`
  - why impacted: graph schemas are too narrow for the new runtime object family.
  - what old assumption is present: node-only lifecycle, lexicographic selection, no blocked/contaminated/restore-required states.
  - what likely new model pressure is: package/seam/lane IDs, promotion classes, safe-point and contamination lineage, requested/effective execution identity.

- `Plans/00-plans-index.md`, `Plans/Crosswalk.md`, `Plans/Glossary.md`
  - why impacted: anti-drift and ownership docs still operationalize the legacy model.
  - what old assumption is present: tier hierarchy, singular Overseer, tier-boundary HITL, old canonical owner map.
  - what likely new model pressure is: new vocabulary canon, migration guidance, deprecation boundaries, package/seam/lane/promotion terminology ownership.

## GUI / UX Impacts

- `Plans/Orchestrator_Page.md`, `Plans/Run_Graph_View.md`, `Plans/Widget_System.md`, `Plans/GUI_Rebuild_Requirements_Checklist.md`
  - impacted surface: Orchestrator page, run graph, widget registry, rebuild checklist.
  - likely issue: UI still presents `Tiers` as a primary mental model and lacks first-class work package, feature seam, lane, promotion, contamination, and resolution-thread surfaces.

- `Plans/FinalGUISpec.md`, `Plans/assistant-chat-design.md`, `Plans/chain-wizard-flexibility.md`
  - impacted surface: Dashboard / chat / interview and chain wizard flows.
  - likely issue: attention routing is thread-local or wizard-local, not explicitly Dashboard -> Orchestrator -> chat-thread for blocked and major-decision paths.

- `Plans/UI_Command_Catalog.md`, `Plans/Wiring_Matrix.md`
  - impacted surface: runtime actions and UI control wiring.
  - likely issue: old `cmd.graph.*` recovery actions coexist with canonical `cmd.runtime.*`, and current command envelopes cannot express seam/package/lane promotion actions.

- `Plans/GitHub_Integration.md`
  - impacted surface: Source Control and GitHub worktree views.
  - likely issue: row ownership is still `run/tier`, not package-lane ownership, so Orchestrator and Source Control cannot share a coherent worktree model.

## Runtime / Storage / Contract Impacts

- `Plans/Contracts_V0.md` vs `Plans/Orchestrator_Page.md`
  - impacted contract/runtime/storage area: identity fields.
  - likely issue: `requested_persona` / `effective_persona` are canonical in contracts, but UI still uses `_id` variants; account fallback fields are missing entirely.

- `Plans/Contracts_V0.md` vs `Plans/human-in-the-loop.md`
  - impacted contract/runtime/storage area: HITL request schema.
  - likely issue: `allowed_actions[]` and `allowed_action_ids[]` both appear as canonical depending on document, which will break blocked-action parity.

- `Plans/plan_graph.schema.json`, `Plans/project_plan_node.schema.json`, `Plans/test_strategy.schema.json`, `Plans/evidence.schema.json`, `Plans/gui_automation_manifest.schema.json`
  - impacted contract/runtime/storage area: graph and evidence schemas.
  - likely issue: schemas remain run/node/tier-scoped, with no seam/package/lane/promotion/account lineage and no contamination or safe-point restore provenance.

- `Plans/storage-plan.md`, `Plans/Project_Output_Artifacts.md`
  - impacted contract/runtime/storage area: persisted object identity and workspace layout.
  - likely issue: state and artifact paths still preserve old tier/workspace assumptions and need per-project, per-run, per-package/lane scoping.

- `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/Run_Graph_View.md`
  - impacted contract/runtime/storage area: scheduling and blocked/recovery lifecycle.
  - likely issue: lexicographic dispatch, scored scheduler, blocked overlays, and graph-local retry families still coexist without one canonical model.

## Settings / Provider / Persona / Account Impacts

- `Plans/Models_System.md`, `Plans/Prompt_Pipeline.md`, `Plans/Personas.md`
  - likely issue: requested/effective platform/model/persona are modeled, but requested/effective account identity and fallback reason are missing.

- `Plans/Provider_Stream_Mapping_External_Reference_A2A.md`
  - likely issue: tier-boundary and single-Overseer audit rules are too rigid for package/seam overseers and automation-first execution.

- `Plans/Multi-Account.md`, `Plans/GitHub_API_Auth_and_Flows.md`, `Plans/GitHub_Integration.md`
  - likely issue: multi-account behavior exists in slices, but active/effective account switching is not carried through repo/project/worktree execution contracts.

- `Plans/newtools.md`, `Plans/assistant-chat-design.md`
  - likely issue: provider/model controls remain per-thread or per-run and do not expose requested/effective execution identity across package, seam, node, and delegated subagent layers.

## Worktree / SCM / Parallelism Impacts

- `Plans/WorktreeGitImprovement.md`
  - likely issue: worktree ownership is still tier/subtask-native and does not support package-based lane pools or contamination quarantine.

- `Plans/GitHub_Integration.md`
  - likely issue: Source Control ownership and GitHub actions remain branch/worktree-centric, without package/seam/lane-aware visibility.

- `Plans/feature-list.md`, `Plans/newfeatures.md`, `Plans/MiscPlan.md`
  - likely issue: completion, cleanup, concurrency, and queueing are still framed around tiers, runs, and threads instead of package lanes and promotion boundaries.

- `Plans/assistant-chat-design.md`
  - likely issue: execution ordering is thread FIFO with small queues, which misfits package-lane parallelism and multi-project concurrent orchestration.

## Cleanup Priorities

- priority 1
  - docs that cannot safely coexist with the new model
  - `Plans/Orchestrator_Page.md`
  - `Plans/Executor_Protocol.md`
  - `Plans/Contracts_V0.md`
  - `Plans/human-in-the-loop.md`
  - `Plans/WorktreeGitImprovement.md`
  - `Plans/plan_graph.schema.json`
  - `Plans/project_plan_node.schema.json`

- priority 2
  - docs that are misleading but not immediately blocking
  - `Plans/FinalGUISpec.md`
  - `Plans/Run_Graph_View.md`
  - `Plans/GitHub_Integration.md`
  - `Plans/Widget_System.md`
  - `Plans/UI_Command_Catalog.md`
  - `Plans/newtools.md`
  - `Plans/assistant-chat-design.md`

- priority 3
  - docs that mostly need terminology / projection cleanup
  - `Plans/00-plans-index.md`
  - `Plans/Crosswalk.md`
  - `Plans/Glossary.md`
  - `Plans/feature-list.md`
  - `Plans/OpenCode_Coverage_Matrix.md`
  - `Plans/usage-feature.md`
  - `Plans/auto_decisions.schema.json`

## Contradictions To Resolve

- contradiction
  - docs involved: `Plans/Contracts_V0.md`, `Plans/Orchestrator_Page.md`
  - why it matters: canonical persona field names already disagree before account identity is added.

- contradiction
  - docs involved: `Plans/Contracts_V0.md`, `Plans/human-in-the-loop.md`
  - why it matters: blocked action IDs cannot be wired safely while both `allowed_actions[]` and `allowed_action_ids[]` remain canonical.

- contradiction
  - docs involved: `Plans/Executor_Protocol.md`, `Plans/Progression_Gates.md`, `Plans/plan_graph.schema.json`, `Plans/Run_Graph_View.md`
  - why it matters: scheduler truth is split between lexicographic, scored, and UI-derived recovery models.

- contradiction
  - docs involved: `Plans/human-in-the-loop.md`, `Plans/Project_Output_Artifacts.md`
  - why it matters: one doc says HITL is tier-boundary only while another allows mid-tier approval nodes.

- contradiction
  - docs involved: `Plans/WorktreeGitImprovement.md`, `Plans/GitHub_Integration.md`, `Plans/feature-list.md`
  - why it matters: current SCM ownership is tier- and branch-based, which collides with package-lane worktree pools.

- contradiction
  - docs involved: `Plans/Containers_Registry_and_Unraid.md`
  - why it matters: `needs_review` and blocked/failure payload semantics disagree inside the same doc, which will leak into automation-first operator flows.

- contradiction
  - docs involved: `Plans/sharding_config.json`, `Plans/auto_decisions.jsonl`
  - why it matters: fallback chunk-line settings disagree, showing state/decision drift even in supporting planning machinery.

## Suggested Research Follow-Ups

- follow-up question
  - why it matters: define one canonical field envelope for `{project, run, seam, package, node, attempt, lane, promotion, review, resolution_thread}` so schemas stop drifting independently.

- follow-up question
  - why it matters: choose whether tier terms become pure derived UI aliases or are fully deprecated in orchestration/runtime contracts.

- follow-up question
  - why it matters: decide how package overseer and seam overseer divide authority across scheduling, review, promotion, remediation, and graph patch requests.

- follow-up question
  - why it matters: formalize requested vs effective execution identity, including account fallback/switching, before more provider/chat/SCM docs extend the wrong model.

- follow-up question
  - why it matters: define package-based lane-pool worktree policy end-to-end, including contamination, safe-point, restore, and visibility rules shared by Orchestrator and Source Control.

- follow-up question
  - why it matters: unify blocked/recovery action families so UI, runtime, and chat-thread resolution all point to the same canonical actions.
