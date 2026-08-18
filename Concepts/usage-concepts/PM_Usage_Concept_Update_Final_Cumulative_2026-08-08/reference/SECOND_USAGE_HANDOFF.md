# Second Handoff to “Usage Feature Review”

**Date:** 2026-08-05  
**Relationship to the first handoff:** This is an incremental contract update. Preserve the first handoff’s provider/account/connection/product hierarchy, provider-specific continuation behavior, requested/effective route disclosure, and Settings-versus-Usage ownership. Add the contracts below before building the new Usage changes.

## Why a second handoff is required

The recent Settings, Hermes, memory, Persona, Goal Runtime, Planning Wizard, PRD Builder, Crew, and operational-awareness review added several Usage consumers that were not fully covered in the first handoff:

- Goal Runtime now needs completion-oriented capacity forecasting, not only historical usage display.
- Planning Wizard, PRD Builder, Assistant Chat agents, Orchestrator, Plan Compile, Auditor, Crew, testing, and debugging all need a shared view of remaining provider capacity, time, cost, resets, and confidence.
- Context maintenance, compression, cache loss, branching, redirects, alternate attachment routes, and auxiliary models create real usage that must remain attributable.
- Thread-to-thread delegation, Crew waves, and cross-project work need lineage without flattening everything into one “chat total.”
- Claude CLI and Antigravity CLI OAuth must be represented as CLI-owned profile routes, not PM-direct OAuth connections.

This does not require the Usage page to become an Orchestrator. Usage supplies measured state and forecasts; the owning runtime decides what to schedule.

---

## 1. Goal Runtime is a shared Usage consumer

Puppet Master uses one Goal Runtime engine in three integrations:

```text
Visible Goal Mode in Assistant Chat
Invisible internal goals used by PRD Builder and Planning Wizard
Orchestrator Goal/GoalRun flows
```

Usage should group these consistently while preserving the owning surface and visibility mode.

Every Goal-related attempt needs at least:

```text
goal_id / goal_run_id
parent_goal_id when present
owning_surface
visibility: visible | internal | orchestrator
phase
logical_turn_id
attempt_id
provider/account/connection/product/model route
purpose
started_at / finished_at / elapsed
status
```

A checkpoint, pause, resume, replan, stop, branch, or restart does not erase prior usage. Resumed work continues the same Goal lineage unless the user explicitly branches or creates a new Goal.

### Goal admission and forecast receipt

Before a substantial Goal or Goal phase starts, the runtime needs a Usage-backed forecast:

```text
requested_children
configured_maximum
provider_discovered_maximum
current_effective_maximum
predicted_sustainable_maximum
admitted_concurrent_children
queued_children
estimated_provider_native_usage_range
estimated_cost_range
estimated_elapsed_range
reserved_for_parent_synthesis
reserved_for_testing
reserved_for_verification_and_repair
reset_or_cooldown_inputs
confidence
source_freshness
recommendation
```

The key value is **predicted sustainable maximum**: how many agents can start now and still have a credible chance of finishing useful work.

When ten children are requested but current allowance likely supports only two complete children, Usage should preserve:

```text
Requested: 10
Admitted concurrently: 2
Remaining: queued in waves
Reason: completion forecast, not a hard provider concurrency limit
```

Do not report this as “PM only supports two agents.”

### Required specialists are not optional

Low capacity may reduce simultaneous fan-out, but it must not erase required independent specialist passes. Usage should be able to show:

```text
6 required specialists
2 concurrent
3 waves
```

rather than implying that only two reviews were required.

---

## 2. Provider-native units, cost, time, and confidence

All relevant agents need access to:

```text
remaining allowance or provider-native unit
input/output/reasoning/cache values when available
actual or estimated cost
time spent
start/finish timestamps
reset/cooldown time
rate-limit state
source kind
freshness
confidence
```

Do not force every provider into “tokens remaining.” A provider may expose requests, weighted units, credits, dollars, messages, reset windows, packs, or no reliable meter.

Every value needs a quality state:

```text
provider_reported
cli_reported
pm_observed
derived
estimated
partial
stale
unknown
```

Zero must never stand in for unknown.

Usage forecasts are advisory. They must show confidence and generation time. A forecast may be invalidated by model changes, account switching, new child work, provider throttling, or a reset.

---

## 3. Preserve every real provider attempt

One visible user turn or Goal step may produce several actual calls:

```text
primary model attempt
failed attempt
fallback replay
subagent call
Crew member call
Crew reducer/synthesizer
vision helper
attachment-analysis helper
compression/summarization helper
web extraction helper
approval reviewer
MCP router
skill search
model/capability probe
catalog validation probe
conversation replay after route change
```

Use one event per real provider attempt, grouped under the logical user turn, Goal phase, or PlanningRun topic. Do not overwrite failed or abandoned attempts with the final successful route.

Recommended purpose values include:

```text
user_work
planning_conversation
prd_conversation
subagent
crew_member
crew_synthesis
vision
attachment_transform
compression
web_extract
approval_review
mcp_router
skill_search
catalog_validation
capability_probe
fallback_attempt
conversation_replay
verification
repair
```

The default Usage UI may aggregate these into human-readable buckets. Expanded detail preserves each attempt.

---

## 4. Context, compaction, cache, branching, and rewind

Puppet Master has Context Lens, Compact Now, automatic compaction, full history, prior-chat retrieval, rewind, restore points, and chat branching. Usage needs to preserve the consequences without treating every local context operation as billable.

### Context maintenance

Record provider usage when a provider/model is actually called for:

```text
compression or summary generation
memory synthesis or verification
embedding/index generation when provider-backed
context replay
attachment transformation
```

Purely local selection, pruning, indexing, ZIP extraction, or Context Lens inspection may consume local resources but should not be shown as provider usage.

### Cache

For each provider attempt, retain when available:

```text
cache_read
cache_write
cache_hit_or_reuse
cache_change_reason
provider_reported | derived | estimated | unknown
```

Material cache-impact reasons include provider/account/connection/model changes, effort or Normal/Fast changes, tool/MCP/skill set changes, system/context assembly changes, compaction, branch creation, replay, fallback, or provider adapter behavior.

Do not infer cache support from a model family alone. Key it to the effective provider, endpoint, connection, adapter, model, and relevant mode.

### Branch and rewind

- Rewind changes conversation state; it does not delete historical usage.
- Branching creates a new branch/thread lineage from a source message or restore point.
- New calls after the branch belong to the new branch, while ancestry remains addressable.
- “Branch with another model” may create a replay on the destination route; record that replay separately.

### Active-turn redirects

When a user redirects an in-flight turn, preserve:

```text
original attempt
interruption/redirect timestamp
partial output state
resumed or replacement attempt
wasted/settled usage when reported
```

Do not hide the interrupted attempt merely because the final answer came from a resumed call.

---

## 5. Memory and Persona are not billing routes

Puppet Master’s degrading Assistant Gist memory affects retrieval priority, not truth or deletion. It is distinct from transcript history, Goal state, planning ledgers, and artifact history.

Usage should not count:

- a memory fading from active recall;
- a Persona being selected;
- local history search;
- local Context Lens selection;
- local spellcheck.

Usage should count a provider-backed helper call used to summarize, verify, compress, or embed memory, and label its purpose accordingly.

Persona is behavior, not a provider/account/model identity. Historical usage must retain the execution-time route snapshot. Changing a Persona or its current settings later must not rewrite old usage.

---

## 6. Thread, agent, and cross-project lineage

Assistant agents may search/read other project threads, send typed requests to them, spawn child or sibling threads, and branch from prior messages. Usage needs:

```text
source_thread_id
target_thread_id
parent_thread_id
request_id
spawn_reason
agent_id
parent_agent_id
logical task/Goal lineage
```

Do not merge another thread’s usage into the requesting thread without preserving both identities.

Cross-project work requires explicit permission. Record source project, destination project, grant scope, and effective route, but do not expose sensitive project paths in the default Usage view.

Thread-local model/account/Persona/effort/Normal-Fast/access/Crew changes apply to future calls in that thread only. Project/global default changes do not rewrite existing thread history.

---

## 7. Crew usage

Crew is an Orchestrator-owned multi-agent execution strategy, not a Persona or provider.

Record:

```text
crew_id / crew_template_id
requested_member_count
effective_member_count
concurrent_members
queued_members
wave number
member role and Persona
requested/effective provider-account-connection-model per member
member usage
Crew-board or coordination activity when provider-backed
reducer/synthesis usage
reason for adaptive downsizing or queuing
```

A five-member template may execute as two concurrent members plus queued waves. Keep the requested Crew composition and the effective execution separate.

Do not collapse mixed-provider Crew usage under whichever provider one member used.

---

## 8. Planning Wizard and PRD Builder

User-facing PRD Builder and Planning Wizard discussion must use a high-quality conversational/planning route. Usage should identify this purpose distinctly from background extraction or research.

A planning run may contain:

```text
high-quality user discussion
source extraction children
research children
specialist topic agents
integration/synthesis
final audit
repair/re-audit
invisible ledger-to-Plan Goal work
```

The feasibility forecast should reserve capacity for integration, user discussion, testing strategy, final audit, and likely repair before consuming the entire allowance on extraction children.

When current capacity is insufficient, the runtime may recommend smaller waves, another permitted route, waiting for reset, narrowing scope, or explicit paid continuation. Usage reports the recommendation inputs and result; it does not own the scheduling decision.

---

## 9. Operational resource waiting is not provider usage

Agents also need awareness of ports, worktrees, test sessions, debug sessions, browsers, devices, processes, CPU/memory/GPU pressure, snapshots, backups, and logs.

Resource waits can affect elapsed time but should not be misreported as provider usage. Detailed run views may distinguish:

```text
provider/model active time
queued for provider capacity
queued for worktree or writer lease
queued for port/test/debug resource
waiting for approval
waiting for reset/cooldown
local tool/runtime time
```

This is particularly useful when a Goal takes two hours but only twelve minutes were model execution.

---

## 10. Claude CLI and Antigravity CLI OAuth correction

The correct route model is:

- Claude CLI and Antigravity CLI may use OAuth owned by their CLI inside isolated CLI profiles.
- Puppet Master can create/select profile roots, launch the CLI’s native login, verify identity/readiness, and invoke that profile.
- Puppet Master does not present PM-direct OAuth for Claude or Antigravity.
- Claude API and other API-backed connections remain separate products/routes.

Usage must record the exact effective CLI profile, connection, product/plan, and billing or allowance route. Do not label a Claude CLI OAuth session as a PM-direct Claude OAuth connection.

Likewise, do not infer that “authenticated” proves which subscription, plan, API account, or billing path paid for the call. Preserve authentication source and observed product/billing route separately.

---

## 11. Spellcheck

Ordinary spellcheck is local and should not appear in Usage. It uses underlines and suggestions, never automatic replacement.

Any future cloud or model-based grammar/style assistant is a separate opt-in feature and must be attributed as provider usage with privacy, route, and cost disclosure.

---

## 12. Settings and Usage ownership remains unchanged

```text
Settings
  User choices, defaults, provider/account/model configuration, continuation policy,
  Crew templates, Goal/automation policies, context preferences.

Routing / Multi-Account / Models
  Requested-to-effective resolution and capability evidence.

Goal Runtime / Orchestrator
  Forecast consumption, admission, wave size, dispatch, pause/resume/replan.

Usage
  Measured/provider-reported state, historical attempts, projections, forecasts,
  source quality, data freshness, elapsed time, and deep links.
```

Usage should not implement a second provider manager, Goal scheduler, Crew editor, or resource allocator.

Semantic deep links should target provider/account/connection/product, Goal, thread, Crew, or relevant Settings destination by stable identity rather than the old `cmd.settings.bloom.open` presentation detail.

---

## 13. Demo states to add before build

At minimum, exercise these states:

1. A visible Assistant Chat Goal forecasts that eight children will not finish and admits two concurrent children.
2. Six mandatory Planning Wizard specialists run in three two-agent waves without losing specialist coverage.
3. A high-quality Planning Wizard conversation uses one route while extraction children use cheaper routes.
4. A model switch creates a replay and resets/reduces cache reuse.
5. Compact Now invokes a separately billed compression helper.
6. A branch starts with another provider and preserves ancestry.
7. A mid-turn redirect leaves an interrupted attempt plus a resumed attempt.
8. A mixed-provider Crew shows member usage and reducer usage separately.
9. A Goal waits on a port/worktree/test resource; elapsed time is much larger than provider-active time.
10. Claude CLI OAuth usage is attributed to the exact CLI profile/product, while Claude API usage remains separate.
11. A provider value is unknown or stale and is not rendered as zero.
12. A cross-project child call retains both project and thread lineage.

## Non-negotiable data rule

> One real provider attempt gets one immutable usage event. Related attempts are grouped under the logical turn, Goal, PlanningRun, Crew, or thread request; they are never overwritten by the final successful route.
