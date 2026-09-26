"""Exact later non-Forge successors for historical Forge delta tests.

This is not a governance/landing baseline. Only the listed existing rows and
profiles are advanced to their reviewed edition; every other historical value
and every Forge value remains untouched. Current files are never an input.
"""

import copy
from functools import lru_cache
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
REVIEWED_COMMIT = "0f1785d161bc96c1e9035a299dd3b51930085d63"
WIRING_KEYS = frozenset("catalog." + name for name in (
    "remote_access_tailscale_identity_reset",
    "remote_access_tailscale_headscale_submit_registration",
    "restore_project_in_place", "backup_recovery_key_reencrypt",
    "server_bootstrap_start", "remote_access_tailscale_headscale_start",
    "remote_access_tailscale_login_resume", "backup_recovery_key_test",
    "restore_server_full", "backup_recovery_key_export",
    "backup_recovery_key_rotate", "backup_unlock", "backup_prune",
    "restore_project_as_new", "restore_selective", "restore_rollback",
    "remote_access_remote_link_rotate_recovery_key",
    "remote_access_tailscale_login_start",
))
EXTRA_TOUCH_COMMANDS = frozenset((
    "cmd.notifications.destination.test", "cmd.sound.preview",
    "cmd.sound.upload", "cmd.sound.pack.import",
    "cmd.sound.asset.delete", "cmd.sound.asset.export",
))
PROFILE_IDS = frozenset((
    "TCP-REMOTE", "TCP-BACKUP", "TCP-PERF", "TCP-INSTALL",
    "TCP-NOTIFY-SOUND", "TCP-APP-UPDATE-LOCAL", "TCP-REPOSITORY-LOCAL",
))


@lru_cache(maxsize=2)
def _reviewed(path):
    return json.loads(subprocess.check_output(
        ["git", "show", REVIEWED_COMMIT + ":" + path], cwd=ROOT, text=True))


def with_reviewed_nonforge_successors(path, historical):
    result = copy.deepcopy(historical)
    if path == "Plans/Wiring_Matrix.production.json":
        approved = _reviewed(path)["entries"]
        for key in WIRING_KEYS:
            if key not in result["entries"]:
                raise AssertionError("Expected existing non-Forge wiring row: " + key)
            result["entries"][key] = copy.deepcopy(approved[key])
    elif path == "Plans/touch_closure.json":
        approved = _reviewed(path)
        commands = EXTRA_TOUCH_COMMANDS | frozenset(
            _reviewed("Plans/Wiring_Matrix.production.json")["entries"][key]["ui_command_id"]
            for key in WIRING_KEYS)
        rows = {row[0]: row for row in approved["rows"]}
        profiles = {p["profile_id"]: p for p in approved["profiles"]}
        for index, row in enumerate(result["rows"]):
            if row[3] in commands:
                successor = rows[row[0]]
                if successor[2:4] != row[2:4]:
                    raise AssertionError("Non-Forge successor changed action identity")
                result["rows"][index] = copy.deepcopy(successor)
        for index, profile in enumerate(result["profiles"]):
            if profile["profile_id"] in PROFILE_IDS:
                result["profiles"][index] = copy.deepcopy(profiles[profile["profile_id"]])
    return result
