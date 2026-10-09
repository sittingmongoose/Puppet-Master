# B-06 treatment critic — I06

**Assignment:** ER11 scientific candidate B-06/treatment/critic  
**Method:** M14; evidence-first critic  
**Input authority:** the exact `input-map.json` and the assignment at the paths recorded below  
**Status:** critique and source records saved before native Goal completion. No candidate implementation was run.

## Scope and evidence order

I read the critic assignment and exact input map, then the I06 brief and independently selected official primary sources. I saved `evidence-first.md` before opening any predecessor draft or revealed plan. After that I read the complete same-arm predecessor `draft.md`, `discovery.md`, `source-map.json`, and `revealed-plan.md`, along with that arm's source index, fetch log and the retained evidence for the relevant Grist, Baserow, LibreTime and WCAG claims. I refreshed selected facts against current vendor/W3C/project primary pages. The pre-draft evidence-first text is preserved unchanged.

I did not open a parent, counterpart, evaluator, campaign/history material, another arm, private provider material, repository canon or unrelated local state. The declared predecessor and independent-source paths are represented in `source-map.json`; critic-added public-source IDs use the `CR-` prefix and do not rebind existing IDs. Prices and mutable product documentation are time-stamped observations, not quotes or guarantees. The Baserow row-history page remained unavailable in the earlier evidence-first fetch; no Baserow history-retention duration is relied on beyond the current official pricing-page summary.

## Overall assessment

The core direction is promising: keep the aid outside the broadcast signal chain, make status readable without color, keep dedications out of operator handoffs, treat the live schedule as the current record, and retain a manual handoff path. The brief and the tool evidence support a low-code or spreadsheet pilot as alternatives to a playout suite.

The draft needs material qualification before it can serve as the final planning deliverable. It promotes one platform and adds an owner-generated export job, scheduled purge, role configuration, and a multi-output schema while the station has no in-house developer and has left key governance decisions open. The proposed owner-context export also does not inherit a non-owner privacy denial: an Owner is allowed to see the data the export is meant to omit. The relevant permissions and privacy needs are correct; the proposed export mechanism needs an independently tested redaction boundary. The O3 issue chain is strong for LibreTime's time-remaining smart-block feature, while the current draft overstates its relevance to the brief's printed-log staleness failure.

No finding below says that Grist, Baserow, Spinitron, LibreTime or a spreadsheet has been deployed or passed an end-to-end station test. All proposed V checks remain proposed.

## Exact P-clause disposition review

| Exact plan clause | Draft disposition | Critic assessment |
|---|---|---|
| P1: “Provide a shared show schedule and operator handoff view for both transmitters and the web stream.” | ALREADY-COVERED, CORRECTION, OPTIONAL ENHANCEMENTS, USER DECISION, REJECTED | Keep the shared schedule/handoff concept. Qualify “covered” as discovery coverage only. Keep privacy and print-staleness corrections. Fix the Owner-export flaw below. Keep priority/history as optional and conditional. The transmitters' shared-vs-separate choice remains open under P6. |
| P2: “Track clearance status and restrictions at the track or clip level used in a show.” | ALREADY-COVERED, CORRECTION, OPTIONAL ENHANCEMENTS, UNCERTAIN | Keep explicit track/clip status and restriction notes. Reclassify the proposed approval workflow as P5's USER DECISION or an OPTIONAL ENHANCEMENT; the P2 clause itself is not wrong for omitting an approver role that the brief reserves. Show an unresolved/unreviewed state; do not equate silence or missing approval with CLEARED. Make duration-test applicability conditional on remaining-fill arithmetic. |
| P3: “Preserve a printable daily log and a manual fallback for transmission interruptions.” | ALREADY-COVERED, CORRECTION, OPTIONAL ENHANCEMENT | Keep the redacted, timestamped handoff and reconciliation idea. Replace the unproven scheduled Owner export with a verified native redacted print/export path or a separately budgeted/implemented feature. Clarify which interruption the aid addresses. The aid can supply a local rundown; it cannot itself guarantee continued transmission. |
| P4: “Use text labels with status cues so operators do not rely on color alone.” | ALREADY-COVERED, strengthened to MUST | This is already direct brief coverage. Keep textual labels in every live/print/export view. WCAG 2.1 SC 1.4.1 supports a visible non-color distinction; it does not require both a text label and a separate icon when one additional visual indicator is sufficient. Keep icons as optional redundancy and avoid expanding the brief into an unscoped full conformance claim. |
| P5: “Approval authority for usage-note changes and retention of listener requests are station decisions.” | USER DECISION | Correctly preserves the two decisions. The suggested roles, retention examples and “Owner-only” interim approval are design proposals, not findings. Do not ship a product default as station policy. Preserve an explicit unresolved status and ensure data is not represented as cleared while governance is undecided. |
| P6: “Whether differing local breaks need separate schedules is not settled.” | USER DECISION | Correctly preserves the decision, but the proposed three-log shape expands the wording to make the web stream a third schedule. Keep the station's explicit decision about transmitter breaks separate from the web-stream freshness requirement. A two-week trial with zero mistakes is weak evidence without enough divergent break opportunities and near-miss/operator-confusion measures. |

### P1 — privacy and currentness

The privacy correction is necessary. Current Grist documentation says disabled access rules leave document collaborators able to see all data; enabled rules can deny all R/U/C/D for non-Owners on a private table. It also warns that the document-wide structure permission permits formula creation and can expose otherwise restricted data. This supports enabling access rules, isolating dedications, withholding structure permission from ordinary host Editors, and testing user roles. See `CR-GRIST-RULES` and `sources/grist-current.md`.

The export proposal is internally inconsistent. A Grist Owner can read the protected dedication table; the non-owner denial does not redact an Owner's print or export. “Owner-context job enforces the same deny rules” is therefore not a demonstrated property. It needs an explicit field allow-list/redacted projection or a restricted receiving-role export, followed by checks of rendered print, downloaded files, HTML, API-visible output, formulas/widgets, and copies. If a custom job is needed, account for its development, credentials, support and failure modes. A dedicated private store with no handoff joins is a safer alternative if the platform cannot establish a simple redaction boundary.

The draft's live-view/current-revision and print timestamp plus acknowledgement are useful controls for the reported missed-update problem. They are design requirements, not vendor behavior. Identify the authoritative record, show its last change time/revision on the operator view and every paper/export copy, and agree on one feasible signal/acknowledgement path across both transmitters and the web-stream operator. Validation V4 should use real operators and record change-to-visible and acknowledgement times; the brief gives no numeric service-level target.

AzuraCast's priority ordering describes automatic playlist selection. Its use as an operator-facing priority rule for local news is not established. Keep it as a question or optional design analogy. Ask the station how a late insert supersedes a track/segment, and show the chosen rule and reason. LibreTime's “what actually aired” history is also optional; maintaining it creates a distinct record and retention need, so do not fold it into the planning aid by default.

### P2 — status and approval

The draft accurately carries a restriction field and a clearance state from the brief. A durable model should distinguish reusable clip/track facts from an airing-specific use: a clip may have a general restriction and a particular dated use may add context. This is a modeling proposal, not a proved feature of Grist. Avoid a computed “cleared” default; show unknown, pending review, restricted, or cleared with the station's meanings made explicit.

The paragraph calling an approval state machine a “CORRECTION” overstates what P2 says. P5 explicitly leaves the approval role undecided. The process and approver must be confirmed as that user decision; Owner-only is one possible temporary hold rule, but has no brief-based authority and may bottleneck the nine staff plus volunteers. If used during a pilot, mark it as a temporary, named, management-approved constraint. Keep a change author and time if the selected tool provides them, and verify who can alter the usage note.

The optional legal reminder can remain neutral and brief. The cited AzuraCast licensing disclaimer is not a legal opinion about this station's permissions, and the status field must not imply that software verifies a license or grants rights. Rich attachments remain a valid uncertainty; ask for representative real examples before paying for storage or designing an attachment workflow.

The LibreTime PR #3026 chain is credible: its author describes a repeated subtraction bug in a time-remaining smart block, gives a 30-minute show with two 5-minute tracks that leaves a 5-minute gap, and reports reproduced/fixed behavior on a development instance and sample production data. The fix recalculated from the original show duration; the predecessor map records its 4.2.0 release linkage. This validates an O3 chain and a regression case for that precise fill feature. It does not match the brief's observed printed-log/web-operator miss. V3 should be required only if the chosen aid computes remaining time or auto-fills show duration; otherwise mark it inapplicable. If any duration arithmetic remains, test its actual units, rounding, local-break edits and boundary conditions.

### P3 — print, fallback and operational boundary

The redacted printout and reconciliation sequence address useful risks. A scheduled exporter, local HTML, USB distribution and a purge job are not evidenced capabilities of the chosen product in this source set. They may require custom engineering, credentials and ongoing maintenance. With no in-house developer, the pilot should prefer the simplest proven native print/export path. If that cannot produce a redacted, version-stamped rundown, identify its implementation owner and funded operating cost before making it a recommendation.

Owner-context export needs a handoff projection separate from the Owner's full-data view. Paper, USB and local-file copies have their own access, disposal and freshness risks; deleting a live row may not delete every printed/cached copy. The brief leaves listener-request retention open. Resolve it with management before collecting requests, and check how the chosen provider's backups/revisions preserve deleted values. Current vendor pricing pages list long snapshot/change-history windows (Grist Pro: three years; Baserow Advanced: 180-day row-change history), but those summaries alone do not prove whether or how deleted request contents remain recoverable. Treat provider history, backups, exports and paper as retention surfaces to investigate, not as automatically conforming to a proposed retention-days setting.

“Transmission interruption” can mean the schedule tool/network is unavailable or an actual transmitter/stream path has failed. The brief requests a manual fallback and describes the aid as planning/handoff only. V7 may prove the operator can read a current local rundown without the app/network, then reconcile changes on recovery. It cannot pass by asserting “show continues” during a transmitter failure unless station personnel separately exercise their existing transmission equipment and procedure. Keep any engineering runbook outside the product promise and state the boundary plainly.

### P4 — accessibility scope

The brief's label requirement is itself clear and complete. W3C's SC 1.4.1 says color cannot be the only visual means; a visible cue such as text or shape must also convey the meaning. For color meaning that depends on accurately distinguishing a particular hue (green-valid/red-invalid), the additional indicator is required regardless of contrast; the separate 3:1 lightness note does not remove the brief's label requirement. `CR-WCAG-COLOR` records the exact distinction.

Keep the label on the screen, print and local export, and review status meanings with the staff member who raised the need. V6 should include a label-only/monochrome print inspection and an actual operator task. A deuteranopia/protanopia simulation can expose obvious collisions, but simulation is supporting evidence, not acceptance by itself. Requirements for screen-reader semantics can be proposed separately; they are not implied by the stated color-perception need.

### P5 — user decisions and record scope

The decision framing is directionally useful. The three D1 role options and D2 retention examples are invented scaffolding; identify them as illustrative, and leave both undecided until management selects and documents a policy. “Owner-only” cannot become the default silently. A safe interim behavior is to keep usage-note review state visible as unresolved and prevent an unresolved clip from appearing CLEARED, while the station decides whether airing is allowed under its policy.

The example fixed periods (30/90 days), session-only deletion and indefinite-with-consent are not supported by legal or operational evidence. No duration should be recommended from this research. Listener requests, dedications and usage notes may have different purposes and retention rules; do not collapse them into one configurable field. A deletion policy must name affected copies and histories and describe what can actually be purged. A purge log should record minimal deletion metadata and avoid retaining the sensitive content it was intended to remove.

The brief's $6,000 is an annual technology allowance. It does not state that paid hosting or paid setup/operations are excluded. Discovery C4's “rules out ... anything needing paid ops” is unsupported. Current Grist pricing lists Pro at $8/user/month annually ($864/year for nine seats), $10 monthly ($1,080/year for nine), and an available 50% non-profit Pro discount after the vendor's eligibility process; two document guests are free. This changes the estimate and preserves headroom for budgeted assistance, subject to eligibility and volunteer/editor seat counts. Baserow Advanced currently lists $18/user/month annual and $22 monthly, with RBAC and 250,000 rows/workspace; nine editor-like users at the annual rate yield $1,944/year before any additional volunteer seats. Current Baserow Cloud Advanced bills Editors/Builders/Admins; read-only roles are described as free. Do not lower either estimate through shared logins. Check a per-person role/seat model, setup, hosting, backups, support and any local taxes before a product choice. These are vendor list prices observed 2026-10-09, not billing tests or quotes (`CR-GRIST-PRICE`, `CR-BASEROW-PRICE`, `CR-BASEROW-BILLING`).

The draft's “about 50 rows/day” is a made-up sizing scenario. It may be useful as one sensitivity case, but it cannot reject the Free tier or justify a subscription by itself. Determine what constitutes a row (clip catalog item, airing, inserted news item, handoff, or request), estimate how often each occurs, and measure in a pilot. The Free and paid caps are per document in Grist and per workspace in Baserow; comparing a row total without its unit, archive policy and privacy boundaries misleads.

### P6 — transmitter model and trial

Keep the one-vs-two-transmitter schedule decision open. The draft's two possible shapes are useful as discussion examples. Its third log for the web stream extends P6 beyond the brief; the stream instead has an explicit freshness/handoff need under P1. A shared program record with dated transmitter-specific break/run records is a possible data model, though it may be more configuration than the station needs. Compare it with one common show rundown plus clearly visible transmitter-local break rows.

The required unit of the pilot is an actual divergent break opportunity, not elapsed weeks alone. Record number of differing breaks observed, override-reading time, operator corrections, near-misses, errors and operator confidence. Two weeks with zero observed mistakes in a small number of differing events cannot establish that an override view is safe. Set the review threshold and minimum events with station management before the pilot; retain the choice as a user decision after the evidence.

## Cross-cutting material findings

### Product/maintenance scope is internally inconsistent

The draft recommends Grist as no-code, then requires a privileged “Owner-context job” to create a custom single-file HTML/print snapshot, a configurable retention-days parameter, scheduled purge and purge log, a three-output schema, access-rule administration, version signalling and reconciliation. None of these custom mechanisms is established by the captured product pages. They may be possible, but planning them without an owner, budget, support approach and proof crosses the no-in-house-developer constraint. A no-code pilot can start with native tables/views, account-level roles, simple print, and manual revision acknowledgement. Make custom generation/retention automation conditional on a named funded implementation owner.

### Source-ID traceability errors in the frozen discovery

The `source-map.json` and `sources/index.md` establish the retained IDs. Several discovery citations point to different sources:

- Discovery §3/O2.1 calls S10 the Grist access-rules guide, S11 Grist pricing, S12 limits and S14 the Grist README. The index/map identify S10 as AzuraCast playlists; S11 as Grist access rules; S12 as Grist pricing; S13 as Grist limits; S14 as Grist self-managed docs; S15 as Grist core README.
- Discovery §3/O2.3 calls S06–S09 the AzuraCast README, requirements, roles and playlists. The map identifies S06 as the failed LibreTime schedule locator; AzuraCast sources are S07–S10.
- Discovery §3/O2.4 cites S15 for Baserow pricing; the map identifies S16.
- Discovery §3/O2.5 cites S16 for Rivendell; the map identifies S17.
- Discovery §3/O2.6 cites S17 for WCAG; the map identifies S18.
- Draft P2 cites S15 for Grist reference columns, conditional formatting and card views; S15 is the Grist core README. The captured index does not point to a retained primary-source page for all of those view/format behaviors.

These are scientific traceability defects, even where the underlying product statement may be true. Do not silently renumber or rebind frozen IDs. The final should append a correction/alias record or cite stable URLs/locators directly and distinguish a verified fact from a design inference. The draft's E1 statement that all O2/O3 claims resolve to retained evidence needs qualification until each ID/locator is checked.

### O1 alternatives omitted from the candidate's synthesis

The evidence-first research independently considered a shared spreadsheet with version history/offline browser edits, and a radio-native show/occurrence model from Spinitron. Spinitron's product-maintained forum describes shows with owners and schedules, dated show playlists as occurrences, and distinct public versus logged-in schedule views (`SP-SCHEDULE`). It is a useful discovery lead; there is not enough evidence here for clearance fields, transmitter-break behavior, privacy, offline operation, price or suitability, so keep it a candidate to screen rather than a recommendation. Google Sheets' official help says offline changes stay in the browser until sync; therefore an offline editor cannot be assumed to deliver a late change to another operator (`GS-OFFLINE`). A spreadsheet plus a visible generated time and agreed call-out can be a low-cost pilot alternative if account permissions adequately protect dedications. No source reviewed proves its fit; test it under the same role and outage criteria.

LibreTime/AzuraCast/Rivendell are useful concept sources and documented rejected builds because they include playout/automation outside the brief. Spinitron, a shared spreadsheet, and a low-code app create materially different approaches; keep their comparison criteria visible rather than converting platform familiarity into a product decision.

## Validation review — executed vs proposed

The draft is right to say no runtime or deployment test was executed and to mark V1–V9 as proposed. The following revisions improve discrimination:

- **V1/V2 privacy:** only run if Grist remains a candidate. Create a synthetic dedication canary; test each actual account role, direct table/open/API access, search and formula-derived output; test owner-generated print/export/HTML and an old revision/backup path. Include an Owner-authored formula/widget to confirm it does not publish a derived secret. Pass only when the intended operator receives the allowed fields and no canary value. The current V1 assertion that “Owner-context” export enforces non-owner rules must be removed.
- **V3 duration:** run only if remaining-time fill, duration arithmetic or track-duration totals survive scope review. Use the feature's real units and rounding/boundaries. Do not make LibreTime smartblock semantics a requirement for a manual rundown.
- **V4 currentness:** use actual transmitter and stream operator roles. Print/export a version, make an insert, capture when each live view changes and when each receiver acknowledges, then test stale-copy handling. Agree the pass target and communication channel before the drill.
- **V6 accessibility:** inspect live, paper, and local HTML in text-only/monochrome conditions; ask the affected staff member to identify and act on each status. Simulators can be a supplemental check.
- **V7 manual fallback:** perform a tabletop with the app or studio network unavailable, use the last stamped local rundown, record changed inserts separately, and reconcile after recovery. Add a separate station-engineering exercise for transmitter/stream failure; do not treat a planning tool test as proof of transmission continuity.
- **V8 cost/operations:** measure actual paid/editor seats including volunteer churn, rows under a specified data model, support/admin time and any setup/hosting/backup costs. Compare list price and any confirmed nonprofit discount; usage/billing stays unobserved until a lawful pilot is explicitly authorized.
- **V9 schedule shape:** predefine enough real divergent-break opportunities and near-miss/operator-confusion measures to decide whether overrides remain readable. A two-week zero-error result alone is not a pass criterion.

## Minor findings

1. “No legal research was done” and “usage/billing was unobserved” are useful integrity statements. Keep them with the date and current-price caveat.
2. The color-vision simulation is a useful exploratory tool. Keep it supplementary to real text-label use and grayscale/print review.
3. Rights-reminder copy, read-only air-history, priority display, attachments and dual output formats can remain optional. For each, distinguish an observed product behavior from a design idea and avoid introducing a new retention/maintenance obligation without a user need.
4. “Shape 1 is cheapest” and “self-host vs SaaS transfers data model” are assumptions. Label as hypothesis and test migration, operations and identity costs; there is no evidence of seamless transfer or a cost ranking yet.
5. The declared 20% budget headroom, 30-day pilot, and two-week schedule trial are local proposed criteria. Ask management to accept them; they are not requirements in the brief.

## Obligation check for the next final

- **O1:** retain Grist, Baserow, radio-native/planning suites and the manual spreadsheet/static-copy approaches with distinct fit limits; include Spinitron as a screening lead, not a recommendation.
- **O2:** preserve Grist's enabled/disabled defaults, structure/formula risk, export-owner asymmetry, current seat/row units, Baserow advanced-role billing, and an explicit candidate deployment check. Treat vendor docs as claims until tested.
- **O3:** retain the #3026 fix/release chain as evidence for smart-block fill only; state how applicability depends on the selected mechanism. Note the separately discovered #3160 playout metadata chain in the critic source map as inapplicable absent audio/playout integration.
- **O4:** retain a verbatim verdict for every P1–P6 and correct the classifications discussed above.
- **O5:** keep the original $6,000 allowance, nine staff plus rotating hosts, last-minute news changes, privacy, text status, manual fallback and no-automation constraint. Keep D1/D2/P6 unresolved; do not convert scenarios into decisions.
- **O6:** keep static source inspection executed and all product/user tests proposed. No runtime result is claimed.

## Evidence register

Source IDs and URL/version/commit/locator/access metadata are in `source-map.json`. Critic-retained evidence files and their SHA-256 values (the hash is over the exact Markdown bytes):
- `sources/grist-current.md` — SHA-256 `53be416060919a8990cd4fd85499ceb5bff7944fc541350e25cd1c96cf1cde0c`.
- `sources/baserow-current.md` — SHA-256 `d1df6f0b069b2c74215dbd2115be289e3703abaf65a0320b005a3980bd62b044`.
- `sources/wcag-current.md` — SHA-256 `de540509d315ac564a731addcb7bb2b08bc994ca5b8f1d9c5037f400fb3e0a3e`.
- `sources/libretime-smartblock-3026.md` — SHA-256 `27b6c403e7679645400633c5cc7a317cad57e47f48e75aac9c5b6238171601b9`.
- `sources/libretime-evolution.md` — SHA-256 `bb458f07e5a98cb9dbb15428d978a0ebda0ce95fcd91c26da6aabd96e0285571`.
- `sources/libretime-scheduling.md` — SHA-256 `44f93e5e3c90017547444fbf4d25b4f2c8d7d77a8db986057fce94a25efc8984`.
- `sources/baserow-access.md` — SHA-256 `bb7ba7cd7656cd0b3b4fb360389096b40333efe4bdbc8b25bc80b0cb917c289a`.
- `sources/sheets-offline.md` — SHA-256 `2e40913d04374d5623f5cd7f49461d9a4e5956656548de248e6e1bee8a9bd110`.
- `sources/spinitron-schedule.md` — SHA-256 `aceefdbc0b54c05c2eed804a35fa4e1ca80014ecb2ecc0e49307d2b931bbf59f`.

Predecessor input paths and SHA-256 values are retained as `reviewed_inputs` in `source-map.json`.
