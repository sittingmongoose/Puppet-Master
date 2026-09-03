# Shard 021: Source Control, GitHub Actions, and Docker Manager Permission Addendum (2026-03-12)

Source: `Plans/Permissions_System.md`

Source lines: L1273-L1299

Source SHA256: `c4e6be002bda36285465d8f6281d030c01b4292db3cf057fd9cfa40e9741611a`

---

## Source Control, GitHub Actions, and Docker Manager Permission Addendum (2026-03-12)


External-side-effect and admin-gated behavior for this packet uses canonical permission and blocked-state rules.

Required mappings:
- GitHub Actions rerun/cancel/dispatch and admin CRUD operations may require explicit capability and may surface blocked outcomes when approval or auth prerequisites are missing
- Docker Hub repository creation, image push, managed template-repo create/push, and Kubernetes mutating actions use the external-side-effect guard model when they produce hosted or remote side effects
- requested vs effective capability disclosure must remain visible whenever a surface control is disabled by partial auth or policy state

ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Containers_Registry_and_Unraid.md, ContractName:Plans/Decision_Policy.md

### Provider exposure, remote-side-effect provenance, and privileged sessions

Provider/LLM exposure rules apply before any diff, conflict hunk, workflow log, container log, manifest snippet, inspect output, workflow YAML preview, manifest diff, discovered URL, or screenshot is sent to provider-backed features. Such exposure requires explicit permission, `/data-class` labeling, per-feature opt-in, local-only fallback, and `secret-scrub` before provider transmission. Secret scrubbing only before local persistence is insufficient for `LLM` or other provider features.

Review, diff, export, `/evidence/history`, and provider features distinguish ephemeral in-memory view, scrubbed persisted blob, and user-exported file. Anything persisted, indexed, screenshotted through `/screenshots`, exported, or included in evidence/history records the redaction profile, whether mandatory scrub ran, and whether display may hide details.

Remote-side-effect receipts include `approval_source`, `executing_subsystem`, and effective account / credential handle. `approval_source` values include `explicit confirm`, `cached permission`, `policy auto-allow`, and `browser fallback`. `executing_subsystem` values include `git`, `GitHub API`, `docker CLI`, `kubectl`, and `SSH remote`. This applies to push, dispatch, admin changes, publish, repo creation, apply, rollout, and equivalent remote-side-effect actions.

Sensitive metadata minimization covers remote URLs, private repo names, registry namespaces, Docker Hub account identity, kube context names, namespace/workload names, discovered service URLs, port-forward endpoints, screenshots, and downloaded scrubbed artifacts. Exports and screenshots mask sensitive metadata by default unless the user explicitly chooses a fuller export profile.

`/logout/project-delete`, unlink, and project-delete cleanup clear or invalidate non-secret residue that can still identify the user or project: validation snapshots, last-used account identity, workflow admin receipts, registry capability snapshots, kube context selections, discovered endpoints, and downloaded scrubbed artifacts.

Session-style privileged operations include `docker exec/attach`, `kubectl exec`, `kubectl port-forward`, remote SCM-over-SSH mutation sessions, and browser/device auth handoffs. Persist bounded metadata only: actor, target, started/ended timestamps, credential realm, transport, local bind address/port when relevant, and requested vs effective state. Do not persist interactive transcript or `stdin` by default.

Build/deploy secret-handling uses no-persist/no-echo rules for docker build secrets, build args, compose env files, registry auth helpers, kube Secret manifests, and generated deployment YAML containing sensitive values. Secret resources are never rendered back in full, indexed, or included in receipts/evidence beyond kind/name/namespace and redacted status. ConfigMap rendering follows a separate configurable redaction policy because it may contain sensitive plaintext.
