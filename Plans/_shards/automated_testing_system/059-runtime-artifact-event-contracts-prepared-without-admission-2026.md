# Shard 059: Runtime artifact event contracts prepared without admission — 2026-11-04

Source: `Plans/Automated_Testing_System.md`

Source lines: L11241-L11956

Source SHA256: `a14faaeeff125d0ccc2775d3f1bcc4372b8ff689a01b632bcd508e52a2e5d14e`

---

## Runtime artifact event contracts prepared without admission — 2026-11-04

### ATS-260 — DR artifact event contract oracles

```yaml
plan_unit_id: ATS-260
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  For each exact prepared family in Plans/runtime_artifact_event_drafts.json, scripts/pm-runtime-artifact-event-drafts.py checks its own closed schema against its own positive fixture and unknown-field/type/identity negative fixtures. It checks a source-join model with wrong-Project, changed-payload identity conflict, unproven receipt, unauthorized/deleted body, corrupt source, replay and withdrawal oracles. A replay returns the same original receipt and no effects; source/body unavailability never resurrects bytes. These are static contract models, not implementations of SP-278/SP-286. Each of the 19 families has a complete EventRecord fixture, a closed eleven-field AppendReceipt, and full-value custody/result. Independently mutate each envelope field, each receipt field, and every producer-semantic field (actor, accounts, authored time, source sequence, joins, causality, payload/ref, redaction and migration); prove conflict/no append while Storage sequence/observed/persisted changes leave the semantic digest unchanged but invalidate original full-value resolution. Test exact required-null presence, alternate incoming event IDs returning the original result, corrupted full-value commitment, unsupported versions and source/receipt joins. For each family, both inline and SP-337 packed fresh append and retry must refuse projector_replay_only as replay_only_not_appendable before dedupe success, with no changed original event/receipt or new dedupe entry; append_once and dedupe_by_event_id also refuse this family's fixed policy. The replay-policy mutations remain envelope-schema-valid and leave the canonical producer-semantic digest unchanged, including alternate incoming event IDs; never add replay_policy to that digest. Each family tests encoded payload sizes 16,383/16,384/16,385 and a 17,000-ASCII-byte summary; oversized-inline and reference digest/size/media/bytes/custody/authorization/withdrawal defects must refuse. A schema-valid payload alone is never dispatch proof. BLAKE3 and RFC 8785 use pinned checker dependencies in scripts/requirements-runtime-artifact-drafts.txt; install into an isolated virtual environment before running the checker. Restore_point additionally tests consecutive original observation revisions for unchanged point/artifact, same-revision semantic conflicts, original lost-ack recovery, stale/missing predecessor, unproven source, cross-point joins, no refresh-only revision and unavailable action states, without extra artifact rows or actions. Recompute the exact four-member ra1 grouping key for every restore observation: reject a wrong first correlation, another artifact group's otherwise valid key, wrong later correlations and matching wrong predecessor/candidate correlations; predecessor equality alone cannot establish the grouping key. Every adopted anchored identifier pattern uses an additional full-match guard, including schema patternProperties keys, without changing historical schema identities. For each family, reject trailing-LF and malformed digests in producer payloads, resolved packed payloads and original stored event/custody/result copies; self-consistent equality or recomputed commitments do not waive lexical validation. Each family has its own concrete SP-278 checkpoint/root/generation, live ten-field read token, complete single-segment selected-source adapter and index dataset joined to its exact EventRecord and original first receipt. Validate the advertised schema file/pointer and root-key template. Reject independent foreign root keys, checkpoint/token/anchor/frontier/source storage identities, source-selection hashes, event/custody identities, raw Project partitions, physical locators, missing datasets, stale frontiers, unresolved generation pointers and wrong live snapshots. The adapter is explicitly synthetic; no token is persisted. Exercise all eleven fix-round standing checks for every Project-edition family, including refusal of an application envelope with either the exact CV-366 application@1 key or malformed keys, the independently encoded project~ partition in both writer output and original custody, rejection of oversized inline bodies in stored copies even with recomputed commitments, Storage-field exclusion from semantic retry comparison, and refusal of exit code zero by the failure oracle. Before instance validation, walk every $ref in each complete payload, envelope, custody/receipt and checkpoint schema and recursively referenced schema document, including optional properties and unused $defs/branches. Resolve declared IDs, repository-local external routes and every fragment; unknown documents or fragments fail closed without network retrieval. Each family supplies unresolved optional-property, unused-definition, external-document, external-fragment and external-unused-definition negatives. cost_usage and tool_llm_trace additionally enforce their separately authored RAP-106/CV-526 and RAP-117/CV-537 exact nullable sha256: provider-hash contracts, with valid/null positives and malformed/trailing-LF schema, inline/packed decode, fresh-append and self-consistent stored-copy negatives. Do not rewrite historical schema files or retained values. For every family a supported authenticated retained event remains inspectable after current live owner state changes or its body is deleted (metadata only for the latter); withdrawn readers and forged source/receipt evidence still refuse. The selected historical-v1-before-provider-hash model decoder validates retained originals against their original schema without the current-writer provider-hash overlay; append cannot select it. Freeze authentic inline and packed originals issued by the preceding model with sha256:usagefixture and sha256:toolllmfixture, preserving their original events, result and custody byte-for-byte after live-state changes; current writes still refuse them and historical withdrawal, authorization and forgery controls still refuse. For check 11, mutate reachable pack bytes while preserving length, canonical encoding and logical schema, and recompute observation keys when testing stale/gapped restore ordinals. Every product refusal of scripts/pm-runtime-artifact-event-drafts.py is one named row of a Method B guard table (one phase per scripts/pm_runtime_artifact_table_*.py module), evaluated in the table's declared order; the checker only derives the observations each row reads and never refuses outside a row. scripts/pm-runtime-artifact-guard-tables.py runs the shared guard-isolation tool scripts/pm_guard_isolation.py on every phase table for every family: every row needs a single-defect negative that only it refuses, built from that family's own valid invocation with every observation watching the changed fact rebound, and the tool cuts each row in turn. A witness that by construction contradicts two rows is kept in the full checker and listed with its reason, never relabelled. scripts/pm-runtime-artifact-standing-checks.py reruns the full checker with each standing-check row cut or each invalid positive input injected, requiring a nonzero failure for every affected family. These are newly authored bounded models, not native authority or admission. Native acceptance must separately inject crashes before/after source commit, append, first receipt and final publication; prove real original receipt resolution after lost acknowledgement, actual SP-278 coherent source/CAS, authorization/deletion/hold races, coherent backup/restore and withdrawal fences for each producer/reader. All native obligations remain NOT_RUN.
  Current bounded producer inputs across all nineteen families adopt the shared number rule of CV-1100 and SP-1100 through scripts/pm_event_numbers.py, with no lane cap or blanket walk: every current schema integer slot of EventRecord, receipt, custody, result, checkpoint and payload values accepts only what current_integer accepts (an exact integer, never a boolean, runtime float, exponent form or numeric string) within the field owner's own bounds, while untyped values and number slots keep their JSON type. Pack bodies, inline sizes and the producer semantic digest use qualified_jcs and producer_semantic_digest, which refuse before any effect an integer whose binary64 value or emitted RFC 8785 decimal differs from it (2^53+1, 2^60); event, receipt and commitment bytes use storage_value_bytes with the EVENT_VALUE profile and the unchanged CV-339 tuple (full_value_commitment), so an integer outside -2^63..2^64-1 has no physical route and refuses. A 4,400-digit integer reaches a refusal row, never an exception. Packed JSON must already be RFC 8785 canonical, so -0 and leading-zero encodings cannot form a second stored identity. CV-339's canonical MessagePack codec, commitment domain and frozen vector remain unchanged; the writer admission boundary restricts representations rather than re-encoding issued originals. scripts/pm-runtime-artifact-number-corpus.py places every number of the shared corpus's number scope at the Storage sequence, producer ordinal, receipt offset and a payload integer slot and runs the complete append and exact-retry routes against outcomes composed from the shared helpers alone. Retained readers (historical resolution and the restore-point predecessor) obtain the recipe through SP-1101's RetainedDispatcher from the authenticated source adapter's recorded edition, and the frozen verifier re-derives the original's dispatch, joins, identity, commitment and digest; an unknown, absent or caller-supplied recipe and a foreign authenticated binding refuse. Every timestamp field passes the shared CV-1101 check (pm_event_datetime.datetime_validator over a closed preloaded registry), on current and historical validators alike: EventRecord occurred_at_utc and the receipt, checkpoint and restore-point date-time fields at the broad RFC 3339 profile, Storage observed_at_utc and persisted_at_utc at CV-253's uppercase-Z profile; payload timestamp strings that their schemas leave unformatted keep their owner-schema profile. Valid lowercase, offset, long-fraction and real leap-second source times append with their exact spelling; missing zone, space separator, trailing LF, hour 24, invalid calendar dates, false leap seconds, empty fractions, and on Storage fields any offset (including +00:00 and -00:00) or lowercase z refuse. An authentic older original keeps an owner-valid offset or lowercase source time, while a sealed Storage offset or an invalid source date never reads. A selected historical decoder keeps the original numeric/lexical contract for the event, receipt, custody and result together. Freeze 38 unchanged inline/packed integral-float originals genuinely issued by the preceding b96dc768a5cc93f7e0edb82b41a7f51ca02dec7c model, and prove their exact bytes, original receipts and commitments survive historical resolution while current writes refuse them. Retained result/custody/receipt copies and receipt-to-event sequence joins compare exact encoded bytes, even when the original schema accepts integral floats; mathematically equal forged representations still refuse. Checkpoint source-selection, token, manifest/inventory, segment and last-frame copies also compare exact encoded bytes, including causal boolean-as-integer and integral-float source-copy negatives with all other observations rebound. Exact JSON types precede value checks: no string boolean/number, boolean-as-integer, null, array or nested object may satisfy a field with another declared type. Source/admission/pack/observation flags require actual booleans; checkpoint snapshot numeric fields require actual integers and untyped source/dataset copies compare encoded values so Python bool/int equality cannot redeem a forgery. scripts/pm_runtime_artifact_round6_cases.py supplies one-field source contradictions for RAP-103/RAP-106/RAP-117 on schema, inline/packed decode and fresh append; every altered pack is reissued from its actual body with fresh size/digest, not a stale reference. Recompute known provider digests from separately selected synthetic redacted source bytes; unknown digest and missing source are separate controls. Sweep numeric variants and wrong types for all nineteen, and include the deleted-body reference gate in the repository's complete guard-removal table. Native authentication remains NOT_RUN.
  Sweep part-1 fixture coverage includes quota-present tool_llm_trace controls for each independent source (settlement.quota_artifact_ref and refs.quota_refs), with quota_observed changed alone to false or null on schema, inline/packed decode and fresh-append routes. Each of the nineteen families also tests a selected node generation_id copy differing from its independently correct map key/token/dataset, and anchor.retained_event_count=2 against the verified one-event source. Recompute only the read token's non-target generation_anchor_sha256 for the count case; keep source, coverage and dataset at their correct one-event values. Each negative starts from a valid parent, with fresh pack bytes/references and coherent non-target observations. Sweep part 2A replaces the legacy compound guard-removal table with the guard tables above; sweep part 2B adopts the shared number, recipe and date-time rules described above.
gui_related: false
gui_classification_reason: Defines passive event authority and storage contracts, without changing presentation.
depends_on: ["DL-045", "DL-075", "CV-1100", "CV-1101", "SP-1100", "SP-1101"]
unblocks: []
acceptance_criteria:
  - Exact family contract is prepared without admission; native execution remains NOT_RUN.
validation_surfaces:
  - python3 scripts/pm-runtime-artifact-event-drafts.py
  - python3 scripts/pm-runtime-artifact-standing-checks.py
  - python3 scripts/pm-runtime-artifact-guard-tables.py --out <evidence directory>
  - python3 scripts/pm-runtime-artifact-number-corpus.py
  - python3 scripts/pm_event_numbers.py --self-test --scope numbers
risk_class: event_authority_identity_and_replay
reasoning_tier: high
context_scope: event_authority_wave2_DR
implementation_surfaces:
  - Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-045
  - Plans/Decision_Log.md#DL-075
  - Plans/Contracts_V0.md#CV-1100
  - Plans/Contracts_V0.md#CV-1101
  - Plans/storage-plan.md#SP-1100
  - Plans/storage-plan.md#SP-1101
preserved_exact_tokens:
  - "DR artifact event contract oracles"
```

### ATS-275 - filesafe.command_denied, filesafe.destructive_override_denied oracles

```yaml
plan_unit_id: ATS-275
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each listed family has its own static payload and identity cases;
  native custody/advance/withdrawal oracles are authored NOT_RUN.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- CV-550
- CV-551
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
- python3 scripts/pm-filesafe-table-generate.py --check
- python3 scripts/pm-filesafe-p2a-cases.py --check
- python3 scripts/pm-filesafe-guard-tables.py --out DIR
- python3 scripts/pm-filesafe-number-corpus.py
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

- `filesafe.command_denied`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.
- `filesafe.destructive_override_denied`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.

`python3 scripts/pm_filesafe_event_contracts.py` validates closed schemas, positive/negative payloads and deterministic identity/retry/join cases. This is static contract proof only. Native obligations, separately for each named family, are NOT_RUN: crash at intent/body/append/full-value receipt/terminal boundaries; barrier durability and backup/older-restore; actual SP-278 token/CAS/source-generation mismatch; body permission revocation and deletion; retention pending blocks admission; withdrawal and survivor rebuild; replay produces zero filesystem/command/guard/override effects. These require native implementations and genuine source custody; static fixtures grant no admission.




**Review round 1 mandatory regressions.**

- `filesafe.command_denied`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.
- `filesafe.destructive_override_denied`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.


**Review round 2 mandatory regressions.**

- `filesafe.command_denied`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.
- `filesafe.destructive_override_denied`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.


**Review round 3 SP-337 regressions for `filesafe.command_denied`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 3 SP-337 regressions for `filesafe.destructive_override_denied`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 4 standing checks 9 and 10.**

- `filesafe.command_denied`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.
- `filesafe.destructive_override_denied`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.



**Review round 7 selected-source regressions (R6-B1).**

- `filesafe.command_denied`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.

- `filesafe.destructive_override_denied`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.


**Card 2 retention oracles for `filesafe.command_denied` (DL-422, review round 7).** The complete authority checker adopts `scripts/pm_filesafe_retention.py` and this family's own `Plans/filesafe_event_retention_fixtures.json` row. Compare its Project binding and decision to the exact pre-existing Storage policy object; refuse a substituted policy, altered expiry/count/overflow object or an inferred application binding. Check the original durable-save anchor at before/exact/after expiry, unchanged by retry, reprocessing or recovery; each investigation/reference/recovery/backup/hold protection independently blocks expiry. Permanent proof never expires by age or count and survives deletion of the described file/chat; Remove project from list retains data, while only authorized explicit Delete Puppet Master project data under existing protections can remove Project proof. Full capacity refuses new entries unless the seven-year policy can expire unprotected entries. Application history remains blocked on exact approved rules. These are static synthetic eligibility oracles; native deletion, protection/authentication and physical storage execution remain NOT_RUN.


**Card 2 retention oracles for `filesafe.destructive_override_denied` (DL-423, review round 7).** The complete authority checker adopts `scripts/pm_filesafe_retention.py` and this family's own `Plans/filesafe_event_retention_fixtures.json` row. Compare its Project binding and decision to the exact pre-existing Storage policy object; refuse a substituted policy, altered expiry/count/overflow object or an inferred application binding. Check the original durable-save anchor at before/exact/after expiry, unchanged by retry, reprocessing or recovery; each investigation/reference/recovery/backup/hold protection independently blocks expiry. Permanent proof never expires by age or count and survives deletion of the described file/chat; Remove project from list retains data, while only authorized explicit Delete Puppet Master project data under existing protections can remove Project proof. Full capacity refuses new entries unless the seven-year policy can expire unprotected entries. Application history remains blocked on exact approved rules. These are static synthetic eligibility oracles; native deletion, protection/authentication and physical storage execution remain NOT_RUN.

**Sweep part 1 regressions (R7-B1/R7-B2/S6).** Both FileSafe checker entry points enforce the selected date-time format with an explicit full-string grammar and calendar/range checks, independent of optional format packages. Own payload, materialization, retained-issued and coherently rehashed original-source negatives cover missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, leap seconds and invalid fractional syntax; valid fractional precision and offset spellings remain unchanged. The exact cycle-7 accepted malformed-source witnesses must refuse. This enforces the declared schema format and does not restamp authentic original bytes or claim the part-2 original-recipe dispatcher. The three seven-year Project suites independently exercise count-only and disk-only refusal and eligible-expiry paths with the peer condition false. Each safe-point suite applies DL-401 G28 Run year with a real run, completion anchor, existing protections and independent run/Project successor controls; application safe points use no fabricated Project count. Application-scope FileSafe security-event retention remains pending and unchanged. Whole-lane guard-table certification and NUMRULE adoption remain part 2.

**Sweep part 2A/2B oracle certification.** Every refusal of both complete checkers for the families above is one named row of a generated Method B guard table (204 tables, 405 rows; `python3 scripts/pm-filesafe-table-generate.py --check` keeps them current). `python3 scripts/pm-filesafe-guard-tables.py --out DIR` replays every witness of both CLIs under the observation recorder, checks the uncapped lane matrix, and runs the gated shared guard tool once per table; rows no input can refuse first stay as checks in tables of their own and earn no credit. `Plans/filesafe_event_p2a_cases.json` holds the coherent one-defect witnesses for rows the earlier fixtures left without one (`python3 scripts/pm-filesafe-p2a-cases.py --check`); both CLIs check them. `python3 scripts/pm-filesafe-number-corpus.py` runs the shared NUMRULE number corpus and 4,400-digit integers through the complete checkers, and `python3 scripts/pm_event_numbers.py --self-test --scope numbers` must report pass. Limits are unchanged in kind: each schema occurrence is one structural verdict row (individual JSON Schema keywords are not cut one by one), date-time formats remain the interim lane grammar pending CV-1101, and native execution stays NOT_RUN.


### ATS-276 - filesafe.destructive_override_granted, filesafe.destructive_override_requested oracles

```yaml
plan_unit_id: ATS-276
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each listed family has its own static payload and identity cases;
  native custody/advance/withdrawal oracles are authored NOT_RUN.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- CV-552
- CV-553
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
- python3 scripts/pm-filesafe-table-generate.py --check
- python3 scripts/pm-filesafe-p2a-cases.py --check
- python3 scripts/pm-filesafe-guard-tables.py --out DIR
- python3 scripts/pm-filesafe-number-corpus.py
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

- `filesafe.destructive_override_granted`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.
- `filesafe.destructive_override_requested`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.

`python3 scripts/pm_filesafe_event_contracts.py` validates closed schemas, positive/negative payloads and deterministic identity/retry/join cases. This is static contract proof only. Native obligations, separately for each named family, are NOT_RUN: crash at intent/body/append/full-value receipt/terminal boundaries; barrier durability and backup/older-restore; actual SP-278 token/CAS/source-generation mismatch; body permission revocation and deletion; retention pending blocks admission; withdrawal and survivor rebuild; replay produces zero filesystem/command/guard/override effects. These require native implementations and genuine source custody; static fixtures grant no admission.




**Review round 1 mandatory regressions.**

- `filesafe.destructive_override_granted`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.
- `filesafe.destructive_override_requested`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.


**Review round 2 mandatory regressions.**

- `filesafe.destructive_override_granted`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.
- `filesafe.destructive_override_requested`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.


**Review round 3 SP-337 regressions for `filesafe.destructive_override_granted`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 3 SP-337 regressions for `filesafe.destructive_override_requested`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 4 standing checks 9 and 10.**

- `filesafe.destructive_override_granted`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.
- `filesafe.destructive_override_requested`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.



**Review round 7 selected-source regressions (R6-B1).**

- `filesafe.destructive_override_granted`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.

- `filesafe.destructive_override_requested`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.


**Card 2 retention oracles for `filesafe.destructive_override_requested` (DL-424, review round 7).** The complete authority checker adopts `scripts/pm_filesafe_retention.py` and this family's own `Plans/filesafe_event_retention_fixtures.json` row. Compare its Project binding and decision to the exact pre-existing Storage policy object; refuse a substituted policy, altered expiry/count/overflow object or an inferred application binding. Check the original durable-save anchor at before/exact/after expiry, unchanged by retry, reprocessing or recovery; each investigation/reference/recovery/backup/hold protection independently blocks expiry. Permanent proof never expires by age or count and survives deletion of the described file/chat; Remove project from list retains data, while only authorized explicit Delete Puppet Master project data under existing protections can remove Project proof. Full capacity refuses new entries unless the seven-year policy can expire unprotected entries. Application history remains blocked on exact approved rules. These are static synthetic eligibility oracles; native deletion, protection/authentication and physical storage execution remain NOT_RUN.

**Sweep part 1 regressions (R7-B1/R7-B2/S6).** Both FileSafe checker entry points enforce the selected date-time format with an explicit full-string grammar and calendar/range checks, independent of optional format packages. Own payload, materialization, retained-issued and coherently rehashed original-source negatives cover missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, leap seconds and invalid fractional syntax; valid fractional precision and offset spellings remain unchanged. The exact cycle-7 accepted malformed-source witnesses must refuse. This enforces the declared schema format and does not restamp authentic original bytes or claim the part-2 original-recipe dispatcher. The three seven-year Project suites independently exercise count-only and disk-only refusal and eligible-expiry paths with the peer condition false. Each safe-point suite applies DL-401 G28 Run year with a real run, completion anchor, existing protections and independent run/Project successor controls; application safe points use no fabricated Project count. Application-scope FileSafe security-event retention remains pending and unchanged. Whole-lane guard-table certification and NUMRULE adoption remain part 2.

**Sweep part 2A/2B oracle certification.** Every refusal of both complete checkers for the families above is one named row of a generated Method B guard table (204 tables, 405 rows; `python3 scripts/pm-filesafe-table-generate.py --check` keeps them current). `python3 scripts/pm-filesafe-guard-tables.py --out DIR` replays every witness of both CLIs under the observation recorder, checks the uncapped lane matrix, and runs the gated shared guard tool once per table; rows no input can refuse first stay as checks in tables of their own and earn no credit. `Plans/filesafe_event_p2a_cases.json` holds the coherent one-defect witnesses for rows the earlier fixtures left without one (`python3 scripts/pm-filesafe-p2a-cases.py --check`); both CLIs check them. `python3 scripts/pm-filesafe-number-corpus.py` runs the shared NUMRULE number corpus and 4,400-digit integers through the complete checkers, and `python3 scripts/pm_event_numbers.py --self-test --scope numbers` must report pass. Limits are unchanged in kind: each schema occurrence is one structural verdict row (individual JSON Schema keywords are not cut one by one), date-time formats remain the interim lane grammar pending CV-1101, and native execution stays NOT_RUN.


### ATS-277 - filesafe.guard_init_failed, filesafe.path_denied oracles

```yaml
plan_unit_id: ATS-277
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each listed family has its own static payload and identity cases;
  native custody/advance/withdrawal oracles are authored NOT_RUN.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- CV-554
- CV-555
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
- python3 scripts/pm-filesafe-table-generate.py --check
- python3 scripts/pm-filesafe-p2a-cases.py --check
- python3 scripts/pm-filesafe-guard-tables.py --out DIR
- python3 scripts/pm-filesafe-number-corpus.py
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

- `filesafe.guard_init_failed`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.
- `filesafe.path_denied`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.

`python3 scripts/pm_filesafe_event_contracts.py` validates closed schemas, positive/negative payloads and deterministic identity/retry/join cases. This is static contract proof only. Native obligations, separately for each named family, are NOT_RUN: crash at intent/body/append/full-value receipt/terminal boundaries; barrier durability and backup/older-restore; actual SP-278 token/CAS/source-generation mismatch; body permission revocation and deletion; retention pending blocks admission; withdrawal and survivor rebuild; replay produces zero filesystem/command/guard/override effects. These require native implementations and genuine source custody; static fixtures grant no admission.




**Review round 1 mandatory regressions.**

- `filesafe.guard_init_failed`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.
- `filesafe.path_denied`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.


**Review round 2 mandatory regressions.**

- `filesafe.guard_init_failed`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.
- `filesafe.path_denied`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.


**Review round 3 SP-337 regressions for `filesafe.guard_init_failed`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 3 SP-337 regressions for `filesafe.path_denied`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 4 standing checks 9 and 10.**

- `filesafe.guard_init_failed`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.
- `filesafe.path_denied`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.



**Review round 7 selected-source regressions (R6-B1).**

- `filesafe.guard_init_failed`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.

- `filesafe.path_denied`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.


**Card 2 retention oracles for `filesafe.guard_init_failed` (DL-425, review round 7).** The complete authority checker adopts `scripts/pm_filesafe_retention.py` and this family's own `Plans/filesafe_event_retention_fixtures.json` row. Compare its Project binding and decision to the exact pre-existing Storage policy object; refuse a substituted policy, altered expiry/count/overflow object or an inferred application binding. Check the original durable-save anchor at before/exact/after expiry, unchanged by retry, reprocessing or recovery; each investigation/reference/recovery/backup/hold protection independently blocks expiry. Permanent proof never expires by age or count and survives deletion of the described file/chat; Remove project from list retains data, while only authorized explicit Delete Puppet Master project data under existing protections can remove Project proof. Full capacity refuses new entries unless the seven-year policy can expire unprotected entries. Application history remains blocked on exact approved rules. These are static synthetic eligibility oracles; native deletion, protection/authentication and physical storage execution remain NOT_RUN.


**Card 2 retention oracles for `filesafe.path_denied` (DL-426, review round 7).** The complete authority checker adopts `scripts/pm_filesafe_retention.py` and this family's own `Plans/filesafe_event_retention_fixtures.json` row. Compare its Project binding and decision to the exact pre-existing Storage policy object; refuse a substituted policy, altered expiry/count/overflow object or an inferred application binding. Check the original durable-save anchor at before/exact/after expiry, unchanged by retry, reprocessing or recovery; each investigation/reference/recovery/backup/hold protection independently blocks expiry. Permanent proof never expires by age or count and survives deletion of the described file/chat; Remove project from list retains data, while only authorized explicit Delete Puppet Master project data under existing protections can remove Project proof. Full capacity refuses new entries unless the seven-year policy can expire unprotected entries. Application history remains blocked on exact approved rules. These are static synthetic eligibility oracles; native deletion, protection/authentication and physical storage execution remain NOT_RUN.

**Sweep part 1 regressions (R7-B1/R7-B2/S6).** Both FileSafe checker entry points enforce the selected date-time format with an explicit full-string grammar and calendar/range checks, independent of optional format packages. Own payload, materialization, retained-issued and coherently rehashed original-source negatives cover missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, leap seconds and invalid fractional syntax; valid fractional precision and offset spellings remain unchanged. The exact cycle-7 accepted malformed-source witnesses must refuse. This enforces the declared schema format and does not restamp authentic original bytes or claim the part-2 original-recipe dispatcher. The three seven-year Project suites independently exercise count-only and disk-only refusal and eligible-expiry paths with the peer condition false. Each safe-point suite applies DL-401 G28 Run year with a real run, completion anchor, existing protections and independent run/Project successor controls; application safe points use no fabricated Project count. Application-scope FileSafe security-event retention remains pending and unchanged. Whole-lane guard-table certification and NUMRULE adoption remain part 2.

**Sweep part 2A/2B oracle certification.** Every refusal of both complete checkers for the families above is one named row of a generated Method B guard table (204 tables, 405 rows; `python3 scripts/pm-filesafe-table-generate.py --check` keeps them current). `python3 scripts/pm-filesafe-guard-tables.py --out DIR` replays every witness of both CLIs under the observation recorder, checks the uncapped lane matrix, and runs the gated shared guard tool once per table; rows no input can refuse first stay as checks in tables of their own and earn no credit. `Plans/filesafe_event_p2a_cases.json` holds the coherent one-defect witnesses for rows the earlier fixtures left without one (`python3 scripts/pm-filesafe-p2a-cases.py --check`); both CLIs check them. `python3 scripts/pm-filesafe-number-corpus.py` runs the shared NUMRULE number corpus and 4,400-digit integers through the complete checkers, and `python3 scripts/pm_event_numbers.py --self-test --scope numbers` must report pass. Limits are unchanged in kind: each schema occurrence is one structural verdict row (individual JSON Schema keywords are not cut one by one), date-time formats remain the interim lane grammar pending CV-1101, and native execution stays NOT_RUN.


### ATS-278 - filesafe.policy_degraded oracles

```yaml
plan_unit_id: ATS-278
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each listed family has its own static payload and identity cases;
  native custody/advance/withdrawal oracles are authored NOT_RUN.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- CV-556
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
- python3 scripts/pm-filesafe-table-generate.py --check
- python3 scripts/pm-filesafe-p2a-cases.py --check
- python3 scripts/pm-filesafe-guard-tables.py --out DIR
- python3 scripts/pm-filesafe-number-corpus.py
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

- `filesafe.policy_degraded`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission.

`python3 scripts/pm_filesafe_event_contracts.py` validates closed schemas, positive/negative payloads and deterministic identity/retry/join cases. This is static contract proof only. Native obligations, separately for each named family, are NOT_RUN: crash at intent/body/append/full-value receipt/terminal boundaries; barrier durability and backup/older-restore; actual SP-278 token/CAS/source-generation mismatch; body permission revocation and deletion; retention pending blocks admission; withdrawal and survivor rebuild; replay produces zero filesystem/command/guard/override effects. These require native implementations and genuine source custody; static fixtures grant no admission.




**Review round 1 mandatory regressions.**

- `filesafe.policy_degraded`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.


**Review round 2 mandatory regressions.**

- `filesafe.policy_degraded`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.


**Review round 3 SP-337 regressions for `filesafe.policy_degraded`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 4 standing checks 9 and 10.**

- `filesafe.policy_degraded`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.



**Review round 7 selected-source regressions (R6-B1).**

- `filesafe.policy_degraded`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.


**Sweep part 1 regressions (R7-B1/R7-B2/S6).** Both FileSafe checker entry points enforce the selected date-time format with an explicit full-string grammar and calendar/range checks, independent of optional format packages. Own payload, materialization, retained-issued and coherently rehashed original-source negatives cover missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, leap seconds and invalid fractional syntax; valid fractional precision and offset spellings remain unchanged. The exact cycle-7 accepted malformed-source witnesses must refuse. This enforces the declared schema format and does not restamp authentic original bytes or claim the part-2 original-recipe dispatcher. The three seven-year Project suites independently exercise count-only and disk-only refusal and eligible-expiry paths with the peer condition false. Each safe-point suite applies DL-401 G28 Run year with a real run, completion anchor, existing protections and independent run/Project successor controls; application safe points use no fabricated Project count. Application-scope FileSafe security-event retention remains pending and unchanged. Whole-lane guard-table certification and NUMRULE adoption remain part 2.

**Sweep part 2A/2B oracle certification.** Every refusal of both complete checkers for the families above is one named row of a generated Method B guard table (204 tables, 405 rows; `python3 scripts/pm-filesafe-table-generate.py --check` keeps them current). `python3 scripts/pm-filesafe-guard-tables.py --out DIR` replays every witness of both CLIs under the observation recorder, checks the uncapped lane matrix, and runs the gated shared guard tool once per table; rows no input can refuse first stay as checks in tables of their own and earn no credit. `Plans/filesafe_event_p2a_cases.json` holds the coherent one-defect witnesses for rows the earlier fixtures left without one (`python3 scripts/pm-filesafe-p2a-cases.py --check`); both CLIs check them. `python3 scripts/pm-filesafe-number-corpus.py` runs the shared NUMRULE number corpus and 4,400-digit integers through the complete checkers, and `python3 scripts/pm_event_numbers.py --self-test --scope numbers` must report pass. Limits are unchanged in kind: each schema occurrence is one structural verdict row (individual JSON Schema keywords are not cut one by one), date-time formats remain the interim lane grammar pending CV-1101, and native execution stays NOT_RUN.


### ATS-279 - safe_point.created, safe_point.restored oracles

```yaml
plan_unit_id: ATS-279
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Each listed family has its own static payload and identity cases;
  native custody/advance/withdrawal oracles are authored NOT_RUN.
gui_related: false
gui_classification_reason: Event authority and storage contracts; no presentation
  change.
depends_on:
- CV-557
- CV-558
unblocks: []
acceptance_criteria:
- The exact family remains unadmitted until independent admission.
- Exact source, scope, retry, read and withdrawal joins fail closed.
validation_surfaces:
- python3 scripts/pm_filesafe_event_contracts.py
- python3 scripts/pm_filesafe_event_authority.py
- python3 scripts/pm-filesafe-table-generate.py --check
- python3 scripts/pm-filesafe-p2a-cases.py --check
- python3 scripts/pm-filesafe-guard-tables.py --out DIR
- python3 scripts/pm-filesafe-number-corpus.py
- python3 scripts/pm_event_numbers.py --self-test --scope numbers
risk_class: event_authority
reasoning_tier: high
context_scope: ea_wave2_DF
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens: []
negative_constraints:
- No event registry append, retention decision, or native admission.
```

- `safe_point.created`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission. Forged BLAKE3 address, swapped bytes and truncated bytes negatives repair every dependent manifest/source/receipt/issued copy; all refuse only the recomputed address predicate. Independent SHA-256 mismatch negatives preserve correct BLAKE3 bytes/address. The body-dependent historical resolver repeats blob verification; event-only history/retry/rebuild remains readable after domain controls are disposed.
- `safe_point.restored`: `Plans/filesafe_event_authority_fixtures.json` contains this family's complete original-source views, closed EventRecord and strict full-value custody positives for Project/application, full envelope/source/subject/Host/root joins, authentic-bank versus forged-source negatives, missing body/receipt and altered commitment negatives. Own action traces assert original-result retry, changed-digest conflict, missing-dedupe refusal, crash before/after body/append/receipt/terminal, older-restore skew, unavailable reads and fenced withdrawal/rebuild with zero replay effect. `python3 scripts/pm_filesafe_event_authority.py` checks its own graph/resource pins and these exact cases. Native source, storage/fsync/CAS, access/hold/deletion and actual backup/withdrawal effects remain NOT_RUN; fixtures confer no admission. Round-6 regressions require coherent `1.0`, `1e0` and `-0.0` epoch negatives to refuse before commitment/joins, typed integer `1`/`0` controls to preserve one value and raw `-0` tokens to refuse at the CV-1100 current decoder, and string booleans/numbers, null, arrays, nested objects and boolean epochs to fail their exact typed ingress; Project/application reference descriptors with floating-point byte_size must also refuse after all dependent custody is repaired. Retained application sources verify their original typed commitment recipe without restamping or current-writer epoch admission. Forged BLAKE3 address, swapped bytes and truncated bytes negatives repair every dependent manifest/source/receipt/issued copy; all refuse only the recomputed address predicate. Independent SHA-256 mismatch negatives preserve correct BLAKE3 bytes/address. The body-dependent historical resolver repeats blob verification; event-only history/retry/rebuild remains readable after domain controls are disposed.

`python3 scripts/pm_filesafe_event_contracts.py` validates closed schemas, positive/negative payloads and deterministic identity/retry/join cases. This is static contract proof only. Native obligations, separately for each named family, are NOT_RUN: crash at intent/body/append/full-value receipt/terminal boundaries; barrier durability and backup/older-restore; actual SP-278 token/CAS/source-generation mismatch; body permission revocation and deletion; retention pending blocks admission; withdrawal and survivor rebuild; replay produces zero filesystem/command/guard/override effects. These require native implementations and genuine source custody; static fixtures grant no admission.


**Review round 1 mandatory regressions.**

- `safe_point.created`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.
- `safe_point.created` application originals: decode closed complete original request/record/manifest/blob compositions and, for restoration, full journal/pre/post manifests/equality. Rehash independently altered genuine synthetic originals, then refuse subject/count/blob/SCM/cursor/lease/hold/outcome mismatches, opaque bodies and wrong payload-store selections. Native authenticity, payload addressing, filesystem equality, durable publication and CAS remain NOT_RUN.
- `safe_point.restored`: independent Project and application traces remove issued rows and custody before crash, require persisted recovery refusal, refuse terminal publication and cached retries, refuse changed first receipts, and prove retained retries/rebuilds work without disposed original controls. Own pre-prepare owner-commit withdrawal must reconcile before reader cutoff; loss before rebuild/cutoff and a caller-reduced boundary refuse, while source-generation or reader-generation CAS races retain the reader fence. Every regression runs through the full authority checker, preserving all earlier positives/negatives.
- `safe_point.restored` application originals: decode closed complete original request/record/manifest/blob compositions and, for restoration, full journal/pre/post manifests/equality. Rehash independently altered genuine synthetic originals, then refuse subject/count/blob/SCM/cursor/lease/hold/outcome mismatches, opaque bodies and wrong payload-store selections. Native authenticity, payload addressing, filesystem equality, durable publication and CAS remain NOT_RUN.


**Review round 2 mandatory regressions.**

- `safe_point.created`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.
- `safe_point.restored`: in each Project/application scope, full-checker negatives refuse `projector_replay_only` for current-writer acceptance and retries before and after original controls are disposed; refusal is `replay_only_not_appendable`. Metadata-only retry changes return the exact original EventRecord and first receipt. Own identifier patterns have exact length/full-match guards and trailing-LF refusal cases.
- `safe_point.restored` application originals: independently re-encode and rehash each inconsistent result-event pointer and operation-kind/before/target/stage/tombstone composition in the genuine synthetic source bank, then require full-checker refusal. Positive create/delete/metadata journals and the original pre-append null result-event phase remain supported. No journal deletion or hold release follows from replay; native original journal custody remains NOT_RUN.


**Review round 3 SP-337 regressions for `safe_point.created`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 3 SP-337 regressions for `safe_point.restored`.** The full payload and authority checkers exercise this family's own Project/application ASCII and multibyte UTF-8 bodies at exactly 16,383 and 16,384 bytes (valid), and 16,385 bytes (refused). Complete original source/body/custody commitments are maintained in each case. Its own large EventRecord semantic-body reference positive resolves exact BLAKE3-addressed canonical JSON, byte size, media type and durable synthetic pack/index selection, with an empty inline payload and no duplicated large stored body; writer, recovery and retry retain the exact issued record and first receipt. Missing/changed/non-durable pack bytes, wrong address/size/media, trailing LF and oversized inline copies with or without a reference refuse. An independently consistent oversized issued EventRecord is rejected as well as the original input; altered retained copies cannot recover, publish or dedupe. The earlier external-file-blob positive is a separate boundary and remains unchanged. All eight standing checks and B1..B7 mutations remain required per family; failure controls require nonzero checker exit. Native pack/checkpoint/CAS execution remains NOT_RUN; admission and the seven owner retention questions remain separate.

**Review round 4 standing checks 9 and 10.**

- `safe_point.created`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.
- `safe_point.restored`: the passive historical reader resolves the independently retained original issued EventRecord and unchanged first receipt, including verified SP-337 body custody, after live writer-epoch changes and lawful disposal of original domain controls. It does not reopen original command/grant/snapshot controls or require the current writer epoch to equal the historical epoch. Missing issued/receipt/payload custody, forged candidate or issued bytes, absent retained boundary, wrong Storage identity, a stale reader generation and withdrawn readers refuse; writer acceptance still requires current original-owner selection. The explicit body-dependent `read_body` request still refuses lost original bodies; that refusal does not hide the independently retained EventRecord. Own inline and reference Project/application traces verify zero replay effects and fenced withdrawal followed by verified successor publication. Both full checker entry points resolve every `$ref` in every pinned resource, including unused definitions and nested `$id` scopes; this family's source graph pins the complete dependency closure including the shared integration expansion resource. `Plans/filesafe_schema_graph_fixtures.json` supplies own source/payload/dependency dangling-reference negatives and unselected-dependency/nested-scope negatives. Rehashed external mutations must make both CLIs report failure with a nonzero exit. All ten standing checks and all earlier B1..B8 mutations remain required. Native access/holds, physical pack durability and generic checkpoint/CAS remain NOT_RUN; the seven narrowed retention questions and absent admission are unchanged.


**Review round 7 selected-source regressions (R6-B1).**

- `safe_point.created`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.

- `safe_point.restored`: own Project and application integer-epoch-1 controls pass full materialization, owner/prepare/append/receipt/terminal and body-read paths. Changing only the selected-bank epoch to boolean, float, string, null, array or object refuses current acceptance and original-body reads while event-only history stays readable. Independently self-committed foreign originals refuse the exact recursive complete-value join; own selected commitment corruption refuses before joining. Original recipes and historical source controls remain unchanged.

**R6-B2 restore isolation.** Preserve the ten historical fix2 case IDs, rebuilding five kind witnesses as metadata operations against unequal before/target content with every subject join true. Rebuild five subject witnesses with presence-compatible replace kind and only expected_before_sha256 wrong. Recompute bodies, manifests, source commitments, issued records and first receipts where affected. Each fails only its intended invariant; cut only the metadata content predicate or tested subject clause with all peers enabled to show it passes. Original skipped-outcome positives remain; unequal-content kind controls use valid clean restores where skipped would be contradictory.

**Sweep part 1 regressions (R7-B1/R7-B2/S6).** Both FileSafe checker entry points enforce the selected date-time format with an explicit full-string grammar and calendar/range checks, independent of optional format packages. Own payload, materialization, retained-issued and coherently rehashed original-source negatives cover missing zones, wrong separators, invalid calendar/time/offset fields, trailing LF, leap seconds and invalid fractional syntax; valid fractional precision and offset spellings remain unchanged. The exact cycle-7 accepted malformed-source witnesses must refuse. This enforces the declared schema format and does not restamp authentic original bytes or claim the part-2 original-recipe dispatcher. The three seven-year Project suites independently exercise count-only and disk-only refusal and eligible-expiry paths with the peer condition false. Each safe-point suite applies DL-401 G28 Run year with a real run, completion anchor, existing protections and independent run/Project successor controls; application safe points use no fabricated Project count. Application-scope FileSafe security-event retention remains pending and unchanged. Whole-lane guard-table certification and NUMRULE adoption remain part 2.

**Sweep part 2A/2B oracle certification.** Every refusal of both complete checkers for the families above is one named row of a generated Method B guard table (204 tables, 405 rows; `python3 scripts/pm-filesafe-table-generate.py --check` keeps them current). `python3 scripts/pm-filesafe-guard-tables.py --out DIR` replays every witness of both CLIs under the observation recorder, checks the uncapped lane matrix, and runs the gated shared guard tool once per table; rows no input can refuse first stay as checks in tables of their own and earn no credit. `Plans/filesafe_event_p2a_cases.json` holds the coherent one-defect witnesses for rows the earlier fixtures left without one (`python3 scripts/pm-filesafe-p2a-cases.py --check`); both CLIs check them. `python3 scripts/pm-filesafe-number-corpus.py` runs the shared NUMRULE number corpus and 4,400-digit integers through the complete checkers, and `python3 scripts/pm_event_numbers.py --self-test --scope numbers` must report pass. Limits are unchanged in kind: each schema occurrence is one structural verdict row (individual JSON Schema keywords are not cut one by one), date-time formats remain the interim lane grammar pending CV-1101, and native execution stays NOT_RUN.

### ATS-210 - Current Goal writer and run projector oracles

```yaml
plan_unit_id: ATS-210
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored owner contract under DL-045 (2026-11-04). It names the static oracles of five current Goal writers, each with its own cases in Plans/goal_current_writer_oracle_fixtures.json, checked by python3 scripts/pm_goal_current_writer_oracles.py. goal.updated: v3 payload cases for direct Save and the approved-proposal shape, SP-421 identity vectors, SP-299 progress edges with lost-acknowledgement paths, Storage dedupe and the active-only reader. goal.cancelled: v3 payload cases, SP-422 identity vectors, payload-to-identity joins, the SP-310 late-assignment rule (only sequence_id is assigned late), dedupe and the current inspection. goal_run.started: the SP-311 started-only projector rule table. goal_run.cancelled: the SP-312 combined projector rule table. goal_run.certified: the GRS-085 mandatory prefix projection rule table. A pass shows static consistency of owner text, schemas and rule tables; no producer, projector, durability or recovery is proven, and every native obligation stays NOT_RUN.
gui_related: false
gui_classification_reason: Names static oracles for event contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-068
- GRS-073
- GRS-078
- GRS-079
- GRS-080
- GRS-085
- SP-299
- SP-304
- SP-310
- SP-311
- SP-312
- SP-421
- SP-422
- ATS-057
- DL-045
unblocks: []
acceptance_criteria:
- python3 scripts/pm_goal_current_writer_oracles.py exits 0 with every case of the five families matching.
- Each family's cases name only its own owner units; no case of one family is evidence for another.
- Cases the fixture lists as not_covered stay open and are not reported as passing.
validation_surfaces:
- Plans/goal_current_writer_oracle_fixtures.json
- python3 scripts/pm_goal_current_writer_oracles.py
risk_class: current_goal_writer_oracle_drift
reasoning_tier: high
context_scope: goal_current_writer_oracles
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_current_writer_oracle_fixtures.json
- scripts/pm_goal_current_writer_oracles.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 10)
preserved_exact_tokens:
- goal_current_writer_oracle_fixtures.json
- NOT_RUN
negative_constraints:
- No native, durability, recovery or readiness claim from a static pass.
- No admission, registry change or checkpoint move.
owner_hints:
- Plans/Automated_Testing_System.md
```

Amended 2026-11-05 (DG-OWN-C, DL-045): Exactly goal.updated, goal.cancelled, goal_run.started, goal_run.cancelled and goal_run.certified separately adopt W1, W2, W3, W4 and W5 respectively through ATS-1116/1117/1118. Each retains its own complete original roots and source/custody/final-boundary cases. The complete new contract is `Plans/goal_own_c_contracts/protocol.md`; full inherited-root executable coverage remains required. Native execution stays NOT_RUN.


**Per family.** Each family's fixture section lists its owner units and its cases.

| Family | Cases | Still open |
|---|---|---|
| `goal.updated` | 9 payload (2 positive), 6 identity, 10 progress sequences, 4 dedupe, 3 reader | The agent-proposed producer route, until the approval-owner provider exists (GRS-068) |
| `goal.cancelled` | 4 payload (1 positive), 3 identity, 3 payload joins, 5 late-assignment, 4 dedupe, 2 inspection | Native Stop, D05/D06 and inspection evidence |
| `goal_run.started` | 8 projector sequences | Native projector, crash and cutover evidence |
| `goal_run.cancelled` | 7 projector sequences | Native projector, crash and cutover evidence |
| `goal_run.certified` | 6 projector sequences | ATS-057's coordinator identity, append, commit and release cases for the v7/prepare.v2 edition, and consumer P4-P8 cases |

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-068, ContractName:Plans/Goal_Runtime_System.md#GRS-073, ContractName:Plans/Goal_Runtime_System.md#GRS-079, ContractName:Plans/Goal_Runtime_System.md#GRS-080, ContractName:Plans/Goal_Runtime_System.md#GRS-085, ContractName:Plans/storage-plan.md#SP-421, ContractName:Plans/storage-plan.md#SP-422, ContractName:Plans/Decision_Log.md#DL-045

### ATS-211 - Historical Goal reader oracles

```yaml
plan_unit_id: ATS-211
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored owner contract under DL-045 (2026-11-04), expanded for DL-079 and E-CARDS-1 Card 3 A. Ten exact historical families have independent closed answers and Plans/goal_<family>_history_contract_fixtures.json, checked by python3 scripts/pm_goal_history_reader_fixtures.py: child_status, degraded, scheduled, progressed, replanned, stopped, verification_decided, evidence_captured, receipt_recorded and tool_check_recorded. Payload/schema-boundary cases, full disclosure/source/identity joins, original SP-420 receipt plus accepted-at-issue owner/checkpoint custody, original row/revision/runtime/reference predicates, lawful-retained with a retired writer/changed live state, forged/withdrawn source and both-scope new/equal-retry refusal are distinct test inputs. Current absence of demonstrated original admission keeps SP-271/277/280/431/432/433 unavailable and SP-300..303 unresolved with original_admission; an authentic conditional original-lawful pair is not invalidated by writer retirement. Strict full-match and UTC guards preserve pinned historical schema bytes. Every reference, even unused definitions, resolves eagerly; an injected dangling ref must fail. Guard-removal tables rerun the complete negative corpus, disabling actual predicates without changing expected results. Static owner/source-model coverage is not a native reader or historical-instance claim; full original helper/provenance integration remains a separate incomplete oracle obligation.
gui_related: false
gui_classification_reason: Names static oracles for historical event readers; no visual surface.
split_recommended: false
depends_on:
- SP-271
- SP-277
- SP-280
- SP-300
- SP-301
- SP-302
- SP-303
- SP-420
- DL-045
unblocks: []
acceptance_criteria:
- python3 scripts/pm_goal_history_reader_fixtures.py exits 0 with all ten exact-family cases and guard-removal sensitivity matching.
- Missing original admission never verifies; authentic original-lawful conditional fixtures verify independently of current live state or writer retirement and claim no actual instance.
- The EA-UND-0003, 0006, 0007, 0008, 0009, 0010, 0011, 0012, 0013 and 0015 Goal pairs stay historical conditional oracles.
validation_surfaces:
- Plans/goal_history_reader_outputs.schema.json
- python3 scripts/pm_goal_history_reader_fixtures.py
risk_class: historical_goal_oracle_drift
reasoning_tier: high
context_scope: historical_goal_reader_oracles
implementation_surfaces:
- Plans/Automated_Testing_System.md
- scripts/pm_goal_history_reader_fixtures.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 7)
preserved_exact_tokens:
- goal_history_reader_outputs.schema.json
- verified_historical
negative_constraints:
- No native reader, durability or historical-instance claim from a static pass.
owner_hints:
- Plans/Automated_Testing_System.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-420, ContractName:Plans/storage-plan.md#SP-271, ContractName:Plans/storage-plan.md#SP-300, ContractName:Plans/Decision_Log.md#DL-045

### ATS-212 - Current goal_run.stopped and goal_run.blocked oracles

```yaml
plan_unit_id: ATS-212
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04). It names the static oracles of goal_run.stopped and goal_run.blocked v3, each with its own section in Plans/goal_run_stop_block_oracle_fixtures.json, checked by python3 scripts/pm_goal_run_stop_block_oracles.py: v3 payload cases (including rejected v2-only members), the SP-426 and SP-427 identity vectors, the D-R21 and D-R16 source-status tables, the GRS-202 projection rule table, and the wiring expectations (cmd.orchestrator.pause and cmd.runtime.abort_run reach the stop writer; the block writer has no command). A pass shows static consistency only; the writers are not installable on any existing birth (EP-200), and every native obligation stays NOT_RUN.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- EP-200
- GRS-200
- GRS-201
- GRS-202
- SP-426
- SP-427
- SP-428
- CV-420
- CV-421
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- python3 scripts/pm_goal_run_stop_block_oracles.py exits 0.
- Each family has its own cases; no case of one family is evidence for the other.
- EA-UND-0016-GOAL and EA-UND-0021-GOAL stay the v2 historical oracles.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_stop_block_oracle_drift
reasoning_tier: high
context_scope: goal_run_stop_block_oracles
implementation_surfaces:
- Plans/Automated_Testing_System.md
- Plans/goal_run_stop_block_oracle_fixtures.json
- scripts/pm_goal_run_stop_block_oracles.py
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "goal_run_stop_block_oracle_fixtures.json"
- "NOT_RUN"
negative_constraints:
- No native, installation or readiness claim from a static pass.
owner_hints:
- Plans/Automated_Testing_System.md
```

The fixture lists, per family, what stays open: the fresh Workflow source edition that installs EP-200's writers, and native settlement, append and projector evidence.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-200, ContractName:Plans/Goal_Runtime_System.md#GRS-200, ContractName:Plans/Goal_Runtime_System.md#GRS-201, ContractName:Plans/Decision_Log.md#DL-080

### ATS-213 - Project Goal blocked and ordinary completed successor oracles

```yaml
plan_unit_id: ATS-213
unit_type: owner_contract
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: Static v3 shape, identity, body CAS, four-state host/evidence/Stop and completion-barrier oracles;
  original source and native activation remain incomplete.
gui_related: false
gui_classification_reason: Internal event, custody and host predicates; no new visual surface.
split_recommended: false
depends_on:
- GRS-203
- GRS-204
- SP-429
- SP-430
- CV-422
- CV-423
unblocks: []
acceptance_criteria:
- Every static negative is isolated and removed-guard sensitivity is reported.
- No exception route, paused/blocked completion or unavailable source is admitted.
validation_surfaces:
- Plans/goal_lifecycle_successor_fixtures.json
- python3 scripts/pm_goal_lifecycle_successor_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_event_authority
reasoning_tier: high
context_scope: ats-213_event_authority
implementation_surfaces:
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- event-authority-20261104/reviews/DG-sol/REVIEW.md
preserved_exact_tokens: []
negative_constraints:
- No registry or app edition change, native admission or runtime proof.
owner_hints:
- Plans/Automated_Testing_System.md
```

The independent exact families goal.blocked (GRS-203/SP-429/CV-422) and goal.completed (GRS-204/SP-430/CV-423) use Plans/goal_lifecycle_successor_fixtures.json and python3 scripts/pm_goal_lifecycle_successor_oracles.py. Each has its own cases for schema closure, full-string digest/time/ID boundaries, original identity, current body CAS and revision, metadata-only history preservation, authenticated host/evidence and Stop epochs, same semantic retry with Storage-only changes, replay_only refusal before retry, and writer/reader withdrawal. goal.blocked additionally tests its resolved blocked_reason_ref and active/blocked edges; goal.completed tests owning-caller evidence, current exact To-Do list and accepted skip disposition, admitted/bound/background/recovery work, internal owner predicate, host-only completion and unavailable approved-exception route. Whole-v2 remains a separate historical reader and never becomes current by fixture validation.

No native execution is claimed. The physical original host source/pending-result edition and native method installation remain unbound in GRS-203/204 and SP-429/430; these oracle cells stay PARTIAL. A missing ordinary contract is not a new Jared product question. DL-081 exception-route integration is separately refused until Goal/Workflow/HITL owns its actual original authority.

Round 1 oracle qualification (ATS-210/212): replay-only normal append and equal retry refuse before dedupe; semantic-body comparison is computed from CV-339 caller fields, with Storage-only sequence/observed/persisted changes returning the original receipt. Cancellation late assignment compares the complete key set and all immutable members. Stop/block projection tests verified original rows, original admitted source/installed writers/profile, authentic-birth descriptor binding, exact expected and successor revisions, new repeated evidence and matching Storage/checkpoint identities. Positive fresh-source fixtures are explicitly conditional and do not install a Workflow edition. goal.updated, goal_run.stopped and goal_run.blocked retain PARTIAL oracle cells alongside the already acknowledged producer/coordinator/current-inspection gaps.
