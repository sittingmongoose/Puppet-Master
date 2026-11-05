# DG6B — review round 6, prepared without admission

Branch: `plans/ea-w2-plugins-personas-github-20261104`. Input: `b4383ad4a6ffcd9086576962db0e75972e5e8f6c`. Fixed contract commit: **`2cf358d37ec169577926c8638b1ed8eed8337206`**. This is the second and last technical round after the extra round. Native execution: **NOT_RUN**.

B1, B2, B3, S1 and S2 are fixed. Every family changes **5 PASS / 6 PARTIAL / 1 ABSENT → 10 PASS / 1 PARTIAL / 1 ABSENT** against Astra 3, restoring C5, C6, C8, C11 and C12: **95 PASS / 114 PARTIAL / 19 ABSENT → 190 PASS / 19 PARTIAL / 19 ABSENT**, zero CONFLICT. Prepared gate: **0/19 → 19/19**. Membership remains ABSENT; retention remains PARTIAL / PENDING_RETENTION_DECISION; disposition remains UNDISPOSITIONED.

## Review round 6: findings and responses

| Finding | Location, cause and fix | Verification |
|---|---|---|
| **B1 — fixed (`2cf358d37ec169577926c8638b1ed8eed8337206`)** | `scripts/pm-dg6b-event-contracts.py:721` and `:19`. Only the supplied source copy was schema-checked; Python equality admitted bool/int and integer/float aliases in the actual inline body. Both actual inline and source payloads now pass their exact-type schemas. Custody and retry comparison use canonical typed bytes. Helpers validate types before values. Storage sequence/time stay outside caller semantics. | All 19 have exact Python-equal integer→boolean envelope/history vectors, including a separately valid revision-1 deletion; decimal/exponent/string/null/array/object cases refuse. 100,840 type mutations and all CLI controls pass. |
| **B2 — fixed (`2cf358d37ec169577926c8638b1ed8eed8337206`)** | `scripts/pm-dg6b-event-contracts.py:34`, `:255`, `:694`. Truthiness treated string `false` as a grant. Closed record/source/history/Storage/payload-store adapters check every boolean's exact JSON type first; explicit true grants and explicit false clears negative fences. This includes every Persona flag, even where a specific operation does not use it. | String booleans/string numbers, integers, null, arrays and nested objects refuse. Fourteen named type/grant duplicate sets pass the whole 6,606-negative matrix. |
| **B3 — fixed (`2cf358d37ec169577926c8638b1ed8eed8337206`)** | `Plans/dg6b_event_contract_fixtures.json`: `invalid[6]` for all six Personas now starts from a valid Project-home payload; selected `invalid[23]` starts from a valid actual thread override. Exactly the forbidden enum changes. The extra `coherent_retired_tier` stage had the same mask and is also rebuilt. `scripts/pm-dg6b-guard-proof.py:355` removes actual keywords, retaining unrelated fields and rules. | Eight earlier enum negatives rebuilt; individual keyword/explicit duplicate sets all flip correctly. No schema validator is erased wholesale. |
| **S1 — fixed (`2cf358d37ec169577926c8638b1ed8eed8337206`)** | [DG6B.authority-audit.json](DG6B.authority-audit.json) restores the whole-branch inventory: every family's existing-contract search, exact matching lines/hashes, negative evidence, reused definitions, new contracts, 26 IDs and DL-045/DL-076 premise/application pairs. Repair history remains separately pinned. | All nineteen names remain in DL-045; recursive live-canon search finds no additional nested binding. Later upstream maintenance changes no consumed selected definition or behavior; its details are recorded in the audit. |
| **S2 — fixed (`2cf358d37ec169577926c8638b1ed8eed8337206`)** | `Plans/Contracts_V0.md:24554`, `Plans/Personas.md:3988`, `Plans/storage-plan.md:29963`; `scripts/pm-dg6b-event-contracts.py:481`. The separate resolution previously had only logical shape validation. Its existing owner-result custody now carries the closed bounded physical value, with SP-337 externalization above 16,384 encoded bytes. | Separate resolution, event body and complete operation are measured independently. Inline 16,383/16,384 pass; inline 16,385 and 20,579 refuse; authenticated references pass. Append, metadata-only retry, retained history and recovery verify the physical path, hash/size/media/bytes, canonical decode and original-source agreement. |

No finding is disputed or stopped for Jared. No feature, owner, retention or deletion choice is made.

## S2: complete encoded stored parts

| Resolution logical bytes | Resolution physical bytes | Event logical body bytes | Operation logical bytes | Operation physical bytes |
|---:|---:|---:|---:|---:|
| 16,383 | 16,383 | 17,125 | 17,647 | 241 |
| 16,384 | 16,384 | 17,126 | 17,648 | 241 |
| 16,385 | 200 | 17,127 | 17,649 | 241 |
| 20,579 | 200 | 21,321 | 21,843 | 241 |

The logical event bodies in this table are externalized independently; the event carries an empty inline object plus its authenticated SP-337 reference. The operation and resolution each choose their own complete-value route. Encoded bytes include MessagePack headers and UTF-8, not character counts.

## Whole-branch authority inventory

The committed audit is SHA-256 `ecbbf476bde5d41437637cfd526549ffbaa29cdb140eceb7bff7196b4faf4038`. Search base: `c76d1cf756d504a91655a978dcee9f3ead7562d3`. Scope: every live Plans Markdown/JSON/JSONL/YAML owner and nested source-contract package; exclude generated shards/index, migration, ledgers and audit/evidence governance. Exact-family searches and behavior-specific owner/command/schema searches are independent per family. Registry exact rows and pre-existing closed exact-family event definitions are zero for all nineteen within this scope. Existing command results, typed plugin receipts, OAuth behavior, first-AppendReceipt and generic index/token definitions are reused.

Each row below is a **newly authored owner contract**, prepared without admission. Exact operation/event identity and CV-366 application keys are recorded per family in the audit and its own SP subsection. Project keys retain the individual family digest recipe. Every consumer is a read-through history consumer; it adopts SP-278's `projector.storage.event_record_index@1.0.0` and nine-field durable token, owns no separate projection/checkpoint, and adopts SP-286/CV-339 first receipt plus SP-336 barriers.

| Family | New semantic / Storage owner | Existing behavior citation; exact-family search hits | New consumer |
|---|---|---|---|
| `auth.github.authenticated` | `GAAAF-077` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:70`; 8 hits | `consumer.auth_github_authenticated.history@1.0.0` |
| `auth.github.device_code.issued` | `GAAAF-078` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:67`; 8 hits | `consumer.auth_github_device_code_issued.history@1.0.0` |
| `auth.github.disconnected` | `GAAAF-079` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:17`; 7 hits | `consumer.auth_github_disconnected.history@1.0.0` |
| `auth.github.failed` | `GAAAF-080` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:74`; 8 hits | `consumer.auth_github_failed.history@1.0.0` |
| `auth.github.token.polling` | `GAAAF-081` / `SP-670` | `Plans/GitHub_API_Auth_and_Flows.md:68`; 8 hits | `consumer.auth_github_token_polling.history@1.0.0` |
| `plugin.hook.blocked` | `PLUG-131` / `SP-671` | `Plans/Plugins_System.md:462`; 8 hits | `consumer.plugin_hook_blocked.history@1.0.0` |
| `plugin.hook.error` | `PLUG-132` / `SP-671` | `Plans/Plugins_System.md:461`; 4 hits | `consumer.plugin_hook_error.history@1.0.0` |
| `plugin.hook.invoked` | `PLUG-133` / `SP-671` | `Plans/Plugins_System.md:460`; 5 hits | `consumer.plugin_hook_invoked.history@1.0.0` |
| `plugin.load_failed` | `PLUG-134` / `SP-671` | `Plans/Plugins_System.md:459`; 7 hits | `consumer.plugin_load_failed.history@1.0.0` |
| `plugin.loaded` | `PLUG-135` / `SP-671` | `Plans/Plugins_System.md:458`; 5 hits | `consumer.plugin_loaded.history@1.0.0` |
| `plugin.permission.override` | `PLUG-136` / `SP-671` | `Plans/Plugins_System.md:243`; 9 hits | `consumer.plugin_permission_override.history@1.0.0` |
| `plugin.tool.collision` | `PLUG-137` / `SP-671` | `Plans/Plugins_System.md:465`; 4 hits | `consumer.plugin_tool_collision.history@1.0.0` |
| `plugin.tool.registered` | `PLUG-138` / `SP-671` | `Plans/Plugins_System.md:464`; 4 hits | `consumer.plugin_tool_registered.history@1.0.0` |
| `persona.created` | `P-120` / `SP-672` | `Plans/Personas.md:82`; 11 hits | `consumer.persona_created.history@1.0.0` |
| `persona.deleted` | `P-121` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_deleted.history@1.0.0` |
| `persona.exported` | `P-122` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_exported.history@1.0.0` |
| `persona.imported` | `P-123` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_imported.history@1.0.0` |
| `persona.selected` | `P-124` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_selected.history@1.0.0` |
| `persona.updated` | `P-125` / `SP-672` | `Plans/Personas.md:82`; 6 hits | `consumer.persona_updated.history@1.0.0` |

`persona.selected` additionally owns the logical `pm.persona.selected_resolution.v1` evidence and its new `persona_selected_resolution_storage` carrier through CV-691/P-124/SP-672. This reuses the existing owner-result custody and SP-337 transport; it adds no stored family. The shared selected command request/result/source graph is not restamped.

**Decision-premise pairs:** DL-045's exact scope (Decision_Log 585/590/591) still covers all nineteen names. Current OAuth/OS credential custody, typed plugin receipt/non-emission behavior, P-060's library/No-project/Project rules and Personas section 10 supply existing behavior; only missing technical bindings are authored. DL-076 (Decision_Log 1467–1500) is applied separately to every family's SP-278 read-through contract: persist the nine-field durable token and keep snapshot identity live-only. No old answer is used to choose a feature, owner or retention class.

During verification `origin/main` advanced to `bc399e19742ddc6afd1a1cb1d77a33845341d565`. DL-302 concerns Usage demo controls. Persona prose changes attribution/validation-surface labels; plugin prose changes validation labels. Shared-schema changes affect Persona save-as-override, MCP copy and skill copy wrappers; all DG6B-consumed command/request/result/WorkflowScope definitions are byte-equivalent. The audit records this later premise check; no premise failed.

**Whole-branch IDs:** GAAAF-077..081, PLUG-131..138, P-120..125, SP-670..672, CV-690..691, ATS-335..336 (**26**). **Minted this round: zero.** The audit preserves all original drafting/repair report commits and hashes; it does not confuse round-6 additions with the whole-branch inventory.

## Complete guard-removal table

The runtime matrix is **53 sets × 6,093 negatives = 322,929 direct evaluations**. The separate boolean matrix is **14 named duplicate sets × 6,606 negatives = 92,484 direct evaluations**. Both have zero unexpected flips/survivors, and a fresh restored full checker passes.

Schema proof is at the **actual failing validator boundary**: **392 sets / 446 exact keywords**, covering 4,137 schema negatives. It performs 39,426 changed-resource evaluations and 1,582,278 exact unchanged-resource checks. It retains all unrelated properties, constraints and branches. Duplicate sets name every same-field enforcement site (for example root/scope application-key patterns and maximum-length enforcement). Python construction aliases are broken through JSON copying so removing one flag type cannot remove another flag's guard. Complete-path rejection is checked before the boundary proof. No success or broad validator erasure is accepted as a negative oracle.

All source locations and exact flip selectors are in [DG6B.guard-removal-summary.json](DG6B.guard-removal-summary.json). The complete tables retain every full negative ID and exact stay complement:

| Complete table | SHA-256 |
|---|---|
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix6/guard-removal-final.json.gz` | `3caababb9272fc5a9fefafb7caa3f0fb13faf10079fa919ad402df2b8c7a0044` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix6/paired-proof.json.gz` | `d0d9fb1dcfe1de96d9e024f5db039c60484f4d806e06831e80114933ee6135b5` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix6/type-sweep.json.gz` | `b21d223514ba6a66925e37f54323abf06b1ea6654cd933e52e702a3942319045` |
| `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix6/representation-sweep.json.gz` | `60fdd71618f7c762e5769a38fe0f3c1044bc2dc9eaa0e75fb5967153148e9f2b` |

The following runtime rows name their target sets through the committed summary's selectors. The stay column is the exact complement in the 6,093-negative universe, checked for the same refusal. Separate line-targeted AST controls independently inventory all 64 refusal classifications and test repeated sites alone and as named sets. Schema dispatch roles use the keyword table above, not a whole-validator switch.

| Runtime guard / named invariant | Negatives that flip | Negatives that stay rejected |
|---|---:|---:|
| `access` | 25 | 6068 |
| `cadence` | 1 | 6092 |
| `cas` | 3 | 6090 |
| `checkpoint_storage_join` | 57 | 6036 |
| `confirmation` | 1 | 6092 |
| `creation_source` | 1 | 6092 |
| `current_writer_policy` | 38 | 6055 |
| `definition_writer` | 5 | 6088 |
| `duplicate_json_key` | 1 | 6092 |
| `envelope_source_join` | 76 | 6017 |
| `failure_error_reason` | 1 | 6092 |
| `failure_oracle` | 1 | 6092 |
| `fixture_family_coverage` | 19 | 6074 |
| `grade_family_coverage` | 19 | 6074 |
| `historical_access` | 76 | 6017 |
| `historical_provenance` | 114 | 5979 |
| `historical_storage_join` | 38 | 6055 |
| `historical_storage_record` | 57 | 6036 |
| `historical_storage_source` | 19 | 6074 |
| `historical_withdrawn` | 76 | 6017 |
| `home_scope` | 1 | 6092 |
| `idempotency_conflict` | 167 | 5926 |
| `idempotency_key` | 95 | 5998 |
| `identity` | 40 | 6053 |
| `inline_body_too_large` | 20 | 6073 |
| `invalid_json` | 1 | 6092 |
| `mirror` | 4 | 6089 |
| `observation_only_hook` | 2 | 6091 |
| `operation_schema_binding` | 19 | 6074 |
| `operation_source_join` | 38 | 6055 |
| `operation_value_too_large` | 21 | 6072 |
| `original_payload_conflict` | 13 | 6080 |
| `original_server_required` | 1 | 6092 |
| `original_source_join` | 91 | 6002 |
| `override_lineage` | 1 | 6092 |
| `partition` | 48 | 6045 |
| `payload_ref_integrity` | 346 | 5747 |
| `payload_ref_unavailable` | 196 | 5897 |
| `payload_transport_join` | 19 | 6074 |
| `prepared_membership` | 19 | 6074 |
| `protected` | 4 | 6089 |
| `reach` | 1 | 6092 |
| `resolution_source_join` | 2 | 6091 |
| `resolution_value_too_large` | 2 | 6091 |
| `retention_pending` | 19 | 6074 |
| `retry_identity` | 19 | 6074 |
| `scope` | 16 | 6077 |
| `source_trust` | 1 | 6092 |
| `unadmitted_disposition` | 19 | 6074 |
| `unknown_adapter_kind` | 1 | 6092 |
| `unknown_oracle_stage` | 1 | 6092 |
| `unresolved_schema_ref` | 57 | 6036 |
| `writer` | 44 | 6049 |

The following sets remove only the named boolean type keywords plus their matching explicit grant/negative-fence guard. Every pair is exercised against the entire 6,606-negative universe, including wrong-type Storage authentication and resolved-body flags. Other negative reasons remain unchanged.

| Value guard + exact duplicate schema type(s) | Flip | Stay |
|---|---:|---:|
| `writer` + `source.(writer_current).type` | 386 | 6220 |
| `access` + `source.(access_current).type` | 367 | 6239 |
| `definition_writer` + `source.(definition_writer_current).type` | 113 | 6493 |
| `protected` + `source.(protected_id).type` | 112 | 6494 |
| `mirror` + `source.(computer_mirror).type` | 112 | 6494 |
| `confirmation` + `source.(confirmation_current).type` | 109 | 6497 |
| `source_trust` + `source.(source_verified).type` | 109 | 6497 |
| `cas` + `source.(cas_current).type` | 111 | 6495 |
| `reach` + `source.(reach_allows_no_project).type` | 109 | 6497 |
| `historical_provenance` + `history.(retained, authentic, admitted_when_written).type` | 627 | 5979 |
| `historical_withdrawn` + `history.(reader_current, family_withdrawn).type` | 418 | 6188 |
| `historical_access` + `history.(access_current, body_deleted).type` | 418 | 6188 |
| `historical_storage_source` + `storage.(authenticated).type` | 190 | 6416 |
| `payload_ref_unavailable` + `resolved.(durable, access_current).type` | 538 | 6068 |

## Astra classes 1–11: all nineteen families

| Class | How the defect is ruled out |
|---|---|
| **1 Forged/contradictory inputs** | Recompute event identity, CV-366 keys, semantic digest and BLAKE3 from their actual sources. Typed source/receipt/body joins reject substitutions. Original owner authentication and full native commitment checks remain upstream obligations, not proven by fixture booleans. |
| **2 Storage metadata** | History compares independent complete canonical Storage bytes, UUID and partition. Sequence/observed/persisted substitutions reject; metadata-only retries preserve caller semantics. |
| **3 Historical readers** | Retained current/append-once/event-ID-dedupe/replay-only and normalized compatibility positives survive later live-state changes. At-write provenance and present reader/access/withdrawal/body fences remain independent. New large-resolution retained positives and access/durability/foreign-physical negatives cover its separate path. |
| **4 One field read two ways** | 100,840 wrong-type mutations across 10,300 field locations plus 9,937 whitespace/case/copy/retry probes pass. Source and actual inline bodies agree only by typed bytes; copied strings are neither trimmed nor case-folded. Encoded transport hex is decoded consistently to bytes before its hash/codec checks. UTC format additionally rejects basic, minute-only, week-date and comma-fraction spellings; duplicate JSON keys refuse. |
| **5 Dormant references** | All 408 references resolve eagerly. Every family retains dormant `$ref`/`$dynamicRef` controls, including unvisited branches. |
| **6 Partial size limits** | Measure all 91 actual operations and all 14 separate selection-resolution positives. Event body, entire logical/physical operation and entire logical/physical resolution are independent measurements. Large records use complete-value SP-337 references; each physical value stays at or below 16,384 encoded bytes. |
| **7 Custody on every path** | Append, full retry oracles, history and operation/resolution recovery reject missing/foreign source, receipt, identity, scope or body. The low-level retry comparator consumes an independently validated original; complete retry oracles validate both operands. |
| **8 Masked negatives** | Eight earlier enum negatives are rebuilt from the right positive. New byte-integrity controls preserve the logical record while changing its encoding; independent history byte copies track the actual candidate. Exact keyword, runtime and boolean-pair tables all pass. No unrelated guard is removed to force a flip. |
| **9 Overstated grades** | Every family receives the same five justified PARTIAL→PASS repairs with its own current owner citations. All 581 quotes/hashes check. Membership stays ABSENT, retention PARTIAL, native NOT_RUN. |
| **10 Numeric spellings** | Exact built-in integer domain is shared by all typed validators and the physical codec. `1.0`/`1e0`, boolean integers and string numbers reject before identity/encoding/comparison. `01` fails parsing. JSON `-0` normalizes to integer zero and one canonical byte representation; positive-revision fields reject zero. |
| **11 Type confusion** | Closed adapters and actual payload schemas qualify every read first; booleans use exact JSON boolean type and explicit true/false semantics. String booleans/numbers, null, integer flags, arrays and nested objects all refuse in otherwise valid complete inputs. The full CLI and the fourteen named duplicate sets prove the boundary. |

Own eleven-class probes: **3,171, zero failures**. Complete CLI: **191 processes** (one positive exits 0/pass; 190 injected malformed positives independently exit 1 with the exact expected refusal across all nineteen). No negative treats success exit 0 as refusal.

## Family grades before and after

P=PASS; p=PARTIAL; A=ABSENT. Before is Astra 3's independent grade, not the rejected self-grade.

| Family | Before | After | Prepared |
|---|---|---|---|
| `auth.github.authenticated` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `auth.github.device_code.issued` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `auth.github.disconnected` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `auth.github.failed` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `auth.github.token.polling` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.hook.blocked` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.hook.error` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.hook.invoked` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.load_failed` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.loaded` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.permission.override` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.tool.collision` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `plugin.tool.registered` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `persona.created` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `persona.deleted` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `persona.exported` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `persona.imported` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `persona.selected` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |
| `persona.updated` | 5 P / 6 p / 1 A | 10 P / 1 p / 1 A | PASS without admission |

## Preservation and verification

All earlier family bodies, original source/request/result data, valid variants, operation/history/retry cases and existing payload/operation schema definitions remain unchanged after removing only the new physical-resolution adapter fields for comparison. The only eight earlier negative replacements are the documented Persona enum controls. Both current-writer replay-policy predicates retain their original ASTs. Current source citations number 581 and resolve exactly.

| Command/check | Exit / result |
|---|---|
| `python3 scripts/pm-dg6b-event-contracts.py` | 0; 19 families, 408 resolved refs; restored full checker also passes |
| Complete runtime/schema guard proof | 0; zero unexpected flips/survivors |
| Boolean duplicate matrix | 0; 92,484 evaluations, zero unexpected results |
| Type / representation / independent-line / own eleven-class probes | 0 each; all required controls pass |
| Full CLI controls | 0 harness; 1 positive exit 0 and 190 required exact refusals exit 1 |
| Earlier-fix preservation / citations | 0; all earlier cases preserved except eight documented repairs; 581 exact citations |
| Projects refresh / GitHub integration / primary command catalog | 0 each; primary catalog has 19 tests |
| Shard generate / index generate / shard check | 0 each; shard changes are confined to Contracts_V0, Personas and storage-plan |
| Final `pm-plan-index.py validate` | 1; 22 unrelated origin/main drift failures, reproduced with the unchanged input-head unit set/files; coverage passes and all 7,447 lane-tree units remain |
| Storage profile checker | 1; exactly the same ordered 41 pre-existing errors as round 5 |
| Whitespace / scope audit | 0; no protected or unrelated files changed |

**Index integration item:** origin/main acquired DL-302 while this worker ran. The index check consequently treats this unchanged older branch's missing DL-302 as removal and opens 21 untouched legacy-ledger format errors. The exact 22 failures reproduce on the original 7,447-unit set and unchanged affected files. No lane unit was removed, no baseline was restamped, no validator was weakened and no unrelated file was repaired. Integration/rebase onto current main must retain its new unit. All nineteen family checks pass independently of this upstream drift.

Initial checks passed at 101 GB disk and 9 GiB available memory; later long-run checks stayed above the required limits. A sparse detached worktree was used. The fifteen ignored currentness-edition files were copied and SHA-256 matched before generation. No subagent, main push, landing lock, admission/registry append, Decision Log entry, governance reseal, Spec Lock/auto-decisions/frozen-validator edit or new test file was made. An initial inbox read preceded reading the fix brief; no mailbox registration, send or subsequent mailbox use occurred.

No product/retention question is open from these fixes. Integration retains admission/retention resolution and native implementation/evidence. The source/schema/type/custody prerequisites above do not authenticate actual frames, execute redb, install a native writer or grant readiness. Native remains NOT_RUN.

## Evidence and handoff

Evidence/reproduction directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DG6B/fix6/`. Compressed complete tables include decompressed SHA-256 values in the committed summary. Canonical checker/proof commands run from the fixed commit; extra exported probes specify their checkout root near the top. `preservation-citations.json`, `index-upstream-drift.json`, `upstream-premise-recheck.json`, `currentness-copy.json` and the byte measurements record the remaining boundaries. Report, self-grade, summary and authority audit are copied to the DG6B drafts root. The final evidence manifest pins every retained artifact by absolute path, bytes and SHA-256.
