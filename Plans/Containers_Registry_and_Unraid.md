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
  - create-repository setting is a default only; actual effect uses Regular protected confirmation or PS-146/147 mode/build authority at the same writer
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
- Docker Manager retains its first-class panel and Settings routes, create-repository default and /clear auth recovery. Remote creation uses the same owner effect with Regular confirmation or typed PS-146 YOLO/PS-147 grant authority, never duplicate publication prompts.

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

Docker Manager route/open adoption follows the shared route contract instead of treating object-bearing shell commands as local layout state. `Plans/UI_Command_Catalog.md` (`/UI_Command_Catalog.md`) may expose `cmd.source_control.select_worktree`, compatibility thread-usage aliases, and `/open` wrappers, but Docker Manager treats those as route-consuming actions only after legacy `cmd.chat.open_thread_usage` / `cmd.chat.focus_thread_usage` callers normalize to `cmd.nav.open_usage_subject` or the Context Detail Pane command family. The canonical `target_kind` enum remains in `Contracts_V0.md` and `Contracts_V0`; destination-local refinements stay outside the enum and outside the base route contract. `cmd.panel.switch` and panel-switch style commands may select the Docker Manager shell only as shell-state; contextual object refs such as `repo_id`, `worktree_id`, `workflow_run_id`, `publish_result_id`, and `k8s_ref` must route through the shared target contract rather than become a hidden panel-switch payload model.

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

If the selected repository is missing, creation is a separate explicit visible effect naming namespace/repository/privacy and private default. It must be needed by the task or exactly selected in the current PS-147 grant.

#### Repository creation confirmation flow

`cmd.docker.create_repository` validates/preflights at its existing owner. In Regular, an unsatisfied create decision emits docker.repository.create.confirmation_requested and uses existing .confirm/.cancel human controls. In task YOLO or an exact approved build grant, typed current authority invokes the same domain creation writer directly and records actual mode/grant provenance; no fake click or model-call to .confirm resolves a protected human wait. No confirmation_requested is emitted unless waiting for a real person. Capability/auth/current target and private-by-default disclosure still apply.

Image-push and repository-create are separately evaluated effects. Regular Push image does not by itself approve a missing create. YOLO/grant authority may admit each needed effect without another human click, under CRAU-104/PS-146/147/148.
### Default repository privacy


- default privacy for newly created repositories: private
- the preview/result and any actual human confirmation make the private default explicit
- the user may change privacy before creation through the reviewed target; task/grant execution cannot silently substitute destination or visibility

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

#### Docker Manager active operation contracts

Registry promotion, drift detection, access intelligence, and project-focused K8s deep linkage are active Docker Manager contract areas. Each one must expose typed operation identity, status/result payloads, preflight and permission outcomes, review/failure fields where applicable, and GUI action derivation from structured payloads. They must not disappear from the Docker Manager contract, be replaced by generic runtime wording, or render as vague planned placeholders.

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
- Missing repository creation remains a separate admitted effect with Regular confirmation or exact PS-146/147 authority, without another ordinary YOLO yes.
- Managed Unraid template push is a separate requested effect with its own target/receipt and Regular or PS-146/147 authority; it never creates a duplicate ordinary YOLO confirmation.
- `docker.publish.failed` means Puppet Master attempted the publish operation and the operation failed at runtime.
- `docker.publish.blocked` means Puppet Master intentionally did not execute the remote side effect because confirmation or permission approval was missing, rejected, or cancelled.

#### Missing-repository interruption and resume contract

If `cmd.orchestrator.push_image` resolves a missing target repository:

1. Preserve the already-built local image/result and evaluate the exact missing-repository create authority.
2. Only an unsatisfied Regular human decision enters awaiting_repo_creation_confirmation and emits docker.repository.create.confirmation_requested; existing Confirm/Cancel remain person controls.
3. Admitted task YOLO or current PS-147 grant calls the same domain creation writer with its true authority kind, not .confirm or human_confirmed=true.
4. Resume the pending push without rebuild only after verified create success. Unknown remote outcomes reconcile before retry, never repeat a speculative create.
5. Cancel/reject/policy/capability refusal emits docker.publish.blocked with the exact blocked_step, canonical reason and ordered allowed_action_ids[], preserving the local image/result. Only the actual missing human decision uses repo_creation_not_confirmed.

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
- after_build selects timing only, and local Build approval remains local.
- At actual publication dispatch, run PS-146/147/148 with exact image/registry/repository/namespace/currentness and actual authority.
- Regular missing approval blocks with exact step and Push image recovery; task YOLO/grant-covered publication does not ask again.
- Repository create and template create/push remain separate evaluated effects and receipts, not additional modals when authority already covers them.
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
- repository creation uses Regular protected confirmation or typed PS-146/147 mode/build authority; protected auth/secrets/trust/target gates still apply
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
- Missing DockerHub repository create shows namespace/repo/privacy and private default; Regular actual human confirm and YOLO/grant authority use the same writer with distinct truthful receipts and no duplicate ordinary yes.
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

## Owner / Consumer Map

This source-preserving standardization keeps the owner and consumer boundaries stated in the original document body. During this batch, `Plans/Containers_Registry_and_Unraid.md` remains the owner doc for the behavior described by its preserved sections, while cross-doc ownership follows the ContractRefs and boundary notes already present in the original text.

ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md

## PlanUnits

### CRAU-002 - Document Scope And Owner Boundaries

```yaml
plan_unit_id: CRAU-002
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containers, Registry, and Unraid Integration is the SSOT for DockerHub
  authentication UX and state, requested-vs-effective Docker auth capability,
  namespace/repository discovery and creation, protected repository creation,
  first-class Docker Manager GUI behavior, Unraid template workflows, and
  ca_profile.xml; it supplies detailed contracts to newtools, FinalGUISpec, and
  Orchestrator_Page without replacing those owner docs.
gui_related: true
gui_classification_reason: The scope names DockerHub authentication UX, first-class Docker management GUI behavior, settings, controls, dialogs, and orchestrator surfaces.
split_recommended: true
split_recommendation_reason: Source spans S0002-S0003 mix canonical scope with owner/consumer routing across runtime, settings, and orchestrator docs.
depends_on: []
unblocks: [CRAU-003, CRAU-004, CRAU-007, CRAU-024]
acceptance_criteria:
  - DockerHub auth UX/state, requested-vs-effective Docker auth, repository management, protected creation, Docker Manager GUI behavior, Unraid workflow, and ca_profile.xml remain individually traceable to this owner doc.
  - Plans/newtools.md, Plans/FinalGUISpec.md, and Plans/Orchestrator_Page.md reference this plan for detailed DockerHub, Docker Manager, and Unraid behavior without re-owning those contracts.
  - Plans/feature-list.md and Plans/GUI_Rebuild_Requirements_Checklist.md register the first-class GUI/runtime scope introduced here.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: containers_registry_unraid_owner_boundaries
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: owner_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0002
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0003
preserved_exact_tokens:
  - "DockerHub authentication UX and state modeling"
  - "Requested vs effective Docker auth capability"
  - "Protected repository-creation rules"
  - "First-class Docker management GUI behavior"
  - "`ca_profile.xml`"
  - "Docker Manage surface requirements"
negative_constraints:
  - "This plan does not replace the existing preview/build/runtime sections in `Plans/newtools.md`, the settings UI in `Plans/FinalGUISpec.md`, or the orchestrator control surface in `Plans/Orchestrator_Page.md`."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/FinalGUISpec.md
  - Plans/Orchestrator_Page.md
```

### CRAU-003 - First-Class Container Workflow Goals

```yaml
plan_unit_id: CRAU-003
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master treats Docker as a first-class workflow: users can authenticate
  through browser login or PAT, build and run containers, inspect running
  containers in-app, publish to DockerHub, safely create missing repositories,
  generate or update Unraid XML after successful publish by default, manage a
  dedicated Unraid template repository by default, keep secrets out of redb,
  project files, and evidence logs, and keep Docker GUI controls contextual.
gui_related: true
gui_classification_reason: The goals include user authentication paths, in-app inspection, publishing workflow, and contextual GUI visibility.
split_recommended: false
depends_on: [CRAU-002]
unblocks: [CRAU-004, CRAU-007, CRAU-025, CRAU-026]
acceptance_criteria:
  - Docker remains a first-class workflow rather than a small extension of generic Preview/Build.
  - Browser login and PAT authentication remain available, with PAT preserved as an explicit durable path.
  - Build, run, publish, missing-repository creation, Unraid XML generation, and managed template-repository handling remain goals of the same feature area.
  - Secrets are not written to redb, project files, or evidence logs.
  - Docker-heavy controls remain contextual instead of permanently cluttering non-container projects.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_regression
reasoning_tier: standard
context_scope: first_class_container_workflow_goals
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: product_goal_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0004
preserved_exact_tokens:
  - "browser-based login"
  - "PAT"
  - "build and run containers"
  - "publish to DockerHub"
  - "automatically generate/update Unraid XML"
  - "managed template-repo handling"
  - "redb"
  - "evidence logs"
negative_constraints:
  - "Docker support must not collapse back into generic Preview/Build-only behavior."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-004 - Containers And Registry Runtime Settings

```yaml
plan_unit_id: CRAU-004
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Settings > Advanced > Containers & Registry exposes Docker runtime controls:
  the runtime selector with docker default, Docker binary path override, compose
  file/path defaults, compose project-name strategy values auto, fixed, and
  hash-based, build context path, Dockerfile path, optional target stage, target
  platforms, and Buildx readiness status.
gui_related: true
gui_classification_reason: This unit defines visible settings controls and status display.
split_recommended: true
split_recommendation_reason: Source span S0006 also contains DockerHub auth, repository, Unraid, visibility, and ca_profile.xml settings split into adjacent units.
depends_on: [CRAU-002, CRAU-003]
unblocks: [CRAU-005, CRAU-006, CRAU-011]
acceptance_criteria:
  - The runtime selector defaults to docker.
  - Docker binary path override, compose defaults, build context path, Dockerfile path, optional target stage, target platforms, and Buildx readiness remain individually addressable.
  - Compose project-name strategy preserves the exact values auto, fixed, and hash-based.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_surface_drift
reasoning_tier: standard
context_scope: containers_registry_runtime_settings
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/newtools.md
node_compile_hint:
  mode: gui_settings_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0006
preserved_exact_tokens:
  - "Settings > Advanced > Containers & Registry"
  - "`docker` default"
  - "`auto`"
  - "`fixed`"
  - "`hash-based`"
  - "Buildx readiness status"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-005 - DockerHub Auth And Repository Settings

```yaml
plan_unit_id: CRAU-005
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: 'DockerHub settings preserve browser-login/PAT distinction, account/namespace/capability validation,
  auth clear/recovery, discovery, create-repository setting, privacy, tag and push defaults. Enabled defaults
  never confer effect authority: Regular uses exact-effect approval; PS-146 YOLO and PS-147 grants use the
  same protected domain writer without repeated publication yes. Private-most visibility and partial-capability
  disclosure remain.'
gui_related: true
gui_classification_reason: DockerHub auth and repository controls are visible settings and action surfaces.
split_recommended: true
split_recommendation_reason: Source span S0006 combines auth controls, repository controls, runtime controls,
  and Unraid/template profile settings.
depends_on:
- CRAU-004
- CRAU-104
- PS-146
- PS-147
unblocks:
- CRAU-026
- CRAU-029
- CRAU-030
- CRAU-031
acceptance_criteria:
- Browser-login and PAT entry controls both remain present.
- Helper text explicitly says PAT is recommended and links or explains how to obtain a PAT.
- Requested auth mode and effective capability are displayed distinctly.
- The settings-level create-repository toggle remains distinct from PS-146/147 effect authority; Regular confirms
  when approval is missing; admitted YOLO or an exact build grant uses the same writer without another ordinary yes.
- Tag template defaults preserve {commit}, {version}, {timestamp}, and future canonical tag variables.
- Push policy preserves manual default and optional after_build.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: auth_capability_misrepresentation
reasoning_tier: high
context_scope: dockerhub_auth_repository_settings
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: gui_settings_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0006
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- browser-login button
- PAT entry field
- PAT is recommended
- '`/clear` auth actions'
- requested auth mode vs effective capability display
- create-repository toggle
- '`{commit}`'
- '`{version}`'
- '`{timestamp}`'
- '`manual` default'
- '`after_build`'
negative_constraints:
- A settings toggle is never remote authority or a human approval receipt.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
- Plans/Permissions_System.md
stale_retired_dispositions:
- '2026-11-03 Y1/O1–O3: current behavior is the replacement canonical_text; superseded source remains lineage
  only. Superseded clause: Containers & Registry settings expose DockerHub browser-login, PAT entry with PAT-recommended
  helper/link text, stored-auth status, account/namespace summary, validation and clear/remove credential actions,
  validate and /clear auth actions, requested auth mode versus effective capability display, namespace/repository
  discovery, refresh, create repository action, a settings-level create-repository toggle distinct from mandatory
  remote confirmation, repository privacy, tag template defaults, and push policy.'
```

### CRAU-006 - Unraid Visibility And Maintainer Profile Settings

```yaml
plan_unit_id: CRAU-006
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containers & Registry settings expose Unraid publishing controls, managed
  template repository controls, Docker Manager visibility controls, and
  maintainer profile ca_profile.xml controls: Generate/Update Unraid XML after
  successful publish is enabled by default, Manage Unraid template repository is
  enabled by default, auto-push is disabled by default, a one-click push action
  remains available, Hide Docker Manager when not used in Project. is the
  canonical visibility setting, the legacy Hide Docker Manage label migrates to
  it, and ca_profile.xml supports shared default scope, per-project overrides,
  full editability, profile image handling, and generated-needs-review notice.
gui_related: true
gui_classification_reason: This unit defines visible settings controls, status rows, labels, toggles, and maintainer profile editing.
split_recommended: true
split_recommendation_reason: Source span S0006 combines multiple settings groups; this unit isolates Unraid, visibility, and ca_profile.xml controls.
depends_on: [CRAU-004, CRAU-005]
unblocks: [CRAU-022, CRAU-031]
acceptance_criteria:
  - Generate/Update Unraid XML after successful publish defaults enabled.
  - Manage Unraid template repository defaults enabled.
  - Auto-push defaults disabled while a one-click push action is surfaced nearby.
  - Template repo status row preserves configured, missing, dirty, committed, and ready-to-push states.
  - The exact setting name Hide Docker Manager when not used in Project. is canonical.
  - The legacy setting alias Hide Docker Manage when not used in Project. migrates to the canonical Docker Manager label and is not a separate surface.
  - ca_profile.xml supports shared cross-project default, per-project override, all fields, upload/select or URL image handling, and generated-needs-review notice.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: alias_or_default_drift
reasoning_tier: high
context_scope: unraid_visibility_maintainer_profile_settings
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: gui_settings_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0006
preserved_exact_tokens:
  - "`Generate/Update Unraid XML after successful publish`"
  - "`Manage Unraid template repository`"
  - "auto-push toggle (default: disabled)"
  - "`Hide Docker Manager when not used in Project.`"
  - "`Hide Docker Manage when not used in Project.`"
  - "`ca_profile.xml`"
compatibility_only_notes:
  - "The legacy Hide Docker Manage setting alias migrates to the canonical Docker Manager label and is not a separate surface."
negative_constraints:
  - "The legacy setting alias must not create a second Docker Manage settings surface."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-007 - Docker Manager Surface Identity And Subviews

```yaml
plan_unit_id: CRAU-007
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The canonical user-facing surface is Docker Manager. It replaces Docker Manage
  as the canonical surface name, subsumes Publish / Unraid behavior, and keeps
  stable subviews for Containers, Images, Compose, Registries, Registries /
  Docker Hub, Build / Bake, Publish / Unraid, Publishing / Unraid as a
  legacy/source-lineage alias, advanced Networks, Volumes, Contexts, and
  project-focused Kubernetes.
gui_related: true
gui_classification_reason: Docker Manager and its subviews are user-facing GUI surfaces and navigation contracts.
split_recommended: true
split_recommendation_reason: Source span S0007 also defines surface rules, minima, and design-reference baseline split into CRAU-008.
depends_on: [CRAU-002, CRAU-003]
unblocks: [CRAU-008, CRAU-009, CRAU-022]
acceptance_criteria:
  - Docker Manager remains the canonical surface name.
  - Docker Manage remains only the replaced legacy/source-lineage name.
  - Publish / Unraid is subsumed inside Docker Manager.
  - All stable subviews and advanced foldouts remain named and routeable.
  - Publishing / Unraid remains a legacy/source-lineage alias normalized to Publish / Unraid.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: surface_fragmentation
reasoning_tier: high
context_scope: docker_manager_surface_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/storage-plan.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: gui_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0007
preserved_exact_tokens:
  - "Docker Manager"
  - "`Docker Manage`"
  - "`Containers`"
  - "`Images`"
  - "`Compose`"
  - "`Registries`"
  - "`Registries / Docker Hub`"
  - "`Build / Bake`"
  - "`Publish / Unraid`"
  - "`Publishing / Unraid`"
  - "`Networks`"
  - "`Volumes`"
  - "`Contexts`"
  - "`Kubernetes`"
compatibility_only_notes:
  - "`Publishing / Unraid` is a legacy/source-lineage alias normalized to `Publish / Unraid`."
negative_constraints:
  - "Docker Manage must not remain a separate canonical surface."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-008 - Docker Manager Surface Rules And Management Baseline

```yaml
plan_unit_id: CRAU-008
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager keeps Docker as the default visible runtime mode for
  Docker-related projects, treats Podman as an alternate runtime in the same
  surface, exposes Kubernetes as a conditional subview, keeps Unraid under
  Publish / Unraid, treats Docker Hub as one registry/provider capability, and
  must not split build, bake, compose, run, inspect, logs, publish, pull,
  Registries / Docker Hub, or Publishing / Unraid into unrelated mini-surfaces;
  its management baseline follows microsoft/vscode-containers, while
  docker/vscode-extension remains a Docker DX/build-debugging reference.
gui_related: true
gui_classification_reason: Surface rules, subview minima, and management baseline govern visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source span S0007 is split between surface identity and detailed surface rule/baseline behavior.
depends_on: [CRAU-007]
unblocks: [CRAU-009, CRAU-011, CRAU-012, CRAU-013, CRAU-014]
acceptance_criteria:
  - Docker is default visible runtime mode when the project is Docker-related.
  - Podman remains inside the same Docker Manager surface.
  - Kubernetes is a subview when manifests, Helm artifacts, kube-linked state, or explicit enablement are present.
  - Unraid remains under Publish / Unraid and does not require a separate top-level panel.
  - Docker Hub is one registry/provider capability inside Docker Manager.
  - Build, bake, compose, run, inspect, logs, publish, pull, Registries / Docker Hub, and Publishing / Unraid do not split into unrelated mini-surfaces.
  - microsoft/vscode-containers is the richer day-to-day management baseline and docker/vscode-extension is the Docker DX/build-debugging reference.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: mini_surface_drift
reasoning_tier: high
context_scope: docker_manager_surface_rules
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Crosswalk.md
  - Plans/Permissions_System.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: gui_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0007
preserved_exact_tokens:
  - "Podman"
  - "Docker Hub"
  - "mini-surfaces"
  - "`docker/vscode-extension`"
  - "`/vscode-extension`"
  - "`microsoft/vscode-containers`"
  - "`/vscode-containers`"
negative_constraints:
  - "Docker Manager must not split build, bake, compose, run, inspect, logs, publish, pull, `Registries / Docker Hub`, or `Publishing / Unraid` into unrelated mini-surfaces."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-009 - Unified Asset Explorer And Panel State

```yaml
plan_unit_id: CRAU-009
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager owns the unified asset explorer: it keeps stable subviews for
  images, compose, registries, and build-bake, advanced foldouts for contexts,
  networks, volumes, and project-focused Kubernetes, project-aware ordering,
  cached /last-known read-only rendering with stale markers, disabled reasons,
  and per-project persisted selected runtime, context, subview, grouping, /sort,
  foldout policy, hidden foldouts, and exact asset row/subview state.
gui_related: true
gui_classification_reason: The unified asset explorer, subviews, cached stale rendering, disabled reasons, and row reopen behavior are visible GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0008 combines explorer GUI state, storage/event boundaries, build/compose, registry, publish, Kubernetes, receipts, routes, and blocked-state behavior.
depends_on: [CRAU-007, CRAU-008]
unblocks: [CRAU-010, CRAU-011, CRAU-013, CRAU-014, CRAU-019]
acceptance_criteria:
  - Preview, build, publish, deploy, and blocked-card flows reopen the exact relevant row/subview instead of a generic push-only pane.
  - Runtime-unavailable state renders cached /last-known state with a stale marker and read-only posture.
  - Unsupported runtime-specific subviews hide only when truly unavailable; otherwise they remain visible with disabled reason.
  - Strong default filtering and project awareness keep the broad surface usable while project-aware ordering pushes likely-relevant assets to the top without hiding the rest.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: reopen_state_loss
reasoning_tier: high
context_scope: docker_manager_asset_explorer_state
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_state_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "unified asset explorer"
  - "`/images/compose/registries/build-bake`"
  - "`/sort`"
  - "`/last-known`"
  - "`likely-relevant`"
negative_constraints:
  - "Blocked-card flows must not land in a generic push-only pane when a precise asset row/subview is known."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-010 - Explorer Event And Runtime Observation Boundary

```yaml
plan_unit_id: CRAU-010
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager explorer events use /events/storage and /event/storage to
  record only panel state, selected asset identity, and freshness; transient
  runtime observations stay in the runtime projection store and do not become
  canonical persisted product truth.
gui_related: false
gui_classification_reason: This unit defines storage/event ownership and runtime projection boundaries rather than visible layout.
split_recommended: true
split_recommendation_reason: Source span S0008 interleaves GUI state with storage/event semantics.
depends_on: [CRAU-009]
unblocks: [CRAU-019]
acceptance_criteria:
  - Explorer storage records panel state, selected asset identity, and freshness only.
  - Transient runtime observations are not persisted as canonical state.
  - Runtime projection store remains the owner for transient runtime observations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_truth_drift
reasoning_tier: high
context_scope: docker_manager_event_storage_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: storage_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`/events/storage`"
  - "`/event/storage`"
  - "runtime projection store"
negative_constraints:
  - "Transient runtime observations must not become canonical stored product truth through explorer event storage."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-011 - Build Bake And Compose Scenario Contracts

```yaml
plan_unit_id: CRAU-011
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager build and compose surfaces infer reviewable Dockerfile, build
  context, compose file, Bake target, platform, and runtime context for the
  active project, expose cmd.docker.build.*, cmd.docker.bake, cmd.docker.bake.*,
  and preview commands, persist build target and readiness settings, prompt
  instead of guessing in ambiguous monorepos, and let Compose scenarios save and
  rerun named service subsets, profiles, env files, port mappings, validation
  state, stale repair actions, and cmd.docker.compose.scenario.save/run/edit/delete.
gui_related: true
gui_classification_reason: Build/Bake controls, smart CTA cards, Compose scenario UI, validation errors, and repair actions are visible workflow surfaces.
split_recommended: true
split_recommendation_reason: Source span S0008 combines build/bake and compose behavior with other Docker Manager contracts.
depends_on: [CRAU-009, CRAU-010]
unblocks: [CRAU-012, CRAU-013]
acceptance_criteria:
  - Build/Bake defaults remain reviewable and overrideable.
  - build_run and /push_image resolve to the selected compose or bake target instead of rebuilding from a guessed default.
  - Ambiguous polyglot or monorepo inference prompts explicit selection.
  - Compose scenarios persist named service subsets, profiles, env files, port mappings, detached/log-follow defaults, ports, and validation state.
  - Stale Compose scenarios open degraded with validation errors and repair actions.
  - Run/edit/delete affordances remain disabled with exact reason codes until validation succeeds.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: heuristic_misfire
reasoning_tier: high
context_scope: build_bake_compose_scenario_contracts
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: build_compose_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`Build / Bake`"
  - "`cmd.docker.build.*`"
  - "`cmd.docker.bake`"
  - "`cmd.docker.bake.*`"
  - "`build_run`"
  - "`/push_image`"
  - "`cmd.docker.compose.scenario.save/run/edit/delete`"
  - "`cmd.docker.compose.scenario.save`"
  - "`/run/edit/delete`"
negative_constraints:
  - "Docker Manager must prompt for explicit selection instead of guessing when inference is ambiguous in a polyglot or monorepo project."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-012 - Registry Promotion And Publish Chain Lineage

```yaml
plan_unit_id: CRAU-012
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry promotion treats /tag/push and /push/promote as explicit release
  actions with digest-first receipts, source artifact identity, promotion
  target, destination registry allowlist, default namespace/repository/tag
  template, policy, privacy, immutability expectations, Docker-Hub-first MVP
  behavior, and later registry API abstraction; Publish chain view shows local
  build result, pushed tag and /digest, Docker Hub repo state, Unraid/template
  follow-ons, /publish/events, and downstream deployment or workload refs.
gui_related: true
gui_classification_reason: Promotion controls, publish chain view, chain nodes, blocked cards, and receipt links are visible Docker Manager surfaces.
split_recommended: true
split_recommendation_reason: Source span S0008 interleaves promotion, publish chain, and other operational cockpit contracts.
depends_on: [CRAU-009, CRAU-011]
unblocks: [CRAU-015, CRAU-021, CRAU-031]
acceptance_criteria:
  - Tag/push and push/promote are explicit release actions rather than ad hoc retagging.
  - Promotion receipts capture moved digest, tag, source namespace/repository, destination namespace/repository, actor, approval source, and result id before downstream deployment references update.
  - Local image actions remain usable when destination registry or repository is unavailable, while promotion is blocked with a precise remote blocker.
  - Publish chain nodes record build_result_id, publish_result_id, template repository status, deployment/workload refs, result state, expanded nodes, historical toggle, follow-latest default, and not-attempted/blocked/failed/complete state.
  - Digest-first identity prevents retags from corrupting lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: side_effect_lineage_loss
reasoning_tier: high
context_scope: registry_promotion_publish_chain_lineage
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: remote_side_effect_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`/tag/push`"
  - "`/push/promote`"
  - "`/target`"
  - "`/immutability`"
  - "`MVP`"
  - "`APIs`"
  - "`/digest`"
  - "`/publish/events`"
  - "`missing-link`"
negative_constraints:
  - "Downstream deployment references must not update before digest-first promotion lineage is captured."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-013 - Container Access Drift And Cleanup Safeguards

```yaml
plan_unit_id: CRAU-013
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager container rows and detail drawers expose
  cmd.docker.container.open, logs, shell attach, stats, inspect, URL candidates,
  manual override, and confidence state; drift detection compares Dockerfile,
  compose/bake intent, Kubernetes manifests, build metadata, last-published
  metadata, and last deployed state with unknown/partial evidence; cleanup
  advisor starts with dry-run estimates and never suggests deleting assets tied
  to active previews or recent receipts when the reference graph is partial.
gui_related: true
gui_classification_reason: Container row actions, URL candidates, warnings, compare actions, and cleanup advisor are user-visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source span S0008 combines container access, drift, cleanup, and other cockpit contracts.
depends_on: [CRAU-009, CRAU-011]
unblocks: [CRAU-021]
acceptance_criteria:
  - Open running container and /open-container resolve only when a real container or preview session exists.
  - port-open, auto-follow, and auto-open are suggestions rather than silent actions.
  - Uncertain access heuristics show candidate actions or logs/inspect first.
  - Prior artifact metadata missing produces unknown rather than clean drift.
  - Weak drift warnings show the weak evidence behind the warning.
  - Cleanup recommendations default conservative when the reference graph is partial.
  - Destructive cleanup remains guarded by shared blocked-state rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: destructive_or_misleading_runtime_action
reasoning_tier: high
context_scope: container_access_drift_cleanup_safeguards
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: runtime_gui_guardrail
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`cmd.docker.container.open`"
  - "`Open running container`"
  - "`/open-container`"
  - "`port-open`"
  - "`auto-follow`"
  - "`auto-open`"
  - "`/compose/bake`"
  - "`last-published`"
  - "`/ignore-files`"
  - "`ignore-labels`"
  - "`/prune`"
negative_constraints:
  - "Docker Manager must not silently open guessed URLs or recommend deleting assets still tied to active previews or recent receipts."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-014 - Project-Focused Kubernetes Operations

```yaml
plan_unit_id: CRAU-014
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager keeps Kubernetes project-focused rather than acting as a
  general cluster admin console: it preserves kubeconfig/context,
  namespace/workload focus, log viewer defaults, watch toggles, Helm visibility,
  Helm release focus, persisted K8s focus state, cluster-wide default off, and
  command coverage under cmd.docker.k8s.* with older cmd.k8s.* compatibility
  aliases normalized to the Docker Manager namespace.
gui_related: true
gui_classification_reason: Kubernetes subview focus, setup guidance, toggles, command coverage, and troubleshooting surfaces are GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0008 includes Kubernetes operations with other Docker Manager cockpit contracts.
depends_on: [CRAU-007, CRAU-009]
unblocks: [CRAU-015, CRAU-022]
acceptance_criteria:
  - Docker Manager's Kubernetes view defaults to the project-focused subset.
  - Full cluster inventory requires the explicit cluster-wide toggle and remains visually distinct from project scope.
  - Missing kubectl, kubeconfig, or cluster access leaves the subview visible with setup guidance and explicit connection state.
  - Deploy, rollout/apply, apply/rollout, log, exec, port_forward, Helm, and troubleshoot failures open directly to project-relevant workload status, logs, or diff.
  - Logs, rollout status, port-forward, and rollout monitors are ephemeral owner-surface sessions, not durable always-on connections.
  - Browser handoff is reserved for external registry, admin, or admin/help edge cases, not default local-runtime or Kubernetes operations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cluster_scope_creep
reasoning_tier: high
context_scope: project_focused_kubernetes_operations
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/Permissions_System.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: k8s_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace`"
  - "`cmd.docker.k8s.apply|diff|logs|exec|port_forward|set_context|set_namespace|helm_preview|helm_install`"
  - "`cmd.docker.k8s.apply`"
  - "`cmd.k8s.*`"
  - "`cluster-wide`"
  - "`/attempt/action`"
negative_constraints:
  - "Docker Manager must not become a general cluster admin console or make full cluster inventory default."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-015 - Receipts Routes Blocked State And Governance

```yaml
plan_unit_id: CRAU-015
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager receipts, route/open handling, blocked-state integration,
  confirmation taxonomy, policy-blocked outcomes, registry/tag governance, and
  protected environment flows use shared contracts: receipts are compact UI
  objects derived from canonical run, publish, and event records; object-bearing
  navigation uses shared route targets instead of hidden panel-switch payloads;
  hard-gated remote-side-effect actions enter canonical approval or blocked
  flows; disabled controls expose reason, CTA, and Explain this state; and
  policy revalidation preserves exact remediation semantics.
gui_related: true
gui_classification_reason: Receipts, routes, disabled controls, blocked banners, CTAs, and Explain this state are user-visible interaction contracts.
split_recommended: true
split_recommendation_reason: Source span S0008 mixes GUI presentation with backend approval, policy, route, and receipt semantics; further splitting could duplicate tightly-coupled blocked-state invariants.
depends_on: [CRAU-009, CRAU-012, CRAU-014]
unblocks: [CRAU-021, CRAU-031]
acceptance_criteria:
  - Receipts record requested action, effective action, actor, targets, result ids, allowed action ids, approval source, executing subsystem, and source event ids.
  - Route/open adoption uses the shared target contract rather than treating object-bearing shell commands as local layout state.
  - cmd.panel.switch and panel-switch style commands select Docker Manager only as shell-state.
  - Hard-gated Docker, Unraid, and Kubernetes remote side effects enter canonical approval or blocked flow rather than generic UI confirmation.
  - Disabled controls remain explainable with exact blocking condition, missing capability, degraded reason, reason code, last validation time, and primary recovery CTA when one exists.
  - Policy, immutable-tag, protected-environment, and destination-policy violations preserve namespace/repository/tag or environment context and remediation pivots.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: policy_bypass_or_route_drift
reasoning_tier: high
context_scope: receipts_routes_blocked_state_governance
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/GitHub_Integration.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: blocked_state_readiness
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0008
preserved_exact_tokens:
  - "`allowed_action_ids[]`"
  - "`hard_gate`"
  - "`/blocked`"
  - "`Explain this state`"
  - "`target_kind`"
  - "`cmd.panel.switch`"
  - "`route-activation`"
  - "`reason_code`"
  - "`/receipts`"
negative_constraints:
  - "Docker Manager panels must not add one-off local recovery actions that drift from the shared blocked contract."
  - "Object-bearing targeting must route through the shared route/open target contract instead of extending panel-switch args."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
```

### CRAU-016 - Repo Root And Deep-Link Identity

```yaml
plan_unit_id: CRAU-016
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker and Kubernetes detection, panel state, restore behavior, repo
  selection, GitHub binding, manifest-source versus image-source references, and
  deep links are repo/root aware: panel state is keyed to repo/root identity,
  restores validate that the repo still exists, chooser state replaces silent
  rebinding, selection precedence is deterministic, hosted bindings use explicit
  remotes, and deep links resolve to normalized route targets rather than raw
  local IDs or one-off URL shapes.
gui_related: false
gui_classification_reason: This unit governs identity, routing, and storage semantics behind visible surfaces.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes backend identity routing with GUI-facing disclosure and row-action behavior split into adjacent units.
depends_on: [CRAU-015]
unblocks: [CRAU-017, CRAU-018, CRAU-019, CRAU-021]
acceptance_criteria:
  - Direct receipt or deep-link target wins repo-selection precedence before explicit panel selection, active run/tier repo, active editor repo, or chooser fallback.
  - Panels disclose whether a repo is pinned or inferred.
  - Hosted GitHub features bind through explicit remotes rather than nearest active repo fallback.
  - Docker/Kubernetes receipts distinguish manifest-source repo from image-source repo.
  - Docker Manager deep-link forms decode into the same internal routing path and must not expose raw local IDs as the routing contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_identity_drift
reasoning_tier: high
context_scope: repo_root_deep_link_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Crosswalk.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: identity_routing_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`repo_id`"
  - "`project_root_id`"
  - "`worktree_id`"
  - "`publish_result_id`"
  - "`k8s_ref`"
  - "`target_object`"
  - "`cmd.docker.open_target`"
negative_constraints:
  - "Docker Manager deep-link handling must not expose raw local IDs as the routing contract."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
```

### CRAU-017 - Runtime And Workload Identity State

```yaml
plan_unit_id: CRAU-017
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager runtime identity is durable and requested-vs-effective:
  k8s_workload_ref, container_id, compose_project, runtime_context, and
  workload_ref survive beyond preview_session_id, use delete/recreate history
  classification, local-runtime blocked/degraded reason codes, receipt
  joinability, and typed extension rules for reason codes.
gui_related: false
gui_classification_reason: Durable runtime and workload identity state is backend routing, history, and storage semantics.
split_recommended: true
split_recommendation_reason: Source span S0009 also contains visible identity disclosure, compatibility, and row-action rules.
depends_on: [CRAU-016]
unblocks: [CRAU-019, CRAU-021]
acceptance_criteria:
  - Kubernetes workload identity is subject-aware and survives delete/recreate by marking stale or historical instead of silently rebinding same-name replacements.
  - Local-runtime reason codes include runtime_context_missing, runtime_context_unreachable, compose_invalid, compose_service_missing, buildx_unavailable, bake_unavailable, image_missing, container_unreachable, port_unbound, auth_expired, registry_unreachable, and project_not_containerized.
  - Unknown/new provider codes extend the typed namespace without becoming free-form UI copy.
  - Runtime identity includes runtime_asset_ref, compose_project_ref, publish_result_id, template_repo_id, and k8s_workload_ref where applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_runtime_rebind
reasoning_tier: high
context_scope: runtime_workload_identity_state
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`k8s_workload_ref`"
  - "`container_id`"
  - "`compose_project`"
  - "`runtime_context`"
  - "`workload_ref`"
  - "`preview_session_id`"
  - "`runtime_asset_ref`"
  - "`compose_project_ref`"
  - "`template_repo_id`"
negative_constraints:
  - "A new Kubernetes object with the same name must not silently become the same workload in history."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-018 - Lane Package Effective Identity Disclosure

```yaml
plan_unit_id: CRAU-018
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager mirrors lane/package requested-versus-effective identity for
  account, provider, model, persona, runtime, and worker policy, records override
  source, selection_reason, switch and clamped history, and exposes user-facing
  grammar for Requested account, Requested binding, Effective account, and Switch
  reason so runtime identity divergence is visible.
gui_related: true
gui_classification_reason: The unit defines user-visible identity grammar, disclosures, and switch reason presentation.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes backend identity fields with GUI disclosure rules.
depends_on: [CRAU-016, CRAU-017]
unblocks: [CRAU-020, CRAU-021]
acceptance_criteria:
  - UI disclosure does not stop at persona, platform, or model when runtime identity diverges.
  - requested_account_binding, effective_account_binding, provider_instance_id, model_id, persona_id, runtime_target_id, worker_pool_policy, override source, selection_reason, and switch/clamped history remain available to Docker Manager projections.
  - Docker Manager uses the exact grammar Requested account, Requested binding, Effective account, and Switch reason.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_visibility_gap
reasoning_tier: high
context_scope: lane_package_effective_identity_disclosure
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Multi-Account.md
  - Plans/Personas.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: identity_disclosure_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`requested_account_binding`"
  - "`effective_account_binding`"
  - "`provider_instance_id`"
  - "`model_id`"
  - "`persona_id`"
  - "`runtime_target_id`"
  - "`worker_pool_policy`"
  - "`selection_reason`"
  - "`Requested account`"
  - "`Requested binding`"
  - "`Effective account`"
  - "`Switch reason`"
negative_constraints:
  - "Docker Manager UI must not hide runtime identity divergence behind persona/platform/model-only labels."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-019 - Project State And Projection Truth Boundary

```yaml
plan_unit_id: CRAU-019
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager project state preserves runtime asset, publish result, template
  repository, Kubernetes operation refs, compose scenarios, drift baselines,
  cleanup preferences, requested/effective runtime/build/compose/registry/K8s
  capability fields, and receipt joins under
  container_manager.project_state.{project_id}; dashboard, orchestrator, Docker
  Manager page and widget presentation, and source-control summaries are
  projections over canonical runtime facts, not separate truths.
gui_related: false
gui_classification_reason: This unit governs project-state storage, canonical fact ownership, and projection boundaries.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes storage projection semantics with GUI identity disclosure and row actions.
depends_on: [CRAU-010, CRAU-016, CRAU-017]
unblocks: [CRAU-020, CRAU-022, CRAU-025]
acceptance_criteria:
  - container_manager.project_state.{project_id} remains the canonical project key for Docker Manager project state.
  - Project state stores durable reopen targets and comparison baselines, not transient runtime observations.
  - Persisted projection objects include project, run, feature_seam, work_package, node, attempt, lane, snapshot, promotion, review, resolution_thread, and event.
  - Dashboard, orchestrator, Docker Manager /page, widget presentation, and source-control summaries project from canonical runtime facts instead of becoming separate truth sources.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: duplicate_truth_drift
reasoning_tier: high
context_scope: docker_manager_project_state_projection_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: storage_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`container_manager.project_state.{project_id}`"
  - "`requested_runtime`"
  - "`effective_runtime`"
  - "`requested_registry_capability`"
  - "`effective_registry_capability`"
  - "`runtime_fact_ref`"
  - "`projection freshness`"
negative_constraints:
  - "Projected dashboard, orchestrator, Docker Manager, widget, and source-control summaries must not become separate truths."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-020 - Compatibility Labels And Remote-First Boundaries

```yaml
plan_unit_id: CRAU-020
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager consumes package/lane state without reviving tier-era ownership:
  labels such as Tiers, Phase/Task/Subtask, singular Overseer, /Task/Subtask,
  requested_persona_id, and effective_persona_id are compatibility/source
  lineage only; remote-capable Docker, Kubernetes, registry, and template-repo
  surfaces preserve read-only/offline, degraded/offline, fallback/index,
  reveal, one-bounded-auto-retry, and owner-surface handoff boundaries without
  re-owning file, editor, browser, LSP, search, or language-detection behavior.
gui_related: true
gui_classification_reason: Compatibility labels, read-only/degraded disclosures, fallback/reveal links, and browser-hosting boundaries are user-visible cross-surface behavior.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes compatibility boundary rules with project state and row-action semantics.
depends_on: [CRAU-018, CRAU-019]
unblocks: [CRAU-021, CRAU-022]
acceptance_criteria:
  - Tiers, Phase/Task/Subtask, singular Overseer, Task/Subtask, requested_persona_id, and effective_persona_id remain migration/source-lineage labels only.
  - Docker Manager consumes package/lane state rather than reviving tier-era ownership.
  - Remote-capable surfaces preserve /read-only/offline, /degraded/offline, /fallback/index, /reveal, and one-bounded-auto-retry behavior.
  - Docker Manager does not become the remote owner for file, editor, browser, LSP, search, or language-detection behavior.
  - Bottom-panel-primary browser hosting is not reintroduced where editor-tab-first browser model is the owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_architecture_revival
reasoning_tier: high
context_scope: compatibility_labels_remote_first_boundaries
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: compatibility_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`Tiers`"
  - "`Phase/Task/Subtask`"
  - "`Overseer`"
  - "`/Task/Subtask`"
  - "`requested_persona_id`"
  - "`effective_persona_id`"
  - "`/read-only/offline`"
  - "`/degraded/offline`"
  - "`/fallback/index`"
  - "`/reveal`"
compatibility_only_notes:
  - "Tier-era labels and requested/effective persona fields are compatibility/source-lineage labels, not new Docker Manager ownership keys."
negative_constraints:
  - "Docker Manager must not re-own file, editor, /browser/LSP/search, or language-detection behavior."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-021 - Identity Drift Indeterminate Outcomes And Row Actions

```yaml
plan_unit_id: CRAU-021
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager handles runtime and remote identity drift, indeterminate remote
  outcomes, capability-level degradation, active-run ownership, and row actions
  explicitly: stale or unowned state revalidates before publish or promotion,
  remote mutations can report indeterminate_remote_outcome with refresh/reconcile
  CTA, local capabilities remain usable during remote outages, active owned
  targets block or require explicit override/forked control, and row actions
  distinguish local versus remote host, writable versus read-only/degraded,
  single versus multi-select, and exact disabled reasons while excluding
  system_default from the canonical MVP target enum.
gui_related: true
gui_classification_reason: Drift warnings, refresh CTAs, degradation states, active-run blockers, and row disabled reasons are user-visible controls.
split_recommended: true
split_recommendation_reason: Source span S0009 mixes GUI row behavior with backend identity and remote side-effect semantics.
depends_on: [CRAU-016, CRAU-017, CRAU-018, CRAU-020]
unblocks: [CRAU-022, CRAU-031]
acceptance_criteria:
  - Active Docker identity changes mark stale_unowned or equivalent state and revalidate before publish or promotion.
  - indeterminate_remote_outcome receipts record requested, transport_lost, later reconciled, and a Refresh remote state CTA.
  - Degradation is capability-level rather than blanket disabled state.
  - Manual mutation of owned worktrees, preview containers, or rollout-associated workloads blocks, requires explicit override, or forks control explicitly, with receipts.
  - Row actions preserve exact disabled-state reasons and keep Download / Save Local Copy available when source access is readable even if remote/project FS writes are blocked.
  - system_default is not part of the canonical MVP target enum for this surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unsafe_remote_mutation
reasoning_tier: high
context_scope: identity_drift_indeterminate_outcomes_row_actions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: remote_safety_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0009
preserved_exact_tokens:
  - "`stale_unowned`"
  - "`hard-refresh`"
  - "`indeterminate_remote_outcome`"
  - "`transport_lost`"
  - "`Refresh remote state`"
  - "`owned_by_run`"
  - "`Download / Save Local Copy`"
  - "`Open in Terminal`"
  - "`system_default`"
negative_constraints:
  - "Manual mutation of active-run-owned targets must not proceed silently."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-022 - Lifecycle Detection And Legacy Navigation

```yaml
plan_unit_id: CRAU-022
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager visibility uses broad container-related detection, not
  Dockerfile/Compose only: Dockerfile, Compose file, container build/publish
  settings, managed Unraid template repo, Kubernetes manifests, Helm chart
  files, persisted Kubernetes context/namespace/workload state, and prior
  deploy/apply/port-forward receipts count; detection states are detected,
  manually_enabled, and not_detected; Helm-only and manifest-only projects still
  surface Docker Manager; Unraid is not a separate shell panel; Docker Manage,
  docker_manage_surface_state, legacy panel IDs, and separate UNRAID panel/icon
  concepts migrate to Docker Manager > Publish / Unraid.
gui_related: true
gui_classification_reason: Visibility, shell occupancy, panel naming migration, and first-open navigation are visible GUI contracts.
split_recommended: true
split_recommendation_reason: Source span S0010 also includes registry lifecycle, command families, first-open cards, and help terminology split into CRAU-023.
depends_on: [CRAU-007, CRAU-019, CRAU-020, CRAU-021]
unblocks: [CRAU-023, CRAU-025]
acceptance_criteria:
  - Hide Docker Manager when not used in Project. evaluates broad container-related detection.
  - Compose, Kubernetes, and Helm/persisted aliases map to the same detection inputs.
  - Kubernetes subview is auto-visible when manifests, Helm artifacts, persisted cluster state, or Kubernetes receipts exist, and manually unhideable otherwise.
  - There is one shell occupant for container, runtime/deploy, local-runtime, and Kubernetes management.
  - Unraid remains Publish / Unraid inside Docker Manager; separate Unraid shell occupancy is retired.
  - Docker Manage copy, docker_manage_surface_state, and legacy panel IDs migrate to Docker Manager without creating another owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: detection_or_legacy_nav_drift
reasoning_tier: high
context_scope: lifecycle_detection_legacy_navigation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: lifecycle_navigation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0010
preserved_exact_tokens:
  - "`container-related`"
  - "`Compose file`"
  - "`/Compose`"
  - "`/Kubernetes`"
  - "`/Helm/persisted`"
  - "`detected`"
  - "`manually_enabled`"
  - "`not_detected`"
  - "`Docker Manage`"
  - "`docker_manage_surface_state`"
  - "`UNRAID`"
compatibility_only_notes:
  - "Docker Manage copy and legacy panel IDs migrate to Docker Manager; separate UNRAID panel/icon is retired."
negative_constraints:
  - "`Unraid` is not a separate first-class shell panel in the rewrite."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-023 - Registry Lifecycle Command Families And Help Terms

```yaml
plan_unit_id: CRAU-023
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry object lifecycle is digest-first and not name-based; registry refs
  support active, renamed, deleted, private_inaccessible, and historical_only,
  old receipts never silently rewrite to the currently selected repository,
  Docker internals split CLI runtime control, provider-specific registry APIs,
  and Puppet Master additions, Docker Manager command families cover runtime,
  container, image, compose, context, registry, build, bake, publish, unraid, and
  kubernetes, and first-open disclosure cards plus GUI help, tooltip, and
  Expert/ELI5 derivations use canonical terminology routed through Glossary,
  Crosswalk, Decision Policy, 00-plans-index, and plans-index ownership.
gui_related: true
gui_classification_reason: Registry history, disabled/degraded controls, first-open cards, help, tooltips, and ELI5/Expert derivations are visible behavior.
split_recommended: true
split_recommendation_reason: Source span S0010 mixes registry lifecycle and help terminology with lifecycle/legacy navigation split into CRAU-022.
depends_on: [CRAU-022]
unblocks: [CRAU-030, CRAU-031]
acceptance_criteria:
  - Historical publish/image receipts prefer immutable digest over mutable tag when digest exists.
  - Retargeted or deleted tags show historical digest and mark tag stale/missing.
  - Existing Docker Hub / Unraid commands remain specialized members of broader Docker Manager families.
  - Disabled/degraded Docker and Kubernetes controls bind to canonical reason code, requested capability, effective capability/state, and recommended next action.
  - First-open disclosure cards explain Containers, Publish / Unraid, and Kubernetes boundaries before mutation.
  - Help text does not flatten canonical terms into one-line substitutions that erase distinctions or reasons.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_or_term_drift
reasoning_tier: high
context_scope: registry_lifecycle_command_help_terms
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: command_help_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0010
preserved_exact_tokens:
  - "`active`"
  - "`renamed`"
  - "`deleted`"
  - "`private_inaccessible`"
  - "`historical_only`"
  - "`/Compose/Buildx`"
  - "`/privacy`"
  - "`/promote/pull/retag`"
  - "`/tooltip`"
  - "`/Expert/ELI5`"
  - "`safe-point`"
  - "`restore-point`"
negative_constraints:
  - "Old receipts must never silently rewrite to the currently selected repository."
  - "Help text must not flatten canonical state vocabulary into one-line substitutions that erase object/state/action distinctions."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
```

### CRAU-024 - Orchestrator Dashboard Integration Owner Split

```yaml
plan_unit_id: CRAU-024
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker-related actions remain available from orchestrator and dashboard
  build/preview surfaces when a Docker-related run is active; Docker Manager
  complements rather than replaces orchestrator controls, owns DockerHub
  repository, auth, push-policy, and /auth/push blocked-state evidence, Source
  Control owns AI commit-message generation, GitHub /Actions owns workflow runs
  and Manage Secrets, and PuppetMasterDashComp.html remains source lineage only
  rather than a new canonical owner.
gui_related: false
gui_classification_reason: This unit defines cross-surface ownership and evidence routing rather than a new visual layout.
split_recommended: false
depends_on: [CRAU-002, CRAU-012, CRAU-015]
unblocks: []
acceptance_criteria:
  - Orchestrator/dashboard build and preview surfaces keep Docker-related actions for active Docker-related runs.
  - Docker Manager is a richer management layer and not a replacement for orchestrator controls.
  - Docker Manager owns DockerHub repository/auth/push policy settings and auth/push blocked-state evidence.
  - Source Control owns AI commit-message generation.
  - GitHub /Actions owns workflow runs and Manage Secrets action.
  - PuppetMasterDashComp.html remains source-lineage evidence and does not create a combined canonical owner.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cross_surface_owner_drift
reasoning_tier: high
context_scope: orchestrator_dashboard_docker_owner_split
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: owner_split_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0011
preserved_exact_tokens:
  - "`/auth/push`"
  - "`Manage Secrets`"
  - "`PuppetMasterDashComp.html`"
negative_constraints:
  - "Source-lineage references such as PuppetMasterDashComp.html do not create a new canonical owner."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
```

### CRAU-025 - Docker Project Detection Rules

```yaml
plan_unit_id: CRAU-025
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  A project is Docker-related when Puppet Master detects Dockerfile, compose
  configuration, container-based preview/build target, configured container
  publish settings, or an associated managed Unraid template repository; positive
  detection shows Docker Manager, enables DockerHub repository, preview, publish,
  and Unraid actions, and retains last-used Docker surface state, while negative
  detection with Hide Docker Manager when not used in Project. enabled hides the
  surface from normal navigation but retains settings and state.
gui_related: false
gui_classification_reason: The span is classified as detection/routing state even though it has visible consumers.
split_recommended: false
depends_on: [CRAU-022]
unblocks: [CRAU-030, CRAU-031]
acceptance_criteria:
  - Dockerfile, compose configuration, container preview/build targets, configured publish settings, and managed Unraid template repository association count as Docker-related detection inputs.
  - Positive detection shows Docker Manager, enables DockerHub repository, preview, publish, and Unraid template actions, and retains last-used Docker surface state.
  - Negative detection with Hide Docker Manager when not used in Project. enabled hides Docker Manager from normal project navigation.
  - Negative detection retains settings and state and does not foreground Docker workflows.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: detection_false_negative
reasoning_tier: standard
context_scope: docker_project_detection_rules
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: detection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0012
preserved_exact_tokens:
  - "`Dockerfile`"
  - "compose configuration"
  - "`Hide Docker Manager when not used in Project.`"
negative_constraints:
  - "Hidden navigation must not delete Docker settings or state."
consumer_hints:
  - Docker Manager GUI visibility consumes this backend detection state.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-026 - DockerHub Authentication Inputs UX

```yaml
plan_unit_id: CRAU-026
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  DockerHub authentication supports both browser/device login and Personal
  Access Token input: browser/device login launches from the GUI for guided
  interactive sign-in, PAT entry is explicit, helper text says PAT is
  recommended, helper text explains where and how to obtain a PAT, and PAT
  support remains mandatory even though browser login is supported.
gui_related: true
gui_classification_reason: Browser login, PAT entry, and helper text are visible authentication UX.
split_recommended: false
depends_on: [CRAU-005]
unblocks: [CRAU-027, CRAU-028, CRAU-029]
acceptance_criteria:
  - Browser/device login remains supported.
  - PAT entry remains supported and mandatory.
  - PAT helper text explicitly says PAT is recommended.
  - PAT helper text explains where and how the user can obtain a PAT.
  - Browser login support does not remove the explicit durable advanced-user PAT path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_path_regression
reasoning_tier: standard
context_scope: dockerhub_authentication_inputs_ux
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: auth_gui_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0014
preserved_exact_tokens:
  - "Browser/device login"
  - "Personal Access Token (PAT)"
  - "PAT is recommended"
negative_constraints:
  - "PAT support remains mandatory even though browser login is supported."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-027 - Browser Login Events And Auth Expiry

```yaml
plan_unit_id: CRAU-027
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  cmd.docker.browser_login launches DockerHub browser/device login and emits the
  browser-login event sequence; device-code initialization emits verification_uri,
  user_code, and expires_in_seconds; polling emits every 5 seconds until a
  closed terminal outcome; cmd.docker.save_pat writes PAT; and auth expiry during
  push emits docker.publish.failed with reason_code auth_expired, preserves the
  local build result, and surfaces re-auth plus retry CTA without forcing a rebuild.
gui_related: true
gui_classification_reason: Browser login, polling, terminal outcomes, and re-auth/retry CTA are visible authentication workflow behavior.
split_recommended: true
split_recommendation_reason: This unit joins S0015 and S0017 because browser-login events and auth-expiry recovery are one auth workflow contract.
depends_on: [CRAU-026]
unblocks: [CRAU-029, CRAU-031]
acceptance_criteria:
  - cmd.docker.browser_login launches DockerHub browser/device login and immediately emits docker.auth.browser_login.started.
  - Device/browser initialization emits docker.auth.browser_login.device_code_issued with verification_uri, user_code, and expires_in_seconds.
  - While awaiting completion, polling emits every 5 seconds.
  - Terminal outcomes are exactly docker.auth.capability_validated, docker.auth.browser_login.cancelled, docker.auth.browser_login.timed_out, and docker.auth.failed.
  - PAT entry is written through cmd.docker.save_pat, with optional local PAT format failure before network validation.
  - Auth expiry during push emits docker.publish.failed with reason_code auth_expired, preserves the local build result, and exposes re-auth plus retry without forcing rebuild.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_contract_drift
reasoning_tier: high
context_scope: browser_login_events_auth_expiry
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/newtools.md
node_compile_hint:
  mode: event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0015
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0017
preserved_exact_tokens:
  - "`cmd.docker.browser_login`"
  - "`docker.auth.browser_login.started`"
  - "`docker.auth.browser_login.device_code_issued`"
  - "`verification_uri`"
  - "`user_code`"
  - "`expires_in_seconds`"
  - "`docker.auth.capability_validated`"
  - "`docker.auth.browser_login.cancelled`"
  - "`docker.auth.browser_login.timed_out`"
  - "`docker.auth.failed`"
  - "`cmd.docker.save_pat`"
  - "`docker.publish.failed`"
  - "`reason_code: auth_expired`"
negative_constraints:
  - "Auth expiry during image push must not discard the completed local build result or force a rebuild."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-028 - Credential Storage Scope And Secret Boundary

```yaml
plan_unit_id: CRAU-028
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  DockerHub credential handling keeps browser-login credentials in Docker's
  credential-helper or ~/.docker/config.json chain, PAT credentials in the OS
  credential store only, DockerHub credentials global per OS user, requested
  auth mode, selected namespace/repository, and last validation snapshot
  project-scoped UI state, clear credential actions explicit about browser,
  PAT, or both, and token material out of redb, YAML, project files, and
  evidence logs with credential, auth header, and token-bearing environment
  variable redaction.
gui_related: true
gui_classification_reason: Credential scope, clear action wording, project-scoped UI state, and validation snapshots affect visible auth state while preserving secret storage boundaries.
split_recommended: true
split_recommendation_reason: This unit joins S0016 and S0021 because they define the same credential custody and secret-persistence boundary.
depends_on: [CRAU-026]
unblocks: [CRAU-029]
acceptance_criteria:
  - Browser-login credentials are read from Docker credential-helper or ~/.docker/config.json chain.
  - PAT credentials are read from OS credential store only.
  - DockerHub credentials are global per OS user account.
  - requested_auth_mode, selected namespace/repository, and last validation snapshot remain project-scoped UI state.
  - Clearing credentials declares whether browser-login credentials, PAT credentials, or both are cleared.
  - Tokens and credentials are never persisted to redb, YAML, project files, or evidence logs.
  - Evidence and log capture redact credentials, auth headers, and token-bearing environment variables.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: secret_leakage
reasoning_tier: high
context_scope: credential_storage_secret_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: secret_storage_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0016
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0021
preserved_exact_tokens:
  - "`~/.docker/config.json`"
  - "`requested_auth_mode`"
  - "OS credential store"
  - "redb"
  - "YAML"
  - "evidence logs"
negative_constraints:
  - "Docker Hub auth secret material remains out of redb; only validated identity/capability snapshots persist."
  - "Evidence/log capture must redact credentials, auth headers, and token-bearing environment variables."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/storage-plan.md
```

### CRAU-029 - Effective DockerHub Capability Model

```yaml
plan_unit_id: CRAU-029
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master models requested DockerHub auth separately from effective
  provider state and capability: effective_capabilities[] is a closed first
  implementation enum of namespaces:list, repositories:list,
  repositories:create, images:push, and repositories:read_private; surfaces gate
  namespace discovery, repository discovery, repository creation, image push, and
  private repository validation on that set, remain visible but disabled with
  missing capability and degraded_reason when needed, show effective account
  identity and validation metadata, and never imply browser login or PAT grants
  full repository-management capability unless validation proves equivalent
  effective capability.
gui_related: true
gui_classification_reason: Capability display, gated controls, disabled explanations, effective account identity, and validation metadata are user-visible auth state.
split_recommended: true
split_recommendation_reason: Source spans S0018-S0020 form one capability model but include a structural parent heading and browser-login capability note.
depends_on: [CRAU-026, CRAU-027, CRAU-028]
unblocks: [CRAU-030, CRAU-031]
acceptance_criteria:
  - effective_capabilities[] is closed for the first implementation.
  - Namespace discovery requires namespaces:list.
  - Repository discovery and refresh require repositories:list.
  - Create Repository requires repositories:create.
  - Push Image requires images:push.
  - Validation of a private target repository requires repositories:read_private or successful push-capable validation path.
  - Controls requiring missing capabilities remain visible but disabled with inline explanation naming missing capability and degraded_reason when present.
  - Requested auth mode remains separate from effective provider state and capability.
  - UI never implies browser login or PAT automatically grants full repository-management capability.
  - Browser login may support management actions when it yields equivalent effective capability; PAT remains recommended explicit fallback.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: capability_overclaim
reasoning_tier: high
context_scope: dockerhub_effective_capability_model
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: capability_gating_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0018
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0019
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0020
preserved_exact_tokens:
  - "`effective_capabilities[]`"
  - "`namespaces:list`"
  - "`repositories:list`"
  - "`repositories:create`"
  - "`images:push`"
  - "`repositories:read_private`"
  - "`requested_auth_mode`"
  - "`effective_auth_provider_state`"
  - "`effective_account_identity`"
  - "`last_validation_timestamp`"
  - "`last_validation_host`"
  - "`degraded_reason`"
negative_constraints:
  - "The UI must never imply that browser login or PAT automatically grants full repository-management capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-030 - DockerHub Repository Selection And API Boundary

```yaml
plan_unit_id: CRAU-030
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  DockerHub repository management lets users view discovered namespaces, select
  the target namespace, view repositories within it, refresh lists on demand,
  choose an existing repository for push, and create a missing repository if
  needed for first publish; Docker CLI and Buildx own local build, run, login,
  and push behavior, Docker Hub API owns app-managed namespace/repository
  discovery and creation, and image registry push is not conflated with template
  distribution. The code.execution.dockerhub-repository setting (Publish to)
  uses owner-sourced options: its repository choices come only from this Docker
  registry owner's discovered repositories for the selected account and
  namespace. Refresh and account/namespace changes update that scoped choice
  set without carrying repository choices over from another account/namespace.
  Plans/settings_inventory.json contributes only custom… (Other…) for manual
  entry, with no unconditional repository-name preset. An empty discovery result
  offers only Other…; a repository named puppet-master may appear when returned
  by the owner for the selected account/namespace or typed by the user. Manual
  entry accepts a repository name outside the discovered list for existing owner
  validation; discovery, selection, and typing do not create a repository or
  authorize a push. Existing capability gates, target validation, and protected
  creation/push authority remain with their current owners.
gui_related: true
gui_classification_reason: Repository discovery, selectors, refresh, existing-repository choice, and create action are visible repository-management controls.
split_recommended: false
depends_on: [CRAU-029]
unblocks: [CRAU-031]
acceptance_criteria:
  - Users can view namespaces, select namespace, view repositories, refresh repository lists, choose existing repository, and create a missing repository for first publish.
  - Docker CLI and Buildx handle local build, run, login, and push behavior.
  - Docker Hub API handles namespace/repository discovery and repository creation when app-managed listing/creation is needed.
  - Image registry push is not conflated with template distribution.
  - The code.execution.dockerhub-repository inventory row retains only custom… in options, labelled Other…, with its existing empty default and Project layering unchanged.
  - With only service-api returned for the selected account/namespace, choices are service-api and Other…; no fixed repository name is added. The name in this case is example input, not a preset.
  - With an empty repository result, only Other… is offered; typing release-image still reaches the existing owner validation without requiring any fixed repository name or bypassing creation/push gates. The typed name is example input, not a preset.
  - Refresh and switching the selected account or namespace replace discovered choices with that owner's scoped result; a real returned puppet-master repository is handled like any other repository.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: api_boundary_drift
reasoning_tier: standard
context_scope: dockerhub_repository_selection_api_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
  - Plans/settings_inventory.json
node_compile_hint:
  mode: repository_management_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0023
preserved_exact_tokens:
  - "DockerHub API behavior"
  - "Docker CLI / Buildx"
  - "Docker Hub API"
  - "code.execution.dockerhub-repository"
  - "custom…"
  - "Other…"
negative_constraints:
  - "Image registry push must not be conflated with template distribution."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-031 - Protected Missing Repository Creation

```yaml
plan_unit_id: CRAU-031
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: Missing-repository creation remains a separate, explicit and visible DockerHub effect naming
  namespace/repository/privacy with private default. cmd.docker.create_repository validates and preflights;
  Regular uses its existing protected human confirmation and confirm/cancel commands. Task-scoped YOLO or PS-147
  build authority invokes the same owner creation path with typed authority evidence and no forged click. A
  mode/grant route never emits confirmation_requested unless actually waiting for a person. Capability/auth/currentness
  and truthful create/unknown/reconciled results remain mandatory.
gui_related: true
gui_classification_reason: Repository creation offer, confirmation modal, default privacy notice, confirm/cancel
  actions, and blocked fast paths are visible remote side-effect UX.
split_recommended: true
split_recommendation_reason: This unit covers missing-repository behavior, confirmation flow, and default privacy
  because they form one protected remote side-effect contract.
depends_on:
- CRAU-030
- CRAU-015
- CRAU-104
- PS-146
- PS-147
unblocks: []
acceptance_criteria:
- Missing repository creation is explicit and visible during first-push preparation.
- Confirmation shows namespace, repository name, and privacy.
- Regular requires confirmation when exact-effect approval is absent. Admitted PS-146 YOLO or a PS-147 build grant
  invokes the same writer with typed authority evidence; no automated route fabricates a human confirmation.
- cmd.docker.create_repository validates namespace/repository/privacy and emits docker.repository.create.confirmation_requested
  only when actually awaiting a human decision.
- Confirm dispatches cmd.docker.create_repository.confirm.
- Cancel dispatches cmd.docker.create_repository.cancel.
- Approving image push does not implicitly approve creation of a missing DockerHub repository.
- Newly created repositories default private, and the confirmation dialog makes that default explicit while
  allowing user change before creation.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: remote_side_effect_bypass
reasoning_tier: high
context_scope: protected_missing_repository_creation
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
- Plans/Permissions_System.md
- Plans/Contracts_V0.md
node_compile_hint:
  mode: hard_gate_confirmation_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0024
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0025
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0026
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- YOLO modes
- agent autonomy
- '`cmd.docker.create_repository`'
- '`docker.repository.create.confirmation_requested`'
- '`cmd.docker.create_repository.confirm`'
- '`cmd.docker.create_repository.cancel`'
- 'default privacy for newly created repositories: private'
negative_constraints:
- Image-push authority and repository-create authority are evaluated separately; missing target authority refuses.
- No mode/grant authority may be encoded as a human clicking Confirm.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
- Plans/Permissions_System.md
stale_retired_dispositions:
- '2026-11-03 Y1/O1–O3: current behavior is the replacement canonical_text; superseded source remains lineage
  only. Superseded clause: Missing DockerHub repository creation is an explicit protected remote side-effect
  flow: Puppet Master may offer creation as part of first-push preparation, but the creation step must be explicit
  and visible, confirmation must show namespace, repository name, and privacy, YOLO modes, agent autonomy,
  and fast-path settings cannot bypass confirmation, cmd.docker.create_repository validates and emits docker.repository.create.confirmation_requested,
  confirm dispatches cmd.docker.create_repository.confirm, cancel dispatches cmd.docker.create_repository.cancel,
  approval of image push never implies repository creation approval, default privacy is private, and the dialog
  makes that default explicit while allowing the user to change privacy before creation.'
```

### CRAU-032 - Buildx Build Preflight Contract

```yaml
plan_unit_id: CRAU-032
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker image builds use docker buildx build as the deterministic image-build
  path and run preflight before build for engine reachability, compose/config
  validity, buildx availability, required ports, and target repository/auth when
  push is requested.
gui_related: false
gui_classification_reason: Build path and preflight facts are runtime execution prerequisites rather than visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0028 also contains build result surfacing split into CRAU-033.
depends_on: [CRAU-011, CRAU-029, CRAU-030]
unblocks: [CRAU-033, CRAU-043]
acceptance_criteria:
  - docker buildx build remains the deterministic image-build path.
  - Preflight resolves engine reachability, compose/config validity, buildx availability, required ports, and target repo/auth when push is requested.
  - Push authentication checks do not fold remote publish execution into local build execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: build_preflight_gap
reasoning_tier: standard
context_scope: buildx_build_preflight
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/newtools.md
node_compile_hint:
  mode: build_preflight_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0028
preserved_exact_tokens:
  - "`docker buildx build`"
  - "engine reachability"
  - "compose/config validity"
  - "buildx availability"
negative_constraints:
  - "Push auth preflight must not make local build execution create or push remote repository artifacts."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-033 - Build Result Surfacing Contract

```yaml
plan_unit_id: CRAU-033
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Structured build results preserve artifacts, logs, and image identity and are
  surfaced in chat, orchestrator, and Docker Manager UI so each consumer can
  trace the same build result.
gui_related: true
gui_classification_reason: Build result cards and result visibility in chat, orchestrator, and Docker Manager are visible UI surfaces.
split_recommended: true
split_recommendation_reason: Source span S0028 mixes backend build preflight with visible result surfacing.
depends_on: [CRAU-032, CRAU-024, CRAU-007]
unblocks: [CRAU-046, CRAU-057]
acceptance_criteria:
  - Structured build results include artifacts, logs, and image identity.
  - Chat, orchestrator, and Docker Manager UI can surface and trace the same build result.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: result_visibility_loss
reasoning_tier: standard
context_scope: build_result_surfacing
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: result_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0028
preserved_exact_tokens:
  - "structured build results"
  - "artifacts"
  - "logs"
  - "image identity"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-034 - Run Preview Control Actions

```yaml
plan_unit_id: CRAU-034
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master can deploy and run project containers for testing workflows and
  exposes user-visible controls to start and stop preview/run, open an exposed
  web UI or endpoint when available, open logs, inspect health status, and show
  the resolved access URL or port.
gui_related: true
gui_classification_reason: Preview controls, logs, health, endpoint open action, and URL/port display are visible Docker Manager behavior.
split_recommended: false
depends_on: [CRAU-011, CRAU-013]
unblocks: [CRAU-035, CRAU-036]
acceptance_criteria:
  - Start and stop preview/run actions exist for project containers.
  - Open endpoint, open logs, inspect health, and show resolved URL/port actions are available when their prerequisites exist.
  - Actions disable or degrade rather than guessing when runtime facts are unavailable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_action_drift
reasoning_tier: standard
context_scope: run_preview_control_actions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: runtime_preview_surface
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0029
preserved_exact_tokens:
  - "start preview/run"
  - "stop preview/run"
  - "open exposed web UI or endpoint"
  - "show resolved access URL/port"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-035 - Runtime Access URL Resolution

```yaml
plan_unit_id: CRAU-035
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Runtime access URL resolution checks explicit project override first, then the
  first published host-port mapping from compose or container inspect preferring
  ports 443, 80, 3000, and 8080, then known web-UI metadata or label, then no
  access URL; when none exists Docker Manager shows No direct access URL detected
  and disables open instead of guessing.
gui_related: true
gui_classification_reason: URL resolution order, disabled open action, and the no-URL copy are visible runtime access behavior.
split_recommended: false
depends_on: [CRAU-034]
unblocks: [CRAU-057]
acceptance_criteria:
  - Access URL resolution preserves the exact source order.
  - Port preference order is 443, 80, 3000, 8080, then the next published port.
  - No access URL shows No direct access URL detected and disables open rather than guessing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unsafe_url_guess
reasoning_tier: high
context_scope: runtime_access_url_resolution
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: url_resolution_guardrail
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0030
preserved_exact_tokens:
  - "`443`"
  - "`80`"
  - "`3000`"
  - "`8080`"
  - "`No direct access URL detected`"
negative_constraints:
  - "Docker Manager must disable open rather than guessing when no access URL is available."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-036 - Runtime Stream Port Forward And Crash Gap Continuity

```yaml
plan_unit_id: CRAU-036
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Persisted stream intent applies to Actions logs, container logs, Kubernetes
  logs, and Orchestrator activity using follow, paused_snapshot, and
  historical_view states; restart restores follow only after source revalidation,
  port-forward target drift creates a new session id, old sessions remain
  historical, browser tabs are never silently rebound across target changes, and
  crash evidence distinguishes flushed-and-persisted, buffered unflushed, and
  unknown gap interval.
gui_related: true
gui_classification_reason: Stream modes, degraded browser tabs, historical sessions, and crash-gap rendering are user-visible runtime evidence behavior.
split_recommended: true
split_recommendation_reason: Source span S0031 also includes alert ownership and trust-policy continuity split into CRAU-037.
depends_on: [CRAU-013, CRAU-014]
unblocks: [CRAU-037]
acceptance_criteria:
  - Stream surfaces distinguish follow, paused_snapshot, and historical_view.
  - Follow intent after restart requires source revalidation and a new stream session.
  - Port-forward target drift, changed target, or unavailable local port keeps the old session historical and issues a new session id.
  - Previously opened browser tabs never silently rebind across target changes.
  - UI renders unknown gap interval explicitly rather than implying complete evidence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_session_misleading_state
reasoning_tier: high
context_scope: runtime_stream_port_forward_crash_gap
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: runtime_session_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0031
preserved_exact_tokens:
  - "`follow`"
  - "`paused_snapshot`"
  - "`historical_view`"
  - "`flushed-and-persisted`"
  - "`unknown gap interval`"
negative_constraints:
  - "Previously opened browser tabs are never silently rebound across target changes."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-037 - Runtime Alert Ownership And Trust Continuity

```yaml
plan_unit_id: CRAU-037
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager is the primary owner for runtime and Kubernetes alert
  actionability while Dashboard and Orchestrator mirror attention state, and
  runtime plus GitHub-hosted links consume shared github_host_policy and
  /network/trust policy for enterprise host allowance, proxy mode, proxy
  credential source, per-domain/per-surface opt-out, OS trust store, custom CA
  bundle, per-host CA override, and validation/expiry reporting.
gui_related: true
gui_classification_reason: Alert ownership, mirrored attention, disabled-state UX, and trust reporting are user-visible cross-surface behavior.
split_recommended: true
split_recommendation_reason: Source span S0031 mixes stream/session continuity with alert ownership and trust-policy continuity.
depends_on: [CRAU-015, CRAU-036]
unblocks: [CRAU-038]
acceptance_criteria:
  - Docker Manager keeps unhealthy containers, restart loops, failed readiness, failed rollouts, and port-forward failures actionable.
  - Dashboard and Orchestrator mirror attention state without taking Docker Manager ownership.
  - github_host_policy distinguishes github.com_only and enterprise_allowed; GHES receives deterministic disabled-state UX when MVP is github.com_only.
  - Shared /network/trust policy preserves proxy modes, OS credential-store proxy credentials, per-domain/per-surface opt-outs, and CA validation/expiry reporting.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_mirror_or_trust_drift
reasoning_tier: high
context_scope: runtime_alert_ownership_trust_continuity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
  - Plans/GitHub_Integration.md
node_compile_hint:
  mode: owner_mirror_trust_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0031
preserved_exact_tokens:
  - "`github_host_policy`"
  - "`github.com_only`"
  - "`enterprise_allowed`"
  - "`GHES`"
  - "`/network/trust`"
  - "`system`"
  - "`manual`"
  - "`off`"
negative_constraints:
  - "Trust policy is separate from Unraid metadata."
consumer_hints:
  - Dashboard and Orchestrator mirror attention state.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-038 - Enterprise Registry And Kubernetes Host Policy

```yaml
plan_unit_id: CRAU-038
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Enterprise registry and Kubernetes policy use registry_hosts[] and
  k8s_host_policy: registry hosts record host policy, trust/proxy inheritance,
  capability snapshot, and default push target, Kubernetes host policy records
  allowed contexts, clusters, namespaces, and verbs, and hosted/runtime surfaces
  distinguish offline_cached, network_blocked_by_policy, host_unreachable, and
  host_untrusted while surfacing cached read-only state or canonical
  blocked/preflight state.
gui_related: true
gui_classification_reason: Host-policy state drives visible Docker Manager command availability, cached-state rendering, and blocked/preflight UX.
split_recommended: true
split_recommendation_reason: Source span S0032 mixes policy model with visible cached/blocked rendering.
depends_on: [CRAU-014, CRAU-037]
unblocks: [CRAU-039, CRAU-040]
acceptance_criteria:
  - registry_hosts[] entries include registry host, host policy, trust/proxy inheritance, capability snapshot, and default push target.
  - k8s_host_policy includes allowed contexts/clusters/namespaces and verbs apply, exec, port_forward, and logs.
  - UI command availability and Docker Manager subviews consume policy rather than redefining it.
  - offline_cached, network_blocked_by_policy, host_unreachable, and host_untrusted states remain distinct.
  - Policy-denied but otherwise valid actions surface canonical blocked/preflight state, not generic network failure.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: host_policy_drift
reasoning_tier: high
context_scope: enterprise_registry_k8s_host_policy
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: host_policy_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0032
preserved_exact_tokens:
  - "`registry_hosts[]`"
  - "`k8s_host_policy`"
  - "`apply`"
  - "`exec`"
  - "`port_forward`"
  - "`logs`"
  - "`offline_cached`"
  - "`network_blocked_by_policy`"
  - "`host_unreachable`"
  - "`host_untrusted`"
negative_constraints:
  - "Host policy must not be conflated with transient reachability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
```

### CRAU-039 - Mutation Preflight Before Approval

```yaml
plan_unit_id: CRAU-039
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker, registry, Unraid, and Kubernetes mutations run preflight before
  approval prompts; preflight resolves target identity, runtime/tool
  availability, host/trust/proxy policy, repository or cluster capability, and
  current drift/freshness, unresolved facts emit blocked_preflight without
  asking approval, approval binds to the preflight snapshot and exact action
  scope, retry/resume re-runs preflight when relevant facts may have changed, and
  policy-denied outcomes emit blocked/governance payloads rather than *.failed.
gui_related: false
gui_classification_reason: This unit defines mutation ordering, preflight snapshots, and approval semantics rather than visual layout.
split_recommended: false
depends_on: [CRAU-031, CRAU-038]
unblocks: [CRAU-043, CRAU-045]
acceptance_criteria:
  - Mutations run preflight before approval prompts.
  - Unresolved facts emit blocked_preflight and do not ask the user to approve an unknowable operation.
  - Approval binds to the preflight snapshot and exact action scope.
  - Retry/resume re-runs preflight when target, permission snapshot, host policy, or governance state may have changed.
  - Policy-denied outcomes after preflight or approval emit blocked/governance payloads with policy source and reason-code family rather than *.failed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_bypass
reasoning_tier: high
context_scope: mutation_preflight_before_approval
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Permissions_System.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: preflight_approval_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0033
preserved_exact_tokens:
  - "`blocked_preflight`"
  - "`*.failed`"
negative_constraints:
  - "Puppet Master must not ask the user to approve an unknowable operation."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-040 - Kubernetes Enablement And Doctor Checks

```yaml
plan_unit_id: CRAU-040
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Kubernetes is enabled as a project-focused Docker Manager subview only when
  manifests, Helm artifacts, kube-linked receipts, active workload refs, or
  explicit project settings indicate relevance; Kubernetes doctor checks verify
  kubectl reachability, kubeconfig/context availability, namespace access,
  project-focused workload scope, Helm availability when selected, and allowed
  verbs for apply, diff, logs, exec, and port_forward while keeping manifest
  editing and cached inspection available when possible.
gui_related: true
gui_classification_reason: Kubernetes subview enablement, doctor checks, editing/cached inspection availability, and explicit blocked outcomes are visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source span S0034 mixes enablement signals with doctor-check preflight behavior.
depends_on: [CRAU-014, CRAU-038]
unblocks: [CRAU-041]
acceptance_criteria:
  - Kubernetes subview enablement requires project relevance signals or explicit project settings.
  - Doctor checks verify kubectl, kubeconfig/context, namespace access, project-focused workload scope, Helm when selected, and allowed verbs.
  - Failed checks keep manifest editing and cached inspection available when possible.
  - Failed checks block mutation, exec, logs, or port-forward actions with explicit preflight/permission outcomes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: k8s_scope_creep
reasoning_tier: high
context_scope: kubernetes_enablement_doctor_checks
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: k8s_doctor_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0034
preserved_exact_tokens:
  - "`kubectl`"
  - "`apply`"
  - "`diff`"
  - "`logs`"
  - "`exec`"
  - "`port_forward`"
negative_constraints:
  - "Failed doctor checks must not silently hide the Kubernetes subview when cached inspection or manifest editing can remain available."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-041 - Active Docker Manager Operation Anchors

```yaml
plan_unit_id: CRAU-041
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry promotion, drift detection, access intelligence, and project-focused
  K8s deep linkage are active Docker Manager contract areas. They require typed
  operation identity, status/result payloads, preflight and permission outcomes,
  review/failure fields where applicable, and GUI action derivation from structured
  payloads. They must not disappear from the Docker Manager contract, be replaced
  by generic runtime wording, or render as vague planned placeholders.
gui_related: false
gui_classification_reason: This unit defines Docker Manager runtime operation contracts rather than visual presentation.
split_recommended: false
depends_on: [CRAU-012, CRAU-013, CRAU-040]
unblocks: []
acceptance_criteria:
  - Registry promotion, drift detection, access intelligence, and project-focused K8s deep linkage remain named Docker Manager contract areas.
  - Each area has typed operation identity, status/result payloads, preflight and permission outcomes, and review/failure fields where applicable.
  - These areas are not replaced by generic runtime wording or vague planned placeholders.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: docker_contract_placeholder_drift
reasoning_tier: standard
context_scope: active_docker_manager_operation_anchors
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_operation_anchor_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0035
  - pldg-20260614-002-part-3-fable-cleanup:atom-0027
  - pldg-20260614-002-part-3-fable-cleanup:atom-0028
  - pldg-20260614-002-part-3-fable-cleanup:atom-0046
  - pldg-20260614-002-part-3-fable-cleanup:atom-0064
  - pldg-20260614-002-part-3-fable-cleanup:atom-0067
  - pldg-20260614-002-part-3-fable-cleanup:atom-0070
  - pldg-20260614-002-part-3-fable-cleanup:atom-0073
  - pldg-20260614-002-part-3-fable-cleanup:atom-0076
  - pldg-20260614-002-part-3-fable-cleanup:atom-0079
preserved_exact_tokens:
  - "Docker Manager future-scope placeholders"
  - "Registry promotion"
  - "drift detection"
  - "access intelligence"
  - "project-focused K8s deep linkage"
  - "needs_review vs failure-payload disagreement"
  - "design it"
negative_constraints:
  - "Do not leave Docker Manager registry promotion, drift detection, access intelligence, or project-focused K8s deep linkage as future-scope placeholders."
  - "Do not render these areas as vague planned placeholders without typed operation payloads."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-042 - Event Registration Boundary

```yaml
plan_unit_id: CRAU-042
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  This plan defines Docker, registry, Kubernetes, and Unraid event producers and
  payload expectations for its owner surface while Contracts_V0 remains the
  registration authority for stable cross-product event names and storage-plan
  owns concrete persisted payload schemas; new event families register there
  before consumers treat them as durable canonical events.
gui_related: false
gui_classification_reason: Event producer, registration, and persisted payload ownership are backend contract boundaries.
split_recommended: false
depends_on: [CRAU-010, CRAU-015]
unblocks: [CRAU-057]
acceptance_criteria:
  - Containers_Registry_and_Unraid defines Docker, registry, Kubernetes, and Unraid event producers and payload expectations for its owner surface.
  - Plans/Contracts_V0.md remains registration authority for stable cross-product event names.
  - Plans/storage-plan.md owns concrete persisted payload schemas.
  - New event families register with those owners before consumers treat them as durable canonical events.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_authority_drift
reasoning_tier: high
context_scope: event_registration_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: event_registration_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0036
preserved_exact_tokens:
  - "Docker, registry, Kubernetes, and Unraid event producers"
  - "Contracts_V0.md"
  - "storage-plan.md"
negative_constraints:
  - "Consumers must not treat new Docker/Unraid/Kubernetes event families as durable canonical events before registration."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CRAU-043 - Publish Execution Approval And Blocked Outcome Contract

```yaml
plan_unit_id: CRAU-043
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: 'Build and publication remain separate owner stages: cmd.orchestrator.build_run prepares a
  local result; cmd.orchestrator.push_image publishes remotely. Build approval alone authorizes no remote effect,
  but a separately approved PS-147 grant or task-scoped PS-146 YOLO can authorize each requested publication/create
  step without another click. Each stage records its own exact target/authority/result. docker.publish.failed
  means attempted failure; docker.publish.blocked means no effect, with the local result preserved.'
gui_related: true
gui_classification_reason: Build and Push image approvals, blocked outcomes, and user-facing side-effect separation
  are visible publish workflow behavior.
split_recommended: true
split_recommendation_reason: Source span S0038 mixes approval UI with runtime side-effect outcome semantics.
depends_on:
- CRAU-032
- CRAU-039
- CRAU-104
- PS-146
- PS-147
unblocks:
- CRAU-044
- CRAU-045
acceptance_criteria:
- cmd.orchestrator.build_run performs local build/preview preparation only.
- cmd.orchestrator.push_image performs remote DockerHub publication only.
- push_policy after_build dispatches push_image after a successful local build result and does not fold remote
  publish into build_run.
- Direct Build approves only build, and direct Push image approves only image push.
- docker.publish.failed means an attempted publish failed at runtime.
- docker.publish.blocked means a remote side effect intentionally did not execute because confirmation or permission
  approval was missing, rejected, or cancelled.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: remote_side_effect_conflation
reasoning_tier: high
context_scope: publish_execution_approval_blocked_outcome
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
- Plans/Orchestrator_Page.md
node_compile_hint:
  mode: publish_approval_blocked_outcome
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0038
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- '`cmd.orchestrator.build_run`'
- '`cmd.orchestrator.push_image`'
- '`push_policy = after_build`'
- '`docker.publish.failed`'
- '`docker.publish.blocked`'
negative_constraints:
- '`cmd.orchestrator.build_run` MUST NOT create DockerHub repositories, push images, create remote template
  repos, or push remote template repos.'
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
```

### CRAU-044 - Missing Repository Push Resume

```yaml
plan_unit_id: CRAU-044
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: A missing repository preserves the local image/result. Only an unsatisfied human decision enters
  awaiting_repo_creation_confirmation and emits docker.repository.create.confirmation_requested. Valid YOLO/grant
  authority executes the same creation writer directly, records actual authority, then resumes the pending
  push without rebuild after verified success. Refusal/cancel blocks the create step with canonical reason/actions;
  unknown effect reconciles before retry and never repeats a speculative create.
gui_related: true
gui_classification_reason: Missing-repository confirmation, pending state, blocked payload, and retry affordance
  are visible publish workflow behavior.
split_recommended: false
depends_on:
- CRAU-031
- CRAU-043
- CRAU-104
- PS-146
- PS-147
unblocks:
- CRAU-045
acceptance_criteria:
- Missing repository during push preserves the local build result.
- Only an unsatisfied human decision enters awaiting_repo_creation_confirmation and emits
  docker.repository.create.confirmation_requested; admitted YOLO/grant authority creates directly through the same writer.
- Successful repository creation resumes the pending push attempt without forcing rebuild.
- Cancelled, rejected, or policy-blocked creation emits docker.publish.blocked with reason_code repo_creation_not_confirmed,
  blocked_step create_repository, and allowed_action_ids[].
- docker.publish.blocked preserves the already-built local image/result for retry.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: resume_state_loss
reasoning_tier: high
context_scope: missing_repository_push_resume
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: missing_repo_resume_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0039
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- '`awaiting_repo_creation_confirmation`'
- '`docker.repository.create.confirmation_requested`'
- '`reason_code: repo_creation_not_confirmed`'
- '`blocked_step: create_repository`'
- '`allowed_action_ids[]`'
negative_constraints:
- Repository creation resume must not force a rebuild when the local build result is preserved.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
stale_retired_dispositions:
- '2026-11-03 Y1/O1–O3: current behavior is the replacement canonical_text; superseded source remains lineage
  only. Superseded clause: When cmd.orchestrator.push_image resolves a missing target repository, Puppet Master
  preserves the local build result, enters awaiting_repo_creation_confirmation, emits docker.repository.create.confirmation_requested,
  resumes the pending push after successful repository creation without forcing rebuild, or emits docker.publish.blocked
  with reason_code repo_creation_not_confirmed, blocked_step create_repository, and allowed_action_ids[] while
  preserving the local image/result.'
```

### CRAU-045 - Auto Push Approval Gate

```yaml
plan_unit_id: CRAU-045
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: 'push_policy=after_build schedules a separate publication stage and never supplies authority
  itself. At final dispatch evaluate PS-146/147/148: Regular asks if the exact effect lacks approval; task
  YOLO or an exact build grant proceeds without publication confirmation. Missing repo create and template-repo
  create/push remain separate evaluated effects. Failed admission preserves the local result and exact blocked
  step; no wrapper may reintroduce an ordinary YOLO yes.'
gui_related: true
gui_classification_reason: Auto-push blocked state, Push image recovery CTA, and separated approvals are visible
  publish workflow behavior.
split_recommended: true
split_recommendation_reason: Source span S0041 also includes canonical publish reference selection and tag
  template resolution.
depends_on:
- CRAU-043
- CRAU-104
- PS-146
- PS-147
unblocks:
- CRAU-046
- CRAU-047
- CRAU-048
acceptance_criteria:
- push_policy after_build does not grant standing approval for remote side effects.
- Build click approves only local build execution.
- Auto-dispatch evaluates external_publish_side_effect for cmd.orchestrator.push_image.
- Missing PS-146/147 effect authority emits docker.publish.blocked with blocked_step push_image, preserves local build result,
  and surfaces Push image as recovery CTA.
- Repository creation and managed-template remote repo create/push remain separately evaluated side effects under
  PS-146/147; Regular asks for missing approval, while admitted YOLO or an exact build grant proceeds without another ordinary yes.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: auto_push_bypass
reasoning_tier: high
context_scope: auto_push_approval_gate
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: auto_push_approval_gate
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0041
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- '`push_policy = after_build`'
- '`external_publish_side_effect`'
- '`cmd.orchestrator.push_image`'
- '`blocked_step: push_image`'
- Push image
negative_constraints:
- Auto-push must not grant standing approval for remote side effects.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
stale_retired_dispositions:
- '2026-11-03 Y1/O1–O3: current behavior is the replacement canonical_text; superseded source remains lineage
  only. Superseded clause: push_policy = after_build does not grant standing approval for remote side effects;
  at the auto-dispatch point Puppet Master evaluates external_publish_side_effect for cmd.orchestrator.push_image,
  emits docker.publish.blocked with blocked_step push_image when approval is absent, preserves the local build
  result, surfaces Push image as recovery CTA, and keeps DockerHub repository creation plus managed-template
  remote repo create/push as separately approved side effects.'
```

### CRAU-046 - Canonical Publish Reference Selection

```yaml
plan_unit_id: CRAU-046
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Canonical template source image selection uses primary_publish_tag first, then
  the first tag emitted by the resolved tag-template list, then the
  lexicographically smallest tag only for legacy results lacking ordering
  metadata; docker_publish_result.digests[] manifest-list digest wins for
  image_digest otherwise the single pushed digest is used, and the generated
  application template Repository is namespace/repository:primary_publish_tag.
gui_related: false
gui_classification_reason: Publish reference selection is backend artifact identity and generation semantics.
split_recommended: true
split_recommendation_reason: Source span S0041 also includes visible auto-push approval and tag-template sanitization rules.
depends_on: [CRAU-045]
unblocks: [CRAU-047, CRAU-048, CRAU-050, CRAU-053]
acceptance_criteria:
  - primary_publish_tag wins when set.
  - Otherwise the first emitted tag from the resolved tag-template list wins.
  - Lexicographically smallest tag is a fallback only for legacy results without ordering metadata.
  - docker_publish_result.digests[] manifest-list digest becomes canonical image_digest when present.
  - Generated Repository value uses namespace/repository:primary_publish_tag.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: publish_reference_ambiguity
reasoning_tier: high
context_scope: canonical_publish_reference_selection
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: publish_reference_selection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0041
preserved_exact_tokens:
  - "`primary_publish_tag`"
  - "`docker_publish_result.digests[]`"
  - "`image_digest`"
  - "`<Repository>`"
  - "`<namespace>/<repository>:<primary_publish_tag>`"
compatibility_only_notes:
  - "Lexicographically smallest tag fallback is only for legacy results that lack ordering metadata."
negative_constraints:
  - "Legacy tag fallback must not override primary_publish_tag or resolved tag-template order."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-047 - Tag Template Resolution And Sanitization

```yaml
plan_unit_id: CRAU-047
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Tag templates resolve {commit}, {version}, and {timestamp} from exact sources
  with documented formats and failure behavior, may combine literals and
  variables, lowercase after substitution, replace characters outside
  [a-z0-9_.-] with hyphen, collapse consecutive hyphens, and block publish with
  explicit remediation text when post-sanitization tag is empty.
gui_related: false
gui_classification_reason: Tag resolution and sanitization are deterministic backend publish semantics.
split_recommended: true
split_recommendation_reason: Source span S0041 combines tag rules with auto-push approval and publish reference selection.
depends_on: [CRAU-046]
unblocks: [CRAU-048]
acceptance_criteria:
  - "{commit} resolves to first 12 lowercase HEAD commit hex chars and blocks if required but missing."
  - "{version} resolves from Cargo.toml, package.json, then explicit user override and blocks if unresolved without user override."
  - "{timestamp} resolves to UTC publish-start time in YYYYMMDD-HHMMSSZ format and never fails."
  - Tags lowercase, replace outside [a-z0-9_.-] with hyphen, collapse consecutive hyphens, and block when empty after sanitization.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: invalid_tag_generation
reasoning_tier: standard
context_scope: tag_template_resolution_sanitization
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: tag_template_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0041
preserved_exact_tokens:
  - "`{commit}`"
  - "`{version}`"
  - "`{timestamp}`"
  - "`YYYYMMDD-HHMMSSZ`"
  - "`[a-z0-9_.-]`"
negative_constraints:
  - "An empty post-sanitization tag is invalid and must block publish with explicit remediation text."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-048 - Post Publish Unraid Follow On Sequence

```yaml
plan_unit_id: CRAU-048
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  After successful image publishing, Puppet Master generates or updates Unraid
  XML when enabled, updates the target template repo when managed workflow is
  enabled, auto-commits template-repo changes by default, does not auto-push by
  default, and presents a one-click push action from the UI.
gui_related: true
gui_classification_reason: The follow-on sequence includes visible one-click push and enabled/disabled Unraid generation behavior.
split_recommended: false
depends_on: [CRAU-045, CRAU-046, CRAU-047]
unblocks: [CRAU-049, CRAU-057, CRAU-059]
acceptance_criteria:
  - Unraid XML generation/update runs after successful image publishing when enabled.
  - Managed template-repo workflow updates the target template repo when enabled.
  - Auto-commit is default for template-repo change.
  - Auto-push is not default.
  - One-click push action is presented from the UI.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: follow_on_side_effect_drift
reasoning_tier: standard
context_scope: post_publish_unraid_follow_on_sequence
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: post_publish_follow_on_sequence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0042
preserved_exact_tokens:
  - "`Generate/Update Unraid XML after successful publish`"
  - "auto-commit"
  - "do not auto-push"
  - "one-click push"
negative_constraints:
  - "Template-repo remote push must not become automatic by default."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-049 - Managed Unraid Artifact Classes

```yaml
plan_unit_id: CRAU-049
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The managed Unraid flow produces exactly three artifact classes: Application
  template XML at maintainer_slug/project_slug.xml, Maintainer profile XML at
  ca_profile.xml, and repo-managed image assets under assets/maintainer/ when
  users upload images instead of referencing external URLs.
gui_related: true
gui_classification_reason: Generated artifacts are user-visible outputs and appear in managed Unraid publishing surfaces.
split_recommended: false
depends_on: [CRAU-048]
unblocks: [CRAU-050, CRAU-051, CRAU-052, CRAU-057]
acceptance_criteria:
  - Application template XML is written at <maintainer_slug>/<project_slug>.xml.
  - Maintainer profile XML is written at ca_profile.xml.
  - Uploaded image assets are repo-managed under assets/maintainer/.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: artifact_shape_loss
reasoning_tier: standard
context_scope: managed_unraid_artifact_classes
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: unraid_artifact_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0044
preserved_exact_tokens:
  - "`<maintainer_slug>/<project_slug>.xml`"
  - "`ca_profile.xml`"
  - "`assets/maintainer/`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-050 - Artifact Input Provenance Matrix

```yaml
plan_unit_id: CRAU-050
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The Unraid artifact input provenance matrix preserves each canonical PM field
  with primary source, fallback or user override, auto-commit requirement, and
  auto-push requirement, including project_slug, display_name, image_ref,
  image_digest, registry_host, web_ui_url, support_url, overview_markdown,
  icon_source, category_labels[], config_items[], maintainer_slug, and
  maintainer_profile.
gui_related: false
gui_classification_reason: Artifact provenance is model and generation metadata, not primarily visual presentation.
split_recommended: false
depends_on: [CRAU-049]
unblocks: [CRAU-051, CRAU-053]
acceptance_criteria:
  - The provenance matrix preserves primary source, fallback/user override, auto-commit, and auto-push columns.
  - All canonical PM fields named in the source span remain represented.
  - docker_publish_result, preview/runtime URL, shared/per-project ca_profile state, and user overrides remain distinct provenance sources.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provenance_mapping_loss
reasoning_tier: standard
context_scope: artifact_input_provenance_matrix
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: artifact_provenance_matrix
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0045
preserved_exact_tokens:
  - "`project_slug`"
  - "`image_ref`"
  - "`docker_publish_result`"
  - "`docker_publish_result.digest[]`"
  - "`registry_host`"
  - "`web_ui_url`"
  - "`overview_markdown`"
  - "`category_labels[]`"
  - "`config_items[]`"
  - "`maintainer_profile`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-051 - Application Template Round Trip Contract

```yaml
plan_unit_id: CRAU-051
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The first implementation supports deterministic generation and round-trip
  update of the application template conceptual fields, may use an internal
  normalized model rather than hard-coding UI logic to raw XML tags, must map the
  normalized model 1:1 to emitted XML and document it, and must preserve unknown
  fields from an existing template unless the user explicitly removes them.
gui_related: true
gui_classification_reason: Template fields and update behavior are surfaced through user-visible editing/generation flows.
split_recommended: true
split_recommendation_reason: Source span S0046 mixes minimum field support with normalized model and passthrough preservation rules.
depends_on: [CRAU-050]
unblocks: [CRAU-052, CRAU-053, CRAU-054]
acceptance_criteria:
  - First implementation supports the listed conceptual fields including display name, image reference, registry host, overview, support URL, web UI URL, icon/image source, category labels, config entries, maintainer slug, and owning template path.
  - Internal normalized model maps 1:1 to emitted XML and is documented.
  - Unknown fields present in existing templates are preserved unless explicitly removed by the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: template_roundtrip_data_loss
reasoning_tier: high
context_scope: application_template_round_trip
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: application_template_round_trip
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0046
preserved_exact_tokens:
  - "deterministic generation"
  - "round-trip update"
  - "normalized model"
  - "1:1"
negative_constraints:
  - "Unknown fields present in an existing template must be preserved on update unless the user explicitly removes them."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-052 - ca_profile Editability And Round Trip Contract

```yaml
plan_unit_id: CRAU-052
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The statement that all ca_profile.xml fields are editable requires both a
  structured editor for canonical known fields and an advanced raw XML editor for
  any unmodeled field, element, attribute, or passthrough content; both save
  paths preserve passthrough content, existing ca_profile.xml parses into a
  normalized editor model, minimum editable controls cover maintainer display
  name, slug, overview/about, support URL, and icon/image source, uploaded images
  copy into the managed template repo by default, and external URL mode preserves
  the exact URL entered.
gui_related: true
gui_classification_reason: Structured and raw XML editors, editable controls, uploaded image handling, and URL mode are visible maintainer profile UI behavior.
split_recommended: true
split_recommendation_reason: Source spans S0047-S0048 combine an empty heading and detailed editability/round-trip requirements.
depends_on: [CRAU-049, CRAU-051]
unblocks: [CRAU-053, CRAU-056]
acceptance_criteria:
  - All-fields-editable claim requires both structured editor and advanced raw XML editor.
  - Structured editor round-trips through the normalized model used by generation/update.
  - Unknown or unmodeled content remains editable through raw XML and saves preserve unmodified passthrough content verbatim.
  - Existing ca_profile.xml preserves all fields including fields not exposed individually by the current UI.
  - Uploaded images copy into the managed template repo by default; external URL mode preserves the exact entered URL.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: profile_editability_overclaim
reasoning_tier: high
context_scope: ca_profile_editability_round_trip
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: ca_profile_round_trip_editability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0047
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0048
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "Structured editor"
  - "Advanced raw XML editor"
  - "round-trip"
negative_constraints:
  - "Puppet Master MUST NOT claim \"all fields editable\" unless both layers exist."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-053 - Template Review Gate And needs_review State

```yaml
plan_unit_id: CRAU-053
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Generated template output treats image_ref as final only after successful
  Docker publish, marks the result needs_review when support_url,
  overview_markdown, or icon_source is missing or when existing XML cannot map
  safely, allows local save and local auto-commit during needs_review, blocks
  auto-push, surfaces a visible Docker Manager warning, and preserves existing
  fields rather than dropping data silently.
gui_related: true
gui_classification_reason: needs_review warning, local inspection/editing, and auto-push blocking are visible Docker Manager behavior.
split_recommended: false
depends_on: [CRAU-046, CRAU-051, CRAU-052]
unblocks: [CRAU-055, CRAU-057, CRAU-063]
acceptance_criteria:
  - Successful Docker publish is required before image_ref is final.
  - Missing support_url, overview_markdown, or icon_source marks needs_review.
  - needs_review does not block local save or local auto-commit.
  - needs_review blocks auto-push and surfaces visible warning in Docker Manager.
  - Existing fields that cannot be mapped safely are preserved and marked needs_review.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_gate_bypass
reasoning_tier: high
context_scope: template_review_gate_needs_review
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_review_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0049
preserved_exact_tokens:
  - "`image_ref`"
  - "`support_url`"
  - "`overview_markdown`"
  - "`icon_source`"
  - "`needs_review`"
negative_constraints:
  - "`needs_review` MUST NOT block local save or local auto-commit, but it MUST block auto-push."
  - "Puppet Master must not drop unmapped existing XML data silently."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-054 - Application Template XML Root And Passthrough Emission

```yaml
plan_unit_id: CRAU-054
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Application template XML emission uses exact root Container version 2, emits
  known child elements in canonical order Name, Repository, Registry, Network,
  MyIP, WebUI, Support, Overview, Category, Icon, and repeated Config, emits
  Overview as CDATA, escapes other known text nodes, omits optional known
  elements when empty, and preserves unknown elements, attributes, comments, and
  root attributes verbatim on round-trip unless the user explicitly removes them.
gui_related: true
gui_classification_reason: Generated XML output is inspected and edited through user-visible Unraid template flows.
split_recommended: true
split_recommendation_reason: Source span S0051 also includes Config mapping rules split into CRAU-055.
depends_on: [CRAU-051]
unblocks: [CRAU-055, CRAU-056]
acceptance_criteria:
  - Root element is exactly <Container version=\"2\">.
  - Known child order remains Name, Repository, Registry, Network, MyIP, WebUI, Support, Overview, Category, Icon, repeated Config.
  - Overview emits as CDATA; other known text nodes emit escaped text.
  - Unknown elements, attributes, XML comments, and root attributes preserve verbatim on round-trip unless explicitly removed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: xml_shape_drift
reasoning_tier: high
context_scope: application_template_xml_root_passthrough
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: xml_emission_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0051
preserved_exact_tokens:
  - "`<Container version=\"2\">`"
  - "`Name`"
  - "`Repository`"
  - "`Registry`"
  - "`Network`"
  - "`MyIP`"
  - "`WebUI`"
  - "`Support`"
  - "`Overview`"
  - "`Category`"
  - "`Icon`"
  - "`Config`"
negative_constraints:
  - "Unknown XML content must not be dropped during round-trip unless explicitly removed by the user."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-055 - Config XML Mapping And Review Fallback

```yaml
plan_unit_id: CRAU-055
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  First implementation Config mapping supports Port, Path, Variable, and Device
  shapes with required Name, Target, Default, Display, Required, Mask, and Mode
  rules; Display defaults to always unless explicitly hidden, Required is true
  only when mandatory for a successful run, Mask is true only for secret
  environment variables, Mode is required only for Type Port and is exactly tcp
  or udp, and unmappable source items preserve prior XML unchanged and mark
  needs_review.
gui_related: true
gui_classification_reason: Config mappings determine visible generated template fields and review fallback behavior.
split_recommended: true
split_recommendation_reason: Source span S0051 combines root XML emission with Config mapping rules.
depends_on: [CRAU-053, CRAU-054]
unblocks: [CRAU-056]
acceptance_criteria:
  - Port, Path, Variable, and Device Config shapes preserve required attributes.
  - Display defaults always unless hidden by explicit user choice.
  - Mask is true only for secret environment variables.
  - Mode is required only for Type Port and is exactly tcp or udp.
  - Unmappable source items preserve prior XML unchanged and mark needs_review.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: config_mapping_invention
reasoning_tier: high
context_scope: config_xml_mapping_review_fallback
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: config_xml_mapping_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0051
preserved_exact_tokens:
  - "`<Config Type=\"Port\" ... />`"
  - "`<Config Type=\"Path\" ... />`"
  - "`<Config Type=\"Variable\" ... />`"
  - "`<Config Type=\"Device\" ... />`"
  - "`Display`"
  - "`Mask`"
  - "`Mode`"
  - "`tcp`"
  - "`udp`"
negative_constraints:
  - "Puppet Master must not invent values when it cannot map a source item into the required attribute set."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-056 - Known XML Field Registry

```yaml
plan_unit_id: CRAU-056
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The first implementation keeps a known XML field registry: application
  template fields map display_name, image_ref, registry_host, web_ui_url,
  support_url, overview_markdown, icon_source, category_labels[], and
  config_items[] to their XML shapes with local-save and auto-push requirements,
  while ca_profile.xml recognized fields map display_name, overview_markdown,
  support_url, and icon_source to XML elements required for auto-push.
gui_related: true
gui_classification_reason: Known field mapping drives visible template/profile editors and generated XML review.
split_recommended: true
split_recommendation_reason: This unit folds structural S0050 plus field tables S0052-S0053 into one registry contract.
depends_on: [CRAU-054, CRAU-055]
unblocks: [CRAU-063]
acceptance_criteria:
  - Application template normalized fields map to the documented XML elements/shapes.
  - Required-for-local-save and required-for-auto-push columns remain preserved.
  - ca_profile.xml recognized fields display_name, overview_markdown, support_url, and icon_source are required for auto-push.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: field_registry_drift
reasoning_tier: standard
context_scope: known_xml_field_registry
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: known_xml_field_registry
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0050
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0052
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0053
preserved_exact_tokens:
  - "`display_name`"
  - "`image_ref`"
  - "`registry_host`"
  - "`web_ui_url`"
  - "`support_url`"
  - "`overview_markdown`"
  - "`icon_source`"
  - "`category_labels[]`"
  - "`config_items[]`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-057 - Unmanaged Local Generation Output

```yaml
plan_unit_id: CRAU-057
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When Unraid generation is enabled but managed template-repo handling is
  disabled, unconfigured, or invalid, Puppet Master still generates a local
  artifact set under .puppet-master/generated/unraid/project_id/publish_result_id
  with template XML, ca_profile.xml when projected, and repo-managed uploaded
  assets, emits unraid.template.generation.completed, and records template_repo_id
  null plus commit_status and push_status not_attempted.
gui_related: false
gui_classification_reason: Local artifact generation target and status fields are backend output semantics; visible copy is split into CRAU-058.
split_recommended: true
split_recommendation_reason: Source span S0055 also includes visible copy and distribution target rationale split into CRAU-058.
depends_on: [CRAU-049, CRAU-053]
unblocks: [CRAU-058, CRAU-059]
acceptance_criteria:
  - Local artifacts are generated even when managed template-repo handling is disabled, unconfigured, or invalid.
  - Output path is .puppet-master/generated/unraid/<project_id>/<publish_result_id>/.
  - Required output includes template/<maintainer_slug>/<project_slug>.xml, template/ca_profile.xml when active profile is projected, and template/assets/maintainer/** for repo-managed uploaded assets.
  - unraid.template.generation.completed still fires.
  - template_repo_id is null and commit_status/push_status are not_attempted.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: local_artifact_loss
reasoning_tier: standard
context_scope: unmanaged_local_generation_output
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: unmanaged_local_generation_output
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0055
preserved_exact_tokens:
  - "`.puppet-master/generated/unraid/<project_id>/<publish_result_id>/`"
  - "`unraid.template.generation.completed`"
  - "`template_repo_id`"
  - "`commit_status`"
  - "`push_status`"
  - "`not_attempted`"
negative_constraints:
  - "Managed repo invalidity must not suppress local Unraid artifact generation when generation is enabled."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-058 - Distribution Target Rationale And Local Result UX

```yaml
plan_unit_id: CRAU-058
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Unmanaged local generation describes the result as generated locally / not
  attached to a managed repo, and the default distribution target for generated
  Unraid XML is a separate Unraid template repository or Community
  Applications-friendly template location rather than DockerHub or the main
  application repository by default, preserving the rationale that DockerHub
  stores images, public Unraid template distribution commonly uses GitHub
  template repositories, and installed copies live under
  /boot/config/plugins/dockerMan/templates-user.
gui_related: true
gui_classification_reason: Local-result wording and default distribution target are visible user-facing publishing semantics.
split_recommended: true
split_recommendation_reason: This unit folds structural distribution heading S0054 with visible rationale and copy from S0055.
depends_on: [CRAU-057]
unblocks: [CRAU-060]
acceptance_criteria:
  - UI copy describes unmanaged output as generated locally / not attached to a managed repo.
  - Separate Unraid template repository or Community Applications-friendly template location is the primary default distribution target.
  - Main application repository is optional export target only, not primary default.
  - Rationale preserves DockerHub images, GitHub template repository workflows, and Unraid installed-copy path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: distribution_target_confusion
reasoning_tier: standard
context_scope: distribution_target_rationale_local_result_ux
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: distribution_target_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0054
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0055
preserved_exact_tokens:
  - "generated locally / not attached to a managed repo"
  - "Community Applications"
  - "DockerHub stores images, not Unraid XML"
  - "`/boot/config/plugins/dockerMan/templates-user`"
negative_constraints:
  - "DockerHub must not be treated as the Unraid XML distribution target."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-059 - Default Unraid Generation Toggle

```yaml
plan_unit_id: CRAU-059
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Unraid XML generation automatically runs after successful image publish by
  default, a nearby GUI toggle can disable this behavior, and generation is part
  of the first-class Docker publish flow rather than a hidden manual afterthought.
gui_related: true
gui_classification_reason: The default generation behavior and nearby GUI toggle are visible settings/workflow behavior.
split_recommended: false
depends_on: [CRAU-048, CRAU-057]
unblocks: [CRAU-060]
acceptance_criteria:
  - Generate/update Unraid XML after successful image publish defaults enabled.
  - Nearby GUI toggle disables generation.
  - Generation remains part of first-class Docker publish flow, not hidden manual follow-up.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_generation_default
reasoning_tier: standard
context_scope: default_unraid_generation_toggle
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: unraid_generation_default
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0056
preserved_exact_tokens:
  - "automatically generate/update Unraid XML"
  - "nearby GUI toggle"
negative_constraints:
  - "Unraid XML generation must not become a hidden manual afterthought."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-060 - Managed Template Repo Workflow Default

```yaml
plan_unit_id: CRAU-060
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Puppet Master manages the Unraid template repository workflow itself by
  default, while the user can disable managed template-repo handling in settings.
gui_related: false
gui_classification_reason: The default workflow ownership is product behavior; settings UI consumes it through FinalGUISpec.
split_recommended: false
depends_on: [CRAU-059]
unblocks: [CRAU-061]
acceptance_criteria:
  - Managed template-repo workflow is enabled by default.
  - User can disable managed template-repo handling in settings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: managed_repo_default_drift
reasoning_tier: standard
context_scope: managed_template_repo_workflow_default
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: managed_template_repo_default
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0057
preserved_exact_tokens:
  - "manage the Unraid template repository workflow itself by default"
  - "disable managed template-repo handling"
negative_constraints: []
consumer_hints:
  - Plans/FinalGUISpec.md consumes the settings UI for disabling managed template-repo handling.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-061 - Template Repo Default Identity

```yaml
plan_unit_id: CRAU-061
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Managed template-repo setup defaults create-new repository identity to repo
  name project_slug-unraid-template, branch main, local managed working copy
  .puppet-master/unraid-template-repos/project_id, template path
  maintainer_slug/project_slug.xml, and maintainer profile path ca_profile.xml,
  while repo name, branch, local path, and maintainer slug are overrideable
  during setup.
gui_related: false
gui_classification_reason: Default repository identity, branch, paths, and overrideable setup fields are storage/project configuration semantics.
split_recommended: true
split_recommendation_reason: This unit folds structural parent headings S0058-S0059 plus default identity rules S0060.
depends_on: [CRAU-060]
unblocks: [CRAU-062, CRAU-063]
acceptance_criteria:
  - Create-new template repo defaults repo name to <project_slug>-unraid-template.
  - Default branch is main.
  - Local managed working copy is .puppet-master/unraid-template-repos/<project_id>/.
  - Template path is <maintainer_slug>/<project_slug>.xml and profile path is ca_profile.xml.
  - User may override repo name, branch, local path, and maintainer slug during setup.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: repo_identity_drift
reasoning_tier: standard
context_scope: template_repo_default_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0059
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0060
preserved_exact_tokens:
  - "`<project_slug>-unraid-template`"
  - "`main`"
  - "`.puppet-master/unraid-template-repos/<project_id>/`"
  - "`<maintainer_slug>/<project_slug>.xml`"
  - "`ca_profile.xml`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-062 - Existing Template Repo Validation

```yaml
plan_unit_id: CRAU-062
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Selecting an existing template repository validates that the path or repo is
  reachable, repo root is writable locally, selected branch exists or can be
  created explicitly, required layout already matches or can migrate with
  explicit user confirmation, and unrelated uncommitted changes are absent unless
  the user explicitly adopts the repo in its current state; validation failure
  disables managed publishing for the project and shows the exact failing condition.
gui_related: true
gui_classification_reason: Existing-repo selection, validation failure, exact failing condition, and disabled managed publishing state are visible setup behavior.
split_recommended: false
depends_on: [CRAU-061]
unblocks: [CRAU-063]
acceptance_criteria:
  - Existing repo selection validates reachability, local writability, branch existence/explicit creation, layout/migration confirmation, and unrelated changes/adoption.
  - Validation failure keeps managed publishing disabled for the project.
  - Validation failure shows the exact failing condition.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: repo_validation_bypass
reasoning_tier: high
context_scope: existing_template_repo_validation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: existing_template_repo_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0061
preserved_exact_tokens:
  - "select existing template repo"
  - "explicit user confirmation"
negative_constraints:
  - "Managed publishing must remain disabled for that project when existing repo validation fails."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-063 - Template Repo Status State Model

```yaml
plan_unit_id: CRAU-063
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The template-repo status row uses one canonical state model preserving
  unconfigured, config_invalid, clean, dirty_uncommitted, committed_local_only,
  push_in_progress, push_failed, diverged_remote, and needs_review with their
  meanings and user-visible consequences; transition rules continue in the next
  bounded source window.
gui_related: true
gui_classification_reason: The template-repo status row and user-visible consequences are visible settings/publishing UI state.
split_recommended: false
depends_on: [CRAU-053, CRAU-062]
unblocks: []
acceptance_criteria:
  - Template-repo status row uses exactly one canonical state model.
  - unconfigured shows setup CTA.
  - config_invalid blocks publish follow-on push and shows remediation.
  - committed_local_only shows one-click push CTA.
  - push_in_progress disables duplicate push actions.
  - push_failed preserves local commit and shows retry CTA/error.
  - diverged_remote blocks auto-push and requires review/reconcile.
  - needs_review allows local inspection/editing and blocks auto-push.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: template_status_drift
reasoning_tier: high
context_scope: template_repo_status_state_model
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_status_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0062
preserved_exact_tokens:
  - "`unconfigured`"
  - "`config_invalid`"
  - "`clean`"
  - "`dirty_uncommitted`"
  - "`committed_local_only`"
  - "`push_in_progress`"
  - "`push_failed`"
  - "`diverged_remote`"
  - "`needs_review`"
negative_constraints:
  - "Detailed transition behavior from S0063 is covered by CRAU-064 through CRAU-066 rather than retained as residual source."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-064 - Template Repo Review Transition Rules

```yaml
plan_unit_id: CRAU-064
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  After successful image publish, Puppet Master generates or updates managed XML
  artifacts; needs_review enters when support_url, overview_markdown, icon_source,
  or safe XML mapping is missing, and clears only after regeneration or explicit
  save produces all review-required fields with no unmapped-field warning.
gui_related: true
gui_classification_reason: Template review, dirty/clean status, and user save/regeneration transitions are visible Docker Manager publishing state.
split_recommended: true
split_recommendation_reason: Source span S0063 also contains auto-commit containment and commit/push status transitions split into adjacent units.
depends_on: [CRAU-048, CRAU-053, CRAU-063]
unblocks: [CRAU-065, CRAU-066]
acceptance_criteria:
  - needs_review enters for missing support_url, overview_markdown, icon_source, or unsafe XML mapping.
  - needs_review clears only after regeneration or explicit user save produces all review-required fields and no unmapped-field warning.
  - Clearing needs_review transitions to dirty_uncommitted when managed files changed locally, otherwise clean.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: review_state_transition_drift
reasoning_tier: high
context_scope: template_repo_review_transitions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_transition_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0063
preserved_exact_tokens:
  - "`needs_review`"
  - "`support_url`"
  - "`overview_markdown`"
  - "`icon_source`"
  - "`dirty_uncommitted`"
  - "`clean`"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-065 - Auto Commit Containment And Repo Review Gate

```yaml
plan_unit_id: CRAU-065
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Auto-commit is allowed only when the working-tree diff is fully contained
  within PM-owned paths for the current generation pass; unrelated tracked or
  untracked changes, config_invalid, diverged_remote, needs_review, or
  nondeterministic required path updates stop auto-commit and surface review.
gui_related: true
gui_classification_reason: Review blocking and Review repo state recovery CTA are visible repository workflow behavior.
split_recommended: true
split_recommendation_reason: Source span S0063 also contains review transition and push status behavior.
depends_on: [CRAU-062, CRAU-063, CRAU-064]
unblocks: [CRAU-066, CRAU-067]
acceptance_criteria:
  - PM-owned paths are exactly ca_profile.xml, <maintainer_slug>/<project_slug>.xml, and assets/maintainer/** written in the current generation pass.
  - Auto-commit is allowed only when the diff is fully contained within the PM-owned path set.
  - Unrelated tracked or untracked changes block auto-commit and surface Review repo state.
  - Auto-commit stops and surfaces review for config_invalid, diverged_remote, needs_review, unrelated files, or nondeterministic required path updates.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: unsafe_auto_commit
reasoning_tier: high
context_scope: auto_commit_containment_review_gate
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: auto_commit_safety_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0063
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "`<maintainer_slug>/<project_slug>.xml`"
  - "`assets/maintainer/**`"
  - "`config_invalid`"
  - "`diverged_remote`"
  - "`Review repo state`"
negative_constraints:
  - "Auto-commit must not include unrelated tracked or untracked file changes."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-066 - Commit Push Status And Retry Transitions

```yaml
plan_unit_id: CRAU-066
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Successful local auto-commit transitions to committed_local_only; one-click
  push transitions committed_local_only to push_in_progress to clean on success;
  failed push transitions push_in_progress to push_failed and preserves the local
  commit for retry, while diverged_remote exits only after resolution and
  revalidation.
gui_related: true
gui_classification_reason: Commit/push states and retry CTAs are visible template-repository status behavior.
split_recommended: true
split_recommendation_reason: Source span S0063 includes multiple status enums and transitions.
depends_on: [CRAU-063, CRAU-065]
unblocks: [CRAU-070]
acceptance_criteria:
  - commit_status preserves not_attempted, committed, skipped_review_required, skipped_unrelated_changes, and failed.
  - push_status preserves not_attempted, skipped_auto_push_disabled, push_in_progress, completed, and failed.
  - Failed push preserves the local commit for retry.
  - diverged_remote exits only after branch divergence is resolved externally or by a future reconcile flow and Puppet Master revalidates repo state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: push_retry_state_loss
reasoning_tier: high
context_scope: commit_push_status_retry_transitions
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: commit_push_status_model
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0063
preserved_exact_tokens:
  - "`committed_local_only`"
  - "`push_in_progress`"
  - "`push_failed`"
  - "`skipped_review_required`"
  - "`skipped_unrelated_changes`"
  - "`skipped_auto_push_disabled`"
  - "`completed`"
negative_constraints:
  - "A failed push must preserve the local commit for retry."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-067 - Dirty Repo Adoption Safety

```yaml
plan_unit_id: CRAU-067
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When the selected repo contains unrelated local modifications, Puppet Master
  must not silently fold managed template changes into that worktree state; it
  requires the user to clean the repo, explicitly adopt the dirty repo state, or
  switch to a different managed repo path.
gui_related: false
gui_classification_reason: Dirty-repo adoption is repository mutation safety rather than visual presentation.
split_recommended: false
depends_on: [CRAU-062, CRAU-065]
unblocks: []
acceptance_criteria:
  - Unrelated local modifications block silent managed template mutation.
  - Allowed resolutions are user cleans the repo first, user explicitly adopts the dirty repo state, or user switches to another managed repo path.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: dirty_repo_mutation
reasoning_tier: high
context_scope: dirty_repo_adoption_safety
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: dirty_repo_adoption_gate
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0064
preserved_exact_tokens:
  - "user cleans the repo first"
  - "user explicitly adopts the dirty repo state"
  - "user switches to a different managed repo path"
negative_constraints:
  - "Puppet Master MUST NOT silently fold managed template changes into unrelated worktree modifications."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-068 - Template Repo Setup Choices And Repo Shape

```yaml
plan_unit_id: CRAU-068
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  When managed Unraid template-repo publishing is enabled and no template repo is
  configured, Puppet Master offers both create-new and select-existing setup
  paths, and the default repository shape is one template repo per project.
gui_related: true
gui_classification_reason: Setup choices are visible onboarding controls for managed template repository publishing.
split_recommended: true
split_recommendation_reason: This unit folds setup flow and default repo shape headings into one setup-readiness contract.
depends_on: [CRAU-060, CRAU-061]
unblocks: [CRAU-069]
acceptance_criteria:
  - Create-new template repo setup is offered.
  - Select-existing template repo setup is offered.
  - Default repo shape remains one template repo per project.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: setup_flow_default_drift
reasoning_tier: standard
context_scope: template_repo_setup_choices_shape
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_setup_defaults
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0065
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0066
preserved_exact_tokens:
  - "creating a new template repo automatically"
  - "selecting an existing template repo"
  - "one template repo per project"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-069 - Template Repo Layout And Maintainer Slug Defaults

```yaml
plan_unit_id: CRAU-069
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Managed per-project template repositories use a root-level ca_profile.xml,
  maintainer folder, and project-name.xml inside that maintainer folder; the
  maintainer folder defaults to the project's DockerHub namespace and may be
  overridden with a custom maintainer slug.
gui_related: true
gui_classification_reason: Default layout and maintainer slug override are visible setup/review configuration.
split_recommended: true
split_recommendation_reason: This unit folds default layout and maintainer folder source spans into one repository layout identity contract.
depends_on: [CRAU-061]
unblocks: [CRAU-070]
acceptance_criteria:
  - Managed repos use root-level ca_profile.xml.
  - Managed repos include a maintainer folder containing project-name.xml.
  - Maintainer folder defaults to DockerHub namespace.
  - User can override with a custom maintainer slug.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: template_repo_layout_drift
reasoning_tier: standard
context_scope: template_repo_layout_maintainer_slug
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: template_repo_layout_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0067
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0068
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "`project-name.xml`"
  - "DockerHub namespace"
  - "custom maintainer slug"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-070 - Template Repo Commit Push Defaults And Status UX

```yaml
plan_unit_id: CRAU-070
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Template-repo changes auto-commit by default, auto-push remains configurable
  but disabled by default, one-click push is exposed after commit, and Docker
  Manager presents dirty, committed, and ready-to-push template-repo status.
gui_related: true
gui_classification_reason: One-click push and dirty/committed/ready-to-push status are visible Docker Manager UI behavior.
split_recommended: false
depends_on: [CRAU-048, CRAU-063, CRAU-066]
unblocks: [CRAU-083]
acceptance_criteria:
  - Template-repo changes auto-commit by default.
  - Auto-push is configurable but disabled by default.
  - One-click push action is exposed after commit.
  - Docker Manager shows template-repo dirty, committed, and ready-to-push status.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: commit_push_default_drift
reasoning_tier: standard
context_scope: template_repo_commit_push_defaults_status_ux
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: commit_push_status_ux
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0069
preserved_exact_tokens:
  - "auto-commit"
  - "auto-push"
  - "one-click push"
  - "dirty / committed / ready-to-push"
negative_constraints:
  - "Auto-push remains default disabled."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-071 - ca_profile Generation Scope And Editability

```yaml
plan_unit_id: CRAU-071
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  If ca_profile.xml does not exist, Puppet Master generates it and tells the user
  it still needs configuration or review; the default scope is shared
  cross-project maintainer profile, per-project maintainer profile override is
  optional, and all ca_profile.xml fields must remain editable by the user.
gui_related: true
gui_classification_reason: Generated-profile review messaging, scope controls, and editability are visible profile editor behavior.
split_recommended: true
split_recommendation_reason: This unit folds ca_profile behavior parent, generation, scope, and editability rule spans.
depends_on: [CRAU-052, CRAU-060]
unblocks: [CRAU-072, CRAU-073, CRAU-083]
acceptance_criteria:
  - Missing ca_profile.xml is generated.
  - User is told generated profile still needs configuration or review.
  - Shared cross-project maintainer profile is default scope.
  - Per-project maintainer profile override is available.
  - All ca_profile.xml fields remain editable by the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: profile_scope_editability_drift
reasoning_tier: high
context_scope: ca_profile_generation_scope_editability
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: ca_profile_generation_scope_editability
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0070
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0071
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0072
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0073
preserved_exact_tokens:
  - "`ca_profile.xml`"
  - "shared cross-project maintainer profile"
  - "per-project maintainer profile"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-072 - ca_profile Image Handling And Public Metadata Reminder

```yaml
plan_unit_id: CRAU-072
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The ca_profile.xml editor supports both uploaded or selected images copied
  into the managed template repository and external hosted image URLs; uploaded
  images default to repo-managed assets, and auto-generated profiles show a clear
  reminder that public-facing maintainer metadata should be configured before the
  repo is treated as final.
gui_related: true
gui_classification_reason: Image-mode selection and public metadata reminder are visible profile editor behavior.
split_recommended: true
split_recommendation_reason: This unit folds image handling and user-visible messaging spans.
depends_on: [CRAU-052, CRAU-071]
unblocks: [CRAU-083]
acceptance_criteria:
  - Profile editor supports upload/select image copied into managed template repository.
  - Profile editor supports external hosted image URL.
  - Uploaded images default to repo-managed assets.
  - Auto-generated profile shows public-facing maintainer metadata review reminder.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: profile_asset_and_metadata_review_gap
reasoning_tier: standard
context_scope: ca_profile_image_handling_public_metadata_reminder
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: ca_profile_asset_message_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0074
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0075
preserved_exact_tokens:
  - "external hosted image URL"
  - "repo-managed asset"
  - "public-facing maintainer metadata"
negative_constraints: []
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-073 - Docker Manager Scope Split And Migration Alias State

```yaml
plan_unit_id: CRAU-073
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager scope rules are normative: Hide Docker Manager when not used in
  Project. is global, Hide Docker Manage when not used in Project. is a
  migration alias only, Docker Manager navigation/dock/panel state and
  template-repo configuration/status are project-scoped, widget layouts are
  project-scoped with limited global fallback, shared ca_profile state is global
  unless per-project override is enabled, and effective-auth snapshots are
  advisory cached state until revalidation.
gui_related: true
gui_classification_reason: Scope, migration aliasing, navigation state, widget layout scope, and advisory auth snapshots affect visible Docker Manager behavior.
split_recommended: true
split_recommendation_reason: Source spans S0076-S0077 mix scope rules with implementation state inventory and blocked-outcome state.
depends_on: [CRAU-004, CRAU-006, CRAU-007, CRAU-019, CRAU-063]
unblocks: [CRAU-074, CRAU-075]
acceptance_criteria:
  - Hide Docker Manager when not used in Project. is global.
  - Hide Docker Manage when not used in Project. is migration alias only and migrates on read.
  - Docker Manager navigation/dock/panel state and template-repo state are project-scoped.
  - Shared ca_profile state is global unless per-project override is enabled.
  - Effective-auth snapshots remain advisory until revalidation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_storage_drift
reasoning_tier: high
context_scope: docker_manager_scope_split_migration_alias
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: state_scope_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0076
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0077
preserved_exact_tokens:
  - "`Hide Docker Manager when not used in Project.`"
  - "`Hide Docker Manage when not used in Project.`"
  - "TemplateRepoStatus"
  - "effective-auth snapshots"
compatibility_only_notes:
  - "The older Hide Docker Manage setting key is a migration alias only."
negative_constraints:
  - "The legacy Hide Docker Manage key must not become a separate active setting."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-074 - Implementation State Inventory And Blocked Outcome State

```yaml
plan_unit_id: CRAU-074
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Implementation-facing docs preserve Docker Manager state concepts for detection,
  hide setting aliasing, requested/effective auth, DockerHub identity, namespace,
  repository, privacy, push policy, tag defaults, Unraid toggles, template-repo
  location/remote/branch/status, auto-push, ca_profile scope, image mode, and
  blocked remote side effects, which remain first-class state transitions
  distinct from runtime failures in UI, event, and persisted result state.
gui_related: true
gui_classification_reason: The state inventory drives visible settings, status, blocked views, and persisted UI behavior.
split_recommended: true
split_recommendation_reason: Source span S0077 mixes scope, state inventory, and blocked outcome requirements.
depends_on: [CRAU-019, CRAU-029, CRAU-043, CRAU-063, CRAU-073]
unblocks: [CRAU-084]
acceptance_criteria:
  - Implementation docs preserve every listed Docker Manager state concept.
  - Blocked remote side effects remain distinguishable from runtime failures in UI state, event state, and persisted results.
  - Effective-auth snapshots are advisory cached state until revalidation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_state_or_projection_drift
reasoning_tier: high
context_scope: implementation_state_inventory_blocked_outcome
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: implementation_state_inventory
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0077
preserved_exact_tokens:
  - "requested auth mode"
  - "effective auth capability set"
  - "selected namespace and repository"
  - "selected repository privacy"
  - "auto-generate Unraid XML toggle"
  - "managed template-repo enabled toggle"
  - "uploaded image asset mode vs external URL mode"
negative_constraints:
  - "Blocked remote side effects must not collapse into runtime failures."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-075 - Orchestrator Vocabulary Consumer Boundary

```yaml
plan_unit_id: CRAU-075
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager consumes shared orchestrator/runtime vocabulary rather than
  owning terms such as Feature Seam, Work Package, package/seam overseers,
  promotion class, lane pool, contamination, safe point, restore point, rollback,
  and effective execution identity; Docker Manager copy preserves the boundary
  between execution truth, projections, and page or widget/page UI-only overlays.
gui_related: true
gui_classification_reason: Vocabulary ownership affects user-facing Docker Manager copy, badges, receipts, disabled controls, and help text.
split_recommended: true
split_recommendation_reason: Source span S0078 is ownership-sensitive and split into vocabulary, approval, identity, routing, and help units.
depends_on: [CRAU-015, CRAU-023, CRAU-073]
unblocks: [CRAU-076, CRAU-077, CRAU-078, CRAU-079, CRAU-080]
acceptance_criteria:
  - Docker Manager does not re-own canonical definitions from Glossary, Crosswalk, Decision Policy, 00-plans-index, or plans-index.
  - Docker Manager copy preserves execution truth versus projection versus UI-only overlay boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: orchestrator_vocabulary_consumer_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
  - Plans/Decision_Policy.md
  - Plans/00-plans-index.md
node_compile_hint:
  mode: vocabulary_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "Feature Seam"
  - "Work Package"
  - "Promotion"
  - "safe point"
  - "restore point"
  - "effective execution identity"
negative_constraints:
  - "Docker Manager must not re-own shared orchestrator/runtime vocabulary."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
```

### CRAU-076 - Hard Gate And Action-Specific Confirmation Boundary

```yaml
plan_unit_id: CRAU-076
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: Docker/registry/Kubernetes controls consume canonical permission and blocked-action results,
  including actual human, mode or prior build-grant authority. Retained hard gates remain hard gates; create/push/CI/deploy/cleanup
  each preserve distinct targets, reversibility and receipts. Covered build operations need no repeated human
  click, while unowned/unlisted/risky existing-resource operations remain approval-required or denied under
  PS-146/147/148.
gui_related: true
gui_classification_reason: Approval/blocker rendering and confirmation copy are visible Docker Manager interaction
  behavior.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes approval taxonomy with identity, routing, and help semantics.
depends_on:
- CRAU-015
- CRAU-031
- CRAU-043
- CRAU-075
- CRAU-104
- PS-148
unblocks:
- CRAU-081
- CRAU-084
acceptance_criteria:
- hard_gate and HITL /blocked remote-side-effect actions use canonical approval/blocked flow.
- Docker Manager may render blockers but must not downgrade them into generic local confirmation copy.
- Action-specific confirmation remains distinct from HITL approval.
- Non-bypassable hard_gate actions use allowed action IDs rather than generic modals.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: approval_bypass
reasoning_tier: high
context_scope: hard_gate_action_specific_confirmation
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: confirmation_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- '`hard_gate`'
- '`/blocked`'
- '`remote-side-effect`'
- '`allowed_action_ids`'
negative_constraints:
- Docker Manager must not downgrade canonical blockers into generic UI confirmation.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
```

### CRAU-077 - Requested Effective Execution Identity Disclosure

```yaml
plan_unit_id: CRAU-077
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Requested versus effective execution identity remains runtime-facing and
  auditable across requested/effective platform, model, variant, auth, account,
  Persona, provider/auth/account selection flow, selection/switch reason, and
  skipped, honored, or clamped controls; requested_account_policy is not a
  substitute for a user-selected requested_account_id.
gui_related: true
gui_classification_reason: Requested/effective identity, switch reasons, and skipped/clamped controls are visible state disclosure.
split_recommended: true
split_recommendation_reason: Source span S0078 combines identity disclosure with routing and help semantics.
depends_on: [CRAU-018, CRAU-029, CRAU-075]
unblocks: [CRAU-079]
acceptance_criteria:
  - Requested/effective execution identity remains runtime-facing and auditable.
  - requested_account_policy does not replace requested_account_id.
  - Concrete account selection and fallback remain visible to provider, chat-thread, /chat/SCM, and SCM consumers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_visibility_gap
reasoning_tier: high
context_scope: requested_effective_execution_identity
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: requested_effective_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`requested`"
  - "`effective`"
  - "`selection_reason`"
  - "`/clamped`"
  - "`/switch`"
  - "`requested_account_policy`"
  - "`requested_account_id`"
negative_constraints:
  - "`requested_account_policy` is not a substitute for a user-selected `requested_account_id`."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-078 - Runtime Projection Scope And Stale Key Disposition

```yaml
plan_unit_id: CRAU-078
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Runtime/projection events classify as runtime-internal, operator-visible, or
  chat-thread resolution events; multi-project, multi-account, and multi-worktree
  orchestration scopes identity and references by project, package, seam, node,
  account, and worktree, while stale tier_id usage is migration-only
  compatibility state and not a Docker Manager coordination key.
gui_related: true
gui_classification_reason: Projection scopes and stale-key disclosures affect visible navigation and audit joins.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes projection scope with approval, identity, route, and help semantics.
depends_on: [CRAU-019, CRAU-020, CRAU-075]
unblocks: [CRAU-079]
acceptance_criteria:
  - Runtime/projection events keep runtime-internal, operator-visible, and chat-thread resolution classifications.
  - Identity/projection/storage references are scoped by project, package, seam, node, account, and worktree.
  - tier_id remains migration-only compatibility state and not a new navigation or audit join key.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_scope_or_stale_key_revival
reasoning_tier: high
context_scope: runtime_projection_scope_stale_key_disposition
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: runtime_projection_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`tier_id`"
  - "package"
  - "seam"
  - "lane"
  - "node"
  - "attempt"
  - "receipt"
  - "worktree"
  - "runtime asset"
compatibility_only_notes:
  - "Stale tier_id usage is migration-only compatibility state, not a Docker Manager coordination-state key."
negative_constraints:
  - "New navigation and audit joins must not use tier_id."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-079 - Route Activation Cross-Surface SCM And Display Labels

```yaml
plan_unit_id: CRAU-079
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  cmd.panel.switch is shell-state only; object-bearing Docker Manager targeting
  routes through shared route/open target contracts, PM-owned SCM state registers
  with Orchestrator, Source Control, /Source, and Docker Manager, recovery
  consumers see allowed_action_ids and allowed_action_ids[], and requested/effective
  display groups use exact labels Requested, Effective, Reason, Support,
  Inherited from, and Overridden by.
gui_related: true
gui_classification_reason: Routing, destination panels, recovery state, and display labels are user-visible UI behavior.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes route activation with SCM state and label grammar.
depends_on: [CRAU-015, CRAU-024, CRAU-063, CRAU-075, CRAU-077, CRAU-078]
unblocks: [CRAU-080]
acceptance_criteria:
  - cmd.panel.switch remains shell-state only.
  - Object-bearing targeting routes through shared route/open target contracts.
  - Route activation does not reuse destination-local state when doing so would obscure requested target in /GUI.
  - PM-owned SCM state registers with all named owner/consumer surfaces.
  - Requested/effective display groups preserve exact labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_target_or_cross_surface_state_drift
reasoning_tier: high
context_scope: route_activation_cross_surface_scm_display_labels
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: route_and_cross_surface_scm_state
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`cmd.panel.switch`"
  - "`route-activation`"
  - "`/GUI`"
  - "`allowed_action_ids`"
  - "`allowed_action_ids[]`"
  - "`Requested`"
  - "`Effective`"
  - "`Reason`"
  - "`Support`"
  - "`Inherited from`"
  - "`Overridden by`"
negative_constraints:
  - "Object-bearing targeting must not be smuggled through panel-switch shell state."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-080 - Canonical Help Semantics And Runtime Recovery Vocabulary

```yaml
plan_unit_id: CRAU-080
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager help must not flatten canonical terms into one-line tooltips;
  Simple, Expert, ELI5, Expert/ELI5, and tooltip variants keep stable
  terminology, object/state/action distinctions, canonical reason codes and
  evidence, dedicated help entries, and separate safe-point, restore-point,
  rollback, and contamination recovery vocabulary.
gui_related: true
gui_classification_reason: Help text, tooltips, ELI5/Expert variants, and runtime recovery copy are visible user-facing copy.
split_recommended: true
split_recommendation_reason: Source span S0078 mixes help semantics with approval, identity, and routing contracts.
depends_on: [CRAU-023, CRAU-075, CRAU-079]
unblocks: []
acceptance_criteria:
  - Help text does not flatten canonical terms into one-line substitutions.
  - Simple/Expert/ELI5 and tooltip variants distinguish object, state, action, reason code, and evidence.
  - Dedicated help-entry candidates remain preserved.
  - safe-point, restore-point, rollback, and contamination remain distinct across storage/UI.
  - Contextual help stays limited to local affordances, counts, badges, one-surface controls, and provider caveats.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminology_flattening
reasoning_tier: high
context_scope: canonical_help_runtime_recovery_vocabulary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
node_compile_hint:
  mode: canonical_help_recovery_vocabulary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
preserved_exact_tokens:
  - "`/Expert/ELI5`"
  - "`/tooltip`"
  - "`safe-point`"
  - "`restore-point`"
  - "History vs Ledger"
  - "historical vs superseded vs revoked vs reopened"
negative_constraints:
  - "Help text must not flatten canonical state vocabulary into one-line tooltips."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Glossary.md
```

### CRAU-081 - Docker Unraid Safety Constraints

```yaml
plan_unit_id: CRAU-081
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: Repository create/publish follows PS-146 mode-aware authority or PS-147 exact build grants,
  preserving private default and real target/capability disclosure. Secret values stay out of redb/project/YAML/evidence
  and all logs are scrubbed. Image distribution and Unraid template distribution remain separate. Browser login/PAT
  capability limits and partial-result/unknown-effect truth remain unchanged.
gui_related: true
gui_classification_reason: Confirmation, capability display, redaction, and distribution distinction are user-visible
  safety behavior.
split_recommended: false
depends_on:
- CRAU-026
- CRAU-028
- CRAU-031
- CRAU-045
- CRAU-076
- CRAU-104
unblocks:
- CRAU-082
- CRAU-083
acceptance_criteria:
- Repository creation requires current PS-146/147 effect authority; missing Regular approval asks; admitted YOLO
  or an exact build grant proceeds with recorded authority and no fabricated human confirmation.
- Secrets are not written to redb, project files, YAML, or evidence.
- Publish/template-repo logs and evidence redact secrets.
- Docs distinguish DockerHub image distribution from Unraid template distribution.
- Browser login and PAT remain distinct inputs that may produce different effective capability.
- UI does not claim full repository-management support when validation shows partial capability.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: secret_or_capability_overclaim
reasoning_tier: high
context_scope: docker_unraid_safety_constraints
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: docker_unraid_safety_constraints
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0079
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- redb
- YAML
- DockerHub image distribution
- Unraid template distribution
- browser login
- PAT
negative_constraints:
- Secrets must not be written to redb, project files, YAML, or evidence.
- The UI must not claim full repository-management support when validation shows only partial capability.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
stale_retired_dispositions:
- '2026-11-03 Y1/O1–O3: current behavior is the replacement canonical_text; superseded source remains lineage
  only. Superseded clause: Docker/Unraid safety constraints keep repository creation confirmation mandatory
  and non-bypassable, keep secrets out of redb, project files, YAML, and evidence, redact secrets in publish/template-repo
  logs and evidence, distinguish DockerHub image distribution from Unraid template distribution, preserve browser
  login and PAT as different inputs that may yield different effective capability, and prevent UI overclaim
  when validation shows partial repository-management capability.'
```

### CRAU-082 - Initial Non Goals And Review Bounds

```yaml
plan_unit_id: CRAU-082
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Initial first-class Docker/Unraid scope does not require Community Applications
  submission-form submission, forum support-thread creation, fully automatic
  remote template-repo push by default, or bypassing manual review for public
  maintainer metadata correctness.
gui_related: true
gui_classification_reason: Initial non-goals bound visible automation and review expectations.
split_recommended: false
depends_on: [CRAU-048, CRAU-053, CRAU-060, CRAU-081]
unblocks: [CRAU-083]
acceptance_criteria:
  - Community Applications submission-form submission remains out of initial scope.
  - Forum support-thread creation remains out of initial scope.
  - Fully automatic remote template-repo push by default remains out of initial scope.
  - Manual review for public maintainer metadata correctness is not bypassed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scope_creep
reasoning_tier: standard
context_scope: initial_non_goals_review_bounds
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: non_goal_scope_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0080
preserved_exact_tokens:
  - "Community Applications"
  - "forum support-thread"
  - "fully automatic remote template-repo push by default"
negative_constraints:
  - "Initial scope must not bypass manual review for public maintainer metadata correctness."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
```

### CRAU-083 - End To End Acceptance Criteria Overlay

```yaml
plan_unit_id: CRAU-083
unit_type: acceptance_overlay
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: Acceptance proves DockerHub auth and partial capability, namespace/repository discovery, private-default
  missing-repository create under Regular human approval and YOLO/grant authority, distinct build/publish,
  target/digest/tag/registry results and Unraid/template defaults. It also proves grant-created cleanup versus
  same-name/pre-existing denial, Stop/currentness and no secret leakage. Static fixtures are planning evidence
  only, never native completion or a standalone WorkNode seed.
gui_related: true
gui_classification_reason: Acceptance criteria cover visible GUI auth, repository, Docker Manager, Unraid,
  and template-repo workflows.
split_recommended: false
depends_on:
- CRAU-026
- CRAU-029
- CRAU-031
- CRAU-035
- CRAU-048
- CRAU-070
- CRAU-071
- CRAU-072
- CRAU-081
- CRAU-082
- CRAU-104
unblocks: []
acceptance_criteria:
- The S0081 acceptance checklist remains preserved as validation overlay.
- Acceptance bullets map to owner units rather than creating duplicate WorkNode or implementation scope.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: acceptance_coverage_drift
reasoning_tier: standard
context_scope: containers_registry_unraid_acceptance_overlay
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: acceptance_overlay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0081
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1–O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
preserved_exact_tokens:
- PAT-recommended helper text
- New repository creation defaults to private
- digest/tag/registry info
- root `ca_profile.xml` plus maintainer folder plus `project-name.xml`
negative_constraints:
- Acceptance overlay must not become a standalone WorkNode seed.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
stale_retired_dispositions:
- '2026-11-03 Y1/O1–O3: current behavior is the replacement canonical_text; superseded source remains lineage
  only. Superseded clause: The end-to-end acceptance overlay preserves checklist assertions for DockerHub auth,
  requested/effective capability display, namespace/repository discovery, non-bypassable missing-repo creation,
  private default, build/run access, publish result digest/tag/registry info, Unraid generation defaults, managed
  template-repo defaults, ca_profile.xml generation/editability/scope, profile image modes, and template-repo
  commit/push UX without creating separate implementation scope.'
```

### CRAU-084 - Remote Side Effect Blocked Payload Normalization

```yaml
plan_unit_id: CRAU-084
unit_type: constraint
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker/Unraid remote-side-effect contracts are the reference pattern for
  blocked remote mutation: remote side effects blocked by confirmation or policy
  remain blocked rather than failed, completed local work is preserved, auth
  recovery does not auto-resubmit or auto-publish, UI explains when local
  artifacts exist but remote publish remains blocked, runtime-facing blocked
  payloads use blocked_reason_code plus ordered allowed_action_ids[],
  preserved_local_work, and optional detail_ref, and legacy reason_code and
  recovery_options[] are compatibility inputs only.
gui_related: true
gui_classification_reason: Blocked remote mutation, recovery CTAs, and user explanations are visible runtime/publish behavior.
split_recommended: true
split_recommendation_reason: This unit carries S0082 and the blocked-payload compatibility sentence from S0078.
depends_on: [CRAU-015, CRAU-043, CRAU-044, CRAU-045, CRAU-074, CRAU-076]
unblocks: []
acceptance_criteria:
  - Blocked remote side effects remain blocked, not failed.
  - Completed local work is preserved when remote publish or creation is blocked.
  - Auth recovery alone does not auto-resubmit or auto-publish blocked remote side effects.
  - UI explains when a local artifact exists but remote publish remains blocked.
  - Runtime-facing payload shape includes blocked_reason_code, ordered allowed_action_ids[], preserved_local_work, and optional detail_ref.
  - Legacy reason_code and recovery_options[] are non-canonical compatibility inputs and are not copied into new shared runtime contracts.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_payload_contract_drift
reasoning_tier: high
context_scope: remote_side_effect_blocked_payload_normalization
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_payload_normalization
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0078
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0082
preserved_exact_tokens:
  - "`blocked_reason_code`"
  - "`allowed_action_ids[]`"
  - "`preserved_local_work`"
  - "`detail_ref?`"
  - "`reason_code`"
  - "`recovery_options[]`"
compatibility_only_notes:
  - "Legacy reason_code and recovery_options[] are compatibility inputs only."
negative_constraints:
  - "Legacy fields such as `reason_code` and `recovery_options[]` are non-canonical and MUST NOT be copied into new shared runtime contracts."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
```

### CRAU-085 - Docker Operation Result Envelope And Status Lifecycle

```yaml
plan_unit_id: CRAU-085
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager operations use a shared operation result envelope with operation_id, operation_kind,
  target identity, actor/runtime_identity, project/package/seam/lane/worktree/account scope, preflight
  snapshot, approval_scope_key, status, started/updated/completed timestamps, review_payload,
  failure_payload, allowed_action_ids, evidence refs, and emitted receipt refs. `review_payload` carries
  reviewer/actor identity, review reason, proposed action, required evidence, available actions,
  selected_action, decision_note, and resulting_transition_target. `failure_payload` carries failure
  code/category, failing phase/status, human-readable message, evidence/log refs, retryability,
  remediation hint, affected target identity, and originating operation/transition context. The operation
  status enum is exactly `pending`, `running`, `needs_review`, `succeeded`, `failed`, and `cancelled`.
  `needs_review` is non-terminal and exits only through explicit review actions to `running`,
  `failed`, or `cancelled`; `failed` is terminal and carries failure_payload.
gui_related: false
gui_classification_reason: The status lifecycle and payload envelope are runtime operation contracts, not visual presentation.
depends_on: [CRAU-041, CV-281, PS-113]
unblocks: []
acceptance_criteria:
  - Docker operation result payloads carry operation identity, target identity, runtime identity, preflight, approval, status, evidence, and receipt refs.
  - "`review_payload` carries reviewer/actor identity, review reason, proposed action, required evidence, available actions, selected_action, decision_note, and resulting_transition_target."
  - "`failure_payload` carries failure code/category, failing phase/status, human-readable message, evidence/log refs, retryability, remediation hint, affected target identity, and originating operation/transition context."
  - "Status values are limited to `pending`, `running`, `needs_review`, `succeeded`, `failed`, and `cancelled`."
  - "`needs_review` is non-terminal and cannot be treated as `failed`; terminal statuses do not transition back to active operation states."
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: docker_operation_result_drift
reasoning_tier: high
context_scope: docker_operation_result_lifecycle
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: docker_operation_result_envelope, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0046
  - pldg-20260614-002-part-3-fable-cleanup:atom-0055
  - pldg-20260614-002-part-3-fable-cleanup:atom-0056
  - pldg-20260614-002-part-3-fable-cleanup:atom-0058
  - pldg-20260614-002-part-3-fable-cleanup:atom-0059
  - pldg-20260614-002-part-3-fable-cleanup:atom-0061
  - pldg-20260614-002-part-3-fable-cleanup:atom-0062
  - pldg-20260614-002-part-3-fable-cleanup:atom-0064
  - pldg-20260614-002-part-3-fable-cleanup:atom-0065
  - pldg-20260614-002-part-3-fable-cleanup:atom-0067
  - pldg-20260614-002-part-3-fable-cleanup:atom-0068
preserved_exact_tokens: ["needs_review vs failure-payload", "needs_review", "failed", "review_payload", "reviewer/actor identity", "review reason", "proposed action", "required evidence", "available actions", "selected_action", "decision_note", "resulting_transition_target", "failure_payload", "failure code/category", "failing phase/status", "human-readable message", "evidence/log refs", "retryability", "remediation hint", "affected target identity", "originating operation/transition context", "pending", "running", "succeeded", "cancelled"]
negative_constraints:
  - Do not conflate `needs_review` with terminal `failed`.
  - Do not add Docker operation statuses beyond the accepted enum without a new PlanUnit.
  - Do not allow terminal Docker statuses to transition back into active operation states.
  - Do not transition out of `needs_review` without persisting selected_action, reviewer identity, decision_note, and resulting_transition_target.
  - Do not infer retry or remediation actions from free-form failure text.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

### CRAU-086 - Registry Promotion Operation Contract

```yaml
plan_unit_id: CRAU-086
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Registry promotion is an active Docker Manager operation kind. Promotion payloads carry source
  image/ref, destination registry/repository/tag, digest, promotion policy, trust/proxy context,
  target account/server profile, preflight result, approval_scope_key, status lifecycle from
  CRAU-085, evidence refs, and rollback or remediation actions. The GUI derives promote, retry,
  rollback, inspect, and blocked actions from structured promotion payload fields.
gui_related: true
gui_classification_reason: Registry promotion actions and blocked/remediation controls are user-visible Docker Manager behavior.
depends_on: [CRAU-085]
unblocks: []
acceptance_criteria:
  - Registry promotion has source/destination/digest/policy/trust/account identity before mutation.
  - Promotion actions derive from status and payload fields, not free-form message text.
  - Promotion receipts and evidence refs are available for artifact/usage inspection.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: registry_promotion_contract_gap
reasoning_tier: high
context_scope: docker_registry_promotion
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: registry_promotion_operation_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0070
  - pldg-20260614-002-part-3-fable-cleanup:atom-0071
preserved_exact_tokens: ["registry promotion", "promotion UI derives actions from structured payload"]
negative_constraints:
  - Do not render registry promotion as a disabled placeholder.
  - Do not infer promotion actions from unstructured logs or status text.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

### CRAU-087 - Drift Detection Operation Contract

```yaml
plan_unit_id: CRAU-087
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker drift detection is an active operation kind that compares declared project container,
  registry, compose, Kubernetes, and Unraid intent with observed host or cached state. Drift payloads
  carry observed refs, expected refs, observed image/runtime identity, desired or pinned identity,
  detection source/timestamp, freshness, trust/degraded state, comparison scope, drift_kind, diff
  category/severity, policy impact, affected resources, safe remediation actions, remediation options,
  evidence refs, acknowledgement/suppression scope, promotion/rollback linkage, and operation status
  from CRAU-085. The UI derives inspect, refresh, reconcile, ignore, acknowledgement/suppression,
  promotion/rollback, and blocked actions from structured drift payloads.
gui_related: true
gui_classification_reason: Drift inspection and remediation actions are user-visible Docker Manager controls.
depends_on: [CRAU-085]
unblocks: []
acceptance_criteria:
  - Drift records distinguish expected state, observed state, freshness, trust, and degraded inputs.
  - Drift payloads include detection source/timestamp, policy impact, acknowledgement/suppression scope, and promotion/rollback linkage.
  - Drift remediation actions are typed and permission/preflight-aware.
  - Cached/offline observations disclose freshness before driving reconciliation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: docker_drift_detection_gap
reasoning_tier: high
context_scope: docker_drift_detection
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
node_compile_hint: {mode: docker_drift_detection_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0073
  - pldg-20260614-002-part-3-fable-cleanup:atom-0074
preserved_exact_tokens: ["drift detection", "first-class Docker operation", "shared Docker operation result envelope", "drift payload", "observed image/runtime identity", "desired or pinned identity", "diff category/severity", "detection source/timestamp", "policy impact", "remediation options", "evidence refs", "acknowledgement/suppression scope", "promotion/rollback linkage", "Docker drift UI derives actions from structured payload"]
negative_constraints:
  - Do not treat stale cached observations as fresh host truth.
  - Do not allow drift reconciliation without typed preflight and permission outcomes.
  - Do not expose acknowledgement/suppression or promotion/rollback actions without structured drift identity, scope, evidence, and policy impact.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

### CRAU-088 - Access Intelligence Operation Contract

```yaml
plan_unit_id: CRAU-088
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker access intelligence is an active contract for explaining which registry, Unraid, Docker
  host, or Kubernetes actions are currently available. Payloads carry evaluated identity, host or
  cluster target, account/server profile, trust/proxy policy, permission snapshot, capability result,
  degraded/offline state, required scopes, blocked reason, allowed actions, actor/runtime identity,
  account/project/worktree target identity, registry/resource identity, effective permission set,
  policy source, credential/secret boundary, risk classification, recommended action, evidence refs,
  audit provenance, revocation/approval path, and remediation hints. The UI derives disclosure, retry,
  sign-in, doctor, request-access, revocation/approval, and blocked controls from structured
  access-intelligence payloads.
gui_related: true
gui_classification_reason: Access disclosure, sign-in, doctor, request-access, and blocked controls are user-visible Docker Manager behavior.
depends_on: [CRAU-085, PS-113, MGAC-092]
unblocks: []
acceptance_criteria:
  - Access intelligence explains evaluated identity, trust/proxy policy, permission, capability, and degraded/offline inputs.
  - Access payloads preserve credential/secret boundary, risk classification, recommended action, audit provenance, and revocation/approval path.
  - Required scopes and blocked reasons are structured enough for gate and UI consumers.
  - Remediation actions come from allowed_action_ids and policy outcomes, not local button guesses.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: docker_access_intelligence_gap
reasoning_tier: high
context_scope: docker_access_intelligence
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Permissions_System.md]
node_compile_hint: {mode: docker_access_intelligence_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0076
  - pldg-20260614-002-part-3-fable-cleanup:atom-0077
preserved_exact_tokens: ["access intelligence", "first-class Docker operation/intelligence surface", "shared Docker operation result envelope", "access payload", "actor/runtime identity", "account/project/worktree target identity", "registry/resource identity", "effective permission set", "policy source", "credential/secret boundary", "risk classification", "recommended action", "evidence refs", "audit provenance", "revocation/approval path", "Docker access intelligence UI derives actions from structured payload"]
negative_constraints:
  - Do not infer access from provider/host reachability alone.
  - Do not render access remediation without scoped identity, permission, capability, and policy inputs.
  - Do not expose access intelligence actions from free-form risk text.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Permissions_System.md]
```

### CRAU-089 - Project-Focused Kubernetes Deep Linkage Contract

```yaml
plan_unit_id: CRAU-089
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Project-focused Kubernetes deep linkage is an active Docker Manager contract. Linkage payloads carry
  project_id, project/worktree identity, package/seam/lane/worktree scope, cluster/context/namespace
  identity, workload identity, manifest or Helm refs, image/deployment identity, image/digest refs,
  registry/promotion/drift refs, actor/runtime identity, permission boundary, rollout/rollback path,
  health/status refs, receipt refs, allowed verbs, trust/proxy/degraded state, preflight result, status
  lifecycle from CRAU-085, evidence refs, cross-link navigation state, and route objects for logs,
  exec, port-forward, diff, apply, manifest edit, and artifact evidence. The UI derives Kubernetes
  deep-link actions from structured linkage payloads.
gui_related: true
gui_classification_reason: Kubernetes deep links to logs, exec, port-forward, diff, apply, manifest editing, and evidence are user-visible controls.
depends_on: [CRAU-085, CV-283]
unblocks: []
acceptance_criteria:
  - Kubernetes linkage is scoped to project/package/seam/lane/worktree and cluster/context/namespace.
  - Linkage payloads carry registry/promotion/drift refs, actor/runtime identity, permission boundary, rollout/rollback path, health/status refs, evidence refs, and cross-link navigation state.
  - Deep-link actions carry allowed verbs, preflight, trust/degraded state, and route-object identity.
  - Kubernetes evidence remains linked to receipts/artifacts rather than generic cluster text.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260614-002-part-3-fable-cleanup
risk_class: k8s_deep_linkage_gap
reasoning_tier: high
context_scope: docker_project_focused_k8s_linkage
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint: {mode: docker_k8s_deep_linkage_contract, create_worknodes: false}
source_lineage:
  - pldg-20260614-002-part-3-fable-cleanup:atom-0079
  - pldg-20260614-002-part-3-fable-cleanup:atom-0080
preserved_exact_tokens: ["project-focused K8s deep linkage", "first-class Docker/K8s integration operation", "shared Docker operation result envelope", "linkage payload", "project/worktree identity", "cluster/context/namespace identity", "workload identity", "image/deployment identity", "registry/promotion/drift refs", "actor/runtime identity", "permission boundary", "rollout/rollback path", "health/status refs", "evidence refs", "cross-link navigation state", "Docker/K8s linkage UI derives actions from structured payload", "logs", "exec", "port_forward", "apply"]
negative_constraints:
  - Do not render Kubernetes linkage as a generic planned placeholder.
  - Do not deep-link into Kubernetes actions without project scope, allowed verbs, preflight, and route identity.
  - Do not expose K8s deep links as URL-only or dashboard-only affordances.
owner_hints: [Plans/Containers_Registry_and_Unraid.md, Plans/FinalGUISpec.md]
```

## Ledger Compile Addendum - pldg-20260630-001-feature-intake

This addendum compiles accepted containerized-host ledger atoms into PM-native container, runtime-family, and Docker/Hosts owner requirements. It does not create WorkNodes, NodeSeeds, executable queues, implementation files, runtime dispatch, generated governance artifacts, or production build tasks.

### CRAU-090 - Containerized Hosts PM-Owned Capability And Source-Lineage Boundary

```yaml
plan_unit_id: CRAU-090
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Containerized hosts are a PM-owned native capability inspired by Coasts source-lineage, not a Coasts daemon,
  Coastguard web UI, React/Vite transplant, vendored dependency, adapter target, or upstream execution authority.
  Useful lineage concepts such as Coastfile, Git worktrees, offline-first operation, dynamic/canonical ports,
  build-once/run-many, Host/Instance/Build/Port/Assignment separation, and access quick links may inform PM-native
  contracts only where separately accepted. Upstream privileged DinD, daemon/service authority, SSH tunnel posture,
  command/custom secret extractors, local API/CORS/WebSocket terminal/file controls, passwordless sudo, GatewayPorts,
  docker.sock, and upstream UI are source-lineage or rejected defaults unless PM-owned validation and gates accept them.
gui_related: false
gui_classification_reason: This unit owns container/runtime product boundaries and source-lineage disposition, not visual presentation.
depends_on: [CRAU-002, 0PI-065]
unblocks: [CRAU-091, CRAU-092, CV-303, CV-304, ATS-019, F3-410]
acceptance_criteria:
  - Coasts is cited as source-lineage inspiration only and never as PM execution authority or runtime proof.
  - PM canonical owner docs win conflicts over Coasts, ledger prose, stale `newtools.md`, and concept files.
  - Source-lineage concepts become PM obligations only through accepted PM-native PlanUnits.
  - Privileged, remote, terminal, file, service, secret-extractor, docker.sock, passwordless sudo, and GatewayPorts patterns are blocked, gated, or disabled unless PM-owned validation accepts them.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260630-001-feature-intake
risk_class: source_lineage_boundary
reasoning_tier: high
context_scope: containerized_hosts_source_lineage
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager containerized host capability
node_compile_hint:
  mode: containerized_hosts_source_lineage_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0006
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0009
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0010
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0027
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0051
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0054
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0056
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0065
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0074
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/coasts_upstream_and_plans_inspection_20260630.json
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json
source_atom_ids: [atom-0006, atom-0009, atom-0010, atom-0027, atom-0051, atom-0054, atom-0056, atom-0065, atom-0074]
decision_refs: [dec-0001, dec-0003, dec-0016, dec-0017, dec-0019]
preserved_exact_tokens:
  - "containerized hosts"
  - "https://github.com/coast-guard/coasts"
  - "Coasts (Containerized Hosts)"
  - "PM-owned native capability"
  - "Coastguard web UI"
  - "Coasts daemon"
  - "Coasts source-lineage"
  - "not proof of PM-supported runtime modes"
  - "newtools.md"
  - "Coastfile"
  - "Git worktrees"
  - "dynamic/canonical ports"
  - "offline-first"
  - "build once, run N instances"
  - "Host/Instance/Build/Port/Assignment"
  - "GatewayPorts"
  - "docker.sock"
negative_constraints:
  - Do not blindly vendor or rely on the upstream Coasts daemon as PM's control plane.
  - Do not make Coasts' web UI the PM product surface.
  - Do not treat Coasts runtime claims as PM-supported runtime evidence.
  - Do not promote `newtools.md` compatibility bridges or stale owner hints into product canon.
  - Do not import Coasts passwordless sudo, GatewayPorts, docker.sock, or upstream daemon/service authority as PM defaults.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Automated_Testing_System.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### CRAU-091 - RuntimeHostFamilyProfile MVP Matrix And Capability Probes

```yaml
plan_unit_id: CRAU-091
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The containerized-hosts MVP covers the whole runtime surface through a RuntimeHostFamilyProfile or equivalent
  matrix, not a generic container row or post-MVP deferral. Runtime families include Docker/Compose as the default
  local path; Podman as a capability-probed compatible alternate with visible rootless limits; Sysbox as the
  non-privileged/rootless nested-runtime candidate where available; remote Docker over SSH as a trusted remote-host
  path after PM validation and host trust; Kubernetes namespaces as project-scoped namespace/workload support, not
  cluster-admin; CI-hosted containers as an external ephemeral path; Unraid-hosted environments through Publish/Unraid
  and host templates; and privileged DinD as critical-risk disabled until explicit trust/approval. Each row records
  family id, setup inputs, supported operations, preflight probes, trust tier, gates, blocked states, receipt refs,
  cleanup policy, Coasts source-lineage refs only, and row-specific acceptance tests.
gui_related: false
gui_classification_reason: Runtime-family capability matrix and probes are backend/container behavior, not GUI presentation.
depends_on: [CRAU-090, CV-303, PS-126, F2-194]
unblocks: [ATS-019, EP-109, RAP-042]
acceptance_criteria:
  - Every runtime family in the whole-MVP scope has discover, configure, provision, project/worktree binding, start/stop/restart, endpoint exposure, health probe, log stream, bounded command, artifact/receipt, cleanup/retention, blocked/degraded, and acceptance-test behavior.
  - Podman, Sysbox, Kubernetes, remote Docker SSH, CI-hosted, Unraid-hosted, and privileged DinD rows expose capability probes, limitations, blocked states, and gate outcomes instead of parity promises.
  - Privileged DinD is disabled by default and requires explicit trust/approval, risk acknowledgement, and cleanup receipts before any bounded use.
  - Remote Docker SSH and Sysbox do not silently fall back to local Docker or privileged DinD.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future RuntimeHostFamilyProfile schema fixtures
  - future Docker Manager runtime-family preflight fixtures
risk_class: runtime_family_matrix_drift
reasoning_tier: high
context_scope: containerized_hosts_runtime_matrix
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager runtime-family matrix
node_compile_hint:
  mode: runtime_host_family_profile_matrix
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0028
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0030
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0031
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0032
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0033
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0035
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0052
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0059
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0068
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0077
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#runtime_family_matrix
source_atom_ids: [atom-0028, atom-0030, atom-0031, atom-0032, atom-0033, atom-0035, atom-0052, atom-0059, atom-0068, atom-0077]
decision_refs: [dec-0004, dec-0006, dec-0007, dec-0017, dec-0020]
preserved_exact_tokens:
  - "RuntimeHostFamilyProfile"
  - "whole thing for mvp"
  - "Docker/Compose"
  - "Podman"
  - "rootless limits"
  - "Sysbox"
  - "remote Docker over SSH"
  - "trusted remote-host path"
  - "Kubernetes namespaces"
  - "project-scoped namespace/workload"
  - "not cluster-admin"
  - "CI-hosted containers"
  - "Unraid-hosted environments"
  - "Publish/Unraid"
  - "privileged DinD"
  - "critical-risk"
  - "disabled until explicit trust/approval"
  - "capability-probed compatible alternate"
  - "no-local-fallback"
  - "privileged DinD default-disabled"
negative_constraints:
  - Do not hide broad-runtime support behind one generic container row.
  - Do not claim Podman/Sysbox/Kubernetes/remote parity without capability probes and blocker states.
  - Do not enable privileged DinD by default.
  - Do not silently fall back from remote Docker SSH or Sysbox to privileged DinD.
  - Do not promote Coasts runtime claims into PM-supported runtime evidence.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Automated_Testing_System.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CRAU-092 - Docker/Hosts Routed Detail Destination Boundary

```yaml
plan_unit_id: CRAU-092
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager remains the canonical operational owner, Activity Bar side-panel owner, and `docker_manager` command
  namespace for container, registry, Unraid, Kubernetes, and host capability behavior. `Docker/Hosts` is the native
  Slint routed primary-content page/lab for expanded host profiles, instances, Runtime Matrix, Host Lab Sessions,
  Access & Ports, Receipts & Artifacts, and Settings. It is opened from Docker Manager, command palette/search,
  Orchestrator/Executor run details, ATS sessions, Runtime Artifacts, assistant links, and receipts; it is not a new
  Activity Bar slot, not a separate Coasts website, not a PMConcept.html transplant, and not a separate Unraid panel.
  Dynamic URLs remain visible and usable for running instances while canonical ports/URLs are convenience bindings for
  the active selected or checked-out instance. The Docker/Hosts route payload is
  `{route_target: "docker_hosts", owner_surface: "docker_manager", project_id, repo_id?, workspace_root_id?,
  source_surface, subview, focus_kind?, host_capability_ref?, host_profile_id?, host_instance_id?,
  host_assignment_id?, runtime_family?, runtime_context_ref?, port_access_ref?, receipt_ref?, blocked_sequence?}`.
  Runtime families, host profiles, host instances, access records, and receipt refs are PM identities; raw Docker,
  Kubernetes, Unraid, or Coasts-local ids are backend facts only and must not replace PM identity.
gui_related: true
gui_classification_reason: This unit defines the user-visible Docker/Hosts page/lab boundary and navigation relationship to Docker Manager.
depends_on: [CRAU-007, CRAU-090, CRAU-091, UCC-105]
unblocks: [ACD-430, OP-028, RGV-015]
acceptance_criteria:
  - Docker/Hosts is reachable as a routed primary-content page/lab from Docker Manager and cross-surface links.
  - Docker Manager remains the Activity Bar side-panel owner and command namespace.
  - Expanded Host Lab detail is not trapped in the small Docker side-panel and does not create a separate website or Unraid shell panel.
  - Access actions use structured port_access_record data and do not guess low-confidence localhost URLs.
  - Docker/Hosts route payloads include owner_surface, source_surface, subview, and the relevant PM host/profile/instance/access/receipt identity refs before focusing a detail view.
  - Raw container, pod, service, or provider endpoint ids are displayed only as backend facts under PM host identity.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Docker/Hosts routing and Docker Manager command namespace fixtures
risk_class: docker_hosts_owner_routing_drift
reasoning_tier: high
context_scope: docker_hosts_routed_detail_boundary
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - future Docker/Hosts native Slint page
node_compile_hint:
  mode: docker_hosts_routed_detail_boundary
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0036
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0046
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0015
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0061
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0070
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0075
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/records/design_atoms.jsonl:atom-0080
  - Plans/ledgers/v2/pldg-20260630-001-feature-intake/source_shards/implementation_readiness_hardening_20260701.json#docker_hosts_gui_ia
source_atom_ids: [atom-0015, atom-0036, atom-0046, atom-0061, atom-0070, atom-0075, atom-0080]
decision_refs: [dec-0009, dec-0011, dec-0017, dec-0020]
preserved_exact_tokens:
  - "Docker/Hosts"
  - "Slint"
  - "routed primary-content page"
  - "Docker Manager"
  - "docker_manager"
  - "Activity Bar side-panel owner"
  - "Overview"
  - "Profiles"
  - "Instances"
  - "Runtime Matrix"
  - "Host Lab Sessions"
  - "Access & Ports"
  - "Receipts & Artifacts"
  - "Settings"
  - "Open App"
  - "Open Container"
  - "PMConcept.html"
negative_constraints:
  - Do not create a new Activity Bar slot for Docker/Hosts.
  - Do not reverse Jared accepted Docker/Hosts page placement.
  - Do not make Docker/Hosts a Coasts website transplant.
  - Do not create a separate Unraid panel.
  - Do not copy PMConcept.html HTML/CSS/demo code.
  - Do not rely on canonical localhost ports as the only way to access a test host.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - Plans/UI_Command_Catalog.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CRAU-001 - Containers, Registry, and Unraid Integration Source-Preserving Bridge Retired

```yaml
plan_unit_id: CRAU-001
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The former Containers, Registry, and Unraid source-preserving structural
  bridge is retired in place after Phase 2B atomized
  Containers_Registry_and_Unraid-S0001 through
  Containers_Registry_and_Unraid-S0082 into CRAU-002 through CRAU-084 and
  recorded structural dispositions for Containers_Registry_and_Unraid-S0083,
  Containers_Registry_and_Unraid-S0084, and
  Containers_Registry_and_Unraid-S0086. CRAU-001 remains only as migration
  lineage for the retired bridge span and must not re-own atomized source
  coverage.
gui_related: false
gui_classification_reason: The retired bridge is migration lineage; S0085's former mixed GUI/product bridge text is now covered by CRAU-002 through CRAU-084 and should not drive GUI routing.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - CRAU-001 no longer uses the source-preserving PlanUnit compile hint.
  - Prior product source coverage remains carried by CRAU-002 through CRAU-084.
  - Structural spans S0083, S0084, and S0086 are explicitly dispositioned as no-unit structural coverage.
  - The retired bridge does not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.
  - Coverage for the retired bridge is recorded in the Phase 2B batch 031 coverage map.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_lineage
reasoning_tier: standard
context_scope: plan_standardization
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: source_preserving_bridge_retired
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Containers_Registry_and_Unraid-S0085
```

## Migration Coverage

Original hash: `3202a4e6ff9310224dc3878a24ccc1c11c06a93576ab97cb26208da84b591560`.

Run-scoped proof artifacts:
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/original_hashes.json`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/span_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20260611-001-standardize-plans/anchor_aliases.json`

All original spans from `Containers_Registry_and_Unraid-S0001` through `Containers_Registry_and_Unraid-S0082` remain preserved in place. Phase 2B batch 028 atomized `Containers_Registry_and_Unraid-S0001` through `Containers_Registry_and_Unraid-S0027` into fine-grained PlanUnits `CRAU-002` through `CRAU-031` or explicit structural dispositions. Phase 2B batch 029 atomized `Containers_Registry_and_Unraid-S0028` through `Containers_Registry_and_Unraid-S0062` into fine-grained PlanUnits `CRAU-032` through `CRAU-063` or explicit structural dispositions. Phase 2B batch 030 atomized `Containers_Registry_and_Unraid-S0063` through `Containers_Registry_and_Unraid-S0082` into fine-grained PlanUnits `CRAU-064` through `CRAU-084`. Phase 2B batch 031 dispositioned structural spans `Containers_Registry_and_Unraid-S0083`, `Containers_Registry_and_Unraid-S0084`, and `Containers_Registry_and_Unraid-S0086` as structural no-unit coverage and retired `CRAU-001` as migration lineage for `Containers_Registry_and_Unraid-S0085`. This phase did not update Spec Lock, generated shards, evidence bundles, auto_decisions, or plan_graph, and it did not create WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

## FABLE Deferred Action Concrete Repair Addendum - 2026-07-08

This addendum repairs non-runtime container rows without creating WorkNodes, implementation files, runtime artifacts, or PNC-019 evidence.

- Repairs `sfk-7b9d615ae9afdde05c7a903e`: container reason-code aliases normalize to the canonical set `runtime_context_missing`, `compose_file_missing`, `container_unreachable`, `port_unbound`, `auth_expired`, `permission_denied`, and `unknown`.
- Repairs `sfk-cf0cd10a899404f5be291961`: template repo state transitions are `unknown -> clean -> dirty -> committed -> ready_to_push -> pushed`; failure states are `conflict`, `auth_required`, and `remote_rejected`. UI labels map `dirty` to `dirty`, `committed` to `committed`, and `ready-to-push` to `ready_to_push`.
- Repairs `sfk-30416f5cbd6db8016051db19`: Docker Manager cockpit controls are enabled only when target runtime is reachable, permission snapshot allows the operation, no conflicting operation is active, and required auth is valid. Disabled reason codes are `runtime_unreachable`, `permission_denied`, `operation_in_progress`, `auth_required`, and `unsupported_runtime`.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_BEGIN -->
## FABLE Remaining Action Plan Audit-Lineage Notes (2026-07-08)

These rows are preserved as audit-lineage notes only. They do not prove repair by themselves; repaired status requires concrete canonical prose/schema/enum/command/algorithm evidence in this owner doc or an explicit non-repair disposition in `Plans/.audits/fable-20260706/owner_note_closure_fidelity_after.jsonl`. This note creates no WorkNodes, NodeSeeds, queues, runtime artifacts, implementation files, production build tasks, final manifests, or PNC-019 receipts, and it does not mark `buildability_gate_passed` true.

- `registry_line 240` (explicitly_deferred; source line 861; `sfk-cf0cd10a899404f5be291961`): Explicitly deferred: closing this row requires a dedicated owner-doc/schema/detail lane beyond safe non-runtime hygiene; no buildability or runtime proof is claimed here. Source summary: - [HIGH] L4319-4373: 9-state template-repo enum is "normative" but no transition table is inline; CRAU-070 UI labels ("dirty/committed/ready-to-push") don't map onto the canonical enum values add mapping.

<!-- FABLE_REMAINING_ACTION_PLAN_REPAIR_20260708_END -->

## Cozy Shelves Panel Reconciliation Addendum - 2026-07-27

The Cozy Shelves left-rail concept review (`Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html` and `Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves-files.html`, both SOURCE-LINEAGE-ONLY design references whose HTML/CSS/class names must never be copied into spec or product) exposed spec gaps in this owner doc: compose-file editing had no editor-handoff canon, the Docker/Hosts routed page had no Compose subview, the local-runtime reason-code enum existed in two divergent "canonical" lists, compose scenarios lacked a typed object schema and event family, the template-repo status model carried two unreconciled state vocabularies, per-row expander presentation had no binding to the shared expander contract, and daemon-unreachable conditions collapsed into one undiagnosed error. This addendum closes those gaps as PlanUnits CRAU-093 through CRAU-099, citing user decisions ratified 2026-07-27 (six Docker Manager subview tabs with distinct glyphs and abbreviated mid-width labels; rail width envelope 240px min / 480px max / 280px default owned by FinalGUISpec; implementation base is the c2 concept files patched in place). Supersession is expressed only through new successor units; no existing PlanUnit block, preserved token, or retired bridge is edited. This addendum creates no WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks.

### CRAU-093 - Compose File Editing Handoff Canon

```yaml
plan_unit_id: CRAU-093
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The Docker Manager `Compose` subview is a compose identity and selection surface, never a YAML
  editing surface. The subview discloses the compose project name, the inferred or explicitly
  selected compose file path, the active env-file selection, and the active profiles using the
  requested-vs-effective disclosure grammar. Editing the compose file or an env file hands off to
  the main editor through `cmd.docker.compose.open_file`, which resolves the selected compose file
  (or an explicit env-file argument) through the shared open-file/route-target contract to the
  owning editor surface; Docker Manager does not re-own file, editor, or LSP behavior. In-panel
  YAML editing is out of scope permanently, and Puppet Master never regenerates, rewrites, or
  round-trips user compose YAML from a parsed object model. Compose validation failures
  (`compose_invalid`, `compose_service_missing`) render as reason-coded rows whose repair path is
  the editor handoff, not in-panel mutation.
gui_related: true
gui_classification_reason: Compose identity disclosure and the edit-in-editor handoff are user-visible Docker Manager subview behavior.
depends_on: [CRAU-016]
unblocks: [CRAU-094, CRAU-096]
acceptance_criteria:
  - The Compose subview shows compose project name, inferred or selected compose file path, env-file selection, and active profiles.
  - cmd.docker.compose.open_file routes the compose or env file to the owning editor surface through the shared open-file/route-target contract.
  - No in-panel YAML editing surface exists in the Docker Manager side panel or any Compose subview, and none is planned as a later phase.
  - User compose YAML is never regenerated or rewritten from a parsed model; PM writes no compose YAML it did not author.
  - compose_invalid and compose_service_missing rows link repair to the editor handoff with file/line context where knowable.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future compose subview identity-disclosure and editor-handoff fixtures
risk_class: compose_editing_ownership_drift
reasoning_tier: high
context_scope: docker_compose_editing_handoff
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
node_compile_hint:
  mode: compose_editing_handoff_canon
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only, never copy HTML/CSS/class names)
  - Plans/Containers_Registry_and_Unraid.md:146-148
  - Plans/Containers_Registry_and_Unraid.md:216
  - user decision 2026-07-27 (Cozy Shelves panel review; implementation base is the c2 concept files patched in place)
preserved_exact_tokens: ["cmd.docker.compose.open_file", "compose_invalid", "compose_service_missing"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not embed a YAML editor in the Docker Manager side panel or any Compose subview.
  - Do not regenerate, rewrite, or round-trip user compose YAML from a parsed model.
  - Do not bypass the owning editor surface for compose or env-file editing.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/UI_Command_Catalog.md
  - Plans/FileManager.md
```

### CRAU-094 - Docker/Hosts Compose Subview Successor

```yaml
plan_unit_id: CRAU-094
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Successor amendment to CRAU-092, scoped to the Docker/Hosts subview enumeration and route
  payload vocabulary only. The Docker/Hosts routed primary-content page adds `Compose` as a
  first-class subview alongside Overview, Profiles, Instances, Runtime Matrix, Host Lab Sessions,
  Access & Ports, Receipts & Artifacts, and Settings. The route payload `subview` vocabulary
  admits `compose`, and `focus_kind` admits `compose_project` and `compose_scenario`, so scenario
  detail, staleness/repair state, and per-service views too large for the small Docker side panel
  open on the routed page instead of being trapped in the panel. All other CRAU-092 boundaries -
  Docker Manager as operational owner and Activity Bar side-panel owner, no new Activity Bar slot,
  no separate Unraid panel, PM identities over raw backend ids, no PMConcept/Coasts transplant -
  remain unchanged and are not re-owned or re-decided here.
gui_related: true
gui_classification_reason: The Compose subview and its route payload vocabulary are user-visible Docker/Hosts page structure and navigation.
depends_on: [CRAU-092, CRAU-093]
unblocks: []
acceptance_criteria:
  - This unit supersedes only the CRAU-092 subview enumeration and route payload subview/focus_kind vocabulary; the CRAU-092 unit body is not edited.
  - Docker/Hosts exposes a Compose subview reachable through the existing routed-page entry points.
  - Route payloads admit subview "compose" and focus_kind values "compose_project" and "compose_scenario".
  - Compose scenario detail and repair surfaces too large for the side panel open on the routed page.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Docker/Hosts compose subview routing fixtures
risk_class: docker_hosts_owner_routing_drift
reasoning_tier: high
context_scope: docker_hosts_compose_subview
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
  - future Docker/Hosts native Slint page
node_compile_hint:
  mode: docker_hosts_compose_subview_successor
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)
  - Plans/Containers_Registry_and_Unraid.md CRAU-092
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["Docker/Hosts", "Compose", "compose_project", "compose_scenario", "focus_kind"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not edit the CRAU-092 unit body; supersession is carried by this successor unit only.
  - Do not create a new Activity Bar slot, a separate Unraid panel, or a Coasts/PMConcept transplant through this subview.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-095 - Local-Runtime Reason-Code Enum Reconciliation

```yaml
plan_unit_id: CRAU-095
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The section 2B prose list is the single canonical local-runtime reason-code base enum:
  runtime_context_missing, runtime_context_unreachable, compose_invalid, compose_service_missing,
  buildx_unavailable, bake_unavailable, image_missing, container_unhealthy, access_url_unresolved,
  k8s_context_missing, k8s_context_unreachable, k8s_namespace_missing, and k8s_rollout_blocked.
  The variant codes carried by CRAU-017 acceptance criteria (container_unreachable, port_unbound,
  auth_expired, registry_unreachable, project_not_containerized) and by the 2026-07-08 FABLE alias
  repair (compose_file_missing, permission_denied, unknown) are compatibility vocabulary: they
  remain valid as registered typed extensions and normalization inputs under the existing
  typed-extension rule, but they do not constitute a second canonical base enum. New shared
  contracts and GUI consumers bind to the canonical base plus registered typed extensions, never
  to panel-local prose codes.
gui_related: false
gui_classification_reason: Reason-code enum adjudication is contract vocabulary; visible rendering rules are owned by the existing blocked/disabled-state units.
depends_on: [CRAU-017]
unblocks: [CRAU-099]
acceptance_criteria:
  - The section 2B thirteen-code list is declared the canonical local-runtime reason-code base enum.
  - CRAU-017 variant codes and the 2026-07-08 FABLE alias set are classified as compatibility vocabulary admitted only through the typed-extension rule.
  - No consumer treats the compatibility vocabulary as a second canonical base enum.
  - Unknown or provider-new codes continue to extend the typed namespace without becoming free-form UI copy.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future local-runtime reason-code normalization fixtures
risk_class: reason_code_enum_drift
reasoning_tier: high
context_scope: local_runtime_reason_code_reconciliation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: local_runtime_reason_code_reconciliation
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Containers_Registry_and_Unraid.md:196
  - Plans/Containers_Registry_and_Unraid.md CRAU-017 acceptance criteria
  - Plans/Containers_Registry_and_Unraid.md FABLE Deferred Action Concrete Repair Addendum - 2026-07-08
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["runtime_context_missing", "runtime_context_unreachable", "compose_invalid", "compose_service_missing", "buildx_unavailable", "bake_unavailable", "image_missing", "container_unhealthy", "access_url_unresolved", "k8s_context_missing", "k8s_context_unreachable", "k8s_namespace_missing", "k8s_rollout_blocked"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not edit CRAU-017 or the FABLE repair addendum; their variant codes are reclassified by this successor unit only.
  - Do not admit compatibility codes into new shared contracts as base enum members.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
```

### CRAU-096 - Compose Scenario Object Schema And Event Family

```yaml
plan_unit_id: CRAU-096
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Compose scenarios are typed objects persisted in `container_manager.project_state.{project_id}`.
  The scenario schema is scenario_id, name, service_subset[], profiles[], env_file_refs[],
  port_maps[], detach_default, log_follow_default, and a staleness fingerprint computed as a
  compose config-hash over the resolved compose configuration for the selected compose file,
  profiles, and env files. A fingerprint mismatch marks the scenario stale and opens it degraded
  with validation errors plus repair actions per the existing scenario-runner contract; run, edit,
  and delete stay disabled with exact reason codes until validation succeeds. Scenario CRUD and
  run activity emit the event family docker.compose.scenario.saved, docker.compose.scenario.run,
  docker.compose.scenario.edited, and docker.compose.scenario.deleted, registered through
  Contracts_V0.md; persisted payload schemas remain owned by storage-plan.md.
gui_related: false
gui_classification_reason: The scenario object schema and event family are contract/storage semantics; scenario presentation is consumed by CRAU-098 and the routed page.
depends_on: [CRAU-042, CRAU-093]
unblocks: []
acceptance_criteria:
  - The scenario schema carries scenario_id, name, service_subset[], profiles[], env_file_refs[], port_maps[], detach_default, and log_follow_default.
  - Staleness is a compose config-hash fingerprint over the resolved compose configuration; mismatch marks the scenario stale and degraded, never silently broken.
  - docker.compose.scenario.saved/run/edited/deleted are registered through Contracts_V0.md before GUI or runtime consumers depend on them.
  - Scenario lists persist in container_manager.project_state.{project_id}; persisted payload schemas are owned by storage-plan.md.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future compose scenario schema and staleness-fingerprint fixtures
risk_class: scenario_schema_drift
reasoning_tier: high
context_scope: compose_scenario_object_schema
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: compose_scenario_schema_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Containers_Registry_and_Unraid.md:148
  - Plans/Containers_Registry_and_Unraid.md:204
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only)
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["scenario_id", "service_subset", "env_file_refs", "port_maps", "compose config-hash", "docker.compose.scenario.saved", "docker.compose.scenario.run", "docker.compose.scenario.edited", "docker.compose.scenario.deleted", "container_manager.project_state.{project_id}"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not emit scenario events that are not registered through Contracts_V0.md.
  - Do not store transient runtime observations inside the scenario object as canonical state.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CRAU-097 - Template-Repo Status Model Adjudication

```yaml
plan_unit_id: CRAU-097
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  The 2026-07-08 FABLE chain - unknown -> clean -> dirty -> committed -> ready_to_push -> pushed,
  with failure states conflict, auth_required, and remote_rejected - is canonical for UI labels on
  template-repo status rows; CRAU-070 labels stay on this chain. The CRAU-063 nine-state enum
  remains the persisted backend state vocabulary and maps deterministically onto the UI chain:
  unconfigured renders as unknown with the setup CTA; config_invalid renders as unknown with
  remediation and blocked chain progress; clean renders as clean; dirty_uncommitted renders as
  dirty; needs_review renders as dirty with a review-blocked badge and auto-push blocked;
  committed_local_only renders as committed, advancing to the ready_to_push label when push
  preconditions validate (auth valid, remote not diverged); push_in_progress renders as
  ready_to_push with an in-flight marker and duplicate push disabled; a successful push renders
  the transient pushed label before revalidation settles on clean; push_failed renders the
  auth_required or remote_rejected failure label per error class with the local commit preserved;
  diverged_remote renders the conflict failure label requiring review/reconcile. Transitions into
  and out of unconfigured and config_invalid are defined: enabling managed publishing with no repo
  enters unconfigured; completing setup validation exits to clean, or dirty_uncommitted if a
  managed diff already exists; a settings edit or failed revalidation from any state enters
  config_invalid; config_invalid exits only through successful revalidation to the state implied
  by the working tree.
gui_related: true
gui_classification_reason: UI label adjudication and the backend-to-label mapping are user-visible template-repo status row behavior.
depends_on: [CRAU-063, CRAU-070]
unblocks: []
acceptance_criteria:
  - Template-repo status rows label states from the FABLE six-state chain plus its failure states, never raw nine-state enum names.
  - Every CRAU-063 state has exactly one mapping into the UI chain as stated in canonical_text.
  - unconfigured and config_invalid have defined entry and exit transitions covering setup, revalidation, and settings edits.
  - The nine-state enum remains the persisted backend vocabulary; neither enum is deleted or edited in place.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future template-repo status mapping fixtures
risk_class: template_status_drift
reasoning_tier: high
context_scope: template_repo_status_adjudication
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: template_repo_status_adjudication
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Containers_Registry_and_Unraid.md:772-834
  - Plans/Containers_Registry_and_Unraid.md CRAU-063, CRAU-070
  - Plans/Containers_Registry_and_Unraid.md FABLE Deferred Action Concrete Repair Addendum - 2026-07-08
  - Plans/Containers_Registry_and_Unraid.md:5990 (registry_line 240 deferred row; closed by this unit)
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["unconfigured", "config_invalid", "clean", "dirty_uncommitted", "committed_local_only", "push_in_progress", "push_failed", "diverged_remote", "needs_review", "ready_to_push", "auth_required", "remote_rejected"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not edit CRAU-063, CRAU-070, or the FABLE repair addendum; adjudication is carried by this successor unit only.
  - Do not surface raw nine-state enum names as UI labels.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-098 - Docker Manager Six-Tab And Expander Presentation Consumption

```yaml
plan_unit_id: CRAU-098
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Per user decision 2026-07-27, the Docker Manager side panel presents six stable subview tabs -
  Containers, Images, Compose, Registries, Build / Bake, and Publish / Unraid - each with a
  distinct glyph (including a Compose glyph distinct from Containers), icon-only presentation at
  narrow widths, abbreviated mid-width labels (for example Build, Publish), and full labels when
  width allows, fitting the rail width envelope owned by FinalGUISpec (240px min / 480px max /
  280px default; 220px is test-only adversarial). The conditional Kubernetes subview keeps its
  section 2C detection and visibility canon and does not become a seventh permanent tab. Container
  rows, per-service compose rows, image rows, registry rows, and scenario rows consume the shared
  unified expander contract owned by the Plans/FinalGUISpec.md Cozy Shelves Panel Reconciliation
  Addendum (2026-07-27): rows collapsed by default; the row header is a single accessible button
  carrying aria-expanded; the expanded body renders slots in the order kv-facts, status-detail,
  blocked-reason-detail, actions, overflow; the body caps near 200px with internal scroll; blocked
  reasons stay visible outside the collapsible body; destructive actions route through the shared
  confirm surface; blocked payloads carry blocked_reason_code plus ordered allowed_action_ids[].
  This unit is a consumption note and does not re-own the expander contract or the width envelope.
  Amended 2026-10-09 (DL-162): the six tab labels are never abbreviated; the strip fits by
  measurement as FinalGUISpec F3-620 says (every full label when all fit, otherwise the active
  tab's full label with glyphs for the others, otherwise glyphs only), and each tab keeps its full
  label as its accessible name and hover tag.
gui_related: true
gui_classification_reason: Tab structure, glyphs, label fitting, and expander row consumption are user-visible Docker Manager panel presentation.
depends_on: [CRAU-092, CRAU-093]
unblocks: []
acceptance_criteria:
  - Docker Manager shows exactly six stable subview tabs with distinct glyphs and width-adaptive labels per the 2026-07-27 user decision.
  - The Kubernetes subview remains conditional per section 2C and is not a seventh permanent tab.
  - Docker Manager rows bind to the shared unified expander contract, including slot order, body cap, always-visible blocked reasons, shared confirm surface, and blocked_reason_code plus ordered allowed_action_ids[] payloads.
  - The expander contract and rail width envelope are consumed, not re-owned, by this doc.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Docker Manager tab-fit and expander consumption fixtures
risk_class: panel_presentation_drift
reasoning_tier: standard
context_scope: docker_manager_panel_presentation
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: docker_manager_presentation_consumption
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Concepts/rail-concepts/QwenRailConcepts/c2-cozy-shelves.html (Cozy Shelves concept; source-lineage-only, never copy HTML/CSS/class names)
  - Plans/Containers_Registry_and_Unraid.md:128-136
  - user decision 2026-07-27 (six subview tabs, distinct glyphs, abbreviated mid-width labels; rail width envelope 240/480/280)
  - Plans/Decision_Log.md#DL-162 (owner decision 2026-10-09; tab labels are never abbreviated, FinalGUISpec F3-620)
preserved_exact_tokens: ["Containers", "Images", "Compose", "Registries", "Build / Bake", "Publish / Unraid", "aria-expanded", "blocked_reason_code", "allowed_action_ids"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not re-own the unified expander contract or the rail width envelope in this doc.
  - Do not copy c2-cozy-shelves HTML/CSS/class names into spec or product surfaces.
  - Do not promote the conditional Kubernetes subview to a permanent seventh tab through presentation work.
compatibility_only_notes:
  - "Slint compatibility: tabs and expander rows render as opaque precomputed surfaces with transform-driven expand/collapse; no arbitrary-content backdrop blur, no SVG filters, color math precomputed; any glass treatment uses a single pre-blurred wallpaper asset."
owner_boundary_notes:
  - "The unified expander contract is owned by the Plans/FinalGUISpec.md Cozy Shelves Panel Reconciliation Addendum (2026-07-27); this unit only binds Docker Manager rows to it."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

### CRAU-099 - Daemon Unreachable Diagnosis States Per Context

```yaml
plan_unit_id: CRAU-099
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager classifies daemon-unreachable conditions per runtime context with a typed
  diagnosis sub-classification carried inside the canonical reason-code payload for
  runtime_context_missing and runtime_context_unreachable: not_installed, not_running,
  socket_permission, ssh_auth_failed, and wrong_context. Each diagnosis state carries exactly one
  primary recovery action: not_installed opens setup guidance; not_running offers start-and-retry;
  socket_permission opens socket-permission remediation guidance; ssh_auth_failed re-runs SSH
  auth validation with the exact failing ssh-agent/key step disclosed; wrong_context offers
  switch-context. Remote SSH contexts, including the Unraid host path, preflight the
  ssh-agent/key check before daemon probes so failures name the SSH step instead of a generic
  connect error. Diagnosis states are payload fields, not new base enum members and not
  panel-local prose; while a context is unreachable the panel keeps rendering cached last-known
  state with the stale marker and read-only posture from section 2A.
gui_related: true
gui_classification_reason: Per-context unreachable diagnosis, single recovery actions, and stale read-only rendering are user-visible panel behavior.
depends_on: [CRAU-091, CRAU-095]
unblocks: []
acceptance_criteria:
  - Daemon-unreachable states classify as not_installed, not_running, socket_permission, ssh_auth_failed, or wrong_context per runtime context.
  - Each diagnosis state exposes exactly one primary recovery action as stated in canonical_text.
  - Remote SSH contexts preflight ssh-agent/key checks and disclose the exact failing step.
  - Diagnosis states travel as typed payload fields under the canonical reason codes, never as new base enum members or free-form prose.
  - Unreachable contexts render cached last-known state with stale marker and read-only posture.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future per-context daemon-unreachable diagnosis fixtures
risk_class: daemon_diagnosis_gap
reasoning_tier: standard
context_scope: docker_daemon_unreachable_diagnosis
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: daemon_unreachable_diagnosis_states
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Cozy Shelves panel review research digest - 2026-07-27 (vscode-docker/vscode-containers unreachable-daemon issue corpus)
  - Plans/Containers_Registry_and_Unraid.md:144
  - Plans/Containers_Registry_and_Unraid.md:196
  - user decision 2026-07-27 (Cozy Shelves panel review)
preserved_exact_tokens: ["not_installed", "not_running", "socket_permission", "ssh_auth_failed", "wrong_context", "runtime_context_unreachable"]
negative_constraints:
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - Do not add diagnosis states to the canonical reason-code base enum; they are payload sub-classification only.
  - Do not render a generic connect error where a per-context diagnosis is resolvable.
  - Do not blank the panel while unreachable; cached last-known state renders with stale marker and read-only posture.
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/FinalGUISpec.md
```

## Server-First Platform Capability Consumer Addendum - 2026-08-13

This addendum is the Containers platform-capability consumer of the server-first topology and shared integration-runtime contracts. It does not move, sync, copy, or update Project/app content; those behaviors remain with Project Sync/Backbone. It does not own generic installation, authentication, connection, lifecycle, or reusable projection state; those seams remain with `Plans/Shared_Integration_Runtime.md`. This document owns only container, standalone-Server, WSL/container-environment, Kubernetes-namespace, and host-capability behavior consumed by Docker Manager and Docker/Hosts.

ContractRef: ContractName:Plans/Shared_Integration_Runtime.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/FileSafe.md

### CRAU-100 - Project Server-First Topology Capability Boundary

```yaml
plan_unit_id: CRAU-100
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Container and host capability is resolved within one Project topology: exactly one Project Home Server and one
  physical Project Vault, with the Home Server as the default Execution Host. A Project may register additional
  Execution Hosts, and every executable operation names an explicit Execution Environment and Source Location rather
  than inferring either from the active Client, a mounted path, container id, or current shell. The Project Vault is
  physical project storage, not an Execution Host, container image layer, Tool Store, CLI-profile store, or generic
  source-location alias. This owner consumes the Shared Integration Runtime's read-only RuntimeTopologyProjection and
  its ProjectHomeServerId, ProjectVaultId, ExecutionHostId, ExecutionEnvironmentId, SourceLocationId, and
  TopologyGeneration bindings. Project Sync/Backbone owns Project/app-content sync, move, and update behavior; this
  owner never creates a second runtime-identity projection, content transport, source-location, or move authority.
gui_related: false
gui_classification_reason: This unit owns topology identity and platform-capability semantics, not visible layout or interaction design.
depends_on: [CRAU-090, CRAU-091, SIR-002]
unblocks: [CRAU-101, CRAU-102, CRAU-103]
acceptance_criteria:
  - Every container, server, Kubernetes, and host-capability operation resolves one Project Home Server, one physical Project Vault, one Execution Host, one Execution Environment, and one Source Location.
  - The Home Server is the deterministic default Execution Host; selecting an additional Host is explicit and receipt-visible.
  - Client location, mounted-path location, Source Location, Execution Environment, Execution Host, and physical Vault remain separate identities.
  - Containers consumes RuntimeTopologyProjection freshness and exact identity bindings; unavailable, stale, or conflicted topology cannot be replaced by a local guess.
  - No Containers flow claims ownership of Project Sync/Backbone content sync, move, app-content update, or source relocation.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future server-first topology identity fixtures
  - future Docker/Hosts route and receipt fixtures
risk_class: server_first_topology_identity_drift
reasoning_tier: high
context_scope: containers_server_first_topology
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager and Docker/Hosts platform-capability consumers
node_compile_hint:
  mode: containers_server_first_topology_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md#server-first-topology
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#execution-forms
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/SERVER_BACKBONE_INTEGRATION_RUNTIME_RETURN.md
preserved_exact_tokens:
  - "one Project Home Server"
  - "one physical Project Vault"
  - "Home Server as default Execution Host"
  - "additional Execution Hosts"
  - "Execution Environment"
  - "Source Location"
  - "RuntimeTopologyProjection"
  - "TopologyGeneration"
negative_constraints:
  - Do not infer the Execution Host or Environment from the active Client.
  - Do not treat the physical Project Vault as an execution runtime, image layer, Tool Store, profile store, or generic source-location alias.
  - Do not duplicate Project Sync/Backbone sync, move, or app-content ownership.
owner_boundary_notes:
  - "Project Sync/Backbone owns Project and app-content movement; Containers consumes topology identities only."
  - "Shared Integration Runtime owns runtime topology identities plus shared lifecycle and projection seams; Containers owns platform capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
```

### CRAU-101 - Execution Forms, WSL Isolation, And Kubernetes Namespace Scope

```yaml
plan_unit_id: CRAU-101
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Execution-capable forms include native Windows, native macOS, native Linux, standalone Server, Docker/TrueNAS/Unraid
  Server, Kubernetes Server, optional WSL2 environments, optional Apple Linux containers, and trusted SSH/remote
  Execution Hosts. Every standalone or container Server is execution-capable by default subject to proof-based
  readiness, policy, and host-local admission; it is not reduced to storage or a passive integration endpoint. Native
  Windows remains first-class and WSL Off is healthy. Each WSL distribution is an optional environment-specific
  Execution Environment: Windows-native and WSL tools, paths, profiles, resources, capability snapshots, and receipts
  never collapse together, and user-owned versus PM-managed distributions remain distinct. Kubernetes behavior is
  namespace-scoped and project/workload-focused by default; cluster-admin and cluster-wide mutation are not implied by
  Server capability or by the Docker Manager cluster-wide observation toggle. WSL acquisition admits exactly two modes:
  attach user-owned compatible WSL2 distribution, which probes and attaches an existing compatible distribution while
  its system updates stay user-owned, and install PM-managed signed/versioned .wsl distribution, which admits only a
  signed versioned PM image through Release supply-chain proof before the shared InstallationLifecycleManager acquires,
  verifies, activates, updates, repairs, rolls back, or removes it. Ownership sets the action boundary: user_owned
  distributions receive probes, attach, and only explicitly scoped PM dependency installs, while distro updates stay
  user-owned and repair can never reset, delete, or convert; pm_managed distributions receive PM-owned image updates,
  verification, repair, rollback, and removal, while PM never owns Windows WSL itself and reset or delete needs explicit
  destructive confirmation. Every distribution carries bounded per-distro probes for WSL and distro version and
  architecture, systemd, WSLg, GPU, network mode and localhost reachability, automount and source mounts with filesystem
  semantics, interop, CPU/memory/swap limits with observed global .wslconfig, idle and shutdown behavior, nested
  virtualization, and dependency packages with capability modules; each probe reports available, unavailable, or unknown
  explicitly, never assume fills a gap, and unavailable or unknown in a required capability cannot project that
  capability as Ready. Windows and Linux checkout
  mappings stay explicit and PM never duplicates/moves source silently. Lifecycle state, topology, and capability
  projection reuse the existing Shared Integration Runtime records; Containers mints no parallel WSL lifecycle,
  installation, update, or health truth.
gui_related: false
gui_classification_reason: This unit defines accepted execution forms, environment isolation, and Kubernetes capability scope rather than GUI presentation.
depends_on: [CRAU-091, CRAU-100, SIR-002, SIR-003, RSC-008]
unblocks: [CRAU-102, CRAU-103]
acceptance_criteria:
  - Native Windows, macOS, and Linux plus standalone and container Server forms each expose capability probes without being forced through WSL or Docker.
  - WSL Off passes as a healthy supported state and no flow silently enables, converts, resets, shuts down, or globally reconfigures a distribution.
  - Windows-native and each WSL distribution retain distinct Installation, profile, path, resource, capability, and receipt identities.
  - Kubernetes discovery and actions bind the selected context plus namespace and project/workload identity; no namespace is inferred for mutation.
  - Cluster-wide observation does not grant cluster-admin mutation or escape namespace-scoped policy.
  - WSL acquisition records exactly one of attach_user_owned or install_pm_managed; attach requires a compatibility probe pass and managed install requires a Release supply-chain proof ref before shared-lifecycle acquisition.
  - user_owned repair, update, and removal actions refuse reset, delete, convert, and unscoped system updates; pm_managed reset and delete require explicit destructive confirmation and PM never claims ownership of Windows WSL itself.
  - Every distribution probe set reports distro version/architecture, systemd, WSLg, GPU, network mode and localhost reachability, mounts with filesystem semantics, interop, limits with observed global config, idle/shutdown, nested virtualization, and dependencies with explicit available/unavailable/unknown outcomes.
  - WSL Off projects healthy with no warning or degraded-health condition; platform_unavailable stays explicit, and unknown probe outcomes never imply readiness for a capability that requires them.
  - Checkout mappings record explicit Windows and Linux paths; no flow moves, duplicates, or relocates source silently.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - Plans/wsl_execution_contracts.schema.json plus Plans/wsl_execution_contract_fixtures.json WSL acquisition, probe, and ownership checks (static)
  - future Kubernetes namespace-scope and permission-negative fixtures
risk_class: execution_environment_scope_drift
reasoning_tier: high
context_scope: containers_execution_forms_wsl_kubernetes
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/wsl_execution_contracts.schema.json
  - Plans/wsl_execution_contract_fixtures.json
  - future RuntimeHostFamilyProfile and Kubernetes capability probes
node_compile_hint:
  mode: execution_forms_environment_scope
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/01_OWNER_AND_ARCHITECTURE_BOUNDARIES.md#server-first-topology
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#execution-forms
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#wsl
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/EGOLITE_INTEGRATION_RUNTIME_RETURN.md#8-wsl-and-environment-profiles
  - PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/06_CROSS_PLATFORM_EXECUTION_AND_BROWSER.md#windows
  - PM_Server_First_Backbone_Implementation_Packet_FINAL_WAN_MVP_2026-08-14/source_authority/backbone_v5/11_CROSS_PLATFORM_EXECUTION_AND_BUILTIN_BROWSER_CONTRACT.md#7-optional-wsl2-linux-execution-backend
preserved_exact_tokens:
  - "Native Windows"
  - "Native macOS"
  - "Native Linux"
  - "Standalone Server"
  - "Docker/TrueNAS/Unraid Server"
  - "Kubernetes Server"
  - "Optional WSL2 environment"
  - "WSL Off is healthy"
  - "namespace-scoped"
  - "project/workload-focused"
  - "attach user-owned compatible WSL2 distribution"
  - "install PM-managed signed/versioned .wsl distribution"
  - "user_owned"
  - "pm_managed"
  - "never assume"
  - "never duplicates/moves source silently"
negative_constraints:
  - Do not require WSL for native Windows execution.
  - Do not silently convert WSL1, change the default distribution, rewrite global .wslconfig, reset a distribution, or shut down every distribution.
  - Do not collapse Windows-native and WSL installations, tools, paths, profiles, resources, or receipts.
  - Do not promote namespace-scoped Kubernetes support into cluster-admin authority.
  - Do not admit a PM-managed distribution without signed versioned Release proof routed before shared-lifecycle acquisition.
  - Do not let user_owned repair reset, delete, or convert a distribution, and do not take over its system updates without explicit delegation.
  - Do not fill an unavailable or unknown probe with an assumed available value or project its required capability Ready from it.
  - Do not move, duplicate, or relocate checkout source silently between Windows and WSL paths.
owner_boundary_notes:
  - "Shared Integration Runtime owns Installation, profile, connection, and reusable capability-projection lifecycles."
  - "Containers owns which platform forms are execution-capable and the Kubernetes namespace-scoped capability envelope."
  - "Release Supply Chain owns signed/versioned image admission proof; Containers consumes the proof ref and never re-verifies signatures."
  - "Shared Integration Runtime owns Installation, lifecycle state, topology, and capability projection; Containers owns WSL acquisition mode, ownership action boundaries, and per-distro probe semantics, and mints no parallel lifecycle truth."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Release_Supply_Chain.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### CRAU-102 - Host-Local Governor And Old-Hardware Capability Profiles

```yaml
plan_unit_id: CRAU-102
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Every Execution Host enforces RuntimeResourceGovernor admission locally before container, Server, Kubernetes, WSL,
  build, test, or provisioning work starts and throughout the operation. A remote coordinator or Client may request
  work but cannot bypass the target Host's physical CPU, memory, disk, process, network, thermal, or concurrency
  ceiling. Environments sharing one physical parent, including Windows plus WSL and sibling containers, consume one
  parent budget without double-counting capacity. RuntimeHostFamilyProfile capability is paired with explicit
  old-hardware profiles, including old-x86 and low-memory modes, that lower concurrency, pool size, cache size, probe
  cadence, log/artifact pressure, and optional-capability defaults. Unsupported optimized kernels or architecture
  paths degrade to proven compatible implementations; they never become readiness by assumption.
gui_related: false
gui_classification_reason: This unit defines local admission, physical budget sharing, and hardware capability policy rather than a visible resource UI.
depends_on: [CRAU-091, CRAU-100, CRAU-101, SIR-006, SIR-012]
unblocks: [CRAU-103]
acceptance_criteria:
  - The target Execution Host records a local governor admission or rejection for every execution-capable platform operation.
  - Remote requests cannot widen or bypass the target Host's effective governor ceiling.
  - Windows/WSL and container siblings share physical-parent budgets and cannot each advertise the full parent capacity.
  - Old-x86 and low-memory fixtures prove reduced concurrency, caches, probes, logs/artifacts, and optional-capability defaults.
  - Architecture-specific acceleration is selected only after runtime capability proof and has a compatible bounded fallback.
  - Governor decisions preserve the exact shared admitted, queued, admitted_degraded, permission_blocked, resource_blocked, or cancelled decision with effective limits and reevaluation evidence. Legacy admitted_reduced, blocked, and rejected rows are read/import-only inputs that normalize once at the shared-runtime owner boundary and are never emitted or displayed by this consumer.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future host-local governor admission and physical-parent budget fixtures
  - future old-x86 and low-memory RuntimeHostFamilyProfile fixtures
risk_class: host_local_resource_admission_drift
reasoning_tier: high
context_scope: containers_host_local_governor_profiles
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future RuntimeHostFamilyProfile capability and governor consumers
node_compile_hint:
  mode: host_local_governor_old_hardware_profiles
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#performance
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/07_SERVER_WSL_CONTAINER_RESOURCE_AND_SECURITY.md#wsl
preserved_exact_tokens:
  - "RuntimeResourceGovernor"
  - "host-local"
  - "physical parent budgets"
  - "old-x86"
  - "low-memory"
  - "runtime-dispatched optimized kernels"
  - "no startup probe storm"
  - "admitted_degraded"
  - "permission_blocked"
  - "resource_blocked"
negative_constraints:
  - Do not let a coordinator, Client, container, or WSL environment bypass the target Host governor.
  - Do not advertise the same physical capacity independently to sibling Environments.
  - Do not make old-hardware profiles cosmetic labels without measurable policy differences.
  - Do not require an optimized architecture-specific kernel when a bounded compatible path is available.
owner_boundary_notes:
  - "RuntimeResourceGovernor owns resource policy and admission; Containers binds its host-local decisions to platform capability."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/Permissions_System.md
```

### CRAU-103 - Proof-Based Platform Readiness And Shared Runtime Consumer Boundary

```yaml
plan_unit_id: CRAU-103
unit_type: validation
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Docker Manager and Docker/Hosts derive platform readiness from current, Host/Environment-bound proof rather than
  configured presence, PATH discovery, process exit zero, remembered success, or a generic connected flag. Proof covers
  executable or service identity, real path and owner/provenance where applicable, version and architecture, effective
  Host and Environment, engine/connection handshake, requested operations, permissions/FileSafe, RuntimeResourceGovernor
  admission, namespace or runtime scope, TopologyGeneration, and capability-snapshot currentness. Binary Locator
  supplies deterministic candidate discovery only. Plans/Shared_Integration_Runtime.md owns RuntimeTopologyProjection,
  InstallationResolver, InstallationLifecycleManager, reusable Installation/Profile/Connection lifecycles,
  CapabilitySnapshot, health projection, and continuation seams; Containers consumes those records and owns
  domain compatibility and post-setup container/Kubernetes/Server capability probes. Ambiguous, stale, unreachable,
  unsupported, unauthorized, or partially proven states remain manual-only, blocked, degraded, or partial capability and
  never project Ready.
gui_related: false
gui_classification_reason: This unit defines readiness evidence and owner routing; user-visible rendering remains a consumer concern.
depends_on: [CRAU-029, CRAU-040, CRAU-091, CRAU-100, CRAU-101, CRAU-102, BS-016, SIR-002, SIR-003, SIR-006]
unblocks: []
acceptance_criteria:
  - Readiness evidence is bound to exact Host, Execution Environment, generation, architecture, and capability scope.
  - Discovery or configured presence alone cannot produce Ready.
  - Binary Locator candidate and trace results are consumed as discovery input and never treated as installation, auth, connection, or domain-capability authority.
  - Shared lifecycle and capability projections are consumed without minting Containers-local duplicate Installation, Authentication, connection, update, or health truth.
  - InstallationResolver states ready, setup_required, approval_required, blocked, conflicted, and unavailable remain distinct inputs; only ready plus current domain proof may project platform Ready.
  - Container, Kubernetes, and Server domain adapters perform compatibility and post-setup capability probes after shared lifecycle verification.
  - Stale, ambiguous, unsupported, unauthorized, unreachable, and partial evidence stays explicitly non-ready.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Host/Environment-bound capability snapshot fixtures
  - future stale-generation, partial-capability, and discovery-not-ready negative fixtures
risk_class: platform_readiness_overclaim
reasoning_tier: high
context_scope: containers_proof_based_readiness
implementation_surfaces:
  - Plans/Containers_Registry_and_Unraid.md
  - future Docker Manager and Docker/Hosts readiness consumers
node_compile_hint:
  mode: proof_based_platform_readiness_consumer
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md#proof-based-ownership
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/06_INSTALLATION_AUTH_UPDATE_AND_CAPABILITY_PROVISIONING.md#shared-lifecycle
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/08_GUI_PLAN_COMMAND_WIRING_DRY_SCHEMA_EVENTS.md#gui-projections
  - PM_Remaining_Runtime_Integration_Final_CORRECTED_2026-08-13/reference/SERVER_BACKBONE_INTEGRATION_RUNTIME_RETURN.md
  - Plans/BinaryLocator_Spec.md
preserved_exact_tokens:
  - "proof-based readiness"
  - "Host/Environment"
  - "Binary Locator discovers candidates; it does not install"
  - "Partial capability"
  - "Installation"
  - "InstallationResolver"
  - "InstallationLifecycleManager"
  - "AuthenticationProfile"
  - "CapabilitySnapshot"
  - "RuntimeConnection"
  - "ClusterConnection"
  - "RegistryConnection"
negative_constraints:
  - Do not equate configured, discovered, installed, authenticated, connected, compatible, admitted, and Ready.
  - Do not treat process exit zero as capability or login proof.
  - Do not duplicate Shared Integration Runtime lifecycle, connection, or health-projection truth.
  - Do not let stale or partial proof project Ready.
compatibility_only_notes:
  - "The corrected source packet's AuthenticationProfile, RuntimeConnection, ClusterConnection, and RegistryConnection tokens route through the canonical Shared Integration Runtime Profile and Connection identities plus domain-owned subtype semantics; Containers must not mint peer lifecycle records for those source-lineage names."
owner_boundary_notes:
  - "Plans/Shared_Integration_Runtime.md owns shared lifecycle and projection seams."
  - "Plans/Containers_Registry_and_Unraid.md owns platform capability and domain post-setup probes."
  - "Plans/BinaryLocator_Spec.md owns deterministic discovery, not installation or readiness."
owner_hints:
  - Plans/Containers_Registry_and_Unraid.md
  - Plans/Shared_Integration_Runtime.md
  - Plans/BinaryLocator_Spec.md
  - Plans/Permissions_System.md
  - Plans/FileSafe.md
```

### CRAU-104 - Mode-Aware Publication And Build-Granted Deployment

```yaml
plan_unit_id: CRAU-104
unit_type: requirement
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: 'DockerHub repository creation/image push and managed template-repo create/push use Permissions
  PS-146/147/148 with distinct effects and the existing domain writer. In Regular, missing authority enters
  the real protected confirmation. Task YOLO and a current exact build grant may perform covered publication/create
  without another human click, recording mode or build_grant provenance instead of human_confirmed=true. The
  creation preview/report names namespace/repository/privacy with private default and capability limits. cmd.docker.create_repository
  validates; its domain writer may execute directly only with typed current mode/grant evidence. Existing .confirm/.cancel
  remain the human flow; a model cannot call .confirm to resolve a protected human wait. No confirmation_requested
  event is emitted when no person decision is pending.


  cmd.orchestrator.build_run remains local preparation and cmd.orchestrator.push_image a separate remote stage.
  after_build determines timing, not authority. Each follow-on create/push/template step evaluates exact authority
  once, so an admitted YOLO/grant build is not interrupted by duplicate publication modals. Preserve local
  result on failure/block, resume without rebuild only after verified repository creation, and reconcile unknown
  remote effects before retry. Result digest/tag/registry/namespace/platform and sanitized evidence remain
  owner-proven, with truthful partial capability and blocked versus failed outcomes.


  CI configuration/execution and Docker/Kubernetes deploy operations consume exact PS-147 resource/operation
  selectors, account/runtime/cluster/namespace/UID, permission generation and Stop/revocation epoch at dispatch.
  Listed non-destructive operations on named existing targets remain bounded; the risky-action no-repeat exception
  is only for verified grant-created resources and explicitly allowed operations. A same-name replacement,
  pre-existing/unrelated object, unlisted namespace child, broad prune or secret/paid-signup action gets no
  automatic authority. Grant creation provenance comes from the real effect receipt, never a prefix or discovered
  list item. FileSafe, DAE, network/trust/provider capability, scan/evidence and protected secret handling
  still apply.


  Every remote action feeds the existing ObservableWork/History What the build did projection with exact target/authority/outcome.
  Reuse the run owner''s Stop and owner-provided true Undo/compensation, explicitly saying No safe Undo where
  needed; stopping never erases or silently reverses in-flight effects. No parallel log, new build.* event
  family, separate runner or runtime-evidence claim is introduced.

  The selected V3 domain requests and results in Plans/projects_refresh_fix_contracts.schema.json carry exact command identity, operation/idempotency and return context. Repository create/confirm/cancel carry namespace/repository/privacy or pending request identity; image/tag push carries digest/tags/platforms/registry/account; template push carries immutable template/commit and its SCM authority supplement. OrchestratorLocalBuildV3 is Project-scoped, binds build profile/input/target and returns a local artifact with remote_effect_performed=false; OrchestratorImagePushV3 binds that successful result separately. Only template SCM publication uses Git branch/head/lease fields. Human confirm remains a real protected person decision. Unknown remote outcomes reconcile before retry through the existing writer.'
gui_related: true
gui_classification_reason: Approval cards, scope selection, live action targets and recovery controls are user-visible.
depends_on:
- PS-146
- PS-147
- PS-148
- F2-213
- RM-053
unblocks: []
acceptance_criteria:
- Regular protected confirm and YOLO/grant direct authority use the same sole creation writer and distinct
  true receipts.
- Successful build grants execute listed CI/deploy/publication without repeated prompts; unknown create preserves
  result and reconciles before retry.
- Grant-created exact-resource cleanup can pass; same-name/pre-existing/unrelated or unlisted resource refuses.
- Stop/revoke/current target and capability drift prevents new effects and action rows remain honest.
validation_surfaces:
- scripts/pm-projects-refresh-contracts.py
- scripts/pm-plan-index.py
risk_class: authority_scope_and_target_drift
reasoning_tier: high
context_scope: project_refresh_permissions_and_automation
implementation_surfaces:
- Plans/Containers_Registry_and_Unraid.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1/O1/O2/O3
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards approval envelope
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "I approve the outstanding
  questions with their recommended settings."'
- source_ref:projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#3-lane-d; cards Y1
- 'source_ref:share/puppet-master/2026-11-02-projects-pass2/README.md; Jared 2026-11-03: "YOLO mode needs to
  absolutely be able to git push and publish."'
- 'source_ref:chat:lane-D-phase-1-instruction; Jared: "The other risky actions still ask, unless they fall
  inside an approved build grant over things the build itself created."'
preserved_exact_tokens:
- cmd.docker.create_repository
- cmd.orchestrator.build_run
- cmd.orchestrator.push_image
- after_build
- human_confirmed=true
- ObservableWork/History
- What the build did
- No safe Undo
negative_constraints:
- No build/publish stage folding, fake click, forged human approver or blanket cleanup.
- No secret values in previews, YAML, redb, receipts, logs or fixture data.
- Acceptance of this specification creates no native handler, active EventRecord producer, WorkNode, NodeSeed,
  executable queue, production build task, readiness certification or governance seal.
owner_hints:
- Plans/Containers_Registry_and_Unraid.md
```

ContractRef: ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

## Command payload definitions (DL-333, 2026-11-05)

### CRAU-115 - Docker Registry Kubernetes Command Payload Definitions

```yaml
plan_unit_id: CRAU-115
unit_type: command_contract
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Typed payload definitions (DL-333) for the forty-five Docker Manager, registry and Kubernetes
  commands that UI_Command_Catalog UCC-049 through UCC-053 register and UCC-230 routes to this
  unit, including cmd.orchestrator.push_image, whose Docker publication contract is CRAU's: the
  build flow (select_target, run, the image/compose/bake build modes, bake preview and run),
  container lifecycle and access commands, image actions, compose subset and scenario commands,
  repository creation, promotion, tag push, image push, drift comparison, cleanup, the
  shell/view-state wrappers, and the project-focused Kubernetes family. The definitions block
  below gives each command its args, owner request and owner result in
  pm.command_payload_definitions.v1, with error and disabled-reason codes narrowed from the
  overlay's closed sets. The catalog keeps ids, labels, availability and aliases. Where a definition
  records no command_kind or disabled_reason_codes judgment, the value is the catalog's: the Docker
  Manager lifecycle, image, and cleanup rows table (UI_Command_Catalog.md) for container.stop, restart,
  delete, inspect and attach_shell, image.tag, inspect and delete, and cleanup.scan and prune, and the
  section 2.5A shell/view-state compatibility wrappers (command_kind shell_view) for cmd.docker.show,
  which takes no command-specific args, and cmd.docker.switch_subview. An owner_request of none means the command's
  Wiring_Matrix.production.json row names no request_schema_ref. response_kind is local_projection only
  for the route/open and view-state commands that have no owner result, since Contracts_V0's
  UICommandResponse determines response_kind by the actual owner contract. Compose scenario args take
  CRAU-096's scenario schema field names.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Docker Manager, registry and Kubernetes commands.
depends_on: [UCC-230, UCC-049, UCC-050, UCC-051, UCC-052, UCC-053, UCC-105, UCC-137, CRAU-007, CRAU-011, CRAU-012, CRAU-013, CRAU-014, CRAU-017, CRAU-031, CRAU-044, CRAU-095, CRAU-096, CRAU-098, CRAU-099, CV-304, CV-333, UCC-217, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to CRAU-115 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Every judgment a definition makes is in its judgments list with a key, a choice and a gap_note; the definitions block holds no YAML comment and names no review or evidence material (DL-341).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.docker.build.image, cmd.docker.build.compose, cmd.docker.build.bake, cmd.docker.build.run, cmd.docker.build.select_target, cmd.docker.bake.preview, cmd.docker.bake.run, cmd.docker.container.stop, cmd.docker.container.restart, cmd.docker.container.delete, cmd.docker.container.inspect, cmd.docker.container.view_logs, cmd.docker.container.attach_shell, cmd.docker.context.select, cmd.docker.image.tag, cmd.docker.image.inspect, cmd.docker.image.delete, cmd.docker.image.push, cmd.docker.open_dockerfile, cmd.docker.compose.up_subset, cmd.docker.compose.down_subset, cmd.docker.compose.scenario.save, cmd.docker.compose.scenario.run, cmd.docker.compose.scenario.edit, cmd.docker.compose.scenario.delete, cmd.docker.show, cmd.docker.switch_subview, cmd.docker.create_repository, cmd.docker.create_repository.confirm, cmd.docker.create_repository.cancel, cmd.docker.registry.promote, cmd.docker.registry.tag_push, cmd.docker.drift.compare, cmd.docker.cleanup.scan, cmd.docker.cleanup.prune, cmd.orchestrator.push_image, cmd.docker.k8s.apply, cmd.docker.k8s.diff, cmd.docker.k8s.logs, cmd.docker.k8s.exec, cmd.docker.k8s.port_forward, cmd.docker.k8s.select_context, cmd.docker.k8s.select_namespace, cmd.docker.k8s.helm_preview, cmd.docker.k8s.helm_install]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not widen the log-mode, subview, build-mode or privacy vocabularies beyond the values fixed here without an owner decision.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Commands_System.md, Plans/Contracts_V0.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: CRAU-115
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.docker.build.select_target
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 row-specific identity: capability_snapshot_ref for mutating or capability-gated actions; UCC-230 row_groups required when domain_action"
        dockerfile_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The row says select_target "Selects Dockerfile, context, target stage, platform, and build mode"
            (UI_Command_Catalog.md section 2.5A) and CRAU-011 prose names the same inputs, but no canon field
            name exists. JUDGMENT: optional ref naming the selected Dockerfile record; absent means the inferred
            target stands. Polyglot or monorepo ambiguity must prompt instead of guessing (CRAU-011 negative constraint).
        build_context_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            Same prose as dockerfile_ref ("context"); no canon field name. JUDGMENT: optional ref to the selected
            build context record.
        target_stage:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            "target stage" is named in prose only; no field name, bound or default. JUDGMENT: optional string,
            generic text bound.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: >-
            "platform" is named in prose only; item format (os[/arch[/variant]]) is stated nowhere. JUDGMENT:
            unique optional string list, bounds from DockerTagPushV3Request.platforms items.
        build_mode:
          type: enum
          required: false
          default: none
          values: [image, compose, bake]
          provenance: gap
          gap_note: >-
            The three build modes are canon (2.5A amended rows "Build mode `image`/`compose`/`bake`", DL-333
            resolution 3), but no field name carries the mode. JUDGMENT: build_mode with the canon mode tokens;
            absent leaves the preferred build mode as persisted panel state (CRAU-011).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildTargetSelectionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.select_target row gives only label, description and availability, and no Cozy lifecycle table lists it. It persists the selected build target as per-project state that later builds resolve to (CRAU-011), a state change like cmd.docker.context.select, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the docker_available && build_candidate_present gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.build.run
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: buildx_unavailable, code: partial_capability}
        - {owner_state: bake_unavailable, code: partial_capability}
        - {owner_state: compose_invalid, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.run row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs the selected build path and records the last successful build target plus validation snapshot, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && build_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. The run resolves to the persisted selected compose or Bake target (CRAU-011; section 2A project-aware build surfaces) and builds through docker buildx build after a preflight that resolves compose/config validity and buildx availability (CRAU-032). So CRAU-095's buildx_unavailable, and bake_unavailable when the selected target is a Bake target (section 2C: missing Bake capability disables Bake only), show as partial_capability, and compose_invalid, when the selected compose target fails validation (CRAU-093 reason-coded rows), shows as blocked_state_required, through UCC-230 owner_state_code_map, recorded in owner_state_codes. compose_service_missing is not listed: build.run names no services and builds the selected target whole. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
        - {key: omitted:build_target_ref, choice: omitted, gap_note: "build.run takes no subject arg: CRAU-011 requires the run to resolve to the persisted selected compose/bake target rather than rebuilding from a guessed default, so the handler reads the selection from per-project state. Canon names no per-dispatch subject field; if one is wanted it needs an owner decision."}
    - command_id: cmd.docker.build.image
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        dockerfile_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The mode row builds "the selected Dockerfile target (context, target stage, platforms)" resolving to
            the persisted selected target; no field name exists for a per-dispatch override. JUDGMENT: optional
            override ref; absent resolves to the persisted selection.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "see cmd.docker.build.select_target.platforms; same prose-only basis and judgment"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: buildx_unavailable, code: partial_capability}
      aliases:
        - {command_id: cmd.docker.build, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A and Cozy Shelves reconciliation: alias-of cmd.docker.build.image (selected path)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.image row gives only label, description and availability, and no Cozy lifecycle table lists it. It builds an image, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && build_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Image builds use docker buildx build after a preflight that resolves buildx availability (CRAU-032; section 2A persists buildx readiness for the build surfaces), so CRAU-095's buildx_unavailable shows as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes. compose_invalid and compose_service_missing are not listed: a Dockerfile build resolves no compose file."}
    - command_id: cmd.docker.build.compose
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 optional identity compose_project_ref?; kept optional because the mode row resolves to the persisted selected target"
        services:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            "builds the services of the selected compose file target" names services in prose only. JUDGMENT:
            optional service-name list restricting the build; absent builds the target's full service set, and
            min_items 1 refuses an empty list, which would restrict the build to nothing.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: buildx_unavailable, code: partial_capability}
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.compose row gives only label, description and availability, and no Cozy lifecycle table lists it. It builds compose services, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && build_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. It builds the services of the selected compose file through docker buildx build after a preflight that resolves compose/config validity and buildx availability (CRAU-032). So CRAU-095's buildx_unavailable shows as partial_capability, and compose_invalid and compose_service_missing (a services entry the file does not define), which CRAU-093 makes the reason-coded rows of compose validation, show as blocked_state_required, through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.build.bake
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        bake_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            "builds the selected Bake target and platforms" resolving to the persisted target; bake inputs
            (bake file, bake target, platforms) are prose words only (CRAU-011). JUDGMENT: optional per-dispatch
            override of the persisted bake target; absent resolves to the selection.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "see cmd.docker.build.select_target.platforms; same prose-only basis and judgment"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: bake_unavailable, code: partial_capability}
        - {owner_state: buildx_unavailable, code: partial_capability}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A build.bake row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a Bake build, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && bake_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A Bake build needs the runtime's Bake capability, and missing Bake capability disables Bake only, not the whole panel (section 2C); it is an image build, so CRAU-032's docker buildx build path and its buildx availability preflight apply too. So CRAU-095's bake_unavailable and buildx_unavailable show as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.bake.preview
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        bake_file_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The precondition bake_file_resolved makes the Bake file the subject, but no canon field names it.
            JUDGMENT: required ref to the resolved bake file record (HCL, YAML, JSON, Compose or generated
            metadata per CRAU-011).
        bake_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "same prose-only basis as cmd.docker.build.bake.bake_target; optional filter of the previewed target"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBakePreviewResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: bake_unavailable, code: partial_capability}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A bake.preview row gives only label, description and availability, and no Cozy lifecycle table lists it. It resolves the Bake graph through the Docker engine and returns a typed preview, not a route, so domain_action; navigation_wrapper would fit only if the preview were a view of already-resolved state."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && bake_file_resolved gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Previewing resolves the Bake graph and needs the runtime's Bake capability, which section 2C says disables Bake only when missing, so CRAU-095's bake_unavailable shows as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes. buildx_unavailable is not listed: a preview builds no image, and CRAU-032's buildx availability preflight runs before a build."}
    - command_id: cmd.docker.bake.run
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        bake_target:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            "Runs the selected cmd.docker.bake.* target" with precondition bake_target_selected; no field name.
            JUDGMENT: optional override; absent resolves to the persisted selected bake target.
        platforms:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "see cmd.docker.build.select_target.platforms; same prose-only basis and judgment"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerBuildRunResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      owner_state_codes:
        - {owner_state: bake_unavailable, code: partial_capability}
        - {owner_state: buildx_unavailable, code: partial_capability}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A bake.run row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs the selected Bake target, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the docker_available && bake_target_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A Bake build needs the runtime's Bake capability, and missing Bake capability disables Bake only, not the whole panel (section 2C); it is an image build, so CRAU-032's docker buildx build path and its buildx availability preflight apply too. So CRAU-095's bake_unavailable and buildx_unavailable show as partial_capability through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.container.stop
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability live_subject (container_running) makes the container the subject (lifecycle rows, UI_Command_Catalog.md)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, stale_projection]
      aliases:
        - {command_id: cmd.docker.stop, kind: compatibility_alias,
           source: "UI_Command_Catalog.md lifecycle-rows adjudication and Cozy Shelves reconciliation; UCC-136: dispatch only as a recorded alias normalizing to cmd.docker.container.stop"}
    - command_id: cmd.docker.container.restart
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability selection (container_selected) makes the container the subject (lifecycle rows)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerLifecycleResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, stale_projection]
      aliases:
        - {command_id: cmd.docker.restart, kind: compatibility_alias,
           source: "UI_Command_Catalog.md lifecycle-rows adjudication and Cozy Shelves reconciliation; UCC-136"}
    - command_id: cmd.docker.container.delete
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability selection (container_selected && !container_running) makes the stopped container the subject (lifecycle rows)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "lifecycle rows mark Confirmation strong; CS-062 lists cmd.docker.container.delete among destructive commands that dispatch only through the shared confirm surface; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      aliases: []
    - command_id: cmd.docker.container.inspect
      ucc_units: [UCC-049]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability selection (container_selected) makes the container the subject (lifecycle rows)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerInspectResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable]
      aliases:
        - {command_id: cmd.docker.inspect, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A: compatibility alias for cmd.docker.container.inspect"}
      judgments:
        - {key: response_kind, choice: owner_operation, gap_note: "The lifecycle table makes inspect a navigation_wrapper, and the 2.5A row says it shows structured inspect output with secret and redaction policy applied; canon names no result. owner_operation with the local inspect result is a choice, so the redacted output has a typed carrier; local_projection would leave it with none."}
    - command_id: cmd.docker.container.view_logs
      ucc_units: [UCC-049, UCC-105]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; 2.5A row precondition container_selected makes the container the subject"
        log_mode:
          type: enum
          required: false
          default: none
          values: [follow, paused_snapshot, historical_view]
          provenance: gap
          gap_note: "The three values are canon: each stream surface MUST distinguish follow, paused_snapshot and historical_view (section 2A Runtime stream, port-forward, crash-gap, and network trust continuity, Containers_Registry_and_Unraid.md:418). Canon names no command argument for them: the 2.5A logs row (UI_Command_Catalog.md:638) carries no payload field. JUDGMENT: the field name log_mode, carrying the mode on the command, and leaving it optional are this definition's choices."
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerLogStreamResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, degraded, stale_projection]
      aliases:
        - {command_id: cmd.docker.logs, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A: compatibility alias for cmd.docker.container.view_logs"}
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: the 2.5A row says only that it opens container logs with follow, paused snapshot and historical modes. It opens a read surface like container.inspect, which the lifecycle table makes navigation_wrapper, so navigation_wrapper. cmd.docker.k8s.logs, whose row has the same shape, takes the same kind."}
        - {key: response_kind, choice: owner_operation, gap_note: "Canon names no result; the owner opens a stream session (section 2A stream continuity: follow is restored only through a new stream session), so the stream session record is returned as a local owner result."}
        - {key: disabled_reason_codes, choice: [unreachable, degraded, stale_projection], gap_note: "No row states a subset for the docker_available && container_selected gate; engine reachability and stream health from the shared taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph) plus the 2.0B projection-freshness clause."}
        - {key: field:log_mode, choice: "default none", gap_note: "Canon fixes the three mode tokens (section 2A stream continuity) but no dispatch default. default none means the surface opens in its persisted stream intent, and follow is restored only after source revalidation creates a new stream session (section 2A)."}
        - {key: omitted:capability_snapshot_ref, choice: omitted, gap_note: "Not required here: the row gate docker_available && container_selected matches container.inspect, which the lifecycle table classifies as a selection gate, not a capability gate, and the UCC-230 row group requires capability_snapshot_ref only for domain_action. cmd.docker.k8s.logs keeps the field because its gate k8s_connected is a cluster-connectivity capability."}
    - command_id: cmd.docker.container.attach_shell
      ucc_units: [UCC-049, UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity container_ref?; row availability live_subject (container_running && capability_snapshot_current) makes the container the subject (lifecycle rows)"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        shell:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            Canon says shell actions honor the saved shell command preference instead of guessing an entry
            command (section 2A container access intelligence) and names no per-dispatch field. JUDGMENT:
            optional explicit override of the saved preference; absent uses the preference, never a guess.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerShellSessionResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, unauthorized, unreachable]
      aliases:
        - {command_id: cmd.docker.exec, kind: compatibility_alias,
           source: "UCC-049 compatibility_only_notes; UI_Command_Catalog.md section 2.5A: compatibility alias for cmd.docker.container.attach_shell"}
    - command_id: cmd.docker.context.select
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        runtime_context_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Canon names the Docker-engine context runtime_context, a durable runtime identity field (section 2A
            runtime identity; CRAU-017), and the Docker/Hosts route payload carries it as runtime_context_ref?
            (CRAU-092); CRAU-099's wrong_context diagnosis offers switch-context, which is this command. No row
            names this arg or types it. The arg takes CRAU-092's exact name and is typed ref by the UCC-230
            _ref rule. Whether the selection persists per project is not stated.
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 (capability-gated action)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContextSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: runtime_context_missing, code: not_configured}
        - {owner_state: runtime_context_unreachable, code: unreachable}
      aliases:
        - {command_id: cmd.docker.set_context, kind: compatibility_alias,
           source: "UI_Command_Catalog.md Docker compose and context adjudication rows; the prototype cmd.docker.set_context is recorded as its alias"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind (UCC-137 says only that it is the canonical Docker-engine context selector). Selecting the engine context changes the Docker target and revalidates capability, like cmd.docker.k8s.select_context, so domain_action; shell_view would fit only if it changed what the panel shows."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "Canon names no subset for this row; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. CRAU-095's runtime_context_missing and runtime_context_unreachable (CRAU-099 carries the diagnosis) show as not_configured and unreachable through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.image.tag
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity image_ref?; row availability selection (image_selected), Docker Manager lifecycle rows"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053: capability_snapshot_ref for mutating or capability-gated actions"
        new_tag:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            No canon field carries the new tag: the lifecycle row and the 2.5A image rows name none. Bounds reuse DockerTagPushV3Request.tags items
            (Plans/projects_refresh_fix_contracts.schema.json). JUDGMENT: also add Docker's tag grammar
            pattern ^[A-Za-z0-9_][A-Za-z0-9_.-]{0,127}$, or keep the reused bounds only.
        target_repository:
          type: object
          required: false
          default: none
          fields:
            namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                        provenance: canon, source: "DockerTagPushV3Request.namespace"}
            repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                              provenance: canon, source: "DockerTagPushV3Request.repository_name"}
          provenance: gap
          gap_note: >-
            JUDGMENT: Docker can tag into another repository (repo:tag). Choices: (a) drop this field, so a tag
            always stays in the source repository; (b) keep it optional as written, absent meaning the source
            image's repository.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerImageTagResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection]
      aliases: []
    - command_id: cmd.docker.image.inspect
      ucc_units: [UCC-049]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity image_ref?; row availability selection (image_selected), Docker Manager lifecycle rows"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerImageInspectResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable]
      aliases: []
      judgments:
        - {key: response_kind, choice: owner_operation, gap_note: "The lifecycle table makes image inspect a navigation_wrapper and canon names no result; owner_operation with the local inspect result gives the redacted structured output a typed carrier, as for cmd.docker.container.inspect."}
    - command_id: cmd.docker.image.delete
      ucc_units: [UCC-049]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity image_ref?; row availability selection (image_selected && !image_in_use), Docker Manager lifecycle rows"
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "lifecycle rows mark Confirmation strong; CS-062 lists cmd.docker.image.delete among destructive commands; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerImageMutationResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [blocked_state_required, stale_projection, permission_required]
      aliases: []
    - command_id: cmd.docker.image.push
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerImagePushV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.docker_image_push)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerImagePushV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerImagePushV3Request.namespace"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerImagePushV3Request.repository_name"
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: canon
          source: "DockerImagePushV3Request.image_digest"
        tags:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerImagePushV3Request.tags (array of unique strings 1..256, no minItems)"
        platforms:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerImagePushV3Request.platforms"
        local_artifact_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerImagePushV3Request.local_artifact_ref (string 1..256; typed ref here)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerImagePushV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerImagePushV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the amended 2.5A row (DL-333 resolution 2) says it pushes an approved image through registry publish authority with its own DockerImagePushV3Request. A remote publish side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset for the image_selected && registry_target_allowed && permission_allowed gate; registry account, target and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerImagePushV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
        - {key: omitted:image_ref, choice: omitted, gap_note: "The row precondition image_selected makes the image the subject, but the owner request identifies it by image_digest and local_artifact_ref, both args here; an image_ref beside them would be a second identity for the same image, so the overlay's optional image_ref is left out."}
    - command_id: cmd.docker.open_dockerfile
      ucc_units: [UCC-049]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: gap
          gap_note: >-
            No catalog row beyond the Cozy disposition (canonical existing token; build-pane wiring row required)
            types this command. JUDGMENT: route_target with the OpenFile route to the Dockerfile, following the
            route/open contract pattern; the alternative is a build_target_ref the owner resolves through the
            persisted selected target (same choice as the build flow, CRAU-011). UCC-230 canonical type kept.
        build_target_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            JUDGMENT: optional ref to the persisted build target whose Dockerfile opens; absent opens the inferred
            or explicitly selected Dockerfile of the active project (section 2A build surfaces).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon has no row for this command beyond the Cozy disposition (canonical existing token; build-pane wiring row required). It hands the Dockerfile to the editor like cmd.docker.compose.open_file, which the Cozy compose table makes navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset; resolved-target freshness plus engine gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
    - command_id: cmd.docker.compose.up_subset
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; 2.5A row precondition compose_subset_valid makes the compose project the subject"
        services:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            The row says up_subset starts "selected services/profiles/env files/ports from a compose scenario"
            but names no field. The canon candidate is CRAU-096's scenario field service_subset, which names a
            saved scenario's services, not an ad hoc subset. JUDGMENT: required unique service-name list named
            services; the selected subset is the subject of the command, and min_items 1 refuses an empty
            subset, which would start nothing.
        profiles:
          type: list
          required: false
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "same prose-only basis as services; CRAU-096 uses the same name profiles for a scenario's profiles. JUDGMENT: optional profile activation list"
        env_file_refs:
          type: list
          required: false
          default: none
          item: {type: ref}
          constraints: {unique_items: true}
          provenance: gap
          gap_note: "env files are named in prose only for this row; CRAU-096 uses the same name env_file_refs for a scenario's env files. JUDGMENT: optional refs to the selected env-file records"
        scenario_id:
          type: id
          required: false
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: gap
          gap_note: >-
            The row starts the subset "from a compose scenario" without naming the link; scenario_id is
            CRAU-096's scenario identity. JUDGMENT: optional scenario id recording which saved scenario the
            subset came from; scenario.run is the command that canonically records the scenario id on a run.
            Bounds as scenario.run's scenario_id (the docker.compose.scenario event payloads' non_empty_id).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeSubsetResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.up_subset row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts compose services, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && compose_subset_valid gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. The compose_subset_valid gate needs a valid compose file that defines every named service; CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so both show as blocked_state_required through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.down_subset
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; 2.5A row precondition compose_subset_running makes the running compose project the subject"
        services:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            The row says down_subset "Stops selected services from a compose scenario" with no field name or
            type. The canon candidate is CRAU-096's scenario field service_subset, as for up_subset. JUDGMENT:
            required unique service-name list named services, mirroring up_subset.services; min_items 1
            refuses an empty subset, which would stop nothing.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeSubsetResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.down_subset row gives only label, description and availability, and no Cozy lifecycle table lists it. It stops compose services, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && compose_subset_running gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Stopping a named subset resolves the compose file and the services it names; CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so both show as blocked_state_required through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.scenario.save
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compose_project_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; 2.5A row precondition compose_file_selected makes the compose project the subject"
        scenario:
          type: object
          required: true
          default: none
          fields:
            name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                   provenance: gap, gap_note: 'CRAU-096 names the scenario field name but gives it no type or bound, and the scenario event payloads do not carry it. JUDGMENT: required string with the generic 1..256 text bound'}
            service_subset: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                             constraints: {max_items: 256, unique_items: true}, provenance: canon,
                             source: 'CRAU-096 scenario schema field service_subset[]; item, max_items and unique_items from service_subset in Plans/event_payloads/containers/docker_compose_scenario_saved.schema.json (compose_name items: string 1..128, pattern ^[A-Za-z0-9][A-Za-z0-9_.-]*$; at most 256 unique items; no minItems), which requires the field'}
            profiles: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                       constraints: {max_items: 64, unique_items: true}, provenance: canon,
                       source: 'CRAU-096 scenario schema field profiles[]; item, max_items and unique_items from profiles in Plans/event_payloads/containers/docker_compose_scenario_saved.schema.json (compose_name items; at most 64 unique items)'}
            env_file_refs: {type: list, required: false, default: none, item: {type: ref}, constraints: {unique_items: true},
                            provenance: gap, gap_note: 'CRAU-096 names env_file_refs[] (a list) but types neither the items nor the bounds, and the scenario event payloads do not carry it. JUDGMENT: unique refs to env-file records, typed ref by the _ref suffix convention'}
            port_maps: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                        constraints: {unique_items: true}, provenance: gap, gap_note: 'CRAU-096 names port_maps[] (a list) but states no item shape, and the scenario event payloads do not carry it. JUDGMENT: unique string port specs with the generic 1..256 text bound, pending an owner-typed mapping record'}
            detach_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names detach_default but gives it no type; section 2A calls it the detached default of the scenario. JUDGMENT: boolean; absent means the saved scenario records no value for it, and the dispatch implies none'}
            log_follow_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names log_follow_default but gives it no type; section 2A calls it the log-follow default of the scenario. JUDGMENT: boolean; absent means the saved scenario records no value for it, and the dispatch implies none'}
          provenance: gap
          gap_note: >-
            CRAU-096 fixes the scenario schema's field names (scenario_id, name, service_subset[], profiles[],
            env_file_refs[], port_maps[], detach_default, log_follow_default) and says persisted payload
            schemas are owned by storage-plan.md, which types none of them; the scenario event payloads type
            service_subset and profiles. Not canon: the wrapper object named scenario, the types of name,
            detach_default and log_follow_default, and the item shapes of env_file_refs and port_maps.
            scenario_id is not an arg here: the owner assigns it on save and returns it in the result.
            JUDGMENT: one nested object with CRAU-096's names; profiles, env_file_refs and port_maps are
            optional, absent meaning none, and the owner writes an empty profiles list into the saved event,
            which requires the field.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
        - {command_id: compose.save_scenario, kind: compatibility_alias,
           source: "UCC-137 canonical_text: the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.save row gives only label, description and availability, and no Cozy lifecycle table lists it. It persists a scenario record, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the compose_file_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.compose.scenario.run
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        scenario_id:
          type: id
          required: true
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: canon
          source: "CRAU-096 scenario schema field scenario_id (a preserved token); bounds from scenario_id in Plans/event_payloads/containers/docker_compose_scenario_saved.schema.json and the other docker.compose.scenario event payloads (non_empty_id: string 1..200, pattern ^[A-Za-z0-9][A-Za-z0-9._:-]*$); the 2.5A scenario.run row runs a saved scenario and records the scenario id on the preview or development run"
        compose_project_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity compose_project_ref?; scenario lists live in project state (section 2A), so the project is implied and the ref stays optional"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
        - {command_id: compose.run_scenario, kind: compatibility_alias,
           source: "UCC-137 canonical_text: the flat compose.save_scenario and compose.run_scenario spellings recorded as compatibility aliases (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.run row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a saved scenario and records the scenario id on a run, a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && compose_scenario_valid gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A stale scenario opens degraded with repair actions (section 2A compose scenario runner). CRAU-096 keeps run disabled with exact reason codes until validation succeeds, and running the scenario's service_subset needs a valid compose file that defines every saved service; CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so both show as blocked_state_required through UCC-230 owner_state_code_map, recorded in owner_state_codes. blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.scenario.edit
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        scenario_id:
          type: id
          required: true
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: canon
          source: "CRAU-096 scenario schema field scenario_id (a preserved token); bounds from scenario_id in Plans/event_payloads/containers/docker_compose_scenario_edited.schema.json (non_empty_id: string 1..200, pattern ^[A-Za-z0-9][A-Za-z0-9._:-]*$); the 2.5A edit row's precondition compose_scenario_selected makes the selected scenario the subject"
        scenario:
          type: object
          required: true
          default: none
          fields:
            name: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                   provenance: gap, gap_note: 'CRAU-096 names name but gives it no type or bound, as in cmd.docker.compose.scenario.save. JUDGMENT: optional rename on edit'}
            service_subset: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                             constraints: {max_items: 256, unique_items: true}, provenance: canon,
                             source: 'CRAU-096 scenario schema field service_subset[]; item, max_items and unique_items from service_subset in Plans/event_payloads/containers/docker_compose_scenario_edited.schema.json (compose_name items: string 1..128, pattern ^[A-Za-z0-9][A-Za-z0-9_.-]*$; at most 256 unique items; no minItems)'}
            profiles: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 128, pattern: '^[A-Za-z0-9][A-Za-z0-9_.-]*$'}},
                       constraints: {max_items: 64, unique_items: true}, provenance: canon,
                       source: 'CRAU-096 scenario schema field profiles[]; item, max_items and unique_items from profiles in Plans/event_payloads/containers/docker_compose_scenario_edited.schema.json (compose_name items; at most 64 unique items)'}
            env_file_refs: {type: list, required: false, default: none, item: {type: ref}, constraints: {unique_items: true},
                            provenance: gap, gap_note: 'CRAU-096 names env_file_refs[] but types neither items nor bounds, as in cmd.docker.compose.scenario.save. JUDGMENT: unique refs'}
            port_maps: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                        constraints: {unique_items: true}, provenance: gap, gap_note: 'CRAU-096 names port_maps[] but states no item shape, as in cmd.docker.compose.scenario.save. JUDGMENT: unique string port specs with the generic 1..256 text bound'}
            detach_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names detach_default but gives it no type, as in cmd.docker.compose.scenario.save. JUDGMENT: boolean'}
            log_follow_default: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'CRAU-096 names log_follow_default but gives it no type, as in cmd.docker.compose.scenario.save. JUDGMENT: boolean'}
          provenance: gap
          gap_note: >-
            The edited scenario carries CRAU-096's field names, as in cmd.docker.compose.scenario.save; the
            wrapper object, the types of name, detach_default and log_follow_default and the item shapes of
            env_file_refs and port_maps are not canon. JUDGMENT: a partial-update object in which every field
            is optional and an absent field keeps the saved value; canon states no patch semantics, so whether
            an empty list clears a saved list is left to the owner.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.edit row gives only label, description and availability, and no Cozy lifecycle table lists it. It rewrites a scenario record, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the compose_scenario_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Canon conflict: the 2.5A edit row says edit 'Edits a saved scenario or repairs degraded scenario validation', while CRAU-096 and CRAU-011's acceptance criterion say run, edit and delete stay disabled with exact reason codes until validation succeeds, so edit cannot both repair a degraded scenario and stay disabled while it is degraded. This definition takes CRAU-096's side, the owner unit over the summary row, and lists degraded; section 2A's repair actions then have no command here, and the owner doc must settle whether edit is the repair path. CRAU-096 (and CRAU-011's acceptance criterion) keeps run, edit and delete disabled with exact reason codes until validation succeeds, and CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so a stale scenario disables edit with those codes, shown as blocked_state_required through UCC-230 owner_state_code_map and recorded in owner_state_codes; degraded stays for the degraded open of a stale scenario (section 2A). blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.compose.scenario.delete
      ucc_units: [UCC-050]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        scenario_id:
          type: id
          required: true
          default: none
          constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}
          provenance: canon
          source: "CRAU-096 scenario schema field scenario_id (a preserved token); bounds from scenario_id in Plans/event_payloads/containers/docker_compose_scenario_deleted.schema.json (non_empty_id: string 1..200, pattern ^[A-Za-z0-9][A-Za-z0-9._:-]*$); the 2.5A delete row's precondition compose_scenario_selected makes the selected scenario the subject"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "CS-062 lists cmd.docker.compose.scenario.delete among destructive commands that dispatch only through the shared confirm surface; UCC-230 envelope common optional confirmation_ref restated required"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerComposeScenarioResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: compose_invalid, code: blocked_state_required}
        - {owner_state: compose_service_missing, code: blocked_state_required}
      aliases:
        - {command_id: cmd.docker.compose.scenario.save/run/edit/delete, kind: family_alias,
           source: "UCC-050 compatibility_only_notes: the grouped scenario token denotes the family; payloads use the concrete ids"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A compose.scenario.delete row gives only label, description and availability, and no Cozy lifecycle table lists it. It deletes a scenario record (CS-062 lists it among destructive commands), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the compose_scenario_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. The destructive confirmation goes through the shared confirm surface (confirmation_ref), not a disabled code. CRAU-096 (and CRAU-011's acceptance criterion) keeps run, edit and delete disabled with exact reason codes until validation succeeds, and CRAU-093 makes compose_invalid and compose_service_missing the reason-coded rows of compose validation, so a stale scenario disables delete with those codes, shown as blocked_state_required through UCC-230 owner_state_code_map and recorded in owner_state_codes; degraded stays for the degraded open of a stale scenario (section 2A). blocked_state_required for compose_invalid and compose_service_missing is the mapping UCC-230's owner_state_code_map keeps open for the CRAU owner (DL-341 crau_owner_questions: blocked_state_required is not a family of the 2.5B taxonomy; if that taxonomy is binding, the nearest family is not_configured)."}
    - command_id: cmd.docker.create_repository
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCreateV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.docker_create_repository)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryCreateV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCreateV3Request.namespace; the row proposes the namespace/repository/privacy tuple (2.5A)"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCreateV3Request.repository_name"
        privacy:
          type: enum
          required: true
          default: none
          values: [private, public]
          provenance: canon
          source: "DockerRepositoryCreateV3Request.privacy; CRAU-031: default privacy for newly created repositories is private, and the dialog makes that default explicit while allowing user change"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCreateV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCreateV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerRepositoryCreateV3Request) that carries authority and expected_target_generation, which marks a guarded mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required], gap_note: "No row states codes for the registry_target_missing && permission_allowed gate (2.5A row); registry account and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCreateV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.create_repository.confirm
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        creation_request_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.creation_request_id (string 1..256); CRAU-031: confirm dispatches cmd.docker.create_repository.confirm for the pending request"
        preview_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.preview_ref (string 1..256; typed ref here); the confirmation shows namespace, repository name, privacy and the private-by-default notice (CRAU-031)"
        preview_sha256:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.preview_sha256 (pattern ^[0-9a-f]{64}$)"
        person_decision_evidence:
          type: contract
          ref: Plans/shared_integration_runtime.schema.json#/$defs/OwnerEvidenceRefV1
          required: true
          default: none
          provenance: canon
          source: "DockerRepositoryConfirmV3Request.person_decision_evidence (OwnerEvidenceRefV1); the same request pins authority.authority_kind to human (CRAU-031: no automated route fabricates a human confirmation)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryConfirmV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryConfirmV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerRepositoryConfirmV3Request) that carries authority and expected_target_generation, which marks a guarded mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required], gap_note: "No row states codes for the repository_creation_confirmation_visible gate (2.5A row); registry account and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryConfirmV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice. The request also requires registry_id, account_ref, namespace, repository_name and privacy; the handler copies them from the pending creation request that creation_request_id names, the tuple the confirmation shows (CRAU-031), so the user confirms exactly what cmd.docker.create_repository proposed. CRAU-031's acceptance criterion says the confirmation dialog makes the private default explicit 'while allowing user change before creation', and no unit says which command carries that change. This definition takes no privacy arg: preview_sha256 binds the confirm to the preview the user saw, so a privacy change in the dialog re-dispatches cmd.docker.create_repository with the new privacy, which produces a new pending request and preview, and the user confirms that one. The alternative, an optional privacy arg (DockerRepositoryConfirmV3Request.privacy) that overrides the pending value, would confirm a tuple the preview did not show."}
    - command_id: cmd.docker.create_repository.cancel
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        creation_request_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerRepositoryCancelV3Request.creation_request_id (string 1..256); CRAU-031: cancel dispatches cmd.docker.create_repository.cancel"
        expected_request_revision:
          type: integer
          required: true
          default: none
          constraints: {minimum: 0}
          provenance: canon
          source: "DockerRepositoryCancelV3Request.expected_request_revision (integer, minimum 0)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCancelV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCancelV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerRepositoryCancelV3Request) that carries authority and expected_target_generation, which marks a guarded mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required], gap_note: "No row states codes for the repository_creation_confirmation_visible gate (2.5A row); registry account and permission gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerRepositoryCancelV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.registry.promote
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        operation:
          type: enum
          required: true
          default: none
          values: [promote, copy, retag]
          provenance: gap
          gap_note: >-
            The row says promote "Promotes, copies, or retags a digest-first artifact" (2.5A) with no typed
            request (only the wiring row catalog.docker_registry_promote). JUDGMENT: required enum of the three
            prose verbs in snake_case; no default, because the verbs differ in remote effect.
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: gap
          gap_note: >-
            Digest-first artifact identity is canon (CRAU-012), but no promote field list exists. JUDGMENT:
            bounds and pattern reused from DockerTagPushV3Request.image_digest.
        source:
          type: object
          required: true
          default: none
          fields:
            namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                        provenance: gap, gap_note: 'source namespace/repository is canon prose (CRAU-012 receipt capture); type reused from DockerTagPushV3Request.namespace'}
            repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                              provenance: gap, gap_note: 'source namespace/repository is canon prose (CRAU-012); type reused from DockerTagPushV3Request.repository_name'}
          provenance: gap
          gap_note: "JUDGMENT: nested source object; canon names the source namespace/repository pair only in prose"
        target:
          type: object
          required: true
          default: none
          fields:
            registry_id: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                          provenance: gap, gap_note: 'the selected target registry (2.5A row); type reused from DockerTagPushV3Request.registry_id'}
            namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                        provenance: gap, gap_note: 'destination namespace/repo is canon prose (CRAU-012); type reused from DockerTagPushV3Request.namespace'}
            repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                              provenance: gap, gap_note: 'destination namespace/repo is canon prose (CRAU-012); type reused from DockerTagPushV3Request.repository_name'}
            tags: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                   constraints: {min_items: 1, unique_items: true}, provenance: gap, gap_note: 'the target tag or tags (2.5A row); item bounds and unique_items reused from DockerTagPushV3Request.tags, which has no minItems. JUDGMENT: min_items 1, because a promotion or retag without a target tag has no destination'}
          provenance: gap
          gap_note: "JUDGMENT: nested target object; canon names the target registry/repo/tag only in prose"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerRegistryPromoteResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A registry.promote row gives only label, description and availability, and no Cozy lifecycle table lists it. It promotes, copies or retags an artifact in a registry, a registry-side remote side effect (CRAU-012), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset for the registry_source_resolved && registry_target_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability). CRAU-012 blocks promotion with a precise remote blocker, carried as display detail."}
    - command_id: cmd.docker.registry.tag_push
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerTagPushV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.docker_registry_tag_push)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerTagPushV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerTagPushV3Request.namespace"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "DockerTagPushV3Request.repository_name"
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: canon
          source: "DockerTagPushV3Request.image_digest; the row applies the approved /tag/push action to a digest-first artifact (2.5A)"
        tags:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerTagPushV3Request.tags (array of unique strings 1..256, no minItems)"
        platforms:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "DockerTagPushV3Request.platforms"
        local_artifact_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "DockerTagPushV3Request.local_artifact_ref (string 1..256; typed ref here)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerTagPushV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerTagPushV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (DockerTagPushV3Request) that carries authority and expected_target_generation, which marks a guarded remote publish, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset for the registry_target_allowed && permission_allowed gate (2.5A row); drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability)."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/DockerTagPushV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.orchestrator.push_image
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        run_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.run_id; UCC-230 envelope common optional run_id restated required (the after-build push belongs to a run)"
        build_result_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.build_result_ref (string 1..256; typed ref here); the push resumes from the preserved local build result (CRAU-044)"
        build_result_sha256:
          type: sha256
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.build_result_sha256 (pattern ^[0-9a-f]{64}$)"
        registry_id:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "OrchestratorImagePushV3Request.registry_id (Plans/projects_refresh_fix_contracts.schema.json; wiring catalog.orchestrator_push_image)"
        account_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.account_ref (string 1..256; typed ref here)"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "OrchestratorImagePushV3Request.namespace"
        repository_name:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: canon
          source: "OrchestratorImagePushV3Request.repository_name"
        image_digest:
          type: string
          required: true
          default: none
          constraints: {pattern: '^sha256:[0-9a-f]{64}$'}
          provenance: canon
          source: "OrchestratorImagePushV3Request.image_digest"
        tags:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "OrchestratorImagePushV3Request.tags (array of unique strings 1..256, no minItems)"
        platforms:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {unique_items: true}
          provenance: canon
          source: "OrchestratorImagePushV3Request.platforms"
        local_artifact_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "OrchestratorImagePushV3Request.local_artifact_ref (string 1..256; typed ref here)"
      owner_request: Plans/projects_refresh_fix_contracts.schema.json#/$defs/OrchestratorImagePushV3Request
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: Plans/projects_refresh_fix_contracts.schema.json#/$defs/OrchestratorImagePushV3Result
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: the 2.5A row and the wiring row give a typed owner request (OrchestratorImagePushV3Request) that carries authority and expected_target_generation, which marks the Orchestrator after-build remote side-effect step (2.5A authority-split paragraph), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, permission_required], gap_note: "No row states a subset; publish authority gates drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability). A missing repository stays a separate admitted creation effect (CRAU-031, CRAU-044), not a disabled code here."}
        - {key: owner_request, choice: "Plans/projects_refresh_fix_contracts.schema.json#/$defs/OrchestratorImagePushV3Request", gap_note: "The owner request also requires command_id, context, authority, expected_target_generation, filesafe_evidence, trust_evidence and capability_evidence, which are not args. The handler fills command_id from the dispatch, context from the active project and publication target, authority, filesafe_evidence, trust_evidence and capability_evidence from the Permissions admission and the capability snapshot (UCC-217: Permissions alone composes human, mode or build_grant evidence with retained FileSafe, trust and capability ceilings), and expected_target_generation from the projection the user acted on. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.drift.compare
      ucc_units: [UCC-051]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        compare_target:
          type: enum
          required: false
          default: none
          values: [last_build, last_publish, last_deploy]
          provenance: gap
          gap_note: >-
            The baseline (last build | last publish | last deploy) and the compared subjects (Dockerfile,
            compose/bake, manifests) are prose only (2.5A drift.compare row; section 2A drift detection names
            a persisted compare target). JUDGMENT: optional enum of the three baselines in snake_case; absent
            compares against the persisted compare target; no subjects field is minted because the owner
            compares every detected local intent.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerDriftCompareResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A drift.compare row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a comparison against registry and deploy metadata with a typed result and receipt, not a route, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the docker_project_detected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Drift and trust blockers refresh effective capability before mutation (UCC-053)."}
    - command_id: cmd.docker.cleanup.scan
      ucc_units: [UCC-051, UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref; row availability capability (docker_available), Docker Manager lifecycle rows"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerCleanupScanResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [unreachable, degraded]
      aliases: []
    - command_id: cmd.docker.cleanup.prune
      ucc_units: [UCC-051, UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref; UCC-230 row_groups required when domain_action"
        confirmation_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "lifecycle rows mark Confirmation strong; CS-062 lists cmd.docker.cleanup.prune among destructive commands; UCC-230 envelope common optional confirmation_ref restated required"
        scan_result_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The row executes approved cleanup targets after dry-run review with availability record_only
            (scan_results_present), but names neither the scan result nor the selected target set. JUDGMENT:
            required ref to the reviewed dry-run scan record.
        targets:
          type: list
          required: true
          default: none
          item: {type: string, constraints: {min_length: 1, max_length: 256}}
          constraints: {min_items: 1, unique_items: true}
          provenance: gap
          gap_note: >-
            The approved cleanup target set has no field name or item shape. JUDGMENT: unique string target
            descriptors drawn from the scan record, and min_items 1 refuses an empty approval, which would
            prune nothing; conservative defaults never delete assets tied to active previews or recent
            receipts (CRAU-013).
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerCleanupPruneResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [stale_projection, permission_required]
      aliases: []
    - command_id: cmd.docker.show
      ucc_units: [UCC-050]
      command_kind: shell_view
      response_kind: local_projection
      args: {}
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded]
      aliases: []
      judgments:
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded], gap_note: "No row states a subset. Docker Manager still renders cached last-known state when the runtime is unreachable (section 2A), so these codes are availability copy from the shared taxonomy, not a block on opening the panel."}
    - command_id: cmd.docker.switch_subview
      ucc_units: [UCC-050]
      command_kind: shell_view
      response_kind: local_projection
      args:
        subview:
          type: enum
          required: true
          default: none
          values: [containers, images, compose, registries, registries_docker_hub, build_bake, publish_unraid, networks, volumes, contexts, kubernetes]
          provenance: gap
          gap_note: >-
            CRAU-007 names the routeable subviews as display names only: Containers, Images, Compose, Registries,
            Registries / Docker Hub, Build / Bake, Publish / Unraid (Publishing / Unraid is a legacy alias),
            advanced Networks, Volumes, Contexts, and project-focused Kubernetes, and its acceptance criterion
            says all stable subviews and advanced foldouts remain named and routeable. CRAU-098's six side-panel
            tabs are a presentation subset of that list, and section 2A calls Networks, Volumes and Contexts
            advanced foldouts, so the eleven routeable values do not conflict with six tabs. Canon fixes no wire
            tokens: JUDGMENT: the snake_case of the eleven names, dropping only the legacy alias.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, handler_unavailable, internal_error]
      disabled_reason_codes: [unsupported, not_configured, unreachable, degraded]
      aliases: []
      judgments:
        - {key: disabled_reason_codes, choice: [unsupported, not_configured, unreachable, degraded], gap_note: "No row states a subset; unsupported runtime-specific subviews stay visible with a disabled reason (section 2A), and the rest come from the shared taxonomy."}
    - command_id: cmd.docker.k8s.apply
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; Kubernetes mutations bind approval to the selected context, namespace, workload/resource, and operation (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; mutation approval binds the namespace (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        manifest_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The selected manifest (or Helm-rendered manifest) has no field name (2.5B apply row). JUDGMENT:
            required ref to the selected manifest record inside the selected project scope.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sApplyResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.apply row gives only label, description and availability, and no Cozy lifecycle table lists it. It applies a manifest to the cluster, a mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && manifest_selected && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus approval and preflight blocking plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.k8s.diff
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        manifest_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "manifest and optional workload target have no field names (2.5B diff row). JUDGMENT: required ref to the selected manifest record"
        kubernetes_context:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the row diffs against the selected context, namespace, or workload where supported (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; diff target part (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        k8s_workload_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "the optional workload diff target has no field name (2.5B diff row). JUDGMENT: ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sDiffResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.diff row gives only label, description and availability, and no Cozy lifecycle table lists it. It runs a comparison against the live cluster with a typed result, capability-gated by k8s_connected, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the k8s_connected && manifest_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.k8s.logs
      ucc_units: [UCC-052]
      command_kind: navigation_wrapper
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref for mutating or capability-gated actions; the 2.5B logs row's precondition k8s_connected && workload_selected"
        k8s_workload_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            Workload/pod/container target fields are prose only (2.5B logs row; section 2A Kubernetes
            operational sessions: kubectl logs can target pods, resources, and all containers). JUDGMENT:
            required (workload_selected), ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name.
        container:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "container targeting is prose only; JUDGMENT: optional container name, absent streams all containers"
        log_mode:
          type: enum
          required: false
          default: none
          values: [follow, paused_snapshot, historical_view]
          provenance: gap
          gap_note: "The three values are canon: the 2.5B logs row names follow, paused snapshot and historical modes (UI_Command_Catalog.md:677), and section 2A stream continuity fixes the tokens follow, paused_snapshot and historical_view (Containers_Registry_and_Unraid.md:418). Canon names no command argument for them. JUDGMENT: the field name log_mode, carrying the mode on the command, and leaving it optional are this definition's choices, as for cmd.docker.container.view_logs."
        kubernetes_context:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the log stream runs in the selected context. Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; namespace/workload focus is persisted K8s focus state (CRAU-014). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sLogStreamResultV1
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: the 2.5B row says only that it opens workload or pod logs with follow, paused snapshot and historical modes, the same shape as cmd.docker.container.view_logs. Both open a read surface like container.inspect, which the lifecycle table makes navigation_wrapper, so both take navigation_wrapper; error_codes gain invalid_route by the UCC-230 navigation rule."}
        - {key: response_kind, choice: owner_operation, gap_note: "Canon names no result; the owner opens an ephemeral owner-surface log session (CRAU-014), returned as a local owner result, as for cmd.docker.container.view_logs."}
        - {key: field:capability_snapshot_ref, choice: required, gap_note: "Kept required although the kind is navigation_wrapper: the overlay asks for capability_snapshot_ref on capability-gated actions, and this row's gate k8s_connected is a cluster-connectivity capability. container.view_logs leaves the field out because its gate matches container.inspect's selection gate."}
        - {key: field:log_mode, choice: "default none", gap_note: "Canon fixes the mode tokens (section 2A stream continuity; the 2.5B row names follow, paused snapshot and historical) but no dispatch default; default none opens the surface in its persisted stream intent, as for cmd.docker.container.view_logs."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the k8s_connected && workload_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus stream freshness."}
    - command_id: cmd.docker.k8s.exec
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        k8s_workload_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "pod/container target fields are not defined (2.5B exec row). JUDGMENT: required (workload_running), ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name"
        container:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "the selected pod/container pair has no field names. JUDGMENT: optional container name within the workload"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the session binds to the selected context (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the session binds to the namespace (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sExecSessionResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.exec row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts an audited privileged exec session in the cluster, permission-gated (permission_allowed), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && workload_running && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus permission and preflight blocking plus the 2.0B projection-freshness clause."}
        - {key: omitted:exec_command, choice: omitted, gap_note: "Canon names no exec entry command and no stream input (the 2.5B row says only that it starts an audited privileged exec session in the selected pod/container). The audited session record carries them, and this definition mints no field; the compile review must decide whether the dispatch names an entry command or the session honors a saved shell preference as cmd.docker.container.attach_shell does (section 2A container access)."}
    - command_id: cmd.docker.k8s.port_forward
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        k8s_workload_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "the workload target is prose only (2.5B port_forward row). JUDGMENT: required (workload_selected), ref, named k8s_workload_ref: CRAU's Kubernetes workload identity, which stores context, namespace/name, kind, UID when knowable and source repo/root (section 2A workload history; CRAU-017). The broader durable runtime identity workload_ref (section 2A runtime identity, CV-303) was the other candidate; the exact-name rule takes the Kubernetes-specific name"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the session binds to the selected context (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the session binds to the namespace (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        remote_port:
          type: integer
          required: true
          default: none
          constraints: {minimum: 1, maximum: 65535}
          provenance: gap
          gap_note: "the forwarded port is named in prose only. JUDGMENT: required integer in the TCP port range"
        local_bind_address:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "local bind address/port recorded is prose only (2.5B row; port-forward rebinding records local port reuse versus new allocation, section 2A). JUDGMENT: optional bind address, absent lets the owner assign"
        local_port:
          type: integer
          required: false
          default: none
          constraints: {minimum: 1, maximum: 65535}
          provenance: gap
          gap_note: "JUDGMENT: optional explicit local port; absent allocates one, and rebinding records reuse versus new allocation (section 2A)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sPortForwardResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.port_forward row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts an audited port-forward session, permission-gated (permission_allowed), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && workload_selected && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus permission and preflight blocking plus the 2.0B projection-freshness clause."}
    - command_id: cmd.docker.k8s.select_context
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (capability-gated action)"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the row selects the project-focused Kubernetes context and revalidates capability (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sContextSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: k8s_context_missing, code: not_configured}
        - {owner_state: k8s_context_unreachable, code: unreachable}
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases until migrated"}
        - {command_id: set_context, kind: compatibility_alias,
           source: "UCC-137 canonical_text: cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and set_namespace recorded aliases; UCC-052 compatibility_only_notes (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.select_context row gives only label, description and availability, and no Cozy lifecycle table lists it. It selects the context and revalidates capability, a state change like cmd.docker.context.select, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the k8s_available gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. CRAU-095's k8s_context_missing and k8s_context_unreachable show as not_configured and unreachable through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.k8s.select_namespace
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (capability-gated action)"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the row selects the namespace within the selected context (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the row selects the namespace and refreshes workload focus (2.5B). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerK8sNamespaceSelectResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      owner_state_codes:
        - {owner_state: k8s_namespace_missing, code: not_configured}
      aliases:
        - {command_id: cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace, kind: family_alias,
           source: "UCC-052 preserved_exact_tokens: the grouped token denotes the canonical Docker Manager Kubernetes family"}
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.*, set_context, and set_namespace rows are compatibility aliases until migrated"}
        - {command_id: set_namespace, kind: compatibility_alias,
           source: "UCC-137 canonical_text: cmd.docker.k8s.select_context and cmd.docker.k8s.select_namespace are canonical with set_context and set_namespace recorded aliases; UCC-052 compatibility_only_notes (UCC-230 non_definition_tokens, DL-341)"}
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.select_namespace row gives only label, description and availability, and no Cozy lifecycle table lists it. It selects the namespace and refreshes workload focus inside the selected context, a state change, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset for the k8s_connected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. CRAU-095's k8s_namespace_missing shows as not_configured through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
    - command_id: cmd.docker.k8s.helm_preview
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        helm_source_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The selected release/chart has no field names (2.5B helm_preview row). JUDGMENT: one required ref
            to the selected Helm source record; splitting release from chart stays open for the compile review.
        kubernetes_context:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; rendering needs no connected cluster (precondition k8s_project_detected). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; optional render target namespace. Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerHelmPreviewResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, partial_capability, stale_projection]
      aliases:
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: aliases, choice: [cmd.k8s.*], gap_note: "UCC-052 records two alias tokens for the Kubernetes family: the grouped token cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace and the cmd.k8s.* compatibility rows. The grouped token names only its own seven commands (UCC-230 non_definition_tokens), and Helm preview is not one of them, so this definition records only cmd.k8s.*. Canon does not say whether cmd.k8s.* covers the Helm rows; UCC-052 calls the existing cmd.k8s.* rows compatibility aliases until migrated without listing them."}
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.helm_preview row gives only label, description and availability, and no Cozy lifecycle table lists it. It renders Helm output through the Helm tool with a typed result, gated by helm_source_selected, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, partial_capability, stale_projection], gap_note: "No row states a subset for the k8s_project_detected && helm_source_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Helm availability is a doctor check (section 2A)."}
    - command_id: cmd.docker.k8s.helm_install
      ucc_units: [UCC-052]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        capability_snapshot_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-049..UCC-053 identity capability_snapshot_ref (mutating or capability-gated); UCC-230 row_groups required when domain_action"
        helm_source_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: "same prose-only basis as cmd.docker.k8s.helm_preview.helm_source_ref (2.5B helm_install row)"
        values_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "the values source is named in prose only. JUDGMENT: optional ref to the selected values record; absent renders chart defaults"
        kubernetes_context:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity kubernetes_context?; the install binds to the selected context (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes context and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
        namespace:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "overlay UCC-049..UCC-053 identity namespace?; the install binds to the namespace (2.5B mutation scoping). Canon gives the name only; type string and bounds 1..256 are a choice, since no contract types the Kubernetes namespace and the name has no _id or _ref suffix for the UCC-230 identity_typing rule"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerHelmInstallResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection]
      aliases:
        - {command_id: cmd.k8s.*, kind: compatibility_alias,
           source: "UCC-052 compatibility_only_notes: existing cmd.k8s.* rows are compatibility aliases until migrated"}
      judgments:
        - {key: aliases, choice: [cmd.k8s.*], gap_note: "As for cmd.docker.k8s.helm_preview: the grouped token cmd.docker.k8s.apply/diff/logs/exec/port_forward/select_context/select_namespace names only its own seven commands (UCC-230 non_definition_tokens), so this definition records only the cmd.k8s.* compatibility family (UCC-052 compatibility_only_notes), which canon does not list command by command."}
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5B k8s.helm_install row gives only label, description and availability, and no Cozy lifecycle table lists it. It installs or upgrades a release after permission and diff review, a cluster mutation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required, stale_projection], gap_note: "No row states a subset for the k8s_connected && helm_source_selected && permission_allowed gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability), plus permission and preflight blocking after diff review plus the 2.0B projection-freshness clause."}
        - {key: omitted:diff_review_ref, choice: omitted, gap_note: "The 2.5B row requires a diff review before install but canon names no field that carries it. This definition mints none; the open question for the compile review is whether the dispatch names the reviewed diff (for example the DockerK8sDiffResultV1 diff_output_ref) or the owner checks a recorded review for the same helm_source_ref, context and namespace. Until then an install without a review is blocked with blocked_state_required."}
  results:
    DockerBuildTargetSelectionResultV1:
      fields:
        build_target_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the persisted selected build target (section 2A build surfaces persist the selection; CRAU-011 resolves later runs to it); the record shape and field name are typed nowhere. JUDGMENT: ref, named as in the cmd.docker.open_dockerfile arg. No validation snapshot here: section 2A persists the validation snapshot beside the last successful build target, and the 2.5A build.run row makes the run the command that records it'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; the wiring row requires a receipt or event effect (catalog.docker_build_select_target), the record shape is typed nowhere"}
    DockerBuildRunResultV1:
      fields:
        build_result_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: "structured build results including artifacts, logs, and image identity are canon (Build flow, section 2A); the result record's field names are typed nowhere. JUDGMENT: one ref to the build result"}
        validation_snapshot_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the run "records last successful build target plus validation snapshot" (UI_Command_Catalog.md section 2.5A build.run row) in prose only; the field name validation_snapshot_ref and its ref type are coined'}
        image_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "image identity is canon for build results (section 2A Build flow); present for image-mode results, absent for compose/bake modes"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_build_run), shape typed nowhere"}
    DockerBakePreviewResultV1:
      fields:
        bake_targets: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}}, provenance: gap, gap_note: '"Previews resolved Bake targets and platforms" names the content in prose only; JUDGMENT: resolved target names'}
        platforms: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}}, constraints: {unique_items: true}, provenance: gap, gap_note: "resolved platforms per target; the pairing of target to platform is unstated, so a flat unique list is a judgment"}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: "dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_bake_preview), shape typed nowhere"}
    DockerContainerLifecycleResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container acted on; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; the wiring rows require a receipt or event effect (catalog.docker_container_stop/restart/delete), shape typed nowhere'}
    DockerContainerInspectResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the inspected container; name canon (row-group identity), result shape typed nowhere'}
        inspect_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'structured inspect output with secret and redaction policy applied (lifecycle rows); the record shape is typed nowhere'}
    DockerLogStreamResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container whose logs are streamed; name canon (row-group identity), result shape typed nowhere'}
        stream_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'follow intent is restored only after source revalidation and creation of a new stream session (section 2A stream continuity); the session record shape is typed nowhere'}
        log_mode: {type: enum, required: false, default: none, values: [follow, paused_snapshot, historical_view], provenance: gap, gap_note: 'the mode the stream opened in when the request left the mode to the surface default; enum values canon, echo shape typed nowhere'}
    DockerShellSessionResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container the audited exec/attach session opened in; name canon (row-group identity), result shape typed nowhere'}
        shell_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the audited docker exec/attach shell session (2.5A row); session record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_container_attach_shell), shape typed nowhere'}
    DockerContextSelectResultV1:
      fields:
        runtime_context_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the runtime context now selected; the arg name of cmd.docker.context.select (CRAU-092 runtime_context_ref?), echo shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: true, default: none, provenance: gap,
                                  gap_note: 'capability after revalidation'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'present when the owner records a receipt'}
    DockerImageTagResultV1:
      fields:
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the tagged image'}
        applied_tag: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the tag as applied'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; the wiring row requires a receipt effect (catalog.docker_image_tag)'}
    DockerImageInspectResultV1:
      fields:
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the inspected image; name canon (row-group identity), result shape typed nowhere'}
        inspect_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'structured image inspect output with secret and redaction policy applied (lifecycle rows); record shape typed nowhere'}
    DockerImageMutationResultV1:
      fields:
        image_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the image mutated; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; the wiring row requires a receipt or event effect (catalog.docker_image_delete), shape typed nowhere'}
    DockerComposeSubsetResultV1:
      fields:
        compose_project_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the compose project acted on; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring rows require a receipt or event effect (catalog.docker_compose_up_subset/down_subset), shape typed nowhere'}
    DockerComposeScenarioResultV1:
      fields:
        scenario_id: {type: id, required: true, default: none, constraints: {max_length: 200, pattern: '^[A-Za-z0-9][A-Za-z0-9._:-]*$'}, provenance: gap, gap_note: 'the scenario saved, run, edited or deleted; bounds from the event payloads'' non_empty_id; the name is CRAU-096''s scenario schema field, and the docker.compose.scenario event payloads type it (non_empty_id), but no result shape is typed anywhere'}
        preview_run_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'the preview or development run the scenario id is recorded on (2.5A scenario.run row); record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring rows require a receipt or event effect, shape typed nowhere'}
    DockerRegistryPromoteResultV1:
      fields:
        image_digest: {type: string, required: true, default: none, constraints: {pattern: '^sha256:[0-9a-f]{64}$'}, provenance: gap, gap_note: 'the moved digest; CRAU-012 requires digest-first capture, the record shape is typed nowhere'}
        tags: {type: list, required: true, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}}, constraints: {min_items: 1, unique_items: true}, provenance: gap, gap_note: 'the moved tag or tags, one per entry of the request''s target.tags, with the same item bounds, min_items 1 and unique_items; CRAU-012 receipt capture, shape typed nowhere'}
        source: {type: object, required: true, default: none, fields: {namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'source namespace of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}, repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'source repository of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}}, provenance: gap, gap_note: 'source namespace/repository of the promotion (CRAU-012); shape typed nowhere'}
        destination: {type: object, required: true, default: none, fields: {namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'destination namespace of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}, repository_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'destination repository of the promotion; CRAU-012 names the captured pair, the field shape is typed nowhere'}}, provenance: gap, gap_note: 'destination namespace/repository of the promotion (CRAU-012); shape typed nowhere'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'registry-side promotion receipt with actor, approval source and result id captured before downstream references update (CRAU-012); shape typed nowhere'}
    DockerDriftCompareResultV1:
      fields:
        drift_class: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the resulting drift class; missing prior metadata is unknown rather than clean (CRAU-013), but no class vocabulary is fixed. JUDGMENT: open string pending owner tokens'}
        source_metadata_refs: {type: list, required: true, default: none, item: {type: ref}, constraints: {unique_items: true}, provenance: gap, gap_note: 'receipts record what was compared and the source metadata refs (section 2A drift detection); shape typed nowhere'}
        partial: {type: boolean, required: true, default: none, provenance: gap, gap_note: 'whether the result is partial (section 2A drift detection); typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_drift_compare), shape typed nowhere'}
    DockerCleanupScanResultV1:
      fields:
        scan_result_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the dry-run prune/remove recommendations with protected asset and receipt checks (2.5A row; section 2A cleanup advisor); record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_cleanup_scan), shape typed nowhere'}
    DockerCleanupPruneResultV1:
      fields:
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the cleanup execution receipt; wiring row requires a receipt or event effect (catalog.docker_cleanup_prune), shape typed nowhere'}
    DockerK8sApplyResultV1:
      fields:
        manifest_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the manifest applied; echo of the request subject, shape typed nowhere'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'cross-surface receipt retaining kubernetes_refs lineage (UCC-053); shape typed nowhere'}
    DockerK8sDiffResultV1:
      fields:
        diff_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the manifest diff against the selected target; record shape typed nowhere'}
    DockerK8sLogStreamResultV1:
      fields:
        k8s_workload_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the workload streamed; echo of the request subject k8s_workload_ref (section 2A workload history), shape typed nowhere'}
        stream_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'ephemeral owner-surface log session (CRAU-014); session shape typed nowhere'}
        log_mode: {type: enum, required: false, default: none, values: [follow, paused_snapshot, historical_view], provenance: gap, gap_note: 'the mode the stream opened in when the request left the mode to the surface default; enum values canon, echo shape typed nowhere'}
    DockerK8sExecSessionResultV1:
      fields:
        k8s_workload_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the workload the audited privileged exec session opened in; echo of the request subject k8s_workload_ref (section 2A workload history), shape typed nowhere'}
        exec_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the audited privileged exec session (2.5B row); session shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt retaining kubernetes_refs lineage; wiring row requires a receipt or event effect (catalog.docker_k8s_exec), shape typed nowhere'}
    DockerK8sPortForwardResultV1:
      fields:
        port_forward_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the audited port-forward session (2.5B row); rebinding records local port reuse versus new allocation (section 2A); session shape typed nowhere'}
        local_bind_address: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the recorded local bind address (local bind address/port recorded, 2.5B row); typed nowhere'}
        local_port: {type: integer, required: true, default: none, constraints: {minimum: 1, maximum: 65535}, provenance: gap, gap_note: 'the recorded local port (2.5B row); typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt retaining kubernetes_refs lineage; wiring row requires a receipt or event effect (catalog.docker_k8s_port_forward), shape typed nowhere'}
    DockerK8sContextSelectResultV1:
      fields:
        kubernetes_context: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the context now selected; name canon (row-group identity), echo shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'capability after revalidation (2.5B row)'}
    DockerK8sNamespaceSelectResultV1:
      fields:
        kubernetes_context: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the context the namespace was selected in; echo shape typed nowhere'}
        namespace: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256}, provenance: gap, gap_note: 'the namespace now selected; name canon (row-group identity), echo shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'capability after the workload-focus refresh (2.5B row)'}
    DockerHelmPreviewResultV1:
      fields:
        render_output_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the rendered Helm output without applying it (2.5B row); record shape typed nowhere'}
    DockerHelmInstallResultV1:
      fields:
        helm_release_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the installed or upgraded release (2.5B row); record shape typed nowhere'}
        receipt_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'cross-surface receipt retaining kubernetes_refs lineage (UCC-053); wiring row requires a receipt or event effect (catalog.docker_k8s_helm_install), shape typed nowhere'}
```

### CRAU-116 - Docker Hosts Run And Container Open Command Payload Definitions

```yaml
plan_unit_id: CRAU-116
unit_type: command_contract
status: accepted
owner_doc: Plans/Containers_Registry_and_Unraid.md
canonical_text: >-
  Typed payload definitions (DL-333) for the thirteen Docker/Hosts and container-run commands that
  UI_Command_Catalog UCC-105 registers and UCC-230 routes to this unit: cmd.docker.run and
  cmd.docker.container.open (existing ids UCC-105 keeps where exact semantics match) and the eleven
  registered Docker/Hosts ids hosts.open, host.refresh, host.preflight, host.profile.save,
  host.session.launch, host.instance.start, host.instance.stop, host.instance.restart,
  host.access.open_app, host.instance.retain and host.receipt.open. CV-304's HostCapabilityCommand
  is the dispatch envelope these commands ride on (cmd.docker.run and cmd.docker.container.open only
  when they target a registered host, as their owner_request judgments read UCC-105); it has no typed schema, so every envelope field
  this block names from UCC-105 or CV-304 prose carries provenance gap, and the overlay identity
  fields host_capability_ref and host_profile_id keep their UCC-230 types. The definitions block
  below gives each command its args, owner request and owner result in
  pm.command_payload_definitions.v1, with error and disabled-reason codes narrowed from the
  overlay's closed sets. An owner_request of none means the command's Wiring_Matrix.production.json
  row names no request_schema_ref. These definitions carry the FileSafe scope on the host profile as
  CV-303's filesafe_scope_ref, a gap choice recorded in cmd.docker.host.profile.save, and the host
  commands read it from the saved profile.
gui_related: true
gui_classification_reason: Defines the arguments of user-visible Docker/Hosts page and container run commands.
depends_on: [UCC-230, UCC-105, UCC-217, CRAU-092, CRAU-094, CRAU-095, CV-303, CV-304, CV-333, DL-333, DL-341]
unblocks: []
acceptance_criteria:
  - Every command that UCC-230 routes to CRAU-116 has exactly one definition in the block below.
  - Every field has a vocabulary type, required, default and provenance; every gap field says what was missing.
  - error_codes and disabled_reason_codes stay inside the overlay's closed sets.
  - Every judgment a definition makes is in its judgments list with a key, a choice and a gap_note; the definitions block holds no YAML comment and names no review or evidence material (DL-341).
  - Access actions consume structured port_access_record data and never guess low-confidence localhost URLs (CRAU-092).
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-command-payload-defs-check.py
  - python3 scripts/pm-plan-index.py validate
risk_class: command_payload_shape_drift
reasoning_tier: high
context_scope: ucc_049_105_typed_definitions
implementation_surfaces: [Plans/Containers_Registry_and_Unraid.md, Plans/UI_Command_Catalog.md]
node_compile_hint: {mode: command_payload_definitions, create_worknodes: false, create_nodeseeds: false}
source_lineage:
  - "T3 thread 1338d738-7bb4-47b2-852e-38a876cb8521, 2026-11-05T02:48:03Z: Jared's answer \"approve all\" to Q5"
  - "/mnt/Cursor/PuppetMaster-Evidence/closure-reaudit-20261104/owner-answers/q5/inventory.jsonl"
preserved_exact_tokens: [cmd.docker.run, cmd.docker.container.open, cmd.docker.hosts.open, cmd.docker.host.refresh, cmd.docker.host.preflight, cmd.docker.host.profile.save, cmd.docker.host.session.launch, cmd.docker.host.instance.start, cmd.docker.host.instance.stop, cmd.docker.host.instance.restart, cmd.docker.host.access.open_app, cmd.docker.host.instance.retain, cmd.docker.host.receipt.open]
negative_constraints:
  - Do not add payload fields to UI_Command_Catalog command rows.
  - Do not define a payload for an alias, retired, non-alias or source-lineage token.
  - Do not copy the Coasts HTTP API, terminal or file controls into these payloads (UCC-105, CV-304).
  - Do not type the HostCapabilityCommand envelope beyond what UCC-105 and CV-304 name; envelope fields stay provenance gap until CV-304 gains a typed schema.
owner_hints: [Plans/UI_Command_Catalog.md, Plans/Contracts_V0.md]
```

```yaml
command_payload_definitions:
  format: pm.command_payload_definitions.v1
  owner_unit: CRAU-116
  overlay: Plans/UI_Command_Catalog.md#UCC-230
  definitions:
    - command_id: cmd.docker.run
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        image_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity image_ref?; 2.5A row precondition image_selected makes the image the subject"
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; UCC-105 keeps cmd.docker.run on the HostCapabilityCommand envelope where exact semantics match"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; UCC-105 envelope field"
        run_options:
          type: object
          required: false
          default: none
          fields:
            container_name: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                             provenance: gap, gap_note: 'run options (name, ports, env, volumes, network) are not defined anywhere; only image_ref is implied (2.5A row). JUDGMENT: optional container name'}
            ports: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                    constraints: {unique_items: true}, provenance: gap, gap_note: 'JUDGMENT: optional published-port specs; item shape unstated, a structured mapping stays open for the compile review'}
            env: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                  constraints: {unique_items: true}, provenance: gap, gap_note: 'JUDGMENT: optional environment entries; secrets must travel as refs, not values (CV-303: raw secrets are absent from profiles, receipts and access records)'}
            volumes: {type: list, required: false, default: none, item: {type: string, constraints: {min_length: 1, max_length: 256}},
                      constraints: {unique_items: true}, provenance: gap, gap_note: 'JUDGMENT: optional volume mounts; item shape unstated'}
            network: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                      provenance: gap, gap_note: 'JUDGMENT: optional network name'}
          provenance: gap
          gap_note: >-
            The row says only "Starts a container from selected image" (2.5A); run options are not defined.
            JUDGMENT: one optional nested object whose field names are judgments listed for the compile
            review; absent starts the container with the image's defaults and no overrides.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:DockerContainerRunResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind for this row: the 2.5A run row gives only label, description and availability, and no Cozy lifecycle table lists it. It starts a container from the selected image (Cozy keeps it live as create-from-image, distinct from cmd.docker.container.start), a side effect, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && image_selected gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. blocked_state_required is listed because cmd.docker.run rides on the HostCapabilityCommand envelope when it targets a registered host (UCC-105; owner_request judgment) and UCC-105's fixtures for missing authority, FileSafe scope or receipt expectation must fail closed before mutation, as for the other mutating host commands; a local run builds no envelope, so the code does not arise for it."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. UCC-105 keeps the existing cmd.docker.run on the HostCapabilityCommand envelope only where exact semantics match (UI_Command_Catalog.md:8430-8432), which this definition reads as a run on a registered host: with neither host_capability_ref nor host_profile_id the run targets the local Docker runtime and builds no envelope. Choice, since canon names no source_surface value for either case: the run is local only when dispatched from its Docker Manager row (UI_Command_Catalog.md:633); a dispatch from the Docker/Hosts destination (CRAU-092's route_target docker_hosts, Containers_Registry_and_Unraid.md:5973-5975) or from another UCC-105 envelope caller (Assistant Chat pivots, Orchestrator links, Run Graph access pivots, ATS host launches, tool actions; UI_Command_Catalog.md:8417-8418) that carries neither ref is refused with invalid_args before dispatch, not treated as local, because UCC-105 maps every Docker/Hosts action to a HostCapabilityCommand payload (:8443). Which source_surface values mark each case is an open owner question (DL-341 open_owner_questions). Otherwise the handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_capability_ref and host_profile_id from the args where present; without host_profile_id no saved profile is named, so the envelope has no FileSafe scope and fails closed as below (canon names no default host profile); requested_action from the command id (run); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy or cleanup_policy, because CV-304 requires both before dispatch (Contracts_V0.md:19718)."}
    - command_id: cmd.docker.container.open
      ucc_units: [UCC-105]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        container_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "2.5A row subject (running container) and CRAU-013 preserved token cmd.docker.container.open; overlay family-specific arg"
        access_target_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: >-
            The access target field and the confidence input are not defined (2.5A row: opens a resolved URL
            or access target when confidence is sufficient). JUDGMENT: optional ref to the resolved access
            record; absent lets the owner resolve from URL/URLs discovery with the confidence threshold, and
            an uncertain heuristic shows candidate actions or logs/inspect first (section 2A access
            intelligence). The confidence input has no field and none is minted here.
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; UCC-105 keeps cmd.docker.container.open on the HostCapabilityCommand envelope where exact semantics match"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; UCC-105 envelope field"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, blocked_state_required, stale_projection]
      owner_state_codes:
        - {owner_state: access_url_unresolved, code: not_configured}
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind for this row: the 2.5A container.open row gives only label, description and availability, and no Cozy lifecycle table lists it. It opens a resolved URL or access target, a route/open without an owner result, so navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, blocked_state_required, stale_projection], gap_note: "No row states a subset for the docker_available && container_running && access_target_resolved gate; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. Low-confidence access is blocked, not guessed (CRAU-013, UCC-105 low-confidence port access denial). When no override, published port or web-UI label gives an access URL, Docker Manager disables the open action (section 2A Runtime access URL resolution); that is CRAU-095's access_url_unresolved, which shows as not_configured through UCC-230 owner_state_code_map, recorded in owner_state_codes."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. UCC-105 keeps the existing cmd.docker.container.open on the HostCapabilityCommand envelope only where exact semantics match (UI_Command_Catalog.md:8430-8432), which this definition reads as a container on a registered host: with neither host_capability_ref nor host_profile_id the container is a local Docker Manager container and the open builds no envelope. Choice, since canon names no source_surface value for either case: the open is local only when dispatched from its Docker Manager row (UI_Command_Catalog.md:637); a dispatch from the Docker/Hosts destination (CRAU-092's route_target docker_hosts, Containers_Registry_and_Unraid.md:5973-5975) or from another UCC-105 envelope caller (Assistant Chat pivots, Orchestrator links, Run Graph access pivots, ATS host launches, tool actions; UI_Command_Catalog.md:8417-8418) that carries neither ref is refused with invalid_args before dispatch, not treated as local, because UCC-105 maps every Docker/Hosts action to a HostCapabilityCommand payload (:8443). Which source_surface values mark each case is an open owner question (DL-341 open_owner_questions). Otherwise the handler builds CV-304's HostCapabilityCommand. Unlike cmd.docker.host.access.open_app it has no port access record to resolve a host instance from, so it sends no host_instance_id and has no profile fallback, and access_target_ref is not read for host identity: command_id and command_kind from the dispatch, host_capability_ref and host_profile_id from the args where present (without host_profile_id no saved profile is named, so the envelope has no FileSafe scope and fails closed as below; canon names no default host profile); requested_action from the command id (container open); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from that saved host profile (cmd.docker.host.profile.save); and no expected receipt ref, since the open returns no owner result and canon names no receipt for it. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. A missing authority, FileSafe scope, transcript_policy or cleanup_policy then fails closed with blocked_state_required before the open."}
    - command_id: cmd.docker.hosts.open
      ucc_units: [UCC-105]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        route_target:
          type: contract
          ref: Primitive:RouteTarget
          required: true
          default: none
          provenance: canon
          source: "CRAU-092 Docker/Hosts route payload {route_target: docker_hosts, ...}; UCC-230 canonical type kept, narrowed to required"
        owner_surface:
          type: const
          value: docker_manager
          required: true
          default: none
          provenance: canon
          source: "CRAU-092 route payload owner_surface: docker_manager, unqualified; acceptance criterion: Docker/Hosts route payloads include owner_surface, source_surface, subview"
        project_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "CRAU-092 route payload lists project_id unqualified; UCC-230 envelope common optional project_id restated required"
        repo_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "CRAU-092 route payload repo_id?; UCC-230 envelope common optional repo_id"
        workspace_root_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: "CRAU-092 route payload names workspace_root_id?; not a UCC-230 common optional field, so it is a family arg. JUDGMENT: type id by the _id suffix convention"
        subview:
          type: enum
          required: true
          default: none
          values: [overview, profiles, instances, runtime_matrix, host_lab_sessions, access_ports, receipts_artifacts, settings, compose]
          provenance: gap
          gap_note: >-
            Required is canon: CRAU-092's route payload lists subview with no ?, and its acceptance criterion says
            route payloads include owner_surface, source_surface, subview. The value compose is canon: CRAU-094,
            the successor to CRAU-092's subview vocabulary, says the route payload subview vocabulary admits
            compose. The other eight are display names only (CRAU-092 preserved tokens and canonical text;
            FinalGUISpec.md Docker/Hosts page): Overview, Profiles, Instances, Runtime Matrix, Host Lab Sessions,
            Access & Ports, Receipts & Artifacts and Settings, with no wire tokens. JUDGMENT: snake_case of those
            eight names; distinct from the Docker Manager subview enum of cmd.docker.switch_subview.
        focus_kind:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "CRAU-092 route payload names focus_kind? without a vocabulary; CRAU-094 says focus_kind admits compose_project and compose_scenario, which this field accepts. Canon fixes no other values although CRAU-092 focuses host, profile, instance, access and receipt detail views, so the vocabulary is open. JUDGMENT: open string pending owner tokens, not an enum of the two named values"
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; CRAU-092 route payload host_capability_ref?"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; CRAU-092 route payload host_profile_id?"
        host_instance_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: "UCC-105 canonical text and CV-303 preserved tokens name host_instance_id as an optional backend-fact id; typed nowhere. JUDGMENT: type id by the _id suffix convention"
        host_assignment_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: "CV-303 preserved token host_assignment_id and CRAU-092 route payload host_assignment_id?; typed nowhere. JUDGMENT: type id by the _id suffix convention"
        runtime_family:
          type: string
          required: false
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: "CRAU-092 route payload names runtime_family? and says runtime families are PM identities, but fixes no family vocabulary. JUDGMENT: open string pending owner tokens"
        runtime_context_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "CRAU-092 route payload names runtime_context_ref?; typed nowhere. JUDGMENT: type ref by the _ref suffix convention"
        port_access_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "CV-303 preserved token port_access_ref and CRAU-092 route payload port_access_ref?; the structured port access record is typed nowhere. JUDGMENT: type ref by the _ref suffix convention"
        receipt_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "CRAU-092 route payload receipt_ref?; UCC-230 envelope common optional receipt_ref"
        blocked_sequence:
          type: integer
          required: false
          default: none
          constraints: {minimum: 0}
          provenance: gap
          gap_note: "CRAU-092 route payload lists blocked_sequence? without a type. JUDGMENT: non-negative integer, matching the runtime recovery blocked-sequence identity it names and the permission snapshot record's blocked_sequence (Plans/shared_runtime_contracts.schema.json, integer or null, minimum 0)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded]
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: UCC-105 registers the id and CRAU-092 makes Docker/Hosts a routed destination with a route payload. A route open without an owner result, so navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded], gap_note: "No row states a subset; the page renders cached last-known state when unreachable (section 2A posture), so these codes are availability copy from the shared taxonomy."}
    - command_id: cmd.docker.host.refresh
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; which host(s) to refresh is otherwise undefined"
        host_instance_id:
          type: id
          required: false
          default: none
          provenance: gap
          gap_note: >-
            UCC-105 canonical text names host_instance_id as an optional backend-fact id; whether a refresh
            targets one instance or all discovered hosts is unstated. JUDGMENT: optional id; absent refreshes
            the profile or all discovered hosts.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostRefreshResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, degraded, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It refreshes the host projection (event docker.host.refresh_requested), an owner operation, so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, degraded, stale_projection], gap_note: "No row states a subset; drawn from the shared Docker/Kubernetes disabled-state taxonomy (UI_Command_Catalog.md 2.5B taxonomy paragraph: Unsupported, Not configured, Unauthorized, Unreachable, Degraded, Partial capability) plus the 2.0B projection-freshness clause. A refresh replaces a stale projection with a fresh one."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. A refresh mutates no host, so of UCC-105's envelope fields only host_capability_ref, host_profile_id and host_instance_id are relevant, and the handler sends the args it has; the authority, policy and receipt-expectation fields UCC-105 requires before mutation are not built for a projection refresh. Canon says nowhere which fields a refresh carries; this is the choice."}
    - command_id: cmd.docker.host.preflight
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the preflight subject is the profile whose action is proposed"
        requested_action:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            UCC-105 canonical text names requested_action as a HostCapabilityCommand envelope field but types
            nothing (CV-304 has no typed schema). JUDGMENT: open string naming the action being preflighted;
            an enum of host actions stays open for the compile review.
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?; the capability the proposed action would use"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostPreflightResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It runs the preflight before approval (event docker.host.preflight_requested; section 2A preflight ordering), an owner operation, so domain_action."}
        - {key: error_codes, choice: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error], gap_note: "blocked_state_required is left out although the other mutating host commands list it: a preflight that finds unresolved facts reports blocked_preflight as its outcome, and those facts block the later mutation, not this command (section 2A preflight and approval ordering contract). The set is the narrowing rule's set for a domain_action whose disabled reasons do not include blocked_state_required."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability], gap_note: "No row states a subset; preflight resolves reachability, trust and proxy policy and capability (section 2A), from the shared taxonomy."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler sends requested_action, host_profile_id and, when given, host_capability_ref from the args, and fills the profile's FileSafe scope (filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save), so the preflight checks the policies the later mutation will carry; a profile without transcript_policy or cleanup_policy is one of the unresolved facts the preflight reports as blocked_preflight, since CV-304 requires both before dispatch (:19718). A retain preflight checks the profile's transcript_policy only: a retain's cleanup policy is its own retention_policy arg. execution_unit_context_ref follows the sibling rule: CV-304's canonical text lists execution_unit_context (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries it where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the preflight, so these args carry none and a GUI preflight sends none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions). The saved profile holds no host_capability_ref, so without the arg the envelope carries none. approval_scope_key and permission_snapshot_id are not built, because approval follows preflight (section 2A preflight and approval ordering). Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.host.profile.save
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; absent creates a new profile, present saves the identified one"
        profile:
          type: object
          required: true
          default: none
          fields:
            display_name: {type: string, required: true, default: none, constraints: {min_length: 1, max_length: 256},
                           provenance: gap, gap_note: 'the host profile definition shape is not defined anywhere (no catalog row). JUDGMENT: required human-readable name'}
            runtime_family: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                             provenance: gap, gap_note: 'runtime families are PM identities (CRAU-092) with no fixed vocabulary. JUDGMENT: optional family name'}
            network_access_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                    provenance: gap, gap_note: 'UCC-105 and CV-304 name network_access_policy in prose only; no typed schema exists. JUDGMENT: open string pending CV-304 typing'}
            secret_access_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                   provenance: gap, gap_note: 'UCC-105 and CV-304 name secret_access_policy in prose only. JUDGMENT: open string; raw secrets never enter profiles (CV-303)'}
            destructive_command_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                         provenance: gap, gap_note: 'UCC-105 and CV-304 name destructive_command_policy in prose only. JUDGMENT: open string pending CV-304 typing'}
            preflight_required: {type: boolean, required: false, default: none, provenance: gap, gap_note: 'UCC-105 names preflight_required in prose only. JUDGMENT: optional boolean, no dispatch default'}
            transcript_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                                provenance: gap, gap_note: 'CV-304 names a transcript policy in prose only (Contracts_V0.md:19705-19706; acceptance :19718) and types no field. JUDGMENT: field name and open string pending CV-304 typing, like the other envelope policies; a profile may be saved without it, and a host mutation or open whose profile has none fails closed with blocked_state_required before dispatch, because CV-304 requires a transcript policy before dispatch, and cmd.docker.host.preflight reports it as blocked_preflight'}
            cleanup_policy: {type: string, required: false, default: none, constraints: {min_length: 1, max_length: 256},
                             provenance: gap, gap_note: 'CV-304 names a cleanup policy in prose only (Contracts_V0.md:19705-19706; acceptance :19718) and types no field. JUDGMENT: field name and open string pending CV-304 typing, like the other envelope policies; a profile may be saved without it, and a host mutation or open whose profile has none fails closed with blocked_state_required before dispatch, because CV-304 requires a cleanup policy before dispatch, and cmd.docker.host.preflight reports it as blocked_preflight; cmd.docker.host.instance.retain states its own policy and does not read this one'}
            filesafe_scope_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'UCC-105 and CV-304 call it FileSafe scope in prose; CV-303 names filesafe_scope_ref among the host contract families and in its preserved tokens, but types nothing. JUDGMENT: optional ref by the _ref suffix convention; the host commands read the FileSafe scope from it, and a host command whose profile has none fails closed (UCC-105 missing FileSafe scope fixture)'}
          provenance: gap
          gap_note: >-
            The host profile definition shape is not defined anywhere (no catalog row; CV-304 gives only the
            envelope field names, and CV-303 keeps raw secrets out of host profiles). JUDGMENT: a minimal nested object; every field
            name except the UCC-105/CV-304 envelope names and CV-303's filesafe_scope_ref is a judgment for the compile review.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostProfileSaveResultV1
      error_codes: [invalid_args, permission_denied, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It writes a host profile record (event docker.host.profile_saved), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, permission_required], gap_note: "No row states a subset; a profile write is local configuration, so only a missing configuration or a permission gate disables it."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The profile arg carries the UCC-105 policy fields (network_access_policy, secret_access_policy, destructive_command_policy, preflight_required), CV-304's transcript and cleanup policies as transcript_policy and cleanup_policy (names chosen here; CV-304 says only transcript policy and cleanup policy) and the FileSafe scope as filesafe_scope_ref (CV-303's name; UCC-105 and CV-304 say only FileSafe scope), which later host commands read from the saved profile; approval_scope_key, permission_snapshot_id and allowed_action_ids come from the Permissions admission (UCC-217), not from args. Canon says nowhere which source fills each field; this is the choice."}
    - command_id: cmd.docker.host.session.launch
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_profile_id:
          type: id
          required: true
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the launch inputs name the profile (UCC-105 acceptance ties ATS host launches to registered ids)"
        execution_unit_context_ref:
          type: ref
          required: false
          default: none
          provenance: gap
          gap_note: "UCC-105 canonical text names execution_unit_context_ref, which this field uses; CV-304 spells the same envelope field execution_unit_context. The two live units disagree on the spelling; this definition takes UCC-105's, the catalog unit that registers the command and lists the envelope fields, and the owner doc must settle which spelling stands. Typed nowhere. JUDGMENT: optional ref to the execution unit context record, typed ref by the UCC-230 _ref rule"
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostSessionLaunchResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It launches a Host Lab session (event docker.host.session_launch_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; session launch carries authority, FileSafe and preflight expectations (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_profile_id and, when given, host_capability_ref from the args; no host_instance_id, because a launch names no existing instance and its args carry none, so the envelope goes without one and the launched session comes back as HostSessionLaunchResultV1.host_session_ref; requested_action from the command id (session launch); execution_unit_context_ref from the arg when given (UCC-105's spelling of CV-304's execution_unit_context; the arg records the conflict), otherwise none: CV-304's canonical text lists the field (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries it where applicable (:280), which this definition takes as when an execution unit dispatches the launch; approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy or cleanup_policy, because CV-304 requires both before dispatch (Contracts_V0.md:19718)."}
        - {key: omitted:ats_target_ref, choice: omitted, gap_note: "UCC-105 names ATS host launches among the surfaces that use registered command ids, but canon names no field for the ATS or session target of a launch. This definition mints none; the compile review must decide whether a launch names its ATS session or the Host Lab session is created untargeted."}
    - command_id: cmd.docker.host.instance.start
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the lifecycle command's subject is the instance"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the profile owning the instance"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It is an instance lifecycle mutation (start; event docker.host.instance_lifecycle_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; lifecycle actions carry authority, preflight and receipt expectations before mutation (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id from the args when given, otherwise from the host instance record that host_instance_id names; host_capability_ref from that host instance record (CV-303 lists host instance among the host contract families but types no field, so that the record carries host_profile_id and host_capability_ref is part of this choice); requested_action from the command id (instance start); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy or cleanup_policy, because CV-304 requires both before dispatch (Contracts_V0.md:19718)."}
    - command_id: cmd.docker.host.instance.stop
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the lifecycle command's subject is the instance"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the profile owning the instance"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It is an instance lifecycle mutation (stop; event docker.host.instance_lifecycle_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; lifecycle actions carry authority, preflight and receipt expectations before mutation (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id from the args when given, otherwise from the host instance record that host_instance_id names; host_capability_ref from that host instance record (CV-303 lists host instance among the host contract families but types no field, so that the record carries host_profile_id and host_capability_ref is part of this choice); requested_action from the command id (instance stop); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy or cleanup_policy, because CV-304 requires both before dispatch (Contracts_V0.md:19718)."}
    - command_id: cmd.docker.host.instance.restart
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the lifecycle command's subject is the instance"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?; the profile owning the instance"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceLifecycleResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It is an instance lifecycle mutation (restart; event docker.host.instance_lifecycle_requested), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, partial_capability, blocked_state_required, permission_required], gap_note: "No row states a subset; lifecycle actions carry authority, preflight and receipt expectations before mutation (UCC-105), so the authority, preflight-blocking and capability codes of the shared taxonomy apply."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id from the args when given, otherwise from the host instance record that host_instance_id names; host_capability_ref from that host instance record (CV-303 lists host instance among the host contract families but types no field, so that the record carries host_profile_id and host_capability_ref is part of this choice); requested_action from the command id (instance restart); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (host_execution_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy or cleanup_policy, because CV-304 requires both before dispatch (Contracts_V0.md:19718)."}
    - command_id: cmd.docker.host.access.open_app
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        port_access_ref:
          type: ref
          required: true
          default: none
          provenance: gap
          gap_note: >-
            The access target (app URL/port ref) is not defined (no catalog row). JUDGMENT: required ref to
            the structured port_access_record (CV-303 preserved token port_access_ref, CRAU-092 route payload
            and acceptance criterion), never a guessed localhost URL.
        host_capability_ref:
          type: ref
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_capability_ref?"
        host_profile_id:
          type: id
          required: false
          default: none
          provenance: canon
          source: "overlay UCC-101..UCC-105 identity host_profile_id?"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostAccessOpenResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, degraded, blocked_state_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. Access actions consume structured port_access_record data under authority gates (CRAU-092), so domain_action; navigation_wrapper would fit only if it routed to an already-resolved URL."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, degraded, blocked_state_required], gap_note: "No row states a subset; low-confidence port access is denied with evidence, not guessed (CRAU-092; UCC-105 fixture list), carried as blocked_state_required, with the rest from the shared taxonomy."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_capability_ref and host_profile_id from the args where present and host_instance_id from the port access record that port_access_ref names; without the host_profile_id or host_capability_ref arg, the profile or capability ref is the one the host instance record that host_instance_id names carries (the record shape is the choice made for cmd.docker.host.instance.start); requested_action from the command id (open app); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required, and CV-304's transcript and cleanup policies (the profile's transcript_policy and cleanup_policy; Contracts_V0.md:19705-19706, acceptance :19718) from that saved host profile (cmd.docker.host.profile.save); and no expected receipt ref: UCC-105 asks for expected receipt refs when relevant, and this command's wiring row (catalog.docker_host_access_open_app) requires the event docker.host.access_open_requested, not a receipt. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's missing-authority and missing-FileSafe-scope fixtures then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy or cleanup_policy, because CV-304 requires both before dispatch (Contracts_V0.md:19718)."}
    - command_id: cmd.docker.host.instance.retain
      ucc_units: [UCC-105]
      command_kind: domain_action
      response_kind: owner_operation
      args:
        host_instance_id:
          type: id
          required: true
          default: none
          provenance: gap
          gap_note: "host_instance_id is named as a backend fact only (UCC-105 canonical text, CV-303 preserved tokens); no catalog row. JUDGMENT: required id; the retention command's subject is the instance"
        retention_policy:
          type: string
          required: true
          default: none
          constraints: {min_length: 1, max_length: 256}
          provenance: gap
          gap_note: >-
            CV-304's HostCapabilityCommand carries a cleanup policy before dispatch (Contracts_V0.md:19705-19706; its
            acceptance, :19718, requires the cleanup field), but canon names no field for it and defines no
            retention intent or period. CV-303 names the cleanup_retention_receipt and a retention_state field among the host
            contract fields (Contracts_V0.md:19619), and its acceptance criterion has cleanup/retention envelopes
            carry retention fields (:19628), but it types neither. retention_state is the owner's recorded state,
            not a caller input, so it is not an arg; where the owner records or returns it is left to the
            cleanup_retention_receipt. Choice: this arg is the cleanup policy a retain records for the instance,
            an open string naming the retention intent, and the envelope's cleanup policy comes from it alone. It is required because a retain is the act of recording that policy: a
            retain without it is refused with invalid_args before dispatch, and the saved host profile's
            cleanup_policy (cmd.docker.host.profile.save), which the other host commands use, neither fills nor
            overrides it. A structured period field stays open.
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: local:HostInstanceRetainResultV1
      error_codes: [invalid_args, permission_denied, blocked_state_required, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unauthorized, unreachable, permission_required, blocked_state_required]
      aliases: []
      judgments:
        - {key: command_kind, choice: domain_action, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It records a cleanup retention (event docker.host.instance_retention_recorded), so domain_action."}
        - {key: disabled_reason_codes, choice: [not_configured, unauthorized, unreachable, permission_required, blocked_state_required], gap_note: "No row states a subset; cleanup and retain actions carry receipt requirements (UCC-105 fixture list), so a missing receipt expectation blocks, with the rest from the shared taxonomy."}
        - {key: owner_request, choice: none, gap_note: "No typed owner request exists. The handler builds CV-304's HostCapabilityCommand from these args: command_id and command_kind from the dispatch, host_instance_id from the args; host_profile_id and host_capability_ref from the host instance record that host_instance_id names (CV-303 lists host instance among the host contract families but types no field, so that the record carries both is part of this choice); requested_action from the command id (instance retain); no execution_unit_context_ref from these args, which carry none: CV-304's canonical text lists execution_unit_context among the envelope's fields (Contracts_V0.md:19705) while its acceptance criterion (:19718) does not, and runtime attribution carries execution_unit_context_ref where applicable (:280); this definition takes it as applicable only when an execution unit dispatches the command, so a GUI dispatch carries none, and how an executor or orchestrator dispatch supplies it is an open owner question (DL-341 open_owner_questions); approval_scope_key, permission_snapshot_id and allowed_action_ids from the Permissions admission (UCC-217: Permissions alone composes authority evidence); the cleanup policy CV-304 names (Contracts_V0.md:19705-19706) from the retention_policy arg alone, not from the profile's cleanup_policy, because a retain states its own; the FileSafe scope (the profile's filesafe_scope_ref, CV-303's name), network_access_policy, secret_access_policy, destructive_command_policy, preflight_required and CV-304's transcript policy (the profile's transcript_policy) from the saved host profile that host_profile_id names (cmd.docker.host.profile.save); and the expected receipt ref kind (cleanup_retention_receipt, CV-303) from the command. UCC-105 and CV-304 name these envelope fields but type none and say nowhere which source fills each; that split is the choice. UCC-105's fixtures (missing authority, missing FileSafe scope, missing receipt expectation) then fail closed with blocked_state_required before mutation, and so does a saved profile without transcript_policy, because CV-304 requires a transcript policy before dispatch (Contracts_V0.md:19718)."}
    - command_id: cmd.docker.host.receipt.open
      ucc_units: [UCC-105]
      command_kind: navigation_wrapper
      response_kind: local_projection
      args:
        receipt_ref:
          type: ref
          required: true
          default: none
          provenance: canon
          source: "receipt_ref is the UCC-230 common optional field made required by the command subject (one receipt); the Docker/Hosts Receipts & Artifacts subview opens receipts directly (CRAU-092)"
      owner_request: none
      result:
        response: Plans/ui_command_response.schema.json
        owner_result: none
      error_codes: [invalid_args, permission_denied, invalid_route, stale_projection, handler_unavailable, internal_error]
      disabled_reason_codes: [not_configured, unreachable, stale_projection]
      aliases: []
      judgments:
        - {key: command_kind, choice: navigation_wrapper, gap_note: "Canon states no command_kind: UCC-105 registers the id with no catalog row. It opens a receipt view (event docker.host.receipt_opened), a route open without an owner result, so navigation_wrapper. It is not in CV-360's open-routes table, so it carries no placement fields."}
        - {key: disabled_reason_codes, choice: [not_configured, unreachable, stale_projection], gap_note: "No row states a subset; receipts open from local records, so only missing configuration, an unreachable owner or a stale projection disables it."}
  results:
    DockerContainerRunResultV1:
      fields:
        container_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the container started from the image; name canon for the family, result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_run), shape typed nowhere'}
    HostRefreshResultV1:
      fields:
        host_profile_id: {type: id, required: false, default: none, provenance: gap, gap_note: 'the refreshed profile when one was targeted; result shape typed nowhere'}
        capability_snapshot_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'the refreshed capability snapshot; result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_refresh), shape typed nowhere'}
    HostPreflightResultV1:
      fields:
        host_preflight_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the CV-303 preserved token host_preflight_receipt; the record shape is typed nowhere'}
    HostProfileSaveResultV1:
      fields:
        host_profile_id: {type: id, required: true, default: none, provenance: gap, gap_note: 'the profile saved or created; name canon (row-group identity), result shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_profile_save), shape typed nowhere'}
    HostSessionLaunchResultV1:
      fields:
        host_session_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the launched Host Lab session (CRAU-092 subview); session record shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_session_launch), shape typed nowhere'}
    HostInstanceLifecycleResultV1:
      fields:
        host_instance_id: {type: id, required: true, default: none, provenance: gap, gap_note: 'the instance acted on; name from UCC-105 prose, result shape typed nowhere'}
        host_execution_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the CV-303 preserved token host_execution_receipt; UCC-105 requires receipt expectations before mutation; shape typed nowhere'}
    HostAccessOpenResultV1:
      fields:
        port_access_ref: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the access record opened; echo of the request subject, shape typed nowhere'}
        receipt_ref: {type: ref, required: false, default: none, provenance: gap, gap_note: 'dispatch or owner receipt; wiring row requires a receipt or event effect (catalog.docker_host_access_open_app), shape typed nowhere'}
    HostInstanceRetainResultV1:
      fields:
        host_instance_id: {type: id, required: true, default: none, provenance: gap, gap_note: 'the instance retained; name from UCC-105 prose, result shape typed nowhere'}
        cleanup_retention_receipt: {type: ref, required: true, default: none, provenance: gap, gap_note: 'the CV-303 preserved token cleanup_retention_receipt; UCC-105 requires cleanup/retain receipt expectations; shape typed nowhere'}
```
