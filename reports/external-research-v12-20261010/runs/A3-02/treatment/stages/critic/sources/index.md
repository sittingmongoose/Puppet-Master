# Critic source index

Source IDs S01, S05, S11, S12, and S13 preserve investigator bindings. C01 and C02 are new critic-only sources; no existing ID is rebound. Direct links below are the bounded evidence index.

- <a id="c01"></a>C01 — [WebKit Features for Safari 27.0](https://webkit.org/blog/18325/webkit-features-for-safari-27-0/), released 2026-09-17. Locator: release heading/date; Media section; Updating to Safari 27. The page identifies Safari 27.0 and availability on macOS 26 and macOS 15. Its Media summary does not list a MediaRecorder change; resolved issues include microphone/session and MediaStreamTrack-related fixes. Applicability: establishes a newer released desktop Safari target, not MIME support.
- <a id="c02"></a>C02 — [New WebKit Features in Safari 14.1](https://webkit.org/blog/11648/new-webkit-features-in-safari-14-1/), 2021-04-29. Locator: MediaRecorder API section. Applicability: historical announcement only.
- <a id="s01"></a>S01 — [W3C MediaStream Recording, 2026-03-16 Working Draft](https://www.w3.org/TR/2026/WD-mediastream-recording-20260316/). Locator: §§2.1–2.3 and 6.1. Checked the current dated report and surrounding constructor/start/stop/timeslice/resource context. Applicability: API behavior, not browser support.
- <a id="s05"></a>S05 — [WebKit Features in Safari 18.4](https://webkit.org/blog/16574/webkit-features-in-safari-18-4/), 2025-03-31. Locator: Media section, especially Ogg platform condition. Applicability: historical released capability; exact MIME/runtime support still needs tests.
- <a id="s11"></a>S11 — [extendable-media-recorder issue #692](https://github.com/chrisguttandin/extendable-media-recorder/issues/692), opened 2025-08-08; current issue history checked. Locator: maintainer response and reporter's 2025 closure; later April 2026 follow-up. Applicability: this library's Web Audio/channel-count path only.
- <a id="s12"></a>S12 — [High Resolution Time, 2026-09-01 Working Draft](https://www.w3.org/TR/2026/WD-hr-time-3-20260901/). Locator: §2.1. Applicability: monotonic clock and timer-throttling distinction.
- <a id="s13"></a>S13 — [HTML Standard, Page Visibility](https://html.spec.whatwg.org/multipage/interaction.html#page-visibility). Locator: §6.2 visibility-state update task. Applicability: visibility is a queued signal, not an instantaneous stop guarantee.

Exact critic fetch timestamps were not exposed by the web tool; critic access_utc is recorded as UNKNOWN rather than inferred. Investigator access timestamps are retained separately in the inherited source map.
