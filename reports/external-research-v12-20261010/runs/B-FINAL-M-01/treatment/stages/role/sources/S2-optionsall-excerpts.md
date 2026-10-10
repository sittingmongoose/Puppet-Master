# S2 excerpts: curl option introduction history

- URL: https://curl.se/docs/optionsall.html
- Retrieved: 2026-10-10T04:20:06Z via HTTPS GET (operation: single curl fetch, HTTP 200, 37181 bytes)
- Scope: maps CLI options to introduction versions for target curl 8.10.1. Introduction proves availability, not that every later semantic change was present; semantics verified against sources/v8101-*.md.

## Cited rows (option: introduced in)

- --retry: 7.12.3
- --retry-all-errors: 7.71.0
- --retry-connrefused: 7.52.0
- --retry-delay: 7.12.3
- --retry-max-time: 7.12.3
- --fail: 4.0
- --fail-early: 7.52.0
- --fail-with-body: 7.76.0
- --max-time: 4.0

All options cited in the deliverable predate curl 8.10.1. Retry-After compliance for --retry is dated by the manual itself to 7.66.0 (see sources/S1-manpage-excerpts.md and sources/v8101-retry.md).
