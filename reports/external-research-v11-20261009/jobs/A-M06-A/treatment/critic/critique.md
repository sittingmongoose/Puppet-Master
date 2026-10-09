# Critique — A-M06-A/treatment/critic (S06 device-alerts, M06 v1 evidence-first-challenge)

Critic stage: fresh critic. `evidence-first.md` (saved 2026-10-09T19:17:00Z) was derived
from the brief + independently chosen primaries WITHOUT opening any draft; frozen
predecessors were opened only after that save. Frozen inputs per `freeze.json`
(frozen_at 2026-10-09T19:12:27Z): draft.md sha256 `1b4eaf5c…14c0` (9761 B),
discovery.md `88dd6a4e…6224` (16514 B), research source-map `e249325f…2bb5`,
revealed-plan `323cdef9…5c62`, brief `4c4e4dd8…f2de`. This critique compares the
COMPLETE draft + discovery + revealed plan against brief, evidence-first (EF1–EF4),
predecessor excerpts (cited as P-S01…P-S06), and critic sources (C01–C05).

Verdict: the draft is strong — all six P dispositions are correct in direction, the
O3 chains are evidenced, and the executed/proposed split is honest. No false
correction or false rejection was found. Six material findings below (M1–M6) require
reviser action because they change build/ops decisions or leave consequential claims
unquantified; eight minor findings (m1–m8) should be carried forward. Critic demands
can be invalid: each finding states its evidence, its uncertainty, and the condition
under which the demand softens.

## 1. Evidence-first comparison (agreement / new information)

- EF1 (Mosquitto QoS/sessions/persistence are configured, not automatic) — AGREES with
  draft P1 corrections. Predecessor P-S01 excerpts are verbatim and decisive
  (loopback-only with no listener; `allow_anonymous` now defaults false; upgrade
  refuses clients; password/acl vs dynamic-security vs explicit anonymous; tls_version
  minimum; root drop; max_queued_messages 100→1000 incl. QoS 0 while connected).
  Critic C01 corroborates the configuration surface but did NOT re-pin the 2.0 breakage
  values — P-S01 governs there. Draft claim "MQTT alone does not deduplicate" agrees
  with EF1 (QoS 1 AT_LEAST_ONCE permits duplicates; retain is last-value, not history).
- EF2 (JetStream streams persist; dedup = Nats-Msg-Id + DuplicateWindow, default 2m) —
  AGREES with draft P1/U4 upgrade path. Critic C02 independently corroborates P-S02's
  2-minute default, Msg-Id-only key, `PubAck.duplicate`, sequence rules, and the
  Expected-Last-Subject-Sequence guard. Draft's condition "window sized to backfill
  hours + DB key backstop" is exactly EF2's conclusion. Window memory cost remains
  unquantified on both sides (minor, m-carried).
- EF3 (Grafana History ≠ Notifications; OSS History REQUIRES Loki; 5000-event chart cap;
  RBAC) — PARTIALLY NEW. Predecessor P-S04 covered evaluation states/pending/No Data/
  Error but NOT the History-page backend or limits. Draft says "state history is
  queryable (structured log, Loki-backed)" (discovery) / implies history availability,
  but never states the hard dependency or sizes it. C03 verbatim ("must configure alert
  state history in Loki to view the History page"; "exceed the 5000 alerts limit…
  data missing"; RBAC filtering; Notifications tab separate) makes M1/m1/m2 material.
- EF4 (InfluxDB 1/2/3 evolution; version must be pinned) — CONSISTENT, minor gap.
  Draft/discovery pinned Mosquitto 2.x, NATS docs 2.15, TimescaleDB ≥2.20/2.23, Grafana
  latest-with-caution, but surveyed VictoriaMetrics instead of InfluxDB and never
  mentions the InfluxDB 3 generation. C04 bounds this as minor (m4): O1 breadth is
  already strong (6 deep + 7 surveyed), and TimescaleDB-vs-InfluxDB is a genuine
  fork the reviser can note in one paragraph — not a reason to rework the recommendation.
- EF-uncertainty (TimescaleDB unfetched, C05) — predecessor P-S03 excerpts are detailed
  and verbatim (WITH syntax since 2.20, 7-day default chunk, default descending index,
  columnstore auto-policy + ~98%, batch ≥1000, unique-constraint/direct-compress
  exclusion, hypertable↔hypertable FK ban). Critic accepts P-S03 as governing primary
  evidence but could NOT independently re-verify; all TimescaleDB-gated demands (M6,
  P1-UPSERT note) are therefore framed as verify-at-build, not as contradictions.

## 2. Per-P disposition review (all six checked)

- P1 "Ingest MQTT readings into a time-series database." → ALREADY-COVERED + CORRECTIONS.
  AGREE. Direction matches pre-reveal architecture A (no circularity: discovery predates
  reveal per plan-reveal.json). Each correction is sourced: (a) Mosquitto 2.x listener+auth
  breakage (P-S01 verbatim); (b) idempotent ingest via `(gauge_id, ts)` UPSERT + optional
  JetStream window (P-S03 UPSERT via secondary writing-data snippet + P-S02 window);
  (c) timestamptz + chunk + SI/unit/scale discipline (P-S03). Caveat (carried as M6 +
  note N1): the UPSERT-on-hypertable claim rests on a corroborating search snippet, not a
  primary verbatim excerpt — reviser must verify `ON CONFLICT` against the installed
  TimescaleDB version; treat as medium-confidence, not false.
- P2 "Alert when the latest reading exceeds one fixed threshold." → CORRECTION (major).
  AGREE. "Latest by arrival" is wrong under late/out-of-order; telemetry-timestamp
  ordering (P-S05 Start Time verbatim), per-gauge thresholds with global seed, `for:` ≥
  2–3 evals, keep-firing, and SEPARATE staleness rule (P-S04 six-state model verbatim)
  are each supported. "Fixed-threshold-on-latest retained only as day-one seed" is the
  correct retention. No over-correction: the draft does not ban thresholds, it bans
  arrival-ordered single-threshold-without-persistence semantics.
- P3 "Missing readings count as zero." → REJECTED as stated + CORRECTION. AGREE,
  unconditionally. Zero is a physical value for water gauges (no flow / empty tank);
  missing is unknown (dead sensor, backhaul outage, drained battery). Null→0 coercion
  fabricates all-clear/phantom crossings and destroys the silence signal. NULL end to
  end + dedicated per-gauge stale alert + Error mapping (P-S04) is correct. Edge
  examined: counter-type gauges where "zero events" is meaningful — still missing≠zero
  (unknown count vs known zero), so the rejection stands on all gauge types in scope.
- P4 "Clients acknowledge an alert locally then sync." → CORRECTION (authority inversion).
  AGREE. Local-first ack with no arbiter is split-brain (sync order decides truth, audit
  is last-writer-wins). Server-owned ack ledger (alarm_id, actor, action, ts,
  offline-origin flag) + queued client INTENT + both-intents-preserved conflict rows +
  four-state lifecycle (P-S05 verbatim: Active/Cleared × Acked/Unacked) + silences/ntfy
  as inputs, not replacements (P-S04/P-S06, EF3 silence≠ack) is correct. Retained
  offline-tolerant intent preserves what was good in P4. The conflict-row design is
  presented as design (correctly — it is not source-derived).
- P5 "Keep data for a year." → ALREADY-COVERED + enhancement. AGREE in direction;
  MATERIAL QUANTIFICATION GAPS (M2, M6). One-year raw retention + drop-chunks at 365d +
  columnstore + rollups + SEPARATE alarm/ack retention (≥2y/indefinite) is the right
  shape, and flagging regulatory retention as a user decision is correct. But "storage
  estimate stays single-node self-hosted" is asserted with no numbers (M2), and the
  1-day-chunk recommendation against the 7-day default is justified by fit-to-backfill,
  not by the 25%-RAM sizing rule discovery itself cites (M6). Disposition stands;
  numbers must be added.
- P6 "Validate with a static sample CSV." → already-covered AS SMOKE SEED + enhancement.
  AGREE. CSV as V0 seed + V1–V7 discriminating matrix is the correct split; the draft's
  list of what CSV cannot discriminate (duplicates, lateness, reordering, reconnect
  storms, upgrade breakage, silence-vs-error, ack conflicts) matches the brief's risks.
  Validation applicability reviewed in §5.

## 3. Material findings (M1–M6; reviser must address)

- M1 Grafana History hard dependency + sizing missing. Draft/discovery say history is
  "queryable (structured log, Loki-backed)" but never state C03's verbatim hard gate:
  OSS/Enterprise MUST configure state history in Loki or the History page is unavailable.
  For architecture A this adds a mandatory component (Loki deploy + retention + backup)
  to the "modest self-hosted budget" that is currently invisible in the recommended
  stack and its recovery story. Reviser must: (a) state Loki-required-or-Cloud explicitly;
  (b) seed Loki retention/size for 120 gauges (even as a bounded estimate with re-measure
  instruction); (c) add Loki to backup/restore + V7. Invalid-if: utility already runs
  Loki/Cloud (then M1 collapses to a version-pin note) — but the draft cannot assume it.
- M2 "Single-node self-hosted" asserted without storage math. No bytes/row, rows/day,
  index overhead, rollup sizes, Loki bytes/day, or ack-ledger growth is given; "~98%
  compression" is quoted without the pre-compression baseline it multiplies. For 120
  gauges this is almost certainly still single-node, but "almost certainly" is not an
  estimate the utility can buy a VM against. Reviser must add a bounded estimate table
  (assumed cadence × payload × 365d, before/after compression, + Loki + ack history)
  with the cadence assumption flagged (it is currently unknown — correctly — so the
  table must be parameterized, not point-valued).
- M3 Gauge-side buffer + clock skew unaddressed. Outage recovery says "gauges
  buffer-and-forward" and alerting orders by telemetry timestamp, but: (a) no buffer
  bound/overflow policy (what happens when an outage exceeds gauge storage — drop-oldest,
  drop-newest, stop-ingest?); (b) no clock discipline (telemetry-ts ordering assumes sane
  gauge clocks; no NTP/grace/skew-rejection window). Under a brief whose headline risks
  are late/out-of-order data, both are consequential. Reviser must add buffer-requirement
  + overflow policy + skew policy (e.g., reject/quarantine readings with |ts-now| > X, or
  explicitly accept unsynchronized clocks with stated alert-convergence consequences).
  Invalid-if: gauges are known-good NTP-synced loggers with multi-day store — but that
  fact is not in evidence (gauge reality is correctly listed as unknown), so the policy
  must be conditional, not absent.
- M4 Remote-gauge security underspecified. Draft lists Mosquitto auth choices (correct)
  but never states the end-to-end requirement for 120 REMOTE gauges: TLS required or
  optional? Per-gauge credentials/ACLs or shared? Cert/key provisioning + rotation story?
  NATS/ThingsBoard paths inherit the same gap. P-S01 gives the mechanism knobs
  (password/acl, dynamic-security, tls_version minimum, root drop); the draft must turn
  them into a stated posture (e.g., "TLS 1.2+ mandatory over public links, per-gauge
  identity, private-net anonymous only with explicit risk acceptance"). Invalid-if: gauges
  ride a private APN/VPN — then state that assumption and soften to defense-in-depth.
- M5 Rule-edit state reset dropped from discovery to draft. Discovery P-S04 documents
  verbatim: rule edits (except annotations/interval/internal fields) reset instances to
  Normal — i.e., deploys during an incident can drop firing state. The draft never carries
  this into conditions/runbooks. Reviser must restore it (deploy discipline: freeze rule
  edits during incidents, or re-verify firing state post-deploy). Small fix, material
  consequence.
- M6 1-day-chunk recommendation under-justified. Draft prescribes 1-day chunks ("for this
  scale… not the 7-day default without thought"); discovery says 7-day is "coarse but
  fine" and cites the 25%-RAM recent-chunk rule. Neither computes recent-chunk bytes for
  120 gauges at the (unknown) cadence. Since chunk interval changes DDL + drop/compress
  policies, the reviser must either show the sizing inequality or downgrade 1-day to a
  conditional default ("1-day unless recent-chunk estimate exceeds 25% RAM at measured
  cadence, then re-derive"). Do not assert 1-day as unconditional without the math.

## 4. Minor findings (m1–m8; carry forward, no rework of dispositions)

- m1 History UI boundedness (C03): 5000-alert chart cap ("narrow the time frame") + RBAC
  filtering belong in the operator runbook (storm procedure + role design). One paragraph.
- m2 State history vs notification history terminology (C03: Notifications tab is separate).
  Draft's "ack history" language is correct in intent; make the three-way split explicit:
  state history (Loki) vs notification history (delivery log) vs ack ledger (Postgres).
- m3 Dropped Grafana sizing knobs (discovery P-S04 secondary: min_interval 10s floor,
  evaluation_timeout 30s, 5-min all-instance state save, ~2-eval staleness). At 120 gauges
  defaults are fine — carry them as pinned starting points with "retune past N instances".
- m4 InfluxDB not surveyed (C04 evolution chain noted). O1 breadth is already strong; add
  one paragraph: InfluxDB 3 Core as the evaluated-and-deferred TSDB fork (version must be
  pinned; late/duplicate semantics differ by major) so a reader doesn't mistake absence
  for ignorance. No recommendation change required.
- m5 ntfy attachment expiry (P-S06: 15 MB default, expire after 3h on ntfy.sh). Draft
  already says terse-text-plus-link; make explicit that ack links are dashboard/ledger
  URLs (durable), never ntfy attachments (ephemeral).
- m6 ThingsBoard role caveat (discovery secondary: customer users read-only, cannot ack).
  Carry into architecture-B conditions (operator role = staff user, not customer user).
- m7 NATS hour-scale window memory unquantified. Draft correctly flags "at memory cost"
  and keeps the DB key as backstop — honest. Reviser should add V4's measurement
  instruction (already present) and resist asserting any window size as free.
- m8 Keep-firing value unseeded. `for:` is seeded (≥2–3 evals); keep-firing-for is named
  but not seeded. Seed a starting value (e.g., 1–2 evals) or state "tune from History".

## 5. Validation applicability (V0–V7 + additions)

V0–V7 are discriminating (each pass/fail separates two designs) and honestly PROPOSED
(none claimed as run; executed = doc inspection only — correct, no runtime in stage).
V3 pins the O3 lesson; V4 tests the window-escape backstop; V5 separates stale-vs-error;
V6 tests the 4-state ledger from two ack ingresses; V7 tests restart convergence. Gaps
to add (proposed, not executed — no qualified sandbox claimed here either):
- V8 History-backend gate (from M1/C03): pinned Grafana WITHOUT Loki → History
  unavailable; WITH Loki → available; storm to 5000+ events → cap behavior observed.
- V9 Clock-skew + buffer-overflow (from M3): inject skewed-ts readings (future/past
  beyond policy) + outage exceeding gauge buffer; assert quarantine/overflow policy
  behavior, not silent acceptance.
- V10 TLS/auth posture (from M4): anonymous + plaintext gauge rejected over remote
  listener; per-gauge creds accepted; rotation procedure exercised.
- V11 Rule-edit reset (from M5): fire alert, edit rule (non-exempt field), assert
  documented reset-to-Normal + runbook re-verification step catches it.
No witness was run in this critic stage; all checks above are PROPOSED. Only an existing
qualified sandbox may run witnesses; otherwise proposal-with-honest-status stands.

## 6. Obligation compliance + false-correction sweep

- O1 discovery: 6 deep-dived + 7 honestly-surveyed mechanisms; two materially different
  architectures. Strong. m4 is the only breadth gap, minor.
- O2 behavior/defaults/limits: P-S01…P-S06 excerpts are verbatim with drift notes and
  version pins where visible; critic C01–C04 independently corroborate MQTT-config,
  NATS-dedup, and Grafana-history surfaces. N1 caveat: hypertable UPSERT rests on a
  secondary snippet — verify at build (see §2 P1).
- O3 evolution: Mosquitto 1.x→2.0 chain fully evidenced (verbatim breakage + fix chain +
  downstream churn corroboration); TimescaleDB API/brand chain evidenced; greenfield
  absence honestly stated. Agree.
- O4 per-P: every exact P clause addressed with a named disposition; correction vs
  enhancement vs user-decision vs already-covered vs rejected vs uncertain are
  distinguished. Agree on all six dispositions (see §2).
- O5 retained alternatives/conditions/uncertainty: architectures A/B + conditions +
  optionals + 5 user decisions + uncertainty block all present and self-contained in
  prose. Drops to restore: M1 (Loki), M5 (rule-edit reset), m3/m6 (knobs/roles).
- O6 validations: honest executed/proposed split; discriminating matrix; scope bounded
  to this product. Agree; add V8–V11.
- False-correction sweep: each draft correction/rejection was tested against P-Sxx
  verbatim excerpts + C01–C04. No false correction, no false rejection, no invalid
  P-disposition found. The closest candidates — (i) unconditional P3 rejection, (ii)
  server-authoritative P4 ledger, (iii) 1-day chunks — resolve to (i) stands, (ii)
  stands, (iii) stands-as-default-pending-math (M6). Critic's own invalid-demand risk
  concentrates in M1/M3/M4 conditionality, which is stated inline.

## 7. Uncertainty retained + reviser instructions

Uncertainty (unchanged from draft, endorsed): gauge protocol/cadence/payload, retention/
compliance targets, operator count/hours/on-call + SMS need, all throughput numbers
(doc-derived starting points, not load tests), build-vs-platform + threshold values as
user calls. Added: Loki sizing, gauge buffer/skew realities, TLS posture assumption,
installed-version pins for TimescaleDB/Grafana/NATS/Mosquitto at build time.
Reviser (same fresh agent per M06): address M1–M6 with bounded edits (no re-architecture;
dispositions stand), carry m1–m8 + N1 version checks, add V8–V11 as proposed, keep the
honest executed/proposed split and the immutable-ID discipline (new sources get new IDs;
never rebind C01–C05 or P-S01–P-S06). Usage/billing: unobserved → null.
