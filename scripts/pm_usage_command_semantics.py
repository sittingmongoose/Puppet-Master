"""Finite Usage core-selection joins. No provider, accounting or storage engine.

Production callers must supply genuine owner resolvers and fenced proof adapters.
fixture_dependencies is explicitly synthetic and grants no native authority.
"""
from copy import deepcopy
from datetime import datetime
from functools import lru_cache
import hashlib
import json
import os
from pathlib import Path
import sys

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource

ROOT = Path(__file__).resolve().parents[1]
CANON = Path(os.environ.get("PM_CANON_ROOT", ROOT))
sys.path.insert(0, str(CANON / "scripts"))
from pm_full_thread_semantics import full_thread_semantic_failures, command_outcome_binding_failures
from pm_ui_command_response import owner_result_digest, replay_failures

SCHEMA = "usage_command_contracts.schema.json"


@lru_cache(maxsize=1)
def schemas():
    docs = {}
    for filename in (SCHEMA, "full_thread_runtime_contracts.schema.json",
                     "shared_runtime_command_contracts.schema.json", "ui_command_response.schema.json"):
        docs[filename] = json.loads(((ROOT if filename == SCHEMA else CANON) / "Plans" / filename).read_text())
    registry = Registry().with_resources((d["$id"], Resource.from_contents(d)) for d in docs.values())
    return docs, registry


def shape(definition, value, filename=SCHEMA):
    docs, registry = schemas()
    schema = docs[filename]
    selected = schema if definition is None else {"$ref": schema["$id"] + "#/$defs/" + definition}
    return [e.message for e in Draft202012Validator(selected, registry=registry,
                                                  format_checker=FormatChecker()).iter_errors(value)]


def instant(value):
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def projection_failures(projection):
    q, failures = projection["query"], []
    start, end = instant(q["interval_start"]), instant(q["interval_end"])
    if (end - start).total_seconds() != {"5h":18000, "24h":86400, "7d":604800, "30d":2592000}[q["time_range"]]:
        failures.append("query_interval")
    ids, dedupe = [], []
    for row in projection["rows"]:
        ids.append(row["usage_record_id"]); dedupe.append(row["dedupe_key"])
        if row["server_id"] != q["server_id"] or row["project_id"] != q["project_id"]:
            failures.append("row_scope")
        if not start <= instant(row["observed_at_utc"]) < end:
            failures.append("row_interval")
        if q["filter_kind"] == "provider" and row["provider_id"] != q["provider_id"]:
            failures.append("row_provider")
        if q["filter_kind"] in ("work", "personal") and row["account_scope"] != q["filter_kind"]:
            failures.append("row_account_scope")
        for bucket in row["token_buckets"].values():
            if bucket["value"] is not None and (bucket["unit"] != "tokens" or type(bucket["value"]) is not int):
                failures.append("token_unit_or_count")
        for field, unit in (("cost_microdollars", "microdollars"), ("cost_minor_units", "minor_units")):
            quantity = row["cost"][field]
            if quantity["value"] is not None and (type(quantity["value"]) is not int or quantity["unit"] != unit):
                failures.append("cost_unit_or_count")
        if row["cost"]["cost_minor_units"]["value"] is not None and row["cost"]["currency"] is None:
            failures.append("minor_units_currency_missing")
        for entry in row["cost"]["per_bucket_costs"]:
            amount = entry["amount"]
            if amount["value"] is not None:
                if type(amount["value"]) is not int or amount["unit"] not in ("microdollars", "minor_units"):
                    failures.append("bucket_cost_unit_or_count")
                if amount["unit"] == "minor_units" and row["cost"]["currency"] is None:
                    failures.append("minor_units_currency_missing")
                if row["cost"]["cost_status"] in ("hidden_byok", "hidden_subscription", "unknown"):
                    failures.append("hidden_or_unknown_bucket_cost")
        if row["cost"]["cost_status"] in ("hidden_byok", "hidden_subscription", "unknown"):
            if any(row["cost"][k]["value"] is not None for k in ("cost_microdollars", "cost_minor_units")):
                failures.append("hidden_or_unknown_cost")
    if len(set(ids)) != len(ids) or len(set(dedupe)) != len(dedupe):
        failures.append("duplicate_usage")
    return failures


def result_route(command):
    return {"path":"Plans/" + SCHEMA,
            "json_pointer":"#/$defs/usage_" + ("refresh" if command == "cmd.usage.refresh" else "export") + "_result",
            "schema_id":"pm.usage.command_result.v1"}


def validate_usage_result(request_ref, result_ref, response_ref, *, resolve_record,
                          verify_original_admission, verify_permission, verify_sources,
                          verify_delivery, check_current_disclosure, canonical_owner_digest):
    return _validate_usage_result(request_ref, result_ref, response_ref,
        resolve_record=resolve_record, verify_original_admission=verify_original_admission,
        verify_permission=verify_permission, verify_sources=verify_sources,
        verify_delivery=verify_delivery, check_current_disclosure=check_current_disclosure,
        canonical_owner_digest=canonical_owner_digest,
        contract_shape=lambda definition, value, filename=None: shape(definition, value, filename or SCHEMA),
        contract_projection_failures=projection_failures, contract_result_route=result_route,
        contract_export_profile="usage_core_selection.v1")


def _validate_usage_result(request_ref, result_ref, response_ref, *, resolve_record,
                          verify_original_admission, verify_permission, verify_sources,
                          verify_delivery, check_current_disclosure, canonical_owner_digest,
                          contract_shape, contract_projection_failures, contract_result_route,
                          contract_export_profile):
    """Resolve complete original records; every proof callback is mandatory.

    Callbacks return a list of failure strings, never an allowed/verified boolean.
    Native adapters must span actual source/currentness/disclosure fences; this
    finite pure oracle cannot establish atomic native issuance or delivery.
    """
    shape, projection_failures, result_route = contract_shape, contract_projection_failures, contract_result_route
    failures, snapshots = [], []
    def resolve(kind, ref, definition, filename=None):
        value = resolve_record(kind, ref)
        if shape(definition, value, filename):
            raise ValueError("resolved_shape:" + kind)
        snapshots.append((value, deepcopy(value)))
        return value
    def proof(name, fn, *args):
        value = fn(*args)
        if type(value) is not list or not all(type(x) is str for x in value):
            failures.append(name + "_invalid_proof")
        else:
            failures.extend(name + ":" + x for x in value)
        if any(value != frozen for value, frozen in snapshots):
            failures.append("helper_changed_original")
    def digest(value):
        # The real CV-333 codec handles its full admitted numeric domain.
        # The repository's integer-only fixture oracle is not that native codec.
        result = canonical_owner_digest(value)
        if shape("sha256", result): raise ValueError("owner_digest_invalid")
        return result
    try:
        request = resolve("request", request_ref, "request")
        result = resolve("result", result_ref, "result")
        before = resolve("projection", request["projection_ref"], "projection")
        outcome = resolve("outcome", result["command_outcome_ref"], "CommandOutcomeRecord",
                          "full_thread_runtime_contracts.schema.json")
        response = resolve("response", response_ref, None, "ui_command_response.schema.json")
        if request["request_ref"] != request_ref or result["request"] != request:
            failures.append("original_request")
        if before["projection_ref"] != request["projection_ref"] or before["owner_revision"] != request["projection_revision"] or before["query"] != request["query"]:
            failures.append("original_projection_query")
        q, ident = request["query"], request["identity"]
        for field in ("scope_kind", "server_id", "project_id"):
            if q[field] != ident[field]: failures.append("request_scope_" + field)
        if ident.get("command_instance_id") != request["command_instance_id"]:
            failures.append("request_instance")
        failures.extend(projection_failures(before))
        for field in ("identity", "command_id", "command_instance_id", "caller"):
            if result[field] != request[field]: failures.append("result_original_" + field)
        if result["operation_id"] != ident["operation_id"]: failures.append("result_operation")
        projection = result["projection"]
        if projection is not None:
            actual = resolve("projection", projection["projection_ref"], "projection")
            if projection != actual or projection["query"] != q: failures.append("resolved_projection")
            failures.extend(projection_failures(actual))
        export = request["command_id"] == "cmd.usage.export"
        output_bytes = None
        if export:
            if result["route_outcomes"]: failures.append("export_route_effect")
            if projection is not None and projection != before: failures.append("export_changed_projection")
            output = result["output"]
            if result["status"] == "succeeded" and (output is None or projection is None):
                failures.append("export_no_output")
            if output is not None:
                actual_output = resolve("output", output["artifact_ref"], "output")
                if actual_output != output: failures.append("output_original")
                output_bytes = resolve_record("output_bytes", output["artifact_ref"])
                if type(output_bytes) is not bytes: raise ValueError("output_bytes_missing")
                frozen_bytes = bytes(output_bytes)
                if hashlib.sha256(output_bytes).hexdigest() != output["content_sha256"] or len(output_bytes) != output["byte_length"]:
                    failures.append("output_bytes_binding")
                def pairs(items):
                    d = {}
                    for k, v in items:
                        if k in d: raise ValueError("duplicate_json_key")
                        d[k] = v
                    return d
                parsed = json.loads(output_bytes, object_pairs_hook=pairs,
                                    parse_constant=lambda x: (_ for _ in ()).throw(ValueError("nonfinite_json")))
                if shape("export_view", parsed): failures.append("output_view_shape")
                if parsed != output["view"]: failures.append("output_view_bytes")
                expected = {"profile":contract_export_profile, "export_scope":request["export_scope"],
                            "query":q, "projection_ref":before["projection_ref"],
                            "projection_revision":before["owner_revision"], "freshness":before["freshness"],
                            "health":before["health"], "rows":before["rows"]}
                if output["view"] != expected: failures.append("export_selection_or_rows")
                if output_bytes != frozen_bytes: failures.append("output_bytes_changed")
        else:
            if result["output"] is not None: failures.append("refresh_export_effect")
            routes = [r["route_ref"] for r in result["route_outcomes"]]
            if len(set(routes)) != len(routes) or set(routes) != set(request["provider_route_refs"]):
                failures.append("refresh_route_selection")
            if result["status"] == "succeeded" and (projection is None or any(r["status"] != "completed" for r in result["route_outcomes"])):
                failures.append("refresh_not_completed")
            if projection is not None and projection != before and any(r["status"] != "completed" for r in result["route_outcomes"]) and projection["freshness"] == "current" and projection["health"] == "healthy":
                failures.append("failed_refresh_claims_fresh_health")
        failures.extend(full_thread_semantic_failures("CommandOutcomeRecord", outcome))
        failures.extend(command_outcome_binding_failures(result, outcome, result["command_outcome_ref"]))
        if outcome["identity"] != ident or outcome["payload_sha256"] != digest(request) or outcome["idempotency_key"] != request["idempotency_key"] or outcome["target_generation"] != ident["operation_generation"]:
            failures.append("outcome_request")
        if outcome["owner_result_ref"] != result_ref or outcome["owner_result_schema_ref"] != result_route(request["command_id"]) or outcome["owner_result_sha256"] != digest(result) or outcome["outcome"] != result["status"]:
            failures.append("outcome_result")
        if outcome["error_ref"] != result["error_ref"] or (result["status"] == "succeeded" and result["error_ref"] is not None):
            failures.append("outcome_error")
        failures.extend(command_outcome_binding_failures(response, outcome, result["command_outcome_ref"]))
        for field, expected in {"request_ref":request_ref,"command_id":request["command_id"],
                                "command_instance_id":request["command_instance_id"],"owner_identity":ident,
                                "owner_result_ref":result_ref,"owner_result_schema_ref":result_route(request["command_id"]),
                                "response_kind":"owner_operation","event_refs":[]}.items():
            if response[field] != expected: failures.append("response_" + field)
        expected_status = {"succeeded":"succeeded","failed":"failed","cancelled":"cancelled",
                           "rejected":None,"terminal_unknown":"recovery_required"}[result["status"]]
        if response["result_status"] != expected_status or response["receipt_ref"] != outcome["result_receipt_ref"]:
            failures.append("response_terminal")
        if response["ack_status"] != ("rejected" if result["status"] == "rejected" else "accepted"):
            failures.append("response_acknowledgement")
        original_response = None
        if response["replayed"]:
            original_response = resolve("response", response["original_dispatch_id"], None, "ui_command_response.schema.json")
        failures.extend(replay_failures(response, original_response))
        proof("admission", verify_original_admission, request, before)
        proof("permission", verify_permission, request, result)
        proof("sources", verify_sources, request, before, result)
        proof("delivery", verify_delivery, request, result, output_bytes)
        proof("disclosure", check_current_disclosure, request, result, response)
    except (ValueError, KeyError, TypeError, UnicodeError, OverflowError) as exc:
        failures.append("owner_resolution_or_codec:" + type(exc).__name__)
    if any(value != frozen for value, frozen in snapshots): failures.append("helper_changed_original")
    return sorted(set(failures))


def fixture_dependencies(value):
    """Synthetic static adapter, never production trust or native proof."""
    def resolve(kind, ref):
        if kind == "request" and ref == value["request"]["request_ref"]: return value["request"]
        if kind == "result" and ref == "fixture:result": return value["result"]
        if kind == "outcome" and ref == value["result"]["command_outcome_ref"]: return value["outcome"]
        if kind == "response" and ref == "fixture:response": return value["response"]
        if kind == "projection":
            for p in (value["before"], value["result"]["projection"]):
                if p is not None and p["projection_ref"] == ref: return p
        output = value["result"]["output"]
        if output is not None and ref == output["artifact_ref"]:
            if kind == "output": return output
            if kind == "output_bytes": return value["output_json"].encode("utf-8")
        raise ValueError("fixture_lookup_missing")
    return {"resolve_record":resolve, "canonical_owner_digest":owner_result_digest, **{name:(lambda *args:[]) for name in (
        "verify_original_admission","verify_permission","verify_sources","verify_delivery","check_current_disclosure")}}


def usage_command_semantic_failures(definition, value):
    if definition != "usage_command_fixture": return []
    if shape(definition, value): return ["fixture_shape"]
    return validate_usage_result(value["request"]["request_ref"], "fixture:result", "fixture:response",
                                 **fixture_dependencies(value))
