# ER11 B-07 / treatment / research: reviser package (fourth and final context)

**What I did:** I re-opened five primary sources myself on 2026-10-09, between about 21:22 and 21:23 UTC. I did not delegate, edit any local file or run any test or runtime. Everything else below is my judgment of the draft against the brief, the verifier and the critic, using only what they observed. "Observed" means a vendor or official page says it. It does not mean anyone saw the behavior in a running product.

## (1) Disposition of each verifier and critic finding

### Verifier (V)

| # | Finding | Disposition |
|---|---|---|
| V-Q1a | A pending Skedda request reserves nothing, and conflicting requests don't block each other | **Confirmed.** I re-opened the page and saw the same text. |
| V-Q1b | System users (Booking Admin, System Admin, Owner) can book over buffers and most policies | **Confirmed**, from the verifier's sources. The draft already says system users can override buffers. Add that most other policies don't bind them either. |
| V-Q1c | Bypassing approval itself is not established | **Corrected by my fetch.** Approval rules "do not apply" to custom admins on the spaces they manage. Whether Owners or standard admins can bypass approval is still unstated. |
| V-Q1d | What happens to the reserved time when an approved booking is changed | **Partly resolved by my fetch.** "Only admins can edit bookings once they have been approved." With Microsoft two-way sync, an Outlook date or time edit "will delete the confirmed booking and return the request to the pending status." So on a synced space, the slot is released while the change waits. For changes made inside Skedda, whether the time stays reserved is still unknown. |
| V-Q1e | Buffers apply only to bookings made after the rule; conflicting rules use the maximum | **Confirmed.** The draft already has this. |
| V-Q2a | A Food Corridor tenant sees approved bookings for each space and for the whole kitchen (Daily View), plus fellow clients through Community | **Confirmed.** Community (viewing and messaging other clients) is new. The draft omits it and must add it as a P2 exposure point. |
| V-Q2b | Tenant-side CSV download is not established | **Confirmed by my fetch.** The reporting article does not say clients can download. |
| V-Q2c | An inactive client keeps "past invoices and reports" | **Accepted** from the verifier's source (article 1935331, dated 2020). The draft omits it. Add it, marking it as old and unverified for downloads. |
| V-Q2d | No Food Corridor record type for cleaning signoffs was found | **Accepted.** This matches the draft's uncertainty. Make it explicit. |
| V-Q2e | Billing follows booked time, not sign-in data; there is a 45-day sign-in reconciliation report | **Accepted.** It is useful context for P3 and P4. |
| V-Q3 | The FDA Food Code is a model; it binds only where a jurisdiction adopts it; FDA encourages adoption; equivalent alternatives are recognised | **Confirmed by my fetch** of the 2026 page. The jurisdiction list on that page is "local, state, tribal, territorial, and federal". The verifier's doubt about the list is settled for the landing page. Whether the preface PDF says the same was not checked. |

### Critic (C)

| # | Finding | Disposition |
|---|---|---|
| C1 | "Tenant self-export" was added; the brief doesn't say who runs the export | **Accepted.** Correct the draft wording (see D2). |
| C2 | Food Corridor: the All Bookings report covers only the current year; client filters apply to active clients; Submitted Bookings shows the next 30 days | **Confirmed by my fetches**, with one precision: the "active clients" caveat is attached to the All Clients and Prospects report. Add both limits. |
| C3 | Skedda retention defaults | **Confirmed by my fetch** (see section 2). Add them. |
| C4 | The draft narrows P6 from how procedures are represented to whether cleaning is standardised | **Accepted.** |
| C5 | The handoff between tenants is underspecified; marking a resource not ready differs from sanctioning a tenant | **Accepted** as a needed elaboration and an unresolved user decision. |
| C6 | The draft assumes every resource is exclusive | **Accepted.** Capacity and exclusivity are open user facts. Space-sharing details are the critic's observation; I did not re-open that page. |
| C7 | Signer identity, paper transcription and what the attestation meant | **Accepted.** The four-digit PIN belongs to the client account, as the verifier also observed. |
| C8 | Budget: Starter's five-client cap is below the six-tenant pilot; fee inclusions; $206 × 12 = $2,472; Spacebring pricing conditions; budget horizon | **Accepted.** The arithmetic is correct. The fee and Spacebring details are the critic's observations; I did not re-open them. |
| C9 | The PostgreSQL design needs NOT NULL, non-empty and bounded ranges, and timestamptz drops the original zone | **Accepted.** Also soften "strongest explicit invariant". |
| C10 | RLS: FORCE applies only to the table owner; permissive policies combine with OR; some integrity checks bypass RLS; conflict errors should be sanitised | **Accepted.** This matches standard PostgreSQL 18 documentation. I did not re-fetch it. |
| C11 | WCAG 2.2 SC 2.5.7 requires a single-pointer alternative to dragging | **Accepted.** Upgrade "prefer" to "required if WCAG 2.2 AA is the acceptance basis". |
| C12 | The final draft is not self-contained (it points to `discovery.md`) | **Accepted.** Bring the seven checks, prices and scale into the draft. |
| C13 | The scheduler-plus-private-signoff option is underdeveloped; dismissing spreadsheets is too categorical | **Accepted.** |
| C14 | The FullCalendar chain includes fix commit `6acf6b2`; the issue has later comments; the docs say v7.1.1 | **Accepted.** Keep the 2024 comment as unresolved, not as a regression. I did not re-open these pages. |
| C-P1 | "Correction required" overstates P1 | **Accepted.** Relabel P1 "already covered; elaboration needed". Full access windows are acceptance detail, not a fix to a wrong clause. |

## (2) Corrections and confirmations, with sources

All accessed 2026-10-09 UTC. These are vendor or official statements, not observed behavior.

- **Skedda Booking Requests & Approvals** — https://support.skedda.com/en/articles/11774950-booking-requests-approvals (article dated 7 July 2026; FAQ and admin sections).
  - Observed: "Booking requests don't block each other. Admins can choose which one should be approved."
  - Observed: "only confirmed bookings are shown on the scheduler."
  - Observed: "Only admins can edit bookings once they have been approved."
  - Observed: on Microsoft two-way-synced spaces, Outlook date or time edits "will delete the confirmed booking and return the request to the pending status."
  - Observed: approval rules don't apply to custom admins on the spaces they manage.
  - Inference: approval cannot stop double-booking. A synced change can release a confirmed slot. Admins on their own spaces skip approval entirely.
- **Skedda Booking and Visit Data Retention** — https://support.skedda.com/en/articles/5707504-booking-and-visit-data-retention.
  - Observed: "The default retention period for new accounts is one year."
  - Observed: "Upgrading or downgrading your Skedda plan won't automatically change your retention period value."
  - Observed: if the plan doesn't support the configured period, new bookings and visits can't be created.
  - Observed: a recurring series is deleted only once its last occurrence is older than the retention setting.
  - Inference: an annual export run late, or a downgrade, can lose records or stop scheduling.
- **Food Corridor Reporting tab** — https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab (the page shows only a relative "updated" date).
  - Observed: All Bookings covers "All past + future bookings for the current year (approved, billed, declined, canceled, deleted)."
  - Observed: on the All Clients and Prospects report, the "Filter applies to specific active clients, not prospects or leads."
  - Observed: "view … or download them as CSV files", in the kitchen-side context. Client download is not stated.
- **Food Corridor approvals** — https://help.thefoodcorridor.com/en/articles/1413916-how-can-i-approve-bookings (dated 28 March 2023).
  - Observed: "The Scheduling tab shows the next 30 days of bookings under 'Submitted bookings.'" Bookings further out are approved from each calendar, using the "Booking Request" colour.
- **FDA Food Code 2026** — https://www.fda.gov/food/fda-food-code/food-code-2026.
  - Observed: "The Food Code is a model for safeguarding public health…"
  - Observed: "This model is offered for adoption by local, state, tribal, territorial, and federal governmental jurisdictions…"
  - Observed: "The FDA encourages its state, local, tribal, and territorial partners to adopt the latest version…"
  - Observed: "Alternatives that offer an equivalent level of public health protection…"
  - Inference: the Code binds nothing for this kitchen until its own jurisdiction, which the brief doesn't name, adopts it. Equivalent alternatives are recognised, which is consistent with tenant-defined procedures. It does not assign duties between the kitchen and its tenants.
- **Accepted from the verifier or critic, not re-fetched by me:**
  - Food Corridor articles 1812934 (Community tab), 1935331 (inactive access) and 1413890 (PIN).
  - Food Corridor pricing and fee inclusions, Spacebring pricing, Skedda space sharing.
  - PostgreSQL 18 CREATE TABLE, date/time and RLS pages; WCAG 2.2 SC 2.5.7; FullCalendar `6acf6b2` and v7.1.1.

## (3) Unresolved objections and uncertainty

- **Skedda:** whether Owners or standard admins can bypass approval; whether the slot stays reserved while a change made inside Skedda waits for review; how buffers combine across connected spaces.
- **Food Corridor:**
  - which fields the Daily View shows about other tenants (names or just blocked time);
  - whether a tenant can download CSVs;
  - whether bookings from earlier years can be reached after the year rolls over;
  - whether an inactive tenant still has access to downloads (the 2020 article says reports remain viewable);
  - there is no record type for cleaning signoffs.
- **Spacebring:** what "preparation time" actually does and what the product costs are unverified.
- **User facts the brief doesn't give:** the jurisdiction, which resources are exclusive or have capacity, how long the $21,000 must last, the signer model, which record is authoritative during the paper overlap, how much occupancy other tenants may see, and who can mark equipment as not ready.
- **Disagreement to keep in the draft:** the critic treats P1 as already covered, while the draft called it a correction. I side with the critic. The full access-window requirement is retained in substance either way.
- **Stated limit:** nobody tested anything. All candidate behavior is documentation only.

## (4) Exact draft changes required

- **D1 — P1 row and section 1.**
  - Relabel to "Retain; already covered; elaboration needed."
  - Add: decide whether each room or piece of equipment is exclusive, divisible or limited by capacity.
  - Add: confirm a room and its equipment together, so a failed equipment allocation leaves no partial booking.
  - Add the Skedda facts: approval rules don't apply to custom admins on spaces they manage; only admins can edit approved bookings; an Outlook-synced time change deletes the confirmed booking and returns it to pending.
  - Replace "strongest explicit invariant" with "the most explicitly documented invariant in this comparison; vendor internals were not examined."
  - Add NOT NULL resource and range, non-empty and bounded ranges, a CHECK on start before end, and a stored local zone for recurrence, because timestamptz does not keep the original zone.
- **D2 — Exports (disposition paragraph, P2 row, candidate table).**
  - Replace "tenant self-export" and "per-tenant self-export" with: "complete tenant-specific annual export with an agreed recipient and delivery path; tenant self-service and tablet export are optional enhancements."
  - Add Food Corridor's current-year scope for All Bookings, the active-client filter caveat, and the fact that client download is not stated.
  - Add that inactive clients keep "past invoices and reports" (2020 article; downloads unverified).
  - Add Skedda's retention facts: one-year default, a downgrade that changes nothing automatically but can block new bookings, and the recurring-series exception.
- **D3 — P2 section.** Add Food Corridor's Community tab, where tenants can view and message other clients, as an exposure point to test and configure.
- **D4 — P3 section.**
  - Separate the tenant, the individual signer, and a coordinator transcribing paper.
  - Note that the Food Corridor PIN identifies the client account, not a person.
  - Keep the original attestation time separate from the entry time, and cite the paper source.
  - Make corrections append rather than overwrite.
  - Keep the procedure text a signoff referred to recoverable, by a snapshot or the retained paper.
  - Add a minimal handoff record: the equipment-use episode, the signoff that closes it, any coordinator observation, and an optional opaque tenant batch reference.
  - Keep tenant attestation, coordinator observation and food-safety certification distinct.
  - Replace the FDA wording with the observed quotes, including the equivalent-alternatives sentence and the five-level jurisdiction list.
- **D5 — P4 section.**
  - If WCAG 2.2 AA is the acceptance basis, a single-pointer alternative to dragging is required (SC 2.5.7), not just preferred.
  - Name the screen reader and browser to test with.
  - Include approving a booking more than 30 days out, which Food Corridor handles through each calendar rather than the Submitted Bookings page.
  - On the shared tablet, add session reset, identity confirmation, and a guard against signing off for the previous tenant.
- **D6 — P5 section.**
  - Separate three decisions: sanctioning a tenant's booking, marking a resource not ready, and who may review bookings or observe cleanup. Each is unresolved, and no authority should be assumed.
  - Label the non-blocking pilot "a proposed interim arrangement needing board acceptance."
- **D7 — P6 section.**
  - Replace "Do not select a common sanitation procedure model" with: "Do not select how procedures are represented across equipment types. Candidates: a reference to the tenant's document, a free-text attestation, a configurable checklist, or a structured form per equipment type. The shared record envelope is itself an optional proposal that needs acceptance; it does not settle P6. Common representation is not the same as common cleaning instructions."
- **D8 — Budget.**
  - Starter's five-client cap is below the six-tenant pilot, as well as the 20 businesses.
  - $206 × 12 = $2,472 per year before fees; this is my arithmetic, not a quote.
  - The Food Corridor platform fee includes Stripe processing, so don't count it twice. Manual payments still carry the fee; extra onboarding calls are $70; small card transactions carry a surcharge.
  - Spacebring bills in euros, with a six-month commitment on Business, per-user counting, and add-ons for the mobile app and API.
  - Whether $21,000 covers implementation, one year or several years is unresolved.
- **D9 — Alternatives.**
  - Add "scheduler plus a small tenant-private signoff form or service" and its integration and export trade-offs.
  - Soften the spreadsheet dismissal to: "reject an unrepaired process that keeps colliding; a single coordinator-controlled process with explicit access windows remains a possible bounded pilot."
- **D10 — RLS.**
  - FORCE ROW LEVEL SECURITY applies to the table owner, not to superusers or BYPASSRLS roles.
  - Permissive policies combine with OR.
  - Add negative tests for delete, attachments, setting the tenant context, and switching tenants on pooled connections.
  - Sanitise conflict errors before they reach tenants.
- **D11 — Release chain.** Add fix commit `6acf6b2` and the v7.1.1 tag. Keep the later issue comments as unresolved, not as a confirmed regression. The chain applies only to the custom calendar route.
- **D12 — Validation ledger.**
  - Write the seven proposed checks out in full, replacing the pointer to `discovery.md`: reservation correctness by capacity; operational handoff; privacy, identity and kiosk; annual archive across 31 Dec → 1 Jan, after deactivation and near the retention limit; accessibility, including approval more than 30 days out and wet-hand use; transition and outage, including retries that don't duplicate attestations; budget and pilot exit criteria.
  - Restate the scale: 20 businesses, 3 coordinators, a 6-tenant pilot.
  - Mark every check as proposed, not executed.

## (5) Final disposition, P1–P6

| Clause | Final disposition |
|---|---|
| P1 | **Retain; already covered.** Needs acceptance elaboration: full access window, a capacity and exclusivity model, booking room and equipment together, and an enforced conflict check at confirmation. Reject a check done only on the visual calendar, and reject relying on the approval queue as a lock. |
| P2 | **Retain; already covered.** Add exposure through exports, Community and notifications. How much occupancy other tenants see is a user decision. Coordinator-run per-tenant export is acceptable. |
| P3 | **Retain; already covered in intent.** Needs signer, transcription, correction, handoff and attestation-meaning semantics. Procedure revision IDs and batch references are optional. Reject treating a signoff or attendance record as verified cleaning or allergen removal. |
| P4 | **Retain; already covered.** Add measurable acceptance (WCAG 2.2 SC 2.5.7 and 2.5.8, a named screen reader, wet-hand device testing). Which record is authoritative during the paper overlap is a user decision. |
| P5 | **Retain; unresolved user decision.** Keep tenant sanction, resource readiness and role authority separate. The non-blocking pilot is only a proposal. |
| P6 | **Retain; unresolved user decision.** It concerns how procedures are represented, not just whether cleaning is standardised. The record envelope is optional and does not settle it. |

No clause is rejected.
