# Draft — Offline museum kiosk content delivery (ER10 I-ANCHOR-GLM, treatment research-v2)

Researcher draft from the user-level brief and the frozen sandbox plan v1 only. Public primary sources are cited by stable ID (`SRC-nn`, exact URL/version/retrieval data in `sources/index.json`; executed checks in `sources/executed-checks.json`). Executed checks are marked **[executed]**; everything else is a proposal. This draft does not include the critic-finalizer's verdict; it is the input to that role.

## 0. Frozen plan v1 (baseline being critiqued)

Package content as a ZIP (HTML pages, images, JSON manifest); unzip a new bundle over the active directory whenever it arrives; display pages in a web view; search by scanning page text; trust the manifest version to pick the newest package; editors upload files to a central server. Explicitly unspecified: integrity, update atomicity, hostile content, multilingual search, accessibility testing, rollback.

## 1. Findings

### 1.1 Unzip-over-active-directory is the highest-risk element of plan v1 (SRC-01, CHK-1)

Plan v1's "unzip a new bundle over the active directory" is the exact pattern Snyk disclosed as Zip Slip (2018-06-05): an archive entry named `../../…` is joined onto the destination directory without validating that the canonicalized path stays inside it (SRC-01). The disclosure affected thousands of projects across at least ten language ecosystems, and the page attributes spread to copy-pasted vulnerable extraction snippets. Release applicability to this case: any extraction library or hand-rolled updater in plan v1 inherits the class of bug unless extraction canonicalizes and rejects every entry path that escapes the bundle root.

**[executed] CHK-1 (pinned behavior, CPython 3.14.4 `zipfile`)**: extracting an archive containing `../../evil_outside.txt` via `extractall` did not escape: the file landed inside the extraction directory with the `..` components stripped (`sources/executed-checks.json`). So the installed standard library sanitizes by stripping traversal components rather than raising; that is protective for this one library/version, but it is sanitization, not rejection — a bundle that *intends* an entry named `../shared/x.png` silently changes shape. The plan-level conclusion stands: never concatenate entry names with the target directory yourself; use a vetted extractor's safe path policy and verify the resulting tree against the manifest hash.

### 1.2 Trusting the manifest version number is not integrity (SRC-04, SRC-05)

Plan v1 "trust[s] the manifest version to pick the newest package" — a plain integer with no signature, expiry, or monotonic state. TUF exists precisely because such schemes fall to a standard attack taxonomy: arbitrary installation, endless data, rollback (serving something older than what the client already saw), fast-forward (inflated version numbers), indefinite freeze (replaying stale metadata), mix-and-match (combining metadata that never coexisted), key compromise below threshold, and wrong-software installation (SRC-04, spec v1.0.36, 2026-08-05). TUF's roles map cleanly onto the kiosk: root (pinned trust anchor in kiosk firmware, offline key), targets (per-file hashes/sizes — this is the missing "integrity" obligation), snapshot (consistent bundle metadata), timestamp (short-freshness so a compromised mirror cannot serve stale bundles forever). Uptane, the automotive derivative, states the operating philosophy appropriate to unsupervised public devices: assume compromise, minimize damage, "assure rapid recovery" (SRC-05).

### 1.3 Power-loss during update needs slot-style atomicity, not in-place overwrites (SRC-06, SRC-07, SRC-08)

Plan v1 overwrites the serving directory in place, so a mid-update power cut leaves a half-written active bundle — the brief explicitly forbids this ("keep serving a coherent previous edition"). The two mature public mechanisms:

- **A/B slots** (Chrome OS update_engine, Android): the running system reads slot A while the new bundle is written to slot B; slot B is re-read, hashed, and compared against the update metadata before any switch; the updater checkpoints its progress so an interrupted update "can continue from the point it missed"; a failed update leaves "the user … on the old version", and a failed boot rolls back to the old slot (SRC-06). Android states the same fault-resistance property and notes Virtual A/B (copy-on-write) replaced legacy A/B in Android 10 (SRC-07).
- **Atomic symlink flip over versioned trees** (OSTree model): content-addressed object store, hardlink checkouts that are immutable, "transactional upgrades and rollback", multiple parallel deployable trees, switch by repointing a single symlink/bootloader entry (SRC-08). OSTree is the right scale analogue for kiosk content because content files are immutable and cheap to hardlink, and the "bootloader decision" degenerates to a symlink or a pointer file.

For a kiosk (single-purpose, disk-cheap, no partition table constraints), the OSTree-shaped mechanism generalizes to content: keep N fully extracted, hash-verified editions in `editions/<hash>/`, and an atomic `current` symlink flip as the only mutation of serving state. Power loss at any instant leaves `current` pointing at a complete prior edition.

### 1.4 "Search by scanning page text" fails the multilingual obligation (SRC-02, SRC-03, CHK-2)

Linear page-text scanning has no tokenization for scripts without spaces (CJK), no diacritic folding (a visitor typing `cezanne` must miss `Cézanne`), and O(corpus) latency per query. SQLite FTS5 is the standard embedded answer and ships four built-in tokenizers: unicode61 (default; case-insensitive; optional `remove_diacritics`), ascii, porter (stemming wrapper), and trigram (substring matching, 3+ chars) (SRC-02). The trigram tokenizer shipped in the 3.34.0 series ("Enhanced FTS5 to support trigram indexes", 2020-12-01, SRC-03).

**[executed] CHK-2 (pinned behavior, SQLite 3.46.1 via python3 sqlite3)** (`sources/executed-checks.json`):
- trigram tokenizer present; query `美术馆` matched sample text `Musée Rodin 美术馆 Cézanne` — CJK substring search works without word segmentation;
- `unicode61 remove_diacritics 2` present; query `cezanne` matched `Musée Cézanne`;
- the ICU tokenizer is **not** compiled into this build (`no such: tokenizer: icu`) — an environment condition, not a spec gap: ICU is not one of FTS5's documented built-ins (SRC-02), so per-language stems/CJK word segmentation would need a compiled-in custom tokenizer;
- probe hygiene recorded honestly: two of my substring probes were invalid (`éez`, `sanne` are not substrings of the sample) and were replaced by a valid probe (`anne` matched). These corrections are in the evidence file, not hidden.

Note for the critic: unicode61 `remove_diacritics 1` has a documented bug with single codepoints encoding multiple diacritics (e.g., U+1ED9), corrected in mode 2 (SRC-02) — a concrete pinned-version behavior reason to pin `remove_diacritics 2` in any schema we ship.

### 1.5 Untrusted contributed content: sanitize nothing you can sandbox instead (SRC-09)

Contributed HTML is hostile by the brief. Two materially different postures: (a) transform content on ingest (e.g., DOMPurify, Cure53, v3.4.16 at retrieval: "DOM-only … XSS sanitizer for HTML, MathML and SVG", "works with a secure default", CI + fuzzing; but DOMPurify itself warns that post-sanitization modification "can easily void the effects of sanitization", and server-side use requires a current jsdom — happy-dom is "not considered safe at this point") (SRC-09); or (b) serve contributed markup unmodified but confine the renderer: no `file://` origin, loopback HTTP(S) only, strict CSP, no privileged bindings in the web view, so even a successful XSS has nothing to reach. Posture (b) keeps editorial fidelity (museums care about layout) and puts one audited boundary in code instead of a per-bundle sanitization gamble; posture (a) is still wanted as defense-in-depth for editor previews. The two compose; they are not exclusive.

### 1.6 Accessibility must be a tested gate, not an aspiration (SRC-10)

The brief demands accessible navigation. WCAG 2.2 (W3C Recommendation, 2024-12-12) gives concrete, testable criteria for the kiosk surface: 1.4.3/1.4.11 contrast (4.5:1 text, 3:1 UI), 1.4.12 text spacing, 2.4.7 focus visible, 2.5.1 single-pointer alternatives to path/multipoint gestures, 2.5.8 minimum 24×24 px targets (2.5.5 44×44 at AAA), 2.5.7 dragging alternatives, and 1.3.4 orientation — the last is pointed for kiosks, whose fixed orientation must be justified as essential or made adaptive (SRC-10). Plan v1 does not mention any of this.

### 1.7 Web view component state of the world (SRC-11)

WebKitGTK's current stable series is 2.54.x (LATEST-STABLE-2.54.1, 2026-10-02, signed tarballs) (SRC-11). This is the pinned component baseline a Linux kiosk should track for security releases; the web view choice per OS (WebKitGTK on Linux, WKWebView/WebView2 elsewhere) is an implementation decision outside this brief's fixed facts and is recorded as a product choice below.

## 2. Proposed changes (complete, against plan v1)

1. **Bundle format** (keep ZIP, add manifest discipline): ZIP of `pages/*.html`, `assets/*`, `manifest.json`. Manifest carries `edition` (monotonic integer), `content_hash` (per-file SHA-256 + whole-tree hash), `min_reader_version`, and an Ed25519 signature over the canonical manifest, produced by the museum's offline signing key. Verification: root trust anchor ships in the reader; targets-style per-file hashes checked before activation (SRC-04 roles targets/snapshot; per-file hashing is the kiosk-scale subset).
2. **Atomic update protocol** (replaces unzip-over-active): extract into `editions/<edition-hash>/` (fresh directory, safe extractor), verify every file hash + manifest signature, fsync tree, then atomically replace the `current` symlink (`symlink+rename`). Never write inside a served edition; never delete the previous edition until the new one has served successfully for a grace window. This is the OSTree hardlink-tree/atomic-switch model at content scale (SRC-08) with A/B-style "keep the old slot as fallback" semantics (SRC-06, SRC-07).
3. **Rollback**: `current.previous` pointer retained; on reader-start self-check failure (tree hash mismatch, missing manifest) the reader serves `previous` and logs. Interrupted extractions write only to unreferenced directories and are GC'd on boot — the checkpoint-and-resume idea from update_engine (SRC-06) reduced to "extractions are idempotent and garbage-collected".
4. **Update metadata freshness** (kiosk-scale TUF): signed manifest with `expires` (refuse bundles past expiry — indefinite-freeze defense), refusal to go below the highest installed `edition` (rollback defense), and a persisted `last_seen_edition` (SRC-04). Full TUF is the upgrade path if kiosks become network-exposed; the minimal signed+monotonic+expiring subset defeats the attacks relevant to a USB/courier-fed kiosk.
5. **Editor flow** (keep central server, add approval gate): editors upload to a staging channel; a curator previews the *extracted* bundle in a sandboxed preview reader; approval triggers signature and release to the kiosk feed. Kiosks poll the feed opportunistically (dial-up-style sync remains valid offline).
6. **Search**: build a SQLite FTS5 index per edition at activation (`tokenize="unicode61 remove_diacritics 2"` for Latin-script fields plus a trigram column for CJK/substring search) (SRC-02, SRC-03, CHK-2). Language of each page comes from the manifest (`lang` per page); the search UI filters or boosts by the active UI language. Replaces linear scanning; indexes are per-edition so activation is atomic (index inside `editions/<hash>/`).
7. **Untrusted rendering**: reader serves editions from `http://127.0.0.1:<port>/editions/<hash>/` (loopback only), strict CSP (`default-src 'self'` within the edition origin, no `file://`, no remote fetch), no scripting bridges exposed to content, links to outside pages disabled by museum policy. Optional DOMPurify pass on ingest as defense-in-depth for the preview surface only (SRC-09).
8. **Accessibility gate**: WCAG 2.2 AA criteria checked in CI on reader chrome and on a fixture set of sample pages: contrast (1.4.3/1.4.11), target sizes (2.5.8 ≥24px chrome minimum; recommend 44px editorial buttons), keyboard/focus paths (2.4.7), gesture alternatives (2.5.1/2.5.7), orientation policy (1.3.4) (SRC-10). Reader ships a large-text/high-contrast mode.

## 3. Materially different mechanisms considered

| Area | Plan v1 | Alternative A (proposed) | Alternative B (considered, not chosen as base) |
|---|---|---|---|
| Update atomicity | unzip over active dir | versioned trees + atomic symlink flip (SRC-08) | true A/B dual slots with boot-marker (SRC-06, SRC-07) — stronger for OS images, heavier than content needs (partition management, boot plumbing) |
| Integrity | manifest version number | signed manifest + per-file hashes + monotonic + expiry (TUF subset, SRC-04) | full TUF role metadata (root/targets/snapshot/timestamp) — correct at fleet scale, operationally heavy for courier-fed kiosks |
| Hostile content | unspecified | loopback origin + CSP + no privileged bridges | ingest-time sanitization only (DOMPurify, SRC-09) — fidelity loss and the sanitizer itself becomes the trusted component |
| Search | scan page text | FTS5 unicode61+trigram per edition (SRC-02, SRC-03) | full-text engine with ICU/custom tokenizers (better linguistics; compile-time and footprint cost, ICU absent in pinned build, CHK-2) |
| Editor approval | upload to central server | staging → sandboxed preview → sign → release | full TUF delegated targets per museum department — real option at multi-museum scale |

## 4. Pertinent issue/fix/regression chain and release applicability

- **Zip Slip (SRC-01)** — disclosure 2018-06-05; vulnerable extraction pattern; fix = canonicalize-and-contain every entry path; fixes landed across the enumerated libraries (unzipper, adm-zip, zt-zip, zip4j, DotNetZip, SharpCompress, rubyzip, quazip, …). Release applicability: plan v1's extraction step is exactly the vulnerable shape if written by hand; any chosen ZIP library must be one that fixed and *kept regression tests* for traversal entries, and the updater must add its own traversal + escape test as a regression gate (my CHK-1 gives the test shape).
- **FTS5 `remove_diacritics` 1→2 (SRC-02)** — documented incorrect behavior of mode 1 on composed multi-diacritic codepoints, corrected by mode 2; applicability: pin mode 2 in the shipped schema and add a regression query for U+1ED9-style text.
- **Legacy A/B → Virtual A/B (SRC-07)** — Android replaced legacy A/B with copy-on-write Virtual A/B in Android 10; applicability: precedent that slot mechanisms evolve toward cheaper storage models — supports the "versioned trees + hardlinks/symlink" choice over partition-style slots for content.

## 5. Component/code behavior at pinned versions (consolidated)

- **CPython 3.14.4 `zipfile`** **[executed, CHK-1]**: `extractall` strips `../` traversal components into the destination instead of escaping or raising — protective but silent reshaping; see §1.1 and `sources/executed-checks.json`.
- **SQLite 3.46.1 FTS5** **[executed, CHK-2]**: trigram tokenizer present (CJK query `美术馆` matched; true-substring queries match; invalid probes honestly recorded); `unicode61 remove_diacritics 2` folds `cezanne`→`Cézanne`; ICU tokenizer absent from this build — see §1.4.
- **DOMPurify v3.4.16** (SRC-09): secure-by-default HTML/SVG/MathML sanitizer; warns post-sanitization DOM edits void it; server-side requires current jsdom (happy-dom unsafe).
- **WebKitGTK 2.54.1** (SRC-11, 2026-10-02): current stable series a Linux kiosk reader should track for security releases.
- Behavior claims are pinned to these exact versions; other versions/builds may differ (see §8 conditions).

## 6. Comparison against the frozen plan (per element)

- ZIP+manifest: **kept, corrected** (signature + hashes + expiry + monotonic edition; §2.1, §2.4).
- Unzip over active directory: **rejected** (SRC-01, §1.1) → atomic extract-verify-flip (§2.2–2.3).
- Web view display: **kept**, confined to loopback origin with CSP (§2.7); pinned component baseline WebKitGTK 2.54.x (SRC-11).
- Scan-page-text search: **rejected** (multilingual failure, §1.4) → FTS5 per-edition index (§2.6).
- Manifest-version trust: **rejected** (SRC-04 attack taxonomy) → signed, expiring, monotonic metadata (§2.4).
- Editors upload to central server: **kept, corrected** with preview/approval/sign gate (§2.5).
- Unspecified obligations (integrity, atomicity, hostile content, multilingual search, accessibility, rollback): each covered in §1.1–1.6 and §2.

## 7. Optional opportunities (not required by the brief)

Delta/sync only of changed assets between editions (update_engine's delta-then-full fallback is the precedent, SRC-06); per-language keyboard layouts on the search screen; analytics-free usage counters for curators; multi-kiosk fleet manifest (one signed feed, per-device pinning); offline accessibility profiles (high-contrast/large-text presets saved per device).

## 8. Uncertainties (justified)

- Uptane's Director/Image repository split and partial-verification rules were not fetched this arm (homepage only, SRC-05); the claim here is limited to its stated compromise-resilience philosophy.
- OSTree's per-deployment symlink/boot-swap mechanics are described in its Deployments docs, which were not fetched (SRC-08); the atomic-switch design in §2.2 is the OSTree *model* applied at content scale, not a citation of its internals.
- The trigram feature appears in SQLite's changelog as "trigram indexes" (SRC-03) while the FTS5 page documents a trigram tokenizer (SRC-02); CHK-2 confirms the tokenizer exists and works on 3.46.1, but the exact version where `remove_diacritics` option 2 landed was not pinned this arm.
- DOMPurify v3.4.16's release date was not captured (README shows the tag only, SRC-09).
- The reader's web-view choice per OS and the central server technology are product choices the brief leaves open; nothing here depends on them.
- Usage/billing for this research arm is unknown (no observable interface); see `timings.json`.

## 9. Source-specific conditions

- SRC-04 spec text is CC-class living-standard material; quote-minimal use here. WCAG 2.2 (SRC-10) is normative for conformance claims only when its scoping rules are followed; AA is the proposed target, and 1.3.4's "essential" exemption needs the museum's fixed-hardware justification on record.
- SRC-06/SRC-07 describe OS-partition updates; they are design analogies for content slots, not directly applicable mechanics (no kernel/bootloader on the content path).
- SRC-02/CHK-2: tokenizer behavior is version- and build-dependent (ICU absent in the pinned build); any schema must declare its tokenizer options explicitly and be tested on the shipping build.
- SRC-01: the affected-library list is the disclosure page's, as of retrieval; current versions of named libraries are patched, which is why the regression test (not library avoidance) is the durable control.
- All retrievals were made 2026-10-07 within the window recorded in `sources/index.json`; page content changes after that window are out of scope for this arm.

## 10. Proposed validation

1. **Power-cut update test [executed-shaped, to run on hardware]**: scripted harness kills power (or SIGKILLs the reader) at each extraction/flip step under N editions; assertion: `current` always resolves to a hash-verified complete edition; reader serves it after reboot; log shows no partial-tree references.
2. **Traversal regression test**: feed the updater archives containing `../` entries, absolute paths, symlinked entries, and Unicode-normalization collisions; assert extraction rejects or safely contains every case (extends CHK-1's finding that stripping ≠ rejection).
3. **Metadata attack tests**: replayed old bundle (must fail monotonic check), expired manifest (must fail), wrong-signature bundle, bundle with altered file after signing (per-file hash must catch), inflated edition number without key (signature must fail).
4. **Search relevance matrix [partly executed]**: per supported language, fixed query set (Latin diacritic-folded, CJK substring) against fixture editions; CHK-2's probes are the seed; add latency budget assertion (indexed lookup < 50 ms on kiosk-class disk).
5. **Accessibility audit**: axe-core + manual WCAG 2.2 AA checklist on reader chrome and fixture pages (SRC-10), including 24px/44px target measurement and orientation policy review.
6. **Renderer confinement test**: attempt `file://` fetches, cross-origin requests, and bridge access from a hostile fixture page served in the reader; all must fail; verify CSP headers on the loopback origin.

## 11. Executed checks vs. proposals (summary)

**Executed this arm**: source retrieval and evidence capture (`sources/index.json`); CHK-1 CPython 3.14.4 zipfile traversal behavior; CHK-2 SQLite 3.46.1 FTS5 tokenizer behavior including ICU absence (both isolated, resource-bounded, no sockets/secrets, cleaned up; `sources/executed-checks.json`). **Everything else is a proposal** requiring the validation of §10 before any product claim.
