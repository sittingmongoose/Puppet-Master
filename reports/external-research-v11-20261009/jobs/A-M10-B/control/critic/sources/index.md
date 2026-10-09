# Sources index — S04 maker-inventory (A-M10-B/control/critic)

Navigable index for critic-stage immutable source IDs C01–C05. Bounded
fair-use excerpts only; full pages remain at their URLs. Accessed
2026-10-09 18:40–18:46 UTC. No executables retained. Usage/billing:
unobserved (null in source-map.json). Predecessor IDs S01–S18 live in the
research stage's own index and are referenced, never rebound, here.

- <a id="C01"></a>**C01 — PostgreSQL constraints (current/18)** —
  https://www.postgresql.org/docs/current/ddl-constraints.html
  (PostgreSQL 18, stable-versioned). Supported-versions banner shows
  "Current (18)"; page carries "5.5. Constraints" incl. "5.5.6. Exclusion
  Constraints". Evidence: web_fetch (page fetched, 46645 bytes,
  processed 27847 chars, truncated).
- <a id="C02"></a>**C02 — LibreBooking releases note for 7e80933** —
  https://github.com/LibreBooking/app/releases (release-record). "schedule:
  Correct tall view rendering for reservations with hidden blocked periods
  (`7e80933`)". Confirms the commit exists with the claimed subject; diff
  details not re-verified. Evidence: web_search snippet.
- <a id="C03"></a>**C03 — Grocy 4.7.1 changelog** —
  https://github.com/grocy/grocy/blob/HEAD/changelog/83_4.7.1_2026-09-04.md
  (release-pinned 4.7.1/2026-09-04). "Fixed that certain fields were not
  copied when copying a product"; "Fixed that the iCal export was broken
  (any shared `https://<Grocy>/api/calendar/ical?secret=xxx`-link always
  returned `401 Unauthorized`)"; accent-insensitive filters; non-latin
  password login fix. Evidence: web_search snippet.
- <a id="C04"></a>**C04 — InvenTree stock-history PR #4541** —
  https://github.com/inventree/InvenTree/pull/4541 (PR-record). "Augments
  existing stock item history tracking to include 'sales order' information
  where appropriate"; previously missing when shipping against a sales
  order; "recently fixed in #4488, but did not apply retroactively";
  "relatively simple data migration ... applies the 'sales order' data to
  old tracking entries." Evidence: web_search snippet.
- <a id="C05"></a>**C05 — LibreBooking issue #1220 (negative observation)** —
  https://github.com/librebooking/librebooking/issues/1220 (unobserved by
  this critic). Searched for the "Skip Conflicting Bookings" Reservation
  API gap record; top results did not surface the issue page in the
  available window. Predecessor S16 stands unconfirmed, not refuted.
  Evidence: web_search with no confirming snippet (honest negative).

## Retention note

Excerpts above are the retained bounded evidence (short factual quotes for
identification). No page HTML is vendored; no binaries, installers, or
credentials were collected. Mutable pages may drift; pinned
releases/issues/PRs are stable points. C05's negative observation is
deliberately retained so a later stage can close it with one fetched page
rather than re-running the search blind.
