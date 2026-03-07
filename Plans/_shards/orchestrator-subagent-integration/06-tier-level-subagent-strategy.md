## Tier-Level Subagent Strategy

Canonical selection precedence:
1. explicit tier override / required-subagent contract
2. plan/acceptance-driven hard requirement
3. LSP bias (when enabled; ranking hint only)
4. language/domain/framework heuristics
5. deterministic fallback

`explore` is legacy naming only; all persistence, registry validation, and display MUST use `explorer` per `Plans/Personas.md`.

ContractRef: ContractName:Plans/Personas.md, ContractName:Plans/orchestrator-subagent-integration.md

### Phase Level (Strategic Planning)

**Primary Subagents:**
- `project-manager`: Overall project coordination, timeline, resource management
- `architect-reviewer`: System design validation, architectural decisions
- `product-manager`: Product strategy, requirements prioritization

**Selection Logic:**
- Default: `project-manager` for coordination
- If architecture decisions needed: `architect-reviewer`
- If product/feature planning: `product-manager`
- Can use multiple subagents in parallel for complex phases

**Use Cases:**
- Phase planning and breakdown
- Dependency analysis
- Risk assessment
- Resource allocation
- Architecture validation

### Task Level (Domain-Specific Work)

**Dynamic Selection Based On:**

1. **Project Language Detection:**
   - `rust-engineer` → Rust projects (Cargo.toml detected)
   - `python-pro` → Python projects (requirements.txt, pyproject.toml)
   - `javascript-pro` → JavaScript/Node.js (package.json)
   - `typescript-pro` → TypeScript (tsconfig.json)
   - `swift-expert` → Swift projects (Package.swift, .xcodeproj)
   - `java-architect` → Java projects (pom.xml, build.gradle)
   - `csharp-developer` → C# projects (.csproj, .sln)
   - `php-pro` → PHP projects (composer.json)
   - `golang-pro` → Go projects (go.mod)

2. **Task Domain:**
   - `backend-developer` → Backend/API tasks
   - `frontend-developer` → Frontend/UI tasks
   - `fullstack-developer` → Full-stack tasks
   - `mobile-developer` → Mobile app tasks
   - `devops-engineer` → Infrastructure/deployment tasks
   - `database-administrator` → Database tasks
   - `security-auditor` → Security-focused tasks
   - `performance-engineer` → Performance optimization tasks

3. **Framework-Specific:**
   - `react-specialist` → React projects
   - `vue-expert` → Vue.js projects
   - `nextjs-developer` → Next.js projects
   - `laravel-specialist` → Laravel projects

**Selection Priority:**
1. Language-specific engineer (if detected)
2. Domain expert (backend/frontend/etc.)
3. Framework specialist (if applicable)
4. Fallback to `fullstack-developer`

**Example:**
- Rust backend API task → `rust-engineer` + `backend-developer`
- React frontend task → `react-specialist` + `frontend-developer`
- Python data processing → `python-pro` + `backend-developer`

### Subtask Level (Focused Implementation)

**Dynamic Selection Based On:**

1. **Subtask Type:**
   - `code-reviewer` → Code review subtasks
   - `test-automator` → Testing subtasks
   - `technical-writer` → Documentation subtasks
   - `api-designer` → API design subtasks
   - `ui-designer` → UI/UX design subtasks
   - `database-administrator` → Database subtasks
   - `security-engineer` → Security implementation subtasks

2. **Inherited from Task:**
   - Language-specific engineer (if task has one)
   - Domain expert (if task has one)

3. **Specialized Needs:**
   - `accessibility-tester` → Accessibility requirements
   - `compliance-auditor` → Compliance/regulatory needs
   - `performance-engineer` → Performance-critical subtasks

**Selection Logic:**
- Inherit language/domain from parent task
- Add specialized subagent based on subtask focus
- Can use multiple subagents (e.g., `rust-engineer` + `test-automator`)

### Iteration Level (Execution & Debugging)

**Dynamic Selection Based On:**

1. **Iteration State:**
   - `debugger` → When errors/failures detected
   - `code-reviewer` → For code quality checks
   - `qa-expert` → For testing/validation
   - `performance-engineer` → For performance issues

2. **Error Patterns:**
   - Compilation errors → Language-specific engineer + `debugger`
   - Test failures → `test-automator` + `debugger`
   - Security issues → `security-auditor` + `debugger`
   - Performance issues → `performance-engineer` + `debugger`

3. **Inherited Context:**
   - Language from task/subtask
   - Domain from task/subtask
   - Specialized needs from subtask

**Selection Logic:**
- Primary: Language/domain expert from parent tiers
- Secondary: Specialized role based on iteration needs
- Tertiary: `debugger` if errors present

### Subagent selection from LSP (diagnostics-based bias)

When LSP is available, the orchestrator can **bias subagent selection** using current LSP diagnostics for files in scope. This is an **optional enhancement** (see **Plans/LSPSupport.md §17.3**).

- **When:** When selecting a subagent for the **next subtask** (or task), optionally query LSP diagnostics for **files in scope** (see "Files in scope" below). If any file has diagnostics (e.g. errors) from a language server X, **prefer** the subagent that matches that language (e.g. rust-analyzer → `rust-engineer`, pyright → `python-pro`, eslint/typescript → `typescript-pro` or `javascript-pro`).
- **Files in scope:** One of (configurable; align with LSP gate scope in LSPSupport §17.1):
  - **Changed in last iteration** -- Files modified in the most recent iteration (recommended default for consistency with LSP gate).
  - **Open in editor** -- Files currently open in the run/context.
  - **Task's file list** -- If the task/subtask has an explicit list of files (e.g. from PRD or plan), use that list.
- **Integration point:** In the same place that performs `select_for_tier` (e.g. `SubagentSelector::select_for_subtask` / `select_for_task`): after building tier context, optionally call LSP client `get_diagnostics_for_paths(scope_paths)`. From the returned diagnostics, derive language(s) from `source` (e.g. rust-analyzer → Rust) or from file extension → server id mapping (see LSPSupport §3.2). Add to `TierContext` or `ProjectContext` a bias: e.g. `prefer_subagents: ["rust-engineer"]` when Rust errors are present, and use it when ranking/selecting subagents.
- **Fallback:** When LSP is disabled or diagnostics unavailable, use existing selection logic only (language detection from file presence, domain, error patterns). No change to behavior when LSP is off.

