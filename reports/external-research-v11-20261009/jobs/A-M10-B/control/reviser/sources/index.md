# Sources index — S04 maker-inventory (A-M10-B/control/reviser)

Navigable index for reviser-stage immutable source IDs R01–R07. Bounded
fair-use excerpts only; full pages remain at their URLs. Accessed
2026-10-09 18:48–18:52 UTC. No executables retained. Usage/billing:
unobserved (null in source-map.json). Predecessor IDs S01–S18 (research)
and C01–C05 (critic) live in their own stages' indexes and are
referenced, never rebound, here.

- <a id="R01"></a>**R01 — LibreBooking fix commit 7e80933 (fetched)** —
  https://github.com/librebooking/librebooking/commit/7e80933cbc7d194e23db5aa7b5eed9c29b463815
  (commit-pinned 7e80933). "fix(schedule): correct tall view rendering
  for reservations with hidden blocked periods"; "the exact end cell
  doesn't exist in the DOM and findClosestEnd() picks the nearest
  earlier slot"; "data-start/data-end attributes used the approximate
  cell's data-min value instead of the reservation's actual timestamps,
  which could cause conflict detection to miss overlapping
  reservations"; "Fix by introducing an isEndApproximate flag";
  "using res.StartDate/res.EndDate directly"; "Closes: #920";
  `Web/scripts/schedule.js`. Evidence: web_fetch (371106 bytes, full
  message + diff hunks observed). Upgrades S15 from snippet to fetched.
- <a id="R02"></a>**R02 — LibreBooking issue #1220 (fetched)** —
  https://github.com/librebooking/librebooking/issues/1220
  (issue-record). 'Support for "Skip Conflicting Bookings" in
  Reservation API'; "reservation conflicts on the specified days" error
  "if even a single day within the requested range is marked as
  blackout"; "prevents the creation of an entire series via the API";
  "In the LibreBooking web interface, there is a built-in option: 'Skip
  conflicting bookings'"; timeline: PR #1235 referencing the issue on
  2026-03-26. Evidence: web_fetch (337306 bytes). Closes the critic's
  C05 negative observation; S16 confirmed accurate with #1235
  evolution noted.
- <a id="R03"></a>**R03 — myTurn platform (fetched)** —
  https://myturn.com/ (web-current, mutable). "Lending Library
  Software"; "Library of Things Software"; "Take control of your tools,
  equipment, and other resources at one location, or across multiple
  locations"; "Membership & Subscriptions"; admin dashboards,
  workflows, logistics; "browse inventory online" member flows.
  Evidence: web_fetch (169389 bytes). Upgrades S03's Wikipedia-bound
  lending claims to a primary fetch.
- <a id="R04"></a>**R04 — InvenTree LDAP/SSO docs (searched)** —
  https://docs.inventree.org/en/latest/start/advanced/ (docs-current).
  "You can link your InvenTree server to an LDAP server"; "Add SSO
  login-backends"; "Custom authentication backends can be used ...
  to add LDAP / AD login". Evidence: web_search snippets. Candidate
  common-IdP evidence for Route A; per-pair proof still required.
- <a id="R05"></a>**R05 — Grocy LDAP/reverse-proxy auth (searched)** —
  https://github.com/grocy/grocy-docker/issues/229 (web-current).
  "If you set AUTH_CLASS to Grocy\Middleware\LdapAuthMiddleware, users
  will be authenticated against your directory"; "New config.php
  setting REVERSE_PROXY_AUTH_HEADER". Evidence: web_search snippets.
  Candidate identity evidence where Grocy is the stock side.
- <a id="R06"></a>**R06 — Supabase offline composition pattern
  (searched)** —
  https://github.com/leanderroshan07/takszzzz/blob/HEAD/README.md
  (representative; pattern consensus across ~10 independent codebases).
  "Local SQLite stays the source of truth; a Drift outbox
  (sync_queue) records local changes and pushes them when back
  online"; "local SQLite mirror is the source of truth for every
  screen"; "outbox pattern replays all writes when signal returns";
  "Last-Write-Wins conflict resolution on updated_at and soft deletes".
  Evidence: web_search snippets. Gives the draft's Supabase claim the
  immutable ID M6 required; the composition itself stays this final's
  proposal (§1.4), not prior art.
- <a id="R07"></a>**R07 — PouchDB root fetch (negative/partial)** —
  https://pouchdb.com/ (unobserved by this reviser). Root fetch
  returned 72 bytes / 0 processed chars (empty). No primary text
  observed; S12 snippet-grade claims stand unconfirmed, not refuted.
  Evidence: web_fetch with empty result (honest negative).

## Retention note

Excerpts above are the retained bounded evidence (short factual quotes for
identification). No page HTML is vendored; no binaries, installers, or
credentials were collected. Full text was observed via web_search snippets
and web_fetch processing on 2026-10-09 18:48–18:52 UTC and synthesized in
final.md. Mutable pages may drift; pinned commits/issues are stable
points. R07's negative observation is deliberately retained so a later
stage can retry with a docs-deep URL rather than re-running blind.
