# Frozen sandbox plan: community telescope notebook

Status: thin prospective planning snapshot for a hypothetical small club. This document contains proposals and unvalidated assumptions only. No listed behavior is a scientific fact, component guarantee or established test result. It is read-only research input, not Puppet Master canon.

## A-P1 — Intended boundary

Proposal: begin with one club and a modest web review interface plus a way to record session notes when connectivity is limited. Support session preparation, image/notes ingest, member annotations and a portable selected-session export. Preserve the originals. Hardware command/control and scientific reduction are outside the initial product.

## A-P2 — Session and image records

Proposal: give sessions and imported files internal identifiers, retain original filenames and submitted observation metadata, and keep processed images linked to an original. Store an observation time and a target label when provided. Assume for initial discussion that a common metadata record and a reviewable preview can represent the club's mixed files; formats, time semantics, missing fields, transformations and limits have not been checked.

## A-P3 — Ingest and storage

Proposal: copy a selected session folder into a club-managed store, record file identities and create derived previews without rewriting originals. Show a simple progress/status record and allow an interrupted import to be retried. A repeated import could initially be identified by the file's bytes; what counts as the same observation, renamed file or new processing version remains to be decided. No ingest library or storage service is selected.

## A-P4 — Annotations and review

Proposal: allow text comments and rectangular image regions with author and edit time. Retain an annotation history. Start by treating a saved region as a position on the currently displayed preview, and ask members to review annotations when a processed image replaces that preview. Whether this is an adequate durable reference is an unvalidated design assumption. Do not convert member comments into scientific classifications automatically.

## A-P5 — Collaboration and visibility

Proposal: use member and coordinator roles, with private drafts and explicit club-visible publication. Keep draft session notes locally until they can be submitted. For a first design discussion, a later submitted note revision could become the visible one while earlier revisions remain available; simultaneous edits, reconnect behavior, deletion and attachment access need investigation rather than an assumed merge guarantee.

## A-P6 — Handoff and maintenance

Proposal: export selected records, source images, chosen derivatives and annotations as a portable packet with a manifest. Members should see provenance and incomplete entries. A coordinator may withdraw shared material; recovery, export copies and retention policy are open choices. Prefer components with public documentation and maintainable licensing, but no component or format family is preselected.

## A-P7 — Validation to propose

Proposal only, not executed: try representative member-supplied sessions, mixed metadata, interrupted/repeated import, a new processed image with existing annotations, two members editing notes and a packet export followed by reinspection. Research should explain the decisive observable checks and conditions without building the application or manufacturing astronomy ground truth.
