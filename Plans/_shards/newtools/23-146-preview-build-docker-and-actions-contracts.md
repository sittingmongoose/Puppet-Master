## 14.6 Preview, Build, Docker, and Actions Contracts

This section defines deterministic Slint-rebuild behavior for Preview/Build actions and their Docker/GitHub Actions integrations.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md#7.2, ContractName:Plans/Project_Output_Artifacts.md

### 14.6.1 Preview controls contract (Dashboard + Orchestrator)

**Required UX surfaces:**
- Dashboard Orchestrator Status card includes `PREVIEW`.
- Orchestrator Progress tab `widget.orchestrator_status` includes `Preview`.

**Deterministic behavior:**
1. Resolve preview target from selected stack and `visual_targets` in run config.
2. Launch one preview session per action press with generated `preview_session_id`.
3. Emit session events and evidence (`manifest.json`, `timeline.jsonl`, screenshot/video when available).
4. Show inline chat evidence card for latest preview state and media.
5. If media cannot be rendered inline, show deterministic fallback with clickable artifact path.

**Reserved UI command IDs (canonical):**
- `cmd.orchestrator.preview_open`
- `cmd.orchestrator.preview_stop`
- `cmd.orchestrator.open_preview_artifact`

ContractRef: UICommand:cmd.orchestrator.preview_open, UICommand:cmd.orchestrator.preview_stop, UICommand:cmd.orchestrator.open_preview_artifact, SchemaID:evidence.schema.json

### 14.6.2 Build controls and artifact reporting contract

**Required UX surfaces:**
- Dashboard Orchestrator Status card includes `BUILD`.
- Orchestrator Progress tab `widget.orchestrator_status` includes `Build`.

**Deterministic behavior:**
1. Build action resolves profile (`native`, `web`, `mobile`, `container`) from project stack + settings.
2. Build runs produce a normalized `build_result` payload with:
   - `build_id`
   - `build_profile`
   - `status`
   - `artifacts[]` (`path`, `kind`, `sha256`, `size_bytes`)
   - `logs_path`
3. GUI shows latest artifact list and "open path / copy path" action.
4. Chat shows concise build summary plus artifact links.

**Canonical output-path examples to preserve in docs/UI copy:**
- Linux installer outputs under `installer/linux/` (existing script contract).
- Multi-platform installer helper reports concrete installer paths per platform.

**Reserved UI command IDs (canonical):**
- `cmd.orchestrator.build_run`
- `cmd.orchestrator.open_build_artifact`

ContractRef: UICommand:cmd.orchestrator.build_run, UICommand:cmd.orchestrator.open_build_artifact, ContractName:Plans/Project_Output_Artifacts.md, ContractName:Plans/UI_Command_Catalog.md

### 14.7 Docker runtime + DockerHub contract

Docker support is expressed through the Docker Manager surface.

Required Docker Manager contract coverage:
- containers, images, compose, registries, build/bake, Publish / Unraid, and project-focused Kubernetes
- Docker as default runtime mode, Podman as alternate runtime mode inside the same surface
- requested vs effective auth capability disclosure for Docker Hub
- protected missing-repository creation and publish-side-effect separation

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Permissions_System.md

Doctor / preflight rules remain canonical here:
- `doctor.docker.engine`
- `doctor.docker.compose`
- `doctor.docker.buildx`
- `doctor.dockerhub.auth.capability`
- `doctor.dockerhub.repo.access`
- Kubernetes-specific runtime checks when Kubernetes subview actions are invoked

`doctor.registry.auth` is a deprecated alias for DockerHub-specific flows and MUST NOT remain the visible canonical term in surface docs.

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/storage-plan.md

Result payload minima remain authoritative here and must be reused by other docs:
- `docker_auth_result`
- `docker_publish_result`
- `unraid_template_result`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 14.8 GitHub Actions settings + generation contract

GitHub Actions generation and readiness must align with the live GitHub Actions surface.

Required Settings > Advanced coverage:
- workflow template selection
- trigger and matrix controls
- required-secrets readiness checklist
- preview/apply generation flow

Required GitHub Actions surface alignment:
- generated workflows are visible from the `Workflows` subview
- current-branch run behavior and workflow dispatch use the same repository and branch context
- admin readiness for secrets, variables, and environments reuses the same capability/auth model as the live GitHub Actions Settings subview
- `doctor.actions.workflow-ready` remains the canonical readiness gate for workflow generation/apply flows

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md

### 14.9 Automation migration contract (Iced-era tool to Slint-era tooling)

The existing Iced automation implementation remains a reference pattern, while rewrite deliverables target Slint runtime semantics.

**Required migration boundaries:**
- Keep evidence schema compatibility (`manifest/timeline/media`) across automation backends.
- Introduce backend abstraction so preview/build automation can run with Slint UI surfaces.
- Keep headless and visible modes both supported in the new backend.
- Preserve doctor/preflight checks for automation dependencies and media capture capability.

ContractRef: ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/FinalGUISpec.md#2, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:evidence.schema.json

### 14.10 Doctor and preflight matrix

The Slint rebuild must expose deterministic readiness checks before Preview/Build/Docker/Actions flows execute.

| Check ID | Scope | Required signal | Failure behavior |
|---|---|---|---|
| `doctor.preview.visual-runtime` | preview | Display/runtime dependency available for selected mode (`visible` vs `headless`) | Block preview start; show explicit missing dependency and fallback option |
| `doctor.mobile.ios-simulator` | mobile iOS | Simulator toolchain reachable (`xcodebuild`, `simctl`) | Mark iOS preview/test path unavailable; suggest fallback target |
| `doctor.mobile.android-emulator` | mobile Android | Emulator/ADB reachable | Mark Android preview/test path unavailable; suggest fallback target |
| `doctor.docker.engine` | docker local | Docker daemon reachable and responsive | Block docker preview/build path; show remediation steps |
| `doctor.docker.compose` | docker local | Compose config resolves and service graph validates | Block compose launch; show config error details |
| `doctor.registry.auth` | docker publish | Registry auth validated for selected provider (`dockerhub` default) | Block publish; preserve local build results |
| `doctor.actions.workflow-ready` | GitHub Actions | Workflow template validates and required secrets are declared | Block workflow apply; show missing/invalid fields |
| `doctor.evidence.media` | evidence/chat | Manifest + media artifacts are readable and hash-valid | Keep run result, mark evidence degraded with explicit fallback message |
| `doctor.mcp.context7` | MCP / docs | Context7 enablement is on and a usable key resolves from env or credential store; server can list tools | Keep run usable, but mark Context7-backed tools unavailable and surface remediation |
| `doctor.mcp.provider-ready` | MCP / provider bridge | For each selected provider, MCP bridge/adapters are present and the configured server set exposes the expected tool names | Mark MCP-backed tools unavailable for that provider; do not silently advertise missing tools |
| `doctor.websearch.cited` | cited web search | `websearch_cited` result contract passes a dry-run/provider health check for the configured provider order | Keep run usable, but disable cited web search with explicit config/auth/timeout reason |
| `doctor.gui.custom-headless` | custom GUI tool | When `plan_custom_headless_tool = true`, configured tool path exists, is executable, and produces canonical evidence layout | Mark custom headless path unavailable and point to config/evidence contract remediation |
| `doctor.gui_tool_catalog.freshness` | framework tool catalog | Base catalog version plus overlay `last_updated` metadata are present and readable | Keep run usable, but warn that tool recommendations may be stale and show the recorded snapshot date |

ContractRef: ContractName:Plans/MiscPlan.md#doctor, ContractName:Plans/FinalGUISpec.md#74-settings-unified, ContractName:Plans/newtools.md#13-evidence-in-chat-contract-and-flow-research-evidence-media-chat, SchemaID:evidence.schema.json

