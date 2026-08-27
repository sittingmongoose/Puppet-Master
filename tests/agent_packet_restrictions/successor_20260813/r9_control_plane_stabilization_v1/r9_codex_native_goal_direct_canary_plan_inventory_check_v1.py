#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import stat
import sys
from pathlib import Path


SCHEMA = "pw-r9-codex-native-goal-direct-canary-plan-inventory-check-v1"
MATRIX_ID = "codex-native-goal-direct-canary-002"
PUBLIC = "codex_native_goal_direct_canary_002_public_plan_v1"
SCORER = "codex_native_goal_direct_canary_002_scorer_plan_v1"
COMPILE_RECEIPT = {
    "bytes": 2301,
    "mode": "0644",
    "path": "r9_codex_native_goal_direct_canary_002_atomic_compile_receipt_v1.json",
    "sha256": "5fe04cb136efc2ed498fa6a8d78398bf206aad267da3bb3828d8a5c2c449e487",
}
EXPECTED_PUBLIC_TOKENS = {
    "expected_output", "expected_output_bytes", "expected_output_sha256",
    "expected_output_storage_bytes", "expected_output_storage_sha256", "expected_output_utf8",
}


class Invalid(Exception):
    pass


def fail(message):
    raise Invalid(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def canonical_no_lf(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")


def canonical(value):
    return canonical_no_lf(value) + b"\n"


def unique_object(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            fail(f"duplicate-key:{key}")
        out[key] = value
    return out


def parse_json(data, where):
    try:
        value = json.loads(
            data.decode("utf-8"),
            object_pairs_hook=unique_object,
            parse_constant=lambda item: fail(f"nonfinite:{where}:{item}"),
        )
    except Invalid:
        raise
    except Exception as exc:
        fail(f"json:{where}:{type(exc).__name__}")
    if data != canonical(value):
        fail(f"canonical:{where}")
    return value


def read_bound(base, binding, where):
    path = base / binding["path"]
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or f"{stat.S_IMODE(info.st_mode):04o}" != binding["mode"]:
        fail(f"type-or-mode:{where}")
    data = path.read_bytes()
    if len(data) != binding["bytes"] or sha256(data) != binding["sha256"]:
        fail(f"identity:{where}")
    return data


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for item in value:
            yield from strings(item)
    elif isinstance(value, dict):
        for key, item in value.items():
            yield key
            yield from strings(item)


def forbidden_public_key(value, where=""):
    if isinstance(value, dict):
        for key, item in value.items():
            if key in EXPECTED_PUBLIC_TOKENS or key.startswith("expected_output"):
                fail(f"expected-leak:{where}/{key}")
            forbidden_public_key(item, f"{where}/{key}")
    elif isinstance(value, list):
        for index, item in enumerate(value):
            forbidden_public_key(item, f"{where}/{index}")


def inventory(root, kind):
    root_info = root.lstat()
    if not stat.S_ISDIR(root_info.st_mode) or stat.S_ISLNK(root_info.st_mode) or stat.S_IMODE(root_info.st_mode) != 0o700:
        fail(f"root-custody:{kind}")
    rows = []
    values = {}
    directory_count = 0
    total_bytes = 0
    for parent, directories, files in os.walk(root, followlinks=False):
        parent_path = Path(parent)
        directory_count += 1
        pinfo = parent_path.lstat()
        if not stat.S_ISDIR(pinfo.st_mode) or stat.S_ISLNK(pinfo.st_mode) or stat.S_IMODE(pinfo.st_mode) != 0o700:
            fail(f"directory-custody:{kind}")
        for name in directories:
            child = parent_path / name
            info = child.lstat()
            if not stat.S_ISDIR(info.st_mode) or stat.S_ISLNK(info.st_mode):
                fail(f"directory-type:{kind}")
        for name in files:
            path = parent_path / name
            info = path.lstat()
            relative = path.relative_to(root).as_posix()
            if not stat.S_ISREG(info.st_mode) or stat.S_ISLNK(info.st_mode) or stat.S_IMODE(info.st_mode) != 0o644:
                fail(f"file-custody:{kind}:{relative}")
            data = path.read_bytes()
            total_bytes += len(data)
            rows.append({"bytes": len(data), "mode": "0644", "path": relative, "sha256": sha256(data)})
            values[relative] = parse_json(data, f"{kind}:{relative}")
            if any("/mnt/Cursor" in text or "P:\\" in text for text in strings(values[relative])):
                fail(f"local-path:{kind}:{relative}")
            if kind == "public":
                forbidden_public_key(values[relative], relative)
    rows.sort(key=lambda item: item["path"])
    projection = canonical_no_lf(rows)
    return {
        "directory_count": directory_count,
        "file_count": len(rows),
        "projection_bytes": len(projection),
        "projection_sha256": sha256(projection),
        "total_file_bytes": total_bytes,
    }, values


def run(base):
    receipt_data = read_bound(base, COMPILE_RECEIPT, "compile-receipt")
    receipt = parse_json(receipt_data, "compile-receipt")
    if receipt.get("status") != "COMPILED_CREATE_ONLY_ZERO_CREDIT_NO_EMPIRICAL_AUTHORITY":
        fail("compile-receipt-status")
    lexical = [receipt.get("public_root", {}).get("lexical_path"), receipt.get("scorer_root", {}).get("lexical_path")]
    if not all(isinstance(item, str) and item.startswith("/mnt/Cursor/PuppetMaster/") for item in lexical):
        fail("compile-receipt-local-path-not-preserved")
    public_summary, public_values = inventory(base / PUBLIC, "public")
    scorer_summary, scorer_values = inventory(base / SCORER, "scorer")
    if public_summary["file_count"] != 294 or public_summary["directory_count"] != 99:
        fail("public-counts")
    if scorer_summary["file_count"] != 2 or scorer_summary["directory_count"] != 1:
        fail("scorer-counts")
    manifest = public_values.get("manifest.json")
    capacity = public_values.get("capacity.json")
    if manifest.get("schema_id") != "pw-r9-codex-native-goal-atomic-public-manifest-v1" or manifest.get("matrix_id") != MATRIX_ID:
        fail("public-manifest")
    if capacity.get("schema_id") != "pw-r9-codex-native-goal-atomic-capacity-report-v1" or capacity.get("exact_atom_count") != 15612:
        fail("capacity")
    cells = [(path, value) for path, value in public_values.items() if path.startswith("cells/")]
    if len(cells) != 291:
        fail("cell-count")
    atom_count = 0
    routes = {"slot-alpha": 0, "slot-bravo": 0, "slot-charlie": 0}
    for path, cell in cells:
        if cell.get("schema_id") != "pw-r9-codex-native-goal-atomic-cell-dag-v1" or cell.get("matrix_id") != MATRIX_ID:
            fail(f"cell-schema:{path}")
        route = cell.get("route")
        if route not in routes or not isinstance(cell.get("nodes"), list):
            fail(f"cell-route:{path}")
        routes[route] += len(cell["nodes"])
        atom_count += len(cell["nodes"])
    if atom_count != 15612 or routes != {"slot-alpha": 5204, "slot-bravo": 5204, "slot-charlie": 5204}:
        fail("atom-roster")
    scorer = scorer_values.get("manifest.json")
    if scorer.get("schema_id") != "pw-r9-codex-native-goal-atomic-scorer-v1" or scorer.get("matrix_id") != MATRIX_ID or scorer.get("cell_count") != 97:
        fail("scorer-manifest")
    return {
        "atom_count": atom_count,
        "check": "PASS",
        "compile_receipt": {**COMPILE_RECEIPT, "disposition": "FAIL_LOCAL_ABSOLUTE_PATH_CONTAMINATION_NONAUTHORITATIVE"},
        "first_mismatch": None,
        "matrix_id": MATRIX_ID,
        "public_root": {"path": PUBLIC, **public_summary},
        "qualification_credit": 0,
        "route_atom_counts": routes,
        "schema_id": SCHEMA,
        "scorer_root": {"path": SCORER, **scorer_summary},
        "status": "PASS_PATH_NEUTRAL_CANARY_PLAN_INVENTORY_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
        "workspace_writes": 0,
    }


def main():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--base", required=True)
    parser.add_argument("--check", action="store_true")
    args, extra = parser.parse_known_args()
    try:
        if extra or not args.check:
            fail("CLI")
        base = Path(args.base)
        if not base.is_absolute() or not base.is_dir():
            fail("base")
        result = run(base.resolve())
        code = 0
    except (Invalid, OSError, ValueError, TypeError, KeyError, AttributeError) as exc:
        result = {
            "check": "FAIL",
            "first_mismatch": str(exc),
            "qualification_credit": 0,
            "schema_id": SCHEMA,
            "status": "FAIL_ZERO_CREDIT_NO_LAUNCH_AUTHORITY",
            "workspace_writes": 0,
        }
        code = 1
    sys.stdout.buffer.write(canonical(result))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
