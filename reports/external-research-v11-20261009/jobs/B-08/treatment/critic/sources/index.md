# Critic sources index (navigable)

Root: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-08/treatment/critic`
Map: `../source-map.json` (C01–C11 immutable, disjoint from research S01–S14) · Evidence: `evidence.md` · Critique: `../critique.md`

| ID | Source | Grounds | Stability |
|----|--------|---------|-----------|
| C01 | Grist access-rules help (live fetch) | Column rules, user.Access, S-bypass warning; no read-audit mention | Live docs, mutable |
| C02 | Snipe-IT #19174 (snippet) | Open gap: uploads global, not per-event | Issue immutable, status may evolve |
| C03 | ERPNext v15.117.0 release (live fetch) | Fully-depreciated repair fix, #57110, verbatim | Release immutable |
| C04 | ERPNext PR 55276 (snippet) | Similarly-titled fix; behavior-test caution | PR record immutable |
| C05 | NocoDB purchase-license docs (snippet) | Business/Scale gating, official | Live docs, mutable |
| C06 | n8n pricing guides 2026 (snippets) | Executions 2.5k/10k, unlimited Community, EUR drift | Pricing/license mutable |
| C07 | Authentik 2025.10 blog+release (snippets) | Redis removal official; /media→/data drift note | Releases immutable; guides mutable |
| C08 | PowerSync client integration docs (snippet) | uploadData-only-connected, queue buffers | Live docs, mutable |
| C09 | Lend-Engine pricing (live fetch) | Tiers, unlimited loans, caps, language rows | Marketing/pricing mutable |
| C10 | Local frozen predecessors (full reads) | Brief, P1–P6, draft, discovery, S01–S14, Q1–Q3 | Immutable frozen |
| C11 | Baserow-vs-NocoDB 2026 guide (snippet) | Gating corroboration | Guide mutable |

Finding → source quick map:

- n8n source upgrade + EUR drift (M1) → C06
- NocoDB gating stands on official docs (M2) → C05, C11
- Authentik no-Redis confirmed (M3) → C07
- ERPNext fix verbatim + PR caution (M4) → C03, C04
- Snipe-IT gap holds; Archived scoping repair (M5) → C02, C10
- Lend-Engine caps + narrowed U-P3 (M6) → C09
- Grist read-audit ungrounded (M7) → C01, C10
- MFA/runbook underspecified (M8) → C10 (brief+P6 analysis, no new source needed)
- Invented triage SLA (M9) → C10
- Unitemized $8k fit (M10) → C06, C09, C10
- Accessibility ungrounded (M11) → C10 (absence in S01–S14)
- Idempotency mechanism missing (M12) → C10
- Baserow/Directus exclusion rationale (M13) → C10, C11
- Verification coverage gap (M14) → C01, C10
