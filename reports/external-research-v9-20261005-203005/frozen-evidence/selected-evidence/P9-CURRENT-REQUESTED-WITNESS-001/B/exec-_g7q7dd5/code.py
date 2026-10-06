import hashlib, json

def h(s): return hashlib.sha256(s.encode()).hexdigest()[:16]

# Notebook cells (stable cell ids -> source), in displayed order
cells = {
  "c1_load":  "df = read('sales.csv')",
  "c2_clean": "df = df.dropna()",
  "c3_total": "print(df.total.sum())",
}
env_hash  = "env-stable-v1"
data_hash = "sha256:0001"          # sales.csv version at run time

# Execution event recorded when the run happened
event = {
  "event_id": "e1", "kernel_epoch": 1,
  "env_hash": env_hash,
  "data": {"sales.csv": data_hash},
  "cells": {cid: {"source_hash": h(src), "status": "ok"} for cid, src in cells.items()},
}

# Later state: analyst edited the load cell; dataset and env unchanged
now_cells = dict(cells)
now_cells["c1_load"] = "df = read('sales_v2.csv')"
current = {"kernel_epoch": 1, "env_hash": env_hash, "data": {"sales.csv": data_hash}}
order = list(cells)

def status_for(cid):
    rec = event["cells"][cid]
    if rec["status"] != "ok":
        return "failed"
    if event["kernel_epoch"] != current["kernel_epoch"]:
        return "unverified"                      # kernel restarted: labels must not stay 'current'
    if event["env_hash"] != current["env_hash"]:
        return "unverified"
    if any(event["data"][k] != current["data"].get(k) for k in event["data"]):
        return "stale"                           # source dataset changed
    if rec["source_hash"] != h(now_cells[cid]):
        return "stale"                           # this cell was edited
    i = order.index(cid)
    if any(h(now_cells[u]) != event["cells"][u]["source_hash"] for u in order[:i]):
        return "stale"                           # an upstream cell was edited
    return "current"

out1 = {cid: status_for(cid) for cid in order}
print("case1 edited-upstream-cell:", json.dumps(out1))

# Case 2: kernel restart bumps the epoch; nothing else changes
current = {"kernel_epoch": 2, "env_hash": env_hash, "data": {"sales.csv": data_hash}}
out2 = {cid: status_for(cid) for cid in order}
print("case2 kernel-restart:      ", json.dumps(out2))

assert out1 == {"c1_load": "stale", "c2_clean": "stale", "c3_total": "stale"}
assert all(v == "unverified" for v in out2.values())
print("W1 PASS: edited upstream cell marks the whole downstream chain stale; a kernel restart downgrades outputs to 'unverified', never silently 'current'")
