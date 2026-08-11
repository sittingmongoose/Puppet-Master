# Docker Manager — Side Panel Design Brief

Width contract: 240 min / 380 default / 480 max. Ladder per `Plans/FinalGUISpec.md:L2081-L2089`; 24px minimum hit target per `Plans/FinalGUISpec.md:L2144-L2146`; keyboard model (Tab reach, Up/Down, Enter, Escape, Home/End on every list) per `Plans/FinalGUISpec.md:L2129-L2135`.

Owner split: `Plans/FinalGUISpec.md:L1416-L1422` owns only shell placement, surface label, disabled-state copy, deep-subview discoverability, Settings entrypoints, and routing. `Plans/Containers_Registry_and_Unraid.md` owns runtime, auth, registry, publish, Unraid, Podman, Kubernetes, receipt, and detection behavior. Panel ID is `docker_manager`; `unraid` is not a panel ID — any alias opens `docker_manager` focused to `Publish / Unraid` (`Plans/FinalGUISpec.md:L709-L711`).

---

## 1. Subview inventory (canonical order, CRAU-007)

Canonical list and order from `Plans/Containers_Registry_and_Unraid.md:L1278-L1342`, expanded at `:L105-L116`.

| # | Subview | Purpose | Presence |
|---|---|---|---|
| 1 | `Containers` | Lifecycle, logs, inspect, attach/shell, stats, open app when an access URL exists (`:L129`) | Always |
| 2 | `Images` | Build, pull, push, tag, inspect, remove, prune, digest/tag visibility (`:L130`) | Always |
| 3 | `Compose` | Project/group lifecycle, service subsets, logs, restart, down/up, compose-group reopen state (`:L131`) | Always |
| 4 | `Registries` | Registry inventory/selection, reconnect, browse, pull, inspect (`:L132`) | Always |
| 5 | `Registries / Docker Hub` | Docker Hub as one registry/provider capability, not a separate surface (`:L120`, `:L132`) | Always, nested under 4 |
| 6 | `Build / Bake` | Dockerfile target selection, Buildx/Bake discovery, build-preview settings (`:L133`) | Always |
| 7 | `Publish / Unraid` | `/auth/Unraid`, requested vs effective auth, protected repo creation, digest receipts, Unraid generation, template-repo follow-on (`:L134`) | Always |
| — | `Publishing / Unraid` | Legacy/source-lineage alias, normalized to #7 (`:L112`, `:L1338`) | Alias only, never rendered |
| 8 | `Networks` | Advanced foldout, network explorer (`:L113`) | Always visible affordance, `default-collapsed` (`Plans/FinalGUISpec.md:L723`) |
| 9 | `Volumes` | Advanced foldout, volume explorer (`:L113`) | Same as 8 |
| 10 | `Contexts` | Advanced foldout, runtime context explorer + select (`:L113`) | Same as 8 |
| 11 | `Kubernetes` | Project-focused apply, diff, rollout status, logs, exec, port-forward, workload view, Helm basics, image-to-cluster linkage (`:L135`) | **Conditional**: auto-visible on manifests, Helm artifacts, persisted cluster state, or K8s receipts; manually unhideable otherwise (`:L224`) |

Hard rule: unsupported runtime-specific subviews **hide only when truly unavailable; otherwise they stay visible with a disabled reason** (`:L144`, CRAU-009 acceptance at `:L1404-L1455`). Podman is an alternate runtime *inside* this surface, never a separate panel (`:L120`). `Networks`/`Volumes`/`Contexts`/`Kubernetes` must remain reachable via persistent visible subview affordances **and** Command Palette **and** an explicit Show Advanced action (`Plans/FinalGUISpec.md:L723`).

Not in CRAU-007 but wired: a **Docker/Hosts** routed destination with 11 commands (`Plans/UI_Command_Catalog.md:L7789-L7804`). It is "a routed destination rather than a new Activity Bar owner" — so it must land inside Docker Manager, most plausibly as a `Contexts` peer. This is a genuine inventory conflict (see §8).

---

## 2. Ranked feature inventory

**P0 — must render at 240px (224px usable band)**

1. Runtime identity strip: runtime (`docker`/`podman`), effective context name, detection state (`detected` / `manually_enabled` / `not_detected`, `:L224`), stale marker.
2. Subview selector as a **single-line dropdown** (11 subviews × 24px icons = 264px > 224px; icon strip is impossible — see §7).
3. One asset list for the active subview, one row per asset, middle-ellipsised identity.
4. Per-row status token (non-color-dependent, `Plans/FinalGUISpec.md:L1237`).
5. Per-row overflow (kebab, 24px) = the *only* action surface at 240px.
6. The single primary CTA for the active subview (Compose up / Build image / Push image).
7. Blocked/degraded banner with `blocked_reason_code` + first `allowed_action_ids[]` entry.
8. Stale/cached read-only marker when runtime access is unavailable (`:L144`).

**P1 — visible at 380px (default)**

9. Second metadata line per row (image ref, size, ports, uptime, digest prefix).
10. Inline 2-action row cluster (subview-specific: Containers → Logs + Open; Images → Push + Tag).
11. Requested vs Effective identity block using the exact labels `Requested`, `Effective`, `Reason`, `Support`, `Inherited from`, `Overridden by` (`:L927`).
12. Publish chain as a 5-node vertical stepper with per-node state.
13. Compose scenario list with `stale` badges and repair CTA (`:L148`).
14. Filter/sort control (project-aware ordering is mandatory, `:L144`).
15. `Explain this state` affordance on status pills, disabled buttons, blocked banners, receipt rows (`:L168`).
16. Advanced foldouts (`Networks`/`Volumes`/`Contexts`) as collapsed accordions.

**P2 — overflow menu, context menu, or detail sheet only**

17. Every destructive action (delete, remove, prune) — never an always-visible button.
18. Inspect output, stats, drift compare results, cleanup dry-run estimates.
19. Registry promotion form, tag template editor, repository creation flow (hard-gated modal/sheet).
20. Unraid `ca_profile.xml` editor, template repo config, maintainer metadata (settings-level, `:L66-L71`).
21. K8s Helm preview/install, exec, port-forward session management.
22. Receipt detail, publish history, `include historical publishes` toggle (`:L152`).
23. First-open disclosure cards for `Containers`, `Publish / Unraid`, `Kubernetes` (`:L236`) — one-time, dismissible to overflow.
24. All 11 `cmd.docker.host.*` commands.

---

## 3. Full command list — 78 wired `cmd.docker.*` ids

Source of truth: `Plans/Wiring_Matrix.production.json` (`pm.wiring_matrix.v0`), 78 entries whose `ui_location` starts `Docker Manager`. Zero legacy `cmd.k8s.*` rows survive — all normalized to `cmd.docker.k8s.*` (`Plans/UI_Command_Catalog.md:L522`). Preconditions from `Plans/UI_Command_Catalog.md:L641-L674` (Docker), `:L686-L694` (K8s), `:L8393-L8395` (2026-07-16 addendum). **Gate** column: `HG` = hard_gate / HITL remote side effect, non-bypassable by local confirmation (`:L168`, `:L921-L922`); `D` = destructive, action-specific confirmation; `A` = audited privileged session; `—` = none.

### Shell / routing (11)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.show` | Activity bar icon / palette | shell-state wrapper (`:L677`) | — |
| `cmd.docker.switch_subview` | Subview dropdown item | shell-state wrapper (`:L677`) | — |
| `cmd.docker.hosts.open` | Overflow > Docker/Hosts | *unspecified* | — |
| `cmd.docker.open_dockerfile` | Build card > file link | *unspecified* | — |
| `cmd.docker.container` / `.image` / `.compose` / `.context` / `.network` / `.volume` / `.k8s` | Subview roots (7 ids) | *unspecified* | — |

(The 7 bare-namespace ids above count as 7 of the 78.)

### Containers (16)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.container.start` | Row overflow > Start | `container_stopped && capability_snapshot_current` | — |
| `cmd.docker.container.stop` | Row overflow > Stop | *unspecified* | — |
| `cmd.docker.container.restart` | Row overflow > Restart | *unspecified* | — |
| `cmd.docker.container.delete` | Row overflow > Delete | *unspecified* | D |
| `cmd.docker.container.open` | Row inline > Open | `docker_available && container_running && access_target_resolved` | — |
| `cmd.docker.container.view_logs` | Row inline > Logs | `docker_available && container_selected` | — |
| `cmd.docker.container.attach_shell` | Row overflow > Shell | `docker_available && container_running && permission_allowed` | A |
| `cmd.docker.container.stats` | Detail sheet > Stats | `docker_available && container_selected` | — |
| `cmd.docker.container.inspect` | Detail sheet > Inspect | `docker_available && container_selected` | — |
| `cmd.docker.run` | Images row > Run | `docker_available && image_selected` | — |
| `cmd.docker.stop` | alias of `.container.stop` | `docker_available && container_running` | — |
| `cmd.docker.restart` | alias | `docker_available && container_selected` | — |
| `cmd.docker.remove` | alias | `docker_available && container_stopped` | D |
| `cmd.docker.logs` / `cmd.docker.exec` / `cmd.docker.inspect` | aliases (3 ids) | `container_selected` / `container_running` / `resource_selected` | —/A/— |

### Images (4)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.image.push` | Row overflow > Push | `image_selected && registry_target_allowed && permission_allowed` | HG |
| `cmd.docker.image.tag` | Row overflow > Tag | *unspecified* | — |
| `cmd.docker.image.inspect` | Detail sheet | *unspecified* | — |
| `cmd.docker.image.delete` | Row overflow > Delete | *unspecified* | D |

### Compose (8)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.compose_up` / `cmd.docker.compose_down` | Card CTA (aliases) | `compose_file_selected` / `compose_running` | — |
| `cmd.docker.compose.up_subset` | Scenario > Up | `docker_available && compose_subset_valid` | — |
| `cmd.docker.compose.down_subset` | Scenario > Down | `docker_available && compose_subset_running` | — |
| `cmd.docker.compose.scenario.save` | Scenario > Save | `compose_file_selected` | — |
| `cmd.docker.compose.scenario.run` | Scenario row > Run | `docker_available && compose_scenario_valid` | — |
| `cmd.docker.compose.scenario.edit` | Scenario row > Edit | `compose_scenario_selected` | — |
| `cmd.docker.compose.scenario.delete` | Scenario overflow | `compose_scenario_selected` | D |

### Build / Bake (9)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.build.select_target` | Target selector | `docker_available && build_candidate_present` | — |
| `cmd.docker.build.run` | Build CTA | `docker_available && build_target_selected` | — |
| `cmd.docker.build` | alias | `docker_available && build_target_selected` | — |
| `cmd.docker.build.image` / `cmd.docker.build.compose` / `cmd.docker.build.bake` | Build mode segments | *unspecified* | — |
| `cmd.docker.bake.preview` | Bake > Preview | `docker_available && bake_file_resolved` | — |
| `cmd.docker.bake.run` | Bake > Run | `docker_available && bake_target_selected` | — |
| `cmd.docker.bake` | alias | *unspecified* | — |

### Registries / Docker Hub / Publish / Unraid (7)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.registry.tag_push` | Publish > Tag and push | `registry_target_allowed && permission_allowed` | HG |
| `cmd.docker.registry.promote` | Promotion sheet | `registry_source_resolved && registry_target_allowed` | HG |
| `cmd.docker.create_repository` | Blocked card CTA | `registry_target_missing && permission_allowed` | HG |
| `cmd.docker.create_repository.confirm` | Protected confirm dialog | `repository_creation_confirmation_visible` | HG |
| `cmd.docker.create_repository.cancel` | Protected confirm dialog | `repository_creation_confirmation_visible` | — |
| `cmd.docker.template.commit` | Publish > Commit template | `template_dirty && capability_snapshot_current` | — |
| `cmd.docker.template.push` | Publish > Push template | `template_committed && permission_allowed` (`domain.image_publish`, never implied by local build approval, `:L8389`) | HG |

### Maintenance / drift (3)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.drift.compare` | Build/Publish/K8s > Compare | `docker_project_detected` | — |
| `cmd.docker.cleanup.scan` | Overflow > Cleanup advisor | `docker_available` | — |
| `cmd.docker.cleanup.prune` | Cleanup sheet > Prune | `cleanup_targets_selected && permission_allowed` | D |

### Contexts (1)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.context.select` | Runtime strip > Context picker | *unspecified* | — |

### Kubernetes (9)
| Command | UI element | Precondition | Gate |
|---|---|---|---|
| `cmd.docker.k8s.select_context` | K8s header picker | `k8s_available` | — |
| `cmd.docker.k8s.select_namespace` | K8s header picker | `k8s_connected` | — |
| `cmd.docker.k8s.apply` | Manifest row > Apply | `k8s_connected && manifest_selected && permission_allowed` | HG |
| `cmd.docker.k8s.diff` | Manifest row > Diff | `k8s_connected && manifest_selected` | — |
| `cmd.docker.k8s.logs` | Workload row > Logs | `k8s_connected && workload_selected` | — |
| `cmd.docker.k8s.exec` | Workload overflow > Exec | `k8s_connected && workload_running && permission_allowed` | A/HG |
| `cmd.docker.k8s.port_forward` | Workload overflow | `k8s_connected && workload_selected && permission_allowed` | A |
| `cmd.docker.k8s.helm_preview` | Helm card > Preview | `k8s_project_detected && helm_source_selected` | — |
| `cmd.docker.k8s.helm_install` | Helm card > Install | `k8s_connected && helm_source_selected && permission_allowed` | HG |

### Docker/Hosts (10) — all preconditions *unspecified* in the catalog
`cmd.docker.host.refresh`, `cmd.docker.host.preflight`, `cmd.docker.host.profile.save`, `cmd.docker.host.session.launch`, `cmd.docker.host.instance.start`, `cmd.docker.host.instance.stop`, `cmd.docker.host.instance.restart`, `cmd.docker.host.instance.retain`, `cmd.docker.host.access.open_app`, `cmd.docker.host.receipt.open` (`cmd.docker.hosts.open` is counted in Shell above). Envelope: `HostCapabilityCommand` carrying `permission_snapshot_id`, `destructive_command_policy`, `preflight_required`, `allowed_action_ids` (`Plans/UI_Command_Catalog.md:L7789-L7804`).

**Precondition coverage: 46 of 78 published; 32 unspecified.** See §8.

Adjacent, not in this panel's 78: `cmd.orchestrator.build_run` (local build only) and `cmd.orchestrator.push_image` (remote publish only) — the canonical two-step publish path (`Plans/Containers_Registry_and_Unraid.md:L472-L485`). `cmd.docker.image.push` and `cmd.docker.registry.tag_push` must share the same permission, account, receipt, and lineage checks rather than claiming a separate event family (`Plans/UI_Command_Catalog.md:L678`).

---

## 4. Row anatomy per subview

Worst-case identity strings, measured. At 11px monospace (~6.6px/char) a 224px band holds ~33 chars; a row with a 24px leading control and a 24px kebab leaves 176px ≈ **26 chars**.

| Subview | Worst realistic identity | Chars | Metadata | Status vocabulary | Required row actions |
|---|---|---|---|---|---|
| Containers | `puppetmaster-tastebook-import-worker-1` | **38** | image ref, published ports, uptime, health, access URL | running / exited / restarting / `container_unhealthy` / `owned_by_run` | open, view_logs, attach_shell, stats, inspect (`:L1623-L1682`) |
| Images | `ghcr.io/platyr/puppet-master-runtime:2026.07.24-a1b2c3d4e5f6` | **60** | size, created, digest `sha256:` + 64 hex = **71** (elide to `sha256:a1b2c3` = 13) | present / dangling / `image_missing` / tag `stale`/`missing` | push, tag, inspect, delete |
| Compose services | `import-worker` (13) in project `puppetmaster-tastebook` (22) | 13 / 22 | image, replicas, profile, env file, port map | up / down / `compose_service_missing` / scenario `stale` | up_subset, down_subset, logs, restart |
| Registries | `registry.internal.platyr.com:5000` | **33** | namespace, effective capabilities, last validation ts + host | `active` / `renamed` / `deleted` / `private_inaccessible` / `historical_only` (`:L230`) | browse, reconnect, pull, inspect |
| Build / Bake | `services/import-worker/Dockerfile` + stage `runtime` | 33 + 7 | context path, platforms, buildx readiness, last successful target | ready / `buildx_unavailable` / `bake_unavailable` / inference `ambiguous` | select_target, run, preview, override |
| Publish stages | 5 nodes: Local build → Push tag+digest → Hub repo → Template repo → Unraid follow-on | ≤ 22 each | `build_result_id`, `publish_result_id`, template status, workload refs | `not-attempted` / `blocked` / `failed` / `complete` / `missing-link` (`:L152`) | open receipt, retry, resume, explain |
| Template repo | `unconfigured`/`config_invalid`/`clean`/`dirty_uncommitted`/`committed_local_only`/`push_in_progress`/`push_failed`/`diverged_remote`/`needs_review` (`Plans/Containers_Registry_and_Unraid.md:L776-L788`) | ≤ 20 | `commit_status`, `push_status` (`:L812-L825`) | as listed | commit, push, `Review repo state` |
| K8s workloads | pod `tastebook-import-worker-7d9f8b6c54-x2k9p` | **40** | kind, namespace, replicas ready, rollout state; `k8s_workload_ref` = context + namespace + name + kind + UID + repo | `current_match_by_uid` / `name_match_only` / `historical_missing` (`:L192`); `k8s_rollout_blocked` | logs, diff, apply, exec, port_forward |

CRAU-021 row-action requirements (`:L2097-L2157`, prose at `:L218`): every row must distinguish **local vs remote host context**, **writable vs read-only/degraded/offline**, **single-select vs multi-select**, and expose an **exact disabled reason**. `Download / Save Local Copy` stays available whenever source access is readable even if remote/project FS writes are blocked. `Open in Terminal` disables only when no terminal-capable host/session path resolves. `system_default` is **not** in the canonical MVP target enum for this surface.

Every truncation must be **middle-ellipsis, tail-preserving**: for `jared/tastebook-worker:v1.1` (27 chars) a head-truncate loses the namespace and a tail-truncate loses the tag — both are row-differentiating. Preserve the last 8 chars unconditionally.

---

## 5. Blocked / degraded / indeterminate vocabulary (verbatim)

Canonical runtime-facing blocked payload — `blocked_reason_code`, ordered `allowed_action_ids[]`, `preserved_local_work`, `detail_ref?` (`Plans/Containers_Registry_and_Unraid.md:L980-L986`). Legacy `reason_code` and `recovery_options[]` are non-canonical and MUST NOT be copied into new shared contracts.

**Local-runtime reason codes** (`:L196`), canonical and advisory-only until refreshed into requested-vs-effective state:
`runtime_context_missing`, `runtime_context_unreachable`, `compose_invalid`, `compose_service_missing`, `buildx_unavailable`, `bake_unavailable`, `image_missing`, `container_unhealthy`, `access_url_unresolved`, `k8s_context_missing`, `k8s_context_unreachable`, `k8s_namespace_missing`, `k8s_rollout_blocked`. Panels may add port-mapping, workload-missing, or port-forward variants **only as typed extensions, not panel-local prose**.

**Disabled-state copy families** (`Plans/UI_Command_Catalog.md:L698`) — the exact six words for command availability copy:
`Unsupported`, `Not configured`, `Unauthorized`, `Unreachable`, `Degraded`, `Partial capability`. Panels must not invent Docker/Kubernetes disabled wording.

**Host/network states** (`Plans/Containers_Registry_and_Unraid.md:L449`): `offline_cached`, `network_blocked_by_policy`, `host_unreachable`, `host_untrusted`.

**Identity drift / indeterminate** (`:L211-L213`, CRAU-021): `stale_unowned`, `hard-refresh`, `indeterminate_remote_outcome` (receipt records `requested`, `transport_lost`, later `reconciled`), `Refresh remote state` CTA, `owned_by_run`.

**Publish-blocked** (`:L489-L499`, `:L519`): `docker.publish.blocked` with `reason_code: repo_creation_not_confirmed`, `blocked_step: create_repository` or `blocked_step: push_image`, plus `allowed_action_ids[]`; the built local image is preserved so retry needs no rebuild. Auth expiry during push → `docker.publish.failed` with `reason_code: auth_expired`, local build result preserved, re-auth + retry CTA, no rebuild (`:L302`). `docker.publish.blocked` (intentional non-execution) is distinct from `docker.publish.failed` (runtime failure) (`:L484-L485`). Auth recovery alone does not auto-resubmit — explicit resume/retry is required (`:L975`).

**Preflight** (`:L455`): if target identity, tool availability, host/trust/proxy policy, capability, or drift cannot be resolved, emit `blocked_preflight` and do **not** prompt for approval of an unknowable operation.

**Governance outcomes** (`:L174`), kept distinct because remediation differs by policy source: RBAC denied, namespace disallowed, admission/policy denied, Gatekeeper/Kyverno/Pod Security or image policy denied, quota or limit policy denied, `remote_mismatch`.

**DockerHub effective capability enum** — closed set (`:L309-L313`): `namespaces:list`, `repositories:list`, `repositories:create`, `images:push`, `repositories:read_private`. `effective_auth_provider_state`: authenticated / unauthenticated / degraded / expired (`:L331`). Gating rule (`:L323`): *if a surface requires a capability the effective set does not contain, the control MUST remain visible but disabled, with inline explanation that cites the missing capability and `degraded_reason` when present.*

**Detection tri-state** (`:L224`): `detected`, `manually_enabled`, `not_detected`.

**Stream intent** (`:L431`): `follow`, `paused_snapshot`, `historical_view` — plus explicit rendering of the `unknown gap interval` at crash time (`:L435`); never imply complete evidence.

**Required copy, verbatim**: when no access URL resolves, show `No direct access URL detected` and disable the open action rather than guessing (`:L427`). Resolution order is: explicit user override → first published host-port mapping preferring `443`, `80`, `3000`, `8080` → web-UI label → none (`:L420-L426`). Disabled controls get a short inline reason, a hover/focus tooltip with the exact blocking condition, and the primary recovery CTA; **they stay keyboard-focusable** (`:L168`). If effective state is unknown, show `unknown` with the next validation action — never assume failure.

---

## 6. Minimum viable 240px surface

224px usable band. Budget, top to bottom:

1. **Header, 24px.** Icon + `DOCKER MANAGER` truncated to fit; overflow kebab at 24px right.
2. **Runtime strip, 24px.** `[dot 24px][docker · default ................][kebab 24px]` — 176px of text carrying runtime, effective context (middle-ellipsised), and a stale/degraded glyph. Detection state and requested-vs-effective badges move into the strip's own overflow.
3. **Subview selector, 24px — a dropdown, not chips.** 11 subviews at 24px each need 264px. A dropdown button reads `Containers · 5` and opens a 24px-row list with disabled subviews still listed and annotated (`Kubernetes — Not configured`). This is the single most important 240px decision: the current 6-chip row already truncates and only covers 6 of 11 subviews.
4. **One blocked/stale banner, 32px, conditional.** `blocked_reason_code` short label + the first `allowed_action_ids[]` entry as a 24px button. Everything else behind `Explain this state`.
5. **Primary CTA, 28px, one only.** Subview-scoped: Compose up / Build image / Push image.
6. **Asset list, remaining height.** Single-line rows, 26px tall: `[status 24px][identity, middle-ellipsis, 176px][kebab 24px]`. Metadata line dropped. Every action lives in the kebab and the right-click context menu, which carry identical items.

Dropped at 240px, no exceptions: metadata second line, inline action clusters, requested/effective block, publish-chain stepper (collapses to one row `Publish: blocked at push_image`), scenario list (collapses to a dropdown), foldouts (dropdown entries only), filter bar (moves to header overflow), receipt panes, drift results, first-open cards.

Ruthless consequence: at 240px Docker Manager is a **navigator plus one CTA**, not a cockpit. Every one of the 78 commands remains reachable — via row kebab, header overflow, subview dropdown, or Command Palette — which satisfies `:L2089` ("all extras behind overflow menu") and `:L723` (deep subviews stay discoverable) without pretending to show them.

---

## 7. The three hardest layout constraints

1. **Eleven subviews will not fit any horizontal control at 240px.** 11 × 24px minimum hit target = 264px > 224px, and CRAU-009 forbids hiding unsupported ones — they must stay visible with a disabled reason (`:L144`). Icons-only is also barred because `Registries` vs `Registries / Docker Hub` and `Build / Bake` vs `Publish / Unraid` are not iconographically separable. Only a vertical dropdown satisfies visibility + hit target + disabled-reason simultaneously. At 380px a 6-chip row plus a `More` chip becomes viable; at 480px all 11 fit as two chip rows.

2. **Identity strings exceed the band by 2-3x while both ends carry meaning.** A 60-char image ref in a 26-char band is a 2.3x overflow; a 71-char digest is 2.7x. Registry lifecycle is digest-first and explicitly not name-based (`:L2222-L2288`), and old receipts must never silently rewrite to the currently selected repository — so the digest cannot simply be dropped, and the tag cannot be trusted as identity. This forces middle-ellipsis with a guaranteed tail, a digest chip that is a separate 24px control rather than inline text, and a detail sheet as the only place full identity is rendered.

3. **Every mutation row carries mandatory disclosure that competes with the action itself.** `hard_gate` actions need requested mode, effective capability, reason code, and last validation time as compact expandable badges (`:L168`); disabled controls need inline reason + tooltip + recovery CTA and must stay keyboard-focusable; receipts must be openable from the row. That is four affordances on a row that has 176px and one kebab. The resolution is a strict rule — **the kebab is the disclosure surface, the row body is never a button** — which in turn means the primary CTA must live outside the list.

---

## 8. Open questions and spec gaps

1. **32 of 78 commands have no published precondition.** `Plans/UI_Command_Catalog.md:L641-L674` and `:L686-L694` cover 46. Unspecified: the 7 bare-namespace ids (`cmd.docker.container|image|compose|context|network|volume|k8s`), `container.stop`, `container.restart`, `container.delete`, `image.tag`, `image.inspect`, `image.delete`, `context.select`, `bake`, `build.image`, `build.compose`, `build.bake`, `open_dockerfile`, and all 11 `cmd.docker.host.*`. Without preconditions there is no `disabled_reason` to render, and `Plans/Wiring_Matrix.production.json` supplies only a boilerplate `state.commands.<id>.disabled_reason` projection path with no vocabulary.

2. **The wiring matrix records no gating metadata at all.** All 78 entries share identical `acceptance_checks`, `effect_kind: "receipt"`, and `expected_event_types: []`. Nothing distinguishes `cmd.docker.container.delete` from `cmd.docker.container.inspect`. The destructive/hard-gate classification in §3 is reconstructed from `:L168` and `:L921-L922` prose, not from a machine-readable field. A `confirmation_class` field on each entry would close this.

3. **DockerHub auth commands are specified but not wired.** `Plans/Containers_Registry_and_Unraid.md:L281-L289` mandates `cmd.docker.browser_login` (emitting `docker.auth.browser_login.started`, `.device_code_issued`, `.polling`, and one of four terminal outcomes) and `cmd.docker.save_pat`. Neither appears in the wiring matrix, nor do validate-auth or `/clear` auth actions, despite `:L125` naming settings-level `/clear` auth recovery as part of the canonical Docker Manager surface. The panel is required to render a device code, a `user_code`, and a `verification_uri` with no command to trigger it.

4. **No image-pull command exists.** `:L130` requires `Images` to support pull, and `:L132` requires `Registries` to support pull, but neither `cmd.docker.pull` nor `cmd.docker.image.pull` is registered. `cmd.docker.registry.promote` covers `/promote/pull/retag` semantically (`:L232`) but is described as a promotion action requiring `registry_target_allowed`, which is wrong for a read-only pull.

5. **Docker/Hosts is an unreconciled 12th surface.** Eleven commands route to `Docker Manager > Docker/Hosts page`, described as "a routed destination rather than a new Activity Bar owner" (`Plans/UI_Command_Catalog.md:L7801`), but CRAU-007 (`:L1278-L1342`) does not list it among the canonical subviews and CRAU-008 forbids splitting into unrelated mini-surfaces (`:L1344-L1402`). Whether it is a `Contexts` sub-leaf, a 12th subview, or a modal is undecided.

6. **`needs_review` vs `/failure` payload semantics are an open owner conflict.** `Plans/FinalGUISpec.md:L1418` states this must be shown as an automation-first operator-flow mismatch until the container owner resolves it, and F3-117 records it as an unresolved owner boundary (`Plans/FinalGUISpec.md:L10264-L10319`). The panel needs a decision on whether `needs_review` renders as blocked or as degraded.

7. **No prune commands for Networks/Volumes.** `:L158` requires the cleanup advisor to cover `Volumes` and `Networks`, but only `cmd.docker.cleanup.scan` / `.prune` exist, with `cmd.docker.network` and `cmd.docker.volume` as bare namespaces. Whether the foldouts get their own row-level prune, or route into the shared cleanup sheet, is unspecified.

8. **Row multi-select is required but has no command shape.** CRAU-021 requires rows to distinguish single-select from multi-select (`:L218`), and `cmd.docker.cleanup.prune` takes `cleanup_targets_selected` (plural). No other command declares a multi-target payload, so batch stop/delete/push has no contract.

9. **Character budget is unvalidated against the render stack.** The 24px hit target (`Plans/FinalGUISpec.md:L2146`) and the 240px floor (`:L2089`) are both fixed, but no spec states the panel's internal padding, so "224px usable" is this brief's assumption and should be confirmed against `_pm-tokens.css` before the ladder is implemented.
