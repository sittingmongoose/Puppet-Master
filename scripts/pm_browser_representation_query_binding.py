"""Bounded command-to-typed-representation-query binding checks.

Static fixture/test companion for exactly the three Section 15 representation
commands (`cmd.browser.page.representation.capture`, `.delta`, `.query`).
The owner schema `Plans/section15_browser_program_contracts.schema.json`
requires each of their command requests to carry `scope_roots` and a typed
`selected_representation_query` binding (record schema identity, selected
query identity, SHA-256 of the authentic original query record bytes); the
cross-record relations of Section 15 line 876/878 and SMPFS-149 — exact
page/generation, mode, base, scope roots, detail classes, operators, budget,
continuation, and no continuation on an invalidated result — are checked here
against the actual selected `representation_query` original and, when
supplied, its `representation_query_result`.

Causal contract (V3): the only query record ever joined is the record decoded
from the explicit trusted `query_record_bytes` argument — the exact original
bytes the pinned `query_record_sha256` commits to. The helper accepts no
separate query object, so caller-copied query content cannot act as a second
witness that co-mutates around held original bytes (the V2 false accept).
A missing, empty or non-bytes original, and an original that does not parse
into a JSON object, fail closed; the digest is taken over the held bytes
themselves, never over a re-serialization of a caller object.

The caller supplies the authentic original query record bytes; nothing is
resolved, fetched, dispatched or admitted here, and no compiler, browser
owner, handler, EventRecord or runtime custody is proved. Every check is a
pure typed-relation comparison over the supplied bytes/records.
"""
import hashlib
import json
from functools import lru_cache
from pathlib import Path

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_REL = "Plans/section15_browser_program_contracts.schema.json"

REPRESENTATION_COMMANDS = frozenset((
    "cmd.browser.page.representation.capture",
    "cmd.browser.page.representation.delta",
    "cmd.browser.page.representation.query",
))


@lru_cache(maxsize=1)
def _schema():
    return json.loads((ROOT / SCHEMA_REL).read_text())


def canonical_record_bytes(record):
    """Exact bytes the pinned `query_record_sha256` binds; test-canonical form."""
    return json.dumps(record, ensure_ascii=False, separators=(",", ":"),
                      allow_nan=False).encode("utf-8")


def record_sha256(record):
    return hashlib.sha256(canonical_record_bytes(record)).hexdigest()


def structural_errors(definition, value):
    schema = _schema()
    body = schema["$defs"].get(definition, schema)
    validator = Draft202012Validator({**body, "$defs": schema["$defs"]})
    try:
        return [error.message for error in validator.iter_errors(value)]
    except (RecursionError, ValueError, TypeError):
        return ["browser_representation_invalid_shape"]


def _decode_original(query_record_bytes):
    """Decode the trusted original bytes; return (record, fail-closed error)."""
    if not isinstance(query_record_bytes, (bytes, bytearray)) or not query_record_bytes:
        return None, "representation_selected_query_original_missing"
    try:
        decoded = json.loads(query_record_bytes)
    except (UnicodeDecodeError, ValueError):
        return None, "representation_selected_query_original_unparseable"
    if not isinstance(decoded, dict):
        return None, "representation_selected_query_original_unparseable"
    return decoded, None


def _subject_of(scope):
    return {key: scope[key] for key in (
        "browser_session_id", "browser_workspace_id", "browser_page_id",
        "page_generation", "session_security_class") if key in scope}


def binding_failures(scope, query_record_bytes):
    """Join a representation command scope to its selected typed query record.

    `query_record_bytes` must be the exact authentic original bytes of the
    `representation_query` record the command selected — the bytes the pinned
    `query_record_sha256` commits to. The record joined into every check is
    decoded from those bytes; no separately supplied query object exists that
    could co-mutate around the held original. Missing or unparseable originals
    fail closed.
    """
    if structural_errors("browser_command_scope", scope):
        return ["representation_command_scope_invalid"]
    if scope["command_id"] not in REPRESENTATION_COMMANDS:
        return []
    binding = scope.get("selected_representation_query")
    if structural_errors("browser_representation_query_binding", binding):
        return ["representation_selected_query_binding_invalid"]
    query, fail_closed = _decode_original(query_record_bytes)
    if fail_closed:
        return [fail_closed]
    if structural_errors("representation_query", query):
        return ["representation_selected_query_record_invalid"]
    errors = []
    if hashlib.sha256(query_record_bytes).hexdigest() != binding["query_record_sha256"]:
        errors.append("representation_selected_query_digest_mismatch")
    if query["query_id"] != binding["query_id"]:
        errors.append("representation_selected_query_identity_mismatch")
    if query["subject"] != _subject_of(scope):
        errors.append("representation_selected_query_subject_mismatch")
    scope_mode = scope.get("representation_mode")
    query_mode = query["representation_mode"]
    if scope_mode is not None and scope_mode != query_mode:
        errors.append("representation_selected_query_mode_mismatch")
    scope_base = scope.get("base_representation_id")
    query_base = query.get("base_representation_id")
    if query_mode == "delta" or scope_mode == "delta":
        if scope_base is None or query_base is None or scope_base != query_base:
            errors.append("representation_selected_query_base_mismatch")
    elif scope_base is not None and scope_base != query_base:
        errors.append("representation_selected_query_base_mismatch")
    if "detail_classes" in scope and scope["detail_classes"] != query["detail_classes"]:
        errors.append("representation_selected_query_detail_mismatch")
    if "query_operators" in scope and scope["query_operators"] != query["operators"]:
        errors.append("representation_selected_query_operators_mismatch")
    if "representation_budget" in scope and scope["representation_budget"] != query["budget"]:
        errors.append("representation_selected_query_budget_mismatch")
    if scope["scope_roots"] != query["scope_roots"]:
        errors.append("representation_selected_query_scope_roots_mismatch")
    if scope.get("continuation") != query.get("continuation"):
        errors.append("representation_selected_query_continuation_mismatch")
    return sorted(set(errors))


def result_binding_failures(scope, result, *, query_record_bytes=None):
    """Join the command's typed `representation_query_result` to the binding.

    The query side of every result join is the record decoded from the held
    original bytes. Stale/invalidated results are rejected as current and must
    not carry a continuation (Section 15 line 878, SMPFS-149).
    """
    errors = binding_failures(scope, query_record_bytes)
    if errors:
        return errors
    query = _decode_original(query_record_bytes)[0]
    if structural_errors("representation_query_result", result):
        return ["representation_result_record_invalid"]
    errors = []
    if result["query_id"] != query["query_id"]:
        errors.append("representation_result_query_mismatch")
    if result["subject"] != query["subject"]:
        errors.append("representation_result_subject_mismatch")
    if result["base_index_generation"] != result["subject"]["page_generation"]:
        errors.append("representation_result_base_generation_mismatch")
    if scope.get("representation_id") is not None and \
            result["representation_id"] != scope["representation_id"]:
        errors.append("representation_result_representation_mismatch")
    stale = result["invalidated"] or result["coverage"]["status"] == "stale_rejected"
    if stale and "continuation" in result:
        errors.append("representation_stale_result_has_continuation")
    return sorted(set(errors))
