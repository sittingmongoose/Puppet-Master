"""Reproduce the 17 reviewed NUMRULE-SUPP index classification repairs.

Authorized by pm-ea-lead, pm-mail 1116031233-3be1 and 1116031607-5961
(2026-11-16). Only the prebound rows and their derived exclusion checksum
may change; every other input byte is preserved.
Run with --write to apply, or without it to verify the repaired inventory.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import re

import pm_event_datetime_inventory as inv

ROOT = Path(__file__).resolve().parents[1]
TARGETS = [{'node': ['Plans/goal_run_replan_contracts/source-v8/inputs/replan-v3/replan-source.schema.json',
           'json',
           '/$defs/WholeOriginalIndexRow'],
  'node_sha256': 'c439d8ef2663d3593f7a8857532e8e6840df81d2be1ba9310ef5a5a4ccf8ba25'},
 {'node': ['Plans/goal_run_replan_contracts/source-v8/schemas/replan-consumer.v4.schema.json',
           'json',
           '/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_replan_contracts/source-v8/schemas/replan-source.v4.schema.json',
           'json',
           '/$defs/WholeOriginalIndexRow'],
  'node_sha256': 'c439d8ef2663d3593f7a8857532e8e6840df81d2be1ba9310ef5a5a4ccf8ba25'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/started_current_workflow_native_activation/resources/72/schema/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/started_current_goal_controls/resources/17/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/started_current_goal_controls/resources/37/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/cancelled_native_consumer/resources/121/schema/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/cancelled_native_consumer/resources/123/schema/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/cancelled_native_consumer/resources/124/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/cancelled_goal_consumer/resources/17/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/cancelled_goal_consumer/resources/34/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/companions/resources/0/schema/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/consumer-resource-bank.json',
           'json',
           '/companions/resources/1/schema/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/resource-bank.json',
           'json',
           '/goal/resources/17/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/resource-bank.json',
           'json',
           '/goal/resources/34/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/resource-bank.json',
           'json',
           '/event/resources/72/schema/$defs/GenericIndexRow'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'},
 {'node': ['Plans/goal_run_stop_block_contracts/resource-bank.json',
           'json',
           '/event/resources/76/schema/$defs/existing_event_record_index'],
  'node_sha256': '3bbf2867e5011b64dc3bc0960e11db3f39def0d82e3b398197668e2f154825f8'}]


def repair(root, *, write=False):
    path = root / inv.INVENTORY
    raw = path.read_bytes()
    text = raw.decode("utf-8")
    original = json.loads(text)
    expected = copy.deepcopy(original)
    targets = {tuple(item["node"]): item["node_sha256"] for item in TARGETS}
    if len(targets) != 17:
        raise ValueError("repair must bind exactly 17 distinct reviewed nodes")
    decoder = json.JSONDecoder()
    start = re.search(r'"nodes"\s*:\s*\[', text).end()
    edits, records, documents = [], [], {}
    for index, row in enumerate(original["nodes"]):
        start += len(text[start:]) - len(text[start:].lstrip())
        decoded, end = decoder.raw_decode(text, start)
        if decoded != row:
            raise ValueError("inventory node span mismatch")
        key = inv.node_key(row)
        if key in targets:
            document = inv._source_document(root, row, documents)
            node = inv.at(document, row["pointer"])
            props = node.get("properties", {})
            if (inv.digest(node) != targets[key] or row["node_sha256"] != targets[key] or
                    props.get("schema_id", {}).get("const") != "pm.storage_value.event_record_index.v2" or
                    node.get("type") != "object" or node.get("additionalProperties") is not False or
                    "occurred_at_utc" in props or "occurred_at_utc" in node.get("required", []) or
                    row["profile"] != "storage_utc_z" or
                    row["classification"] not in ("EventRecord", "event_record_index")):
                raise ValueError("reviewed closed index source changed: " + repr(key))
            expected["nodes"][index]["classification"] = "event_record_index"
            before = text[start:end]
            after, count = re.subn(r'(?m)^      "classification": "EventRecord",$',
                                   '      "classification": "event_record_index",', before)
            if count != int(row["classification"] == "EventRecord"):
                raise ValueError("classification byte span mismatch")
            if count:
                edits.append((start, end, after))
            records.append({"node": list(key), "node_sha256": targets[key],
                            "before": row["classification"], "after": "event_record_index",
                            "reason": "Closed owner object identifies pm.storage_value.event_record_index.v2; "
                                      "it declares no occurred_at_utc. CV-253 Storage fields remain unchanged."})
        start = end + len(text[end:]) - len(text[end:].lstrip())
        if text[start:start + 1] == ",":
            start += 1
    if len(records) != len(targets) or {tuple(r["node"]) for r in records} != set(targets):
        raise ValueError("reviewed index node missing or duplicated")
    result = text
    for start, end, replacement in reversed(edits):
        result = result[:start] + replacement + result[end:]
    if json.loads(result) != expected:
        raise ValueError("repair changed an unrelated inventory field")
    exclusions_path = root / inv.EXCLUSIONS
    exclusions_raw = exclusions_path.read_bytes()
    exclusions = json.loads(exclusions_raw)
    matches = [r for r in exclusions if r["path"] == inv.INVENTORY]
    if len(matches) != 1 or matches[0]["origin"] != "json":
        raise ValueError("exactly one inventory exclusion required")
    old_pin = matches[0]["sha256"]
    new_pin = inv.derived_inventory_pin(expected, root)
    if exclusions_raw.count(old_pin.encode("ascii")) != 1:
        raise ValueError("inventory exclusion checksum byte span is not unique")
    exclusions_result = exclusions_raw.replace(old_pin.encode("ascii"), new_pin.encode("ascii"))
    matches[0]["sha256"] = new_pin
    if json.loads(exclusions_result) != exclusions:
        raise ValueError("repair changed an unrelated exclusion field")
    if (edits or old_pin != new_pin) and not write:
        raise ValueError("reviewed index classifications require --write")
    if write:
        path.write_bytes(result.encode("utf-8"))
        exclusions_path.write_bytes(exclusions_result)
    return {"status": "pass", "changed": len(edits), "reviewed_nodes": len(records),
            "only_classification_bytes_changed": True,
            "before_sha256": hashlib.sha256(raw).hexdigest(),
            "after_sha256": hashlib.sha256(result.encode("utf-8")).hexdigest(),
            "inventory_exclusion": {"before": old_pin, "after": new_pin,
                                    "only_sha256_bytes_changed": True}, "nodes": records}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    print(json.dumps(repair(args.root, write=args.write), indent=2))


if __name__ == "__main__":
    main()
