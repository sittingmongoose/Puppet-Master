# Shard 005: User-visible surfaces

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L36-L244

Source SHA256: `a3d69979cdde387e0015474600dc77158482aaf61bc24982ee811be902a708d8`

---

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
