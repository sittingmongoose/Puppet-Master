# Containers, Registry, and Unraid Integration


## Purpose and scope
This document makes Docker support first-class in the Puppet Master rewrite. The scope is broader than the current runtime/build defaults: Puppet Master must be able to build container images, run them for preview/testing, let the user open the running container when the project supports user-facing access, publish images to DockerHub, generate and maintain Unraid template XML, and manage the related Unraid template repository workflow.

This plan is the canonical SSOT for:
- DockerHub authentication UX and state modeling.
- Requested vs effective Docker auth capability.
- DockerHub namespace and repository discovery/selection/creation behavior.
- Protected repository-creation rules.
- First-class Docker management GUI behavior.
- Unraid template generation defaults and managed template-repository workflow.
- `ca_profile.xml` defaults, scope, editability, and image handling.

This plan does not replace the existing preview/build/runtime sections in `Plans/newtools.md`, the settings UI in `Plans/FinalGUISpec.md`, or the orchestrator control surface in `Plans/Orchestrator_Page.md`; it supplies the canonical detailed contract those docs must reference.

## Relationship to existing plans


- `Plans/newtools.md` remains canonical for runtime/tool/preflight/evidence behavior, but must reference this plan for DockerHub browser auth, repository management, and Unraid template publishing.
- `Plans/FinalGUISpec.md` remains canonical for settings, controls, dialogs, and layout, but must reference this plan for Docker Manage surface requirements.
- `Plans/Orchestrator_Page.md` remains canonical for orchestrator control widgets and UICommand IDs, but must reference this plan for container-publish and template-repo actions.
- `Plans/feature-list.md` and `Plans/GUI_Rebuild_Requirements_Checklist.md` must register the new first-class GUI/runtime scope introduced here.

## Product goals
- Make Docker support a first-class workflow rather than a small extension of generic Preview/Build.
- Let the user authenticate to DockerHub using either browser-based login or a PAT, with explicit visibility into what capability is actually available.
- Let Puppet Master build and run containers for testing and user inspection from within the app.
- Let Puppet Master publish to DockerHub and safely create the missing repository when necessary.
- Let Puppet Master automatically generate/update Unraid XML after successful image publishing by default.
- Let Puppet Master manage a dedicated Unraid template repository by default, while allowing the user to disable managed template-repo handling.
- Keep secrets out of redb, project files, and evidence logs.
- Keep the GUI contextual so Docker-heavy controls appear when relevant without permanently cluttering non-container projects.

## User-visible surfaces


### 1. Settings > Advanced > Containers & Registry


The existing `Containers & Registry` settings area remains the primary configuration home, but it must be expanded to include:

- **Docker runtime controls**
  - runtime selector (`docker` default)
  - Docker binary path override
  - compose file/path defaults
  - compose project-name strategy (`auto`, `fixed`, `hash-based`)
  - build context path
  - Dockerfile path
  - target stage (optional)
  - target platforms and Buildx readiness status

- **DockerHub authentication controls**
  - browser-login button that opens the browser/device flow
  - PAT entry field
  - helper text that explicitly says PAT is recommended
  - inline guidance/link telling the user how to obtain a PAT
  - stored-auth status
  - account/namespace summary
  - validation button
  - clear/remove credentials action
  - validate and `/clear` auth actions for DockerHub credentials
  - requested auth mode vs effective capability display

- **DockerHub repository controls**
  - namespace selector/discovery
  - repository selector/discovery
  - refresh repositories action
  - create repository action
  - create-repository toggle in settings-level configuration, kept distinct from the mandatory confirmation used when creation becomes a remote side effect
  - repository privacy control for creation flow
  - tag template defaults (`{commit}`, `{version}`, `{timestamp}` plus any future canonical tag variables)
  - push policy (`manual` default; optional `after_build`)

- **Unraid publishing controls**
  - `Generate/Update Unraid XML after successful publish` toggle (default: enabled)
  - `Manage Unraid template repository` toggle (default: enabled)
  - template repository path/remote settings
  - template repository setup flow (create-new or select-existing)
  - auto-push toggle (default: disabled)
  - one-click push action surfaced nearby even when auto-push is off
  - template repo status row (configured / missing / dirty / committed / ready-to-push)

- **Docker Manager visibility controls**
  - setting named exactly `Hide Docker Manager when not used in Project.`
  - legacy setting alias `Hide Docker Manage when not used in Project.` migrates to the canonical Docker Manager label and is not a separate surface
  - default: enabled
  - behavior: when enabled, the contextual Docker Manager surface appears only when a Docker-related project is active; when disabled, the user may keep the Docker Manager surface available more broadly

- **Maintainer profile / `ca_profile.xml` controls**
  - scope selector: shared cross-project profile (default) vs per-project override
  - full edit form for all `ca_profile.xml` fields
  - profile image handling through upload/select or external URL
  - notice when the file was auto-generated and still needs review/configuration

### 2. Contextual Docker Manager surface

The canonical user-facing surface is **Docker Manager**.

Docker Manager is a first-class operational surface for containerized projects. It replaces `Docker Manage` as the canonical surface name and subsumes Publish / Unraid behavior.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/newtools.md

Required stable subviews:
- `Containers`
- `Images`
- `Compose`
- `Registries`
- `Registries / Docker Hub`
- `Build / Bake`
- `Publish / Unraid`
- `Publishing / Unraid` as a legacy/source-lineage alias normalized to `Publish / Unraid`
- advanced foldouts for `Networks`, `Volumes`, and `Contexts`
- project-focused `Kubernetes`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Orchestrator_Page.md

Surface rules:
- Docker is the default visible runtime mode when the project is Docker-related.
- Podman is an alternate runtime inside the same surface, not a separate panel.
- Kubernetes is a Docker Manager subview when manifests, Helm artifacts, kube-linked state, or explicit enablement are present.
- Unraid is integrated under `Publish / Unraid`; it does not require a separate top-level panel.
- Docker Hub is one registry/provider capability inside Docker Manager, and Docker Manager must not split build, bake, compose, run, inspect, logs, publish, pull, `Registries / Docker Hub`, or `Publishing / Unraid` into unrelated mini-surfaces.
- Docker Manager is a first-class side-panel surface, not only Settings > Advanced. Its canonical surface includes settings-level DockerHub actions such as the create-repository toggle and `/clear` auth recovery, while remote repository creation still requires the separate protected confirmation flow.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Permissions_System.md

Subview behavior minima:
- `Containers`: lifecycle, logs, inspect, attach/shell, stats, open app when an access URL exists
- `Images`: build, pull, push, tag, inspect, remove, prune, digest/tag visibility
- `Compose`: project/group lifecycle, service subsets, logs, restart, down/up, compose-group reopen state
- `Registries`: Docker Hub first, registry inventory/selection, reconnect, browse, pull, inspect
- `Build / Bake`: Dockerfile target selection, Buildx/Bake discovery, build-preview settings
- `Publish / Unraid`: `/auth/Unraid`, requested vs effective auth state, protected repo creation, digest receipts, Unraid generation and template-repo follow-on
- `Kubernetes`: apply, diff, rollout status, logs, exec, port-forward, workload/resource view, Helm basics, image-to-cluster linkage

Design-reference split: the user-specified `docker/vscode-extension` / `/vscode-extension` repository is Docker DX and is treated as a Dockerfile, Compose, Bake, build-debugging, and image-vulnerability-scanning reference. It is not the day-to-day container/registry management baseline. The richer management baseline is `microsoft/vscode-containers` / `/vscode-containers`: Docker Manager should preserve container list and lifecycle commands, image tag/pull/remove/prune operations, shell/attach/browse/stats/inspect affordances, network/volume/context explorers, compose group lifecycle controls including `/down/restart`, registry `/reconnect/disconnect`, and container `/stop/restart/remove/prune`, while keeping bake-oriented authoring and execution inside `Build / Bake`.

ContractRef: ContractName:Plans/newtools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### 2A. Docker Manager operational cockpit contracts

Docker Manager is the GUI owner for the unified asset explorer. Its root view keeps stable subviews for `/images/compose/registries/build-bake`, with advanced foldouts for contexts, networks, volumes, and project-focused Kubernetes. The selected runtime, selected context, active subview, explorer grouping, `/sort`, hidden-foldout policy, hidden advanced foldouts, and exact asset row/subview are persisted as per-project panel state so preview, `/build/publish/deploy`, and blocked-card flows reopen the exact relevant row instead of landing in a generic push-only pane. If runtime access is unavailable, Docker Manager still renders cached `/last-known` state with a stale marker and read-only posture; strong default filtering and project awareness are mandatory so the broad surface does not become overloaded, while project-aware ordering pushes `likely-relevant` assets to the top without hiding the rest. Unsupported runtime-specific subviews hide only when truly unavailable; otherwise they stay visible with a disabled reason. The command and event model covers full `cmd.docker.container.*`, `image.*`, `registry.*`, `network.*`, `volume.*`, `context.*`, `compose.*`, and `k8s.*` families, with receipts able to open directly to the affected asset kind. `/events/storage` and `/event/storage` for the explorer record panel state, selected asset identity, and freshness only; transient runtime observations stay in the runtime projection store.

Project-aware build surfaces infer the likely Dockerfile, build context, compose file, Bake target, `bake-target`, platform, and runtime context for the active project. The `Build / Bake` subview and smart CTA cards in `Containers` or `Publish / Unraid` expose `cmd.docker.build.*`, `cmd.docker.bake`, `cmd.docker.bake.*`, and build/bake preview commands; persist the last successful build target, validation snapshot, preferred build mode, default build mode, target stage/platform, preferred compose file, buildx readiness, runtime override, inferred target overrides, explicit target override, and the `show advanced args toggle`. Bake definitions can come from HCL, YAML, JSON, Compose, or generated metadata, but `build_run` and `/push_image` resolve back to the same selected `/compose/bake` target rather than rebuilding from a guessed default. If inference is ambiguous in a polyglot or monorepo project, Docker Manager prompts for explicit selection instead of guessing. `/event/storage` records build target selection and readiness/preflight events, while Orchestrator build artifacts and preview containers link back to the originating run/tier. `/tradeoffs`: auto-detection heuristics can misidentify monorepo targets, so inferred build defaults must stay reviewable and overrideable.

Compose scenario runner lets users save and rerun named service subsets, profiles, env file combinations, and port mappings for preview, test, or `/development` workflows. The `Compose` subview owns scenario definitions, selected services, `/profiles/env` files, `/profile/env-file/port` state, detached and `/log-follow` defaults, `/ports`, and validation state. Command coverage includes `cmd.docker.compose.up_subset`, `down_subset`, `save_scenario`, `run_scenario`, and the grouped command family `cmd.docker.compose.scenario.save/run/edit/delete`, with `cmd.docker.compose.scenario.save` as the save command id. Scenario lists live in project state; preview and test tiers record which scenario launched them. If a compose file changes incompatibly, the scenario is marked stale and opens degraded with validation errors plus repair actions instead of silently failing. `/tradeoffs`: scenarios can drift quickly if service names or profiles change, and scenario schema drift as compose files evolve is expected, so stale markers and repair flow are mandatory. The `/run/edit/delete` affordances stay disabled with exact reason codes until validation succeeds.

Registry promotion flow treats `/tag/push` and `/push/promote` as explicit release actions, not ad hoc retagging. Docker Manager preserves source artifact identity, promotion `/target`, destination registry allowlist, default namespace/repository/tag template, promotion policy, visibility/privacy defaults, `/immutability` expectations, Docker-Hub-first `MVP` behavior, and the abstraction needed for later registry `APIs`. Promotion receipts are `registry-side` remote side effects with digest-first lineage: the moved digest, tag, source namespace/repository, destination namespace/repository, actor, approval source, and result id are captured before any downstream deployment reference is updated. If the destination registry or repository is unavailable, local image actions remain usable and the promotion is blocked with a precise remote blocker.

Publish chain view shows the path from local build result to pushed tag and `/digest`, Docker Hub repo state, Unraid/template follow-ons, `/publish/events`, and downstream deployment or `/workload` references. Each chain node records `build_result_id`, `publish_result_id`, template repository status, deployment/workload refs, result state, expanded chain nodes, an `include historical publishes` toggle, whether to follow latest publish by default, and whether it is `not-attempted`, blocked, failed, or complete. Publish-capable runs expose this chain from run history and blocked cards. Missing downstream steps render a partial chain with `missing-link` explanations; digest-first identity is mandatory so retags do not corrupt lineage. Chain stitching must survive retries and partial reruns, and follow-ons plus auto-open behavior must open the exact broken chain step rather than a generic `Publish / Unraid` page.

Container access intelligence detects usable URLs, health, logs, ports, shells, and stats for running previews and containers. `Containers` rows and detail drawers expose `cmd.docker.container.open`, `view_logs`, `attach_shell`, `stats`, and `inspect`; `Open running container` and `/open-container` resolve here only when a real container or preview session exists. URL/URLs discovery uses explicit overrides, preferred browser behavior, preferred port priority, labels, host-port mappings, and health signals; `port-open`, `auto-follow`, and `auto-open` are suggestions rather than silent actions. Shell actions honor the saved shell command preference instead of guessing an entry command. If the heuristic is uncertain, Docker Manager shows candidate actions or logs/inspect first. `/event/storage` records confidence, candidates, and manual override, but does not persist transient port discoveries as canonical state. `/tradeoffs`: false-positive URL inference is annoying and can mislead users, so confidence thresholds and manual override are required.

Drift detection compares local Dockerfile, `/compose/bake` intent, Kubernetes manifests, last build metadata, `last-published` metadata, and last deployed state. The `Build / Bake`, `Publish / Unraid`, and Kubernetes subviews expose drift warnings, compare actions, `/ignore-files`, `ignore-labels`, sensitivity settings, compare target, and non-secret validation snapshots. Receipts record what was compared, the source metadata refs, the resulting drift class, and whether the result is partial. If prior artifact metadata is missing, the state is `unknown` rather than clean; if image labels and source refs are inconsistent, Docker Manager must avoid `over-warn` behavior by showing the weak evidence behind the warning.

Cleanup advisor recommends safe `/prune` and remove actions for `/assets`, `Images`, `Containers`, `Volumes`, `Networks`, and maintenance views, including Docker Manager advanced maintenance placement plus Settings/Health hooks. It starts with dry-run analysis, scan/prune estimation commands, projected disk savings, cached reclaim estimates, auto-scan cadence, disk-threshold warning levels, user-protected asset list, prune aggressiveness, whether to hide warnings for ephemeral previews, retention window, protected labels/assets, active previews, and recent receipt references. Long-running projects/runs may surface maintenance warnings without forcing cleanup mid-run. If the reference graph is partial, recommendations default conservative and never suggest deleting assets still tied to active previews or recent receipts. If the runtime cannot estimate reclaim safely, the advisor shows manual cleanup guidance instead of enabling destructive guesses. `/tradeoffs`: aggressive cleanup can destroy forensic context, break active previews, and reduce cached build speed, so Docker Manager stores preference defaults only and keeps destructive actions guarded by shared blocked-state rules.

Project-focused Kubernetes linkage keeps deploy and troubleshoot work in Docker Manager without turning Puppet Master into a general cluster admin console, cloud-provider console, or cluster-administration UX. The conditional `Kubernetes` subview preserves kubeconfig/context, namespace, `/namespace/workload` focus, log viewer defaults, auto-refresh and `/watch` toggles, Helm visibility, Helm release focus, persisted K8s focus state, and a `cluster-wide` resources toggle defaulted off. Command coverage is `cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace`, `cmd.docker.k8s.apply|diff|logs|exec|port_forward|set_context|set_namespace|helm_preview|helm_install`, `/logs/exec/port-forward/Helm/workload`, including the explicit command `cmd.docker.k8s.apply`; compatibility aliases from older `cmd.k8s.*` rows normalize to this Docker Manager namespace. Deploy, `/rollout/apply`, `/apply/rollout`, log, exec, `port_forward`, Helm, and `/troubleshoot` failures open directly to project-relevant workload status, logs, or diff. If `kubectl`, kubeconfig, or cluster access is missing, the subview remains visible with setup guidance and explicit `/connection` state instead of disappearing. Docker Manager's Kubernetes view defaults to the project-focused subset; full cluster inventory requires the explicit `cluster-wide` toggle and remains visually distinct from project scope. `/attempt/action` receipts are `collapse-by-default`; over-verbose logs stay behind detail expansion. `/tradeoffs`: visibility must stay project-centered, cluster-facing explorer scope must be intentionally constrained to project-relevant resources, and cluster-wide views default off.

Kubernetes operational sessions are ephemeral owner-surface sessions. `kubectl logs` can target pods, `/resources`, and all containers; rollout status is a first-class troubleshooting primitive; port-forward sessions and rollout monitors are restart/rebind workflows, not durable always-on connections. Browser handoff is reserved for external registry, admin, or `/admin/help` edge cases, not the default fallback for local-runtime or Kubernetes operations.

Operation receipts are the compact auditable record for important side effects across Orchestrator history/detail, Source Control commit/push, GitHub Actions run panes, Docker publish panes, registry promotion, and Kubernetes apply/rollout. They are compact UI objects derived from canonical run/publish/events, not ad hoc strings. Each receipt records requested action, effective action, actor, targets, result ids, allowed action ids, approval source, executing subsystem, and source event ids. Receipt verbosity and receipt retention preference are user-configurable, while receipts remain compact by default; legacy flows without rich receipts show a minimal evidence marker without inventing feature-local logs. `/events/storage` stores the receipt projection keyed by run, attempt, and action id.

Docker Manager route/open adoption follows the shared route contract instead of treating object-bearing shell commands as local layout state. `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`) may expose `cmd.source_control.select_worktree`, `cmd.chat.open_thread_usage`, `cmd.chat.focus_thread_usage`, and `/open` wrappers, but Docker Manager treats those as route-consuming actions when they carry object identity. The canonical `target_kind` enum remains in `Contracts_V0.md` and `Contracts_V0`; destination-local refinements stay outside the enum and outside the base route contract. `cmd.panel.switch` and panel-switch style commands may select the Docker Manager shell only as shell-state; contextual object refs such as `repo_id`, `worktree_id`, `workflow_run_id`, `publish_result_id`, and `k8s_ref` must route through the shared target contract rather than become a hidden panel-switch payload model.

Blocked-state integration, Requested vs effective state everywhere, and Explain this state use the shared runtime vocabulary. SCM, GitHub Actions, Docker, and Kubernetes panels mirror Orchestrator blocked views, destination-panel banners, inline disabled CTAs, `allowed_action_ids[]`, and blocked projections. Docker Manager `hard_gate` actions, including HITL-governed remote-side-effect publish, repository creation, registry promotion, and cluster mutation paths, enter the canonical approval or `/blocked` flow instead of bypassing it with generic UI confirmation. Disabled Docker, `/Unraid`, and Kubernetes mutation controls expose a short inline reason, a hover/focus tooltip with the exact blocking condition, and the primary recovery CTA when one exists; disabled controls remain keyboard-focusable where needed for explanation or `/accessibility`. Publish/deploy CTAs, auth rows, dispatch forms, worktree actions, and runtime actions show compact badges that expand on demand for the requested mode, effective capability, reason code, and last validation time; if effective state is unknown, the UI shows unknown with the next validation action instead of assuming failure. `Explain this state` appears on status pills, disabled buttons, blocked banners, and receipt rows; it supports ELI5 and expert-vs-expert-only raw detail, including `/provider/runtime` and `/blocked/diverged/degraded` reason chains. The explainer auto-open setting may open on first block, but the explanation text must derive from canonical reason codes and validation fields, not hard-coded panel text. `/tradeoffs`: panels must not add one-off local recovery actions that drift from the shared blocked contract.

Docker Manager action disclosure uses the shared confirmation taxonomy instead of local modal guesses. Action rows and blocked cards distinguish actions needing no confirmation, light confirmation, strong confirmation, non-bypassable/hard-gated `/hard-gated` approval, and actions that are logically undoable versus only compensatable by later retry or follow-up records.

Issue and annotation state stay separate from presentation controls. `FinalGUISpec.md` reinforces the asymmetry: durable delete, rollback, repository creation, permission preset replacement, registry publish, and Kubernetes mutation flows use the appropriate confirmation or canonical approval/blocked flow because they are side-effectful; dismissible banners are presentation-noise controls, not durable issue-state transitions. Annotation flow distinguishes runtime-progressed `addressed` state from user-controlled semantic closure such as `resolved`, so Docker, registry, and Kubernetes panels must not flatten these states into a single local status.

Kubernetes and publish governance outcomes remain exact because the remediation path changes by policy source. Docker Manager distinguishes RBAC denied, namespace disallowed, admission or policy denied, `/Gatekeeper/Kyverno/Pod` Security or image policy denied, quota or `/limit` policy denied, and `remote_mismatch`; each blocked state records the affected object/stage, requested operation, policy source when known, remediation CTA, and whether a review or approval route such as `/review/ruleset` exists. Multi-object flows such as Kubernetes apply, `compose-to-cluster`, and multi-step publish chains can be partial: receipts record which resources were accepted, which later resource was denied, which downstream deployment was blocked, and the exact policy-blocked object/stage instead of flattening the outcome to success or failure. If governance changes while a run is blocked waiting for approval, review, or ruleset change, resume must revalidate and reclassify before mutation; receipts keep original and current policy outcomes when they differ.

Governance snapshots are durable inputs to blocked-state explanation. Branch protection, GitHub `/ruleset`, protected environment, registry policy, destination-policy, and cluster policy evaluations capture a `policy_snapshot_ref` against the exact target ref/resource before mutation. Receipts and blocked episodes reference that snapshot so Orchestrator can explain the policy in force at attempt time, but retry/resume revalidates current policy instead of assuming the old snapshot remains valid.

Registry and tag governance use dedicated result classes instead of generic publish failure. Protected tags, registry-side immutable-tag or overwrite denial, `/push/promotion` blockers, `/rulesets`, and forbidden `latest` overwrite are recorded as destination-policy violations with namespace/repository/tag context, allowed namespace `/patterns`, visibility `/privacy` constraints, and recovery pivots such as retag or `/new-version`. `/receipts` record whether direct mutation was transformed into a governance-compliant fallback, left `/blocked`, or handed off to a required hosted flow.

Protected environments are long-lived gated-governance states, not transient runtime errors. Receipts retain environment name, protection types, pending reviewer set or `/count` when knowable, and wait-timer target timestamp. Orchestrator mirrors these gates with stable blocked cards until the hosted state changes or the user explicitly resumes after revalidation.

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Orchestrator_Page.md

### 2B. Repo, root, runtime identity, and degraded outcome scope

Docker/Kubernetes detection is repo-of-origin aware in multi-repo projects. Docker Manager visibility can be project-level when any repo is eligible, but the current subview, state, `/state/receipts`, and receipt payload disclose which repo or root they represent. Panel state is repo-bound with keys such as `{project_id, repo_id}` or `{project_id, workspace_root_id}`; restore validates that the selected repo/root still exists and downgrades to chooser state instead of silently rebinding. Imported, `/forked/nested`, or nested workspace roots create a distinct `workspace_root_id` and, when Git-backed, a distinct `repo_id`.

Repo-selection precedence is deterministic: direct receipt or `/deep-link` target wins; explicit panel repo selection wins next; active run/tier repo follows; active editor repo follows; otherwise the user sees a chooser. Panels disclose whether a repo is pinned or inferred. Hosted GitHub features use explicit remote binding fields (`owner`, `repo`, `remote_name`, `remote_url`) rather than `origin` assumptions. Docker and Kubernetes receipts distinguish manifest-source repo from image-source repo when they differ, and `k8s_workload_ref` carries `repo_id` or source workspace root alongside project_id.

Docker Manager deep-link handling must not expose raw local IDs as the routing contract. Commands, receipts, and deep-link descriptions resolve to the shared normalized target object; all supported deep-link forms decode into the same internal routing path instead of treating URL activation as a separate system. Serialized URL and `resume_url` forms obey a narrowed-transport rule: they carry only the stable route-target fields needed for recovery or exact resume, not the entire internal target model, and they must not invent new one-off URL shapes when a route-target family already exists.

Kubernetes workload history is identity-based across delete/recreate cycles. `k8s_workload_ref` stores context, `/namespace/name`, kind, UID when knowable, and source repo/root; history and deep links classify resolution as `current_match_by_uid`, `name_match_only`, or `historical_missing`. A same-name replacement after `/deletion` or `/recreate` is not treated as the same workload without degraded warning, and a `not-found` workload opens historical detail instead of rebinding silently to a different current object.

Runtime identity is not preview-centric. `container_id`, `compose_project`, `runtime_context`, and `workload_ref` are durable runtime identity fields with requested-vs-effective state, local-runtime blocked/degraded classification, and receipt joinability. Local-runtime blockers include compose-up failure, unhealthy container, missing Docker context, podman runtime mismatch, cluster unreachable, rollout failure, and port-forward failure. Kubernetes-first and Helm-first projects still surface Docker Manager/Kubernetes when Docker visibility is auto-hidden; `Publish / Unraid` remains the Unraid home and the legacy `Docker Manage` label is only a migration alias, not separate shell-navigation.

Local-runtime reason codes are canonical and advisory-only until refreshed into requested-vs-effective state. Codes include `runtime_context_missing`, `runtime_context_unreachable`, `compose_invalid`, `compose_service_missing`, `buildx_unavailable`, `bake_unavailable`, `image_missing`, `container_unhealthy`, `access_url_unresolved`, `k8s_context_missing`, `k8s_context_unreachable`, `k8s_namespace_missing`, and `k8s_rollout_blocked`; panels may add port mapping, workload missing, or port-forward variants only as typed extensions, not panel-local prose.

The Docker Manager state-model applies requested-vs-effective checks to `/runtime/publish`, `/runtime/registry/deploy`, and `/context/compose/build/Kubernetes` actions, not only Docker auth. Runtime, registry, and deploy CTAs disclose requested action, effective capability, repo/root binding, `/receipt` joinability, and recovery route before executing side effects.

Requested/effective identity is lane-aware and package-aware wherever Docker Manager mirrors runtime work. `Plans/Multi-Account.md`, `/Multi-Account.md`, and `Personas.md` retain provider-level multi-identity, but Docker Manager evidence must expose lane-specific and package-specific effective identity for account/provider/model decisions, not only Persona visibility. Provider/model/variant/effort, `/provider/model`, `/model/variant/effort`, `/model/persona/account`, `/model/variant/auth/account`, `/auth/account`, `/persona/runtime`, auth mode, account policy, worker policy, and operational identity are runtime-facing fields that all record requested value, /effective value, override source, `selection_reason`, and reason; `/switch` history and skipped or `/clamped` controls stay visible when the effective account, Persona, runtime, or worker policy differs. Worker policy includes project/package/node and `/package/node` override source, requested `subagent` or `fresh_worker`, effective agent/subagent/fresh/reused worker, and why it changed. `Media_Generation_and_Capabilities.md` and `Media_Generation_and_Capabilities` live capability re-checks must reconcile with `orchestrator-subagent-integration.md` / `orchestrator-subagent-integration` frozen run snapshots, and the `platform.capability_evaluated` event family must be registered through `Contracts_V0`. `OpenCode_Deep_Extraction.md`, `OpenCode_Deep_Extraction`, and OpenCode source-verified that SSE/auth can be process-global or `/server-global`, so per-session and `/per-run` account binding require explicit PM-side scoping logic; `agent-rules-context.md` and `agent-rules-context` provider-using actors can include non-CLI transports and cannot be reduced to a tiny CLI-only actor set.

Docker Manager GUI disclosure grammar must expose `Requested account`, `Requested binding`, `Effective account`, and `Switch reason` wherever account/runtime identity can diverge. Requested vs effective identity and runtime display include effective account, fallback reason, lane/worktree identity, lane/worktree scope, overseer class, overseer role, package/seam scope, and package/seam ownership instead of stopping at persona/platform/model or `/platform/model` visibility.

Docker Manager project state preserves last runtime asset / publish result / template repo / k8s operation refs, compose scenarios, drift baseline refs, and cleanup preferences as durable reopen targets and comparison baselines. The canonical project key is `container_manager.project_state.{project_id}` and includes `requested_runtime`, `effective_runtime`, `requested_context`, `effective_context_state`, `requested_build_mode`, `effective_build_capabilities[]`, `effective_build_capabilities`, `requested_compose_mode`, `effective_compose_capabilities[]`, `effective_compose_capabilities`, `requested_registry_target`, `effective_registry_capabilities[]`, `effective_registry_capabilities`, `requested_k8s_target`, `effective_k8s_capabilities[]`, and `effective_k8s_capabilities`. These references join back to receipts and selected repo/root state rather than storing transient runtime observations as product truth.

Persisted projection objects include `project`, `run`, `feature_seam`, `work_package`, `node`, `attempt`, `lane`, `snapshot`, `promotion`, `review`, `resolution_thread`, and `event`; dashboard, orchestrator, `/orchestrator/source-control`, Docker Manager `/page` and widget presentation, and source-control summaries are projections over those canonical runtime facts, not separate truths. Requested vs effective execution identity, including effective account selection and `/fallback`, is persisted at attempt level so Docker Manager, Orchestrator, and Source Control can recover the same state.

Orchestrator-linked Docker Manager views consume package/lane state rather than reviving tier-era ownership. `Plans/Orchestrator_Page.md` (`/Orchestrator_Page.md`) may still expose compatibility labels such as `Tiers`, `Phase/Task/Subtask`, singular `Overseer`, `/Task/Subtask`, `requested_persona_id`, and `effective_persona_id`, but Docker Manager treats stale `tier_id` coordination state as migration lineage only and honors package/seam overseers, `/seam`, package/seam/lane visibility, `/lane`, `/account`, and promotion-class state as the runtime pressure to honor. Worktree references stay contextual, actionable, and deep-linkable; they do not make worktree identity the primary package/lane state owner.


Runtime and remote identity drift is explicit. If active Docker identity changes and the selected namespace or repository is no longer visible or writable, Docker Manager marks the selection `stale_unowned` and revalidates before publish or promotion; users can trigger `hard-refresh` when cached identity and ownership disagree. Kubernetes state is `subject-aware`: it distinguishes cluster/context identity, authenticated subject identity, namespace/workload focus, and RBAC or policy result; if credentials rotate behind the same context name, the UI treats that as `identity-change` and revalidates RBAC before mutation. SSH remote bindings used by container deploy or source-controlled publish flows include effective remote user `/principal` and `/host-key` context, not only the host alias.

Remote side-effect outcomes include `indeterminate_remote_outcome` when the server-side action may have succeeded but the client lost confirmation. Such receipts record `requested`, `transport_lost`, later `reconciled`, and a `Refresh remote state` CTA. Hybrid surfaces expose capability-level degradation rather than blanket disabled states: Source Control local Git can remain usable when GitHub is offline; GitHub Actions can be `hosted-degraded` while workflow files remain editable; Docker local runtime can remain usable while registry access is offline; Kubernetes manifest editing can remain usable while cluster access is offline. Active run ownership marks mutable targets as `owned_by_run`; manual mutation of owned worktrees, preview containers, or rollout-associated workloads blocks, requires explicit override, or forks control explicitly, and receipts record that user override.
This active-run safety rule also covers Docker Manager actions launched from Source Control, GitHub /Actions, and orchestrator/dashboard panels so worktree-native UX does not remain under-specified when `dirty_worktree` or `worktree_conflict` blocks a container, registry, or publish action.

Docker Manager consumes the newly-locked, now-locked remote-first project-mode vocabulary without becoming the remote-owner for file, editor, `/browser/LSP/search`, or `language-detection` behavior. Remote-capable Docker, Kubernetes, registry, and template-repo surfaces preserve `/read-only/offline`, `/degraded/offline`, host-aware identity, `/fallback/index` handoff, one-bounded-auto-retry rather than legacy five-attempt retry assumptions, and `/reveal` links back to the owning file, search, LSP, or Final GUI surface. Container and Kubernetes GUI consumers must not reintroduce bottom-panel-primary browser hosting where the editor-tab-first browser model is the owner; provider/platform differences, requested-vs-effective state, and fallback behavior remain user-disclosable instead of re-decided per cross-seam surface.

Docker Manager row actions are capability-aware. File-backed or project-root rows distinguish local vs remote host context, writable vs read-only or `/degraded/offline` state, single-select vs multi-select, and exact disabled-state reasons. `Download / Save Local Copy` remains available when source access is readable even if remote/project FS writes are blocked; `Open in Terminal` disables only when no terminal-capable host/session path can be resolved; open/save/export style actions use explicit Docker Manager, file, browser, or terminal commands, and `system_default` is not part of the canonical MVP target enum for this surface.

ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

### 2C. Lifecycle, Detection, And Legacy Navigation Reconciliation

Docker Manager visibility uses the broad `container-related` definition, not Dockerfile/Compose only. Inputs include `Dockerfile`, `Compose file`, container build/publish settings, managed Unraid template repo, Kubernetes manifests, Helm chart files, persisted Kubernetes context/namespace/workload state, and prior deploy `/apply/port-forward` receipt history. `/Compose`, `/Kubernetes`, and `/Helm/persisted` aliases map to the same detection inputs. `Hide Docker Manager when not used in Project.` evaluates against that full definition. The Kubernetes subview is auto-visible when manifests, Helm artifacts, persisted cluster state, or Kubernetes receipts exist, and is manually unhideable otherwise. Detection state is tri-state: `detected`, `manually_enabled`, and `not_detected`.

Helm-only and manifest-only projects still surface Docker Manager when hide-when-unused is enabled. There is one shell occupant for container, `/runtime/deploy`, local-runtime, and Kubernetes management; stopped previews reopen durable `/image/compose/workload` records from receipts; missing Bake capability disables Bake only, not the whole panel; and project state restores Kubernetes-focused or Compose-focused state without requiring Docker Hub state. The Kubernetes command coverage token `/diff/logs/exec/port-forward` maps to the canonical `cmd.docker.k8s.*` family.

`Unraid` is not a separate first-class shell panel in the rewrite. `Publish / Unraid` is a stable subview inside `Docker Manager`; the activity bar exposes one container-management icon/panel, not separate Docker and Unraid occupancy slots. Any future `Open Unraid` convenience action is an alias to `Docker Manager > Publish / Unraid`. Durable runtime identity extends beyond `preview_session_id` with `runtime_asset_ref`, `compose_project_ref`, `publish_result_id`, `template_repo_id`, and `k8s_workload_ref`.

Registry object lifecycle is not name-based. Registry refs support lifecycle states `active`, `renamed`, `deleted`, `private_inaccessible`, and `historical_only`; publish-chain/history preserve original registry host, namespace, and repository even if current selection changes. Old receipts never silently rewrite to the currently selected repository. Historical image resolution is digest-first: if a digest exists, historical publish/image receipts prefer the immutable digest over a mutable tag; if the tag is retargeted or deleted, history shows the historical digest and marks the tag stale/missing.

Docker internals split local runtime control through Docker/Compose/Buildx CLI (`/Compose/Buildx`), registry discovery and metadata through provider-specific APIs where useful, and project-aware PM additions on top: requested-vs-effective auth, protected repo creation, publish evidence, Unraid generation, and template repo workflow. Registry promotion flow uses `Registries` and `Publish / Unraid`, preserves `/privacy` defaults, and supports digest/tag copy `/promote/pull/retag` commands with digest-first receipts. Publish chain view exposes chain verbosity, show downstream deployment targets, and include historical publishes controls; `/tradeoffs` remain explicit because mutable tags require digest identity in receipts and lineage.

Command generalization is broader than Docker-Hub-first. Canonical Docker Manager families cover runtime, container, image, compose, context, registry, build, bake, publish, unraid, and kubernetes. Existing Docker Hub / Unraid commands are specialized members of these broader families, not the whole surface contract. Orchestrator can reopen assets `/workloads` through canonical families without one-off navigation commands. Disabled/degraded Docker/Kubernetes controls bind to canonical reason code, requested capability, effective capability/state, and recommended next action; fallback order is reopen live asset/workload if active, reopen durable ref if the live session is gone, reopen nearest valid parent surface, otherwise show unsupported `/unresolved` explanation.

Docker Manager and Kubernetes first-open disclosure cards explain the surface boundary before mutation: `Containers` covers local runtime management vs hosted/remote side effects; `Publish / Unraid` covers publish chain, registry mutation, and Unraid follow-through; `Kubernetes` covers project-focused Kubernetes, not full cluster admin. Each card explains requested-vs-effective context/capability, what a receipt is, what it is not, how partial/historical/stale data is labeled, and where to go for full evidence/raw logs.

Docker Manager GUI help, `/tooltip`, and `/Expert/ELI5` derivations use stable canonical terminology rather than one-line substitutions that erase object/state/action distinctions or why a state exists. Help entries and owner cross-links route through `Plans/Glossary.md`, `Plans/Crosswalk.md`, `Plans/Decision_Policy.md`, `Plans/00-plans-index.md`, and `plans-index` ownership for first-class terms such as Feature Seam, Work Package, Weak Integration, Corroboration, Graph Patch, Promotion, Concern lifecycle, Lane vs Worktree, requested vs effective, safe point vs restore point (`safe-point` vs `restore-point`), historical vs superseded vs revoked, History, Ledger, package/seam overseers, promotion class, lane pool, contamination, and effective execution identity across runtime, `/storage/UI`, policy, and presentation surfaces.

Legacy naming migration is formal. `Docker Manage` copy, `docker_manage_surface_state`, and any `cmd.panel.switch` or equivalent legacy panel IDs migrate to the canonical Docker Manager surface and do not create another owner. The concept-vs-plan contradiction around a separate `UNRAID` panel/icon is resolved in favor of the accepted `Publish / Unraid` area inside Docker Manager; separate Unraid shell occupancy is retired.

### 3. Orchestrator and dashboard integration
Docker-related actions must also remain available from orchestrator/dashboard build/preview surfaces when a Docker-related run is active. The contextual Docker Manager surface is not a replacement for orchestrator controls; it is a richer management layer that complements them.
Cross-surface settings-level evidence is owner-split rather than duplicated: Docker Manager owns DockerHub repository/auth/push policy settings and `/auth/push` blocked-state evidence, Source Control owns AI commit-message generation, and GitHub /Actions owns workflow runs plus the `Manage Secrets` action; Docker Manager stores only the links and receipts needed when those surfaces interact with build, publish, or Unraid flows. Source-lineage references such as `PuppetMasterDashComp.html` document where the combined concept appeared, but they do not create a new canonical owner.

## Docker project detection and visibility rules
A project is treated as Docker-related when Puppet Master detects a container-oriented workflow such as:
- a `Dockerfile`
- compose configuration
- container-based preview/build target
- container publish settings already configured for the project
- an existing managed Unraid template repository associated with the project

When detection is positive:
- show the contextual Docker Manager surface
- enable DockerHub repository, preview, publish, and Unraid template actions
- retain the user’s last-used Docker surface state for that project

When detection is negative and `Hide Docker Manager when not used in Project.` is enabled:
- hide the contextual Docker Manager surface from normal project navigation
- retain settings and state, but do not foreground Docker workflows

## Authentication model

### Supported authentication inputs
Puppet Master must support both of these DockerHub authentication paths:
1. **Browser/device login**
   - the GUI launches Docker’s browser/device login flow
   - intended for low-friction interactive sign-in
   - preferred when the user wants guided sign-in from the desktop UI
2. **Personal Access Token (PAT)**
   - explicit token entry in the GUI
   - helper text explains that PAT is recommended
   - helper text explains where/how the user can obtain a PAT
   - intended to be the most explicit and durable advanced-user path

PAT support remains mandatory even though browser login is supported.

### Browser/device login execution contract

- `cmd.docker.browser_login` MUST launch the DockerHub browser/device login flow and immediately emit `docker.auth.browser_login.started`.
- When the device/browser flow is initialized, Puppet Master MUST emit `docker.auth.browser_login.device_code_issued` with `verification_uri`, `user_code`, and `expires_in_seconds`.
- While awaiting completion, Puppet Master MUST emit `docker.auth.browser_login.polling` every 5 seconds until a terminal outcome occurs.
- Terminal outcomes are exactly one of:
  - `docker.auth.capability_validated`
  - `docker.auth.browser_login.cancelled`
  - `docker.auth.browser_login.timed_out`
  - `docker.auth.failed`
- PAT entry MUST be written through `cmd.docker.save_pat`; PAT format MAY fail locally before network validation runs.

### Credential storage precedence and scope

- Browser-login credentials MUST be read from Docker's credential-helper / `~/.docker/config.json` chain.
- PAT credentials MUST be read from the OS credential store only.
- DockerHub credentials are **global per OS user account**.
- `requested_auth_mode`, selected namespace/repository, and last validation snapshot remain **project-scoped UI state**.
- Clearing credentials MUST declare whether the action clears browser-login credentials, PAT credentials, or both.

### Auth-expiry failure rule


If auth expires during image push, Puppet Master MUST emit `docker.publish.failed` with `reason_code: auth_expired`, preserve the local build result, and surface a re-auth + retry CTA without forcing a rebuild.

### Requested vs effective auth state


#### Canonical DockerHub effective capability enum

`effective_capabilities[]` is a closed enum for the first implementation:

- `namespaces:list`
- `repositories:list`
- `repositories:create`
- `images:push`
- `repositories:read_private`

Surface gating rules:
- Namespace discovery requires `namespaces:list`.
- Repository discovery / refresh requires `repositories:list`.
- Create Repository requires `repositories:create`.
- Push Image requires `images:push`.
- Validation of a private target repository requires `repositories:read_private` or a successful push-capable validation path.
- If a surface requires a capability the effective set does not contain, the control MUST remain visible but disabled, with inline explanation that cites the missing capability and `degraded_reason` when present.

Puppet Master must model requested auth mode separately from effective capability.

Required state concepts:
- `requested_auth_mode`: `browser`, `pat`, or another future explicit auth mode
- `effective_auth_provider_state`: authenticated / unauthenticated / degraded / expired
- `effective_capabilities[]`: a set of effective capabilities such as:
  - browse namespaces
  - browse repositories
  - create repository
  - push image
  - read private repository state
- `effective_account_identity`: visible DockerHub account/namespace identity
- `last_validation_timestamp`
- `last_validation_host`
- `degraded_reason` when requested mode and effective capability do not match

User-visible rule:
- the UI must never imply that browser login or PAT automatically grants full repository-management capability
- the UI must explicitly show what is actually available after validation

### Browser login capability rule
If browser-based DockerHub login can support namespace/repository browsing and repository creation, Puppet Master should allow those management actions through browser login as well. PAT remains the recommended explicit fallback, but it is not required when browser login yields equivalent effective capability.

### Credential storage rule
- store tokens/credentials only in OS credential storage or Docker’s credential-helper path as appropriate
- never persist secrets to redb, YAML, project files, or evidence logs
- Docker Hub auth secret material remains out of redb; only validated identity/capability snapshots persist
- evidence/log capture must redact credentials, auth headers, and token-bearing environment variables

## DockerHub repository discovery, selection, and creation

### Repository selection behavior
Puppet Master must let the user:
- view discovered namespaces
- select the target namespace
- view repositories within the selected namespace
- refresh repository lists on demand
- choose an existing repository for push
- create a missing repository if needed for first publish

DockerHub API behavior must be documented clearly:
- use Docker CLI / Buildx for local build, run, login, and push behavior
- use Docker Hub API for namespace/repository discovery and repository creation when app-managed listing/creation is needed
- do not conflate image registry push with template distribution

### Missing repository behavior
If the selected DockerHub repository does not exist:
- Puppet Master may offer to create it automatically as part of first-push preparation
- the creation step must be explicit and visible
- the confirmation step must show:
  - namespace
  - repository name
  - privacy
- the confirmation step is mandatory and cannot be bypassed by YOLO modes, agent autonomy, or any other fast-path setting

#### Repository creation confirmation flow


Repository creation is a two-step flow:

1. `cmd.docker.create_repository` validates the proposed namespace/repository/privacy tuple and emits `docker.repository.create.confirmation_requested`.
2. The confirmation modal shows namespace, repository name, privacy, and the private-by-default notice.
3. Confirm dispatches `cmd.docker.create_repository.confirm`.
4. Cancel dispatches `cmd.docker.create_repository.cancel`.

This confirmation is distinct from image-push approval. Approving an image push MUST NOT implicitly approve creation of a missing DockerHub repository.

### Default repository privacy


- default privacy for newly created repositories: private
- the confirmation dialog must make this default explicit
- the user may change privacy in the dialog before creation

## Build, run, preview, and publish flow

### Build flow
- use `docker buildx build` as the deterministic image-build path
- perform preflight before build: engine reachability, compose/config validity, buildx availability, required ports, target repo/auth when push is requested
- capture structured build results including artifacts, logs, and image identity
- surface build results in chat, orchestrator, and Docker Manager UI

### Run/preview flow
Puppet Master must be able to deploy and run project containers from within the app for testing workflows. When the project exposes user-facing access, Puppet Master must also provide a user-visible way to open/check the running container from within the UI.

Required actions:
- start preview/run
- stop preview/run
- open exposed web UI or endpoint when available
- open logs
- inspect health status
- show resolved access URL/port if one exists

#### Runtime access URL resolution

Access URL resolution order is:

1. explicit user override for this project
2. first published host-port mapping from compose / container inspect, preferring ports `443`, `80`, `3000`, `8080`, then the next published port
3. known web-UI metadata/label if present
4. no access URL

When no access URL is available, Docker Manager MUST show `No direct access URL detected` and disable the open action rather than guessing.

#### Runtime stream, port-forward, crash-gap, and network trust continuity

Persisted stream intent applies to Actions logs, container logs, Kubernetes logs, and Orchestrator activity. Each stream surface MUST distinguish `follow`, `paused_snapshot`, and `historical_view`; after restart, `follow` intent is restored only after source revalidation and creation of a new stream session.

Port-forward rebinding records local port reuse versus new allocation. If the target pod/workload drifted, the original local port is unavailable, or the target changed, the old session remains historical and a new session id is issued. Previously opened browser tabs are never silently rebound across target changes; they reconnect to the same validated target or show historical/degraded state with an explicit open-new-session action.

Crash-time log and evidence rendering distinguishes `flushed-and-persisted` lines, locally buffered but unflushed lines, and the `unknown gap interval`. The UI renders the unknown gap explicitly instead of implying complete evidence.

Docker Manager is the primary owner for runtime/Kubernetes alert ownership, while Dashboard and Orchestrator mirror attention state. The owner/mirror split keeps unhealthy containers, restart loops, failed readiness, failed rollouts, and port-forward failures actionable from Docker Manager even when the originating attention item appears in another surface.

Runtime and GitHub-hosted surfaces consume the shared host policy when they open Actions, registry, or runtime links: `github_host_policy` distinguishes `github.com_only` and `enterprise_allowed`. If the `MVP` remains `github.com_only`, `GHES` and GitHub Enterprise Server URLs receive deterministic disabled-state UX rather than hidden fallback.

Shared `/network/trust` policy records proxy mode `system`, `manual`, or `off`; `http_proxy`, `https_proxy`, and `no_proxy`; proxy credential source as the OS credential store only; and `per-domain` plus `/per-surface` opt-out rules. Trust policy is separate from Unraid metadata and starts from the OS trust store, with app custom CA bundle, per-host CA override, and validation and expiry reporting tracked outside registry metadata.

#### Enterprise registry and Kubernetes host policy

Private and enterprise registry configuration is represented as `registry_hosts[]`. Each `registry_hosts` entry records the registry host, host policy, trust/proxy inheritance, capability snapshot, and default push target so Docker Manager can decide pull, push, inspect, and browse behavior without conflating policy with transient reachability.

Kubernetes access is represented as `k8s_host_policy`. The policy defines allowed contexts/clusters/namespaces and allowed verbs, including `apply`, `exec`, `port_forward`, and `logs`; UI command availability and Docker Manager subviews consume this policy rather than redefining it.

Hosted/runtime registry and Kubernetes surfaces distinguish `offline_cached`, `network_blocked_by_policy`, `host_unreachable`, and `host_untrusted`. When cached evidence exists they render read-only cached state with freshness markers; policy-denied but otherwise valid registry or cluster actions surface canonical blocked/preflight state instead of generic network failure.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/UI_Command_Catalog.md

#### Preflight and approval ordering contract

Docker, registry, Unraid, and Kubernetes mutations run preflight before approval prompts. Preflight resolves target identity, runtime/tool availability, host/trust/proxy policy, repository or cluster capability, and current drift/freshness; if those facts cannot be resolved, Puppet Master emits `blocked_preflight` and does not ask the user to approve an unknowable operation. Approval binds to the preflight snapshot and exact action scope, and retry/resume re-runs preflight when the target, permission snapshot, host policy, or governance state may have changed. Policy-denied outcomes after preflight or approval emit blocked/governance payloads with the policy source and reason-code family rather than `*.failed`.

#### Kubernetes enablement rules and Kubernetes doctor checks

Kubernetes is enabled as a project-focused Docker Manager subview when manifests, Helm artifacts, kube-linked receipts, active workload refs, or explicit project settings indicate Kubernetes relevance. Kubernetes doctor checks verify `kubectl` reachability, kubeconfig/context availability, namespace access, project-focused workload scope, Helm availability when Helm actions are selected, and allowed verbs for `apply`, `diff`, `logs`, `exec`, and `port_forward`. Failed checks keep manifest editing and cached inspection available when possible, but block mutation, exec, logs, or port-forward actions with explicit preflight/permission outcomes.

#### Future-scope placeholders

Registry promotion, drift detection, access intelligence, and project-focused K8s deep linkage are reserved future-scope anchors for this owner doc. They may render as disabled, partial, or planned capabilities until implemented, but must not disappear from the Docker Manager contract or be replaced by generic runtime wording.

#### Event registration contract

This plan defines Docker, registry, Kubernetes, and Unraid event producers and payload expectations for its owner surface. `Plans/Contracts_V0.md` remains the registration authority for stable cross-product event names, and `Plans/storage-plan.md` owns concrete persisted payload schemas; new Docker/Unraid/Kubernetes event families must be registered there before consumers treat them as durable canonical events.

### Publish flow
#### Publish execution, approval, and blocked-outcome contract

The canonical publish path is a **two-step** model:

1. `cmd.orchestrator.build_run` performs local build / preview preparation only.
2. `cmd.orchestrator.push_image` performs remote DockerHub publication only.

Normative rules:
- `cmd.orchestrator.build_run` MUST NOT create DockerHub repositories, push images, create remote template repos, or push remote template repos.
- `push_policy = after_build` means Puppet Master automatically dispatches `cmd.orchestrator.push_image` **after** a successful local build result exists; it does **not** fold remote publish into `build_run`.
- A direct user click on **Build** approves build only.
- A direct user click on **Push image** approves image push only.
- If the target DockerHub repository is missing, repository creation remains a separate side effect and requires its own confirmation/approval.
- If managed Unraid template-repo push is later requested, that remote push is a separate side effect and requires its own approval.
- `docker.publish.failed` means Puppet Master attempted the publish operation and the operation failed at runtime.
- `docker.publish.blocked` means Puppet Master intentionally did not execute the remote side effect because confirmation or permission approval was missing, rejected, or cancelled.

#### Missing-repository interruption and resume contract

If `cmd.orchestrator.push_image` resolves a missing target repository:

1. Puppet Master MUST preserve the local build result and enter `awaiting_repo_creation_confirmation`.
2. Puppet Master MUST emit `docker.repository.create.confirmation_requested`.
3. Confirming creation dispatches `cmd.docker.create_repository.confirm`.
4. On successful repository creation, Puppet Master resumes the pending `cmd.orchestrator.push_image` attempt without forcing a rebuild.
5. If repository creation is cancelled, rejected, or blocked by policy, Puppet Master MUST emit `docker.publish.blocked` with:
   - `reason_code: repo_creation_not_confirmed`
   - `blocked_step: create_repository`
   - `allowed_action_ids[]`
6. `docker.publish.blocked` MUST preserve the already-built local image/result so the user can retry without rebuilding.

- publish uses DockerHub-targeted image tags and namespace/repository selection
- push policy remains `manual` by default with optional `after_build`
- after successful push, capture and surface:
  - pushed tags
  - digest(s)
  - registry host
  - target namespace/repository
  - platform list
  - sanitized logs path

#### Tag template resolution contract

#### Auto-push approval and canonical publish-reference contract

Approval rules:
- `push_policy = after_build` does not grant standing approval for remote side effects.
- Clicking **Build** approves only local build execution.
- When a successful build reaches the auto-dispatch point, Puppet Master MUST evaluate `external_publish_side_effect` for `cmd.orchestrator.push_image`.
- If publish approval is not satisfied at that point, Puppet Master MUST emit `docker.publish.blocked` with `blocked_step: push_image`, preserve the local build result, and surface **Push image** as the recovery CTA.
- DockerHub repository creation and managed-template remote repo create/push remain separately approved side effects even when `push_policy = after_build` is enabled.

Canonical template source image selection:
- If the project sets `primary_publish_tag`, use it.
- Otherwise use the first tag emitted by the resolved tag-template list.
- Otherwise fall back to the lexicographically smallest tag only for legacy results that lack ordering metadata.
- If `docker_publish_result.digests[]` contains a manifest-list digest, that digest is the canonical `image_digest`; otherwise use the single pushed digest.
- The generated application template MUST use `<Repository>` = `<namespace>/<repository>:<primary_publish_tag>`.

| Variable | Resolution source | Format | Failure behavior |
|---|---|---|---|
| `{commit}` | HEAD commit of the active project repo | first 12 lowercase hex chars | block publish if the template references `{commit}` and no HEAD commit exists |
| `{version}` | detected canonical project version (`Cargo.toml`, `package.json`, then explicit user override) | lowercase value after Docker-tag sanitization | block publish if unresolved and no user override exists |
| `{timestamp}` | UTC publish-start time | `YYYYMMDD-HHMMSSZ` | never fails |

- Tag templates MAY combine literals and multiple variables.
- After substitution, tags MUST be lowercased.
- Characters outside `[a-z0-9_.-]` MUST be replaced with `-`.
- Consecutive `-` MUST be collapsed.
- An empty post-sanitization tag is invalid and MUST block publish with explicit remediation text.

### Post-publish follow-on flow
After successful image publishing:
1. if `Generate/Update Unraid XML after successful publish` is enabled, generate or update the Unraid XML
2. if managed template-repo workflow is enabled, update the target template repo
3. auto-commit the template-repo change by default
4. do not auto-push by default
5. present a one-click push action from the UI

## Unraid XML generation and distribution model

### Canonical generated-artifact contract

The managed Unraid flow produces three artifact classes:

1. **Application template XML** at `<maintainer_slug>/<project_slug>.xml`
2. **Maintainer profile XML** at `ca_profile.xml`
3. **Repo-managed image assets** under `assets/maintainer/` when the user uploads images instead of referencing external URLs

#### Artifact input provenance

| Canonical PM field | Primary source | Fallback / user override | Required for auto-commit | Required for auto-push |
|---|---|---|---|---|
| `project_slug` | Project identity | User override in template settings | Yes | Yes |
| `display_name` | Project display name | User override | Yes | Yes |
| `image_ref` | `docker_publish_result` (`namespace/repository:tag`) | None | Yes | Yes |
| `image_digest` | `docker_publish_result.digest[]` | None | No | No |
| `registry_host` | `docker_publish_result.registry_host` | None | Yes | Yes |
| `web_ui_url` | Resolved preview/runtime access URL | User-entered URL override | No | No |
| `support_url` | Project support/docs URL | User-entered maintainer URL | No | Yes |
| `overview_markdown` | Project summary / README excerpt / prior template content | User-edited value | No | Yes |
| `icon_source` | Repo-managed uploaded asset or external URL | User choice | No | Yes |
| `category_labels[]` | Project metadata / prior template content | User-edited value | No | Yes |
| `config_items[]` | Compose/runtime config + prior template content | User-edited value | No | No |
| `maintainer_slug` | DockerHub namespace by default | User override | Yes | Yes |
| `maintainer_profile` | Shared or per-project `ca_profile` state | None | Yes | Yes |

#### App-template minimum contract

The first implementation MUST support, at minimum, deterministic generation and round-trip update of these conceptual fields:

- display name
- image reference
- registry host
- overview/description content
- support URL
- web UI URL when present
- icon/image source
- category labels
- config entries derived from ports / volumes / environment / path mappings
- maintainer slug and owning template path

Implementation rule:
- Puppet Master MAY use an internal normalized model rather than hard-coding UI logic directly to raw XML tags.
- However, the normalized model MUST map 1:1 to emitted XML content and MUST be documented.
- Unknown fields present in an existing template MUST be preserved on update unless the user explicitly removes them.

#### `ca_profile.xml` round-trip rule
#### Explicit editability contract for all fields


The statement "all `ca_profile.xml` fields are editable" is satisfied by a two-layer editor model:

1. **Structured editor** for the canonical known fields exposed in the standard UI.
2. **Advanced raw XML editor** for any field, element, attribute, or passthrough content not yet modeled by structured controls.

Normative rules:
- The structured editor MUST round-trip through the same normalized model used by generation/update.
- Unknown or currently unmodeled content MUST remain editable through the advanced raw XML surface.
- Saving from either surface MUST preserve unmodified passthrough content verbatim.
- Puppet Master MUST NOT claim "all fields editable" unless both layers exist.

`ca_profile.xml` editing is a **round-trip** contract, not a one-way generator.

Required behavior:
- Puppet Master MUST parse existing `ca_profile.xml` into a normalized editor model.
- The editor model MUST preserve all existing fields, including fields the current UI does not yet expose individually.
- The first implementation MUST expose editable controls for, at minimum:
  - maintainer display name
  - maintainer slug
  - overview/about text
  - support URL
  - icon/image source
- When the user uploads an image, Puppet Master MUST copy it into the managed template repo by default and rewrite the profile to reference that repo-managed asset.
- When the user selects external URL mode, Puppet Master MUST preserve the external URL exactly as entered.

#### Validation and review rules

- A successful Docker publish is required before Puppet Master may treat `image_ref` as final for generated template output.
- Missing `support_url`, `overview_markdown`, or `icon_source` MUST mark the generated result as `needs_review`.
- `needs_review` MUST NOT block local save or local auto-commit, but it MUST block auto-push and MUST surface a visible warning in Docker Manager.
- If Puppet Master updates an existing template and cannot map a field safely, it MUST preserve the existing field and mark the template result as `needs_review` rather than dropping data silently.

#### Known-field registry and XML mapping (first implementation)


#### XML emission minima for first implementation

The first implementation emits application templates with one canonical root shape:

```xml
<Container version="2">
  <Name>Example App</Name>
  <Repository>namespace/repository:tag</Repository>
  <Registry>https://registry-1.docker.io</Registry>
  <Network>bridge</Network>
  <MyIP/>
  <WebUI>http://[IP]:[PORT:8080]</WebUI>
  <Support>https://example.invalid/support</Support>
  <Overview><![CDATA[Markdown or HTML-safe overview text]]></Overview>
  <Category>Tools:Utilities</Category>
  <Icon>assets/maintainer/icon.png</Icon>
  <Config ... />
</Container>
```

Canonical rules:
- Root element is exactly `<Container version="2">`.
- Known child elements emit in this order: `Name`, `Repository`, `Registry`, `Network`, `MyIP`, `WebUI`, `Support`, `Overview`, `Category`, `Icon`, then repeated `Config`.
- `Overview` emits as CDATA.
- All other known text nodes emit as escaped text.
- Optional known elements are omitted when empty.
- Unknown elements, unknown attributes, and XML comments from an existing template MUST be preserved verbatim and re-emitted after the last known sibling in their original relative order unless the user explicitly removes them.
- Existing unknown root attributes MUST be preserved verbatim on round-trip update.

`Config` type mapping for first implementation:

| Normalized field | Emitted `Config` shape | Required attributes |
|---|---|---|
| Port mapping | `<Config Type="Port" ... />` | `Name`, `Target`, `Default`, `Mode`, `Display`, `Required`, `Mask="false"` |
| Path / bind mount | `<Config Type="Path" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask="false"` |
| Environment variable | `<Config Type="Variable" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask` |
| Device mapping | `<Config Type="Device" ... />` | `Name`, `Target`, `Default`, `Display`, `Required`, `Mask="false"` |

Attribute mapping rules:
- `Name` = stable user-visible label; fall back to `Target` when no label exists.
- `Target` = container-side port/path/variable/device identifier.
- `Default` = host-side or default value.
- `Display` = `always` for first implementation unless hidden by explicit user choice.
- `Required` = `true` only when the value is mandatory for a successful container run.
- `Mask` = `true` only for secret environment variables; otherwise `false`.
- `Mode` is required only for `Type="Port"` and is exactly `tcp` or `udp`.

If Puppet Master cannot map a source item into the required attribute set without inventing values, it MUST preserve the prior XML unchanged for that item and mark the result `needs_review`.

##### Application template XML

| Normalized field | XML element / shape | Required for local save | Required for auto-push |
|---|---|---|---|
| `display_name` | `<Name>` text | Yes | Yes |
| `image_ref` | `<Repository>` text | Yes | Yes |
| `registry_host` | `<Registry>` text | No | Yes |
| `web_ui_url` | `<WebUI>` text | No | No |
| `support_url` | `<Support>` text | No | Yes |
| `overview_markdown` | `<Overview>` CDATA | No | Yes |
| `icon_source` | `<Icon>` text | No | Yes |
| `category_labels[]` | `<Category>` text | No | Yes |
| `config_items[]` | repeated `<Config ... />` elements | No | No |

##### `ca_profile.xml` recognized fields

| Normalized field | XML element | Required for auto-push |
|---|---|---|
| `display_name` | `<Name>` | Yes |
| `overview_markdown` | `<Overview>` | Yes |
| `support_url` | `<Support>` | Yes |
| `icon_source` | `<Icon>` | Yes |

### Distribution model
### Unmanaged generation target contract

If `Generate/Update Unraid XML after successful publish` is enabled but managed template-repo handling is disabled, unconfigured, or invalid, Puppet Master MUST still generate a local artifact set under:

`.puppet-master/generated/unraid/<project_id>/<publish_result_id>/`

Required output:
- `template/<maintainer_slug>/<project_slug>.xml`
- `template/ca_profile.xml` when the active profile is projected into the result
- `template/assets/maintainer/**` for repo-managed uploaded assets referenced by the result

In this mode:
- `unraid.template.generation.completed` still fires
- `template_repo_id` is `null`
- `commit_status` is `not_attempted`
- `push_status` is `not_attempted`
- UI copy MUST describe the result as **generated locally / not attached to a managed repo**

The default distribution target for generated Unraid XML is a separate Unraid template repository / Community Applications-friendly template location. The main application repository may still be offered as an optional export target, but it is not the primary default.

Rationale that must be preserved in docs:
- DockerHub stores images, not Unraid XML
- public Unraid template distribution is commonly done through GitHub template repositories / Community Applications workflows
- installed copies are stored locally on the Unraid server under `/boot/config/plugins/dockerMan/templates-user`

### Generation default
- automatically generate/update Unraid XML after successful image publish by default
- nearby GUI toggle disables this behavior
- generation is part of the first-class Docker publish flow, not a hidden manual afterthought

### Managed template-repo workflow default
- Puppet Master should manage the Unraid template repository workflow itself by default
- the user can disable managed template-repo handling in settings

## Unraid template repository setup, layout, and publishing

### Managed template-repo identity and lifecycle contract

#### Default identity rules


When the user chooses **create new template repo**, Puppet Master defaults to:

- **repo name:** `<project_slug>-unraid-template`
- **default branch:** `main`
- **local managed working copy:** `.puppet-master/unraid-template-repos/<project_id>/`
- **template path inside repo:** `<maintainer_slug>/<project_slug>.xml`
- **maintainer profile path:** `ca_profile.xml`

The user may override repo name, branch, local path, and maintainer slug during setup.

#### Existing-repo selection validation

When the user chooses **select existing template repo**, Puppet Master MUST validate:

1. the path/repo is reachable
2. the repo root is writable locally
3. the selected branch exists or can be created explicitly
4. the repo either already matches the required layout or can be migrated with explicit user confirmation
5. the repo does not contain uncommitted unrelated changes unless the user explicitly adopts the repo in its current state

If validation fails, Puppet Master MUST keep managed publishing disabled for that project and show the exact failing condition.

#### Template-repo status enum

The template-repo status row MUST use one canonical state model:

| State | Meaning | User-visible consequence |
|---|---|---|
| `unconfigured` | Managed publishing enabled but no repo has been set up yet | Show setup CTA |
| `config_invalid` | Repo/path/branch settings exist but validation failed | Block publish follow-on push; show remediation |
| `clean` | Repo is configured and has no pending local changes | Ready for next generation/update |
| `dirty_uncommitted` | Managed files changed locally and are not yet committed | Auto-commit may run if changes are PM-owned and safe |
| `committed_local_only` | Latest managed change is committed locally but not yet pushed | Show one-click push CTA |
| `push_in_progress` | Remote push is running | Disable duplicate push actions |
| `push_failed` | Remote push failed after local commit | Preserve local commit; show retry CTA and error |
| `diverged_remote` | Remote branch changed or local branch is behind/ahead unexpectedly | Block auto-push; require review/reconcile |
| `needs_review` | Generated template/profile content is incomplete or review-blocked | Allow local inspection/editing; block auto-push |

#### Transition rules

- After successful image publish, Puppet Master generates or updates the managed XML artifacts.
- If managed publishing is enabled and validation passes, Puppet Master MAY auto-commit the change by default.
- `needs_review` is entered when required review fields are missing (`support_url`, `overview_markdown`, `icon_source`) or when existing XML cannot be mapped safely without preserving passthrough content.
- `needs_review` is cleared only when a regeneration pass or explicit user save produces a template/profile with all review-required fields present and no unmapped-field warning remains.
- When `needs_review` clears, the next state is:
  - `dirty_uncommitted` if managed files changed locally
  - `clean` if no local managed diff remains
- PM-owned paths are exactly:
  - `ca_profile.xml`
  - `<maintainer_slug>/<project_slug>.xml`
  - `assets/maintainer/**` written in the current generation pass
- Auto-commit is allowed only when the working-tree diff is fully contained within the PM-owned path set for the current generation pass.
- Any unrelated tracked or untracked file change blocks auto-commit and surfaces a `Review repo state` CTA.
- Auto-commit MUST stop and surface review instead of committing when:
  - repo status is `config_invalid`, `diverged_remote`, or `needs_review`
  - unrelated uncommitted files exist in the repo
  - required managed paths cannot be updated deterministically
- A successful local auto-commit transitions the repo to `committed_local_only`.
- One-click push transitions `committed_local_only -> push_in_progress -> clean` on success.
- A failed push transitions `push_in_progress -> push_failed` and MUST preserve the local commit for retry.
- `diverged_remote` exits only after the user resolves the branch divergence externally or through a future dedicated reconcile flow and Puppet Master re-validates the repo state.

`commit_status` enum:
- `not_attempted`
- `committed`
- `skipped_review_required`
- `skipped_unrelated_changes`
- `failed`

`push_status` enum:
- `not_attempted`
- `skipped_auto_push_disabled`
- `push_in_progress`
- `completed`
- `failed`

#### Dirty-repo safety rule

If the selected repo already contains unrelated local modifications, Puppet Master MUST NOT silently fold managed template changes into that worktree state. It MUST require one of:

- user cleans the repo first
- user explicitly adopts the dirty repo state
- user switches to a different managed repo path

This prevents the managed workflow from mutating unrelated maintainer work without review.

### Setup flow
When managed Unraid template-repo publishing is enabled and no template repo is configured yet, Puppet Master must offer both:
- creating a new template repo automatically
- selecting an existing template repo

### Default repo shape
- default: one template repo per project

### Default layout
For managed per-project template repos, use:
- root-level `ca_profile.xml`
- maintainer folder
- `project-name.xml` inside that maintainer folder

### Maintainer folder source
- default the maintainer folder name to the project’s DockerHub namespace
- allow the user to override it with a custom maintainer slug

### Commit and push behavior
- auto-commit template-repo changes by default
- auto-push remains configurable but default disabled
- expose a one-click push action in the UI after commit
- present template-repo dirty / committed / ready-to-push status in the Docker Manager surface

## `ca_profile.xml` behavior

### Generation rule
If `ca_profile.xml` does not exist, Puppet Master must generate it and tell the user it still needs to be configured/reviewed.

### Scope model
- default scope: shared cross-project maintainer profile
- optional override: per-project maintainer profile

### Editability rule
All `ca_profile.xml` fields must be editable by the user.

### Image handling
The `ca_profile.xml` editor must support both:
- uploading/selecting an image that Puppet Master copies into the managed template repository
- referencing an external hosted image URL

Default for uploaded images:
- if the user uploads a picture through Puppet Master, copy it into the managed template repository by default and point `ca_profile.xml` at that repo-managed asset

### User-visible messaging
When `ca_profile.xml` was auto-generated, the UI must show a clear reminder that the user should configure public-facing maintainer metadata before treating the repo as final.

## Data/state model to preserve in implementation docs


### Canonical scope split and blocked-outcome state

To keep GUI, orchestrator, storage, and post-publish behavior aligned, the following scope rules are normative:

- `Hide Docker Manager when not used in Project.` is a **global** setting; the older `Hide Docker Manage when not used in Project.` key is a migration alias only.
- Docker Manager navigation/dock/panel state is **project-scoped**.
- For project-centric surfaces, widget layouts are project-scoped with a limited global fallback only when no project is open.
- Shared `ca_profile` source state is **global** unless the project explicitly enables per-project override.
- Template-repo configuration and TemplateRepoStatus are **project-scoped**.
- Effective-auth snapshots are advisory cached state only until revalidation.
- Blocked remote side effects are first-class state transitions and MUST remain distinguishable from runtime failures in UI state, event state, and persisted results.

Implementation-facing docs should preserve the following state concepts so GUI, orchestration, and persistence agree on one model:
- Docker project detection state
- `Hide Docker Manager when not used in Project.` setting, with the legacy `Hide Docker Manage when not used in Project.` alias migrated on read
- requested auth mode
- effective auth capability set
- validated DockerHub account identity
- selected namespace and repository
- selected repository privacy for first-time creation
- push policy
- image/tag template defaults
- auto-generate Unraid XML toggle
- managed template-repo enabled toggle
- template-repo location / remote / branch state
- auto-push toggle
- template-repo dirty/committed/pushed status
- shared vs per-project `ca_profile.xml` scope
- uploaded image asset mode vs external URL mode

### Orchestrator-linked state vocabulary and help semantics

Docker Manager is a consumer of shared orchestrator/runtime vocabulary, not a separate owner for those terms. `Glossary.md`, `Crosswalk.md`, `Decision_Policy.md`, `00-plans-index.md`, and `plans-index` retain first-class ownership for definitions and routing boundaries such as Feature Seam, Work Package, package/seam overseers, promotion class, lane pool, contamination, safe point, restore point, rollback, and effective execution identity. Docker Manager copy and state preserve the boundary between execution truth, projections, and `/page` or widget/page UI-only overlays.

For orchestrator-linked rows, badges, receipts, disabled controls, and GUI help-entry text:
- `hard_gate` / HITL `/blocked` `remote-side-effect` actions use the canonical approval/blocked flow and cannot be bypassed by generic UI confirmation; Docker Manager may render the blocker, but must not downgrade it into local confirmation copy.
- `action-specific` confirmation rules remain distinct from HITL approval: create repository, push, rollback, cleanup, delete, and cluster mutation flows keep their own reversibility and confirmation evidence while non-bypassable `hard_gate` actions still use allowed action IDs rather than generic modals.
- The requested vs effective execution identity remains runtime-facing and auditable. Runtime facts and visible state preserve `requested`, `effective`, `selection_reason`, `/clamped`, `/switch`, `/switching`, `/auth/account`, `/persona/runtime`, `/provider/model`, `/model/variant/auth/account`, requested Persona, effective Persona, requested platform/model/variant/auth/account policy, effective platform/model/variant/auth/account, provider/auth/account selection flow, selection/switch reason, skipped vs honored/clamped Persona controls, and skipped/clamped controls. `requested_account_policy` is not a substitute for a user-selected `requested_account_id`; concrete account selection and fallback remain visible to provider, chat-thread, `/chat/SCM`, and SCM consumers.
- Runtime/projection events are classified as runtime-internal, operator-visible, or chat-thread resolution events. The multi-project, multi-account, and multi-worktree orchestration model scopes identity, `/projection/storage`, `/seam/package/node`, account selection, and account fallback by project, package, seam, node, account, and worktree instead of collapsing them into a single current context.
- Stale `tier_id` usage is migration-only compatibility state, not a coordination-state key for Docker Manager. Package, seam, lane, node, attempt, receipt, worktree, and runtime asset references remain the owner keys for new navigation and audit joins.
- `cmd.panel.switch` is shell-state only: it may choose Docker Manager as the panel/shell occupant, but object-bearing targeting must route through the shared route/open target contract instead of extending the panel-switch args shape. A `route-activation` request must not reuse destination-local state when doing so would obscure the requested target in `/GUI`.
- PM-owned SCM state is cross-surface state. Managed template repositories, active git operations, live-run artifact roots, and worktree recovery state register with Orchestrator, Source Control, `/Source`, and Docker Manager rather than remaining hidden in one surface; `Orchestrator_Page`, `Orchestrator_Page.md`, `/recovery`, `/worktree`, cross-surface lineage, `allowed_action_ids`, and `allowed_action_ids[]` stay visible where recovery and destination panels consume them.
- Requested/effective display groups use the exact labels `Requested`, `Effective`, `Reason`, `Support`, `Inherited from`, and `Overridden by` when Docker Manager explains inherited policy, project policy, user override, account fallback, or capability degradation.
- Help text must not flatten Feature Seam, Work Package, Weak Integration, Corroboration, Promotion, Graph Patch, Concern lifecycle, Lane vs Worktree, requested vs effective, safe point vs restore point, historical vs superseded vs revoked, or History vs Ledger into a one-line tooltip. Simple/Expert/ELI5, `/Expert/ELI5`, and `/tooltip` variants use stable canonical terminology, distinguish object vs state vs action, and explain why the state exists from canonical reason codes and evidence rather than panel-local prose.
- Dedicated help-entry candidates include Feature Seam, Work Package, Package Overseer, Seam Overseer, Weak Integration, Promotion, Corroboration, Concern, Graph Patch, Graph Generation, Lane, requested vs effective, History vs Ledger, and historical vs superseded vs revoked vs reopened.
- Contextual help is limited to local button affordances, simple counts or `/badges`, one-surface-only controls whose meaning is obvious from context, and provider-specific caveats shown near the relevant controls; it must not replace the canonical state vocabulary above.
- Runtime recovery copy keeps `safe-point`, `restore-point`, rollback, and contamination distinct across `/storage/UI`; a safe point is an execution recovery anchor, a restore point is user-facing saved-state/recovery vocabulary only where the owning UI/storage contract declares it, rollback is the explicit mutation outcome, and contamination is a governance/storage condition that affects reuse, retry, and promotion eligibility.
- Blocked payload normalization treats legacy `reason_code` and `recovery_options[]` as compatibility inputs while runtime-facing blocked payloads use canonical `blocked_reason_code`, `allowed_action_ids`, and `allowed_action_ids[]`.

## Safety and constraints
- repository creation confirmation is mandatory and non-bypassable
- secrets must not be written to redb, project files, YAML, or evidence
- publish/template-repo flows must redact secrets in logs/evidence
- docs must distinguish DockerHub image distribution from Unraid template distribution
- browser login and PAT must be documented as different inputs that may lead to different effective capability
- the UI must not claim full repository-management support when validation shows only partial capability

## Initial non-goals
The first-class scope above does **not** require initial automation for:
- Community Applications submission-form submission
- forum support-thread creation
- fully automatic remote template-repo push by default
- bypassing manual review for public maintainer metadata correctness

## Acceptance criteria
- The GUI exposes both browser login and PAT entry, with PAT-recommended helper text and clear guidance.
- The GUI shows requested auth mode and effective capability separately.
- DockerHub namespace and repository discovery works from supported auth inputs.
- Missing DockerHub repo creation is guarded by a mandatory non-bypassable confirmation showing namespace, repo name, and privacy.
- New repository creation defaults to private.
- Puppet Master can build and run project containers for testing and provide user-openable access points when available.
- Docker publish results surface digest/tag/registry info without leaking credentials.
- Unraid XML auto-generation/update is enabled by default after successful publish and can be disabled near DockerHub settings.
- Managed Unraid template-repo workflow is enabled by default and can be disabled.
- The default template-repo layout is root `ca_profile.xml` plus maintainer folder plus `project-name.xml`.
- The default maintainer folder source is the DockerHub namespace, but the user can override it.
- `ca_profile.xml` is generated if missing, all fields are editable, shared cross-project scope is default, and per-project override is available.
- Profile images can be either repo-managed uploaded assets or externally hosted URLs; uploaded images default to repo-managed assets.
- Template-repo changes auto-commit by default, do not auto-push by default, and expose a one-click push action in the UI.

## Remote Side-Effect Blocked Payload Normalization (2026-03-09)

The Docker/Unraid remote-side-effect contracts remain the reference pattern for blocked remote mutation and must use canonical runtime payload names.

Required runtime-facing rules:
- remote side effects blocked by confirmation/policy remain `blocked`, not `failed`
- preserve completed local work whenever remote publish/creation steps are blocked
- auth expiry during publish blocks the publish path without discarding the completed local build result
- remote-side-effect approval requirements remain blocked until explicitly resolved
- auth recovery alone does not auto-resubmit or auto-publish a blocked remote side effect; explicit resume/retry remains required
- UI must explain when a local artifact exists but remote publish remains blocked
- runtime-facing blocked payloads MUST use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`
- domain-specific `reason_code` values MAY remain internal detail, but MUST map into canonical runtime taxonomy at shared surfaces

Canonical runtime-facing blocked payload shape:
- `blocked_reason_code`
- ordered `allowed_action_ids[]`
- `preserved_local_work`
- `detail_ref?`

Legacy fields such as `reason_code` and `recovery_options[]` are non-canonical and MUST NOT be copied into new shared runtime contracts.
