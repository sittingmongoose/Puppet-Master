# Reviser sources index (navigable)

Root: `/home/sittingmongoose/PM-Experiments/er11-20261009-116bb1e4/jobs/B-08/treatment/reviser`
Map: `../source-map.json` (R01–R05 + F01–F10 immutable, disjoint from research S01–S14,
verifier S01–S26, critic C01–C11) · Evidence: `evidence.md` · Final: `../final.md`

## Independent reviser sources

| ID | Source | Grounds | Stability |
|----|--------|---------|-----------|
| R01 | n8n official pricing (live fetch) | EUR executions 2.5K/10K, unlimited users/workflows, Community unlimited; M1 | Pricing mutable |
| R02 | Authentik official 2025.10 post (live fetch) | Redis removal to Postgres, server+worker+PG; M3 | Release immutable |
| R03 | Lend-Engine pricing (live fetch) | Tiers, unlimited loans, item/contact/site caps, language rows; M6 | Marketing/pricing mutable |
| R04 | WCAG 2.2 Understanding Reflow (live fetch) | SC 1.4.10 320px/400% 2D-scroll rule; M11 | Standard stable |
| R05 | Grist audit-capability search (snippets) | Install-wide SIEM audit + doc history; no per-row read audit; M7 | Search/vendor live |

## Frozen local predecessors (read complete)

| ID | Source | Grounds | Stability |
|----|--------|---------|-----------|
| F01 | cases/I08/brief.md | Brief constraints + O1–O6 obligations | Immutable frozen |
| F02 | research/revealed-plan.md | Exact P1–P6 | Immutable frozen |
| F03 | research/draft.md + discovery.md + sources/ | Investigator package, stacks A1–A8, O2/O3/O6 | Immutable frozen |
| F04 | research/source-map.json | S01–S14 provenance | Immutable frozen |
| F05 | research/verification-questions.md | Q1–Q3 neutral questions | Immutable frozen |
| F06 | verifier/verification.md + sources/ (26 files) | Q1–Q3 answers, uncertainty, proposed checks | Immutable frozen |
| F07 | verifier/source-map.json | Verifier S01–S26 provenance | Immutable frozen |
| F08 | critic/critique.md + sources/ | M1–M14, per-P audit, minors m1–m10 | Immutable frozen |
| F09 | critic/source-map.json | Critic C01–C11 provenance | Immutable frozen |
| F10 | reviser assignment.md + input-map.json | Stage contract, roots, deadlines | Immutable frozen |

## Claim → source quick map

- Loan exclusivity / repair states / availability → F03, F06 (Q2/Q3), R03 (caps context)
- Minimization / teacher visibility / token gating → F06 (Q1), F08 (M2), F03, R05 (audit)
- Bilingual delay contact / idempotency → R01 (batching cost), R03 (narrowed U-P3), F03, F08 (M12)
- Large-print / reflow acceptance → R04 (grounding), F03, F08 (M11)
- Summer / offline / runbook / MFA → F03, F08 (M8), F06 (upload buffering via F03/F08)
- Unfunded SSO / broker / Redis → R02 (confirmed), F03, F08 (M3)
- API attachment gap → F06 (Q2 code reads), F08 (M5), F03
- Depreciation repair → F06 (Q3 pinned tags), F08 (M4), F03
- Cost vs $8k / tiers / currency → R01 (EUR), R03 (Plus tier + caps), F08 (M10)
- P5 decisions / portal conditions → F03, F08 (m9 emphasis)
- Verification coverage gap → F05, F08 (M14), F06

## How to navigate

Start at [../final.md](../final.md) (§9 adjudication cites every M/Q finding with its
disposition), confirm each claim's `[Rn]`/`[Fn]` locator in
[../source-map.json](../source-map.json), then open the retained excerpt in
[evidence.md](evidence.md). Predecessor claim maps remain at
`../../research/sources/index.md`, `../../verifier/sources/index.md`, and
`../../critic/sources/index.md`; all material text is restated in `../final.md`.
