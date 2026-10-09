# final.md — S06 device-alerts complete planning deliverable (reviser, M06 treatment)

Scope: small water-utility sensor alert dashboard for 120 remotely connected gauges. Data arrive
late, out of order, sometimes duplicate. Operators need understandable alerts and acknowledgement
history. Operational triage, NOT automated safety control. Modest self-hosted budget. Investigate
products, transport/storage/alert mechanisms, version behavior, outage recovery, future expansion.

Method note: this reviser first derived `evidence-first.md` (saved 2026-10-09T19:22Z) from the
brief plus independently chosen public primary sources R-EF-01..09 WITHOUT opening any draft;
frozen predecessors (research draft/discovery/source-map/revealed-plan, critic
source-map/critique/evidence-first) were opened only after that save, per M06 v1
evidence-first-challenge. What follows is ONE coherent complete final covering O1–O6 and every
exact P clause, with an explicit verdict on every criticism. Source IDs (S01–S06 research,
C01–C05 critic, R-EF-01..09 reviser) accompany full prose and never replace it: every material
claim is stated here in words.

Executed vs proposed (honest split, all stages): executed = primary-source documentation
inspection only (read-only page fetches, verbatim excerpts retained in each stage's `sources/`).
No code was run; no broker, database, Grafana, ThingsBoard, Loki, or ntfy instance was started
in any stage. Every V-check below is PROPOSED. No qualified sandbox was available or claimed.

## 1. O4 — Exact per-P dispositions (all six, with corrections)

Revealed thin plan, exact: "P1: Ingest MQTT readings into a time-series database. P2: Alert when
the latest reading exceeds one fixed threshold. P3: Missing readings count as zero. P4: Clients
acknowledge an alert locally then sync. P5: Keep data for a year. P6: Validate with a static
sample CSV."

### P1 "Ingest MQTT readings into a time-series database."
Disposition: ALREADY-COVERED in direction (matches pre-reveal architecture A; discovery predates
reveal per plan-reveal.json, so no circularity), with CORRECTIONS — the clause as stated is
unbuildable without them.
(a) Pin the broker major and ship an explicit config. Eclipse Mosquitto 2.x with no listener
binds loopback only, so remote gauges cannot connect; any configured listener binds all
interfaces but `allow_anonymous` now defaults to false, so a 1.x-style config silently rejects
all remote gauges after upgrade until a `listener` plus explicit auth (password/acl files,
dynamic-security plugin, or deliberate anonymous) is set; the broker drops root to the
`mosquitto`/`nobody` user after reading config, so persistence/log/TLS paths need matching
ownership; `tls_version` is now a minimum (TLS 1.0 disabled). (b) MQTT alone does not
deduplicate: QoS 1 is at-least-once and redelivery duplicates; retain is per-topic last value,
not history. Ingest must be idempotent via a `(gauge_id, ts)` unique key with
`INSERT ... ON CONFLICT DO NOTHING/DO UPDATE` in TimescaleDB — medium-confidence, verify
`ON CONFLICT` against the installed TimescaleDB version at build (see N1) — optionally fronted
by NATS JetStream `Nats-Msg-Id` server-side dedup with the window sized to backfill hours, not
the 2-minute default (window memory is a measured cost, never free). (c) Time discipline:
`timestamptz` partition column (the default partition column is the first timestamp column, so
epoch ints or naive timestamps silently mispartition), chunk interval as a conditional default
(see M6), SI unit plus original unit plus scale factor stored per gauge. (d) NEW from reviser
evidence: Mosquitto queue/persistence numbers are now pinned — persistence defaults OFF (memory
only; enable with location, saves on close / every `autosave_interval` default 1800 s / SIGUSR1),
`max_queued_messages` default 1000 per client above in-flight with silent-drop overflow,
`max_inflight_messages` default 20 (1 guarantees ordering), QoS 0 for offline persistent
clients NOT queued by default; pin Mosquitto ≥2.0.22 for the queue-limit fix chain (see O3).
Retained from P1: MQTT edge plus time-series core.

### P2 "Alert when the latest reading exceeds one fixed threshold."
Disposition: CORRECTION (major). "Latest" by arrival order is wrong under late/out-of-order
delivery: evaluation must order by TELEMETRY timestamp (a late reading keeps its true onset;
repeated same-condition events update the live alert rather than duplicating it), and a single
fixed threshold with no persistence check flaps on partial backfill. Corrected rule shape:
per-gauge (or gauge-class) thresholds with one fixed global default kept only as the day-one
seed; evaluation over telemetry-ordered data; pending period (`for:`) of at least 2–3 evaluation
intervals before firing; keep-firing interval after recovery seeded at 1–2 evaluation intervals
then tuned from History (see m8); gauge silence handled by a SEPARATE staleness rule, never by
the threshold rule, using the six-state model Normal / Pending / Alerting / Recovering (keep
firing) / No Data / Error. NEW from reviser evidence: Alertmanager grouping governs operator
noise at 120-gauge scale — `group_wait` default 30 s (first-notification hold; sub-wait resolves
never notify, which filters flaps), `group_interval` default 5 m (re-tick; also caps the notify
pipeline timeout), `repeat_interval` default 4 h (keep a multiple of group_interval),
`resolve_timeout` default 5 m; design `group_by` as site-then-gauge so one site event reads as
one group, not 120 pages. Fixed-threshold-on-latest is retained only as the seed, never as the
alert semantics.

### P3 "Missing readings count as zero."
Disposition: REJECTED as stated, unconditionally, with CORRECTION. For water gauges zero is a
physical value (no flow, empty tank) while missing means unknown (dead sensor, backhaul outage,
drained battery) — including for counter-type gauges, where unknown count differs from known
zero. Coercing null to zero fabricates "all clear" or phantom threshold crossings and destroys
the silence signal operators need. Corrected handling: missing stays NULL end to end; No Data is
a first-class alert state mapped to a dedicated per-gauge "stale feed" alert; datasource errors
map to Error, never silent Normal; the dashboard renders gaps as gaps with "last seen" age per
gauge. Nothing in the brief justifies zero-fill.

### P4 "Clients acknowledge an alert locally then sync."
Disposition: CORRECTION (authority inversion). Local-first ack with later sync and no arbiter
yields split-brain history: two operators ack/clear the same alarm offline, sync order decides
truth, and the audit trail is whichever write landed last. Corrected design: the SERVER owns the
ack ledger with rows of (alarm identity, actor, action among ack/clear/comment, server
timestamp, offline-origin flag); clients record ack INTENT locally when offline and submit it as
a queued mutation; conflicts resolve to explicit history rows (both intents preserved, server
timestamp orders them), never silent last-writer-wins. Alarm lifecycle follows the four states
Active Unacked / Active Acked / Cleared Unacked / Cleared Acked with assignee plus comments;
Grafana silences and ntfy action buttons are inputs to this ledger, not replacements for it.
Distinguish three histories explicitly (see m2): alert STATE history (Loki-backed event log) vs
NOTIFICATION history (delivery log) vs the ack LEDGER (Postgres operator-audit table). Retained
from P4: offline-tolerant queued intent on the client.

### P5 "Keep data for a year."
Disposition: ALREADY-COVERED, with enhancement (mechanism + math). One-year online retention for
raw readings is reasonable for this scale and budget. Mechanism: conditional chunk default (see
M6), drop-chunks policy at 365 days, columnstore compression policy (`after` = chunk interval,
up to ~98% reduction — verify against Hypercore-era docs at build, see R-EF-09 note), continuous
aggregates (hourly/daily rollups) to keep year-scale dashboards fast; ALARM plus ACK history
retention is a SEPARATE decision (recommended ≥2 years or indefinite — tiny and the compliance
trail); Loki state-history retention is a third separate decision (see M1). Storage is shown as
a parameterized estimate, not an assertion (see M2). Open user decision: whether any regulatory
retention exceeds one year (unknown; assumed no).

### P6 "Validate with a static sample CSV."
Disposition: already-covered AS SMOKE SEED, with enhancement (full matrix). A static CSV is a
fine ingest smoke test and is retained as step zero (V0), but it cannot discriminate any of the
brief's actual risks: duplicates, lateness, reordering, reconnect storms, broker-upgrade
breakage, silence-vs-error, ack conflicts, History-backend absence, clock skew, TLS posture, or
rule-edit resets. The discriminating validation matrix V0–V11 (section 7) replaces CSV-only
validation.

## 2. Criticism dispositions (every finding, explicit verdict with evidence)

### Material findings M1–M6

- M1 Grafana History hard dependency + sizing missing — ACCEPTED. Critic evidence C03 is
verbatim and decisive: "Grafana OSS and Grafana Enterprise users must configure alert state
history in Loki to view the History page and State history view." Predecessor S04 covered
evaluation states but not the History backend, so the draft's "queryable state history" implied
a capability with an invisible mandatory component. Change: architecture A now lists Loki
(or Grafana Cloud, as the stated alternative) as REQUIRED, with retention/size as a bounded
parameterized estimate, and Loki joins backup/restore plus restart-recovery validation (V7/V8).
The demand softens exactly as the critic states if the utility already runs Loki/Cloud — then
this collapses to a version-pin note — but the plan cannot assume it.
- M2 "Single-node self-hosted" asserted without storage math — ACCEPTED. The draft quoted ~98%
compression with no baseline and gave no bytes/row, cadence, index, rollup, Loki, or ledger
numbers. Change: section 5 carries a parameterized estimate table (cadence × payload × 120
gauges × 365 days, before/after compression, plus Loki plus ack ledger) with every assumption
flagged and a re-measure instruction; the cadence stays correctly unknown, so the table is
parameterized, never point-valued.
- M3 Gauge-side buffer + clock skew unaddressed — ACCEPTED. "Gauges buffer-and-forward" with no
bound and telemetry-timestamp ordering with no clock discipline leaves the brief's headline
risks (late/out-of-order) half-specified. Change: section 5 states conditional buffer and skew
policies — required buffer hours with an explicit overflow policy (drop-oldest with gap marking
is the default recommendation; drop-newest and stop-ingest named as rejected-for-this-brief
alternatives unless the utility says otherwise) and a skew policy (reject-or-quarantine readings
with |event_ts − now| beyond X, default proposal X = 24 h, quarantine table reviewable by
operators). Softens if gauges prove to be NTP-synced loggers with multi-day store — that fact
is not in evidence, so the policy is conditional, not absent.
- M4 Remote-gauge security underspecified — ACCEPTED as a stated-posture requirement (AMENDED in
strength: posture, not mechanism design). The draft listed Mosquitto auth knobs without turning
them into an end-to-end requirement. Change: section 5 states the posture — TLS 1.2+ mandatory
over public links (Mosquitto `tls_version` is a minimum, so `tlsv1.2` admits 1.2+1.3), per-gauge
identity with least-privilege topic ACLs, documented provisioning/rotation procedure; anonymous
or plaintext allowed only on explicitly declared private links (APN/VPN) with written risk
acceptance. Softens to defense-in-depth if gauges ride a private APN/VPN — stated as the
condition, not assumed. NATS and ThingsBoard paths inherit the same posture paragraph.
- M5 Rule-edit state reset dropped from discovery to draft — ACCEPTED. Discovery documented
verbatim that rule edits (except annotations/interval/internal fields) reset instances to
Normal; the draft never carried it forward. Change: restored as deploy discipline in section 5
conditions/runbook — freeze non-exempt rule edits during active incidents, re-verify firing
state after every deploy — plus proposed validation V11. Small fix, material consequence.
- M6 1-day-chunk recommendation under-justified — ACCEPTED. Neither draft nor discovery computed
recent-chunk bytes for 120 gauges at the unknown cadence against the cited ~25%-of-RAM rule, and
discovery itself called 7-day "coarse but fine." Change: 1-day is DOWNGRADED to a conditional
default — "1-day unless the recent-chunk estimate exceeds ~25% RAM at measured cadence, then
re-derive" — with the sizing inequality shown in section 5. No unconditional 1-day assertion.

### Minor findings m1–m8

- m1 History UI boundedness (5000-alert chart cap, RBAC filtering) — ACCEPTED, carried as one
runbook paragraph: storm procedure narrows time frames and uses pre-aggregated counts; role
design follows rule-permission filtering.
- m2 State vs notification vs ack terminology — ACCEPTED, made explicit everywhere (see P4):
state history (Loki event log) vs notification history (delivery log, Notifications tab) vs ack
ledger (Postgres operator audit). Silence/mute never equals acknowledgement.
- m3 Dropped Grafana sizing knobs — ACCEPTED as pinned starting points: `min_interval` 10 s
floor, `evaluation_timeout` 30 s, all-instance state save every 5 min in one transaction, stale
instances resolving after ~2 missed evaluations. Fine at 120 gauges; retune past stated
instance counts.
- m4 InfluxDB not surveyed — ACCEPTED as a one-paragraph evaluated-and-deferred note (no
recommendation change). InfluxDB 3 Core is the current self-hosted generation to pin; "InfluxDB"
unversioned is ambiguous across the 1.x/2.x/3 engine generations with migration and compat-write
APIs as first-class concerns. Reviser adds pinned v2 write semantics for the record: identity is
measurement + tag set + timestamp, duplicates union fields with per-field last-write-wins, and
preservation needs a unique tag or timestamp nudge.
- m5 ntfy attachment expiry — ACCEPTED: ack links are durable dashboard/ledger URLs, never ntfy
attachments (default max 15 MB, 3 h expiry on ntfy.sh; self-hosted values operator-configured).
Alert text stays terse (4096-byte message cap) with a click/action link.
- m6 ThingsBoard role caveat — ACCEPTED: customer users are read-only and cannot ack; architecture
B conditions require operator = staff-level user, with role design verified at build.
- m7 NATS hour-scale window memory unquantified — ACCEPTED as honest-uncertainty retained: the
plan keeps "window at memory cost" plus the DB key backstop and V4's measurement instruction,
and asserts no window size as free. Maximum window bounds and per-ID overhead stay unpinned.
- m8 Keep-firing value unseeded — ACCEPTED: seeded at 1–2 evaluation intervals, then tuned from
History. (`for:` stays ≥2–3 evals.)

### Cross-cutting caveat N1 (hypertable UPSERT rests on a secondary snippet)
Verdict: RETAIN UNCERTAINTY with a build gate — AMENDED, not rejected. I independently
re-opened predecessor excerpt S03: the `ON CONFLICT` UPSERT claim is indeed corroborated by a
search snippet from the writing-data doc, not by a primary verbatim excerpt, while the
verbatim excerpts pin partitioning, chunk default, indexes, columnstore, batch guidance, the
unique-constraint/direct-compress exclusion, and the hypertable-FK ban. The mechanism is
plausible and load-bearing (it is the dedup backstop outside any NATS window), so the final
keeps it as medium-confidence with an explicit verify-against-installed-version gate in P1 and
V1/V4, rather than asserting or deleting it. Related drift flag from reviser evidence R-EF-09:
compression docs are now headed "Superseded by Hypercore" with APIs still supported — no
migration required, but chunk/compress behavior must be re-verified against Hypercore-era docs
at build; P-S03 governs as frozen evidence, R-EF-09 governs as the drift warning.

### Critic-agreement record (evidence-first comparison, my independent check)
My evidence-first derivation (R-EF-01..09, saved before opening the draft) independently agrees
with the draft on: Mosquitto needs explicit persistence/queue/auth design (and I add the exact
pinned numbers the critic left unpinned: persistence off, autosave 1800 s, 1000/20 queue and
inflight defaults, QoS0-not-queued); MQTT never solves dedup alone; JetStream Msg-Id dedup is
window-bounded with a DB backstop; Influx identity/dedup semantics need version pinning; ntfy
fits as a cheap self-hosted push tier with a message cache. It partially extends the draft on:
Alertmanager grouping numbers (30 s / 5 m / 4 h / 5 m) for P2 noise control; VictoriaMetrics
dedup/retention semantics (biggest-timestamp per `-dedup.minScrapeInterval`, biggest-value
tie-break, 1-month default retention, backfill/future caps) strengthening the surveyed-not-vetted
note; and a NEW O3 chain (Mosquitto 2.0.x `max_queued_messages=0` fix in 2.0.22, issue #3244).
No false correction or false rejection was found in any P disposition; the critic's verdict on
all six dispositions is endorsed (sections 1–2 show the per-P evidence).

## 3. O1 — Discovery retained (tools, products, materially different approaches)

Deep-dived (six, primary-sourced): (1) Eclipse Mosquitto 2.x — MQTT edge transport; 2.0
secure-default breakage changes every deploy recipe; dynamic-security plugin replaces static
files; queue/persistence numbers now pinned (R-EF-01). (2) NATS JetStream — durable stream with
`Nats-Msg-Id` duplicate window (2-minute default, hour-scale at memory cost) plus
`Nats-Expected-Last-Subject-Sequence` ordering guards; materially different from bare MQTT.
(3) TigerData/TimescaleDB hypertables — chunk partitioning, `timestamptz` discipline, unique-key
UPSERT dedup (medium confidence, N1), columnstore compression; turns "Postgres" into a different
storage design (Hypercore drift flag noted). (4) Grafana Unified Alerting — Pending period,
keep-firing, No Data/Error as first-class states, per-series alert instances, notification-policy
tree; evaluation semantics define "understandable alerts." (5) ThingsBoard CE alarms — registry,
MQTT/HTTP/CoAP telemetry, rule chains, originator+type uniqueness (one active alarm per
gauge+type; repeats escalate), telemetry-timestamp onset, 4-state ack lifecycle, notification
center; the buy-instead-of-build path. (6) ntfy — self-hosted pub/sub push with priorities
1–5, action buttons, 4 KiB cap; SQLite default or Postgres, message cache for missed
notifications; replaces an SMS vendor for day one.
Surveyed-but-not-deep-dived (honest status, no primary claims beyond the noted line each):
EMQX/NanoMQ (clustered MQTT), VictoriaMetrics (single-binary TSDB — reviser adds real semantics:
interval dedup with biggest-ts/biggest-value rule, 1-month default retention, community single
retention only), Telegraf MQTT consumer, Node-RED protocol glue, Gotify, Uptime Kuma
(liveness only), InfluxDB 3 Core (evaluated-and-deferred fork, version must be pinned).
Two materially different architectures retained: A compose-your-own (section 5) vs B platform
(ThingsBoard CE, section 5). NATS JetStream retained as the ingest upgrade path when MQTT
redelivery storms hurt.

## 4. O2 — Consequential behavior, defaults, units/types, limits (applicability)

Transport: Mosquitto loopback-only with no listener; listener binds all interfaces with
`allow_anonymous=false`; root drop to `mosquitto`/`nobody`; `tls_version` minimum; persistence
OFF default with 1800 s autosave; per-client queue 1000 silent-drop; inflight 20 (1 = ordered);
QoS0 not queued offline by default; retained last-value only. MQTT gives at-most/at-least-once
delivery only — dedup downstream. JetStream: streams persist and replay; Msg-Id dedup within
`duplicate_window` (default 2 m), ID-only key, `PubAck.duplicate` on repeat, sequences from 1
never reused, PubAck is the only proof of storage, timeout means retry-with-same-ID, Expected-Last-
Subject-Sequence fails out-of-order retries fast; stored ≠ delivered (consumers redeliver
at-least-once). Storage: TimescaleDB `CREATE TABLE ... WITH (tsdb.hypertable)` since 2.20
(legacy `create_hypertable()` still documented); default partition column = first timestamp
column — always declare `timestamptz`; `tsdb.chunk_interval` default 7 days; default descending
index on partition column; batch ≥1000 rows (single-row falls back to uncompressed insert);
up to ~98% columnstore compression with `after` = chunk interval on a 1-day schedule;
unique/exclusion constraints exclude direct-compress fast ingest; hypertable↔hypertable FKs
banned; old-chunk UPSERT slower than append (batch backfill, binary COPY); store SI + original
unit + scale per gauge, `timestamptz` everywhere, never local-time strings. Alerting: states
Normal/Pending/Alerting/Recovering/No Data/Error; `for:` ≥ 2–3 evals, keep-firing 1–2 evals;
No Data → per-gauge staleness alert, errors → Error; `min_interval` 10 s, `evaluation_timeout`
30 s, 5-minute all-instance state save, ~2-eval staleness; rule edits reset to Normal (M5);
grouping 30 s / 5 m / 4 h / 5 m with site-then-gauge `group_by`. History/ack: Loki REQUIRED for
OSS/Enterprise History page (M1); 5000-event chart cap (narrow the frame; pre-aggregate storms);
RBAC filtering; Notifications tab separate; silences never equal acks. ThingsBoard: one active
alarm per originator+type, 4-state lifecycle, telemetry Start Time, severity escalation,
propagation, CE Apache-2.0 with PE-split re-verification. ntfy: priorities Critical→5, Major→4,
staleness→3, Minor→2; 4 KiB cap; durable-URL ack links only.

## 5. Recommended shape, alternatives, conditions, estimates, decisions, uncertainty

RECOMMENDED (architecture A, compose-your-own): Mosquitto 2.x pinned ≥2.0.22 with explicit
listener + auth + persistence volume and tuned queues → small ingest service (validate, stamp
ingest_ts, UPSERT by gauge+ts with N1 build gate) → TimescaleDB (`timestamptz`, conditional
chunk default per M6, unique key, 1-year raw + rollups + columnstore with Hypercore re-check) →
Grafana dashboards + Unified Alerting (telemetry-ordered rules, `for:` ≥ 2 evals, separate
staleness rules, site-then-gauge grouping) + REQUIRED Loki (or Cloud) for state history → ntfy
priority-mapped push with durable ack-link action buttons → Postgres server-authoritative ack
ledger (P4 shape). Outage recovery: gauges buffer-and-forward within the stated buffer/overflow
policy (M3); broker persistence on; idempotent ingest; batched backfill (≥1000 rows); alerts
converge without operator reset; Loki retained and restored alongside the DB.
ALTERNATIVE (architecture B, platform): ThingsBoard CE — device registry, MQTT/HTTP/CoAP
telemetry, rule chains, originator+type alarms, telemetry-timestamp onset, 4-state ack lifecycle,
notification center. Least assembly, Apache-2.0 self-hosted. Conditions: CE/PE split re-verified
at build; single-stack upgrade coupling accepted; backfill-storm throughput load-tested;
operator role = staff user, never read-only customer user (m6).
UPGRADE PATH (both): add NATS JetStream with stable Msg-Id (gauge+ts+seq) and hour-scale window
when MQTT redelivery storms hurt; DB key remains the backstop outside any window; window memory
measured (V4), never assumed free.
CONDITIONS (either path): TRIAGE, not safety control — no actuation, no safety interlocks,
alerts worded "investigate"; on-call hours + SMS need confirmed with the utility; single-node
self-hosted Docker Compose on one modest VM suffices for 120 gauges (per the estimate below);
clustering (EMQX/NanoMQ, VictoriaMetrics, multi-node NATS) is future expansion, not day one;
TLS/per-gauge-identity posture per M4; rule-edit deploy freeze per M5; 5000-event/RBAC storm
procedure per m1; three-history terminology per m2; Grafana knob starting points per m3.
OPTIONAL (do only if asked): public status page; SMS fallback beyond ntfy; per-customer
multi-tenancy; LoRa/Modbus legacy gateway; ML anomaly detection alongside thresholds (thresholds
stay primary).
PARAMETERIZED ESTIMATE (M2 — assumptions flagged, re-measure at build): let cadence C
readings/gauge/hour (UNKNOWN — table parameterized at C = 1, 4, 12, 60), payload B bytes/row
(assume 200 incl. columns+index amortized; measure), gauges G = 120, days D = 365.
Raw rows/year = G × C × 24 × D (e.g. C=4: ~4.2M rows; C=60: ~63M rows). Raw bytes ≈ rows × B
(C=4: ~0.8 GiB; C=60: ~12.6 GiB). After ≤98% columnstore (verify): tens of MB to single GB.
Rollups (hourly+daily): <10% of raw. Recent-chunk (M6 inequality): daily-chunk bytes ≈
G × C × 24 × B compressed — must stay ≤ ~25% RAM (e.g. C=4: ~2.3 MB/day raw — trivially fine;
recompute at measured C; re-derive interval if violated). Loki (M1): alert-STATE events only
(state changes, not readings) — bound at E events/day (assume 10–200 incl. flaps; measure),
~1 KiB/event → 3.6–73 MB/year before Loki compression; size Loki retention ≥ ack-trail horizon.
Ack ledger: operator actions only (assume <100/day, ~0.5 KiB/row → <20 MB/year); ≥2-year or
indefinite retention recommended. Conclusion: single-node holds across the plausible cadence
range, but the VM is bought against MEASURED C, not this table.
CHUNK RULE (M6): 1-day default unless recent-chunk estimate > ~25% RAM at measured cadence.
BUFFER/SKEW (M3): require ≥H hours gauge buffering (H from utility's worst backhaul outage;
default proposal 72 h), overflow = drop-oldest with explicit gap marking; skew gate
|event_ts − now| > 24 h → quarantine table for operator review, never silent ingest.
SECURITY (M4): TLS 1.2+ over public links, per-gauge identity + least-privilege ACLs, rotation
runbook; private-link exceptions written and risk-accepted.
USER DECISIONS (not derivable): (1) build A vs platform B; (2) threshold values per gauge class
+ approver; (3) on-call hours, escalation chain, SMS needed; (4) raw vs alarm/ack/Loki retention
beyond one year (regulatory?); (5) gauge protocol reality (MQTT? cadence? payload? legacy bus?
buffer depth? clock discipline?); (6) Loki-vs-Cloud for state history if Loki already exists.
UNCERTAINTY RETAINED: gauge protocol/cadence/payload/buffer/clocks; retention/compliance
targets; operator count/hours/SMS; all throughput numbers as doc-derived starting points, not
load tests; CE-vs-build and thresholds as user calls; installed-version pins
(Mosquitto/TimescaleDB/Grafana+Loki/NATS/ntfy) verified at build; NATS window bounds/overhead;
ntfy numeric cache/rate defaults; TimescaleDB UPSERT (N1) and Hypercore-era compression
behavior. Later stages may correct this final only through the same evidence discipline.

## 6. O3 — Issue/fix/regression/release chains (evidence or explicit absence)

Primary chain 1 (research S01, fully evidenced): Mosquitto 1.x → 2.0 secure-default breakage —
forgiving 1.x defaults became loopback-only + `allow_anonymous=false` + immediate root drop;
upgrade without config change rejects remote gauges and breaks TLS/persistence paths; fix =
explicit listener + auth choice + ownership + `tls_version` minimum; downstream Docker/README
churn corroborates. Lesson: pin the broker major and integration-test gauge reconnect per
version. Primary chain 2 (reviser R-EF-02, NEW): Mosquitto 2.0.x queue-limit semantics — 2.0.0
set `max_queued_messages` default 1000; 2.0.3 fixed QoS0-not-delivered-when-0 (#1956) plus
persistence/SIGHUP fixes; issue #3244 showed 0 (documented unlimited) treated as exceeded with
"Quota exceeded" errors and proposed the `> 0` guard; 2.0.22 shipped "0 treated as unlimited
(closes #3244)" plus bridge fixes. Lesson: the exact knob this dashboard's outage recovery
depends on changed meaning across releases — pin ≥2.0.22 and test 0-vs-1000-vs-unset (V3).
Secondary chain (research S03): TimescaleDB API/brand evolution — `create_hypertable()` →
`WITH (tsdb.hypertable)` since 2.20, TimescaleDB→TigerData brand migration, auto columnstore
policy; drift warning (reviser R-EF-09): compression headed "Superseded by Hypercore," APIs
still supported — re-verify at build. Context chain (critic C04 + reviser R-EF-04): InfluxDB
1.x/2.x/3 generations with migrate guides and compat write APIs — "InfluxDB" unversioned is
untestable; v2 duplicates union with per-field last-write-wins. Absent/inapplicable: no
project-specific tracker exists (greenfield); no regression in our code to report.

## 7. O6 — Validations V0–V11 (all PROPOSED; executed = doc inspection only)

V0 CSV smoke seed (retained from P6): static sample ingests green. V1 Duplicate-storm: replay
10k readings ×3 with same IDs; exactly one row per (gauge+ts) — exercises the N1 UPSERT gate —
one alarm per originator+type. V2 Late/out-of-order: 6 h-late shuffled inject; onset uses
telemetry ts; no phantom clear/re-fire; `for:` absorbs partial backfill. V3 Broker-upgrade:
1.x config vs Mosquitto ≥2.0.22; gauges rejected until listener+auth set, then green; plus
0-vs-1000-vs-unset queue-limit truth with a persistent subscriber offline (pins both O3
chains). V4 Dedup-window (if NATS): republish inside vs outside window; DB key absorbs escapes;
window memory vs hours measured. V5 Silence-vs-error: kill one feed; "stale" fires; datasource
errors → Error, never silent Normal. V6 Ack-ledger: ack from dashboard AND ntfy button; single
history rows with actor+ts; 4-state lifecycle visible; state/notification/ledger split
observable. V7 Restart recovery: kill broker+ingest+Loki mid-backfill; resume with no
loss/duplicates, alerts converge unaided, ack + state history intact (M1 backup/restore
included). V8 History-backend gate (from M1): pinned Grafana WITHOUT Loki → History
unavailable; WITH Loki → available; storm past 5000 events → cap behavior observed. V9
Clock-skew + buffer-overflow (from M3): inject future/past readings beyond policy + outage
exceeding gauge buffer; assert quarantine/overflow behavior, never silent acceptance. V10
TLS/auth posture (from M4): anonymous+plaintext rejected on the remote listener; per-gauge
creds accepted; rotation exercised. V11 Rule-edit reset (from M5): fire alert, edit a
non-exempt rule field, assert documented reset-to-Normal with the runbook re-verification step
catching it. Each V-check is discriminating (pass/fail separates two designs); none is claimed
as run; only an existing qualified sandbox may run witnesses.

## 8. Obligation compliance + source discipline

O1: six deep-dived mechanisms + eight honestly-surveyed + two architectures + upgrade path —
strong; m4 closed with the Influx fork paragraph. O2: verbatim defaults/limits/units with drift
notes and version pins, extended with pinned Mosquitto queue numbers, Alertmanager grouping,
VM/Influx semantics, and the Hypercore drift flag. O3: two Mosquitto chains + Timescale +
Influx chains fully evidenced; greenfield absence honestly stated. O4: every exact P clause
addressed with a named disposition distinguishing correction, enhancement, user decision,
already-covered, rejected, and uncertain. O5: alternatives, conditions, optionals, six user
decisions, and full uncertainty retained in self-contained prose — no ID-instead-of-text. O6:
honest executed/proposed split, discriminating V0–V11 matrix, scope bounded to this product.
Source discipline: research IDs S01–S06, critic IDs C01–C05, and reviser IDs R-EF-01..09 are
immutable; no ID was rebound; corrections use new IDs. Usage/billing: unobserved → null.
