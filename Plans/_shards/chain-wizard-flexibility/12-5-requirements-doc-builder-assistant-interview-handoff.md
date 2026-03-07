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

### 5.3.1 Builder handoff lifecycle and promotion

Builder runs against a staged bundle; canonical promotion happens only after the final user gate.

Required staged artifacts:
- `.puppet-master/requirements/staging/builder/<run_id>/requirements.md`
- `.puppet-master/requirements/staging/builder/<run_id>/contract-seeds.md`
- `.puppet-master/requirements/staging/builder/<run_id>/review-summary.json`

Promotion rules:
- **Accept:** promote the staged `requirements.md` to `.puppet-master/requirements/requirements-builder.md`, promote `contract-seeds.md`, update `canonical_requirements_path` via merge/promotion, then allow `Done -- hand off to Interview`.
- **Reject:** discard the staged review output and leave the last accepted Builder artifact (or no Builder artifact) unchanged.
- **Edit:** opens the revised staged bundle; user edits remain staged until the same Accept gate is completed.
- `Done -- hand off to Interview` is enabled only when the bundle state is `approved_for_handoff`; it must persist `builder_stage`, `builder_run_id`, `awaiting_final_approval`, and the accepted artifact refs.

### 5.4 Dependencies

- **Assistant chat** must be implemented (assistant-chat-design.md).
- **Project/context:** Assistant must know current project path and intent so it can tailor questions and the generated doc (e.g. "delta" vs "full product" vs "feature scope").
- **No duplicate rules:** Use the same rules pipeline (agent-rules-context.md) for Assistant; do not duplicate interview-specific rules in the Builder prompt beyond "produce a requirements doc for handoff."

### 5.5 Document review surfaces and generation order

This section defines the bundle-level review + iteration model for Requirements Doc Builder outputs, aligned with the Embedded Document Pane contract (`Plans/FinalGUISpec.md` §7.19.1).

**Key constraint:** The user must be able to iterate cheaply (targeted revisions driven by notes) without repeatedly invoking expensive Multi-Pass Review. Multi-Pass Review is final-only and runs once per bundle by default.

---

#### 5.5.0 Bundle + doc state model

**Bundle-level states (canonical):**
- `idle`
- `generating` (some docs `writing…`)
- `awaiting_user_review` (generation complete; docs are `draft/needs-review`)
- `revision_running` (Resubmit with Notes targeted revision pass)
- `awaiting_approvals` (user marks docs Approved/Done)
- `ready_for_final_review` (all docs approved + no open notes)
- `final_review_running` (Multi-Pass Review)
- `final_gate` (Accept | Reject | Edit)
- `complete`
- `error` / `interrupted` (resume supported)

**Doc-level states (canonical):**
- `writing…` → `draft` → `approved`
- `draft` ↔ `changes-requested` (notes open / resubmits)

`needs-review` may be used as a doc badge when helpful.

---

#### 5.5.1 Requirements Doc Builder flow (updated)

1. Conversation phase.
2. User confirms generation.
3. Qualifying questions for `empty` and `thin` checklist sections only.
4. Builder generates staged artifacts (requirements doc + contract seed pack) as a **bundle**, streaming writes into the Embedded Document Pane (live multi-doc preview).
5. Generation completes → docs become `draft` or `needs-review`.
6. User reviews, optionally edits, and adds inline notes (questions/change requests).
7. User clicks **Resubmit with Notes** (targeted revision pass). This step can repeat as needed.
8. User resolves notes and marks each doc **Approved/Done**.
9. When **all** docs are Approved/Done **and** there are **no open notes**, enable **Run Final Review** (Multi-Pass Review). Do not auto-run.
10. Multi-Pass Review runs once by default and ends with a single gate: **Accept | Reject | Edit**.

**Hard rule:** Resubmit with Notes MUST NOT trigger Multi-Pass Review.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md

---

#### 5.5.2 Resubmit with Notes: targeted revision contract

**Input:**
- Current doc contents for docs with open notes (or user-selected subset)
- All open notes (anchors + note_text + kind)
- Minimal context: document registry + which docs are Approved/Done

**Output:**
- Updated doc text for modified docs
- Replies for question notes (attached to the note thread)
- For each note: mark `addressed` with explanation and (if possible) updated anchor location

**Hard rules:**
- MUST NOT trigger Multi-Pass Review
- May answer questions without changing docs

ContractRef: ContractName:Plans/chain-wizard-flexibility.md

---

#### 5.5.3 Acceptance criteria (workflow-level)

- During generation, ≥2 docs appear in the doc list; user can switch and see streaming updates in the active doc.
- Notes persist and re-anchor using quote+context; if not found, note remains open with explicit warning.
- Resubmit with Notes performs a targeted pass and never invokes Multi-Pass Review.
- Final review cannot run until all docs Approved/Done and no open notes exist; runs once by default; ends in Accept/Reject/Edit gate with clean discard semantics for Reject.

### 5.6 Multi-Pass Review (Requirements Doc)

Multi-Pass Review is the **final-review** step for the Requirements Doc Builder bundle. It is intentionally not part of the cheap iteration loop; targeted revisions happen via **Resubmit with Notes** (§5.5).

**Trigger (hard gate):**
- Enabled only when:
  - all docs in the bundle are marked **Approved/Done**, and
  - there are **no open notes** (all notes resolved), and
  - user explicitly clicks **Run Final Review**.
- Must not auto-run when the conditions become true.
- Runs once by default; rerun explicit only.

**Output + gate:**
- Produces a findings summary and optional revised bundle.
- After completion, show a single gate: **Accept | Reject | Edit**.
- Review output is stored as a separate artifact set so:
  - Reject discards review output cleanly and preserves the pre-review bundle.
  - Accept applies the revised bundle.
  - Edit opens revised docs without rerunning review.

**Reviewer selection (deterministic):**
- Always include `requirements-quality-reviewer`.
- Add at most **two** secondary reviewers:
  - one domain reviewer resolved from the Builder domain-fragment stage when a single dominant domain exists
  - one structural reviewer: `architect-reviewer` for architecture-heavy requirements, otherwise `code-reviewer`
- Maximum reviewers per Builder Multi-Pass run: **3**
- Reviewer Personas are read-only during review; only the final synthesis pass writes a revised staged bundle.

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

