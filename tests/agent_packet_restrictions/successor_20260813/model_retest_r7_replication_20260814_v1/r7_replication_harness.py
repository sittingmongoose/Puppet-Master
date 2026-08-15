#!/usr/bin/env python3
"""Pure renderer/scorer/reducer for PW-R7-REPLICATION-20260814.1.

This harness never calls a provider and never writes. It imports the immutable
R5/R6 architecture definitions and accepts only R7 fresh artifacts as runtime
inputs. The controller persists stdout with apply_patch.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import os
import re
import stat
import sys
from pathlib import Path
from types import ModuleType, SimpleNamespace
from typing import Any

ID = "PW-R7-REPLICATION-20260814.1"
ROOT = Path(__file__).resolve().parent
SUCCESSOR = ROOT.parent
R5 = SUCCESSOR / "model_retest_r5_snapshot_v1"
V1 = SUCCESSOR / "model_retest_r6_decomposed_v1"
V2 = SUCCESSOR / "model_retest_r6_decomposed_v2"
V3 = SUCCESSOR / "model_retest_r6_decomposed_v3"
V4 = SUCCESSOR / "model_retest_r6_decomposed_v4"
V5 = SUCCESSOR / "model_retest_r6_decomposed_v5"
V6 = SUCCESSOR / "model_retest_r6_decomposed_v6"
V7 = SUCCESSOR / "model_retest_r6_decomposed_v7"
EXEC = ROOT / "execution"
SLOTS = ("slot-alpha", "slot-bravo", "slot-charlie")
EDGE_IDS = ("B-E03", "B-E09", "B-E01", "B-E07", "B-E10", "B-E02", "B-E08", "B-E04", "B-E06", "B-E05")
S30_IDS = tuple([f"A{i:02d}" for i in range(1, 19)] + [f"B{i:02d}" for i in range(1, 19) if i != 16])
SUBJECT_CELLS = ("S10A", "S10B_DECISIONS", "S10B_TENSION") + tuple(f"S10B_EDGE_{x}" for x in EDGE_IDS) + tuple(f"S30_{x}" for x in S30_IDS) + ("S50_SEMANTIC", "S60_P_I-E99", "S60_C_I-E99", "S60_K_I-E99")
assert len(SUBJECT_CELLS) == 52

FROZEN = (
    ("frozen provenance", SUCCESSOR / "frozen_plans_snapshot_20260814_v1/provenance_manifest.json", "56ddf926b4106bee4e774b91b17ed4fab5ca03a7e25154bc467955bb25274c0c", 9327),
    ("R5 harness", R5 / "r4_harness.py", "29d330d4dbef05a9f4e26a3bd1958cd50734d46af0d830acda5071ce4347ec82", 279029),
    ("R5 scorer", R5 / "scorer_key.json", "5b4614bea59b3f3740864324d33e346be254bff012da4ab6476077d5e80c2912", 9429),
    ("R5 topic A", R5 / "topic_a_capsule.json", "6a37b1ab477e98b87d85b5e9569617b456d4dcc0e8a19762effaeb6218d18b52", 51204),
    ("R5 topic B", R5 / "topic_b_capsule.json", "75ca7224c90d44d32a29f2e766402d9e9eccf8fda584073ee82ca4bad5a41c96", 72807),
    ("R5 integration", R5 / "integration_contract.json", "d0cace7ea9d62925084245d1160d574f8f4b49c420abe60c8892de2f2a762e1a", 4094),
    ("R6-v1 harness", V1 / "r6_harness.py", "a9a2ad6d11979da96571603a2297f890cf4c2b5bfb84f1a3aaa2b7c27c4e07a0", 45927),
    ("R6-v2 harness", V2 / "r6v2_harness.py", "0cfd8e25d06a12c7294a15c182af0da095da33848ae96ca62b93349579a90e34", 28103),
    ("R6-v3 harness", V3 / "r6v3_harness.py", "472e8aa0b50e0bdf1ff33d5d880b6f6355282590b7dcd7a6168093257e0917be", 15118),
    ("R6-v4 harness", V4 / "r6v4_harness.py", "33c30afcab4b6c2602481c3e1fb0c8c3b54f5e4c3a4588c283df1d19d2b2ba22", 34628),
    ("R6-v5 harness", V5 / "r6v5_harness.py", "82f9dbb66f810d526e9260304a0cbcca671df2840cb11ac403289eb97ce83acc", 23722),
    ("R6-v6 harness", V6 / "r6v6_harness.py", "b950d61ace51798c914db358eb4580aa79a0cbf475ccfc7560ef38cdf6cab4d0", 15014),
    ("R6-v7 harness", V7 / "r6v7_harness.py", "8638110bd1b0e40f4e9ed334f77b85bdeeb21648369929ea03125e0aa11c0a0f", 16975),
    ("R6-v7 freeze", V7 / "revision_freeze_manifest.json", "38609aa16f4addb2650d15fdec1cf5e9b72f54952f5d56330478e41434bddf3f", 1354),
    ("R6 terminal manifest", SUCCESSOR / "r6_decomposition_terminal_20260814_v1/artifact_manifest.json", "f412e4ef3751867e6bbcdf26a0970bb3dd3369faa35018063759ad67e3a7cade", 3017),
)


class Invalid(Exception):
    pass


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def dump(obj: Any) -> bytes:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode()


def strict(data: bytes, label: str, canonical: bool = True) -> Any:
    def reject(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
        out: dict[str, Any] = {}
        for key, value in pairs:
            if key in out:
                raise Invalid(f"{label}: duplicate key {key}")
            out[key] = value
        return out
    try:
        obj = json.loads(data.decode(), object_pairs_hook=reject)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise Invalid(f"{label}: invalid JSON: {exc}") from exc
    if canonical and dump(obj) != data:
        raise Invalid(f"{label}: not canonical JSON")
    return obj


def regular(path: Path, label: str) -> bytes:
    try:
        st = os.lstat(path)
    except FileNotFoundError as exc:
        raise Invalid(f"{label}: absent: {path}") from exc
    if not stat.S_ISREG(st.st_mode):
        raise Invalid(f"{label}: not regular nonlink: {path}")
    return path.read_bytes()


def payload(path: Path, label: str) -> tuple[bytes, dict[str, Any]]:
    data = regular(path, label)
    if not data.endswith(b"\n") or data.endswith(b"\n\n"):
        raise Invalid(f"{label}: storage must be payload plus exactly one LF")
    raw = data[:-1]
    obj = strict(raw, label)
    if not isinstance(obj, dict):
        raise Invalid(f"{label}: top level is not object")
    return raw, obj


_modules: dict[str, ModuleType] = {}


def module(name: str, path: Path) -> ModuleType:
    if name in _modules:
        return _modules[name]
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise Invalid(f"cannot load {name}")
    item = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(item)
    _modules[name] = item
    return item


def mods() -> tuple[ModuleType, ...]:
    r5 = module("r7_r5", R5 / "r4_harness.py")
    v1 = module("r7_v1", V1 / "r6_harness.py")
    v2 = module("r7_v2", V2 / "r6v2_harness.py")
    v3 = module("r7_v3", V3 / "r6v3_harness.py")
    v4 = module("r7_v4", V4 / "r6v4_harness.py")
    v5 = module("r7_v5", V5 / "r6v5_harness.py")
    v6 = module("r7_v6", V6 / "r6v6_harness.py")
    v7 = module("r7_v7", V7 / "r6v7_harness.py")
    return r5, v1, v2, v3, v4, v5, v6, v7


def artifact(slot: str, stage: str) -> tuple[bytes, dict[str, Any]]:
    if slot not in SLOTS or not re.fullmatch(r"S(?:10[AB]|20[AB]|30[AB]|40[AB]|45[AB]|50|55|60[PC K]|70|80|90)".replace(" ", ""), stage):
        raise Invalid("artifact identity invalid")
    return payload(EXEC / slot / "artifacts" / f"{stage}.json", f"{slot} {stage}")


def capture(slot: str, cell: str) -> tuple[bytes, dict[str, Any]]:
    if slot not in SLOTS or cell not in SUBJECT_CELLS:
        raise Invalid("capture identity invalid")
    return payload(EXEC / slot / "captures" / f"{cell}.json", f"{slot} {cell} capture")


def s10a_packet_expected(r5: ModuleType) -> tuple[bytes, int]:
    packet, bindings = r5.render_packet("S10A", SimpleNamespace(), "slot-alpha")
    if len(bindings) != 1:
        raise Invalid("S10A frozen binding count")
    return packet, 51204


def render(cell: str, slot: str) -> tuple[bytes, int]:
    r5, v1, v2, v3, v4, v5, _, _ = mods()
    if cell == "S10A":
        return s10a_packet_expected(r5)
    if cell == "S10B_DECISIONS":
        return v2.render_decisions()
    if cell == "S10B_TENSION":
        return v2.render_tension("B-T01")
    if cell.startswith("S10B_EDGE_"):
        edge_id = cell.removeprefix("S10B_EDGE_")
        dp, decisions = capture(slot, "S10B_DECISIONS")
        return v3.render_edge(edge_id, dp, decisions)
    if cell.startswith("S30_"):
        decision_id = cell.removeprefix("S30_")
        lane = decision_id[0]
        s20p, s20 = artifact(slot, "S20" + lane)
        return v5.render_semantic(lane, decision_id, s20p, s20)
    if cell == "S50_SEMANTIC":
        ap, a = artifact(slot, "S45A"); bp, b = artifact(slot, "S45B")
        return v1.render_s50_semantic(ap, a, bp, b)
    match = re.fullmatch(r"S60_([PCK])_(I-E[0-9]+)", cell)
    if match:
        code, edge_id = match.groups()
        ap, a = artifact(slot, "S45A"); bp, b = artifact(slot, "S45B")
        s50p, s50 = artifact(slot, "S50"); s55p, s55 = artifact(slot, "S55")
        return v4.render_s60_unit(code, edge_id, ap, a, bp, b, s50p, s50, s55p, s55)
    raise Invalid(f"unknown subject cell {cell}")


def expected(cell: str, slot: str) -> dict[str, Any]:
    r5, v1, v2, v3, v4, v5, _, _ = mods()
    if cell == "S10A":
        return r5.expected_s10("S10A")
    if cell == "S10B_DECISIONS":
        return v2.expected_decisions()
    if cell == "S10B_TENSION":
        return v2.expected_tension("B-T01")
    if cell.startswith("S10B_EDGE_"):
        edge_id = cell.removeprefix("S10B_EDGE_")
        dp, decisions = capture(slot, "S10B_DECISIONS")
        return v3.expected_edge(edge_id, dp, decisions)
    if cell.startswith("S30_"):
        decision_id = cell.removeprefix("S30_"); lane = decision_id[0]
        s20p, s20 = artifact(slot, "S20" + lane)
        return v5.expected_semantic(lane, decision_id, s20p, s20)
    if cell == "S50_SEMANTIC":
        ap, a = artifact(slot, "S45A"); bp, b = artifact(slot, "S45B")
        return v1.expected_s50_semantic(ap, a, bp, b)
    match = re.fullmatch(r"S60_([PCK])_(I-E[0-9]+)", cell)
    if match:
        code, edge_id = match.groups()
        ap, a = artifact(slot, "S45A"); bp, b = artifact(slot, "S45B")
        s50p, s50 = artifact(slot, "S50"); s55p, s55 = artifact(slot, "S55")
        return v4.expected_s60_unit(code, edge_id, ap, a, bp, b, s50p, s50, s55p, s55)
    raise Invalid(f"unknown subject cell {cell}")


def score(cell: str, slot: str, path: Path) -> tuple[dict[str, Any], int]:
    _, v1, _, _, _, v5, _, _ = mods()
    actualp, actual = payload(path, f"{slot} {cell} score input")
    want = expected(cell, slot)
    exact = v5.semantic_match(want, actual) if cell.startswith("S30_") else actual == want
    result = {
        "schema_id": "pw-r7-stage-score-v1", "replicate_id": ID, "slot": slot, "cell": cell,
        "verdict": "PASS" if exact else "FAIL", "exact": exact,
        "actual_payload_sha256": sha(actualp), "actual_payload_bytes": len(actualp),
        "expected_payload_sha256": sha(dump(want)), "expected_payload_bytes": len(dump(want)),
        "structural_diffs": [] if exact else v1.structural_diffs(want, actual),
    }
    return result, 0 if exact else 1


def reduce(slot: str, stage: str) -> dict[str, Any]:
    r5, v1, v2, v3, v4, v5, v6, v7 = mods()
    if stage == "S10A":
        return capture(slot, "S10A")[1]
    if stage == "S10B":
        dp, decisions = capture(slot, "S10B_DECISIONS"); _, tension = capture(slot, "S10B_TENSION")
        units = [capture(slot, f"S10B_EDGE_{edge_id}")[1] for edge_id in EDGE_IDS]
        return v3.reduce_s10b(dp, decisions, tension, {"protocol_id": v3.V3_ID, "stage": "S10B_EDGE_SET", "edge_units": units})
    if stage == "S20A":
        s10p, s10 = artifact(slot, "S10A")
        return r5.expected_s20("S20A", s10p, s10)
    if stage == "S20B":
        s10p, s10 = artifact(slot, "S10B")
        return v2.transform_s20b(s10p, s10)
    if stage in ("S30A", "S30B"):
        lane = stage[-1]; s20p, s20 = artifact(slot, "S20" + lane)
        units = []
        for decision in s20["decisions"]:
            decision_id = decision["id"]
            if decision_id == "B16":
                continue
            cp, obj = capture(slot, "S30_" + decision_id)
            units.append({"decision_id": decision_id, "verdict": obj["verdict"], "expected_choice": obj["expected_choice"], "evidence_binding": {"kind": "r7_fresh_first_attempt", "capture_payload_sha256": sha(cp), "capture_payload_bytes": len(cp)}})
        semantic = {"protocol_id": v5.V5_ID, "stage": "S30_SEMANTIC_SET", "lane": lane, "units": units}
        return v5.reduce_s30(lane, s20p, s20, semantic)
    if stage in ("S40A", "S40B"):
        lane = stage[-1]; s20p, s20 = artifact(slot, "S20" + lane); s30p, s30 = artifact(slot, "S30" + lane)
        return v5.project_s40(lane, s20p, s20, s30p, s30)
    if stage in ("S45A", "S45B"):
        lane = stage[-1]; s20p, s20 = artifact(slot, "S20" + lane); s30p, s30 = artifact(slot, "S30" + lane); s40p, s40 = artifact(slot, "S40" + lane)
        return v5.apply_s45(lane, s20p, s20, s30p, s30, s40p, s40)
    if stage == "S50":
        ap, a = artifact(slot, "S45A"); bp, b = artifact(slot, "S45B"); _, sem = capture(slot, "S50_SEMANTIC")
        return v1.reduce_s50(ap, a, bp, b, sem)
    if stage == "S55":
        s50p, s50 = artifact(slot, "S50")
        return r5.expected_s55(s50p, s50)
    if stage in ("S60P", "S60C", "S60K"):
        code = stage[-1]; ap, a = artifact(slot, "S45A"); bp, b = artifact(slot, "S45B"); s50p, s50 = artifact(slot, "S50"); s55p, s55 = artifact(slot, "S55")
        added = v4.new_edge_rows(s50["cross_topic_edges"], s55["cross_topic_edges"])
        units = [capture(slot, f"S60_{code}_{row['id']}")[1] for row in added]
        unit_set = {"protocol_id": v4.V4_ID, "stage": "S60_UNIT_SET", "role_code": code, "units": units}
        return v4.reduce_s60(code, ap, a, bp, b, s50p, s50, s55p, s55, unit_set)
    if stage == "S70":
        inputs = {name: artifact(slot, name) for name in ("S55", "S60P", "S60C", "S60K")}
        return v6.reduce_s70(inputs)
    if stage == "S80":
        inputs = {name: artifact(slot, name) for name in ("S50", "S55", "S60P", "S60C", "S60K", "S70")}
        return v6.transform_s80(inputs)
    if stage == "S90":
        names = ("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80")
        return v7.validate_chain({name: artifact(slot, name) for name in names})
    raise Invalid(f"unknown deterministic stage {stage}")


def expected_chain() -> tuple[dict[str, tuple[bytes, dict[str, Any]]], dict[str, dict[str, Any]]]:
    r5, v1, v2, v3, v4, v5, v6, v7 = mods()
    out: dict[str, tuple[bytes, dict[str, Any]]] = {}
    expected_by_cell: dict[str, dict[str, Any]] = {}
    s10a = r5.expected_s10("S10A"); out["S10A"] = (dump(s10a), s10a); expected_by_cell["S10A"] = s10a
    decisions = v2.expected_decisions(); dp = dump(decisions); expected_by_cell["S10B_DECISIONS"] = decisions
    tension = v2.expected_tension("B-T01"); expected_by_cell["S10B_TENSION"] = tension
    edge_units = []
    for edge_id in EDGE_IDS:
        unit = v3.expected_edge(edge_id, dp, decisions); edge_units.append(unit); expected_by_cell[f"S10B_EDGE_{edge_id}"] = unit
    s10b = v3.reduce_s10b(dp, decisions, tension, {"protocol_id": v3.V3_ID, "stage": "S10B_EDGE_SET", "edge_units": edge_units}); out["S10B"] = (dump(s10b), s10b)
    s20a = r5.expected_s20("S20A", out["S10A"][0], s10a); out["S20A"] = (dump(s20a), s20a)
    s20b = v2.transform_s20b(out["S10B"][0], s10b); out["S20B"] = (dump(s20b), s20b)
    for lane in ("A", "B"):
        s20p, s20 = out["S20" + lane]; units = []
        for decision in s20["decisions"]:
            decision_id = decision["id"]
            if decision_id == "B16": continue
            sem = v5.expected_semantic(lane, decision_id, s20p, s20); expected_by_cell["S30_" + decision_id] = sem
            units.append({"decision_id": decision_id, "verdict": sem["verdict"], "expected_choice": sem["expected_choice"], "evidence_binding": {"kind": "predeclared_oracle_identity"}})
        s30 = v5.reduce_s30(lane, s20p, s20, {"protocol_id": v5.V5_ID, "stage": "S30_SEMANTIC_SET", "lane": lane, "units": units}); out["S30" + lane] = (dump(s30), s30)
        s40 = v5.project_s40(lane, s20p, s20, out["S30" + lane][0], s30); out["S40" + lane] = (dump(s40), s40)
        s45 = v5.apply_s45(lane, s20p, s20, out["S30" + lane][0], s30, out["S40" + lane][0], s40); out["S45" + lane] = (dump(s45), s45)
    ap, a = out["S45A"]; bp, b = out["S45B"]
    sem50 = v1.expected_s50_semantic(ap, a, bp, b); expected_by_cell["S50_SEMANTIC"] = sem50
    s50 = v1.reduce_s50(ap, a, bp, b, sem50); out["S50"] = (dump(s50), s50)
    s55 = r5.expected_s55(out["S50"][0], s50); out["S55"] = (dump(s55), s55)
    for code in ("P", "C", "K"):
        added = v4.new_edge_rows(s50["cross_topic_edges"], s55["cross_topic_edges"]); units = []
        for edge in added:
            unit = v4.expected_s60_unit(code, edge["id"], ap, a, bp, b, out["S50"][0], s50, out["S55"][0], s55); units.append(unit); expected_by_cell[f"S60_{code}_{edge['id']}"] = unit
        s60 = v4.reduce_s60(code, ap, a, bp, b, out["S50"][0], s50, out["S55"][0], s55, {"protocol_id": v4.V4_ID, "stage": "S60_UNIT_SET", "role_code": code, "units": units}); out["S60" + code] = (dump(s60), s60)
    s70 = v6.reduce_s70({name: out[name] for name in ("S55", "S60P", "S60C", "S60K")}); out["S70"] = (dump(s70), s70)
    s80 = v6.transform_s80({name: out[name] for name in ("S50", "S55", "S60P", "S60C", "S60K", "S70")}); out["S80"] = (dump(s80), s80)
    s90 = v7.validate_chain(out); out["S90"] = (dump(s90), s90)
    if s90.get("terminal") != "bounded_causal_simulation_pass": raise Invalid("expected chain terminal drift")
    return out, expected_by_cell


def baseline_render(cell: str, chain: dict[str, tuple[bytes, dict[str, Any]]]) -> tuple[bytes, int]:
    r5, v1, v2, v3, v4, v5, _, _ = mods()
    if cell == "S10A": return s10a_packet_expected(r5)
    if cell == "S10B_DECISIONS": return v2.render_decisions()
    if cell == "S10B_TENSION": return v2.render_tension("B-T01")
    if cell.startswith("S10B_EDGE_"): return v3.render_edge(cell.removeprefix("S10B_EDGE_"), dump(v2.expected_decisions()), v2.expected_decisions())
    if cell.startswith("S30_"):
        decision_id = cell.removeprefix("S30_"); lane = decision_id[0]; s20p, s20 = chain["S20" + lane]
        return v5.render_semantic(lane, decision_id, s20p, s20)
    if cell == "S50_SEMANTIC":
        ap, a = chain["S45A"]; bp, b = chain["S45B"]; return v1.render_s50_semantic(ap, a, bp, b)
    match = re.fullmatch(r"S60_([PCK])_(I-E[0-9]+)", cell)
    if match:
        code, edge_id = match.groups(); ap, a = chain["S45A"]; bp, b = chain["S45B"]; s50p, s50 = chain["S50"]; s55p, s55 = chain["S55"]
        return v4.render_s60_unit(code, edge_id, ap, a, bp, b, s50p, s50, s55p, s55)
    raise Invalid(cell)


def preflight() -> dict[str, Any]:
    bindings = []
    for label, path, want_sha, want_bytes in FROZEN:
        data = regular(path, label)
        if (sha(data), len(data)) != (want_sha, want_bytes): raise Invalid(f"{label}: frozen binding drift")
        bindings.append({"label": label, "path": str(path.relative_to(SUCCESSOR)), "sha256": want_sha, "bytes": want_bytes})
    contract_storage = regular(ROOT / "replication_contract.json", "R7 contract")
    contract_obj = strict(contract_storage[:-1], "R7 contract") if contract_storage.endswith(b"\n") else strict(contract_storage, "R7 contract")
    if contract_obj.get("replicate_id") != ID or contract_obj["architecture"]["semantic_cells_total"] != 156: raise Invalid("R7 contract identity")
    chain, expected_cells = expected_chain()
    packet_rows = []
    for cell in SUBJECT_CELLS:
        packet, admitted = baseline_render(cell, chain)
        packet_rows.append({"cell": cell, "payload_sha256": sha(packet), "payload_bytes": len(packet), "admitted_source_bytes": admitted})
    _, _, v2, v3, v4, v5, v6, v7 = mods()
    holdouts = {"v2": v2.run_holdouts(), "v3": v3.run_holdouts(), "v4": v4.run_holdouts(), "v5": v5.run_holdouts(), "v6": v6.run_holdouts(), "v7": v7.run_holdouts(v7.actual_inputs())}
    return {"schema_id": "pw-r7-deterministic-preflight-v1", "replicate_id": ID, "status": "PASS", "frozen_bindings_checked": len(bindings), "frozen_bindings": bindings, "subject_cells_per_route": len(SUBJECT_CELLS), "subject_cells_total": len(SUBJECT_CELLS) * len(SLOTS), "packet_identities": packet_rows, "expected_cell_payloads": len(expected_cells), "deterministic_terminal_payload_sha256": sha(chain["S90"][0]), "deterministic_terminal_payload_bytes": len(chain["S90"][0]), "counterfactual_holdouts": holdouts, "r6_subject_outputs_used_as_empirical_credit": False, "live_plans_consulted": False}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(); sub = p.add_subparsers(dest="command", required=True)
    sub.add_parser("preflight")
    q = sub.add_parser("render"); q.add_argument("--slot", required=True, choices=SLOTS); q.add_argument("--cell", required=True, choices=SUBJECT_CELLS)
    q = sub.add_parser("expected"); q.add_argument("--slot", required=True, choices=SLOTS); q.add_argument("--cell", required=True, choices=SUBJECT_CELLS)
    q = sub.add_parser("score"); q.add_argument("--slot", required=True, choices=SLOTS); q.add_argument("--cell", required=True, choices=SUBJECT_CELLS); q.add_argument("--capture", required=True)
    q = sub.add_parser("reduce"); q.add_argument("--slot", required=True, choices=SLOTS); q.add_argument("--stage", required=True, choices=("S10A", "S10B", "S20A", "S20B", "S30A", "S30B", "S40A", "S40B", "S45A", "S45B", "S50", "S55", "S60P", "S60C", "S60K", "S70", "S80", "S90"))
    return p


def main() -> int:
    args = parser().parse_args()
    try:
        if args.command == "preflight": sys.stdout.buffer.write(dump(preflight()) + b"\n"); return 0
        if args.command == "render": sys.stdout.buffer.write(render(args.cell, args.slot)[0]); return 0
        if args.command == "expected": sys.stdout.buffer.write(dump(expected(args.cell, args.slot)) + b"\n"); return 0
        if args.command == "score":
            result, rc = score(args.cell, args.slot, Path(args.capture)); sys.stdout.buffer.write(dump(result) + b"\n"); return rc
        result = reduce(args.slot, args.stage); sys.stdout.buffer.write(dump(result) + b"\n"); return 0
    except Exception as exc:
        sys.stdout.buffer.write(dump({"schema_id": "pw-r7-controller-invalid-v1", "replicate_id": ID, "status": "INVALID_NO_EMPIRICAL_CREDIT", "error_type": type(exc).__name__, "message": str(exc)}) + b"\n")
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
