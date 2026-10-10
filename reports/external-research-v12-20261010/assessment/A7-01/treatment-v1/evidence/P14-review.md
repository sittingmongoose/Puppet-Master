# P14 — Prusa unit/transform issue #15545 and comments

[Governing primary source](https://github.com/prusa3d/PrusaSlicer/issues/15545)

**Version:** Reported 2.9.6 Windows x64 portable; closed 2026-09-29 for inactivity

**Locator:** Description; control matrix; expected/actual bounds; tested build; comment 5890111762

**Independent assessment:** The error boundary is non-mm translation terms, not rotation or scale alone. Expected inch-case X bounds are 25.4–50.8 mm versus reported -23.4–2.0 mm. The closure comment establishes housekeeping, irrespective of the API completed status. No candidate or reviewer product reproduction occurred.

**Evidence captures:**

- [P14-unit-issue.json](P14-unit-issue.json) — SHA-256 `3a68f9544d7259ab2ece6316878b7ac69f04a145e564fea855eff54eca7b1980`
- [P14-unit-comments.json](P14-unit-comments.json) — SHA-256 `ebacfb70cf52b8cd6894d1851d2276ed22426e1e409b2e6ea8712396ffc7757e`
- [P14-unit-issue.txt](P14-unit-issue.txt) — SHA-256 `c670d2172feb4469606d75365e03a9a098fb0e371ab64fa2013cc45ff71dcdfb`
- [P14-unit-comments.txt](P14-unit-comments.txt) — SHA-256 `2d645a7f9a8c5cbd0ecd5e6ec5385668ff16088f26c4bc0ceff6371e970ccfc2`
