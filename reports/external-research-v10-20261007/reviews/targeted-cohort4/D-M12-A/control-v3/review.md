# Independent source review — D-M12-A, frozen final v3

**Overall: FAIL. Full declared source/science scope assessed.** This is the first review of this exact version. Six material defects prevent PASS; the review does not stop at a localized defect or infer source correctness from hashes alone.

The candidate artifact is [final.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/final.md), SHA-256 `d14088f3cbd98e091f6f0ed2b9b6672219d2da23620a3bc1cdab6dd7047bec15`. Its exact hash was verified before assessment and checked again during artifact validation. Candidate bytes, source indices and candidate grade artifacts were not changed. The final has eight numbered findings and 1,099 whitespace-delimited words, within the brief’s soft ceiling.

The central challenge to retry-until-acknowledged is supported. The broker, outbox, HTTP idempotency and checkpoint families are useful, and SMTP/DTN are relevant analogies. The decisive problems are missing durable local recovery and atomic idempotent effects, a protocol-specific reconnect rule exported to all transports, and a retention state transition that does not bound stored bytes. The duplicate and acknowledgement descriptions also need narrower conditions.

## Six axes

| Axis | Disposition | Assessment |
|---|---|---|
| A1 — All required obligations | FAIL | All six subjects appear, but offline durable capture and recovery are not established; a per-item queue is asserted to checkpoint automatically. O1 is only partially met. |
| A2 — Consequential claims and full release/default/type/unit/path/authority conditions | FAIL | All material claims were checked. Several recommendations omit governing durability/atomicity/retry/expiry conditions; universal duplicate and exactly-once statements exceed primary support. |
| A3 — Bounded useful discovery, negative and optional yield | PASS | Distinct broker/QoS, local outbox, checkpointed state replication and HTTP semantic families plus SMTP and DTN analogies are useful. Exactly eight findings and 1,099 whitespace-delimited words; non-exhaustiveness and unresolved product choices are explicit. F4’s claimed negative law is incorrect and is charged to A2/A4, not credited as a valid discovery. |
| A4 — Wrong rejection, correction, unjustified abstention | FAIL | Challenging the sufficient-retry assumption is warranted; excluding a full sync engine/CRDT build respects scope. Rejecting all in-session retry based on MQTT wrongly exports a protocol-specific rule. |
| A5 — Preservation, traceability, uncertainties and options | FAIL | Source hashes, identities and uncertainty are preserved, but governing MQTT session/QoS/error/expiry conditions and CouchDB durable checkpoint prerequisites are lost in the recommendations. Traceability has incorrect section pointers and an uncaptured cited chapter; the latter was independently checked by this review. |
| A6 — Proposed versus executed checks | PASS | T1-T4 are explicitly proposed, and no application or downloaded-code execution is claimed. [E] labels assert source reading only. Candidate historical HTTP/checksum operations are not authenticated by an index/checksum file; reviewer’s independent source checks do not manufacture candidate execution evidence. Test coverage limits are recorded per claim. |

## All six obligations

| Obligation | Coverage | Assessment |
|---|---|---|
| O1 — Address offline persistence and interrupted sync. | PARTIAL | F5 and T4 discuss interruption, but no durable local capture/key/state persistence or restart contract is stated. |
| O2 — Address acknowledgment/retry meaning under duplicate or delayed messages. | MET_WITH_DEFECTS | F1-F3/F8 and T1-T2 address ack, delayed responses and duplicates; success, atomicity and inevitability statements need correction. |
| O3 — Investigate distinct mechanism families and at least one relevant analogy beyond direct survey competitors. | MET | Distinct mechanism families and two relevant non-survey analogies are directly sourced. |
| O4 — Challenge a brief assumption when supported. | MET_WITH_DEFECTS | The brief’s sufficiency assumption is challenged on valid risks; the word guarantees overstates the duplicate argument. |
| O5 — Return at most eight distinct material findings, including useful negative discoveries or uncertainty. | MET | Exactly eight numbered material findings; uncertainty and negative claims are present, with incorrect negatives identified in this review. |
| O6 — Give bounded proposed changes and discriminating validation, without claiming exhaustive discovery. | MET_WITH_DEFECTS | Four bounded proposals and four discriminating proposed tests, with explicit non-exhaustiveness; unsafe governing conditions need repair. |

Coverage labels distinguish a subject being present from its claims being sound. O1 is partial because queue existence is not a durable-persistence/restart contract. The other subjects are present, with the substantive defects below charged separately. No exhaustive unknown answer key or preset adoption truth was used.

## Material defects and bounded corrections

### D01 — Offline persistence and restart recovery are left implicit (high)

**Candidate:** final.md:19,30,39. **Primary evidence:** E02, E09, E11, E12.

A volatile queue or an unrecovered persisted in-flight state fits the written design and can lose observations or strand them after phone/process interruption. Per-item ack is not itself a durable checkpoint.

**Bounded correction:** Specify a nonvolatile item record containing stable item identity/payload and recoverable delivery state, durably committed before reporting queued or sending. Persist successful item acknowledgement/deletion coherently and recover interrupted in-flight work. This is a local module contract, not a whole-app design.

**Discriminating validation, proposed only:** Terminate the phone process after capture but before send, during in-flight work, and during ack-state persistence; restart and check every uncommitted-to-server item remains recoverable with the same key.

### D02 — UUID plus a seen-key store omits the atomic effect/key contract (high)

**Candidate:** final.md:15,29-30,36. **Primary evidence:** E09, E10, E20.

Recording a key before the observation can make a crash discard valid retries; recording the observation before the key can duplicate the effect. Concurrent duplicates can race a separate check. The proposed exactly-one-record oracle is not justified by a UUID alone.

**Bounded correction:** Require an atomic durable business effect and uniqueness/idempotency decision, by a transaction or equivalent conditional write; preserve key across all replays, define payload/key binding and retry result. Make the deduplication horizon compatible with permitted replay/failed-item recovery. Do not mandate a new storage product.

**Discriminating validation, proposed only:** Send concurrent duplicates and interrupt between effect/key/ack boundaries; replay after restart and after any permitted retention boundary; check one durable effect or an explicit rejected conflict, never silent loss.

### D03 — A MQTT session rule becomes a universal reconnect-only retry policy (high)

**Candidate:** final.md:17,32,43. **Primary evidence:** E03, E04, E13, E15, E21.

A live HTTP/application session can receive a transient failure while connectivity stays up. Waiting solely for a reconnect can strand the item until its cap, even after recovery. The mapped CouchDB and SMTP families support timeout/timer retries.

**Bounded correction:** Keep bounded in-flight work and avoid hot loops, but choose protocol-aware timeout/backoff retry for recoverable failures; reserve MQTT 5 retransmission rules for Clean Start=0 with a retained session and the correct QoS transaction phase. Correct the ordering locator to §4.6.

**Discriminating validation, proposed only:** Keep the network/connection available, return a transient 503/Retry-After or recoverable request failure, then recover the server without reconnect. Check bounded retry makes progress; separately check MQTT resumed-session behavior if that transport is actually selected.

### D04 — A failed-state transition does not bound local retained storage (high)

**Candidate:** final.md:21,31,38. **Primary evidence:** E05, E15, E16, E17.

Age/attempt caps end retries but the proposed never-silently-discarded failed records can remain indefinitely. Continued offline captures can still exhaust a phone. MQTT optional expiry and SMTP configurable timing do not supply a survey data-disposition/capacity contract.

**Bounded correction:** Distinguish retry budget, active/failed-item retention and byte/item capacity. Define visible recover/export/purge or admission/backpressure behavior when capacity is reached, with product-approved ages and data disposition. Preserve failed data until the chosen visible disposition; do not invent a mandatory deletion age from SMTP.

**Discriminating validation, proposed only:** Keep adding offline items through expiry and failures; verify total retained bytes/items stay within the chosen bound and each item has an explicit recoverable or surfaced disposition. Test null/bounce and MQTT in-progress limits only if those analogies become adopted protocols.

### D05 — Duplicate inevitability and consumer-dedup exclusivity are overstated (moderate)

**Candidate:** final.md:13,25. **Primary evidence:** E01, E06, E09, E10, E19, E20.

May duplicate is changed to guarantees duplicates, and a scoped end-to-end warning becomes only consumer dedup can give exactly-once effects. These erase scoped QoS 2 suppression and naturally idempotent effect designs and can lead to unjustified mechanism rejection.

**Bounded correction:** Say at-least-once/lost-ack retry permits duplicates and requires idempotent effects. Keep hop/session delivery, one durable application effect and final delivery separate; dedup is one implementation, and its correctness is conditional on D02. The valid challenge to the brief remains.

**Discriminating validation, proposed only:** Use a lost-before-delivery case with no duplicate and a repeated identical naturally idempotent update or QoS 2 transaction as conceptual discriminators; do not describe these unexecuted cases as application evidence.

### D06 — Acknowledgement stages and success/failure semantics are conflated (moderate)

**Candidate:** final.md:11,30. **Primary evidence:** E01, E02, E06, E07, E08, E17.

The source characterization treats PUBACK/PUBREC/PUBREL/PUBCOMP as only arrival confirmations. Ownership, phase and negative reason codes differ; broker confirmation can even mean an unroutable publish was handled. A protocol acknowledgement is not automatically successful durable observation commit.

**Bounded correction:** Describe the actual hop/session ownership semantics accurately and define a success acknowledgement correlated to the immutable item/operation after the intended durable effect. Classify permanent/temporary failures separately and surface them without deleting an uncommitted observation as successfully synced. Preserve custom-API freedom.

**Discriminating validation, proposed only:** Present a terminal error acknowledgement, an unroutable broker confirm, and a delayed ack from an older item/attempt; confirm the module deletes only the item whose intended durable effect succeeded. These are proposed checks, not observed sandbox behavior.

## Preserved uncertainty and other limits

- **N01:** CouchDB chapter 2.3 was cited but not frozen; reviewer supplemented it directly. Correct MQTT ordering and DTN quote locators are supplied. RabbitMQ visible version is 4.3, more precise than current at capture.
- **N02:** Capture timestamps describe event-time intention; phone wall clocks are not thereby authoritative ordering clocks. LWW versus conflict retention remains an explicit product choice. If retaining CouchDB-like conflicts, basic GET/views conceal losers unless explicit retrieval/presentation is arranged.
- **N03:** Photo-blob multipart behavior is a conditional optional lead beyond the brief’s photo metadata. Implementation size/locality is not independently measurable for the unnamed tool.
- **N04:** Historical candidate route failures and executed checksum operations lack request/execution receipts in the mapped artifact set. Current route checks do not prove or disprove those past operations; Kafka site-wide JS-only language exceeds the checked redirect route.

The actual tool is unnamed and uninspectable. None of these counterexamples is a claim about an observed application defect. The chosen ack point, whether observations can be edited, conflict policy, storage capacity/data disposition, retry parameters and permitted replay horizon remain decisions. Photo-blob handling is an optional lead because the brief declares photo metadata.

## Provenance, versions and capture limits

Original brief: [brief.md](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M12-A/inputs/brief.md), SHA-256 `dac98c2bfdf5944bc4b0a6ce92037085e01e90dd4178e48c7cd3dee049f493e3`. Original manifest: [sources.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/cases/D-M12-A/inputs/sources.json), SHA-256 `50a7a429431407d7d59529fe82f54ab133b6255902092f3addf395c98d019bb2`. Its mode is `OPEN_DISCOVERY_BRIEF_ONLY` and its selected source set is empty.

Review map: [INPUT_MAP.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/INPUT_MAP.json), SHA-256 `16af4de32e1e57532b2f4a5fd508a313885ffcc454e3f580f651d90a2e299130`. Candidate source index: [index.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/index.json), SHA-256 `cdc2c5102b16bb677bc4c9744cefce36e48001b3961445efa6d6ca6810464e22`. The mapped index fields and each source size/hash were independently crosschecked. The checksum list hash is `26b0eeb722cf347232aafc31387d4c97786b46b2230e28b64d242b96ac97c775`; a checksum list alone is not execution evidence.

Every source below was checked in primary bytes and relevant surrounding conditions. Seven reviewer recaptures matched candidate raw bytes exactly. MQTT raw bytes differed on recapture but reviewer-normalized source text matched exactly; its frozen original hash still matches the map. Recapture does not authenticate historical capture timestamps or imply a specification revision.

- **mqtt5-spec:** MQTT Version 5.0, OASIS Standard, 07 March 2019. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/mqtt-v5.0-os.html); [publisher source](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html). SHA-256 `abd47b7f843cd7e03a2970dfabb84d8204c1988b3566f4a3b760cd9deafee3ce`; 1,436,465 bytes. Declared capture: 2026-10-07T20:12:44Z. Exact local size/hash match: yes; independently read source identity/content: yes.
- **sqs-standard-queues:** AWS SQS Developer Guide, Standard queue type, rolling current-at-capture page. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/sqs-standard-queues.html); [publisher source](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html). SHA-256 `ddc9c32ef9654fed493a1a61d05d05896214e32d6012e6be4658558ce65058b2`; 14,250 bytes. Declared capture: 2026-10-07T20:15:23Z. Exact local size/hash match: yes; independently read source identity/content: yes.
- **rabbitmq-confirms:** RabbitMQ documentation Version 4.3; AMQP 0-9-1 acknowledgements and publisher-confirm extension. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rabbitmq-confirms.html); [publisher source](https://www.rabbitmq.com/confirms.html). SHA-256 `f768857aa5cded67cf19c0205bc57c1ca10702e00d620d32cb2051f96e31f951`; 121,173 bytes. Declared capture: 2026-10-07T20:15Z (approx., same batch as sqs-standard-queues). Exact local size/hash match: yes; independently read source identity/content: yes.
- **transactional-outbox:** Chris Richardson, Transactional Outbox pattern, unversioned current-at-capture page. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/transactional-outbox.html); [publisher source](https://microservices.io/patterns/data/transactional-outbox.html). SHA-256 `7b9d9b224d9b985bf03d581dcdef5c94a21f49a93f3ac1e74c6bc2104a48b3eb`; 25,474 bytes. Declared capture: 2026-10-07T20:12:44Z. Exact local size/hash match: yes; independently read source identity/content: yes.
- **couchdb-replication-protocol:** Apache CouchDB 3.5 documentation; Replication Protocol document Version 3. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/couchdb-replication-protocol.html); [publisher source](https://docs.couchdb.org/en/stable/replication/protocol.html). SHA-256 `314bbd15492c99eaa5b0d6161a50104e17b107e8111f0f2ff9cdc582c7477a7a`; 185,155 bytes. Declared capture: 2026-10-07T20:12:45Z. Exact local size/hash match: yes; independently read source identity/content: yes.
- **rfc9110:** RFC 9110, STD 97, Standards Track, June 2022. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc9110.txt); [publisher source](https://www.rfc-editor.org/rfc/rfc9110.txt). SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`; 502,941 bytes. Declared capture: 2026-10-07T20:12:45Z. Exact local size/hash match: yes; independently read source identity/content: yes.
- **rfc5321:** RFC 5321, Standards Track, October 2008. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc5321.txt); [publisher source](https://www.rfc-editor.org/rfc/rfc5321.txt). SHA-256 `7d560eddff1b213c17d4e1e5f95005728b2f05bc2b3947f0fcc91717c6707634`; 225,929 bytes. Declared capture: 2026-10-07T20:12:45Z. Exact local size/hash match: yes; independently read source identity/content: yes.
- **rfc4838:** RFC 4838, Informational architecture, April 2007. [Frozen primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc4838.txt); [publisher source](https://www.rfc-editor.org/rfc/rfc4838.txt). SHA-256 `5e24f7c42d7cce46f321a2264b44fc91f7888f69d68b95ca10bd3c680e8d6790`; 89,265 bytes. Declared capture: 2026-10-07T20:12:45Z. Exact local size/hash match: yes; independently read source identity/content: yes.

A bounded public module made 12 GET requests, all HTTP 200 within 18-second and 3,000,000-byte per-request limits, with no retries or truncation. Eight recaptured the declared sources; four supplemented the CouchDB conflict chapter, RabbitMQ reliability guide, one Kafka redirect route and the pattern author’s idempotent-consumer explanation. Requests, redirects, timestamps, versions, headers, SHA-256 and file paths are retained in [public-checks/index.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/index.json). No downloaded code was executed. The pattern author’s Kafka discussion was not used as official Kafka semantic evidence.

## Primary evidence records

HTML line ranges below refer to reviewer-generated extractions, never publisher line numbering. They are bound to the exact primary file path and SHA-256. RFC TXT line ranges preserve the original capture lines. The section/anchor identifiers are the primary locators. These records state source facts separately from review inferences.

### E01 — mqtt5-spec

**Primary locator:** §4.3.2 [MQTT-4.3.2-3/4/5], flow note; §4.3.3 [MQTT-4.3.3-3/4/5/8/10/11/12/13]; §4.4 [MQTT-4.4.0-2]. **Version/authority:** MQTT Version 5.0, OASIS Standard, 07 March 2019.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/mqtt-v5.0-os.html); SHA-256 `abd47b7f843cd7e03a2970dfabb84d8204c1988b3566f4a3b760cd9deafee3ce`. [Publisher URL](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/mqtt5-spec.lines.txt), lines 11691-11742,11789-11792,11813-11883,11898-11900,11997-12004.

**Stated source fact:** QoS 1 PUBACK and successful QoS 2 PUBREC transfer application-message ownership; onward delivery need not finish first. PUBREL is the sender’s release phase, not merely an arrival confirmation. PUBREC/PUBACK error reason codes at or above 0x80 end the PUBLISH retry even though processing failed. QoS 2 suppresses repeated delivery for an existing transaction.

**Governing conditions:** Packet Identifier correlation, QoS level, protocol phase and reason code matter. These are link/session-scoped guarantees, not a survey business-commit guarantee; Packet Identifiers become reusable after transaction completion.

### E02 — mqtt5-spec

**Primary locator:** §4.1.1 Storing Session State; §4.1.2 non-normative examples. **Version/authority:** MQTT Version 5.0, OASIS Standard, 07 March 2019.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/mqtt-v5.0-os.html); SHA-256 `abd47b7f843cd7e03a2970dfabb84d8204c1988b3566f4a3b760cd9deafee3ce`. [Publisher URL](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/mqtt5-spec.lines.txt), lines 11527-11566.

**Stated source fact:** Session state retention rules do not require every deployment to persist on nonvolatile storage. The specification contrasts a volatile meter deployment with an application that writes nonvolatile data before network transmission.

**Governing conditions:** Storage limits, administrative termination and hardware/software loss are acknowledged. The nonvolatile example is risk-dependent design guidance, not a normative guarantee that an arbitrary queue is durable.

### E03 — mqtt5-spec

**Primary locator:** §3.1.2.11.2 Session Expiry Interval; §4.4 [MQTT-4.4.0-1]; §4.3.3 [MQTT-4.3.3-6]. **Version/authority:** MQTT Version 5.0, OASIS Standard, 07 March 2019.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/mqtt-v5.0-os.html); SHA-256 `abd47b7f843cd7e03a2970dfabb84d8204c1988b3566f4a3b760cd9deafee3ce`. [Publisher URL](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/mqtt5-spec.lines.txt), lines 4271-4296,11836-11840,11887-11900.

**Stated source fact:** MQTT 5 retries unacknowledged QoS>0 PUBLISH/PUBREL with original Packet Identifiers on reconnect with Clean Start=0 and a session present; retransmission is forbidden at other times. After PUBREL, the sender retries the transaction’s PUBREL, not PUBLISH.

**Governing conditions:** This is MQTT 5 session/protocol logic, not an application-independent retry law. Session expiry is a Four Byte Integer in seconds; absent/zero ends the session on disconnect; 0xFFFFFFFF means no expiry. Preserved session state is essential to this retry path.

### E04 — mqtt5-spec

**Primary locator:** §4.6 [MQTT-4.6.0-1..6]; §3.1.2.11.3 Receive Maximum; §4.9 [MQTT-4.9.0-1/2/3]. **Version/authority:** MQTT Version 5.0, OASIS Standard, 07 March 2019.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/mqtt-v5.0-os.html); SHA-256 `abd47b7f843cd7e03a2970dfabb84d8204c1988b3566f4a3b760cd9deafee3ce`. [Publisher URL](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/mqtt5-spec.lines.txt), lines 12026-12088,4385-4404,12575-12630.

**Stated source fact:** Client retransmitted PUBLISH packets preserve original send order. Receive Maximum bounds outstanding QoS>0 publishes; quota is replenished by protocol acknowledgements, including error acknowledgements.

**Governing conditions:** Ordering is §4.6, not §4.4. Receive Maximum is a nonzero Two Byte Integer, default 65,535; it applies per connection, not QoS 0, and is reset across connections. Ordered-topic forwarding has topic/client/QoS/non-shared-subscription conditions; bounded in-flight sends alone do not promise arbitrary cross-item business ordering.

### E05 — mqtt5-spec

**Primary locator:** §3.3.2.3.3 [MQTT-3.3.2-5/6]; §4.3.3 [MQTT-4.3.3-7/13]. **Version/authority:** MQTT Version 5.0, OASIS Standard, 07 March 2019.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/mqtt-v5.0-os.html); SHA-256 `abd47b7f843cd7e03a2970dfabb84d8204c1988b3566f4a3b760cd9deafee3ce`. [Publisher URL](https://docs.oasis-open.org/mqtt/mqtt/v5.0/os/mqtt-v5.0-os.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/mqtt5-spec.lines.txt), lines 6712-6738,11836-11840,11882-11883.

**Stated source fact:** Message Expiry Interval is optional. When absent, the application message does not expire. When supplied, it controls a subscriber copy’s lifetime before onward delivery starts; the forwarded remaining interval is reduced by time held.

**Governing conditions:** Property identifier 0x02; Four Byte Integer in seconds. A QoS 2 sender MUST NOT apply message expiry after PUBLISH has been sent; receiver must finish the QoS 2 acknowledgement sequence even if expiry is applied. This is not an unconditional local retry-count or survey-storage cap.

### E06 — sqs-standard-queues

**Primary locator:** #standard-queues, opening paragraphs. **Version/authority:** AWS SQS Developer Guide, Standard queue type, rolling current-at-capture page.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/sqs-standard-queues.html); SHA-256 `ddc9c32ef9654fed493a1a61d05d05896214e32d6012e6be4658558ce65058b2`. [Publisher URL](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/sqs-standard-queues.lines.txt), lines 33-43,48-63.

**Stated source fact:** Standard queues provide at-least-once delivery; copies may be repeated and may occasionally arrive out of order. SendMessage redundantly stores across availability zones before acknowledging.

**Governing conditions:** Standard is the default queue type; these statements are not claims about every SQS queue type or every underlying transport, nor do they guarantee that every message is duplicated. Broker storage acknowledgement is not final application processing.

### E07 — rabbitmq-confirms

**Primary locator:** #relation; #acknowledgement-modes; #automatic-requeueing. **Version/authority:** RabbitMQ documentation Version 4.3; AMQP 0-9-1 acknowledgements and publisher-confirm extension.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rabbitmq-confirms.html); SHA-256 `f768857aa5cded67cf19c0205bc57c1ca10702e00d620d32cb2051f96e31f951`. [Publisher URL](https://www.rabbitmq.com/confirms.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rabbitmq-confirms.lines.txt), lines 115-140,177-229,674-689.

**Stated source fact:** Publisher confirms and consumer delivery acknowledgements are orthogonal. With manual acknowledgements, unacked deliveries are requeued on channel/connection closure and consumers need idempotent handling. Automatic acknowledgement considers socket write delivery and can lose a message.

**Governing conditions:** RabbitMQ docs 4.3, AMQP 0-9-1. Automatic versus manual mode, connection/channel closure and positive/negative acknowledgement choice affect safety; requeue redelivery does not prove the earlier application consumed a message.

### E08 — rabbitmq-confirms

**Primary locator:** #consumer-acks-delivery-tags; #when-publishes-are-confirmed; #publisher-confirms-ordering; #publisher-confirms-and-guaranteed-delivery. **Version/authority:** RabbitMQ documentation Version 4.3; AMQP 0-9-1 acknowledgements and publisher-confirm extension.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rabbitmq-confirms.html); SHA-256 `f768857aa5cded67cf19c0205bc57c1ca10702e00d620d32cb2051f96e31f951`. [Publisher URL](https://www.rabbitmq.com/confirms.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rabbitmq-confirms.lines.txt), lines 155-175,703-755,761-832.

**Stated source fact:** A publisher confirm can be issued for an unroutable message. Routable persistent messages to durable queues are confirmed after disk persistence; quorum queues require accepted/confirmed replicas. Confirms can arrive out of publication order.

**Governing conditions:** Delivery tags are channel-scoped; confirm mode must be enabled. mandatory publishing receives basic.return for unroutable messages before basic.ack. Positive broker confirm does not by itself mean the intended survey consumer durably processed the observation.

### E09 — transactional-outbox

**Primary locator:** #solution; #result-context. **Version/authority:** Chris Richardson, Transactional Outbox pattern, unversioned current-at-capture page.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/transactional-outbox.html); SHA-256 `7b9d9b224d9b985bf03d581dcdef5c94a21f49a93f3ac1e74c6bc2104a48b3eb`. [Publisher URL](https://microservices.io/patterns/data/transactional-outbox.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/transactional-outbox.lines.txt), lines 45-83,85-116.

**Stated source fact:** Outbox work is written in the database transaction that changes business state and later relayed. Relay crash after publish but before recording completion may republish; idempotent consumers may track processed message IDs.

**Governing conditions:** Atomic local state/work write is the defining mechanism. Duplicate publication is possible, not inevitable. The pattern does not choose a phone storage engine, deduplication expiry or conflict policy for this tool.

### E10 — rfc9110

**Primary locator:** §9.2.2 Idempotent Methods, original TXT lines. **Version/authority:** RFC 9110, STD 97, Standards Track, June 2022.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc9110.txt); SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`. [Publisher URL](https://www.rfc-editor.org/rfc/rfc9110.txt). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rfc9110.lines.txt), lines 3861-3904.

**Stated source fact:** Idempotence means repeated identical requests have the same intended server effect. PUT, DELETE and safe methods are idempotent; logging/history/other side effects may still occur per request. Retrying non-idempotent methods requires known idempotent semantics or knowledge the first request was never applied.

**Governing conditions:** The property concerns requested effects, not byte-identical responses or exactly one execution of every side effect. A UUID alone does not make arbitrary POST logic idempotent.

### E11 — couchdb-replication-protocol

**Primary locator:** #definitions; #generate-replication-id; #compare-replication-logs; #listen-to-changes-feed. **Version/authority:** Apache CouchDB 3.5 documentation; Replication Protocol document Version 3.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/couchdb-replication-protocol.html); SHA-256 `314bbd15492c99eaa5b0d6161a50104e17b107e8111f0f2ff9cdc582c7477a7a`. [Publisher URL](https://docs.couchdb.org/en/stable/replication/protocol.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/couchdb-replication-protocol.lines.txt), lines 205-245,270-281,644-681,820-835,900-919.

**Stated source fact:** Checkpoints record sequence progress for recovery. The replication identity binds the replication process; source/target logs establish common session ancestry. Without common ancestry full replication is required.

**Governing conditions:** Docs 3.5; protocol document Version 3. Replication is directed source-to-target. Sequence IDs are incremental but need not be integers. Source/target URI, persistent peer identity, filters and relevant parameters participate in the replication identity; an arbitrary per-item acknowledgement is not automatically this durable checkpoint mechanism.

### E12 — couchdb-replication-protocol

**Primary locator:** #ensure-in-commit; #record-replication-checkpoint; #upload-batch-of-changed-documents. **Version/authority:** Apache CouchDB 3.5 documentation; Replication Protocol document Version 3.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/couchdb-replication-protocol.html); SHA-256 `314bbd15492c99eaa5b0d6161a50104e17b107e8111f0f2ff9cdc582c7477a7a`. [Publisher URL](https://docs.couchdb.org/en/stable/replication/protocol.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/couchdb-replication-protocol.lines.txt), lines 1420-1437,1651-1695.

**Stated source fact:** The documented algorithm ensures target data is laid down on disk/persistent storage, then records successful replication state in logs on both peers so failure can resume from success.

**Governing conditions:** Commit precedes checkpoint. The page identifies X-Couch-Full-Commit as controlling CouchDB <3.0 delayed-commit behavior and says other peers may ignore it; the old example must not be adopted as a new 3.5 configuration guarantee. A local durable per-item ack ledger can play an analogous role, but its transaction and restart semantics must be specified.

### E13 — couchdb-replication-protocol

**Primary locator:** #protocol-robustness; #optimisations. **Version/authority:** Apache CouchDB 3.5 documentation; Replication Protocol document Version 3.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/couchdb-replication-protocol.html); SHA-256 `314bbd15492c99eaa5b0d6161a50104e17b107e8111f0f2ff9cdc582c7477a7a`. [Publisher URL](https://docs.couchdb.org/en/stable/replication/protocol.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/couchdb-replication-protocol.lines.txt), lines 1821-1829,1948-1970.

**Stated source fact:** Replicators should detect timeouts and repeat failed HTTP requests; connection pools and keeping sockets open are recommended.

**Governing conditions:** This primary mechanism family directly prevents treating MQTT’s reconnect-only retransmission rule as a universal rejection of retries within a live application/network session. Avoiding hot loops is compatible with timed retries.

### E14 — couchdb-replication-protocol

**Primary locator:** #definitions; #listen-to-changes-feed; #upload-batch-of-changed-documents; #upload-document-with-attachments. **Version/authority:** Apache CouchDB 3.5 documentation; Replication Protocol document Version 3.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/couchdb-replication-protocol.html); SHA-256 `314bbd15492c99eaa5b0d6161a50104e17b107e8111f0f2ff9cdc582c7477a7a`. [Publisher URL](https://docs.couchdb.org/en/stable/replication/protocol.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/couchdb-replication-protocol.lines.txt), lines 215-222,900-919,1420-1437,1544-1553.

**Stated source fact:** Documents may have multiple conflicting leaf revisions; changes feed requests include all leaves and uploaded history preserves ancestry. Multipart document/attachment transfer is a conditional optimization for large attachments.

**Governing conditions:** _id is document identity, _rev is an MVCC revision token; these have distinct roles. The brief contains photo metadata and observations, not a declared photo-blob upload requirement. Attachment mechanisms are an optional lead, not established sandbox behavior.

### E15 — rfc5321

**Primary locator:** §4.5.4.1 Sending Strategy, original TXT lines. **Version/authority:** RFC 5321, Standards Track, October 2008.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc5321.txt); SHA-256 `7d560eddff1b213c17d4e1e5f95005728b2f05bc2b3947f0fcc91717c6707634`. [Publisher URL](https://www.rfc-editor.org/rfc/rfc5321.txt). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rfc5321.lines.txt), lines 3750-3809.

**Stated source fact:** Undeliverable-now mail must be queued and retried. Failed-destination retries must be delayed; the interval generally SHOULD be at least 30 minutes, with more sophisticated variable strategies allowed. Give-up time generally needs to be at least 4-5 days; retry parameters must be configurable.

**Governing conditions:** Minutes and days are SMTP strategy guidance, not hard survey defaults or a universal maximum. Retry depends on cause and destination; a timer/backoff strategy is explicitly described, rather than a universal reconnect-only rule.

### E16 — rfc5321

**Primary locator:** §4.2.5; §6.1 Reliable Delivery and Replies by Email, original TXT lines. **Version/authority:** RFC 5321, Standards Track, October 2008.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc5321.txt); SHA-256 `7d560eddff1b213c17d4e1e5f95005728b2f05bc2b3947f0fcc91717c6707634`. [Publisher URL](https://www.rfc-editor.org/rfc/rfc5321.txt). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rfc5321.lines.txt), lines 2993-3040,4030-4082.

**Stated source fact:** Positive completion after DATA transfers responsibility for delivery/retry/failure notification; temporary/permanent failures preserve sender responsibility with different retry guidance. Accepted mail must not be lost on predictable crash/resource shortage.

**Governing conditions:** Failure notifications after acceptance use a null reverse-path; another notification MUST NOT be generated when the original reverse-path is null. The candidate’s bounce analogy is useful but returning every message unconditionally is not the rule; §4.5.4.1 alone does not establish the return contract.

### E17 — rfc4838

**Primary locator:** §3.6.1 Delivery Options; §3.10 Reliability and Custody Transfer; §4.2 Custody Transfer State, original TXT lines. **Version/authority:** RFC 4838, Informational architecture, April 2007.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc4838.txt); SHA-256 `5e24f7c42d7cce46f321a2264b44fc91f7888f69d68b95ca10bd3c680e8d6790`. [Publisher URL](https://www.rfc-editor.org/rfc/rfc4838.txt). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rfc4838.lines.txt), lines 634-660,1052-1158,1432-1446.

**Stated source fact:** Custody means reliable-delivery responsibility transfers to an accepting custodian, distinguished from final delivery. Custody success signals release corresponding retransmission/accounting state; expiry can bound state lifetime.

**Governing conditions:** Informational architecture from April 2007, used as an analogy. Custody transfer is optional/advisory unless source acceptance is required; not every hop is a custodian, so it is not a true hop-by-hop mechanism. The candidate’s literal responsibility quote is in §3.6.1, with the concept elaborated in §3.10/4.2.

### E18 — couchdb-conflicts

**Primary locator:** #couchdb-replication; #working-with-conflicting-documents. **Version/authority:** Apache CouchDB 3.5 documentation, chapter 2.3.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/couchdb-conflicts.html); SHA-256 `18adf909bb47723d798e06f3e0bad84f228b5952aab6a923cd8a63b0ff30aec5`. [Publisher URL](https://docs.couchdb.org/en/stable/replication/conflicts.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/couchdb-conflicts.lines.txt), lines 183-212,295-355.

**Stated source fact:** CouchDB retains competing revisions, but basic GET and ordinary map input show a deterministic winner. Explicit conflicts=true or open_revs=all queries expose other leaves for application presentation or merging.

**Governing conditions:** This chapter 2.3 was not in the frozen candidate capture: it appeared there as a navigation link only. Reviewer fetched the primary chapter. Retention does not automatically surface conflicts; returned leaf order is not winner order, and deleted leaves need filtering.

### E19 — rabbitmq-reliability

**Primary locator:** #publisher-side; #consumer-side; #confirms. **Version/authority:** RabbitMQ documentation Version 4.3.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/rabbitmq-reliability.html); SHA-256 `452ba2b6dcfd48492356e3abe45e878c93bc55a2ec55e14c2de15de03d549b63`. [Publisher URL](https://www.rabbitmq.com/docs/reliability). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/rabbitmq-reliability.lines.txt), lines 143-174,225-278.

**Stated source fact:** Lost confirms may cause retransmission and message duplication. Consumer logic can deduplicate or be idempotent; a redelivered flag is a hint, not proof the earlier delivery was seen.

**Governing conditions:** Reviewer supplementary 4.3 primary guide. Current successful fetch does not refute a historical 403 asserted by the candidate. No historical candidate execution is inferred from this check.

### E20 — idempotent-consumer-author

**Primary locator:** #idempotency-is-important; #save-messages-in-a-processed_message-table; #store-message-ids-in-the-business-entities-created-or-updated-by-message-handlers. **Version/authority:** Chris Richardson, unversioned article at dated /2020/10/16/ URL; current page at reviewer capture 2026-10-07; publication date not shown in captured body.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/idempotent-consumer-author.html); SHA-256 `d48518392f5e3635c200c8f635403688dc744381bc38774be7bfa80cf4361769`. [Publisher URL](https://microservices.io/post/microservices/patterns/2020/10/16/idempotent-consumer.html). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/idempotent-consumer-author.lines.txt), lines 73-87,99-131.

**Stated source fact:** The pattern author describes naturally idempotent updates as an alternative. For tracked IDs, the key insert and business update occur in one transaction with unique subscriber/message identity; a conditional single-entity operation is another option.

**Governing conditions:** Author primary explanation at dated /2020/10/16/ URL; current page at reviewer capture, with no publication date shown in captured body. SQL multi-table transactions are a condition of the separate-table example, not a required technology choice. Pseudocode was read, never executed. No Kafka semantic claims from this page were adopted.

### E21 — rfc9110

**Primary locator:** §10.2.3 Retry-After, original TXT lines. **Version/authority:** RFC 9110, STD 97, Standards Track, June 2022.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/jobs/D-M12-A/control/normal_research_final-v3/sources/raw/rfc9110.txt); SHA-256 `21c1cdce6ab0e5509b04d84a28000836c7a087cf786efe6f04877ebfff47232a`. [Publisher URL](https://www.rfc-editor.org/rfc/rfc9110.txt). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/rfc9110.lines.txt), lines 4799-4824.

**Stated source fact:** HTTP Retry-After can describe a wait before a follow-up request, including expected unavailability after a 503 response.

**Governing conditions:** Value is HTTP-date or nonnegative decimal delay-seconds. This supports a live-connection transient-failure discriminator; the review does not impose a specific survey delay.

### E22 — kafka-documentation-route

**Primary locator:** HTML title Documentation Redirect; raw UTF-8 byte offsets 16657-17019; derived route text. **Version/authority:** Kafka documentation redirect route at 2026-10-07 reviewer capture.

[Primary bytes](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/kafka-documentation-route.html); SHA-256 `6ed5593a781e0363156c1ce3cbc9b498e340c1fd1f91930990fdc9db6c0ed152`. [Publisher URL](https://kafka.apache.org/documentation/). [Reviewer extraction](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/sources/public-checks/kafka-documentation-route.lines.txt), lines 1-3,144-157.

**Stated source fact:** The fetched /documentation/ route is a 20,029-byte redirect shell with JavaScript location replacement to release-specific paths; it contains no substantive retry/ack mechanism text.

**Governing conditions:** One bounded route check supports a fetch/capture limitation at that route, not the universal claim that Kafka’s entire site only renders content in JS. Historical 404/403 batches and other routes have no frozen response bodies in the mapped set and are not independently authenticated.

## Every consequential claim, recommendation and check

The following inventory covers every substantive final paragraph, F1–F8, the four proposed changes, T1–T4, the dispositions, uncertainty and source/provenance claims. Evidence IDs above provide exact primary locators, bytes, hashes and conditions. Original-brief facts use the hashed brief/manifest in the provenance section. A supported inference is not an executed observation.

### C01 — This is a small, local retry/ack/local-retention module recommendation for an unnamed survey tool.

**Candidate:** final.md:3,7,27-32. **Kind:** scope and implementation-size inference. **Disposition:** SUPPORTED_WITH_LIMITS. **Evidence:** Hashed original brief/manifest or independently checked artifact provenance.

**Primary fact/condition checked:** The original brief confines work to retry/ack and retention for photo metadata and observations; it supplies no implementation.

**Inference/assessment:** Four proposed changes fit the intended module, but server modifications and attachment handling cannot be independently called small/local in an absent codebase. Treat photo-blob handling as conditional.

**Limit:** No app inspection or implementation-size evidence; this is not grounds to demand a whole survey design.

### C02 — Eight selected source captures are frozen with versions, dates and SHA-256/checksums.

**Candidate:** final.md:3,49-51. **Kind:** provenance and executed-source-check assertion. **Disposition:** VERIFIED_BYTES_EXECUTION_LIMIT. **Evidence:** Hashed original brief/manifest or independently checked artifact provenance.

**Primary fact/condition checked:** The exact final, index, eight raw files and checksum entries were independently hashed and match the declared values; map/index fields match. Primary recaptures corroborate identities, seven raw byte-for-byte and MQTT in extracted text.

**Inference/assessment:** A checksum file establishes expected hashes, not that the candidate ran a checksum tool or fetched at asserted times.

**Limit:** Historical request/capture/execution times remain index assertions; no candidate operations log was read or supplied.

### C03 — Retry-until-acknowledged alone is insufficient; stable idempotency, durable acknowledgement and bounded retention are useful additions.

**Candidate:** final.md:7. **Kind:** central recommendation/inference. **Disposition:** SUPPORTED_CORE_WITH_DEFECTS. **Evidence:** E01, E02, E06, E09, E10, E11, E12, E15, E17.

**Primary fact/condition checked:** Primary families distinguish repeated delivery, transferred responsibility and durable state; they support challenging the brief’s sufficient-retry assumption.

**Inference/assessment:** The core recommendation is useful, but implementation-independent sufficiency is not established until the governing contracts in D01-D04 are stated.

**Material defect bindings:** D01, D02, D03, D04; materiality and proposed correction are stated in those records.

### C04 — MQTT PUBACK/PUBREC/PUBREL/PUBCOMP confirm only hop-by-hop arrival.

**Candidate:** final.md:11. **Kind:** protocol fact [E]. **Disposition:** CONTRADICTED_AS_STATED. **Evidence:** E01, E02.

**Primary fact/condition checked:** MQTT ownership, transaction phase and error reason codes distinguish the packets. PUBREL is a release phase; successful PUBACK/PUBREC transfer ownership without waiting for onward delivery. Nonvolatile durability is deployment-dependent.

**Inference/assessment:** The correct limit is that these packets do not prove final survey-business commit. Reducing all four to mere arrival erases consequential semantics.

**Material defect bindings:** D06; materiality and proposed correction are stated in those records.

### C05 — DTN custody moves responsibility among custodians, distinct from final delivery.

**Candidate:** final.md:11. **Kind:** analogy/source fact [E]. **Disposition:** SUPPORTED_WITH_LOCATOR_CORRECTION. **Evidence:** E17.

**Primary fact/condition checked:** The quoted responsibility language is §3.6.1; §3.10/4.2 explain custody transfer and state release. Custody is optional/advisory, not every hop, and the RFC is Informational.

**Inference/assessment:** The analogy usefully defines a durable-responsibility boundary without requiring adoption of DTN. Candidate section pointers are conceptually related but do not locate the literal quote.

**Limit:** No present-day DTN implementation claim; no requirement to survey all DTN successor specifications.

### C06 — A receipt acknowledgement followed by server crash before persistence can lose observations if the client deletes them.

**Candidate:** final.md:11. **Kind:** tool risk explicitly [I]. **Disposition:** SUPPORTED_INFERENCE. **Evidence:** E02, E08, E12, E16.

**Primary fact/condition checked:** MQTT storage examples distinguish volatile/nonvolatile state; RabbitMQ warns of loss before persistence without confirms; CouchDB commits before checkpoints; SMTP prohibits frivolous post-acceptance loss.

**Inference/assessment:** This is a valid conditional counterexample to the sandbox assumption, not a claimed observed sandbox failure.

### C07 — Acknowledge only after durable commit; client deletes only on that acknowledgement, queued to in-flight to acked.

**Candidate:** final.md:11,30. **Kind:** proposed contract. **Disposition:** SUPPORTED_BUT_INCOMPLETE. **Evidence:** E01, E08, E12, E16.

**Primary fact/condition checked:** Durable effect before success acknowledgement is a valid chosen boundary; protocol acknowledgement alone may mean a different stage or failed operation.

**Inference/assessment:** State/key durability, success/failure typing and acknowledgement-to-item correlation must accompany this contract; the three-state arrow alone does not define recovery.

**Material defect bindings:** D01, D06; materiality and proposed correction are stated in those records.

### C08 — SQS Standard at-least-once delivery permits duplicate copies and occasional out-of-order arrival.

**Candidate:** final.md:13,23. **Kind:** source fact [E]. **Disposition:** SUPPORTED. **Evidence:** E06.

**Primary fact/condition checked:** Exact opening paragraphs support both properties for the Standard/default queue type, not all SQS types. SendMessage storage-before-ack is also stated.

**Inference/assessment:** Useful evidence for idempotency and separating event time from receive order; duplicate delivery is possible, not mandatory.

### C09 — RabbitMQ redelivers requeued deliveries never positively acknowledged.

**Candidate:** final.md:13. **Kind:** source fact [E]. **Disposition:** SUPPORTED_WITH_CONDITIONS. **Evidence:** E07.

**Primary fact/condition checked:** With manual acknowledgement, channel/connection closure automatically requeues unacked deliveries. Explicit negative acknowledgement may requeue; automatic-ack mode can instead lose messages.

**Inference/assessment:** The described redelivery family is valid with these modes and triggers; it does not describe every configuration.

### C10 — Lost/delayed acknowledgement means retrying until acknowledgement guarantees duplicates.

**Candidate:** final.md:13. **Kind:** causal source-to-tool inference [E label]. **Disposition:** OVERSTATED. **Evidence:** E01, E06, E09, E19.

**Primary fact/condition checked:** The cited primary documents say may/might duplicate; lost-before-delivery can have no duplicate, and QoS 2 suppresses repeated delivery of an ongoing transaction.

**Inference/assessment:** Sender uncertainty supports possible duplicates and idempotent effects. It does not prove inevitable duplicate deliveries/effects.

**Material defect bindings:** D05; materiality and proposed correction are stated in those records.

### C11 — Amend the sufficient-retry brief assumption rather than accept it.

**Candidate:** final.md:13,43. **Kind:** assumption challenge. **Disposition:** SUPPORTED_WITH_CORRECTION. **Evidence:** E02, E06, E09, E10, E12.

**Primary fact/condition checked:** Durability and duplicate effects supply valid counterexamples to sufficiency even without universal inevitability.

**Inference/assessment:** The challenge remains warranted after replacing guarantees with permits.

**Material defect bindings:** D05; materiality and proposed correction are stated in those records.

### C12 — An outbox relay may crash after publishing and republish; consumers can track processed IDs.

**Candidate:** final.md:15. **Kind:** source fact [E]. **Disposition:** SUPPORTED. **Evidence:** E09.

**Primary fact/condition checked:** The Result context explicitly describes the crash interval and idempotent consumer tracking. The Solution defines atomic state/outbox writing before relay.

**Inference/assessment:** This is a relevant durable-local-work mechanism, not merely a generic competitor citation.

### C13 — HTTP idempotence gives the same effect for identical repeated requests.

**Candidate:** final.md:15. **Kind:** source fact [E]. **Disposition:** SUPPORTED_WITH_EFFECT_SCOPE. **Evidence:** E10.

**Primary fact/condition checked:** RFC 9110 §9.2.2 limits equality to the intended effect, permits other per-request side effects, lists idempotent methods, and conditions non-idempotent retries.

**Inference/assessment:** The ellipsis drops intended; preserve that scope when interpreting exactly-one-record versus all downstream side effects. Responses need not be identical.

### C14 — Client-generated UUID per item and a server seen-key store solve duplicate effects.

**Candidate:** final.md:15,29. **Kind:** proposed analogue. **Disposition:** INCOMPLETE_GOVERNING_CONDITIONS. **Evidence:** E09, E10, E20.

**Primary fact/condition checked:** Author guidance makes key tracking and business updates atomic, with unique identity, or uses an equivalent conditional entity operation; naturally idempotent handlers are an alternative.

**Inference/assessment:** A persistent UUID is useful but does not ensure atomic unique effect by itself. Same identity must survive retries and restarts and refer to the same operation/payload.

**Material defect bindings:** D02; materiality and proposed correction are stated in those records.

### C15 — MQTT forbids resending PUBLISH after sending PUBREL.

**Candidate:** final.md:17. **Kind:** source fact [E]. **Disposition:** SUPPORTED_QOS_PHASE_LIMIT. **Evidence:** E01, E03.

**Primary fact/condition checked:** [MQTT-4.3.3-6] is the QoS 2 transaction-phase rule; PUBREL remains pending until PUBCOMP.

**Inference/assessment:** Correct narrow fact. It is not an application-level prohibition on all repeated attempts.

**Material defect bindings:** D03; materiality and proposed correction are stated in those records.

### C16 — MQTT resent packets preserve original order, cited to §4.4.

**Candidate:** final.md:17. **Kind:** source fact/locator. **Disposition:** SUPPORTED_FACT_WRONG_LOCATOR. **Evidence:** E04.

**Primary fact/condition checked:** [MQTT-4.6.0-1] in §4.6 imposes retransmitted PUBLISH ordering; §4.4 concerns retry eligibility.

**Inference/assessment:** The normative ordering source is present in the frozen bytes, but the candidate locator is wrong. This matters when separating resend eligibility from ordering.

**Material defect bindings:** D03; materiality and proposed correction are stated in those records.

### C17 — Mature acknowledged protocols reject unbounded in-session retry loops.

**Candidate:** final.md:17,43. **Kind:** negative discovery/generalization. **Disposition:** OVERGENERALIZED. **Evidence:** E03, E13, E15.

**Primary fact/condition checked:** MQTT 5 forbids protocol retransmission except resumed session; CouchDB recommends repeating failed HTTP requests and persistent connections; SMTP schedules delayed retries.

**Inference/assessment:** Rejecting hot loops is sensible. Rejecting all in-session timed retries is not supported by the declared families.

**Material defect bindings:** D03; materiality and proposed correction are stated in those records.

### C18 — Retry should be reconnect-driven.

**Candidate:** final.md:17,32. **Kind:** material recommendation. **Disposition:** UNJUSTIFIED_UNIVERSAL_RESTRICTION. **Evidence:** E03, E13, E15, E21.

**Primary fact/condition checked:** MQTT Clean Start=0/session-present retransmission rules are protocol-specific. HTTP can signal a timed retry while remaining connected; CouchDB expects timeout/failure retry.

**Inference/assessment:** Strict reconnect-only application logic can fail liveness after recoverable failures without connectivity transitions.

**Material defect bindings:** D03; materiality and proposed correction are stated in those records.

### C19 — Use ordered bounded in-flight sends.

**Candidate:** final.md:17,32. **Kind:** material recommendation. **Disposition:** SUPPORTED_WITH_PROTOCOL_SCOPE. **Evidence:** E04, E07, E08.

**Primary fact/condition checked:** MQTT Receive Maximum and RabbitMQ manual-ack prefetch demonstrate bounded outstanding work; quota and tag rules are connection/channel-specific and ack order can differ.

**Inference/assessment:** Bounded concurrency is useful; do not infer arbitrary business ordering or a total retry limit merely from an in-flight window.

### C20 — CouchDB checkpoints and common ancestry avoid restarting every interrupted replication from scratch.

**Candidate:** final.md:19. **Kind:** source fact [E]. **Disposition:** SUPPORTED_WITH_PRECONDITIONS. **Evidence:** E11, E12.

**Primary fact/condition checked:** Common histories choose a startup checkpoint; commit precedes updating both peer logs. No common ancestry requires full replication.

**Inference/assessment:** The qualified source mechanism is valid; it is not an unconditional promise that any queue resumes only unsent items.

**Material defect bindings:** D01; materiality and proposed correction are stated in those records.

### C21 — A per-item queue with per-item acknowledgement is already checkpointed at item granularity.

**Candidate:** final.md:19. **Kind:** tool inference [I]. **Disposition:** UNJUSTIFIED_WITHOUT_DURABLE_STATE. **Evidence:** E02, E09, E11, E12.

**Primary fact/condition checked:** Durable state and recorded progress are distinct mechanisms; CouchDB specifies both. An arbitrary queue can be volatile or leave in-flight work unrecovered.

**Inference/assessment:** Per-item acknowledgement can support a checkpoint after a durable local record/recovery contract is specified; that contract is absent.

**Material defect bindings:** D01; materiality and proposed correction are stated in those records.

### C22 — The real interruption risk is a split photo blob and metadata half-completing.

**Candidate:** final.md:19. **Kind:** hypothetical tool risk [I]. **Disposition:** SUPPORTED_ONLY_IF_MULTIPART_ITEMS_EXIST. **Evidence:** E14.

**Primary fact/condition checked:** CouchDB has conditional document-plus-attachment transfer; the brief declares photo metadata and observations, not image-blob upload.

**Inference/assessment:** Half-completion is a useful conditional lead, but calling it the real risk sidelines the required local persistence/recovery risk and assumes an extra payload. No full photo pipeline is required.

**Material defect bindings:** D01; materiality and proposed correction are stated in those records.

**Limit:** The final does label this as an inference; no observed tool behavior is established.

### C23 — Complete an item atomically or resume parts at part granularity.

**Candidate:** final.md:19,32. **Kind:** bounded optional recommendation. **Disposition:** SUPPORTED_CONDITIONAL_INFERENCE. **Evidence:** E12, E14.

**Primary fact/condition checked:** Commit-before-checkpoint and attachment/history mechanisms support explicit atomic completion or per-part state under an actual multi-part item contract.

**Inference/assessment:** This option is reasonable if items contain dependent parts; it does not replace durable local capture or prove blob upload is in scope.

### C24 — SMTP retries at intervals of at least 30 minutes.

**Candidate:** final.md:21. **Kind:** source timing fact [E]. **Disposition:** QUALIFICATION_LOST. **Evidence:** E15.

**Primary fact/condition checked:** Failed retries MUST be delayed; in general the interval SHOULD be at least 30 minutes, with sophisticated variable strategies allowed.

**Inference/assessment:** The candidate states the general guidance as unconditional. Do not transplant an SMTP interval into phone sync.

**Material defect bindings:** D04; materiality and proposed correction are stated in those records.

### C25 — SMTP gives up after at least 4-5 days.

**Candidate:** final.md:21. **Kind:** source timing fact [E]. **Disposition:** QUALIFICATION_LOST. **Evidence:** E15.

**Primary fact/condition checked:** Give-up time generally needs to be at least 4-5 days; retry parameters MUST be configurable, and some notifications may have a shorter maximum.

**Inference/assessment:** This is neither an exact expiry date nor a universal upper storage bound. Product retention ages remain undecided.

**Material defect bindings:** D04; materiality and proposed correction are stated in those records.

### C26 — SMTP returns failed mail, supporting a visible failure state.

**Candidate:** final.md:21. **Kind:** analogy/source fact [E]. **Disposition:** SUPPORTED_WITH_NOTIFICATION_LIMITS. **Evidence:** E15, E16.

**Primary fact/condition checked:** Retry strategy plus §4.2.5/6.1 provide failure-notification responsibility; null reverse-path messages must not generate another bounce.

**Inference/assessment:** A visible survey failure analogue is useful. The cited sending-strategy section alone does not state the full return contract; the correct sections and exceptions are retained here.

### C27 — MQTT likewise carries a Message-expiry property in §4.3.3 context.

**Candidate:** final.md:21. **Kind:** source property fact [E]. **Disposition:** SUPPORTED_EXISTENCE_MISSING_DEFAULT_LIMITS. **Evidence:** E05.

**Primary fact/condition checked:** The property is §3.3.2.3.3: optional Four Byte Integer seconds, absent means no expiry; it addresses subscriber-copy lifetime before onward delivery. QoS 2 sender expiry cannot abort a sent PUBLISH transaction.

**Inference/assessment:** Existence is correct but does not support an unconditional in-flight/phone-local retention cap. The missing defaults and phase limits are consequential.

**Material defect bindings:** D04; materiality and proposed correction are stated in those records.

### C28 — Keeping stale offline work indefinitely can grow storage; silent discard hides data loss.

**Candidate:** final.md:21. **Kind:** tool risk inference. **Disposition:** SUPPORTED_CONDITIONAL_INFERENCE. **Evidence:** E02, E15, E16, E17.

**Primary fact/condition checked:** Sources recognize finite storage/resource and queue responsibility limits; the brief describes continuing offline capture.

**Inference/assessment:** Growth follows continued capture plus retained undelivered data. A fixed single record’s retry by itself need not enlarge storage.

### C29 — Cap retention by age/attempts; move overflow to visible failed with notice.

**Candidate:** final.md:21,31. **Kind:** material recommendation. **Disposition:** FAILS_STATED_STORAGE_BOUND. **Evidence:** E05, E15, E16, E17.

**Primary fact/condition checked:** Retry expiry and state lifetime are separate; these sources do not specify a survey failed-record disposal or capacity contract.

**Inference/assessment:** A state transition stops active retry but does not limit bytes retained in failed. Define recover/export/purge/admission behavior with a visible outcome and a total bound.

**Material defect bindings:** D04; materiality and proposed correction are stated in those records.

### C30 — Delayed/reordered arrivals make client capture time useful rather than server arrival time.

**Candidate:** final.md:23. **Kind:** source-to-tool inference, later identified [I]. **Disposition:** SUPPORTED_WITH_CLOCK_LIMIT. **Evidence:** E06.

**Primary fact/condition checked:** SQS Standard permits reordering; the brief allows extended offline delay. This does not make a correct server receive timestamp inaccurate or prove phone clocks trustworthy.

**Inference/assessment:** Record capture and receive timestamps with distinct meanings. For conflict ordering, client clock skew/tampering and revision identity require a policy; wall-clock LWW is not proven by the sources.

**Limit:** The final retains conflict policy as a product decision; no universal winner is imposed.

### C31 — CouchDB retains conflicting sibling revisions rather than overwriting.

**Candidate:** final.md:23. **Kind:** source fact [E]. **Disposition:** SUPPORTED_WITH_VISIBILITY_LIMIT. **Evidence:** E14, E18.

**Primary fact/condition checked:** Frozen protocol definitions/history preserve conflicting leaves. Independently captured chapter 2.3 confirms sibling retention, but ordinary GET and map functions show only a deterministic winner.

**Inference/assessment:** Retention is true; merge honesty requires explicit conflict retrieval/presentation if this option is selected.

**Limit:** Chapter 2.3 itself was not a captured primary body in the candidate index; it was only a navigation link. Reviewer supplementation verifies the fact without changing the candidate set.

### C32 — Define per-field last-writer-wins or retain conflicts; current edit-conflict policy is a product decision.

**Candidate:** final.md:23,25. **Kind:** proposed options/uncertainty. **Disposition:** SUPPORTED_AS_OPTIONS. **Evidence:** E14, E18.

**Primary fact/condition checked:** CouchDB supplies one revision-preserving example, not a required survey merge policy; the brief does not establish edited-observation semantics.

**Inference/assessment:** Retain these as options gated on whether edits are in scope and which ordering/visibility policy is chosen. Do not claim a source chooses LWW for this tool.

### C33 — End-to-end exactly-once is not established by these transport documents for the unnamed tool.

**Candidate:** final.md:25. **Kind:** bounded negative/uncertainty [E/I]. **Disposition:** SUPPORTED_SCOPE_LIMIT. **Evidence:** E01, E06, E07, E08, E10.

**Primary fact/condition checked:** MQTT QoS 2 gives a scoped delivery guarantee, and broker acknowledgements have link/queue-specific semantics; none establishes an unknown application’s complete durable processing chain.

**Inference/assessment:** Useful negative discovery if kept to the application end-to-end boundary; it should not erase scoped delivery guarantees.

### C34 — Exactly-once exists only where the consumer deduplicates.

**Candidate:** final.md:25. **Kind:** exclusive mechanism assertion [E/I]. **Disposition:** OVERSTATED. **Evidence:** E01, E10, E20.

**Primary fact/condition checked:** Sources preserve naturally idempotent effects and conditional/transactional identity enforcement, alongside MQTT’s QoS 2 suppression. Intended effect is not all-side-effect execution count.

**Inference/assessment:** Consumer dedup is one way to achieve a single business effect; the exclusive phrasing is not primary-supported. Nor does dedup alone establish an end-to-end guarantee.

**Material defect bindings:** D02, D05; materiality and proposed correction are stated in those records.

### C35 — The sandbox acknowledgement point and edit-conflict policy are unresolved and gate choices.

**Candidate:** final.md:25,43,47. **Kind:** uncertainty and option preservation. **Disposition:** SUPPORTED. **Evidence:** Hashed original brief/manifest or independently checked artifact provenance.

**Primary fact/condition checked:** The original brief supplies no server implementation, storage contract or edit/conflict rule.

**Inference/assessment:** Maintaining these as uncertainties is justified, not an abstention defect. Retention also needs a capacity/data-disposition decision independent of these two questions.

### C36 — The four bounded changes implement findings F1-F6.

**Candidate:** final.md:29-32. **Kind:** proposal binding/traceability. **Disposition:** SUPPORTED_BINDINGS_UNSAFE_CONDITIONS. **Evidence:** E03, E09, E12, E15, E20.

**Primary fact/condition checked:** The key, ack, failure and retry proposals map to their stated finding IDs and remain within an intended module. Their required conditions are not all carried forward.

**Inference/assessment:** Traceability IDs are intact; bindings do not repair the omitted contracts.

**Material defect bindings:** D01, D02, D03, D04, D06; materiality and proposed correction are stated in those records.

### C37 — T1: Inject acknowledgement loss and assert exactly one server record per key survives.

**Candidate:** final.md:36. **Kind:** proposed validation [P]. **Disposition:** USEFUL_NOT_EXECUTED_INCOMPLETE_STRESS. **Evidence:** E09, E19, E20.

**Primary fact/condition checked:** Lost ack can replay an already committed effect; atomic unique handling is the discriminator.

**Inference/assessment:** This is a useful proposed oracle, not proof of current correctness. Include concurrent requests and effect/key crash boundaries to validate the strongest recommendation.

**Material defect bindings:** D02; materiality and proposed correction are stated in those records.

**Limit:** No source or application test execution was performed.

### C38 — T2: Crash server between receive and commit; client keeps and resends.

**Candidate:** final.md:37. **Kind:** proposed validation [P]. **Disposition:** USEFUL_NOT_EXECUTED. **Evidence:** E02, E08, E12.

**Primary fact/condition checked:** Commit-before-success-ack rejects a premature receipt acknowledgement.

**Inference/assessment:** A useful distinguishing test; include an actual durable client queue and a reliable observation of crash location. No outcome is claimed.

**Limit:** Proposed only; no sandbox exists in the supplied material.

### C39 — T3: Age beyond cap; assert failed and never silently discarded.

**Candidate:** final.md:38. **Kind:** proposed validation [P]. **Disposition:** USEFUL_BUT_NOT_STORAGE_DISCRIMINATING. **Evidence:** E15, E16, E17.

**Primary fact/condition checked:** A visible failed state addresses notice; it does not establish a cap on failed-record storage.

**Inference/assessment:** Also test continued capture, total bytes/items and recovery/disposition at capacity. The original oracle could pass while phone storage remains unbounded.

**Material defect bindings:** D04; materiality and proposed correction are stated in those records.

### C40 — T4: Kill mid-batch, resume and send only unacked items.

**Candidate:** final.md:39. **Kind:** proposed validation [P]. **Disposition:** CONDITIONAL_ORACLE_NOT_EXECUTED. **Evidence:** E11, E12.

**Primary fact/condition checked:** Resuming from recorded durable success is sound; a server-committed item whose response was lost remains unacknowledged to the client and can safely be retransmitted with its stable key.

**Inference/assessment:** Define unacked against durable client-observed success, not server commit inferred remotely. Recover in-flight state and tolerate harmless replay around an ack-persistence crash.

**Material defect bindings:** D01; materiality and proposed correction are stated in those records.

### C41 — Accept F2/F3/F5/F6/F7 mechanisms; reject building a full sync engine/CRDT stack.

**Candidate:** final.md:43. **Kind:** disposition/scope decision. **Disposition:** SUPPORTED_SCOPE_WITH_CONDITIONS. **Evidence:** Hashed original brief/manifest or independently checked artifact provenance.

**Primary fact/condition checked:** The original brief explicitly requests only one diagnostic module, with at most eight findings.

**Inference/assessment:** Rejecting a full application/CRDT implementation respects scope. Acceptance of mechanisms is conditional on corrections to their material claims; no preset adoption truth is assumed.

### C42 — Reject unbounded in-session retry loops.

**Candidate:** final.md:43. **Kind:** rejection/negative discovery. **Disposition:** VALID_HOT_LOOP_REJECTION_BAD_RECONNECT_BASIS. **Evidence:** E03, E13, E15.

**Primary fact/condition checked:** Backoff/timed request retry and persistent connections remain supported alternatives; MQTT has a narrower prohibition.

**Inference/assessment:** Prevent zero-delay unbounded loops, but do not reject bounded recoverable retries while connectivity remains available.

**Material defect bindings:** D03; materiality and proposed correction are stated in those records.

### C43 — Sources are protocol/infrastructure documents; F1/F5/F7 risk mappings are inferences, and discovery is not exhaustive.

**Candidate:** final.md:47. **Kind:** method/uncertainty preservation. **Disposition:** SUPPORTED. **Evidence:** Hashed original brief/manifest or independently checked artifact provenance.

**Primary fact/condition checked:** The original brief provides no inspectable tool. The frozen source set is standards and primary infrastructure/pattern documentation.

**Inference/assessment:** The final’s [I]/[P] distinction and non-exhaustiveness are appropriate. Other design mappings also need conditional wording; no exhaustive unknown answer key is used.

### C44 — Kafka site content renders only in JS; failed routes constrained discovery.

**Candidate:** final.md:47 and sources/index.json meta.failed_routes. **Kind:** negative provenance/execution claim. **Disposition:** ROUTE_LIMIT_SUPPORTED_SITE_WIDE_UNVERIFIED. **Evidence:** E22.

**Primary fact/condition checked:** Reviewer fetched the declared /documentation/ route: a 20,029-byte JavaScript redirect shell, not substantive docs. The script points to release-specific routes. Historical failure batches lack mapped response bodies.

**Inference/assessment:** A single route explains a fetch limitation but does not establish that the entire site is JS-only or that no primary docs are reachable. Bounded discovery does not require exhaustive Kafka rescue.

**Limit:** No candidate historical failures are independently authenticated; other routes/tags/API failures were not replayed, and no Kafka mechanism conclusion is adopted.

### C45 — Versions/authority identities are MQTT 5.0 OS 2019, current AWS/RabbitMQ/pattern, CouchDB 3.5, RFC 9110/5321/4838.

**Candidate:** final.md:51 and sources/index.json source version fields. **Kind:** release/version/authority facts. **Disposition:** SUPPORTED_MORE_PRECISE_VERSION_RETAINED. **Evidence:** E01, E06, E07, E09, E10, E11, E15, E17.

**Primary fact/condition checked:** All eight identity/version headers and relevant texts were independently corroborated at primary URLs. RabbitMQ’s body explicitly says Version 4.3; CouchDB docs 3.5 contain Replication Protocol Version 3; RFC 4838 is Informational.

**Inference/assessment:** Current-at-capture plus exact hash pins unversioned pages but does not declare the tool’s deployed transport/version. No source conformance testing or full errata survey is claimed.

### C46 — [E] denotes executed source checking; T1-T4 are [P], not executed application checks.

**Candidate:** final.md:3,11-25,34-39. **Kind:** execution-versus-proposal classification. **Disposition:** DISTINCTION_PRESERVED_EXECUTION_LIMIT. **Evidence:** Hashed original brief/manifest or independently checked artifact provenance.

**Primary fact/condition checked:** The final explicitly says proposed, not executed here and uses [E on sources; I on tool] for risk mappings.

**Inference/assessment:** No false application-test execution claim is present. Independent reviewer hash/HTTP/text checks corroborate source facts, not historical candidate source-check operations.

**Limit:** Candidate source-reading/checksum execution has no authenticated receipts in the mapped inputs; it is not upgraded to SourcePASS based on index/exit/hash alone.

## Assessment extent, blinding and delivery

Every substantive final paragraph, source fact, inference, recommendation, rejection, uncertainty and proposed oracle; surrounding release/type/default/unit/authority conditions were read where relevant. Not a claim to have read every unrelated sentence of large specifications.

Eight declared primary sources were hashed and semantically checked; 46 consequential claims, eight findings, four proposals, four proposed tests, six obligations and six axes were assessed. **Unassessed declared material remainder: none.** This does not claim exhaustive discovery or reading unrelated specification clauses. Actual application behavior/test results and historical candidate HTTP/reading operations are intrinsically unverifiable from the provided inputs; those limitations are expressly assessed, rather than converted into SourcePASS.

**M14:** not applicable. The case is D-M12-A, and the map contains no M14 authored set, semantic/projection/preservation views.

Partial only: case/method/arm names are visible in paths and final; source-index meta exposes captured_by provider/model. No cost, winner, speed target, other-arm output, grades, prior findings, parent analysis or campaign history was supplied or sought.

Only the original brief/manifest, map, mapped source index/checksums/primary bytes, this exact frozen final, bounded public primary additions and this reviewer’s own T3 current-run metadata were read. The current-run metadata request returned no timeline items. No drafts, predecessors, other arms/cases, helpers, campaign/history, reviews, parent analysis or prior findings were consulted. This is ordinary fresh review under `rootreviewcarrier-v2`, with no own Goal, delegation, feedback to candidates or rescue/regrade cycle.

Actual reviewer T3 requestedAt: `2026-10-07T20:30:38.033Z`; startedAt: `2026-10-07T20:30:40.838Z`. Effective deadline: `2026-10-07T20:50:25.427292+00:00`, the earlier of the supplied absolute deadline and actual request plus 20 minutes. Writing and lifecycle delivery are included in that deadline. The review was completed before expiry; no expiry extension/reset was used.

Machine-readable complete record: [review.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/review.json). Actual source-operation/check counts and elapsed time: [timings.json](/home/sittingmongoose/PM-Experiments/er10-20261007-5a126dd5/reviews/targeted-cohort4/D-M12-A/control-v3/timings.json). Unknown input/cache/generated/billing counters remain null, and native counters are separate. Final completion in this T3 child task delivers the artifact paths through the normal task lifecycle. No pending children.
