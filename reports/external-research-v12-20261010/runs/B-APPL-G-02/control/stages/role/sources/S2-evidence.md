# S2 bounded source evidence

- **URL:** https://github.com/systemd/systemd/blob/v257/man/systemd.time.xml
- **Version/scope:** upstream tag v257, applicable target systemd 257.
- **Retrieved:** 2026-10-10 05:13:23 UTC by web open/find of the pinned source page.
- **Locators checked:** `Calendar Events`; special calendar expressions; `systemd-analyze calendar` validation/normalization.
- **Evidence, attributed paraphrase:** The manual normalizes `daily` to an every-day midnight event, with timezone interpretation relevant to the expression. It describes calendar syntax and says `systemd-analyze calendar` can validate/normalize an expression and calculate its next occurrence. These are syntax and scheduled-time facts, not a service completion guarantee.
- **Retrieval conditions/exceptions:** Direct read of the pinned upstream tag; no specific expression, timezone, host clock, or local systemd-analyze execution was supplied. See the source URL for full context.
