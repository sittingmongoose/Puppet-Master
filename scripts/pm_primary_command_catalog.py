"""Static registration guard for seven retained Server/Egolite primary commands.

This is a bounded regression check of CS-073/UCC-151 and their existing owner
contracts, not a command census, dispatcher, or native-readiness assertion.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


# Exact identities from the owner-backed retained-seven definitions. Other
# commands, including compatibility spellings, are outside this guard's scope.
COMMAND_OWNERS = {
    "cmd.auth_profile.open_official_page": "Plans/Multi-Account_Connection_Spec.md#MACS-003",
    "cmd.integration.connection.add": "Plans/Shared_Integration_Runtime.md#SIR-035",
    **{f"cmd.integration.connection.{action}": "Plans/Shared_Integration_Runtime.md#SIR-019"
       for action in ("update", "test", "remove", "open_details")},
    "cmd.remote_access.route.test": "Plans/Remote_Access_System.md#RAS-009",
}
DOCUMENT_SECTIONS = {
    "Plans/Commands_System.md": (
        "Server/Egolite Command-Gap Central Registration Addendum - 2026-09-01",
        "primary registrations",
    ),
    "Plans/UI_Command_Catalog.md": (
        "Server/Egolite Exact Command And Reverse-Consumer Catalog Addendum - 2026-09-01",
        "primary catalog rows",
    ),
}
START = "<!-- retained-seven-primary-metadata:start -->"
END = "<!-- retained-seven-primary-metadata:end -->"
HEADERS = ["Exact primary command", "Label", "Description", "Preconditions",
           "Owner / PlanUnit", "Sole future handler target", "Contracts",
           "Intended consumers / exact return"]


def expected_binding(command: str) -> dict[str, str]:
    """Existing exact production contracts; do not infer from a mutable row."""
    if command == "cmd.auth_profile.open_official_page":
        handler = "handlers::multi_account::open_official_page"
        schema = "Plans/multi_account_contracts.schema.json"
        request, result = "AuthProfileCommandRequest", "AuthProfileCommandResult"
    elif command.startswith("cmd.integration.connection."):
        handler = "handlers::integration_connection::" + command.rsplit(".", 1)[1]
        schema = "Plans/shared_integration_runtime.schema.json"
        request, result = "IntegrationConnectionCommandRequest", "IntegrationConnectionCommandResult"
    else:
        handler = "handlers::remote_access::route_test"
        schema = "Plans/remote_access_system_contracts.schema.json"
        request, result = "command_payload", "command_result"
    suffix = command.removeprefix("cmd.").replace(".", "_")
    return {
        "handler_location": handler,
        "request_schema_ref": f"{schema}#/$defs/{request}",
        "result_schema_ref": f"{schema}#/$defs/{result}",
        "state_selector": f"state.commands.{suffix}.availability",
        "disabled_reason_projection": f"state.commands.{suffix}.disabled_reason",
        "ui_element_id": f"catalog.{suffix}",
    }


def expected_contracts(command: str) -> dict[str, str]:
    binding = expected_binding(command)
    schema = binding["request_schema_ref"].split("#", 1)[0]
    if command == "cmd.auth_profile.open_official_page":
        extra = ("AuthProfileCommandError", "AuthProfileCommandAvailability", "AuthProfilePermissionDecision")
    elif command.startswith("cmd.integration.connection."):
        extra = ("IntegrationConnectionCommandError", "IntegrationConnectionAvailability", "SharedIntegrationPermissionDecision")
    else:
        extra = ("command_error", "command_availability", "command_permission")
    return {
        "request": binding["request_schema_ref"],
        "result": binding["result_schema_ref"],
        **{label: f"{schema}#/$defs/{definition}"
           for label, definition in zip(("error", "availability", "permission"), extra)},
    }


def _unfenced(text: str) -> str:
    lines = []
    fence = None
    for line in text.splitlines():
        match = re.match(r"^\s*(`{3,}|~{3,})", line)
        if match:
            token = match[1]
            if fence is None:
                fence = token
            elif token[0] == fence[0] and len(token) >= len(fence):
                fence = None
            lines.append("")
        else:
            lines.append(line if fence is None else "")
    text = "\n".join(lines)
    return re.sub(r"<!--[\s\S]*?-->",
                  lambda match: match[0] if match[0] in (START, END) else "\n" * match[0].count("\n"), text)


def _section(text: str, level: int, title_pattern: str) -> str | None:
    matches = list(re.finditer(rf"^{'#' * level} {title_pattern}\s*$", text, re.M))
    if len(matches) != 1:
        return None
    tail = text[matches[0].end():]
    end = re.search(rf"^#{{1,{level}}} ", tail, re.M)
    return tail[:end.start()] if end else tail


def _rows(text: str) -> list[list[str]]:
    return [[cell.strip() for cell in re.split(r"(?<!\\)\|", line.strip())[1:-1]]
            for line in text.splitlines() if line.strip().startswith("|")
            and line.strip().endswith("|")]


def validate_primary_command_catalog(
    root: Path, entries: dict[str, Any], documents: dict[str, str] | None = None,
) -> list[dict[str, Any]]:
    """Return actionable errors without writing artifacts or changing verdicts."""
    failures: list[dict[str, Any]] = []

    def fail(path: str, error: str, command: str | None = None, **details: Any) -> None:
        row = {"path": path, "error": "retained_primary_" + error, **details}
        if command is not None:
            row["command_id"] = command
        failures.append(row)

    for path, (heading, primary_heading) in DOCUMENT_SECTIONS.items():
        try:
            text = documents[path] if documents is not None else (root / path).read_text(encoding="utf-8")
        except (OSError, KeyError) as exc:
            fail(path, "document_missing", detail=str(exc))
            continue
        text = _unfenced(text)
        document_rows = _rows(text)
        addendum = _section(text, 2, re.escape(heading))
        primary = _section(addendum or "", 3, rf"Exact (?:\d+ )?{re.escape(primary_heading)}")
        if primary is None:
            fail(path, "section_missing_or_ambiguous")
            continue
        if primary.count(START) != 1 or primary.count(END) != 1 or primary.index(START) >= primary.index(END):
            fail(path, "metadata_block_missing_or_ambiguous")
            continue
        block = primary.split(START, 1)[1].split(END, 1)[0]
        # Shared declarations apply only inside this explicitly bounded block.
        for declaration in ("command_kind=domain_action", "normalization.kind=none",
                            "alias_of_command_id=null", "expected_event_types=[]"):
            field = declaration.split("=", 1)[0]
            declarations = re.findall(rf"`({re.escape(field)}=[^`]+)`", block)
            if declarations != [declaration]:
                fail(path, "metadata_declaration", declaration=declaration)
        for required in (
            "`normalizes_to_contract` is the exact owner request schema pointer in its Contracts cell",
            "availability remains `handler_unavailable`",
        ):
            if required not in block:
                fail(path, "metadata_declaration", declaration=required)
        rows = _rows(block)
        if rows.count(HEADERS) != 1:
            fail(path, "metadata_table_header")
        primary_rows = _rows(primary)
        # Compatibility sources targeting these seven remain aliases; mentioning
        # a target in column two never registers that target or its source.
        for alias_row in _rows(addendum or ""):
            if len(alias_row) != 4 or alias_row[1].strip("`") not in COMMAND_OWNERS:
                continue
            alias = alias_row[0].strip("`")
            if not re.fullmatch(r"cmd\.[a-z0-9_.]+", alias) or alias in COMMAND_OWNERS:
                continue
            if any(row and row[0] == f"`{alias}`" for row in primary_rows):
                fail(path, "alias_promoted", alias)
            if any(isinstance(row, dict) and row.get("ui_command_id") == alias for row in entries.values()):
                fail("Plans/Wiring_Matrix.production.json", "alias_production_row", alias)
        for command, owner in COMMAND_OWNERS.items():
            own = [row for row in rows if row and row[0] == f"`{command}`"]
            all_own = [row for row in primary_rows if row and row[0] == f"`{command}`"]
            document_own = [row for row in document_rows if row and row[0] == f"`{command}`"]
            if len(own) != 1 or len(all_own) != 1 or len(document_own) != 1:
                fail(path, "row_count", command, metadata_rows=len(own), primary_rows=len(all_own),
                     document_rows=len(document_own))
                continue
            row = own[0]
            if len(row) != len(HEADERS):
                fail(path, "row_shape", command)
                continue
            for index in (1, 2, 3, 7):
                if not row[index].strip("` -"):
                    fail(path, "metadata_empty", command, field=HEADERS[index])
            binding = expected_binding(command)
            for index, expected in ((4, owner), (5, binding["handler_location"])):
                if row[index] != f"`{expected}`":
                    fail(path, "binding_mismatch", command, field=HEADERS[index], expected=expected)
            for label, expected in expected_contracts(command).items():
                refs = re.findall(rf"(?:^|;\s*){label} `([^`]+)`(?=;|$)", row[6])
                if refs != [expected]:
                    fail(path, "schema_mismatch", command, field=label, expected=expected)

    matrix_path = "Plans/Wiring_Matrix.production.json"
    schemas: dict[str, Any] = {}
    for command in COMMAND_OWNERS:
        matches = [(key, row) for key, row in entries.items()
                   if isinstance(row, dict) and row.get("ui_command_id") == command]
        if len(matches) != 1:
            fail(matrix_path, "production_row_count", command, count=len(matches))
            continue
        key, row = matches[0]
        path = f"{matrix_path}#/entries/{key}"
        binding = expected_binding(command)
        if key != binding["ui_element_id"]:
            fail(path, "production_key", command, expected=binding["ui_element_id"])
        for field, expected in binding.items():
            if row.get(field) != expected:
                fail(path, "production_binding", command, field=field, expected=expected)
        effect = row.get("effect_contract")
        if row.get("expected_event_types") != [] or not isinstance(effect, dict) or effect.get("effect_kind") != "receipt":
            fail(path, "production_effect", command)
        checks = row.get("acceptance_checks", [])
        required = (f"Read {binding['state_selector']} and {binding['disabled_reason_projection']} "
                    "before dispatch; remain handler_unavailable until source-hashed native proof exists.")
        if not isinstance(checks, list) or required not in checks:
            fail(path, "production_disabled_boundary", command)
        accessibility = row.get("accessibility_contract")
        announcement = accessibility.get("disabled_announcement") if isinstance(accessibility, dict) else None
        if not isinstance(announcement, str) or "handler_unavailable" not in announcement or binding["disabled_reason_projection"] not in announcement:
            fail(path, "production_disabled_announcement", command)
        for field, ref in expected_contracts(command).items():
            schema_path, pointer = ref.split("#", 1)
            try:
                if schema_path not in schemas:
                    schemas[schema_path] = json.loads((root / schema_path).read_text(encoding="utf-8"))
                node = schemas[schema_path]
                for part in pointer.lstrip("/").split("/"):
                    node = node[part.replace("~1", "/").replace("~0", "~")]
            except (OSError, ValueError, KeyError, TypeError):
                fail(schema_path, "schema_ref_unresolved", command, field=field, ref=ref)
    return failures
