# Critic source index — B12-P02-treatment

Source IDs S01–S16 retain the investigator's bindings. S17 is new critic evidence for Rayon; no existing ID was reassigned. UTC values in source-map.json are clock observations after completed access batches; the browser does not expose a separate request timestamp for each opened page.

## UI, queues, and process lifecycle

- <a id="s01"></a>[S01 — Slint 1.18.1 invoke_from_event_loop](https://docs.rs/slint/1.18.1/slint/fn.invoke_from_event_loop.html): called from any thread; the queued closure runs on the event-loop owner thread.
- <a id="s02"></a>[S02 — Tokio 1.53.2 spawn_blocking](https://docs.rs/tokio/1.53.2/tokio/task/fn.spawn_blocking.html): large default upper limit; bound CPU concurrency; started blocking work cannot be aborted; shutdown timeout only stops waiting.
- <a id="s03"></a>[S03 — Tokio 1.53.2 bounded mpsc channel](https://docs.rs/tokio/1.53.2/tokio/sync/mpsc/fn.channel.html): bounded FIFO buffer and backpressure. The versioned URL was inaccessible through the browser; the latest route displayed crate version 1.53.2.
- <a id="s04"></a>[S04 — Rust std 1.99.0 sync_channel](https://doc.rust-lang.org/std/sync/mpsc/fn.sync_channel.html): bounded FIFO; sender blocks on full buffer; zero capacity is rendezvous.
- <a id="s05"></a>[S05 — Rust std 1.99.0 Child](https://doc.rust-lang.org/std/process/struct.Child.html): direct-child kill, explicit wait/reap, and no kill/wait on Drop.
- <a id="s06"></a>[S06 — Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): process groups, limits, termination and kill-on-close; breakaway and nested-job support vary by configuration/version.

## Cache and thumbnail precedent

- <a id="s07"></a>[S07 — Freedesktop Thumbnail Managing Standard 0.9.0](https://specifications.freedesktop.org/thumbnail/latest-single/): canonical URI and mtime checks, optional size, same-directory temporary file plus rename, and explicit one-second mtime-collision warning.
- <a id="s08"></a>[S08 — GNOME GnomeDesktopThumbnailFactory](https://gnome.pages.gitlab.gnome.org/gnome-desktop/html/gnome-desktop3/gnome-desktop3-GnomeDesktopThumbnailFactory.html): helper selection/fallback, 128/256-pixel caps, URI/mtime validation, failure cache; lookup is threadsafe but blocking I/O.

## Handler behavior and implementation history

- <a id="s09"></a>[S09 — PDF.js RenderTask draft API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-RenderTask.html): cancel can wait for a rendering pause and rejects completion.
- <a id="s10"></a>[S10 — PDF.js DocumentInitParameters draft API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html): maxImageSize defaults to no limit, stopAtErrors defaults false, and progress percent is NaN when total is undefined.
- <a id="s11"></a>[S11 — PDF.js issue #11595](https://github.com/mozilla/pdf.js/issues/11595): original 2.3.200/2.2.228 report, maintainer's promise-rejection explanation, and later distinct worker-error reports.
- <a id="s12"></a>[S12 — immutable community-fork commit](https://github.com/andriivitiv/pdf.js/commit/af995bb76f38a938612fa728fcdfb2e0bf184223): idempotent handling for repeated terminated-worker failure; fork evidence, not an upstream merge.
- <a id="s13"></a>[S13 — PDF.js issue #21867](https://github.com/mozilla/pdf.js/issues/21867): reporter's 5.7.284/6.3.289 teardown-failure reproduction and unsettled promise; closed as not planned.
- <a id="s14"></a>[S14 — PDF.js issue #21934](https://github.com/mozilla/pdf.js/issues/21934): one-host Windows Node worker_threads report; 5.x and selected 6.x matrix; maintainer says Node worker_threads are unsupported.
- <a id="s15"></a>[S15 — SQLite atomic commit](https://www.sqlite.org/atomiccommit.html): one transaction is all-or-none under stated assumptions; article describes rollback-journal mode.
- <a id="s16"></a>[S16 — SQLite WAL](https://www.sqlite.org/wal.html): readers can overlap a single writer; same-host shared-memory requirement, checkpointing, sidecar lifecycle, and durability settings.
- <a id="s17"></a>[S17 — Rayon ThreadPool 1.12.0](https://docs.rs/rayon/latest/rayon/struct.ThreadPool.html): documented pool construction and work-stealing scheduler; treating it as lacking the app's visible/import lane policy is an inference from the documented API surface.

See source-map.json for exact locators, observed operations, conditions/defaults, applicability, versions and access UTC.
