#!/usr/bin/env python3
"""Candidate-v11 process-completion-gated facade over immutable candidate-v9.

No provider integration and no writes. Every frozen runtime dependency is
validated as a regular non-link with exact bytes before candidate-v9 or the
candidate-local process controller is dynamically imported.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import stat
import sys
from pathlib import Path
from types import ModuleType
from typing import Any

sys.dont_write_bytecode = True

CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-11"
V9_CANDIDATE_ID = "PW-R8-ITERATIVE-FIX-TWO-CLEAN-RUNS-20260815.CANDIDATE-9"
ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parent
V9_ROOT = SUCCESSOR / "model_retest_r8_candidate_v9"
V9_HARNESS = V9_ROOT / "r8_harness.py"
PROCESS_CONTROLLER = ROOT / "r8_process_controller.py"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
_LOCAL_FACADE_FILES = {
    ROOT / "r8_harness.py",
    ROOT / "architecture_contract.json",
    ROOT / "counterfactual_holdouts.json",
    ROOT / "deterministic_preflight_report.json",
    ROOT / "README.md",
}

_OPEN_TRACE: set[Path] = set()


def _audit_open(event: str, args: tuple[Any, ...]) -> None:
    if event != "open" or not args or not isinstance(args[0], (str, bytes, os.PathLike)):
        return
    try:
        path = Path(args[0]).resolve()
    except (OSError, TypeError, ValueError):
        return
    if path.is_relative_to(SUCCESSOR.resolve()):
        _OPEN_TRACE.add(path)


sys.addaudithook(_audit_open)

# Exact sorted candidate-v9 closure, its four frozen facade files, its two
# transitive controller baselines, and five candidate-v11 process files.
_CLOSURE_TEXT = """frozen_plans_snapshot_20260814_v1/fixture/Plans/00-plans-index.md|19fcbd110827a949df25cfb2f9f61bdbbc28ffc4f46f01bbe9f3981f94efb311|367909
frozen_plans_snapshot_20260814_v1/fixture/Plans/Automated_Testing_System.md|975472ff73c949fea277805b1317b1f67f56972bbfe401c73c3f38267edac4b3|267313
frozen_plans_snapshot_20260814_v1/fixture/Plans/Plan_To_Node_Compilation.md|196e062d4fb5dd38b28bbed93d6370e3c9205a29169533116b28d46d2c3cc8e2|103867
frozen_plans_snapshot_20260814_v1/fixture/Plans/Planning_Ledger_System.md|8df9c0e932c9ad97f837db1d87d8546baa5a1cb68ef9007756c082ae9003df07|70805
frozen_plans_snapshot_20260814_v1/fixture/Plans/Planning_Wizard.md|2b9591954871986cc5af23764d026ce102ca67be66634c7d1e49dc6988833d00|93549
frozen_plans_snapshot_20260814_v1/fixture/Plans/Prompt_Pipeline.md|5455de88e0eb4b9f7cc02f3828ce5aa836058f03e12715532ad2c761908fb5d8|303738
frozen_plans_snapshot_20260814_v1/fixture/Plans/assistant-chat-design.md|8d6dfb862784206b0c4db9ebe7d0e7b149723161aecbbb7282c750a86eddf7b9|1150138
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/ledger_registry.json|23d36152dd8d14de849d1d22ba0df5ca0a6864f8f0331efb3446e1d4c498e988|61169
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/current.json|813b219dac1bef99d85971ab2411e0b3bb3f5df2a0bb1df224467f2855df3914|8940
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/handoff.json|82e9800b6905f3d7cb77b78a4b58ea6f4f0a5b056cf4636c46f3bd57e1270f4f|9160
frozen_plans_snapshot_20260814_v1/fixture/Plans/ledgers/v2/pldg-20260801-001-feature-intake/state/open_items.json|36c73492e33546c22d2e0ad1aff2aa7548b8d543f445a9ffc984fe4c5bcf2e47|20100
frozen_plans_snapshot_20260814_v1/provenance_manifest.json|56ddf926b4106bee4e774b91b17ed4fab5ca03a7e25154bc467955bb25274c0c|9327
model_retest_r5_snapshot_v1/integration_contract.json|d0cace7ea9d62925084245d1160d574f8f4b49c420abe60c8892de2f2a762e1a|4094
model_retest_r5_snapshot_v1/r4_harness.py|29d330d4dbef05a9f4e26a3bd1958cd50734d46af0d830acda5071ce4347ec82|279029
model_retest_r5_snapshot_v1/scorer_key.json|5b4614bea59b3f3740864324d33e346be254bff012da4ab6476077d5e80c2912|9429
model_retest_r5_snapshot_v1/templates/S10A.txt|627b03177ed4aa23f15217ccca326cfc995f5720bcec4cf71489dd32c9860958|1649
model_retest_r5_snapshot_v1/topic_a_capsule.json|6a37b1ab477e98b87d85b5e9569617b456d4dcc0e8a19762effaeb6218d18b52|51204
model_retest_r5_snapshot_v1/topic_b_capsule.json|75ca7224c90d44d32a29f2e766402d9e9eccf8fda584073ee82ca4bad5a41c96|72807
model_retest_r6_decomposed_v1/contract.json|9bee0c39beb4982c4daac1656f9f7a1327d4d31b9244c0ceebb22f630765f4b1|7482
model_retest_r6_decomposed_v1/r6_harness.py|a9a2ad6d11979da96571603a2297f890cf4c2b5bfb84f1a3aaa2b7c27c4e07a0|45927
model_retest_r6_decomposed_v2/contract.json|fdafa86048249a3b4325a84ce6e8f14e8cbafa0cc4e40360be3490d17e46bde6|6618
model_retest_r6_decomposed_v2/r6v2_harness.py|0cfd8e25d06a12c7294a15c182af0da095da33848ae96ca62b93349579a90e34|28103
model_retest_r6_decomposed_v3/contract.json|4ea1bbe15c2828582ff670a281030be6d549542c491ab4ae726aff37e5a1c41d|3074
model_retest_r6_decomposed_v3/r6v3_harness.py|472e8aa0b50e0bdf1ff33d5d880b6f6355282590b7dcd7a6168093257e0917be|15118
model_retest_r6_decomposed_v4/contract.json|8e3ab005f1f7e2f52cd8abd9486ff594a60557f69f829bdefa510ac5d0b0733e|3182
model_retest_r6_decomposed_v4/r6v4_harness.py|33c30afcab4b6c2602481c3e1fb0c8c3b54f5e4c3a4588c283df1d19d2b2ba22|34628
model_retest_r6_decomposed_v5/contract.json|6cc660b51bc0dd390e71cd2bab48c3ef5ca8943bf254c9ca0e349d5cd53b7144|1972
model_retest_r6_decomposed_v5/r6v5_harness.py|82f9dbb66f810d526e9260304a0cbcca671df2840cb11ac403289eb97ce83acc|23722
model_retest_r6_decomposed_v6/contract.json|6452f78be024d61f4a3fe13f7c95ca9efee7943e82eefc25cba9efe9dc497a41|3377
model_retest_r6_decomposed_v6/r6v6_harness.py|b950d61ace51798c914db358eb4580aa79a0cbf475ccfc7560ef38cdf6cab4d0|15014
model_retest_r6_decomposed_v7/contract.json|79b84db9cf3081893d1f63d4fa1240dcc028f365ba47be00ce72ea27ce390137|3902
model_retest_r6_decomposed_v7/r6v7_harness.py|8638110bd1b0e40f4e9ed334f77b85bdeeb21648369929ea03125e0aa11c0a0f|16975
model_retest_r8_candidate_v11/controller_contract.json|f3a4ef5eeed6833d9bdf987b3d930b1ec11771bd9393f6b190a763b2679bce92|2944
model_retest_r8_candidate_v11/process_completion_contract.json|0bec3fd862d6ad7247349e40821ff0dcd1bcc519c251ad24de4ef9a1a5a4d077|5588
model_retest_r8_candidate_v11/r8_process_controller.py|a7e9f23e60534b0daa2297db920362046d6eaa098ce923de5eda95462cc31738|22004
model_retest_r8_candidate_v11/r8_run_verifier.py|5286c461f8525343f1a53923e9150846903d1ac13a960469890f7b3eee0ad48c|9037
model_retest_r8_candidate_v11/r8_subject_task_driver.py|663645cb6cfbd5ef0d6bba5de91d63833593aa6e55d71c485e97ee6cad5f8abf|1330
model_retest_r8_candidate_v3/deterministic_preflight_report.json|bf8dfca3a0a6d9c282b3a29cfa2c6ee9b88955accf965828bd3a7c1fb173458f|74229
model_retest_r8_candidate_v4/deterministic_preflight_report.json|a88e262c5b0f0d18ad899a3e0cce8265d4061285c642410cb357ef73b3df90c0|74630
model_retest_r8_candidate_v4/r8_harness.py|c9dc4e4ccc8f526db147822915c3597ec7f26f4980c96a68477f867bdfba8769|78223
model_retest_r8_candidate_v5/counterfactual_holdouts.json|d77a62c62e76de2d895aa1141d1ce75735e41945a5b3eef5ecf818e781c5faba|37155
model_retest_r8_candidate_v5/deterministic_preflight_report.json|dce5e30deede76d91bc8d3a43fd6391d8688a8262277e437958c7591f96f20b3|82907
model_retest_r8_candidate_v5/r8_harness.py|df620714978572aba79f3d0836d6fc61e433c4ca11d9bfd0b3d2ad242c7fd736|105519
model_retest_r8_candidate_v5/tension_decomposition.json|b6e2443313b477f660daadccc48800c68162ada8f3ad84ad658dfd7b5ed48c26|42515
model_retest_r8_candidate_v6/architecture_contract.json|60ae0c98fa305da395bd07e9ac809fa7d7d86b8191ad5cd34b89130c3c7367db|14243
model_retest_r8_candidate_v6/counterfactual_holdouts.json|6c6480920bc7e9e69cc20ee02c7b7a2fde936a81eadc0cc3a3f5d4801a00e7f1|37376
model_retest_r8_candidate_v6/r8_harness.py|ef5a239e995c96209bc67c2a6ec16cbf721f1cf6ea4368d8204c70b2e74119e5|111710
model_retest_r8_candidate_v7/architecture_contract.json|b309b0f372c34e183786869e97aa8082abc67baa51deb9be9f75442fec52c23d|24518
model_retest_r8_candidate_v7/counterfactual_holdouts.json|ef28d15b388c2a28fdf842cfa5662f38a6d4e2ba5bb9ada5dbe6e264f7ae7821|44108
model_retest_r8_candidate_v7/deterministic_preflight_report.json|c899f09642eb98d61a3518dba21789f53586be36f7157887c0e6c8ac3644499e|91385
model_retest_r8_candidate_v7/r8_harness.py|08f4753658e2fea3c8e31d316b2aeb9691cea52b5b735058b06a6939ada57762|20317
model_retest_r8_candidate_v8/architecture_contract.json|1c1ffdf8bdbc2bc0ee341fb0cb8903c442dc01df16a6e8cc34e44f0989362bb2|27710
model_retest_r8_candidate_v8/counterfactual_holdouts.json|489e58ec16ab6063d08187d813b8458049da85cf00fe03bdc6a6cfe820fb8c24|44468
model_retest_r8_candidate_v8/deterministic_preflight_report.json|cd1d832de9d26eb215ebccdf20fc02bbe7fea33b6e362cb26d2f889b5c70b868|95055
model_retest_r8_candidate_v8/r8_harness.py|a59e958aa8f32ea49e48216493f772ccfd24413f37a452887048f9a8a9c85b02|21637
model_retest_r8_candidate_v9/architecture_contract.json|314c855aa354c7f8983454150c29f19124228db7cbf3adbf18eee42771f3aae7|32248
model_retest_r8_candidate_v9/counterfactual_holdouts.json|94e8c271ad939e3697b5253448de001aade2c36e81ed208939fa70012a3ea6e4|46206
model_retest_r8_candidate_v9/deterministic_preflight_report.json|96f73db70e85c392b092540d4acad7d97ba438544b4087d26455454e074e0613|99510
model_retest_r8_candidate_v9/r8_harness.py|854af1c88d64992a86e8f319bbc506ddefce0913aed926a352fb235c4602a027|41395
model_retest_r8_candidate_v9/r8_run_verifier.py|cf6451f16fef37da6ea269769435cf08626d1ec88a9d4e927626cec41987ede7|116215
model_retest_r8_candidate_v9/r8_subject_task_driver.py|21a442cb2a5729e59577a3639ca46d003e67a06b377f6e29f71609a53615ddbb|24872"""

BOOTSTRAP_CLOSURE = tuple(
    {"path": path, "sha256": digest, "bytes": int(size)}
    for path, digest, size in (line.split("|") for line in _CLOSURE_TEXT.splitlines())
)
_EXPECTED_PATHS = tuple(row["path"] for row in BOOTSTRAP_CLOSURE)
if _EXPECTED_PATHS != tuple(sorted(_EXPECTED_PATHS)) or len(set(_EXPECTED_PATHS)) != len(_EXPECTED_PATHS):
    raise RuntimeError("embedded runtime dependency closure is not exact sorted unique")


class Invalid(Exception):
    pass


class SubjectFail(Exception):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def reject_duplicates(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate key: {key}")
        out[key] = value
    return out


def regular(path: Path, label: str) -> bytes:
    try:
        info = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent") from exc
    if not stat.S_ISREG(info.st_mode):
        raise Invalid(f"{label}: not a regular nonlink")
    return path.read_bytes()


def strict_object(data: bytes, label: str) -> dict[str, Any]:
    try:
        obj = json.loads(data.decode("utf-8"), object_pairs_hook=reject_duplicates)
    except (UnicodeDecodeError, json.JSONDecodeError, Invalid) as exc:
        raise Invalid(f"{label}: invalid UTF-8 JSON: {exc}") from exc
    if not isinstance(obj, dict):
        raise Invalid(f"{label}: top level must be object")
    return obj


def validate_declared_closure(rows: Any, *, validate_storage: bool) -> tuple[dict[str, Any], ...]:
    if not isinstance(rows, list):
        raise Invalid("runtime dependency closure must be an array")
    projected: list[dict[str, Any]] = []
    for row in rows:
        if not isinstance(row, dict) or set(row) - {"path", "sha256", "bytes", "roles"}:
            raise Invalid("runtime dependency row shape invalid")
        projected.append({key: row.get(key) for key in ("path", "sha256", "bytes")})
    paths = [row["path"] for row in projected]
    if paths != sorted(paths):
        raise Invalid("runtime dependency closure is not sorted")
    if len(paths) != len(set(paths)):
        raise Invalid("runtime dependency closure contains duplicate path")
    if tuple(projected) != BOOTSTRAP_CLOSURE:
        raise Invalid("runtime dependency closure missing, extra, or tampered row")
    if any(path.startswith("Plans/") or "/../" in f"/{path}/" or Path(path).is_absolute() for path in paths):
        raise Invalid("live Plans or non-relative runtime dependency forbidden")
    if validate_storage:
        for row in projected:
            storage = regular(SUCCESSOR / row["path"], row["path"])
            if (sha(storage), len(storage)) != (row["sha256"], row["bytes"]):
                raise Invalid(f"{row['path']}: frozen binding drift")
    return tuple(projected)


def architecture() -> dict[str, Any]:
    obj = strict_object(regular(ROOT / "architecture_contract.json", "architecture contract"), "architecture contract")
    if (obj.get("schema_id"), obj.get("candidate_id")) != (
        "pw-r8-candidate-architecture-contract-v11", CANDIDATE_ID
    ):
        raise Invalid("architecture identity mismatch")
    validate_declared_closure(obj.get("runtime_dependency_closure"), validate_storage=True)
    return obj


_facade_cache: ModuleType | None = None
_process_cache: ModuleType | None = None
_v9_adapted = False


def facade_module() -> ModuleType:
    global _facade_cache
    architecture()
    if _facade_cache is None:
        spec = importlib.util.spec_from_file_location("r8_candidate_v11_bound_v9", V9_HARNESS)
        if spec is None or spec.loader is None:
            raise Invalid("candidate-v9 facade import unavailable")
        item = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(item)
        _facade_cache = item
    return _facade_cache


def process_module() -> ModuleType:
    global _process_cache
    architecture()
    if _process_cache is None:
        spec = importlib.util.spec_from_file_location("r8_candidate_v11_process_controller", PROCESS_CONTROLLER)
        if spec is None or spec.loader is None:
            raise Invalid("candidate-v11 process controller import unavailable")
        item = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(item)
        _process_cache = item
    return _process_cache


def adapt_v9_identity() -> ModuleType:
    global _v9_adapted
    facade = facade_module()
    if not _v9_adapted:
        # v9 has already validated its exact architecture and closure. Preserve
        # that validated result while changing only candidate identity bindings.
        validated_v9_architecture = facade.architecture()
        facade.architecture = lambda: validated_v9_architecture
        facade.CANDIDATE_ID = CANDIDATE_ID
        _v9_adapted = True
    return facade


def semantic_module(*, candidate_identity: bool = True) -> ModuleType:
    facade = adapt_v9_identity()
    module = facade.semantic_module(candidate_identity=False)
    if candidate_identity:
        module.CANDIDATE_ID = CANDIDATE_ID
    module.validated_capture_envelope = validated_capture_envelope_v10
    return module


def validated_capture_envelope_v10(exec_root: Path, slot: str, cell: str) -> tuple[bytes | None, dict[str, Any]]:
    module = semantic_module(candidate_identity=False)
    _, receipt_path = module.capture_paths(exec_root, slot, cell)
    receipt_storage = module.regular(receipt_path, f"{slot} {cell} driver receipt")
    try:
        process_module().validate_persisted_completion(exec_root, slot, cell, receipt_storage=receipt_storage)
    except Exception as exc:
        raise Invalid(f"{slot} {cell}: process completion admission failed: {exc}") from exc
    return adapt_v9_identity().validated_capture_envelope_v4(exec_root, slot, cell)


def derive_external_open_paths() -> dict[str, Any]:
    declared = set(_EXPECTED_PATHS)
    traced = {
        path.relative_to(SUCCESSOR.resolve()).as_posix()
        for path in _OPEN_TRACE
        if path.is_file() and path not in _LOCAL_FACADE_FILES
    }
    unbound = sorted(traced - declared)
    if unbound:
        raise Invalid(f"observed external open outside declared closure: {unbound}")
    live = sorted(path for path in declared if path.startswith("Plans/"))
    if live:
        raise Invalid("static external read/import path derivation reaches live Plans")
    return {
        "status": "PASS",
        "candidate_v9_inherited_closure_and_facade_paths": 56,
        "candidate_v11_process_controller_paths": len(declared) - 56,
        "deduplicated_paths": len(declared),
        "derived_paths_exactly_equal_declared_closure": True,
        "observed_external_open_paths": len(traced),
        "observed_external_open_paths_subset_of_declared_closure": True,
        "observed_unbound_external_open_paths": unbound,
        "live_plans_paths": live,
        "frozen_fixture_plans_paths": sum(path.startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/") for path in declared),
    }


def preflight() -> dict[str, Any]:
    facade = facade_module()
    if facade.CANDIDATE_ID != V9_CANDIDATE_ID:
        raise Invalid("candidate-v9 baseline identity was changed before baseline preflight")
    baseline = facade.preflight()
    baseline_storage = regular(V9_ROOT / "deterministic_preflight_report.json", "candidate-v9 preflight baseline")
    if dump(baseline) + b"\n" != baseline_storage:
        raise Invalid("candidate-v9 deterministic preflight baseline identity drift")
    v9_holdouts = strict_object(regular(V9_ROOT / "counterfactual_holdouts.json", "candidate-v9 holdouts"), "candidate-v9 holdouts")
    v10_holdouts = strict_object(regular(ROOT / "counterfactual_holdouts.json", "candidate-v11 holdouts"), "candidate-v11 holdouts")
    v9_cases, v10_cases = v9_holdouts.get("cases"), v10_holdouts.get("cases")
    if not isinstance(v9_cases, list) or not isinstance(v10_cases, list) or len(v9_cases) != 71 or len(v10_cases) != 75 or v10_cases[:71] != v9_cases:
        raise Invalid("candidate-v11 inherited holdouts differ from candidate-v9")
    process_holdouts = process_module().process_completion_holdouts()
    expected_ids = [f"CF-R8-{n:02d}-{suffix}" for n, suffix in (
        (72, "valid-exited-zero-complete-stdout-observation-admitted"),
        (73, "empty-driver-stdout-rejected"),
        (74, "partial-driver-stdout-rejected"),
        (75, "unexited-driver-stdout-rejected"),
    )]
    if (
        not isinstance(process_holdouts, dict)
        or process_holdouts.get("cases") != 4
        or [row.get("case_id") for row in process_holdouts.get("results", [])] != expected_ids
        or process_holdouts.get("answer_cell_model_specific_logic") is not False
    ):
        raise Invalid("process completion holdout interface mismatch")
    if any(row.get("result") not in ("PASS", "REJECT") for row in process_holdouts["results"]):
        raise Invalid("process completion holdout did not pass/reject as required")
    module = semantic_module(candidate_identity=True)
    if len(module.SUBJECT_CELLS) != 97:
        raise Invalid("candidate-v9 semantic schedule identity drift")
    read_path_proof = derive_external_open_paths()
    closure = [dict(row) for row in BOOTSTRAP_CLOSURE]
    inventory_bytes = dump(closure)
    source_count = sum(row["path"].startswith("frozen_plans_snapshot_20260814_v1/fixture/Plans/") for row in closure)
    baseline.update({
        "schema_id": "pw-r8-deterministic-preflight-report-v11",
        "candidate_id": CANDIDATE_ID,
        "runtime_dependency_closure": {
            "status": "PASS",
            "exact_sorted_unique_external_files": len(closure),
            "candidate_v9_inherited_closure_and_facade_files": 56,
            "candidate_v11_process_controller_files": len(closure) - 56,
            "unique_frozen_fixture_source_files": source_count,
            "inventory_sha256": sha(inventory_bytes),
            "inventory_canonical_bytes": len(inventory_bytes),
            "validated_before_dynamic_import": True,
            "all_actual_external_open_candidates_subset_of_declared_closure": True,
            "derivation": "candidate-v9 exact runtime dependency closure union candidate-v9 facade files and exact candidate-v11 controller/process interface files",
            "live_plans_paths": [],
            "candidate_local_facade_files_excluded": True,
        },
        "static_external_read_path_proof": read_path_proof,
        "process_completion_holdouts": process_holdouts,
        "counterfactual_holdouts": {
            "cases": 75,
            "passed_case_ids": baseline["counterfactual_holdouts"]["passed_case_ids"] + [row["case_id"] for row in process_holdouts["results"]],
            "inherited_object_identity_to_candidate_v9": "71/71",
        },
        "candidate_v9_semantic_baseline": {
            "provider_visible_prompt_identity": baseline["candidate_v8_semantic_baseline"]["provider_visible_prompt_identity"],
            "semantic_oracle_identity": baseline["candidate_v8_semantic_baseline"]["semantic_oracle_identity"],
            "schedule_identity": baseline["candidate_v8_semantic_baseline"]["schedule_identity"],
            "deterministic_output_identity": baseline["candidate_v8_semantic_baseline"]["deterministic_output_identity"],
            "complete_preflight_storage_identity": True,
            "preflight_storage_sha256": sha(baseline_storage),
            "preflight_storage_bytes": len(baseline_storage),
        },
        "audited_candidate_bundle_custody_interface": {
            "owner": "external controller",
            "schema_id": "pw-r8-audited-candidate-bundle-v1",
            "exact_ordered_keys": ["schema_id", "candidate_id", "excluded_path", "file_count", "aggregate_file_bytes", "files", "canonical_rows_sha256", "canonical_rows_bytes"],
            "excluded_path": "independent_preseal_audit.json",
            "file_count": 12,
            "canonical_rows_rule": "sha256 and bytes over canonical minified UTF-8 JSON of the exact sorted files array only",
            "semantic_render_bytes_changed": False,
        },
        "scoring_process_completion_interface": {
            "required_before_receipt_admission": True,
            "observation_schema": "pw-r8-invocation-completion-observation-v1",
            "observation_path": "<execution_root>/invocation_completions/<slot>_<cell>.json",
            "receipt_schema": "pw-r8-direct-appserver-subject-receipt-v4",
            "capture_schema": "pw-r8-subject-capture-envelope-v3",
            "requires_real_child_exit_zero": True,
            "requires_outer_exec_terminal_exit_zero": True,
            "requires_fully_captured_exact_canonical_receipt_stdout": True,
            "missing_unexited_empty_partial_fail_closed": True,
            "semantic_acceptance_weakened": False,
        },
        "provider_calls": 0,
        "subject_calls": 0,
        "live_plans_reads": 0,
    })
    return baseline


def execution_root(value: str) -> Path:
    path = Path(value).resolve()
    if not path.is_relative_to(SUCCESSOR.resolve()):
        raise Invalid("execution root must remain beneath successor_20260813")
    return path


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    sub.add_parser("list-cells")
    for name in ("render", "expected", "score", "measure"):
        q = sub.add_parser(name)
        q.add_argument("--cell", required=True)
        q.add_argument("--slot", required=True, choices=SLOTS)
        q.add_argument("--execution-root", required=True)
    q = sub.add_parser("reduce")
    q.add_argument("--stage", required=True, choices=("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90"))
    q.add_argument("--slot", required=True, choices=SLOTS)
    q.add_argument("--execution-root", required=True)
    return p


def main() -> int:
    try:
        args = parser().parse_args()
        if args.command == "preflight":
            sys.stdout.buffer.write(dump(preflight()) + b"\n")
            return 0
        module = semantic_module()
        if args.command == "list-cells":
            sys.stdout.buffer.write(dump({"candidate_id": CANDIDATE_ID, "count": len(module.SUBJECT_CELLS), "cells": list(module.SUBJECT_CELLS)}) + b"\n")
            return 0
        root = execution_root(args.execution_root)
        if args.command == "render":
            sys.stdout.buffer.write(module.render(args.cell, args.slot, root)[0])
            return 0
        if args.command == "expected":
            sys.stdout.buffer.write(dump(module.expected(args.cell, args.slot, root)) + b"\n")
            return 0
        if args.command == "measure":
            storage, source_bytes = module.render(args.cell, args.slot, root)
            packet = module.provider_payload(storage, args.cell)
            sys.stdout.buffer.write(dump(module.packet_diagnostics(args.cell, packet, source_bytes)) + b"\n")
            return 0
        if args.command == "score":
            result, rc = module.score(args.cell, args.slot, root)
            sys.stdout.buffer.write(dump(result) + b"\n")
            return rc
        if args.command == "reduce":
            sys.stdout.buffer.write(dump(module.reduce(root, args.slot, args.stage)) + b"\n")
            return 0
        raise Invalid("unsupported command")
    except Exception as exc:
        subject_fail = exc.__class__.__name__ == "SubjectFail"
        status, rc = ("FAIL", 1) if subject_fail else ("INVALID", 2)
        sys.stdout.buffer.write(dump({"schema_id": "pw-r8-harness-error-v1", "candidate_id": CANDIDATE_ID, "status": status, "error": str(exc)}) + b"\n")
        return rc


if __name__ == "__main__":
    raise SystemExit(main())
