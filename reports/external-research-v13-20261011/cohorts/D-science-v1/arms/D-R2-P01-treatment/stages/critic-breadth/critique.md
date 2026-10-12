# B06 complementary breadth critique — D-P05

## Review scope

I read the released brief, the exact revealed plan, the complete investigator discovery and draft, its plan-reveal record, source-map, and source index. I reviewed the indexed source set S01–S18 and reopened S10 and S11 at the locators used below. No product or synthetic-corpus checks were run by this critic; the draft correctly labels its checks as proposals.

## Overall coverage

The draft responds to the released plan rather than only the earlier brief. Its main separation—relevance ranking, policy authority/currentness, edition identity, passage location, and authorization—is useful and preserves the brief’s central constraints. It does not select a platform or treat a search feature as a complete authorization, versioning, or citation solution. The exact-plan dispositions and proposed validation distinction are present.

| Released plan clause | Breadth disposition in draft | Critic view |
|---|---|---|
| Document ID, edition number, chunk ordinal | Correct; use authoritative edition ID and stronger passage locators | Complete. It explains why ordinal alone retargets after edits and offers stable blocks, quote selectors, and position fallback. |
| Show title, heading, highlighted snippet | Conditional on permission | Complete. It correctly treats each field as protected content, including counts, facets, previews, logs, and caches. |
| Citation stores displayed fields plus live URL | Reject as durable identity | Complete. It binds to an edition and passage and rejects temporary download URLs as durable links. |
| Permission filter before display | Insufficient without current fail-closed authorization | Complete and responsive to the visibility requirement; includes errors, cache hits, and metadata channels. |
| Team labels refreshed on reindex | Not sole authority; candidate filter only | Complete. It separates index freshness from authorization and names group propagation and revocation SLOs as owner decisions. |
| Cached snippets until next refresh | Reject | Complete. Reauthorization and revocation invalidation are explicit, as is the limit on already-exported copies. |
| Exact terms plus semantic similarity | Evaluation hypothesis; begin lexical and compare lexical, semantic, hybrid | Complete at planning level. It does not mistake fusion defaults for proven relevance. |
| New edition replaces old in ordinary results; archive citations | Conditional on explicit edition states and retention authority | Complete. It distinguishes cited edition from current edition and requires authorization to the exact retained version. |
| Removed passage redirects to related heading | Reject as default | Complete. It preserves original target or stops; a related current passage is separately labeled. |

## Findings for the reviser

### B01 — Specify the copied-reference and recipient boundary

The brief says staff paste a reference into a work note and access differs between teams. The draft recommends an opaque citation record, keeps selector text in an access-controlled domain, reauthorizes when a citation opens, and correctly says the system cannot retract copies already exported. It does not yet specify what the copy action places in the note or how the note’s other readers are handled.

Add an explicit default: copied references should contain only a non-authorizing opaque resolver ID and the minimum owner-approved context; a reference ID must not act as a bearer credential. The resolver should authenticate and authorize each opening viewer under current policy before returning a title, quote, or edition. If a user elects to copy title/quote text into a note, make that a deliberate disclosure whose audience and retention belong to the note/source owners; later revocation cannot recall it. This is a design boundary, not a promise to control an external work-note system. W3C’s TextQuoteSelector copies selected text and warns that the method can be dangerous for access-restricted content [S10].

Proposed synthetic addition: the citation creator can see an excerpt but a note recipient cannot; verify the copied default and resolver return no protected fields, including after the creator’s permission is revoked. Production validation of note ACL integration remains proposed.

### B02 — Bind selectors to the exact representation the user saw

The draft already stores an edition ID, canonical rendered-text digest, and extractor version, which is a strong base. Tighten this to an explicit representation state: format (for example, HTML versus PDF), locale/language where applicable, renderer/extractor and normalization profile, and the digest of the selected textual representation. Resolve that state before applying selectors. A source edition may have multiple representations, and a stable edition ID alone does not prove which rendered text a user selected. The W3C model describes State as identifying the intended version or format and says to process State before Selector; it also specifies normalized Unicode text selectors and notes that position selectors are brittle [S10].

Proposed synthetic addition: one source edition served in two formats or locales, plus markup/entity normalization, a repeated quote, and bidirectional Unicode text. Confirm the resolver identifies the original representation and returns ambiguity rather than silently moving the highlight.

### B03 — Make the derived-data lifecycle a visible owner boundary

The draft covers result/snippet caches, index generations, permission generations, and the no-external-upload default. Add a compact inventory of derived copies affected by ACL change, withdrawal, and retention: extracted chunks, embeddings/vector records, active and prior index generations, replicas, backups, logs/telemetry, and retry/dead-letter queues. Define which copies must be synchronously blocked, invalidated asynchronously, retained under approved policy, or left outside the product’s revocation promise. This follows from the brief’s private-data boundary and visibility requirement; it does not establish a particular deletion or backup policy. Owners must decide it.

## Useful alternatives and unresolved choices

The draft usefully compares a local PostgreSQL lexical baseline, maintained OpenSearch/Elastic hybrid patterns, and Typesense scoped keys without selecting one. It proposes lexical-only, semantic-only, and hybrid evaluation on judged queries. At the next architecture decision, add a short comparison by private deployment boundary, languages, ACL freshness mechanism, versioned-content integration, operations/licensing, latency, and cost; the actual weights and real-corpus results remain owner work.

The locator alternatives are well chosen: stable authored block ID, edition plus digest, quote with context, position/ordinal, heading/fragment, and fuzzy/semantic candidate. Keep fuzzy matching as a separately labeled suggestion. The exact-edition-unavailable state and a separate link to a newer passage are preferable to fulfilling an old citation with a redirected target. Do not resolve the still-open owner questions about source authority, historical ACLs, retention/legal holds, or permission SLOs in this review.

## Validation status

**Executed by investigator or critic:** no product, relevance, authorization, or synthetic-corpus checks are evidenced in this stage. Source reading is research, not an integration check.

**Proposed:** retain the draft’s heading move, duplicate quote, two-edition/ordinal shift, revoked ACL with warmed cache, conflicting ranking, index rebuild/failure, and removed-passage cases. Add the B01 recipient/copy case, B02 representation/normalization cases, and B03 deletion/invalidation coverage. Real-corpus relevance, real identity/group resolution, revocation races, note ACL integration, and owner policy decisions remain proposed.
