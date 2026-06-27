# Shard 003: Rewrite alignment (2026-02-21)

Source: `Plans/FileSafe.md`

Source lines: L23-L68

Source SHA256: `a2edd7b12a5cf46ab6ec337d991f2ac9649fad4fad028ee0533262381c9af612`

---

## Rewrite alignment (2026-02-21)

This plan remains authoritative for **FileSafe safety policy only**. As the rewrite lands, FileSafe is implemented primarily through:
- the **central tool registry + policy engine** for permissions, validation, and normalized tool outcomes
- the **patch/apply/verify/rollback pipeline** rather than ad-hoc guardrails in UI code
- emitting guard decisions, violations, and remediation into the canonical seglog event stream

ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md

Context compilation, delta-context selection, cache heuristics, marker files, skill bundling, and compaction strategy are owned by `Plans/Prompt_Pipeline.md`. FileSafe may reference those flows only to define where safety checks run against compiled output.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Architecture_Invariants.md

Any UI or storage examples in this plan are illustrative unless they describe guard behavior, fail-closed execution, canonical logging, or explicit FileSafe-owned payload contracts.

Plans review synthesis informs FileSafe applicability without creating a new process artifact owner: `plans_review_findings` and `plans_review_summaries` recorded highest-confidence strengths in FileManager shared-buffer `/file-tree` behavior, preview `/file-type` behavior, source-canonical editors, and local LSP/editor coverage, while the FileSafe-owned reconciliation `/gaps` are the incomplete mutation contract across user edits, agent edits, preview edits, and FileSafe, plus under-specified remote `/cache/offline/LSP/degraded-state`, `/watchers/degraded-state`, stale `/snapshot` wording, and preview `/trust/fallback` rules. FileSafe consumes `/FinalGUISpec/storage-plan` and FileManager open/reveal ownership as adjacent contracts; it only owns whether mutations, restore-before-rerun, and guard outcomes fail closed against those contracts.

File rename, delete, duplicate, bulk file-manager operations, refresh-after-operation, and `/transaction/conflict` handling are FileSafe-relevant when they mutate workspace files or claim rollback. Session view-state prompts such as `Don't ask again` remain shell/UI state, but FileSafe must treat any saved preference that changes mutation or restore prompting as auditable guard input rather than invisible view-state.

FileSafe implementation guidance keeps a hard boundary between portable product ideas and implementation patterns tied to Electron/DOM-heavy stacks. Guard logic, canonicalization, mutation-safety, /durability, atomic write, optimistic concurrency, and event logging must remain safe for a Rust + Slint, macOS/Linux/Windows product instead of depending on DOM process, browser storage, or Electron-only lifecycle behavior.

External implementation-reference findings refine this boundary without creating FileSafe ownership over FileManager, FinalGUI, preview/browser, terminal, platform-adapter, diff/review, SSH/remote, preview/media, drag/drop, or file explorer correctness. FileSafe consumes those adjacent contracts only when they provide guard-visible inputs for mutation authorization, rollback, reveal/open routing, runtime dispatch, recovery, or event logging; durable workspace identity, generated-vs-workspace state, and gitignore-aware traversal must be supplied by their owner docs before FileSafe treats an action as safe.

Guard-visible inputs include typed resource identity, `/open/reveal/save`, `/dirty/recovery/on-disk`, external-change detection, grouped `/undo` / `/redo`, `/symlink/case-sensitivity`, `/IME/accessibility`, `/browser/session`, `/webview`, search-in-diff, heat-map, `/change-marker`, and requested-vs-effective/degraded-state evidence from remote, preview/runtime, terminal, and LSP/indexing seams. FileSafe must fail closed when those inputs are absent or stale, but packet-level elaboration stays non-authoritative until the owner docs expose guard-ready contracts.

Cross-surface commands such as `cmd.orchestrator.open_in_source_control` are meaningful UX actions only when their arguments derive from the shared route schema; FileSafe treats custom arg shapes as guard-visible inputs, not a separate command contract.

Projection trust and hostability are guard-visible when FileSafe-relevant actions launch from `FinalGUISpec`, `Widget_System.md`, or `Orchestrator_Page.md`: the reusable `trust-state` UI contract must cover projection-backed tabs, `/widgets/panels`, terminal widget identity, `/Dashboard`/Progress hostability, page/tab/global and `/tab/global` filters, `focused-run` scope, and widget-local display config before FileSafe treats the action context as safe.

Orchestrator `live-status` dependencies must bind FileSafe-relevant actions through canonical runtime blocked identity: request-centric `HITL` bindings and blocked-projection bindings cannot compete or decide recovery authority independently.

Routing/open seams stay owner-doc inputs but become FileSafe verification inputs when they gate mutation or reveal behavior: `route_target` must not carry `source-buffer` realization details, `/file/evidence` and `/attempt/generated` surfaces must expose first-class project/attempt/generated identity, and `/open-by-identity` plus `/wiring` normalization must come from owner-doc contracts rather than addendum-only concepts.

FileSafe treats the routing/open-by-identity tranche as ordered reconciliation rather than broad invention: first close the one owner-doc structural gap, then the one command/wiring normalization gap, and only then accept the bounded set of stale consumer reconciliations as guard-ready inputs.

`runtime-era` concepts in adjacent docs are not sufficient until registration/verification/routing owners expose them as guard-ready contracts; if owner docs lag, FileSafe records the seam as a `/verification/routing` or `spec-integrity` failure instead of accepting broad claims from `Orchestrator_Page.md`, runtime-artifact schemas, or command catalog references.

An advertised missing section in `Orchestrator_Page.md` is a `spec-integrity` failure, not merely a content gap, when FileSafe must rely on that owner claim for guard-visible routing or verification.

`Decision_Policy.md` (`Decision_Policy`) remains the authority for who can acknowledge concerns, revoke promotions, confirm corroboration outcomes, or own blocked states under the overseer model; FileSafe consumes that authority before allowing guard recovery or promotion-related actions.

Shell/view restore fields such as `active_subview`, compare target, widget configuration, panel docking state, split ratios, and per-project restore state are shell-state inputs layered under canonical routing; FileSafe may audit them only when they change mutation prompting, recovery, or guard-visible destination state.

Execution/runtime transport remains a separate seam with explicit request/response/error ownership before spawn. FileSafe may block terminal-first, Unix-native, single-snippet, and `/browser-runner` flows that depend on direct `/bin/sh`, Unix signals, VTE/TTY, `/input/cursor/selection`, IME, platform-specific `/reveal`, `/compile`, runtime `/auth` or `/polling`, asset serving, persistence, remote `/bootstrap`, packaging/startup, or macOS/Linux/Windows portability assumptions when those paths would bypass canonical scope, recovery, or event logging.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Decision_Policy.md
