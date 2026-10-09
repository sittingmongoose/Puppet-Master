# draft.md — S06 device-alerts planning deliverable (post-reveal, complete)

Scope: small water-utility sensor alert dashboard, 120 remote gauges, late /
out-of-order / duplicate data, understandable alerts + acknowledgement history,
operational triage (not safety control), modest self-hosted budget.
Method: brief-only discovery (`discovery.md`, frozen by `plan-reveal.json`)
compared against the revealed thin plan below. This draft is the complete
planning deliverable for this scope; later stages may correct it.
Source citations [S01–S06] refer to `source-map.json` + `sources/`; all
material claims are stated in full prose here, not by ID alone.

Revealed thin plan (exact, quoted clause by clause):
"P1: Ingest MQTT readings into a time-series database. P2: Alert when the
latest reading exceeds one fixed threshold. P3: Missing readings count as
zero. P4: Clients acknowledge an alert locally then sync. P5: Keep data for a
year. P6: Validate with a static sample CSV."

## O4 — Exact per-P disposition

### P1 "Ingest MQTT readings into a time-series database."
Disposition: ALREADY-COVERED in direction, with CORRECTIONS (underspecified).
MQTT + TSDB is the right spine and matches discovery architecture A. What the
clause omits changes the build: (a) pin the broker major and ship an explicit
config — Mosquitto 2.x binds loopback-only with no listener configured and
defaults `allow_anonymous` to false, so a 1.x-style config silently rejects
all remote gauges after upgrade until a `listener` plus explicit auth
(password/acl files, dynamic-security plugin, or deliberate anonymous) is set
[S01]; (b) MQTT alone does not deduplicate — ingest must be idempotent via a
`(gauge_id, ts)` unique key with `INSERT ... ON CONFLICT DO NOTHING/DO UPDATE`
in TimescaleDB [S03], optionally fronted by NATS JetStream `Nats-Msg-Id`
server-side dedup with the window sized to backfill hours, not the 2-minute
default [S02]; (c) time discipline: `timestamptz` partition column, 1-day
chunks for this scale (not the 7-day default without thought), SI + original
unit + scale per gauge [S03]. Retained: MQTT edge + TSDB core.

### P2 "Alert when the latest reading exceeds one fixed threshold."
Disposition: CORRECTION (major). "Latest" by arrival order is wrong under
late/out-of-order delivery: evaluation must order by TELEMETRY timestamp
(ThingsBoard alarm start-time precedent [S05]), and a single fixed threshold
with no persistence check will flap on partial backfill. Corrected rule shape:
per-gauge (or gauge-class) thresholds with a fixed global default as seed;
evaluation over telemetry-ordered data; pending period (`for:`) of at least
2–3 evaluation intervals before firing; keep-firing interval after recovery;
gauge-silence handled by a SEPARATE staleness rule, never by the threshold
rule (Grafana Normal/Pending/Alerting/Recovering/No Data/Error state model
[S04]). Fixed-threshold-on-latest is retained only as the day-one default
seed, not as the alert semantics.

### P3 "Missing readings count as zero."
Disposition: REJECTED as stated, with CORRECTION. For water gauges zero is a
physical value (no flow / empty tank), while missing means unknown (dead
sensor, backhaul outage, drained battery). Coercing null→0 fabricates
"all clear" or phantom threshold crossings and destroys the silence signal
operators need. Corrected handling: missing stays NULL end to end; Grafana No
Data is a first-class alert state mapped to a dedicated per-gauge "stale feed"
alert, and datasource errors map to Error, never silent Normal [S04]. The
dashboard shows gaps as gaps with "last seen" age per gauge. Nothing in the
brief justifies zero-fill; rejected unconditionally.

### P4 "Clients acknowledge an alert locally then sync."
Disposition: CORRECTION (authority inversion). Local-first ack with later sync
and no arbiter yields split-brain history: two operators ack/clear the same
alarm offline, sync order decides truth, and the audit trail is whichever
write landed last. Corrected design: the SERVER owns the ack ledger
(alarm_id, actor, action ack/clear/comment, timestamp, offline-origin flag);
clients record ack INTENT locally when offline and submit it as a queued
mutation; conflicts resolve to explicit history rows (both intents preserved,
server timestamp orders them), never silent last-writer-wins. Alarm lifecycle
follows the four states Active Unacked / Active Acked / Cleared Unacked /
Cleared Acked with assignee + comments [S05]; Grafana silences and ntfy action
buttons are inputs to this ledger, not replacements for it [S04][S06].
Retained from P4: offline-tolerant queued intent on the client.

### P5 "Keep data for a year."
Disposition: ALREADY-COVERED, with enhancement (mechanism). One-year online
retention for raw readings is reasonable for this scale and budget. Mechanism:
1-day chunks, drop-chunks policy at 365 days, columnstore compression policy
(`after` = chunk interval, up to ~98% reduction) [S03]; continuous aggregates
(hourly/daily rollups) keep year-scale dashboards fast; ALARM + ACK history
retention is a separate decision (recommend ≥2 years or indefinite — it is
tiny and is the compliance trail). Storage estimate stays single-node
self-hosted. Open user decision: whether any regulatory retention exceeds one
year (unknown; assumed no).

### P6 "Validate with a static sample CSV."
Disposition: already-covered AS SMOKE SEED, with enhancement (full matrix).
A static CSV is a fine ingest smoke test and is retained as seed data, but it
cannot discriminate any of the brief's actual risks: duplicates, lateness,
reordering, reconnect storms, broker-upgrade breakage, silence-vs-error, or
ack conflicts. The discriminating validation matrix V1–V7 below (O6) replaces
CSV-only validation; CSV remains step zero.

## Retained findings, conditions, alternatives

RECOMMENDED (architecture A, compose-your-own): Mosquitto 2.x pinned with
explicit listener + auth + persistence volume [S01] → small ingest service
(validate, stamp ingest_ts, UPSERT by (gauge_id, ts)) → TimescaleDB
(timestamptz, 1-day chunks, unique key, 1-year raw + rollups + columnstore)
[S03] → Grafana dashboards + Unified Alerting (telemetry-ordered rules,
`for:` ≥ 2 evals, separate staleness rules) [S04] → ntfy priority-mapped push
(Critical→5 … Minor→2) with ack-link action buttons [S06] → Postgres
server-authoritative ack ledger. Outage recovery: gauges buffer-and-forward;
broker persistence on; batched backfill (≥1000 rows); alerts converge without
operator reset. Upgrade path: add NATS JetStream with stable Msg-Id
(gauge+ts+seq) and hour-scale dedup window when MQTT redelivery storms hurt;
DB key remains the backstop outside any window [S02].

ALTERNATIVE (architecture B, platform): ThingsBoard Community Edition —
device registry, MQTT/HTTP/CoAP telemetry, rule chains, originator+type
unique alarms (one active per gauge+type; repeats escalate, never duplicate),
telemetry-timestamp onset, 4-state ack lifecycle, notification center
(web/email/SMS/Slack/Teams) [S05]. Least assembly, Apache-2.0 self-hosted.
Conditions: CE/PE feature split re-verified at build; single-stack
upgrade coupling accepted; backfill-storm throughput load-tested.

Conditions on either path: this is TRIAGE, not safety control — no actuation,
no safety interlocks, alerts worded as "investigate", on-call hours and SMS
requirement confirmed with the utility. Single-node self-hosted deploy
(Docker Compose on one modest VM) suffices for 120 gauges; clustering
(EMQX/NanoMQ, VictoriaMetrics, multi-node NATS) is future expansion, not
day one — surveyed, not vetted.

Optional capabilities (do only if asked): public status page; SMS fallback
beyond ntfy push; per-customer multi-tenancy; LoRa/Modbus legacy gateway;
ML anomaly detection alongside thresholds (thresholds stay primary).

## User decisions (not derivable from brief)
1. Build (A) vs platform (B) — skill/cost fit. 2. Threshold values per gauge
class + who approves changes. 3. On-call hours, escalation chain, SMS needed?
4. Retention beyond one year for raw vs alarm/ack history (regulatory?).
5. Gauge protocol reality check (MQTT? cadence? payload? legacy bus?).

## Uncertainty retained
Gauge protocol/cadence/payload, retention/compliance targets, operator
count/hours, and all throughput numbers (chunk sizes, batch sizes, eval
intervals are doc-derived starting points, not load-test results). CE-vs-build
and threshold values are user calls. Later stages may correct this draft.

## O6 — Validations: executed vs proposed (honest split)

EXECUTED in this research stage: primary-source documentation inspection for
S01–S06 only (exact URLs, versions, access window, verbatim excerpts in
`sources/`). No code was run; no broker, database, Grafana, ThingsBoard, or
ntfy instance was started. The following are PROPOSED, each discriminating
(pass/fail tells two designs apart), none claimed as run:
V1 Duplicate-storm: replay 10k readings ×3 with same IDs; exactly one row per
(gauge_id, ts), one alarm per originator+type. V2 Late/out-of-order: 6h-late
shuffled inject; onset uses telemetry ts; no phantom clear/re-fire. V3
Broker-upgrade: 1.x config vs Mosquitto 2.x; gauges rejected until
listener+auth set, then green (pins the O3 lesson). V4 Dedup-window (if NATS):
republish outside window; DB key absorbs it; window memory measured. V5
Silence-vs-error: kill one feed; "stale" fires; datasource errors → Error,
never silent Normal. V6 Ack-ledger: ack from dashboard AND ntfy button;
single history rows with actor+ts; 4-state lifecycle visible. V7 Restart
recovery: kill broker+ingest mid-backfill; resume with no loss/duplicates,
alerts converge unaided. V0 (retained from P6): static CSV ingest smoke seed.
