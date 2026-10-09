# Research-stage revision log

## Fresh full critic -> reviser changes

The independent critic pass is preserved in critique.md. Its required corrections were applied to draft.md:

1. Added an optional tenant-authored batch reference/handoff state and timestamp, visible only within that tenant by default; cross-tenant batch movement remains an explicit P2 scope question. Recipes, customers, sales, ingredients, and production quantity are not required fields.
2. Distinguished resource occupancy from production duration and billing; added a decision about who uses/owns setup and cleanup intervals and whether they are billed.
3. Kept Food Corridor as a conditional demo lead rather than a selection, with unverified Community/Daily View privacy, per-block signoff, tenant export, currency, payment fee and annual terms visible as gates.
4. Preserved the distinct check-in/out versus cleaning-signoff semantics and the current open P5/P6 decisions.
5. Repaired source-map timestamp precision without changing discovery.md: initial per-request times are marked unknown; exact system-clock-bounded re-open windows and operations are retained in sources/source-access-log.json. Source IDs and URLs were not rebound.
6. Resolved the buffer regression fix and merge commits to full SHA through the public GitHub API and recorded the commit URLs and request window in source-map.json/source-access-log.json.
7. Kept all product, witness, accessibility, export, booking-conflict, installation, and human validations labeled proposed; no witness or product test ran.

## Frozen and final checksums

- discovery.md (frozen before plan reveal): SHA-256 061e11f8d26ba540d6b91932b1afee960d45ebecb5e31e948faa2dc237aadfaa
- critique.md after source-unit correction: SHA-256 aba4e2ea18af7b05fb9f648ab042bc97b9284019db40b21b536d8e7a4933714d
- draft.md after revision: SHA-256 8691fb895b1fdc05084bde14faa6ea28c256677b438bae14d7744b114fa8260a
- source-map.json after timestamp/commit corrections: SHA-256 8a662cca59816e20676a794612fc81fc9df2e620fbc730116bdf38326c16b6f0
- sources/source-access-log.json: SHA-256 712ff64964c1468c2e5ceb0196c4e95bda6f1037bc6db2e811df402718c82b59

8. After criticism, a pinned v7.0.0 test-source check showed the regression fixture passes the literal 3600 to WithBufferTime but does not establish the unit. The final draft states the raw value and marks units unknown; discovery.md remains unchanged after reveal. Added source ID LB-05 with its access window.
