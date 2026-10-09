# ER11 pre-plan discovery — B-03 / treatment / I03

**Research stage:** `research`  
**Method:** M05 retained-investigator; this document is frozen before plan reveal.  
**Brief:** `cases/I03/brief.md` (read directly from the exact path in the input map).  
**Evidence index:** [sources/index.md](sources/index.md) and [primary-source-notes.md](sources/primary-source-notes.md).  
**Source identity:** [source-map.json](source-map.json).  
**Plan status:** not read at discovery time. The assignment explicitly forbids reading the plan-root-only file until this discovery and map have been saved.

## 1. Scope and constraints extracted from the brief

A cooperative nursery has a spring crew of twenty seasonal workers and three coordinators outside the season. It grows native seedlings for household orders and municipal restoration projects, with trays moving through propagation benches, hardening areas, and pickup zones. A $5,500 startup ceiling applies. Wireless coverage is unreliable in two growing structures. The cooperative needs to connect variety, propagation batch, expected readiness window, and customer allocation without creating accidental promises when germination varies. A coordinator is color-blind; several seasonal workers read English as a second language. Customer names and delivery addresses are restricted to staff arranging fulfillment. Paper bench tags and a shared calendar already exist and must remain usable during this season. A tray move is not consistently reconciled against an order today.

Three product/process decisions remain open in the brief and are not resolved here: who adjusts a batch’s available quantity (propagation lead or packer), how to handle a missed readiness window, and whether wholesale customers later need a separate view. The first pilot is limited to two plant families. Those constraints shape what is useful now and what should stay optional.

The evidence set is limited to independently selected official project/product documentation, project repositories and issues, pinned source commits, and a W3C standard. It does not include site visits, current device inventory, vendor quotations, code execution, or a product configuration. The external products are candidates and comparative mechanisms, not procurement endorsements.

## 2. Discovery summary

The core product problem is not a plant catalog. It is maintaining a trustworthy link among four things that change on different schedules: a growing cohort, its physical tray/location, a forecast of when it may be ready, and demand reserved against it. Any design that collapses these into one “quantity available” field will confuse expected germination with countable sale stock and turn internal optimism into an accidental customer commitment.

Useful discoveries beyond a simple list/calendar are:

1. **ODK Entity Lists** make offline longitudinal forms more capable than basic survey capture. Current ODK documentation says offline creation/update is supported in Central and Collect from version 2024.3.0 onward, and Entities provide shared state between forms. However, Central handles parallel writes in receive order and surfaces conflicts; stale offline updates can be held for five days, then forced through as conflicts. This can support batch lookup and event capture, but it is not a safe, live stock lock across disconnected devices. (S02-S03)
2. **ERPNext has an explicit batch stock reservation flow.** In v15 it can reserve recorded stock on a Sales Order. Pinned code calculates actual batch quantity by item and warehouse, subtracts existing reservations, and either reduces an oversized request when partial reservation is allowed or rejects it. This is substantially closer to allocation than a plain spreadsheet; it still does not establish an expected crop yield as saleable stock, and no offline field workflow was verified. (S13-S14, S21-S23)
3. **farmOS models agricultural cohorts as plant assets and movements/inventory as logs.** Plant assets can represent groups, locations follow completed movement logs, and quantities can be reset/incremented/decremented with measure and unit. This offers an agricultural data model that is distinct from ODK forms or a general ERP ledger. But the examined Field Kit material is version-ambiguous, and farmOS.js documentation describes last-write-wins offline merging and a farmOS 2.x support scope while the installation guide is v3-oriented. It is a strong model reference, not a drop-in choice without a current compatibility and conflict test. (S25-S30)
4. **A paper-tag-preserving workflow is a first-class option.** Keeping the tag’s human-readable identifier as the physical key allows the nursery to digitize movements and allocation references without immediately replacing the labels. QR/barcode can be an optional shortcut after label/phone testing. Neither ODK’s barcode question nor ERPNext’s Item barcode feature proves that the current tags are scannable or batch-specific. (S05, S15, S18)
5. **Offline capture and confirmed allocation should be separate states.** A disconnected device cannot know what another disconnected device just reserved. This is a design inference from the physical coverage constraint and the documented offline synchronization/conflict behavior of ODK and farmOS.js. A record can be saved offline as a count or movement observation, but global availability should remain “pending sync/review” until a single online authority, explicit partitioned quota, or equivalent conflict-safe method accepts it. (S03, S06, S30)
6. **Retry and privacy details affect the data model.** ODK’s public history includes an issue where editing failed-to-send finalized submissions could make a same-ID retry differ from the server copy; the linked merged fix prohibits editing failed submissions and adds tests. A nursery event should therefore carry a stable ID, and retry should be idempotent rather than changing a previously finalized event. ODK’s role model and security notes also show why customer address data must be excluded from seasonal-worker forms and local caches. (S07-S12)
7. **Visual and language accessibility can be made concrete early.** W3C WCAG 2.2 SC 1.4.1 requires that color not be the only visible cue. Pair colors with text, shape, icon/pattern, and test status labels and tags with the actual workers and coordinator. ODK supports form-localized labels/media, but the exact languages and literacy needs have not been provided. (S04, S31)

## 3. Candidate data model and rules

This is a proposed model to compare with the revealed plan; it is not yet a product decision.

### 3.1 Identity and lineage

- **Plant family / variety:** name the two pilot families and the cultivars/varieties actually used; keep family distinct from variety.
- **Propagation batch:** immutable unique ID, variety, sow/propagation date, source lot if useful, initial tray references, and the person/record that created it. A batch groups related seedlings; it does not imply all seedlings will be equally ready.
- **Tray or physical container:** retain the current paper tag ID as a stable lookup key. Store a batch relationship and present location. If trays are split or combined, record parent/child lineage and quantities instead of reusing one tag ambiguously.
- **Location:** represent at least each structure, bench/hardening zone, and pickup area. A moved tray gets one movement event with from/to, effective time, actor, and ID; the existing tag remains on the tray.
- **Count observation:** dated count of healthy/saleable, damaged, held, or otherwise unavailable plants in an explicit unit. Store who observed it and whether it is pending or accepted. The action “observation” is safer than silently editing the canonical count from an offline phone.
- **Readiness forecast:** a window (earliest/latest or an explicitly named interval), last reviewed time, confidence/status, and optional reason. An estimate is not a commitment. Uneven germination can split a batch into sub-cohorts with separate forecasts rather than force a single false date.
- **Customer order and allocation:** a customer/order record separate from the growing batch. Each allocation references a batch/cohort and a quantity, its state, and an order alias visible to floor staff. Keep names/address in the fulfillment-restricted record.
- **Event/outbox metadata:** immutable event ID, source device/user, event time, local saved time, sync state, and conflict disposition. A repeat send with the same ID should not apply twice; two distinct events must not be merged by “latest timestamp wins” when both represent stock movements or reservations.

### 3.2 Quantity and customer-promise semantics

Separate **forecast**, **verified count**, **hold**, and **reservation**. A candidate rule is:

`allocatable now = max(0, verified saleable count − active reservations − safety hold)`

Only a count that has been verified/released contributes to allocatable quantity. Expected germination or expected future seedlings can appear as a forecast with “not yet confirmed” wording, but cannot be represented as currently available stock. When an allocation is confirmed, it reduces the allocatable balance once. Packing/fulfillment consumes that reservation and posts an actual picked/short/damaged result once. Canceled allocations restore the reservation only after an auditable cancellation event. These definitions need validation against how the cooperative currently counts and sells seedlings, bundle sizes, and safety margin; no count rule is inferred from the brief.

Use separate states such as `forecast only`, `count pending`, `released`, `allocation pending`, `reserved`, `picking`, `fulfilled`, `short`, and `canceled`. The exact labels should be simpler and translated for the seasonal crew. A status should say both the state and its consequence (for example, “forecast — not confirmed”). Avoid a green-only ready state or red-only shortage state.

### 3.3 Disconnected work and synchronization

Offline data entry can create durable *observations*, movement records, or drafts on the phone. It cannot truthfully claim global availability while disconnected unless stock is partitioned ahead of time. A final allocation can be handled in one of three ways:

- **Central online authority:** workers capture offline; a coordinator confirms reservations when data reaches the server. This is simplest and consistent with a small coordinator group, but may slow pickups in disconnected areas.
- **Partitioned quotas:** assign each structure/pickup role a physically enforced sub-stock quota so disconnected clients do not consume the same units. This preserves offline confirmation at added count/replenishment effort and can strand stock in the wrong place.
- **Pending offline holds:** staff may make a request but see “pending sync; not promised” until reconciliation. This prevents a false commitment but is not immediate order confirmation.

No “last writer wins” quantity correction is suitable for competing count adjustments: two true events can both matter. Either append both observations and have a named reviewer resolve the authoritative count, or serialize adjustments through a designated authority. A pure field-level merge also cannot decide which physical count is correct. The conflict UI should preserve both records, their actor/time, and a resolution reason.

## 4. Distinct approaches and their fit

| Approach | What it gives this nursery | Main limitation / condition | Fit for a bounded trial |
|---|---|---|---|
| **Small purpose-built phone-first PWA** | Exact batch/tray/forecast/reservation states; preserves current tag IDs; can separate event capture from confirmed allocation; easiest to express the requested workflow | Requires product and sync engineering, hosting, security, maintenance, training, and cost estimation. Offline code must survive app closure/restart and avoid duplicate or losing events. No build or budget estimate was produced. | Strong workflow fit if a fixed-scope implementation fits the $5,500 ceiling. Start with two families and the single-confirmation rule; gate on a real no-network prototype. |
| **ODK Collect + Central Entities/forms** | Unfamiliar, offline-oriented field capture; form labels/media can be multilingual; barcode questions; separate App Users by form. Entities can link repeated records across forms. | Android Collect is required for full offline entity updates. Entities have conflicts and receive-order semantics; web forms have different offline limits. Better as a capture/review pipeline than live multiworker inventory/booking. Customer PII must not be placed in field-worker forms. Hosting/managed cost and device mix unknown. | Useful rapid pilot for tray moves and count observations if current Android devices exist. Keep reservations coordinator-confirmed and test stale concurrent updates. |
| **farmOS + Field Kit** | Agriculture-centered grouped plant Assets, crop/variety, location Logs, quantity events; offline companion model | Field Kit version and v3 compatibility not established. farmOS.js docs describe LWW concurrency and v2.x support; hosting is operational work. Reviewed docs do not show the nursery’s readiness/booking concepts. | Evaluate as a data-model/reference option if a current supported installation already exists or the team wants a full farm record system. Do not assume current Field Kit is safe for shared reservations until tested. |
| **ERPNext v15 batch inventory + Sales Order reservation** | Real batch/warehouse stock ledger; specific stock reservations; whole-number UoM setting; item barcodes, batch splits/moves, role/field permissions, customer address records | Generic ERP depth and configuration may be disproportionate; batch reservations use actual inventory rather than germination estimates; no offline phone workflow verified; permission and negative-stock behavior need concrete sandbox validation. No total price/work estimate available. | Best comparator if reservations and fulfillment integration dominate and staff can reconcile online. Prototype one or two plant families before importing live orders. |
| **Paper tags + improved board/ledger** | No network or battery dependency; no relabeling this season; can begin immediately; staff already know tags/calendar | Weak multiuser conflict handling and potentially stale availability; double entry/reconciliation overhead grows with orders. Must visibly mark reservations and late readiness. | Good interim path or fallback while digital workflow is tested; pair with a daily authoritative reconciliation and written order alias. |

These are materially different approaches: form submission/event capture (ODK), farm-record log model (farmOS), stock-ledger ERP with reservation documents (ERPNext), a purpose-built local-first application, and paper-first operations. They are not interchangeable. Product costs, hosting, license terms/versions, integration, and fit on existing phones remain open and have not been quoted.

## 5. Conditional direction for plan comparison

A reasonable provisional direction is a narrow, tag-preserving workflow with (a) batch and tray identities, (b) explicit movement/count events, (c) forecast readiness separated from verified stock, (d) reservations visible by order alias, and (e) one explicit online confirmation or physically partitioned quota for actual promises. Pilot two families only. This describes an outcome, not an architecture requirement. ODK could test offline movement/count capture cheaply if devices and hosting allow; an app built for the exact process may better support reservations; ERPNext supplies a reservation reference implementation; farmOS supplies domain concepts. The revealed plan should be compared clause-by-clause before selecting a product or implementation.

For the two unresolved operational choices, preserve alternatives:

- **Who owns available-quantity adjustment?** A propagation lead can approve verified release counts, reducing competing edits and keeping horticultural judgment with the grower; this can create a bottleneck or missed shifts. A packer can record shortages/pick outcomes close to work and keep the ledger current; this requires that pickers not silently overwrite forecast counts and that discrepancies be reviewed. A workable hybrid is: anyone may submit a count observation, a named propagation/stock authority accepts the verified count, and packers reserve/fulfill against that count. Whether the cooperative wants this separation is a user decision.
- **What if the window is missed?** Options include keep the reservation pending and contact the customer with a revised range; offer a substitution; release the reservation and reallocate only after consent/policy; or cancel/refund. The system should surface a “window missed — decision needed” queue and not auto-notify or auto-reallocate until the cooperative chooses a policy. Exact time buffer, responsibility, and customer communications are unresolved.
- **Wholesale view:** keep the first pilot internal to staff. Preserve a customer-type field only if needed to avoid redesign; do not build a wholesale portal until users choose what wholesale buyers may see and whether that view carries private restoration allocations.

## 6. Accessibility, privacy, and adoption implications

- Color may reinforce a state but must never be the only signal. Put readable status text and a distinct icon/shape/pattern on phone cards and printed views. Check contrast and legibility in greenhouse light and when labels are printed in monochrome. (S31)
- Use one clear action per mobile screen, large scan/type affordance, forgiving numeric controls, and direct feedback that says `saved on this phone`, `waiting to sync`, `synced`, or `needs review`. Avoid relying on a tiny connectivity icon alone. Test short, translated phrases and optional photos/icons with seasonal workers; ask which languages they actually need. (S04, S06)
- Keep customer name, phone, and delivery address in a fulfillment-only section/role. Floor staff should use an order code and plant quantity. Keep personal data out of QR payloads, general search indexes, notifications, shared calendar titles, tags, and offline data downloaded to ordinary seasonal accounts. Test a worker account against forms, lists, search, exports, prints, notifications, and local device cache. “Staff arranging fulfillment” still needs a precise role definition and retention policy.
- Adoption must keep current tags in place. Digitize the written tag code first; use a scanner as an accelerator only after validating every tag style and wet/glare/dirty label conditions. Provide a short seasonal start-of-shift demonstration and a paper fallback for dead battery or unsynchronized work.

## 7. Discriminating validations proposed (none executed)

1. **No-network nursery walk:** use the actual target phones in both poor-coverage structures. Open the workflow before disconnecting, identify a tagged tray, record a movement and a count, close/reopen the app, and later sync. Check that local saved, pending, synced, and failed states are distinct; no record disappears after app restart; duplicate taps/retries do not duplicate stock effects.
2. **Two-device contention:** copy a batch with ten confirmed units to two devices, disconnect both, have one request/reserve six and the other request/reserve six, then reconnect in both orders. Confirm that neither device silently shows an authoritative commitment for twelve; both observations are preserved and a visible reviewer can resolve. For ODK, exercise entity conflict warnings. For a custom system, exercise queue/idempotency and conflict handling. For ERPNext, test whether reservation transactions reject or cap concurrent excess in a qualified sandbox.
3. **Forecast versus saleable count:** enter a forecast of thirty with uneven germination and a verified count of twelve. Check every product surface and report: no screen or message offers more than the accepted twelve less holds/reservations. Update readiness to a later interval without rewriting order history. Test a split cohort with two distinct readiness windows.
4. **Movement/order reconciliation:** move a tray across structure/bench/hardening/pickup and attach an allocation alias. Compare the phone’s current location, the event timeline, the physical tag, and the order’s picked quantity. Introduce a missing/duplicate scan and test the correction path.
5. **Missed readiness policy:** simulate past latest forecast date with a reserved order. Confirm it moves to a human decision queue and does not create a new promised date, notify a customer, release stock, or reallocate by itself. Once a policy is chosen, test each option and preserve the prior expectation.
6. **Accessibility and language:** observe the color-blind coordinator and workers in the task flow. Confirm status is understandable with colors disabled/monochrome, text contrast, icons and shapes. Ask workers to pick language(s); verify the exact translation and terminology of tray, count, forecast, hold, move, pickup, and “not confirmed” using their feedback rather than literal machine-translated labels.
7. **Privacy boundary:** create a seasonal-worker account and a fulfillment-role account. Try search, order list, forms, exports, print, deep links, QR data, notifications, and offline cache. Confirm seasonal workers can move/count/order-code quantities but cannot expose a customer’s identity/address; fulfillment role can retrieve just the necessary record. Test revoking access from a lost device/account.
8. **Unit/count behavior:** count individual seedlings and any proposed bundle/tray units. Verify one tray is not mistaken for a fixed plant count if germination varies. If ERPNext is used, configure a whole-number stock UoM and test conversion, partial reservation and cancellation against actual batch stock. Include negative-batch stock routes as an adversarial test because the inspected v15 docs and code need end-to-end verification.
9. **Budget/operational feasibility:** identify current device OS/storage, number of shared versus personal phones, available hosting/support, training hours, tag printing, and any paid service. Obtain a total first-season estimate including setup, data import, support, and recurring costs and confirm it stays under $5,500. No prices or staffing estimates were collected here.

These are proposed checks; no product, runtime, device, or nursery-floor validation was performed in this research stage.

## 8. Evidence limits and provenance

- Product version claims are pinned where full Git commit SHAs are available: ODK Collect v2026.3.5 and ERPNext v15.121.3. ODK’s retry fix is pinned to merge commit `12ef1a3…`.
- Official documentation pages are rolling and versionless unless they state a version. Exact URLs and grouped access checkpoints are in the source map. If a mutable page changes before design/build, capture a new source ID and re-evaluate the conclusion.
- farmOS Field Kit’s inspected README is unpinned and its older v1 guide is explicitly proof-of-concept; current release compatibility is uncertain. The farmOS.js page is a mutable 2.x documentation snapshot and should not be treated as current install guidance.
- The negative-stock observation is a static code review only. The pinned v15 bundle method has a conditional guard; not every caller or configuration path was traced and no transaction was run.
- No source from another case, campaign history, parent/counterpart, evaluator, or predecessor was read. No code was run, no executable was downloaded, and no test was executed. Prices, phones, supported languages, nursery counts, current tag quality, local infrastructure, and data-retention rules are unknown.

## 9. Obligation coverage before plan reveal

- **O1:** independently identified ODK Entities/Collect, farmOS/Field Kit, ERPNext batch reservation, a purpose-built local-first option, and paper-first transition; compared materially different approaches.
- **O2:** investigated exact offline version gates and conflict rules; ODK language/barcode/security behavior; farmOS asset/location/inventory types and LWW model; ERPNext UoM, batch, warehouse, stock reservation, permissions, and source code behavior; W3C color requirement.
- **O3:** retained ODK issue #4589 → merged PR #4655 / commit #12ef1a3 and the fix’s test coverage; noted the limits of historical evidence. Also identified ERPNext v15 batch/stock-reservation evolution and a source/docs uncertainty that needs a qualified test.
- **O4:** exact plan clauses not yet visible by instruction; clause comparison follows only after freeze/reveal.
- **O5:** keeps operational alternatives, missing inputs, conflicts, source caveats, and three user decisions above.
- **O6:** lists discriminating tests separately from execution; none is claimed to have run.
