# W4 — deterministic enforcement witness for F106, F108, F109

Written 2026-09-17. No model was called; no Jev calls were made. Everything
below is a replay of the real JSON Schema validator against the two frozen
schema trees, and every row can be reproduced with the commands in
`commands.sh`.

## What was built

`required_field_witness.py` — given a schema tree, a schema file, a `$defs`
name and an instance, it runs the validator twice: once on the unmodified
instance (**positive control**, must be ACCEPTED) and once on the instance with
a field removed (`--remove`) or a value substituted (`--set`) (**witness**),
reporting ACCEPTED or REJECTED with the validator's own message. `--control-only`
runs just the control, for corrections whose claim is that a schema *refuses* an
honest record. `--expect accepted|rejected` keeps the verdict wording honest in
that inverted direction.

`crosscheck_fixtures.py` — replays an entire shipped fixture pack through the
witness's own validator and reports every case where the pack's label and the
validator disagree. This is the check that the witness's validator is the
gate's validator; see "Is this the real validator?" below.

Validator construction mirrors the repository's own gate,
`scripts/pm-new-contracts-verify.py`: `jsonschema.Draft202012Validator`, a
`referencing.Registry` populated from every `*.schema.json` in the tree keyed by
its own `$id` with a `retrieve` hook that **raises**, and definition selection
by replacing the root applicators with `{"$ref": "#/$defs/<name>"}` while
keeping `$id` and `$defs`.

### Cross-file `$ref` resolution is real, and the tool proves it

The jujutsu schema's `verified_revision`, `expected_revision` and
`before_revision` resolve through
`https://puppetmaster.local/schemas/source-control/1.0.0/source_control_contracts.schema.json#/$defs/jujutsu_revision`
— a different file. `--prove-refs` walks the selected definition's `$ref` graph
through the registry, reports the external `$id`s it actually had to resolve,
and then re-runs the same validation against a registry with those resources
**withheld**. On every F106 and F108 run the withheld-registry control failed
with:

```
Unresolvable: https://puppetmaster.local/schemas/source-control/1.0.0/
source_control_contracts.schema.json#/$defs/jujutsu_revision
```

A stubbed or skipped `$ref` would have passed that control. It did not. (The
source-control schema has no external `$ref` at all, so the F109 runs correctly
report "local pointers only" rather than claiming a resolution they did not
perform.)

## Trees and instances

| role | path | schema sha256 |
|---|---|---|
| baseline 2026-09-13 | `inputs/reviewed-repository-20260913/Plans/source_control_contracts.schema.json` | `39dda3e18a9cd96e7d561919a7a110c950db2826564c7e5fc76cf25565cb8a5a` |
| baseline 2026-09-13 | `inputs/reviewed-repository-20260913/Plans/jujutsu_integration_contracts.schema.json` | `de5570c37d5f502f2d6f3e511d322a117e9e958600aebf3d7a0d14ee9f7f4711` |
| current main `a6162b559b` | `snapshot/main-a6162b559b/Plans/source_control_contracts.schema.json` | `fb4b0812dafdbbf2063a80299e7805e114c9cafc9bd43bc20726d3ccd25c2523` |
| current main `a6162b559b` | `snapshot/main-a6162b559b/Plans/jujutsu_integration_contracts.schema.json` | `2e78d087706de9e53702b6463c267688ea31b3ba4a162a220e5939fb3de4dbaa` |

**The 2026-09-13 baseline copy has no fixture files** — it is two schemas and
two Markdown documents. Every instance therefore comes from main's fixture
packs, copied verbatim into `fixtures/` with `SHA256SUMS.txt`:

- `main-a6162b559b__source_control_contract_fixtures.json` `8f8ba18c83734d1bb709e28626729189557c0323654ea3ce500928a8de9be418`
- `main-a6162b559b__jujutsu_integration_contract_fixtures.json` `2f35bd5db1cbadb8cff1c9f271e3422cb68d0307db0337c16d8954fa32ded0ac`

**No instance was constructed.** Every record used below is a named `valid`
fixture case shipped in the repository. Each one was run as a positive control
against *both* trees before any omission or substitution, and the controls are
in the tables. Using a main-era record against the older schema is the correct
direction for F106 and F109 — a record the fixed schema calls valid is exactly
the record the old schema should have rejected once mutated — and the controls
confirm the old schema accepts those records unmutated.

Registry size differs by tree (2 schemas at the baseline copy, 328 at main)
because the baseline copy contains only two schema files. Both trees resolve
the one cross-file reference that matters; nothing in these definitions reaches
any other schema.

---

## F109 — required transport credential evidence

Definition `credential_lease` in `source_control_contracts.schema.json`.
Proposition: the neutral credential lease must *require* `use_http_path` for
HTTPS and `known_hosts_receipt_ref` plus `forwarding_disabled` for SSH. The
baseline constrains those fields only when present — `then` carries
`properties` but no `required`.

Positive controls (unmutated fixture records) — **ACCEPTED at both trees, all
four rows**.

| field(s) removed | fixture case (positive control) | baseline 2026-09-13 | main a6162b559b | validator message at main |
|---|---|---|---|---|
| `use_http_path` (transport https) | `https_credential_lease_is_promptless_and_path_scoped` — control ACCEPTED at both | **ACCEPTED (defect)** | **REJECTED (fix)** | `/allOf/0/then/required` -> `'use_http_path' is a required property` |
| `known_hosts_receipt_ref` (ssh) | `ssh_credential_lease_binds_known_host_and_disables_forwarding` — control ACCEPTED at both | **ACCEPTED (defect)** | **REJECTED (fix)** | `/allOf/1/then/required` -> `'known_hosts_receipt_ref' is a required property` |
| `forwarding_disabled` (ssh) | same — control ACCEPTED at both | **ACCEPTED (defect)** | **REJECTED (fix)** | `/allOf/1/then/required` -> `'forwarding_disabled' is a required property` |
| both ssh trust fields | same — control ACCEPTED at both | **ACCEPTED (defect)** | **REJECTED (fix)** | both messages above |

The whole difference is two `required` lists added inside the existing
transport branches. The `const`/non-empty constraints are byte-identical
between the trees, which is what the accepted scope asked for.

**F109 is witnessable at the schema layer, in full.** All four omission
witnesses the correction asked for exist, are deterministic, and reverse
exactly at the fix.

---

## F106 — restore readiness consistency (JJI-008)

Definition `backup_jj_restore_verification_receipt` in
`jujutsu_integration_contracts.schema.json`.

**F106 is not a required-field omission and cannot be witnessed as one.** All
five fields at issue are already in the definition's common `required` list at
both trees; removing any of them is rejected by both, which proves nothing. The
defect is that the readiness branch constrained the *values* of
`historical_operation_result`, `object_closure_result`, `conflict_refs`,
`collision_refs` and `activation_config_disposition` and never the values of
`working_copy_relation`, `workspace_map_result` or
`colocation_activation_disposition`. The witness is therefore a **value
substitution**, and the tool's `--set` mode does it. Main's fix is a third
`allOf` branch keyed on `outcome = ready_for_owner_activation`.

Positive control for every row: `backup_jj_restore_ready_for_owner_activation_is_internally_consistent`,
**ACCEPTED at both trees**. Cross-file `$ref` proof passed on every row.

| substitution on a `ready_for_owner_activation` receipt | baseline 2026-09-13 | main a6162b559b | validator message at main |
|---|---|---|---|
| `working_copy_relation` -> `"unverified"` | **ACCEPTED (defect)** | **REJECTED (fix)** | `/allOf/2/then/properties/working_copy_relation/enum` -> `'unverified' is not one of ['matches_latest_snapshot', 'dirty_files_preserved_separately']` |
| `workspace_map_result` -> `"collision_blocked"` | **ACCEPTED (defect)** | **REJECTED (fix)** | `/allOf/2/then/properties/workspace_map_result/enum` -> `'collision_blocked' is not one of ['verified', 'remap_required']` |
| `colocation_activation_disposition` -> `"blocked_dual_writer_or_identity_collision"` | **ACCEPTED (defect)** | **REJECTED (fix)** | `/allOf/2/then/properties/colocation_activation_disposition/enum` -> not one of `['restored_colocated_single_writer', 'owner_rebind_non_colocated_required']` |

The reviewer's own record of F106 (`claude-hicap-findings.json`) says the arm
named two of the three counterexamples exactly and missed the
`colocation_activation_disposition` case. The validator confirms all three were
real at the baseline and all three are closed at main, which is a fact about
the contract, not about the arm's credit.

**F106 is witnessable at the schema layer, as a value-substitution witness, not
as an omission witness.**

---

## F108 — clone identity before native initialization

Definitions `command_request` and `command_result` in
`jujutsu_integration_contracts.schema.json`.

**F108 runs in the opposite direction from F106 and F109.** Those two say the
schema *accepts too much*, so the witness is a mutation that should be rejected
and is not. F108 says the schema *refuses an honest record* — it unconditionally
requires native `expected_revision`, `currentness.snapshot_id`,
`currentness.expected_operation_id` and `before_revision` for a destination that
native initialization has not created yet. The witness is therefore the honest
pre-initialization record itself, and the defect shows up as a **rejection at
the baseline**.

Main's fix adds a `native_state_phase` discriminator, a
`currentness_fence_uninitialized_destination` definition whose `snapshot_id` and
`expected_operation_id` are `"type": "null"`, and one phase-keyed `if/then/else`
branch on each of `command_request` and `command_result`.

Shared positive control — an *initialized* clone record, which must keep
validating at both trees:

| positive control | baseline | main |
|---|---|---|
| `command_request_jujutsu_git_clone` | **ACCEPTED** | **ACCEPTED** |
| `command_result_jujutsu_clone_succeeded_returns_exact_onboarding_context` | **ACCEPTED** | **ACCEPTED** |

Witness — the honest not-yet-initialized record:

| record under test | baseline 2026-09-13 | main a6162b559b | validator messages at the baseline |
|---|---|---|---|
| `command_request_jujutsu_git_clone_destination_not_initialized` | **REJECTED (defect: 4 errors)** | **ACCEPTED (fix)** | `Additional properties are not allowed ('native_state_phase' was unexpected)`; `/currentness/expected_operation_id: None is not of type 'string'`; `/currentness/snapshot_id: None is not of type 'string'`; `/expected_revision: None is not of type 'object'` |
| `command_result_jujutsu_clone_not_initialized_destination_cancelled` | **REJECTED (defect: 4 errors)** | **ACCEPTED (fix)** | same three plus `/before_revision: None is not of type 'object'` |

The baseline's four messages are the correction's claim, stated by the
validator: there is no phase discriminator to carry, and every native identity
field refuses null, so the only records the baseline admits for this phase are
ones with fabricated identities.

Because "accepts more" is the easy way to break a contract, four
**non-loosening** checks at main confirm the phase branch did not waive the
fences. All four have `command_request_jujutsu_git_clone_destination_not_initialized`
or `command_request_jujutsu_git_clone` as an ACCEPTED positive control:

| check at main | result | message |
|---|---|---|
| pre-init phase on a non-clone command (`cmd.jujutsu.git.fetch`) | **REJECTED** | `/allOf/0/then/properties/command_id/const` -> `'cmd.jujutsu.git.clone' was expected` |
| pre-init record claiming a native `snapshot_id` | **REJECTED** | `/allOf/0/then/properties/currentness/properties/snapshot_id/type` -> not of type `'null'` |
| pre-init record claiming a native `expected_operation_id` | **REJECTED** | same shape, `expected_operation_id` |
| initialized clone with `expected_revision: null` | **REJECTED** | `/allOf/0/else/properties/expected_revision/type` -> `None is not of type 'object'` |

**F108 is witnessable at the schema layer, in the over-restrictive direction.**
One caveat that belongs to F108 and not to the other two: the witness record is
the *fixed* schema's own idea of what an honest pre-init record looks like. The
validator proves the baseline refuses that record; it cannot prove that record
is the right design. That judgement was the reviewer's, and it stays the
reviewer's.

---

## Is this the real validator?

A witness is worth nothing if its validator is not the gate's validator. Both
shipped fixture packs were replayed through the witness's own machinery
(`crosscheck_fixtures.py`, logs in `logs/`). Denominators are cases carrying a
`definition` key; `invalid` cases are materialized from their `base_valid` plus
`patch`/`remove`, dotted paths included.

| pack x tree | cases | disagreements | what they are |
|---|---:|---:|---|
| jujutsu x main | 51 valid + 74 invalid | **0** | — |
| jujutsu x baseline | 51 valid + 74 invalid | **5** | exactly F106's 3 counterexamples (accepted) and F108's 2 pre-init records (rejected). Nothing else in 125 cases moved between 2026-09-13 and main. |
| source_control x main | 67 valid + 112 invalid | **4** | all four are `source_graph_projection` relational rules — see below |
| source_control x baseline | 60 valid + 93 invalid (26 skipped: 3 definitions absent) | **8** | 4 are F109's own omission negatives (accepted at the baseline); 4 are `source_graph_projection` valid records the baseline rejects because it lacks `parent_refs_truncated` / `parent_expansion_cursor_ref` |

Zero disagreements on 125 jujutsu cases at main, and a baseline disagreement
set that is precisely the two corrections under test, is the strongest available
evidence that the witness's accept/reject is the gate's accept/reject.

The four source-control disagreements at main are the important negative
result, and they are not a bug in this tool. The repository enforces those rules
in Python, in `source_control_semantic_failures`, whose own docstring says
"Evaluate the SCS-017 page relations JSON Schema cannot express":
`returned_count == len(nodes)`, `returned_count <= page_size`, and `node_ref`
uniqueness within a page. **F107's landed fix is therefore only partly
schema-expressible**; its relational core lives in gate code, and no
schema-layer witness can establish it. F107 was not in this brief's scope, but
it is the clearest example of the boundary this workstream is measuring.

---

## Which corrections are witnessable at the schema layer

| correction | witnessable | form of witness | rows |
|---|---|---|---:|
| **F109** required transport credential evidence | **yes, in full** | required-field omission | 4 fields x 2 trees |
| **F106** restore readiness consistency | **yes** | value substitution, *not* omission — the fields were already required | 3 substitutions x 2 trees |
| **F108** clone identity before native initialization | **yes** | over-restrictive direction: the honest record itself, rejected at the baseline | 2 records x 2 trees + 4 non-loosening checks |
| F107 graph page consistency (out of scope, observed) | **no, not in full** | relational within-page rules; enforced by gate Python, not JSON Schema | 4 negatives the schema alone accepts |

26 witness records in `witness_records.jsonl`. Every positive control that was
run as a control passed. (The two `F108/preinit-*@BASELINE` rows show
`positive_control REJECTED` because in `--control-only` mode the record under
test *is* the control; their true positive controls are the two
`F108/control-initialized-clone*@BASELINE` rows, both ACCEPTED.)

## What the validator cannot establish

1. **Semantic rules outside JSON Schema.** Measured, not asserted: four
   `source_graph_projection` negatives the shipped pack calls invalid are
   accepted by the schema alone at main, because the gate enforces them in
   Python. Any correction whose content is a relation between sibling fields, a
   count, or a uniqueness rule can land correctly and still be invisible to a
   schema-layer witness.
2. **Currentness.** This compares two frozen copies: a 2026-09-13 reviewed
   snapshot and `snapshot/main-a6162b559b`. It says nothing about the shared
   checkout's working tree now, nor about anything that landed after the
   snapshot was taken.
3. **Runtime.** A schema constrains records. It does not show that any code
   emits them, that `use_http_path=true` reaches a git invocation, that a
   known-hosts receipt's referent exists or is current, that no credential
   leaks, or that a restore ever ran. F109's own excluded scope says the same
   thing, and the repository gate's header says it: "This gate proves only
   schema/fixture consistency."
4. **Whether a fixture is representative.** Every instance here is a fixture the
   repository ships. That the fixed schema rejects these particular omissions
   does not establish that no other record can express the same dishonesty by a
   different route.
5. **Attribution.** The validator establishes that a defect existed at one
   commit and does not at another. It says nothing about which arm, model or
   review found it, and nothing about whether a correction was worth its cost.
6. **Design correctness.** Most sharply for F108: the validator shows the
   baseline refuses the pre-init record. Whether that record is the right way to
   represent the phase is a judgement the validator cannot make.

## Files

- `required_field_witness.py` — the witness
- `crosscheck_fixtures.py` — validator-equivalence check against the shipped packs
- `commands.sh` — every command run, in order
- `witness_records.jsonl` — 26 machine records
- `logs/` — the four cross-check logs
- `fixtures/` — the two fixture packs used, with `SHA256SUMS.txt`
- `PROGRESS.md`
