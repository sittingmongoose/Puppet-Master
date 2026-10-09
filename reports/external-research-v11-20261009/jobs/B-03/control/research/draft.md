# I03 planning draft — nursery batch, movement and fulfillment workflow

**Research stage:** ER11 B-03/control, M05 retained-investigator  
**Basis:** I03 brief, independent discovery frozen before reveal, and the exact six clauses in the revealed case plan. Clause text is reproduced verbatim below. Source details, versions/commits, access windows and locators are in [source-map.json](source-map.json); bounded primary-source evidence is in [sources/](sources/README.md).

## Product direction

Plan a two-family, phone-friendly pilot that preserves paper tags and the shared calendar for the season. It should connect a plant variety and propagation batch to a tray/tag, location, readiness window, physical count/unit, and opaque order-allocation ID. Capture moves, counts, losses, readiness changes and picks as attributable, timestamped events. Keep projected yield, physically counted stock, allocated/held stock, and firm customer promises as separate concepts.

Disconnected workers may record local actions and see an explicit queued/pending state. Their entries become accepted stock only after synchronization and reconciliation. A stale or disconnected display must not allow a binding promise or reservation unless the nursery chooses a separate single-writer or physical-allocation rule. This follows the limits documented by offline-first replication systems: devices can edit independently, retry duplicate writes, miss remote events and conflict after reconnection; the inspected RxDB default keeps server state on a conflict. Event IDs, deduplication and an authoritative accepted ledger are needed if building a custom system [ER11-S15, ER11-S16].

Prioritize a demo/trial of nursery-specific products before a custom build: Growflo claims offline scanning/movements and reconnect sync; Atlas Core Tally claims offline stocktake/goods-in, existing label scans and permission-gated work; Spriggo claims batch lineage and worker/order workflows with a public $300/month list price after a 90-day trial. These are vendor claims, not verified behavior. Get written first-year pricing and demonstrate offline collisions, privacy, existing tags and export before selection [ER11-S17–ER11-S20]. A bounded ODK Collect pilot can validate forms, language and movement vocabulary, but it is not a stock ledger or reservation engine [ER11-S01–ER11-S05]. ERPNext is an alternative if the cooperative wants a configurable ERP and can fund/support its setup; its pinned batch schema is useful for explicit IDs, UOM and parent lineage, but the inspected sources do not establish a ready disconnected-worker workflow [ER11-S08–ER11-S14].

## Exact P-clause dispositions

### P1 — retain, with required model corrections and optional traceability detail

> Link propagation batches and bench locations to projected readiness windows and customer allocations.

**Already covered:** The plan correctly joins propagation batches, locations, readiness projections and allocations.

**Correction required for safe interpretation:** Preserve a stable mapping from each current paper tag/tray to its digital batch/tray identity. Distinguish (a) expected yield and readiness interval, (b) observed physical count, (c) quantity accepted into inventory, (d) quantity held/allocated, and (e) quantity that staff may promise. Do not use one editable “available” number for these. State count unit and any conversion to order units; the evidence does not establish whether the nursery sells single plants, trays/flats or mixed units. Batch identity follows a split/move; a tray or child batch must not lose its parent/history.

**Optional enhancement:** Record source tag, last physical count/review time, readiness confidence or uncertainty reason, and activity history. Start with only the two pilot plant families. Do not assume wholesale visibility, cost accounting, forecasting automation or other ERP capabilities are required.

**Condition:** The nursery must identify which physical count/status makes a quantity allocatable. Germination expectations alone are forecasts, not promises.

### P2 — retain, with offline acceptance and paper-compatibility conditions

> Record tray moves and fulfillment changes in a phone-friendly workflow that can coexist with paper tags during the pilot.

**Already covered:** Phone use, tray moves, fulfillment changes and coexistence with tags during the pilot are explicit.

**Correction/condition:** A phone action made without a connection must remain visibly pending until the server accepts it. Keep the paper tag as the physical locator for this season; map its present identifier and avoid replacing tags. Record move origin and destination, batch/tray ID, event ID, actor, quantity and unit where relevant, local capture time, server receipt time and reconciliation status. Use a new corrective event for a change to a past count/move rather than erasing the earlier event. Offline order holds and promises require a named coordinator confirmation or another nursery-approved single-writer rule.

**Alternatives:**
- A horticulture product may fit better if a vendor proves its offline queue, collision policy and rollout within budget.
- ODK Collect is a candidate for testing forms and field vocabulary; forms must be downloaded ahead of dead zones and later synchronized. It does not create atomic shared inventory.
- A small custom local-first event app offers tailored workflow but incurs design, sync, security, hosting and support work.
- ERPNext offers a stock-ledger/batch model and access configuration but should be chosen only if offline floor use and configuration burden are demonstrated.
- A spreadsheet or browser-only form is not established as safe for concurrent offline stock updates. ODK Web Forms themselves do not support offline submission; Collect and Enketo have distinct offline behavior [ER11-S02].

**Rejected as an assumption:** Treating an offline local decrement as a globally accepted reservation. No source examined establishes that disconnected devices can coordinate exclusive stock promises.

### P3 — retain, with explicit uncertainty and quantity states

> Show uncertain readiness and quantity changes without representing estimates as firm promises.

**Already covered:** The plan names uncertainty and rejects converting estimates into promises.

**Correction required:** Show readiness as a start/end window, with last review date and a clear forecast/observed status. Show estimated yield separately from counted stock and confirmed available quantity. A move, split, loss, stale count, unreceived offline action or readiness-window change should have a visible state/history. Only an agreed and reviewed count/authorization can increase promiseable quantity. A stale device may capture a move but must not display its last cached balance as guaranteed current stock.

**Optional enhancement:** Use simple labels such as Growing, Estimated, Ready for count, Counted, Held and Lost/closed, paired with text and icon/shape rather than color alone. Use short action words and a second language selected with staff and checked by a speaker. These are candidate labels; validate them in the pilot.

**Unresolved condition:** The readiness confidence method, count cadence, acceptable staleness interval and threshold for “ready” are not established. Do not invent yield probabilities from the brief.

### P4 — retain, strengthen through data minimization and permission testing

> Restrict customer contact and delivery details to staff who need them for fulfillment.

**Already covered:** The plan has the correct need-to-know boundary.

**Correction required:** Keep names and addresses out of seasonal-worker batch/movement forms, downloads and reference/Entity lists. Workers can use an opaque fulfillment ID; only a separately authorized fulfillment view should resolve it to contact/address details. Test access to lists, search, links, exports/reports, notifications, attachments, APIs and data cached on phones. ODK Central Data Collectors can submit but cannot view submissions, while form-attached Entities can be visible in form context; role names alone therefore do not guarantee that PII is absent from a worker device [ER11-S03].

**Optional enhancement:** Consider project-managed encryption for records that need it after checking data export and recovery procedures. ODK documentation says managed encryption uses a passphrase/key and finalized-submission protection, with limitations including blank forms and some local last-saved values; self-supplied-key encryption can constrain ordinary exports/OData. Encryption supplements minimized access; it does not replace it [ER11-S04].

**Uncertainty:** The eventual product, hosting region, legal retention obligations and device-management practice are not specified. No compliance conclusion is made.

### P5 — retain as explicit nursery decisions; present alternatives, do not silently choose

> The owner of available-quantity adjustments and the approval for substitutions remain nursery decisions.

**User decision:** Both ownership of available-quantity adjustments and substitution approval remain open. The product should support attributable changes and an approval record without assigning permanent authority until the nursery chooses.

**Alternative A:** Propagation lead owns grow-stage physical counts, germination/loss adjustments and readiness; packer records pick quantity, short-pick and fulfillment discrepancies. This keeps production judgments with the people observing trays and packing evidence with fulfillment staff, but needs a rule for reconciling differences.

**Alternative B:** One coordinator owns all changes to the accepted available quantity; propagation staff and packers submit observations/events, and the owner accepts/rejects them. This narrows authority but can delay current counts during peak work.

**Alternative C:** Designate one count owner by plant family/structure or shift, while retaining separate packer-confirmed pick events. This distributes work, but handover and stale-device rules must be defined.

For substitution, options include coordinator approval after checking equivalent variety/readiness/allocation, customer agreement before any substitution, or no substitution without a fresh fulfillment record. Do not auto-substitute on a stock mismatch. Record who proposed, approved/rejected, quantity, time and reason.

**Proposed pilot default for decision, not an assumed rule:** Propagation lead records grow-stage count/loss/readiness; packer records actual picked quantity and exceptions; a coordinator approves accepted availability and substitutions. Confirm with the nursery before configuring permissions or automation.

### P6 — retain unknowns; defer wholesale, require a missed-window decision

> Wholesale access and the handling of missed seasonal windows are not yet specified.

**Already covered as an explicit deferral:** The plan correctly leaves wholesale access and missed seasonal windows unresolved.

**Optional enhancement/defer:** Keep wholesale as a possible later view only if the nursery later wants it. Do not expose a wholesale/customer portal in the two-family pilot. Define an extension point for customer classes without putting contact/address data into worker screens.

**User decision:** “Missed seasonal windows” could mean a missed seasonal sales/pickup season or an individual projected readiness window. Keep those meanings separate. For a projected readiness window that passes, a safe pilot behavior is to flag the batch/allocation for coordinator review and show the revised estimate or “not confirmed”; do not automatically extend a promise, substitute, cancel, refund or contact the customer. The nursery must decide when it wants a customer notified, whether partial pickup is acceptable, whether to wait, reallocate or substitute, and whether to cancel/refund. For an entire missed season, ask whether orders carry to the next season, are canceled/refunded, or are individually renegotiated.

**Uncertainty:** No rule, authority, timing, customer contract or communication channel is in the brief. Product design may support these options, but no default outcome should be encoded until decided.

## Retained findings, conditions and rejected approaches

The vendor alternatives are retained for procurement comparison because horticulture-specific products advertise batch lineage and floor capture. Their advertised offline behavior, price and permission behavior remain unverified. Spriggo's current advertised $300/month would consume $3,600 in twelve months before setup or equipment; confirm whether the ceiling includes a year of recurring fees and all twenty seasonal workers. Growflo and Atlas prices were not found in inspected public material. All vendors should quote setup, subscription, seasonal seats, scanners/phones, hosting, training, support, data migration, export and taxes.

The following approach assumptions are rejected for this scope:

- ODK Web Forms as the disconnected field application; ODK documentation says offline submission is unsupported. ODK Collect can be piloted, but it is event capture, not a complete stock ledger.
- A shared mutable quantity field decremented independently by offline phones; source evidence shows replication conflicts, duplicate retries and no multi-client transaction guarantee in the cited local-first architecture.
- Encryption as the only privacy control; forms/reference data and some local values may remain present, and access must still be minimized.
- Automated customer substitution or promise changes without nursery approval.
- Replacing the existing paper tags during the season or adding wholesale/public access to the pilot.

The ERPNext batch schema demonstrates explicit unique identity, item linkage, parent-batch history, date fields, quantity type and UOM linkage. Its negative stock guard and migration history are relevant patterns, but not a recommendation to install ERPNext without validating offline use, training and total operating cost.

## Discriminating validation proposals

No runtime, implementation, test sandbox or witness was available. None of the following checks has been executed.

1. **Paper-tag continuity:** In the two-family pilot, scan or look up each existing tag, move its tray, and match it to the digital batch/order allocation without relabeling. Record mismatches and time needed.
2. **Offline queue and retry:** Download current reference data, enter a move/count in each weak-signal structure, close/reopen the app, reconnect, and verify the event is retained and marked pending until acknowledged. Simulate retry after server commit but lost response; confirm one accepted event, not a duplicate quantity change.
3. **Two-device collision:** Take two devices offline with the same batch snapshot; record overlapping move/count/loss actions and reconnect in both orders. Verify no event disappears, duplicate is idempotent, server balance is explainable, and conflicting/uncertain availability is flagged for a human.
4. **Forecast versus promise:** Use an uneven-germination scenario and a revised readiness window. Verify projected yield does not increase firm availability until the chosen count/approval rule passes; no customer-facing view labels an estimate as confirmed.
5. **Move, split and lineage:** Move a tray across structures, split a batch, record a loss, then fulfill part of an order. Verify source/child links, counts, units and allocation remain traceable and double-counting is prevented.
6. **Missed-window behavior:** Let a projected interval pass without enough plants. Verify the system creates a review item but does not notify, extend, substitute, cancel or refund automatically. Exercise the nursery's chosen response on paper/prototype.
7. **Privacy:** Use seasonal-worker and fulfillment-staff accounts. Search/open forms, entity choices, lists, links, exports, notifications, attachment access and local caches. Worker account must not recover names or addresses; fulfillment staff must still complete pickup.
8. **Accessibility:** Have the color-blind coordinator identify every state using the proposed labels; have English-second-language workers complete a move and count in a translated form reviewed by a speaker. Record errors and completion time; verify color is redundant.
9. **Units and counting:** Ask staff to perform plant, tray/flat and order conversions on representative lots. Verify allowed quantities, rounding, split and short-pick behavior against a signed-off unit rule.
10. **Budget and procurement:** Compare written first-year quotes under one-time and year-one interpretations of $5,500, including all twenty seasonal workers and required devices/support. Require vendors to demonstrate offline conflicts, export and access restrictions using test data.
11. **If ERPNext is selected:** Import representative old/current tags and batches, move/split, reconcile quantity/UOM, restrict customer fields, then cancel/reverse old/imported transactions and check ledger balances. Do not infer migration safety from current batch code alone.
12. **If ODK is piloted:** Confirm offline form download/finalize/Ready-to-send/reconnect behavior on target Android devices, test form-version changes and role access, and verify exported events can be deduplicated by a stable event ID.

## What is established and what remains uncertain

Executed: read the exact brief/input map; inspected the public primary sources listed in the source map; opened ERPNext v15.122.0 batch JSON/Python under a release tag; invoked the required reveal script successfully; wrote the pre-reveal discovery/source map and this plan-comparison draft.

Not executed: any device test, app/runtime test, code witness, vendor demo, budget quote, privacy penetration test, staff observation, or validation proposal above. The assignment's no-nested-agents constraint meant there was no separate external critic or reviser. A separate internal critique/revision pass followed; it is not independent review.

## Source guide

- ODK workflow, privacy and accessibility: ER11-S01–ER11-S07 in [source-map.json](source-map.json), with evidence in [sources/odk.md](sources/odk.md).
- ERPNext batch model, access and evolution: ER11-S08–ER11-S14, with evidence in [sources/erpnext.md](sources/erpnext.md).
- Local-first sync semantics: ER11-S15–ER11-S16, with evidence in [sources/rxdb.md](sources/rxdb.md).
- Nursery vendor leads: ER11-S17–ER11-S20, with evidence in [sources/nursery-products.md](sources/nursery-products.md).


## Post-critique revision

For household and municipal allocations, optionally store an order class and required pickup/delivery window alongside the opaque allocation ID. This can distinguish service timing and quantity rules without exposing customer contact/address details to seasonal workers. Ask coordinators whether that distinction is operationally useful before adding it to the pilot.

For phone usability, test a short one-action flow for move, count, loss or pick, with large touch targets, simple verbs, text/icon/shape state cues, and a staff-selected second language reviewed by a fluent speaker. These are design options to validate with the named users, not assumed acceptance criteria.

Product choice remains open. First request written current first-year quotes and run the same offline/collision/privacy/tag/export demonstration across Growflo, Atlas Core Tally and Spriggo; include ODK as a limited form-capture pilot and ERPNext only if the cooperative is prepared to configure/support an ERP. Select only after the nursery clarifies the $5,500 ceiling and the demonstrations show acceptable queue acknowledgement, no silent stock loss, restricted address access, and data export. No product has been selected by this research.
