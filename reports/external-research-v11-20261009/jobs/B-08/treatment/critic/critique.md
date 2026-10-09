# I08 critic — full criticism of B-08/treatment/research draft (M15 v1)

Block B-08 / treatment / critic / case I08 / method M15 v1 fresh-factored-verification-with-full-criticism.
Brief: `cases/I08/brief.md` (I08 band instrument lending + repair coordination).
Predecessors inspected COMPLETE: `research/draft.md` (§§1–9), `research/discovery.md` (§§0–7),
`research/source-map.json` (S01–S14), `research/revealed-plan.md` (P1–P6),
`research/verification-questions.md` (Q1–Q3), `research/sources/evidence.md` + `index.md`.
Verifier source root (`treatment/verifier/sources`) did not exist at critic access time; parallel stage, not read.
Critic access window: 2026-10-09T21:12:00Z/2026-10-09T21:16:00Z. No runtime available; no code executed;
all critic checks are documentation reads (see `source-map.json` C01–C11, `sources/evidence.md`).
Usage/billing: null where unobserved.

## 0. Verdict

The draft is strong and its primary recommendation (Grist pilot + asynchronous bilingual notifier +
deferred identity broker) survives criticism: every load-bearing factual claim I re-checked held
against independent primary sources, in several cases with *stronger* evidence than the draft cited.
No P disposition requires reversal. No rejection is false. Two uncertainties are overstated and must be
narrowed (Lend-Engine i18n exists at site level; Authentik no-Redis is officially confirmed, not merely
reported). The material findings below are: source-provenance upgrades (3), scoping/consistency repairs
(3), underspecified build requirements (3), ungrounded assertions to preserve as uncertain (3), and
validation-applicability notes (2). Minor findings are editorial or drift notes. The reviser should apply
the material findings; none changes the primary path or any already-covered intent.

## 1. Material findings

### M1. n8n pricing/execution claims hold, but S12 provenance is non-primary — upgrade source, note EUR/USD drift

Draft `discovery.md` A8/O2-7 and `draft.md` §4 Infra-B claim: self-hosted Community unlimited
executions; Cloud Starter ~2,500 executions, Pro ~10,000; paid plans unlimited users/workflows;
free internal self-host business use with resale/embedding restrictions.
Draft source S12 is `gizmodo.com/best-web-hosting/self-host-n8n` (a hosting-affiliate guide) plus a
random GitHub study-pack companion — neither is an official n8n primary source.

Independent check (C06) confirms the numbers across multiple 2026 sources: Community free with
unlimited executions; Starter 2,500, Pro 10,000; unlimited users/workflows on paid plans
(cloudzero 2026-09, dev.to Oct 2026 citing n8n.io/pricing, instapods, deskferry). The gizmodo guide
itself states the same numbers, so the draft's figures are not wrong — but the citation must be
upgraded to official `n8n.io/pricing` + license docs at build freeze.

Drift note: current sources quote EUR (€20/€50 annual; €24/€60 monthly) where the draft says
$20/$50. n8n is a German company billing in EUR; USD figures are stale or converted. The V8 cost
probe must re-verify currency and annual-vs-monthly at procurement. Conclusion stands; source does not.

### M2. NocoDB gating correction C-P2b is CORRECT — and independently upgradable from opinion to official docs

C-P2b (do not use community NocoDB for P2 minimization without paid license) is the draft's most
consequential correction, and the draft grounds the gating half in a community forum thread
(S06 companion, mutable opinion). That is weaker than necessary.

Independent check against official docs (C05 `nocodb.com/docs/self-hosting/purchase-license`):
Business includes SSO, table- and field-level permissions, teams; Scale includes all of Business
plus audit logs, row-level security, team hierarchy. Corroborated by a 2026 comparison guide (C11).
C-P2b therefore stands on official product documentation, not forum opinion. The reviser should
re-cite C-P2b to the official license page.

Preserved uncertainty: list prices for Business/Scale self-hosted licenses remain unobserved
(U-P2b stands). Community token defaults (all-resources, never expire, show-once, SHA-256) were not
independently re-fetched by the critic (time); Q1 routes them to the verifier, which is the right
coverage. Do not soften C-P2b; strengthen its citation.

### M3. Authentik no-Redis claim is officially confirmed — retire the "reported" hedge, keep build-freeze pin

Draft O3-d/U-P6 hedge the 2025.10 Redis removal as "reported" from a third-party guide (S09
`selfhosting.sh`), requiring re-verification. Independent check (C07) finds official confirmation:
`goauthentik.io/blog/2025-10-28-authentik-version-2025-10` (Redis removal: caching + WebSocket moved
to Postgres, fully removing the need for Redis) and `goauthentik.io/blog/2025-11-13-we-removed-redis`
(full migration timeline 2024.6→2025.10), plus the 2025.10 release notes. Minimum stack is now
server + worker + PostgreSQL.

The reviser should upgrade O3-d from "reported, re-verify" to "officially confirmed in 2025.10
release/blog; re-pin exact build version at freeze". U-P6's version-pin half (which exact 2025.10.x+
to pin) remains valid — do not retire the whole uncertainty, only the existence question.
Drift note from the same search: 2025.12 moved local storage from `/media` to `/data`
(C07). The broker runbook (C-P6a) must pin paths to the frozen version, not to guide text.

### M4. ERPNext fully-depreciated repair fix O3-a confirmed verbatim — holds; watch PR-number confusion

Draft O3-a claims releases v15.117.0/v16.28.0 (PRs 57110/57077) allow Asset Repair for fully
depreciated assets with Capitalize Repair Cost locked and no value/life change. Independent fetch of
the v15.117.0 release page (C03) returns the sentence verbatim, including the (#57110) link. O3-a
holds exactly as written; Q3 routes it to the verifier, which is correct.

Caution for the reviser: the same search surfaced PR 55276 with a near-identical title
("fix(asset): allow asset repair creation for fully depreciated assets", C04). The v15.117.0 notes
cite 57110, so the draft's number is the release-credited one, but the existence of a second
similarly-titled PR means the V7 probe must test *behavior* (submit succeeds, capitalize locked, no
value/life change) on the frozen version, not assert a PR number. If the v16 line is chosen, V7 must
run against v16.28.0 explicitly — the critic verified only the v15.117.0 page (time).

### M5. Snipe-IT attachment gap O3-b confirmed open — holds; but C-P1b universalizes Snipe-IT-specific behavior

Independent check (C02) confirms issue `grokability/snipe-it#19174` is real and open as described:
checkout/checkin APIs are text-only and `POST .../uploads` attaches globally to the asset, with the
per-event link lost on frequent checkouts. U-P1 and the "do not promise per-event photo pinning on
that path" consequence hold. Q2 routes this to the verifier correctly.

However, C-P1b states as a universal required correction that "an Archived-equivalent state must
never be used for active repairs or items vanish from queues". That vanish-from-queues behavior is a
Snipe-IT status-meta-type property (S01/C02 context: Archived shows only in Archived view). The
primary recommendation is Grist, which has no Archived view — in Grist an "archived" flag is just a
value the queues filter on, with no framework-imposed invisibility. The correction is valid *for the
asset-lifecycle path* but mis-scoped as a cross-path invariant. The reviser must scope the
Archived sentence to Alternative 1 (Snipe-IT style) and restate the Grist equivalent as a queue-filter
convention ("excluded-from-queue flags must be explicit in every queue/filter/export definition"),
which V2 already tests.

State-name inconsistency (same correction): §2.1 defines six states
(Intake, Diagnosed, Waiting-for-Parts, In-Repair, Ready-for-Pickup, Closed) but C-P1b introduces
"Diagnosed-awaiting-decision" as a blocking state. Reconcile: either fold it into Diagnosed (with a
decision sub-flag) or make it a seventh state. V2's transition script must use the reconciled names.

### M6. Lend-Engine bilingual uncertainty U-P3 is overstated AND the draft omits scale caps — narrow U-P3, add caps

Draft U-P3: "whether the hosted lending-service natively supports two-locale message templates and
per-caregiver locale selection. No captured page confirms it." The second sentence was true of the
draft's capture but is no longer the right uncertainty. Independent live fetch of
`lend-engine.com/pricing` (C09) shows language rows in the tier matrix ("Choose language for member
site", "Member personal choice of language", "Content (eg item) translation") and the site nav lists
`/features/languages`, a page the draft never captured.

The reviser must narrow U-P3: site/member-portal language choice EXISTS; what remains unconfirmed is
specifically (a) per-caregiver message-template locale selection for delay/reminder notices,
(b) template fallback behavior, and (c) reminder idempotency. The validation for the Lend-Engine path
must read `/features/languages` + reminder/message-template docs, not re-ask whether any language
support exists.

Omission in the same fetch: the tier matrix caps items AND contacts (Free 100 / Starter 500 /
Plus 2,000 / Business 10,000) and sites (1 / 1 / 10 / 30), with unlimited loans/mo on all tiers
(C09). The draft cites "unlimited loans" and $150–$600/yr fit but never mentions item/contact/site
caps. For nine schools, Starter (1 site, 500 items) is almost certainly insufficient — Plus
($25/mo, 10 sites, 2,000 items) is the plausible nine-school tier, still within $8k/yr but a
different line item, and instrument+student-contact counts must be checked against 2,000. The V8 cost
probe must include cap headroom, not just the annual fee.

### M7. "Audit who viewed caregiver contact" (P2 retained conditions) is ungrounded for Grist Core self-host

Draft §3 P2 retained conditions require auditing who viewed caregiver contact. No source in S01–S14
establishes that self-hosted Grist Core provides per-row *read* audit. What the sources do establish
(C01, re-confirmed live): access rules enforce visibility down to tables/columns (cell conditions via
`user.*` + row values), Editors lose structure rights when rules are on, and the `S` permission
bypasses other rules because formulas are not sandboxed. Enforcement is proven; read-audit is not
mentioned anywhere in the cited material.

This matters because audit is listed alongside release-blocking redaction conditions. The reviser
must either (a) verify Grist audit capability against primary docs for the frozen deployment (noting
it may be managed/enterprise-gated) and keep the requirement, or (b) downgrade "audit reads" to
"authorship/timestamp columns + delivery-log coverage" (writes and notifications audited; reads
enforced but not logged) and record the residual risk for the district. Do not silently keep an
unverifiable audit promise. V1 (redaction probe) tests enforcement, not audit — a distinct audit
check is needed if (a) is chosen.

### M8. C-P6a local+MFA+runbook identity is underspecified at its hardest point: MFA recovery without a help desk

C-P6a correctly treats unfunded SSO as a validation gate and ships local accounts + MFA + a
liaison-executable printed runbook. But the summer-closure failure mode for this design is MFA
itself: teacher loses/breaks phone, TOTP enrollments need reset, and the one person who can reset
them is the liaison following paper. The draft lists runbook contents ("password resets, break-glass
admin, backup/restore, session handling") without MFA-reset procedure, break-glass credential custody
(sealed envelope? safe? rotation?), session lifetimes that must bridge the closure, or the
provisioning burden of many teacher accounts on two staff + a part-timer.

This does not overturn C-P6a — local-first remains the right unfunded call — but the reviser must
extend C-P6a with: (i) MFA-reset path executable by the liaison alone (and its abuse guard),
(ii) break-glass admin custody + rotation, (iii) session/token lifetimes vs closure length,
(iv) account-provisioning effort estimate. V4 must explicitly include an MFA-loss recovery drill,
not just "break-glass admin works". The broker alternative (E-P6a) inherits the same critique with
higher stakes (IdP outage = total lockout), which the draft already states — that asymmetry is
correct and preserved.

### M9. P4 exit criteria invent an SLA the brief never sets — label it as proposed, not required

E-P4c gates expansion on "teacher urgent-report to coordinator triage completed within one school day
in the pilot". The brief says teachers record urgent issues during class and handoffs must be clear;
it sets no triage latency. A one-school-day target is a reasonable *proposed* service objective, but
presenting it inside must-pass exit criteria promotes an investigator invention to a district
requirement. The reviser must label the latency figure as a proposed default for district
confirmation (or move it to V4 as a measurement with a TBD threshold). The other exit criteria
(overdue detection correct for two weeks; waiting-for-parts vs ready-for-pickup never confused;
redaction probe clean; large-print pass; unaided backup/restore) are legitimate operationalizations
of brief constraints — keep. "Overdue detection fired correctly" should cite V3 as its definition.

### M10. "$8k fit" for the primary is asserted, not itemized — preserve as uncertain until V8

The draft states the primary "fits the $8,000 annual cap as self-hosted software plus server and
backup costs" (§2.1) while$s own source-map records hosting/backup/admin-hours pricing as
unobserved/null across S01–S13. List prices ARE captured for Lend-Engine ($150–$600/yr, C09
re-confirmed) and n8n Cloud ($240/yr Starter, M1), but the primary's actual stack (VPS/VM, domain,
certificates, backup storage, admin hours, print) has no itemized estimate from any primary hosting
or backup pricing source. A self-host fit claim without a single hosting price is an assertion, not
a finding.

The reviser must downgrade "fits $8k" to "expected to fit; pending V8 itemized TCO" for every path,
primary included. Two related soft spots: (a) the ERPNext alternative "fits only with existing
infrastructure or a small server plus volunteer admin" — volunteer admin is not a budget line and
evaporates in summer; cost it or drop the clause; (b) M6's site/item caps may force Plus over
Starter on the hosted path — V8 must use capped tiers. V8 itself is well-designed (12-month TCO at
nine-school scale with year-two renewal headroom); the flaw is pre-claiming its result.

### M11. C-P3a accessibility requirements are reasonable but cite no primary accessibility source

C-P3a imposes a sound buildable standard (relative type units, 200% zoom reflow without clipped text
or horizontal scrolling on the three core tasks, visible focus, keyboard-only operability, sufficient
contrast) and discovery O2-8 invokes WCAG 1.4.4/1.4.10/1.4.12 — but no WCAG text, product
accessibility doc, or assistive-technology source appears in S01–S14. The "no captured product
provides a distinct large-print mode" claim is accurately scoped to the capture ("no captured
product"), yet without a single accessibility primary source the critic cannot confirm the negative
beyond the captured pages, and neither could the draft.

Action: the reviser should either add one primary accessibility source (WCAG 2.x reflow/text-resize
criteria) grounding the 200%/reflow/focus/keyboard list, or explicitly label C-P3a as an adopted
design standard rather than observed product behavior. Either way V5 (OS large text + 200% zoom on
schedule/queue/form, no clipping, visible focus, keyboard-only completion) is the right probe and is
preserved. Do not weaken the acceptance gate; ground it or label it.

### M12. Bilingual idempotency (C-P3b) states the invariant without the mechanism

C-P3b requires duplicate suppression ("one overdue loan notified once per cycle unless state
changes") with locale fallback + human flag. The invariant is right; the mechanism is missing:
dedupe key (loan + cycle? loan + state-hash?), delivery-log schema, what counts as a "state change"
that re-arms notification (return-date edit? repair transition? locale fix?), and how a retry crash
mid-batch avoids partial duplicates. V3 tests exactly-once-per-cycle, correct locale, no duplicate on
rerun, and fallback-with-flag — so the gap is build-design, not validation-design. The reviser should
add the dedupe-key/log-schema/state-change definition to §2.1's notifier paragraph (one or two
sentences) so two implementers would build the same thing. Minor in severity, included here because
exactly-once is the easiest requirement to test-pass and field-fail.

### M13. O1 "only low-code mechanism found here" is honest scoping that needs one sentence of exclusion rationale

Draft §2.2: Grist's per-row/column/cell rules are "the only low-code mechanism found here" meeting
P2 without a paid tier. "Found here" is honest — the discovery set (Snipe-IT, Lend-Engine, Grist,
NocoDB, ERPNext, Authentik, PowerSync, n8n) is explicit and the claim is bounded by it. The gap:
Baserow and Directus — the two most obvious low-code competitors for field/row permissions — are
never investigated (Directus appears once, in passing, in discovery §A4's cost line). A district
reader cannot tell whether they were excluded for cause (license gating like NocoDB's? time-box?) or
overlooked.

This is not a demand for two more full investigations in the reviser. One sentence suffices:
either the known license/permission reason for exclusion with a source, or an explicit "not
investigated in this time-box; V1 redaction probe is product-agnostic and would discriminate them".
Without that sentence the "only" reads stronger than the search. (C11's Baserow-vs-NocoDB guide
exists as a starting point if the reviser wants it; the critic did not deep-dive it.)

### M14. Factored-verification coverage gap: Q1–Q3 test P1/P2 challengers, not the primary path's load-bearing claims

The three verification questions are neutral, answer-free, and consequential — Q1 (NocoDB
Community-vs-licensed capabilities), Q2 (Snipe-IT checkout/checkin fields + upload attachment
scope), Q3 (ERPNext fully-depreciated repair rules). All three are well-chosen from the complete
draft. But all three test *challenger/alternative* claims. None tests the primary path's
load-bearing mechanisms: Grist cell-level rules on `user.*` + row values, the `S`-bypass prohibition,
Home-vs-Document authorization split, or the webhook allowlist — the exact machinery P2 minimization
depends on.

Method M15 caps the investigator at three questions, so this is a structural observation, not an
investigator fault, and the critic's own live re-fetch (C01) independently confirms the Grist
mechanics, partially closing the gap. The reviser should note the gap and treat C01 as its
mitigation (or route one Grist-rules question to any follow-on verification). Do not rewrite Q1–Q3;
they are valid as far as they go.

## 2. Per-P disposition audit (every P, every disposition class)

- P1 (assignment/issue/repair-state/expected-return/availability): intent already-covered — AGREE.
  C-P1a (explicit repair enumeration incl. Waiting-for-Parts/Ready-for-Pickup with blocking/handoff
  semantics) — AGREE, this is the brief's core pain. C-P1b (derived availability, exclusivity) —
  AGREE in substance; APPLY M5 scoping repair (Archived sentence → asset-lifecycle path only) and
  state-name reconciliation. C-P1c (expected return = loan date; overdue computed server-side) —
  AGREE. E-P1a (barcode/QR labels, identifier-only) — AGREE, compatible. E-P1b (parts-aware repair
  on ERPNext path incl. planned-vs-failure distinction) — AGREE, correctly conditional. U-P1
  (per-event attachment pinning gap on asset path) — AGREE, confirmed open (C02). R-P1 (free-text
  status column) — AGREE, rejection stands; it repeats the binder failure.
- P2 (minimization to handoff-necessary staff): intent already-covered — AGREE. C-P2a (content-rule
  enforcement, not UI hiding) — AGREE, load-bearing and correctly required. C-P2b (NocoDB community
  unsuitable without license) — AGREE on stronger evidence (M2); re-cite to official docs. U-P2a
  (portal field redaction on ERPNext/lending paths) — AGREE, genuinely unobserved; V9 is the right
  probe. U-P2b (license cost/retention drift) — AGREE, still unobserved. R-P2 (shared login; hidden
  columns) — AGREE, both rejections stand (audit destruction; API/export bypass). ADD M7: audit-reads
  requirement needs grounding or downgrade.
- P3 (large-print + two languages): intent already-covered — AGREE, correctly release-blocking.
  C-P3a (platform large-print standard) — AGREE in substance; APPLY M11 (ground or label).
  C-P3b (human-reviewed templates by locale + fallback + idempotent logging) — AGREE; APPLY M12
  (add mechanism). U-P3 (hosted-service bilingual behavior) — NARROW per M6 (site i18n exists;
  message-template locale + idempotency remain). R-P3 (machine translation at send time) — AGREE,
  rejection stands for return-date/pickup/liability language.
- P4 (pilot: one room + selected schools): already-covered, no correction — AGREE. E-P4a (per-location
  pilot flags + unavailable repair locations) — AGREE. E-P4b (transfer/handoff log gating expansion)
  — AGREE, this operationalizes "expand only if handoffs are clear". E-P4c (exit criteria) — AGREE
  except APPLY M9 (label one-school-day triage SLA as proposed default). R-P4 (nine-school big-bang)
  — AGREE, rejection stands. Uncertainty "none material on direction" — AGREE; scale costs correctly
  deferred to V8 (M10 sharpens what V8 must include: caps + itemized self-host TCO).
- P5 (replacement approval + caregiver direct reporting undecided): user decision on both — AGREE,
  both branches preserved with consequences. D-P5a (coordinator/staff vs program-owner approver as
  approval role + request states) — AGREE; interim-approver-documented-as-interim is the right pilot
  handling. D-P5b (closed vs scoped-portal reporting with triage gate) — AGREE; preserved ramo.
  "No uncertainty beyond the district's pending choice" is slightly too clean (portal-redaction and
  bilingual-form validation load if Branch 2 opens later), but the draft does condition reopening on
  re-running V9 + bilingual-form probe — sufficient; no change beyond emphasizing that condition.
  No rejection — AGREE.
- P6 (sign-in/integration unfunded): already-covered — AGREE. C-P6a (unfunded = validation gate;
  local+MFA+runbook pilot) — AGREE in direction; APPLY M8 (MFA-reset path, break-glass custody,
  session lifetimes, provisioning effort). E-P6a (broker path with summer-ops cost) — AGREE as
  conditional-only; APPLY M3 (upgrade Redis-removal evidence to official; pin paths/version at
  freeze). U-P6 (provider type, claim set, bind-vs-token, version pin) — AGREE, genuinely pending;
  narrow to drop the Redis-existence question (M3). R-P6 (roster/grade/discipline sync, paid
  directory SKU in pilot) — AGREE, rejection stands (unfunded + anti-minimization).

No false corrections found. No false rejections found. Two corrections need re-scoping/labeling
(C-P1b, C-P6a), one uncertainty needs narrowing (U-P3), one needs narrowing the other way (U-P6
shrinks as M3 confirms), and three retained conditions need grounding (audit M7, a11y M11, cost M10).

## 3. Discovery / alternatives challenge

- A1 Snipe-IT: exclusivity + status-meta-type + identifier mapping fairly stated; API text-only limit
  + global-upload gap confirmed open (C02). Field-level redaction correctly marked unproven. Keep.
- A2 Lend-Engine: lending-native fit fairly stated; pricing re-confirmed (C09: Free/Starter $12.50/
  Plus $25/Business $50, unlimited loans/mo). APPLY M6: add item/contact/site caps + narrow i18n
  uncertainty; Plus is the plausible nine-school tier. SaaS-during-closure caveat + export/offline
  fallback requirement stands.
- A3 Grist: cell/column/table rules on `user.*` + values re-confirmed live (C01), including the
  S-bypass warning nearly verbatim. Home-vs-Document split and webhook allowlist not re-fetched by
  the critic (time) — preserved as stated, low risk given C01's confirmation of the surrounding
  mechanics. Managed free API cap (3,000/mo/team, S13 newsletter) not re-verified — preserved as
  mutable. Keep as primary; APPLY M7 (audit) + M13 (exclusion sentence).
- A4 NocoDB: decisive gating claim upgraded to official docs by this critique (M2). Token-default
  claims preserved for verifier (Q1). Keep as rejected-for-P2-unless-licensed.
- A5 ERPNext: planned-vs-failure distinction, parts/downtime/capitalization, Issue→Repair triage
  preserved as stated (docs not re-fetched; low risk — O3-a verbatim confirmation (C03) corroborates
  the surrounding repair-doc reading). Downtime minutes-vs-hours unit claim not re-verified — keep
  with V7/unit-check validation. Portal field-redaction caveat (U-P2a) correctly retained.
- A6 Authentik: broker topology + failure modes fairly stated; Redis-removal upgraded to official
  (M3). LDAP/SAML field details (S09 companions) not re-fetched — preserved; V6 tests them. Summer
  critical-path warning is correct and must stay prominent.
- A7 PowerSync: upload-buffering caveat confirmed via docs reference (C08: uploadData only while sync
  stream connected; queue buffers; preview E2E covers local-only). No-P2P-LAN limit and sync-rules
  security boundary preserved as stated. "Online form + queued outbox suffices for most pilots" is a
  reasonable engineering judgment, correctly labeled as the cheaper alternative. Keep.
- A8 n8n: batching + template-i18n honesty + SMS-unobserved all stand; APPLY M1 (official source,
  EUR drift). License "free internal self-host business use" preserved as stated (fair-code license
  mention corroborated in C06 snippets); MSP-resale restriction preserved.
- Omitted alternatives: Baserow/Directus (M13, minor); PouchDB/CouchDB named as cheaper offline
  alternative without deep-dive (acceptable — PowerSync already covers the offline branch, and the
  draft recommends the simpler outbox first). No material omission that would change the primary.

## 4. Validation applicability (O6)

- Executed E1–E8: honestly scoped as doc reads 2026-10-09T21:00–21:10Z with no code/run/login/a11y
  tooling. The critic spot-confirmed five of the eight areas against independent sources (Grist rules,
  Snipe-IT gap, NocoDB gating, ERPNext release, Authentik removal, PowerSync upload, n8n pricing,
  Lend-Engine pricing — eight, counting the split). No executed check is misreported. Keep.
- V1 redaction probe: discriminating and correctly designed (cross-school + contact-visibility axes).
  ADD: it tests enforcement, not read-audit (M7) — pair with an audit check if audit stays required.
- V2 repair-state probe: discriminating; APPLY reconciled state names (M5) and run per chosen path
  (Grist file-column vs lending-service upload vs ERPNext attachment).
- V3 bilingual probe: discriminating (two locales, batching, idempotency, fallback+flag). APPLY M12
  mechanism definition so the probe has a spec to test against.
- V4 summer-closure probe: discriminating; APPLY M8 MFA-loss drill explicitly.
- V5 large-print probe: the right probe (OS large text + 200% zoom, three core screens, focus,
  keyboard-only); APPLY M11 grounding so pass/fail thresholds are citable.
- V6 broker probe (conditional): comprehensive (federation, token/assertion/bind/proxy, spoof
  rejection, cert enforcement, restore). Keep; pin version/paths per M3.
- V7 depreciation probe (conditional): correct behavior-level test; APPLY M4 (run on the exact frozen
  line/version; do not assert PR numbers).
- V8 cost probe: correctly specified; APPLY M10 (itemized self-host TCO incl. backup/domain/admin;
  capped hosted tiers per M6; year-two headroom). The probe is the fix for the pre-claim.
- V9 portal probe (conditional): correct scope (two caregivers, own-rows-only, both languages,
  no enumeration, triage gate). Keep; emphasize it must re-run if P5-Branch 2 opens post-pilot.
- "No runtime available is honest; do not pretend proposals ran" — the draft complies fully. Keep.

## 5. Minor findings

- m1. State-name drift: "Diagnosed" (§2.1) vs "Diagnosed-awaiting-decision" (C-P1b). Fix by
  reconciliation (M5); V2 then uses one vocabulary.
- m2. Currency drift: n8n $ vs € (M1). Re-verify at procurement; quote EUR annual + monthly.
- m3. Lend-Engine tier matrix was partial in S11; C09 now gives caps + language rows. Fold into §4
  Alternative 2 (M6).
- m4. PowerSync Node-SDK stable-vs-beta tag ambiguity (discovery O2-6) is honestly flagged with
  "verify" — no action beyond keeping the flag; web-first pilot avoids the question.
- m5. Grist managed free API 3,000/mo/team (S13, 2026-07 newsletter): not re-verified by the critic;
  preserved as mutable. Self-host primary is unaffected. No action.
- m6. Downtime minutes-at-entry/hours-in-analysis unit claim (S08): not re-verified; preserved with
  the draft's own "mixed units are a defect" guard + V7. No action.
- m7. Build-order step 1 "verify no teacher holds schema rights" is necessary but point-in-time;
  add periodic re-check (role drift) to operations. One sentence.
- m8. R-P1's rejection of a status column is sometimes misread as rejecting phased delivery; it is
  not — the pilot still phases by school/room. No text change needed; noted to prevent reviser
  softening.
- m9. "No uncertainty beyond the district's pending choice" (P5): acceptable given the V9 + bilingual
  re-probe conditions. Emphasize, don't rewrite.
- m10. S04/S09/S10/S11/S13 mutability flags are all honestly set; the critic's live re-fetch confirms
  the Grist subset at 21:12Z and upgrades NocoDB/Authentik/n8n/Lend-Engine/ERPNext/Snipe-IT/PowerSync
  as noted. No silent rebinds; critic IDs (C01–C11) are disjoint from research IDs (S01–S14).

## 6. What the reviser must preserve

Per the draft's §9 instruction and O5: per-P dispositions (as repaired by M5/M6/M9, not dropped),
all four alternatives + two infrastructure choices with win/lose conditions (as sharpened by
M1–M4/M6), every uncertainty (narrowed, never deleted), the disagreement record (low-code primary vs
repair-native completeness), and the executed-vs-proposed validation split. Corrections in this
critique add evidence or scope — they remove nothing except the "reported" hedge on Redis (M3),
the over-broad Archived invariant (M5), and the pre-claimed $8k fit (M10, pending V8).
