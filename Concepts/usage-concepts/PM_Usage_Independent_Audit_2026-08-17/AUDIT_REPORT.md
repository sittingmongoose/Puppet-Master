# Independent Audit — Puppet Master Usage Concept Update

**Selected concept:** `Concepts/usage-concepts/QwenUsageConcept/u11-prism.html` (U11 Prism II) + its 17-file bundle
**Packets audited against:** `PM_Usage_Concept_Update_Final_Cumulative_2026-08-08` and `PM_Usage_Dependency_and_Work_Correction_2026-08-13`
**Mode:** selected-concept integration-readiness (a concept was named, so a port handoff is in scope)
**Date:** 2026-08-17
**Standing:** independent. Audit only — no concept, packet, Plans, PMConcept7, pm6-build, pm7-tools or runtime file was modified. Verified in §13.

---

## 1. Executive verdict

**The concept is a strong design on an unsound data-semantics foundation. It is ready for one more iteration, not for the port.**

U11 Prism II is the best of the eleven Usage concepts for good reasons that this audit confirms by measurement, not by reading its own reports: the theme and width matrix is genuinely clean, the widget engine genuinely works, reduced motion is genuinely honoured, and the honesty guards the packet cares most about — unconfigured providers absent from the DOM, no forbidden raw provenance labels in ordinary context UI, no tokens or cost on maintenance cards — genuinely hold in the rendered DOM. Its own harness's headline claim of 80/80 is **real**: it reproduced byte-for-byte on a different OS and browser four days later.

The problems are not cosmetic and not in the parts the harness tests. They are concentrated in exactly the three areas the packet was written to protect:

1. **Ownership.** The Usage settings sheet writes and persists five Settings-owned policies to `localStorage` with zero deep-links and zero commands. That is the behaviour core packet 05 names a *hard failure*, it reproduces four controls from the Settings owner's own inventory, and the policy it writes is then never read back by any renderer — so a user who caps extra usage at $20 is still told the old figure.
2. **Counting.** Displayed token totals add `cache_read` — and a `reasoning` term that no event carries — on top of input plus output, with no `counting_semantics` declared anywhere. Across the 45 shipped attempts that inflates totals by 181,000 tokens. Canonical fixture `GUI-USG-007` forbids exactly this by name, and the page already loads a shared module that implements the correct rule.
3. **Plan versus settlement.** The scope picker asserts a fabricated `-1%` with a green all-clear on ten rows where no meter exposes a limit — including a product the user has switched *off*. The continuation control collapses five product kinds into one label, silently drops the Extra Bundle and the Saved reset steps, and shows a raw enum token as the answer for 11 of 12 policies. Two Free Models rows render with no underlying route at all, which is another explicitly named hard failure.

Separately and seriously: **the concept's documentation cites roughly 38 verification artifacts that do not exist and were never committed**, including every hard number it reports (`280/280`, `1003` assertions, `77%→7.8%` scrolling, `1.00×` fit, AA contrast probes). And **the mandatory concept gate has never passed** — `validate.py` fails with 24 issues while two sibling Qwen concept folders pass it.

**Numbers.** 187 findings raised, **20 refuted and dropped** by adversarial review, **167 survive**: **7 blocker, 51 major, 85 minor, 24 info**. 59 carry a data or settlement misrepresentation risk. Of the packet's 107 machine-readable decisions: **51 demonstrated, 30 represented, 13 named-owner-deferred, 13 missing** — and **48 of the 107 have a `status:"fixed"` that the evidence contradicts**. Of the 79 canonical `UF-088` MUST facts, **9** have any equivalent field in the concept's data model.

---

## 2. What this audit did, and why its own numbers can be checked

Eleven parallel audits, one per numbered item in the packet's `AUDIT_PROMPT.md`, each grounded in a canon extract built first (`canon/`) rather than in the concept's own claims. **Every blocker and major was then attacked by two independent adversarial verifiers** — a correctness lens (open the cited line; does the mechanism exist?) and a scope-and-canon lens (is the rule live, in scope, and quoted correctly?) — both instructed to default to *refuted* under uncertainty. That pass dropped 20 findings outright and **downgraded the severity of 46 more**. A completeness critic then attacked the audit itself; three unmeasured modalities it identified were measured, adding a twelfth axis.

Two runtime passes ran, both over the real browser:

- **Replay.** A scratch copy of the concept's own `u11-verify.mjs`, repathed only for the browser binary and output location, produced **80 cases, 80 pass, 0 fail** — identical case names, identical order, **byte-identical detail strings** including relative-time text, four days later on Linux instead of Windows. The shipped report is authentic.
- **Independent harness.** Ten probe groups asserting geometry, computed style and rendered text — never dispatch counts. It included an auditor-added instrument self-test that injects synthetic defects to prove each detector fires; that self-test caught two real detector bugs before any finding was filed, one of which was hiding the most serious layout defect. Its author also corrected three of its own measurement errors mid-run rather than reporting them as defects, and explicitly declined to call two uncharacterised drag states defects.

This audit's own evidence is on disk and hashed: 18 harness scripts, 34 probe files, 86 screenshots, and `AUDIT_MANIFEST.json` covering both deliverables and audited sources. Every finding in `FINDINGS.json` carries a reproduction step — 41 as runnable scripts, 64 as manual UI steps. That is deliberate: the central failure of the work under audit is unfalsifiable evidence, and an audit that repeated it would be worthless.

---

## 3. What is genuinely sound

Stated plainly, because the defect list below is long and the concept does not deserve to be read as shoddy.

| Area | Measured result |
|---|---|
| Theme × width matrix | 80/80 cells: zero horizontal page overflow, zero console errors, zero page errors, correct `data-theme`. Only element painting past the right edge is a decorative `aria-hidden` glass blob. |
| Widget engine | Add, remove, resize, move, reset-layout all show **no overlap, no interior dead space, no 0×0 flash**, and layout persists across reload with uids intact. |
| Reduced motion | 0 elements above 1 ms, on **both** the attribute path and the OS-preference path, applied before boot. |
| Forbidden provenance labels | `provider_reported` / `provider-reported` absent from text *and* HTML of the ring and details panel; standalone `high`/`medium` word-boundary count 0. |
| Unconfigured accounts | Mistral, Fireworks, OpenRouter, Cohere appear nowhere in the DOM across all 13 rooms and both popovers, while correctly remaining in the data. |
| Maintenance hygiene | No operations or maintenance card renders a token count or a cost. `ue-609` is a genuinely separate validation attempt. |
| Cost identity | 61.85 + 125.57 = 187.42 holds consistently across 10 renderings. |
| Context popovers | Fully inside the viewport at 360 px and at 2500 px; all 7 compact scenarios cycle. |
| Time format | No 12-hour time anywhere across 3 timezones × 13 rooms; the forced `h23` cycle holds. |
| Escape handling | Scope picker returns focus to its trigger on both open paths, and moves real focus rather than faking it. |
| Provider-CLI correction | The adjudication was genuinely opened and audited (3 corrected, 5 verified already-correct), and its byte-identical copy was reachable in-repo. Install/update time carries ms only; no byte or MB figure feeds a token total. |

---

## 4. Blockers (7)

Full detail, evidence and reproduction for each is in `FINDINGS.json`.

**B1 · `A01-01` — Usage owns and persists Settings policy.** `sheetHTML()` (`u11-prism.html:1099`) emits three editable sections writing five Settings-owned policies — low-usage warnings, automatic account/provider switching, continuation policy, extra paid usage, and the spending limit. The handler at `:1186-1210` writes each to `STORE.set('u11:settings', …)`. **No branch dispatches a command; no branch calls `deepLink`.** The two deep links in the sheet hang off separate footer buttons the user need never press. Four of the five controls are reproduced from the Settings owner's own inventory at `ORIGINAL_SETTINGS_USAGE_HANDOFF.md:145-160`. Core packet 05 lists "Usage mutates policy locally instead of deep-linking to Settings" as a hard failure; packet 06:64 adds that route resolution stays outside Usage.

**B2 · `A01-03` — three registers certify the opposite of the measured behaviour.** `demo-fixture-report.json:193-196` asserts the rule "Usage mutates no policy locally"; `candidate-wiring-delta.json:34` ends its deep-link stage "…Usage never mutates policy locally"; `plan-owner-delta.md:20` marks the Settings-consumer contract **`demonstrated`** — the report's own key for "shows the state end-to-end". All three are false against a measured `cmdLog` delta of 0 and five persisted writes. This is independent of B1: even if the sheet were repaired, a fabricated certification shipped, and a reviewer trusting these three files would sign off a hard failure.

**B3 · `A04-01` — token totals double-count cache reads.** Two live paths sum buckets into one displayed number: `u11-widgets.js:685,690-691` (`col[1]+col[2]+col[3]+col[4]` over `['input','output','reasoning','cacheRead']`, feeding both bar normalisation and the visible tooltip) and `u11-rundetail.js:194` (rendered per bucket in every run-detail panel). Worked example: run detail shows "Main work / 1 · 85.4k tokens" for the single attempt `ue-570` = 51,200 input + 4,100 output + **30,100 cache read**. Across all 45 attempts the formula yields 870,880 against 689,880 for input+output — **181,000 cache-read tokens added into totals**. `counting_semantics` appears nowhere in the concept, while `_shared/usage-data.js:76-88` already carries a per-provider `SEM` table declaring `cache_in_input: 'inclusive'`. Canonical `GUI-USG-007` forbids `cache_added_when_provider_inclusive` and `double_counted_total` by name.

**B4 · `A03-01` — fabricated `-1%` with a green all-clear.** `pressureOfProductSet` (`u11-prism.html:795-801`) returns sentinel `-1` when no meter in the set exposes `usedPct`; `scopeRow` suppresses the value only when it is `null`, never when it is `-1`; and `toneCls(-1)` falls through to `'ok'`, painting the dot green. Ten rows across all four hierarchy levels are affected, including "AI Credit Overages **-1%**" — a bucket the user has switched **off** (`vs: 'disabled'`, note "Extra usage is off") — and the entire local route. The Plans widget renders the same products correctly as "limit not exposed", so one page states the same fact two contradictory ways, and the Plans room's own printed promise "Unknown limits say so; they never render as zero" is falsified.

**B5 · `A03-02` / `A03-03` / `A10-03` (consolidated) — the continuation control misstates plan behaviour four different ways.** `afterIncludedOptions` (`u11-prism.html:1083-1098`) normalises every `prod:*` step to one key `prod` and dedupes, then labels via `labels[key] || key`. Measured over all 12 policies — the counting rule stated, because the three source findings each counted something different (`audit-evidence/probes/contradiction-reconciliation.md`):

| Count | What it counts |
|---|---|
| **2** | policies where a step is **silently dropped**: Coding Plan loses the Extra Bundle, ChatGPT plan loses the Saved reset |
| **11 of 12** | policies whose default answer is an **unlabelled raw enum token** (10 × `included`, 1 × `balance`) |
| **9** | policies that display the literal token `included` to the user |
| **2 of 3** | seeded stored policies the control **cannot render at all** (`credits`, `extra_usage`) — so the UI shows a policy other than the one stored |

The single surviving label "Draw on the balance/pack" is used for `prepaid_balance`, `purchased_pack`, `metered_continuation` *and* `shared_pool`. For Claude Max that step is `metered_continuation` — new paid charges after the plan — presented as though spending a pre-paid pack. Canon separates "Use extra balance" / "Use a usage pack" / "Use paid usage after the plan" / "Use saved reset". Worse, the dropped Saved reset is contradicted two rows below in the same sheet, which states "Saved resets — 1 banked · expires Sep 1".

**B6 · `A07-01` — Free Models rows with no underlying route.** `u11-widgets.js:641-647` renders ineligible free routes through a branch that emits only the model label and status, dropping the `' · via ' + conn.label` the eligible branch emits. Both affected rows *do* carry `connectionId: 'conn:zai-credits'` in the data, so this is purely a rendering omission — the user is told free access ended without being told which provider or account it belonged to. "Free Models without underlying route" is named verbatim as a hard failure in `05_*.md:93`.

**B7 · `A06-06b` — every timestamp is silently relabelled on a UTC host.** `u11-time.js:20` accepts a resolved timezone only when its name contains a slash. `'UTC'` fails that test, so a genuinely-UTC machine has its real zone discarded for a hard-coded `America/New_York` fallback: the pinned instant `2026-08-04T18:42:00Z` renders as **`14:42 EDT`** where the honest value is `18:42 UTC` — four hours wrong, 75 labels per load. The rule also rejects `GMT`, `Zulu`, `CET`, `Japan`, `Singapore`. This is not hypothetical: **the audit sandbox's own default zone is UTC**, so every `14:42 EDT` string captured elsewhere in this audit was the defect firing. `Asia/Kolkata` is honoured correctly, which proves the slash test is the discriminator.

---

## 5. Majors (51) — the recurring patterns

Individually listed in `FINDINGS.json`. They cluster into six mechanisms, each appearing across several axes:

1. **Data present, UI silent** — the most common shape. Requested-vs-effective account renders without the `fallbackReason` the schema declares for exactly that purpose (`A02-06`); the historical attempt's product and billing route never render because its `connectionId` is null, skipping the whole route-evidence block (`A02-05`); `state: 'estimated'` is never visually distinguished from measured (`A05-02`); staleness and provenance chips are dropped for 22 of 27 products, so two stale low-confidence figures from a connection needing reconnect render as bare live percentages (`A03-05`).
2. **Today's registry rewriting yesterday's events** — every route renderer resolves a past attempt's identity through the live `accountById` / `familyById` / `productById` maps (`A02-04`), and the scope-picker footer reports a removed account's history as current measured cost for a live provider family (`A02-01`) — in the same sentence that claims removed accounts never appear.
3. **Aggregates that contradict their own detail** — the Runs widget renders "Running 0 / Done 0 / Queued 0" for a running planning run the capacity widget reports as 2 admitted and 4 queued (`A04-11`, `A06-04`); mixed-provider work items collapse under one attempt's provider against the dataset's own rule note (`A04-08`); the turn card presents one attempt's tokens as the whole work item's usage, choosing the interrupted attempt for `work-3` and thus showing 13% of the truth (`A04-04`); the Attention room attributes portfolio-wide blended burn to a single API route and measures it against that route's limit (`A03-10`).
4. **Missing required fields** — `parent_event_id` has no carrier at all across 45 attempts, and neither does `dedupe_key`, so nothing links a child, replay, fallback, BSD or resumed attempt to its parent (`A04-06`); only 5 of the 11 canonical `CV-196` buckets exist and `counting_semantics` is absent entirely (`A04-03`); Analytics series are hard-coded synthetic arrays reconciling with no usage event, showing 7k–57k reasoning tokens while 0 of 45 attempts carry the field (`A04-02`).
5. **Dead affordances** — 27 widget-footer "Open Usage settings" buttons dispatch a `CustomEvent` no listener consumes (`A09-02`, `A11-10`), and they are **keyboard-reachable and announce as actionable** (`A12-02`). Disclosure has **no effect on widget mounting**: the mounted-type list is byte-identical at Essentials, Standard and Advanced, so advanced-only widgets mount at Essentials and the rail-hidden "Source authority" room renders in full (`A09-03`).
6. **Accessibility, entirely unaddressed** — the 13-room rail is silent to assistive technology (0 `role=tablist`/`tab`/`tabpanel`, no `aria-selected`/`aria-current`, `goTo()` emits no aria change, panes have no `id` or `aria-labelledby`); the tabbed-surface aria contract scores **0/8**; the closed scope picker leaves an invisible inert close button as the page's **last Tab stop** and exposes **100 phantom `role=option`** rows to AT (`A12-01`, `A12-03`).

---

## 6. Data and settlement misrepresentation risks

59 findings carry this flag. The ones that would put a wrong number or a false certainty in front of a user, ranked:

| Risk | Finding | What the user is told vs the truth |
|---|---|---|
| Inflated usage | B3 | Totals overstated by 181,000 cache-read tokens; a single attempt shown as 85.4k when it consumed 55.3k of input+output |
| False all-clear | B4 | `-1%` with a green dot on 10 rows where nothing is known — including a bucket the user disabled |
| Wrong plan behaviour | B5 | 2 policies display a continuation other than the one stored; 2 silently drop a purchased pack or a banked reset |
| Wrong time | B7 | Every timestamp four hours off on a UTC host, with a confident `EDT` label |
| Irreconcilable elapsed | `A06-05b` | One run shows 124 min, 128 min and 103% simultaneously |
| Stale shown as live | `A03-05` | Two stale low-confidence figures render as bare live percentages |
| Disabled shown as unknown | `A03-06`, `A07-03` | A bucket the user switched off is reported as "limit not exposed" |
| Settlements collapsed | `A03-07` | Four distinct settlements all render `$0.00`; the Ledger attempt row never shows billing route |
| Stale policy reported as fact | `A01-02` | A user who caps extra usage at $20 is still shown the old figure |
| Reference price implied | `A03-09` | Three UI strings promise a reference-price surface that does not exist; one promises billing "at list price" |
| Data cells vanish | `A09-13`, `A09-01` | 42 token strings render nowhere at 360 px; 42 rather than 1 at 520 px when the font CDN is blocked |

---

## 7. Stale-canon conflicts (10)

The concept was built against the 2026-08-08 packet's vocabulary and never reconciled with live Plans canon:

- **Vocabulary substitution.** The concept ships `vs` / `sourceClass` / `conf` / `settlement` / `billingRoute` where canon has `value_state` / `source_class` / `source_confidence` / `source_authority` / `settlement_status` / `cost_status`. Nine of 79 canonical `UF-088` MUST facts have any equivalent field.
- **Closed enums narrowed.** `settlement` is a 4-value subset of canon's closed 6-value `settlement_status`, and two attempts carry values canon forbids for their state — an *interrupted* attempt with partial tokens renders `settled` (`A03-13`). The forbidding rule is `Plans/usage-feature.md:5534` (`GUI-USG-008`), which the audit's own finding failed to cite and which was located during critic review.
- **Command contract violated.** `cmd.account.select_profile` is dispatched for a page-scope view filter (`u11-prism.html:940`), while its certified production row declares `effect_kind: "event"` with `expected_event_types: ["account_switch_event"]` (`A11-02`).
- **Alias resolved the wrong way.** `cmd.chat.open_thread_context_details` is dispatched from a Usage surface with a non-canonical payload (`A11-05`).
- **Deep-link destinations do not exist.** See §9.
- **Two project policies contradict each other.** `pm-gui-asset-policy.py` flags `→` and `×` as pseudo-icons; the `PARTS.md` allowlist that `check_no_emoji` honours permits them. Needs an owner ruling.

---

## 8. Register and evidence-integrity defects (38)

**The most serious is not a defect in a register — it is the absence of the evidence the registers rest on.**

- **~38 cited verification artifacts do not exist.** `research/INDEX.md:48-69` and `README.md:130-133` name roughly 38 audit and gate artifacts — `visual-review-ledger.json` ("280 entries, all pass"), `data-unit.mjs` ("1003 assertions"), `qa-fit-final.md` ("77%→7.8% scrolling, every widget 1.00×"), the contrast probes, `audit-robustness.md`, `a11y-audit.mjs`. **None exist on disk. `git log --all --diff-filter=A` shows none was ever committed, and none was deleted.** Every quantitative verification claim in the concept's top-level documentation is therefore unbacked (`A11-03`). `README.md` and `FINDINGS.md` never mention u11 or u10 at all.
  - *Stated fairly:* the register's excuse that "git was unusable on the NAS share" is plausible — `safe.directory` is set for a differently-named path. But a missing tool explains missing *attribution*, not missing *files*, and not documentation quoting results no artifact substantiates.
- **The mandatory concept gate has never passed.** `CONCEPT_RULES.md:12` requires `validate.py` before finishing. It fails with **24 issues** on both the working-tree and committed validators. `u11-prism.html` carries **zero** `data-concept-model` markers (rule 3 is a hard rule) and **zero** `pm-concept-ready`/`pm-concept-state` hooks; `verification/` is flagged as a temp artifact requiring deletion. **Control: two sibling Qwen concept folders pass the identical gate.** No report records the failure.
- **`impact-register.json` is stale and self-contradicting.** Dated 2026-08-11 with `test_results: "77/77 pass"` and `demo_fixtures: "All 18 packet fixtures"`, while the true state is 80/80 and 20 fixtures — corrected only in an appended `correction_2026_08_13` block, leaving the document asserting both.
- **Arithmetic and census defects.** `plan-owner-delta.md` has 19 rows against 10 register entries. `reference-review-report.json` says "all 7 report JSONs valid" when there are 8, and describes 40+6+15+20 = 81 checks against 80 cases. 4 of 8 report JSONs carry no `schema_id` despite the packet declaring one.
- **Five deferred owners do not exist.** Half the `plan_owner_impacts` defer to `Plans/Goal_Runtime.md`, `Plans/Free_Models.md`, `Plans/Notifications.md`, `Plans/Server_Project_Sync.md`, `Plans/Storage_events.md` — **none of which is a file in `Plans/`** (`A11-01`). A deferral to a nonexistent owner is an open hole, not a handoff.
- **`candidate-command-delta.json`'s dispatch list is false** — 6 of the 16 ids are never dispatched (`A11-07`).
- **`DECISION_COVERAGE.json` asserts nothing.** All 107 topics carry `status:"fixed"` with no evidence field, and **no report cites a single decision id**. Coverage was unasserted before this audit; **48 of the 107 `fixed` statuses are contradicted** by evidence.
- **The concept's harness green-lights invented vocabulary** — `u11-verify.mjs:333` asserts `focus_reason === 'setup_required'`, a token canon does not define.
- **One harness case is unsound** (a test defect, not a concept defect): case 42 passes while the authority rail is `display:none` at Advanced, because it asserts only the inline style string and never expands the collapsed "More" group.

---

## 9. Port readiness — what the handoff got wrong

`handoff/` contains the full two-part port handoff. **`handoff/HANDOFF_CORRECTIONS.md` supersedes it** wherever they differ, because the handoff's gate numbers came from hand-written simulators and the real read-only checkers were then run against a scratch-assembled candidate (with an unmodified control that passes all nine, so every failure is u11-attributable).

**A hard failure the handoff missed.** `check_structure` fails on `<body> count 5 != 1`, because `check_structure.py:52` counts raw `<body\b` with no comment stripping and four ported files write the literal string inside comments (`_shared/usage-widgets.css:99,119`, `_shared/usage-widgets.js:325,486`). Hard at every gate g0–g3: **no build can go green until those four comments are reworded.**

Confirmed exactly: `check_css` 19 undefined custom properties + 13 raw-hex declarations; `check_vocab` 46 matches (all u11-borne, base 0); `check_ids` 5 new duplicates with chrome included and **0 with chrome dropped**, so the handoff's mitigation genuinely works. Caveat the handoff missed: `--wf` resolves only because the payload self-defines it at `u11-prism.html:1416`.

**Two claims refuted, including one of the auditor's own.** The `fonts.googleapis.com` concern is **not a port blocker** — the port drops u11's `<head>`, and PM7 already ships the identical four references at `parts/01-head-prelude.part.html`. And the "`DRY_Rules.md` normalizes command ids to two segments" rule **does not exist**: `:2109-2130` is a dedup/owner-routing table that itself normalizes *toward* three-segment ids, the real rule (`UCC-006`) has no segment cap, the schema regex is unbounded, and 254 of 703 catalog commands carry 3+ segments. `cmd.usage.forecast.request` is therefore admissible; `cmd.provider.usage.open_management` is blocked on genuine DRY grounds because `cmd.nav.open_usage_subject` already owns usage-subject opens.

**The Settings deep-link deliverable terminates in destinations that do not exist.** `settings_inventory.json` has 12 categories and neither `providers` nor `usage` is one — both exist only as subgroups of *different* parents (`providers` under `web`, meaning web-search providers; `usage` under `ai`). `focus_reason`, `usage_and_extra_usage`, `usage_quick_controls`, `see_all` have **zero** occurrences in `Plans/`. The correct canonical identity does exist and must replace the invented envelope: **`F3-434`**, `FinalGUISpec.md:30614-30645`, shape **`open(category, focusSettingId)`**, bound to `cmd.settings.bloom.open` and certified at `Wiring_Matrix.production.json:30116-30123`. A correct port is shaped `open('ai', 'ai.usage.usage-windows')`.

**PlanUnit ids: all ten allocations correct** (UF-092, WS-016, UCC-146, WM-044, DR-038, SP-248, CS-067, MA-071, CBP-030, MS-138), zero gaps in all ten sequences. But `.plan_index/` is **>27 hours stale** and missing CBP-029 and MS-137 — run `python3 scripts/pm-plan-index.py generate` before any port edit.

---

## 10. Decision coverage — all 107 classified

Full per-topic classification with evidence pointers in `DECISION_CLASSIFICATION.json`.

| Classification | Count | Meaning |
|---|---|---|
| demonstrated | 51 | the UI actually shows it working |
| represented | 30 | in data/schema/register/copy, but not demonstrated |
| named-owner-deferred | 13 | deferred to an owner that was verified to exist |
| **missing** | **13** | no evidence found |

**Missing:** `PROV-016` (multi-account isolation strategies), `PROV-018` (OpenCode server distinction), `PROV-022` (capability evidence layers), `CTX-016` (instruction-load metrics), `AGT-003` (Goal route is frozen), `AGT-009`, `AGT-011`, `AGT-013` (cross-project grants — which the packet explicitly requires *of Usage*, so it is not deferrable), `AGT-015`, `AGT-016`, `PRM-012`, `PRM-018`, `MGR-012`.

**48 of 107 `status:"fixed"` values are contradicted.** Examples: `VIS-001` (cutoff text measured, not absent), `VIS-003` (indefinite pulsing at `u11-prism.html:81`), `VIS-004` (the four Slint portability research documents contain zero occurrences of the string "u11"), `PROV-015` (`pm_oauth` on three providers outside the allowlist), `USE-001`, `USE-003`, `USE-004`, `PROC-006`, `PROC-007`, `PROC-009`.

---

## 11. Canonical `UF-088` fixture cross-check

`CANONICAL_FIXTURE_CROSSCHECK.json`. These 13 fixtures are Plans-owned acceptance criteria, are **not** part of the 2026-08-08 packet, and are cited by **no** report in the concept — the concept was not built against them.

- **0 genuine MUST_NOT violations** were detected by literal matching. All four literal hits are substring false positives, itemised (`$0.00` inside a legitimate *plan-included* zero; `success` inside "successful no-op"; `credentials` inside the redaction notice that *satisfies* the fixture).
- **9 of 79 MUST facts** have any equivalent field in the concept's data model; 2 appear literally in the rendered DOM.
- Verdicts: **6 unaddressed**, **7 partially addressed under a different vocabulary**.

The honest reading is *unaddressed*, not *violated* — a vocabulary and scope gap, not dishonest rendering.

---

## 12. Readiness

**Not ready to port. Ready for one more iteration.** Porting now would carry all 7 blockers into `PMConcept7`, and the handoff as written ports `u11-widgets.js` with the inert buttons and the `-1%` rows intact — there is no remediation gate between the findings and the carving plan.

**Must fix before a port is worth starting** (semantics, not polish):
1. B1/B2 — remove policy mutation from Usage; route all five controls to `cmd.settings.bloom.open`; retract the three false register certifications.
2. B3 — declare `counting_semantics` and stop adding `cache_read` into displayed totals; adopt the `SEM` table the page already loads.
3. B4 — make the `-1` sentinel unrepresentable, or suppress on it as well as `null`.
4. B5 — stop collapsing product kinds; never drop a step; label every enum key.
5. B6 — render the underlying route on ineligible Free Models rows.
6. B7 — delete the slash test in `u11-time.js:20`.
7. Rewrite the four `<body>`-in-comment strings, or the port cannot build at all.
8. Make `validate.py` pass, and either produce the ~38 cited artifacts or delete the claims that rest on them.

**Then**, before the port: fix the five nonexistent deferred owners, re-run `pm-plan-index.py generate`, resolve the 19 undefined CSS custom properties and 46 vocab matches, and settle the six owner decisions the handoff leaves open.

---

## 13. Limitations of this audit

Stated because the work under audit failed on exactly this.

- **No accessibility pass beyond keyboard and AX-tree reads.** No screen-reader announcement testing, no contrast measurement. Axis 12 is a first pass, not a WCAG audit.
- **Axis 6 has the weakest evidence base.** 4 of its 8 majors were refuted — a 50% error rate — so its surviving minors deserve less confidence than other axes. Its two most quantitative findings were re-measured and both confirmed.
- **Two internal contradictions were found by the critic and are disclosed, not hidden.** The continuation counts are reconciled in §4/B5. `A04-09` was dropped as refuted while `A08-05` survived asserting the *same true fact* about `ue-609`; the auditor verified the fact directly (`u11-data.js:698` `workId: 'work-4'`; `:312` `work-4` is `kind: 'turn'`), so the refutation was wrong. Both verdicts are recorded.
- **One finding asserted a canonical prohibition it never quoted** (`A03-13`). The rule was located during critic review at `Plans/usage-feature.md:5534`. It was right by luck, and that is a process defect.
- **A withdrawn caveat.** The audit initially cautioned that clipping was measured under fallback font metrics. That is **withdrawn**: CDP proved the rasteriser used JetBrains Mono on the actual clipping nodes over `file://` as well as `http`, `document.fonts.size === 122` in both, and all 39 sweep cells reproduce identically. The "five of eight fonts missing" reading came from `document.fonts.check()`, a wrong oracle.
- **Not measured:** real gate runs at `g3`; `pm-plans-verify.py run-gates`; two drag states (post-resize, post-remove) explicitly *not* called defects; widget-config bucket-filter paths, on which one finding (`A02-09`) rests as code-read inference rather than observed behaviour.
- **Read-only confirmed.** All 80 baseline concept hashes are byte-identical after every pass; no file under `QwenUsageConcept/` has an mtime later than 2026-08-15; `git status` shows no modification to the concept, the packets, `Plans/`, `PMConcept7.html`, or the build trees.

---

## 14. Contents

```
AUDIT_REPORT.md                  this document
FINDINGS.json                    167 surviving + 20 refuted, with evidence and reproduction
DECISION_CLASSIFICATION.json     all 107 decisions classified
CANONICAL_FIXTURE_CROSSCHECK.json  the 13 UF-088 fixtures, token by token
AUDIT_MANIFEST.json              sha256 of deliverables and audited sources
canon/                           the three canon extracts the audit scored against
handoff/HANDOFF_CORRECTIONS.md   measured corrections — read before either handoff
handoff/PORT_HANDOFF_PM7_BUILD_ROUTE.md
handoff/PORT_HANDOFF_PLANS_ROUTE.md
audit-evidence/harness/          18 harness scripts (all re-runnable)
audit-evidence/probes/           34 probe result files
audit-evidence/screenshots/      86 screenshots
remediation-evidence/            per-wave verification of the 2026-08-18 repair
```

---

# Remediation record — 2026-08-18

The user authorized repair of every finding after this audit was delivered. Ten waves ran. This record is
appended rather than edited into the report above, so the audit's original verdict stays readable as
written. Everything below is measured; where it is not, it says so.

## Outcome against the original verdict

The audit's verdict was **"ready for one more iteration, not for the port."** That iteration has now run.

| Measure | At audit | After remediation |
|---|---|---|
| Blockers | 7 | **0** — all fixed and independently re-measured |
| Findings fixed | — | **101** of 167 |
| Partially fixed | — | 27 |
| Not fixed | — | 28 (named explicitly in `FINDINGS.json` `counts.remediation_summary.residual`) |
| No action needed | — | 9 (the verified-clean positives) |
| Concept gate `validate.py` | **fail, 24 issues** | **pass** |
| Concept harness | 80 cases, 80 pass | **90 cases, 90 pass** |
| Real pm6-build checkers (port candidate) | 4 of 9 failing | **9 of 9 pass**, with a passing control |
| `verify_spec_lock` | fail, 26 stale | **pass, 0 stale** |
| `run-gates` | fail, 8 gates | fail, **7 gates** — none regressed |
| UF-088 MUST facts with a canonical field | 9 of 79 | **47 of 79** (38 literal in data, up from 0) |

Status assessment basis: **163 measured, 4 inferred**. The distinction is deliberate — "inferred" means a
wave plausibly covered it and nothing proves that specific finding. Claiming verification nobody performed
is the defect this audit exists to document, so it is not repeated here.

## What remains

**55 findings survive in some form** — 28 not fixed, 27 partially. None is a blocker. The residual set is
enumerated by id in `FINDINGS.json`. The six majors still open, each re-measured and still reproducing:

- `A02-01` — the scope footer still reports removed-account history as current: "All current usage" shows
  54 events / $0.8800 where 52 / $0.2100 are current, and ends with the sentence claiming removed accounts
  never appear there.
- `A04-04` — a turn card still presents one attempt's tokens as the work item's usage (6.2k shown against
  58.3k across four attempts), with no turn total anywhere.
- `A04-08` — mixed-provider work still collapses under a single route.
- `A10-01` / `A01-06` — the Provider-Setup deep link now uses the canonical envelope but still carries no
  provider, CLI, host or environment identity, and the continuation token never reaches the DOM.
- `A11-02` — `cmd.account.select_profile` still fires on a view-filter change.

Also still open and worth naming because they were the audit's own subject matter: the Antigravity
vocabulary (`GUI-CBP-001`, `GUI-CBP-002`) accounts for most of the 29 UF-088 facts still absent everywhere;
`A02-09` is the single finding this pass could **not** assess, because the Ledger bucket filter could not be
driven through its config sheet and guessing was declined.

## Errors this remediation found in the audit itself

1. **`A04-01` (blocker B3) overstated its magnitude and used a wrong example.** Cache read is `additive` for
   Claude and Gemini-family routes per the published semantics table, so `ue-570`'s 85.4k was correct and
   the "181,000 tokens of inflation" figure assumed inclusive-everywhere. Measured true inflation: 108,500,
   in Codex, Kimi and Alibaba. The blocker stood — the renderers ignored the published table entirely — but
   the number and the example were wrong. Caught by the engineer implementing the fix, not by the audit.
2. **A truncated checker list was published as a measurement.** The report gave 13 raw-hex declarations;
   the real count is 21. `pm6-build/checks/check_css.py:82-85` caps its failure list at 40 lines and prints
   "… +N more". Vocab was 51 not 46; undefined properties 19; duplicate ids 6 not 5.
3. **The report undercounted its own evidence** (15/27/80 against 18/34/86).
4. **`A11-03`'s scope was too narrow.** It named `README.md` and `research/INDEX.md`; `FINDINGS.md` carried
   the identical fabricated-evidence defect and was missed. One of its claims was also factually wrong
   ("959 → 752 lines"; the file measures 1007).
5. **`A03-13` asserted a canonical prohibition it never quoted.** The rule exists — `usage-feature.md:5534`,
   GUI-USG-008 — and was located during critic review. It was right by luck.

## Defects the remediation itself introduced

Recorded because a repair that hides its own mistakes is worth no more than the work it repaired.

- **A duplicate id**, from the accessibility pass: two regex substitutions both matched the first pane, so
  `u11-prism.html` carried `id="u11pane-overview"` twice in one tag — a new `check_ids` collision in a file
  the port does carry. The step printed "panes identified: 14" against 13 panes; that tell was explained
  away rather than investigated. Only the real gate caught it.
- **A currency bug**, from the blocker-1 rewrite: the read-only settings sheet dropped the `/1e6` the
  editable version had, rendering a $100 cap as `$100000000.00`. Found by verification, not review.
- **A worse layout regression than the one being fixed**: the renderer wave turned the Ledger cost column
  into a second collapsible track, so below 768px **98** strings rendered at zero width — up from the 42 the
  audit measured — and what disappeared was precisely the cost-honesty copy the wave existed to add. The
  wave's own new guard missed it because the harness floor was 900px. Fixed, with a negative control
  proving the guard now fails on the pre-fix CSS.
- **A fabricated register entry, by the auditor.** Adding three undeclared storage keys was scripted by
  cloning an existing entry and substituting the key name. It produced valid JSON asserting that all three
  keys held "view state of the Usage settings sheet" — false — plus three duplicate top-level entries. The
  draft was discarded and rewritten from the measured call sites. This is the audit's own subject matter
  reproduced by its author.
- **An invalid JSON evidence file, by the auditor**: the W0 baseline was saved by copying a log to a
  `.json` name, making an audit artifact one of the `json_syntax` gate's 15 failures. Split into a `.txt`
  log and a valid `.json` result.

## Two inconsistencies the repair left behind

- `candidate-command-delta.json` states that `cmd.nav.open_usage_subject` "is dispatched nowhere in u11";
  `u11-rundetail.js:787` dispatches it and it was observed firing. Logged under `A11-07`.
- `plan-owner-delta.md` row 19 certifies the installation lifecycle on "affected-connections fields on
  ops-1"; `affectedConnections` is not a key on `ops-1`. Logged under `A08-01`.

## Readiness now

**Port-ready, with a named residual set.** All nine real `pm6-build` checkers pass for the port-shaped
candidate against a passing control, the concept gate passes, the harness is green at 90 cases, and the
Plans canon is landed with `verify_spec_lock` clean. The port itself was deliberately not performed — the
user chose stop-at-port-ready, so `pm6-build/parts/**`, `PMConcept6.html`, `BASE_SHA` and `PMConcept7.html`
are untouched.

Before the port runs, someone should decide whether the six open majors are port-blocking or
port-tolerable. This remediation did not make that call, because it is a product decision rather than an
engineering one.

---

# Second remediation — 2026-08-18

The first remediation left 55 findings open. The user asked for all of them closed. This records the
result, including what this pass broke on its way there.

## Outcome

| Measure | At audit | After first pass | **Now** |
|---|---|---|---|
| Blockers | 7 | 0 | **0** |
| Findings fixed | — | 101 | **146** of 167 |
| Partially fixed | — | 27 | 9 |
| Not fixed | — | 28 | **2** |
| Genuinely open (residual) | 167 | 56 | **11** |
| Concept gate | fail, 24 issues | pass | **pass** |
| Concept harness | 80 cases | 90 | **110 cases, 110 pass** |
| Real pm6-build checkers | 4 of 9 failing | 9 pass | **9 pass**, control passing |
| `run-gates` | 8 failing | 7 | **7**, none regressed |
| `verify_spec_lock` | fail, 26 stale | pass | **pass** |
| UF-088 MUST facts represented | 9 of 79 | 47 | **62 of 79** (63 counting data-attributes) |

**The harness is the durable part.** It grew from 80 to 110 cases, and the 21 cases added last are each
negative-controlled — the guarded behaviour was broken in a scratch copy and the case confirmed red before
being kept. That matters because twice in this concept's history a repair silently broke something while
the suite stayed green.

## The measured/inferred split, and why it moved the wrong way on purpose

Status basis is now **64 measured, 103 inferred** — down from 163 measured after the first pass. That is
not a regression in rigour, it is the correction of one. The first pass's evidence files predate the
second: `u11-data.js`, `u11-widgets.js`, `u11-widgets.css`, `u11-context.js` and `u11-rundetail.js` were
all rewritten afterwards. A measurement of a build that no longer exists is history, not a claim about the
current state, so 103 findings were honestly downgraded to `inferred-from-wave` rather than carrying
forward a number that had stopped being true. 64 were re-verified live against the current build.

## What is genuinely still open — 11

One major, nine minor, one info, each named by id in `FINDINGS.json`:

- `A08-04` — the stale-continuation step of the provider-CLI adjudication is still unrepresented; the
  continuation token is dispatched but renders nowhere.
- `A08-08` / `A10-11` — the reconnect CTA now dispatches, but a raw event id still appears in prose.
- `A10-08` — the 27 widget affordances open a sheet rather than being deep links in their own right.
- `A10-14` — 11 of 20 fixture claims are still backed by in-memory assertions rather than a render check.
- `A09-09` — date ranges, tables and graphs remain thinner than the preserved-feature list requires.
- `A09-12` — the font CDN, kept deliberately (PM7 ships the identical references) with the degradation now
  declared rather than silent.
- `A05-17`, `A03-16`, `A07-09`, `A11-22` — each disclosed rather than hidden; `A11-22` is not repairable
  from inside the concept at all, because `expected_event_types` lives in `Plans/` and the Event Authority
  denominator is `UNKNOWN_OPEN`.

## What this pass broke, and what that says

Seven more self-inflicted defects, all now closed, bringing the ledger to **13 items, 13 fixed**. They are
kept out of the finding totals on purpose, so self-inflicted damage can never be absorbed into the audit's
numbers. The instructive ones:

- **39 raw-enum tooltips.** The CBP-027 work moved canonical field names into `title` attributes, which
  satisfied the harness guard because that guard walks *text nodes*. A title renders as a tooltip, so it is
  user-visible text. The work went through a hole in the guard rather than through the rule. Fixed by
  splitting the concerns: raw pairs into `data-u11-fields` (queryable, never rendered), tooltips in prose.
- **A fix that produced the opposite defect.** Making the historical group render at all made it render in
  *every* scope, so a removed OpenAI account appeared inside a Claude-only view — byte-identical across
  scopes, which is what proved it unfiltered.
- **`check_vocab` hard-failed the port gate** with four matches, two of them user-visible strings, entering
  with the CBP-027 wave. Invisible to the concept's own harness, which does not run the build checkers —
  the same shape as the Ledger column regression: a defect only a gate *outside* the suite could see.

## A note on measurement

Three of this engagement's false signals came from bad probes, not bad code: `offsetParent` used to test
`visibility:hidden`; a `title` required on a leaf when an ancestor carried it; and a guard reading
`document.body.innerText` without navigating to the room under test. Add the audit's own overstated
181,000-token figure and its truncated raw-hex count, and bad measurement produced roughly as many false
findings as bad code did.

The discipline that caught each was the same: when a measurement disagrees with the code, check the
measurement before believing either. That is worth more than any individual fix in this record.

## Readiness

**Port-ready.** All nine real `pm6-build` checkers pass for the port-shaped candidate against a passing
control, `assemble.py --gate g2` returns PASS, the concept gate passes, the harness is green at 110 cases,
and the Plans canon is landed with `verify_spec_lock` clean. The port itself was deliberately not
performed: `pm6-build/parts/**`, `PMConcept6.html`, `BASE_SHA` and `PMConcept7.html` are untouched, and
`--gate g3` was never used.

---

## Fourth pass — the two guards that failed, 2026-08-18

The third pass closed nine findings and then added four guards to hold them closed. Two of those guards
failed on the next run, and they failed for opposite reasons — which is the useful part of this record.

**The gauge guard was wrong and the code was right.** It asserted that `document.body.innerText` contained
the string `21%`. It does not, and never did: `valHTML` puts the number in a `<b>` and the unit in an `<i>`,
so the laid-out copy yields `21` and `%` across an element boundary. The two percentages that *are* in the
text — `80%` and `62%` — are the warn threshold and a deliberate counterfactual explaining why plan-included
valuation is excluded. My closure evidence had also quoted a track label reading `billed money 21%`, a string
that does not exist. The fix was sound; the sentence I wrote about it was not. The guard now asserts
`data-fill`, the track geometry and the rendered value text against the billed figure, and it is proven to
fail via `PM_FAULT=gauge`.

Replacing it produced a second error of the same family: the first rewrite took the first matching
`.u11w-mrow`, and this widget renders into three panes of which only one is laid out, so it measured a hidden
copy with a zero-width track. Scoping to the visible copy is not fussiness — measuring hidden copies is how
four earlier false findings in this engagement were manufactured.

**The id guard was right to fail, but not for the reason it reported.** Its six hits were the lineage block's
labelled identity row: the regex required `see|ref|event` before the id, and `\s+` spans newlines, so
`This event` + newline + `ue-615` matched. The actual defect was elsewhere and the guard could not see it,
because it swept 6 of 13 rooms, read only `innerText`, and depended on drawers a previous case happened to
leave open. Eight real sites were then found and fixed: a bare-id parenthetical in the free room, `eventLink`
defaulting its visible label to the id — so the third pass's own repair turned "see ue-610" into a link that
still read "see ue-610" — two tooltips carrying dedupe keys and snapshot ids, three sentences, and a card
header naming a record by its internal id instead of by the human title the record already carries.

**What was deliberately kept.** An id that is the entire text of its element, or the value of a labelled
key/value row, stays: the ledger's id column beside its `inspect` button, and `This event / ue-615`. Those
are identity displays on Advanced detail surfaces, not prose, and an event ledger showing event ids is the
conventional and useful thing. The finding was about a dead end inside a sentence. The exemption is
structural — the id must be the whole text of its element, or a labelled sibling must name it — so it cannot
quietly widen to excuse whatever the code happens to do. This is recorded as a scoping decision, not a
closure.

## The defect this pass introduced, and why the control caught it

The structural exemption compared the element's text against the **text node** rather than against the
matched identifier. Any element with a single text node was therefore exempt — very nearly all of them. The
guard was inert, and it returned a clean `114 pass · 0 fail` that meant nothing.

What caught it was the negative control added in the same pass: `PM_FAULT=idprose` injects a sentence reading
`see ue-610`, and the suite still came back green. Correcting the predicate immediately surfaced two further
real defects that the inert version had been silently passing.

The lesson is narrow and worth stating plainly: the guard written to catch a false closure was itself a false
closure, and only a control could tell the difference. No in-file control mechanism existed in this harness
before — the earlier "negative-controlled" cases were controlled by hand during development, which leaves
nothing a later reader can re-run. `PM_FAULT` is now in `u11-verify.mjs`, so the claim that a guard can fail
is reproducible rather than asserted. `PM_DUMP_IDS` is there for the same reason: the bare occurrence count
the old guard printed sent this investigation down a wrong path before the real sites were found.

## Readiness after the fourth pass

- Harness **114 pass · 0 fail**, `PM_DUMP_IDS` dump empty.
- Both controls verified: each turns **only** its own case red. `PM_FAULT=idprose` reports only the injected
  sentence, so the identity-display exemption is not blinding the guard to real prose.
- Nine real `pm6-build` checkers **PASS** for the port-shaped candidate with the base control passing —
  including `check_vocab` and `check_no_emoji`, which matters because this pass wrote new user-visible copy
  and an earlier pass regressed `check_vocab` doing exactly that. The `cand-B` `check_ids` failure is
  byte-identical to the pre-existing one and is not caused by this work.
- `run-gates` 19 of 26 passing, 7 failing — the engagement's stated ceiling. `verify_spec_lock`,
  `check_shards`, `validate_usage_gui_fixtures`, `validate_usage_contract_drift` and
  `validate_wiring_matrix` all green.
- Still port-ready, and the port is still not performed: `pm6-build/parts/**`, `PMConcept6.html`, `BASE_SHA`
  and `PMConcept7.html` untouched, `--gate g3` never used.

Two findings remain open by choice, not by omission: **A10-14** (11 of 20 fixtures data-asserted rather than
DOM-asserted — disclosed in the register rather than counted as done) and **A09-09** (a breadth requirement
with no defined finish line, where adding surfaces to raise a count would be padding). **A11-22** remains
named-owner-deferred because no usage-related event family exists and the rules forbid inferring one.
