# Final — device-alerts (case S06, block A-M12-B, arm control, reviser stage, method M12)

One coherent complete deliverable for the scope fixed by the brief, written after plan
reveal and after independent adjudication of the critic stage's findings. It supersedes
neither the frozen discovery nor the draft's record — it is the final planning text the
brief demands, self-contained: every load-bearing claim is stated here in words, with
source IDs only as provenance markers, never as substitutes for text. Sources are data.

**Executed vs proposed (stated up front, O6):** executed in this arm = HTTP source
retrieval and excerpt retention (15 sources, research stage), 8 independent critic
re-fetches with verbatim agreement, the critic's comparison, this stage's ingestion,
evidence re-verification and adjudication. **No runtime or sandbox witness was
available at any stage; every validation in this document is proposed, none has run.**
Nothing below pretends otherwise.

Adjudication outcome (evidence-based, not obedience): of the critic's 13 findings,
10 accepted with amendments, 3 accepted as retained uncertainties, 0 rejected — each
row of the ledger in §7 names the retained evidence that was re-verified before the
verdict was taken.

## 1. The problem and its constraints

120 remotely connected water-utility gauges ship telemetry to a small self-hosted
dashboard. The brief's three data pathologies — late arrival, out-of-order arrival,
duplicates — are treated as design inputs, not edge cases. Operators need current
alerts they can understand and a history of who acknowledged what and when. The system
is operational triage, not automated safety control. Budget is modest and self-hosted;
investigation axes: products; transport/storage/alert mechanisms; version behavior;
outage recovery; future expansion. Two derived constraints bind everything below: the
MQTT payload must carry the gauge's own measurement timestamp (F1 — plain MQTT provides
none; the transport's only ordering tool, Mosquitto `max_inflight_messages`, is
per-client, optional and QoS 1/2-only, so receive time cannot recover late/out-of-order
semantics), and gauge clocks must be time-disciplined, because skew masquerades as
lateness and corrupts every timestamp-keyed mechanism below (F2).

## 2. Approaches discovered (O1)

1. **Broker + lean TSDB + alert stack (compose-your-own).** Mosquitto → VictoriaMetrics
   or QuestDB → vmalert/Prometheus-style evaluators → Alertmanager. Materially
   different knobs: which layer deduplicates (broker QoS, storage post-hoc vs
   ingestion-time, alert-layer grouping) and which timestamp governs "late".
2. **Integrated IoT platform.** ThingsBoard CE ships device profiles, alarm rules from
   "telemetry thresholds, inactivity, or repeated events", the four-state
   Active/Cleared × Acked/Unacked lifecycle, acknowledgement recording "the
   acknowledgment time and the acknowledging user", automatic state-change comments,
   cleared alarms retained "for historical reporting", and alarm Start Time "reflects
   the telemetry timestamp, not the server processing time". The only discovered
   self-hosted option where ack history is first-class rather than an assembly job.
3. **Industrial SCADA.** Rapid SCADA v6 (Apache-2.0; ScadaComm/ScadaServer/ScadaWeb)
   and FUXA (MIT; built-in historian on SQLite/InfluxDB; Modbus/OPC-UA/MQTT and more).
   Heavier; the fit depends on whether gauges sit behind RTUs/PLCs — an open question
   the brief does not answer.
4. **Sequence-numbered transport (Sparkplug 3.0).** Per-edge-node sequence numbers
   0–255 with wraparound, birth/death certificates, and a host reordering timeout after
   which a gap or bdSeq mismatch triggers REBIRTH resync — converts silent loss and
   disorder into a detectable state. **Standing: hypothesis, not verified mechanism**
   (clause-level wording was never read from the spec PDF, which was excluded; see F3).
5. **Dead-man's-switch layer (Healthchecks).** Alerts on absence: "Period is the
   expected time between pings. Grace Time specifies how long to wait before sending
   out alerts when a job is running late" — the complement to threshold rules, which
   never fire on silence.
6. **Cautionary dead end.** Grafana OnCall OSS: maintenance mode 2025-03-11, project
   archive 2026-03-24, read-only enforcement (archive banner) Jun 5, 2026 — three
   distinct events in one retirement (F13). Its successor is a cloud product,
   contrary to the self-hosted constraint. Any design parked on it is stranded; this
   is the argument for keeping ack/state in our own store or a platform primitive.
7. **Delivery-leg finds.** ntfy (self-hosted push; 4,096-byte message cap, 3-hour
   attachment expiry shape the templates) and GoAlert (active Apache-2.0
   escalation/on-call with SMS/voice; README does not document dedup or ack-history —
   caveat retained, verify in its docs before adoption).

## 3. Consequential primary-source behavior (O2)

- **Duplicates are designed in.** MQTT QoS 1 ("at least once") manufactures duplicates;
  Telegraf's `qos` defaults to 0 (lossy), and its doc says "with QoS 1 or 2, you should
  enable persistent_session to allow resuming unacknowledged messages";
  `max_undelivered_messages` caps unwritten messages at 1000. Duplicate handling is
  therefore a required, explicit design choice. Storage models differ and are **not
  equivalent**: VictoriaMetrics `-dedup.minScrapeInterval` thins per interval and
  tie-breaks equal timestamps to "the sample with the biggest value"; QuestDB
  `DEDUP ENABLE UPSERT KEYS(ts, gauge_id)` does key-based upsert (WAL table +
  designated timestamp required; "If keys match, compares the full row content" —
  identical rows skip the write, differing rows are replaced). Only key/upsert preserves
  a retransmitted *corrected smaller* reading; VM's biggest-value tie-break shadows it.
- **Out-of-order/late.** Late-but-newer-timestamped data is stored by VM
  ("stores all the ingested samples to disk even if -dedup.minScrapeInterval … is set");
  dedup applies at merge/query time. ThingsBoard is the one fetched source stating the
  alarm-timestamp choice explicitly (telemetry time, not processing time) — operationally
  right for triage, but dashboards can show alarms "in the past" after backlog drain.
  Mosquitto `max_inflight_messages = 1` trades throughput for strict per-client ordering.
- **Outage recovery — the defaults trap.** Mosquitto `persistence` **defaults to
  false** (queued QoS 1/2 messages die with the broker), `autosave_interval` 1800 s,
  per-client `max_queued_messages` 1000; Telegraf `persistent_session` false and
  `max_undelivered_messages` 1000. Every default in the discovered chain is tuned for
  lossy ephemeral telemetry; all four must be explicitly overridden for durable triage.
- **Alert noise and ack mechanics.** Alertmanager defaults `group_wait` 30s,
  `group_interval` 5m, `repeat_interval` 4h, `resolve_timeout` 5m; `group_by` with the
  special value `'...'` "effectively disables aggregation entirely"; webhook payloads
  carry a `groupKey`. Alertmanager has silences, **not** per-user ack history — ack-as-audit
  needs a platform (ThingsBoard), an on-call layer (GoAlert, unverified specifics), or a
  custom webhook-fed table with delivery-level dedup (see P4).
- **Version behavior (O3 chains).** (1) Mosquitto 2.0 (2020-12): without configured
  listeners the broker binds loopback only; configured listeners default
  `allow_anonymous false` — old 1.x configs silently stop remote gauges; explicit
  `listener` + auth is mandatory on fresh installs. (2) OnCall OSS retirement (three
  events, F13). (3) InfluxDB 1.x→2.x→3.x: 3 Core GA since April 2025, no end-of-support
  dates stated; its duplicate/out-of-order write semantics were not found in fetched
  material — held as alternative only. (4) QuestDB dedup is recent and
  narrowing: WAL-only, forward-only, designated-timestamp required, introducing version
  not stated — absence of stated limits is itself a finding.
- **Where evidence is absent or inapplicable (stated, not papered over):** no fetched
  source quantifies storage sizing for 120 gauges; Sparkplug clause wording, ntfy
  rate/cache limits, FUXA alarms, Rapid SCADA module set, GoAlert ack specifics and
  ThingsBoard's telemetry TTL default were not verified; DNP3/LoRaWAN/NB-IoT and
  commercial utility SaaS were left out of scope deliberately.

## 4. Clause-by-clause comparison (O4 — every exact P clause, O4 vocabulary dispositions)

### P1: "Ingest MQTT readings into a time-series database."

**Disposition: already-covered as architecture, with corrections and one user
decision.** Both shapes satisfy the clause: compose-your-own (Mosquitto →
VictoriaMetrics/QuestDB) and integrated (ThingsBoard CE); SCADA platforms cover
Modbus-adjacent fleets. Corrections carried into the design: enable Mosquitto
`persistence`, raise `max_queued_messages`, configure Telegraf `persistent_session`,
and override the undelivered cap (§3 defaults trap). **Per-engine dedup conditions
(F4, split as the sources require):** QuestDB — enabling dedup late is possible;
existing rows stay as written and only new inserts deduplicate ("Enabling
deduplication does not deduplicate existing data — only new inserts"), so plan the
key model early but "before first data" is not a hard requirement; VictoriaMetrics —
dedup applies at merge/query time whenever the flag is set, so it acts on already
stored data too. The two engines must not share one condition sentence.
**Amended-in condition (F1): the MQTT payload must carry the gauge measurement
timestamp; units and per-gauge identifiers ride with it.** Alternatives retained:
QuestDB instead of VM when corrected-value upsert matters (V1 vs V8 discriminates);
Sparkplug 3.0 as transport *hypothesis only* (F3); ThingsBoard-native ingest.
User decisions: payload schema beyond the timestamp/units/identifier minimum; broker
vs device TLS/auth posture — **kept as a user decision with no recommendation, because
no Mosquitto TLS configuration evidence exists in this investigation** (F12); VM vs
QuestDB. Uncertainties: VM flag default not stated on the fetched page; QuestDB
introducing version not stated; InfluxDB 3 duplicate semantics unknown; gauge
firmware's MQTT support unconfirmed by the plan itself.

### P2: "Alert when the latest reading exceeds one fixed threshold."

**Disposition: correction (as the sole mechanism it under-serves the brief); the core
mechanism itself already-covered.** Every discovered stack implements
threshold-on-latest. Corrections: (1) "latest reading" must be defined against the
**payload timestamp** (F1) and a stated window — ThingsBoard's Start Time semantics
show alarms keying to telemetry time; (2) noise control needs deliberate tuning of the
Alertmanager defaults (30s/5m/4h/5m) for a triage cadence, with hysteresis or severity
bands against flapping; (3) 120 gauges can alarm at once — grouping via `group_by` and
the webhook `groupKey` is the tool, and per F6 it is also the designated answer to
fleet-wide staleness (P3). **Naming correction (F8):** vmalert/Prometheus-style
evaluators evaluate threshold rules and feed Alertmanager, which routes and groups —
Alertmanager itself evaluates nothing; the flap-suppression behavior "if an alert is
resolved before group_wait has elapsed, no notification will be sent" is retained on
single-extraction provenance, not re-verified by the critic (F9). Alternatives
retained: Grafana-native alerting (couples dashboard and rules) vs vmalert +
Alertmanager (decoupled) vs ThingsBoard-native; ntfy for operator push; GoAlert where
escalation rota + SMS/voice ack are wanted (caveat F11). User decisions: thresholds,
bands, severities, channels, grouping scope. Uncertainties: FUXA alarm support
unconfirmed; ntfy rate/cache defaults uncaptured.

### P3: "Missing readings count as zero."

**Disposition: rejected as written; replaced by a correction — absence becomes an
explicit stale/unreachable state, never a zero value.** Zero is a plausible water
measurement (burst main, empty tank): conflating silence with zero fabricates
readings that pollute P5's year of data and mis-alarms (a gauge at 0 because its radio
died is a connectivity event, not a tank event). A late true reading must be able to
contradict a gap, which zero-fill forbids; storage that keeps what actually arrived
plus display-level gap handling is the honest triage record. The corrected mechanism
exists natively: ThingsBoard inactivity alarm rules; Healthchecks' Period/Grace
dead-man pattern self-hosted; vmalert absence-rule semantics named as an approach
(unverified in fetched sources — uncertain). **Amended-in (F6): per-gauge staleness
must correlate — broker or gateway death would otherwise fire 120 STALE alarms at
once; the alert layer groups them into one "pipeline down" incident, distinguishing
infrastructure failure from per-gauge device failure.** Conditions: per-gauge
expected interval and grace must be defined (sampling cadences are not given);
dashboards must distinguish "value below threshold" from "no value"; a stale gauge
suppresses its threshold alerts as a distinct STALE/Indeterminate severity.
**On clock discipline (F2): stale detection windows inherit gauge clock error — NTP
discipline or gateway-side stamping is a deployment condition, and gauge clock skew
joins the uncertainty register as a cause of apparent lateness.** User decisions:
grace durations per gauge class; stale-vs-threshold suppression policy. Validation:
proposed V5 discriminates P3-as-written from P3-corrected.

### P4: "Clients acknowledge an alert locally then sync."

**Disposition: correction (ambiguity plus missing conflict/audit semantics), with
already-covered primitives in two stacks and one user decision.** Read as operator
clients, acknowledgement must be recorded server-side with who and when — ThingsBoard
acks "record the acknowledgment time and the acknowledging user", generate automatic
comments on state change, retain cleared alarms for reporting, and expose ack via REST;
that is the ack *history* the brief demands. The "locally then sync" pattern needs
stated conflict rules (two operators acking; ack racing a severity escalation —
ThingsBoard upgrades the existing alarm's severity) and idempotent replay.
**Amended-in (F10): a webhook-fed custom ack table needs delivery-level dedup —
Alertmanager re-notifies on the repeat_interval cadence, so the join key is
groupKey + fingerprint + status, not the ack event ID alone.** Alertmanager alone does
not satisfy the clause (silences are not per-user history). If "clients" means the
gauge hardware acking locally, that is a control-plane feature outside everything
investigated — **retained as uncertain for adjudication**. Alternatives retained:
ThingsBoard-native ack (recommended where that platform is chosen); GoAlert escalation
layer (**caveat kept: ack-history specifics unverified — F11**); minimal custom table
fed by Alertmanager webhooks. User decisions: who may ack; first-ack-wins vs other
conflict rules; whether acks carry notes (optional enhancement: notes + shift-handover
report). Validation: proposed V6.

### P5: "Keep data for a year."

**Disposition: already-covered for telemetry by the P1 storage choices, with
corrections and user decisions.** Corrections: (1) the clause covers telemetry only by
implication — ack/audit history has its own retention requirement and should live as
long or longer; (2) "keep" must state resolution — raw year vs downsampled year; (3)
ThingsBoard's telemetry TTL default was not captured in fetched sources and must be
configured explicitly whichever platform is chosen. **Wording correction (F7):** no
sizing adjective stands in this final — whether a year of 120 gauges fits the budget
box is exactly what proposed V7 measures; no fetched source quantifies bytes/sample
for these engines, and no sizing claim is made. Conditions: retention policy must
state its interaction with dedup/downsampling (VM's `-dedup.minScrapeInterval=D`
equivalence to `-downsampling.period=0s:D`); late backfills near the retention
boundary. Alternatives retained: raw-then-downsample tiering; QuestDB + cold copies;
ThingsBoard with configured TTL + PostgreSQL. User decisions: retention resolution;
ack-log retention period; regulatory duties for water utilities (out of scope,
flagged). Validation: proposed V7, honestly labeled synthetic.

### P6: "Validate with a static sample CSV."

**Disposition: correction (kept, as smoke test only) plus rejected as sufficient.**
A static CSV replay cheaply and deterministically exercises ingestion and threshold
logic — keep it as the first gate. But the brief's pathologies are exactly what an
unstructured CSV silently fails to test: duplicates, disorder, lateness, gaps, ack
conflicts. The sample must encode the pathologies deliberately: duplicate timestamps
with divergent values; out-of-order records; a gap followed by a late true reading;
ack sequences with conflicts; expected outcomes asserted per case. Mechanism
(proposed, not executed): rows replayed through `mosquitto_pub` in scripted order with
controlled delays against the P1 stack. **Amended-in (F5): the validation set gains a
QuestDB-arm discriminator** so the draft's VM-vs-QuestDB user decision is testable on
both sides (V8 below); the full set V1–V8 is in §6 with executed/proposed labels.

## 5. Alternatives, conditions, decisions and uncertainties (O5, consolidated)

Retained alternatives: ThingsBoard CE (integrated); Mosquitto + VictoriaMetrics or
QuestDB + vmalert/evaluators + Alertmanager (compose-your-own); Rapid SCADA v6 and
FUXA (SCADA paths); GoAlert + ntfy + Healthchecks (ack/push/absence layers);
Sparkplug 3.0 (transport hypothesis, F3). Rejected: Grafana OnCall OSS (retired —
F13's three events); P3-as-written zero-fill (rejected on the merits, §4 P3).
Optional leads/product decisions: ack notes + handover reports; Sparkplug adoption
contingent on clause verification and gateway capability; InfluxDB 3 pending duplicate
semantics evidence; regulatory retention investigation (flagged out of scope).
Disagreement kept deliberately: where dedup happens (broker/consumer/storage/alert
layer) and which storage model wins are open, discriminated by V1 vs V8.
**Uncertainty register (current):** VM `-dedup.minScrapeInterval` default; QuestDB
introducing version; Telegraf master commit unpinned; ntfy rate/cache defaults;
Sparkplug clause wording (F3); resolved-before-group_wait single-extraction (F9);
GoAlert ack specifics (F11); FUXA alarms; Rapid SCADA modules; ThingsBoard TTL
default and PE/CE boundary; InfluxDB 3 duplicate/OOO semantics; gauge MQTT firmware
support; device-side reading of P4; gauge clock discipline as deployment condition
(F2); regulatory retention (out of scope).

## 6. Discriminating validations — all PROPOSED, none executed (O6)

Executed to date is listed in the header. The proposed set, each designed to
discriminate between named alternatives:

- **V1** VM duplicate tie-break: same-timestamp 3.2 then 1.1 under
  `-dedup.minScrapeInterval=60s` — which survives? Discriminates biggest-value
  thinning (S01) from last-write-wins assumptions.
- **V2** Broker restart with `persistence` true vs false; 100 QoS-1 messages published
  while the consumer is down; count redelivered. Discriminates the defaults trap (S02)
  and measures autosave loss windows.
- **V3** ThingsBoard inactivity + threshold rule with a deliberately back-dated
  payload — observe Start Time back-dating (S08). Discriminates telemetry-time vs
  processing-time semantics.
- **V4** Alert-noise: replay threshold sequences incl. hysteresis crossings; measure
  duplicate-notification suppression against group_interval/repeat_interval (S04).
- **V5** Absence: stop one gauge's publisher; threshold rule stays silent vs
  inactivity/dead-man fires. Discriminates P3-as-written from P3-corrected.
- **V6** Ack conflicts: two concurrent acks + one ack-during-escalation against the
  chosen backend; assert audit rows record both attempts, one winner, survive clear.
- **V7** Year-scale sizing: synthetic series; on-disk bytes and query latency raw vs
  deduped. Sizing evidence, honestly synthetic (replaces any sizing assertion, F7).
- **V8** *(added by F5)* QuestDB duplicate arm: retransmit a corrected smaller value
  for the same `(ts, gauge_id)` UPSERT key; assert the stored row updates. Pairs with
  V1 to discriminate interval-thinning from key-upsert.

Proposed additionally, where no qualified sandbox witness may run them: re-fetch the
Alertmanager configuration page to capture the resolved-before-group_wait sentence
(F9); locate a non-PDF Sparkplug clause source (F3); consult GoAlert docs beyond the
README for ack/audit features (F11).

## 7. Adjudication ledger — every criticism, explicit verdict, evidence-checked

Each verdict was taken against the retained excerpts (re-verified by grep/read in
`sources/` this stage), not by obedience. Full rows with citations: `adjudication.md`.

| ID | Target | Verdict | One-line basis |
|----|--------|---------|----------------|
| F1 | P1/P2/P3 | **accept → amend** | Draft only gestured at payload schema; S02/S06 document no transport timestamp; §1/§4 now state the payload-timestamp condition. |
| F2 | cross-cutting | **accept → amend** | Zero clock/NTP mentions in the record (grep-verified); S08 Start Time semantics make clock discipline load-bearing; added as condition + register entry. |
| F3 | P1 | **accept → retain-uncertainty** | §S10 header: clause wording NOT verified, PDF excluded; Sparkplug held as hypothesis, not equal-standing alternative. |
| F4 | P1 | **accept → amend** | S03 "only new inserts" supports less than "before first data"; S01 merge/query-time note differs; conditions split per engine. |
| F5 | P6/P1 | **accept → amend** | V1 tests only VM's model; S03's row-compare upsert gained its own discriminator V8. |
| F6 | P3/P2 | **accept → amend** | S04 grouping retained; broker-death → 120 STALE correlation case added to P3. |
| F7 | P5 | **accept → amend** | "Modest" contradicted the no-sizing-claims honesty; removed in favor of V7 as the only sizing instrument. |
| F8 | P2 | **accept → amend** | S04 material is routing-only; naming corrected to evaluators-feed-Alertmanager. |
| F9 | P2 | **accept → retain-uncertainty** | Sentence present in predecessor excerpt, absent from critic re-fetch (grep 0); kept with single-extraction provenance. |
| F10 | P4 | **accept → amend** | S04 repeat semantics imply webhook re-delivery; table dedup extended to groupKey + fingerprint + status. |
| F11 | P4 | **accept → retain-uncertainty** | S15 README gap, critic not re-fetching; GoAlert caveat kept verbatim in substance. |
| F12 | P1 | **accept → amend (scope decision)** | No TLS material retained anywhere (grep-verified); posture stays an explicit user decision, no recommendation. |
| F13 | O3 | **accept → amend** | Banner Jun 5, 2026 (read-only) vs README 2026-03-24 (archive) vs 2025-03-11 (maintenance mode): three distinct events, named as such. |

The critic's five declared invalid demands are not obeyed: no executed-validation
claims are fabricated (no runtime existed); Sparkplug stays unverified rather than
asserted; no sizing numbers are invented; InfluxDB 3 and GoAlert specifics stay
unknown; and repairing the draft was this stage's assignment, not an overreach.

## 8. Coverage statement

O1 — §2 (four shapes, dead end, delivery leg). O2 — §3 (defaults, units, limits,
applicability per mechanism). O3 — §3 chains (1)–(4) with absent-evidence statements.
O4 — §4 (every exact P clause quoted and dispositioned from the O4 vocabulary).
O5 — this document is self-contained; §5 consolidates alternatives, conditions,
decisions, disagreements, uncertainties. O6 — header executed/proposed statement, §6
V1–V8 all labeled proposed, honest absence-of-runtime throughout, scope bounded to
this brief.
