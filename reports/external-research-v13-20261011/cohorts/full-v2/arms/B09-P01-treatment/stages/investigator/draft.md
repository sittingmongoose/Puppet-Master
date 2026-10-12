# Research-backed response to the released draft plan

Plan source: `revealed-plan.md`, released 2026-10-12T00:50:06.916Z, SHA-256 `42c359b02876f8ba1620ebdd8fcfb1813194047145111d5443c58510e6ebe9b4`. The brief-only discovery was frozen by the release helper at SHA-256 `7670b22199aa7720ab42dbaeece5830070827d035c2e32aee2da89a0a74277f2`. Source IDs in brackets resolve through [the sources index](sources/index.md) and its complete metadata in `source-map.json`.

## Recommendation

Keep the plan's core model: a physical-item identity, event-based loan history, a single local coordinator, and explicit checks for simultaneous checkout. Do not select a product until a short pilot verifies kit returns, damage holds, reasoned corrections, contact-data behavior, and restore operations.

For the initial pilot, both laptops should use one server on the local network. An internet outage should not stop service when that server and LAN are working. If the server/LAN is down, do not accept independent laptop checkouts as authoritative. The draft's provisional-label assumption cannot prevent a collision after an item has left. Start with checkout paused or one numbered paper queue controlled by a named volunteer, then reconcile each line against server state before resuming. Treat permitted offline checkout as an owner decision for a later, tested protocol.

A browser-based service on one LAN host can use PostgreSQL when the group can operate that service and its backups; a unique item key plus a transaction/row lock can prevent simultaneous loans. A lightweight single-host service could use SQLite on local server storage for this small volume, with short serialized writes. Do not place an SQLite/WAL database file on a network share for both laptops: WAL requires same-host processes and SQLite guidance discourages direct multi-host file access. [D1–D4]

No candidate is a clear winner. SpaceWorks maps most directly to individual lending, repair holds and audit events, but its self-hosted service stack is substantial; the current modules page also says photos are mandatory for issue/return, which may be unnecessary evidence collection for this group and is on a moving branch. Its pinned code history shows the individual fix-shelf feature, a later count reconciliation fix, and an earlier gap between quantity-tracked and individually tracked repair behavior. Verify the exact release and configuration before shortlisting it. [W1–W6]

Koha has explicit barcode circulation, bundles with scan verification on return, and configurable staff logs. It is more library-oriented and may bring more administration than 800 tools need. A damaged status only marks an item unavailable in search; it does not block checkout/check-in by itself. Multi-computer offline processing requires gathering and sorting logs, and offline checks miss some online rules. [K1–K3]

Snipe-IT provides unique asset tags and barcode guidance, and its administrators can require notes on check-in/out. At the v8.8.0 tag, the Asset model stores an expected check-in date and last-checkout date, associates the target, then emits a checkout event after saving; that model-level code does not imply an automatic return and does not establish a reasoned correction workflow. The reviewed sources also do not establish native kit completeness or maintenance-return behavior. Release v8.7.2 records a fix for duplicate checkout rows on a double-click, so scanner and retry behavior should be checked at the selected version. [S1–S5]

A custom local service can represent the exact kit and correction rules but transfers software upkeep, security, upgrade and recovery duties to the group. Compare it only if a volunteer or service provider accepts that long-term responsibility.

## Identity, concurrency, and deployment comparison

| Approach | Benefits | Limits and proposed use |
|---|---|---|
| Item names, model names or serials as identity | Familiar and often already recorded. | Duplicate physical units collide; serials can be absent or illegible. Use a generated permanent item ID; retain names/serials as attributes. Both Koha barcode circulation and Snipe-IT unique asset tags support the physical-label pattern. [K1, S1] |
| Shared server with one authoritative state | Both laptops see the same availability; a transaction can serialize competing checkouts. Internet can be down while the LAN server remains reachable. | The coordinator host is a single operational dependency; name an operator and test backups and restore. This is the recommended initial deployment. |
| Independent laptop databases with provisional offline loans | Checkout can continue while disconnected. | Conflict resolution occurs after an item may already be gone, and a reminder label cannot guarantee the other volunteer sees or respects it. Do not enable in the first pilot. Koha's multi-computer offline flow itself requires logs from each workstation to be combined and ordered. [K1] |
| Self-hosted LAN application | Does not require a paid cloud account or internet round-trip to make a local transaction, if the selected software supports a self-hosted edition. | The group owns the host, patching, accounts, backup and recovery; verify licensing and any paid feature gates before choosing. SpaceWorks documents PostgreSQL and a separate MinIO object store, with both requiring backup. [W4] |
| Hosted cloud service | Can reduce local host administration and simplify remote access. | Internet instability and a possible recurring paid account conflict with the brief. Consider only if a no-required-fee tier, offline behavior, data export and data retention are verified. |
| SQLite on the LAN server vs PostgreSQL | SQLite on local server storage can serve a small application with serialized writes; PostgreSQL provides database constraints and row locks for shared transactions. | Never open an SQLite/WAL file directly from both laptops over a network share. Choose based on the operator's ability to back up and restore, then test the actual concurrent workflow. [D1–D4] |

## Disposition of every plan clause

| Released plan clause | Disposition | Research response |
|---|---|---|
| Assign internal item IDs and printable labels; record loans/returns as events referencing IDs. | **Keep; strengthen.** | Give every physical unit a permanent, unique, non-reused printed barcode/QR ID separate from its shared type/model record. Scan it at issue/return. Record event ID, item, loan, actor, timestamp, prior/new state and action. Preserve earlier events when corrected. Snipe's unique-tag model and Koha's barcode circulation show established patterns, but verify selected product behavior. [K1, S1] |
| Names and aliases are search fields, not keys. | **Keep.** | Search preferred name, synonyms, make/model, serial/distinguishing traits, category and location. If multiple records match, show distinguishing details and require a unit selection; a scan of the permanent ID should resolve exactly one unit. Alias owners and tie-breaks remain organizational choices. |
| A kit is a parent item with a parts checklist; incomplete or damaged return keeps it in maintenance review. | **Keep; make the hold explicit.** | A kit must stay unavailable while any required child is missing, damaged or unverified. Use individual child IDs when parts are valuable, interchangeable, or likely to be lost; otherwise use a count-and-condition checklist. The group must choose this threshold. Koha bundles support child scans and allow verification to be skipped and deferred, so acceptance should prohibit accidental availability during deferral. [K1] |
| Due dates can flag overdue loans but never imply a return. | **Keep as a hard invariant.** | Only a recorded return event closes a loan. Overdue status is a reminder/reporting state, not an availability transition. Test after due-date passage and confirm that active loan, item status and availability do not change. |
| Retired items remain in history. | **Keep.** | Retirement should make the physical item unavailable for future loans while retaining the item ID, previous loans, kit membership and audit/correction chain. Verify that retirement and import do not hard-delete linked records. |
| A local coordinator is initially authoritative; both laptops read availability from it, and a transaction prevents simultaneous checkout. | **Keep; specify database enforcement.** | Use one LAN authority, short transactions and a database uniqueness rule for the permanent item ID. When accepting a loan, check and update active-loan state in one transaction, with an idempotency key for repeated scans/submissions. PostgreSQL row locks and unique constraints support this pattern; they do not replace workflow tests. [D3–D4] |
| Each disconnected laptop may record a provisional loan for later reconciliation; staff are assumed to notice labels and avoid conflicts. Whether offline checkout is allowed is open. | **Correct the operational default; preserve the policy decision.** | Do not treat two independently created provisional checkouts as safe for an item that may leave the room. The assumption depends on volunteers seeing each other's labels and does not resolve which borrower has the item. For the initial pilot, pause checkout during server loss or use one controlled, uniquely numbered paper log; reconcile before resuming. The group may later authorize offline checkout only after defining custody, identifier allocation, conflict priority, duplicate resolution, and a two-device isolation test. Koha's manual illustrates that even purpose-built offline circulation needs all device logs grouped and ordered before replay. [K1] |
| Store contact details separately, expose them only to staff, and use a staff-reviewed reminder list; nothing sends automatically. | **Keep the no-send rule; narrow collection.** | Do not collect contact details before the group decides a reminder policy. If an owner later approves reminders, store only the chosen contact field needed for that purpose, restrict access to the volunteers who need it, and display a review list without sending. Define how a reminder is recorded and how contacts are removed without erasing retained loan history. No source review established that a candidate's default collection/notification behavior already meets this requirement. |
| Retention/deletion, backup ownership and kit-part identity remain unresolved. | **Owner decisions required before full migration.** | Set retention for contact data, loan events, correction events, photos/evidence and retired item records; define permissible deletion/anonymization without breaking audit history. Name a backup/restore operator and choose recovery time and data-loss limits. Decide which kit parts receive unit IDs. SpaceWorks' guide separates PostgreSQL backups from MinIO files; a database-only backup would omit stored evidence. [W4] |
| Validate duplicate names, competing checkout, coordinator loss, corrections, incomplete kits, damage, and restoration of retired-item history. | **Keep; add observable pass criteria.** | Proposed checks are below. A candidate passes only if exactly one of two simultaneous checkouts commits, every incomplete/damaged kit stays unavailable, a correction preserves the prior event and records actor/reason, and a restored retired unit retains its history. Add due-date, repeated-scan, contact visibility and outbound-message checks. |
| No borrower records or messages have been accessed. | **Keep and confirm.** | No borrower data was accessed and no communication was sent. Pilot only with synthetic identities until policy and privacy controls are approved. |
| Adoption starts with synthetic inventory and a shadow lending session before replacing the existing lists. | **Keep; add a bounded pilot and reconciliation gate.** | Begin with synthetic data, then a 25–50-item pilot on two laptops. Shadow actual stock and loans without changing the current lending authority. Before cutover, reconcile item counts, duplicate-name groups, aliases, kit contents, active loans and history; preserve the former lists read-only until sign-off. |
| This is provisional; resolve material assumptions with primary evidence; no product deployment requested. | **Keep.** | This response is a research proposal only. It does not authorize installation, deployment, borrower processing, or messaging. |

## Corrections to the draft, optional improvements, and owner decisions

### Corrections required to preserve the brief
- Make the unique physical-item identity durable and non-reusable; names and model names cannot identify physical copies.
- Make a returned-but-damaged unit a hard maintenance hold that cannot be checked out until an authorized repair/release event.
- Require a correction reason and preserve the corrected event/value and its replacement or reversal. The plan calls for testing corrections but does not yet state the required explanation.
- Replace independent provisional offline loans as the initial default with one controlled outage procedure. Keep a later offline-write mode open only as a tested policy choice.
- Defer borrower contact collection until the reminder policy is decided. Staff review and no automatic send are already consistent with the brief.
- Enforce single-active-loan concurrency on the authoritative server, not by warning volunteers to notice a conflict.

### Optional improvements
- Add a printed human-readable short code beside each barcode so damaged or unreadable labels can be resolved safely.
- Track condition observations separately from the authoritative available/loaned/maintenance/retired state.
- Add exportable inventory and loan-history reports to support reconciliation and recovery.
- Include a small representative pilot before the shadow session graduates to full migration; the current plan does not define a cutover gate.
- Include a written runbook for server loss, label replacement, backup restore and temporary paper transactions.

### Owner decisions that research cannot settle
- Which item types and kit parts receive their own barcode; acceptable handling of low-value interchangeable parts.
- Loan period, whether a due date is used at all, and what volunteers should do with overdue loans; due date must never close a loan.
- Who may issue, return, mark damaged, release from maintenance, correct events, retire items, or view borrower data.
- Whether reminders will ever be sent, by which channel, to which borrowers, and what minimum contact field and retention rule follows.
- Retention of loan/event history, contacts, photos and correction reasons, plus whether anonymization can be used.
- Outage behavior, the one-log custodian, temporary ID format and who approves reconciliation; later acceptance of multi-device offline writes.
- Who owns the LAN server, patching, backups and recovery; accepted recovery time (RTO) and maximum lost-data window (RPO).
- Whether mandatory photos in a candidate system are acceptable. SpaceWorks' evidence requirement is documented on a moving main-branch page rather than a release-pinned source, so verify it against a selected release. [W5]

## Validation: proposed versus executed

The following are acceptance proposals, not completed tests:

1. Load synthetic data with 800 items, five years of representative loan events, duplicate names, aliases and similar models. Confirm one unique permanent ID per unit and unambiguous scan behavior.
2. Submit the same item checkout concurrently from both laptops, then repeat with rapid double-scans/retries. Pass only if one active loan is created, the losing client sees the current holder/status, and retries do not create duplicate events.
3. Test an internet-only outage with the LAN host reachable; both laptops should continue to see the same current state. Then isolate both clients from the host: verify checkout is blocked or the single authorized paper procedure works. Reconcile while checking for duplicate active loans and lost events.
4. Check out a parent kit, return it complete, then return it with one missing or damaged child and with a deferred verification attempt. Pass only if the kit remains unavailable until every unresolved child is accounted for and repaired/cleared by an authorized volunteer.
5. Correct a wrong checkout and wrong return. Confirm the correction requires a reason, records actor/time, preserves the original event, updates current availability once, and is visible in history.
6. Advance a test due date without a return event; confirm it changes only overdue display/reporting. Retire an item and restore from backup; confirm its identifier, prior loans and correction chain remain.
7. Inspect borrower roles and notification configuration. Confirm unnecessary contact fields are not required, only authorized staff can view approved reminder data, and no email/SMS/webhook is sent.
8. Lose the coordinator host and restore a full backup into an isolated replacement. Verify counts, IDs, active loans, kit-child manifests, repair holds, retired histories and audit events; if evidence objects exist, verify those separately. Record measured RTO/RPO and a discrepancy report before approval.
9. Before cutover, compare the cleansed inventory, active loans and five-year history against the existing lists, including a signed list of unresolved duplicates and exceptions.

**Work actually executed:** read the brief, reviewed listed primary product documentation, repository code/tests, release/history and database documentation, and wrote this proposal. No candidate was installed or configured; no local product code was run; no acceptance or recovery test was executed; no borrower data or external messaging was used.
