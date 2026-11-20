#!/usr/bin/env python3
"""INT4 D2 (admission merge 2, pm-ea-lead decision A, 2026-11-15): reviewed wildcard roles for frozen copies.

For every inventory row classified wildcard_review_required, look for reviewed role records in
scripts/pm_event_datetime_roles.json whose own node has the same value schema as this row once two
things are normalized and nothing else: every $id value, and the base URI (the part before '#') of
every $ref / $dynamicRef value. The value schema is the set of schema values the wildcard probe
cites for the node (scripts/pm_event_datetime_value_probe.py wildcard_probe), which includes the
map node itself and every definition its value references reach.

A row with a match gets one record that mirrors the reviewed role (role, reason, classification),
names the reviewed record it mirrors, and cites its own node's corresponding definition exactly as
the probe yields it. A row without a match is reported and left unclassified (a stop for INT4).
Nothing is inferred from names; a row whose citation correspondence is ambiguous is also a stop.

usage: pm-int4-d2-wildcard-role-mirror.py [--root ROOT] --out REPORT.json [--write]
Exit 0 only when every wildcard_review_required row has exactly one mirrored record.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path


def normalize(value):
    """Replace $id values and $ref/$dynamicRef base URIs; keep every other byte of the schema."""
    if isinstance(value, dict):
        out = {}
        for key, child in value.items():
            if key == "$id" and isinstance(child, str):
                out[key] = "<id>"
            elif key in ("$ref", "$dynamicRef") and isinstance(child, str):
                out[key] = "<base>#" + child.partition("#")[2]
            else:
                out[key] = normalize(child)
        return out
    if isinstance(value, list):
        return [normalize(child) for child in value]
    return value


def canonical(value):
    return json.dumps(normalize(value), sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def fingerprint(citations):
    return hashlib.sha256(json.dumps(sorted(canonical(c["value"]) for c in citations)).encode()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--write", action="store_true", help="append the mirrored records to the roles file")
    args = parser.parse_args()
    root = args.root.resolve()
    sys.path.insert(0, str(root / "scripts"))
    import pm_event_datetime_inventory as inv
    from pm_event_datetime_value_probe import wildcard_probe

    roles_path = root / "scripts/pm_event_datetime_roles.json"
    roles_text = roles_path.read_text()
    roles = json.loads(roles_text)
    assert json.dumps(roles, indent=2) + "\n" == roles_text, "roles file is not in its canonical form"
    inventory = json.loads((root / inv.INVENTORY).read_text())
    rows = {inv.node_key(r): r for r in inventory["nodes"]}
    cache = {}

    def probe(row):
        document = inv._source_document(root, row, cache)
        evidence, citations = wildcard_probe(row, document, root, cache)
        return evidence, citations

    reviewed = []
    for record in roles:
        row = rows.get(tuple(record["node"]))
        if row is None:
            continue
        evidence, citations = probe(row)
        reviewed.append({"record": record, "row": row, "fingerprint": fingerprint(citations),
                         "citation_canonical": canonical(record["citation"]["value"])})
    existing = {tuple(r["node"]) for r in roles}
    targets = [r for r in inventory["nodes"] if r["classification"] == "wildcard_review_required"]
    report, added, stops = [], [], []
    for row in targets:
        key = inv.node_key(row)
        evidence, citations = probe(row)
        print_fp = fingerprint(citations)
        matches = sorted((m for m in reviewed if m["fingerprint"] == print_fp),
                         key=lambda m: tuple(m["record"]["node"]))
        entry = {"node": list(key), "value_schema_sha256": evidence["value_schema_sha256"],
                 "normalized_value_schema_sha256": print_fp,
                 "reviewed_matches": [m["record"]["node"] for m in matches]}
        if key in existing:
            entry["result"] = "already_reviewed"
        elif not matches:
            entry["result"] = "stop_no_identical_reviewed_record"
            stops.append(entry)
        elif len({(m["record"]["role"], m["record"]["reason"], m["record"].get("classification"))
                  for m in matches}) != 1:
            entry["result"] = "stop_reviewed_records_disagree"
            stops.append(entry)
        else:
            mirror = matches[0]
            source = mirror["record"]["citation"]
            mirror_node = mirror["record"]["node"][2]
            if source["pointer"].startswith(mirror_node):
                wanted = row["pointer"] + source["pointer"][len(mirror_node):]
                candidates = [c for c in citations if c["pointer"] == wanted]
            else:
                candidates = [c for c in citations if c["pointer"].endswith(source["pointer"])]
            candidates = [c for c in candidates if canonical(c["value"]) == mirror["citation_canonical"]]
            if len(candidates) != 1:
                entry["result"] = "stop_citation_correspondence_ambiguous"
                entry["candidates"] = [c["pointer"] for c in candidates]
                stops.append(entry)
            else:
                citation = candidates[0]
                record = {"node": list(key), "value_schema_sha256": evidence["value_schema_sha256"],
                          "role": mirror["record"]["role"],
                          "reason": (mirror["record"]["reason"] + " Mirrors the reviewed record for "
                                     + mirror["record"]["node"][0] + "#" + mirror_node
                                     + ": this frozen copy's value schema equals that record's once $id values and"
                                     " $ref base URIs are normalized, and nothing else"
                                     " (scripts/pm-int4-d2-wildcard-role-mirror.py; INT4 D2, pm-ea-lead decision"
                                     " 2026-11-15).")}
                if "classification" in mirror["record"]:
                    record["classification"] = mirror["record"]["classification"]
                record["citation"] = citation
                added.append(record)
                entry.update(result="mirrored", mirrors=mirror["record"]["node"], citation_pointer=citation["pointer"],
                             role=record["role"])
        report.append(entry)
    summary = {"targets": len(targets), "mirrored": len(added), "stops": len(stops),
               "by_role": {}, "normalization": "$id values and $ref/$dynamicRef base URIs only"}
    for record in added:
        summary["by_role"][record["role"]] = summary["by_role"].get(record["role"], 0) + 1
    args.out.write_text(json.dumps({"summary": summary, "nodes": report}, indent=1) + "\n")
    if args.write and not stops:
        roles_path.write_text(json.dumps(roles + added, indent=2) + "\n")
    print(json.dumps(summary, indent=1))
    return 0 if not stops and len(added) + sum(e["result"] == "already_reviewed" for e in report) == len(targets) else 1


if __name__ == "__main__":
    raise SystemExit(main())
