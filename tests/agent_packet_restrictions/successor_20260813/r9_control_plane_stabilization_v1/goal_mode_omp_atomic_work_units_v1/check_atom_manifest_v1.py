#!/usr/bin/env python3
"""Read-only structural checker for the R9 Goal-Mode atomic work-unit sample."""

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
from typing import Any

sys.dont_write_bytecode = True

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
DEFAULT_MANIFEST = HERE / "atom_manifest_sample_v1.json"
SCHEMA = "pw-r9-goal-mode-omp-atomic-work-unit-sample-manifest-v1"
CHECK_SCHEMA = "pw-r9-goal-mode-omp-atomic-work-unit-sample-check-v1"
MUTATION_SCHEMA = "pw-r9-goal-mode-omp-atomic-work-unit-sample-mutation-check-v1"
HEX64 = re.compile(r"^[0-9a-f]{64}$")
ATOM_ID = re.compile(r"^sample:[A-Za-z0-9_.-]+:atom-[0-9]{3}$")
ALLOWED_OPERATIONS = {
    "CHOOSE_ONE_FROM_ONE_CLOSED_OPTION_SET",
    "CLASSIFY_ONE_ITEM_ON_ONE_AXIS",
    "EXTRACT_ONE_VALUE",
    "TRANSFORM_ONE_VALUE_TO_ONE_CLOSED_SCHEMA",
    "VERIFY_ONE_CLAIM",
}
AUTHORITY = {
    "canary_launch": False,
    "matrix_launch": False,
    "omp_process_launch": False,
    "qualification_credit": 0,
    "runtime_execution": False,
}
LIMITS = {
    "evidence_slice_max_utf8_bytes": 256,
    "goal_objective_max_utf8_bytes": 256,
    "output_contract_max_utf8_bytes": 128,
    "scored_subject_max_utf8_bytes": 512,
}
TOP = {
    "artifact_id",
    "atoms",
    "authority",
    "contract_binding",
    "limits",
    "sample_cells",
    "schema_id",
    "semantic_review",
    "source_binding",
    "status",
}
CELL_FIELDS = {
    "atom_ids",
    "coverage",
    "expected_output_bytes",
    "expected_output_sha256",
    "expected_output_utf8",
    "final_atom_id",
    "index",
    "render_utf8_bytes",
    "render_utf8_sha256",
    "source_cell_id",
}
SOURCE_REF_FIELDS = {
    "authority",
    "path",
    "source_record_id",
    "source_sha256",
    "span",
}


class Invalid(RuntimeError):
    pass


class Stats:
    def __init__(self) -> None:
        self.assertions = 0

    def require(self, condition: bool, message: str) -> None:
        self.assertions += 1
        if not condition:
            raise Invalid(message)


def _pairs(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    out: dict[str, Any] = {}
    for key, value in pairs:
        if key in out:
            raise Invalid(f"duplicate JSON key:{key}")
        out[key] = value
    return out


def _nonfinite(value: str) -> None:
    raise Invalid(f"nonfinite JSON:{value}")


def _parse(raw: bytes, label: str) -> Any:
    try:
        return json.loads(
            raw.decode("utf-8"),
            object_pairs_hook=_pairs,
            parse_constant=_nonfinite,
        )
    except (UnicodeDecodeError, json.JSONDecodeError, TypeError, ValueError) as exc:
        raise Invalid(f"{label}:JSON:{exc}") from exc


def _canon(value: Any, newline: bool = True) -> bytes:
    raw = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
        allow_nan=False,
    ).encode("utf-8")
    return raw + (b"\n" if newline else b"")


def _sha(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def _read_regular(path: Path, limit: int = 32_000_000) -> bytes:
    try:
        before = path.lstat()
    except OSError as exc:
        raise Invalid(f"missing:{path}:{exc}") from exc
    if stat.S_ISLNK(before.st_mode) or not stat.S_ISREG(before.st_mode):
        raise Invalid(f"not regular nonlink:{path}")
    if before.st_size > limit:
        raise Invalid(f"oversize:{path}:{before.st_size}")
    try:
        raw = path.read_bytes()
        after = path.lstat()
    except OSError as exc:
        raise Invalid(f"read:{path}:{exc}") from exc
    if (
        before.st_dev,
        before.st_ino,
        before.st_size,
        before.st_mtime_ns,
    ) != (
        after.st_dev,
        after.st_ino,
        after.st_size,
        after.st_mtime_ns,
    ):
        raise Invalid(f"read drift:{path}")
    if len(raw) != before.st_size:
        raise Invalid(f"short read:{path}")
    return raw


def _exact_keys(value: Any, keys: set[str], label: str, stats: Stats) -> None:
    stats.require(isinstance(value, dict), f"{label}:object")
    stats.require(set(value) == keys, f"{label}:keys")


def _binding(
    value: Any,
    expected_path: Path,
    expected_rel: str,
    label: str,
    stats: Stats,
) -> bytes:
    _exact_keys(value, {"bytes", "mode", "path", "sha256"}, label, stats)
    stats.require(value["path"] == expected_rel, f"{label}:path")
    stats.require(isinstance(value["bytes"], int) and value["bytes"] > 0, f"{label}:bytes type")
    stats.require(value["mode"] == "0644", f"{label}:declared mode")
    stats.require(isinstance(value["sha256"], str) and HEX64.fullmatch(value["sha256"]) is not None, f"{label}:sha")
    raw = _read_regular(expected_path)
    mode = stat.S_IMODE(expected_path.lstat().st_mode)
    stats.require(mode == 0o644, f"{label}:live mode")
    stats.require(len(raw) == value["bytes"], f"{label}:live bytes")
    stats.require(_sha(raw) == value["sha256"], f"{label}:live sha")
    return raw


def _identity(text: str, bytes_value: Any, sha_value: Any, label: str, stats: Stats) -> None:
    raw = text.encode("utf-8")
    stats.require(bytes_value == len(raw), f"{label}:bytes")
    stats.require(isinstance(sha_value, str) and sha_value == _sha(raw), f"{label}:sha")


def _source_cells(bundle: Any, stats: Stats) -> tuple[dict[str, dict[str, Any]], list[str]]:
    stats.require(isinstance(bundle, dict) and isinstance(bundle.get("cells"), list), "bundle cells")
    by_id: dict[str, dict[str, Any]] = {}
    for row in bundle["cells"]:
        stats.require(isinstance(row, dict), "bundle cell object")
        cell_id = row.get("cell")
        stats.require(isinstance(cell_id, str) and cell_id not in by_id, "bundle cell id")
        by_id[cell_id] = row
    ordered = sorted(by_id, key=lambda key: (by_id[key]["render_utf8_bytes"], by_id[key]["index"]))
    stats.require(len(ordered) == 97, "bundle cell count")
    selected = [ordered[0], ordered[len(ordered) // 2], ordered[-1]]
    stats.require(selected == ["S10B_DECISION_B10", "S30_A14", "S10B_EDGE_B-E04"], "min median max sample")
    return by_id, selected


def _load_context(manifest_path: Path) -> tuple[dict[str, Any], bytes, dict[str, Any], dict[str, dict[str, Any]], list[str], set[str]]:
    stats = Stats()
    raw = _read_regular(manifest_path)
    manifest = _parse(raw, "manifest")
    stats.require(raw == _canon(manifest), "manifest canonical one LF")
    _exact_keys(manifest, TOP, "manifest", stats)
    stats.require(manifest["schema_id"] == SCHEMA, "manifest schema")
    stats.require(manifest["artifact_id"] == "PW-R9-GOAL-MODE-OMP-ATOMIC-WORK-UNIT-SAMPLE-MANIFEST-V1", "manifest artifact")
    stats.require(manifest["status"] == "STATIC_SAMPLE_ONLY_NO_SUBJECT_NO_PROVIDER_ZERO_CREDIT", "manifest status")
    stats.require(manifest["authority"] == AUTHORITY, "authority")
    stats.require(manifest["limits"] == LIMITS, "limits")
    contract_path = ROOT / "r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json"
    contract_raw = _binding(
        manifest["contract_binding"],
        contract_path,
        "r9_goal_mode_omp_atomic_work_unit_impact_assessment_v1.json",
        "contract binding",
        stats,
    )
    contract = _parse(contract_raw, "contract")
    stats.require(contract_raw == _canon(contract), "contract canonical")
    fields = contract.get("atomic_work_unit_contract", {}).get("closed_manifest_fields")
    stats.require(isinstance(fields, list) and len(fields) == len(set(fields)), "closed atom fields")
    atom_fields = set(fields)
    bundle_path = ROOT / "formal_candidate_v7" / "semantic_bundle.json"
    bundle_raw = _binding(
        manifest["source_binding"],
        bundle_path,
        "formal_candidate_v7/semantic_bundle.json",
        "source binding",
        stats,
    )
    bundle = _parse(bundle_raw, "bundle")
    by_id, selected = _source_cells(bundle, stats)
    return manifest, raw, contract, by_id, selected, atom_fields


def _validate_manifest(
    manifest: dict[str, Any],
    contract: dict[str, Any],
    source_cells: dict[str, dict[str, Any]],
    selected: list[str],
    atom_fields: set[str],
) -> Stats:
    stats = Stats()
    _exact_keys(manifest, TOP, "manifest", stats)
    stats.require(manifest["schema_id"] == SCHEMA, "schema")
    stats.require(manifest["status"] == "STATIC_SAMPLE_ONLY_NO_SUBJECT_NO_PROVIDER_ZERO_CREDIT", "status")
    stats.require(manifest["authority"] == AUTHORITY, "authority")
    stats.require(manifest["limits"] == LIMITS, "limits")
    review = manifest["semantic_review"]
    _exact_keys(
        review,
        {"mechanical_checker_can_certify", "required_before_runtime", "reviewer_must_check", "status"},
        "semantic review",
        stats,
    )
    stats.require(review["required_before_runtime"] is True, "semantic review required")
    stats.require(review["status"] == "PENDING_INDEPENDENT_SEMANTIC_REVIEW_ZERO_AUTHORITY", "semantic review pending")
    stats.require(
        review["mechanical_checker_can_certify"]
        == "STRUCTURAL_CARDINALITY_DEPENDENCY_COVERAGE_HASH_AND_BYTE_LIMITS_ONLY",
        "mechanical claim boundary",
    )
    checks = review["reviewer_must_check"]
    stats.require(isinstance(checks, list) and len(checks) == 5 and len(set(checks)) == 5, "semantic checklist")
    atoms = manifest["atoms"]
    cells = manifest["sample_cells"]
    stats.require(isinstance(atoms, list) and len(atoms) == 5, "sample atom count")
    stats.require(isinstance(cells, list) and len(cells) == 3, "sample cell count")
    stats.require([cell.get("source_cell_id") for cell in cells] == selected, "sample cell order")
    by_atom: dict[str, dict[str, Any]] = {}
    prompt_hashes: set[str] = set()
    objective_hashes: set[str] = set()
    for ordinal, atom in enumerate(atoms):
        _exact_keys(atom, atom_fields, f"atom:{ordinal}", stats)
        atom_id = atom["atom_id"]
        stats.require(isinstance(atom_id, str) and ATOM_ID.fullmatch(atom_id) is not None, f"atom id:{ordinal}")
        stats.require(atom_id not in by_atom, f"atom duplicate:{atom_id}")
        by_atom[atom_id] = atom
        stats.require(atom["source_cell_id"] in source_cells, f"atom source cell:{atom_id}")
        stats.require(isinstance(atom["atom_index"], int) and atom["atom_index"] >= 0, f"atom index:{atom_id}")
        stats.require(isinstance(atom["atom_count"], int) and atom["atom_count"] > 0, f"atom count:{atom_id}")
        stats.require(atom["operation_kind"] in ALLOWED_OPERATIONS, f"operation:{atom_id}")
        stats.require(atom["input_kind"] in {"SOURCE_SLICE", "VERIFIED_ATOM_OUTPUTS"}, f"input kind:{atom_id}")
        stats.require(atom["cell_output_role"] in {"INTERMEDIATE", "FINAL"}, f"output role:{atom_id}")
        for key in (
            "acceptance_criterion",
            "evidence_slice_utf8",
            "expected_output_schema",
            "expected_output_utf8",
            "goal_objective_utf8",
            "objective",
            "prompt_utf8",
        ):
            stats.require(isinstance(atom[key], str) and atom[key] != "", f"{key}:{atom_id}")
        _identity(atom["evidence_slice_utf8"], atom["evidence_slice_utf8_bytes"], atom["evidence_slice_utf8_sha256"], f"evidence:{atom_id}", stats)
        _identity(atom["expected_output_utf8"], atom["expected_output_utf8_bytes"], atom["expected_output_utf8_sha256"], f"expected:{atom_id}", stats)
        _identity(atom["goal_objective_utf8"], atom["goal_objective_utf8_bytes"], atom["goal_objective_utf8_sha256"], f"goal objective:{atom_id}", stats)
        _identity(atom["prompt_utf8"], atom["prompt_utf8_bytes"], atom["prompt_utf8_sha256"], f"prompt:{atom_id}", stats)
        stats.require(atom["evidence_slice_utf8_bytes"] <= LIMITS["evidence_slice_max_utf8_bytes"], f"evidence limit:{atom_id}")
        stats.require(atom["goal_objective_utf8_bytes"] <= LIMITS["goal_objective_max_utf8_bytes"], f"objective limit:{atom_id}")
        stats.require(len(atom["expected_output_schema"].encode("utf-8")) <= LIMITS["output_contract_max_utf8_bytes"], f"schema limit:{atom_id}")
        stats.require(atom["prompt_utf8_bytes"] <= LIMITS["scored_subject_max_utf8_bytes"], f"prompt limit:{atom_id}")
        stats.require("\r" not in atom["prompt_utf8"], f"prompt CR:{atom_id}")
        stats.require(atom["prompt_utf8"].count(atom["evidence_slice_utf8"]) == 1, f"evidence prompt binding:{atom_id}")
        stats.require(atom["prompt_utf8"].count("Return only ") == 1, f"single output instruction:{atom_id}")
        stats.require(atom["prompt_utf8"].endswith("Then mark the active Goal complete."), f"terminal instruction:{atom_id}")
        expected = _parse(atom["expected_output_utf8"].encode("utf-8"), f"expected:{atom_id}")
        stats.require(isinstance(expected, dict) and len(expected) == 1, f"one output field:{atom_id}")
        stats.require(_canon(expected, newline=False).decode("utf-8") == atom["expected_output_utf8"], f"canonical output:{atom_id}")
        stats.require(isinstance(atom["dependency_atom_ids"], list), f"dependencies list:{atom_id}")
        stats.require(isinstance(atom["source_record_refs"], list), f"source refs list:{atom_id}")
        stats.require(isinstance(atom["non_goals"], list) and len(atom["non_goals"]) == 3 and len(set(atom["non_goals"])) == 3, f"non-goals:{atom_id}")
        stats.require(atom["prompt_utf8_sha256"] not in prompt_hashes, f"prompt reuse:{atom_id}")
        stats.require(atom["goal_objective_utf8_sha256"] not in objective_hashes, f"objective reuse:{atom_id}")
        prompt_hashes.add(atom["prompt_utf8_sha256"])
        objective_hashes.add(atom["goal_objective_utf8_sha256"])
        for ref in atom["source_record_refs"]:
            _exact_keys(ref, SOURCE_REF_FIELDS, f"source ref:{atom_id}", stats)
            stats.require(all(isinstance(ref[key], str) and ref[key] for key in SOURCE_REF_FIELDS), f"source ref strings:{atom_id}")
            stats.require(HEX64.fullmatch(ref["source_sha256"]) is not None, f"source ref sha:{atom_id}")
        if atom["input_kind"] == "SOURCE_SLICE":
            stats.require(atom["dependency_atom_ids"] == [], f"source dependencies:{atom_id}")
            stats.require(len(atom["source_record_refs"]) == 1, f"source ref cardinality:{atom_id}")
        else:
            stats.require(len(atom["dependency_atom_ids"]) > 0, f"verified dependencies:{atom_id}")
            stats.require(atom["source_record_refs"] == [], f"verified source refs:{atom_id}")
    stats.require(len(prompt_hashes) == len(atoms), "global prompt uniqueness")
    stats.require(len(objective_hashes) == len(atoms), "global objective uniqueness")
    position = {atom["atom_id"]: index for index, atom in enumerate(atoms)}
    for atom in atoms:
        deps = atom["dependency_atom_ids"]
        stats.require(len(deps) == len(set(deps)), f"dependency uniqueness:{atom['atom_id']}")
        for dep in deps:
            stats.require(dep in by_atom, f"dependency exists:{atom['atom_id']}")
            stats.require(position[dep] < position[atom["atom_id"]], f"dependency order:{atom['atom_id']}")
            stats.require(by_atom[dep]["source_cell_id"] == atom["source_cell_id"], f"dependency cell:{atom['atom_id']}")
        if atom["input_kind"] == "VERIFIED_ATOM_OUTPUTS":
            observed = _parse(atom["evidence_slice_utf8"].encode("utf-8"), f"dependency evidence:{atom['atom_id']}")
            required = [
                _parse(by_atom[dep]["expected_output_utf8"].encode("utf-8"), f"dependency output:{dep}")
                for dep in deps
            ]
            stats.require(observed == required, f"dependency output binding:{atom['atom_id']}")
    cell_ids_seen: set[str] = set()
    all_cell_atoms: set[str] = set()
    for cell in cells:
        _exact_keys(cell, CELL_FIELDS, f"cell:{cell.get('source_cell_id')}", stats)
        cell_id = cell["source_cell_id"]
        stats.require(cell_id in source_cells and cell_id not in cell_ids_seen, f"cell id:{cell_id}")
        cell_ids_seen.add(cell_id)
        source = source_cells[cell_id]
        stats.require(cell["index"] == source["index"], f"cell index:{cell_id}")
        stats.require(cell["render_utf8_bytes"] == source["render_utf8_bytes"], f"cell render bytes:{cell_id}")
        stats.require(cell["render_utf8_sha256"] == source["render_utf8_sha256"], f"cell render sha:{cell_id}")
        stats.require(cell["expected_output_utf8"] == source["expected_output_utf8"], f"cell expected:{cell_id}")
        stats.require(cell["expected_output_bytes"] == source["expected_output_bytes"], f"cell expected bytes:{cell_id}")
        stats.require(cell["expected_output_sha256"] == source["expected_output_sha256"], f"cell expected sha:{cell_id}")
        ids = cell["atom_ids"]
        stats.require(isinstance(ids, list) and len(ids) > 0 and len(ids) == len(set(ids)), f"cell atoms:{cell_id}")
        stats.require(all(atom_id in by_atom and by_atom[atom_id]["source_cell_id"] == cell_id for atom_id in ids), f"cell atom binding:{cell_id}")
        stats.require([by_atom[atom_id]["atom_index"] for atom_id in ids] == list(range(len(ids))), f"cell atom indices:{cell_id}")
        stats.require(all(by_atom[atom_id]["atom_count"] == len(ids) for atom_id in ids), f"cell atom counts:{cell_id}")
        finals = [atom_id for atom_id in ids if by_atom[atom_id]["cell_output_role"] == "FINAL"]
        stats.require(finals == [cell["final_atom_id"]], f"cell final cardinality:{cell_id}")
        final = by_atom[cell["final_atom_id"]]
        stats.require(final["expected_output_utf8"] == cell["expected_output_utf8"], f"cell reconstruction:{cell_id}")
        stats.require(final["cell_reconstruction_ref"] == f"FINAL_ATOM_OUTPUT:{final['atom_id']}", f"final reconstruction ref:{cell_id}")
        coverage = cell["coverage"]
        stats.require(isinstance(coverage, list) and len(coverage) == 5, f"coverage count:{cell_id}")
        element_ids: set[str] = set()
        mapped: set[str] = set()
        for row in coverage:
            stats.require(isinstance(row, dict) and set(row) in ({"atom_ids", "classification", "element_id"}, {"atom_ids", "classification", "element_id", "note"}), f"coverage keys:{cell_id}")
            stats.require(isinstance(row["element_id"], str) and row["element_id"] not in element_ids, f"coverage element:{cell_id}")
            element_ids.add(row["element_id"])
            stats.require(isinstance(row["atom_ids"], list) and all(atom_id in ids for atom_id in row["atom_ids"]), f"coverage atoms:{cell_id}")
            if row["classification"] == "SHARED_NON_SUBJECT_CONTROL":
                stats.require(row["element_id"] == "CONTROL" and row["atom_ids"] == [] and isinstance(row.get("note"), str), f"shared control:{cell_id}")
            else:
                stats.require(row["classification"] == "SUBJECT_MATERIAL" and len(row["atom_ids"]) > 0 and "note" not in row, f"subject material:{cell_id}")
                mapped.update(row["atom_ids"])
        stats.require("CONTROL" in element_ids and "OUTPUT_CONTRACT" in element_ids, f"coverage minima:{cell_id}")
        stats.require(mapped == set(ids), f"coverage completeness:{cell_id}")
        all_cell_atoms.update(ids)
    stats.require(all_cell_atoms == set(by_atom), "all atoms assigned")
    legacy_sizes = [row["render_utf8_bytes"] for row in source_cells.values()]
    stats.require(min(legacy_sizes) == 1711 and max(legacy_sizes) == 11473, "legacy extrema")
    stats.require(sum(1 for value in legacy_sizes if value <= 4096) == 41, "legacy <=4096 count")
    stats.require(sum(1 for value in legacy_sizes if value > 4096) == 56, "legacy >4096 count")
    stats.require(max(atom["prompt_utf8_bytes"] for atom in atoms) == 335, "sample max prompt")
    stats.require(all(atom["prompt_utf8_bytes"] < source_cells[atom["source_cell_id"]]["render_utf8_bytes"] for atom in atoms), "no direct legacy render")
    contract_fields = contract["atomic_work_unit_contract"]["closed_manifest_fields"]
    stats.require(set(contract_fields) == atom_fields, "contract atom field set stable")
    return stats


def _rehash(atom: dict[str, Any], stem: str) -> None:
    text_key = {
        "evidence": "evidence_slice_utf8",
        "expected": "expected_output_utf8",
        "objective": "goal_objective_utf8",
        "prompt": "prompt_utf8",
    }[stem]
    prefix = {
        "evidence": "evidence_slice",
        "expected": "expected_output",
        "objective": "goal_objective",
        "prompt": "prompt",
    }[stem]
    raw = atom[text_key].encode("utf-8")
    atom[f"{prefix}_utf8_bytes"] = len(raw)
    atom[f"{prefix}_utf8_sha256"] = _sha(raw)


def _mutants(original: dict[str, Any], source_cells: dict[str, dict[str, Any]]) -> list[tuple[str, dict[str, Any]]]:
    out: list[tuple[str, dict[str, Any]]] = []

    def add(name: str, fn: Any) -> None:
        value = copy.deepcopy(original)
        fn(value)
        out.append((name, value))

    add("authority", lambda v: v["authority"].__setitem__("matrix_launch", True))
    add("missing-atom-field", lambda v: v["atoms"][0].pop("objective"))
    add("prompt-hash", lambda v: v["atoms"][0].__setitem__("prompt_utf8_sha256", "0" * 64))
    add("prompt-bytes", lambda v: v["atoms"][0].__setitem__("prompt_utf8_bytes", 1))
    add("evidence-hash", lambda v: v["atoms"][0].__setitem__("evidence_slice_utf8_sha256", "0" * 64))
    add("objective-hash", lambda v: v["atoms"][0].__setitem__("goal_objective_utf8_sha256", "0" * 64))
    add("expected-hash", lambda v: v["atoms"][0].__setitem__("expected_output_utf8_sha256", "0" * 64))
    add("duplicate-atom", lambda v: v["atoms"][1].__setitem__("atom_id", v["atoms"][0]["atom_id"]))
    add("atom-count", lambda v: v["atoms"][2].__setitem__("atom_count", 4))
    add("atom-index", lambda v: v["atoms"][3].__setitem__("atom_index", 9))
    add("missing-dependency", lambda v: v["atoms"][4]["dependency_atom_ids"].__setitem__(0, "sample:missing:atom-000"))
    add("forward-dependency", lambda v: v["atoms"][2].__setitem__("dependency_atom_ids", [v["atoms"][4]["atom_id"]]))
    add("input-kind", lambda v: v["atoms"][0].__setitem__("input_kind", "COMPOUND"))
    add("two-output-fields", lambda v: (v["atoms"][0].__setitem__("expected_output_utf8", '{"a":1,"b":2}'), _rehash(v["atoms"][0], "expected")))
    add("prompt-over-limit", lambda v: (v["atoms"][0].__setitem__("prompt_utf8", v["atoms"][0]["prompt_utf8"] + (" X" * 300)), _rehash(v["atoms"][0], "prompt")))
    add("objective-over-limit", lambda v: (v["atoms"][0].__setitem__("goal_objective_utf8", "x" * 257), _rehash(v["atoms"][0], "objective")))
    add("coverage-empty", lambda v: v["sample_cells"][0]["coverage"][1].__setitem__("atom_ids", []))
    add("coverage-control-mapped", lambda v: v["sample_cells"][0]["coverage"][0].__setitem__("atom_ids", [v["atoms"][0]["atom_id"]]))
    add("coverage-duplicate", lambda v: v["sample_cells"][0]["coverage"][1].__setitem__("element_id", "CONTROL"))
    add("cell-output", lambda v: v["sample_cells"][0].__setitem__("expected_output_utf8", '{"selected_choice":"wrong"}'))
    add("semantic-review-authority", lambda v: v["semantic_review"].__setitem__("status", "PASS"))
    add("direct-legacy-render", lambda v: (v["atoms"][0].__setitem__("prompt_utf8", source_cells[v["atoms"][0]["source_cell_id"]]["render_utf8"]), _rehash(v["atoms"][0], "prompt")))
    return out


def _snapshot() -> dict[str, tuple[int, int, str]]:
    out: dict[str, tuple[int, int, str]] = {}
    for path in sorted(HERE.iterdir(), key=lambda value: value.name):
        if path.is_file() and not path.is_symlink():
            raw = _read_regular(path)
            out[path.name] = (len(raw), stat.S_IMODE(path.lstat().st_mode), _sha(raw))
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--mutation-self-test", action="store_true")
    args = parser.parse_args()
    manifest_path = Path(args.manifest)
    if not manifest_path.is_absolute():
        raise Invalid("--manifest must be absolute")
    if manifest_path.resolve() != DEFAULT_MANIFEST.resolve():
        raise Invalid("unexpected manifest path")
    before = _snapshot()
    manifest, raw, contract, source_cells, selected, atom_fields = _load_context(manifest_path)
    stats = _validate_manifest(manifest, contract, source_cells, selected, atom_fields)
    mutation_count = 0
    if args.mutation_self_test:
        for name, mutant in _mutants(manifest, source_cells):
            try:
                _validate_manifest(mutant, contract, source_cells, selected, atom_fields)
            except Invalid:
                mutation_count += 1
                continue
            raise Invalid(f"mutation accepted:{name}")
    after = _snapshot()
    if before != after:
        raise Invalid("workspace drift")
    result = {
        "assertion_count": stats.assertions,
        "atom_count": len(manifest["atoms"]),
        "cell_count": len(manifest["sample_cells"]),
        "first_mismatch": None,
        "manifest_bytes": len(raw),
        "manifest_sha256": _sha(raw),
        "max_prompt_utf8_bytes": max(atom["prompt_utf8_bytes"] for atom in manifest["atoms"]),
        "mutation_count": mutation_count,
        "qualification_credit": 0,
        "schema_id": MUTATION_SCHEMA if args.mutation_self_test else CHECK_SCHEMA,
        "semantic_review_status": manifest["semantic_review"]["status"],
        "status": "PASS_MECHANICAL_ONLY_ZERO_CREDIT",
        "workspace_writes": 0,
    }
    sys.stdout.buffer.write(_canon(result))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Invalid as exc:
        result = {
            "assertion_count": 0,
            "first_mismatch": str(exc),
            "mutation_count": 0,
            "qualification_credit": 0,
            "schema_id": CHECK_SCHEMA,
            "status": "FAIL",
            "workspace_writes": 0,
        }
        sys.stdout.buffer.write(_canon(result))
        raise SystemExit(1)
