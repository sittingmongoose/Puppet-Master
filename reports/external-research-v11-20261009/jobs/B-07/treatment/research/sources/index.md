# ER11 B-07 source evidence index

This is bounded evidence from public primary sources used for discovery. Product pages and help centers are vendor-authored descriptions, not independent demonstrations or guarantees. The immutable IDs here match `../source-map.json`; their IDs are never reassigned. Access times, requested URLs, observed operations, and version/commit details are in that map.

## Skedda

### S01 — [Buffer time](https://support.skedda.com/en/articles/3653032-buffer-time)

The help article says the feature creates time both before and after bookings; per-space rules may use different durations. Its listed minimum is 15 minutes after changing the platform granularity. New rules affect only later-made bookings. Conflicting rules for one space use the maximum. Regular users cannot book in a buffer, but system users may override it; neighboring booking buffers can overlap. The example requires 60 minutes of configured buffer when the operator wants 30 minutes of cleanup plus 30 minutes of setup.

Bounded source phrase: “Buffer times will only be applied to any bookings made after the buffer rule is implemented.”

### S02 — [Booking Requests & Approvals](https://support.skedda.com/en/articles/11774950-booking-requests-approvals)

Approval rules can target spaces, user tags, and days. A submitted request does not become a scheduler booking until approved. The documented exception is consequential: multiple conflicting pending requests are permitted and do not block each other. Approved bookings cannot be edited by regular users according to this article; custom administrators may bypass approval on spaces they manage. The help article states this feature is plan-gated (Premier for Skedda; Advanced for AllBooked).

Bounded source phrase: “Booking requests don't block each other.”

### S03 — [Access and Visibility](https://support.skedda.com/en/articles/105728-access-and-visibility)

The venue can be private/login-protected; booking rights can be limited by user tags. If no content visibility rules are set, regular users see basic booking date, time, and space, without user information; venue system users still see holder, title, and custom fields. When overlapping visibility rules match, the most generous detail wins. The system therefore supports schedule visibility with reduced identity, not concealment of booking time/resource occupancy from every other regular user by default.

Bounded source phrase: “all system users … will always see all of the information about bookings.”

### S04 — [Export or print booking data](https://support.skedda.com/en/articles/105786-export-or-print-booking-data)

Exports are provided through List view to System users and can be filtered and downloaded as XLSX or CSV. The listed file fields include times, title, price/status, holder/contact/tags, spaces, and custom fields, so configuration can create a privacy-sensitive export. Regular users see only their own and other permitted bookings and do not get the List view filters/export path described. The page says export/print controls are not shown on smaller devices such as tablets.

Bounded source phrase: “This function is not currently shown on smaller devices (mobiles, tablets).”

### S05 — [Pricing](https://www.skedda.com/pricing)

The page separates Skedda Workplace and AllBooked, shows regional plan variants, and describes plans priced per space. Plan features differ, including reporting, buffers, approvals, tablet displays and data retention. Thus count every room/equipment resource that becomes a “space,” choose the exact product and region, and request a written quote with the needed approval, privacy, export, and retention features. The captured table is mutable and is not a quote.

## Food Corridor

### S06 — [Pricing and features](https://www.thefoodcorridor.com/pricing/)

The captured U.S. pricing lists Starter at $129/month with up to five active clients, Annual at $206/month billed annually, and Professional at $229/month, with Annual/Professional for unlimited clients. It lists platform fees of 4%, discounted to 2% for bank-transfer/manual billing on Professional and Annual, plus possible small-transaction fees. A review of the pricing page reports the platform fee includes Stripe processing, manual payments still carry the fee, additional onboarding calls are $70, and small U.S. card transactions may have a surcharge; request a quote and avoid double-counting Stripe. The page describes client self-service scheduling, equipment booking, reporting, digital sign-in/out, and compliance-document management. For 20 businesses, Starter does not fit the active-client count. Subscription cost alone does not include transaction effects or prove the needed tenant-scoped cleaning record/export behavior.

### S07 — [Tenant booking workflow](https://help.thefoodcorridor.com/en/articles/1413904-how-do-i-book-in-my-kitchen)

Food-business users can view current approved bookings for a kitchen space and all approved bookings in the whole-kitchen Daily View; they can request a room and equipment, including equipment for a different time range, and recurring bookings. The public guide does not say whether other tenants’ names or booking details can be hidden, so tenant data minimization requires a live test. The documented workflow includes drag/drop plus an explicit create-booking control.

Bounded source phrase: “see all approved bookings for the whole kitchen in the Daily View.”

### S08 — [Equipment reservations](https://help.thefoodcorridor.com/en/articles/1414032-how-do-i-reserve-equipment)

A tenant can include equipment in a space booking and reserve an item for all or only part of the space interval. The booking flow chooses the equipment time range, then shows available equipment for that range. This is a useful fit for equipment conflicts that do not occupy the room for the full production period. The document does not specify setup/cleanup padding or its conflict transaction semantics.

Bounded source phrase: “either for the entire booking or just part of it.”

### S09 — [Booking approval](https://help.thefoodcorridor.com/en/articles/1413916-how-can-i-approve-bookings)

Kitchen administrators approve/decline in a Submitted Bookings page or individual calendars. A per-client auto-approve setting exists, so a pilot can distinguish trusted tenants from review-required tenants. The review source reports the Submitted Bookings page lists the next 30 days; farther dates are handled from individual calendars. The help page does not establish that one tenant’s pending request reserves a slot against another simultaneous request; test the race behavior rather than assuming approvals prevent double bookings.

### S10 — [Reporting tab](https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab)

The vendor help article says kitchen-side reports can be downloaded as CSV and filtered by client/date. The reviewed current page describes All Bookings as current-year and qualifies the All Clients and Prospects report filter to active clients; tenant-side download is not established. Its all-bookings report includes past and future bookings across statuses, a “Booked For” client and created-at timestamp; other reports include client totals and calendar usage. This supports coordinator-generated per-client extracts. The page does not establish a tenant’s self-service export of its own annual archive, nor that inactive/former-client filtering works as needed; verify before selection.

Bounded source phrase: “all downloadable reports update to include only the data that matches your selected clients and dates.”

## Other purpose-built shared-kitchen option

### S11 — [Spacebring shared kitchen management](https://www.spacebring.com/solutions/shared-kitchen-management-software)

The live product page claims room/equipment booking, self-service, room-specific “preparation time,” pricing/rules and membership approval. Its product model appears aimed at the facility use case and is distinct from retrofitting office-room booking. It also emphasizes membership, billing, mobile apps, customer data, community, and integrations. The page does not define exact preparation-time semantics, post-use cleanup, tenant visibility, tenant-owned signoff, CSV schema, or accessibility behavior; those must be demonstrated.

Bounded source phrase: “Configure customized scheduling rules, rental rates, and preparation time for each cooking room.”

## Custom scheduling and tenant data isolation

### S12 — [PostgreSQL 18 range types](https://www.postgresql.org/docs/18/rangetypes.html)

PostgreSQL 18 provides `tstzrange` for timestamp-with-time-zone intervals. Two-argument range constructors use inclusive lower/exclusive upper `[)` bounds, allowing adjacent bookings to meet exactly without overlapping. Section 8.17.10 shows `EXCLUDE USING GIST (resource WITH =, during WITH &&)` (using `btree_gist` for scalar resource equality) to reject same-resource overlapping intervals at the database constraint. Apply the invariant to the *access* interval, not only the production interval, and represent each concurrently consumed resource consistently. Documentation is not a live concurrency test of a proposed application.

### S13 — [PostgreSQL 18 row security](https://www.postgresql.org/docs/18/ddl-rowsecurity.html)

RLS can filter visible and writable rows using `USING`/`WITH CHECK`; it is not enabled automatically. Enabling RLS with no policy defaults to deny. Table owners, superusers, and roles with `BYPASSRLS` bypass ordinary policies unless owner enforcement is configured. A tenant-owned record design therefore needs explicit policy tests and a non-privileged application role; app logic alone or the phrase “RLS enabled” is not evidence of isolation.

Bounded source phrase: “By default, tables do not have any policies.”

## Calendar UI behavior and release evidence

### S14 — [FullCalendar eventOverlap](https://fullcalendar.io/docs/eventOverlap)

Current docs identify v7.1.1 (released October 6, 2026). `eventOverlap` is scoped to events being dragged/resized; the default is true. It is a browser-side interaction rule, not a persistence invariant or protection against simultaneous requests. A visual scheduler can improve feedback while the authoritative booking transaction enforces conflicts in the service/database.

### S15 — [Issue #6393](https://github.com/fullcalendar/fullcalendar/issues/6393)

The reporter describes bookings stacked visually in DayGridDay using `eventOrderStrict` on FullCalendar 5.8.0. GitHub labels it confirmed, shows v5.9.0 as the milestone, and the issue is about event rendering. It is not evidence of double-booked database records.

### S16 — [Release v5.9.0](https://github.com/fullcalendar/fullcalendar/releases/tag/v5.9.0)

The tagged release, commit `620efb5e9c023f229a22af31e10b8b810fa5b2ba`, was released July 28, 2021 and lists a fix for dayGrid events sometimes overlapping with `eventOrderStrict:true`, linking #6393. This is a concrete report-to-release chain demonstrating visual scheduler bugs can exist and later be fixed. Its rendering scope is not a booking conflict engine.

## Authority and accessible interaction

### S17 — [FDA Food Code 2026](https://www.fda.gov/food/fda-food-code/food-code-2026)

FDA describes the Food Code as a model for retail/foodservice safeguards and says it is offered for adoption by state/local/tribal/territorial/federal jurisdictions. The brief gives no jurisdiction and the code is not a tenant’s customized procedure. This supports a narrow product role: preserve tenant-authored signoff evidence, while the applicable local rule and each tenant’s food-safety program remain outside the system’s claim. It does not decide legal responsibility for this specific facility.

Bounded source phrase: “This model is offered for adoption by local, state, tribal, territorial, and federal governmental jurisdictions.”

### S18 — [WCAG 2.2 SC 2.5.8](https://www.w3.org/TR/WCAG22/#target-size-minimum)

The AA criterion sets a 24-by-24 CSS-pixel pointer target minimum, subject to spacing and other exceptions. The WAI explanation says this helps touch users and explains the exception geometry. It is a measurable accessibility baseline for tablet controls, but it does not guarantee accurate operation with wet hands; test the actual tablet and gloves/wet-hand conditions. For the coordinator’s screen-reader view, test complete task flows with the chosen screen reader and keyboard as well as automated checks.

### S19 — [FullCalendar v5.9.0 release commit](https://github.com/fullcalendar/fullcalendar/commit/620efb5e9c023f229a22af31e10b8b810fa5b2ba)

This is the exact full commit SHA referenced by the v5.9.0 tagged release page. The commit page reports the commit identity and change tree; it is used to pin the release version precisely. The relevant #6393 rendering fix is evidenced by the tag's release notes, not inferred from this commit's unrelated per-commit message.

## Index and interpretation

- Main candidate comparison and scope decisions: [`../discovery.md`](../discovery.md).
- Exact P-clause adjudication after authorized plan reveal: [`../draft.md`](../draft.md) (created after reveal).
- Exact source URL/version/commit/locator/access timestamp and observed operation: [`../source-map.json`](../source-map.json).


## Additional sources from independent review

### S20 — [Skedda booking and visit data retention](https://support.skedda.com/en/articles/5707504-booking-and-visit-data-retention)

The reviewed article states new accounts default to one-year retention; plan changes do not automatically change the configured value; an unsupported period can prevent new bookings/visits; recurring series are deleted after the last occurrence passes the configured period. A delayed export or downgrade risk is an inference. Review access timestamp and operations are in source-map.json.

### S21 — [Spacebring pricing](https://www.spacebring.com/pricing)

The reviewed live page describes euro billing, a six-month Business commitment, active-user counting, and separately priced mobile-app/API options. Obtain a dated quote; the page is mutable.

### S22 — [FullCalendar issue #6393 fix commit](https://github.com/fullcalendar/fullcalendar/commit/6acf6b2)

The reviewer inspected commit 6acf6b2 and its event placement/segment hierarchy diffs. This belongs to the v5.9.0 rendering-fix chain; it is not evidence of persistence or booking-conflict behavior.

### S23 — [WCAG 2.2 SC 2.5.7 explanation](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

When SC 2.5.7 applies, nonessential dragging needs a single-pointer alternative; keyboard access alone does not meet that requirement. See also S18 for SC 2.5.8 target size.

### S24 — [Food Corridor food-business account](https://help.thefoodcorridor.com/en/articles/1812934-what-does-a-food-business-account-look-like)

The independent verifier reports the Community tab lets clients view and message fellow clients, and the Reports tab covers booking, invoice, and sign-in/out information. The verifier reported date-only access metadata; the exact fetch time was unavailable.

### S25 — [Food Corridor inactive-account access](https://help.thefoodcorridor.com/en/articles/1935331-how-do-i-delete-my-account)

The independent verifier reports the 2020 article says clients marked inactive retain access to account information including past invoices and reports. It does not establish downloads or tenant-specific archive scope. Exact fetch time was unavailable.

### S26 — [Food Corridor digital sign-in/sign-out](https://help.thefoodcorridor.com/en/articles/1413890-what-is-digital-sign-in-sign-out)

The independent verifier reports a four-digit PIN assigned to a client account, not individual cleaning-signature identity. Exact fetch time was unavailable.
