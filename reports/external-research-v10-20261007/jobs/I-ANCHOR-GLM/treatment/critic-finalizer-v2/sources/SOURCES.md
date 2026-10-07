# SOURCES — ER10 I-ANCHOR-GLM treatment critic-finalizer v2 (2026-10-07)

One entry per source ID used in critique.md and final.md. Predecessor evidence files (frozen, unmodified): `../../research-v2/sources/index.json` (full keyEvidence per ID; original fetch window 2026-10-07T18:51:01Z–18:58:10Z; evidenceSavedAtUtc 2026-10-07T18:59:15.120Z), `../../research-v2/sources/retrieval-stamps.json` (HEAD re-verification 200s, 19:06:34–19:06:37Z), `../../research-v2/sources/executed-checks.json` (CHK-1/CHK-2). Quotations bounded to fair quotation for research evidence; full pages were not copied.

- **SRC-01** | Snyk Security Research: Zip Slip vulnerability | https://github.com/snyk/zip-slip-vulnerability | repo as of retrieval; disclosure 2018-06-05 per page | batch 1; HEAD 200 @ 2026-10-07T19:06:34.232Z
- **SRC-02** | SQLite FTS5 documentation | https://www.sqlite.org/fts5.html | docs current at retrieval | batch 1; HEAD 200 @ 19:06:34.803Z
- **SRC-03** | SQLite 3.34.0 release log | https://sqlite.org/releaselog/3_34_0.html | SQLite 3.34.0, released 2020-12-01 | batch 2; HEAD 200 @ 19:06:35.092Z
- **SRC-04** | The Update Framework (TUF) specification + homepage | https://raw.githubusercontent.com/theupdateframework/specification/master/tuf-spec.md ; https://theupdateframework.io/ | spec v1.0.36, revision 2026-08-05, Living Standard; homepage CC BY 4.0, CNCF graduated | batches 1+2; HEAD 200/200 @ 19:06:35.308Z
- **SRC-05** | Uptane (uptane.org) | https://uptane.org/ | homepage as of retrieval; Linux Foundation JDF | batch 2; HEAD 200 @ 19:06:35.584Z (Standard not fetched — uncertainty preserved)
- **SRC-06** | Chromium OS update_engine README (A/B updates) | https://chromium.googlesource.com/aosp/platform/system/update_engine/+/HEAD/README.md | HEAD at retrieval | batch 3; HEAD 200 @ 19:06:35.711Z
- **SRC-07** | Android A/B (seamless) system updates | https://source.android.com/docs/core/ota/ab | docs current at retrieval; Virtual A/B since Android 10 | batch 3; HEAD 200 @ 19:06:36.098Z
- **SRC-08** | OSTree (libostree) documentation | https://ostreedev.github.io/ostree/ | docs current at retrieval | batch 2; HEAD 200 @ 19:06:36.419Z (Deployments docs not fetched — uncertainty preserved)
- **SRC-09** | DOMPurify (Cure53) | https://github.com/cure53/DOMPurify | v3.4.16 shown on README at retrieval; release date not captured; Apache-2.0/MPL-2.0 | batch 2; HEAD 200 @ 19:06:36.557Z
- **SRC-10** | WCAG 2.2 (W3C Recommendation) | https://www.w3.org/TR/WCAG22/ | W3C Recommendation, published 2024-12-12; 4.1.1 Parsing removed | batch 1; HEAD 200 @ 19:06:36.998Z
- **SRC-11** | WebKitGTK release archive | https://webkitgtk.org/releases/ | LATEST-STABLE-2.54.1 dated 2026-10-02; plain directory index | batch 2; HEAD 200 @ 19:06:37.112Z
- **CHK-1** | Executed check (predecessor) | locator: ../../research-v2/sources/executed-checks.json#CHK-1 | CPython 3.14.4 zipfile `extractall` traversal behavior | atUtc 2026-10-07T18:57:23.884Z; isolated /tmp, no sockets/secrets, cleaned up
- **CHK-2** | Executed check (predecessor) | locator: ../../research-v2/sources/executed-checks.json#CHK-2 | SQLite 3.46.1 FTS5 tokenizers (trigram, unicode61 remove_diacritics 2, ICU absence) with honest invalid-probe corrections | atUtc 2026-10-07T18:57:23.888Z (+18:57:50.495Z, 18:58:10.225Z); in-memory DB
- **CF-01** | Executed check (this stage, stage-owned ID, never rebound) | locator: ../critique.md §"CF-01, CF-02" | CPython 3.14.4 zipfile traversal re-run: `../../evil_cf.txt` contained as `evil_cf.txt`, no escape | atUtc 2026-10-07T19:26:01.523Z; isolated /tmp, no sockets/secrets, cleaned up
- **CF-02** | Executed check (this stage, stage-owned ID, never rebound) | locator: ../critique.md §"CF-01, CF-02" | SQLite 3.46.1 FTS5 re-run incl. new finding: trigram `美术馆` matches, 2-char `美术` returns no match; `anne`/`zanne` match; `cezanne`→`Cézanne` via remove_diacritics 2; ICU absent (`no such tokenizer: icu`) | atUtc 2026-10-07T19:26:01.523Z; in-memory DB

All retrievals are bounded lawful public-source evidence; page content after the stated windows is out of scope for this arm.
