## 2. How Intent Affects the Flow

- **Intent selection** happens at flow start (Dashboard or first wizard step). It drives:
  - Which **project setup** questions we ask (e.g. "upstream URL" for Fork/PR, "project path" for Enhance, "new directory" for New).
  - Whether we **offer to create a fork** and/or **create a repo** (GitHub).
  - What **requirements prompt** we show ("Full product," "What are you adding/changing?" or "Feature/fix scope").
  - How the **Interview** is configured (phase set and depth) and how **PRD/plan** are framed (full vs. delta vs. feature).
- **State:** Store the selected intent in app state (and optionally in `.puppet-master/` for recovery). All downstream steps (Interview, start chain, orchestrator) receive intent so they can adapt.

### 2.1 Wizard State Shape

The app must hold a single, explicit **wizard state** that drives project setup, requirements, and downstream Interview/start chain. The struct below captures the core form/state fields; the normative runtime fields table that follows is also required.

**Rust struct (reference; implementation may use equivalent in app state):**

```rust
/// Intent as selected at flow start.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub enum WizardIntent {
    NewProject,
    ForkAndEvolve,
    EnhanceRewriteAdd,
    ContributePr,
}

/// Full wizard state: project setup + requirements + fork/PR metadata.
#[derive(Clone, Debug, Default, Serialize, Deserialize)]
pub struct ChainWizardState {
    // --- Intent and flow ---
    pub intent: Option<WizardIntent>,
    pub wizard_step: u32,  // 0 = project setup, 1 = requirements, 2 = interview, etc.

    // --- Project path (all intents) ---
    /// Working directory: new dir to create, or existing project path.
    pub project_path: Option<PathBuf>,

    // --- New project only ---
    /// If true, we will create a GitHub repo (name required).
    pub create_github_repo: bool,
    /// Repo name when create_github_repo is true.
    pub repo_name: Option<String>,
    /// Visibility: "public" | "private".
    pub repo_visibility: Option<String>,
    pub repo_description: Option<String>,
    pub repo_gitignore_template: Option<String>,
    pub repo_license: Option<String>,
    /// Default branch name for new repo (e.g. "main").
    pub repo_default_branch: Option<String>,

    // --- Fork & evolve / Contribute (PR) ---
    /// Upstream repo: URL or "owner/repo".
    pub upstream_url: Option<String>,
    /// If true, app created the fork via GitHub HTTPS API; else user provided fork.
    pub fork_created_by_app: bool,
    /// Clone URL or path of the fork after creation or user input.
    pub fork_url_or_path: Option<String>,

    // --- Contribute (PR) only: feature branch ---
    /// Feature branch name (e.g. feature/add-x). Work is done on this branch in the main clone.
    pub branch_name: Option<String>,

    // --- Requirements (all intents) ---
    /// Ordered list of uploaded file paths (under .puppet-master/requirements/uploaded/).
    pub uploaded_requirements_paths: Vec<PathBuf>,
    /// True if user has used Requirements Doc Builder and we have builder output.
    pub builder_used: bool,
    /// Single canonical path: merged result. Interview and start chain read only this.
    pub canonical_requirements_path: Option<PathBuf>,

    // --- Recovery / persistence ---
    /// Timestamp or session id for recovery correlation (optional).
    pub last_updated: Option<String>,
}
```

**JSON equivalent (for .puppet-master/ persistence and redb):**

```json
{
  "intent": "NewProject | ForkAndEvolve | EnhanceRewriteAdd | ContributePr",
  "wizard_step": 0,
  "project_path": "/absolute/or/relative/path",
  "create_github_repo": false,
  "repo_name": null,
  "repo_visibility": "public",
  "repo_description": null,
  "repo_gitignore_template": null,
  "repo_license": null,
  "repo_default_branch": "main",
  "upstream_url": null,
  "fork_created_by_app": false,
  "fork_url_or_path": null,
  "branch_name": null,
  "uploaded_requirements_paths": [],
  "builder_used": false,
  "canonical_requirements_path": null,
  "last_updated": "2026-02-22T12:00:00Z"
}
```

**Required runtime fields (normative, additive to the reference struct):**

| Field | Type | Purpose |
|---|---|---|
| `wizard_id` | string | Stable wizard instance ID used by recovery, Dashboard CtAs, and thread deep links. |
| `wizard_status` | enum | `setup | requirements | interview | validating | attention_required | ready_to_execute | complete | cancelled`. |
| `launch_source` | enum | `dashboard | file_menu | assistant | no_wizard_add_existing | no_wizard_new_local | no_wizard_new_github`. |
| `phase_override_mode` | enum | `selector_plan | run_all | manual_checklist`. |
| `phase_plan_ref` | path/null | Canonical persisted phase-plan location used by resume and audit. |
| `has_gui` | bool/null | Interview-derived GUI flag that affects Product/UX coverage and downstream artifact generation. |
| `attention_required_report_path` | path/null | Latest blocking requirements-quality report when clarification is required. |
| `remote_repo_ref` | object/null | Credential-safe remote reference (`owner`, `repo`, `host`, `clone_transport`, `clone_url_redacted`) for GitHub/fork flows. |
| `deferred_wizard_payload_ref` | path/null | Preloaded payload created by no-wizard flows for `Run Chain Wizard later`. |

**Field usage by intent:**

| Field | New project | Fork & evolve | Enhance/rewrite/add | Contribute (PR) |
|-------|-------------|---------------|---------------------|-----------------|
| intent | ✓ | ✓ | ✓ | ✓ |
| wizard_step | ✓ | ✓ | ✓ | ✓ |
| project_path | ✓ (new or empty) | ✓ (fork clone path) | ✓ (existing dir) | ✓ (fork clone path) |
| create_github_repo, repo_* | ✓ if creating repo | -- | -- | -- |
| upstream_url | -- | ✓ | -- | ✓ |
| fork_created_by_app, fork_url_or_path | -- | ✓ | -- | ✓ |
| branch_name | -- | -- | -- | ✓ |
| uploaded_requirements_paths, builder_used, canonical_requirements_path | ✓ | ✓ | ✓ | ✓ |

**Where state is stored:**

- **App state (in memory / GUI state):** Full `ChainWizardState` so the wizard and downstream steps (Interview, start chain) can read and update it.
- **.puppet-master/ for recovery:** Persist the same shape under a single file, e.g. `.puppet-master/wizard-state.json` (or key in redb). On launch or restore, load this file so that after a crash or restart the user returns to the correct intent, step, project path, upstream, fork and branch info, and canonical requirements path. Recovery snapshot (newfeatures.md §4) should include or reference this state so that "current view and wizard step" restoration is consistent.

**Invariants:**

- `canonical_requirements_path` is set only after at least one of: uploads (merged) or Builder output (or both merged). For user-project execution, it points to `.puppet-master/project/requirements.md` after canonical promotion from staging (see §4 and §11).
- For Contribute (PR), `branch_name` is set when the user (or app) creates the feature branch; all work for that flow happens on that branch in the **main clone** (no tier worktrees -- see §7).
- Secrets or credential-bearing GitHub URLs MUST NOT be persisted in wizard state; store redacted remote metadata + credential-store account refs only.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, PolicyRule:no_secrets_in_storage, ContractName:Plans/GitHub_Integration.md

### 2.2 Downstream Handoff Contract

Wizard hands a single normalized payload to Builder handoff, Interview initialization, and start-chain kickoff.

Required fields:
- `wizard_id`
- `intent`
- `wizard_status`
- `launch_source`
- `project_path`
- `canonical_requirements_path`
- `remote_repo_ref` (when Git/GitHub is involved)
- `branch_name` (Contribute PR only)
- `phase_plan_ref` and `phase_override_mode`
- `has_gui` when already known
- `resume_checkpoint_ref` when resuming an interrupted run

Rules:
- Builder may read/write requirements-stage fields only; it must not mutate GitHub setup fields except via explicit wizard actions.
- Interview consumes the payload as read-mostly input and persists Interview-owned state separately.
- Start chain MUST read the post-validation canonical `.puppet-master/project/**` package, not wizard staging inputs.
- No-wizard flows populate the same payload shape via `deferred_wizard_payload_ref`; opening the wizard later must be reconstructible after restart.

ContractRef: ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/interview-subagent-integration.md, Primitive:SessionStore

---

