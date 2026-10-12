# Source index — B12-P02-control investigator

Primary documentation and pinned implementation-history evidence read for the independently brief-derived discovery. Access times are UTC. “Observed operation” and conditions are recorded in `../source-map.json`; links below go to the exact source or pinned revision. The GitHub API metadata checks used to resolve commit/tag identities were read-only. Retrieved source code was inspected as text and was not executed.

## Runtime and queue semantics

- <a id="src-01"></a> **SRC-01 — Tokio spawn_blocking 1.53.2.** [Function docs](https://docs.rs/tokio/1.53.2/tokio/task/fn.spawn_blocking.html), blocking pool, cancellation, and shutdown behavior.
- <a id="src-02"></a> **SRC-02 — Tokio CancellationToken, tokio-util 0.7.20.** [API docs](https://docs.rs/tokio-util/latest/tokio_util/sync/struct.CancellationToken.html), child tokens, propagation, cancel safety.
- <a id="src-03"></a> **SRC-03 — Tokio process Command 1.53.2.** [API docs](https://docs.rs/tokio/latest/tokio/process/struct.Command.html), kill_on_drop, Unix process_group, spawn/drop caveats.
- <a id="src-04"></a> **SRC-04 — Rust std::process::Child.** [Stable API docs](https://doc.rust-lang.org/std/process/struct.Child.html), direct child kill, wait/reap, default drop.
- <a id="src-05"></a> **SRC-05 — Tokio Semaphore 1.53.2.** [API docs](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html), FIFO fairness and acquire_many head-of-line case.
- <a id="src-19"></a> **SRC-19 — Apple Foundation OperationQueue.** [API docs](https://developer.apple.com/documentation/Foundation/OperationQueue), priority/readiness, cancellation, QoS, max concurrency.

## OS render and containment mechanisms

- <a id="src-06"></a> **SRC-06 — Windows Job Objects.** [Win32 docs](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects), process trees, limits, termination, nested-job conditions.
- <a id="src-07"></a> **SRC-07 — Linux Landlock.** [Kernel docs](https://docs.kernel.org/userspace-api/landlock.html), unprivileged path restrictions and ABI-sensitive rights.
- <a id="src-08"></a> **SRC-08 — Windows AppContainer.** [Win32 docs](https://learn.microsoft.com/en-us/windows/win32/secauthz/implementing-an-appcontainer), per-process security capabilities.
- <a id="src-09"></a> **SRC-09 — macOS App Sandbox and XPC.** [Apple entitlement reference](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html), child inheritance and privilege-separation caveats.
- <a id="src-10"></a> **SRC-10 — Apple Quick Look Thumbnailing.** [API docs](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailgenerator), asynchronous representations and cancellation.
- <a id="src-11"></a> **SRC-11 — Windows Shell thumbnail handlers.** [Microsoft docs](https://learn.microsoft.com/en-us/windows/win32/shell/thumbnail-providers), out-of-process default, registry opt-out, cache behavior.

## Cache and recovery

- <a id="src-12"></a> **SRC-12 — SQLite atomic commit.** [SQLite technical note](https://www.sqlite.org/atomiccommit.html), rollback-journal crash/power-loss transaction behavior.
- <a id="src-13"></a> **SRC-13 — freedesktop Thumbnail Managing Standard 0.9.0.** [Specification](https://specifications.freedesktop.org/thumbnail/latest-single/), URI/mtime/size validation, per-user XDG cache and failure records.

## Real implementation history

- <a id="src-14"></a> **SRC-14 — Zotero 7 changelog, pinned docs commit.** [Release history](https://github.com/zotero/zotero-docs/blob/0218554ffa63c2fd005f3167ccd4a92d64306866/content/7.0_changelog.md), attachment preview fixes in 7.0.4 and 7.0.12.
- <a id="src-15"></a> **SRC-15 — Zotero 7.0.12 attachment preview source.** [Pinned source](https://github.com/zotero/zotero/blob/6af5a484fd6688aab23150938d69df42dfca10e4/chrome/content/zotero/elements/attachmentPreview.js), latest-task coalescing and selected-item guard.
- <a id="src-16"></a> **SRC-16 — Zotero 7.0.12 PDFWorker manager.** [Pinned source](https://github.com/zotero/zotero/blob/6af5a484fd6688aab23150938d69df42dfca10e4/chrome/content/zotero/xpcom/pdfWorker/manager.js), single Web Worker, serialized/priority queue, error handling.
- <a id="src-17"></a> **SRC-17 — Zotero document-worker at commit 9d11471391fc3f609a0d1e7012b82b9be6ca9c12.** [Pinned project README](https://github.com/zotero/document-worker/tree/9d11471391fc3f609a0d1e7012b82b9be6ca9c12), shared worker code and desktop/iOS runtimes.
- <a id="src-18"></a> **SRC-18 — ZoteroThumbFile 1.1.5.** [Release README](https://github.com/gchapron/ZoteroThumbFile/tree/v1.1.5), [implementation](https://github.com/gchapron/ZoteroThumbFile/blob/22a07714ae8227aa560921c4b4262eb47eb05bac/bootstrap.js), and [portable tests](https://github.com/gchapron/ZoteroThumbFile/blob/22a07714ae8227aa560921c4b4262eb47eb05bac/tests/plugin.test.cjs). Maintainer-reported limits and tests are not independent measurements.
- <a id="src-20"></a> **SRC-20 — Zotero attachment preview issue #238.** [Issue history](https://github.com/zotero/zotero/issues/238), request opened in 2013 and closed after the preview feature was reported added in Zotero 7.

