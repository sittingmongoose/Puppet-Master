# Run ledger (all times UTC, 2026-10-12)

Launch window ~21:42–21:50Z. Routes verified from live catalog before launch.
`codex_lexx` (lexxmariah) not used anywhere.

| ID | Role | Provider / model / effort | Client request ID | Output |
|---|---|---|---|---|
| INV | Case inventory (Sol, easy) | codex_gmail / gpt-6.1-sol / high | er-gran-20261012-inventory-v1 | ~/PM-Experiments/er-granularity-20261012/case/INVENTORY.md |
| S-LU-E | Smoke extract | codex_gmail / gpt-6-luna / max | er-gran-20261012-smoke-luna-extract-v1 | smoke/luna/extract.md |
| S-LU-V | Smoke verify | codex_gmail / gpt-6-luna / max | er-gran-20261012-smoke-luna-verify-v1 | smoke/luna/verify.md |
| S-GL-E | Smoke extract | zcode / GLM-5.3-Flash / thought=max | er-gran-20261012-smoke-glm-extract-v1 | smoke/glm/extract.md |
| S-GL-V | Smoke verify | zcode / GLM-5.3-Flash / thought=max | er-gran-20261012-smoke-glm-verify-v1 | smoke/glm/verify.md |
| S-DS-E | Smoke extract | omp / opencode-go/deepseek-v4.1-flash / thinking=high (max not offered) | er-gran-20261012-smoke-ds-extract-v1 | smoke/deepseek/extract.md |
| S-DS-V | Smoke verify | omp / opencode-go/deepseek-v4.1-flash / thinking=high | er-gran-20261012-smoke-ds-verify-v1 | smoke/deepseek/verify.md |

Smoke source: pgvector README (fetched by host 2026-10-12), sliced to
smoke/S1-slice.md. Trap: type storage limit 16,000 dims vs index limit 2,000
(vector) / 4,000 (halfvec) / 64,000 (bit). Gold in smoke/GOLD-smoke.md (host only).
Concurrency at launch: Luna 2 + Sol 1 (codex_gmail), GLM 2 (at user cap), DeepSeek 2 (at user cap).

## Phase 1 batch 1 (case A5-02, bundle S1-S13 = 165,545 bytes; GOLD.md verified by Sol Max: F1 yes, L1 yes, 20 propositions, 10 bundle-gap categories)

| ID | Role | Route | Client request ID | Output |
|---|---|---|---|---|
| GOLD | Gold+rubic (Sol hard) | codex_gmail / gpt-6.1-sol / max | er-gran-20261012-gold-v1 | case/GOLD.md (sandbox) |
| LU-M | Monolith | codex_gmail / gpt-6-luna / max | er-gran-20261012-p1-luna-M-v1 | arms/luna-M/final.md |
| GL-M | Monolith | zcode / GLM-5.3-Flash / max | er-gran-20261012-p1-glm-M-v1 | arms/glm-M/final.md |
| DS-M | Monolith | omp / deepseek-v4.1-flash / high | er-gran-20261012-p1-ds-M-v1 | arms/deepseek-M/final.md |
| LU-P-E1 | Packet extract Snipe | codex_gmail / gpt-6-luna / max | er-gran-20261012-p1-luna-P-E1-v1 | arms/luna-P/records-snipe.md |
| GL-P-E1 | Packet extract Snipe | zcode / GLM-5.3-Flash / max | er-gran-20261012-p1-glm-P-E1-v1 | arms/glm-P/records-snipe.md |
| DS-P-E1 | Packet extract Snipe | omp / deepseek-v4.1-flash / high | er-gran-20261012-p1-ds-P-E1-v1 | arms/deepseek-P/records-snipe.md |

Concurrency after batch 1: GLM 2/2, DeepSeek 2/2, Luna 2. Next packets
(E2 Odoo+GS1, E3 history, then C1 compare, I1 integrate) launch only as slots free.

## Phase 1 batch 2 (2026-10-12 ~22:01Z)
DS-M terminal: arms/deepseek-M/final.md, 2,801 words, written ~22:00Z (~3 min after launch window).
Host spot-read only (not a grade): it does carry the F1 external-URL prefix/plain_asset_tag mechanism.
| LU-P-E2 | Packet Odoo+GS1 | codex_gmail/luna/max | er-gran-20261012-p1-luna-P-E2-v1 | arms/luna-P/records-odoo-gs1.md |
| LU-P-E3 | Packet history | codex_gmail/luna/max | er-gran-20261012-p1-luna-P-E3-v1 | arms/luna-P/records-history.md |
| DS-P-E2 | Packet Odoo+GS1 | omp/deepseek-v4.1-flash/high | er-gran-20261012-p1-ds-P-E2-v1 | arms/deepseek-P/records-odoo-gs1.md |
Running after batch 2: Luna 4 (M,E1,E2,E3), GLM 2/2 (M,E1), DeepSeek 2/2 (E1,E2).

## Phase 1 interim observations (host spot-reads only, NOT grades; 22:04Z)
- Monoliths: deepseek-M done ~22:00Z (2,801 words; carries F1 prefix mechanism). luna-M done ~22:02Z (2,321 words; no occurrence of plain_asset_tag / external URL / prefix mechanism; care QR routed via GS1 analogy as separate element). glm-M still running.
- Packets done: deepseek-P E1 (44 claims), E2 (65), E3 (14) -> C1 launched (er-gran-20261012-p1-ds-P-C1-v1). luna-P E1 (35 claims; DOES carry plain_asset_tag + prefix + conditions at records lines 88-89,143-144), E3 (4 claims + honest UNKNOWN). luna-P E2 running. glm-P E1 running, no file yet.
- Within-model contrast so far: same Luna model missed the F1 mechanism in monolith prose but captured it exactly in a bounded extraction packet. Survival through C1/I1 is the open question.
- Quote-format note: DeepSeek/Luna packets often concatenate several exact snippets in one QUOTE field separated by " / " or ";", so a naive whole-quote substring check undercounts verbatim accuracy; graders judge quotes component-wise.

## Terminal freezes (2026-10-12)
- deepseek-P final terminal 22:16Z check: 2,813 words, sha256 c2455cf4eb9e9d8d7b612cac4f0ab98a13fd086ee679c7d0fa0171c360401400 (worker revised the file several times before terminal; only this terminal version counts).
- luna-P final: 2,627 words (file 22:14:27Z, task terminal noticed this turn).
- glm-M final: completed (2,915 wc -w; worker-revised before terminal).
- Pending at 22:16Z: glm-P E2 (running, no file), then glm-P C1 and I1. All other Phase 1 candidate contexts terminal.

- glm-P E2 terminal: records-odoo-gs1.md 22:27:15Z, 75 claims (largest extraction). glm-P C1 launched er-gran-20261012-p1-glm-P-C1-v1.
- Host mechanical checks saved to sandbox grades/HOST-CHECKS.txt (presence counts only, not grades).

## Completion (2026-10-12 22:51-22:58Z)
All 6 blind grades terminal: C1 glm-M FAIL, C2 deepseek-M FAIL, C3 deepseek-P FAIL,
C4 glm-P FAIL, C5 luna-M FAIL, C6 luna-P FAIL (strict GOLD rubric; see RESULTS.md
for relative signal and calibration caveats). Blind key: sandbox grades/KEY.txt.
Grader contexts: 6x codex_gmail gpt-6.1-sol max (experiment overhead, not candidate cost).
Candidate contexts total: Phase0 6, Phase1 monoliths 3, packets 15, plus Sol
inventory (high) + gold (max). No lexxmariah route used. No Plans edits. No landing.

## Phase 2 (2026-10-12 23:02-23:52Z)
Checklists host-generated from records (KEY: deepseek 65, luna 45, glm 62).
I2 contexts: p2-luna-I2-v1 (terminal ~23:12Z), p2-ds-I2-v1 (terminal, prose 2,799w),
p2-glm-I2-v1 (file 23:29Z, terminal after). Host quote check v2: luna 0 quotes (pass),
deepseek 14/15 verbatim (1 regex pairing artifact waived), glm 17/22 (4 artifacts +
1 reassembled redirect quote) -> 1 repair context p2-glm-repair1-v1; verified diff
= exactly the one paragraph/sentence; flag cleared.
Blind grades (Sol Max codex_gmail): D1 deepseek-P-v2 FAIL, D2 luna-P-v2 FAIL, D3 glm-P-v2 FAIL.
Conditions retained 6/8, 8/8, 7/8 (v1 packets 6,6,5); escaping retained 3/3 (v1 0/6 all arms);
no invented quotes found by graders in any v2 final. See PHASE2-RESULTS.md.
Terminal v2 hashes: deepseek 0c478a0a..., glm(post-repair) 4de74f74..., luna bfd0005a...

## Phase 3 (2026-10-13)
Gate-composition repair: one small Goal per packet arm on its v2 final
(er-gran-20261012-p3-{luna,ds,glm}-gate-v1) + host PROVENANCE.md stamps.
Host diff audit: luna 2 lines, glm 5, deepseek 17 changed; quote check clean.
Blind grades: E1 luna-P-v3 PASS_WITH_LIMITATIONS, E3 glm-P-v3
PASS_WITH_LIMITATIONS, E2 deepseek-P-v3 FAIL (non-gate claim errors).
Conditions 8/8 all three v3 finals. See PHASE3-RESULTS.md.

## Phase 4 (2026-10-13)
Fresh frozen case ER12 A8-01 (case2, sources T1-T10; brief sha 9a9f19c5...,
plan 99252e94...). Sol Max gold (er-gran-20261012-gold2-v1) with M1 trap
re-verified: collision helper defined in bagit-python v1.6.0, no normal-path
caller. Winning shape from start, 3 arms x 5 candidate contexts
(p4-{ds,luna,glm}-{E1,E2,E3,C1,I}-v1); host conditions checklists from records
(glm 180 blocks / 89 KEY). Host quote check case2: glm final 16/19 with 3
regex-pairing artifacts, adjudicated verbatim/contextual, no repair.
Blind grades (KEY-P4): F1 deepseek-W FAIL (diagnostic 15/40, conditions 2/8,
10 material errors incl. one invented quoted word the host checker missed),
F2 luna-W FAIL (25/40, 4/8, 5 ME incl. authored-test-called-passing),
F3 glm-W FAIL (23/40, 3/8, 5 ME, quotes 20/20 exact).
Shared class: self-referential acceptance oracle, no collision screen,
incomplete offsite-restore protocol. See PHASE4-RESULTS.md.
GLM-W final sha256 f1dbbe81...; anonymized F3 deae96e1...

## Phase 5 (2026-10-13)
Brief-only live-web discovery, 1 Goal/model (p5-{luna,ds,glm}-disc-v1),
~3-9 min each. Union covers all 4 bundle families in kind; bundle-specific
recall: Snipe v8.8.0 pinned code 0/3, Odoo 18 0/3, GS1 standard text 2/3,
product-internal defect history 0/3. Host score only (sandbox
discovery/HOST-SCORE.md). See PHASE5-RESULTS.md.

## Close (2026-10-13)
Final synthesis in SYNTHESIS.md. No lexxmariah route used at any point.
No canonical Plans edited; no commit, push, or landing performed.
Reports remain uncommitted in reports/er-granularity-20261012/ pending
Jared's instruction.

## Phase 6 (2026-10-13)
Host lint suite /tmp/er_lint.py (Q3 same-file ordered-window quotes, PROMO,
ABSENCE, RELEASE, GATEVER) validated against all frozen finals incl. passing
controls. Flash single-pattern critics (A/B/C/D) + adversaries found grader
defects cross-family and generated most of the gold mutation space without
seeing gold. See PHASE6-RESULTS.md.

## Phase 7 (2026-10-13)
Pipeline v2 assembled on Luna Phase-4 records: host skeleton (gate table
with oracle + blind-spot columns, mutation table, evidence-mode wording
rules) -> integration -> lint -> cross-family critics + adversary -> host
adjudication -> bounded repairs + diff audit. F4 PASS_WITH_LIMITATIONS
35/40 (first fresh-case pass); second grade F4b FAIL 34 (one genuine ME).
See PHASE7-RESULTS.md.

## Phase 8 (2026-10-13)
Pipeline v2 replicated on DeepSeek + GLM record sets; all finals
double-graded blind (Sol Max, codex_gmail). Luna: F5 split FAIL 31/PASS 38
-> F9 (v6 3ce4e5d3) PASS 36 + PASS 36. DeepSeek: F6 FAIL 29 -> F8 FAIL 30
-> F10 FAIL 35 (1 ME) -> F11 (v7 647c4f3a) PASS 36 + PASS 35. GLM: F7
FAIL 28 -> F12 split FAIL 29/PASS 34 (waiver MEs) -> F13 split PASS 35 /
FAIL 33 (ME05 '%' symmetry) -> F14 (v8 69f8b4cf) PASS 36 + PASS 36.
Conditions 8/8 in all six passing grades; zero material errors in each.
All four split-FAILs host-verified genuine. See PHASE8-RESULTS.md.
Supersedes the Phase-5-era Close note above. Still no canonical Plans
edits, no commit/push; reports uncommitted pending Jared.

## Phase 9 (2026-10-13)
Fresh case3 (embedded terminal brief, sandbox-authored). 9A two-axis
discovery brief-only: Luna 18 noms (9+9), GLM 24 (12+12), DeepSeek 32
(15+17); Sol Max reference 53 (27+26, sha 96668e60). Flash union recall
15/27 + 13/26 with 14 valid flash-only finds (incl. mosh, missed by Sol);
blind spots = niche embeddable libraries + agent-tool donors. Flash
version claims matched host pins. 9B cache prototype
(/tmp/er_cache_fetch.py): 6 products pinned under cache/<slug>/<version>/
with manifest.json + index.json (Ghostty by git tag v1.3.1, no GH
Releases). 9C MRI slices vs monolith on cached VS Code terminal docs:
slices 23/24 checklist facts, ~117 claims, 136/139 quotes verbatim;
monolith 21/24, 50 claims. See PHASE9-RESULTS.md.

## Phase 10 (2026-10-13)
Same-prompt discovery baselines: Astra 6 Max 34 noms (31/53 matched, ~18m),
Sol 6.1 Max 40 (33/53, ~30m) vs flash union 42 (28/53 + 14 novel). Sol-base
missed 20 of its own solref items (single-run variance). Independent reviews
(Opus 5.5 xhigh claude_me; Sol Max): artifacts/grades/discovery figures
confirmed; skeleton gold-leak, grader-driven late repairs, stopping-rule and
9C tiling/alt-text claims corrected (see PHASE10-BASELINES-REVIEWS.md).
Lever catalogs: PHASE10-LEVERS.md + reviews/levers-{astra,opus,sol}.md.
Host scripts copied from /tmp into sandbox root. No Plans edits/commit.

## Phase 11 (2026-10-13)
Lever tests vs Sol 6.1 Max bar (33/53). Discovery: angled prompts recovered
blind-spot classes; dry-round 2 added 41 more (not dry); names-only 77 lines
~8m; depgraph (crates.io revdeps) = candidate firehose needing filter;
capture-recapture invalid here (LP 58-80 vs observed 74+). Gold-free
skeletons: Luna 14/21 gold-skeleton elements (incl. collision seed from own
records), DS 9/21 by keyword. Critics: multi-file hunter fabricated F13
quotes (one-file-per-context rule); planted-defect calibration 3/6 caught
+1 arguable +1 FP; entailment audit caught ME05 exactly; contrast slice
found extra divergences. Extraction: quote-by-construction 16 claims, all
chunk refs valid, caught fact both 9C shapes missed; overlap slice hit 4/4
cell facts; residue slice 41 claims from unused file. See
PHASE11-LEVER-TESTS.md. Phase 12 design fixed therein.

## Phase 12 (2026-10-13)
Pre-registered held-out caseA. Flash: discovery union ~77 + dry2 +39;
bundle 7 products pinned (713KB, deviation: SQLite forced in); 10 chunk-ID
slices (195+ claims, all chunk refs valid); gold-free skeleton + DS
adversary; critic panel (hunter NONE, entail 2 flattened, adversary 17
attacks); 1 bounded repair; frozen e1c0af49. Sol arm: records+final
b7bef70f frozen pre-gold. Gold (Sol, post-freeze) b04654f8. Opus double
grades: flash FAIL 25 / PASS 27 (split on one dropped-words quote; 0 gold
MEs), Sol PASS 39 + PASS 38. Pre-registered success NOT met (diagnostic
gap ~11). Root causes: slice matrix not clause-driven; integrator
hand-copied quotes. See PHASE12-RESULTS.md.

## Phase 13 (2026-10-13)
Held-out caseB rerun with clause-driven slices + host-rendered quotes +
DS-max. Flash slices 11 files, chunk refs all valid; render clean (296
chunks, 0 hand quotes); critics: hunter NONE, entail 1 flattened, adv
16 attacks; 1 repair; frozen render 487576dd. Sol arm frozen 25e805ff.
Gold b04654f8 (caseA) / P13 gold 9ec75e4b. Astra double grades: flash
FAIL 30 + FAIL 30 (2 substantive MEs: rank semantics, merge-oracle
composition; origin = residue slice claim), Sol PASS 40 + PASS 39.
Success not met; gap narrowed; quote class eliminated. See
PHASE13-RESULTS.md. Next: slice-level entailment pre-integration +
mutation-expectation adversary + spend full repair budget.

## Phase 14 (2026-10-14)
Scale check: 96 owner docs / 31.7MB / 7,095 PlanUnits / 28,335 acceptance
units. P13 per-topic ≈23 flash contexts, ~650k input tokens -> naive
96-topic ER ≈60M tokens, weeks. Chunk-preselection test: picker chose
42/289 chunks (14% bytes); subset slice 37 claims vs 22 full-file, all
topic keys covered, 0 outside refs, honest gap flag; keyword-only recall
32% at 12% bytes. PHASE14-SCALE.md ranks dossier reuse, preselection,
tiering, delta research; Phase 15 = build dossier cache + rerun measuring
tokens/time per stage.

## Phase 15 (2026-10-14)
Held-out caseC (sync/backup) on the scale stack: dossier JSONL store
(562->645 records), picker slices (111,734 B in, 5 slices), slice
entailment pre-integration, 3 full critic->repair rounds (entail to
190/190, adversary to 32/32 decided/0 high), frozen flash a32ec8b6,
Sol 6616acac, gold 1490d71c. Astra x2: flash PASS_WITH_LIMITATIONS
22+24, 0 MEs (first flash pass); Sol PASS 29 + FAIL 28 (1 claimed ME,
host-judged borderline flattening, split reported). Zero-ME criterion
met; diagnostic gap 5.5 by means (criterion Sol-5 not met). Cause:
records-only coverage starved redb/RocksDB/journal mechanics
(P05-P10/P17-P18). See PHASE15-RESULTS.md. Next: dossier depth tier.

## Phase 16 (2026-10-14, component)
Depth-tier test on caseC's starved donors: 3 source-inverted slices
(redb/RocksDB DS, journal GLM) recovered 26/26 gold deciding facts
with conditions (172 claims, ~11 min) vs frozen flash final's 0-1
grades on the same propositions; whole-body input 254 KB over the
200 KB budget, so the carried rule pairs depth tier with picker
preselection. See PHASE16-RESULTS.md. Next: held-out caseD.

## Corrections (2026-10-14, per independent Sol 6.1 Max review, p15/SOL-REVIEW.md)
F01 HIGH: Phase 16 redb/RocksDB slices read the gold-derived checklist;
blind-coverage claim retracted, isolated re-run (16b) replaces it.
F02: P15 grade blinding compromised (Sol labels/links in G2, path in G1
header); grades preserved as compromised-blinding run. F03: Sol M1
(journal modal flattening) CONFIRMED under frozen rubric; host's
borderline call superseded; raw scores unchanged. F04: efficiency
denominators/clocks corrected in PHASE15-RESULTS (no end-to-end wall
improvement claimed). F05: dossier records syncthing#0005/#0006,
systemd-journal#0009, restic#0006 corrected in store. F06: Sol digest
appended to p15/FREEZE.txt. F07: coverage/causal overstatements
corrected (cluster = 4.5 of 5.5 gap points).

## Phase 17 (2026-10-14/15, held-out Case D)
Flash FAIL 25+25 (2 confirmed MEs, same pair both graders); Sol Max
PASS_WITH_LIMITATIONS 36+36, 0 MEs; diagnostic gap 11 (criterion
Sol-5 not met; zero-ME criterion not met). ME1 = JOBO-010 no-nesting
premise chunk not picked (picker recall); ME2 = host R1-8 unqualified
capture default surviving in disposition 7 quoted wording after R3
repair (host verification gap). Slice entailment 282/284; critics
converged on all appendix-visible content. Host caught and redid a
default-effort Sol final at Max pre-grading. See PHASE17-RESULTS.md.

## Phase 18 pre-registered (2026-10-15)
Effort-locked routes (all flash at route max, host-asserted per
launch), extraction-first records inventory, premise-once store,
absence discipline, host conditions checklist, coverage audit,
contradiction + gate-composition critics, defect-string repair
verification. Effort A/B on frozen Case D materials runs first.
See PHASE18-PREREG.md.
