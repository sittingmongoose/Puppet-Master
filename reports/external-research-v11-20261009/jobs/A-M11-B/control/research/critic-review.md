# Fresh critic/reviser pass — ER11 research draft

**Pass:** 2026-10-09, after first complete draft and before Goal completion. I set aside the synthesis and checked it against the assignment, exact case brief, revealed P1–P6, source map and recorded source notes. The independent discovery remains frozen and was not edited.

## Coverage and corrections made

- O1: The draft includes several materially different approaches not present as tooling details in the thin plan: OpenRefine reconciliation with Getty authorities; PostgreSQL FTS/pgvector exact-first; integrated Typesense hybrid retrieval; Qdrant dense/sparse fusion; IIIF delivery/auth; Mukurtu’s protocol-centered CMS; and Local Contexts labels.
- O2: Source notes retain governing behavior/defaults and applicability, including API/version pins, Typesense hybrid weights and vector distance units, Qdrant RRF defaults and version floors, PostgreSQL GIN and pgvector HNSW/filter defaults, reconciliation human-review semantics, Getty update/licensing/retired services, IIIF service scope/security, and Mukurtu media/item separation.
- O3: The pgvector issue/release sequence is described as an issue plus 0.8.0 filter/iterative-scan improvement plus disabled-by-default and later 40k-row tuning reports, rather than a universal performance conclusion. The Cantaloupe 401 fix is a second limited release-evolution example, not a security certification.
- O4: The draft reproduces and classifies all exact P clauses. It distinguishes corrections, conditional/optional capabilities, decisions for the museum/community, rejected mechanisms and uncertain product/quality choices. P5’s transparency/export intent is already covered by the brief; the plan’s direct-write mechanism is rejected.
- O5: The full 40k/uneven-description/image/rights/cultural-material/visitor/curator constraints, alternatives, conditions, disagreement between simplest exact baseline and specialized vector services, unknowns and stakeholder decisions are present in prose.
- O6: Proposed relevance, enrichment, image and access tests are separate from the executed-work record; none is claimed to have run.
- P6 correction: the brief and plan do not actually provide the curator’s ten strings. The draft now says to include them when supplied and keeps all other validation proposals explicit.
- Inference hygiene: one P3 statement that a descriptive label or rights note does not guarantee access enforcement is an inference from the IIIF API’s delivery scope and the label’s contextual/educational scope. The draft should mark that connection explicitly.

## Final edit prompted by critique

I am marking the P3 access-control distinction as a research inference: the descriptive Image API and Local Contexts label semantics communicate capabilities/context, while an access decision needs a server-enforced policy check on each protected resource. The technical validation remains a proposal.

## Remaining limitations

The source map identifies exact URLs, versions/tags or mutable snapshots, locators, browser operations and the exact UTC time immediately before the open batch. The browser tooling does not reveal remote per-page transport timestamps; this limitation is recorded rather than inventing finer timestamps. Public sources do not determine museum policy, actual rights, community authority, the installed stack, benchmark performance, embedding quality or operations staffing. No user study, dataset inspection, runtime test, security audit or benchmark was available or run. Those boundaries are repeated in the draft.

## Review disposition

After the P6 accuracy correction and this inference annotation, the draft addresses every named obligation. No additional conclusion is warranted without the user/community decisions or the proposed evidence.
