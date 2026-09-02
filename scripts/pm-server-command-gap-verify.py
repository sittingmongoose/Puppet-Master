#!/usr/bin/env python3
"""Fail-closed verifier for the canonical 171-row server command adjudication."""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


def repository_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if (candidate / "Plans" / "00-plans-index.md").is_file():
            return candidate
    raise RuntimeError(f"cannot locate PuppetMaster repository root from {start}")


ROOT = repository_root(Path(__file__).resolve().parent)
REGISTRY_PATH = ROOT / "Plans" / "server_command_gap_adjudication.json"
SCHEMA_PATH = ROOT / "Plans" / "server_command_gap_adjudication.schema.json"
MATERIALIZED_SCHEMA_PATHS = (
    ROOT / "Plans" / "protected_auth_browser_contracts.schema.json",
    ROOT / "Plans" / "shared_integration_runtime.schema.json",
    ROOT / "Plans" / "shared_integration_runtime_expansion_contracts.schema.json",
    ROOT / "Plans" / "shared_runtime_command_contracts.schema.json",
    ROOT / "Plans" / "remote_access_system_contracts.schema.json",
)

# Content-addressed identity of the accepted canonical registry bytes.
EXPECTED_CANONICAL_REGISTRY_SHA256 = "d45da4082814b15fc92e6d7b074e6e10f429e1e3e090c4969a778564fac74fcd"
EXPECTED_GAP_REGISTER_SHA256 = "e2b7436ae822004909b73be65078556e2a61a5827dc2ffe2e7e404d68df2c1af"
EXPECTED_PACKET_CENSUS_SHA256 = "f9be848f2cb80eaf5e05df338392279b454e5c23d4b7fc4be6ed32326c87064b"
EXPECTED_PARTITION = {
    "new_canonical_required": 86,
    "approved_alias_to_exact": 43,
    "typed_local_ui_action": 39,
    "rejected_with_reason": 3,
}
EXPECTED_FINDINGS = [
    "command_absent_from_ui_command_catalog",
    "command_absent_from_commands_system",
    "command_absent_from_typed_contract_schema",
    "command_absent_from_production_wiring",
    "command_absent_from_touch_closure",
    "native_application_and_handler_evidence_absent",
]
PLAN_UNIT_RE = re.compile(r"(?m)^\s*plan_unit_id:\s*[A-Za-z][A-Za-z0-9_-]*\s*$")
CONCRETE_SCHEMA_REF_RE = re.compile(
    r"^(Plans/[A-Za-z0-9_.-]+\.schema\.json)#/\$defs/"
    r"([A-Za-z0-9_]+)(?:\|([A-Za-z0-9_]+))?(?: \(([^()]*)\))?$"
)
COMMAND_RE = re.compile(r"^cmd(?:\.[a-z][a-z0-9_]*){2,}$")
LOCAL_RE = re.compile(r"^ui(?:\.[a-z][a-z0-9_]*){2,}$")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def aggregate(rows: list[dict[str, Any]], key: str) -> dict[str, dict[str, int]]:
    buckets: dict[str, Counter[str]] = defaultdict(Counter)
    for row in rows:
        buckets[row[key]][row["disposition"]] += 1
    return {name: dict(sorted(counts.items())) for name, counts in sorted(buckets.items())}


def schema_errors(schema: dict[str, Any], document: Any) -> list[str]:
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors = []
    for error in sorted(validator.iter_errors(document), key=lambda item: list(item.absolute_path)):
        location = "/".join(str(part) for part in error.absolute_path) or "<root>"
        errors.append(f"schema:{location}: {error.message}")
    return errors


def validate(
    document: dict[str, Any],
    schema: dict[str, Any],
    *,
    enforce_canonical_hash: bool,
    validate_document_schema: bool = True,
    validate_external_schemas: bool = True,
) -> tuple[list[str], dict[str, list[str]]]:
    failures = schema_errors(schema, document) if validate_document_schema else []
    reports: dict[str, list[str]] = {
        "unresolved_local_action_schema_refs": [],
        "unresolved_other_proposed_schema_refs": [],
        "resolved_schema_refs": [],
    }
    if enforce_canonical_hash:
        actual_hash = sha256(REGISTRY_PATH)
        if actual_hash != EXPECTED_CANONICAL_REGISTRY_SHA256:
            failures.append(
                "canonical_registry_sha256: expected "
                f"{EXPECTED_CANONICAL_REGISTRY_SHA256}, found {actual_hash}"
            )

    rows = document.get("rows")
    if not isinstance(rows, list):
        return failures, reports

    indices = [row.get("row_index") for row in rows if isinstance(row, dict)]
    tokens = [row.get("token") for row in rows if isinstance(row, dict)]
    case_refs = [row.get("case_ref") for row in rows if isinstance(row, dict)]
    if indices != list(range(1, 172)):
        failures.append("row_index_sequence: rows must be ordered exactly 1..171")
    for label, values in (("row_index", indices), ("token", tokens), ("case_ref", case_refs)):
        duplicates = sorted(value for value, count in Counter(values).items() if count > 1)
        if duplicates:
            failures.append(f"unique_{label}: duplicates {duplicates}")

    partition = Counter(row.get("disposition") for row in rows if isinstance(row, dict))
    if dict(partition) != EXPECTED_PARTITION:
        failures.append(f"disposition_partition: expected {EXPECTED_PARTITION}, found {dict(partition)}")
    if document.get("counts", {}).get("dispositions") != EXPECTED_PARTITION:
        failures.append("counts.dispositions does not equal the exact canonical partition")
    for field, summary in (
        ("packet_group", "by_packet_group"),
        ("semantic_family", "by_semantic_family"),
        ("canonical_owner", "by_owner"),
    ):
        calculated = aggregate(rows, field)
        if document.get(summary) != calculated:
            failures.append(f"{summary}: does not exactly match rows")

    source = document.get("source", {})
    if source.get("gap_register_sha256") != EXPECTED_GAP_REGISTER_SHA256:
        failures.append("source.gap_register_sha256: wrong custody hash")
    if source.get("packet_command_census_sha256") != EXPECTED_PACKET_CENSUS_SHA256:
        failures.append("source.packet_command_census_sha256: wrong packet hash")
    if source.get("packet_source_rows_verified") != 171:
        failures.append("source.packet_source_rows_verified: expected 171")

    alias_handlers: dict[str, set[str]] = defaultdict(set)
    alias_clusters: dict[str, list[str]] = defaultdict(list)
    local_clusters: dict[str, list[str]] = defaultdict(list)
    seen_source_lines: set[int] = set()
    owner_schema_cache: dict[Path, dict[str, Any]] = {}
    checked_definition_pairs: set[tuple[Path, str, str]] = set()
    plans_index = (ROOT / "Plans" / "00-plans-index.md").read_text(encoding="utf-8")

    for row in rows:
        if not isinstance(row, dict):
            continue
        number = row.get("row_index", "?")
        token = row.get("token")
        disposition = row.get("disposition")
        prefix = f"row[{number}] {token}"
        if row.get("case_ref") != f"server_command_candidates/{token}":
            failures.append(f"{prefix}: case_ref must be derived exactly from token")
        verification = row.get("packet_source_verification", {})
        line = verification.get("line")
        logical_path = verification.get("logical_path")
        if line in seen_source_lines:
            failures.append(f"{prefix}: duplicate packet source line {line}")
        seen_source_lines.add(line)
        if row.get("packet_source_ref") != f"{logical_path}:{line}":
            failures.append(f"{prefix}: packet_source_ref does not match verified logical_path:line")
        if verification.get("line_text") != f'"command_id": "{token}",':
            failures.append(f"{prefix}: verified line_text does not exactly name token")
        if verification.get("source_sha256") != EXPECTED_PACKET_CENSUS_SHA256:
            failures.append(f"{prefix}: verified packet source hash is not canonical")
        if verification.get("verified") is not True:
            failures.append(f"{prefix}: source line is not explicitly verified")
        if row.get("source_gap_findings") != EXPECTED_FINDINGS:
            failures.append(f"{prefix}: frozen source_gap_findings changed")

        owner = row.get("canonical_owner")
        owner_path = ROOT / owner if isinstance(owner, str) else ROOT / "__invalid_owner__"
        if not owner_path.is_file():
            failures.append(f"{prefix}: canonical owner path does not exist: {owner}")
        else:
            owner_text = owner_path.read_text(encoding="utf-8")
            if not PLAN_UNIT_RE.search(owner_text):
                failures.append(f"{prefix}: canonical owner has no PlanUnit id: {owner}")
            if owner not in plans_index:
                failures.append(f"{prefix}: canonical owner is absent from Plans index: {owner}")

        target = row.get("proposed_exact_target")
        handler = row.get("proposed_sole_handler")
        if disposition == "approved_alias_to_exact":
            if not COMMAND_RE.fullmatch(str(target)) or target == token:
                failures.append(f"{prefix}: alias must normalize to a different exact cmd.* target")
            if row.get("alias_registration") is not False or not row.get("normalization_rule"):
                failures.append(f"{prefix}: alias must be compatibility-only with an explicit normalization rule")
            alias_handlers[str(target)].add(str(handler))
            alias_clusters[str(target)].append(str(token))
        elif disposition == "new_canonical_required":
            if target != token:
                failures.append(f"{prefix}: new canonical target must equal the candidate token")
            if row.get("alias_registration") is not None or row.get("normalization_rule") is not None:
                failures.append(f"{prefix}: a new canonical command cannot register an alias")
        elif disposition == "typed_local_ui_action":
            if not LOCAL_RE.fullmatch(str(target)):
                failures.append(f"{prefix}: typed local action must target ui.*")
            if handler != "owner-local typed UI controller; no semantic-domain handler":
                failures.append(f"{prefix}: typed local action must not name a domain handler")
            if isinstance(handler, str) and "handlers::" in handler:
                failures.append(f"{prefix}: typed local action contains a forbidden domain handler")
            local_clusters[str(target)].append(str(token))
        elif disposition == "rejected_with_reason":
            if handler != "none" or row.get("alias_registration") is not None or row.get("normalization_rule") is not None:
                failures.append(f"{prefix}: rejected row must create no action, alias, or handler")
            if row.get("proposed_schema") != "none; use the exact replacement owner schema named in proposed_exact_target":
                failures.append(f"{prefix}: rejected row must not claim an action schema")

        proposed = row.get("proposed_schema")
        if disposition == "rejected_with_reason":
            continue
        match = CONCRETE_SCHEMA_REF_RE.fullmatch(str(proposed))
        if not match:
            failures.append(f"{prefix}: malformed concrete proposed_schema reference: {proposed!r}")
            continue
        relative_path, first_def, second_def, annotation = match.groups()
        schema_path = ROOT / relative_path
        if not schema_path.is_file():
            failures.append(f"{prefix}: proposed schema path does not exist: {relative_path}")
            continue
        try:
            if schema_path not in owner_schema_cache:
                owner_schema_cache[schema_path] = load_json(schema_path)
                if validate_external_schemas:
                    Draft202012Validator.check_schema(owner_schema_cache[schema_path])
            target_schema = owner_schema_cache[schema_path]
        except Exception as exc:  # noqa: BLE001 - report malformed owner schemas cleanly
            failures.append(f"{prefix}: proposed schema file is not valid Draft 2020-12: {exc}")
            continue
        definitions = target_schema.get("$defs", {})
        names = [first_def] + ([second_def] if second_def else [])
        present = [name in definitions for name in names]
        ref_label = f"{relative_path}#/$defs/" + "|".join(names)
        if all(present):
            # Both named definitions are materialized and must independently be schemas.
            try:
                pair = (schema_path, first_def, second_def or "")
                if validate_external_schemas and pair not in checked_definition_pairs:
                    Draft202012Validator.check_schema(definitions[first_def])
                    if second_def:
                        Draft202012Validator.check_schema(definitions[second_def])
                    checked_definition_pairs.add(pair)
            except Exception as exc:  # noqa: BLE001
                failures.append(f"{prefix}: materialized proposed definition is invalid: {exc}")
            reports["resolved_schema_refs"].append(f"{token}: {ref_label}")
        elif any(present):
            failures.append(f"{prefix}: partially materialized proposed schema ref is not resolvable: {ref_label}")
        else:
            detail = f"{token}: {ref_label}" + (f" ({annotation})" if annotation else "")
            report_key = (
                "unresolved_local_action_schema_refs"
                if disposition == "typed_local_ui_action"
                else "unresolved_other_proposed_schema_refs"
            )
            reports[report_key].append(detail)

    for target, handlers in sorted(alias_handlers.items()):
        if len(handlers) != 1:
            failures.append(f"alias target {target}: peer alias handlers found {sorted(handlers)}")
    expected_alias_clusters = {key: value for key, value in sorted(alias_clusters.items())}
    expected_local_clusters = {key: value for key, value in sorted(local_clusters.items())}
    analysis = document.get("duplicate_and_semantic_family_analysis", {})
    if analysis.get("alias_target_clusters") != expected_alias_clusters:
        failures.append("duplicate analysis alias_target_clusters does not exactly match alias rows")
    if analysis.get("local_action_target_clusters") != expected_local_clusters:
        failures.append("duplicate analysis local_action_target_clusters does not exactly match local rows")
    if analysis.get("semantic_alias_target_count") != len(expected_alias_clusters):
        failures.append("duplicate analysis semantic_alias_target_count is stale")
    for report_key in (
        "unresolved_local_action_schema_refs",
        "unresolved_other_proposed_schema_refs",
    ):
        unresolved = reports[report_key]
        if unresolved:
            failures.append(f"{report_key}: expected zero, found {len(unresolved)}")
    return failures, reports


def self_test(document: dict[str, Any], schema: dict[str, Any]) -> tuple[int, list[str]]:
    cases: list[tuple[str, Any, str]] = []

    def mutation(name: str, edit: Any, expected: str) -> None:
        candidate = copy.deepcopy(document)
        edit(candidate)
        cases.append((name, candidate, expected))

    mutation("extra_property", lambda d: d["rows"][0].__setitem__("peer_handler", "bad"), "schema:")
    mutation("duplicate_index", lambda d: d["rows"][1].__setitem__("row_index", 1), "row_index_sequence")
    mutation("bad_partition", lambda d: d["rows"][0].__setitem__("disposition", "new_canonical_required"), "disposition_partition")
    mutation("wrong_source_line", lambda d: d["rows"][0]["packet_source_verification"].__setitem__("line_text", '"command_id": "cmd.wrong.token",'), "verified line_text")
    mutation("peer_alias_handler", lambda d: d["rows"][10].__setitem__("proposed_sole_handler", "handlers::peer::start"), "peer alias handlers")
    mutation("domain_local_handler", lambda d: d["rows"][0].__setitem__("proposed_sole_handler", "handlers::auth_profile::open_details"), "must not name a domain handler")
    mutation("reject_action", lambda d: d["rows"][41].__setitem__("proposed_sole_handler", "handlers::doctor::cancel"), "must create no action")
    mutation("missing_owner", lambda d: d["rows"][0].__setitem__("canonical_owner", "Plans/Does_Not_Exist.md"), "canonical owner path does not exist")
    mutation("malformed_ref", lambda d: d["rows"][0].__setitem__("proposed_schema", "Plans/x.schema.json#not-a-pointer"), "malformed concrete proposed_schema")
    mutation(
        "unresolved_local_ref",
        lambda d: d["rows"][0].__setitem__(
            "proposed_schema",
            "Plans/protected_auth_browser_contracts.schema.json#/$defs/MissingLocalRequest|MissingLocalResult",
        ),
        "unresolved_local_action_schema_refs: expected zero",
    )
    mutation(
        "unresolved_other_ref",
        lambda d: d["rows"][32].__setitem__(
            "proposed_schema",
            "Plans/shared_integration_runtime.schema.json#/$defs/MissingCommandRequest|MissingCommandResult",
        ),
        "unresolved_other_proposed_schema_refs: expected zero",
    )

    failures: list[str] = []
    for name, candidate, expected_fragment in cases:
        observed, _ = validate(
            candidate,
            schema,
            enforce_canonical_hash=False,
            validate_document_schema=(name == "extra_property"),
            validate_external_schemas=False,
        )
        if not any(expected_fragment in item for item in observed):
            failures.append(f"self-test {name}: expected failure containing {expected_fragment!r}")
    return len(cases), failures


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--skip-self-test", action="store_true", help="validate canonical files only")
    parser.add_argument("--json", action="store_true", help="emit one machine-readable JSON report")
    args = parser.parse_args()
    try:
        schema = load_json(SCHEMA_PATH)
        Draft202012Validator.check_schema(schema)
        document = load_json(REGISTRY_PATH)
    except Exception as exc:  # noqa: BLE001
        if args.json:
            print(json.dumps({
                "check": "server-command-gap-adjudication",
                "status": "fail",
                "failures": [f"load/schema: {exc}"],
            }, indent=2, sort_keys=True))
        else:
            print(f"FAIL load/schema: {exc}")
        return 1

    failures, reports = validate(document, schema, enforce_canonical_hash=True)
    test_count = 0
    if not args.skip_self_test:
        test_count, test_failures = self_test(document, schema)
        failures.extend(test_failures)

    rejected_rows = sum(
        1 for row in document.get("rows", [])
        if isinstance(row, dict) and row.get("disposition") == "rejected_with_reason"
    )
    unresolved_local = len(reports["unresolved_local_action_schema_refs"])
    unresolved_other = len(reports["unresolved_other_proposed_schema_refs"])
    resolved_schema_refs = len(reports["resolved_schema_refs"])
    resolved_adjudication_rows = resolved_schema_refs + rejected_rows
    hash_report = {
        "registry": sha256(REGISTRY_PATH),
        "registry_schema": sha256(SCHEMA_PATH),
        "source_gap_register": EXPECTED_GAP_REGISTER_SHA256,
        "source_packet_census": EXPECTED_PACKET_CENSUS_SHA256,
        "materialized_schemas": {
            str(path.relative_to(ROOT)): sha256(path)
            for path in MATERIALIZED_SCHEMA_PATHS
        },
    }
    report = {
        "check": "server-command-gap-adjudication",
        "status": "fail" if failures else "pass",
        "counts": {
            "rows": len(document.get("rows", [])),
            "schema_bearing_rows_resolved": resolved_schema_refs,
            "rejected_rows_resolved": rejected_rows,
            "adjudication_rows_resolved": resolved_adjudication_rows,
            "unresolved_local_action_schema_refs": unresolved_local,
            "unresolved_other_proposed_schema_refs": unresolved_other,
            "negative_self_tests": test_count,
        },
        "hashes": hash_report,
        "partition": EXPECTED_PARTITION,
        "reports": reports,
        "failures": failures,
    }

    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
        return 1 if failures else 0

    if failures:
        print(f"FAIL server command gap adjudication ({len(failures)} failure(s))")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("PASS server command gap adjudication")
    print(f"registry_sha256={sha256(REGISTRY_PATH)}")
    print(f"schema_sha256={sha256(SCHEMA_PATH)}")
    print("rows=171 partition=new_canonical_required:86,approved_alias_to_exact:43,typed_local_ui_action:39,rejected_with_reason:3")
    print(f"source_gap_register_sha256={EXPECTED_GAP_REGISTER_SHA256}")
    print(f"source_packet_census_sha256={EXPECTED_PACKET_CENSUS_SHA256}")
    print(f"resolved_schema_refs={resolved_schema_refs}")
    print(f"rejected_rows_resolved={rejected_rows}")
    print(f"adjudication_rows_resolved={resolved_adjudication_rows}")
    print(f"unresolved_local_action_schema_refs={unresolved_local}")
    for item in reports["unresolved_local_action_schema_refs"]:
        print(f"  LOCAL-PROPOSED {item}")
    print(f"unresolved_other_proposed_schema_refs={unresolved_other}")
    for path, digest in hash_report["materialized_schemas"].items():
        print(f"materialized_schema_sha256[{path}]={digest}")
    if not args.skip_self_test:
        print(f"negative_self_tests={test_count}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
