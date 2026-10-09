# ER11 S12 archive-transfer — critic (treatment, M12 v1)

Case S12 archive-transfer. Block A-M12-A, treatment/critic, method M12 v1 adaptive-evidence-state-branching.
Brief: `cases/S12/brief.md`. Predecessors inspected COMPLETE: `treatment/research/draft.md` (post-reveal final), `treatment/research/discovery.md` (pre-reveal), `treatment/research/revealed-plan.md`, `treatment/research/source-map.json` (S01–S16), and all 11 retained evidence files under `treatment/research/sources/`.
Written: 2026-10-09T19:10:00Z. Deadline: 2026-10-09T19:14:41Z (arm 19:53:15Z).
Role: challenge consequential facts/defaults/conditions, discovery/alternatives, every P disposition, omissions, false corrections/rejections, validation applicability. No candidate repair beyond this critique; no premium evaluator access. Critic demands can be invalid — §7 marks the boundary.

## 0. M12 critic branch ledger (parent–child search states)

Propositions tied to product recommendation, applicability, plan correction, or useful alternative. Transitions recorded after each retrieval. Attention weights: +4 consequential proposition transition, +2 new applicability condition, +2 viable alternative, −2 duplicate. One unresolved countercase branch plus obligation/alternative coverage floor preserved.

| Branch | Proposition (initial) | Retrievals → transitions | End state |
|---|---|---|---|
| C-B1 P1 correction | Requiring BagIt (not bare ZIP) is the right preservation call | RFC 8493 snippet re-confirms 1.0 every-file-in-every-manifest rule (C01) → supported; server-bagged fallback + sanitize placement questioned from pipeline logic, no retrieval needed | SUPPORTED with conditions (M5, M6) |
| C-B2 P2 correction | Dual-hash pin `bagit>=1.9,<2` + explicit flags is safe | LoC README re-confirms SHA256+SHA512 default (C02) → supported; v1.9.0 release notes show fetch.txt file-URL + expandvars behavior changes (C03) → new condition; #176 PyPI-lag note (C04) → new condition | CONDITIONAL (M2) |
| C-B3 P3 correction | Staged pipeline + OCFL + ClamAV gate; Archivematica rightly demoted; MinIO SNSD rightly the low-cost store | ClamAV exit-code search returns secondary corroboration only, no primary man-page locator (C05) → unknown stays open; MinIO official docs say SNSD evaluation-only, no production recommendation, no expansion (C06) → refutes SNSD-as-replication; #1766 confirms Noble failure but as fixable packaging bug with maintainer fix promised (C07) → weakens disqualification strength | SPLIT: pipeline SUPPORTED; SNSD-replication REFUTED-as-worded (M1); Archivematica-demotion QUALIFIED (M3); ClamAV binding UNKNOWN→condition (M4) |
| C-B4 P4 correction | Logged repair loop (never silent edit) | No new retrieval (PREMIS/Event + OpenRefine-ops claims already sourced S13/S14; logic check only) → supported, rights/role uncertainty agreed | SUPPORTED; UNCERTAIN sub-items upheld |
| C-B5 P5 disposition | Original names preserved with storage-safety conditions | Logic check: NFC-collision + undecodable-name placement vs BagIt UTF-8 rule → new condition, no retrieval needed | CONDITIONAL (M6) |
| C-B6 P6 correction | V1–V7 matrix discriminates; three-good = smoke only | Logic check: V2 lock-mechanism unnamed, V7 oracle vague → conditions | SUPPORTED with conditions (M7) |
| C-B7 countercase (PRESERVED UNRESOLVED) | Donor-signed manifests + transparency log could reduce event-chain needs for low-risk collections | No retrieval (out of v1 scope by design); V4 discriminates checksum-fallacy, not signed-manifest sufficiency | UNKNOWN/CONDITIONAL, deliberately unresolved; needs V4b oracle if pursued |
| C-B8 omissions | Auth/donor-identity, rights/PII, resume, report channel | Logic check vs brief ("receiving files from small donors") → one material omission (auth/attestation root), rest minor | CONDITIONAL (O-A material; O-B/C/D minor) |

Attention trace: C-B3 drew three retrievals (largest state change: one refutation M1 + one qualification M3 + one held-open unknown M4, net +4+2+2 after duplicates). C-B2 drew two retrievals (+4 transition on fetch.txt behavior, +2 new pin condition). C-B1/C-B5/C-B6 resolved by logic against already-sourced premises (−2 duplicate risk accepted, no retrieval). C-B7 preserved by rule with zero retrievals. No branch paused before P1–P6 + alternatives + validations coverage floor met.

## 1. Per-P verdicts (O4)

### P1 — "Accept ZIP uploads" → CORRECTION (transport ≠ package): UPHOLD with conditions

The transport/package split is correct and well-sourced (RFC validity semantics C01/S01; Zip-slip/encoding/size guards standard). Bare-ZIP-only rejection as a preservation path is upheld (no standard validation semantics — true).
Conditions: (a) M5 — server-bagged fallback must state attestation absence in the report and enter V4 as a fixture; encrypted-ZIP re-supply rule needs a documented v2 password-handoff note for donor friction. (b) M6 — filename sanitization must be an explicit pre-bag stage (undecodable names cannot be manifested at all), not an implied BagIt-validate byproduct.

### P2 — "Verify SHA-256 checksums" → CORRECTION + ALREADY-COVERED: UPHOLD with conditions

SHA-256 stays, checksum≠provenance correction is correct (PREMIS Object-fixity vs Event-chain semantics S13, re-observed in critic retrieval context). Dual default re-confirmed on current LoC README (C02). MD5-only rejection for new bags upheld.
Conditions (M2): pin must bind to a verified PyPI artifact + hash (GitHub tag ≠ installable truth; #176 documents PyPI lag); v1.9.0 changes fetch.txt file-URL validation and unsafe-path handling, so the fetch.txt deny rule and Zip-slip guard must be tested against the pinned version; V1 oracle must specify file:// vs http(s).

### P3 — "Extract to the archive folder and update a database" → CORRECTION (staged pipeline): UPHOLD in structure, three qualifications

The staged pipeline (quarantine → validate → identify → validate → repair → OCFL commit → derived index) is the right correction; direct-extract is rightly identified as the dangerous clause. OCFL write-order/locking statements match the spec record (S05; no independent re-fetch needed, low drift on dated v1.1).
Qualifications: (a) M1 MATERIAL — MinIO SNSD as "replication" contradicts MinIO's own docs (C06): restate SNSD as S3-API/access shim, name the real durability story. (b) M3 — Archivematica demotion wording overstates a fixable packaging bug (C07) and cites an unsourced ~50GB figure: downgrade "disqualify" to conditional, source or drop 50GB. (c) M4 — ClamAV exit-code/directive claims need primary version-bound locators; V3 fixture set should add Office/PDF parser cases.

### P4 — "Let staff edit metadata after import" → CORRECTION (repair loop): UPHOLD

Never-silent-edit + PREMIS transformation event per repair is correct and proportionate. Targeted-ExifTool scoping and operation-history extraction are sound. The two UNCERTAIN sub-items (repair-approval roles/rights; superseded-metadata retention) are rightly held open as archive decisions, not assumed. No change.

### P5 — "Keep original filenames" → ALREADY-COVERED with CONDITIONS + USER DECISION: UPHOLD with conditions

Preserve-original + stored-sanitized + mapping-table + display-original is the right shape; collision-suffix and reserved-character tables rightly held as user decisions with proposed defaults.
Conditions (M6): NFC normalization can itself collide distinct donor names (NFD vs NFC) — report must flag normalization-collisions distinctly; undecodable-name handling must sit pre-bag with its own PREMIS event.

### P6 — "Test with three good packages" → CORRECTION (discriminating matrix): UPHOLD with conditions

Three-good-as-smoke-preamble plus V1–V7 is the right correction; each validation names an oracle and a discriminated claim. Honest executed-vs-proposed separation (none executed, no sandbox claimed) is upheld as correct conduct.
Conditions (M7): V2 must name the external writer-serialization mechanism (the thing actually under test); V7 "config-only S3 swap" needs an executable oracle (same suite passes on endpoint+credential change alone).

## 2. Material findings

### M1 — SNSD "replication" contradicts MinIO's own guidance; S16 is non-primary (P3)

Research source S16 binds MinIO claims to a third-party skill-summary mirror (`hinvec/security-scanned-skills/.../SKILL.md`), not to min.io or docs.min.io. That is a secondary source carrying primary-weight claims — a source-quality defect regardless of whether the claims happen to be true.
Independent check (C06): official MinIO documentation states Single-Node Single-Drive ("Standalone") is for "early development and evaluation"; "MinIO does not recommend Standalone deployments in production, as the loss of the node or its storage medium results in data loss"; "SNSD deployments do not support storage expansion through adding new server pools." AGPLv3 + S3-API-compat confirmed from the same primary family.
Consequence: draft §P3 "Replicate OCFL root to a second disk/bucket (MinIO SNSD bucket with versioning/object-lock)" and §2 "MinIO SNSD single binary keeps cost flat" mischaracterize a zero-redundancy single-drive deployment as the durability answer. Versioning/object-lock on one drive is not replication.
Required restatement (not a rebuild): SNSD is the S3-API shim/access layer; durability = OCFL root on filesystem + independent second copy (second disk/bucket/host) + re-verify, with SNSD optionally being one copy. If two SNSD instances are used, say so and name the copy/verify job. AGPLv3 trigger condition should be stated plainly (internal use vs distribution; S3-API boundary) rather than left as bare "licensing comfort" — the user-decision framing is right, the content is thin.
Uncertainty: object-lock/versioning behavior on SNSD vs distributed (parity of semantics) not verified here; build should assert the exact MinIO release's SNSD feature matrix.

### M2 — bagit `>=1.9,<2` pin interacts with v1.9.0 behavior changes; bind to PyPI artifact (P2)

Re-confirmed (C02): current LoC README default is SHA256+SHA512; older forks show MD5 default — the evolution claim holds.
New conditions from v1.9.0 release notes (C03): (a) "Allow fetch.txt with file URLs to validate" — the draft's fetch.txt deny/quarantine rule is still safe as a deny rule, but V1's "fetch.txt bag quarantined" oracle must specify URL scheme and whether validation runs with fetching disabled, else a v1.9 validator may auto-fetch file:// URLs mid-validation and the test asserts the wrong thing. (b) "Remove expandvars call in unsafe path check" — unsafe-path handling changed in the pinned line; the Zip-slip guard must be tested against the pinned version, not assumed from spec text.
Pin hygiene (C04): issue #176 documents that PyPI lagged (1.8.1, Feb 2021) while commits accumulated; v1.9.0 exists as a GitHub release (June 2025 page date) but the draft must pin a verified PyPI artifact + content hash for a reproducible build, and record what `>=1.9,<2` resolves to at build time. Exotic-hashlib-flag guard (never pass shake_*/blake2*/sha3_*) is upheld and unaffected.
Uncertainty: whether any 1.9.x post-release touches manifest-line error reporting (V1's "exact manifest line" oracle) — unverified; V1 should assert the oracle against the pinned artifact on first run.

### M3 — Archivematica demotion overstates a transient packaging bug; ~50GB unsourced (P3)

Confirmed (C07): issue #1766 "Three of four installation instructions fail for Ubuntu Noble (24.04)" is real — `archivematica-common : Depends: python3-distutils but it is not installable` — but the maintainer response is "I'll fix this and upload new ones when I have a chance," and sibling #1767 describes Noble VM issues as fixable. This is a point-in-time dependency/packaging failure, not architectural evidence.
The draft's directional concern (Dashboard + Storage Service stack is heavier to operate than a pipeline) is legitimate, and retaining Line B as an alternative is correct. But "disqualify it as the low-cost default" leans on stale-able evidence. Downgrade to conditional: Line B viable where OAIS + access publishing is wanted now AND the OS/branch pair is pinned AND ops capacity exists; revisit after the packaging fix.
Separately, "~50 GB baseline" appears with no source-map locator (no S-entry supports it). Source it or drop it; a quantitative disqualifier without a source is a hygiene defect. The `hack/README` dev-orientation note (S11, first-run DB creation) is fairly used and stands.

### M4 — ClamAV gate semantics lack primary version-bound locators (P3)

The exit 0-clean / 1-infected / 2-error mapping and `--move` quarantine placement are pervasively corroborated but the critic's independent search (C05) returned only secondary corroboration (how-to posts, wrapper code restating "follow clamscan: 0 clean, 1 infected, 2 error") — no clamscan man-page or docs.clamav.net manual section with a version. Research S06 cites docs pages from truncated fetches without an exit-code locator. For a fail-closed quarantine gate, that binding matters: the build must cite the pinned ClamAV version's man page/docs for exit codes, and must distinguish `clamscan` codes from `clamdscan` codes (which have additional outcomes in some versions) since the draft names both `clamd`/`clamscan`.
Same for the archive-limit "family" (`MaxScanSize`/`MaxFileSize`/`MaxRecursion`/`MaxFiles`/`StreamMaxLength`): directive names and defaults are version-sensitive across the 0.x→1.x line. V3 must assert the exact directives/defaults of the pinned version on first run rather than trusting the family list.
V3 scope gap (minor within a material): EICAR + oversize + nested + password-ZIP fixtures are good, but donor archives are Office/PDF-heavy — add at least one OLE2/OOXML/PDF-parser fixture so the gate's parser coverage (the reason ClamAV was chosen) is actually exercised.
Uncertainty: exact `clamd.conf` directive spellings for the to-be-pinned release — deliberately not asserted here.

### M5 — Server-bagged fallback weakens the attestation story it otherwise enforces (P1)

Allowing "a bare directory upload that the server bags immediately ... recorded as server-bagged with operator agent" is operationally reasonable, but a server-created manifest attests only to receipt bytes — donor attestation is absent by construction. The draft records the distinction; the correction is to make it load-bearing: (a) the rejection/acceptance report for server-bagged transfers must state "manifest created by archive operator from received bytes; donor attestation absent" in prose, never a bare flag; (b) V4 (provenance countercase) must include a server-bagged fixture showing the report wording and the weaker event chain. Without (a)+(b) the fallback quietly reintroduces the checksum-as-provenance fallacy one clause later.
Encrypted-ZIP → quarantine + re-supply is correct for v1 (no password collection), but small donors password-protect habitually: retain a documented v2 password-handoff option (out-of-band, single-use, policy-gated) instead of a flat no, so the friction cost is decided, not discovered.

### M6 — Filename sanitization must be a pre-bag stage; NFC can itself collide (P5, touches P1/P3)

BagIt manifest paths are UTF-8: undecodable donor names cannot be manifested at all, so "reject/repair undecodable names with a report row" cannot happen at BagIt-validate — it must happen before bagging (donor client or a server pre-bag stage 2.5) with its own PREMIS event. The P3 pipeline order should name that stage explicitly.
Second, Unicode NFC normalization preserves display but can collide two distinct donor names (NFD vs NFC inputs normalizing identically). The original→stored mapping table absorbs it, but the report must flag normalization-collisions as their own row kind, distinct from case-collisions and duplicate basenames — otherwise staff cannot tell "same name twice" from "Unicode did this." Suffix-scheme default (`name~2.ext`) is fine as a proposal awaiting archive confirmation.

### M7 — V2 tests the archive's lock, not OCFL; V7 oracle is vague (P6/O6)

The draft correctly states OCFL has no locking and writers must "serialize externally and re-verify head." But V2's "concurrent-write guard re-verifies head" is then a test of the archive's own serialization mechanism — which the draft never names. V2 is unexecutable as written. Name the mechanism as a build decision (single-writer queue, filesystem lock, DB advisory lock — pick one) and rewrite V2 to drive two concurrent commits through it and assert exactly one wins + head re-verified + loser retried-or-reported.
V7 "AWS S3 SDK swap asserted config-only" needs the same treatment: oracle = the V1–V3 + portability subset passes with only endpoint/credential/config change, zero code change, on a scratch bucket; record the MinIO→S3 delta (auth, addressing style, object-lock prerequisites) as the measured result.

## 3. Minor findings

- m1 SWORD Line C sourcing: S15's v3 evidence is a 2018 conference deck (Zenodo), not the SWORDv3 spec; "explicit BagIt support in v3" is likely true but needs a spec locator (spec repo / swordv3 site). Mediated (`on-behalf-of`) deposit is implementation-dependent (DSpace supports it; not universal) — scope Line C to "where a SWORD server with mediated deposit already exists."
- m2 Exactly adoption: maintenance-risk flag on the community fork is correct. If the UI is rebuilt rather than adopted, "Exactly pattern" needs a functional spec (bag-at-source + transfer + receipt-validate + report rows), not just a name, or two builders will build different things.
- m3 Dashboard integration: freshclam/clamd expose no native Prometheus endpoints; "same dashboard" needs an exporter or a log-scrape job — mark as integration work with an owner, not config.
- m4 Derived-index discipline: "database is a derived view, rebuilt from OCFL + PREMIS" needs a defined rebuild procedure + a test (extend V2 or add V8: drop index, rebuild, diff) or the discipline is unenforceable.
- m5 Validator routing: veraPDF validates PDF/A, not generic PDF — state the PDF/A-vs-PDF split explicitly (JHOVE PDF module for generic PDF with its known gaps; veraPDF where PDF/A conformance is the collection policy).
- m6 Hash default cost: dual SHA-256+SHA-512 doubles manifest size and hash time (real for large AV). RFC MUST-support-both makes SHA-512-only interoperable; consider SHA-512-only as the default with dual as the option, and record the interop note either way.
- m7 PREMIS vocabulary: "accession" as an event type should be bound to the PREMIS 3 event-type vocabulary + a local-extension point; accession is more OAIS-function than PREMIS-event in some readings.
- m8 B6 countercase scope: V4 as designed discriminates the checksum-fallacy (good); it does not test signed-manifest sufficiency. If the countercase is ever pursued, it needs its own V4b oracle (threat model + what the transparency log proves) — correctly out of v1.

## 4. Omissions

- O-A donor identity / upload auth (MATERIAL): the brief's provenance story starts with "who supplied these bytes," but Line A never says whether uploads are authenticated (donor accounts, magic links) or mediated-only. Without an authenticated donor identity, "donor attestation" in the event chain is vacuous. Require a build decision: auth model + attestation record shape + anonymous-upload policy (refuse vs mediated-only). SWORD on-behalf-of covers Line C only.
- O-B privacy/PII + rights (minor, near-material): donor files may contain PII; quarantine holds live malware. Retention/deletion policy for quarantine, access controls on infected holdings, and use of the PREMIS Rights entity are unaddressed. Flag as open decisions; the brief's "regional historical archive" context makes rights more than theoretical.
- O-C large-transfer resume (minor): multipart upload is named for large AV but resume/checkpoint semantics on a low-cost VM are not. Add interrupted-upload resume to deployment notes.
- O-D report channel (minor): staff-legible reports are specified as content but not as channel (dashboard? email? donor-visible copy?). Name the channel decision.

## 5. False-correction / false-rejection audit

Checked every REJECTED/optional/user-decision disposition for overreach. No false rejection found:

| Disposition | Verdict |
|---|---|
| Bare-ZIP-only rejected as preservation path (kept as migration note) | CORRECT — no standard validation semantics |
| MD5-only rejected for new bags (read-only legacy kept) | CORRECT — matches RFC SHOULD-default-SHA-512 + evolution record |
| Siegfried-as-validator rejected | CORRECT — NLW case + DPC identify/validate rule support it |
| Silent metadata edits rejected | CORRECT — repair loop with PREMIS events is the proportionate replacement |
| Database-as-truth rejected | CORRECT in direction; needs m4 rebuild test to be enforceable |
| Checksum-as-provenance rejected | CORRECT — PREMIS fixity-vs-event semantics support it |
| fetch.txt remote-file bags denied-or-quarantined | CORRECT as default; needs M2 scheme/validator-version note |
| Archivematica as default (demoted, retained as Line B) | DIRECTION RIGHT, STRENGTH OVERSTATED — see M3 |
| MinIO alternatives (SeaweedFS/Garage/RustFS) deferred | CORRECT to defer; AGPLv3 note needs M1's trigger-condition sentence |

## 6. Validation applicability (V1–V7 + smoke)

| ID | Applicable? | Note |
|---|---|---|
| Smoke (P6 three-good) | YES | Rightly demoted to preamble; keep the under-an-hour acceptance bar |
| V1 BagIt interop/negatives | YES, tighten | Add M2 scheme note + pinned-artifact oracle assertion |
| V2 OCFL round-trip | YES, repair | Name the lock mechanism first (M7), then executable |
| V3 Malware gate | YES, extend | Add primary version-bound locators + Office/PDF fixtures (M4) |
| V4 Provenance countercase | YES, extend | Add server-bagged fixture + report-wording assertion (M5); keeps C-B7 open until run |
| V5 Identify/validate split | YES | Fixture set (TIFF-version, PPT/XLS, BWF) is well-chosen; add m5 PDF/A split |
| V6 Repair audit | YES | Ops-log → re-apply → re-validate with PREMIS presence oracle is discriminating |
| V7 Portability | YES, tighten | Define config-only oracle (M7); gate on deployment choice |

First-milestone proposal (V1–V4 first) is sensible: it covers the preservation-critical claims before validator routing and deployment. No executed work is claimed and none should be at this stage.

## 7. Critic-demand validity (what this critique does NOT demand)

- No executed validations: no runtime is available at critic stage; demanding runs would be invalid. All V-oracles above are framed as build-time assertions.
- No full SWORD-vs-custom or MinIO-vs-alternatives adjudication: correctly deferred to build decidability (server-exists? license-comfort?) — the critique asks only for sourced, correctly-worded conditionals.
- No B6 resolution: the signed-manifest countercase is preserved unresolved by method rule; V4b is scoped, not demanded.
- No rewording of correct dispositions: P1–P6 verdicts are all UPHOLD (three with qualifications); nothing here overturns the Line A recommendation or the retained-alternatives set.

## 8. Uncertainty preserved

1. C-B7 countercase open (signed manifests + transparency log for low-risk collections).
2. Repair-approval roles/rights + superseded-metadata retention (archive input).
3. Collision-suffix / reserved-character tables (archive confirms defaults).
4. Upload auth model + attestation shape (O-A — the one material open decision this critique adds).
5. SWORD-vs-custom, MinIO license comfort, AV-policy depth (as in draft, plus M1 restatement).
6. ClamAV pinned-version directive spellings; bagit pinned-artifact manifest-line oracle text; MinIO SNSD feature parity — all correctly left to build-time assertion, not guessed here.
7. Usage/billing: unobserved for all critic sources (anonymous public reads); null throughout.

## 9. Source notes

Critic evidence: `source-map.json` C01–C07 (RFC 8493 snippet; LoC README default; bagit-python v1.9.0 release; #176 PyPI lag; ClamAV secondary-only honesty note; MinIO official SNSD docs; Archivematica #1766). Bounded excerpts in `sources/` with navigable `sources/index.md`. IDs immutable; mutable pages bound by URL + access timestamp + locator; no silent rebind. Predecessor IDs S01–S16 cited by reference only, never rebound. Usage/billing null throughout.
