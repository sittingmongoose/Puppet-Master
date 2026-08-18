# Full-Thread Current Decision Register

**Scope:** every substantive decision from the Puppet Master optimization/performance thread, reconciled with the newest supplied server-first, source-control lifecycle, Settings-completeness, and Product-Onboarding handoffs.  
**Status:** coordination authority for these handoffs; not a canonical Plans edit.

---

# 1. Optimization philosophy and evidence standard

## 1.1 RPCS3-style engineering discipline

Puppet Master should adopt the engineering discipline illustrated by RPCS3 rather than copy emulator-specific tricks indiscriminately:

1. profile the real end-to-end workload;
2. find incorrect architectural assumptions, polling, repeated work, and bad data movement;
3. improve algorithms, scheduling, locality, batching, allocation, and ownership;
4. use established optimized libraries and compiler support;
5. add runtime-dispatched instruction-set fast paths only for proven hot kernels; and
6. use handwritten assembly only when intrinsics/compiler output remain measurably inadequate.

The product must not treat AVX-512, NEON, SVE, or any other instruction set as a blanket solution. Avoiding one provider call, full repository scan, process launch, UI model rebuild, or redundant parse will usually beat a micro-optimized loop.

## 1.2 Required optimization order

```text
eliminate work
→ improve scheduling/data flow/locality
→ use optimized libraries, release tuning, LTO, and PGO
→ add runtime-dispatched SIMD/special-instruction kernels
→ consider handwritten assembly only with end-to-end evidence
```

## 1.3 Candidate profile-proven kernels

A narrow low-level kernel module may eventually contain portable and architecture-specific implementations for:

- provider stream delimiter/structural-byte/newline scanning;
- incremental JSONL/SSE/WebSocket framing;
- first mismatch, common prefix, and common suffix;
- diff/block fingerprinting and rolling checksums;
- content hashing and CRC/checksum work;
- redaction and byte-class scanning;
- terminal ANSI/escape/newline scanning;
- Tantivy/vector-search support kernels where underlying libraries do not already optimize them;
- image-difference/histogram/resampling operations; and
- compact bitset operations.

Business logic must never be duplicated per architecture. Every fast path requires a portable reference, safe runtime dispatch, equivalence/fuzz/boundary tests, and an end-to-end win.

## 1.4 Performance includes power and idle behavior

Measure:

- CPU time and wakeups while idle;
- thermal behavior;
- battery/Low Power behavior;
- process-tree memory, not only UI-process RSS;
- storage and network activity while apparently idle;
- long-session growth/leaks;
- input-to-visible response;
- provider-fragment receive-to-paint;
- pause/stop under saturation;
- queue delay and backpressure; and
- installation/download footprint.

A loop that wins a microbenchmark while waking the machine continuously is a regression.

---

# 2. Many-thread architecture

## 2.1 Core model

Puppet Master should support large logical concurrency without one OS thread or process per activity.

```text
many durable chats/threads/Plans/Goals/WorkNodes/browser tasks
≠ one OS thread each
≠ one child process each
≠ all admitted simultaneously
```

These are durable state machines multiplexed over bounded runtimes and governed external-process pools.

## 2.2 Seven execution lanes

1. **Slint UI thread** — input, immediate geometry, narrow model deltas, paint submission.
2. **Interactive control/projection reserve** — pause/stop, approvals, selected stream projection, loading-state transitions, mutation fencing.
3. **Async I/O runtime** — provider streams, sockets, PTYs, process pipes, watchers, timers, browser/LSP/MCP transports.
4. **Bounded CPU work-stealing pool** — parsing, hashing, diffing, compression, indexing, redaction, image comparison.
5. **Bounded blocking/platform pool** — package managers, blocking filesystem/platform APIs, elevation brokers.
6. **Storage append/projector/index lanes** — seglog append, redb projection/checkpoint work, Tantivy indexing/merge maintenance.
7. **Governed external-process pools** — CEF helpers, provider CLIs, LSPs, DAPs, MCPs, compilers, tests, emulators, simulators, recorders.

The interactive reserve must remain available even when every foreground/background permit is occupied.

## 2.3 Sole resource-policy owner

`RuntimeResourceGovernor` remains the only canonical resource-policy/admission owner. Domain systems request permits and publish demand; they do not create competing global schedulers.

It governs:

- CPU and blocking work;
- RAM and byte-budgeted caches;
- provider/account/model/reset/overage capacity;
- process counts;
- browser process/context/page and recorder capacity;
- LSP/DAP/MCP/test/device/simulator/emulator capacity;
- ports, package-manager roots, worktrees, and mutation leases;
- storage/index/artifact work;
- thermal, battery, metered-network, and pressure degradation;
- Project and named-Plan fairness; and
- interactive reserve.

Permit outcomes should distinguish at least:

```text
admitted
queued
admitted_degraded
blocked_permission
blocked_resource
cancelled
```

## 2.4 Distributed enforcement is not a second governor

Under the server-first architecture:

- the Project Home Server coordinates global/Server/Project/Plan fairness and placement;
- each Execution Host authoritatively enforces its actual local CPU/RAM/process/browser/recorder/port/package-manager capacity;
- host-local enforcement uses the same policy schema, lease model, status grammar, and receipt contract;
- a host may reject or degrade a stale proposal; and
- late work is fenced by lease generation/owner epoch.

## 2.5 Prevent pool multiplication

Puppet Master must inventory and govern known pools created by Tokio, Rayon, Tantivy, CEF, renderers, compression/image libraries, LSPs, compilers, test runners, and provider helpers. A 24-thread workstation must not accidentally create hundreds of competing runnable workers because every dependency selected “all cores.”

A shared pool/thread-budget registry or equivalent accounting is required.

## 2.6 Parallelize independent owners; serialize one owner

Parallelism is desirable across independent Projects, named Plans, source locations, files, indexes, provider requests, browser pages, and tests. Writes within one authoritative owner must remain ordered and fenced, including:

- one seglog tail/append authority;
- one worktree writer lease;
- one browser page mutation lease;
- one package-manager root mutation;
- one concrete Goal execution owner epoch; and
- one activation-generation switch.

## 2.7 Adaptive many-core behavior

- reserve interactive capacity first;
- weight physical cores more heavily than SMT siblings for heavy CPU work;
- use many slow cores for independent jobs;
- cap by memory, storage, and process cost as well as logical CPU count;
- learn throughput/contention by work family;
- shrink or expand permits under pressure; and
- never size CEF/LSP/test/provider process counts from hardware-thread count alone.

Required specialists may run in waves. Resource scarcity must never silently delete required review/test passes.

---

# 3. Older CPUs and architecture-specific execution

## 3.1 Older desktop CPUs are launch targets

Intel Ivy Bridge, Haswell-era systems, and Xeon E5-class many-core workstations running the full Windows or Linux desktop application are intended use cases, not merely future headless-server targets.

A low-resource/legacy profile changes automatic policy rather than removing product capability:

- smaller byte-bounded caches;
- fewer simultaneous external helpers;
- no speculative CEF/browser prewarm;
- yielding incremental index/repository work;
- lower decorative motion cadence;
- bounded recording and visual-test concurrency;
- earlier idle helper/index eviction; and
- required agents/tests scheduled in waves.

## 3.2 Portable x86-64 and runtime dispatch

The ordinary compatibility build must not globally require AVX2 or `target-cpu=native`.

Candidate tiers:

```text
portable x86-64 baseline
→ SSE4.2
→ AVX
→ AVX2/BMI2/FMA
→ optional AVX-512
```

Ivy Bridge can use appropriate SSE/AVX paths while remaining fully functional without AVX2. Feature selection occurs once and installs safe function pointers or equivalent dispatch. Unsupported `target_feature` functions must never be called.

## 3.3 Modern Intel and AMD

Dispatch by capability and measured behavior, not by simplistic vendor branches. Intel hybrid systems and AMD generations should be handled through topology/feature/pressure data. Hard affinity is exceptional and must be justified by profiling.

## 3.4 ARM64

Use portable AArch64 plus NEON and, where available and proven, dot-product/SVE/SVE2 or platform-optimized library paths. Preserve portable semantics and do not make a newer ARM extension a launch requirement.

---

# 4. macOS and Apple Silicon

## 4.1 Native arm64 and QoS

First-party helpers should be native arm64. Use macOS QoS/work classification rather than hard-pinning presumed P/E core IDs:

```text
interactive controls     → user-interactive/user-initiated
foreground Project work  → user-initiated
index/download/validation→ utility
cleanup/checks/backups    → background
```

The Resource Governor still controls admission and reserve; macOS chooses topology-aware placement.

## 4.2 Thermal, Low Power, and unified memory

React to thermal state and Low Power Mode by reducing speculative work, background fan-out, recording quality, index merge frequency, and decorative animation while preserving:

- active UI/control;
- durable writes;
- active provider stream;
- pause/stop/approval;
- recovery and rollback.

One unified memory budget must account for Rust state, CEF surfaces/helpers, decoded media, renderer textures, capture rings, simulators, local tools, and readback/encoding buffers.

## 4.3 macOS filesystem and capture paths

- FSEvents for large repository trees; avoid one expensive watcher per file.
- APFS clones opportunistically for same-volume snapshots/disposable test workspaces, with normal-copy fallback.
- CEF/page-native capture for browser evidence.
- ScreenCaptureKit for native PM/external app/simulator/emulator/window capture where appropriate.
- dirty-region-aware comparison/encoding may optimize capture, with periodic full keyframes and honest dropped/degraded evidence.
- Accelerate/vDSP/BNNS may back proven image/vector kernels.

## 4.4 macOS 27-only capabilities

macOS 27 container-machine and Foundation Models integrations remain optional, feature-detected adapters rather than launch assumptions. They may later provide:

- isolated persistent Linux execution environments; and
- a macOS-native provider adapter/profiling path.

They must satisfy FileSafe, receipts, networking, lifecycle, and cross-platform provider contracts before adoption.

---

# 5. Windows Intel/AMD

- Use completion-based asynchronous I/O for sockets, process pipes, PTYs, and high-concurrency file operations; do not create a thread per handle.
- Use `ReadDirectoryChangesW` for normal watching; optionally use NTFS USN data for overflow/recovery/long-disconnect acceleration with a normal fallback.
- Use high QoS for latency-critical controls and EcoQoS/efficiency policy for maintenance.
- Instrument startup, input-to-paint, provider receive-to-paint, storage, Git, process launch, browser lifecycle, queues, and Goal phases with ETW/WPR/WPA-compatible events.
- Measure the total process tree.
- Support large processor-group systems and test third-party pool assumptions without indiscriminate affinity.
- Native and standalone Windows execution hosts may use an optional WSL execution backend. WSL support is selectable, not required for Windows operation.

---

# 6. Linux Intel/AMD

- epoll-backed asynchronous I/O;
- inotify for local changes with bounded reconciliation after overflow/reconnect;
- PSI-based CPU/memory/I/O pressure response;
- cgroup-aware limits/weights when available;
- deliberate minimum libc/runtime compatibility;
- optional `io_uring`, NUMA, or huge-page specialization only after end-to-end evidence;
- full desktop support on older Xeon/Ivy Bridge-class systems; and
- future headless/standalone packaging may omit GUI assets/renderers, but must not distort the desktop-first performance model.

Remote/NFS/SMB repositories require local metadata/index caches and bounded reconciliation rather than pretending local watcher guarantees apply.

---

# 7. Startup and perceived responsiveness

## 7.1 Progressive startup

```text
native launcher/window shell
→ compact cached projection
→ live Server/runtime/storage reconciliation
→ selected visible-surface hydration
→ deferred maintenance and inactive-Project refresh
```

Normal startup must not wait for:

- every Project Vault;
- every provider or CLI;
- CEF startup;
- all search indexes;
- complete chat/Goal histories;
- backup validation;
- every configured integration/version check; or
- every remote host.

The shell, recent Project list, selected thread/Plan summary, and controls should become useful first; individual surfaces reconcile afterward.

## 7.2 Same-frame acknowledgment

A user action should visibly acknowledge in the same frame where feasible. Pause/stop should enter a truthful pending state immediately rather than appearing ignored. Submitted messages, New Plan creation, Server connect, installation requests, and browser/test starts need an immediate durable or optimistic shell with rollback on failure.

## 7.3 Slint/UI efficiency

- virtualize long chat/thread/Goal/Usage/log/receipt/file lists;
- preserve stable model and row IDs;
- issue narrow deltas rather than replacing whole models;
- frame-batch provider stream projection, generally once per display update rather than once per token;
- use latest-request-wins generation/cancellation for search, previews, syntax, context estimates, and filters;
- during splitter drag/resize/scroll, update immediate geometry first and defer expensive persistence/chart/reflow work;
- hidden/collapsed/off-screen surfaces stop expensive hydration and decorative animation;
- undocked views share backend subscriptions rather than duplicating them; and
- inactive side panels must not remain fully measured and laid out.

## 7.4 Repository and Git responsiveness

- coalesce filesystem bursts before repository refresh;
- compute one repository status snapshot and share it across surfaces;
- batch Git plumbing/object reads;
- do not launch one Git process per row/widget;
- use file-watcher invalidation and stable content identity;
- enable/test Git FSMonitor and untracked-cache support where repository/filesystem compatibility permits;
- maintain deterministic fallback/rescan behavior; and
- remote shares use bounded reconciliation, not constant full scans.

---

# 8. Memory footprint

## 8.1 Hot/warm/cold state

**Hot:** visible messages, current editor buffers, selected Plan/Goal state, active terminal tail, selected images, active interaction state.

**Warm:** IDs, offsets, compact summaries, headings, thumbnails, low-cost projections, lightweight indexes.

**Cold:** full histories, old tool output, videos, screenshots, inactive indexes, old diffs, archived provider/browser/test artifacts.

Inactive Projects, Plans, threads, and Vaults remain compact shells. They do not keep full conversations, graphs, editors, indexes, or media decoded.

## 8.2 Every potentially unbounded structure has a byte contract

This includes:

- async channels;
- provider fragments/events;
- terminal scrollback;
- decoded images and GPU textures;
- screenshots/video rings;
- diff/file/syntax caches;
- search results and index readers;
- notifications;
- browser artifacts;
- retry queues;
- undo history;
- logs/receipts;
- connection pools; and
- process/helper pools.

Item counts alone are insufficient.

## 8.3 Avoid duplicate representations

Do not indefinitely retain the same payload as raw provider JSON, normalized event, UI object, serialized storage object, and log string.

- parse from borrowed/pooled buffers;
- materialize only fields that outlive the buffer;
- discard raw payloads unless diagnostics require them;
- pass blob/file references rather than base64 copies;
- keep large media/artifacts in content-addressed files;
- use compact enums/IDs or bounded interning for repeated identities; and
- use job-scoped allocation arenas where useful for parse/diff/index batches.

## 8.4 Pressure response order

1. cancel obsolete speculative work;
2. pause maintenance;
3. stop prefetch/prewarm;
4. shrink decoded media, diff, terminal, and index caches;
5. close idle browser contexts/helpers/index readers;
6. reduce background concurrency;
7. pause low-priority agent waves at safe points;
8. preserve UI/control, active streams, durable commits, rollback, and pause/stop.

---

# 9. Installation and distribution size

CEF is intentionally bundled because the built-in browser is central. Installation accounting should separate:

```text
Puppet Master core
CEF runtime
on-demand managed project capabilities
provider/source-control tools installed from official owners
project toolchains
symbols/diagnostics
combined installed footprint
```

Requirements:

- compile only required Slint backends/renderers per package;
- do not bundle provider CLIs;
- publish debug symbols separately;
- avoid duplicate tool versions through a content-addressed shared component store;
- track download and installed size in CI;
- use LTO/PGO/size-oriented profiles where scenario measurements justify them;
- do not ship test fixtures, source maps, or development assets in production unless explicitly needed;
- separate platform downloads where that materially reduces size; and
- future headless/standalone packages may omit GUI-only assets, while the full desktop application automatically acquires project capabilities when needed rather than exposing manual “compatibility packs.”

---

# 10. Storage, indexing, and the SQLite prohibition

## 10.1 Hard prohibition

SQLite is completely banned from Puppet Master. It may not return as a cache, session database, browser-state store, sync bridge, local fallback, migration staging store, or “temporary” subsystem shortcut.

## 10.2 Current selected storage direction

- **seglog** — canonical append-only event authority;
- **redb** — durable state, checkpoints, projections, rollups, and compact catalog/Vault state;
- **Tantivy** — full-text/search indexes;
- **content-addressed files/blobs** — large media, recordings, attachments, generated archives, and other bulky artifacts.

If an owner thread later changes this stack, the dedicated Goal must reconcile it explicitly; no adjacent thread may silently substitute another store.

## 10.3 Performance rules

- bounded/grouped seglog append with durable-tail correctness;
- short redb write transactions and batched projection revisions;
- never hold a storage transaction across UI/network/provider awaits;
- lazy per-Project/Vault index opening;
- batch Tantivy commit/merge work under maintenance permits;
- skip unchanged content by stable identity/hash;
- separate rebuildable projections/indexes from canonical state;
- projector lag, append latency, index state, and recovery state are observable; and
- Project Move/backup should distinguish canonical state from caches that are cheaper to rebuild.

---

# 11. Truthful loading indicators and `ObservableWork`

The user explicitly wants loading indicators rather than unexplained silence. The existing loading-icon concepts should be retained and connected to one runtime contract.

A shared operation projection should carry fields equivalent to:

```text
operation_id
owner_domain
scope/object refs
title
human phase
state
progress_kind
completed/total when trustworthy
wait/queue reason
last activity/heartbeat
can_cancel
can_background
can_retry
blocking_scope
progress source: measured | provider_reported | derived | unknown
result/receipt refs
```

Generic states should distinguish:

```text
accepted
queued
starting
running
synchronizing
waiting_provider
waiting_host
waiting_network
waiting_resource
waiting_permission
waiting_for_sign_in
waiting_for_idle
waiting_user
retrying
backgrounded
degraded
stalled
committing
verifying
rolling_back
completed
failed
cancelled
recovery_required
```

Display rules:

- precise verbs/phases, not only “Loading…”;
- queue/wait reason visible;
- determinate progress only with a real denominator;
- keep cached content visible while refreshing;
- no loader flash for genuinely instant work;
- cancel/background/retry only when semantically valid;
- reduced-motion/static representation;
- hidden rows stop animation clocks; and
- every operation reaches a truthful terminal/degraded/cancelable state.

---

# 12. Automatic capability provisioning and shared tool lifecycle

## 12.1 User experience

Project capabilities should become available automatically when required:

- Go project → `gopls`/relevant Go tooling;
- image/visual task → media/visual-validation capability;
- debug task → DAP tooling;
- test task → testing adapter/framework;
- simulator/emulator/device task → appropriate adapter/tool;
- language task → LSP/formatter as policy permits.

Internal modularity must not force users to manually pick “packs.”

## 12.2 Provisioning flow

```text
need detected
→ global/Project Auto/On/Off policy
→ compatible component/host resolution
→ provenance/size/license/cost/permission/credential/elevation disclosure
→ authorization or previously granted scope
→ download
→ verify
→ stage/install
→ health check
→ activate generation
→ receipt and rollback/recovery
```

Identical requests coalesce. Identical versions are shared where ownership/privacy permit rather than installed once per Project.

## 12.3 Shared lifecycle owner boundary

A shared runtime lifecycle owns the generic install/update/repair/rollback transaction and durable operation state. It is consumed by provider, source-control, container, LSP, formatter, testing, media, plugin/tool, and other adapters.

- domain adapter owns trusted recipe, minimum version, compatibility, and post-install validation;
- BinaryLocator owns discovery/identity evidence and benign validation only;
- Settings owns user intent/policy/presentation;
- Project Sync owns host/environment routing and PM app/content updates;
- RuntimeResourceGovernor owns permits/locks/pressure response.

Unknown installation ownership remains manual-only. Never guess a package manager from path shape.

## 12.4 CEF and provider CLI exceptions

- CEF/Chromium is prepackaged and not an install choice.
- Provider CLIs are not bundled or silently auto-installed. Installation is deliberately triggered from Provider Settings/onboarding using official sources.
- Authentication is a separate explicit operation.
- Discovery may detect existing profiles but never authorizes silent copying/export/persistence of raw credentials.

## 12.5 Source-control tools

Source-control tools receive contextual Install/Update/Repair and automatic-update capability through the shared lifecycle. Hosted provider names must not be presented as fake installable binaries. Current GitHub hosted actions remain API-owned unless the SCM owner explicitly changes that canon.

---

# 13. Provider onboarding and Usage separation

- cached provider/model catalog first;
- no probe of every unconfigured provider during normal startup;
- bounded, coalesced keychain/profile/CLI discovery;
- deduplicate discovery by actual installation/profile/host rather than account row;
- preserve last-known state while refreshing;
- exact allowlisted official sign-in/API-key pages open on the active client when the owning runtime host is remote;
- model/capability refresh is asynchronous and may use stale-while-revalidate where safe;
- provider generation readiness does not wait for optional Usage telemetry;
- provider catalog/reference price, included-plan usage, estimated API/plan cost, and actual settlement remain separate concepts;
- cookie-based/fragile Usage telemetry is optional and cannot gate setup; and
- provider setup, authentication, model refresh, usage retrieval, and billing/settlement have distinct operation states and receipts.

---

# 14. Multi-agent browser, testing, and recording

## 14.1 Required capability

Multiple agents can operate the built-in browser concurrently through independent pages/contexts or separate instances. They also need visible/watchable and headless/background operation, screenshots, console/network evidence, and video/screen recording.

Automation continues on its owning host when the user changes PM surfaces, collapses a panel, or disconnects a viewer, subject to explicit pause/cancel/resource policy.

## 14.2 Default isolation direction

```text
shared compatible CEF process
→ isolated context/profile per task or auth boundary
→ dedicated page/tab per task
→ one exclusive mutation lease per page
→ read-only observers allowed
```

Use separate browser processes when proxy, device, locale, extension, authentication, crash-containment, reproducibility, or recording requirements are incompatible.

## 14.3 Distinct session classes

At minimum distinguish:

- permanent PM web-client tabs;
- ordinary user browsing;
- Editor `workspace_preview` (`localhost:5173` in the demo);
- hidden/explicit `automation_session` tabs;
- agent browser test contexts/pages; and
- recording/capture sessions.

Agents do not acquire the user’s PM web-client tab or ordinary workspace preview without explicit controller/mutation handoff.

## 14.4 Fencing and lineage

Actions carry stable Server/host/Project/Plan/Goal/agent/operation/browser-session/page identity, lease generation, expected navigation/document generation, and sequence. Stale actions are rejected.

Browser, emulator, simulator, device, external-app, console, network, screenshot, video, and evidence artifacts retain complete lineage.

## 14.5 Capture and resource behavior

- page-native capture for browser evidence where appropriate;
- OS/window capture for native apps/simulators/emulators;
- multiple independent recorders;
- byte-bounded capture/decode/texture/upload queues;
- adaptive quality across LAN/private/public routes;
- controls outrank video/bulk artifacts; and
- no public exposure of internal CDP/WebDriver/VNC/RDP/terminal/provider/container RPC ports.

---

# 15. Renderer and Safe UI boundary

Current Plans apparently encode Skia as default with FemtoVG-wgpu and software fallbacks, while the user remembers Skia as a fallback. This remains unresolved.

No adjacent thread should silently choose renderer order.

A Slint software renderer is not required for headless CEF/browser, emulator, simulator, or external-app testing. It is useful for:

- unsupported/broken GPU drivers;
- VM/RDP cases;
- safe-mode recovery;
- diagnostics; and
- allowing the user to select/repair a normal renderer.

Preferred recovery direction:

- tiny native launcher/probe independent of the primary rendering path;
- runtime compatibility/init test and failure reason;
- persisted last-known-good renderer;
- one or more downloadable renderer/Safe UI components where packaging requires it;
- OS-native error path when the main UI cannot initialize; and
- diagnostics export.

Renderer bakeoff must use real PM scenes, all themes, blur/glow/shadow, chat, Usage graphs, resizing, multiple windows, virtualized lists, Apple Silicon, modern Intel/AMD, old Intel/AMD, Wayland/X11, and VM/RDP. Measure fidelity, package size, startup, frame latency, idle CPU/wakeups, memory, and initialization failures.

---

# 16. Server-first Project architecture

## 16.1 Current superseding model

Retire earlier local-first writable Project-vault replication and ordinary multi-master client replicas.

Current direction:

```text
one Project Home Server per Project
+ one physically isolated Project Vault per Project
+ small Server catalog
+ permanent native and web clients consuming Server APIs/projections
+ optional Execution Hosts
+ distinct Source Locations
+ multiple verified endpoints for one stable server_id
```

Endpoints may include loopback, LAN, private Tailscale/MagicDNS, Tailscale Funnel, reverse proxy/custom origin, and manual addresses. They are not separate Server identities.

## 16.2 Server/Execution Host capabilities

Native desktop and standalone Server forms should be capable execution hosts wherever the platform permits. The user chooses/manages Home Server, Execution Host, and clients through the Settings/server surfaces. The default Execution Host for a Project is its Home Server when that Server is compatible and available; the user may select one or more different Execution Hosts without changing the Project Home Server.

Platform-specific execution backends remain optional capabilities rather than mandatory host prerequisites:

- Windows native and standalone forms may use an optional WSL backend;
- Windows can perform Linux-oriented work through WSL where selected;
- Linux hosts can handle Windows-targeted source/build work where toolchains support it, without claiming native Windows UI/device capabilities;
- macOS 27 container machines may later provide a Linux execution backend on supported Apple Silicon systems; and
- impossible native-platform operations remain explicit capability gaps rather than hidden emulation claims.

## 16.3 Physical Project Vault performance

- lazy Vault opening/admission;
- compact catalog summaries before Vault hydration;
- bounded simultaneously open Vaults;
- byte-budgeted caches and idle eviction of rebuildable views/index readers;
- per-Vault append/projector/index queues under shared permits;
- one Vault failure/quarantine does not stop unrelated Projects;
- aggregate Projects/Usage/search views use catalog/materialized summaries instead of fully opening all Vaults;
- no thread/process per Vault by default;
- content-addressed sharing only where privacy and authority permit; and
- backup/move consistency points distinguish canonical state from rebuildable caches.

Preserve seglog/redb/Tantivy/content-addressed storage unless explicitly superseded by the storage owner.

## 16.4 Connections and public ingress

- one connection supervisor per client↔Server relation;
- cached endpoint health and hysteresis to avoid route flapping;
- private/healthy route preference under policy;
- never enable a public route because a private route failed;
- durable event sequence/watermark resume after reconnect;
- cached shell/thread/Plan projection remains visible while reconnecting;
- commands/callbacks/subscriptions/receipts deduplicate across reconnect;
- transport, Server, Vault, Source Location, Execution Host, provider, and thread-hydration health remain separate;
- Funnel is MVP, public, off by default, explicit, and not an authentication boundary;
- unauthenticated work is tightly bounded; and
- public route metrics are diagnostics, not model Usage.

## 16.5 Goal ownership and Resume Here

One concrete `GoalRun` lineage has one accepted execution owner/epoch at a time. Many unrelated Goals can run concurrently.

Resume/ownership transfer requires:

- explicit Project/Plan/Goal/checkpoint target;
- durable pending/accepted/rejected state;
- owner epoch/fencing token;
- safe-point checkpoint;
- prior-owner late-write rejection;
- no claim that live PTYs, sockets, browser process memory, or simulator state moved magically; and
- destination recreation/re-resolution of compatible local tools, credentials, ports, and runtime resources.

UI focus, Server connection, and execution ownership are separate concepts.

## 16.6 Project Move

Project Move is a resumable operation with preflight, checkpoint/quiesce, staging, transfer/recreation, destination verification, authority switch, reconnect, and rollback-retention phases. Unrelated Projects continue. Do not fabricate a percentage when only phase/bytes/units are known.

## 16.7 App and PM content updates

Project Sync/Server topology owns PM application/server/web-asset/protocol and PM content/catalog updates. These remain separate from external provider/source-control/LSP/container tool updates.

Updates are host-scoped, signed/provenance-checked, staged, version-compatible, restart-aware, rollback/recovery-capable, and do not update every host simultaneously by default.

---

# 17. Durable inter-thread operations and prompt boundaries

Assistant-agent operations such as:

```text
thread.spawn
thread.request
thread.await
thread.branch
```

are durable logical operations. They require stable IDs, per-thread ordering, cross-thread concurrency, cancellation/currentness rules, receipts, resource permits, and restart recovery. `thread.await` must not park one dedicated OS thread.

Ordinary model prompts receive compact task-relevant projections only. Do not inject:

- pool sizes and process tables;
- full Settings registry;
- raw installation evidence/package logs;
- all MCP/tool schemas;
- full Server endpoint/sync logs;
- all storage policy;
- every port/worktree/browser session; or
- all active Plan/Goal internals.

Rare instructions and detailed state are fetched/injected only when the relevant phase/action triggers them.

---

# 18. PMConcept7 first-open factory state

These are factory/demo defaults and missing/corrupt-layout fallbacks. They do not overwrite a user’s saved customized state.

- default theme: **Basic Dark**;
- Assistant Chat: open;
- initially visible editors: Editor Panel 1 only;
- Editor Panels 2–4 remain available;
- all seven default file tabs live in Editor Panel 1:
  - `src/main.rs`
  - `src/routes/recipes.rs`
  - `web/src/routes/+page.svelte`
  - `Cargo.toml`
  - `src/models/recipe.rs`
  - `docker-compose.yml`
  - `Dockerfile`
- visible browser tab `localhost:5173` with session class `workspace_preview` moves into Editor Panel 1;
- hidden `[auto] test-runner` with session class `automation_session` and its browser/session behavior move with it;
- opening Panels 2–4 later creates/uses empty/new split targets rather than duplicating migrated tabs;
- browser tab/content mounting, tab switching, buffer ownership, demo actions, active state, and routing become editor-target-generic rather than Panel-2-specific;
- `cmd.browser.open_workspace_preview` remains pane-independent; and
- update authored base/transform/build sources, persisted factory-state version/migration, fallbacks, tests, and generated `PMConcept7.html` together—never hand-edit only the generated artifact.

---

# 19. Multiple simultaneous PRD/Planning/Orchestration lifecycles

## 19.1 User requirement

A user can create, name, switch, pause, resume, and continue multiple end-to-end planning/build efforts without disrupting an existing effort:

- multiple efforts in one Project;
- efforts across different Projects;
- different lifecycle phases at once; and
- background execution on other hosts where policy permits.

## 19.2 Terminology pending final owner adjudication

```text
user-facing collection/selector: Plans
creation action: New Plan
user-facing item: Plan
internal aggregate candidate: PlanWorkstream
stable ID candidate: plan_workstream_id
```

The final canonical name remains open. Normal UI need not expose “workstream.”

## 19.3 Aggregate boundary and hierarchy

The aggregate owns stable identity, display name, Project association, cross-phase lineage, current/historical references, summary/attention projection, lifecycle navigation, and resource-policy references. It does not duplicate PRD Builder, Planning Wizard, Plan Compile, Goal Runtime, Git, browser, test, or Project Sync state machines.

```text
Project
└── named Plan aggregate
    ├── PRD workspace/ledger/draft/Approved PRD Pack versions
    ├── PlanningRun/topic threads/integration/audit/repair
    ├── Approved Plan Pack versions
    ├── PlanCompileRun history
    ├── GoalRun/WorkGraph/WorkNodes
    └── evidence/testing/receipts/artifacts/Usage/history
```

“One primary PRD” means one primary PRD per named Plan, not one across Puppet Master.

## 19.4 Creation and switching

Creating a New Plan durably creates the lightweight aggregate/thread/ledger/entry-flow shell immediately, even if provider or machine work must queue. Entry routes can include PRD Builder, existing Approved PRD, imported requirements, Assistant Chat continuation, or direct Planning Wizard as allowed.

Switching restores that Plan’s topic selection, tree expansion, panel/preview state, scroll position, and open evidence/source context from a compact projection. Other Plans continue under resource policy.

## 19.5 Planning Wizard and PRD Builder

Planning Wizard gains a Plan selector and New Plan action above its existing topic hierarchy. Each Plan gets its own PRD workspace, ledger, questions/conflicts, Approved PRD Pack versions, PlanningRun, topic agents, audits, and compile lineage.

The selector may group by current/other Project and show phase, progress, active/queued agents, attention, priority, and last activity without hydrating every thread.

## 19.6 Orchestrator

Preserve the seven tabs:

```text
Progress
Plan Compile
Seams
Node Graph
Evidence
History
Ledger
```

Add scope in the header rather than automatically adding an eighth tab:

```text
All Active
Current Project
Selected Plan
```

All Active shows compact cards. Selected Plan scopes the existing tabs to the chosen lineage/current or historical run.

`Approve And Build` remains exact, immediately routes to Orchestrator → Plan Compile, presents a pending launch shell while durable identity reconciles, and creates/rebinds exactly one PlanCompileRun for the selected approved-pack/idempotency lineage—not one globally.

Background transitions never steal focus; they expose attention/Open Build/status actions.

## 19.7 Resource fairness

Resource hierarchy:

```text
machine/Server/host
→ resource family
→ Project
→ named Plan
→ operation/agent
```

Default behavior combines weighted fairness, Project-first then Plan fairness, aging, temporary interactive focus boost, anti-starvation, completion-aware admission, and provider/account/model/reset/cost constraints. Settings may define defaults; active Plan/Orchestrator surfaces own per-Plan pause/priority.

## 19.8 Isolation

Concurrent implementation requires isolated or fenced:

- branches/worktrees and writers;
- build/test environments and ports;
- Compose/container/project namespaces;
- browser contexts/pages/mutation leases;
- recordings/evidence;
- simulators/emulators/devices;
- logs/artifacts/receipts; and
- installation/version generations where work depends on a pinned tool.

Detect overlap in files, manifests, migrations, ports, containers, test databases, deployment targets, and browser profiles early. Express dependencies/warnings/serialization rather than allowing hidden collision.

Every mutation carries explicit Project, Plan, run, host, object, revision, and fencing identity. “Whatever is focused” is never authority.

---

# 20. Settings completeness and shell canon

## 20.1 Activity Bar

The Activity Bar is the left shell rail. It selects one left side-panel occupant; it is not the panel itself and not Settings navigation. Preserve the closed `cmd.panel.switch` panel-ID vocabulary and retire stale right-hand prose/wiring labels.

Inactive panels must not remain fully hydrated/measured/subscribed. Reorder/More-tray/undock/redock should not trigger full shell work or duplicate backend subscriptions.

## 20.2 Settings opening model

Settings Home loads compact destination summaries, not all managers. Selected managers hydrate lazily, lists virtualize, refresh is domain-local, search does not instantiate every manager, and cached values remain visible during refresh.

## 20.3 Manager coverage retained from the completeness audit

The future Settings work must account for both UI representation and underlying runtime completeness for:

- Providers/Accounts/Models/Installations;
- Notifications & Sounds;
- Appearance/themes/fonts/motion;
- general desktop behavior/tray/quit/restore/startup;
- Settings import/export/reset/migration/rollback;
- Permissions/FileSafe;
- Commands/shortcuts;
- Storage/retention/recovery/legal hold/quarantine;
- Files & Editor policy;
- LSP and Formatters;
- Source Control/worktrees and separate GitHub Actions;
- Docker/Podman/Kubernetes/registries;
- web search/fetch/crawl provider setup;
- Project search index;
- Testing and Run/Debug;
- chat history/session administration;
- runtime artifacts/project outputs;
- workspace cleanup;
- Skills/Plugins/Tools/MCP;
- Media;
- Teacher/contextual help;
- DRY Method visible state;
- Accessibility/input/spellcheck;
- app/content update insertion;
- Server/remote access/backup insertion;
- Product Onboarding insertion; and
- Doctor insertion after owner handoffs are final.

Settings owns policy, setup, human projections, and deep links. It does not duplicate operational panels or runtime engines.

## 20.4 Shared manager grammar

Reusable concepts include compact manager summaries, human integration cards, readiness/freshness blocks, requested/effective/inherited state, setup/repair flows, trust/provenance, permission requirements, health/log drawers, update/rollback, import conflict review, destructive-action preview, and `ObservableWork` progress.

---

# 21. Product Onboarding, Installation, and Server Bootstrap

Three distinct flows:

1. **Installation/Deployment** — native/standalone/container package/image deployment, OS prerequisites, renderer package/recovery choice, services/tray, volumes, Compose/templates, rollback.
2. **Server Claim & Bootstrap** — owner claim/authentication, Server name, minimal catalog/Vault roots, secure bind, trusted-client pairing, backup destination, optional remote-access setup.
3. **Product Onboarding Wizard** — welcome/skip/defer/resume, choose local/existing/later Server, provider/search/Free Models setup, first Project handoff, transition to Plans/New Plan/resume.

Product Onboarding may deep-link out and return, but must not absorb package managers, TrueNAS/Unraid deployment, volume configuration, or renderer installation.

Onboarding uses the same provider/account/connection/search/installation records and command paths as Settings. It has no duplicate database or secret store and no SQLite.

---

# 22. Commands, wiring, data, DRY, Plans, and governance

Before adding new command IDs, audit existing names and handlers, including known drift such as:

```text
cmd.source_control.setup.install_tool
cmd.installation.*
cmd.tool.*
cmd.integration_tool.*

cmd.prd_builder.source.import
cmd.prd_builder.import_sources

cmd.planning_wizard.topic.add
cmd.planning_wizard.add_topic

cmd.plan_compile.retry
cmd.plan_compile.retry_stage

cmd.github.actions.*
cmd.github_actions.*

cmd.onboarding.*
cmd.browser.open_workspace_preview
```

Do not mint provisional Server/Host/Funnel/Plan IDs before owner/catalog/wiring discovery.

Every semantic action requires:

- canonical command ID and owner;
- one handler for equivalent GUI/NL/palette/automation operations;
- typed payload/result/error;
- explicit Project/Plan/run/host/environment/object identity;
- availability and disabled reason;
- expected revision/CAS/idempotency/fencing;
- permission/FileSafe/confirmation;
- event/receipt/storage effect;
- `ObservableWork` link;
- cancellation/rollback/recovery/reconnect behavior;
- route/deep-link and focus/navigation effect;
- keyboard/focus/accessibility behavior;
- production wiring evidence; and
- regression fixture.

DRY owners remain singular: ResourceGovernor, ObservableWork, Server/endpoints, Project Vault/Home Server/Source Location/Execution Host, shared integration lifecycle, BinaryLocator, provider readiness/usage, named-Plan identity, Goal execution ownership, browser sessions/pages/recorders, worktree/port/test/device/container leases, renderer selection/recovery, and Product Onboarding versus installation setup.

The future Goal must discover and update canonical owner docs, PlanUnits, schemas, command catalogs, wiring matrices, disabled-reason registries, event/receipt/telemetry contracts, PMConcept authored/generated sources, tests, validators, indexes, and governance artifacts after canonical docs stabilize.

---

# 23. Benchmark and validation matrix

At minimum test:

- cold/warm launch and cached-to-live reconciliation;
- input-to-visible acknowledgment;
- provider fragment receive-to-paint;
- pause/stop under saturation;
- long chat/Goal/Plan scrolling and hydration;
- many concurrent logical threads/Plans/Goals;
- old 4-core Ivy Bridge and many-core Xeon desktop systems;
- modern Windows Intel and AMD;
- Linux Intel and AMD;
- Apple Silicon with normal, Low Power, and thermal pressure;
- provider/tool discovery without startup storms;
- Settings Home with all manager summaries and one lazy-hydrated manager;
- 825+ Settings search;
- 100 detected installations collapsed to human summaries;
- sound pack/theme/import/index/MCP workloads during active Goal work;
- local/LAN/private Tailscale/Funnel/reverse-proxy routes;
- Server reconnect, Project Move, and Goal Resume Here;
- multiple browser contexts/pages/recorders and user/automation isolation;
- renderer bakeoff on all themes, VM/RDP, Wayland/X11;
- process-tree peak/steady memory;
- idle CPU/wakeups and long soak;
- byte-budget pressure/shedding;
- install/update/rollback and low-disk behavior;
- core/CEF/component installed-size budgets;
- exact no-SQLite scan; and
- command/wiring/DRY/PlanUnit closure.

Provisional latency/budget targets remain calibration gates, not claims that an implementation already meets them.

---

# 24. Explicit supersessions

Retire:

- local-first writable Project replicas/multi-master client Project stores;
- Funnel as post-MVP;
- source-control automatic update as merely hypothetical;
- one global PRD/Planning/Plan Compile/Goal lifecycle;
- one OS thread/process per logical PM activity;
- optional user-managed “compatibility packs” for ordinary project capabilities;
- SQLite in any role;
- pane-specific browser commands;
- right-hand Activity Bar/side-panel canon;
- silent provider CLI bundling/install;
- Product Onboarding as the Installation Wizard; and
- treating PM web-client tabs as ordinary automation pages.

---

# 25. Decisions intentionally still open

- final canonical/user-facing name and ID of the end-to-end named Plan aggregate;
- final renderer order and packaging/Safe UI strategy;
- exact worker/process/cache/queue budgets after calibration;
- exact browser context-versus-process default by task class;
- exact low-level kernels after profiling;
- exact macOS 27 adapter adoption timing;
- archive/delete/fork/duplicate semantics for Plans;
- exact provider fairness/overage formulas;
- final generic integration-lifecycle owner name/command namespace;
- exact public-ingress authentication mechanism;
- implementation-time current external Tailscale/Funnel constraints; and
- exact canonical owner documents/PlanUnits after current owner-thread work lands.
