## 8. Plan Mode, Deep Plan Mode, and Plan Thoroughness (PT)

### 8.1 Canonical planning model

This section defines the canonical contract for this surface.

ContractRef: Plans/FinalGUISpec.md#15.4 Planning panel widget (sticky sidebar)

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- Plan/TODO persistence is locked to explicit revision states, structural-edit gating after approval, bounded revision history, and emission of `chat.plan_todo_updated` for durable TODO mutations.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- draft
- approved
- executing
- completed
- blocked
- Structural edits = adding / removing / reordering TODO items
- chat.plan_todo_updated

Labels and values:
- Plan
- Deep Plan
### 8.2 Plan Thoroughness (PT)

**Plan Thoroughness (PT)** replaces the old planning-depth control.

PT is visible in the Assistant Chat GUI whenever **Plan** or **Deep Plan** is active.

Canonical PT enum:
- `Light`
- `Balanced`
- `Comprehensive`

Defaults:
- Plan default PT: `Balanced`
- Deep Plan default PT: `Balanced`

PT controls:
- clarifying-question budget
- repo-research breadth
- whether cited web research is used by default vs only when clearly needed
- how explicitly the plan captures risks, alternatives, dependencies, and validation steps
- how detailed the normalized TODO list and execution ordering become

**Interpretation rule:** PT is relative to the active planning mode. Deep Plan at a given PT is always more intensive than Plan at the same PT.

### 8.3 PT budget matrix (deterministic baseline)

These are deterministic first-implementation budgets. They are ceilings/defaults, not promises that every planning run must use the full budget.

| Mode | PT | Clarifying-turn budget | Repo/codebase research | Web research default | Expected output detail |
|---|---|---:|---|---|---|
| Plan | Light | 2 | focused, nearby files only | off by default; only if user explicitly asks or current/external facts are required | concise plan + TODO list |
| Plan | Balanced | 4 | moderate, cross-file where needed | targeted cited web research when materially helpful | detailed plan + TODO list + affected areas |
| Plan | Comprehensive | 6 | broad local research over affected subsystems | limited cited web research across key external dependencies/capabilities | detailed plan + TODO list + risks + alternatives |
| Deep Plan | Light | 4 | broad local research with architectural context | targeted cited web research allowed by default | full markdown plan doc + TODO list |
| Deep Plan | Balanced | 6 | deep local research across relevant subsystems, constraints, and prior docs | multi-source cited web research when helpful | full markdown plan doc + TODO list + risks + alternatives + validation notes |
| Deep Plan | Comprehensive | 8 | deepest local research, including architecture seams and likely downstream impacts | strongest cited web research posture of any planning path | full markdown plan doc + TODO list + alternatives + rollout/validation + wizard-escalation check |

Web-research rules:
- When web research is used, it must follow the cited web-search contract.
- Plan uses shorter web research than Deep Plan.
- Deep Plan should favor primary/official sources when researching platform capabilities, provider behavior, or current best practices.

### 8.4 Standard Plan Mode

**Intended use:** medium-complexity work that benefits from explicit planning but does not obviously require a spec-style document or assistant-to-wizard escalation.

Required behavior:
- Clarifying questions are allowed and expected; they are not optional.
- The planning artifact is lightweight and execution-oriented.
- The plan panel remains visible in chat and shows the written plan plus the normalized TODO list.
- The user may open the plan artifact in the editor on demand, but automatic editor opening is not required for standard Plan.
- Plan may use parallel safe research/subagent work where allowed, but it remains a read-only planning run.
- Plan should prefer repo/codebase research first and use shorter web research than Deep Plan.

Standard Plan artifact minimums:
- concise problem statement
- current-state summary when relevant
- proposed approach summary
- normalized TODO list for execution
- verification / validation notes
- unresolved questions when they remain

### 8.5 Deep Plan Mode

**Intended use:** larger features, substantial enhancements, major refactors, complex changes spanning several domains, or asks with high uncertainty.

Required behavior:
- Deep Plan asks more questions than standard Plan at the same PT.
- Deep Plan performs materially broader repo research and web research than standard Plan at the same PT.
- Deep Plan produces a richer markdown planning document and automatically opens it in a preview-capable editing surface.
- The default Deep Plan artifact class is `planning_draft` unless the user explicitly saves it to a workspace path.
- `open_source` for a non-persisted Deep Plan document opens a transient `generated://<artifact_id>` buffer.
- Deep Plan documents may include headings, tables, checklists, file paths, fenced code blocks, Mermaid diagrams, and explicit tradeoff sections.
- The planning document remains canonical as source markdown / Mermaid text even when richly rendered.

Deep Plan document minimum sections:
- `Objective`
- `Scope`
- `Current State / Relevant Context`
- `Proposed Approach`
- `Open Questions / Assumptions`
- `Execution Plan / TODOs`
- `Validation / Acceptance`

Optional but allowed sections:
- `Risks`
- `Alternatives Considered`
- `Mermaid Diagrams`
- `Code Snippets`
- `Affected Files / Areas`
- `Rollout / Migration Notes`

### 8.6 Normalized TODO contract for planning outputs

This section consumes the linked owner contract and stays aligned with it.

Core rules:
- Plan and Deep Plan must both project to a normalized TODO list, with a named Q&A loop before Deep Plan execution and a locked TODO item schema/status set.
- TODO tool behavior is locked so todowrite and todoread use the normalized TODO schema, todowrite is not blanket auto-denied in ask/plan mode, and Deep Plan edits must resync the TODO projection before execution.
- `chat.plan_todo_updated` must have an explicit owner-contract definition for durable normalized TODO mutation, and `todoread` must not survive as a `source_surface` mutation source.

Fields:
- Q&A loop
- todo_id
- title
- summary
- status
- dependencies[]
- owner_hint
- verification_hint
- pending | in_progress | completed | blocked | skipped
- superseded
- todowrite
- todoread
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove `todowrite` from blanket `ask/plan` mode auto-deny
- editing Deep Plan markdown (the rich artifact) MUST update the normalized TODO projection BEFORE execution begins

Labels and values:
- Plan
- Deep Plan
- chat.plan_todo_updated
### 8.7 Review loop for planning artifacts

Standard Plan review:
- user may continue the chat, request revisions, or open the plan in the editor
- follow-up chat responses may revise the planning artifact

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Crosswalk.md

Deep Plan review:
- the plan document opens automatically in the editor / preview-capable planning surface
- users may edit the markdown directly
- on source-backed or deterministically mapped selections, the review palette offers `Comment / Ask`, `Replace with...`, `Insert after...`, `Remove / Strike this`, and `Send selection to chat`
- durable actions create annotations on the existing `note_record.v1` lineage; `Send selection to chat` creates a visible pending `document_selection_context` chip on the owning thread

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FinalGUISpec.md

Deep Plan targeted revision rules:
- `Resubmit with Annotations` launches a targeted revision pass over docs with open durable annotations, or a user-selected subset
- targeted revision may update the plan document and/or answer question/comment annotations
- targeted revision MUST NOT auto-run Multi-Pass Review
- conflicting or stale mutating annotations are excluded from automatic revision until the user resolves them

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/Crosswalk.md

Deep Plan annotation-handling rules:
- preserve the annotation lifecycle `open -> addressed -> resolved`
- preserve deterministic position + quote selector re-anchoring
- if an anchor cannot be reattached, keep the annotation open and show an explicit warning rather than silently dropping it
- comment annotations may coexist with other annotations on the same span; overlapping mutating annotations conflict by default
- final review gates use `no open annotations`, not `no open notes`
- read-only / no-source-map renders such as plan-graph-like surfaces are `Send selection to chat` only in v1 unless a stable semantic-anchor contract is added later

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Permissions_System.md

### 8.8 Approval, queue, and execution handoff

Approval rules:
- Planning output never auto-executes.
- The assistant must wait for explicit approval to execute.
- Approval to execute means the planning artifact/TODO state is frozen as the execution starting point.
- The user may still continue planning instead of executing.

Required post-plan actions when applicable:
- `Execute`
- `Execute with Crew`
- `Continue Planning`
- `Open in Editor`
- `Save As`
- `Queue Execution` (only when another run is active in the same thread)

Execution rules:
- If the thread is idle, `Execute` starts immediately.
- If another run is active in the same thread, `Queue Execution` places the approved plan behind the current run.
- The follow-on execution run uses canonical runtime `regular` by default, or `yolo` only when the user explicitly selects YOLO posture.
- Execution may be performed by a single agent, a crew, or an agent with subagents using the same approved plan/TODO state.

### 8.9 Wizard-escalation check

Both planning overlays may recommend the Chain Wizard when the work is better treated as feature/enhancement specification plus adaptive interview/orchestrator flow.

Recommendation behavior:
- Standard Plan may recommend the Chain Wizard when signals are strong.
- Deep Plan MUST perform a wizard-escalation check before presenting final execute-first recommendations.
- Recommendation is a user-facing suggestion/CTA, not an automatic forced redirect.

Escalation signals include:
- new feature or substantial enhancement language
- major refactor / broad architectural change language
- likely impact across UI + data + security + deployment or several of those domains
- many unresolved questions remaining after planning
- the plan reads more like a feature spec / project delta than a straightforward implementation checklist

### 8.10 Acceptance criteria

- Plan and Deep Plan both remain read-only with respect to project files while planning.
- PT appears in the Assistant Chat GUI for both planning overlays and uses the canonical enum `Light | Balanced | Comprehensive`.
- Deep Plan at a given PT performs more research and produces a richer artifact than Plan at the same PT.
- Both planning overlays emit a normalized TODO list suitable for later execution.
- Deep Plan documents open in an editor/preview-capable surface and support durable annotations plus targeted revision.
- Planning artifacts are not written into the project repo by default.
- Execution starts only after explicit approval and uses `regular` or `yolo`, never `plan`.
- Approved plans can execute immediately when idle or queue behind another active run in the same thread.

