# Independent critique — B02-P02-treatment

**Stage:** critic/finalizer  
**Assessment basis:** The full brief, released plan and investigator package were read from the frozen paths in input-map.json: discovery.md, draft.md, source-map.json, revealed-plan.md, plan-reveal.json, and sources/README.md. The source-map IDs below retain their original meanings. I independently checked the listed primary documentation, pinned code/tests, issue pages and database documentation; the review window and precise access limits are recorded in this stage’s source-map.json. No product was installed, no downloaded code or test suite was run, and no booking/member data was submitted.

## Overall finding

The investigator package is strong and substantially faithful to the brief and released plan. Its corrected proposal is appropriately conditional, compares LibreBooking, MRBS, a tailored local service, and calendar/spreadsheet fallback, and leaves workshop policy to the owners. It distinguishes static source review from proposed runtime checks and does not present a candidate as selected.

No material false correction or consequential product claim was found in the passages independently checked. Three changes were needed in the final: broaden the history requirement so every material booking change preserves its reason, recommend explicit half-open interval semantics, and avoid implying the blackout deletion test proves whether an immutable dispute history remains. The final accepts/amends those issues and preserves the open owner decisions.

## Released-plan disposition audit

| Plan clause | Critic disposition | Review |
|---|---|---|
| P1.1 local staff/member service | Accept with condition | Keep on-prem LAN as a shared option; WAN independence is an architecture inference that requires a local-host/LAN outage test and no mandatory remote dependencies. |
| P1.2 interval and tool/supervisor/extractor identifiers | Amend | Parent reservation plus separate resource allocations is sound. Supervisor must consume qualified capacity as a named person or defined role pool. Final also specifies half-open intervals and explicit buffers. |
| P1.3 one-transaction conflict check/write | Accept as a requirement | Do not state it as a verified LibreBooking or MRBS property. PostgreSQL exclusion constraints and one transaction are design options; SQLite’s local-server/write-serialization option has workload limits. |
| P1.4 daily readiness join | Accept and detail | Staff day/shift readiness and affected-booking queue are consistent with the brief. Keep member view narrow and conflict text actionable. |
| P1.5 member cancel but not alter holds | Accept and strengthen | This is an authorization invariant. Final keeps staff holds independent and records material booking/hold changes, actor, prior/new values, and reasons. |
| P1.6 no payment or identity documents | Accept as hard constraint | Final preserves both exclusions and does not make a hosted identity account mandatory. |
| P2.1 one-month recurring expansion | Correct | One month is unsupported. A configurable display horizon is separate from a finite recurrence rule/end date; the owner selects the horizon. |
| P2.2 later fault and reasoned move/cancel | Accept with history caveat | Preserve original accepted booking, affected state, and a reasoned staff decision. LibreBooking offers delete and book-around paths, but the reviewed test does not establish immutable dispute-history retention. |
| P2.3 capacity-one assumptions | Accept as unresolved policy | Do not impose one capacity rule globally. Set capacity and supervision rules from the inventory/task matrix. |
| P2.4 classes and paired operations | Accept as adoption gate | Scheduler documentation cannot decide qualifications or group-supervision limits. |
| P2.5 cached offline draft/availability | Correct | Local service may work during WAN loss while host/LAN remain up; stale offline availability cannot authorize a confirmation. Reconcile provisional requests serially. |
| P3.1 staff booking-history export | Accept conditionally | Restrict fields, role, copies and retention; candidate reporting defaults are not proof of fit. |
| P3.2 retention and urgent displacement | Accept as owner decision | No evidence can choose this workshop’s priority, notice, appeal or retention rules. |
| P3.3 single staff machine and remote alternative | Amend/compare | Compare workstation-local, on-prem LAN host, and hosted/shared service. Keep backups separate and test restore. |
| P3.4 proposed checks | Accept and expand | Preserve the proposal/execution distinction; include admin/member paths, reason history, adjacent intervals/buffers, outage and restore. |
| P3.5 no live system/data | Accept | No product was installed or used with member/booking data. |
| P3.6 staff shadow use | Accept and stage | Shadowing precedes a staff-only authoritative pilot; member self-service is gated on policy and validation. |
| P4.1 provisional status | Accept | The final remains a research proposal, not an endorsement. |
| P4.2 applicable primary evidence and unresolved data questions | Accept | Version and branch boundaries remain visible; open workshop policy is not filled in from product docs. |
| P4.3 no future deployment | Accept as authorization boundary | No deployment or installation is proposed as completed work. |
| P5 time limit | Accept | The task is bounded by the absolute stage/whole deadlines; no waiting is required. |

## Findings and dispositions

| ID | Classification | Draft locator and evidence | Resolution in final |
|---|---|---|---|
| C1 | **Material incomplete** | draft.md §2 “Domain model” / “Event history” and §2 “Maintenance after an accepted booking” require reasons for specified staff fault/displacement actions but do not clearly preserve the reason on every material booking change. The brief’s first paragraph requires the system to preserve the reason when a booking changes. | **Amend.** final.md §2 “Domain model” / “Event history” records every material change and its supplied reason or explicit reason code; mandatory staff safety reasons remain explicit, and the owner decides whether routine member changes need free-text detail. The validation plan checks reason retention. |
| C2 | **Material incomplete** | draft.md §2 “Domain model” says to use a single interval convention without stating one. discovery.md §2 item 2 recommends half-open intervals; PostgreSQL’s official range example uses [start,end) (PG-RANGE). Adjacent-slot semantics are central to overlap validation. | **Amend.** final.md §2 “Domain model” recommends half-open intervals, treats buffers as explicit occupancy extensions and adds adjacent-interval cases to proposed validation. |
| C3 | **Minor locator/wording** | draft.md §1 P2.2 and §2 “Maintenance after an accepted booking” could be read to imply the delete path removes dispute history. The v7.0.0 test confirms a delete call for one instance and notification; it does not test retained audit history (LB-BLACKOUT-TEST). | **Amend.** final.md describes the tested deletion/notification and explicitly leaves immutable history retention unproved. |
| C4 | **Honestly unresolved external input** | draft.md §4 “Owner decisions” correctly leaves task/class matrix, qualified-supervisor policy, resource capacities, urgent displacement, retention, contact/account fields, outage boundary, operating owner and recovery objectives open. These cannot be resolved by product docs. | **Uncertain / retain open.** final.md keeps these as owner decisions and does not make a winning product or policy choice. |

**Material wrong:** none identified.  
**Unsupported consequential correction:** none identified after the primary-source checks below.

## Evidence, alternatives, and applicability

- LibreBooking 7.0.0 documentation supports resources representing equipment or people, must-book-together relationships, accessories with bounded quantities, blackouts, and administrative reporting. It also states that resource relationships/usage constraints have administrator exceptions; the plan’s admin-path test is necessary (LB-ADMIN).
- The pinned v7.0.0 reservation handler validates then calls persistence; the repository issues separate database commands for the series and resource/accessory rows; the reviewed tests use rule-level fixtures/mocks and do not simulate interleaved writes. This supports the draft’s narrow “not concurrency proof” conclusion, not a finding that a race definitely occurs (LB-RES-HANDLER, LB-REPO, LB-AVAIL-TEST).
- The pinned blackout service requires termination dates for interval-based recurrence. Its tests show a conflicting reservation instance deleted/notified or a blackout split around the booking. They do not establish workshop-safe fault handling or immutable dispute-history retention (LB-BLACKOUT-SVC, LB-BLACKOUT-TEST). The v4.3.0 changelog records the earlier recurring-blackout end-date fix (LB-CHANGELOG).
- LibreBooking issues #1535 and #1536 identify development-branch recurrence-widget and west-of-UTC termination-date reports at develop commit add7ebfbe. They are test signals, not evidence of defects in v7.0.0. Issue #1416 reports an instance-deletion failure on v3.0.3 and was closed because it was an old version/no response; it is not applied to v7.0.0 (LB-ISSUE-1535, LB-ISSUE-1536, LB-ISSUE-1416).
- MRBS 1.12.2’s official release page marks it latest at review and pins commit 38d51e0; its schema has one room_id per entry and repeat series. The release notes report security fixes and the repeat-series edit fix with prevent_simultaneous_bookings (#3965). That is a single-resource comparator, not proof of compound atomicity (MRBS-HOME, MRBS-RELEASE, MRBS-SCHEMA, MRBS-NEWS, MRBS-AUTH).
- PostgreSQL range exclusions can reject overlap per resource key; a multi-resource booking still needs one transaction. SQLite allows one writer at a time, BEGIN IMMEDIATE can return SQLITE_BUSY, and its guidance warns against direct multi-machine use of a database file over network filesystems. The draft’s conditional local-host vs client/server comparison is supported; actual workload suitability remains unmeasured (PG-RANGE, SQLITE-TXN, SQLITE-WHEN, SQLITE-NET).
- The alternatives and scope remain useful: no selection among the four paths; spreadsheet/calendar can be a read-only or provisional fallback; paper reconciliation is not an independent confirmation path; no payment, identity documents, surveillance log, live installation or live data are added.

## Validation status

The six validation groups in final.md §6 are **proposed only**: atomic races/partial allocation, maintenance authorization and hold races, recurrence/time-zone and exceptions, lifecycle/readiness/history, WAN/LAN/host outage and restore, and privacy/accessibility/operation. No product UI, application, test suite, concurrency workload, outage simulation, backup restore, or member/booking data exercise was performed in the critic stage. The source test files were read, not run. This status is explicit in final.md §6 and must not be represented as a passed validation.

## Completeness and preservation

The final retains the brief’s roughly 100 members, equipment/tool claims, shared extractor, qualified supervision, staff maintenance/fault holds, daily readiness, understandable conflicts, reason history, recurring maintenance, cancellation/interruption, simultaneous submissions, WAN-down operation, local/shared deployment comparison, no mandatory hosted account, no payment/identity documents, dispute resolution without activity surveillance, open displacement policy, staged adoption, and proposed concurrency/failure checks. It preserves the exact released-plan clause references, supported alternatives, applicability caveats, owner decisions, and proposed-versus-executed status.