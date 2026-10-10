**Provenance addition:** The existing terminal-science freeze was found during the final recheck and preserved unchanged; all seven science hashes match. Host-reported T3 completion is 2026-10-10T04:09:36.116Z; native completion/effective/billing remain UNKNOWN. [Addition](provenance-addendum.md). The original saved edition is [retained](assessment.initial-saved.md). Source judgment and findings are unchanged.

# Independent ER12 B-APPL-G-01 treatment-v1 applicability assessment

**Source judgment: FAIL.** Saved 2026-10-10T04:17:03.673373+00:00. Role-only review; not a full-pipeline qualification. All six original dispositions are substantively sound, but the required claim 4 correction and the consequential KEEPTTL acceptance oracle contain remaining material errors. Necessary service-latency uncertainty is accepted; native telemetry is scored separately.

## Delivery, scope, method and time

Read the complete rubric, exact role input-map/assignment/freeze, mapped shared assignment/fixture/corpus, full authored verification.md, source-map.json, all five sources members, and assigned native-diagnostic artifacts. verification.md has 900 whitespace-delimited words against the 900-word maximum. All required science artifacts are delivered. Parent reports actual T3 task completion with no pending runs; that does not establish a native Goal, effective route or billing.

Review started 2026-10-10T04:12:03Z; deadline 2026-10-10T04:37:03Z; judgment saved at 2026-10-10T04:17:03.673373+00:00. Ten unique primary pages/files were independently retrieved: the two supplied URLs and eight additional official sources. Raw bytes, response headers, timestamps and SHA-256 are retained in [retrievals](evidence/retrievals.json); [source map](source-map.json) supplies exact local and upstream locators. Tagged implementation files are Redis 7.2.0, not an assumption from current syntax. No service deployment, replica drill, source execution, installation or account change occurred.

## Material findings

### F1: Claim 4 corrected wording reverses the action of EXPIRE GT

Candidate: [Claim 4; corrected wording](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:19); exact text: `GT only tightens keys that already have a finite TTL.`.

The refusal to attach a finite expiry to a persistent key is correct, but tightening an existing timeout means shortening its deadline; GT only accepts a strictly later deadline and therefore extends it. LT is the shortening condition. The candidate includes the correct greater-than definition earlier, leaving its required final correction internally inconsistent. Documentation using this correction can choose GT to shorten a session lifetime and get 0 instead; an extension can succeed when the author expects a tightening-only rule.

Independent primary locators: [official reference](https://redis.io/docs/latest/commands/expire/#optional-arguments), [src/expire.c#L605](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L605). Local evidence: `P1-expire:197-206`, `P6-v720-expire-c:605-625`.

Bounded assessment: On an existing persistent key EXPIRE key seconds GT returns 0. On an existing volatile key it changes the deadline only if the requested absolute deadline is strictly later; it extends rather than shortens that deadline. NX can set expiry on an existing persistent key; a missing key still returns 0.

Materiality: The assignment expressly requires corrected bounded wording and exact operation applicability for every claim. This is a direction error in that correction, rather than a locator defect. Status: Independent documentation and tagged source inspection; no Redis service execution.

### F2: The KEEPTTL acceptance check requires an unsupported strict drop in integer TTL

Candidate: [Acceptance checks for the service, check 1](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:37); exact text: `TTL sess:42 > 0 (smaller than before the KEEPTTL write)`.

KEEPTTL preserves the deadline, while TTL reports rounded integer seconds in Redis 7.2.0. A correct fast write can leave the two reported values equal; elapsed time need not cross a seconds rounding boundary. The listed sequence also supplies no explicit before measurement. Positivity alone does not show the original deadline was retained rather than reset. Using the smaller-than condition as the acceptance oracle can fail a compliant service. Using only positivity can pass a service that incorrectly replaces the original expiration.

Independent primary locators: [official reference](https://redis.io/docs/latest/commands/ttl/), [src/expire.c#L687](https://github.com/redis/redis/blob/7.2.0/src/expire.c#L687), [src/t_string.c#L97](https://github.com/redis/redis/blob/7.2.0/src/t_string.c#L97), [src/db.c#L282](https://github.com/redis/redis/blob/7.2.0/src/db.c#L282). Local evidence: `P4-ttl:67-74`, `P6-v720-expire-c:687-727`, `P7-v720-t-string-c:97-117`, `P10-v720-db-c:282-315`.

Bounded assessment: A prospective deadline-preservation check can compare PEXPIRETIME before and after the successful KEEPTTL write while also checking the new value, isolating the key from competing writers and using an expiry safely in the future. Redis 7.2.0 implements PEXPIRETIME through the absolute-millisecond branch. This is an assessment of an appropriate oracle, not a repair or executed check.

Materiality: Two concrete service acceptance checks are required; this check supplies a false rejection condition for its central KEEPTTL behavior. Status: Tagged-source reasoning and a static arithmetic counterexample only; service check proposed, not executed.

Static counterexample: 60,000 ms remaining and then 59,995 ms remaining both produce `TTL = 60` using the independently read 7.2.0 rounding formula. Equal seconds do not indicate lost retention. This is source arithmetic, not an observed service run.

## Complete claim coverage

### Claim 1: SUPPORTED within stated existing-hash scope

Candidate [1 response](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:7). Subject/operation: Existing sess:42 hash and its key-level expiry; Successful HSET field update. Version: HSET since 2.0.0; behavior confirmed in Redis 7.2.0 implementation. Default/configuration: No expiry-changing option or special notification configuration required. Type/domain: Hash only; a non-hash yields WRONGTYPE rather than this successful update. Exceptions: Missing or logically expired key may be created afresh, with no prior expiry to preserve; no field-level expiration assumption is needed. It preserves the absolute key deadline, not the remaining integer TTL value.

Correct bounded wording for key-level TTL; later-field-expiry uncertainty is outside the stated operation and does not invalidate it. Documentation and tagged-source inspection; no HSET acceptance run claimed.

Independently inspected evidence: `P1-expire:172-179`, `P3-hset:140-154`, `P8-v720-t-hash-c:443-451,606-633`.

### Claim 2: REFUTED

Candidate [2 response](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:11). Subject/operation: Existing session key of either prior type; Successful plain SET replacement, no expiry option. Version: Redis 7.2.0 confirmed; option history in live SET reference. Default/configuration: Default plain SET does not retain TTL. Type/domain: SET creates a string and overwrites prior hash or string; successful SET with GET has a separate old-type constraint. Exceptions: An unmet NX/XX condition is not a successful replacement and returns before modifying the key. Explicit EX/PX and EXAT/PXAT set a deadline in their respective units; KEEPTTL retains an existing one.

Correct for a successful plain replacement; no durability or retry guarantee implied. The proposed plain-SET assertion TTL==-1 is sound for a successfully replaced, isolated, existing test key.

Independently inspected evidence: `P2-set:186-219,1099-1104`, `P7-v720-t-string-c:84-129,153-188`, `P10-v720-db-c:282-315`.

### Claim 3: SUPPORTED

Candidate [3 response](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:15). Subject/operation: Existing string session key with an expiry; Successful SET new-value KEEPTTL. Version: KEEPTTL since 6.0.0; confirmed in Redis 7.2.0. Default/configuration: Retention requires the explicit KEEPTTL option; not plain SET default. Type/domain: Replaces value with a string; expiry options are mutually exclusive. Absent/persistent keys have no retained deadline.. Exceptions: Retains absolute expiry, rather than refreshing the timeout. Conditional SET must actually succeed; after logical expiry, an ordinary lookup can remove the old key first.

Command wording is correct. Its acceptance oracle is defective as recorded in F2. Candidate service check is proposed only; F2 prevents treating it as a valid preservation oracle.

Independently inspected evidence: `P2-set:186-219,1099-1104`, `P7-v720-t-string-c:97-125,232-287`, `P10-v720-db-c:282-315,1649-1677`.

### Claim 4: REFUTED, with material error in correction F1

Candidate [4 response](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:19). Subject/operation: Persistent session key, either string or hash; EXPIRE key positive-finite-seconds GT. Version: GT/NX/XX/LT since 7.0.0, available in 7.2; tagged source inspected. Default/configuration: Persistent is treated as infinite for GT; no finite extension can exceed it. Type/domain: Type-independent key expiry; integer seconds; representable expiry required. EXPIRE accepts non-positive durations too, but that is not the finite-positive premise here.. Exceptions: Missing key returns 0; GT on an already volatile key compares requested absolute deadline with current deadline and rejects earlier/equal values. NX requires an existing key lacking expiry.

Persistent-key rejection and NX alternative are correct; saying GT tightens a finite expiry reverses its direction (F1). Proposed GT-on-persistent=0 and NX=1 assertions are sound, but do not exercise the erroneous finite-TTL direction.

Independently inspected evidence: `P1-expire:197-206,3795-3796`, `P6-v720-expire-c:549-625`.

### Claim 5: REFUTED

Candidate [5 response](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:23). Subject/operation: Existing live session key on the primary; Successful unconditional EXPIRE key 0 versus ordinary deadline expiration. Version: Redis 7.2.0 event-generating branches and configuration checked. Default/configuration: Notifications disabled by default; E plus generic/expired classes needed to observe both keyevent streams; KEA includes the necessary 7.2 classes. Type/domain: EXPIRE is type-independent; seconds=0 causes immediate deletion on the primary under normal command execution. Exceptions: A conditional skip or missing key causes no successful deletion event. Pub/Sub disconnections lose messages. Ordinary expired events follow actual deletion, not an exact theoretical deadline.

Correctly distinguishes del from expired, including zero through EXPIRE rather than extrapolating solely from the notification page negative-timeout wording. Second proposed check is a valid bounded event-type check for sess:42 on a selected DB0 primary with a ready connected subscriber and payload filtering; it is not a lossless-delivery or latency proof.

Independently inspected evidence: `P1-expire:188-191`, `P5-notifications:9-11,32-68,117,122,134-140`, `P6-v720-expire-c:477-483,629-660`, `P9-v720-redis-conf:1869-1919`, `P10-v720-db-c:1679-1688`.

### Claim 6: UNSUPPORTED, not disproven

Candidate [6 response](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md:27). Subject/operation: This session service and replica failover; p99 elapsed cleanup latency below 25 ms. Version: No Redis reference version establishes a service-specific percentile. Default/configuration: Durability, retries, load, failover timing and cleanup endpoint are unspecified. Type/domain: Timer accuracy, logical invisibility, key deletion, memory reclamation and subscriber processing are different observables. Exceptions: Default replicas normally defer physical deletion to primary propagation while read lookups can already regard a key as expired; writable replicas have an implementation exception. No supplied trace or benchmark removes the uncertainty.

Correctly rejects proof from command references without asserting the service is slower than 25 ms. Histograms from a defined cleanup metric under a representative failover drill are an appropriate prospective resolution. No deployed benchmark/drill was required, supplied or executed. Service-specific latency remains honestly UNKNOWN.

Independently inspected evidence: `P1-expire:3738-3773`, `P5-notifications:134-140`, `P6-v720-expire-c:140-159,195-275`, `P10-v720-db-c:88-109,1679-1817`.

## All assigned rubric axes

**1. Original obligations and negative constraints — COVERED with semantic defects.** Full exact assignment, fixture, corpus, all authored science read. Six separate dispositions, citations, corrected wording, uncertainty and two final service checks present; 900 whitespace-delimited words. No new architecture or operational benchmark inference. F1/F2 affect substantive fulfillment, not delivery.

**2. Consequential source claims / applicability — COMPLETE_ASSIGNED_CLAIM_COVERAGE; F1 MATERIAL.** All six claims checked for exact subject, operation, version, default, type/domain and exceptions using official documentation and Redis 7.2.0 code/config. Original six dispositions are sound; required claim 4 correction is wrong.

**3. Useful unfamiliar discovery, alternatives, implementation/history and opportunity — COVERED_TO_ROLE_SCOPE.** Candidate finds in-place versus replacement expiry, KEEPTTL, NX alternative, infinite persistent TTL, event categories, timer-versus-cleanup distinction and active/passive expiry. Histories exclude 8.4-only SET options. Redis architecture alternatives or broad discovery were not assigned. Reviewer additionally located exact 7.2 rounding, absolute-expiry oracle, notification masks and replica logical-versus-physical expiration.

**4. Wrong corrections/rejections and exact plan dispositions — COVERED; F1 MATERIAL.** All six claim dispositions reviewed independently. Refutations of claims 2, 4 and 5 and withholding proof for claim 6 are justified; the GT tightening correction is not. No PlanUnit disposition or finalization critique packet exists in this APPL assignment; those portions are NOT_APPLICABLE.

**5. Supported scope and meaning preserved — COVERED_TO_ROLE_SCOPE.** Existing hash, string replacement, conditional timeout and notification meanings are preserved overall; candidate separates source statements from inference and does not turn p99 uncertainty into a contrary result. F1 corrupts the finite-timeout corrective meaning. No discovery/draft/critique/final pipeline was supplied; this is not a full-pipeline qualification.

**6. Proposed versus executed validation and oracle applicability — COVERED; F2 MATERIAL.** Candidate documents primary-page retrieval and proposes two service checks; there is no service-execution result. Plain SET and persistent GT/NX checks are sound; KEEPTTL strict TTL decrease is invalid. Notification check can discriminate event type under the stated prospective configuration, not establish lossless delivery or p99 failover cleanup.

## Useful independent discoveries and nonmaterial limitations

Redis 7.2.0 TTL converts milliseconds with integer rounding (remaining+500)/1000; correctly retained deadlines can produce equal successive TTL seconds. Independently establishes F2 without a nonexistent service deployment. Sources: P6-v720-expire-c.

Redis 7.2.0 already implements PEXPIRETIME as an absolute-millisecond expiry query, allowing an oracle that directly tests retention instead of elapsed integer seconds. Discriminating prospective validation; no candidate repair or execution. Sources: P6-v720-expire-c, P7-v720-t-string-c, P10-v720-db-c.

The exact 7.2.0 default notification gate and KEA classes include generic del and expired events, while zero-timeout and ordinary expiration reach different notification branches. Resolves the candidate uncertainty about event classes needed by this test, within target version. Sources: P9-v720-redis-conf, P6-v720-expire-c, P10-v720-db-c.

Default read-only replica reads can recognize logical expiry before primary-propagated physical deletion; writable-replica writes are an exception to the broad no-independent-delete description. Keeps claim 6 interpretation bounded without inventing a latency guarantee. Sources: P10-v720-db-c, P9-v720-redis-conf.

The live EXPIRE reference globally calls condition options mutually exclusive, but the 7.2.0 parser rejects NX combinations and GT+LT while permitting XX with GT or LT. Primary documentation versus implementation distinction. Candidate uses only single options here; no material finding is charged for its faithfully captured live quote. Sources: P1-expire, P6-v720-expire-c.

L1 (nonmaterial): Candidate source retrieval UTCs are approximate, source evidence consists of selected excerpts, and exact later-feature/version uncertainty remains. These do not alone make its bounded key-level claims incorrect; independent raw retrievals and 7.2.0 evidence are retained here.

L2 (nonmaterial): The broad replica sentence is suitable for primary-replicated physical deletion by default, but should not imply that an expired key remains readable on a replica or encompass writes to configured writable replicas. Tagged db.c exposes these distinctions. No latency guarantee or design decision is derived from this simplification.

L3 (nonmaterial): The executed field refers to document verification rather than completed service checks. Candidate provides no service transcript or fabricated benchmark; service checks are recorded as prospective in this review. A more explicit label would improve delivery clarity.

## Native, protocol and unresolved evidence

Candidate native activation/completion: **UNKNOWN / not observed**. goal_receipt.json reports goal_created=false and NATIVE_GOAL_UNAVAILABLE. The exact goal_activation.err independently contains the model-creation-failed diagnostic, and stdout is empty; neither authenticates a Goal. Attempt-one rejection and broader absence are authored testimony, not provider receipts. Requested AUTHORIZED_PROVIDER_INSTANCE/GLM route is not effective/billing provenance. The reviewer created one actual native Goal (objective 1365 characters) and will complete it only after this saved judgment; [activation](reviewer-native-activation.json) is separate.

**Candidate native Goal activation/completion: UNKNOWN / NOT_OBSERVED.** Candidate goal_receipt.json reports unavailable and goal_created=false. goal_activation.err supports one model-creation failure; empty stdout is not a native activation/completion receipt. The broader CLI attempt account remains authored testimony.

**Candidate effective provider/model, underlying source transport and billing: UNKNOWN.** Requested route in freeze is not execution provenance. No authenticated effective/billing receipt was assigned or inspected; no savings claim is made.

**Exact candidate terminal completion time and save-before-terminal provenance: UNKNOWN.** Parent reports actual T3 task completed with no pending runs. A terminal-science freeze and assigned-row host T3 completion metadata were found in the final recheck and preserved; they do not authenticate native completion or original author save time.

**Service p99 expired-session cleanup under failover: UNKNOWN.** No deployed data, definition of cleanup, durability configuration, client retry trace or benchmark was supplied. Necessary external uncertainty is accepted and not a FAIL basis.

**Specific deployed 7.2 patch level, notification config and replica writability: UNKNOWN.** Scenario supplies the 7.2 series and primary+replicas only. Tagged 7.2.0 evidence establishes the evaluated command semantics, not the service configuration.

One actual native Goal; unique pm-mail registration/inbox/waiter. No delegation, candidate messages/feedback/repair, account changes, Git/publication, ER11 rescoring, other-arm science files or execution transcripts. Exact assigned-row host terminal/provenance metadata was read during the final recheck. Writes confined to treatment-v1 assessment destination.
pm-mail who returned the global agent registry with task/status metadata while checking for file collisions. No other-arm scientific artifact was opened, no judgment or help was solicited, and registry content was not used as evidence. This incidental registry read limits a claim of absolute metadata blindness.
Five reported primary pages within eight-additional-page allowance; fallback 404 reported; no service run or downloaded-code execution claimed. No execution transcripts inspected; only exact assigned-row host terminal/provenance metadata, including its one recentRuns status, was read. Unobserved actions are UNKNOWN. Native-support fallback was explicitly permitted by the stage assignment; unavailable Goal is kept separate from semantic grade.

The initial search found no terminal-science-freeze; the final recheck found the existing host freeze. It is preserved unchanged and its seven science hashes match independently inspected bytes; see the provenance addition. [Freeze status](terminal-freeze-status.json) records the search. Original frozen input hashes all match the supplied freeze. Input/output science remained unchanged during this review.

## Inspected hashes and navigation

Every completely inspected local input/candidate artifact is listed below. Independent raw/readable source hashes and precise inspection scopes are in assessment.json and source-map.json. Final generated output hashes are in artifact-hashes.json; it excludes itself to avoid a self-hash cycle.

- [ER12_RUNTIME/assessment/RUBRIC-v1.md](ER12_RUNTIME/assessment/RUBRIC-v1.md): `a93d0456d53b3519883ec517135688d2bbb4c12eb62f9a0b6fbe1bf2615fe19b` (2790 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/input-map.json](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/input-map.json): `aa8d9730b741a31b0e474ae5e1dc2f0d2fab1a4fb6c9365366f5c63c9e9cab33` (608 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/assignment.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/assignment.md): `8f18c6f76f0788ad1dbfe7e817859d81d1cf0be0abeb84cefbf016a158eb130f` (1806 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/freeze.json](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/freeze.json): `745db2e12cfcd327a324033bf12aad92fbf98e8a609afeadbda6878422a720d9` (2018 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/verification.md): `0877ec905c20c11957faafbdf561aec949b71c239417d4806df88cdd4ed74b58` (5918 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/source-map.json](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/source-map.json): `b11cd8f2f12bd6e44dff988bb7a2ea65411b6603f818e824fba05d910a07b6a7` (7469 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/goal_receipt.json](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/goal_receipt.json): `a7e5dcb689c008a68a719a077d61cb6987d98a7248b73f57aab4fd1f41ce7b49` (1976 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/goal_activation.err](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/goal_activation.err): `47a1456b8656ffe2f3b004626fc43b7ebeb778f09951d4a673d6c0b039349f14` (77 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/goal_activation.json](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/goal_activation.json): `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` (0 bytes).

- [ER12_RUNTIME/frozen-inputs/B-APPL-G-01/assignment.md](ER12_RUNTIME/frozen-inputs/B-APPL-G-01/assignment.md): `b9fb54cc01d480b34f8a7bcbf82b765fa9c2f524f51b56f1fe96d83d2745588b` (3108 bytes).

- [ER12_RUNTIME/frozen-inputs/B-APPL-G-01/fixture.json](ER12_RUNTIME/frozen-inputs/B-APPL-G-01/fixture.json): `3769783a77959a4303e88ce4f120a94850484d97827327d7bd097a08b823d6b9` (1664 bytes).

- [ER12_RUNTIME/frozen-inputs/B-APPL-G-01/corpus/S1.md](ER12_RUNTIME/frozen-inputs/B-APPL-G-01/corpus/S1.md): `0afe539d82198fc0f544482af3753bfbe0e0b0aa8112d7e51e1ec0b61754d335` (1065 bytes).

- [ER12_RUNTIME/frozen-inputs/B-APPL-G-01/corpus/S2.md](ER12_RUNTIME/frozen-inputs/B-APPL-G-01/corpus/S2.md): `7b4eb11ed633fac9ad76145cd6f64e88fbd5903a95c1929163ed0714786d018d` (963 bytes).

- [ER12_RUNTIME/frozen-inputs/B-APPL-G-01/corpus/index.json](ER12_RUNTIME/frozen-inputs/B-APPL-G-01/corpus/index.json): `f3c2d29d96b36c6050c040d394bacc389990a50d353fa8838052fa6349a06edd` (1305 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R1-expire.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R1-expire.md): `60a0e0960d811bb0550de5778d5232dbcdf22743cffc126f5ebe6c0d7adb9968` (3603 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R2-set.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R2-set.md): `874b244078739686a5781dae59763f37b8e0b9adbaec0e818ada614973faed30` (1249 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R3-hset.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R3-hset.md): `f9c9ff5fe800d6113d3d8740d336078f551ae40312bfbcf1766ce9023a8d2fba` (1028 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R4-ttl.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R4-ttl.md): `1ef2de5de3ff8e9982919b25230702ab8185df4e082bdc42ce37098a5e63f5df` (893 bytes).

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R5-keyspace-notifications.md](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/sources/R5-keyspace-notifications.md): `65bd7c1d4a31e00882a3079efc5f16e8e358d02da1081c6b71abf67042c038a7` (2439 bytes).

- [ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/root-review-request.json](ER12_RUNTIME/assessment/B-APPL-G-01/treatment-v1/root-review-request.json): `6297302e3fb4f5f648f11076998f8f5037490a3d38058311c8e39376ad8455eb` (2841 bytes).

Independent raw primary retrievals:

- [P1-expire](evidence/P1-expire.html): `92cf8b506f8c6c40062f488e05924eabd11a91b1ce984022488316b315b34f8b`; 2026-10-10T04:12:51.042229+00:00; [Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/expire/).

- [P2-set](evidence/P2-set.html): `7b75af37422a19ec020d047b51e7425a781ecdfb526776e9c3ffd6ad4c0971b7`; 2026-10-10T04:12:50.851242+00:00; [Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/set/).

- [P3-hset](evidence/P3-hset.html): `2d522748307439110904f335f3c30560c25587b20403ca938df77e3978c0da0a`; 2026-10-10T04:12:51.155009+00:00; [Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/hset/).

- [P4-ttl](evidence/P4-ttl.html): `a2d3748fb5de8db65976f305e3b0d670337f9b89448e596af2f35899de0da2d4`; 2026-10-10T04:12:50.949772+00:00; [Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/commands/ttl/).

- [P5-notifications](evidence/P5-notifications.html): `eac5aa9353b6386e05acdc84695180f40863dbd7c91798b78d89c5718fe715a6`; 2026-10-10T04:12:50.834031+00:00; [Live official Redis documentation independently retrieved 2026-10-10; option history checked against target 7.2](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

- [P6-v720-expire-c](evidence/P6-v720-expire-c.txt): `b3c7bb30c6bbc2cd99307fb81a917a9c3499d8749b27fdf7060e0da186d53d65`; 2026-10-10T04:12:50.916371+00:00; [Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/expire.c).

- [P7-v720-t-string-c](evidence/P7-v720-t-string-c.txt): `9fae89d4f0c7355612fe2e5daa8fa859d4df2d8f419fffa78719b07daac60b9f`; 2026-10-10T04:12:50.923917+00:00; [Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/t_string.c).

- [P8-v720-t-hash-c](evidence/P8-v720-t-hash-c.txt): `e506d6f1ce57ea8fa7aa13406865fe1b5c0816357b22ffe97e8b969abe4d24f6`; 2026-10-10T04:12:50.991229+00:00; [Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/t_hash.c).

- [P9-v720-redis-conf](evidence/P9-v720-redis-conf.txt): `319286fcdc3d98e9c248d9730f28c3e5bae106a58173f64302039e15507dca14`; 2026-10-10T04:12:51.004319+00:00; [Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/redis.conf).

- [P10-v720-db-c](evidence/P10-v720-db-c.txt): `f20c593e10b02fbc79b1af2ec199ae2d7cb48515ec4c623f682b33b4657720f6`; 2026-10-10T04:12:51.050085+00:00; [Redis Open Source 7.2.0 tagged upstream implementation/configuration](https://raw.githubusercontent.com/redis/redis/7.2.0/src/db.c).


Additional fully inspected provenance hashes:

- [ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/terminal-science-freeze.json](ER12_RUNTIME/runs/B-APPL-G-01/treatment/stages/role/terminal-science-freeze.json): `050a08cf28b3a8c143f83b5de063688e1e4c74427bacb829698cdb50dbe63ede` (13562 bytes).
- [ER12_RUNTIME/mechanics/terminal-evidence-pass2/B-APPL-G-01-provider-native-evidence.json](ER12_RUNTIME/mechanics/terminal-evidence-pass2/B-APPL-G-01-provider-native-evidence.json): `93601a34b19f2f3232e9702f0b57bc2e401a28f29acd33e6b76159e9ec446ac9` (2475 bytes).
