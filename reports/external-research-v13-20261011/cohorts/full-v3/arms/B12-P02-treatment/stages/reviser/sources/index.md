# Final reviser evidence index

S01–S16 retain the frozen investigator bindings; S17 is an additional Rayon source. Full exact URL, released version/commit where applicable, locator, original UTC access, operation, governing condition/default/exception, and applicability are in ../source-map.json. This index is a compact navigation aid. In this pass, S02, S05, S07, S09, S10, and S16 were reopened at 2026-10-12T01:24:47Z (UTC clock observation immediately after the open batch; individual request timestamps are unavailable).

## Runtime and UI
- [S01 — Slint 1.18.1 invoke_from_event_loop](https://docs.rs/slint/1.18.1/slint/fn.invoke_from_event_loop.html): worker-to-event-loop handoff.
- [S02 — Tokio 1.53.2 spawn_blocking](https://docs.rs/tokio/1.53.2/tokio/task/fn.spawn_blocking.html): configured pool ceiling, CPU semaphore guidance, started closures cannot be aborted.
- [S03 — Tokio 1.53.2 bounded mpsc](https://docs.rs/tokio/1.53.2/tokio/sync/mpsc/fn.channel.html): FIFO backpressure only.
- [S04 — Rust std 1.99.0 sync_channel](https://doc.rust-lang.org/std/sync/mpsc/fn.sync_channel.html): bounded FIFO alternative; sender backpressure.
- [S05 — Rust std 1.99.0 Child](https://doc.rust-lang.org/std/process/struct.Child.html): drop does not kill/wait; direct-child kill and reap are explicit.

## Cache and handler precedents
- [S06 — Windows Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): process groups/limits with breakaway, nesting, and platform conditions.
- [S07 — Freedesktop Thumbnail Managing Standard 0.9.0](https://specifications.freedesktop.org/thumbnail/latest-single/): URI/mtime metadata, collision caveat, temporary write then rename.
- [S08 — GNOME thumbnail factory](https://gnome.pages.gitlab.gnome.org/gnome-desktop/html/gnome-desktop3/gnome-desktop3-GnomeDesktopThumbnailFactory.html): external helper dispatch, fallback, limits, negative cache, blocking lookup.
- [S09 — PDF.js RenderTask draft API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-RenderTask.html): cancel waits for a pause in some render states and rejects completion.
- [S10 — PDF.js DocumentInitParameters draft API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html): resource defaults and unknown progress total.
- [S11 — PDF.js issue #11595](https://github.com/mozilla/pdf.js/issues/11595): loading cancellation/error history, with differing explanations/reports.
- [S12 — PDF.js fork commit af995bb76f38a938612fa728fcdfb2e0bf184223](https://github.com/andriivitiv/pdf.js/commit/af995bb76f38a938612fa728fcdfb2e0bf184223): idempotent terminated-worker handling in a fork, not established upstream.
- [S13 — PDF.js issue #21867](https://github.com/mozilla/pdf.js/issues/21867): reported unsettled render promise on teardown; closed as not planned, not independently reproduced.
- [S14 — PDF.js issue #21934](https://github.com/mozilla/pdf.js/issues/21934): scoped Windows Node worker_threads report; maintainer distinguishes unsupported Node worker_threads from Web Workers.

## Persistence
- [S15 — SQLite atomic commit](https://www.sqlite.org/atomiccommit.html): atomic transaction assumptions.
- [S16 — SQLite WAL](https://www.sqlite.org/wal.html): one writer and same-host shared-memory constraints; local storage required.

## Scheduler alternative
- <a id="s17"></a>[S17 — Rayon ThreadPool 1.12.0](https://docs.rs/rayon/1.12.0/rayon/struct.ThreadPool.html): configured pool and work-stealing description. The lack of this app's visible/import lane policy is an inference.

## Critique integration
C1 adds exact-byte revision binding and fail-closed handling. C2 adds explicit handler trust/isolation. C3 adds S17. C4 narrows the PDF.js issue history. See final.md and source-map.json.
