# Resumable upload for a small media intake tool

Fixture ID: ER12-A1-01-FRESH. Queue slot: A1-01.
Authoring status: FINALIZED. This is a synthetic user assignment, not external evidence.

We have a desktop intake tool used by volunteer oral-history editors. An editor selects one large audio file on a laptop and sends it to an existing object store. Connections drop; restarting the whole file is painful. Research a bounded resumable-upload addition and produce a recommendation plus a repairable implementation plan. The existing UI, identity system, and storage service are outside scope. Work only on the transfer protocol and its local recovery record.

Assume a fictional Rust client, an existing authenticated upload gateway, S3-compatible storage whose exact compatibility has not been established, and files from 20 MiB to 6 GiB. An upload may be interrupted by process death, network loss, or a changed local file. Credentials are supplied by the host application. No cloud account or production access is available.

Required clauses in the final proposal:
- U1: Define the upload identity, persisted recovery record, and behavior after each interruption, including a changed local file.
- U2: Compare at least two meaningful approaches: a resumable HTTP upload service and the object store's native multipart mechanism. Explain a mechanism-level tradeoff, not a product-name list.
- U3: Establish what completion and integrity mean; distinguish an acknowledged chunk, a completed remote object, and an independently verified byte match.
- U4: Specify cancel, expiry, orphan cleanup, and retry ownership across client, gateway, and storage.
- U5: Connect one relevant implementation or release/history detail to the recommended compatibility boundary, with version/date and remaining uncertainty.
- U6: Separate evidence-supported behavior, original design choices, and open questions. List proposed validation separately from validation actually executed.

Negative constraints: no full uploader app; no new authentication provider; no production credentials; no real uploads; no silent file replacement; no assumption that all S3-compatible vendors behave identically. Do not invent throughput results or claim an unrun test passed.

The 60-minute workflow is investigation (30), independent critique (12), and revision (18). Investigate governing specifications and first-party implementation/history material; keep scope to one transfer and its recovery semantics. At the end of investigation, hand off a short source map, consequential findings, comparison, and unresolved questions. The concealed user draft becomes available only after substantive discovery has been saved; do not seek it in the discovery phase. Critique applicability and unsupported claims; final revision should include decisions, criticism dispositions, and a small proposed validation matrix. An unresolved item can remain unresolved if its consequence and next check are clear.

No sources or expected answers are supplied. No implementation or validation has been performed by the fixture author.
