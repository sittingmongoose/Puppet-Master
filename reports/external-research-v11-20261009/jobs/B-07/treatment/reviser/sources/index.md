# B-07 / I07 — reviser source index

Bounded paraphrases below summarize public primary-source observations used to adjudicate the research, verifier, and critic packages. Vendor help, feature, and pricing pages are mutable statements, not runtime witnesses or procurement guarantees. IDs R01–R27 are fixed in this reviser package. Earlier source IDs retain their original map and meaning; see the lineage notes below.

The web reader did not expose per-request fetch timestamps. The source-map records three access batches, recorded immediately on completion: R01–R08 at 2026-10-09 21:42:52 UTC; R09–R16 at 21:43:00 UTC; R17–R27 at 21:43:08 UTC. Exact URLs, versions/releases/commits where exposed, locators, batch semantics, and observed operations are in ../source-map.json.

## Scheduling and booking

<a id="r01"></a>

### R01 — [Booking Requests & Approvals | Skedda Support](https://support.skedda.com/en/articles/11774950-booking-requests-approvals)

Article dated July 7, 2026. A request remains pending and is not a scheduler booking until admin approval; multiple conflicting requests may coexist. The approver may edit request details. Only admins edit approved bookings. An Outlook date/time edit after approval deletes the confirmed booking and returns the request to pending. Rules can be scoped by space, user tag, and day; approval is plan-gated. Custom-admin approval rules do not apply to spaces the custom admin manages. These are documented states, not a concurrency test. Locator: overview, submission, admin approval, Outlook sync, FAQs on conflicts, edits, and custom admins.

<a id="r02"></a>

### R02 — [Buffer time | Skedda Support](https://support.skedda.com/en/articles/3653032-buffer-time)

Article dated March 4, 2025. Buffer rules create before-and-after gaps, may vary by space, use venue time granularity, and apply only to bookings made after configuration. Conflicting rules use the maximum duration. Regular users cannot book in buffers; System users can. Fifteen minutes is the smallest described setting. A 30-minute buffer creates 30 minutes before and after; one hour is needed for 30 minutes of setup plus 30 minutes of cleanup. Locator: create rule, user behavior, and FAQs.

<a id="r03"></a>

### R03 — [User Access Levels / Types | Skedda Support](https://support.skedda.com/en/articles/2218760-user-access-levels-types-regular-and-system-users)

Article dated October 13, 2024. The page distinguishes regular users, Booking Admins, System Admins, and Owner. Booking Admins can book for the venue and other users; most configured venue policies do not apply to their bookings. System Admins inherit those powers; Owner has the broadest powers. Locator: System User types and role descriptions.

<a id="r04"></a>

### R04 — [Booking and Visit Data Retention | Skedda Support](https://support.skedda.com/en/articles/5707504-booking-and-visit-data-retention)

Article dated March 4, 2025. New accounts default to one-year retention. Settings range from zero days to seven years, with longer periods dependent on plan support. Plan upgrades/downgrades do not automatically change the configured value; an unsupported extended setting can prevent new bookings/visits. Recurring series deletion follows the last occurrence. Locator: retention setting and FAQ.

<a id="r17"></a>

### R17 — [Access and Visibility | Skedda Support](https://support.skedda.com/en/articles/105728-access-and-visibility)

Article dated April 20, 2026. Private venue access requires login. With no content-visibility rules, regular users see date, time, and space for other bookings but no user information. System users always see holder, title, and custom fields; where multiple rules match, the most generous applies. Locator: venue access and content visibility.

<a id="r18"></a>

### R18 — [Export or print booking data | Skedda Support](https://support.skedda.com/en/articles/105786-export-or-print-booking-data)

Article dated September 8, 2026. List-view reporting/export is described for System users; XLSX/CSV include times, space, title, holder/contact, tags, and custom fields. Regular users lack the described filters/export path. Export/print controls are absent on mobile/tablet-sized devices. Locator: export, fields, regular-user and device FAQs.

<a id="r19"></a>

### R19 — [Skedda Pricing](https://www.skedda.com/pricing)

Mutable live page, no effective date/build. Current U.S./Canada page shows Plus starting at $249/month, priced per space and billed annually. Product, regional price, features, and entitlements can change; this is not a kitchen quote. Locator: U.S./Canada pricing and plan matrix.

<a id="r21"></a>

### R21 — [How do I book in my kitchen? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1413904-how-do-i-book-in-my-kitchen)

Article dated November 21, 2023. A food-business user can request space and equipment, set a distinct equipment time range, view kitchen occupancy/daily schedule, and submit for approval or decline. It does not document concurrent-request serialization or setup/cleanup semantics. Locator: schedule view, booking creation, equipment time, approval.

<a id="r22"></a>

### R22 — [Shared kitchen management software | Spacebring](https://www.spacebring.com/solutions/shared-kitchen-management-software)

Mutable live page, no build/date. Advertises shared-kitchen rooms/equipment, member self-service, room-specific preparation time, rules, and membership approval. It does not define preparation/cleanup semantics, tenant privacy, signoff, archive export, or accessibility conformance. Locator: kitchen booking, equipment, preparation, membership approval.

<a id="r27"></a>

### R27 — [Skedda Launches Booking Approvals](https://www.skedda.com/blog/booking-approvals)

Published January 22, 2026, updated June 29, 2026. Describes request-first approvals and workflow evolution. This is a release/evolution item, not a defect or regression. Locator: publication/update dates, launch workflow, update.

## Tenant data, signoff, export, price

<a id="r05"></a>

### R05 — [What does a food business account look like? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1812934-what-does-a-food-business-account-look-like)

Article dated June 7, 2023. Tenants can view their own space/equipment bookings and a daily snapshot of booked kitchen space/equipment; Reports show booking, invoice, and sign-in/out information. Community allows viewing and messaging fellow clients; the profile includes business/product/public-contact fields. It does not specify other-tenant booking title/name visibility, tenant CSV download, or private-field cross-access. Locator: Bookings, Calendars, Reports, Community, Business Profile.

<a id="r06"></a>

### R06 — [How do I digitally sign-in/out at my kitchen? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1414030-how-do-i-digitally-sign-in-out-at-my-kitchen)

Article dated April 24, 2026. Describes a four-digit PIN on the Bookings tab, use on phone or kitchen station/tablet, clock-in/out, and optional notes to the kitchen about cleanliness, equipment, supplies, or concerns. This documents attendance and concern reporting, not a tenant-defined cleaning-completion attestation or individual signer identity. Locator: PIN, sign-in options, notes.

<a id="r07"></a>

### R07 — [What is Digital Sign-In / Sign-Out? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/1413890-what-is-digital-sign-in-sign-out)

Article dated September 23, 2022. Says a unique four-digit PIN is linked to the client's Food Corridor account. Kitchen staff can view, add, and edit sign-in records. This older page corroborates account-level PIN and attendance workflow, not individual cleaning attestation. Locator: PIN, sign-in methods, administrator reconciliation/edit.

<a id="r08"></a>

### R08 — [What Information is in the Reporting Tab? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab)

Mutable live page displayed as updated over three weeks before the earlier observation; no build/revision date exposed. Kitchen Reporting-tab CSVs are filterable by client/date. All Bookings covers current-year states; other reports include client totals, equipment/space usage, and sign-in activity. It does not establish tenant CSV export or a complete cleaning-signoff/attachment archive. Locator: CSV/filter behavior, All Bookings, usage, sign-in reports.

<a id="r09"></a>

### R09 — [I'm leaving my kitchen — what happens to my account and charges? | The Food Corridor Help Center](https://help.thefoodcorridor.com/en/articles/14695452-i-m-leaving-my-kitchen-what-happens-to-my-account-and-charges)

Article dated April 21, 2026. A business marked inactive keeps access to its account, past invoices, booking history, and reports. Full deletion is separate. It does not define export format, archive completeness, or retention duration. Locator: Inactive versus fully deleted.

<a id="r10"></a>

### R10 — [Pricing | Spacebring](https://www.spacebring.com/pricing)

Mutable live page, no effective date/build. Observed Business display: $178/month, six-month minimum, 100 monthly active users, plus separately priced add-ons. A footnote says displayed local-currency prices are informational and billing currency is Euro. This reconciles a dollar display with an earlier Euro-billed observation; neither is a kitchen quote. Locator: Business plan, active users, add-ons, currency footnote.

<a id="r20"></a>

### R20 — [Pricing | The Food Corridor](https://www.thefoodcorridor.com/pricing/)

Mutable live pricing/feature page, no effective date/build, reopened in the final evidence batch. Numerical cost claims in the final are tied to the earlier immutable research capture research:S06, not treated as a durable current offer. That record notes Starter's five-active-client limit and captured Annual/Professional prices and fee conditions. Locator: U.S. plan/feature/fee sections; compare ../research/source-map.json, S06.

## Governing and technical sources

<a id="r11"></a>

### R11 — [Food Code 2026 | U.S. FDA](https://www.fda.gov/food/fda-food-code/food-code-2026)

FDA describes the 2026 Food Code as a model offered for adoption by local, state, tribal, territorial, and federal jurisdictions, and recognizes equivalent public-health alternatives. The page does not itself enact a local rule. Locator: model status and adoption audience.

<a id="r12"></a>

### R12 — [FDA Food Code 2026 PDF](https://www.fda.gov/media/194741/download)

Versioned 2026 edition, 732-page PDF. The Preface says the model is neither federal law nor regulation, is not preemptive, and is not a federal requirement until adopted for a federal jurisdiction. Adoption may occur by statute, regulation, or ordinance. Annex 3 says the edition adds “commissary”; a commissary supporting food ultimately offered directly to consumers fits the Food Code framework, while operations preparing/distributing to another business entity align with the food-processing-plant definition. The regulatory authority determines suitability and permitting. Locators: Preface introduction/adoption, PDF pages 7–8 and 12; Annex 3, “Food Establishment — commissary,” PDF page 347.

<a id="r13"></a>

### R13 — [Web Content Accessibility Guidelines 2.2 | W3C](https://www.w3.org/TR/WCAG22/)

W3C Recommendation dated December 12, 2024. SC 2.5.7 is Level AA and covers a single-pointer alternative to dragging for covered functionality. SC 2.5.8 is Level AA and sets a 24×24 CSS-pixel pointer target minimum subject to exceptions. These are testable if chosen as an acceptance basis; neither is a wet-hand test. Locator: Success Criteria 2.5.7 and 2.5.8.

<a id="r14"></a>

### R14 — [Understanding SC 2.5.7: Dragging Movements | WAI/W3C](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html)

W3C explanatory document for WCAG 2.2. A single-pointer alternative to covered dragging differs from keyboard accessibility; keyboard access alone does not satisfy the pointer criterion. Locator: criterion text, intent, relation to keyboard.

<a id="r15"></a>

### R15 — [PostgreSQL 18: Range Types](https://www.postgresql.org/docs/18/rangetypes.html)

Versioned PostgreSQL 18 documentation. Built-in tstzrange uses timestamp-with-time-zone values. The two-argument range constructor uses lower-inclusive/upper-exclusive bounds. Section 8.17.10 illustrates EXCLUDE USING GIST with resource equality and range overlap to reject same-resource overlapping rows. This is a documented design mechanism, not an application witness. Locator: §§8.17.1, 8.17.6, and 8.17.10.

<a id="r16"></a>

### R16 — [PostgreSQL 18: Row Security Policies](https://www.postgresql.org/docs/18/ddl-rowsecurity.html)

Versioned PostgreSQL 18 documentation. RLS policies are not present by default; after enabling RLS, no policy means default-deny. Superusers and BYPASSRLS roles bypass RLS; table owners usually bypass unless FORCE ROW LEVEL SECURITY is used. Permissive policies combine with OR by default. Locator: §5.9 defaults, bypass, policy combination.

## Calendar behavior and issue/fix/release chain

<a id="r23"></a>

### R23 — [eventOverlap | FullCalendar Docs](https://fullcalendar.io/docs/eventOverlap)

Current documentation identifies v7.1.1, released October 6, 2026. eventOverlap governs dragged/resized events and defaults to true. It is a UI interaction setting, not a persistent reservation or concurrency constraint. Locator: definition/default and version footer.

<a id="r24"></a>

### R24 — [FullCalendar issue #6393](https://github.com/fullcalendar/fullcalendar/issues/6393)

Issue opened June 23, 2021; reporter describes visually stacked bookings in DayGridDay under FullCalendar 5.8.0 with eventOrderStrict. It was confirmed and assigned milestone v5.9.0. It concerns rendering, not persisted booking overlap. Locator: description, affected version, labels/milestone, closure.

<a id="r25"></a>

### R25 — [FullCalendar fix commit 6acf6b2](https://github.com/fullcalendar/fullcalendar/commit/6acf6b2)

Official repository commit explicitly references issue #6393 and changes segment-hierarchy and event-placement code. This is a rendering fix, not evidence of persistence or reservation conflict behavior. Locator: commit message and changed-file tree.

<a id="r26"></a>

### R26 — [FullCalendar Release v5.9.0](https://github.com/fullcalendar/fullcalendar/releases/tag/v5.9.0)

Tagged release dated July 28, 2021; release commit 620efb5e9c023f229a22af31e10b8b810fa5b2ba. Release notes list the #6393 rendering fix. Locator: release date, fix list, tag commit.

## Immutable lineage references

- Original research IDs S01–S26 remain in ../research/source-map.json and ../research/sources/index.md. Do not reinterpret or overwrite them. research:S21 is the recorded Euro-billing observation. research:S24–S26 have null access-time fields in that original map; those nulls remain null.
- Verifier IDs S01–S11 remain in ../verifier/source-map.json and ../verifier/sources/index.md. Its map is the frozen verification evidence.
- Critic IDs C01–C15 remain in ../critic/source-map.json and ../critic/sources/index.md. critic:C13 is the critic's dollar-display observation.
- Earlier IDs are not merged into or renamed as R IDs. R captures are separate observations with their own metadata in ../source-map.json.

