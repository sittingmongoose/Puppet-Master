# W3A — Forge phase 1, prepared without admission

Branch: `plans/ea-w3-forge-20261105`. Base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d` (freshly fetched `origin/main`). Source and evidence are planning-document and test-oracle work. No native execution.

**Outcome:** 35 prepared; 0 merged; 0 excluded; 0 stopped. “Prepared” means the WAVE3 phase-1 deliverable, not complete admission readiness. All 35 have membership **ABSENT** and criterion 12 **PARTIAL**. Thirty-four have the expressly permitted pending-retention cell. No row needs a non-retention DL-045 product decision in this phase. No owner investigation from W3C/F/G/I was assigned to W3A.

**Scope:** 35 separate semantic units FGI-1200..1234, 35 envelope/identity units CV-1200..1234, 35 source/checkpoint units SP-1200..1234, 35 closed payload schemas, 35 canonical source-identity and 35 derived checkpoint Storage rows, and ATS-1200. The 70 appended rows are **Storage values**, not Event Authority families. `Plans/event_family_registry.json`, Decision Log, admission records, governance locks/evidence, and critical/MVP lists are unchanged. Existing event-silent command bindings stay `expected_event_types=[]`; current append remains `missing_event_registration`. Nothing is admitted or enabled.

## Authority and premise checks

- **9.a A / DL-450:** the answer record says “i approve all of it”; the presented deck's item 9.a includes exactly these 35 Forge names. This authorizes missing technical definitions for already specified behavior only. The answer is referenced from its frozen record; it is not appended to Decision Log here. FGI-001..008/011/015/018/020/022..024 still specify the relevant domain and provider constraints at this base.
- **DL-045:** new publisher, source-capture identity, consumer/projector, checkpoint, custody and withdrawal definitions are each explicitly labelled newly authored; no sibling supplies another family's contract. The grant chooses no feature or lifetime. No older August answer is applied.
- **Card 1 / DL-401:** G01 names twelve file-tree actions, G05 five GitHub sign-in names and its own no-project bucket, G26 formatter/LSP/model signals. The recount's closest groups are leads, not exact Forge assignments. The premise that those groups already choose Forge retention fails for all 35 names. No G05 bucket or G01 lifetime is borrowed.
- **Case L-3:** `forge.review.approved` actually records a review approval under FGI-004/020, so its separate event is explicitly bound to the existing Approval class, `RP-AUTHORITY-INDEFINITE@1.0.0`. The other 34 distinguish ordinary observation, operational history and audit authority without a proved classification or no-project count. They remain `PENDING_RETENTION_DECISION` with the exact questions below. Provider pipeline attempts do not become Puppet Master runs to invent a Run-year anchor.
- **Card 2 retention application:** deck-2 items 1.a..1.g and the in-progress `plans/ea-retention-cards2-20261105` address the exact previously named Debug/memory/plugin/model/preview populations, not Forge. None supplies a Forge no-project bucket. No unlanded policy is assumed current.
- **DL-273/current Forge:** retired Origin/hosted Forgejo/Gitea/Codeberg do not regain admission; generic transport does not supply review, mirror or automation authority. Repository function authority is distinct from actor permissions and independent AutomationBinding. Native handlers and provider proof remain unavailable.

## Per-family search and outcomes

Independent exact-name searches at the base covered 1,140 current non-pipeline Plans/schema/registry/fixture/script/test files, excluding generated shards/index, governance audit/migration data and ledger lineage from product evidence. **Every exact-name search returned only its own §3.2 candidate-list line**. No registered family, event payload, publisher, identity recipe, consumer, checkpoint or oracle exists for any of the 35. Semantic search/reuse then inspected FGI-001..008/011/015/018/020/022..024, the common Forge schema's domain definitions, EventRecord/CV-317/339/366, Storage Case L-3/SP-236/278/286/337, and existing source/index/receipt registry rows. FGI-020's missing generic vote carrier is not claimed to exist. This lane newly authors separate closed original vote-evidence objects in the approval and changes-requested source rows, including reviewer, vote, required-reviewer and revision-binding evidence; their own units bind each field to the actual native source. A native source unable to prove those predicates is unavailable.

Full exact hits/negative scope: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/per-family-search.json`, SHA-256 `24b9399d406dff620cc8e9c19a9e8edc8ba00ab765946f8f0f7dbe7431a99733`. ID reservation check: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/id-allocation.json`, SHA-256 `9362c4b1283dc8481ebbc7113a2774db0d35c8757afde469a8195e9660d2bcf8`: 527 fetched origin refs, 181 distinct owner blobs; zero collisions for FGI/CV/SP-1200..1249 and ATS-1200..1209. No IDs outside the assigned block were minted.

| Exact name | Outcome | Owner / envelope / Storage | Reused current owner and original shape | Event retention |
|---|---|---|---|---|
| `forge.api.compatibility_changed` | prepared | `FGI-1200` / `CV-1200` / `SP-1200` | `FGI-007`; `api_compatibility` | `PENDING_RETENTION_DECISION` |
| `forge.connection.capabilities_changed` | prepared | `FGI-1201` / `CV-1201` / `SP-1201` | `FGI-003`; `capability_envelope` | `PENDING_RETENTION_DECISION` |
| `forge.connection.reauthorized` | prepared | `FGI-1202` / `CV-1202` / `SP-1202` | `FGI-006`; `app_installation` | `PENDING_RETENTION_DECISION` |
| `forge.connection.validated` | prepared | `FGI-1203` / `CV-1203` / `SP-1203` | `FGI-003`; `capability_envelope` | `PENDING_RETENTION_DECISION` |
| `forge.mirror.connected` | prepared | `FGI-1204` / `CV-1204` / `SP-1204` | `FGI-002`; `mirror_topology` | `PENDING_RETENTION_DECISION` |
| `forge.mirror.degraded` | prepared | `FGI-1205` / `CV-1205` / `SP-1205` | `FGI-002`; `mirror_topology` | `PENDING_RETENTION_DECISION` |
| `forge.mirror.detached` | prepared | `FGI-1206` / `CV-1206` / `SP-1206` | `FGI-002`; `mirror_topology` | `PENDING_RETENTION_DECISION` |
| `forge.mirror.status_changed` | prepared | `FGI-1207` / `CV-1207` / `SP-1207` | `FGI-002`; `mirror_topology` | `PENDING_RETENTION_DECISION` |
| `forge.mirror.sync_completed` | prepared | `FGI-1208` / `CV-1208` / `SP-1208` | `FGI-002`; `mirror_topology` | `PENDING_RETENTION_DECISION` |
| `forge.mirror.sync_started` | prepared | `FGI-1209` / `CV-1209` / `SP-1209` | `FGI-002`; `mirror_topology` | `PENDING_RETENTION_DECISION` |
| `forge.pipeline.cancelled` | prepared | `FGI-1210` / `CV-1210` / `SP-1210` | `FGI-005`; `pipeline_projection` | `PENDING_RETENTION_DECISION` |
| `forge.pipeline.completed` | prepared | `FGI-1211` / `CV-1211` / `SP-1211` | `FGI-005`; `pipeline_projection` | `PENDING_RETENTION_DECISION` |
| `forge.pipeline.retried` | prepared | `FGI-1212` / `CV-1212` / `SP-1212` | `FGI-005`; `pipeline_projection` | `PENDING_RETENTION_DECISION` |
| `forge.pipeline.started` | prepared | `FGI-1213` / `CV-1213` / `SP-1213` | `FGI-005`; `pipeline_projection` | `PENDING_RETENTION_DECISION` |
| `forge.repository.authority_changed` | prepared | `FGI-1214` / `CV-1214` / `SP-1214` | `FGI-002`; `repository_binding` | `PENDING_RETENTION_DECISION` |
| `forge.repository.created` | prepared | `FGI-1215` / `CV-1215` / `SP-1215` | `FGI-023`; `repository_binding` | `PENDING_RETENTION_DECISION` |
| `forge.repository.discovered` | prepared | `FGI-1216` / `CV-1216` / `SP-1216` | `FGI-023`; `repository_binding` | `PENDING_RETENTION_DECISION` |
| `forge.repository.eligibility_changed` | prepared | `FGI-1217` / `CV-1217` / `SP-1217` | `FGI-003`; `capability_envelope` | `PENDING_RETENTION_DECISION` |
| `forge.review.approved` | prepared | `FGI-1218` / `CV-1218` / `SP-1218` | `FGI-020`; `review_revision` | `RP-AUTHORITY-INDEFINITE@1.0.0` |
| `forge.review.changes_requested` | prepared | `FGI-1219` / `CV-1219` / `SP-1219` | `FGI-020`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.closed` | prepared | `FGI-1220` / `CV-1220` / `SP-1220` | `FGI-004`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.created` | prepared | `FGI-1221` / `CV-1221` / `SP-1221` | `FGI-004`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.marked_ready` | prepared | `FGI-1222` / `CV-1222` / `SP-1222` | `FGI-022`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.merged` | prepared | `FGI-1223` / `CV-1223` / `SP-1223` | `FGI-018`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.reopened` | prepared | `FGI-1224` / `CV-1224` / `SP-1224` | `FGI-004`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.thread.reopened` | prepared | `FGI-1225` / `CV-1225` / `SP-1225` | `FGI-004`; `review_thread` | `PENDING_RETENTION_DECISION` |
| `forge.review.thread.replied` | prepared | `FGI-1226` / `CV-1226` / `SP-1226` | `FGI-004`; `review_thread` | `PENDING_RETENTION_DECISION` |
| `forge.review.thread.resolved` | prepared | `FGI-1227` / `CV-1227` / `SP-1227` | `FGI-004`; `review_thread` | `PENDING_RETENTION_DECISION` |
| `forge.review.updated` | prepared | `FGI-1228` / `CV-1228` / `SP-1228` | `FGI-022`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.review.version_created` | prepared | `FGI-1229` / `CV-1229` / `SP-1229` | `FGI-004`; `review_revision` | `PENDING_RETENTION_DECISION` |
| `forge.webhook.delivery_failed` | prepared | `FGI-1230` / `CV-1230` / `SP-1230` | `FGI-006`; `signed_webhook_delivery` | `PENDING_RETENTION_DECISION` |
| `forge.webhook.delivery_recovered` | prepared | `FGI-1231` / `CV-1231` / `SP-1231` | `FGI-006`; `signed_webhook_delivery` | `PENDING_RETENTION_DECISION` |
| `forge.webhook.received` | prepared | `FGI-1232` / `CV-1232` / `SP-1232` | `FGI-006`; `signed_webhook_delivery` | `PENDING_RETENTION_DECISION` |
| `forge.webhook.redelivery_queued` | prepared | `FGI-1233` / `CV-1233` / `SP-1233` | `FGI-006`; `signed_webhook_delivery` | `PENDING_RETENTION_DECISION` |
| `forge.webhook.rejected` | prepared | `FGI-1234` / `CV-1234` / `SP-1234` | `FGI-006`; `signed_webhook_delivery` | `PENDING_RETENTION_DECISION` |

The per-family payload paths, exact producer/publisher/consumer/projector/source/checkpoint identifiers and emission predicates are in `W3A-contracts.json` and the named PlanUnits. Every row's new bindings are independently specified; only the pre-existing envelope/receipt/index/physical owners and mechanical schema primitives are shared.

## Original-source, retry and historical behavior

Each actual native owner capture verifies its original operation, native fact revision and exact subject/provider/instance/account source under the real owner boundary. A source row or a matching digest is never its own acceptance proof. The original native source predicate must hold before capture. The complete producer semantic intent is preserved in a verified SP-337 pending pack and committed with the source identity for restart. The actual SP-286/CV-339 first receipt and full-value resolver verify settlement; the same transaction clears the temporary intent ref. Permanent source identity contains refs/commitments rather than a hidden retained body copy. Existing pending live-reference rules protect unsettled work; no new lifetime is selected. Mandatory coherent backup preserves needed original source, pending intent, identity/dedupe, issued custody and lawful retained event/payload membership.

CV-1200..1234 define each exact event/operation/idempotency tuple and adopt EventRecord's producer digest without Storage-assigned metadata. Application keys adopt CV-366 exactly; Project partitions use Storage's reversible `project~` form. No numeric/timestamp implementation or local canonicalization helper is added. Phase 2 must adopt the reviewed shared number/format helper. No invented PM run IDs or source/identity remint on poll/retry/restart/restore.

Each SP unit names a real operating reader purpose, distinct consumer/projector version, exact source/checkpoint schema/table/key, SP-278 full-source scan and nine-field durable token, live snapshot fence, inclusive source cursor, predecessor revision/hash CAS, no-side-effect replay, Q-DERIVED rebuild, source-loss recovery, protected three-generation slot/retirement policy, compatibility and withdrawal. Historical originals use authenticated issuance schema/recipe and remain readable after live provider changes; current access/deletion/withdrawal still governs disclosure. Original receipt replay does not reacquire an obsolete request or execute remote work again.

## Twelve-criterion self-grade

`W3A-self-grade.json` records every family and cell, current exact line/quote evidence, prior=null, change=new and canonical source hashes. This is an author grade of normative contracts, not an independent review or runtime claim.

| Criterion | Result |
|---|---|
| 1 membership/version | ABSENT, all 35; intentional until admission |
| 2 owner | PASS, all 35 normative contracts |
| 3 producer | PASS, all 35; actual owner boundary and SP-286/CV-339 adoption specified, native NOT_RUN |
| 4 closed payload | PASS, all 35; structural/ref validation only |
| 5 scope/identity | PASS, all 35; actual owner scope, exact tuple and envelope joins |
| 6 replay/idempotency | PASS, all 35 normative contracts |
| 7 retention | PASS for review.approved's exact Approval class; PARTIAL for 34 unanswered event assignments |
| 8 redaction/custody | PASS, all 35 normative custody contracts |
| 9 transitions | PASS, all 35 exact emission/non-emission predicates |
| 10 consumers/checkpoints | PASS, all 35 normative SP-278/DL-076 bindings |
| 11 compatibility/withdrawal | PASS, all 35 normative bindings |
| 12 positive/negative oracles | PARTIAL, all 35; plan only, phase 2 outstanding |

## Criterion-12 oracle plan and standing-check accounting

`W3A-oracle-plan.json` contains 3,237 guard-plan rows across all 35 families, each with a valid positive construction, a targeted negative construction and an isolation rule. It also names exact family-specific transition witnesses, restart/pending-pack/first-receipt boundaries and the two reviewed foundation dependencies. These are plans, not executed fixtures.

| Standing finding | Phase-1 coverage / remaining proof |
|---|---|
| 1 native/source/digest substitution | Per-source provenance and field-by-field joins, recomputation from actual source; negative constructions planned, not executed |
| 2 Storage metadata | Sequence/times/receipt fields come from actual Storage; mismatch plans for each join |
| 3 retained history | Live state change, compatibility and replay-only historical positives; invalid/withdrawn/foreign negatives planned |
| 4 representation ambiguity | Exact types/bytes and original-recipe selection required; no new local normalization |
| 5 unresolved refs | Eager structural closure check over all newly authored branches passed; no visited-fixture-only resolution |
| 6 size boundaries | SP-337 payload/pending pack; all encoded physical metadata values also bounded, oversize refuses before effects |
| 7 custody paths | Start/source/first-receipt verification before advance, retry, replay and recovery |
| 8 / check 11 masking | One primitive defect per construction; dependent mirrors/keys/digests kept coherent; no proof claimed; shared tool in phase 2 |
| 9 honest grades | Membership ABSENT, 34 retention cells PARTIAL, all criterion-12 cells PARTIAL |
| 10 numbers | No number code; owner recipes/domains and boundary/spelling plans for reviewed shared helper |
| 11 exact types | Separate wrong-type constructions for string booleans/numbers, null, arrays and objects |
| 12 timestamps/formats | Enforced owner profile required and malformed-form plans; no reliance on unenforced `format` or new time code |
| 10a historical recipes | Authenticated original edition/recipe dispatch; no caller-selected weaker recipe or current-rule rejection of a lawful original |

All remaining “probe by mutation” requirements are deliberately **NOT_RUN** in phase 1 because WAVE3 explicitly reserves oracle code and check-11 proof for phase 2. This report does not claim those recurring defects have been experimentally ruled out.

## Pending retention questions (not stopped rows)

- **`forge.api.compatibility_changed`:** For forge.api.compatibility_changed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.connection.capabilities_changed`:** For forge.connection.capabilities_changed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.connection.reauthorized`:** For forge.connection.reauthorized, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.connection.validated`:** For forge.connection.validated, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.mirror.connected`:** For forge.mirror.connected, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.mirror.degraded`:** For forge.mirror.degraded, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.mirror.detached`:** For forge.mirror.detached, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.mirror.status_changed`:** For forge.mirror.status_changed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.mirror.sync_completed`:** For forge.mirror.sync_completed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.mirror.sync_started`:** For forge.mirror.sync_started, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.pipeline.cancelled`:** For forge.pipeline.cancelled, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.pipeline.completed`:** For forge.pipeline.completed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.pipeline.retried`:** For forge.pipeline.retried, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.pipeline.started`:** For forge.pipeline.started, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.repository.authority_changed`:** For forge.repository.authority_changed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.repository.created`:** For forge.repository.created, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.repository.discovered`:** For forge.repository.discovered, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.repository.eligibility_changed`:** For forge.repository.eligibility_changed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.changes_requested`:** For forge.review.changes_requested, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.closed`:** For forge.review.closed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.created`:** For forge.review.created, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.marked_ready`:** For forge.review.marked_ready, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.merged`:** For forge.review.merged, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.reopened`:** For forge.review.reopened, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.thread.reopened`:** For forge.review.thread.reopened, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.thread.replied`:** For forge.review.thread.replied, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.thread.resolved`:** For forge.review.thread.resolved, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.updated`:** For forge.review.updated, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.review.version_created`:** For forge.review.version_created, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.webhook.delivery_failed`:** For forge.webhook.delivery_failed, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.webhook.delivery_recovered`:** For forge.webhook.delivery_recovered, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.webhook.received`:** For forge.webhook.received, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.webhook.redelivery_queued`:** For forge.webhook.redelivery_queued, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?
- **`forge.webhook.rejected`:** For forge.webhook.rejected, is this separate Forge history permanent reference-only authority, 2,555-day operational history, 90-day telemetry, or another exact policy; what is its original expiry anchor and Project/no-Project counting bucket (and, if Run year is selected, which real Puppet Master run and approved no-Project counterpart supplies the clock and limits)?

## Shared-file hunks

All pre-existing prose/registry rows remain byte-identical. New units are additive, with no shared-row reflow.

- **`Plans/Contracts_V0.md`:** `@@ -1038,0 +1039,3493 @@ ContractRef: ContractName:Plans/storage-plan.md, SchemaID:pm.event.v0, ContractN`.
- **`Plans/storage-plan.md`:** `@@ -29476,0 +29477,5620 @@ ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0`.
- **`Plans/storage_value_registry.json`:** `@@ -123537,0 +123538,28475 @@`.
- **`Plans/Automated_Testing_System.md`:** `@@ -7236,0 +7237,59 @@ ContractRef: ContractName:Plans/UI_Wiring_Rules.md#UIW-048, ContractName:Plans/U`.
- **`Plans/Forge_Integrations.md`:** `@@ -670,0 +671,5681 @@ These names remain semantic-owner candidates only. This command-contract pass do`.

Contracts units sit at the end of EventRecord's governing section before EventEnvelopeV1. Forge units sit at the end of §3.2 before command admission. Storage and ATS have additive governed addenda. The 70 Storage rows append at the families-array tail; older rows, policy objects, profile and critical/MVP lists are unchanged. Derived files are regenerated only by repository scripts.

## Verification

Checks are run serially, with the VM at least 6 GB available; below 6 GB the lane pauses and resumes at 7 GB. Initial disk: 70 GB available, memory: 16 GB available. `currentness-copy.json` verifies all 15 ignored currentness inputs by SHA-256 before index generation. Copy emitted permission-preservation warnings on the mounted source, but every destination content hash matched.

| Check | Exit | Result / evidence |
|---|---:|---|
| `forge-followup` | 0 | PASS; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/forge-followup.log`, SHA-256 `e463c160e5a0d22ffe74113ba42849669ee0322fc8c584170363f791b6dbd485` |
| `forge-packet-tests` | 0 | 17 existing tests passed; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/forge-packet-tests.log`, SHA-256 `e3f0a689e207779e1d8265dcb7a3e30e982ff88789aa1936ef5cfd7f7f689cf8` |
| `storage-recovery` | 0 | PASS; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/storage-recovery.log`, SHA-256 `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `structure-complete` | 0 | PASS; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/structure-complete.log`, SHA-256 `1c1cbc6ceb3764535edd0a11ea693184335a6eb08a7a02329e848e21d4f74f86` |
| `shard-generate-complete` | 0 | PASS; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/shard-generate-complete.log`, SHA-256 `984126b6be07784510fec816d860b321f52d68978b5b99e7a2bcd292d5a86aa3` |
| `index-generate-complete` | 0 | PASS; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/index-generate-complete.log`, SHA-256 `f85443c580e4a7932161ec5e00ca35f8c96da1efda29296f8aadfd08ca14dc47` |
| `shard-check-complete` | 0 | PASS; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/shard-check-complete.log`, SHA-256 `7e9b336abf34b1be511ab317aac1456585f14badaad7a90773a08a6e9d171835` |
| `index-validate-complete` | 0 | Top-level JSON status=pass; runtime certification remains blocked; `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/index-validate-complete.log`, SHA-256 `98b27354c1874bc332c23ead6b680b278345941e52cf5ad1464edc1f530ee424` |

All 15 currentness files were recopied and SHA-256 compared immediately before the last index generation. The lane paused at 5 GB, rechecked after two minutes at 5 GB, and resumed only after recovery to 14 GB. Inline Storage schemas have 70 distinct resource IDs, preventing cross-record resolver aliasing. Structural validation is not a product oracle or native execution.


No oracle implementation, test edit, product-native execution, admission, registry-family append, Decision Log entry, main push, governance reseal, pm-mail or subagent. The pushed branch is the handoff; phase 2 rebases on reviewed NUMRULE + GUARDTOOL before oracle implementation and Sol/Astra review. Governance staleness from these owner edits is for the later assigned reseal, not repaired here.

## Evidence pins

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/WAVE3.md` — SHA-256 `2c9be0f498dbb67a424997998507111e0c88576c6403ffe8310e14aaba742083`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/BRIEF-DRAFT.md` — SHA-256 `41864b36b0ec066dd89e05ce02241cd87dbdcfcedcd3cc6bfaad43830e322191`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/WAVE2.md` — SHA-256 `52c955b4472cc972c5993cac43e6c1a087877e308bacfeb604b5c37add6fa9b9`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/state/INTEGRATION-NOTES.md` — SHA-256 `84f8a9951104a3446f6ce51823e9c2169174e4e76f898c1ead1ec263d01e66bb`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md` — SHA-256 `e7e8d3f3a2f23737b201becddd94ff0c707815520a366ab32758088c720927fd`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md` — SHA-256 `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-1_20261104.md` — SHA-256 `00bb608e8126b1c39fab29c347737404cf4b6352d3d75b0b3b7b3d1820600386`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md` — SHA-256 `578a6774525bc474ce7ee36da2bd22fae52520aaf940d33c99d0a3aeeb58d696`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3A-rows.jsonl` — SHA-256 `0da9e551897eaaa36398820180f0ffc7c56cadf79614b91b6191c3099d198a33`.

The current ASCII/reference-only event payload schemas are structurally below 4 KiB. Phase-2 SP-337 cases exercise the real pending-intent pack and whole physical source/checkpoint value, rather than an impossible schema-valid oversized event body.

**IDs used:** FGI-1200..1234; CV-1200..1234; SP-1200..1234; ATS-1200. The remaining assigned IDs are unused.

Structural checker source retained for review: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/check_structure.py`, SHA-256 `1387fba01559d80a9d67e3f27a801a9e30be202052df6629387db9e0c79d0313`. This is schema/ref/unchanged-row QA only, not the deferred family oracle code.
