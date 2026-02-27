## 13. No-Wizard Project Management Flows

Full specification for these flows is in `Plans/GitHub_Integration.md §D`. This section provides the chain-wizard-flexibility cross-reference and entry-point wiring.

ContractRef: Plans/GitHub_Integration.md §D, Plans/DRY_Rules.md, Plans/Decision_Policy.md

### 13.1 Overview

Three project management flows are available that do **not** require the Chain Wizard. Users can reach them from the File menu → "Project" or from the Dashboard. All three flows surface a "Run Chain Wizard later" affordance on their finish screen, pre-loading the wizard with the newly added/created project context.

| Flow | Entry point | Git repo | GitHub API required |
|------|------------|----------|-------------------|
| Add Existing Project | File → Add Existing Project | Optional (auto-detected) | Optional (link only) |
| Create New Local Project | File → New Project → Local Only | Optional (default: on) | No |
| Create New GitHub Repo + Project | File → New Project → On GitHub | Created on GitHub | Yes (device-code) |

### 13.2 Add Existing Project (no wizard)

- Entry: File menu → "Add Existing Project" OR Dashboard → "Add Project"
- User selects a local folder (native OS picker) OR picks an SSH remote + path
- Puppet Master auto-detects: git repo presence, language/framework, suggested project name
- Optional: "Link to GitHub" (device-code auth if needed)
- Finish: project opens in File Manager + editor; "Run Chain Wizard later" button
- Full spec: Plans/GitHub_Integration.md §D.1

ContractRef: Plans/GitHub_Integration.md §D.1, Plans/GitHub_API_Auth_and_Flows.md

### 13.3 Create New Local Project (no wizard)

- Entry: File menu → "New Project" → "Local Only" OR Dashboard → "New Project"
- Inputs: project name, parent folder, git-init toggle (default on), optional language/framework preset
- Finish: project created and opened; "Run Chain Wizard later" button
- Full spec: Plans/GitHub_Integration.md §D.2

ContractRef: Plans/GitHub_Integration.md §D.2

### 13.4 Create New GitHub Repo + Project (no wizard)

- Entry: File menu → "New Project" → "On GitHub" OR Dashboard → "New Project" → "On GitHub"
- Requires `github_api` auth (device-code launched inline if not yet authed)
- Inputs: repo name, description, visibility (default Private), README/gitignore/license toggles, local clone path
- Puppet Master creates GitHub repo via API and clones locally
- Finish: project added and opened; "Run Chain Wizard later" button
- Full spec: Plans/GitHub_Integration.md §D.3

ContractRef: Plans/GitHub_Integration.md §D.3, Plans/GitHub_API_Auth_and_Flows.md

### 13.5 "Run Chain Wizard Later" Affordance

All three flows show a "Run Chain Wizard" button on their finish screen. Clicking it:
- Navigates to the Chain Wizard / Interview flow
- Pre-fills project context (name, path, language, GitHub remote if linked)
- User can proceed through all wizard phases or skip any optional phase

This satisfies the requirement that no wizard step is mandatory for basic project setup. The wizard remains the recommended path for AI-assisted requirements gathering; it is not the only path.

ContractRef: Plans/chain-wizard-flexibility.md §1 (intent-based workflows), Plans/GitHub_Integration.md §D

---

