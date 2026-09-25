"""DL-098 Usage Ledger selection companion. Static recompute oracle only.

Recomputes the conjunctive recorded-filter match, literal display-only search,
time/tokens/cost ordering (newest-or-largest-first initial order with an
allowed oldest-or-smallest-first user-selected reverse, unknowns last and
stable record-identity ties in both directions), requested-vs-effective
selection, page honesty, and exact Selected versus all-matching Filtered
export from the fixture's recorded rows, then checks
request/result/central-input binding. No dispatcher, provider, accounting,
quota, retention, or native proof; recorded rows are fixture evidence input,
never runtime storage.
"""
from copy import deepcopy
from datetime import datetime
from functools import cmp_to_key, lru_cache
import json
from pathlib import Path

from jsonschema import Draft202012Validator
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = "usage_ledger_query_contracts.schema.json"
PROFILE = "usage_ledger_selection.v1"

RANGE_SECONDS = {"5h": 18000, "24h": 86400, "7d": 604800, "30d": 2592000}

# DL-098 closed filter axes: query field -> recorded row field.
AXES = (
    ("project_ids", "project_id"),
    ("provider_ids", "provider_id"),
    ("account_refs", "provider_account_ref"),
    ("model_ids", "model_id"),
    ("run_ids", "run_id"),
    ("thread_ids", "thread_id"),
    ("event_types", "event_type"),
)


@lru_cache(maxsize=1)
def document():
    return json.loads((ROOT / "Plans" / SCHEMA).read_text())


@lru_cache(maxsize=1)
def registry():
    doc = document()
    return Registry().with_resource(doc["$id"], Resource.from_contents(doc))


def shape(definition, value):
    doc = document()
    selected = doc if definition is None else {"$ref": doc["$id"] + "#/$defs/" + definition}
    return [e.message for e in Draft202012Validator(selected, registry=registry()).iter_errors(value)]


def instant(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def search_corpus(row):
    """Displayed labels and identifiers only. Admin notes and secret refs are never searchable."""
    corpus = list(row["displayed_labels"]) + [
        row["usage_record_id"], row["event_type"], row["provider_id"],
        row["model_id"], row["run_id"], row["attempt_id"],
    ]
    for key in ("project_id", "provider_account_ref", "thread_id"):
        if row[key] is not None:
            corpus.append(row[key])
    return corpus


def excluded_texts(row):
    texts = []
    for key in ("non_displayed_admin_note", "redacted_secret_ref"):
        if row.get(key) is not None:
            texts.append(row[key])
    return texts


def in_scope_and_interval(row, query):
    if row["server_id"] != query["server_id"] or row["project_id"] != query["project_id"]:
        return False
    start, end = instant(query["interval_start"]), instant(query["interval_end"])
    return start <= instant(row["observed_at_utc"]) < end


def selected_filters(query):
    return {field: set(query["filters"][axis]) for axis, field in AXES if query["filters"].get(axis)}


def matches_filters(row, selected):
    for field, values in selected.items():
        if row[field] is None or row[field] not in values:
            return False
    return True


def matches_search(row, search):
    if search is None:
        return True
    needle = search["text"].lower()
    return any(needle in text.lower() for text in search_corpus(row))


def expected_matches(recorded_rows, query):
    selected = selected_filters(query)
    return [row for row in recorded_rows
            if in_scope_and_interval(row, query)
            and matches_filters(row, selected)
            and matches_search(row, query["search"])]


def sort_known_value(row, key):
    if key == "time":
        return True, instant(row["observed_at_utc"])
    quantity = row["token_total"] if key == "tokens" else row["cost_microdollars"]
    if quantity["value"] is None:
        return False, None
    return True, quantity["value"]


def expected_order(matched_rows, sort):
    key = sort["key"]
    reverse = sort["order"] == "oldest_or_smallest_first"

    def compare(left, right):
        left_known, left_value = sort_known_value(left, key)
        right_known, right_value = sort_known_value(right, key)
        if left_known != right_known:
            return -1 if left_known else 1
        if not left_known:
            pass
        elif left_value != right_value:
            if reverse:
                return -1 if left_value < right_value else 1
            return -1 if left_value > right_value else 1
        left_id, right_id = left["usage_record_id"], right["usage_record_id"]
        return (left_id > right_id) - (left_id < right_id)

    return sorted(matched_rows, key=cmp_to_key(compare))


def quantity_failures(row):
    failures = []
    tokens = row["token_total"]
    if tokens["value"] is not None:
        if type(tokens["value"]) is not int or tokens["unit"] != "tokens":
            failures.append("token_unit_or_count")
    elif tokens["state"] in ("reported", "estimated"):
        failures.append("token_unit_or_count")
    money = row["cost_microdollars"]
    if money["value"] is not None:
        if type(money["value"]) is not int or money["unit"] != "microdollars":
            failures.append("cost_unit_or_count")
        if row["currency"] is None:
            failures.append("cost_currency_missing")
    elif money["state"] in ("reported", "estimated"):
        failures.append("cost_unit_or_count")
    if money["state"] in ("unknown", "not_exposed", "disabled", "hidden") and money["value"] is not None:
        failures.append("cost_unit_or_count")
    return failures


def validate_fixture(value):
    """Pure recompute over fixture evidence; no callbacks, no mutation of inputs."""
    failures = []
    try:
        request, result = value["request"], value["result"]
        query, rows = request["query"], value["recorded_rows"]
        central = value["central_input"]
        by_id = {row["usage_record_id"]: row for row in rows}
        if len(by_id) != len(rows):
            failures.append("duplicate_recorded_identity")

        start, end = instant(query["interval_start"]), instant(query["interval_end"])
        if (end - start).total_seconds() != RANGE_SECONDS[query["time_range"]]:
            failures.append("query_interval")

        admitted = [row for row in rows if in_scope_and_interval(row, query)]
        for axis, field in AXES:
            recorded = {row[field] for row in admitted if row[field] is not None}
            for selected in query["filters"].get(axis, []):
                if selected not in recorded:
                    failures.append("filter_value_not_recorded")

        matched = expected_matches(rows, query)
        matched_ids = {row["usage_record_id"] for row in matched}
        if set(result["matched_record_ids"]) != matched_ids:
            failures.append("nonconjunctive_match")
        if any(rid not in by_id for rid in result["matched_record_ids"] + result["ordered_record_ids"]):
            failures.append("unknown_record_identity")
        if any(rid not in matched_ids for rid in result["ordered_record_ids"]):
            failures.append("ordered_not_matched")

        if query["search"] is not None:
            needle = query["search"]["text"].lower()
            for rid in result["matched_record_ids"]:
                row = by_id.get(rid)
                if row is None:
                    continue
                if (any(needle in text.lower() for text in search_corpus(row))
                        or not any(needle in text.lower() for text in excluded_texts(row))):
                    continue
                failures.append("search_excluded_field_match")

        ordered = expected_order(matched, query["sort"])
        ordered_ids = [row["usage_record_id"] for row in ordered]
        if result["ordered_record_ids"] != ordered_ids:
            failures.append("sort_order_wrong")
            claimed = [by_id[rid] for rid in result["ordered_record_ids"] if rid in matched_ids]
            seen_unknown = False
            for row in claimed:
                known = sort_known_value(row, query["sort"]["key"])[0]
                if not known:
                    seen_unknown = True
                elif seen_unknown:
                    failures.append("sort_unknowns_first")
                    break
            position = {rid: index for index, rid in enumerate(result["ordered_record_ids"])}
            for left, right in zip(ordered, ordered[1:]):
                key = query["sort"]["key"]
                left_known, left_value = sort_known_value(left, key)
                right_known, right_value = sort_known_value(right, key)
                if left_known != right_known or left_value != right_value:
                    continue
                lpos, rpos = position.get(left["usage_record_id"]), position.get(right["usage_record_id"])
                if lpos is not None and rpos is not None and lpos > rpos:
                    failures.append("sort_unstable_ties")
                    break

        selection = result["selection"]
        if selection["requested_record_ids"] != query["requested_record_ids"]:
            failures.append("selection_requested_substituted")
        expected_effective = [rid for rid in ordered_ids if rid in set(query["requested_record_ids"])]
        if selection["effective_record_ids"] != expected_effective:
            failures.append("selection_effective_mismatch")

        for row in rows:
            failures.extend(quantity_failures(row))
            provenance = row["identity_provenance"]
            if provenance["run_identity"] == "invented" or provenance["event_identity"] == "invented":
                failures.append("invented_run_or_event_identity")
            if provenance["run_identity"] == "legacy_guess" or provenance["event_identity"] == "legacy_guess":
                failures.append("legacy_identity_guess")

        if query["owner_revision"] != value["recorded_owner_revision"]:
            failures.append("stale_query_revision")
        if result["freshness"] == "current" and query["owner_revision"] != value["recorded_owner_revision"]:
            failures.append("stale_currentness_claim")
        if result["applied_query"] != query:
            failures.append("stale_applied_query")

        if result["request"] != request:
            failures.append("result_request_mismatch")
        for field in ("command_id", "command_instance_id", "caller"):
            if result[field] != request[field]:
                failures.append("result_request_mismatch")

        export_command = request["command_id"] == "cmd.usage.export"
        succeeded = result["status"] == "succeeded"
        if not export_command and result["export"] is not None:
            failures.append("refresh_export_effect")
        if export_command and succeeded and result["export"] is None:
            failures.append("export_no_output")
        if result["status"] in ("failed", "cancelled") and result["export"] is not None:
            failures.append("terminal_export_present")
        if result["status"] == "rejected":
            if (result["matched_record_ids"] or result["ordered_record_ids"]
                    or selection["effective_record_ids"] or result["export"] is not None
                    or result["page"] is not None):
                failures.append("rejected_result_not_empty")

        export = result["export"]
        if export is not None:
            if not export_command or export["mode"] != request["export_mode"]:
                failures.append("export_mode_mismatch")
            if export["total_match_count"] != len(ordered_ids):
                failures.append("export_total_mismatch")
            if export["drawn_viewport_row_count"] > export["total_match_count"]:
                failures.append("viewport_dishonest")
            export_ids = [row["usage_record_id"] for row in export["rows"]]
            if export["mode"] == "selected" and export_ids != selection["effective_record_ids"]:
                failures.append("export_selected_identity")
            if export["mode"] == "filtered" and export_ids != ordered_ids:
                failures.append("export_filtered_truncated")
                if len(export["rows"]) == export["drawn_viewport_row_count"] < export["total_match_count"]:
                    failures.append("export_viewport_dump")
            for row in export["rows"]:
                failures.extend(quantity_failures(row))
                if by_id.get(row["usage_record_id"]) != row:
                    failures.append("export_row_not_recorded")

        page = result["page"]
        if succeeded and page is None:
            failures.append("page_missing")
        if page is not None:
            total = len(ordered_ids)
            if page["total_match_count"] != total or page["offset"] + page["returned_count"] > total:
                failures.append("page_dishonest")
            if page["returned_count"] > page["limit"]:
                failures.append("page_dishonest")
            remaining = max(0, total - page["offset"])
            if page["returned_count"] != min(page["limit"], remaining):
                failures.append("page_dishonest")

        if succeeded:
            if result["error_ref"] is not None or result["result_receipt_ref"] is None:
                failures.append("receipt_error_binding")
        elif result["error_ref"] is None or result["result_receipt_ref"] is not None:
            failures.append("receipt_error_binding")

        for field in ("command_id", "command_instance_id", "request_ref"):
            if central[field] != request[field]:
                failures.append("central_request_mismatch")
        for field in ("scope_kind", "server_id", "project_id"):
            if central["owner_identity"][field] != query[field]:
                failures.append("central_request_mismatch")
        if central["caller"] != request["caller"]:
            failures.append("caller_substitution")
        if central["caller"]["caller_context_ref"] == value["current_panel_context_ref"]:
            failures.append("current_panel_substitution")
        if central["error_ref"] != result["error_ref"]:
            failures.append("owner_error_ref_mismatch")
        if central["ui_error"] is not None and result["status"] != "cancelled":
            failures.append("ui_error_without_cancellation")
        if central["central_dispatch"]["status"] != "static_note_only":
            failures.append("static_note_dispatch_claimed")
        if central["replayed"]:
            if central["original_dispatch_id"] is None:
                failures.append("replay_original_dispatch_missing")
            if central["original_effective_record_ids"] is None or central["original_export_row_ids"] is None:
                failures.append("replay_missing_original")
            else:
                if central["original_effective_record_ids"] != selection["effective_record_ids"]:
                    failures.append("replay_second_export")
                current_export_ids = [row["usage_record_id"] for row in export["rows"]] if export else []
                if central["original_export_row_ids"] != current_export_ids:
                    failures.append("replay_second_export")
    except (KeyError, TypeError, ValueError, OverflowError) as exc:
        failures.append("fixture_resolution:" + type(exc).__name__)
    return sorted(set(failures))


def usage_ledger_query_semantic_failures(definition, value):
    if definition != "ledger_query_fixture":
        return []
    if shape(definition, value):
        return ["fixture_shape"]
    frozen = deepcopy(value)
    failures = validate_fixture(value)
    if value != frozen:
        failures.append("validator_changed_fixture")
    return sorted(set(failures))
