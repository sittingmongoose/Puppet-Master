# B06 complementary truth critique — D-P05

## Scope and overall assessment

Reviewed the released brief, exact revealed plan, investigator discovery/draft and investigator source map, plus indexed primary-source context. This is a truth/applicability review; no integration or product check was run. The draft is broadly accurate and preserves the brief’s central constraints. Its high-impact corrections—ordinal-only identity, live-URL-only citation, stale ACL/snippet exposure, ranking as authority, and silent redirect of a missing citation—are justified. I found two material precision issues and one implementation-choice overreach to resolve.

## Findings for the reviser

### F1 — Guard the alias publication against partial action success

The draft says a versioned index plus an “atomic alias swap” can avoid exposing a partly built index [S13]. Elastic’s current alias documentation describes multiple actions as a single atomic operation, but also documents per-action partial success when some actions succeed and others fail. It recommends must_exist=true when the whole action list should fail if any action fails. The caller must inspect the complete response; “atomic swap” alone overstates the publication guarantee. See S13, “Multiple actions” and “Multiple action results” (lines 71–146).

**Correction:** Keep the alias pattern as an option, but require publishing a complete validated index, guarding the intended alias change against partial success, inspecting every action result, and retaining the old pointer/index on failure. This narrows the claim without rejecting atomic publication.

### F2 — State OpenSearch DLS role defaults and exception explicitly

The draft correctly warns that OpenSearch DLS has role-combination caveats, but the summary is too compressed to guide a safe implementation [S05]. The current documentation says DLS query rules combine with OR. If a DLS role is combined with a role without DLS, results remain filtered by the DLS role by default; enabling plugins.security.dfm_empty_overrides_all permits the no-DLS role to override those restrictions. The same page says DLS applies to read retrieval, not writes, and the default TLQ evaluation mode is adaptive. See S05, “Use term-level lookup queries (TLQs) with DLS” and “DLS and multiple roles” (lines 154–191).

**Correction:** State the default/exception pair and require checking the deployed plugin version and setting. The draft does not falsely claim that a no-DLS OpenSearch role always widens access, but should not leave this material condition implicit. Keep the separate Elastic warning as written: current Elastic docs say a role without a document query can widen access to all documents when combined with a DLS role, and queries combine by OR [S12, “Multiple roles with document and field level security,” lines 504–512].

### F3 — Historical ACL alone conflicts with the brief’s revocation rule

The draft’s resolver flow checks current access at open, but its owner-decision list leaves “current ACL, historical ACL, or a more restrictive rule” open. The brief requires that search and citations not reveal restricted titles, snippets, or cached passages after permission changes (brief, paragraph 3). Historical permission at citation time, by itself, can preserve access after a user loses current access.

**Correction:** Retain the owner decision about how archived editions are governed, but constrain valid outcomes: any historical-access exception must still satisfy a current, owner-authorized access rule at disclosure time, or be an explicit policy-approved exception consistent with the brief’s visibility requirement. Historical ACL alone cannot be presented as an equally acceptable default. Clarify the permission-change commit point and the evidence/freshness contract that makes “current” true.

### F4 — Preserve the authorization invariant without prematurely requiring one topology

The draft says to obtain current permission from the authoritative source and confirm it for every candidate [draft, “Permission and cache sequence,” steps 1 and 3]. This is a defensible fail-closed design, but can be read as requiring a synchronous direct call to each document platform for every candidate before any result. The brief requires no disclosure after permission changes; it does not select the authorization topology. The primary examples show distinct mechanisms: Azure query-time evaluation can fail closed when ACL evaluation fails, while its push-index ACL state reflects last-written values until affected records are updated [S08, “Limitations,” lines 52–64; S09, “Limitations,” lines 51–63]. Neither proves that a proposed integration meets the required freshness.

**Correction:** State the invariant first: do not disclose metadata or content until a current authorization decision is established, and fail closed when that decision or freshness cannot be established. Allow either the authoritative source or an owner-approved authorization service/permission-generation mechanism that proves required currentness. Require owners to set the revocation commit point and freshness/SLO; an eventual index refresh or unbounded cache TTL does not satisfy the invariant. The draft already asks for an SLO, so this is a wording refinement, not a weakening of the brief.

## Clause-by-clause truth and applicability

| Plan clause / draft treatment | Review |
|---|---|
| Document ID, edition and ordinal chunks → correct; use edition-bound locators | Supported. W3C defines quote and position selectors; duplicate quote matches can identify multiple spans, and positions can break under edits. Draft correctly treats these as locators, not edition authenticity [S10, §§4.1, 4.2.4–4.2.5]. |
| Title, heading and snippet → disclose only after permission | Consistent with the brief. Extending the rule to counts, facets, cache hits and citation resolution is a design recommendation, not an executed authorization result. |
| Live URL citation → reject as durable | Supported. Graph versions have IDs, but its version download URL needs no authentication, expires after a short period, cannot be cached, and permission removal might not invalidate it immediately [S11, “Instance attributes,” lines 52–58]. |
| Indexed team labels and “filter before display” | Correctly treated as insufficient alone. Azure’s query docs specify failure rather than partial results on ACL evaluation failure; its push API says permission state follows values last written until re-ingestion/update [S08–S09]. Preserve preview/version qualifications; do not generalize Azure behavior to every engine. |
| Cached snippets until refresh → reject | Required by the brief’s post-change visibility rule. Draft correctly treats snippets as restricted and does not promise revocation of exported copies. |
| Exact + semantic ranking | Correctly left as a testable hypothesis. Vendor hybrid/RRF mechanics do not establish relevance for this corpus; no relevance checks were executed. Keep ranking independent from authority/currentness. |
| New edition in ordinary search; old editions for citations | Sound only with owner-designated currentness, live authorization and explicit retention. Graph version IDs and SharePoint history do not guarantee durable retention. SharePoint describes permanent purge after expiry/count trimming, with retention/hold exceptions [S18, “What happens to versions…” and “How do legal holds…”]. |
| Removed passage → latest related heading | Correctly rejects silent substitution. It preserves a separately labeled related-current suggestion and unavailable state, so it does not remove navigation utility. |
| Index states, owner questions, validation status | Appropriate. Synthetic and production checks are clearly proposed, not executed; documentation is not presented as integration validation. |

## Review conclusion

Retain the recommendation and its uncertainty. Apply F1–F3 as substantive corrections and F4 as a precision improvement. No finding supports selecting a search engine, document platform, hosted embedding service, retention policy or relevance configuration. Keep release checks, private-data approval, owner decisions and actual tests distinct from documentation evidence.
