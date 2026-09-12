"""Cross-field Browser owner constraints; static validation only."""

import hashlib
import json
from decimal import Decimal, DecimalException
from urllib.parse import urljoin

from jsonschema import Draft202012Validator, FormatChecker, validators
from jsonschema.exceptions import SchemaError
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource, Unresolvable
from referencing.jsonschema import DRAFT202012


def _is_exact_integer(checker, value):
    if isinstance(value, Decimal):
        return value.is_finite() and value == value.to_integral_value()
    return Draft202012Validator.TYPE_CHECKER.is_type(value, "integer")


ExactJSONValidator = validators.extend(
    Draft202012Validator,
    type_checker=Draft202012Validator.TYPE_CHECKER.redefine("integer", _is_exact_integer),
)


class _SchemaResourceCollision(ValueError):
    pass


def _offline_registry():
    def unavailable(uri):
        raise NoSuchResource(ref=uri)

    return Registry(retrieve=unavailable)


def _strict_json(raw):
    """Decode exact UTF-8 bytes without ambiguous keys or non-JSON values."""
    if not isinstance(raw, bytes):
        raise ValueError("actual_utf8_bytes_required")

    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("duplicate_json_key")
            result[key] = value
        return result

    def reject_constant(_):
        raise ValueError("non_json_number")

    value = json.loads(raw.decode("utf-8"), object_pairs_hook=unique_object,
                       parse_float=Decimal, parse_constant=reject_constant)

    def scalar_strings(item):
        if isinstance(item, str):
            item.encode("utf-8")  # Escaped lone surrogates are not Unicode scalars.
        elif isinstance(item, dict):
            for key, child in item.items():
                key.encode("utf-8")
                scalar_strings(child)
        elif isinstance(item, list):
            for child in item:
                scalar_strings(child)

    scalar_strings(value)
    return value


def _definition_validator(owner_schema, definition, registry):
    # Do not combine a selected definition with the aggregate runtime oneOf.
    return ExactJSONValidator(
        {"$schema": owner_schema["$schema"], "$id": owner_schema["$id"],
         "$defs": owner_schema["$defs"], "$ref": f"#/$defs/{definition}"},
        registry=registry, format_checker=FormatChecker(),
    )


def validate_browser_program_result_bytes(
    result_utf8, *, program, resolved_schema_ref, result_schema_utf8,
    terminal_subject, terminal_workspace_revision, owner_schema, result_schema_resources=None,
):
    """Validate supplied static owner context plus the actual complete result bytes.

    The caller must resolve/authenticate the producing program, pinned schema and
    terminal subject/revision independently of the result. This pure validator
    cannot prove that custody, permissions, artifact resolution or native work.
    Never reserialize the result before passing its bytes: whitespace/escapes and
    all record fields count against the existing program max_output_bytes.
    """
    registry = _offline_registry()
    try:
        if not _definition_validator(owner_schema, "browser_program", registry).is_valid(program):
            return ["browser_result_producing_program_invalid"]
        if not _definition_validator(owner_schema, "ordinary_browser_subject", registry).is_valid(terminal_subject):
            return ["browser_result_terminal_subject_invalid"]
        if type(terminal_workspace_revision) is not int or terminal_workspace_revision < program["expected_workspace_revision"]:
            return ["browser_result_terminal_revision_invalid"]
    except (KeyError, TypeError, ValueError, SchemaError, Unresolvable, DecimalException, OverflowError, RecursionError):
        return ["browser_result_owner_context_invalid"]

    if not isinstance(result_utf8, bytes):
        return ["browser_result_actual_bytes_required"]
    if len(result_utf8) > program["budgets"]["max_output_bytes"]:
        return ["browser_result_output_budget_exceeded"]
    try:
        result = _strict_json(result_utf8)
    except (UnicodeError, ValueError, DecimalException, RecursionError):
        return ["browser_result_json_invalid"]
    try:
        if not _definition_validator(owner_schema, "browser_program_result", registry).is_valid(result):
            return ["browser_result_record_invalid"]
    except (KeyError, TypeError, ValueError, SchemaError, Unresolvable, DecimalException, OverflowError, RecursionError):
        return ["browser_result_record_invalid"]

    failures = []
    if result["program_id"] != program["program_id"]:
        failures.append("browser_result_program_mismatch")
    if result["lineage"] != program["lineage"]:
        failures.append("browser_result_lineage_mismatch")
    if result["program_workspace_id"] != program["program_workspace_id"]:
        failures.append("browser_result_workspace_mismatch")
    initial_subject = program["subject"]
    if any(terminal_subject[key] != initial_subject[key] for key in (
        "browser_session_id", "browser_workspace_id", "browser_page_id", "session_security_class",
    )) or terminal_subject["page_generation"] < initial_subject["page_generation"]:
        failures.append("browser_result_terminal_subject_mismatch")
    if result["subject"] != terminal_subject:
        failures.append("browser_result_subject_mismatch")
    if result["result_workspace_revision"] != terminal_workspace_revision:
        failures.append("browser_result_revision_mismatch")

    if resolved_schema_ref != program["result_schema_ref"]:
        failures.append("browser_result_schema_ref_mismatch")
        return failures
    if not isinstance(result_schema_utf8, bytes):
        failures.append("browser_result_schema_bytes_required")
        return failures
    if hashlib.sha256(result_schema_utf8).hexdigest() != program["result_schema_sha256"]:
        failures.append("browser_result_schema_hash_mismatch")
        return failures
    resources = {} if result_schema_resources is None else result_schema_resources
    if not isinstance(resources, dict):
        return failures + ["browser_result_schema_resources_invalid"]
    dependencies = program["result_schema_dependencies"]
    if set(resources) != set(dependencies):
        return failures + ["browser_result_schema_dependency_set_mismatch"]
    if resolved_schema_ref in resources:
        return failures + ["browser_result_schema_resource_collision"]
    for uri, raw in resources.items():
        if not isinstance(raw, bytes) or hashlib.sha256(raw).hexdigest() != dependencies[uri]:
            return failures + ["browser_result_schema_dependency_hash_mismatch"]
    try:
        parsed = {}
        for uri, raw in {resolved_schema_ref: result_schema_utf8, **resources}.items():
            schema = _strict_json(raw)
            if isinstance(schema, dict):
                if schema.get("$schema", "https://json-schema.org/draft/2020-12/schema") != "https://json-schema.org/draft/2020-12/schema":
                    return failures + ["browser_result_output_schema_invalid"]
                if "$id" in schema and schema["$id"] != uri:
                    return failures + ["browser_result_schema_identity_mismatch"]
            Draft202012Validator.check_schema(schema)
            # Bind the supplied resource URI as its resolution base if the exact
            # original bytes omit $id. This is not a rehash of normalized bytes.
            if isinstance(schema, dict) and "$id" not in schema:
                schema = {**schema, "$id": uri}
            parsed[uri] = Resource.from_contents(schema, default_specification=DRAFT202012)

        declared_uris = set(parsed)
        declared_anchors = set()
        references = []

        def collect(resource, base, *, root=False):
            identity = resource.id()
            if not root and identity:
                base = urljoin(base, identity)
                if base in declared_uris:
                    raise _SchemaResourceCollision()
                declared_uris.add(base)
            for anchor in resource.anchors():
                identity = (base, anchor.name)
                if identity in declared_anchors:
                    raise _SchemaResourceCollision()
                declared_anchors.add(identity)
            if isinstance(resource.contents, dict):
                dialect = resource.contents.get("$schema")
                if dialect is not None:
                    if dialect != "https://json-schema.org/draft/2020-12/schema":
                        raise ValueError("unsupported_output_schema_dialect")
                    # The bytes were pinned and their dialect checked above.
                    # Keep one 2020-12 resolver view so nested $schema does not
                    # switch jsonschema back to its binary-float type checker.
                    resource.contents.pop("$schema")
                for key in ("$ref", "$dynamicRef"):
                    if key in resource.contents:
                        references.append((base, resource.contents[key]))
            for child in resource.subresources():
                collect(child, base)

        try:
            for uri, resource in parsed.items():
                collect(resource, uri, root=True)
        except _SchemaResourceCollision:
            return failures + ["browser_result_schema_resource_collision"]
        registry = registry.with_resources(parsed.items()).crawl()
        # Check the complete retained closure, including references in branches
        # not taken by this particular result. Never invoke ambient retrieval.
        for base, reference in references:
            registry.resolver(base).lookup(reference)
        output_schema = parsed[resolved_schema_ref].contents
        output_validator = ExactJSONValidator(output_schema, registry=registry, format_checker=FormatChecker())
        if not output_validator.is_valid(result["compact_result"]):
            failures.append("browser_result_output_schema_mismatch")
    except Unresolvable:
        failures.append("browser_result_output_schema_unresolved")
    except (UnicodeError, ValueError, TypeError, SchemaError, DecimalException, OverflowError, RecursionError):
        failures.append("browser_result_output_schema_invalid")
    return failures


def browser_program_semantic_failures(definition, value, *, owner_schema=None):
    if not isinstance(value, dict):
        return []
    definition = value.get("record_kind", definition)
    if definition == "browser_program_result":
        return ["browser_result_binding_required"]
    if definition == "browser_program_result_validation":
        if owner_schema is None:
            return ["browser_result_owner_context_required"]
        try:
            return validate_browser_program_result_bytes(
                value["result_utf8"].encode("utf-8"), program=value["program"],
                resolved_schema_ref=value["resolved_schema_ref"],
                result_schema_utf8=value["result_schema_utf8"].encode("utf-8"),
                terminal_subject=value["terminal_subject"],
                terminal_workspace_revision=value["terminal_workspace_revision"],
                owner_schema=owner_schema,
                result_schema_resources={uri: raw.encode("utf-8") for uri, raw in value["result_schema_resources"].items()},
            )
        except (KeyError, AttributeError, UnicodeError):
            return ["browser_result_validation_input_invalid"]
    failures = []
    if definition == "representation_query_result":
        coverage = value.get("coverage", {})
        total, covered = coverage.get("frames_total"), coverage.get("frames_covered")
        if isinstance(total, int) and isinstance(covered, int) and covered > total:
            failures.append("representation_coverage_bounds")
        if coverage.get("status") == "complete" and (
            total != covered or coverage.get("omission_codes") or coverage.get("budget_exhausted")
            or coverage.get("synthetic_id_collisions")
        ):
            failures.append("representation_false_complete")
        if value.get("invalidated") != (coverage.get("status") == "stale_rejected"):
            failures.append("representation_invalidation_coverage_mismatch")
        generation = value.get("subject", {}).get("page_generation")
        if value.get("base_index_generation") != generation:
            failures.append("representation_base_generation_mismatch")
    return failures
