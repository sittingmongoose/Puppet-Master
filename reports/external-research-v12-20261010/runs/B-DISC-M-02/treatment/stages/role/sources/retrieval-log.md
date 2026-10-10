# Retrieval log 4/4 — failures, budget, non-retrieved leads
Date: 2026-10-10T04:38–04:39Z. Method: web_fetch / web_search only. No local probes run. No code executed.

Successful primary-page retrievals (8 total — assignment budget is "at most eight additional primary pages"):
1. https://www.tarsnap.com/design.html (200, index — principles only)
2. https://www.tarsnap.com/technical.html (200, index of technical pages)
3. https://www.tarsnap.com/crypto.html (200, substantive — see excerpt 3/4)
4. https://www.tarsnap.com/deduplication.html (200, index of dedup pages)
5. https://www.tarsnap.com/deduplication-explanation.html (200, substantive — see excerpt 3/4)
6. https://restic.readthedocs.io/en/latest/100_references.html (200, substantive — see excerpt 1/4)
7. https://borgbackup.readthedocs.io/en/stable/internals.html (200, substantive — see excerpt 2/4)
8. https://borgbackup.readthedocs.io/en/stable/internals/security.html (200, substantive — see excerpt 2/4)

Failed retrievals (both HTTP 404, guessed URLs, no evidence lost — recovered via the References page):
- https://restic.readthedocs.io/en/stable/100_references/01-references.html (404)
- https://restic.readthedocs.io/en/stable/design.html (404)
Also used: one web_search ("restic design documentation repository format encryption chunking") to locate the correct restic URL; search-result snippets were used only for navigation, not as evidence.

Deliberately NOT retrieved (page budget exhausted; listed as unresolved leads, not evidence):
- Tarsnap EuroBSDCon13 slides section 2.1 and tar/multitape/chunkify.c (chunking algorithm exact method)
- Borg data-structures page (key-file format details)
- Any Kopia / Duplicacy / Bup / Tahoe-LAFS / rsync docs; the 2025 chunking-attacks paper itself (only restic's summary of it was read)
- Restic or Borg source code (no implementation files inspected; leads below point at documented locations only)

Corpus note: input-map.json lists "corpus": null — there was no supplied evidence corpus; all substantive input beyond the brief comes from the retrievals above.
