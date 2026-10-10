# User draft — occurrence edit adapter

Fixture ID: ER12-A1-02-FRESH. Authoring status: FINALIZED.
Concealed until root receives substantive discovery. This incomplete user plan contains hypotheses; it is not a standard interpretation or answer key.

My first idea stores the series UID and occurrence start timestamp as a composite key. For a weekly 18:30 rehearsal, expand eight weeks in advance, convert starts to UTC, and keep those rows as the schedule. When staff cancel a row, remove it and add its start time to an exclusion list. When they move a row, add a standalone event with a new UID and the replacement start. I have not checked whether this preserves the relationship to the original instance or what re-import does.

I would like the first release to retain local 18:30 across clock changes. The expansion window is a UI convenience, not an assertion that the series ends there. The draft does not specify whether an occurrence key uses the originally scheduled start or the current moved start, and it does not explain how an already imported exception is merged. Please resolve those choices rather than implementing the sketch literally.

I remember provider APIs offering instance-edit operations, but do not know whether their event IDs or cancellation semantics can be carried unchanged into .ics files. Research the mechanism and conditions before treating an API operation as an interchange guarantee. An existing Rust calendar library would be welcome if its actual support is adequate; I have not selected or installed one.

Preserve C1–C6 and all negative constraints. Keep the feature to one supported weekly-series subset and a single-instance operation. Preserve opaque properties verbatim where feasible; disclose any transformation that cannot safely round-trip. Unsupported recurrence forms should be surfaced explicitly without rewriting the original file. No server synchronization or conflict resolution service is required.

Proposed validation only: synthetic weekly rehearsals around a clock change; one cancelled occurrence; one moved across a date boundary; an existing override; importing the same export twice; an unknown property; an unsupported recurrence form. Define an observable identity/time/preservation invariant for each. A local parser round-trip would not prove compatibility with a live provider. No files have been imported, exported, or tested yet.
