# B-07 critic — independent evidence index

These bounded notes record primary public-source observations made for the critic stage. They do not establish runtime behavior or procurement promises. Mutable vendor pages are recorded as viewed and should be rechecked with a dated quote/demo. IDs C01–C15 are new critic-stage IDs and do not reassign predecessor IDs S01–S26.

## Scheduling and booking behavior

### C01 — [Booking Requests & Approvals | Skedda Support](https://support.skedda.com/en/articles/11774950-booking-requests-approvals)

Pending requests are not bookings on the scheduler until approved. The article says conflicting requests do not block one another; admins choose which to approve. Approval is plan-gated. Custom admins are not subject to approval rules for spaces they manage. A date/time edit from Outlook can delete a confirmed booking and return the request to pending. These are vendor-described rules, not a concurrency test. Locator: overview and plan note; submission; FAQ on conflicting requests and custom-admin exception; Microsoft-sync edit behavior.

### C02 — [Buffer time | Skedda Support](https://support.skedda.com/en/articles/3653032-buffer-time)

Buffer rules create before/after gaps, vary by space, use platform time granularity, and affect only bookings made after the rule is implemented. Conflicting same-space rules use the maximum duration. System users can book across buffers; regular users cannot. The help article says the buffer is symmetric and gives an hour buffer for 30 minutes of setup plus 30 minutes of cleanup. Locator: create-rule, user behavior, and FAQ sections.

### C09 — [PostgreSQL 18: Range Types](https://www.postgresql.org/docs/18/rangetypes.html)

Versioned official docs describe two-argument constructors as lower-inclusive/upper-exclusive `[)` and illustrate exclusion constraints with the range overlap operator to prevent overlapping same-resource rows. This is a design mechanism only. It does not validate an application's resource model, row completeness, transaction flow, role exceptions, or production behavior. Locator: §§8.17.3, 8.17.6, 8.17.10.

### C10 — [eventOverlap | FullCalendar Docs](https://fullcalendar.io/docs/eventOverlap)

The current page describes whether events being dragged/resized may overlap and gives `true` as the default. It is a browser interaction setting, not a persistent reservation or concurrency control. Locator: definition and default value; current footer identifies v7.1.1 (October 6, 2026).

### C11 — [FullCalendar issue #6393](https://github.com/fullcalendar/fullcalendar/issues/6393)

The issue reports visual event stacking in DayGridDay with `eventOrderStrict:true` on FullCalendar 5.8.0, was labeled confirmed, and received milestone v5.9.0. It concerns rendering, not persisted booking conflict. Locator: title/description and issue labels/milestone.

### C12 — [FullCalendar fix commit 6acf6b2](https://github.com/fullcalendar/fullcalendar/commit/6acf6b2)

The official repository commit message explicitly references #6393 and changes `packages/common/src/seg-hierarchy.ts` and `packages/daygrid/src/event-placement.ts`. It is a UI-rendering fix. Commit identifier in the URL is the immutable short SHA `6acf6b2`; do not infer database or reservation behavior. Locator: commit header and changed-file tree.

## Tenant visibility, signoff, and export

### C03 — [Food business account | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1812934-what-does-a-food-business-account-look-like)

The public account guide says tenants can view their own space/equipment bookings and the kitchen Daily View, see reports for bookings/invoices/sign-in/out, and use the Community tab to view/message fellow clients. It lists profile fields such as business name, description, category, products, business stage, social links, and public contact details. It says additional email addresses may be added for users but one password is used for the Food Corridor account. This creates a profile/account-sharing path to test; it does not prove exposure of the brief's protected recipe/customer/volume fields. Article date: June 7, 2023. Locator: Bookings, Calendars, Reporting, Community, Business Profile, and My Account sections.

### C04 — [Digital Sign-In / Sign-Out | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1413890-what-is-digital-sign-in-sign-out)

The account-level PIN is four digits and associated with the client account. The workflow reconciles booked and used hours; the kitchen can view/add/edit sign-in entries. It supports an attendance workflow, not proof of individual cleaning attestation or immutability. Article date: September 23, 2022. Locator: PIN and entry methods; kitchen reconciliation and editing sections.

### C05 — [Reporting Tab | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab)

The current public article says reports can be viewed/downloaded as CSV and filtered by client/date; “All Bookings” contains past/future bookings for the current year and booking status/client/created-at data. Other listed report classes include payment, client, and sign-in activity. This page does not document export completeness for tenant-authored equipment-cleaning attestations/attachments, nor guarantee a full archival package. Article displayed “updated over 3 weeks ago” at access. Locator: download/filter description; All Bookings table; sign-in reports.

### C06 — [Inactive Food Corridor account | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1935331-how-do-i-delete-my-account)

For a client marked inactive after leaving a kitchen, the 2020 help article says account information, including past invoices and reports, remains accessible. This does not specify how long, what records/attachments are included, or whether a complete annual export is downloadable. Article date: June 22, 2020. Locator: “left the kitchen but want to keep your account” section.

### C14 — [Booking and Visit Data Retention | Skedda Support](https://support.skedda.com/en/articles/5707504-booking-and-visit-data-retention)

The article states the default for new accounts is one-year retention; account options span up to seven years; plan support affects longer periods; plan upgrades/downgrades do not reset the configured period; unsupported extended retention can prevent new bookings/visits; deletion may process in batches. Locator: period setting, plan qualification, and recurring-booking FAQ. Article dated March 4, 2025.

### C15 — [How do I book in my kitchen? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1413904-how-do-i-book-in-my-kitchen)

A food-business user can see approved bookings for their kitchen space and whole-kitchen Daily View, request space and equipment for distinct time ranges, choose recurring bookings, and submit for kitchen approval/decline. The article does not define concurrent-request serialization or setup/cleanup semantics. Article date: November 21, 2023. Locator: schedule visibility, create booking, equipment ranges, and approval sections.

## Governing and product-state references

### C07 — [Food Code 2026 | U.S. FDA](https://www.fda.gov/food/fda-food-code/food-code-2026)

FDA describes the Food Code as a model offered for adoption by governmental jurisdictions. The brief gives no location or adopted code, so this page cannot identify the governing local requirements. Locator: model description and adoption statement.

### C08 — [Web Content Accessibility Guidelines (WCAG) 2.2 | W3C](https://www.w3.org/TR/WCAG22/)

The Recommendation states SC 2.5.7 (Level AA): functionality that uses dragging can be achieved with a single pointer without dragging unless an exception applies. SC 2.5.8 (Level AA) sets 24×24 CSS-pixel pointer targets subject to listed exceptions. These criteria can support a chosen web acceptance standard; they are not a wet-hand test or proof of screen-reader task completion. Locator: §§2.5.7 and 2.5.8.

### C13 — [Pricing | Spacebring](https://www.spacebring.com/pricing)

The live page rendered USD in this access: Business at $178/month, a six-month minimum commitment, 100 monthly active users included, and separately priced member-app/API add-ons. The predecessor source report says euro-billed. Currency can be regional or page-state dependent; this critic capture is not a kitchen quote and does not prove which currency/plan applies to the target customer. Locator: Business plan and add-on sections.

## Access metadata

All C01–C15 pages were opened through the available public web reader in one source-review batch beginning **2026-10-09 21:32:52 UTC**. The reader exposed current page contents but not per-page fetch subsecond timestamps; the batch timestamp is therefore used for each item in the critic `source-map.json`. Exact accessed URL, date/release/commit when stated, locator, and observed action are recorded there. No downloads, accounts, or vendor interaction were used.
