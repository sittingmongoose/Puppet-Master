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
- Orchestrator page shell direction clarified by user:
  - Orchestrator should remain tab-first, not widget-first
  - `Progress` remains the first tab and is the tab that contains orchestrator widgets
  - existing `Tiers` tab should be replaced by a seam/package-oriented tab (name still open; likely `Seams` or equivalent)
  - `Node Graph Display` tab remains, but must evolve to show graph-patch lineage:
    - old invalidated/superseded nodes remain visible
    - old nodes stay clickable for historical detail
    - patched generations branch from the old path
    - live path may later rejoin surviving downstream nodes
  - `Evidence` tab remains but needs major redesign
  - `History` and `Ledger` both remain candidates, but merging them is on the table
  - all Orchestrator tabs need substantial redesign around the new model
- Widget-system implication clarified:
  - Orchestrator widgets live inside the `Progress` tab
  - some orchestrator widgets may also be hostable on Dashboard
  - non-Orchestrator widgets should not be hostable on the Orchestrator page
  - widgets remain resizable/customizable, but tab-first structure remains primary
- Old composite-reference check confirms:
  - the historical Orchestrator shell already used:
    - `Progress`
    - `Tiers`
    - `Node Graph Display`
    - `Evidence`
    - `History`
    - `Ledger`
  - `Progress` already functioned as the widget-hosting operational tab
  - the old shell reinforces the current redesign direction:
    - preserve tab-first structure
    - replace `Tiers` with a seam/package-oriented tab
    - keep the widget model anchored inside `Progress`
- Orchestrator tab redesign direction is now materially clearer:
  - keep tabs separate:
    - `Progress`
    - `Seams` (replacement for `Tiers`)
    - `Node Graph`
    - `Evidence`
    - `History`
    - `Ledger`
  - `Progress` is the widget-hosting operational summary tab
  - `Seams` is hierarchical seam-first, package-second, node-on-drill-in
  - `Evidence` should use separate panes:
    - evidence records pane
    - artifact pane
  - `History` and `Ledger` should remain separate:
    - `History` = chronological runtime story
    - `Ledger` = structured record inspection
- Progress-tab widget direction is now firmer:
  - err on the side of more orchestrator widget options rather than fewer
  - user can disable/hide widgets they do not want
  - strong candidate/core widget catalog now includes:
    - Run Status
    - Current Activity
    - Attention / Blockers
    - Seam Health
    - Package Activity
    - Promotion Queue
    - Worktree Lanes
    - Account / Usage Pressure
    - Recent Major Events
    - Overseer Activity
    - Corroboration Queue
    - Recovery State
    - Throughput / Capacity
- Default Progress-widget drill targets were made deterministic:
  - Run Status -> `History`
  - Current Activity -> `Node Graph`
  - Attention / Blockers -> `Node Graph`
  - Seam Health -> `Seams`
  - Package Activity -> `Seams`
  - Promotion Queue -> `Ledger`
  - Worktree Lanes -> `Node Graph`
  - Account / Usage Pressure -> `Usage`
  - Recent Major Events -> `History`
  - Overseer Activity -> `Seams`
  - Corroboration Queue -> `Evidence`
  - Recovery State -> `Evidence`
  - Throughput / Capacity -> `History`
- Seams-tab structure direction is now clearer:
  - top level = `Feature Seams`
  - second level = `Work Packages`
  - nodes should appear as summaries/problem drill-ins rather than the default list shape
  - Seams detail panel should emphasize governance/completion/integration truth rather than raw node execution churn
- Node Graph tab direction was extended beyond lineage:
  - graph canvas + right-side detail inspector
  - detail inspector should expose:
    - requested/effective provider/model/effort/persona/account
    - usage/token/cost info
    - worker policy (agent/subagent, fresh/reused, spawn path)
    - retry/review/promotion state
    - lane/worktree/snapshot state
    - linked evidence/artifacts
  - clicking evidence/artifact links in graph detail should deep-link into the Evidence tab with target selection/filter applied
- Evidence tab redesign direction is now much sharper:
  - separate panes:
    - `Evidence` pane for verdicts/receipts/findings/reports
    - `Artifacts` pane for screenshots/recordings/diffs/reports/generated docs/etc.
  - evidence and artifacts should remain linked bidirectionally
  - usage-linked receipts are expected when relevant
- History vs Ledger distinction is now explicit:
  - `History` = chronological story/timeline of execution, governance, promotion, recovery, account switching, graph patches
  - `Ledger` = structured durable record inspection (attempts, reviews, corroboration, promotions, graph patches, recovery records, learnings, usage-linked receipts)
- Inspector/full-record split direction now exists:
  - right-side inspectors should stay summary/action oriented
  - dense objects should open full-record views
  - especially:
    - attempt handoff artifacts
    - review records
    - corroboration records
    - graph patch requests
    - state transition reports
    - promotion records
    - recovery records
- Cross-tab navigation is now treated as a real contract:
  - object/event focus should deep-link across Progress / Seams / Node Graph / Evidence / History / Ledger
  - deep links should carry selection/filter/focus context, not merely switch tabs
  - `Seams` and `Node Graph` should share focus context without hyperactive live-sync
- Copy/labels direction is now firmer:
  - prefer precise canonical terms in docs/runtime model
  - likely canonical tab/object labels:
    - `Seams`
    - `Feature Seam`
    - `Work Package`
    - `Package Overseer`
    - `Seam Overseer`
  - likely user-facing state/action labels:
    - `Locally Complete`
    - `Seam Complete`
    - `Completion Blocked`
    - `Weak Integration`
    - `Promotion Blocked`
    - `Promotion Revoked`
    - `Corroboration Requested`
    - `Challenge Accepted`
    - `Challenge Not Accepted`
    - `Advisory Concern Recorded`
    - `Graph Patch Requested`
    - `Graph Patch Applied`
    - `Generation Updated`
- Simple/Expert labeling strategy direction:
  - keep expert/canonical terms stable in docs
  - derive simpler labels later where needed for GUI/help
  - not every term should get dual variants; only the more technical/loaded ones
- Additional UI/copy direction now clarified:
  - `Weak Integration` should not be just a badge; Seams UI should summarize it visibly and group concerns under readable headings like:
    - Wiring
    - Workflow
    - State
    - GUI
    - Design
  - package issues should roll up to seam concerns only when they cross package/seam/user-visible boundaries or affect seam completion truth
  - seam completion should be presented distinctly from package completion and package-to-seam availability:
    - `Locally Complete`
    - `Available to Seam`
    - `Seam Complete`
  - promotions should be visible as explicit named boundaries:
    - `Lane to Package`
    - `Package to Seam`
    - `Seam Completion`
  - revocation/reopen semantics should be explicit and visible:
    - `Promotion Revoked`
    - `Seam Completion Revoked`
    - `Reopened`
    - `Reopened by Patch`
    - `Reopened by New Evidence`
  - blocked states should always expose:
    - blocked reason
    - blocked owner
    - time blocked
    - next step
  - blocked ownership should be normalized with stable labels:
    - `Runtime`
    - `Package Overseer`
    - `Seam Overseer`
    - `Corroboration`
    - `Graph Patch`
    - `Recovery`
    - `User`
    - `External Resource`
- Alert / attention model direction now clarified:
  - alert levels should roughly separate into:
    - `Info`
    - `Warning`
    - `Attention`
    - `Action Required`
  - Dashboard = summary/urgency
  - Orchestrator = detailed operational alert context
  - chat thread = only for situations that actually need user resolution/decision, not general warnings
- Event/UI mapping direction is now clearer:
  - canonical event families should remain stable:
    - `seam.*`
    - `package.*`
    - `node.*`
    - `promotion.*`
    - `corroboration.*`
    - `graph_patch.*`
    - `recovery.*`
    - `account.*`
  - operator visibility should separate:
    - history-only events
    - badge-worthy events
    - attention-card-worthy conditions
    - chat-thread-worthy action-required cases
  - strong user-facing backbone events include:
    - block / completion / reopen / supersede
    - promotion blocked / promoted / revoked
    - graph patch requested / applied / generation updated
    - restore required / failed / completed
    - threshold crossed / account switched / account exhausted
- Tab-badge direction now clarified:
  - badges should stay sparse and purposeful
  - `Progress` badge should represent meaningful attention/action-required count
  - other tabs should prefer targeted counts or simple dot-badges rather than noisy unread-like counters
- Condition-aging direction now clarified:
  - unresolved conditions stay on operational surfaces
  - resolved conditions fall back to History
  - recently resolved major items may linger briefly in summary surfaces
  - current recommended default lifetimes:
    - normal resolved operational items: about 15 minutes
    - major resolved items: until dismissed or up to 24 hours
  - future settings should use a simple policy-level control, not per-alert micro-configuration
- Alert-state semantics now clarified:
  - `resolved` = underlying condition actually changed
  - `dismissed` = presentation hidden/acknowledged while underlying condition may still exist
  - active blockers must not be dismissible in a way that makes the system appear unblocked
- Acknowledgement model direction now clarified:
  - `acknowledged` is distinct from both `resolved` and `dismissed`
  - intended for advisory/minor/non-blocking concerns that the user has explicitly seen/accepted
  - acknowledgment should reduce operational noise while preserving traceability
  - blockers requiring real action must not be acknowledgeable in place of resolution
- Concern-model direction now clarified:
  - `concern` should be a first-class record, not just a field buried in review/alert logic
  - concern records should carry:
    - identity
    - scope
    - severity
    - category
    - owner
    - lifecycle state
    - meaning/summary
    - linkage to evidence/artifacts/history/source records
    - visibility/attention flags
  - likely concern lifecycle states:
    - `active`
    - `acknowledged`
    - `resolved`
    - `dismissed`
- Concern creation/resolution direction now clarified:
  - canonical concerns should be created by:
    - runtime
    - package overseer
    - seam overseer
    - corroboration outcome
    - graph patch/state-transition logic
  - workers may nominate findings but should not mint canonical concerns directly
  - concern records should update/escalate/downgrade when the same underlying issue persists rather than duplicating endlessly
  - resolution must track underlying truth changes, not mere presentation changes
- Shared concern projection rule now clarified:
  - all major surfaces should project the same concern model rather than inventing local versions
  - `Progress` = operational attention projection
  - `Seams` = integration/governance projection
  - `Evidence` = proof-backed concern projection
  - `History` = concern lifecycle timeline projection
  - `Ledger` = exact structured concern-record projection
- Concern action-model direction now clarified:
  - user-facing concern actions should stay narrow:
    - open / focus / open evidence / open history / open ledger
    - acknowledge / dismiss where allowed
    - open resolution thread
    - approve / reject only when tied to true manual/HITL boundaries
  - runtime/overseer actions should remain mostly non-generic GUI buttons:
    - request corroboration
    - route to remediation
    - request graph patch
    - severity/owner mutation
    - merge/split
    - true resolution
- Inspector vs full-record action split clarified:
  - side inspectors should remain summary/action-light
  - heavy/high-consequence actions and dense records belong in full-record views
- Widget-system data-contract direction now clarified:
  - orchestrator widgets should consume stable shared projections rather than raw event streams or bespoke queries
  - widget shell needs:
    - widget identity/type
    - scope
    - filter/sort/display config
    - projection ref
- Required orchestrator projection families now identified:
  - Run Summary
  - Seam Summary
  - Package Summary
  - Node Summary
  - Promotion Summary
  - Lane / Worktree Summary
  - Concern Summary
  - Account / Usage Pressure
  - Recent Major Events
  - Corroboration Summary
  - Recovery Summary
  - Overseer Activity
- Projection reuse split clarified:
  - `Run Summary`, `Seam Summary`, `Concern Summary`, `Account / Usage Pressure`, `Recent Major Events` should be broadly reusable across Orchestrator / Dashboard / Projects
  - more operational/dense summaries stay primarily Orchestrator-facing
- Projection freshness direction now clarified:
  - event-driven updates are the primary model
  - manual refresh / tab re-open refresh remain secondary
  - projection health states should conceptually include:
    - `current`
    - `refreshing`
    - `stale`
    - `failed`
- Projection degradation policy is clearer:
  - projection health becomes an operational concern when it undermines trust in blocked/promotion/recovery/patch/account-pressure truth
  - at that point it should mint a real concern rather than staying a silent widget problem
- Action-gating direction under degraded projections now clarified:
  - actions that change execution/promotion/recovery/approval truth require fresh-enough projection state
  - observational/navigation/export actions generally remain safe
  - UI should explain gating inline:
    - what is stale
    - why it matters
    - what the user can do next
- Fallback path under stale projections is now clearer:
  - degrade from summary/projection surfaces to direct record-backed inspection
  - `Ledger` and direct record views become the trust anchor under degraded projection health
  - only certain current/generation-matched direct records should support action
- Direct-record actionability direction now clarified:
  - most trustworthy action-capable direct records:
    - promotion record
    - graph patch record + state transition report
    - recovery/restore record
    - concern record for acknowledge/dismiss style actions
  - direct record views that allow action should explicitly show:
    - currentness
    - generation match
    - superseded yes/no
    - actionable yes/no
- Filters / saved views direction now clarified:
  - each tab needs role-appropriate filters
  - Orchestrator should support saved views (at least per project) for tabs/filters/sort/grouping/widget layout
- Sorting/grouping direction now clarified:
  - `Seams` default sort = most operationally problematic first
  - `History` default sort = newest first
  - `Ledger` default sort = newest first
- Dashboard / Projects / Orchestrator split direction is clearer:
  - Dashboard = summary/urgency/entry points
  - Orchestrator = operational depth
  - Projects page = multi-project summary/management surface, richer than a tiny status list but still summary-first
  - Project cards should show compact orchestrator/attention/usage pressure state and one primary blocked owner/reason when blocked
- Usage/multi-account surface split is now clearer:
  - Projects page shows coarse account/usage pressure summary only
  - Dashboard shows cross-project pressure that matters operationally
  - Orchestrator shows execution-specific provider/account pressure context
  - Usage page needs account-level breakdown, role usage view, and switch history, but full Usage-page redesign is intentionally out of scope for this thread
- Settings categorization direction is clearer:
  - multi-account belongs with provider/model setup, not in an isolated orchestrator-only settings area
  - current likely major settings groupings:
    - `Providers & Models`
    - `Execution Identity`
    - `Governance`
    - `Workers`
    - `Recovery`
    - `HITL`
- Settings scope hierarchy direction now clarified:
  - `App / Global` = broad product defaults/catalogs/capabilities
  - `Project` = main execution policy owner
  - `Seam` = meaningful feature-level overrides only
  - `Package` = useful local execution/recovery overrides
  - `Node` = rare targeted override only
  - `Actor / Role` = cross-cutting provider/account/persona/worker policy
  - `Runtime only` = computed truth, not user configuration
- Override-display direction now clarified:
  - UI should explicitly show:
    - `Inherited`
    - `Overridden`
    - `Effective`
  - users should not need a separate modal just to understand resolution/inheritance/fallback
- Node Graph tab direction now includes:
  - graph canvas + right-side detail inspector
  - node click should expose:
    - requested/effective provider/model/effort/persona/account
    - usage/token/cost info
    - worker policy
    - retry/review/promotion state
    - lane/worktree/snapshot state
    - linked evidence/artifacts
  - clicking evidence/artifact links from node detail should navigate to the Evidence tab with the relevant evidence/artifact selected
- Cross-tab navigation is now treated as a design contract:
  - important objects/events should be deep-linkable across Progress / Seams / Node Graph / Evidence / History / Ledger
  - cross-tab navigation should preserve/filter/select the target context, not merely switch tabs
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
  - assistant, interviewer, requirements-doc-builder, and PRD builder should share provider/account/usage/runtime identity behavior, but they are not orchestration nodes/packages/seams
  - their primary mode is conversational/brainstorming and decision-forming, not orchestration-style HITL escalation routing
  - requirements-doc-builder flow is conversational first:
    - collaborative ideation / viability / approach discussion
    - then more structured questioning to close gaps and lock decisions
    - then generation of more traditional requirements documents/artifacts
  - interviewer follows a similar conversational-to-structured pattern, but moves topic-by-topic and ultimately produces documents/artifacts shaped for the node/contract system
  - PRD builder exists after interviewer and behaves closer to the assistant, but with specialized context/rules for the document-handling workflow
  - the broader handoff chain described by the user is:
    - requirements-doc-builder artifacts
    - interview flow artifacts
    - PRD-builder artifacts
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
- Targeted external loop research on a fresh-iteration coding loop found the most reusable handoff ideas are simple and durable:
  - each iteration starts fresh
  - memory persists through explicit artifacts rather than hidden context
  - the loop reads:
    - current task/plan state
    - append-only progress log / learnings
    - persistent reusable-pattern summary
    - repo state / git history
  - the loop appends:
    - what was implemented
    - files changed
    - learnings/gotchas
    - reusable patterns for future iterations
- Strong reusable handoff pattern extracted:
  - separate:
    - task state / completion truth
    - append-only execution learnings
    - reusable pattern memory
  - do not rely on one giant conversational thread as the only continuity mechanism
- Translation direction for Puppet Master:
  - keep the value of fresh-worker retries with explicit handoff artifacts
  - but do not copy the simplistic "repeat single-story loop until done" model as-is
  - our system needs richer handoff structure because retries may flow into:
    - another overseer-spawned node worker
    - remediation
    - review/corroboration
    - graph patch / replan
    - restore / safe-point logic
- Handoff-data implication:
  - each attempt should likely produce at least:
    - what was attempted
    - what changed / artifacts produced
    - checks/tests/review outcome
    - why it failed/blocked
    - contamination / restore state if relevant
    - recommended next action
    - reusable learnings/patterns when appropriate
- Storage/delivery clarification pressure from user:
  - "JSON-like" is too vague; the design still needs to pin down:
    - whether these artifacts are literally JSON/JSONL/redb-backed records/projections
    - what concrete project-scoped paths or storage domains own them
    - how a worker actually receives the handoff packet (inline prompt block, referenced artifact, fetched context, or mixed model)
  - current recommendation direction:
    - canonical handoff/retry memory should be structured runtime records, not loose markdown logs
    - worker-facing handoff should be a synthesized bounded packet assembled from canonical records, not full raw history
  - but exact storage medium/path/delivery mechanism remains an open design seam and needs to be specified concretely
- Targeted storage-doc check clarified the existing documented persistence stack:
  - `Plans/storage-plan.md` already declares:
    - `seglog` = canonical append-only event source
    - `redb` = durable KV state / checkpoints / projections / rollups
    - `Tantivy` = search index
    - JSONL mirror = disposable projector output, not canonical truth
  - `Plans/FinalGUISpec.md` aligns with this:
    - persistence(events) = seglog
    - layout/settings/state = redb
- Important refinement:
  - the broad canonical runtime storage model *has* been decided/documented at stack level
  - what is *not yet nailed down* is how the newly discussed objects map into that stack:
    - node retry memory
    - attempt handoff artifacts
    - reusable learning records
    - worker handoff packets
- Current recommended direction after checking docs:
  - canonical truth for these new orchestration artifacts should fit the documented stack:
    - event/source-of-truth aspects in seglog
    - projected/current-state/read-optimized aspects in redb
    - export/inspection views as JSON/JSONL only when the user requests them from UI surfaces like Orchestrator
  - avoid making loose JSON files the canonical source
- User preference clarified:
  - exportability from the Orchestrator page is desirable
  - "optional JSON" wording should be removed from the design language unless JSON export is explicitly about manual inspection/export, not canonical storage
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
- Corroboration disagreement handling has now been tightened conceptually:
  - `2-of-3` accepts the high-impact claim as canonical
  - no `2-of-3` means the high-impact claim is not accepted as blocking/canonical truth
  - if disagreement still surfaces a credible lesser concern, runtime should always emit a non-blocking advisory/minor finding rather than dropping it
  - that advisory/minor finding should be visible on the Orchestrator page
- Graph-view direction is now materially clearer:
  - the graph should show the full lineage, including historical branches and patched fork/rejoin paths
  - the graph is expected to handle very large scale (thousands of nodes)
  - zoom + pan + minimap are expected to be primary navigation tools; full-graph visibility should not be replaced by default collapsing of history
  - seam and package boundaries should be visible as toggleable overlays
  - node visuals should carry execution/governance state
  - edge/path visuals should carry structure/lineage meaning
  - boundaries should carry grouping only, not duplicate state/severity semantics
- Graph readability direction now clarified:
  - label density should be zoom-dependent:
    - far zoom = structure/state only
    - medium zoom = abbreviated/local labels
    - near zoom = full labels and richer local annotations
  - selected objects should still expose strong detail via the right-side inspector regardless of zoom
- Graph navigation direction now clarified:
  - graph search/focus should support:
    - seam
    - package
    - node
    - lane
    - generation
  - focus should pan/zoom to target regions while preserving full-graph context rather than replacing the graph with a separate local-only view
- Remaining high-value Orchestrator blind spots / next seams:
  - exact Orchestrator <-> Source Control / worktree handshake
  - widget-system contract, hostability rules, persistence, and tab/widget filter interactions
  - command palette / shortcut / context-menu / bulk-action integration
  - scale/performance behavior for large graphs, many generations, many concerns/records
  - multi-run behavior inside one project
  - object/text search across Seams / Graph / Evidence / History / Ledger
  - notification/escalation cadence beyond in-page alerts
  - accessibility semantics for statuses, graph states, and dense panes
  - safety/confirmation rules for user-facing Orchestrator actions
  - exact artifact shapes for package review, seam review, corroboration packets, graph patch requests, and state transition reports
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
- Later GUI help/tooltip generation will need:
  - stable canonical terminology
  - clear object vs state vs action distinctions
  - enough explicit “why this exists” language in the planning model to support Simple/Expert/ELI5 derivation
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

## Research Progress - 2026-03-16 - Source Control / Worktree Handshake

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/GitHub_Integration.md`
- `Plans/FinalGUISpec.md`
- `Plans/MiscPlan.md`
- `Plans/storage-plan.md`
- `Plans/Run_Graph_View.md`

### Key findings
- Existing docs already establish a strong surface split:
  - `Source Control` is the primary operational surface for worktree inventory and user actions.
  - `Orchestrator` consumes worktree identity, ownership, blocked state, and lineage for run/history/recovery views.
  - `Settings > Branching` and `Settings > Health` expose config/diagnostics, not primary active-worktree management.
- Existing docs are still too runtime-worktree-centric for the rewrite:
  - ownership is still described as run/tier/subtask worktree ownership
  - Source Control rows expose `owner run/tier when present`
  - Orchestrator still references `Tiers` and per-tier worktree ownership
  - this collides with the newer package-based lane-pool model
- Storage direction is already close to what the rewrite needs:
  - `orchestrator.receipt.{run_id}.{attempt_id}` already carries `repo_id`, `worktree_id`, branch, commit-range, workflow refs, etc.
  - `source_control.project_state.{project_id}` already has `selected_worktree_id?`
  - `Run_Graph_View` already requires historical SCM/worktree lineage to remain visible when live targets no longer exist
- Cleanup semantics are split across docs but not yet normalized:
  - Worktree plan cleanup = removing worktree directories after merge/completion
  - MiscPlan cleanup = cleaning files inside a workspace/worktree
  - this distinction exists, but the UI/state model does not yet clearly separate lane lifecycle from cleanup actions

### Emerging boundary model
- Recommended boundary:
  - `Orchestrator` owns package lane-pool operational truth for the active run:
    - which package owns which lane pool
    - which lane is baseline vs active vs suspect/restoring vs historical/retired
    - why a lane is blocked, weakly integrated, or cleanup-eligible
    - which action is allowed from runtime/governance state
  - `Source Control` owns repo/worktree execution and inspection operations:
    - open
    - compare
    - diff/history/graph
    - recover
    - archive/prune/remove when policy permits
    - explicit disabled reasons for destructive actions
- Practical interpretation:
  - Orchestrator should be the stronger lane/worktree operations overview.
  - Source Control should be the narrower but deeper Git/worktree inventory and manipulation surface.
  - Orchestrator CTAs should route into Source Control for Git-native operations with exact project/run/package/lane/worktree context preserved.

### Candidate object model shift
- Existing doc wording implies `worktree` is the primary user-visible object.
- Rewrite direction implies a new object stack:
  - `Feature Seam`
  - `Work Package`
  - `Lane`
  - `Worktree`
- Recommended modeling rule:
  - `Lane` becomes the primary operational object in Orchestrator.
  - `Worktree` remains the concrete filesystem/Git backing for a lane instance.
  - a lane may preserve historical identity after the live worktree has been cleaned up, archived, or removed.
  - Source Control can still list worktrees directly, but should also expose lane/package ownership and lifecycle state when known.

### Lifecycle state direction
- Current docs have action verbs like `recover`, `prune`, `remove`, and `Clean all worktrees`, but not a strong shared lane lifecycle.
- Recommended lane/worktree lifecycle vocabulary:
  - `baseline`
  - `active`
  - `suspect`
  - `restoring`
  - `retained`
  - `cleanup_eligible`
  - `archived`
  - `removed`
  - `historical`
- Working interpretation:
  - `historical` is record truth and can coexist with `archived` or `removed`
  - `archived` means lane/worktree metadata and lineage stay visible, but the live execution surface is no longer active
  - `removed` means the live worktree directory is gone
  - `cleanup_eligible` is a policy/queue state, not the same thing as already removed
  - `suspect` and `restoring` are operational states visible in Orchestrator first and in Source Control second

### CTA / action boundary
- Recommended no-ambiguity rule:
  - Orchestrator may initiate scoped actions on a lane/worktree from run context.
  - destructive Git/worktree actions should resolve through Source Control semantics, even if launched from Orchestrator.
- Likely action split:
  - Orchestrator-owned initiation:
    - inspect lane
    - inspect weak integration
    - request restore
    - request graph patch
    - request reopen/revocation
    - open lane in Source Control
  - Source-Control-owned execution surface:
    - open worktree
    - compare against baseline/target
    - inspect changed files/history/graph
    - recover orphaned worktree
    - archive lane worktree
    - prune/remove worktree
    - cleanup current/all eligible worktrees
- Important nuance:
  - runtime blocked reasons like `dirty_worktree` and `worktree_conflict` remain runtime truth, not Source Control-local statuses
  - Source Control surfaces the condition and executes allowed remediation actions
  - Orchestrator remains the place where blocked ownership and run consequences are clearest

### Historical reference rule
- Strong rule emerging from current docs + rewrite:
  - historical run/package/node/lane references MUST survive after live worktree cleanup
  - a missing live worktree must render as `historical/retired/removed`, not disappear
  - lineage views must preserve:
    - `worktree_id`
    - path snapshot
    - branch snapshot
    - compare target / commit-range snapshot
    - owning package/lane identity when applicable
- This supports:
  - graph generation history
  - safe-point / recovery history
  - promotion/revocation audit
  - cleanup/archive/remove traceability

### Contradictions / gaps surfaced
- `Plans/WorktreeGitImprovement.md`
  - still frames ownership around `tier` / `subtask` rather than package lane pools.
- `Plans/Orchestrator_Page.md`
  - still references `Tiers` and per-tier worktree ownership.
- `Plans/GitHub_Integration.md`
  - `Worktrees` subview is correct directionally, but object copy still centers raw worktree rows rather than lane-backed operational identity.
- `Plans/FinalGUISpec.md`
  - clearly separates Source Control from GitHub Actions and places worktree management in Health/Settings, but does not yet express the stronger Orchestrator-vs-Source-Control lane/worktree boundary.
- `Plans/MiscPlan.md`
  - cleanup actions exist, but they are not yet reconciled with `retained` vs `cleanup_eligible` vs `archived` vs `removed` lane/worktree states.
- `Plans/storage-plan.md`
  - has `worktree_id` and historical receipt linkage, but likely needs lane/package/seam linkage added so worktree records do not remain stranded as flat Git objects.

### Candidate fixes to carry forward
- Add a formal distinction between:
  - `lane lifecycle state`
  - `worktree filesystem state`
  - `runtime blocked/recovery state`
- Reword Source Control worktree rows from `owner run/tier` to something like:
  - owner run/package/lane
  - or owner package/lane with run reference secondary
- Update Orchestrator contracts so the `Seams` tab and `Node Graph` show lane/worktree state through package ownership, not legacy tier ownership.
- Ensure cleanup/archive/remove flows always preserve historical lane/worktree lineage and safe-point/remediation linkage.
- Make `Source Control` the execution surface for Git-native mutations, while `Orchestrator` remains the operational surface for why those actions matter.

### Do-not-forget details
- `dirty_worktree` and `worktree_conflict` are canonical blocked reasons and must remain visible in both surfaces without becoming generic SCM errors.
- project identity must stay stable across path moves/rebinds and across worktree-aware flows.
- cleanup of files inside a worktree is not the same thing as removing the worktree itself.
- later broader second sweep must revisit:
  - Source Control-related docs
  - project/dashboard interaction docs
  - widget/projection contracts
  - glossary/help/labels for lane/worktree terminology

## Research Progress - 2026-03-16 - Terminology Decision

### Confirmed decision
- `Source Control` stays `worktree-first`.

### Implications
- Source Control should keep `Worktrees` as the primary subview/object list rather than flipping to a lane-first list.
- Orchestrator should remain package/seam/lane-first and treat worktrees as backing execution assets shown in context.
- The surfaces therefore stay intentionally asymmetric:
  - Orchestrator = package/governance/execution truth
  - Source Control = concrete Git/worktree inspection and mutation surface

### Recommended UI contract from this decision
- Source Control worktree rows remain concrete and filesystem/Git oriented, but must show enough orchestration metadata to prevent isolation drift:
  - owning package
  - owning lane
  - run reference when relevant
  - lifecycle state
  - blocked/recovery state when relevant
- Orchestrator should not mirror a raw worktree inventory table.
- Orchestrator should instead show:
  - lane/worktree summary in package context
  - worktree health/state badges
  - deep links into Source Control for Git-native operations

### Terminology guardrail
- Do not rename Source Control objects so aggressively that `worktree` becomes hidden or secondary there.
- `Lane` is important for runtime/governance modeling, but in Source Control it should appear as ownership/context metadata for a worktree, not replace worktree as the primary object.

### Follow-on doc impact
- `Plans/GitHub_Integration.md`
  - likely keep `Worktrees` subview name and worktree-row-first structure
  - enrich row metadata with package/lane/run ownership and lifecycle state
- `Plans/Orchestrator_Page.md`
  - make package/lane state primary
  - keep worktree references contextual, actionable, and deep-linkable
- `Plans/FinalGUISpec.md`
  - preserve Source Control as Git/worktree-first
  - sharpen the asymmetry explicitly so Orchestrator does not regress into a duplicate worktree manager

## Research Progress - 2026-03-16 - Source Control Panel Constraint

### Confirmed constraint
- The `Source Control` panel is narrow/small and should be treated as a constrained side-panel surface, not a broad information canvas.

### Implications
- Source Control rows and tabs must stay information-dense but selective.
- Do not assume package/lane/run/worktree metadata can all be shown at full fidelity at once in the panel.
- Prefer:
  - one strong primary line
  - compact status chips/icons
  - expandable row/detail affordances
  - deep-link out to wider surfaces when context gets too large
- This reinforces the surface split:
  - Source Control = compact Git/worktree operational panel
  - Orchestrator = broader operational/governance surface with more room for context

## Research Progress - 2026-03-16 - Widget System Contract

### Targeted docs read
- `Plans/Widget_System.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`

### Key findings
- `Plans/Widget_System.md` is still heavily aligned to the older orchestrator model:
  - widget catalog is tier-centric
  - `widget.tier_tree` is still canonical for `Orch/Tiers`
  - `widget.current_task`, `widget.completed_prose`, and `widget.agent_terminal` all read as tier/task/subtask oriented
  - push contracts are wired directly to older event names like `TierChanged`, `IterationStart`, and `Progress`
- The doc still assumes multiple Orchestrator tabs are widget-composed pages:
  - persistence keys exist for `orchestrator:progress`, `orchestrator:tiers`, `orchestrator:evidence`, `orchestrator:history`, and `orchestrator:ledger`
  - add/remove/move/resize behavior is described for generic "Orchestrator tabs"
- This now conflicts with current rewrite direction:
  - `Progress` is the widget-hosting tab
  - `Seams`, `Node Graph`, `Evidence`, `History`, and `Ledger` are fixed-purpose tabs with stronger native layouts and interaction contracts
  - `Node Graph` is explicitly not a widget
  - `Evidence` has separate evidence/artifact panes
  - `History` and `Ledger` stay distinct for chronology vs exact record inspection

### Recommended widget boundary
- Recommended rule:
  - widgets are allowed on:
    - `Dashboard`
    - `Usage`
    - `Orchestrator / Progress`
  - widgets are not the composition model for:
    - `Orchestrator / Seams`
    - `Orchestrator / Node Graph`
    - `Orchestrator / Evidence`
    - `Orchestrator / History`
    - `Orchestrator / Ledger`
- Practical implication:
  - those non-Progress tabs may internally use reusable view components, but they should not expose general add/remove/move/resize widget behavior
  - only `Progress` should behave like a widget canvas on the Orchestrator page

### Stable data-contract direction
- Recommended rule:
  - widgets must consume stable orchestrator projections and canonical record/query contracts
  - widgets must not define meaning by subscribing directly to legacy event names or tier-specific objects
- Example shift:
  - from `TierChanged` / `IterationStart` / `TierTree`
  - toward projections such as:
    - current run summary
    - current activity projection
    - attention/blocker projection
    - seam health projection
    - package activity projection
    - promotion queue projection
    - lane/worktree projection
    - account/usage pressure projection
    - recent major events projection
- This matters because the widget layer should not have to relearn seam/package/node/lane semantics independently.

### Widget filter / persistence direction
- Strong recommendation:
  - distinguish `page/tab filters` from `widget presentation config`
  - widget config may control presentation and local emphasis
  - widget config must not invent alternate scoping semantics that diverge from the tab's canonical projection rules
- Example:
  - acceptable widget config:
    - compact vs expanded view
    - item count
    - sort mode
    - whether to show durations or cost
  - risky widget config:
    - custom object model
    - custom state classification rules
    - widget-local definitions of blocked/completed/integration status

### Hostability direction
- Current rewrite direction already implies a narrower hostability policy:
  - many `Progress` widgets may also be hostable on `Dashboard`
  - non-Orchestrator widgets should not be hostable on the Orchestrator page
  - not every Orchestrator tab surface should become a portable widget
- Recommendation:
  - `Dashboard` can host a curated subset of `Progress` widgets and some `Usage` widgets
  - `Progress` hosts orchestrator operational summary widgets
  - deep inspection surfaces remain non-hostable native tabs

### Persistence impact
- `Plans/Widget_System.md` currently defines layout keys for multiple Orchestrator tabs.
- Likely rewrite direction:
  - keep:
    - `widget_layout:v1:dashboard`
    - `widget_layout:v1:usage`
    - `widget_layout:v1:orchestrator:progress`
  - likely remove or deprecate:
    - `widget_layout:v1:orchestrator:tiers`
    - `widget_layout:v1:orchestrator:evidence`
    - `widget_layout:v1:orchestrator:history`
    - `widget_layout:v1:orchestrator:ledger`
- The fixed tabs will need their own view-state persistence instead:
  - filters
  - selection
  - split positions
  - inspector state
  - last-focused object

### Contradictions / gaps surfaced
- `Plans/Widget_System.md`
  - still assumes a tier-first widget catalog and broad widgetization of Orchestrator tabs.
- `Plans/Orchestrator_Page.md`
  - still describes `Tiers` as a widget-based tab and carries old default layouts.
- `Plans/FinalGUISpec.md`
  - likely still needs explicit cross-reference that only certain pages/tabs are widget-composed.
- There is no sharp current rule yet for:
  - widget-level filters vs tab-level filters
  - widget action scope vs page-native action scope
  - which widgets are hostable where after the seam/package rewrite

### Candidate fixes to carry forward
- Rewrite the widget catalog around current operational summary widgets rather than tier widgets.
- Make `Progress` the only widget-composed Orchestrator tab.
- Move all widget data contracts off legacy tier events and onto stable projections / canonical records.
- Add explicit hostability rules so `Dashboard` and `Progress` can share summary widgets without turning deep inspection tabs into widget canvases.
- Add a rule that page-native semantics win over widget-local semantics.

### Do-not-forget details
- Source Control being a narrow panel reinforces the need to keep widget usage focused on wider surfaces like `Dashboard` and `Orchestrator / Progress`, not as a universal composition strategy everywhere.
- `Node Graph` remains a fixed native surface with right-side inspector, not a widget.
- `History` vs `Ledger` separation should not be undermined by making both "just widget pages."

## Research Progress - 2026-03-16 - Projection Freshness / Stale-Trust Model

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Contracts_V0.md`

### Key findings
- The storage model already establishes the right underlying posture:
  - `seglog` is canonical
  - redb/Tantivy/JSONL are disposable projections
  - replay/rebuild targets a deterministic `target_seq`
  - UI freshness notifications should derive from committed projection state, not ad-hoc polling
- Usage already names the user-trust problem clearly:
  - stale values surprise users
  - trust drops when the UI presents old numbers as if they are current
  - current mitigation pattern is `Last updated` plus an explicit `Refresh`
- FinalGUISpec already has compatible safety rules:
  - event/projection streams are the correctness source
  - the GUI must not imply hidden fallback or hidden retry behavior
  - blocked/recovery actions bind to canonical projections/records
- What is still missing is an explicit shared trust policy for all projection-backed surfaces, especially Orchestrator tabs.

### Recommended trust-state model
- Recommended projection trust states:
  - `current`
  - `refreshing`
  - `stale`
  - `degraded`
  - `unavailable`
- Working interpretation:
  - `current`: projection is caught up enough for normal use
  - `refreshing`: old committed projection still visible while refresh/rebuild runs
  - `stale`: projection is usable for context but may not reflect current runtime truth
  - `degraded`: projector/scan partially failed or a dependency signal is missing; some fields/sections are less trustworthy
  - `unavailable`: projection cannot currently answer the surface contract

### Action-gating direction
- Strong recommendation:
  - read-only navigation may continue on `stale` and some `degraded` projections if the UI says so clearly
  - live mutating / decision-bearing actions must tighten on trust state
- Suggested policy:
  - `current`: all normal actions allowed
  - `refreshing`: allow normal read actions; mutating actions may continue if backed by runtime truth rather than stale page cache
  - `stale`: allow inspection and historical navigation; require refresh or direct runtime revalidation before sensitive live actions
  - `degraded`: restrict to safe inspection and canonical recovery paths; do not allow ambiguous live actions
  - `unavailable`: route to record-backed fallback views or explicit recovery/refresh actions
- Important rule:
  - page state must not silently stand in for runtime state when freshness/trust is insufficient

### Fallback-view direction
- Recommended fallback hierarchy:
  - prefer native projection-backed surface when trust is `current`
  - if trust drops, keep the surface open but show:
    - trust badge
    - last-updated time
    - degraded reason
    - refresh / recover action
  - when necessary, fall back to canonical record-backed views:
    - `History`
    - `Ledger`
    - direct evidence/record inspectors
- This fits the existing split:
  - `History` = chronological durable story
  - `Ledger` = exact record inspection
  - projection-backed operational views can degrade without erasing auditability

### UI contract direction
- Every projection-backed operational surface should expose at least:
  - trust state
  - last updated time
  - degraded/stale reason when not current
  - whether actions are partially gated
- Likely good surface behavior:
  - `Progress`: show run-level trust banner or chip when projections are stale/degraded
  - `Seams`: allow browsing, but gate actions that depend on current promotion/blocker truth
  - `Node Graph`: keep historical graph and current selections visible, but flag when live node state may be stale
  - `Evidence`: artifact browsing can remain available; live verdict/action affordances may gate
  - `History` / `Ledger`: usually the fallback-safe surfaces because they are closest to canonical records

### Contradictions / gaps surfaced
- No shared projection freshness schema is currently obvious across Usage, Orchestrator, Source Control, and other projection-backed surfaces.
- Usage has concrete stale-data mitigations, but Orchestrator currently lacks equally explicit stale/degraded trust copy and action rules.
- FinalGUISpec has good safety language, but it does not yet appear to define one reusable trust-state UI contract for projection-backed tabs/widgets/panels.

### Candidate fixes to carry forward
- Add a shared projection health/trust contract used by:
  - Orchestrator
  - Usage
  - Source Control
  - other projection-backed surfaces
- Make `trust state` and `last updated` first-class UI fields for projection-backed surfaces.
- Define which commands require:
  - current projection
  - direct runtime confirmation
  - or are safe from stale views because they operate on durable records only
- Define explicit record-backed fallback behavior when projections are stale/degraded/unavailable.

### Do-not-forget details
- `refreshing` should continue showing the last committed projection rather than blanking the page.
- stale/degraded trust must be visible without making the UI feel broken or unusable.
- the system should never quietly present stale operational truth as if it were live truth.

## Research Progress - 2026-03-16 - Multi-Run Behavior Inside One Project

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`

### Key findings
- Current docs already imply that Orchestrator can focus either:
  - an active run
  - or a selected historical run
- Existing wording is not enough yet:
  - `Orchestrator_Page.md` says the graph renders when a run is active or a historical run is selected
  - `History` rows can load a historical run into the graph/evidence
  - `Ledger` filters to the current/selected run
  - but there is no clear mode contract for what the whole page is in after a historical run is selected
- Storage/project-state support appears incomplete for this seam:
  - `storage-plan.md` defines project state for Source Control, GitHub Actions, and Docker Manager
  - there is no obvious equivalent `orchestrator.project_state.{project_id}` with focused/selected run state
  - this means run focus persistence and restore rules are currently underspecified
- Background-run behavior exists, but it is still somewhat separate from Orchestrator run-focus semantics:
  - background runs have queue/state events
  - Dashboard has a Background Runs card
  - but Orchestrator does not yet clearly define how active background runs interact with a currently focused historical run

### Recommended run-focus model
- Strong recommendation:
  - distinguish `active run truth` from `focused run context`
- Proposed fields conceptually:
  - `active_run_id?`
  - `focused_run_id?`
  - `focus_mode = live | historical`
- Working interpretation:
  - `active_run_id` = currently running/paused/interrupted run for the project, if any
  - `focused_run_id` = the run whose data the Orchestrator tabs are currently showing
  - `focus_mode = live` when `focused_run_id == active_run_id`
  - `focus_mode = historical` when the user is inspecting any non-active run
- Benefit:
  - avoids blending "what is running now" with "what the user is currently inspecting"

### Historical-run mode direction
- Recommended explicit mode:
  - `Historical Run Mode`
- Required behavior:
  - all tabs clearly show the focused historical `run_id`
  - the page displays a persistent banner/chip that the user is viewing historical data
  - controls that only make sense for the active run are disabled or removed
  - actions route against the focused run only when they are historical-safe
- Historical-safe actions likely include:
  - inspect graph
  - inspect evidence
  - inspect ledger
  - export
  - view lineage
  - open related Source Control / GitHub / Docker context in historical mode where possible
- Actions that should generally be disabled in historical mode:
  - pause / resume / cancel active execution
  - live retry / remediation commands
  - approval/recovery actions that require current runtime state
  - any command that implies mutating the current live run context

### Current-run mode direction
- When focused on the live run:
  - live cards/widgets are active
  - CTAs operate on current runtime truth
  - background events and live state changes update the focused tabs directly
- If a new run becomes active while the user is viewing history:
  - do not forcibly yank focus away from the historical run
  - instead show a clear notice such as:
    - active run exists
    - switch to live run
    - background runs count / status
- This avoids the page feeling unstable.

### Background-runs interaction
- Recommended rule:
  - background run presence is global project state
  - focused run is local Orchestrator viewing state
- Implication:
  - a user may be viewing one historical run while another run is actively progressing in the background
  - Orchestrator should surface that without silently replacing the focused context
- Good model:
  - background/live-run strip or compact banner remains visible even in historical mode
  - user can explicitly switch focus to the active run

### Persistence direction
- Likely missing project-state record:
  - `orchestrator.project_state.{project_id}`
- Candidate fields:
  - `focused_run_id?`
  - `focus_mode`
  - `last_live_run_id?`
  - `selected_tab`
  - per-tab view state refs
  - maybe `auto_return_to_live = false` by default
- Working recommendation:
  - persist the last focused run per project
  - on restart/project reopen:
    - if that run still exists and is historical, restore historical focus
    - if there is also an active run, show a clear live-run notice rather than overriding focus silently

### Cross-tab behavior direction
- Strong recommendation:
  - all Orchestrator tabs share the same focused `run_id`
- Implications:
  - `History` selection changes the whole page's focused run
  - `Node Graph`, `Evidence`, and `Ledger` all pivot to the same `run_id`
  - `Progress` in historical mode must stop pretending to be a live dashboard and instead become a historical summary for that run, or show a reduced/locked state with a switch-back-to-live CTA
- This is important:
  - otherwise each tab can drift into a different run context and the page becomes incoherent

### Progress-tab implication
- Current `Progress` tab language is heavily live-run oriented.
- If Orchestrator shares one focused run across all tabs, then `Progress` needs an explicit historical behavior.
- Likely good direction:
  - in historical mode, `Progress` becomes a historical run summary surface
  - live-only widgets either:
    - switch to historical-summary rendering
    - or show disabled/live-unavailable state with explanation
- This needs a sharper contract later.

### Contradictions / gaps surfaced
- No explicit `historical-run mode` contract yet.
- No obvious `orchestrator.project_state.{project_id}` for focused run persistence.
- `History` currently includes `Delete Run`, which may conflict with durable historical/audit expectations unless delete semantics are defined carefully.
- `Progress` is described as a live dashboard, but the shared run-focus model implies it may also need to represent historical runs coherently.
- Background runs exist in Dashboard, but Orchestrator focus rules for live-vs-historical switching are not yet specified.

### Candidate fixes to carry forward
- Add explicit `active_run_id` vs `focused_run_id` semantics.
- Add a first-class `Historical Run Mode` UI contract for Orchestrator.
- Add `orchestrator.project_state.{project_id}` with focused run and per-tab state.
- Define which commands are:
  - live-run only
  - historical-safe
  - record-only/export-only
- Define how `Progress` behaves when the focused run is historical.

### Do-not-forget details
- The page must not auto-switch focus away from a historical run just because live activity appears.
- The user should always know whether they are looking at the active run or a historical run.
- Cross-tab deep links must preserve focused `run_id` so History -> Graph -> Evidence -> Ledger stays coherent.

## Research Progress - 2026-03-16 - Search Across Orchestrator Tabs

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Widget_System.md`

### Key findings
- Existing docs mostly define local/tab-specific search and filtering:
  - Run Graph has node search/filter
  - Evidence has local search/filter
  - Ledger has local filter/sort
  - History is currently a list/table view
- Cross-surface navigation exists in fragments:
  - graph detail can open Evidence
  - graph can open Usage
  - History rows can open Graph/Evidence
  - Ledger can open Usage
- Storage already provides the right backend ingredients:
  - seglog is canonical
  - Tantivy is the intended full-text/search layer
  - project-scoped indices are already part of the storage model
- What is still missing is a unified Orchestrator search contract that is object-first rather than page-first.

### Recommended search model
- Strong recommendation:
  - distinguish `global object search` from `tab-local filtering`
- Proposed split:
  - `Orchestrator search`
    - object-first, run-aware, cross-tab routing
  - `tab-local search`
    - local narrowing/filtering within the active tab/view
- Object-first search targets should include at minimum:
  - run
  - seam
  - package
  - node
  - lane / worktree
  - concern
  - promotion
  - review
  - corroboration
  - graph patch
  - recovery / safe-point object where applicable
  - evidence/artifact when directly addressable

### Routing contract direction
- Search results should not merely highlight text.
- Each result should carry a canonical route target:
  - `focused_run_id`
  - destination tab
  - selected object id
  - optional filter payload
  - optional inspector/detail target
- Examples:
  - seam/package -> `Seams` tab with correct hierarchy expanded
  - node -> `Node Graph` with node selected and inspector open
  - evidence/artifact -> `Evidence` with panes focused appropriately
  - promotion/review/corroboration/graph patch/recovery record -> likely `Ledger` or `History` depending on whether exact-record or story context is primary
  - run -> switch `focused_run_id` and open the relevant tab/context

### Focused-run interaction
- Orchestrator search must be run-aware.
- Recommended behavior:
  - default scope = current focused run for quick local relevance
  - user can widen to project-wide / all runs within the project
  - when a result belongs to another run, selecting it should explicitly switch the focused run
  - the UI should disclose that the focused run changed because of the search result
- This pairs directly with the multi-run seam:
  - search result routing must preserve or intentionally change `focused_run_id`
  - it must never do so silently

### Global vs local search distinction
- Recommended user model:
  - `Search in this tab`
    - local filter / text match / list narrowing
  - `Search Orchestrator`
    - object-first, cross-tab, route-aware
- Good fit:
  - tab-local search stays embedded in tabs like Graph/Evidence/Ledger
  - Orchestrator search can be:
    - a page-level search box
    - and/or command-palette integrated

### Command palette integration direction
- `FinalGUISpec.md` already defines a global command palette.
- Recommended contract:
  - command palette can expose Orchestrator object results, not just commands/pages
  - selecting an object result should route through the same deep-link contract as Orchestrator search
- This avoids building two incompatible navigation systems.

### Indexing / backend direction
- Likely backend split:
  - exact structured object lookup from redb projections / record indices
  - text search from Tantivy where summaries/descriptions/content matter
- Good rule:
  - search should prefer stable object identity matches first
  - text/full-text results come after exact object hits
- This matters for:
  - object ids
  - canonical names/titles
  - historical records with long textual payloads

### Search-result presentation direction
- Good result row fields:
  - object type
  - label/title
  - run context
  - parent context
  - current state / severity when relevant
  - target tab
- Example parent context:
  - seam > package > node
  - package > lane
  - run > graph patch
  - node > concern

### Contradictions / gaps surfaced
- Current docs define many local filters but not a unified Orchestrator search object model.
- There is no current canonical routing payload shared across search, deep links, and cross-tab navigation.
- Search scope behavior across current focused run vs all project runs is not yet defined.
- `Tantivy` is clearly intended for search, but the object/record side of Orchestrator search is not yet specified enough to rely on full-text alone.

### Candidate fixes to carry forward
- Define a canonical Orchestrator search result contract with:
  - object identity
  - object type
  - focused-run implications
  - destination tab
  - selection/filter payload
- Separate page-level Orchestrator search from tab-local filtering.
- Reuse the same routing contract for:
  - search results
  - command palette results
  - cross-tab deep links
  - `Show in ...` actions
- Make search object-first and run-aware, not just text-match-first.

### Do-not-forget details
- Search should help the user find the right object, not force them to know which tab owns it first.
- A narrow Source Control panel reinforces that richer cross-object search belongs more naturally in Orchestrator / command-palette flows than in side-panel SCM UI.
- Historical results must preserve run context clearly so search does not create silent run-focus jumps.

## Research Progress - 2026-03-16 - Historical vs Current Record Semantics

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Run_Graph_View.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The storage/runtime model already contains some strong historical semantics:
  - attempts from older generations can become `stale_historical`
  - blocked projections remain historical after resolution
  - historical lineage must remain visible even when live targets disappear
  - remediation resolution already includes `fixed`, `superseded`, `abandoned`, `replan_required`
- The problem is uneven application:
  - attempts have relatively explicit historical semantics
  - higher-level objects like promotions, concerns, graph patches, recovery records, and lane/worktree lifecycle states are not yet using one shared semantic vocabulary
- There are several similar-but-different concepts in play:
  - `historical`
  - `stale_historical`
  - `superseded`
  - `revoked`
  - `reopened`
  - `archived`
  - `deleted` / `removed`
- These should not collapse into a generic "old" state.

### Recommended semantic split
- Strong recommendation:
  - separate `time status`, `replacement status`, and `validity status`
- Working interpretation:
  - `historical`
    - no longer current/live, but still part of valid history
  - `stale_historical`
    - historical and specifically not resumable/reusable as live execution state
  - `superseded`
    - replaced by a newer canonical successor for the same semantic slot
  - `revoked`
    - previously accepted/active decision or state was explicitly withdrawn
  - `reopened`
    - an object previously treated as settled/completed became active again
  - `archived`
    - hidden from default operational surfaces but retained and queryable
  - `removed`
    - live backing object is gone, but history may remain

### Important distinction examples
- `historical` vs `superseded`
  - every superseded object is historical
  - not every historical object is superseded
- `superseded` vs `revoked`
  - `superseded` = replaced by newer truth
  - `revoked` = prior acceptance/approval/promotion was invalidated or withdrawn
- `archived` vs `historical`
  - `historical` is record/time truth
  - `archived` is visibility/operational-surface policy
- `removed` vs `revoked`
  - `removed` is backing-object or storage-presence state
  - `revoked` is semantic validity state

### Candidate application by object family
- attempts
  - already have `stale_historical`
  - should also expose when an attempt is superseded by later remediation/graph generation
- promotions
  - need explicit distinction between:
    - current accepted promotion
    - historical prior promotion
    - revoked promotion
    - superseded promotion if replaced by a later accepted promotion
- concerns
  - lifecycle already includes `active`, `acknowledged`, `resolved`, `dismissed`
  - still needs historical semantics:
    - merged/split/superseded concern records
    - resolved-but-historical concern lineage
- graph patches
  - old path/generation is historical
  - invalidated prior path may be superseded by newer generation
  - the patch request/decision record itself may later be historical without being revoked
- recovery records
  - restore attempts and recovery episodes need current vs historical semantics
  - failed or abandoned recovery attempts should remain visible without masquerading as current recovery truth
- lane/worktree records
  - backing worktree may be removed
  - lane may still be historical
  - archival policy should be separate from semantic validity

### UI direction
- Recommended rule:
  - the UI should show these semantics explicitly and consistently, not infer them ad hoc by color or disappearance
- Examples:
  - `Historical`
  - `Superseded by Generation 4`
  - `Promotion Revoked`
  - `Reopened by New Evidence`
  - `Worktree Removed`
  - `Archived`
- This matters especially in:
  - Ledger exact records
  - History chronology
  - Graph generations
  - Seams completion/promotions
  - lane/worktree cleanup lifecycle

### Contradictions / gaps surfaced
- Attempts have a clearer historical contract than other major record families.
- There is not yet one shared semantic glossary for `historical` / `superseded` / `revoked` / `reopened` / `archived` / `removed`.
- Deletion/archive language in storage docs risks bleeding into semantic validity language if not separated carefully.
- Orchestrator/UI docs currently refer to some of these ideas conceptually, but not yet as one consistent cross-record system.

### Candidate fixes to carry forward
- Define a shared record-semantic vocabulary applied across:
  - attempts
  - promotions
  - concerns
  - graph patches
  - recovery records
  - lane/worktree objects
- Add explicit successor/predecessor links where `superseded` is possible.
- Keep visibility policy (`archived`, hidden from default lists) separate from semantic state (`historical`, `revoked`, `superseded`).
- Ensure exact-record surfaces expose why a record is no longer current rather than simply dimming it.

### Do-not-forget details
- `stale_historical` is specifically stronger than plain `historical`; it carries non-resumable/non-live semantics.
- old graph paths should remain visible and clickable even when superseded.
- these semantics will affect search, exports, reconciliation, and help/glossary copy later.

## Research Progress - 2026-03-16 - Project-Level Run Relationship Clarification

### Confirmed clarification
- Multiple Orchestrator runs within the same project may be completely unrelated.
- Example:
  - run A adds one feature
  - run B later adds a different feature
  - both are in the same project/repo
  - neither should imply lineage or semantic succession relative to the other unless an explicit relationship exists

### Implications
- `historical run` must not imply:
  - predecessor/successor relationship
  - continuation of the same orchestration thread
  - supersession by a newer project run
  - shared seam/package/node identity
- `historical` at the run level should mean only:
  - not the currently focused live run
  - or older in time than another selected/current run
- Relationship must be explicit, not inferred from same-project membership.

### Recommended run-semantics split
- Distinguish:
  - `historical run`
  - `related run`
  - `derived run`
  - `retry/recovery run` or continuation lineage if such a concept exists later
- Working interpretation:
  - `historical run` = any non-active/non-focused run retained for the project
  - `related run` = explicitly linked by user/system relationship metadata
  - `derived run` = intentionally spawned from or based on another run's outputs/graph/contracts
- Default rule:
  - same project does not mean related
  - same repo does not mean related
  - temporal order does not mean related

### UI direction
- History should default to chronological project run history, not lineage history.
- If there is no explicit relationship, runs should appear as separate entries only.
- If explicit relationships are introduced later, the UI may add:
  - `derived from run ...`
  - `retry of run ...`
  - `continuation of run ...`
  - `shares feature seam with run ...`
- But those must be explicit metadata, not inferred by heuristics.

### Search / routing implication
- Search results should preserve run identity exactly and avoid collapsing similarly named seams/packages/nodes across unrelated runs.
- Cross-run navigation should switch focus to the selected run, not imply that the selected object is part of the currently focused run's lineage.

### Historical semantics refinement
- At the run level:
  - `historical` is mostly a focus/time classification
  - not a semantic replacement classification
- `superseded`, `revoked`, `reopened`, etc. should apply only where real object lineage/validity relationships exist, not to arbitrary project runs.

### Candidate fixes to carry forward
- Keep project run history chronological-first.
- Add explicit run-relationship metadata if the product later wants cross-run derivation/continuation concepts.
- Avoid UI copy like `superseded by newer run` unless there is an explicit relationship proving that.

## Research Progress - 2026-03-16 - Concern Record Lifecycle / Details

### Targeted docs read
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Run_Graph_View.md`
- existing concern entries in this working ledger

### Key findings
- The prior discussion already established the high-level concern model well:
  - concern is first-class
  - lifecycle includes `active`, `acknowledged`, `resolved`, `dismissed`
  - canonical concern creators are runtime / package overseer / seam overseer / corroboration outcome / graph patch logic
  - workers may nominate but should not mint canonical concerns directly
- The local docs are still relatively sparse on exact concern record shape.
- Compared with attempts/blocked/remediation, concerns currently lack:
  - explicit canonical record schema
  - merge/split/supersession semantics
  - relationship rules to reviews/corroboration/graph patches/recovery
  - stronger search/routing semantics

### Recommended concern object split
- Strong recommendation:
  - distinguish between:
    - `concern record`
    - `concern source event/ref`
    - `concern projection`
- Working interpretation:
  - `concern record` = canonical durable object with stable identity and lifecycle
  - `concern source event/ref` = review finding, corroboration result, blocked episode, patch result, recovery outcome, etc. that supports the concern
  - `concern projection` = surface-specific rendering for Progress / Seams / Evidence / History / Ledger

### Recommended minimum concern record shape
- Concern record should likely carry:
  - `concern_id`
  - `project_id`
  - `run_id?`
  - scope object refs:
    - `seam_id?`
    - `package_id?`
    - `node_id?`
    - `attempt_id?`
    - `lane_id?`
    - `worktree_id?`
  - `category`
  - `severity`
  - `status`
  - `summary`
  - `detail_ref?`
  - `owner_kind`
  - `owner_ref?`
  - `created_by_kind`
  - `created_by_ref?`
  - `first_seen_at_utc`
  - `last_seen_at_utc`
  - `resolved_at_utc?`
  - `dismissed_at_utc?`
  - `acknowledged_at_utc?`
  - evidence/source refs:
    - `source_refs[]`
    - `evidence_refs[]`
    - `artifact_refs[]`
    - `review_refs[]`
    - `corroboration_refs[]`
    - `graph_patch_refs[]`
    - `recovery_refs[]`
  - lineage refs:
    - `parent_concern_id?`
    - `superseded_by_concern_id?`
    - `merged_into_concern_id?`
    - `split_from_concern_id?`
  - attention fields:
    - `visibility_level`
    - `attention_level`
    - `chatworthy`
    - `blocking_effect?`

### Category / severity direction
- Good category set likely needs to align with weak-integration groupings plus runtime/governance classes:
  - `wiring`
  - `workflow`
  - `state_contract`
  - `gui_alignment`
  - `design_architecture`
  - `quality`
  - `evidence_gap`
  - `corroboration`
  - `recovery`
  - `account_usage_pressure`
  - `projection_trust`
- Severity should probably stay independent from blocking semantics:
  - severity answers "how bad is it"
  - blocking_effect answers "what does it prevent"

### Lifecycle direction
- Existing lifecycle still seems right:
  - `active`
  - `acknowledged`
  - `resolved`
  - `dismissed`
- Strong clarification:
  - `acknowledged`
    - user/operator has seen and accepted the concern as still real but not requiring immediate noise
  - `dismissed`
    - concern presentation was intentionally hidden/rejected as actionable framing
    - should require rationale when it disagrees with corroborated/high-severity evidence
  - `resolved`
    - underlying truth changed
    - should record `resolution_kind`
- Candidate `resolution_kind` values:
  - `fixed`
  - `accepted_risk`
  - `superseded`
  - `merged`
  - `split`
  - `invalidated`
  - `obsoleted_by_patch`
  - `obsoleted_by_recovery`

### Merge / split / supersession direction
- Concerns should not duplicate endlessly when the same underlying issue reappears.
- Recommended rules:
  - same issue persists with more evidence:
    - update existing concern
    - append sources/evidence
    - allow severity/attention escalation
  - one concern was too broad and really contains separate issues:
    - split into child concerns with lineage links
  - two concerns are actually the same issue:
    - merge into one retained concern id
    - close/redirect the merged-away ids explicitly
  - an older framing is replaced by a better/newer concern object:
    - mark older concern as `resolved` with `resolution_kind = superseded` or use explicit supersession linkage

### Relationship to reviews / corroboration / graph patch / recovery
- Recommended relationship model:
  - reviews and corroboration do not have to create new concern ids every time
  - they may:
    - create a new concern
    - reinforce an existing concern
    - downgrade/invalidate an existing concern
- Specific interaction rules:
  - review finding:
    - may nominate a concern or attach evidence to an existing concern
  - corroboration outcome:
    - may confirm/deny/escalate/downgrade concern credibility
    - should be able to turn a nominated concern into an accepted canonical concern
  - graph patch:
    - may resolve a concern
    - may supersede a concern with successor concerns if the patch reframes the issue
  - recovery:
    - may resolve operational concerns
    - may create follow-on concerns if restore/recovery exposes deeper integrity issues

### Concern ownership / authority direction
- Need to distinguish:
  - concern owner for follow-up
  - concern creator/source
  - concern resolver
- Good owner kinds still look like:
  - `Runtime`
  - `Package Overseer`
  - `Seam Overseer`
  - `Corroboration`
  - `Graph Patch`
  - `Recovery`
  - `User`
  - `External Resource`
- A concern should be allowed to change owner over time without changing identity.

### Search / routing direction
- Concern results should be object-first.
- Search result should route based on what the user likely needs:
  - operational concern summary -> `Progress` or `Seams`
  - proof/evidence-heavy concern -> `Evidence`
  - exact concern record / merge-split lineage -> `Ledger`
  - lifecycle story -> `History`
- Concern result should carry:
  - focused run implications
  - target tab
  - selected concern id
  - related object context

### UI direction
- `Progress`
  - concern attention/urgency projection
- `Seams`
  - grouped concern clusters by seam/package and weak-integration category
- `Evidence`
  - concern-backed proof and source artifacts
- `History`
  - concern timeline and major lifecycle transitions
- `Ledger`
  - exact concern record, sources, lineage, merge/split/supersession, acknowledgment/dismissal rationale

### Contradictions / gaps surfaced
- Concern importance is already established, but canonical storage/contract shape is still underdefined.
- There is no obvious current concern event family or concern record family in the local docs comparable to attempts/blocked/remediation.
- Merge/split/supersession logic for concerns is currently discussion-only, not contract-level.
- Concern interaction with corroboration and graph patch is conceptually clear but not yet formally modeled.

### Candidate fixes to carry forward
- Add a canonical concern record family and corresponding projection contract.
- Add explicit concern lineage fields for merge/split/supersession.
- Add `resolution_kind` and rationale requirements for dismiss/resolve paths.
- Define how nominated findings become canonical concerns.
- Define concern-to-review/corroboration/patch/recovery linkage explicitly.

### Do-not-forget details
- concerns should remain shared objects across surfaces, not duplicated local alert rows
- blockers requiring action must not be trivially dismissible into a false sense of health
- projection-trust failures and weak-integration findings may both mint real concerns, but they are not the same category of concern

## Research Progress - 2026-03-16 - Action Confirmation / Undo Policy

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/MiscPlan.md`
- `Plans/Contracts_V0.md`

### Key findings
- The docs already contain many action-specific confirmation rules:
  - cancel run -> confirmation
  - rollback to restore point -> diff preview + confirmation
  - clean workspace / prune evidence -> confirmation
  - delete thread / remove skill / delete file -> confirmation
  - create repository -> non-bypassable confirmation
  - HITL approvals use explicit allowed actions rather than generic confirm modals
- What is missing is a shared policy for Orchestrator/runtime actions specifically.
- There is still no unified classification answering:
  - which actions need no confirmation
  - which need light confirmation
  - which need strong confirmation
  - which are non-bypassable/hard-gated
  - which are logically undoable vs only compensatable by later actions

### Recommended action classes
- Strong recommendation:
  - classify actions by both `confirmation level` and `reversibility`
- Candidate confirmation levels:
  - `none`
  - `light`
  - `strong`
  - `hard_gate`
- Candidate reversibility classes:
  - `immediate_undo`
  - `compensating_action_only`
  - `non_reversible`

### Working interpretation
- `none`
  - safe navigation/focus actions
  - low-risk presentation actions
  - no user-data or live-runtime mutation
- `light`
  - moderate-impact actions where accidental activation is plausible
  - short confirm or inline affordance is enough
- `strong`
  - actions that may discard local state, remove artifacts/worktrees, revoke accepted state, or materially change live execution
  - should show scope and consequence clearly
- `hard_gate`
  - actions that must go through a canonical approval/blocked flow and cannot be bypassed by generic UI confirmation
  - examples already exist in HITL and explicit remote-side-effect safety flows

### Reversibility direction
- `immediate_undo`
  - UI can offer a direct undo/revert path within a practical window
  - example class: reversible local presentation/layout actions, some editor-level reverts
- `compensating_action_only`
  - no true undo, but a later action can change the system back or restore equivalent behavior
  - examples:
    - acknowledge/dismiss concern
    - reopen after revoke
    - restore from safe point / restore point
    - recreate a pruned worktree lane only via new runtime action, not true undo
- `non_reversible`
  - action destroys or mutates durable/live state in a way that is not directly undoable
  - examples:
    - removing a worktree directory
    - pruning evidence
    - deleting records/skills/files when no protected restore path exists

### Recommended action-family mapping
- `none`
  - open/focus/navigate/deep-link
  - open evidence/history/ledger/source control
  - tab-local filter/sort/search changes
- `light`
  - acknowledge minor concern
  - dismiss non-blocking advisory
  - switch focused run
  - open resolution thread
- `strong`
  - pause/cancel live run
  - start fresh attempt
  - retry from safe point
  - remove/prune/archive worktree
  - clean workspace / clean all worktrees
  - prune evidence
  - revoke promotion / seam completion
  - merge/split concerns
  - delete run if that remains allowed at all
- `hard_gate`
  - approve/reject HITL boundaries
  - graph patch application when it changes canonical graph generation
  - remote-side-effect actions with explicit non-bypassable policy
  - any approval path whose allowed actions are defined by runtime blocked/HITL contracts rather than generic UI choice

### Recommended confirmation payload rules
- `light` confirm should show:
  - action name
  - target object
- `strong` confirm should show:
  - action name
  - target object(s)
  - concrete consequence summary
  - whether local work/artifacts/history remain
  - reversibility class
- `hard_gate` should show:
  - runtime-defined allowed actions
  - why the gate exists
  - exact consequence of each allowed action
  - no hidden alternative path

### Undo / post-action affordance direction
- Recommended rule:
  - do not over-promise "undo" when the system really only supports compensating actions
- Good labels:
  - `Undo`
    - only when true immediate undo exists
  - `Reopen`
  - `Restore`
  - `Retry from Safe Point`
  - `Create New Lane`
  - `Re-request Promotion`
  - `Reapply`
- This matters because many orchestration actions are not true editor-style undo operations.

### Concern / promotion / graph-patch implications
- concerns
  - acknowledge/dismiss may be `light` or `strong` depending on severity/blocking effect
  - merge/split should be `strong`
- promotions
  - promote may be normal action when runtime says eligible
  - revoke should likely be `strong`
- graph patch
  - request patch may be `strong`
  - apply accepted patch should likely be `hard_gate` or runtime-controlled strong action because it changes canonical graph generation

### Source Control / cleanup implications
- narrow Source Control panel means destructive actions there should likely route through compact but clear confirmation patterns, not giant forms
- worktree prune/remove and cleanup actions should disclose:
  - whether the backing worktree will be removed
  - whether historical lineage remains
  - whether there is any direct restore path

### Contradictions / gaps surfaced
- Confirmation behavior exists in many isolated places, but there is no shared action policy spanning runtime, Orchestrator, Source Control, cleanup, and review/governance actions.
- The current docs sometimes use "revert", "rollback", "restore", and "undo" in different domains without a clear global distinction.
- `Delete Run` in History looks especially questionable until delete semantics and reversibility are defined more carefully.

### Candidate fixes to carry forward
- Add a shared action policy matrix:
  - action family
  - confirmation level
  - reversibility class
  - canonical recovery path
- Normalize copy:
  - `Undo` only for real undo
  - `Restore` / `Rollback` / `Retry from Safe Point` / `Reopen` for distinct cases
- Bind high-consequence runtime actions to canonical blocked/HITL command contracts where appropriate instead of ad hoc UI confirms.

### Do-not-forget details
- confirmation is not the same as authorization; some actions require runtime/HITL gating, not just a modal
- destructive worktree/cleanup actions must preserve historical lineage even when the live object is removed
- strong confirmations should be consequence-specific, not generic "Are you sure?"

## Research Progress - 2026-03-16 - Exact Artifact / Record Shapes

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Contracts_V0.md`
- `Plans/FinalGUISpec.md`
- `Plans/Run_Graph_View.md`

### Key findings
- The docs already distinguish several important things:
  - evidence vs artifacts
  - parent-summary artifact vs evidence summary
  - preview subjects can be document-backed or artifact-backed
  - exact records belong in Ledger while summary/inspection lives elsewhere
- The problem is that many major record families are named but not shaped clearly enough:
  - review record
  - corroboration packet/result
  - graph patch request / applied result
  - promotion record
  - recovery record
  - state transition report
- Compared to attempts/blocked/usage, these families still lack a normalized envelope and linkage story.

### Recommended envelope direction
- Strong recommendation:
  - use a shared record-envelope pattern across major governance/runtime record families
- Candidate shared envelope fields:
  - `record_id`
  - `record_kind`
  - `project_id`
  - `run_id?`
  - scope refs:
    - `seam_id?`
    - `package_id?`
    - `node_id?`
    - `attempt_id?`
    - `promotion_id?`
    - `concern_id?`
    - `lane_id?`
    - `worktree_id?`
  - `status`
  - `created_at_utc`
  - `created_by_kind`
  - `created_by_ref?`
  - `superseded_by_record_id?`
  - `source_refs[]`
  - `artifact_refs[]`
  - `evidence_refs[]`
  - `summary`
  - `detail_ref?`
- Benefit:
  - Ledger and exports can inspect different record families consistently
  - search/routing can reuse common routing fields

### Review record direction
- A review record likely needs:
  - `review_id`
  - review kind:
    - package review
    - seam review
    - verifier/reviewer review
  - target scope refs
  - requested/effective reviewer identity
  - review criteria/profile
  - findings summary
  - finding refs / concern refs
  - verdict / decision
  - linked artifacts/evidence
  - timestamps
- Important rule:
  - review findings may nominate or update concerns, but the review record itself should remain distinct from concern records

### Corroboration record direction
- Corroboration likely wants at least two layers:
  - `corroboration_request` / packet
  - `corroboration_result`
- Packet should likely carry:
  - claim/issue under test
  - target scope
  - why corroboration was triggered
  - evidence set / source refs
  - required quorum model
  - participating actor refs
- Result should likely carry:
  - participant outputs
  - quorum result
  - accepted / not accepted / advisory-only result
  - resulting concern/promotion/patch implications

### Graph patch record direction
- Graph patch likely needs:
  - `graph_patch_request`
  - `graph_patch_result`
- Request should carry:
  - patch point
  - triggering issue/concern refs
  - requested structural change summary
  - affected generation
  - requester identity
- Result should carry:
  - old generation
  - new generation
  - invalidated path refs
  - new path refs
  - surviving/rejoined path refs
  - resulting concern/promotion/recovery implications

### Promotion record direction
- Promotion record should likely include:
  - promotion class
    - `lane_to_package`
    - `package_to_seam`
    - `seam_completion`
  - source scope and target scope refs
  - eligibility state at decision time
  - blocking refs / concern refs
  - review/corroboration refs
  - decision outcome
  - revocation/reopen lineage if it later changes

### Recovery record direction
- Recovery record likely needs:
  - recovery kind
    - safe-point restore
    - restart reconciliation
    - blocked prerequisite resolution
    - lane/worktree restore
  - target scope refs
  - trigger reason
  - preconditions
  - result
  - resulting attempt/run linkage
  - affected concern refs

### State transition report direction
- A state transition report looks useful as a shared exact record for consequential transitions:
  - from state
  - to state
  - target object
  - actor/source
  - why transition occurred
  - prerequisite evidence / review / corroboration refs
  - resulting downstream obligations
- This may help avoid every major object family inventing bespoke "decision summary" fields.

### Artifact vs record distinction
- Strong recommendation:
  - keep records and artifacts separate
- Working interpretation:
  - record = canonical structured object in Ledger/export/search/routing
  - artifact = file/blob/renderable output linked from the record
- Examples:
  - review markdown summary = artifact
  - review record = structured ledger object
  - corroboration packet JSON/markdown = artifact
  - corroboration result record = structured object

### Export implication
- Export contracts should likely use the record envelope as the manifest backbone.
- Then artifact files/blobs attach by reference rather than replacing record structure.

### Contradictions / gaps surfaced
- The product already assumes many exact record families, but the local docs do not shape them consistently.
- Artifacts are discussed more concretely than the governing record objects in several places.
- Search, deep links, and Ledger exact-record views will remain awkward until these record shapes are normalized.

### Candidate fixes to carry forward
- Define a shared record-envelope convention for governance/runtime record families.
- Define exact minimum shapes for:
  - review
  - corroboration request/result
  - graph patch request/result
  - promotion
  - recovery
  - state transition report
- Keep file/blob artifacts linked to records, not substituted for records.

### Do-not-forget details
- `Evidence` and `Artifacts` panes should remain distinct even when both link back to the same underlying record.
- parent-summary artifacts and UI evidence summaries are not interchangeable and should not be collapsed.
- search and deep-link routing will benefit a lot from record envelopes carrying stable scope refs.

## Research Progress - 2026-03-16 - Export Contracts

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/Widget_System.md`

### Key findings
- Export support already exists in fragments:
  - config bundles are clearly defined (`.pm-bundle`)
  - thread export/share is defined
  - Usage/Ledger export is mentioned as CSV/JSON
  - Evidence items can be exported
  - storage plan mentions thread/run history export to JSONL/JSON
- Orchestrator-specific export contracts are still underspecified.
- Current language often says "export filtered view" but does not clearly answer:
  - what is the canonical manifest
  - whether exports are view-shaped or record-shaped
  - how artifacts, records, and references are packaged together
  - what happens when exported content includes historical, superseded, or removed backing objects

### Recommended export split
- Strong recommendation:
  - distinguish:
    - `record export`
    - `bundle export`
    - `view export`
- Working interpretation:
  - `record export`
    - exact structured object(s), canonical ids, references, metadata
  - `bundle export`
    - manifest + records + attached artifacts/blobs/files
  - `view export`
    - user-facing convenience representation of the current filtered table/list/chart

### Recommended Orchestrator export families
- Likely export families needed:
  - `Evidence export`
  - `Artifact export`
  - `Ledger export`
  - `Run export`
  - `Record export` for single exact records
- Working expectation:
  - `Ledger export` should be record-shaped first, CSV/JSON second
  - `Evidence export` should preserve evidence/artifact distinction
  - `Run export` should include a manifest that ties together:
    - run metadata
    - exact records
    - linked artifacts/evidence
    - historical/superseded status flags where relevant

### Manifest direction
- Strong recommendation:
  - every non-trivial Orchestrator export should include a manifest
- Candidate manifest fields:
  - `export_id`
  - `export_kind`
  - `project_id`
  - `run_id?`
  - `focused_run_id?`
  - `generated_at_utc`
  - `source_surface`
  - `filter_summary`
  - `record_counts`
  - `artifact_counts`
  - `included_record_ids[]`
  - `included_artifact_ids[]`
  - `status_notes`
  - `schema_version`
- This makes exported bundles inspectable and auditable later.

### Record-shaped export rule
- Recommended rule:
  - exact-record surfaces should export canonical records, not UI-specific transformed rows
- Implication:
  - `Ledger` export should preserve canonical ids and structured fields
  - CSV is fine as a convenience projection
  - JSON/JSONL should remain close to canonical record structure

### Evidence / artifact export direction
- Evidence export should likely include:
  - evidence records
  - linked artifact refs
  - evidence summaries
  - concern/review/corroboration linkage where present
- Artifact export should likely focus on:
  - actual files/blobs
  - metadata manifest
  - source record refs
- Important rule:
  - exporting an artifact alone should still preserve enough metadata to know what record/run/object it came from

### Historical / removed-object implication
- Exports must preserve historical truth even when live backing objects no longer exist.
- Example:
  - removed worktree or retired graph path still exports as record metadata with historical status
  - absence of a live backing file/worktree should not corrupt the exported record bundle

### Filtered-view export direction
- `view export` is still useful, but should be clearly labeled as a convenience format.
- Example:
  - filtered ledger CSV
  - filtered concern table CSV
  - analytics chart/table export
- These should not be treated as canonical archival formats.

### Contradictions / gaps surfaced
- Config export/import is much more explicit than Orchestrator export contracts.
- Current Orchestrator usage/evidence export language is too UI-view-centric.
- No shared export-manifest contract is obvious for Orchestrator record families.

### Candidate fixes to carry forward
- Add a shared Orchestrator export manifest contract.
- Define record-first exports for Ledger/History/concern/review/promotion/patch/recovery families.
- Keep CSV/table exports as convenience view exports, not as canonical archival exports.
- Preserve historical/superseded/removed semantics in exported metadata.

### Do-not-forget details
- exact-record exports will depend on the record-envelope work from the previous seam
- Evidence and artifact exports should not collapse into one undifferentiated zip of files
- export/import of config bundles is already strong; Orchestrator exports should reach similar clarity

## Research Progress - 2026-03-16 - Settings Override Presentation

### Targeted docs read
- `Plans/Multi-Account.md`
- `Plans/Models_System.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/Personas.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`

### Key findings
- The docs already define most of the raw data needed for this seam:
  - requested/effective Persona display requirements
  - requested/effective platform/model/variant/runtime controls
  - scoped override lifecycle for Persona overrides
  - project-owned multi-account policies plus run snapshots and effective account selection
  - provider-gap disclosure rules (`honored`, `skipped`, `clamped`)
- The main gap is presentation coherence.
- The system currently has at least three different concepts that the UI must not blur:
  - `inherit/override` from configuration layering
  - `requested/effective` from runtime resolution
  - `honored/skipped/clamped` from provider capability handling

### Recommended conceptual split
- Strong recommendation:
  - treat these as three separate axes:
    - `source axis`
    - `request axis`
    - `execution/result axis`
- Working interpretation:
  - `source axis`
    - where the configured value came from
    - e.g. app default, project override, role policy, tier mapping, manual override
  - `request axis`
    - what the run/attempt actually asked for at execution start
  - `execution/result axis`
    - what the provider/runtime actually used and whether controls were honored/skipped/clamped

### Recommended display grammar
- Good canonical display groups:
  - `Inherited from`
  - `Overridden by`
  - `Requested`
  - `Effective`
  - `Reason`
  - `Support`
- Example mental model:
  - config/source:
    - `Inherited from Project policy`
    - `Overridden by Package override`
  - request:
    - `Requested model: claude/sonnet`
  - execution:
    - `Effective model: claude/sonnet`
    - `Reasoning effort: requested high -> skipped`
    - `Reason: provider does not support effort on this model`

### Source-layer direction
- Likely source layers that need explicit labeling:
  - app default
  - project override
  - surface default
  - role policy
  - seam/package/node mapping
  - manual override
  - turn/session/run/task/subagent scoped override
- Important rule:
  - UI should show the winning source, not force the user to reconstruct precedence from docs
- Especially important for:
  - Persona
  - provider/model/variant/effort
  - auth mode
  - account policy
  - worker policy (`subagent` vs `agent`, fresh vs reused worker)

### Requested/effective direction
- Requested/effective must remain runtime-facing and auditable.
- Minimum runtime-facing fields still align with earlier findings:
  - requested Persona
  - effective Persona
  - requested platform/model/variant/auth/account policy
  - effective platform/model/variant/auth/account
  - selection/switch reason
  - skipped/clamped controls
- Recommended UI rule:
  - if requested == effective and nothing was skipped/clamped, compact display is fine
  - if they differ, the UI must expand/disclose the difference visibly

### Honored / skipped / clamped direction
- This is not the same as requested/effective difference in general.
- A control may be:
  - requested and honored exactly
  - requested and clamped
  - requested and skipped
  - not requested at all
- Recommended display:
  - use explicit support chips or rows for runtime controls
  - examples:
    - `Reasoning effort: High -> Skipped`
    - `Temperature: 0.2 -> Honored`
    - `Top-p: 1.0 -> Clamped to 0.9`

### Surface-specific presentation direction
- `Settings`
  - source-axis heavy
  - show inheritance and override origin clearly
  - should answer: "what will be requested if I run from here?"
- `Orchestrator / Graph inspector / run detail`
  - request/execution-axis heavy
  - should answer: "what did this run/attempt request, what actually happened, and why?"
- `Progress`
  - compact requested/effective summary for live context
- `History` / `Ledger`
  - exact audit trail of requested/effective + reason + source snapshot refs
- `Authentication` / `Usage`
  - effective account/auth emphasis, with project-policy and manual-preferred-account source disclosure where relevant

### Worker-policy implication
- The same display grammar should extend beyond provider/model/persona/account.
- Worker policy likely needs the same treatment:
  - source: project/package/node override source
  - requested: `subagent`, `fresh_worker`
  - effective: what runtime actually used
  - reason: why it changed if it changed
- This will matter in node inspector and run detail views.

### Multi-account implication
- Multi-account adds a second layer of confusion if not presented carefully:
  - requested account policy is not the same as effective account
  - manual preferred account is not the same as guaranteed selected account
  - project policy snapshot is not the same as live runtime decision
- Recommended display in runtime surfaces:
  - `Account policy: Auto switch (Project policy)`
  - `Effective account: gemini-oauth-2`
  - `Switch reason: rate_limit_pressure`

### Historical-run implication
- Historical run views should show the frozen requested/effective state from that run, not recompute from current settings.
- Current settings/inheritance may still be shown elsewhere, but must not overwrite history.

### Candidate UI patterns
- In settings rows:
  - primary value + small origin badge
  - expandable disclosure shows full precedence chain
- In inspectors/detail:
  - two-column requested/effective block
  - support-status chips for controls
  - reason text below
- In compact surfaces:
  - only show deltas when there is a difference
  - otherwise keep the line short

### Contradictions / gaps surfaced
- Requested/effective is well defined in runtime docs, but inherited/override presentation is not unified across settings surfaces.
- Manual override lifecycle exists for Persona, but similar presentation rules are less explicit for provider/model/account/worker-policy overrides.
- Without a shared grammar, users will confuse:
  - current settings winner
  - requested run state
  - effective runtime result

### Candidate fixes to carry forward
- Define a shared override-display grammar for all runtime-related settings surfaces.
- Separate `source`, `requested`, and `effective` in UI language and data models.
- Add origin badges / precedence disclosure in Settings.
- Add requested/effective + support-state disclosure blocks in runtime/history surfaces.
- Extend the same model to worker policy, not just provider/model/persona/account.

### Do-not-forget details
- historical run views must stay frozen to historical requested/effective state
- compact surfaces should show deltas only when they matter
- provider-gap disclosure (`honored` / `skipped` / `clamped`) is a third concept, not just another word for override

## Research Progress - 2026-03-16 - Auto Persona Resolution Rules

### Targeted docs read
- `Plans/Personas.md`
- `Plans/Prompt_Pipeline.md`
- `Plans/interview-subagent-integration.md`
- `Plans/Models_System.md`
- `Plans/orchestrator-subagent-integration.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The global requested-Persona precedence is already strong and should remain the backbone:
  - explicit manual/run override
  - scoped natural-language override
  - surface-specific explicit mapping
  - surface auto resolver candidate
  - config default
  - canonical fallback
- Orchestrator auto mode is already described as producing candidates from:
  - project context
  - language
  - domain
  - framework
  - tier level
  - operation type
- Interview already has a more explicit deterministic stage resolver.
- The remaining gap is mostly for Orchestrator and cross-surface explanation:
  - what exact hints influence auto choice
  - how actor/work-type biases differ
  - how fallback behaves when candidates are unavailable
  - how much of that reasoning is surfaced to the user without dumping internals

### Recommended resolver shape
- Strong recommendation:
  - keep one global precedence chain
  - but require each surface auto resolver to emit a deterministic ranked candidate set plus explanation metadata
- Candidate resolver inputs for Orchestrator should likely include:
  - actor type
    - package overseer
    - seam overseer
    - node worker
    - verifier/reviewer
    - corroborator
    - graph patch planner
    - recovery actor
  - work type / operation type
    - implementation
    - review
    - integration
    - corroboration
    - recovery
    - planning/patching
  - scope level
    - seam
    - package
    - node
    - attempt
  - project hints
    - language(s)
    - framework(s)
    - repo/domain traits
    - GUI-heavy vs backend-heavy vs infra-heavy indicators

### Deterministic input priority direction
- Good input priority inside the auto resolver:
  - hard requirement from plan/tier/surface contract
  - actor-type bias
  - operation-type bias
  - scope-level bias
  - language/framework/domain hints
  - project default tendencies
  - final fallback
- Important rule:
  - actor type and operation type should dominate stack hints
  - example:
    - a reviewer/reviewer-pass should not silently become a coding persona just because the repo is Rust-heavy
    - a seam overseer should not collapse into a narrow implementation persona just because a framework is detected

### Orchestrator-specific direction
- Likely high-level defaults:
  - package overseer
    - execution/governance persona biased toward package-local delivery and readiness truth
  - seam overseer
    - integration/governance persona biased toward cross-package integration truth
  - node worker
    - implementation persona biased by language/framework/work type
  - verifier/reviewer
    - review persona distinct from drafting/implementation persona
  - corroborator
    - review/challenge persona distinct from original claimer
  - recovery actor
    - troubleshooting/recovery persona
  - graph patch planner
    - planning/architecture persona
- The exact persona ids may still evolve, but the mapping policy should be explicit now.

### Fallback direction
- Recommended rule:
  - if the preferred candidate is unavailable after capability/provider/model filtering, fall through deterministically to the next candidate
  - do not block solely because a preferred Persona is unavailable
  - do record:
    - requested Persona
    - effective Persona
    - selection reason
    - skipped Persona controls where relevant
- Only hard requirements should force stronger handling.

### Clarification rule
- Keep the existing Prompt Pipeline rule:
  - if two same-tier candidates remain and the system cannot choose deterministically, ask for clarification rather than speculating
- For Orchestrator specifically:
  - this should probably be rare and usually resolved by actor type + operation type
  - but it is still important for ambiguous user-driven/manual natural-language requests

### Explanation / selection-reason direction
- The auto resolver should emit concise but structured reason text.
- Good explanation pattern:
  - `Package overseer default`
  - `Seam integration default`
  - `Node implementation match: Rust + backend`
  - `Review pass default`
  - `Recovery actor default`
  - `Provider fallback from preferred persona model`
- Recommendation:
  - one short primary reason for compact UI
  - optional expanded explanation listing the strongest contributing hints
- The UI should not expose a noisy “scored all candidates” explanation by default.

### Scope / override lifecycle direction
- Scoped overrides already have strong lifecycle rules:
  - `turn`
  - `session`
  - `run`
  - `task`
  - `subagent`
- Orchestrator work likely needs careful treatment of `task` / `run` / `subagent` scopes so:
  - package-level overrides do not leak across unrelated runs
  - subagent overrides do not accidentally become package defaults
  - historical runs keep their frozen effective Persona state

### Cross-surface consistency direction
- Interview already shows a good pattern:
  - deterministic stage resolver
  - questioning/drafting/review distinction
  - clear bias rules
- Orchestrator should gain the same clarity:
  - implementation
  - review
  - corroboration
  - governance
  - recovery
  - patch planning
- Chat/Interview/Builder/Orchestrator should still share the same effective resolution record and display grammar.

### Contradictions / gaps surfaced
- The global precedence chain is clear, but Orchestrator auto-resolver specifics are still too qualitative.
- Current docs mention project/language/domain/framework/tier/operation inputs but do not fully prioritize them.
- Without a sharper actor-type mapping, `auto` risks feeling arbitrary in the rewrite model where overseer roles are much more important.

### Candidate fixes to carry forward
- Define a deterministic Orchestrator auto-resolver matrix by:
  - actor type
  - operation type
  - scope
  - stack/domain hints
- Require each auto resolver to emit:
  - ranked candidate(s)
  - winning candidate
  - concise selection reason
  - fallback reason when the preferred candidate is not the effective one
- Keep actor-type defaults stronger than stack hints.
- Reuse the Interview-style deterministic resolver pattern for other surfaces where possible.

### Do-not-forget details
- `auto` must never appear as an opaque state with no resolved Persona/reason.
- historical runs must preserve the resolved effective Persona and reason from the time of execution.
- corroboration/review personas should remain distinct from the original implementation persona whenever possible.

## Research Progress - 2026-03-16 - Help System Contract

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Glossary.md`
- `Plans/WorktreeGitImprovement.md`
- `Plans/Personas.md`
- `Plans/Multi-Account.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The app already has a strong dual-copy rule:
  - app-level `Interaction Mode (Expert/ELI5)` controls authored help/tooltip/interviewer copy
  - chat-level `Chat ELI5` is separate and must not be conflated with app help copy
- The current help/copy contract is mostly tooltip-oriented.
- The rewrite now has enough complex concepts that tooltip-only help will be insufficient.
- At the same time, the canonical model is getting denser, so “simple help” must not mutate the underlying terms or invent alternate semantics.

### Recommended help-system split
- Strong recommendation:
  - distinguish:
    - `canonical term system`
    - `help entry system`
    - `contextual help system`
- Working interpretation:
  - `canonical term system`
    - stable object/state/action names used by docs/runtime/contracts
  - `help entry system`
    - dedicated explainer pages/cards for important concepts
  - `contextual help system`
    - inline tooltips, badges, hover copy, small “what is this?” affordances

### Core help principle
- Simple help must simplify explanation, not rename the model.
- Good rule:
  - keep canonical names stable
  - explain them more simply in ELI5 mode
  - do not create parallel “friendly” object names that drift away from contracts
- Example:
  - keep `Feature Seam`
  - ELI5/help can say “A feature seam is where related packages have to work together cleanly”
  - do not rename it to something unrelated like “Feature group” unless the product explicitly chooses a user-facing alias system later

### Which concepts need dedicated help entries
- Likely dedicated entries:
  - `Feature Seam`
  - `Work Package`
  - `Package Overseer`
  - `Seam Overseer`
  - `Weak Integration`
  - `Promotion`
  - `Corroboration`
  - `Graph Patch`
  - `Reopened`
  - `Revoked`
  - requested vs effective runtime identity
  - safe point vs restore point
  - lane vs worktree
  - concern lifecycle
- Reason:
  - these are core rewrite concepts that will appear in multiple surfaces and cannot be re-explained ad hoc every time

### Which concepts can stay contextual-only
- Good candidates for contextual help only:
  - local button affordances
  - simple counts/badges
  - one-surface-only controls whose meaning is already obvious from context
  - provider-specific caveats shown near the relevant controls

### Help entry structure direction
- Strong recommendation:
  - each dedicated help entry should have a small fixed template
- Good template fields:
  - canonical name
  - short definition
  - why it matters
  - what it is not
  - common related states/actions
  - related concepts
  - surface examples / where you see it
- This matters because many of these concepts are easy to confuse:
  - `lane` vs `worktree`
  - `safe point` vs `restore point`
  - `historical` vs `superseded`
  - `acknowledged` vs `dismissed` vs `resolved`

### Related-concept linking direction
- The help system should explicitly support related links.
- Important related clusters:
  - `Feature Seam` <-> `Work Package` <-> `Weak Integration` <-> `Seam Complete`
  - `Promotion` <-> `Revoked` <-> `Reopened`
  - `Corroboration` <-> `Concern` <-> `Review`
  - `Graph Patch` <-> `Generation Updated` <-> `Historical Path`
  - `Lane` <-> `Worktree` <-> `Cleanup Eligible` <-> `Archived/Removed`
  - `Requested` <-> `Effective` <-> `Skipped/Clamped`

### Expert / ELI5 layering direction
- Recommended rule:
  - expert and ELI5 variants should share the same concept skeleton
  - differ in phrasing density and assumptions, not in substance
- Good difference:
  - Expert:
    - precise, compact, system-model language
  - ELI5:
    - plain-language explanation and one concrete example
- Bad difference:
  - ELI5 introduces weaker or alternate semantics that would mislead about actual behavior

### Surface behavior direction
- `Settings`
  - tooltip/help heavy
  - good place for “what does this setting do?” and “what wins if multiple settings apply?”
- `Orchestrator`
  - concept-heavy contextual help
  - likely needs clickable help affordances on core concepts in `Seams`, `Progress`, and inspectors
- `History` / `Ledger`
  - exact records first, but should still offer concept help links for unfamiliar states/actions

### Glossary implication
- `Plans/Glossary.md` likely needs to become the canonical concept inventory backbone, even if richer help entries live elsewhere.
- Good split:
  - Glossary = canonical short definitions
  - Help entries = fuller explanations with examples and related links

### Contradictions / gaps surfaced
- The current dual-copy contract is strong for tooltip/help text, but not yet for a concept-help system.
- There is no clearly defined “which concepts deserve full help entries” policy yet.
- Without a help-entry contract, complex rewrite terms may end up redefined inconsistently across surfaces.

### Candidate fixes to carry forward
- Define a dedicated help-entry contract with a fixed structure and related-concept links.
- Keep canonical term names stable across Expert and ELI5.
- Use Glossary as the canonical short-definition inventory.
- Explicitly identify which rewrite concepts require full help entries versus contextual help only.

### Do-not-forget details
- app-level Expert/ELI5 remains independent from chat-style simplification
- simple help must not mutate runtime truth or contract semantics
- the more concepts become first-class records/objects, the more important stable related-concept linking becomes

## Research Progress - 2026-03-16 - Projects Page Blocked-Owner / Status Model

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/Multi-Account.md`

### Key findings
- The current Projects page contract is still fairly basic:
  - project name/path
  - language badges
  - last opened
  - orchestrator status (`idle/running/paused`)
  - health indicator
- Current project health indicators are mostly repo/config existence checks:
  - green = directory exists / repo intact / config valid
  - amber = stale config / missing optional files
  - red = missing directory / corrupt repo / critical config errors
- This is useful, but it does not express the newer operational state model:
  - blocked ownership
  - main reason the project needs attention
  - multi-account pressure
  - active-vs-historical run posture
  - background activity

### Recommended status split
- Strong recommendation:
  - separate:
    - `project health`
    - `project activity`
    - `project attention`
- Working interpretation:
  - `project health`
    - setup/integrity/config viability
  - `project activity`
    - whether runs are active/paused/queued/background
  - `project attention`
    - whether something actually needs user or operator action

### Recommended top-level project card fields
- Likely required fields:
  - project name
  - path
  - language/framework badges
  - activity status
  - attention status
  - primary blocked/attention reason
  - blocked owner / attention owner when relevant
  - pressure summary
  - last active / last opened
- Good compact model:
  - `Activity`: `idle | running | paused | queued | background_active`
  - `Attention`: `none | attention_required | blocked | degraded`
  - `Health`: setup/config/repo integrity signal

### Blocked-owner direction
- The user specifically flagged this seam earlier and it still looks underdefined.
- Recommended rule:
  - when a project is in blocked/attention state, the Projects page should show the dominant current owner of that state
- Owner kinds already align with prior ledger work:
  - `Runtime`
  - `Package Overseer`
  - `Seam Overseer`
  - `Corroboration`
  - `Graph Patch`
  - `Recovery`
  - `User`
  - `External Resource`
- This should answer:
  - "who/what is the project waiting on?"

### Primary reason direction
- Projects page should not try to summarize every problem.
- Strong recommendation:
  - show one `primary attention reason` / `primary blocked reason`
  - with optional count badge for additional issues
- Candidate examples:
  - `Waiting on user approval`
  - `Seam integration blocked`
  - `Graph patch required`
  - `Recovery in progress`
  - `Provider/account pressure`
  - `Projection trust degraded`

### Pressure summary direction
- Project cards likely need compact pressure signals, not full usage details.
- Good compact summaries:
  - provider/account pressure present
  - quota pressure severity
  - signal confidence if especially important
- Example:
  - `Gemini pressure: high`
  - `Account switch active`
  - `Quota signal: heuristic`
- This should stay short and deep-link into Usage/Authentication/Orchestrator as needed.

### Active vs historical project posture
- Similar to runs, project cards should not imply that “historical project” is a real semantic class unless the product introduces archiving.
- Better distinction:
  - active workspace/project
  - recently active
  - archived/unregistered project
- If a project has no active runs but lots of historical runs, that is not itself a problem state.

### Background activity direction
- Background activity matters at project-card level.
- Recommended rule:
  - project card should surface background work independently from blocked attention
- Example:
  - a project can be:
    - `background_active`
    - with `attention_required`
    - while still not globally `blocked`

### Relationship to Orchestrator
- Projects page should summarize from canonical project-level projections rather than inventing its own status model.
- Likely it needs a small project summary projection that rolls up:
  - current active run state
  - dominant concern/blocked owner
  - highest-severity attention state
  - current pressure summary
  - health/config integrity

### Contradictions / gaps surfaced
- Current Projects page health/status model is too setup-centric for the rewrite.
- There is no obvious current project-level rollup for blocked-owner and primary attention reason.
- Existing `orchestrator status` (`idle/running/paused`) is too weak on its own to explain why a project needs attention.

### Candidate fixes to carry forward
- Define a project-summary projection with:
  - activity state
  - attention state
  - health state
  - primary blocked/attention owner
  - primary reason
  - pressure summary
- Keep project-card status compact and singular, with deep links for detail.
- Avoid turning project cards into mini dashboards; one dominant reason is better than many badges.

### Do-not-forget details
- blocked ownership should describe the dominant current issue, not every issue in the project
- project health and project attention are different things and should not share one overloaded dot
- a project with only historical runs is not inherently degraded or blocked

## Research Progress - 2026-03-16 - Notifications / Escalation Cadence

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/usage-feature.md`

### Key findings
- The docs already define many local attention behaviors:
  - Dashboard `Action Required` section
  - thread badges
  - run-graph/node blocked badges
  - warnings/toasts/banners
  - tray/system notifications for some events
  - rate-limit warning banner with dismiss cooldown
  - blocked and attention-required visual distinction
- The current rules are mostly case-by-case.
- What is still missing is a shared escalation ladder across concerns, blocked states, usage pressure, and persistent unresolved conditions.

### Recommended escalation ladder
- Strong recommendation:
  - define one shared progression:
    - `info`
    - `warning`
    - `attention_required`
    - `blocked`
    - `system_notification`
- Working interpretation:
  - `info`
    - visible in local context/history only
  - `warning`
    - in-app banner/card/badge but not necessarily action-blocking
  - `attention_required`
    - user input helpful/needed, but background progress may still continue
  - `blocked`
    - cannot continue meaningfully until required action/precondition changes
  - `system_notification`
    - out-of-app signal for events important enough to interrupt or summon the user

### Surface ladder direction
- Recommended mapping:
  - `History`
    - receives everything chronologically
  - `Progress` / `Dashboard`
    - show active warnings / attention / blocked states
  - badges
    - show compressed counts/severity markers
  - chat/thread surfaces
    - only for things that genuinely need user decision/input
  - system notifications
    - reserved for high-value, sparse events

### Resurfacing / aging direction
- The ledger already established some aging behavior for operational items.
- Strong next-step rule:
  - unresolved conditions should resurface based on severity and persistence, not on every heartbeat/update
- Candidate cadence idea:
  - immediate show on first activation
  - suppress duplicate noise while unchanged
  - resurface only when:
    - severity increases
    - owner changes
    - blocked duration crosses threshold
    - new action becomes available
    - user returns focus after time away

### Persistent blocker direction
- Persistent blockers should not become invisible just because the user dismissed a nearby warning once.
- Good rule:
  - advisory warnings may respect quiet/dismiss windows
  - real blocked states should remain represented until underlying truth changes
- This aligns with earlier concern and blocked-state work:
  - `dismissed` is presentation state, not semantic resolution
  - active blockers must not be dismissible into fake health

### System-notification direction
- System/tray notifications should stay narrow.
- Good candidates:
  - HITL approval required
  - run complete
  - major failure requiring attention
  - maybe severe rate-limit/pressure event when it materially stops progress
- Poor candidates:
  - routine warnings
  - every blocked node in a large run
  - repeated unresolved reminders without new information

### Usage/account-pressure implication
- Usage warnings already suggest:
  - configurable threshold
  - dismiss/quiet window
  - path to Usage/config
- This is a good pattern for non-blocking pressure:
  - warning banner
  - optional toast
  - quiet period
  - escalate further only if it becomes execution-blocking

### Concern / blocked-owner implication
- Concerns and blocked ownership should feed escalation, but not every concern should become a system notification.
- Recommended rule:
  - concern severity + blocking effect + owner + persistence decide escalation
- Example:
  - minor advisory concern -> local/in-app only
  - seam-blocking weak integration concern with no progress for hours -> blocked surfaces + possible system notification

### Contradictions / gaps surfaced
- There is no one explicit cross-surface escalation contract yet.
- Existing banners/cards/toasts/badges are good pieces but not yet tied to a shared cadence model.
- Rate-limit warning suppression exists conceptually, but comparable suppression/resurfacing rules are less clear for other condition classes.

### Candidate fixes to carry forward
- Define one escalation ladder shared across Orchestrator, Dashboard, thread badges, and notifications.
- Add resurfacing rules based on change/persistence thresholds rather than repeated identical events.
- Reserve system notifications for sparse, high-value events.
- Keep blocked-state persistence semantically stronger than dismissible warning surfaces.

### Do-not-forget details
- `attention_required` and `blocked` must remain distinct everywhere
- resurfacing should respond to meaningful change, not spam the user on every scheduler tick
- the system should not silently demote a persistent blocker into history just because time passed

## Research Progress - 2026-03-16 - Scale / Performance Model

### Targeted docs read
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`

### Key findings
- The graph tab already has the strongest explicit scale contract in the current docs.
- `Run_Graph_View.md` defines concrete targets:
  - render target: 500 nodes, stretch 1000
  - 60 fps pan/zoom
  - layout under 500ms at 500 nodes
  - initial load under 1s at 500 nodes
- The graph spec also already defines the right implementation direction:
  - viewport culling with overscan
  - table virtualization
  - per-generation layout caching
  - incremental row/item updates instead of full replacement
  - burst throttling at frame cadence
  - optional canvas-style fallback if rectangle-based rendering drops below target performance
- `storage-plan.md` already supports the broader pattern the rewrite needs:
  - projections are disposable
  - UI can fetch slices
  - backend pages from redb projections or seglog-derived views
- `FinalGUISpec.md` has scattered virtualization/pagination language for other surfaces, but not an Orchestrator-wide large-run policy.

### Recommended scaling stance
- Strong recommendation:
  - treat scale as a cross-tab contract, not just a graph-tab concern
- The rewrite is already assuming:
  - thousands of nodes
  - multiple graph generations retained visibly
  - many concerns, reviews, promotions, patches, recovery records, and usage records
  - many retained/historical lanes and worktrees
- That means the performance model must explicitly cover:
  - `Seams`
  - `Node Graph`
  - `Evidence`
  - `History`
  - `Ledger`
  - Progress widgets and cross-tab inspectors

### Tab-by-tab direction
- `Node Graph`
  - keep the current culling + caching + throttled-update model
  - preserve old generations in the data model, but do not render every historical path at full fidelity all the time
  - use generation visibility controls, focus mode, and density-aware overlays so historical branches stay available without overwhelming the live path
- `Seams`
  - must use progressive disclosure rather than fully expanded seam/package/node trees
  - top-level seam rows should load compact rollups first
  - package lists and node problem lists should expand lazily
- `Evidence`
  - evidence records and artifacts need independent virtualization/paging
  - heavy artifacts should stay metadata-first until opened
  - artifact previews should be demand-loaded, not pre-rendered for long lists
- `History`
  - should be chronological but windowed
  - initial load should show a recent slice, with explicit load-older / jump controls
  - dense event bursts should be summarized when collapsed, not force every low-level record into the initial viewport
- `Ledger`
  - must be exact, but exact does not mean fully materialized at once
  - filtered query + paging + stable sort are required
  - export can retrieve more than the viewport, but normal browsing should stay slice-based
- `Progress`
  - widgets should consume compact projections, not live-scan huge record sets per widget
  - a widget should deep-link to the native tab when the user wants dense detail

### Generation-heavy graph direction
- The graph patch model makes scale harder than the current graph spec assumes.
- Important rule:
  - generations should remain historically visible and clickable, but the UI should default to a focused generation plus nearby lineage context, not a fully expanded all-generations wall
- Good default behavior:
  - current generation emphasized
  - superseded branches visually muted
  - branch/rejoin overlays available on demand
  - minimap/search/focus-to-object remain generation-aware

### Concern / lane / record density implication
- Non-graph density may become the larger real-world problem.
- In large runs, users may accumulate:
  - many active and historical concerns
  - many corroboration/review/promotion/recovery records
  - many retained or cleanup-eligible lanes/worktrees
- So the rewrite should not assume the graph is the only heavy surface.
- A likely rule to carry forward:
  - every dense Orchestrator tab needs first-class summarization, filtering, and paging before it needs more visual chrome

### Projection trust implication
- Performance and trust are coupled.
- When projections are stale or degraded:
  - large surfaces should degrade toward smaller, record-backed slices instead of trying to fake full live fidelity
- Example:
  - stale graph projection might still support focused inspection of selected nodes/generations
  - stale ledger/history slices remain usable because they are closer to canonical records

### Contradictions / gaps surfaced
- Current graph-scale guidance is much stronger than the scale contract for `Seams`, `Evidence`, `History`, and `Ledger`.
- The current docs do not yet define how thousands-of-node runs with many generations should remain readable by default without collapsing history away.
- There is no explicit Orchestrator-wide rule yet for:
  - initial slice size
  - paging/search interplay
  - lazy expansion behavior
  - cross-tab inspector loading strategy
  - projection fallback behavior under large degraded datasets

### Candidate fixes to carry forward
- Add an Orchestrator-wide scale contract that sits above individual tab docs.
- Make slice-based loading, virtualization, lazy expansion, and demand-loaded inspectors mandatory across dense tabs.
- Define generation visibility defaults so historical branches stay available without default graph overload.
- Require widgets to use compact projections only, with deep links to native dense tabs.
- Tie scale behavior to projection-trust state so degraded projections fail gracefully instead of pretending to be fully current.

### Do-not-forget details
- exact record inspection in `Ledger` still needs paging; exactness does not require eager full materialization
- historical graph generations must stay accessible without becoming the default visual density
- non-graph tabs may become the actual scaling bottleneck sooner than the graph canvas

## Research Progress - 2026-03-16 - Command Palette / Shortcuts / Bulk Actions

### Targeted docs read
- `Plans/FinalGUISpec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Widget_System.md`
- `Plans/WorktreeGitImprovement.md`

### Key findings
- The platform already has a strong shared command foundation:
  - `Ctrl+K` / `Ctrl+P` command palette
  - command registry
  - shortcut registry
  - canonical `cmd.runtime.*` recovery command family
- `UI_Command_Catalog.md` already requires blocked-state actions to map from `allowed_action_ids[]` to canonical runtime commands rather than surface-local variants.
- `Orchestrator_Page.md` already distinguishes retry posture and recovery classes well enough to avoid a fake one-button retry model.
- What is still missing is a rewrite-specific action policy for:
  - palette exposure
  - keyboard shortcuts
  - context menus
  - multi-select / bulk actions
  - action safety at live runtime scope

### Recommended command-surface model
- Strong recommendation:
  - treat the command palette as a universal navigation and precise-action surface, not as a blanket permission to expose every dangerous runtime mutation as one keystroke away
- Good split:
  - palette-friendly:
    - open/focus tab
    - jump to run/seam/package/node/lane/concern/review/patch/recovery object
    - open inspector/detail/history/ledger/evidence context
    - run search routes
    - execute low-risk view and filter commands
  - palette-allowed but guarded:
    - recover / retry / approve / decline / replan / restore / cleanup actions that already have canonical runtime semantics and confirmation rules
  - palette-discouraged or hidden by default:
    - broad destructive bulk mutations with ambiguous target sets

### Bulk-action direction
- The current docs imply grouped navigation for affected nodes/attempts, but not a strong bulk mutation policy.
- Recommended rule:
  - bulk actions should default to navigation, triage, and low-risk state updates
  - live execution mutations should stay narrow unless the runtime has an explicit safe batch semantic for that exact action
- Good candidate bulk actions:
  - navigate to selected nodes/concerns
  - open selected items in `History`, `Evidence`, or `Ledger`
  - acknowledge multiple advisory concerns
  - archive/remove historical exports or retained views where policy clearly allows it
- Bad default bulk actions:
  - retry many nodes at once
  - apply graph patch to multiple scopes at once
  - approve multiple HITL/runtime blocked actions with one generic confirm
  - cleanup/remove many live lanes/worktrees without exact target preview

### Shortcut direction
- Keyboard shortcuts should stay useful but sparse.
- Strong recommendation:
  - shortcuts primarily target navigation, focus, search, inspector toggles, and common non-destructive actions
- Good shortcut candidates in Orchestrator:
  - focus global Orchestrator search
  - next/previous tab
  - open/close right-side inspector
  - jump between current attention items
  - fit graph / focus selected node / toggle generation overlay
- Higher-risk runtime actions should not default to global shortcuts unless they already pass the stronger action-policy rules.

### Context-menu direction
- Context menus are the right home for object-specific operational actions.
- Recommended rule:
  - object context menus should show only actions valid for that object's current state, with canonical labels from runtime semantics
- This fits especially well for:
  - node
  - concern
  - promotion
  - graph patch
  - lane/worktree
  - recovery record

### Routing contract implication
- This seam reinforces the earlier search/deep-link work:
  - command palette results, keyboard shortcuts, context menus, and widgets should route through the same destination payload model
- Good shared payload fields:
  - `project_id`
  - `focused_run_id`
  - destination tab/surface
  - selected object id and type
  - optional inspector target
  - optional filter payload
- Without that, palette actions and deep links will drift into multiple incompatible navigation systems.

### Confirmation / safety implication
- This seam connects directly to the earlier confirmation-policy work.
- Recommended rule:
  - command discoverability does not weaken confirmation requirements
- If an action is:
  - `strong` confirmation
  - `hard_gate`
  - `non_reversible`
  - or only `compensating_action_only`
  then command palette and shortcut surfaces must still honor the same gating and preview requirements.

### Source Control / worktree implication
- Because Source Control is worktree-first and physically narrow, it should lean more on context menus and focused commands than on dense inline action bars.
- Bulk worktree cleanup/archive/remove should remain preview-heavy and explicit.
- Orchestrator can expose deep links into those actions, but should not become the main place where raw Git/worktree batch cleanup is fired blindly.

### Contradictions / gaps surfaced
- The command infrastructure is ahead of the Orchestrator-specific safety policy.
- Current docs do not yet define which Orchestrator actions are:
  - palette-visible
  - shortcut-worthy
  - context-menu only
  - bulk-safe
  - bulk-forbidden
- Current grouped/bulk navigation wording could be misread as license for broad bulk execution controls unless rewrite docs tighten it.

### Candidate fixes to carry forward
- Add an Orchestrator action-surface policy that classifies actions by:
  - navigation vs mutation
  - single-target vs multi-target
  - shortcut eligibility
  - palette visibility
  - confirmation/reversibility class
- Default bulk actions to triage and navigation, not live execution mutation.
- Reuse one shared routing payload across command palette, shortcuts, widgets, search, and deep links.
- Keep canonical runtime command ids authoritative for blocked/recovery actions on every surface.

### Do-not-forget details
- palette visibility must not silently downgrade confirmation strength
- bulk actions should be far narrower than bulk navigation
- context menus are likely the cleanest home for exact object-valid live actions

## Research Progress - 2026-03-16 - Projection Health / Stale-Data Trust Execution Policy

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/usage-feature.md`
- `Plans/Contracts_V0.md`

### Key findings
- The storage/runtime side already clearly establishes the architectural baseline:
  - `seglog` is canonical
  - `redb`, Tantivy, JSONL mirrors, rollups, and UI-facing keys are projections or derived state
  - projections must be rebuildable from canonical records
- Some docs already hint at trust/freshness issues:
  - Usage explicitly worries about stale data and requires `Last updated` + refresh behavior
  - blocked/recovery surfaces already rely on current runtime projections and valid `allowed_action_ids[]`
  - `History` and `Ledger` are closer to canonical records than widget rollups or live dashboards
- What is still missing is a shared Orchestrator-wide execution policy for:
  - projection freshness
  - degraded projection behavior
  - when actions must be gated
  - when the UI should fall back to record-backed views

### Recommended trust model
- Strong recommendation:
  - keep the earlier projection states and make them operational:
    - `current`
    - `refreshing`
    - `stale`
    - `degraded`
    - `unavailable`
- Working meaning:
  - `current`
    - projection is up to date enough for normal read + write interaction
  - `refreshing`
    - slightly behind but actively catching up; read is fine, write may still be fine depending on object class
  - `stale`
    - data is old enough that mutation-bearing actions should narrow or require refetch
  - `degraded`
    - projector or dependency failure means the surface may be incomplete or partially wrong
  - `unavailable`
    - projection cannot currently support that surface; UI must fall back or disable

### Action-gating direction
- Important rule:
  - not all surfaces need the same trust threshold
- Recommended gating split:
  - low-risk read-only inspection
    - allowed on `refreshing`, often allowed on `stale`, sometimes allowed on `degraded`
  - precise navigation / deep-linking
    - usually allowed if the target object identity is still valid
  - live mutation / approval / recovery / retry / cleanup
    - require `current` or a direct canonical-runtime validation path
- If a surface is `stale` or `degraded`, the GUI must not present mutation controls that imply hidden confidence.

### Surface-specific direction
- `Progress`
  - most vulnerable to stale/degraded projection confusion because it is summary-heavy
  - should show visible freshness state and route users to native tabs for exact inspection when trust drops
- `Seams`
  - rollups can remain browsable when slightly stale, but completion/promote/governance actions should tighten quickly
- `Node Graph`
  - focused inspection may survive mild staleness
  - live status claims, blocked action buttons, and generation overlays should disclose trust state explicitly
- `Evidence`
  - evidence/artifact browsing can often survive stale projections because records/artifacts are durable
  - new-links/live-status indicators may not
- `History`
  - should remain broadly usable under degraded projections because chronological record slices can fall back closer to canonical events
- `Ledger`
  - strongest fallback surface for exact inspection
  - exact ledger browsing should remain available via slice-based record queries even when higher-level projections are unhealthy

### Canonical-validation direction
- Recommended rule:
  - if a write action is attempted from a stale/degraded surface, the runtime should either:
    - refuse with a clear reason
    - or perform an authoritative revalidation against canonical/current runtime state before executing
- The GUI should never guess that a previously visible `allowed_action_ids[]` set is still valid if the blocked projection is stale.

### UX disclosure direction
- The trust model needs visible UI grammar, not just backend states.
- Good shared fields:
  - `freshness_state`
  - `last_updated_at`
  - `data_source_kind`
  - `degraded_reason?`
  - `action_gate_reason?`
- Good copy style:
  - `View may be stale`
  - `Projection degraded`
  - `Live actions unavailable until refresh`
  - `Showing canonical history slice`

### Fallback direction
- Strong recommendation:
  - when trust drops, degrade toward exact record-backed inspection, not toward empty ambiguity
- Example fallback ladder:
  - widget summary -> native tab
  - rollup tab -> filtered record list
  - projection-derived inspector -> `Ledger` / `History` / exact record view via `detail_ref`

### Contradictions / gaps surfaced
- Current docs establish canonical vs derived storage, but not the UI policy that follows from that distinction.
- There is no shared freshness/trust contract yet for Orchestrator tabs.
- Some current wording still risks implying that if data is visible, it is safe to act on it, which is not defensible once projections can lag or degrade.

### Candidate fixes to carry forward
- Define one shared projection-trust contract with operational state meanings and action thresholds.
- Require all dense Orchestrator tabs to show freshness/last-updated/disclosure state.
- Gate mutation controls on trusted projections or explicit runtime revalidation.
- Standardize fallback toward record-backed views (`History`, `Ledger`, exact record inspectors) when projections are degraded.

### Do-not-forget details
- stale visibility is not the same as action authority
- blocked/recovery controls are especially sensitive because `allowed_action_ids[]` can go invalid if projection trust drops
- `Ledger` and record inspectors should be the stable fallback when summary surfaces lose trust

## Research Progress - 2026-03-16 - Shared Record Envelope / Artifact Normalization

### Targeted docs read
- `Plans/storage-plan.md`
- `Plans/Contracts_V0.md`
- `Plans/Orchestrator_Page.md`
- `Plans/Run_Graph_View.md`
- `Plans/FinalGUISpec.md`
- `Plans/usage-feature.md`

### Key findings
- Storage is already closer than the UI docs to a normalized record family model.
- `storage-plan.md` already defines several canonical records:
  - `attempt_record`
  - `tier_runtime_record`
  - `blocked_projection`
  - `usage_record`
  - `evidence_record`
  - `thread_blocked_notice`
  - `wizard_runtime_state`
  - cross-surface runtime receipt record
- `Contracts_V0.md` consistently uses:
  - `detail_ref?`
  - `*_ref`
  - explicit identity fields
  - canonical event fields instead of GUI-only aliases
- The rewrite now wants many additional first-class record families:
  - concerns
  - reviews
  - corroboration requests/results
  - promotions
  - graph patch requests/results
  - recovery records
- What is still missing is a shared envelope pattern that keeps those families structurally compatible.

### Recommended normalization direction
- Strong recommendation:
  - add one shared governance/runtime record-envelope pattern, then let each family add its own payload block
- Good base envelope fields:
  - `record_id`
  - `record_kind`
  - `schema_version`
  - `project_id`
  - `run_id?`
  - `scope_type`
  - `scope_id`
  - `status`
  - `created_at_utc`
  - `updated_at_utc?`
  - `summary`
  - `summary_kind?`
  - `detail_ref?`
  - `source_refs[]`
  - `artifact_refs[]`
  - `related_record_refs[]`
  - `lineage_refs[]`
  - `actor_ref?`
  - `requested_effective_snapshot_refs?`

### Record vs artifact distinction
- Important rule:
  - record and artifact must remain different objects
- Recommended distinction:
  - record
    - structured canonical object used by projections, search, history, and ledger
  - artifact
    - blob/file/renderable output linked from a record
- This matters because many current docs still talk loosely about “review output” or “patch output” without separating:
  - exact structured record
  - human-readable rendered summary
  - attached artifact(s)

### Family-specific payload direction
- Good pattern:
  - shared envelope + family payload block
- Candidate payload examples:
  - concern payload:
    - severity, category, owner, lifecycle, resolution_kind
  - promotion payload:
    - promotion_class, source_scope, target_scope, canonical verdict, revoked/reopened lineage
  - corroboration payload:
    - claim refs, corroborator refs, 2-of-3 outcome, unresolved minority concerns
  - graph patch payload:
    - patch point, target generation, resulting generation, requested reason, applied outcome
  - recovery payload:
    - blocked episode ref, action id, preconditions, result, safe-point refs
  - review payload:
    - review scope, findings counts, unresolved findings, verdict, canonical findings summary ref

### UI / search implication
- A normalized envelope would simplify several earlier seams at once:
  - object-first search
  - History vs Ledger distinction
  - deep-link routing
  - export manifests
  - cross-tab inspectors
- Search can index the shared envelope fields while preserving family-specific filters.
- `Ledger` can inspect exact record structure consistently across families without inventing a custom viewer for every new object.

### Historical semantics implication
- Shared envelopes also help apply the earlier semantic vocabulary consistently:
  - `historical`
  - `superseded`
  - `revoked`
  - `reopened`
  - `archived`
  - `removed`
- The envelope should not collapse these into one generic old-state bit.

### Contradictions / gaps surfaced
- Current records are partially normalized, but newer governance families still risk being invented ad hoc.
- Some current docs are better at record identity than at record-family consistency.
- Without a shared envelope, search, export, ledger inspection, and cross-tab deep links will likely re-encode the same concepts repeatedly.

### Candidate fixes to carry forward
- Define a shared record-envelope contract for governance/runtime record families.
- Keep artifacts and rendered summaries linked but separate from canonical records.
- Require new first-class Orchestrator object families to reuse the envelope and shared status/lineage conventions.
- Let family-specific payloads specialize under the shared envelope instead of inventing one-off top-level shapes.

### Do-not-forget details
- `detail_ref` and `*_ref` conventions already exist and should be expanded, not replaced
- canonical findings summaries and prose summaries are artifacts/views that must still resolve back to exact records
- the envelope should carry enough shared identity for search, export, and inspector routing without flattening family-specific meaning

## Research Progress - 2026-03-16 - Lane / Worktree Cleanup Lifecycle

### Targeted docs read
- `Plans/WorktreeGitImprovement.md`
- `Plans/GitHub_Integration.md`
- `Plans/storage-plan.md`
- `Plans/Orchestrator_Page.md`
- `Plans/FinalGUISpec.md`

### Key findings
- The existing docs already imply that cleanup cannot be treated as a trivial delete:
  - worktree rows expose `recover`, `prune`, and `lineage` actions
  - active-run ownership must be visible before prune/remove
  - worktree actions must preserve safe-point and remediation lineage
  - `dirty_worktree` and `worktree_conflict` are explicit runtime blocked reasons
- `WorktreeGitImprovement.md` also already distinguishes important persistence cases:
  - unresolved conflict worktrees may need to survive until user resolution
  - recovery and repopulation across restart are real
  - safe-point restore must target the exact worktree/baseline
- What is still missing is a full lifecycle that separates:
  - logical lane history
  - live worktree existence
  - cleanup eligibility
  - archive/remove semantics

### Recommended lifecycle split
- Strong recommendation:
  - treat `lane lifecycle` and `worktree lifecycle` as related but non-identical
- Reason:
  - a lane may remain historically important after its live worktree is archived or removed
  - a live worktree may be operationally suspect even while the lane remains active in orchestration terms
- Good mental model:
  - lane = orchestration lineage object
  - worktree = concrete Git/filesystem backing object

### Recommended lane-oriented states
- Current lane vocabulary still looks right and should be kept:
  - `baseline`
  - `active`
  - `suspect`
  - `restoring`
  - `retained`
  - `cleanup_eligible`
  - `archived`
  - `removed`
  - `historical`
- Working interpretation:
  - `baseline`
    - canonical starting lane for a package pool
  - `active`
    - currently eligible/in use for live work
  - `suspect`
    - not safe for normal dispatch until examined or restored
  - `restoring`
    - in explicit recovery / restore / reconcile flow
  - `retained`
    - intentionally kept after completion/failure for inspection, compare, or delayed cleanup
  - `cleanup_eligible`
    - no longer needed for live execution and may be archived/removed under policy
  - `archived`
    - historical object retained in the model, but not an active live lane
  - `removed`
    - live backing removed; only historical identity and lineage remain
  - `historical`
    - user-facing historical posture rather than a dispatchable live posture

### Worktree-oriented state implication
- Source Control still needs a more concrete worktree-first vocabulary.
- Recommended worktree row posture:
  - `live`
  - `dirty`
  - `conflict`
  - `orphaned`
  - `recovering`
  - `retained`
  - `archived`
  - `removed`
- This should stay worktree-first in Source Control, with lane/package/run metadata attached.
- Orchestrator should continue to present the lane state and show worktree status in context.

### Cleanup-action semantics
- Important rule:
  - `recover`, `archive`, `prune`, and `remove` must not blur together
- Recommended meanings:
  - `recover`
    - attempt to restore or reconcile a suspect/orphaned/conflicted worktree into a safe known state
  - `archive`
    - retire from active use while preserving enough identity/metadata/lineage for historical browsing
  - `prune`
    - cleanup-oriented action for items already policy-eligible; narrower than generic remove and typically scoped to obviously stale/orphaned/live-no-longer-needed worktrees
  - `remove`
    - explicit destructive removal of live worktree backing after confirmation and eligibility checks
- The historical lane/worktree record must survive `archive`, `prune`, and `remove`.

### Eligibility / gating direction
- Cleanup must be gated by more than age.
- Recommended checks before archive/prune/remove:
  - no active-run ownership
  - no unresolved blocked recovery requiring that exact worktree
  - no required safe-point restore targeting that worktree/baseline
  - no unresolved conflict workflow the user still needs to inspect
  - no newer lineage operation depending on that lane/worktree still being live
- If any of those hold, the object should remain `retained`, `suspect`, or `restoring`, not `cleanup_eligible`.

### Trigger direction
- Good candidate transitions into `cleanup_eligible`:
  - lane/package complete and no retention reason remains
  - superseded by graph patch and no unresolved recovery depends on it
  - revoked/reopened flow leaves an old lane/worktree no longer needed live
  - recovery completed and old broken backing is no longer needed
- Good candidate transitions into `retained` instead of immediate cleanup:
  - recent completion pending review/promotion
  - weak integration still under investigation
  - unresolved concern or corroboration tied to outputs from that lane
  - manual operator retention

### Source Control vs Orchestrator boundary
- This seam reinforces the earlier boundary:
  - Orchestrator owns lane-pool truth and cleanup posture in execution context
  - Source Control owns concrete worktree actions and compact inventory display
- Because Source Control is narrow, it should default to compact current/live worktree rows with filters/toggles for:
  - retained
  - cleanup-eligible
  - archived/removed history
- Orchestrator can carry the richer historical lineage and policy explanations.

### Historical-lineage rule
- Strong recommendation:
  - live cleanup must never erase run/lane/worktree lineage from `History`, `Ledger`, or graph-linked inspection
- After live removal:
  - Orchestrator still shows the historical lane/worktree identity
  - Source Control may show it only in filtered historical mode or via lineage/detail, not necessarily in the default narrow current list

### Confirmation / undo implication
- This seam connects directly to the earlier confirmation policy:
  - archive may be `light` or `strong` depending on state
  - prune/remove should usually be `strong`
  - remove on a worktree with blocked/recovery lineage may approach `hard_gate`
- Most of these are not true undo operations.
- The clean recovery path is usually compensating action or restore via preserved metadata, not “Undo remove.”

### Contradictions / gaps surfaced
- Current docs expose worktree actions and blocked classifications, but they do not yet define the full lane/worktree cleanup lifecycle.
- `historical`, `archived`, `removed`, `retained`, and `cleanup_eligible` still need sharper cross-surface meanings.
- Without a split model, the UI risks either:
  - deleting useful historical truth
  - or keeping too much live clutter forever

### Candidate fixes to carry forward
- Define distinct lane and worktree lifecycle states, with explicit mapping but no forced identity collapse.
- Make cleanup eligibility depend on runtime/recovery/lineage checks, not only simple completion.
- Preserve historical lane/worktree records after archive/prune/remove.
- Keep Source Control worktree-first and compact, with historical/retained material behind filters or lineage views.

### Do-not-forget details
- active-run ownership must be visible before destructive worktree actions
- safe-point and blocked recovery lineage can keep an old worktree relevant even after supersession
- cleanup should reduce live clutter without erasing the historical object model

## Research Progress - 2026-03-16 - Terminology / Help / Glossary Impact Sweep

### Targeted docs read
- `Plans/Glossary.md`
- `Plans/FinalGUISpec.md`
- `Plans/Personas.md`
- `Plans/Models_System.md`
- `Plans/Multi-Account.md`

### Key findings
- The shared provider/persona/runtime docs are already fairly disciplined on several critical terms:
  - `requested` vs `effective`
  - `selection_reason`
  - skipped vs honored/clamped Persona controls
  - provider/auth/account selection flow
- That means the runtime-selection side of the vocabulary is in better shape than the newer Orchestrator object vocabulary.
- `Glossary.md` is now lagging behind the rewrite research.
- It currently covers:
  - shell/workspace terms
  - source control / Docker / GitHub / operation receipt
  - requested/effective state at a high level
- It does not yet capture many of the rewrite-critical Orchestrator terms and distinctions now emerging in research.

### Terms that now need canonical glossary ownership
- Strong candidates for glossary entries:
  - `Feature Seam`
  - `Work Package`
  - `Node`
  - `Package Overseer`
  - `Seam Overseer`
  - `Weak Integration`
  - `Promotion`
  - `Corroboration`
  - `Graph Patch`
  - `Graph Generation`
  - `Concern`
  - `Lane`
  - `Lane Pool`
  - `Worktree` as a distinct concrete object
  - `Historical Run`
  - `Reopened`
  - `Revoked`
  - `Superseded`
  - `stale_historical`
  - projection trust terms:
    - `current`
    - `refreshing`
    - `stale`
    - `degraded`
    - `unavailable`

### Terms that need explicit distinction rules
- Several word pairs are now risky unless the glossary or help system pins them down:
  - `lane` vs `worktree`
  - `record` vs `artifact`
  - `history` vs `ledger`
  - `requested` vs `effective`
  - `override` vs `requested`
  - `current` vs `historical`
  - `historical` vs `superseded`
  - `resolved` vs `dismissed` vs `acknowledged`
  - `retry from safe point` vs `start fresh attempt`
  - `archive` vs `remove` vs `prune`
- These are exactly the kinds of distinctions that can drift in GUI copy if they are not owned centrally.

### Help-system implication
- The earlier help-system work looks even more necessary now.
- Recommended rule:
  - glossary owns short canonical definitions
  - help entries own deeper explanation, examples, and related-concept links
  - contextual help can simplify wording, but must not mutate the underlying semantics
- Good dedicated help-entry candidates now look even stronger for:
  - `Weak Integration`
  - `Corroboration`
  - `Graph Patch`
  - `Promotion`
  - `Concern lifecycle`
  - `Lane vs Worktree`
  - `requested vs effective`
  - `safe point vs restore point`
  - `historical vs superseded vs revoked`

### Shared provider-runtime impact
- The shared provider/runtime docs already support the newer requested/effective language well.
- Good finding:
  - `Multi-Account.md`, `Models_System.md`, and `Personas.md` already align on:
    - requested/effective visibility
    - selection reason
    - skipped/honored control disclosure
    - attempt-level snapshotting
- This means those docs are less likely to need conceptual rewrite than the Orchestrator and glossary/help surfaces.
- The bigger risk is copy drift in GUI/help text if Orchestrator starts using newer concepts without glossary/help coverage.

### GUI copy implication
- `FinalGUISpec.md` already contains many local disclosure rules, but they are distributed.
- The rewrite now needs a stronger cross-cutting copy discipline so the UI does not casually say:
  - “retry”
  - “old”
  - “completed”
  - “degraded”
  - “history”
  when a more precise canonical term is required

### Contradictions / gaps surfaced
- `Glossary.md` is now materially behind the Orchestrator rewrite vocabulary.
- The shared runtime/provider docs are stronger than the shared concept/glossary docs.
- Without glossary/help updates, copy drift will likely happen first in:
  - Orchestrator tabs
  - Source Control / lane/worktree language
  - blocked/recovery actions
  - concerns/promotions/patches/history/ledger labels

### Candidate fixes to carry forward
- Expand `Glossary.md` to cover the rewrite-critical Orchestrator objects, states, and trust terms.
- Use glossary definitions as the canonical short-definition source for future help entries.
- Add explicit distinction guidance for the high-risk word pairs above.
- Re-check `FinalGUISpec.md` and related UX docs later for copy that uses informal synonyms where canonical terms are now required.

### Do-not-forget details
- the runtime/provider docs already provide a solid requested/effective foundation; do not reinvent that vocabulary
- glossary/help need to catch up to Orchestrator object semantics before UI copy starts crystallizing around weaker synonyms
- `lane` vs `worktree`, `history` vs `ledger`, and `historical` vs `superseded` are especially drift-prone

## Research Progress - 2026-03-16 - Shared Conversational-Actor / Runtime Identity Boundary

### Targeted docs read
- `Plans/assistant-chat-design.md`
- `Plans/interview-subagent-integration.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/FinalGUISpec.md`
- `Plans/Multi-Account.md`
- `Plans/Personas.md`
- `Plans/Models_System.md`

### Key findings
- The shared provider-runtime contract is already broader than Orchestrator:
  - `Multi-Account.md` explicitly says the behavior applies to assistant, interviewer, requirements builder, PRD builder, overseers, node workers, and provider-backed chat/tool turns
  - requested/effective provider/model/effort/persona/auth/account and selection reason are already shared runtime concepts
- The conversational/document-production surfaces already require runtime-identity visibility:
  - Interview activity pane and chat must show effective Persona, selection reason, effective platform/model, and skipped-control disclosure
  - Requirements Builder must show effective Persona, selection reason, effective platform/model, and skipped unsupported Persona controls for the active stage/pass
  - chat subagent blocks and interview activity panes are already expected to expose the same effective-runtime fields for active work blocks
- The shared failure/remediation taxonomy also already crosses the boundary:
  - Interview uses the shared `failure_class` / `blocked_reason_code` taxonomy
  - chat blocked notices render from canonical `allowed_action_ids[]` and blocked metadata instead of inventing thread-local recovery semantics
  - wizard/interview blocked state is explicit and persistent, not a soft conversational inconvenience

### Main boundary clarification
- Strong recommendation:
  - conversational actors and document-production actors share provider/runtime identity semantics, but they are not orchestration execution objects
- That means:
  - they do share:
    - requested/effective provider/model/persona/account/auth semantics
    - selection reason
    - skipped/honored control disclosure
    - blocked/retry/remediation/degradation taxonomy where applicable
    - shared activity/event-stream infrastructure
  - they do NOT automatically become:
    - `Feature Seams`
    - `Work Packages`
    - graph `Nodes`
    - lane-pool objects
    - package/seam-governance objects

### Identity-model direction
- The docs imply multiple identity families that must stay distinct:
  - conversation identity:
    - `thread_id`
  - wizard/builder identity:
    - `wizard_id`
    - builder stage/run ids
    - bundle/review ids
  - orchestration identity:
    - `run_id`
    - package/seam/node ids
    - attempt ids
- These can be linked, but should not be collapsed into one object model.
- Example:
  - an Interview run may have runtime identity and blocked/remediation state
  - but it is still an interview/document-production run, not an Orchestrator package/node execution record

### Shared-runtime surface parity direction
- Good emerging rule:
  - when multiple surfaces present the same active conversational/document-production run, they should consume the same underlying runtime state and expose the same requested/effective visibility fields
- Existing examples already support this:
  - Interview chat surface and Interview activity pane share the same active run state
  - Builder and Interview reuse the shared agent activity pane
  - chat subagent blocks preserve persona/task/runtime identity in-thread rather than using a separate weaker model

### Blocked-state implication
- Another important finding:
  - blocked state is not Orchestrator-exclusive
- Chat, Interview, and Wizard flows already use:
  - `attention_required`
  - `blocked`
  - `blocked_reason_code`
  - `allowed_action_ids[]`
  - `resume_url`
- This is useful because it means the shared runtime contract should stay broad.
- But it also means reconciliation later must avoid accidentally renaming all blocked semantics as “Orchestrator” semantics.

### Non-goal / anti-drift rule
- Recommended explicit rule to carry forward:
  - shared provider runtime does not imply shared execution ontology
- In plain terms:
  - same provider/account/model/runtime machinery
  - different object families, lifecycle semantics, and UI surfaces
- This will matter especially when reconciling:
  - search
  - record envelopes
  - history/ledger
  - settings override presentation
  - glossary/help terminology

### Search / record implication
- Search and record systems should be able to span these actors without flattening them into one type.
- Good direction:
  - keep a shared runtime-identity field family
  - keep distinct actor/run kinds
- Candidate actor/run kinds:
  - assistant conversation turn/run
  - interview phase/document/review run
  - builder stage/review run
  - orchestrator node/attempt/run
- This makes cross-surface search and ledger inspection possible without pretending they are all graph nodes.

### Contradictions / gaps surfaced
- The shared runtime semantics are already distributed across multiple docs, but the “shared runtime, separate ontology” rule is still mostly implicit.
- Without an explicit boundary rule, later reconciliation could over-unify:
  - treating builder/interview/chat runs as orchestration objects
  - or under-unify:
  - duplicating provider/account/runtime identity logic for conversational flows
- The current docs are stronger on visibility requirements than on naming this boundary explicitly.

### Candidate fixes to carry forward
- Add an explicit shared-runtime boundary statement:
  - assistant/interviewer/builders share provider/account/runtime identity semantics with Orchestrator
  - but remain upstream conversational/document-production actors, not package/seam/node execution objects
- Preserve distinct actor/run kinds in record/search/routing contracts.
- Reuse one runtime-identity disclosure grammar across these surfaces without collapsing their lifecycle models.
- Keep blocked/remediation taxonomy shared, while preserving actor-specific state machines and object identities.

### Do-not-forget details
- `thread_id`, `wizard_id`, bundle/review ids, and orchestration `run_id`/attempt ids must remain linkable but distinct
- chat blocked notices already prove shared blocked taxonomy does not require shared object ontology
- Builder/Interview activity panes already give a concrete model for “same runtime state, different surface”

## Research Progress - 2026-03-16 - Export Contracts

### Targeted docs read
- `Plans/usage-feature.md`
- `Plans/FinalGUISpec.md`
- `Plans/Orchestrator_Page.md`
- `Plans/storage-plan.md`
- `Plans/Runtime_Artifacts_Panel.md`
- `Plans/chain-wizard-flexibility.md`

### Key findings
- The current docs already contain several different export families:
  - config sync/export bundles (`.pm-bundle`)
  - render/preview exports (for example Mermaid `SVG` / `PNG`)
  - runtime artifact export from the Artifacts panel
  - Usage/Ledger CSV/JSON exports
  - project-output materialization and optional derived exports under `.puppet-master/project/**`
  - generic thread/run history export from seglog / JSONL mirror
- These families are conceptually different, but the docs still do not give Orchestrator a unified export contract that ties them together.
- `Runtime_Artifacts_Panel.md` is notably disciplined:
  - artifacts stay on canonical runtime identity
  - `Show in Ledger` / `Show in Usage` route back to canonical surfaces
  - artifacts do not create shadow data models
- `chain-wizard-flexibility.md` is also disciplined on canonical vs derived export:
  - sharded plan graph is canonical
  - monolithic graph export is derived convenience only
- `Orchestrator_Page.md` still has relatively thin export language:
  - filtered ledger CSV/JSON export
  - no strong run/evidence/history/record-bundle export contract yet

### Recommended export taxonomy
- Strong recommendation:
  - keep the earlier three export classes and sharpen them:
    - `record export`
    - `bundle export`
    - `view export`
- Working interpretation:
  - `record export`
    - exact canonical record(s) with stable ids/refs and schema-aware payloads
  - `bundle export`
    - portable package containing multiple records/artifacts plus manifest
  - `view export`
    - user-facing filtered table/render output such as CSV, JSON summary, rendered image, or currently filtered list

### Orchestrator-specific direction
- Good candidate Orchestrator exports:
  - `record export`
    - specific concern
    - promotion
    - corroboration result
    - graph patch request/result
    - recovery record
    - exact ledger slice
  - `bundle export`
    - run evidence bundle
    - selected-object bundle (for example selected concerns + linked evidence + relevant records)
    - historical run package with manifest + linked artifacts/records
  - `view export`
    - filtered ledger CSV/JSON
    - filtered concerns table
    - search results export
    - graph image/render convenience export

### Manifest direction
- Important rule:
  - any non-trivial Orchestrator bundle export should carry a manifest
- Good manifest fields:
  - `export_id`
  - `export_kind`
  - `schema_version`
  - `project_id`
  - `focused_run_id?`
  - `source_surface`
  - `generated_at_utc`
  - `filter_summary?`
  - `included_record_ids[]`
  - `included_artifact_ids[]`
  - `included_file_paths[]?`
  - `lineage_notes?`
  - `trust_state_at_export?`
- The `trust_state_at_export` field now looks important because earlier research established stale/degraded projection concerns.

### Canonical-vs-derived rule
- This seam reinforces a rule already visible elsewhere:
  - export convenience must not redefine canonical source-of-truth
- Examples:
  - filtered CSV is a view export, not canonical history
  - JSON summary export is not equivalent to canonical record export unless it preserves the exact record envelope
  - monolithic plan-graph export remains derived, never canonical
  - JSONL mirror export is still a projection-derived export, not a replacement for seglog ownership

### Runtime-artifact implication
- `Runtime_Artifacts_Panel.md` provides a good anchor for Orchestrator exports:
  - artifacts should preserve canonical run/thread/attempt linkage
  - receipt-like exports should not invent shadow IDs
  - usage-linked artifacts should continue to route through canonical usage identity
- This means artifact export should remain linked to the exact record/identity model, not become a detached blob dump with lost context.

### Trust / stale-data implication
- Export correctness now depends on the earlier projection-trust work.
- Recommended rule:
  - exports derived from stale/degraded projections must either:
    - disclose trust state in the export/manifest
    - or re-query from canonical/current backing data before export
- Especially for:
  - ledger
  - concerns
  - promotion state
  - graph generation summaries

### Retention / archival implication
- `storage-plan.md` already hints at export for long-term ledger/history retention.
- Good direction:
  - export is part of archival/inspection strategy, not just UI convenience
- This connects to the earlier lane/worktree cleanup work:
  - export may be the reason an otherwise live-retained object can later move toward cleanup
  - but export does not itself authorize deletion of the canonical/historical record model

### Contradictions / gaps surfaced
- Orchestrator still lacks one explicit export contract tying together:
  - records
  - artifacts
  - manifests
  - view exports
  - trust-state disclosure
- Current export language is spread across several domains and could drift into inconsistent semantics.
- There is not yet a sharp rule for when JSON export means:
  - exact record payload
  - filtered table dump
  - convenience summary

### Candidate fixes to carry forward
- Define a shared Orchestrator export taxonomy: `record export`, `bundle export`, `view export`.
- Require manifests for non-trivial bundle exports and likely for some complex record exports.
- Preserve canonical ids/refs in artifact and record exports; do not invent export-local shadow identity.
- Add trust-state disclosure or canonical revalidation requirements for exports built from projections.

### Do-not-forget details
- config bundles, render exports, artifact exports, and Orchestrator record exports are different families and should not be blurred together
- filtered JSON is not automatically a canonical record export
- derived exports stay useful, but they must remain visibly derived
