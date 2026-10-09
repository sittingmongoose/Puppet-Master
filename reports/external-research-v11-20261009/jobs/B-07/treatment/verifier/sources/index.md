# Independent source index and bounded evidence

This index records the primary sources used for the verifier work. Page text was opened again in one final read batch completed at 2026-10-09 21:35:34 UTC; the pages were opened between 21:35:32 and 21:35:34 UTC. The source map records exact URLs, version/date information, locators, and observed access operations. Vendor help pages expose no source commit identifiers.

All notes below are paraphrases of the cited pages. Locators are section names and web-extraction line numbers; they identify the observed page passages, not permanent line anchors. Source IDs are fixed in source-map.json.

## S01 — Skedda, Booking Requests & Approvals

[Official support article](https://support.skedda.com/en/articles/11774950-booking-requests-approvals)

Published July 7, 2026. Relevant evidence: “Submitting a booking request” (lines 43–59) says submission does not immediately create a confirmed booking and does not show on the scheduler. “Manage booking requests as an admin” (lines 76–88) says an approver may review and change request details before approving. FAQs (lines 124–145) state that only confirmed bookings appear on the scheduler, conflicting requests do not block each other, only admins can edit approved bookings, and approval rules do not apply to custom admins for spaces they manage. Rules can target spaces, user tags, and days (lines 64–72). Booking approvals are listed as available on Skedda Premier and AllBooked Advanced (lines 29–31). See source-map.json S01 for the exact retrieval locators.

## S02 — Skedda, Buffer time

[Official support article](https://support.skedda.com/en/articles/3653032-buffer-time)

Published March 4, 2025. Relevant evidence: rules may vary by space and use the venue's time granularity; they affect bookings made after rule implementation; if rules conflict, the maximum applies (lines 27–33). Buffers are shown around bookings and regular users cannot book during them, while System users may book through them (lines 34–39). The examples establish a symmetric before-and-after gap: a 30-minute buffer around a 09:00–10:00 booking leaves 08:30–09:00 and 10:00–10:30 unavailable to regular users. Buffers may overlap each other (lines 47–52). The feature describes gaps between bookings; it does not assign a buffer to a separately named tenant setup or cleaning activity.

## S03 — Skedda, User Access Levels / Types

[Official support article](https://support.skedda.com/en/articles/2218760-user-access-levels-types-regular-and-system-users)

Published October 13, 2024. Relevant evidence: Skedda identifies Regular Users and the System User types Booking Admin, System Admin, and Owner (lines 19–32). Booking Admins can create and edit bookings for the venue and other users; most configured venue policies do not apply to them when they create bookings (lines 44–49). System Admins inherit Booking Admin powers, and the Owner has the broadest permissions (lines 52–61).

## S04 — Skedda, feature release/evolution

[Official Skedda launch/update article](https://www.skedda.com/blog/booking-approvals)

Published January 22, 2026; updated June 29, 2026. The launch article describes a request-first approval workflow and non-blocking competing requests (lines 17–23, 40–47). The June update notes Outlook two-way sync support and approval notes as live (lines 68–74). Together with S01's July 7, 2026 support article, this is a documented feature-release/evolution chain. It is not evidence of a defect or regression.

## S05 — The Food Corridor, food-business account

[Official Help Center article](https://help.thefoodcorridor.com/en/articles/1812934-what-does-a-food-business-account-look-like)

Dated June 7, 2023. Relevant evidence: a food business can view its own submitted, approved, declined, and cancelled space and equipment bookings (lines 20–23); it can view kitchen spaces and a daily snapshot of booked spaces and equipment (lines 24–27); its Reports tab presents reports about its bookings, invoices, and sign-in/out data (lines 40–42); and it can view and message fellow clients in its Community tab (lines 44–46). The page does not specify whether another tenant's name, booking title, production amount, or other details appear in the calendar, nor whether a tenant can download its Reports-tab data.

## S06 — The Food Corridor, client account as read-only access

[Official Help Center article](https://help.thefoodcorridor.com/en/articles/1530570-can-a-kitchen-admin-have-view-only-permissions)

Dated May 20, 2020. The example says a food-business client account can view the kitchen calendars and the active-client list in Community (lines 27–31). The article is old; treat it as corroborating role information, not as proof of every current screen or field. It also distinguishes reports sent by a kitchen operator from what a client account can see directly.

## S07 — The Food Corridor, food-business sign-in/out

[Official Help Center article](https://help.thefoodcorridor.com/en/articles/1414030-how-do-i-digitally-sign-in-out-at-my-kitchen)

Dated April 24, 2026. Relevant evidence: a food business uses a four-digit PIN to clock in and out through Bookings or a kitchen sign-in station (lines 29–46). It may leave the kitchen administrator notes about cleanliness, equipment problems, supplies, or other concerns (lines 47–57). This describes attendance and issue notes; it does not establish a cleaning-completion attestation or tenant-defined sanitation signoff.

## S08 — The Food Corridor, inactive account retention

[Official Help Center article](https://help.thefoodcorridor.com/en/articles/14695452-i-m-leaving-my-kitchen-what-happens-to-my-account-and-charges)

Dated April 21, 2026. The article distinguishes a kitchen-marked inactive account from full deletion. An inactive food business remains able to access its account, past invoices, booking history, and reports (lines 41–48). It does not state that inactive users gain CSV export, or that a fully deleted account retains tenant access.

## S09 — The Food Corridor, kitchen Reporting-tab exports

[Official Help Center article](https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab)

The page showed “Updated over 3 weeks ago” when accessed; no exact revision date or software version is exposed. It describes a kitchen Reporting dashboard and says its reports are downloadable as CSVs and filterable by client/date range (lines 18–51). Its All Bookings report covers the current year and includes approved, billed, declined, cancelled, and deleted bookings with a “Booked For” client and creation timestamp (lines 65–72). A separate trend report combines space and equipment hours. Sign-in reports list client clock-in/out times (lines 82–89). These are operator Reporting-tab capabilities; the source does not say a tenant role receives this CSV export capability.

## S10 — FDA, Food Code 2026 landing page

[Official FDA Food Code 2026 page](https://www.fda.gov/food/fda-food-code/food-code-2026)

Edition: 2026. Relevant evidence: the Food Code is described as a model and FDA's best advice for retail and food-service provisions; FDA offers it for adoption by local, state, tribal, territorial, and federal jurisdictions, and recognizes alternatives that provide equivalent public-health protection (page lines 71–84). FDA encourages adoption; this language does not itself enact the code in a jurisdiction.

## S11 — FDA, Food Code 2026 PDF

[Official FDA PDF](https://www.fda.gov/media/194741/download)

Edition: FDA Food Code 2026, 732-page PDF. Relevant evidence: Preface, “Introduction” (PDF pages 7–8; extraction lines 158–180), says the model code is neither federal law nor regulation and is not preemptive; it is not a federal requirement until adopted by federal bodies for federal jurisdictions, and state, territorial, local, and tribal authorities have primary responsibility for retail-level regulation. Preface §7 “Code Adoption/Certified Copies” (PDF page 12; lines 350–369) describes adoption through statutes, regulations, or ordinances and allows modifications for existing law, procedure, or policy. Annex 3, “Food Establishment — commissary” (PDF pages 347–348; lines 23737–23775) says the 2026 edition adds commissary to the definition, describes a commissary that supports food sold directly to consumers as within the Food Code framework, distinguishes food processing plants distributing to another business, and leaves facility suitability and permitting to the regulatory authority.

## Evidence limits

No Skedda or Food Corridor account was logged into, no live app behavior was executed, and no kitchen jurisdiction was provided. Therefore field-level tenant-calendar visibility, Food Business CSV export, exact retention/export of equipment records, and cleaning-signoff support remain unverified. The report proposes discriminating checks rather than inferring impossibility from missing public documentation.
