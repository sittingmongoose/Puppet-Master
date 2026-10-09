# I03 final planning recommendation — nursery batch, movement and fulfillment workflow

**Stage:** ER11 B-03/control/reviser, M05 retained-investigator  
**Evidence window:** 2026-10-09  
**Scope:** The exact I03 brief and the six exact revealed P clauses. This is a bounded planning recommendation for a two-family pilot, not a product selection, implementation specification, legal assessment, or claim that any proposed validation ran. The source register and access records are in [source-map.json](source-map.json); bounded evidence notes are in [sources/](sources/README.md).

## Recommendation

Run a two-family pilot that maps the nursery’s current paper bench tags and shared calendar into a phone-friendly record, without replacing those tools this season. Relate each variety and propagation batch to its existing tray/tag, current location, projected readiness window, physical count and unit, and an opaque order-allocation reference. Record moves, counts, losses, readiness changes, picks, corrections, and approvals as attributable events. Keep these separate quantities and states visible:

1. projected yield and readiness;
2. an observed physical count, with unit and observation time;
3. data uploaded to the system;
4. data validated and reconciled into the accepted stock record;
5. quantity held or allocated under a nursery-approved rule; and
6. quantity that an authorized person may promise to a customer.

One editable “available” number would conceal too much: germination is uneven, a stale phone may miss changes, and an upload acknowledgement says that data arrived, not that it has been reconciled or approved for allocation. A disconnected worker may capture an observation or move and see its local/queued status. Do not let an offline or stale balance create a binding hold or promise unless the nursery adopts a separate, explicit single-writer or physical-allocation procedure.

Keep names and delivery addresses out of seasonal-worker forms, lists, downloads, labels, and phone reference data. Use an opaque fulfillment ID in field work; expose the contact/address mapping only in a separately authorized fulfillment workflow. A role name alone is not evidence that a worker’s device, form choices, exports, notifications, attachments, or cache omit personal information.

Before custom development, ask Growflo, Atlas Core Tally, and Spriggo for written quotes and demonstrate the same pilot scenarios. They are horticulture-specific leads with relevant advertised batch/floor workflows, but their offline conflict behavior, access boundaries, tag compatibility, exports, and total cost remain unverified. ODK Collect is useful for a bounded field-form/language/movement-vocabulary pilot; it is not a shared stock ledger or reservation engine. ERPNext is a conditional option if the cooperative wants a configurable ERP and can support setup and operation; the inspected release-specific batch schema is instructive, but the evidence does not establish an offline nursery workflow. No product is selected here.

## Exact P-clause dispositions

Each quotation below is reproduced exactly from the revealed plan. The plan’s central intent is already covered in each clause; the additions below clarify safe interpretation and preserve unresolved nursery decisions.

### P1 — retain; correct the quantity model and preserve traceability

> Link propagation batches and bench locations to projected readiness windows and customer allocations.

**Already covered:** The clause already joins propagation batches, bench locations, projected readiness and customer allocations.

**Required interpretation:** Maintain a stable mapping from every current paper tag/tray identity to the digital batch/tray record. Preserve lineage when a tray moves or a batch is split. State the physical count unit and any conversion to an order unit; the brief does not say whether orders are individual plants, flats/trays, or mixed units. Keep projected yield, observed count, uploaded data, accepted stock, held/allocated stock and promiseable quantity distinct. Germination estimates alone must not create inventory or a firm commitment.

**Optional traceability:** Record the source tag, last physical count/review time, the reason for a readiness estimate, and a concise activity history. These help explain a discrepancy but should remain proportionate to the two-family pilot. Do not assume wholesale visibility, cost accounting, automated forecasting or general ERP features are needed.

**Condition still open:** The nursery must choose which count/status and approval makes quantity allocatable. ERPNext’s inspected `batch_qty` is a read-only `Float` stock balance with a linked stock UOM, not a propagation forecast; it does not establish that fractional plants are meaningful or settle the nursery’s units [ER11-S09, ER11-S25].

### P2 — retain; define the paper mapping and separate transport from business acceptance

> Record tray moves and fulfillment changes in a phone-friendly workflow that can coexist with paper tags during the pilot.

**Already covered:** Phone use, tray moves, fulfillment changes and paper-tag coexistence during the pilot are explicit.

**Required interpretation:** Retain the tag as the physical locator for this season and record its current identifier; do not require relabeling. For each relevant movement or count, record the batch/tray, origin and destination, event ID, actor, quantity and unit where applicable, local capture time, server receipt time, and reconciliation/approval status. Treat local capture time as an observation: a device clock is not an authority for event ordering. Correct a past event with a linked corrective event rather than silently erasing it.

Use four distinct lifecycle states in labels, logic, and reconciliation:

1. **Locally captured:** the phone has the action; it may still be a draft or an offline finalized form.
2. **Uploaded/transport-received:** the server has received the submission. This acknowledges transport only.
3. **Validated/reconciled:** an authorized rule has accepted, rejected, or sent the action for review in the nursery’s stock ledger.
4. **Promiseable/held:** an authorized quantity is available or reserved under a nursery-approved allocation rule.

ODK Collect’s offline workflow makes this distinction concrete: with no connection (or auto-send disabled), a form must be finalized to enter Ready to send; uploading changes its local status to Sent. Those states do not define the nursery’s business reconciliation or promise authority [ER11-S01, ER11-S21, ER11-S22]. Add a test where the server receives a submission but validation/reconciliation is delayed or rejects it. Do not change an accepted balance merely because transport succeeded.

**Approaches and boundaries:**

- A horticulture-specific product could reduce configuration if its vendor demonstrates offline queues, retry behavior, conflicting actions, privacy, existing-tag lookup and exports inside the budget.
- ODK Collect can test forms, language, codes and field vocabulary; download forms/reference data before entering a dead zone. It captures structured submissions but does not provide atomic shared-stock reservation or reconciliation. ODK Web Forms do not support offline submission. Enketo has a distinct offline queue and its automatic reconnect send depends on the form remaining open [ER11-S02, ER11-S22].
- A custom local-first event application can be tailored to the nursery but adds sync, security, hosting, support and reconciliation work.
- ERPNext provides a stock ledger and batch model, but the sources reviewed do not prove a ready offline floor workflow or an affordable adoption path.
- A spreadsheet or browser-only form is not established as safe for simultaneous offline stock changes.

**Rejected assumption:** A phone’s offline decrement is not a globally accepted reservation. If offline fulfillment must be exclusive, the nursery needs a separate physical-allocation, single-writer or later-confirmation rule.

### P3 — retain; keep forecasts, counts and promises distinct

> Show uncertain readiness and quantity changes without representing estimates as firm promises.

**Already covered:** The clause explicitly names uncertainty and rules out representing estimates as firm promises.

**Required interpretation:** Display readiness as an interval with its last review date and a forecast/observed status. Keep estimated yield separate from counted stock, accepted stock and confirmed availability. Show changes from moves, splits, losses, stale counts, unreceived actions and revised readiness estimates in a visible history/status. A stale device may capture a move but must mark its balance stale; it must not present a cached balance as guaranteed current stock. Only the nursery’s chosen and reviewed count/authorization rule can increase promiseable quantity.

**Optional presentation to test:** Pair concise text labels and an icon/shape cue rather than color alone; possible labels include Growing, Estimated, Ready for count, Counted, Held and Lost/closed. Use short action words and a second language chosen with staff and reviewed by a fluent speaker. These labels/language are options, not established preferences.

**Uncertainty retained:** No readiness-confidence method, count cadence, acceptable staleness period, or “ready” threshold appears in the brief. Do not invent yield probabilities or numerical thresholds. Set pilot pass/fail limits with staff before evaluating an implementation.

### P4 — retain; minimize personal data and test actual access paths

> Restrict customer contact and delivery details to staff who need them for fulfillment.

**Already covered:** The need-to-know boundary is explicit.

**Required interpretation:** Keep customer names and addresses out of seasonal-worker movement/batch forms, downloads, labels, reference data and Entity lists. A field worker may use an opaque allocation ID. Only a separately authorized fulfillment view should resolve it to contact and delivery details. Test lists, search, links, reports/exports, notifications, attachments, APIs and data cached on phones using seasonal-worker and fulfillment accounts. ODK Central’s Data Collector role can submit without viewing the submissions table, yet authorized-form Entities can be visible in form context; therefore, check the form and its choices/reference data rather than relying on role names [ER11-S03, ER11-S23].

**Optional, not a pilot requirement:** If a future data flow warrants ODK project-managed encryption, first confirm the deployed Central version and make a key-custody, backup and recovery plan. The reviewed docs say the passphrase cannot be recovered by Central if lost, that project-managed encryption cannot be disabled under the documented v0.6 behavior, and that previously submitted records are not encrypted retroactively. Blank forms and some last-saved local values remain unencrypted. Self-supplied-key encryption can constrain ordinary export/OData. Encryption does not replace minimization and access controls [ER11-S04, ER11-S24, ER11-S31].

**Uncertainty retained:** Product, hosting region, legal retention duties, and device-management practice are unspecified. No legal/compliance conclusion is made.

### P5 — retain both as nursery decisions; show count-ownership models without choosing one

> The owner of available-quantity adjustments and the approval for substitutions remain nursery decisions.

**User decisions:** Both ownership of available-quantity adjustments and substitution approval remain open. Support attributable observations, corrections and approval records, but do not assign permanent authority, configure permissions, or automate availability/substitution until the nursery chooses.

**Alternative A:** The propagation lead owns grow-stage physical counts, germination/loss adjustments and readiness; packers record actual picks, short-picks and fulfillment discrepancies. This puts production judgments with staff observing the trays and pick evidence with fulfillment staff; the nursery still needs a rule to reconcile differences.

**Alternative B:** One coordinator owns all changes to accepted available quantity. Propagation staff and packers submit observations/events; the coordinator accepts, rejects or requests correction. This narrows authority but may delay updated counts during peak work.

**Alternative C:** Assign a count owner by plant family, structure or shift, with packers recording pick events separately. This distributes work but requires handover and stale-device rules.

These are competing operating models, not a ranking. A hybrid could combine them only after the nursery decides who owns accepted availability. For substitutions, the nursery may require coordinator review of equivalent variety/readiness/allocation, customer agreement before any substitution, or a new fulfillment record and no substitution until approved. Do not auto-substitute after a stock mismatch. Record proposer, approver/rejector, quantity, time and reason. No evidence establishes the right role allocation.

### P6 — retain the deferral; keep wholesale and missed-window outcomes undecided

> Wholesale access and the handling of missed seasonal windows are not yet specified.

**Already covered:** The clause correctly defers both wholesale access and missed-window policy.

**Optional future extension:** Add a wholesale/customer view only if the nursery later asks for one. Do not expose a wholesale/customer portal in the two-family pilot. If customer classes are later modeled, keep contact/address data outside worker screens.

**Decision needed:** “Missed seasonal windows” may refer to an individual readiness estimate passing or to an entire seasonal sales/pickup season being missed. Keep these situations separate. A reasonable pilot safeguard to discuss is a review flag plus a revised estimate or “not confirmed” state when a projected readiness interval passes. Do not silently extend a promise, substitute, cancel, refund or contact a customer. The nursery must decide whether partial fulfillment is acceptable; whether to wait, reallocate or substitute; who may notify and when; and whether an order carries to next season, is renegotiated, or is canceled/refunded. The brief supplies no contract term, authority, timing or communication channel, so no outcome should be encoded as a default.

## Alternatives, evidence and applicability

### Nursery-specific product leads

- **Growflo Mobile Inventory** advertises nursery scanning, stock checks/movements/availability, offline work that syncs on reconnection, and ERP integration. The public material reviewed does not establish conflict resolution, customer-data access, supported devices, export terms or price. Treat the offline statement as a vendor claim and ask for a live disconnected two-device demonstration [ER11-S17].
- **Atlas Core Tally** describes Android stocktake/goods-in, QR/barcode plant-label scanning, dispositions such as dead/poor/quarantine/not found/moved, offline jobs syncing to Core, and separate count/receive/photo/review permissions. The page described iPhone as future. Label compatibility, price, collision behavior and support terms remain unknown [ER11-S18].
- **Spriggo** vendor material describes batch lineage, moves/splits/merges, worker capture and sales/order workflows. Its material advertises 90 days free then $300/month ($3,600 for twelve months before setup, equipment, training, taxes or add-ons); other features were shown as coming next. The feature-page extraction returned no page text and the claim was obtained from a search result/homepage, so verify current feature status, offline behavior, access, export, geography and the written quote directly [ER11-S19, ER11-S20].

The $5,500 ceiling may be one-time or first-year. At the advertised Spriggo price, $1,900 remains under a first-year reading before every other cost. No public Growflo or Atlas price was found in the reviewed source material. Ask every vendor to quote setup, subscription, twenty seasonal seats, phones/scanners, hosting, training, support, migration/export, taxes and exit support. No claim that these figures are current contractual quotes is made.

### ODK field capture

ODK Collect can support offline structured forms after form/reference download and can capture language-specific labels, numeric answers, repeats, barcode data and movement/loss/pick events. When offline or not auto-sending, finalized records wait in Ready to send. Finalized/sent editing is an explicit form-level option, off by default in the documented workflow. ODK Web Forms do not support offline submission; Enketo’s separate offline queue has different behavior. These transport behaviors support a bounded vocabulary/field pilot, not an inventory ledger or reservation guarantee [ER11-S01, ER11-S02, ER11-S05, ER11-S21, ER11-S22].

### ERPNext batch and permissions model

The inspected ERPNext v15.122.0 release-tag schema has a required unique `batch_id`, required Item link, optional Parent Batch link, manufacturing/expiry date fields, a read-only Float `batch_qty`, and a read-only stock-UOM link fetched from the stock Item. Its batch code calculates stock quantity by item/batch/warehouse and supports splitting/recalculation. Version 15 documentation describes batch quantities, stock movements/splits and a negative-stock guard for batch/serial items, with a per-batch override that may harm valuation. This is a stock ledger pattern with a quantity type and UOM; it is not a germination forecast or evidence that fractional plants are valid. Permissions include roles, DocTypes, field permission levels and user restrictions; a hidden field alone does not prove an address cannot be reached through lists, links, search, exports, attachments or APIs [ER11-S08–ER11-S12, ER11-S25].

Use ERPNext only if the cooperative wants a configurable ERP and can budget for configuration, offline-fit proof, migration, training and ongoing support. A source-level schema or an old fix is not a nursery acceptance test.

### Local-first replication architecture

RxDB is an architecture example, not a selected dependency. Its docs describe offline reads/writes and later replication. Reconnect catch-up uses checkpoint iteration because a client may miss streamed events; documents need deterministic checkpoint ordering, often with a stable key as a tie-breaker. Retried writes may be delivered twice if the server committed but the reply was lost, so the backend needs idempotency/unique event IDs. The docs warn that client clocks cannot be trusted. The default conflict example keeps the master/server version and discards the local fork; the transaction page says intermittently offline clients have no cross-client ACID transaction, though a single document write is atomic. Do not let disconnected phones independently decrement one shared quantity record [ER11-S15, ER11-S16, ER11-S26, ER11-S27].

If a custom replicated app remains under consideration, treat local capture time as an observation; have the server assign an authoritative receive/sequence value and deterministic tie-breaker; catch up missed remote events after reconnect; deduplicate retries; and route conflicting quantity effects to reconciliation. The RxDB docs list live replication, autoStart, a five-second retryTime, waitForLeadership for multi-instance use, push batch size 5, pull batch size 10 and `_deleted` as defaults/examples. These are documentation examples/defaults, not measured deployment limits or a reason to choose RxDB. Pin and check the actual package/version and backend behavior before implementation [ER11-S15].

### Issue and release evolution

**ODK Collect issue #1703:** The issue describes confusing errors when connectivity interrupts form download/submission. A 2020 comment says v1.28.0 improved form-list connectivity messaging while individual form failures remained generic. In October 2021, a maintainer says issue #4489 addressed manual-download messaging and that the pattern would be applied to other downloads/uploads, then closes #1703 as covered by other work. Issue #4489 is an issue, not a merged pull request in the inspected lineage. This supports explicit queue, receipt, retry and error states; it does not prove every upload fix shipped [ER11-S06, ER11-S07, ER11-S28].

**ERPNext issue/fix chain — correction accepted from review and independently rechecked:** Issue #38796 reports a v15.6.1 cancellation failure while reconciling old pre-v15 batch stock and was closed as completed in PR #38754. PR #38754 merged into `develop` on 2023-12-17 and records a test case. The v15 backport PR #38806 merged into `version-15-hotfix`; its activity and release entry identify inclusion of that backport in v15.7.0 on 2023-12-20. Therefore it is incorrect to say there is no verified fix/backport for the specific #38796 path. The evidence does not establish that every old-stock reconciliation/cancellation path is fixed, that nursery-like migration data was exercised, or that the later inspected v15.122.0 is free of related defects. The v15.7.0 release note also lists a separate “not able to cancel SCR with Batch” fix (#38817/#38821/#38829); keep it distinct from #38796 and do not claim either fix covers all cancellation cases. The original research map’s #38840 pointer is retained as an immutable source record, but it is not the resolution identified on #38796; the corrected resolution chain is #38754 → #38806 → v15.7.0. Keep a representative migration/reversal test if ERPNext is selected [ER11-S13, ER11-S29, ER11-S30, ER11-S32, ER11-S33, ER11-S34].

## Critic findings adjudicated

- **M1, ERPNext resolution chain — accept and amend.** The primary issue, merged PR, v15 backport and release entry support a fix for the exact reported path. The final narrows the claim as above and retains migration/reversal validation. It does not call #38840 the resolution or treat the historical issue as a current defect [ER11-S29, ER11-S30, ER11-S32, ER11-S33, ER11-S34].
- **M2, upload receipt versus accepted stock — accept.** All product-direction and validation language now separates local capture, transport receipt, business reconciliation and promiseable/held quantity. A delayed/rejected-reconciliation case is added. This is a product-design inference from ODK submission-state documentation; no claim is made that ODK itself performs nursery reconciliation [ER11-S21, ER11-S22, ER11-S37, ER11-S38].
- **M3, clocks and catch-up — accept.** Any conditional local-first approach must treat device time as observational, assign authoritative server ordering/receipt or an explicit sequence, use deterministic checkpoints/tie-breakers, catch up missed events on reconnect and deduplicate retry writes. Clock-skew and reconnect-gap validations are added. RxDB remains an architecture example, not a selected dependency [ER11-S26, ER11-S27, ER11-S35, ER11-S36].
- **Minor finding 1, ODK project-managed encryption — accept as an optional caveat.** Use the specific term; disclose passphrase loss, documented inability to disable, non-retroactive coverage, blank/last-saved data limitations and export consequences. No encryption requirement is introduced [ER11-S24, ER11-S31].
- **Minor finding 2, validation criteria — accept.** Before pilot testing, have staff approve pass/fail limits for completion time, correction/error rate, reconciliation delay and data staleness. Values remain unknown; none are invented.
- **Minor finding 3, P5 anchoring — amend.** Remove the single “proposed default” as a leading recommendation. Keep the propagation-lead/packer/coordinator combination only as a possible hybrid after the equally presented A/B/C models and only if the nursery chooses it. No role policy is selected.
- **Minor finding 4, encryption terminology — accept.** Refer to “project-managed encryption,” not an ambiguous “project-managed” mode.
- **No-correction findings — retain.** The ODK offline distinction, careful limit on the #1703 message history, RxDB warning against shared mutable offline quantity, ERPNext batch schema/permission applicability limits, vendor-claim caveat, and distinction between proposed and executed checks remain supported by the inherited and rechecked primary evidence. None is expanded into a product guarantee.

## Discriminating validation proposals

No application, runtime, test sandbox, witness or vendor demo was available. **None of these validations has been executed.** Treat all as proposed work. Before the pilot, staff must choose measurable pass/fail thresholds where the brief provides none, including acceptable correction/error rate, maximum reconciliation delay, data-staleness limit and completion-time target.

1. **Paper-tag continuity:** For both pilot families, locate each existing tag, move a tray and match it to digital batch/tray and opaque allocation references without relabeling. Record unmatched tags, duplicate IDs, errors and time.
2. **Offline capture and retry:** Download forms/reference data; enter move/count actions in each weak-signal structure; close/reopen the app; reconnect; verify locally captured records survive and display transport/reconciliation states distinctly. Simulate commit with a lost response and resend; there must be one accepted event effect, not duplicate quantity.
3. **Receipt without acceptance:** Let the server receive a form while reconciliation is delayed, then reject one malformed/out-of-order event. Verify that upload acknowledgement does not increase accepted or promiseable quantity and that the worker/coordinator can see the pending/rejected reason and corrective path.
4. **Two-device collision:** Start two devices from the same batch snapshot, disconnect both, record overlapping moves/counts/losses, and reconnect in both orders. Verify no event silently disappears, duplicate delivery is idempotent, balances are explainable, and overlapping quantity effects are visibly routed to human reconciliation.
5. **Clock skew and reconnect gap:** Set one device clock ahead and one behind; create events and remote changes while offline; reconnect after stream events have been missed. Verify device timestamps do not determine authoritative order, checkpoint catch-up retrieves remote changes, and a stable server sequence/tie-breaker leaves every event accounted for.
6. **Forecast versus promise:** Use an uneven-germination case and revise the readiness interval. Verify forecast yield does not become confirmed availability until the chosen count/approval rule passes; no customer view labels an estimate as confirmed.
7. **Move, split and lineage:** Move a tray between structures, split a batch, record loss, and fulfill part of an order. Verify parent/child links, count units and allocation stay traceable and the same plants are not counted twice.
8. **Missed window:** Let a readiness interval pass without enough plants. Verify the system flags human review but does not notify, extend, substitute, cancel or refund automatically. Exercise the nursery’s chosen outcome in a paper/prototype scenario.
9. **Privacy:** Use seasonal-worker and fulfillment accounts. Probe form fields, Entity/choice lists, search, links, exports/reports, notifications, attachments, APIs and phone caches. Workers must not recover names/addresses; fulfillment staff must still complete pickup. Record tested routes and evidence for each role.
10. **Accessibility and language:** Have the color-blind coordinator identify every state from its label and redundant shape/icon; have English-second-language workers complete a move/count in a staff-selected translation reviewed by a speaker. Record errors and completion times; use staff-approved thresholds.
11. **Units and counting:** Ask staff to demonstrate plant, tray/flat and order conversions on representative lots. Verify permitted quantity precision, rounding, split and short-pick handling against a signed-off nursery unit rule.
12. **Budget and procurement:** Compare written quotes under both one-time and first-year readings of $5,500, including twenty seasonal workers and all devices/support. Ask vendors to demonstrate offline collision/retry, export and address restriction using test data.
13. **If ERPNext is selected:** Import representative old/current tags and batches; move/split; reconcile quantity/UOM; restrict customer fields; cancel/reverse representative old and imported transactions; and reconcile ledger balances. Do not infer migration safety from current code or the #38796 fix alone.
14. **If ODK is piloted:** Confirm form download, offline finalize, Ready-to-send, upload, Central receipt, and later business reconciliation on target Android devices. Test form-version changes and role access. Verify exported events have stable IDs and can be deduplicated. If encryption is considered, test key custody, backup/recovery, export and the exact deployed-version limitations before enabling it.

## Decisions and uncertainty register

Resolve with nursery staff before configuration or promise automation:

- Whether $5,500 is a one-time or first-year ceiling and which equipment, seats, training, recurring fees and support it covers.
- The tag format/data quality and whether lookup/scanning is practical on current devices; current phone/OS and dead-zone duration.
- Whether counts/orders use individual plants, flats/trays or multiple units; divisibility and conversion/rounding rules.
- Who owns grow-stage observations, accepted-quantity adjustments, stock reconciliation and substitution approval; what requires coordinator confirmation.
- What municipal orders require; household/municipal allocation semantics and whether any partial fulfillment is acceptable.
- What happens when an individual readiness interval or a full season is missed, including notification timing, carryover, reallocation, substitution, cancellation/refund and authority.
- Readiness-confidence method, count cadence, staleness threshold, language choice, local retention, device management and vendor terms.
- Whether wholesale access is wanted later; it is not part of this pilot.

These are unresolved product/operating decisions, not implementation assumptions. Until decided, show uncertainty and route consequential changes for human review.

## Evidence and execution limits

**Inspected/rechecked:** Exact assignment inputs; full research draft and discovery/evidence notes; complete critic report and its declared evidence; exact six revealed P clauses; public primary sources for ODK, ERPNext, and RxDB recorded by immutable IDs in the source maps. The ERPNext issue/PR/backport/release chain, RxDB reconnect/checkpoint/retry/transaction limits, ODK upload states and encryption caveats were independently reopened for this revision. No source ID was silently rebound; the reviser rechecks have new IDs in this stage’s map.

**Not executed:** No code or application was built/run; no source build, migration, sandbox witness, test script, device, vendor demo, staff observation, quote, privacy test, acceptance test or proposed validation was run. No budget, accessibility result, operational fitness, legal compliance or product performance is established. This final preserves inherited vendor/source claims as claims and marks planned checks as proposals.
