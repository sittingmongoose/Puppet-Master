# Independent critic review — B09-P01-control

**Stage:** critic  
**Reviewed inputs:** the frozen brief, complete investigator discovery and draft, investigator source map/index, the released plan, and its reveal record.  
**Plan preservation:** SHA-256 of the revealed plan is `42c359b02876f8ba1620ebdd8fcfb1813194047145111d5443c58510e6ebe9b4`, matching `plan-reveal.json`. The discovery SHA-256 is `8e2295083c78ecbb909d0fa8eeefdfa4aeaa65d0ca717fe0e806c73713582be5`, also matching the reveal record.  
**Review boundary:** read-only source review. No product was installed or exercised. This critique assesses the proposal; it does not select a product or revise the draft.

## Assessment

The draft is faithful to the brief and the one-time released plan. It preserves the hard constraints, treats the plan’s unresolved operating rules as organization decisions, compares feasible approaches without endorsing a winner, and distinguishes inspected evidence from proposed tests. Its plan-disposition table is complete and its discovery findings survive the reveal.

Finding classes: **0 material wrong; 2 material incomplete; 0 unsupported claims; 0 separate minor locator/wording findings;** policy and product questions listed below remain honestly unresolved external input.

I found **no material wrong claim** in the draft. Two material-incomplete points should be made explicit before candidate fit is judged: the exact per-piece record/barcode burden of Koha bundles, and the Snipe-IT check-in eligibility path when an asset is moved into a non-deployable maintenance status. Neither finding proves that a product fails; both affect a requirement the proposal correctly says must be tested. Product behavior beyond documentation/source inspection remains honestly unresolved.

## Findings

### M-01 — Koha bundle fit omits a consequential child-item constraint
**Classification:** material incomplete  
**Draft locators:** “Exact clause disposition” row “A kit is a parent with a parts checklist”; “Comparison without selecting a winner” / Koha; “Proposed data and transaction contract” / Kit.  
**Evidence:** The Koha manual’s bundle workflow adds existing item records by scanning their barcodes; added items remain attached to their original records, are marked not-for-loan, and cannot be checked out individually (K02, circulation manual, bundle creation around §§ 697–712). Return prompts staff to scan each expected child barcode, but verification can be skipped; missing pieces may be marked lost and tied to a checkout claim (K02, bundle check-in/missing items around §§ 757–805). Cataloging’s “materials specified” field is text, not an enforced substitute for the bundle relationship (K03).  
**Why it matters:** The draft says child IDs are needed where loss, damage, replacement, or independent tracking matters, while presenting Koha’s native bundles as its strongest kit fit. Koha’s documented bundle path appears to require an item record/barcode for every child included in that bundle. The draft mentions barcode-based membership and the missing-item rule, but leaves that per-piece implementation burden and the “not individually loanable” constraint implicit.  
**Critic judgment:** Clarify this as a Koha-specific fit condition and test it against representative kits, including small removable pieces. Whether every piece merits an ID, or whether a different checklist workflow is preferable, is an owner/product-fit decision.

### M-02 — Snipe-IT check-in status predicate needs an explicit path-level test
**Classification:** material incomplete  
**Draft locators:** “Exact clause disposition” row “Incomplete or damaged return stays in maintenance review”; comparison table / Snipe-IT; validation item 3 “Return/hold.”  
**Evidence:** The release-pinned v8.8.0 `Asset.php` model has separate `availableForCheckout()` and `availableForCheckIn()` predicates. The latter requires an assigned asset and, except for the deleted-asset case, a non-archived status marked deployable (S07, lines around 3175–3198). The draft cites the checkout availability predicate, correctly says that a maintenance status and return-screen transition are unverified, and proposes a no-availability-window test.  
**Why it matters:** If a proposed non-deployable hold status is applied before a check-in path evaluates eligibility, the code-level predicate may affect whether that return path remains available. The model excerpt alone does not establish the actual UI/API call order or prove a defect.  
**Critic judgment:** Keep Snipe-IT’s hold workflow unresolved until the test covers the exact check-in path and status-transition order, including simultaneous checkout attempts. Add the `availableForCheckIn()` locator to the evidence trail. This is a product-specific validation condition, not a claim that Snipe-IT cannot support a safe return.

### No material wrong claims found

The most consequential guardrail claims checked against primary material are accurate and appropriately bounded:

- Koha’s damaged flag marks an item unavailable in search but does not itself prevent checkout or check-in; the not-for-loan override defaults to Allow; a configured check-in mapping maps an existing not-for-loan value (K09, cataloging and circulation-preferences manual).
- Koha automatic check-in is optional and requires item-type setup plus a cron job (K02, circulation manual § 495–499).
- Koha’s offline plugin records local transactions; current holds and patron restrictions may be stale; logs from multiple computers must be grouped and ordered before processing (K06, circulation manual § 2160–2268). The draft therefore does not present it as live multi-writer availability.
- Snipe-IT’s release-pinned checkout availability predicate is status-sensitive, while the draft explicitly declines to treat it as proof of a safe return/hold workflow (S07).
- PostgreSQL row locks block conflicting writers/lockers on the same row until transaction end; the draft accurately says this is a primitive and still calls for application revalidation and constraints (A02, PostgreSQL 17 § 13.3.2).
- Snipe-IT backup documentation covers SQL plus uploaded images/files, leaves the existing `.env` to be applied separately, and logs users out on restore. The draft turns this into a restore rehearsal requirement rather than treating backup creation as recovery proof (S06).

## Released-plan clause audit

| Released-plan clause | Draft treatment | Critic status |
|---|---|---|
| Internal physical IDs and printable labels | Permanent, non-reused item IDs, barcode plus readable label, manufacturer serial/name as attributes | Faithful. Organization must define issuance and non-reuse. |
| Loan/return events and explanations for corrections | Append-only events with actor, time, reason, links to corrected events; original retained | Faithful proposal. Candidate semantics are explicitly unproven and assigned to validation. |
| Aliases/names as search fields | Search aliases, then select/display the physical item and distinguishing details | Faithful. No reviewed product source proves the complete alias workflow; draft keeps it as a test. |
| Kit parent, removable parts, incomplete/damaged return | Parent/child model, scan checklist, maintenance hold in same transaction | Faithful intent. M-01 makes Koha’s per-piece record/barcode burden explicit; M-02 keeps Snipe-IT’s exact return path open. |
| Due date never implies return | Due date remains informational; optional Koha auto-check-in is to be disabled | Faithful and correctly conditioned. |
| Retired item history retained | Retire/archive without deleting item or loan history; borrower anonymization is separate | Faithful. Candidate-specific retirement/restore remains proposed validation. |
| Local coordinator is authority for accepted loans | Accepted means commit and acknowledgement by coordinator | Faithful, with a usable operational definition. |
| Both laptops read current availability | Server is authoritative while LAN/server are reachable; cached outage state is not current | Faithful and correctly distinguishes Internet loss from coordinator/LAN loss. |
| Transaction prevents same-item simultaneous checkout | Revalidate, lock/claim, create event and update state atomically; idempotency and conflict response | Sound proposed contract. Product tests remain unrun; PostgreSQL documentation is not treated as product proof. |
| Each laptop may create an offline provisional loan | Draft revises this to fail-closed digital writes by default | Supported correction. Koha’s stale state and ordered replay are described; no false multi-master claim is made. |
| Provisional labels prevent double lending | Draft rejects this as sufficient and offers one paper authority as an optional exception | Sound correction. A label is not a shared reservation. |
| Outage rule and permission remain open | Draft keeps permission and one-authority exception for owners to decide before pilot | Appropriate open policy question; not silently resolved by the critic. |
| Borrower contact is separate/staff-limited | Minimum contact, role-limited access, purpose/channel decision first | Faithful. Koha’s last-borrower privacy caveat is included. |
| Staff-reviewed reminders; no automatic messages | Human-reviewed list; communications disabled during evaluation/pilot | Faithful to the no-automatic-message constraint. |
| Retention/deletion, backup owner, kit-part identity unresolved | Kept as decisions with separate identity/history and backup requirements | Faithful. M-01 adds a Koha implementation condition to the kit decision. |
| Validate duplicate names, race, outage, corrections, kits, retired history | Measurable synthetic scenarios, two-client race, hold, restore, migration and message checks | Complete as proposed validation; the draft labels them unexecuted. |
| Synthetic inventory and shadow session before list replacement | Synthetic fit tests, read-only shadow/reconciliation, old list remains authoritative until gates pass | Faithful; avoids two live authorities. |
| No borrower data/messages accessed and no deployment requested | Draft reports no access, sending, install, or deployment | Boundary preserved in the proposal. |

## Discovery, alternatives, conditions, and preservation

The discovery identifies durable unit identity separately from model/name; explains alias disambiguation; distinguishes events from mutable current state; separates damaged/partial returns from ordinary availability; and calls out the privacy, retention, recovery, local hosting, and volunteer ownership questions. It evaluates Koha, Snipe-IT, InvenTree, a custom LAN service, and separate laptop databases without assuming a winner. Its throughput statement for 800 items is expressly labeled an inference, and it identifies five-year migration/history as the harder risk.

Applicability conditions are generally retained: Koha’s manual features require configuration; historical Koha issues are treated as historical regression context; Snipe-IT’s importer lock is not generalized to every route; InvenTree’s stock-taking race is not presented as lending evidence; PostgreSQL locks are not substituted for transaction design; and SQLite’s WAL constraint is scoped to shared/network use. The Koha code review (K07) is marked mutable and unpinned, so it is only exploratory.

The revealed plan’s hash and discovery hash match the one-time reveal record. The draft preserves the fact that discovery predates plan release and records both hashes. No passage suggests that the draft is already an endorsed implementation.

## Proposed versus executed work

The draft separates read-only documentation/repository review from proposed product tests. It does not claim that a checkout race, damaged return, correction, import, notification suppression, or restore was executed. Its limitations section repeats this boundary. The reveal record independently carries the plan hash and reveal time. This critic did not inspect unrelated run history or infer execution from a narrative claim.

## Honestly unresolved external input

The draft correctly leaves loan length/renewal, holds/fines, required borrower identity and reminder purpose, retention/anonymization, outage authority, correction permissions, hold clearance, kit-part tagging/completeness rules, hosting/backup ownership and recovery targets, and cutover tolerance to the organization. Product documentation cannot settle these policies. The remaining product-specific unknowns are appropriate prototype/test questions rather than evidence for a predetermined selection.

## Conclusion

The proposal substantially satisfies the brief and the released plan. Carry forward M-01 and M-02 as explicit fit-test conditions. No scope reduction or product choice follows from this critique; the actual volunteer policies and the behavior of selected releases remain open.
