# Independent critic review — B09-P01-treatment

## Scope and disposition

I reviewed the original brief, the frozen revealed plan and its release record, the complete investigator discovery and draft, the investigator source map, and its bounded source index. I independently opened the primary documentation, version-tagged code/release pages, and immutable SpaceWorks commits listed in that index. This is a critique of the package, not a replacement proposal or a product decision.

The package covers the brief broadly and handles the draft's unsafe multi-device outage assumption well. It preserves the no-inferred-return, no-history-erasure, no-automatic-send and no-deployment constraints. The plan-by-plan table is useful, and proposed checks are clearly separated from executed work. One cited Snipe-IT release claim is not supported by its cited page. There are also material candidate-specific gaps around SpaceWorks reminders/handoff requirements, evidence for correction semantics and alias search, and the SQLite version condition.

## Findings

### F1 — Material wrong: Snipe-IT v8.7.2 checkout regression claim

**Locator:** investigator draft, “Snipe-IT provides…” paragraph and validation item 2; investigator source-map S3; discovery §Candidate approaches, SpaceWorks/Koha/Snipe-IT comparisons.

The draft says v8.7.2 fixed duplicate checkout rows caused by a double-click and uses that history to justify scanner/retry testing. The cited [S3 release page](https://github.com/grokability/snipe-it/releases/tag/v8.7.2) identifies v8.7.2 but its displayed change list discusses restore logging, MariaDB, SCIM, importer and other changes; it contains no double-click checkout fix. “Double” refers there to duplicate logging on restores, a different behavior. I could not substantiate the checkout claim from the exact carried citation. The risk-based retry test remains reasonable, but the claim that this release fixed that defect should not be treated as established. If the investigator intended a different issue or change record, its identity and version remain unverified.

### F2 — Material incomplete: SpaceWorks has relevant hard workflow and reminder conditions

**Locator:** investigator draft, recommendation paragraph on SpaceWorks; identity/deployment table; contacts/notifications plan disposition; validation items 4 and 7; source-map W4/W5.

The draft correctly notes W5 is moving `main` documentation and identifies mandatory issue/return photos and a return remark. It omits two consequential conditions visible in the carried primary pages:

- The pinned W4 self-host guide says return-reminder emails are sent by a management command when it is scheduled (for example by cron or a timer), for issued/partially returned requests past due. This is not evidence that email runs by default, but a configured job would conflict with the brief's no-automatic-message rule. A candidate gate needs to include no scheduler/no sending configuration and a no-message rehearsal.
- W5 says the core handoff requires a box QR scan, an issue photo, and a return photo plus remark; these core requirements cannot be disabled. That is extra capture work and privacy/storage burden for a small tool library, beyond the photos alone noted in the draft. The W1 individual repair action is conditional on individual tracking mode, staff-admin module and edit permission; the draft asks for version/configuration verification but could state these gates explicitly.

The relevant W5 page is mutable `main`, so these observations describe that page at review, not a guaranteed release. W4 is commit-pinned. Verify both against any exact candidate build before relying on them.

### F3 — Material incomplete: no candidate evidence establishes reasoned, preserved corrections

**Locator:** draft recommendation, “Disposition of every plan clause” rows for item IDs/events and validation, “Corrections to the draft”; revealed-plan clauses on correction evidence and proposed correction validation.

The draft appropriately makes a correction reason, actor/time and preservation of the original event a design invariant. The carried evidence does not show that any candidate implements it. Koha K3 establishes configurable logs with module-dependent fields, not correction/reversal semantics. Snipe-IT S2 only allows requiring notes on check-in/out; S5's checkout event is not evidence of immutable correction history. SpaceWorks W1 audits a maintenance-state action, not a corrected loan/return chain. The draft does acknowledge a Snipe-IT gap and delays product selection, but its comparison should carry this as an unverified fit requirement for every candidate, with preservation demonstrated in the pilot before adoption.

### F4 — Material incomplete: candidate support for alias and similar-item search is unverified

**Locator:** draft “Identity, concurrency, and deployment comparison” row 1; plan disposition for names and aliases; validation item 1.

The design recommendation (aliases as search terms, distinguishing details, and physical-ID confirmation) answers the brief. However, the listed sources do not establish that a candidate indexes aliases or how it distinguishes near matches. S5 supports searching Snipe-IT name/tag/serial and related fields, not alias/fuzzy behavior. The proposal correctly includes a synthetic test, so it does not claim execution; it should still describe alias search as an acceptance gate rather than a demonstrated candidate capability.

### F5 — Material incomplete: SQLite/WAL recommendation needs a pinned patched runtime condition

**Locator:** draft recommendation paragraph on SQLite/WAL and the SQLite/PostgreSQL comparison row; source-map D2.

The SQLite-on-one-server option and warning against direct multi-host database-file access are consistent with D1/D2. D2 also records a WAL-reset corruption bug affecting versions through 3.51.2 when separate connections/processes concurrently write or checkpoint the same WAL database; the upstream page says it is fixed in SQLite 3.51.3 and later, with some backports. The source-map records this caveat, but the draft's option does not carry it into its proposed version gate. If SQLite WAL remains an option, specify a patched SQLite build and test concurrent writes/checkpoint/recovery using the actual selected runtime. The bug is rare and condition-dependent; this is a version-control gap, not evidence that SQLite is unsuitable.

### F6 — Minor locator/wording: distinguish unique item identity from active-loan uniqueness

**Locator:** draft “A browser-based service…” paragraph and plan disposition for the authoritative coordinator.

A unique permanent item ID prevents duplicate item identifiers; by itself it does not prevent two open loan events for the same item. The same paragraph also calls for a transaction/row lock and the clause table calls for checking/updating active-loan state atomically, so the intended safeguard is present. For precision, state that every checkout path locks/rechecks the same authoritative item state in the transaction, or add a database constraint such as a partial unique index over active loans. D3 expressly notes that partial indexes can enforce uniqueness over a subset of rows; D4 documents row-lock behavior.

### F7 — Honestly unresolved external input: organization policies and service ownership

**Locator:** draft “Owner decisions that research cannot settle”; revealed-plan clauses on contact, retention, backup ownership, kit identity and offline operation.

Loan duration, contact/reminder policy, retention/anonymization, which kit parts receive IDs, who may repair/correct/retire items, the outage-log custodian, hosting/backup operator, and accepted RTO/RPO require neighborhood-owner decisions. The draft preserves these rather than pretending the sources settle them. They are real adoption prerequisites, not factual research errors.

## Coverage against the original brief and revealed plan

| Obligation or plan disposition | Critic assessment |
|---|---|
| Durable identity for each physical unit; names/aliases are not keys | Preserved and strengthened with non-reused labels and physical-unit confirmation. Alias/search product support remains unverified (F4). |
| Current availability and explainable loan/return corrections | Authoritative state and event history are proposed. Reasoned, preserved correction behavior is not evidenced for any candidate (F3). |
| Two laptops; concurrent checkout | One LAN authority, transaction check and a two-client acceptance test address the risk. Tighten the distinction between unique item IDs and active-loan uniqueness (F6). |
| Internet unreliable while LAN may work | The one-server LAN design separates internet loss from coordinator/LAN loss. The brief's requested behavior is preserved. |
| Kits with removable parts | Parent/child checklist, selective child IDs, and a hold for missing/unverified/damaged parts are proposed. Koha bundle scans support comparison, and the draft correctly notes Koha permits deferred verification (K1). Kit granularity remains an owner decision. |
| Damaged returns create a maintenance hold | Clear explicit invariant and pilot acceptance condition. Koha's damaged flag alone is not a circulation block (K2); SpaceWorks individual repair is permission/tracking conditional (W1). |
| Search aliases and similar items | Design covers aliases and disambiguation; product behavior is not demonstrated by listed sources (F4). |
| Minimum contact details; reminder policy undecided; no automatic messages | Defers collection and preserves no-send rule. SpaceWorks' optional scheduled reminder command needs an explicit disabled/no-schedule gate (F2). |
| No paid cloud requirement | Local self-hosted service remains the initial approach; hosted option is conditional on verifying no required fee, offline behavior, export and retention. |
| No due-date-derived return | Kept as a hard invariant and explicit proposed test. Snipe-IT expected-check-in is correctly not presented as automatic return (S5). Koha has configurable long-overdue/lost status behavior (K2); the draft should continue to distinguish that status from a return. |
| Retirement must not erase loan history | Preserved as a design and restore check. Koha withdrawal can mark unavailable without deleting the item (K2); candidate migration/deletion behavior still needs testing. |
| About 800 items and five years of records | The synthetic validation includes both values. No product was benchmarked, and no latency/restore target was invented; owners must set an acceptable service target if needed. |
| Compare identity, concurrency and deployment approaches without choosing prematurely | Includes item identity, server/offline models, self-hosted/hosted, SQLite/PostgreSQL, four software approaches and a custom service. It properly leaves product choice open. |
| Explore primary docs, code, callers/tests, and issue-to-fix/release history where consequential | The package cites product manuals, source code and immutable SpaceWorks fixes/tests plus release history. The S3 misattribution is the exception (F1); cited code/test existence is not a claim that those tests were run. |
| Organizational gaps, staged adoption, recovery validation | Decisions, synthetic data, shadow session, pilot/migration gates, backup/restore rehearsal and data reconciliation are all included. SpaceWorks’ separate database/object backup burden is correctly identified (W4). |
| Proposed versus executed validation; no deployment/data/messages | Clearly separated. The investigator reports no install/configuration, test execution, borrower access or communication. This critic also ran no product tests and accessed no borrower data. No deployment or communication was requested or performed. |

## Overall assessment

The discovery is useful: it recognizes that internet loss with a reachable LAN coordinator differs from a disconnected coordinator; it does not treat reminder labels as a conflict protocol; it keeps product fit conditional; and it turns high-risk conditions into concrete, proposed checks. The draft materially preserves the revealed plan while correcting its initial two-device provisional-loan assumption. Its proposed-vs-executed statement is appropriately bounded.

F1 requires correction of the evidence attribution. F2–F5 should remain explicit gates in any final recommendation. F6 is a precision improvement. F7 must be resolved by the organization rather than by further source interpretation. Nothing here establishes that a candidate passes the proposed validations or that any candidate is the winner.
