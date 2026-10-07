# Draft — offline museum kiosk content delivery (CONTROL research v2, researcher)

Researcher draft from the user-level brief against the frozen sandbox plan v1, using independent legitimate primary public sources (stable IDs S1–S7, never rebound; exact metadata in `sources/SOURCES.md`, bounded evidence in `sources/S*.md`). This draft contains findings, comparisons, corrections, choices, dispositions, optional leads, uncertainties and validation proposals. It deliberately contains **no** critic verdict and no final proposal: per assignment, a fresh same-family critic and a fresh final reviser consume this draft downstream. No product implementation, no canon/WorkNodes, no accounts/purchases.

## 0. Executed checks vs proposals (mandatory separation)

Executed in this session (evidence recorded):
- Seven primary-source retrievals: S1 ZIM format spec; S2 SQLite FTS5 docs; S3 DOMPurify GitHub releases; S4 WCAG 2.2; S5 rename(2) man page; S6 Python zipfile docs; S7 TUF security model. Retrieval anchors 18:55:54Z–18:58Z 2026-10-07.
- Pinned-version behavior **as documented by the primary pages** was read (S2 unicode61/trigram semantics; S3 3.4.16 release chain; S5 atomic-replace semantics; S6 sanitization behavior). No component was compiled or run locally; code-level behavior is therefore *documented, not locally executed* — flagged wherever it matters.

Everything else below (architecture proposals, test designs) is **proposed** and so labeled.

## 1. Frozen plan recap and gap map

Frozen plan v1: bundle = ZIP of HTML + images + JSON manifest; unzip a new bundle **over the active directory** on arrival; render pages in a web view; search by scanning page text; trust the manifest version to pick the newest package; editors upload files to a central server. Explicitly unspecified: integrity, update atomicity, hostile content, multilingual search, accessibility testing, rollback.

Brief requirements covered by the plan as-is (already-covered dispositions): local web-view rendering; simple manifest-based "newest wins"; central upload path. These remain usable product choices; the corrections below harden, not replace, them.

## 2. Delivery container and update mechanism — corrections from S1, S5, S6

Discovery (executed, S5): `rename(2)` atomically replaces an existing path — "there is no point at which another process attempting to access newpath will find it missing" — and on failure "leaves an instance of newpath in place". `RENAME_EXCHANGE` atomically swaps two paths. On NFS this guarantee does not hold.

Discovery (executed, S6): Python's official warning — "Never extract archives from untrusted sources without prior inspection" (absolute filenames / `..` members); `extract`/`extractall` sanitize, but `zipfile.Path` does **not**; re-extracting the same archive **overwrites files without asking**; ZIP-bomb disk exhaustion is a named pitfall.

Comparison vs frozen plan: "unzip a new bundle over the active directory" fails the brief's power-loss requirement — an in-place, multi-file overwrite is neither atomic nor non-destructive (S6 overwrite note), so a crash mid-update can leave a mixed or half-erased edition, and a traversal member can escape the content tree (S6).

Proposed correction (executed-discovery-based, proposal itself proposed): **extract-then-activate**. Extract each bundle into a fresh, contained, size-limited staging directory (path containment via `abspath` + `commonpath` per S6; per-member and total size caps for ZIP bombs); verify it completely; then activate with a single `rename()` of the directory over the active path (S5), keeping the previous edition directory for instant rollback via `RENAME_EXCHANGE`. Kiosks perform the swap on local disk only (S5 NFS caveat).

Materially different mechanism / alternative (S1): the openZIM **ZIM** container — single-file archive, compressed clusters, directory entries addressable by path or title, whole-archive MD5 checksum field, chunk splitting — is a purpose-built offline delivery format with backward-compatible readers. Proposed comparison: a ZIM-per-edition variant gets whole-file integrity and simpler activation (rename one file) at the cost of adopting libzim and the ZIM toolchain versus the plan's plain HTML/ZIP. This is a genuine alternative worth the critic's attention; the plan's ZIP+manifest is serviceable once hardened by the extract-then-activate pattern.

Source-specific conditions: S5 guarantees are Linux `rename(2)`; portability and the fsync-before-rename durability gap are real concerns (the man page does not cover fsync ordering — uncertainty U2). S1's checksum is MD5 and unauthenticated (integrity, not trust — S7 covers trust). S1 spec versioning is per-major/minor (major 6 minor 3 at retrieval) with no single spec date.

## 3. Integrity, trust, remote editor approval and rollback — correction from S7

Discovery (executed, S7): TUF defends, by name, rollback, fast-forward, indefinite freeze, endless-data (size-limited via expected file sizes), mix-and-match, wrong-software, extraneous-dependencies, malicious-mirror and key-compromise attacks, using roles (root assigns trust), offline vs online key separation, threshold/quorum signing, expiring metadata, and a freshness rule (never accept older-than-seen versions).

Comparison vs frozen plan: "trust the manifest version to pick the newest package" has no signature, no freshness floor and no rollback defense — any writer of the manifest (or the central server) controls kiosks, and a stale or replayed manifest is silently accepted.

Proposed mapping (proposed): editors hold content-signing keys (targets-like role); kiosks hold a pinned trust root; a bundle is activated only if signatures verify, the declared version is strictly newer than the last activated version (freshness floor recorded on the kiosk), sizes match, and metadata has not expired. This supplies the brief's integrity and rollback obligations and structures "editors preview and approve remotely" as a signature-approval workflow rather than file upload alone. A simpler alternative (minisign-style single signature + version monotonicity) loses freeze/mix-and-match defenses — preserved as a lighter product choice.

Source-specific condition: the fetched S7 page does not state the TUF spec version; operational cost of key ceremonies for a museum is real — flagged as a product choice, not a hard requirement.

## 4. Hostile/untrusted contributed content — pinned-component behavior from S3, S6

Discovery (executed, S3): DOMPurify (Cure53) at the latest release 3.4.16 shows a continuous hardening chain in 3.4.7–3.4.16: Shadow-Root IN_PLACE hardening and permanent hook pollution (3.4.7), Trusted Types fixes (3.4.8/3.4.9), DOM clobbering via ownerDocument during IN_PLACE (3.4.13), "possible bypasses when risky tags are allow-listed" and mixed-document edge cases (3.4.14), XML clobbering hardening (3.4.15), raw-text-root IN_PLACE fix (3.4.16). Tags are GPG-verified; the page shows no CVE numbers.

Comparison vs frozen plan: the plan renders HTML pages in a web view with no sanitization step at all, while contributed content is explicitly untrusted in the brief — the highest-severity gap in the plan.

Proposed correction (proposed): sanitize all contributed HTML at import (server side, before signing) **and** at render (defense in depth), render kiosk pages in a restricted web view (no network, no navigation to file:// or external origins), pin the sanitizer with a routine upgrade path (S3 shows several releases per month — pin-and-forget is unsafe).

Issue/fix/regression and release applicability (executed chain, S3): the 3.4.13→3.4.16 sequence shows regressions were found *in* hardening features themselves (hooks, IN_PLACE mode) and fixed in-point releases — applicability rule: a kiosk pinned anywhere below 3.4.16 misses the raw-text-root and XML-clobbering fixes; upgrades must be re-verified because fixes have themselves needed fixes. Also relevant precedent in S2: unicode61's documented diacritics bug (U+1ED9) is explicitly left unfixed for backward compatibility with a documented workaround (`remove_diacritics=2`) — same lesson: pin precisely and read the pinned version's documented caveats.

## 5. Multilingual search — correction from S2

Discovery (executed, S2): FTS5 (SQLite ≥ 3.9.0) gives indexed full-text search (`MATCH`, rank ordering) with four built-in tokenizers. unicode61 (default) removes Latin diacritics by default with the documented U+1ED9 exception (fix: `remove_diacritics=2`); trigram enables substring matching but substrings under 3 characters never match; unicode61 has no word segmentation for space-less scripts (CJK runs become single tokens); `fts5_locale`/custom tokenizers exist for locale-aware segmentation.

Comparison vs frozen plan: "search by scanning page text" is O(all content) per keystroke, has no ranking, and no language awareness; the brief requires multi-language readers.

Proposed correction (proposed): build an FTS5 index at bundle import (title + body per page); use unicode61 `remove_diacritics=2` for Latin-script languages; add the trigram tokenizer for CJK subset matching; accept the <3-character CJK limitation as a documented condition (or evaluate a custom tokenizer — optional lead, O1). Keep scanning-free text search only as a fallback for tiny bundles.

Source-specific conditions: trigram's introducing SQLite version is **not stated on the fetched page** (commonly documented as 3.34.0 — uncertainty U1, verify before pinning); FTS5 must be enabled in the build (`SQLITE_ENABLE_FTS5`).

## 6. Accessible navigation — baseline from S4

Discovery (executed, S4): WCAG 2.2 is a W3C Recommendation (12 December 2024); its new AA criteria are directly kiosk-relevant: 2.4.11 Focus Not Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum, 24×24 CSS px), 3.2.6 Consistent Help, 3.3.7 Redundant Entry, 3.3.8 Accessible Authentication; plus standing AA criteria 2.1.1/2.1.2 (keyboard), 1.3.4 Orientation, 1.4.10 Reflow, 2.2.1 Timing Adjustable, 2.4.2 Page Titled, 4.1.2 Name/Role/Value. SC 4.1.1 Parsing was removed in 2.2.

Comparison vs frozen plan: accessibility testing was unspecified; contributed HTML arrives with unknown accessibility quality, and a public museum kiosk faces general-public obligations.

Proposed baseline (proposed): target WCAG 2.2 AA for the kiosk chrome (navigation, search, settings) and require or systematically repair contributed pages against the same criteria at import; kiosk-specific notes: 2.5.8 target size for touch, 2.2.1 for any timed rotation of exhibits, 2.4.11 because kiosk overlays (update banners) commonly obscure focus.

## 7. Corrections, choices, dispositions, leads, uncertainties, validations

Supported corrections to the frozen plan (each evidence-backed): (C1) never unzip over the active directory — extract-then-rename (S5, S6); (C2) never trust a bare manifest — verify signatures + version monotonicity (S7); (C3) sanitize untrusted HTML before render (S3); (C4) replace page-text scanning with an FTS5 index (S2); (C5) test against WCAG 2.2 AA (S4); (C6) keep a previous edition for instant rollback (S5 RENAME_EXCHANGE, S1 checksum as secondary integrity gate).

Product choices (deliberately open for the reviser): ZIM container vs hardened ZIP+manifest (§2); full TUF vs minisign-style signing (§3); sanitize-at-import only vs import+render double sanitization (§4); per-language search configuration defaults (§5).

Already-covered dispositions: web-view display, "newest manifest wins" ordering (retained, now signature-gated), central editor upload (retained as transport; trust moves to signatures).

Optional leads (O1–O4): custom FTS5 tokenizer/`fts5_locale` for CJK/Thai segmentation (S2); ZIM chunk-splitting for constrained kiosk storage (S1); `RENAME_NOREPLACE` for staging hygiene (S5); porter stemming for English recall (S2).

Justified uncertainties (U1–U4): U1 trigram-introduced version not stated on the fetched S2 page; U2 fsync-before-rename durability ordering not covered by the fetched S5 page; U3 DOMPurify 3.1.x–3.4.6 release pages not fetched (chain below 3.4.7 unverified); U4 TUF spec version not shown on the fetched S7 page. None of these blocks the corrections; each is a bounded verification task for the reviser.

Useful validation proposals (V1–V5): V1 crash-drill — kill power during activation, assert the kiosk serves a complete old-or-new edition (tests C1/C6, S5 semantics); V2 hostile-bundle suite — traversal members (`../`, absolute paths), ZIP bombs, oversized manifests, unsigned/stale/rolled-back manifests (S6, S7); V3 sanitizer regression drill — re-run known bypass classes from the S3 chain against the pinned version on each upgrade; V4 multilingual search suite — diacritic folding (é/è), U+1ED9 class, CJK ≥3-char and <3-char queries (S2); V5 WCAG 2.2 AA audit of kiosk chrome plus sampled contributed pages (S4).

## 8. Boundary

No critic/final verdict is expressed here (downstream same-family critic + final reviser own that). No second Goal, no nested work, no accounts/config/externalrunner changes; the installed integration's Goal state is observed only via the receipts (`native_goal_receipt.json`, later `native_terminal_receipt.json`).
