## 5. Requirements Doc Builder (Assistant → Interview Handoff)

### 5.1 Concept

- **Requirements Doc Builder** is a button in the requirements step that opens Builder chat on the requirements/wizard page.
- The Builder is a conversation-first flow. No questionnaire appears before the first user response.
- The Builder output remains a staged artifact until the flow reaches final approval and handoff.

**Opening Prompt (Resolved):**
The Assistant MUST initiate the interview/requirements flow with an opening question. The exact phrasing depends on context:
- **New project (no existing requirements):** "What are you building?"
- **Existing project (has requirements/codebase):** "What are you adding or changing?"
- **Fork/contribute (detected from project setup):** "What are you adding or changing in this fork?"

ContractRef: ContractName:Plans/interview-subagent-integration.md, ContractName:Plans/chain-wizard-flexibility.md

The Assistant does NOT wait for the user to speak first. This opening question is the first message in the interview thread. After the user responds, the scope probe phase begins (see §6.2).

### 5.2 Flow

**Turn definition (required):**
- One completed turn = one Assistant message plus one user response.
- `completed_turns` increments only after the user response arrives.

**Conversation phase (required):**
1. User clicks `Requirements Doc Builder` in the requirements step.
2. Builder chat opens and sends the context-appropriate opening question (see §5.1 Opening Prompt).
3. User and Assistant converse. Assistant may ask clarifying questions, suggest structure, and draft sections.
4. Assistant may suggest generation when either condition is true:
   - It determines there is enough information, or
   - `completed_turns >= 6`
5. Suggestion text is confirmatory (for example: `Would you like me to create the requirements doc?`) and does not auto-generate.
6. If the user keeps talking or ignores the suggestion, conversation continues with no forced handoff.
7. User can continue this phase indefinitely until they explicitly confirm generation.

**Generation trigger (required):**
- Generation starts only after an explicit user confirmation (for example: `yes, make the doc`).
- Once confirmed, Builder runs qualifying questions driven by checklist state (see section 5.3), then generates staged artifacts.

### 5.3 Handoff Contract

- **Output format:** Markdown recommended; structure (sections) must follow the **Builder output template** below so Interview and PRD generator get consistent input.
- **Single vs. multiple:** Builder produces one requirements document per generation run.
- **Persistence:** Handoff state (paths, source, checklist/conversation state, approval stage) is persisted for recovery.
- **Contract Layer seed pack:** Builder also emits `.puppet-master/requirements/contract-seeds.md` as a structured seed input for the Contract Layer (§5.7, §6.6). This file is **not** the canonical project contract pack; canonical contracts live under `.puppet-master/project/contracts/` and are referenced by stable `ProjectContract:*` IDs (SSOT: `Plans/Project_Output_Artifacts.md`).
- **Document packaging policy:** Requirements Builder outputs under `.puppet-master/requirements/**` that reach packaging triggers MUST be emitted as Document Sets and verified per `Plans/Document_Packaging_Policy.md` before handoff continues.

ContractRef: ContractName:Plans/Document_Packaging_Policy.md, Gate:GATE-014

**Builder output template (required):** The Assistant/Builder must emit a single Markdown document with the following **required top-level sections** (headings). Implementations may validate and warn if sections are missing.

| Section heading | Purpose |
|-----------------|--------|
| **Scope** | What is in scope for the product, delta, or feature. |
| **Goals** | High-level goals and success criteria. |
| **Out of scope** | Explicitly excluded items. |
| **Acceptance criteria** | Testable conditions of done (can be a list). |
| **Non-goals** | What we are not trying to achieve. |

Additional sections (for example **Risks**, **Dependencies**, **Constraints**) are allowed. The PRD generator and Interview assume at least the five above.

**Contract seed pack template (required when Builder is used):**

The Assistant/Builder must also emit a **single** Markdown document at `.puppet-master/requirements/contract-seeds.md` with the following **required top-level sections** (headings). Implementations may validate and warn if sections are missing.

| Section heading | Purpose |
|-----------------|--------|
| **Assumptions** | Initial assumptions that materially affect design/execution (explicitly stated so they can be validated or overridden). |
| **Constraints** | Hard constraints (versions, platforms, compliance, budgets, forbidden deps) that must be enforced downstream. |
| **Glossary** | Canonical terms and naming decisions for the target project (feeds optional `.puppet-master/project/glossary.md`). |
| **Non-functional budgets** | Explicit budgets (latency, memory, cost, availability) that will become executable acceptance checks. |

**Checklist dual-state contract (required):**
- Conversation state contract: `builder_conversation_state.v1`
  - `session_id` (format `PM-YYYY-MM-DD-HH-MM-SS-NNN`)
  - `completed_turns`
  - `last_suggestion_turn`
  - `awaiting_generation_confirmation`
  - `awaiting_final_approval`
- Side structure contract: `builder_checklist_state.v1`
  - `section_id`
  - `status` (`empty | thin | filled`)
  - `source` (`requirements_doc | contract_seed_pack`)
  - `last_updated_event_id`
  - `coverage_note`

**Qualifying-question rule (required):**
- Before generation, ask qualifying questions only for checklist entries with `status=empty` or `status=thin`.
- Do not ask follow-up questions for sections already marked `filled`.

### 5.4 Dependencies

- **Assistant chat** must be implemented (assistant-chat-design.md).
- **Project/context:** Assistant must know current project path and intent so it can tailor questions and the generated doc (e.g. "delta" vs "full product" vs "feature scope").
- **No duplicate rules:** Use the same rules pipeline (agent-rules-context.md) for Assistant; do not duplicate interview-specific rules in the Builder prompt beyond "produce a requirements doc for handoff."

### 5.5 Document review surfaces and generation order

**Strict order for requirements Builder flow:**
1. Conversation phase.
2. User confirms generation.
3. Qualifying questions for `empty` and `thin` checklist sections only.
4. Builder generates staged requirements doc and staged contract seeds.
5. Builder asks: `Do you want to make any more changes or talk about it more?`
6. If user requests edits, return to conversation and repeat generation path as needed.
7. If user confirms no more changes, run optional Multi-Pass Review (if enabled).
8. Show Multi-Pass findings summary (chat + preview section).
9. Capture one final approval decision for the review run.
10. Promote canonical artifacts and hand off to Interview.

**Three-location review rule (required):**
- Full document bodies are not rendered in chat.
- After generation or revision, chat must always point to all three review locations:
  1. Opened in File Editor (auto-open action),
  2. Clickable canonical file path,
  3. Embedded document pane entry on the current page.

**Preview section contract (requirements/wizard page):**
- The preview section must show the findings summary and the current approval state before handoff.
- The same preview area hosts or links to the embedded document pane for requirements artifacts.

**Document pane + recovery state contracts:**
- `document_pane_state.v1`
  - `project_id`
  - `page_context` (`wizard | interview`)
  - `selected_document_id`
  - `selected_view` (`document | plan_graph`)
  - `cursor_scroll_state`
  - `history_selection`
  - `approval_stage`
- `document_checkpoint.v1`
  - `checkpoint_id`
  - `document_id`
  - `label`
  - `artifact_ref`
  - `created_at`
  - `restorable=true`

### 5.5.1 Gaps and Risks

- **Token usage:** Long conversations before handoff may use significant context; support `Summarize and produce doc` as an explicit Builder action.
- **Quality:** Builder output is best-effort and Interview can still clarify; validation is enforced through checklist status and review gates.
- **Abandonment:** Builder includes `Cancel and return to requirements` with no save.

### 5.6 Multi-Pass Review (Requirements Doc)

When the Requirements Doc Builder reaches post-generation confirmation, an optional **Multi-Pass Review** runs before handoff to Interview. A **review agent** spawns N **review subagents** (each can use a different model/provider) to evaluate gaps, problems, missing information, and consistency.

This review covers the requirements document **and** the staged Contract Layer seed pack (`.puppet-master/requirements/contract-seeds.md`) as a single bundle, so the Interview’s Contract Layer does not start from inconsistent assumptions/constraints/glossary.

**When it runs:** After post-generation user confirmation and before canonical promotion/handoff.

**Settings (early in the flow -- same page as requirements step or wizard):**

- **Multi-Pass Review:** On/off. **Default: off.** When on, review runs after the Builder produces a document and before handoff to Interview.
- **Number of reviews (additional checks):** How many subagents review the doc. Default **2**, max **10**. So with 2, the review agent spawns 2 subagents; with 10, it spawns 10 subagents.
- **Use different models:** Default **true**. When true, each subagent can use a different model (and optionally platform) from a user-configured list.
- **Model/platform list:** User can configure which models (and platforms) to use for review subagents; **cross-platform** is allowed (e.g. one subagent on Claude, one on Codex).
- **Model/platform list validation:** Minimum 1 entry; maximum 20. When "Use different models" is true and list has fewer than N entries (N = number of reviews), **cycle** through the list (assign models round-robin to subagents) and show a short UI notice: "Fewer models than reviews; some models will be reused."
- **Review agent model/provider:** The review agent (the process that consumes subagent reports and produces the revised doc) uses a **configurable** model/provider. Default: same as the primary provider used for the Builder. GUI: same model/provider list or a dedicated "Review agent" dropdown; may be the same as one of the subagent models or different.

**Flow:**

1. Requirements doc is produced by the Assistant. **Empty or minimal doc:** Before starting Multi-Pass Review, check Builder output size (e.g. character or token count). Minimum document size to trigger Multi-Pass review: **100 characters**. Documents shorter than 100 characters (or empty/whitespace-only) skip Multi-Pass and proceed directly. Config: `interview.multi_pass.min_doc_chars`, default `100`. Show a brief notice: "Document too short for review; using as-is."
2. Review agent spawns N subagents (N = number of reviews). **Single document:** There is always exactly one requirements document from the Builder. N subagents each review that same doc; no per-document batching. Whole-set pass does not apply (single doc = whole set). Each subagent receives:
   - the requirements doc, and
   - `contract-seeds.md` (when present), and
   - (for delta/feature intents) optional codebase context from codebase_scanner
3. Subagents look for: gaps, problems, missing information, unscoped items. Depth is lighter than the Interview -- the Interview will flesh details out.
4. Each subagent reports findings back to the review agent, then is terminated (no long-lived context).
5. Review agent **produces a revised requirements document** (and, when present, a revised `contract-seeds.md`) plus a findings summary.
6. Findings summary is shown in chat and in the wizard preview section before approval.
7. **One final approval gate:** user chooses **Accept**, **Reject**, or **Edit** for the revised output bundle. No per-section approval and no per-document approval.
8. If **Edit** is chosen, open the revised artifacts in editor/document pane, then return to the same final approval gate.
9. On **Accept**, revised artifacts become canonical and handoff proceeds. On **Reject**, original Builder artifacts remain canonical and handoff proceeds.

**Run state:** Persist and expose for UI/recovery: `pending` → `spawning` → `reviewing` (with progress: pass/round and subagents active) → `producing` (review agent writing revised doc) → `awaiting_approval` → `complete` | `cancelled` | `failed`. On failure, set `failed` and store error reason; on cancel, set `cancelled`. Recovery snapshot (newfeatures §4) must include this state and progress so "run was interrupted" and optional resume are accurate.

**Review agent behavior:** Produce revised document; user must approve before handoff. No automatic apply without approval.

**Dependencies:** Assistant chat, review agent plus N subagents (Multi-Pass Review pattern; not the Crew feature), platform_specs for model/platform selection. For fork/PR/enhance intents, review subagents may receive codebase context so they can check feasibility against existing code. **Codebase context:** For intents **Fork & evolve**, **Enhance/rewrite/add**, and **Contribute (PR)**, always attach a **short codebase context** (e.g. from codebase_scanner: key paths, module list, tech stack summary) to each review subagent prompt when project path is set. No extra user setting; intent + project path imply inclusion.

**Error handling:**

- **Subagent crash or timeout:** Treat as one failed review; collect partial report if available. If fewer than half of the requested reviews complete, mark run as `failed` and surface "Multi-Pass Review failed (too few reviews completed)." Otherwise, continue with completed reports and log the failure.
- **Review agent fails to produce revised doc:** Mark run as `failed`. Surface error message and option to "Use original document" (set Builder output as canonical and continue) or "Retry" (re-run review agent once with same reports).
- **All subagent spawns fail:** Mark run as `failed`; surface "Could not start review subagents (check model/provider and auth)." Option "Use original document" as above.

**Findings and approval contracts (required):**
- `review_findings_summary.v1`
  - `run_id`
  - `scope` (`requirements | interview`)
  - `gaps`
  - `consistency_issues`
  - `missing_information`
  - `applied_changes_summary`
  - `unresolved_items`
- `review_approval_gate.v1`
  - `run_id`
  - `decision` (`accept | reject | edit`)
  - `decision_timestamp`
  - `decision_actor`
  - `preconditions` (`findings_summary_shown=true`)

**GUI and visibility:** See section 3.5 (agent activity view and progress indicator) so the user sees the review agent and subagents working during Multi-Pass Review. **Pause, cancel, resume** are supported options (section 3.5). Findings summary and final approval UI must be shown in both chat and preview section before handoff.

### 5.7 Contract Layer (Requirements → Contracts → Plan → Execution)

This flow must insert an explicit **Contract Layer** between requirements and plans so large, parallel agent execution stays deterministic and DRY:

`requirements.md` → `Project Contract Pack` → `plan.md` + `plan_graph/` (sharded plan graph; canonical) → execution

**Purpose (why the Contract Layer exists):**

- Requirements text is human-oriented and often ambiguous; a contract layer converts key statements into **stable, citable IDs**.
- When many agents work in parallel, contract IDs prevent drift: plan nodes reference `ProjectContract:*` IDs instead of copying prose.

**Two-layer contract model (do not mix them):**

1. **Platform Contracts (Puppet Master SSOT; referenced by name/ID only):** Canonical event model, tool schemas/policy semantics, provider capability interface, patch pipeline contracts, session storage envelopes, UI command contracts. These live in SSOT docs such as:
   - `Plans/Contracts_V0.md` (event envelopes, UICommand, auth)
   - `Plans/Tools.md` (tool registry + permission semantics)
   - `Plans/CLI_Bridged_Providers.md` (provider normalized streams)
   - `Plans/Crosswalk.md` (ownership boundaries)
   - `Plans/DRY_Rules.md` (ContractRef enforcement)
   - **Rule:** Do **not** copy these internal `Plans/` schemas/docs into user projects. In user-project artifacts, Platform Contracts are referenced only by stable name/ID (e.g. `ContractName:*`, `SchemaID:*`), and user projects are not expected to have a `Plans/` folder.

2. **Project Contracts (generated per user project):** The **Project Contract Pack** under `.puppet-master/project/contracts/`, indexed by required `contracts/index.json`, and referenced by stable `ProjectContract:*` IDs (SSOT: `Plans/Project_Output_Artifacts.md`).

**Where the Contract Layer artifacts live (filesystem materialization):**

- The required user-project artifact set is materialized under `.puppet-master/project/` (see §11 for the full list; SSOT: `Plans/Project_Output_Artifacts.md`).
- The Requirements Doc Builder seed file `.puppet-master/requirements/contract-seeds.md` is a **staging input** used by the interview’s contract unification step (§6.6). It is not part of the canonical `.puppet-master/project/` artifact set.

**Storage and referencing semantics (canonical):**

- **Canonical source of truth is seglog**: artifacts are persisted as full-content artifact events (chunked deterministically when needed) with `sha256` integrity. Filesystem copies are materializations/cache and must be regenerable from seglog.
- redb projections and Tantivy indexing must make these artifacts discoverable by logical path, artifact type, contract IDs, and content search.

**DRY rule (critical):**

- Execution nodes must reference project contracts via `contract_refs: ["ProjectContract:..."]` (resolvable via `contracts/index.json`) and must not embed contract content inline.
- If plan.md repeats explanatory text for readability, it must include a pointer like `Canonical source: ProjectContract:<...>` so the canonical contract is unambiguous.

**Acceptance criteria (testable; no manual checks):**

A dry-run validator must be able to parse the `.puppet-master/project/` artifact set and verify (SSOT: `Plans/Project_Output_Artifacts.md` Validation Rules):

- Every node shard contains `contract_refs` and references at least one resolvable `ProjectContract:*` ID (via `contracts/index.json`).
- Every node shard `acceptance[].check_id` is present in `acceptance_manifest.json`.
- Evidence outputs are defined and point to `.puppet-master/project/evidence/<node_id>.json` (schema `pm.evidence.schema.v1`).
- Orchestrator can execute in headless mode from `.puppet-master/project/` artifacts alone; when HITL blocks some nodes, the scheduler continues other non-blocked work where dependencies allow.

ContractRef: SchemaID:contracts_index.schema.json, SchemaID:acceptance_manifest.schema.json, SchemaID:project_plan_graph_index.schema.json, SchemaID:project_plan_node.schema.json, SchemaID:evidence.schema.json, ContractName:Contracts_V0.md#EventRecord

---

