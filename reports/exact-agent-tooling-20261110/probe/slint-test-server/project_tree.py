#!/usr/bin/env python3
"""Project a Slint MCP `get_element_tree` reply to one line per interactive control.

usage: project_tree.py <element-tree.json> [out.txt]

The reply is protobuf JSON, which omits fields at their default value. `accessibleEnabled` is a plain bool that the
server fills with `unwrap_or_default()`, so over this transport three cases look alike: enabled stated false, enabled
not stated, and (for non-controls) not applicable. For an element with an interactive role, a missing
`accessibleEnabled` is therefore printed as `disabled`. A control that never states its enabled state would be
printed as disabled too; the in-process API (`ElementHandle::accessible_enabled()`, an Option) keeps the cases apart.
"""
import json, sys

NOT_INTERACTIVE = {None, "Unknown", "Text", "Groupbox"}

def elements(path):
    reply = json.load(open(path))
    return json.loads(reply["result"]["content"][0]["text"])["elements"]

def line(e):
    ids = e.get("typeNamesAndIds") or [{}]
    ident = next((x.get("id") for x in ids if x.get("id")), "")
    out = f'{e.get("accessibleRole")} [{ident}] {json.dumps(e.get("accessibleLabel", ""))}'
    if e.get("accessibleValue"): out += " value=" + json.dumps(e["accessibleValue"])
    if not e.get("accessibleEnabled", False): out += " disabled"
    if e.get("accessibleChecked"): out += " checked"
    return out

def project(path):
    return "\n".join(line(e) for e in elements(path) if e.get("accessibleRole") not in NOT_INTERACTIVE)

if __name__ == "__main__":
    text = project(sys.argv[1])
    if len(sys.argv) > 2: open(sys.argv[2], "w", encoding="utf-8").write(text)
    raw = open(sys.argv[1], "rb").read()
    print(json.dumps({"tree_reply_bytes": len(raw), "elements": len(elements(sys.argv[1])), "listing_lines": text.count("\n") + 1, "listing_bytes_utf8": len(text.encode("utf-8"))}))
    if len(sys.argv) <= 2: print(text)
