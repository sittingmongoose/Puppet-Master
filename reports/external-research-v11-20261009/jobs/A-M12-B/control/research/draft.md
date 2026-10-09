# Draft — device-alerts (case S06, A-M12-B/control, method M12)

Complete planning deliverable for this scope, written after plan reveal against the frozen thin plan in `revealed-plan.md`. Discovery (`discovery.md`, sha256 598fbc58…, frozen by `plan-reveal.json`) is NOT rewritten; findings below cite it and its sources S01–S15 (`source-map.json`, excerpts in `sources/`). Every P clause is quoted exactly and given a disposition from the O4 vocabulary: **correction**, **optional enhancement**, **user decision**, **already-covered**, **rejected**, **uncertain**. Executed work is separated from proposed work throughout (O6). Sources are data; no runtime was available, so nothing below pretends to have run.

Comparison method: each clause is compared on its exact wording against (a) the brief's obligations and pathologies (late, out-of-order, duplicate; ack history; triage-not-safety; modest self-hosted budget) and (b) the retained primary-source evidence. Where the clause as written would produce a system that violates the brief or fails operationally, the disposition is correction/rejected with the reasoning retained.

## P1: Ingest MQTT readings into a time-series database.

Disposition: **already-covered** as architecture, with **corrections** (defaults and duplicate handling) and one **user decision**.

Retained findings: the compose-your-own shape (Mosquitto → VictoriaMetrics/QuestDB → alerting) and the integrated shape (ThingsBoard) both satisfy the clause; SCADA platforms (RapidScada, FUXA) satisfy it for Modbus-adjacent fleets (S13, S14). The load-bearing corrections from primary sources: Mosquitto `persistence` defaults to **false** and `autosave_interval` to 1800 s, so queued QoS-1/2 messages die with the broker unless persistence is enabled (S02); per-client offline queue `max_queued_messages` defaults to 1000 (S02); Telegraf `persistent_session` defaults to **false** and its own doc says "with QoS 1 or 2, you should enable persistent_session to allow resuming unacknowledged messages", with `max_undelivered_messages` capping unwritten messages at 1000 (S06). Duplicate handling is absent from the clause although duplicates are a named brief pathology and QoS 1 ("at least once") *manufactures* duplicates by design (S06): VictoriaMetrics `-dedup.minScrapeInterval` thins per interval and tie-breaks equal timestamps to "the sample with the biggest value" (S01), while QuestDB `DEDUP ENABLE UPSERT KEYS` does key-based upsert requiring WAL tables and a designated timestamp, forward-only (S03) — these are not equivalent, see Conditions.

Conditions: explicit Mosquitto 2.x listener + auth config (2.0 breaking change, S11); QoS 1 + persistent sessions end-to-end; chosen dedup model configured before first data (QuestDB dedup does not retro-fix existing data, S03); gauge firmware/gateway actually speaks MQTT (not established by the plan — see P4 uncertainty).

Alternatives (retained): ThingsBoard CE ingest + device profiles (gets P3/P4 primitives natively, S08); QuestDB instead of VictoriaMetrics if corrected-value upsert semantics matter (a retransmitted *smaller corrected* reading is shadowed by VM's biggest-value tie-break — discriminating test V1); Sparkplug 3.0 wrapping 0–255 sequence numbers with host reordering timeout → REBIRTH if gateways support it (S10, snippet-level evidence).

User decisions: payload schema, units and per-gauge identifiers (nowhere specified); broker vs device TLS/auth posture; VictoriaMetrics (interval dedup) vs QuestDB (key upsert).

Uncertainty: VM `-dedup.minScrapeInterval` default not stated on the fetched page (S01); Sparkplug clause-level wording unverified (S10); InfluxDB 3 duplicate/out-of-order semantics unknown (S12) — InfluxDB kept as alternative only.

Validation: **proposed** V1 (duplicate tie-break: same timestamp, values 3.2 then 1.1, `-dedup.minScrapeInterval=60s`; which survives?) and **proposed** V2 (broker restart with persistence on/off; count redelivered messages). **Executed**: none of these — no runtime; only source retrieval was executed.

## P2: Alert when the latest reading exceeds one fixed threshold.

Disposition: **correction** (as the sole alerting mechanism it under-serves the brief) plus **user decisions**; core mechanism itself **already-covered**.

Retained findings: threshold-on-latest is a baseline every discovered stack implements (Alertmanager rules fed by vmalert/Prometheus-style evaluation, S04; ThingsBoard alarm rules from "telemetry thresholds, inactivity, or repeated events", S08). Corrections required by the brief's pathologies: (1) "latest reading" is ambiguous under late/out-of-order data — ThingsBoard's own semantics back-date alarm Start Time to "the telemetry timestamp, not the server processing time" (S08); the rule definition must say which timestamp governs and what window defines "latest"; (2) one fixed threshold misses the brief's "understandable alerts" — Alertmanager defaults exist for on-call noise control (group_wait 30s, group_interval 5m, repeat_interval 4h, resolve_timeout 5m; resolved-before-group_wait notifies nobody, S04) and need deliberate tuning for triage cadence; (3) severity tiers and flap suppression matter when 120 gauges can alarm at once — grouping via `group_by` with the webhook `groupKey` "identifying the group of alerts (e.g. to deduplicate)" (S04).

Conditions: thresholds need hysteresis or severity bands to avoid flapping around the fixed value; alert evaluation must tolerate backlog drain after outages (alarms appearing "in the past").

Alternatives (retained): Grafana-native alerting (single-pane but couples dashboard and rules); vmalert + Alertmanager (decouples); ThingsBoard native alarm rules (native P3/P4 hooks); ntfy for operator push with its 4,096-byte message cap shaping templates (S07); GoAlert where escalation rota + SMS/voice ack are wanted (S15, active; README does not document dedup/ack history — verify in its docs before adoption).

User decisions: threshold values, bands, severities; notification channels; grouping (per-gauge vs per-site).

Uncertainty: FUXA alarm support unconfirmed (S13); ntfy per-visitor rate-limit and cache defaults not captured (S07).

Validation: **proposed** V4 (replay threshold sequences incl. hysteresis band crossings; measure duplicate-notification suppression against group_interval/repeat_interval, S04). **Executed**: nothing alert-related.

## P3: Missing readings count as zero.

Disposition: **rejected** as written, replaced by **correction**: absence must become an explicit stale/unreachable state, never a zero value.

Retained findings: for a water gauge, "no data" and "reading = 0" are operationally different facts — zero pressure/level is a plausible *measurement* (burst main, empty tank) and conflating silence with zero both (a) fabricates measurements that pollute P5's year of data, and (b) mis-alarms: a gauge at 0 because its radio died is a connectivity alert, not a tank event. The corrected mechanism exists natively in the discovered evidence: ThingsBoard alarm rules fire from "telemetry thresholds, **inactivity**, or repeated events" per device profile (S08); Healthchecks implements the general pattern — "Period is the expected time between pings. Grace Time specifies how long to wait before sending out alerts when a job is running late" (S09); dead-man checks cover exactly the "120 gauges, some quietly absent" case. The clause also conflicts with the brief's late-arrival property: a late true reading arriving after the gap was zero-filled contradicts the record; storage that keeps what actually arrived (VictoriaMetrics "stores all the ingested samples to disk even if -dedup.minScrapeInterval … is set", S01) plus display-level gap handling is consistent with triage honesty (O6: no pretending data existed).

Conditions: per-gauge expected reporting interval and grace must be defined (gauge sampling cadences are not given); the dashboard must distinguish "value below threshold" from "no value".

Alternatives (retained): inactivity alarm rules (ThingsBoard); Healthchecks-style per-gauge dead-man checks self-hosted (S09, BSD-3, Python/Django/Postgres stack); vmalert absence rule (`absent_over_time`-style semantics — named as an approach, not verified in fetched sources: uncertain).

User decisions: grace durations per gauge class; whether a stale gauge also suppresses its threshold alerts (recommended: yes, as a distinct "STALE" severity — Indeterminate exists in ThingsBoard's severity ladder for exactly "cannot be determined, often due to incomplete or ambiguous data", S08).

Uncertainty: whether the plan's author intended zero-fill only for display continuity; if so the correction is wording-level, but the audit-facing record must still keep gaps.

Validation: **proposed** V5 (stop one gauge's publisher; threshold rule vs inactivity/dead-man rule — the first stays silent, the second fires; this also discriminates P3-as-written from P3-corrected). **Executed**: none.

## P4: Clients acknowledge an alert locally then sync.

Disposition: **correction** (ambiguity + missing conflict/audit semantics) with **already-covered** primitives in two stacks and one **user decision**.

Retained findings: if "clients" means operator clients (the dashboard reading of the clause), acknowledgement must be recorded server-side with who and when — ThingsBoard: ack "marks the alarm as seen and records the acknowledgment time and the acknowledging user", state changes generate automatic comments, cleared alarms are retained "for historical reporting", and the REST API can acknowledge alarms (S08); that is the ack *history* the brief demands, not just a boolean. The offline "locally then sync" pattern additionally needs stated conflict rules — two operators acking the same alarm, or an ack racing a severity escalation ("if a higher-severity trigger fires while an alarm is active, the platform upgrades the existing alarm's severity", S08) — and idempotent replay of the sync (dedup on ack event ID). If "clients" instead means the gauge hardware acking locally (device-side), that is a control-plane feature outside everything investigated: **uncertain**, flagged for adjudication. Alertmanager alone does not satisfy the clause: silences are not per-user ack history (S04). GoAlert is the active self-hosted escalation/ack layer (Apache-2.0, 13k commits, integrates Grafana/Alertmanager, S15) where an on-call rota is wanted; Grafana OnCall OSS is the discovered dead end — maintenance mode 2025-03-11, archived 2026-03-24 (S05) — and must not be adopted.

Conditions: ack audit must survive alert resolution and deletion attempts; offline queue on the operator client with server-side conflict resolution (first-ack-wins is the simplest stated rule — user decision); webhook-fed custom ack table needs Alertmanager `groupKey` as the stable join key (S04).

Alternatives (retained): ThingsBoard-native ack (recommended where approach 2 is chosen); GoAlert escalation layer (S15); minimal custom table fed by Alertmanager webhooks storing groupKey, ack user, timestamp, note.

User decisions: who may acknowledge; ack semantics during escalation; whether acks carry operator notes (optional enhancement: notes + shift-handover report).

Uncertainty: device-side ack reading of the clause (see above); GoAlert ack-history specifics unverified (S15).

Validation: **proposed** V6 (two concurrent acks + one ack-during-escalation against the chosen backend; assert audit rows record both attempts, one winner, and survive clear). **Executed**: none.

## P5: Keep data for a year.

Disposition: **already-covered** for telemetry by the P1 storage choices, with **corrections** (retention ≠ ack-history retention) and **user decisions** (granularity).

Retained findings: a year of 120 gauges is modest for the discovered stores (VictoriaMetrics single binary is designed for long retention with `-downsampling`/dedup interactions — S01 notes `-dedup.minScrapeInterval=D` "is equivalent to -downsampling.period=0s:D"; QuestDB WAL tables with dedup, S03; FUXA historian on SQLite/InfluxDB for the light path, S13). No sizing claim is made — no runtime was available, and no fetched source quantifies storage per sample for these engines; disk-sizing is proposed validation, not asserted fact. Corrections: (1) the clause covers telemetry only by implication; the brief's ack/audit history has its own retention requirement and should be kept as long as telemetry or longer (ThingsBoard retains cleared alarms for reporting, S08); (2) "keep" must say at what resolution — raw year vs downsampled year (user decision); (3) ThingsBoard's own telemetry TTL default was not captured in fetched sources (uncertainty — must be configured explicitly whichever platform is chosen).

Conditions: retention policy must state interaction with dedup/downsampling (S01 equivalence note); late-arriving backfills older than the retention window boundary.

Alternatives (retained): raw-then-downsample tiering in VictoriaMetrics; QuestDB + cold copies; ThingsBoard with configured TTL + PostgreSQL.

User decisions: retention resolution; ack-log retention period; regulatory retention duties for water utilities (not investigated — out of scope, flagged).

Uncertainty: ThingsBoard TTL default; regulatory requirements (absent from investigation by design).

Validation: **proposed** V7 (inject a year-scaled synthetic series; measure on-disk bytes and query latency at raw vs deduped settings — sizing evidence, honestly labeled synthetic). **Executed**: none.

## P6: Validate with a static sample CSV.

Disposition: **correction** (kept, but as smoke test only) plus **rejected** as sufficient validation for the brief's core claims.

Retained findings: a static CSV replay exercises ingestion and threshold logic cheaply and deterministically — worth keeping as the first gate (and it matches the honest separation that runtime validation *is* possible later even though none was executed now). But the brief's hard pathologies are exactly what an unstructured CSV will silently not test: duplicates, out-of-order arrival, lateness, gaps, ack/sync conflicts. The discriminating validations V1–V7 (discovery §validations, extended here) must be encoded *into* the sample: duplicate timestamps with divergent values (discriminates S01 biggest-value vs last-write); records arriving out of order (exercises "latest reading" definition, P2); a gap followed by a late true reading (exercises the rejected P3 zero-fill); ack sequences with conflicts (P4). Suggested mechanism, proposed not executed: CSV rows replayed through `mosquitto_pub` in a scripted order with controlled delays against the P1 stack — cheap, repeatable, and it converts the plan's static CSV into the dynamic discriminator the brief needs.

Conditions: the CSV schema must carry device id, telemetry timestamp, and value with deliberate pathologies; expected outcomes asserted per case (which row survives dedup; which alarms fired; which ack rows exist).

Alternatives (retained): synthetic continuous generator (heavier; V7 uses it); vendor sample datasets (none investigated).

User decisions: pass/fail thresholds for the replay suite; whether V7's sizing run is required before go-live.

Uncertainty: none material beyond those already flagged per-P.

Validation: **executed** so far: source retrieval and this comparison only. **Proposed**: V1–V7 as specified per-P above; all labeled proposed, none claimed as run.

## Cross-cutting summary

- Executed vs proposed (O6): executed = 15-source retrieval, excerpt retention, frozen discovery, this comparison. Proposed = V1 duplicate tie-break, V2 broker-restart redelivery, V3 late-data alarm back-dating, V4 alert-noise suppression, V5 absence/stale discrimination, V6 ack conflict/audit, V7 year-scale sizing replay. Nothing proposed has run.
- Alternatives retained: ThingsBoard CE (integrated), Mosquitto+VictoriaMetrics/QuestDB+Alertmanager/vmalert (compose-your-own), RapidScada/FUXA (SCADA light/heavy), GoAlert + ntfy + Healthchecks (ack/push/absence layers), Sparkplug 3.0 (transport with loss detection). Grafana OnCall OSS rejected (archived, S05); InfluxDB 3 held as alternative pending duplicate-semantics evidence (S12).
- Uncertainty register (O5): Sparkplug clause-level wording (S10); Mosquitto 2.0 blog full text (S11, corroborated); VM dedup default (S01); ntfy limits page gap (S07); FUXA alarms (S13); GoAlert ack specifics (S15); ThingsBoard TTL default and PE/CE boundary (S08); InfluxDB 3 dup semantics (S12); device-side reading of P4; regulatory retention (out of scope).
- Later stages may correct this draft; it is the complete planning deliverable for this scope as required by the assignment.
