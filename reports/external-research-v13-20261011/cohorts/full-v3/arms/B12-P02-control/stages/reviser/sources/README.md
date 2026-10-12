# Source index — B12-P02-control reviser

The complete source identities, versions/commits, locators, UTC access records, observed operations, governing conditions, and applicability are in [../source-map.json](../source-map.json). Inherited source IDs preserve their original targets; additive reviser checks are marked there. Code was inspected as text only.

## Runtime and scheduler

- <a id="src-01"></a> **SRC-01 — Tokio spawn_blocking 1.53.2.** [Function docs](https://docs.rs/tokio/1.53.2/tokio/task/fn.spawn_blocking.html): blocking-pool scale, abort and shutdown caveats.
- <a id="src-02"></a> **SRC-02 — Tokio CancellationToken 0.7.20.** [API docs](https://docs.rs/tokio-util/latest/tokio_util/sync/struct.CancellationToken.html): cooperative token propagation.
- <a id="src-03"></a> **SRC-03 — Tokio process Command.** [API docs](https://docs.rs/tokio/latest/tokio/process/struct.Command.html): kill-on-drop defaults and Unix process groups.
- <a id="src-04"></a> **SRC-04 — Rust Child.** [API docs](https://doc.rust-lang.org/std/process/struct.Child.html): direct-child kill and explicit wait/reap.
- <a id="src-05"></a> **SRC-05 — Tokio Semaphore 1.53.2.** [API docs](https://docs.rs/tokio/latest/tokio/sync/struct.Semaphore.html): FIFO permit ordering and head-of-line behavior.
- <a id="src-19"></a> **SRC-19 — Apple OperationQueue.** [API docs](https://developer.apple.com/documentation/Foundation/OperationQueue): ready-work ordering, concurrency, cooperative cancellation.

## Process control and containment

- <a id="src-06"></a> **SRC-06 — Windows Job Objects.** [Win32 docs](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): descendant association, breakaway, limits and termination; nested-job version conditions.
- <a id="src-07"></a> **SRC-07 — Linux Landlock.** [Kernel docs](https://docs.kernel.org/userspace-api/landlock.html): runtime ABI, filesystem/port rights, no_new_privs and opened-descriptor conditions.
- <a id="src-08"></a> **SRC-08 — Windows AppContainer.** [Win32 docs](https://learn.microsoft.com/en-us/windows/win32/secauthz/implementing-an-appcontainer): sandbox profile and selected capabilities.
- <a id="src-09"></a> **SRC-09 — Apple App Sandbox inheritance and XPC.** [Archived entitlement reference](https://developer.apple.com/library/archive/documentation/Miscellaneous/Reference/EntitlementKeyReference/Chapters/EnablingAppSandbox.html): signing, child entitlements and file handoff.
- <a id="crit-src-01"></a> **CRIT-SRC-01 — Apple XPC overview.** [Current overview](https://developer.apple.com/documentation/xpc?language=objc): launchd service lifecycle and service type conditions.
- <a id="rev-src-01"></a> **REV-SRC-01 — XPCSession.cancel(reason:).** [API docs](https://developer.apple.com/documentation/xpc/xpcsession/cancel%28reason%3A%29): session/message cancellation behavior.
- <a id="rev-src-02"></a> **REV-SRC-02 — xpc_connection_cancel(_:)**. [API docs](https://developer.apple.com/documentation/xpc/xpc_connection_cancel%28_%3A%29): asynchronous, non-preemptive connection cancellation.

## Preview, cache and history

- <a id="src-10"></a> **SRC-10 — Apple Quick Look Thumbnailing.** [API docs](https://developer.apple.com/documentation/quicklookthumbnailing/qlthumbnailgenerator): asynchronous representations and request cancellation.
- <a id="src-11"></a> **SRC-11 — Windows Shell thumbnail handlers.** [Win32 docs](https://learn.microsoft.com/en-us/windows/win32/shell/thumbnail-providers): documented out-of-process default, registry opt-out and shell cache.
- <a id="src-12"></a> **SRC-12 — SQLite atomic commit.** [Technical note](https://www.sqlite.org/atomiccommit.html): rollback-journal transaction behavior; WAL needs separate review.
- <a id="src-13"></a> **SRC-13 — Thumbnail Managing Standard 0.9.0.** [Specification](https://specifications.freedesktop.org/thumbnail/latest-single/): XDG cache layout and URI/mtime/size validity limitations; not a generation service.
- <a id="src-14"></a> **SRC-14 — Zotero 7 changelog.** [Pinned documentation commit](https://github.com/zotero/zotero-docs/blob/0218554ffa63c2fd005f3167ccd4a92d64306866/content/7.0_changelog.md): attachment-preview fixes in 7.0.4 and 7.0.12.
- <a id="src-15"></a> **SRC-15 — Zotero v7.0.12 attachmentPreview.js.** [Pinned source](https://github.com/zotero/zotero/blob/6af5a484fd6688aab23150938d69df42dfca10e4/chrome/content/zotero/elements/attachmentPreview.js): latest-task bookkeeping and item checks; reviser confirms timeout can release flags without stopping render.
- <a id="src-16"></a> **SRC-16 — Zotero v7.0.12 PDFWorker manager.** [Pinned source](https://github.com/zotero/zotero/blob/6af5a484fd6688aab23150938d69df42dfca10e4/chrome/content/zotero/xpcom/pdfWorker/manager.js): one Web Worker and priority queue behavior.
- <a id="src-17"></a> **SRC-17 — Zotero document-worker.** [Pinned project at commit 9d11471391fc3f609a0d1e7012b82b9be6ca9c12](https://github.com/zotero/document-worker/tree/9d11471391fc3f609a0d1e7012b82b9be6ca9c12): shared modules across Node, Web Worker and iOS JavaScriptCore.
- <a id="src-18"></a> **SRC-18 — ZoteroThumbFile 1.1.5.** [Release README](https://github.com/gchapron/ZoteroThumbFile/tree/v1.1.5): cache and two-task precedent with self-reported compatibility/test limits.
- <a id="src-20"></a> **SRC-20 — Zotero preview issue #238.** [Issue history](https://github.com/zotero/zotero/issues/238): request/final feature chronology, not implementation semantics.

## Reviser use

C1 accepts the correction to SRC-15's normal-path serialization claim. C3 uses CRIT-SRC-01 and REV-SRC-01/02 to keep XPC cancellation distinct from worker termination. C4 narrows SRC-07's Linux no-network claim to documented ABI/rights/descriptors. C5 rejects SRC-13 as evidence for a thumbnail-generation service.