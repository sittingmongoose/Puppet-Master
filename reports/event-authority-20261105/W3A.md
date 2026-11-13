# W3A — Forge phase 1, prepared without admission

**Wave 3 phase 2 (2026-11-13):** oracles executed and guard tables proved; the 34 pending retention cells are bound to DL-453/454/455. The phase-1 text below is kept as written; "Wave 3 phase 2: findings and responses" at the end supersedes its criterion-12 and retention statements.

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

`W3A-self-grade.json` records every family and cell, current exact line/quote evidence, round-1 prior statuses, change=carried and canonical source hashes. This is an author grade of normative contracts, not an independent review or runtime claim.

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

`W3A-oracle-plan.json` contains 3,272 guard-plan rows across all 35 families, each with a valid positive construction, a targeted negative construction and an isolation rule. It also names exact family-specific transition witnesses, restart/pending-pack/first-receipt boundaries and the two reviewed foundation dependencies. These are plans, not executed fixtures.

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

_Resolved in wave 3 phase 2: every question below is answered by DL-453, DL-454 or DL-455 (E-CARDS-3); see "Retention cells" in the phase-2 section._

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

## Verification at the initial phase-1 head

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


## Phase-1 review round 1: findings and responses

Fix base: `14c461e7cfe7004a31ef426f4313a30318600d2e`. Implementation commit: `e4880006e5d2fc8a94997fd355f3e7cd13b61e66`.
The phase-1 Sol review's R1 and R2 are accepted and revised in all 35 families. Independent re-review is pending; no phase-2, admission or runtime readiness is claimed. Review input: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/W3A-sol/REVIEW-phase1.md`, with its full `oracle-plan-findings.json`.

- **R1 — fixed (`e4880006e5d2fc8a94997fd355f3e7cd13b61e66`).** Every SP-1200..1234 now separates correct recipes, actual seed issuance, ID membership and selector/current predicates. Within one root only the seed varies; seed reuse with the correct recipe forces ID reuse. Correct recipes plus unique ID membership entail distinct seeds. Different seeds alone do not prove distinct IDs. There is no separate seed-uniqueness refusal or claim that different predicates are duplicate enforcement. The original durable SP-278 preparation/anchor proves seed/root issuance; computed-ID equality belongs only to the recipe predicate. The replacement membership negative reads a root A,B,B: one selected current A and a verbatim authentic retired B twice, within three nodes. The replacement issuance negative uses a unique but unissued seed with a correctly recomputed distinct ID and repaired candidate commitments. The recipe negative preserves the genuine seed/root witness and uses a nonmember substitute ID. Source and allocation authority stay unchanged.
- **R2 — fixed (`e4880006e5d2fc8a94997fd355f3e7cd13b61e66`).** Every family has its own `matched_count` guard and successful inclusive-resume positive. Its completely covered source has one exact matching M followed by genuine unrelated U. Resume revalidates/skips already-counted M, examines U and publishes cursor U with `matched_count=1`. The count-only negative proposes 2, repairing candidate-dependent copies and commitments while preserving real source/classification, coverage, genuine cursor/token/live snapshot, predecessor revision/hash and whole-root CAS. Generation-node count is a separate invariant.
- **Retention — preserved.** All 34 pending cells and their exact questions above are unchanged. `forge.review.approved` retains its existing Approval-class binding. The retention pass maps the pending rows; this fix selects no lifetime, timestamp, population or bucket.
- **Regrade — carried.** All 35 families were regraded across all twelve criteria with current exact owner quotes and content hashes. Before and after: membership ABSENT 35, normative PASS 316, PARTIAL 69 (34 retention and 35 oracle cells). Zero rubric-status changes. New owner evidence supports criterion 10; criterion 12 stays PARTIAL because this is a plan only.
- **Scope — bounded.** Only `Plans/storage-plan.md` owner prose changes. Its own 92 shard/index/manifest files and the six standard PlanUnit index artifacts were regenerated. No other owner document or its shards changed. No schema, Storage value row, family registry, Decision Log, checker, test, governance lock or admission changed. No IDs were minted; FGI/CV/SP-1200..1234 and ATS-1200 remain the used set. No number/timestamp implementation, oracle code, proof machinery, pm-mail, subagent or main push.

### Per-family owner-text changes

Every row has both fixes. Line ranges below refer to `e4880006e5d2fc8a94997fd355f3e7cd13b61e66`; the exact revised guard paths/ranges are also in `p1fix1/responses-coverage.json`.

| Family | Storage unit | R1 owner range in `Plans/storage-plan.md` | R2 owner range in `Plans/storage-plan.md` |
|---|---|---|---|
| `forge.api.compatibility_changed` | `SP-1200` | 29598–29614 | 29550–29556 |
| `forge.connection.capabilities_changed` | `SP-1201` | 29783–29799 | 29735–29741 |
| `forge.connection.reauthorized` | `SP-1202` | 29967–29983 | 29919–29925 |
| `forge.connection.validated` | `SP-1203` | 30149–30165 | 30101–30107 |
| `forge.mirror.connected` | `SP-1204` | 30331–30347 | 30283–30289 |
| `forge.mirror.degraded` | `SP-1205` | 30513–30529 | 30465–30471 |
| `forge.mirror.detached` | `SP-1206` | 30695–30711 | 30647–30653 |
| `forge.mirror.status_changed` | `SP-1207` | 30878–30894 | 30830–30836 |
| `forge.mirror.sync_completed` | `SP-1208` | 31061–31077 | 31013–31019 |
| `forge.mirror.sync_started` | `SP-1209` | 31243–31259 | 31195–31201 |
| `forge.pipeline.cancelled` | `SP-1210` | 31425–31441 | 31377–31383 |
| `forge.pipeline.completed` | `SP-1211` | 31607–31623 | 31559–31565 |
| `forge.pipeline.retried` | `SP-1212` | 31789–31805 | 31741–31747 |
| `forge.pipeline.started` | `SP-1213` | 31971–31987 | 31923–31929 |
| `forge.repository.authority_changed` | `SP-1214` | 32155–32171 | 32107–32113 |
| `forge.repository.created` | `SP-1215` | 32337–32353 | 32289–32295 |
| `forge.repository.discovered` | `SP-1216` | 32520–32536 | 32472–32478 |
| `forge.repository.eligibility_changed` | `SP-1217` | 32706–32722 | 32658–32664 |
| `forge.review.approved` | `SP-1218` | 32888–32904 | 32840–32846 |
| `forge.review.changes_requested` | `SP-1219` | 33084–33100 | 33036–33042 |
| `forge.review.closed` | `SP-1220` | 33277–33293 | 33229–33235 |
| `forge.review.created` | `SP-1221` | 33459–33475 | 33411–33417 |
| `forge.review.marked_ready` | `SP-1222` | 33641–33657 | 33593–33599 |
| `forge.review.merged` | `SP-1223` | 33823–33839 | 33775–33781 |
| `forge.review.reopened` | `SP-1224` | 34005–34021 | 33957–33963 |
| `forge.review.thread.reopened` | `SP-1225` | 34188–34204 | 34140–34146 |
| `forge.review.thread.replied` | `SP-1226` | 34371–34387 | 34323–34329 |
| `forge.review.thread.resolved` | `SP-1227` | 34554–34570 | 34506–34512 |
| `forge.review.updated` | `SP-1228` | 34736–34752 | 34688–34694 |
| `forge.review.version_created` | `SP-1229` | 34919–34935 | 34871–34877 |
| `forge.webhook.delivery_failed` | `SP-1230` | 35103–35119 | 35055–35061 |
| `forge.webhook.delivery_recovered` | `SP-1231` | 35288–35304 | 35240–35246 |
| `forge.webhook.received` | `SP-1232` | 35470–35486 | 35422–35428 |
| `forge.webhook.redelivery_queued` | `SP-1233` | 35654–35670 | 35606–35612 |
| `forge.webhook.rejected` | `SP-1234` | 35836–35852 | 35788–35794 |

### Guard-isolation accounting (plan only)

Execution is **NOT_RUN_PHASE_2** for the entire lane. The 3,272 rows are construction plans, not 3,272 executed proofs. Phase 2 adopts the reviewed shared number/format helper and `pm_guard_isolation.py`, inventories each field/predicate enforcement site, and proves every lane guard with all unrelated predicates enabled. Repeated sites may be grouped only for the same field and predicate. No proof-machinery sweep exemption is used to excuse R1 or R2.

| Predicate in every family plan | Planned negative that must flip when only that predicate is weakened | Independent predicates that remain enabled | Executed proof |
|---|---|---|---|
| `generation.node_membership` | Verbatim authentic retired B repeated in A,B,B | Genuine seed/root issuance, correct ID recipes, sole selected current A, three-node bound, lifecycle and source/token facts | NOT_RUN; phase 2 |
| `generation.seed_issuance` | Unique unissued seed with correct distinct recomputed ID | ID membership, ID recipe, selector, lifecycle, source/token and predecessor CAS | NOT_RUN; phase 2 |
| `generation.generation_recipe` | Nonmember substituted ID with genuine original seed/root issuance and repaired references | Original allocation provenance, membership, selector/current, source/token and CAS | NOT_RUN; phase 2 |
| `matched_count` | Count 2 instead of 1 over fully covered M,U; all dependent candidate commitments repaired | Coverage, genuine cursor/token/live source, predecessor revision/hash CAS, generation and lifecycle predicates | NOT_RUN; phase 2 |
| Derived distinct seeds | No independent negative: correct recipe plus unique ID membership entails this fact | No multi-predicate cut or false duplicate set is introduced | Entailment documented; no runtime claim |
| All other lane guards | Original guard constructions retained; phase 2 expands each compound description into primitive cases | Every unrelated predicate and all actual authority remain enabled | NOT_RUN; phase 2 |

No native mutation or check-11 weakening is claimed for any recurring defect class. The existing standing-check table remains the plan-level accounting for all classes 1..12 and 10a. Formats, number-domain and historical-recipe execution remain shared-foundation phase-2 work. Schema/type/ref probes below establish only their stated structural scope.

### Round-1 checks and exit codes

Checks and generators ran one at a time. Pre-worktree disk was 107 GB available; memory was 8 GB available. Every recorded check started at 8–13 GB available; no under-6 pause was needed. All 15 ignored currentness files were copied and SHA-256 verified before index generation. The final index validates with top-level `status=pass`; runtime certification remains `blocked_runtime_certification_incomplete`.

All command metadata and logs are under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/`. Full commands, exit codes, available memory, times and log hashes are in the corresponding `.result.json` files.

| Check / exact command | Exit | Log SHA-256 |
|---|---:|---|
| **shard-generate**: `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `984126b6be07784510fec816d860b321f52d68978b5b99e7a2bcd292d5a86aa3` |
| **index-generate**: `python3 scripts/pm-plan-index.py generate` | 0 | `46b15ed0d61ddffe24ae5ad1a2df4fd7cd90a867b4f3a7aa908b61152bac1fba` |
| **responses-coverage**: `python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/check_responses.py` | 0 | `397ab1640b3f59736a78f9c79315f95cbe1da3de6a87cc38209e610e52d978f8` |
| **structure**: `python3 /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/check_structure.py` | 0 | `286e083d4b24b5cdac77ab086c59222ddf8c2615e7832b8c1b753673faf5a13f` |
| **forge-followup**: `python3 scripts/pm_forge_command_followup.py` | 0 | `e463c160e5a0d22ffe74113ba42849669ee0322fc8c584170363f791b6dbd485` |
| **forge-packet-tests**: `python3 -m unittest discover -s tests -p test_pm_forge_packet_semantics.py -v` | 0 | `6cf4ee4113c8ab305cc181f3af8d68bc683b13971fbe1cd16133f8b5c609821f` |
| **storage-recovery**: `python3 scripts/pm-storage-recovery-contracts.py --self-test` | 0 | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| **shard-check**: `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `7e9b336abf34b1be511ab317aac1456585f14badaad7a90773a08a6e9d171835` |
| **index-validate**: `python3 scripts/pm-plan-index.py validate` | 0 | `70e886ba143545d62f767eb4113d489d3e1ff5ed942846d2f5213af37ce29270` |

`responses-coverage` statically checks every revised owner unit, both replacement R1 negatives, the refined recipe negative, every R2 count/resume pair, preservation of all other guard rows, the 34 original retention questions, all 420 self-grade cells, exact quotes/content pins, unchanged non-lane text and protected files. This is document QA, not an event oracle. The structural check covers 35 closed payloads, 70 Storage rows, 106 schema documents, 573 eagerly resolved reference sites, 35 schema positives and 1,331 schema negatives. Existing Forge packet tests: 17 passed. Existing Storage recovery self-test: 22 checks passed. `git diff --check`: exit 0. These existing suites do not certify the new lifecycle oracles.

| Diagnostic | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/responses-coverage.json` | `397ab1640b3f59736a78f9c79315f95cbe1da3de6a87cc38209e610e52d978f8` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/derived-scope.json` | `c3a5aced45ea555c7f22f4cda159fa1cf128fb6f870fdee26185ef289d97eac9` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/currentness-copy.json` | `044c5dff7d5239bd1daadf0be7fdf65f457da8866de3c1fee06067533212242c` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/check_responses.py` | `1d7dcc7e1983f8c9b2fcb850dec79d7a3006dce03d816cbebca97860afafd86a` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/check_structure.py` | `b37947d17c4edda32c504aa34325cad808ab5469c7418c7a651957c8c6443af0` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/W3A/p1fix1/run_check.py` | `08dbd769e7d67adec0164aabd791610e4f0c137745ed914defe83cce51e79b7b` |

**Stopped:** none. No disputed findings and no new DL-045 question. Remaining work is the unchanged retention pass, independent phase-1 re-review, and phase-2 oracle implementation/proof after the reviewed foundations. Governance staleness remains for the separately assigned reseal; no reseal was attempted.

## Wave 3 phase 2: findings and responses

**Branch** `plans/ea-w3-forge-20261105`, phase-1 head `1e57a68b0a`. **Merges:** the gated guard tool `004bdedd63` as `af5efa3c81` (its 11 files only) and the gated NUMRULE head `58c2816ff3` as `19d337b52f` (conflicts only in `Plans/_shards/**` and `Plans/.plan_index/**`, regenerated; every NUMRULE and guard-tool file is byte-identical to its gated commit). No rebase, no `main` push, no admission, no registry append, no Decision Log entry. Native execution NOT_RUN throughout.

### What phase 2 adds

| Path | What it is |
|---|---|
| `scripts/pm_w3a_forge_events.py` | Complete checker: builds each family world (native owner authority, capture, payload, EventRecord, SP-337 pending pack, source row, SP-286/CV-339 custody, checkpoint root with three generations, durable/live token, canonical source log, sealed SP-1101 receipts) and runs the append, settle, retry, publish, stage, read, replay and withdraw paths. It derives one observation per row and refuses only through the generated tables. |
| `scripts/pm_w3a_forge_spec.py` | The 35 families, read from `W3A-contracts.json` and each closed payload schema; the three FGI conjuncts per family as exact-type predicates over the native result; the retention bindings. |
| `scripts/pm_w3a_forge_rows.py`, `scripts/pm-w3a-table-generate.py`, `scripts/pm_w3a_forge_table_*.py` | Row inventory and generator; 592 tables, 2,101 rows (194 shared rows applied to every family, 1,907 family rows: one payload table per payload member, source/conjunct tables per family). At most four rows per table, because the gated tool's cost grows with rows times cases. `--check` confirms the modules are current. |
| `scripts/pm_w3a_guard_suites.py`, `scripts/pm_w3a_guard_lean.py`, `scripts/pm-w3a-guard-tables.py` | Witness collection, lean per-table suites and the driver: collect once, then lean worker processes import only the engine and their tables and call `g.run`. Credit is copied from each table's own tool report. |
| `scripts/pm-w3a-number-corpus.py` | The shared number corpus through W3A's integer slots and complete paths. |
| `reports/event-authority-20261105/W3A-phase2-guard-map.json` | Every one of the 3,272 plan guards in `W3A-oracle-plan.json` mapped to the rows that realize it (3,272 realized, 0 unrealized). |

### Items

| # | Item | Outcome | Commit, location | How to verify |
|---:|---|---|---|---|
| 1 | Guard tables (step 1) | Done: 592 tables, 2,101 rows; 2,100 proved; 1 entailed row alone in its own table with its proof | `e681f236ab`, `af7e60d919`, `a84e8ecb91`; `scripts/pm_w3a_forge_rows.py:1`, `scripts/pm_w3a_forge_events.py:1146` (refusal only through table rows), `:1164` | `python3 scripts/pm-w3a-table-generate.py --check`; `python3 scripts/pm-w3a-guard-tables.py --collect S`, `--run S --out D`, `--summary D` |
| 2 | Numbers (step 2) | Done: shared calls at every integer slot; corpus 140/140 and 1,624/1,624; self-test pass; no 4,400-digit crash | `e681f236ab`, `bf0f3d73db`; `scripts/pm_w3a_forge_events.py:138` (`uint64_ok`), `:558`, `:745`, `:825`; `scripts/pm-w3a-number-corpus.py` | `python3 scripts/pm-w3a-number-corpus.py`; `python3 scripts/pm_event_numbers.py --self-test --scope numbers` |
| 3 | Timestamps (step 3) | Done: every W3A timestamp field through CV-1101 `date_time` with its owner profile; inventory gate recorded (lane drift only) | `e681f236ab`; `scripts/pm_w3a_forge_events.py:142` (`clock_ok`), `:558`, `:745`, `:825` | `python3 scripts/pm_w3a_forge_events.py`; `python3 scripts/pm_event_datetime_inventory.py` (recorded failure rows) |
| 4 | Retained reads (step 4) | Done from the start: recipe only from the one sealed per-original receipt; missing, ambiguous and other-original negatives; no receipt created while reading | `e681f236ab`, `bf0f3d73db`; `scripts/pm_w3a_forge_events.py:1003` (`SealedOwner`), `:1024`, `:1051`; `Plans/storage-plan.md:29694` (SP-1200 paragraph, one per SP-12xx) | HI01-HI07 negatives in the complete checker; dispatcher agreement on every read world |
| 5 | Retention (step 5) | Done: 34 cells bound (DL-453 15, DL-454 14, DL-455 5); review.approved unchanged; none pending | `bf0f3d73db`; `Plans/Forge_Integrations.md:741` (FGI-1200, one per FGI-12xx), `reports/event-authority-20261105/W3A-contracts.json` | Compare each name with main `a27594279e` `Plans/storage-plan.md:17644-17690` |
| 6 | Carried items (step 6) | None listed for W3A; the review's phase-2 notes are closed (below) | - | `reviews/W3A-sol/REVIEW-phase1-recheck.md` |
| 7 | Standing check 5 in the lane schema | Fixed: ten `^...$` patterns in `DurableGenericToken` accepted a trailing LF; now `(?![\s\S])`, with two CP01 negatives | `9821d74155`; `Plans/forge_event_storage_contracts.schema.json` | `trailing LF on a durable token hash` negatives refuse at CP01 |
| 8 | Standing check 8 | Added: the oracle flags an accepted negative, a refused positive and a wrong row | `9821d74155`; `scripts/pm_w3a_forge_events.py:1662` | `oracle_self_check: true` in the checker output |
| 9 | ATS-1200 preserved tokens | Fixed: `projector_replay_only`, `SP-286` and `SP-278` were preserved tokens absent from its text (pre-existing); the phase-2 paragraph now carries them | `bf0f3d73db`; `Plans/Automated_Testing_System.md:7263` | Every preserved token of FGI/CV/SP-1200..1234 and ATS-1200 occurs in its own unit text |
| 10 | Re-grade (step 7) | Done: retention 34 PARTIAL to PASS, criterion 12 35 PARTIAL to PASS; every quote re-checked | report commit; `reports/event-authority-20261105/W3A-self-grade.json` | Each evidence quote occurs at its line |

### Complete checker

`python3 scripts/pm_w3a_forge_events.py --json <out>` exit 0, status `pass`: 35 families x two scopes, **980 positives** accepted and **21,829 negatives** refused at exactly their expected table, row and code. 21,409 negatives fail only their own row in their whole phase observation; 420 are labelled multi-defect (wrong-type and out-of-range number forms, an absent member, 4,400-digit integers) and refuse first at the earlier schema row their label names. Every reachable row of every table on each family's paths has a single-defect witness in that family (240 to 258 rows per family). Every `$ref` in the lane schemas resolves eagerly (0 unresolved). The oracle self-check (standing check 8) flags an accepted negative, a refused positive and a wrong refusing row. Run time 93 s at bf0f3d73db (first full run 1m33s at 9821d74155, same result).

Positive paths per family and scope: fresh append after a separate (synthetic) admission; broad `event_record` occurred time; settlement; restart after the receipt was issued (no second receipt); same-key retry with different Storage metadata; publication over a mixed scan whose final record is unrelated, with three protected generations; actual empty source; staging into a free slot; lawful cleanup of a retired node after 604,800 s; retained read; retained read after the live capability was revoked; retained `projector_replay_only` original (the same original is refused by AD03 on the current-writer path); replay with no effect; consumer withdrawal.

### Guard tables on the gated tool (`004bdedd63`)

Tool `scripts/pm_guard_isolation.py` SHA-256 `e8038992eabbe067c8bcba8d48824b97fbb6b5b7e69cbfe28a669f939a96c0b8` (byte-identical to `004bdedd63` and to `main`). Runs: `--max-rss 2048`, one lean process per batch of 20 tables, each under `MemoryMax=2G`, `MemorySwapMax=0`; the tool's memory gate paused below 12 GiB and resumed at 13 for the first 300 tables, then (after a restart that skipped finished tables) paused below 10 and resumed at 12, because other streams held the VM near 11 GiB.

| Result | Count |
|---|---:|
| Tables | 592 |
| Rows | 2,101 |
| Proved (credited by the tool) | 2,100 |
| Unproved | 1 |
| Tool status FAIL | 1 |
| Tool status PASS | 591 |
| Tool failure kinds | unproved_guards |
| Lane-matrix findings (a control refused or a negative failing more than its own row inside its table) | 0 |
| Masked negatives reported by the tool | 0 |
| Tool seconds (sum over tables) | 3337.2 |

**Unproved rows, each with its proof (each sits alone in its own table):**

- `pack_media_entailed/PM01_pack_media`: entailed, no single-defect input reaches it. The append path runs `source_row` before `pack` and `pack_media_entailed` (`scripts/pm_w3a_forge_rows.py:225`), and SR01 validates `pending_intent_ref` against `^pm-payload-ref:v1:blake3:[0-9a-f]{64}:[1-9][0-9]*:application/vnd.msgpack(?![\s\S])` (`Plans/forge_event_storage_contracts.schema.json:236` and `:263` for SP-1200; the same pattern in all 35 source definitions, 70 sites). Any ref reaching PM01 therefore ends in exactly `application/vnd.msgpack`; a null ref is refused first by PK01. The complete checker's `pack media json` negative refuses at SR01, as labelled.

**Cut results.** For every proved row the tool cut that row alone, ran every control and negative of its table, saw its own negatives flip to accepted and every other case keep its exact result, then restored the row and saw the baseline again, with matching guard-call traces (`noncausal_flip` and `guard_trace_changed` never occurred). Per-table reports (gzip) and `summary.json` are in the evidence folder with SHA-256 sums.

**What this proof covers, and what it does not.** As in DM's and DCH's accepted adoption, each predicate reads one observation the checker derives from the complete boundary input. The tool proves the table rows are independent and causal over those recorded observations; the derivation code is checked by the complete checker's own positives and single-defect negatives above, family by family, not by the tool. Cross-phase duplicates are defense in depth (for example a payload ref's grammar in the payload table and again in the source-row schema): the complete checker refuses at the first, and each table proves its own rows.

### Numbers (shared calls at every integer slot)

| Slot | Shared call | Row |
|---|---|---|
| EventRecord `sequence_id` (Storage-assigned) | `storage_uint64` | EN05; join to Storage's own record EN27 |
| EventRecord `producer_sequence_id` | `current_integer(minimum=0)` or null | EN06 |
| Producer projection | `producer_semantic_digest` (CV-317/CV-1100 route) | EN07, source digest SR06, custody digest RC06, retry RT05 |
| First receipt `sequence_id`, `segment_generation`, `byte_offset`, `durable_end_offset`, `manifest_generation` | `storage_uint64` | RC11-RC15 |
| Checkpoint node `publication_revision`, `matched_count`, cursor `sequence_id`, token `frontier_revision`, selection `selected_segment_generation`, `manifest_generation`, `recovery_epoch` | `storage_uint64` (every node) | CP05-CP11 |
| Cleanup elapsed seconds | `storage_uint64` | SL05 |
| SP-337 pack size token | `current_integer_token(minimum=1)` | PK03 |
| EventRecord value, pack bytes, full value | `storage_value_bytes(EVENT_VALUE)`, `decode_storage_value`, `full_value_commitment` | PK05, RC08, cursor value hash SC04 |
| Generation id, root value hash | `storage_value_bytes(INDEX_BINDING)` (SP-278 codec) | GN06, CS03/CS04, CP14 |
| Retained originals | `RetainedDispatcher`, `OriginalBinding`, `OriginalCustody`, `RecipeTuple`, `FrozenRecipe` | HI01-HI05 (cross-checked against the dispatcher on every read) |

- **Shared corpus through the complete checker:** `python3 scripts/pm-w3a-number-corpus.py` exit 0, status `pass`. Part A: 140 corpus integer cases through the shared calls as W3A uses them, 140 agree, 0 disagree, 0 untracked. Part B: 1,624 routes (every corpus integer value plus a 4,400-digit integer and its negative, in seven W3A slots, both scopes, through the complete append, settle, publish and stage paths): 1,624 agree, 0 disagree, 0 untracked exceptions.
- **Self-test:** `python3 scripts/pm_event_numbers.py --self-test --scope numbers` exit 0, printed `"status": "pass"`.
- **4,400-digit integer (the crash DX, DS15, DF, DM and DCO found):** no crash on any path. A valid 4,400-digit `sequence_id` refuses at EN05 (`integer_range`); a valid 4,400-digit `producer_sequence_id` refuses at EN07 (`jcs_binary64`); in the first receipt it refuses at RC08 (no CV-339 preimage; RC11 also fails); as `matched_count` it refuses at CP01 (schema maximum; CP06 also fails). Each is a committed negative, and Part B places it in every slot. The checker renders integers exactly under `exact_integer_digits()` and never swallows an exception: a refusal is the shared `Refusal`, anything else propagates and fails the run.
- **Fixture expectations the shared rule changed:** none. W3A had no executed fixture before phase 2, so no recorded expectation existed to change. Where the shared rule decides a refusal, the refusing row and reason are: `7.0` and `True` at a uint64 slot `integer_type` (EN05/RC11/CP05-CP11/SL05; `True` also fails the schema first); `2^64` and the 4,400-digit integer `integer_range` (EN05); `3.0` producer sequence `integer_type` (EN06); `-1` producer sequence `integer_range` (EN01 first); `2^53+1` and 4,400 digits `jcs_binary64`, `2^60` `jcs_decimal` (EN07); pack size off by one (PK03).

### Timestamps (CV-1101 `date_time`, owner profile per field)

| Field | Owner | Profile | Row |
|---|---|---|---|
| EventRecord `occurred_at_utc` | EventRecord / CV-317 (from the original source) | `event_record` (broad: offsets, lowercase, any fraction) | EN02; join EN17 |
| EventRecord `observed_at_utc` | Storage (CV-253) | `storage_utc_z` | EN03; join EN28 |
| EventRecord `persisted_at_utc` | Storage (CV-253) | `storage_utc_z` | EN04; join EN29 |
| First receipt `acknowledged_at_utc` | Storage (SP-286/SP-347) | `storage_utc_z` | RC16 |
| Checkpoint node `activated_at_utc` | Storage (refs EventRecord `persisted_at_utc`) | `storage_utc_z` | CP12; anchor GN11 |
| Checkpoint node `retired_at_utc` | Storage (refs EventRecord `persisted_at_utc`) | `storage_utc_z` | CP13; anchor GN10 |

W3A payloads and source rows carry no timestamp. The envelope schema is validated without a format checker and each timestamp has its own row, so the profile is enforced exactly once and never by an unenforced `format`. Negatives per field: missing zone, hour 24, trailing LF, February 30, space separator and a non-leap 60th second (occurred); `+00:00`, lowercase `z`, `-00:00` and a nonzero offset (Storage fields). The timestamp review is **no longer interim** for these fields: the shared `date_time` predicate checks each with the named profile.

**Inventory gate in this lane tree** (Addendum 2): `python3 scripts/pm_event_datetime_inventory.py` exit 1: fails closed on lane-tree drift only: 187 rows (110 `unreadable_mentioning_container`, 72 `unclassified_mentioning_container`, 5 `stale_scan_exclusion`) in `Plans/_shards/**`, `Plans/.plan_index/**`, `Plans/.plan_migration/**`, `Plans/Contracts_V0.md` and the ignored currentness copy; 233 nodes, **0 unclassified nodes, no row in a W3A or Forge file**. As Addendum 2 directs, `datetime_validator` and the gate are not used here and the NUMRULE inventory and exclusions files are not edited; they run at batch-3 integration, where the two new W3A Storage timestamp nodes per family (`activated_at_utc`, `retired_at_utc` in `Plans/forge_event_storage_contracts.schema.json`) need classification under CV-1101. The combined self-test (`pm_event_numbers.py --self-test`, scope all) refuses before any case (`case_execution: NOT_RUN_ADMISSION_REFUSED`, exit 1) because the inventory is stale in this tree, as Addendum 2 states.

### Retained reads (built as batch 2 fix 1 requires)

- **Selection only from the sealed receipt:** `SealedOwner.authenticated_original` returns custody only from the one receipt Storage sealed for that exact original ref; it has no default recipe, does not recognise a Store, and does not read identifiers the recipes share. The read rows HI01-HI05 judge presence, uniqueness, binding, installed recipe and frozen verification; the shared `RetainedDispatcher` runs on every read world and must agree with them (it did on every case).
- **Missing or ambiguous:** no receipt or one bound to another original refuses `original_unavailable` (HI01, HI03); two refuse `recipe_unsupported` (HI02); an unknown recipe tuple `recipe_unsupported` (HI04). The stored bytes stay untouched (HI06), and a reader that seals a receipt while reading refuses (HI07).
- **New writes stay separate:** the append path never reads a receipt; current-writer admission (AD01-AD09) never runs on a retained original, so a retained `projector_replay_only` original and an original read after the live capability was revoked are both accepted.
- **Owner text:** each SP-1200..1234 now carries a "Retained reads (SP-1101)" paragraph stating this rule, and depends on SP-1101.

### Retention cells

| Decision | Families | Project | Application | Anchor |
|---|---:|---|---|---|
| DL-453 (E-CARDS-3 1.a) | 15 | `RP-AUTHORITY-INDEFINITE@1.0.0` | same, no new count allowance | none |
| DL-454 (E-CARDS-3 2.a) | 14 | `RP-TELEMETRY-90D@1.0.0` | `RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0` (`app:routine_observation`) | first save that survives a restart (DL-415), 7,776,000 s |
| DL-455 (E-CARDS-3 3.a) | 5 | `RP-OPERATIONAL-2555D@1.0.0` with Storage's Project first-save anchor adapter | `RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0` (`app:operational_security`) | 220,752,000 s; start (`pipeline.started`), finish (`pipeline.cancelled`, `pipeline.completed`), retry (`pipeline.retried`), change (`connection.reauthorized`) |
| Case L-3 Approval class (phase 1; E-CARDS-3 Appendix B settled) | 1 (`review.approved`) | `RP-AUTHORITY-INDEFINITE@1.0.0` | same | none |

Every name is listed by exact spelling in the landed Storage text at `main` `a27594279e`, `Plans/storage-plan.md:17644-17690` ("Third-sitting retention assignments (DL-453 through DL-464)"); the two application policy objects are `Plans/storage_value_registry.json:686` and `:702` there. Those passages and objects are on `main`, not yet on this branch; batch-3 integration brings them together. **No cell stays `PENDING_RETENTION_DECISION`; no question for Jared.** Each FGI-12xx retention paragraph, its preserved token and `W3A-contracts.json` now carry the binding; source rows and checkpoints keep their SP-bound policies.

### Carried items

The latest review (`reviews/W3A-sol/REVIEW-phase1-recheck.md`, LANDING_READY_WITH_NOTES, no blocking findings) lists only phase-2 work, now done: adopt the number and date-time helpers and the guard tool (above); implement and prove the per-family cases including the R1 constructions (GN02 A,B,B membership; GN07 unissued staged seed U; GN06 substituted id X with the selector repaired; GN03 nonmember selector) and the R2 count-only case (SC05 `matched_count` 2 against an inclusive resume that publishes 1 over M then unrelated U); preserve authenticated historical recipes and the current-writer replay-only refusal (HI rows, AD03, RT01); complete the separate retention pass (above). W3-P2 names no extra item for W3A.

### Grades

Before (phase-1 fix 1): ABSENT 35, PASS 316, PARTIAL 69 (34 retention, 35 criterion 12). After: ABSENT 35, PASS 385, PARTIAL 0. Retention moved PARTIAL to PASS in 34 families; criterion 12 moved PARTIAL to PASS in all 35 (executed static oracles with a single-defect witness for every reachable row in every family and 2,100 of 2,101 rows proved by the gated tool; native execution NOT_RUN, as DM and DCH grade the same level). Membership stays ABSENT (no admission). Every other cell is carried; its quote was re-checked at its current line (456 quotes relocated and re-checked, 0 missing; 70 new retention quotes and 35 new criterion-12 quotes checked at their lines).

### Checks

- `python3 scripts/pm_w3a_forge_events.py --json` at `bf0f3d73db`: exit 0, status pass (numbers above).
- `python3 scripts/pm-w3a-table-generate.py --check`: exit 0, 592 tables, 2,101 rows, none stale.
- `pm-w3a-guard-tables.py --run` then `--summary`: 591 tables PASS, 1 FAIL (`unproved_guards`, the entailed table only); summary exit 1 for that reason only.
- `python3 scripts/pm-w3a-number-corpus.py`: exit 0, pass. `python3 scripts/pm_event_numbers.py --self-test --scope numbers`: exit 0, `"status": "pass"`.
- `python3 scripts/pm_event_datetime_inventory.py`: exit 1, lane-tree drift only (above). `python3 scripts/pm_event_numbers.py --self-test` (all): exit 1, refused before any case.
- `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`: exit 0, pass, 99 sources. Regeneration changed only `Plans/_shards/storage-plan/**`, `Plans/_shards/automated_testing_system/**` and the index (Forge_Integrations is not sharded; Contracts_V0 was not edited).
- `python3 scripts/pm-plan-index.py validate` at `origin/main` `f8b2098608`: exit 1 with 760 rows, all for units `main` gained after this unrebased branch's base (739 `plan_unit_removed_without_ledger_decision`, 21 `plan_unit_removal_ledger_invalid` in old ledgers). None names a W3A unit; none of the 739 existed at the phase-1 head; this branch lost no unit since then and gained only CV-1100/1101 and SP-1100/1101 from the NUMRULE merge. Batch-3 integration rebases the lane.
- Every `$ref` in the lane schemas resolves (0 unresolved). The currentness edition was copied in before `pm-plan-index.py generate` (tree SHA-256 `69e5e402...`, identical to the shared checkout).
- Memory: heavy runs ran under `MemoryMax=2G`, `MemorySwapMax=0` and started at 12 GiB or more available, except one: the final 93-second checker rerun started at 8 GiB available. The guard driver paused itself while other streams held memory.

### Stopped for Jared

None. The retention cells are decided by landed decisions; nothing here needs a DL-045 choice.

