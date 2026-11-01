#!/usr/bin/env python3
"""Cross-check Plans/storage_value_registry.json storage_profile against its families (DL-270, SP-340).

Checks what JSON Schema cannot: every registered family has exactly one profile, every group a profile
or planned family names exists, canonical families sit in groups with a canonical budget and derived
ones in groups with a derived budget, each storage kind maps to its physical file, group ids are unique, redb value limits stay within value_limit_bytes, planned family
ids do not collide with registered ones, and owner units and documents exist. Prints a JSON report and
exits 1 when anything fails. Read-only.
"""
import json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
CANONICAL_KINDS = {"redb", "canonical_file", "redb_and_seglog", "seglog"}
DERIVED_KINDS = {"redb_projection", "redb_checkpoint", "redb_index"}
KIND_FILE = {"redb": "canonical", "redb_and_seglog": "canonical", "canonical_file": "file", "seglog": "seglog",
             "redb_projection": "derived", "redb_checkpoint": "derived", "redb_index": "derived"}

def main() -> int:
    reg = json.loads((ROOT / "Plans/storage_value_registry.json").read_text(encoding="utf-8"))
    prof = reg.get("storage_profile")
    errors = []
    if not isinstance(prof, dict):
        print(json.dumps({"status": "fail", "errors": ["storage_profile missing"]}, indent=2)); return 1
    families = {f["family_id"]: f for f in reg["families"]}
    profiles = prof["family_profiles"]
    groups = {g["group_id"]: g for g in prof["groups"]}
    if len(groups) != len(prof["groups"]): errors.append("duplicate group_id in storage_profile.groups")
    for fid in sorted(set(families) - set(profiles)): errors.append(f"family without a profile: {fid}")
    for fid in sorted(set(profiles) - set(families)): errors.append(f"profile without a family: {fid}")
    limit = prof["value_limit_bytes"]
    for fid, pr in sorted(profiles.items()):
        g = groups.get(pr["storage_group"])
        if g is None: errors.append(f"{fid}: unknown storage_group {pr['storage_group']}"); continue
        kind = families.get(fid, {}).get("storage_kind")
        if kind in CANONICAL_KINDS and g["canonical_budget_bytes"] is None: errors.append(f"{fid}: canonical family in group {g['group_id']} without a canonical budget")
        if kind in DERIVED_KINDS and g["derived_budget_bytes"] is None: errors.append(f"{fid}: derived family in group {g['group_id']} without a derived budget")
        if kind not in CANONICAL_KINDS | DERIVED_KINDS: errors.append(f"{fid}: unclassified storage_kind {kind}")
        elif pr["redb_file"] != KIND_FILE[kind]: errors.append(f"{fid}: storage_kind {kind} must live in redb_file {KIND_FILE[kind]}, not {pr['redb_file']}")
        if pr["redb_file"] in ("canonical", "derived") and not (1 <= pr.get("max_value_bytes", 0) <= limit): errors.append(f"{fid}: redb value limit missing or above {limit}")
    units = set()
    for line in (ROOT / "Plans/.plan_index/plan_units.jsonl").read_text(encoding="utf-8").splitlines():
        if line.strip(): units.add(json.loads(line).get("plan_unit_id"))
    for pf in prof["planned_families"]:
        if pf["family_id"] in families: errors.append(f"planned family collides with a registered one: {pf['family_id']}")
        if pf["storage_group"] not in groups: errors.append(f"planned {pf['family_id']}: unknown storage_group {pf['storage_group']}")
        if pf["owner_unit"] not in units: errors.append(f"planned {pf['family_id']}: owner unit {pf['owner_unit']} not in the plan index")
        if not (1 <= pf["max_value_bytes"] <= limit): errors.append(f"planned {pf['family_id']}: value limit above {limit}")
    for u in prof["owner_units"] + prof.get("maintenance", {}).get("owner_units", []):
        if u not in units: errors.append(f"owner unit {u} not in the plan index")
    for wk in prof["whole_document_keys"]:
        if not (ROOT / wk["owner_doc"]).is_file(): errors.append(f"whole-document key {wk['key']}: owner document {wk['owner_doc']} missing")
    report = {"status": "fail" if errors else "pass", "families": len(families), "profiles": len(profiles),
              "groups": len(groups), "planned_families": len(prof["planned_families"]), "errors": errors}
    print(json.dumps(report, indent=2)); return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())
