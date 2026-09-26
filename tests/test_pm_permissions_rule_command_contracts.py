#!/usr/bin/env python3
"""Focused checks for the five-command Permissions rule-command companion.

Covers, at static contract scope only:

* the companion schema is a closed Draft 2020-12 aggregate whose exact command
  inventory is the five existing rule commands;
* every positive record and binding validates and passes the causal static join;
* every structural negative is rejected by its own definition;
* every causal negative is independently schema-valid, fails exactly the one
  declared join law, and passes once that single law is set aside (so the same
  pair would pass without the intended semantic join);
* no owner original is proven by a field of the same binding: the declared
  current file hash and the declared pre-state rule projection must be confirmed
  by an independent owner read, and a binding without one is reported explicitly
  unproven. The static gate supplies the separate pinned owner-original double
  (``scripts/pm_permissions_rule_command_owner_file_double.py``) as static test
  evidence only, and a co-mutated request/snapshot/projection pair is rejected by
  that fixed anchor while a copied witness accepts it;
* no owner-unbacked numeric, length or pattern restriction survives: the only
  remaining caps are the owner-named closed inventories, nonnegative order and
  the empty EventRecord list, and positives above the removed rule and index caps
  stay schema-valid while an out-of-range reorder still returns the owner's named
  refusal;
* validate_rule never persists and never approves, and mutating commands stay
  behind the permission and atomic-write gates;
* the Touch Closure binding and the five central rows resolve to this companion,
  and the real owner-side Touch Closure check agrees.

No native handler, filesystem write, permission decision, EventRecord or
readiness claim is made here.
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

from jsonschema import Draft202012Validator
from jsonschema.exceptions import SchemaError

SCHEMA_REL = "Plans/permissions_rule_command_contracts.schema.json"
FIXTURE_REL = "Plans/permissions_rule_command_fixtures.json"
HELPER_REL = "scripts/pm_permissions_rule_command_contracts.py"
DOUBLE_REL = "scripts/pm_permissions_rule_command_owner_file_double.py"
TOUCH_REL = "Plans/touch_closure.json"
WIRING_REL = "Plans/Wiring_Matrix.production.json"
OWNER_REL = "Plans/Permissions_System.md"
CATALOG_REL = "Plans/UI_Command_Catalog.md"
SETTINGS_REL = "Plans/Settings_System.md"
TOUCH_VERIFIER_REL = "scripts/pm-touch-closure-verify.py"


def _find_file(start: Path, relative: str) -> Path | None:
    """Return the first ancestor-relative path that exists, or ``None``."""

    for candidate in (start, *start.parents):
        target = candidate / relative
        if target.exists():
            return target
    return None


def _find_root(start: Path, relative: str) -> Path | None:
    """Return the ancestor directory that holds ``relative``, or ``None``."""

    target = _find_file(start, relative)
    return None if target is None else target.parents[len(Path(relative).parts) - 1]


ROOT = _find_root(Path(__file__).resolve().parent, SCHEMA_REL)
if ROOT is None:  # pragma: no cover - a moved test is a hard failure, not a skip
    raise SystemExit(f"cannot locate {SCHEMA_REL} from {Path(__file__).resolve()}")


def _load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


HELPER = _load_module(ROOT / HELPER_REL, "pm_permissions_rule_command_contracts_under_test")
DOUBLE = _load_module(ROOT / DOUBLE_REL, "pm_permissions_rule_command_owner_file_double_under_test")
SCHEMA = json.loads((ROOT / SCHEMA_REL).read_text(encoding="utf-8"))
FIXTURE = json.loads((ROOT / FIXTURE_REL).read_text(encoding="utf-8"))
TOUCH_REGISTRY = json.loads((ROOT / TOUCH_REL).read_text(encoding="utf-8"))
WIRING = json.loads((ROOT / WIRING_REL).read_text(encoding="utf-8"))

_HERE = Path(__file__).resolve().parent
OWNER_DOC = _find_file(_HERE, OWNER_REL) or _find_file(_HERE, f"inputs/{OWNER_REL}")
CATALOG_DOC = _find_file(_HERE, CATALOG_REL) or _find_file(_HERE, f"inputs/{CATALOG_REL}")
SETTINGS_DOC = _find_file(_HERE, SETTINGS_REL) or _find_file(_HERE, f"inputs/{SETTINGS_REL}")
TOUCH_VERIFIER = _find_file(_HERE, TOUCH_VERIFIER_REL) or _find_file(_HERE, f"inputs/{TOUCH_VERIFIER_REL}")

CASES: list = []


def case(function):
    CASES.append(function)
    return function


def _validator(definition: str) -> Draft202012Validator:
    return Draft202012Validator({**SCHEMA, "$ref": f"#/$defs/{definition}"})


def _apply_recipe(value, patch=None, remove=None):
    for dotted, replacement in (patch or {}).items():
        parts = dotted.split(".")
        current = value
        for part in parts[:-1]:
            current = current[int(part)] if isinstance(current, list) else current[part]
        current[parts[-1]] = json.loads(json.dumps(replacement))
    for dotted in remove or []:
        parts = dotted.split(".")
        current = value
        for part in parts[:-1]:
            current = current[int(part)] if isinstance(current, list) else current[part]
        current.pop(parts[-1], None)
    return value


def _positive_instances() -> dict[str, dict]:
    return {item["name"]: item["instance"] for item in FIXTURE["valid"]}


def _semantic_failures(definition: str, value, **kwargs) -> list[str]:
    """Semantic entry as the enrolled static gate drives it.

    ``witness=False`` withholds every owner read, which is the missing-callback
    case the companion must report as unproven rather than accepting.
    """

    if kwargs.pop("witness", True):
        kwargs = {**DOUBLE.witness_for(value), **kwargs}
    return HELPER.permissions_rule_command_semantic_failures(definition, value, **kwargs)


def _join_failures(value, **kwargs) -> list[str]:
    if kwargs.pop("witness", True):
        kwargs = {**DOUBLE.witness_for(value), **kwargs}
    return HELPER.join_case_failures(value, document=FIXTURE, **kwargs)


def _resolve_pointer(document, ref: str):
    current = document
    for token in ref.split("#", 1)[1].lstrip("/").split("/"):
        if not token:
            continue
        token = token.replace("~1", "/").replace("~0", "~")
        current = current[int(token)] if isinstance(current, list) else current[token]
    return current


# ---------------------------------------------------------------------------
# schema and fixture envelope
# ---------------------------------------------------------------------------


@case
def test_schema_is_closed_and_metaschema_valid() -> None:
    Draft202012Validator.check_schema(SCHEMA)
    assert SCHEMA["$schema"] == "https://json-schema.org/draft/2020-12/schema"
    schema_id = SCHEMA["$id"]
    assert schema_id.startswith("https://puppetmaster.local/"), schema_id
    for name in SCHEMA["oneOf"]:
        assert name["$ref"].startswith("#/$defs/")
    definitions = SCHEMA["$defs"]
    for name, definition in definitions.items():
        if "additionalProperties" in definition:
            assert definition["additionalProperties"] is False, name
    request_enum = definitions["rule_command_id"]["enum"]
    assert tuple(request_enum) == HELPER.COMMAND_IDS
    assert tuple(definitions["rule_action"]["enum"]) == HELPER.PERMISSION_LADDER
    assert tuple(definitions["dirty_state"]["enum"]) == HELPER.DIRTY_STATE_VALUES
    assert tuple(definitions["rule_error_code"]["enum"]) == HELPER.RULE_ERROR_CODES
    for forbidden in ("config_file_text", "config_file_encoding", "loaded_hash_algorithm"):
        assert forbidden not in json.dumps(SCHEMA), forbidden


@case
def test_only_owner_backed_caps_and_patterns_survive() -> None:
    """The schema keeps the owner-named bounds and no unowned restriction.

    Every remaining numeric bound, inventory cap and pattern is listed here with
    its owner source; the removed 64-rule, 4096-index, 512/1024-length and glob
    grammar restrictions must not reappear, and positives above the removed rule
    and index caps stay schema-valid.
    """

    collected = []

    def walk(node, path: str) -> None:
        if isinstance(node, dict):
            for key, value in node.items():
                if key in {"maxItems", "maxLength", "maximum", "minItems", "minLength", "minimum"}:
                    collected.append((key, path, value))
                elif key == "pattern":
                    collected.append((key, path, value))
                elif key == "uniqueItems":
                    collected.append((key, path, value))
                walk(value, f"{path}/{key}")
        elif isinstance(node, list):
            for index, value in enumerate(node):
                walk(value, f"{path}/{index}")

    walk(SCHEMA, "")
    expected = [
        ("minLength", "/$defs/non_empty_string", 1),
        ("minLength", "/$defs/owner_file_hash", 1),
        ("minLength", "/$defs/owner_timestamp", 1),
        ("minLength", "/$defs/rule_pattern", 1),
        ("pattern", "/$defs/rule_scope_key", "^(global|project|package:.+|seam:.+|lane:.+)$"),
        (
            "pattern",
            "/$defs/rule_id",
            "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        ),
        ("minItems", "/$defs/permissions_rule_owner_snapshot/properties/selectable_scope_keys", 1),
        ("maxItems", "/$defs/permissions_rule_owner_snapshot/properties/selectable_scope_keys", 5),
        ("uniqueItems", "/$defs/permissions_rule_owner_snapshot/properties/selectable_scope_keys", True),
        ("minimum", "/$defs/rule_order/properties/target_index", 0),
        ("maxItems", "/$defs/effect_disposition/properties/atomic_steps", 4),
        ("uniqueItems", "/$defs/effect_disposition/properties/atomic_steps", True),
        ("maxItems", "/$defs/result_evidence/properties/emitted_event_types", 0),
        ("minimum", "/$defs/permissions_rule_command_result/properties/order_index/oneOf/0", 0),
        (
            "pattern",
            "/$defs/permissions_rule_command_result/properties/dispatch_receipt_ref",
            "^cmd\\.permissions\\.(create_project_rule|update_rule|reorder_rule|delete_rule|validate_rule)\\.dispatch_receipt$",
        ),
        ("uniqueItems", "/$defs/permissions_rule_error/properties/recovery_action_ids", True),
        ("uniqueItems", "/$defs/permissions_rule_error/properties/allowed_action_ids", True),
        (
            "pattern",
            "/$defs/permissions_rule_command_availability/properties/state_selector",
            "^state\\.commands\\.permissions_(create_project_rule|update_rule|reorder_rule|delete_rule|validate_rule)\\.availability$",
        ),
        (
            "pattern",
            "/$defs/permissions_rule_command_availability/properties/disabled_reason_projection",
            "^state\\.commands\\.permissions_(create_project_rule|update_rule|reorder_rule|delete_rule|validate_rule)\\.disabled_reason$",
        ),
        ("pattern", "/$defs/permissions_rule_command_availability/properties/disabled_reason_ref/oneOf/0", "^#/"),
        (
            "uniqueItems",
            "/$defs/permissions_rule_permission_evidence/properties/allowed_action_ids",
            True,
        ),
    ]
    assert sorted(collected) == sorted(expected), (sorted(collected), sorted(expected))
    schema_text = json.dumps(SCHEMA)
    for removed in ("maxLength", "sha256", "{64}", "maxItems\": 64", "maximum\": 4096"):
        assert removed not in schema_text, removed

    instances = _positive_instances()
    large = instances["snapshot.project_layer_above_prior_rule_cap"]["ordered_rules"]
    assert len(large) == 70, len(large)
    assert not list(_validator("permissions_rule_owner_snapshot").iter_errors(
        instances["snapshot.project_layer_above_prior_rule_cap"]
    ))
    large_binding = instances["binding.create_project_rule.persisted_atomic.above_prior_rule_cap"]
    assert len(large_binding["owner_snapshot"]["ordered_rules"]) == 70
    assert large_binding["observed_result"]["order_index"] == 69
    assert len(large_binding["observed_result"]["observed_ordered_rules"]) == 71
    assert not _join_failures(large_binding)

    # An index above the removed 4096 cap stays schema-valid and the owner's own
    # named refusal, not a schema error, reports it.
    out_of_range = instances["binding.reorder_rule.refused.target_index_above_prior_index_cap"]
    assert out_of_range["request"]["order"]["target_index"] == 5000
    assert not list(_validator("permissions_rule_command_binding").iter_errors(out_of_range))
    assert out_of_range["observed_result"]["effect_disposition"]["kind"] == "refused"
    assert out_of_range["observed_result"]["error"]["error_code"] == "target_index_out_of_range"
    assert not _join_failures(out_of_range)


@case
def test_fixture_envelope_and_exact_command_inventory() -> None:
    assert FIXTURE["owner_schema"] == SCHEMA_REL
    assert FIXTURE["contract_schema"] == SCHEMA_REL
    assert FIXTURE["coverage"]["exact_command_ids"] == list(HELPER.COMMAND_IDS)
    assert set(FIXTURE["coverage"]["join_checks"]) == set(HELPER.CHECKS)
    assert set(FIXTURE["coverage"]["held_slices"]) == set(HELPER.HELD_SLICES)
    assert {card["card_id"] for card in HELPER.DECISION_CARDS} == set(FIXTURE["coverage"]["decision_cards"])
    assert FIXTURE["errors"], "shared error records are required for pack-local refs"


# ---------------------------------------------------------------------------
# positives and negatives
# ---------------------------------------------------------------------------


@case
def test_positive_records_and_bindings_pass() -> None:
    checked = 0
    for item in FIXTURE["valid"]:
        definition = item["definition"]
        instance = item["instance"]
        errors = list(_validator(definition).iter_errors(instance))
        assert not errors, (item["name"], errors[0].message)
        if definition == "permissions_rule_command_binding":
            assert not _join_failures(instance), (item["name"], _join_failures(instance))
            # Without any independent owner read the same binding is explicitly
            # unproven instead of silently passing.
            blind = set(HELPER.join_case_failures(instance, document=FIXTURE))
            expected = {
                "join_owner_currentness_unproven",
                "join_owner_selected_original_unproven",
            }
            if instance["observed_result"]["effect_disposition"]["kind"] == "persisted_atomic":
                expected.add("join_owner_readback_unproven")
            assert blind == expected, (item["name"], sorted(blind))
        else:
            assert not _semantic_failures(definition, instance), (item["name"], definition)
        checked += 1
    assert checked == len(FIXTURE["valid"]) and checked >= 40, checked


@case
def test_structural_negatives_are_rejected() -> None:
    instances = _positive_instances()
    for item in FIXTURE["invalid"]:
        definition = item["definition"]
        if "instance" in item:
            value = json.loads(json.dumps(item["instance"]))
        else:
            value = _apply_recipe(
                json.loads(json.dumps(instances[item["base_valid"]])),
                item.get("patch"),
                item.get("remove"),
            )
        errors = list(_validator(definition).iter_errors(value))
        assert errors, f"structural negative accepted: {item['name']}"


@case
def test_causal_negatives_are_schema_valid_single_fault_and_disable_proof() -> None:
    instances = _positive_instances()
    for item in FIXTURE["negative_cases"]:
        definition = item["definition"]
        law = item["semantic_rule"]
        assert item["without_join"].strip(), f"{item['name']} must state the naive acceptance it defeats"
        value = _apply_recipe(
            json.loads(json.dumps(instances[item["base_valid"]])),
            item.get("patch"),
            item.get("remove"),
        )
        # independently schema-valid inputs
        errors = list(_validator(definition).iter_errors(value))
        assert not errors, (item["name"], errors[0].message)
        # exactly the declared law rejects the pair
        failures = _semantic_failures(definition, value)
        assert failures == [law], (item["name"], failures)
        # the same pair passes once that single law is set aside
        permissive = _semantic_failures(
            definition,
            value,
            enabled_checks=[name for name in HELPER.RECORD_LAW_IDS if name != law],
        )
        assert permissive == [], (item["name"], permissive)


@case
def test_every_join_check_is_proven() -> None:
    """Every declared law is rejected by a fixture negative or by this suite.

    The two missing-witness laws cannot be fixture negatives: the enrolled static
    gate always supplies the pinned owner-file witness, so their proofs are the
    two no-witness calls made here.
    """

    fixture_proven = {item["semantic_rule"] for item in FIXTURE["negative_cases"]}
    defensive = {"join_event_boundary"}
    instances = _positive_instances()
    persisted = instances["binding.update_rule.persisted_atomic"]
    refusal = instances["binding.update_rule.refused.permission_config_write_conflict"]
    no_read = HELPER.join_case_failures(refusal, document=FIXTURE)
    assert no_read == ["join_owner_currentness_unproven", "join_owner_selected_original_unproven"], no_read
    no_readback = HELPER.join_case_failures(
        persisted,
        document=FIXTURE,
        owner_file_read=DOUBLE.owner_file_read,
        owner_selected_rules_read=DOUBLE.owner_selected_rules_read(persisted["binding_id"]),
    )
    assert no_readback == ["join_owner_readback_unproven"], no_readback
    focused_test_proven = {"join_owner_currentness_unproven", "join_owner_readback_unproven"}
    unproven = sorted(set(HELPER.CHECKS) - fixture_proven - focused_test_proven - defensive)
    assert not unproven, f"unproven join laws: {unproven}"
    assert fixture_proven - set(HELPER.RECORD_LAW_IDS) <= set(HELPER.CHECKS)



def _load_verifier_module():
    """Import the real central gate, stubbing only siblings a partial copy omits."""

    import ast
    import types

    path = ROOT / "scripts" / "pm-new-contracts-verify.py"
    if not path.exists():
        return None
    sys.path.insert(0, str(ROOT / "scripts"))
    source = path.read_text(encoding="utf-8")
    imports: dict[str, set[str]] = {}
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.ImportFrom) and node.module and node.module.startswith("pm_"):
            imports.setdefault(node.module, set()).update(alias.name for alias in node.names)
    for module_name, names in imports.items():
        if module_name in sys.modules:
            continue
        try:
            __import__(module_name)
        except Exception:  # noqa: BLE001 - only absent sibling helpers in a partial copy
            stub = types.ModuleType(module_name)
            for name in names:
                setattr(stub, name, lambda *args, **kwargs: [])
            sys.modules[module_name] = stub
    return _load_module(path, "pm_new_contracts_verify_under_test")


VERIFIER_MODULE = _load_verifier_module()


@case
def test_pack_passes_central_gate_protocol_for_this_pair() -> None:
    """Drive the real gate's per-pair protocol over exactly this companion."""

    if VERIFIER_MODULE is None:  # pragma: no cover - partial copy without the gate
        raise AssertionError("central verifier is required for the enrolment check")
    module = VERIFIER_MODULE
    pair = (SCHEMA_REL, FIXTURE_REL)
    assert pair in module.CONTRACT_PAIRS, "companion must be enrolled exactly once"
    assert len(module.CONTRACT_PAIRS) == module.EXPECTED_CONTRACT_PAIR_COUNT
    assert len(set(module.CONTRACT_PAIRS)) == module.EXPECTED_CONTRACT_PAIR_COUNT

    module.Draft202012Validator.check_schema(SCHEMA)
    fallback_registry = module.Registry(
        retrieve=lambda uri: (_ for _ in ()).throw(ValueError(f"unregistered schema URI: {uri}"))
    )

    positives = module.legacy_positive_cases(FIXTURE)
    positive_by_name: dict[str, dict] = {}
    selected_by_name: dict[str, str] = {}
    for case_record in positives:
        name = str(case_record.get("name", case_record.get("case_id", "unnamed")))
        value = case_record.get("value", case_record.get("record", case_record.get("instance")))
        positive_by_name[name] = value
        definition, selected = module.select_definition(SCHEMA, case_record, value, require_valid=True)
        selected_by_name[name] = definition
        errors = list(module.validator_for(SCHEMA, selected, fallback_registry).iter_errors(value))
        assert not errors, (name, errors[0].message)
        assert not module.contract_semantic_failures(SCHEMA_REL, definition, value), name

    invalids = list(FIXTURE.get("invalid", []))
    invalids.extend(FIXTURE.get("negative", []))
    invalids.extend(FIXTURE.get("negative_cases", []))
    invalids.extend(FIXTURE.get("pairwise_invalid", []))
    for case_record in invalids:
        name = str(case_record.get("name", case_record.get("case_id", "unnamed")))
        value = module.materialize_invalid(case_record, positive_by_name)
        selector = dict(case_record)
        if "definition" not in selector and "schema_ref" not in selector:
            base = selector.get("base_valid", selector.get("left_valid"))
            selector["definition"] = selected_by_name[base]
        definition, selected = module.select_definition(SCHEMA, selector, value, require_valid=False)
        accepted = module.validator_for(SCHEMA, selected, fallback_registry).is_valid(value)
        semantic_rule = case_record.get("semantic_rule")
        if semantic_rule is not None:
            failures = module.contract_semantic_failures(SCHEMA_REL, definition, value)
            assert accepted, f"{name} must stay schema-valid to prove a semantic law"
            assert semantic_rule in failures, (name, semantic_rule, failures)
        else:
            assert not accepted, f"{name} must be rejected structurally"

    if (ROOT / "Plans" / "shared_runtime_contracts.schema.json").exists():
        module.offline_schema_registry()


# ---------------------------------------------------------------------------
# owner file-hash boundary (private fake owner file reader)
# ---------------------------------------------------------------------------


@case
def test_owner_originals_are_independent_pinned_witnesses() -> None:
    """The static gate's witness is separate from the binding it checks."""

    assert "never authority" in HELPER.CURRENTNESS_BOUNDARY
    assert "explicitly unproven" in HELPER.CURRENTNESS_BOUNDARY
    double_source = (ROOT / DOUBLE_REL).read_text(encoding="utf-8")
    assert DOUBLE.NATIVE_PRODUCER is False
    assert "static test evidence" in double_source.lower()
    assert "never a native producer" in double_source.lower()
    # The pinned original is a separate artifact: it never reads the fixture pack
    # and never derives anything from the binding it is supposed to check.
    assert FIXTURE_REL not in double_source
    assert "fixtures.json" not in double_source
    assert "PINNED_SELECTED_ORIGINALS" in double_source

    instances = _positive_instances()
    persisted = instances["binding.update_rule.persisted_atomic"]
    refusal = instances["binding.update_rule.refused.permission_config_write_conflict"]
    validated = instances["binding.validate_rule.validated_no_persistence"]
    large = instances["binding.create_project_rule.persisted_atomic.above_prior_rule_cap"]

    # with the pinned static owner originals every shape passes
    for binding in (persisted, validated, refusal, large):
        assert not _join_failures(binding), (binding["binding_id"], _join_failures(binding))

    # the pinned owner-selected original is the owner's own read, not a copy of
    # the binding's declared projection
    assert DOUBLE.PINNED_SELECTED_ORIGINALS[persisted["binding_id"]] == tuple(
        persisted["owner_snapshot"]["ordered_rules"]
    )
    assert DOUBLE.PINNED_CURRENT_OWNER_FILE_HASH == persisted["owner_snapshot"]["declared_loaded_config_hash"]
    assert DOUBLE.PINNED_POST_WRITE_OWNER_FILE_HASH == persisted["observed_result"]["observed_config_hash"]

    # no independent read at all: every declared original is explicitly unproven
    blind = _join_failures(persisted, witness=False)
    assert blind == [
        "join_owner_currentness_unproven",
        "join_owner_readback_unproven",
        "join_owner_selected_original_unproven",
    ], blind
    blind_refusal = _join_failures(refusal, witness=False)
    assert blind_refusal == [
        "join_owner_currentness_unproven",
        "join_owner_selected_original_unproven",
    ], blind_refusal

    # a co-mutated request and snapshot hash is rejected by the fixed anchor
    stale = _apply_recipe(
        json.loads(json.dumps(persisted)),
        {
            "owner_snapshot.declared_loaded_config_hash": "owner-file-hash:static-fixture:generation-0:superseded",
            "request.expected_loaded_config_hash": "owner-file-hash:static-fixture:generation-0:superseded",
        },
    )
    stale_failures = _join_failures(stale)
    assert stale_failures == ["join_owner_snapshot_is_current"], stale_failures

    # a post-write claim that is not the owner's read-back fails only the read-back law
    readback = _join_failures(
        persisted,
        owner_post_write_read=DOUBLE.owner_file_read,
    )
    assert readback == ["join_file_hash_readback"], readback

    # a no-write outcome that declares a hash the owner never read fails only the read-back law
    changed = _apply_recipe(
        json.loads(json.dumps(refusal)),
        {"observed_result.observed_config_hash": DOUBLE.PINNED_POST_WRITE_OWNER_FILE_HASH},
    )
    changed_failures = _join_failures(changed)
    assert changed_failures == ["join_file_hash_readback"], changed_failures

    # a copied owner-selected witness (the on-record field read back) accepts a
    # co-mutated original/result pair; the separate pinned original rejects it
    co_mutated = _apply_recipe(
        json.loads(json.dumps(persisted)),
        {
            "owner_snapshot.ordered_rules.1.action": "deny",
            "observed_result.observed_rule.action": "deny",
        },
    )
    copied_witness = co_mutated["owner_snapshot"]["ordered_rules"]
    copied_failures = HELPER.join_case_failures(
        co_mutated,
        document=FIXTURE,
        owner_file_read=DOUBLE.owner_file_read,
        owner_post_write_read=DOUBLE.owner_post_write_read,
        owner_selected_rules_read=lambda: copied_witness,
    )
    assert not copied_failures, copied_failures
    pinned_failures = _join_failures(co_mutated)
    assert pinned_failures == ["join_owner_selected_original"], pinned_failures


# ---------------------------------------------------------------------------
# static-only boundaries
# ---------------------------------------------------------------------------


@case
def test_validate_rule_never_persists_or_approves() -> None:
    validate_bindings = [
        item["instance"]
        for item in FIXTURE["valid"]
        if item["definition"] == "permissions_rule_command_binding"
        and item["instance"]["command_id"] == HELPER.VALIDATE_COMMAND_ID
    ]
    assert len(validate_bindings) >= 2, len(validate_bindings)
    for binding in validate_bindings:
        result = binding["observed_result"]
        assert result["effect_disposition"]["kind"] in {
            "validated_no_persistence",
            "refused",
            "blocked",
        }
        assert result["persistence_receipt_ref"] is None
        assert result["approval_created"] is False
    fabricated = _apply_recipe(
        json.loads(json.dumps(validate_bindings[0])),
        {"observed_result.persistence_receipt_ref": "permissions.toml.write:validate:9999"},
    )
    assert _join_failures(fabricated) == ["join_validate_no_persistence"]
    fabricated_approval = _apply_recipe(
        json.loads(json.dumps(validate_bindings[0])),
        {"observed_result.approval_created": True},
    )
    assert _join_failures(fabricated_approval) == ["join_validate_no_approval"]


@case
def test_mutating_commands_stay_behind_permission_and_atomic_gates() -> None:
    for item in FIXTURE["valid"]:
        if item["definition"] != "permissions_rule_command_binding":
            continue
        binding = item["instance"]
        result = binding["observed_result"]
        evidence = result["evidence"]
        assert evidence["emitted_event_types"] == []
        assert evidence["admitted_event_record"] is False
        assert evidence["native_write_evidence"] == "absent"
        assert evidence["native_handler_claim"] is False
        assert result["effect_disposition"]["overwrote_newer_file"] is False
        assert binding["permission_evidence"]["native_execution_observed"] is False
        if result["effect_disposition"]["kind"] == "persisted_atomic":
            assert binding["permission_evidence"]["effective_permission_state"] == "allow"
            assert binding["availability"]["availability"] == "available"
    persisted = _positive_instances()["binding.update_rule.persisted_atomic"]
    denied = _apply_recipe(
        json.loads(json.dumps(persisted)),
        {
            "permission_evidence.requested_permission_state": "deny",
            "permission_evidence.effective_permission_state": "deny",
            "permission_evidence.blocked_reason_code": "policy_denied",
        },
    )
    assert _join_failures(denied) == ["join_disposition_permission_parity"]
    event_claim = _apply_recipe(
        json.loads(json.dumps(persisted)),
        {"observed_result.evidence.admitted_event_record": True},
    )
    assert _join_failures(event_claim) == ["join_event_boundary"]


# ---------------------------------------------------------------------------
# copied owner bindings
# ---------------------------------------------------------------------------


@case
def test_touch_closure_binding_resolves_and_passes_owner_check() -> None:
    profiles = [
        profile
        for profile in TOUCH_REGISTRY["profiles"]
        if profile.get("profile_id") == "TCP-PERMISSIONS"
    ]
    assert len(profiles) == 1
    profile = profiles[0]
    for field in ("payload_schema_ref", "result_schema_ref", "error_schema_ref"):
        ref = profile[field]
        assert ref.startswith(SCHEMA_REL + "#/$defs/"), ref
        definition = ref.split("#/$defs/", 1)[1]
        assert definition in SCHEMA["$defs"], definition
        _resolve_pointer(SCHEMA, ref)
    # The unchanged owner-doc anchor must still name a real owner section; the
    # companion refs must resolve inside this schema. A partial copy may lack the
    # owner file, so the anchor is proven against the owner text itself.
    dry_ref = profile["dry_contract_ref"]
    anchor = dry_ref.split("#", 1)[1]
    owner_text = OWNER_DOC.read_text(encoding="utf-8") if OWNER_DOC else ""
    headings = [
        line.lstrip("# ").strip()
        for line in owner_text.splitlines()
        if line.startswith("#")
    ]
    assert anchor in {heading.replace(" ", "-").replace(",", "") for heading in headings}, anchor
    if (ROOT / OWNER_REL).exists():
        assert (ROOT / OWNER_REL).is_file()
    rows = [
        row
        for row in TOUCH_REGISTRY["rows"]
        if isinstance(row, list) and len(row) == 6 and row[1] == "TCP-PERMISSIONS"
    ]
    assert len(rows) == 5
    assert all(row[4] == "partial" and row[5].strip() for row in rows)
    assert sorted(row[3] for row in rows) == sorted(HELPER.COMMAND_IDS)

    if TOUCH_VERIFIER is not None:
        module = _load_module(TOUCH_VERIFIER, "pm_touch_closure_verify_under_test")
        failures = module.permissions_rule_reference_failures(TOUCH_REGISTRY)
        assert failures == [], failures


@case
def test_central_wiring_rows_bind_exact_surfaces() -> None:
    entries = WIRING["entries"]
    assert len(entries) == 1142
    for element, command_id in zip(HELPER.ELEMENT_IDS, HELPER.COMMAND_IDS):
        key = f"catalog.permissions_{element}"
        row = entries[key]
        assert row["ui_command_id"] == command_id
        assert row["handler_location"] == f"handlers::permissions::{element}"
        assert row["expected_event_types"] == []
        assert row["effect_contract"]["effect_kind"] == "receipt"
        assert row["effect_contract"]["receipt_or_event_refs"] == [HELPER.dispatch_receipt_ref(command_id)]
        assert row["state_selector"] == HELPER.availability_selector(element)
        assert row["disabled_reason_projection"] == HELPER.disabled_reason_projection(element)
        assert row["request_schema_ref"] == f"{SCHEMA_REL}#/$defs/permissions_rule_command_request"
        assert row["result_schema_ref"] == f"{SCHEMA_REL}#/$defs/permissions_rule_command_result"
        assert "typed companion" in " ".join(row["acceptance_checks"]).lower()
        assert "typed payload/result contract" in " ".join(row["acceptance_checks"])


@case
def test_owner_vocabulary_is_shipped() -> None:
    assert OWNER_DOC is not None and OWNER_DOC.is_file(), "owner doc is required"
    owner_text = OWNER_DOC.read_text(encoding="utf-8")
    for token in (
        *HELPER.COMMAND_IDS,
        *HELPER.RULE_ERROR_CODES,
        *HELPER.DIRTY_STATE_VALUES,
        *HELPER.BLOCKED_FAMILIES,
        *HELPER.BLOCKED_REASON_CODES,
        "loaded_config_hash",
        "loaded_config_hash` to the current file hash",
        "write-temp",
        "fsync-temp",
        "atomic rename",
        "fsync-parent-directory",
        ".permissions.{scope}.{nonce}.tmp",
        "Cross-filesystem rename is forbidden",
        "settings.permissions",
        "lane:",
        "seam:",
        "package:",
        "approval_scope_key",
        "permission_snapshot_id",
        "downgrade_reason",
        "requested_permission_state",
        "effective_permission_state",
        "allowed_action_ids",
        "rule_id",
        "tool_pattern",
        "created_at",
        "created_by_thread_id",
        "Mode override",
        "Parent/run ceiling",
        "Session cache",
        "Persona overrides",
        "Project-level",
        "Global-level",
        "Defaults",
    ):
        assert token in owner_text, token
    catalog_text = CATALOG_DOC.read_text(encoding="utf-8") if CATALOG_DOC else ""
    for token in (*HELPER.COMMAND_IDS, "settings.permissions", "target_index_out_of_range"):
        assert token in catalog_text, token
    settings_text = SETTINGS_DOC.read_text(encoding="utf-8") if SETTINGS_DOC else ""
    assert "native_handler_claim=false" in settings_text


@case
def test_decision_cards_are_explicit() -> None:
    cards = HELPER.DECISION_CARDS
    assert len(cards) >= 8
    assert len({card["card_id"] for card in cards}) == len(cards)
    for card in cards:
        for field in ("card_id", "slice", "owner_text", "held", "status"):
            assert card[field].strip(), (card["card_id"], field)
        assert card["status"] == "held_for_owner"
    held_text = " ".join(card["held"] for card in cards).lower()
    assert "owner" in held_text and "authority" in held_text


@case
def test_companion_is_static_only_and_additive() -> None:
    forbidden = (
        "migration",
        "ttl",
        "retry",
        "storage_key",
        "storage_family",
        "expires_at",
        "alias_of",
        "quota",
    )
    records = list(FIXTURE["errors"])
    for item in FIXTURE["valid"]:
        records.append(item["instance"])
    for item in FIXTURE["negative_cases"]:
        records.append(item.get("patch") or {})
        records.append(item.get("remove") or [])
    blob = json.dumps(records, sort_keys=True).lower()
    for token in forbidden:
        assert token not in blob, token
    rejected_tokens = [item["name"] for item in FIXTURE["invalid"]]
    assert any("retry" in name for name in rejected_tokens), "the retry-shaped field must stay rejected"
    assert "canonical_json_projection" not in json.dumps(SCHEMA).lower()
    schema_text = json.dumps(SCHEMA).lower()
    assert "eventrecord" in schema_text  # the boundary is stated, not an emitted event
    assert FIXTURE["claim_boundary"].strip()


def main() -> int:
    failures: list[tuple[str, str]] = []
    for function in CASES:
        try:
            function()
        except Exception as exc:  # noqa: BLE001 - the harness reports, never hides
            failures.append((function.__name__, f"{type(exc).__name__}: {exc}"))
            print(f"FAIL {function.__name__}: {type(exc).__name__}: {exc}")
        else:
            print(f"PASS {function.__name__}")
    print(f"\n{len(CASES) - len(failures)}/{len(CASES)} focused checks passed")
    if failures:
        print("failing cases:")
        for name, detail in failures:
            print(f"  - {name}: {detail}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
