# Shard 054: Original Standard certification contract shapes

Source: `Plans/Contracts_V0.md`

Source lines: L22280-L22360

Source SHA256: `083dc7844e67d48919a9d0f5b6b9cd37f013bb40f35ad2da6ee465e68e3466f9`

---

## Original Standard certification contract shapes

CV-340 owns the exact schema and source-value byte definitions for GRS-065/SP-289. This is a new bounded same-family technical definition under DL-045; no generic writer/reader union becomes authorization or installed native dispatch.

### Exact schemas and interface selection

`Plans/goal_certification_custody.schema.json` has the exact generic Goal receipt v1 root. Its closed definitions are:

| Definition | Meaning |
|---|---|
| `legacy_goal_receipt_v1` | Exact original `pm.storage_value.goal_receipt.v1@1.0.0`, with all existing kinds, tiers and optional/nullable fields preserved. |
| `certification_semantics` | Original Standard-tier decision metadata at semantic `schema_version = 1.0.0`; preserves the distinct certified and approved-exception syntax/labels. |
| `standard_certification` | Selected current Plans-to-Code source schema, decision/label certified and passing validators; relational original-owner predicates remain mandatory. |
| `standard_certification_custody_v2` | Exact `pm.storage_value.goal_receipt.v2@2.0.0` outer Storage instance/key, lossless generic-shaped component and original Standard certification. |
| `registered_current_write_value`, `registered_read_value` | Disjoint exact v1/v2 value grammars; actual roles select their own route, never a union by shape. |
| `standard_read_request` | Exactly Storage instance, Project, Goal, GoalRun and receipt ID; no claimed permission, witness, current locator or body content. |

SP-289's `storage.goal_receipt.capture_standard.v2` receives the actual original Workflow-owner result/capability through its authenticated owner boundary, not a public caller-supplied JSON grant. The fixed schema path and complete source/owner/afterimage predicates jointly constrain its prospective v2 value. `storage.goal_receipt.read_standard.v1` accepts `standard_read_request`, selects the actual canonical v2 row and returns only `standard_certification`. Original generic roles use `Plans/goal_receipt_version_routes.json`; when reading v2 they may project only its exact generic-shaped component after current origin/version/reader checks, without gaining Standard-proof authority. No old generic reader silently accepts an unknown stored version.

The semantic record retains receipt/Project/Goal/GoalRun identity, tier, source Workflow ref/hash/schema, original certifier/time, workgraph ref/revision/hash, acceptance dispositions, changed-artifact refs, validator outputs with original source-ref/hash bindings, child and WorkNode receipts with the complete required WorkNode set, original authority checks, unresolved-risk/approval refs, final decision and truthful result label. Storage-assigned outer schema metadata is separate. Prototype `proposal_version` and semantic `proposal.1` never appear in native persisted values; assigning the new native versions is not a migration of experiment data.

### Exact original source-value hash bytes

The implicit source-hash codec for semantic version `1.0.0` is `pm.goal.certification_source_json.v1`. Hash the complete schema-validated original value, including all required/optional-present fields and nulls. Its value domain is null, boolean, integer, valid Unicode string, array and string-keyed map. Reject floats (including integral floats and negative zero), NaN/infinity, duplicate input keys, unpaired surrogates, foreign keys/types and any unencodable value before issuance; never coerce/truncate them or ignore extra schema fields. Schema-specific ranges still apply. This local source-value recipe does not redefine an EventRecord, receipt public shape or global artifact codec.

Encode UTF-8 without BOM or normalization. Null/booleans use lowercase JSON tokens. Integers use shortest exact decimal digits with a leading minus only for a negative value, no exponent/plus/leading zero. Arrays preserve declared order. Map keys sort by their exact UTF-8 bytes. Use `{`, `}`, `[`, `]`, `,` and `:` without whitespace. Strings have double quotes. Encode a quote as byte pair `5c 22` and a backslash as `5c 5c`. Encode backspace, form feed, newline, carriage return and tab as byte `5c` followed by ASCII `b`, `f`, `n`, `r` and `t`, respectively. Other U+0000–U+001F controls use byte `5c`, ASCII `u` and exactly four lowercase hexadecimal digits. Emit other valid Unicode directly; do not escape slash or normalize text. SHA-256 is lowercase hex of those exact bytes, with no extra newline or domain prefix. The semantic version and field context select the recipe.

`source_workflow_sha256` covers the actual complete resolved `goal_completion_receipt`; `workgraph_sha256` covers the complete original accepted graph/required-set value selected by its actual owner; each validator source binding covers its complete original owned validator-result value; each `authority_sha256` covers the complete original authority-check value before adding that digest to its retained projection. Original source envelopes remain owner inputs, not new durable record types. A bare hash or fixture envelope never authenticates their native origin. Other existing source/runtime/permission receipt hash contracts remain unchanged.

Map insertion order has no authority. Resolve required WorkNodes, children, validators and criteria by exact key-set membership, then preserve explicitly ordered required arrays and original source refs in the retained projection. Missing/extra/duplicate or mis-scoped results reject. Timestamp comparison uses exact UTC integer seconds plus the complete decimal fractional value; compare offsets mathematically without floating-point rounding and preserve each original string, precision and spelling. Equal instants may retain different original spellings; no newly computed clock restamps the original receipt.

The same complete typed values, selected preimages and original authority/origin facts must survive every final helper boundary. Encode native stored v1/v2 rows with the existing family canonical MessagePack encoding, distinct from this source-value JSON hash recipe. Exact native encoding/owner admission and the concurrent dispatcher require their own installation and execution proof. Canonical schema/codec fixtures and bounded source/return checks are recorded in `reports/event-authority-20260911/step-08-certified-custody-validation.md`; no native or event-depth pass follows.

### CV-340 - Original Standard Certification Schemas And Source Bytes

```yaml
plan_unit_id: CV-340
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The Original Standard certification contract shapes define exact generic v1, Standard v2,
  retained-read and five-field request routes plus semantic certification version 1.0.0.
  Complete original source values use the exact certification_source_json.v1 hash recipe;
  original types, required-set order, timestamp precision and truthful decision distinctions
  remain exact. Value grammar does not establish owner authority or installed role dispatch.
gui_related: false
gui_classification_reason: Defines internal original certification metadata, custody and owner interfaces; no GUI presentation is specified.
depends_on: [CV-288, DL-045]
unblocks: []
acceptance_criteria:
  - "Generic v1 root and exact retained schema stay complete; native Standard v2 and original semantic version 1.0.0 are separate from prototype metadata."
  - "The Standard writer excludes exception and skipped-validator branches while preserving their distinct existing semantic meaning."
  - "Source hashes match complete original values under the explicit UTF-8 JSON recipe, with ordered arrays, sorted maps, exact integers and no unsupported type coercion."
  - "Read request/output shapes are closed and actual owner/selected-row/request/output joins remain required after every dependent helper."
  - "Canonical MessagePack storage, source-value hashes, schema/role definition and native installation proof remain distinct."
validation_surfaces:
  - Plans/goal_certification_custody.schema.json
  - Plans/goal_certification_custody_fixtures.json
  - Plans/goal_receipt_version_routes.json
  - reports/event-authority-20260911/step-08-certified-custody-validation.md
risk_class: false_certification_or_lost_original_decision_authority
reasoning_tier: high
context_scope: original_standard_certification_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: original_standard_certification_contracts
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - reports/event-authority-20260911/step-08-certified-custody-checks.json
negative_constraints:
  - Do not infer certification from an accepted marker, worker success, body receipt, event or projection.
  - Do not claim native installation, event/body publication, exception authority or complete event depth from this prerequisite.
owner_hints:
  - Plans/Goal_Runtime_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
```
