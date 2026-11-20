# Lane DC — sweep part 2B: shared date-time and number rules, SP-1101 dispatch

Branch `plans/ea-collab-prep-20261104`. Part 2A head `db4b43d1e5`; gated NUMRULE merge `1540e7b2e5` (exactly `58c2816ff3`, `--no-ff`); implementation commits `eb35803e69`, `7a5d6328f0`, `3fc4856820` and `38ee4e0eac` (code final at `38ee4e0eac`); owner-text commit `ab33fa4046`; the report commit's SHA is in the external `HEAD.txt`. No rebase this round.

**All 18 families keep 10 PASS / 1 PARTIAL / 1 ABSENT. Readiness: NOT_READY (prepared for the batch-2 review).** Every DC timestamp field is now checked by the shared CV-1101 predicate `pm_event_datetime.date_time` with its owner's profile, so **this lane's timestamp review is no longer interim** (the field table below names the check per field). The two leaks of DC's interim review refuse: `24:00:00Z` (family timestamps) and a trailing LF (owner-record pattern). Every integer slot of a current payload, EventRecord, prepared source, application wrapper and checkpoint goes through the shared `current_integer` (Storage fields `storage_uint64`), and raw SP-337 bodies go through `loads_current_json`. Identity preimages go through `qualified_jcs`, physical bytes through `storage_value_bytes` (EVENT_VALUE, APP_PHYSICAL), and retained reads through the shared `RetainedDispatcher` with a frozen v1 recipe. DC had the 4,400-digit crash; it is fixed. `positive_negative_oracles` stays PARTIAL. Timestamps and numbers are no longer among its reasons. It stays PARTIAL because `datetime_validator` and the inventory gate run only at batch-2 integration (Addendum 2), because schema occurrences are whole-schema rows without per-keyword cuts, and because native execution is NOT_RUN. Membership stays ABSENT.

## Sweep part 2B: findings and responses

### Step 1: the merge

| Item | What was done | Proof |
|---|---|---|
| **Branch head before the merge** | `origin/plans/ea-collab-prep-20261104` was `db4b43d1e5`, the part 2A head in `drafts/DC/sweep-p2a/HEAD.txt`. | `git rev-parse` after `git fetch origin`. |
| **Merge `58c2816ff3`** (`1540e7b2e5`) | `git merge --no-ff 58c2816ff33365384d4039553f5efdb5370930e6`. 163 conflicts, every one in `Plans/_shards/contracts_v0`, `Plans/_shards/storage-plan` or `Plans/.plan_index`; regenerated. **No non-derived conflict:** DC never held an old NUMRULE copy, so neither addendum resolution was needed. The only non-derived file both sides changed, `Plans/storage-plan.md`, merged without overlap. | Shards changed versus DC only for `contracts_v0` and `storage-plan`. Plan units are DC's 7,563 plus CV-1100, CV-1101, SP-1100, SP-1101 (7,567). The seven canonical texts that changed (CV-317, CV-366, SP-026, SP-236, SP-278, SP-286, SP-337) are byte-equal to `58c2816ff3`'s and unchanged on DC's side from the base `fb441b27fd`. `pm-shard-plans.py --check`: pass, 99 sources. Pushed alone first (`db4b43d1e5..1540e7b2e5`, both URLs). |
| **NUMRULE files** | None edited. | `git diff 58c2816ff3 HEAD -- scripts/pm_event_numbers*.py scripts/pm_event_datetime* Plans/event_number_recipe_corpus.json Plans/event_datetime_inventory.json` is empty. |

### Step 3: timestamps (SW-F1)

The lane-local grammar `valid_utc` (Python `fromisoformat`) is removed. `shared_timestamp(value, profile)` (`scripts/pm_collaboration_events.py:377`) is True only when `pm_event_datetime.date_time(value, profile=...)` returns the exact string; a `Refusal` (syntax, calendar, range, offset, leap second, zone profile, `str` subclass, non-string) is False. Owner timestamp positions are found by the schema itself: `timestamp_validator` (`:586`) adds the shared predicate to jsonschema's `pattern` keyword at exactly the owner timestamp definitions (`timestamp_nodes`, `:563`, matched by definition object, never by field name). Each check runs after the plain schema row, so its verdict differs by its own predicate only. No string is rewritten.

| Field | Owner | Shared check and profile | Row (table) |
|---|---|---|---|
| Family timestamp of all 18 families, both editions (`created_at_utc` … `finalized_at_utc`, `FAMILY_TS`) | DC, CV-460 rule 5 ("RFC 3339 UTC ending in `Z`") | `date_time`, **STORAGE_UTC_Z** (terminal uppercase Z); the payload pattern (uppercase `T`, 1–9 fraction digits, true end) is unchanged | PR03 (`payload_rules`) |
| EventRecord `occurred_at_utc` | EventRecord, CV-317/CV-1101 | `date_time`, **EVENT_RECORD**. EV13 still joins it to the family timestamp as a string, so a DC event's `occurred_at_utc` stays uppercase-Z. | EV15 (`envelope_datetime`) |
| EventRecord `observed_at_utc`, `persisted_at_utc` | Storage, CV-253 | `date_time`, **STORAGE_UTC_Z** | EV16, EV17 (`envelope_datetime`) |
| Collaborative Workflows owner times inside a prepared source (`owner_record.created_at`, `.completed_at`, `review_target_pack.frozen_at`, and every other CWC `utc_timestamp` / `utc_timestampApplicationV1` position) | Collaborative Workflows (`Plans/collaborative_workflows_contracts.schema.json`) | `date_time`, **EVENT_RECORD**; the owner pattern (uppercase `T`/`Z`, offsets allowed) is unchanged | SO06 (`source_times`) |
| Projector checkpoint `updated_at_utc`, `published_at_utc`, `withdrawn_at_utc` and the same fields in `retired_generations` | DC, SP-460 (projection `timestamp`, uppercase Z) | `date_time`, **STORAGE_UTC_Z** | CK20 (`checkpoint_values`) |
| Projection row timestamps (e.g. `run_projection.terminal.at_utc`) | DC, SP-460 | `date_time`, **STORAGE_UTC_Z** | PV02 (`projection_value_times`) |
| Application wrapper `record` times | — | equal to the owner record by WR03 (canonical join), so SO06 covers them | WR03 |

The same rows run on history: the frozen v1 verifier and the historical and checkpoint readers apply EV15–EV17 and PR03 to retained originals. CV-1101: "skipped past format enforcement never authorizes" invalid history.

**Leaks closed, each with a test (`scripts/pm_collab_p2b_cases.py`):**
- **`24:00:00Z`** (accepted by `valid_utc`) refuses at PR03 in every family/edition (`p2b:<payload>:family_time:*`, 108 negatives: hour 24, 29 February 2026, second 60 on a non-leap day, minute 60, month 13).
- **Trailing LF in an owner-record time** (the CWC pattern's unguarded `$`) refuses at SO06: `p2b:<source>:owner_time:created_at:lf` for every family whose run record time is not already joined; `:frozen_at:lf` for Review Start. Impossible dates, hour 24 and second 60 there refuse too (`:calendar`, `:hour_24`).
- **Storage fields:** `+00:00`, `-00:00`, `+05:30`, lowercase `z`, trailing LF and hour 24 refuse at EV16/EV17 (144 negatives).

Positives: a legitimate leap second (`2016-12-31T23:59:60Z`) at the family timestamp, both Storage fields, a checkpoint and a projection row; a 9-digit family fraction and a 12-digit Storage fraction; and an owner-record time with a `+05:30` offset (owner-valid under its own pattern). **Widening, stated plainly:** the old `valid_utc` refused every leap second; CV-1101 makes the legitimate one valid.

**The shared date-time inventory gate and `datetime_validator` (Addendum 2).** `python3 scripts/pm_event_datetime_inventory.py` exits **1** in this tree with exactly **one** failure: `inventory_node_changed` on `Plans/application_workflow_contracts.schema.json` `/$defs/BrowserProgramApplicationV1/properties/result_schema_dependencies`, field `resource_sha256` only. The resource changed when DC's `f17dff73cb` added the four collaborative `*StorageApplicationV2` wrappers (+424 lines). The gate fails closed as designed. `datetime_validator` and the inventory gate are not called in this lane tree; **they run at batch-2 integration**, after the inventory refresh. The combined self-test (`pm_event_numbers.py --self-test`, scope all) exits **1**: `case_execution: NOT_RUN_ADMISSION_REFUSED`, its only failing check `datetime_inventory_complete_and_classified`. `pm_event_datetime.py --self-test` exits 0 with no output (no entry point) and is not credited.

### Step 5: numbers (SW-N1..SW-N5)

| Item | Result | Where |
|---|---|---|
| **SW-N1 raw ingress** | `decode_current` is the shared `loads_current_json` (exact ints of any length; `-0`, leading zeros, non-finite, duplicate keys, lone surrogates refuse; fractional and exponent tokens stay `ParsedDecimal`). It reads every current raw text: SP-337 bodies (`reference_rejection`, `resolved_payload`) and wrapper record references. `decode_json` stays DC's v1 decoder for its own Plans data and, inside the frozen verifier, for retained originals; its integer tokens now go through `JsonNumber.exact()` (no 4,300-digit `int()` limit). | `:233`, `:199` |
| **SW-N1 integer slots** | `IntegerSlotValidator` (`:547`) extends jsonschema's `type`, `const` and `enum` so every schema integer slot also passes the shared `current_integer` with the slot's bounds. `properties` applies `storage_uint64` to SP-1100's Storage fields (`STORAGE_UINT64_FIELDS`). New rows, each after its schema row, current input only: **PN01** (payload), **EV18** `sequence_id` uint64, **EV19** `producer_sequence_id`, **SO07** (whole prepared source, `recovery_epoch` uint64), **WR08** (wrapper including its inline record), **CK21** (checkpoint, token, cursor, coverage, all uint64). An integral float, exponent or negative-zero spelling now refuses as new input. | `:605`, `:899`, `:1302`, `:1535`, `:1056` |
| **SW-N2 physical profiles** | **RP03** (new, `representation`): the stored record must encode under SP-236/SP-1100 EVENT_VALUE (`storage_value_bytes`). An integer outside −2^63..2^64−1 refuses before effects (code `event_value_encoding`). WR02 measures the wrapper with CV-366 APP_PHYSICAL (`app_physical_size`, `:1561`; byte counts equal the old `msgpack.packb` for every fixture). **WR07** (new) refuses a wrapper APP_PHYSICAL cannot encode (`application_wrapper_encoding`). `stored_size_report` sizes event records with EVENT_VALUE and wrappers with APP_PHYSICAL; holder, projection and checkpoint sizes stay a msgpack inventory. RP01 keeps SP-337's canonical UTF-8 JSON size, as CV-460 states. | `:961`, `:2085` |
| **SW-N3 signed zero and int/float** | DC's canonical commitment (recipe v1, SP-460) keeps one representation per mathematical value (CV-1100 keeps local recipes with their owner); its bytes are unchanged for every value v1 accepted. Integer slots now refuse every non-integer primitive, so a join cannot equate `1.0` with `1` at an integer slot of a current input. Physical bytes keep float type and signed zero (EVENT_VALUE, APP_PHYSICAL). `canonical` now renders exact ints of any length (`exact_decimal`, `:259`) and exact `ParsedDecimal` values when binary64 holds them exactly (refusing otherwise). **RF06** now also refuses an SP-337 body with no lossless canonical form; it previously skipped the comparison and let the payload rows decide. | `:271` |
| **SW-N4 digest recipes** | `jcs` (the SP-460 identity preimages, arrays of strings and nulls that the owner calls RFC 8785) is now the shared `qualified_jcs`. Bytes are identical for every identity vector (the full checker's identity vectors pass). `producer_digest` stays DC's payload-only recipe, never relabelled as `producer_semantic_digest`. `row_sha256` stays DC-local. No v1 restamping. | `:324` |
| **SW-N5 SP-1101 dispatch** | `original_dispatcher` (`:1255`) composes the shared `RetainedDispatcher` once with `DCOriginalOwner` (a sealed lookup of EVENT_VALUE bytes, `:1206`). It installs exactly one `FrozenRecipe` per family × edition × envelope edition, whose tuple pins the original resources (`V1_RESOURCE_MANIFEST_SHA256` over `Plans/event_record.schema.json` and `Plans/collaboration_event_payloads.schema.json`). Sealing happens at composition from DC's writer builders: the committed valid events, their replay-only compatibility originals, the checkpoints' last events and the part 2B retained builders. Each original is sealed on its own; one that cannot be sealed stays unavailable. The case under check adds nothing. **HR01** (new, `historical_recipe`) and **CK22** (new, `checkpoint_recipe`) refuse any dispatcher refusal: `original_unavailable`, `original_binding`, `recipe_unknown`, `original_verification`. **HR02** refuses a context `write_epoch` that differs from custody's. The identity domain of a historical or checkpoint read is now the custody's write epoch, no longer the caller's `write_epoch` or the read token's epoch. The frozen v1 verifier (`:1226`) decodes the sealed bytes, rechecks the binding, recipe tuple and receipt, then runs the complete v1 envelope and payload checks with the original epoch. It skips the current-writer replay rule and CV-1100's current grammar; CV-1101 date-time applies. | `:1115`, `:1056`, `:1286` |
| **4,400-digit integer** | **DC had the crash.** jsonschema writes `repr(instance)` into every candidate error, even in a discarded `not`/`anyOf` branch, and Python refuses `repr` of an int above 4,300 digits. Every payload, envelope, checkpoint and source schema validation of such a value raised `ValueError`. `SafeValidator` (`:462`) wraps each validator: only when an instance holds an int of 4,001 or more digits does it validate a copy with each such int as `_ExactInt` (same value and comparisons, safe `repr`). Nothing is capped or rounded. Witnesses: `10^4399` at every boundary. The payload accepts it at a non-subject slot (no owner maximum), the inline route refuses it at RP03, the SP-337 route accepts it (exact JSON body), the checkpoint refuses it at CK21, and history refuses it at HR01 (unsealable). Raw `±10^4399` goes through the reference route. No route raises. | `:432` |

**Shared corpus through the complete checker** (`corpus_number_values`, `corpus_bases`, `scripts/pm_collab_p2b_cases.py`). It uses the number-scope values of `Plans/event_number_recipe_corpus.json`: 55 distinct raw spellings (`token`, `parse`, `parse_token`, `slot`, `json_number`, plus `±10^4399`) and 13 exact integers (`integer`, `uint64`, plus `±10^4399`, `2^64−1`, `2^64`, `−2^63`, `−2^63−1`). They run at `definition_revision` (minimum 1, non-subject) of one inline valid event in each of the 16 families that have such a slot; `collaboration.created` and `collaboration.configuration_changed` have only subject or arithmetic integer slots. Two complete routes:
- **SP-337 reference:** the token is spliced into the canonical body text and parsed by the checker's raw ingress.
- **Inline:** typed exact integers.

Expectations are composed from the shared helpers (`loads_current_json`, `current_integer(minimum=1)`, `storage_value_bytes`) and DC's own SP-337 canonical-body rule:
- **Reference route:** 368 `reference_json` (raw parse refused), 240 `reference_canonical` (a non-integer spelling has another canonical form or none), 80 `payload` (below the slot minimum) and 192 accepted.
- **Inline route:** 64 `event_value_encoding` (outside −2^63..2^64−1), 48 `payload` and 96 accepted.
- **Total:** 1,088 route runs, 0 disagreements, 0 crashes.

`python3 scripts/pm_event_numbers.py --self-test --scope numbers`: **exit 0, `"status": "pass"`, 580/580 (276 positives, 304 negatives).** Credited exactly: number recipes only.

**Retained originals (10a, SP-1101 AC2):**
- **Readable after current refusal:** integral-float originals (34 families × editions), negative-zero originals (8), uint64-maximum `sequence_id` originals (36) and the replay-only compatibility originals stay readable through history. The same float and negative-zero records refuse as current input (`payload`, PN01).
- **Refused:** coherent forgeries (record and captured original both changed; 36), originals that cannot be sealed (`sequence_id` 10^4399; 36), originals sealed under an unsupported recipe tuple (36), `24:00:00Z` originals the v1 checker had accepted (36, `original_verification` under CV-1101), a disclosed `write_epoch` that differs from custody (36), and checkpoint last events that were never sealed (3).

**Fixture expectations that changed (recorded with their refusing row and reason).**
- **The 432 `numeric_family_cases`:** IF03 asserted "alternate spelling is a valid payload". CV-1100 refuses those spellings as current input, so each case now records `current_rejection`, and IF03 (renamed `IF03_numeric_current`) compares it exactly. The 36 typed `1.0` alternates refuse `number_domain` (PN01). The raw alternates with a decimal or exponent token at a `type: integer` slot refuse `schema` (PS01: jsonschema does not admit a `Decimal` as an integer), 34 for each of the six `9007199254740991…993` spellings. At `collaboration.created`'s `const: 1` slot, the 2 cases of each of those six spellings refuse `number_domain` (PN01; the const compares equal). The alternate epochs `-0.0`, `0e0`, `1.0`, `1e0` refuse `epoch_type` (PR01; 36 each), and `-0` refuses at the shared parser (`raw:integer_token`, 36). IF02 (the v1 identities are equal) is unchanged.
- The integrity case `numeric_identity` now moves the case's recorded current refusal with its changed value (`schema` for `2.0` at the const slot), so it stays a single-row witness of IF02. A new integrity case plants a wrong `current_rejection` for IF03.
- No retained, compatibility or other fixture expectation changed.

### Step 6: guard tables

The gated tool (`scripts/pm_guard_isolation.py`, `004bdedd63`, unchanged; tool SHA-256 `e8038992eabbe067…` in both runs) ran every table: **121 tables, 340/340 rows proved**, 4,887 distinct single-row negatives (24,351 further witnesses ride as aliases with an identical observation), 96,065 tool evaluations, **0 unrelated changes, 0 masked negatives**. Lane matrix problems: 0. Rows without a negative: 0. Open collection findings: 0. The only excluded witnesses are part 2A's four two-row-by-construction `:roster` witnesses, unchanged. Credit is the tool's own `rows[].proved`.

**Two runs, credited exactly.**
- **Run 1** (all 121 tables, collection 865 s, 5 h 50 m with memory pauses) was on checker `708fa2290a97…` (commit `7a5d6328f0`). It passed 118 tables and failed 3. All 3 failures were real off-diagonal findings in this lane, fixed as follows:
  - **`fix_numeric_family`:** the integrity case `numeric_identity` also broke IF03 → its recorded current refusal now moves with the value (`3fc4856820`).
  - **`reference_body`:** the new RF06 also fired on non-object bodies → RF06 now judges object bodies only (`3fc4856820`).
  - **`wrapper_shape`:** WR08 also refused a schema-invalid wrapper (`r2:wrapper_missing`) → WR08 now judges schema-valid wrappers only (`38ee4e0eac`).
- **Run 2** (fresh collection at `38ee4e0eac`, checker `48852ffb211b…`) reran those three: `fix_numeric_family` 2/2, `reference_body` 4/4, `wrapper_shape` 4/4, all PASS.
- **Comparing the two collections** (`collection-compare.json`): 120 of 121 tables have identical control and negative observations, targets and codes in both runs. `fix_numeric_family` alone changed (one negative replaced), and run 2 reran it. The predicates of the other 118 tables are unchanged between the runs, so their run-1 credit stands.

| Checker / boundary | Tables | Rows | Proved | Cut: own flips / own | Cut: stays | Unrelated | Masked |
|---|---:|---:|---:|---:|---:|---:|---:|
| payload_rejection (CV-460 payload layers, PN01) | 4 | 9 | 9/9 | 461/461 | 2290 | 0 | 0 |
| envelope_rejection (EventRecord joins) | 6 | 14 | 14/14 | 137/137 | 462 | 0 | 0 |
| envelope date-time (CV-1101, EV15-EV17) | 1 | 3 | 3/3 | 3/3 | 6 | 0 | 0 |
| envelope integer slots (EV18, EV19) | 1 | 2 | 2/2 | 2/2 | 2 | 0 | 0 |
| representation (SP-337, RP03) | 1 | 3 | 3/3 | 85/85 | 170 | 0 | 0 |
| reference_rejection (SP-337) | 2 | 6 | 6/6 | 690/690 | 2066 | 0 | 0 |
| checkpoint_rejection | 6 | 19 | 19/19 | 46/46 | 156 | 0 | 0 |
| checkpoint values (CK20, CK21) | 1 | 2 | 2/2 | 2/2 | 2 | 0 | 0 |
| checkpoint SP-1101 (CK22) | 1 | 1 | 1/1 | 1/1 | 0 | 0 | 0 |
| historical_rejection | 2 | 8 | 8/8 | 1012/1012 | 6048 | 0 | 0 |
| historical SP-1101 (HR01, HR02) | 1 | 2 | 2/2 | 5/5 | 5 | 0 | 0 |
| source custody | 16 | 64 | 64/64 | 2015/2015 | 8000 | 0 | 0 |
| source timestamps (SO06) | 1 | 1 | 1/1 | 1/1 | 0 | 0 | 0 |
| source integer slots (SO07) | 1 | 1 | 1/1 | 1/1 | 0 | 0 | 0 |
| application wrapper (SP-351, WR07, WR08) | 2 | 8 | 8/8 | 86/86 | 258 | 0 | 0 |
| projection values (PV01, PV02) | 2 | 2 | 2/2 | 2/2 | 0 | 0 | 0 |
| prepared_event_rejection | 1 | 2 | 2/2 | 80/80 | 80 | 0 | 0 |
| read_token | 1 | 1 | 1/1 | 1/1 | 0 | 0 | 0 |
| retention (DL-092) | 5 | 16 | 16/16 | 60/60 | 247 | 0 | 0 |
| reducer admission (transitions) | 21 | 67 | 67/67 | 87/87 | 309 | 0 | 0 |
| fixture_report oracles | 12 | 30 | 30/30 | 31/31 | 75 | 0 | 0 |
| integrity collectors | 31 | 77 | 77/77 | 77/77 | 238 | 0 | 0 |
| shape probes | 1 | 1 | 1/1 | 1/1 | 0 | 0 | 0 |
| table order | 1 | 1 | 1/1 | 1/1 | 0 | 0 | 0 |
| **Total** | **121** | **340** | **340/340** | 4887/4887 | 20414 | 0 | 0 |

New rows (all proved): PN01, EV15–EV19, RP03, CK20–CK22, HR01, HR02, SO06, SO07, WR07, WR08, PV01, PV02. Changed predicates or observations, re-proved: PR03 (shared predicate), RF06 (no canonical form refuses; object bodies only), WR02 (APP_PHYSICAL size, None skipped), IF03 (current-input expectation), IF20/IF22 (projection values through PV01/PV02). Per-table reports and summaries: `tool/` (run 1) and `tool2/` (run 2) in the evidence.

### Step 7: grades

| Cell | Before (part 2A) | After | Why |
|---|---|---|---|
| `positive_negative_oracles`, all 18 | PARTIAL | **PARTIAL** | Timestamps (SW-F1) and numbers (SW-N1..N5) are no longer reasons: the shared date-time, number and dispatch calls run with the witnesses above. It stays PARTIAL because `datetime_validator` and the inventory gate run only at batch-2 integration, because schema occurrences are whole-schema rows without per-keyword cuts, and because native execution is NOT_RUN. |
| `closed_payload_schema`, all 18 | PASS | PASS | Payload integer slots through `current_integer` (PN01); family timestamps through the shared predicate (PR03). |
| `scope_identity`, all 18 | PASS | PASS | Identity preimages through `qualified_jcs`, subject integers exact. |
| `compatibility_withdrawal`, all 18 | PASS | PASS | SP-1101 custody dispatch replaces the caller's `write_epoch`; retained float, negative-zero and uint64 originals readable; forged, unsealed, unsupported and owner-invalid originals refused. |
| `replay_idempotency`, all 18 | PASS | PASS | Unchanged producer digest; replay-only stays current-refused and history-readable. |
| `membership_version`, all 18 | ABSENT | ABSENT | No admission. |
| The other six cells | PASS | PASS | Unchanged. |

**Totals unchanged: 180 PASS / 18 PARTIAL / 18 ABSENT.** Every self-grade evidence quote was relocated at the implementation commit: 756 quotes, 396 unchanged, 360 line numbers refreshed, 0 missing; each touched cell cites its new owner text and checker line.

### Owner text

- **`Plans/Contracts_V0.md` CV-460:** rule 5 names CV-1101's shared predicate and each timestamp's profile; rule 8 and the canonical text name CV-1100, SP-1100, SP-1101 and CV-1101.
- **`Plans/storage-plan.md` SP-460:** the numeric paragraph states that the commitments are DC's recipe v1, distinct from the current-input grammar, and names the shared calls, the Storage uint64 fields, the physical profiles, SP-1101 dispatch and the timestamp profiles. The canonical text's "equate admitted equivalent forms" sentence is replaced accordingly.
- **`Plans/Automated_Testing_System.md` ATS-230:** a "Sweep part 2B" paragraph is added; the number-vector sentences are aligned; a validation surface (`pm_event_numbers.py --self-test --scope numbers`) is added.
- **Regeneration:** shards and the index were regenerated. Only these three documents' outputs changed; only ATS-230, CV-460 and SP-460 changed canonical text; no unit was added or removed.

### Readiness

**NOT_READY; prepared for the batch-2 review.**
- **Done in this tree:** part 2B is complete. Every item in the brief ran at `38ee4e0eac` and passed, except the shared date-time inventory gate and `datetime_validator`, which Addendum 2 moves to batch-2 integration.
- **Integration items:**
  - Refresh the inventory for `Plans/application_workflow_contracts.schema.json`. This is a hash-only row; then the gate and the combined self-test must pass.
  - Index fork drift, which the integration rebase owns.
  - The batch's Sol max and Astra max reviews.
- **Unchanged:** membership stays ABSENT (no admission) and native execution NOT_RUN.

## Commands and evidence

Every heavy run started at ≥ 13.5 GB available (`run-heavy.sh` waits), one at a time; the tool's MemoryGate paused below 10 GB. No browser was used. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p2b/` (`SHA256SUMS`).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 58c2816ff3` | 1 → resolved | 163 derived conflicts, regenerated; none other |
| `python3 scripts/pm_collaboration_events.py --json` (at `38ee4e0eac`) | 0 | `pass`, 0 failures, 18 prepared rows, 0 admitted, no admission blocker; 30,488 contract probes (2,745 part 2B) and 109 integrity cases; 6 m 37 s, peak RSS 1.10 GB |
| `python3 scripts/pm_collaboration_events.py --self-test` (at `38ee4e0eac`) | 0 | `pass`, 14/14 scenarios including the failure-exit and unvisited-reference controls; 15 m 47 s, peak RSS 1.13 GB |
| `python3 scripts/pm_event_numbers.py --self-test --scope numbers` | 0 | `pass`, 580/580 |
| `python3 scripts/pm_event_numbers.py --self-test` (scope all) | 1 | `NOT_RUN_ADMISSION_REFUSED`; only `datetime_inventory_complete_and_classified` (Addendum 2) |
| `python3 scripts/pm_event_datetime_inventory.py` | 1 | 1 `inventory_node_changed` (resource hash only), above |
| `python3 scripts/pm_event_datetime.py --self-test` | 0 | no entry point, no output; not credited |
| guard tool run 1: `python3 scripts/pm-collab-guard-tables.py --out … --save-collection …` (at `7a5d6328f0`) | 1 | 118 PASS, 3 FAIL (above), 330/340 rows |
| guard tool run 2: `… --save-collection … --phase fix_numeric_family --phase reference_body --phase wrapper_shape` (at `38ee4e0eac`) | 0 | 3 PASS, 10/10 rows; collection compare: 120 identical, `fix_numeric_family` changed |
| `python3 scripts/pm-collab-table-generate.py --check` | 0 | 121 tables, 340 rows |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | pass, 99 sources |
| `python3 scripts/pm-plan-index.py validate` (origin/main `4f828088ac`) | 1 | top-level `fail`, 60 fork-drift findings: 39 `plan_unit_removed_without_ledger_decision` for units that exist only on main (for example CV-369, added there after this branch's base) and 21 `plan_unit_removal_ledger_invalid` on existing ledgers; none names a unit or document this branch changed. Integration rebase owns them. |

**Stopped for Jared:** none. **Disputed:** none. **IDs:** no new PlanUnit, Decision Log or admission ID; ATS-230, CV-460 and SP-460 change in place. New witness IDs are the `p2b:` probes and `integrity:p2b:` case; new guard rows PN01, EV15–EV19, RP03, SO06, SO07, CK20–CK22, HR01, HR02, WR07, WR08, PV01, PV02 (internal checker names).

---

---

# Lane DC — sweep part 2A: guard tables on the gated guard tool

Branch `plans/ea-collab-prep-20261104`; part 2A start `f27a51130c`; gated tool merge `1990b6bd33` (tool `004bdedd63`, eleven files, none edited); implementation commit `ff8520b261`. The delivery head is in the external `HEAD.txt`. No rebase onto main this round.

**All 18 families keep 10 PASS / 1 PARTIAL / 1 ABSENT.** Part 2A closes SW-P1: every refusal of the checker is one named row of a guard table, and the gated tool proves **322 of 322 rows** in 111 tables, with no masked negative and no unrelated change. `positive_negative_oracles` stays PARTIAL because SW-N1..SW-N5 (shared number rule) and SW-F1 (timestamp grammar) are part 2B. Membership stays ABSENT; native execution is NOT_RUN. Sol and Astra review the lane once, after part 2B.

## Sweep part 2A: findings and responses

| Item | Disposition and change | Where | Verify |
|---|---|---|---|
| **Take the gated tool** | Merged `004bdedd63` with `--no-ff` as `1990b6bd33`: exactly the eleven tool files, no conflict, none edited. | `scripts/pm_guard_isolation*.py`, `scripts/guard-isolation/README.md`, `Plans/guard_isolation_traps.json`, GUARDTOOL reports | `git diff --stat 1990b6bd33^1 1990b6bd33` lists 11 files; `git diff 1990b6bd33 HEAD -- scripts/pm_guard_isolation.py` is empty. |
| **SW-P1 — guard tables** (fixed, `0c7344493d`) | Every product and integrity refusal of `scripts/pm_collaboration_events.py` is one named row in one of 111 phase tables (322 rows, at most seven each), generated from one row spec. The checker derives observations (canonical SHA-256 digests, recomputed identities, resolved routes, presence) for the phase it is about to evaluate and refuses only through `table_refusals`; integrity collectors use the same rows through `collect`. Or-chains are split into one row per predicate. A reused boundary (payload, envelope, reference, source) is a phase chain of its callers; a caller that forwards it under a legacy code (`payload`, `source_payload`, `checkpoint_event`) still refuses through the boundary's own row. Every legacy code and result is unchanged. | `scripts/pm_collaboration_events.py:129` (`table_refusals`), `:147` (`refusal`), `:153` (`collect`), `:171` (`table_order_errors`); row spec `scripts/pm-collab-table-generate.py`; generated `scripts/pm_collab_table_*.py` | `python3 scripts/pm-collab-table-generate.py --check` (no stale or extra module); full checker `pass`, including `table_require_order`; differential below. |
| **SW-P1 — behaviour preserved** | A differential runs the previous checker (`f27a51130c`) and this one over every earlier probe (27,492), every earlier integrity case (68), the fixture report and every collector. | `differential.log` in the evidence | 0 mismatches. |
| **SW-P1 — retired machinery** (fixed, `0c7344493d`) | Removed `guard_removal_report`, `schema_guard_removal_report`, `integrity_guard_removal_report` and the `--guard-removal` / `--guard-layer` flags (the AST rewrite, `exec` mutants and trace-based removal tables). The self-test is unchanged. | `scripts/pm_collaboration_events.py` `main` | `--guard-removal` is no longer an argument. |
| **SW-P1 — adapter and runner** (fixed, `270c3b0021`) | Suites are built from the checker's own witnesses run once under its observation recorder: accepted invocations give controls; each refused witness gives the observation of its FIRST refusal, targeted at the refusing row. One tool run per table, all eighteen families' witnesses together; each row's proving families are recorded. Unexpected results, untracked refusals and two-row witnesses are reported, never relabelled. | `scripts/pm_collab_guard_suites.py:106` (`collect`), `:160` (`complete_boundary_flip`), `:185` (`lane_matrix`), `:215` (`suite_for`); `scripts/pm-collab-guard-tables.py` | `python3 scripts/pm-collab-guard-tables.py --out <dir>` (batches with `--phase`, `--save-collection` / `--load-collection`). |
| **Two-defect negatives the lane matrix reported** (fixed, `0c7344493d`) | Ten witness groups refused at two rows of one table once or-chains were split. Nine are fixed; the tenth (`:roster`) is two rows by construction (next rows). Seven are rebuilt so every copy of the changed fact moves together: checkpoint `:cursor` (context cursor copy too, CK15 alone), `:index_through_sequence_id` (cursor copies too, CK10 alone), source `:owner_record_ref` (captured control too, SF11), `:participant_identity` (captured identity too, SF28), `:review_pack` (captured pack too, SF31), `:required_snapshot` (captured control too where the body copies requiredness, SF38/SF39), `:currentness` (record copy too, SF40). Two are fixed in the rows: EV04 compares project ids only between records of the same scope kind (an application record carrying a project payload is EV03 alone), and SF15 no longer repeats the identity joins SF14 already compares (170 witnesses; no field is compared by two rows, so there is no duplicate set). SF45–SF47 compare a roster only when it has distinct slots (SF43/SF44 own duplicates). | `scripts/pm_collaboration_events.py:1747`, `:1777`, `:1784`, `:1818`, `:1822`, `:1849`, `:1854`, `:896`; `scripts/pm_collab_table_envelope_scope.py:21`; `scripts/pm_collab_table_source_roster.py:29` | Lane matrix: 0 problems in every table; tool: no masked negative. |
| **Missing negatives for unproved rows** (fixed, `0c7344493d`) | 83 rows had no negative of their own, and CK12 and SF15 only two-row ones. `scripts/pm_collab_p2a_cases.py` adds 251 probes and 40 integrity cases, each from a named valid parent of its own family with one changed fact: non-object payload, source holder and history control (PO01, SO01, HI01), negative write epoch (HI07); checkpoint token/selection/context instance copies, cursor end, cursor context/generation/frame/sequence and last-event scope/project (CK03–CK06, CK11, CK12–CK14, CK16–CK18); renamed record joins, terminal record time, waiver actor and actor ref, identity slot and captured identity, pack run and captured pack, duplicate snapshot/record slots, record roster order, Review targets/reviewer control/duplicate vote, wrapper instance and scope (SF15, SF20, SF25–SF27, SF29, SF30, SF32, SF43, SF44, SF46, SF52, SF53, SF57, WR04, WR06); transition revision, kind, collaboration, latest revision, unsynthesized BrainStorm, removed slot, attempt slot/revision, message attempt slot, proposal attempt slot, superseded vote attempt and unaccepted partial coverage (TR05, TR06, TR12, TR13, TR16, TR23, TR29, TR33, TR34, TR43, TR47, TR51, TR65); every physical and prepared-source binding field, binding source/owner schemas and checkpoint adoption, ledger row event type, family id form, payload anchor, ref path/definition and scope policy, payload definition type, fixture numeric validity, edition, valid-event payload case, identity partition, five family case floors, and table order. | `scripts/pm_collab_p2a_cases.py:13` (`probes`), `:177` (`integrity_cases`) | Every table: `rows_without_negative` empty; full checker `pass` with every expected code. |
| **Witnesses excluded from the table proof** | 4 witnesses stay refused negatives in the full checker but are not single-row proof: source `:roster` for `collaboration.created` and `collaboration.configuration_changed` in both scopes. An extra slot in `slot_requirements` contradicts every copy of the roster (captured control SF45, record specs SF46, body roster SF47) by construction; `original_control:participant_slot_ids`, `r2:semantic_roster` and `p2a:...:record_roster_order` prove each row alone. | `scripts/pm_collab_guard_suites.py:28` (`EXCLUDED_PATTERNS`) | Listed in `DC.guard-tables.json` `excluded`. |
| **Part 1 handoff: requiredness, subsumption, fixed width** | Classified under Method B. Each schema occurrence (payload edition, source family, EventRecord, checkpoint, wrapper, component definition) is one row of its table, refusing whatever the closed schema refuses; required members, fixed-width lengths and the 72 identity-input required members are clauses of that schema row, witnessed by the 19,322 schema negatives (each refused by its schema row) and never merged with a checker predicate. No keyword-level cut is claimed: the tool's per-keyword `SchemaCatalog` route is not used for these 509 KB/208 KB/198 KB schemas. Checker predicates that an earlier row subsumes carry that row's pass condition instead of being merged (EV04, SF03, SF37, SF38, SF45–SF47, retention value rows, TR rows over a known attempt or finding). | row spec `scripts/pm-collab-table-generate.py` | Table rows SH01, PS01, SO03, EV01, CK01, WR01. |
| **Membership table without a control** (fixed, `ff8520b261`) | The registry holds none of the 18 prepared families, so no valid membership row was ever evaluated and `int_membership_row` had no control. `integrity_controls` plants one valid state (an admitted ledger row whose registry row equals its prepared row); the full checker requires it to report no failure. | `scripts/pm_collab_p2a_cases.py:289` (`integrity_controls`); `scripts/pm_collaboration_events.py:2323` (`integrity_failures`) | Both membership tables re-run at `ff8520b261`: PASS, 3/3 rows. |
| **ATS-230 legacy proof claim** (fixed, `8463edd7a9`) | The check-11 bullet, the round-one paragraph, the guard-removal sentence and the canonical text name the guard tables and the shared tool; the runner joins the validation and implementation surfaces. The number and timestamp sentences are unchanged (part 2B). | `Plans/Automated_Testing_System.md:7248`, `:7281`, `:7296`, `:7353` (ATS-230) | Shards and index regenerated; only Automated_Testing_System outputs changed; shard check pass. |
| **SW-N1..SW-N5 — shared number rule** | Part 2B (needs NUMRULE gates). | Listed below | — |
| **SW-F1 — timestamp grammar** | Part 2B. Interim review only (below). | Listed below | — |

**Disputed:** none. **Stopped for Jared:** none. **IDs used:** zero new PlanUnit, Decision Log or admission IDs; ATS-230 changes in place. New fixture-free witness IDs are the `p2a:` probes and `integrity:p2a:` cases.

## Guard-table result

The gated tool ran **111 table suites**: **322/322 rows proved**, 0 failed suites, 4149 distinct single-row negatives (23131 further witnesses with an identical observation ride as aliases), 86,061 tool evaluations. Lane matrix problems: 0. Open collection findings: 0. Credit is the tool's own `rows[].proved`.

Each cut swaps one table row to always-pass; the tool then runs every control and negative, checks the guard-call trace against the uncut baseline and runs a fresh restoration. Own negatives must be accepted after the cut ("flips"); every other negative must keep its exact refusal ("stays"). Controls given to the tool are every family's first control of the table, then the rest in recorded order up to 40; the lane matrix checks every control and negative directly.

| Checker | Tables | Rows | Rows proved | Unproved | Cut: own flips / own | Cut: stays | Unrelated changes | Masked |
|---|---:|---:|---:|---|---:|---:|---:|---:|
| Reducer admission (transitions) | 21 | 67 | 67/67 | none | 87/87 | 309 | 0 | 0 |
| application_wrapper_rejection (SP-351) | 2 | 6 | 6/6 | none | 72/72 | 212 | 0 | 0 |
| checkpoint_rejection (projection checkpoint) | 6 | 19 | 19/19 | none | 46/46 | 156 | 0 | 0 |
| envelope_rejection (EventRecord joins) | 6 | 14 | 14/14 | none | 137/137 | 462 | 0 | 0 |
| fixture_report oracles | 12 | 30 | 30/30 | none | 30/30 | 74 | 0 | 0 |
| historical_rejection (retained reader) | 2 | 8 | 8/8 | none | 1012/1012 | 6048 | 0 | 0 |
| integrity collectors (schemas, units, ledger, registry, references, physical, ATS, probes) | 31 | 77 | 77/77 | none | 77/77 | 238 | 0 | 0 |
| payload_rejection (CV-460 payload layers) | 3 | 8 | 8/8 | none | 442/442 | 2200 | 0 | 0 |
| prepared_event_rejection | 1 | 2 | 2/2 | none | 80/80 | 80 | 0 | 0 |
| read_token_rejection (SP-278 exemption) | 1 | 1 | 1/1 | none | 1/1 | 0 | 0 | 0 |
| representation / reference_rejection (SP-337) | 3 | 8 | 8/8 | none | 88/88 | 248 | 0 | 0 |
| retention_rejection (DL-092 policy) | 5 | 16 | 16/16 | none | 60/60 | 247 | 0 | 0 |
| shape probes (schema occurrences) | 1 | 1 | 1/1 | none | 1/1 | 0 | 0 | 0 |
| source_rejection / source_fact_rejection (prepared custody) | 16 | 64 | 64/64 | none | 2015/2015 | 8000 | 0 | 0 |
| table order | 1 | 1 | 1/1 | none | 1/1 | 0 | 0 | 0 |

Rows each family's own witnesses prove (a row is credited per table; shared rows are proved by every family that reaches them, and family-specific rows only by their family):

| Family | Rows proved by its own witnesses |
|---|---:|
| `brainstorm.plan_synthesized` | 62 |
| `brainstorm.proposal_added` | 61 |
| `brainstorm.vote_added` | 62 |
| `collaboration.artifact_added` | 62 |
| `collaboration.cancelled` | 68 |
| `collaboration.completed` | 70 |
| `collaboration.configuration_changed` | 68 |
| `collaboration.created` | 72 |
| `collaboration.failed` | 62 |
| `collaboration.message_added` | 71 |
| `collaboration.participant_completed` | 65 |
| `collaboration.participant_started` | 66 |
| `collaboration.paused` | 62 |
| `collaboration.resumed` | 64 |
| `collaboration.started` | 81 |
| `review.artifact_finalized` | 69 |
| `review.finding_added` | 61 |
| `review.finding_dispositioned` | 63 |
| `shared` | 154 |

**Phase boundary.** Tables are extracted observation boundaries (tool boundary `synthetic`), as in DR and DG6B. The complete path is the full checker, which reaches every refusal through the same rows. As lane evidence beyond the tool, each refused witness was re-run through the whole checker with only its refusing row cut: 25,817 are then accepted and 1,463 are refused later by a distinct invariant that watches the same source fact (kinds and counts per cut row in `DC.guard-tables.json` `complete_boundary_flips`): the event id recipe sees the epoch a cut history or source epoch row let through (EV14, 324); a cut type or shape row leaves derivation reading a wrong-typed field (`derivation_requires_cut_row`, 527); a payload schema negative in a timestamp or identity field also fails the timestamp or identity-recipe row (PR03, PR04, 272); a missing captured control slot, once SO05 is cut, fails the row that reads that slot (SF02, SF10, SF13, SF21, SF36, SF40, SF42, SF59: 40 each); and 20 others (CK16, EV01, TR17, EV04, RT02, CK07, TR27, IF14). None reaches a second row of its own table, so each stays a single-row negative for the tool.

**What Astra keeps finding, probed for part 2A.** (1) Identities and digests are recomputed in derivation and compared by rows (PR04, EV14, SF04–SF10, CK08, HI08, WR03); forged copies are the negatives. (2) Retry compares only the producer digest of the caller body (TR01); `:assigned_metadata` (Storage sequence and times changed) stays accepted. (3) The current-writer replay row EV06 is its own phase, never called for a retained original or a checkpoint's last event; `:retained_replay_only` stays accepted, withdrawn/forged originals refused. (4) Object joins compare SHA-256 of canonical bytes on both sides (`canonical_sha`); scalar joins keep their original operator; number spelling is part 2B. (5) IX01 resolves every `$ref` per document root, unused branches included; the self-test's unvisited-reference control still fails the CLI. (6) RP01 measures the inline body, WR02 the complete MessagePack wrapper. (7) Every prepared route runs source, wrapper, envelope and prepared joins; required slots come from the owner snapshot and the captured control (SF36–SF39), never a caller-supplied success set; the envelope family row EV02 refuses a sibling family. (8) Masked negatives: tool `masked` empty on every row; complete-boundary re-runs reported above. (9) Oracle cells stay PARTIAL. (10, 10a, 12) are part 2B. (11) Type rows are separate (`type(...).__name__` names and `is True`/`is False`), with string, number, null, array and object negatives.

**Timestamp fields — interim only.** This is my own interim review of the timestamp fields (pm7-build, 2026-11-05 16:50Z), not a certification. Every DC validator is a `Draft202012Validator` with no format checker. The payload `utc_timestamp` (`Plans/collaboration_event_payloads.schema.json:21`) is a full-match pattern ending in `Z` with 1–9 fraction digits; PR03 (`valid_utc`, `scripts/pm_collaboration_events.py:307`) then refuses `2026-02-30` and `23:59:60`, but **accepts `24:00:00Z`** (Python 3.14 `fromisoformat`). `valid_utc` alone also accepts a lowercase `t`, a space separator, minutes-only and basic-format times, which the payload pattern refuses first. The owner-record `utc_timestamp` (`Plans/collaborative_workflows_contracts.schema.json:213`) uses an unguarded `$`, so it accepts a trailing LF, numeric offsets and impossible dates; original-source times (SF17, SF18, SF20) and EV13 join those spellings as strings. Part 2A adds no date-time rule and changes no timestamp field.

## Part 2B items

- **SW-N1 — shared number parsing (CV-1100).** `scripts/pm_collaboration_events.py:192` `decode_json`, `:231` `canonical`, identity helpers `:279`–`:294` (`subject_values`, `owner_operation_id`, `idempotency_key`, `event_id`); `Plans/storage-plan.md:29603` (SP-460). Preserve local identity tuples and prefixes.
- **SW-N2 — physical profiles (SP-1100).** `:688` `reference_rejection` (`decode_json` of packs), `:1065` `application_wrapper_rejection` (MessagePack size), `:1581` `stored_size_report`, `:713` `payload_reference`; SP-460. Keep finite float types and Storage uint64, no 2^53 cap.
- **SW-N3 — signed zero and integer/float distinctions.** `:231` `canonical`, `:302` `same_fact`, `:163` `canonical_sha` (every object join of the tables), row and reference commitments.
- **SW-N4 — digest recipes.** `:298` `producer_digest`, `:251` `row_sha256`, `:255` `jcs`; `Plans/Contracts_V0.md:24489` (CV-460), SP-460. Payload-only producer projection stays; no v1 restamping.
- **SW-N5 — authenticated historical recipe selection (SP-1101).** `:812` `historical_rejection` (identity domain from the captured `write_epoch`), `:763` `checkpoint_rejection` last-event pass; no caller-selected weaker recipe, no current-first fallback.
- **Number-domain row operators (kept as written).** PR02/PR05/PR06 (`pm_collab_table_payload_rules.py`), SF03 (`pm_collab_table_source_identity.py`), CK11/CK13/CK14 (`pm_collab_table_checkpoint_join.py`, `pm_collab_table_checkpoint_cursor.py`), HI07, TR15/TR16/TR18/TR31/TR40/TR65/TR66 and SF56–SF58 keep the original Python comparisons; the shared rule decides spelling and range.
- **SW-F1 — timestamp grammar.** `Plans/collaborative_workflows_contracts.schema.json:213` and `Plans/collaboration_event_payloads.schema.json:21` (`utc_timestamp`), `scripts/pm_collaboration_events.py:307` `valid_utc` (PR03), original-source times SF17/SF18/SF20 and the EV13 string join, and the absent format checker in `validator`. Exact current calendar/zone/fraction/LF grammar with isolated negatives, authenticated old-original grammar selection; retained schemas are not tightened in place. Interim review only.

## Family grades before and after

P=PASS, Q=PARTIAL, A=ABSENT. Before is the part 1 self-grade; after is this part 2A self-grade at the implementation commit.

| Family | Before → after |
|---|---|
| `collaboration.created` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.started` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.paused` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.resumed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.cancelled` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.completed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.failed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.participant_started` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.participant_completed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.message_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.artifact_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `collaboration.configuration_changed` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `brainstorm.proposal_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `brainstorm.vote_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `brainstorm.plan_synthesized` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `review.finding_added` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `review.finding_dispositioned` | 10P / 1Q / 1A → 10P / 1Q / 1A |
| `review.artifact_finalized` | 10P / 1Q / 1A → 10P / 1Q / 1A |

**180 PASS / 18 PARTIAL / 18 ABSENT → the same totals.** Every self-grade evidence quote was relocated mechanically at the implementation commit with zero mismatches; each oracle cell now also cites ATS-230's guard-table sentence and `table_refusals`.

## Commands and evidence

Heavy checkers ran one at a time with at least 10 GB available (the tool MemoryGate pauses below 10 and resumes at 11). PM7 work was not waited on or touched. Commits: `1990b6bd33` (tool merge), `0c7344493d` (tables, witnesses), `270c3b0021` (adapter, runner), `8463edd7a9` (ATS-230, shards, index), `ff8520b261` (membership control), then the report commit. Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p2a/` (SHA-256 of every file in `SHA256SUMS`; large files gzipped).

| Command | Exit | Outcome |
|---|---:|---|
| `git merge --no-ff 004bdedd63` | 0 | clean; 11 tool files, none edited |
| differential: previous checker (`f27a51130c`) vs this one | 0 | 27,492 probes, 68 integrity cases, fixture report and 8 collectors: 0 mismatches (`differential.log`) |
| `python3 scripts/pm-collab-table-generate.py --check` | 0 | 111 tables, 322 rows; no stale or extra module |
| `python3 scripts/pm_collaboration_events.py --json` (inputs `ff8520b261`) | 0 | `pass`, 18 prepared rows, 0 admitted, 0 failures, no admission blocker; 27,743 probes and 108 integrity cases plus 1 control; 2 min 30 s, peak RSS 883 MB (`full-checker.stdout`) |
| `python3 scripts/pm_collaboration_events.py --self-test` | 0 | `pass`, 14/14 scenarios, including the failure-exit and unvisited-reference controls; 6 min 51 s (`self-test.stdout`) |
| `python3 scripts/pm-collab-guard-tables.py --out ... --save-collection ...` (batch 0, then batches 1-2 with `--load-collection`) | 0 | 110 tables `PASS`, 320/320 rows proved (`tool/batch0.log`, `tool/batch12.log`) |
| `python3 scripts/pm-collab-guard-tables.py --phase int_membership_row --phase int_membership_ledger` (fresh collection at `ff8520b261`) | 0 | both `PASS`, 3/3 rows; the other 109 suites are identical to the first collection (`collection-compare.json`) |
| complete-boundary flip re-run (`flips.json`, lane evidence) | 0 | 27,280 witness pairs: 25,817 accepted, 1,463 refused later by a distinct invariant or derivation |
| `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0 | `pass`; only `Plans/_shards/automated_testing_system/` changed |
| `python3 scripts/pm-plan-index.py generate` (15 currentness files hash-verified first) | 0 | `pass`; only Automated_Testing_System units changed |
| `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0 | `pass`, 3,185 shards |
| `python3 scripts/pm-plan-index.py validate` (origin/main `5cbb92a5aa`) | 1 | top-level `fail`, 30 failures: 21 `plan_unit_removal_ledger_invalid` in existing ledgers and 9 `plan_unit_removed_without_ledger_decision` (DL-333, DL-335..340, DL-349, UCC-230, added on main after this branch's base `d5ec2f70c0`); the identical set DR recorded at the same origin/main; none names a DC file. Integration rebase owns them. |

---

# Lane DC — sweep part 1 (earlier report, unchanged)

Branch `plans/ea-collab-prep-20261104`; tested implementation commit `8a57581d724f4b41c3c24a30ad08434711426aa4`. Rebased onto `origin/main` `d5ec2f70c0d69c469796eea9b9cfdae30f281f42` before fixture repair. This report supersedes the round-3 report for current grades and verification; its prior binding searches remain in `DC-binding-search.md` and earlier Git commits.

**Part 1 fixture repairs pass; the lane is NOT_READY pending part 2.** No deck-2 item was assigned to DC in this task. C4-B1, C4-B2 and C4-B3 are fixed. The production checker, schemas, identity/number helpers and legacy proof machinery are unchanged by the fixture repair. Current base materializes the selected Chat retention policy; retention rises to PASS. Membership remains ABSENT, oracles remain PARTIAL and native execution remains NOT_RUN.

## Sweep part 1: findings and responses

| Item | Response and location | How to verify |
|---|---|---|
| C4-B1 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** All 1,631 reviewed stale-key cases are rebuilt. Computable full payloads refresh the key; invalid primitive identity operands use their actual canonical property node and a valid counterpart. `Plans/collaboration_event_contract_fixtures.json:95452` is the reviewed created/Project LF witness. The inventory covers all 18 families and additional explicit payload peers. | `fixture-audit.json`: 14,302 full-payload key checks, zero stale keys; `guard-cases.json` lists every parent and actual guard. Run the full checker. |
| C4-B2 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** The original revision ID remains a coherent full-payload adjacency negative so the prepared ledger keeps its valid reference; `configuration_changed_revision_1:minimum_component` separately isolates the subsumed minimum at the actual property node. Four ordinary completed/failed count minima refresh the other reviewer count; both single-reviewer large-request cases refresh the completed count. Wrong-type arithmetic operands use primitive components. `Plans/collaboration_event_contract_fixtures.json:281918` and `:49155`. | The fixture audit checks 929 revision pairs and 1,054 reviewer sums, all coherent. Original adjacency and reviewer-sum rejection guards remain enabled in the full checker. |
| C4-B3 | **Fixed in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** All 38 reviewed overlapping-enum negatives now target the root `state_before` property component. Two additional full-payload `paused` cases isolate the distinct non-End conditional, with the root predicate satisfied. `Plans/collaboration_event_contract_fixtures.json:38525` and `:8758`. | Actual property negatives and their valid counterparts run in schema probes; both full conditional witnesses run through `payload_rejection`. |
| C4-I1 rebase integration | **Advanced-main units incorporated in `8a57581d724f4b41c3c24a30ad08434711426aa4`.** Landed DL-404 and the existing Storage policy are preserved; the inherited pending-policy timing claims in CWR-105..123, SP-460 and ATS-230 are corrected. Goal schema additions on main are preserved alongside DC wrapper additions. No retention value or Decision Log answer is changed. | The checker reports no missing-policy admission blocker; the final index result is recorded below without resealing. |

## Valid parents and per-guard inventory

2980 repaired or added cases: 1,402 canonical property-component witnesses and 1,578 full-payload witnesses. Each record names its valid parent, the target field, any refreshed companion and, for components, its valid counterpart. There are 243 new parent-specific component positives. The fixture has 19,322 schema negatives, 276 schema positives, 127 positive payloads and 193 explicit negative payloads.

`reports/event-authority-20261104/DC-sweep-p1-guards.json` groups the exact case IDs under 299 observed guard locations and records their parents. `guard-cases.json` retains the complete annotated inventory. This is fixture consistency evidence, not shared-tool guard-removal proof. The 72 missing identity-input required-member witnesses remain explicitly shape-boundary evidence; current identity cannot be evaluated without its required input. Part 2 must classify those dependencies/subsumptions without merging independent predicates. Existing fixed-width schema overlaps are also left to that predicate inventory.

## Part 2 items

| Item | Location and required work |
|---|---|
| SW-P1 | `scripts/pm_collaboration_events.py:2230,2385,2428`: adopt `scripts/pm_guard_isolation.py` from `plans/ea-guardtool-20261105`, **method B**, with named predicate functions in shared guard tables. Use the per-guard case inventory. Preserve compound peers; prove genuine duplicates site by site; classify requiredness/subsumption and fixed-width implications. The legacy table is not proof. |
| SW-N1 | `decode_json:106`, `canonical:145`, identity helpers `:193`, SP-460: adopt CV-1100 parsing/current integer-token admission; preserve local identity tuples and prefixes. |
| SW-N2 | Decoder/canonical/reference/wrapper/stored-size paths and SP-460: adopt SP-1100 owner-selected physical profiles; preserve finite float types/bytes and Storage uint64, with no 2^53 cap. |
| SW-N3 | `canonical:145`, `same_fact:216`, row/reference commitments and SP-460: preserve signed zero and integer/float distinctions in the selected physical domain. |
| SW-N4 | `producer_digest:212`, row/reference commitments, CV-460/SP-460: retain the payload-only producer projection and local recipe ownership; use qualified RFC8785 only where required, without v1 restamping. |
| SW-N5 | `historical_rejection:703` and current helper calls: adopt SP-1101 authenticated original edition/recipe selection, without caller-selected weaker recipes or current-first fallback. |
| SW-F1 | `Plans/collaborative_workflows_contracts.schema.json:213`, `utc_timestamp`, original source/wrapper paths: exact current calendar/zone/fraction/LF grammar and isolated negatives, with authenticated old-original grammar selection. Do not tighten retained schemas in place. |

No new number serializer, cap, guard-proof machinery, product binding, product decision, admission, registry member or PlanUnit ID is introduced in this sweep part.

## Family grades before and after

P/Q/A mean PASS/PARTIAL/ABSENT across the same twelve criteria. The nine prior PASS cells remain supported. Retention becomes the tenth PASS because the selected policy is materialized on the current base. Oracles stay PARTIAL until the shared method-B proof passes; membership stays ABSENT until separate admission.

| Family | Before P/Q/A | After P/Q/A | Preparation |
|---|---|---|---|
| `collaboration.created` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.started` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.paused` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.resumed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.cancelled` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.completed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.failed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.participant_started` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.participant_completed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.message_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.artifact_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `collaboration.configuration_changed` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.proposal_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.vote_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `brainstorm.plan_synthesized` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.finding_added` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.finding_dispositioned` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |
| `review.artifact_finalized` | 9 / 2 / 1 | 10 / 1 / 1 | Part 1 repaired; part 2 pending |

**Totals:** 162 PASS / 36 PARTIAL / 18 ABSENT → 180 PASS / 18 PARTIAL / 18 ABSENT. No family is READY or admitted. All 576 current self-grade evidence quotes were relocated and hashed mechanically, with zero mismatches.

## Verification

All heavy checker processes ran sequentially. The resource controller waited for the prior Nas1 lane, deferred while another checker was active, and paused its process group if available memory fell below 6 GB. Exact commands, exits, elapsed times and resource samples are in `check-results.json`.

| Check | Exit / result |
|---|---|
| `fixture-audit` | 0 |
| `checker` | 0 |
| `self-test` | 0 |
| `shards-generate` | 0 |
| `index-generate` | 0 |
| `shards-check` | 0 |
| `index-validate` | 0 |

Full checker: `pass`, 18 prepared rows, zero admitted families, 0 failures, no missing-policy blocker. Self-test: `pass`, 14 scenarios, including both failure-exit and unvisited-reference controls.

Index validation: top-level `pass`, 0 failures. Its readiness status remains `blocked_runtime_certification_incomplete`; this is not runtime certification or a governance reseal. Shards and the index were regenerated from the rebased sources. No unrelated source document is changed.

Standing checks 1–10 and the recurring forgery/custody/type/reference/size/history/format controls execute in the unchanged full checker and self-test. Check 11 remains qualified by SW-P1. Numeric and original-source timestamp qualifications remain SW-N1..N5 and SW-F1; this sweep claims no shared-rule or native clearance.

## IDs and evidence

Existing allocations remain CWR-105..123, CV-460..478, SP-460..478 and ATS-230..248. No new PlanUnit, Decision Log, OSI, event admission or WorkNode ID is minted. New fixture IDs are 243 parent-specific valid component IDs, `configuration_changed_revision_1:minimum_component`, and four `sweep-p1:` full-payload adjacency/state cases. The original revision ID is retained for its prepared-ledger reference.

Evidence manifest: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/manifest.json` — SHA-256 `24f8e8d11765f1377a74a3e3a47e1bc16cb62739377a0cdb897f2152f998fa05`.

- Fixture audit: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/fixture-audit.json` — SHA-256 `62ecf17302538343cb43d447bfbb9adb2fbd408818dcfd572926ad1de561aaa2`.
- Per-guard inventory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/guard-cases.json` — SHA-256 `ff0a682520bf145436b4d995228620199ce362de98a72be4013fc187d27bba8e`.
- Check results: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/check-results.json` — SHA-256 `a21521e95d9270fbdd53d12e760272c9243874c8df04597e61a80bb949782fba`.
- Currentness copy: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/DC/sweep-p1/currentness-copy.json` — SHA-256 `b72623c6887c9cb3b53eb0da0baf1e1b8c0b5d46fe116d4f25746361bbe73b8b`.

The report and self-grade are copied to the lane evidence directory and its `sweep-p1` folder. Only the lane branch is pushed; the temporary worktree is removed after the push.
