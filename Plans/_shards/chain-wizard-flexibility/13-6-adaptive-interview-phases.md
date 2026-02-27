## 6. Adaptive Interview Phases

### 6.1 Goal

- The **Interview** today has a fixed set of phases (e.g. Scope, Architecture, UX, Data, Security, Deployment, Performance, Testing). For different intents and contexts, we want the **AI Interviewer** (or phase manager) to **decide** which phases to **cut**, which to **shorten**, and which to **double down on**.
- This keeps the interview appropriate to the task: full product gets full depth; PR contribution gets a light pass; fork/evolve gets delta-focused depth where it matters.

### 6.2 Mechanism

- **Inputs to the decision:**
  - **Intent** (New project, Fork & evolve, Enhance/rewrite/add, Contribute PR).
  - **Early context:** e.g. first answers, uploaded requirements summary, or a short "scope" question at the start.
  - **Optional:** Project context (languages, frameworks) from codebase_scanner when it's an existing project.
- **Output:** A **phase plan** for this run: which phase IDs to include, optional **depth** or **weight** per phase (e.g. "Architecture: deep," "Deployment: skip"), and optionally reorder.
- **Implementation:** Extend the **phase manager** (interview-subagent-integration.md) to support:
  - A **pre-interview step** (phase 0) that runs a mandatory scope probe, then calls a **phase selector** that returns the phase plan.
  - The rest of the interview runs only the selected phases, with depth enforcement per phase.

**Pre-Interview Scope Probe (Resolved):**
Phase 0 is a mandatory scope probe that runs before the adaptive phase selector:
- **Max 2 questions:** (1) Opening question (see above), (2) "Any constraints, preferences, or specific technologies you want to use?"
- After receiving answers to both (or after the user signals readiness), the phase selector is called with the scope context.
- Trigger: always runs as phase 0. Not skippable.
- Config: `interview.scope_probe.max_questions`, default `2`.

**Depth Hints (Resolved):**
Depth is enforced as a **soft cap** based on question count (not token budget):
- **Short:** max 2 questions, no research tool calls. If the agent signals phase-complete at count ≤ 2, accept.
- **Full:** all questions in the phase template, plus research tool calls when needed. No artificial cap.
- **Skip:** phase is not run at all.
- **Enforcement:** If the agent has asked `max` questions and has not signaled phase-complete, send a "Please wrap up this phase" instruction. If the agent asks one more question (grace: `max + 1`), force-complete the phase with a `phase.force_completed` seglog event.
- Config per phase: `interview.phases.{phase_name}.depth` (default `"full"`), `interview.phases.{phase_name}.max_questions` (default: phase-template-defined).

### 6.3 Phase Selector Contract

**Input (Rust struct or JSON):**

- `intent`: enum -- `NewProject` | `ForkEvolve` | `EnhanceRewriteAdd` | `ContributePR`
- `requirements_summary`: `String` -- first 2000 characters of the canonical requirements document (after merge/Builder)
- `codebase_summary`: `Option<String>` -- from codebase_scanner when project path exists and is an existing project; `None` for new project or when scanner not run

**Output:**

- `phase_plan`: `Vec<PhasePlanEntry>` where each entry is:
  - `phase_id`: `String` (e.g. `"scope_goals"`, `"architecture"`, `"ux"`, `"data"`, `"security"`, `"deployment"`, `"performance"`, `"testing"`, or other phase IDs from interview-subagent-integration.md)
  - `depth`: enum -- `Full` | `Short` | `Skip`

**Depth semantics:**

- **Full:** Run full phase -- all questions for that phase, research if configured.
- **Short:** Run abbreviated phase -- maximum 2 questions for that phase, no research.
- **Skip:** Do not run this phase; omit from interview run.

**Fallback when selector fails or returns empty:**

Use rule-based default (do not re-invoke selector):

- **NewProject** → all phases `Full`
- **ForkEvolve** → all phases `Full`
- **EnhanceRewriteAdd** → all phases `Full`
- **ContributePR** → only `scope_goals` (Short), `testing` (Short); all other phases `Skip`

**Storage:** Persist `phase_plan` in interview state. Path: `.puppet-master/interview/phase_plan.json` (or include in existing interview state file if one exists). Schema must allow round-trip of `Vec<PhasePlanEntry>` (phase_id + depth).

**Resume:** When resuming an interview, load `phase_plan` from stored state; do **not** re-run the phase selector. Run only the phases and depths already in the loaded plan.

**User override -- "Run all phases":** Add a GUI checkbox **"Run all phases"** (default **off**). When **on**, ignore stored/generated `phase_plan` and run all phases at **Full** depth. This overrides both selector output and fallback.

**User override -- Phase checklist (optional):** Show a list of phases with checkboxes. Checked = run the phase (use depth from `phase_plan` or Full when "Run all phases" is on). Unchecked = force-skip that phase regardless of plan. If "Run all phases" is on, all checkboxes default checked; user can uncheck to skip specific phases.

### 6.4 Relationship to interview-subagent-integration.md

- Phase **subagents** (product-manager, architect-reviewer, etc.) remain; we only **select** which phases run and at what depth.
- **Document generation** and **research/validation** subagents still apply to the phases that are run.
- **New subsection** in that plan: "Adaptive phases: intent and context drive phase selection and depth; phase manager implements phase selector and runs only selected phases."

### 6.5 Gaps and Risks

- **Determinism:** Phase selection is AI-driven; two runs with same intent might get different phase sets. Consider caching by (intent, requirements_hash) or making selection rule-based with optional AI override.
- **User override:** Should the user be able to "force full interview" or "skip phase X"? If so, add a simple override in GUI (e.g. "Run all phases" checkbox or phase checklist).

### 6.6 Contract fragments + Contract Unification Pass (Project Contract Pack)

Adaptive interview phases are responsible not only for collecting answers, but for producing the **project contract layer** required for autonomous execution (§5.7; SSOT: `Plans/Project_Output_Artifacts.md`).

#### 6.6.1 Per-phase contract fragments (incremental)

Each interview phase contributes **contract fragments** (structured, citable statements) that are later unified into the Project Contract Pack:

- **Scope & Goals:** scope boundaries, success metrics, out-of-scope constraints (feeds contract seeds and acceptance checks).
- **Architecture & Technology:** module boundaries, external interfaces, build/run commands, version pins (feeds API/module/command contracts).
- **Product / UX:** user journeys, UI invariants, role/permission surface, accessibility requirements (feeds interface and acceptance contracts). **When the user project includes a GUI:** also produces UI wiring fragments — interactive-element inventory, preliminary `UICommandID` assignments, and UI-to-handler mapping seeds — that feed the UI wiring matrix and UI command catalog generated during unification (§6.6.2).
- **Data & Persistence:** schemas, migrations, consistency rules, indexing/search expectations (feeds data-model and integration contracts).
- **Security & Secrets:** authn/authz model, threat controls, secret handling, error taxonomy constraints (feeds security + error taxonomy contracts).
- **Deployment & Environments:** environment matrix, CI/CD commands, configuration keys, rollout constraints (feeds command + integration contracts).
- **Performance & Reliability:** budgets (latency/memory), availability targets, observability requirements (feeds NFR budgets and acceptance checks).
- **Testing & Verification:** acceptance checks, how to run tests/commands, required evidence outputs (feeds `acceptance_manifest.json` + node acceptance arrays).

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:contracts_index.schema.json, SchemaID:acceptance_manifest.schema.json

#### 6.6.2 Contract Unification Pass (deterministic, end-of-interview)

At interview completion, a single deterministic **Contract Unification Pass** must run to:

1. Deduplicate overlapping fragments across phases (single canonical statement per contract).
2. Assign stable `ProjectContract:*` IDs (namespaced, deterministic; see `Plans/Project_Output_Artifacts.md` "Project contract IDs (stable)").
3. Materialize required user-project artifacts under `.puppet-master/project/` exactly per `Plans/Project_Output_Artifacts.md`:
   - `contracts/` + required `contracts/index.json`
   - canonical sharded `plan_graph/` (`index.json` + `nodes/<node_id>.json`; optional `edges.json`)
   - `acceptance_manifest.json`
   - `plan.md` (human-readable view, contract-ID referenced)
4. Ensure every plan node includes at least one resolvable `ProjectContract:*` in `contract_refs`.
5. Optional derived export handling: `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` may be materialized for convenience only; it is non-canonical and validators/orchestrator MUST use sharded `plan_graph/` as the execution source of truth.
6. **When the user project includes a GUI:** Generate UI wiring artifacts under `.puppet-master/project/ui/`:
   - `ui/wiring_matrix.json` — maps every interactive UI element to its `UICommandID`, handler, expected events, acceptance checks, and evidence requirements. MUST validate against a project-local adaptation of `Plans/Wiring_Matrix.schema.json` (same schema shape; `handler_location` and `ui_location` reflect user-project module paths, not Puppet Master internals).
   - `ui/ui_command_catalog.json` — stable registry of all `UICommandID` values for the user project, with descriptions and handler references.
    - Plan graph nodes that involve UI work (creating screens, adding interactive elements, wiring handlers) MUST include `contract_refs` entries pointing to the relevant wiring matrix entries and/or command catalog IDs.
    - GUI detection: The project is considered to have a GUI if the Architecture or Product/UX interview phases identify a graphical interface (desktop, web, or mobile). The `has_gui` flag is set during the interview and persisted in interview state.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:pm.project-plan-graph-index.v1

Large-output handling:

- Contract pack may be chunked across multiple files under `contracts/`; `contracts/index.json` remains the single canonical index for resolvability.
- Seglog artifact persistence must support deterministic chunking of large artifacts with `sha256` integrity events (see `Plans/Project_Output_Artifacts.md` "Seglog Canonical Persistence Contract").

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, SchemaID:contracts_index.schema.json, SchemaID:project_plan_graph_index.schema.json, SchemaID:project_plan_node.schema.json, SchemaID:acceptance_manifest.schema.json

#### 6.6.3 Validation (dry-run, before execution)

After the Contract Unification Pass, run the dry-run validator defined by `Plans/Project_Output_Artifacts.md` before execution begins.

Validation here is intentionally DRY:

- enforce SSOT checks for artifact presence, schema validity, deterministic node IDs, `ProjectContract:*` resolvability, and acceptance-manifest coverage
- if `.puppet-master/project/plan_graph/exports/plan_graph.monolithic.json` is materialized, validate it only as a derived consistency export (never canonical)
- enforce **UI wiring completeness** when `has_gui` is true (no unbound actions; catalog↔matrix coverage; UI-scope nodes carry wiring-related `contract_refs`)

ContractRef: ContractName:Plans/Project_Output_Artifacts.md

---

