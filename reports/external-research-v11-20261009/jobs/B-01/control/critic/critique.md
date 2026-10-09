# B-01 / I01 independent critic review

**Stage:** control/critic, M13 retained-graph-author-with-evidence-first-critic  
**Inputs reviewed:** the exact I01 brief, revealed P1–P6 plan, complete B-01/control/research draft and discovery, predecessor source map, and all eight bounded predecessor source notes.  
**Independent research:** direct review of public PouchDB, Firebase, GitHub, and Hogia primary materials; indexed in [source-map.json](source-map.json) with bounded notes in [sources/](sources/README.md).  
**Execution status:** this is a document/evidence critique. No app, runtime, test system, ferry capacity data, device, vendor demo, quote, or source code implementation was available or run.

## Overall assessment

The research and draft correctly identify admission control during a partition as the central technical risk. They distinguish local write capture from a globally confirmed vehicle slot; preserve the manager's open authority choice; and avoid presenting replication, cached reads, or later synchronization as conflict prevention. The Firestore transaction and offline-query limits, PouchDB conflict behavior, alternative capacity-entitlement policy, paper fallback, unknown budgets, and historical PouchDB issue-to-fix-to-release chain are represented with appropriate limits. Independent checks did not find a factual correction needed to those core claims. The PouchDB issue and 8.0.1 release are historical, version-scoped evidence, not evidence of a defect in a current build or this ferry application [C01–C05, C08–C09].

Three material changes should be made when the complete response is revised: correct the P4 disposition; make “continue operating” an end-to-end outage acceptance condition; and test durable offline work across the selected shared-device platform and process lifecycle. These findings do not justify resolving P5 on the operator's behalf. The remaining findings below are refinements to the existing proposal, not reasons to discard its discovery.

## Material findings

### M1 — P4 requirements are incorrectly downgraded to optional extensions

The revealed plan says: “Include large-text, high-contrast controls and a short handoff view for seasonal desk staff.” The draft calls large text partly covered but classifies the high-contrast treatment and handoff view as optional extensions. That disposition conflicts with the exact P4 clause, even though V6 later proposes testing enlarged text, high contrast, and a handoff guide. Under O4, P4 should be marked covered by the plan (while noting that exact scale, contrast target, device, and guide content remain to be specified); those items are pilot requirements for this plan, not optional additions. Keep the useful caveat that the brief does not define a formal accessibility standard or numeric threshold.

### M2 — V1 does not yet show what “continue operating” means through a half-shift outage

The brief requires both terminals to continue operating when unable to reach each other. V1 strongly tests conflicting last-slot claims, local changes, and reconnection, but its pass condition is chiefly that claims are not falsely represented as mutually confirmed and events are not lost. It does not say whether staff can complete the operational path during the reported outage: enter or count walk-ons, record a vehicle reservation/change, provide the loading team a usable local manifest or paper record, identify what can be promised, and hand off/reconcile the shift without silently double-entering paper and digital records.

Add a discriminating outage scenario to V1: sustain the actual disconnected state for the half-shift, perform representative desk and loading work at both terminals, and demonstrate the selected P5 policy at each step. Under provisional authority, state what staff may record, tell customers, and board against; under entitlement authority, test exhaustion and the shared tablet boundary. Preserve walk-on counts separately from named passenger records unless the operator supplies a reason to identify walk-ons. Pass only if an explicit local/paper procedure keeps the service moving, labels the authority/status of each entry, and reconciles every record once. This is a proposal; none of it has been executed. P5 remains a manager decision.

### M3 — Offline durability and cache behavior need a platform-specific restart test

The Firestore discussion correctly narrows persistent cache concerns to the web SDK, but it does not carry the platform/default distinction into V2 or an equivalent validation. Current Firebase docs state that Android and Apple offline persistence is enabled by default, while web persistence is disabled by default; the current web API uses a memory cache by default and offers persistent IndexedDB cache separately. The docs also restrict web persistence to Chrome, Safari, and Firefox and warn that persisted web cache is not automatically cleared between sessions [C03, C06].

Because the brief names shared tablets but not their OS, browser, app shell, or restart expectations, “Firestore supports offline writes” is not enough to decide whether half-shift entries survive a tab close, app restart, device restart, or worker change. Add an implementation-conditional validation for the actual chosen SDK/device: cut connectivity, create reservations and changes, restart/refresh at representative points, switch staff sessions, then reconnect; verify which records remain, which are queued, and that the staff UI never labels a local write server-confirmed. For a browser build, explicitly select and test current cache configuration rather than relying on the older `enablePersistence` sample. Treat survival across restart as an acceptance choice, not a claim already proven by the documentation. This is a focused extension of V2/V5, not a reason to reject Firestore as an alternative.

## Exact P-clause review

| Clause | Critic disposition | Evidence and needed treatment |
|---|---|---|
| P1 | **Accept; retain capacity-unit correction.** | The reservation list must show the actual vessel/departure's controlling passenger and vehicle resources. The draft appropriately leaves units, vessel limits, protected space, and conversion rules open until the operator supplies them. Avoid a generic passenger-seat-only assumption. |
| P2 | **Accept; retain event and outage-state detail.** | Day-of changes and assistance need a usable workflow while disconnected. The draft properly distinguishes recorded/provisional work from authority and sync, and preserves paper. Extend V1 as M2 asks so continuity is demonstrated operationally, not inferred from local storage. |
| P3 | **Accept; broadening is supported by the brief.** | The brief protects passenger details on a public queue. Names, contact details, revealing reservation identifiers, and accommodation notes are appropriate cases to test. Keep public and staff displays distinct and minimize shared-device cache data; do not put a wheelchair/assistance cue on the public display. |
| P4 | **Correct disposition (M1).** | The plan itself includes large-text, high-contrast controls and a short seasonal handoff view. Retain the draft's useful uncertainty about numeric accessibility targets, but do not label these plan elements optional. V6 already provides a useful validation direction. |
| P5 | **Accept as an operator decision; clarify consequences in outage test.** | Central confirmation with provisional disconnected records and preallocated local entitlements are materially different policies. The draft correctly rejects unrestricted stale-view confirmation. Do not choose one without the manager; make the safe interim status and customer-facing language explicit. |
| P6 | **Accept as an operator decision.** | Retention period and exact historical serialization are open. The export/exit recommendation fits the brief without selecting a legal retention duration. Keep full-history export distinct from a convenient daily report; do not promise attachments or restore until tested. |

## Discovery, mechanisms, and issue/fix evidence

- **Hogia BOOKIT:** The vendor's product page presents ferry booking, route/capacity, check-in, reporting and API capabilities, which supports keeping it as an RFP/demo lead. This is vendor evidence only. The public page does not establish price, disconnected dual-terminal behavior, local confirmation, or fit for a small operator. My direct page open returned a reader error; the official-domain search result exposed the page content. Keep the recommendation conditional (“screen with a quote and outage demo”), not as a selection or evidence-based affordability ranking [C07].
- **Firestore:** Offline cache, cached-only query limits, web persistence defaults, offline transaction failure, and usage-based price dimensions support the draft's caution that sync/cache is not a capacity reservation policy. The empty cached query is not proof that capacity is free; a transaction cannot commit while its client is offline [C03–C06]. The draft's one-route cost model remains proposed; no workload or region supports a calculated total. When the budget is modeled, include the current location/network egress rules and non-free backup/restore options as applicable [C05].
- **PouchDB/CouchDB:** Official guides support retrying live replication and paused/active status, and explain that disconnected same-document changes can leave a deterministic but arbitrary winner while conflicting revisions remain available for application resolution. This supports using the mechanism only with a separate business-level capacity rule and explicit conflict workflow [C01–C02].
- **Entitlements and paper:** These are correctly framed as application/operating policies, not database features. A safe quota needs a complete shared resource vector and must cover every admission channel (including walk-ons and multiple tablets), plus sailing swaps, cancellation, exhaustion, and dispatcher reassignment. V1/V3/V4 already approach these cases; carry the shared-channel condition into any eventual build acceptance criteria.
- **PouchDB evolution chain:** Independent review confirms the issue report's Chrome/IndexedDB/two-window reproduction, subsequent fix/test commits, the author saying the PR was merged, and the issue comment that 8.0.1 contained the fix. The 8.0.1 release notes tie the `changesHandler` fix to #8581 and the earlier refactor. The draft's narrow use—as justification to pin a chosen version and test multi-window notification, not to call current releases defective—is appropriate [C08–C09].

## Minor refinements

1. Use a reservation status model in which “saved locally,” “server-acknowledged,” “provisional,” and “capacity-confirmed” cannot be confused. `reconciled` describes sync/review history and should not imply a new capacity promise by itself. The draft's visible states point in this direction; define them before UX validation.
2. If a PouchDB option is selected, define collision-resistant event IDs and the authoritative ordering/reduction rules. A terminal-local sequence alone is not globally unique. The event log preserves provenance but does not enforce capacity; the draft already says so.
3. Keep the Firestore evidence version-conscious. Current JS API reference describes `persistentLocalCache`/IndexedDB and marks the older `enableIndexedDbPersistence` API obsolete; the predecessor evidence notes contain a legacy `enablePersistence` example. This is not a flaw in the high-level alternative, but an implementation should use the selected SDK's current API and re-check its version-specific limits [C06].
4. In V8, retain the vendor quote and actual region/workload inputs. The official free quota is not a total cost guarantee; the pricing page separately identifies location-dependent charges, outbound transfer, and backup/PITR/restore items without free usage [C05].

## Obligation and uncertainty audit

- **O1:** Satisfied in breadth: the draft compares a ferry-specific vendor, managed cloud cache, local-first replication, capacity entitlements, and paper. BOOKIT remains a lead only; the public source cannot establish fit or price.
- **O2:** Substantially satisfied for the mechanisms discussed: conflict/winner behavior, retry state, offline cache/query defaults, transaction behavior and limits, pricing units, and applicability are documented. The shared-tablet platform and persistence lifecycle need the conditional test in M3.
- **O3:** Satisfied. The source chain is relevant only if browser PouchDB is selected and is correctly scoped as historical.
- **O4:** P1, P2, P3, P5, and P6 dispositions are supported with the qualifications above. P4 needs the M1 correction.
- **O5:** Satisfied; constraints, alternatives, conditional policies, decisions, rejected claims, and unknowns are retained in prose.
- **O6:** V1–V8 are meaningful proposals and are not reported as executed. Add the M2 and M3 acceptance details before treating validation coverage as complete.

**Reviewer status:** retain the draft's core architecture reasoning and alternatives; revise the P4 classification and strengthen two acceptance tests before the complete final response is considered complete. No product selection, authority decision, budget fit, legal retention rule, or runtime result is established by this review.
