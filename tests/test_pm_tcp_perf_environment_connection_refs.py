"""Focused regression for the TCP-PERF exact existing-reference repair.

Profile TCP-PERF in Plans/touch_closure.json must bind its dry, payload,
result, and error references to the already accepted SIR-015
EnvironmentConnectionSupervisor command family (cmd.environment.connect,
.reconnect, .disconnect) in the existing central command contracts schema,
and its persistence/migration references to the existing
environment_connection_state storage family and SIR-015 owner material,
without erasing the central CommandOutcomeRecord receipt, the
ObservableWorkRecord observable work, the three reverse consumers, the
partial/no-native-proof disposition, or any other profile or Touch row.

The test parses the actual profile, owner plan, schemas, registry, and
fixtures. It runs both inside the repository layout (Plans/ next to tests/)
and against a detached authoring copy (candidate/ or inputs/ overlays);
set PM_TCP_PERF_TOUCH_CLOSURE, PM_TCP_PERF_REPO_ROOT, or the per-file
overrides to point it elsewhere. PM_TCP_PERF_BASELINE optionally points at
a pristine touch_closure.json for the exact unchanged-row/profile
comparison; that one check is skipped when the baseline is absent.
"""

import copy
import json
import os
import sys
from pathlib import Path

try:
    import pytest

    HAS_PYTEST = True
except ImportError:  # pragma: no cover - plain-runner fallback
    HAS_PYTEST = False

try:
    from jsonschema import Draft202012Validator

    HAS_JSONSCHEMA = True
except ImportError:  # pragma: no cover - actual schema checks require this dependency
    HAS_JSONSCHEMA = False


TEST_DIR = Path(__file__).resolve().parent
PROFILE_ID = "TCP-PERF"
COMMAND_IDS = [
    "cmd.environment.connect",
    "cmd.environment.reconnect",
    "cmd.environment.disconnect",
]
COMMAND_SCHEMA_REF = "Plans/shared_runtime_command_contracts.schema.json"
REQUEST_DEF_REF = COMMAND_SCHEMA_REF + "#/$defs/environment_connection_command_request"
RESULT_DEF_REF = COMMAND_SCHEMA_REF + "#/$defs/environment_connection_command_result"
ERROR_DEF_REF = COMMAND_SCHEMA_REF + "#/$defs/command_error"
STATE_DEF_REF = "Plans/shared_runtime_contracts.schema.json#/$defs/environment_connection_state"
REGISTRY_FAMILY_REF = "Plans/storage_value_registry.json#/families/56"
MIGRATION_REF = "Plans/Shared_Integration_Runtime.md#SIR-015"
CENTRAL_SCHEMA_REF = "Plans/full_thread_runtime_contracts.schema.json"
RECEIPT_REF = CENTRAL_SCHEMA_REF + "#/$defs/CommandOutcomeRecord"
OBSERVABLE_WORK_REF = CENTRAL_SCHEMA_REF + "#/$defs/ObservableWorkRecord"
REVERSE_CONSUMERS = [
    "Plans/usage-feature.md",
    "Plans/Settings_System.md",
    "Plans/FinalGUISpec.md",
]

INTEGRATION_COMMAND = "cmd.integration.connection.add"


class _Skipped(Exception):
    pass


def _skip(message):
    if HAS_PYTEST:
        pytest.skip(message)
    raise _Skipped(message)


def _bases():
    bases = []
    root = os.environ.get("PM_TCP_PERF_REPO_ROOT")
    if root:
        bases.append(Path(root).resolve())
    for base in [TEST_DIR, *TEST_DIR.parents[:6]]:
        if base not in bases:
            bases.append(base)
    return bases


def _locate(name, env_var):
    override = os.environ.get(env_var)
    if override:
        path = Path(override)
        if path.is_file():
            return path.resolve()
        raise AssertionError(f"{env_var}={override} does not exist")
    relatives = [Path("Plans") / name, Path("candidate") / Path("Plans") / name, Path("inputs") / Path("Plans") / name]
    seen = set()
    for base in _bases():
        for rel in relatives:
            path = base / rel
            if path.is_file() and path not in seen:
                return path.resolve()
            seen.add(path)
    raise AssertionError(f"could not locate {name}; set {env_var} or PM_TCP_PERF_REPO_ROOT")


def _profile_doc():
    return json.loads(_locate("touch_closure.json", "PM_TCP_PERF_TOUCH_CLOSURE").read_text(encoding="utf-8"))


def _sibling(name, env_var):
    return _locate(name, env_var)


def tcp_perf_profile():
    doc = _profile_doc()
    matches = [p for p in doc["profiles"] if p.get("profile_id") == PROFILE_ID]
    assert len(matches) == 1, f"expected exactly one {PROFILE_ID} profile, found {len(matches)}"
    return matches[0]


COMMAND_SCHEMA = json.loads(_sibling("shared_runtime_command_contracts.schema.json", "PM_TCP_PERF_COMMAND_SCHEMA").read_text(encoding="utf-8"))
CENTRAL_SCHEMA = json.loads(_sibling("full_thread_runtime_contracts.schema.json", "PM_TCP_PERF_CENTRAL_SCHEMA").read_text(encoding="utf-8"))
STATE_SCHEMA = json.loads(_sibling("shared_runtime_contracts.schema.json", "PM_TCP_PERF_STATE_SCHEMA").read_text(encoding="utf-8"))
REGISTRY = json.loads(_sibling("storage_value_registry.json", "PM_TCP_PERF_STORAGE_REGISTRY").read_text(encoding="utf-8"))
FIXTURES = json.loads(_sibling("shared_runtime_command_contract_fixtures.json", "PM_TCP_PERF_FIXTURES").read_text(encoding="utf-8"))
OWNER_TEXT = _sibling("Shared_Integration_Runtime.md", "PM_TCP_PERF_OWNER_DOC").read_text(encoding="utf-8")


def _validator(def_name):
    return Draft202012Validator({"$defs": COMMAND_SCHEMA["$defs"], "$ref": f"#/$defs/{def_name}"})


def _find_properties(def_body, prop_name):
    """Collect every declaration of prop_name, wherever allOf nesting puts it."""
    found = []

    def walk(node):
        if isinstance(node, dict):
            properties = node.get("properties")
            if isinstance(properties, dict) and prop_name in properties:
                found.append(properties[prop_name])
            for value in node.values():
                walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(def_body)
    return found


def _find_required(def_body):
    found = []

    def walk(node):
        if isinstance(node, dict):
            for key, value in node.items():
                if key == "required" and isinstance(value, list):
                    found.extend(value)
                else:
                    walk(value)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(def_body)
    return found


def _structural_errors(instance, def_name):
    errors = []
    def_body = COMMAND_SCHEMA["$defs"][def_name]
    enum = _find_properties(def_body, "command_id")[0]["enum"]
    command_id = instance.get("command_id")
    if command_id not in enum:
        errors.append(f"command_id {command_id!r} is not one of {enum}")
    elif def_name == "environment_connection_command_request":
        for key in _find_required(def_body):
            if key not in instance:
                errors.append(f"missing required field {key!r}")
        if instance.get("action") != command_id.rsplit(".", 1)[-1]:
            errors.append(f"action {instance.get('action')!r} does not match command_id {command_id!r}")
    else:
        if def_name == "environment_connection_command_result":
            if instance.get("result_type") != "EnvironmentConnectionCommandResult":
                errors.append("result_type must be 'EnvironmentConnectionCommandResult'")
            if not instance.get("subject_ref"):
                errors.append("subject_ref is required")
    return errors


def validate_against(instance, def_name):
    """Return the list of validation errors for instance against $defs/<def_name>."""
    assert def_name in COMMAND_SCHEMA["$defs"], f"{def_name} must already exist in the central command schema"
    assert HAS_JSONSCHEMA, "jsonschema is required to verify the actual Draft 2020-12 contract"
    return [error.message for error in sorted(_validator(def_name).iter_errors(instance), key=lambda e: list(e.path))]


def fixture_case(definition):
    cases = [c for c in FIXTURES["valid"] if c.get("definition") == definition]
    assert len(cases) == 1, f"expected exactly one valid {definition} fixture, found {len(cases)}"
    return cases[0]


def test_profile_binds_exact_existing_pointer_targets():
    profile = tcp_perf_profile()
    assert profile["dry_contract_ref"] == COMMAND_SCHEMA_REF
    assert profile["payload_schema_ref"] == REQUEST_DEF_REF
    assert profile["result_schema_ref"] == RESULT_DEF_REF
    assert profile["error_schema_ref"] == ERROR_DEF_REF
    assert profile["persistence_refs"] == [REGISTRY_FAMILY_REF, STATE_DEF_REF]
    assert profile["migration_refs"] == [MIGRATION_REF]
    for ref in (REQUEST_DEF_REF, RESULT_DEF_REF, ERROR_DEF_REF):
        assert "full_thread_runtime_contracts.schema.json" not in ref


def test_bound_definitions_exist_and_enumerate_exactly_three_commands():
    defs = COMMAND_SCHEMA["$defs"]
    for def_name in ("environment_connection_command_request", "environment_connection_command_result", "command_error"):
        assert def_name in defs, f"central schema must keep {def_name}"
    request_enum = _find_properties(defs["environment_connection_command_request"], "command_id")[0]["enum"]
    result_enum = _find_properties(defs["environment_connection_command_result"], "command_id")[0]["enum"]
    assert request_enum == COMMAND_IDS
    assert result_enum == COMMAND_IDS
    for enum in (request_enum, result_enum):
        assert not any(command_id.startswith("cmd.integration.connection.") for command_id in enum)
    sir_heading = [line for line in OWNER_TEXT.splitlines() if line.lstrip("#").strip().startswith("SIR-015")]
    assert any("Full-Thread" in line for line in sir_heading), "SIR-015 full-thread owner material must exist in the owner plan"
    profile = tcp_perf_profile()
    assert profile["plan_unit"] == "SIR-015"
    assert profile["owner_plan"] == "Plans/Shared_Integration_Runtime.md"
    assert "Plans/Shared_Integration_Runtime.md#SIR-015" in profile["requirement_refs"]


def test_positive_typed_request_result_pair_validates():
    assert FIXTURES["owner_schema"] == COMMAND_SCHEMA_REF, "fixtures must own the exact bound schema"
    request_case = fixture_case("environment_connection_command_request")
    result_case = fixture_case("environment_connection_command_result")
    mode = "jsonschema draft 2020-12"
    request_errors = validate_against(request_case["value"], "environment_connection_command_request")
    result_errors = validate_against(result_case["value"], "environment_connection_command_result")
    assert request_errors == [], f"positive request fixture must validate ({mode}): {request_errors}"
    assert result_errors == [], f"positive result fixture must validate ({mode}): {result_errors}"
    assert request_case["value"]["command_id"] == "cmd.environment.connect"
    assert result_case["value"]["command_id"] == "cmd.environment.connect"


def test_wrong_command_and_missing_fence_negatives_rejected():
    request_case = fixture_case("environment_connection_command_request")
    wrong_command = copy.deepcopy(request_case["value"])
    wrong_command["command_id"] = INTEGRATION_COMMAND
    errors = validate_against(wrong_command, "environment_connection_command_request")
    assert errors, "a cmd.integration.connection.* command must be rejected by the environment request definition"
    missing_fence = copy.deepcopy(request_case["value"])
    del missing_fence["expected_supervisor_generation"]
    del missing_fence["expected_connection_epoch"]
    errors = validate_against(missing_fence, "environment_connection_command_request")
    assert errors, "dropping the supervisor-generation/connection-epoch fence must be rejected"
    mismatched_action = copy.deepcopy(request_case["value"])
    mismatched_action["action"] = "disconnect"
    errors = validate_against(mismatched_action, "environment_connection_command_request")
    assert errors, "action must stay consistent with command_id"


def test_central_receipt_work_consumers_and_no_native_proof_retained():
    profile = tcp_perf_profile()
    assert profile["receipt_refs"] == [RECEIPT_REF]
    assert profile["observable_work"] == [OBSERVABLE_WORK_REF]
    assert "CommandOutcomeRecord" in CENTRAL_SCHEMA["$defs"]
    assert "ObservableWorkRecord" in CENTRAL_SCHEMA["$defs"]
    assert profile["reverse_consumers"] == REVERSE_CONSUMERS
    assert profile["gui_triggers"] == ["Environment connection controls, reconnect recovery, thread/Usage projections"]
    assert profile["event_refs"] == ["none_pending_event_authority"]
    assert profile["test_refs"] == [
        "Plans/full_thread_runtime_contract_fixtures.json",
        "Plans/shared_runtime_command_contract_fixtures.json",
    ]
    assert profile["handler_owner"] == (
        "EnvironmentConnectionSupervisor sole handlers as named in central command contracts; "
        "no executable runtime evidence is admitted here."
    )
    assert profile["handler_status"] == "specified"
    assert profile["wiring_status"] == "specified"
    assert profile["production_or_simulation"] == (
        "Plans/catalog/wiring contracts only; no network/restart/performance runtime proof."
    )
    assert profile["evidence_refs"] == ["static_schema_catalog_and_wiring_only"]
    assert profile["availability_rule"] == (
        "Exact ExecutionEnvironmentId, supervisor generation, connection epoch, topology, auth, "
        "and resource admission are required."
    )
    assert profile["permission_gate"] == (
        "Environment owner, Permissions, topology, auth, rate, and governor gates remain independent."
    )
    assert profile["disabled_reason_rule"] == (
        "Expose stale, already-in-state, operation, topology, auth, breaker, resource, permission, "
        "or policy blocker."
    )
    assert "no executable runtime evidence" in profile["handler_owner"]


def test_no_conflation_with_integration_connection_family():
    profile = tcp_perf_profile()
    encoded = json.dumps(profile)
    assert "cmd.integration.connection" not in encoded
    assert "shared_integration_runtime" not in encoded
    assert INTEGRATION_COMMAND not in COMMAND_IDS
    doc = _profile_doc()
    integration = [p for p in doc["profiles"] if p.get("profile_id") == "TCP-INTEGRATION-CONNECTION"]
    assert len(integration) == 1, "the separate TCP-INTEGRATION-CONNECTION profile must remain present"
    assert "IntegrationConnectionCommandRequest" in integration[0]["payload_schema_ref"]


def test_touch_rows_keep_three_partial_environment_commands():
    doc = _profile_doc()
    columns = doc["row_columns"]
    assert set(["touch_id", "profile_id", "action_kind", "action_id", "disposition", "residual_risk"]) <= set(columns)
    rows = [dict(zip(columns, row)) for row in doc["rows"] if row[columns.index("profile_id")] == PROFILE_ID]
    assert [row["action_id"] for row in rows] == COMMAND_IDS
    assert all(row["action_kind"] == "command" for row in rows)
    assert all(row["disposition"] == "partial" for row in rows)
    assert [row["touch_id"] for row in rows] == ["TOUCH-PERF-001", "TOUCH-PERF-002", "TOUCH-PERF-003"]
    assert all("evidence" in row["residual_risk"] and "absent" in row["residual_risk"] for row in rows)
    profile_col = columns.index("profile_id")
    local_rows = [dict(zip(columns, row)) for row in doc["rows"] if row[profile_col] == "TCP-PERF-LOCAL"]
    assert len(local_rows) == 1 and local_rows[0]["action_id"] == "ui.performance.evidence.inspect"


def test_storage_family_is_existing_environment_connection_state_only():
    profile = tcp_perf_profile()
    assert REGISTRY_FAMILY_REF in profile["persistence_refs"]
    families = [f for f in REGISTRY["families"] if f.get("family_id") == "environment_connection_state"]
    assert len(families) == 1, "must reuse the one existing storage family, never add a new value"
    family = families[0]
    def resolve_family(ref):
        path, pointer = ref.split("#", 1)
        assert path == "Plans/storage_value_registry.json"
        target = REGISTRY
        for segment in pointer.lstrip("/").split("/"):
            target = target[int(segment)] if isinstance(target, list) else target[segment]
        return target

    assert resolve_family(REGISTRY_FAMILY_REF) == family
    for invalid_ref in (
        "Plans/storage_value_registry.json#/families/environment_connection_state",
        "Plans/storage_value_registry.json#/families/55",
    ):
        try:
            assert resolve_family(invalid_ref) == family
        except (AssertionError, KeyError, IndexError, ValueError):
            pass
        else:
            raise AssertionError(f"wrong or non-resolving storage family pointer accepted: {invalid_ref}")
    assert family["value_schema_ref"] == STATE_DEF_REF
    assert family["producer"] == ["EnvironmentConnectionSupervisor"]
    assert "environment_connection_state" in STATE_SCHEMA["$defs"]
    supervisor_key = family["key_shape"]
    assert supervisor_key.startswith("environment_connection_state.v1:")


def test_baseline_unchanged_rows_and_profiles():
    baseline_path = os.environ.get("PM_TCP_PERF_BASELINE")
    if not baseline_path:
        _skip("set PM_TCP_PERF_BASELINE to a pristine touch_closure.json for the exact unchanged-row comparison")
    baseline = json.loads(Path(baseline_path).read_text(encoding="utf-8"))
    current = _profile_doc()
    assert current.keys() == baseline.keys()
    for section in current:
        if section == "profiles":
            continue
        assert current[section] == baseline[section], f"section {section} must remain unchanged"
    assert len(current["profiles"]) == len(baseline["profiles"])
    differing_indexes = [i for i, (before, after) in enumerate(zip(baseline["profiles"], current["profiles"])) if before != after]
    assert differing_indexes == [i for i, p in enumerate(current["profiles"]) if p.get("profile_id") == PROFILE_ID]
    changed_keys = {
        key
        for key in set(baseline["profiles"][differing_indexes[0]]) | set(current["profiles"][differing_indexes[0]])
        if baseline["profiles"][differing_indexes[0]].get(key) != current["profiles"][differing_indexes[0]].get(key)
    } if differing_indexes else set()
    assert changed_keys == {
        "dry_contract_ref",
        "payload_schema_ref",
        "result_schema_ref",
        "error_schema_ref",
        "persistence_refs",
        "migration_refs",
        "test_refs",
    }
    assert baseline["profiles"][differing_indexes[0]]["payload_schema_ref"] == "EnvironmentConnectionCommandRequest"
    assert current["rows"] == baseline["rows"], "Touch rows must remain unchanged"


def _main():
    tests = [(name, fn) for name, fn in sorted(globals().items()) if name.startswith("test_") and callable(fn)]
    passed = 0
    skipped = 0
    failed = 0
    for name, fn in tests:
        try:
            fn()
        except _Skipped:
            skipped += 1
            print(f"SKIP {name}")
        except AssertionError as error:
            failed += 1
            print(f"FAIL {name}: {error}")
        else:
            passed += 1
            print(f"PASS {name}")
    print(f"{passed} passed, {skipped} skipped, {failed} failed (jsonschema={'yes' if HAS_JSONSCHEMA else 'no'})")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(_main())
