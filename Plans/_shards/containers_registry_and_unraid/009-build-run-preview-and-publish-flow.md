# Shard 009: Build, run, preview, and publish flow

Source: `Plans/Containers_Registry_and_Unraid.md`

Source lines: L399-L547

Source SHA256: `2ff2c1c3c77b3bf336b1d850e592224678e440f82c74e59596393707ac79272b`

---

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
