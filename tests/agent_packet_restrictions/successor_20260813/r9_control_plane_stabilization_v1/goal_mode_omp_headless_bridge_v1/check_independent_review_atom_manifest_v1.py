#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import stat
import sys
from pathlib import Path
from typing import Any, Callable


SCHEMA = "pw-r9-goal-mode-omp-atomic-bridge-independent-review-atom-manifest-v1"
STATUS = "PREDECLARED_NINE_BITE_SIZE_GOAL_REVIEW_ATOMS_NOT_EXECUTED_ZERO_CREDIT_NO_LAUNCH"
ATOM_ID = re.compile(r"^bridge-review:[a-z-]+:atom-[0-9]{3}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
OUTPUT = '"PASS" or {"first_mismatch":"<brief>"}'
LIMITS = {
    "acceptance_criterion_max_utf8_bytes": 256,
    "evidence_slice_max_utf8_bytes": 256,
    "goal_objective_max_utf8_bytes": 256,
    "output_contract_max_utf8_bytes": 128,
    "prompt_max_utf8_bytes": 512,
}
AUTHORITY = {
    "bridge_install": False,
    "canary_launch": False,
    "headless_handoff": False,
    "independent_review_complete": False,
    "matrix_launch": False,
    "omp_process_launch": False,
    "qualification_credit": 0,
    "qualification_streak_clean_matrices": 0,
    "subject_launch": False,
}
POLICY = {
    "every_atom_has_one_acceptance_criterion": True,
    "every_atom_has_one_evidence_slice": True,
    "every_atom_has_one_fresh_native_goal": True,
    "every_atom_has_one_operation": True,
    "every_atom_has_one_output_contract": True,
    "every_atom_has_one_subject_prompt": True,
    "no_subject_prompt_before_native_goal_activation": True,
    "reviewer_receives_no_full_bridge_or_campaign_prompt": True,
    "short_but_compound_rejected": True,
}
REDUCER = {
    "create_only_after_all_nine_terminal_receipts": True,
    "fail_cannot_be_reinterpreted": True,
    "fresh_native_goal_required": True,
    "input_only_compact_verified_atom_outputs": True,
    "reducer_predeclared_now": False,
}
BINDINGS = [
    ("bridge_contract_v3.json", "6d94cfd2b1d2ffba621b6249fe2c4b8a831b3a774e388a8132f0588c7dc401d6", 7845),
    ("bridge_checker_v3.py", "d823a185fc97b1d3286cdeb65aea3ccb766cd0362230a717f422da57287a7c4c", 35637),
    ("omp_acp_native_goal_bridge_v3.patch", "1e025c1329bd6505704e24ff6e55cd122efc8ac5f9c8aaf03797085f5283dad0", 37994),
    ("r9_goal_mode_omp_headless_native_atomic_bridge_implementation_receipt_v3.json", "3ac81222b30f8e6b74f0460f03240937d62175989a31d45fd4dbe7ef0d578396", 5618),
    ("../r9_goal_mode_omp_atomic_headless_migration_addendum_v1.json", "ac9712e7f48aa7d497f0b515688c9fa4a78c5fcc484f73799af3ef7eddced156", 6728),
]
DEFS = [
    ("activation-order", "VERIFY_GOAL_ACTIVATION_ORDER", "Verify that native Goal activation precedes the only subject prompt.", "PASS only if Goal creation and ACTIVE state precede prompt release.", '{"activation":"goalRuntime.createGoal","active_phase":"ACTIVE","pre_activation_subject_bytes":0}', "Decide only whether Goal activation precedes the one subject prompt.", ["/bridge/phases/1", "/invariants/activation_native_call", "/invariants/model_prompt_before_active_goal", "/invariants/prompt_count_exact"], "record.session.goalRuntime.createGoal({ objective })"),
    ("subject-binding", "VERIFY_SUBJECT_PREBINDING", "Verify the subject byte identity and 512-byte ceiling are prebound.", "PASS only if subject SHA-256 and byte count are bound before Goal creation and bytes are at most 512.", '{"before_goal":true,"subject_identity":["sha256","utf8_bytes"],"subject_utf8_bytes_max":512}', "Decide only whether the subject identity and 512-byte ceiling are prebound.", ["/atomization/bridge_enforced/subject_utf8_bytes_max", "/atomization/bridge_enforced/subject_utf8_identity_prebound_before_goal_activation", "/invariants/exact_subject_hash_and_bytes_bound_before_goal_creation"], "subjectUtf8Sha256"),
    ("objective-binding", "VERIFY_OBJECTIVE_PREBINDING", "Verify the native Goal objective identity and 256-byte ceiling are prebound.", "PASS only if objective SHA-256 and byte count are bound before Goal creation and bytes are at most 256.", '{"before_goal":true,"objective_identity":["sha256","utf8_bytes"],"objective_utf8_bytes_max":256}', "Decide only whether the objective identity and 256-byte ceiling are prebound.", ["/atomization/bridge_enforced/goal_objective_utf8_bytes_max", "/invariants/exact_goal_objective_hash_and_bytes_bound_before_goal_creation"], "goalObjectiveUtf8Sha256"),
    ("criterion-binding", "VERIFY_CRITERION_PREBINDING", "Verify the acceptance criterion identity and 256-byte ceiling are prebound.", "PASS only if criterion SHA-256 and byte count are bound before Goal creation and bytes are at most 256.", '{"before_goal":true,"criterion_identity":["sha256","utf8_bytes"],"criterion_utf8_bytes_max":256}', "Decide only whether the criterion identity and 256-byte ceiling are prebound.", ["/atomization/bridge_enforced/acceptance_criterion_identity_prebound_before_goal_activation", "/atomization/bridge_enforced/acceptance_criterion_utf8_bytes_max", "/invariants/exact_acceptance_criterion_hash_and_bytes_bound_before_goal_creation"], "acceptanceCriterionUtf8Sha256"),
    ("output-binding", "VERIFY_OUTPUT_PREBINDING", "Verify the output contract identity and 128-byte ceiling are prebound.", "PASS only if output SHA-256 and byte count are bound before Goal creation and bytes are at most 128.", '{"before_goal":true,"output_identity":["sha256","utf8_bytes"],"output_utf8_bytes_max":128}', "Decide only whether the output identity and 128-byte ceiling are prebound.", ["/atomization/bridge_enforced/output_contract_identity_prebound_before_goal_activation", "/atomization/bridge_enforced/output_contract_utf8_bytes_max", "/invariants/exact_output_contract_hash_and_bytes_bound_before_goal_creation"], "outputContractUtf8Sha256"),
    ("manifest-control-binding", "VERIFY_MANIFEST_CONTROL_PREBINDING", "Verify atom-manifest and control identities are prebound before Goal creation.", "PASS only if both SHA-256 identities are fixed before native Goal creation.", '{"atom_manifest_sha256_prebound":true,"control_sha256_prebound":true}', "Decide only whether the manifest and control identities are prebound.", ["/bridge/activation_request_exact_fields", "/invariants/atom_manifest_sha256_bound_before_goal_creation"], "controlSha256"),
    ("continuation", "VERIFY_NO_HIDDEN_CONTINUATION", "Verify the ACP lane cannot schedule a hidden extra model turn.", "PASS only if ACP omits InteractiveMode continuation and the subject prompt count is exactly one.", '{"acp_instantiates_interactive_mode":false,"goal_on_agent_end_schedules_turn":false,"prompt_count_exact":1}', "Decide only whether a hidden extra model turn can occur.", ["/invariants/acp_transport_does_not_instantiate_interactive_mode", "/invariants/goal_runtime_on_agent_end_schedules_no_continuation", "/invariants/prompt_count_exact"], 'bridge.phase = "PROMPT_CONSUMED"'),
    ("terminal", "VERIFY_TERMINAL_RECONCILIATION", "Verify terminal settlement requires native Goal completion and forbids reuse.", "PASS only if settlement requires completed Goal, records mode none and goal-completed, and consumes the session.", '{"goal_complete_required":true,"records":["mode_change:none","goal-completed"],"reuse":false,"settle_model_calls":0}', "Decide only whether terminal settlement proves Goal completion and no reuse.", ["/invariants/native_goal_complete_required_before_settle", "/invariants/settle_model_calls", "/invariants/terminal_records_exact"], "goalCompletedRecord"),
    ("windows-custody", "VERIFY_WINDOWS_OWNER_CUSTODY", "Verify headless OMP preserves the Windows owner and cannot overlap the original lane.", "PASS only if both argv use P:\\ under the same owner and headless starts only after original-lane quiescence.", '{"headless":["omp","--cwd","P:\\\\","acp"],"host":"WINDOWS","original":["omp","--cwd","P:\\\\"],"overlap":false,"owner":"SAME_CONTROLLING_WINDOWS_TASK"}', "Decide only whether the headless option preserves owner custody without overlap.", ["/launch/cwd", "/launch/handoff", "/launch/headless_argv", "/launch/host", "/launch/original_boundary_argv", "/launch/use_existing_controlling_lane_only"], None),
]


class Invalid(Exception):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise Invalid(message)


def pairs(items: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in items:
        if key in out:
            raise Invalid(f"duplicate key:{key}")
        out[key] = value
    return out


def load_json(path: Path) -> tuple[bytes, dict[str, Any]]:
    raw = path.read_bytes()
    require(raw.endswith(b"\n") and not raw.endswith(b"\n\n"), f"one terminal LF:{path}")
    require(b"\r" not in raw, f"no CR:{path}")
    try:
        value = json.loads(raw, object_pairs_hook=pairs, parse_constant=lambda token: (_ for _ in ()).throw(Invalid(f"nonfinite:{token}")))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"JSON:{path}:{exc}") from exc
    require(isinstance(value, dict), f"object:{path}")
    return raw, value


def canonical(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, allow_nan=False, sort_keys=True, separators=(",", ":")).encode("utf-8") + b"\n"


def identity(value: str, expected_bytes: Any, expected_sha: Any, label: str, maximum: int) -> None:
    require(isinstance(value, str) and value != "", f"string:{label}")
    raw = value.encode("utf-8")
    require(expected_bytes == len(raw), f"bytes:{label}")
    require(isinstance(expected_sha, str) and SHA256.fullmatch(expected_sha) is not None, f"sha shape:{label}")
    require(expected_sha == hashlib.sha256(raw).hexdigest(), f"sha:{label}")
    require(len(raw) <= maximum, f"limit:{label}")


def exact_keys(value: dict[str, Any], keys: set[str], label: str) -> None:
    require(set(value) == keys, f"keys:{label}")


def pointer(document: Any, path: str) -> Any:
    current = document
    for token in path.split("/")[1:]:
        token = token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list):
            current = current[int(token)]
        else:
            require(isinstance(current, dict) and token in current, f"pointer:{path}")
            current = current[token]
    return current


def check_contract(contract: dict[str, Any], patch: str) -> None:
    inv = contract["invariants"]
    bridge = contract["bridge"]
    atom = contract["atomization"]["bridge_enforced"]
    launch = contract["launch"]
    require(bridge["phases"][1] == "ACTIVE", "contract active phase")
    require(inv["activation_native_call"] == "record.session.goalRuntime.createGoal", "contract native call")
    require(inv["model_prompt_before_active_goal"] is False and inv["prompt_count_exact"] == 1, "contract activation order")
    require(atom["subject_utf8_bytes_max"] == 512 and inv["exact_subject_hash_and_bytes_bound_before_goal_creation"] is True, "contract subject")
    require(atom["goal_objective_utf8_bytes_max"] == 256 and inv["exact_goal_objective_hash_and_bytes_bound_before_goal_creation"] is True, "contract objective")
    require(atom["acceptance_criterion_utf8_bytes_max"] == 256 and inv["exact_acceptance_criterion_hash_and_bytes_bound_before_goal_creation"] is True, "contract criterion")
    require(atom["output_contract_utf8_bytes_max"] == 128 and inv["exact_output_contract_hash_and_bytes_bound_before_goal_creation"] is True, "contract output")
    required_request = {"atomManifestSha256", "controlSha256", "subjectUtf8Bytes", "subjectUtf8Sha256"}
    require(required_request <= set(bridge["activation_request_exact_fields"]), "contract request binding")
    require(inv["atom_manifest_sha256_bound_before_goal_creation"] is True, "contract manifest")
    require(inv["acp_transport_does_not_instantiate_interactive_mode"] is True and inv["goal_runtime_on_agent_end_schedules_no_continuation"] is True, "contract continuation")
    require(inv["native_goal_complete_required_before_settle"] is True and inv["settle_model_calls"] == 0, "contract terminal")
    require(inv["terminal_records_exact"] == ["mode_change:none", "goal-completed"], "contract terminal records")
    require(launch["host"] == "WINDOWS" and launch["cwd"] == "P:\\", "contract Windows cwd")
    require(launch["original_boundary_argv"] == ["omp", "--cwd", "P:\\"], "contract original argv")
    require(launch["headless_argv"] == ["omp", "--cwd", "P:\\", "acp"], "contract headless argv")
    require(launch["handoff"] == {"headless_may_start_only_after_original_lane_quiesced": True, "owner_continuity": "SAME_CONTROLLING_WINDOWS_TASK", "simultaneous_original_and_headless_processes_forbidden": True}, "contract handoff")
    start = patch.find("async #activateR9Goal")
    create = patch.find("const state = await record.session.goalRuntime.createGoal({ objective });", start)
    require(start >= 0 and create > start, "patch activation block")
    before_create = patch[start:create]
    for token in ("atomManifestSha256", "controlSha256", "subjectUtf8Bytes", "subjectUtf8Sha256", "goalObjectiveUtf8Sha256", "acceptanceCriterionUtf8Sha256", "outputContractUtf8Sha256"):
        require(token in before_create, f"patch prebind:{token}")
    require('bridge.phase = "PROMPT_CONSUMED"' in patch, "patch consumed phase")
    require("goalCompletedRecord" in patch and 'mode: "none"' in patch, "patch terminal reconciliation")


def check_obj(manifest: dict[str, Any], manifest_path: Path) -> dict[str, int]:
    exact_keys(manifest, {"artifact_id", "atoms", "authority", "bindings", "limits", "policy", "reducer_policy", "schema_id", "status", "unresolved"}, "root")
    require(manifest["schema_id"] == SCHEMA and manifest["status"] == STATUS, "schema/status")
    require(manifest["authority"] == AUTHORITY, "authority")
    require(manifest["limits"] == LIMITS, "limits")
    require(manifest["policy"] == POLICY, "policy")
    require(manifest["reducer_policy"] == REDUCER, "reducer")
    expected_bindings = [{"bytes": size, "mode": "0644", "path": path, "sha256": sha} for path, sha, size in BINDINGS]
    require(manifest["bindings"] == expected_bindings, "binding catalog")
    base = manifest_path.parent
    for rel, sha, size in BINDINGS:
        path = (base / rel).resolve()
        require(path.is_file() and not path.is_symlink(), f"binding regular:{rel}")
        raw = path.read_bytes()
        require(len(raw) == size and hashlib.sha256(raw).hexdigest() == sha, f"binding identity:{rel}")
        require(stat.S_IMODE(path.stat().st_mode) == 0o644, f"binding mode:{rel}")
    _, contract = load_json(base / "bridge_contract_v3.json")
    patch = (base / "omp_acp_native_goal_bridge_v3.patch").read_text(encoding="utf-8")
    check_contract(contract, patch)
    atoms = manifest["atoms"]
    require(isinstance(atoms, list) and len(atoms) == len(DEFS) == 9, "atom count")
    atom_keys = {"acceptance_criterion_utf8", "acceptance_criterion_utf8_bytes", "acceptance_criterion_utf8_sha256", "atom_id", "atom_index", "dependency_atom_ids", "evidence_slice_utf8", "evidence_slice_utf8_bytes", "evidence_slice_utf8_sha256", "goal_objective_utf8", "goal_objective_utf8_bytes", "goal_objective_utf8_sha256", "operation", "operation_count", "output_contract_utf8", "output_contract_utf8_bytes", "output_contract_utf8_sha256", "prompt_utf8", "prompt_utf8_bytes", "prompt_utf8_sha256", "source_projection", "status"}
    total_prompt = 0
    for index, (atom, definition) in enumerate(zip(atoms, DEFS, strict=True)):
        exact_keys(atom, atom_keys, f"atom:{index}")
        suffix, operation, objective, criterion, evidence, decision, pointers, anchor = definition
        atom_id = f"bridge-review:{suffix}:atom-{index:03d}"
        require(atom["atom_id"] == atom_id and ATOM_ID.fullmatch(atom_id) is not None, f"atom id:{index}")
        require(atom["atom_index"] == index and atom["operation"] == operation and atom["operation_count"] == 1, f"atom operation:{index}")
        require(atom["dependency_atom_ids"] == [] and atom["status"] == "PREDECLARED_NOT_EXECUTED", f"atom state:{index}")
        identity(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], f"objective:{index}", LIMITS["goal_objective_max_utf8_bytes"])
        identity(atom["acceptance_criterion_utf8"], atom["acceptance_criterion_utf8_bytes"], atom["acceptance_criterion_utf8_sha256"], f"criterion:{index}", LIMITS["acceptance_criterion_max_utf8_bytes"])
        identity(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], f"evidence:{index}", LIMITS["evidence_slice_max_utf8_bytes"])
        identity(atom["output_contract_utf8"], atom["output_contract_utf8_bytes"], atom["output_contract_utf8_sha256"], f"output:{index}", LIMITS["output_contract_max_utf8_bytes"])
        identity(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], f"prompt:{index}", LIMITS["prompt_max_utf8_bytes"])
        require(atom["goal_objective_utf8"] == objective and atom["acceptance_criterion_utf8"] == criterion, f"objective/criterion:{index}")
        require(atom["evidence_slice_utf8"] == evidence and atom["output_contract_utf8"] == OUTPUT, f"evidence/output:{index}")
        parsed_evidence = json.loads(evidence, object_pairs_hook=pairs)
        require(json.dumps(parsed_evidence, ensure_ascii=False, sort_keys=True, separators=(",", ":")) == evidence, f"canonical evidence:{index}")
        prompt = f"Evidence: {evidence}\n{decision} Return only {OUTPUT}. Then mark the active Goal complete."
        require(atom["prompt_utf8"] == prompt, f"prompt template:{index}")
        projection = atom["source_projection"]
        require(projection == {"contract_path": "bridge_contract_v3.json", "json_pointers": pointers, "patch_anchor": anchor, "patch_path": "omp_acp_native_goal_bridge_v3.patch"}, f"projection:{index}")
        for json_pointer in pointers:
            pointer(contract, json_pointer)
        if anchor is not None:
            require(anchor in patch, f"patch anchor:{index}")
        total_prompt += atom["prompt_utf8_bytes"]
    unresolved = manifest["unresolved"]
    require(isinstance(unresolved, list) and unresolved[-1] == "Qualification remains 0/2.", "unresolved")
    return {"atom_count": len(atoms), "max_prompt_bytes": max(atom["prompt_utf8_bytes"] for atom in atoms), "total_prompt_bytes": total_prompt}


def check_manifest(path: Path) -> dict[str, int]:
    raw, manifest = load_json(path)
    require(raw == canonical(manifest), "canonical manifest")
    require(stat.S_IMODE(path.stat().st_mode) == 0o644, "manifest mode")
    return check_obj(manifest, path)


def mutations(manifest: dict[str, Any]) -> list[tuple[str, Callable[[dict[str, Any]], None]]]:
    return [
        ("status", lambda v: v.__setitem__("status", "PASS")),
        ("authority", lambda v: v["authority"].__setitem__("subject_launch", True)),
        ("credit", lambda v: v["authority"].__setitem__("qualification_credit", 1)),
        ("limit", lambda v: v["limits"].__setitem__("prompt_max_utf8_bytes", 4096)),
        ("policy", lambda v: v["policy"].__setitem__("short_but_compound_rejected", False)),
        ("reducer", lambda v: v["reducer_policy"].__setitem__("reducer_predeclared_now", True)),
        ("binding-sha", lambda v: v["bindings"][0].__setitem__("sha256", "0" * 64)),
        ("binding-path", lambda v: v["bindings"][0].__setitem__("path", "other.json")),
        ("drop-atom", lambda v: v["atoms"].pop()),
        ("atom-id", lambda v: v["atoms"][0].__setitem__("atom_id", "large-review")),
        ("atom-index", lambda v: v["atoms"][1].__setitem__("atom_index", 0)),
        ("operation-count", lambda v: v["atoms"][0].__setitem__("operation_count", 2)),
        ("dependency", lambda v: v["atoms"][0]["dependency_atom_ids"].append("other")),
        ("objective-bytes", lambda v: v["atoms"][0].__setitem__("goal_objective_utf8_bytes", 999)),
        ("criterion-sha", lambda v: v["atoms"][0].__setitem__("acceptance_criterion_utf8_sha256", "0" * 64)),
        ("evidence", lambda v: v["atoms"][0].__setitem__("evidence_slice_utf8", "{}")),
        ("output", lambda v: v["atoms"][0].__setitem__("output_contract_utf8", "PASS")),
        ("prompt", lambda v: v["atoms"][0].__setitem__("prompt_utf8", v["atoms"][0]["prompt_utf8"] + " Explain.")),
        ("prompt-bytes", lambda v: v["atoms"][0].__setitem__("prompt_utf8_bytes", 513)),
        ("prompt-sha", lambda v: v["atoms"][0].__setitem__("prompt_utf8_sha256", "f" * 64)),
        ("projection", lambda v: v["atoms"][0]["source_projection"]["json_pointers"].pop()),
        ("patch-anchor", lambda v: v["atoms"][0]["source_projection"].__setitem__("patch_anchor", "missing")),
        ("atom-status", lambda v: v["atoms"][0].__setitem__("status", "PASS")),
        ("root-extra", lambda v: v.__setitem__("extra", True)),
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    path = Path(args.manifest)
    require(path.is_absolute(), "manifest must be absolute")
    raw, manifest = load_json(path)
    require(raw == canonical(manifest), "canonical manifest")
    require(stat.S_IMODE(path.stat().st_mode) == 0o644, "manifest mode")
    stats = check_obj(manifest, path)
    mutation_count = 0
    if args.mutation_self_test:
        for name, mutate in mutations(manifest):
            value = copy.deepcopy(manifest)
            mutate(value)
            try:
                check_obj(value, path)
            except Invalid:
                mutation_count += 1
            else:
                raise Invalid(f"mutation accepted:{name}")
    result = {
        "atom_count": stats["atom_count"],
        "first_mismatch": None,
        "max_prompt_utf8_bytes": stats["max_prompt_bytes"],
        "mode": "mutation-self-test" if args.mutation_self_test else "check",
        "mutation_count": mutation_count,
        "schema_id": "pw-r9-goal-mode-omp-atomic-bridge-independent-review-atom-manifest-check-v1",
        "status": "PASS",
        "subject_calls": 0,
        "total_prompt_utf8_bytes": stats["total_prompt_bytes"],
        "workspace_writes": 0,
    }
    sys.stdout.buffer.write(canonical(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Invalid as exc:
        sys.stdout.buffer.write(canonical({"first_mismatch": str(exc), "schema_id": "pw-r9-goal-mode-omp-atomic-bridge-independent-review-atom-manifest-check-v1", "status": "FAIL", "subject_calls": 0, "workspace_writes": 0}))
        raise SystemExit(1)
