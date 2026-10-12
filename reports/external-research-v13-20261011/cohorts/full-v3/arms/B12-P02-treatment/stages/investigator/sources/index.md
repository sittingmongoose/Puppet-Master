# Sources index — investigator stage

All source IDs are stable within this stage and map to structured identity/condition records in ../source-map.json. Pages were opened directly during a research batch; access timestamps below are batch-close UTC clock observations (individual HTTP request timestamps are not exposed by the browser tool). Excerpts are paraphrased and bounded.

## Scheduler, runtime, and UI

- <a id="s01"></a>[S01 — Slint 1.18.1 event-loop dispatch](https://docs.rs/slint/1.18.1/slint/fn.invoke_from_event_loop.html): thread-safe enqueue from workers; callback runs on event-loop owner thread.
- <a id="s02"></a>[S02 — Tokio 1.53.2 blocking work](https://docs.rs/tokio/1.53.2/tokio/task/fn.spawn_blocking.html): use an explicit concurrency bound; a started blocking closure cannot be aborted or forcibly stopped by shutdown timeout.
- <a id="s03"></a>[S03 — Tokio 1.53.2 bounded mpsc](https://docs.rs/tokio/1.53.2/tokio/sync/mpsc/fn.channel.html): bounded FIFO backpressure, not priority scheduling.
- <a id="s04"></a>[S04 — Rust std 1.99.0 sync_channel](https://doc.rust-lang.org/std/sync/mpsc/fn.sync_channel.html): fixed-capacity FIFO alternative; sends block when full.
- <a id="s05"></a>[S05 — Rust std 1.99.0 Child](https://doc.rust-lang.org/std/process/struct.Child.html): direct-child kill and reaping are explicit; drop does not kill/wait.
- <a id="s06"></a>[S06 — Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): process-tree controls, limits, kill-on-close; nesting/breakaway and security-limit conditions apply.

## Cache and GNOME precedent

- <a id="s07"></a>[S07 — Freedesktop Thumbnail Managing Standard 0.9.0](https://specifications.freedesktop.org/thumbnail/latest-single/): canonical URI, required global mtime, optional size, atomic temp-file rename; second-resolution mtime collisions warn against using mtime alone.
- <a id="s08"></a>[S08 — GNOME thumbnail factory](https://gnome.pages.gitlab.gnome.org/gnome-desktop/html/gnome-desktop3/gnome-desktop3-GnomeDesktopThumbnailFactory.html): MIME helper registry, fallback, negative caching, URI/mtime validity, normal/large bounds, and a blocking-I/O lookup API.

## Handler behavior and implementation history

- <a id="s09"></a>[S09 — PDF.js RenderTask draft API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib-RenderTask.html): cancel may wait for a rendering pause and rejects the completion promise.
- <a id="s10"></a>[S10 — PDF.js DocumentInitParameters draft API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html): maxImageSize defaults to no limit; stopAtErrors is false; progress can have unknown total.
- <a id="s11"></a>[S11 — PDF.js #11595](https://github.com/mozilla/pdf.js/issues/11595): v2.3.200/2.2.228 cancellation during loading; maintainer distinguished promise rejection from an uncaught exception; later comments and commit references show lingering worker-lifecycle reports.
- <a id="s12"></a>[S12 — Immutable community-fork fix commit](https://github.com/andriivitiv/pdf.js/commit/af995bb76f38a938612fa728fcdfb2e0bf184223): suppresses a duplicate throw in terminated-worker failure handling; this is a fork, not confirmed upstream.
- <a id="s13"></a>[S13 — PDF.js #21867](https://github.com/mozilla/pdf.js/issues/21867): reporter on 5.7.284/6.3.289 documents a render promise that may remain pending if cleanup throws; closed as not planned; not independently reproduced here.
- <a id="s14"></a>[S14 — PDF.js #21934](https://github.com/mozilla/pdf.js/issues/21934): Windows Node worker_threads report has a narrow version/host matrix; maintainers state Node worker_threads are unsupported and cited crash absent in 6.x.

## Cache persistence option

- <a id="s15"></a>[S15 — SQLite atomic commit](https://www.sqlite.org/atomiccommit.html): one transaction can provide all-or-none cache record/payload changes under documented storage/VFS assumptions; article explains rollback mode.
- <a id="s16"></a>[S16 — SQLite WAL](https://www.sqlite.org/wal.html): reader/writer overlap with a single writer; shared-memory and checkpoint constraints make WAL same-host/local-storage only.

See source-map.json for version, exact locator, access UTC, inspected operation, default/exception, and applicability per ID.
