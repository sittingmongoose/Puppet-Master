# M15 independent full critic pass

**Assignment:** ER11 / B-07 / control / I07 / M15 / critic  
**Review status:** complete; this is a critic artifact, not a revision of the research draft.  
**Frozen inputs:** the exact case brief, revealed P1–P6 plan, complete research draft, discovery, prior research critique, research source map, source index, bounded evidence notes, and access log listed in input-map.json. SHA-256 identities for the read artifacts are recorded in source-map.json.  
**Evidence boundary:** public primary sources only. I reopened the vendor help pages, W3C Recommendation, LibreBooking admin guide/release/repository, and issue/fix/test chain. No live account, product trial, deployment, export, accessibility session, code execution, witness, or human validation was run. Proposed checks remain proposed. No parent, counterpart, evaluator, campaign, or history material was read; no nested agent or premium evaluator was used.

## Overall assessment

The research draft is unusually complete for this brief. Its conditional shortlist does not claim a product is selected, it preserves the budget and privacy uncertainties, and it keeps paper provenance, screen-reader administration, wet-hand tablet use, tenant-owned export, food-safety authority, and the two board decisions visible. The exact source claims I checked are substantially supported. The LibreBooking buffer-ID chain is valid but narrow: it concerns list-item IDs/rendering, not booking-conflict enforcement, and its regression fixture’s value 3600 has no stated unit in the inspected test.

The final reviser should make the three material refinements below. They do not overturn the shortlist or warrant rejecting any P clause. Apply the two minor wording/validation refinements afterward.

## Material findings

### M1 — P3 correction currently bundles required scope with design choices

The correction is justified insofar as the brief needs a tenant-defined equipment-use/cleaning record and each tenant’s own year-end export; linking a record to its tenant, production block, and equipment item makes that scope testable. However, the case does not specify required fields for submitter, timestamp, status, immutable history, or correction procedure. These are sensible audit-design proposals, but should not all be presented as corrections already required by the brief. The draft itself later correctly leaves the meaning of signoff and correction process open in decision item 7.

Keep the tenant/block/equipment link and tenant-scoped export as required scope. Label submitter/time/status/history as proposed record-integrity fields or an optional enhancement pending board confirmation. Keep signoff semantics and correction rights open. Similarly, testing export/restore, attachments, and every cancelled/deleted state can be an exploratory check; do not make restore behavior an acceptance gate unless the kitchen adopts a migration/restore requirement.

### M2 — Food Corridor privacy evidence has one documented profile detail missing from the gate

The vendor’s food-business account documentation says the profile can include business name, description, category, product(s) sold or made, stage, social channels, public contact information, and home kitchen. The same article says a food business can view and message fellow clients in Community, while Daily View displays booked spaces and equipment [FC-04]. The draft accurately says the documentation does not enumerate exactly what other tenants see and does not prove that Community can be disabled. It does not, however, carry the documented profile fields into its privacy gate.

Add a bounded demo question: determine which profile fields and contact channels are exposed to another tenant through Community, profiles, calendar, and search, and whether each can be disabled or minimized. This is a potential disclosure surface, not evidence that recipes, customers, or production volume are exposed or that P2 is violated. Any policy about identities, product types, or public contact details beyond P2 needs the kitchen’s decision.

### M3 — LibreBooking’s P1 evidence omits a consequential positive default and its tradeoff

The v7.0.0 administration guide says a resource cannot be double booked by default. Concurrent reservations can be enabled at schedule level, but that setting applies to every resource on the schedule and disables Schedule View. The guide also says administrators are exempt from usage constraints [LB-01]. The draft reports the administrator exception and other defaults but does not report the default no-double-book behavior or the schedule-level concurrency tradeoff.

Include both sides in the comparison. This default is relevant evidence for P1; the schedule-wide exception matters if the kitchen wants different capacities for spaces and individual equipment or needs the normal schedule view on a tablet. Validate the configured capacities and administrator overrides rather than treating “one booking only” as a universal kitchen rule.

## Minor findings

1. **Price arithmetic:** the current plan selector displays the Annual plan at $206/month billed annually and also displays a “first month free” offer. The $2,472 figure is valid 12-month list-rate arithmetic, but not a demonstrated first-year invoice. Keep it labeled as base arithmetic and record the promotion separately; the page does not explain how it applies to the annual payment [FC-02].
2. **Public resource wording:** LibreBooking’s guide says enabling Public Access makes resource tablet, RSS, iCalendar, and embed URLs available to copy. It does not say that enabling the feature automatically broadcasts all those URLs. Describe availability and the risk of sharing those URLs precisely; retain the proposed kiosk/feed test [LB-01].
3. **Collision acceptance:** validation item 1 should exercise a resource configured as exclusive and then any intentionally shared/capacity-limited resource. “Exactly one succeeds” is meaningful only for the former; otherwise compare outcomes with the declared resource capacity and simultaneous-use policy.
4. **Restore scope:** the proposed export/restore check exceeds the brief’s explicit year-end export obligation. It is useful as an optional portability investigation, not a pass/fail condition until adopted.

## Exact P-clause disposition audit

| Clause | Draft disposition | Independent assessment |
|---|---|---|
| P1 setup / production / cleanup intervals | Correction | Supported. The brief says the existing calendar omits setup/cleanup and this causes access collisions. Distinct resource occupancy and production/billing time should remain separate; interval boundaries, equipment subranges, and who occupies/bills transition time remain unresolved. The half-open model is correctly labeled a proposal. |
| P2 tenant information privacy | Already covered; optional enhancement | Correct. Recipes, customers, and production volumes are expressly named. Broader calendar, identity, profile, contact, export, notification, kiosk, and direct-link testing is prudent, but keep extra privacy boundaries as decisions where the brief is silent. M2 adds a known vendor profile surface without claiming a proven breach. |
| P3 tenant-defined equipment-use / cleaning signoffs | Correction; uncertain fit | Mostly supported as a scope clarification: link records to tenant/block/equipment and preserve tenant’s own year-end records. M1 narrows the correction: author/time/status/history and correction mechanics are proposed design choices, not all explicit case requirements. No candidate’s public evidence establishes the complete per-use flow. |
| P4 accessible coordinator view / paper transition | Correction; already covered | Supported. Keep the entrance tablet with wet hands separate from the coordinator screen-reader view; preserve paper/digital provenance. The brief explicitly requires both environments and paper coexistence. |
| P5 missing-signoff booking restriction and authority | Already covered; user decision | Correct. The alternatives are meaningfully separated. Product booking approval or auto-approval is not this policy. Keep no consequence active until the board decides authority, appeal, and clear/correct steps. |
| P6 shared procedure model across equipment | Already covered; user decision | Correct. The proposed base-plus-overrides and separate-procedure alternatives preserve the unresolved choice and do not impose a kitchen-wide food-safety standard. |

The draft’s rejected approaches are correctly scoped as rejected approaches, not rejected plan clauses: no recipe/customer/output collection as a scheduling prerequisite, no central cleaning standard, and no silent automatic restriction after a missing signoff. The data-minimization recommendation should continue to be framed as scope discipline rather than a claim that the brief forbids each tenant from keeping its own business records elsewhere.

## Obligation and evidence audit

- **O1:** Satisfied in substance. The candidates are materially different: a shared-kitchen SaaS, a general hosted scheduler plus a separate tenant record, and a self-hosted resource scheduler. The tenant-owned linked log is a distinct workflow option. Keep the conditional “demo first” recommendation explicitly non-procurement.
- **O2:** Substantially satisfied. The Food Corridor pages support equipment time subranges, pricing/client limits, monthly cleaning checklists, account surfaces, approval, and manager CSV reporting. Skedda’s live documentation supports symmetric before/after buffers, 15-minute granularity minimum, future-bookings-only application, maximum conflicting rule, system-user override, visibility roles, field behavior, and system-user exports. LibreBooking’s v7.0 documentation supports its listed defaults and public-resource behavior; it does not specify buffer units/direction in the cited section. The draft correctly calls this unknown and proposes checking code/settings. M3 adds the omitted default resource exclusivity.
- **O3:** Supported. Issue #1008 opened 2026-02-14; PR #1140 and commits landed 2026-03-13; the v4.3.0 notes list the ID fix; the pinned v7 implementation still delegates to the wrapped reservation item; and the v7 test asserts before/after IDs with WithBufferTime(3600). The test excerpt does not establish the unit. This chain is a rendering/list-item regression, not evidence of booking-conflict correctness.
- **O4:** Satisfied. Every exact P clause is in the crosswalk, and covered/correction/optional enhancement/user decision/uncertain fit/rejected approaches are distinguishable. M1 corrects a subtle overclassification within P3.
- **O5:** Satisfied. The draft preserves original constraints, alternatives, board disagreements, costs, privacy uncertainty, paper provenance, data minimization, food-safety boundary, and batch handoff. M2 fills one documented privacy detail; M3 adds a material comparison fact.
- **O6:** Satisfied with the minor qualifications above. The draft explicitly distinguishes source reading from execution and labels its validation program proposed. No product interaction, witness, runtime test, export, accessibility session, or user validation is claimed as executed.

## Critic disposition

**Revise before final delivery** by applying M1–M3 and the bounded minor corrections. The evidence does not justify a different shortlist or any new product-selection conclusion. My deliverable is limited to criticism and source capture; I did not alter the predecessor draft or discovery.

