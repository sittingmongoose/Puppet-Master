# ER11 independent verifier package

Role: fresh independent verifier. No local files read, no delegation, no prior conversation/drafts used. Evidence from public primary sources only via search and fetch.

Access time for all sources below: **2026-10-09 UTC** (all operations in one verification session; tool does not expose per-fetch clock timestamps). Operations per source are listed.

---

## Q1 — P1/P5: Skedda buffers and booking approvals — what interval is reserved at requested / approved / changed, and what roles or exceptions bypass it?

### Observed source statements

**S1 — Buffer behavior**
URL: `https://support.skedda.com/en/articles/3653032-buffer-time`
Version: page states written by Team Skedda, March 4 2025.
Locator: title, intro, “Create a buffer time rule”, “How users see buffer times”, FAQs.
Accessed: 2026-10-09 UTC. Operation: `web_search` for Skedda buffers, then `web_fetch` (200 OK, HTML, truncated processed output).

Observed:

- “Buffer time rules create a gap or break between successive bookings for non-admin users.”
- Purpose examples: teardown, cleaning, setup, changeover; e.g. room/studio staff must reset after each use.
- Rules vary by space; each rule has its own duration; durations offered depend on time-granularity settings.
- “Buffer times will only be applied to any bookings made after the buffer rule is implemented.”
- “If multiple conflicting buffer rules are created for the same space, the maximum of those rules will be used.”
- Buffers shown in light grey around existing bookings; informative error if a user tries to book during a buffer.
- “[System users] can still book over a buffer period. They will see the buffers but they’re not strictly required to respect them.”
- Spaces connected via space sharing propagate buffers; dark grey and light grey times are not bookable by regular users.
- FAQ example: 30-minute buffer; User A 9–10am creates buffers 8:30–9am and 10–10:30am; 10–10:30 reserved for A’s cleanup, 8:30–9 reserved for cleanup of whoever booked immediately before.

**S2 — Buffer launch note (corroboration)**
URL: `https://updates.skedda.com/buffer-time-134373`
Locator: full post body.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, complete).

Observed: same model — non-admin self-service bookings must respect rules; “admins can still book over the top of a buffer period if they wish.” Rules created by venue owner in Settings => Buffer Time. Stated as part of Pro Pack offering at time of post.

**S3 — Roles and bypass**
URL: `https://support.skedda.com/en/articles/2218760-user-access-levels-types-regular-and-system-users`
Version: page states updated Oct 13 2024.
Locator: Regular Users / Booking Admins / System Admins / Owner sections.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- Four types: Regular (non-admin); System Users = Booking Admin, System Admin, Owner.
- Regular users can view/create/update/cancel bookings for themselves “in accordance with” rules/conditions (access/visibility, window, lock-in, conditions, pricing, quota, etc.). Cannot see/manage venue users or system settings. Unlimited count.
- Booking Admins can create/edit/cancel for themselves and on behalf of all other users and the venue; can add/manage Regular Users. “The vast majority of configured policies … do not apply to admins when they create a booking, i.e. admins can create bookings that lie outside hours of availability or that violate booking windows, booking conditions, quota rules etc.”
- System Admins add venue-level settings and Booking Admin management; Owner can do everything including managing System Admins/Owner.

**S4 — Booking conditions default-allow and admin exemption**
URL: `https://support.skedda.com/en/articles/112700-booking-conditions`
Version: page states March 4 2025.
Locator: intro, “What is a booking condition”, “Create a booking condition”.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- “Booking conditions can be set up to deny certain bookings. Skedda will allow all bookings by default unless a rule/setting (condition, quota, hours of availability, etc.) denies it.”
- “Booking conditions do not apply to System users. They can break your rules and book at any time, for anyone, irrespective of your settings, hours of availability, and booking conditions.”
- Conditions add to other rules; violating any rule yields informative message.

**S5 — Booking approvals launch**
URL: `https://updates.skedda.com/introducing-booking-approvals-330115`
Locator: full post body.
Accessed: 2026-10-09 UTC. Operation: `web_search` for Skedda approval, then `web_fetch` (200 OK, complete).

Observed:

- “Users simply submit a booking request which the admins can then review in a dedicated list, approve or reject them, and include a note explaining the decision.”
- “Bookings are only created once approved, making it easier to manage demand and resolve conflicts fairly.”
- Links to S6 for mechanics.

**S6 — Booking Requests & Approvals support article**
URL: `https://support.skedda.com/en/articles/11774950-booking-requests-approvals`
Version: page states written July 7 2026.
Locator: Overview, Key features, Plan Requirement, “What users see”, “Submitting a booking request” (processed output truncated after this point).
Accessed: 2026-10-09 UTC. Operation: followed link from S5, then `web_fetch` (200 OK, truncated).

Observed:

- “Booking Approvals lets venues control bookings by requiring admin review before the booking is confirmed. Instead of creating a booking immediately, users submit a booking request, which remains pending until an admin approves or rejects it.”
- Customizable rules: which spaces require approval; target user groups via tags; limit to days of week.
- Centralized admin page; automated email notification on approve/reject.
- Plan gate: Premier (Skedda) / Advanced (AllBooked).
- Spaces requiring approval show stamp icon; day-scoped rules show stamp only on covered days.
- “Submitting a booking request works exactly how you would make a booking, except that at the end of it, a booking is not immediately created.” Button says Request, not Book.

**S7 — Approval day-scoping and auto-path**
URL: `https://updates.skedda.com/` (changelog index)
Locator: approval-rules excerpt returned by search.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated; excerpt relied on search snippet).

Observed snippet: “Trigger approval rules only when you need them, like on your busiest office days” / “Bookings on the other days go straight through, no admin review and approval needed” / configure in approval rule settings by days and spaces.

**S8 — Approvals recency and sync gap closure**
URL: `https://www.skedda.com/blog/may-2026-product-roundup`
Locator: “Booking Approvals: Microsoft Two-Way Sync Support” excerpt.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed snippet: “Booking Approvals launched earlier this year and quickly became one of our most-used features”; prior gap for Outlook two-way-synced spaces addressed in May 2026 update.

**S9 — Marketing rules-engine claim**
URL: `https://www.skedda.com/platform/meeting-room-booking-system`
Locator: rules-engine paragraph.
Accessed: 2026-10-09 UTC. Operation: `web_search` (snippet only; no fetch relied on).

Observed snippet: granular access controls; quotas, advance windows, “require approval workflows for high-demand spaces”; “All of these rules run automatically on every booking.”

### Inference

- Requested/pending: no booking exists yet, so no resource interval is reserved and no buffer is enforced yet. Multiple pending requests for overlapping times can coexist for admin to choose among. Basis: S5 “only created once approved” + S6 “instead of creating a booking immediately … remains pending.”
- Approved: the confirmed booking interval is reserved plus its surrounding buffer intervals against later non-admin bookings. Basis: S1 buffer model + S1/S2 admin-only override.
- Changed: likely re-validated as a new booking attempt for regular users (S3 “in accordance with rules”), with buffers re-applied; admin changes bypass. This is inference only; see unresolved.

### Uncertainty / cannot be established from retrieved sources

1. Whether pending requests are visible to other requesters as soft holds, or fully invisible until approval. No statement found.
2. Buffer arithmetic edge cases: whether back-to-back buffers stack or overlap; exact behavior when a changed booking moves into another booking’s buffer. Only the FAQ 30-minute symmetric example and max-wins rule were observed.
3. What happens at “changed” under approvals: whether an edit to a confirmed booking takes immediate effect, creates a new pending change request, or holds the original interval during review. No statement found in retrieved portions.
4. Whether admins are also subject to approval rules when booking for themselves or on behalf of users. Bypass is explicit for buffers/conditions/quotas/windows (S1/S3/S4) but not explicitly stated for approvals in retrieved portions.
5. Whether pending requests themselves are buffer-checked at submit time against confirmed bookings. Plausible but not stated.

### Q1 conclusion

Current Skedda model as observed: request-first on configured spaces/groups/days; pending requests reserve nothing; approval creates the booking and its buffers; regular users are blocked from booking intervals and buffer gaps; Booking Admin / System Admin / Owner can book over buffers and outside most policies; pre-rule bookings are exempt; conflicting buffer rules resolve to the maximum; unconfigured spaces/days/groups go straight through without review. Change-state hold semantics and pending-visibility semantics could not be established.

---

## Q2 — P2/P3: Food Corridor — what one food-business account sees about other tenants, and what own-year booking / equipment / signoff records it can export, including when inactive

### Observed source statements

**F1 — Food-business account overview**
URL: `https://help.thefoodcorridor.com/en/articles/1812934-what-does-a-food-business-account-look-like`
Version: page states written June 7 2023.
Locator: Bookings, Calendars, Billing, Documents, Reports, Community sections.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- Bookings tab: “view all their submitted, approved, declined, and cancelled space and equipment bookings”; view, edit, cancel own bookings. Pre-paid plan shows hours booked vs paid. Unique 4-digit PIN and Sign-In Sheet link on this tab.
- Calendars tab: “view their kitchen’s spaces and create new bookings”; “click on the Daily View to see a snapshot of what space and equipment is booked on any given day.”
- Reports tab: “view automatically generated reports … helpful for their business and record keeping … include information on their bookings, invoices, and sign-in/out data.”
- Documents tab: add private docs and shared client-kitchen docs; see kitchen common docs.
- Community tab: “view and message fellow clients in their kitchen … connect … learn more … refer potential customers.”

**F2 — How to book / calendar visibility**
URL: `https://help.thefoodcorridor.com/en/articles/1413904-how-do-i-book-in-my-kitchen`
Version: page states Nov 21 2023.
Locator: “Create a Booking” steps.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- Log in, go to Calendars tab; “Click the calendar names to view the descriptions and current approved bookings for that kitchen space, if needed. You can also see all approved bookings for the whole kitchen in the Daily View.”
- Booking by drag-and-drop / Create New Booking; equipment can be added, including additional equipment with a different reservation time and changing equipment reserved time (video headings in processed output).

**F3 — Kitchen-side tabs (contrast)**
URL: `https://help.thefoodcorridor.com/en/articles/1413937-what-is-the-function-of-each-tab`
Version: page states updated ~3 weeks before fetch.
Locator: Scheduling, Clients, Reporting, Kitchen Settings sections.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- Scheduling tab Submitted Bookings: lists bookings submitted by active clients requesting space-calendar time; kitchen can Approve/Decline, message client, view request on calendar.
- Show Calendars dropdown for space and reservable equipment calendars; Equipment calendar for client reservations; Daily View shows all spaces/equipment booked any day.
- Clients tab: all associated food businesses; “View inactive clients by checking Show Inactive”; per-client General settings include billing plan, booking approval setting, Custom Report Fields, payment processing, notes; Statement, Fees/Credits, Storage, Documents sections.
- Reporting tab: “view and download reports for payments, bookings, storage, clients, and sign-in”; QuickBooks Online export for payments.

**F4 — Reporting detail**
URL: `https://help.thefoodcorridor.com/en/articles/2322739-what-information-is-in-the-reporting-tab`
Version: page states updated ~3 weeks before fetch; older search snippet dated 2019 showed prior revision.
Locator: dashboard metrics, “What Reports are Available”, Payments/Bookings/Storage/Clients/Sign-In sections (processed output truncated).
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- Kitchen Reporting Dashboard snapshot: revenue, client activity, bookings, storage, etc.
- Auto-generated real-time reports for Payments, Bookings, Storage, Clients, Sign-In activity; “view these reports in the app, or download them as CSV files”; filter by client or date range; downloads follow filters.
- Older snippet for same article ID: “All Bookings: This report shows all past and future bookings created for the current year. It includes all billed, approved, declined, canceled, and deleted bookings.” Current revision’s corresponding table was beyond truncation; year-scope wording for current revision not confirmed in retrieved portion.

**F5 — Inactive access**
URL: `https://help.thefoodcorridor.com/en/articles/1935331-how-do-i-delete-my-account`
Version: page states June 22 2020.
Locator: “If you left the kitchen but want to keep your account” section.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, complete).

Observed verbatim in substance: ask kitchen to make client status “inactive”; that removes them as home kitchen; “You will still have access to your account information, including your past invoices and reports.” Separate path for leaving Food Corridor entirely requires emailing support to deactivate.

**F6 — Edit / approval / change states**
URL: `https://help.thefoodcorridor.com/en/articles/1524649-can-a-food-business-edit-their-bookings`
Version: page states March 28 2023.
Locator: Update vs Request Change, Limitations, approval-setting path.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed:

- Edit path: Bookings tab > pencil icon > Update Booking (Auto Approve ON: saves automatically) or Request Change (Auto Approve OFF: requires kitchen approval).
- Kitchen reviews change request from Scheduling tab; approve replaces current booking; decline leaves current booking as-is; client notified.
- Limitations: before cancellation window can modify/move/extend/shorten + equipment; inside window can extend + add equipment only (cannot shorten/remove/change date); same day after booking can move/increase/add; beyond that day cannot modify. Can always cancel before start, possible fee inside policy window.
- Approval toggle: Clients tab > Client name > General > Settings > Edit > Auto Approve On/Off > Save.

**F7 — Sign-in/out mechanics and billing basis**
URLs:
`https://help.thefoodcorridor.com/en/articles/1414030-how-do-i-digitally-sign-in-out-at-my-kitchen` and `https://help.thefoodcorridor.com/en/articles/1413890-what-is-digital-sign-in-sign-out`
Locator: PIN location, two sign-in ways, reconciliation reports (via search snippets + partial fetch).
Accessed: 2026-10-09 UTC. Operation: `web_search` (snippets).

Observed snippets:

- 4-digit PIN at top of Bookings tab; sign in on phone or at kitchen station at `https://app.thefoodcorridor.com/tfc_signin`.
- “The invoices pull from the booking time on the calendar, and not from the Signin/Signout data.”
- Kitchen reconciles via Reports Tab > Signin: Signin Reconciliation (last 45 days, matches who signed in / who booking was for / date) or Hours Used vs Hours Booked.

**F8 — Cleaning procedures as documents, not signoff records**
URL: `https://help.thefoodcorridor.com/en/articles/1413932-add-kitchen-and-client-documents`
Locator: kitchen-documents examples (via search snippet).
Accessed: 2026-10-09 UTC. Operation: `web_search` (snippet only).

Observed snippet: kitchen may share “cleaning schedules and procedures, kitchen maps, equipment usage instructions … policy and procedure manuals” as visible-to-all-clients documents.

No Food Corridor cleaning-signoff log/record/export feature was found in retrieved help-center results; toolkit/blog results discuss cleaning requirements, logs, operations-manual forms, and regulatory-compliance recordkeeping as kitchen practices, not as platform report types.

### Inference

- Other-tenant scheduling existence is visible (approved bookings by space + whole-kitchen Daily View) to support self-booking without collisions.
- Own-record scope is bookings (space + equipment together) + invoices + sign-in/out data. Equipment is part of booking records, not a separate tenant procedure log in observed sources.
- Inactive former clients retain backward-looking access (past invoices/reports) but lose home-kitchen booking context.

### Uncertainty / cannot be established from retrieved sources

1. Whether Daily View / per-space approved bookings show other businesses’ names/details or only blocked time. Field-level visibility not stated.
2. Whether a food business sees other tenants’ submitted-but-unapproved requests, declined/cancelled bookings, billing, sign-in times, volumes, recipes, or customers. Only own submitted/approved/declined/cancelled and others’ approved bookings are stated.
3. Whether the food-business Reports tab supports download/export (CSV/PDF) or date-range/year filtering. “View” is stated for food businesses; “view and download … as CSV” + client/date filters are stated only for the kitchen Reporting tab. Year-end self-export format for a tenant therefore cannot be confirmed.
4. Year scope of tenant-visible reports. “Current year” scope appears only in the older kitchen All Bookings snippet; tenant-side scope not stated.
5. Whether inactive accounts retain Calendars/Daily View/Community access. Only “account information, including past invoices and reports” is confirmed.
6. Any equipment-use or cleaning-signoff record type exportable by a tenant. Equipment reservations are observed; sign-in/out is observed; cleaning signoff is not observed as a platform record.

### Q2 conclusion

One food-business account can: see and manage its own submitted/approved/declined/cancelled space + equipment bookings; see current approved bookings per space and all approved bookings whole-kitchen in Daily View for scheduling; view fellow clients and message them via Community; view own bookings/invoices/sign-in-out reports; and after inactive status keep past invoices/reports. It cannot be established that it sees who holds other bookings beyond timing/space, that it can download its own year as CSV/PDF, or that any cleaning-signoff record exists to export. Billing is booking-time based, not sign-in-time based.

---

## Q3 — P3/P6: FDA Food Code 2026 — Code status and role of adoption by the applicable jurisdiction

### Observed source statements (primary)

**D1 — Food Code 2026 landing page**
URL: `https://www.fda.gov/food/fda-food-code/food-code-2026`
Locator: page header/nav; body beyond truncation not relied on.
Accessed: 2026-10-09 UTC. Operation: `web_search`, then `web_fetch` (200 OK, truncated).

Observed: confirms FDA publishes a 2026 edition under FDA Food Code with prior editions (2022/2017/2013/2009/2005/2001/1999/1997) listed. Preface wording not captured in retrieved portion.

**D2 — FDA Food Code hub**
URL: `https://www.fda.gov/food/retail-food-protection/fda-food-code`
Locator: hub header/nav; body beyond truncation not relied on.
Accessed: 2026-10-09 UTC. Operation: `web_fetch` (200 OK, truncated).

Observed: confirms hub structure; detailed status language relied on via D4–D5 snippets below rather than this truncated body.

**D3 — 2026 PDF existence**
URL: `https://www.fda.gov/media/194741/download?attachment`
Locator: binary response headers.
Accessed: 2026-10-09 UTC. Operation: `web_search` for 2026 PDF, then `web_fetch` (200 OK, `application/pdf`, 5,215,431 bytes; tool reports binary cannot be summarized).

Observed: official PDF exists at this FDA media URL. Preface text not inspected (binary + no-local-file constraint).

**D4 — FDA model-code doctrine (official page text via search)**
URL: `https://www.fda.gov/Food/GuidanceRegulation/RetailFoodProtection/FoodCode` (also surfaced as HFP constituent update “FDA Releases Decoding the Food Code”)
Locator: Food Code description paragraph.
Accessed: 2026-10-09 UTC. Operation: `web_search` (snippets).

Observed official wording in substance: “FDA publishes the Food Code, a model that assists food control jurisdictions at all levels of government by providing them with a scientifically sound technical and legal basis for regulating the retail and food service segment” (restaurants, grocery stores, institutions such as nursing homes); “Local, state, tribal, and federal regulators use the FDA Food Code as a model to develop or update their own food safety rules and to be consistent with national food regulatory policy.”

**D5 — FDA 2026 priority deliverables (official)**
URL: `https://www.fda.gov/about-fda/human-foods-program/human-foods-program-2026-priority-deliverables`
Locator: “Food Code and Retail Program Standards” bullet.
Accessed: 2026-10-09 UTC. Operation: `web_search` (snippet).

Observed in substance: “FDA will release an updated Food Code in 2026, providing all levels of government with a scientifically sound technical and legal basis for regulating the retail and food service industries”; regulators use it as a model to update own rules and provide national consistency.

**D6 — FDA constituent update stating non-mandatory + widespread adoption (official; 2022 Code, same doctrine)**
URL: `https://www.fda.gov/food/hfp-constituent-updates/new-fda-food-code-reduces-barriers-food-donations`
Version: dated Feb 14 2023.
Locator: Food Code description paragraph (via search snippet; fetch body truncated before this paragraph).
Accessed: 2026-10-09 UTC. Operation: `web_search` + `web_fetch` (200 OK, truncated).

Observed official wording in substance: Code “represents FDA’s best advice for a uniform system of provisions that address the safety and protection of food offered at retail and in food service”; “while it is a model code that is not required, it has been widely adopted by state, local, tribal and territorial agencies” regulating 1M+ restaurants, retail stores, vending, and foodservice in schools/hospitals/nursing homes/childcare.

### Corroborating secondary quotations of FDA 2026 release (not primary; labeled)

Accessed 2026-10-09 UTC via `web_search` snippets:

- `https://www.food-safety.com/articles/11843-fda-releases-2026-food-code-with-updates-on-food-defense-employee-illness-food-safety-management` — quotes 2026 Code as “FDA’s recommendations for a uniform system of provisions intended to safeguard public health and ensure … safe, unadulterated, honestly presented”; “offered for adoption by local, state, tribal, territorial, and federal jurisdictions with regulatory responsibility for foodservice, retail food stores, and food vending operations”; “does not establish a single nationwide retail food safety code”; jurisdictions use model to develop/update own requirements; complete Code on four-year cycle with possible supplements.
- `https://foodsafetytech.com/news_article/the-fda-releases-2026-food-code/` and `https://cheesereporter.com/news/policy-legislation/2026/09/18/fda-releases-2026-edition-of-fda-food-code/` — same Sept 17 2026 issuance; “model of uniform provisions to assist local, state, tribal, and territorial regulators”; “model code that is not required … widely adopted.”
- `https://www.mofo.com/resources/insights/261008-fda-releases-2026-food-code` — “not itself federal law”; authorities “may adopt all or portions … meaning timing and substance … vary by jurisdiction.”
- `https://smartfoodsafe.com/fda-food-code-updates/` — “does not automatically become a legal requirement … apply only when a state, local, tribal, territorial, or federal authority adopts them.”

### Inference

The 2026 edition continues the longstanding Food Code doctrine observed on FDA’s own pages: model/best-advice status; legal effect only through adoption by the jurisdiction with compliance responsibility; adoption may be whole, by reference, or modified; FDA’s role is technical/legal basis + consistency, applied to retail/foodservice (not manufacturing, per secondary scope notes).

### Uncertainty / cannot be established from retrieved sources

1. Exact 2026 Preface wording (often cited as Preface p. iii: “This model is offered for adoption by … for administration by the various departments, agencies, bureaus, divisions, and other units within each jurisdiction that have been delegated compliance responsibilities … Alternatives that offer an equivalent level of public health protection … are recognized”). This wording is observed in 2022 full-document PDFs via search snippets but the 2026 PDF bytes were not text-inspected under this task’s no-local-file constraint, so verbatim 2026 preface cannot be confirmed here.
2. Precise 2026 jurisdiction list (whether FDA’s 2026 preface says “local, state, and federal” vs “local, state, tribal, territorial, and federal” vs including District of Columbia). Official snippets vary by page vintage; secondary 2026 quotations include tribal/territorial/federal but are not the preface itself.
3. Update cadence: biennial vs four-year-plus-supplements. Secondary sources disagree; FDA primary cadence statement for 2026 not captured in retrieved portions.
4. No 2026 preface language about shared commercial kitchens, tenant-defined cleaning signoffs, or equipment procedure models was observed; the question asks only about Code status/adoption, and no such tenant-procedure content should be inferred from adoption doctrine.

### Q3 conclusion

As FDA describes it on its own pages: the Food Code is a model — FDA’s best advice / recommendations for a uniform system of provisions — not itself a federal requirement or single nationwide code. It provides a scientifically sound technical and legal basis that assists jurisdictions at all levels. The applicable local/state/tribal/territorial/federal authority with delegated retail/foodservice compliance responsibility decides whether, when, and how to adopt it into its own statutes/codes/ordinances (in whole or modified), and only that adoption creates enforceable requirements; FDA encourages adoption to promote consistency. Verbatim 2026 Preface text and exact jurisdiction enumeration were not directly verified in this pass.

---

## Cross-question unresolved list

- Skedda: pending-request visibility, change-request hold semantics, admin exemption from approval rules, buffer stacking/overlap math.
- Food Corridor: other-tenant identity fields in Daily View; tenant-side download formats/filters/year scope; post-inactive calendar access; existence of any cleaning-signoff record.
- FDA 2026: verbatim preface; exact jurisdiction list; cadence; any link from Code adoption doctrine to tenant-defined kitchen procedures (none observed; do not infer).

## Sources index (all accessed 2026-10-09 UTC)

Skedda: S1–S9 above. Food Corridor: F1–F8 above. FDA: D1–D6 above plus labeled secondary 2026-release quotations. No committed code, no runtime checks, no file writes; all conclusions above separate observed statements from inference and unresolved items.
