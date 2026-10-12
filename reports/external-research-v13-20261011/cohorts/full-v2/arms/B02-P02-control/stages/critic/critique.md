# Independent critique — B02-P02-control

**Stage:** critic  
**Reviewed at:** 2026-10-12T01:13:29Z  
**Inputs:** the original brief, complete investigator discovery and draft, investigator source map and revealed plan, and its sources index. The frozen paths are in the supplied input-map.  
**Review limit:** no other candidate, campaign history, or unrelated files were consulted. I independently opened the primary sources listed as C01–C11 in this stage’s source map. I did not run product code, upstream tests, or any proposed validation.

## Assessment

The draft is substantially faithful to the brief and released plan. It covers booking bundles, simultaneous requests, holds and faults, interrupted/cancelled reservations, internet and local-network outages, a staff-first adoption path, privacy limits, and practical validation. It compares a single-host SQLite service, a LAN PostgreSQL service, and the MRBS and LibreBooking configure-and-fit candidates without selecting a winner. It distinguishes proposals from executed work.

I found **no material wrong claim** and no material unsupported product claim in the reviewed text. The principal product and database claims are either supported by the cited primary material or qualified as a fit question. The following items need clarification before the proposal is implementation-ready.

## Findings

### Material incomplete

**MI-01 — State the SQLite client topology explicitly.**  
**Draft locator:** “Decision summary,” SQLite option; released-plan row “A local service with a staff interface and a member browser form on the workshop network”; “Proposed domain and operating rules — Offline.”  
The text says SQLite stays on one host and that the member form reaches an on-premises service, which points in the right direction. It should state directly that staff and browser clients call one application service on that host and that remote clients never open the SQLite file or access it over a network filesystem. This is important if WAL is chosen: SQLite documents that all database processes must run on one host, WAL does not work over a network filesystem, and there is only one writer. The discovery states the one-service arrangement more clearly than the final draft. **Evidence:** C01, C02; also inherited S01–S02. This is a clarification to the proposal, not evidence that the proposed architecture is wrong.

**MI-02 — Define the lifecycle and privacy of cached offline drafts.**  
**Draft locator:** released-plan row “Browser forms cache unsubmitted drafts during outages”; “Proposed domain and operating rules — Offline” and “Privacy/security.”  
The correction appropriately prevents an offline page from claiming current availability or queuing a confirmation. It still allows a local draft but does not say whether member name, requested tool, schedule, or other booking details persist in browser storage, how long they remain, or how they are cleared on a shared workstation. Since the brief asks for minimal data and a history that supports disputes without surveillance, specify a minimal draft, a short retention/clear-on-submit-and-exit behavior, and avoid retaining member details on a shared staff device—or omit persistence. This is an inference from the proposed feature and the brief’s privacy requirement, not a claim about a product. No source can determine the workshop’s acceptable retention policy.

### Minor locator/wording

**m-01 — MRBS source range in the decision summary is mis-scoped.**  
**Draft locator:** “Decision summary,” MRBS sentence, citation **[S17–S21]**.  
S17–S18 are LibreBooking’s issue and recurrence code. The MRBS documentation/defaults are S19–S21; the MRBS release/fix history is S22–S23. The sentence’s substantive MRBS claims are supported elsewhere in the draft, but this range points readers at unrelated LibreBooking evidence and omits the cited MRBS history. Change that citation to S19–S21 and cite S22–S23 for the release-history claim. The IDs themselves remain correctly mapped in the carried source map.

**m-02 — Carry the observed WAL fixed-version detail into the option text or keep it expressly deferred.**  
**Draft locator:** “Decision summary,” SQLite option.  
The discovery records the documented fixes as SQLite 3.51.3 or the 3.50.7 / 3.44.6 backports. The final draft only says to use a runtime with “the documented WAL-reset fix.” That is accurate but less actionable. Since this is still a proposal, either list the observed minimum versions with the source date or require a version recheck before selecting a runtime. **Evidence:** C01 and inherited S02. This is minor wording; no deployment version is selected here.

## Released-plan disposition audit

| Plan clause | Critic assessment |
|---|---|
| Local staff service and optional member browser on the workshop network | Supported conditionally. Keep one on-premises authority; clarify the single-host SQLite topology as MI-01. ISP-only loss and LAN/host loss are correctly treated separately. |
| Interval plus tool, supervisor, extractor identifiers | Correction is sound: one booking with conditional supervisor allocation and shared extractor allocation. Qualification and actual capacity remain owner inputs. |
| One transaction checks overlaps and writes all resources | Correct proposed invariant. SQLite IMMEDIATE and PostgreSQL range exclusion claims are supported (C01–C03). Neither database citation by itself proves a product’s whole multi-resource workflow; the draft presents this as a system requirement and proposes concurrency tests. |
| Daily view joins bookings to fault/maintenance readiness | Supported and usefully clarifies that reservation status does not mean equipment is safe or ready. |
| Members may cancel their own bookings but cannot change holds | Supported with role checks and history; cancellation deadlines and exact role rules remain open. |
| No payment or identity documents | Preserved as a hard exclusion. |
| Monthly recurrence expansion | Correctly corrected: configure a horizon to cover booking lead time plus maintenance lead time, refuse unsafe confirmations, and test timezone boundaries. A recurrence format is not treated as the booking authority. |
| Later fault and affected accepted bookings | Good safety-first proposal: hold the equipment, preserve accepted records, list conflicts, and require an authorized staff disposition with reason/notification. It does not resolve the unsettled displacement policy. |
| Capacity-one tool and supervisor assumptions | Correctly downgraded to unverified pilot assumptions; job classes, paired use, extractor throughput, and supervision limits require workshop validation. |
| Offline cached forms and uncertain confirmation | Confirmation is correctly blocked without a fresh authority check; resolve draft persistence under MI-02. |
| Staff history, names, retention, urgent displacement | Purpose-limited event/report proposal is consistent with the brief. Visibility and retention remain owner decisions; no surveillance use is proposed. |
| Single staff machine, backup/recovery, remote alternative | Reasonably treats a single machine as a shadow-use starting point, then requires a second protected backup and restore rehearsal before live reservations. |
| Competing reservations, partial bundle, recurrence, DST, post-acceptance faults | Retained and expanded as proposals; none is represented as executed. |
| No live system/data | Preserved. The source-code and test inspection is not described as running the application or tests. |
| Staff shadow use before member route | Staged gates preserve the existing process as authority until reconciliation and operational checks pass. |
| Resolve assumptions from primary evidence; leave owner facts open | Correct. The database behavior and candidate-specific settings are evidence questions; capacity, safety policy, identity, and retention are not source-resolvable. |

## Unresolved external inputs retained

These are legitimate open decisions, not defects to “solve” from vendor defaults:

- Tool and extractor capacities, permitted paired operations, job classes, and current supervisor qualifications/concurrency.
- Whether a fault immediately displaces an accepted booking, who may authorize that, and the safe in-use fault response.
- Booking lead time, cancellation/no-show/interruption rules, buffers, and member appeal/notification process.
- Minimum member lookup data, local account versus staff-entered booking, name visibility, event retention, and export permissions.
- Whether outage scope includes only ISP loss or also LAN, host, and power; who owns updates, backup, restore, and paper-log reconciliation.

The draft’s staged approach and alternative urgent-displacement policy shapes retain these decisions instead of claiming a source settles them.

## Evidence and validation status

Independent primary checks confirmed: SQLite transaction and WAL limits/fix versions (C01–C02); PostgreSQL’s range exclusion example with btree_gist (C03); RFC 5545’s format/interchange scope (C04); LibreBooking’s dated security notice, supported stack, open recurrence issue, and matching date-handling code (C05–C07); the v7.0.0 reservation presenter’s multi-resource/accessory assembly and the limited scope of its conflict-resolution unit tests (C08–C09); and MRBS’s default-off simultaneous-booking setting and v1.12.2 series-edit fix (C10–C11). These checks support the draft’s cautions. They do not establish that either product meets the workshop’s access-control, all-or-none concurrency, supervisor, extractor, or privacy requirements.

As of the reviewed access window on 2026-10-12, LibreBooking’s current develop README still described its high-impact security release as planned for 2026-10-13, and issue #1536 was open. The draft correctly makes any evaluation conditional on rechecking after that announced date. This observation is time-sensitive.

**Executed here:** the required native Goal activation/binding guard was observed and saved before case input. The primary pages above were opened/read.  
**Not executed:** no product installation, source-code execution, upstream test run, concurrency test, outage test, backup restore, live-data processing, or proposed workshop validation. Continue to label all of the latter as proposed.
