# Sources index (navigable)

Root: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-08/treatment/research`
Map: `../source-map.json` (S01–S14 immutable IDs) · Evidence: `evidence.md` · Discovery: `../discovery.md`

| ID | Source | Grounds | Stability |
|----|--------|---------|-----------|
| S01 | Snipe-IT Overview docs | Asset-tag uniqueness, checkout exclusivity, 4 status meta-types | Live docs, mutable |
| S02 | Snipe-IT #19174 | Checkout/checkin text-only API, global uploads gap | Issue immutable, status may evolve |
| S03 | Grist access-rules help | Cell-level rules on user.* + cell values | Live docs, mutable |
| S04 | Grist self-managed/core/auth notes | Webhook allowlist, Home vs Document ACL, S bypass, Bearer vs OAuth | Main HEAD, mutable |
| S05 | NocoDB API tokens | All-resources + never-expire default, show-once, SHA-256 | Live docs, mutable |
| S06 | NocoDB collab + 0.301.5 + gating thread | Workspace ACL now self-host; field/row/SSO/audit gated | Release immutable; gating needs license verify |
| S07 | ERPNext Asset Maintenance | Planned vs failure distinction | Live docs, mutable |
| S08 | ERPNext Asset Repair + v15.117.0/v16.28.0 | Parts/downtime/capitalization; fully-depreciated fix | Releases immutable; docs mutable |
| S09 | Authentik guides + LDAP/proxy | OIDC/SAML/LDAP/RADIUS broker, 2025.10 no-Redis, header forwarding | Guides mutable; pin re-verify |
| S10 | PowerSync intro + integration | Offline SQLite, uploadData-only-connected, sync-rules boundary | Live docs, mutable |
| S11 | Lend-Engine site/features/pricing | Lending+maintenance+locations+reminders; $12.50–$50/mo tiers | Marketing/pricing mutable |
| S12 | n8n guides | Execution model, self-host unlimited, Cloud Starter/Pro caps | Pricing/license mutable |
| S13 | Grist 2026-07 newsletter | Managed free API 3,000/mo/team | Newsletter mutable |
| S14 | Local frozen brief/freeze/input-map | Brief-only provenance, deadlines | Immutable frozen |

Claim → source quick map:
- Loan exclusivity / repair states → S01, S07–S08, S11
- Minimization / teacher visibility → S03–S06, S08 portal caveat
- Bilingual delay contact → S11–S12, S08 translations
- Summer / offline → S10 (+ host/runbook for others)
- Unfunded SSO → S09 (+ S01 LDAP/SAML fields)
- API attachment gap → S02
- Depreciation repair → S08
- Cost vs $8k → S11–S13, S06 gating
