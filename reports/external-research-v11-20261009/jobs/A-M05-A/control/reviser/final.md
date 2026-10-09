# ER11 S05 museum-search — final deliverable (reviser)

Case A-M05-A / control / reviser, method M05 v1 retained-investigator, written 2026-10-09T20:15Z. This document is
the single self-contained final for the case: it integrates the research stage's discovery and draft, the critic
stage's thirteen criticisms, and my own verification (reviser `verification-notes.md`; two independent primary
fetches this session, SRC-R01/SRC-R02). Per the retained-investigator method it decides every criticism explicitly
— accept / amend / reject / retain uncertainty — on evidence, not obedience. Grading vocabulary, carried from the
prior stages: **verified** = quoted at a fetched primary surface (quote-accuracy grade, not source-authority grade —
m4 below keeps the distinction visible); **candidate** = named with domain knowledge, no retained primary evidence.
Honesty (O6): nothing in this case executed product code; the only executed operations were source retrieval
(research SRC-01…09, critic SRC-C01…C09) and the reviser's two verification fetches (≈2026-10-09T20:10Z).
Sources were treated as data throughout; usage/billing unobserved: null.

## 1. Criticism decision record

| ID | Criticism (compressed) | Decision | Disposition in this final |
|---|---|---|---|
| M1 | P4 rejection grounds (a)/(d) overreach; rejection itself stands | AMEND | Rejection upheld on (b) fragility + (c) category error + curator-transparency design; ground (a) recast as a quantified condition on a user latency decision (the up-to-24h staleness is a real factual consequence of nightly removal — kept as fact, demoted from defect); ground (d) recast as a design condition satisfiable by the P1 internal index scope. §5 P4. |
| M2 | Draft uncertainties (2)/(3) were resolvable; Typesense defaults differ materially from Meilisearch's | ACCEPT | Typesense 30.2 defaults independently re-fetched and confirmed (SRC-R02); engine comparison restated with verified values in §4; extended beyond the critic: the numeric-fuzz knob the critic could not surface (`enable_typos_for_numerical_tokens`, default true) is now verified, discharging that residual item. |
| M3 | RightsStatements twelve-statement set settled; both prior lists incomplete; OOC not defined | ACCEPT | The twelve statements stated in full in §5 P4 / §3, from the master TTL independently re-fetched (SRC-R01); "full hierarchy unconfirmed" hedge discharged; canonical-site-untested caveat retained. |
| M4 | P1 correction conflates record-level visibility with field-level sensitivity | ACCEPT | Allowlist kept as recommended default, explicitly conditioned on a user decision about local field-level sensitivity (the brief establishes restricted *material* only — zero occurrences of field-level language in the brief text). §2 P1. |
| M5 | Solr/Elasticsearch/OpenSearch family and museum platforms silently absent (O1 gap) | ACCEPT | Named-and-disposed in §3: the JVM engines rejected for this scope on ops-appetite grounds (candidate-grade reasoning, stated as such); CollectiveAccess / Omeka S / Islandora acknowledged as candidate leads with their trade-offs. No new primary fetch — the defect was the silence, not a missing answer. |
| M6 | V3 lacks its applicability condition | ACCEPT | V3 labeled conditional on Postgres+pgvector; corollary stated that on a dedicated-engine choice the SRC-02 chain becomes inapplicable background. §7. |
| M7 | P3 "captions double as alt text" is a false-correction risk | ACCEPT | Split adopted: captions-as-content (visibility) stays a correction; caption-as-alt-text demoted to optional enhancement with a new proposed alt-text sampling check (V7). §2 P3, §7. |
| m1 | P5 "rejected" overstates necessity | ACCEPT | P5 re-graded correction-with-strong-default: overlay-with-provenance is the strong default; in-place-with-audit-trail named as the known weaker alternative (candidate-grade). §2 P5. |
| m2 | P6 framing: sample-size claim asserted without evidence; staff-written golden set carries the same insider bias | ACCEPT | Discrimination claim restated as design judgment; bias acknowledged for the golden set with a mitigation lead (visitor search logs / reference-desk vocabulary — availability unknown, user-side). §2 P6. |
| m3 | "pin ≥0.8.4" is a superset pin | ACCEPT | Layered requirements stated: ≥0.8.0 for iterative index scans, ≥0.8.3/0.8.4 for the HNSW vacuum fixes; ≥0.8.4 kept as the practical superset recommendation. §2 P2, §4. |
| m4 | "Verified" grades quote-accuracy, not source authority | ACCEPT | Distinction carried explicitly where Mukurtu patterns are recommended (product-documented, not deployment-verified) and for the Meilisearch learn-guide vs API-reference layers. §5 P4, §4. |
| m5 | Meilisearch ≤255 upper bound unconfirmed at API layer | RETAIN UNCERTAINTY | Bound quoted as learn-guide-layer only; residual uncertainty kept, not resolved, not deleted. §4. |
| m6 | SRC-02 is a mutable master branch; citations must carry pins | ACCEPT | All mutable-source citations (pgvector CHANGELOG master, rights-statements.ttl master, Typesense versioned docs) carry tag+date / enumeration+date / version-path pins. §4, §6. |

No criticism was rejected outright: each survived independent checking (reviser `verification-notes.md`), with two
reviser modifications beyond the critic's own text — M1's ground (a) is kept as a factual condition rather than
discarded, and M2's residual numeric-fuzz uncertainty is discharged by SRC-R02.

## 2. Exact per-P dispositions (O4)

The revealed thin plan, quoted clause by clause with dispositions in the O4 vocabulary (correction / optional
enhancement / user decision / already-covered / rejected / uncertain). Each disposition is materially complete
here; evidence IDs support, never replace, the text.

### P1 — "Index all fields with keyword search."

**Disposition: correction + user decision (partially already-covered) — grounds amended per M4.** Keyword indexing
is the right baseline and was already covered by discovery; the correction stands but its grounds are re-scoped.
"Index all fields" is wrong as a blanket default for two distinct reasons that must not be conflated: (1)
*record-level* restriction — records with restricted cultural material must be excluded from the public index by
query-time visibility filtering (P4's mechanism, not P1's); and (2) *field-level* sensitivity — sensitive fields on
otherwise-public records (internal curator notes, donor/rights-holder contacts) must be excluded from the public
index or the index itself becomes a disclosure channel. The brief establishes only the first as fact; whether the
second exists in this catalog is **user-side data**, so the public-field allowlist is a recommended default
*conditioned on that user decision* (M4). A separate internal index scope for curator search is retained either way
— it is what keeps curator transparency compatible with a filtered public index, and it matters again at P4(d).
Governing defaults for the engine decision, all now verified: SQLite FTS5 has **no** typo tolerance and **no**
synonyms built in (an application-level synonym layer is needed); Meilisearch allows 1 typo from 5 characters, 2
from 9, first-character typos count double, hard max 2, numeric fuzz on by default (`disableOnNumbers=false`);
Typesense 30.2 allows 1 typo from 4 characters, 2 from 7, `num_typos=2` default, `typo_tokens_threshold=1`, numeric
fuzz on by default (`enable_typos_for_numerical_tokens=true`). Both dedicated engines therefore fuzz numerics by
default and both expose an off switch — identifier fields (accession numbers, registry numbers, years) need
per-attribute configuration on either. The engine choice (SQLite/Postgres FTS5 vs Meilisearch vs Typesense, with
§3's rejected families named) is a **user decision**; at 40k records both shapes are viable, and the §7 validation
set is the discriminator. Solr/Elasticsearch/OpenSearch are disposed in §3 (rejected for this scope).

### P2 — "Add embeddings of each entire record for semantic search."

**Disposition: optional enhancement + correction.** A semantic layer is an enhancement over the keyword baseline,
not a replacement, and its value for *this* catalog is formally uncertain until the validation set runs (§7 V1) —
uncertainty retained. Correction: embedding each entire record wholesale dilutes signal — embed per field/section
(title, object description, materials, period) and images separately, with a record-level vector only as a weighted
composite if evaluation supports it. (Whether whole-record embeddings suffice for short records is a design
judgment for V1 to settle, not settled here.) If Postgres/pgvector is the stack, the version requirement is
**layered** (m3, clarified not changed): iterative index scans — the behavior that stops a rights/visibility filter
from silently under-returning results — arrived in **0.8.0 (2024-10-30)**; possible HNSW index corruption during
vacuuming was fixed in **0.8.3 (2026-06-17)**; further vacuum/memory fixes landed in **0.8.4 (2026-06-30)**; the
newest observed release is **0.8.7 (2026-10-01)**. The practical pin **≥0.8.4 is a superset**, chosen to include
the integrity fixes — a reader must not infer that <0.8.4 lacks filtered scans. At 40k records an exact
(non-indexed) scan is also viable, which de-risks the whole HNSW vacuum chain. Alternatives retained: Typesense
built-in embedding generation + hybrid search in one binary (its typo defaults now verified, §4; embedding-model
options itself candidate-grade); CLIP-style image/text embeddings via the same vector store (candidate — no model
documentation retained, stated absent).

### P3 — "Publish resized images with their catalog captions."

**Disposition: correction + already-covered + condition; one sub-claim demoted per M7.** Already covered by
discovery and restated here: IIIF Image API 3.0 (3.0.0 "Orange Blooms", 2020-06-03) serves URL-derived derivatives
— `{base}/{identifier}/{region}/{size}/{rotation}/{quality}.{format}` plus `info.json`, fixed processing order
("Region THEN Size THEN Rotation THEN Quality THEN Format"), non-`^` upscale requests answered with HTTP 400,
conformance levels 0/1/2 with level-0 permitting pure static pre-generated files, optional `maxWidth`/`maxHeight`/
`maxArea` limits, CORS expected. So "publish resized images" should be implemented as IIIF-style derivative
serving, starting at level-0 static derivatives and moving to a dynamic server (Cantaloupe/IIPImage — candidates,
not fetched) only if zoom/region demand appears. Corrections that stand: (a) captions are **content** — caption
text can itself be sensitive or rights-bearing, so captions ride under the same visibility rules as their objects;
(b) the serving layer is an **enforcement point** — quality downgrades, watermarking and region restriction for
restricted material happen per-request there, never by baking restricted derivatives to disk. Demoted per M7: the
draft's claim that captions "double as alt text" is **not** a correction of the plan but an optional enhancement
with a real failure mode — catalog captions are content-bearing prose about the object, not text written to the
screen-reader contract, and wiring caption→alt-text unexamined produces accessibility theater (long captions read
wholesale, or captions that omit what the image visually shows). It requires its own check: proposed validation
V7 (alt-text sampling, §7).

### P4 — "Restricted records are removed during the nightly index job."

**Disposition: rejected — grounds re-scoped per M1.** The rejection is upheld, on grounds that survive checking:
(b) **fragility** — any index rebuild that forgets the removal filter re-publishes restricted records wholesale;
(c) **category error** — index removal is a sync side effect, not enforcement; the requirement is server-side
per-query visibility filtering that composes with keyword, facet and vector retrieval (the same lesson the pgvector
chain teaches: pre-0.8.0 filtered index scans silently under-returned, and the fix was query-time filtering done
right — 0.8.0 iterative scans); plus the curator-transparency **design** requirement — curators need restricted
records visible *to them* with a why-is-this-hidden view. Re-scoped per M1: ground (a)'s exposure window is a true
factual consequence — a record whose rights change to restricted mid-day stays publicly searchable for up to 24
hours under nightly removal — but the brief states rights *change* and never sets an enforcement-latency
requirement, so this is a **quantified condition on a user decision**: if same-day takedown matters to this
museum, nightly removal is insufficient *by construction*; if it does not, the condition is vacuous. Ground (d)
likewise becomes a design condition: a nightly public-index removal could coexist with the P1 internal index scope,
so "removal destroys curator visibility" is true only of the public face, not the curator workflow. Replacement
(verified product documentation, not deployment verification — m4): the Mukurtu pattern — access decided per record
by community/protocol membership at query and serve time; duplicate/community records for tiered views of one
object; TK Labels for use expectations; media content warnings for sensitive media. Mukurtu (GPLv3, Washington
State University's Center for Digital Scholarship and Curation) may be adopted wholesale or its access pattern
borrowed; migration cost from an unknown system of record is the swing factor (user decision). A nightly job may
remain solely as a backstop consistency *check* that flags any public-index document lacking public visibility
rights. Rights surfacing: the RightsStatements.org SKOS vocabulary (CC0-licensed, URI-identified) defines exactly
twelve statements at master — **InC, InC-OW-EU, InC-RUU, InC-EDU, InC-NC, NoC-NC, NoC-CR, NoC-OKLR, NoC-US, NKC,
CNE, UND** (M3, independently re-fetched; OOC appears only in a 2015 removal comment as undecided "OOC-NC"). Store
statement URIs as identifiers, not display strings; "changing rights" then means re-pointing a record's statement
URI, and the history is exportable. Caveats kept visible: the canonical rightsstatements.org site was unreachable
(HTTPS 526, twice) and remains untested — the repo TTL is the governing primary artifact; any local
statement-allowlist must be drawn from the verified twelve.

### P5 — "Enrichment writes directly to source records."

**Disposition: correction with strong default — re-graded from rejection per m1.** Direct in-place writes work
against the brief's own requirement that curators get transparent corrections and exports: originals are the
export/audit baseline, and silent overwrite destroys provenance exactly where uneven descriptions most need
accountability. The strong default is enrichment as **attributed, reversible overlays** — who/what/when produced
each field, original and enriched stored side by side, curator review before any promotion. But the critic is right
that the brief compels correction, not logical impossibility: in-place writes **with a full audit trail** are a
known alternative pattern, and naming it keeps the disposition honest (candidate-grade — no retained primary
source either way; stated rather than hidden). Reconciliation-style batch tooling (OpenRefine + authority services
such as Wikidata, Getty AAT/LCSH) fits review-before-commit by design but remains **candidate/unverified**: its
documentation failed to fetch in two independent sessions (research SRC-09 entry 6; critic SRC-C09, same failure
class after the documented 301), so reconciliation mechanics (endpoint contract, auto-match thresholds) are
unsupported and gated behind V6. Optional enhancement retained: model-assisted *suggested* descriptions, always as
suggestions under the same overlay discipline.

### P6 — "Validate search with the curator's favorite ten queries."

**Disposition: correction + uncertain.** Curator-favorite queries are a biased instrument: curators are
expert-vocabulary insiders while the brief's target visitor explicitly lacks expert vocabulary. The replacement
instrument is the §7 set: a golden visitor-query set scored nDCG@10 across the engines ±vector, typo torture
against the now-fully-verified default bands, filtered vector recall, a rights enforcement probe, an IIIF
conformance smoke, and a reconciliation pilot if that path is pursued. Two framing corrections per m2, adopted
without changing the direction: (1) the claim that ten queries "cannot discriminate" is a **design judgment about
practicality** (ten is a floor, not a proven insufficiency — no sample-size evidence was retained for any bound);
(2) the golden set's "30–50 staff-written visitor queries" carry the **same insider-vocabulary risk** imputed to
curator favorites, because staff wrote them — the mitigation lead is to derive or validate queries from visitor
search logs or reference-desk vocabulary, where such data exists (user-side availability unknown). Uncertainty is
retained and load-bearing: no executed result exists for any of these, so P2's value and the engine choice both
stay formally uncertain until run.

## 3. Discovery retained, including the previously-missing alternatives (O1)

**Verified (quoted at fetched primary surfaces):** SQLite FTS5 mechanics and defaults (SRC-01); the pgvector
release chain (SRC-02, critic SRC-C03 verbatim); Meilisearch typo-tolerance defaults (SRC-03 learn-guide; SRC-C02
API layer); Typesense 30.2 search-parameter defaults (SRC-C08; reviser SRC-R02); the IIIF Image API 3.0 contract
(SRC-04); the Mukurtu product and access model (SRC-05/06); the RightsStatements twelve-statement vocabulary
(SRC-07 repo-level; SRC-C07 and reviser SRC-R01 at the master TTL).

**Named and disposed per M5 (candidate-grade — domain knowledge, no primary fetch; the O1 defect was silence, and
this closes it):**
- **Solr / Elasticsearch / OpenSearch** — rejected for this scope. Grounds (reasoning, not fetched evidence): a JVM
  cluster's operational appetite is disproportionate to 40,000 records; their retrieval capabilities overlap what
  the already-verified engines cover at this scale; a small museum gains nothing that offsets the ops cost. If the
  institution already runs one, the calculus flips to adoption — noted as the condition under which rejection
  lapses.
- **CollectiveAccess** — museum/GLAM cataloging platform with strong authority/enrichment workflows; candidate lead
  whose fit hinges on the unknown system of record and how much of the cataloging layer the museum wants replaced
  versus the assemble-your-own-stack path.
- **Omeka S** — lighter-weight GLAM publishing/exhibit platform with item metadata and plugins; candidate lead for
  a small museum that wants turnkey public presentation more than search-control depth.
- **Islandora** — repository framework (Fedora-based); candidate lead, heavier infrastructure; plausible only with
  existing institutional repository investment.
All four remain user-decision leads conditioned on facts this research cannot know (current system, ingest format,
ops appetite); disposing of them by name removes the draft's false impression that SQLite/Postgres-FTS5 vs
Meilisearch vs Typesense was the discovered universe.

**Candidate (unverified, attempts logged):** OpenRefine reconciliation mechanics (two independent fetch failures);
Typesense embedding-generation options beyond existence; CLIP / sentence-transformer model specifics;
Cantaloupe / IIPImage as dynamic IIIF servers; Getty AAT / LCSH as authority targets. No silent rebinds anywhere;
documented redirects (SRC-06, SRC-09 entry 5) stand as recorded.

## 4. Governing defaults and units (O2), with the engine comparison stated

All values below are restated materially (self-contained), pinned per m6; "verified" = quoted at the named surface.

- **SQLite FTS5** (docs at sqlite.org/fts5.html, current at access): default tokenizer `unicode61`, diacritics
  removed for Latin script (`remove_diacritics` default 1); bm25 with hard-coded constants k1=1.2, b=0.75 (column
  weights tunable, constants not); NEAR defaults to 10 tokens; maximum token 32768 bytes, silently truncated;
  results unordered without `ORDER BY rank`; external-content tables make index/content consistency the operator's
  job — triggers do not backfill pre-existing rows, `'rebuild'` re-syncs; `contentless_delete=1` from SQLite
  3.43.0. Consequence: silent-drift risk under constant curator edits; no typo/synonym help in stock.
- **Meilisearch** (learn-guide SRC-03; API settings reference SRC-C02): typo tolerance enabled by default;
  `minWordSizeForTypos.oneTypo=5`, `twoTypos=9` (1 typo from ≥5 chars, 2 from ≥9); a first-character typo counts as
  two; maximum 2 per word; `disableOnWords=[]`, `disableOnAttributes=[]`, `disableOnNumbers=false` (numeric fuzz
  on — `2024` can match `2025`); constraint confirmed as twoTypos ≥ oneTypo ≥ 0; the learn-guide's `≤ 255` upper
  bound was **not** surfaced by the API-reference fetch — residual sub-claim uncertainty retained (m5).
- **Typesense 30.2** (versioned docs path, SRC-C08 + reviser SRC-R02): `num_typos=2` default across `query_by`
  fields; `min_len_1typo=4`; `min_len_2typo=7`; `typo_tokens_threshold=1` (0 disables typo tolerance);
  `enable_typos_for_numerical_tokens=true` and `enable_typos_for_alpha_numerical_tokens=true` by default — the
  numeric-fuzz counterpart of Meilisearch's `disableOnNumbers`, which the critic's corpus had not surfaced and
  which this revision verifies (M2 extension).
- **Engine comparison, stated:** Typesense tolerates 1 typo from 4 characters vs Meilisearch's 5, and 2 typos from
  7 vs 9 — Typesense is more forgiving on exactly the short personal names and accession-number tokens a museum
  catalog is full of; both fuzz numerics by default and both expose an off switch; FTS5 does neither without
  application-level work. This difference is now **knowable and stated**, replacing the draft's "behavioral
  differences unknown" framing (M2).
- **pgvector** (CHANGELOG at master, pinned to newest observed entry 0.8.7, 2026-10-01): HNSW since 0.5.0
  (2023-08-28); `halfvec`/`sparsevec`/`binary_quantize` since 0.7.0 (2024-04-29); iterative index scans since 0.8.0
  (2024-10-30) — the filtered-scan under-return fix; HNSW vacuum corruption fix 0.8.3 (2026-06-17); vacuum/memory
  fixes 0.8.4 (2026-06-30); buffer-overflow fixes 0.8.2 (parallel HNSW build), 0.8.6 (IVFFlat 32-bit), 0.8.7
  (IVFFlat build). Master is a moving branch; every citation carries the tag+date pin (m6).
- **IIIF Image API 3.0** (3.0.0 "Orange Blooms", 2020-06-03): request pattern and `info.json` as in §2 P3; region
  then size then rotation then quality then format, in that order; upscale blocked by default (`^max` to allow,
  non-`^` violations answered 400); conformance levels 0/1/2 declared in `profile`; optional max-dimension
  properties; CORS expected.
- **Mukurtu** (mukurtu.org + support index): GPLv3; WSU Center for Digital Scholarship and Curation;
  communities + cultural protocols + categories gate media access; duplicate/community records for tiered access;
  TK Labels; media content warnings; manual at docs.mukurtu.org. Grade note (m4): this verifies the feature set
  **as documented by the product**, not deployment behavior.
- **RightsStatements.org** (data-model repo; master TTL pinned by enumeration+date): SKOS in Turtle, CC0 1.0;
  exactly twelve statements (list in §2 P4); InC-family, NoC-family, CNE, NKC, UND; OOC absent (removal comment
  only). Canonical site untested (HTTPS 526 ×2 in the research session; not attempted since).

## 5. Conditions, original constraints, and user decisions (O5)

**Original brief constraints, carried intact:** 40,000 catalog records; uneven descriptions; images; changing
rights; restricted cultural material; visitors without expert vocabulary; curators need transparent corrections and
exports; scope is this small product, not unlimited production guarantees.

**Derived conditions:** public-field allowlist *conditioned on the field-sensitivity user decision* (P1/M4);
layered pgvector requirement with the ≥0.8.4 practical pin (P2/m3); captions under their objects' visibility rules
(P3); the serving layer as the per-request rights enforcement point (P3); query-time visibility filtering
everywhere, nightly job demoted to backstop check (P4/M1); overlay-with-provenance enrichment with originals
immutable (P5/m1); enforcement server-side only, never client-side hiding (cross-cutting); local statement
allowlist drawn from the verified twelve (P4/M3); mutable-source pins on every versioned citation (m6).

**User decisions required (evidence-absent by nature — not public):** current system of record and ingest format;
engine choice (P1, now a fully-specified comparison); embedding model and hosting if P2 is pursued; which
restriction classes exist locally and whether source-community protocols apply (P4); whether field-level
sensitivity exists in the catalog (P1/M4); required enforcement latency for rights changes (P4/M1); authority
targets for enrichment (domain-dependent); hosting budget and ops appetite; availability of visitor search logs for
golden-set construction (P6/m2).

**Optional capabilities retained but not required by the plan:** Typesense curation (pin/hide/replace per query)
for curated exhibits; TK Label / content-warning surfacing; rights history via statement-URI re-pointing exports;
model-assisted suggested descriptions under overlay discipline.

## 6. Release / evolution chain investigated (O3)

The pgvector chain is the investigated case, restated with dates: 0.5.0 (2023-08-28) HNSW introduced; 0.7.0
(2024-04-29) memory-reduction types; 0.8.0 (2024-10-30) iterative index scans — the fix whose absence made filtered
vector search silently under-return, the exact failure a rights-restricted catalog hits; 0.8.2 (2026-02-25) /
0.8.6 (2026-07-29) / 0.8.7 (2026-10-01) buffer-overflow fixes; 0.8.3 (2026-06-17) the HNSW vacuum corruption fix;
0.8.4 (2026-06-30) further vacuum/memory repairs. Consequences: version pinning is governance, not preference;
upgrades are release-note-reading events; master-branch sources are pinned by tag+date whenever cited (m6). The
equivalent issue/fix chains for Meilisearch and Typesense were **not** gathered — evidence absent, stated per O3 —
though Typesense's docs being versioned per-release (30.2 observed) shows the same upgrade-re-checks-defaults
discipline applies.

## 7. Discriminating validations — proposed vs executed (O6), applicability stated per item (M6)

**Executed this session:** source retrieval only (research SRC-01…09, critic SRC-C01…C09) plus the reviser's two
verification fetches (SRC-R01 rights-statements.ttl; SRC-R02 Typesense 30.2 search parameters). **No product code
was run; none of the items below has been executed.** Proposals:

- **V1 — golden visitor-query set:** 30–50 staff-written visitor queries, nDCG@10 across FTS5 / Meilisearch /
  Typesense ± vector hybrid. Applicability: always. Carries the m2 staff-bias caveat and the log-derived mitigation
  lead. Discriminates P2's value and the engine choice.
- **V2 — typo torture:** misspell top-100 titles/accession numbers; expected values now concrete for both engines
  (Meilisearch bands 5/9 with first-char double and numeric fuzz on; Typesense 4/7 with `typo_tokens_threshold=1`
  and numeric-token fuzz on); `disableOnAttributes` / `enable_typos_for_numerical_tokens=false` on identifiers.
  Applicability: always.
- **V3 — filtered KNN recall under a restrictive visibility filter (pgvector; exact scan vs indexed, ≥0.8.0
  behavior).** Applicability: **conditional on the Postgres+pgvector stack** (M6). If Meilisearch/Typesense wins
  the engine decision, the SRC-02 chain becomes inapplicable background, not active guidance.
- **V4 — anonymous-role rights probe:** queries for each restricted class must return zero records at API level,
  including via facet counts. Applicability: any stack. The strongest direct check of the P4 replacement.
- **V5 — IIIF conformance smoke:** `info.json`, one region/size request per served image class, upscale-400
  behavior, declared profile level. Applicability: any IIIF path; near-free at level-0.
- **V6 — 200-record reconciliation pilot** with precision at the service's auto-match threshold before any bulk
  commit. Applicability: conditional on pursuing enrichment Approach A, whose mechanics remain unverified (two
  independent fetch failures). Gates the P5 reconciliation path.
- **V7 — alt-text sampling (new, per M7):** sample served images; check whether captions function as adequate alt
  text (length, visual-content coverage) before wiring caption→alt-text. Applicability: conditional on the image
  serving path; converts the demoted P3 sub-claim into a testable enhancement.

## 8. Coverage statement (O1–O6)

- **O1** — unfamiliar tools and materially different approaches beyond the thin plan: Mukurtu's protocol-based
  access model, IIIF Image API 3.0, the RightsStatements vocabulary, pgvector iterative scans, Typesense curation
  and hybrid search, FTS5 external-content mechanics (all verified); OpenRefine reconciliation plus §3's now-named
  and disposed Solr/Elasticsearch/OpenSearch and CollectiveAccess/Omeka S/Islandora (candidate, silence closed per
  M5).
- **O2** — consequential primary-source behavior, governing defaults, units/limits: §4, every value restated with
  its surface and pin.
- **O3** — one issue/fix/release chain investigated with absence stated: the pgvector 0.5.0→0.8.7 chain (§6);
  engine-side equivalents declared not gathered.
- **O4** — every exact P clause compared after reveal, with O4-vocabulary labels: P1 correction + user decision
  (partially already-covered); P2 optional enhancement + correction; P3 correction + already-covered + condition
  (one sub-claim demoted to optional enhancement); P4 rejected (grounds re-scoped); P5 correction with strong
  default (re-graded from rejection); P6 correction + uncertain (framing fixed). §2.
- **O5** — one self-contained coherent final: alternatives, conditions, constraints, disagreements and uncertainty
  retained in prose; no predecessor-ID reference replaces material text; every load-bearing fact restated here with
  evidence IDs in a supporting role only.
- **O6** — discriminating validations with per-item applicability, executed (source retrieval + two verification
  fetches) separated from proposed (V1–V7); no runtime existed for product witnesses and none is claimed (§7).

Evidence resolution: research-stage SRC-01…09 via `../research/sources/index.md`; critic-stage SRC-C01…C09 via
`../critic/source-map.json` with evidence in `../critic/notes/verification-verdicts.md` (the input-map's declared
`critic/sources` root does not exist on disk; the critic's own map points at `notes/` — recorded, not repaired);
reviser fetches SRC-R01/SRC-R02 registered in `verification-notes.md` and to be formalized in this stage's
`source-map.json`. Criticism-by-criticism grounds: `revision-ledger.md` (dispositions) and
`verification-notes.md` (checks); this document supersedes both as the deliverable.
