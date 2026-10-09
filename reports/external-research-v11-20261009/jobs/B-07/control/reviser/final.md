# I07 reviser final — plan comparison and recommendations

**Status:** complete reviser deliverable for ER11 B-07/control/I07/M15. It is a conditional research recommendation, not a product selection, procurement authorization, implementation, or assurance claim.

**Scope and frozen inputs:** the exact I07 brief, exact revealed P1–P6 plan, research draft and discovery, both declared critiques, and their primary-source maps/evidence were read. The source map hashes the authorized inputs. Discovery remains frozen. No undeclared parent, other arm/counterpart, evaluator, campaign, or history material was read.

**Execution boundary:** source inspections were read-only. No live account, trial, software, source code execution, deployment, export, accessibility session, concurrency witness, or human validation was run. Every validation below is proposed. The public vendor and repository pages are mutable; recorded observations are time-bound.

## O4 — exact P-clause disposition

| Exact plan clause | Disposition | Final finding |
|---|---|---|
| P1: “Schedule tenant production blocks with setup, production, and cleanup intervals.” | **Correction** | Preserve the clause and specify distinct setup, production, and cleanup spans. Resource occupancy must cover each resource over the subranges when that tenant has access to it; keep that occupancy distinct from production duration and billable time. A half-open interval model is a proposed convention only. The brief gives no durations, precision, boundary convention, transition-interval owner, or billing rule. Do not assume symmetric buffers or one cleanup duration for all equipment. |
| P2: “Keep each tenant's recipes, customer information, and production volumes private from other tenants.” | **Already-covered**; **optional enhancement** | The clause names the core confidentiality requirement. Verify disclosure across calendars, searches, profiles/community, contact channels, exports, notifications, kiosk and direct links. Occupancy and equipment-time patterns may still reveal information; the board must decide what minimal conflict-avoidance visibility is acceptable. The product need not collect or expose recipes, customers, or output volumes to schedule use. P2 does not itself prohibit a tenant from keeping its own business records elsewhere. |
| P3: “Record equipment-use and cleaning signoffs using tenant-defined procedures.” | **Correction**; **uncertain product fit** | The required scope is a tenant-defined equipment-use/cleaning signoff associated with the tenant, production block, and equipment item, plus the tenant's own year-end records. Public evidence does not establish that a candidate supports this full per-use workflow. Submitter, timestamp, state, retained edit history, correction rights, attachments, and restore behavior are reasonable record-integrity design questions, but the brief does not specify them as required fields or acceptance conditions. Define what counts as signoff and who may correct it. An optional tenant-private batch reference or handoff state/time may clarify a handoff; keep it user-authored, omit recipe/customer/sales/ingredient/output details, and resolve cross-tenant access against P2 before adding it. The record is the tenant's statement, not kitchen certification of a food-safety program. |
| P4: “Support an accessible coordinator view and a transition period that can coexist with paper signoffs.” | **Correction**; **already-covered** | Preserve both requirements. Treat the wet-hands entrance tablet as a separate use environment from the coordinator's screen-reader-compatible administrative view. Validate each task flow separately. During paper/digital overlap, preserve the paper event time and later digitization time as distinct provenance; do not create a software timestamp that purports to be the original paper time. |
| P5: “Booking restrictions after a missing signoff and the authority to apply them are board decisions.” | **Already-covered**; **user decision** | Keep this open. Compare “notify/follow up only” with “restrict future bookings”; name who could apply, clear, or appeal a restriction. No restriction should become active by silent default. A vendor's booking approval or auto-approval is a different policy. |
| P6: “A common procedure model across equipment types has not been selected.” | **Already-covered**; **user decision** | Keep this open. Options include a tenant-authored base procedure with equipment-specific additions/overrides or separately authored procedures for each equipment type. Do not impose a kitchen-wide safety procedure or represent the system as the authority on a tenant's program. |

“Rejected” applies to approaches, not to a P clause: reject making recipe/customer/output information a scheduling prerequisite, imposing a kitchen-wide cleaning procedure, or silently blocking future bookings when signoff is missing. These are outside the brief's assigned data and decision boundaries. Revisit only if the board explicitly changes scope.

## O5 — retained constraints, alternatives, decisions, and uncertainty

The recommendation preserves the six-tenant pilot, eventual twenty tenants, three coordinators, $21,000 budget with unknown horizon/components, internet access, wet-hands entrance tablet, screen-reader coordinator view, paper transition, tenant-defined use/cleaning records, privacy among tenants, and each tenant's own year-end records. It retains the product alternatives and their operating tradeoffs, a linked tenant-owned record as a separate workflow, the unresolved P5/P6 board choices, optional rather than mandated integrity fields and batch references, and the distinction between documented behavior and unproven product fit. The record is a tenant statement, not safety certification. Recommendations and checks remain conditional; no live result or affordability conclusion is invented.

## O1 — unfamiliar tools and materially different approaches

### The Food Corridor: kitchen-specific hosted suite

The Food Corridor is designed for shared-use kitchens. Public materials describe space/equipment booking, per-client approval or auto-approval, PIN sign-in/out, business reports, manager CSV reports, client documents, and monthly cleaning checklists [FC-01–FC-07]. The equipment workflow can include multiple equipment items with different time ranges inside one space booking, which is promising for multi-resource scheduling [FC-03].

The current plan selector displayed Starter at $129/month for up to five clients and 4% platform fees. Annual displayed $206/month billed annually for unlimited clients, with 2% ACH or 4% card fees. Twelve months at the displayed $206 rate is $2,472 of base-rate arithmetic, not a quote or verified first-year invoice. The page also displayed a first-month-free / “Save 10%” offer, whose application to the annual payment was not explained. The currency selector was not changed. Six pilot tenants and eventual twenty exceed Starter's client cap. The $21,000 budget has no time horizon or stated inclusions, so no affordability conclusion follows [FC-02; RV-02].

The monthly station-cleaning checklist is useful as an optional capability, but does not establish tenant-authored signoff for each equipment use, per-block linkage, a correction trail, or the tenant's own complete year-end export [FC-05]. PIN sign-in/out and attendance reports are not cleanup signoff [FC-02, FC-04, FC-07]. The manager CSV can be filtered by client/date but is not evidence that tenants can export all their own booking and handoff records [FC-07].

A privacy demonstration is essential. The food-business account documentation describes Daily View of booked spaces/equipment and Community for viewing and messaging fellow clients. It also lists profile fields including business name, description, business category, products sold/made, business stage, social channels, public contact information, and home kitchen [FC-04; RV-01]. The documentation does not say which fields another tenant can see through each surface, whether Community can be disabled, or whether fields can be minimized. This is a potential disclosure surface, not evidence of a P2 violation or of recipe/customer/output disclosure. Ask exactly which profile fields and contact channels appear to another tenant through profiles, Community, calendar, and search, and which can be disabled or minimized. Broader limits on identity, product types, or public contacts require a kitchen decision.

Treat The Food Corridor as the first product to demonstrate because its shared-kitchen workflow may reduce integration work. It remains only a conditional lead: do not mark P1–P4 satisfied until resource timing, privacy, per-use signoff and tenant export pass the agreed tests.

### Skedda plus a tenant-owned handoff log

Skedda is a general hosted scheduler with documented visibility controls. With private access, tenants log in; booking access can be tag-limited. If no content-visibility rules are set, regular users see other bookings as date/time/space, while system users see holders, titles, and custom fields [SK-02]. Custom booking fields can be required, conditional, holder-visible or admin-only; the documented fields are collected at booking creation and can surface in emails, exports, printouts, popovers, searches, scheduler views, and integrations [SK-03]. A required field at booking time is not a post-use signoff or an append-only correction history. System users can filter and export booking rows to XLSX/CSV, but the cited help does not give ordinary users the equivalent report/export filters or prove an individual tenant's year-end export of later handoff records [SK-04].

The buffer model is consequential: it derives duration from configured time granularity with a documented 15-minute minimum; conflicting rules resolve to the maximum; rules affect only later-created bookings; and equal time is reserved before and after the booking. Ordinary users cannot book into the buffer, while system users can override it [SK-01]. This may fit only if the kitchen chooses a symmetric gap and accepts its capacity effects. It fits poorly if setup and cleanup are one-sided or equipment-specific. A separate tenant-owned log must independently establish per-use signoff, tenant access isolation, correction behavior and year-end export. This path offers documented schedule-visibility controls at the cost of another workflow, identity boundary, integration, and export to validate.

### LibreBooking: self-hosted resource scheduler

LibreBooking is an open-source resource scheduler with booking, approval, resource grouping, buffers, and check-in/out. Its administration guide is labeled version 7.0.0, though the inspected documentation URL is mutable. Public schedule viewing is off by default; if a read-only public schedule is enabled, reservation details remain hidden unless separately exposed [LB-01].

For P1, the guide says resources cannot be double-booked by default. Concurrent reservations can be enabled at schedule level, but that applies to every resource on that schedule and removes Schedule View. The guide also reports no default maximum capacity, no default minimum/maximum duration, approval off, new-user resource access on, and administrator exemption from usage constraints. An administrator may therefore bypass ordinary limits. These are configuration starting points, not a tenant privacy design or a universal rule that each kitchen resource must be exclusive [LB-01; RV-03]. Configure space and equipment capacity separately where needed and test administrator behavior. The guide describes buffer time as a minimum separation but does not give its units or direction in the cited section. Do not implement a production rule from that incomplete description.

The guide says Public Access for a resource makes its tablet, RSS, iCalendar, and embed URLs available to copy. It does not say enabling the feature automatically broadcasts those URLs. The practical risk is sharing or exposing a copied URL; test access and sharing controls before using a kiosk or feed [LB-01; RV-03].

The pinned release at research time was v7.0.0, commit 422b4b0223335d18c7d5f005ffcdd93719575c20, dated 2026-10-06 [LB-02]. The mutable repository README observed on 2026-10-09 announced a high-impact security release planned for October 13 and said versions before 7.0 had an unauthenticated administrator-takeover vulnerability with fixes not backported. It did not establish that v7.0.0 is affected by the undisclosed upcoming issue. The install guide names PHP 8.2+, Apache 2.4+ (other server software may work but is not then project-supported/tested), and MySQL 8+ or MariaDB 10.6+ [LB-04]. Hosting, monitoring, backup, recovery, access administration, and patch ownership remain real costs; no operator is identified in the brief.

I attempted the version-specific documentation URL for v7.0.0, but the web tool returned “URL … is not accessible via this tool.” This is a retrieval limitation, not evidence that the URL is unavailable publicly. The comparison therefore uses the mutable guide labeled 7.0.0 and keeps that limitation explicit; the code/release investigation for O3 is pinned to the v7.0.0 release.

### Linked tenant-owned handoff record

A product-independent alternative is to keep scheduling and tenant-owned handoff records separate, linked by a booking and equipment identifier. The minimum case requirement remains a tenant-authored equipment-use/cleaning signoff and that tenant's own year-end records. A possible record-integrity design can include submitter, entry time, state, and a correction trail, subject to a board decision about signoff semantics and correction rights. A tenant-generated batch reference or handoff state/time can be optional where it helps; keep it tenant-private and free of recipe or output details unless cross-tenant sharing is explicitly authorized. Paper stays available during transition, with original paper time distinct from later digital entry. This architecture adds duplicate entry, access-control, integration, retention, and export risks. None of the reviewed product pages proves the complete required workflow.

## O2 — behavior, defaults, units, limits, and applicability

- **Food Corridor equipment:** public instructions show a tenant creates a space booking, chooses an equipment time range, checks availability for that range, and can add equipment for distinct ranges [FC-03]. No public unit/granularity, setup/cleanup reservation, simultaneous-request race behavior, or conflict boundary is established. Probe these before relying on it for access collisions.
- **Food Corridor checklist/sign-in:** monthly client cleaning checklists and station tasks are documented; sign-in/out is attendance/time. Neither establishes per-block, per-equipment tenant signoff or revision-safe tenant export [FC-04–FC-07].
- **Food Corridor approval:** manager approve/decline/edit and client-specific auto-approval are documented. They do not determine missing-signoff enforcement [FC-06].
- **Food Corridor price/export:** record the exact in-page limits, fees, promotion, and base-rate arithmetic above as a time-bound screen observation. Obtain a written quote and test a tenant account's complete year export; do not substitute manager CSV reports for tenant ownership [FC-02, FC-07].
- **Skedda buffers:** per-space rules derive from configured granularity; 15 minutes is the documented minimum; only new bookings receive a newly configured rule; maximum conflicting rule wins; the interval is symmetric; ordinary users are blocked but system users can override [SK-01]. This mechanism is not an automatic fit for asymmetric or equipment-specific setup/cleanup.
- **Skedda confidentiality/export:** private login and tagged booking access can limit who books; default regular-user visibility without content rules still reveals date/time/space, and system users see detailed booking fields [SK-02]. Booking fields can have broad propagation surfaces [SK-03]. Do not make tenants system users by accident or treat hidden UI as authorization. System-user CSV/XLSX export is not tenant self-export proof [SK-04].
- **LibreBooking capacity/privacy:** the v7.0.0-labeled guide's default is exclusive resources; schedule-wide concurrent mode trades away Schedule View and applies to every resource on the schedule. Default capacity is unlimited, and administrator roles can be exempt from usage restrictions [LB-01; RV-03]. Set intentional capacity by space/equipment and validate both tenant and admin paths. Public-view detail defaults do not replace private tenant authorization [LB-01].
- **Accessibility:** WCAG 2.2 provides relevant anchors: keyboard operation (2.1.1), a 24 × 24 CSS-pixel minimum target subject to exceptions (2.5.8), exposed name/role/state/value (4.1.2), and announced status messages without moving focus (4.1.3) [WCAG-01]. This is not a wet-hands usability standard; test the tablet in context and test the coordinator's actual keyboard/screen-reader tasks.
- **Cost applicability:** $21,000 has no stated annual/one-time horizon, currency, payment volume, or inclusions. Hardware, payment fees, implementation, support, tax, hosting, security operations, and contingency remain open. Do not declare any path affordable from the observed base subscription alone.

## O3 — issue/fix/regression/release chain

LibreBooking issue #1008, opened 2026-02-14, reported recursive BufferItem::Id() behavior that could cause a stack overflow. PR #1140 merged on 2026-03-13; fix commit b1394612e9e5311d0b6662cffa8e2e528667d6c3 delegates ID construction to the wrapped reservation item and adds before/after ID assertions. Merge commit 4bc0cf5dd17b5cbacae2fd4540800f04ea371c1e includes the fix; v4.3.0 release notes dated 2026-04-03 list it. Pinned v7.0.0 code retains the wrapped-item delegation [LB-03]. The v7.0.0 regression test calls WithBufferTime(3600) and asserts generated begin/end IDs. The inspected excerpt does not state the unit; do not reinterpret 3600 as seconds [LB-05].

This is a narrow list-item/rendering regression, not evidence that reservation-conflict enforcement or kitchen cleaning intervals are correct. The project README's future security notice is mutable; it does not establish v7.0.0's exposure to the undisclosed issue [LB-04].

## Decision and open-item register

### Board or operator decisions

1. **Missing signoff and authority (P5):** choose follow-up only or future-booking restriction. Name who can apply and clear a restriction, how a tenant can correct a record, and whether there is an appeal. Keep policy inactive until adopted.
2. **Procedure model (P6):** choose tenant-authored base procedure plus equipment-specific additions/overrides, or separately authored procedures by equipment type. Do not imply a kitchen-wide food-safety program.
3. **Changeover intervals (P1):** decide if setup/cleanup are fixed per resource, chosen per booking, or policy-derived. Define asymmetric before/after support, interval boundaries, who may occupy the interval, and billing treatment.
4. **Confidentiality boundary (P2):** decide which busy/occupied resource information is necessary to prevent collisions and whether identities, profile/product details, community/contact surfaces, or equipment-use patterns may be visible. The brief does not resolve visibility beyond named recipe/customer/volume privacy.
5. **Budget basis:** specify annual or one-time horizon and whether it includes hardware, transaction fees, implementation, support, hosting, taxes, and operations.
6. **Export and record control:** define contents, timezone, format, requester, retention/deletion, and paper-to-digital relationship. Require each tenant's own year-end records; do not rely only on manager exports.
7. **Signoff and batch handoff:** define what the tenant's signoff means and how corrections work. Clarify whether batch handoff stays inside one tenant's work or crosses tenants. If it crosses, reconcile that requirement with P2 before opening access. A private batch reference/status is an optional lead, not a new data mandate.
8. **Candidate-specific unknowns:** test Food Corridor profile/community/calendar exposure, per-use record and tenant export; Skedda plan/quote, tenant export and post-use workflow; or name a self-hosted operator and security-update owner.

### Conditional shortlist

Demonstrate The Food Corridor first because its published product is specific to shared kitchens and its listed equipment subranges and client/account workflows may reduce integration effort. This is not a procurement decision. Fail it if tenant views expose information the board disallows, if a tenant cannot record the required per-block/per-equipment signoff, if tenants cannot retrieve their own year-end records, or if the agreed resource intervals and board policies cannot be represented. If it fails, compare Skedda plus a separately validated tenant log or LibreBooking with named lifecycle ownership. A custom build remains an optional path only if a scoped estimate fits the chosen budget horizon and maintenance has an owner; no estimate is available.

## Accessibility, privacy, data, and operations requirements

- **Entrance tablet:** exercise the actual model, glare, viewing angle, kiosk reset/session isolation, touch accuracy, and wet-hand task flow. Treat 24 × 24 CSS pixels as a WCAG conformance floor with exceptions, not the kitchen's wet-hand acceptance target. Prefer larger separated controls, little typing, clear correction, and paper fallback [WCAG-01].
- **Coordinator administration:** use the actual screen reader and keyboard flow for finding, correcting, and exporting a record and resolving a booking conflict. Check names, roles, states, focus, errors, and status announcements. A vendor statement or automated scan alone does not demonstrate task completion [WCAG-01].
- **Tenant privacy:** test each tenant role against calendar, profile, search, notifications, reports, exports, direct record links, and kiosk. Collect no recipe/customer/output fields for scheduling unless the board separately defines a purpose. Do not infer authorization from a hidden screen.
- **Record provenance:** distinguish tenant submission, coordinator edits, booking edits, optional handoff state changes, and paper backfill. If a paper event is entered later, preserve the paper time and digitization time separately. Correction history is a recommended design question, not a case-defined acceptance field.
- **Booking semantics:** define timezone, precision, interval boundary, equipment subranges, cancellation/rebooking behavior, and setup/cleanup reservation. Half-open intervals are a testable proposal, not settled policy.
- **Operations:** SaaS requires privacy/export/retention terms, account recovery, support, fee review, and data exit. Self-hosting requires patching, backup, monitoring, recovery, access administration, and a named owner for security releases.
- **Food-safety boundary:** store a tenant's defined use/cleaning record and signoff. Do not claim the kitchen or software has evaluated, approved, or guaranteed the tenant's full food-safety program.

## O6 — discriminating validation proposals

**Executed:** read-only public primary-source inspection and local artifact hashing. No product, runtime, witness, export, accessibility session, concurrent booking, deployment, or user study was executed.

**Proposed:** use six pilot tenants and distinguish acceptance criteria from optional investigations.

1. From two tenant accounts, concurrently request the same space and equipment, then exercise separate equipment subranges, setup/cleanup overlaps, and adjacent boundaries. For an exclusive resource expect only one allocation; for a configured capacity greater than one compare results to the declared capacity and simultaneous-use policy. Explain conflicts to the user.
2. Exercise create/edit/cancel/recurrence/shorten/extend, timezone/DST boundary, changed buffer rule with existing reservations, and administrator override. Record whether rules are symmetric, which resources they affect, and whether an override is visible/auditable.
3. Create a tenant-A booking and signoff; attempt access as tenant B through UI, direct URL, search, reports, notification link, export, and kiosk. Confirm tenant B cannot read or change tenant A's record. Test which minimum occupancy information remains visible and take any broader profile/product/contact choice to the board.
4. In a Food Corridor demo, identify exactly which profile fields and contacts are visible to a second tenant in profile, Community, calendar, and search; test whether each can be disabled or minimized. Do not count a suspected exposure as proven from the public docs.
5. Define tenant-authored steps for two different equipment types, record a per-block signoff, and inspect the resulting tenant/block/equipment link and tenant-owned retrieval. Separately test any proposed submitter/time/status/history/correction fields; do not treat them as required acceptance criteria until adopted. Confirm a generic monthly checklist and attendance PIN do not stand in for the per-use signoff.
6. Export one tenant's simulated year and compare its own bookings, equipment and signoffs, timestamps/timezone, amendments and cancelled states, encoding, and cross-tenant exclusion. Tenant-owned year-end export is required. Attachments, restore/round-trip, and deleted-state behavior are optional portability investigations unless the kitchen adopts them as requirements.
7. Run both P5 alternatives with a missing signoff. Verify the system has no blocking rule before the board decides; then test the chosen authority, clear/correct path, and appeal as applicable. Product booking approval is a separate control.
8. Compare P6's base-plus-equipment-additions option with separate equipment procedures. Confirm tenants can author their own selected steps and no central standard is imposed by default.
9. Test entrance-tablet tasks with wet-hand proxies, gloves if relevant, glare, actual placement/cleaning, reset, and fallback. Record completion, errors, correction, and touch accuracy. Separately complete coordinator tasks by keyboard and actual screen reader, capturing labels, states, focus, error and status announcements.
10. During paper transition, enter the same-day paper record digitally later using a shared booking reference. Confirm original paper time, later entry time, provenance, and retry behavior remain distinct with no duplicate or fabricated timestamp.
11. Obtain written quotes and decide the budget horizon, payment-fee base, hardware, implementation, onboarding, tax, support, hosting, retention and contingency. For self-hosted trials, confirm current release/advisory, supported stack, tenant access, named patch/backup owner, and recovery plan.

## Reviser disposition of criticism

No criticism was rejected. Findings were accepted where they corrected scope or added an evidence-backed condition; choices not required by the brief remain labeled optional, undecided, or uncertain.

### Prior research critique

| Finding | Disposition |
|---|---|
| 1. Retain the batch-handoff goal | **Accept.** The final includes an optional tenant-generated private reference or handoff state/time. It does not add a shared batch record; whether handoffs cross tenants remains open against P2. |
| 2. Strengthen data minimization for handoff | **Accept.** A reference is user-authored and tenant-private; it is not a recipe, safety record, or requirement to collect business details. |
| 3. Keep P1 occupancy distinct from production and billing | **Accept.** The correction reserves resource occupancy over agreed subranges but leaves billing, ownership, boundaries, and durations undecided; half-open intervals remain a proposal. |
| 4. Preserve conditional shortlist and cost uncertainty | **Accept.** The Food Corridor is a demo lead only. The $2,472 calculation is identified as list-rate arithmetic, not an invoice; selector currency, fees, promotion treatment, budget horizon and total costs remain unknown. |
| 5. Keep privacy concerns as potential disclosures | **Accept.** Public documents establish surfaces, not their exact tenant-to-tenant exposure or a breach. The final adds documented profile fields and a bounded demo question [RV-01]. |
| 6. Do not equate different signoffs | **Accept.** Attendance PIN, monthly checklist, booking-time custom field, and required per-use tenant signoff are distinguished. |
| 7. Correct timestamp precision | **Accept.** The source map gives the exact web-tool observation windows and says they bracket operations rather than server timestamps. New observations are separately timestamped [RV-01–RV-03]. |
| 8. Keep the LibreBooking issue chain narrow | **Accept.** It is a list-item/rendering fix, not conflict-enforcement proof. The future security notice does not show v7.0.0 is affected; patch ownership remains a condition. |
| 9. Do not treat WCAG as wet-hands validation | **Accept.** WCAG target size is only a conformance reference; the tablet and screen-reader admin tasks require separate real task tests. |
| 10. Preserve paper provenance | **Accept.** The paper event time and later digital entry time are distinct; paper coexistence is not represented as offline product support. |
| 11. Keep P5 and P6 open | **Accept.** The two policy choices and their authority remain decisions; product approval settings are not substitutes. |
| 12. Separate executed checks from proposals | **Accept.** Only public-source inspection and artifact hashing were executed; all product, user, accessibility, runtime, booking, and export checks remain proposed. |

### Independent full critic

| Finding | Disposition |
|---|---|
| M1. P3 correction bundles required scope with design choices | **Accept and amend.** Tenant/block/equipment linkage and tenant-scoped year-end records are the required scope. Submitter, time, status, history, and correction mechanics are proposed record-integrity choices pending confirmation. Restore and attachments are not acceptance gates. |
| M2. Food Corridor profile fields are missing from the privacy gate | **Accept.** The page directly lists business name, description, category, products, stage, social channels, public contact details, and home kitchen. The final adds these to a bounded demo check without inferring P2 violation or a specific visibility-control feature [RV-01]. |
| M3. LibreBooking has a positive exclusive-resource default and a schedule-wide concurrency tradeoff | **Accept.** The re-opened guide says resources cannot double-book by default; enabling concurrent reservations applies across the schedule and removes Schedule View. The final also preserves capacity/admin qualifications and treats configuration as a validation question [RV-03]. |
| Minor 1. Annual price page includes a free-month offer | **Accept.** The $2,472 number is twelve-month displayed-rate arithmetic only; the offer's annual invoice treatment is unknown [RV-02]. |
| Minor 2. Public resource URL wording | **Accept.** The guide says URLs become available to copy when Public Access is enabled; it does not establish automatic broadcast. The risk is sharing/exposure of copied URLs [RV-03]. |
| Minor 3. Collision acceptance depends on capacity | **Accept.** Validation now expects one success only for an exclusive resource; capacity-limited shared resources are judged against their configured capacity and policy. |
| Minor 4. Restore exceeds the stated export requirement | **Accept.** Tenant year-end export is a required check. Restore/round-trip and attachments are optional unless the board adopts them. |

## Primary-source and evidence notes

The source map preserves immutable upstream IDs and adds direct reviser reopens as RV-01–RV-03. It records exact URL, observed version/commit, locator, UTC access window, operations, evidence use, and limitations. Product pages can drift; the stable v7 release/code references remain pinned where available. Usage and billing were not observed and are null in the map.

- Food Corridor product, equipment, approval, checklist, and report records: FC-01–FC-07 in [source index](sources/index.md#kitchen-specific-product).
- Skedda buffer, visibility, fields, and export: SK-01–SK-04 in [source index](sources/index.md#general-hosted-scheduler).
- WCAG 2.2 and LibreBooking: WCAG-01, LB-01–LB-06 in [source index](sources/index.md#accessibility-and-self-hosted-scheduler).
- Reviser reopens: RV-01 Food Corridor account/profile; RV-02 Food Corridor signup plan; RV-03 LibreBooking 7.0.0-labeled administration guide. See [reviser evidence notes](sources/evidence-notes.md#reviser-reopens).
- Inherited exact URL access windows are preserved in the critic source map and research access log; they bracket tool/browser observation, not server HTTP timestamps.
