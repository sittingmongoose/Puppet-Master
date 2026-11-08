# DCW — sweep part 2A and part 2B numbers

Branch `plans/ea-w2-chain-wizard-20261104`; implementation **`8ea0e8de8cc8ac473bb43157848468fe7fc49b88`**. Start `7847bbc409e875a9bfddb02309cb0638690f798b`; no rebase. Guard-tool merge **`47eb2aa6359cd413bc634ccdb2575277ff31ccf8`** takes exact gated `004bdedd632d9463f3535190a6ed5772338cdce1`. Number merge **`5c0d54188378581237327af9008b5b3f162f40b0`** takes exact gated `a16f67c1ef21796758f4209ff12c0f4d12b86ce9`, after that tool merge. Generated merge conflicts were regenerated. Neither gated tool's files were edited.

All eight families remain **8 PASS / 3 PARTIAL / 1 ABSENT**. Named phase proofs earn the bounded credit below. Complete check 11 and individual schema-keyword isolation remain unproved (fix 1 below raises named phase proofs to 379 of 393; see "Sweep part 2A fix 1: missing witnesses"). Timestamp review is **interim only**; no date-time helper, validator or inventory gate was adopted. Native authority remains **NOT_RUN**. No prepared PASS, admission or new PlanUnit ID.

## Sweep part 2A: findings and responses

Source citations use delivered implementation tree `8ea0e8de8cc8ac473bb43157848468fe7fc49b88`. Commit provenance: `ed8ff2efab70ad625f31412d84f74732b8fb21fa` ports the rows and shared number calls; `a35e4f7c12087897231e3325355123289ba39364` repairs witnesses and implements verified frozen-digest dispatch; `de5e79619a46688e0e033202e0b2f09ea0defccb` completes the corpus and owner/derived updates; `8ea0e8de8cc8ac473bb43157848468fe7fc49b88` includes the renamed generated schema shard.

| Item | Change / evidence | Location and verification |
|---|---|---|
| **SW-B3: guarded refusal port** (`ed8ff2efab`) | Ordinary six-family, blockage, legacy bundle and registered-source paths now dispatch product refusals to named source-backed predicates. The earlier AST proof engine is retired; its schema-label utilities remain for numeric builders. The old whole-pool check-11 claim stays superseded. | `scripts/pm_dcw_guard_rows.py:576` (`enforce`); `scripts/pm-dcw-table-generate.py:3780` (`outputs`); `scripts/pm_dcw_event_isolation.py:1`. Run `python3 scripts/pm-dcw-table-generate.py --check`, then the guard runner below. |
| **Bounded proof adapter** (`ed8ff2efab`) | Complete append/retry/read/rebuild/compatibility/restore paths, standalone legacy shape/order checks, CLI preflights and an explicitly labelled SP278 codec-helper witness derive observations at their actual refusal sites. Valid complete executions supply controls. The gated tool gets fresh phase factories and performs its own cuts, peer matrix, trace checks and restoration. | `scripts/pm_dcw_guard_suites.py:25` (`witnesses`); `scripts/pm_dcw_guard_suites.py:135` (`collect`); `scripts/pm_dcw_guard_suites.py:194` (`suite_for`). The final collection has 6237 executions, zero mismatches and zero untracked exceptions. |
| **Missing witnesses** (`a35e4f7c12`) | Added coherent original event/key/group, result/request/child, selected root/epoch, restore-member, token, manifest/frame/gap, registry/pointer/edition, intrinsic codec/parser and both CLI preflight witnesses. Repairs preserve independent source facts and reissue only their derived copies. A proposed O128 token-root witness actually refused O183 earlier; it was removed from O128's candidates and the clean collection rerun. | `scripts/pm_dcw_p2a_cases.py:39` (`cases`); `scripts/pm_dcw_p2a_cases.py:31` (`sync_index`); `scripts/pm_dcw_preflight_guard_cases.py:11` (`cases`); `scripts/pm_dcw_preflight_guard_cases.py:72` (`invoke`). All 143 focused witnesses pass their named row/result expectations. Every residual row is listed separately in the unproved table. |
| **Frame predicates** (`a35e4f7c12`) | Split the former opaque O201 aggregate into F001–F005: actual source value bytes, start offset, end offset, schema ID and schema version. F006 attributes base64 parser refusal. Invalid frame facts stay invalid while the builder reissues dependent snapshot bindings. | `scripts/pm_dcw_event_oracles.py:897` (`index_content`); `scripts/pm_dcw_event_oracles.py:1080` (`source_frame_bytes`); `scripts/pm_dcw_index_fixtures.py:56` (`snapshot_source`). Tool tables 162–167 and complete read witnesses. |
| **Observation / control defects** (`a35e4f7c12`) | O165 emits sorted IDs rather than an unsupported set. Family preflight predicates receive names rather than entire case banks. Success observations for physical/JCS/pointer/document intrinsic rows execute before return. O210 uses an unshadowed comprehension variable; B016 compares one iterated character to U+0020, exactly matching its original `ord(c)>=32` predicate within that input domain. Schema metadata equality uses an exact typed representation outside the physical codec's integer domain; a matching 4,400-digit annotation accepts and its one-unit mismatch refuses. | `scripts/pm_dcw_event_oracles.py:158` (`canonical_msgpack`); `scripts/pm_dcw_event_oracles.py:175` (`semantic_digest`); `scripts/pm_dcw_event_oracles.py:1060` (`schema_observation`); `scripts/pm_dcw_registered_schemas.py:19` (`pointer`); `scripts/pm_dcw_registered_schemas.py:39` (`document_at`). Corrected tables 018/022 and focused preflight controls pass. |
| **Runner failure status** (`a35e4f7c12`) | A completed gated report with status FAIL now causes nonzero CLI exit. Collections refuse unresolved mismatches/exceptions. `--include-unproved` records the tool's missing-negative failures rather than silently omitting those rows. | `scripts/pm-dcw-guard-tables.py:37` (`main`); `scripts/pm-dcw-guard-tables.py:30` (`collection_progress`). Final missing-witness batch exits 1 as expected; its reports retain all unproved rows. Earlier table018 FAIL was an adapter-set defect, not a tool pass or tool bug. |
| **Standing / registered regressions** (`ed8ff2efab`) | Keep complete ordinary regressions; retire broad shared-code removal credit. Standing check11 reports `SUPERSEDED_METHOD_B`. No diagnostic removal set is treated as a duplicate proof. | `scripts/pm_dcw_event_regressions.py:92` (`audit`); `scripts/pm_dcw_registered_regressions.py:27` (`audit`). Six standing and six registered suites: all 12 exit0, top-level PASS; standing11 is superseded. |

### Guard-table result and exact limits

| Checker | Guards | Proved phase rows | Unproved |
|---|---|---|---|
| pm_dcw_event_oracles | 250 | 210 | 40 |
| pm_dcw_blockage_events | 108 | 97 | 11 |
| pm_bundle_revision_events | 22 | 18 | 4 |
| pm_dcw_registered_schemas | 13 | 13 | 0 |

These are **named assertion/phase guards**, not a census of primitive JSON Schema predicates. The observation's `site` selects the assertion; peers in another site are outside that invocation. Some source assertions iterate fields or compare tuples. A proved phase does not separately prove every loop occurrence, tuple member, schema clause, selector, source adapter or complete Python boundary. Aggregate schema-status rows prove only refusal attribution, and their individual keyword cuts are **not run**. No duplicate-set credit is claimed.

The gated reports prove 338 phase rows; 55 rows lack an independent negative. All 393 have accepted controls. The collection includes 153 standalone legacy shape/order invocations, 19 shortened-bank CLI preflight invocations and 2 SP278 helper invocations; N004’s negative is a helper-boundary witness and earns no full-family credit. The unproved rows do not reduce the recorded credit of other tables. Their named reasons, source locations and tool failures are in [DCW.guard-removal.md](DCW.guard-removal.md). It also lists **every row's own flips, peer counts and restoration result**. The cited compressed raw reports retain every cut result and complete trace, with the exact case IDs; `guard-results.json.gz` includes every row and the supplementary full-path cut result for every distinct negative.

The `DISABLED` diagnostics are supplementary only. Their totals include the explicitly labelled N004 SP278 helper cut; that one cut is not a full-family invocation. Of 1056 distinct negative observations, 919 cuts accept, 109 refuse later, and 28 hit a derivation exception. The exact later guard/code or exception is recorded for each case. Later refusals and derivation exceptions earn **zero complete-boundary isolation credit**; none is excused as an unnamed duplicate. Even an accepting diagnostic cut is not a gated whole-boundary certificate. Source-backed phase results and these diagnostics are reported separately.

### Unproved rows

| Guard | Reason |
|---|---|
| `O013` | The complete payload schema fixes event_type for the selected family; mismatching envelopes or selected rows in the corpus refuse before this equality. No independent envelope-versus-payload witness is credited. |
| `O014` | The selected family payload schema fixes this exact event_type. The payload-versus-row equality has no independent complete-path negative after that schema. |
| `O017` | Changing project scope reaches the shared envelope project/application constraints or the identity join before this project-only assertion; no independent scope witness is supplied. |
| `O021` | Current causation/predecessor witnesses stop at O020 or the earlier payload schema. Parent-to-payload predecessor equality has no independent negative in this corpus. |
| `O041` | custody_v2 validates first_append_receipt.durability_state as synced before this runtime equality. No per-const cut was performed. |
| `O058` | The earlier legacy.validate predecessor identity joins and source/intent bindings reject the enumerated phase-copy defects first. Each loop-field occurrence still lacks its own full-path witness. |
| `O060` | The phase slot event_type has no isolated negative distinct from prepared_event dispatch and the source schema. Missing coverage is not a duplicate proof. |
| `O061` | The slot predecessor equality has no negative that reaches it independently of phase ordering and source-schema validation. |
| `O062` | The slot source_ref equality has no full-path negative independently separating it from payload source-ref derivation and source-schema constraints. |
| `O076` | The completion annotation-output nonempty assertion lacks an independent complete-path negative after the completed payload/source shape checks. |
| `O077` | The earlier O057 checks membership of the same predecessor in the same settled set; a duplicate-set proof cutting both sites was not run. No duplicate credit is claimed. |
| `O108` | The wizard-open source schema constrains result.status before this runtime opened assertion; its exact schema clause was not cut. |
| `O109` | The wizard-open payload schema fixes predecessor_event_id to null before this runtime assertion; no per-const schema cut. |
| `O110` | The deferred-load source schema constrains result.status before the runtime seed_loaded assertion; no per-const schema cut. |
| `O112` | No independently reissued retained predecessor of a different family reached this row after original/source custody and payload selection. This is a missing witness, not an impossibility claim. |
| `O115` | The current-generation state assertion has no isolated complete-path witness after checkpoint schema and current-generation selection. |
| `O117` | The checkpoint schema fixes complete_to_captured_boundary before this runtime assertion; no individual schema-const cut. |
| `O119` | Row-count-versus-retained-count equality lacks an independent witness preserving the preceding row-count check and the complete captured-source/row membership facts. |
| `O124` | Read-token schema and exact durable/live projection O123 precede this length check. No separate token-shape witness survives both. |
| `O125` | The live read-token schema closes its required fields before this length check. No separate per-member schema cuts were performed. |
| `O128` | Changing the token Storage ID is refused earlier by O183, which joins the same token to authentic authority; O182 already binds the checkpoint to that authority. No duplicate-set proof or independent negative earns this later equality credit. |
| `O129` | The token/frontier source_selection equality has no coherent independently reissued token witness preserving its earlier schema and source-selection joins. |
| `O133` | The checkpoint-key/root derivation assertion lacks a coherent witness moving checkpoint key, both token copies and checkpoint references independently of the prior token equality. |
| `O202` | Every frame must belong to exactly one source segment before this total can differ. No independent segment-membership witness reaches this count without another captured-source defect. |
| `O207` | The source-order uniqueness assertion lacks a coherent original capture with distinct valid owner events that reaches it. Reordered/duplicate-source cases currently refuse earlier. |
| `O208` | The event-ID uniqueness assertion lacks a coherent capture with duplicated authentic original IDs and otherwise lawful Storage sequence/order and owner custody. |
| `O211` | The checkpoint schema constrains each sequence-gap reason before this runtime allowlist. A valid gap control is collected; no independent invalid reason or per-enum schema cut is credited. |
| `O214` | The selected generation is fetched by checkpoint.current_generation_id and the checkpoint schema precedes this equality. No independently inconsistent selected-generation witness is supplied. |
| `O216` | The map-key/generation-ID equality lacks a multi-generation complete control with an independently defective inactive generation. Current-generation aliases encounter prior joins first. |
| `O217` | The per-generation identity derivation has no isolated inactive-generation witness; O215 already tests this derivation for the selected generation. No duplicate-set proof was run. |
| `O218` | The per-generation dataset-name derivation lacks a coherent inactive-generation witness preserving prior generation-ID and dataset lookup joins. |
| `O219` | The exactly-one-current-generation assertion lacks an independent multi-generation control/negative after checkpoint schema constraints. |
| `O220` | The anchor-root equality lacks a coherent independent anchor/source/root witness that preserves prior generation derivation and selection joins. |
| `O221` | The anchor retained-count bound lacks a coherent independently reissued anchor/generation witness; current cases stop at earlier generation or prefix bindings. |
| `O223` | The birth-anchor first sequence equality lacks a coherent independently reissued anchor, generation ID and token negative. No whole-anchor cut is used. |
| `O224` | The birth-anchor through sequence equality lacks a coherent independently reissued anchor, generation ID and token negative. No whole-anchor cut is used. |
| `O225` | The birth-anchor gap digest lacks a coherent independently reissued anchor/generation witness. Gap controls are covered separately; this exact digest row remains unproved. |
| `O226` | Each anchor/source-selection field join lacks a separately reissued birth generation, ID and token witness. No compound anchor-removal set earns credit. |
| `O233` | The selected original frame equality is preceded by source row reconstruction and O228 row-source matching. No independent full-path input reaches this later equality. |
| `B001` | The selected blockage payload schema fixes event_type before envelope/payload family equality; no per-const schema cut. |
| `B004` | The shared envelope schema and blockage identity join precede the project-only scope assertion; no independent scope witness survives them. |
| `B019` | The retained predecessor family assertion lacks a coherent different-family original/source/custody control. Missing witness; no unreachable claim. |
| `B023` | Source-reference derivation is bound by the earlier envelope identity and source_ref equality. No independent negative reaches this later derivation. |
| `B054` | The predecessor requiredness assertion lacks a valid unblocked observation with the corresponding original absent after its preceding historical lookup/custody checks. |
| `B063` | The resolution-set schema validates member string type before this runtime type assertion; no individual item-type schema cut. |
| `B069` | The ordinary verify entry has no foreign-family witness with a complete otherwise valid DCW authority graph; foreign payload/schema probes exercise other boundaries. |
| `B085` | Compatibility-original absence has no independently missing original witness before source construction/custody. Removing the guard could also leave a dereference; no derivation credit. |
| `B093` | The older-epoch comparison lacks a coherently admitted newer-source/older-authority restore witness preserving preceding restore admission joins. |
| `B095` | Original custody is authenticated earlier by source_contract/original_receipt before restore membership. No independent absence witness reaches this later check. |
| `B096` | The exactly-one matching restore member check lacks an independently reissued complete admission retaining all required member/owner facts. No schema/member compound cut. |
| `L001` | The bundle payload schema UTC-Z shape precedes this endswith assertion. No individual schema-pattern cut. Timestamp review remains interim only. |
| `L013` | The requested payload schema fixes predecessor_event_id to null before this runtime assertion. No individual schema-const cut. |
| `L014` | The requested payload schema fixes phase_sequence to zero before this runtime assertion. No individual schema-const cut. |
| `OE007` | With the canonical callback every product refusal is now m.Refusal and is rethrown in the preceding except branch; no AssertionError/ValidationError witness is supplied for this legacy fallback. |
| `LE001` | The enforced bundle payload date-time validation precedes datetime.fromisoformat. No parser-specific invalid value survives it; timestamp work remains interim only. |

These are evidence limitations, not a claim that all rows are mathematically unreachable. Earlier schema enforcement is not a proven duplicate without individual clause cuts. A missing coherent multi-generation/original-custody witness is missing coverage. Full check11 remains PARTIAL until those boundaries and individual schema predicates are covered and independently reviewed.

## Sweep part 2A fix 1: missing witnesses

This section supersedes the missing-witness entries in the "Unproved rows" table
above. Each of the 55 rows was classified from the checker code, by probing the
complete paths: **41 reachable** rows now have a coherent single-defect negative
refused first at exactly that row, and **14 by-construction** rows stay unproved
in their own tables for the reason cited. No gated guard-tool or NUMRULE file
was edited; no date-time code was adopted; timestamp review stays **interim
only**. Witnesses are in `scripts/pm_dcw_p2a_cases.py:296` (`cases`, fix-1
section; helpers at `:39`) and `scripts/pm_dcw_legacy_guard_cases.py:54`, and
run through the complete checkers in the guard collection
(`scripts/pm_dcw_guard_suites.py:135`, `collect`).

Two phase predicates were re-derived without changing any refusal: O207 now
compares against `sorted(set(sequences))` computed in the checker
(`scripts/pm_dcw_event_oracles.py:951`) and O219 against the derived current-key
list and `[gid]` (`scripts/pm_dcw_event_oracles.py:967`), because the gated
tool does not certify the `sorted(set(...))` call or the comprehension variable
shadowing its engine alias in a table predicate. Only the generated
`pm_dcw_table_108`/`pm_dcw_table_117` changed (`pm-dcw-table-generate.py
--check` exits 0).

| Guard | Class | Evidence (`path:line`) | Witness / reason |
|---|---|---|---|
| `O013` | reachable | Caller selects `row`; envelope `event_type` is pattern-only (`Plans/event_record.schema.json` `event_type`), payload schema binds only the payload copy in `event_body` (`scripts/pm_dcw_event_oracles.py:227`) | `bundle.revision_requested/p2a/O013`, refused `family` |
| `O014` | by construction | Payload schema fixes `event_type` const (`Plans/event_payloads/bundle_revision/revision_requested.schema.json:61`), enforced in `event_body` (`scripts/pm_dcw_event_oracles.py:227`) before `envelope` O014 | Schema refuses first (`OE001`); own table 47 |
| `O017` | reachable | `scope_kind` enum plus application/project conditionals (`Plans/event_record.schema.json` `allOf`); identity O016 is payload-derived | `bundle.revision_requested/p2a/O017` (application + null project), refused `scope` |
| `O021` | reachable | O020 joins causation to parent only (`scripts/pm_dcw_event_oracles.py:271`) | `bundle.revision_requested/p2a/O021` (parent+causation moved together), refused `causation` |
| `O041` | by construction | `durability_state` const `synced` (`Plans/event_append_receipt_contracts.schema.json:61`), custody schema first (`scripts/pm_dcw_event_oracles.py:302`) | Schema refuses first; own table 53 |
| `O058` | reachable | Requested phase has no legacy field chain; O051 binds the latest payload only | `bundle.revision_completed/p2a/O058`, refused `source_phase_identity` |
| `O060` | reachable | Slot `event_type` enum admits the sibling phase (`Plans/dcw/revision_run.schema.json:202`) | `bundle.revision_requested/p2a/O060`, refused `source_phase_identity` |
| `O061` | reachable | Slot predecessor is a plain nullable string (`Plans/dcw/revision_run.schema.json:215`) | `bundle.revision_requested/p2a/O061`, refused `source_phase_identity` |
| `O062` | reachable | Slot `source_ref` is a plain string (`Plans/dcw/revision_run.schema.json:210`) | `bundle.revision_requested/p2a/O062`, refused `source_ref` |
| `O076` | reachable | Result annotation list has `minItems: 0` (`Plans/dcw/revision_run.schema.json:288`) | `bundle.revision_completed/p2a/O076`, refused `completion_outputs` |
| `O077` | by construction | Same predecessor/`settled` as O057; `settled` changes only after O077 (`scripts/pm_dcw_event_oracles.py:364`, `:401`) | Entailed second site; no duplicate-set credit; own table 65 |
| `O108` | by construction | Result `status` const `opened` (`Plans/dcw/wizard_open_evidence.schema.json:337`), inline schema at `scripts/pm_dcw_event_oracles.py:417` | Schema refuses first; own table 75 |
| `O109` | by construction | Opened payload predecessor is `type: null` (`Plans/event_payloads/planning_wizard/wizard_opened.schema.json:117`) | Schema refuses first; own table 76 |
| `O110` | by construction | Result `status` const `seed_loaded` (`Plans/dcw/wizard_seed_load_evidence.schema.json:337`), inline schema at `scripts/pm_dcw_event_oracles.py:417` | Schema refuses first; own table 77 |
| `O112` | reachable | Authority original is read only at O111/O112 in the loaded branch | `wizard.deferred_payload.loaded/p2a/O112` (original recast `wizard.blocked`), refused `opened_original` |
| `O115` | reachable | Generation `state` enum admits `staged` with null activation (checkpoint schema generation `state`/`allOf`) | `bundle.revision_requested/p2a/O115`, refused `index_currentness` |
| `O117` | by construction | Coverage flag is `const: true` (`Plans/event_record_index_checkpoint.schema.json:343`), checkpoint schema first (`scripts/pm_dcw_event_oracles.py:472`) | Schema refuses first; own table 80 |
| `O119` | reachable | O118 binds rows to `index_row_count` only; coverage count is a plain integer | `bundle.revision_requested/p2a/O119`, refused `index_coverage` |
| `O124` | by construction | O123 exact durable/live equality plus the closed read-token shape below fixes 9 | Entailed by O123 + schema; own table 82 |
| `O125` | by construction | Read token is closed with exactly 10 required fields (`Plans/event_record_index_checkpoint.schema.json:2570`), live token schema first (`scripts/pm_dcw_event_oracles.py:473`) | Schema refuses first; own table 83 |
| `O128` | reachable | Earlier joins bind token to authority, not checkpoint to authority; checkpoint instance is a uuid string | `bundle.revision_requested/p2a/O128` (checkpoint side foreign), refused `index_currentness` |
| `O129` | reachable | Token selection is schema-shaped only; O116 binds frontier, not tokens | `bundle.revision_requested/p2a/O129` (both token copies), refused `index_currentness` |
| `O133` | reachable | O132 compares the two key copies, which move together | `bundle.revision_requested/p2a/O133`, refused `index_currentness` |
| `O202` | reachable | Recomputed segments partition frames by segment identity; an orphan frame joins none | `bundle.revision_requested/p2a/O202`, refused `index_source_bytes` |
| `O207` | reachable | Captured frame order is an independent source fact; derived blob/segment facts rebuild coherently | `bundle.revision_requested/p2a/O207` (reversed capture), refused `index_source_bytes` |
| `O208` | reachable | A second frame may carry the same event at a new sequence | `bundle.revision_requested/p2a/O208`, refused `index_source_bytes` |
| `O211` | reachable | O211 reads the captured-source gap copy; the enum at `Plans/event_record_index_checkpoint.schema.json:528` binds the separate coverage copy, joined later at O213 | `bundle.revision_requested/p2a/O211` (source/excluded reason foreign, selection chain reissued), refused `index_source_gaps` |
| `O214` | reachable | Generation-id copies (field, transactions, tokens, ref) move together past O121/O127/O134 | `bundle.revision_requested/p2a/O214`, refused `index_generation_identity` |
| `O216` | reachable | Checkpoint admits up to three generations; an inactive key may disagree with its id | `bundle.revision_requested/p2a/O216`, refused `index_generation_identity` |
| `O217` | reachable | An inactive generation id need not derive from its anchor | `bundle.revision_requested/p2a/O217`, refused `index_generation_identity` |
| `O218` | reachable | A correctly derived inactive generation may name another dataset | `bundle.revision_requested/p2a/O218`, refused `index_generation_identity` |
| `O219` | reachable | A second correctly derived generation may also be `current` | `bundle.revision_requested/p2a/O219`, refused `index_generation_identity` |
| `O220` | reachable | Anchor selection storage moves with a fully reissued generation (O215 derivation preserved) | `bundle.revision_requested/p2a/O220`, refused `index_generation_identity` |
| `O221` | reachable | Anchor retained count is not a generation-derivation input; token anchor hashes move | `bundle.revision_requested/p2a/O221`, refused `index_anchor_prefix` |
| `O223` | reachable | Same anchor-copy move as O221 | `bundle.revision_requested/p2a/O223`, refused `index_anchor_prefix` |
| `O224` | reachable | Same anchor-copy move as O221 | `bundle.revision_requested/p2a/O224`, refused `index_anchor_prefix` |
| `O225` | reachable | Same anchor-copy move as O221 | `bundle.revision_requested/p2a/O225`, refused `index_anchor_prefix` |
| `O226` | reachable | Anchor selection field moves with a fully reissued generation | `bundle.revision_requested/p2a/O226`, refused `index_anchor_prefix` |
| `O233` | reachable | Captured frame event is rebuilt coherently (bytes, rows, snapshot) with a foreign actor | `bundle.revision_requested/p2a/O233`, refused `index_event_join` |
| `B001` | by construction | Row is derived from the envelope type (`scripts/pm_dcw_blockage_events.py:27`) and the payload fixes the same const (`Plans/event_payloads/planning_wizard/wizard_blocked.schema.json:32`) | Schema refuses first; own table 125 |
| `B004` | reachable | Same scope construction as O017; B003 identity is payload-derived | `wizard.blocked/p2a-fix1/B004`, refused `scope` |
| `B019` | reachable | Historical original is read from authority at B018/B019 | `wizard.unblocked/p2a-fix1/B019` (original recast), refused `blocked_original` |
| `B023` | reachable | B022 copy moves with the payload ref; identity B003 does not bind `source_ref` | `wizard.blocked/p2a-fix1/B023`, refused `source_ref` |
| `B054` | by construction | Unblocked payload predecessor is a required string (`Plans/event_payloads/planning_wizard/wizard_unblocked.schema.json:68`); `previous` is null only when it is null | Schema refuses first; own table 131 |
| `B063` | reachable | The authority action map has no schema check before B062/B063 | `wizard.unblocked/p2a-fix1/B063` (integer member), refused `clearing_action_type_remaining_before` |
| `B069` | reachable | First refusal in blockage `verify`, before `envelope` | `wizard.blocked/p2a-fix1/B069` (`wizard.opened`), refused `family` |
| `B085` | reachable | Inline-payload compatibility envelope needs no authority copy before B085 | `wizard.blocked/p2a-fix1/B085`, refused `original_custody_missing` |
| `B093` | reachable | A restored predecessor source may carry a newer epoch than the authority | `wizard.unblocked/p2a-fix1/B093`, refused `restore_older_only` |
| `B095` | reachable | An extra restored source with inventory but no custody reaches the loop | `wizard.unblocked/p2a-fix1/B095`, refused `restore_member` |
| `B096` | reachable | Removing the first dependency's admission member leaves zero matches | `wizard.unblocked/p2a-fix1/B096`, refused `restore_member` |
| `L001` | by construction | Payload `ts` requires `Z$` plus the date-time grammar (`Plans/event_payloads/bundle_revision/revision_requested.schema.json:81`) | Schema refuses first; own table 142. Interim only |
| `L013` | reachable | Requested predecessor admits string or null (same schema, `predecessor_event_id`); the prior const-null claim is corrected | `bundle.revision_requested/legacy/requested_predecessor_present`, refused `request_predecessor` |
| `L014` | reachable | Requested `phase_sequence` admits any nonnegative integer (same schema); identity copies move | `bundle.revision_requested/legacy/requested_sequence_nonzero`, refused `request_predecessor` |
| `OE007` | by construction | `check_schema` converts `ValidationError` to `Refusal` (`scripts/pm_dcw_event_oracles.py:96`), caught by the first `except` (`:367`) before the `AssertionError`/`ValidationError` fallback (`:370`); canonical `validate` raises neither otherwise | Dead fallback with the canonical callback; own table 155 |
| `LE001` | by construction | Every `Z$` value passing `valid_date_time` (`scripts/pm_dcw_event_oracles.py:838`: full-match grammar, calendar and seconds 00–59) parses after the `Z` substitution (fractional and `t`-separator probes accept; leap second fails the grammar) | No parser-only value survives; own table 160. Interim only |

Note on O013: the fix-1 brief's example list named O013 as by-construction, but
the code decides otherwise (see its row above), so it is witnessed here.

**Totals and cuts (gated tool `004bdedd63`, credited exactly as reported):**
collection 6,317 executions, 0 mismatches, 0 untracked exceptions, 393
controls, 1,097 distinct negatives. Tool: 167 tables (153 PASS / 14 FAIL),
24,842 evaluations; **379 of 393** phase rows proved (was 338). Per checker:
`pm_dcw_event_oracles` 240/250 (was 210), `pm_dcw_blockage_events` 106/108
(was 97), `pm_bundle_revision_events` 20/22 (was 18),
`pm_dcw_registered_schemas` 13/13. Each new row: 1 own negative, 1 flip, 0
stays, 0 masked, 0 unrelated changes, restoration matches
([DCW.guard-removal.md](DCW.guard-removal.md), regenerated). The 14 FAIL tables
are exactly the by-construction rows above, each alone in its table, so no
proved row loses table credit. Supplementary `DISABLED` full-path diagnostics
(unchanged meaning): of 1,097 distinct negatives, 934 cuts accept, 133 refuse
later and 30 hit a derivation exception; later refusals and exceptions earn
**zero complete-boundary isolation credit**. Family grades are unchanged at
**8 PASS / 3 PARTIAL / 1 ABSENT** for all eight families, so the self-grade is
unchanged. Evidence: `drafts/DCW/sweep-p2a-fix1/` (`SHA256SUMS`).

| Command/group | Exit | Result |
|---|---|---|
| Ordinary complete checkers (6 DCW families) | 0 | PASS |
| Blockage complete checkers (2) | 0 | PASS |
| Standing regressions (6) | 0 | PASS |
| Registered regressions (6) | 0 | PASS |
| `pm-dcw-number-checks.py` (3,040 cases) | 0 | pass |
| `pm_event_numbers.py --self-test --scope numbers` | 0 | pass |
| `pm-dcw-table-generate.py --check` | 0 | 393 rows in 167 tables; current |
| Guard collection | 0 | 6,317 executions, 0 mismatches / 0 untracked |
| Gated tool (11 batches, `--include-unproved`) | 1 (expected) | 153 PASS / 14 FAIL tables; FAIL is exactly the 14 by-construction rows |
Min available sampled at heavy starts: 12.9 GiB; no run paused below 10 GiB. No browsers.


## Sweep part 2B numbers: findings and responses

Number-call and expectation changes are in `ed8ff2efab`; frozen dispatch and large-value diagnostics are finalized in `a35e4f7c12`; corpus and owner/derived refinements are in `de5e79619a`. The delivered implementation is `8ea0e8de8cc8ac473bb43157848468fe7fc49b88`. Exact NUMRULE source files are unchanged from the gated merge. Local identity recipes retain their IDs, prefixes, array fields and tuple order; no logical cap was added.

| Item | Change | Location / verification |
|---|---|---|
| **SW-N1: current tokens and slots** | Raw descriptor JSON uses `loads_current_json`; declared current integer slots call shared `current_integer` with their schema bounds through the current validator. Current caller retry admission is separate from verifying its authentic original. Storage-assigned sequence uses shared `storage_uint64`, retaining the whole domain through 2^64−1. Current checkpoint/read-token slots retain current admission. | `scripts/pm_dcw_event_oracles.py:71` (`_current_type`); `scripts/pm_dcw_event_oracles.py:1011` (`current_schema`); `scripts/pm_dcw_event_oracles.py:1050` (`admit_storage_sequence`); `scripts/pm_dcw_event_oracles.py:1022` (`admit_retry_request`); `scripts/pm_dcw_event_oracles.py:215` (`event_reference`). Number corpus/current-float/raw-token negatives and full-u64 publish/retry/read/rebuild positives. |
| **Producer bytes** | `semantic_digest` calls shared `producer_semantic_digest` over the unchanged complete CV-317 projection. Qualifies the actual JCS route before effects; Storage-assigned metadata remains outside producer semantics. Exact local integer JSON identity/descriptor recipes keep their existing preimages. | `scripts/pm_dcw_event_oracles.py:175` (`semantic_digest`); `scripts/pm_dcw_event_oracles.py:780` (`canonical_json`). Full retry conflict cases and independent corpus endpoint expectations. |
| **Physical profiles** | EventRecord/source/payload bytes use shared `storage_value_bytes(EVENT_VALUE)`; full commitments use `full_value_commitment`. Physical finite floats and signed zero remain distinct where the original schema permits them. SP-278 keeps `INDEX_BINDING` and the existing `pm.event_index.binding.msgpack_sha256.v1` wrapper. | `scripts/pm_dcw_event_oracles.py:158` (`canonical_msgpack`); `scripts/pm_dcw_event_oracles.py:168` (`commitment`); `scripts/pm_dcw_event_oracles.py:859` (`index_binding`); `scripts/pm_dcw_event_oracles.py:805` (`exact_equal`). All baseline fixtures, overflow/inline/reference paths, exact typed joins and full-u64 snapshots. |
| **SP-1101 original selection** | Fixture issuance installs an external synthetic original catalog and exact RecipeTuple → FrozenRecipe map, keyed by event identity, full-event bytes and first-receipt bytes. Requests supply no credential or weaker-recipe flag. `RetainedDispatcher` selects once; current admission never runs on an authenticated passive original or earlier original in a current append. The frozen verifier recomputes the exact pre-sweep integer-JSON or current JCS digest selected by that tuple; comparisons and index projection use this verified digest. This static model installs this head’s unchanged local schema resources as the frozen resources of its one modelled original edition; it does not establish arbitrary historical edition support. Frozen shared resources remove lane-authored current integer annotations. | `scripts/pm_dcw_number_custody.py:30` (`install`); `scripts/pm_dcw_number_custody.py:61` (`resolve`); `scripts/pm_dcw_number_custody.py:15` (`semantic_for_recipe`); `scripts/pm_dcw_number_custody.py:72` (`selected_semantic_digest`); `scripts/pm_dcw_event_oracles.py:298` (`original_receipt`); `scripts/pm_dcw_event_oracles.py:186` (`original_semantic_digest`); `scripts/pm_dcw_event_oracles.py:1037` (`original_scope`); `scripts/pm_dcw_event_oracles.py:54` (`historical_boundary`). Retained integral-float registered originals, replay-only reads, coherent restore, forged-catalog refusal, caller retry refusal and opened-source custody cases. The catalog is a static adapter stand-in, **not native authentication**. |
| **4,400-digit integer** | Exact parsing has no global cap. Actual Storage uint64 input refuses `integer_range`; family schema diagnostics refuse `schema` and generic registered-source diagnostics refuse `index_source_payload`. Owner integer slots without a schema maximum take the physical route’s existing range refusal, while separate schema probes exercise diagnostics. Safe schema numeric diagnostics do not crash on Python's integer-to-string limit. Typed schema metadata can carry an unbounded integer without selecting a physical route. | `scripts/pm_dcw_event_oracles.py:82` (`_safe_keyword`); `scripts/pm_dcw_event_oracles.py:96` (`check_schema`); `scripts/pm_dcw_event_oracles.py:1060` (`schema_observation`); `scripts/pm-dcw-number-checks.py:59` (`run`). 40 full-family number cases plus the huge matching/mismatching schema annotation controls. No interpreter-wide integer limit is disabled. `frozen-recipe.json` adds 5/5 exact original-number/first-receipt helper checks (including a wide frozen digest, current route refusal, forged digest and recipe override); that helper witness does not claim complete owner-protocol acceptance. |
| **Expected-result changes** | **24**, all refusals remain refusals: 12 supplied-original sequence decimal/exponent cases change `schema` → `original_full_value`; 12 retained opened-predecessor prepared-copy cases change `schema` → `latest_source_event`. Frozen shared numeric validation now allows the original representation; exact original/copy joins still refuse the forged transient value. Each case ID, before/after result and reason is recorded. | `fixture-expectation-changes.json` in the evidence bundle, and `scripts/pm_dcw_event_numeric_cases.py:20` (`cases`); `scripts/pm_dcw_opened_custody_cases.py:13` (`cases`). Final family and collection runs use these exact expectations. |
| **Owner / schema prose** | CV-590–597 cites CV-1100/SP-1100/SP-1101 beside each existing local identity, CV-317/CV-339, SP-278, SP-286 and SP-337 binding. Remove parsed-negative-zero normalization prose. Shared envelope/receipt frozen compatibility definitions lose lane-authored current-only pm-uint annotations; live checkpoint slots remain strict. No owner policy or product behavior choice was made. | `Plans/Contracts_V0.md:24611` (CV-590); `Plans/Contracts_V0.md:24688` (CV-591); `Plans/Contracts_V0.md:24765` (CV-592); `Plans/Contracts_V0.md:24842` (CV-593); `Plans/Contracts_V0.md:24920` (CV-594); `Plans/Contracts_V0.md:24993` (CV-595); `Plans/Contracts_V0.md:25068` (CV-596); `Plans/Contracts_V0.md:25290` (CV-597); `Plans/event_record.schema.json`; `Plans/event_append_receipt_contracts.schema.json`; `Plans/event_record_index_checkpoint.schema.json`. Shards/index regenerated; output scope and validation result below. |
| **Shared corpus and credit** | 3040/3040 lane integration checks pass (exit0). 139 raw JSON/byte inputs and 216 typed scalar entries from the shared number corpus are projected into each of eight families’ actual nullable nonnegative producer-sequence caller slots. Parser refusals stop before a value exists; every parsed/projected value traverses the complete caller retry checker. The slot expectation follows this lane’s field domain and producer route, not the original corpus operation’s different bounds/profile. Full-u64 old-edition originals, receipt/retry/read/rebuild, retained registered integral-float frames, current floats, forged history and 4,400-digit cases run separately. Other corpus operations retain shared-helper credit only; no claim that all 580 original operations execute inside every lane path. | `python3 scripts/pm-dcw-number-checks.py --output <file>` and `python3 scripts/pm_event_numbers.py --self-test --scope numbers`. Shared helper: **580/580, 304 negatives, status pass, exit0**, credited exactly as reported. The number-only self-test confirms no date-time module import. |

### Timestamp fields — interim only

This review is **interim only**. Existing lane `valid_date_time`/format enforcement and legacy `datetime.fromisoformat` behavior remain. The previous round's valid leap-second refusal and non-Z Storage-time acceptance are still open; no timestamp correctness claim is added. Frozen number selection does not certify a frozen timestamp profile. No `pm_event_datetime`, `datetime_validator`, `date_time` or inventory gate is called.

## Part 2B items

Timestamp items only:

- **SW-B2 / CV-1101 field profiles:** `scripts/pm_dcw_event_oracles.py:838` (`valid_date_time`); `scripts/pm_dcw_event_oracles.py:96` (`check_schema`); `scripts/pm_bundle_revision_events.py:17` (`validate`); `scripts/pm_dcw_blockage_events.py:23` (`envelope`); `scripts/pm_dcw_index_cases.py` timestamp cases. Apply the gated shared timestamp validator at complete envelope/source/receipt/checkpoint boundaries, selecting `storage_utc_z` for Storage observed/persisted times and the actual field-owner profile elsewhere. Preserve exact strings and permitted fractional precision; cover legitimate leap seconds, offsets, lowercase, malformed calendar values and trailing bytes.
- **SP-1101 original timestamp profile:** `scripts/pm_dcw_number_custody.py:30` (`install`); `scripts/pm_dcw_event_oracles.py:47` (`frozen_shared`); `scripts/pm_dcw_event_oracles.py:54` (`historical_boundary`); `scripts/pm_dcw_event_oracles.py:1037` (`original_scope`). Extend the authentic original tuple/resources to the gated date-time profile. Preserve lawful retained original strings and avoid current-then-legacy probing; rerun history, retry and receipt cases with current request admission separate.

No stopped DL-045 product-choice item remains. Retention answers stay with RT; native integrations and proof limitations are disclosed above rather than called timestamp work. Independent Sol/Astra review remains scheduled after both sweep parts under the brief.

## Grades and verification

| Family | Before | After |
|---|---|---|
| `bundle.revision_requested` | 8 / 3 / 1 | 8 / 3 / 1 |
| `bundle.revision_started` | 8 / 3 / 1 | 8 / 3 / 1 |
| `bundle.revision_completed` | 8 / 3 / 1 | 8 / 3 / 1 |
| `bundle.revision_interrupted` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.blocked` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.deferred_payload.loaded` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.opened` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.unblocked` | 8 / 3 / 1 | 8 / 3 / 1 |

`retention`, `compatibility_withdrawal` and `positive_negative_oracles` stay PARTIAL; `membership_version` stays ABSENT. The other eight criteria retain PASS. 292 exact quotations match the final implementation. Historical report and self-grade review fields are lineage, not current PASS claims.

| Command/group | Exit | Minimum available GiB | Top-level result |
|---|---|---|---|
| number-lane | 0 | 18.15 | pass |
| number-shared | 0 | 19.01 | pass |
| bundle.revision_requested | 0 | 22.49 | pass |
| bundle.revision_started | 0 | 22.52 | pass |
| bundle.revision_completed | 0 | 22.92 | pass |
| bundle.revision_interrupted | 0 | 22.67 | pass |
| wizard.opened | 0 | 23.38 | pass |
| wizard.deferred_payload.loaded | 0 | 21.36 | pass |
| wizard.blocked | 0 | 22.3 | pass |
| wizard.unblocked | 0 | 21.97 | pass |
| standing-bundle.revision_requested | 0 | 21.12 | pass |
| standing-bundle.revision_started | 0 | 20.5 | pass |
| standing-bundle.revision_completed | 0 | 20.03 | pass |
| standing-bundle.revision_interrupted | 0 | 20.67 | pass |
| standing-wizard.opened | 0 | 21.28 | pass |
| standing-wizard.deferred_payload.loaded | 0 | 19.22 | pass |
| registered-bundle.revision_requested | 0 | 21.59 | pass |
| registered-bundle.revision_started | 0 | 20.69 | pass |
| registered-bundle.revision_completed | 0 | 19.25 | pass |
| registered-bundle.revision_interrupted | 0 | 19.37 | pass |
| registered-wizard.opened | 0 | 17.31 | pass |
| registered-wizard.deferred_payload.loaded | 0 | 16.67 | pass |
| shard-generate | 0 | 18.27 | pass |
| index-generate | 0 | 17.43 | pass |
| shard-check | 0 | 18.52 | pass |
| index-validate | 1 | 16.99 | fail |

Index validate was read at the top level against `origin/main` **`268a9382f7ba2efaf8909f5e69403a5afe82b114`**. Index validation remains FAIL: 53 diagnostics (21 unchanged ledger-input errors and 32 units present on newer main but absent at this branch’s merge base). Every failure path is byte-identical to the number-merge base; no unit was removed in this pass. index-failure-classification.json records the exact proof. No clean-index claim, unrelated repair or rebase is made. No governance reseal, baseline reset, registry append or Decision Log write was performed.

Recurring classes retain direct full-path regressions: original/source/receipt/Project forgeries and assigned metadata; coherent historical reads after live changes, lawful replay-only history and forged/withdrawn originals; exact type-aware joins; eager unused local/external/transitive references; complete encoded byte sizes and independent event/source references; predecessor custody and restore dependencies; current-writer/retry policy and semantic-only comparison; exact failure exit handling. Schema clause, compound/loop occurrence and complete-boundary isolation limits remain explicit. Timestamp review stays interim only. Native source adapters/authentication, real Storage bytes/CRC, redb CAS/concurrency, append/lost-ack, crash recovery, backup/restore, access/deletion and retention campaigns remain **NOT_RUN**.

## Delivery and evidence

Evidence root: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/sweep-p2a/`. Only the cited compact/gzipped artifacts were copied there after all work. `SHA256SUMS` binds the report, self-grade, all table results, every cut, number results, expected-result changes, source pins and repository checks. Raw work stayed on the local VM. The reboot checkpoint WIP was preserved at `ed8ff2efab70ad625f31412d84f74732b8fb21fa` on both `wip/ea-dcw-20261108` remotes before restart; stopped work was rerun.

| Cited artifact | SHA-256 |
|---|---|
| `DCW.guard-removal.md` | `c9df4d97afe025b895b938340becf9903a120ba138af98d6e681c0230d1a85cb` |
| `DCW.number-expectations.json` | `58e0e69ada12ffb91dce1088abe60ea15fe14785a19074d809148c9a1c4a5ee8` |
| `DCW.self-grade.json` | `4c3485a1bf32dfa7dcf38c694f7ee5f9fde75577c55f7b630e27d345c4bb9d7e` |
| `adapter-fixes.json` | `1d3d8dee282c1fc0155b7d5675400b499bd2742d5b7d0cc0e7acda87c617a626` |
| `case-banks.tar.gz` | `f0c181905caee23a614b5acfcd80fb9ac6bb87e79194569e2fa32d16e90bfcce` |
| `collection-summary.json` | `4a9a67f00b4fc610cdd9348ed28b1f5d0da7f89d6a75d150c666500c2c35ac1f` |
| `currentness-final-sha256.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `dependencies.json` | `1d282634672fa2309b4967d6f7cafdb2db8311ece6c6fcebf4207a25db146cb1` |
| `final-checks.tar.gz` | `a8fc86db9ddcc4dd7bda7a847ce38588b38d0995d846baf5750074fad967a157` |
| `fixture-expectation-changes.json` | `58e0e69ada12ffb91dce1088abe60ea15fe14785a19074d809148c9a1c4a5ee8` |
| `frozen-proof-comparison.json` | `a06399ed06365b7c86ee460694581aa3a46dfbc4df2f5f21d1642621480ec9c9` |
| `frozen-recipe.json` | `9a5446b61f1434847b3b706aa3523835dbb0524ded607f0af161fa86fa9a1259` |
| `guard-results.json.gz` | `731d99fd88d2b99eb4eb839d18f3e5a63d39060fa191a129d9f4fe87f7d88be6` |
| `guard-tool-reports.tar.gz` | `f665c75c12b8a18cd318227e97476c12d25a7a1de1073b4d536d8df864f7faf5` |
| `index-failure-classification.json` | `bb9848d4adcae29e2b30462868ded05b9f1353233760f3ec70ca55bd1a0656f1` |
| `number-lane.json.gz` | `a747f12933630e65c896f0a114b23180ebdda1363537411b71fde5508f0ee958` |
| `number-selftest.json` | `3e81a92755d356cfe5d3d84cc01c8ed2023ebbe614a4407c93c1789607950754` |
| `proof-bank-comparison.json` | `a1df5b0354a1f1cd1d2a731fea0f16839cd0454eba2a2b03bd1c3aa22f93264d` |
| `regeneration-scope.json` | `4038798c94e9a124eb85c1d621d5a924e02347c531e90dbb77f36ac2f355f4bd` |
| `regrade-citations-final.json` | `1f6398661bcca47bd3883e31039c3b949b4fb2a2da9bb02f0f27a7cca57ca8de` |
| `schema-number-diff.json` | `9cd634c0121363d93e6e49050833177c2b167a838ce932f76b181bbf974e10ed` |
| `source-pins.json` | `c8e2aae2b0729770402d894e3b75b8a6da0d244d657a97400c743a81c614b968` |
| `verification-programs.tar.gz` | `09e5269132fdd99b25c89ac54ac783b1da34b10c9ab4b1f2b55403f25dd35a7f` |
| `verification-summary.json` | `d7edfff7433ae0a4c8b91cb62968389646e3469db0a82ec3162f6f3c7578a02d` |

Heavy runs were serial, detached through long-job, bounded below 90 minutes per group. Starts require ≥13.5 GiB available; runs pause below10 and resume at13.5. The final suites sampled at least 16.67 GiB available; 0 low-memory pauses. Earlier low-memory preparation waited for the start threshold. No browsers, subagents, mailbox, main push, landing lock or governance changes. Both lane push URLs are verified at the delivered head and the worktree is removed after the push. **New IDs: none**; existing allocation remains CV-590–597, SP-575–579, ACD-571–574 and PWIZ-097/098.

---

# Part-1 and earlier report archive (superseded by the sweep result above)

# DCW — sweep part 1 (2026-11-05)

Branch `plans/ea-w2-chain-wizard-20261104`; tested implementation **`d9d930b925946c8c95726c6cb5b492507f11ec95`**; rebased onto `origin/main` **`d5ec2f70c0d69c469796eea9b9cfdae30f281f42`**. Input was cycle-10 head `4a7e59c94270b8a54c5b9e366b561ab697f2a54f`, review `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/reviews/DCW-sol/REVIEW-cycle10.md`. F1–F3 are repaired locally; readiness awaits part 2 and the instructed Sol/Astra review. Each family remains **8 PASS / 3 PARTIAL / 1 ABSENT**. No prepared PASS, admission or native authority is claimed.

## Sweep part 1: findings and responses

Every fixed entry below belongs to commit `d9d930b925946c8c95726c6cb5b492507f11ec95`. Verification outputs are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/sweep-p1/`.

| Item | Where / cause | Fix and verification |
|---|---|---|
| **Deck 4.a** | `Plans/Decision_Log.md:5119` DL-431; `Plans/Contracts_V0.md:24948` CV-596. | Already applied as decided; updated owner citation to the landed DL entry. Landed option: “Attach Blocked to the whole Planning Run. Save it only when the component responsible for planning records a blockage or repair attempt that prevents every otherwise permitted next step. A stalled topic does not block the run if another can continue. Count completed repair attempts for that blockage; add no three-round trigger. You see the whole run’s blockage and report.” `deck-fidelity.json` matches it after only case/whitespace/apostrophe folding. Zero/one/four completed repairs, topic-can-continue and nontrigger cases remain in the real CLI. |
| **Deck 4.b** | `Plans/Decision_Log.md:5139` DL-432; `Plans/Contracts_V0.md:25167` CV-597. | Already applied as decided; updated owner citation to the landed DL entry. Landed option: “Save Unblocked when the responsible planning component records that all required blocking conditions for that same run/topic have cleared. Link the authorized action that actually cleared it to the original blockage. Clearing another topic, opening a page, reprocessing old history or merely editing a report does not count. You see clearance as soon as that work can resume.” Only run/topic resolves to run, as DL-431/432 expressly direct; no successful-next-step requirement is added. `deck-fidelity.json` and the full Unblocked CLI verify this. Jared’s words remain exactly “i approve all of it”; option prose is attributed to the card. |
| **F1** | `scripts/pm_dcw_index_cases.py:57`: the original 54 row/source negatives retained their old digest/frontier/token observations. | Rehash before adding the original `round8_astra_*` cases. Their isolation declarations now name only `index_row_source`; no paired digest cut. All six families × three fields × three read paths refuse `index_row_source`, accept with only that predicate disabled, and still refuse when only `index_row_digest` is disabled. Separate digest-corruption negatives refuse intact and accept with only their digest guard disabled. `targeted-controls.json` and all six full family CLIs verify the real constructors. |
| **F2** | `scripts/pm_dcw_blockage_fixtures.py:308`, `:347`, `:400`, `:444`, `:503`, `:512`: extra commitment, receipt, next-step, action, root or token defects masked the intended failures. | Reissue event commitment and receipt-sequence copies while retaining authentic Storage originals. Build foreign checkpoints as internally coherent complete snapshots. Keep before/cleared action sets coherent; give source-join claims an otherwise valid action. Use unique one-character condition refs for wrong iterable types. Remove logically entailed assertions as described below; keep each enforcing guard and its negative. Both new CLIs and the one-predicate controls pass. |
| **F3** | `scripts/pm_dcw_blockage_fixtures.py:346`; each source schema’s `observation.subject_kind.const`. | Add `whole_run_subject` independently for each family: authenticated observation and stored copy say `topic`, with valid event/episode/receipt/index facts. Intact oracle refuses `schema`; removing only the subject constant in schema/resource/materialized copies accepts that negative and makes the complete family CLI fail its expectation. `targeted-controls.json` records both controls. |
| **Other cycle-10 diagnostics** | Unblocked `foreign_cleared_condition`, `resolution_source_join`, `root_is_latest_update`, and wrong action-container types. | Included in F2: remove subset assertion where exact set equality already implies it; update the original-root negative to the actual chain-root equality; reissue action lookup and coherent condition sets. Same-field repeated writer-policy/token checks, missing-object dereference controls, cyclic-recursion diagnostics and whole-keyword proof defects remain explicitly part-2 inventory work. No whole-lane proof is inferred from these targeted controls. |

**Why redundant assertions were removed (`scripts/pm_dcw_blockage_events.py:124`, `:165`, `:180`):** Blocked requires at least one next step and each step must intersect `required - cleared`, which implies a nonempty required set. Unblocked authenticates that predecessor and includes its requirements, so the same implication holds through the chain. A separate empty-required assertion has no orthogonal witness. Blocked now has an empty-required witness with a real unprevented step; Unblocked retains the isolated `omitted_original_required_condition` predecessor witness and retires its compound empty-set input. Exact `cleared == required` implies the removed Unblocked subset assertion. Equality with the authenticated chain root implies that root is an original blockage rather than an update. Exact `remaining_after == []` implies its removed separate type check. These removals change refusal ordering, not which JSON inputs are accepted; their enforcing predicates and focused negatives remain active. This is the cycle-10 requested elimination of redundant assertions, not a merged removal set.

## Family grades before and after

Counts are PASS / PARTIAL / ABSENT. All 96 status cells are regraded; all 292 supporting quotations were re-located and matched in this tree. `retention`, `compatibility_withdrawal` and `positive_negative_oracles` remain PARTIAL; `membership_version` remains ABSENT. Prepared technical readiness is still withheld for all eight families.

| Family | Cycle 10 | Sweep part 1 |
|---|---|---|
| `bundle.revision_requested` | 8 / 3 / 1 | 8 / 3 / 1 |
| `bundle.revision_started` | 8 / 3 / 1 | 8 / 3 / 1 |
| `bundle.revision_completed` | 8 / 3 / 1 | 8 / 3 / 1 |
| `bundle.revision_interrupted` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.blocked` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.deferred_payload.loaded` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.opened` | 8 / 3 / 1 | 8 / 3 / 1 |
| `wizard.unblocked` | 8 / 3 / 1 | 8 / 3 / 1 |

## Verification

Eight real family CLIs pass: 5951 contract cases, including 477 new-family cases and 433 additional valid-base repair controls. Focused F1/F2/F3 controls pass **252 outcomes**. A repaired valid base is not credited as predicate-isolation proof. Six standing suites cover 1328 outcomes; their inherited check-11 status does not override the explicit pending whole-lane proof. Six registered-schema suites retain genuine `run.started@2.0.0` joins, exact editions/pointers and eager unused-reference closure.

| Serial command/check | Exit |
|---|---:|
| `bundle_revision_requested` | 0 |
| `bundle_revision_started` | 0 |
| `bundle_revision_completed` | 0 |
| `bundle_revision_interrupted` | 0 |
| `wizard_opened` | 0 |
| `wizard_deferred_payload_loaded` | 0 |
| `wizard_blocked` | 0 |
| `wizard_unblocked` | 0 |
| `bundle_revision_requested-standing` | 0 |
| `bundle_revision_started-standing` | 0 |
| `bundle_revision_completed-standing` | 0 |
| `bundle_revision_interrupted-standing` | 0 |
| `wizard_opened-standing` | 0 |
| `wizard_deferred_payload_loaded-standing` | 0 |
| `bundle_revision_requested-registered` | 0 |
| `bundle_revision_started-registered` | 0 |
| `bundle_revision_completed-registered` | 0 |
| `bundle_revision_interrupted-registered` | 0 |
| `wizard_opened-registered` | 0 |
| `wizard_deferred_payload_loaded-registered` | 0 |
| `shards-generate` | 0 |
| `index-generate` | 0 |
| `shards-check` | 0 |
| `index-validate` | 0 |

Plan-index validation top-level status: **pass**. Its complete output has zero failures; node_readiness_status remains blocked_runtime_certification_incomplete. No runtime readiness or governance-currentness claim is made. Regenerated shard families are limited to this lane’s Contracts, Planning Wizard, assistant-chat, Storage, storage-value registry and shared EventRecord schema sources; regenerated-scope.json records them. The copied ignored currentness edition has 15 matching SHA-256 values in `currentness-sha256.json`. The rebase’s only prose conflict was the independent appended PWIZ-038 and PWIZ-097/098 material: both survive, with zero removed main lines in Contracts, Planning Wizard, assistant chat or Storage (`rebase-owner-preservation.json`). Generated conflicts were discarded and regenerated, never hand-merged. The landed PWIZ-038 workflow/clarification cap is preserved; DL-431 adds no event-count threshold.

**Recurring defect classes:** identity/source/actor/receipt/Project forgeries and custody paths run in the full family suites (items 1/2/7); retained read/rebuild after live changes, replay-only history and withdrawal remain tested (3/10a), with the format/number history limitations below; exact-type/descriptor/boolean/container negatives remain active (4/11); unused local/external/transitive refs run in the standing and registered suites (5); complete event/source 16-KiB/SP-337 and restore cases run in every family (6); focused independent guard controls resolve the listed masked inputs without claiming a complete inventory (8); PARTIAL grades preserve remaining limits (9); number spelling/domain and exact original-time profile remain part 2 (10/12/10a). No new serializer, number cap, timestamp grammar or proof framework was added. Native adapters/authentication, actual Storage bytes/CRC, redb CAS/concurrency, append/lost-ack, crash recovery, backup/restore, permission/deletion and retention-boundary campaigns remain **NOT_RUN**.

## Part 2 items (part-1 archive; superseded)

- **SW-N1 / NUMRULE:** `scripts/pm_dcw_event_oracles.py:97–132,147–149,628–661,796,818–820`, CV-590–595 integer/parsed-negative-zero prose, shared envelope/receipt/checkpoint numeric schemas and all five physical source families plus both new families. Adopt CV-1100/SP-1100/SP-1101 at semantic, physical and authenticated original-write boundaries. Preserve full Storage uint64, physical floats and signed zero. No local cap or normalizer.
- **SW-B2 / date-time:** `scripts/pm_dcw_event_oracles.py:688–709`, its format uses, `scripts/pm_dcw_index_cases.py:166–174`, both new families and the legacy validator in `scripts/pm_bundle_revision_events.py:22–30`. Compare DCW’s round-8 grammar with shared **CV-1101**, replacing it if they differ. The cycle-10 evidence already records non-Z offsets accepted and legitimate leap seconds refused; preserve permitted fraction precision, exact retained strings and authenticated original edition/recipe selection. No part-1 grammar change.
- **SW-B3 / shared guard tables:** `scripts/pm_dcw_event_isolation.py:497–526`, historic `DCW.guard-removal.md`, `scripts/pm_dcw_index_cases.py:46–50`, compound `index_read:368`, registered shared-code diagnostic cuts and all new-family predicate sites. Adopt the reviewed shared guard tool and named predicate tables for all eight families; inventory exact clauses and prove same-field duplicates site by site. The old proof remains superseded. The 252 focused controls are not complete guard-table evidence.

No stopped product-choice item remains in this sweep. Existing event/source retention questions stay pending for RT; no new retention choice was made. **New IDs: none.** Existing allocation remains CV-590–597, SP-575–579, ACD-571–574 and PWIZ-097/098. No registry append, admission, Decision Log write, mailbox, subagent, main push or governance seal. The two prescribed memory files were absent at the brief’s Nas1 path; no IDs were minted. Minimum sampled available RAM was **15 GB**; heavy checkers ran serially and pause below 6 GB. The requested worktree is removed after branch push.

## Evidence

Raw outputs and compact regrade summaries: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/sweep-p1/`; `SHA256SUMS` binds retained files. Verification programs remain under `/home/sittingmongoose/PM-Experiments/ea-dcw-sweep1/` and `/mnt/Cursor/PM-Experiments/ea-dcw-sweep1/`, as recorded in `programs-sha256.json`. Temporary Python environments/caches are removed after use. This report and the self-grade are copied to the evidence directory.

| Evidence under the directory above | SHA-256 |
|---|---|
| `targeted-controls.json` | `23454fd5713e444223115d6ef8fe93d361b9a6d69a117d9e69a103a2e8d3ce61` |
| `check-results.json` | `0fc939ad88e939acf4dd05ad5961718674d5eecd7c98943657bdd5dae1d5772b` |
| `deck-fidelity.json` | `8ae52d20b7ff662205d866b01a5e096f0bf43feaa4f5d52c56694b1235fa0e00` |
| `regrade-citations.json` | `fc46586221640705826092ba7a619e989f8d2610ccfdb9c6b749bc987586ea50` |
| `summary.json` | `75183632be12c9371f47c05274be0ed8bd8243761ff349d91d767a934d32c7f3` |
| `currentness-sha256.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `regenerated-scope.json` | `b8a32825f2b8114ec89abe4657c57b68ccaac2a187a09d11338e62e2ac7ed21b` |
| `rebase-owner-preservation.json` | `1540b782ffe4477ace50664a528e463349246c6ed1949829e146b9c7712848e6` |
| `programs-sha256.json` | `5f2c4fdf23c5e0bb3478d3bb63cefec605d7668fb1623c1c7afb9dd2fc5a4a1c` |

## Prior round-10 record (source lineage)

The retained record below describes the earlier head; the sweep findings, current citations and limits above supersede its fixture and readiness claims.

# DCW — round 10, Event Authority

Branch `plans/ea-w2-chain-wizard-20261104`; implementation `6cab86dabf1f306dfed8998f8f312d6b283e112f`; base `21717728039303d923e82b9499c8b700167b3044`. This round applies Jared's deck-2 answers, not a review-fix cycle. Both held families now have complete drafted owner/source/schema/oracle contracts. Each self-grades **8 PASS / 3 PARTIAL / 1 ABSENT**. Full technical prepared PASS remains withheld for shared sweeps; membership remains ABSENT and native execution NOT_RUN. No family is stopped for an unanswered product choice; event-history retention remains explicitly pending as permitted.

## Round 10: deck-2 Card 4.a/4.b applied

**Authority:** Jared's verbatim words are “i approve all of it”. The frozen deck's approve-all mapping selects option A on both items; the explanatory option text is the card's prose, not a Jared quotation. DL-431/DL-432 are on `origin/plans/ea-cards2-answers-20261105`. They are cited, not appended here. Deck SHA-256: `6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30`. Answer/deck paths: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md` and `E-CARDS-2.as-presented-6db25be3.md` beside it.

- **wizard.blocked — prepared without admission:** CV-596 applies DL-431 to the whole PlanningRun under current PWIZ-002, successor of the retired Chain Wizard. A component-recorded blockage/repair observation must prevent every otherwise permitted next step. A stalled topic while another can continue does not qualify. round_count counts distinct completed original repair attempts for this blockage: zero, one and four are exercised, with no three-round trigger. CV-233 minima and route_target/report/transport ownership survive. No retired wizard-status lifecycle is restored.
- **wizard.unblocked — prepared without admission:** CV-597 applies DL-432 to the same whole run/episode. All required conditions must clear; resolution_source links the independently authenticated authorized action that actually cleared the final conditions. Authenticate the latest Blocked predecessor and original blockage, their sources, complete chain and first receipts. Another topic, page opening, reprocessing history, report editing, unauthorized action or partial clearance refuses. Clearance does not wait for a successful next planning step. CV-234 minima survive.

Both families have separate closed payload and physical original-source schemas. Their own original sources are `wizard_blocked_evidence` and `wizard_unblocked_evidence`, typed five-part keys under canonical runs_and_goals. Sources are explicit NEW technical assignments to existing **RP-AUTHORITY-INDEFINITE**, because they are non-rebuildable operation/audit/source-lineage custody containing refs and commitments. This does not choose the event-history policy or linked report/action content lifetime. Existing SP-286 receipt authority and generic index/checkpoint policies remain assigned.

**Only open retention questions:** event retention_policy_ref=PENDING_RETENTION_DECISION.

- **wizard.blocked:** For wizard.blocked event history, which Case L-3 class/lifetime applies: planning/chat content or authority/source-lineage audit, and which release anchor governs deletion?
- **wizard.unblocked:** For wizard.unblocked event history, which Case L-3 class/lifetime applies: planning/chat content or authority/source-lineage audit, and which release anchor governs deletion?

## Twelve-criterion self-grade

| Criterion | wizard.blocked | wizard.unblocked |
|---|---|---|
| `membership_version` | ABSENT | ABSENT |
| `owner_doc` | PASS | PASS |
| `producer` | PASS | PASS |
| `closed_payload_schema` | PASS | PASS |
| `scope_identity` | PASS | PASS |
| `replay_idempotency` | PASS | PASS |
| `retention` | PARTIAL | PARTIAL |
| `redaction_custody` | PASS | PASS |
| `transitions` | PASS | PASS |
| `consumers_checkpoints` | PASS | PASS |
| `compatibility_withdrawal` | PARTIAL | PARTIAL |
| `positive_negative_oracles` | PARTIAL | PARTIAL |

Both were 6 PARTIAL / 6 ABSENT while held. Each is now 8 PASS / 3 PARTIAL / 1 ABSENT. `compatibility_withdrawal` and `positive_negative_oracles` retain B2/B3/SW-N1 qualifications. The six previously prepared families' contracts, source/profile rows, schema/fixture bodies and grade conclusions are unchanged. Their existing 8 PASS / 3 PARTIAL / 1 ABSENT grades carry forward. All 96 cells remain; 292 current exact quotations were mechanically rechecked.

## New bindings, current searches and premises

Per-family searches cover Contracts, Planning Wizard, PRD Builder, assistant chat, Storage, testing and both registries, followed by all top-level owner Markdown at the pinned base. `wizard_blocked-search.json` and `wizard_unblocked-search.json` preserve scope, exact matches, negative evidence and premise checks. No exact current emitter, identity recipe, immutable observation schema, history reader or family checkpoint adoption was found. WM-012/036 supplies broad wiring/compatibility lineage, not this complete technical binding; its historical node projection cannot supply a PlanningRun's runtime node. Current PWIZ-002/CV-233/CV-234 and the approved whole-run answers govern.

For **each family independently**, newly authored bindings are its `emitter.wizard_{blocked|unblocked}@1.0.0`, string-only Project/PlanningRun/blockage/observation identity, original source/key/schema, `reader.wizard_{blocked|unblocked}_history@1.0.0`, source/event overflow references, custody/restore and withdrawal contract. The source and reader names are exact in each owning unit, not a shared contract. Existing projector.storage.event_record_index@1.0.0, reader.storage.event_record_index@1.0.0, SP-278 checkpoint/schema/CAS/complete coverage and DL-076 nine-field durable token are adopted by name. SP-286/CV-339 first full-value v2 custody and SP-337 original bytes are reused. No filtered checkpoint or product action is invented.

DL-045's exact scope still contains both names. DL-076/SP-278 still owns the same token/checkpoint recipe, and SP-286/CV-339 the same original full-value receipt role. Case L-3 still classifies original audit/source-lineage custody indefinite/no-count eviction; no event-history assignment was inferred. No old-answer premise failed.

Shared owner hunks are only the appended CV-596/CV-597 units in Contracts and two materialized source rows/profiles in storage_value_registry. All original Contracts text and registry rows/profiles remain exact. The only existing helper edit adds an optional exact-event validator to index_read/index_content; all source/row/coverage/CAS checks still run. The old six-family dispatch remains the default and its full serial checks pass. Generated shards changed only for these two edited sources; the six aggregate index outputs were regenerated with the copied, hash-matched ignored currentness edition. No generated body was hand-edited.

## Checks and exit codes

| Family CLI, serial | Exit | Contract cases | Valid repair controls |
|---|---:|---:|---:|
| `bundle.revision_requested` | 0 | 822 | — |
| `bundle.revision_started` | 0 | 838 | — |
| `bundle.revision_completed` | 0 | 838 | — |
| `bundle.revision_interrupted` | 0 | 836 | — |
| `wizard.deferred_payload.loaded` | 0 | 1339 | — |
| `wizard.opened` | 0 | 801 | — |
| `wizard.blocked` | 0 | 230 | 207 |
| `wizard.unblocked` | 0 | 244 | 224 |

New-family totals are **474 contract cases plus 431 single-fact repair controls**. A repair control restores the valid original input; it is not predicate-removal proof. The final new suites also prove that receipt-only retry returns the original after live run CAS/predecessor/episode state advances, while missing original custody still refuses. Current admission, permissions, cutoff/drain and replay-policy checks remain. Synthetic sources/Storage observations never establish native issuance.

| Repository check | Exit/result |
|---|---|
| Shard generation | 0 |
| Plan index generation | 0; top-level pass |
| Shard check | 0; top-level pass |
| Plan index validate | 1; top-level fail, 22 diagnostics versus 23 in round 9; zero new |
| Storage profile check | 1; same 41 missing-profile diagnostics as pinned base; zero new |
| Storage recovery self-test | 0; top-level pass |
| Supplementary unused-ref/identity checks | 0; both unused refs refuse, incidental thread does not change identity |
| Preservation and exact quotation checks | 0; all six contracts preserved, 292 exact quotations |

Index diagnostics are pre-existing ledger/removal-ledger issues and DL-302's origin/main comparison, not new family/schema failures. Regeneration removed the old node-readiness mismatch; no clean-index claim is made. Storage-profile baseline replay uses exact registry/index inputs at the pinned base through the unchanged read-only checker. `repository-check-comparison.json` retains the complete comparison. No governance artifact, baseline, source ledger or unrelated owner's file was repaired.

Standing checks and recurring classes: forged IDs, original metadata, retained originals after live changes, one-reading identifiers, eager unused-reference closure, complete event and physical source byte limits, independent predecessor/receipt custody, and wrong-type booleans/arrays/numbers have direct regressions. New negatives reissue their observational source/event/receipt/index copies when their intended fact changes; row/source negatives rehash dependent integrity copies. Synthetic group collisions found during construction were corrected with distinct Storage sequence/group bindings. Current append and caller retry reject projector_replay_only. Encoded project~ partitions are used. Retry semantic comparison excludes Storage-assigned metadata. Actual checkpoint identities/coverage/CAS and durable-token shape are checked; a matching-row maximum never certifies coverage. Failure expectations are asserted and a mismatch exits nonzero. Malformed-zone/separator/calendar/hour/trailing-LF/fraction cases are refused through existing format enforcement.

**Shared sweeps remain open:** B2 replaces existing DCW timestamp enforcement with CV-1101, preserving original historical strings and valid leap/fraction rules. B3 adopts pm_guard_isolation.py; no local proof script was rebuilt or run, no removal set merges distinct predicates, no complete check-11 inventory is claimed. SW-N1 adopts CV-1100/SP-1100/SP-1101 at existing semantic/physical/historical boundaries. Supplementary observations record 1, 1.0, 1e0, -0, 01, wide integers and physical signed-zero refusal without adding a cap, serializer or normalization. No uint64-to-2^53 narrowing or new date-time grammar was added. Retained recipe dispatch is not tightened locally. A real fixture or product-guard defect remains lane work; the sweep labels never excuse it.

Native planning/source adapters, authentication, original Storage bytes/CRC, redb CAS/concurrency, append/lost-ack, crash recovery, backup/restore, permission/deletion and retention-boundary campaigns remain **NOT_RUN**.

## IDs, delivery and evidence

New PlanUnit IDs: **CV-596, CV-597**, within the lane block; all fetched origin branches were searched first. Cited approval IDs: **DL-431, DL-432**; preserved minima **CV-233, CV-234**. Existing lane IDs remain CV-590–595, SP-575–579, ACD-571–574 and PWIZ-097/098. No new SP/PWIZ/admission/Decision Log IDs were minted.

All evidence below is under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/`; final report and self-grade are copied there. Per-command outputs and their SHA-256 values are in commands.json. Resource gates started with 114 GB free / 9 GB available, and every family checker ran alone with at least 6 GB available; a dip below 6 would pause for two-minute rechecks until 7 GB. No mailbox, subagent, browser/server, main push, landing lock, governance reseal, registry admission or Decision Log write. Push only the assigned branch; remove `/home/sittingmongoose/pm-worktrees/DCW-r10` with literal-path git worktree remove --force once pushed.

| Evidence | SHA-256 |
|---|---|
| `r10/summary.json` | `023c8d8f14300a3fbaac29cbaccbdae206efc2d1ef30dd36b076c3053632b33f` |
| `r10/commands.json` | `17fe06d9202f2800f9c3b6a258bfc974526af00d415a44010ea312facb4033e8` |
| `r10/repository-check-comparison.json` | `5164b9afc333f7f2c2fc78d6cad10ff95ea152abefd3c298a83925610029fc30` |
| `r10/preservation.json` | `4557b45888baf0e0d4d3ac07373989f63f052dfb3dc60dce6733b8f49b5a6dd0` |
| `r10/regrade-citations.json` | `46a06de8856c8b8453e82c4ccb84fb08866e0d20157efc1d9501b674bece573d` |
| `r10/currentness-sha256.json` | `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b` |
| `r10/id-search.json` | `c29316b272f168e177f7e9be1382d325462838c738a23bcba21e0b60af9c17dd` |
| `r10/wizard_blocked-search.json` | `1c215756bf4a5e8914ad123c3361fc81a772f8613a68beec477ccb643ce125ef` |
| `r10/wizard_unblocked-search.json` | `20f0e38549a3294226aa22014d80ee05b871a59b2f02b0507cde88efee2290ff` |
| `r10/supplementary.json` | `e6e00866a8a0f99bb17545690c3213923fe2ec3d67890bcf723712201050e96e` |

## Round 9 archive — held-family dispositions below are superseded by round 10

Branch `plans/ea-w2-chain-wizard-20261104`; implementation `0f0a41de7ff79a1d9c097284a514138abc899ae6`; final focused controls `a6e652c86c3df3f93efa6530cf6a93b48a49028d`; reviewed head `92276eeff0c6ef8a7f3bd3946a1fdd786567ff8d`. Scope B1. All six B1 family repairs pass. Membership ABSENT, retention PARTIAL and native NOT_RUN remain. Full technical prepared PASS is withheld while B2/B3 sweep evidence is incomplete; both held Wizard families remain held.

## Review round 9: findings and responses

- **B1 — fixed (0f0a41de7ff79a1d9c097284a514138abc899ae6; controls a6e652c86c3df3f93efa6530cf6a93b48a49028d). Where:** `scripts/pm_dcw_event_oracles.py:804–807` called an embedded `payload_schema` on the ordinary registered `run.started` row. **Why:** the registry's actual contract is `payload_schema_ref.path/json_pointer/schema_id`; complete global captures necessarily contain nonmatching families and Projects. **Fix:** `scripts/pm_dcw_registered_schemas.py:108` resolves that exact path and RFC6901 pointer, checks both registered and selected schema IDs, validates with the offline resource registry, and eagerly checks the full closure at `:77`, including unused definitions in external documents. Exact scope/ID editions are selected from registry metadata; the seven owner-supported historical pointers are explicitly bound to Storage's existing v1-reader table (`Plans/storage-plan.md:18130–18144`). No lexical version fallback or arbitrary `$defs` discovery grants support. The generic scan preserves and validates originals; it does not emit a transient run-start consumer view or run its upgrader. The run-start-specific consumer retains its separate upgrade obligations (`:19831`). All captured records remain in coverage and row/source joins; no skip or registry field was added.
- **B2 — sweep, unmodified by instruction. Where:** `scripts/pm_dcw_event_oracles.py:688–709`, its format uses at `:45–52`, `:205`, `:801`, and round-8 positives `scripts/pm_dcw_index_cases.py:164–172`. **Why:** non-Z persisted offsets pass despite CV-253 (`Plans/Contracts_V0.md:2895,15894–15906`); the valid `1990-12-31T23:59:60Z` fails, including retained originals. **Fix owner:** adopt shared CV-1101 on `plans/ea-numrule-20261105`; preserve exact original strings, permitted fractions and historical dispatch. No local timestamp grammar, cap, uppercase-T rule or historical normalizer was added. The independent replay retains the offset/leap-second observations; they are not credited as fixes.
- **B3 — sweep, unmodified proof machinery by instruction. Where:** `scripts/pm_dcw_index_cases.py:46–53`, `scripts/pm_dcw_event_isolation.py:497–526`, and the old guard table. **Why:** row/source equality and row-set digest integrity are different fields/predicates; a common refusal code or compound enforcement site does not make them duplicates. **Fix owner:** adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`. The report/table now withdraw the old complete check-11 claim. No proof script is rebuilt or re-run. New B1 baseline negatives and single-fact repairs exercise the full checker. Diagnostic cuts in the focused runner include a shared-code dispatch selector; neither those cuts nor the old script receive predicate-isolation credit. Shared-tool adoption also replaces that diagnostic selector; no whole-lane inventory is claimed. Existing round-8 unrehashed stress cases are not credited as isolated proof. Their coherent rehashed variants remain the source-join witnesses. Any fixture masking exposed during shared-tool adoption must be repaired, not relabelled a duplicate.
- **SW-N1 — number-domain sweep. Where:** `scripts/pm_dcw_event_oracles.py:97–132,147–149,628–661,796,818–820`; `Plans/event_record.schema.json:94–100,200–205`, shared receipt/checkpoint and lane source/payload numeric positions. Adopt CV-1100/SP-1100/SP-1101 at each actual semantic, physical and authenticated historical recipe boundary. The independent replay records `1`, `1.0`, `1e0`, `-0`, `01` and wide integers. No new cap/serializer was added. Preserve full uint64 Storage metadata, physical floats and signed zero. This is nonblocking sweep work, not a local type-equality exemption.

## Mixed-source positives and isolated new negatives

`scripts/pm_dcw_registered_cases.py:33` imports the genuine `run.started@2.0.0` original from `Plans/event_index_consumer_adoption_fixtures.json#/positive/both_full_owner_joins/generic/current_source/frames`. Only its synthetic Storage-order sequence is placed immediately after the DCW originals. Its payload, original identity, Project and timestamps stay exact. Both Projects use their encoded `project~` partitions. Complete source bytes, rows, manifest/anchor/frontier, transactions and tokens are issued coherently before each mutation.

**18/18 genuine v2 positives accept**: six families × read/rebuild/compatibility_read. **18/18 separate synthetic v1 original-reader positives accept** through the exact owner-supported pointer; they claim no native historical admission or v2 upgrade. **90/90 new event negatives refuse**: wrong schema ID, unsupported version ID, wrong payload version, extra current payload property and extra historical payload property, on all three paths for all six families. Each changes one fact and reissues dependent capture bindings.

The focused runner adds **342 full-CLI reference/closure observations**: 90 positives (a real external schema closure, an escaped non-root pointer, a definition carrying `properties.schema_id.const`, an array pointer and exact scope-edition selection), plus 252 expected refusals (reference schema ID, path, missing/malformed-prefix pointer, foreign scope edition, malformed pointer escape with an otherwise present target, selected `$id`/schema-ID constant, signed/leading-zero array indices, unused local/external references, a transitive unused reference and actual external-target validation). **252 single-fact repair controls accept**; 54 unused-reference closure-cut controls accept. The dispatch/version/additional-property diagnostic cuts are retained as observations only, with zero check-11 proof credit; B3 governs predicate isolation. Overall focused evidence: **1278 outcomes**, all matched. The full CLI is fixture-selected for these input perturbations; no product semantic guard, preflight or native obligation is bypassed in its negative runs.

The six adapted independent reviewer programs additionally reproduce **18/18 B1 current registered-source accepts**, zero unmatched expectations, all previous identity/custody/byte-boundary counterexamples, and the unchanged B2/B3 observations. Counts overlap the family suites and are not independent native campaigns.

## Family grades before and after

Before is the cycle-9 independent re-grade, not the superseded fix8 self-grade. After restores only `consumers_checkpoints` for B1. `compatibility_withdrawal` remains PARTIAL for B2; `positive_negative_oracles` remains PARTIAL for B2/B3. Retention is still PARTIAL and membership ABSENT. All other normative cells retain their current supported grade.

| Family | Before cycle 9 | After round 9 | Full / total static cases |
|---|---|---|---:|
| `bundle.revision_requested` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 785 / 822 |
| `bundle.revision_started` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 790 / 838 |
| `bundle.revision_completed` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 791 / 838 |
| `bundle.revision_interrupted` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 789 / 836 |
| `wizard.deferred_payload.loaded` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 1339 / 1339 |
| `wizard.opened` | 7 PASS / 4 PARTIAL / 1 ABSENT | 8 PASS / 3 PARTIAL / 1 ABSENT | 801 / 801 |
| `wizard.blocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared | not run |
| `wizard.unblocked` | 6 PARTIAL / 6 ABSENT | unchanged; held for Jared | not run |

All 96 cells are retained in the self-grade; **304 exact current quotations** are rechecked at their cited line spans. No all-criteria prepared PASS, admission or native execution is inferred from static success.

## Checks and limits

| Check | Exit/result |
|---|---|
| Six sequential full family CLIs | 0 each; 5295 full / 5474 total cases |
| Six sequential standing suites | 0 each; authored 66/66 cells remain subject to the independent B2/B3 overrides |
| Six final focused registered-schema suites | 0 each; 1278 matched outcomes |
| Six independent reviewer replays | 0 each; 2052 recorded outcomes; zero unmatched |
| Storage recovery self-test | 0; top-level pass |
| Shard check | 0; top-level pass |
| Plan index validate | fail; 23 diagnostics; no clean-index claim |
| Quotation/preservation/diff checks | pass; canon, schemas, fixtures and all previous cases unchanged |

The index readiness diagnostic raised in cycle 9 remains an integration item. The ignored currentness edition was copied and hash-matched; no index generation, governance repair or baseline change is used to excuse the diagnostic. This lane does not land. The grade and report carry the limitation.

Standing checks 1–6 and 8 retain their full serial regressions. Check 7 now includes the actual registered mixed source; check 9 includes selected schemas' full reference closure. Check 10 retains its B2 qualification and check 11 its B3 qualification. Prior claims of 146 sites/4,656 negatives/906,471 comparisons are historical, superseded proof claims. Recurring forged identity, assigned metadata, contradictory joins, multiple readings, unused references, complete stored-value sizes, custody and wrong-type regressions are retained and rerun. Number spellings/history recipes remain SW-N1. Formats remain B2. The new single-defect fixtures and focused controls do not certify the old proof inventory.

Synthetic source adapters, CURRENT/manifest codecs, frame CRC, real redb snapshots/CAS/fences and native authentication remain NOT_RUN. Unsupported versions refuse complete coverage; supported nonmatching records are never dropped. No history read performs a writer effect.

## Holds, authority and IDs

**wizard.blocked:** Jared still must identify the actual current PlanningRun/topic subject and blocked/remediation emission predicate, including the source of `round_count` (CV-233, `Contracts_V0.md:14896`; `Planning_Wizard.md:116`; `assistant-chat-design.md:3524`). **wizard.unblocked:** for that same episode, Jared must identify the matching authorized resolution boundary and its `resolution_source`/causality mapping (CV-234, `Contracts_V0.md:14944`). Answers remain PENDING. No three-round threshold or retired wizard-status lifecycle is revived.

DL-045/current owner, SP-278/DL-076 and SP-286/CV-339 premises remain unchanged. Initial per-family search lineage is in `drafts/DCW/base-family-search.json` and `fix1-wizard-search.json`; this fix authors no producer, consumer, checkpoint or other product binding. Existing IDs only: **CV-590–595, SP-575–579, ACD-571–574, PWIZ-097/098 (17); no new PlanUnit IDs.** `round9_*` names identify fixture cases only.

No owner Markdown/schema/registry/fixture, Decision Log, admission, Spec Lock, generated shards/index/evidence, frozen validator, test file or .gitignore was changed. Owner Markdown was unchanged, so no derived regeneration was required. No mailbox, subagent, browser, server, main push, landing lock or reseal. Disk was 60 GB free and memory 16 GB available before worktree creation; checker starts and pauses are recorded in commands.json. All checkers ran serially. Push only the assigned branch; remove `/home/sittingmongoose/pm-worktrees/DCW-fix9` with a literal-path worktree removal after the final push.

## Review lineage and evidence

Round 8's report and self-grade remain in git at `92276eeff0c6ef8a7f3bd3946a1fdd786567ff8d` and externally in `drafts/DCW/fix8/`. Its guard claims are superseded by cycle 9 and this report. Round 9 raw evidence is outside the repository at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DCW/fix9`; all final files are bound by SHA256SUMS. Adapted reviewer code changes only ROOT and output location.

| Evidence under fix9/ | SHA-256 |
|---|---|
| `commands.json` | `6cdb77c3f37ecf79e2a3ae5a8b345ba93a0ae6873163a2fda458852e94eb41b0` |
| `summary.json` | `d90760a074f37049fb7256d8d123696a5f8c131ccb5d1cb4ed3f39592c26e945` |
| `source-closure.json` | `9ab2140956289b390a845daf1180852c8023633beba67523525e6f1a5bf3c74c` |
| `regrade-citations.json` | `e76c6366d3a98f9e3ed16599159604a01e379b2b7f700cdf6316124633bca198` |
| `currentness-sha256.json` | `ce7bebfff8362953a3ebb92fba9e37235d771ca442f282a4ac1d40d9644a69ab` |
| `index-comparison.json` | `87989a1469468331a7ab8fc6ccdfb0b770594bd47d6d01939ab96ecbeb39189f` |
| `index-validate.log` | `118696124108a2f4bdff1d08084c421a1a985517d35c2f401e418a66a308990e` |
| `shard-check.log` | `353b434b8f99c23e82801aee68941ecef36e9fc71638a6bce463523cd6b01ade` |
| `storage-check.log` | `e56e543c18588569abd7a299f25004750f6954e919c5571c6a669b38668eca1a` |
| `preservation.json` | `a2e59fb79dc526b88c3de14be164f4acafb0590c8eb305e71213bdfeaf2d38d6` |
