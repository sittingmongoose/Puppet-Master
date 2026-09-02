#!/usr/bin/env python3
"""Validate canonical PMConcept7 Usage/shared GUI fixtures and event boundaries."""
from __future__ import annotations

import argparse
import copy
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
USAGE_ROOT = ROOT / "tests/fixtures/usage_gui"
SHARED_ROOT = ROOT / "tests/fixtures/pm7_shared"
USAGE_MATRIX = USAGE_ROOT / "golden/usage_gui_acceptance_fixtures.json"
EVENT_SCHEMA = ROOT / "Plans/event_payloads/workspace_layout_changed.schema.json"
EVENT_REGISTRY = ROOT / "Plans/event_family_registry.json"
WIRING_MATRIX = ROOT / "Plans/Wiring_Matrix.production.json"
COMMAND_FIXTURES = ROOT / "Plans/shared_runtime_command_contract_fixtures.json"
HOME_LAYOUT_SCHEMA = ROOT / "Plans/home_workspace_layout.schema.json"

EXPECTED_USAGE_IDS = {
    "GUI-USG-001", "GUI-USG-002", "GUI-USG-003", "GUI-USG-004",
    "GUI-USG-005", "GUI-USG-006", "GUI-USG-007", "GUI-USG-008",
    "GUI-CBP-001", "GUI-CBP-002", "GUI-ROUTE-001", "GUI-RAW-001", "GUI-RAP-001",
}
EXPECTED_USAGE_FILE_COUNT = 20
EXPECTED_SHARED_FILES = {
    "surface_inventory.json", "assistant_context_continuity.json",
    "home_workspace_transaction.json", "status_bar_contract.json",
    "theme_surface_matrix.json", "motion_frame_matrix.json",
    "workspace_layout_event_fixtures.json",
}
FORBIDDEN_COMPACTION_EVENT_PREFIX = "context.compaction."
EXPECTED_STATUS_BAR_INVENTORY = [
    "workspace", "orchestrator", "index", "ports", "branch", "sync"
]
EXPECTED_ASSISTANT_CONTINUITY_FIELDS = [
    "active_thread_id", "transcript_revision", "draft_revision",
    "attachment_set_revision", "activity_revision", "detail_drawer_node_id",
    "detail_drawer_selected_tab", "detail_drawer_scroll_position",
    "focused_element_id",
]
EXPECTED_ASSISTANT_DRAWER_PRESERVE = [
    "detail_drawer_node_id", "detail_drawer_selected_tab",
    "detail_drawer_scroll_position", "focused_element_id",
]
EXPECTED_USAGE_ROOMS = [
    "Overview", "Plans & limits", "Costs", "Accounts", "Free models",
    "Context", "Analytics", "Ledger", "Attention", "Prompt cache",
    "Tools", "Signals", "Source authority",
]
EXPECTED_DESKTOP_WIDTHS = [1440, 1180, 980, 860, 680]
EXPECTED_USAGE_LAYOUT_FIELDS = [
    "layout_schema_version", "default_set_version", "host_id", "room_id",
    "widget_id", "visible", "order_index", "slot_id", "geometry_id",
    "semantic_tier_id", "preset_id", "configuration_refs",
    "committed_revision",
]
EXPECTED_USAGE_LAYOUT_FORBIDDEN_FIELDS = [
    "preview_rect", "pointer_id", "pointer_coordinates", "ghost",
    "placeholder", "animation_state", "draft", "frame_draft",
]
EXPECTED_USAGE_LAYOUT_FIELD_CONTRACT = {
    "layout_schema_version": "integer>=1",
    "default_set_version": "non_empty_string",
    "host_id": "const:usage",
    "room_id": "non_empty_stable_string",
    "widget_id": "non_empty_stable_string",
    "visible": "boolean",
    "order_index": "integer>=0",
    "slot_id": "non_empty_stable_string|null",
    "geometry_id": "non_empty_supported_geometry_string",
    "semantic_tier_id": "non_empty_supported_tier_string",
    "preset_id": "non_empty_supported_preset_string|null",
    "configuration_refs": "sorted_unique_non_secret_string_array",
    "committed_revision": "integer>=0",
}
EXPECTED_WORKSPACE_EVENT_INVALIDS = {
    "preview_state_forbidden", "settled_only_required", "persisted_required",
    "result_ref_required", "receipt_ref_required", "project_id_required",
    "new_layout_revision_required", "mutation_kind_is_closed",
    "target_host_is_closed", "semantic_size_preset_is_closed",
    "layout_revision_must_advance", "workspace_command_family_required",
    "exactly_one_receipt_required",
}
EXPECTED_TINY_CHART_FAMILIES = [
    {
        "kind": "instrument_activity",
        "default_series_label": "Recent activity",
        "series_source": "instrument.options.bars",
    },
    {
        "kind": "summary_signal",
        "default_series_label": "Window trend",
        "series_source": "summary.options.bars",
    },
    {
        "kind": "chart_panel",
        "default_series_label": "Recent trend",
        "series_source": "chartPanel.values",
    },
]
EXPECTED_TINY_CHART_CASE_IDS = {
    "instrument_recent_activity_12",
    "summary_window_trend_12",
    "chart_panel_daily_charge_index_24",
    "short_series_all_labels_5",
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def patch(base: dict[str, Any], changes: dict[str, Any]) -> dict[str, Any]:
    value = copy.deepcopy(base)
    for key, child in changes.items():
        value[key] = child
    return value


def workspace_event_semantic_failures(value: dict[str, Any]) -> list[str]:
    failures: list[str] = []
    prior = value.get("prior_layout_revision")
    new = value.get("new_layout_revision")
    if not isinstance(prior, int) or not isinstance(new, int) or new <= prior:
        failures.append("new_layout_revision_must_advance")
    return failures


def compact_chart_value(value: int) -> str:
    if value >= 1_000_000:
        return f"{int(value / 100_000 + 0.5) / 10:g}m"
    if value >= 1_000:
        return f"{int(value / 100 + 0.5) / 10:g}k"
    return str(value)


def expected_chart_label_indices(count: int) -> list[int]:
    return list(range(count))


def expected_chart_accessible_name(label: str, series: list[int]) -> str:
    latest = series[-1] if series else 0
    peak = max([1, *series])
    summary = f"Latest {compact_chart_value(latest)}"
    if peak != latest:
        summary += f" · peak {compact_chart_value(peak)}"
    return f"{label}, values {', '.join(str(value) for value in series)}; {summary}"


def validate() -> dict[str, Any]:
    failures: list[dict[str, Any]] = []
    usage_files = sorted(p for p in USAGE_ROOT.rglob("*") if p.is_file()) if USAGE_ROOT.exists() else []
    shared_files = sorted(p for p in SHARED_ROOT.iterdir() if p.is_file()) if SHARED_ROOT.exists() else []
    if len(usage_files) != EXPECTED_USAGE_FILE_COUNT:
        failures.append({"error": "usage_fixture_file_count", "expected": EXPECTED_USAGE_FILE_COUNT, "actual": len(usage_files)})
    if {p.name for p in shared_files} != EXPECTED_SHARED_FILES:
        failures.append({"error": "shared_fixture_file_set", "expected": sorted(EXPECTED_SHARED_FILES), "actual": sorted(p.name for p in shared_files)})

    matrix = load(USAGE_MATRIX) if USAGE_MATRIX.exists() else {}
    if matrix.get("schema_id") != "pm.usage_gui.acceptance_fixture_matrix.v1" or matrix.get("owner_plan_unit") != "UF-088":
        failures.append({"error": "usage_matrix_owner_or_schema"})
    rows = matrix.get("fixtures", []) if isinstance(matrix.get("fixtures"), list) else []
    ids = [row.get("fixture_id") for row in rows if isinstance(row, dict)]
    if set(ids) != EXPECTED_USAGE_IDS or len(ids) != len(EXPECTED_USAGE_IDS):
        failures.append({"error": "usage_fixture_ids", "expected": sorted(EXPECTED_USAGE_IDS), "actual": ids})
    for row in rows:
        fixture_id = row.get("fixture_id")
        case_path = USAGE_ROOT / "cases" / f"{fixture_id}.json"
        if not case_path.exists():
            failures.append({"error": "missing_usage_case", "fixture_id": fixture_id})
            continue
        case = load(case_path)
        for key in ("surfaces", "source_lineage", "must", "must_not"):
            if not isinstance(row.get(key), list) or not row[key]:
                failures.append({"error": "usage_row_list", "fixture_id": fixture_id, "field": key})
            if case.get(key) != row.get(key):
                failures.append({"error": "usage_case_matrix_drift", "fixture_id": fixture_id, "field": key})

    presentation = {p.name: load(p) for p in (USAGE_ROOT / "presentation").glob("*.json")}
    if len(presentation) != 6:
        failures.append({"error": "usage_presentation_matrix_count", "actual": len(presentation)})
    for name, obj in presentation.items():
        for key in ("owner_plan_units", "source_lineage", "surfaces", "must", "must_not"):
            if not isinstance(obj.get(key), list) or not obj[key]:
                failures.append({"error": "usage_presentation_list", "path": name, "field": key})
    rooms = presentation.get("room_disclosure_matrix.json", {}).get("rooms", [])
    if rooms != EXPECTED_USAGE_ROOMS:
        failures.append({"error": "usage_room_inventory", "expected": EXPECTED_USAGE_ROOMS, "actual": rooms})
    if presentation.get("room_disclosure_matrix.json", {}).get("disclosure_levels") != ["At a glance", "Detailed", "Diagnostics"]:
        failures.append({"error": "usage_disclosure_labels"})
    room_contract = presentation.get("room_disclosure_matrix.json", {})
    required_room_must = {
        "provider_setup_required_exact_state",
        "provider_setup_preserves_operation_and_continuation_identity",
        "provider_setup_cta:cmd.settings.bloom.open:ai:ai.accounts.provider-connections",
        "scope_filters_timestamped_identity_bound_records",
        "range_filters_timestamped_identity_bound_records",
    }
    if not required_room_must.issubset(set(room_contract.get("must", []))):
        failures.append({"error": "usage_room_contract_missing", "missing": sorted(required_room_must - set(room_contract.get("must", [])))})
    required_room_must_not = {
        "provider_setup_auto_install", "provider_setup_auto_authenticate",
        "provider_setup_silent_cross_route",
    }
    if not required_room_must_not.issubset(set(room_contract.get("must_not", []))):
        failures.append({"error": "usage_room_negative_contract_missing", "missing": sorted(required_room_must_not - set(room_contract.get("must_not", [])))})
    widget_content_contract = presentation.get("widget_content_tiers.json", {})
    if widget_content_contract.get("policy") != "complete_or_hidden":
        failures.append({"error": "complete_or_hidden_policy_missing"})
    tiny_chart_contract = widget_content_contract.get("tiny_chart_label_contract", {})
    if tiny_chart_contract.get("painted_label_count_rule") != "exactly_one_visible_label_per_painted_bar_including_zero":
        failures.append({"error": "tiny_chart_every_bar_label_count_rule"})
    if tiny_chart_contract.get("render_families") != EXPECTED_TINY_CHART_FAMILIES:
        failures.append({"error": "tiny_chart_render_families"})
    tiny_chart_cases = tiny_chart_contract.get("cases", [])
    actual_chart_case_ids = {
        case.get("case_id") for case in tiny_chart_cases if isinstance(case, dict)
    }
    if actual_chart_case_ids != EXPECTED_TINY_CHART_CASE_IDS or len(tiny_chart_cases) != len(EXPECTED_TINY_CHART_CASE_IDS):
        failures.append({
            "error": "tiny_chart_case_inventory",
            "expected": sorted(EXPECTED_TINY_CHART_CASE_IDS),
            "actual": sorted(case_id for case_id in actual_chart_case_ids if isinstance(case_id, str)),
        })
    for case in tiny_chart_cases:
        if not isinstance(case, dict):
            failures.append({"error": "tiny_chart_case_shape"})
            continue
        series = case.get("ordered_series")
        if not isinstance(series, list) or not series or any(not isinstance(value, int) or value < 0 for value in series):
            failures.append({"error": "tiny_chart_series_shape", "case_id": case.get("case_id")})
            continue
        expected_indices = expected_chart_label_indices(len(series))
        if case.get("expected_painted_indices") != expected_indices:
            failures.append({
                "error": "tiny_chart_complete_painted_indices",
                "case_id": case.get("case_id"),
                "expected": expected_indices,
                "actual": case.get("expected_painted_indices"),
            })
        expected_accessible_name = expected_chart_accessible_name(case.get("series_label", ""), series)
        if case.get("expected_accessible_name") != expected_accessible_name:
            failures.append({
                "error": "tiny_chart_complete_accessible_series",
                "case_id": case.get("case_id"),
                "expected": expected_accessible_name,
                "actual": case.get("expected_accessible_name"),
            })
    if presentation.get("theme_width_matrix.json", {}).get("desktop_widths_css_px") != EXPECTED_DESKTOP_WIDTHS:
        failures.append({"error": "desktop_width_matrix", "expected": EXPECTED_DESKTOP_WIDTHS})
    if presentation.get("persistence_migration_matrix.json", {}).get("state_families") != ["room", "detail", "range", "scope", "more", "hidden", "layout", "order"]:
        failures.append({"error": "usage_state_families"})
    persistence_contract = presentation.get("persistence_migration_matrix.json", {})
    if persistence_contract.get("usage_widget_layout_record_required_fields") != EXPECTED_USAGE_LAYOUT_FIELDS:
        failures.append({"error": "usage_widget_layout_record_required_fields"})
    if persistence_contract.get("usage_widget_layout_record_field_contract") != EXPECTED_USAGE_LAYOUT_FIELD_CONTRACT:
        failures.append({"error": "usage_widget_layout_record_field_contract"})
    if persistence_contract.get("usage_widget_layout_record_forbidden_fields") != EXPECTED_USAGE_LAYOUT_FORBIDDEN_FIELDS:
        failures.append({"error": "usage_widget_layout_record_forbidden_fields"})
    interaction_contract = presentation.get("interaction_transaction_matrix.json", {})
    if interaction_contract.get("schema_id") != "pm.usage_gui.interaction_transaction_matrix.v1":
        failures.append({"error": "usage_interaction_transaction_schema_id"})
    interaction_must = set(interaction_contract.get("must", []))
    required_interaction_must = {
        "keyboard_pickup_move_drop", "truthful_aria_grabbed",
        "stable_two_dimensional_same_footprint_candidates",
        "empty_cavity_and_lower_row_targets",
        "ghost_top_left_candidate_anchor_with_geometric_hysteresis",
        "keyboard_visible_picked_card_outline_without_required_pointer_clone",
        "usage_pointer_resize_placeholder_tracks_last_painted_supported_footprint",
        "usage_pointer_resize_preview_visibly_repacks_only_obstructed_peers",
        "usage_pointer_resize_preview_keeps_peer_nodes_mounted_and_painted",
        "obstructing_usage_pointer_resize_peers_repack_during_preview_and_match_accepted_settlement",
    }
    if not required_interaction_must.issubset(interaction_must):
        failures.append({
            "error": "usage_reorder_contract_missing",
            "missing": sorted(required_interaction_must - interaction_must),
        })
    interaction_must_not = set(interaction_contract.get("must_not", []))
    if "no_change_board_settlement_or_remount" not in interaction_must_not:
        failures.append({"error": "usage_no_change_settlement_contract_missing"})
    retired_resize_tokens = {
        "resize_preview_frozen_peer_geometry",
        "obstructing_resize_peers_repack_only_at_settlement",
    }
    if retired_resize_tokens & interaction_must:
        failures.append({
            "error": "retired_usage_resize_preview_contract_present",
            "tokens": sorted(retired_resize_tokens & interaction_must),
        })
    required_resize_must_not = {
        "usage_pointer_resize_preview_unobstructed_peer_displacement",
        "usage_pointer_resize_preview_settlement_topology_mismatch",
    }
    if not required_resize_must_not.issubset(interaction_must_not):
        failures.append({
            "error": "usage_resize_preview_negative_contract_missing",
            "missing": sorted(required_resize_must_not - interaction_must_not),
        })
    persistence_must = set(persistence_contract.get("must", []))
    required_persistence_must = {
        "pm7:usage:prototype:workspace:v12:demo_only_noncanonical_lineage",
        "pm7:usage:prototype:workspace:v11:one_time_prior_envelope_import",
        "pm7:usage:v10:bounded_legacy_import_when_no_valid_envelope",
    }
    if not required_persistence_must.issubset(persistence_must):
        failures.append({
            "error": "usage_demo_lineage_contract_missing",
            "missing": sorted(required_persistence_must - persistence_must),
        })

    for path in shared_files:
        obj = load(path)
        for key in ("owner_plan_units", "source_lineage", "surfaces"):
            if not isinstance(obj.get(key), list) or not obj[key]:
                failures.append({"error": "shared_fixture_list", "path": path.name, "field": key})
        if path.name != "workspace_layout_event_fixtures.json":
            for key in ("must", "must_not"):
                if not isinstance(obj.get(key), list) or not obj[key]:
                    failures.append({"error": "shared_assertion_list", "path": path.name, "field": key})

    motion_contract = load(SHARED_ROOT / "motion_frame_matrix.json")
    if motion_contract.get("schema_id") != "pm.pm7.motion_frame_matrix.v1":
        failures.append({"error": "pm7_motion_frame_schema_id"})
    required_motion_must = {
        "usage_pointer_resize_peers_visibly_repack_only_when_obstructed_during_preview",
        "usage_pointer_resize_preview_matches_accepted_settlement_topology",
        "dashboard_resize_peers_frozen_during_preview",
    }
    motion_must = set(motion_contract.get("must", []))
    if not required_motion_must.issubset(motion_must):
        failures.append({
            "error": "pm7_resize_motion_contract_missing",
            "missing": sorted(required_motion_must - motion_must),
        })
    if "resize_peers_frozen_during_preview" in motion_must:
        failures.append({"error": "retired_generic_resize_motion_contract_present"})

    shared_widths = load(SHARED_ROOT / "theme_surface_matrix.json").get("desktop_widths_css_px")
    if shared_widths != EXPECTED_DESKTOP_WIDTHS:
        failures.append({"error": "shared_desktop_width_matrix", "expected": EXPECTED_DESKTOP_WIDTHS, "actual": shared_widths})
    home_transaction = load(SHARED_ROOT / "home_workspace_transaction.json")
    if home_transaction.get("schema_id") != "pm.pm7.home_workspace_transaction_fixture.v1":
        failures.append({"error": "pm7_home_workspace_transaction_schema_id"})
    legacy_size = home_transaction.get("legacy_size_migration", {})
    source_size = legacy_size.get("source_shape", {})
    normalized_size = legacy_size.get("normalized_current_shape", {})
    if (
        legacy_size.get("normalization_rule") != "pre_field_cross_basis_px_copies_basis_px_before_current_schema_validation"
        or "cross_basis_px" in source_size
        or normalized_size.get("cross_basis_px") != source_size.get("basis_px")
    ):
        failures.append({"error": "home_cross_basis_legacy_migration_fixture"})
    required_home_must = {
        "cross_basis_px_required_after_normalization",
        "preset_id_closed_to_compact_standard_wide_tall_focus",
        "dashboard_resize_frozen_peer_geometry",
    }
    home_must = set(home_transaction.get("must", []))
    if not required_home_must.issubset(home_must):
        failures.append({"error": "home_size_and_resize_contract_missing", "missing": sorted(required_home_must - home_must)})
    live_dashboard_resize_tokens = sorted(
        token for token in home_must | motion_must
        if "dashboard" in token and "resize" in token
        and any(word in token for word in ("live", "repack", "displace"))
    )
    if live_dashboard_resize_tokens:
        failures.append({"error": "live_dashboard_resize_preview_contract_forbidden", "tokens": live_dashboard_resize_tokens})
    home_schema = load(HOME_LAYOUT_SCHEMA)
    Draft202012Validator.check_schema(home_schema)
    home_size_def = home_schema.get("$defs", {}).get("size", {})
    if "cross_basis_px" not in home_size_def.get("required", []):
        failures.append({"error": "home_cross_basis_not_required"})
    preset_enum = home_size_def.get("properties", {}).get("preset_id", {}).get("enum")
    if preset_enum != ["compact", "standard", "wide", "tall", "focus"]:
        failures.append({"error": "home_preset_id_enum", "actual": preset_enum})

    assistant_context = load(SHARED_ROOT / "assistant_context_continuity.json")
    expected_continuity_state = {
        "preserved_fields": EXPECTED_ASSISTANT_CONTINUITY_FIELDS,
        "failed_reseat_restores": "prior_committed_seat",
        "stale_reseat_restores": "prior_committed_seat",
    }
    if assistant_context.get("continuity_state") != expected_continuity_state:
        failures.append({
            "error": "assistant_context_continuity_state",
            "expected": expected_continuity_state,
            "actual": assistant_context.get("continuity_state"),
        })
    expected_compact_now = {
        "command_id": "cmd.chat.compact_context",
        "command_result_count": 1,
        "receipt_count": 1,
        "event_types": [],
        "ring_revision_changed": True,
        "detail_revision_matches_ring": True,
        "preserve": EXPECTED_ASSISTANT_DRAWER_PRESERVE,
    }
    if assistant_context.get("open_detail_drawer_compact_now") != expected_compact_now:
        failures.append({
            "error": "assistant_open_detail_drawer_compact_now",
            "expected": expected_compact_now,
            "actual": assistant_context.get("open_detail_drawer_compact_now"),
        })

    status_bar = load(SHARED_ROOT / "status_bar_contract.json")
    if status_bar.get("inventory") != EXPECTED_STATUS_BAR_INVENTORY:
        failures.append({
            "error": "status_bar_inventory",
            "expected": EXPECTED_STATUS_BAR_INVENTORY,
            "actual": status_bar.get("inventory"),
        })
    if "full_width" not in status_bar.get("must", []):
        failures.append({"error": "status_bar_full_width_missing"})
    forbidden_status_items = {"notification_item", "bell_item"}
    actual_status_exclusions = set(status_bar.get("must_not", []))
    if not forbidden_status_items.issubset(actual_status_exclusions):
        failures.append({
            "error": "status_bar_notification_exclusions",
            "expected": sorted(forbidden_status_items),
            "actual": sorted(actual_status_exclusions),
        })

    event_schema = load(EVENT_SCHEMA)
    Draft202012Validator.check_schema(event_schema)
    workspace_command_enum = event_schema.get("properties", {}).get("command_id", {}).get("enum", [])
    wiring_entries = load(WIRING_MATRIX).get("entries", {})
    workspace_event_producers = sorted({
        entry.get("ui_command_id")
        for entry in wiring_entries.values()
        if isinstance(entry, dict)
        and "workspace.layout_changed" in entry.get("expected_event_types", [])
    })
    if workspace_command_enum != workspace_event_producers:
        failures.append({
            "error": "workspace_event_command_producer_drift",
            "schema_command_ids": workspace_command_enum,
            "wiring_command_ids": workspace_event_producers,
        })
    event_validator = Draft202012Validator(event_schema, format_checker=FormatChecker())
    event_fixtures = load(SHARED_ROOT / "workspace_layout_event_fixtures.json")
    valid_events = event_fixtures.get("valid", [])
    for index, event in enumerate(valid_events):
        errors = [e.message for e in event_validator.iter_errors(event)] + workspace_event_semantic_failures(event)
        if errors:
            failures.append({"error": "valid_workspace_event_rejected", "index": index, "messages": errors})
    for item in event_fixtures.get("invalid", []):
        candidate = patch(valid_events[item["base_valid"]], item.get("patch", {}))
        for key in item.get("remove", []):
            candidate.pop(key, None)
        if not list(event_validator.iter_errors(candidate)) and not workspace_event_semantic_failures(candidate):
            failures.append({"error": "invalid_workspace_event_accepted", "name": item.get("name")})
    event_invalid_names = {item.get("name") for item in event_fixtures.get("invalid", [])}
    if not EXPECTED_WORKSPACE_EVENT_INVALIDS.issubset(event_invalid_names):
        failures.append({"error": "missing_workspace_event_invalid_fixtures", "missing": sorted(EXPECTED_WORKSPACE_EVENT_INVALIDS - event_invalid_names)})

    registry = load(EVENT_REGISTRY)
    workspace_families = [f for f in registry.get("families", []) if f.get("event_type") == "workspace.layout_changed"]
    compaction = [
        f.get("event_type") for f in registry.get("families", [])
        if isinstance(f.get("event_type"), str)
        and f["event_type"].startswith(FORBIDDEN_COMPACTION_EVENT_PREFIX)
    ]
    if len(workspace_families) != 1:
        failures.append({"error": "workspace_event_family_count", "actual": len(workspace_families)})
    elif workspace_families[0].get("payload_schema_id") != event_schema.get("$id"):
        failures.append({"error": "workspace_event_schema_registry_mismatch"})
    if compaction:
        failures.append({"error": "forbidden_context_compaction_event_family", "events": compaction})

    command_fixtures = load(COMMAND_FIXTURES)
    valid_names = {x.get("name") for x in command_fixtures.get("valid", [])}
    invalid_names = {x.get("name") for x in command_fixtures.get("invalid", [])}
    required_valid = {
        "pm7_preview_is_local", "pm7_commit_changed_once",
        "pm7_usage_widget_commit_changed_once_without_workspace_event",
        "pm7_cancel_rolls_back", "pm7_no_change_release_is_silent",
        "pm7_context_compaction_started_result_receipt_without_event",
        "pm7_context_compaction_already_running_result_receipt_without_event",
        "pm7_context_compaction_cancelled_result_receipt_without_event",
        "pm7_context_compaction_no_op_result_receipt_without_event",
        "pm7_context_compaction_degraded_result_receipt_without_event",
        "pm7_context_compaction_unavailable_result_receipt_without_event",
        "pm7_context_compaction_retry_scheduled_result_receipt_without_event",
        "pm7_context_compaction_result_receipt_without_event",
        "pm7_context_compaction_failed_result_receipt_without_event",
    }
    required_invalid = {
        "pm7_preview_cannot_dispatch", "pm7_cancel_cannot_persist",
        "pm7_no_change_cannot_emit_event", "pm7_commit_cannot_double_dispatch",
        "pm7_changed_commit_requires_one_receipt",
        "pm7_changed_commit_requires_workspace_layout_event",
        "pm7_usage_widget_commit_cannot_emit_workspace_event",
        "pm7_commit_cannot_claim_unchanged",
        "pm7_error_phase_not_admitted",
        "pm7_context_compaction_cannot_fabricate_event",
    }
    if not required_valid.issubset(valid_names):
        failures.append({"error": "missing_pm7_valid_command_fixtures", "missing": sorted(required_valid - valid_names)})
    if not required_invalid.issubset(invalid_names):
        failures.append({"error": "missing_pm7_invalid_command_fixtures", "missing": sorted(required_invalid - invalid_names)})

    command_validator = subprocess.run(
        [sys.executable, "scripts/pm-shared-runtime-command-contracts.py", "validate"],
        cwd=ROOT, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    if command_validator.returncode != 0:
        failures.append({"error": "shared_runtime_command_contract_validator_failed", "output": command_validator.stdout[-4000:]})

    return {
        "schema_id": "pm.pm7_gui_fixture_validation.v1",
        "status": "pass" if not failures else "fail",
        "usage_fixture_file_count": len(usage_files),
        "usage_fixture_count": len(rows),
        "shared_fixture_file_count": len(shared_files),
        "workspace_event_valid_count": len(valid_events),
        "context_compaction_event_family_count": len(compaction),
        "failures": failures,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", nargs="?", choices=("validate",), default="validate")
    parser.parse_args()
    report = validate()
    print(json.dumps(report, indent=2, sort_keys=True))
    return 0 if report["status"] == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
