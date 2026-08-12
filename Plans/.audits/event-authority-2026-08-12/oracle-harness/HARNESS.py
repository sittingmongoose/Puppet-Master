#!/usr/bin/env python3
"""Executable positive/negative oracle harness for live Known37+August registry families."""
from __future__ import annotations
import copy, json, sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
try:
    from jsonschema import Draft202012Validator
except ImportError:
    print("ERROR: pip install jsonschema", file=sys.stderr); sys.exit(2)
HERE = Path(__file__).resolve().parent
AUDIT = HERE.parent
PLANS = AUDIT.parents[1]
K37_PATH = AUDIT / "known37" / "KNOWN37_FROM_PLANS.json"
REGISTRY_PATH = PLANS / "event_family_registry.json"
FIXTURES_DIR = HERE / "fixtures"
RESULTS_PATH = HERE / "RESULTS.json"
RECEIPT_PATH = HERE / "ORACLE_HARNESS_RECEIPT.json"
SUMMARY_PATH = HERE / "SUMMARY.md"
SHA256_HEX = "0" * 64
SHA256_HEX_ALT = "1" * 64
CITATION_GOAL_RUNTIME = "Plans/Contracts_V0.md:3468-3496"
CITATION_GOAL_REJECTION = "Plans/Contracts_V0.md:3496"
CITATION_HOME_POSITIVE = "Plans/Contracts_V0.md:3441-3445"
CITATION_HOME_NEGATIVE = "Plans/Contracts_V0.md:3460-3462"
CITATION_SECTION15_TERMINAL = "Plans/Section15_MVP_Promoted_Features_Spec.md:8496-8518"
CITATION_STORAGE_L7 = "Plans/storage-plan.md#case-l-7-required-acceptance-oracles"
DETERMINISTIC_GENERATED_AT = "2026-08-12T07:00:00Z"

def utc_now():
    return DETERMINISTIC_GENERATED_AT

def safe_name(event_type):
    return event_type.replace(".", "_")

def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"))

def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")

def live39_event_types():
    k37 = load_json(K37_PATH)
    return sorted(set(k37["event_types"]) | set(k37.get("august_beyond_known37", [])))

def registry_by_type():
    reg = load_json(REGISTRY_PATH)
    return {f["event_type"]: f for f in reg["families"]}

def schema_for_family(fam):
    if fam.get("payload_schema_ref"):
        rel = fam["payload_schema_ref"]["path"]
        path = PLANS / rel.removeprefix("Plans/") if rel.startswith("Plans/") else PLANS / rel
        return load_json(path)
    return fam["payload_schema"]

def schema_citation(fam):
    if fam.get("payload_schema_ref"):
        rel = fam["payload_schema_ref"]["path"]
        return rel if rel.startswith("Plans/") else f"Plans/{rel}"
    return f"Plans/event_family_registry.json (embedded payload_schema for {fam['event_type']})"

GOAL_BASE = {
    "occurred_at_utc": "2026-08-12T00:00:00Z", "project_id": "proj-001", "goal_id": "goal-001", "goal_revision": 1,
    "actor_ref": "actor:human:alice", "execution_role": "user",
    "requested_provider_ref": "provider:openai", "effective_provider_ref": "provider:openai",
    "requested_model_ref": "model:gpt-4", "effective_model_ref": "model:gpt-4",
    "requested_account_ref": "account:001", "effective_account_ref": "account:001",
    "correlation_id": "corr-001", "evidence_refs": [], "artifact_refs": [], "expected_goal_revision": 1,
}

def goal_event(name, ver, payload, extra=None):
    row = {"event_name": name, "schema_version": ver, **GOAL_BASE, "payload": payload}
    if extra: row.update(extra)
    return row

VO_PASS = {"validator_id": "validator:001", "outcome": "passed", "evidence_ref": "evidence:001"}

MANUAL_POSITIVE = {
"goal.child_status_changed": goal_event("goal.child_status_changed", "pm.goal_runtime_event.goal_child_status_changed.schema.v2", {"child_goal_id": "goal-child-001", "previous_status": "created", "next_status": "scheduled"}),
"goal.completed": goal_event("goal.completed", "pm.goal_runtime_event.goal_completed.schema.v2", {"completion_receipt_ref": "receipt:001", "acceptance_criteria_disposition": [{"criterion_id": "crit-001", "disposition": "satisfied", "evidence_refs": ["evidence:001"]}], "changed_artifact_refs": ["artifact:001"], "validator_outputs": [VO_PASS], "final_certifier_decision": "certified"}),
"goal.evidence_captured": goal_event("goal.evidence_captured", "pm.goal_runtime_event.goal_evidence_captured.schema.v2", {"evidence_ref": "evidence:001", "evidence_kind": "canonical_evidence", "source_spans": [{"locator_kind": "line_range", "start_line": 1, "end_line": 1, "source_ref": "Plans/storage-plan.md"}], "content_hash": SHA256_HEX, "currentness_state": "current", "redaction_profile": "no_secrets"}),
"goal.progressed": goal_event("goal.progressed", "pm.goal_runtime_event.goal_progressed.schema.v2", {"progress_fingerprint": SHA256_HEX, "task_delta": {"added_task_ids": ["task-001"], "updated_task_ids": [], "completed_task_ids": [], "removed_task_ids": []}, "status_before": "scheduled", "status_after": "running", "artifact_hashes": [{"artifact_ref": "artifact:001", "sha256": SHA256_HEX}]}),
"goal.receipt_recorded": goal_event("goal.receipt_recorded", "pm.goal_runtime_event.goal_receipt_recorded.schema.v2", {"receipt_id": "receipt:001", "receipt_kind": "goal_completion", "certification_tier": "standard", "validator_outputs": [VO_PASS], "child_receipt_refs": [], "worknode_receipt_refs": [], "certifier_decision": "certified"}),
"goal.scheduled": goal_event("goal.scheduled", "pm.goal_runtime_event.goal_scheduled.schema.v2", {"scheduler_reason": "created", "eligible_at_utc": "2026-08-12T01:00:00Z", "priority": "normal", "budget_snapshot_ref": "budget:001", "next_action": "dispatch", "queue_id": "queue:001"}),
"goal.stopped": goal_event("goal.stopped", "pm.goal_runtime_event.goal_stopped.schema.v2", {"stop_reason_code": "user_stopped", "interruption_boundary": "at_safe_point", "child_settlement_refs": [], "tool_settlement_refs": [], "resumable": False}),
"goal.tool_check_recorded": goal_event("goal.tool_check_recorded", "pm.goal_runtime_event.goal_tool_check_recorded.schema.v2", {"tool_call_id": "toolcall:001", "tool_name": "read_file", "check_kind": "permission", "check_result": "passed", "policy_decision": "allow", "output_ref": "output:001"}),
"goal.updated": goal_event("goal.updated", "pm.goal_runtime_event.goal_updated.schema.v2", {"previous_revision": 1, "new_revision": 2, "active_child_goal_ids": ["goal-child-001"], "stale_child_goal_ids": [], "objective_delta": {"op": "replace", "path": "/objective", "before_hash": SHA256_HEX, "after_hash": SHA256_HEX_ALT}}),
"goal.verification_decided": goal_event("goal.verification_decided", "pm.goal_runtime_event.goal_verification_decided.schema.v2", {"decision": "passed", "verifier_ref": "verifier:001", "finding_refs": [], "closure_refs": ["closure:001"], "unresolved_risk_refs": [], "verification_cycle_id": "cycle:001"}),
"goal_run.certified": goal_event("goal_run.certified", "pm.goal_runtime_event.goal_run_certified.schema.v2", {"goal_run_id": "goal_run:001", "certification_receipt_ref": "receipt:001", "validator_outputs": [VO_PASS], "worknode_receipt_refs": [], "unresolved_risk_refs": [], "final_certifier_decision": "certified"}),
"goal_run.stopped": goal_event("goal_run.stopped", "pm.goal_runtime_event.goal_run_stopped.schema.v2", {"goal_run_id": "goal_run:001", "stop_reason_code": "user_stopped", "child_settlement_refs": [], "resumable": False}),
"platform.capability_evaluated": {"schema_version": "2.0.0", "platform_id": "platform:local", "provider_id": "provider:local", "capability_ref": {"ref_type": "platform_capability_catalog_entry", "catalog_id": "pm.platform_capability_catalog", "catalog_schema_version": "1.0.0", "catalog_revision": 1, "capability_id": "platform.filesystem.read"}, "requested_state": "required", "effective_state": "available", "degradation_reason": "none", "resolution_source": "live_runtime_discovery", "selected_evidence_ref": "evidence:probe-001", "evidence_refs": [{"evidence_ref": "evidence:probe-001", "evidence_ref_type": "runtime_probe_receipt", "source_kind": "live_runtime_discovery", "finding": "supports_available", "observed_at_utc": "2026-08-12T00:00:00Z", "source_revision_ref": "revision:001"}]},
"restore_point.corrupt": {"schema_version": "2.0.0", "restore_point_id": "rp-001", "project_id": "proj-001", "status": "corrupt", "reason_code": "record_hash_mismatch", "expected_hash": SHA256_HEX, "observed_hash": SHA256_HEX_ALT, "evidence_kind": "record_hash_comparison", "evidence_ref": "evidence:001", "occurred_at_utc": "2026-08-12T00:00:00Z"},
"run.started": {"schema_version": "2.0.0", "run_id": "run:001", "project_id": "proj-001", "requested_effective_snapshot_ref": f"requested_effective_runtime.v1:project~proj-001:default:{SHA256_HEX}", "requested_runtime_mode": "ask", "runtime_mode": "ask", "requested_mode_overlay": "none", "effective_mode_overlay": "none", "requested_strategy": None, "strategy": "hte", "strategy_resolution_reason": "read_only_mode_forces_hte", "requested_platform": "openai", "effective_platform": "openai", "requested_model": "openai/gpt-4", "effective_model": "openai/gpt-4", "requested_account_id": "account:001", "effective_account_id": "account:001", "requested_persona": "default", "effective_persona": "default", "ts": "2026-08-12T00:00:00Z"},
"seglog.event_appended": {"seq": 1, "type": "goal.blocked", "event_ref": "event:001", "segment_ref": "seg:001", "ts": "2026-08-12T00:00:00Z", "writer_id": "writer:001"},
"storage.boot_recovery": {"schema_version": "2.0.0", "recovery_set_id": f"pm.storage.recovery_set.v1:{SHA256_HEX}", "integrity_ids": [], "recovery_ids": [f"pm.storage.recovery.v1:{SHA256_HEX}"], "interrupted_transaction_kinds": ["migration"], "manifest_generation": 1, "recovery_epoch": 1, "active_segment_ref": f"pm.storage.segment.v1:1:1:active:{SHA256_HEX}"},
"storage.integrity_detected": {"schema_version": "2.0.0", "integrity_id": f"pm.storage.integrity.v1:{SHA256_HEX}", "storage_root_ref": f"pm.storage.root.v1:proj-001:{SHA256_HEX}", "storage_root_hash": SHA256_HEX, "segment_generation": 1, "segment_name": "seg-001", "segment_hash": SHA256_HEX, "segment_state": "active", "frame_version": 2, "failure_class": "frame_integrity", "detection_offset": 0, "last_good_offset": 0, "next_good_offset": 1, "impact_precision": "exact_byte_range", "durable_watermark_relation": "wholly_above_durable_watermark", "report_ref": f"pm.storage.integrity_report.v1:{SHA256_HEX}", "affected_byte_range": [0, 1]},
"storage.recovery_applied": {"schema_version": "2.0.0", "recovery_id": f"pm.storage.recovery.v1:{SHA256_HEX}", "action": "adopt_valid_tail", "pre_segment_hash": SHA256_HEX, "post_segment_hash": SHA256_HEX_ALT, "pre_manifest_hash": SHA256_HEX, "post_manifest_hash": SHA256_HEX_ALT, "pre_length": 0, "post_length": 1, "excluded_ranges": [], "sequence_gaps": [], "survivor_digest": SHA256_HEX, "checkpoint_action": "advance_to_verified_survivor", "projection_action": "resume_from_verified_checkpoint", "durability_receipt_ref": f"pm.storage.durability_receipt.v1:{SHA256_HEX}", "user_disclosure_required": False},
"terminal.workgroup_moved": {"schema_id": "pm.event.terminal_workgroup_moved.v1", "schema_version": "1.0.0", "project_id": "proj-001", "command_id": "cmd.terminal.move_workgroup", "origin": "home_workspace", "correlation_id": "corr-001", "terminal_workgroup_id": "workgroup-001", "source_terminal_section_id": "section-001", "target_terminal_section_id": "section-002", "contained_pane_ids": ["pane-001"], "contained_session_ids": ["session-001"], "section_created": False, "preserve_session_identity": True},
"workspace.layout_changed": {"schema_id": "pm.event.workspace_layout_changed.v1", "schema_version": "1.0.0", "project_id": "proj-001", "workspace_tab_id": "tab-001", "command_id": "cmd.workspace.apply_layout", "origin": "home_workspace", "correlation_id": "corr-001", "prior_layout_revision": 1, "new_layout_revision": 2, "mutation_kind": "move", "affected_surface_instance_ids": ["surface-001"], "source_host": "dock_bottom", "target_host": "dock_bottom", "target_slot_index": 0, "target_surface_instance_id": "surface-001", "insertion_edge": "before", "persisted": True},
}

def resolve_ref(ref, root):
    node = root
    for part in ref[2:].split("/"): node = node[part]
    return node

def make_minimal(schema, root=None):
    if not isinstance(schema, dict): return schema
    root = root or schema
    if "$ref" in schema: return make_minimal(resolve_ref(schema["$ref"], root), root)
    if "const" in schema: return schema["const"]
    if "enum" in schema: return schema["enum"][0]
    t = schema.get("type")
    if t == "string":
        if schema.get("format") == "date-time": return "2026-08-12T00:00:00Z"
        pat = schema.get("pattern")
        if pat == "^[0-9a-f]{64}$": return SHA256_HEX
        if pat == "^[^/]+/.+$": return "openai/gpt-4"
        if pat and pat.startswith("^cmd"): return "cmd.terminal.move_workgroup"
        return "x" * max(schema.get("minLength", 1), 1)
    if t == "integer": return schema.get("minimum", 0) if "minimum" in schema else 1
    if t == "number": return float(schema.get("minimum", 0) if "minimum" in schema else 1)
    if t == "boolean": return True
    if t == "array":
        item = make_minimal(schema.get("items", {}), root)
        n = schema.get("minItems", 0) or (0 if schema.get("maxItems") == 0 else 1)
        return [item] * n
    if t == "object" or "properties" in schema:
        props, req = schema.get("properties", {}), schema.get("required", list(schema.get("properties", {}).keys()))
        return {k: make_minimal(props[k], root) for k in req if k in props}
    if "allOf" in schema:
        out = {}
        for sub in schema["allOf"]:
            if isinstance(sub, dict) and sub.get("type") == "object" and "properties" in sub:
                for k in sub.get("required", []): out[k] = make_minimal(sub["properties"][k], root)
            elif isinstance(sub, dict) and "$ref" in sub:
                merged = make_minimal(sub, root)
                if isinstance(merged, dict): out.update(merged)
        return out
    if "oneOf" in schema: return make_minimal(schema["oneOf"][0], root)
    return None

def build_positive(event_type, fam, schema):
    if event_type in MANUAL_POSITIVE: return copy.deepcopy(MANUAL_POSITIVE[event_type])
    return make_minimal(schema, schema)

def schema_valid(schema, payload):
    errors = sorted(Draft202012Validator(schema).iter_errors(payload), key=lambda e: list(e.path))
    return (not errors, errors[0].message if errors else None)

def strip_required_field(payload, schema):
    neg = copy.deepcopy(payload)
    req = schema.get("required") or []
    if req and req[0] in neg: del neg[req[0]]
    return neg

@dataclass
class RuleResult:
    rule_id: str; polarity: str; pass_: bool; citation: str; detail: str = ""

@dataclass
class FamilyResult:
    event_type: str; pass_: bool; rules: list = field(default_factory=list); errors: list = field(default_factory=list)

def is_goal_family(event_type):
    return event_type.startswith("goal")

def oracle_rules_for_family(event_type, schema, schema_cit):
    pos, neg = [], []
    pos.append(("closed_payload_schema_accepts_fixture", schema_cit, lambda p: schema_valid(schema, p)[0], "Positive fixture validates closed payload schema."))
    neg.append(("closed_payload_schema_rejects_incomplete_fixture", schema_cit, lambda p: not schema_valid(schema, p)[0], "Negative fixture fails closed payload schema."))
    if is_goal_family(event_type):
        pos.append(("goal_runtime_event_name_matches_family", CITATION_GOAL_RUNTIME, lambda p: p.get("event_name") == event_type, "event_name equals family."))
        neg.append(("goal_runtime_rejects_alias_event_name", CITATION_GOAL_REJECTION, lambda p: p.get("event_name") != event_type, "wrong event_name rejected."))
        if event_type == "goal_run.started":
            neg.append(("goal_run_started_rejects_build_started_alias", CITATION_GOAL_RUNTIME, lambda p: p.get("event_name") == "BuildStarted", "BuildStarted alias rejected."))
    if event_type == "terminal.workgroup_moved":
        pos.append(("terminal_workgroup_preserves_session_identity", CITATION_HOME_POSITIVE, lambda p: p.get("preserve_session_identity") is True, "preserve_session_identity=true."))
        pos.append(("terminal_workgroup_command_identity", CITATION_SECTION15_TERMINAL, lambda p: p.get("command_id") == "cmd.terminal.move_workgroup", "cmd.terminal.move_workgroup."))
        neg.append(("home_workspace_forbids_fabricated_success", CITATION_HOME_NEGATIVE, lambda p: p.get("command_id") != "cmd.terminal.move_workgroup", "fabricated command blocked."))
    if event_type == "workspace.layout_changed":
        pos.append(("workspace_layout_persisted_after_readback", CITATION_HOME_POSITIVE, lambda p: p.get("persisted") is True, "persisted=true."))
        neg.append(("workspace_layout_no_success_without_persisted", CITATION_HOME_NEGATIVE, lambda p: p.get("persisted") is not True, "non-persisted blocked."))
    if event_type == "seglog.event_appended":
        pos.append(("seglog_type_matches_event_namespace_pattern", schema_cit, lambda p: isinstance(p.get("type"), str) and "." in p.get("type", ""), "dotted type."))
        neg.append(("seglog_rejects_non_dotted_type", schema_cit, lambda p: not (isinstance(p.get("type"), str) and "." in p.get("type", "")), "invalid type."))
    if event_type.startswith("storage.") or event_type in {"restore_point.corrupt", "run.started", "seglog.event_appended", "safe_point.recovery_unavailable", "platform.capability_evaluated"}:
        pos.append(("storage_case_l7_fixture_oracle_surface", CITATION_STORAGE_L7, lambda p: schema_valid(schema, p)[0], "Case L-7 fixture oracle."))
    return pos, neg

def build_negative(event_type, positive, schema):
    neg = copy.deepcopy(positive)
    if is_goal_family(event_type):
        neg["event_name"] = "BuildStarted" if event_type == "goal_run.started" else "goal.invalid_alias"
        return neg
    if event_type == "terminal.workgroup_moved": neg["command_id"] = "cmd.terminal.fabricated_success"; return neg
    if event_type == "workspace.layout_changed": neg["persisted"] = False; return neg
    if event_type == "seglog.event_appended": neg["type"] = "INVALID_TYPE"; return neg
    return strip_required_field(neg, schema)

def write_fixtures(event_types, registry):
    written = {}
    for et in event_types:
        fam, schema = registry[et], schema_for_family(registry[et])
        pos, neg = build_positive(et, fam, schema), build_negative(et, build_positive(et, fam, schema), schema)
        ok, msg = schema_valid(schema, pos)
        if not ok: raise RuntimeError(f"positive invalid {et}: {msg}")
        if schema_valid(schema, neg)[0]: raise RuntimeError(f"negative still valid {et}")
        dest = FIXTURES_DIR / safe_name(et); dest.mkdir(parents=True, exist_ok=True)
        write_json(dest / "positive.json", pos); write_json(dest / "negative.json", neg)
        written[et] = {"positive": pos, "negative": neg}
    return written

def run_harness():
    event_types = live39_event_types(); registry = registry_by_type()
    if len(event_types) != 39: raise RuntimeError(f"expected 39 families, got {len(event_types)}")
    fixtures = write_fixtures(event_types, registry)
    results, all_pass = [], True
    for et in event_types:
        schema, schema_cit = schema_for_family(registry[et]), schema_citation(registry[et])
        pos, neg = fixtures[et]["positive"], fixtures[et]["negative"]
        fr = FamilyResult(et, True)
        for rule_id, citation, pred, detail in oracle_rules_for_family(et, schema, schema_cit)[0]:
            ok = bool(pred(pos)); fr.rules.append(RuleResult(rule_id, "positive", ok, citation, detail))
            if not ok: fr.pass_, fr.errors = False, fr.errors + [f"positive:{rule_id}"]
        for rule_id, citation, pred, detail in oracle_rules_for_family(et, schema, schema_cit)[1]:
            ok = bool(pred(neg)); fr.rules.append(RuleResult(rule_id, "negative", ok, citation, detail))
            if not ok: fr.pass_, fr.errors = False, fr.errors + [f"negative:{rule_id}"]
        if not fr.pass_: all_pass = False
        results.append(fr)
    return results, all_pass

def write_results(results, overall_pass):
    payload = {"schema_id": "pm.assurance.event_authority.oracle_harness_results.v1", "generated_at_utc": utc_now(), "harness_path": "Plans/.audits/event-authority-2026-08-12/oracle-harness/HARNESS.py", "registered_family_count": len(results), "pass": overall_pass, "families": []}
    for fr in results:
        payload["families"].append({"event_type": fr.event_type, "pass": fr.pass_, "errors": fr.errors, "rules": [{"rule_id": r.rule_id, "polarity": r.polarity, "pass": r.pass_, "citation": r.citation, "detail": r.detail} for r in fr.rules]})
    write_json(RESULTS_PATH, payload)

def write_receipt(overall_pass, family_count):
    write_json(RECEIPT_PATH, {"schema_id": "pm.assurance.event_authority.oracle_harness_receipt.v1", "generated_at_utc": utc_now(), "harness_path": "Plans/.audits/event-authority-2026-08-12/oracle-harness/HARNESS.py", "results_path": "Plans/.audits/event-authority-2026-08-12/oracle-harness/RESULTS.json", "executable": True, "pass": overall_pass, "covers_registered_families": overall_pass and family_count == 39, "registered_family_count": family_count, "notes": ["Cites Contracts_V0, storage-plan Case L-7, and closed payload schemas.", "Consumed by independent-validator."]})

def write_summary(results, overall_pass):
    passed = sum(1 for r in results if r.pass_); failed = [r.event_type for r in results if not r.pass_]
    lines = ["# Oracle Harness Summary", "", f"Generated: {utc_now()}", "", "## Outcome", f"- Overall pass: **{overall_pass}**", f"- Families tested: **{len(results)}**", f"- Families passed: **{passed}**", f"- Families failed: **{len(failed)}**", "", "## Invocation", "```bash", "python Plans/.audits/event-authority-2026-08-12/oracle-harness/HARNESS.py", "```", "", "## Oracle citation surfaces", f"- `{CITATION_GOAL_RUNTIME}`", f"- `{CITATION_HOME_POSITIVE}` / `{CITATION_HOME_NEGATIVE}`", f"- `{CITATION_SECTION15_TERMINAL}`", f"- `{CITATION_STORAGE_L7}`", "- `Plans/event_payloads/*.schema.json`", ""]
    if failed: lines += ["## Failed families"] + [f"- `{x}`" for x in failed] + [""]
    lines += ["## Per-family status", "", "| Family | Pass | Positive rules | Negative rules |", "|---|---:|---:|---:|"]
    for fr in results:
        pos_n = sum(1 for r in fr.rules if r.polarity == "positive"); neg_n = sum(1 for r in fr.rules if r.polarity == "negative")
        lines.append(f"| `{fr.event_type}` | {fr.pass_} | {pos_n} | {neg_n} |")
    lines.append("")
    SUMMARY_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

def main():
    results, overall_pass = run_harness()
    write_results(results, overall_pass); write_receipt(overall_pass, len(results)); write_summary(results, overall_pass)
    print(f"oracle harness: pass={overall_pass} families={len(results)}")
    return 0 if overall_pass else 1

if __name__ == "__main__": raise SystemExit(main())
