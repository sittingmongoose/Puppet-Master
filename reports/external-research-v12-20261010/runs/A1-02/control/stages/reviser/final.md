# Revised recommendation — occurrence-edit adapter for imported iCalendar

Run `A1-02-control`; fixture `ER12-A1-02-FRESH`. This is a proposal for the finalized synthetic brief and the exact released plan, not an implementation or a validation report.

## Scope and decision

The first release is a local Rust importer backed by SQLite. It imports one trusted `.ics` file and exports an edited file. Staff select and change one occurrence in one weekly rehearsal series in a named time zone. One pre-existing detached exception and an opaque property may already be present. The UI exists. The app has no provider connection, account/API access, live sync, server conflict service, or need to become a calendar product.

Do not use the plan sketch as the stored model. A current occurrence start ceases to identify the original slot after a move. Eight weeks of UTC rows may be a bounded display preview, but cannot be the authoritative series and would lose local wall-time behavior across daylight-saving changes. Deleting an occurrence row is not a durable cancellation, and giving a moved event a new UID severs its recurrence relationship. Keep the master VEVENT and edit one original recurrence slot. Persist recurrence data, not an eight-week materialization.

### Deterministic first-release input profile

This deliberately small profile resolves the critique’s request for a testable allow-list. It is a product choice, not a claim that RFC 5545 requires this subset.

- The target has one VEVENT master with one persistent UID and exactly one RRULE. There must not be another master for that UID or two detached overrides for the same original slot. Other file components are left untouched and must be preserved on export; if the writer cannot preserve them safely, block export.
- Master DTSTART is a local DATE-TIME with TZID and a matching VTIMEZONE. Use the original DTSTART’s local weekday and wall time as recurrence inputs. The VTIMEZONE must define valid rules for every recurrence instance. An IANA-looking TZID string alone does not prove those rules match a particular civil-zone database.
- Accept RRULE only as `FREQ=WEEKLY`, with optional `INTERVAL=1` and optional one unnumbered `BYDAY` equal to DTSTART’s weekday. `BYDAY` may be absent, in which case DTSTART supplies the weekday. Reject every other rule part: this includes `COUNT`, `UNTIL`, `WKST`, numbered or multiple BYDAY values, all other BYxxx parts, and any interval other than one. Reject multiple RRULEs, EXRULE, and an unsynchronized DTSTART. Thus each supported week has one rule-generated slot; the series is not given an invented end date.
- RDATE and EXDATE are optional. Accept only local DATE-TIME values using the master’s TZID and value type; reject UTC, floating, DATE, mismatched-TZID, and RDATE PERIOD values in this profile. Keep the lists and let the recurrence-set rules below determine inclusion/exclusion. A detached exception must have the same UID and a RECURRENCE-ID matching DTSTART’s value type and local-time form/TZID; its original slot key must be unique. Reject malformed values and RANGE=THISANDFUTURE.
- Preserve the master’s existing duration representation (`DTEND` or `DURATION`) and apply it consistently to a moved override. The selected target must be a valid, currently included original slot. Unsupported or ambiguous input is reported before a database or output-file mutation.

This is intentionally stricter than the full iCalendar grammar. In particular, refusing COUNT/UNTIL/WKST and other optional recurrence parts gives the importer a precise acceptance rule; it does not assert those forms are invalid iCalendar.

## C1 — Define series and occurrence identity, including how a moved occurrence refers to its original position.

Use the stable local import/source slot plus the file’s UID as the database series key. Preserve UID; do not derive it from title, date, provider identifiers, or insertion order. In the input file, UID identifies the series. For SQLite, a detached exception key is `(source_slot, UID, RECURRENCE-ID value type, original local date-time, TZID)`; include the value form in the typed key and retain SEQUENCE as data rather than using it to turn a changed series revision into a different local source slot.

A generated, unmodified occurrence is identified by its nominal original recurrence slot. A detached VEVENT override uses the same UID and a RECURRENCE-ID equal to that original slot. If Friday’s rehearsal moves to Thursday, Friday remains the RECURRENCE-ID; only the override’s actual DTSTART and corresponding end/duration change. The moved DTSTART is not a new occurrence identity. RFC 5545 says RECURRENCE-ID keeps the original scheduled value after rescheduling; its value type and local-time form must match DTSTART. [S01](sources/index.md#s01-rfc-5545)

This resolves the proposed timestamp/new-UID choices: neither the replacement start nor a newly minted UID replaces original-slot identity.

## C2 — Explain cancellation versus moving an instance, and the relevant interactions between recurrence rules, exclusions, and overrides within the supported subset.

For this profile, the master recurrence set is DTSTART plus RRULE and any accepted RDATE inclusions, with matching EXDATE values subtracted. EXDATE wins over RRULE/RDATE inclusions, duplicate inclusions coalesce, and DTSTART metadata remains even if that date is excluded. RFC 5545 leaves a DTSTART not synchronized with its RRULE, and a set with multiple RRULEs, undefined; reject those inputs rather than guessing. [S01](sources/index.md#s01-rfc-5545)

- **Move one active slot:** if no detached override exists, add one with the same UID and RECURRENCE-ID set to the original slot. If an override already exists for that slot, update that component in place. Change actual DTSTART and matching end/duration; retain RECURRENCE-ID and every unaffected property. Do not alter the master rule, other slots, or later instances.
- **Cancel one active slot:** add its original slot to the master EXDATE list; keep the master and UID. If a matching detached override already exists and combining it with EXDATE has not been qualified for the product’s exact reader/writer profile, fail closed and leave the file/database unchanged. RFC recurrence-set precedence alone does not prove how every client composes a separate detached component with that exclusion. Do not delete the override or opaque properties to force a guessed result.
- **Range changes:** refuse RANGE=THISANDFUTURE. Although RFC 5545 defines it, it affects the identified instance and subsequent instances, which exceeds a single-instance operation. Never apply mass edits to future instances.

A moved date can overlap another event. The UI may show the overlap for staff to decide; do not import Microsoft Graph’s provider-specific boundary restriction into the file format. The target must be a currently included recurrence slot; an already excluded or ambiguous slot needs an actionable refusal instead of a silent rewrite.

## C3 — Specify local time/time-zone handling across a daylight-saving boundary and disclose ambiguous/nonexistent-time policy rather than assuming a fixed UTC offset.

Store the master’s local wall time, TZID/VTIMEZONE, weekly rule, exceptions, and exclusions. Expand each candidate in that zone. Do not add 604,800 seconds repeatedly in UTC or turn a recurring 18:30 local meeting into a permanent UTC schedule. RFC 5545 treats local DATE-TIME with no TZID as floating time even if a VTIMEZONE happens to be present; the recurrence needs a TZID reference and corresponding VTIMEZONE. The RFC requires that VTIMEZONE provide valid zone information for every recurrence instance. [S01](sources/index.md#s01-rfc-5545)

Disclose the RFC policies separately:

- An explicit TZID-bound local DATE-TIME in a fall-back fold means the first occurrence (earlier instant).
- An explicit local DATE-TIME in a spring-forward gap uses the offset before the gap, so its represented instant displays after the gap.
- A rule-generated nonexistent local date/time is different: RFC 5545 says to ignore that recurrence instance and not count it. Do not shift it into a replacement recurrence.

Use the same explicit-value policy for a user-entered moved DTSTART, and keep it in the master’s named zone for this release. If the VTIMEZONE is missing, invalid, too short for the recurrence, or cannot be shown to represent the intended named zone, do not silently substitute the machine’s current zone or a fixed offset; report the series unsupported. Whether the owner wants an additional test that incoming VTIMEZONE definitions match a particular IANA/TZDB zone remains an owner choice.

## C4 — Compare at least two provider/analogous mechanisms at the operation level and explain which concepts transfer to file interchange and which do not.

| Operation | Google Calendar API v3 | Microsoft Graph v1.0 | Transfer to this file adapter |
|---|---|---|---|
| Find one original occurrence | The guide uses `events.instances` to enumerate/retrieve the instance; `recurringEventId` and immutable `originalStartTime` distinguish the original slot after a move. | List a master’s instances in a start/end window; objects expose `seriesMasterId`, `type`, and UTC `originalStart`. | Retain the stable original slot. In the file that is UID plus typed RECURRENCE-ID, not a provider ID or moved start. |
| Move one | Retrieve an instance, then update that instance resource. | PATCH a selected event/exception ID. A move across an adjacent occurrence’s day boundary can fail with `ErrorOccurrenceCrossingBoundary`. | Use one same-UID detached VEVENT override and keep RECURRENCE-ID. The Graph restriction is not an .ics restriction. |
| Cancel one | A recurring exception is marked `status=cancelled`; Google documents special fields and retention for a cancelled exception while its parent series exists. | Organizer-only Cancel sends a cancellation message and moves the event to Deleted Items; Cancel differs from Delete. The master tracks cancelled occurrences. | EXDATE is the selected file-level exclusion proposal. Provider cancellation tombstones, retention, API IDs, authorization, and attendee mail do not transfer. |
| Time basis | A recurring event’s start/end timeZone selects expansion. | List responses use UTC start/end unless `Prefer: outlook.timezone` is supplied. | Keep TZID/local recurrence and VTIMEZONE. Do not claim provider conversion or interoperability. |

These are operation-contract comparisons from first-party documentation, not reproduced behavior: no Google or Graph API call was made. Source identities and the conditions reviewed are recorded as S02–S09. [Google sources](sources/index.md#s02-google-recurring-events-guide), [Graph sources](sources/index.md#s05-microsoft-graph-event-resource-v10)

## C5 — Describe preservation of unknown properties, idempotent repeat import, and round-trip risks; connect a relevant implementation or history detail to the compatibility decision.

Keep an opaque-property bag associated with its owning component: property name, parameters, value data, multiplicity, ordering/anchor, and—where feasible—the original folded content-line bytes. Include master, detached exception, VTIMEZONE, and untouched components. Patch known time fields only. If serialization changes folding, escaping, order, quoting, or line endings, report the normalization where feasible; never claim byte identity without a test. If an unknown property’s value or parameters cannot be preserved safely, block export and retain the original file.

Standards nuance: RFC 5545 §3.2.20 requires unrecognized VALUE data types to be preserved without interpretation. For unrecognized IANA/X extension properties, §3.8.8 allows a conforming reader to ignore them. The finalized brief imposes the stricter product requirement: this adapter must not silently drop the opaque property, whether or not the RFC makes a generic reader preserve it. [S01](sources/index.md#s01-rfc-5545)

Use a stable local import slot. In one SQLite transaction, upsert the series by `(source_slot, UID)` and an exception by `(source_slot, UID, typed original RECURRENCE-ID)`. Reimporting unchanged input into that same source slot must update the same keys, not append duplicate series or exceptions. Reimporting an edited export into the same source slot must keep the original-slot key. An independently created source slot is a separate import; no cross-file deduplication is promised. Compute generated instances for a bounded UI window rather than storing permanent rows for every future week.

The dependency decision remains provisional:

- `ical` 0.11’s README describes a component/property tree but says its parser does not validate field validity; its GitHub repository was archived in 2024. Parse success alone is not safe-edit evidence. [S12](sources/index.md#s12-peltocheical-rs)
- `aimcal-ical` 0.12.1 documents retained X/unrecognized properties on the calendar-root model, but that page does not prove VEVENT-level retention after mutation or byte-identical output. [S11](sources/index.md#s11-aimcal-ical)
- `rrule2` 0.15.0 is a recurrence candidate, not a qualified engine. Its documentation says an unsynchronized DTSTART is not force-added (RFC result undefined) while Google behaves differently. More materially, the crate docs say a recurrence-generated spring-gap time uses the pre-gap offset, while RFC 5545 §3.3.10 says that generated nonexistent instance is ignored and not counted. The crate page attributes the gap policy to the explicit DATE-TIME clause §3.3.5; those are different cases. Therefore the candidate cannot be relied on unchanged for the required gap behavior based on its own documentation. The exact release remains unexecuted; qualify it only if version-pinned tests or an adapter demonstrably enforce the chosen RFC policy. [S10](sources/index.md#s10-rrule2-0150)

No library has been selected, installed, or run. Test component mutation, opaque-property survival, timezone handling, recurrence set behavior, and repeat import before deciding. Semantic property preservation is not byte preservation, and a local round trip alone would not prove another client interoperates.

## C6 — Separate supported behavior, unverified assumptions, and proposed-versus-executed validation; state what unsupported inputs do.

**Supported proposal.** One unique target master in the strict weekly profile above; named local time represented with TZID/VTIMEZONE; one valid original slot; one move through a same-UID exception retaining RECURRENCE-ID, or one cancel through EXDATE when there is no unresolved override collision; component-owned opaque-property preservation; transactional idempotent import. A bounded preview can be shown in the existing UI. No eight-week end date is inferred.

**Unverified assumptions and owner choices.** The supplied VTIMEZONE matches the intended local civil zone over all recurrence instances; selected parser/serializer preserves unknown fields and component structure through edits; a recurrence engine can meet the exact weekly and DST policy; clients outside this app compose EXDATE and detached exceptions as expected; and staff/provider versions to target for compatibility are unknown. Whether to require an IANA/TZDB equivalence check and which external clients matter remain owner decisions. The adapter’s local policy for a collision between a target exception and EXDATE is fail closed. No provider interoperability claim follows from documentation review.

**Unsupported input behavior.** Reject without changing SQLite or writing an edited file when the target has a missing/duplicate UID or master, duplicate detached original-slot identities, incompatible RECURRENCE-ID/RDATE/EXDATE type or local-time form, unsupported RRULE parts or EXRULE, DTSTART/RRULE mismatch, RDATE PERIOD, floating or UTC-only recurrence, missing/invalid/incomplete VTIMEZONE, RANGE=THISANDFUTURE, a conflict between EXDATE and an override, an unselectable recurrence slot, or any property that may be lost. Give a specific component/property diagnostic and retain the original source unchanged. Do not silently normalize an unsupported schedule into a different one.

**Executed work and validation status.** I read the frozen brief, complete investigator artifacts, complete released plan/reveal, complete critic artifacts, and their bounded source references. The ten frozen input hashes matched the recorded hashes. I opened the official RFC sections cited in S01 and the docs.rs rrule2 0.15.0 documentation; the additional research was documentation inspection. No Rust/parser/recurrence code, calendar import/export, SQLite mutation, API, serializer, DST fixture, or round trip was executed. No proposed validation has passed.

**Proposed validation matrix — not run.**

| Fixture/action | Observable invariant |
|---|---|
| Weekly local rehearsal before and after spring and fall changes, with supplied VTIMEZONE | Same local weekday/time; represented instants follow zone offsets; no fixed-UTC schedule. |
| Explicit TZID-bound DTSTART or moved DTSTART in a fall fold | First occurrence is selected and remains the declared local value. |
| Explicit local DTSTART or moved DTSTART in a spring gap | Pre-gap-offset rule is applied and disclosed. |
| RRULE-generated gap and fold dates | Nonexistent generated slot is skipped and not counted; fold result appears once at the earlier instant. |
| Move an ordinary slot, including an already existing exception | Same UID and original RECURRENCE-ID; changed actual DTSTART/end only; master RRULE and other slots unchanged. |
| Cancel one ordinary slot | One original slot added to EXDATE; only that recurrence is excluded; DTSTART and the rest of the master remain. |
| Existing override plus opaque property on master, override, and VTIMEZONE | No-op export and move preserve property/value/parameters/multiplicity/component; report any formatting normalization; EXDATE collision blocks without mutation. |
| Reimport the same file twice, then reimport edited output into the same source slot | Stable series/exception key counts; no new UID or duplicate exception; semantic model remains stable. Measure byte identity separately. |
| RRULE allow-list boundary: COUNT, UNTIL, WKST, extra/numbered BY parts, interval ≠ 1, EXRULE, multiple RRULE, unsynchronized DTSTART | Supported exact profile accepted; each excluded form gives clear refusal and no partial mutation. |
| Mismatched DATE/DATE-TIME, TZID/local-time RECURRENCE-ID, RDATE/EXDATE, duplicate overrides, RANGE=THISANDFUTURE, missing/short VTIMEZONE, RDATE PERIOD | Refuse with reason; original file and database remain unchanged. |
| Candidate parser/writer/engine by pinned version | Demonstrate component-level opaque retention, edit and reimport, exact recurrence-set results, fold/gap behavior, and iteration limits before selection. |
| Optional named Google/Graph import/export comparison after separate setup and authorization | Record provider/version-specific results and operations; until actually run, make no interoperability statement. |

## Disposition of the independent critique and remaining uncertainty

1. **Accept — exact weekly RRULE profile was underspecified.** The allow-list above fixes the input grammar and rejects COUNT, UNTIL, WKST, other BY parts, and RDATE PERIOD explicitly. This is intentionally narrow product scope, not an RFC-validity judgment.
2. **Accept — RECURRENCE-ID type compatibility was missing.** Require matching value type and local-time form/TZID against DTSTART; apply matching temporal-type/TZID checks to the supported RDATE and EXDATE values. Reject incompatible values.
3. **Accept — rrule2 gap behavior was over-described as RFC-like.** The version documentation’s generated-gap rule differs from RFC 5545 §3.3.10. Keep rrule2 unqualified and do not describe that edge as RFC-conformant without a version-pinned test or adapter.
4. **Amend an additional evidence imprecision.** The draft’s brief description blurred unknown properties with unknown VALUE types. RFC §3.2.20 mandates preserving unrecognized value-type data; §3.8.8 permits generic consumers to ignore unknown IANA/X properties. The adapter’s no-silent-drop requirement comes from the user’s brief and is stronger, so retain all such fields or block export.

The critic’s other positive assessments are retained: operation-level provider comparison only; no account/API access; no claim of interoperability; no mass future edits; no fixed-UTC rewrite; no silent loss; validation matrix is proposed only. Three uncertainties remain material and visible: actual external-client composition of EXDATE plus a detached override, whether a particular VTIMEZONE matches the center’s intended zone, and the behavior of any chosen parser/writer/recurrence engine after mutation. The local fail-closed policy is a proposal, not tested client behavior.

## Preserved negative constraints and covered plan choices

No full calendar app, account/API access, mass edit to later instances, silent unknown-property drop, permanent fixed-UTC recurrence, or untested interoperability claim. The plan’s proposed eight-week expansion remains a UI convenience only; the current moved start is not an identity; new UID is rejected; an existing exception is updated in place for a move; unsafe override/cancellation collisions are refused; repeat import is keyed by source slot and original recurrence ID. The original cross-date move, cancellation, existing override, repeated import, opaque property, unsupported-rule, and DST fixtures all remain in the proposed matrix.

## Source navigation and native Goal observation

The bounded source index is [sources/index.md](sources/index.md); full source identities, access operations, conditions, and predecessor source-ID lineage are in [source-map.json](source-map.json). IDs S01–S12 have not been rebound.

One actual native Goal was created for this reviser context using the objective verbatim from `freeze.json.native_goal_objective`. Directly observed activation fields were: threadId `01a1240d-3227-72f1-b1c3-03f9a545cd43`; objective `ER12 reviser stage, run A1-02-control: execute ER12_RUNTIME/runs/A1-02/control/stages/reviser/assignment.md; preserve complete brief scope and save required outputs before completing this native Goal.`; status `active`; tokensUsed `0`; timeUsedSeconds `0`; createdAt `1791606234`; updatedAt `1791606234`; remainingTokens `null`; completionBudgetReport `null`. Provider provenance and human-readable conversion of the raw timestamps were not exposed and are `UNKNOWN`. When these required outputs were saved, no terminal status had yet been invoked or observed.
