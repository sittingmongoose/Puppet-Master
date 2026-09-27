#!/usr/bin/env python3
"""Fail-closed static validator for the Git adapter command family.

Validates Plans/git_adapter_command_contract_fixtures.json positive fixtures
against Plans/git_adapter_command_contracts.schema.json, proves every encoded
negative fixture is rejected at its declared layer (schema or semantic),
enforces relational currentness/substitution invariants JSON Schema cannot
express, and pins per-command positive/negative coverage for the seven
SCS-024 commands.

Static schema/fixture evidence only: this validator never executes runtime
behavior and never certifies native handlers, central catalog rows,
production wiring, Event Authority admission, or readiness.
"""

from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "Plans" / "git_adapter_command_contracts.schema.json"
FIXTURES_PATH = ROOT / "Plans" / "git_adapter_command_contract_fixtures.json"
NEUTRAL_SCHEMA_PATH = ROOT / "Plans" / "source_control_contracts.schema.json"

EXPECTED_FIXTURE_SCHEMA_ID = "pm.git_adapter.contract_fixtures.v1"
EXPECTED_OWNER_SCHEMA = "Plans/git_adapter_command_contracts.schema.json"
EXPECTED_OWNER_UNIT = "SCS-024"

COMMANDS = (
    "cmd.git.stage",
    "cmd.git.unstage",
    "cmd.source_control.remote.update",
    "cmd.source_control.stash.create",
    "cmd.source_control.stash.apply",
    "cmd.source_control.branch.create",
    "cmd.source_control.branch.delete",
)

PERMISSION_CLASS_FOR_COMMAND = {
    "cmd.git.stage": "git.stage",
    "cmd.git.unstage": "git.unstage",
    "cmd.source_control.remote.update": "source_control.remote.update",
    "cmd.source_control.stash.create": "source_control.stash.create",
    "cmd.source_control.stash.apply": "source_control.stash.apply",
    "cmd.source_control.branch.create": "source_control.branch.create",
    "cmd.source_control.branch.delete": "source_control.branch.delete",
}

HEX40_RE = re.compile(r"^[0-9a-f]{40}$")
HEX64_RE = re.compile(r"^[0-9a-f]{64}$")
HEX64_ANY = re.compile(r"^[0-9a-fA-F]{64}$")

# Fail-closed fixture inventory: a validator that accepts an emptied or
# shuffled negative corpus proves nothing. These pins make coverage loss a
# validation failure.
EXPECTED_NEGATIVE_IDS = {
    "neg_stage_absolute_path",
    "neg_stage_traversal_path",
    "neg_stage_hunk_payload_rejected",
    "neg_stage_missing_untracked_flag",
    "neg_unstage_forbids_untracked_flag",
    "neg_unstage_wrong_backend",
    "neg_remote_fetch_url_with_userinfo",
    "neg_remote_push_url_with_credentials",
    "neg_remote_missing_push_urls",
    "neg_stash_create_message_too_long",
    "neg_stash_apply_missing_preview",
    "neg_branch_create_invalid_ref",
    "neg_branch_delete_missing_confirmation",
    "neg_branch_delete_confirmation_false",
    "neg_git_stash_spelling_not_primary",
    "neg_git_branch_spelling_not_primary",
    "neg_accepted_result_carries_receipt",
    "neg_succeeded_result_claims_unknown_effect",
    "neg_unknown_error_allows_retry",
    "neg_identity_substitution_missing_repo",
    "neg_stage_untracked_without_admission",
    "neg_stage_declared_untracked_outside_paths",
    "neg_remote_update_stale_config_generation",
    "neg_permission_class_command_mismatch",
    "neg_receipt_index_generation_regresses",
    "neg_stage_path_with_control_byte",
    "neg_stage_path_with_trailing_space",
}

EXPECTED_JOIN_VERDICTS = {
    "join_stash_apply_admitted": "admitted",
    "join_branch_delete_admitted": "admitted",
    "join_stash_apply_stale_fence": "stale",
    "join_stash_apply_wrong_target": "substitution",
    "join_branch_delete_expired": "expired",
    "join_branch_delete_guarded_protected": "guarded",
    "join_branch_delete_wrong_branch": "substitution",
}

PREVIEW_DEFINITION_FOR_COMMAND = {
    "cmd.source_control.stash.apply": "stash_apply_preview",
    "cmd.source_control.branch.delete": "branch_delete_preview",
}

EXPECTED_SEMANTIC_NEGATIVES = {
    "neg_stage_untracked_without_admission",
    "neg_stage_declared_untracked_outside_paths",
    "neg_remote_update_stale_config_generation",
    "neg_permission_class_command_mismatch",
    "neg_receipt_index_generation_regresses",
}


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _parse_path(path: str) -> list[str | int]:
    tokens: list[str | int] = []
    for segment in path.split("."):
        head, *brackets = segment.split("[")
        if head:
            tokens.append(head)
        for bracket in brackets:
            tokens.append(int(bracket.rstrip("]")))
    return tokens


def _expand_patch_value(value: Any) -> Any:
    if isinstance(value, dict) and set(value.keys()) == {"$repeat"}:
        char, count = value["$repeat"]
        return char * int(count)
    return copy.deepcopy(value)


def apply_case(base_value: Any, case: dict[str, Any]) -> Any:
    mutated = copy.deepcopy(base_value)
    for raw_path, raw_value in (case.get("patch") or {}).items():
        tokens = _parse_path(raw_path)
        target: Any = mutated
        for token in tokens[:-1]:
            target = target[token]
        target[tokens[-1]] = _expand_patch_value(raw_value)
    for raw_path in case.get("remove") or []:
        tokens = _parse_path(raw_path)
        target: Any = mutated
        for token in tokens[:-1]:
            target = target[token]
        del target[tokens[-1]]
    return mutated


def subschema_errors(schema: dict[str, Any], definition: str, value: Any) -> list[str]:
    """Validate a bare object against one $defs entry, keeping the shared
    $defs reference environment so $ref-bearing subschemas resolve."""
    try:
        import jsonschema
    except ImportError:
        return ["environment_error: jsonschema library unavailable"]
    wrapper = {
        "$schema": schema.get("$schema", "https://json-schema.org/draft/2020-12/schema"),
        "$defs": schema.get("$defs", {}),
        "$ref": f"#/$defs/{definition}",
    }
    validator = jsonschema.Draft202012Validator(wrapper)
    return [error.message for error in sorted(validator.iter_errors(value), key=str)]


def iter_scopes(definition: str, value: dict[str, Any]) -> list[tuple[str, dict[str, Any]]]:
    found: list[tuple[str, dict[str, Any]]] = []
    if definition in {
        "git_command_request",
        "git_command_result",
        "git_command_error",
        "git_command_availability",
        "git_command_disabled_reason",
        "git_permission_decision",
    } and isinstance(value.get("scope"), dict):
        found.append(("scope", value["scope"]))
    disabled = value.get("disabled_reason")
    if definition == "git_command_availability" and isinstance(disabled, dict):
        if isinstance(disabled.get("scope"), dict):
            found.append(("disabled_reason.scope", disabled["scope"]))
    return found


def _is_oid(value: Any) -> bool:
    return isinstance(value, str) and bool(HEX40_RE.match(value) or HEX64_RE.match(value))


def strict_branch_problems(branch: Any) -> list[str]:
    if not isinstance(branch, str):
        return ["branch is not a string"]
    problems: list[str] = []
    short = branch[len("refs/heads/"):] if branch.startswith("refs/heads/") else branch
    if short != branch and short == "":
        problems.append("branch has an empty short name after refs/heads/")
    if branch.startswith("/") or branch.endswith("/") or branch.endswith(".") or branch.endswith(".lock"):
        problems.append(f"branch {branch!r} has a forbidden leading/trailing component")
    if "//" in branch or ".." in branch or "@{" in branch:
        problems.append(f"branch {branch!r} contains a forbidden sequence")
    for char in branch:
        if char.isspace() or char in "~^:?*[\\" or ord(char) < 0x20 or ord(char) == 0x7F:
            problems.append(f"branch {branch!r} contains a forbidden character")
            break
    for component in short.split("/"):
        if component in {"", ".", ".."} or component.startswith(".") or component.endswith(".lock"):
            problems.append(f"branch {branch!r} has a forbidden path component")
            break
    return problems


def strict_path_problems(path: Any) -> list[str]:
    if not isinstance(path, str) or not path:
        return ["path is not a non-empty string"]
    problems: list[str] = []
    if path.startswith("/") or path.startswith("\\") or "\\" in path:
        problems.append(f"path {path!r} is absolute or contains a backslash")
    if path.endswith("/"):
        problems.append(f"path {path!r} has a trailing slash")
    if any(segment == ".." for segment in path.split("/")):
        problems.append(f"path {path!r} escapes the repository")
    if path.startswith(" ") or path.endswith(" "):
        problems.append(f"path {path!r} has a leading or trailing space")
    for segment in path.split("/"):
        if segment.startswith(" ") or segment.endswith(" "):
            problems.append(f"path {path!r} has a segment with a leading or trailing space")
            break
    for char in path:
        if char != " " and (char.isspace() or ord(char) < 0x20 or ord(char) == 0x7F):
            problems.append(f"path {path!r} contains a control byte or non-space whitespace")
            break
    return problems


def scope_semantic_problems(label: str, scope: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    command = scope.get("command_id")
    if scope.get("scm_backend") != "git":
        problems.append(f"{label}: scm_backend must be exactly git")
    state = scope.get("expected_git_state")
    if isinstance(state, dict):
        if state.get("kind") != "git":
            problems.append(f"{label}: expected_git_state.kind must be git")
        head = state.get("head_oid")
        if not _is_oid(head):
            problems.append(f"{label}: expected_git_state.head_oid is not a git OID")
        elif state.get("object_format") == "sha1" and not HEX40_RE.match(head):
            problems.append(f"{label}: sha1 head_oid must be 40 hex chars")
        elif state.get("object_format") == "sha256" and not HEX64_RE.match(head):
            problems.append(f"{label}: sha256 head_oid must be 64 hex chars")
        for gen_key in ("index_generation", "config_generation"):
            gen = state.get(gen_key)
            if not isinstance(gen, int) or gen < 0:
                problems.append(f"{label}: expected_git_state.{gen_key} must be an integer >= 0")
    else:
        problems.append(f"{label}: expected_git_state is missing")
    sha = scope.get("currentness_sha256")
    if not isinstance(sha, str) or not HEX64_ANY.match(sha):
        problems.append(f"{label}: currentness_sha256 must be 64 hex chars")
    for path in scope.get("paths") or []:
        problems.extend(f"{label}: {problem}" for problem in strict_path_problems(path))
    if command == "cmd.git.stage":
        declared = scope.get("untracked_paths_declared") or []
        staged = scope.get("paths") or []
        for path in declared:
            problems.extend(f"{label}: {problem}" for problem in strict_path_problems(path))
            if path not in staged:
                problems.append(f"{label}: declared untracked path {path!r} is outside paths[]")
        if scope.get("include_untracked") is not True and len(declared) > 0:
            problems.append(
                f"{label}: declared untracked paths require include_untracked=true"
            )
    if command == "cmd.git.unstage":
        if "include_untracked" in scope or "untracked_paths_declared" in scope:
            problems.append(f"{label}: unstage must not carry untracked admission fields")
    if command == "cmd.source_control.remote.update":
        if isinstance(state, dict) and scope.get("expected_config_generation") != state.get("config_generation"):
            problems.append(
                f"{label}: expected_config_generation must equal the fenced config generation"
            )
        urls = [scope.get("fetch_url"), *(scope.get("push_urls") or [])]
        for url in urls:
            if isinstance(url, str) and "@" in url:
                problems.append(f"{label}: remote URL {url!r} carries userinfo/credentials")
    if command in {"cmd.source_control.branch.create", "cmd.source_control.branch.delete"}:
        problems.extend(f"{label}: {problem}" for problem in strict_branch_problems(scope.get("branch")))
    if command == "cmd.source_control.branch.create":
        if not _is_oid(scope.get("base_oid")):
            problems.append(f"{label}: base_oid is not a git OID")
    if command == "cmd.source_control.branch.delete":
        if not _is_oid(scope.get("expected_branch_head")):
            problems.append(f"{label}: expected_branch_head is not a git OID")
        if scope.get("dangerous_confirmation") is not True:
            problems.append(f"{label}: branch.delete requires dangerous_confirmation=true")
        if scope.get("irreversibility_disclosed") is not True:
            problems.append(f"{label}: branch.delete requires irreversibility_disclosed=true")
        if not scope.get("preview_ref"):
            problems.append(f"{label}: branch.delete requires an immutable branch/head preview_ref")
    if command == "cmd.source_control.stash.apply" and not scope.get("preview_ref"):
        problems.append(f"{label}: stash.apply requires a current preview_ref")
    return problems


def _parse_utc(value: Any) -> Any:
    from datetime import datetime

    if not isinstance(value, str):
        return None
    text = value[:-1] + "+00:00" if value.endswith("Z") else value
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def preview_semantic_problems(label: str, definition: str, preview: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    if preview.get("scm_backend") != "git":
        problems.append(f"{label}: scm_backend must be exactly git")
    state = preview.get("expected_git_state")
    if isinstance(state, dict):
        head = state.get("head_oid")
        if not _is_oid(head):
            problems.append(f"{label}: expected_git_state.head_oid is not a git OID")
        elif state.get("object_format") == "sha1" and not HEX40_RE.match(head):
            problems.append(f"{label}: sha1 head_oid must be 40 hex chars")
        elif state.get("object_format") == "sha256" and not HEX64_RE.match(head):
            problems.append(f"{label}: sha256 head_oid must be 64 hex chars")
    else:
        problems.append(f"{label}: expected_git_state is missing")
    sha = preview.get("currentness_sha256")
    if not isinstance(sha, str) or not HEX64_ANY.match(sha):
        problems.append(f"{label}: currentness_sha256 must be 64 hex chars")
    produced = _parse_utc(preview.get("produced_at_utc"))
    expires = _parse_utc(preview.get("expires_at_utc"))
    if produced is None or expires is None:
        problems.append(f"{label}: produced/expires timestamps must parse as UTC")
    elif expires <= produced:
        problems.append(f"{label}: expires_at_utc must be after produced_at_utc")
    if definition == "stash_apply_preview":
        for path in preview.get("conflicting_paths") or []:
            problems.extend(f"{label}: {problem}" for problem in strict_path_problems(path))
    if definition == "branch_delete_preview":
        problems.extend(
            f"{label}: {problem}" for problem in strict_branch_problems(preview.get("branch"))
        )
        if not _is_oid(preview.get("expected_branch_head")):
            problems.append(f"{label}: expected_branch_head is not a git OID")
    return problems


def preview_join_verdict(
    request_value: dict[str, Any], preview_definition: str, preview_value: dict[str, Any]
) -> tuple[str, str]:
    """Execute the exact request-to-preview revalidation join.

    Returns (verdict, detail) with verdict one of admitted, substitution,
    expired, stale, or guarded. Substitution (wrong record, repository,
    workspace, or target) is checked before expiry, staleness (moved
    revision fence, currentness, permission, FileSafe, or vanished target),
    and guard findings (conflicts, dirty worktree, protected, checked-out,
    or attached).
    """
    scope = request_value.get("scope") or {}
    command = scope.get("command_id")
    if preview_definition != PREVIEW_DEFINITION_FOR_COMMAND.get(command):
        return ("substitution", "preview kind does not match the requested command")
    if preview_value.get("preview_id") != scope.get("preview_ref"):
        return ("substitution", "preview_id does not equal the requested preview_ref")
    if preview_value.get("repo_id") != scope.get("repo_id"):
        return ("substitution", "preview names a different repo_id")
    if preview_value.get("workspace_id") != scope.get("workspace_id"):
        return ("substitution", "preview names a different workspace_id")
    if command == "cmd.source_control.stash.apply":
        if preview_value.get("stash_id") != scope.get("stash_id"):
            return ("substitution", "preview names a different stash_id")
    if command == "cmd.source_control.branch.delete":
        if preview_value.get("branch") != scope.get("branch"):
            return ("substitution", "preview names a different branch")
        if preview_value.get("expected_branch_head") != scope.get("expected_branch_head"):
            return ("substitution", "preview names a different expected branch head")
    requested_at = _parse_utc(request_value.get("requested_at_utc"))
    expires_at = _parse_utc(preview_value.get("expires_at_utc"))
    if requested_at is None or expires_at is None:
        return ("stale", "join timestamps do not parse")
    if expires_at <= requested_at:
        return ("expired", "preview expired before the request was made")
    if preview_value.get("expected_git_state") != scope.get("expected_git_state"):
        return ("stale", "revision fence moved since the preview was produced")
    if preview_value.get("currentness_generation") != scope.get("currentness_generation"):
        return ("stale", "currentness generation moved since the preview was produced")
    if preview_value.get("currentness_sha256") != scope.get("currentness_sha256"):
        return ("stale", "currentness hash moved since the preview was produced")
    if preview_value.get("permission_snapshot_ref") != scope.get("permission_snapshot_ref"):
        return ("stale", "permission snapshot moved since the preview was produced")
    if preview_value.get("file_safe_decision_ref") != scope.get("file_safe_decision_ref"):
        return ("stale", "FileSafe decision moved since the preview was produced")
    if command == "cmd.source_control.stash.apply":
        if preview_value.get("stash_exists") is not True:
            return ("stale", "preview reports the stash no longer exists")
        if preview_value.get("worktree_clean") is not True:
            return ("guarded", "preview reports a dirty worktree")
        if preview_value.get("conflicting_paths"):
            return ("guarded", "preview reports conflicting paths")
    if command == "cmd.source_control.branch.delete":
        if preview_value.get("branch_exists") is not True:
            return ("stale", "preview reports the branch no longer exists")
        if preview_value.get("protected") is True:
            return ("guarded", "preview reports a protected branch")
        if preview_value.get("checked_out") is True:
            return ("guarded", "preview reports a checked-out branch")
        if preview_value.get("attached_worktree_refs"):
            return ("guarded", "preview reports attached worktrees")
    return ("admitted", "request matches the preview on identity, fence, findings, and expiry")


def semantic_problems(definition: str, value: dict[str, Any]) -> list[str]:
    problems: list[str] = []
    for label, scope in iter_scopes(definition, value):
        problems.extend(scope_semantic_problems(label, scope))
    if definition in {"stash_apply_preview", "branch_delete_preview"}:
        problems.extend(preview_semantic_problems("preview", definition, value))
    if definition == "git_permission_decision":
        scope = value.get("scope") or {}
        expected = PERMISSION_CLASS_FOR_COMMAND.get(scope.get("command_id"))
        if expected is not None and value.get("permission_class") != expected:
            problems.append(
                f"permission_class {value.get('permission_class')!r} does not name {scope.get('command_id')!r}"
            )
        if value.get("authority_widening") is not False:
            problems.append("authority_widening must be false")
        if value.get("secret_material_exposed") is not False:
            problems.append("secret_material_exposed must be false")
    if definition == "git_command_receipt":
        if value.get("reconciled") is True and value.get("effect_state") != "effects_reconciled":
            problems.append("a reconciled receipt must carry effect_state=effects_reconciled")
        if value.get("effect_state") == "effects_reconciled" and value.get("reconciled") is not True:
            problems.append("effects_reconciled requires reconciled=true")
        for key in ("after_head_oid", "after_index_generation", "after_config_generation"):
            before = value.get(key.replace("after_", "before_"))
            after = value.get(key)
            if value.get("effect_state") == "effect_unknown" and after is not None:
                problems.append(f"{key} must stay null while the effect is unknown")
            if key != "after_head_oid" and isinstance(before, int) and isinstance(after, int) and after < before:
                problems.append(f"{key} regresses below its before-generation")
    if definition == "git_command_result":
        if value.get("outcome") == "accepted":
            if not value.get("observable_work_id"):
                problems.append("an accepted result must name its ObservableWork")
            if "operation_receipt_ref" in value:
                problems.append("an accepted result must not carry a terminal receipt")
        if value.get("outcome") != "accepted" and not value.get("operation_receipt_ref"):
            problems.append("a terminal result must carry an operation receipt")
    if definition == "git_command_error":
        if value.get("effect_state") == "effect_unknown":
            if value.get("retry_allowed") is not False:
                problems.append("effect_unknown keeps retry_allowed=false")
            actions = value.get("safe_next_actions") or []
            if "reconcile_effects" not in actions or "retry" in actions:
                problems.append("effect_unknown offers reconciliation-only next actions")
    return problems


def check_neutral_family_separation() -> list[str]:
    """This family is separate: none of its command IDs may appear in the
    nineteen neutral command enum. Reads the neutral schema; never modifies it."""
    problems: list[str] = []
    try:
        neutral = load_json(NEUTRAL_SCHEMA_PATH)
    except (OSError, ValueError) as exc:
        return [f"neutral schema unreadable: {exc}"]
    try:
        neutral_ids = neutral["$defs"]["source_control_command_id"]["enum"]
    except KeyError:
        return ["neutral command enum not found where expected"]
    overlap = [command for command in COMMANDS if command in neutral_ids]
    if overlap:
        problems.append(f"adapter commands leaked into the neutral family: {sorted(overlap)}")
    return problems


def run_checks() -> dict[str, Any]:
    report: dict[str, Any] = {"problems": [], "counts": {}}
    problems: list[str] = report["problems"]
    try:
        schema = load_json(SCHEMA_PATH)
    except (OSError, ValueError) as exc:
        problems.append(f"schema unreadable: {exc}")
        return report
    try:
        fixtures = load_json(FIXTURES_PATH)
    except (OSError, ValueError) as exc:
        problems.append(f"fixtures unreadable: {exc}")
        return report

    if fixtures.get("schema_id") != EXPECTED_FIXTURE_SCHEMA_ID:
        problems.append("fixture envelope schema_id mismatch")
    if fixtures.get("owner_schema") != EXPECTED_OWNER_SCHEMA:
        problems.append("fixture envelope owner_schema mismatch")
    if fixtures.get("owner_unit") != EXPECTED_OWNER_UNIT:
        problems.append("fixture envelope owner_unit mismatch")

    valid = fixtures.get("valid", [])
    invalid = fixtures.get("invalid", [])
    by_name = {case["name"]: case for case in valid}
    report["counts"] = {"valid": len(valid), "invalid": len(invalid)}

    problems.extend(check_neutral_family_separation())

    request_commands: set[str] = set()
    for case in valid:
        name = case.get("name", "<unnamed>")
        definition = case.get("definition")
        value = case.get("value")
        if definition not in schema.get("$defs", {}):
            problems.append(f"valid/{name}: unknown definition {definition!r}")
            continue
        for message in subschema_errors(schema, definition, value):
            problems.append(f"valid/{name}: schema: {message}")
        if isinstance(value, dict):
            for problem in semantic_problems(definition, value):
                problems.append(f"valid/{name}: semantic: {problem}")
            if definition == "git_command_request" and isinstance(value.get("scope"), dict):
                request_commands.add(value["scope"].get("command_id"))

    for command in COMMANDS:
        if command not in request_commands:
            problems.append(f"coverage: {command} has no positive request fixture")

    actual_negatives = {case.get("name") for case in invalid}
    if actual_negatives != EXPECTED_NEGATIVE_IDS:
        missing = sorted(EXPECTED_NEGATIVE_IDS - actual_negatives)
        extra = sorted(actual_negatives - EXPECTED_NEGATIVE_IDS)
        if missing:
            problems.append(f"negative inventory missing: {missing}")
        if extra:
            problems.append(f"negative inventory has unpinned cases: {extra}")

    negative_commands: set[str] = set()
    for case in invalid:
        name = case.get("name", "<unnamed>")
        definition = case.get("definition")
        base_name = case.get("base_valid")
        layer = case.get("rejection_layer")
        negative_commands.add(case.get("command"))
        base = by_name.get(base_name)
        if base is None:
            problems.append(f"invalid/{name}: unknown base_valid {base_name!r}")
            continue
        if definition != base.get("definition"):
            problems.append(f"invalid/{name}: definition {definition!r} differs from base")
            continue
        if layer not in {"schema", "semantic"}:
            problems.append(f"invalid/{name}: rejection_layer must be schema or semantic")
            continue
        if (name in EXPECTED_SEMANTIC_NEGATIVES) != (layer == "semantic"):
            problems.append(f"invalid/{name}: rejection_layer does not match its pin")
            continue
        try:
            mutated = apply_case(base["value"], case)
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            problems.append(f"invalid/{name}: unusable patch/remove: {exc}")
            continue
        schema_messages = subschema_errors(schema, definition, mutated)
        semantic_messages = semantic_problems(definition, mutated) if isinstance(mutated, dict) else []
        if layer == "schema":
            if not schema_messages:
                problems.append(f"invalid/{name}: schema unexpectedly accepted the mutation")
        else:
            if schema_messages:
                problems.append(f"invalid/{name}: schema rejected a semantic-layer case: {schema_messages[0]}")
            if not semantic_messages:
                problems.append(f"invalid/{name}: semantics unexpectedly accepted the mutation")

    for command in COMMANDS:
        if command not in negative_commands:
            problems.append(f"coverage: {command} has no negative fixture")

    joins = fixtures.get("preview_joins", [])
    report["counts"]["preview_joins"] = len(joins)
    actual_joins = {join.get("name") for join in joins}
    if set(actual_joins) != set(EXPECTED_JOIN_VERDICTS):
        missing = sorted(set(EXPECTED_JOIN_VERDICTS) - set(actual_joins))
        extra = sorted(set(actual_joins) - set(EXPECTED_JOIN_VERDICTS))
        if missing:
            problems.append(f"join inventory missing: {missing}")
        if extra:
            problems.append(f"join inventory has unpinned cases: {extra}")
    for join in joins:
        name = join.get("name", "<unnamed>")
        request_case = by_name.get(join.get("request"))
        preview_case = by_name.get(join.get("preview"))
        if request_case is None or request_case.get("definition") != "git_command_request":
            problems.append(f"join/{name}: request does not name a valid request fixture")
            continue
        if preview_case is None or preview_case.get("definition") not in {
            "stash_apply_preview",
            "branch_delete_preview",
        }:
            problems.append(f"join/{name}: preview does not name a valid preview fixture")
            continue
        verdict, detail = preview_join_verdict(
            request_case["value"], preview_case["definition"], preview_case["value"]
        )
        expected = EXPECTED_JOIN_VERDICTS.get(name)
        if join.get("expect") != expected:
            problems.append(f"join/{name}: declared expect does not match its pin")
        if verdict != expected:
            problems.append(f"join/{name}: verdict {verdict} ({detail}) != pinned {expected}")

    report["counts"]["request_commands"] = sorted(request_commands)
    report["counts"]["negative_commands"] = sorted(c for c in negative_commands if c)
    return report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Validate the Git adapter command contract family.")
    parser.add_argument("--json", action="store_true", help="Emit a machine-readable report.")
    args = parser.parse_args(argv)
    report = run_checks()
    problems = report["problems"]
    if args.json:
        print(json.dumps({"ok": not problems, **report}, indent=2, sort_keys=True))
    else:
        counts = report["counts"]
        print(f"schema:    {SCHEMA_PATH}")
        print(f"fixtures:  {FIXTURES_PATH}")
        print(f"valid:     {counts.get('valid')}  invalid: {counts.get('invalid')}  joins: {counts.get('preview_joins')}")
        if problems:
            print(f"FAIL: {len(problems)} problem(s)")
            for problem in problems:
                print(f"  - {problem}")
        else:
            print("PASS: git adapter command family is internally consistent")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
