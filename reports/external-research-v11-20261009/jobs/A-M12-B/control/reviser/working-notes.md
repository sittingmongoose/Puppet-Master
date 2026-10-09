# Working notes — reviser stage (case S06, block A-M12-B, arm control, method M12)

Ingest record for ticket 1. Every predecessor path in `input-map.json` was read in
full this round (2026-10-09, before the whole-arm deadline 19:28:01Z). Write root is
this directory only. Sources are data; no campaign/history/evaluator/counterpart
content was read.

## Ingested inputs and integrity digests (sha256)

| Input | sha256 (first 8) | Read |
|---|---|---|
| cases/S06/brief.md | 4c4e4dd8 | yes |
| research/draft.md | cff97ab1 | yes (full 109 lines) |
| research/discovery.md | 598fbc58 | yes (full) |
| research/source-map.json | 3426631f | yes (15 sources S01–S15 + uncertainties) |
| research/revealed-plan.md | 323cdef9 | yes (frozen thin plan, P1–P6) |
| critic/source-map.json | 5c27e74c | yes (8 re-fetches S01–S06, S08, S11; not_refetched S07/S09–S15) |
| critic/critique.md | 2a085536 | yes (findings F1–F13) |
| research/sources/ (3 excerpt files) | a6f43e4f, 3a57381e, 5e6c83a2 | yes |
| critic/sources/critic-audit-excerpts.md | ab5c8c46 | yes |
| critic/sources/index.md | 94dfe59d | yes |

Lineage cross-check: the digests the critique cites for draft (cff97ab1), discovery
(598fbc58), research source-map (3426631f), revealed-plan (323cdef9) and brief
(4c4e4dd8) match what is on disk now — no drift between stages.

## O1–O6 obligations (exact brief text, compressed; brief is the governing scope)

- **O1** Independently discover useful unfamiliar tools, products and materially
  different approaches beyond the thin plan.
- **O2** Investigate consequential primary source/code behavior and governing
  defaults, units/types, limits and applicability for selected mechanisms.
- **O3** Investigate at least one relevant issue/fix/regression/release or evolution
  chain; say when evidence is absent/inapplicable.
- **O4** Compare every exact P clause after plan reveal; distinguish correction,
  optional enhancement, user decision, already-covered, rejected and uncertain
  findings.
- **O5** Retain useful alternatives, conditions, original constraints, disagreement
  and uncertainty in one self-contained coherent final; do not replace text with IDs.
- **O6** Propose meaningful discriminating validations and separate executed checks
  from proposed work. No runtime available is honest; do not pretend proposals ran.
  Scope is this small product brief, not unlimited production guarantees.

Brief facts binding all clauses: 120 remote water-utility gauges; data arrive late,
out of order, sometimes duplicate; operators need understandable alerts and
acknowledgement history; operational triage, not automated safety control; modest
self-hosted budget; investigate products, transport/storage/alert mechanisms, version
behavior, outage recovery, future expansion.

## P clauses (exact quotes from revealed-plan.md, frozen)

- **P1**: "Ingest MQTT readings into a time-series database."
- **P2**: "Alert when the latest reading exceeds one fixed threshold."
- **P3**: "Missing readings count as zero."
- **P4**: "Clients acknowledge an alert locally then sync."
- **P5**: "Keep data for a year."
- **P6**: "Validate with a static sample CSV."

## Draft's existing P dispositions (baseline the critique audited; final must re-adjudicate, not copy)

- P1 already-covered + corrections + user decisions (Mosquitto persistence false /
  autosave 1800s / queue 1000; Telegraf persistent_session false + QoS 1/2 advice;
  VM interval dedup biggest-value tie-break vs QuestDB key upsert, WAL, new inserts only).
- P2 correction + user decisions (timestamp-governance ambiguity; Alertmanager noise
  defaults 30s/5m/4h/5m; grouping/groupKey; hysteresis).
- P3 rejected as written → explicit stale/unreachable state (ThingsBoard inactivity
  alarms, Healthchecks period/grace; zero is a plausible water measurement).
- P4 correction (server-side ack with who+when, S08; conflict rules; Alertmanager
  silences ≠ ack history; OnCall OSS dead; GoAlert live but caveated).
- P5 already-covered + corrections (telemetry vs ack-history retention; resolution
  granularity; no sizing claims).
- P6 correction + rejected as sufficient (static CSV only a smoke gate; pathologies
  must be encoded into the sample; V1–V7 proposed, none executed).
- Cross-cutting registers: alternatives (ThingsBoard CE; Mosquitto+VM/QuestDB+
  Alertmanager/vmalert; RapidScada/FUXA; GoAlert+ntfy+Healthchecks; Sparkplug 3.0;
  OnCall rejected; InfluxDB 3 held pending dup-semantics evidence); uncertainty
  register (S01 VM dedup default; S03 QuestDB version; S06 unpinned master; S07 ntfy
  limits; S10 Sparkplug clauses; S12 InfluxDB 3 dup; S13 FUXA alarms; S14 RapidScada
  modules; S15 GoAlert ack; device-side reading of P4; regulatory retention).

## Criticism ledger — every finding to adjudicate (accept / amend / reject / retain uncertainty), none auto-obeyed

### MATERIAL

- **F1** (P1/P2/P3 omission): payload-timestamp requirement never explicit — plain
  MQTT provides no application timestamp (broker ordering per-client and optional,
  S02); receive-time-only destroys the late/out-of-order semantics the P2/P3
  corrections rely on; draft's P1 user-decision list gestures at payload schema but
  not the consequence. Candidate: add explicit condition "payload must carry the
  gauge timestamp". [target clauses: P1, P2, P3]
- **F2** (cross-cutting omission): gauge clock discipline (NTP/skew) never addressed;
  skewed clock masquerades as late data and defeats "latest reading" windows; absent
  from uncertainty register though late arrival is a named brief pathology.
  [cross-cutting; touches P2, P3, P5]
- **F3** (P1 alternative confidence): Sparkplug retained on snippet-level evidence;
  critic also could not verify (PDF binary excluded); uncertainty label honest and
  STANDS; final must present 0–255 seq / reordering timeout → REBIRTH as hypothesis
  requiring clause verification, not equal-standing alternative. [P1]
- **F4** (P1 condition overstated): "dedup configured before first data" stronger than
  S03 supports — QuestDB: existing rows untouched, new inserts deduplicated (late
  enablement possible, key model still needs early planning); VM branch is closer to
  right (merge/query-time dedup, S01); the two engines must not share one condition
  sentence. [P1]
- **F5** (P6 validation applicability): V1 discriminates only the VM dedup model;
  QuestDB's key-upsert arm has no discriminator; add one (retransmit corrected smaller
  value for same (ts, gauge_id) key; assert row updates). [P6, also P1 user decision]

### MINOR

- **F6** (cross-cutting): fleet-wide staleness must correlate to one "pipeline down"
  alert — broker death → 120 STALE alarms; S04 group_by mechanics already retained;
  connect P3 correction to broker-death scenario. [P3, P2]
- **F7** (P5 wording): "a year of 120 gauges is modest" is an unevidenced soft sizing
  assertion; drop the adjective or derive it; V7 stays the sizing instrument. [P5]
- **F8** (P2 terminology): "Alertmanager rules fed by vmalert" conflates routing
  (Alertmanager) with threshold evaluation (vmalert/Prometheus-style); fix naming.
  [P2]
- **F9** (P2 unverified clause): "resolved-before-group_wait notifies nobody" was in
  the predecessor S04 excerpt; critic re-fetch confirmed timing defaults and group_by
  '...' but did not specifically capture that sentence; carry as unverified-by-critic
  (still single-source excerpt-backed). [P2]
- **F10** (P4 omission): Alertmanager webhooks re-send on repeat_interval (S04), so the
  webhook-fed custom ack table needs delivery-level dedup on groupKey + fingerprint +
  status, not just ack event ID. [P4]
- **F11** (P4 alternative): GoAlert ack-history specifics unverified (S15, not
  re-fetched); caveat stands in any final. [P4]
- **F12** (P1): TLS/auth posture left as user decision with no retained Mosquitto TLS
  sources; acceptable for thin-plan scope; a recommending final would need evidence it
  does not have — keep as user decision, no posture recommendation without evidence.
  [P1]
- **F13** (O3 chain 2): the two OnCall dates are distinct events — banner "archived by
  the owner on Jun 5, 2026" (read-only enforcement) vs README "archived on 2026-03-24"
  (project archive); final must name them as distinct events. [O3]

### Critic's declared invalid demands (must not be silently obeyed; final states its own position)

1. Demanding executed V1–V7 results now — invalid (no runtime at any stage; honesty
   required).
2. Demanding clause-level Sparkplug verification — conflicts with no-binary-downloads
   unless a non-PDF clause source is found; unverified is the honest state (F3).
3. Demanding storage sizing numbers — would be fabrication; V7 is the instrument.
4. Demanding "resolution" of InfluxDB 3 dup semantics or GoAlert ack specifics —
   exceeds evidence; correctly unknowns.
5. Demanding the draft be rewritten in the critique — out of critic scope; findings
   recorded, none applied; repair is this stage's job.

### Critic's P-disposition review verdicts (baseline; final re-adjudicates each)

P1 SURVIVES (amendments: F1 condition, F4 wording); P2 SURVIVES (F8, F9, F1);
P3 SURVIVES, reinstating zero-fill would be INVALID (F6 adds fleet case); P4 SURVIVES
(F10, F11; device-side reading stays open); P5 SURVIVES (F7; TTL default still
unknown); P6 SURVIVES (F5 adds QuestDB discriminator).

## Evidence-state notes for later tickets

- Critic re-verified with verbatim agreement: S01, S02, S03, S04, S05, S06, S08, S11
  (S11 uncertainty CLOSED by critic's direct fetch of the trailing-slash URL variant;
  recorded as documented normalization, not a rebind).
- Not re-fetched by critic (predecessor uncertainty STANDS): S07 ntfy, S09 Healthchecks
  (single-arm excerpt), S10 Sparkplug (F3), S12 InfluxDB 3, S13 FUXA, S14 RapidScada,
  S15 GoAlert.
- Executed so far in this arm: source retrieval (research stage), 8 critic re-fetches,
  critic comparison, this ingestion. Proposed: V1–V7 (V8 candidate from F5) — none run.
- Adjudication policy for ticket 2: use evidence over obedience — F1/F2/F4/F5/F6/F7/
  F8/F10/F13 look correct on the retained sources and are expected accepts/amends;
  each still gets its own evidence check against the excerpt files before the final
  adopts it; F3 and F9/F11 are retain-uncertainty cases; F12 accept-as-scope-decision.
- O1–O6 coverage checklist for the final (ticket 3/4): O1 via discovery §approaches;
  O2 via per-P retained defaults; O3 via chains (Mosquitto 2.0, OnCall two-date, InfluxDB
  1→2→3, QuestDB dedup evolution); O4 per-P dispositions with exact clause quotes;
  O5 self-contained text, no ID-only substitutions; O6 executed-vs-proposed separation
  plus per-decision discriminating validations incl. the QuestDB arm (F5).
