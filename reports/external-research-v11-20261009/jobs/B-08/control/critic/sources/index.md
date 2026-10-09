# Sources index — ER11 B-08 control / critic (I08, M15 v1)

Immutable critic IDs C01–C06 (see `../source-map.json`). Bounded fair-use excerpts in
`evidence.md`. No silent rebind: URLs, versions, access timestamps fixed in source-map.json.
Predecessor research IDs S01–S12 live in `../../research/source-map.json` and are cited,
never redefined, here.

- C01 PocketBase authentication docs v0.40.5 (mutable, version-pinned observed) — stateless tokens, no logout endpoint, superuser API-rule bypass, OAuth2 section for non-superusers
- C02 PocketBase collections docs v0.40.5 (mutable, version-pinned observed) — Base/View/Auth, view read-only SELECT, no realtime on views
- C03 PocketBase API-rules-and-filters docs v0.40.5 (mutable, version-pinned observed) — 5 rules, locked default, 200/400/404/403 oracle mapping, superuser bypass
- C04 Snipe-IT v8.8.0 release tag (stable) — checkout/checkin webhook notification payload fix, incomplete checkouts, PHP floor context
- C05 PTAC directory-information FAQ (regulatory-anchored) — 34 CFR 99.3 / 99.31(a)(11) / 99.37, public notice, opt-out window, former-student rule
- C06 W3C Understanding SC 1.4.10 Reflow (stable informative) — 320/256 CSS px, 400% equivalence, 2D-layout exceptions, cells-must-reflow; informative header noted

Usage/billing: unobserved (null) for all critic sources. No application runtime, no sandbox
witness, no code executed in this critic stage; checks are independent doc-fetch only.
