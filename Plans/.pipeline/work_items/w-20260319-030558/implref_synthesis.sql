INSERT OR REPLACE INTO implementation_ref_summaries(summary_id, summary, architecture_patterns, robustness_patterns, pm_implications, updated_at) VALUES (
'implref-synthesis',
'Overall synthesis: the implementation-reference fleet converges on one answer for PM. The strongest cross-target pattern is not a thin editor wrapper and not a shell around somebody else''s IDE; it is a native workbench with explicit service boundaries. The most portable signal comes from the more complete-platform cluster (`bench-01`, `bench-04`, `bench-09`, `bench-17`, `bench-21`, `bench-29`, `bench-32`) plus the operational local-seam cluster (`bench-23`, `bench-25`, `bench-27`, `bench-30`). Those targets repeatedly separate latency-sensitive editing/view state from heavier background work such as file walking, watchers, git, indexing, remote RPC, PTY/runtime, and preview execution. The early thin-wrapper/browser-first cluster (`bench-06`, `bench-07`, `bench-08`, `bench-12`, `bench-16`, `bench-18`, `bench-26`) is still useful, but mainly as a warning and as a source of small leaf-surface techniques: preserve selection/caret during controlled updates, guard mirrored host-to-editor sync, keep execution transport separate from document state, and keep collaboration overlays separate from canonical content. `bench-05` adds breadth pressure for file-manager operations, while `bench-28` adds control-plane pressure for remote/runtime orchestration; PM should learn from both without becoming either a monolithic request app or a delegated-backend shell. For PM''s Rust + Slint rewrite across macOS, Linux, and Windows, the robust direction is: Rust-owned identity, buffers, diff/review, save/recovery, watchers, ignore policy, search/indexing/autodetection, LSP brokering, preview session state, terminal/runtime state, and SSH/remote state machines; Slint-owned pane/layout/tree/review/status chrome; platform adapters for OS-facing seams; specialized renderers only for bounded surfaces such as browser-like preview. This strongly supports making File Manager and Editor docs implementation-ready as one shared workspace contract rather than as separate feature packets.',
'Strong architecture patterns:

1. Native workbench with explicit service boundaries
- Repeatedly robust across `bench-01`, `bench-04`, `bench-09`, `bench-17`, `bench-21`, `bench-29`, `bench-32`.
- Copy directly: separate editor/view responsiveness from background services.
- PM shared Rust core should own: resource identity, text/buffer registry, save/recovery, watcher/invalidation policy, gitignore policy, search/indexing, autodetection, LSP capability brokering, diff/review, preview session state, terminal/runtime session state, and SSH/remote state.
- PM should reinterpret for Rust + Slint: Slint orchestrates shell chrome, pane layout, trees, lists, review widgets, banners, and requested-vs-effective disclosures, but does not become the hidden owner of document or runtime truth.

2. Thin editor adapter over a host-owned model
- Strong positive signal from `bench-06`, `bench-07`, `bench-08`, `bench-12`, `bench-16`, `bench-18`, `bench-26` even though those targets are weak full-product references.
- Copy directly: preserve caret/selection across controlled updates; use silent or guarded host-to-editor update paths; keep split/editor-instance undo ownership explicit; treat collaboration or remote cursors as overlays, not content.
- Reinterpret: in PM, the text engine is a leaf surface plugged into a Rust document model with explicit versioning, not the owner of file identity, open routing, or persistence.
- Avoid: letting wrapper/editor lifecycle rules define PM''s workspace architecture.

3. Typed resource identity beats path-only identity
- Strongest in `bench-09` and the later complete-platform cluster.
- Copy directly: explicit identity kinds for workspace file, generated artifact, scratch/history item, remote file, preview subject, terminal session, and session-bound resource.
- PM docs should lock generated-vs-workspace identity now. Open/save/export/reveal must route by resource type, not by whichever pane currently shows something similar.

4. File watching, atomic save, and external-change handling are core services
- Strong operational signal from `bench-23`, `bench-25`, `bench-27`, `bench-30`.
- Copy directly: atomic save where supported, explicit watcher-driven invalidation, reload/conflict signaling, durable histories for search/replace/locations.
- Shared Rust core, not UI, should own dirty state, on-disk change detection, save conflict transactions, and recovery snapshots.

5. Reusable diff/review pipeline instead of one-off compare UIs
- Strong fleet-wide product lesson; implementation pressure reinforced by the more complete workbenches.
- Copy directly: one diff/review service reused by editor compare, source control, apply-suggestion flows, conflict resolution, and chat-thread diff exposure.
- Reinterpret for PM: implement as a Rust diff/review engine with source anchors, hunk actions, grouped transactions, and renderer-agnostic outputs that Slint can present inline, side-by-side, or unified.
- Avoid: marker-only or approximate diff models that are visually convenient but operationally untrustworthy.

6. Background indexing and capability activation with honest state disclosure
- Strongest from `bench-03` in prior fleet synthesis and reinforced by implementation clusters.
- Copy directly: project-driven capability activation, incremental indexing, cache reuse, explicit degraded/indexing state.
- Reinterpret: PM should keep autodetection visible and overridable, and capability activation should feed search, symbols, LSP, review affordances, and runtime actions from one shared project model.

7. OS-facing seams need platform adapters
- Repeated signal in `bench-01`, `bench-04`, `bench-09`, `bench-17`, `bench-21`, `bench-32`.
- Platform adapters should own: native dialogs; open/reveal routing to OS; drag/drop payload translation; file-watcher backends; path, symlink, case-sensitivity, and trash semantics; PTY/process launch; keychain/credential storage; browser/runtime embedding; shell/open commands.
- Shared Rust core should stay platform-neutral above those adapters.

8. Remote/runtime is a control plane, not just different paths
- Strong comparative lesson from `bench-28` plus broader remote-capable targets.
- Copy directly: explicit attachment/bootstrap/version diagnostics, backend/session lifecycle, launch diagnostics, and recovery paths.
- Reinterpret: PM remote file manager, remote LSP, remote terminal/runtime, and remote preview should share one requested-vs-effective state model rather than independent ad hoc banners.

Direct copy vs reinterpret vs avoid:
- Copy directly: thin editor adapter; source-canonical preview patching; atomic save + watcher invalidation; reusable diff/review service; virtualized trees and lazy indexing; explicit histories; typed identities; explicit requested-vs-effective disclosures.
- Reinterpret for native Rust + Slint: all UI-shell patterns, diff viewers, preview surfaces, command routing, and capability activation.
- Avoid: DOM-first editor architecture, browser storage identity, monolithic request-layer file manager backends, hidden delegated IDE ownership, and approximate diff/merge implementations.',
'Repeated fragility patterns:

1. Browser/DOM-coupled editing correctness debt
- Repeats across `bench-06`, `bench-07`, `bench-08`, `bench-12`, `bench-16`, `bench-18`, `bench-26`.
- Failure modes: cursor drift, IME and Unicode regressions, paste/clipboard bugs, shadow-root or popup issues, controlled-value feedback loops, resize breakage, diff refresh glitches.
- PM should avoid this entire assumption stack as a product-core implementation choice.

2. Thin wrappers fail exactly where PM needs depth
- Common weak seams: durable file identity, save/export, multi-file workspace truth, diff/review, gitignore-aware traversal, search/index cohesion, terminal/runtime, and SSH/remote.
- Avoid: treating wrapper ergonomics as evidence of workbench robustness.

3. Operational seams break more often than demo seams
- Cross-cluster convergence: packaging/startup, external-change handling, save/compile loops, file explorer correctness, drag/drop crashes, indexing churn, runtime polling/auth/bootstrap, remote reconnect, and path normalization.
- PM should put validation and state machines around these seams before polishing surface variety.

4. Breadth without typed ownership creates chronic churn
- `bench-05` warns that broad file-manager features without typed boundaries create long-tail bugs in upload/save/encoding/preview/security/path handling.
- `bench-28` warns that control-plane products concentrate bugs around bootstrap timing, key provisioning, host/container identity mismatches, and environment synthesis.
- PM should avoid both monolithic breadth and hidden delegation.

5. Silent partial failure destroys trust
- Repeated across remote/indexing/auth/runtime-capable systems.
- PM must make requested-vs-effective state explicit wherever capability downgrade changes behavior.

Seams needing the most explicit requested-vs-effective state and degraded-state disclosure:
- SSH/remote filesystem: connected vs cached vs offline vs stale; writeable vs read-only; watcher fidelity; pending sync.
- Remote LSP/indexing/autodetection: requested capability, effective provider, warmup state, disabled/deferred reasons, fallback path.
- Save/recovery/on-disk change: requested save, effective result, partial write failure, conflict state, retry path, recovery snapshot availability.
- Diff/review/apply/conflict: exact compare target, hunk-action availability, partial apply failure, grouped undo scope, conflict-mode limits.
- Preview/browser: trusted vs sandboxed vs runtime_unavailable; live reload vs manual refresh; preview editable vs view-only; local vs remote asset reload limits.
- Search and symbol navigation: LSP-backed vs index-backed vs text-only fallback; ignored-file inclusion; warm vs cold index.
- Terminal/runtime integration: requested runtime target/context, effective shell/PTY/remote binding, shell-integration tier, renderer degradation.
- Large-file/binary/encoding flows: requested open mode, effective read-only/truncated/viewer fallback, reason codes.

Patterns PM should avoid:
- approximate marker-based diff/merge
- browser storage or URL/session identity as durable workspace truth
- hidden worker/service assumptions inherited from Electron/DOM runtimes
- Unix-only shell, signal, or path behavior in shared core logic
- ephemeral collaboration/session models as a baseline for durable workspace state
- treating ignore policy separately in tree, quick open, and search.',
'Concrete PM implications and doc reconciliation priorities:

1. Reconcile File Manager and Editor as one implementation packet
- Lock a shared workspace contract: one source-canonical buffer registry, typed resource identities, one open/reveal routing model, one save/recovery model, and one invalidation model across tree, editor, diff, preview, search, git, and remote.
- This should be the first reconciliation move because generated-vs-workspace identity, preview ownership, diff ownership, and remote routing all depend on it.

2. What PM should copy directly
- Thin editor adapter beneath a host-owned Rust document model.
- Atomic save plus watcher-driven external-change signaling.
- A reusable diff/review service with hunk actions and shared ownership across source control, apply-suggestion, conflict resolution, and chat-thread diff exposure.
- Virtualized file trees, lazy scanning, persisted histories, and explicit background indexing states.
- Source-canonical preview editing where HTML/Markdown/Mermaid/SVG preview actions resolve to bounded text patches, not alternate authorities.
- Typed resource identity for workspace files, generated artifacts, remote files, preview subjects, and runtime sessions.

3. What PM should reinterpret for native Rust + Slint
- Editor/view component patterns from wrapper targets: keep their guarded-update and selection-preservation lessons, but reimplement them atop Rust document/version services.
- IDE-style capability activation: use project-driven autodetection and background indexing, but keep it visible, overridable, and bounded.
- Remote control-plane lessons: implement one PM-native remote/session state machine rather than copying delegated-backend assumptions.
- Rich preview/browser surfaces: use specialized renderers only behind a PM-owned preview contract and trust model.

4. What PM should avoid
- Using a web editor wrapper, delegated IDE backend, or browser storage/session model as the hidden system of record.
- Treating diff/review as a secondary visual layer instead of a first-class service.
- Letting file manager breadth accrete as one generic request layer without typed operations, policy checks, and recovery semantics.
- Depending on Unix-only PTY, shell, or reveal behaviors in cross-platform core logic.

5. Platform adapters vs shared Rust core
- Shared Rust core: path/resource normalization policy, typed identities, buffer/text engine integration, undo/redo transactions, diff/review engine, save/recovery transactions, watcher event normalization, ignore policy, search/indexing/autodetection, LSP broker, preview session model, remote state machine, terminal/runtime state, command routing model, persistence schemas.
- Platform adapters: filesystem watcher backend, native dialogs, OS reveal/open commands, trash/permanent delete, drag/drop translation, clipboard and IME bridge details, keychain/credential access, PTY/process host, browser/webview embedding where used, platform path casing and symlink queries.

6. Immediate doc-fleshing priorities for implementation readiness
- File Manager:
  - rename/delete/duplicate/move/copy/bulk-op transaction model
  - refresh, watcher invalidation, and conflict behavior
  - gitignore and ignored-file behavior across tree/search/quick-open
  - drag/drop contract for desktop to tree, tree to desktop, and intra-tree moves
  - generated-vs-workspace visibility, promotion, export, and reveal behavior
- Editor:
  - save/dirty/recovery/on-disk change matrix
  - shared-buffer undo/redo semantics across multiple groups and preview-backed edits
  - binary/large-file/encoding/read-only reason model
  - requested-vs-effective capability banners for indexing, LSP, remote, and preview runtime
- Diff/review:
  - canonical compare-target identity and routing
  - hunk actions, grouped undo/redo, search within diff, conflict UI, annotations anchoring, heat map/change-marker model
- Preview/browser:
  - preview session lifecycle, ownership, trust tiers, runtime_unavailable behavior, linked-asset refresh scope, and source-patch bridge
- Remote/LSP/indexing:
  - remote filesystem/cache/offline semantics
  - remote LSP root mapping and fallback strategy
  - autodetection warmup, override UX, and degraded-state disclosure

7. Practical ordering
- First: lock identity/open/reveal/save ownership across File Manager, Editor, Preview, Diff, Search, and Remote.
- Second: lock mutation matrix and grouped transaction semantics, including preview edits and patch/apply flows.
- Third: lock watcher/invalidation/ignore policy shared across tree, editor, preview, search, git, and remote.
- Fourth: lock remote control-plane and requested-vs-effective disclosures.
- Fifth: finalize platform adapter boundaries so macOS/Linux/Windows parity does not leak into shared-core docs as ad hoc exceptions.

Bottom line for PM: the fleet says to build a native Rust workbench with Slint shell chrome, not a wrapped editor and not a delegated IDE. The planning docs are closest to implementation-ready when they unify File Manager and Editor around shared typed identity, shared source-canonical mutation, reusable diff/review, explicit degraded states, and strict separation between shared Rust core and platform adapters.',
datetime('now')
);

UPDATE todos SET status = 'done' WHERE id = 'implref-synthesis';
