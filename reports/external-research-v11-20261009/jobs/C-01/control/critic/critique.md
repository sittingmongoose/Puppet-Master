# C-01 / H01 — independent critic review

**Stage:** critic  
**Method:** M16, resource version budget-75vs60-v1  
**Review basis:** the exact H01 brief and revealed plan, the complete C-01/control research draft and discovery, the declared research source map and retained evidence, plus a fresh inspection of the same public primary-source inventory.  
**Review completed:** 2026-10-09 21:55 UTC  
**Native Goal:** created through the supported native Goal call and observed active before this artifact was saved.  
**Scope:** this is a critique of the candidate research; it is not a revised product answer. No product instance, customer data, benchmark, runtime, quote, outage drill, permission test, or accessibility test was used.

## Overall assessment

The draft is unusually careful about the difference between vendor claims and tested behavior. It preserves the $10,000 ceiling, six-person operation, private-use constraint, family data sensitivity, keyboard use, translated family information, severe-weather connectivity, independent export, and the three unresolved owner decisions. The recommendation remains conditional on a quote and pilot gates; it does not claim a purchase is justified. Its handling of the P clauses and the proposed-versus-executed validation distinction is mostly sound. The Nextcloud issue-to-PR-to-release/code chain is bounded as a historical import example rather than presented as proof of current product failure.

The primary-source reinspection supports most of the central claims: Passare documents event participants and availability, staff-area role permissions, family roles, task ownership/reminders, and separate CSV category exports; Baserow documents both restricted-view limits and the quoted Advanced seat price; Nextcloud documents broad write-share rights, differential sync tokens, and a resource-backend dependency. These observations and the one failed URL recheck are recorded under `sources/` and in the source map.

Four material changes should be made in a later complete revision: narrow the Nextcloud accessibility claim to what its linked manual actually says; describe Nextcloud's documented one-at-a-time resource booking after a backend is installed; put applicable retention defaults into the P6 comparison without confusing them with note retention; and extend the privacy validation to calendar popovers, subscriptions, and print output. None of these findings overturns the core recommendation to run a quote-gated demonstration and pilot or resolves the owner's open choices.

## Material findings

### M-01 — The cited Nextcloud manual does not support the stated conformance level

**Evidence:** NC03's inspected Universal Access manual documents generic keyboard controls (Tab/Shift+Tab, Enter/Space, Escape, and skip links) and lists high-contrast and other themes. The inspected page does not state WCAG 2.1 AA conformance or a WCAG target, does not assign a high-contrast AAA level, and does not establish assistive-technology support for Calendar/task workflows. See [NC03 reinspection](sources/evidence.md#nc03).

**Assessment:** The draft's “aims at WCAG 2.1 AA (high contrast at AAA)” wording and its broader assistive-technology characterization exceed the evidence cited. This is an evidence overclaim, not evidence that Nextcloud is inaccessible. The draft correctly says a vendor manual does not validate the calendar or task workflow, but that caveat does not repair the unsupported standard claim.

**Requested correction in a revision:** Say only that the Server 35 manual documents generic keyboard navigation and offers a high-contrast theme; report the workflow and screen-reader status as unverified. Keep the task-based keyboard trial. Do not score Nextcloud as conformant or give it a standards advantage without a conformance statement or independent test.

**Severity:** Material. Keyboard access is an explicit requirement and could affect product ranking or procurement.

### M-02 — Nextcloud's resource backend is a documented conflict-control path, not only an unspecified dependency

**Evidence:** NC02 says its CalDAV backend supports rooms/resources supplied by an app backend; once present, resources can be booked for appointments and the system schedules them so they can be used only once at a time. The manual also notes that newly added or updated resources may appear after a delay. See [NC02 reinspection](sources/evidence.md#nc02).

**Assessment:** The draft correctly identifies the additional-backend dependency and appropriately refuses to assume a funeral-specific workflow. Its comparison nevertheless omits the documented one-at-a-time booking behavior. That leaves an important alternative mechanism under-described for P1 and makes the Nextcloud option look weaker on room conflict prevention than the cited primary evidence warrants. This capability does not establish vehicle/officiant constraints, case-level permissions, integration quality, or suitability as a complete case system.

**Requested correction in a revision:** State that a resource backend can provide one-at-a-time room/resource reservations, subject to the app implementation and delayed discovery; then require the same overlapping-room pilot test, including resource creation, refresh delay, override behavior, recovery and the actual installed backend. Do not extend the claim from rooms/resources to vehicles or providers without evidence.

**Severity:** Material to comparative completeness and the P1 validation plan; not a reason by itself to select Nextcloud.

### M-03 — Retention defaults relevant to P6 are missing from the comparison

**Evidence:** The inspected Nextcloud 35 admin manual documents a 30-day default trash-bin purge for calendars, events and tasks, configurable through `calendarRetentionObligation`; it does not establish the retention of unrelated files or private notes. The current Baserow hosted price page lists 180 days of row-change history for Advanced. See [NC02](sources/evidence.md#nc02) and [BR01](sources/evidence.md#br01).

**Assessment:** P6 appropriately remains an owner decision, and the draft correctly refuses to invent a personal-note retention duration. It does not distinguish the products' documented retention-related behaviors. Those are relevant defaults/limits for comparing the options and for deciding whether a system preserves or removes changes. They must not be misrepresented as the business's retention policy, full backup, immutable audit log, or the retention of family planning notes.

**Requested correction in a revision:** Add a small data-type-specific note: Nextcloud's documented calendar/event/task trash purge is 30 days by default; Baserow Advanced lists 180-day row-change history; Passare's relevant note/history/deletion retention remains unverified in this source set. Ask the owner/vendor to decide and demonstrate retention separately for active notes, deleted objects, change history, attachments, exports, backups, and any legal hold. Recheck mutable plan documentation at purchase time.

**Severity:** Material for a P6 comparison and pilot acceptance, with an explicit limit that none of these defaults answers the owner's note-retention question.

### M-04 — Test Passare calendar disclosure surfaces, not just records and role menus

**Evidence:** PA02 says calendar event popovers can show decedent information, location, participants, notes, and associated events. It also documents personal-calendar connection and a printable calendar. The same source distinguishes private/public case-event flags from role configuration. See [PA02 reinspection](sources/evidence.md#pa02). PA11 says case ID was added to case-event notifications and participants are included in event exports, reinforcing that event metadata travels through multiple surfaces.

**Assessment:** The draft correctly warns that the event private flag is not staff-role confidentiality and its role test is broad. Its test list still does not name the Passare event popover, personal-calendar connection/subscription, or printed calendar as explicit disclosure paths. The sparse calendar recommendation does not itself guarantee that linked case metadata, notes, or names stay hidden when a user opens an event or exports/prints/subscribes.

**Requested correction in a revision:** Add those specific surfaces to the synthetic two-family/six-role leakage test. Inspect event details and direct links, connected-calendar output, printed views, event notifications, mobile views and export rows for unauthorized identity, contact, preference, faith/cultural, payment, note, or schedule data. Require the vendor to explain the meaning and scope of its event-level “private” control separately from staff roles. Keep the minimal shared logistics proposal as a design constraint pending that demonstration.

**Severity:** Material because it touches the brief's private/discreet use and P2, although the existing draft already recognizes the general least-privilege risk.

## Exact plan-clause review

### P1 — “Coordinate service times, rooms, transportation, and staff task handoffs in one planning view.”

**Candidate disposition:** already-covered; optional enhancement; uncertain.  
**Critic disposition:** Accept the core disposition. The need is directly grounded in the wall-calendar/notebook uncertainty. Passare's event, participant, task and event-type documentation makes a focused demonstration reasonable, while no source establishes its hard conflict rejection or simultaneous-edit behavior. The draft correctly keeps its proposed status, owner and change-history fields as configuration/test questions, not product guarantees.

**Challenge:** Include M-02's Nextcloud resource-backend capability in the alternatives comparison, while stating its limits. Keep resource conflict validation separate by resource type: the Server 35 page supports one-at-a-time rooms/resources when a backend supplies them, but does not show vehicle or officiant exclusivity. A user-visible service view can be unified while sensitive case fields stay permissioned; preserve the “one planning view” obligation instead of silently weakening it to disconnected lists. Time zone, named change owner, tentative/confirmed state, and prior-state recovery are appropriate discriminating tests.

### P2 — “Limit family contact, preference, and payment details by staff role.”

**Candidate disposition:** already-covered; correction; uncertain.  
**Critic disposition:** Accept. The correction is appropriate: area permissions, event colors, writable calendar shares, or filtered views are not interchangeable with field- and record-level privacy. Passare's role page documents configurable area access and read-only permissions, but does not prove the exact matrix for this case. Baserow's own restricted-view guidance warns that broader table access can bypass view restrictions. Nextcloud calendar ACLs do not establish case-field isolation.

**Challenge:** Apply M-04. Explicitly inspect event popovers, personal-calendar output and print, not only list/search/mobile/notification/export paths. Test an admin account and role changes as well as the six operating roles; document which staff genuinely need which sensitive fields rather than implying that no staff need them. Synthetic unrelated families remain the right test fixture. No evidence supports declaring Passare's private-event flag a staff-role boundary.

### P3 — “Provide keyboard-operable controls and a way to prepare translated family information.”

**Candidate disposition:** already-covered; optional enhancement; uncertain.  
**Critic disposition:** Accept the obligation and the proposed human-reviewed language test. The draft correctly does not infer translation quality from a translated interface or claim that any reviewed product covers the complete family communication workflow.

**Challenge:** Correct the Nextcloud source description under M-01. The linked manual supports generic keyboard instructions and themes, but no standard conformance or complete Calendar/task accessibility result. Keep tests for the end-to-end staff workflow, focus movement, dialogs, error handling and exports. Have speakers review the actual language(s), including change notices and culturally sensitive terms; no language choice can be inferred from the brief.

### P4 — “Preserve a usable office workflow during temporary internet outages and support independent export.”

**Candidate disposition:** already-covered; correction; optional enhancement; uncertain.  
**Critic disposition:** Accept. The distinctions among a family portal requiring internet, a CalDAV offline-client sync mechanism, browser offline editing, and a complete case backup are important and accurately cautious. Passare's category-by-category CSV and Nextcloud's calendar export do not demonstrate a complete, independently restorable case archive. The test plan distinguishes proposed work from execution.

**Challenge:** Retain the two failure conditions separately: WAN interruption while the local office network/power remains available, and loss of LAN/power. Record which work can continue in each. The discovery's 48-hour read-only pre-storm snapshot is a useful optional fallback that could be carried into the complete draft, provided its scope, access, expiry and disposal are explicitly set by the owner. Do not rely on two editable schedules. Include export lineage, time zone, attachments, change history and outside-service readability in the acceptance result.

### P5 — “Relative editing access and the treatment of family-approved schedule changes are policy choices.”

**Candidate disposition:** user decision; uncertain; already-covered as an open decision.  
**Critic disposition:** Accept. The owner, not research, chooses family authority. The candidate correctly distinguishes a family-visible event from permission to edit staff logistics; it also accurately reports Passare's documented Editor default/full Planning Center access and one-Editor requirement if that portal is used. Requiring an Editor in a vendor portal does not require the home to enable the portal or grant schedule-edit rights.

**Challenge:** Preserve the difference between a family-submitted correction, staff verification, and publication of a changed confirmed schedule. The proposed correction-request route is a reasonable conditional workflow, not a documented Passare feature. Test the complete role scope, invitation/revocation, change notification and audit/recovery behavior before the owner makes a choice.

### P6 — “Retention of personal planning notes and separate workflows for different service types remain open.”

**Candidate disposition:** user decision; uncertain; optional enhancement; already-covered as open questions.  
**Critic disposition:** Accept. The candidate preserves both decisions and does not invent a retention period or an authoritative workflow taxonomy. It properly warns that deleting the visible note may not delete copies, backups, exports or audit history.

**Challenge:** Apply M-03. Record relevant product defaults by data type, without treating them as the owner's rule: Nextcloud's calendar/event/task trash bin is documented as 30 days by default; Baserow Advanced advertises 180 days of row-change history; Passare behavior remains unknown from this source set. These defaults are not equivalent to personal-note retention, restore guarantees or regulatory compliance. The owner must still set rules for notes, attachments, backups, exports and legal holds and choose whether service variants get distinct workflows or templates.

## Minor findings and cautions

1. The discovery proposes a pre-storm operational export covering the next 48 hours. The complete draft mentions a protected read-only snapshot but drops the time window. Carry it forward only as an optional operational hypothesis, not a requirement from H01; validate the window with the home and include a disposal rule.
2. Passare's public support sources and release notes do not identify a deployment build, and the Passare product overview URL returned 404 on this critic recheck. Preserve its original PA01 ID and URL; do not substitute another page without a new explicit source ID. This availability failure does not invalidate the other Passare support pages, but a live product demonstration is still needed.
3. The research proposes comparing one locally relevant funeral case-management vendor in the demo. The desk research does not identify that second vendor. O1 is nevertheless met at a useful desk-research level by Passare plus materially different Baserow, Nextcloud, and split-record approaches. Before purchase, the comparison should include a real local competitor or record that none suitable was found; no such search was performed in this critic stage.
4. Baserow's $1,296/year arithmetic is correct for six Advanced seats at the displayed $18 per user/month annual rate. It is not a total cost, and the page is mutable. The candidate conditions the figure correctly and does not compare it with an unprovided Passare quote.
5. Keep the Nextcloud import chain in its historical scope. Issue #2572 is against old Server/Calendar versions; PR #7876 makes unsupported calendars visible but unselectable with an explanation; the mutable changelog records the picker and supported-component follow-up. It is useful evidence for import compatibility and UI evolution, not a present-day defect claim or evidence that Nextcloud is suitable for the funeral workflow.

## Completeness against the assignment obligations

- **O1 — discovery:** Met at the desk-research level. The draft identifies one funeral-specific suite, a configurable database/app, self-hosted groupware, and a split-logistics/private-record design. It states why each could fit and where it fails. The second local funeral-vendor comparison is deferred to procurement/pilot, not claimed as completed.
- **O2 — source behavior/defaults/limits/applicability:** Mostly met. Core Passare, Baserow and Nextcloud claims are bounded and linked to sources. M-01 through M-03 identify missing or overstated accessibility/resource/retention evidence that should be repaired in the final revision.
- **O3 — issue/fix/evolution chain:** Met with a bounded Nextcloud import issue, PR/commit and release note; the draft correctly distinguishes the picker fix from supported component types and avoids claiming a live defect.
- **O4 — every exact P clause:** Met. Each P clause has an explicit candidate disposition and reason. Critic refinements are given above without changing the user's open decisions.
- **O5 — preserve constraints, alternatives and uncertainty:** Mostly met. The brief's constraints and optional/conditional alternatives are carried forward. The critic recommends retaining the 48-hour snapshot as an optional hypothesis and adding the balanced resource/retention facts.
- **O6 — discriminating validations and execution honesty:** Met. The candidate labels the test list proposed and clearly states that no product/runtime tests, quote, outage, accessibility, translation or export trial was executed. The critic additions are also proposed tests only.

## Critic-stage execution record

This review was performed in a fresh critic task context from the predecessor authoring work: only the declared brief, exact input map, complete predecessor artifacts, declared source root and the same primary-source inventory were inspected. No parent, counterpart, evaluator, campaign/history, or other undeclared material was read. No agents were used and no new source IDs were introduced. The predecessor's statement that its draft had no independent critic was accurate when written; this artifact supplies the separate critic pass. The fresh complete reviser is a distinct later stage and is not claimed complete here.

The native Goal was actually created with the supported Goal call and its returned status was active. This critique, source map, evidence notes and index were saved before calling native Goal completion. T3 thread completion is a separate lifecycle and is not observed by the native Goal tool. Usage/billing was not observed and remains null. No tests or product checks were executed; all proposed validations remain proposed.
