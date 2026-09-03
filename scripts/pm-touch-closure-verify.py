#!/usr/bin/env python3
"""Fail-closed validation for the canonical resolved Touch Closure Matrix.

Discovery is pointer-scoped: command-looking provenance text inside an owner
schema is never promoted into the actionable inventory. Optional path arguments
support isolated fixture testing without weakening canonical defaults.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import unquote

from jsonschema import Draft202012Validator


def find_repository_root(start: Path) -> Path:
    for candidate in (start, *start.parents):
        if (candidate / "Plans" / "00-plans-index.md").is_file():
            return candidate
    raise RuntimeError(f"cannot locate PuppetMaster repository root from {start}")


ROOT = find_repository_root(Path(__file__).resolve().parent)
REGISTRY_PATH = ROOT / "Plans" / "touch_closure.json"
SCHEMA_PATH = ROOT / "Plans" / "touch_closure.schema.json"
ADJUDICATION_PATH = (
    ROOT
    / "Plans"
    / "server_command_gap_adjudication.json"
)
PRODUCTION_WIRING_PATH: Path | None = ROOT / "Plans" / "Wiring_Matrix.production.json"
CENTRAL_MAP_PATH = (
    ROOT
    / "scratchpad"
    / "approval-gated-touch-closure-packet-custody-20260831-001"
    / "central-contract-map"
    / "central-contract-map.json"
)
ACTION_RE = re.compile(r"^(?:cmd|ui|settings)\.[a-z0-9_.-]+$")
TOKEN_RE = re.compile(r"\b(?:cmd|ui|settings)\.[a-z0-9_.-]+")
STALE_CENTRAL_UI_ACTIONS = {
    "ui.onboarding.choose_project",
    "ui.onboarding.choose_provider",
    "ui.onboarding.choose_server_branch",
    "ui.guided_tour.keep_layout",
    "ui.guided_tour.restore_layout",
}
REJECTED_COMMAND_CANDIDATES = {
    "cmd.authentication.sign_in",
    "cmd.back_seat_driver.mode.set",
    "cmd.settings.category.reset",
    "cmd.settings.open_notifications",
    "cmd.settings.suggestion.dismiss",
}
RETIRED_PACKET_COMMANDS = {"cmd.settings.bloom.open"}
REPOSITORY_LOCAL_PACKET_TOKENS = {
    "cmd.repository_automation.binding.select",
    "cmd.source_control.backup_history.open",
}
CONNECTION_DRAFT_LOCAL_PACKET_TOKENS = {"cmd.connection.draft.open_details"}
ADJUDICATION_SHA256 = "d45da4082814b15fc92e6d7b074e6e10f429e1e3e090c4969a778564fac74fcd"


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def between(text: str, start: str, end: str) -> str:
    start_at = text.find(start)
    if start_at < 0:
        raise ValueError(f"missing start marker {start!r}")
    end_at = text.find(end, start_at + len(start))
    if end_at < 0:
        raise ValueError(f"missing end marker {end!r} after {start!r}")
    return text[start_at:end_at]


def tokens(text: str) -> set[str]:
    return {match.group(0).rstrip(".") for match in TOKEN_RE.finditer(text)}


def schema_enum_actions(path: str, *pointers: str) -> set[str]:
    """Extract actions only from exact, named JSON-Pointer enum locations."""

    document = load_json(ROOT / path)
    found: set[str] = set()
    for pointer in pointers:
        node = resolve_json_pointer(document, pointer)
        if not isinstance(node, list):
            raise ValueError(f"{path}#{pointer}: action enum pointer does not resolve to an array")
        for action in node:
            if not isinstance(action, str) or not ACTION_RE.fullmatch(action):
                raise ValueError(f"{path}#{pointer}: non-action enum value {action!r}")
            found.add(action)
    return found


def settings_ui_actions() -> set[str]:
    data = load_json(ROOT / "Plans" / "settings_system_contract_fixtures.json")
    found: set[str] = set(data.get("ui_action_contracts", {}).keys())

    def visit(value: Any) -> None:
        if isinstance(value, dict):
            action = value.get("ui_action_id")
            if isinstance(action, str) and action.startswith("settings."):
                found.add(action)
            for child in value.values():
                visit(child)
        elif isinstance(value, list):
            for child in value:
                visit(child)

    visit(data)
    return found


def literal_attribute_actions(path: str) -> set[str]:
    text = read(path)
    return set(re.findall(r'data-(?:command|ui-action)-id=["\']([^"\']+)', text))


def expected_inventory() -> dict[str, tuple[str, str, str]]:
    """Build the independent expected action -> (profile, kind, disposition) map."""

    expected: dict[str, tuple[str, str, str]] = {}

    def add(profile: str, kind: str, actions: Iterable[str], disposition: str = "partial") -> None:
        for action in actions:
            if not ACTION_RE.fullmatch(action):
                raise ValueError(f"non-action token in expected inventory: {action}")
            prior = expected.get(action)
            value = (profile, kind, disposition)
            if prior is not None and prior != value:
                raise ValueError(f"conflicting expected owner/profile for {action}: {prior} vs {value}")
            expected[action] = value

    add(
        "TCP-SET-CMD",
        "command",
        {
            "cmd.settings.open",
            "cmd.settings.transaction.preview",
            "cmd.settings.transaction.apply",
            "cmd.settings.transaction.rollback",
            "cmd.settings.export",
        },
    )
    settings_ui = settings_ui_actions()
    route_actions = {
        "settings.onboarding.open",
        "settings.onboarding.run_again",
        "settings.guided_tour.replay",
        "settings.doctor.open",
        "settings.doctor.remediation.open",
    }
    add("TCP-SET-ROUTE", "ui_action", route_actions)
    add("TCP-SET-UI", "ui_action", settings_ui - route_actions)
    project = schema_enum_actions(
        "Plans/project_system_contracts.schema.json",
        "/$defs/project_action_id/enum",
    )
    add("TCP-PROJECT", "command", {item for item in project if item.startswith("cmd.")})
    add("TCP-PROJECT", "ui_action", {item for item in project if item.startswith("ui.")})
    add(
        "TCP-PROJECT-COMPOSITION",
        "command",
        schema_enum_actions(
            "Plans/project_system_contracts.schema.json",
            "/$defs/ProjectCompositionCommandId/enum",
        ),
    )
    add(
        "TCP-PROJECT-COMPOSITION-LOCAL",
        "ui_action",
        schema_enum_actions(
            "Plans/project_system_contracts.schema.json",
            "/$defs/ProjectCompositionLocalActionId/enum",
        ) - {"ui.project.restore_archived"},
    )
    add(
        "TCP-NAMED",
        "command",
        schema_enum_actions(
            "Plans/named_plan_system_contracts.schema.json",
            "/$defs/named_plan_command_id/enum",
        ),
    )

    server_text = read("Plans/Server_System.md")
    server = tokens(between(server_text, "### 4.1 Canonical command family requiring central integration", "### 4.3 UI projection grammar"))
    server_rejected = {"cmd.server.reconnect", "cmd.server.resume"}
    server_supplemental = {
        "cmd.server.bootstrap.start",
        "cmd.client.pair.start",
        "cmd.client.pair.approve",
        "cmd.client.pair.reject",
        "cmd.client.pair.cancel",
        "cmd.client.revoke",
    }
    server_actions = {
        item
        for item in server
        if item.startswith(("cmd.server.", "cmd.client."))
        and item not in server_rejected
    }
    add(
        "TCP-SERVER",
        "command",
        server_actions - server_supplemental,
    )
    add("TCP-SERVER-SUPPLEMENTAL", "command", server_supplemental)

    remote_text = read("Plans/Remote_Access_System.md")
    remote = tokens(between(remote_text, "### 4.1 Canonical command family requiring central integration", "### 4.2 Settings and status projection"))
    remote_aliases = {
        "cmd.remote_access.open_details",
        "cmd.remote_access.tailscale.check",
        "cmd.remote_access.tailscale.configure",
        "cmd.remote_access.tailscale.component.check",
        "cmd.remote_access.tailscale.serve.disable",
        "cmd.remote_access.tailscale.serve.enable",
        "cmd.remote_access.tailscale.serve.test",
    }
    remote_link_aliases = {"cmd.remote_access.remote_link.test"}
    add(
        "TCP-REMOTE",
        "command",
        {item for item in remote if item.startswith("cmd.remote_access.")}
        - remote_aliases
        - remote_link_aliases,
    )
    add("TCP-REMOTE-ALIAS", "command_alias", remote_aliases)
    add("TCP-REMOTE-LINK-ALIAS", "command_alias", remote_link_aliases)

    backup_text = read("Plans/Backup_Restore_System.md")
    backup = tokens(between(backup_text, "### 4.1 Canonical command families requiring central integration", "### 4.2 Normal and advanced UI"))
    add("TCP-BACKUP", "command", {item for item in backup if item.startswith(("cmd.backup.", "cmd.restore."))})

    browser_text = read("Plans/Section15_MVP_Promoted_Features_Spec.md")
    browser_contract = between(browser_text, "Required command-catalog rows are:", "Command and event lists here")
    browser_aliases = {"cmd.browser.run_code", "cmd.browser.evaluate"}
    auth_browser = {"cmd.authentication.start", "cmd.authentication.cancel", "cmd.authentication.resume"}
    browser = {
        item
        for item in tokens(browser_contract)
        if item.startswith("cmd.browser.")
        and item not in browser_aliases
        and item not in {"cmd.browser.auth"}
    }
    add("TCP-BROWSER", "command", browser)
    add("TCP-BROWSER-ALIAS", "command_alias", browser_aliases)
    add("TCP-AUTH-BROWSER", "command", auth_browser)

    capture_text = read("Plans/Test_Capture_and_Motion_Evidence.md")
    capture = tokens(between(capture_text, "Required command-catalog rows are:", "Browser recording aliases"))
    add("TCP-CAPTURE", "command", {item for item in capture if item.startswith(("cmd.testing.", "cmd.artifacts."))})

    scm_text = read("Plans/Source_Control_System.md")
    scm = tokens(between(scm_text, "The command owner must register the following exact primary identities:", "### 3.2 Canonical events"))
    scm_alias = {"cmd.source_control.select_worktree"}
    add("TCP-SCM", "command", {item for item in scm if item.startswith("cmd.source_control.")} - scm_alias)
    add("TCP-SCM-ALIAS", "command_alias", scm_alias)

    jj_text = read("Plans/Jujutsu_Integration.md")
    jj = tokens(between(jj_text, "### 3.1 Canonical command inventory", "### 3.2 JJ receipt extension"))
    add("TCP-JJ", "command", {item for item in jj if item.startswith("cmd.jujutsu.") and item != "cmd.jujutsu"})

    forge_text = read("Plans/Forge_Integrations.md")
    forge = tokens(between(forge_text, "### 3.1 Canonical commands", "Setup reuses shared runtime commands:"))
    add("TCP-FORGE", "command", {item for item in forge if item.startswith("cmd.forge.")})
    add(
        "TCP-REPOSITORY-LOCAL",
        "ui_action",
        schema_enum_actions(
            "Plans/final_gui_interaction_contracts.schema.json",
            "/$defs/local_action_common_request/properties/action_id/enum",
        ),
    )
    add(
        "TCP-INTEGRATION-CONNECTION",
        "command",
        {f"cmd.integration.connection.{suffix}" for suffix in ("add", "activate", "update", "test", "remove", "open_details")},
    )
    add(
        "TCP-CONNECTION-DRAFT-ALIAS",
        "command_alias",
        {
            "cmd.connection.draft.create",
            "cmd.connection.activate",
            "cmd.connection.update",
            "cmd.connection.test",
            "cmd.connection.remove",
            "cmd.connection.open_details",
        },
    )
    add(
        "TCP-CONNECTION-DRAFT-LOCAL",
        "ui_action",
        {"ui.integration.connection.draft.open_details"},
    )
    add(
        "TCP-AUTH-PROFILE",
        "command",
        {f"cmd.auth_profile.{suffix}" for suffix in ("sign_in", "sign_out", "verify", "cancel", "retry", "submit_code", "open_official_page", "select")},
    )
    add(
        "TCP-INSTALL",
        "command",
        {f"cmd.installation.{suffix}" for suffix in ("install", "select", "verify", "repair", "rollback")},
    )
    add("TCP-GITHUB-PR", "command", {"cmd.github.pr.create"})
    add("TCP-FORGE-PR-COMPAT", "command_alias", {"cmd.source_control.pr.create", "cmd.source_control.pr.merge"})
    add(
        "TCP-SIR-POST-AUTH-ALIAS",
        "command_alias",
        {"cmd.auth_session.resume", "cmd.auth_session.submit_code", "cmd.credential.add"},
    )

    add(
        "TCP-ONBOARD",
        "ui_action",
        schema_enum_actions(
            "Plans/product_onboarding_contracts.schema.json",
            "/$defs/onboarding_action_request/properties/action_id/enum",
        ),
    )
    guided_local_actions = schema_enum_actions(
        "Plans/guided_tour_contracts.schema.json",
        "/$defs/guided_tour_action_request/properties/action_id/enum",
    )
    exact_guided_local_actions = {
        "ui.guided_tour.start",
        "ui.guided_tour.next",
        "ui.guided_tour.back",
        "ui.guided_tour.pause",
        "ui.guided_tour.resume",
        "ui.guided_tour.skip",
        "ui.guided_tour.focus_route",
        "ui.guided_tour.toggle_eli5",
        "ui.guided_tour.finish",
        "ui.guided_tour.replay",
    }
    if guided_local_actions != exact_guided_local_actions:
        raise ValueError(
            "Guided Tour exact ten-action inventory drift: missing=%s extra=%s"
            % (
                sorted(exact_guided_local_actions - guided_local_actions),
                sorted(guided_local_actions - exact_guided_local_actions),
            )
        )
    guided_focus_action = "ui.guided_tour.focus_route"
    if guided_focus_action not in guided_local_actions:
        raise ValueError(f"Guided Tour typed local focus action missing from schema: {guided_focus_action}")
    add("TCP-TOUR", "ui_action", guided_local_actions - {guided_focus_action})
    doctor_actions = schema_enum_actions(
        "Plans/doctor_contracts.schema.json",
        "/$defs/doctor_action_request/properties/action_id/enum",
    )
    add("TCP-DOCTOR", "ui_action", doctor_actions - {"ui.doctor.copy_diagnostics"})
    add("TCP-DOCTOR-GAP-LOCAL", "ui_action", {"ui.doctor.copy_diagnostics"})

    plugin_text = read("Plans/Plugins_System.md")
    plugin_section = between(
        plugin_text,
        "### Command, event, receipt, and wiring disposition",
        "### GUI and reverse coverage",
    )
    plugin = {item for item in tokens(plugin_section) if item.startswith("cmd.agent_plugin.")}
    exact_plugin_commands = {
        f"cmd.agent_plugin.{suffix}"
        for suffix in (
            "scan",
            "install",
            "update",
            "enable",
            "disable",
            "reload",
            "remove",
            "validate",
            "review_changes",
            "rollback",
            "open_details",
            "open_logs",
        )
    }
    if plugin != exact_plugin_commands:
        raise ValueError(
            "Plugins System exact command inventory drift: missing=%s extra=%s"
            % (sorted(exact_plugin_commands - plugin), sorted(plugin - exact_plugin_commands))
        )
    add("TCP-PLUGIN", "command", plugin)
    add("TCP-PERF", "command", {"cmd.environment.connect", "cmd.environment.reconnect", "cmd.environment.disconnect"})
    add("TCP-BSD", "command", {"cmd.bsd.set"})
    add("TCP-USAGE", "command", {"cmd.nav.open_usage_subject"})

    system_source_path = "Concepts/pm7-tools/systems_integration_source.py"
    system_source_text = read(system_source_path)
    system_locals = literal_attribute_actions(system_source_path) | {
        item for item in tokens(system_source_text) if item.startswith("ui.")
    }
    local_profiles = {
        "TCP-SET-LOCAL": {
            "ui.settings.browser_scm_tab.select",
            "ui.settings.server_tab.select",
            "ui.settings.route.open",
        },
        "TCP-CAPTURE-LOCAL": {"ui.capture.policy.inspect"},
        "TCP-NAMED-LOCAL": {"ui.named_plan.inspect"},
        "TCP-ORIGIN-LOCAL": {"ui.origin.preview.open"},
        "TCP-PERF-LOCAL": {"ui.performance.evidence.inspect"},
        "TCP-PLANNING-LOCAL": {"ui.planning_wizard.open"},
        "TCP-PROJECT-SYNC-LOCAL": {
            "ui.settings.project_sync.client.inspect",
            "ui.settings.project_sync.clients.preview_manage",
            "ui.settings.project_sync.conflict.preview_policy",
            "ui.settings.project_sync.conflict.preview_simulation",
            "ui.settings.project_sync.continuity.preview",
            "ui.settings.project_sync.continuity.preview_edit",
            "ui.settings.project_sync.diagnostic.inspect",
            "ui.settings.project_sync.diagnostics.preview_export",
            "ui.settings.project_sync.diagnostics.preview_run",
            "ui.settings.project_sync.location.preview_add",
            "ui.settings.project_sync.location.preview_edit",
            "ui.settings.project_sync.project.preview_copy",
            "ui.settings.project_sync.project.preview_move",
            "ui.settings.project_sync.remote.preview_add",
            "ui.settings.project_sync.remote.preview_edit",
            "ui.settings.project_sync.remote.preview_import",
            "ui.settings.project_sync.remote.preview_remove",
            "ui.settings.project_sync.remote.preview_test",
            "ui.settings.project_sync.remote.preview_toggle",
            "ui.settings.project_sync_tab.select",
        },
    }
    expected_system_locals = set().union(*local_profiles.values())
    for profile, actions in local_profiles.items():
        add(profile, "ui_action", actions)
    missing_source_locals = expected_system_locals - system_locals
    if missing_source_locals:
        raise ValueError(f"PMConcept7 system local actions missing from authored source: {sorted(missing_source_locals)}")

    guided_source = read("Concepts/pm7-tools/guided_tour_source.py")
    guided_authored_parts = re.findall(
        r"GUIDED_TOUR_(?:MARKUP|STYLE|SCRIPT)\s*=\s*r'''(.*?)'''",
        guided_source,
        flags=re.DOTALL,
    )
    if len(guided_authored_parts) != 3:
        raise ValueError(f"Guided Tour authored source band census drifted: {len(guided_authored_parts)}")
    guided_tokens = tokens("\n".join(guided_authored_parts))
    add("TCP-GUIDED-NAV", "ui_action", {guided_focus_action})
    add("TCP-PANEL", "command", {"cmd.panel.switch", "cmd.panel.undock", "cmd.panel.redock"})
    add("TCP-WIDGET", "command", {"cmd.widget.add", "cmd.widget.remove", "cmd.widget.configure"})
    add("TCP-WIDGET-MOTION", "command", {"cmd.widget.move", "cmd.widget.resize"})
    add(
        "TCP-HOME-LAYOUT",
        "command",
        {
            "cmd.workspace_layout.move_surface",
            "cmd.workspace_layout.resize_surface",
            "cmd.workspace_layout.set_collapsed",
            "cmd.workspace_layout.reset",
        },
    )
    required_guided = {
        "cmd.panel.switch",
        "cmd.panel.redock",
        "cmd.widget.add",
        "cmd.widget.remove",
    }
    if not required_guided <= guided_tokens:
        raise ValueError(f"Guided Tour required command tokens missing from source: {sorted(required_guided - guided_tokens)}")
    if "cmd.nav.focus_route" in guided_tokens:
        raise ValueError("Guided Tour must use typed local ui.guided_tour.focus_route, not the optional command alias")
    required_home_layout = {"cmd.workspace_layout.set_collapsed", "cmd.workspace_layout.reset"}
    home_tokens = tokens(read("Concepts/pm7-tools/home_workspace_source.py"))
    if not required_home_layout <= home_tokens:
        raise ValueError(f"Home required layout command tokens missing from source: {sorted(required_home_layout - home_tokens)}")

    add("TCP-HOVER", "presentation", {"ui.hover_tag.show", "ui.hover_tag.hide", "ui.hover_tag.dismiss", "ui.hover_tag.reposition"})
    add("TCP-TOOL-DISCOVERY", "command", {"cmd.tool.discover"})
    return expected


def repository_path(ref: str) -> Path | None:
    if not ref.startswith(("Plans/", "Concepts/", "scripts/")):
        return None
    relative = ref.split("#", 1)[0].split(":", 1)[0]
    return ROOT / relative


def resolve_json_pointer(document: Any, fragment: str) -> Any:
    """Resolve one URI-fragment JSON Pointer, failing on prose-style anchors."""

    pointer = unquote(fragment)
    if pointer == "":
        return document
    if not pointer.startswith("/"):
        raise ValueError("fragment is not an exact JSON Pointer")
    current = document
    for encoded in pointer[1:].split("/"):
        token = encoded.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            if not token.isdigit():
                raise ValueError(f"list index is not an unsigned integer: {token!r}")
            index = int(token)
            if index >= len(current):
                raise ValueError(f"list index out of range: {index}")
            current = current[index]
        elif isinstance(current, dict):
            if token not in current:
                raise ValueError(f"object member does not exist: {token!r}")
            current = current[token]
        else:
            raise ValueError(f"cannot traverse through {type(current).__name__}")
    return current


def external_disposition_inventory(
    descriptor: dict[str, Any],
) -> tuple[dict[str, tuple[str, str]], set[str], list[str], dict[str, Any]]:
    """Project one hash-bound Settings disposition registry into required Touch rows.

    Returns supplemental action -> (kind, disposition), non-actionable source
    tokens, validation failures, and registry statistics. The packet spellings are
    never copied into the matrix as commands or aliases: only their admitted
    canonical targets, typed local actions, manager-owner commands, and named
    presentation projections become required rows.
    """

    failures: list[str] = []
    supplemental: dict[str, tuple[str, str]] = {}
    non_actionable: set[str] = set()
    registry_id = descriptor.get("registry_id", "<missing-registry-id>")
    source_path = descriptor.get("source_path", "")
    path = ROOT / source_path
    if not path.is_file():
        return supplemental, non_actionable, [f"{registry_id}: disposition registry source is missing: {source_path}"], {}

    source_bytes = path.read_bytes()
    source_sha256 = hashlib.sha256(source_bytes).hexdigest()
    if source_sha256 != descriptor.get("source_sha256"):
        failures.append(
            f"{registry_id}: disposition registry hash drift: "
            f"expected {descriptor.get('source_sha256')}, found {source_sha256}"
        )
    try:
        document = json.loads(source_bytes)
        records = resolve_json_pointer(document, descriptor.get("json_pointer", ""))
    except (json.JSONDecodeError, ValueError) as error:
        return supplemental, non_actionable, failures + [f"{registry_id}: registry resolution failed: {error}"], {}
    if not isinstance(records, dict):
        return supplemental, non_actionable, failures + [f"{registry_id}: resolved registry is not an object"], {}

    allowed_dispositions = {
        "reuse_canonical_command",
        "superseded_by_typed_local_ui_action",
        "retired_bakeoff_only",
        "rejected_with_reason",
    }
    disposition_counts: Counter[str] = Counter()
    canonical_targets: set[str] = set()
    typed_local_actions: set[str] = set()
    for source_token, record in records.items():
        if not isinstance(source_token, str) or not source_token.startswith("cmd.") or not ACTION_RE.fullmatch(source_token):
            failures.append(f"{registry_id}: invalid packet command token {source_token!r}")
            continue
        if not isinstance(record, dict):
            failures.append(f"{registry_id}: {source_token} disposition record is not an object")
            continue
        disposition = record.get("disposition")
        if disposition not in allowed_dispositions:
            failures.append(f"{registry_id}: {source_token} has unsupported disposition {disposition!r}")
            continue
        disposition_counts[disposition] += 1
        replacements = record.get("replacement_command_ids")
        typed_local = record.get("typed_local_ui_action_id")
        typed_schema = record.get("typed_local_payload_schema_ref")
        reason = record.get("reason")
        native_claim = record.get("native_handler_claim")
        if not isinstance(replacements, list) or any(
            not isinstance(item, str) or not item.startswith("cmd.") or not ACTION_RE.fullmatch(item)
            for item in replacements
        ):
            failures.append(f"{registry_id}: {source_token} replacement_command_ids are invalid")
            replacements = []
        if not isinstance(reason, str) or not reason.strip():
            failures.append(f"{registry_id}: {source_token} has no disposition reason")
        if native_claim is not False:
            failures.append(f"{registry_id}: {source_token} must not claim a native handler")

        if disposition == "reuse_canonical_command":
            if not replacements:
                failures.append(f"{registry_id}: {source_token} reuse has no canonical target")
            if typed_local is not None or typed_schema is not None:
                failures.append(f"{registry_id}: {source_token} reuse also declares a local action")
            canonical_targets.update(replacements)
            if source_token not in replacements:
                non_actionable.add(source_token)
        elif disposition == "superseded_by_typed_local_ui_action":
            if replacements:
                failures.append(f"{registry_id}: {source_token} local-action supersession also declares replacements")
            if not isinstance(typed_local, str) or not typed_local.startswith("settings.") or not ACTION_RE.fullmatch(typed_local):
                failures.append(f"{registry_id}: {source_token} has an invalid typed local action")
            else:
                typed_local_actions.add(typed_local)
            if not isinstance(typed_schema, str) or not typed_schema.startswith("#/"):
                failures.append(f"{registry_id}: {source_token} has no exact typed-local payload schema ref")
            non_actionable.add(source_token)
        else:
            if replacements or typed_local is not None or typed_schema is not None:
                failures.append(f"{registry_id}: {source_token} retired/rejected record admits an action")
            non_actionable.add(source_token)

    expected_counts = descriptor.get("expected_disposition_counts", {})
    if dict(disposition_counts) != expected_counts:
        failures.append(
            f"{registry_id}: disposition partition drift: expected {expected_counts}, "
            f"found {dict(sorted(disposition_counts.items()))}"
        )
    if len(records) != descriptor.get("expected_token_count"):
        failures.append(
            f"{registry_id}: token denominator drift: expected {descriptor.get('expected_token_count')}, found {len(records)}"
        )
    if len(canonical_targets) != descriptor.get("canonical_target_count"):
        failures.append(
            f"{registry_id}: canonical-target denominator drift: expected "
            f"{descriptor.get('canonical_target_count')}, found {len(canonical_targets)}"
        )
    if len(typed_local_actions) != descriptor.get("typed_local_ui_action_count"):
        failures.append(
            f"{registry_id}: typed-local denominator drift: expected "
            f"{descriptor.get('typed_local_ui_action_count')}, found {len(typed_local_actions)}"
        )

    manager_registry = document.get("manager_registry", {})
    named_projections = document.get("named_visible_state_projections", {})
    if not isinstance(manager_registry, dict):
        failures.append(f"{registry_id}: manager_registry is not an object")
        manager_registry = {}
    if not isinstance(named_projections, dict):
        failures.append(f"{registry_id}: named_visible_state_projections is not an object")
        named_projections = {}
    if len(manager_registry) != descriptor.get("manager_registry_count"):
        failures.append(
            f"{registry_id}: manager denominator drift: expected {descriptor.get('manager_registry_count')}, "
            f"found {len(manager_registry)}"
        )
    if len(named_projections) != descriptor.get("named_projection_count"):
        failures.append(
            f"{registry_id}: named-projection denominator drift: expected {descriptor.get('named_projection_count')}, "
            f"found {len(named_projections)}"
        )

    manager_actions: set[str] = set()
    for manager_key, manager in manager_registry.items():
        if not isinstance(manager, dict):
            failures.append(f"{registry_id}: manager {manager_key!r} is not an object")
            continue
        owner_actions = manager.get("owner_action_ids", [])
        if not isinstance(owner_actions, list):
            failures.append(f"{registry_id}: manager {manager_key!r} owner_action_ids is not an array")
            continue
        for action in owner_actions:
            if not isinstance(action, str) or not action.startswith("cmd.") or not ACTION_RE.fullmatch(action):
                failures.append(f"{registry_id}: manager {manager_key!r} has invalid owner action {action!r}")
            else:
                manager_actions.add(action)

    named_actions = {f"settings.manager.{key}" for key in named_projections}
    for action in canonical_targets | manager_actions:
        supplemental[action] = ("command", "blocked" if action == "cmd.artifacts.open_panel" else "partial")
    for action in typed_local_actions:
        supplemental[action] = ("ui_action", "partial")
    for action in named_actions:
        supplemental[action] = ("presentation", "partial")

    stats = {
        "registry_id": registry_id,
        "source_sha256": source_sha256,
        "token_count": len(records),
        "disposition_counts": dict(sorted(disposition_counts.items())),
        "canonical_target_count": len(canonical_targets),
        "typed_local_ui_action_count": len(typed_local_actions),
        "manager_registry_count": len(manager_registry),
        "manager_owner_action_count": len(manager_actions),
        "named_projection_count": len(named_actions),
        "required_touch_action_count": len(supplemental),
        "non_actionable_source_count": len(non_actionable),
    }
    return supplemental, non_actionable, failures, stats


def adjudication_inventory() -> tuple[
    dict[str, tuple[str, str]],
    dict[str, str],
    set[str],
    list[str],
    dict[str, Any],
]:
    """Extract the exact 171-row server-gap partition without prose scanning.

    New commands and alias source spellings become required Touch actions.
    Typed-local predecessor spellings and explicit rejections become required
    exclusions, while only each typed ``ui.*`` target becomes actionable.
    """

    failures: list[str] = []
    supplemental: dict[str, tuple[str, str]] = {}
    alias_targets: dict[str, str] = {}
    excluded_sources: set[str] = set()
    if not ADJUDICATION_PATH.is_file():
        return supplemental, alias_targets, excluded_sources, [
            f"server-gap adjudication is missing: {ADJUDICATION_PATH}"
        ], {}
    source_bytes = ADJUDICATION_PATH.read_bytes()
    source_sha256 = hashlib.sha256(source_bytes).hexdigest()
    if source_sha256 != ADJUDICATION_SHA256:
        failures.append(
            "server-gap adjudication hash drift: "
            f"expected {ADJUDICATION_SHA256}, found {source_sha256}"
        )
    try:
        document = json.loads(source_bytes)
    except json.JSONDecodeError as error:
        return supplemental, alias_targets, excluded_sources, failures + [
            f"server-gap adjudication JSON load failed: {error}"
        ], {}
    rows = document.get("rows", [])
    if not isinstance(rows, list):
        return supplemental, alias_targets, excluded_sources, failures + [
            "server-gap adjudication rows is not an array"
        ], {}

    disposition_counts: Counter[str] = Counter()
    sir_disposition_counts: Counter[str] = Counter()
    seen_tokens: set[str] = set()
    allowed = {
        "new_canonical_required",
        "approved_alias_to_exact",
        "typed_local_ui_action",
        "rejected_with_reason",
    }
    for position, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            failures.append(f"server-gap row {position} is not an object")
            continue
        token = row.get("token")
        target = row.get("proposed_exact_target")
        disposition = row.get("disposition")
        if not isinstance(token, str) or not token.startswith("cmd.") or not ACTION_RE.fullmatch(token):
            failures.append(f"server-gap row {position} has invalid command token {token!r}")
            continue
        if token in seen_tokens:
            failures.append(f"server-gap duplicate source token {token}")
        seen_tokens.add(token)
        if disposition not in allowed:
            failures.append(f"server-gap {token} has unsupported disposition {disposition!r}")
            continue
        disposition_counts[disposition] += 1
        if row.get("canonical_owner") == "Plans/Shared_Integration_Runtime.md":
            sir_disposition_counts[disposition] += 1

        if disposition == "new_canonical_required":
            if target != token:
                failures.append(f"server-gap {token}: new canonical target must equal its source token")
            supplemental[token] = ("command", "partial")
        elif disposition == "approved_alias_to_exact":
            if not isinstance(target, str) or not target.startswith("cmd.") or not ACTION_RE.fullmatch(target):
                failures.append(f"server-gap {token}: alias target is invalid: {target!r}")
                continue
            if target == token:
                failures.append(f"server-gap {token}: alias must not target itself")
            supplemental[token] = ("command_alias", "partial")
            alias_targets[token] = target
        elif disposition == "typed_local_ui_action":
            if not isinstance(target, str) or not target.startswith("ui.") or not ACTION_RE.fullmatch(target):
                failures.append(f"server-gap {token}: typed-local target is invalid: {target!r}")
                continue
            supplemental[target] = ("ui_action", "partial")
            excluded_sources.add(token)
        else:
            if not isinstance(row.get("disposition_reason"), str) or not row["disposition_reason"].strip():
                failures.append(f"server-gap {token}: rejected row has no exact reason")
            excluded_sources.add(token)

    exact_counts = {
        "approved_alias_to_exact": 43,
        "new_canonical_required": 86,
        "rejected_with_reason": 3,
        "typed_local_ui_action": 39,
    }
    exact_sir_counts = {
        "approved_alias_to_exact": 33,
        "new_canonical_required": 44,
        "typed_local_ui_action": 14,
    }
    if len(rows) != 171 or len(seen_tokens) != 171:
        failures.append(
            f"server-gap denominator drift: rows={len(rows)}, unique_tokens={len(seen_tokens)}, expected=171"
        )
    if dict(sorted(disposition_counts.items())) != exact_counts:
        failures.append(
            "server-gap disposition drift: "
            f"expected {exact_counts}, found {dict(sorted(disposition_counts.items()))}"
        )
    if dict(sorted(sir_disposition_counts.items())) != exact_sir_counts:
        failures.append(
            "SIR 44/14/33 extraction drift: "
            f"expected {exact_sir_counts}, found {dict(sorted(sir_disposition_counts.items()))}"
        )
    if len(set(alias_targets.values())) != 19:
        failures.append(
            f"server-gap alias target denominator drift: expected 19, found {len(set(alias_targets.values()))}"
        )
    if len(excluded_sources) != 42:
        failures.append(
            "server-gap typed-local/reject exclusion drift: "
            f"expected 42 (39+3), found {len(excluded_sources)}"
        )
    stats = {
        "source_sha256": source_sha256,
        "row_count": len(rows),
        "unique_token_count": len(seen_tokens),
        "disposition_counts": dict(sorted(disposition_counts.items())),
        "sir_disposition_counts": dict(sorted(sir_disposition_counts.items())),
        "alias_source_count": len(alias_targets),
        "alias_target_count": len(set(alias_targets.values())),
        "required_excluded_source_count": len(excluded_sources),
    }
    return supplemental, alias_targets, excluded_sources, failures, stats


def validate_repository_ref(ref: str) -> str | None:
    """Return a failure detail for a missing path or unresolved JSON fragment."""

    path = repository_path(ref)
    if path is None:
        return None
    if not path.exists():
        return f"references missing path {ref}"
    if path.suffix != ".json" or "#" not in ref:
        return None
    fragment = ref.split("#", 1)[1]
    try:
        resolve_json_pointer(load_json(path), fragment)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        return f"has unresolved JSON contract reference {ref}: {error}"
    return None


def verify() -> tuple[list[str], dict[str, Any]]:
    failures: list[str] = []
    try:
        schema = load_json(SCHEMA_PATH)
        registry = load_json(REGISTRY_PATH)
    except (OSError, json.JSONDecodeError) as error:
        return [f"JSON load failed: {error}"], {}

    try:
        Draft202012Validator.check_schema(schema)
    except Exception as error:  # noqa: BLE001 - preserve validator detail.
        return [f"schema is invalid: {error}"], {}
    validator = Draft202012Validator(schema)
    for error in sorted(validator.iter_errors(registry), key=lambda item: list(item.absolute_path)):
        pointer = "$" + "".join(f"[{part}]" if isinstance(part, int) else f".{part}" for part in error.absolute_path)
        failures.append(f"schema validation {pointer}: {error.message}")

    supplemental_expected: dict[str, tuple[str, str]] = {}
    non_actionable_sources: set[str] = set()
    external_registry_stats: list[dict[str, Any]] = []
    external_descriptors = registry.get("external_disposition_registries", [])
    external_ids = [
        item.get("registry_id") for item in external_descriptors if isinstance(item, dict)
    ]
    if len(external_ids) != len(set(external_ids)):
        failures.append("duplicate external disposition registry IDs")
    for descriptor in external_descriptors:
        if not isinstance(descriptor, dict):
            continue
        owner_path = repository_path(descriptor.get("owner_plan", ""))
        if owner_path is None or not owner_path.is_file():
            failures.append(
                f"{descriptor.get('registry_id')}: owner plan does not exist: {descriptor.get('owner_plan')}"
            )
        elif descriptor.get("plan_unit") not in owner_path.read_text(encoding="utf-8"):
            failures.append(
                f"{descriptor.get('registry_id')}: stale owner PlanUnit {descriptor.get('plan_unit')}"
            )
        projected, non_actionable, registry_failures, registry_stats = external_disposition_inventory(descriptor)
        failures.extend(registry_failures)
        non_actionable_sources.update(non_actionable)
        if registry_stats:
            external_registry_stats.append(registry_stats)
        for action, expectation in projected.items():
            prior = supplemental_expected.get(action)
            if prior is not None and prior != expectation:
                failures.append(
                    f"external disposition registries conflict for {action}: {prior} vs {expectation}"
                )
            supplemental_expected[action] = expectation

    (
        adjudicated_expected,
        adjudicated_alias_targets,
        adjudicated_excluded_sources,
        adjudication_failures,
        adjudication_stats,
    ) = adjudication_inventory()
    failures.extend(adjudication_failures)
    for action, expectation in adjudicated_expected.items():
        prior = supplemental_expected.get(action)
        if prior is not None and prior != expectation:
            failures.append(
                f"server-gap adjudication conflicts with external disposition inventory for {action}: "
                f"{prior} vs {expectation}"
            )
        supplemental_expected[action] = expectation

    profiles_list = registry.get("profiles", [])
    rows = registry.get("rows", [])
    profiles = {item.get("profile_id"): item for item in profiles_list if isinstance(item, dict)}
    profile_ids = [item.get("profile_id") for item in profiles_list if isinstance(item, dict)]
    if len(profile_ids) != len(set(profile_ids)):
        failures.append("duplicate profile_id values")

    touch_ids = [row[0] for row in rows if isinstance(row, list) and len(row) == 6]
    action_ids = [row[3] for row in rows if isinstance(row, list) and len(row) == 6]
    if len(touch_ids) != len(set(touch_ids)):
        failures.append("duplicate touch_id values")
    if len(action_ids) != len(set(action_ids)):
        failures.append("duplicate action_id values or competing owners")

    row_by_action = {row[3]: row for row in rows if isinstance(row, list) and len(row) == 6}
    alias_row_actions = {
        row[3] for row in rows if isinstance(row, list) and len(row) == 6 and row[2] == "command_alias"
    }
    command_row_actions = {
        row[3] for row in rows if isinstance(row, list) and len(row) == 6 and row[2] == "command"
    }
    alias_bindings = registry.get("alias_bindings", {})
    if not isinstance(alias_bindings, dict):
        failures.append("alias_bindings must be an object")
        alias_bindings = {}
    if set(alias_bindings) != alias_row_actions:
        failures.append(
            "alias_bindings/action-row coverage drift: "
            f"missing={sorted(alias_row_actions - set(alias_bindings))}, "
            f"unexpected={sorted(set(alias_bindings) - alias_row_actions)}"
        )
    if len(alias_bindings) != 64:
        failures.append(f"alias binding denominator drift: expected 64, found {len(alias_bindings)}")
    for source, binding in alias_bindings.items():
        if not isinstance(binding, dict):
            failures.append(f"{source}: alias binding is not an object")
            continue
        target = binding.get("exact_target")
        if target not in command_row_actions:
            failures.append(f"{source}: alias exact target lacks a primary command row: {target!r}")
        if source == target:
            failures.append(f"{source}: alias must not target itself")
        exact_values = {
            "availability_source": target,
            "handler_dispatch_token": target,
            "normalization_phase": "before_permission_and_dispatch",
            "source_receipt_identity": "preserve_invoked_alias_as_compatibility_source_only",
            "source_registered": False,
            "independent_handler_allowed": False,
            "independent_wiring_allowed": False,
            "domain_event_emitted_by_alias": False,
        }
        for field, expected_value in exact_values.items():
            if binding.get(field) != expected_value:
                failures.append(
                    f"{source}: alias {field} must be {expected_value!r}, found {binding.get(field)!r}"
                )
        if not isinstance(binding.get("canonical_handler_id"), str) or not binding["canonical_handler_id"].strip():
            failures.append(f"{source}: alias canonical_handler_id is empty")
    for source, target in adjudicated_alias_targets.items():
        binding = alias_bindings.get(source)
        if not isinstance(binding, dict) or binding.get("exact_target") != target:
            failures.append(
                f"{source}: adjudicated alias target must be {target}, found "
                f"{binding.get('exact_target') if isinstance(binding, dict) else None}"
            )

    production_actions: set[str] = set()
    production_handlers_by_action: dict[str, set[str]] = defaultdict(set)
    production_entry_count = 0
    if PRODUCTION_WIRING_PATH is not None:
        if not PRODUCTION_WIRING_PATH.is_file():
            failures.append(f"production wiring cross-check is missing: {PRODUCTION_WIRING_PATH}")
        else:
            try:
                production = load_json(PRODUCTION_WIRING_PATH)
                production_entries = production.get("entries", {})
                if not isinstance(production_entries, dict):
                    failures.append("production wiring entries is not an object")
                else:
                    production_entry_count = len(production_entries)
                    production_actions = {
                        entry.get("ui_command_id")
                        for entry in production_entries.values()
                        if isinstance(entry, dict) and isinstance(entry.get("ui_command_id"), str)
                    }
                    for entry in production_entries.values():
                        if not isinstance(entry, dict):
                            continue
                        command_id = entry.get("ui_command_id")
                        handler = entry.get("handler_location")
                        if isinstance(command_id, str) and isinstance(handler, str) and handler:
                            production_handlers_by_action[command_id].add(handler)
            except (OSError, json.JSONDecodeError) as error:
                failures.append(f"production wiring cross-check failed to load: {error}")
    alias_sources_with_peer_wiring = sorted(alias_row_actions & production_actions)
    if alias_sources_with_peer_wiring:
        failures.append(
            f"aliases have forbidden peer production wiring: {alias_sources_with_peer_wiring}"
        )
    alias_targets_without_wiring = sorted(
        set(adjudicated_alias_targets.values())
        - production_actions
    )
    if PRODUCTION_WIRING_PATH is not None and alias_targets_without_wiring:
        failures.append(
            f"alias exact targets lack primary production wiring: {alias_targets_without_wiring}"
        )
    blocked_command_actions = {
        row[3]
        for row in rows
        if isinstance(row, list) and len(row) == 6 and row[2] == "command" and row[4] == "blocked"
    }
    actionable_command_actions = command_row_actions - blocked_command_actions
    actionable_commands_without_wiring = sorted(actionable_command_actions - production_actions)
    if PRODUCTION_WIRING_PATH is not None and actionable_commands_without_wiring:
        failures.append(
            "actionable Touch primary commands lack production wiring: "
            f"{actionable_commands_without_wiring}"
        )
    blocked_commands_with_wiring = sorted(blocked_command_actions & production_actions)
    if blocked_commands_with_wiring:
        failures.append(
            "blocked/non-admitted Touch commands have forbidden production wiring: "
            f"{blocked_commands_with_wiring}"
        )
    competing_touch_handlers = {
        command_id: sorted(production_handlers_by_action.get(command_id, set()))
        for command_id in sorted(actionable_command_actions)
        if len(production_handlers_by_action.get(command_id, set())) != 1
    }
    if PRODUCTION_WIRING_PATH is not None and competing_touch_handlers:
        failures.append(
            "actionable Touch commands do not resolve to exactly one handler identity: "
            f"{competing_touch_handlers}"
        )
    actionable_commands_with_absent_profile_wiring = sorted(
        row[3]
        for row in rows
        if isinstance(row, list)
        and len(row) == 6
        and row[2] == "command"
        and row[4] != "blocked"
        and row[1] in profiles
        and profiles[row[1]].get("wiring_status") == "absent"
    )
    if actionable_commands_with_absent_profile_wiring:
        failures.append(
            "actionable Touch commands retain absent profile wiring status: "
            f"{actionable_commands_with_absent_profile_wiring}"
        )
    used_profiles = {row[1] for row in rows if isinstance(row, list) and len(row) == 6}
    missing_profiles = sorted(used_profiles - set(profiles))
    unused_profiles = sorted(set(profiles) - used_profiles)
    if missing_profiles:
        failures.append(f"rows reference missing profiles: {missing_profiles}")
    if unused_profiles:
        failures.append(f"handler/closure profiles without an action row: {unused_profiles}")

    try:
        expected = expected_inventory()
    except (OSError, json.JSONDecodeError, ValueError) as error:
        failures.append(f"expected inventory extraction failed: {error}")
        expected = {}
    required_actions = set(expected) | set(supplemental_expected)
    missing_actions = sorted(required_actions - set(row_by_action))
    orphan_actions = sorted(set(row_by_action) - required_actions)
    if missing_actions:
        failures.append(f"canonical controls/commands without Touch Closure rows: {missing_actions}")
    if orphan_actions:
        failures.append(f"orphan Touch Closure actions not found in the retained owner/concept inventories: {orphan_actions}")
    for action, (expected_profile, expected_kind, expected_disposition) in expected.items():
        row = row_by_action.get(action)
        if row is None:
            continue
        if row[1] != expected_profile:
            failures.append(f"{action}: profile must be {expected_profile}, found {row[1]}")
        if row[2] != expected_kind:
            failures.append(f"{action}: action_kind must be {expected_kind}, found {row[2]}")
        if row[4] != expected_disposition:
            failures.append(f"{action}: disposition must be {expected_disposition}, found {row[4]}")
    for action, (expected_kind, expected_disposition) in supplemental_expected.items():
        row = row_by_action.get(action)
        if row is None:
            continue
        if row[2] != expected_kind:
            failures.append(f"{action}: transitive action_kind must be {expected_kind}, found {row[2]}")
        if row[4] != expected_disposition:
            failures.append(
                f"{action}: transitive disposition must be {expected_disposition}, found {row[4]}"
            )
    actionable_noncanonical_sources = sorted(non_actionable_sources & set(row_by_action))
    if actionable_noncanonical_sources:
        failures.append(
            "retired, rejected, superseded, or replaced packet spellings became actionable: "
            f"{actionable_noncanonical_sources}"
        )

    for profile_id, profile in profiles.items():
        owner_ref = profile.get("owner_plan", "")
        owner_path = repository_path(owner_ref)
        if owner_path is None or not owner_path.is_file():
            failures.append(f"{profile_id}: owner_plan does not exist: {owner_ref}")
            continue
        plan_unit = profile.get("plan_unit", "")
        if plan_unit not in owner_path.read_text(encoding="utf-8"):
            failures.append(f"{profile_id}: stale PlanUnit {plan_unit} is not present in {owner_ref}")
        for field in (
            "requirement_refs",
            "reverse_consumers",
            "event_refs",
            "receipt_refs",
            "observable_work",
            "persistence_refs",
            "migration_refs",
            "test_refs",
            "evidence_refs",
        ):
            for ref in profile.get(field, []):
                detail = validate_repository_ref(ref)
                if detail is not None:
                    failures.append(f"{profile_id}: {field} {detail}")
        for field in ("dry_contract_ref", "payload_schema_ref", "result_schema_ref", "error_schema_ref"):
            ref = profile.get(field, "")
            detail = validate_repository_ref(ref)
            if detail is not None:
                failures.append(f"{profile_id}: {field} {detail}")

    for row in rows:
        if not isinstance(row, list) or len(row) != 6:
            continue
        touch_id, profile_id, kind, action, disposition, residual = row
        profile = profiles.get(profile_id, {})
        if not residual.strip():
            failures.append(f"{touch_id}: residual risk is empty")
        handler_status = profile.get("handler_status")
        wiring_status = profile.get("wiring_status")
        if kind == "command" and handler_status == "absent" and disposition not in {"blocked", "missing", "superseded"}:
            failures.append(f"{touch_id}: command without a handler route must be blocked, missing, or superseded")
        if disposition in {"implemented", "already_current_with_evidence"}:
            if handler_status not in {"implemented", "verified"}:
                failures.append(f"{touch_id}: {disposition} requires an implemented or verified handler")
            if wiring_status != "verified":
                failures.append(f"{touch_id}: {disposition} requires verified production wiring")
            evidence = " ".join(profile.get("evidence_refs", [])).lower()
            if not evidence or any(marker in evidence for marker in ("static", "concept", "only")):
                failures.append(f"{touch_id}: {disposition} requires admitted non-static runtime evidence")
        if wiring_status == "concept_simulated" and disposition in {"implemented", "already_current_with_evidence"}:
            failures.append(f"{touch_id}: concept simulation cannot be promoted to {disposition}")
        if kind == "command_alias" and disposition not in {"blocked", "superseded"}:
            handler_text = profile.get("handler_owner", "").lower()
            if not any(term in handler_text for term in ("no second handler", "normalize", "alias")):
                failures.append(f"{touch_id}: compatibility alias lacks explicit no-second-handler normalization")
        if not profile.get("reverse_consumers"):
            failures.append(f"{touch_id}: reverse wiring has no intended GUI/consumer")

    excluded = registry.get("excluded_tokens", [])
    excluded_tokens = [item.get("token") for item in excluded if isinstance(item, dict)]
    if len(excluded_tokens) != len(set(excluded_tokens)):
        failures.append("duplicate excluded token adjudications")
    expected_excluded = {
        "cmd.agent_plugin",
        "cmd.backup",
        "cmd.remote_access",
        "cmd.restore",
        "cmd.server",
        "cmd.installation.uninstall",
        "cmd.origin.review.create",
        *RETIRED_PACKET_COMMANDS,
        *REJECTED_COMMAND_CANDIDATES,
        *REPOSITORY_LOCAL_PACKET_TOKENS,
        *CONNECTION_DRAFT_LOCAL_PACKET_TOKENS,
        *adjudicated_excluded_sources,
    }
    if set(excluded_tokens) != expected_excluded:
        failures.append(
            "excluded token adjudications drifted: "
            f"missing={sorted(expected_excluded - set(excluded_tokens))}, "
            f"unexpected={sorted(set(excluded_tokens) - expected_excluded)}"
        )
    overlap = sorted(set(excluded_tokens) & set(row_by_action))
    if overlap:
        failures.append(f"excluded/negative tokens also appear as actionable rows: {overlap}")
    for item in excluded:
        token = item.get("token")
        if token in adjudicated_excluded_sources:
            adjudicated_row = next(
                (
                    row
                    for row in load_json(ADJUDICATION_PATH).get("rows", [])
                    if isinstance(row, dict) and row.get("token") == token
                ),
                {},
            )
            disposition = adjudicated_row.get("disposition")
            expected_classification = (
                "superseded_by_typed_local_ui_action"
                if disposition == "typed_local_ui_action"
                else "forbidden"
            )
            if item.get("classification") != expected_classification:
                failures.append(
                    f"excluded token {token}: {disposition} must use {expected_classification}, "
                    f"found {item.get('classification')!r}"
                )
        if item.get("token") in RETIRED_PACKET_COMMANDS and item.get("classification") != "retired_bakeoff_only":
            failures.append(
                f"excluded token {item.get('token')}: retired packet spelling must use retired_bakeoff_only"
            )
        for ref in item.get("source_refs", []):
            path = repository_path(ref)
            if path is not None and not path.exists():
                failures.append(f"excluded token {item.get('token')}: missing source path {ref}")

    if CENTRAL_MAP_PATH.is_file():
        central = load_json(CENTRAL_MAP_PATH).get("registration_candidates", {})
        map_commands = set(central.get("commands", []))
        uncovered_map_commands = sorted(map_commands - set(row_by_action) - set(excluded_tokens))
        if uncovered_map_commands:
            failures.append(f"central extraction command candidates lack row/adjudication: {uncovered_map_commands}")
        map_ui = set(central.get("typed_local_ui_actions", []))
        matrix_ui = {action for action, row in row_by_action.items() if row[2] == "ui_action"}
        missing_map_ui = sorted(map_ui - matrix_ui - STALE_CENTRAL_UI_ACTIONS)
        if missing_map_ui:
            failures.append(f"central extraction typed UI actions lack rows: {missing_map_ui}")

    kind_counts = Counter(row[2] for row in rows if isinstance(row, list) and len(row) == 6)
    disposition_counts = Counter(row[4] for row in rows if isinstance(row, list) and len(row) == 6)
    handler_counts = Counter(profiles[row[1]]["handler_status"] for row in rows if row[1] in profiles)
    wiring_counts = Counter(profiles[row[1]]["wiring_status"] for row in rows if row[1] in profiles)
    exact_resolved_denominators = {
        "row_count": 602,
        "profile_count": 91,
        "excluded_token_count": 58,
        "alias_binding_count": 64,
        "production_wiring_entry_count": 1066,
    }
    observed_resolved_denominators = {
        "row_count": len(rows),
        "profile_count": len(profiles),
        "excluded_token_count": len(excluded_tokens),
        "alias_binding_count": len(alias_bindings),
        "production_wiring_entry_count": production_entry_count,
    }
    if observed_resolved_denominators != exact_resolved_denominators:
        failures.append(
            "resolved server/Egolite closure denominator drift: "
            f"expected {exact_resolved_denominators}, found {observed_resolved_denominators}"
        )
    stats = {
        "row_count": len(rows),
        "profile_count": len(profiles),
        "excluded_token_count": len(excluded_tokens),
        "action_kind_counts": dict(sorted(kind_counts.items())),
        "disposition_counts": dict(sorted(disposition_counts.items())),
        "resolved_handler_status_counts": dict(sorted(handler_counts.items())),
        "resolved_wiring_status_counts": dict(sorted(wiring_counts.items())),
        "open_residual_count": sum(disposition_counts.get(item, 0) for item in ("partial", "blocked", "missing")),
        "external_disposition_registries": external_registry_stats,
        "server_gap_adjudication": adjudication_stats,
        "alias_binding_count": len(alias_bindings),
        "alias_target_count": len(
            {binding.get("exact_target") for binding in alias_bindings.values() if isinstance(binding, dict)}
        ),
        "alias_peer_production_wiring_count": len(alias_sources_with_peer_wiring),
        "actionable_primary_command_count": len(actionable_command_actions),
        "blocked_primary_command_count": len(blocked_command_actions),
        "actionable_primary_commands_with_production_wiring": len(actionable_command_actions & production_actions),
        "actionable_primary_commands_with_one_handler_identity": sum(
            1 for command_id in actionable_command_actions if len(production_handlers_by_action.get(command_id, set())) == 1
        ),
        "resolved_denominators": observed_resolved_denominators,
        "central_map_crosscheck": "pass" if CENTRAL_MAP_PATH.is_file() and not failures else ("not_present" if not CENTRAL_MAP_PATH.is_file() else "fail"),
    }
    return failures, stats


def main() -> int:
    global REGISTRY_PATH, SCHEMA_PATH, ADJUDICATION_PATH, PRODUCTION_WIRING_PATH, CENTRAL_MAP_PATH
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--json", action="store_true", help="emit a machine-readable result")
    parser.add_argument("--output", type=Path, help="also write the machine-readable result to this path")
    parser.add_argument("--registry", type=Path, default=REGISTRY_PATH, help="Touch Closure registry to validate")
    parser.add_argument("--schema", type=Path, default=SCHEMA_PATH, help="Touch Closure schema")
    parser.add_argument(
        "--adjudication",
        type=Path,
        default=ADJUDICATION_PATH,
        help="exact 171-row server command-gap adjudication",
    )
    parser.add_argument(
        "--production-wiring",
        type=Path,
        default=PRODUCTION_WIRING_PATH,
        help="production wiring candidate used for alias no-peer/target cross-checks",
    )
    parser.add_argument("--central-map", type=Path, default=CENTRAL_MAP_PATH)
    args = parser.parse_args()
    REGISTRY_PATH = args.registry.resolve()
    SCHEMA_PATH = args.schema.resolve()
    ADJUDICATION_PATH = args.adjudication.resolve()
    PRODUCTION_WIRING_PATH = args.production_wiring.resolve()
    CENTRAL_MAP_PATH = args.central_map.resolve()
    failures, stats = verify()
    result = {
        "schema_id": "pm.touch_closure.validation_result.v3",
        "registry_path": str(REGISTRY_PATH),
        "schema_path": str(SCHEMA_PATH),
        "adjudication_path": str(ADJUDICATION_PATH),
        "production_wiring_path": str(PRODUCTION_WIRING_PATH),
        "valid": not failures,
        "failure_count": len(failures),
        "failures": failures,
        **stats,
    }
    if args.output is not None:
        args.output.resolve().write_text(
            json.dumps(result, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
    elif failures:
        for failure in failures:
            print(f"ERROR: {failure}", file=sys.stderr)
    else:
        print(
            f"PASS: {REGISTRY_PATH} resolves {stats['row_count']} complete rows "
            f"across {stats['profile_count']} DRY closure profiles; open residuals={stats['open_residual_count']}"
        )
    return 0 if not failures else 1


if __name__ == "__main__":
    raise SystemExit(main())
