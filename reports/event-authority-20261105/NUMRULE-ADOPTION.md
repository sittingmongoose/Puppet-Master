# NUMRULE adoption guide

Shared owners: `CV-1100` (current tokens/types and qualified semantic recipes), `SP-1100` (physical/profile domains), `SP-1101` (authenticated original selection). Keep the exact existing profile owner beside each reference: `CV-317`, `CV-339`, `CV-366`, `SP-026`/`SP-236`, `SP-278`, `SP-286`, `SP-337`, or the named Goal/local-source unit.

## Shared calls

- Parse raw input with `loads_current_json`; call `current_integer(value, minimum=..., maximum=...)` at every schema integer slot, including nested slots. `loads_exact` retains `JsonNumber` tokens for schema-directed callers; it does not choose a history recipe. `storage_uint64` is only for owner-declared uint64 fields. No blanket integer walk over an entire joined event or checkpoint.
- Replace shared producer surrogates with `producer_semantic_bytes` / `producer_semantic_digest`. They use the unchanged full producer projection. Use `qualified_jcs` for another actual JCS preimage only; declare `type_sensitive_paths` wherever the source owner distinguishes numeric types/sign. Validate the full original schema and future/successor domains separately. Unsupported encoding is an existing route refusal before effects, never a source-schema cap.
- Use `storage_value_bytes` / `decode_storage_value` with exact `EVENT_VALUE`, `APP_PHYSICAL`, or `INDEX_BINDING`. SP-278 dispatch reuses `pm_event_index_binding.binding_bytes`. `full_value_commitment` implements the unchanged CV-339 tuple. These are static reference codecs, not native I/O/authentication. App binary is legal only in schema-declared fields; EventRecord disallows binary.
- Compose `RetainedDispatcher` with the genuine original owner's `authenticated_original` and the exact immutable `RecipeTuple` → `FrozenRecipe` map outside request data. `resolve` gets one original selection; the frozen verifier recomputes all original joins, hashes and identities with its original resources. No current-then-legacy probing. `OriginalCustody` is an internal return type, never a caller credential. Native custody integration remains required. Current disclosure and current request admission stay separate; `current_append_policy` must not run on a retained original.
- Preserve every local recipe ID/preimage/prefix/tuple position/field type. Never replace Goal/DT exact source JSON, CV-366 typed trees, payload BLAKE3 or physical hashes with EventRecord JCS. Run the shared corpus through each complete lane checker and history/retry/first-receipt/checkpoint/inline/reference paths, then the lane's own guard-removal suite.

## Per-lane replacements

The targets below are section 5 of the pinned design, not edits to those branches. Re-read a changed branch before adoption; line numbers are deliberately omitted in favor of exact function names. Every drafting lane cites all three new shared units plus its existing owners below.

### DS

Pinned `plans/ea-b1-seal-blockers-20261104` at `25c568598fa3ff1028a95c326c885474ffd7dcd1`.

- **scripts/pm_event_payload_route.py:** `numeric_representation_errors`, `encode`, `resolved_body`, `resolved_event`.
- **scripts/pm_home_layout_v2_slot_receipt.py:** `canonical_json`, `canonical_msgpack`, `decode_canonical_msgpack`.
- **scripts/pm_event_authority_ds_round3.py:** `build`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-332`; `Plans/storage-plan.md`: `SP-319`, `SP-323`, `SP-353`, `SP-400`; `Plans/assistant-chat-design.md`: `ACD-459`.

**Adoption:** Make current integer-token refusal cite CV-1100; dispatch physical event encoding through SP-1100 without changing retained float bytes. Replace bounded canonical_json uses only where they claim shared RFC8785 semantics; preserve separately owned local hashes. Bind the existing v1/v2/v3 selection to authenticated original issuance/edition under SP-1101. Keep the v3 payload-reference work as its own already-drafted envelope successor; this survey grants no adoption/admission.

### DC

Pinned `plans/ea-collab-prep-20261104` at `d6f7d7cd788313d613cc5341f2c295e82467cf56`.

- **scripts/pm_collaboration_events.py:** `canonical`, `jcs`, `subject_values`, `owner_operation_id`, `producer_digest`, `historical_rejection`, `envelope_rejection`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-460`, `CV-462`, `CV-463`, `CV-464`, `CV-465`, `CV-466`, `CV-467`, `CV-468`, `CV-469`, `CV-470`, `CV-472`, `CV-473`, `CV-474`, `CV-475`, `CV-477`, `CV-478`; `Plans/storage-plan.md`: `SP-460`, `SP-461`, `SP-462`, `SP-463`, `SP-464`, `SP-465`, `SP-466`, `SP-467`, `SP-468`, `SP-469`, `SP-470`, `SP-471`, `SP-472`, `SP-473`, `SP-474`, `SP-475`, `SP-476`, `SP-477`, `SP-478`.

**Adoption:** Keep local subject tuples/domain strings exact; use shared exact integer-token parsing before subject decimalization. Use actual RFC8785 only for a preimage the EventRecord owner calls RFC8785, with original-number exactness qualification. Do not relabel payload-only producer_digest as generic producer_semantic_digest. Select older canonical/identity helpers by authenticated original edition, not current write_epoch context alone; record the historical source recipe in the owner adoption map.

### DG

Pinned `plans/ea-goal-depth-20261104` at `686382d06164df5f7296f4d6af1ab8f9d16f734e`.

- **scripts/pm_goal_oracle_common.py:** `canonical`, `revision_text`, `integer_number`, `number_codec_checks`, `semantic_digest`.
- **scripts/pm_goal_current_writer_oracles.py:** `recipe`.
- **scripts/pm_goal_run_stop_block_oracles.py:** `recipe`.
- **scripts/pm_goal_history_reader_fixtures.py:** `history_guards`, `original_row_guards`.
- **scripts/pm_goal_lifecycle_successor_oracles.py:** `identity`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-420`, `CV-421`, `CV-422`, `CV-423`, `CV-424`, `CV-425`, `CV-426`; `Plans/storage-plan.md`: `SP-420`, `SP-421`, `SP-422`, `SP-423`, `SP-424`, `SP-425`, `SP-426`, `SP-427`, `SP-428`, `SP-429`, `SP-430`, `SP-431`, `SP-432`, `SP-433`; `Plans/Goal_Runtime_System.md`: `GRS-200`, `GRS-201`, `GRS-202`, `GRS-203`, `GRS-204`, `GRS-205`, `GRS-206`, `GRS-207`.

**Adoption:** Keep GRS-064 arbitrary-precision Goal-source bytes and each exact revision-as-string identity tuple. Split generic EventRecord JCS from Goal/local fixture JSON; add exact-token parsing and codec-route refusal without capping Goal revisions. History must resolve the original schema/recipe map, not recanonicalize old rows using the newest normalize helper.

### DCW

Pinned `plans/ea-w2-chain-wizard-20261104` at `cdc9d4a94878868c9a2c67439bdf28ea5e5168f0`.

- **scripts/pm_dcw_event_oracles.py:** `canonical_json`, `canonical_msgpack`, `semantic_digest`, `original_receipt`.
- **scripts/pm_dcw_event_fixtures.py:** `seal_originals`.
- **scripts/pm_dcw_event_numeric_cases.py:** `cases`.
- **scripts/pm_dcw_opened_custody_cases.py:** `cases`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-590`, `CV-591`, `CV-592`, `CV-593`, `CV-594`, `CV-595`; `Plans/storage-plan.md`: `SP-575`, `SP-576`, `SP-577`, `SP-578`, `SP-579`; `Plans/assistant-chat-design.md`: `ACD-571`, `ACD-572`, `ACD-573`, `ACD-574`; `Plans/Planning_Wizard.md`: `PWIZ-097`, `PWIZ-098`.

**Adoption:** Remove lane-authored pm-uint changes from frozen shared compatibility readers; centralize current token/type checks. Keep unsigned fixture MessagePack only for schema-proven uint slots; full-event commitments use the general Storage codec. Replace semantic_digest sorted-json surrogate with qualified JCS. Add retained integral-float/original-version positives independently of current refusal and authenticate recipe selection.

### DCH

Pinned `plans/ea-w2-chat-20261104` at `c21fa62e507de04c5970fb51aabb9c841182dfed`.

- **scripts/pm_dch_events.py:** `historical_read_valid`, `body_bytes`, `input_types_valid`, `identity`, `retry_outcome`.
- **scripts/pm_dch_round5_oracles.py:** `cases`.
- **scripts/pm_dch_round6_oracles.py:** `cases`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-630`, `CV-631`, `CV-632`, `CV-633`, `CV-634`, `CV-635`, `CV-636`, `CV-637`, `CV-638`, `CV-639`, `CV-640`, `CV-641`, `CV-642`, `CV-643`, `CV-644`, `CV-645`, `CV-646`; `Plans/storage-plan.md`: `SP-610`, `SP-611`, `SP-612`, `SP-613`, `SP-614`, `SP-615`, `SP-616`, `SP-617`, `SP-618`, `SP-619`, `SP-620`, `SP-621`, `SP-622`, `SP-623`, `SP-624`, `SP-625`, `SP-626`; `Plans/assistant-chat-design.md`: `ACD-610`, `ACD-611`, `ACD-612`, `ACD-613`, `ACD-614`, `ACD-615`, `ACD-616`, `ACD-617`, `ACD-618`, `ACD-619`, `ACD-620`, `ACD-621`, `ACD-622`, `ACD-623`, `ACD-624`, `ACD-625`, `ACD-626`; `Plans/Automated_Testing_System.md`: `ATS-305`.

**Adoption:** Delete blanket safe ceilings on Storage sequence/epoch/receipt/checkpoint metadata; restore their actual uint64 domain. Remove family-conditioned maximum from generic event_record.schema.json. body_bytes must preserve float type and signed zero under SP-236. Current integer-token grammar is separate from both physical codec and historical decoder. Freeze then-valid schema/recipe resources for old records; current JCS qualification only covers producer-owned fields, never Storage-assigned metadata.

### DCO

Pinned `plans/ea-w2-coordination-20261104` at `855df1ccc1c38d57ea2c2204d610eaf8538bb6e7`.

- **scripts/pm_coordination_events.py:** `canonical`, `event_id_preimage`, `producer_digest`, `static_payload_rejection`, `envelope_rejection`.
- **scripts/pm_coordination_wave2.py:** whole companion audit.

**Existing owner units:** `Plans/storage-plan.md`: `SP-540`, `SP-541`, `SP-542`, `SP-543`, `SP-544`, `SP-545`; `Plans/orchestrator-subagent-integration.md`: `OSI-650`.

**Adoption:** Validate exact integer tokens before decimalizing epoch/revision; do not change SP-320 string-array preimage or heartbeat threshold. Separate local payload hash from generic producer JCS. Cite shared physical/token/history owners and add original-recipe lookup to reused coordination retained readers. DO carries another modified copy of pm_coordination_events.py: integrate these edits once, then exercise both consumers.

### DDBG

Pinned `plans/ea-w2-debug-20261104` at `dd186623ab2cc2809ea5992fd2fcaac362eb1d60`.

- **scripts/pm-debug-investigation-events.py:** `semantic_digest`, `candidate_refusal`, `identity`.
- **scripts/pm-debug-investigation-standing-checks.py:** `main`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-570`, `CV-571`, `CV-572`, `CV-573`, `CV-574`, `CV-575`, `CV-576`, `CV-577`, `CV-578`; `Plans/storage-plan.md`: `SP-570`; `Plans/Automated_Testing_System.md`: `ATS-285`.

**Adoption:** Replace semantic_digest Python serialization with shared qualified RFC8785 over exactly its existing projection. Apply current integer-token checks before schema/identity/append and leave string-only identity tuple unchanged. Add retained original numeric-recipe resources, large metadata positives and downgrade refusals to fixtures/standing checks.

### DX

Pinned `plans/ea-w2-executor-20261104` at `578ca65028307887448bb0c2280d095dc565bacc`.

- **scripts/pm_executor_event_semantics.py:** `canonical`, `validate_canonical_domain`, `digest`, `payload_bytes`, `validate_history`, `validate_capture`.
- **scripts/pm_executor_event_contracts.py:** `main`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-368`; `Plans/Executor_Protocol.md`: `EP-132`; `Plans/storage-plan.md`: `SP-353`.

**Adoption:** Replace int(float(n)) equality alone with original-value AND output-decimal exactness qualification where owner requires mathematical identity; 2^60 demonstrates that those are different checks. Do not route entire retained source/custody through current JCS input validation. Keep source-owner local and physical domains separate. Shared JCS helper serves only actual JCS preimages; original history resolves a frozen recipe and all full-value bytes use SP-236.

### DFM

Pinned `plans/ea-w2-filemanager-20261104` at `f70cb3ad5a883de839c27012c90a2b8ee156149a`.

- **scripts/pm-filemanager-event-contracts.py:** `synchronize_fixture`, `fixture_event`, `validate_historical_operation`, `identity`, `same_value`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-560`; `Plans/storage-plan.md`: `SP-560`; `Plans/FileManager.md`: `F-150`, `F-151`, `F-152`, `F-153`, `F-154`, `F-155`, `F-156`, `F-157`, `F-158`, `F-159`, `F-160`, `F-161`.

**Adoption:** Change all three producer-semantic digest sites together to shared qualified JCS. Keep exact typed full-value equality, original source hashes and physical MessagePack independent. Add authentic retained recipe selection before historical digest verification; keep schema-proven string-only identity recipe exact and add non-ASCII conformance controls rather than calling Python JSON general JCS.

### DF

Pinned `plans/ea-w2-filesafe-20261104` at `233112bf6aa6f47bb1c58bf36bb7e6731625c07a`.

- **scripts/pm_filesafe_event_contracts.py:** `identity`, `payload_bytes`.
- **scripts/pm_filesafe_event_authority.py:** `decode_original`, `event_payload`, `application_original_failures`.
- **scripts/pm_filesafe_guard_isolation.py:** whole companion audit.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-550`, `CV-551`, `CV-552`, `CV-553`, `CV-554`, `CV-555`, `CV-556`, `CV-557`, `CV-558`; `Plans/storage-plan.md`: `SP-550`, `SP-551`, `SP-552`, `SP-553`, `SP-554`, `SP-555`, `SP-556`, `SP-557`, `SP-558`.

**Adoption:** Use the shared numeric decoder/recipe dispatcher for any generic EventRecord JCS and full-value bytes; preserve declared integer-only local source domains and string versions. Pin original source codec/edition through authentic storage custody before decode_original. Keep existing fail-closed authority boundaries and add retained former-type/large-integer controls plus current grammar negatives.

### DG6A

Pinned `plans/ea-w2-gui-concerns-20261104` at `ab06fd3d6873e6f42fd0873b8edebfe6147f1c3f`.

- **scripts/pm-dg6a-domain.py:** `integer_token`, `loads`, `semantic_numbers`, `instant_key`.
- **scripts/pm-alert-event-contracts-check.py:** `producer_digest`, `historical_guards`.
- **scripts/pm-dg6a-domain-check.py:** `run`.
- **scripts/pm-dg6a-guard-check.py:** `history_matrix`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-680`, `CV-681`, `CV-682`, `CV-683`, `CV-684`, `CV-685`, `CV-686`; `Plans/storage-plan.md`: `SP-660`, `SP-661`, `SP-662`, `SP-663`, `SP-664`, `SP-665`, `SP-666`; `Plans/FinalGUISpec.md`: `F3-700`, `F3-701`, `F3-702`, `F3-703`, `F3-704`, `F3-705`.

**Adoption:** Keep exact timestamp comparison and current integer grammar, cite CV-1100 instead of repeating safe ceilings. Bound only an actually owner-bounded field; qualify producer JCS route rather than redefining logical integer domains. Retain original schema type/format/number validation on history, with new current guards excluded. Add authenticated recipe evidence plus former-valid integral-float/large-metadata history positives.

### DMEM

Pinned `plans/ea-w2-memory-maintenance-20261104` at `e6703d144e85ddd7e566729848666656dfe6f14e`.

- **scripts/pm_memory_maintenance_events.py:** `json_numbers`, `canonical_numbers`, `digest`, `retained_digest`, `historical_binding`, `read_canonical_history`.
- **scripts/pm_memory_guard_isolation.py:** `canonical_history_cases`.
- **scripts/pm_memory_archive_events.py:** `read_history`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-650`, `CV-651`, `CV-652`, `CV-653`, `CV-654`, `CV-655`, `CV-656`, `CV-657`, `CV-658`, `CV-659`; `Plans/storage-plan.md`: `SP-630`, `SP-631`, `SP-632`, `SP-633`, `SP-634`, `SP-635`, `SP-636`, `SP-637`, `SP-638`, `SP-639`; `Plans/assistant-memory-subsystem.md`: `AMS-100`, `AMS-101`, `AMS-102`, `AMS-103`, `AMS-104`, `AMS-105`, `AMS-106`, `AMS-107`.

**Adoption:** Retain exact Decimal token parsing, then enforce the shared current integer grammar rather than silently normalizing forbidden spellings. Remove blanket safe caps from Storage metadata and all frozen compatibility/historical schemas. Split local source/result hashes, generic EventRecord JCS and full-value MessagePack. retained_digest must select the authenticated original recipe before current admission validation; add retained >2^53 and former-integral-float positives with valid original hashes.

### DO

Pinned `plans/ea-w2-orchestrator-20261104` at `97064e1c914377d7d9c0c5ac5915724b7e575f1a`.

- **scripts/pm_orchestrator_event_oracles.py:** `number_domain_errors`, `number_token_errors`, `canonical_loads`, `number_rule_for_record`, `record_number_errors`, `semantic_digest`, `historical_read_errors`, `recipe_witness_value`, `record_recipe`, `retry_outcome`.
- **scripts/pm-orchestrator-event-contracts.py:** `identity`, `historical_identity`.
- **scripts/pm_coordination_events.py:** `canonical`, `event_id_preimage`, `producer_digest`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-740`, `CV-366`; `Plans/orchestrator-subagent-integration.md`: `OSI-680`, `OSI-681`, `OSI-682`, `OSI-683`, `OSI-684`, `OSI-685`, `OSI-686`, `OSI-687`, `OSI-688`, `OSI-689`, `OSI-690`, `OSI-691`, `OSI-692`, `OSI-693`, `OSI-694`, `OSI-695`, `OSI-696`, `OSI-697`, `OSI-698`, `OSI-699`, `OSI-700`, `OSI-701`, `OSI-702`, `OSI-703`, `OSI-704`; `Plans/storage-plan.md`: `SP-720`, `SP-721`, `SP-722`, `SP-723`; `Plans/Automated_Testing_System.md`: `ATS-360`.

**Adoption:** Reuse explicit recipe-evidence structure as an input from genuine original Storage/owner authority, never caller-selectable verified/self-hash flags. Cover producer semantic and physical profiles as well as identity. retry_outcome still calls the current number gate; original receipt resolution needs the same authenticated original-recipe handling rather than an implicit current-only rehash. Replace library safe-int ceiling as a global rule with central owner exactness qualification. Keep existing old/new DO recipe bytes frozen, including app original-operation identity. Reconcile carried coordination helper with DCO once.

### DG6B

Pinned `plans/ea-w2-plugins-personas-github-20261104` at `0c92d2e91ed2a34391d16b7796de7883c190a2a0`.

- **scripts/pm-dg6b-event-contracts.py:** `same_value`, `identity`, `record_contract`, `history_contract`, `historical_storage_contract`.
- **scripts/pm_dg6b_full_oracles.py:** `rebuild`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-691`; `Plans/storage-plan.md`: `SP-670`, `SP-671`, `SP-672`; `Plans/Personas.md`: `P-120`, `P-121`, `P-122`, `P-123`, `P-124`, `P-125`; `Plans/Plugins_System.md`: `PLUG-131`, `PLUG-132`, `PLUG-133`, `PLUG-134`, `PLUG-135`, `PLUG-136`, `PLUG-137`, `PLUG-138`; `Plans/GitHub_API_Auth_and_Flows.md`: `GAAAF-077`, `GAAAF-078`, `GAAAF-079`, `GAAAF-080`, `GAAAF-081`.

**Adoption:** Use central exact integer-token checks and qualified JCS on only producer projection; leave owner string-only identity arrays exact. A full EventRecord byte comparison must use SP-236 general typed MessagePack (or prove the selected schema excludes every other type), not silently redefine its domain with SP-278 binding_bytes. Select an authenticated original recipe for history, including app original physical profile where selected.

### DR

Pinned `plans/ea-w2-runtime-artifacts-20261104` at `679bc22ad3a5109a070a064235a2ed8bca838492`.

- **scripts/pm-runtime-artifact-event-drafts.py:** `canonical_numbers`, `semantic_digest`, `value_bytes`, `storage_form`, `decode`, `resolve_history`.
- **scripts/pm_runtime_artifact_round6_cases.py:** `cases`.
- **scripts/pm_runtime_artifact_round7_cases.py:** `cases`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-520`, `CV-521`, `CV-522`, `CV-523`, `CV-524`, `CV-525`, `CV-526`, `CV-527`, `CV-528`, `CV-529`, `CV-530`, `CV-531`, `CV-532`, `CV-533`, `CV-534`, `CV-535`, `CV-536`, `CV-537`, `CV-538`; `Plans/storage-plan.md`: `SP-520`, `SP-521`, `SP-522`, `SP-523`, `SP-524`, `SP-525`, `SP-526`, `SP-527`, `SP-528`, `SP-529`, `SP-530`, `SP-531`, `SP-532`, `SP-533`, `SP-534`, `SP-535`, `SP-536`, `SP-537`, `SP-538`; `Plans/Runtime_Artifacts_Panel.md`: `RAP-100`, `RAP-101`, `RAP-102`, `RAP-103`, `RAP-104`, `RAP-105`, `RAP-106`, `RAP-107`, `RAP-108`, `RAP-109`, `RAP-110`, `RAP-111`, `RAP-112`, `RAP-113`, `RAP-114`, `RAP-115`, `RAP-116`, `RAP-117`, `RAP-118`.

**Adoption:** Keep separate current/historical validators and correct typed physical codec. Route semantic_digest through shared JCS exactness qualifier without narrowing logical owner numbers. Authenticate selection of HISTORICAL_V1 and the original transport/hash recipes in SP-1101. Keep each declared payload media/byte profile; do not re-encode retained JSON pack bytes as MessagePack. Extend round6/7 fixtures with recipe downgrade and exact large-number controls.

### DS15

Pinned `plans/ea-w2-section15-newtools-20261104` at `03dccbe3e5018b485a18e50a75e3f570f065622d`.

- **scripts/pm-ds15-event-contracts.py:** `numeric_atom_ok`, `numbers_ok`, `integer_boundary`, `parse_integer`, `parse_numeric_json`, `check_numeric_contracts`.
- **scripts/pm-ds15-guard-audit.py:** whole companion audit.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-660`, `CV-661`, `CV-662`, `CV-663`, `CV-664`, `CV-665`, `CV-666`, `CV-667`, `CV-668`, `CV-669`, `CV-670`, `CV-671`, `CV-672`, `CV-673`, `CV-674`, `CV-675`, `CV-676`; `Plans/storage-plan.md`: `SP-640`, `SP-641`, `SP-642`, `SP-643`, `SP-644`, `SP-645`, `SP-646`, `SP-647`, `SP-648`, `SP-649`, `SP-650`, `SP-651`, `SP-652`, `SP-653`, `SP-654`, `SP-655`, `SP-656`; `Plans/Section15_MVP_Promoted_Features_Spec.md`: `SMPFS-310`, `SMPFS-311`, `SMPFS-312`, `SMPFS-313`, `SMPFS-314`, `SMPFS-315`, `SMPFS-316`, `SMPFS-317`; `Plans/newtools.md`: `N2-217`, `N2-218`, `N2-219`, `N2-220`, `N2-221`, `N2-222`, `N2-223`.

**Adoption:** Use the common current integer grammar and actual field owner ranges; keep physical MessagePack range as route qualification, not a new logical schema ceiling. Separate producer JCS eligibility from full metadata uint64 eligibility. Remove current numeric wrappers from historical entrypoints; dispatch to frozen authenticated original schema/recipe. Add old integral-float and large-storage history positives, not just current rejection negatives.

### DM

Pinned `plans/ea-w2-small-owners-20261104` at `93f27d505890f4e8ee623ff796855a5f2e6585b6`.

- **scripts/pm-small-owner-events.py:** `decode_current_json`, `canonical_json_numbers`, `current_producer_numbers`, `producer_digest`, `retained_producer_digest`, `resolve_original`, `current_retry`, `canonical_fixture_msgpack`.
- **scripts/pm-small-owner-guard-audit.py:** `numeric_catalogue`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-620`, `CV-621`, `CV-622`, `CV-623`, `CV-624`, `CV-625`, `CV-626`, `CV-627`; `Plans/storage-plan.md`: `SP-600`, `SP-601`, `SP-602`, `SP-603`, `SP-604`, `SP-605`, `SP-606`, `SP-607`; `Plans/Automated_Testing_System.md`: `ATS-300`, `ATS-301`, `ATS-302`, `ATS-303`, `ATS-304`.

**Adoption:** Keep full-u64 Storage metadata and explicit retained path. Replace current sorted Python producer JSON with actual owner JCS plus exactness check; freeze the earlier retained exact-decimal recipe as an explicit original edition, not an unlabelled universal fallback. Authenticate that selection before resolving retries. Keep central grammar and drop duplicate safe-cap prose from these family units; unsupported routes refuse without source-schema caps.

### DT

Pinned `plans/ea-w2-tools-gates-approvals-20261104` at `e4547dc697758794bac656f7619747825087093f`.

- **scripts/pm-dt-event-contracts.py:** `canonical`, `decode_source`, `retained_schema`, `current_numbers_valid`, `unsigned_integer_valid`, `producer_semantic_bytes`, `identity`, `source_valid`, `historical_read`.
- **scripts/pm-dt-number-type-sweep.py:** `sweep`.
- **scripts/pm-dt-guard-isolation.py:** `prove_family`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-600`, `CV-601`, `CV-602`, `CV-603`, `CV-604`, `CV-605`, `CV-606`, `CV-607`, `CV-608`, `CV-609`, `CV-610`, `CV-611`, `CV-612`, `CV-613`, `CV-614`, `CV-615`, `CV-616`; `Plans/storage-plan.md`: `SP-580`, `SP-581`, `SP-582`, `SP-583`, `SP-584`, `SP-585`, `SP-586`, `SP-587`, `SP-588`, `SP-589`, `SP-590`, `SP-591`, `SP-592`, `SP-593`, `SP-594`, `SP-595`, `SP-596`.

**Adoption:** Preserve pm.dt.source.json.v1 exactly as a local source recipe. Do not apply current_numbers_valid to Storage-assigned sequence metadata in source_valid. Use shared qualified JCS only on PRODUCER_FIELDS; qualify Decimal source routes explicitly instead of coercing to float. Replace historical=True/x-dt-retained-number-bounds as the selector with authenticated original edition dispatch. Share integer-token grammar while preserving the old accepted source representation/identity bytes in retained fixtures.

### DCN

Pinned `plans/ea-w3-card2-names-20261104` at `ddd4e74e2707d4d225bf7c7bf1668d418cbc75dc`.

- **scripts/pm_card2_events.py:** `semantic_digest`, `strict_equal`, `envelope_bad`, `payload_bad`, `token_schema_bad`.

**Existing owner units:** `Plans/Contracts_V0.md`: `CV-780`, `CV-781`, `CV-782`, `CV-783`, `CV-784`, `CV-785`; `Plans/storage-plan.md`: `SP-760`, `SP-761`, `SP-762`, `SP-763`, `SP-764`, `SP-765`; `Plans/assistant-memory-subsystem.md`: `AMS-130`; `Plans/Section15_MVP_Promoted_Features_Spec.md`: `SMPFS-244`, `SMPFS-245`, `SMPFS-246`, `SMPFS-247`, `SMPFS-248`.

**Adoption:** Add central current integer grammar before schema/equality; retain separate SP-278 uint64 encoding and qualified EventRecord producer JCS. Historical source/schema/hash selection must come from authentic original edition; keep current source live checks from substituting for at-write facts. Add old number/type positives and recipe forgery negatives across every history/retry rule subset.

## Ancillary lanes

- **CA-CARDS:** No number-code edit. Preserve exact recorded policy values; the drafting adopters cite CV-1100/SP-1100/SP-1101, not new Decision Log answers.
- **CENSUS:** Do not treat census counts as EventRecord number profiles. No production number change; future report hashes must keep their own declared file-byte recipe.
- **CA-RETIRE:** No new serializer. Do not revive retired names while attaching central recipe citations to remaining owner units.
- **IGNORE:** No number adoption edit required.
- **RT:** Keep policy numbers/anchors/caps exact, do not reinterpret them as encoding range. Add central dispatch citations only if touching event/metadata validation; retain all original history recipes.
- **HB-OLD:** Do not land as a competing number rule. Preserve original heartbeat answer provenance; use the current answer branch for policy integration.
- **HB:** Keep 300000 ms policy choice distinct from integer encoding. Number mechanics belong to DCO/shared owners; no new Jared number question.
- **CA-SEAL:** Sweep must require each family's shared-rule citation and independent number/history fixtures. Do not infer canonicality from a 64-character value or schema/shape-only receipt.
- **RT-OLD:** Do not use stale retention source as a numerical recipe. Preserve original policy and historical records; current retention branch owns integration.
- **RT-BASE:** No number-code rewrite. Keep exact 2,000,000/1,000,000 and duration policy values and original anchor semantics; reference shared encoding if these enter stored/checkpoint wrappers.

## Validation and limits

Run `python3 scripts/pm_event_numbers.py --self-test` with `rfc8785==0.1.4`, `msgpack==1.1.2`, `blake3==1.0.11` and the repository's existing jsonschema dependency available. The default corpus is `Plans/event_number_recipe_corpus.json`; `--corpus <path>` runs an adopter's compatible corpus. A failure returns exit 1. An exception is never counted as a successful refusal: negatives match their exact diagnostic. The AST guard-removal table weakens named authored refusal guards, keeps the original case unchanged and retains an unrelated refusing control. Coupled exact-value/custody guards are named together. Stdlib JSON and external MessagePack parser guards are checked with independent malformed/noncanonical vectors, not rewritten.

This helper run does not execute the other lane checkers, establish native original authentication, validate arbitrary schemas, establish a complete route's future domain, enforce pack durability/retention, or admit an event. Each lane owns those integration checks. No lane branch was edited by NUMRULE.
