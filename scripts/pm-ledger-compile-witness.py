#!/usr/bin/env python3
"""Deterministic compile witnesses for a v2 planning ledger.

Witness 1, repairs versus targets: every findings record that names a PlanUnit as repaired must have that unit
among the compile queue targets of the record's atoms, and (when --base is given) the unit must actually differ
from the base revision.

Witness 2, exact tokens: every exact token of a compiled atom must appear in the prose of at least one owner PlanUnit
the atom's queue item compiled into, and in at least one of those units' preserved_exact_tokens registries. Tokens
that appear only in companion outputs (schemas, fixtures) are reported as such, never counted as present in an owner unit.

Witness 3, registry hygiene: every entry in an owner unit's preserved_exact_tokens registry must occur in that unit's
own text (the registry line itself excluded), for every unit the compile targets.

All three witnesses are static text checks; they need no model and make no judgment about meaning. Exit 0 when no
witness fires, 2 when at least one does, 1 on a usage or read error.
"""
from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

UNIT_HEAD = re.compile(r"^(#{2,4})\s+([A-Z][A-Za-z0-9]*-\d+)\s*[-–—:]\s+(.*)$")
ANY_HEAD = re.compile(r"^#{1,6}\s")
UNIT_ID = re.compile(r"\b([A-Z]{2,5}-\d{3})\b")
CANDIDATE_ID = re.compile(r"\b([A-Z0-9]{2,5}-\d{2})\b")
RECORD_HEAD = re.compile(r"^Records?\s+\d", re.I)
REPAIRS = re.compile(r"\bRepairs\s+(.+?)(?:\.\s|\.$|,\s+which|,\s+whose|\s+and\s+section\b)", re.S)


def load_jsonl(path: Path) -> list[dict]:
    rows = []
    if not path.exists():
        return rows
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            rows.append(json.loads(line))
    return rows


PLAN_UNIT_ID = re.compile(r"^\s*plan_unit_id:\s*([A-Z][A-Za-z0-9]*-\d+)\s*$")


def units_in(text: str) -> dict[str, dict]:
    """First block per unit id. A unit is either a '## ID - title' heading through the line before the next heading,
    or, for units that carry no heading of their own, the fenced block that declares its plan_unit_id."""
    lines = text.splitlines()
    out: dict[str, dict] = {}
    i = 0
    while i < len(lines):
        m = UNIT_HEAD.match(lines[i])
        if not m:
            i += 1
            continue
        j = i + 1
        while j < len(lines) and not ANY_HEAD.match(lines[j]):
            j += 1
        block = "\n".join(lines[i:j]).rstrip()
        out.setdefault(m.group(2), {"line_start": i + 1, "line_end": j, "text": block})
        i = j
    i = 0
    while i < len(lines):
        if not lines[i].strip().startswith("```"):
            i += 1
            continue
        k = i + 1
        while k < len(lines) and not lines[k].strip().startswith("```"):
            k += 1
        ids = [mm.group(1) for mm in (PLAN_UNIT_ID.match(l) for l in lines[i + 1:k]) if mm]
        if ids and ids[0] not in out:
            out[ids[0]] = {"line_start": i + 1, "line_end": min(k + 1, len(lines)), "text": "\n".join(lines[i:k + 1]).rstrip()}
        i = k + 1
    return out


def registry(block: str) -> list[str]:
    """preserved_exact_tokens as an inline flow list or a block list."""
    m = re.search(r"^\s*preserved_exact_tokens:\s*\[(.*?)\]\s*$", block, flags=re.S | re.M)
    if m:
        parts = re.split(r",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", m.group(1))
        return [p.strip().strip('"').strip("'") for p in parts if p.strip()]
    m = re.search(r"^\s*preserved_exact_tokens:\s*\n((?:\s+-\s.*\n?)+)", block, flags=re.M)
    if m:
        return [re.sub(r"^\s*-\s*", "", l).strip().strip('"').strip("'") for l in m.group(1).splitlines() if l.strip()]
    return []


def records_in(findings_md: str) -> list[dict]:
    out = []
    for sec in re.split(r"^##\s+", findings_md, flags=re.M)[1:]:
        head, _, body = sec.partition("\n")
        if not RECORD_HEAD.match(head.strip()):
            continue
        rep = REPAIRS.search(body)
        named_units = sorted(set(UNIT_ID.findall(rep.group(1)))) if rep else []
        named_docs = sorted(set(re.findall(r"\b([A-Z][A-Za-z]+_[A-Za-z0-9_]+)\b", rep.group(1)))) if rep else []
        out.append({"heading": head.strip(), "candidate_ids": sorted(set(CANDIDATE_ID.findall(head))),
                    "named_units": named_units, "named_documents": named_docs, "has_repairs_sentence": bool(rep)})
    return out


def git_show(root: Path, rev: str, path: str) -> str | None:
    try:
        r = subprocess.run(["git", "-C", str(root), "show", f"{rev}:{path}"], capture_output=True, text=True)
    except OSError:
        return None
    return r.stdout if r.returncode == 0 else None


def run(root: Path, ledger_dir: Path, base: str | None) -> dict:
    ledger_id = ledger_dir.name
    queue = json.loads((ledger_dir / "state" / "compile_queue.json").read_text(encoding="utf-8"))
    atoms = {a["atom_id"]: a for a in load_jsonl(ledger_dir / "records" / "design_atoms.jsonl")}
    corrections = load_jsonl(ledger_dir / "records" / "corrections.jsonl")
    findings_path = ledger_dir / "source_shards" / "findings.md"
    findings_md = findings_path.read_text(encoding="utf-8") if findings_path.exists() else ""
    docs = set(queue.get("canonical_plan_targets", [])) | set(queue.get("compiled_owner_docs", []))
    for it in queue.get("items", []):
        docs |= set(it.get("target_docs", []) or ([it["target_doc"]] if it.get("target_doc") else []))
    docs = sorted(d for d in docs if d.endswith(".md"))
    units: dict[str, dict] = {}
    unit_doc: dict[str, str] = {}
    for d in docs:
        p = root / d
        if not p.exists():
            continue
        for uid, blk in units_in(p.read_text(encoding="utf-8")).items():
            units.setdefault(uid, blk)
            unit_doc.setdefault(uid, d)
    base_units: dict[str, dict] = {}
    if base:
        for d in docs:
            t = git_show(root, base, d)
            if t is not None:
                for uid, blk in units_in(t).items():
                    base_units.setdefault(uid, blk)
    # candidate id -> atoms via corrections.jsonl
    cand_atoms: dict[str, set[str]] = {}
    for c in corrections:
        for tok in re.split(r"\s*\+\s*|,\s*", str(c.get("finding_id", ""))):
            tok = tok.strip()
            if tok:
                cand_atoms.setdefault(tok, set()).update(c.get("source_atom_ids", []))
    atom_targets: dict[str, set[str]] = {}
    for it in queue.get("items", []):
        for a in it.get("source_atom_ids", []):
            atom_targets.setdefault(a, set()).update(it.get("target_plan_unit_ids", []))
    # witness 1
    w1 = []
    for rec in records_in(findings_md):
        rec_atoms: set[str] = set()
        for cid in rec["candidate_ids"]:
            rec_atoms |= cand_atoms.get(cid, set())
        targets: set[str] = set()
        for a in rec_atoms:
            targets |= atom_targets.get(a, set())
        named_not_targeted = [u for u in rec["named_units"] if u not in targets]
        named_unchanged = []
        if base:
            for u in rec["named_units"]:
                if u in units and u in base_units and units[u]["text"] == base_units[u]["text"]:
                    named_unchanged.append(u)
        w1.append({"record": rec["heading"], "candidate_ids": rec["candidate_ids"], "atoms": sorted(rec_atoms),
                   "queue_targets": sorted(targets), "named_units": rec["named_units"], "named_documents": rec["named_documents"],
                   "named_but_not_targeted": named_not_targeted, "named_but_unchanged_since_base": named_unchanged,
                   "unmatched_record": not rec_atoms and bool(rec["candidate_ids"]), "fires": bool(named_not_targeted or named_unchanged)})
    # witness 2
    companion_text = ""
    for c in queue.get("compiled_plan_outputs", []):
        p = root / c
        if p.exists() and p.suffix == ".json":
            companion_text += p.read_text(encoding="utf-8", errors="replace")
    w2 = []
    for it in queue.get("items", []):
        owners = [u for u in it.get("target_plan_unit_ids", []) if not u.startswith("DL-") and u in units]
        if not owners:
            continue
        regs = {u: registry(units[u]["text"]) for u in owners}
        for a in it.get("source_atom_ids", []):
            for tok in atoms.get(a, {}).get("exact_tokens", []):
                in_prose = [u for u in owners if tok in units[u]["text"]]
                in_reg = [u for u in owners if tok in regs[u]]
                w2.append({"queue_id": it.get("queue_id"), "atom": a, "token": tok, "owner_units": owners,
                           "units_with_token_in_prose": in_prose, "units_with_token_in_registry": in_reg,
                           "in_companion_outputs_only": (not in_prose) and (tok in companion_text),
                           "fires": not (in_prose and in_reg)})
    # witness 3: registry entries must occur in the unit's own text
    w3 = []
    for it in queue.get("items", []):
        for uid in it.get("target_plan_unit_ids", []):
            if uid.startswith("DL-") or uid not in units or any(r["unit"] == uid for r in w3):
                continue
            body = re.sub(r"^\s*preserved_exact_tokens:.*$", "", units[uid]["text"], flags=re.M)
            reg = registry(units[uid]["text"])
            missing = [tok for tok in reg if tok not in body]
            base_missing = None
            if base and uid in base_units:
                bbody = re.sub(r"^\s*preserved_exact_tokens:.*$", "", base_units[uid]["text"], flags=re.M)
                base_missing = [tok for tok in registry(base_units[uid]["text"]) if tok not in bbody]
            w3.append({"unit": uid, "registry_entries": len(reg), "entries_absent_from_unit_text": missing,
                       "absent_already_at_base": (sorted(set(missing) & set(base_missing)) if base_missing is not None else None),
                       "fires": bool(missing)})
    fires1 = [r for r in w1 if r["fires"]]
    fires2 = [r for r in w2 if r["fires"]]
    fires3 = [r for r in w3 if r["fires"]]
    return {"schema_id": "pm.ledger_compile_witness.v1", "ledger_id": ledger_id, "base": base, "documents": docs,
            "witness_repairs_vs_targets": w1, "witness_exact_tokens": w2, "witness_registry_hygiene": w3,
            "summary": {"records": len(w1), "records_firing": len(fires1), "named_but_not_targeted": sum(len(r["named_but_not_targeted"]) for r in w1),
                        "named_but_unchanged_since_base": sum(len(r["named_but_unchanged_since_base"]) for r in w1),
                        "item_tokens": len(w2), "tokens_missing_from_prose": sum(1 for r in w2 if not r["units_with_token_in_prose"]),
                        "tokens_missing_from_registry": sum(1 for r in w2 if not r["units_with_token_in_registry"]),
                        "tokens_only_in_companion_outputs": sum(1 for r in w2 if r["in_companion_outputs_only"]),
                        "units_with_registry_entries_absent_from_text": len(fires3),
                        "registry_entries_absent_from_text": sum(len(r["entries_absent_from_unit_text"]) for r in w3),
                        "registry_entries_absent_already_at_base": sum(len(r["absent_already_at_base"] or []) for r in w3)},
            "status": "findings" if (fires1 or fires2 or fires3) else "pass"}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("ledger_dir", help="Plans/ledgers/v2/<ledger_id>")
    parser.add_argument("--root", default=str(Path(__file__).resolve().parents[1]), help="repository root (default: this checkout)")
    parser.add_argument("--base", default=None, help="git revision to compare edited units against (for example origin/main)")
    parser.add_argument("--json", action="store_true", help="print the full JSON report instead of the summary")
    args = parser.parse_args()
    root = Path(args.root).resolve()
    ledger_dir = Path(args.ledger_dir)
    if not ledger_dir.is_absolute():
        ledger_dir = root / ledger_dir
    if not (ledger_dir / "state" / "compile_queue.json").exists():
        print(f"error: no compile_queue.json under {ledger_dir}", file=sys.stderr)
        return 1
    report = run(root, ledger_dir, args.base)
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        s = report["summary"]
        print(f"{report['ledger_id']}: {report['status']}")
        print(f"  witness 1 repairs vs targets: {s['records_firing']} of {s['records']} records fire; named-but-not-targeted {s['named_but_not_targeted']}; named-but-unchanged {s['named_but_unchanged_since_base']}")
        for r in report["witness_repairs_vs_targets"]:
            if r["fires"]:
                print(f"    - {r['record'][:70]}: not targeted {r['named_but_not_targeted']} unchanged {r['named_but_unchanged_since_base']}")
        print(f"  witness 2 exact tokens: {s['item_tokens']} item tokens; missing from every owner unit's prose {s['tokens_missing_from_prose']} (of which only in companion outputs {s['tokens_only_in_companion_outputs']}); missing from every owner registry {s['tokens_missing_from_registry']}")
        per: dict[str, list[str]] = {}
        for r in report["witness_exact_tokens"]:
            if not r["units_with_token_in_prose"]:
                per.setdefault(",".join(r["owner_units"]), []).append(r["token"])
        for owners, toks in sorted(per.items()):
            print(f"    - {owners}: not in prose {toks}")
        print(f"  witness 3 registry hygiene: {s['units_with_registry_entries_absent_from_text']} units carry registry entries absent from their own text ({s['registry_entries_absent_from_text']} entries; {s['registry_entries_absent_already_at_base']} already absent at base)")
        for r in report["witness_registry_hygiene"]:
            if r["fires"]:
                print(f"    - {r['unit']}: {r['entries_absent_from_unit_text']}" + (f" (already at base: {r['absent_already_at_base']})" if r["absent_already_at_base"] else ""))
    return 0 if report["status"] == "pass" else 2


if __name__ == "__main__":
    sys.exit(main())
