# S1 bounded source evidence

- **URL:** https://github.com/systemd/systemd/blob/v257/man/systemd.timer.xml
- **Version/scope:** upstream tag v257, applicable target systemd 257.
- **Retrieved:** 2026-10-10 05:13:23 UTC by web open/find of the pinned source page.
- **Locators checked:** `Description`; monotonic timer directive table (`OnUnitInactiveSec=`); `OnCalendar=`; `AccuracySec=`; `RandomizedDelaySec=`; `Persistent=`; `WakeSystem=`.
- **Evidence, attributed paraphrase:** The manual says an already-active target is left running rather than restarted or duplicated. `Persistent=` records last-trigger state and only applies to calendar timers; at activation it catches up if a calendar event was missed, subject to randomized delay. Monotonic directives use monotonic time; `OnUnitInactiveSec=` is anchored to target-unit deactivation. Accuracy defaults to one minute and places expiry within the configured time plus that window; random delay defaults to zero. Calendar events use realtime and can catch up after sleep, with one service activation for multiple missed events during continuous sleep. These passages describe timer elapse/activation, not cleanup completion.
- **Retrieval conditions/exceptions:** Direct read of the pinned upstream tag; no local host configuration, test run, or execution of downloaded content. See the source URL for full context.
