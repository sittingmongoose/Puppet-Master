"""Static source coverage only: no probes, permission decisions or health authority."""
from __future__ import annotations

import argparse
from functools import lru_cache
import json
from pathlib import Path
import re

from jsonschema import Draft202012Validator


LOCAL_REF = re.compile(r"^Plans/[A-Za-z0-9_.-]+(?:#[A-Za-z0-9_./$~-]+)?$")
EXPECTED_IDS = [f"sep03-doctor-{n:03d}" for n in range(1, 53)]
DESCRIPTOR_REF = "Plans/doctor_query_controller_contract_fixtures.json#/valid/0/value/members/0/descriptor"
REQUEST_REF = "Plans/doctor_query_controller_contracts.schema.json#/$defs/backup_repository_read_request"
RESULT_REF = "Plans/backup_restore_system_contracts.schema.json#/$defs/backup_repository_binding"
DESCRIPTOR_REQUEST = "https://puppetmaster.local/schemas/doctor-query-controller/1.0.0/doctor_query_controller_contracts.schema.json#backup_repository_read_request"
DESCRIPTOR_RESULT = "https://puppetmaster.local/schemas/doctor-query-controller/1.0.0/doctor_query_controller_contracts.schema.json#backup_repository_binding_result"


def resolve_local_ref(repo_root, reference):
    """Resolve actual local canon only. Never fetch external schemas or execute tools."""
    if not isinstance(reference, str) or not LOCAL_REF.fullmatch(reference):
        raise ValueError("not a canonical local reference")
    filename, _, fragment = reference.partition("#")
    root = Path(repo_root).resolve()
    path = (root / filename).resolve()
    if not path.is_relative_to(root):
        raise ValueError("reference escapes repository")
    text = path.read_text()
    if filename.endswith(".md"):
        if fragment and not re.search(r"(?<![A-Za-z0-9_-])" + re.escape(fragment) + r"(?![A-Za-z0-9_-])", text):
            raise ValueError("owner fragment absent")
        return text
    value = json.loads(text)
    if fragment:
        if not fragment.startswith("/"):
            raise ValueError("JSON reference requires exact pointer")
        for token in fragment[1:].split("/"):
            token = token.replace("~1", "/").replace("~0", "~")
            value = value[int(token)] if isinstance(value, list) else value[token]
    return value


@lru_cache(maxsize=1)
def _checked_validator(schema_bytes):
    schema = json.loads(schema_bytes)
    Draft202012Validator.check_schema(schema)
    return Draft202012Validator(schema)


def validate_coverage(catalog, *, repo_root, schema):
    """Return failures for the finite static catalog, never runtime check outcomes."""
    errors = []
    try:
        validator = _checked_validator(json.dumps(schema, sort_keys=True))
        shape = list(validator.iter_errors(catalog))
    except Exception as exc:
        return [f"catalog_schema_unavailable:{type(exc).__name__}"]
    if shape:
        return ["catalog_shape:" + "/".join(map(str, e.absolute_path)) for e in shape]
    rows = catalog["occurrences"]
    if [r["occurrence_id"] for r in rows] != EXPECTED_IDS:
        errors.append("occurrence_identity_or_order")
    if len({r["source_pointer"] for r in rows}) != 52:
        errors.append("source_pointer_reused")
    if len({r["source_label"] for r in rows}) != 51:
        errors.append("source_label_census")
    updates = [r for r in rows if r["source_label"] == "app_update"]
    if [r["occurrence_id"] for r in updates] != ["sep03-doctor-008", "sep03-doctor-043"]:
        errors.append("application_update_occurrence_identity")
    if any(r["shared_fact_key"] != "application_update" for r in updates):
        errors.append("application_update_duplicate_fact")

    def resolve(reference, category):
        try:
            return resolve_local_ref(repo_root, reference)
        except (OSError, ValueError, KeyError, IndexError, TypeError):
            errors.append(category + ":" + reference)
            return None

    for row in rows:
        for reference in row["owner_refs"]:
            if not reference.partition("#")[0].endswith(".md"):
                errors.append("owner_not_document:" + reference)
            resolve(reference, "owner_unresolved")
        for reference in row["schema_refs"]:
            if ".schema.json#/$defs/" not in reference:
                errors.append("not_exact_schema_definition:" + reference)
            value = resolve(reference, "schema_unresolved")
            if value is not None and not isinstance(value, dict):
                errors.append("schema_not_object:" + reference)
        for check_id in row["declared_descriptor_ids"]:
            owner = resolve("Plans/newtools.md#N2-154", "descriptor_owner_unresolved")
            if owner is not None and check_id not in owner:
                errors.append("descriptor_not_declared:" + check_id)
        leaf = row["bounded_leaf"]
        if leaf is None:
            continue
        # One already-authored fixture demonstrates this bounded leaf. It is
        # metadata evidence only, never full source-dimension or active-registry proof.
        if (leaf["descriptor_ref"], leaf["request_schema_ref"], leaf["result_schema_ref"]) != (
                DESCRIPTOR_REF, REQUEST_REF, RESULT_REF):
            errors.append("bounded_leaf_route_changed")
            continue
        descriptor = resolve(leaf["descriptor_ref"], "descriptor_unresolved")
        request = resolve(REQUEST_REF, "leaf_request_unresolved")
        result = resolve(RESULT_REF, "leaf_result_unresolved")
        if descriptor is not None and (
            descriptor.get("schema_id") != "pm.doctor.check_descriptor.v1"
            or descriptor.get("check_id") != leaf["check_id"]
            or descriptor.get("owner_doc_ref") != "Plans/Backup_Restore_System.md#BRS-004"
            or descriptor.get("side_effect_policy") != "read_only"
            or descriptor.get("request_schema_ref") != DESCRIPTOR_REQUEST
            or descriptor.get("result_schema_ref") != DESCRIPTOR_RESULT
        ):
            errors.append("bounded_leaf_descriptor_mismatch")
        if request is not None and not isinstance(request, dict):
            errors.append("leaf_request_not_schema")
        if result is not None and not isinstance(result, dict):
            errors.append("leaf_result_not_schema")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, required=True)
    parser.add_argument("--catalog", type=Path, required=True)
    parser.add_argument("--schema", type=Path, required=True)
    args = parser.parse_args()
    failures = validate_coverage(json.loads(args.catalog.read_text()),
        repo_root=args.repo_root, schema=json.loads(args.schema.read_text()))
    print(json.dumps({"status": "FAIL" if failures else "PASS", "failures": failures,
        "evidence": "static_source_coverage_only", "runtime_authority": "none",
        "full_dimension_leaf_bindings": "incomplete"}, indent=2))
    return bool(failures)


if __name__ == "__main__":
    raise SystemExit(main())
