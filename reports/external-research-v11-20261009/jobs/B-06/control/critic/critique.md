# I06 Critic — B-06 / control / M14 (critic stage)

Block B-06 / control / case I06 / method M14 / stage critic.
Brief obligations O1–O6. Plan P1–P6 (revealed-plan.md).
Predecessors inspected COMPLETE: research `draft.md`, `discovery.md`, `source-map.json` (S01–S11),
`revealed-plan.md`, source root `research/sources/` (11 excerpts + index), original brief `cases/I06/brief.md`.
Independent critic fetches C01–C06 (`source-map.json` + `sources/`): WCAG 1.4.1, Grist access-rules,
grist-core v1.7.7, GHSA-3v78-cw58-v685, grist-core v1.7.20, LibreTime Stable 4.x install.
No campaign/history/evaluator/counterpart read. No execution; read-only web_fetch. Usage/billing: null.
Critic saves critique only; no candidate repair outside this recipe (reviser writes final).

Prose is self-contained; IDs (Sxx predecessor, Cxx critic, P1–P6, O1–O6) never replace text.
Verdict vocabulary for P dispositions: agree | agree-with-correction | disagree | uncertain.
Severity: MATERIAL (changes product/privacy/safety/cost verdict or a P disposition) vs MINOR (wording/scope/noise).
Critic demands can be invalid; each finding states evidence and where the critic could be wrong.

## 0. What the investigator got right (do not regress)

- WCAG SC 1.4.1 Level A text, 3:1 lightness rule, valid/invalid extra-indicator rule: CONFIRMED verbatim (C01).
- Grist eval order column→table→default, first-match-wins, S-bypass via unsandboxed formulas: CONFIRMED (C02).
  Reviser should UPGRADE these from "uncertain/secondary excerpt" to confirmed.
- LibreTime mins (1 GHz, 1 GB req / 2 GB rec, static IP, UFW, ports 80/8000/8001/8002, docker/installer): CONFIRMED (C06).
- /compare history leak exists and is dedication-relevant; /states/remove + block-/compare workarounds exist: CONFIRMED (C03/C04).
- Preserving P5/P6 as user decisions, refusing legal advice, honest no-runtime accounting: correct, keep.
- Paper-first spine, version-stamped derived print, redaction requirement: direction correct; mechanism gaps below.

## 1. MATERIAL findings

### M1. Grist version floor is wrong twice: fix version misstated AND floor stale given undo fix (P1/P2/P5, O2/O3)
- Draft/discovery claim: "/compare leak fixed in 1.7.7; require ≥1.7.7" (S04 cvefeed, CVSS 6.5 MEDIUM).
- Vendor truth (C04): GHSA-3v78-cw58-v685 says Affected <1.7.6, Patched 1.7.6, "Fixed since 1.7.6",
  Severity Moderate 5.3 (CVSS:3.1/AV:N/AC:H/PR:L/UI:N/S:U/C:H/I:N/A:N). Release page (C03) concurs:
  "Versions prior to 1.7.6 are known to be vulnerable."
- So "fixed in 1.7.7" misstates the fix version (1.7.7 release notes ANNOUNCE the advisory; the patch
  version is 1.7.6) and "6.5 MEDIUM" mismatches the vendor's 5.3 Moderate (aggregator rescoring or a
  different CVE-record revision; cvefeed modified 2026-06-17 per S04).
- Worse, the floor is stale regardless: v1.7.20 (C05) fixes "access rule checks could miss an action
  that followed an undo in the same request, including the check requiring permission to edit structure
  for changes that can affect formulas." A dedication-privacy design on ≥1.7.7 WITHOUT the undo fix
  retains a known structure-check bypass. Floor must be ≥1.7.20 (prefer: latest stable at build + pinned
  tag/digest), with 1.7.6 noted as the /compare patch version.
- Affected text: every "≥1.7.7" condition (P1, P2, §2/§3/§4/§5/§6), validation 1/2/6 setup, O3 chain.
- Critic could be wrong if: grist-core backported the undo fix to a 1.7.7-line patch the critic did not
  fetch; reviser should check the v1.7.7..v1.7.20 changelog for backports before pinning. The 1.7.6 vs
  1.7.7 discrepancy could also reflect two distinct release lines (grist-core vs SaaS); GHSA governs as
  vendor canon unless the Dockerfile/tag provenance says otherwise.

### M2. Omitted second vulnerability in the SAME advisory: fetch-URL SSRF needs a trusted proxy (P1/P2, O2/O3)
- C03 lists TWO vulns: the /compare leak AND "Using the fetch URL feature, a user could execute a
  request to an external server with privileged network access" (mitigation: trusted proxy;
  GHSA-qh95-2qv8-pqx3). Investigator never mentions it.
- Relevance: a no-dev self-hosted Grist that leaves REQUEST()/fetch-URL open without an egress proxy
  gives any formula-capable user (structure holders by design, plus anyone pre-hardening) a
  privileged-network request primitive. On a $6k/no-dev station host this is not hypothetical hygiene:
  either (a) disable/lock the fetch-URL feature, or (b) put requests through a trusted proxy, or
  (c) use managed hosting where the vendor owns egress. Draft's Grist conditions (logins + version +
  S-off + purge) are incomplete without one of these.
- Reviser: add the proxy/disable condition + a validation (attempt external fetch from a formula cell;
  expect deny/proxy-routing), or scope fetch-URL out of the build with how-to-disable steps.
- Critic could be wrong if: fetch-URL/REQUEST() is owner-only or disabled by default in current
  grist-core in a way the release note does not state; reviser should confirm the default + the exact
  proxy env knobs from grist-core docs before final wording.

### M3. Copy/download + full-read semantics: the privacy model has holes the draft does not test (P1/P2/P5, O6)
- C02 confirms enabling rules also restricts copy/download to Owners ("only Owners will be able to copy
  or download the document") via a special rule. Draft never mentions copy/download/export as an
  exfiltration path: a volunteer who cannot read dedications via cells but CAN copy/download the full
  document (if the special rule is loosened for convenience) bypasses every row rule. Validation 1
  (history + /compare as partial user) would PASS while copy/download leaks everything.
- Related: /compare is restricted to "full read access" users — any volunteer GRANTED full-read (e.g. a
  trusted host role) still sees full history diffs including private cells. Draft's "partial user" test
  principal is underspecified: the role matrix must state exactly which station roles are full-read vs
  partial-read, and the P5 approval-role decision must not silently grant full-read to approvers who do
  not need dedications.
- Reviser: add copy/download/export to the threat list + validation 1 (attempt copy/download/API export
  as each non-owner role; expect deny or redacted), and publish the role→(R/U/C/D/S + full/partial)
  matrix with the P5 decision.
- Critic could be wrong if: Grist copy/download of a partial-read doc already applies row redaction in
  current versions (the dialog wording suggests owner-only instead); needs one doc-level check at build.

### M4. Retention purge validation ignores backups/exports/logs (P5/P2, O6)
- GHSA workaround (C04) documents /states/remove for sensitive HISTORY; draft's validation 6 (delete +
  /states/remove, verify partial user cannot recover via history/compare) tests exactly that — but
  dedications also persist in: (a) Grist automatic backups / document snapshots, (b) volunteer-made
  exports/copies/prints, (c) webhook/API delivery logs if the push-to-stream-operator path logs payloads.
- Draft mentions "backup rotation" once (P5 conditions) but validation 6 has no backup/rotation pass
  criterion, no export inventory, no log-redaction check. A purge that passes validation 6 can still
  leave dedications recoverable from last night's backup — which for a privacy control is a fail.
- Reviser: extend validation 6 with backup-rotation + export-inventory + log-redaction criteria, or
  narrow the claim ("purge removes live+history copies; backups age out in N days; exports are
  out-of-scope and governed by policy") and record which one the station accepts.
- Critic could be wrong if: the chosen deployment (e.g. Grist SaaS trial) does not expose backups to the
  station at all — then the finding downgrades to "state the backup owner + retention explicitly."

### M5. P1 "already-covered" overstates: push+ack and SSO conditions are unproven for this station (P1, O1/O6)
- Draft disposition: already-covered with correction + optional enhancement. The corrections are the
  substance (filtered views, not identical views; post-print push+ack with version bump). Agree with the
  direction, but two load-bearing conditions lack evidence:
  (a) Post-print push/phone + ack within 2 min assumes rotating volunteers and the stream operator run a
  reliable on-call/message discipline the brief never describes (no device policy, no staffing of the
  stream desk, no ack tool named). Discovery honestly held push-vs-pull as disagreement; draft promotes
  push+ack to REQUIRED without new evidence. Pull (live view the operator refreshes) may fit a volunteer
  desk better; the drill should decide, not the researcher.
  (b) "logins/SSO from day 1" collides with no-dev + $6k + rotating volunteers: who operates the IdP,
  what does it cost, what happens when the IdP is down (fallback auth?), and does Grist's free core
  OIDC/SAML (S09, search-sourced, not vendor-confirmed) actually cover the station's identity source?
  Cheaper alternative unexamined: Grist built-in team logins without external SSO. The condition should
  read "authenticated logins from day 1 (SSO optional; SSO only if the station already has an IdP)".
- "Uncertain: live-view refresh latency on studio hardware" is correctly flagged but has NO validation
  measuring it (validation 3 measures push+ack, not live-view staleness). Add a staleness probe or drop
  the live view from the safety argument.
- Critic could be wrong if: the station already runs Google Workspace / Microsoft 365 SSO the planner can
  reuse at zero marginal ops — the brief does not say; reviser should ask, not assume either way.

### M6. P2 approval workflow is specified but ungrounded: deny-by-default needs a mechanism + a liveness rule (P2/P5, O2/O6)
- Draft: `approved_by_role = NULL (pending)` + deny-by-default (non-approver edits stay PENDING, never
  silently cleared). Good safety instinct, and C02's "Checking new values" section suggests Grist CAN
  gate transitions — but draft cites no rule/formula sketch, and validation 2 (structure-bypass) does
  not test the approval transition at all. As written the workflow is a schema wish, not a mechanism.
- Missing liveness rule: news inserts change minutes before air. If clearance is PENDING at airtime,
  does the desk fail CLOSED (dead air / pulled insert) or fail OPEN (air with announced restriction)?
  Safety-vs-liveness must be a station decision with a default the drill tests; "deny-by-default"
  silently chooses dead air.
- Also "Do not default approval to any staff" is right, but the interim (pre-P5-decision) state leaves
  EVERY usage-note change pending — including corrections of errors. State the interim triage path (who
  may flag, who may emergency-clear, logged how) or the desk will route around the planner on day one.
- Critic could be wrong if: Grist's new-values conditions cannot express cross-role approval without
  owner intervention — then the finding upgrades: the approval workflow may need a second table +
  lookup, and validation 7 must cover it.

### M7. P3 print-redaction "at template level" names a mechanism without evidence (P3, O2)
- Draft: "redaction enforced at print-template level, not operator discipline." Investigator shows no
  Grist print/export template feature that enforces row redaction independently of the view being
  printed. If print is browser-print of a filtered view, the control is view-level + who-may-open-which
  view, and an operator with the unfiltered view open can print dedications. The requirement is right;
  the named layer is unproven.
- Reviser: restate as "print ONLY from the named redacted view(s); full-view print disabled by role or
  by procedure + audit; each print carries version N, timestamp, range, label vocabulary, redaction
  marker." Validation 3 must include a negative print test (attempt full-view print as stream operator;
  expect deny or redacted output).
- Fallback scope creep (minor-material boundary): draft extends P3 fallback to "transmission interruption
  AND planner outage" with a 30-min paper run. The extension is sensible but doubles the drill burden
  and raises an unanswered fail-open question: who clears a minutes-before-air news insert when the
  planner is offline — and on what authority? Keep the extension, but add the offline-clear rule.
- Critic could be wrong if: Grist page/print layouts support server-side redacted print templates the
  critic did not fetch (custom layouts / document tours exist per C02 nav); reviser may cite the exact
  template doc to reinstate "template level."

### M8. P4 overclaims WCAG scope; "100% accuracy" criterion is statistically brittle (P4, O6)
- Draft: status displays "must meet WCAG 2.2 SC 1.4.1 Level A" including PRINT. C01 confirms the SC for
  web content; WCAG conformance does not govern paper print. Print legibility in B&W + CVD simulation is
  good practice and SHOULD be required, but calling it "WCAG conformance" is a category error that could
  mislead the station about what was certified. Restate: "screen UI meets SC 1.4.1; print meets the same
  label-redundancy rule as station policy, tested the same way."
- Validation 4 ("limited-color-perception staff identifies all statuses 100% without color cues") with
  n=1 staff member proves almost nothing and "100%" guarantees a fail on any single slip. Define the
  sample (all 9 staff + ≥2 volunteers), the item set (every status × print + screen), and a realistic
  bar (e.g. 100% on P4 items with one retry after template fix, or ≥95% first-try with no systematic
  confusion pair). Also "icons redundant with words" needs a constraint: icons must themselves be
  B&W-distinguishable shapes, not hue-only glyphs.
- The P4 disposition (already-covered with correction, mandatory) is otherwise AGREED; the SC quotation
  in draft §P4 matches C01 verbatim.

### M9. P5 interim "minimal retention" default contradicts "must not be filled by researcher" (P5, O5)
- Draft correctly holds approval role + retention period as user decisions, then fills one anyway:
  "Interim safe default: minimal retention (shortest candidate station tolerates) + purge, because
  history leak makes retention a privacy control." Choosing the SHORTEST retention is itself a product
  decision with legal/grant risk the draft elsewhere refuses to judge ("whether any law/grant requires
  minimum/maximum retention — needs station counsel, not assumed").
- The privacy argument is real but one-sided: minimal retention minimizes dedication exposure AND
  maximizes the risk of destroying records the station was obliged to keep. The honest interim is not a
  duration but a posture: quarantine (collect minimally, restrict to owners, no volunteer-visible
  history) + manual delete on request + purge drill on 30/90-day CANDIDATES, with the station + counsel
  choosing the period. Do not ship "shortest tolerable" as a default.
- The 30/90-day candidates as "optional enhancement for station to test" are fine and SHOULD stay.
- Critic could be wrong if: nonprofit community-radio listener requests are clearly non-records with no
  retention floor in the station's jurisdiction — but that is counsel's call, which is exactly the point.

### M10. P6 dual-prototype + same-week comparison drill is unbuildable for a no-dev station (P6, O6)
- Draft: prototype BOTH single-with-TX-columns and split schedules; validation 8 runs "the same week
  under single vs split" and counts missed/wrong local breaks. A no-dev volunteer desk cannot build and
  run two schedule models for the same air week (the same week cannot air twice; two different weeks are
  confounded by content/volunteers). The disposition (user decision + uncertain, mechanism-neutral) is
  AGREED; the decision PROCEDURE is not feasible.
- Reviser: replace validation 8 with a tabletop walkthrough (one real past week replayed on paper under
  both layouts, scored for break misses + confusion) followed by a ONE-week live pilot of the walkthrough
  winner. Station picks or defers with a revisit date, as draft says.
- Added requirement inside P6 ("stream operator view shows which breaks air on stream vs TX-only") is
  genuinely needed (brief: two transmitters + stream, breaks differ) but is an enhancement, not a P6
  entailment — keep it, relabel as enhancement pending station confirmation of stream-vs-TX break rules.
- Critic could be wrong if: Grist filtered views make the second prototype near-free (same tables, two
  saved views) — then "prototype both" downgrades to "show both views in one drill session," which the
  reviser should state explicitly with the near-zero-cost argument.

### M11. Growth/complement paths lack integration mechanisms; fallback comparison is non-vendor (O1/O2)
- LibreTime "planning-only reuse ... possible" (discovery C/discovery §2, draft §2): C06 confirms the
  install surface but shows no planning-only mode — install still opens stream ports and implies
  services. Running LibreTime's calendar while ignoring playout/Liquidsoap/Icecast is plausible but
  UNPROVEN; it may still require the services running (ops the brief rejects) or fight the tool's
  show→schedule→playout model. Keep as growth path ONLY with the proviso "planning-only use untested;
  requires a trial confirming the calendar works with playout disabled, plus managed hosting."
- AzuraCast "read-only now-playing/mount feed into planner" (draft P1 enhancement): no mechanism shown.
  Grist would need to poll/consume the AzuraCast API (auth, polling, mapping to shows) — a mini
  integration a no-dev station cannot build. Unless AzuraCast offers a no-code embed (public
  now-playing widget URL pasted into a Grist view — unexamined), this enhancement is dev work in
  disguise. Reviser: either name the no-code embed or demote to "station/staff manual check of AzuraCast
  dashboard alongside planner."
- NocoDB/Baserow fallback rests on third-party comparisons (S08), not vendor docs: "views/permissions
  partly paywalled" (which tier? does $6k/yr cover it?), "no trash" (still true? which version?),
  "Fair-Code self-host internal OK" (does a nonprofit station's volunteer use count as internal?),
  resource mins. For a fallback this is tolerable, but the privacy comparison ("weaker row privacy vs
  Grist") that JUSTIFIES Grist-as-primary inherits the same non-vendor weakness. Reviser: confirm the
  ONE load-bearing cell (row-level privacy availability + tier for each fallback) from vendor pricing
  docs, or soften to "preliminary comparison; verify tier before switching."
- Rivendell non-goal: AGREED (correct bound; no further evidence needed).
- AzuraCast beta/backup (S07) and Grist self-host/licensing (S09) were NOT re-fetched in the critic
  window; retained-not-verified. The beta warning is load-bearing for the "only if managed host"
  condition — reviser should re-verify beta status at build time (it may have stabilized).
- Critic could be wrong if: predecessor S07–S10 excerpts already capture stable vendor facts (likely for
  LibreTime/Rivendell, less so for fast-moving pricing/permissions) — the demand is narrowly for the
  tier/privacy cell and the two integration mechanisms.

### M12. All 8 validations assume dev ops the station lacks; thresholds are arbitrary (O6)
- Draft honestly reports no runtime and proposes 8 discriminating checks — good. But every Grist check
  (dedication-leak, structure-bypass, retention purge) assumes someone can spin docs/users, drive the
  API console (/states/remove, /compare), and interpret history diffs; validation 1 even suggests a
  throwaway PRE-1.7.6 instance "to prove control matters" — asking a no-dev station to deploy a KNOWN
  VULNERABLE version is irresponsible and should be STRUCK (prove the control on the patched version
  with negative tests; cite GHSA for the pre-patch behavior).
- Reviser must name the OWNER of each validation (station staffer with 1-page guide? vendor trial
  support? volunteer with Linux skill?) and provide no-dev-runnable variants: Grist managed trial
  instead of Docker, checklist drills instead of API probes where possible, CVD simulator named with
  version (which tool? built-in OS filter vs web tool?).
- Arbitrary thresholds with no baseline: "ack within 2 min" (v3), "100%" (v4, see M8), "<15 min,
  no dev help" (v7). Measure-first-then-set-SLO: run each drill 2–3 times, record the distribution, THEN
  fix the bar with the station. A threshold set before any run is a guess that fails volunteers.
- Scope note ("small-product checks, not production guarantees") is correct and SHOULD stay.

## 2. MINOR findings (reviser: fix in passing)

- m1. Status vocabulary: `CHANGED-SINCE-PRINT` is an overlay, not a fourth status — a row can be
  PENDING *and* changed-since-print. Schema needs `status ∈ {CLEARED, RESTRICTED, PENDING}` PLUS
  boolean `changed_since_print`, not a 4-value enum. Draft §P2/§P4 text implies the enum.
- m2. Docker command `gristlabs/grist` with no tag drifts (S09). Pin `gristlabs/grist-core:<tag>` or a
  digest at ≥1.7.20 (see M1) in every runbook mention.
- m3. Version-stamp procedure underspecified: who bumps vN→vN+1 (manual? formula? button?), which clock
  (studio-local vs UTC), and where the ack is recorded. One paragraph + validation 3 records it.
- m4. LibreTime 4.0/4.1/4.3 upgrade trivia (8080, replay-gain pref, #3150 volume delete) is noise for a
  planning-only brief; cut to one line ("4.x has had breaking upgrade notes; managed host must own
  upgrades") to preserve scope.
- m5. "Print must pass in B&W + CVD simulation with 100% volunteer accuracy" (draft P4) duplicates
  validation 4's brittle bar; fix once (M8) and reference it.
- m6. Draft §3 "Later note (unconfirmed)" for v1.7.20 is now CONFIRMED (C05) — reviser must flip the
  label and the floor (M1), not merely re-cite.
- m7. O3 "No LibreTime/AzuraCast/Rivendell chain traced (time-boxed)" is honest; keep, but the O3
  obligation ("at least one chain") is satisfied by the Grist chain — say so explicitly so the final
  does not read as O3-incomplete.
- m8. Missing drift note: Grist Help + AzuraCast/NocoDB/Baserow docs are mutable web; LibreTime Stable
  4.x is versioned; release tags/GHSA/CVE IDs immutable. Draft's source-map already says this; carry it
  into the final's source notes.

## 3. Per-P disposition verdicts (exact P text from revealed-plan.md)

- P1 "Provide a shared show schedule and operator handoff view for both transmitters and the web
  stream." Draft: already-covered with correction + optional enhancement. Verdict: AGREE-WITH-CORRECTION.
  Filtered-views (not identical view) + version-stamped derived print are correct and required. But
  push+ack-required and SSO-from-day-1 are unproven for this station (M5); AzuraCast feed enhancement
  lacks a no-dev mechanism (M11). O4 vocabulary use is otherwise correct.
- P2 "Track clearance status and restrictions at the track or clip level used in a show." Draft:
  already-covered with correction. Verdict: AGREE-WITH-CORRECTION. Label vocabulary + separate
  restriction column + approval-as-variable are correct. Deny-by-default needs a Grist mechanism sketch
  + airtime liveness rule (M6); version floor must move to ≥1.7.20 + proxy condition (M1/M2);
  copy/download threat missing (M3).
- P3 "Preserve a printable daily log and a manual fallback for transmission interruptions." Draft:
  already-covered with correction + optional enhancement. Verdict: AGREE-WITH-CORRECTION. Derived-print
  + version/invalidate/ack + redaction + insert slips are correct. "Template-level" redaction unproven
  (M7); planner-outage extension needs the offline-clear rule (M7); validation 3 needs the negative
  print test (M7) and measured SLO (M12).
- P4 "Use text labels with status cues so operators do not rely on color alone." Draft: already-covered
  with correction (mandatory). Verdict: AGREE-WITH-CORRECTION. SC quotation and label+color mandate are
  verbatim-correct (C01); rejected color-only patterns correct. Fix WCAG-vs-print scope wording and the
  validation-4 sampling bar (M8); fix the 4-value-enum schema slip (m1).
- P5 "Approval authority for usage-note changes and retention of listener requests are station
  decisions." Draft: user decision (preserved). Verdict: AGREE-WITH-CORRECTION. Preservation + no-legal-
  advice + 30/90-day candidates are correct. Strike the "minimal retention interim default" (M9); extend
  purge validation to backups/exports/logs (M4); publish the role matrix with the decision (M3).
- P6 "Whether differing local breaks need separate schedules is not settled." Draft: user decision +
  uncertain (preserved). Verdict: AGREE-WITH-CORRECTION. Mechanism-neutrality + no-hardcode rejections
  are correct. Replace the dual-prototype same-week drill with tabletop + one-week pilot (M10); relabel
  the stream-vs-TX break mapping as enhancement (M10).
- No FALSE correction found that must be fully reversed; no REJECTED item found that must be reinstated
  as core. The closest calls: (a) push+ack-required (M5) — downgrade to drill-decided, not struck;
  (b) LibreTime/AzuraCast growth roles — keep with mechanism provisos (M11), not promoted or cut.

## 4. Validation applicability (draft §4 proposals 1–8)

- V1 dedication-leak: APPLICABLE after fixes — add copy/download/export attempts per role (M3), pin
  version ≥1.7.20 (M1), name the runner (M12). STRIKE the pre-patch throwaway instance (M12).
- V2 structure-bypass: APPLICABLE — keep, and ADD the approval-transition test (M6: non-approver edit →
  stays PENDING; approver edit → clears; airtime PENDING rule observed).
- V3 print-vs-live sync: APPLICABLE after fixes — drill decides push-vs-pull (M5); add negative print
  test (M7); measure staleness; set the ack SLO from runs (M12); record who stamps/acks (m3).
- V4 label-only legibility: APPLICABLE after fixes — fix scope wording + sampling bar + icon constraint
  (M8); keep B&W + CVD simulation with a NAMED simulator (M12).
- V5 fallback drill: APPLICABLE — keep 30-min paper run + no-exposure criterion; ADD offline-clear rule
  for news inserts (M7) and the phone/message-tree reachability pre-check.
- V6 retention purge: APPLICABLE after fixes — extend to backups/exports/logs or narrow the claim (M4);
  run against 30/90-day candidates without a pre-decided default (M9).
- V7 onboarding: APPLICABLE — keep 1-page-guide + time-to-correct shape; set the bar from runs (M12);
  run under the P6 walkthrough winner only (M10), not both prototypes live.
- V8 break-miss comparison: RESHAPE — tabletop replay + one-week pilot (M10); same-week dual-run is
  unbuildable. Station picks or defers with date (keep).
- No executed checks are claimed and none ran in critic either (read-only fetches only); the
  executed-vs-proposed separation (O6) is HONEST in draft and preserved here.

## 5. Reviser instructions (minimal complete repair list)

1. Floor: replace every "≥1.7.7" with "≥1.7.20 (pinned tag/digest; /compare patch was 1.7.6)" + CVE/GHSA
   score correction (vendor Moderate 5.3 governs; note aggregator 6.5) (M1, m6).
2. Add trusted-proxy/disable-fetch-URL condition + validation (M2).
3. Promote S02 eval-order/S-bypass to confirmed with C02 citations (M3-context, §0).
4. Add copy/download/export threat + role matrix (full- vs partial-read) + extended V1 (M3).
5. Extend V6 to backups/exports/logs or narrow the purge claim (M4).
6. Soften SSO to authenticated-logins (+SSO optional); drill decides push-vs-pull; add staleness probe
   or drop live view from safety case (M5).
7. Sketch the approval rule/formula + airtime PENDING liveness rule + interim triage path; extend V2 (M6).
8. Restate print redaction as named-redacted-views + negative print test; add offline-clear rule (M7, m3).
9. Fix WCAG-vs-print wording; fix V4 sampling bar + icon constraint; split overlay boolean (M8, m1, m5).
10. Replace minimal-retention default with quarantine posture; keep 30/90-day candidates (M9).
11. Reshape V8 to tabletop + pilot; relabel stream/TX mapping as enhancement (M10).
12. Provisos on LibreTime planning-only + AzuraCast feed mechanism; confirm fallback tier/privacy cell;
    re-verify beta at build (M11); cut upgrade trivia (m4).
13. Name every validation owner + no-dev variant + named tools; strike vulnerable throwaway; set SLOs
    from runs; keep small-scope note (M12); pin Docker tag (m2); keep O3-satisfied line (m7); carry
    drift notes (m8).

## 6. Critic uncertainty and invalid-demand risk

- Version-line risk (M1): if grist-core maintains parallel lines, "≥1.7.20" may over-pin; reviser checks
  the changelog for backports. If backported, floor becomes "≥ earliest line containing both the
  /compare restriction and the undo+structure fix."
- Mechanism risk (M2/M6/M7): fetch-URL defaults, new-values approval expressiveness, and print-template
  redaction were verified at doc-heading level, not by building rules. Each finding names the exact doc
  the reviser must open to confirm or overturn it; none is load-bearing on an unopened page alone.
- Cost risk (M5/M11/M12): the critic assumes no spare IdP, no spare on-call desk, no spare Linux skill
  — the brief supports this (no developer, $6k, volunteers) but a single station fact (existing IdP,
  managed host, skilled volunteer) could overturn M5(b)/M11/M12 resourcing demands. Reviser should ask
  the three station questions (IdP? host? skilled volunteer?) before finalizing conditions.
- No premium evaluator access was used; no repair beyond this recipe was attempted.

---
Predeclared fallback: this critique.md (+ source-map.json + sources/index) is the complete critic
deliverable. Short status cannot replace it. Reviser stage writes the full final from draft + critique.
