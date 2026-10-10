# Independent critic review — A1-02-control

## Review scope and result

I reviewed the frozen original brief, the complete investigator discovery and draft, its source map and carried source index, and the released plan. I checked the cited governing RFC 5545 clauses and the first-party Google Calendar and Microsoft Graph operation documentation, plus the named Rust candidate documentation and archived parser README. Source identities and my access/operation notes are in this stage's source-map.json. I did not call a provider API, execute code, import/export a calendar, or run any proposed validation.

The package covers the brief and released plan well: it rejects the new-UID move and fixed-UTC preview as canonical storage, preserves a master series and original-slot identity, handles an existing exception and opaque data, compares two provider operations, states explicit DST rules, and distinguishes proposal, assumption, unsupported input, and executed work. It makes no interoperability claim. The matrix is proposed only.

Three findings need to remain visible in any later complete proposal: two material omissions in the accepted-input contract and one materially inaccurate description of rrule2's spring-gap behavior. These do not invalidate the broader recommendation, but they matter to safe recurrence evaluation and the dependency decision.

## Findings

### 1. Material incomplete — accepted weekly RRULE profile is not an exact allow-list

**Locator:** discovery.md, “Recommendation and scope”; draft.md, C2 and C6.

The draft says to accept “one validated weekly RRULE profile” and to support “the exact recurrence forms the parser/editor can round-trip”; discovery narrows this to default INTERVAL=1 and a BYDAY resolving to DTSTART's one weekday, but does not enumerate the full accepted rule parts and conditions. For example, it leaves unclear whether COUNT, UNTIL, WKST, RDATE, and optional BYxxx parts are supported, and what combinations are rejected. “Round-trips exactly” depends on an implementation not yet selected or validated, so it cannot define the profile by itself.

RFC 5545 defines the rule grammar and recurrence-set composition, including DTSTART, RRULE, RDATE and EXDATE, but does not choose this product subset [S01]. Because the user explicitly asked for a narrow first-release subset, the proposal needs a deterministic accept/reject profile that an importer and validation matrix can apply. The discovery already has a useful start; this is a material completeness gap, not a request to broaden scope.

### 2. Material incomplete — state and enforce RECURRENCE-ID type compatibility

**Locator:** draft.md, C1 occurrence-key description and C2 duplicate/unsupported input rules; discovery.md, accepted profile.

The typed key includes value type and TZID/reference, and malformed or ambiguous recurrence IDs are rejected. The package does not explicitly say to reject a detached RECURRENCE-ID whose value type or local-time form disagrees with the master's DTSTART. RFC 5545 §3.8.4.4 requires the same value type and requires local-time form if and only if DTSTART uses local time [S01]. Make this a stated import validation rule so an incompatible recurrence ID cannot be treated as a valid original slot merely because it can be parsed into a key. This also applies to the matching type of RDATE/EXDATE values in the selected profile.

### 3. Material wrong — rrule2 is described too broadly as RFC-style for gap handling

**Locator:** discovery.md, C3 paragraph on rrule2 and final paragraph of source-map.json S10.

The source characterization says rrule2 documents “RFC-style fold/gap treatment.” Its own 0.15.0 behavior notes say a recurrence occurrence that lands on a spring-forward gap is interpreted with the pre-gap offset; its example generates a 01:30 recurrence as 02:30 after the transition [S10]. RFC 5545 §3.3.10 instead says a recurrence-generated nonexistent local time MUST be ignored and MUST NOT be counted. The pre-gap-offset rule in §3.3.5 applies to an explicit local DATE-TIME value; it is distinct from the generated-recurrence rule [S01]. The crate documentation conflates these cases, so it must not be characterized as matching RFC recurrence behavior for this edge.

This is an evidence error, not an executed product defect: the draft correctly keeps the library provisional, labels its behavior unverified, and proposes a generated-gap fixture that expects the RFC skip behavior. That fixture would expose the documented divergence. Keep the candidate unqualified unless the owner deliberately chooses a different behavior and discloses it.

## Obligation and exact-plan review

| Obligation | Assessment |
|---|---|
| C1: series and original occurrence identity | The draft gives stable local-source + UID identity and typed original RECURRENCE-ID; a move keeps the original Friday ID when moved to Thursday. It correctly separates file identity from Google/Graph IDs. Add the type/time-form validation above. |
| C2: cancel, move, recurrence/exclusion/override | Move edits one detached exception and keeps RECURRENCE-ID; cancel adds one EXDATE only without a conflicting override; conflict fails closed; THISANDFUTURE and later-series edits are excluded. The recurrence-set explanation is supported by S01. Exact RRULE acceptance still needs the allow-list above. |
| C3: local time, DST, ambiguity | The draft keeps TZID-bound local wall time and VTIMEZONE, distinguishes explicit fold/gap resolution from a recurrence-generated gap, and gives an observable test for each. RFC evidence supports that distinction [S01]. The rrule2 evidence characterization is corrected by finding 3. |
| C4: provider comparison | Operation-level comparison is accurate in scope: Google retrieves/updates an individual instance and exposes immutable originalStartTime; Graph lists instances in a bounded window and identifies exceptions with provider fields including UTC originalStart. Google cancellation state and Graph organizer Cancel/Delete differ from file exclusions. The draft explicitly transfers only original-slot identity, not API IDs, authorization, notification, or server retention behavior [S02–S09]. |
| C5: unknown properties, idempotence, implementation history | The component-owned opaque property bag, transactional upsert keys, duplicate detection, and semantic-vs-byte round-trip distinction answer the brief. It does not promise byte identity and blocks unsafe export. The ical 0.11 archive/validation caveat and aimcal-ical calendar-root retained-property docs are represented with appropriate limits [S11–S12]. Correct the rrule2 claim per finding 3. |
| C6: support, unknowns, validation, unsupported inputs | The draft clearly separates proposed supported behavior and owner assumptions, says no checks ran, labels the matrix proposed, and retains original data on unsupported input. Its no-mutation/export policy is actionable. The exact accepted recurrence profile and recurrence-ID type constraint remain to be stated. |

The draft also resolves the released user's open choices: it rejects using current occurrence start as identity, an eight-week UTC row set as canonical recurrence, and a new UID for a moved exception; it describes a bounded UI preview only. The existing exception is updated in place for moves and collision cases are refused rather than guessed. Unknown properties remain represented or block export. No new service, account, live provider access, server conflict system, or whole-series operation is introduced.

All negative constraints are honored in the package: no full calendar application, account/API access, future mass edit, silent opaque-property drop, permanent fixed-UTC rewrite, or unsupported interoperability claim. The original plan's listed validation cases are carried into the proposed matrix, including a cross-date move, existing override, repeat import, opaque property, unsupported rule and DST boundary.

## Unresolved external evidence or owner choice

- Actual cross-client treatment of an EXDATE plus same-slot detached override is not settled by the cited recurrence-set rule alone. The draft's local fail-closed policy is coherent; no client interoperability conclusion should be inferred.
- Whether an incoming VTIMEZONE's rules match the center's intended named civil zone, and which external clients/versions matter for compatibility, remain input/owner choices. No such external behavior was tested.
- Parser, serializer and recurrence-library behavior under component mutation, unknown-property preservation, and the accepted recurrence profile remains unverified. The investigator correctly labels all of it proposed and performs no validation claim.

## Native Goal observation

The native Goal tool returned an active Goal for this critic context. Directly observed fields at activation/get-goal were: threadId 01a12405-676d-7a81-b560-5a186f49393a; objective “ER12 critic stage, run A1-02-control: execute ER12_RUNTIME/runs/A1-02/control/stages/critic/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.”; status active; tokensUsed 0; timeUsedSeconds 0; createdAt 1791605721; updatedAt 1791605721; remainingTokens null; completionBudgetReport null. The provider/provenance and human-readable UTC conversion of the raw createdAt/updatedAt values were not exposed and are UNKNOWN. Terminal fields were not observed when this artifact was saved.
