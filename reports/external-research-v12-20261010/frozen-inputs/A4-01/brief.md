# Interrupted-upload archive accession

## Assignment

A community film archive receives single files from 20 MB to 40 GB over unreliable home connections. Its existing object store is S3-compatible, but its provider and supported API subset must be confirmed by the archive owner. Researchers should receive an accession receipt only after the complete object is checked. A browser upload is preferred; a documented desktop fallback is acceptable.

You have a 60-minute whole-topic research envelope. Produce a planning proposal, not an implementation. Use public primary documentation, relevant public source code and released issue/fix history where they bear on the proposal. Discover realistic products, mechanisms and alternatives independently; no product, source or conclusion is preselected. A bounded historical example and useful unfamiliar opportunities matter more than an exhaustive catalogue. Clearly distinguish observed external behavior, your inference and a local product choice.

## Exact numbered obligations

1. Compare single-request and multipart operations, binding any size, part-count, checksum or completion claim to the exact operation and product/version.
2. Compare two realistic intake routes and one analogous resumable-transfer mechanism; distinguish browser limitations from storage-service limits.
3. Explain interrupted transfer, abandoned parts, checksum verification, duplicate accession and receipt issuance.
4. Investigate one relevant released compatibility change or failure/fix chain; avoid treating S3-compatible as identical to every AWS operation.
5. Preserve and investigate this supported optional scope: a curator-authorized command-line fallback for the largest files. It is an authorized option, not a mandatory feature or an established technical capability; recommend conditions, retain it when supported, and explain any evidence-based exclusion.
6. Make owner decisions explicit: The archive storage owner confirms provider capabilities and retention policy; the accession curator owns the point at which a receipt becomes authoritative. Costs are unresolved input, not invented estimates.
7. Preserve negative constraints: Do not upload real films, create buckets or credentials, assume all S3-compatible services have identical limits, or mark a transfer accepted from a progress bar alone.
8. Deliver one coherent evidence-backed research proposal covering obligations 1–8, with recommendations, source/version applicability, useful discoveries, unresolved owner inputs, and a validation table separating checks actually executed from checks merely proposed. Do not report research sources or future tests as executed product validation.

## Research boundaries and deliverable

Keep the investigation at the pilot scale above. No installs, accounts, production access, purchases or live writes are needed. Read-only public retrieval is appropriate; any permitted local discriminating check must be disclosed with its actual inputs and result. A check you did not run remains proposed or NOT_RUN. Deliver a complete proposal with a compact comparison, evidence-linked recommendations and prioritized validation; there is no requirement to build a prototype. Owner inputs may remain explicit decisions, but they do not excuse investigating publicly answerable questions. This brief is the complete discovery input.
