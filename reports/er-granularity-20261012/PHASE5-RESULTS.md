# Phase 5 — brief-only discovery pilot (2026-10-13)

One small Goal per model: read only the frozen case-1 brief (A5-02 crate
labels), do live web research, and nominate external leads in four families —
(a) asset/inventory label printing, (b) warehouse barcode receiving,
(c) resolver/identifier architecture analogy, (d) parsing/format/field
migration history — each lead with the exact page opened and primary-source
FETCH-NEXT URLs. No ranking, no design selection, ~12-minute target. Host
scored nominations against the frozen case-1 bundle (Snipe-IT v8.8.0 released
code, Odoo 18 barcode, GS1 Digital Link, product-internal issue history).
Runtime: `~/PM-Experiments/er-granularity-20261012/discovery/`
(`discovery-{deepseek,luna,glm}.md`, `HOST-SCORE.md`). Not blind-graded;
host score only.

## Result

| Model | Leads | Bundle families hit | Strongest nomination | Weakest point |
|---|---:|---|---|---|
| DeepSeek V4.1 Flash | 15 | a, b, c, d | Odoo: exact `barcode_nomenclature.py` at 19.0 | Snipe only at docs level, no pinned code |
| Luna (gpt-6-luna Max) | 14 | a, b, c, d | GS1: versioned URI Syntax 1.7.0 + Resolver 1.2.0 | Snipe FETCH-NEXT = lang file / releases page |
| GLM-5.3-Flash | 11 | a, b, d (c as unopened candidate) | Resolver breadth: Handle / PURL / ARK / DOI | GS1 Digital Link blocked by 403; recorded, not fabricated |

All three finished in roughly 3–9 minutes of wall time, one context each —
the cheapest stage tested in the whole pilot.

## What discovery does and does not do

- **Nomination is reliable at flash grade.** All three models independently
  nominated Snipe-IT and Odoo; two of three opened the exact GS1 Digital
  Link standard text. The union covers all four bundle families in kind and
  adds real novelty (ZPL stored formats, OpenBoxes with an explicit offline
  boundary, ERPNext receiving, InvenTree labels, Handle/ARK/PURL/DOI).
- **Version pinning does not happen by default.** Bundle-specific recall:
  Snipe-IT v8.8.0 pinned released code 0/3; Odoo 18 0/3 (17.0 and 19.0 were
  nominated instead); GS1 standard text 2/3. FETCH-NEXT pointers land on
  docs, releases pages, or moving branches (`master`, `develop`) as often as
  on pinned released code.
- **Product-internal defect history does not happen by default.** The
  bundle's key history lead (a field-shadowing defect in the chosen
  product's own issue tracker) was found by 0/3. Only Luna dug candidate
  issue trackers at all (two Odoo issues, one ERPNext regression report).
- **Fetch-failure honesty varied usefully.** GLM logged four unopened
  candidates with the failure reason instead of inventing leads — the
  behavior a production discovery stage needs, obtained here without being
  explicitly demanded.

## Process consequence

Discovery and pinning are separate stages with separate failure modes. A
production recipe needs an explicit host fetch/pin step between nomination
and extraction: resolve each accepted nomination to pinned released code or
versioned standard text, and run a bounded issue-tracker search inside each
chosen product's repository. Neither can be folded into the discovery Goal
and assumed done. This matches the Phase 1–4 design, where the host supplied
the pinned bundle and extraction quality was then high.
