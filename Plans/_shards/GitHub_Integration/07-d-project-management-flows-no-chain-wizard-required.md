## D. Project Management Flows (No Chain Wizard Required)

All three flows below MUST:

(a) Not require the Chain Wizard to complete.
(b) Offer a `Run Chain Wizard later` button on the finish screen that links to the Chain
    Wizard with the new project context pre-loaded.
(c) Provide full error handling — no dead ends; every error state has a resolution action.
(d) Be accessible from both the app's main **File** menu and the **Dashboard**.

ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

---

### D.1 Add Existing Project

**Entry points:**
- File menu → `Add Existing Project`
- Dashboard → `Add Project` button

ContractRef: UICommand:cmd.project.add_existing, Invariant:INV-011

**Steps (sequential; no branching ambiguity):**

**Step 1 — Select folder:**

- Option A: native OS folder picker (for local projects).
  ContractRef: PolicyRule:Decision_Policy.md§2
- Option B: `From SSH Remote` — user selects a saved SSH target (§C.2) and enters or
  browses to the remote path. Requires at least one saved SSH remote; if none exist, show
  `No SSH remotes configured — Add one in Settings → SSH Remotes` with a direct link.
  ContractRef: UICommand:cmd.ssh.remote_add, PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Step 2 — Detect:**

Puppet Master MUST automatically detect:

- Presence of `.git` directory (git repo vs. plain folder).
  ContractRef: ContractName:Plans/WorktreeGitImprovement.md
- Language/framework via file heuristics (deterministic priority order):

  | File present | Detected language |
  |---|---|
  | `Cargo.toml` | Rust |
  | `package.json` | Node.js |
  | `pyproject.toml` / `setup.py` / `requirements.txt` | Python |
  | `go.mod` | Go |
  | `pom.xml` / `build.gradle` | Java/JVM |
  | `*.csproj` / `*.sln` | C# / .NET |
  | *(none matched)* | `Unknown` |

  ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/FileManager.md#11

**Step 3 — Review:**

Show detected info as an editable summary:

- Repository remote URL (if any; read-only display).
- Current branch (if git repo).
- Detected language (read-only display).
- **Project name** (text field; pre-filled from folder basename; user-editable; validated:
  non-empty, no special chars, not a duplicate in the project list).
  ContractRef: PolicyRule:Decision_Policy.md§2

**Step 4 — GitHub link (optional):**

If the project has a GitHub remote (`origin` URL contains `github.com`), Puppet Master
MUST offer: `Link to GitHub — authorize Puppet Master to access this repo's GitHub
features (PR, Issues, Actions)`. User may skip.

ContractRef: PolicyRule:Decision_Policy.md§2

If the user accepts and is not yet authenticated in realm `github_api`, the device-code
flow MUST launch inline (no modal). Canonical auth flow: `Plans/GitHub_API_Auth_and_Flows.md`.

ContractRef: UICommand:cmd.github.connect, ContractName:Plans/GitHub_API_Auth_and_Flows.md

**Step 5 — Finish:**

- Project is added to the project list and immediately opened in the File Manager and
  editor.
  ContractRef: UICommand:cmd.project.open, ContractName:Plans/FileManager.md
- Finish screen MUST display a `Run Chain Wizard later` button.
  ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**Error states (exhaustive):**

| Error | Display | Action(s) |
|---|---|---|
| Folder not readable | `Cannot access folder: <reason>` | `Choose different folder`, `Cancel` |
| Folder has no git repo | `No Git repository found — add as plain folder?` | `Add as plain folder`, `Cancel` |
| Duplicate project name | `A project named "<name>" already exists — choose another name` | Back to Step 3 |
| SSH remote unreachable | `SSH remote unreachable — <host>: <reason>` | `Retry`, `Choose different remote`, `Cancel` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### D.2 Create New Local Project

**Entry points:**
- File menu → `New Project` → `Local Only`
- Dashboard → `New Project` button

ContractRef: UICommand:cmd.project.new_local, Invariant:INV-011

**Steps (sequential):**

**Step 1 — Project name:**

Text input (required). Validation rules (checked live on input):

- MUST NOT be empty.
- MUST NOT contain: `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`.
- MUST NOT duplicate an existing project name (case-insensitive).
- If valid: green ✓ indicator. If invalid: red ✕ with inline error text.

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

**Step 2 — Location:**

OS folder picker for the parent directory. Puppet Master MUST create a subdirectory
`<parent>/<project_name>/` on finish. Preview of the full path MUST be shown below the
picker as the user types the project name.

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 3 — Initialize git:**

Toggle labeled `Initialize Git repository` (default: **on**). When on: `git init` and an
initial commit (`Initial commit` message, empty except for `.gitignore` if a preset is
selected) are run on finish.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/WorktreeGitImprovement.md

**Step 4 — Language/framework preset (optional):**

Dropdown of supported presets (same list as `Plans/FileManager.md §11`). Selecting a
preset may prompt a tool download on project open (non-blocking; download in background).
Default selection: `None`.

ContractRef: PolicyRule:Decision_Policy.md§2, ContractName:Plans/FileManager.md#11

**Step 5 — Finish:**

- Project directory created; `git init` and initial commit run (if toggle on).
- Project opened in File Manager and editor.
- Finish screen MUST display a `Run Chain Wizard later` button.
  ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**Error states (exhaustive):**

| Error | Display | Action(s) |
|---|---|---|
| Folder already exists | `Folder "<path>" already exists — use existing folder or choose a different name?` | `Use existing folder`, `Choose different name`, `Cancel` |
| Cannot create directory | `Failed to create project folder: <reason>` | `Retry`, `Cancel` |
| git init failed | `Git initialization failed: <reason> — continue without Git?` | `Continue without Git`, `Cancel` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003

---

### D.3 Create New GitHub Repo + Project

**Entry points:**
- File menu → `New Project` → `New GitHub Repo`
- Dashboard → `New Project` → `On GitHub`

ContractRef: UICommand:cmd.project.new_github_repo, Invariant:INV-011

**Prerequisite:** `github_api` realm auth. If not authenticated, Step 1 triggers the
inline auth widget before presenting the form.

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, SchemaID:Spec_Lock.json#auth_model

**Steps (sequential):**

**Step 1 — Auth check:**

If the user is not authenticated in realm `github_api`, Puppet Master MUST show an inline
`GitHub sign-in required` widget using the device-code flow
(`UICommand:cmd.github.connect`). The form fields for Step 2 MUST NOT be shown until auth
is confirmed. If the user cancels auth, the entire flow exits with `Cancel`.

ContractRef: UICommand:cmd.github.connect, ContractName:Plans/GitHub_API_Auth_and_Flows.md, PolicyRule:Decision_Policy.md§2

**Step 2 — Repo settings:**

| Field | Type | Required | Validation | Default |
|---|---|---|---|---|
| Repository name | text | Yes | GitHub naming rules: alphanumeric, `-`, `_`; max 100 chars; no spaces | *(none)* |
| Description | text | No | Max 255 chars | *(empty)* |
| Visibility | select | Yes | `Public` or `Private` | `Private` |
| Initialize with README | toggle | — | — | On |
| .gitignore template | select | No | List from GitHub API `GET /gitignore/templates` | *(None)* |
| License | select | No | List from GitHub API `GET /licenses` | *(None)* |

ContractRef: SchemaID:Spec_Lock.json#github_operations, PolicyRule:Decision_Policy.md§2

**Step 3 — Local clone location:**

OS folder picker for where to clone the new repository locally.

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 4 — Preview:**

Show summary of all selections before creating. No action is taken on the remote until
the user confirms.

ContractRef: PolicyRule:Decision_Policy.md§2

**Step 5 — Create:**

1. POST to `POST /user/repos` with the settings from Step 2.
   ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md#C, SchemaID:Spec_Lock.json#github_operations
2. On success, run `git clone <clone_url> <local_path>` using the local `git` binary.
   ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, Primitive:PatchPipeline

**Step 6 — Finish:**

- Project added to project list; opened in File Manager and editor.
- Finish screen MUST display a `Run Chain Wizard later` button.
  ContractRef: ContractName:Plans/chain-wizard-flexibility.md, PolicyRule:Decision_Policy.md§2

**Error states (exhaustive):**

| Error | Display | Action(s) |
|---|---|---|
| Repo name already taken on GitHub | `Repository name "<name>" is already taken on GitHub — choose another` | Back to Step 2 |
| API auth failed mid-flow | `GitHub authentication failed — sign in again` | Back to Step 1 |
| Clone failed | `Clone failed: <reason>` | `Retry clone`, `Open folder anyway` (without git), `Cancel` |
| API error (non-name-conflict) | `GitHub API error: <status> — <message>` | `Retry`, `Cancel` |
| Local clone path not writable | `Cannot write to <path>: <reason>` | `Choose different location`, `Cancel` |

ContractRef: PolicyRule:Decision_Policy.md§2, Invariant:INV-003, ContractName:Plans/GitHub_API_Auth_and_Flows.md

---

