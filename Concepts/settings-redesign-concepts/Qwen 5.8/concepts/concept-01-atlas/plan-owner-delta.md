# Plan-owner delta — concept-01-atlas — Qwen 5.8

Packet: PM_Settings_Bakeoff_Final_Cumulative_2026-08-08 · doc 10 plan-owner list.
This concept's demonstrated families: **Context & Instructions, Memory, Personas, Goal & Automation, Crew, Permissions & FileSafe, Back Seat Driver**.
The audit below covers every packet plan owner; concept-specific depth lives in the demonstrated families and in the companion registers (impact-register.json, candidate-*-delta.json).

## Plan-owner audit (packet 10 list)

- **FinalGUISpec** — The s4 bloom modal contract is superseded: all four concepts replace chip/bloom/shelves with a full Settings Workspace and left-shell canon. `cmd.settings.bloom.open` retires to a compatibility alias only if needed. No right-panel language remains.
- **settings inventory and schema** — The 10-destination taxonomy is a proposal, not a reorg: a mapping table from inventory categories to destinations is required, plus tier-vocabulary migration (packet exposure ladder vs inventory tiers). Setting ids re-root to destination prefixes.
- **Models System** — Provider family card answers the six default overview questions. Free Models is a wrapper: it never owns credentials, quota, switching, or Usage. Catalog refresh keeps last-known-good on failure.
- **Multi-Account** — Per-account nickname/identity/auth-source/profile-root/enabled/priority/sticky/usage/health/model-visibility demonstrated. PM never pretends a CLI supports simultaneous profiles; isolation strategies (isolated home, auth-only profile, credential pool, PM-managed direct, single-active-login) surface honestly.
- **CLI Bridged Providers** — Claude CLI and Antigravity OAuth are CLI-owned; PM isolates profiles and launches the native flow, never PM-direct OAuth there. Supported PM-direct OAuth shown only for OpenAI.
- **Provider OpenCode** — New external-server provider fixture: updateState `managed-externally`, server-managed session, plus an `unknown-owner` installation whose Unknown confidence makes updates manual-only.
- **Media** — Destination retired per final matrix. Continuation settings moved to the Provider manager; audio not-configured row lives as a Desktop fixture; video output survives as a searchable unavailable-capability exemplar with a reason.
- **Prompt Pipeline** — Context admission receipt (admitted/omitted blocks, source hashes, AGENTS.md precedence chain) is the pipeline boundary demonstrated; the registry is never injected into prompts merely because Settings exposes it.
- **Assistant Memory** — Evidence-backed degrading gists: half-life changes retrieval activation, not truth or deletion; verified/unverified provenance; Assistant-only hidden memory; verify/edit/pin/delete; version history + restore; capsule preview + token estimate; rebuild/dedupe/redact. Automated systems use explicit retrieval, not hidden gists.
- **Personas** — Persona is behavior, not authority: cannot grant Full Access, widen FileSafe, force a provider, or eagerly load all skills. Stale `ask/plan/regular/yolo` coupling corrected — conversation mode and access profile are separate. Import diff/trust/secret/prompt-injection scan demonstrated.
- **Goal Runtime** — Settings owns defaults and ceilings only; live run state stays with Usage/Orchestrator. The sustainable-concurrency readout is explicitly operational, not a second setting.
- **Orchestrator/Subagents** — Crew templates show requested vs effective members, waves, adaptive sizing, guards, reserve, worktree policy, board topology, reducer/synthesis, failure/stop behavior. Crew is not a Persona, mode, provider, permission grant, or hidden memory.
- **Planning Wizard / PRD Builder** — Planning conversation route must stay high-quality; background extraction may use cheaper routes; final integration stays high-quality. Rows carry the quality effect badge.
- **Permissions** — Global wildcard default, per-tool overrides, ordered granular rules, last-match-wins explanation, reorder, wildcard help, presets, ELI5/Expert, requested/effective/origin. Conflict-pair fixture demonstrates the trace.
- **FileSafe** — Non-bypassable floor: health, effective boundary, protected scopes, repair guidance; the manager never encourages unsafe bypass.
- **Commands** — Custom command CRUD with parameters/includes, shell safety, and dry-run preview; dry run never sends work to an agent.
- **UI Command Catalog** — Census performed against Plans/UI_Command_Catalog.md (2026-08-11): canon reused (`cmd.account.select_profile`, `cmd.provider.switch_route`, `cmd.usage.refresh/export`, `cmd.theme.*`, `cmd.persona.*`, `cmd.settings.open_notifications`, `cmd.settings.open_storage_retention`, `cmd.storage.compaction.request`, `cmd.project.delete_data`, `cmd.chat.delete`, `cmd.sound.*`); packet's `cmd.notifications.sound.*` family flagged as conflicting with canon `cmd.sound.*`; `cmd.settings.bloom.open` flagged retire/alias. No canon minted by any concept.
- **MCP** — Three server fixtures across connected/needs-auth/error with transport, protocol negotiation, approval, exposure, and logs (Local Docs is disabled after repeated failures). No browser MCP routes — the packet canon mandates PM's own Browser Program API.
- **Skills / Plugins / Tools** — Distinct domains sharing manager grammar: provenance/trust, install/update/compatibility, project enablement, installed/enabled/available/selected/invoked states.
- **LSP** — Catalog/provenance, requested/effective attachment, custom CRUD, restart, logs, limits, remote degradation, verification.
- **Formatters** — Global enable; built-in/custom table with detected/not-found/disabled; add/remove/reset; Global/Project scope; health and test.
- **File Manager** — Tree, drag/drop, hidden/ignored, large-file thresholds, tabs/split, changed-on-disk, recovery, transient/unavailable reasons.
- **Testing** — Global/Project × Auto/On/Off per capability matrix (10 capabilities), capture/artifacts, secret redaction.
- **Worktrees/Git/GitHub** — Exact tool installation health, forge connection, SSH source, test-before-merge, push/force-push policy, leases, worktrees; GitHub Actions pinned workflows + run/job/log browsing.
- **Containers/Registries** — Human top-level Docker/Podman/Kubernetes; expanded detail (engine/CLI/Compose/Buildx, kubectl/Helm, kubeconfig contexts, registry auth).
- **Storage** — Mode, pressure, retention, legal holds, encryption, quarantine; compaction only as owner-admitted request (`cmd.storage.compaction.request`), never direct.
- **Runtime Artifacts/Outputs** — Type/location/version/retention/receipts/redaction/reveal/cleanup; PM-owned vs provider-native identity.
- **Release/updates owner** — Deferred Updates module reserves grammar and deep-link slots; provider update lifecycle (available → updating → verifying → ready | verification-failed → rolled-back) demonstrated; scheduled-idle and managed-externally states covered.
- **Binary Locator and installation lifecycle** — Resolver traces wrappers/symlinks/shims; confidence ladder Proven/Strongly identified/Probable/Ambiguous/Unknown; unknown/ambiguous ownership manual-only; duplicates surfaced as shadowed.
