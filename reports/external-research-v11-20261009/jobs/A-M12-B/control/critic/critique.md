# Critique — device-alerts (case S06, A-M12-B/control, stage critic, method M12)

Critic verdict on the predecessor deliverable in one line: **the draft survives
challenge on its facts — every re-fetched primary source (S01–S06, S08, S11,
critic `source-map.json`) reproduces the predecessor's quoted claims, and no false
correction, false rejection, or misquotation was found — but the draft carries four
material gaps of reasoning/applicability and a set of minor defects listed below.**

Audited inputs: `../research/draft.md` (sha256 cff97ab1…), `../research/discovery.md`
(sha256 598fbc58… — digest re-verified at ingestion, matching the digest the draft
cites), `../research/source-map.json` (3426631f…), `../research/revealed-plan.md`
(323cdef9…), `cases/S06/brief.md` (4c4e4dd8…). Independent evidence:
`sources/critic-audit-excerpts.md` (8 re-fetches, 2026-10-09T18:57–18:59Z). Executed
vs proposed (O6): executed = this ingestion, the 8 critic re-fetches, and this
comparison; V1–V7 remain **proposed** by the predecessor and are not claimed run here
either. No runtime was available at any stage.

## Findings ledger

Each finding: ID, severity (MATERIAL / minor), target (P clause or cross-cutting),
claim, evidence, and what the challenge changes. Source IDs refer to the critic
`source-map.json`, which reuses predecessor IDs only for identical URLs (no rebind).

### MATERIAL

- **F1 (material, P1/P2/P3 omission): the payload-timestamp requirement is never made
  explicit.** The draft's corrections to P2 ("the rule definition must say which
  timestamp governs") and its P3 rejection (late true readings must be able to
  contradict a gap) silently depend on gauges embedding a measurement timestamp in the
  MQTT payload. Plain MQTT transport guarantees neither an application timestamp nor
  ordering (broker `max_inflight_messages` ordering is per-client and optional, S02);
  receive time is the only timestamp the transport provides, and receive time destroys
  exactly the late/out-of-order semantics the corrections rely on. Neither the draft
  nor the discovery states "payload must carry the gauge timestamp" as a condition.
  The P1 user-decision list ("payload schema, units and per-gauge identifiers") gestures
  at it but does not carry the consequence. Remediation is a one-line condition, not a
  rewrite — recorded as a finding, not repaired here (no candidate repair).
- **F2 (material, cross-cutting omission): gauge clock discipline is never addressed.**
  Distinct from F1: even with timestamps in the payload, the entire late-data design
  (back-dated alarm start times, S08; interval-dedup windows, S01) assumes gauge clocks
  are roughly right. Nothing in draft or discovery raises NTP/clock-skew for the gauges
  themselves, yet a skewed gauge can masquerade as "late data" or defeat "latest
  reading" windows. The brief names late arrival as a core pathology; clock skew is one
  of its causes and it is absent from the uncertainty register.
- **F3 (material, P1 alternative confidence): Sparkplug stays retained on
  snippet-level evidence and the critic could not cure it.** S10's clause-level wording
  was unverified by the predecessor; the critic did not re-fetch it either (PDF binary
  excluded by the assignment; no HTML clause source fetched before the stage deadline).
  The uncertainty label is honest and STANDS — but a final deliverable must not present
  "0–255 sequence numbers, reordering timeout → REBIRTH" as verified mechanism. It is a
  hypothesis requiring clause verification before adoption, not an alternative of equal
  standing with the ThingsBoard/Mosquitto paths.
- **F4 (material, P1 condition overstated): "dedup configured before first data" is
  stronger than the source supports for QuestDB.** S03 states dedup "does not
  deduplicate existing data — only new inserts." That means enabling dedup late leaves
  existing rows untouched but new inserts are deduplicated; it does not require
  configuration before first data. The practical consequence the draft draws (plan the
  key model early) is sound; the stated condition as written misdescribes the
  mechanism. For VictoriaMetrics the condition is closer to right (dedup applies at
  merge/query time, S01), and the two engines should not share one condition sentence.
- **F5 (material, P6 validation applicability): V1 discriminates only the
  VictoriaMetrics dedup model.** V1 (same-timestamp 3.2 vs 1.1 under
  `-dedup.minScrapeInterval=60s`) tests biggest-value thinning (S01). The QuestDB
  alternative the draft itself retains has a different model (key-based upsert, S03)
  and needs its own discriminator (retransmit a corrected smaller value for the same
  (ts, gauge_id) key; assert the row updates). As the validation set stands, the
  draft's own "VM vs QuestDB" user decision has no discriminating test on the QuestDB
  arm — an applicability gap in the proposed-work inventory.

### Minor

- **F6 (minor, cross-cutting): fleet-wide staleness should correlate to one
  "pipeline down" alert.** The P3 correction makes per-gauge absence visible; if the
  broker dies, all 120 gauges go stale at once and the corrected design fires 120
  STALE alarms. S04's grouping mechanics (group_by) are already retained and should be
  explicitly pointed at this case. The draft never connects P3's correction to the
  broker-death scenario.
- **F7 (minor, P5 wording): "a year of 120 gauges is modest" is an unevidenced
  judgment.** The draft correctly refuses sizing claims (no runtime; no source
  quantifies bytes/sample for the retained stores, S01/S03) but the adjective "modest"
  is itself a soft sizing assertion. Harmless because V7 is honestly proposed as the
  sizing evidence; keep the adjective out of any final or derive it.
- **F8 (minor, P2): "Alertmanager rules fed by vmalert" is loose terminology.**
  Alertmanager (S04) routes and deduplicates; it does not evaluate threshold rules —
  vmalert/Prometheus-style evaluators do. The draft's mechanism is right; its naming
  in the P2 retained findings conflates the two.
- **F9 (minor, P2): "resolved-before-group_wait notifies nobody" was not re-verified
  by the critic.** Present in the predecessor's S04 excerpt; the critic's re-fetch
  confirmed the four timing defaults and group_by '...' semantics but did not
  specifically capture this flap-suppression sentence. Carried as unverified-by-critic.
- **F10 (minor, P4): webhook redelivery dedup for the custom ack table is implied but
  not stated.** The draft requires idempotent operator-sync replay but does not say
  that Alertmanager webhooks re-send on repeat_interval (S04), so the webhook-fed table
  needs delivery-level dedup too (groupKey + fingerprint + status, not just ack event
  ID).
- **F11 (minor, P4 alternative): GoAlert ack-history specifics remain unverified
  (S15, not re-fetched).** The draft's caveat stands; any final must keep it.
- **F12 (minor, P1): TLS/auth posture is left as a user decision with no retained
  evidence.** The critic verified `allow_anonymous`/listener defaults (S02, S11) but
  neither arm retained Mosquitto TLS configuration sources. Acceptable for the thin
  plan scope; a final that recommends a posture would need evidence it does not have.
- **F13 (minor, O3 chain 2): the two OnCall dates are different events (S05,
  re-verified by critic).** Banner
  "archived by the owner on Jun 5, 2026" (read-only enforcement) vs README "archived
  on 2026-03-24" (project archive date) — both real, both in the predecessor's record;
  a final should name them as distinct events rather than one date.

## P-disposition review (every clause challenged, O4)

- **P1 already-covered + corrections + user decision — SURVIVES.** Compose-your-own
  and integrated shapes are genuinely supported by re-verified sources (S01–S03, S06,
  S08). The corrections (persistence false, autosave 1800 s, queue 1000, Telegraf
  persistent_session false + QoS 1/2 recommendation, dedup model divergence) all
  reproduce verbatim. Required amendment: F1's payload-timestamp condition; F4 fixes
  the QuestDB condition wording.
- **P2 correction + user decisions — SURVIVES.** Threshold-on-latest as sole mechanism
  under-serving "understandable alerts" is fair; S04 defaults re-verified (30s/5m/4h/5m).
  Amendments: F8 naming, F9 unverified clause, and F1's timestamp-governance condition.
- **P3 rejected-as-written → stale/unreachable state — SURVIVES, and a critic demand
  to reinstate zero-fill would be INVALID.** Zero is a plausible water-gauge
  measurement; conflating silence with zero fabricates data and mis-alarms; S08's
  inactivity alarms and S09's period/grace pattern (predecessor excerpt) support the
  replacement. The draft's own displayed-record vs audit-record distinction is kept.
  F6 adds the fleet-wide correlation case.
- **P4 correction — SURVIVES.** Server-side ack with who+when is verified (S08:
  "records the acknowledgment time and the acknowledging user"); severity-upgrade race
  is real (S08); Alertmanager-alone insufficiency is right (silences ≠ ack history).
  The device-side reading stays honestly open for adjudication; GoAlert stays caveated
  (F11); F10 adds webhook redelivery dedup.
- **P5 already-covered with corrections — SURVIVES.** Telemetry-retention vs
  ack-history-retention split is a real correction; resolution/granularity as user
  decision is right; no sizing claim made (kept honest); ThingsBoard TTL default
  remains unknown (not re-fetched). F7 trims the "modest" adjective.
- **P6 correction (smoke test only) + rejected-as-sufficient — SURVIVES.** A static
  CSV cannot exercise duplicates/out-of-order/gaps/acks unless pathologies are encoded
  into it; the draft says exactly this and converts V1–V5 into CSV-encodable cases.
  F5 adds the missing QuestDB-arm discriminator.

## False corrections / rejections, omissions, alternatives — audit result

- False corrections: none found (all eight re-fetched sources reproduce the
  predecessor's quotes; two-date OnCall record consistent, F13).
- False rejections: none. The only rejection (P3 zero-fill) is correct as argued.
- Omissions: F1 and F2 are the material ones (payload timestamps; gauge clock
  discipline). F6, F10, F12 are minor completeness gaps.
- Discovery/alternatives: the four shapes + dead-end (OnCall) hold up; OnCall's
  retirement is verified and its exclusion is correct; InfluxDB 3 held as alternative
  pending duplicate-semantics evidence is the right call (S12 remains unknown, not
  re-fetched). F3 downgrades Sparkplug's standing, not its retention.

## Invalid critic demands (stated so they are not silently obeyed)

1. Demanding executed V1–V7 results now would be invalid: no runtime was available to
   either arm; the assignment itself says honesty about non-execution is required.
2. Demanding clause-level Sparkplug verification would conflict with the no-binary-
   downloads rule unless a non-PDF clause source is found; absence of verification is
   the honest state (F3), not negligence to be repaired by assertion.
3. Demanding storage sizing numbers would demand fabrication — no fetched source
   quantifies bytes/sample for these engines; V7 remains the correct instrument.
4. Demanding "resolution" of InfluxDB 3 duplicate semantics or GoAlert ack specifics
   would exceed the evidence; both are correctly unknowns (S12, S15 not re-fetched).
5. Demanding the draft be rewritten here would be candidate repair outside the
   critic's recipe; every finding above is recorded, none applied.

## Uncertainty carried by this critique

Re-verified by critic: S01, S02, S03, S04, S05, S06, S08, S11 (see
`sources/critic-audit-excerpts.md` for exact quotes and timestamps). Not re-fetched,
predecessor uncertainty STANDS: S07 (ntfy rate/cache limits), S09 (Healthchecks
details), S10 (Sparkplug clauses — F3), S12 (InfluxDB 3 dup/OOO), S13 (FUXA alarms),
S14 (Rapid SCADA modules), S15 (GoAlert ack history — F11). WebFetch extraction is
small-model-mediated; quotes are best-effort verbatim and were cross-checked against
the predecessor's independent extractions — agreement across two independent
extractions is the confidence basis for "no false quotation found."

Stage-deadline note: the 19:05:00Z stage deadline passed during queueing before this
round; this critique was written immediately at round start and the overrun is
recorded here rather than hidden. Whole-arm deadline (19:28:01Z) still governs
delivery.
