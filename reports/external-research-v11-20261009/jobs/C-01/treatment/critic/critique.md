# Independent critic review — H01 treatment research

**Stage:** ER11 C-01 / treatment / critic  
**Reviewed:** the exact H01 brief; the complete frozen research discovery, source map and bounded source notes; the complete post-reveal draft; the exact revealed P1–P6 plan; and public primary-source records S01–S17. Critic source access and limits are recorded in [source-map.json](source-map.json), with bounded notes in [sources/observations.md](sources/observations.md).

## Overall assessment

The draft is a coherent, appropriately cautious research disposition. It preserves the family's small, discreet, staff-led scheduling and handoff pilot; does not select a product; leaves relatives' access, note retention, and workflow separation to the owner; and distinguishes public-source claims from behavior that would need a demo or pilot. Its comparisons include a funeral-specific product, a modular calendar/resource option, a purpose-built resource scheduler, a central office authority, custom local-first software, and controlled paper fallback. The proposed tests are concrete and clearly marked as unrun.

I found no evidence that calls for rejecting the draft's main recommendation to compare Passare with a version-supported Nextcloud option using synthetic data. The draft should retain three refinements before it serves as a complete decision aid: test privacy inference from operational details rather than treating a neutral key as anonymization; include the narrow Nextcloud “show only as busy” workaround as a configuration to test without treating it as a general fix; and test vehicle travel/turnaround feasibility across the nearby communities, not only overlapping time slots. These are research refinements, not evidence that a candidate passes.

## Material findings

### M1 — A neutral service key does not establish that an event is non-identifying

The draft correctly recommends omitting names, contact details, preferences, faith/cultural requests, and payment arrangements from broadly shared event details. It also proposes synthetic role accounts and checks across event, resource, task, notification, search, export, and download surfaces. Those are strong controls.

However, the small local setting makes it possible that service date/time, room, vehicle, officiant, or community can reveal which family a neutral key represents. That is an inference from the brief, not a proven disclosure in a particular product. The draft should label the key as a pseudonymous operational identifier and avoid implying it anonymizes a record. Extend the proposed privacy walkthrough to ask whether each test role can identify a family or infer a sensitive request from otherwise permitted schedule data. The owner-approved matrix should state which operational facts are visible to each role. This does not change the requirement to coordinate services in one view; it defines what that view may reveal.

### M2 — Issue #196 contains a narrow alternative that deserves a controlled test

The draft's warning is sound for the ordinary flow described in the open Nextcloud issue: the issue reporter says a resource booking from a private event appears in the resource calendar, and the feature request remains open. The draft is right not to rely on the ordinary private-event checkbox as a privacy control for a linked resource.

The same issue includes a comment describing a narrower workaround: a resource may be represented by a real calendar owned by a user account and shared with “show only as busy.” The comment says this works when that account is the resource and the calendar is shared from it. That is a different configuration from the Calendar Resource Management backend; it is not a general fix, support statement, or verified behavior for this pilot. The draft should include it as an optional, exact-version configuration to evaluate only if it fits the chosen stack, with synthetic data and checks through every relevant calendar/client/export path. Do not use the workaround to relax the no-real-data gate before the test passes.

### M3 — Resource overlap is not sufficient to validate transportation scheduling

The brief describes transportation between several nearby communities. The draft's two-staff overlapping-vehicle scenario tests collision handling, but two bookings can be non-overlapping and still be infeasible if travel, loading/setup, service duration, return, or turnaround time is missing. Add a proposed scenario with back-to-back services in different communities and owner-approved travel and buffer times. Record whether the candidate models those intervals or whether staff must hold explicit buffer blocks and confirm them manually. This is not evidence that any product lacks travel planning; it is a gap in the discriminating test.

## Minor evidence and wording findings

1. **Passare Manage page drift.** The earlier research map records S02 as successfully read at 2026-10-09T21:44:18Z. Reopening its exact URL in this critic stage returned HTTP 404 at 21:55 UTC. Passare's homepage still describes cases, team tasks/service details, financials, family communication, and an open API, but the critic could not reproduce S02's specific team-calendar, notes/checklist, or permissions claims. Treat those as historical vendor-page claims and keep the proposed current demo and written evidence requirement. This does not invalidate Passare as a lead.
2. **LibreBooking security scope.** The advisory applies to versions before 7.0.0 and identifies the legacy migration endpoint plus stated access/connectivity conditions for exploitation; v7.0.0 is the named patch. The draft's deferral is justified by the separate, time-bound October 13 high-impact-release announcement, not by claiming that v7.0.0 remains vulnerable. Keep the dates and version scope explicit and recheck the mutable announcement before any later procurement or deployment.
3. **P2 label clarity.** The revealed P2 clause does not say that a private-event checkbox is sufficient. The draft later distinguishes that rejected implementation assumption from the P2 requirement, which is correct. Keep that distinction adjacent to the P2 disposition so the “rejected assumption” cannot be mistaken for a flaw in the plan.
4. **Version mismatch is handled correctly.** The app catalog currently lists stable Calendar Resource Management 0.12.2 through Nextcloud 35, while the referenced Calendar user manual is edition 36 and the CLI manual is edition 35. The draft calls for an exact supported pair and does not claim the missing 36 row proves incompatibility. Keep that qualification.
5. **PouchDB claims are properly bounded.** The mutable replication/conflict guides and the pinned 9.0.0 release support the stated retry, conflict, and 25-result default observations. The historical #3179/3.3.1 chain satisfies the issue/fix/release obligation but is not evidence of a current 9.0.0 defect. The draft says this; no stronger inference is warranted.

## Exact revealed plan comparison

| Plan item and exact clause | Critic disposition |
| --- | --- |
| **P1** — “Coordinate service times, rooms, transportation, and staff task handoffs in one planning view.” | **Already covered; retained.** This is the pilot's core. Status/change history, neutral keys, time-zone checks, and explicit handoff ownership are optional improvements, not silent scope changes. Add the M3 transport-buffer scenario. A single view must still respect the P2 access limits. |
| **P2** — “Limit family contact, preference, and payment details by staff role.” | **Already covered; retained and refined.** The draft preserves the privacy requirement and appropriately distinguishes calendar-level access from field-level case access. Treat the private-event issue as an implementation hazard, not an assumption in the plan clause. Add the M1 inference check. No evidence supports using a neutral key alone as de-identification. |
| **P3** — “Provide keyboard-operable controls and a way to prepare translated family information.” | **Already covered; retained.** WCAG 2.2 SC 2.1.1 and 2.4.3 are reasonable proposed criteria and do not certify a candidate. Testing the keyboard-first staff member's whole flow and requiring human-reviewed family text are appropriate; candidate support remains unknown. |
| **P4** — “Preserve a usable office workflow during temporary internet outages and support independent export.” | **Already covered; correction/refinement is useful.** Separating WAN loss from office LAN/server/power loss is a test design, not a decision that the owner must install an on-prem server. The office-LAN authority is explicitly an inference. Calendar export is not demonstrated to cover tasks, case records, attachments, or notes; the scoped restore proposal correctly treats that as unknown. No outage or export test ran. |
| **P5** — “Relative editing access and the treatment of family-approved schedule changes are policy choices.” | **User decision; unresolved.** The draft does not enable family access or decide approval, notification, or revocation behavior. Keeping requests staff-mediated during a staff-only pilot is a defensible temporary operating assumption, clearly presented as such. |
| **P6** — “Retention of personal planning notes and separate workflows for different service types remain open.” | **User decision; unresolved.** The draft does not invent a retention period or service taxonomy. Separating notes from the operational record preserves the owner's later choice. No retention standard or taxonomy was researched, as stated. |

No exact plan clause should be rejected as unnecessary. P1–P4 are retained with bounded refinements; P5–P6 stay open for the owner.

## Obligation and validation audit

- **O1, discovery:** Met. The frozen discovery identifies materially different product and operating approaches, with fit conditions and cost/maintainer limits. The critic adds no new source inventory or candidate.
- **O2, primary behavior/defaults:** Substantially met. The draft records the app/server mismatch, false boolean defaults, identifiers, resource models, calendar sharing granularity, export/import flags, and PouchDB's conflict/query limits without inventing units for capacity or vehicle range.
- **O3, issue/fix/release evolution:** Met. The LibreBooking advisory and v7.0.0 patch plus time-bound release warning form a relevant chain; PouchDB #3179 and release 3.3.1 supply a historical regression/fix chain. Both are scoped rather than presented as current universal bugs.
- **O4, plan comparison:** Met. All exact P1–P6 clauses are dispositioned. The private-event rejection is a product-implementation assumption, not a rejected plan requirement.
- **O5, preservation and uncertainty:** Met. The draft preserves the six-person family-owned setting, multi-community and after-arrival changes, sensitive data, translation, keyboard use, weather-related internet loss, independent export, calm tone, $10,000 first-year ceiling, and all three unresolved policy choices. Vendor pricing and candidate behavior remain unknown.
- **O6, validation:** Met with the M1–M3 refinements above. The draft consistently identifies proposals as unrun and does not imply an installed candidate, real-data test, accessibility assessment, or procurement review.

The existing validation plan is otherwise discriminating: it compares supported versions, role-specific access, booking contention and changes, WAN versus local failure, export/restore, keyboard use, translation, and full first-year cost. Its “no real family data before privacy checks pass” gate is appropriate. No product/runtime tests were run during this critic stage; only public sources were reopened and read.

## Remaining uncertainty

Passare's price, permission granularity, offline behavior, family access, and export scope remain unknown. The precise Nextcloud server/app pair, support overlap, resource privacy behavior, and whole-pilot export coverage remain unverified. Local-network resilience, staff/officiant representation, language needs, and the owner's decisions on relatives, retention, and service types also remain open. The draft should continue to present its comparison as a proposal for a synthetic-data pilot, not as a selection or assurance claim.
