"""Shared read-only command inventory checks; never dispatcher admission."""

import fnmatch


def wiring_command_excluded(command_id, excluded_tokens):
    for token in excluded_tokens:
        if "*" in token and fnmatch.fnmatchcase(command_id, token):
            return True
        if token.endswith("_") and command_id.startswith(token):
            return True
        if command_id == token:
            return True
    return False


def command_handler_bindings(entries):
    bindings = {}
    for row in entries.values():
        if not isinstance(row, dict) or not isinstance(row.get("ui_command_id"), str):
            continue
        targets = bindings.setdefault(row["ui_command_id"], set())
        handler = row.get("handler_location")
        if isinstance(handler, str):
            targets.add(handler)
    return {command: sorted(targets) for command, targets in sorted(bindings.items())}
