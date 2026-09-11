#!/usr/bin/env python3
"""Validate the protected AuthBrowserSession discrimination contract.

This is a pre-build schema/fixture check.  It does not implement a browser,
authorize authentication, or provide runtime/security certification.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable


ROOT = Path(__file__).resolve().parents[1]
PLANS = ROOT / "Plans"
SCHEMA_PATH = PLANS / "protected_auth_browser_contracts.schema.json"
FIXTURE_PATH = PLANS / "protected_auth_browser_contract_fixtures.json"
EXPANSION_SCHEMA_PATH = PLANS / "shared_integration_runtime_expansion_contracts.schema.json"


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def pointer(path: tuple[Any, ...]) -> str:
    return "$" + "".join(
        f"[{part}]" if isinstance(part, int) else f".{part}" for part in path
    )


def errors_for(validator: Draft202012Validator, value: Any) -> list[dict[str, str]]:
    return [
        {
            "pointer": pointer(tuple(error.absolute_path)),
            "message": error.message,
        }
        for error in sorted(
            validator.iter_errors(value), key=lambda item: list(item.absolute_path)
        )
    ]


def offline_schema_registry() -> Registry:
    """Resolve the existing SIR owner composition, never a network schema."""
    expansion = read_json(EXPANSION_SCHEMA_PATH)
    Draft202012Validator.check_schema(expansion)
    expansion_uri = expansion.get("$id")
    if not isinstance(expansion_uri, str) or not expansion_uri:
        raise ValueError("shared integration expansion schema has no canonical $id")
    return Registry(
        retrieve=lambda uri: (_ for _ in ()).throw(
            ValueError(f"unregistered schema URI: {uri}")
        )
    ).with_resource(expansion_uri, Resource.from_contents(expansion))


def definition_validator(
    schema: dict[str, Any], name: str, registry: Registry
) -> Draft202012Validator:
    if not isinstance(name, str) or not name or name not in schema["$defs"]:
        raise ValueError(f"unknown or malformed fixture definition: {name!r}")
    return Draft202012Validator(
        {**schema["$defs"][name], "$defs": schema["$defs"]},
        format_checker=FormatChecker(),
        registry=registry,
    )


def validate() -> dict[str, Any]:
    schema = read_json(SCHEMA_PATH)
    fixtures = read_json(FIXTURE_PATH)
    Draft202012Validator.check_schema(schema)
    registry = offline_schema_registry()
    validator = Draft202012Validator(
        schema, format_checker=FormatChecker(), registry=registry
    )

    failures: list[dict[str, Any]] = []
    for expected in ("valid", "invalid"):
        for fixture in fixtures[expected]:
            try:
                selected = (
                    definition_validator(schema, fixture["definition"], registry)
                    if "definition" in fixture else validator
                )
                errors = errors_for(selected, fixture["value"])
            except (KeyError, TypeError, ValueError, Unresolvable) as exc:
                # A broken selector or unresolved owner is a checker failure,
                # never evidence that a negative payload was correctly rejected.
                failures.append({
                    "fixture": fixture["name"],
                    "expected": "resolvable_fixture_schema",
                    "errors": [{"pointer": "$", "message": str(exc)}],
                })
                continue
            if bool(errors) == (expected == "valid"):
                failures.append({
                    "fixture": fixture["name"], "expected": expected, "errors": errors
                })

    # Existing browser producers must independently reject the protected class.
    cross_schema_checks = (
        (
            PLANS / "web_operation_contracts.schema.json",
            "BrowserSession",
            {
                "browser_session_id": "auth-browser-1",
                "session_class": "auth_browser",
                "session_security_class": "protected_auth",
                "session_epoch": 1,
                "state": "active",
                "show_when_possible": True,
                "open_watch_state": "unavailable",
                "created_at_utc": "2026-08-14T00:00:00Z",
                "redaction_profile_id": "redaction:protected-auth",
            },
        ),
        (
            PLANS / "runtime_artifact_browser_recording.schema.json",
            "BrowserRecordingPayload",
            {
                "browser_session_id": "auth-browser-1",
                "invocation": {"invocation_source": "nl_user"},
                "session_class": "auth_browser",
                "session_security_class": "protected_auth",
                "session_epoch": 1,
                "state": "active",
                "show_when_possible": True,
                "open_watch_state": "unavailable",
                "recording_ref": "recording:forbidden",
                "runtime_state": {
                    "runtime_state": "available",
                    "requested_runtime": "pm_native_browser",
                    "effective_runtime": "pm_native_browser",
                },
                "actions": [],
                "artifact_refs": [],
                "redaction_profile_id": "redaction:protected-auth",
            },
        ),
        (
            PLANS / "gui_automation_manifest.schema.json",
            "TestingBrowserManifest",
            {
                "browser_session_id": "auth-browser-1",
                "session_security_class": "protected_auth",
                "session_epoch": 1,
                "visibility_state": "visible",
                "open_watch_state": "open_available",
                "evidence_refs": ["artifact:forbidden"],
                "redaction_manifest_ref": "redaction:protected-auth",
            },
        ),
    )
    for path, definition_name, protected_value in cross_schema_checks:
        foreign_schema = read_json(path)
        Draft202012Validator.check_schema(foreign_schema)
        foreign_validator = definition_validator(foreign_schema, definition_name, registry)
        ordinary_value = {**protected_value, "session_security_class": "ordinary"}
        if "session_class" in ordinary_value:
            ordinary_value["session_class"] = "testing"
        ordinary_errors = errors_for(foreign_validator, ordinary_value)
        if ordinary_errors:
            failures.append({
                "fixture": f"{path.name}#{definition_name}",
                "expected": "ordinary_positive_control_valid",
                "errors": ordinary_errors,
            })
        # Isolate the security discriminator as well as the original protected
        # shape; an unrelated session_class error is not sufficient evidence.
        security_errors = errors_for(
            foreign_validator, {**ordinary_value, "session_security_class": "protected_auth"}
        )
        foreign_errors = errors_for(
            foreign_validator, protected_value
        )
        if not foreign_errors or not security_errors:
            failures.append(
                {
                    "fixture": f"{path.name}#{definition_name}",
                    "expected": "protected_auth_rejected",
                    "errors": [],
                }
            )

    return {
        "schema_id": "pm.protected_auth_browser_contract_validation.v1",
        "valid_fixture_count": len(fixtures["valid"]),
        "invalid_fixture_count": len(fixtures["invalid"]),
        "cross_schema_rejection_count": len(cross_schema_checks),
        "cross_schema_positive_control_count": len(cross_schema_checks),
        "failures": failures,
        "passed": not failures,
        "scope": "pre_build_static_contract_only",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", nargs="?", choices=("validate",), default="validate")
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    report = validate()
    rendered = json.dumps(report, indent=2, sort_keys=True) + "\n"
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(rendered, encoding="utf-8")
    print(rendered, end="")
    return 0 if report["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
