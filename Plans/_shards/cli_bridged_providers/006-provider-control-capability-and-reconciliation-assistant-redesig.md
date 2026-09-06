# Shard 006: Provider Control, Capability, and Reconciliation (Assistant redesign, 2026-09-03)

Source: `Plans/CLI_Bridged_Providers.md`

Source lines: L233-L413

Source SHA256: `fd152e499c916023ef442a6aee30f924f7bcdf0d00b063a7bc567f86b6b081ff`

---

## Provider Control, Capability, and Reconciliation (Assistant redesign, 2026-09-03)

This section is canonical live specification text for this owner document. It closes
PROVIDER-001..012 of the Assistant redesign. It supersedes any earlier wording in this
document that let a provider-native Goal loop, Plan, To-Do list, subagent roster, tool
registry, MCP registry, Skill set or permission prompt act as Puppet Master canon.

### PROVIDER-001 — Control-plane invariant

Puppet Master owns canonical thread/message/composer state; Goals and continuation;
Assistant Plans, the Deep Plan run-scoped ledger and its scoped PlanUnits; To-Dos and
their work bindings; Crew, BrainStorm, Review, Chat Room and subagent identities;
Personas, Skills, MCP, tools, permissions and approvals; attachments, artifacts, browser
context and evidence; and scheduling, quota waits and Usage attribution.

Provider-native equivalents are transport-side implementation details or noncanonical
observations. They are never authority.

### PROVIDER-002 — Provider-native feature policy

Applied strictly in this order, and the outcome is recorded per run:

1. **Disable** the native feature when the provider supports disabling it.
2. **Redirect** a compatibility invocation to the owning Puppet Master service.
3. **Project** Puppet Master configuration into the provider's required format.
4. **Observe** unavoidable native state as explicitly noncanonical.
5. **Never** promote an observation to canon automatically.

```text
Provider TodoWrite        → PM todo proposal endpoint → ToDoController validation
Provider plan update      → PM Plan/To-Do proposal; cannot rewrite an approved Plan
Provider subagent request → PM collaboration/subagent admission
Provider MCP config       → projection of PM-selected MCP tools
Provider skill/agent file → bounded materialization of a PM Skill/Persona
Provider permission prompt→ PM approval when interceptable; otherwise constrained-tier disclosure
```

### PROVIDER-003 — Session identity

A provider session ID is **correlation only**. It never replaces Puppet Master thread,
workflow, run, participant or object identity, and no PM record is keyed by it.

### PROVIDER-004 — Closed capability matrix

Every provider/runtime entry publishes a truthful value for every field below, together
with the probe **source** and **currentness** that produced it. Values are
`supported | unsupported | constrained | unknown`. `unknown` is a legitimate value and is
never rendered as `supported`.

```text
structured_output            streaming_events             structured_tool_intents
host_tool_execution          native_tools_disableable     native_mcp_disableable
native_skills_disableable    native_todos_disableable     native_plans_disableable
native_goal_loop_disableable native_subagents_disableable permission_interception
custom_system_context        attachment_file              attachment_image
attachment_pdf               browser_context              cancel
pause                        resume_exact                 resume_replay
usage_reported               usage_reset_reported         session_correlation
sandbox_control              working_directory_control    network_control
```

### PROVIDER-005 — Execution control tiers

Every run discloses exactly one tier, and the reason when it is not Full:

| Tier | Meaning |
|---|---|
| **Full** | PM dispatches every tool, owns permissions and approvals, provider-native Plan/To-Do/Goal/subagent orchestration is disabled or unused, and structured cancellation and events are available. |
| **Constrained** | PM owns canonical state and outer authority, but some provider-internal actions cannot be fully intercepted. Execution is bounded to a workspace/process/container, results are reconciled, and the limitations are shown. |
| **Provider-managed execution** | PM supplies the objective, context and permission ceiling; the provider controls substantial internal execution. PM can stop the outer process and reconcile outputs but must not claim full internal visibility, and the user sees the exact limitations before and while running. |

### PROVIDER-006 — Execution preference

**Host Tool Execution is preferred:**

```text
provider emits tool intent
  → PM validates schema and identity
  → Permissions and FileSafe evaluate
  → PM dispatches the canonical tool/MCP
  → result and receipt return to the provider
```

**Delegated execution** is the fallback: isolate the working directory/worktree, restrict
environment and network where supported, inject only the needed credentials through
secure projection, record requested versus effective restrictions, snapshot and reconcile
files and artifacts, keep provider-native state out of PM canon, and disclose opaque
activity.

**Reasoning-only** is the final fallback: where safe execution cannot be controlled, the
provider analyses, reviews or proposes, and PM or another full-control route executes.

### PROVIDER-007 — Plans, To-Dos, and Goals across providers

- An approved Plan's content and hash stay PM-owned and immutable. The provider receives
  the active Plan step and To-Do context, never authority to replace the Plan.
- A provider may **propose** To-Do decomposition or status; the ToDoController validates
  it. Native To-Do snapshots are diagnostics only unless exact item-level transitions are
  reconciled. A provider may not mark several PM To-Dos complete because its internal
  checklist changed.
- PM continuation is authoritative for Goals. The provider-native Goal loop is disabled
  where possible; the provider receives one bounded objective and performs one admitted
  attempt, and PM decides whether to continue. For an opaque CLI that insists on internal
  autonomy, the run is classified constrained or provider-managed and PM outer
  continuation must not duplicate already-running work.
- Where a Plan is active, every material provider operation is bound to PM Plan and To-Do
  identity.

### PROVIDER-008 — Isolation claims must be true

Review's fresh context requires a genuinely new attempt or session. BrainStorm's blind
initial proposals require isolation between participant outputs. An adapter that shares
hidden session history may not be used for a blind pass unless an independent provider
session is created. Where the provider cannot guarantee isolation, the run is marked
**constrained** and is not labelled "fresh" or "blind" without that qualification.

### PROVIDER-009 — Attachment materialization truth

Provider capability determines the form: native file/image/PDF attachment, extracted text
or ranges, an image vision route, or unsupported and omitted. PM records the exact
transformation and the historical hash. The product must never tell the user the provider
"saw the file" when only an excerpt or a filename was sent.

### PROVIDER-010 — Usage and reset truth

Provider reset and allowance truth always states its source:

```text
provider_reported | locally_inferred | user_supplied | unknown
```

Nothing is fabricated, and `unknown` suppresses any countdown rather than inventing one.
Auto-resume re-resolves the originally requested route and account; fallback happens only
under existing explicit routing policy and is recorded. A provider's own auto-retry can
never override a PM manual pause, cancel, Stop, or window boundary.

BSD keeps a separate provider attempt and Usage lineage from primary work; title, primary
and BSD Usage are never merged.

### PROVIDER-011 — Authentication custody

Official CLI subscription authentication remains owned by the official CLI; PM launches
and observes supported sign-in and stores only permitted references and state. Direct API
credentials remain in PM secure credential custody. OpenCode server authentication is
separate from model-provider credentials, and Cursor SDK execution/auth is separate from
its quota telemetry.

### PROVIDER-012 — Telemetry is not authority

A private or reverse-engineered Usage endpoint, where intentionally supported, is a
telemetry source only. It must never become execution or authentication authority.

### Adapter conformance

For every supported provider/runtime the following are tested, and **no adapter is marked
fully supported from documentation alone — executable conformance evidence is required**:

1. Goal continuation without a duplicate provider loop.
2. Plan/To-Do binding, and inability to rewrite an approved Plan.
3. Exact item-level To-Do reconciliation.
4. Tool/MCP/Skill selection and permission interception.
5. Subagent/Crew/Review isolation claims.
6. Attachment materialization truth.
7. Stop/pause/cancel and late-event fencing.
8. Resume-exact versus replay disclosure.
9. Usage and reset source truth.
10. Requested versus effective identity.
11. Provider-native state remaining noncanonical.
12. Control tier and degraded reason displayed.

Adapter classes and their honest limitations:

| Class | Examples | Preferred behaviour | Honest limitation |
|---|---|---|---|
| Direct API | direct model APIs | PM supplies bounded messages and tools, PM executes tools, structured events | strongest control; model/provider feature differences remain |
| Cooperative SDK/protocol | Cursor SDK / ACP-like routes | PM retains state, SDK handles transport and session, tool intents return to PM | some SDK-internal behaviour remains opaque |
| Server bridge | OpenCode server | PM binds the provider session as correlation, projects PM tools/MCP, normalizes events | the provider server may retain native session state, which stays noncanonical |
| CLI bridge | Claude Code, Antigravity, Muse Code, coding CLIs | prefer host-tool execution; otherwise isolate process/workspace and reconcile | native plans/todos/subagents/tools may be partly opaque |

OpenCode Go/Zen and similar plans are model/provider offerings; they are not the OpenCode
server control path.
