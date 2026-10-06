import copy, json
base = {"R1": {"val": 1, "live": True}, "R2": {"val": 2, "live": True}}
ops_A = [("update", "R1", {"val": 10}, 5), ("insert", "R3", {"val": 3, "src": "X1"}, 4)]
ops_B = [("update", "R1", {"val": 20}, 7), ("delete", "R2", None, 6), ("insert", "R4", {"val": 4, "src": "X1"}, 8)]
# last-writer-wins by op timestamp, per record
lww = copy.deepcopy(base)
for kind, r, payload, ts in ops_A + ops_B:
    if kind == "update":
        if ts >= lww[r].get("ts", 0): lww[r] = {"val": payload["val"], "live": True, "ts": ts}
    elif kind == "delete":
        if ts >= lww[r].get("ts", 0): lww[r] = {"live": False, "ts": ts}
    elif kind == "insert":
        lww[r] = {"val": payload["val"], "src": payload["src"], "live": True, "ts": ts}
print("LWW result:", json.dumps(lww, sort_keys=True))
lost = "A's edit of R1 (val=10) overwritten by B's val=20" 
lost2 = "R2 deleted with no record of A-side expectation; A's insert R3 and B's insert R4 share src=X1 unflagged"
print("LWW silent losses:", lost, ";", lost2)
conflicts = [
  {"record": "R1", "class": "both-edited-since-common-ancestor", "base": 1, "A": 10, "B": 20, "resolution": "user field-level choice"},
  {"record": "R2", "class": "edit-vs-delete", "A": "kept", "B": "deleted", "resolution": "user picks keep or delete"},
  {"record": "src=X1", "class": "duplicate-source-id", "A": "R3", "B": "R4", "resolution": "link / keep both / remap"},
]
print("explicit three-way conflict set:", json.dumps(conflicts, indent=1))
print("scope: toy in-memory dict semantics; illustrates classes, not the real merge engine")
