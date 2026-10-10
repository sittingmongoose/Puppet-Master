# Cancellation of one recurring room booking

Fixture ID: ER12-A1-02-FRESH. Queue slot: A1-02.
Authoring status: FINALIZED. Synthetic user assignment, not an external fact claim.

A community arts center has an existing booking list and imports calendar events. Staff need to cancel or move one occurrence of a recurring rehearsal while keeping the series intact. Research and plan an occurrence-edit adapter for imported iCalendar data. Google Calendar and Microsoft Graph event mechanisms are useful comparators; compare their identity/exception behavior with the interchange representation, rather than proposing a whole calendar service.

Assume a fictional Rust importer and a local SQLite database. The first release imports a single trusted .ics file and exports an edited file; no live provider connection is available. The UI already exists. Support one weekly recurring series in a named time zone, including a series crossing a daylight-saving transition. Do not expand to every recurrence form. The original event may contain an existing exception and an opaque property the importer does not understand.

Required final clauses:
- C1: Define series and occurrence identity, including how a moved occurrence refers to its original position.
- C2: Explain cancellation versus moving an instance, and the relevant interactions between recurrence rules, exclusions, and overrides within the supported subset.
- C3: Specify local time/time-zone handling across a daylight-saving boundary and disclose ambiguous/nonexistent-time policy rather than assuming a fixed UTC offset.
- C4: Compare at least two provider/analogous mechanisms at the operation level and explain which concepts transfer to file interchange and which do not.
- C5: Describe preservation of unknown properties, idempotent repeat import, and round-trip risks; connect a relevant implementation or history detail to the compatibility decision.
- C6: Separate supported behavior, unverified assumptions, and proposed-versus-executed validation; state what unsupported inputs do.

Negative constraints: no full calendar application; no account/API access; no mass editing of all future instances; no silent drop of unknown properties; no conversion of recurring local wall time into a permanent fixed UTC schedule; no claim of interoperability without testing.

Time budget: investigation 30 minutes, critique 12, revision 18. Save substantive discovery before root releases the concealed user draft. Discovery should identify consequential evidence, comparator mechanisms, and unresolved implementation questions. Deliver a bounded recommendation, edit/identity sketch, critique dispositions, and a proposed round-trip validation matrix. Primary standards and first-party implementation/history evidence are appropriate; no sources or correct outcomes are provided here. No validation has been executed.
